'use strict';

const fs   = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const { collect, parseKeywords } = require('./evidence/collector');
const { diff }                   = require('./evidence/diff');
const { buildImpactReceipt, representativeRows } = require('./evidence/impact');
const { renderMarkdown, renderHtml } = require('./reporters/pack');
const adapter                    = require('./adapters/mock-adapter');

const REPO_ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--cr'   && argv[i + 1]) { args.cr   = argv[++i]; }
    if (argv[i] === '--pass' && argv[i + 1]) { args.pass = argv[++i]; }
  }
  return args;
}

function runTests(outputPath) {
  console.log('  Running test suite...');
  try {
    execFileSync(
      process.execPath,
      [require.resolve('jest/bin/jest'), '--json', `--outputFile=${outputPath}`, '--passWithNoTests', '--runInBand'],
      { cwd: REPO_ROOT, stdio: 'pipe' }
    );
  } catch (_) {
    // Jest exits non-zero when tests fail — expected pre-change.
    // The JSON output file is still written.
  }
  return fs.existsSync(outputPath);
}

async function main() {
  const args = parseArgs(process.argv);

  if (!args.cr || !args.pass) {
    console.error('Usage: node engine/runner.js --cr CHANGE_REQUEST.md --pass <baseline|post-change>');
    process.exit(1);
  }

  const startedAt      = Date.now();
  const crPath         = path.resolve(REPO_ROOT, args.cr);
  const passName       = args.pass;
  const outDir         = path.join(REPO_ROOT, 'evidence-pack', passName);
  const testJsonPath   = path.join(outDir, 'test-results.json');
  const baselineJson   = path.join(REPO_ROOT, 'evidence-pack', 'baseline', 'traceability.json');

  fs.mkdirSync(outDir, { recursive: true });

  console.log(`\nChangeProof — ${passName.toUpperCase()} PASS`);
  console.log('='.repeat(50));

  console.log('\n[1/4] Running regression tests...');
  const testsRan = runTests(testJsonPath);
  if (!testsRan) console.warn('      Warning: no test results file — test findings will be empty.');

  console.log('\n[2/4] Collecting findings...');
  const findings = await collect({
    crPath,
    repoRoot        : REPO_ROOT,
    testResultsPath : testsRan ? testJsonPath : null,
    adapter,
    pass            : passName
  });
  console.log(`      ${findings.length} findings collected.`);

  let diffResult = null;
  if (passName === 'post-change' && fs.existsSync(baselineJson)) {
    console.log('\n[3/4] Diffing against baseline...');
    const baseline = JSON.parse(fs.readFileSync(baselineJson, 'utf8'));
    diffResult = diff(baseline, findings);
    console.log(`      Resolved: ${diffResult.resolved.length}  Persisted: ${diffResult.persisted.length}  Target-validation: ${diffResult.targetValidationRequired.length}  New: ${diffResult.newFindings.length}`);
  } else {
    console.log('\n[3/4] Skipping diff (baseline pass or no baseline found).');
  }

  console.log('\n[4/4] Rendering evidence pack...');
  const crText   = fs.readFileSync(crPath, 'utf8');
  const mdText   = renderMarkdown(findings, crText, diffResult);
  const htmlText = renderHtml(findings, crText, diffResult);
  const jsonText = JSON.stringify(findings, null, 2);

  const mdPath      = path.join(outDir, 'evidence-pack.md');
  const htmlPath    = path.join(outDir, 'evidence-pack.html');
  const jsonPath    = path.join(outDir, 'traceability.json');
  const impactPath  = path.join(outDir, 'impact.json');

  fs.writeFileSync(mdPath,   mdText,   'utf8');
  fs.writeFileSync(htmlPath, htmlText, 'utf8');
  fs.writeFileSync(jsonPath, jsonText, 'utf8');

  const outputs = [
    ...(testsRan ? ['test-results.json'] : []),
    'traceability.json',
    'evidence-pack.md',
    'evidence-pack.html',
    'impact.json'
  ];
  const impact = buildImpactReceipt({
    workload: 'ORDERPRO',
    pass: passName,
    elapsedMs: Date.now() - startedAt,
    collectorStats: findings.stats || {},
    findings,
    testResultsPath: testsRan ? testJsonPath : null,
    reviewerRows: representativeRows(findings).length,
    outputs
  });
  fs.writeFileSync(impactPath, JSON.stringify(impact, null, 2), 'utf8');

  console.log(`\n✓ Evidence pack written to evidence-pack/${passName}/`);
  console.log(`  ${path.basename(mdPath)}`);
  console.log(`  ${path.basename(htmlPath)}`);
  console.log(`  ${path.basename(jsonPath)}`);
  console.log(`  ${path.basename(impactPath)}`);

  const open = findings.filter(f => f.status === 'OPEN').length;
  const tvr  = findings.filter(f => f.status === 'TARGET_VALIDATION_REQUIRED').length;
  const res  = findings.filter(f => f.status === 'RESOLVED').length;
  console.log(`\nSummary: ${open} OPEN  |  ${res} RESOLVED  |  ${tvr} TARGET_VALIDATION_REQUIRED`);
  console.log(`Impact: ${impact.discovery.filesScanned} files / ${impact.discovery.symbolsAnalyzed} symbols / ${impact.execution.executed} tests / ${impact.evidence.findingsProduced} findings → ${impact.review.primaryRows} primary review rows`);
}

main().catch(err => {
  console.error('Runner error:', err);
  process.exit(1);
});
