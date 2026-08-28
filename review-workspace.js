(() => {
  const REQUIRED = [
    ['baselineTrace','Baseline traceability','evidence-pack/baseline/traceability.json','json'],
    ['postTrace','Post-change traceability','evidence-pack/post-change/traceability.json','json'],
    ['baselineTests','Baseline Jest receipt','evidence-pack/baseline/test-results.json','json'],
    ['postTests','Post-change Jest receipt','evidence-pack/post-change/test-results.json','json'],
    ['changeRequest','Change request','CHANGE_REQUEST.md','text'],
    ['rpgSource','Submitted RPGLE','orderpro/rpgle/ORDPRC.rpgle','text'],
    ['clSource','Submitted CLLE','orderpro/clle/FULMNT.clle','text'],
    ['collectorSource','Inference engine','engine/evidence/collector.js','text']
  ].map(([key,label,path,type]) => ({key,label,path,type}));

  const esc = (v) => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const github = (path) => `https://github.com/jtflack-grc/changeproof/blob/main/${path}`;

  async function load(def){
    const r = await fetch(def.path,{cache:'no-store'});
    if(!r.ok) throw new Error(`${def.path}: HTTP ${r.status}`);
    return {...def,value:def.type==='json' ? await r.json() : await r.text()};
  }

  const assertions = (receipt) => (receipt.testResults||[]).flatMap((suite) =>
    (suite.assertionResults||suite.testResults||[]).map((test) => ({...test,suite:suite.name||suite.testFilePath||''}))
  );
  const findTest = (receipt,terms) => assertions(receipt).find((t) => {
    const hay = `${t.fullName||''} ${t.title||''}`.toLowerCase();
    return terms.every((term) => hay.includes(term.toLowerCase()));
  });
  const counts = (receipt) => {
    const all=assertions(receipt), n=(status)=>all.filter((t)=>t.status===status).length;
    return {passed:Number.isFinite(receipt.numPassedTests)?receipt.numPassedTests:n('passed'),failed:Number.isFinite(receipt.numFailedTests)?receipt.numFailedTests:n('failed'),pending:Number.isFinite(receipt.numPendingTests)?receipt.numPendingTests:n('pending')};
  };
  const failureSummary = (test) => {
    const text=(test.failureMessages||[]).join('\n');
    const expected=text.match(/Expected:\s*([^\n]+)/i)?.[1]?.trim();
    const received=text.match(/Received:\s*([^\n]+)/i)?.[1]?.trim();
    return expected||received ? `FAILED / expected ${expected||'?'} / received ${received||'?'}` : `${(test.status||'unknown').toUpperCase()} / preserved Jest receipt`;
  };
  const snippet = (source,needle,radius=4) => {
    const lines=source.split(/\r?\n/), i=lines.findIndex((line)=>line.includes(needle));
    if(i<0) return {line:null,text:`Required source literal not found: ${needle}`};
    const start=Math.max(0,i-radius), end=Math.min(lines.length,i+radius+1);
    return {line:i+1,text:lines.slice(start,end).map((line,j)=>`${String(start+j+1).padStart(4,' ')}  ${line}`).join('\n')};
  };
  const inferenceSnippet = (source) => {
    const lines=source.split(/\r?\n/), start=lines.findIndex((line)=>line.includes('function inferBatchWindowCollision'));
    if(start<0) return {line:null,text:'Inference function not found.'};
    let end=lines.findIndex((line,i)=>i>start&&line.includes('async function collect'));
    if(end<0) end=Math.min(lines.length,start+42);
    return {line:start+1,text:lines.slice(start,end).join('\n')};
  };
  const requestExcerpt = (text) => {
    const lines=text.split(/\r?\n/), start=lines.findIndex((line)=>line.trim()==='## Acceptance Criteria');
    if(start<0) return text.slice(0,1400);
    let end=lines.findIndex((line,i)=>i>start&&/^##\s/.test(line)); if(end<0) end=Math.min(lines.length,start+16);
    return lines.slice(start,end).join('\n');
  };

  function fields(record={}){
    const rows=[['Evidence ID',record.id],['Artifact',record.artifact],['Artifact type',record.artifactType],['Line reference',record.lineRef],['Evidence basis',record.evidenceBasis],['Status',record.status],['Validation target',record.validationTarget],['Symbol',record.symbol]].filter(([,v])=>v!==undefined&&v!==null&&v!=='');
    return `<div class="drawer-fields">${rows.map(([k,v])=>`<div class="drawer-field"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>`;
  }

  function testDetail(test,phase){
    const failure=(test.failureMessages||[]).join('\n\n');
    return {kicker:`${phase} / EXECUTED_LOCAL`,title:test.fullName||test.title||'Jest assertion',tone:test.status==='failed'?'amber':'',verdict:test.status==='failed'?'The preserved Jest receipt records this acceptance check failing before remediation.':'The preserved Jest receipt records the same targeted acceptance check passing after remediation.',record:{id:`jest:${phase.toLowerCase()}:${test.title||test.fullName}`,artifact:test.suite,artifactType:'TEST',lineRef:test.location?.line?`${test.suite}:${test.location.line}`:null,evidenceBasis:'EXECUTED_LOCAL',status:test.status==='failed'?'OPEN':'RESOLVED',validationTarget:'LOCAL',symbol:test.title||test.fullName},finding:test.status==='failed'?(failure||'Jest assertion failed.'):'Jest assertion passed.',code:failure||`${test.fullName||test.title}\nstatus: ${test.status}`,codeLabel:'Preserved Jest receipt',raw:test,links:[['Open test receipt',phase==='BASELINE'?'evidence-pack/baseline/test-results.json':'evidence-pack/post-change/test-results.json']]};
  }

  function openDrawer(section,d){
    if(!d) return;
    const drawer=section.querySelector('.review-drawer'), shade=section.querySelector('.review-drawer-backdrop'), body=drawer.querySelector('.drawer-body');
    drawer.querySelector('.drawer-kicker').textContent=d.kicker||'Evidence detail'; drawer.querySelector('.drawer-title').textContent=d.title||'Review evidence';
    const finding=d.finding?`<div class="drawer-section"><h4>Finding / interpretation</h4><p>${esc(d.finding)}</p></div>`:'';
    const code=d.code?`<div class="drawer-section"><h4>${esc(d.codeLabel||'Evidence excerpt')}</h4><pre class="drawer-code">${esc(d.code)}</pre></div>`:'';
    const note=d.note?`<div class="drawer-section"><h4>Provenance note</h4><p>${d.note}</p></div>`:'';
    const links=(d.links||[]).length?`<div class="drawer-section"><h4>Open source artifact</h4><div class="drawer-links">${d.links.map(([label,href])=>`<a href="${esc(href)}" target="_blank" rel="noreferrer">${esc(label)} ↗</a>`).join('')}</div></div>`:'';
    const raw=d.raw?`<div class="drawer-section"><button class="raw-toggle" type="button">Show raw machine record ↓</button><pre class="drawer-code raw-record">${esc(JSON.stringify(d.raw,null,2))}</pre></div>`:'';
    body.innerHTML=`<div class="drawer-verdict ${esc(d.tone||'')}">${esc(d.verdict||'')}</div>${fields(d.record)}${finding}${code}${note}${links}${raw}`;
    body.querySelector('.raw-toggle')?.addEventListener('click',(e)=>{const r=body.querySelector('.raw-record');r.classList.toggle('open');e.currentTarget.textContent=r.classList.contains('open')?'Hide raw machine record ↑':'Show raw machine record ↓';});
    drawer.classList.add('open');shade.classList.add('open');drawer.setAttribute('aria-hidden','false');drawer.querySelector('.drawer-close').focus();
  }
  function closeDrawer(section){section.querySelector('.review-drawer')?.classList.remove('open');section.querySelector('.review-drawer-backdrop')?.classList.remove('open');section.querySelector('.review-drawer')?.setAttribute('aria-hidden','true');}

  const badgeClass=(basis)=>basis==='EXECUTED_LOCAL'?'executed':basis==='INFERRED'?'inferred':basis==='IBM_I'?'target':'observed';
  const node=(id,kind,title,value,note,badge,tone='')=>`<button class="chain-node" type="button" data-detail="${esc(id)}" data-tone="${esc(tone)}"><div class="chain-kind"><span>${esc(kind)}</span><span class="chain-badge ${badgeClass(badge)}">${esc(badge)}</span></div><strong class="chain-title">${esc(title)}</strong><code class="chain-value">${esc(value)}</code>${note?`<small class="chain-note">${esc(note)}</small>`:''}</button>`;

  function manifest(section,loaded){section.querySelector('.artifact-manifest').innerHTML=REQUIRED.map((def)=>{const ok=loaded.has(def.key);return `<a class="${ok?'':'failed'}" href="${esc(def.path)}" target="_blank" rel="noreferrer"><span>${esc(def.label)}</span><b>${esc(def.path)}</b><i>${ok?'LOADED':'FAILED'}</i></a>`;}).join('');}

  function build(section,loaded){
    const baselineTrace=loaded.get('baselineTrace').value, postTrace=loaded.get('postTrace').value, baselineTests=loaded.get('baselineTests').value, postTests=loaded.get('postTests').value;
    const changeRequest=loaded.get('changeRequest').value, rpgSource=loaded.get('rpgSource').value, clSource=loaded.get('clSource').value, collectorSource=loaded.get('collectorSource').value;
    const collision=baselineTrace.find((f)=>f.id==='inferred-fulmnt-batch-window-collision');
    const baselineTest=findTest(baselineTests,['preferred','17:00']), postTest=findTest(postTests,['preferred','17:00']);
    const pending=assertions(postTests).filter((t)=>t.status==='pending');
    const rpgEvidence=postTrace.find((f)=>f.artifact==='orderpro/rpgle/ORDPRC.rpgle'&&((f.finding||'').includes('Preferred customers')||(f.finding||'').includes('Preferred customer cutoff')));
    const clEvidence=postTrace.find((f)=>f.artifact==='orderpro/clle/FULMNT.clle'&&(/18:15|181500/.test(f.finding||'')||/18:15|181500/.test(f.symbol||'')));
    if([collision,baselineTest,postTest,rpgEvidence,clEvidence].some((v)=>!v)) throw new Error('A required evidence record could not be resolved. ChangeProof stopped rather than substitute canned proof.');

    const base=counts(baselineTests), post=counts(postTests), rpg=snippet(rpgSource,"if inCusCls = 'P';",4), cl=snippet(clSource,'SCDTIME(181500)',5), infer=inferenceSnippet(collectorSource);
    const detail=new Map();
    detail.set('request',{kicker:'INPUT / CHANGE_REQUEST.md',title:'CHG-0042 acceptance criteria',verdict:'The lineage begins with the actual change request fetched from this repository.',record:{id:'CHG-0042',artifact:'CHANGE_REQUEST.md',artifactType:'DOC',lineRef:'Acceptance Criteria',evidenceBasis:'INPUT_DOCUMENT',status:'REQUESTED',validationTarget:'N/A',symbol:'Preferred expedited cutoff'},finding:'Preferred customers may submit expedited orders through 18:00; Standard customers remain at 16:00.',code:requestExcerpt(changeRequest),codeLabel:'Fetched change-request excerpt',links:[['Open CHANGE_REQUEST.md','CHANGE_REQUEST.md']]});
    detail.set('baseline-test',testDetail(baselineTest,'BASELINE'));
    detail.set('collision',{kicker:'BASELINE / INFERRED',title:'Potential batch-window collision',tone:'amber',verdict:'This is the actual preserved ChangeProof finding behind the release HOLD.',record:collision,finding:collision.finding,code:`${collision.lineRef}\n${collision.symbol}`,codeLabel:'Preserved baseline evidence reference',raw:collision,note:'The original engine stored the detected <code>SCDTIME(180000)</code> literal and the cross-artifact conclusion in the same INFERRED record. This viewer does not invent parent IDs; it reconstructs the review path from the preserved ticket, evidence record, and test receipt.',links:[['Open baseline traceability','evidence-pack/baseline/traceability.json'],['Open baseline Evidence Pack','evidence-pack/baseline/evidence-pack.html']]});
    detail.set('engine-rule',{kicker:'ENGINE / INFERENCE RULE',title:'How the finding was produced',verdict:'The HOLD is not hard-coded into the ERP UI. The submitted evidence collector analyzes CL symbols for SCDTIME and emits the collision when the requested 18:00 boundary equals a detected 180000 source value.',record:{id:'inferBatchWindowCollision',artifact:'engine/evidence/collector.js',artifactType:'NODEJS',lineRef:infer.line?`engine/evidence/collector.js:${infer.line}`:null,evidenceBasis:'ENGINE_LOGIC',status:'EXECUTED_DURING_EVIDENCE_BUILD',validationTarget:'LOCAL',symbol:'inferBatchWindowCollision'},finding:'Analyzer correlation rule that creates inferred-fulmnt-batch-window-collision.',code:infer.text,codeLabel:'Submitted inference implementation',links:[['Open collector.js','engine/evidence/collector.js']]});
    detail.set('hold',{kicker:'REVIEW DECISION',title:'Why the release gate holds',tone:'amber',verdict:'Functional acceptance is one gate. An OPEN inferred finding attached to the same change request leaves an unresolved operational consequence.',record:{id:'review:chg-0042:hold',artifact:'derived from preserved evidence',artifactType:'REVIEW_DECISION',evidenceBasis:'DERIVED_VIEW',status:'HOLD',validationTarget:'IBM_I',symbol:'OPEN collision + acceptance evidence'},finding:'The viewer derives HOLD from the preserved OPEN collision record. This is deliberately not represented as a fabricated engine Finding.',code:`acceptance receipt: ${baselineTest.status}\ncollision: ${collision.id}\ncollision status: ${collision.status}\nvalidation target: ${collision.validationTarget}`,codeLabel:'Decision inputs',note:'This node is explicitly labeled <code>DERIVED_VIEW</code>. It is reviewer logic over evidence, not retroactively manufactured traceability.'});
    detail.set('rpg',{kicker:'POST-CHANGE / SOURCE',title:'Preferred rule implemented conditionally',verdict:'Submitted RPG source now gives Preferred customers 18:00 while preserving 16:00 for Standard customers.',record:rpgEvidence,finding:rpgEvidence.finding,code:rpg.text,codeLabel:'Fetched submitted RPGLE',raw:rpgEvidence,links:[['Open ORDPRC.rpgle','orderpro/rpgle/ORDPRC.rpgle'],['Open post-change traceability','evidence-pack/post-change/traceability.json']]});
    detail.set('cl',{kicker:'POST-CHANGE / SOURCE',title:'FULMNT source moved to 18:15',verdict:'Submitted CL source contains SCDTIME(181500), removing the source-level equality with the requested 18:00 cutoff.',record:clEvidence,finding:clEvidence.finding,code:cl.text,codeLabel:'Fetched submitted CLLE',raw:clEvidence,links:[['Open FULMNT.clle','orderpro/clle/FULMNT.clle'],['Open post-change traceability','evidence-pack/post-change/traceability.json']]});
    detail.set('post-test',testDetail(postTest,'POST-CHANGE'));
    detail.set('boundary',{kicker:'RESIDUAL / IBM_I',title:'Target validation remains open',tone:'purple',verdict:`${pending.length} preserved checks remain pending because they require the IBM i target. Source observation is not runtime proof.`,record:{id:'post-change:ibmi-boundary',artifact:'evidence-pack/post-change/test-results.json',artifactType:'TEST_BOUNDARY',evidenceBasis:'EXECUTED_LOCAL',status:'TARGET_VALIDATION_REQUIRED',validationTarget:'IBM_I',symbol:`${pending.length} pending target checks`},finding:pending.map((t)=>t.fullName||t.title).join(' | '),code:pending.map((t,i)=>`${i+1}. ${t.fullName||t.title}\n   status: ${t.status}`).join('\n\n'),codeLabel:'Preserved target-only checks',raw:pending,links:[['Open post-change test receipt','evidence-pack/post-change/test-results.json']]});

    section.querySelector('.review-loading')?.remove();
    section.querySelector('.review-trustbar').innerHTML=`<div><span>Evidence source</span><strong class="artifact-health"><i></i>${loaded.size}/${REQUIRED.length} repository artifacts loaded</strong></div><div><span>Baseline findings</span><strong>${baselineTrace.length} machine records</strong></div><div><span>Post-change findings</span><strong>${postTrace.length} machine records</strong></div><div><span>Rendering rule</span><strong>NO EVIDENCE → NO CHAIN</strong></div>`;
    section.querySelector('.live-proof').textContent='LIVE ARTIFACT RENDER';
    section.querySelector('.review-summary').innerHTML=`<div class="review-summary-panel"><div class="review-summary-label"><span>Preserved evidence</span><b>BASELINE</b></div><div class="review-metric"><strong>${base.passed}</strong><small>passing</small></div><div class="review-metric"><strong class="bad">${base.failed}</strong><small>failing</small></div><div class="review-metric"><strong>${base.pending}</strong><small>IBM i pending</small></div></div><div class="review-summary-panel"><div class="review-summary-label"><span>Preserved evidence</span><b>POST-CHANGE</b></div><div class="review-metric"><strong>${post.passed}</strong><small>passing</small></div><div class="review-metric"><strong class="good">${post.failed}</strong><small>failing</small></div><div class="review-metric"><strong>${post.pending}</strong><small>IBM i pending</small></div></div>`;
    section.querySelector('.evidence-chain').innerHTML=`
      <div class="chain-stage"><div class="chain-stage-label"><span>01 / INPUT</span><strong>What was asked?</strong></div><div class="chain-stage-body"><div class="chain-row single">${node('request','Change request','CHG-0042','Preferred expedited cutoff → 18:00','Standard remains 16:00','INPUT')}</div></div></div>
      <div class="chain-stage"><div class="chain-stage-label"><span>02 / BASELINE</span><strong>What did we observe?</strong></div><div class="chain-stage-body"><div class="chain-row">${node('baseline-test','Execution receipt','Acceptance test before change',failureSummary(baselineTest),'Preferred expedited @ 17:00','EXECUTED_LOCAL','red')}${node('collision','Machine finding',collision.id,collision.symbol,collision.lineRef,'INFERRED','amber')}</div><div class="chain-merge"><i></i><span>correlate ticket + evidence</span><i></i></div><div class="chain-row single">${node('engine-rule','Inference engine','Why did ChangeProof flag this?','inferBatchWindowCollision()','Submitted engine/evidence/collector.js','ENGINE LOGIC')}</div></div></div>
      <div class="chain-stage"><div class="chain-stage-label"><span>03 / DECISION</span><strong>Why HOLD?</strong></div><div class="chain-stage-body"><div class="chain-row single">${node('hold','Reviewer decision','Functional criterion can pass; release still holds','OPEN collision → RELEASE HOLD','Derived transparently from preserved evidence','DERIVED_VIEW','amber')}</div></div></div>
      <div class="chain-stage"><div class="chain-stage-label"><span>04 / REMEDIATE</span><strong>What changed?</strong></div><div class="chain-stage-body"><div class="chain-row">${node('rpg','Submitted source','RPG business rule',"CUSCLS='P' → 180000 / else 160000",rpgEvidence.lineRef,'OBSERVED_SOURCE','green')}${node('cl','Submitted source','CL schedule literal','SCDTIME(181500)',clEvidence.lineRef,'OBSERVED_SOURCE','green')}</div></div></div>
      <div class="chain-stage"><div class="chain-stage-label"><span>05 / RE-RUN</span><strong>What did we prove?</strong></div><div class="chain-stage-body"><div class="chain-row single">${node('post-test','Execution receipt','Same targeted acceptance check',`${(postTest.status||'').toUpperCase()} / Preferred expedited @ 17:00`,'Preserved Jest post-change receipt','EXECUTED_LOCAL','green')}</div></div></div>
      <div class="chain-stage"><div class="chain-stage-label"><span>06 / RESIDUAL</span><strong>What is unproven?</strong></div><div class="chain-stage-body"><div class="chain-row single">${node('boundary','Validation boundary','IBM i runtime claims remain open',`${pending.length} TARGET checks pending`,'Compile / CL execution / target schedule semantics','IBM_I','purple')}</div></div></div>`;
    manifest(section,loaded);
    section.querySelectorAll('[data-detail]').forEach((n)=>n.addEventListener('click',()=>openDrawer(section,detail.get(n.dataset.detail))));
    section.querySelector('.why-hold')?.addEventListener('click',()=>openDrawer(section,detail.get('collision')));
    section.querySelector('.review-drawer-backdrop').addEventListener('click',()=>closeDrawer(section)); section.querySelector('.drawer-close').addEventListener('click',()=>closeDrawer(section));
    document.addEventListener('keydown',(e)=>{if(e.key==='Escape')closeDrawer(section);});
  }

  async function hydrate(section){
    const loaded=new Map(), settled=await Promise.allSettled(REQUIRED.map(load));
    settled.forEach((result,i)=>{if(result.status==='fulfilled')loaded.set(REQUIRED[i].key,result.value);}); manifest(section,loaded);
    if(loaded.size!==REQUIRED.length){section.querySelector('.review-trustbar').classList.add('failed');section.querySelector('.review-trustbar').innerHTML=`<div><span>Evidence source</span><strong class="artifact-health"><i></i>${loaded.size}/${REQUIRED.length} repository artifacts loaded</strong></div><div><span>Workspace state</span><strong>CHAIN NOT RENDERED</strong></div><div><span>Trust policy</span><strong>NO CANNED FALLBACK</strong></div><div><span>Action</span><strong>Inspect manifest below</strong></div>`;section.querySelector('.live-proof').classList.add('failed');section.querySelector('.live-proof').textContent='EVIDENCE LOAD FAILED';section.querySelector('.review-content').innerHTML='<div class="review-error"><strong>ChangeProof stopped.</strong> One or more required repository artifacts could not be loaded, so the review chain was not rendered. The UI will not substitute hard-coded evidence.</div>';return;}
    try{build(section,loaded);}catch(error){section.querySelector('.review-trustbar').classList.add('failed');section.querySelector('.live-proof').classList.add('failed');section.querySelector('.live-proof').textContent='EVIDENCE RESOLUTION FAILED';section.querySelector('.review-content').innerHTML=`<div class="review-error"><strong>ChangeProof stopped.</strong> ${esc(error.message)}</div>`;}
  }

  function install(){
    if(document.querySelector('#review'))return true; const orderpro=document.querySelector('#orderpro-live'); if(!orderpro)return false;
    const nav=document.querySelector('.site-header nav'); if(nav&&!nav.querySelector('a[href="#review"]')){const link=document.createElement('a');link.href='#review';link.textContent='Review';const orderLink=nav.querySelector('a[href="#orderpro-live"]');orderLink?orderLink.insertAdjacentElement('afterend',link):nav.insertBefore(link,nav.firstChild);}
    const hero=document.querySelector('.hero-actions'); if(hero&&!hero.querySelector('.review-hero-link')){const link=document.createElement('a');link.className='button button-primary review-hero-link';link.href='#review';link.innerHTML='Review the evidence <span>↓</span>';const first=hero.querySelector('.button-primary');first?first.replaceWith(link):hero.prepend(link);}
    const section=document.createElement('section');section.id='review';section.className='section review-workspace';section.innerHTML=`<div class="review-head reveal"><div><p class="eyebrow">ChangeProof / Review workspace</p><h2>Don’t trust the warning.<br /><em>Follow its evidence.</em></h2></div><p>This is the actual ChangeProof review surface. It loads the preserved traceability and Jest receipts plus the submitted RPG, CL, change request, and inference engine directly from this repository. Click any node and walk backward to the machine record or source that supports it.</p></div><div class="review-trustbar reveal"><div><span>Evidence source</span><strong class="artifact-health"><i></i>Loading repository artifacts…</strong></div><div><span>Baseline findings</span><strong>—</strong></div><div><span>Post-change findings</span><strong>—</strong></div><div><span>Rendering rule</span><strong>NO EVIDENCE → NO CHAIN</strong></div></div><div class="review-shell reveal"><div class="review-shellbar"><div><b>CHG-0042 / EVIDENCE LINEAGE</b><span>Reviewer: read-only</span></div><span class="live-proof">LOADING EVIDENCE</span></div><div class="review-toolbar"><div class="review-mode"><button aria-selected="true" type="button">Lineage</button><button aria-selected="false" type="button" onclick="location.href='evidence-pack/post-change/evidence-pack.html'">Evidence Pack</button></div><div class="review-actions"><a href="evidence-pack/baseline/traceability.json" target="_blank" rel="noreferrer">Baseline JSON ↗</a><a href="evidence-pack/post-change/traceability.json" target="_blank" rel="noreferrer">Post-change JSON ↗</a></div></div><div class="review-summary"></div><div class="review-content"><div class="review-loading">Loading and resolving <b>repository evidence</b>…</div><div class="evidence-chain"></div></div><div class="review-caveat"><b>Historical integrity</b><p>The repository working tree is post-change. Baseline source facts are shown from the preserved baseline evidence record and test receipt; current RPG/CL excerpts are fetched from submitted post-change source. ChangeProof does not silently present current source as historical source.</p></div></div><div class="evidence-question reveal"><span><strong>Reviewer question:</strong> “Why should this release be held if the requested order test passes?”</span><button class="why-hold" type="button">Show the machine finding →</button></div><div class="artifact-manifest reveal" aria-label="Evidence artifact manifest"></div><div class="review-drawer-backdrop" aria-hidden="true"></div><aside class="review-drawer" aria-hidden="true" aria-label="Evidence detail"><div class="drawer-head"><div><span class="drawer-kicker">Evidence detail</span><strong class="drawer-title">Review evidence</strong></div><button class="drawer-close" type="button" aria-label="Close evidence detail">×</button></div><div class="drawer-body"></div></aside>`;
    orderpro.insertAdjacentElement('afterend',section);hydrate(section);return true;
  }
  if(!install()){const observer=new MutationObserver(()=>{if(install())observer.disconnect();});observer.observe(document.documentElement,{childList:true,subtree:true});}
})();