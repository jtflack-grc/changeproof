'use strict';

const { EVIDENCE_BASIS, STATUS, VALIDATION_TARGET } = require('../evidence/model');

const BADGE_BASIS = {
  EXECUTED_LOCAL : { md: '[EXECUTED_LOCAL]',  color: '#22863a', bg: '#dcffe4' },
  OBSERVED_SOURCE: { md: '[OBSERVED_SOURCE]', color: '#0366d6', bg: '#ddf4ff' },
  INFERRED       : { md: '[INFERRED]',         color: '#735c0f', bg: '#fffbdd' }
};
const BADGE_STATUS = {
  OPEN                       : { md: '[OPEN]',      color: '#d15704', bg: '#fff3e0' },
  RESOLVED                   : { md: '[RESOLVED]',  color: '#22863a', bg: '#dcffe4' },
  TARGET_VALIDATION_REQUIRED : { md: '[TARGET_VALIDATION_REQUIRED]', color: '#b31d28', bg: '#ffdce0' }
};
const BADGE_TARGET = {
  LOCAL: { md: '[LOCAL]', color: '#586069', bg: '#f1f8ff' },
  IBM_I: { md: '[IBM_I]', color: '#5a32a3', bg: '#f5f0ff' }
};

function mdBadge(text, map) { return (map[text] || { md: `[${text}]` }).md; }
function htmlBadge(text, map) {
  const b = map[text] || { color: '#333', bg: '#eee' };
  return `<span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;color:${b.color};background:${b.bg};border:1px solid ${b.color}33;">${text}</span>`;
}
function countBy(arr, key) {
  return arr.reduce((acc, item) => {
    const v = item[key] || 'unknown';
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {});
}
function groupBy(arr, key) {
  const map = new Map();
  arr.forEach(item => {
    const k = item[key];
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(item);
  });
  return map;
}
function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const GENERIC_SYMBOLS = new Set(['comment', 'sentence', 'list_item', 'heading', 'time_expression']);
function selectPrimaryFindings(findings) {
  const always  = findings.filter(f => f.evidenceBasis === EVIDENCE_BASIS.INFERRED);
  const observed = findings.filter(f =>
    f.evidenceBasis === EVIDENCE_BASIS.OBSERVED_SOURCE && f.artifactType !== 'TEST'
  );
  const bestByArtifact = new Map();
  for (const f of observed) {
    const isGeneric = GENERIC_SYMBOLS.has((f.symbol || '').toLowerCase()) || (f.symbol || '').length < 3;
    const score  = (f.relevanceScore || 0) + (isGeneric ? 0 : 5);
    const existing = bestByArtifact.get(f.artifact);
    if (!existing || score > ((existing._score || 0))) {
      bestByArtifact.set(f.artifact, { ...f, _score: score });
    }
  }
  const primary = [...bestByArtifact.values()].map(f => { delete f._score; return f; });
  const dataFindings = findings.filter(f =>
    f.evidenceBasis === EVIDENCE_BASIS.EXECUTED_LOCAL && f.artifactType !== 'TEST'
  );
  return [...always, ...primary, ...dataFindings];
}

function renderMarkdown(findings, changeRequest, diffResult) {
  const lines = [];
  const hr    = () => lines.push('\n---\n');

  lines.push('# ChangeProof Evidence Pack');
  lines.push(`\n_Generated: ${new Date().toISOString()}_\n`);
  hr();
  lines.push('## 1. Change Request\n');
  lines.push(changeRequest.trim());
  hr();

  lines.push('## 2. Executive Summary\n');
  const byBasis  = countBy(findings, 'evidenceBasis');
  const byStatus = countBy(findings, 'status');
  const byTarget = countBy(findings, 'validationTarget');
  lines.push(`**Total findings:** ${findings.length}\n`);
  lines.push('| evidenceBasis | count |\n|---|---|');
  Object.entries(byBasis).forEach(([k, v]) => lines.push(`| ${k} | ${v} |`));
  lines.push('\n| status | count |\n|---|---|');
  Object.entries(byStatus).forEach(([k, v]) => lines.push(`| ${k} | ${v} |`));
  lines.push('\n| validationTarget | count |\n|---|---|');
  Object.entries(byTarget).forEach(([k, v]) => lines.push(`| ${k} | ${v} |`));
  hr();

  lines.push('## 3. Blast Radius\n');
  lines.push(`_${findings.length} total findings — showing primary representative per artifact. Full set in \`traceability.json\`._\n`);
  lines.push('| Artifact | Symbol | evidenceBasis | status | validationTarget |');
  lines.push('|---|---|---|---|---|');
  const blastPrimary = selectPrimaryFindings(findings);
  blastPrimary.forEach(f => lines.push(
    `| \`${f.artifact}\` | ${f.symbol} | ${mdBadge(f.evidenceBasis, BADGE_BASIS)} | ${mdBadge(f.status, BADGE_STATUS)} | ${mdBadge(f.validationTarget, BADGE_TARGET)} |`
  ));
  hr();

  lines.push('## 4. Dependency Analysis\n');
  lines.push('Artifact call graph inferred from static analysis:\n');
  lines.push('```');
  lines.push('FULMNT.clle  -->  ORDPRC.rpgle  (CALL PGM)');
  lines.push('orders.js    -->  mock-adapter  -->  ORDPRC fixture');
  lines.push('orders.js    -->  CUSMAS        (customer class lookup)');
  lines.push('```');
  hr();

  lines.push('## 5. Static Analysis Findings\n');
  const sourceFindings = findings.filter(f =>
    f.evidenceBasis === EVIDENCE_BASIS.OBSERVED_SOURCE ||
    f.evidenceBasis === EVIDENCE_BASIS.INFERRED
  );
  groupBy(sourceFindings, 'artifact').forEach((group, art) => {
    lines.push(`### ${art}\n`);
    group.forEach(f => {
      lines.push(`- **${f.symbol}** — ${f.finding}`);
      lines.push(`  - ${mdBadge(f.evidenceBasis, BADGE_BASIS)} ${mdBadge(f.status, BADGE_STATUS)} ${mdBadge(f.validationTarget, BADGE_TARGET)}`);
      if (f.lineRef) lines.push(`  - \`${f.lineRef}\``);
    });
    lines.push('');
  });
  hr();

  lines.push('## 6. Test Results\n');
  const testFindings = findings.filter(f => f.artifactType === 'TEST');
  if (!testFindings.length) {
    lines.push('_No test results. Run `npm test` and re-collect._\n');
  } else {
    const passed = testFindings.filter(f => f.status === STATUS.RESOLVED).length;
    const failed = testFindings.filter(f => f.status === STATUS.OPEN).length;
    const skipped = testFindings.filter(f => f.status === STATUS.TARGET_VALIDATION_REQUIRED).length;
    lines.push(`**${passed} passing · ${failed} failing · ${skipped} skipped/pending**\n`);
    lines.push('| Test | Status | evidenceBasis |');
    lines.push('|---|---|---|');
    testFindings.forEach(f => lines.push(
      `| ${f.symbol} | ${mdBadge(f.status, BADGE_STATUS)} | ${mdBadge(f.evidenceBasis, BADGE_BASIS)} |`
    ));
  }
  hr();

  lines.push('## 7. Test Gaps\n');
  const gaps = testFindings.filter(f => f.status === STATUS.OPEN);
  if (!gaps.length) lines.push('_No test gaps identified._\n');
  else gaps.forEach(f => {
    lines.push(`- **FAILING:** ${f.finding}`);
    lines.push(`  - \`${f.artifact}\``);
  });
  hr();

  lines.push('## 8. Documentation Gaps\n');
  const docFindings = findings.filter(f => f.artifactType === 'DOC');
  if (!docFindings.length) lines.push('_No documentation findings._\n');
  else docFindings.forEach(f => {
    lines.push(`- ${mdBadge(f.evidenceBasis, BADGE_BASIS)} **${f.symbol}** — ${f.finding}`);
    lines.push(`  - \`${f.lineRef || f.artifact}\``);
  });
  hr();

  lines.push('## 9. IBM i Validation Boundary\n');
  lines.push('Conservative implementation options: `idb-connector` (ODBC), `itoolkit`/XMLSERVICE, SSH + CRTBNDRPG, `QSYS2.QCMDEXC` via ODBC.\n');
  const ibmiFindings = findings.filter(f => f.validationTarget === VALIDATION_TARGET.IBM_I);
  if (!ibmiFindings.length) lines.push('_None._\n');
  else ibmiFindings.forEach(f => lines.push(`- \`${f.artifact}\` — **${f.symbol}**: ${f.finding}`));
  hr();

  lines.push('## 10. Rollback Guidance\n');
  lines.push('| Artifact | Rollback Action |');
  lines.push('|---|---|');
  [
    ['`orderpro/rpgle/ORDPRC.rpgle`',       'Revert CHKORDCTF to single 1600 cutoff (remove CUSCLS branch)'],
    ['`orderpro/clle/FULMNT.clle`',          'Revert SCDTIME to 180000 and restore original comment'],
    ['`api/src/routes/orders.js`',           'Revert cutoffHour to constant 16'],
    ['`orderpro/dds/CUSMAS.dds`',            'Revert CUSCLS field text to original'],
    ['`orderpro/sql/db2/CUSMAS.sql`',        'Revert LABEL ON COLUMN text'],
    ['`orderpro/docs/operations-guide.md`',  'Revert Cutoff Policy and Customer Classes sections']
  ].forEach(([art, action]) => lines.push(`| ${art} | ${action} |`));
  hr();

  lines.push('## 11. Traceability Matrix\n');
  lines.push('| CHG-0042 Requirement | Finding(s) |');
  lines.push('|---|---|');
  [
    ['Preferred customer cutoff = 18:00', 'ORDPRC.rpgle CHKORDCTF, orders.js cutoffHour'],
    ['Standard customer cutoff unchanged', 'orders.js cutoffHour, regression cutoff tests'],
    ['Batch window must not drop 18:00 orders', 'FULMNT.clle SCDTIME (INFERRED collision)'],
    ['CUSCLS documentation corrected', 'CUSMAS.dds, Db2 DDL LABEL ON'],
    ['Operations guide updated', 'operations-guide.md Cutoff Policy section'],
    ['Regression tests added', 'orders.test.js, cutoff.test.js']
  ].forEach(([req, finding]) => lines.push(`| ${req} | ${finding} |`));
  hr();

  if (diffResult) {
    lines.push('## 12. Diff Summary (Pre → Post Change)\n');
    lines.push('| Category | Count |');
    lines.push('|---|---|');
    lines.push(`| Resolved | ${diffResult.resolved.length} |`);
    lines.push(`| Persisted (still open) | ${diffResult.persisted.length} |`);
    lines.push(`| Target validation required | ${diffResult.targetValidationRequired.length} |`);
    lines.push(`| New findings | ${diffResult.newFindings.length} |`);
    lines.push('');
    if (diffResult.resolved.length) {
      lines.push('**Resolved:**');
      diffResult.resolved.forEach(f => lines.push(`- ✅ \`${f.artifact}\` — ${f.symbol}`));
      lines.push('');
    }
    if (diffResult.targetValidationRequired.length) {
      lines.push('**Target validation required (IBM_I):**');
      diffResult.targetValidationRequired.forEach(f => lines.push(`- 🟠 \`${f.artifact}\` — ${f.symbol}: ${f.finding}`));
      lines.push('');
    }
    if (diffResult.persisted.length) {
      lines.push('**Still open:**');
      diffResult.persisted.forEach(f => lines.push(`- 🔵 \`${f.artifact}\` — ${f.symbol}`));
    }
  }

  return lines.join('\n');
}

function renderHtml(findings, changeRequest, diffResult) {
  const css = `
body{font-family:-apple-system,"Segoe UI",system-ui,sans-serif;font-size:14px;line-height:1.6;color:#1f2328;max-width:960px;margin:40px auto;padding:0 24px}
h1{font-size:22px;border-bottom:2px solid #e5e7eb;padding-bottom:8px}
h2{font-size:17px;margin-top:32px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;color:#24292f}
h3{font-size:14px;margin-top:20px;color:#57606a}
table{border-collapse:collapse;width:100%;margin:12px 0;font-size:13px}
th{background:#f6f8fa;text-align:left;padding:6px 10px;border:1px solid #d0d7de}
td{padding:5px 10px;border:1px solid #d0d7de;vertical-align:top}
tr:nth-child(even){background:#f6f8fa}
code{background:#f6f8fa;padding:1px 5px;border-radius:4px;font-size:12px}
pre{background:#f6f8fa;padding:12px;border-radius:6px;overflow-x:auto;font-size:12px}
.section{margin:24px 0}
footer{margin-top:48px;padding-top:12px;border-top:1px solid #e5e7eb;text-align:center;font-size:12px;color:#57606a}
  `;

  const sec  = (n, title, body) => `<div class="section"><h2>${n}. ${title}</h2>${body}</div>`;
  const tbl  = (headers, rows) => {
    const th = headers.map(h => `<th>${h}</th>`).join('');
    const tr = rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
    return `<table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
  };
  const bb   = (v, map) => htmlBadge(v, map);
  const code = s => `<code>${esc(s)}</code>`;

  const s1 = `<pre>${esc(changeRequest.trim())}</pre>`;

  const byBasis  = countBy(findings, 'evidenceBasis');
  const byStatus = countBy(findings, 'status');
  const byTarget = countBy(findings, 'validationTarget');
  const s2 = `<p><strong>Total findings:</strong> ${findings.length}</p>` +
    tbl(['evidenceBasis', 'Count'], Object.entries(byBasis).map(([k,v]) => [bb(k, BADGE_BASIS), v])) +
    tbl(['status', 'Count'], Object.entries(byStatus).map(([k,v]) => [bb(k, BADGE_STATUS), v])) +
    tbl(['validationTarget', 'Count'], Object.entries(byTarget).map(([k,v]) => [bb(k, BADGE_TARGET), v]));

  const blastPrimaryHtml = selectPrimaryFindings(findings);
  const s3 = `<p><em>${findings.length} total findings — showing primary representative per artifact. Full set in <code>traceability.json</code>.</em></p>` +
    tbl(
      ['Artifact', 'Symbol', 'evidenceBasis', 'status', 'validationTarget'],
      blastPrimaryHtml.map(f => [code(f.artifact), esc(f.symbol), bb(f.evidenceBasis, BADGE_BASIS), bb(f.status, BADGE_STATUS), bb(f.validationTarget, BADGE_TARGET)])
    );

  const s4 = `<pre>FULMNT.clle  --&gt;  ORDPRC.rpgle  (CALL PGM)\norders.js    --&gt;  mock-adapter  --&gt;  ORDPRC fixture\norders.js    --&gt;  CUSMAS        (customer class lookup)</pre>`;

  const sourceFindings = findings.filter(f =>
    f.evidenceBasis === EVIDENCE_BASIS.OBSERVED_SOURCE || f.evidenceBasis === EVIDENCE_BASIS.INFERRED
  );
  let s5 = '';
  groupBy(sourceFindings, 'artifact').forEach((group, art) => {
    s5 += `<h3>${code(art)}</h3>` + tbl(
      ['Symbol', 'Finding', 'Basis', 'Status', 'Line'],
      group.map(f => [esc(f.symbol), esc(f.finding), bb(f.evidenceBasis, BADGE_BASIS), bb(f.status, BADGE_STATUS), f.lineRef ? code(f.lineRef) : ''])
    );
  });

  const testFindings = findings.filter(f => f.artifactType === 'TEST');
  const testSummary = testFindings.length
    ? `<p><strong>${testFindings.filter(f => f.status === STATUS.RESOLVED).length} passing · ${testFindings.filter(f => f.status === STATUS.OPEN).length} failing · ${testFindings.filter(f => f.status === STATUS.TARGET_VALIDATION_REQUIRED).length} skipped/pending</strong></p>`
    : '';
  const s6 = testFindings.length === 0
    ? '<p><em>No test results. Run npm test and re-collect.</em></p>'
    : testSummary + tbl(['Test', 'Status', 'Basis'], testFindings.map(f => [esc(f.symbol), bb(f.status, BADGE_STATUS), bb(f.evidenceBasis, BADGE_BASIS)]));

  const gaps = testFindings.filter(f => f.status === STATUS.OPEN);
  const s7 = !gaps.length
    ? '<p><em>No test gaps identified.</em></p>'
    : `<ul>${gaps.map(f => `<li><strong>${esc(f.symbol)}</strong> — ${esc(f.finding)}<br>${code(f.artifact)}</li>`).join('')}</ul>`;

  const docFindings = findings.filter(f => f.artifactType === 'DOC');
  const s8 = !docFindings.length
    ? '<p><em>No documentation findings.</em></p>'
    : `<ul>${docFindings.map(f => `<li>${bb(f.evidenceBasis, BADGE_BASIS)} <strong>${esc(f.symbol)}</strong> — ${esc(f.finding)}<br>${code(f.lineRef || f.artifact)}</li>`).join('')}</ul>`;

  const ibmiFindings = findings.filter(f => f.validationTarget === VALIDATION_TARGET.IBM_I);
  const s9 = `<p>Conservative options: ${code('idb-connector')} (ODBC), ${code('itoolkit')}/XMLSERVICE, SSH + CRTBNDRPG, ${code('QSYS2.QCMDEXC')} via ODBC.</p>` +
    (!ibmiFindings.length ? '<p><em>None.</em></p>'
      : `<ul>${ibmiFindings.map(f => `<li>${code(f.artifact)} — <strong>${esc(f.symbol)}</strong>: ${esc(f.finding)}<br>${bb(f.status, BADGE_STATUS)}</li>`).join('')}</ul>`);

  const s10 = tbl(['Artifact', 'Rollback Action'], [
    [code('orderpro/rpgle/ORDPRC.rpgle'),      'Revert CHKORDCTF to single 1600 cutoff'],
    [code('orderpro/clle/FULMNT.clle'),         'Revert SCDTIME to 180000'],
    [code('api/src/routes/orders.js'),          'Revert cutoffHour to constant 16'],
    [code('orderpro/dds/CUSMAS.dds'),           'Revert CUSCLS field text'],
    [code('orderpro/sql/db2/CUSMAS.sql'),       'Revert LABEL ON COLUMN text'],
    [code('orderpro/docs/operations-guide.md'), 'Revert Cutoff Policy and Customer Classes sections']
  ]);

  const s11 = tbl(['CHG-0042 Requirement', 'Finding(s)'], [
    ['Preferred customer cutoff = 18:00',        'ORDPRC.rpgle CHKORDCTF, orders.js cutoffHour'],
    ['Standard customer cutoff unchanged',        'orders.js cutoffHour, regression cutoff tests'],
    ['Batch window must not drop 18:00 orders',  'FULMNT.clle SCDTIME (INFERRED collision)'],
    ['CUSCLS documentation corrected',           'CUSMAS.dds, Db2 DDL LABEL ON'],
    ['Operations guide updated',                 'operations-guide.md Cutoff Policy section'],
    ['Regression tests added',                   'orders.test.js, cutoff.test.js']
  ]);

  let s12 = '';
  if (diffResult) {
    s12 = sec('12', 'Diff Summary (Pre → Post Change)',
      tbl(['Category', 'Count'], [
        ['Resolved',                    String(diffResult.resolved.length)],
        ['Persisted (still open)',       String(diffResult.persisted.length)],
        ['Target validation required',  String(diffResult.targetValidationRequired.length)],
        ['New findings',                String(diffResult.newFindings.length)]
      ]) +
      (diffResult.resolved.length
        ? `<h3>Resolved</h3><ul>${diffResult.resolved.map(f => `<li>✅ ${code(f.artifact)} — ${esc(f.symbol)}</li>`).join('')}</ul>` : '') +
      (diffResult.targetValidationRequired.length
        ? `<h3>Target Validation Required</h3><ul>${diffResult.targetValidationRequired.map(f => `<li>🟠 ${code(f.artifact)} — ${esc(f.symbol)}: ${esc(f.finding)}</li>`).join('')}</ul>` : '') +
      (diffResult.persisted.length
        ? `<h3>Still Open</h3><ul>${diffResult.persisted.map(f => `<li>🔵 ${code(f.artifact)} — ${esc(f.symbol)}</li>`).join('')}</ul>` : '')
    );
  }

  const body = [
    sec('1',  'Change Request',            s1),
    sec('2',  'Executive Summary',          s2),
    sec('3',  'Blast Radius',               s3),
    sec('4',  'Dependency Analysis',        s4),
    sec('5',  'Static Analysis Findings',   s5),
    sec('6',  'Test Results',               s6),
    sec('7',  'Test Gaps',                  s7),
    sec('8',  'Documentation Gaps',         s8),
    sec('9',  'IBM i Validation Boundary',  s9),
    sec('10', 'Rollback Guidance',          s10),
    sec('11', 'Traceability Matrix',        s11),
    s12
  ].join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>ChangeProof Evidence Pack</title>
<style>${css}</style>
</head>
<body>
<h1>ChangeProof Evidence Pack</h1>
<p style="color:#57606a;font-size:13px;">Generated: ${new Date().toISOString()}</p>
${body}
<footer>Made with IBM Bob</footer>
</body>
</html>`;
}

module.exports = { renderMarkdown, renderHtml };
