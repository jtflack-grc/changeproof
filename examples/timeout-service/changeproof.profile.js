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
  jestConfig: 'examples/timeout-service/jest.config.js',
  patterns: statePatterns,
  testPaths: (pass) => [`examples/timeout-service/states/${pass}/tests/timeout.test.js`],
  artifactPathMapper: ({ artifact }) => artifact.replace(
    /^examples\/timeout-service\/states\/(?:baseline|literal|post-change)\//,
    ''
  ),
  inferenceRules: [inferTimeoutOrdering],
  diffAgainst: {
    literal: 'baseline',
    'post-change': 'literal'
  }
};
