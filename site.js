(() => {
  const installIronTermExperience = () => {
    if (!document.querySelector('link[href^="ironterm.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'ironterm.css?v=20260828-1';
      document.head.appendChild(link);
    }

    const nav = document.querySelector('.site-header nav');
    if (nav && !nav.querySelector('a[href="#sessions"]')) {
      const sessionLink = document.createElement('a');
      sessionLink.href = '#sessions';
      sessionLink.textContent = 'Sessions';
      const ibmiLink = nav.querySelector('a[href="#ibmi"]');
      nav.insertBefore(sessionLink, ibmiLink || null);
    }

    const ibmiSection = document.querySelector('#ibmi');
    if (!ibmiSection || document.querySelector('#sessions')) return;

    const section = document.createElement('section');
    section.className = 'section ironterm-section';
    section.id = 'sessions';
    section.innerHTML = `
      <div class="ironterm-intro reveal">
        <div>
          <p class="eyebrow">04 / IronTerm evidence sessions</p>
          <h2>Inspect the change<br /><em>on the IBM i surface.</em></h2>
        </div>
        <p>
          Three bounded 5250 fixture replays make the brownfield side of ChangeProof visible: discover the 18:00 schedule, trace the ORDERPRO dependency surface, then verify the remediated 18:15 schedule without overstating target validation.
        </p>
      </div>

      <div class="ironterm-tabs reveal" role="tablist" aria-label="IronTerm evidence sessions">
        <button class="ironterm-tab" role="tab" aria-selected="true" data-session="0"><span>01</span> Discover collision</button>
        <button class="ironterm-tab" role="tab" aria-selected="false" data-session="1"><span>02</span> Trace dependency</button>
        <button class="ironterm-tab" role="tab" aria-selected="false" data-session="2"><span>03</span> Verify remediation</button>
      </div>

      <div class="ironterm-shell reveal" aria-live="polite">
        <div class="ironterm-terminal">
          <div class="ironterm-toolbar">
            <div class="ironterm-toolbar-left">
              <span class="ironterm-led" aria-hidden="true"></span>
              <span class="ironterm-logo">Iron<b>Term</b></span>
              <span class="ironterm-pill">TN5250 / 5292-2</span>
            </div>
            <div class="ironterm-toolbar-right">
              <span class="ironterm-pill">CP037</span>
              <span class="ironterm-pill ironterm-readonly">FIXTURE REPLAY</span>
            </div>
          </div>
          <div class="terminal-bezel">
            <div class="tn5250-screen" id="ironterm-screen" aria-label="5250 fixture screen"></div>
          </div>
        </div>

        <aside class="evidence-rail" id="evidence-rail" aria-label="ChangeProof evidence interpretation"></aside>
      </div>

      <div class="ironterm-controls reveal">
        <span class="session-count" id="session-count">Session 01 / 03</span>
        <div class="session-nav">
          <button type="button" id="session-prev" disabled>← Previous</button>
          <button type="button" id="session-next">Next evidence →</button>
        </div>
      </div>

      <div class="ironterm-note reveal">
        <b>PROVENANCE</b>
        <span>
          Static scenario fixtures; no live TN5250 connection is made from GitHub Pages. Screen structure follows Legacy Control Lab's IBM i 7.4-backed <code>DSPJOBSCDE</code> and <code>DSPPGMREF</code> definitions. IronTerm remains a separate GPL-3.0 work and is not redistributed by ChangeProof. <a href="https://github.com/jtflack-grc/legacy-control-lab" target="_blank" rel="noreferrer">Inspect LCL / IronTerm provenance ↗</a>
        </span>
      </div>
    `;

    ibmiSection.parentNode.insertBefore(section, ibmiSection);

    const sessions = [
      {
        screen: [
          { cls: 'header', text: ' DSPJOBSCDE                  Display Job Schedule Entry                 ORDERPRO' },
          { text: '' },
          { html: '      <span class="field-label">Job schedule entry . . . . . . :</span> <span class="field-value">FULMNT</span>' },
          { html: '      <span class="field-label">User profile . . . . . . . . . :</span> <span class="field-value">ORDERADM</span>' },
          { html: '      <span class="field-label">Status . . . . . . . . . . . . :</span> <span class="field-value">*ENABLED</span>' },
          { html: '      <span class="field-label">Command  . . . . . . . . . . . :</span> <span class="field-value">CALL PGM(ORDERPRO/ORDPRC)</span>' },
          { html: '      <span class="field-label">Frequency  . . . . . . . . . . :</span> <span class="field-value">*DAILY</span>' },
          { html: '      <span class="field-label">Scheduled time  . . . . . . . . :</span> <span class="risk-value">18:00:00</span>' },
          { html: '      <span class="field-label">Text description . . . . . . . :</span> <span class="field-value">Fulfillment batch processing</span>' },
          { text: '' },
          { cls: 'amber', text: '      CHG-0042 requested Preferred expedited order acceptance through 18:00.' },
          { cls: 'amber', text: '      Schedule observation: FULMNT begins at the same boundary.' },
          { text: '' },
          { cls: 'dim', text: '      F3=Exit   F12=Cancel' }
        ],
        rail: {
          kicker: 'SESSION 01 / DISCOVER',
          title: 'The ticket misses the schedule',
          state: 'OPEN',
          stateClass: '',
          facts: [
            ['artifact', 'ORDERPRO / FULMNT'],
            ['screen', 'DSPJOBSCDE'],
            ['observed', '18:00:00', 'amber'],
            ['requirement', 'Preferred cutoff 18:00'],
            ['target', 'IBM_I', 'purple']
          ],
          conclusion: '<strong>Potential batch-window collision.</strong> Fulfillment starts exactly when the new Preferred order window closes. That consequence is not stated in CHG-0042.',
          conclusionClass: '',
          proof: [
            ['evidenceBasis', 'OBSERVED_SOURCE', 'obs'],
            ['correlation', 'INFERRED', 'inf'],
            ['status', 'OPEN', 'inf'],
            ['validationTarget', 'IBM_I', 'target']
          ]
        }
      },
      {
        screen: [
          { cls: 'header', text: ' DSPPGMREF                  Display Program References                 ORDERPRO' },
          { text: '' },
          { html: '      <span class="field-label">Program . . . . . . . . . . . :</span> <span class="field-value">ORDERPRO/ORDPRC</span>' },
          { text: '' },
          { cls: 'hi', text: '      Program      Library     File        Library     Usage' },
          { text: '      ORDPRC       ORDERPRO    CUSMAS      ORDERPRO    Input' },
          { text: '      ORDPRC       ORDERPRO    ORDHED      ORDERPRO    Input/Update' },
          { text: '      ORDPRC       ORDERPRO    ORDLIN      ORDERPRO    Input/Update' },
          { text: '      ORDPRC       ORDERPRO    INVMAS      ORDERPRO    Input/Update' },
          { text: '' },
          { cls: 'dim', text: '      Static fixture shows the data surface ChangeProof correlates with CHG-0042.' },
          { text: '' },
          { cls: 'dim', text: '      F3=Exit   F7=Page up   F8=Page down   F12=Cancel' }
        ],
        rail: {
          kicker: 'SESSION 02 / TRACE',
          title: 'One rule crosses multiple objects',
          state: 'TRACE',
          stateClass: '',
          facts: [
            ['program', 'ORDERPRO/ORDPRC'],
            ['customer', 'CUSMAS / CUSCLS'],
            ['order', 'ORDHED · ORDLIN'],
            ['inventory', 'INVMAS'],
            ['target', 'IBM_I', 'purple']
          ],
          conclusion: '<strong>The requested change is not a single literal.</strong> Customer classification, order state, inventory allocation, and batch behavior sit behind the cutoff decision.',
          conclusionClass: '',
          proof: [
            ['evidenceBasis', 'OBSERVED_SOURCE', 'obs'],
            ['relationship', 'CORRELATED', 'obs'],
            ['status', 'REVIEWED', 'obs'],
            ['validationTarget', 'IBM_I', 'target']
          ]
        }
      },
      {
        screen: [
          { cls: 'header', text: ' DSPJOBSCDE                  Display Job Schedule Entry                 ORDERPRO' },
          { text: '' },
          { html: '      <span class="field-label">Job schedule entry . . . . . . :</span> <span class="field-value">FULMNT</span>' },
          { html: '      <span class="field-label">User profile . . . . . . . . . :</span> <span class="field-value">ORDERADM</span>' },
          { html: '      <span class="field-label">Status . . . . . . . . . . . . :</span> <span class="field-value">*ENABLED</span>' },
          { html: '      <span class="field-label">Command  . . . . . . . . . . . :</span> <span class="field-value">CALL PGM(ORDERPRO/ORDPRC)</span>' },
          { html: '      <span class="field-label">Frequency  . . . . . . . . . . :</span> <span class="field-value">*DAILY</span>' },
          { html: '      <span class="field-label">Scheduled time  . . . . . . . . :</span> <span class="changed-value">18:15:00</span>' },
          { html: '      <span class="field-label">Text description . . . . . . . :</span> <span class="field-value">Fulfillment batch processing</span>' },
          { text: '' },
          { cls: 'hi', text: '      Source remediation observed: FULMNT moved beyond the 18:00 order cutoff.' },
          { cls: 'dim', text: '      Runtime execution still requires the IBM i target.' },
          { text: '' },
          { cls: 'dim', text: '      F3=Exit   F12=Cancel' }
        ],
        rail: {
          kicker: 'SESSION 03 / VERIFY',
          title: 'The source is fixed. The target still matters.',
          state: 'REMEDIATED',
          stateClass: 'resolved',
          facts: [
            ['artifact', 'ORDERPRO / FULMNT'],
            ['observed', '18:15:00', 'green'],
            ['collision', 'REMOVED', 'green'],
            ['runtime', 'NOT EXECUTED HERE'],
            ['target', 'IBM_I', 'purple']
          ],
          conclusion: '<strong>Collision removed in source.</strong> ChangeProof marks the remediation visible, but it does not convert a source observation into a claim that CL executed successfully on IBM i.',
          conclusionClass: 'resolved',
          proof: [
            ['evidenceBasis', 'OBSERVED_SOURCE', 'obs'],
            ['status', 'TARGET_VALIDATION_REQUIRED', 'target'],
            ['source remediation', 'RESOLVED', 'res'],
            ['validationTarget', 'IBM_I', 'target']
          ]
        }
      }
    ];

    let active = 0;
    const screen = section.querySelector('#ironterm-screen');
    const rail = section.querySelector('#evidence-rail');
    const count = section.querySelector('#session-count');
    const prev = section.querySelector('#session-prev');
    const next = section.querySelector('#session-next');
    const tabs = Array.from(section.querySelectorAll('.ironterm-tab'));

    const render = () => {
      const session = sessions[active];
      screen.innerHTML = session.screen.map((line) => {
        const body = line.html || line.text || '&nbsp;';
        return `<div class="screen-line ${line.cls || ''}">${body}</div>`;
      }).join('') + `
        <div class="screen-oia">
          <span class="ready">● READY</span>
          <span>ORDERPRO / FIXTURE</span>
          <span class="pos">R24 C80</span>
        </div>`;

      const r = session.rail;
      rail.innerHTML = `
        <div class="rail-top">
          <div><p>${r.kicker}</p><strong>${r.title}</strong></div>
          <span class="rail-state ${r.stateClass}">${r.state}</span>
        </div>
        <div class="rail-facts">
          ${r.facts.map(([label, value, cls]) => `<div class="rail-fact"><span>${label}</span><b class="${cls || ''}">${value}</b></div>`).join('')}
        </div>
        <div class="rail-conclusion ${r.conclusionClass}">${r.conclusion}</div>
        <div class="rail-proof">
          ${r.proof.map(([label, value, cls]) => `<div class="rail-proof-row"><span>${label}</span><b class="${cls || ''}">${value}</b></div>`).join('')}
        </div>`;

      tabs.forEach((tab, index) => tab.setAttribute('aria-selected', index === active ? 'true' : 'false'));
      count.textContent = `Session 0${active + 1} / 03`;
      prev.disabled = active === 0;
      next.disabled = active === sessions.length - 1;
      next.textContent = active === sessions.length - 1 ? 'End of evidence' : 'Next evidence →';
    };

    tabs.forEach((tab, index) => tab.addEventListener('click', () => { active = index; render(); }));
    prev.addEventListener('click', () => { if (active > 0) { active -= 1; render(); } });
    next.addEventListener('click', () => { if (active < sessions.length - 1) { active += 1; render(); } });
    render();
  };

  installIronTermExperience();

  const reveals = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  const header = document.querySelector('.site-header');
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY;
      if (header) {
        header.style.borderBottomColor = y > 24
          ? 'rgba(105,255,164,.22)'
          : 'rgba(105,255,164,.16)';
      }
    },
    { passive: true }
  );
})();