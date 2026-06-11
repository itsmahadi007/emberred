# AGENTS.md — continuation guide for AI agents

This file tells any coding agent (Claude, or others) how to keep working on
EMBERRED at the same quality bar it was built with. `CLAUDE.md` points here.

## What this project is

A Pokémon-inspired, fan-made monster-catching RPG in **vanilla HTML/CSS/JS**.
No build tools, no modules, no server: plain `<script>` tags loaded in order
from `index.html`, sharing globals. It must always run by double-clicking
`index.html` (file://) AND deploy unchanged as a static site (Vercel).

## Hard rules — break these and you break the project

1. **No build step, no ES modules, no npm deps.** Script order in
   `index.html` is the dependency graph: audio → data (types, moves,
   species, sprites, assets, items, maps) → ui → save → battle →
   overworld → main.
2. **Everything renders with a fallback.** Image assets are optional at
   runtime: every draw path falls back to the code-drawn pixel art in
   `js/data/sprites.js` when an image is missing/unloaded. Never delete the
   drawn art; never make a renderer that throws without an image.
3. **Assets are local-only.** The game never hotlinks. New art is fetched by
   the dev scripts (`download-assets.js`, `download-overworld.js`) into
   `assets/`, validated by PNG magic bytes, committed to git. Asset loading
   in-game is lazy (`GameAssets._lazy`) with a background `preloadAll()`
   after first paint — keep both properties when adding assets.
4. **Validation gates every handover:** `node --check` on every JS file AND
   `node validate.js` (map row widths, warp landing tiles, learnset/species/
   item refs, sprite data). Add checks to `validate.js` when you add data
   shapes. The user tests in the browser themselves — do NOT browser-test
   unless asked; deliver error-free, validated files.
5. **Git:** commit with conventional-commit messages
   (`type(scope): short description`, lowercase, under 72 chars). NEVER
   push — the user pushes themselves.
6. **Save compatibility:** anything that changes the save shape (species
   ids, player fields) must bump `MAGIC`/`SLOT` in `js/save.js` and keep
   `applyLoaded` validating before applying.
7. **Originality posture:** species/move/item names and stats are factual
   game data; downloaded sprites are credited (README "Assets") with the
   Nintendo copyright disclaimer. ALL dialogue, flavor text, character/town
   names, and code-drawn art must be original writing — never copy text or
   assets from the actual games into the source.

## Architecture map

| File | Owns |
| --- | --- |
| `js/main.js` | `Game` state, title screen, main loop (2x `setTransform`), adaptive viewport (`Game.viewW` 240–360 logical), mobile/touch setup, PWA SW registration |
| `js/overworld.js` | Grid movement, camera (snapped to half-logical px), interactions (`runAsync` + `Game.busy`), trainer 4-way LOS, warps/links, start menu, blackout |
| `js/battle.js` | `BattleSession`: Gen-3 mechanics, catch formula + ball animation, per-type particles, screen shake, later-gen EXP-share, evolution |
| `js/ui.js` | `Input` (keyboard + touch via `press`/`release`; one-shot listeners), typewriter dialog, menus, screens, battle HUD |
| `js/data/assets.js` | Lazy image cache, tileset slicing tables (`TILE_SRC_OUT/IN`), building decals (body-anchored, `BUILDING_BODY` measured opaque bounds), walk-sheet rendering, shiny variants |
| `js/data/maps.js` | Tile-string maps. Row widths MUST be uniform; `SOLID_TILES` is the collision legend; buildings need ~4 clear rows above their footprint for the tall decal art |
| `js/data/sprites.js` | Code-drawn fallback art (tiles, humans, creatures) |
| `validate.js` | Data integrity gate (run with node) |

## Sharp edges (learned the hard way)

- **Input is strictly one-shot:** a keypress resolves at most ONE waiting
  listener, else sets a `pressed` flag consumed by the overworld. Async UI
  flows must unsubscribe skip-listeners (`Input.listen` returns an unsub).
  Stale listeners = "wrong screen opens" bugs.
- **`Game.busy` guards all interactions** via `Overworld.runAsync` — every
  interaction must go through it and clear pressed keys in `finally`.
- **Decal geometry:** building PNGs carry transparent shadow padding; ALL
  anchoring/collision must use `BUILDING_BODY` (measured opaque rect), not
  `img.width/height` — otherwise doors misalign and invisible walls appear.
- **Crispness rules:** canvas is 2x logical resolution; 32px sources drawn
  onto the 16px grid land 1:1 on device pixels. Round positions to
  half-logical pixels (`Math.round(v*2)/2`). Fractional camera = tile seams.
- **The 720×480 DOM overlay space** scales via `transform: scale()` and the
  stage WIDTH changes with `Game.viewW*3` — anchor overlays left/right, not
  at hardcoded centers.
- **PowerShell file edits mangle UTF-8** (em-dashes, arrows) — prefer the
  Edit tooling; if shell rewrites are unavoidable, grep for `â` afterwards.

## Quality bar for new work

Match what's here: GBA-feel pacing (typewriter, page-by-page dialog, menu
sounds), Gen-3-accurate formulas (cite the formula in a comment), multi-page
original NPC dialogue, every feature reachable by keyboard AND touch, and
README + AGENTS.md updated whenever behavior changes.

## Quick commands

```bash
node validate.js                      # data integrity (must pass)
node download-assets.js               # battle sprites + items (+ shiny)
node download-overworld.js            # Pokemon-Obsidian overworld art
git add -A && git commit                     # conventional-commit message; never push
```
