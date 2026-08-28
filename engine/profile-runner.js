'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const { collectCore } = require('./evidence/core');
const { diff } = require('./evidence/diff');
const { renderMarkdown, renderHtml } = require('./reporters/profile-pack');

const REPO_ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--profile' && argv[i + 1]) args.profile = argv[++i];
    else if (argv[i] === '--pass' && argv[i + 1]) args.pass = argv[++i];
  }
  return args;
}

function resolvePassValue(value, pass) {
  if (typeof value === 'function') return value(pass);
  if (value && !Array.isArray(value) && typeof value === 'object') return value[pass];
  return value;
}

function runTests(testPaths, outputPath) {
  if (!Array.isArray(testPaths) || testPaths.length === 0) return false;
  console.log(`  Running ${testPaths.length} scoped test file(s)...`);
  try {
    execFileSync(
      process.execPath,
      [
        require.resolve('jest/bin/jest'),
        '--json',
        `--outputFile=${outputPath}`,
        '--passWithNoTests',
        '--runInBand',
        '--runTestsByPath',
        ...testPaths
      ],
      { cwd: REPO_ROOT, stdio: 'pipe' }
    );
  } catch (_) {
    // Jest exits non-zero for an expected baseline failure; JSON still lands.
  }
  return fs.existsSync(outputPath);
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.profile || !args.pass) {
    console.error('Usage: node engine/profile-runner.js --profile <profile.js> --pass <pass>');
    process.exit(1);
  }

  const profilePath = path.resolve(REPO_ROOT, args.profile);
  if (!fs.existsSync(profilePath)) throw new Error(`Profile not found: ${args.profile}`);
  const profile = require(profilePath);
  const pass = args.pass;
  const patterns = resolvePassValue(profile.patterns, pass);
  const testPaths = resolvePassValue(profile.testPaths, pass) || [];

  if (!Array.isArray(patterns) || patterns.length === 0) {
    throw new Error(`Profile ${profile.id || args.profile} has no source patterns for pass '${pass}'`);
  }

  const crPath = path.resolve(REPO_ROOT, profile.changeRequest);
  const outRoot = path.resolve(REPO_ROOT, profile.outputDir);
  const outDir = path.join(outRoot, pass);
  const testJsonPath = path.join(outDir, 'test-results.json');
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`\nChangeProof profile — ${profile.name}`);
  console.log(`Pass: ${pass}`);
  console.log('='.repeat(64));

  console.log('\n[1/4] Scoped execution receipt...');
  const testsRan = runTests(testPaths, testJsonPath);
  if (!testsRan) console.warn('      No scoped test receipt was produced.');

  console.log('\n[2/4] Profile-driven evidence collection...');
  const { findings } = await collectCore({
    crPath,
    repoRoot: REPO_ROOT,
    patterns,
    testResultsPath: testsRan ? testJsonPath : null,
    pass,
    inferenceRules: profile.inferenceRules || [],
    validationTargetResolver: profile.validationTargetResolver || null,
    pendingValidationTarget: profile.pendingValidationTarget || 'LOCAL'
  });
  console.log(`      ${findings.length} findings collected.`);

  console.log('\n[3/4] Evidence diff...');
  let diffResult = null;
  const previousPass = profile.diffAgainst && profile.diffAgainst[pass];
  if (previousPass) {
    const previousPath = path.join(outRoot, previousPass, 'traceability.json');
    if (!fs.existsSync(previousPath)) throw new Error(`Previous evidence missing: ${previousPath}`);
    const previous = JSON.parse(fs.readFileSync(previousPath, 'utf8'));
    diffResult = diff(previous, findings);
    console.log(`      against ${previousPass}: resolved=${diffResult.resolved.length}, persisted=${diffResult.persisted.length}, target=${diffResult.targetValidationRequired.length}, new=${diffResult.newFindings.length}`);
  } else {
    console.log('      No prior pass configured.');
  }

  console.log('\n[4/4] Rendering workload-neutral evidence pack...');
  const changeRequest = fs.readFileSync(crPath, 'utf8');
  fs.writeFileSync(path.join(outDir, 'traceability.json'), JSON.stringify(findings, null, 2), 'utf8');
  fs.writeFileSync(path.join(outDir, 'evidence-pack.md'), renderMarkdown(findings, changeRequest, profile, diffResult), 'utf8');
  fs.writeFileSync(path.join(outDir, 'evidence-pack.html'), renderHtml(findings, changeRequest, profile, diffResult), 'utf8');

  const summary = {
    profile: profile.id,
    pass,
    findingCount: findings.length,
    byEvidenceBasis: countBy(findings, 'evidenceBasis'),
    byStatus: countBy(findings, 'status'),
    byValidationTarget: countBy(findings, 'validationTarget'),
    diff: diffResult ? {
      against: previousPass,
      resolved: diffResult.resolved.length,
      persisted: diffResult.persisted.length,
      targetValidationRequired: diffResult.targetValidationRequired.length,
      newFindings: diffResult.newFindings.length
    } : null
  };
  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8');

  console.log(`\n✓ ${profile.id}/${pass} evidence written to ${path.relative(REPO_ROOT, outDir)}`);
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || 'UNKNOWN';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

main().catch(error => {
  console.error('Profile runner error:', error);
  process.exit(1);
});
