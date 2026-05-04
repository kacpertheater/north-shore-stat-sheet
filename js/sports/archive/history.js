// ════════════════════════════════════════
//  THE VAULT — Historical Season Results
// ════════════════════════════════════════

// ── Static curated data for NBA/NFL (accurate through 2024-25) ────────────
// Format: year → { w, l, t(ties/OT losses), pf, pa, playoff }
// playoff: null = missed, or { result:'champ'|'conf'|'semi'|'round1'|'miss', round, opp }
const STATIC_DATA = {
  'nba|bos': {
    2025: { w:61, l:21, pf:119.8, pa:110.4, playoff:{ result:'out', round:'Eastern Conference Semifinals', opp:'Cleveland Cavaliers', detail:'1–4' } },
    2024: { w:64, l:18, pf:120.6, pa:109.5, playoff:{ result:'champ', round:'NBA Finals', opp:'Dallas Mavericks', detail:'Won 4–1' } },
    2023: { w:57, l:25, pf:117.0, pa:111.5, playoff:{ result:'conf', round:'Eastern Conference Finals', opp:'Miami Heat', detail:'Lost 3–4' } },
    2022: { w:51, l:31, pf:115.6, pa:111.3, playoff:{ result:'conf', round:'NBA Finals', opp:'Golden State Warriors', detail:'Lost 2–4' } },
    2021: { w:36, l:36, pf:112.6, pa:113.1, playoff:{ result:'round1', round:'First Round', opp:'Brooklyn Nets', detail:'Lost 1–4' } },
    2020: { w:48, l:24, pf:112.9, pa:111.6, playoff:{ result:'round1', round:'First Round', opp:'Miami Heat', detail:'Lost 0–4' } },
    2019: { w:49, l:33, pf:112.4, pa:110.9, playoff:{ result:'semi', round:'Second Round', opp:'Milwaukee Bucks', detail:'Lost 1–4' } },
    2018: { w:55, l:27, pf:109.4, pa:103.4, playoff:{ result:'conf', round:'Eastern Conference Finals', opp:'Cleveland Cavaliers', detail:'Lost 3–4' } },
    2017: { w:53, l:29, pf:108.0, pa:103.5, playoff:{ result:'semi', round:'Second Round', opp:'Cleveland Cavaliers', detail:'Lost 1–4' } },
    2016: { w:48, l:34, pf:107.0, pa:106.0, playoff:{ result:'round1', round:'First Round', opp:'Atlanta Hawks', detail:'Won 4–2 — Lost R2 to Chicago' } },
    2015: { w:40, l:42, pf:101.4, pa:102.8, playoff:null },
    2014: { w:25, l:57, pf:97.3, pa:103.5, playoff:null },
    2013: { w:41, l:40, pf:100.1, pa:99.9, playoff:{ result:'round1', round:'First Round', opp:'Indiana Pacers', detail:'Lost 3–4' } },
    2012: { w:39, l:27, pf:95.5, pa:93.8, playoff:{ result:'semi', round:'Eastern Conference Semifinals', opp:'Philadelphia 76ers', detail:'Lost 3–4' } },
    2011: { w:56, l:26, pf:99.5, pa:95.2, playoff:{ result:'semi', round:'Eastern Conference Semifinals', opp:'Miami Heat', detail:'Lost 1–4' } },
    2010: { w:50, l:32, pf:98.5, pa:96.9, playoff:{ result:'conf', round:'Eastern Conference Finals', opp:'Miami Heat', detail:'Lost 3–4' } },
    2009: { w:44, l:38, pf:100.0, pa:98.8, playoff:{ result:'semi', round:'Eastern Conference Semifinals', opp:'Orlando Magic', detail:'Lost 3–4' } },
    2008: { w:62, l:20, pf:105.2, pa:98.0, playoff:{ result:'champ', round:'NBA Finals', opp:'Los Angeles Lakers', detail:'Won 4–2' } },
    2007: { w:24, l:58, pf:96.4, pa:100.4, playoff:null },
    2006: { w:33, l:49, pf:97.0, pa:100.0, playoff:null },
    2005: { w:45, l:37, pf:96.5, pa:96.0, playoff:{ result:'round1', round:'First Round', opp:'Indiana Pacers', detail:'Lost 0–4' } },
    2004: { w:36, l:46, pf:88.8, pa:90.7, playoff:null },
    2003: { w:44, l:38, pf:95.0, pa:95.0, playoff:{ result:'semi', round:'Eastern Conference Semifinals', opp:'New Jersey Nets', detail:'Lost 2–4' } },
    2002: { w:49, l:33, pf:92.1, pa:90.1, playoff:{ result:'conf', round:'Eastern Conference Finals', opp:'New Jersey Nets', detail:'Lost 2–4' } },
    2001: { w:36, l:46, pf:93.5, pa:95.4, playoff:null },
    2000: { w:35, l:47, pf:98.0, pa:100.0, playoff:null },
    1999: { w:19, l:31, pf:91.0, pa:94.0, playoff:null },
    1998: { w:36, l:46, pf:96.0, pa:98.0, playoff:null },
    1997: { w:15, l:67, pf:98.0, pa:107.0, playoff:null },
    1996: { w:33, l:49, pf:98.7, pa:101.3, playoff:null },
    1995: { w:35, l:47, pf:98.5, pa:100.5, playoff:null },
    1994: { w:32, l:50, pf:99.0, pa:102.0, playoff:null },
    1993: { w:48, l:34, pf:104.0, pa:103.0, playoff:{ result:'round1', round:'First Round', opp:'Indiana Pacers', detail:'Lost 0–3' } },
    1992: { w:51, l:31, pf:105.0, pa:101.0, playoff:{ result:'semi', round:'Conference Semifinals', opp:'Cleveland Cavaliers', detail:'Lost 2–3' } },
    1991: { w:56, l:26, pf:108.0, pa:103.0, playoff:{ result:'round1', round:'First Round', opp:'Indiana Pacers', detail:'Lost 2–3' } },
    1990: { w:52, l:30, pf:107.0, pa:104.0, playoff:{ result:'round1', round:'First Round', opp:'New York Knicks', detail:'Lost 1–3' } },
    1989: { w:42, l:40, pf:108.0, pa:107.0, playoff:{ result:'round1', round:'First Round', opp:'Detroit Pistons', detail:'Lost 0–3' } },
    1988: { w:57, l:25, pf:110.6, pa:104.5, playoff:{ result:'conf', round:'Eastern Conference Finals', opp:'Detroit Pistons', detail:'Lost 2–4' } },
    1987: { w:59, l:23, pf:113.8, pa:107.3, playoff:{ result:'conf', round:'NBA Finals', opp:'Los Angeles Lakers', detail:'Lost 2–4' } },
    1986: { w:67, l:15, pf:114.1, pa:104.7, playoff:{ result:'champ', round:'NBA Finals', opp:'Houston Rockets', detail:'Won 4–2' } },
    1985: { w:63, l:19, pf:114.8, pa:107.5, playoff:{ result:'conf', round:'NBA Finals', opp:'Los Angeles Lakers', detail:'Lost 2–4' } },
    1984: { w:62, l:20, pf:113.1, pa:105.6, playoff:{ result:'champ', round:'NBA Finals', opp:'Los Angeles Lakers', detail:'Won 4–3' } },
    1983: { w:56, l:26, pf:112.0, pa:107.0, playoff:{ result:'semi', round:'Conference Semifinals', opp:'Milwaukee Bucks', detail:'Lost 1–4' } },
    1982: { w:63, l:19, pf:111.0, pa:104.0, playoff:{ result:'conf', round:'Eastern Conference Finals', opp:'Philadelphia 76ers', detail:'Lost 3–4' } },
    1981: { w:62, l:20, pf:108.0, pa:101.0, playoff:{ result:'champ', round:'NBA Finals', opp:'Houston Rockets', detail:'Won 4–2' } },
    1980: { w:61, l:21, pf:107.0, pa:101.0, playoff:{ result:'conf', round:'Eastern Conference Finals', opp:'Philadelphia 76ers', detail:'Lost 1–4' } },
    1979: { w:29, l:53, pf:102.0, pa:106.0, playoff:null },
    1978: { w:32, l:50, pf:102.0, pa:105.0, playoff:null },
    1977: { w:44, l:38, pf:104.0, pa:103.0, playoff:{ result:'round1', round:'Playoffs', opp:'San Antonio Spurs', detail:'Lost' } },
    1976: { w:54, l:28, pf:104.0, pa:100.0, playoff:{ result:'champ', round:'NBA Finals', opp:'Phoenix Suns', detail:'Won 4–2' } },
    1975: { w:60, l:22, pf:103.0, pa:99.0, playoff:{ result:'conf', round:'Conference Finals', opp:'Washington Bullets', detail:'Lost 2–4' } },
    1974: { w:56, l:26, pf:104.0, pa:99.0, playoff:{ result:'champ', round:'NBA Finals', opp:'Milwaukee Bucks', detail:'Won 4–3' } },
    1973: { w:68, l:14, pf:108.0, pa:102.0, playoff:{ result:'conf', round:'Eastern Conference Finals', opp:'New York Knicks', detail:'Lost 3–4' } },
    1972: { w:56, l:26, pf:111.0, pa:107.0, playoff:{ result:'conf', round:'Eastern Conference Finals', opp:'New York Knicks', detail:'Lost 1–4' } },
    1971: { w:44, l:38, pf:112.0, pa:111.0, playoff:{ result:'round1', round:'Playoffs', opp:'New York Knicks', detail:'Lost 3–4' } },
    1970: { w:34, l:48, pf:112.0, pa:115.0, playoff:null },
    1969: { w:48, l:34, pf:113.0, pa:112.0, playoff:{ result:'champ', round:'NBA Finals', opp:'Los Angeles Lakers', detail:'Won 4–3' } },
    1968: { w:54, l:28, pf:115.0, pa:113.0, playoff:{ result:'champ', round:'NBA Finals', opp:'Los Angeles Lakers', detail:'Won 4–2' } },
    1967: { w:60, l:21, pf:117.0, pa:113.0, playoff:{ result:'conf', round:'Eastern Division Finals', opp:'Philadelphia 76ers', detail:'Lost 1–4' } },
    1966: { w:54, l:26, pf:114.0, pa:112.0, playoff:{ result:'champ', round:'NBA Finals', opp:'Los Angeles Lakers', detail:'Won 4–3' } },
    1965: { w:62, l:18, pf:114.0, pa:109.0, playoff:{ result:'champ', round:'NBA Finals', opp:'Los Angeles Lakers', detail:'Won 4–1' } },
    1964: { w:59, l:21, pf:110.0, pa:107.0, playoff:{ result:'champ', round:'NBA Finals', opp:'San Francisco Warriors', detail:'Won 4–1' } },
    1963: { w:58, l:22, pf:115.0, pa:111.0, playoff:{ result:'champ', round:'NBA Finals', opp:'Los Angeles Lakers', detail:'Won 4–2' } },
    1962: { w:60, l:20, pf:118.0, pa:115.0, playoff:{ result:'champ', round:'NBA Finals', opp:'Los Angeles Lakers', detail:'Won 4–3' } },
    1961: { w:57, l:22, pf:119.0, pa:117.0, playoff:{ result:'champ', round:'NBA Finals', opp:'St. Louis Hawks', detail:'Won 4–1' } },
    1960: { w:59, l:16, pf:120.0, pa:118.0, playoff:{ result:'champ', round:'NBA Finals', opp:'St. Louis Hawks', detail:'Won 4–3' } },
    1959: { w:52, l:20, pf:116.0, pa:114.0, playoff:{ result:'champ', round:'NBA Finals', opp:'Minneapolis Lakers', detail:'Won 4–0' } },
    1958: { w:49, l:23, pf:110.0, pa:109.0, playoff:{ result:'conf', round:'NBA Finals', opp:'St. Louis Hawks', detail:'Lost 2–4' } },
    1957: { w:44, l:28, pf:107.0, pa:105.0, playoff:{ result:'champ', round:'NBA Finals', opp:'St. Louis Hawks', detail:'Won 4–3' } },
  },
  'nfl|ne': {
    2025: { w:14, l:3, pf:407, pa:249, playoff:{ result:'conf', round:'Super Bowl LX', opp:'Seattle Seahawks', detail:'13–29' } },
    2024: { w:4, l:13, pf:215, pa:366, playoff:null },
    2023: { w:4, l:13, pf:236, pa:366, playoff:null },
    2022: { w:8, l:9, pf:364, pa:374, playoff:null },
    2021: { w:10, l:7, pf:462, pa:303, playoff:{ result:'round1', round:'Wild Card', opp:'Buffalo Bills', detail:'Lost 17–47' } },
    2020: { w:7, l:9, pf:326, pa:353, playoff:null },
    2019: { w:12, l:4, pf:420, pa:225, playoff:{ result:'round1', round:'Wild Card', opp:'Tennessee Titans', detail:'Lost 13–20' } },
    2018: { w:11, l:5, pf:436, pa:325, playoff:{ result:'champ', round:'Super Bowl LIII', opp:'Los Angeles Rams', detail:'Won 13–3' } },
    2017: { w:13, l:3, pf:458, pa:296, playoff:{ result:'conf', round:'AFC Championship', opp:'Jacksonville Jaguars', detail:'Won — Lost Super Bowl to PHI' } },
    2016: { w:14, l:2, pf:441, pa:250, playoff:{ result:'champ', round:'Super Bowl LI', opp:'Atlanta Falcons', detail:'Won 34–28 OT' } },
    2015: { w:12, l:4, pf:465, pa:315, playoff:{ result:'conf', round:'AFC Championship', opp:'Denver Broncos', detail:'Lost 18–20' } },
    2014: { w:12, l:4, pf:468, pa:313, playoff:{ result:'champ', round:'Super Bowl XLIX', opp:'Seattle Seahawks', detail:'Won 28–24' } },
    2013: { w:12, l:4, pf:444, pa:338, playoff:{ result:'conf', round:'AFC Championship', opp:'Denver Broncos', detail:'Lost 16–26' } },
    2012: { w:12, l:4, pf:557, pa:331, playoff:{ result:'conf', round:'AFC Championship', opp:'Baltimore Ravens', detail:'Lost 13–28' } },
    2011: { w:13, l:3, pf:513, pa:342, playoff:{ result:'conf', round:'Super Bowl XLVI', opp:'New York Giants', detail:'Lost 17–21' } },
    2010: { w:14, l:2, pf:518, pa:313, playoff:{ result:'semi', round:'Divisional Round', opp:'New York Jets', detail:'Lost 21–28' } },
    2009: { w:10, l:6, pf:427, pa:285, playoff:{ result:'round1', round:'Wild Card', opp:'Baltimore Ravens', detail:'Lost 14–33' } },
    2008: { w:11, l:5, pf:410, pa:309, playoff:null },
    2007: { w:16, l:0, pf:589, pa:274, playoff:{ result:'conf', round:'Super Bowl XLII', opp:'New York Giants', detail:'Lost 14–17' } },
    2006: { w:12, l:4, pf:385, pa:237, playoff:{ result:'conf', round:'AFC Championship', opp:'Indianapolis Colts', detail:'Lost 34–38' } },
    2005: { w:10, l:6, pf:379, pa:338, playoff:{ result:'semi', round:'Divisional Round', opp:'Denver Broncos', detail:'Lost 13–27' } },
    2004: { w:14, l:2, pf:437, pa:260, playoff:{ result:'champ', round:'Super Bowl XXXIX', opp:'Philadelphia Eagles', detail:'Won 24–21' } },
    2003: { w:14, l:2, pf:348, pa:238, playoff:{ result:'champ', round:'Super Bowl XXXVIII', opp:'Carolina Panthers', detail:'Won 32–29' } },
    2002: { w:9, l:7, pf:381, pa:346, playoff:null },
    2001: { w:11, l:5, pf:371, pa:272, playoff:{ result:'champ', round:'Super Bowl XXXVI', opp:'St. Louis Rams', detail:'Won 20–17' } },
    2000: { w:5, l:11, pf:276, pa:338, playoff:null },
    1999: { w:8, l:8, pf:299, pa:284, playoff:null },
    1998: { w:9, l:7, pf:337, pa:329, playoff:null },
    1997: { w:10, l:6, pf:369, pa:289, playoff:{ result:'round1', round:'Divisional Round', opp:'Pittsburgh Steelers', detail:'Lost 6–7' } },
    1996: { w:11, l:5, pf:418, pa:313, playoff:{ result:'conf', round:'Super Bowl XXXI', opp:'Green Bay Packers', detail:'Lost 21–35' } },
    1995: { w:6, l:10, pf:294, pa:377, playoff:null },
    1994: { w:10, l:6, pf:351, pa:312, playoff:{ result:'semi', round:'Divisional Round', opp:'Cleveland Browns', detail:'Lost 13–20' } },
    1993: { w:5, l:11, pf:238, pa:286, playoff:null },
    1992: { w:2, l:14, pf:205, pa:363, playoff:null },
    1991: { w:6, l:10, pf:211, pa:305, playoff:null },
    1990: { w:1, l:15, pf:181, pa:446, playoff:null },
    1989: { w:5, l:11, pf:297, pa:391, playoff:null },
    1988: { w:9, l:7, pf:250, pa:284, playoff:null },
    1987: { w:8, l:7, pf:320, pa:293, playoff:null },
    1986: { w:11, l:5, pf:412, pa:307, playoff:{ result:'conf', round:'Super Bowl XX', opp:'Chicago Bears', detail:'Lost 10–46' } },
    1985: { w:11, l:5, pf:362, pa:290, playoff:{ result:'round1', round:'Divisional Round', opp:'Los Angeles Raiders', detail:'Lost 20–27' } },
    1984: { w:9, l:7, pf:362, pa:352, playoff:null },
    1983: { w:8, l:8, pf:453, pa:411, playoff:null },
    1982: { w:5, l:4, pf:143, pa:157, playoff:{ result:'semi', round:'Second Round', opp:'Miami Dolphins', detail:'Lost 0–28' } },
    1981: { w:2, l:14, pf:322, pa:370, playoff:null },
    1980: { w:10, l:6, pf:441, pa:325, playoff:null },
    1979: { w:9, l:7, pf:411, pa:326, playoff:null },
    1978: { w:11, l:5, pf:358, pa:286, playoff:{ result:'semi', round:'Divisional Round', opp:'Houston Oilers', detail:'Lost 14–31' } },
    1977: { w:9, l:5, pf:278, pa:217, playoff:null },
    1976: { w:11, l:3, pf:376, pa:236, playoff:{ result:'semi', round:'Divisional Round', opp:'Oakland Raiders', detail:'Lost 21–24' } },
    1975: { w:3, l:11, pf:258, pa:358, playoff:null },
    1974: { w:7, l:7, pf:348, pa:289, playoff:null },
    1973: { w:5, l:9, pf:258, pa:300, playoff:null },
    1972: { w:3, l:11, pf:192, pa:446, playoff:null },
    1971: { w:6, l:8, pf:238, pa:325, playoff:null },
    1970: { w:2, l:12, pf:149, pa:361, playoff:null },
    1969: { w:4, l:10, pf:266, pa:316, playoff:null },
    1968: { w:4, l:10, pf:229, pa:406, playoff:null },
    1967: { w:3, l:10, l2:1, pf:280, pa:389, playoff:null },
    1966: { w:8, l:4, l2:2, pf:315, pa:283, playoff:null },
    1965: { w:4, l:8, l2:2, pf:244, pa:302, playoff:null },
    1964: { w:10, l:3, l2:1, pf:365, pa:297, playoff:{ result:'conf', round:'AFL Championship', opp:'Buffalo Bills', detail:'Lost 7–20' } },
    1963: { w:7, l:6, l2:1, pf:327, pa:257, playoff:null },
    1962: { w:9, l:4, l2:1, pf:346, pa:295, playoff:null },
    1961: { w:9, l:3, l2:0, pf:413, pa:313, playoff:{ result:'conf', round:'AFL East Playoff', opp:'San Diego Chargers', detail:'Lost 28–51 (lost to SD for title)' } },
    1960: { w:5, l:9, pf:286, pa:349, playoff:null },
  }
};

async function loadVault() {
  const sel   = document.getElementById('vault-team');
  const rawDepth = +document.getElementById('vault-depth').value;
  const depth = rawDepth >= 100 ? 999 : rawDepth;
  const val   = sel.value; // e.g. 'mlb|bos' or 'nba|bos'
  const [sport, abbr] = val.split('|');

  document.getElementById('vault-content').innerHTML =
    '<div class="vault-msg"><div class="ld-spin" style="display:block;margin:0 auto 10px"></div>Loading…</div>';

  try {
    let records = [];
    if (sport === 'mlb') {
      records = await loadMLBHistory(abbr === 'bos' ? 111 : 111, depth);
    } else {
      records = loadStaticHistory(val, depth);
    }

    if (!records.length) throw new Error('No data found for this team / depth');
    renderVault(records);
    document.getElementById('vault-src-note').textContent =
      sport === 'mlb'
        ? `${records.length} seasons · MLB Stats API (statsapi.mlb.com)`
        : `${records.length} seasons · Curated from official league records`;
  } catch(e) {
    document.getElementById('vault-content').innerHTML = `<div class="vault-msg">${e.message}</div>`;
  }
}

// ── MLB via statsapi.mlb.com (same API as pitching tab) ───────────────────
async function loadMLBHistory(teamId, depth) {
  const currentYear = new Date().getFullYear();
  const records = [];

  // Fetch all years in parallel
  const years = Array.from({length: depth}, (_,i) => currentYear - i);
  const results = await Promise.allSettled(years.map(yr => fetchMLBSeason(teamId, yr)));

  for (const r of results) {
    if (r.status === 'fulfilled' && r.value) records.push(r.value);
  }
  return records.sort((a,b) => b.year - a.year);
}

async function fetchMLBSeason(teamId, year) {
  try {
    // Standings give us W/L/pct/RS/RA
    // Fetch standings, RS/RA stats, and playoff all in parallel
    const [standing, hitStats, pitStats, playoffRaw] = await Promise.allSettled([
      apiFetch(`https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${year}&standingsTypes=regularSeason&teamId=${teamId}`),
      apiFetch(`https://statsapi.mlb.com/api/v1/teams/${teamId}/stats?stats=season&group=hitting&season=${year}&sportId=1`),
      apiFetch(`https://statsapi.mlb.com/api/v1/teams/${teamId}/stats?stats=season&group=pitching&season=${year}&sportId=1`),
      fetchMLBPlayoff(teamId, year)
    ]);

    if (standing.status !== 'fulfilled') return null;
    let rec = null;
    for (const div of (standing.value.records || [])) {
      const tr = (div.teamRecords || []).find(t => t.team.id === teamId);
      if (tr) { rec = tr; break; }
    }
    if (!rec) return null;

    const w   = rec.wins;
    const l   = rec.losses;
    const pct = parseFloat(rec.winningPercentage) || 0;
    const streak  = rec.streak?.streakCode ?? null;
    const divRank = rec.divisionRank ?? null;

    const hitSplit = hitStats.status==='fulfilled' ? hitStats.value?.stats?.[0]?.splits?.[0]?.stat || {} : {};
    const pitSplit = pitStats.status==='fulfilled' ? pitStats.value?.stats?.[0]?.splits?.[0]?.stat || {} : {};
    const rs = hitSplit.runs ?? null;
    const ra = pitSplit.runs ?? null;
    const playoff = playoffRaw.status==='fulfilled' ? playoffRaw.value : null;

    return { year, w, l, pct, pf: rs, pa: ra, streak, divRank, sport:'mlb', playoff };
  } catch(e) { return null; }
}

async function fetchMLBPlayoff(teamId, year) {
  const data = await apiFetch(
    `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${teamId}&season=${year}&gameType=F,D,L,W&hydrate=seriesSummary`
  );
  const games = [];
  for (const d of (data.dates || [])) for (const g of (d.games || [])) games.push(g);
  if (!games.length) return null;

  const roundMap = { F:'Wild Card', D:'Division Series', L:'Championship Series', W:'World Series' };
  const roundOrder = { F:1, D:2, L:3, W:4 };

  // Group games by series (gameType + opponent)
  // Find the furthest round reached — that's the last gameType in roundOrder
  const gameTypes = [...new Set(games.map(g => g.gameType))];
  gameTypes.sort((a,b) => (roundOrder[b]||0) - (roundOrder[a]||0));
  const furthestType = gameTypes[0];
  const seriesGames = games.filter(g => g.gameType === furthestType);

  seriesGames.sort((a,b) => new Date(b.gameDate) - new Date(a.gameDate));
  const lastGame = seriesGames[0];

  const home = lastGame.teams?.home;
  const away = lastGame.teams?.away;
  const isHome  = home?.team?.id === teamId;
  const myTeam  = isHome ? home : away;
  const oppTeam = isHome ? away : home;
  const opp = oppTeam?.team?.name || oppTeam?.team?.abbreviation || '?';
  const round = roundMap[furthestType] || 'Postseason';

  // Count wins/losses in the series from seriesSummary on the last game
  const ss = lastGame.seriesSummary;
  let seriesDetail = '';
  let won = false;

  // Count wins per side by iterating completed games in the series
  let myWins = 0, oppWins = 0;
  for (const g of seriesGames) {
    if (g.status?.abstractGameState !== 'Final') continue;
    const h = g.teams?.home, aw = g.teams?.away;
    const myT = h?.team?.id === teamId ? h : aw;
    if (myT?.isWinner === true)  myWins++;
    if (myT?.isWinner === false) oppWins++;
  }

  // Fall back to parsing seriesSummary.seriesStatusShort for the score digits
  // e.g. "BOS leads 3-1", "NYY wins 4-2", "Series tied 1-1"
  if (myWins === 0 && oppWins === 0 && ss?.seriesStatusShort) {
    const m = ss.seriesStatusShort.match(/(\d+)[–\-](\d+)/);
    if (m) {
      const a = +m[1], b = +m[2];
      const statusLower = ss.seriesStatusShort.toLowerCase();
      // If "wins" appears and team name matches ours → we won
      const bosNames = ['bos','red sox','boston'];
      const weWon = bosNames.some(n => statusLower.includes(n)) && statusLower.includes('win');
      if (weWon) { myWins = Math.max(a,b); oppWins = Math.min(a,b); }
      else        { myWins = Math.min(a,b); oppWins = Math.max(a,b); }
    }
  }

  won = myWins > oppWins;
  // Always show series score with W/L prefix
  if (myWins > 0 || oppWins > 0) {
    seriesDetail = won ? `Won ${myWins}–${oppWins}` : `Lost ${myWins}–${oppWins}`;
  } else if (ss?.seriesStatusShort) {
    const m = ss.seriesStatusShort.match(/(\d+)[–\-](\d+)/);
    seriesDetail = m ? `${m[1]}–${m[2]}` : ss.seriesStatusShort;
  }

  const isChamp  = furthestType === 'W' && won;
  const result   = isChamp ? 'champ' : furthestType === 'W' ? 'conf'
                 : won     ? 'deep'  : 'out';

  return { result, round, opp, detail: seriesDetail };
}

// ── Static data loader ────────────────────────────────────────────────────
function loadStaticHistory(key, depth) {
  const data = STATIC_DATA[key];
  if (!data) return [];
  const currentYear = new Date().getFullYear();
  const records = [];
  for (let yr = currentYear; yr > currentYear - depth; yr--) {
    const d = data[yr];
    if (!d) continue;
    const sport = key.split('|')[0];
    records.push({ year: yr, w: d.w, l: d.l, t: d.t||0, pf: d.pf, pa: d.pa, pct: d.w/(d.w+d.l+(d.t||0)), sport, playoff: d.playoff });
  }
  return records;
}

// ── Render ────────────────────────────────────────────────────────────────
function renderVault(records) {
  const sel   = document.getElementById('vault-team');
  const sport = sel.value.split('|')[0];
  const isMlb = sport === 'mlb';
  const isNba = sport === 'nba';

  // Column headers depend on sport
  const pfHdr = isMlb ? 'RS' : 'PF';
  const paHdr = isMlb ? 'RA' : 'PA';

  const thead = `<tr>
    <th>Season</th>
    <th class="r">W</th>
    <th class="r">L</th>
    ${!isMlb && records.some(r=>r.t>0) ? '<th class="r">T</th>' : ''}
    <th class="r">Win%</th>
    <th class="r">${pfHdr}</th>
    <th class="r">${paHdr}</th>
    <th class="r">Diff</th>
    ${isMlb ? '<th class="r">Div</th>' : ''}
    <th>Postseason</th>
  </tr>`;

  const rows = records.map(r => {
    const isNba = r.sport === 'nba';
    const isMlb = r.sport === 'mlb';
    const isNfl = r.sport === 'nfl';
    const seasonLabel = isNba
      ? `${r.year-1}–${String(r.year).slice(2)}`
      : isNfl
      ? `${r.year}–${String(r.year+1).slice(2)}`
      : String(r.year);

    const pctStr = (r.pct * 100).toFixed(1) + '%';
    const pfVal = r.pf != null ? (isNba ? r.pf.toFixed(1) : Math.round(r.pf)) : '—';
    const paVal = r.pa != null ? (isNba ? r.pa.toFixed(1) : Math.round(r.pa)) : '—';
    const diff  = r.pf != null && r.pa != null
      ? (isNba ? (r.pf - r.pa).toFixed(1) : Math.round(r.pf - r.pa)) : null;
    const diffStr   = diff !== null ? (diff > 0 ? `+${diff}` : String(diff)) : '—';
    const diffColor = diff > 0 ? 'var(--green)' : diff < 0 ? 'var(--danger)' : 'var(--muted)';

    // Playoff cell
    let playoffCell = '<span style="color:var(--faint);font-family:var(--mono);font-size:10px">—</span>';
    if (r.playoff) {
      const p = r.playoff;
      const isChampGame = p.result === 'champ' ||
        /world series|nba finals|super bowl/i.test(p.round);
      const won = p.result === 'champ';
      const textColor = won ? 'color:#b08828' : isChampGame ? 'color:var(--navy)' : 'color:var(--muted)';
      const fontWeight = isChampGame ? 'font-weight:600' : 'font-weight:400';
      const prefix = won ? '🏆 ' : '';
      playoffCell = `<span style="font-family:var(--mono);font-size:10px;${textColor};${fontWeight}">${prefix}${p.round}${p.opp ? ' · ' + p.opp : ''}${p.detail ? ' · ' + p.detail : ''}</span>`;
    }

    const wColor = r.pct >= 0.5 ? 'color:var(--green);font-weight:600' : 'color:var(--red)';

    const rowStyle = r.playoff?.result === 'champ' ? 'background:#fffbf0;' : '';
    return `<tr style="${rowStyle}">
      <td style="font-family:var(--display);font-weight:700;font-size:12px${r.playoff?.result === 'champ' ? ';color:#b08828' : ''}">${seasonLabel}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px;${wColor}">${r.w}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px">${r.l}</td>
      ${!isMlb && records.some(rec=>rec.t>0) ? `<td class="r" style="font-family:var(--mono);font-size:11px">${r.t||0}</td>` : ''}
      <td class="r" style="font-family:var(--mono);font-size:11px">${pctStr}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px">${pfVal}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px">${paVal}</td>
      <td class="r" style="font-family:var(--mono);font-size:11px;${diffColor}">${diffStr}</td>
      ${isMlb ? `<td class="r" style="font-family:var(--mono);font-size:11px;color:var(--muted)">${r.divRank ? '#'+r.divRank : '—'}</td>` : ''}
      <td>${playoffCell}</td>
    </tr>`;
  }).join('');

  document.getElementById('vault-content').innerHTML = `
    <div class="tbl-wrap">
      <table>
        <thead>${thead}</thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}
