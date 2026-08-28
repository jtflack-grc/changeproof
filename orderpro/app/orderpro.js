(() => {
  const customers = [
    { id:'1000001', name:'Hartwell Manufacturing Ltd', address:'14 Forge Road, Steelton PA 17113', cls:'P', credit:50000, status:'A' },
    { id:'1000002', name:'Brennan Office Supplies Co', address:'88 Stationery Ave, Inkdale OH 44101', cls:'P', credit:35000, status:'A' },
    { id:'1000003', name:'Crestview General Goods Inc', address:'3 Commerce Blvd, Plainfield NJ 07060', cls:'S', credit:20000, status:'A' },
    { id:'1000004', name:'Dunmore Retail Partners', address:'55 Market St, Dunmore PA 18512', cls:'S', credit:15000, status:'A' },
    { id:'1000005', name:'Elmridge Distribution Corp', address:'901 Warehouse Row, Elmridge KY 40601', cls:'S', credit:25000, status:'I' }
  ];

  const items = [
    { id:'ITM0001', name:'Steel Hex Bolts M8x25mm', onHand:500, allocated:40, available:460, price:12.50, uom:'EA' },
    { id:'ITM0002', name:'Nylon Cable Ties 200mm', onHand:2000, allocated:150, available:1850, price:4.50, uom:'EA' },
    { id:'ITM0003', name:'Industrial Work Gloves L', onHand:300, allocated:20, available:280, price:18.00, uom:'PR' },
    { id:'ITM0004', name:'Safety Goggles Clear Lens', onHand:180, allocated:10, available:170, price:11.50, uom:'EA' },
    { id:'ITM0005', name:'Packing Tape 50mm x 100m', onHand:600, allocated:0, available:600, price:5.80, uom:'RL' }
  ];

  const orders = [
    ['2000010','1000005','S','S','15:00','O',210.00],['2000009','1000001','P','E','17:00','O',3200.00],['2000008','1000004','S','E','13:00','O',145.00],['2000007','1000004','S','S','09:00','F',980.00],['2000006','1000003','S','E','17:00','O',560.00],['2000005','1000003','S','E','15:00','O',320.00],['2000004','1000002','P','S','13:00','F',2100.75],['2000003','1000002','P','E','16:15','O',430.00],['2000002','1000001','P','E','15:00','O',875.50],['2000001','1000001','P','E','09:00','F',1250.00]
  ];

  const states = {
    baseline: {
      title:'01 / Current production',
      subtitle:'Pre-change behavior. Preferred and Standard expedited orders both stop at 16:00.',
      preferred:'16:00', batch:'18:00',
      messageClass:'info', messageTitle:'Baseline loaded.',
      message:'Run the default Preferred expedited order at 17:00 to reproduce the requested behavior gap.',
      operationalStatus:'BASELINE', operationalNote:'CHG-0042 not yet applied.', operationalClass:'',
      releaseStatus:'NO-GO', releaseNote:'Functional acceptance not satisfied.', releaseClass:'',
      impactState:'BASELINE', impactEvidence:'OBSERVED_SOURCE',
      insight:'The current rule rejects Preferred expedited orders after 16:00. Separately, preserved CL source evidence contains SCDTIME(180000) — a fact that becomes material when CHG-0042 is considered.',
      tags:['OBSERVED_SOURCE','IBM_I']
    },
    requested: {
      title:'02 / Ticket applied literally',
      subtitle:'The requested customer-facing rule is applied, but the preserved CL schedule literal is unchanged.',
      preferred:'18:00', batch:'18:00',
      messageClass:'warning', messageTitle:'Functional success is not release approval.',
      message:'The 17:00 Preferred order can now pass, but preserved FULMNT source evidence still contains SCDTIME(180000). Change readiness is HOLD until that source-level collision is remediated.',
      operationalStatus:'HOLD', operationalNote:'18:00 cutoff intersects preserved SCDTIME(180000).', operationalClass:'hold',
      releaseStatus:'HOLD', releaseNote:'Do not release: downstream collision remains open.', releaseClass:'hold',
      impactState:'OPEN COLLISION', impactEvidence:'OBSERVED + INFERRED',
      insight:'This is the key distinction: the acceptance criterion can pass while the release gate remains on HOLD. The ticket changed customer behavior but did not account for the preserved 18:00 CL schedule literal.',
      tags:['EXECUTED_LOCAL','OBSERVED_SOURCE','INFERRED','OPEN','IBM_I']
    },
    remediated: {
      title:'03 / ChangeProof remediation',
      subtitle:'Preferred cutoff remains 18:00; submitted CL source moves the schedule literal to 18:15. Target validation is next.',
      preferred:'18:00', batch:'18:15',
      messageClass:'success', messageTitle:'Source-level collision remediated.',
      message:'Functional behavior passes and submitted FULMNT source now contains SCDTIME(181500). The change may proceed to IBM i target validation; this is not yet production approval.',
      operationalStatus:'SOURCE RESOLVED', operationalNote:'Submitted FULMNT source contains SCDTIME(181500).', operationalClass:'pass',
      releaseStatus:'TARGET CHECK', releaseNote:'Proceed to IBM i validation before release.', releaseClass:'ready',
      impactState:'REMEDIATED', impactEvidence:'TARGET_VALIDATION_REQUIRED',
      insight:'ChangeProof can show local behavior passing and the source-level schedule collision removed. It still refuses to claim RPG compile, CL execution, job submission, or Db2 runtime proof without IBM i.',
      tags:['EXECUTED_LOCAL','OBSERVED_SOURCE','TARGET_VALIDATION_REQUIRED','IBM_I']
    }
  };

  let activeState = 'baseline';
  let lastResult = null;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const customerSelect = $('#customer');
  const itemSelect = $('#item');

  customers.forEach(c => customerSelect.add(new Option(`${c.id} — ${c.name}`, c.id)));
  items.forEach(i => itemSelect.add(new Option(`${i.id} — ${i.name}`, i.id)));

  const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
  const hhmmss = t => (t || '00:00').replace(':','') + '00';
  const minutes = t => { const [h,m] = t.split(':').map(Number); return h * 60 + m; };
  const scheduleLiteral = t => `SCDTIME(${(t || '00:00').replace(':','')}00)`;

  function selectedCustomer(){ return customers.find(c => c.id === customerSelect.value) || customers[0]; }
  function selectedItem(){ return items.find(i => i.id === itemSelect.value) || items[0]; }

  function setStatus(message, kind='ok'){
    $('#status-message').textContent = message;
    const dot = $('.status-ok');
    dot.textContent = '●';
    dot.style.color = kind === 'error' ? '#aa0808' : kind === 'warn' ? '#e9730c' : '#2e8b47';
  }

  function renderCustomer(){
    const c = selectedCustomer();
    $('#customer-name').textContent = c.name;
    $('#customer-number').textContent = c.id;
    $('#customer-class').textContent = c.cls;
    $('#customer-class-text').textContent = c.cls === 'P' ? 'P — Preferred' : 'S — Standard';
    $('#customer-credit').textContent = money(c.credit);
    $('#customer-status').textContent = c.status === 'A' ? 'Active' : 'Inactive';
    $('#customer-address').textContent = c.address;
    const cutoff = c.cls === 'P' ? states[activeState].preferred : '16:00';
    $('#policy-text').textContent = `Expedited orders accepted through ${cutoff}`;
    $('#result-class').textContent = c.cls;
    $('#partner-soldto').textContent = `${c.id} / ${c.name}`;
    $('#partner-shipto').textContent = `${c.id} / ${c.address.split(',')[0]}`;
    $('#partner-payer').textContent = `${c.id} / ${c.name}`;
    renderItemOverview();
    renderScheduleLines();
  }

  function renderInventory(){
    $('#inventory-list').innerHTML = items.map(i => `
      <div class="inventory-row">
        <div><b>${i.id}</b><small>${i.name}</small></div>
        <div class="inventory-qty"><strong>${i.available.toLocaleString()}</strong><span>${i.uom} available</span></div>
      </div>`).join('');
  }

  function renderOrders(){
    $('#orders-body').innerHTML = orders.map(o => `
      <tr><td><b>${o[0]}</b></td><td>${o[1]}</td><td class="class-${o[2]}">${o[2]}</td><td>${o[3] === 'E' ? 'Expedited' : 'Standard'}</td><td>${o[4]}</td><td><span class="order-status ${o[5]}">${o[5] === 'F' ? 'Fulfilled' : 'Open'}</span></td><td>${money(o[6])}</td></tr>`).join('');
  }

  function renderItemOverview(){
    const item = selectedItem();
    const qty = Math.max(0, Number($('#quantity').value || 0));
    $('#item-overview-body').innerHTML = `<tr><td><b>10</b></td><td>${item.id}</td><td>${item.name}</td><td>${qty}</td><td>${item.uom}</td><td>P100</td><td>${money(item.price)}</td><td>${item.available.toLocaleString()} ${item.uom}</td></tr>`;
  }

  function renderScheduleLines(){
    const c = selectedCustomer();
    const cutoff = c.cls === 'P' ? states[activeState].preferred : '16:00';
    const batch = states[activeState].batch;
    const assessment = activeState === 'requested' && c.cls === 'P' ? '<span class="status-chip target">COLLISION</span>' : activeState === 'remediated' ? '<span class="status-chip observed">SOURCE REMEDIATED</span>' : '<span class="status-chip neutral">BASELINE</span>';
    $('#schedule-lines-body').innerHTML = `<tr><td>10</td><td>0001</td><td>2024-11-15</td><td>${Math.max(0,Number($('#quantity').value || 0))}</td><td>${cutoff}</td><td>${scheduleLiteral(batch)}</td><td>${assessment}</td></tr>`;
  }

  function applyGate(el, cls){
    el.classList.remove('pass','fail','hold','ready');
    if (cls) el.classList.add(cls);
  }

  function renderStaticGates(){
    const s = states[activeState];
    $('#gate-operational-status').textContent = s.operationalStatus;
    $('#gate-operational-note').textContent = s.operationalNote;
    applyGate($('#gate-operational'), s.operationalClass);
    $('#gate-target-status').textContent = 'REQUIRED';
    $('#gate-target-note').textContent = 'RPG / CL / Db2 not executed here.';
    applyGate($('#gate-target'), '');
    $('#gate-release-status').textContent = s.releaseStatus;
    $('#gate-release-note').textContent = s.releaseNote;
    applyGate($('#gate-release'), s.releaseClass);
  }

  function renderState(){
    const s = states[activeState];
    lastResult = null;
    $('#scenario-title').textContent = s.title;
    $('#scenario-subtitle').textContent = s.subtitle;
    $$('.scenario-tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.state === activeState ? 'true' : 'false'));

    const message = $('#lifecycle-message');
    message.className = `message-strip ${s.messageClass}`;
    message.innerHTML = `<span class="message-icon">${s.messageClass === 'warning' ? '!' : s.messageClass === 'success' ? '✓' : 'i'}</span><div><b>${s.messageTitle}</b><p>${s.message}</p></div>`;

    $('#gate-functional-status').textContent = 'NOT TESTED';
    $('#gate-functional-note').textContent = 'Submit the default order.';
    applyGate($('#gate-functional'), '');
    renderStaticGates();

    $('#impact-state').textContent = s.impactState;
    $('#impact-rule').textContent = `${s.preferred} Preferred / 16:00 Standard`;
    $('#impact-batch').textContent = scheduleLiteral(s.batch);
    $('#impact-evidence').textContent = s.impactEvidence;
    $('#schedule-time').innerHTML = `<b>${scheduleLiteral(s.batch)}</b>`;

    const warning = $('#schedule-warning');
    if (activeState === 'remediated') {
      warning.classList.add('resolved');
      warning.innerHTML = '<span>✓</span><p><b>Source remediation:</b> submitted FULMNT source contains SCDTIME(181500), beyond the Preferred 18:00 cutoff. IBM i compile/submission/execution confirmation is still required.</p>';
    } else if (activeState === 'requested') {
      warning.classList.remove('resolved');
      warning.innerHTML = '<span>!</span><p><b>Release hold:</b> the Preferred cutoff is 18:00 and preserved FULMNT CL evidence contains SCDTIME(180000). The functional requirement can pass while this inferred source-level collision remains open.</p>';
    } else {
      warning.classList.remove('resolved');
      warning.innerHTML = '<span>!</span><p><b>Observed dependency:</b> preserved FULMNT CL source evidence contains SCDTIME(180000). This becomes material when evaluating CHG-0042.</p>';
    }

    $('#cp-insight-copy').textContent = s.insight;
    $('#cp-tags').innerHTML = s.tags.map(t => `<span>${t}</span>`).join('');
    renderCustomer();
    resetDecision(false);
    setStatus(`${s.title} loaded`);
  }

  function evaluateOrder(){
    const c = selectedCustomer();
    const item = selectedItem();
    const type = $('#order-type').value;
    const time = $('#order-time').value;
    const qty = Number($('#quantity').value || 0);
    let accepted = true;
    let detail = 'Order passed local business-rule validation.';
    let cutoff = 'N/A';

    if (c.status !== 'A') { accepted = false; detail = 'Customer account is inactive.'; }
    else if (qty <= 0) { accepted = false; detail = 'Order quantity must be greater than zero.'; }
    else if (qty > item.available) { accepted = false; detail = `Requested quantity exceeds ${item.available} ${item.uom} available.`; }
    else if (type === 'E') {
      cutoff = c.cls === 'P' ? states[activeState].preferred : '16:00';
      if (minutes(time) > minutes(cutoff)) { accepted = false; detail = `Expedited cutoff exceeded. Effective cutoff for this customer is ${cutoff}.`; }
      else detail = `Expedited order accepted at ${time}; effective cutoff is ${cutoff}.`;
    } else detail = 'Standard order is not subject to the expedited intraday cutoff.';

    return { accepted, detail, cutoff, customer:c, item, type, time, qty };
  }

  function renderDecision(result, simulation=false){
    lastResult = result;
    const functional = $('#functional-result');
    functional.className = `decision-card functional ${result.accepted ? 'success' : 'error'}`;
    $('#functional-state').textContent = result.accepted ? 'PASS' : 'FAIL';
    $('#functional-icon').textContent = result.accepted ? '✓' : '×';
    $('#result-title').textContent = result.accepted ? 'Order acceptance check passed' : 'Order acceptance check failed';
    $('#result-detail').textContent = result.detail;
    $('#result-type').textContent = result.type;
    $('#result-class').textContent = result.customer.cls;
    $('#result-time').textContent = hhmmss(result.time);

    $('#gate-functional-status').textContent = result.accepted ? 'PASS' : 'FAIL';
    $('#gate-functional-note').textContent = result.accepted ? 'Entered order satisfies current local rule.' : result.detail;
    applyGate($('#gate-functional'), result.accepted ? 'pass' : 'fail');

    const release = $('#release-result');
    if (!result.accepted) {
      release.className = 'decision-card release error';
      $('#release-state').textContent = 'BLOCKED';
      $('#release-icon').textContent = '×';
      $('#release-title').textContent = 'Release gate blocked';
      $('#release-detail').textContent = 'The functional test failed, so the change cannot advance.';
      $('#release-rule').textContent = 'Functional acceptance must pass before release review.';
      $('#gate-release-status').textContent = 'NO-GO';
      $('#gate-release-note').textContent = 'Functional acceptance failed.';
      applyGate($('#gate-release'), 'fail');
    } else if (activeState === 'requested') {
      release.className = 'decision-card release hold';
      $('#release-state').textContent = 'HOLD';
      $('#release-icon').textContent = '!';
      $('#release-title').textContent = 'Functional PASS. Release HOLD.';
      $('#release-detail').textContent = 'The customer-facing acceptance criterion is satisfied, but preserved FULMNT source evidence still contains the same 18:00 boundary.';
      $('#release-rule').textContent = 'Do not release while the inferred source-level collision remains OPEN.';
      $('#gate-release-status').textContent = 'HOLD';
      $('#gate-release-note').textContent = 'Acceptance passes; downstream source collision remains open.';
      applyGate($('#gate-release'), 'hold');
      $('#cp-insight-copy').textContent = 'The order test passed. The release did not advance. ChangeProof separates functional acceptance from change readiness and holds CHG-0042 because preserved SCDTIME(180000) evidence still collides with the requested 18:00 cutoff.';
      $('#cp-tags').innerHTML = '<span>EXECUTED_LOCAL</span><span>INFERRED</span><span>OPEN</span><span>IBM_I</span>';
    } else if (activeState === 'remediated') {
      release.className = 'decision-card release ready';
      $('#release-state').textContent = 'TARGET CHECK';
      $('#release-icon').textContent = '→';
      $('#release-title').textContent = 'Advance to IBM i validation';
      $('#release-detail').textContent = 'Functional behavior passes and submitted CL source contains SCDTIME(181500). Target execution remains outstanding.';
      $('#release-rule').textContent = 'Eligible for target validation; not yet approved for production release.';
      $('#gate-release-status').textContent = 'TARGET CHECK';
      $('#gate-release-note').textContent = 'Proceed to IBM i validation before release.';
      applyGate($('#gate-release'), 'ready');
      $('#cp-insight-copy').textContent = 'Functional acceptance passes and submitted FULMNT source moves the schedule literal to 18:15. ChangeProof advances the change to IBM i target validation rather than declaring production success.';
      $('#cp-tags').innerHTML = '<span>EXECUTED_LOCAL</span><span>OBSERVED_SOURCE</span><span>TARGET_VALIDATION_REQUIRED</span><span>IBM_I</span>';
    } else {
      release.className = 'decision-card release neutral';
      $('#release-state').textContent = 'NO-GO';
      $('#release-icon').textContent = '■';
      $('#release-title').textContent = 'CHG-0042 not implemented';
      $('#release-detail').textContent = 'This order passes the current production rule, but the requested change has not been applied.';
      $('#release-rule').textContent = 'Baseline behavior is not evidence that CHG-0042 is complete.';
      $('#gate-release-status').textContent = 'NO-GO';
      $('#gate-release-note').textContent = 'CHG-0042 remains unapplied.';
      applyGate($('#gate-release'), '');
    }

    renderItemOverview();
    renderScheduleLines();
    setStatus(`${simulation ? 'Simulation' : 'Order check'} ${result.accepted ? 'completed successfully' : 'returned an error'}`, result.accepted ? 'ok' : 'error');
  }

  function resetDecision(resetForm=true){
    if (resetForm) {
      customerSelect.value = '1000001';
      $('#order-type').value = 'E';
      $('#order-time').value = '17:00';
      itemSelect.value = 'ITM0001';
      $('#quantity').value = '10';
      renderCustomer();
    }
    lastResult = null;
    const functional = $('#functional-result');
    functional.className = 'decision-card functional neutral';
    $('#functional-state').textContent = 'NOT RUN';
    $('#functional-icon').textContent = '?';
    $('#result-title').textContent = 'Order check not executed';
    $('#result-detail').textContent = 'Default test case: Preferred customer, expedited order, 17:00.';
    $('#result-type').textContent = $('#order-type').value;
    $('#result-class').textContent = selectedCustomer().cls;
    $('#result-time').textContent = hhmmss($('#order-time').value);

    const release = $('#release-result');
    if (activeState === 'requested') {
      release.className = 'decision-card release hold';
      $('#release-state').textContent = 'HOLD'; $('#release-icon').textContent = '!';
      $('#release-title').textContent = 'Release hold already identified';
      $('#release-detail').textContent = 'Preserved FULMNT CL evidence remains at SCDTIME(180000). Functional acceptance may pass, but the inferred source-level collision is already open.';
      $('#release-rule').textContent = 'Functional PASS will not clear this release hold.';
    } else if (activeState === 'remediated') {
      release.className = 'decision-card release ready';
      $('#release-state').textContent = 'TARGET CHECK'; $('#release-icon').textContent = '→';
      $('#release-title').textContent = 'Target validation is the next gate';
      $('#release-detail').textContent = 'Submitted CL source contains SCDTIME(181500); run the functional check, then validate RPG/CL/Db2 on IBM i.';
      $('#release-rule').textContent = 'Source readiness is not production approval.';
    } else {
      release.className = 'decision-card release neutral';
      $('#release-state').textContent = 'NO-GO'; $('#release-icon').textContent = '■';
      $('#release-title').textContent = 'Not eligible for release';
      $('#release-detail').textContent = 'The requested functional behavior has not been implemented.';
      $('#release-rule').textContent = 'Functional acceptance must pass before release review.';
    }
    renderItemOverview();
    renderScheduleLines();
  }

  function switchObjectPanel(panelId){
    $$('.object-tabs button').forEach(btn => btn.classList.toggle('active', btn.dataset.panel === panelId));
    $$('.object-content').forEach(panel => panel.classList.toggle('active', panel.id === panelId));
    setStatus(`View changed to ${panelId.replace('-',' ')}`);
  }

  function executeTransaction(){
    const code = ($('#transaction-code').value || '').trim().toUpperCase();
    if (['ZORD_ENTRY','/NZORD_ENTRY'].includes(code)) {
      $('#transaction-code').value = 'ZORD_ENTRY';
      switchObjectPanel('order-data');
      setStatus('Transaction ZORD_ENTRY loaded');
    } else if (code === 'ZFULMNT_MON') {
      document.querySelector('.job-monitor').scrollIntoView({behavior:'smooth',block:'center'});
      setStatus('Transaction ZFULMNT_MON opened in current session');
    } else if (code === 'ZCHG_CTRL') {
      switchObjectPanel('change-data');
      setStatus('Change package CHG-0042 opened');
    } else setStatus(`Transaction ${code || '(blank)'} is not available in this synthetic workload`, 'warn');
  }

  $$('.scenario-tabs button').forEach(btn => btn.addEventListener('click', () => { activeState = btn.dataset.state; renderState(); }));
  $$('.object-tabs button').forEach(btn => btn.addEventListener('click', () => switchObjectPanel(btn.dataset.panel)));
  $$('.master-tabs button').forEach(btn => btn.addEventListener('click', () => { $$('.master-tabs button').forEach(x => x.classList.remove('active')); btn.classList.add('active'); }));
  customerSelect.addEventListener('change', () => { renderCustomer(); resetDecision(false); });
  itemSelect.addEventListener('change', () => { renderItemOverview(); resetDecision(false); });
  $('#quantity').addEventListener('input', () => { renderItemOverview(); renderScheduleLines(); resetDecision(false); });
  $('#order-type').addEventListener('change', () => resetDecision(false));
  $('#order-time').addEventListener('change', () => { renderScheduleLines(); resetDecision(false); });
  $('#order-form').addEventListener('submit', event => { event.preventDefault(); renderDecision(evaluateOrder(), false); });
  $('#simulate-order').addEventListener('click', () => renderDecision(evaluateOrder(), true));
  $('#reset-order').addEventListener('click', () => resetDecision(true));
  $('#execute-transaction').addEventListener('click', executeTransaction);
  $('#transaction-code').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); executeTransaction(); } });

  if (new URLSearchParams(location.search).get('embed') === '1') document.body.classList.add('embedded');
  renderInventory();
  renderOrders();
  renderState();
})();
