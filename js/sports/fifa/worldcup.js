// ════════════════════════════════════════
//  WORLD CUP  — live via ESPN (fifa.world)
// ════════════════════════════════════════
let wcYear = 2026;
let wcView = 'schedule';
let wcInitDone = false;

// ── ESPN endpoints (no key, hit through the same CORS proxy as the rest of the app)
const WC_ESPN_BASE      = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world';
const WC_ESPN_STANDINGS = 'https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings';

// Live cache for the current (non-past) tournament
const wcLive = { loaded:false, loading:false, error:null, updated:'', groups:[], schedule:[], teamGroup:{} };

const WC_DATA = {
  2026: {
    title:'2026 FIFA World Cup', hosts:'USA / Mexico / Canada', dates:'Jun 11 – Jul 19, 2026', past:false,
    // window covering the whole tournament — used for the live scoreboard range fetch
    start:'20260611', end:'20260719',
  },
  2022:{
    title:'2022 FIFA World Cup',hosts:'Qatar',dates:'Nov 20 – Dec 18, 2022',past:true,
    result:'🏆 Argentina def. France 4-2 (pens) — 3-3 AET',
    groups:{
      A:{teams:['Qatar 🇶🇦','Ecuador 🇪🇨','Senegal 🇸🇳','Netherlands 🇳🇱']},
      B:{teams:['England 🏴󠁧󠁢󠁥󠁮󠁧󠁿','Iran 🇮🇷','USA 🇺🇸','Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿'],highlight:true},
      C:{teams:['Argentina 🇦🇷','Saudi Arabia 🇸🇦','Mexico 🇲🇽','Poland 🇵🇱']},
      D:{teams:['France 🇫🇷','Australia 🇦🇺','Denmark 🇩🇰','Tunisia 🇹🇳']},
      E:{teams:['Spain 🇪🇸','Costa Rica 🇨🇷','Germany 🇩🇪','Japan 🇯🇵'],highlight:true},
      F:{teams:['Belgium 🇧🇪','Canada 🇨🇦','Morocco 🇲🇦','Croatia 🇭🇷']},
      G:{teams:['Brazil 🇧🇷','Serbia 🇷🇸','Switzerland 🇨🇭','Cameroon 🇨🇲']},
      H:{teams:['Portugal 🇵🇹','Ghana 🇬🇭','Uruguay 🇺🇾','South Korea 🇰🇷']},
    }
  },
  2018:{
    title:'2018 FIFA World Cup',hosts:'Russia',dates:'Jun 14 – Jul 15, 2018',past:true,
    result:'🏆 France def. Croatia 4-2',
    groups:{
      A:{teams:['Russia 🇷🇺','Saudi Arabia 🇸🇦','Egypt 🇪🇬','Uruguay 🇺🇾']},
      B:{teams:['Portugal 🇵🇹','Spain 🇪🇸','Morocco 🇲🇦','Iran 🇮🇷']},
      C:{teams:['France 🇫🇷','Australia 🇦🇺','Peru 🇵🇪','Denmark 🇩🇰']},
      D:{teams:['Argentina 🇦🇷','Iceland 🇮🇸','Croatia 🇭🇷','Nigeria 🇳🇬']},
      E:{teams:['Brazil 🇧🇷','Switzerland 🇨🇭','Costa Rica 🇨🇷','Serbia 🇷🇸']},
      F:{teams:['Germany 🇩🇪','Mexico 🇲🇽','Sweden 🇸🇪','South Korea 🇰🇷'],highlight:true},
      G:{teams:['Belgium 🇧🇪','Panama 🇵🇦','Tunisia 🇹🇳','England 🏴󠁧󠁢󠁥󠁮󠁧󠁿']},
      H:{teams:['Poland 🇵🇱','Senegal 🇸🇳','Colombia 🇨🇴','Japan 🇯🇵']},
    }
  },
  2014:{
    title:'2014 FIFA World Cup',hosts:'Brazil',dates:'Jun 12 – Jul 13, 2014',past:true,
    result:'🏆 Germany def. Argentina 1-0 (AET)',
    groups:{
      A:{teams:['Brazil 🇧🇷','Croatia 🇭🇷','Mexico 🇲🇽','Cameroon 🇨🇲']},
      B:{teams:['Spain 🇪🇸','Netherlands 🇳🇱','Chile 🇨🇱','Australia 🇦🇺']},
      C:{teams:['Colombia 🇨🇴','Greece 🇬🇷','Ivory Coast 🇨🇮','Japan 🇯🇵']},
      D:{teams:['Uruguay 🇺🇾','Costa Rica 🇨🇷','England 🏴󠁧󠁢󠁥󠁮󠁧󠁿','Italy 🇮🇹']},
      E:{teams:['Switzerland 🇨🇭','Ecuador 🇪🇨','France 🇫🇷','Honduras 🇭🇳']},
      F:{teams:['Argentina 🇦🇷','Bosnia 🇧🇦','Iran 🇮🇷','Nigeria 🇳🇬']},
      G:{teams:['Germany 🇩🇪','Portugal 🇵🇹','Ghana 🇬🇭','USA 🇺🇸'],highlight:true},
      H:{teams:['Belgium 🇧🇪','Algeria 🇩🇿','Russia 🇷🇺','South Korea 🇰🇷']},
    }
  }
};

// Country focus — user-selectable highlight across all live views ('' = none)
let wcFocus = '';
function setWCFocus(abbr){ wcFocus = abbr || ''; renderWC(); }
function wcIsFocus(abbr){ return wcFocus && abbr === wcFocus; }

// Unique, name-sorted list of countries currently in the tournament (for the dropdown)
function wcCountryList(){
  const seen={};
  for(const g of wcLive.groups) for(const t of g.teams) if(t.abbr) seen[t.abbr]=t.name;
  for(const m of wcLive.schedule){
    if(m.home.abbr) seen[m.home.abbr]=m.home.name;
    if(m.away.abbr) seen[m.away.abbr]=m.away.name;
  }
  return Object.entries(seen).map(([abbr,name])=>({abbr,name}))
    .sort((a,b)=>a.name.localeCompare(b.name));
}

// FIFA / ESPN 3-letter code → flag emoji (fallback ⚽)
const WC_FLAGS = {
  USA:'🇺🇸',MEX:'🇲🇽',CAN:'🇨🇦',BRA:'🇧🇷',ARG:'🇦🇷',FRA:'🇫🇷',GER:'🇩🇪',ESP:'🇪🇸',POR:'🇵🇹',
  NED:'🇳🇱',ENG:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',SCO:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',WAL:'🏴󠁧󠁢󠁷󠁬󠁳󠁿',BEL:'🇧🇪',ITA:'🇮🇹',CRO:'🇭🇷',SUI:'🇨🇭',
  POL:'🇵🇱',DEN:'🇩🇰',SWE:'🇸🇪',NOR:'🇳🇴',AUT:'🇦🇹',CZE:'🇨🇿',SRB:'🇷🇸',UKR:'🇺🇦',TUR:'🇹🇷',
  GRE:'🇬🇷',RUS:'🇷🇺',IRL:'🇮🇪',BIH:'🇧🇦',SVK:'🇸🇰',SVN:'🇸🇮',HUN:'🇭🇺',ROU:'🇷🇴',ISL:'🇮🇸',
  JPN:'🇯🇵',KOR:'🇰🇷',KSA:'🇸🇦',IRN:'🇮🇷',QAT:'🇶🇦',AUS:'🇦🇺',NZL:'🇳🇿',UZB:'🇺🇿',JOR:'🇯🇴',
  IRQ:'🇮🇶',UAE:'🇦🇪',CHN:'🇨🇳',
  MAR:'🇲🇦',TUN:'🇹🇳',ALG:'🇩🇿',EGY:'🇪🇬',SEN:'🇸🇳',CIV:'🇨🇮',GHA:'🇬🇭',CMR:'🇨🇲',NGA:'🇳🇬',
  RSA:'🇿🇦',CPV:'🇨🇻',MLI:'🇲🇱',COD:'🇨🇩',
  URU:'🇺🇾',COL:'🇨🇴',PAR:'🇵🇾',ECU:'🇪🇨',PER:'🇵🇪',CHI:'🇨🇱',VEN:'🇻🇪',BOL:'🇧🇴',
  CRC:'🇨🇷',PAN:'🇵🇦',HON:'🇭🇳',JAM:'🇯🇲',HAI:'🇭🇹',CUW:'🇨🇼',
};
function wcFlag(code){ return WC_FLAGS[(code||'').toUpperCase()] || '⚽'; }

// ── Tournament stage from a Date (aligned to ESPN's published calendar) ──────
function wcStageFor(d){
  const m = d.getUTCMonth()+1, day = d.getUTCDate(); // ESPN dates are UTC-stamped
  if(m===6 && day<=27) return null;          // group stage
  if((m===6&&day>=28)||(m===7&&day<=3)) return 'R32';
  if(m===7&&day>=4&&day<=7)  return 'R16';
  if(m===7&&day>=9&&day<=11) return 'QF';
  if(m===7&&day>=14&&day<=15)return 'SF';
  if(m===7&&day===18) return '3RD';
  if(m===7&&day>=19)  return 'Final';
  return null;
}
const WC_STAGE_SLUG = {'group-stage':null,'round-of-32':'R32','round-of-16':'R16',quarterfinals:'QF',semifinals:'SF','3rd-place-match':'3RD','final':'Final'};
const WC_ROUND_LABEL = {R32:'Round of 32',R16:'Round of 16',QF:'Quarterfinal',SF:'Semifinal','3RD':'3rd Place',Final:'⚽ Final'};

function setWCYear(yr,el){
  wcYear=yr;
  document.querySelectorAll('#wc-year-btns .wc-year-btn').forEach(b=>b.classList.remove('active'));
  if(el) el.classList.add('active');
  const d=WC_DATA[yr];
  if(d.past&&wcView==='schedule'){wcView='groups';document.querySelectorAll('#wc-view-btns .seg-btn').forEach((b,i)=>b.classList.toggle('active',i===1));}
  renderWC();
}

function setWCView(v,el){
  wcView=v;
  document.querySelectorAll('#wc-view-btns .seg-btn').forEach(b=>b.classList.remove('active'));
  if(el) el.classList.add('active');
  renderWC();
}

// ════════════════════════════════════════
//  LIVE FETCH
// ════════════════════════════════════════
async function loadWCLive(force){
  if(wcLive.loading) return;
  if(wcLive.loaded && !force) return;
  wcLive.loading = true; wcLive.error = null;
  if(force){ wcLive.loaded=false; }
  try{
    const d = WC_DATA[wcYear];
    const bust = force ? `&_=${Date.now()}` : '';
    const [stand, sched] = await Promise.all([
      apiFetch(`${WC_ESPN_STANDINGS}?season=${wcYear}${bust}`).catch(()=>null),
      fetchWCScoreboard(d.start, d.end, bust),
    ]);
    wcLive.groups = parseWCStandings(stand);
    wcLive.teamGroup = {};
    for(const g of wcLive.groups) for(const t of g.teams) if(t.abbr) wcLive.teamGroup[t.abbr]=g.letter;
    wcLive.schedule = parseWCSchedule(sched);
    wcLive.updated = new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
    wcLive.loaded = true;
  }catch(e){
    wcLive.error = e.message||String(e);
  }finally{
    wcLive.loading = false;
    renderWC();
  }
}
function refreshWCLive(){ loadWCLive(true); renderWC(); }

// ESPN rejects date-range scoreboard queries (HTTP 400), so request one day
// at a time and merge the events (deduped by id).
async function fetchWCScoreboard(start, end, bust){
  const days=[];
  const toD=s=>new Date(+s.slice(0,4), +s.slice(4,6)-1, +s.slice(6,8));
  for(let d=toD(start); d<=toD(end); d.setDate(d.getDate()+1)){
    days.push(`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`);
  }
  const perDay = await Promise.all(days.map(day=>
    apiFetch(`${WC_ESPN_BASE}/scoreboard?dates=${day}${bust}`).catch(()=>null)));
  const byId = new Map();
  for(const res of perDay) for(const ev of (res?.events||[])) byId.set(ev.id, ev);
  if(!byId.size) return null;
  return { events: [...byId.values()].sort((a,b)=>new Date(a.date)-new Date(b.date)) };
}

function parseWCStandings(data){
  const out=[];
  for(const child of (data?.children||[])){
    const letter=(child.name||child.abbreviation||'').replace(/^Group\s*/i,'').trim();
    const entries=child.standings?.entries||[];
    const teams=entries.map(en=>{
      const team=en.team||{}; const S={};
      for(const s of (en.stats||[])) S[s.name]=s;
      const num=(k,def=0)=>{ const v=S[k]?.value; return (typeof v==='number')?v:def; };
      return {
        name: team.shortDisplayName||team.displayName||team.name||'?',
        abbr: (team.abbreviation||'').toUpperCase(),
        gp:num('gamesPlayed'), w:num('wins'), d:num('ties'), l:num('losses'),
        gf:num('pointsFor'), ga:num('pointsAgainst'),
        gd:num('pointDifferential'), pts:num('points'),
        rank: S.rank?.value ?? null,
      };
    });
    teams.sort((a,b)=> (a.rank&&b.rank? a.rank-b.rank : 0) || b.pts-a.pts || b.gd-a.gd || b.gf-a.gf);
    teams.forEach((t,i)=>t.pos=i+1);
    if(letter) out.push({letter, teams});
  }
  out.sort((a,b)=>a.letter.localeCompare(b.letter));
  return out;
}

function parseWCSchedule(data){
  const out=[];
  for(const ev of (data?.events||[])){
    const comp=(ev.competitions||[])[0]; if(!comp) continue;
    const cs=comp.competitors||[];
    const home=cs.find(c=>c.homeAway==='home')||cs[0]||{};
    const away=cs.find(c=>c.homeAway==='away')||cs[1]||{};
    const st=comp.status?.type||{};
    const dt=new Date(ev.date);
    const t=(c)=>({
      abbr:(c.team?.abbreviation||'').toUpperCase(),
      name:c.team?.shortDisplayName||c.team?.displayName||c.team?.name||'TBD',
      score:c.score, winner:!!c.winner,
    });
    out.push({
      dt, iso:ev.date,
      dateKey: dt.toLocaleDateString('en-US',{timeZone:'America/New_York',month:'short',day:'numeric'}),
      time: dt.toLocaleTimeString('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit'})+' ET',
      state: st.state||'pre',                 // pre | in | post
      status: st.shortDetail||st.description||'',
      venue: comp.venue?.fullName||'',
      // ESPN labels the round; the date guess is only a fallback (late kickoffs
      // roll into the next UTC day and would land in the wrong round)
      stage: (ev.season?.slug in WC_STAGE_SLUG) ? WC_STAGE_SLUG[ev.season.slug] : wcStageFor(dt), // null for group stage
      home:t(home), away:t(away),
    });
  }
  out.sort((a,b)=>a.dt-b.dt);
  return out;
}

// ════════════════════════════════════════
//  RENDER (router)
// ════════════════════════════════════════
function renderWC(){
  const d=WC_DATA[wcYear];
  if(!d)return;
  const note=document.getElementById('wc-src-note');
  const el=document.getElementById('wc-content');
  if(!el) return;

  if(d.past){
    if(note) note.textContent=`${d.title} · ${d.dates} · ${d.hosts}${d.result?' · '+d.result:''}`;
    if(wcView==='bracket') el.innerHTML=renderWCBracketPast(d);
    else el.innerHTML=renderWCGroupsPast(d);
    return;
  }

  // ── live tournament ──
  if(wcLive.error && !wcLive.loaded){
    if(note) note.textContent=`${d.title} · ${d.dates} · ${d.hosts}`;
    el.innerHTML=`<div style="padding:24px;text-align:center;color:var(--muted)">
      <div style="margin-bottom:10px">Couldn’t reach live data — ${wcLive.error}</div>
      <button class="seg-btn" onclick="refreshWCLive()">↻ Retry</button></div>`;
    return;
  }
  if(!wcLive.loaded){
    if(note) note.textContent=`${d.title} · ${d.dates} · ${d.hosts} · loading live data…`;
    el.innerHTML=`<div style="padding:40px;text-align:center;color:var(--muted)">
      <div class="ld-spin" style="display:block;margin:0 auto 12px"></div>
      <div class="ld-msg">Loading live World Cup data…</div></div>`;
    if(!wcLive.loading) loadWCLive();
    return;
  }

  if(note) note.textContent=`${d.title} · ${d.dates} · ${d.hosts} · live via ESPN · updated ${wcLive.updated}`;
  if(wcView==='groups')      el.innerHTML=renderWCGroupsLive();
  else if(wcView==='bracket')el.innerHTML=renderWCBracketLive();
  else                       el.innerHTML=renderWCScheduleLive();
}

function wcControlsBar(label){
  const list=wcCountryList();
  const opts=['<option value="">All countries</option>']
    .concat(list.map(c=>`<option value="${c.abbr}"${c.abbr===wcFocus?' selected':''}>${wcFlag(c.abbr)} ${c.name}</option>`))
    .join('');
  return `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px">
    <label style="font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Focus country</label>
    <select onchange="setWCFocus(this.value)" style="font-family:var(--body);font-size:12px;padding:4px 10px;border:1px solid var(--border);border-radius:3px;background:#fff;cursor:pointer;color:var(--text);min-width:170px">${opts}</select>
    ${wcFocus?`<button class="seg-btn" style="padding:3px 9px;font-size:10px" onclick="setWCFocus('')">✕ Clear</button>`:''}
    <span style="font-family:var(--mono);font-size:10px;color:var(--muted)">${label}</span>
    <button class="seg-btn" style="margin-left:auto;padding:3px 9px;font-size:10px" onclick="refreshWCLive()">↻ Refresh</button>
  </div>`;
}

// ── LIVE: GROUPS (real standings) ───────────────────────────────────────────
function renderWCGroupsLive(){
  if(!wcLive.groups.length) return '<p style="padding:20px;color:var(--muted)">Group standings not posted yet.</p>';
  let html=wcControlsBar('Top 2 advance · 3rd may advance as best third-placed team · sorted by Pts, then GD');
  html+=`<div class="wc-groups-grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">`;
  for(const g of wcLive.groups){
    const hasFocus=g.teams.some(t=>wcIsFocus(t.abbr));
    html+=`<div class="wc-group-card"${hasFocus?' style="outline:2px solid var(--navy);outline-offset:-1px"':''}>
      <div class="wc-group-hdr">Group ${g.letter}</div>
      <div style="overflow-x:auto">
      <table class="wc-group-table" style="min-width:300px">
        <thead><tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th title="Goal Difference">GD</th><th>Pts</th></tr></thead>
        <tbody>`;
    for(const t of g.teams){
      const focus=wcIsFocus(t.abbr);
      // qualification tint: 1–2 advance (green), 3 best-third watch (amber)
      const qual=t.pos<=2?'border-left:3px solid #1a7a3a':t.pos===3?'border-left:3px solid #b08828':'border-left:3px solid transparent';
      const focusBg=focus?'background:rgba(12,31,63,.07)':'';
      const gd=(t.gd>0?'+':'')+t.gd;
      const gdColor=t.gd>0?'color:#1a7a3a':t.gd<0?'color:var(--red)':'color:var(--muted)';
      html+=`<tr style="${qual};${focusBg}">
        <td style="${focus?'font-weight:800;color:var(--navy)':''}">${wcFlag(t.abbr)} ${t.name}</td>
        <td>${t.gp}</td><td>${t.w}</td><td>${t.d}</td><td>${t.l}</td>
        <td>${t.gf}</td><td>${t.ga}</td>
        <td style="font-weight:700;${gdColor}">${gd}</td>
        <td style="font-weight:800;color:var(--navy)">${t.pts}</td></tr>`;
    }
    html+=`</tbody></table></div></div>`;
  }
  return html+'</div>';
}

// ── LIVE: SCHEDULE (real scores + status) ───────────────────────────────────
function wcScoreCell(m){
  if(m.state==='pre') return `<div class="wc-match-score" style="color:var(--faint)">–</div>`;
  const hs=m.home.score??'', as=m.away.score??'';
  const live=m.state==='in';
  return `<div class="wc-match-score"${live?' style="color:var(--red);font-weight:800"':''}>${hs}–${as}</div>`;
}
function wcStatusText(m){
  if(m.state==='in')  return `<span style="color:var(--red);font-weight:700">● ${m.status||'LIVE'}</span>`;
  if(m.state==='post')return `<span style="color:var(--muted)">${m.status||'FT'}</span>`;
  return `${m.dateKey} · ${m.time}`;
}
function renderWCMatchRow(m,featured){
  const inFocus = wcIsFocus(m.home.abbr)||wcIsFocus(m.away.abbr);
  const hl = featured||inFocus;
  const stageBadge = m.stage
    ? `<span style="font-family:var(--mono);font-size:8px;font-weight:700;padding:1px 5px;border-radius:2px;background:${m.stage==='Final'?'#0C1F3F':m.stage==='SF'?'#132952':m.stage==='QF'?'#1a5c2a':'var(--bg3)'};color:${['Final','SF','QF'].includes(m.stage)?'#fff':'var(--muted)'};margin-right:4px">${m.stage}</span>`
    : `<span style="font-family:var(--mono);font-size:8px;color:var(--faint);margin-right:4px">Grp ${wcLive.teamGroup[m.home.abbr]||wcLive.teamGroup[m.away.abbr]||'–'}</span>`;
  const wB=(c)=> c.winner&&m.state==='post' ? 'font-weight:800' : '';
  const teams=`<span style="${wB(m.home)}">${wcFlag(m.home.abbr)} ${m.home.name}</span> <span style="font-family:var(--mono);font-size:9px;color:var(--muted)">vs</span> <span style="${wB(m.away)}">${wcFlag(m.away.abbr)} ${m.away.name}</span>`;
  return `<div class="wc-match${hl?' wc-highlight':''}">
    <div class="wc-match-teams">${stageBadge}${teams}</div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:1px">
      <div class="wc-match-date">${wcStatusText(m)}</div>
      <div class="wc-match-venue">${m.venue}</div>
    </div>
    ${wcScoreCell(m)}
  </div>`;
}
function renderWCScheduleLive(){
  if(!wcLive.schedule.length) return '<p style="padding:20px;color:var(--muted)">Schedule not available.</p>';
  let html=wcControlsBar(`${wcLive.schedule.length} matches · live scores update on Refresh`);
  if(wcFocus){
    const focused=wcLive.schedule.filter(m=>wcIsFocus(m.home.abbr)||wcIsFocus(m.away.abbr));
    if(focused.length){
      const fname=(wcCountryList().find(c=>c.abbr===wcFocus)||{}).name||wcFocus;
      html+=`<div class="wc-schedule-section"><div class="wc-schedule-date-hdr" style="color:var(--navy);font-weight:700;letter-spacing:.05em">${wcFlag(wcFocus)} ${fname} — Matches</div>`;
      for(const m of focused) html+=renderWCMatchRow(m,true);
      html+=`</div>`;
    }
  }
  html+=`<div class="wc-schedule-section"><div class="wc-schedule-date-hdr">Full Schedule</div>`;
  let lastDate=null;
  for(const m of wcLive.schedule){
    if(m.dateKey!==lastDate){
      lastDate=m.dateKey;
      html+=`<div style="font-family:var(--display);font-size:10px;font-weight:800;letter-spacing:.05em;color:var(--muted);padding:6px 0 3px;text-transform:uppercase;border-top:1px solid var(--border);margin-top:4px">${m.dateKey}</div>`;
    }
    html+=renderWCMatchRow(m,false);
  }
  return html+'</div>';
}

// ── LIVE: BRACKET (fills from real knockout results) ────────────────────────
function renderWCBracketLive(){
  const ko=wcLive.schedule.filter(m=>m.stage);
  const order=['R32','R16','QF','SF','3RD','Final'];
  const byStage={}; for(const s of order) byStage[s]=[];
  for(const m of ko) (byStage[m.stage]=byStage[m.stage]||[]).push(m);

  let html=wcControlsBar('Knockout results fill in live as matches are played');
  if(!ko.length){
    return html+'<div style="padding:30px;text-align:center;color:var(--muted)">Bracket fills in once the group stage is complete.</div>';
  }
  // Order each round so a match sits between the two matches that fed it:
  // walk back from the Final, pulling the earlier-round match each team came from.
  const funnel=order.filter(s=>s!=='3RD'&&byStage[s].length);
  for(let i=funnel.length-2;i>=0;i--){
    const next=byStage[funnel[i+1]], cur=byStage[funnel[i]], used=new Set(), sorted=[];
    for(const nm of next) for(const side of [nm.home,nm.away]){
      const src=side.abbr&&cur.find(m=>!used.has(m)&&(m.home.abbr===side.abbr||m.away.abbr===side.abbr));
      if(src){ used.add(src); sorted.push(src); }
    }
    byStage[funnel[i]]=[...sorted,...cur.filter(m=>!used.has(m))];
  }

  const koMatch=(m)=>{
    const done=m.state==='post';
    const team=(c)=>{
      const nm=c.abbr?`${wcFlag(c.abbr)} ${c.abbr}`:'TBD';
      const sc=done?` <span style="font-family:var(--mono);font-weight:700">${c.score??''}</span>`:'';
      const win=done&&c.winner?'font-weight:800':(c.abbr?'':'');
      const foc=wcIsFocus(c.abbr)?';color:var(--navy);font-weight:800':'';
      return `<div class="team${c.abbr?'':' tbd'}" style="${win}${foc}">${nm}${sc}</div>`;
    };
    const koFocus=wcIsFocus(m.home.abbr)||wcIsFocus(m.away.abbr);
    return `<div class="wc-ko-match"${koFocus?' style="outline:2px solid var(--navy);outline-offset:-1px"':''}>${team(m.home)}
      <div style="font-family:var(--mono);font-size:8px;color:var(--faint);text-align:center;padding:2px 0">${m.state==='in'?'<span style="color:var(--red)">live</span>':'vs'}</div>
      ${team(m.away)}</div>`;
  };

  // Every round stretches to the first round's height and spaces its matches
  // evenly, so each match lines up halfway between its two feeder matches.
  html+=`<div class="wc-ko-bracket">`;
  for(const s of funnel){
    html+=`<div class="wc-ko-round"><div class="ko-stage-hdr">${WC_ROUND_LABEL[s]||s}</div>
      <div class="wc-ko-matches">${byStage[s].map(koMatch).join('')}</div></div>`;
  }
  html+='</div>';
  if(byStage['3RD'].length){
    html+=`<div class="wc-ko-round" style="margin-top:14px;max-width:200px"><div class="ko-stage-hdr">${WC_ROUND_LABEL['3RD']||'Third place'}</div>
      ${byStage['3RD'].map(koMatch).join('')}</div>`;
  }
  return html;
}

// ════════════════════════════════════════
//  RENDER (past tournaments — static)
// ════════════════════════════════════════
function renderWCGroupsPast(d){
  let html=`<div class="wc-groups-grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">`;
  for(const [letter,g] of Object.entries(d.groups)){
    const hl=g.highlight;
    html+=`<div class="wc-group-card">
      <div class="wc-group-hdr"${hl?' style="background:#8B1A1A"':''}>
        Group ${letter}${hl?' <span style="font-size:9px;opacity:.7;font-weight:400">▲ Featured</span>':''}
      </div>
      <table class="wc-group-table">
        <thead><tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th></tr></thead>
        <tbody>`;
    for(const t of g.teams){
      const isUSA=t.includes('USA'),isGER=t.includes('Germany');
      const cls=isUSA?'wc-team-usa':isGER?'wc-team-ger':'';
      html+=`<tr class="${cls}"><td>${t}</td><td>–</td><td>–</td><td>–</td><td>–</td><td>–</td><td>–</td><td>–</td><td>–</td></tr>`;
    }
    html+=`</tbody></table></div>`;
  }
  return html+'</div>';
}
function renderWCBracketPast(d){
  return `<div style="padding:30px;text-align:center;color:var(--muted)">
    <div style="font-family:var(--display);font-size:18px;font-weight:800;margin-bottom:8px">${d.result||''}</div>
    <div style="font-size:11px">${d.title} · ${d.hosts}</div></div>`;
}
