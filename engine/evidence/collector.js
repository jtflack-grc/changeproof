'use strict';

const fs   = require('fs');
const path = require('path');

const { Finding, EVIDENCE_BASIS, STATUS, VALIDATION_TARGET, ARTIFACT_TYPE } = require('./model');

const rpgleAnalyzer = require('../analyzers/rpgle');
const clleAnalyzer  = require('../analyzers/clle');
const ddsAnalyzer   = require('../analyzers/dds');
const sqlAnalyzer   = require('../analyzers/sql');
const nodeAnalyzer  = require('../analyzers/node');
const docsAnalyzer  = require('../analyzers/docs');

const SINGLE_CHAR_CODES = new Set(['P', 'E', 'S']);

function keywordMatches(keyword, text) {
  if (!text) return false;
  const kw = keyword.toLowerCase();

  if (SINGLE_CHAR_CODES.has(keyword)) {
    const pattern = new RegExp(
      "(?:=\\s*['\"]" + kw + "['\"]|['\"]" + kw + "['\"]\\s*=|\\(\\s*['\"]" + kw + "['\"]\\s*\\))",
      'i'
    );
    return pattern.test(text);
  }

  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const wbPattern = new RegExp('(?<![a-z0-9_])' + escaped + '(?![a-z0-9_])', 'i');
  return wbPattern.test(text);
}

function scoreSymbol(sym, keywords) {
  const haystack = [sym.name, sym.value, sym.rawLine].join(' ');
  const matched  = keywords.filter(kw => keywordMatches(kw, haystack));
  return { score: matched.length, matched };
}

function artifactTypeFor(filePath) {
  const lower = filePath.replace(/\\/g, '/').toLowerCase();
  if (lower.endsWith('.rpgle'))                             return ARTIFACT_TYPE.RPGLE;
  if (lower.endsWith('.clle'))                              return ARTIFACT_TYPE.CLLE;
  if (lower.endsWith('.dds'))                               return ARTIFACT_TYPE.DDS;
  if (lower.includes('/db2/') && lower.endsWith('.sql'))    return ARTIFACT_TYPE.DB2SQL;
  if (lower.endsWith('.sql'))                               return ARTIFACT_TYPE.NODEJS;
  if (lower.endsWith('.js'))                                return ARTIFACT_TYPE.NODEJS;
  if (lower.endsWith('.md'))                                return ARTIFACT_TYPE.DOC;
  return ARTIFACT_TYPE.NODEJS;
}

function validationTargetFor(artifactType) {
  return [ARTIFACT_TYPE.RPGLE, ARTIFACT_TYPE.CLLE, ARTIFACT_TYPE.DB2SQL].includes(artifactType)
    ? VALIDATION_TARGET.IBM_I
    : VALIDATION_TARGET.LOCAL;
}

function analyzerFor(filePath) {
  const lower = filePath.replace(/\\/g, '/').toLowerCase();
  if (lower.endsWith('.rpgle')) return rpgleAnalyzer;
  if (lower.endsWith('.clle'))  return clleAnalyzer;
  if (lower.endsWith('.dds'))   return ddsAnalyzer;
  if (lower.endsWith('.sql'))   return sqlAnalyzer;
  if (lower.endsWith('.js'))    return nodeAnalyzer;
  if (lower.endsWith('.md'))    return docsAnalyzer;
  return null;
}

function slugify(str) {
  return (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
}

function normalizeArtifactPath(filePath) {
  return String(filePath || '').replace(/\\/g, '/');
}

function parseKeywords(crPath) {
  const content = fs.readFileSync(crPath, 'utf8');
  const match   = content.match(/^Keywords:\s*(.+)$/m);
  if (!match) return [];
  return match[1].split(',').map(k => k.trim()).filter(Boolean);
}

function deduplicateByLine(findings) {
  const lineMap = new Map();
  for (const f of findings) {
    const lineKey = `${f.artifact}::${f.lineRef || ''}`;
    const existing = lineMap.get(lineKey);
    if (!existing || f.relevanceScore > existing.relevanceScore) {
      lineMap.set(lineKey, f);
    }
  }
  return Array.from(lineMap.values());
}

function parseJestResults(jsonPath, keywords) {
  if (!fs.existsSync(jsonPath)) return [];
  let raw;
  try { raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); } catch (_) { return []; }
  const findings = [];

  (raw.testResults || []).forEach(suite => {
    const rel = normalizeArtifactPath(
      (suite.name || suite.testFilePath || '').replace(/\\/g, '/').split('/changeproof/').pop() || suite.testFilePath
    );
    const tests = suite.assertionResults || suite.testResults || [];
    tests.forEach((t, idx) => {
      const isPending = t.status === 'pending';
      const isFailed  = t.status === 'failed';
      const symbol    = t.fullName || t.title || `test-${idx}`;

      const { score, matched } = scoreSymbol(
        { name: symbol, value: (t.failureMessages || []).join(' '), rawLine: symbol },
        keywords
      );

      let finding, status, valTarget;
      if (isPending) {
        finding   = `SKIPPED (IBM_I boundary): ${symbol}`;
        status    = STATUS.TARGET_VALIDATION_REQUIRED;
        valTarget = VALIDATION_TARGET.IBM_I;
      } else if (isFailed) {
        finding   = `FAILING test — expected behaviour not yet implemented: ${symbol}`;
        status    = STATUS.OPEN;
        valTarget = VALIDATION_TARGET.LOCAL;
      } else {
        finding   = `PASSING test: ${symbol}`;
        status    = STATUS.RESOLVED;
        valTarget = VALIDATION_TARGET.LOCAL;
      }

      findings.push(new Finding({
        id              : `test-${slugify(rel)}-${slugify(symbol)}-${idx}`,
        artifact        : rel,
        artifactType    : ARTIFACT_TYPE.TEST,
        evidenceBasis   : EVIDENCE_BASIS.EXECUTED_LOCAL,
        status,
        validationTarget: valTarget,
        symbol,
        finding,
        lineRef         : `${rel}:${(t.location && t.location.line) || '?'}`,
        keywords        : matched,
        relevanceScore  : score
      }));
    });
  });

  return findings;
}

function inferBatchWindowCollision(allSymbols, keywords) {
  const scdtime = allSymbols.find(
    s => s._artType === ARTIFACT_TYPE.CLLE && s.type === 'cmd_param' && s.name === 'SCDTIME'
  );
  if (!scdtime) return null;

  const hasNewCutoff = keywords.some(k => ['1800', '18', '180000'].includes(k));
  if (!hasNewCutoff) return null;

  const sctVal = (scdtime.value || '').replace(/\s/g, '');
  if (sctVal === '180000') {
    return new Finding({
      id              : 'inferred-fulmnt-batch-window-collision',
      artifact        : scdtime._relFile,
      artifactType    : ARTIFACT_TYPE.CLLE,
      evidenceBasis   : EVIDENCE_BASIS.INFERRED,
      status          : STATUS.OPEN,
      validationTarget: VALIDATION_TARGET.IBM_I,
      symbol          : `SCDTIME(${sctVal})`,
      finding         : `Batch job FULMNT is scheduled at ${sctVal} (18:00:00), which equals the new Preferred customer expedited cutoff introduced by CHG-0042. Orders submitted at or near 18:00 may not be captured before the batch run executes. Remediation: move SCDTIME to 181500 (18:15).`,
      lineRef         : scdtime.lineRef,
      keywords        : ['SCDTIME', '1800', 'schedule', 'batch', 'cutoff', 'expedited'],
      relevanceScore  : 6
    });
  }
  return null;
}

async function collect({ crPath, repoRoot, testResultsPath, adapter, pass }) {
  const keywords = parseKeywords(crPath);
  const rawFindings = [];
  const { globSync } = require('fs');

  const patterns = [
    'orderpro/rpgle/**/*.rpgle',
    'orderpro/clle/**/*.clle',
    'orderpro/dds/**/*.dds',
    'orderpro/sql/db2/**/*.sql',
    'orderpro/docs/**/*.md',
    'api/src/**/*.js'
  ];

  const allSymbols = [];

  for (const pattern of patterns) {
    const files = globSync(pattern, { cwd: repoRoot });
    for (const relFileRaw of files) {
      const relFile = normalizeArtifactPath(relFileRaw);
      const absPath  = path.join(repoRoot, relFile);
      const analyzer = analyzerFor(relFile);
      if (!analyzer) continue;

      const symbols  = analyzer.analyze(absPath);
      const artType  = artifactTypeFor(relFile);
      const valTarget = validationTargetFor(artType);

      symbols.forEach(sym => {
        const lineNumber = String(sym.lineRef || '').match(/:(\d+)$/);
        sym.lineRef = lineNumber ? `${relFile}:${lineNumber[1]}` : relFile;
        allSymbols.push({ ...sym, _artType: artType, _relFile: relFile });
      });

      symbols.forEach((sym, idx) => {
        const { score, matched } = scoreSymbol(sym, keywords);
        if (score === 0) return;

        const findingStatus = pass === 'post-change'
          ? (valTarget === VALIDATION_TARGET.IBM_I
            ? STATUS.TARGET_VALIDATION_REQUIRED
            : STATUS.RESOLVED)
          : STATUS.OPEN;

        rawFindings.push(new Finding({
          id              : `${slugify(artType)}-${slugify(relFile)}-${slugify(sym.name)}-${idx}`,
          artifact        : relFile,
          artifactType    : artType,
          evidenceBasis   : EVIDENCE_BASIS.OBSERVED_SOURCE,
          status          : findingStatus,
          validationTarget: valTarget,
          symbol          : sym.name,
          finding         : `${(sym.type || '').replace(/_/g, ' ')} '${sym.name}'${sym.value ? ` = ${sym.value}` : ''} — keywords: ${matched.join(', ')}`,
          lineRef         : sym.lineRef,
          keywords        : matched,
          relevanceScore  : score
        }));
      });
    }
  }

  const findings = deduplicateByLine(rawFindings);
  const collision = inferBatchWindowCollision(allSymbols, keywords);
  if (collision) findings.push(collision);

  if (adapter) {
    try {
      const rows = await adapter.querySql(
        "SELECT CUSCLS, COUNT(*) as CNT FROM CUSMAS GROUP BY CUSCLS"
      );
      rows.forEach(row => {
        findings.push(new Finding({
          id              : `data-cusmas-cuscls-${row.CUSCLS}`,
          artifact        : 'orderpro/sql/sqlite/orderpro.db',
          artifactType    : ARTIFACT_TYPE.NODEJS,
          evidenceBasis   : EVIDENCE_BASIS.EXECUTED_LOCAL,
          status          : pass === 'post-change' ? STATUS.RESOLVED : STATUS.OPEN,
          validationTarget: VALIDATION_TARGET.LOCAL,
          symbol          : `CUSCLS=${row.CUSCLS}`,
          finding         : `Customer class '${row.CUSCLS}' has ${row.CNT} customer(s) in the local SQLite surrogate.`,
          lineRef         : null,
          keywords        : keywords.filter(k => keywordMatches(k, `CUSCLS='${row.CUSCLS}'`)),
          relevanceScore  : 2
        }));
      });
    } catch (_) { /* adapter not required for static-only runs */ }
  }

  if (testResultsPath) {
    findings.push(...parseJestResults(testResultsPath, keywords));
  }

  return findings;
}

module.exports = { collect, parseKeywords };
