// ════════════════════════════════════════
//  MLB LIVE GAME DETECTION & AUTO-REFRESH
// ════════════════════════════════════════
let mlbLiveGame   = null; // { gamePk, oppAbbr, isHome }
let mlbLiveTimer  = null;
let mlbLiveBoxscore = null;

async function checkMlbLiveGame() {
  try {
    const data = await apiFetch(
      `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${selectedMlbTeamId}&date=${todayStr()}&hydrate=team,linescore`
    );
    for (const day of (data.dates||[])) {
      for (const g of (day.games||[])) {
        if (g.status?.abstractGameState==='Live') {
          const homeId   = g.teams?.home?.team?.id;
          const isHome   = homeId===selectedMlbTeamId;
          const oppTeam  = isHome ? g.teams?.away?.team : g.teams?.home?.team;
          // Score: try linescore.teams first (most reliable live), fallback to teams
          const lsTeams = g.linescore?.teams;
          const bosRuns = isHome
            ? (lsTeams?.home?.runs ?? g.teams?.home?.score ?? 0)
            : (lsTeams?.away?.runs ?? g.teams?.away?.score ?? 0);
          const oppRuns = isHome
            ? (lsTeams?.away?.runs ?? g.teams?.away?.score ?? 0)
            : (lsTeams?.home?.runs ?? g.teams?.home?.score ?? 0);
          mlbLiveGame = {
            gamePk:  g.gamePk,
            oppAbbr: oppTeam?.abbreviation||'?',
            isHome,
            inning:  g.linescore?.currentInning,
            half:    g.linescore?.inningHalf,
            bosScore: bosRuns,
            oppScore: oppRuns,
          };
          return true;
        }
      }
    }
  } catch(e) {}
  mlbLiveGame = null;
  return false;
}

async function refreshMlbLive() {
  if (!mlbLiveGame) return;
  try {
    // Check if still live
    const liveCheck = await apiFetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${selectedMlbTeamId}&date=${todayStr()}&hydrate=team,linescore`);
    for (const day of (liveCheck.dates||[])) {
      for (const g of (day.games||[])) {
        if (g.gamePk===mlbLiveGame.gamePk) {
          if (g.status?.abstractGameState!=='Live') {
            mlbLiveGame=null; clearInterval(mlbLiveTimer); mlbLiveTimer=null;
            loadAll(); return;
          }
        }
      }
    }
    // Fetch fresh live data
    await fetchAndInjectMlbLive();
  } catch(e) {}
}

function injectMlbLiveData(box) {
  mlbLiveBoxscore = box;
  if (hitterTrendData.length) renderHittingTrends();
  // Pitching trends uses the main renderPitching — re-render it too
  if (pitcherData.length) renderPitching();
}

async function startMlbLiveRefresh() {
  const isLive = await checkMlbLiveGame();
  if (!isLive) { mlbLiveBoxscore = null; return; }
  // Fetch initial live feed immediately
  await fetchAndInjectMlbLive();
  const g = mlbLiveGame;
  const half = g.half==='Top'?'▲':'▼';
  const srcEl = document.getElementById('pitch-src-note');
  if (srcEl) srcEl.innerHTML += ` &nbsp;🔴 LIVE ${half}${g.inning} ${g.isHome?'vs ':'@ '}${g.oppAbbr} ${g.bosScore??0}-${g.oppScore??0}`;
  if (mlbLiveTimer) clearInterval(mlbLiveTimer);
  mlbLiveTimer = setInterval(refreshMlbLive, 60000);
}

async function fetchAndInjectMlbLive() {
  if (!mlbLiveGame) return;
  try {
    // v1.1 live feed — bypass cache for real-time data
    const liveUrl = `https://statsapi.mlb.com/api/v1.1/game/${mlbLiveGame.gamePk}/feed/live`;
    let feed = null;
    // Try direct first (no cache), then proxies
    const proxies = [
      u => u,
      u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    ];
    for (const p of proxies) {
      try {
        const r = await fetch(p(liveUrl), { signal: AbortSignal.timeout(8000), cache: 'no-store' });
        if (r.ok) { feed = await r.json(); break; }
      } catch(e) {}
    }
    if (!feed) throw new Error('Could not fetch live feed');
    // Update score from live linescore
    const ls = feed?.liveData?.linescore;
    if (ls) {
      mlbLiveGame.inning   = ls.currentInning;
      mlbLiveGame.half     = ls.inningHalf;
      mlbLiveGame.bosScore = mlbLiveGame.isHome ? (ls.teams?.home?.runs ?? 0) : (ls.teams?.away?.runs ?? 0);
      mlbLiveGame.oppScore = mlbLiveGame.isHome ? (ls.teams?.away?.runs ?? 0) : (ls.teams?.home?.runs ?? 0);
    }
    // Extract boxscore — live feed structure: feed.liveData.boxscore
    const box = feed?.liveData?.boxscore;
    if (box) {
      injectMlbLiveData(box);
    }
  } catch(e) {
    console.warn('Live feed failed, trying boxscore fallback:', e.message);
    try {
      const box = await apiFetch(`https://statsapi.mlb.com/api/v1/game/${mlbLiveGame.gamePk}/boxscore`);
      injectMlbLiveData(box);
    } catch(e2) { console.warn('Boxscore fallback also failed:', e2.message); }
  }
}
