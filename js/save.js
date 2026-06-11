// ===== WILDVALE — save / load (browser slot + portable save code) =====
const SaveSys = (() => {
  const SLOT = 'wildvale_save_v2';
  const MAGIC = 'WV2';

  function snapshot() {
    return {
      v: 1,
      player: Game.player,
    };
  }

  // Portable save code: MAGIC + base64(JSON), unicode-safe.
  function exportCode() {
    const json = JSON.stringify(snapshot());
    return MAGIC + btoa(unescape(encodeURIComponent(json)));
  }

  function decode(code) {
    // tolerate line-wraps / stray whitespace from pasting
    code = (code || '').replace(/\s+/g, '');
    if (!code.startsWith(MAGIC)) throw new Error('bad magic');
    const json = decodeURIComponent(escape(atob(code.slice(MAGIC.length))));
    const data = JSON.parse(json);
    if (!data.player || !Array.isArray(data.player.party)) throw new Error('bad shape');
    return data;
  }

  function applyLoaded(data) {
    for (const c of data.player.party.concat(data.player.vault || [])) {
      if (!SPECIES[c.species]) throw new Error('unknown species in save: ' + c.species);
    }
    Game.player = data.player;
    // Re-derive computed stats in case data predates formula tweaks.
    for (const c of Game.player.party) {
      const hpFrac = c.maxHp ? c.hp / c.maxHp : 1;
      calcStats(c);
      c.hp = Math.min(c.maxHp, Math.max(0, Math.round(c.maxHp * hpFrac)));
    }
  }

  function toLocal() {
    try { localStorage.setItem(SLOT, exportCode()); return true; }
    catch (e) { return false; }
  }

  function hasLocal() {
    try { return !!localStorage.getItem(SLOT); } catch (e) { return false; }
  }

  function fromLocal() {
    const code = localStorage.getItem(SLOT);
    if (!code) return false;
    applyLoaded(decode(code));
    return true;
  }

  function fromCode(code) {
    applyLoaded(decode(code)); // throws on invalid input
    return true;
  }

  return { exportCode, toLocal, hasLocal, fromLocal, fromCode };
})();
