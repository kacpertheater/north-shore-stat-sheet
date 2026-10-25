# Project Notes / Decision History

This file is background/reference only — it captures the "why" behind choices
made across earlier Claude.ai chats. Not required reading for every task, but
useful when revisiting older decisions or onboarding a new session.

## Origin
Project started as a single Red Sox bullpen pitch-tracking widget: track
pitches thrown by each pitcher (especially bullpen arms) over the last game
and trailing 2–3 games, to help judge who's fresh vs. overworked. Built as
one big HTML file (`redsox-bullpen-tracker.html`) using the MLB Stats API.

Early troubleshooting: a "file won't open" issue turned out to be a browser
blocking cross-origin API calls from a locally-opened `file://` HTML file —
not a corrupted file. Fix: run a local server or host it (e.g. Netlify).

## v2 — regular-season-only sliders
Trends sliders (basketball + baseball, all sub-tabs) were limited to
regular-season games only, since postseason game counts/spacing skewed the
"last N games" freshness reads.

Also switched the hitting trends summary column from a per-game average to a
raw total over the selected window — totals were judged more intuitive for
spotting a "hot" hitter than an average, and sorting was changed to match
(sort by total, not average).

## v3 — standings tabs + project restructure
Added sortable NBA/MLB standings tabs with a wildcard-race toggle, reusing
the same data sources already in use per sport (ESPN for NBA, MLB Stats API
for MLB).

This is also when the project moved from one giant HTML file into a proper
multi-file static app ("North Shore Stat Sheet") under
`~/Desktop/north-shore-stat-sheet`, deployed via GitHub Pages. Decided to
keep it dependency-free (no build step, no modules) so it stays simple to
host and easy to open directly as a file when needed.

Work then shifted from Claude.ai chat into Cowork for ongoing development,
since Cowork can read/write the actual files on disk and run git directly.

## Design decisions worth remembering
- "Green Monster green" (#2D5A1B) was chosen deliberately as a Red-Sox-themed
  accent color for stat bars and highlighted values.
- Home page went through a few redesign iterations (colors etc.) — if you
  want the reasoning behind a specific visual choice, it's worth searching
  past Claude.ai chat history rather than assuming it was arbitrary.
