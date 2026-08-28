'use strict';

const { collectCore, parseKeywords, keywordMatches } = require('./core');
const { Finding, EVIDENCE_BASIS, STATUS, VALIDATION_TARGET, ARTIFACT_TYPE } = require('./model');

const ORDERPRO_PATTERNS = [
  'orderpro/rpgle/**/*.rpgle',
  'orderpro/clle/**/*.clle',
  'orderpro/dds/**/*.dds',
  'orderpro/sql/db2/**/*.sql',
  'orderpro/docs/**/*.md',
  'api/src/**/*.js'
];

function inferBatchWindowCollision({ allSymbols, keywords }) {
  const scdtime = allSymbols.find(
    symbol => symbol._artType === ARTIFACT_TYPE.CLLE &&
      symbol.type === 'cmd_param' && symbol.name === 'SCDTIME'
  );
  if (!scdtime) return null;

  const hasNewCutoff = keywords.some(keyword => ['1800', '18', '180000'].includes(keyword));
  if (!hasNewCutoff) return null;

  const scheduleValue = String(scdtime.value || '').replace(/\s/g, '');
  if (scheduleValue !== '180000') return null;

  return new Finding({
    id: 'inferred-fulmnt-batch-window-collision',
    artifact: scdtime._relFile,
    artifactType: ARTIFACT_TYPE.CLLE,
    evidenceBasis: EVIDENCE_BASIS.INFERRED,
    status: STATUS.OPEN,
    validationTarget: VALIDATION_TARGET.IBM_I,
    symbol: `SCDTIME(${scheduleValue})`,
    finding: `Batch job FULMNT is scheduled at ${scheduleValue} (18:00:00), which equals the new Preferred customer expedited cutoff introduced by CHG-0042. Orders submitted at or near 18:00 may not be captured before the batch run executes. Remediation: move SCDTIME to 181500 (18:15).`,
    lineRef: scdtime.lineRef,
    keywords: ['SCDTIME', '1800', 'schedule', 'batch', 'cutoff', 'expedited'],
    relevanceScore: 6
  });
}

/**
 * ORDERPRO is one ChangeProof workload profile. Generic discovery, evidence
 * classification, analyzer dispatch and Jest-receipt ingestion live in
 * evidence/core.js; only ORDERPRO-specific inference and local data evidence
 * remain here.
 */
async function collect({ crPath, repoRoot, testResultsPath, adapter, pass }) {
  const { findings, keywords } = await collectCore({
    crPath,
    repoRoot,
    patterns: ORDERPRO_PATTERNS,
    testResultsPath,
    pass,
    inferenceRules: [inferBatchWindowCollision],
    pendingValidationTarget: VALIDATION_TARGET.IBM_I
  });

  if (adapter) {
    try {
      const rows = await adapter.querySql(
        'SELECT CUSCLS, COUNT(*) as CNT FROM CUSMAS GROUP BY CUSCLS'
      );
      rows.forEach(row => {
        findings.push(new Finding({
          id: `data-cusmas-cuscls-${row.CUSCLS}`,
          artifact: 'orderpro/sql/sqlite/orderpro.db',
          artifactType: ARTIFACT_TYPE.NODEJS,
          evidenceBasis: EVIDENCE_BASIS.EXECUTED_LOCAL,
          status: pass === 'post-change' ? STATUS.RESOLVED : STATUS.OPEN,
          validationTarget: VALIDATION_TARGET.LOCAL,
          symbol: `CUSCLS=${row.CUSCLS}`,
          finding: `Customer class '${row.CUSCLS}' has ${row.CNT} customer(s) in the local SQLite surrogate.`,
          lineRef: null,
          keywords: keywords.filter(keyword => keywordMatches(keyword, `CUSCLS='${row.CUSCLS}'`)),
          relevanceScore: 2
        }));
      });
    } catch (_) {
      // Adapter evidence is additive; static/test evidence remains reviewable.
    }
  }

  return findings;
}

module.exports = {
  collect,
  parseKeywords,
  inferBatchWindowCollision,
  ORDERPRO_PATTERNS
};
