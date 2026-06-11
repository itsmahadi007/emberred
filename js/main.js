// ===== WILDVALE — game state, title screen, main loop =====
const Game = {
  mode: 'boot',   // 'title' | 'overworld' | 'battle'
  busy: false,
  player: null,
  viewW: 240,     // logical viewport width; widens to match the screen aspect
};

function newPlayer() {
  return {
    map: 'bedroom', x: 2, y: 2, facing: 'down',
    party: [],
    vault: [],
    bag: {},
    money: 3000,
    badges: [],
    flags: {},
    respawn: { map: 'house', x: 4, y: 4 },
  };
}

let _ctx = null;
let _last = 0;

function mainLoop(ts) {
  requestAnimationFrame(mainLoop);
  const dt = Math.min(0.05, (ts - _last) / 1000);
  _last = ts;
  // All scenes draw in 240x160 logical space; the canvas is 480x320 so
  // 32px source art lands at native 1:1 device pixels (crisp).
  _ctx.setTransform(2, 0, 0, 2, 0, 0);
  if (Game.mode === 'overworld') {
    Overworld.update(dt);
    Overworld.draw(_ctx);
  } else if (Game.mode === 'battle' && Battle.active) {
    Battle.active.draw(_ctx);
  } else if (Game.mode === 'title') {
    drawTitle(_ctx, ts);
  }
}

// ---------------- title screen (warm fire gradient + Charizard) ----------------
function drawTitle(ctx, ts) {
  const t = ts / 1000;
  const W = Game.viewW, CX = W / 2;
  const grad = ctx.createLinearGradient(0, 0, 0, 160);
  grad.addColorStop(0, '#2a0c08');
  grad.addColorStop(0.55, '#8a2410');
  grad.addColorStop(1, '#e87828');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, 160);

  // ember motes drifting upward
  ctx.fillStyle = 'rgba(248,200,72,.8)';
  for (let i = 0; i < 18; i++) {
    const ex = (i * 53 + Math.sin(t * 0.7 + i) * 18 + W) % W;
    const ey = 160 - ((t * (14 + i * 3) + i * 37) % 175);
    ctx.fillRect(ex, ey, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
  }

  // dark ridge silhouette
  ctx.fillStyle = '#1c0a06';
  ctx.beginPath();
  ctx.ellipse(CX - 70, 185, 120, 48, 0, Math.PI, 0);
  ctx.ellipse(CX + 80, 192, 130, 55, 0, Math.PI, 0);
  ctx.fill();

  // Charizard hero (local sprite asset, drawn-art fallback)
  const hero = GameAssets.frontFor('charizard') || Sprites.creature('charizard');
  const bob = Math.sin(t * 1.6) * 3;
  ctx.drawImage(hero, CX - 52, 44 + bob, 104, 104);

  ctx.textAlign = 'center';
  ctx.font = '20px "Press Start 2P", monospace';
  ctx.fillStyle = '#5a1004';
  ctx.fillText('EMBERRED', CX + 2, 38);
  ctx.fillStyle = '#f8a020';
  ctx.fillText('EMBERRED', CX, 35);
  ctx.fillStyle = '#f8d048';
  ctx.fillText('EMBERRED', CX - 1, 33);
  ctx.fillStyle = '#f8e8d0';
  ctx.font = '7px "Press Start 2P", monospace';
  ctx.fillText('A FAN-MADE GBA-STYLE ADVENTURE', CX, 52);
  if (Math.floor(t * 1.6) % 2 === 0) {
    ctx.fillStyle = '#fff';
    ctx.fillText('FAN PROJECT — NOT AFFILIATED', CX, 154);
  }
  ctx.textAlign = 'left';
}

async function titleFlow() {
  Game.mode = 'title';
  while (true) {
    const opts = [];
    if (SaveSys.hasLocal()) opts.push('CONTINUE');
    opts.push('NEW GAME', 'IMPORT CODE');
    const pick = await UI.choose(opts, {
      canCancel: false,
      style: { left: '20px', bottom: '120px', minWidth: '178px' },
    });
    const label = opts[pick];

    if (label === 'NEW GAME') {
      Game.player = newPlayer();
      await enterWorld(true);
      return;
    }
    if (label === 'CONTINUE') {
      try {
        SaveSys.fromLocal();
        await enterWorld(false);
        return;
      } catch (e) {
        UI.toast('Save data is corrupted!');
      }
    }
    if (label === 'IMPORT CODE') {
      const code = await UI.importModal();
      if (!code) continue;
      try {
        SaveSys.fromCode(code);
        UI.toast('Save loaded!');
        await enterWorld(false);
        return;
      } catch (e) {
        UI.toast('Invalid save code!');
      }
    }
  }
}

async function enterWorld(isNew) {
  await UI.fadeOut(350);
  Game.mode = 'overworld';
  await UI.fadeIn(350);
  if (isNew) {
    Game.busy = true;
    await UI.sayLines([
      'Morning light spills through your bedroom window in WILLOWBROOK...',
      'Today is the day. Prof. MAPLE is expecting you at her lab!',
      'Head downstairs — MOM will want a word before you go.',
      '(ARROWS/WASD: move   Z: talk/confirm   X: back   ENTER: menu   M: sound)',
    ]);
    Game.busy = false;
    Input.clearPressed();
  }
}

// ---------------- boot ----------------
window.addEventListener('load', () => {
  const cv = document.getElementById('game');
  _ctx = cv.getContext('2d');
  _ctx.imageSmoothingEnabled = false;
  Sprites.init();
  GameAssets.init();
  UI.init();
  setupMobile();
  // Title-screen roar: audio needs a user gesture, so it plays on the
  // first key press / touch while the title is showing.
  let roared = false;
  const titleRoar = () => {
    if (roared || Game.mode !== 'title') return;
    roared = true;
    setTimeout(() => Sfx.roar(), 100);
  };
  window.addEventListener('keydown', titleRoar, true);
  window.addEventListener('touchstart', titleRoar, true);
  requestAnimationFrame(mainLoop);
  titleFlow();
  // Warm every asset in the background right after first paint — the page
  // load is unaffected, but everything is cached before it's needed.
  setTimeout(() => GameAssets.preloadAll(), 150);
});

// ---------------- scaling + fullscreen + touch controls ----------------
function setupMobile() {
  const screenEl = document.getElementById('screen');
  const cv = document.getElementById('game');

  // The logical viewport WIDENS to match the screen's aspect ratio
  // (240..360 logical px), then the stage scales to fill — so the game
  // takes the entire screen on desktop and phones with no black bars.
  function updateViewport() {
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    const w = Math.max(240, Math.min(360, Math.round(160 * aspect / 2) * 2));
    if (Game.viewW !== w) {
      Game.viewW = w;
      cv.width = w * 2;          // 2x internal resolution
      cv.height = 320;
      _ctx.imageSmoothingEnabled = false; // canvas resize resets ctx state
      screenEl.style.width = (w * 3) + 'px';
    }
  }

  function fitScreen() {
    updateViewport();
    const s = Math.min(window.innerWidth / (Game.viewW * 3), window.innerHeight / 480);
    screenEl.style.transform = `scale(${Math.max(0.3, s)})`;
  }
  window.addEventListener('resize', fitScreen);
  window.addEventListener('orientationchange', () => setTimeout(fitScreen, 200));

  // F toggles real browser fullscreen on desktop.
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'f' && e.key !== 'F') return;
    if (e.target && e.target.tagName === 'TEXTAREA') return;
    const root = document.documentElement;
    if (!document.fullscreenElement) {
      if (root.requestFullscreen) root.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  });

  // PWA: register the service worker (https/installed app only; file:// skips).
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // Touch detection: controls appear only when touch is the PRIMARY input
  // (coarse pointer AND no hover) — a touchscreen laptop with a keyboard
  // stays in keyboard mode. A real tap shows them; a keypress hides them.
  const touchPrimary = window.matchMedia
    && matchMedia('(pointer: coarse)').matches
    && matchMedia('(hover: none)').matches;
  if (touchPrimary) document.body.classList.add('touch');

  window.addEventListener('touchstart', () => {
    if (!document.body.classList.contains('touch')) {
      document.body.classList.add('touch');
      fitScreen();
    }
  }, { passive: true });
  window.addEventListener('keydown', () => {
    if (document.body.classList.contains('touch')) {
      document.body.classList.remove('touch');
      fitScreen();
    }
  });

  // Kill page panning/bounce entirely while in touch mode — the game is the
  // whole page. (Textareas keep their internal scrolling for save codes.)
  document.addEventListener('touchmove', (e) => {
    if (!document.body.classList.contains('touch')) return;
    if (e.target && e.target.tagName === 'TEXTAREA') return;
    e.preventDefault();
  }, { passive: false });

  // Try to lock to landscape where the platform allows it (needs fullscreen
  // on most Android browsers; harmless no-op elsewhere).
  const tryLock = () => {
    try {
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    } catch (e) { /* unsupported — CSS overlay handles portrait */ }
  };
  document.addEventListener('touchstart', tryLock, { once: true });

  // Wire every on-screen button into the shared Input press/release path
  // (always wired; they're only visible in touch mode).
  document.querySelectorAll('#touch-controls [data-k]').forEach(btn => {
    const k = btn.dataset.k;
    const down = (e) => { e.preventDefault(); btn.classList.add('on'); Input.press(k); };
    const up = (e) => { e.preventDefault(); btn.classList.remove('on'); Input.release(k); };
    btn.addEventListener('touchstart', down, { passive: false });
    btn.addEventListener('touchend', up, { passive: false });
    btn.addEventListener('touchcancel', up, { passive: false });
    btn.addEventListener('mousedown', down);
    btn.addEventListener('mouseup', up);
    btn.addEventListener('mouseleave', (e) => { if (btn.classList.contains('on')) up(e); });
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  });
  fitScreen();
}

// ---------------- debug hooks (console only) ----------------
window.DEBUG = {
  game: Game,
  give(speciesId, level = 5) {
    Game.player.party.push(makeCreature(speciesId, level));
  },
  heal() {
    for (const c of Game.player.party) { c.hp = c.maxHp; c.status = null; }
  },
  money(n = 99999) { Game.player.money = n; },
  warp(map, x, y) { Game.player.map = map; Game.player.x = x; Game.player.y = y; },
};
