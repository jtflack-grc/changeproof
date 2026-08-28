(() => {
  const ARTIFACTS = [
    { key:'baselineTrace', label:'Baseline traceability', path:'evidence-pack/baseline/traceability.json', type:'json' },
    { key:'postTrace', label:'Post-change traceability', path:'evidence-pack/post-change/traceability.json', type:'json' },
    { key:'baselineTests', label:'Baseline Jest receipt', path:'evidence-pack/baseline/test-results.json', type:'json' },
    { key:'postTests', label:'Post-change Jest receipt', path:'evidence-pack/post-change/test-results.json', type:'json' },
    { key:'changeRequest', label:'Change request', path:'CHANGE_REQUEST.md', type:'text' },
    { key:'rpgSource', label:'Submitted RPGLE', path:'orderpro/rpgle/ORDPRC.rpgle', type:'text' },
    { key:'clSource', label:'Submitted CLLE', path:'orderpro/clle/FULMNT.clle', type:'text' },
    { key:'collectorSource', label:'Inference engine', path:'engine/evidence/collector.js', type:'text' }
  ];

  const esc = (value) => String(value ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  const githubUrl = (path) => `https://github.com/jtflack-grc/changeproof/blob/main/${path}`;
  const rawUrl = (path) => path;

  async function loadArtifact(def) {
    const response = await fetch(def.path, { cache:'no-store' });
    if (!response.ok) throw new Error(`${def.path}: HTTP ${response.status}`);
    const value = def.type === 'json' ? await response.json() : await response.text();
    return { ...def, value };
  }

  function assertionRows(receipt) {
    return (receipt.testResults || []).flatMap((suite) => {
      const assertions = suite.assertionResults || suite.testResults || [];
      return assertions.map((test) => ({ ...test, suite: suite.name || suite.testFilePath || '' }));
    });
  }

  function findAssertion(receipt, terms) {
    const needles = terms.map((term) => term.toLowerCase());
    return assertionRows(receipt).find((test) => {
      const haystack = `${test.fullName || ''} ${test.title || ''}`.toLowerCase();
      return needles.every((term) => haystack.includes(term));
    }) || null;
  }

  function testCounts(receipt) {
    const tests = assertionRows(receipt);
    const by = (status) => tests.filter((test) => test.status === status).length;
    return {
      passed: Number.isFinite(receipt.numPassedTests) ? receipt.numPassedTests : by('passed'),
      failed: Number.isFinite(receipt.numFailedTests) ? receipt.numFailedTests : by('failed'),
      pending: Number.isFinite(receipt.numPendingTests) ? receipt.numPendingTests : by('pending')
    };
  }

  function sourceSnippet(source, needle, radius = 4) {
    const lines = source.split(/\r?\n/);
    const index = lines.findIndex((line) => line.includes(needle));
    if (index < 0) return { text:`Required source literal not found: ${needle}`, line:null };
    const start = Math.max(0,index-radius);
    const end = Math.min(lines.length,index+radius+1);
    return {
      line:index+1,
      text:lines.slice(start,end).map((line,i) => `${String(start+i+1).padStart(4,' ')}  ${line}`).join('\n')
    };
  }

  function collectorSnippet(source) {
    const lines = source.split(/\r?\n/);
    const start = lines.findIndex((line) => line.includes('function inferBatchWindowCollision'));
    const end = start >= 0 ? lines.findIndex((line,index) => index > start && line.includes('async function collect')) : -1;
    if (start < 0) return { text:'Inference function not found in collector source.', line:null };
    return { line:start+1, text:lines.slice(start, end > start ? end : start+38).join('\n') };
  }

  function changeRequestExcerpt(text) {
    const lines = text.split(/\r?\n/);
    const start = lines.findIndex((line) => line.trim() === '## Acceptance Criteria');
    if (start < 0) return text.slice(0,1200);
    const next = lines.findIndex((line,index) => index > start && /^##\s/.test(line));
    return lines.slice(start,next > start ? next : Math.min(lines.length,start+14)).join('\n');
  }

  function fieldRows(record) {
    const pairs = [
      ['Evidence ID',record.id],['Artifact',record.artifact],['Artifact type',record.artifactType],['Line reference',record.lineRef],
      ['Evidence basis',record.evidenceBasis],['Status',record.status],['Validation target',record.validationTarget],['Symbol',record.symbol]
    ].filter(([,value]) => value !== undefined && value !== null && value !== '');
    return `<div class="drawer-fields">${pairs.map(([label,value]) => `<div class="drawer-field"><span>${esc(label)}</span><b>${esc(value)}</b></div>`).join('')}</div>`;
  }

  function detailsFromAssertion(test, phase) {
    const failure = (test.failureMessages || []).join('\n\n');
    return {
      kicker:`${phase} / EXECUTED_LOCAL`, title:test.fullName || test.title || 'Jest assertion', tone:test.status === 'failed' ? 'amber' : '',
      verdict:test.status === 'failed'
        ? 'The preserved Jest receipt records a real failing acceptance check before remediation.'
        : 'The preserved Jest receipt records the same targeted acceptance check passing after remediation.',
      fields:{ id:`jest:${phase.toLowerCase()}:${test.title || test.fullName}`, artifact:test.suite, artifactType:'TEST', lineRef:test.location?.line ? `${test.suite}:${test.location.line}` : null, evidenceBasis:'EXECUTED_LOCAL', status:test.status === 'failed' ? 'OPEN' : 'RESOLVED', validationTarget:'LOCAL', symbol:test.title || test.fullName },
      finding:test.status === 'failed' ? (failure || 'Jest assertion failed.') : 'Jest assertion passed.',
      code:failure || `${test.fullName || test.title}\nstatus: ${test.status}`,
      raw:test,
      links:[['Open test receipt', phase === 'BASELINE' ? 'evidence-pack/baseline/test-results.json' : 'evidence-pack/post-change/test-results.json']]
    };
  }

  function openDrawer(section, detail) {
    const drawer = section.querySelector('.review-drawer');
    const backdrop = section.querySelector('.review-drawer-backdrop');
    const body = drawer.querySelector('.drawer-body');
    drawer.querySelector('.drawer-kicker').textContent = detail.kicker || 'Evidence detail';
    drawer.querySelector('.drawer-title').textContent = detail.title || 'Review evidence';
    const fields = detail.fields ? fieldRows(detail.fields) : '';
    const finding = detail.finding ? `<div class="drawer-section"><h4>Finding / interpretation</h4><p>${esc(detail.finding)}</p></div>` : '';
    const code = detail.code ? `<div class="drawer-section"><h4>${esc(detail.codeLabel || 'Evidence excerpt')}</h4><pre class="drawer-code">${esc(detail.code)}</pre></div>` : '';
    const note = detail.note ? `<div class="drawer-section"><h4>Provenance note</h4><p>${detail.note}</p></div>` : '';
    const links = (detail.links || []).length ? `<div class="drawer-section"><h4>Open source artifact</h4><div class="drawer-links">${detail.links.map(([label,href]) => `<a href="${esc(href)}" target="_blank" rel="noreferrer">${esc(label)} ↗</a>`).join('')}</div></div>` : '';
    const raw = detail.raw ? `<div class="drawer-section"><button class="raw-toggle" type="button">Show raw machine record ↓</button><pre class="drawer-code raw-record">${esc(JSON.stringify(detail.raw,null,2))}</pre></div>` : '';
    body.innerHTML = `<div class="drawer-verdict ${esc(detail.tone || '')}">${esc(detail.verdict || '')}</div>${fields}${finding}${code}${note}${links}${raw}`;
    body.querySelector('.raw-toggle')?.addEventListener('click',(event) => {
      const record = body.querySelector('.raw-record');
      record.classList.toggle('open');
      event.currentTarget.textContent = record.classList.contains('open') ? 'Hide raw machine record ↑' : 'Show raw machine record ↓';
    });
    drawer.classList.add('open'); backdrop.classList.add('open'); drawer.setAttribute('aria-hidden','false');
    drawer.querySelector('.drawer-close').focus();
  }

  function closeDrawer(section) {
    section.querySelector('.review-drawer')?.classList.remove('open');
    section.querySelector('.review-drawer-backdrop')?.classList.remove('open');
    section.querySelector('.review-drawer')?.setAttribute('aria-hidden','true');
  }

  function nodeHtml(id,kind,title,value,note,badge,badgeClass,tone='') {
    return `<button class="chain-node" type="button" data-detail="${esc(id)}" data-tone="${esc(tone)}"><div class="chain-kind"><span>${esc(kind)}</span><span class="chain-badge ${esc(badgeClass)}">${esc(badge)}</span></div><strong class="chain-title">${esc(title)}</strong><code class="chain-value">${esc(value)}</code>${note ? `<small class="chain-note">${esc(note)}</small>` : ''}</button>`;
  }

  function renderManifest(section,loaded) {
    const root = section.querySelector('.artifact-manifest');
    root.innerHTML = ARTIFACTS.map((def) => {
      const ok = loaded.has(def.key);
      return `<a class="${ok ? '' : 'failed'}" href="${esc(def.path)}" target="_blank" rel="noreferrer"><span>${esc(def.label)}</span><b>${esc(def.path)}</b><i>${ok ? 'LOADED' : 'FAILED'}</i></a>`;
    }).join('');
  }

  function buildWorkspace(section,loaded) {
    const baselineTrace = loaded.get('baselineTrace').value;
    const postTrace = loaded.get('postTrace').value;
    const baselineTests = loaded.get('baselineTests').value;
    const postTests = loaded.get('postTests').value;
    const changeRequest = loaded.get('changeRequest').value;
    const rpgSource = loaded.get('rpgSource').value;
    const clSource = loaded.get('clSource').value;
    const collectorSource = loaded.get('collectorSource').value;

    const collision = baselineTrace.find((finding) => finding.id === 'inferred-fulmnt-batch-window-collision');
    const baselinePreferred = findAssertion(baselineTests,['preferred','17:00']);
    const postPreferred = findAssertion(postTests,['preferred','17:00']);
    const pending = assertionRows(postTests).filter((test) => test.status === 'pending');
    const rpgEvidence = postTrace.find((finding) => finding.artifact === 'orderpro/rpgle/ORDPRC.rpgle' && ((finding.finding || '').includes('Preferred') || (finding.lineRef || '').endsWith(':49')));
    const clEvidence = postTrace.find((finding) => finding.artifact === 'orderpro/clle/FULMNT.clle' && (/(181500)/.test(finding.finding || '') || /(181500)/.test(finding.symbol || '')))
      || postTrace.find((finding) => finding.artifact === 'orderpro/clle/FULMNT.clle' && finding.validationTarget === 'IBM_I');

    const requiredDerived = [collision,baselinePreferred,postPreferred,rpgEvidence,clEvidence];
    if (requiredDerived.some((value) => !value)) throw new Error('Required evidence record could not be resolved from the loaded artifacts. Review workspace intentionally stopped instead of substituting canned proof.');

    const baseCounts = testCounts(baselineTests);
    const postCounts = testCounts(postTests);
    const rpgSnippet = sourceSnippet(rpgSource,"if inCusCls = 'P';",4);
    const clSnippet = sourceSnippet(clSource,'SCDTIME(181500)',5);
    const inferenceCode = collectorSnippet(collectorSource);
    const requestExcerpt = changeRequestExcerpt(changeRequest);

    const details = new Map();
    details.set('request',{ kicker:'INPUT / CHANGE_REQUEST.md',title:'CHG-0042 acceptance criteria',verdict:'The review chain begins with the submitted change request, loaded directly from the repository.',fields:{id:'CHG-0042',artifact:'CHANGE_REQUEST.md',artifactType:'DOC',lineRef:'Acceptance Criteria',evidenceBasis:'INPUT_DOCUMENT',status:'REQUESTED',validationTarget:'N/A',symbol:'Preferred expedited cutoff'},finding:'Preferred customers may submit expedited orders through 18:00; Standard customers remain at 16:00.',code:requestExcerpt,codeLabel:'Fetched change request excerpt',links:[['Open CHANGE_REQUEST.md','CHANGE_REQUEST.md']] });
    details.set('baseline-test',detailsFromAssertion(baselinePreferred,'BASELINE'));
    details.set('collision',{ kicker:'BASELINE / INFERRED',title:'Potential batch-window collision',tone:'amber',verdict:'This is the actual preserved ChangeProof finding that stops the literal ticket implementation from being treated as release-ready.',fields:collision,finding:collision.finding,code:`${collision.lineRef}\n${collision.symbol}`,codeLabel:'Preserved baseline evidence reference',raw:collision,note:'The baseline engine stored the detected <code>SCDTIME(180000)</code> literal and the cross-artifact conclusion in the same INFERRED finding. This viewer does not invent parent IDs; it reconstructs the review path from the preserved change request, this evidence record, and the Jest receipt.',links:[['Open baseline traceability','evidence-pack/baseline/traceability.json'],['Open baseline Evidence Pack','evidence-pack/baseline/evidence-pack.html']] });
    details.set('engine-rule',{ kicker:'ENGINE / INFERENCE RULE',title:'How ChangeProof produced the collision finding',verdict:'The HOLD is not hard-coded into the ERP UI. The submitted collector explicitly searches analyzed CL symbols for SCDTIME and emits the collision finding when the requested 18:00 boundary equals the detected 180000 source value.',fields:{id:'inferBatchWindowCollision',artifact:'engine/evidence/collector.js',artifactType:'NODEJS',lineRef:inferenceCode.line ? `engine/evidence/collector.js:${inferenceCode.line}` : null,evidenceBasis:'ENGINE_LOGIC',status:'EXECUTED_DURING_EVIDENCE_BUILD',validationTarget:'LOCAL',symbol:'inferBatchWindowCollision'},finding:'Analyzer correlation rule used to create inferred-fulmnt-batch-window-collision.',code:inferenceCode.text,codeLabel:'Submitted inference implementation',links:[['Open collector.js','engine/evidence/collector.js']] });
    details.set('hold',{ kicker:'REVIEW DECISION',title:'Why the release gate holds',tone:'amber',verdict:'Functional acceptance is only one gate. An OPEN inferred finding tied to the same change request leaves an unresolved operational consequence.',fields:{id:'review:chg-0042:hold',artifact:'derived from preserved evidence',artifactType:'REVIEW_DECISION',evidenceBasis:'DERIVED_VIEW',status:'HOLD',validationTarget:'IBM_I',symbol:'OPEN collision + functional acceptance'},finding:'The browser viewer derives this HOLD from the preserved OPEN collision finding. It is not represented as a separate engine Finding record.',code:`functional evidence: ${baselinePreferred.status}\ncollision evidence: ${collision.id} / ${collision.status}\nvalidation target: ${collision.validationTarget}`,codeLabel:'Decision inputs',note:'This node is intentionally labeled <code>DERIVED_VIEW</code>. It is a reviewer decision rendered from evidence, not a retroactively fabricated traceability record.' });
    details.set('rpg-source',{ kicker:'POST-CHANGE / SOURCE',title:'Preferred cutoff implemented conditionally',verdict:'The submitted RPG source now gives Preferred customers 18:00 while preserving 16:00 for Standard customers.',fields:rpgEvidence,finding:rpgEvidence.finding,code:rpgSnippet.text,codeLabel:'Fetched submitted RPGLE',raw:rpgEvidence,links:[['Open ORDPRC.rpgle','orderpro/rpgle/ORDPRC.rpgle'],['Open post-change traceability','evidence-pack/post-change/traceability.json']] });
    details.set('cl-source',{ kicker:'POST-CHANGE / SOURCE',title:'FULMNT source moved to 18:15',verdict:'The submitted CL source contains SCDTIME(181500), removing the source-level equality with the new Preferred cutoff.',fields:clEvidence,finding:clEvidence.finding,code:clSnippet.text,codeLabel:'Fetched submitted CLLE',raw:clEvidence,links:[['Open FULMNT.clle','orderpro/clle/FULMNT.clle'],['Open post-change traceability','evidence-pack/post-change/traceability.json']] });
    details.set('post-test',detailsFromAssertion(postPreferred,'POST-CHANGE'));
    details.set('boundary',{ kicker:'RESIDUAL / IBM_I',title:'Target validation still required',tone:'purple',verdict:`${pending.length} preserved Jest checks remain pending because they require the IBM i target. ChangeProof does not convert source observation into runtime proof.`,fields:{id:'post-change:ibmi-boundary',artifact:'evidence-pack/post-change/test-results.json',artifactType:'TEST_BOUNDARY',evidenceBasis:'EXECUTED_LOCAL',status:'TARGET_VALIDATION_REQUIRED',validationTarget:'IBM_I',symbol:`${pending.length} pending target checks`},finding:pending.map((test) => test.fullName || test.title).join(' | '),code:pending.map((test,index) => `${index+1}. ${test.fullName || test.title}\n   status: ${test.status}`).join('\n\n'),codeLabel:'Preserved pending target checks',raw:pending,links:[['Open post-change test receipt','evidence-pack/post-change/test-results.json']] });

    section.querySelector('.review-trustbar').innerHTML = `<div><span>Evidence source</span><strong class="artifact-health"><i></i>${loaded.size}/${ARTIFACTS.length} repository artifacts loaded</strong></div><div><span>Baseline findings</span><strong>${baselineTrace.length} machine records</strong></div><div><span>Post-change findings</span><strong>${postTrace.length} machine records</strong></div><div><span>Rendering rule</span><strong>NO EVIDENCE → NO CHAIN</strong></div>`;
    section.querySelector('.live-proof').textContent = 'LIVE ARTIFACT RENDER';
    section.querySelector('.review-summary').innerHTML = `
      <div class="review-summary-panel"><div class="review-summary-label"><span>Preserved evidence</span><b>BASELINE</b></div><div class="review-metric"><strong>${baseCounts.passed}</strong><small>passing</small></div><div class="review-metric"><strong class="bad">${baseCounts.failed}</strong><small>failing</small></div><div class="review-metric"><strong>${baseCounts.pending}</strong><small>IBM i pending</small></div></div>
      <div class="review-summary-panel"><div class="review-summary-label"><span>Preserved evidence</span><b>POST-CHANGE</b></div><div class="review-metric"><strong>${postCounts.passed}</strong><small>passing</small></div><div class="review-metric"><strong class="good">${postCounts.failed}</strong><small>failing</small></div><div class="review-metric"><strong>${postCounts.pending}</strong><small>IBM i pending</small></div></div>`;

    section.querySelector('.evidence-chain').innerHTML = `
      <div class="chain-stage"><div class="chain-stage-label"><span>01 / INPUT</span><strong>What was asked?</strong></div><div class="chain-stage-body"><div class="chain-row single">${nodeHtml('request','Change request','CHG-0042','Preferred expedited cutoff → 18:00','Standard remains 16:00','INPUT','observed')}</div></div></div>
      <div class="chain-stage"><div class="chain-stage-label"><span>02 / BASELINE</span><strong>What did we observe?</strong></div><div class="chain-stage-body"><div class="chain-row">${nodeHtml('baseline-test','Execution receipt','Acceptance test before change',`${baselinePreferred.status.toUpperCase()} / expected 201, received 422`,'Preferred expedited @ 17:00','EXECUTED_LOCAL','executed','red')}${nodeHtml('collision','Machine finding',collision.id,collision.symbol,collision.lineRef,'INFERRED','inferred','amber')}</div><div class="chain-merge"><i></i><span>correlate ticket + evidence</span><i></i></div><div class="chain-row single">${nodeHtml('engine-rule','Inference engine','Why did ChangeProof flag this?','inferBatchWindowCollision()','Submitted engine/evidence/collector.js','ENGINE LOGIC','observed')}</div></div></div>
      <div class="chain-stage"><div class="chain-stage-label"><span>03 / DECISION</span><strong>Why HOLD?</strong></div><div class="chain-stage-body"><div class="chain-row single">${nodeHtml('hold','Reviewer decision','Functional criterion can pass; release still holds','OPEN collision → RELEASE HOLD','Derived transparently from preserved evidence','DERIVED_VIEW','inferred','amber')}</div></div></div>
      <div class="chain-stage"><div class="chain-stage-label"><span>04 / REMEDIATE</span><strong>What changed?</strong></div><div class="chain-stage-body"><div class="chain-row">${nodeHtml('rpg-source','Submitted source','RPG business rule',"CUSCLS='P' → 180000 / else 160000",rpgEvidence.lineRef,'OBSERVED_SOURCE','observed','green')}${nodeHtml('cl-source','Submitted source','CL schedule literal','SCDTIME(181500)',clEvidence.lineRef || 'orderpro/clle/FULMNT.clle','OBSERVED_SOURCE','observed','green')}</div></div></div>
      <div class="chain-stage"><div class="chain-stage-label"><span>05 / RE-RUN</span><strong>What did we prove?</strong></div><div class="chain-stage-body"><div class="chain-row single">${nodeHtml('post-test','Execution receipt','Same targeted acceptance check',`${postPreferred.status.toUpperCase()} / Preferred expedited @ 17:00`,'Preserved Jest post-change receipt','EXECUTED_LOCAL','executed','green')}</div></div></div>
      <div class="chain-stage"><div class="chain-stage-label"><span>06 / RESIDUAL</span><strong>What is unproven?</strong></div><div class="chain-stage-body"><div class="chain-row single">${nodeHtml('boundary','Validation boundary','IBM i runtime claims remain open',`${pending.length} TARGET checks pending`,'Compile / CL execution / target schedule semantics','IBM_I','target','purple')}</div></div></div>`;

    renderManifest(section,loaded);
    section.querySelectorAll('[data-detail]').forEach((node) => node.addEventListener('click',() => openDrawer(section,details.get(node.dataset.detail))));
    section.querySelector('.why-hold')?.addEventListener('click',() => openDrawer(section,details.get('collision')));
    section.querySelector('.review-drawer-backdrop').addEventListener('click',() => closeDrawer(section));
    section.querySelector('.drawer-close').addEventListener('click',() => closeDrawer(section));
    document.addEventListener('keydown',(event) => { if (event.key === 'Escape') closeDrawer(section); });
  }

  async function hydrate(section) {
    const loaded = new Map();
    const results = await Promise.allSettled(ARTIFACTS.map(loadArtifact));
    results.forEach((result,index) => { if (result.status === 'fulfilled') loaded.set(ARTIFACTS[index].key,result.value); });
    renderManifest(section,loaded);

    if (loaded.size !== ARTIFACTS.length) {
      section.querySelector('.review-trustbar').classList.add('failed');
      section.querySelector('.review-trustbar').innerHTML = `<div><span>Evidence source</span><strong class="artifact-health"><i></i>${loaded.size}/${ARTIFACTS.length} repository artifacts loaded</strong></div><div><span>Workspace state</span><strong>CHAIN NOT RENDERED</strong></div><div><span>Trust policy</span><strong>NO CANNED FALLBACK</strong></div><div><span>Action</span><strong>Inspect manifest below</strong></div>`;
      section.querySelector('.live-proof').classList.add('failed');
      section.querySelector('.live-proof').textContent = 'EVIDENCE LOAD FAILED';
      section.querySelector('.review-content').innerHTML = `<div class="review-error"><strong>ChangeProof stopped.</strong> One or more required repository artifacts could not be loaded, so the review chain was not rendered. This is intentional: the UI will not substitute hard-coded evidence.</div>`;
      return;
    }

    try { buildWorkspace(section,loaded); }
    catch (error) {
      section.querySelector('.review-trustbar').classList.add('failed');
      section.querySelector('.live-proof').classList.add('failed');
      section.querySelector('.live-proof').textContent = 'EVIDENCE RESOLUTION FAILED';
      section.querySelector('.review-content').innerHTML = `<div class="review-error"><strong>ChangeProof stopped.</strong> ${esc(error.message)}</div>`;
    }
  }

  function install() {
    if (document.querySelector('#review')) return true;
    const orderpro = document.querySelector('#orderpro-live');
    if (!orderpro) return false;

    const nav = document.querySelector('.site-header nav');
    if (nav && !nav.querySelector('a[href="#review"]')) {
      const link = document.createElement('a'); link.href='#review'; link.textContent='Review';
      const orderLink = nav.querySelector('a[href="#orderpro-live"]');
      if (orderLink) orderLink.insertAdjacentElement('afterend',link); else nav.insertBefore(link,nav.firstChild);
    }

    const hero = document.querySelector('.hero-actions');
    if (hero && !hero.querySelector('.review-hero-link')) {
      const link = document.createElement('a'); link.className='button button-primary review-hero-link'; link.href='#review'; link.innerHTML='Review the evidence <span>↓</span>';
      const first = hero.querySelector('.button-primary'); if (first) first.replaceWith(link); else hero.prepend(link);
    }

    const section = document.createElement('section');
    section.id='review'; section.className='section review-workspace';
    section.innerHTML = `
      <div class="review-head reveal"><div><p class="eyebrow">ChangeProof / Review workspace</p><h2>Don’t trust the warning.<br /><em>Follow its evidence.</em></h2></div><p>This is the actual ChangeProof review surface. It loads the preserved traceability and Jest receipts plus the submitted RPG, CL, change request, and inference engine directly from this repository. Click any node and walk backward to the machine record or source that supports it.</p></div>
      <div class="review-trustbar reveal"><div><span>Evidence source</span><strong class="artifact-health"><i></i>Loading repository artifacts…</strong></div><div><span>Baseline findings</span><strong>—</strong></div><div><span>Post-change findings</span><strong>—</strong></div><div><span>Rendering rule</span><strong>NO EVIDENCE → NO CHAIN</strong></div></div>
      <div class="review-shell reveal"><div class="review-shellbar"><div><b>CHG-0042 / EVIDENCE LINEAGE</b><span>Reviewer: read-only</span></div><span class="live-proof">LOADING EVIDENCE</span></div><div class="review-toolbar"><div class="review-mode"><button aria-selected="true" type="button">Lineage</button><button aria-selected="false" type="button" onclick="location.href='evidence-pack/post-change/evidence-pack.html'">Evidence Pack</button></div><div class="review-actions"><a href="evidence-pack/baseline/traceability.json" target="_blank" rel="noreferrer">Baseline JSON ↗</a><a href="evidence-pack/post-change/traceability.json" target="_blank" rel="noreferrer">Post-change JSON ↗</a></div></div><div class="review-summary"></div><div class="review-content"><div class="review-loading">Loading and resolving <b>repository evidence</b>…</div><div class="evidence-chain"></div></div><div class="review-caveat"><b>Historical integrity</b><p>The repository working tree is post-change. Baseline source facts are shown from the preserved baseline evidence record and test receipt; current RPG/CL excerpts are fetched from submitted post-change source. ChangeProof does not silently present current source as historical source.</p></div></div>
      <div class="evidence-question reveal"><span><strong>Reviewer question:</strong> “Why should this release be held if the requested order test passes?”</span><button class="why-hold" type="button">Show the machine finding →</button></div>
      <div class="artifact-manifest reveal" aria-label="Evidence artifact manifest"></div>
      <div class="review-drawer-backdrop" aria-hidden="true"></div><aside class="review-drawer" aria-hidden="true" aria-label="Evidence detail"><div class="drawer-head"><div><span class="drawer-kicker">Evidence detail</span><strong class="drawer-title">Review evidence</strong></div><button class="drawer-close" type="button" aria-label="Close evidence detail">×</button></div><div class="drawer-body"></div></aside>`;
    orderpro.insertAdjacentElement('afterend',section);
    hydrate(section);
    return true;
  }

  if (!install()) {
    const observer = new MutationObserver(() => { if (install()) observer.disconnect(); });
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }
})();