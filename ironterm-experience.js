(() => {
  const install = () => {
    const ibmiSection = document.querySelector('#ibmi');
    if (!ibmiSection || document.querySelector('#sessions')) return false;

    const nav = document.querySelector('.site-header nav');
    if (nav && !nav.querySelector('a[href="#sessions"]')) {
      const a = document.createElement('a');
      a.href = '#sessions';
      a.textContent = 'Sessions';
      const ibmiLink = nav.querySelector('a[href="#ibmi"]');
      nav.insertBefore(a, ibmiLink || null);
    }

    const ibmiEyebrow = ibmiSection.querySelector('.eyebrow');
    if (ibmiEyebrow && ibmiEyebrow.textContent.trim().startsWith('04 /')) {
      ibmiEyebrow.textContent = ibmiEyebrow.textContent.replace('04 /', '05 /');
    }

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
          These are bounded 5250 fixture replays of source evidence, not a live IBM i session. Session 01 replays the preserved baseline CL schedule literal, Session 02 shows the submitted RPG rule, and Session 03 shows the submitted post-change CL remediation.
        </p>
      </div>

      <div class="ironterm-tabs reveal" role="tablist" aria-label="IronTerm evidence sessions">
        <button class="ironterm-tab" role="tab" aria-selected="true" data-session="0"><span>01</span> Discover schedule literal</button>
        <button class="ironterm-tab" role="tab" aria-selected="false" data-session="1"><span>02</span> Trace RPG rule</button>
        <button class="ironterm-tab" role="tab" aria-selected="false" data-session="2"><span>03</span> Verify CL remediation</button>
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
          <div class="terminal-bezel"><div class="tn5250-screen" id="ironterm-screen" aria-label="5250 source-evidence fixture"></div></div>
        </div>
        <aside class="evidence-rail" id="evidence-rail" aria-label="ChangeProof evidence interpretation"></aside>
      </div>

      <div class="ironterm-controls reveal">
        <span class="session-count" id="session-count">Session 01 / 03</span>
        <div class="session-nav"><button type="button" id="session-prev" disabled>← Previous</button><button type="button" id="session-next">Next evidence →</button></div>
      </div>

      <div class="ironterm-note reveal">
        <b>PROVENANCE</b>
        <span>
          Static evidence replay only. No live TN5250 connection is made from GitHub Pages. The screen structure follows Legacy Control Lab's IBM i source-display conventions. Session 02 and Session 03 quote the submitted ORDERPRO source; Session 01 replays the preserved baseline <code>SCDTIME(180000)</code> evidence. IronTerm remains a separate GPL-3.0 work and is not redistributed by ChangeProof. <a href="https://github.com/jtflack-grc/legacy-control-lab" target="_blank" rel="noreferrer">Inspect LCL / IronTerm provenance ↗</a>
        </span>
      </div>`;

    ibmiSection.parentNode.insertBefore(section, ibmiSection);

    const sessions = [
      {
        screen:[
          ['header',' DSPPFM                   Display Physical File Member                 ORDERPRO'],['',''],
          ['','      <span class="field-label">File  . . . . . . . . . . . . :</span> <span class="field-value">ORDERPRO/QCLSRC</span>'],
          ['','      <span class="field-label">Member  . . . . . . . . . . . :</span> <span class="field-value">FULMNT</span>'],
          ['','      <span class="field-label">Source type . . . . . . . . . :</span> <span class="field-value">CLLE</span>'],
          ['','      <span class="field-label">Evidence state . . . . . . . . :</span> <span class="risk-value">PRE-CHG-0042 BASELINE</span>'],['',''],
          ['dim','      /* Preserved baseline schedule evidence */'],
          ['','      SBMJOB     JOB(FULMNT) JOBD(ORDERPRO/ORDJBD) +'],
          ['','                   CMD(CALL PGM(ORDERPRO/FULMNT)) +'],
          ['amber','                   SCDTIME(180000)'],['',''],
          ['amber','      CHG-0042 requested Preferred expedited acceptance through 18:00.'],
          ['amber','      Correlation: requested cutoff and observed source literal share the same boundary.'],['',''],
          ['dim','      F3=Exit   F7=Page up   F8=Page down   F12=Cancel']
        ],
        rail:{
          kicker:'SESSION 01 / DISCOVER',title:'The ticket misses the CL schedule',state:'OPEN',stateClass:'',
          facts:[['artifact','FULMNT.clle'],['evidence state','PRESERVED BASELINE'],['observed','SCDTIME(180000)','amber'],['requirement','Preferred cutoff 180000'],['target','IBM_I','purple']],
          conclusion:'<strong>Potential batch-window collision.</strong> The baseline CL schedule literal is 18:00, exactly the boundary introduced by CHG-0042. The collision is an inference across two observations; it is not claimed as live runtime state.',
          proof:[['evidenceBasis','OBSERVED_SOURCE','obs'],['correlation','INFERRED','inf'],['status','OPEN','inf'],['validationTarget','IBM_I','target']]
        }
      },
      {
        screen:[
          ['header',' DSPPFM                   Display Physical File Member                 ORDERPRO'],['',''],
          ['','      <span class="field-label">File  . . . . . . . . . . . . :</span> <span class="field-value">ORDERPRO/QRPGLESRC</span>'],
          ['','      <span class="field-label">Member  . . . . . . . . . . . :</span> <span class="field-value">ORDPRC</span>'],
          ['','      <span class="field-label">Source type . . . . . . . . . :</span> <span class="field-value">RPGLE</span>'],
          ['','      <span class="field-label">Text  . . . . . . . . . . . . :</span> <span class="field-value">Core Order Processing Program</span>'],['',''],
          ['dim','      // CHG-0042: Preferred customers have an extended expedited cutoff of 18:00.'],
          ['','      dcl-s cutoff packed(6:0) inz(160000);'],
          ['','      if inOrdTyp &lt;&gt; \'E\';'],['','        return \'1\';'],['','      endif;'],
          ['hi','      if inCusCls = \'P\';'],['hi','        cutoff = 180000;'],['','      else;'],['','        cutoff = 160000;'],['','      endif;'],['',''],
          ['dim','      F3=Exit   F7=Page up   F8=Page down   F12=Cancel']
        ],
        rail:{
          kicker:'SESSION 02 / TRACE',title:'The RPG rule is conditional',state:'OBSERVED',stateClass:'',
          facts:[['artifact','ORDPRC.rpgle'],['procedure','CHKORDCTF'],['order type',"ORDTYP = 'E'"],['customer',"CUSCLS = 'P'"],['cutoff','180000','green']],
          conclusion:'<strong>The business rule is not a blind literal replacement.</strong> Order type, customer class, and order time all participate. Preferred customers get 18:00 while Standard customers remain at 16:00.',
          proof:[['evidenceBasis','OBSERVED_SOURCE','obs'],['source','SUBMITTED RPGLE','obs'],['status','REVIEWED','obs'],['validationTarget','IBM_I','target']]
        }
      },
      {
        screen:[
          ['header',' DSPPFM                   Display Physical File Member                 ORDERPRO'],['',''],
          ['','      <span class="field-label">File  . . . . . . . . . . . . :</span> <span class="field-value">ORDERPRO/QCLSRC</span>'],
          ['','      <span class="field-label">Member  . . . . . . . . . . . :</span> <span class="field-value">FULMNT</span>'],
          ['','      <span class="field-label">Source type . . . . . . . . . :</span> <span class="field-value">CLLE</span>'],
          ['','      <span class="field-label">Evidence state . . . . . . . . :</span> <span class="changed-value">POST-CHG-0042 SOURCE</span>'],['',''],
          ['dim','      /* CHG-0042: move batch beyond Preferred 18:00 cutoff */'],
          ['','      SBMJOB     JOB(FULMNT) JOBD(ORDERPRO/ORDJBD) +'],
          ['','                   CMD(CALL PGM(ORDERPRO/FULMNT)) +'],
          ['hi','                   SCDTIME(181500)'],['',''],
          ['hi','      Source remediation observed: schedule literal moved to 18:15.'],
          ['dim','      Compile/execution behavior is still not proven without the IBM i target.'],['',''],
          ['dim','      F3=Exit   F7=Page up   F8=Page down   F12=Cancel']
        ],
        rail:{
          kicker:'SESSION 03 / VERIFY',title:'Source remediated; target still required',state:'REMEDIATED',stateClass:'resolved',
          facts:[['artifact','FULMNT.clle'],['observed','SCDTIME(181500)','green'],['source collision','REMOVED','green'],['runtime','NOT EXECUTED HERE'],['target','IBM_I','purple']],
          conclusion:'<strong>The submitted CL source moves FULMNT to 18:15.</strong> ChangeProof can resolve the source-level collision without claiming that the job was submitted, compiled, or executed successfully on IBM i.',
          conclusionClass:'resolved',
          proof:[['evidenceBasis','OBSERVED_SOURCE','obs'],['status','TARGET_VALIDATION_REQUIRED','target'],['source remediation','RESOLVED','res'],['validationTarget','IBM_I','target']]
        }
      }
    ];

    let active = 0;
    const screen = section.querySelector('#ironterm-screen');
    const rail = section.querySelector('#evidence-rail');
    const count = section.querySelector('#session-count');
    const prev = section.querySelector('#session-prev');
    const next = section.querySelector('#session-next');
    const tabs = [...section.querySelectorAll('.ironterm-tab')];

    const render = () => {
      const session = sessions[active];
      screen.innerHTML = session.screen.map(([cls,body]) => `<div class="screen-line ${cls}">${body || '&nbsp;'}</div>`).join('') + `<div class="screen-oia"><span class="ready">● READY</span><span>ORDERPRO / EVIDENCE FIXTURE</span><span class="pos">R24 C80</span></div>`;
      const r = session.rail;
      rail.innerHTML = `<div class="rail-top"><div><p>${r.kicker}</p><strong>${r.title}</strong></div><span class="rail-state ${r.stateClass || ''}">${r.state}</span></div><div class="rail-facts">${r.facts.map(([l,v,c]) => `<div class="rail-fact"><span>${l}</span><b class="${c || ''}">${v}</b></div>`).join('')}</div><div class="rail-conclusion ${r.conclusionClass || ''}">${r.conclusion}</div><div class="rail-proof">${r.proof.map(([l,v,c]) => `<div class="rail-proof-row"><span>${l}</span><b class="${c || ''}">${v}</b></div>`).join('')}</div>`;
      tabs.forEach((tab,i) => tab.setAttribute('aria-selected',i === active ? 'true' : 'false'));
      count.textContent = `Session 0${active + 1} / 03`;
      prev.disabled = active === 0;
      next.disabled = active === sessions.length - 1;
      next.textContent = active === sessions.length - 1 ? 'End of evidence' : 'Next evidence →';
    };

    tabs.forEach((tab,i) => tab.addEventListener('click',() => { active = i; render(); }));
    prev.addEventListener('click',() => { if (active > 0) { active--; render(); } });
    next.addEventListener('click',() => { if (active < sessions.length - 1) { active++; render(); } });
    render();
    return true;
  };

  if (!install()) {
    const observer = new MutationObserver(() => { if (install()) observer.disconnect(); });
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }
})();
