// ════════════════════════════════════════
//  APP — Tab routing, main data load, team selection
// ════════════════════════════════════════
let currentTab  = 'mlb-standings';
let dataLoaded  = false;

// ── Team theme helpers ─────────────────────────────────────────────────────
function applyMlbTeamTheme(abbr, name) {
  document.querySelectorAll('.mlb-team-sel').forEach(el => el.value = String(selectedMlbTeamId));
  document.querySelectorAll('#mlb-team-badge').forEach(el => el.textContent = name);
}
function applyNbaTeamTheme(abbr, name) {
  document.querySelectorAll('.nba-team-sel').forEach(el => el.value = String(selectedNbaTeamId));
  document.querySelectorAll('#nba-team-badge').forEach(el => el.textContent = name);
}

// ── Team selection ─────────────────────────────────────────────────────────
function selectNbaTeam(espnId, abbr, name, conf) {
  selectedNbaTeamId   = espnId;
  selectedNbaTeamAbbr = abbr;
  selectedNbaTeamName = name;
  bktData = []; hooperData = [];
  applyNbaTeamTheme(abbr, name);
  if (conf && conf !== nbaStdConf) {
    const confBtn = [...document.querySelectorAll('#pane-nba-standings .seg-btn')].find(b=>b.textContent.trim()===conf);
    setNbaStdConf(conf, confBtn||null);
  }
  if (currentTab === 'basketball-trends') { loadBktTrends(); }
  else if (currentTab === 'hoopers')       { loadHoopers(); }
  else if (currentTab === 'nba-standings') {
    renderNbaStandings();
    loadBktTrends(); // pre-load trends in background
  }
  else { loadBktTrends(); }
}

function selectMlbTeam(teamId, abbr, name, league) {
  selectedMlbTeamId   = teamId;
  selectedMlbTeamAbbr = abbr;
  selectedMlbTeamName = name;
  pitcherData = []; hitterTrendData = []; hitterData = []; gamesMeta = [];
  pitchingStatsData = [];
  applyMlbTeamTheme(abbr, name);
  if (league && league !== mlbStdLeague) {
    const lgBtn = [...document.querySelectorAll('#pane-mlb-standings .seg-btn')].find(b=>b.textContent.trim()===league);
    setMlbStdLeague(league, lgBtn||null);
  }
  if (currentTab === 'baseball-trends' || currentTab === 'sluggers') {
    loadAll();
  } else if (currentTab === 'mlb-standings') {
    // Stay on standings, but also pre-load data in background for when user navigates
    renderMlbStandings();
    loadAll(); // reload data for selected team silently
  } else {
    loadAll();
  }
}

function goToNbaTeam(espnId, abbr, name, conf) {
  selectedNbaTeamId   = espnId;
  selectedNbaTeamAbbr = abbr;
  selectedNbaTeamName = name;
  bktData = []; hooperData = [];
  applyNbaTeamTheme(abbr, name);
  if (conf && conf !== nbaStdConf) {
    const confBtn = [...document.querySelectorAll('#pane-nba-standings .seg-btn')].find(b=>b.textContent.trim()===conf);
    setNbaStdConf(conf, confBtn||null);
  }
  document.querySelectorAll('.tab').forEach(t => {
    if (t.getAttribute('onclick')?.includes("'hoopers'")) t.click();
  });
}

function goToMlbTeam(teamId, abbr, name, league) {
  selectedMlbTeamId   = teamId;
  selectedMlbTeamAbbr = abbr;
  selectedMlbTeamName = name;
  pitcherData = []; hitterTrendData = []; hitterData = []; gamesMeta = [];
  pitchingStatsData = [];
  applyMlbTeamTheme(abbr, name);
  if (league && league !== mlbStdLeague) {
    const lgBtn = [...document.querySelectorAll('#pane-mlb-standings .seg-btn')].find(b=>b.textContent.trim()===league);
    setMlbStdLeague(league, lgBtn||null);
  }
  document.querySelectorAll('.tab').forEach(t => {
    if (t.getAttribute('onclick')?.includes("'sluggers'")) t.click();
  });
}

// ════════════════════════════════════════
//  MAIN LOAD
// ════════════════════════════════════════
async function loadAll() {
  const btn = document.getElementById('btn-ref');
  btn.classList.add('loading'); btn.disabled=true;
  clearErr();
  document.getElementById('pane-baseball-trends').style.display='none';
  showStatus(`Finding last ${pitchGames} ${selectedMlbTeamName || 'Red Sox'} games…`,'',true);
  try {
    const games = await getLastGames(pitchGames);
    if (!games.length) throw new Error('No completed Red Sox games found — season may not have started yet.');
    showStatus(`Loading ${games.length} ${selectedMlbTeamName||'Red Sox'} box scores…`,'',true);
    const boxes = await Promise.all(games.map(g => getBoxScore(g.gamePk)));
    const enriched = boxes.map((box, i) => {
      const g = games[i];
      const homeId = box.teams?.home?.team?.id;
      const isBosHome = homeId===selectedMlbTeamId;
      const opp = (isBosHome?box.teams?.away?.team:box.teams?.home?.team)?.abbreviation||'?';
      const bosR = isBosHome?box.teams?.home?.teamStats?.batting?.runs:box.teams?.away?.teamStats?.batting?.runs;
      const oppR = isBosHome?box.teams?.away?.teamStats?.batting?.runs:box.teams?.home?.teamStats?.batting?.runs;
      const res = typeof bosR==='number'&&typeof oppR==='number'?(bosR>oppR?`W ${bosR}-${oppR}`:bosR<oppR?`L ${bosR}-${oppR}`:`T ${bosR}-${oppR}`):'?';
      return {gamePk:g.gamePk,date:g.date,dateLabel:fmtDate(g.date),opponent:opp,isHome:isBosHome,result:res,pitchers:extractPitchers(box,isBosHome,g.decisions||{})};
    });
    const pm = {};
    enriched.forEach((gd,idx)=>{
      gd.pitchers.forEach(p=>{
        if (!pm[p.id]) pm[p.id]={id:p.id,name:p.name,role:p.role,games:[],gameLines:[],totalER:0,totalIP:0,totalHits:0,totalRuns:0};
        pm[p.id].games[idx]=p.pitches;
        pm[p.id].gameLines[idx]={ip:p.ipDisplay||'0',hits:p.hits||0,er:p.er||0,decision:p.decision||null};
        pm[p.id].totalER+=p.er||0;
        pm[p.id].totalIP+=p.ip||0;
        if (idx===0) pm[p.id].role=p.role;
      });
    });
    Object.values(pm).forEach(p=>{
      for(let i=0;i<enriched.length;i++){
        if(p.games[i]===undefined) p.games[i]=0;
        if(p.gameLines[i]===undefined) p.gameLines[i]=null;
      }
      p.era = p.totalIP>0?(p.totalER/p.totalIP*9).toFixed(2):(p.totalER>0?'∞':(p.games.some(g=>g>0)?'0.00':'—'));
    });
    pitcherData=Object.values(pm); gamesMeta=enriched;

    // Fetch hitters in parallel with the already-completed pitching work
    showStatus(`Loading ${selectedMlbTeamName||'Red Sox'} hitting stats…`,'',true);
    hitterData = await getHitters(hitGameType, hitDays);
    dataLoaded=true;
    window.dataLoaded=true;
    applyMlbTeamTheme(selectedMlbTeamAbbr, selectedMlbTeamName);
    hideStatus();
    renderPitching(); renderHitting();
    if(window._nsTarget){
      const t=window._nsTarget; window._nsTarget=null;
      setTimeout(()=>{document.querySelectorAll('.tab').forEach(b=>{if(b.getAttribute('onclick')?.includes("'"+t+"'"))b.click();});},50);
    } else {
      switchTab(currentTab, document.querySelector('.tab.active'));
    }
    document.getElementById('upd-val').textContent=new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
    // Defer live MLB check so it doesn't block rendering
    setTimeout(() => startMlbLiveRefresh(), 1000);
  } catch(err) {
    showStatus('Could not load data','',false);
    showErr(err.message, err.message.includes('fetch') || err.message.includes('network') || err.message.includes('timeout')
      ? 'Network issue — try clicking Refresh. If it keeps failing, a CORS proxy may be down.'
      : 'Click Refresh to try again.');
    console.error(err);
  }
  btn.classList.remove('loading'); btn.disabled=false;
}

// ════════════════════════════════════════
//  STATUS / ERROR
// ════════════════════════════════════════
function showStatus(msg,sub,loading){
  document.getElementById('status-area').style.display='block';
  document.getElementById('ld-msg').textContent=msg;
  document.getElementById('ld-sub').textContent=sub||'';
  document.getElementById('ld-spin').style.display=loading?'block':'none';
}
function hideStatus(){document.getElementById('status-area').style.display='none';}
function showErr(msg,tip){
  const b=document.getElementById('err-box');b.style.display='block';
  document.getElementById('err-detail').textContent=msg;
  document.getElementById('err-tip').textContent=tip||'';
}
function clearErr(){document.getElementById('err-box').style.display='none';}

// ════════════════════════════════════════
//  TAB SWITCH
// ════════════════════════════════════════
function switchTab(name,el) {
  currentTab=name;
  window.scrollTo({top:0,behavior:'instant'});
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  if(el) el.classList.add('active');
  const ALL_PANES = ['pane-sluggers','pane-baseball-trends',
    'pane-basketball-trends','pane-hoopers','pane-archive','pane-worldcup',
    'pane-nba-standings','pane-mlb-standings'];
  ALL_PANES.forEach(id => { const el=document.getElementById(id); if(el) el.style.display='none'; });
  if(name==='sluggers'){                   document.getElementById('pane-sluggers').style.display='block'; if(dataLoaded) renderHitting(); if(!pitchingStatsData.length) reloadPitchingStats(); applyMlbTeamTheme(selectedMlbTeamAbbr,selectedMlbTeamName); }
  if(name==='baseball-trends'&&dataLoaded){document.getElementById('pane-baseball-trends').style.display='block'; applyMlbTeamTheme(selectedMlbTeamAbbr,selectedMlbTeamName); }
  if(name==='basketball-trends'){          document.getElementById('pane-basketball-trends').style.display='block'; if(!bktData.length) loadBktTrends(); setTimeout(()=>applyNbaTeamTheme(selectedNbaTeamAbbr,selectedNbaTeamName),100); }
  if(name==='hoopers'){                    document.getElementById('pane-hoopers').style.display='block'; if(!hooperData.length) loadHoopers(); setTimeout(()=>applyNbaTeamTheme(selectedNbaTeamAbbr,selectedNbaTeamName),100); }
  if(name==='archive'){                    document.getElementById('pane-archive').style.display='block'; loadVault(); if(archiveSub==='draft') loadDraft(); }
  if(name==='vault'){                      document.getElementById('pane-archive').style.display='block'; loadVault(); } // legacy
  if(name==='worldcup'){                   document.getElementById('pane-worldcup').style.display='block'; if(!wcInitDone){wcInitDone=true;renderWC();} }
  if(name==='nba-standings'){              document.getElementById('pane-nba-standings').style.display='block'; if(!nbaStdData.length) loadNbaStandings(); loadNbaTodayGames(); applyNbaTeamTheme(selectedNbaTeamAbbr,selectedNbaTeamName); }
  if(name==='mlb-standings'){              document.getElementById('pane-mlb-standings').style.display='block'; if(!mlbStdData.length) loadMlbStandings(); loadMlbTodayGames(); applyMlbTeamTheme(selectedMlbTeamAbbr,selectedMlbTeamName); }
}

// ════════════════════════════════════════
//  TRENDS SUB-PAGE TOGGLES
// ════════════════════════════════════════
function setSluggerSub(sub, el) {
  document.querySelectorAll('#slug-sub-hitters, #slug-sub-pitchers').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('slug-pane-hitters').style.display  = sub === 'hitters'  ? 'block' : 'none';
  document.getElementById('slug-pane-pitchers').style.display = sub === 'pitchers' ? 'block' : 'none';
  if (sub === 'pitchers' && !pitchingStatsData.length) reloadPitchingStats();
}

function setBTrendSub(sub, el) {
  document.querySelectorAll('#bt-sub-pitching, #bt-sub-hitting').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('bt-pane-pitching').style.display = sub === 'pitching' ? 'block' : 'none';
  document.getElementById('bt-pane-hitting').style.display  = sub === 'hitting'  ? 'block' : 'none';
  if (sub === 'hitting' && !hitterTrendData.length) loadHittingTrends();
}

function setBktTrendSub(sub, el) {
  document.querySelectorAll('#bkt-sub-scoring, #bkt-sub-shooting').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('bkt-pane-scoring').style.display  = sub === 'scoring'  ? 'block' : 'none';
  document.getElementById('bkt-pane-shooting').style.display = sub === 'shooting' ? 'block' : 'none';
}

// ════════════════════════════════════════
//  STARTUP — Populate dropdowns & kick off data load
// ════════════════════════════════════════
(function() {
  populateBtSeasonDropdowns();
})();

(function() {
  const sel=document.getElementById('hit-year-select');
  if(!sel) return;
  const currentYear=new Date().getFullYear();
  for(let yr=currentYear;yr>=2015;yr--){
    const opt=document.createElement('option');
    opt.value=yr; opt.textContent=yr===currentYear?yr+' (current)':yr;
    if(yr===currentYear) opt.selected=true;
    sel.appendChild(opt);
  }
})();

// Populate basketball trends season dropdown
(function() {
  const sel = document.getElementById('bkt-season-select');
  if (!sel) return;
  const current = currentNBASeason();
  const startYr = parseInt(current.split('-')[0]);
  for (let yr = startYr; yr >= startYr - 9; yr--) {
    const val = `${yr}-${String(yr+1).slice(2)}`;
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = yr === startYr ? `${yr}–${String(yr+1).slice(2)} (Current)` : `${yr}–${String(yr+1).slice(2)}`;
    if (yr === startYr) opt.selected = true;
    sel.appendChild(opt);
  }
  bktInitDone = true;
  // Auto-select Playoffs if it's April or later (NBA playoff season)
  const nowMonth = new Date().getMonth() + 1; // 1-12
  if (nowMonth >= 4 && nowMonth <= 6) {
    bktSeasonType = 3;
    document.getElementById('bkt-type-reg')?.classList.remove('active');
    document.getElementById('bkt-type-post')?.classList.add('active');
  }
})();

// Populate pitching stats year dropdown
(function() {
  const sel = document.getElementById('pstat-year-select');
  if (!sel) return;
  const yr = new Date().getFullYear();
  for (let y = yr; y >= 2000; y--) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y === yr ? y + ' (current)' : y;
    if (y === yr) opt.selected = true;
    sel.appendChild(opt);
  }
})();

// Populate NBA hoopers season dropdown — last 25 years
(function() {
  const sel = document.getElementById('nba-season-select');
  if (!sel) return;
  const current = currentNBASeason();
  const startYr = parseInt(current.split('-')[0]);
  for (let yr = startYr; yr >= startYr - 23; yr--) {
    const val = `${yr}-${String(yr+1).slice(2)}`;
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = yr === startYr
      ? `${yr}–${String(yr+1).slice(2)} (Current)`
      : `${yr}–${String(yr+1).slice(2)}`;
    if (yr === startYr) opt.selected = true;
    sel.appendChild(opt);
  }
})();

// Populate MLB standings season dropdown — default to current year
(function() {
  const sel = document.getElementById('mlb-std-season');
  if (!sel) return;
  const yr = new Date().getFullYear();
  for (let y = yr; y >= 2015; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y === yr ? `${y} (current)` : y;
    if (y === yr) opt.selected = true;
    sel.appendChild(opt);
  }
})();

// Start on DOM ready
loadAll();
