/*
  Q-sort v2
  Flow: consent -> presort -> step1 (bank+piles) -> step2 grid -> postsort extremes -> submit
*/

const cfg = window.QSORT_CONFIG;

// Header
document.getElementById('title').textContent = cfg.study?.title || 'Q-sort';
document.getElementById('instructions').textContent = cfg.instructions?.standard || '';

// Panels
const consentPanel = document.getElementById('consent');
const presortPanel = document.getElementById('presort');
const step1Panel = document.getElementById('step1');
const step2Panel = document.getElementById('step2');
const postsortPanel = document.getElementById('postsort');

function showPanel(id){
  [consentPanel, presortPanel, step1Panel, step2Panel, postsortPanel].forEach(
    p => p.classList.add('hidden')
  );
  document.getElementById(id).classList.remove('hidden');
}

// Consent UI
const researchBlurb = document.getElementById('researchBlurb');
const ethicsRef = document.getElementById('ethicsRef');
const infoPdfLink = document.getElementById('infoPdfLink');
const infoWebLink = document.getElementById('infoWebLink');
const chkConsent = document.getElementById('chkConsent');
const btnConsentContinue = document.getElementById('btnConsentContinue');
const status0 = document.getElementById('status0');

// Pre-sort UI
const presortForm = document.getElementById('presortForm');
const btnPreSortContinue = document.getElementById('btnPreSortContinue');

// Step1 UI
const bankStep1 = document.getElementById('bankStep1');
const pileLike = document.getElementById('pileLike');
const pileNeutral = document.getElementById('pileNeutral');
const pileUnlike = document.getElementById('pileUnlike');
const status1 = document.getElementById('status1');
const btnSkipToGrid = document.getElementById('btnSkipToGrid');
const btnToStep2 = document.getElementById('btnToStep2');
const btnRandomize = document.getElementById('btnRandomize');

// Step2 UI
const bankEl = document.getElementById('bank');
const gridEl = document.getElementById('grid');
const status2 = document.getElementById('status2');
const btnValidate = document.getElementById('btnValidate');
const btnExport = document.getElementById('btnExport');

// Post-sort UI
const extremesWrap = document.getElementById('extremesWrap');
const finalComment = document.getElementById('finalComment');
const confidence = document.getElementById('confidence');
const btnSubmit = document.getElementById('btnSubmit');
const status3 = document.getElementById('status3');

// Participant ID
const pidDisplay = document.getElementById('pidDisplay');
const pidHint = document.getElementById('pidHint');
let participantId = null;

function randomId(){
  const prefix = cfg.autoPidPrefix || 'Q';
  const len = cfg.autoPidLength || 10;
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = prefix;
  const buf = new Uint8Array(len);
  if(window.crypto && window.crypto.getRandomValues){
    window.crypto.getRandomValues(buf);
    for(let i=0;i<len;i++) out += alphabet[buf[i] % alphabet.length];
  } else {
    for(let i=0;i<len;i++) out += alphabet[Math.floor(Math.random()*alphabet.length)];
  }
  return out;
}

function initParticipantId(){
  const params = new URLSearchParams(window.location.search);
  const key = cfg.pidQueryParam || 'pid';
  const pid = params.get(key);
  participantId = (pid && pid.trim()) ? pid.trim() : randomId();
  pidDisplay.textContent = participantId;
  pidHint.textContent = (pid && pid.trim())
    ? `ID provided via URL (${key}=${participantId})`
    : 'Random ID generated automatically.';
}

// Helpers
function escapeHtml(str){
  return String(str ?? '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;');
}

function makeCard(stmt){
  const d = document.createElement('div');
  d.className = 'card';
  d.draggable = true;
  d.dataset.num = stmt.num;
  d.innerHTML = `<span class="num">${stmt.num}</span>${escapeHtml(stmt.text)}`;
  d.addEventListener('dragstart', (ev)=>{
    ev.dataTransfer.setData('text/plain', String(stmt.num));
  });
  return d;
}

function enableDropzone(el, onDrop){
  el.addEventListener('dragover', ev => ev.preventDefault());
  el.addEventListener('drop', ev => {
    ev.preventDefault();
    const num = Number(ev.dataTransfer.getData('text/plain'));
    if(Number.isFinite(num)) onDrop(num);
  });
}

// State
const scale = cfg.scale;
const slots = cfg.slots;

const state = {
  study: { title: cfg.study?.title || 'Q-sort', version: cfg.study?.version || 'v2' },
  participant: { participant_id: null, session_id: null },
  started_utc: new Date().toISOString(),
  consent: { given: false, timestamp_utc: null, ethics_ref: cfg.ethics?.approvalRef || 'ETHICS APPROVAL PENDING' },
  presort: {},
  qsort: {
    step1: { used: true, piles_by_statement_number: {} }, // 'bank'|'like'|'neutral'|'unlike'
    forced_distribution: { scale: cfg.scale, slots: cfg.slots },
    placements_by_statement_number: {}
  },
  postsort: { extremes: { plus4: {}, minus4: {} }, overall_confidence: 3, final_comments: '' },
  submission: { completed_utc: null, duration_seconds: null, submitted: false }
};

// Consent init
function initConsent(){
  researchBlurb.innerHTML = cfg.researchBlurbHtml || '';
  ethicsRef.textContent = cfg.ethics?.approvalRef || 'ETHICS APPROVAL PENDING';

  const pdf = cfg.ethics?.infoSheetPdfUrl || 'LINK_TO_PDF_TBC';
  const web = cfg.ethics?.infoSheetWebUrl || 'LINK_TO_WEB_TBC';
  infoPdfLink.href = pdf === 'LINK_TO_PDF_TBC' ? '#' : pdf;
  infoWebLink.href = web === 'LINK_TO_WEB_TBC' ? '#' : web;

  chkConsent.checked = false;
  btnConsentContinue.disabled = true;

  chkConsent.addEventListener('change', ()=> {
    btnConsentContinue.disabled = !chkConsent.checked;
  });

  btnConsentContinue.addEventListener('click', ()=> {
    if(!chkConsent.checked){
      status0.textContent = 'Please tick the consent box to proceed.';
      status0.style.color = '#b00020';
      return;
    }
    state.consent.given = true;
    state.consent.timestamp_utc = new Date().toISOString();
    showPanel('presort');
    renderPreSortForm();
  });
}

// Pre-sort
function renderPreSortForm(){
  presortForm.innerHTML = '';
  const qs = cfg.preSortQuestions || [];

  const preferred = state.presort.interface_language || 'Standard English';
  document.getElementById('instructions').textContent =
    preferred === 'Simplified English' ? (cfg.instructions?.simplified || cfg.instructions?.standard || '') : (cfg.instructions?.standard || '');

  qs.forEach(q=>{
    const wrap = document.createElement('div');
    wrap.className = 'qitem';

    wrap.innerHTML = `<div><b>${escapeHtml(q.label)}</b></div>`;

    let input;
    if(q.type === 'select'){
      input = document.createElement('select');
      input.style.padding = '8px';
      input.style.border = '1px solid #d9d9e8';
      input.style.borderRadius = '8px';
      input.style.width = '100%';

      const opt0 = document.createElement('option');
      opt0.value = '';
      opt0.textContent = 'Select…';
      input.appendChild(opt0);

      (q.options || []).forEach(o=>{
        const op = document.createElement('option');
        op.value = o;
        op.textContent = o;
        input.appendChild(op);
      });

      input.value = state.presort[q.id] ?? '';

    } else if(q.type === 'scale'){
      input = document.createElement('input');
      input.type = 'range';
      input.min = q.min; input.max = q.max;
      input.value = state.presort[q.id] ?? String(Math.round((q.min+q.max)/2));

      const anchors = document.createElement('div');
      anchors.className = 'anchors';
      anchors.innerHTML = `<span>${escapeHtml(q.anchors?.[0] || '')}</span><span>${escapeHtml(q.anchors?.[1] || '')}</span>`;
      wrap.appendChild(anchors);

    } else if(q.type === 'textarea'){
      input = document.createElement('textarea');
      input.rows = 3;
      input.placeholder = q.placeholder || '';
      input.value = state.presort[q.id] ?? '';

    } else { // text
      input = document.createElement('input');
      input.type = 'text';
      input.style.padding = '8px';
      input.style.border = '1px solid #d9d9e8';
      input.style.borderRadius = '8px';
      input.style.width = '100%';
      input.value = state.presort[q.id] ?? '';
    }

    input.addEventListener('input', ()=>{
      state.presort[q.id] = input.value;

      if(q.id === 'interface_language'){
        document.getElementById('instructions').textContent =
          input.value === 'Simplified English'
            ? (cfg.instructions?.simplified || cfg.instructions?.standard || '')
            : (cfg.instructions?.standard || '');
      }

      // If they select "Prefer to self-describe", they can fill gender_self
      if(q.id === 'gender' && input.value !== 'Prefer to self-describe'){
        state.presort.gender_self = '';
        const gs = document.querySelector('[data-qid="gender_self"]');
        if(gs) gs.querySelector('input')?.setAttribute('disabled', 'disabled');
      }
      if(q.id === 'gender' && input.value === 'Prefer to self-describe'){
        const gs = document.querySelector('[data-qid="gender_self"]');
        if(gs) gs.querySelector('input')?.removeAttribute('disabled');
      }
    });

    // Tag for enable/disable logic
    wrap.dataset.qid = q.id;

    wrap.appendChild(input);
    presortForm.appendChild(wrap);
  });

  // Disable gender_self unless chosen
  const g = state.presort.gender;
  const gs = document.querySelector('[data-qid="gender_self"]');
  if(gs){
    const inp = gs.querySelector('input');
    if(inp){
      if(g === 'Prefer to self-describe') inp.removeAttribute('disabled');
      else inp.setAttribute('disabled', 'disabled');
    }
  }
}

btnPreSortContinue.addEventListener('click', ()=>{
  initStep1();
  showPanel('step1');
});

// Step 1 (bank + piles)
function initStep1(){
  // Initialise piles (default bank)
  state.qsort.step1.used = true;
  state.qsort.step1.piles_by_statement_number = {};
  cfg.statements.forEach(s => state.qsort.step1.piles_by_statement_number[s.num] = 'bank');

  enableDropzone(bankStep1, (num)=>{ state.qsort.step1.piles_by_statement_number[num] = 'bank'; renderStep1(); });
  enableDropzone(pileLike, (num)=>{ state.qsort.step1.piles_by_statement_number[num] = 'like'; renderStep1(); });
  enableDropzone(pileNeutral, (num)=>{ state.qsort.step1.piles_by_statement_number[num] = 'neutral'; renderStep1(); });
  enableDropzone(pileUnlike, (num)=>{ state.qsort.step1.piles_by_statement_number[num] = 'unlike'; renderStep1(); });

  renderStep1();
}

function renderStep1(orderOverride=null){
  bankStep1.innerHTML = '';
  pileLike.innerHTML = '';
  pileNeutral.innerHTML = '';
  pileUnlike.innerHTML = '';

  const order = orderOverride || cfg.statements.map(s=>s.num).slice().sort((a,b)=>a-b);
  order.forEach(n=>{
    const stmt = cfg.statements.find(s=>s.num===n);
    const card = makeCard(stmt);
    const p = state.qsort.step1.piles_by_statement_number[n];
    if(p === 'like') pileLike.appendChild(card);
    else if(p === 'neutral') pileNeutral.appendChild(card);
    else if(p === 'unlike') pileUnlike.appendChild(card);
    else bankStep1.appendChild(card);
  });

  const counts = { bank:0, like:0, neutral:0, unlike:0 };
  Object.values(state.qsort.step1.piles_by_statement_number).forEach(v=>counts[v]++);
  status1.textContent = `Bank: ${counts.bank} | Like: ${counts.like} | Neutral: ${counts.neutral} | Unlike: ${counts.unlike}`;
}

btnSkipToGrid.addEventListener('click', ()=>{
  state.qsort.step1.used = false;
  // Set all to bank if skipped
  cfg.statements.forEach(s => state.qsort.step1.piles_by_statement_number[s.num] = 'bank');
  gotoStep2();
});

btnToStep2.addEventListener('click', gotoStep2);

// Step 2 grid
function gotoStep2(){
  // init placements
  state.qsort.placements_by_statement_number = {};
  cfg.statements.forEach(s => state.qsort.placements_by_statement_number[s.num] = null);

  enableDropzone(bankEl, (num)=>{ state.qsort.placements_by_statement_number[num] = null; rerenderStep2(); });

  renderGrid();
  rerenderStep2(buildPreferredBankOrder());

  showPanel('step2');
  status2.textContent = 'Start with your strongest statements (+4 and −4), then work inward. You can move cards anytime.';
  status2.style.color = '#333';
}

function buildPreferredBankOrder(){
  // like first, then neutral+bank, then unlike
  const pile = state.qsort.step1.piles_by_statement_number;
  const like = [], mid = [], unlike = [];
  cfg.statements.forEach(s=>{
    const p = pile[s.num] || 'bank';
    if(p === 'like') like.push(s.num);
    else if(p === 'unlike') unlike.push(s.num);
    else mid.push(s.num);
  });
  return [...like, ...mid, ...unlike];
}

function renderGrid(){
  gridEl.innerHTML = '';
  scale.forEach(score=>{
    const col = document.createElement('div');
    col.className = 'column';
    col.dataset.score = String(score);

    const head = document.createElement('div');
    head.className = 'colhead';
    const total = slots[String(score)];
    head.innerHTML = `<span>${score>=0?'+':''}${score}</span><span class="slotinfo" id="slot-${score}">0/${total}</span>`;

    const body = document.createElement('div');
    body.className = 'colbody dropzone';
    enableDropzone(body, (num)=>moveToScore(num, score));

    col.appendChild(head);
    col.appendChild(body);
    gridEl.appendChild(col);
  });
}

function moveToScore(num, score){
  const placements = state.qsort.placements_by_statement_number;
  const currentCount = Object.values(placements).filter(v=>v===score).length;
  const limit = slots[String(score)];
  if(currentCount >= limit){
    status2.textContent = `Column ${score>=0?'+':''}${score} is full (${currentCount}/${limit}). Move a card out first.`;
    status2.style.color = '#b00020';
    return;
  }
  placements[num] = score;
  rerenderStep2();
}

function rerenderStep2(preferredOrder=null){
  document.querySelectorAll('.colbody').forEach(el=>el.innerHTML = '');
  bankEl.innerHTML = '';

  const placements = state.qsort.placements_by_statement_number;
  const unplacedNums = [];

  cfg.statements.forEach(stmt=>{
    const sc = placements[stmt.num];
    if(sc === null){
      unplacedNums.push(stmt.num);
    } else {
      const colBody = document.querySelector(`.column[data-score="${sc}"] .colbody`);
      if(colBody) colBody.appendChild(makeCard(stmt));
    }
  });

  const order = preferredOrder
    ? preferredOrder.filter(n=>placements[n]===null)
    : unplacedNums;

  order.forEach(n=>{
    const stmt = cfg.statements.find(s=>s.num===n);
    bankEl.appendChild(makeCard(stmt));
  });

  updateSlotCounts();
  const ok = isValid(false);
  btnExport.disabled = !ok;
}

function updateSlotCounts(){
  const placements = state.qsort.placements_by_statement_number;
  scale.forEach(score=>{
    const count = Object.values(placements).filter(v=>v===score).length;
    const el = document.getElementById(`slot-${score}`);
    const total = slots[String(score)];
    if(el) el.textContent = `${count}/${total}`;
  });
}

function isValid(showMessage=true){
  const placements = state.qsort.placements_by_statement_number;
  const unplaced = Object.values(placements).filter(v=>v===null).length;

  if(unplaced > 0){
    if(showMessage){
      status2.textContent = `You still have ${unplaced} statement(s) in the Unplaced area. Keep placing them onto the grid until it is full.`;
      status2.style.color = '#333';
    }
    return false;
  }

  for(const score of scale){
    const count = Object.values(placements).filter(v=>v===score).length;
    const limit = slots[String(score)];
    if(count !== limit){
      if(showMessage){
        status2.textContent = `One column does not match the required number of slots at ${score>=0?'+':''}${score} (${count}/${limit}). Please adjust.`;
        status2.style.color = '#b00020';
      }
      return false;
    }
  }

  if(showMessage){
    status2.textContent = '✅ Grid complete. Continue to reflections.';
    status2.style.color = '#0b6a0b';
  }
  return true;
}

// Exports (KADE + JSON)
function download(filename, content, mime){
  const blob = new Blob([content], {type: mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildSessionId(){
  const d = new Date();
  const pad = (n)=>String(n).padStart(2,'0');
  const y = d.getUTCFullYear();
  const m = pad(d.getUTCMonth()+1);
  const day = pad(d.getUTCDate());
  const hh = pad(d.getUTCHours());
  const mm = pad(d.getUTCMinutes());
  const ss = pad(d.getUTCSeconds());
  return `${participantId}_${y}${m}${day}_${hh}${mm}${ss}`;
}

function buildPayload(){
  const now = new Date();
  const completed = now.toISOString();
  state.participant.participant_id = participantId;
  if(!state.participant.session_id) state.participant.session_id = buildSessionId();

  const started = new Date(state.started_utc).getTime();
  const ended = now.getTime();
  state.submission.duration_seconds = Math.round((ended - started)/1000);
  state.submission.completed_utc = completed;

  state.postsort.final_comments = finalComment.value || '';
  state.postsort.overall_confidence = Number(confidence.value || 3);

  return {
    study: { title: state.study.title, version: state.study.version, created_utc: state.started_utc },
    participant: state.participant,
    consent: state.consent,
    presort: state.presort,
    qsort: state.qsort,
    postsort: state.postsort,
    submission: state.submission
  };
}

function buildKadeCsv(){
  const header = ['ID', ...cfg.statements.map(s=>String(s.num))].join(',');
  const placements = state.qsort.placements_by_statement_number;
  const row = [participantId, ...cfg.statements.map(s=>String(placements[s.num]))].join(',');
  return header + '\n' + row + '\n';
}

function buildStatementsTxt(){
  return cfg.statements.map(s=>s.text).join('\n');
}

function exportFiles(){
  if(!isValid(true)) return;
  const payload = buildPayload();
  download('statements.txt', buildStatementsTxt(), 'text/plain;charset=utf-8');
  download('qsorts.csv', buildKadeCsv(), 'text/csv;charset=utf-8');
  download(`qsort_${participantId}.json`, JSON.stringify(payload, null, 2), 'application/json');
  status2.textContent = '✅ Exported statements.txt, qsorts.csv, and JSON.';
  status2.style.color = '#0b6a0b';
}

btnExport.addEventListener('click', exportFiles);

// Post-sort rendering (extremes +4 and -4)
function stmtText(num){
  return cfg.statements.find(s=>s.num===num)?.text || '';
}

function renderPostSortExtremes(){
  extremesWrap.innerHTML = '';

  const placements = state.qsort.placements_by_statement_number;
  const top = Math.max(...scale);      // +4
  const bottom = Math.min(...scale);   // -4

  const plusNums = Object.keys(placements).map(Number).filter(n=>placements[n]===top);
  const minusNums = Object.keys(placements).map(Number).filter(n=>placements[n]===bottom);

  const makeSection = (title, nums, bucketKey)=>{
    const sec = document.createElement('div');
    sec.className = 'helpbox';
    sec.innerHTML = `<b>${title}</b>`;
    nums.forEach(n=>{
      const item = document.createElement('div');
      item.className = 'qitem';
      item.innerHTML = `<div><b>${n}.</b> ${escapeHtml(stmtText(n))}</div>`;
      const ta = document.createElement('textarea');
      ta.rows = 2;
      ta.placeholder = 'Optional: Why did you place this statement here?';
      ta.value = state.postsort.extremes[bucketKey][String(n)] || '';
      ta.addEventListener('input', ()=> state.postsort.extremes[bucketKey][String(n)] = ta.value);
      item.appendChild(ta);
      sec.appendChild(item);
    });
    return sec;
  };

  extremesWrap.appendChild(makeSection(`Most like my view (+${top})`, plusNums, 'plus4'));
  extremesWrap.appendChild(makeSection(`Least like my view (${bottom})`, minusNums, 'minus4'));
}

// Continue to reflections
btnValidate.addEventListener('click', ()=>{
  if(!isValid(true)) return;
  renderPostSortExtremes();
  showPanel('postsort');
});

// Submit to Power Automate
async function submit(){
  const url = cfg.powerAutomateUrl;
  if(!url || url.includes('PASTE_YOUR_POWER_AUTOMATE_HTTP_TRIGGER_URL_HERE')){
    status3.textContent = '⚠️ Power Automate URL not configured yet. You can Export instead.';
    status3.style.color = '#b00020';
    return;
  }

  btnSubmit.disabled = true;
  status3.textContent = 'Submitting…';
  status3.style.color = '#333';

  try{
    const payload = buildPayload();
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });

    if(!res.ok){
      const t = await res.text();
      throw new Error(`HTTP ${res.status}: ${t}`);
    }

    state.submission.submitted = true;
    status3.textContent = '✅ Submitted successfully. Thank you for participating.';
    status3.style.color = '#0b6a0b';

  } catch(e){
    console.error(e);
    status3.textContent = '❌ Submit failed. Please use Export as backup.';
    status3.style.color = '#b00020';
    btnSubmit.disabled = false;
  }
}

btnSubmit.addEventListener('click', submit);

// Randomize
btnRandomize.addEventListener('click', ()=>{
  const arr = cfg.statements.slice();
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const order = arr.map(s=>s.num);
  if(!step1Panel.classList.contains('hidden')) renderStep1(order);
  if(!step2Panel.classList.contains('hidden')) rerenderStep2(order.filter(n=>state.qsort.placements_by_statement_number[n]===null));
});

// Init
initParticipantId();
initConsent();
showPanel('consent');
