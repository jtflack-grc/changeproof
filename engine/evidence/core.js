'use strict';

const fs = require('fs');
const path = require('path');

const { Finding, EVIDENCE_BASIS, STATUS, VALIDATION_TARGET, ARTIFACT_TYPE } = require('./model');
const rpgleAnalyzer = require('../analyzers/rpgle');
const clleAnalyzer = require('../analyzers/clle');
const ddsAnalyzer = require('../analyzers/dds');
const sqlAnalyzer = require('../analyzers/sql');
const nodeAnalyzer = require('../analyzers/node');
const docsAnalyzer = require('../analyzers/docs');
const configAnalyzer = require('../analyzers/config');

const SINGLE_CHAR_CODES = new Set(['P', 'E', 'S']);
const CONFIG_EXTENSIONS = new Set(['.conf', '.ini', '.env', '.yaml', '.yml', '.json', '.properties']);

function normalizeArtifactPath(value) {
  return String(value || '').replace(/\\/g, '/');
}

function slugify(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 56);
}

function keywordMatches(keyword, text) {
  if (!text) return false;
  const raw = String(keyword);
  const kw = raw.toLowerCase();

  if (SINGLE_CHAR_CODES.has(raw.toUpperCase())) {
    const pattern = new RegExp(
      "(?:=\\s*['\"]" + kw + "['\"]|['\"]" + kw + "['\"]\\s*=|\\(\\s*['\"]" + kw + "['\"]\\s*\\))",
      'i'
    );
    return pattern.test(text);
  }

  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const wbPattern = new RegExp('(?<![a-z0-9_])' + escaped + '(?![a-z0-9_])', 'i');
  return wbPattern.test(String(text).toLowerCase());
}

function scoreSymbol(symbol, keywords) {
  const haystack = [symbol.name, symbol.value, symbol.rawLine, symbol.headingContext].join(' ');
  const matched = keywords.filter(keyword => keywordMatches(keyword, haystack));
  return { score: matched.length, matched };
}

function parseKeywords(crPath) {
  const content = fs.readFileSync(crPath, 'utf8');
  const match = content.match(/^Keywords:\s*(.+)$/m);
  if (!match) return [];
  return match[1].split(',').map(value => value.trim()).filter(Boolean);
}

function artifactTypeFor(filePath) {
  const lower = normalizeArtifactPath(filePath).toLowerCase();
  const ext = path.extname(lower);
  if (lower.endsWith('.rpgle')) return ARTIFACT_TYPE.RPGLE;
  if (lower.endsWith('.clle')) return ARTIFACT_TYPE.CLLE;
  if (lower.endsWith('.dds')) return ARTIFACT_TYPE.DDS;
  if (lower.includes('/db2/') && lower.endsWith('.sql')) return ARTIFACT_TYPE.DB2SQL;
  if (lower.endsWith('.sql')) return ARTIFACT_TYPE.NODEJS;
  if (lower.endsWith('.js') || lower.endsWith('.cjs') || lower.endsWith('.mjs')) return ARTIFACT_TYPE.NODEJS;
  if (lower.endsWith('.md') || lower.endsWith('.txt')) return ARTIFACT_TYPE.DOC;
  if (CONFIG_EXTENSIONS.has(ext)) return ARTIFACT_TYPE.CONFIG;
  return ARTIFACT_TYPE.CONFIG;
}

function defaultValidationTarget(artifactType) {
  return [ARTIFACT_TYPE.RPGLE, ARTIFACT_TYPE.CLLE, ARTIFACT_TYPE.DB2SQL].includes(artifactType)
    ? VALIDATION_TARGET.IBM_I
    : VALIDATION_TARGET.LOCAL;
}

function analyzerFor(filePath) {
  const lower = normalizeArtifactPath(filePath).toLowerCase();
  const ext = path.extname(lower);
  if (lower.endsWith('.rpgle')) return rpgleAnalyzer;
  if (lower.endsWith('.clle')) return clleAnalyzer;
  if (lower.endsWith('.dds')) return ddsAnalyzer;
  if (lower.endsWith('.sql')) return sqlAnalyzer;
  if (lower.endsWith('.js') || lower.endsWith('.cjs') || lower.endsWith('.mjs')) return nodeAnalyzer;
  if (lower.endsWith('.md') || lower.endsWith('.txt')) return docsAnalyzer;
  if (CONFIG_EXTENSIONS.has(ext)) return configAnalyzer;
  return null;
}

function deduplicateByLine(findings) {
  const lineMap = new Map();
  for (const finding of findings) {
    const lineKey = `${finding.artifact}::${finding.lineRef || ''}`;
    const existing = lineMap.get(lineKey);
    if (!existing || finding.relevanceScore > existing.relevanceScore) lineMap.set(lineKey, finding);
  }
  return Array.from(lineMap.values());
}

function normalizeTestPath(testPath, repoRoot) {
  const normalized = normalizeArtifactPath(testPath);
  const root = normalizeArtifactPath(repoRoot).replace(/\/$/, '');
  if (normalized.startsWith(`${root}/`)) return normalized.slice(root.length + 1);
  const split = normalized.split('/changeproof/');
  return split.length > 1 ? split.pop() : normalized;
}

function parseJestResults(jsonPath, keywords, options = {}) {
  if (!jsonPath || !fs.existsSync(jsonPath)) return [];
  let raw;
  try { raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); } catch (_) { return []; }

  const repoRoot = options.repoRoot || process.cwd();
  const pendingTarget = options.pendingValidationTarget || VALIDATION_TARGET.LOCAL;
  const findings = [];

  (raw.testResults || []).forEach(suite => {
    const rel = normalizeTestPath(suite.name || suite.testFilePath || '', repoRoot);
    const tests = suite.assertionResults || suite.testResults || [];

    tests.forEach((test, idx) => {
      const isPending = test.status === 'pending';
      const isFailed = test.status === 'failed';
      const symbol = test.fullName || test.title || `test-${idx}`;
      const { score, matched } = scoreSymbol(
        { name: symbol, value: (test.failureMessages || []).join(' '), rawLine: symbol },
        keywords
      );

      let finding;
      let status;
      let validationTarget;
      if (isPending) {
        finding = `SKIPPED (${pendingTarget} boundary): ${symbol}`;
        status = STATUS.TARGET_VALIDATION_REQUIRED;
        validationTarget = pendingTarget;
      } else if (isFailed) {
        finding = `FAILING test — expected behaviour not yet implemented: ${symbol}`;
        status = STATUS.OPEN;
        validationTarget = VALIDATION_TARGET.LOCAL;
      } else {
        finding = `PASSING test: ${symbol}`;
        status = STATUS.RESOLVED;
        validationTarget = VALIDATION_TARGET.LOCAL;
      }

      findings.push(new Finding({
        id: `test-${slugify(rel)}-${slugify(symbol)}-${idx}`,
        artifact: rel,
        artifactType: ARTIFACT_TYPE.TEST,
        evidenceBasis: EVIDENCE_BASIS.EXECUTED_LOCAL,
        status,
        validationTarget,
        symbol,
        finding,
        lineRef: `${rel}:${(test.location && test.location.line) || '?'}`,
        keywords: matched,
        relevanceScore: score
      }));
    });
  });

  return findings;
}

function sourceStatus(pass, validationTarget) {
  if (pass === 'post-change' || pass === 'remediated') {
    return validationTarget === VALIDATION_TARGET.IBM_I
      ? STATUS.TARGET_VALIDATION_REQUIRED
      : STATUS.RESOLVED;
  }
  return STATUS.OPEN;
}

/**
 * Profile-driven evidence collection. Profiles supply only discovery scope,
 * optional target resolution, and optional inference rules. The evidence
 * semantics and analyzer/test ingestion remain common.
 */
async function collectCore({
  crPath,
  repoRoot,
  patterns,
  testResultsPath = null,
  pass = 'baseline',
  inferenceRules = [],
  validationTargetResolver = null,
  pendingValidationTarget = VALIDATION_TARGET.LOCAL
}) {
  if (!Array.isArray(patterns) || patterns.length === 0) {
    throw new Error('collectCore requires at least one source pattern');
  }

  const keywords = parseKeywords(crPath);
  const rawFindings = [];
  const allSymbols = [];
  const seenFiles = new Set();

  for (const pattern of patterns) {
    const files = fs.globSync(pattern, { cwd: repoRoot });
    for (const relFileRaw of files) {
      const relFile = normalizeArtifactPath(relFileRaw);
      if (seenFiles.has(relFile)) continue;
      seenFiles.add(relFile);

      const analyzer = analyzerFor(relFile);
      if (!analyzer) continue;

      const absPath = path.join(repoRoot, relFile);
      const symbols = analyzer.analyze(absPath);
      const artifactType = artifactTypeFor(relFile);
      const validationTarget = validationTargetResolver
        ? validationTargetResolver({ artifact: relFile, artifactType, defaultTarget: defaultValidationTarget(artifactType) })
        : defaultValidationTarget(artifactType);

      symbols.forEach(symbol => {
        const lineNumber = String(symbol.lineRef || '').match(/:(\d+)$/);
        const normalized = {
          ...symbol,
          lineRef: lineNumber ? `${relFile}:${lineNumber[1]}` : relFile,
          _artType: artifactType,
          _relFile: relFile,
          _validationTarget: validationTarget
        };
        allSymbols.push(normalized);
      });

      symbols.forEach((symbol, idx) => {
        const { score, matched } = scoreSymbol(symbol, keywords);
        if (score === 0) return;
        const lineNumber = String(symbol.lineRef || '').match(/:(\d+)$/);
        const lineRef = lineNumber ? `${relFile}:${lineNumber[1]}` : relFile;

        rawFindings.push(new Finding({
          id: `${slugify(artifactType)}-${slugify(relFile)}-${slugify(symbol.name)}-${idx}`,
          artifact: relFile,
          artifactType,
          evidenceBasis: EVIDENCE_BASIS.OBSERVED_SOURCE,
          status: sourceStatus(pass, validationTarget),
          validationTarget,
          symbol: symbol.name,
          finding: `${(symbol.type || '').replace(/_/g, ' ')} '${symbol.name}'${symbol.value ? ` = ${symbol.value}` : ''} — keywords: ${matched.join(', ')}`,
          lineRef,
          keywords: matched,
          relevanceScore: score
        }));
      });
    }
  }

  const findings = deduplicateByLine(rawFindings);
  const context = {
    allSymbols,
    keywords,
    findings,
    pass,
    repoRoot,
    crPath,
    model: { Finding, EVIDENCE_BASIS, STATUS, VALIDATION_TARGET, ARTIFACT_TYPE },
    helpers: { keywordMatches, scoreSymbol, slugify, normalizeArtifactPath }
  };

  for (const rule of inferenceRules) {
    const produced = await rule(context);
    if (!produced) continue;
    if (Array.isArray(produced)) findings.push(...produced.filter(Boolean));
    else findings.push(produced);
  }

  findings.push(...parseJestResults(testResultsPath, keywords, { repoRoot, pendingValidationTarget }));
  return { findings, symbols: allSymbols, keywords };
}

module.exports = {
  collectCore,
  parseKeywords,
  parseJestResults,
  keywordMatches,
  scoreSymbol,
  artifactTypeFor,
  analyzerFor,
  defaultValidationTarget,
  normalizeArtifactPath,
  slugify
};
