(() => {
  const customers = [
    { id:'1000001', name:'Hartwell Manufacturing Ltd', address:'14 Forge Road, Steelton PA 17113', cls:'P', credit:50000, status:'A' },
    { id:'1000002', name:'Brennan Office Supplies Co', address:'88 Stationery Ave, Inkdale OH 44101', cls:'P', credit:35000, status:'A' },
    { id:'1000003', name:'Crestview General Goods Inc', address:'3 Commerce Blvd, Plainfield NJ 07060', cls:'S', credit:20000, status:'A' },
    { id:'1000004', name:'Dunmore Retail Partners', address:'55 Market St, Dunmore PA 18512', cls:'S', credit:15000, status:'A' },
    { id:'1000005', name:'Elmridge Distribution Corp', address:'901 Warehouse Row, Elmridge KY 40601', cls:'S', credit:25000, status:'I' }
  ];
  const items = [
    { id:'ITM0001', name:'Steel Hex Bolts M8x25mm', onHand:500, allocated:40, available:460, price:12.50 },
    { id:'ITM0002', name:'Nylon Cable Ties 200mm', onHand:2000, allocated:150, available:1850, price:4.50 },
    { id:'ITM0003', name:'Industrial Work Gloves L', onHand:300, allocated:20, available:280, price:18.00 },
    { id:'ITM0004', name:'Safety Goggles Clear Lens', onHand:180, allocated:10, available:170, price:11.50 },
    { id:'ITM0005', name:'Packing Tape 50mm x 100m', onHand:600, allocated:0, available:600, price:5.80 }
  ];
  const orders = [
    ['2000010','1000005','S','S','15:00','O',210.00],['2000009','1000001','P','E','17:00','O',3200.00],['2000008','1000004','S','E','13:00','O',145.00],['2000007','1000004','S','S','09:00','F',980.00],['2000006','1000003','S','E','17:00','O',560.00],['2000005','1000003','S','E','15:00','O',320.00],['2000004','1000002','P','S','13:00','F',2100.75],['2000003','1000002','P','E','16:15','O',430.00],['2000002','1000001','P','E','15:00','O',875.50],['2000001','1000001','P','E','09:00','F',1250.00]
  ];
  const states = {
    baseline:{title:'Current production',subtitle:'Pre-change behavior with the existing 16:00 expedited cutoff.',preferred:'16:00',batch:'18:00',change:'BASELINE',changeNote:'Ticket not applied',warning:'CHG-0042 proposes an 18:00 Preferred cutoff while the existing FULMNT schedule is already 18:00. The ticket and schedule intersect even before code is changed.',tags:['OBSERVED_SOURCE','INFERRED','IBM_I']},
    requested:{title:'Requested CHG-0042',subtitle:'Naive requested behavior: Preferred customers receive the 18:00 cutoff; batch remains untouched.',preferred:'18:00',batch:'18:00',change:'COLLISION',changeNote:'Requested behavior creates an operational overlap',warning:'The requested customer behavior works, but FULMNT still starts at 18:00. ChangeProof flags the schedule collision that the ticket never mentioned.',tags:['EXECUTED_LOCAL','INFERRED','OPEN','IBM_I']},
    remediated:{title:'ChangeProof remediation',subtitle:'Preferred cutoff remains 18:00 and fulfillment moves to 18:15.',preferred:'18:00',batch:'18:15',change:'REVIEWABLE',changeNote:'Source remediated; target validation remains',warning:'The source-level collision is removed by moving FULMNT to 18:15. RPG, CL, and Db2 runtime behavior still require validation on IBM i.',tags:['EXECUTED_LOCAL','OBSERVED_SOURCE','TARGET_VALIDATION_REQUIRED','IBM_I']}
  };
  let activeState='baseline';

  const $ = (s) => document.querySelector(s);
  const customerSelect=$('#customer'); const itemSelect=$('#item');
  customers.forEach(c=>customerSelect.add(new Option(`${c.id} — ${c.name}`,c.id)));
  items.forEach(i=>itemSelect.add(new Option(`${i.id} — ${i.name}`,i.id)));

  const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
  const hhmmss = t => (t || '00:00').replace(':','')+'00';
  const minutes = t => { const [h,m]=t.split(':').map(Number); return h*60+m; };

  function renderCustomer(){
    const c=customers.find(x=>x.id===customerSelect.value) || customers[0];
    $('#customer-name').textContent=c.name; $('#customer-number').textContent=c.id;
    $('#customer-class').textContent=c.cls; $('#customer-class-text').textContent=c.cls==='P'?'P — Preferred':'S — Standard';
    $('#customer-credit').textContent=money(c.credit); $('#customer-status').textContent=c.status==='A'?'Active':'Inactive'; $('#customer-address').textContent=c.address;
    const cutoff = c.cls==='P' ? states[activeState].preferred : '16:00';
    $('#policy-text').textContent=`Expedited orders accepted through ${cutoff}`;
    $('#result-class').textContent=c.cls;
  }

  function renderInventory(){
    $('#inventory-list').innerHTML=items.map(i=>`<div class="inventory-row"><div><b>${i.id}</b><small>${i.name}</small></div><div class="inventory-qty"><strong>${i.available.toLocaleString()}</strong><span>available</span></div></div>`).join('');
  }

  function renderOrders(){
    $('#orders-body').innerHTML=orders.map(o=>`<tr><td><b>${o[0]}</b></td><td>${o[1]}</td><td class="class-${o[2]}">${o[2]}</td><td>${o[3]==='E'?'Expedited':'Standard'}</td><td>${o[4]}</td><td><span class="order-status ${o[5]}">${o[5]==='F'?'Fulfilled':'Open'}</span></td><td>${money(o[6])}</td></tr>`).join('');
  }

  function renderState(){
    const s=states[activeState];
    $('#scenario-title').textContent=s.title; $('#scenario-subtitle').textContent=s.subtitle;
    $('#kpi-cutoff').textContent=s.preferred; $('#kpi-cutoff-note').textContent=s.preferred==='16:00'?'Same as Standard':'Preferred only / Standard stays 16:00';
    $('#kpi-batch').textContent=s.batch; $('#kpi-change').textContent=s.change; $('#kpi-change-note').textContent=s.changeNote;
    $('#schedule-time').innerHTML=`<b>${s.batch}</b>`;
    const sw=$('#schedule-warning');
    if(activeState==='remediated'){
      sw.classList.add('resolved'); sw.innerHTML='<span>✓</span><p><b>Collision removed in source:</b> FULMNT now starts 15 minutes after the Preferred order window closes.</p>';
    } else {
      sw.classList.remove('resolved'); sw.innerHTML='<span>!</span><p><b>Change intersection:</b> Proposed Preferred cutoff and FULMNT both resolve to 18:00.</p>';
    }
    $('#cp-insight-copy').textContent=s.warning;
    $('#cp-tags').innerHTML=s.tags.map(t=>`<span>${t}</span>`).join('');
    document.querySelectorAll('.scenario-tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.state===activeState?'true':'false'));
    renderCustomer(); resetResult(false);
  }

  function validateOrder(){
    const c=customers.find(x=>x.id===customerSelect.value); const item=items.find(x=>x.id===itemSelect.value);
    const type=$('#order-type').value; const time=$('#order-time').value; const qty=Number($('#quantity').value||0);
    let accepted=true; let detail='Order passed local business-rule validation.';
    if(c.status!=='A'){accepted=false;detail='Customer account is inactive.';}
    else if(qty<=0){accepted=false;detail='Quantity must be greater than zero.';}
    else if(qty>item.available){accepted=false;detail=`Requested quantity exceeds ${item.available} units available.`;}
    else if(type==='E'){
      const cutoff=(c.cls==='P' && activeState!=='baseline')?'18:00':'16:00';
      if(minutes(time)>minutes(cutoff)){accepted=false;detail=`Expedited cutoff exceeded. Effective cutoff for this customer is ${cutoff}.`;}
      else detail=`Expedited order accepted at ${time}; effective cutoff is ${cutoff}.`;
    } else detail='Standard order is not subject to the expedited intraday cutoff.';

    const card=$('#result-card'); card.className=`result-card ${accepted?'success':'error'}`;
    $('.result-icon').textContent=accepted?'✓':'×'; $('#result-title').textContent=accepted?'ORDER ACCEPTED':'ORDER REJECTED'; $('#result-detail').textContent=detail;
    $('#result-type').textContent=type; $('#result-class').textContent=c.cls; $('#result-time').textContent=hhmmss(time);

    if(accepted && activeState==='requested'){
      $('#cp-insight-copy').textContent='The customer-facing change now passes locally, but that success creates a second question: FULMNT still begins at 18:00. Passing the acceptance criterion does not prove the operational change is safe.';
      $('#cp-tags').innerHTML='<span>EXECUTED_LOCAL</span><span>INFERRED</span><span>OPEN</span><span>IBM_I</span>';
    }
    if(accepted && activeState==='remediated'){
      $('#cp-insight-copy').textContent='Local behavior is proven and the source schedule is moved to 18:15. ChangeProof still refuses to claim RPG compile, CL execution, or Db2 runtime validation without the IBM i target.';
      $('#cp-tags').innerHTML='<span>EXECUTED_LOCAL</span><span>OBSERVED_SOURCE</span><span>TARGET_VALIDATION_REQUIRED</span>';
    }
  }

  function resetResult(resetForm=true){
    if(resetForm){customerSelect.value='1000001';$('#order-type').value='E';$('#order-time').value='17:00';itemSelect.value='ITM0001';$('#quantity').value='10';renderCustomer();}
    const card=$('#result-card');card.className='result-card neutral';$('.result-icon').textContent='?';$('#result-title').textContent='Ready to validate';$('#result-detail').textContent='The default scenario uses a Preferred customer submitting an expedited order at 17:00.';
    $('#result-type').textContent=$('#order-type').value;$('#result-class').textContent=(customers.find(x=>x.id===customerSelect.value)||customers[0]).cls;$('#result-time').textContent=hhmmss($('#order-time').value);
    $('#cp-insight-copy').textContent=states[activeState].warning;$('#cp-tags').innerHTML=states[activeState].tags.map(t=>`<span>${t}</span>`).join('');
  }

  document.querySelectorAll('.scenario-tabs button').forEach(b=>b.addEventListener('click',()=>{activeState=b.dataset.state;renderState();}));
  customerSelect.addEventListener('change',()=>{renderCustomer();resetResult(false);});
  $('#order-form').addEventListener('submit',e=>{e.preventDefault();validateOrder();});
  $('#reset-order').addEventListener('click',()=>resetResult(true));
  ['#order-type','#order-time','#quantity','#item'].forEach(sel=>$(sel).addEventListener('change',()=>resetResult(false)));

  if(new URLSearchParams(location.search).get('embed')==='1') document.body.classList.add('embedded');
  renderInventory();renderOrders();renderState();
})();
