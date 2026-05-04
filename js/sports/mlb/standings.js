// ════════════════════════════════════════
//  MLB STANDINGS
// ════════════════════════════════════════
let mlbStdData = [];
let mlbStdLeague = 'AL';
let mlbStdSort = { col: 'divRank', asc: true };
let mlbView = 'table';
let mlbRaceLoading = false;
let mlbWinsLoading = false;

function setMlbView(view, el) {
  mlbView = view;
  document.getElementById('mlb-view-table')?.classList.toggle('active', view === 'table');
  document.getElementById('mlb-view-graph')?.classList.toggle('active', view === 'graph');
  document.getElementById('mlb-view-wins')?.classList.toggle('active',  view === 'wins');
  document.getElementById('mlb-std-content').style.display  = view === 'table' ? 'block' : 'none';
  document.getElementById('mlb-race-chart').style.display   = view === 'graph' ? 'block' : 'none';
  document.getElementById('mlb-wins-chart').style.display   = view === 'wins'  ? 'block' : 'none';
  document.getElementById('mlb-wc-tog').closest('.ctrl-group').style.display = view === 'table' ? '' : 'none';
  if (view === 'graph') loadMlbRaceChart();
  if (view === 'wins')  loadMlbWinsChart();
}

function setMlbStdLeague(lg, el) {
  mlbStdLeague = lg;
  document.querySelectorAll('#pane-mlb-standings .seg-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  // Re-activate the correct view button
  document.getElementById(mlbView === 'graph' ? 'mlb-view-graph' : mlbView === 'wins' ? 'mlb-view-wins' : 'mlb-view-table')?.classList.add('active');
  renderMlbStandings();
  invalidateMlbRaceChart();
}

async function loadMlbStandings(asOfDate) {
  let season = parseInt(document.getElementById('mlb-std-season').value) || new Date().getFullYear();
  // If navigating to a past date, infer season from date
  if (asOfDate) {
    const asOfYear = parseInt(asOfDate.split('-')[0]);
    if (asOfYear !== season) { season = asOfYear; }
  }
  // Invalidate race chart whenever season/date changes
  if (!asOfDate) { mlbRaceLoading = false; const rc = document.getElementById('mlb-race-chart'); if(rc) rc.innerHTML=''; }
  const statusEl = document.getElementById('mlb-std-status');
  const spinEl   = document.getElementById('mlb-std-spin');
  const msgEl    = document.getElementById('mlb-std-msg');
  statusEl.style.display = 'block';
  spinEl.style.display   = 'block';
  const dateLabel = asOfDate && asOfDate !== todayStr() ? ` as of ${asOfDate}` : '';
  msgEl.textContent = `Loading MLB ${season} standings${dateLabel}…`;
  document.getElementById('mlb-std-content').innerHTML = '';
  mlbStdData = [];

  // MLB division IDs → short names (stable across seasons)
  const DIV_MAP = {
    200: { name: 'AL West',    league: 'AL' },
    201: { name: 'AL East',    league: 'AL' },
    202: { name: 'AL Central', league: 'AL' },
    203: { name: 'NL West',    league: 'NL' },
    204: { name: 'NL East',    league: 'NL' },
    205: { name: 'NL Central', league: 'NL' },
  };
  const DIV_ORDER = { 'AL East':0,'AL Central':1,'AL West':2,'NL East':3,'NL Central':4,'NL West':5 };

  // Build URL — add date param when navigating to a specific date
  const dateParam = asOfDate ? `&date=${asOfDate}` : '';

  try {
    // Try regularSeason first; if 0 records returned, try springTraining
    let data = await apiFetch(
      `https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${season}&standingsTypes=regularSeason&hydrate=team(division),record(overallRecords,splitRecords)${dateParam}`
    );
    let records = data.records || [];
    let standingType = 'Regular Season';

    if (!records.length || records.every(r => !r.teamRecords?.length)) {
      msgEl.textContent = `No regular season data yet — trying spring training…`;
      data = await apiFetch(
        `https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${season}&standingsTypes=springTraining&hydrate=team(division),record(overallRecords,splitRecords)${dateParam}`
      );
      records = data.records || [];
      standingType = 'Spring Training';
    }

    const rows = [];
    for (const rec of records) {
      const divId  = rec.division?.id;
      const divInfo = DIV_MAP[divId] || null;
      const divName = divInfo?.name || rec.division?.name || 'Unknown';
      const league  = divInfo?.league || (rec.league?.id === 103 ? 'AL' : rec.league?.id === 104 ? 'NL' : '?');

      for (const tr of (rec.teamRecords || [])) {
        const team = tr.team || {};
        const ovr  = tr.records?.overallRecords || [];
        const splits = tr.records?.splitRecords || [];
        const allRecs = [...ovr, ...splits];
        const get  = type => { const r = allRecs.find(r=>r.type===type); return r ? `${r.wins}-${r.losses}` : '-'; };
        const getLast10 = () => {
          const r = allRecs.find(r => r.type === 'lastTen')
                 || allRecs.find(r => r.type === 'last')
                 || allRecs.find(r => r.type === 'last10')
                 || allRecs.find(r => r.type?.toLowerCase().includes('last'));
          return r ? `${r.wins}-${r.losses}` : '-';
        };
        rows.push({
          league,
          division: divName,
          divOrder: DIV_ORDER[divName] ?? 99,
          name:     team.clubName || team.name || '?',
          abbr:     team.abbreviation || '',
          teamId:   team.id,
          w:        tr.wins ?? 0,
          l:        tr.losses ?? 0,
          pct:      parseFloat(tr.winningPercentage) || 0,
          gb:       tr.divisionGamesBack === '-' ? 0 : parseFloat(tr.divisionGamesBack) || 0,
          wcGb:     tr.wildCardGamesBack === '-' ? 0 : parseFloat(tr.wildCardGamesBack) || 0,
          home:     get('home'),
          away:     get('away'),
          last10:   getLast10(),
          streak:   tr.streak?.streakCode || '',
          runsScored:   tr.runsScored ?? null,
          runsAllowed:  tr.runsAllowed ?? null,
          runDiff:      tr.runDifferential ?? null,
          divRank:      parseInt(tr.divisionRank) || 99,
          divisionChamp: tr.divisionChamp || false,
          hasWildcard:   tr.hasWildcard || false,
        });
      }
    }
    mlbStdData = rows;
    statusEl.style.display = 'none';
    renderMlbStandings();
    document.getElementById('mlb-std-src-note').textContent =
      `MLB ${season} ${standingType} Standings${dateLabel} · statsapi.mlb.com`;
  } catch(e) {
    console.error('[MLB Standings] error:', e);
    spinEl.style.display = 'none';
    msgEl.textContent = 'Could not load MLB standings: ' + e.message;
  }
}

function parseMlbStandings(data) { return []; } // legacy stub — loadMlbStandings now parses inline

function renderMlbStandings() {
  const wcMode = document.getElementById('mlb-wc-tog').checked;
  const league = mlbStdLeague;

  if (!mlbStdData.length) {
    document.getElementById('mlb-std-content').innerHTML =
      `<div style="text-align:center;padding:40px;font-family:var(--display);font-size:13px;color:var(--muted)">Loading standings…</div>`;
    return;
  }

  if (wcMode) {
    const leagues = league === 'All' ? ['AL','NL'] : [league];
    document.getElementById('mlb-std-content').innerHTML = leagues.map(lg => {
      const lgRows = mlbStdData.filter(r => r.league === lg);
      return renderMlbWildcardTable(lg, lgRows);
    }).join('');
    return;
  }

  const sc = mlbStdSort;
  const leagues = league === 'All' ? ['AL','NL'] : [league];
  const cols = [
    { k:'divRank',    h:'#',    r:false },
    { k:'name',       h:'Team', r:false },
    { k:'w',          h:'W',    r:true  },
    { k:'l',          h:'L',    r:true  },
    { k:'pct',        h:'PCT',  r:true  },
    { k:'gb',         h:'GB',   r:true  },
    { k:'home',       h:'Home', r:true  },
    { k:'away',       h:'Away', r:true  },
    { k:'last10',     h:'L10',  r:true  },
    { k:'streak',     h:'Strk', r:true  },
    { k:'runDiff',    h:'+/-',  r:true  },
    { k:'runsScored', h:'RS',   r:true  },
    { k:'runsAllowed',h:'RA',   r:true  },
  ];
  const arrow = k => sc.col === k ? (sc.asc ? '↑' : '↓') : '<span style="opacity:.3">↕</span>';
  const thead = `<tr>${cols.map(c =>
    `<th class="${c.r?'r':''}" onclick="sortMlbStd('${c.k}')" style="cursor:pointer;white-space:nowrap">${c.h} ${arrow(c.k)}</th>`
  ).join('')}</tr>`;

  let html = '';
  for (const lg of leagues) {
    // Get all divisions for this league, sorted by divOrder
    const lgTeams = mlbStdData.filter(r => r.league === lg);
    const divNames = [...new Set(lgTeams.map(r => r.division))]
      .sort((a,b) => (lgTeams.find(r=>r.division===a)?.divOrder??99) - (lgTeams.find(r=>r.division===b)?.divOrder??99));

    for (const div of divNames) {
      let divRows = lgTeams.filter(r => r.division === div);
      // Default sort: divRank asc, then by record
      divRows.sort((a,b) => {
        if (sc.col === 'divRank') return sc.asc ? (a.divRank-b.divRank) : (b.divRank-a.divRank);
        const va = a[sc.col]??9999, vb = b[sc.col]??9999;
        if (typeof va==='string') return sc.asc ? va.localeCompare(vb) : vb.localeCompare(va);
        return sc.asc ? va-vb : vb-va;
      });
      if (!divRows.length) continue;

      const tbody = divRows.map(r => {
        const gb   = r.gb === 0 ? '—' : r.gb;
        const diff = r.runDiff != null ? (r.runDiff >= 0 ? '+'+r.runDiff : r.runDiff) : '—';
        const isBos = r.teamId === selectedMlbTeamId;
        const rowBg  = isBos ? 'background:rgba(12,31,63,.07)' : '';
        const nameFw = isBos ? 'font-weight:800;color:#0C1F3F' : '';
        return `<tr style="${rowBg};cursor:pointer" onclick="goToMlbTeam(${r.teamId},'${r.abbr}','${r.name}','${r.league}')" title="View ${r.name} trends">
          <td style="font-family:var(--mono);font-size:11px;color:var(--muted)">${r.divRank === 99 ? '—' : r.divRank}</td>
          <td><span style="font-family:var(--display);font-weight:700;font-size:12px;${nameFw}">${r.name}</span> <span style="font-family:var(--mono);font-size:9px;color:var(--faint)">→</span> <span style="font-family:var(--mono);font-size:9px;color:var(--faint)">→</span></td>
          <td class="r" style="font-family:var(--mono);font-size:11px;font-weight:700">${r.w}</td>
          <td class="r" style="font-family:var(--mono);font-size:11px">${r.l}</td>
          <td class="r" style="font-family:var(--mono);font-size:11px">${r.pct.toFixed(3)}</td>
          <td class="r" style="font-family:var(--mono);font-size:11px">${gb}</td>
          <td class="r" style="font-family:var(--mono);font-size:11px">${r.home}</td>
          <td class="r" style="font-family:var(--mono);font-size:11px">${r.away}</td>
          <td class="r" style="font-family:var(--mono);font-size:11px">${r.last10}</td>
          <td class="r" style="font-family:var(--mono);font-size:11px">${r.streak}</td>
          <td class="r" style="font-family:var(--mono);font-size:11px;${r.runDiff>0?'color:var(--green)':r.runDiff<0?'color:var(--red)':''}">${diff}</td>
          <td class="r" style="font-family:var(--mono);font-size:11px">${r.runsScored??'—'}</td>
          <td class="r" style="font-family:var(--mono);font-size:11px">${r.runsAllowed??'—'}</td>
        </tr>`;
      }).join('');

      html += `<div class="sec-hdr" style="margin-top:14px">
        <span class="sec-title">${div}</span>
        <div class="sec-line"></div></div>
        <div class="tbl-wrap"><table style="min-width:660px">
          <thead>${thead}</thead><tbody>${tbody}</tbody>
        </table></div>`;
    }
  }

  document.getElementById('mlb-std-content').innerHTML = html ||
    `<div style="text-align:center;padding:40px;font-family:var(--display);font-size:13px;color:var(--muted)">No standings data found for selected season/league.</div>`;
}

function renderMlbWildcardTable(lg, allLgRows) {
  const rows = [...allLgRows].sort((a,b) => b.pct - a.pct || a.l - b.l);

  const cols = [
    { h:'#',     r:false },
    { h:'Team',  r:false },
    { h:'W',     r:true  },
    { h:'L',     r:true  },
    { h:'PCT',   r:true  },
    { h:'WC GB', r:true  },
    { h:'Home',  r:true  },
    { h:'Away',  r:true  },
    { h:'L10',   r:true  },
    { h:'Strk',  r:true  },
    { h:'+/-',   r:true  },
  ];
  const thead = `<tr>${cols.map(c =>
    `<th class="${c.r?'r':''}" style="white-space:nowrap">${c.h}</th>`
  ).join('')}</tr>`;

  const divBadge = `<span style="font-family:var(--mono);font-size:8px;background:#1a7a3a;color:#fff;border-radius:2px;padding:1px 4px;margin-left:4px">DIV</span>`;
  const wcBadge  = `<span style="font-family:var(--mono);font-size:8px;background:#b08828;color:#fff;border-radius:2px;padding:1px 4px;margin-left:4px">WC</span>`;

  // Find division leaders
  const divLeaderIds = new Set();
  const divs = [...new Set(allLgRows.map(r=>r.division))];
  for (const div of divs) {
    const dr = allLgRows.filter(r=>r.division===div).sort((a,b)=>b.pct-a.pct||a.l-b.l);
    if (dr.length) divLeaderIds.add(dr[0].teamId);
  }

  // Top 3 non-leaders are WC holders
  const nonLeaders = rows.filter(r => !divLeaderIds.has(r.teamId));
  const wcHolderIds = new Set(nonLeaders.slice(0,3).map(r=>r.teamId));

  // Cutline: index of first team that is neither a div leader nor a WC holder
  let cutlineIdx = -1;
  let wcCount = 0;
  for (let i = 0; i < rows.length; i++) {
    if (!divLeaderIds.has(rows[i].teamId)) wcCount++;
    if (!divLeaderIds.has(rows[i].teamId) && wcCount === 4) { cutlineIdx = i; break; }
  }

  const tbody = rows.map((r,i) => {
    const isBos  = r.teamId === selectedMlbTeamId;
    const isDiv  = divLeaderIds.has(r.teamId);
    const isWC   = wcHolderIds.has(r.teamId);
    const nameFw = isBos ? 'font-weight:800;color:#0C1F3F' : '';
    const badge  = isDiv ? divBadge : (isWC ? wcBadge : '');
    const gb     = r.wcGb === 0 ? '—' : r.wcGb;
    const diff   = r.runDiff != null ? (r.runDiff >= 0 ? '+'+r.runDiff : r.runDiff) : '—';

    let rowBg = '';
    if (isBos) rowBg = 'background:rgba(12,31,63,.07)';

    const cutDiv = (i === cutlineIdx)
      ? `<tr><td colspan="${cols.length}" style="padding:2px 8px;background:#fde8ec;font-family:var(--mono);font-size:9px;color:var(--red);font-weight:600;letter-spacing:.08em">▸ WILD CARD CUTLINE</td></tr>`
      : '';

    const divLabel = r.division.replace('American League ','').replace('National League ','');

    return cutDiv + `<tr style="${rowBg};cursor:pointer" onclick="goToMlbTeam(${r.teamId},'${r.abbr}','${r.name}','${r.league}')" title="View ${r.name} trends">
      <td style="font-family:var(--mono);font-size:11px;color:var(--muted)">${i+1}</td>
      <td><span style="font-family:var(--display);font-weight:700;font-size:12px;${nameFw}">${r.name}</span>${badge}
          <span style="font-family:var(--mono);font-size:9px;color:var(--faint);margin-left:4px">${divLabel}</span></td>
      <td class="r" style="font-family:var(--mono);font-size:11px;font-weight:700">${r.w}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px">${r.l}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px">${r.pct.toFixed(3)}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px">${gb}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px">${r.home}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px">${r.away}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px">${r.last10}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px">${r.streak}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px;${r.runDiff>0?'color:var(--green)':r.runDiff<0?'color:var(--red)':''}">${diff}</td>
    </tr>`;
  }).join('');

  return `<div class="sec-hdr" style="margin-top:14px">
    <span class="sec-title">${lg === 'AL' ? 'American League' : 'National League'} — Wild Card Race</span>
    <div class="sec-line"></div></div>
  <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:8px;font-family:var(--mono);font-size:10px">
    <span style="color:#1a7a3a">■ Division Leaders (3)</span>
    <span style="color:#b08828">■ Wild Card Holders (3)</span>
  </div>
  <div class="tbl-wrap" style="margin-bottom:6px"><table style="min-width:620px">
    <thead>${thead}</thead><tbody>${tbody}</tbody>
  </table></div>`;
}

function sortMlbStd(col) {
  mlbStdSort.asc = mlbStdSort.col === col ? !mlbStdSort.asc : (col === 'divRank' || col === 'gb' || col === 'l');
  mlbStdSort.col = col;
  renderMlbStandings();
}

// ════════════════════════════════════════
//  MLB RACE CHART
// ════════════════════════════════════════
async function loadMlbRaceChart() {
  const container = document.getElementById('mlb-race-chart');
  if (!container || mlbRaceLoading) return;
  mlbRaceLoading = true;

  const season = parseInt(document.getElementById('mlb-std-season').value) || new Date().getFullYear();
  const league = mlbStdLeague;
  const wcMode = document.getElementById('mlb-wc-tog').checked;

  container.innerHTML = `<div style="text-align:center;padding:40px">
    <div class="ld-spin" style="display:block;margin:0 auto 12px"></div>
    <div class="ld-msg">Building ${season} ${league} race chart&hellip;</div>
    <div class="ld-sub" id="race-progress" style="margin-top:6px">Fetching game dates&hellip;</div>
  </div>`;

  try {
    const gameDates = await fetchGameDates(season);
    if (!gameDates.length) {
      mlbRaceLoading = false;
      container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);font-family:var(--display)">No game data for ${season} yet.</div>`;
      return;
    }
    const prog = document.getElementById('race-progress');
    if (prog) prog.textContent = `Loading ${gameDates.length} game dates…`;

    const snapshots = await fetchSnapshotsForDates(season, league, gameDates, container);
    mlbRaceLoading = false;

    if (!snapshots.length || !snapshots.some(s => Object.values(s.teams).some(t => t.gp > 0))) {
      container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);font-family:var(--display)">No standings data for ${season} ${league} yet.</div>`;
      return;
    }
    container.innerHTML = renderRaceChartHTML(snapshots, league, season, wcMode);
    attachChartHover(container);
    // Auto-highlight default team (BOS if present) in each group
    container.querySelectorAll('.race-svg').forEach(svg => {
      const gi  = svg.dataset.group;
      const sel = document.getElementById(`race-team-sel-${gi}`);
      if (sel) setTimeout(() => onChartTeamChange('race', parseInt(gi), sel.value), 50);
    });
  } catch(e) {
    mlbRaceLoading = false;
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);font-family:var(--display)">Could not build chart: ${e.message}</div>`;
  }
}

async function fetchGameDates(season) {
  const data = await apiFetch(
    `https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=${season}&gameType=R&fields=dates,date,games,gamePk`
  );
  const today = todayStr();
  const dates = new Set();
  for (const d of (data.dates || [])) {
    if (d.date && d.date <= today) dates.add(d.date);
  }
  return [...dates].sort();
}

async function fetchSnapshotsForDates(season, league, dates, container) {
  const snapshots = [];
  const BATCH = 8;
  let done = 0;

  for (let i = 0; i < dates.length; i += BATCH) {
    const batch = dates.slice(i, i + BATCH);
    const results = await Promise.allSettled(batch.map(date =>
      apiFetch(`https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${season}&standingsTypes=regularSeason&hydrate=team(division)&date=${date}`)
        .then(data => ({ date, data }))
    ));
    for (const r of results) {
      if (r.status !== 'fulfilled') continue;
      const { date, data } = r.value;
      const teams = {};
      for (const rec of (data.records || [])) {
        const divId = rec.division?.id;
        const div   = DIV_MAP_RACE[divId]   || '?';
        const lg    = LEAGUE_MAP_RACE[divId] || '?';
        if (lg !== league) continue;
        for (const tr of (rec.teamRecords || [])) {
          const abbr = tr.team?.abbreviation || '?';
          teams[abbr] = {
            abbr, div, lg,
            name:    tr.team?.teamName || tr.team?.clubName || abbr,
            w:       tr.wins || 0,
            l:       tr.losses || 0,
            gp:      (tr.wins||0)+(tr.losses||0),
            pct:     parseFloat(tr.winningPercentage)||0,
            divRank: parseInt(tr.divisionRank)||99,
            gb:      tr.divisionGamesBack==='-'?0:parseFloat(tr.divisionGamesBack)||0,
          };
        }
      }
      if (Object.keys(teams).length) snapshots.push({ date, teams });
    }
    done += batch.length;
    const prog = container.querySelector('#race-progress') || container.querySelector('.ld-sub');
    if (prog) prog.textContent = `Loaded ${done} / ${dates.length} dates…`;
  }

  snapshots.sort((a,b) => a.date.localeCompare(b.date));
  // Deduplicate: only keep when standings changed
  const deduped = [];
  let prevKey = '';
  for (const s of snapshots) {
    const key = Object.entries(s.teams).sort().map(([a,t])=>`${a}:${t.gp}`).join(',');
    if (key !== prevKey) { deduped.push(s); prevKey = key; }
  }
  return deduped;
}

function setChartTheme(t) { /* no-op — default only */ }

// ════════════════════════════════════════
//  MLB WINS CHART
// ════════════════════════════════════════
async function loadMlbWinsChart() {
  const container = document.getElementById('mlb-wins-chart');
  if (!container || mlbWinsLoading) return;
  mlbWinsLoading = true;

  const season = parseInt(document.getElementById('mlb-std-season').value) || new Date().getFullYear();
  const league = mlbStdLeague;
  const wcMode = document.getElementById('mlb-wc-tog').checked;

  container.innerHTML = `<div style="text-align:center;padding:40px">
    <div class="ld-spin" style="display:block;margin:0 auto 12px"></div>
    <div class="ld-msg">Building ${season} ${league} wins chart&hellip;</div>
    <div class="ld-sub" id="wins-progress" style="margin-top:6px">Fetching game dates&hellip;</div>
  </div>`;

  try {
    const gameDates = await fetchGameDates(season);
    if (!gameDates.length) {
      mlbWinsLoading = false;
      container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);font-family:var(--display)">No game data for ${season} yet.</div>`;
      return;
    }
    const prog = container.querySelector('#wins-progress');
    if (prog) prog.textContent = `Loading ${gameDates.length} game dates…`;
    const snapshots = await fetchSnapshotsForDates(season, league, gameDates, container);
    mlbWinsLoading = false;

    if (!snapshots.length || !snapshots.some(s => Object.values(s.teams).some(t => t.gp > 0))) {
      container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);font-family:var(--display)">No data for ${season} ${league} yet.</div>`;
      return;
    }
    container.innerHTML = renderWinsChartHTML(snapshots, league, season, wcMode);
    attachWinsChartHover(container);
    container.querySelectorAll('.wins-svg').forEach(svg => {
      const gi  = svg.dataset.group;
      const sel = document.getElementById(`wins-team-sel-${gi}`);
      if (sel) setTimeout(() => onChartTeamChange('wins', parseInt(gi), sel.value), 50);
    });
  } catch(e) {
    mlbWinsLoading = false;
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);font-family:var(--display)">Could not build wins chart: ${e.message}</div>`;
  }
}

function attachChartHover(container) {
  const ordinal = n => ['','1st','2nd','3rd'][n]||`${n}th`;

  container.querySelectorAll('.race-svg').forEach(svg => {
    const gi      = svg.dataset.group;
    const tooltip = document.getElementById(`race-tooltip-${gi}`);
    const padLeft = parseFloat(svg.dataset.padLeft);
    const innerW  = parseFloat(svg.dataset.innerW);
    const maxGP   = parseFloat(svg.dataset.maxgp);

    const allLines     = svg.querySelectorAll('.race-line');
    const allPts       = svg.querySelectorAll('.race-pt');
    const allHoverDots = svg.querySelectorAll('.race-hover-dot');
    const allLabels    = svg.querySelectorAll('.race-label');
    const allLeaders   = svg.querySelectorAll('.race-leader-line');

    function highlight(abbr) {
      allLines.forEach(el => {
        const mine = el.dataset.abbr===abbr;
        el.style.opacity     = abbr?(mine?'1':'0.15'):'0.18';
        el.style.strokeWidth = abbr&&mine?(parseFloat(el.getAttribute('stroke-width'))+1.5)+'':'';
      });
      allPts.forEach(el => {
        el.style.opacity = abbr?(el.dataset.abbr===abbr?'1':'0.04'):'';
        el.setAttribute('r', abbr&&el.dataset.abbr===abbr?(el.dataset.abbr==='BOS'?BOS_DOT_R+1.5:DOT_R+1.5):(el.dataset.abbr==='BOS'?BOS_DOT_R:DOT_R));
      });
      allLabels.forEach(el => {
        el.style.opacity    = abbr?(el.dataset.abbr===abbr?'1':'0.06'):'';
        el.style.fontWeight = abbr&&el.dataset.abbr===abbr?'800':'';
      });
      allLeaders.forEach(el => {
        el.style.opacity = abbr?(el.dataset.abbr===abbr?'1':'0.04'):'';
      });
      allHoverDots.forEach(el => { if (!abbr) el.style.opacity='0'; });
    }

    function getPoints(abbr) {
      const el = svg.querySelector(`.race-line[data-abbr="${abbr}"]`);
      if (!el?.dataset.pts) return [];
      try { return JSON.parse(decodeURIComponent(el.dataset.pts)); } catch(e) { return []; }
    }

    function mouseToGP(e) {
      const rect = svg.getBoundingClientRect();
      // SVG uses fixed pixel width (not viewBox scaling), so no ratio needed
      const svgX = e.clientX - rect.left;
      return Math.max(0, Math.min(maxGP, (svgX - padLeft) / innerW * maxGP));
    }

    function nearestPoint(pts, mouseGP) {
      return pts.reduce((best,p) => Math.abs(p.gp-mouseGP)<Math.abs(best.gp-mouseGP)?p:best, pts[0]);
    }

    function moveHoverDot(abbr, pt) {
      const dot = svg.querySelector(`.race-hover-dot[data-abbr="${abbr}"]`);
      if (!dot||!pt) return;
      const ptEl = svg.querySelector(`.race-pt[data-abbr="${abbr}"][data-gp="${pt.gp}"]`);
      const cx   = padLeft + (pt.gp / maxGP) * innerW;
      const cy   = ptEl ? ptEl.getAttribute('cy') : dot.getAttribute('cy');
      dot.setAttribute('cx', cx.toFixed(1));
      dot.setAttribute('cy', cy);
      dot.style.opacity = '1';
    }

    function showTooltip(abbr, pt, e) {
      if (!tooltip||!pt) return;
      const color = svg.querySelector(`.race-line[data-abbr="${abbr}"]`)?.getAttribute('stroke')||'#fff';
      const pct   = typeof pt.pct==='number'?pt.pct.toFixed(3):pt.pct;
      const gb    = parseFloat(pt.gb||0);
      tooltip.style.borderLeftColor = color;
      tooltip.innerHTML = `
        <div style="font-weight:700;font-size:13px;margin-bottom:3px">${abbr}</div>
        <div>${ordinal(pt.rank)} &middot; Game ${pt.gp}</div>
        <div style="margin-top:1px">${pt.w}&ndash;${pt.l} &middot; ${pct}${gb>0?` &middot; ${gb} GB`:gb===0?' &middot; &mdash; GB':''}</div>
        <div style="opacity:.4;font-size:9px;margin-top:3px">${pt.date||''}</div>`;
      positionTooltip(e);
      tooltip.style.display='block';
    }

    function positionTooltip(e) {
      if (!tooltip||!e) return;
      tooltip.style.left = `${Math.min(e.clientX+18,window.innerWidth-200)}px`;
      tooltip.style.top  = `${Math.max(e.clientY-20,8)}px`;
    }

    let locked=null, activeAbbr=null;

    function handleHover(abbr, e) {
      const pts = getPoints(abbr); if (!pts.length) return;
      const nearest = nearestPoint(pts, mouseToGP(e));
      moveHoverDot(abbr, nearest);
      showTooltip(abbr, nearest, e);
    }

    svg.querySelectorAll('.race-line,.race-hit,.race-pt,.race-label').forEach(el => {
      el.addEventListener('mouseenter', e => {
        if (locked) return;
        activeAbbr = el.dataset.abbr; highlight(activeAbbr); handleHover(activeAbbr,e);
      });
      el.addEventListener('mousemove', e => {
        if (locked) return; if (activeAbbr) handleHover(activeAbbr,e);
      });
      el.addEventListener('mouseleave', () => {
        if (locked) return;
        activeAbbr=null; highlight(null);
        if (tooltip) tooltip.style.display='none';
        allHoverDots.forEach(d=>d.style.opacity='0');
      });
      el.addEventListener('click', e => {
        const abbr=el.dataset.abbr;
        if (locked===abbr) {
          locked=null; activeAbbr=null; highlight(null);
          if (tooltip) tooltip.style.display='none';
          allHoverDots.forEach(d=>d.style.opacity='0');
        } else {
          locked=abbr; activeAbbr=abbr; highlight(abbr); handleHover(abbr,e);
        }
      });
    });

    svg.addEventListener('mousemove', e => {
      if (locked&&activeAbbr) handleHover(activeAbbr,e);
    });
    svg.addEventListener('click', e => {
      if (!e.target.dataset.abbr) {
        locked=null; activeAbbr=null; highlight(null);
        if (tooltip) tooltip.style.display='none';
        allHoverDots.forEach(d=>d.style.opacity='0');
      }
    });
  });
}

function attachWinsChartHover(container) {
  container.querySelectorAll('.wins-svg').forEach(svg => {
    const gi      = svg.dataset.group;
    const tooltip = document.getElementById(`wins-tooltip-${gi}`);
    const padLeft = parseFloat(svg.dataset.padLeft);
    const innerW  = parseFloat(svg.dataset.innerW);
    const maxGP   = parseFloat(svg.dataset.maxgp);
    const chartH  = parseFloat(svg.dataset.chartH);
    const padTop  = parseFloat(svg.dataset.padTop);

    const allLines = svg.querySelectorAll('.wins-line');
    const allPts   = svg.querySelectorAll('.wins-pt');
    const allHDots = svg.querySelectorAll('.wins-hover-dot');
    const allLbls  = svg.querySelectorAll('.wins-label');
    const allLdrs  = svg.querySelectorAll('.wins-leader');

    function highlight(abbr) {
      allLines.forEach(el => {
        const mine = el.dataset.abbr===abbr;
        el.style.opacity     = abbr?(mine?'1':'0.06'):'';
        el.style.strokeWidth = abbr&&mine?(parseFloat(el.getAttribute('stroke-width'))+1.5)+'':'';
      });
      allPts.forEach(el => { el.style.opacity=abbr?(el.dataset.abbr===abbr?'1':'0.15'):'0.18'; });
      allLbls.forEach(el => {
        el.style.opacity    = abbr?(el.dataset.abbr===abbr?'1':'0.15'):'0.18';
        el.style.fontWeight = abbr&&el.dataset.abbr===abbr?'800':'';
      });
      allLdrs.forEach(el => { el.style.opacity=abbr?(el.dataset.abbr===abbr?'1':'0.15'):'0.18'; });
      allHDots.forEach(el => { if (!abbr) el.style.opacity='0'; });
    }

    function getPoints(abbr) {
      const el = svg.querySelector(`.wins-line[data-abbr="${abbr}"]`);
      try { return JSON.parse(decodeURIComponent(el?.dataset.pts||'[]')); } catch(e) { return []; }
    }

    function mouseToGP(e) {
      const rect  = svg.getBoundingClientRect();
      const vbW   = parseFloat(svg.getAttribute('viewBox').split(' ')[2]);
      const scaleX = vbW / rect.width;
      return Math.max(0, Math.min(maxGP, ((e.clientX-rect.left)*scaleX-padLeft)/innerW*maxGP));
    }

    function nearestPt(pts, gp) {
      return pts.reduce((b,p)=>Math.abs(p.gp-gp)<Math.abs(b.gp-gp)?p:b, pts[0]);
    }

    function moveHoverDot(abbr, pt) {
      const dot = svg.querySelector(`.wins-hover-dot[data-abbr="${abbr}"]`);
      if (!dot||!pt) return;
      dot.setAttribute('cx', (padLeft+(pt.gp/maxGP)*innerW).toFixed(1));
      dot.setAttribute('cy', (padTop+chartH-(pt.w/MAX_WINS)*chartH).toFixed(1));
      dot.style.opacity='1';
    }

    function showTooltip(abbr, pt, e) {
      if (!tooltip||!pt) return;
      const color = svg.querySelector(`.wins-line[data-abbr="${abbr}"]`)?.getAttribute('stroke')||'#fff';
      const pace  = pt.gp>0 ? Math.round(pt.w/pt.gp*162) : 0;
      tooltip.style.borderLeftColor=color;
      tooltip.innerHTML=`
        <div style="font-weight:700;font-size:13px;margin-bottom:3px">${abbr}</div>
        <div>${pt.w} wins &middot; Game ${pt.gp}</div>
        <div style="margin-top:1px">${pt.w}&ndash;${pt.l} &middot; ${pt.pct}</div>
        <div style="opacity:.65;font-size:10px;margin-top:2px">${pace}-win pace over 162</div>
        <div style="opacity:.4;font-size:9px;margin-top:2px">${pt.date||''}</div>`;
      tooltip.style.left=`${Math.min(e.clientX+18,window.innerWidth-210)}px`;
      tooltip.style.top=`${Math.max(e.clientY-20,8)}px`;
      tooltip.style.display='block';
    }

    let locked=null, activeAbbr=null;
    function handleHover(abbr,e) {
      const pts=getPoints(abbr); if(!pts.length) return;
      const pt=nearestPt(pts,mouseToGP(e));
      moveHoverDot(abbr,pt); showTooltip(abbr,pt,e);
    }

    svg.querySelectorAll('.wins-line,.wins-hit,.wins-pt,.wins-label').forEach(el => {
      el.addEventListener('mouseenter', e => { if(locked) return; activeAbbr=el.dataset.abbr; highlight(activeAbbr); handleHover(activeAbbr,e); });
      el.addEventListener('mousemove',  e => { if(locked||!activeAbbr) return; handleHover(activeAbbr,e); });
      el.addEventListener('mouseleave', () => {
        if(locked) return; activeAbbr=null; highlight(null);
        if(tooltip) tooltip.style.display='none'; allHDots.forEach(d=>d.style.opacity='0');
      });
      el.addEventListener('click', e => {
        const abbr=el.dataset.abbr;
        if(locked===abbr) { locked=null; activeAbbr=null; highlight(null); if(tooltip) tooltip.style.display='none'; allHDots.forEach(d=>d.style.opacity='0'); }
        else { locked=abbr; activeAbbr=abbr; highlight(abbr); handleHover(abbr,e); }
      });
    });
    svg.addEventListener('mousemove', e => { if(locked&&activeAbbr) handleHover(activeAbbr,e); });
    svg.addEventListener('click', e => {
      if(!e.target.dataset.abbr) { locked=null; activeAbbr=null; highlight(null); if(tooltip) tooltip.style.display='none'; allHDots.forEach(d=>d.style.opacity='0'); }
    });
  });
}
