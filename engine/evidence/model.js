'use strict';

const EVIDENCE_BASIS = Object.freeze({
  EXECUTED_LOCAL : 'EXECUTED_LOCAL',
  OBSERVED_SOURCE: 'OBSERVED_SOURCE',
  INFERRED       : 'INFERRED'
});

const STATUS = Object.freeze({
  OPEN                       : 'OPEN',
  RESOLVED                   : 'RESOLVED',
  TARGET_VALIDATION_REQUIRED : 'TARGET_VALIDATION_REQUIRED'
});

const VALIDATION_TARGET = Object.freeze({
  LOCAL: 'LOCAL',
  IBM_I: 'IBM_I'
});

const ARTIFACT_TYPE = Object.freeze({
  RPGLE : 'RPGLE',
  CLLE  : 'CLLE',
  DDS   : 'DDS',
  DB2SQL: 'DB2SQL',
  NODEJS: 'NODEJS',
  DOC   : 'DOC',
  TEST  : 'TEST'
});

class Finding {
  constructor(opts) {
    this.id               = opts.id;
    this.artifact         = opts.artifact;
    this.artifactType     = opts.artifactType;
    this.evidenceBasis    = opts.evidenceBasis;
    this.status           = opts.status || STATUS.OPEN;
    this.validationTarget = opts.validationTarget;
    this.symbol           = opts.symbol;
    this.finding          = opts.finding;
    this.lineRef          = opts.lineRef || null;
    this.keywords         = opts.keywords || [];
    this.relevanceScore   = opts.relevanceScore || 0;
  }
}

module.exports = { Finding, EVIDENCE_BASIS, STATUS, VALIDATION_TARGET, ARTIFACT_TYPE };
