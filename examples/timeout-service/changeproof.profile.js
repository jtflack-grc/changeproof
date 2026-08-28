'use strict';

const { inferTimeoutOrdering } = require('./inference');

const root = 'examples/timeout-service/states';
const statePatterns = (pass) => [
  `${root}/${pass}/src/**/*.js`,
  `${root}/${pass}/config/**/*.{conf,ini,env,yaml,yml,json,properties}`,
  `${root}/${pass}/docs/**/*.{md,txt}`
];

module.exports = {
  id: 'timeout-service',
  name: 'REPORT-GW Timeout Service',
  description: 'A deliberately small modern Node.js workload used to prove that ChangeProof is not hard-coded to ORDERPRO or IBM i.',
  changeRequest: 'examples/timeout-service/CHANGE_REQUEST.md',
  outputDir: 'examples/timeout-service/evidence-pack',
  patterns: statePatterns,
  testPaths: (pass) => [`examples/timeout-service/states/${pass}/tests/timeout.test.js`],
  inferenceRules: [inferTimeoutOrdering],
  diffAgainst: {
    literal: 'baseline',
    'post-change': 'literal'
  }
};
