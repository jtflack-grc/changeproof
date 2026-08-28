(() => {
  if (!document.querySelector('link[href^="orderpro-preview.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'orderpro-preview.css?v=20260828-2';
    document.head.appendChild(link);
  }

  const nav = document.querySelector('.site-header nav');
  if (nav && !nav.querySelector('a[href="#orderpro-live"]')) {
    const a = document.createElement('a');
    a.href = '#orderpro-live';
    a.textContent = 'ORDERPRO';
    nav.insertBefore(a, nav.firstChild);
  }

  const heroActions = document.querySelector('.hero-actions');
  if (heroActions && !heroActions.querySelector('.orderpro-hero-link')) {
    const a = document.createElement('a');
    a.className = 'button button-ghost orderpro-hero-link';
    a.href = '#orderpro-live';
    a.innerHTML = 'Run ORDERPRO <span>↓</span>';
    heroActions.appendChild(a);
  }

  const strip = document.querySelector('.signal-strip');
  if (!strip || document.querySelector('#orderpro-live')) return;

  const section = document.createElement('section');
  section.className = 'section orderpro-live';
  section.id = 'orderpro-live';
  section.innerHTML = `
    <div class="orderpro-live-head">
      <div>
        <p class="eyebrow">Live scenario / ORDERPRO</p>
        <h2>First, use the system<br /><em>that needs the change.</em></h2>
      </div>
      <p>
        ORDERPRO is the synthetic brownfield workload behind CHG-0042. Reproduce the old behavior, apply the ticket literally, and then watch ChangeProof separate a passing functional test from a change that still should not ship.
      </p>
    </div>

    <div class="orderpro-frame-shell">
      <div class="orderpro-frame-bar">
        <div><i></i><i></i><i></i><b>ORDERPRO / Enterprise Order Processing Workbench</b></div>
        <span>Interactive synthetic workload</span>
      </div>
      <iframe
        src="orderpro/app/?embed=1"
        title="Interactive ORDERPRO enterprise order-management scenario"
        loading="lazy"
      ></iframe>
    </div>

    <div class="scenario-hint strong-hint">
      <b>Suggested path:</b> leave the defaults at <code>Hartwell / Preferred / Expedited / 17:00</code> and run all three states.
      <span><strong>Step 2 is intentionally a split result:</strong> <code>FUNCTIONAL TEST = PASS</code> while <code>RELEASE GATE = HOLD</code> because FULMNT still starts at 18:00.</span>
    </div>

    <div class="orderpro-live-actions">
      <span class="orderpro-live-note"><span>Scenario only.</span> Synthetic data · local browser simulation · no live IBM i connection.</span>
      <div class="orderpro-live-buttons">
        <a class="orderpro-launch" href="orderpro/app/" target="_blank" rel="noreferrer">Open full workstation ↗</a>
        <a class="orderpro-evidence-link" href="#sessions">Inspect with ChangeProof ↓</a>
      </div>
    </div>
  `;

  strip.insertAdjacentElement('afterend', section);
})();
