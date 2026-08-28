(() => {
  const REQUIRED = [
    ['baselineSummary','examples/timeout-service/evidence-pack/baseline/summary.json'],
    ['literalSummary','examples/timeout-service/evidence-pack/literal/summary.json'],
    ['postSummary','examples/timeout-service/evidence-pack/post-change/summary.json'],
    ['baselineTrace','examples/timeout-service/evidence-pack/baseline/traceability.json'],
    ['literalTrace','examples/timeout-service/evidence-pack/literal/traceability.json'],
    ['postTrace','examples/timeout-service/evidence-pack/post-change/traceability.json'],
    ['baselineTests','examples/timeout-service/evidence-pack/baseline/test-results.json'],
    ['literalTests','examples/timeout-service/evidence-pack/literal/test-results.json'],
    ['postTests','examples/timeout-service/evidence-pack/post-change/test-results.json']
  ];

  const esc = value => String(value ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  async function readJson(path){
    const response = await fetch(path,{cache:'no-store'});
    if(!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.json();
  }

  function testCounts(receipt){
    return {
      passed: Number(receipt.numPassedTests || 0),
      failed: Number(receipt.numFailedTests || 0),
      pending: Number(receipt.numPendingTests || 0)
    };
  }

  function timeoutValues(trace){
    const app = trace.find(f => f.artifact === 'src/service.js' && f.symbol === 'REQUEST_TIMEOUT_SECONDS');
    const proxy = trace.find(f => f.artifact === 'docs/runbook.md' && /^Edge proxy read timeout/i.test(f.symbol || ''));
    const appValue = (app?.finding || '').match(/=\s*(\d+)/)?.[1] || '?';
    const proxyValue = (proxy?.symbol || proxy?.finding || '').match(/(\d+)\s*seconds/i)?.[1] || '?';
    return {app:appValue,proxy:proxyValue};
  }

  function addNav(){
    const nav=document.querySelector('.site-header nav');
    if(!nav || nav.querySelector('a[href="#reuse-proof"]')) return;
    const a=document.createElement('a');
    a.href='#reuse-proof';a.textContent='Reuse';
    const sessions=nav.querySelector('a[href="#sessions"]');
    nav.insertBefore(a,sessions||null);
  }

  function createSection(anchor){
    const section=document.createElement('section');
    section.id='reuse-proof';
    section.className='section reuse-proof';
    section.innerHTML=`
      <div class="reuse-head reveal">
        <div><p class="eyebrow">04 / Reuse proof</p><h2>ORDERPRO is not<br /><em>the product.</em></h2></div>
        <p>A second workload answers the uncomfortable question directly. REPORT-GW has no RPG, CL, DDS, Db2, 5250 surface, or IBM i adapter. The same evidence core processes a small Node.js timeout change and produces a separate CI-generated evidence trail.</p>
      </div>
      <div class="reuse-trust reveal" id="reuse-trust">
        <div><span>Independent receipts</span><strong class="verified"><i></i>Loading CI-generated evidence…</strong></div>
        <div><span>Workloads</span><strong>2 materially different</strong></div>
        <div><span>Evidence model</span><strong>shared Finding / diff / receipts</strong></div>
        <div><span>Presentation fallback</span><strong>none</strong></div>
      </div>
      <div id="reuse-body"><div class="reuse-error"><strong>VERIFYING REUSE PROOF</strong><br />Loading generated REPORT-GW receipts from the public repository.</div></div>
    `;
    anchor.insertAdjacentElement('afterend',section);
    return section;
  }

  function render(section,data){
    const baseline=timeoutValues(data.baselineTrace), literal=timeoutValues(data.literalTrace), post=timeoutValues(data.postTrace);
    const bt=testCounts(data.baselineTests), lt=testCounts(data.literalTests), pt=testCounts(data.postTests);
    const mismatch=data.literalTrace.find(f=>f.id==='inferred-upstream-timeout-ordering');
    const postMismatch=data.postTrace.find(f=>f.id==='inferred-upstream-timeout-ordering');
    if(!mismatch || postMismatch) throw new Error('Generated reuse evidence does not resolve the expected literal/remediated relationship.');

    const trust=section.querySelector('#reuse-trust');
    trust.querySelector('.verified').innerHTML=`<i></i>${REQUIRED.length}/${REQUIRED.length} generated artifacts loaded`;
    trust.children[2].querySelector('strong').textContent=`${data.literalSummary.findingCount} literal findings / ${data.postSummary.findingCount} remediated`;

    section.querySelector('#reuse-body').innerHTML=`
      <div class="reuse-core reveal">
        <article class="reuse-workload">
          <span class="workload-kicker">Reference workload / profile 01</span>
          <h3>ORDERPRO / IBM i brownfield</h3>
          <p>The full hackathon scenario: heterogeneous source, local surrogate execution, inferred operational consequence, and a target-validation boundary.</p>
          <div class="reuse-tags"><span>RPGLE</span><span>CLLE</span><span>DDS</span><span>Db2</span><span>Node.js</span><span class="target">IBM_I</span></div>
        </article>
        <div class="reuse-engine"><div><span>shared implementation</span><strong>evidence/core.js</strong><small>analyzer dispatch<br />Finding semantics<br />Jest receipt ingestion<br />inference plug-ins<br />diff</small></div></div>
        <article class="reuse-workload">
          <span class="workload-kicker">Reuse workload / profile 02</span>
          <h3>REPORT-GW / modern service</h3>
          <p>A deliberately boring Node.js + configuration + runbook workload. No ORDERPRO code and no IBM i-specific path participates.</p>
          <div class="reuse-tags"><span>Node.js</span><span>.conf</span><span>Markdown</span><span>Jest</span><span class="local">LOCAL</span></div>
        </article>
      </div>

      <div class="reuse-flow reveal">
        <div class="reuse-flow-bar"><b>CHG-WEB-017 / Increase application request timeout 30s → 60s</b><span>generated by profile-runner.js</span></div>
        <div class="reuse-states">
          <article class="reuse-state baseline">
            <span class="state-number">01 / Baseline</span><h3>Requested behavior missing</h3>
            <div class="state-pair"><div><span>App timeout</span><b>${esc(baseline.app)}s</b></div><div><span>Proxy timeout</span><b>${esc(baseline.proxy)}s</b></div></div>
            <div class="state-test"><span>Scoped Jest receipt</span><b>${bt.passed} PASS / ${bt.failed} FAIL</b></div>
          </article>
          <article class="reuse-state literal">
            <span class="state-number">02 / Ticket applied literally</span><h3>Acceptance passes. Consequence appears.</h3>
            <div class="state-pair"><div><span>App timeout</span><b>${esc(literal.app)}s</b></div><div><span>Proxy timeout</span><b>${esc(literal.proxy)}s</b></div></div>
            <div class="state-test"><span>Scoped Jest receipt</span><b>${lt.passed} PASS / ${lt.failed} FAIL</b></div>
            <div class="state-finding"><b>INFERRED / OPEN</b>${esc(mismatch.finding)}</div>
          </article>
          <article class="reuse-state post">
            <span class="state-number">03 / Remediated</span><h3>Ordering restored</h3>
            <div class="state-pair"><div><span>App timeout</span><b>${esc(post.app)}s</b></div><div><span>Proxy timeout</span><b>${esc(post.proxy)}s</b></div></div>
            <div class="state-test"><span>Scoped Jest receipt</span><b>${pt.passed} PASS / ${pt.failed} FAIL</b></div>
            <div class="state-finding"><b>MISMATCH REMOVED</b>The remediated evidence set contains no <code>inferred-upstream-timeout-ordering</code> finding.</div>
          </article>
        </div>
      </div>

      <div class="reuse-inspect reveal">
        <article class="reuse-record">
          <div class="reuse-record-head"><div><span>Generated machine record / literal pass</span><strong>${esc(mismatch.id)}</strong></div><a href="examples/timeout-service/evidence-pack/literal/traceability.json" target="_blank" rel="noreferrer">Raw JSON ↗</a></div>
          <dl>
            <div><dt>Artifact</dt><dd>${esc(mismatch.artifact)}</dd></div><div><dt>Line</dt><dd>${esc(mismatch.lineRef)}</dd></div>
            <div><dt>Evidence basis</dt><dd>${esc(mismatch.evidenceBasis)}</dd></div><div><dt>Status</dt><dd>${esc(mismatch.status)}</dd></div>
            <div><dt>Validation target</dt><dd>${esc(mismatch.validationTarget)}</dd></div><div><dt>Symbol</dt><dd>${esc(mismatch.symbol)}</dd></div>
          </dl>
          <p>The browser did not create this finding. GitHub Actions ran <code>npm run reuse-proof</code>, the profile-driven core emitted it, the CI verification asserted its semantics, and the bot committed the resulting receipt.</p>
        </article>
        <article class="reuse-falsifiable">
          <span class="label">Falsifiability test</span><h3>Change the evidence and the conclusion changes.</h3>
          <p>The second example is intentionally synthetic; the result is not predetermined. Remove the proxy constraint, lower the app timeout, change the inference rule, or break the scoped test and the generated evidence no longer has this shape.</p>
          <code>change request
      ↓
workload profile → shared evidence core ← inference plug-in
      ↓                    ↓
scoped Jest receipt   traceability.json
      └──────────→ review / diff</code>
        </article>
      </div>

      <div class="reuse-links reveal">
        <a href="engine/evidence/core.js" target="_blank" rel="noreferrer">Shared core ↗</a>
        <a href="examples/timeout-service/changeproof.profile.js" target="_blank" rel="noreferrer">REPORT-GW profile ↗</a>
        <a href="examples/timeout-service/inference.js" target="_blank" rel="noreferrer">Inference plug-in ↗</a>
        <a href="examples/timeout-service/evidence-pack/literal/evidence-pack.html" target="_blank" rel="noreferrer">Literal evidence pack ↗</a>
        <a href="examples/timeout-service/evidence-pack/post-change/evidence-pack.html" target="_blank" rel="noreferrer">Remediated evidence pack ↗</a>
        <a href="https://github.com/jtflack-grc/changeproof/actions/workflows/reuse-proof.yml" target="_blank" rel="noreferrer">CI proof workflow ↗</a>
      </div>
    `;
  }

  async function hydrate(section){
    try{
      const loaded=await Promise.all(REQUIRED.map(async([key,path])=>[key,await readJson(path)]));
      render(section,Object.fromEntries(loaded));
    }catch(error){
      const trust=section.querySelector('#reuse-trust');
      trust.classList.add('failed');
      trust.querySelector('.verified').innerHTML='<i></i>REUSE PROOF UNAVAILABLE';
      section.querySelector('#reuse-body').innerHTML=`<div class="reuse-error"><strong>NO GENERATED RECEIPTS → NO REUSE CLAIM</strong><br />${esc(error.message)}. ChangeProof will not substitute a canned second-workload story.</div>`;
    }
  }

  function install(){
    if(document.querySelector('#reuse-proof')) return true;
    addNav();
    const anchor=document.querySelector('#review-workspace') || document.querySelector('#orderpro-live');
    if(!anchor) return false;
    const section=createSection(anchor);
    hydrate(section);
    return true;
  }

  if(!install()){
    let attempts=0;
    const timer=setInterval(()=>{
      attempts+=1;
      if(install() || attempts>80) clearInterval(timer);
    },100);
  }
})();
