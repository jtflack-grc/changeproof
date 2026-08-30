'use strict';

const fs = require('fs');
const { EVIDENCE_BASIS, STATUS } = require('./model');

const GENERIC_SYMBOLS = new Set(['comment', 'sentence', 'list_item', 'heading', 'time_expression']);

function readTestCounts(testResultsPath) {
  if (!testResultsPath || !fs.existsSync(testResultsPath)) {
    return { executed: 0, passed: 0, failed: 0, pending: 0 };
  }

  try {
    const receipt = JSON.parse(fs.readFileSync(testResultsPath, 'utf8'));
    const passed = Number(receipt.numPassedTests || 0);
    const failed = Number(receipt.numFailedTests || 0);
    const pending = Number(receipt.numPendingTests || 0);
    return { executed: passed + failed + pending, passed, failed, pending };
  } catch (_) {
    return { executed: 0, passed: 0, failed: 0, pending: 0 };
  }
}

function representativeRows(findings, { includeTests = false } = {}) {
  const inferred = findings.filter(f => f.evidenceBasis === EVIDENCE_BASIS.INFERRED);
  const observed = findings.filter(f =>
    f.evidenceBasis === EVIDENCE_BASIS.OBSERVED_SOURCE && f.artifactType !== 'TEST'
  );
  const bestByArtifact = new Map();

  for (const finding of observed) {
    const symbol = String(finding.symbol || '');
    const generic = GENERIC_SYMBOLS.has(symbol.toLowerCase()) || symbol.length < 3;
    const score = Number(finding.relevanceScore || 0) + (generic ? 0 : 5);
    const existing = bestByArtifact.get(finding.artifact);
    if (!existing || score > existing.score) bestByArtifact.set(finding.artifact, { score, finding });
  }

  const executedNonTests = findings.filter(f =>
    f.evidenceBasis === EVIDENCE_BASIS.EXECUTED_LOCAL && f.artifactType !== 'TEST'
  );
  const tests = includeTests ? findings.filter(f => f.artifactType === 'TEST') : [];
  return [
    ...inferred,
    ...Array.from(bestByArtifact.values()).map(item => item.finding),
    ...executedNonTests,
    ...tests
  ];
}

function buildImpactReceipt({
  workload,
  pass,
  elapsedMs,
  collectorStats = {},
  findings = [],
  testResultsPath = null,
  reviewerRows = null,
  outputs = []
}) {
  const tests = readTestCounts(testResultsPath);
  const inferred = findings.filter(f => f.evidenceBasis === EVIDENCE_BASIS.INFERRED);
  const openInferences = inferred.filter(f => f.status === STATUS.OPEN);
  const open = findings.filter(f => f.status === STATUS.OPEN).length;
  const resolved = findings.filter(f => f.status === STATUS.RESOLVED).length;
  const target = findings.filter(f => f.status === STATUS.TARGET_VALIDATION_REQUIRED).length;
  const primaryRows = Number.isFinite(reviewerRows) ? reviewerRows : null;

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    workload,
    pass,
    pipelineElapsedMs: Math.max(0, Math.round(Number(elapsedMs || 0))),
    discovery: {
      filesScanned: Number(collectorStats.filesScanned || 0),
      symbolsAnalyzed: Number(collectorStats.symbolsAnalyzed || 0),
      sourceFindingsProduced: Number(collectorStats.sourceFindingsProduced || 0),
      adapterEvidenceProduced: Number(collectorStats.adapterEvidenceProduced || 0)
    },
    execution: tests,
    evidence: {
      findingsProduced: findings.length,
      inferredFindings: inferred.length,
      openInferences: openInferences.length,
      openFindings: open,
      resolvedFindings: resolved,
      targetValidationRequired: target
    },
    review: {
      primaryRows,
      machineToPrimaryRatio: primaryRows && primaryRows > 0
        ? Number((findings.length / primaryRows).toFixed(2))
        : null,
      outputsGenerated: outputs.length,
      outputs
    },
    productivitySignals: {
      scopedAcceptanceGreen: tests.executed > 0 && tests.failed === 0,
      acceptanceGreenWithOpenInference: tests.executed > 0 && tests.failed === 0 && openInferences.length > 0,
      residualTargetChecksPreserved: target,
      reviewCompressionAvailable: primaryRows !== null && primaryRows > 0 && findings.length >= primaryRows
    }
  };
}

module.exports = { buildImpactReceipt, readTestCounts, representativeRows };
