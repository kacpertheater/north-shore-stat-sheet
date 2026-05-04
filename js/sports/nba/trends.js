// ════════════════════════════════════════
//  BASKETBALL SCORING TRENDS
// ════════════════════════════════════════
let bktGames = 5;
let bktStat = 'pts';
let bktSeasonYear = null;
let bktSeasonType = 2; // 2=regular, 3=playoffs
let bktData = [];
let bktGamesMeta = [];

function setBktSeasonType(type, el) {
  bktSeasonType = type;
  document.querySelectorAll('#bkt-type-reg,#bkt-type-post').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  bktData = []; bktGamesMeta = [];
  if (bktInitDone) loadBktTrends();
}
let bktInitDone = false;
let bktRangeTimer;

const BKT_STAT_COLOR  = '#3DAB6E';

const NBA_TEAM_ID_FULL = '1610612738'; // Celtics

const ESPN_BOS_ID = '2'; // ESPN team ID for Celtics (legacy — use selectedNbaTeamId)

async function fetchESPNSchedule(season, seasonType) {
  // ESPN team schedule — seasontype: 2=regular, 3=postseason
  const yr  = parseInt(season.split('-')[0]);
  const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${selectedNbaTeamId}/schedule?season=${yr+1}&seasontype=${seasonType || 2}`;
  const r = await apiFetch(url);
  return r;
}

async function fetchESPNBoxscore(gameId) {
  const url = `https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`;
  const r = await apiFetch(url);
  return r;
}

function setBktStat(stat, el) {
  bktStat = stat;
  document.querySelectorAll('#bkt-stat-pts,#bkt-stat-reb,#bkt-stat-ast,#bkt-stat-stl,#bkt-stat-blk,#bkt-stat-min').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  renderBktTrends();
}

function onBktRangeInput(v) {
  bktGames = +v;
  document.getElementById('bkt-range-disp').textContent = v;
  clearTimeout(bktRangeTimer);
  bktRangeTimer = setTimeout(renderBktTrends, 200);
}

// ════════════════════════════════════════
//  LIVE GAME DETECTION & AUTO-REFRESH (NBA)
// ════════════════════════════════════════
let bktLiveGame   = null; // { eventId, oppAbbr, isHome }
let bktLiveData   = null; // live player stats object
let bktLiveTimer  = null;

async function checkNbaLiveGame() {
  try {
    const today = todayStr().replace(/-/g,'');
    const data  = await apiFetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${today}`);
    for (const ev of (data.events||[])) {
      const comp  = ev.competitions?.[0];
      const state = comp?.status?.type?.state;
      const teams = comp?.competitors||[];
      const bosTeam = teams.find(t => t.team?.abbreviation===selectedNbaTeamAbbr||t.team?.id===selectedNbaTeamId);
      if (!bosTeam) continue;
      if (state === 'in') {
        const oppTeam = teams.find(t => t.team?.abbreviation!==selectedMlbTeamAbbr);
        bktLiveGame = {
          eventId: ev.id,
          oppAbbr: oppTeam?.team?.abbreviation||'?',
          isHome:  bosTeam.homeAway==='home',
          period:  comp?.status?.period,
          clock:   comp?.status?.displayClock,
          bosScore: bosTeam.score||'0',
          oppScore: oppTeam?.score||'0',
        };
        return true;
      }
    }
  } catch(e) {}
  bktLiveGame = null;
  return false;
}

async function fetchNbaLiveBoxscore() {
  if (!bktLiveGame) return null;
  try {
    const box     = await fetchESPNBoxscore(bktLiveGame.eventId);
    // Update score/clock
    const comp    = box?.header?.competitions?.[0];
    bktLiveGame.period   = comp?.status?.period   || bktLiveGame.period;
    bktLiveGame.clock    = comp?.status?.displayClock || bktLiveGame.clock;
    const bosComp = comp?.competitors?.find(t=>t.team?.abbreviation===selectedNbaTeamAbbr||t.team?.id===selectedNbaTeamId);
    const oppComp = comp?.competitors?.find(t=>t.team?.abbreviation!==selectedNbaTeamAbbr&&t.team?.id!==selectedNbaTeamId);
    bktLiveGame.bosScore = bosComp?.score||'0';
    bktLiveGame.oppScore = oppComp?.score||'0';

    const bosBox  = box?.boxscore?.players?.find(t=>t.team?.abbreviation===selectedNbaTeamAbbr||t.team?.id===selectedNbaTeamId);
    const stats   = bosBox?.statistics?.[0];
    if (!stats) return null;
    const labels  = stats.labels||[];
    const iPts=labels.indexOf('PTS'),iReb=labels.indexOf('REB'),
          iAst=labels.indexOf('AST'),iStl=labels.indexOf('STL'),iBlk=labels.indexOf('BLK'),
          iMin=labels.indexOf('MIN');

    const players = {};
    for (const ath of (stats.athletes||[])) {
      const name = ath.athlete?.shortName||ath.athlete?.displayName||'?';
      const vals = ath.stats||[];
      const p = i => parseFloat(vals[i])||0;
      players[name] = { pts:p(iPts),reb:p(iReb),ast:p(iAst),stl:p(iStl),blk:p(iBlk),min:p(iMin) };
    }
    return players;
  } catch(e) { return null; }
}

async function startBktLiveRefresh() {
  const isLive = await checkNbaLiveGame();
  if (!isLive) { bktLiveData = null; return; }
  bktLiveData = await fetchNbaLiveBoxscore();
  if (bktLiveTimer) clearInterval(bktLiveTimer);
  bktLiveTimer = setInterval(refreshBktLive, 60000);
}

async function refreshBktLive() {
  if (!bktLiveGame) return;
  const players = await fetchNbaLiveBoxscore();
  if (!players) return;
  bktLiveData = players;
  renderBktTrends();
  // Update source note
  const g = bktLiveGame;
  const scoreStr = `${g.bosScore}-${g.oppScore}`;
  const oppStr   = `${g.isHome?'vs ':'@ '}${g.oppAbbr}`;
  document.getElementById('bkt-src-note').textContent =
    `🔴 LIVE Q${g.period} ${g.clock} ${oppStr} ${scoreStr} · auto-refreshes every 60s`;
}

function injectBktLiveData(data) {
  bktLiveData = data;
  renderBktTrends();
}

// Current NBA season: Oct-Dec year X = "X-(X+1 last 2)", Jan-Sep year X = "(X-1)-X"
function currentNBASeason() {
  const now = new Date();
  const yr = now.getFullYear();
  const mo = now.getMonth() + 1; // 1-12
  if (mo >= 10) return `${yr}-${String(yr+1).slice(2)}`; // Oct onwards = new season
  return `${yr-1}-${String(yr).slice(2)}`; // Jan-Sep = previous year's season
}

async function loadBktTrends() {
  const sel = document.getElementById('bkt-season-select');
  if (!sel) return;
  bktSeasonYear = sel.value;
  document.getElementById('bkt-status').style.display = 'block';
  document.getElementById('bkt-spin').style.display = 'block';
  document.getElementById('bkt-msg').textContent = `Loading ${selectedNbaTeamName} schedule…`;
  document.getElementById('bkt-table-wrap').style.display = 'none';
  bktData = [];
  // Reset slider max to 82 until we know actual game count
  const sliderEl = document.getElementById('bkt-range');
  const maxGames = bktSeasonType === 3 ? 28 : 82;
  if (sliderEl) { sliderEl.max = maxGames; sliderEl.value = Math.min(bktGames, 5); }
  bktGames = Math.min(bktGames, 5);
  document.getElementById('bkt-range-disp').textContent = bktGames;

  try {
    // Step 1: get schedule to find completed game IDs
    const sched = await fetchESPNSchedule(bktSeasonYear, bktSeasonType);
    const events = sched?.events || [];

    // Filter to completed games, newest first
    let completed = events
      .filter(e => e.competitions?.[0]?.status?.type?.completed)
      .reverse()
      .slice(0, 30); // playoffs: max ~28 games; regular season: cap at 82 below

    // If playoffs and no games, try regular season as fallback (and vice versa)
    if (!completed.length) {
      const otherType = bktSeasonType === 2 ? 3 : 2;
      const otherSched = await fetchESPNSchedule(bktSeasonYear, otherType);
      const otherEvents = otherSched?.events || [];
      const otherCompleted = otherEvents
        .filter(e => e.competitions?.[0]?.status?.type?.completed)
        .reverse()
        .slice(0, otherType === 2 ? 82 : 30);
      if (otherCompleted.length) {
        bktSeasonType = otherType;
        document.getElementById('bkt-type-reg')?.classList.toggle('active', otherType === 2);
        document.getElementById('bkt-type-post')?.classList.toggle('active', otherType === 3);
        completed = otherCompleted;
      }
    }

    // For regular season cap at 82
    if (bktSeasonType === 2) completed = completed.slice(0, 82);

    if (!completed.length) throw new Error('No completed games found for this season.');

    document.getElementById('bkt-msg').textContent = `Loading ${completed.length} boxscores…`;

    // Step 2: fetch boxscores in parallel (batches of 6 to avoid rate limits)
    const bktGamesMetaLocal = [];
    const playerMap = {};

    const batchSize = 6;
    for (let i = 0; i < completed.length; i += batchSize) {
      const batch = completed.slice(i, i + batchSize);
      document.getElementById('bkt-msg').textContent = `Loading boxscores ${i+1}–${Math.min(i+batchSize, completed.length)} of ${completed.length}…`;
      await Promise.all(batch.map(async (ev, bi) => {
        const gIdx = i + bi;
        try {
          const box = await fetchESPNBoxscore(ev.id);
          const comp = box?.header?.competitions?.[0];
          const bosComp = comp?.competitors?.find(t => t.team?.abbreviation===selectedNbaTeamAbbr||t.team?.id===selectedNbaTeamId);
          const oppComp = comp?.competitors?.find(t => t.team?.abbreviation!==selectedNbaTeamAbbr&&t.team?.id!==selectedNbaTeamId);
          const result = bosComp?.winner ? 'W' : 'L';
          const bosScore = bosComp?.score || '0';
          const oppScore = oppComp?.score || '0';
          const oppAbbr = oppComp?.team?.abbreviation || '?';
          const isHome = bosComp?.homeAway === 'home';
          const dateStr = (ev.date||'').slice(5,10).replace('-','/'); // MM/DD

          bktGamesMetaLocal[gIdx] = { date: dateStr, opp: `${isHome?'vs ':'@ '}${oppAbbr}`, result, score:`${bosScore}-${oppScore}` };

          // Player stats from boxscore
          const bosBox = box?.boxscore?.players?.find(t => t.team?.abbreviation===selectedNbaTeamAbbr||t.team?.id===selectedNbaTeamId);
          const stats = bosBox?.statistics?.[0];
          if (!stats) return;
          const labels = stats.labels || [];
          const iPts = labels.indexOf('PTS'), iReb = labels.indexOf('REB'),
                iAst = labels.indexOf('AST'), iStl = labels.indexOf('STL'),
                iBlk = labels.indexOf('BLK'), iMin = labels.indexOf('MIN');
          for (const ath of (stats.athletes||[])) {
            const name = ath.athlete?.shortName || ath.athlete?.displayName || '?';
            const vals = ath.stats || [];
            const p = (i) => parseFloat(vals[i]) || 0;
            if (!playerMap[name]) playerMap[name] = [];
            playerMap[name][gIdx] = {
              pts:p(iPts), reb:p(iReb), ast:p(iAst), stl:p(iStl), blk:p(iBlk), min:p(iMin)
            };
          }
        } catch(e) { /* skip failed game */ }
      }));
    }

    // Step 3: build bktData — all players who appeared in ANY game in the loaded range
    bktData = Object.entries(playerMap)
      .filter(([, games]) => games.some(g => g)) // appeared in at least one game
      .map(([name, gameArr]) => ({
        name,
        games: bktGamesMetaLocal.map((g, i) => g ? ({ ...(gameArr[i]||{pts:0,reb:0,ast:0,stl:0,blk:0}), ...g }) : null).filter(Boolean)
      }))
      .sort((a,b) => (b.games[0]?.pts||0) - (a.games[0]?.pts||0));

    bktGamesMeta = bktGamesMetaLocal.filter(Boolean);

    // Cap slider max to actual games loaded so you can't slide past available data
    const actualGameCount = bktGamesMeta.length;
    const slider = document.getElementById('bkt-range');
    if (slider) {
      slider.max = actualGameCount;
      if (bktGames > actualGameCount) {
        bktGames = Math.min(5, actualGameCount);
        slider.value = bktGames;
        document.getElementById('bkt-range-disp').textContent = bktGames;
      }
    }

    document.getElementById('bkt-status').style.display = 'none';
    document.getElementById('bkt-table-wrap').style.display = 'block';

    // Check for live game and start auto-refresh if found
    const isLive = await checkNbaLiveGame();
    if (isLive) {
      bktLiveData = await fetchNbaLiveBoxscore();
      if (bktLiveTimer) clearInterval(bktLiveTimer);
      bktLiveTimer = setInterval(refreshBktLive, 60000);
    } else {
      bktLiveData = null;
      if (bktLiveTimer) { clearInterval(bktLiveTimer); bktLiveTimer = null; }
    }

    renderBktTrends();
    const typeLabel = bktSeasonType === 3 ? 'playoff' : 'regular season';
    document.getElementById('bkt-src-note').textContent =
      `${bktData.length} players · ${actualGameCount} ${typeLabel} games loaded · ESPN`;
  } catch(e) {
    document.getElementById('bkt-spin').style.display = 'none';
    document.getElementById('bkt-msg').textContent = '⚠ ' + e.message;
  }
}


function basketballBubble(v, max, color) {
  const pct = Math.min(100, Math.round((v||0) / max * 100));
  if (!v) return `<div class="bkt-bar-cell"><div class="bkt-bar-tr"></div></div>`;
  // Basketball SVG: circle with arc lines
  const n = v;
  const svg = `<svg viewBox="0 0 32 32" width="24" height="24" xmlns="http://www.w3.org/2000/svg" style="display:block">
    <defs><clipPath id="bc"><circle cx="16" cy="16" r="13.5"/></clipPath></defs>
    <circle cx="16" cy="16" r="13.5" fill="#F08030" stroke="#c26010" stroke-width="0.8"/>
    <g clip-path="url(#bc)" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="1" stroke-linecap="round">
      <line x1="2.5" y1="16" x2="29.5" y2="16"/>
      <line x1="16" y1="2.5" x2="16" y2="29.5"/>
      <path d="M10,2.5 Q3,16 10,29.5"/>
      <path d="M22,2.5 Q29,16 22,29.5"/>
    </g>
    <circle cx="16" cy="16" r="13.5" fill="none" stroke="#c24d00" stroke-width="0.8"/>
    <text x="16" y="16" text-anchor="middle" dominant-baseline="central" font-family="'Libre Franklin',sans-serif" font-weight="900" font-size="${n>=10?'14':'17'}" fill="#1a0a00">${n}</text>
  </svg>`;
  return `<div class="bkt-bar-cell">
    <div class="bkt-bar-tr">
      <div class="bkt-bar-fi" style="width:${pct}%;background:${color}"></div>
      <div style="position:absolute;top:50%;left:${pct}%;transform:translate(-50%,-50%);width:22px;height:22px;z-index:1">${svg}</div>
    </div>
  </div>`;
}

function renderBktTrends() {
  if (!bktData.length) return;
  const n     = bktGames;
  const stat  = bktStat;
  const max   = BKT_STAT_MAX[stat];
  const lbl   = BKT_STAT_LABELS[stat];
  const color = BKT_STAT_COLOR;
  const hasLive = !!(bktLiveGame && bktLiveData);

  // Merge live players into sorted set — show everyone who played in window OR is live
  const allNames = new Set([...bktData.map(p=>p.name), ...(hasLive?Object.keys(bktLiveData):[])]);

  const sorted = [...bktData]
    .filter(p => {
      const inRange  = p.games.slice(0,n).some(g => (g[stat]||0)>0||g.pts>0);
      const inLive   = hasLive && bktLiveData[p.name];
      return inRange || inLive;
    })
    .sort((a,b) => {
      const liveVal = p => hasLive && bktLiveData[p.name] ? (bktLiveData[p.name][stat]||0) : 0;
      const histAvg = p => p.games.slice(0,n).reduce((s,g)=>s+(g[stat]||0),0) /
                           Math.max(p.games.slice(0,n).filter(g=>g[stat]>0||g.pts>0).length,1);
      return (liveVal(b)+histAvg(b)) - (liveVal(a)+histAvg(a));
    });

  // Add live-only players (appeared live but not in historical range)
  if (hasLive) {
    for (const name of Object.keys(bktLiveData)) {
      if (!sorted.find(p=>p.name===name)) {
        sorted.push({ name, games:[] });
      }
    }
  }

  // Live column header
  const liveHdr = hasLive ? (() => {
    const g = bktLiveGame;
    const oppStr = `${g.isHome?'vs':'@'} ${g.oppAbbr}`;
    return `<th class="live-col" style="text-align:center;min-width:88px;background:#007A33">
      ${liveBadge()}<br>
      <span style="font-size:9px;color:rgba(255,255,255,.8)">Q${g.period} ${g.clock}</span><br>
      <span style="font-size:9px;color:rgba(255,255,255,.85);font-weight:700">${oppStr} ${g.bosScore}-${g.oppScore}</span>
    </th>`;
  })() : '';

  // Historical game headers
  const refGames  = bktGamesMeta.slice(0,n);
  const gameHdrs  = refGames.map(g => `<th style="text-align:center;min-width:80px">
    <span style="font-size:10px;font-weight:700;color:rgba(255,255,255,.85)">${g.date} ${g.opp}</span><br>
    <span style="font-size:10px;font-weight:700;color:#fff">${g.result} ${g.score}</span>
  </th>`).join('');

  const avgHdr = `<th class="col-frozen-right" style="text-align:center;background:#007A33">
    <span style="font-size:10px;font-weight:700;color:rgba(255,255,255,.85)">${lbl} Avg</span><br>
    <span style="font-size:9px;font-weight:400;opacity:.7">Last ${n}</span>
  </th>`;

  document.getElementById('bkt-thead').innerHTML = `<tr>
    <th class="col-frozen-left" style="background:#007A33;color:rgba(255,255,255,.85)">Player</th>
    ${liveHdr}${gameHdrs}${avgHdr}
  </tr>`;

  document.getElementById('bkt-tbody').innerHTML = sorted.map(p => {
    const liveStats = hasLive ? (bktLiveData[p.name]||null) : null;
    const lv        = liveStats ? (liveStats[stat]||0) : null;

    const liveCell = hasLive ? (() => {
      if (lv === null) return `<td class="live-col" style="padding:4px;text-align:center;opacity:.3">—</td>`;
      const statsLine = `<div style="font-family:var(--mono);font-size:9px;color:rgba(255,255,255,.5);margin-top:2px;text-align:center">
        <span>${stat==='min'?`P${liveStats.pts} R${liveStats.reb} A${liveStats.ast}`:`P${liveStats.pts} R${liveStats.reb} A${liveStats.ast}`}</span></div>`;
      return `<td class="live-col" style="vertical-align:top;padding:4px;text-align:center;background:rgba(200,16,46,.04)">
        ${basketballBubble(lv,max,color)}${statsLine}</td>`;
    })() : '';

    const games     = p.games.slice(0,n);
    const vals      = games.map(g=>g[stat]||0);
    const liveCount = lv != null && lv > 0 ? 1 : 0;
    const histSum   = vals.reduce((a,b)=>a+b,0);
    const histCount = games.filter(g=>g[stat]>0||g.pts>0).length;
    const avg       = (histCount+liveCount) > 0
      ? ((histSum + (lv||0)) / (histCount + liveCount)).toFixed(1)
      : '—';

    const gameCells = games.map(g => {
      const v = g[stat]||0;
      const statsLine = `<div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-top:2px;text-align:center"><span style="opacity:.55">P</span>${g.pts} <span style="opacity:.55">R</span>${g.reb} <span style="opacity:.55">A</span>${g.ast} <span style="opacity:.55">M</span>${g.min||0}</div>`;
      return `<td style="vertical-align:top;padding:4px 4px;text-align:center">${basketballBubble(v,max,color)}${statsLine}</td>`;
    }).join('');

    return `<tr>
      <td class="col-frozen-left" style="padding:5px 11px"><span class="pname">${p.name}</span></td>
      ${liveCell}${gameCells}
      <td class="col-frozen-right" style="text-align:center;font-family:var(--display);font-size:16px;font-weight:800;color:#007A33;background:#fff">${avg}</td>
    </tr>`;
  }).join('');

  // Update source note if live
  if (hasLive) {
    const g = bktLiveGame;
    document.getElementById('bkt-src-note').textContent =
      `🔴 LIVE Q${g.period} ${g.clock} ${g.isHome?'vs':'@'} ${g.oppAbbr} ${g.bosScore}-${g.oppScore} · auto-refreshes every 60s`;
  }
}

function setBktSeason(yr) {
  bktSeasonYear = yr;
  bktData = []; bktGamesMeta = [];
  if (bktInitDone) loadBktTrends();
}
