# North Shore Stat Sheet

## Stack
Single-page static app. No build step, no JS modules — plain global JS via
`<script src>` tags only. Must work both opened as `file://` and served on
GitHub Pages. Do not introduce a bundler, npm modules, or import/export syntax.

## File structure
css/home.css
css/styles.css
js/api.js
js/app.js
js/config.js
js/home.js
js/shared/charts.js
js/shared/ui.js
js/sports/archive/draft.js
js/sports/archive/history.js
js/sports/fifa/worldcup.js
js/sports/mlb/live.js
js/sports/mlb/standings.js
js/sports/mlb/stats.js
js/sports/mlb/trends.js
js/sports/nba/standings.js
js/sports/nba/stats.js
js/sports/nba/trends.js

## Data sources
- NBA: ESPN API
- MLB: MLB Stats API (statsapi.mlb.com)
- FIFA World Cup: ESPN API (site.api.espn.com/.../soccer/fifa.world), routed
  through the same CORS proxy as the rest of the app. The World Cup view renders
  LIVE data from ESPN — group standings, full schedule with scores/live status,
  and a knockout bracket that fills in as matches finish — plus a country-focus
  dropdown. (Past tournaments 2022/2018/2014 remain static.)

## Git / deploy
Repo: kacpertheater/north-shore-stat-sheet, branch `main`.
Live at https://kacpertheater.github.io/north-shore-stat-sheet/ (auto-deploys from main).
SSH auth is configured on this Mac — in Claude Code / a local terminal, use standard
`git add` / `git commit` / `git push`.

NOTE for Cowork: the Cowork sandbox is a separate Linux environment that does NOT
have the Mac's SSH keys, so `git push` from Cowork fails by default. Either push
the commit from a local terminal, or set up push credentials inside Cowork
(repo deploy key or a fine-grained PAT over HTTPS).

## Conventions
- Stat bar/avg color: `#2D5A1B` ("Green Monster green"), driven by a shared
  color variable so it propagates to dependent UI automatically.
- Trends sliders (basketball & baseball, all sub-tabs): limited to regular-season
  games only.
- Hitting trends summary column shows a **raw total** over the selected window
  (not a per-game average), sorted by that total, labeled "[Stat] Total / Last N G".
- Local-file testing: cross-origin API calls can get blocked when opened via
  `file://` — use `python3 -m http.server` or a hosted environment (e.g. Netlify)
  if data doesn't load locally.
- "Country/team focus" pattern (introduced in FIFA World Cup view): a
  user-selectable dropdown highlight (bold text, accent color, light bg tint)
  applied across all live views for that sport. Reusable pattern if a similar
  per-team highlight is wanted for NBA/MLB later.
