// ===== WILDVALE — Web Audio sound effects =====
// All sounds are synthesized; no audio assets. Toggle with M.
const Sfx = (() => {
  let ctx = null;
  let enabled = true;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Basic oscillator tone. slide = target frequency to glide to over dur.
  function tone(freq, dur, type = 'square', vol = 0.06, when = 0, slide = 0) {
    if (!enabled) return;
    const a = ac(); if (!a) return;
    const t = a.currentTime + when;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.linearRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(a.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }

  // White-noise burst for impacts.
  function noise(dur, vol = 0.1, when = 0, lowpass = 0) {
    if (!enabled) return;
    const a = ac(); if (!a) return;
    const t = a.currentTime + when;
    const len = Math.max(1, Math.floor(a.sampleRate * dur));
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = a.createBufferSource();
    src.buffer = buf;
    const g = a.createGain();
    g.gain.setValueAtTime(vol, t);
    let node = src;
    if (lowpass) {
      const f = a.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = lowpass;
      src.connect(f); node = f;
    }
    node.connect(g); g.connect(a.destination);
    src.start(t);
  }

  function jingle(notes, step = 0.11, type = 'square', vol = 0.06) {
    notes.forEach((n, i) => tone(n, step * 0.92, type, vol, i * step));
  }

  return {
    toggle() { enabled = !enabled; return enabled; },
    isOn() { return enabled; },
    unlock() { ac(); },

    blip()      { tone(900, 0.025, 'square', 0.018); },          // typewriter tick
    cursor()    { tone(540, 0.045, 'square', 0.04); },           // menu move
    select()    { tone(740, 0.07, 'square', 0.05); },            // confirm
    cancel()    { tone(360, 0.07, 'square', 0.04); },            // back
    bump()      { tone(120, 0.06, 'triangle', 0.05); },          // wall bump
    door()      { tone(300, 0.12, 'triangle', 0.06, 0, 180); },

    hit()       { noise(0.13, 0.12, 0, 1800); },
    superHit()  { noise(0.2, 0.16, 0, 1200); tone(120, 0.22, 'sawtooth', 0.08); },
    weakHit()   { noise(0.08, 0.06, 0, 2600); },
    statusFx()  { tone(330, 0.16, 'sine', 0.06, 0, 180); },
    statUp()    { jingle([392, 523, 659], 0.07, 'square', 0.05); },
    statDown()  { jingle([659, 523, 392], 0.07, 'square', 0.05); },
    faint()     { tone(420, 0.45, 'sawtooth', 0.09, 0, 55); },
    heal()      { jingle([523, 659, 784, 1047], 0.1); },
    levelUp()   { jingle([523, 659, 784, 1047, 1319], 0.09); },
    evolve()    { jingle([392, 494, 587, 784, 988, 1175], 0.12, 'triangle', 0.07); },
    expTick()   { tone(1100, 0.03, 'square', 0.02); },

    thrown()    { tone(420, 0.25, 'sine', 0.06, 0, 980); },
    shake()     { tone(620, 0.05, 'square', 0.09); tone(340, 0.1, 'square', 0.07, 0.06); },
    catchClick(){ tone(1250, 0.1, 'square', 0.07); tone(620, 0.18, 'square', 0.05, 0.08); },
    breakout()  { noise(0.16, 0.12, 0, 2000); tone(500, 0.15, 'square', 0.05, 0, 300); },
    caught()    { jingle([784, 784, 880, 1047, 1319], 0.12); },

    run()       { noise(0.22, 0.07, 0, 900); },
    encounter() { tone(220, 0.1, 'sawtooth', 0.07); tone(220, 0.1, 'sawtooth', 0.07, 0.13); },
    // Title-screen dragon roar: layered descending growls + a breathy rumble.
    roar() {
      tone(170, 0.75, 'sawtooth', 0.12, 0, 52);
      tone(96, 0.85, 'sawtooth', 0.1, 0.05, 38);
      tone(250, 0.3, 'square', 0.05, 0, 120);
      noise(0.8, 0.09, 0.05, 600);
      noise(0.35, 0.06, 0.55, 300);
    },
    badge()     { jingle([523, 659, 784, 659, 784, 1047, 1319], 0.13, 'triangle', 0.08); },
    buy()       { jingle([880, 1175], 0.08); },
  };
})();
