// ════════════════════════════════════════
//  CONSTANTS
// ════════════════════════════════════════
const BOS_ID_DEFAULT = 111;
const ESPN_BOS_DEFAULT = '2';
let selectedMlbTeamId   = 111;
let selectedMlbTeamAbbr = 'BOS';
let selectedMlbTeamName = 'Red Sox';
let selectedNbaTeamId   = '2';   // ESPN team ID
let selectedNbaTeamAbbr = 'BOS';
let selectedNbaTeamName = 'Celtics';
// Legacy alias
const BOS_ID = 111;
const PROXIES = [
  u => u,
  u => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
];

// ════════════════════════════════════════
//  STATE
// ════════════════════════════════════════
let pitcherData = [], gamesMeta = [];
let pitchGames  = 3;
let btPitchYear = new Date().getFullYear();
let btHitYear   = new Date().getFullYear();
let btPitchTotalGames = 162;
let btHitTotalGames   = 162;
let hitterData  = [];
let hitGameType = 'R';
let hitDays     = 60;
let hitYear     = new Date().getFullYear();
let sortPitchState = { bp:{col:null,asc:false}, sp:{col:null,asc:false} };
let sortHitState   = { col:'avg', asc:false };
let rangeTimer, pitchRangeTimer;

const BKT_STAT_LABELS = { pts:'PTS', reb:'REB', ast:'AST', stl:'STL', blk:'BLK', min:'MIN' };
const BKT_STAT_MAX    = { pts:50,    reb:20,    ast:15,    stl:5,     blk:5,     min:40  };

const NBA_TEAM_COLORS = {
  'BOS':'#007A33','ATL':'#E03A3E','BKN':'#000000','CHA':'#1D1160',
  'CHI':'#CE1141','CLE':'#860038','DAL':'#00538C','DEN':'#0E2240',
  'DET':'#C8102E','GSW':'#1D428A','HOU':'#CE1141','IND':'#002D62',
  'LAC':'#C8102E','LAL':'#552583','MEM':'#5D76A9','MIA':'#98002E',
  'MIL':'#00471B','MIN':'#0C2340','NOP':'#0C2340','NYK':'#006BB6',
  'OKC':'#007AC1','ORL':'#0077C0','PHI':'#006BB6','PHX':'#1D1160',
  'POR':'#E03A3E','SAC':'#5A2D81','SAS':'#C4CED4','TOR':'#CE1141',
  'UTA':'#002B5C','WAS':'#E31837',
};
const MLB_TEAM_COLORS = {
  'BOS':'#BD3039','NYY':'#003087','TB' :'#092C5C','BAL':'#DF4601','TOR':'#134A8E',
  'CLE':'#E31937','CWS':'#27251F','DET':'#FA4616','KC' :'#004687','MIN':'#002B5C',
  'HOU':'#EB6E1F','ATH':'#003831','OAK':'#003831','SEA':'#005C5C','TEX':'#003278','LAA':'#BA0021',
  'ATL':'#CE1141','MIA':'#00A3E0','NYM':'#002D72','PHI':'#E81828','WSH':'#AB0003',
  'CHC':'#0E3386','CIN':'#C6011F','MIL':'#FFC52F','PIT':'#FDB827','STL':'#C41E3A',
  'ARI':'#A71930','COL':'#33006F','LAD':'#005A9C','SD' :'#2F241D','SF' :'#FD5A1E',
};

// ── Archive & Draft State ─────────────────────────────────────────────────
let archiveSub   = 'seasons';
let draftSport   = 'nba';
let draftYear    = new Date().getFullYear();
let draftView    = 'all'; // 'all' | 'team'
let draftLoading = false;

// Home team abbreviations per sport
const DRAFT_HOME_TEAM = { nba:'BOS', mlb:'BOS', nfl:'NE' };
const DRAFT_HOME_NAME = { nba:'Boston Celtics', mlb:'Boston Red Sox', nfl:'New England Patriots' };

// ── Chart / Standings constants ───────────────────────────────────────────
const DIV_MAP_RACE    = {200:'AL West',201:'AL East',202:'AL Central',203:'NL West',204:'NL East',205:'NL Central'};
const LEAGUE_MAP_RACE = {200:'AL',201:'AL',202:'AL',203:'NL',204:'NL',205:'NL'};

const MAX_WINS  = 120;
const SEASON_GP = 162; // full MLB regular season

// Layout constants for charts
const SLOT_H    = 44;   // px per rank slot
const DOT_R     = 2.8;  // base dot radius
const BOS_DOT_R = 3.8;
const GP_PER_PX = 2.2;
