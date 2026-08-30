(() => {
  const REQUIRED = [
    ['orderpro','ORDERPRO post-change','evidence-pack/post-change/impact.json'],
    ['literal','REPORT-GW literal','examples/timeout-service/evidence-pack/literal/impact.json'],
    ['post','REPORT-GW remediated','examples/timeout-service/evidence-pack/post-change/impact.json']
  ];

  const esc = (value) => String(value ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  async function read(path){
    const response = await fetch(path,{cache:'no-store'});
    if(!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.json();
  }

  function addNav(){
    const nav=document.querySelector('.site-header nav');
    if(!nav || nav.querySelector('a[href="#impact-receipt"]')) return;
    const a=document.createElement('a');
    a.href='#impact-receipt';
    a.textContent='Impact';
    const order=nav.querySelector('a[href="#orderpro-live"]');
    nav.insertBefore(a,order||null);
  }

  function createSection(anchor){
    const section=document.createElement('section');
    section.id='impact-receipt';
    section.className='section impact-receipt';
    section.innerHTML=`
      <div class="impact-head reveal">
        <div><p class="eyebrow">Measured impact / Machine receipt</p><h2>What work did the engine<br /><em>actually remove?</em></h2></div>
        <p>No invented time-saved percentage. ChangeProof records the work it actually performed: configured source surfaces scanned, symbols analyzed, scoped tests executed, evidence produced, reviewer compression, cross-artifact consequences surfaced, and target-only checks deliberately left open.</p>
      </div>
      <div class="impact-trust reveal">
        <div><span>Receipt source</span><strong class="impact-health"><i></i>Loading generated impact receipts…</strong></div>
        <div><span>Claim type</span><strong>MEASURED · NOT MODELED</strong></div>
        <div><span>ROI claim</span><strong>NONE INVENTED</strong></div>
        <div><span>Failure policy</span><strong>NO RECEIPT → NO CLAIM</strong></div>
      </div>
      <div class="impact-body"><div class="impact-loading">Loading machine-generated impact receipts…</div></div>
    `;
    anchor.insertAdjacentElement('afterend',section);
    return section;
  }

  function metric(label,value,note=''){
    return `<div class="impact-metric"><span>${esc(label)}</span><b>${esc(value)}</b>${note?`<small>${esc(note)}</small>`:''}</div>`;
  }

  function render(section,data){
    const order=data.orderpro, literal=data.literal, post=data.post;
    if(!order?.discovery || !literal?.productivitySignals || !post?.productivitySignals) {
      throw new Error('Impact receipt schema incomplete');
    }
    if(!literal.productivitySignals.acceptanceGreenWithOpenInference) {
      throw new Error('Literal reuse receipt does not prove acceptance-green/open-inference behavior');
    }
    if(post.evidence.openInferences !== 0) {
      throw new Error('Remediated reuse receipt still contains an open inference');
    }

    section.querySelector('.impact-health').innerHTML=`<i></i>${REQUIRED.length}/${REQUIRED.length} generated receipts loaded`;
    section.querySelector('.impact-body').innerHTML=`
      <div class="impact-grid reveal">
        <article class="impact-panel order-impact">
          <div class="impact-panel-head"><span>Brownfield review compression</span><strong>ORDERPRO / current submitted tree</strong></div>
          <div class="impact-metrics">
            ${metric('Source files scanned',order.discovery.filesScanned)}
            ${metric('Symbols analyzed',order.discovery.symbolsAnalyzed)}
            ${metric('Scoped tests',`${order.execution.executed}` , `${order.execution.passed} pass · ${order.execution.failed} fail · ${order.execution.pending} target-only`)}
            ${metric('Evidence records',order.evidence.findingsProduced)}
          </div>
          <div class="impact-compression">
            <div><b>${esc(order.evidence.findingsProduced)}</b><span>machine evidence records</span></div>
            <strong>→</strong>
            <div><b>${esc(order.review.primaryRows)}</b><span>primary reviewer rows</span></div>
          </div>
          <p>ChangeProof performs discovery and evidence normalization before the reviewer starts deciding. This is review compression, not a claim that every machine record represents a defect.</p>
          <div class="impact-boundary"><span>Residual work preserved</span><b>${esc(order.evidence.targetValidationRequired)} target-validation records remain explicit</b></div>
          <a href="evidence-pack/post-change/impact.json" target="_blank" rel="noreferrer">Open ORDERPRO impact.json ↗</a>
        </article>

        <article class="impact-panel prevention-impact">
          <div class="impact-panel-head"><span>Rework-prevention signal</span><strong>REPORT-GW / literal ticket</strong></div>
          <div class="impact-passline"><b>${esc(literal.execution.passed)}/${esc(literal.execution.executed)}</b><span>scoped acceptance tests green</span></div>
          <div class="impact-still"><span>and yet</span><strong>${esc(literal.evidence.openInferences)} OPEN cross-artifact inference</strong></div>
          <p>The requested behavior passed, but ChangeProof still surfaced a release-relevant consequence: the application timeout moved to 60 seconds while the upstream proxy remained at 45.</p>
          <div class="impact-transition">
            <div><span>Literal</span><b>acceptance green</b><em>consequence OPEN</em></div>
            <strong>→ remediation →</strong>
            <div><span>Re-run</span><b>${esc(post.execution.passed)}/${esc(post.execution.executed)} tests green</b><em>${esc(post.evidence.openInferences)} open inference</em></div>
          </div>
          <p class="impact-claim"><b>Measured productivity claim:</b> ChangeProof automates discovery, receipt collection, cross-artifact correlation, evidence classification, diffing, and review-pack generation, and in this benchmark it caught a consequence the scoped acceptance checks did not.</p>
          <div class="impact-links"><a href="examples/timeout-service/evidence-pack/literal/impact.json" target="_blank" rel="noreferrer">Literal impact.json ↗</a><a href="examples/timeout-service/evidence-pack/post-change/impact.json" target="_blank" rel="noreferrer">Remediated impact.json ↗</a></div>
        </article>
      </div>
      <div class="impact-foot reveal">
        <span>Pipeline elapsed time is recorded in each receipt for provenance, but is intentionally not presented as “time saved.” CI runtime depends on environment and does not establish human labor savings.</span>
      </div>
    `;
  }

  async function hydrate(section){
    try{
      const entries=await Promise.all(REQUIRED.map(async([key,,path])=>[key,await read(path)]));
      render(section,Object.fromEntries(entries));
    }catch(error){
      section.querySelector('.impact-trust').classList.add('failed');
      section.querySelector('.impact-health').innerHTML='<i></i>IMPACT RECEIPT UNAVAILABLE';
      section.querySelector('.impact-body').innerHTML=`<div class="impact-error"><strong>NO RECEIPT → NO PRODUCTIVITY CLAIM</strong><br />${esc(error.message)}</div>`;
    }
  }

  function install(){
    if(document.querySelector('#impact-receipt')) return true;
    const reuse=document.querySelector('#reuse-proof');
    if(!reuse) return false;
    addNav();
    const section=createSection(reuse);
    hydrate(section);
    return true;
  }

  if(!install()){
    const observer=new MutationObserver(()=>{if(install())observer.disconnect();});
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }
})();
