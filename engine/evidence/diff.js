'use strict';

const { STATUS, VALIDATION_TARGET } = require('./model');

/**
 * Compare baseline findings against post-change findings.
 *
 * Matching strategy:
 *   1. Exact id match
 *   2. Semantic key artifact + type + symbol, consuming unmatched candidates
 *
 * This avoids collapsing repeated findings such as generic comments.
 */
function diff(baseline, postChange) {
  const normalizePath = value => String(value || '').replace(/\\/g, '/').toLowerCase();
  const semKey = f =>
    `${normalizePath(f.artifact)}::${(f.artifactType || '').toLowerCase()}::${(f.symbol || '').toLowerCase()}`;

  const pcById = new Map(postChange.map(f => [f.id, f]));
  const pcBySem = new Map();
  postChange.forEach(f => {
    const key = semKey(f);
    if (!pcBySem.has(key)) pcBySem.set(key, []);
    pcBySem.get(key).push(f);
  });

  const resolved                 = [];
  const persisted                = [];
  const targetValidationRequired = [];
  const newFindings              = [];
  const matchedPcIds             = new Set();

  for (const bf of baseline) {
    let pc = pcById.get(bf.id);
    if (pc && matchedPcIds.has(pc.id)) pc = null;

    if (!pc) {
      const candidates = pcBySem.get(semKey(bf)) || [];
      pc = candidates.find(candidate => !matchedPcIds.has(candidate.id));
    }

    if (pc) matchedPcIds.add(pc.id);

    if (!pc || pc.status === STATUS.RESOLVED) {
      if (!pc && bf.validationTarget === VALIDATION_TARGET.IBM_I) {
        targetValidationRequired.push({ ...bf, status: STATUS.TARGET_VALIDATION_REQUIRED });
      } else {
        resolved.push({ ...bf, status: STATUS.RESOLVED });
      }
    } else if (pc.status === STATUS.TARGET_VALIDATION_REQUIRED) {
      targetValidationRequired.push(pc);
    } else {
      persisted.push(pc);
    }
  }

  for (const pf of postChange) {
    if (!matchedPcIds.has(pf.id)) {
      newFindings.push(pf);
    }
  }

  return { resolved, persisted, newFindings, targetValidationRequired };
}

module.exports = { diff };
