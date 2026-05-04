// ════════════════════════════════════════
//  ARCHIVE — Sub-tabs & Draft
// ════════════════════════════════════════
// archiveSub, draftSport, draftYear, draftView, draftLoading,
// DRAFT_HOME_TEAM, DRAFT_HOME_NAME are declared in js/config.js

// ── Static Draft Data ─────────────────────────────────────────────────────
// Round 1 only for NBA/NFL; includes home team picks for all sports
const DRAFT_DATA = {
  // ── 2025 NBA Draft (Round 1) ─────────────────────────────────────────
  'nba-2025': [
    {round:1,pick:1, team:'DAL',player:'Cooper Flagg',       pos:'F', college:'Duke'},
    {round:1,pick:2, team:'SAS',player:'Dylan Harper',       pos:'G', college:'Rutgers'},
    {round:1,pick:3, team:'PHI',player:'VJ Edgecombe',       pos:'G', college:'Baylor'},
    {round:1,pick:4, team:'CHA',player:'Kon Knueppel',       pos:'G', college:'Duke'},
    {round:1,pick:5, team:'UTA',player:'Ace Bailey',         pos:'F', college:'Rutgers'},
    {round:1,pick:6, team:'WAS',player:'Tre Johnson',        pos:'G', college:'Texas'},
    {round:1,pick:7, team:'NOP',player:'Jeremiah Fears',     pos:'G', college:'Oklahoma'},
    {round:1,pick:8, team:'BKN',player:'Egor Demin',         pos:'G', college:'BYU'},
    {round:1,pick:9, team:'TOR',player:'Collin Murray-Boyles',pos:'F',college:'South Carolina'},
    {round:1,pick:10,team:'HOU',player:'Khaman Maluach',     pos:'C', college:'Duke'},
    {round:1,pick:11,team:'POR',player:'Cedric Coward',      pos:'F', college:'Washington State'},
    {round:1,pick:12,team:'CHI',player:'Noa Essengue',       pos:'F', college:'Ratiopharm Ulm'},
    {round:1,pick:13,team:'ATL',player:'Derik Queen',        pos:'C', college:'Maryland'},
    {round:1,pick:14,team:'SAS',player:'Carter Bryant',      pos:'F', college:'Arizona'},
    {round:1,pick:15,team:'OKC',player:'Thomas Sorber',      pos:'C', college:'Georgetown'},
    {round:1,pick:16,team:'MEM',player:'Yang Hansen',        pos:'C', college:'China'},
    {round:1,pick:17,team:'MIN',player:'Joan Beringer',      pos:'C', college:'KK Cedevita'},
    {round:1,pick:18,team:'MIA',player:'Kasparas Jakucionis', pos:'G',college:'Illinois'},
    {round:1,pick:19,team:'PHX',player:'Nique Clifford',     pos:'F', college:'Colorado State'},
    {round:1,pick:20,team:'IND',player:'Liam McNeeley',      pos:'F', college:'UConn'},
    {round:1,pick:21,team:'DET',player:'Asa Newell',         pos:'F', college:'Georgia'},
    {round:1,pick:22,team:'BKN',player:'Jaleel Hoard',       pos:'F', college:'Kentucky'},
    {round:1,pick:23,team:'CLE',player:'Jarin Stevenson',    pos:'F', college:'Duke'},
    {round:1,pick:24,team:'SAC',player:'Nique Clifford',     pos:'F', college:'Colorado State'},
    {round:1,pick:25,team:'ORL',player:'Jase Richardson',    pos:'G', college:'Michigan State'},
    {round:1,pick:26,team:'BKN',player:'Ben Saraf',          pos:'G', college:'Israel'},
    {round:1,pick:27,team:'BKN',player:'Danny Wolf',         pos:'F', college:'Michigan'},
    {round:1,pick:28,team:'BOS',player:'Hugo González', pos:'F', college:'Spain'},
    {round:1,pick:29,team:'GSW',player:'Rasheer Fleming',    pos:'F', college:'Saint Joseph\'s'},
    {round:2,pick:32,team:'ORL',player:'Noah Penda',         pos:'F', college:'France'},
    {round:2,pick:38,team:'BOS',player:'Amari Williams',     pos:'C', college:'Drexel'},
  ],
  // ── 2024 NBA Draft (Round 1 + BOS picks) ────────────────────────────
  'nba-2024': [
    {round:1,pick:1, team:'ATL',player:'Zaccharie Risacher',  pos:'F', college:'France'},
    {round:1,pick:2, team:'WAS',player:'Alex Sarr',           pos:'F', college:'France'},
    {round:1,pick:3, team:'HOU',player:'Reed Sheppard',       pos:'G', college:'Kentucky'},
    {round:1,pick:4, team:'SAS',player:'Stephon Castle',      pos:'G', college:'UConn'},
    {round:1,pick:5, team:'DET',player:'Ron Holland II',       pos:'F', college:'G League Ignite'},
    {round:1,pick:6, team:'CHI',player:'Matas Buzelis',       pos:'F', college:'G League Ignite'},
    {round:1,pick:7, team:'POR',player:'Donovan Clingan',     pos:'C', college:'UConn'},
    {round:1,pick:8, team:'SAS',player:'Rob Dillingham',      pos:'G', college:'Kentucky'},
    {round:1,pick:9, team:'MEM',player:'Ja\'Kobe Walter',     pos:'G', college:'Baylor'},
    {round:1,pick:10,team:'UTA',player:'Cody Williams',       pos:'F', college:'Colorado'},
    {round:1,pick:11,team:'GSW',player:'Quinten Post',        pos:'C', college:'Brown'},
    {round:1,pick:12,team:'OKC',player:'Isaiah Hartenstein',  pos:'C', college:'Germany'},
    {round:1,pick:13,team:'SAC',player:'Devin Carter',        pos:'G', college:'Providence'},
    {round:1,pick:14,team:'NOP',player:'Yves Missi',          pos:'C', college:'Gonzaga'},
    {round:1,pick:15,team:'MIL',player:'AJ Johnson',          pos:'F', college:'Arkansas'},
    {round:1,pick:16,team:'PHX',player:'David Roddy',         pos:'F', college:'Colorado State'},
    {round:1,pick:17,team:'MIN',player:'Rob Dillingham',      pos:'G', college:'Kentucky'},
    {round:1,pick:18,team:'MIA',player:'Kel\'el Ware',        pos:'C', college:'Indiana'},
    {round:1,pick:19,team:'PHX',player:'Ryan Dunn',           pos:'G', college:'Virginia'},
    {round:1,pick:20,team:'BOS',player:'Anton Watson',        pos:'F', college:'Gonzaga'},
    {round:1,pick:21,team:'DAL',player:'Quentin Grimes',      pos:'G', college:'Houston'},
    {round:1,pick:22,team:'IND',player:'Enrique Freeman',     pos:'F', college:'Akron'},
    {round:1,pick:23,team:'BKN',player:'Jalen Wilson',        pos:'F', college:'Kansas'},
    {round:1,pick:24,team:'PHI',player:'Adem Bona',           pos:'C', college:'UCLA'},
    {round:1,pick:25,team:'OKC',player:'Nikola Topic',        pos:'G', college:'Serbia'},
    {round:1,pick:26,team:'POR',player:'Toumani Camara',      pos:'F', college:'Dayton'},
    {round:1,pick:27,team:'CHA',player:'Tidjane Salaun',      pos:'F', college:'France'},
    {round:1,pick:28,team:'CLE',player:'Jaylon Tyson',        pos:'G', college:'California'},
    {round:1,pick:29,team:'MIN',player:'Terrence Shannon Jr.',pos:'G', college:'Illinois'},
    {round:1,pick:30,team:'BOS',player:'Baylor Scheierman',   pos:'G', college:'Creighton'},
  ],
  // ── 2025 NFL Draft (Round 1 + NE picks) ─────────────────────────────
  'nfl-2025': [
    {round:1,pick:1, team:'TEN',player:'Cam Ward',          pos:'QB',college:'Miami'},
    {round:1,pick:2, team:'JAX',player:'Travis Hunter',     pos:'CB',college:'Colorado'},
    {round:1,pick:3, team:'NYG',player:'Abdul Carter',      pos:'DE',college:'Penn State'},
    {round:1,pick:4, team:'NE', player:'Will Campbell',     pos:'OT',college:'LSU'},
    {round:1,pick:5, team:'CLE',player:'Mason Graham',      pos:'DT',college:'Michigan'},
    {round:1,pick:6, team:'LV', player:'Ashton Jeanty',     pos:'RB',college:'Boise State'},
    {round:1,pick:7, team:'NYJ',player:'Armand Membou',     pos:'OT',college:'Missouri'},
    {round:1,pick:8, team:'CAR',player:'Tetairoa McMillan', pos:'WR',college:'Arizona'},
    {round:1,pick:9, team:'NO', player:'Kelvin Banks Jr.',  pos:'OT',college:'Texas'},
    {round:1,pick:10,team:'CHI',player:'Colston Loveland',  pos:'TE',college:'Michigan'},
    {round:1,pick:11,team:'SF', player:'Mykel Williams',    pos:'DE',college:'Georgia'},
    {round:1,pick:12,team:'DAL',player:'Tyler Booker',      pos:'G', college:'Alabama'},
    {round:1,pick:13,team:'MIA',player:'Walter Nolen',      pos:'DT',college:'Ole Miss'},
    {round:1,pick:14,team:'IND',player:'Tyler Warren',      pos:'TE',college:'Penn State'},
    {round:1,pick:15,team:'ATL',player:'James Pearce Jr.',  pos:'DE',college:'Tennessee'},
    {round:1,pick:16,team:'ARI',player:'Tetairoa McMillan', pos:'WR',college:'Arizona'},
    {round:1,pick:17,team:'CIN',player:'Demetrius Knight Jr.',pos:'LB',college:'South Carolina'},
    {round:1,pick:18,team:'SEA',player:'Grey Zabel',        pos:'OL',college:'North Dakota State'},
    {round:1,pick:19,team:'TB', player:'Emeka Egbuka',      pos:'WR',college:'Ohio State'},
    {round:1,pick:20,team:'DEN',player:'Jahdae Barron',     pos:'CB',college:'Texas'},
    {round:1,pick:21,team:'PIT',player:'Derrick Harmon',    pos:'DT',college:'Oregon'},
    {round:1,pick:22,team:'LAC',player:'Josh Conerly Jr.',  pos:'OT',college:'Oregon'},
    {round:1,pick:23,team:'GB', player:'Matthew Golden',    pos:'WR',college:'Texas'},
    {round:1,pick:24,team:'MIN',player:'Donovan Jackson',   pos:'G', college:'Ohio State'},
    {round:1,pick:25,team:'HOU',player:'Will Johnson',      pos:'CB',college:'Michigan'},
    {round:1,pick:26,team:'LAR',player:'Jarquez Hunter',    pos:'RB',college:'Auburn'},
    {round:1,pick:27,team:'BAL',player:'Mike Green',        pos:'DE',college:'Marshall'},
    {round:1,pick:28,team:'DET',player:'Tyleik Williams',   pos:'DT',college:'Ohio State'},
    {round:1,pick:29,team:'WAS',player:'Josh Simmons',      pos:'OT',college:'Ohio State'},
    {round:1,pick:30,team:'PHI',player:'Jihaad Campbell',   pos:'LB',college:'Alabama'},
    {round:1,pick:31,team:'KC', player:'Joshua Gray',       pos:'S', college:'LSU'},
    {round:1,pick:32,team:'PHI',player:'Kyle McCord',       pos:'QB',college:'Syracuse'},
    {round:2,pick:69,team:'NE', player:'Darien Porter',     pos:'CB',college:'Iowa State'},
    {round:3,pick:85,team:'NE', player:'Kobee Minor',       pos:'CB',college:'Memphis'},
    {round:4,pick:110,team:'NE',player:'Jalen Royals',      pos:'WR',college:'Utah State'},
    {round:5,pick:157,team:'NE',player:'Marcus Mbow',       pos:'OG',college:'Purdue'},
    {round:6,pick:202,team:'NE',player:'Elic Ayomanor',     pos:'WR',college:'Stanford'},
    {round:7,pick:257,team:'NE',player:'Kobee Minor',       pos:'CB',college:'Memphis'},
  ],
  // ── 2024 NFL Draft (Round 1 + NE picks) ─────────────────────────────
  'nfl-2024': [
    {round:1,pick:1, team:'CHI',player:'Caleb Williams',   pos:'QB',college:'USC'},
    {round:1,pick:2, team:'WAS',player:'Jayden Daniels',   pos:'QB',college:'LSU'},
    {round:1,pick:3, team:'NE', player:'Drake Maye',       pos:'QB',college:'North Carolina'},
    {round:1,pick:4, team:'ARI',player:'Marvin Harrison Jr.',pos:'WR',college:'Ohio State'},
    {round:1,pick:5, team:'LAC',player:'Joe Alt',          pos:'OT',college:'Notre Dame'},
    {round:1,pick:6, team:'NYG',player:'Malik Nabers',     pos:'WR',college:'LSU'},
    {round:1,pick:7, team:'TEN',player:'JC Latham',        pos:'OT',college:'Alabama'},
    {round:1,pick:8, team:'ATL',player:'Michael Penix Jr.',pos:'QB',college:'Washington'},
    {round:1,pick:9, team:'CHI',player:'Rome Odunze',      pos:'WR',college:'Washington'},
    {round:1,pick:10,team:'NYJ',player:'Olu Fashanu',      pos:'OT',college:'Penn State'},
    {round:1,pick:11,team:'MIN',player:'J.J. McCarthy',    pos:'QB',college:'Michigan'},
    {round:1,pick:12,team:'DEN',player:'Bo Nix',           pos:'QB',college:'Oregon'},
    {round:1,pick:13,team:'LV', player:'Brock Bowers',     pos:'TE',college:'Georgia'},
    {round:1,pick:14,team:'NO', player:'Taliese Fuaga',    pos:'OT',college:'Oregon State'},
    {round:1,pick:15,team:'IND',player:'Laiatu Latu',      pos:'DE',college:'UCLA'},
    {round:1,pick:32,team:'KC', player:'Xavier Worthy',    pos:'WR',college:'Texas'},
    {round:2,pick:37,team:'NE', player:'Ja\'Lynn Polk',    pos:'WR',college:'Washington'},
    {round:2,pick:48,team:'NE', player:'Caedan Wallace',   pos:'OT',college:'Penn State'},
    {round:3,pick:82,team:'NE', player:'Javon Baker',      pos:'WR',college:'UCF'},
    {round:4,pick:112,team:'NE',player:'Layden Robinson',  pos:'OG',college:'Texas A&M'},
    {round:5,pick:167,team:'NE',player:'Bralen Trice',     pos:'DE',college:'Washington'},
    {round:6,pick:195,team:'NE',player:'Raheim Sanders',   pos:'RB',college:'South Carolina'},
    {round:7,pick:233,team:'NE',player:'Donavon Greene',   pos:'WR',college:'Wake Forest'},
  ],
};

function setArchiveSub(sub, el) {
  archiveSub = sub;
  document.querySelectorAll('#arch-sub-seasons,#arch-sub-draft').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  document.getElementById('arch-pane-seasons').style.display = sub === 'seasons' ? 'block' : 'none';
  document.getElementById('arch-pane-draft').style.display   = sub === 'draft'   ? 'block' : 'none';
  if (sub === 'draft') {
    populateDraftYears();
    loadDraft();
  }
}

function setDraftSport(sport, el) {
  draftSport = sport;
  document.querySelectorAll('#draft-sport-nba,#draft-sport-mlb,#draft-sport-nfl').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  populateDraftYears();
  loadDraft();
}

function setDraftView(view, el) {
  draftView = view;
  document.querySelectorAll('#draft-view-all,#draft-view-team').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  loadDraft();
}

function populateDraftYears() {
  const sel = document.getElementById('draft-year-select');
  if (!sel) return;
  const now   = new Date();
  const yr    = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12

  // Draft cutoff months: NBA=June(6), NFL=April(4), MLB=July(7)
  const cutoffs = { nba: 6, nfl: 4, mlb: 7 };
  const cutoff  = cutoffs[draftSport] || 6;
  // If we haven't reached this year's draft yet, default to last year
  const latest  = month >= cutoff ? yr : yr - 1;

  sel.innerHTML = '';
  for (let y = latest; y >= 2000; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y === yr ? `${y} (upcoming)` : y;
    if (y === latest) opt.selected = true;
    sel.appendChild(opt);
  }
  draftYear = latest;
}

async function loadDraft() {
  const yr  = parseInt(document.getElementById('draft-year-select')?.value) || draftYear;
  draftYear = yr;
  const el  = document.getElementById('draft-content');
  if (el) el.innerHTML = `<div style="text-align:center;padding:40px"><div class="ld-spin" style="display:block;margin:0 auto 12px"></div><div class="ld-msg">Loading ${yr} ${draftSport.toUpperCase()} Draft…</div></div>`;

  try {
    const key   = `${draftSport}-${yr}`;
    let picks   = DRAFT_DATA[key] || null;
    if (!picks) {
      // Try live API with 8s timeout, fallback gracefully
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000));
      try {
        if (draftSport === 'nba')      picks = await Promise.race([fetchNbaDraft(yr), timeout]);
        else if (draftSport === 'mlb') picks = await Promise.race([fetchMlbDraft(yr), timeout]);
        else if (draftSport === 'nfl') picks = await Promise.race([fetchNflDraft(yr), timeout]);
      } catch(apiErr) {
        picks = null;
      }
    }
    if (!picks || !picks.length) {
      if (el) el.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);font-family:var(--display)">
        <div style="font-size:20px;margin-bottom:8px">No data available</div>
        <div style="font-size:13px">Draft results for ${yr} ${draftSport.toUpperCase()} are not yet available or haven't happened yet.</div>
        <div style="margin-top:16px;font-size:11px">Try 2025 or 2024.</div>
      </div>`;
      return;
    }
    renderDraft(picks, yr);
  } catch(e) {
    if (el) el.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);font-family:var(--display)">Error loading draft: ${e.message}</div>`;
  }
}

function renderDraft(picks, yr) {
  const el = document.getElementById('draft-content');
  if (!el) return;
  const homeAbbr = DRAFT_HOME_TEAM[draftSport];
  const homeName = DRAFT_HOME_NAME[draftSport];
  const filtered = draftView === 'team' ? picks.filter(p => p.team === homeAbbr) : picks;

  if (!filtered.length) {
    el.innerHTML = `<div style="text-align:center;padding:40px;color:var(--muted);font-family:var(--display)">No draft data found for ${yr} ${draftSport.toUpperCase()}.</div>`;
    document.getElementById('draft-src-note').textContent = '';
    return;
  }

  // Group by round
  const rounds = [...new Set(filtered.map(p => p.round))].sort((a,b) => +a - +b);

  const html = rounds.map(rnd => {
    const rdPicks = filtered.filter(p => p.round === rnd);
    const rows = rdPicks.map(p => {
      const isHome = p.team === homeAbbr;
      const teamBadge = `<span style="font-family:var(--mono);font-size:10px;font-weight:700;padding:1px 6px;border-radius:2px;background:${isHome?'rgba(12,31,63,.1)':'rgba(0,0,0,.04)'};color:${isHome?'var(--navy)':'var(--text)'}">${p.team}</span>`;
      const posBadge = p.pos !== '?'
        ? `<span style="font-family:var(--mono);font-size:9px;padding:1px 5px;border-radius:2px;background:rgba(0,0,0,.05);color:var(--muted)">${p.pos}</span>`
        : '';
      const signed = p.signed ? `<span style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-left:6px">${p.signed}</span>` : '';
      return `<tr style="${isHome?'background:rgba(12,31,63,.04);':''};border-bottom:1px solid var(--border)">
        <td style="padding:7px 10px;font-family:var(--mono);font-size:11px;font-weight:700;color:var(--muted);white-space:nowrap">#${p.pick}</td>
        <td style="padding:7px 6px">${teamBadge}</td>
        <td style="padding:7px 10px">
          <span class="pname" style="${isHome?'color:var(--navy);font-weight:700':''}">${p.player}</span>
          ${posBadge}${signed}
        </td>
        <td style="padding:7px 10px;font-family:var(--mono);font-size:10px;color:var(--muted)">${p.college}</td>
      </tr>`;
    }).join('');

    return `<div style="margin-bottom:20px">
      <div class="sec-hdr" style="margin-bottom:8px">
        <span class="sec-title">Round ${rnd}</span>
        <div class="sec-line"></div>
        <span style="font-family:var(--mono);font-size:9px;color:var(--muted);white-space:nowrap">${rdPicks.length} picks</span>
      </div>
      <div class="tbl-wrap"><table style="min-width:500px">
        <thead><tr style="background:var(--navy)">
          <th style="color:rgba(255,255,255,.7);text-align:left;padding:6px 10px;font-family:var(--mono);font-size:9px">PICK</th>
          <th style="color:rgba(255,255,255,.7);text-align:left;padding:6px 6px;font-family:var(--mono);font-size:9px">TEAM</th>
          <th style="color:rgba(255,255,255,.7);text-align:left;padding:6px 10px;font-family:var(--mono);font-size:9px">PLAYER</th>
          <th style="color:rgba(255,255,255,.7);text-align:left;padding:6px 10px;font-family:var(--mono);font-size:9px">COLLEGE / ORIGIN</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
    </div>`;
  }).join('');

  const homeCount = picks.filter(p => p.team === homeAbbr).length;
  el.innerHTML = `
    <div style="margin-bottom:12px;font-family:var(--mono);font-size:10px;color:var(--muted)">
      ${yr} ${draftSport.toUpperCase()} Draft &middot; ${picks.length} total picks
      ${homeCount ? ` &middot; <span style="color:var(--navy);font-weight:700">${homeCount} ${homeName} pick${homeCount!==1?'s':''}</span>` : ''}
      ${draftView==='team'&&homeCount?` &middot; showing ${homeName} only`:''}
    </div>
    ${html}`;

  const sources = { nba: 'stats.nba.com', mlb: 'MLB Stats API', nfl: 'ESPN' };
  const note = document.getElementById('draft-src-note');
  if (note) note.textContent = `${sources[draftSport]} · ${homeName} picks highlighted`;
}
