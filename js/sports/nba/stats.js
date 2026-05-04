// ════════════════════════════════════════
//  HOOPERS — NBA Player Stats
// ════════════════════════════════════════
const NBA_TEAM_ID = '1610612738'; // Boston Celtics
let nbaSeasonType = 'Regular Season';
let hooperData = [];
let sortHooperState = { col:'PTS', asc:false };

const NBA_STD_COLS = [
  {k:'PLAYER_NAME', h:'Player'},
  {k:'GP',   h:'G',   r:true},
  {k:'MIN',  h:'MIN', r:true},
  {k:'PTS',  h:'PTS', r:true},
  {k:'REB',  h:'REB', r:true},
  {k:'AST',  h:'AST', r:true},
  {k:'STL',  h:'STL', r:true},
  {k:'BLK',  h:'BLK', r:true},
  {k:'TOV',  h:'TOV', r:true},
  {k:'FG_PCT',  h:'FG%',  r:true, pct:true},
  {k:'FG3_PCT', h:'3P%',  r:true, pct:true},
  {k:'FT_PCT',  h:'FT%',  r:true, pct:true},
];
const NBA_ADV_COLS = [
  {k:'FGM',  h:'FGM',  r:true, adv:true},
  {k:'FGA',  h:'FGA',  r:true, adv:true},
  {k:'FG3M', h:'3PM',  r:true, adv:true},
  {k:'FG3A', h:'3PA',  r:true, adv:true},
  {k:'OREB', h:'OREB', r:true, adv:true},
  {k:'DREB', h:'DREB', r:true, adv:true},
  {k:'PF',   h:'PF',   r:true, adv:true},
];

async function fetchNBAStats(season, seasonType) {
  // nbaapi.com — free, no key, covers player totals + advanced
  // season param = year season ends, e.g. "2024-25" → 2025
  const yr = parseInt(season.split('-')[0]) + 1;
  const isPlayoff = seasonType === 'Playoffs';

  const url = `https://api.server.nbaapi.com/api/playertotals?team=${selectedNbaTeamAbbr}&season=${yr}&isPlayoff=${isPlayoff}&page=1&pageSize=30&sortBy=points&ascending=false`;
  let lastErr;
  for (const proxy of PROXIES) {
    try {
      const r = await fetch(proxy(url), { signal: AbortSignal.timeout(10000) });
      if (r.ok) return r.json();
      lastErr = new Error(`HTTP ${r.status}`);
    } catch(e) { lastErr = e; }
  }
  throw lastErr || new Error('Could not reach nbaapi.com');
}

function setNbaSeason(type, el) {
  nbaSeasonType = type;
  document.querySelectorAll('#nba-gt-reg, #nba-gt-post').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  loadHoopers();
}

async function loadHoopers() {
  const season = document.getElementById('nba-season-select').value;
  document.getElementById('hoopers-status').style.display = 'block';
  document.getElementById('hoopers-spin').style.display = 'block';
  document.getElementById('hoopers-msg').textContent = `Loading ${selectedNbaTeamName} stats…`;
  document.getElementById('hoopers-tbl-wrap').style.display = 'none';

  try {
    const data = await fetchNBAStats(season, nbaSeasonType);
    const rows = data?.data || [];
    if (!rows.length) throw new Error('No player data found for this season — nbaapi.com may not have this data yet.');

    // nbaapi.com fields: playerName, games, minutesPlayed, points, assists,
    // totalRb, steals, blocks, turnovers, fgPercent, threePointPercent,
    // ftPercent, offensiveRb, defensiveRb, personalFouls, fieldGoalAttempts,
    // fieldGoals, threePointAttempts, threePointers, freethrows, freethrowAttempts
    // Convert to per-game
    hooperData = rows.map(p => {
      const g = p.games || 1;
      const pg = v => v != null ? +(v/g).toFixed(1) : null;
      return {
        PLAYER_NAME: p.playerName,
        GP: p.games,
        MIN: pg(p.minutesPg),
        PTS: pg(p.points),
        REB: pg(p.totalRb),
        AST: pg(p.assists),
        STL: pg(p.steals),
        BLK: pg(p.blocks),
        TOV: pg(p.turnovers),
        FG_PCT:  p.fieldPercent ?? null,
        FG3_PCT: p.threePercent ?? null,
        FT_PCT:  p.ftPercent ?? null,
        FGM:  pg(p.fieldGoals),
        FGA:  pg(p.fieldAttempts),
        FG3M: pg(p.threeFg),
        FG3A: pg(p.threeAttempts),
        OREB: pg(p.offensiveRb),
        DREB: pg(p.defensiveRb),
        PF:   pg(p.personalFouls),
      };
    });

    document.getElementById('hoopers-status').style.display = 'none';
    document.getElementById('hoopers-tbl-wrap').style.display = 'block';
    document.getElementById('hoopers-cards').style.display = 'grid';
    renderHoopers();
    const isCurrent = season === currentNBASeason();
    document.getElementById('hoopers-src-note').textContent =
      `${hooperData.length} players · ${season} ${nbaSeasonType} · nbaapi.com (per game)${isCurrent ? ' · auto-refreshes every 5 min' : ''}`;

    // Auto-refresh if showing current season
    clearInterval(window._hoopersTimer);
    if (isCurrent) {
      window._hoopersTimer = setInterval(() => {
        const sel = document.getElementById('nba-season-select');
        if (sel && sel.value === currentNBASeason()) loadHoopers();
      }, 5 * 60 * 1000);
    }

  } catch(e) {
    document.getElementById('hoopers-spin').style.display = 'none';
    document.getElementById('hoopers-msg').textContent = '⚠ ' + e.message;
    document.getElementById('hoopers-msg').style.color = 'var(--red)';
  }
}


function renderHooperCards() {
  if (!hooperData.length) return;
  const d = hooperData;

  // Team games = max games played by any player
  const teamGames = Math.max(...d.map(p => p.GP || 0)) || 1;

  // Sum raw totals (per-game × games) then divide by team games
  const totalPts = d.reduce((s,p) => s + ((p.PTS||0) * (p.GP||0)), 0);
  const totalReb = d.reduce((s,p) => s + ((p.REB||0) * (p.GP||0)), 0);
  const totalAst = d.reduce((s,p) => s + ((p.AST||0) * (p.GP||0)), 0);
  const totalStl = d.reduce((s,p) => s + ((p.STL||0) * (p.GP||0)), 0);
  const totalBlk = d.reduce((s,p) => s + ((p.BLK||0) * (p.GP||0)), 0);

  const totalFGM = d.reduce((s,p) => s + ((p.FGM||0) * (p.GP||0)), 0);
  const totalFGA = d.reduce((s,p) => s + ((p.FGA||0) * (p.GP||0)), 0);
  const total3FM = d.reduce((s,p) => s + ((p.FG3M||0) * (p.GP||0)), 0);
  const total3FA = d.reduce((s,p) => s + ((p.FG3A||0) * (p.GP||0)), 0);

  const ftPlayers = d.filter(p => p.FT_PCT != null && p.GP > 0);
  const teamFTPct = ftPlayers.length
    ? (ftPlayers.reduce((s,p) => s + (p.FT_PCT * p.GP), 0) / ftPlayers.reduce((s,p) => s + p.GP, 0) * 100).toFixed(1)
    : '—';

  const ppg = (totalPts / teamGames).toFixed(1);
  const rpg = (totalReb / teamGames).toFixed(1);
  const apg = (totalAst / teamGames).toFixed(1);
  const spg = (totalStl / teamGames).toFixed(1);
  const bpg = (totalBlk / teamGames).toFixed(1);
  const fgPct = totalFGA > 0 ? (totalFGM / totalFGA * 100).toFixed(1) : '—';
  const tpPct = total3FA > 0 ? (total3FM / total3FA * 100).toFixed(1) : '—';

  document.getElementById('hoopers-cards').innerHTML = `
    <div class="card"><div class="card-lbl">Roster</div><div class="card-val">${d.length}</div></div>
    <div class="card"><div class="card-lbl">PPG</div><div class="card-val sm" style="color:#007A33">${ppg}</div></div>
    <div class="card"><div class="card-lbl">RPG</div><div class="card-val sm">${rpg}</div></div>
    <div class="card"><div class="card-lbl">APG</div><div class="card-val sm">${apg}</div></div>
    <div class="card"><div class="card-lbl">SPG</div><div class="card-val sm">${spg}</div></div>
    <div class="card"><div class="card-lbl">BPG</div><div class="card-val sm">${bpg}</div></div>
    <div class="card"><div class="card-lbl">FG%</div><div class="card-val sm">${fgPct !== '—' ? fgPct + '%' : '—'}</div></div>
    <div class="card"><div class="card-lbl">3P%</div><div class="card-val sm">${tpPct !== '—' ? tpPct + '%' : '—'}</div></div>
    <div class="card"><div class="card-lbl">FT%</div><div class="card-val sm">${teamFTPct !== '—' ? teamFTPct + '%' : '—'}</div></div>
  `;
}

function sortHoopers(col) {
  sortHooperState.asc = sortHooperState.col === col ? !sortHooperState.asc : false;
  sortHooperState.col = col;
  renderHoopers();
}

function renderHoopers() {
  renderHooperCards();
  const adv = document.getElementById('nba-adv-tog').checked;
  const cols = adv ? [...NBA_STD_COLS, ...NBA_ADV_COLS] : NBA_STD_COLS;
  const sc = sortHooperState;

  const sorted = [...hooperData].sort((a, b) => {
    if (sc.col === 'PLAYER_NAME') return sc.asc ? (a.PLAYER_NAME < b.PLAYER_NAME ? -1 : 1) : (b.PLAYER_NAME < a.PLAYER_NAME ? -1 : 1);
    const va = parseFloat(a[sc.col]) || 0, vb = parseFloat(b[sc.col]) || 0;
    return sc.asc ? va - vb : vb - va;
  });

  document.getElementById('hoopers-thead').innerHTML = `<tr>${cols.map((col, i) => {
    const isFirstAdv = col.adv && (i === 0 || !cols[i-1]?.adv);
    const bdr = isFirstAdv ? 'border-left:2px solid var(--border);' : '';
    const arrow = sc.col === col.k ? (sc.asc ? '↑' : '↓') : '<span style="opacity:.3">↕</span>';
    return `<th class="${col.r ? 'r' : ''}" style="cursor:pointer;${bdr}" onclick="sortHoopers('${col.k}')">${col.h} ${arrow}</th>`;
  }).join('')}</tr>`;

  // Color thresholds similar to hitting tab
  const THRESH = { PTS:[10,20], REB:[3,7], AST:[2,5], STL:[0.8,1.5], BLK:[0.5,1.5],
    FG_PCT:[0.43,0.52], FG3_PCT:[0.33,0.40], FT_PCT:[0.70,0.85] };
  function statCls(k, v) {
    if (v == null) return '';
    const t = THRESH[k]; if (!t) return '';
    const n = parseFloat(v); if (isNaN(n)) return '';
    return n >= t[1] ? 'hi' : n <= t[0] ? 'lo' : '';
  }

  document.getElementById('hoopers-tbody').innerHTML = sorted.map(p => {
    return `<tr>${cols.map((col, i) => {
      const isFirstAdv = col.adv && (i === 0 || !cols[i-1]?.adv);
      const bdr = isFirstAdv ? 'border-left:2px solid var(--border);' : '';
      const raw = p[col.k];
      let disp = raw ?? '—';
      if (col.pct && raw != null) disp = (parseFloat(raw) * 100).toFixed(1) + '%';
      else if (typeof raw === 'number') disp = Number.isInteger(raw) ? raw : parseFloat(raw).toFixed(1);
      const cls = col.pct ? statCls(col.k, parseFloat(raw)) : '';
      if (i === 0) return `<td><span class="pname">${disp}</span></td>`;
      return `<td class="r ${cls}" style="font-family:var(--mono);font-size:11px;${bdr}">${disp}</td>`;
    }).join('')}</tr>`;
  }).join('') || `<tr><td colspan="${cols.length}" style="text-align:center;padding:24px;color:var(--faint)">No data</td></tr>`;
}

function setHooperSeason(val) {
  const sel = document.getElementById('nba-season-select');
  if (sel) sel.value = val;
  loadHoopers();
}

function setHooperSeasonType(type, el) {
  setNbaSeason(type, el);
}

// populateBtSeasonDropdowns is defined in js/sports/mlb/trends.js
