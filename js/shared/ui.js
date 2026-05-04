// ════════════════════════════════════════
//  SHARED UI HELPERS
// ════════════════════════════════════════

function liveBadge() {
  return `<span class="live-badge"><span class="live-dot"></span>LIVE</span>`;
}

function bar(v, color, max=80, textColor=null) {
  const n=v||0, pct=Math.min(100,Math.round(n/max*100));
  const sc='rgba(190,50,50,0.28)';
  const baseballSvg=`<svg viewBox="0 0 32 32" width="24" height="24" style="display:block" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="15" fill="white" stroke="#d8d6cf" stroke-width="0.8"/>
    <path d="M7 5 C3 9, 3 23, 7 27" fill="none" stroke="${sc}" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M25 5 C29 9, 29 23, 25 27" fill="none" stroke="${sc}" stroke-width="1.2" stroke-linecap="round"/>
    <line x1="7"  y1="9"  x2="4.5" y2="8.5"  stroke="${sc}" stroke-width="0.9" stroke-linecap="round"/>
    <line x1="6"  y1="13" x2="3.5" y2="12.8" stroke="${sc}" stroke-width="0.9" stroke-linecap="round"/>
    <line x1="5.5" y1="16" x2="3" y2="16"    stroke="${sc}" stroke-width="0.9" stroke-linecap="round"/>
    <line x1="6"  y1="19" x2="3.5" y2="19.2" stroke="${sc}" stroke-width="0.9" stroke-linecap="round"/>
    <line x1="7"  y1="23" x2="4.5" y2="23.5" stroke="${sc}" stroke-width="0.9" stroke-linecap="round"/>
    <line x1="25" y1="9"  x2="27.5" y2="8.5"  stroke="${sc}" stroke-width="0.9" stroke-linecap="round"/>
    <line x1="26" y1="13" x2="28.5" y2="12.8" stroke="${sc}" stroke-width="0.9" stroke-linecap="round"/>
    <line x1="26.5" y1="16" x2="29" y2="16"   stroke="${sc}" stroke-width="0.9" stroke-linecap="round"/>
    <line x1="26" y1="19" x2="28.5" y2="19.2" stroke="${sc}" stroke-width="0.9" stroke-linecap="round"/>
    <line x1="25" y1="23" x2="27.5" y2="23.5" stroke="${sc}" stroke-width="0.9" stroke-linecap="round"/>
    <text x="16" y="21" text-anchor="middle" font-family="'Libre Franklin',sans-serif" font-weight="900" font-size="${n>=100?'11':'13'}" fill="${textColor||color}" letter-spacing="0.3">${n}</text>
  </svg>`;
  if (n===0) return `<div class="bar-cell"><div class="bar-tr"><div class="bar-fi" style="width:0%;background:${color}"></div></div></div>`;
  return `<div class="bar-cell">
    <div class="bar-tr">
      <div class="bar-fi" style="width:${pct}%;background:${color}"></div>
      <div style="position:absolute;top:50%;left:${pct}%;transform:translate(-50%,-50%);width:24px;height:24px;z-index:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.15))">
        ${baseballSvg}
      </div>
    </div>
  </div>`;
}

function baseballBubble(v, max, color) {
  const pct = Math.min(100, Math.round((v||0) / max * 100));
  if (!v) return `<div class="bkt-bar-cell"><div class="bkt-bar-tr"></div></div>`;
  const svg = `<svg viewBox="0 0 32 32" width="24" height="24" xmlns="http://www.w3.org/2000/svg" style="display:block">
    <defs><clipPath id="bbbc"><circle cx="16" cy="16" r="13.5"/></clipPath></defs>
    <circle cx="16" cy="16" r="13.5" fill="#fff" stroke="#d8d6cf" stroke-width="0.8"/>
    <g clip-path="url(#bbbc)" fill="none" stroke="#d44" stroke-width="1.1" stroke-linecap="round">
      <path d="M6,8 Q10,16 6,24"/>
      <path d="M26,8 Q22,16 26,24"/>
    </g>
    <circle cx="16" cy="16" r="13.5" fill="none" stroke="#d8d6cf" stroke-width="0.8"/>
    <text x="16" y="16" text-anchor="middle" dominant-baseline="central" font-family="'Libre Franklin',sans-serif" font-weight="900" font-size="${v>=10?'11':'14'}" fill="${color}">${v}</text>
  </svg>`;
  return `<div class="bkt-bar-cell">
    <div class="bkt-bar-tr">
      <div class="bkt-bar-fi" style="width:${pct}%;background:${color}"></div>
      <div style="position:absolute;top:50%;left:${pct}%;transform:translate(-50%,-50%);width:24px;height:24px;z-index:1">${svg}</div>
    </div>
  </div>`;
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

function freshness(p) {
  if (p.role==='SP') return {lbl:'Starter',cls:'b-starter',color:'#0C1F3F',textColor:'#0C1F3F',ord:99};
  const t2=(p.g1||0)+(p.g2||0)+(p.g2||0); // use games[0]+[1]+[2]
  const t3=(p.games?.[0]||0)+(p.games?.[1]||0)+(p.games?.[2]||0);
  if (t3===0)  return {lbl:'Fresh',  cls:'b-fresh',  color:'#3DAB6E',textColor:'#2d8a56',ord:0};
  if (t3<15)   return {lbl:'Fresh',  cls:'b-fresh',  color:'#3DAB6E',textColor:'#2d8a56',ord:1};
  if (t3<=30)  return {lbl:'Serviceable', cls:'b-monitor',color:'#FFD600',textColor:'#c9aa00',ord:2};
               return {lbl:'Tired',  cls:'b-heavy',  color:'#FF3D00',textColor:'#FF3D00',ord:3};
}

function posClass(pos) {
  if(['LF','RF','CF'].includes(pos)) return 'pill-of';
  if(['1B','2B','3B','SS'].includes(pos)) return 'pill-if';
  if(pos==='C') return 'pill-c';
  return 'pill-dh';
}

// ── Schedule Strip helpers ────────────────────────────────────────────────
let nbaScheduleOffset = 0; // days from today
let mlbScheduleOffset = 0;

function offsetDateStr(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function friendlyDate(dateStr, offset) {
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';
  if (offset === -1) return 'Yesterday';
  const [y,m,d] = dateStr.split('-');
  return new Date(y, m-1, d).toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric'});
}

function renderScheduleNav(offset, onPrev, onNext, onToday) {
  const isToday = offset === 0;
  return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
    <button onclick="${onPrev}" style="font-family:var(--mono);font-size:12px;background:#fff;border:1px solid var(--border);border-radius:var(--radius);padding:3px 10px;cursor:pointer;color:var(--text)">◀</button>
    <button onclick="${onToday}" style="font-family:var(--mono);font-size:10px;letter-spacing:.06em;background:${isToday?'var(--navy)':'#fff'};color:${isToday?'#fff':'var(--muted)'};border:1px solid ${isToday?'var(--navy)':'var(--border)'};border-radius:var(--radius);padding:3px 10px;cursor:pointer;transition:all .15s">TODAY</button>
    <button onclick="${onNext}" style="font-family:var(--mono);font-size:12px;background:#fff;border:1px solid var(--border);border-radius:var(--radius);padding:3px 10px;cursor:pointer;color:var(--text)">▶</button>
  </div>`;
}

function renderGameChip({ away, home, awayScore, homeScore, status, isFinal, isLive, highlight, highlightColor }) {
  const hasScore = awayScore != null && homeScore != null;
  const awayWin  = isFinal && hasScore && awayScore > homeScore;
  const homeWin  = isFinal && hasScore && homeScore > awayScore;
  const scoreHtml = hasScore
    ? `<span style="font-family:var(--mono);font-size:11px;font-weight:600;letter-spacing:.03em">
        <span style="${awayWin?'font-weight:800':''}">${away}</span>
        <span style="color:var(--muted);margin:0 3px">${awayScore}–${homeScore}</span>
        <span style="${homeWin?'font-weight:800':''}">${home}</span>
       </span>`
    : `<span style="font-family:var(--mono);font-size:11px;color:var(--text)">${away} <span style="color:var(--faint)">@</span> ${home}</span>`;
  const statusColor = isLive ? 'color:#c03' : isFinal ? 'color:var(--muted)' : 'color:var(--faint)';
  let chipStyle = isLive ? 'border-color:rgba(200,16,46,.4);border-width:1.5px' : '';
  if (highlight && highlightColor === 'green') chipStyle = 'border-color:#007A33;border-width:2px;background:rgba(0,122,51,.06)';
  if (highlight && highlightColor === 'navy')  chipStyle = 'border-color:var(--navy);border-width:2px;background:rgba(12,31,63,.05)';
  return `<div class="gchip" style="${chipStyle}">
    ${scoreHtml}
    <span style="font-family:var(--mono);font-size:9px;letter-spacing:.06em;${statusColor}">${status}</span>
  </div>`;
}

async function loadNbaScheduleStrip(offset) {
  nbaScheduleOffset = offset;
  const el = document.getElementById('nba-today-strip');
  if (!el) return;
  const dateStr  = offsetDateStr(offset);
  const dateCode = dateStr.replace(/-/g,'');
  const label    = friendlyDate(dateStr, offset);

  const nav = renderScheduleNav(offset,
    `loadNbaScheduleStrip(${offset-1})`,
    `loadNbaScheduleStrip(${offset+1})`,
    `loadNbaScheduleStrip(0)`
  );

  el.innerHTML = nav + `<div style="font-family:var(--mono);font-size:9px;letter-spacing:.08em;color:var(--faint);text-transform:uppercase;margin-bottom:6px">NBA · ${label}</div><div class="games-strip" style="margin-bottom:0" id="nba-chips-row"><span style="font-family:var(--mono);font-size:10px;color:var(--faint)">Loading…</span></div>`;

  try {
    const data   = await apiFetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${dateCode}`);
    const events = data.events || [];
    const chipsEl = document.getElementById('nba-chips-row');
    if (!chipsEl) return;
    if (!events.length) { chipsEl.innerHTML = `<span style="font-family:var(--mono);font-size:10px;color:var(--faint)">No games</span>`; return; }

    chipsEl.innerHTML = events.map(ev => {
      const comps   = ev.competitions?.[0];
      const teams   = comps?.competitors || [];
      const away    = teams.find(t => t.homeAway === 'away');
      const home    = teams.find(t => t.homeAway === 'home');
      const awayAbbr = away?.team?.abbreviation || '?';
      const homeAbbr = home?.team?.abbreviation || '?';
      const state   = comps?.status?.type?.state;
      const isLive  = state === 'in';
      const isFinal = state === 'post';
      const period  = comps?.status?.period;
      const clock   = comps?.status?.displayClock;
      const statusTxt = isFinal ? 'Final' : isLive ? `Q${period} ${clock}` : (comps?.status?.type?.shortDetail || '');
      const highlight = awayAbbr === 'BOS' || homeAbbr === 'BOS';
      return renderGameChip({
        away: awayAbbr, home: homeAbbr,
        awayScore: away?.score != null ? +away.score : null,
        homeScore: home?.score != null ? +home.score : null,
        status: statusTxt, isFinal, isLive, highlight, highlightColor: 'green',
      });
    }).join('');
  } catch(e) {
    const chipsEl = document.getElementById('nba-chips-row');
    if (chipsEl) chipsEl.innerHTML = `<span style="font-family:var(--mono);font-size:10px;color:var(--faint)">Could not load</span>`;
  }
}

async function loadMlbScheduleStrip(offset) {
  mlbScheduleOffset = offset;
  const el = document.getElementById('mlb-today-strip');
  if (!el) return;
  const dateStr = offsetDateStr(offset);
  const label   = friendlyDate(dateStr, offset);

  const nav = renderScheduleNav(offset,
    `loadMlbScheduleStrip(${offset-1})`,
    `loadMlbScheduleStrip(${offset+1})`,
    `loadMlbScheduleStrip(0)`
  );

  el.innerHTML = nav + `<div style="font-family:var(--mono);font-size:9px;letter-spacing:.08em;color:var(--faint);text-transform:uppercase;margin-bottom:6px">MLB · ${label} · ${dateStr}</div><div class="games-strip" style="margin-bottom:0" id="mlb-chips-row"><span style="font-family:var(--mono);font-size:10px;color:var(--faint)">Loading…</span></div>`;

  // Reload standings as-of this date in parallel
  loadMlbStandings(dateStr);

  try {
    const data  = await apiFetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${dateStr}&hydrate=team,linescore`);
    const games = data.dates?.[0]?.games || [];
    const chipsEl = document.getElementById('mlb-chips-row');
    if (!chipsEl) return;
    if (!games.length) { chipsEl.innerHTML = `<span style="font-family:var(--mono);font-size:10px;color:var(--faint)">No games</span>`; return; }

    chipsEl.innerHTML = games.map(g => {
      const away    = g.teams?.away;
      const home    = g.teams?.home;
      const awayAbbr = away?.team?.abbreviation || '?';
      const homeAbbr = home?.team?.abbreviation || '?';
      const state   = g.status?.abstractGameState;
      const isLive  = state === 'Live';
      const isFinal = state === 'Final';
      const inning  = g.linescore?.currentInning;
      const half    = g.linescore?.inningHalf;
      const statusTxt = isFinal ? 'Final'
        : isLive  ? `${half === 'Top' ? '▲' : '▼'}${inning}`
        : g.gameDate ? new Date(g.gameDate).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}) : '';
      const highlight = awayAbbr === 'BOS' || homeAbbr === 'BOS';
      return renderGameChip({
        away: awayAbbr, home: homeAbbr,
        awayScore: isFinal||isLive ? (away?.score ?? null) : null,
        homeScore: isFinal||isLive ? (home?.score ?? null) : null,
        status: statusTxt, isFinal, isLive, highlight, highlightColor: 'navy',
      });
    }).join('');
  } catch(e) {
    const chipsEl = document.getElementById('mlb-chips-row');
    if (chipsEl) chipsEl.innerHTML = `<span style="font-family:var(--mono);font-size:10px;color:var(--faint)">Could not load</span>`;
  }
}

// Aliases so switchTab still works
function loadNbaTodayGames() { loadNbaScheduleStrip(nbaScheduleOffset); }
function loadMlbTodayGames() { loadMlbScheduleStrip(mlbScheduleOffset); }
