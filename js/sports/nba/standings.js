// ════════════════════════════════════════
//  NBA STANDINGS
// ════════════════════════════════════════
let nbaStdData = [];
let nbaStdConf = 'East';
let nbaStdSort = { col: 'confRank', asc: true };

function setNbaStdConf(conf, el) {
  nbaStdConf = conf;
  document.querySelectorAll('#pane-nba-standings .seg-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  renderNbaStandings();
}

async function loadNbaStandings() {
  const statusEl = document.getElementById('nba-std-status');
  const spinEl   = document.getElementById('nba-std-spin');
  const msgEl    = document.getElementById('nba-std-msg');
  statusEl.style.display = 'block';
  spinEl.style.display = 'block';
  msgEl.textContent = 'Loading NBA standings…';
  document.getElementById('nba-std-content').innerHTML = '';
  try {
    const data = await apiFetch(
      'https://site.web.api.espn.com/apis/v2/sports/basketball/nba/standings?region=us&lang=en&contentorigin=espn&type=0&level=2&sort=gamesbehind:asc'
    );
    nbaStdData = parseEspnNbaStandings(data);
    statusEl.style.display = 'none';
    renderNbaStandings();
    const season = data?.children?.[0]?.standings?.seasonDisplayName || 'Current';
    document.getElementById('nba-std-src-note').textContent =
      `NBA ${season} Standings · site.web.api.espn.com`;
  } catch(e) {
    spinEl.style.display = 'none';
    msgEl.textContent = 'Could not load NBA standings: ' + e.message;
  }
}

function parseEspnNbaStandings(data) {
  const rows = [];
  for (const conf of (data?.children || [])) {
    const conference = conf.name?.includes('East') ? 'East' : 'West';
    for (const entry of (conf.standings?.entries || [])) {
      const team = entry.team || {};
      const S = {};
      for (const s of (entry.stats || [])) S[s.name] = s;
      rows.push({
        conference,
        name:    team.shortDisplayName || team.displayName || '?',
        abbr:    team.abbreviation || '',
        espnId:  team.id || '',
        w:       S.wins?.value ?? 0,
        l:       S.losses?.value ?? 0,
        pct:     S.winPercent?.value ?? 0,
        pctDisp: S.winPercent?.displayValue ?? '.000',
        gb:      S.gamesBehind?.value ?? 0,
        gbDisp:  S.gamesBehind?.displayValue ?? '-',
        home:    S.Home?.summary || S.Home?.displayValue || '',
        away:    S.Road?.summary || S.Road?.displayValue || '',
        conf:    S['vs. Conf.']?.summary || '',
        l10:     S['Last Ten Games']?.summary || '',
        streak:  S.streak?.displayValue || '',
        diff:    S.differential?.displayValue || '',
        diffVal: S.differential?.value ?? 0,
      });
    }
  }
  ['East','West'].forEach(conf => {
    const group = rows.filter(r => r.conference === conf);
    group.sort((a,b) => b.pct - a.pct || a.l - b.l);
    group.forEach((r,i) => r.confRank = i+1);
  });
  return rows;
}

function renderNbaStandings() {
  if (!nbaStdData.length) return;
  const wcMode = document.getElementById('nba-wc-tog').checked;
  document.getElementById('nba-std-content').innerHTML = renderNbaConference(nbaStdConf, wcMode);
}

function renderNbaConference(conf, wcMode) {
  const rows = nbaStdData
    .filter(r => r.conference === conf)
    .sort((a,b) => a.confRank - b.confRank);

  const sc = nbaStdSort;
  const sorted = [...rows].sort((a,b) => {
    let va = a[sc.col], vb = b[sc.col];
    if (sc.col === 'pctDisp') { va = a.pct; vb = b.pct; }
    if (sc.col === 'gbDisp')  { va = a.gb;  vb = b.gb;  }
    if (va == null) va = 9999; if (vb == null) vb = 9999;
    if (typeof va === 'string') return sc.asc ? va.localeCompare(vb) : vb.localeCompare(va);
    return sc.asc ? va - vb : vb - va;
  });

  const cols = [
    { k:'confRank', h:'#',    r:false },
    { k:'name',     h:'Team', r:false },
    { k:'w',        h:'W',    r:true  },
    { k:'l',        h:'L',    r:true  },
    { k:'pctDisp',  h:'PCT',  r:true  },
    { k:'gbDisp',   h:'GB',   r:true  },
    { k:'home',     h:'Home', r:true  },
    { k:'away',     h:'Away', r:true  },
    { k:'conf',     h:'Conf', r:true  },
    { k:'l10',      h:'L10',  r:true  },
    { k:'streak',   h:'Strk', r:true  },
    { k:'diff',     h:'Diff', r:true  },
  ];

  const arrow = k => sc.col===k ? (sc.asc?'↑':'↓') : '<span style="opacity:.3">↕</span>';
  const thead = `<tr>${cols.map(c =>
    `<th class="${c.r?'r':''}" onclick="sortNbaStd('${c.k}')" style="cursor:pointer;white-space:nowrap">${c.h} ${arrow(c.k)}</th>`
  ).join('')}</tr>`;

  const PLAYOFF    = 6;
  const PLAYIN_END = 10;

  const legend = wcMode ? `<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:8px;font-family:var(--mono);font-size:10px">
    <span style="color:#1a7a3a">■ 1–6 Playoff Berth</span>
    <span style="color:#b08828">■ 7–10 Play-In</span>
    <span style="color:var(--red)">■ 11–15 Lottery</span>
  </div>` : '';

  const tbody = sorted.map(r => {
    const seed   = r.confRank;
    const isBos  = r.abbr === selectedNbaTeamAbbr;
    let zoneBg   = isBos ? 'background:rgba(0,122,51,.07)' : '';
    const nameFw = isBos ? 'font-weight:800;color:#0C1F3F' : '';

    let divider = '';
    if (wcMode) {
      if (seed === PLAYOFF + 1)    divider = `<tr><td colspan="${cols.length}" style="padding:2px 8px;background:#e4f5eb;font-family:var(--mono);font-size:9px;color:#1a7a3a;font-weight:600;letter-spacing:.08em">▸ PLAY-IN TOURNAMENT (7–10)</td></tr>`;
      if (seed === PLAYIN_END + 1) divider = `<tr><td colspan="${cols.length}" style="padding:2px 8px;background:#fde8ec;font-family:var(--mono);font-size:9px;color:var(--red);font-weight:600;letter-spacing:.08em">▸ LOTTERY (11–15)</td></tr>`;
    }

    const seedColor = wcMode
      ? (seed <= PLAYOFF ? '#1a7a3a' : seed <= PLAYIN_END ? '#b08828' : 'var(--muted)')
      : 'var(--muted)';

    return divider + `<tr style="${zoneBg};cursor:pointer" onclick="goToNbaTeam('${r.espnId}','${r.abbr}','${r.name}','${r.conference}')" title="View ${r.name} stats & trends">
      <td style="font-family:var(--mono);font-size:11px;font-weight:600;color:${seedColor}">${seed}</td>
      <td><span style="font-family:var(--display);font-weight:700;font-size:12px;${nameFw}">${r.name}</span> <span style="font-family:var(--mono);font-size:9px;color:var(--faint)">→</span> <span style="font-family:var(--mono);font-size:9px;color:var(--faint);opacity:.6">→</span></td>
      <td class="r" style="font-family:var(--mono);font-size:11px;font-weight:700">${r.w}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px">${r.l}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px">${r.pctDisp}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px">${r.gb===0?'—':r.gbDisp}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px">${r.home}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px">${r.away}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px">${r.conf}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px">${r.l10}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px">${r.streak}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px;${r.diffVal>0?'color:var(--green)':r.diffVal<0?'color:var(--red)':''}">${r.diff}</td>
    </tr>`;
  }).join('');

  return `<div class="sec-hdr" style="margin-top:14px">
    <span class="sec-title">${conf}ern Conference</span>
    <div class="sec-line"></div></div>
    ${legend}
    <div class="tbl-wrap" style="margin-bottom:6px"><table style="min-width:580px">
      <thead>${thead}</thead><tbody>${tbody}</tbody>
    </table></div>`;
}

function sortNbaStd(col) {
  nbaStdSort.asc = nbaStdSort.col === col ? !nbaStdSort.asc : (col === 'confRank' || col === 'gbDisp' || col === 'l');
  nbaStdSort.col = col;
  renderNbaStandings();
}

// NBA schedule strip functions (offsetDateStr, friendlyDate, renderScheduleNav,
// renderGameChip, loadNbaScheduleStrip, loadNbaTodayGames, nbaScheduleOffset)
// are defined in js/shared/ui.js and loaded before this file.
