// ===== WILDVALE — input + UI layer (dialog, menus, screens, battle HUD) =====

const wait = ms => new Promise(r => setTimeout(r, ms));
const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1)); // inclusive

// ---------------- Input ----------------
const Input = (() => {
  const held = {};
  const pressed = {};
  const listeners = [];

  function mapKey(key) {
    switch (key) {
      case 'ArrowUp': case 'w': case 'W': return 'up';
      case 'ArrowDown': case 's': case 'S': return 'down';
      case 'ArrowLeft': case 'a': case 'A': return 'left';
      case 'ArrowRight': case 'd': case 'D': return 'right';
      case 'z': case 'Z': case ' ': return 'a';
      case 'x': case 'X': case 'Escape': case 'Backspace': return 'b';
      case 'Enter': return 'start';
      case 'm': case 'M': return 'mute';
      default: return null;
    }
  }

  // Shared entry point for keyboard AND touch controls — both produce the
  // exact same press/release semantics (held state + one-shot dispatch).
  function press(name) {
    held[name] = true;
    Sfx.unlock();
    if (name === 'mute') { UI.toast(Sfx.toggle() ? 'SOUND: ON' : 'SOUND: OFF'); return; }
    // A waiting async flow consumes the press first.
    for (let i = 0; i < listeners.length; i++) {
      const li = listeners[i];
      if (!li.keys || li.keys.includes(name)) {
        listeners.splice(i, 1);
        li.resolve(name);
        return;
      }
    }
    pressed[name] = true;
  }
  function release(name) {
    held[name] = false;
  }

  window.addEventListener('keydown', (e) => {
    if (e.target && e.target.tagName === 'TEXTAREA' && e.key !== 'Escape') return;
    const name = mapKey(e.key);
    if (!name) return;
    e.preventDefault();
    if (e.repeat) { held[name] = true; return; }
    press(name);
  });
  window.addEventListener('keyup', (e) => {
    const name = mapKey(e.key);
    if (name) release(name);
  });

  return {
    held,
    dirHeld() {
      for (const d of ['up', 'down', 'left', 'right']) if (held[d]) return d;
      return null;
    },
    consume(name) {
      if (pressed[name]) { pressed[name] = false; return true; }
      return false;
    },
    clearPressed() { for (const k of Object.keys(pressed)) pressed[k] = false; },
    waitButton(...keys) {
      return new Promise(resolve => listeners.push({ keys: keys.length ? keys : null, resolve }));
    },
    // Register a one-shot listener; returns an unsubscribe function.
    listen(keys, cb) {
      const li = { keys, resolve: cb };
      listeners.push(li);
      return () => { const i = listeners.indexOf(li); if (i >= 0) listeners.splice(i, 1); };
    },
    // Touch-control entry points (same semantics as keydown/keyup).
    press, release,
  };
})();

// ---------------- UI ----------------
const UI = (() => {
  const $ = id => document.getElementById(id);
  let dlg, dlgText, dlgArrow, menuLayer, fadeEl;

  function init() {
    dlg = $('dialog'); dlgText = $('dialog-text'); dlgArrow = $('dialog-arrow');
    menuLayer = $('menu-layer'); fadeEl = $('fade');
  }

  // Creature thumbnail: real front sprite if loaded, else the drawn fallback.
  function creatureThumb(species, px, shiny) {
    const img = GameAssets.frontFor(species, shiny);
    if (img) {
      const el = document.createElement('img');
      el.src = img.src;
      el.style.cssText = `width:${px}px;height:${px}px;image-rendering:pixelated;object-fit:contain`;
      return el;
    }
    const cv = document.createElement('canvas');
    cv.width = 16; cv.height = 16;
    cv.getContext('2d').drawImage(Sprites.creature(species), 0, 0);
    cv.style.cssText = `width:${px}px;height:${px}px;image-rendering:pixelated`;
    return cv;
  }

  // Item icon HTML (empty string when no icon is available).
  function itemIconHtml(itemId) {
    const url = GameAssets.itemIconUrl(itemId);
    return url ? `<img src="${url}" class="item-icon" onerror="this.remove()" alt="">` : '';
  }

  // ----- dialog / typewriter -----
  async function say(text, opts = {}) {
    dlg.classList.remove('hidden');
    dlgArrow.classList.add('hidden');
    dlgText.textContent = '';
    let i = 0, skipped = false;
    const unsub = Input.listen(['a', 'b', 'start'], () => { skipped = true; });
    while (i < text.length) {
      if (skipped) { dlgText.textContent = text; break; }
      i += 2;
      dlgText.textContent = text.slice(0, i);
      if (i % 6 === 0) Sfx.blip();
      await wait(26);
    }
    unsub();
    if (opts.noWait) { if (!opts.keep) dlg.classList.add('hidden'); return; }
    dlgArrow.classList.remove('hidden');
    await Input.waitButton('a', 'b', 'start');
    Sfx.select();
    dlgArrow.classList.add('hidden');
    if (!opts.keep) { dlg.classList.add('hidden'); dlgText.textContent = ''; }
  }

  async function sayLines(lines, opts = {}) {
    for (let i = 0; i < lines.length; i++) {
      await say(lines[i], { keep: opts.keep || i < lines.length - 1 });
    }
  }

  function setPrompt(text) {
    dlg.classList.remove('hidden');
    dlgArrow.classList.add('hidden');
    dlgText.textContent = text;
  }

  function hideDialog() {
    dlg.classList.add('hidden');
    dlgText.textContent = '';
    dlgArrow.classList.add('hidden');
  }

  // ----- generic menu -----
  // options: array of strings (or {label, dim}). opts: {style, cols, canCancel, startIdx}
  async function choose(options, opts = {}) {
    const box = document.createElement('div');
    box.className = 'menu gba-box' + (opts.cols === 2 ? ' grid-menu' : '');
    Object.assign(box.style, opts.style || { right: '14px', bottom: '126px' });
    const items = options.map(o => {
      const d = document.createElement('div');
      d.className = 'mi' + ((o && o.dim) ? ' dim' : '');
      d.textContent = typeof o === 'string' ? o : o.label;
      box.appendChild(d);
      return d;
    });
    menuLayer.appendChild(box);
    let idx = opts.startIdx || 0;
    const cols = opts.cols || 1;
    const paint = () => items.forEach((d, i) => d.classList.toggle('sel', i === idx));
    paint();
    try {
      while (true) {
        const k = await Input.waitButton('up', 'down', 'left', 'right', 'a', 'b', 'start');
        if (k === 'a' || k === 'start') { Sfx.select(); return idx; }
        if (k === 'b') {
          if (opts.canCancel === false) continue;
          Sfx.cancel(); return -1;
        }
        const n = options.length;
        let next = idx;
        if (cols === 1) {
          if (k === 'up') next = (idx - 1 + n) % n;
          if (k === 'down') next = (idx + 1) % n;
        } else {
          if (k === 'left' && idx % cols > 0) next = idx - 1;
          if (k === 'right' && idx % cols < cols - 1 && idx + 1 < n) next = idx + 1;
          if (k === 'up' && idx - cols >= 0) next = idx - cols;
          if (k === 'down' && idx + cols < n) next = idx + cols;
        }
        if (next !== idx) { idx = next; Sfx.cursor(); paint(); }
      }
    } finally {
      box.remove();
    }
  }

  async function yesNo(prompt) {
    if (prompt) await say(prompt, { noWait: true, keep: true });
    const r = await choose(['YES', 'NO'], { style: { right: '14px', bottom: '126px' } });
    hideDialog();
    return r === 0;
  }

  // ----- toast -----
  let toastTimer = null;
  function toast(text) {
    let t = document.getElementById('ui-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'ui-toast';
      t.className = 'gba-box';
      Object.assign(t.style, {
        position: 'absolute', left: '12px', top: '12px', padding: '10px 14px',
        fontSize: '11px', zIndex: 95,
      });
      menuLayer.appendChild(t);
    }
    t.textContent = text;
    t.style.display = 'block';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.style.display = 'none'; }, 1200);
  }

  // ----- fades / flashes -----
  function fadeOut(ms = 300) {
    fadeEl.classList.remove('flash');
    fadeEl.style.transition = `opacity ${ms}ms linear`;
    fadeEl.classList.add('on');
    return wait(ms + 30);
  }
  function fadeIn(ms = 300) {
    fadeEl.classList.remove('flash');
    fadeEl.style.transition = `opacity ${ms}ms linear`;
    fadeEl.classList.remove('on');
    return wait(ms + 30);
  }
  async function flashScreen(times = 3) {
    fadeEl.classList.add('flash');
    for (let i = 0; i < times; i++) {
      fadeEl.classList.add('on'); await wait(70);
      fadeEl.classList.remove('on'); await wait(70);
    }
    fadeEl.classList.remove('flash');
  }

  // ----- battle HUD -----
  function hpClass(frac) { return frac > 0.5 ? '' : frac > 0.2 ? 'mid' : 'low'; }

  function boxEls(side) {
    const root = $(side === 'player' ? 'player-box' : 'enemy-box');
    return {
      root,
      name: root.querySelector('.ib-name'),
      lv: root.querySelector('.ib-lv'),
      st: root.querySelector('.ib-status'),
      fill: root.querySelector('.hp-fill'),
      hpnum: root.querySelector('.ib-hpnum'),
      exp: root.querySelector('.exp-fill'),
    };
  }

  function setBox(side, c) {
    const e = boxEls(side);
    e.root.classList.remove('hidden');
    e.name.textContent = creatureName(c);
    e.lv.textContent = 'Lv' + c.level;
    setStatusChip(side, c.status);
    const frac = Math.max(0, c.hp / c.maxHp);
    e.fill.style.width = (frac * 100) + '%';
    e.fill.className = 'hp-fill ' + hpClass(frac);
    if (e.hpnum) e.hpnum.textContent = `${Math.max(0, c.hp)}/ ${c.maxHp}`;
    if (e.exp && side === 'player') e.exp.style.width = (expProgress(c) * 100) + '%';
  }

  function setStatusChip(side, status) {
    const e = boxEls(side);
    e.st.className = 'ib-status' + (status ? ` on st-${status}` : '');
    e.st.textContent = status || '';
  }

  // Trainer battles: show the opponent's team as ball icons, darkening each
  // one as it faints. Pass null (or a wild battle) to hide the row.
  function setEnemyBalls(party) {
    const row = document.querySelector('#enemy-box .ib-balls');
    if (!row) return;
    row.innerHTML = '';
    if (!party) return;
    const url = GameAssets.itemIconUrl('pokeball');
    for (const c of party) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = '';
      if (c.hp <= 0) img.classList.add('down');
      row.appendChild(img);
    }
  }

  function hideBoxes() {
    $('player-box').classList.add('hidden');
    $('enemy-box').classList.add('hidden');
  }

  // Tween HP from -> to over ~600ms.
  function animateHp(side, from, to, max) {
    const e = boxEls(side);
    return new Promise(res => {
      const dur = Math.min(900, 250 + Math.abs(from - to) * 14);
      const t0 = performance.now();
      function step(t) {
        const k = Math.min(1, (t - t0) / dur);
        const hp = Math.round(from + (to - from) * k);
        const frac = Math.max(0, hp / max);
        e.fill.style.width = (frac * 100) + '%';
        e.fill.className = 'hp-fill ' + hpClass(frac);
        if (e.hpnum) e.hpnum.textContent = `${Math.max(0, hp)}/ ${max}`;
        if (k < 1) requestAnimationFrame(step); else res();
      }
      requestAnimationFrame(step);
    });
  }

  function animateExp(fromFrac, toFrac) {
    const e = boxEls('player');
    return new Promise(res => {
      const dur = 500;
      const t0 = performance.now();
      function step(t) {
        const k = Math.min(1, (t - t0) / dur);
        e.exp.style.width = ((fromFrac + (toFrac - fromFrac) * k) * 100) + '%';
        if (k < 1) requestAnimationFrame(step); else res();
      }
      requestAnimationFrame(step);
    });
  }

  // ----- battle move menu -----
  async function moveMenu(c) {
    const box = document.createElement('div');
    box.className = 'menu gba-box grid-menu';
    Object.assign(box.style, {
      left: '10px', bottom: '10px', width: '486px', height: '108px',
      padding: '18px 20px',
    });
    const panel = document.createElement('div');
    panel.className = 'gba-box';
    panel.id = 'move-panel';
    menuLayer.appendChild(box);
    menuLayer.appendChild(panel);
    const items = c.moves.map(m => {
      const d = document.createElement('div');
      d.className = 'mi';
      d.textContent = MOVES[m.id].name;
      box.appendChild(d);
      return d;
    });
    let idx = 0;
    const paint = () => {
      items.forEach((d, i) => d.classList.toggle('sel', i === idx));
      const m = c.moves[idx];
      panel.innerHTML = `PP&nbsp; ${m.pp}/${m.maxPp}<br>TYPE/${MOVES[m.id].type}`;
    };
    paint();
    try {
      while (true) {
        const k = await Input.waitButton('up', 'down', 'left', 'right', 'a', 'b', 'start');
        if (k === 'a' || k === 'start') {
          if (c.moves[idx].pp <= 0) { Sfx.cancel(); setPrompt("There's no PP left for this move!"); await wait(900); continue; }
          Sfx.select(); return idx;
        }
        if (k === 'b') { Sfx.cancel(); return -1; }
        const n = items.length;
        let next = idx;
        if (k === 'left' && idx % 2 === 1) next = idx - 1;
        if (k === 'right' && idx % 2 === 0 && idx + 1 < n) next = idx + 1;
        if (k === 'up' && idx >= 2) next = idx - 2;
        if (k === 'down' && idx + 2 < n) next = idx + 2;
        if (next !== idx) { idx = next; Sfx.cursor(); paint(); }
      }
    } finally {
      box.remove(); panel.remove();
    }
  }

  // ----- party screen -----
  // mode: 'view' | 'switch' | 'target'  forced: can't cancel
  async function partyScreen(opts = {}) {
    const party = Game.player.party;
    const scr = document.createElement('div');
    scr.className = 'full-screen';
    scr.innerHTML = `<div class="fs-title">${opts.title || 'PARTY'}</div>
      <div class="fs-foot">${opts.forced ? 'Z: choose' : 'Z: choose &nbsp; X: back'}</div>`;
    const list = document.createElement('div');
    scr.appendChild(list);
    menuLayer.appendChild(scr);

    if (!party.length) {
      list.innerHTML = '<div style="font-size:12px;color:#9ab;padding:20px;line-height:1.8">Your party is empty.<br>Visit Prof. MAPLE\'s lab for your first partner!</div>';
      await Input.waitButton('a', 'b', 'start');
      Sfx.cancel();
      scr.remove();
      return -1;
    }

    function render(sel) {
      list.innerHTML = '';
      party.forEach((c, i) => {
        const slot = document.createElement('div');
        slot.className = 'party-slot' + (i === sel ? ' sel' : '') + (c.hp <= 0 ? ' fainted' : '');
        const cv = creatureThumb(c.species, 48, c.shiny);
        const frac = Math.max(0, c.hp / c.maxHp);
        const cls = frac > 0.5 ? '' : frac > 0.2 ? 'mid' : 'low';
        const stTag = c.hp <= 0 ? 'FNT' : c.status;
        slot.appendChild(cv);
        const info = document.createElement('div');
        info.className = 'ps-info';
        info.innerHTML = `<div class="ps-name">${creatureName(c)} <span style="color:#9ab">Lv${c.level}</span>
            ${stTag ? `<span class="ps-st st-${stTag}">${stTag}</span>` : ''}</div>
          <div class="ps-hpline"><div class="ps-hptrack"><div class="ps-hpfill ${cls}" style="width:${frac * 100}%"></div></div>
          <span>${Math.max(0, c.hp)}/${c.maxHp}</span></div>`;
        slot.appendChild(info);
        list.appendChild(slot);
      });
    }

    let idx = 0;
    render(idx);
    try {
      while (true) {
        const k = await Input.waitButton('up', 'down', 'a', 'b', 'start');
        if (k === 'up') { idx = (idx - 1 + party.length) % party.length; Sfx.cursor(); render(idx); }
        else if (k === 'down') { idx = (idx + 1) % party.length; Sfx.cursor(); render(idx); }
        else if (k === 'b') {
          if (opts.forced) { Sfx.cancel(); continue; }
          Sfx.cancel(); return -1;
        }
        else if (k === 'a' || k === 'start') { Sfx.select(); return idx; }
      }
    } finally {
      scr.remove();
    }
  }

  // ----- bag screen -----
  // Returns itemId or null. opts: {inBattle}
  async function bagScreen(opts = {}) {
    const entries = Object.entries(Game.player.bag).filter(([, n]) => n > 0);
    const scr = document.createElement('div');
    scr.className = 'full-screen';
    scr.innerHTML = `<div class="fs-title">BAG</div>
      <div class="fs-foot">Z: use &nbsp; X: back</div>`;
    const list = document.createElement('div');
    const desc = document.createElement('div');
    desc.className = 'bag-desc';
    scr.appendChild(list); scr.appendChild(desc);
    menuLayer.appendChild(scr);

    if (!entries.length) {
      list.innerHTML = '<div style="font-size:12px;color:#9ab;padding:20px">The bag is empty.</div>';
      await Input.waitButton('a', 'b', 'start');
      Sfx.cancel();
      scr.remove();
      return null;
    }

    let idx = 0;
    const render = () => {
      list.innerHTML = '';
      entries.forEach(([id, n], i) => {
        const row = document.createElement('div');
        row.className = 'bag-row' + (i === idx ? ' sel' : '');
        row.innerHTML = `<span>${itemIconHtml(id)}${ITEMS[id].name}</span><span>x${String(n).padStart(2, ' ')}</span>`;
        list.appendChild(row);
      });
      desc.textContent = ITEMS[entries[idx][0]].desc;
    };
    render();
    try {
      while (true) {
        const k = await Input.waitButton('up', 'down', 'a', 'b', 'start');
        if (k === 'up') { idx = (idx - 1 + entries.length) % entries.length; Sfx.cursor(); render(); }
        else if (k === 'down') { idx = (idx + 1) % entries.length; Sfx.cursor(); render(); }
        else if (k === 'b') { Sfx.cancel(); return null; }
        else if (k === 'a' || k === 'start') { Sfx.select(); return entries[idx][0]; }
      }
    } finally {
      scr.remove();
    }
  }

  // ----- shop -----
  async function shopScreen() {
    const scr = document.createElement('div');
    scr.className = 'full-screen';
    scr.innerHTML = `<div class="fs-title">POKE MART</div>
      <div class="money-chip gba-box">$<span id="shop-money"></span></div>
      <div class="fs-foot">Z: buy &nbsp; LEFT/RIGHT: qty &nbsp; X: leave</div>`;
    const list = document.createElement('div');
    const desc = document.createElement('div');
    desc.className = 'bag-desc';
    scr.appendChild(list); scr.appendChild(desc);
    menuLayer.appendChild(scr);

    let idx = 0, qty = 1;
    const render = () => {
      document.getElementById('shop-money').textContent = Game.player.money;
      list.innerHTML = '';
      SHOP_STOCK.forEach((id, i) => {
        const row = document.createElement('div');
        row.className = 'bag-row' + (i === idx ? ' sel' : '');
        const q = i === idx ? ` x${qty} = $${ITEMS[id].price * qty}` : '';
        row.innerHTML = `<span>${itemIconHtml(id)}${ITEMS[id].name}</span><span>$${ITEMS[id].price}${q}</span>`;
        list.appendChild(row);
      });
      desc.textContent = ITEMS[SHOP_STOCK[idx]].desc;
    };
    render();
    try {
      while (true) {
        const k = await Input.waitButton('up', 'down', 'left', 'right', 'a', 'b', 'start');
        if (k === 'up') { idx = (idx - 1 + SHOP_STOCK.length) % SHOP_STOCK.length; qty = 1; Sfx.cursor(); render(); }
        else if (k === 'down') { idx = (idx + 1) % SHOP_STOCK.length; qty = 1; Sfx.cursor(); render(); }
        else if (k === 'left') { qty = Math.max(1, qty - 1); Sfx.cursor(); render(); }
        else if (k === 'right') { qty = Math.min(99, qty + 1); Sfx.cursor(); render(); }
        else if (k === 'b') { Sfx.cancel(); return; }
        else if (k === 'a' || k === 'start') {
          const id = SHOP_STOCK[idx];
          const cost = ITEMS[id].price * qty;
          if (Game.player.money < cost) { Sfx.cancel(); toast('Not enough money!'); continue; }
          Game.player.money -= cost;
          Game.player.bag[id] = (Game.player.bag[id] || 0) + qty;
          Sfx.buy(); toast(`Bought ${qty} ${ITEMS[id].name}!`);
          qty = 1; render();
        }
      }
    } finally {
      scr.remove();
    }
  }

  // ----- starter choice -----
  async function starterChoice() {
    const ids = ['bulbasaur', 'charmander', 'squirtle'];
    const scr = document.createElement('div');
    scr.className = 'full-screen';
    scr.innerHTML = `<div class="fs-title" style="text-align:center;margin-top:20px">CHOOSE YOUR PARTNER!</div>
      <div id="starter-row"></div>
      <div class="fs-foot">LEFT/RIGHT: browse &nbsp; Z: choose &nbsp; X/ESC: back</div>`;
    menuLayer.appendChild(scr);
    const row = scr.querySelector('#starter-row');
    const cards = ids.map(id => {
      const sp = SPECIES[id];
      const card = document.createElement('div');
      card.className = 'starter-card';
      card.appendChild(creatureThumb(id, 96));
      const t = sp.types[0];
      card.insertAdjacentHTML('beforeend',
        `<div class="sc-name">${sp.name}</div>
         <div class="sc-type" style="background:${TYPES[t].color}">${t}</div>
         <div class="sc-blurb">${sp.blurb}</div>`);
      row.appendChild(card);
      return card;
    });
    let idx = 1;
    const paint = () => cards.forEach((c, i) => c.classList.toggle('sel', i === idx));
    paint();
    try {
      while (true) {
        const k = await Input.waitButton('left', 'right', 'a', 'b', 'start');
        if (k === 'left') { idx = (idx + 2) % 3; Sfx.cursor(); paint(); }
        else if (k === 'right') { idx = (idx + 1) % 3; Sfx.cursor(); paint(); }
        else if (k === 'b') { Sfx.cancel(); return null; }
        else { Sfx.select(); return ids[idx]; }
      }
    } finally {
      scr.remove();
    }
  }

  // ----- save / import modals -----
  function saveModal(code) {
    return new Promise((resolve) => {
      const scr = document.createElement('div');
      scr.className = 'full-screen save-modal';
      scr.innerHTML = `<div class="fs-title">SAVE CODE</div>
        <div style="font-size:10px;line-height:1.8;color:#b8c4cc;margin-bottom:10px">
          Copy this code somewhere safe. Use IMPORT CODE on the title screen to restore.<br>
          (Also saved to this browser.)</div>
        <textarea readonly></textarea>
        <div class="modal-btns">
          <button id="sm-copy">COPY</button>
          <button id="sm-close">CLOSE</button>
        </div>
        <div class="fs-foot">X: close</div>`;
      const ta = scr.querySelector('textarea');
      ta.value = code;
      menuLayer.appendChild(scr);
      ta.focus(); ta.select();
      const unsub = Input.listen(['b'], () => done());
      function done() {
        unsub();
        Sfx.cancel();
        scr.remove();
        resolve();
      }
      scr.querySelector('#sm-copy').onclick = () => {
        ta.focus(); ta.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { /* fall through */ }
        if (!ok && navigator.clipboard) navigator.clipboard.writeText(code).then(() => {}, () => {});
        Sfx.select();
        toast('Copied to clipboard!');
      };
      scr.querySelector('#sm-close').onclick = done;
    });
  }

  function importModal() {
    return new Promise((resolve) => {
      const scr = document.createElement('div');
      scr.className = 'full-screen save-modal';
      scr.innerHTML = `<div class="fs-title">IMPORT SAVE CODE</div>
        <div style="font-size:10px;line-height:1.8;color:#b8c4cc;margin-bottom:10px">
          Paste your save code below, then press LOAD.</div>
        <textarea></textarea>
        <div class="modal-btns">
          <button id="im-load">LOAD</button>
          <button id="im-cancel">CANCEL</button>
        </div>
        <div class="fs-foot">ESC: cancel</div>`;
      const ta = scr.querySelector('textarea');
      menuLayer.appendChild(scr);
      ta.focus();
      const done = (val) => {
        unsub();
        scr.remove();
        resolve(val);
      };
      const unsub = Input.listen(['b'], () => { Sfx.cancel(); done(null); });
      scr.querySelector('#im-load').onclick = () => {
        const code = ta.value.trim();
        if (!code) { Sfx.cancel(); toast('Paste a save code first!'); ta.focus(); return; }
        Sfx.select();
        done(code);
      };
      scr.querySelector('#im-cancel').onclick = () => { Sfx.cancel(); done(null); };
    });
  }

  return {
    init, say, sayLines, setPrompt, hideDialog, choose, yesNo, toast,
    fadeOut, fadeIn, flashScreen,
    setBox, setStatusChip, setEnemyBalls, hideBoxes, animateHp, animateExp,
    moveMenu, partyScreen, bagScreen, shopScreen, starterChoice,
    saveModal, importModal,
  };
})();
