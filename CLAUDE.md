# CLAUDE.md

**Read `AGENTS.md` first** — it is the canonical continuation guide for this
project (architecture map, hard rules, sharp edges, quality bar). This file
only adds the Claude-specific workflow notes.

## Workflow expectations

- The user tests in their own browser and reports back with screenshots —
  do **not** browser-test unless explicitly asked. Hand over files that pass:
  - `node --check` on every `.js` file (game + dev scripts)
  - `node validate.js`
- Commit with a conventional-commit message
  (`type(scope): short description`, lowercase, under 72 chars).
  **Never push** — the user pushes themselves.
- Use the Edit/Write tooling for source changes. Avoid PowerShell
  `Set-Content` round-trips on source files — they have mangled UTF-8
  punctuation in comments before (grep for `â` if you must).
- When picking coordinates out of downloaded sprite sheets, verify them by
  rendering labeled contact-sheet crops (System.Drawing works on this
  machine) and re-pick anything that lands wrong — do not ship guessed
  source rects.
- Keep `README.md` and `AGENTS.md` in sync with behavior changes — the
  user treats README drift as a bug.

## Quick orientation

| Task | Start in |
| --- | --- |
| Gameplay/balance data | `js/data/{species,moves,items,maps}.js` |
| Battle behavior | `js/battle.js` |
| Movement/NPC/interaction | `js/overworld.js` |
| Menus/dialog/input | `js/ui.js` |
| Image assets & renderer glue | `js/data/assets.js` + download scripts |
| Mobile/scaling/PWA | `js/main.js` + `css/style.css` + `index.html` head |
