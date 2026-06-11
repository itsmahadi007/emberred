# EMBERRED — a Pokémon-inspired, GBA-style browser RPG

> **Built with AI.** This game — engine, battle system, data, maps, UI,
> audio, and mobile support — was created with Anthropic's new Claude model
> **Fable 5**, not written by hand. Claude is credited as co-author on every
> commit.
>
> **Non-commercial fan project.** **Pokémon is © Nintendo / Creatures Inc. /
> GAME FREAK Inc.** This project is not affiliated with, endorsed by, or
> connected to them in any way.

A single-page monster-catching RPG in plain HTML/CSS/JavaScript. No build
tools, no dependencies, no server — open `index.html` and play, or deploy the
folder as a static site.

## Run

- **Local:** open `index.html` directly (file:// works — plain script tags, no modules).
- **Deployed:** any static host serves it as-is (see Deploy below).

## Controls (desktop)

| Key | Action |
| --- | --- |
| Arrows / WASD | Move / navigate menus |
| Z / Space | A — confirm, talk, interact |
| X / Esc / Backspace | B — cancel, back |
| Enter | Confirm; opens the menu in the overworld |
| M | Toggle sound |

## Mobile controls & PWA

The game is fully playable on phones, in **landscape only**:

- Portrait shows a full-screen "Please rotate your device" overlay
  (plus a best-effort `screen.orientation.lock('landscape')` attempt).
- **True fullscreen on every device:** the logical viewport *widens*
  (240–360 logical px) to match the screen's aspect ratio, then scales —
  no letterboxing on desktop or phones. Press **F** for browser
  fullscreen on desktop. The page itself never scrolls or bounces.
- Touch controls are overlaid **inside the game** like mobile RPG ports:
  semi-transparent **D-pad** bottom-left (hold to keep walking), **A / B**
  bottom-right with the **START** pill stacked above A — all driving the
  same input layer as the keyboard.
- Controls appear only when touch is the **primary** input (coarse pointer
  + no hover) — touchscreen laptops stay in keyboard mode; a real tap shows
  the controls, a keypress hides them again.
- **Installable PWA**: `manifest.json` (fullscreen display, landscape
  orientation, pixel-Charizard app icon on a fire-red background) plus a
  cache-first service worker, so the deployed game can be added to the
  home screen and played offline.

## Progression

1. Wake up in your room, head downstairs — MOM sends you off with a Potion.
2. Choose Bulbasaur, Charmander, or Squirtle at Prof. MAPLE's lab.
3. Your rival REX grabs the type-advantaged starter and battles you on the spot.
4. FERNWAY TRAIL: tall-grass wild encounters (Pidgey, Rattata, Caterpie,
   Weedle, Lv 2–5) and two line-of-sight trainers.
5. STONEGATE: a classic red-roof **Pokémon Center** (free healing), a
   blue-roof **Poké Mart** (shop), and the gym — beat Trainee ROCCO and
   Leader MASON for the GRANITE BADGE.
6. Save anytime — browser slot or a portable save code you can import from
   the title screen.

## Mechanics (Gen-3-modeled)

- Gen 3 damage formula with STAB, 85–100% variance, criticals (1/16; 1/8
  high-crit), and the full real type chart (all 17 types).
- Stats HP/Atk/Def/SpA/SpD/Spe; speed order; ±6 stat stages **including
  accuracy and evasion**.
- Status: poison, burn (halves physical Atk), paralysis (¼ speed, 25% full
  para), sleep (2–4 turns), freeze (20% thaw; fire moves thaw). Fire-types
  can't be burned; Poison/Steel-types can't be poisoned.
- Volatiles: flinch, confusion (2–5 turns, 50% self-hit), Leech Seed.
- Multi-hit moves (Fury Attack, Pin Missile, Twineedle), Super Fang,
  priority (Quick Attack), PP and Struggle.
- Gen 3 catch formula (HP, catch rate, ball bonus, status bonus) with a
  focused capture sequence: HUD clears, suck-in shrink, up to three wobbles
  with beeps, lock click + star burst — or a break-open flash with flying
  shell fragments on escape.
- **Later-gen EXP Share:** every able party member earns experience from
  each KO — participants get the full amount, benchwarmers half.
- **Shiny encounters (1/512):** every generated creature can roll shiny,
  with real shiny sprites, a sparkle + callout on wild entry, and shiny
  thumbnails in the party screen.
- Trainer battles show the opponent's team as ball icons that darken as
  each one faints; trainers watch **all four directions** — you can't
  sneak behind them.
- Battle presentation: real battleback art (cover-scaled to the viewport),
  soft ground shadows under both combatants, per-move-type canvas hit
  effects (flames, droplets, jolts, leaves, powder, slashes, rings) and
  screen shake.
- Level-ups, move learning with replace prompt, level evolutions
  (starters 16, Caterpie/Weedle lines 7→10, Pidgey 18, Rattata 20, mid
  evolutions 32/36). Blacking out returns you to the most recently visited
  healing center (home before you've reached one).

## Assets

- All images are **downloaded locally** into `assets/` by two dev scripts
  (`node download-assets.js`, `node download-overworld.js`) — the game never
  hotlinks at runtime and works fully offline.
- In-game loading is **lazy with a background warm-up**: nothing blocks the
  page; every image is created on demand, and a `preloadAll()` pass right
  after first paint caches the rest (including all shiny variants) while
  you're still on the title screen.
- Battle sprites (front/back) and item icons:
  [42arch/pokemon-dataset-zh](https://github.com/42arch/pokemon-dataset-zh)
  (dataset/images reference) with [PokeAPI/sprites](https://github.com/PokeAPI/sprites)
  as the actual source for most front sprites, all back sprites, and item
  icons (the dataset's image paths weren't directly fetchable).
- Overworld art — tilesets, building exteriors, character walk-cycle sheets,
  and the battle background — comes from
  [torresflo/Pokemon-Obsidian](https://github.com/torresflo/Pokemon-Obsidian)
  (a PSDK/Pokémon Studio fan game). GPL-3 applies to that project's *code*;
  the artwork itself remains Nintendo-derived.
- The renderer slices 32px tileset cells onto the game's 16px grid, draws
  whole-building images over grassed footprints, and animates 4-direction
  × 4-frame walk cycles anchored at the feet. If any image is missing or
  fails to load, every surface **falls back to the original code-drawn
  art**, which stays in the codebase.
- Sprite/character/tile designs **© Nintendo / Creatures Inc. / GAME FREAK
  Inc.** — used here non-commercially in a fan project; this project is not
  affiliated with or endorsed by them.

## Deploy (Vercel)

1. Push this folder to a GitHub repo (it's already a git repo — just add a
   remote and push).
2. In Vercel: **Add New → Project → Import** the repo.
3. Done. `vercel.json` pins it as a zero-build static site (`framework: null`,
   no build command, `index.html` at the root, long-lived cache headers for
   `assets/`, day-long for `js/`/`css/`).

## Code layout

| File | Role |
| --- | --- |
| `js/main.js` | Game state, title screen, main loop, mobile setup |
| `js/overworld.js` | Tile engine, movement, NPCs, LOS trainers, warps, menus |
| `js/battle.js` | Battle system, catch logic, hit effects, screen shake |
| `js/ui.js` | Input (keyboard + touch), typewriter dialog, menus, HUD |
| `js/save.js` | Browser save slot + portable save codes |
| `js/audio.js` | Web Audio SFX (synthesized, including the title roar) |
| `js/data/*.js` | Types, moves, species, items, maps, drawn sprites, image assets |
| `AGENTS.md` / `CLAUDE.md` | Continuation guides for AI agents |
| `assets/sprites/`, `assets/items/` | Battle sprites (front/back + shiny variants) + item icons |
| `assets/overworld/` | Tilesets, building images, flower autotile |
| `assets/characters/` | 4-direction walk-cycle sheets (player + NPCs) |
| `assets/battle/` | Battle background |
| `assets/icons/`, `assets/og-image.png` | PWA app icons + link-preview card |
| `manifest.json` / `sw.js` | PWA manifest (fullscreen, landscape) + offline service worker |
| `download-assets.js` | Dev script: battle sprites + item icons |
| `download-overworld.js` | Dev script: Pokemon-Obsidian overworld art |
| `validate.js` | Dev-only data integrity checker (`node validate.js`) |
| `vercel.json` | Zero-config static deployment |

## For AI agents continuing this project

Two guides ship with the repo so any capable model can pick the work up at
the same quality bar:

- **`AGENTS.md`** — the canonical guide: architecture map, the hard rules
  (no build step, fallback-first rendering, local-only assets, validation
  gates, originality posture), the sharp edges already hit (one-shot input
  semantics, decal body geometry, pixel-snapping rules), and the quality
  bar for new work.
- **`CLAUDE.md`** — Claude-specific workflow notes on top of AGENTS.md
  (validation commands, tooling caveats, where to start per task type).

## Debug helpers (browser console)

```js
DEBUG.give('pidgey', 12)   // add a team member
DEBUG.heal()               // restore the party
DEBUG.money(99999)
DEBUG.warp('stonegate', 9, 13)
```
