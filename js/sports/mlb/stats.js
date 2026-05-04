// ════════════════════════════════════════
//  HITTING API
// ════════════════════════════════════════
async function getHitters(gameType, days) {
  const season = hitYear || new Date().getFullYear();
  async function fetchSeason(yr, gType) {
    const url = `https://statsapi.mlb.com/api/v1/stats?stats=season&group=hitting&gameType=${gType}&season=${yr}&teamId=${selectedMlbTeamId}&playerPool=ALL&sportId=1&limit=100`;
    const data = await apiFetch(url);
    return data.stats?.[0]?.splits || [];
  }
  const rosterData = await apiFetch(`https://statsapi.mlb.com/api/v1/teams/${selectedMlbTeamId}/roster?rosterType=fullRoster&season=${season}`).catch(()=>({roster:[]}));
  const posMap = {};
  for (const p of (rosterData.roster||[])) posMap[p.person?.id] = p.position?.abbreviation||'?';
  let splits = await fetchSeason(season, gameType);
  let displayGameType = gameType;
  if (!splits.length && gameType==='S') { splits = await fetchSeason(season,'R'); displayGameType='R'; }
  if (!splits.length) { splits = await fetchSeason(2025,'R'); displayGameType='R'; }
  window._hitSeasonLoaded = `${season} ${displayGameType==='S'?'Spring Training':'Regular Season'}`;
  return splits.filter(s=>(s.stat?.atBats||0)>=1).map(s=>{
    const st=s.stat||{}, person=s.player||{};
    const pos=posMap[person.id]||s.position?.abbreviation||'?';
    if (['P','SP','RP'].includes(pos)) return null;
    const pa=st.plateAppearances||0, k=st.strikeOuts||0, bb=st.baseOnBalls||0;
    return {
      id:person.id, name:person.fullName||`Player ${person.id}`, pos,
      g:st.gamesPlayed??0, pa, ab:st.atBats??0, h:st.hits??0,
      avg:st.avg??'.000', hr:st.homeRuns??0, rbi:st.rbi??0, r:st.runs??0,
      sb:st.stolenBases??0, obp:st.obp??'.000', slg:st.slg??'.000', ops:st.ops??'.000',
      doubles:st.doubles??0, triples:st.triples??0, k, bb, hbp:st.hitByPitch??0,
      babip:st.babip??null, iso:st.isolatedPower??null,
      kPct: pa>0?((k/pa)*100).toFixed(1):null,
      bbPct: pa>0?((bb/pa)*100).toFixed(1):null,
      kbb: k>0?(bb/k).toFixed(2):null,
    };
  }).filter(Boolean);
}

// ════════════════════════════════════════
//  HITTING CONTROLS
// ════════════════════════════════════════
function setHitYear(val) { hitYear=+val; reloadHitting(); }
function setGameType(gt,el) {
  hitGameType=gt;
  document.querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  reloadHitting();
}
function onRangeInput(v) {
  hitDays=+v;
  document.getElementById('range-disp').textContent=v;
  clearTimeout(rangeTimer);
  rangeTimer=setTimeout(reloadHitting,700);
}
async function reloadHitting() {
  if (!dataLoaded) return;
  document.getElementById('hit-loading').style.display='inline';
  try { hitterData=await getHitters(hitGameType,hitDays); renderHitting(); } catch(e){ showErr(e.message,''); }
  document.getElementById('hit-loading').style.display='none';
}

// ════════════════════════════════════════
//  RENDER HITTING
// ════════════════════════════════════════
const THRESH={avg:[.215,.285],obp:[.300,.360],slg:[.370,.480],ops:[.680,.840],babip:[.265,.340],iso:[.100,.220]};
function statCls(key,val) {
  if(val===null||val===undefined||val==='—'||val==='.000') return '';
  const n=parseFloat(val); if(isNaN(n)) return '';
  const t=THRESH[key]; if(!t) return '';
  if(n>=t[1]) return 'hi'; if(n<=t[0]) return 'lo'; return '';
}
const ALL_COLS=[
  {k:'name',h:'Player'},{k:'g',h:'G',r:true},{k:'pa',h:'PA',r:true},{k:'ab',h:'AB',r:true},
  {k:'h',h:'H',r:true},{k:'avg',h:'AVG',r:true,color:true},{k:'hr',h:'HR',r:true},
  {k:'rbi',h:'RBI',r:true},{k:'r',h:'R',r:true},{k:'doubles',h:'2B',r:true},{k:'sb',h:'SB',r:true},
  {k:'obp',h:'OBP',r:true,color:true},{k:'slg',h:'SLG',r:true,color:true},{k:'ops',h:'OPS',r:true,color:true},
  {k:'k',h:'K',r:true,adv:true},{k:'bb',h:'BB',r:true,adv:true},
  {k:'kPct',h:'K%',r:true,adv:true},{k:'bbPct',h:'BB%',r:true,adv:true},
  {k:'babip',h:'BABIP',r:true,color:true,adv:true},{k:'iso',h:'ISO',r:true,color:true,adv:true},
];

function renderHitting() {
  const adv=document.getElementById('adv-tog').checked;
  const cols=adv?ALL_COLS:ALL_COLS.filter(c=>!c.adv);
  const sc=sortHitState;
  const rows=[...hitterData].sort((a,b)=>{
    let va=a[sc.col]??'',vb=b[sc.col]??'';
    if(sc.col==='name') return sc.asc?(va<vb?-1:1):(va>vb?-1:1);
    va=parseFloat(va)||0; vb=parseFloat(vb)||0;
    return sc.asc?va-vb:vb-va;
  });
  const withAB=rows.filter(h=>h.ab>0);
  const avgArr=withAB.map(h=>parseFloat(h.avg)||0);
  const opsArr=withAB.map(h=>parseFloat(h.ops)||0);
  const tAvg=avgArr.length?(avgArr.reduce((a,b)=>a+b,0)/avgArr.length).toFixed(3):'—';
  const tOPS=opsArr.length?(opsArr.reduce((a,b)=>a+b,0)/opsArr.length).toFixed(3):'—';
  const tHR=withAB.reduce((s,h)=>s+(h.hr||0),0);
  const tR=withAB.reduce((s,h)=>s+(h.r||0),0);
  const tRBI=withAB.reduce((s,h)=>s+(h.rbi||0),0);
  document.getElementById('hit-cards').innerHTML=`
    <div class="card"><div class="card-lbl">Hitters</div><div class="card-val">${withAB.length}</div></div>
    <div class="card"><div class="card-lbl">Team AVG</div><div class="card-val sm">${tAvg}</div></div>
    <div class="card"><div class="card-lbl">Team OPS</div><div class="card-val sm">${tOPS}</div></div>
    <div class="card"><div class="card-lbl">Total HR</div><div class="card-val r">${tHR}</div></div>
    <div class="card"><div class="card-lbl">Total R</div><div class="card-val">${tR}</div></div>
    <div class="card"><div class="card-lbl">Total RBI</div><div class="card-val">${tRBI}</div></div>`;
  document.getElementById('hit-thead').innerHTML=`<tr>${cols.map((col,i)=>{
    const isFirstAdv=col.adv&&(i===0||!cols[i-1].adv);
    const bdr=isFirstAdv?'border-left:2px solid var(--border);':'';
    return `<th class="${col.r?'r':''}" onclick="sortHit('${col.k}')" style="cursor:pointer;${bdr}">${col.h} ${sc.col===col.k?(sc.asc?'↑':'↓'):'<span style="opacity:.35">↕</span>'}</th>`;
  }).join('')}</tr>`;
  const fmt=(k,v)=>{
    if(v===null||v===undefined) return '—';
    if(['avg','obp','slg','ops','babip','iso'].includes(k)){const n=parseFloat(v);return isNaN(n)?'—':n.toFixed(3);}
    if(['kPct','bbPct'].includes(k)) return v!==null?v+'%':'—';
    if(k==='kbb') return v!==null?v:'—';
    return v;
  };
  document.getElementById('body-hit').innerHTML=rows.map(h=>`<tr>${cols.map((col,i)=>{
    const raw=h[col.k],disp=fmt(col.k,raw);
    const cls=col.color?statCls(col.k,raw):'';
    const isFirstAdv=col.adv&&(i===0||!cols[i-1].adv);
    const bdr=isFirstAdv?'border-left:2px solid var(--border);':'';
    if(i===0) return `<td><span class="pname">${disp}</span><span class="rpill ${posClass(h.pos)}">${h.pos}</span></td>`;
    return `<td class="r ${cls}" style="font-family:var(--mono);font-size:11px;${bdr}">${disp}</td>`;
  }).join('')}</tr>`).join('')
  ||`<tr><td colspan="${cols.length}" style="text-align:center;padding:24px;color:var(--faint);font-family:var(--display);font-size:13px;letter-spacing:.04em">No hitting data found.<br><span style="font-size:11px;font-family:var(--body);opacity:.7">Try changing the year or season type.</span></td></tr>`;
  const gtLabel=hitGameType==='S'?'Spring Training':'Regular Season';
  document.getElementById('hit-src-note').textContent=`${window._hitSeasonLoaded||gtLabel} · ${withAB.length} hitters · statsapi.mlb.com`;
}

function sortHit(col) {
  sortHitState.asc=sortHitState.col===col?!sortHitState.asc:false;
  sortHitState.col=col; renderHitting();
}

// ════════════════════════════════════════
//  PITCHING STATS TAB
// ════════════════════════════════════════
let pitchingStatsData = [];
let pstatGameType = 'R';
let pstatYear = new Date().getFullYear();
let sortPStatState = { col: 'era', asc: true };

const PSTAT_STD_COLS = [
  {k:'name',  h:'Pitcher'},
  {k:'pos',   h:'Role'},
  {k:'g',     h:'G',   r:true},
  {k:'gs',    h:'GS',  r:true},
  {k:'ip',    h:'IP',  r:true},
  {k:'w',     h:'W',   r:true},
  {k:'l',     h:'L',   r:true},
  {k:'era',   h:'ERA', r:true, color:true},
  {k:'so',    h:'K',   r:true},
  {k:'bb',    h:'BB',  r:true},
  {k:'h',     h:'H',   r:true},
  {k:'hr',    h:'HR',  r:true},
  {k:'whip',  h:'WHIP',r:true, color:true},
];
const PSTAT_ADV_COLS = [
  {k:'hbp',   h:'HBP', r:true, adv:true},
  {k:'er',    h:'ER',  r:true, adv:true},
  {k:'avg',   h:'BAA', r:true, adv:true, color:true},
  {k:'sv',    h:'SV',  r:true, adv:true},
  {k:'holds', h:'HLD', r:true, adv:true},
  {k:'kper9', h:'K/9', r:true, adv:true},
  {k:'bbper9',h:'BB/9',r:true, adv:true},
];

const PSTAT_THRESH = {
  era:  [3.00, 5.00],   // lower=good: ≤3.00 green, ≥5.00 red
  whip: [1.00, 1.40],
  avg:  [.215, .280],
  kper9:[7.0,  10.0],
  bbper9:[2.5, 4.5],
};

function pstatCls(k, v) {
  if (v == null || v === '—') return '';
  const n = parseFloat(v); if (isNaN(n)) return '';
  const t = PSTAT_THRESH[k]; if (!t) return '';
  // ERA/WHIP/AVG/BB9: lower is better
  const lowerBetter = ['era','whip','avg','bbper9'].includes(k);
  if (lowerBetter) return n <= t[0] ? 'hi' : n >= t[1] ? 'lo' : '';
  // K/9: higher is better
  return n >= t[1] ? 'hi' : n <= t[0] ? 'lo' : '';
}

async function getPitchers(gameType, year) {
  const url = `https://statsapi.mlb.com/api/v1/stats?stats=season&group=pitching&gameType=${gameType}&season=${year}&teamId=${BOS_ID}&playerPool=ALL&sportId=1&limit=100`;
  const data = await apiFetch(url);
  const splits = data.stats?.[0]?.splits || [];
  window._pstatLoaded = `${year} ${gameType==='S'?'Spring Training':'Regular Season'}`;
  return splits.filter(s => (s.stat?.gamesPlayed || 0) >= 1).map(s => {
    const st = s.stat || {}, person = s.player || {};
    const ip = parseFloat(st.inningsPitched||'0');
    const so = st.strikeOuts||0, bb = st.baseOnBalls||0;
    return {
      id: person.id, name: person.fullName || `Player ${person.id}`,
      pos: (st.gamesStarted||0) > 0 ? 'SP' : 'RP',
      g: st.gamesPlayed||0, gs: st.gamesStarted||0,
      ip: st.inningsPitched||'0',
      w: st.wins||0, l: st.losses||0, sv: st.saves||0, holds: st.holds||0,
      era: st.era||'-.--', whip: st.whip||'-.--',
      so, bb, h: st.hits||0, hr: st.homeRuns||0,
      er: st.earnedRuns||0, hbp: st.hitBatsmen||0,
      avg: st.avg||'.000',
      kper9:  ip > 0 ? (so / ip * 9).toFixed(2) : '—',
      bbper9: ip > 0 ? (bb / ip * 9).toFixed(2) : '—',
    };
  });
}

function setPStatGameType(gt, el) {
  pstatGameType = gt;
  document.querySelectorAll('#pstat-gt-S, #pstat-gt-R').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  reloadPitchingStats();
}

async function reloadPitchingStats() {
  if (!document.getElementById('pane-pitching-stats')) return;
  pstatYear = +document.getElementById('pstat-year-select').value;
  document.getElementById('pstat-loading').style.display = 'inline';
  try {
    pitchingStatsData = await getPitchers(pstatGameType, pstatYear);
    renderPitchingStats();
  } catch(e) { console.error(e); }
  document.getElementById('pstat-loading').style.display = 'none';
}

function sortPStat(col) {
  sortPStatState.asc = sortPStatState.col === col ? !sortPStatState.asc : ['era','whip','avg','bbper9'].includes(col);
  sortPStatState.col = col;
  renderPitchingStats();
}

function renderPitchingStats() {
  const adv = document.getElementById('pstat-adv-tog').checked;
  const cols = adv ? [...PSTAT_STD_COLS, ...PSTAT_ADV_COLS] : PSTAT_STD_COLS;
  const sc = sortPStatState;

  const sorted = [...pitchingStatsData].sort((a, b) => {
    if (sc.col === 'name') return sc.asc ? (a.name < b.name ? -1:1) : (b.name < a.name ? -1:1);
    const va = parseFloat(a[sc.col])||0, vb = parseFloat(b[sc.col])||0;
    return sc.asc ? va - vb : vb - va;
  });

  // Summary cards
  const sps = sorted.filter(p => p.pos === 'SP');
  const rps = sorted.filter(p => p.pos === 'RP');
  const withIP = sorted.filter(p => parseFloat(p.ip) > 0);
  const teamERA = withIP.length
    ? (withIP.reduce((s,p) => s + parseFloat(p.era||99), 0) / withIP.length).toFixed(2) : '—';
  const teamWHIP = withIP.length
    ? (withIP.reduce((s,p) => s + parseFloat(p.whip||99), 0) / withIP.length).toFixed(2) : '—';
  const totalK  = sorted.reduce((s,p) => s + (p.so||0), 0);
  const totalBB = sorted.reduce((s,p) => s + (p.bb||0), 0);

  document.getElementById('pstat-cards').innerHTML = `
    <div class="card"><div class="card-lbl">Pitchers</div><div class="card-val">${sorted.length}</div></div>
    <div class="card"><div class="card-lbl">Starters</div><div class="card-val">${sps.length}</div></div>
    <div class="card"><div class="card-lbl">Relievers</div><div class="card-val">${rps.length}</div></div>
    <div class="card"><div class="card-lbl">Team ERA</div><div class="card-val sm">${teamERA}</div></div>
    <div class="card"><div class="card-lbl">Team WHIP</div><div class="card-val sm">${teamWHIP}</div></div>
    <div class="card"><div class="card-lbl">Total K</div><div class="card-val">${totalK}</div></div>
    <div class="card"><div class="card-lbl">Total BB</div><div class="card-val">${totalBB}</div></div>
  `;

  document.getElementById('pstat-thead').innerHTML = `<tr>${cols.map((col,i) => {
    const isFirstAdv = col.adv && (i===0 || !cols[i-1]?.adv);
    const bdr = isFirstAdv ? 'border-left:2px solid var(--border);' : '';
    const arrow = sc.col===col.k ? (sc.asc?'↑':'↓') : '<span style="opacity:.35">↕</span>';
    return `<th class="${col.r?'r':''}" onclick="sortPStat('${col.k}')" style="cursor:pointer;${bdr}">${col.h} ${arrow}</th>`;
  }).join('')}</tr>`;

  const posClassLocal = pos => pos==='SP'?'pill-sp':'pill-rp';
  document.getElementById('pstat-tbody').innerHTML = sorted.map(p => `<tr>${cols.map((col,i) => {
    const isFirstAdv = col.adv && (i===0 || !cols[i-1]?.adv);
    const bdr = isFirstAdv ? 'border-left:2px solid var(--border);' : '';
    const raw = p[col.k];
    const disp = raw ?? '—';
    const cls = col.color ? pstatCls(col.k, raw) : '';
    if (i === 0) return `<td><span class="pname">${disp}</span></td>`;
    if (col.k === 'pos') return `<td><span class="rpill ${posClassLocal(raw)}">${raw}</span></td>`;
    return `<td class="r ${cls}" style="font-family:var(--mono);font-size:11px;${bdr}">${disp}</td>`;
  }).join('')}</tr>`).join('')
  || `<tr><td colspan="${cols.length}" style="text-align:center;padding:24px;color:var(--faint);font-family:var(--display);font-size:13px">No pitching data found.</td></tr>`;

  document.getElementById('pstat-src-note').textContent =
    `${sorted.length} pitchers · ${window._pstatLoaded||''} · statsapi.mlb.com`;
}
