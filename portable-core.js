(() => {
  const esc = (value) => String(value ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  function addNav(){
    const nav = document.querySelector('.site-header nav');
    if(!nav || nav.querySelector('a[href="#portable-core"]')) return;
    const link = document.createElement('a');
    link.href = '#portable-core';
    link.textContent = 'Core';
    nav.insertBefore(link, nav.firstChild);
  }

  function setHero(){
    const hero = document.querySelector('.hero-actions');
    if(!hero) return;
    let primary = hero.querySelector('.button-primary');
    if(!primary){
      primary = document.createElement('a');
      primary.className = 'button button-primary';
      hero.prepend(primary);
    }
    primary.classList.add('portable-hero-link');
    primary.href = '#portable-core';
    primary.innerHTML = 'See the portable core <span>↓</span>';
  }

  function install(){
    if(document.querySelector('#portable-core')) return true;
    const strip = document.querySelector('.signal-strip');
    if(!strip) return false;

    addNav();
    setHero();

    const section = document.createElement('section');
    section.id = 'portable-core';
    section.className = 'section portable-core';
    section.innerHTML = `
      <div class="portable-head reveal">
        <div>
          <p class="eyebrow">Portable core / What Bob built</p>
          <h2>One evidence engine.<br /><em>Workloads plug in.</em></h2>
        </div>
        <p>
          ChangeProof is a profile-driven change-evidence runtime: point it at a change request, source surfaces, scoped execution receipts, and optional domain inference rules, and it emits the same reviewable evidence model.
        </p>
      </div>

      <div class="portable-thesis reveal">
        <article class="portable-contract">
          <div class="portable-panel-head"><span>Reusable contract</span><b>engine/evidence/core.js</b></div>
          <pre class="portable-code"><span class="fn">collectCore</span>({
  <span class="arg">crPath</span>,                 <span class="comment">// change request</span>
  <span class="arg">repoRoot</span>,
  <span class="arg">patterns</span>,                <span class="plug">// workload supplies</span>
  <span class="arg">testResultsPath</span>,        <span class="plug">// scoped execution receipt</span>
  <span class="arg">pass</span>,
  <span class="arg">inferenceRules</span>,         <span class="plug">// optional plug-ins</span>
  <span class="arg">validationTargetResolver</span>,
  <span class="arg">artifactPathMapper</span>,
  <span class="arg">pendingValidationTarget</span>
})

<span class="comment">// returns common Finding records + symbols + keywords</span></pre>
        </article>

        <article class="portable-boundary">
          <div class="portable-panel-head"><span>Porting boundary</span><b>What changes vs. what stays</b></div>
          <div class="portable-boundary-body">
            <p>A new workload supplies its scope and domain knowledge. The evidence semantics, test ingestion, diffing, and receipt generation remain shared.</p>
            <div class="portable-two-col">
              <div class="portable-list">
                <strong>Shared engine</strong>
                <ul>
                  <li>Finding / evidence semantics</li>
                  <li>Analyzer dispatch</li>
                  <li>Jest receipt ingestion</li>
                  <li>Canonical diff</li>
                  <li>HTML / Markdown / JSON evidence</li>
                </ul>
              </div>
              <div class="portable-list plugs">
                <strong>Workload supplies</strong>
                <ul>
                  <li>Source patterns</li>
                  <li>Scoped tests</li>
                  <li>Inference plug-ins</li>
                  <li>Target mapping</li>
                  <li>Optional artifact canonicalization</li>
                </ul>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div class="portable-pipeline reveal" aria-label="ChangeProof portable execution pipeline">
        <article class="portable-stage"><span>01 / EXECUTE</span><h3>Scoped receipt</h3><p>Run only the workload tests relevant to the change and preserve the machine result.</p><code>test-results.json</code></article>
        <article class="portable-stage"><span>02 / COLLECT</span><h3>Evidence</h3><p>Analyze configured source surfaces and normalize them into the common Finding model.</p><code>collectCore()</code></article>
        <article class="portable-stage"><span>03 / CORRELATE</span><h3>Inference + diff</h3><p>Apply workload rules, then compare evidence across baseline, literal, and remediated states.</p><code>inferenceRules[] + diff()</code></article>
        <article class="portable-stage"><span>04 / REVIEW</span><h3>Evidence pack</h3><p>Emit traceability JSON plus human-readable receipts for release review.</p><code>HTML · MD · JSON</code></article>
      </div>

      <div class="portable-profiles reveal">
        <article class="portable-profile">
          <span class="profile-kicker">Profile 02 / modern service</span>
          <h3>REPORT-GW</h3>
          <p>The clean portability proof: JavaScript, proxy configuration, Markdown runbook, Jest, and a timeout-ordering inference. No IBM i path participates.</p>
          <div class="portable-tags"><span>*.js</span><span>*.conf</span><span>*.md</span><span>Jest</span><span>inferTimeoutOrdering</span><span class="local">LOCAL</span></div>
        </article>
        <div class="portable-arrow"><span>same core</span><b>↔</b><span>different profile</span></div>
        <article class="portable-profile">
          <span class="profile-kicker">Reference workload / brownfield</span>
          <h3>ORDERPRO</h3>
          <p>The harder stress test: mixed Node.js and IBM i artifacts, local execution receipts, an operational timing inference, and explicit target-only validation boundaries.</p>
          <div class="portable-tags"><span>RPGLE</span><span>CLLE</span><span>DDS</span><span>Db2</span><span>Node.js</span><span>inferBatchWindowCollision</span><span class="target">IBM_I</span></div>
        </article>
      </div>

      <div class="portable-port reveal">
        <span>Porting recipe</span>
        <code>fork → add profile + optional analyzer/inference → run profile-runner → review generated evidence</code>
        <div class="portable-links">
          <a href="engine/evidence/core.js" target="_blank" rel="noreferrer">Shared core ↗</a>
          <a href="engine/profile-runner.js" target="_blank" rel="noreferrer">Profile runner ↗</a>
          <a href="examples/timeout-service/changeproof.profile.js" target="_blank" rel="noreferrer">Example profile ↗</a>
          <a href="engine/evidence/collector.js" target="_blank" rel="noreferrer">ORDERPRO specialization ↗</a>
        </div>
      </div>
    `;

    strip.insertAdjacentElement('afterend', section);
    return true;
  }

  if(!install()){
    const observer = new MutationObserver(() => {
      if(install()) observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }
})();
