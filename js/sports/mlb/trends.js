// ════════════════════════════════════════
//  PITCHING API
// ════════════════════════════════════════
async function getLastGames(n, seasonYear) {
  const yr = seasonYear || btPitchYear || new Date().getFullYear();
  const seasonStart = `${yr}-03-01`;
  const seasonEnd   = yr === new Date().getFullYear() ? todayStr() : `${yr}-11-01`;
  const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${selectedMlbTeamId}&startDate=${seasonStart}&endDate=${seasonEnd}&gameType=R&hydrate=decisions`;
  const data = await apiFetch(url);
  const done = [];
  for (const day of (data.dates||[])) {
    for (const g of (day.games||[])) {
      const s = g.status?.abstractGameState;
      if (s==='Final'||g.status?.detailedState?.includes('Final')||g.status?.detailedState?.includes('Completed')) {
        done.push({gamePk:g.gamePk, date:day.date, decisions:g.decisions||{}});
      }
    }
  }
  done.sort((a,b)=>new Date(b.date)-new Date(a.date));
  return done.slice(0,n);
}

async function getBoxScore(gamePk) {
  return apiFetch(`https://statsapi.mlb.com/api/v1/game/${gamePk}/boxscore`);
}

function extractPitchers(box, isBosHome, decisions={}) {
  const side = isBosHome ? 'home' : 'away';
  const team = box.teams?.[side];
  if (!team) return [];
  const winnerId = decisions.winner?.id ? +decisions.winner.id : null;
  const loserId  = decisions.loser?.id  ? +decisions.loser.id  : null;
  const saveId   = decisions.save?.id   ? +decisions.save.id   : null;
  return (team.pitchers||[]).map(pid => {
    const p = team.players?.[`ID${pid}`];
    if (!p) return null;
    const s = p.stats?.pitching||{};
    const ipStr = s.inningsPitched||'0';
    const ipParts = String(ipStr).split('.');
    const ipActual = parseInt(ipParts[0]||0) + (parseInt(ipParts[1]||0)/3);
    const pidNum = +pid;
    let decision = null;
    if (winnerId && pidNum===winnerId) decision = 'W';
    else if (loserId && pidNum===loserId) decision = 'L';
    else if (saveId && pidNum===saveId) decision = 'S';
    return {
      id: pid, name: p.person?.fullName||`Player ${pid}`,
      role: (s.gamesStarted||0)>0 ? 'SP' : 'RP',
      pitches: s.pitchesThrown||0,
      er: s.earnedRuns||0,
      ip: ipActual, ipDisplay: String(ipStr),
      hits: s.hits||0, runs: s.runs||0, decision,
    };
  }).filter(Boolean);
}

// ════════════════════════════════════════
//  RENDER PITCHING
// ════════════════════════════════════════
function renderPitching() {
  const n=gamesMeta.length;
  const labels=['Last','G-2','G-3','G-4','G-5','G-6','G-7','G-8','G-9','G-10'];
  const bp=pitcherData.filter(p=>p.role==='RP');
  const fr=bp.filter(p=>freshness(p).ord<=1).length;
  const mo=bp.filter(p=>freshness(p).ord===2).length;
  const hv=bp.filter(p=>freshness(p).ord===3).length;
  document.getElementById('pitch-cards').innerHTML=`
    <div class="card"><div class="card-lbl">Bullpen arms</div><div class="card-val">${bp.length}</div></div>
    <div class="card"><div class="card-lbl">Fresh</div><div class="card-val g">${fr}</div></div>
    <div class="card"><div class="card-lbl">Serviceable</div><div class="card-val a">${mo}</div></div>
    <div class="card"><div class="card-lbl">Tired</div><div class="card-val r">${hv}</div></div>
    <div class="card"><div class="card-lbl">Starters</div><div class="card-val">${pitcherData.filter(p=>p.role==='SP').length}</div></div>`;
  renderPitchTable('bp'); renderPitchTable('sp');
  document.getElementById('pitch-src-note').textContent=`${n} game(s) loaded · Freshness = last 3 games · MLB Stats API`;
}

function renderPitchTable(which) {
  const isRp=which==='bp';
  const sc=sortPitchState[which];
  const n=gamesMeta.length;
  let rows=pitcherData.filter(p=>p.role===(isRp?'RP':'SP'));

  // ── Build live pitcher lookup ──────────────────────────────────────────
  const hasLive = !!(mlbLiveGame && mlbLiveBoxscore);
  const livePitchers = {}; // lastName → { ip, h, er, k, bb, pitches }
  if (hasLive) {
    const side = mlbLiveGame.isHome ? 'home' : 'away';
    const pids = mlbLiveBoxscore.teams?.[side]?.pitchers || [];
    const playerInfo = mlbLiveBoxscore.teams?.[side]?.players || {};
    for (const pid of pids) {
      // pid can be a number or string — key is always "ID{number}"
      const key = `ID${pid}`;
      const pl = playerInfo[key];
      if (!pl) continue;
      // Stats path: stats.pitching for game stats, seasonStats.pitching for season
      const gameStats   = pl.stats?.pitching    || {};
      const seasonStats = pl.seasonStats?.pitching || {};
      // Use game stats when available (has actual game numbers), fall back to season
      const s = Object.keys(gameStats).length > 0 ? gameStats : seasonStats;
      const lastName = pl.person?.lastName || (pl.person?.fullName||'').split(' ').pop() || '?';
      const fullName = pl.person?.fullName || lastName;
      const pitches = parseInt(s.numberOfPitches ?? s.pitchesThrown ?? 0);
      livePitchers[fullName] = livePitchers[lastName] = {
        ip:      s.inningsPitched || '0.0',
        h:       s.hits ?? 0,
        er:      s.earnedRuns ?? 0,
        k:       s.strikeOuts ?? 0,
        bb:      s.baseOnBalls ?? 0,
        pitches,
      };
    }
  }

  // Helper to find live stats for a pitcher by name
  const getLive = (name) => {
    if (livePitchers[name]) return livePitchers[name];
    const last = name.split(' ').pop();
    return livePitchers[last] || null;
  };

  // Add live pitchers not in historical data (e.g. today's starter)
  // Use position in pitchers array: first = SP, rest = RP
  if (hasLive) {
    const side = mlbLiveGame.isHome ? 'home' : 'away';
    const pids = mlbLiveBoxscore.teams?.[side]?.pitchers || [];
    const histNames = new Set(rows.map(p => p.name));
    pids.forEach((pid, pidIdx) => {
      const liveRole = pidIdx === 0 ? 'SP' : 'RP';
      // Only add to matching table
      if (liveRole !== (isRp ? 'RP' : 'SP')) return;
      const playerInfo = mlbLiveBoxscore.teams?.[side]?.players || {};
      const pl = playerInfo[`ID${pid}`];
      if (!pl) return;
      const fullName = pl.person?.fullName;
      if (!fullName || !fullName.includes(' ')) return;
      if (histNames.has(fullName)) return; // already in historical data
      const lstats = livePitchers[fullName] || livePitchers[pl.person?.lastName] || {};
      rows.push({
        name: fullName, role: liveRole,
        games: Array(n).fill(0), gameLines: Array(n).fill(null),
        totalIP: parseFloat(lstats.ip) || 0, era: '—',
        isLiveOnly: true,
      });
      histNames.add(fullName);
    });
  }

  // Sort: live pitchers first, then by default sort
  const getFresh=p=>freshness(p);
  const total=p=>p.games.reduce((s,v)=>s+(v||0),0);
  const t2=p=>(p.games[0]||0)+(p.games[1]||0)+(p.games[2]||0);
  if (!sc.col) {
    rows.sort((a,b)=>{
      // Live pitchers with active stats float to top
      const aLive = hasLive && getLive(a.name) ? 1 : 0;
      const bLive = hasLive && getLive(b.name) ? 1 : 0;
      if (bLive !== aLive) return bLive - aLive;
      for(let i=0;i<n;i++){if((b.games[i]||0)!==(a.games[i]||0))return(b.games[i]||0)-(a.games[i]||0);}
      return a.name<b.name?-1:1;
    });
  } else {
    rows.sort((a,b)=>{
      if(sc.col==='name') return sc.asc?(a.name<b.name?-1:1):(b.name<a.name?-1:1);
      if(sc.col==='status'){const d=getFresh(a).ord-getFresh(b).ord;return sc.asc?d:-d;}
      if(sc.col==='t2'){const d=t2(a)-t2(b);return sc.asc?d:-d;}
      if(sc.col==='total'){const d=total(a)-total(b);return sc.asc?d:-d;}
      const idx=parseInt(sc.col.slice(1));
      const va=a.games[idx]||0,vb=b.games[idx]||0;
      return sc.asc?va-vb:vb-va;
    });
  }
  const nameArrow=sc.col==='name'?(sc.asc?'↑':'↓'):'<span style="opacity:.3">↕</span>';
  const stArrow=sc.col==='status'?(sc.asc?'↑':'↓'):'<span style="opacity:.3">↕</span>';
  const t2Arrow=sc.col==='t2'?(sc.asc?'↑':'↓'):'<span style="opacity:.3">↕</span>';
  const totArrow=sc.col==='total'?(sc.asc?'↑':'↓'):'<span style="opacity:.3">↕</span>';
  const totalLabel=`Total Pitches Last ${n} Games`;
  const hdrCells=gamesMeta.map((g,i)=>{
    const arrow=sc.col===`g${i}`?(sc.asc?'↑':'↓'):'<span style="opacity:.3">↕</span>';
    const isW=g.result.startsWith('W'), isL=g.result.startsWith('L');
    const resultColor=isW?'#3DAB6E':isL?'#FF6B6B':'rgba(255,255,255,.7)';
    const resultHtml=isW||isL
      ? `<span style="color:${resultColor}">${g.result[0]}</span><span style="color:#fff">${g.result.slice(1)}</span>`
      : `<span style="color:rgba(255,255,255,.7)">${g.result}</span>`;
    return `<th style="text-align:center;min-width:80px" onclick="sortPitch('${which}','g${i}')">
      <span style="font-size:10px;font-weight:700;color:rgba(255,255,255,.85)">${g.dateLabel} ${g.isHome?'vs':'@'} ${g.opponent}</span><br>
      <span style="font-size:10px;font-weight:700">${resultHtml}</span> ${arrow}
    </th>`;
  }).join('');
  // ── Live column header ─────────────────────────────────────────────────
  const liveHdr = hasLive ? (() => {
    const g = mlbLiveGame;
    const half = g.half==='Top'?'▲':'▼';
    return `<th class="live-col" style="text-align:center;min-width:90px;background:#0C1F3F">
      ${liveBadge()}<br>
      <span style="font-size:9px;color:rgba(255,255,255,.7)">${half}${g.inning} ${g.isHome?'vs':'@'} ${g.oppAbbr}</span><br>
      <span style="font-size:9px;color:rgba(255,255,255,.85);font-weight:700">${g.bosScore??0}–${g.oppScore??0}</span>
    </th>`;
  })() : '';

  document.getElementById(`thead-${which}`).innerHTML=`<tr>
    <th class="col-frozen-left" onclick="sortPitch('${which}','name')">Pitcher ${nameArrow}</th>
    ${liveHdr}
    ${hdrCells}
    ${n===3?`<th class="col-frozen-right" style="text-align:center" onclick="sortPitch('${which}','t2')">Total Pitches<br><span style='font-size:9px;font-weight:400;opacity:.7'>Last 3 Games</span> ${t2Arrow}</th>`:''}
    ${n>3?`<th class="col-frozen-right" style="text-align:center" onclick="sortPitch('${which}','total')">Total Pitches<br><span style='font-size:9px;font-weight:400;opacity:.7'>Last ${n} Games</span> ${totArrow}</th>`:''}
    ${n===3||n>=7?`<th style="text-align:center" onclick="sortPitch('${which}','status')">${isRp?'Freshness':'Role'}<br><span style='font-size:9px;font-weight:400;opacity:.7'>${isRp?'Status':''}</span> ${stArrow}</th>`:''}
  </tr>`;
  const colCount=1+(hasLive?1:0)+n+(n===3?1:0)+(n>3?1:0)+(n===3||n>=7?1:0);
  const barMax=isRp?35:110;
  document.getElementById(`body-${which}`).innerHTML=rows.map(p=>{
    const f=getFresh(p);
    const eraColor=p.era==='—'?'var(--faint)':p.era==='∞'?'#8B1A1A':parseFloat(p.era)<=3.00?'#1a5c2a':parseFloat(p.era)<=5.00?'#b08828':'#8B1A1A';
    const sumHits=p.gameLines.reduce((s,gl)=>s+(gl?gl.hits:0),0);
    const sumER=p.gameLines.reduce((s,gl)=>s+(gl?gl.er:0),0);
    const allDecs=p.gameLines.map(gl=>gl?.decision).filter(Boolean);
    const decBadgesHtml=allDecs.map(d=>`<span style="display:inline-block;font-family:var(--mono);font-size:9px;font-weight:700;padding:1px 5px;border-radius:2px;background:${d==='W'?'#e8f5ec':d==='L'?'#faeaea':'#fdf6e0'};color:${d==='W'?'#1a5c2a':d==='L'?'#8B1A1A':'#b08828'}">${d}</span>`).join('');
    const ipWhole=Math.floor(p.totalIP),ipThirds=Math.round((p.totalIP-ipWhole)*3);
    const ipFmt=ipThirds===0?`${ipWhole}.0`:`${ipWhole}.${ipThirds}`;
    const summaryHtml=p.totalIP>0?`<div style="margin-top:3px;display:flex;align-items:center;flex-wrap:wrap;gap:4px 10px;">
      <span style="font-family:var(--mono);font-size:9px;color:var(--muted)">${ipFmt} IP</span>
      <span style="font-family:var(--mono);font-size:9px;color:var(--muted)">${sumHits} H</span>
      <span style="font-family:var(--mono);font-size:9px;color:var(--muted)">${sumER} ER</span>
      <span style="font-family:var(--mono);font-size:9px;color:${eraColor};font-weight:500">${p.era} ERA</span>
      ${decBadgesHtml}</div>`:'';

    // Live cell for this pitcher
    const liveData = hasLive ? getLive(p.name) : null;
    const liveCell = hasLive ? (() => {
      if (!liveData) {
        return `<td class="live-col" style="padding:5px 6px;text-align:center;opacity:.3;vertical-align:middle">—</td>`;
      }
      const pitchBar = bar(liveData.pitches, f.color, barMax, f.textColor);
      return `<td class="live-col" style="vertical-align:top;padding-top:5px;padding-bottom:5px;text-align:center;background:rgba(200,16,46,.04)">
        ${pitchBar}
        <div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-top:3px;white-space:nowrap;text-align:center">
          ${liveData.ip} IP · ${liveData.h}H · ${liveData.er}ER · ${liveData.k}K
        </div>
      </td>`;
    })() : '';

    const gameCells=p.games.map((v,gi)=>{
      const gl=p.gameLines[gi];
      const pitched=v>0;
      const decSpan=gl?.decision?`<span style="display:inline-block;font-family:var(--mono);font-size:9px;font-weight:700;padding:1px 4px;border-radius:2px;margin-left:3px;background:${gl.decision==='W'?'#e8f5ec':gl.decision==='L'?'#faeaea':'#fdf6e0'};color:${gl.decision==='W'?'#1a5c2a':gl.decision==='L'?'#8B1A1A':'#b08828'}">${gl.decision}</span>`:'';
      const statsLine=pitched&&gl?`<div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-top:3px;white-space:nowrap;text-align:center">${gl.ip} IP · ${gl.hits}H · ${gl.er}ER${decSpan}</div>`:'';
      return `<td style="vertical-align:top;padding-top:5px;padding-bottom:5px;text-align:center">${bar(v,f.color,barMax,f.textColor)}${statsLine}</td>`;
    }).join('');
    return `<tr>
      <td class="col-frozen-left" style="padding-top:5px;padding-bottom:5px">
        <div><span class="pname">${p.name}</span><span class="rpill ${p.role==='SP'?'pill-sp':'pill-rp'}">${p.role}</span></div>
        ${summaryHtml}
      </td>
      ${liveCell}
      ${gameCells}
      ${n===3?`<td class="col-frozen-right" style="font-family:var(--mono);font-weight:500;color:${f.textColor||f.color};text-align:center">${t2(p)}</td>`:''}
      ${n>3?`<td class="col-frozen-right" style="font-family:var(--mono);font-weight:600;text-align:center">${total(p)}</td>`:''}
      ${n===3||n>=7?`<td style="text-align:center"><span class="badge ${f.cls}">${f.lbl}</span></td>`:''}
    </tr>`;
  }).join('')||`<tr><td colspan="${colCount}" style="text-align:center;padding:18px;color:var(--faint)">No ${isRp?'relievers':'starters'} found</td></tr>`;
}

function sortPitch(which,col) {
  const sc=sortPitchState[which];
  sc.asc=sc.col===col?!sc.asc:false; sc.col=col;
  renderPitchTable(which);
}

// ════════════════════════════════════════
//  PITCH RANGE SLIDER
// ════════════════════════════════════════
function onPitchRangeInput(v) {
  pitchGames=+v;
  document.getElementById('pitch-range-disp').textContent=+v>=162?'Full season':v;
  clearTimeout(pitchRangeTimer);
  pitchRangeTimer=setTimeout(reloadPitching,400);
}

async function reloadPitching() {
  if (!dataLoaded) return;
  sortPitchState={bp:{col:null,asc:false},sp:{col:null,asc:false}};
  const note=document.getElementById('pitch-src-note');
  note.textContent='Loading…';
  try {
    // First: fetch full season game list to know total, then cap slider
    const allGames = await getLastGames(162, btPitchYear);
    btPitchTotalGames = allGames.length;
    const slider = document.getElementById('pitch-range');
    if (slider) {
      slider.max = btPitchTotalGames;
      if (pitchGames > btPitchTotalGames) {
        pitchGames = btPitchTotalGames;
        slider.value = pitchGames;
        document.getElementById('pitch-range-disp').textContent = pitchGames;
      }
    }
    // Now fetch box scores only for the requested count
    const games = allGames.slice(0, pitchGames);
    const enriched=[];
    const boxes2 = await Promise.all(games.map(g => getBoxScore(g.gamePk)));
    boxes2.forEach((box, i) => {
      const g=games[i];
      const homeId=box.teams?.home?.team?.id;
      const isBosHome=homeId===BOS_ID;
      const opp=(isBosHome?box.teams?.away?.team:box.teams?.home?.team)?.abbreviation||'?';
      const bosR=isBosHome?box.teams?.home?.teamStats?.batting?.runs:box.teams?.away?.teamStats?.batting?.runs;
      const oppR=isBosHome?box.teams?.away?.teamStats?.batting?.runs:box.teams?.home?.teamStats?.batting?.runs;
      const res=typeof bosR==='number'&&typeof oppR==='number'?(bosR>oppR?`W ${bosR}-${oppR}`:bosR<oppR?`L ${bosR}-${oppR}`:`T ${bosR}-${oppR}`):'?';
      enriched.push({gamePk:g.gamePk,date:g.date,dateLabel:fmtDate(g.date),opponent:opp,isHome:isBosHome,result:res,pitchers:extractPitchers(box,isBosHome,g.decisions||{})});
    });
    const pm={};
    enriched.forEach((gd,idx)=>{
      gd.pitchers.forEach(p=>{
        if (!pm[p.id]) pm[p.id]={id:p.id,name:p.name,role:p.role,games:[],gameLines:[],totalER:0,totalIP:0,totalHits:0,totalRuns:0};
        pm[p.id].games[idx]=p.pitches;
        pm[p.id].gameLines[idx]={ip:p.ipDisplay||'0',hits:p.hits||0,er:p.er||0,decision:p.decision||null};
        pm[p.id].totalER+=p.er||0; pm[p.id].totalIP+=p.ip||0;
        if (idx===0) pm[p.id].role=p.role;
      });
    });
    Object.values(pm).forEach(p=>{
      for(let i=0;i<enriched.length;i++){if(p.games[i]===undefined)p.games[i]=0;if(p.gameLines[i]===undefined)p.gameLines[i]=null;}
      p.era=p.totalIP>0?(p.totalER/p.totalIP*9).toFixed(2):(p.totalER>0?'∞':(p.games.some(g=>g>0)?'0.00':'—'));
    });
    pitcherData=Object.values(pm); gamesMeta=enriched;
    renderPitching();
  } catch(e){ note.textContent='Error: '+e.message; }
}

function onBtPitchSeasonChange() {
  const sel = document.getElementById('bt-pitch-season-select');
  if (!sel) return;
  btPitchYear = +sel.value;
  // Reset slider to safe default
  pitchGames = 3;
  const slider = document.getElementById('pitch-range');
  if (slider) { slider.max = 162; slider.value = 3; }
  document.getElementById('pitch-range-disp').textContent = '3';
  // Clear cache for schedule URLs so new season is fetched fresh
  _cache.forEach((v, k) => { if (k.includes('schedule')) _cache.delete(k); });
  reloadPitching();
}

// ════════════════════════════════════════
//  HITTING TRENDS TAB
// ════════════════════════════════════════
let hitterTrendData = [];
let hitTrendGamesMeta = [];
let hitTrendGames = 5;
let htStat = 'h';
let hitTrendRangeTimer;

const HT_STAT_LABELS = { h:'H', hr:'HR', rbi:'RBI', r:'R', bb:'BB', k:'K' };
const HT_STAT_MAX    = { h:5, hr:2, rbi:4, r:3, bb:3, k:4 };
const HT_STAT_COLOR  = '#2D5A1B'; // Green Monster green

function setHtStat(stat, el) {
  htStat = stat;
  document.querySelectorAll('#ht-stat-h,#ht-stat-hr,#ht-stat-rbi,#ht-stat-r,#ht-stat-bb,#ht-stat-k')
    .forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderHittingTrends();
}

function onHitTrendRangeInput(v) {
  hitTrendGames = +v;
  document.getElementById('hit-trend-range-disp').textContent = +v >= 162 ? 'Full season' : v;
  clearTimeout(hitTrendRangeTimer);
  hitTrendRangeTimer = setTimeout(renderHittingTrends, 200);
}

function extractHitters(box, isBosHome) {
  const side = isBosHome ? 'home' : 'away';
  const team = box.teams?.[side];
  if (!team) return [];
  return (team.batters || []).map(bid => {
    const p = team.players?.[`ID${bid}`];
    if (!p) return null;
    const s = p.stats?.batting || {};
    if (!s.atBats && !s.plateAppearances) return null;
    return {
      id: bid, name: p.person?.fullName || `Player ${bid}`,
      pos: p.allPositions?.[0]?.abbreviation || p.primaryPosition?.abbreviation || '?',
      h: s.hits||0, hr: s.homeRuns||0, rbi: s.rbi||0,
      r: s.runs||0, bb: s.baseOnBalls||0, k: s.strikeOuts||0, ab: s.atBats||0,
    };
  }).filter(Boolean);
}

async function loadHittingTrends() {
  document.getElementById('ht-status').style.display = 'block';
  document.getElementById('ht-spin').style.display = 'block';
  document.getElementById('ht-msg').textContent = 'Finding recent Red Sox games…';
  document.getElementById('ht-table-wrap').style.display = 'none';

  try {
    // Fetch full season game list first to set slider max accurately
    const allGames = await getLastGames(162, btHitYear);
    if (!allGames.length) throw new Error('No completed Red Sox games found.');
    btHitTotalGames = allGames.length;
    const htSlider = document.getElementById('hit-trend-range');
    if (htSlider) {
      htSlider.max = btHitTotalGames;
      if (hitTrendGames > btHitTotalGames) {
        hitTrendGames = btHitTotalGames;
        htSlider.value = hitTrendGames;
        document.getElementById('hit-trend-range-disp').textContent = hitTrendGames;
      }
    }
    // Only fetch box scores for the requested count
    const games = allGames.slice(0, Math.max(hitTrendGames, 10));

    document.getElementById('ht-msg').textContent = `Loading ${games.length} box scores…`;
    const boxes = await Promise.all(games.map(g => getBoxScore(g.gamePk)));

    // Build gamesMeta for hitting trends
    hitTrendGamesMeta = boxes.map((box, i) => {
      const g = games[i];
      const homeId = box.teams?.home?.team?.id;
      const isBosHome = homeId === BOS_ID;
      const opp = (isBosHome ? box.teams?.away?.team : box.teams?.home?.team)?.abbreviation || '?';
      const bosR = isBosHome ? box.teams?.home?.teamStats?.batting?.runs : box.teams?.away?.teamStats?.batting?.runs;
      const oppR = isBosHome ? box.teams?.away?.teamStats?.batting?.runs : box.teams?.home?.teamStats?.batting?.runs;
      const res = typeof bosR === 'number' && typeof oppR === 'number'
        ? (bosR > oppR ? `W ${bosR}-${oppR}` : bosR < oppR ? `L ${bosR}-${oppR}` : `T ${bosR}-${oppR}`) : '?';
      return { gamePk: g.gamePk, date: g.date, dateLabel: fmtDate(g.date), opponent: opp, isHome: isBosHome, result: res };
    });

    const pm = {};
    boxes.forEach((box, idx) => {
      extractHitters(box, hitTrendGamesMeta[idx].isHome).forEach(h => {
        if (!pm[h.id]) pm[h.id] = { id: h.id, name: h.name, pos: h.pos, games: [] };
        pm[h.id].games[idx] = { h: h.h, hr: h.hr, rbi: h.rbi, r: h.r, bb: h.bb, k: h.k, ab: h.ab };
      });
    });
    Object.values(pm).forEach(p => {
      for (let i = 0; i < hitTrendGamesMeta.length; i++)
        if (!p.games[i]) p.games[i] = null;
    });
    hitterTrendData = Object.values(pm)
      .filter(p => p.games.some(g => g !== null))
      .sort((a, b) => (b.games[0]?.h || 0) - (a.games[0]?.h || 0));

    document.getElementById('ht-status').style.display = 'none';
    document.getElementById('ht-table-wrap').style.display = 'block';
    renderHittingTrends();
    document.getElementById('hit-trend-src-note').textContent =
      `${hitTrendGamesMeta.length} games loaded · statsapi.mlb.com`;
  } catch(e) {
    document.getElementById('ht-spin').style.display = 'none';
    document.getElementById('ht-msg').textContent = '⚠ ' + e.message;
  }
}

function renderHittingTrends() {
  if (!hitterTrendData.length) return;
  const n = Math.min(hitTrendGames, hitTrendGamesMeta.length);
  const stat = htStat;
  const max = HT_STAT_MAX[stat];
  const lbl = HT_STAT_LABELS[stat];
  const color = HT_STAT_COLOR;
  const hasLive = !!(mlbLiveGame && mlbLiveBoxscore);

  // Extract live hitter data from boxscore if available
  const liveHitters = {};
  if (hasLive) {
    const side = mlbLiveGame.isHome ? 'home' : 'away';
    const batters = mlbLiveBoxscore.teams?.[side]?.batters || [];
    const playerInfo = mlbLiveBoxscore.teams?.[side]?.players || {};
    for (const pid of batters) {
      const key = `ID${pid}`;
      const pl = playerInfo[key];
      if (!pl) continue;
      const name = pl.person?.fullName || pl.person?.lastName || '?';
      const lastName = pl.person?.lastName || name.split(' ').pop();
      // Use game stats if present, else season stats
      const gameStats = pl.stats?.batting || {};
      const ssnStats  = pl.seasonStats?.batting || {};
      const s = Object.keys(gameStats).length > 0 ? gameStats : ssnStats;
      const entry = {
        h: s.hits||0, ab: s.atBats||0, hr: s.homeRuns||0,
        rbi: s.rbi||0, r: s.runs||0, bb: s.baseOnBalls||0,
        so: s.strikeOuts||0, avg: s.avg||'.000',
      };
      liveHitters[name] = entry;
      liveHitters[lastName] = entry;
    }
  }

  // Only show players who appeared in window OR are live
  const inWindow = hitterTrendData.filter(p =>
    p.games.slice(0,n).some(g=>g!==null) || (hasLive && (liveHitters[p.name] || liveHitters[p.name?.split(' ').pop()]))
  );

  // Add live-only players not in historical data at all
  if (hasLive) {
    const histNames = new Set(inWindow.map(p => p.name));
    for (const [lname, lstats] of Object.entries(liveHitters)) {
      // Only add full names (skip lastName duplicates — they have spaces or are short)
      if (lname.includes(' ') && !histNames.has(lname)) {
        inWindow.push({ name: lname, pos: '—', games: Array(n).fill(null) });
        histNames.add(lname);
      }
    }
  }
  const sorted = [...inWindow].sort((a,b) => {
    const lv = p => hasLive&&liveHitters[p.name] ? (liveHitters[p.name][stat]||0) : 0;
    const total = p => p.games.slice(0,n).filter(g=>g!==null).reduce((s,g)=>s+(g[stat]||0),0);
    return (total(b)+lv(b)) - (total(a)+lv(a));
  });

  // Live header
  const liveHdr = hasLive ? (() => {
    const g = mlbLiveGame;
    const half = g.half==='Top'?'▲':'▼';
    return `<th class="live-col" style="text-align:center;min-width:88px;background:#0C1F3F">
      ${liveBadge()}<br>
      <span style="font-size:9px;color:rgba(255,255,255,.7)">${half}${g.inning} ${g.isHome?'vs':'@'} ${g.oppAbbr}</span><br>
      <span style="font-size:9px;color:rgba(255,255,255,.85);font-weight:700">${g.bosScore??'0'}-${g.oppScore??'0'}</span>
    </th>`;
  })() : '';

  const gameHdrs = hitTrendGamesMeta.slice(0,n).map(g => {
    const isW=g.result.startsWith('W'), isL=g.result.startsWith('L');
    const resultColor=isW?'#3DAB6E':isL?'#FF6B6B':'rgba(255,255,255,.7)';
    const resultHtml=isW||isL
      ?`<span style="color:${resultColor}">${g.result[0]}</span><span style="color:#fff">${g.result.slice(1)}</span>`
      :`<span style="color:rgba(255,255,255,.7)">${g.result}</span>`;
    return `<th style="text-align:center;min-width:80px">
      <span style="font-size:10px;font-weight:700;color:rgba(255,255,255,.85)">${g.dateLabel} ${g.isHome?'vs':'@'} ${g.opponent}</span><br>
      <span style="font-size:10px;font-weight:700">${resultHtml}</span>
    </th>`;
  }).join('');

  const avgHdr = `<th class="col-frozen-right" style="text-align:center;background:#0C1F3F">
    <span style="font-size:10px;font-weight:700;color:rgba(255,255,255,.85)">${lbl} Total</span><br>
    <span style="font-size:9px;font-weight:400;opacity:.7">Last ${n} G</span>
  </th>`;

  document.getElementById('ht-thead').innerHTML = `<tr>
    <th class="col-frozen-left" style="background:#0C1F3F;color:rgba(255,255,255,.85)">Hitter</th>
    ${liveHdr}${gameHdrs}${avgHdr}
  </tr>`;

  document.getElementById('ht-tbody').innerHTML = sorted.map(p => {
    const liveStats = hasLive ? (liveHitters[p.name]||null) : null;
    const liveCell = hasLive ? (() => {
      if (!liveStats) return `<td class="live-col" style="padding:4px;text-align:center;opacity:.3">—</td>`;
      const v = liveStats[stat]||0;
      const statsLine = `<div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-top:2px;text-align:center">
        <span style="opacity:.55">H</span>${liveStats.h} <span style="opacity:.55">AB</span>${liveStats.ab}${liveStats.hr?` <span style="opacity:.55">HR</span>${liveStats.hr}`:''}</div>`;
      return `<td class="live-col" style="vertical-align:top;padding:4px;text-align:center;">${baseballBubble(v,max,color)}${statsLine}</td>`;
    })() : '';

    const games = p.games.slice(0,n);
    const playedGames = games.filter(g=>g!==null);
    const histTotal = playedGames.reduce((s,g)=>s+(g[stat]||0),0);
    const liveVal   = liveStats ? (liveStats[stat]||0) : 0;
    const total     = histTotal + liveVal;

    const gameCells = games.map(g => {
      const v = g?.[stat]||0;
      const statsLine = g?`<div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-top:2px;text-align:center"><span style="opacity:.55">H</span>${g.h} <span style="opacity:.55">AB</span>${g.ab}${g.hr?` <span style="opacity:.55">HR</span>${g.hr}`:''}</div>`:'';
      return `<td style="vertical-align:top;padding:4px;text-align:center">${baseballBubble(v,max,color)}${statsLine}</td>`;
    }).join('');

    return `<tr>
      <td class="col-frozen-left" style="padding:5px 11px">
        <span class="pname">${p.name}</span>
        <div style="font-family:var(--mono);font-size:9px;color:var(--muted)">${p.pos}</div>
      </td>
      ${liveCell}${gameCells}
      <td class="col-frozen-right" style="text-align:center;font-family:var(--display);font-size:16px;font-weight:800;color:#2D5A1B;background:#fff">${total}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="${n+2+(hasLive?1:0)}" style="text-align:center;padding:24px;color:var(--faint)">No data.</td></tr>`;
}

function onBtHitSeasonChange() {
  const sel = document.getElementById('bt-hit-season-select');
  if (!sel) return;
  btHitYear = +sel.value;
  hitTrendGames = 5;
  const slider = document.getElementById('hit-trend-range');
  if (slider) { slider.max = 162; slider.value = 5; }
  document.getElementById('hit-trend-range-disp').textContent = '5';
  hitterTrendData = [];
  hitTrendGamesMeta = [];
  _cache.forEach((v, k) => { if (k.includes('schedule')) _cache.delete(k); });
  loadHittingTrends();
}

function populateBtSeasonDropdowns() {
  const yr = new Date().getFullYear();
  ['bt-pitch-season-select','bt-hit-season-select'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '';
    for (let y = yr; y >= 2015; y--) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y === yr ? `${y} (Current)` : String(y);
      if (y === yr) opt.selected = true;
      sel.appendChild(opt);
    }
  });
}
