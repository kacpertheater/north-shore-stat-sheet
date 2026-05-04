// ════════════════════════════════════════
//  CHART HELPERS
// ════════════════════════════════════════

function buildTeamSelector(abbrs, selectedAbbr, chartType, gi) {
  const sorted = [...abbrs].sort();
  const opts = sorted.map(a =>
    `<option value="${a}"${a===selectedAbbr?' selected':''}>${a}</option>`
  ).join('');
  return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
    <label style="font-family:IBM Plex Mono,monospace;font-size:9px;letter-spacing:.07em;color:var(--muted);text-transform:uppercase">Focus team</label>
    <select id="${chartType}-team-sel-${gi}"
      onchange="onChartTeamChange('${chartType}',${gi},this.value)"
      style="font-family:IBM Plex Mono,monospace;font-size:11px;padding:3px 8px;
        border:1px solid var(--border);border-radius:var(--radius);
        background:#fff;color:var(--text);cursor:pointer;outline:none">
      ${opts}
    </select>
  </div>`;
}

function onChartTeamChange(chartType, gi, abbr) {
  const svgSel  = chartType === 'race' ? '.race-svg' : '.wins-svg';
  const lineSel = chartType === 'race' ? '.race-line' : '.wins-line';
  const ptSel   = chartType === 'race' ? '.race-pt'   : '.wins-pt';
  const lblSel  = chartType === 'race' ? '.race-label': '.wins-label';
  const ldrSel  = chartType === 'race' ? '.race-leader-line': '.wins-leader';
  const hdotSel = chartType === 'race' ? '.race-hover-dot': '.wins-hover-dot';

  const container = document.getElementById('mlb-' + (chartType==='race'?'race':'wins') + '-chart');
  if (!container) return;
  const svgs = container.querySelectorAll(svgSel);
  svgs.forEach(svg => {
    if (svg.dataset.group !== String(gi)) return;
    svg.querySelectorAll(lineSel).forEach(el => {
      const mine = el.dataset.abbr === abbr;
      el.style.opacity     = mine ? '1' : '0.15';
      el.style.strokeWidth = mine ? (parseFloat(el.getAttribute('stroke-width'))+1.5)+'' : '';
    });
    svg.querySelectorAll(ptSel).forEach(el => {
      el.style.opacity = el.dataset.abbr===abbr ? '1' : '0.15';
    });
    svg.querySelectorAll(lblSel).forEach(el => {
      el.style.opacity    = el.dataset.abbr===abbr ? '1' : '0.15';
      el.style.fontWeight = el.dataset.abbr===abbr ? '800' : '';
    });
    svg.querySelectorAll(ldrSel).forEach(el => {
      el.style.opacity = el.dataset.abbr===abbr ? '1' : '0.15';
    });
    svg.querySelectorAll(hdotSel).forEach(el => el.style.opacity='0');
  });
}

function invalidateMlbRaceChart() {
  mlbRaceLoading = false;
  mlbWinsLoading = false;
  const rc = document.getElementById('mlb-race-chart');
  const wc = document.getElementById('mlb-wins-chart');
  if (rc) rc.innerHTML = '';
  if (wc) wc.innerHTML = '';
  if (mlbView === 'graph') loadMlbRaceChart();
  if (mlbView === 'wins')  loadMlbWinsChart();
}

function renderRaceChartHTML(snapshots, league, season, wcMode) {
  const allAbbrs = new Set();
  for (const s of snapshots) Object.keys(s.teams).forEach(a => allAbbrs.add(a));
  const maxGP = Math.max(...snapshots.flatMap(s => Object.values(s.teams).map(t => t.gp)), 1);

  const groups = wcMode
    ? [{ label:`${league==='AL'?'American':'National'} League &mdash; Wild Card Race`, abbrs:[...allAbbrs], isWc:true }]
    : (league==='AL'?['AL East','AL Central','AL West']:['NL East','NL Central','NL West'])
        .map(div => ({
          label: div,
          abbrs: [...allAbbrs].filter(a => snapshots.some(s => s.teams[a]?.div===div)),
          isWc: false,
        })).filter(g => g.abbrs.length);

  // Always use full season length as X axis — so early season shows progress through full range
  const actualMaxGP = Math.max(...snapshots.flatMap(s => Object.values(s.teams).map(t => t.gp)), 1);

  const charts = groups.map((group, gi) => {
    const teamCount = group.abbrs.length;

    // Fixed viewBox width — scales to 100% of container. Full season = right edge.
    const PAD    = { top:36, right:100, bottom:36, left:48 };
    const innerH = SLOT_H * (teamCount - 1);
    const VB_W   = 1200; // viewBox units — always full width
    const innerW = VB_W - PAD.left - PAD.right;
    const H      = innerH + PAD.top + PAD.bottom;

    const yScale = rank => PAD.top + (rank-1) * SLOT_H;
    const xScale = gp   => PAD.left + (gp / SEASON_GP) * innerW; // map to full season

    const getRank = (snap, abbr) => {
      if (!group.isWc) return snap.teams[abbr]?.divRank ?? null;
      const sorted = group.abbrs.filter(a=>snap.teams[a])
        .sort((a,b)=>(snap.teams[b]?.pct||0)-(snap.teams[a]?.pct||0));
      const i = sorted.indexOf(abbr);
      return i>=0?i+1:null;
    };

    // Grid lines — one per rank, clean horizontal rules
    const gridLines = Array.from({length:teamCount},(_,i)=>i+1).map(r => {
      const y = yScale(r).toFixed(1);
      const isWcLine = group.isWc && (r===3||r===6);
      const lbl = r===1?'1st':r===teamCount?`${teamCount}th`:String(r);
      return `
        <line x1="${PAD.left-8}" y1="${y}" x2="${PAD.left+innerW}" y2="${y}"
          stroke="${isWcLine?'rgba(200,16,46,.25)':'rgba(12,31,63,0.07)'}"
          stroke-width="${isWcLine?1.5:1}" stroke-dasharray="${isWcLine?'6,4':''}"/>
        <text x="${PAD.left-10}" y="${(+y+4).toFixed(1)}"
          font-family="IBM Plex Mono,monospace" font-size="10"
          fill="${isWcLine?'rgba(200,16,46,.6)':'#9aabcc'}" text-anchor="end"
          font-weight="${r===1?'700':'400'}">${lbl}</text>`;
    }).join('');

    // X axis — full season (162 games) ticks every 20
    const xLabels = [];
    for (let g=0; g<=SEASON_GP; g+=20) {
      const x = xScale(g).toFixed(1);
      xLabels.push(`
        <line x1="${x}" y1="${PAD.top-4}" x2="${x}" y2="${(PAD.top+innerH+6).toFixed(1)}"
          stroke="rgba(12,31,63,0.05)" stroke-width="1"/>
        <text x="${x}" y="${(PAD.top+innerH+20).toFixed(1)}"
          font-family="IBM Plex Mono,monospace" font-size="9" fill="#b0bdd0" text-anchor="middle">G${g}</text>`);
    }
    // "Now" marker — dashed line at current progress
    if (actualMaxGP > 0 && actualMaxGP < SEASON_GP) {
      const nx = xScale(actualMaxGP).toFixed(1);
      xLabels.push(`
        <line x1="${nx}" y1="${PAD.top}" x2="${nx}" y2="${(PAD.top+innerH).toFixed(1)}"
          stroke="rgba(12,31,63,0.22)" stroke-width="1.5" stroke-dasharray="4,3"/>
        <text x="${nx}" y="${(PAD.top-8).toFixed(1)}"
          font-family="IBM Plex Mono,monospace" font-size="8"
          fill="rgba(12,31,63,0.4)" text-anchor="middle">now</text>`);
    }

    // Per-team paths, dots, labels
    const pathDefs = group.abbrs.map(abbr => {
      const color = MLB_TEAM_COLORS[abbr] || '#888';
      const isBos = abbr === 'BOS';

      const pts = snapshots.map(s => {
        const t = s.teams[abbr]; if (!t) return null;
        const rank = getRank(s,abbr);
        return rank ? {gp:t.gp, rank, w:t.w, l:t.l, pct:t.pct, date:s.date, gb:t.gb} : null;
      }).filter(Boolean).sort((a,b)=>a.gp-b.gp);

      const seen = new Map();
      for (const p of pts) seen.set(p.gp, p);
      const deduped = [...seen.values()].sort((a,b)=>a.gp-b.gp);
      if (!deduped.length) return null;

      const linePath = deduped.map((p,i)=>`${i===0?'M':'L'}${xScale(p.gp).toFixed(1)},${yScale(p.rank).toFixed(1)}`).join(' ');

      // Dots — only draw every Nth to avoid over-crowding when dense
      const dotEvery = maxGP > 100 ? 3 : 1;
      const dotCircles = deduped.filter((_,i)=>i%dotEvery===0||i===deduped.length-1).map(p => {
        const cx = xScale(p.gp).toFixed(1);
        const cy = yScale(p.rank).toFixed(1);
        return `<circle class="race-pt" data-abbr="${abbr}"
          data-gp="${p.gp}" data-rank="${p.rank}" data-w="${p.w}" data-l="${p.l}"
          data-pct="${p.pct.toFixed(3)}" data-date="${p.date}" data-gb="${p.gb||0}"
          cx="${cx}" cy="${cy}" r="${isBos?BOS_DOT_R:DOT_R}"
          fill="${color}" fill-opacity="${isBos?0.95:0.8}" style="cursor:pointer"/>`;
      }).join('');

      const last = deduped[deduped.length-1];

      // Stagger label y position slightly to avoid collisions at the right edge
      const ptsEncoded = encodeURIComponent(JSON.stringify(deduped));

      return { abbr, color, isBos, linePath, dotCircles, last, ptsEncoded };
    }).filter(Boolean);

    // BOS renders last (on top)
    pathDefs.sort((a,b)=>(a.isBos?1:0)-(b.isBos?1:0));

    // Smart label placement — sort by final rank, stagger overlapping labels
    const labelsSorted = [...pathDefs].sort((a,b)=>a.last.rank-b.last.rank);
    const labelY = {};
    const MIN_LABEL_GAP = 14;
    let lastLY = -99;
    for (const p of labelsSorted) {
      const natural = yScale(p.last.rank);
      const y = Math.max(natural, lastLY + MIN_LABEL_GAP);
      labelY[p.abbr] = y;
      lastLY = y;
    }

    const svgContent = pathDefs.map(({ abbr, color, isBos, linePath, dotCircles, last, ptsEncoded }) => {
      const cx = xScale(last.gp).toFixed(1);
      const cy = yScale(last.rank).toFixed(1);
      const ly = (labelY[abbr] + 4).toFixed(1);
      return `
        <path class="race-line" data-abbr="${abbr}" data-pts="${ptsEncoded}"
          d="${linePath}" fill="none" stroke="${color}"
          stroke-width="${isBos?2.5:1.2}" stroke-linejoin="round" stroke-linecap="round"
          opacity="${isBos?1:0.7}" style="cursor:pointer;transition:opacity .12s,stroke-width .12s"/>
        <path class="race-hit" data-abbr="${abbr}"
          d="${linePath}" fill="none" stroke="transparent" stroke-width="16" style="cursor:pointer"/>
        ${dotCircles}
        <circle class="race-hover-dot" data-abbr="${abbr}" cx="-999" cy="-999" r="7"
          fill="${color}" stroke="#fff" stroke-width="2"
          style="pointer-events:none;opacity:0;transition:opacity .08s"/>
        <line class="race-leader-line" data-abbr="${abbr}"
          x1="${(+cx+2).toFixed(1)}" y1="${cy}" x2="${(+cx+8).toFixed(1)}" y2="${ly}"
          stroke="${color}" stroke-width="1" opacity="${isBos?1:0.65}" stroke-dasharray="2,2"/>
        <text class="race-label" data-abbr="${abbr}"
          x="${(+cx+11).toFixed(1)}" y="${ly}"
          font-family="IBM Plex Mono,monospace" font-size="${isBos?11:10}"
          font-weight="${isBos?700:500}" fill="${color}"
          opacity="${isBos?1:0.9}" style="cursor:pointer">${abbr}</text>`;
    }).join('');

    const wcNote = group.isWc ? `<div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-bottom:6px">Ranked by win% within league &middot; dashed red lines = WC boundaries (3rd &amp; 6th)</div>` : '';

    const defaultTeam = group.abbrs.includes('BOS') ? 'BOS' : group.abbrs[0];
    return `<div class="race-chart-group" style="margin-bottom:28px">
      <div class="sec-hdr" style="margin-bottom:6px">
        <span class="sec-title">${group.label}</span><div class="sec-line"></div>
      </div>
      ${buildTeamSelector(group.abbrs, defaultTeam, 'race', gi)}
      ${wcNote}
      <div id="race-tooltip-${gi}" style="display:none;position:fixed;
        background:rgba(12,31,63,.96);color:#fff;font-family:IBM Plex Mono,monospace;
        font-size:11px;padding:9px 14px;border-radius:4px;pointer-events:none;
        white-space:nowrap;z-index:9999;border-left:3px solid #fff;
        box-shadow:0 3px 16px rgba(0,0,0,.4);line-height:1.7"></div>
      <div style="background:#fff;border:1px solid var(--border);border-radius:var(--radius);padding:8px 0 8px 0">
        <div id="race-tooltip-${gi}" style="display:none;position:fixed;
          background:rgba(12,31,63,.96);color:#fff;font-family:IBM Plex Mono,monospace;
          font-size:11px;padding:9px 14px;border-radius:4px;pointer-events:none;
          white-space:nowrap;z-index:9999;border-left:3px solid #fff;
          box-shadow:0 3px 16px rgba(0,0,0,.4);line-height:1.7"></div>
        <svg class="race-svg" data-group="${gi}"
          data-pad-left="${PAD.left}" data-inner-w="${innerW}" data-maxgp="${SEASON_GP}"
          viewBox="0 0 ${VB_W} ${H}"
          style="width:100%;display:block;cursor:default">
          <rect x="0" y="0" width="${VB_W}" height="${H}" fill="transparent"/>
          ${gridLines}
          ${xLabels.join('')}
          ${svgContent}
          <text x="${PAD.left}" y="20" font-family="Libre Franklin,sans-serif" font-size="9"
            font-weight="700" fill="rgba(12,31,63,0.25)" letter-spacing="0.06em">
            ${group.isWc?'LEAGUE RANK':'DIVISION RANK'} &mdash; ${season} &middot; 1 dot per game &middot; 1st = top &middot; hover for detail
          </text>
        </svg>
      </div>
    </div>`;
  }).join('');

  const nSnaps = snapshots.filter(s=>Object.values(s.teams).some(t=>t.gp>0)).length;
  return `<div style="margin-bottom:12px;font-family:var(--mono);font-size:10px;color:var(--muted)">
    ${nSnaps} game dates &middot; ${season} ${league} &middot; X axis = full 162-game season &middot; dashed line = today
  </div>${charts}`;
}

function renderWinsChartHTML(snapshots, league, season, wcMode) {
  const allAbbrs = new Set();
  for (const s of snapshots) Object.keys(s.teams).forEach(a => allAbbrs.add(a));
  const actualMaxGP = Math.max(...snapshots.flatMap(s => Object.values(s.teams).map(t => t.gp)), 1);

  const groups = wcMode
    ? [{ label: `${league==='AL'?'American':'National'} League &mdash; Wins Race`, abbrs: [...allAbbrs] }]
    : (league==='AL'?['AL East','AL Central','AL West']:['NL East','NL Central','NL West'])
        .map(div => ({
          label: div,
          abbrs: [...allAbbrs].filter(a => snapshots.some(s => s.teams[a]?.div === div)),
        })).filter(g => g.abbrs.length);

  const VB_W   = 1200;
  const PAD    = { top:36, right:100, bottom:40, left:56 };
  const innerW = VB_W - PAD.left - PAD.right;
  const CHART_H = 280;
  const H      = CHART_H + PAD.top + PAD.bottom;

  const xScale = gp   => PAD.left + (gp / SEASON_GP) * innerW;
  const yScale = wins => PAD.top + CHART_H - (wins / MAX_WINS) * CHART_H;

  // Y grid every 20 wins
  const yGrid = [];
  for (let w = 0; w <= MAX_WINS; w += 20) {
    const y = yScale(w).toFixed(1);
    yGrid.push(`
      <line x1="${PAD.left}" y1="${y}" x2="${PAD.left+innerW}" y2="${y}"
        stroke="${w===100?'rgba(184,136,40,.25)':'rgba(12,31,63,0.07)'}"
        stroke-width="${w===100?1.5:1}" stroke-dasharray="${w===100?'6,4':''}"/>
      <text x="${PAD.left-8}" y="${(+y+4).toFixed(1)}"
        font-family="IBM Plex Mono,monospace" font-size="9"
        fill="${w>=100?'#b08828':'#9aabcc'}" text-anchor="end"
        font-weight="${w>=100?'600':'400'}">${w}W</text>`);
  }

  // X axis every 20 games + "now" marker
  const xLabels = [];
  for (let g = 0; g <= SEASON_GP; g += 20) {
    const x = xScale(g).toFixed(1);
    xLabels.push(`
      <line x1="${x}" y1="${PAD.top-4}" x2="${x}" y2="${(PAD.top+CHART_H+6).toFixed(1)}"
        stroke="rgba(12,31,63,0.04)" stroke-width="1"/>
      <text x="${x}" y="${(PAD.top+CHART_H+20).toFixed(1)}"
        font-family="IBM Plex Mono,monospace" font-size="9" fill="#b0bdd0" text-anchor="middle">G${g}</text>`);
  }
  if (actualMaxGP > 0 && actualMaxGP < SEASON_GP) {
    const nx = xScale(actualMaxGP).toFixed(1);
    xLabels.push(`
      <line x1="${nx}" y1="${PAD.top}" x2="${nx}" y2="${(PAD.top+CHART_H).toFixed(1)}"
        stroke="rgba(12,31,63,0.22)" stroke-width="1.5" stroke-dasharray="4,3"/>
      <text x="${nx}" y="${(PAD.top-8).toFixed(1)}"
        font-family="IBM Plex Mono,monospace" font-size="8"
        fill="rgba(12,31,63,0.4)" text-anchor="middle">now</text>`);
  }

  const charts = groups.map((group, gi) => {
    const pathDefs = group.abbrs.map(abbr => {
      const color = MLB_TEAM_COLORS[abbr] || '#888';
      const isBos = abbr === 'BOS';

      const pts = snapshots.map(s => {
        const t = s.teams[abbr]; if (!t) return null;
        return { gp:t.gp, w:t.w, l:t.l, pct:t.pct.toFixed(3), date:s.date };
      }).filter(Boolean).sort((a,b)=>a.gp-b.gp);

      const seen = new Map();
      for (const p of pts) seen.set(p.gp, p);
      const deduped = [...seen.values()].sort((a,b)=>a.gp-b.gp);
      if (!deduped.length) return null;

      const linePath = deduped.map((p,i) =>
        `${i===0?'M':'L'}${xScale(p.gp).toFixed(1)},${yScale(p.w).toFixed(1)}`
      ).join(' ');

      const dotEvery = actualMaxGP > 100 ? 3 : 1;
      const dotCircles = deduped.filter((_,i)=>i%dotEvery===0||i===deduped.length-1).map(p =>
        `<circle class="wins-pt" data-abbr="${abbr}"
          data-gp="${p.gp}" data-w="${p.w}" data-l="${p.l}" data-pct="${p.pct}" data-date="${p.date}"
          cx="${xScale(p.gp).toFixed(1)}" cy="${yScale(p.w).toFixed(1)}"
          r="${isBos?2.8:2}" fill="${color}" fill-opacity="${isBos?0.95:0.8}" style="cursor:pointer"/>`
      ).join('');

      const last = deduped[deduped.length-1];
      const ptsEncoded = encodeURIComponent(JSON.stringify(deduped));
      return { abbr, color, isBos, linePath, dotCircles, last, ptsEncoded };
    }).filter(Boolean);

    pathDefs.sort((a,b)=>(a.isBos?1:0)-(b.isBos?1:0));

    // Label stagger — sort by most wins (descending = top)
    const byWins = [...pathDefs].sort((a,b)=>b.last.w-a.last.w);
    const labelY = {}; let lastLY = -99;
    for (const p of byWins) {
      const nat = yScale(p.last.w);
      const y   = Math.max(nat, lastLY + 13);
      labelY[p.abbr] = y; lastLY = y;
    }

    const svgContent = pathDefs.map(({ abbr, color, isBos, linePath, dotCircles, last, ptsEncoded }) => {
      const cx = xScale(last.gp).toFixed(1);
      const cy = yScale(last.w).toFixed(1);
      const ly = (labelY[abbr]+4).toFixed(1);
      return `
        <path class="wins-line" data-abbr="${abbr}" data-pts="${ptsEncoded}"
          d="${linePath}" fill="none" stroke="${color}"
          stroke-width="${isBos?2.5:1.2}" stroke-linejoin="round" stroke-linecap="round"
          opacity="${isBos?1:0.7}" style="cursor:pointer;transition:opacity .12s,stroke-width .12s"/>
        <path class="wins-hit" data-abbr="${abbr}" d="${linePath}"
          fill="none" stroke="transparent" stroke-width="14" style="cursor:pointer"/>
        ${dotCircles}
        <circle class="wins-hover-dot" data-abbr="${abbr}" cx="-999" cy="-999" r="7"
          fill="${color}" stroke="#fff" stroke-width="2" style="pointer-events:none;opacity:0"/>
        <line class="wins-leader" data-abbr="${abbr}"
          x1="${(+cx+2).toFixed(1)}" y1="${cy}" x2="${(+cx+8).toFixed(1)}" y2="${ly}"
          stroke="${color}" stroke-width="1" opacity="0.6" stroke-dasharray="2,2"/>
        <text class="wins-label" data-abbr="${abbr}"
          x="${(+cx+11).toFixed(1)}" y="${ly}"
          font-family="IBM Plex Mono,monospace" font-size="${isBos?11:10}"
          font-weight="${isBos?700:500}" fill="${color}" style="cursor:pointer">${abbr}</text>`;
    }).join('');

    const defaultTeamW = group.abbrs.includes('BOS') ? 'BOS' : group.abbrs[0];
    return `<div style="margin-bottom:24px">
      <div class="sec-hdr" style="margin-bottom:6px">
        <span class="sec-title">${group.label}</span><div class="sec-line"></div>
      </div>
      ${buildTeamSelector(group.abbrs, defaultTeamW, 'wins', gi)}
      <div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-bottom:6px">
        Wins accumulated over season &middot; dashed gold = 100-win pace &middot; hover for detail &middot; click to lock
      </div>
      <div id="wins-tooltip-${gi}" style="display:none;position:fixed;
        background:rgba(12,31,63,.96);color:#fff;font-family:IBM Plex Mono,monospace;
        font-size:11px;padding:9px 14px;border-radius:4px;pointer-events:none;
        white-space:nowrap;z-index:9999;border-left:3px solid #fff;
        box-shadow:0 3px 16px rgba(0,0,0,.4);line-height:1.7"></div>
      <div style="background:#fff;border:1px solid var(--border);border-radius:var(--radius);padding:8px 0">
        <svg class="wins-svg" data-group="${gi}"
          data-pad-left="${PAD.left}" data-inner-w="${innerW}"
          data-maxgp="${SEASON_GP}" data-chart-h="${CHART_H}" data-pad-top="${PAD.top}"
          viewBox="0 0 ${VB_W} ${H}" style="width:100%;display:block;cursor:default">
          <rect x="0" y="0" width="${VB_W}" height="${H}" fill="transparent"/>
          ${yGrid.join('')}${xLabels.join('')}${svgContent}
          <text x="${PAD.left}" y="22" font-family="Libre Franklin,sans-serif" font-size="9"
            font-weight="700" fill="rgba(12,31,63,0.28)" letter-spacing="0.06em">
            WINS OVER SEASON &mdash; ${season} &middot; 0–${MAX_WINS} wins &middot; 1 dot per game
          </text>
        </svg>
      </div>
    </div>`;
  }).join('');

  return `<div style="margin-bottom:12px;font-family:var(--mono);font-size:10px;color:var(--muted)">
    ${snapshots.filter(s=>Object.values(s.teams).some(t=>t.gp>0)).length} game dates &middot;
    ${season} ${league} &middot; Y axis = cumulative wins (0–120)
  </div>${charts}`;
}
