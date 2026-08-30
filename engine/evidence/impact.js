'use strict';

const fs = require('fs');
const { EVIDENCE_BASIS, STATUS } = require('./model');

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

module.exports = { buildImpactReceipt, readTestCounts };
