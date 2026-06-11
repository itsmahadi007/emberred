// ===== Battle system (Gen-3-style mechanics) =====

const STAGE_NAMES = {
  atk: 'Attack', def: 'Defense', spa: 'Sp. Atk', spd: 'Sp. Def', spe: 'Speed',
  acc: 'accuracy', eva: 'evasiveness',
};

function stageMul(s) { return s >= 0 ? (2 + s) / 2 : 2 / (2 - s); }
function accStageMul(s) { return s >= 0 ? (3 + s) / 3 : 3 / (3 - s); }
function freshStages() { return { atk: 0, def: 0, spa: 0, spd: 0, spe: 0, acc: 0, eva: 0 }; }
function freshVolatiles() { return { flinch: false, confuse: 0, seeded: false }; }

// Gen 3 damage formula: ((2L/5+2) * Power * A/D) / 50 + 2, then
// crit x2, STAB x1.5, type effectiveness, random 85-100%.
function calcDamage(user, target, move, uStages, tStages, crit) {
  const phys = move.cat === 'phys';
  let aStage = uStages[phys ? 'atk' : 'spa'];
  let dStage = tStages[phys ? 'def' : 'spd'];
  if (crit) { aStage = Math.max(0, aStage); dStage = Math.min(0, dStage); }
  let A = Math.floor((phys ? user.atk : user.spa) * stageMul(aStage));
  let D = Math.max(1, Math.floor((phys ? target.def : target.spd) * stageMul(dStage)));
  if (phys && user.status === 'BRN') A = Math.max(1, Math.floor(A / 2));
  let dmg = Math.floor(Math.floor(Math.floor(2 * user.level / 5 + 2) * move.power * A / D) / 50) + 2;
  if (crit) dmg *= 2;
  if (creatureTypes(user).includes(move.type)) dmg = Math.floor(dmg * 1.5);
  dmg = Math.floor(dmg * typeEffectiveness(move.type, creatureTypes(target)));
  dmg = Math.floor(dmg * randInt(85, 100) / 100);
  return Math.max(1, dmg);
}

// Confusion self-hit: 40-power typeless physical against own Defense.
function confusionSelfDamage(c) {
  const dmg = Math.floor(Math.floor(Math.floor(2 * c.level / 5 + 2) * 40 * c.atk / Math.max(1, c.def)) / 50) + 2;
  return Math.max(1, Math.floor(dmg * randInt(85, 100) / 100));
}

// Effective speed for turn order (paralysis quarters it).
function battleSpeed(c, stages) {
  let s = Math.floor(c.spe * stageMul(stages.spe));
  if (c.status === 'PAR') s = Math.floor(s / 4);
  return s;
}

function pickMultiHits(multi) {
  if (multi === 2) return 2;
  // Gen 3 distribution: 2 (3/8), 3 (3/8), 4 (1/8), 5 (1/8)
  const r = randInt(1, 8);
  if (r <= 3) return 2;
  if (r <= 6) return 3;
  if (r === 7) return 4;
  return 5;
}

const Battle = {
  active: null,
  // opts: { wild: creature } | { trainer: trainerDef }  ->  'win'|'lose'|'ran'|'catch'
  async start(opts) {
    const session = new BattleSession(opts);
    Battle.active = session;
    const result = await session.run();
    Battle.active = null;
    return result;
  },
};

class BattleSession {
  constructor(opts) {
    this.wild = !!opts.wild;
    this.trainer = opts.trainer || null;
    this.party = Game.player.party;
    if (this.wild) {
      this.enemyParty = [opts.wild];
    } else {
      this.enemyParty = this.trainer.party.map(([sp, lv]) => makeCreature(sp, lv));
    }
    this.enemyIdx = 0;
    this.playerIdx = this.party.findIndex(c => c.hp > 0);
    this.pStages = freshStages();
    this.eStages = freshStages();
    this.vol = { player: freshVolatiles(), enemy: freshVolatiles() };
    this.runAttempts = 0;
    this.participants = new Set();
    this.evoQueue = [];
    this.over = false;
    this.result = null;
    // canvas scene state (96px sprites = exact 2x of the 96px sources)
    this.fx = {
      p: { x: 18, y: 32, vis: false, flash: 0, dy: 0 },
      e: { x: 124, y: -6, vis: false, flash: 0, dy: 0, scale: 1 },
      orb: { x: 0, y: 0, vis: false, rot: 0 },
    };
    this.particles = [];
    this.shake = 0;
  }

  // ---------- per-type hit effects ----------
  impactFx(moveType, targetSide, typeMult) {
    const fx = targetSide === 'enemy' ? this.fx.e : this.fx.p;
    const cx = fx.x + 48, cy = fx.y + fx.dy + 52;
    this.spawnEffect(moveType, cx, cy);
    this.shake = Math.max(this.shake, typeMult > 1 ? 14 : 9);
  }

  spawnEffect(type, cx, cy) {
    const P = this.particles;
    const add = (n, make) => { for (let i = 0; i < n; i++) P.push(make(i)); };
    const r = (a, b) => a + Math.random() * (b - a);
    switch (type) {
      case 'FIRE':
        add(16, () => ({ kind: 'rect', x: cx + r(-14, 14), y: cy + r(-6, 10), vx: r(-0.5, 0.5), vy: r(-1.8, -0.6), g: -0.01,
          life: r(18, 30), age: 0, size: r(2, 4), color: ['#f86830', '#f8a838', '#f8d030'][randInt(0, 2)] }));
        break;
      case 'WATER': case 'ICE':
        add(16, () => ({ kind: 'rect', x: cx + r(-12, 12), y: cy + r(-12, 0), vx: r(-1.4, 1.4), vy: r(-2.2, -0.6), g: 0.16,
          life: r(20, 32), age: 0, size: r(2, 3), color: ['#4890e8', '#78c0f8', '#d8f0ff'][randInt(0, 2)] }));
        break;
      case 'ELECTRIC':
        add(10, () => ({ kind: 'streak', x: cx + r(-16, 16), y: cy + r(-16, 16), vx: r(-2.5, 2.5), vy: r(-2.5, 2.5), g: 0,
          life: r(8, 14), age: 0, size: r(5, 9), color: ['#f8d030', '#fff8a0'][randInt(0, 1)] }));
        break;
      case 'GRASS': case 'BUG':
        add(14, () => ({ kind: 'rect', x: cx + r(-16, 16), y: cy + r(-14, 2), vx: r(-0.8, 0.8), vy: r(0.2, 1.1), g: 0.01,
          life: r(22, 36), age: 0, size: r(2, 3), color: ['#58b84c', '#88d870', '#c8e858'][randInt(0, 2)] }));
        break;
      case 'POISON':
        add(12, () => ({ kind: 'ring', x: cx + r(-12, 12), y: cy + r(-4, 10), vx: r(-0.3, 0.3), vy: r(-1.2, -0.4), g: 0,
          life: r(20, 30), age: 0, size: r(2, 5), color: ['#a040a0', '#c878c8'][randInt(0, 1)] }));
        break;
      case 'PSYCHIC':
        add(4, (i) => ({ kind: 'ring', x: cx, y: cy, vx: 0, vy: 0, g: 0, grow: 1.2,
          life: 18 + i * 4, age: 0, size: 3, color: ['#f85888', '#f8a8c8'][i % 2] }));
        break;
      case 'GROUND': case 'ROCK': case 'STEEL':
        add(12, () => ({ kind: 'rect', x: cx + r(-14, 14), y: cy + r(-6, 6), vx: r(-1.6, 1.6), vy: r(-2.6, -1), g: 0.22,
          life: r(18, 28), age: 0, size: r(2, 4), color: ['#b8a038', '#8a8278', '#d8d0c0'][randInt(0, 2)] }));
        break;
      case 'GHOST': case 'DARK':
        add(10, () => ({ kind: 'ring', x: cx + r(-14, 14), y: cy + r(-8, 8), vx: r(-0.4, 0.4), vy: r(-0.9, -0.2), g: 0,
          life: r(24, 36), age: 0, size: r(2, 5), color: ['#705898', '#483868'][randInt(0, 1)] }));
        break;
      case 'DRAGON':
        add(14, () => ({ kind: 'rect', x: cx + r(-16, 16), y: cy + r(-16, 16), vx: r(-1.5, 1.5), vy: r(-1.5, 1.5), g: 0,
          life: r(14, 24), age: 0, size: r(2, 3), color: ['#7038f8', '#58c8e8'][randInt(0, 1)] }));
        break;
      case 'CAUGHT_STARS':
        add(8, (i) => ({ kind: 'rect', x: cx, y: cy, vx: Math.cos(i * Math.PI / 4) * 1.6, vy: Math.sin(i * Math.PI / 4) * 1.6 - 0.8, g: 0.06,
          life: 26, age: 0, size: 3, color: ['#f8d030', '#fff8b0'][i % 2] }));
        break;
      case 'BALL_BREAK':
        // white pop flash + red/white shell fragments flying apart
        add(6, (i) => ({ kind: 'ring', x: cx, y: cy, vx: 0, vy: 0, g: 0, grow: 1.8,
          life: 10 + i * 2, age: 0, size: 2, color: '#ffffff' }));
        add(12, (i) => ({ kind: 'rect', x: cx, y: cy,
          vx: Math.cos(i * Math.PI / 6) * r(1.4, 2.4), vy: Math.sin(i * Math.PI / 6) * r(1.4, 2.4) - 1, g: 0.12,
          life: r(16, 26), age: 0, size: r(2, 4), color: i % 2 ? '#e04838' : '#f0f0f0' }));
        break;
      default: // NORMAL, FLYING, FIGHTING - white slash streaks
        add(5, (i) => ({ kind: 'streak', x: cx - 14 + i * 7, y: cy - 14 + i * 5, vx: 2.2, vy: 1.6, g: 0,
          life: 10, age: 0, size: 10, color: '#ffffff' }));
        add(6, () => ({ kind: 'rect', x: cx + r(-10, 10), y: cy + r(-10, 10), vx: r(-1, 1), vy: r(-1, 1), g: 0,
          life: r(10, 16), age: 0, size: 2, color: '#f0f0f0' }));
    }
  }

  drawParticles(ctx) {
    const P = this.particles;
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      p.age++;
      if (p.age >= p.life) { P.splice(i, 1); continue; }
      p.x += p.vx; p.y += p.vy; p.vy += p.g || 0;
      const fade = 1 - p.age / p.life;
      ctx.globalAlpha = Math.max(0.15, fade);
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;
      if (p.kind === 'rect') {
        ctx.fillRect(p.x, p.y, p.size, p.size);
      } else if (p.kind === 'ring') {
        const rad = p.grow ? p.size + p.age * p.grow : p.size;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, Math.PI * 2); ctx.stroke();
      } else if (p.kind === 'streak') {
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx * p.size, p.y + p.vy * p.size); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  get active() { return this.party[this.playerIdx]; }
  get enemy() { return this.enemyParty[this.enemyIdx]; }

  battlerName(side, c) {
    return (side === 'enemy' && this.wild ? 'Wild ' : '') + creatureName(c);
  }

  // ---------- main flow ----------
  async run() {
    Game.mode = 'battle';
    Sfx.encounter();
    await UI.flashScreen(3);
    await UI.fadeOut(250);
    await UI.fadeIn(200);

    // slide in
    this.fx.e.vis = true; this.fx.e.x = 260;
    this.tween(this.fx.e, 'x', 124, 450);
    if (this.wild) {
      await UI.say(`A wild ${creatureName(this.enemy)} appeared!`);
      if (this.enemy.shiny) {
        Sfx.statUp();
        this.spawnEffect('CAUGHT_STARS', this.fx.e.x + 48, this.fx.e.y + 40);
        await UI.say("Whoa... its colors are different. It's SHINY!");
      }
    } else {
      await UI.say(`${this.trainer.name} wants to battle!`);
      await UI.say(`${this.trainer.name} sent out ${creatureName(this.enemy)}!`);
    }
    UI.setBox('enemy', this.enemy);
    UI.setEnemyBalls(this.wild ? null : this.enemyParty);

    await UI.say(`Go! ${creatureName(this.active)}!`);
    this.fx.p.vis = true; this.fx.p.x = -110;
    await this.tween(this.fx.p, 'x', 18, 350);
    UI.setBox('player', this.active);
    this.participants.add(this.active.uid);

    while (!this.over) {
      await this.turn();
    }

    // post-battle evolutions (from battle EXP)
    await this.handleEvolutions();

    UI.hideBoxes();
    UI.hideDialog();
    Game.mode = 'overworld';
    Input.clearPressed();
    return this.result;
  }

  async turn() {
    const action = await this.playerAction();

    if (action.kind === 'run') {
      if (await this.tryRun()) return;
      await this.enemyTurnOnly();
      return;
    }
    if (action.kind === 'switch') {
      await this.doSwitch(action.idx);
      await this.enemyTurnOnly();
      return;
    }
    if (action.kind === 'item') {
      await this.useBagItem(action.id, action.target);
      await this.enemyTurnOnly();
      return;
    }
    if (action.kind === 'orb') {
      const caught = await this.throwOrb(action.id);
      if (caught) return;
      await this.enemyTurnOnly();
      return;
    }

    // FIGHT: resolve both moves in speed/priority order.
    const pMove = action.struggle ? MOVES.struggle : MOVES[this.active.moves[action.moveIdx].id];
    const pSlot = action.struggle ? null : this.active.moves[action.moveIdx];
    const eSlot = this.enemyMoveChoice();
    const eMove = eSlot ? MOVES[eSlot.id] : MOVES.struggle;

    const pPrio = pMove.prio || 0, ePrio = eMove.prio || 0;
    let playerFirst;
    if (pPrio !== ePrio) playerFirst = pPrio > ePrio;
    else {
      const ps = battleSpeed(this.active, this.pStages);
      const es = battleSpeed(this.enemy, this.eStages);
      playerFirst = ps === es ? Math.random() < 0.5 : ps > es;
    }

    const order = playerFirst
      ? [['player', pMove, pSlot], ['enemy', eMove, eSlot]]
      : [['enemy', eMove, eSlot], ['player', pMove, pSlot]];

    for (const [side, move, slot] of order) {
      if (this.over) return;
      const user = side === 'player' ? this.active : this.enemy;
      if (user.hp <= 0) continue;
      await this.useMove(side, move, slot);
      if (await this.resolveFaints()) return;
    }

    await this.endOfTurn();
  }

  async enemyTurnOnly() {
    if (this.over || this.enemy.hp <= 0) return;
    const slot = this.enemyMoveChoice();
    await this.useMove('enemy', slot ? MOVES[slot.id] : MOVES.struggle, slot);
    if (await this.resolveFaints()) return;
    await this.endOfTurn();
  }

  // ---------- player action selection ----------
  async playerAction() {
    while (true) {
      UI.setPrompt(`What will ${creatureName(this.active)} do?`);
      const a = await UI.choose(['FIGHT', 'BAG', 'SWITCH', 'RUN'], {
        cols: 2, canCancel: false,
        style: { right: '10px', bottom: '10px', width: '290px', height: '108px', padding: '20px 18px' },
      });

      if (a === 0) { // FIGHT
        if (this.active.moves.every(m => m.pp <= 0)) {
          await UI.say(`${creatureName(this.active)} has no moves left!`);
          return { kind: 'fight', struggle: true };
        }
        const mi = await UI.moveMenu(this.active);
        if (mi === -1) continue;
        return { kind: 'fight', moveIdx: mi };
      }
      if (a === 1) { // BAG
        const id = await UI.bagScreen({ inBattle: true });
        if (!id) continue;
        if (ITEMS[id].kind === 'orb') {
          if (!this.wild) {
            await UI.say("You can't capture another trainer's partner!");
            continue;
          }
          return { kind: 'orb', id };
        }
        const t = await UI.partyScreen({ title: 'Use on which team member?' });
        if (t === -1) continue;
        if (!this.itemWouldWork(id, this.party[t])) {
          await UI.say("It won't have any effect.");
          continue;
        }
        return { kind: 'item', id, target: t };
      }
      if (a === 2) { // SWITCH
        const idx = await UI.partyScreen({ title: 'Switch to which team member?' });
        if (idx === -1) continue;
        if (idx === this.playerIdx) { await UI.say(`${creatureName(this.active)} is already in battle!`); continue; }
        if (this.party[idx].hp <= 0) { await UI.say(`${creatureName(this.party[idx])} has no energy left to battle!`); continue; }
        return { kind: 'switch', idx };
      }
      return { kind: 'run' };
    }
  }

  itemWouldWork(id, c) {
    const it = ITEMS[id];
    if (c.hp <= 0) return false;
    if (it.kind === 'heal') return c.hp < c.maxHp;
    if (it.kind === 'cure') return c.status && (it.cures.includes('ALL') || it.cures.includes(c.status));
    return false;
  }

  async useBagItem(id, targetIdx) {
    const it = ITEMS[id];
    const c = this.party[targetIdx];
    Game.player.bag[id]--;
    if (it.kind === 'heal') {
      const from = c.hp;
      c.hp = Math.min(c.maxHp, c.hp + it.amount);
      Sfx.heal();
      await UI.say(`${creatureName(c)} recovered ${c.hp - from} HP!`, { noWait: true, keep: true });
      if (targetIdx === this.playerIdx) await UI.animateHp('player', from, c.hp, c.maxHp);
      await wait(300);
      UI.hideDialog();
    } else {
      const txt = STATUS_INFO[c.status] ? STATUS_INFO[c.status].text : 'unwell';
      c.status = null; c.sleepTurns = 0;
      Sfx.heal();
      if (targetIdx === this.playerIdx) UI.setStatusChip('player', null);
      await UI.say(`${creatureName(c)} is no longer ${txt}!`);
    }
  }

  // ---------- switching ----------
  async doSwitch(idx, recallMsg = true) {
    if (recallMsg && this.active && this.active.hp > 0) {
      await UI.say(`${creatureName(this.active)}, come back!`);
    }
    this.fx.p.vis = false;
    this.playerIdx = idx;
    this.pStages = freshStages();
    this.vol.player = freshVolatiles();
    await UI.say(`Go! ${creatureName(this.active)}!`);
    this.fx.p.vis = true; this.fx.p.x = -110; this.fx.p.dy = 0;
    await this.tween(this.fx.p, 'x', 18, 300);
    UI.setBox('player', this.active);
    if (this.enemy.hp > 0) this.participants.add(this.active.uid);
  }

  // ---------- running ----------
  async tryRun() {
    if (!this.wild) {
      await UI.say("No! There's no running from a trainer battle!");
      return false; // counts as the player's turn anyway (enemy attacks)
    }
    this.runAttempts++;
    const ps = battleSpeed(this.active, this.pStages);
    const es = Math.max(1, battleSpeed(this.enemy, this.eStages));
    const f = Math.floor(ps * 128 / es) + 30 * this.runAttempts;
    if (f > 255 || randInt(0, 255) < f) {
      Sfx.run();
      await UI.say('Got away safely!');
      this.over = true; this.result = 'ran';
      return true;
    }
    await UI.say("Can't escape!");
    return false;
  }

  // ---------- enemy AI ----------
  enemyMoveChoice() {
    const usable = this.enemy.moves.filter(m => m.pp > 0);
    if (!usable.length) return null; // struggle
    const damaging = usable.filter(m => MOVES[m.id].power > 0);
    const superEff = damaging.filter(m =>
      typeEffectiveness(MOVES[m.id].type, creatureTypes(this.active)) > 1);
    if (superEff.length && Math.random() < 0.6) return superEff[randInt(0, superEff.length - 1)];
    return usable[randInt(0, usable.length - 1)];
  }

  // ---------- move execution ----------
  async useMove(side, move, slot) {
    const user = side === 'player' ? this.active : this.enemy;
    const target = side === 'player' ? this.enemy : this.active;
    const targetSide = side === 'player' ? 'enemy' : 'player';
    const uStages = side === 'player' ? this.pStages : this.eStages;
    const tStages = side === 'player' ? this.eStages : this.pStages;
    const uVol = this.vol[side];
    const name = this.battlerName(side, user);

    // Pre-move status / volatile checks
    if (user.status === 'SLP') {
      user.sleepTurns--;
      if (user.sleepTurns > 0) {
        Sfx.statusFx();
        await UI.say(`${name} is fast asleep.`);
        return;
      }
      user.status = null;
      UI.setStatusChip(side, null);
      await UI.say(`${name} woke up!`);
    }
    if (user.status === 'FRZ') {
      if (Math.random() < 0.2) {
        user.status = null;
        UI.setStatusChip(side, null);
        await UI.say(`${name} thawed out!`);
      } else {
        Sfx.statusFx();
        await UI.say(`${name} is frozen solid!`);
        return;
      }
    }
    if (uVol.flinch) {
      uVol.flinch = false;
      Sfx.statusFx();
      await UI.say(`${name} flinched and couldn't move!`);
      return;
    }
    if (uVol.confuse > 0) {
      uVol.confuse--;
      if (uVol.confuse === 0) {
        await UI.say(`${name} snapped out of its confusion!`);
      } else {
        Sfx.statusFx();
        await UI.say(`${name} is confused!`);
        if (Math.random() < 0.5) {
          const dmg = confusionSelfDamage(user);
          const from = user.hp;
          user.hp = Math.max(0, user.hp - dmg);
          Sfx.hit();
          const fx = side === 'player' ? this.fx.p : this.fx.e;
          fx.flash = 14;
          await UI.say('It hurt itself in its confusion!', { noWait: true, keep: true });
          await UI.animateHp(side, from, user.hp, user.maxHp);
          UI.hideDialog();
          return;
        }
      }
    }
    if (user.status === 'PAR' && Math.random() < 0.25) {
      Sfx.statusFx();
      await UI.say(`${name} is fully paralyzed!`);
      return;
    }

    if (slot) slot.pp = Math.max(0, slot.pp - 1);
    await UI.say(`${name} used ${move.name}!`, { noWait: true, keep: true });
    await wait(350);

    // Accuracy check (with accuracy/evasion stages)
    if (move.acc !== true) {
      const stage = Math.max(-6, Math.min(6, uStages.acc - tStages.eva));
      const chance = move.acc * accStageMul(stage);
      if (randInt(1, 100) > chance) {
        await UI.say(`${name}'s attack missed!`);
        return;
      }
    }

    if (move.cat === 'status') {
      if (move.special === 'leechseed') {
        await this.applyLeechSeed(targetSide, target);
      } else {
        await this.applyEffect(side, move.effect, user, target, uStages, tStages);
      }
      UI.hideDialog();
      return;
    }

    // Damaging move
    const typeMult = typeEffectiveness(move.type, creatureTypes(target));
    if (typeMult === 0) {
      await UI.say(`It doesn't affect ${creatureName(target)}...`);
      return;
    }

    const atkFx = side === 'player' ? this.fx.p : this.fx.e;
    const defFx = side === 'player' ? this.fx.e : this.fx.p;
    const dir = side === 'player' ? 1 : -1;

    // Super Fang: fixed damage, no crit/STAB/type math beyond immunity.
    if (move.special === 'superfang') {
      const dmg = Math.max(1, Math.floor(target.hp / 2));
      await this.tween(atkFx, 'x', atkFx.x + 14 * dir, 90);
      this.tween(atkFx, 'x', atkFx.x - 14 * dir, 140);
      defFx.flash = 18;
      this.impactFx(move.type, targetSide, 1);
      Sfx.hit();
      const from = target.hp;
      target.hp = Math.max(0, target.hp - dmg);
      await UI.animateHp(targetSide, from, target.hp, target.maxHp);
      UI.hideDialog();
      return;
    }

    const hits = move.multi ? pickMultiHits(move.multi) : 1;
    let landed = 0;
    let lastCrit = false;
    for (let h = 0; h < hits && target.hp > 0; h++) {
      const crit = Math.random() < (move.hiCrit ? 1 / 8 : 1 / 16);
      const dmg = calcDamage(user, target, move, uStages, tStages, crit);
      lastCrit = crit;
      await this.tween(atkFx, 'x', atkFx.x + 14 * dir, 90);
      this.tween(atkFx, 'x', atkFx.x - 14 * dir, 140);
      defFx.flash = 18;
      this.impactFx(move.type, targetSide, typeMult);
      if (typeMult > 1) Sfx.superHit(); else if (typeMult < 1) Sfx.weakHit(); else Sfx.hit();
      const from = target.hp;
      target.hp = Math.max(0, target.hp - dmg);
      await UI.animateHp(targetSide, from, target.hp, target.maxHp);
      landed++;
      // per-hit secondary for multi-hit moves with effects (e.g. Twineedle)
      if (move.effect && move.multi && target.hp > 0 && Math.random() < move.effect.chance) {
        await this.applyEffect(side, move.effect, user, target, uStages, tStages);
      }
    }

    if (lastCrit) await UI.say('A critical hit!');
    if (move.multi) await UI.say(`Hit ${landed} time(s)!`);
    if (typeMult > 1) await UI.say("It's super effective!");
    else if (typeMult < 1) await UI.say("It's not very effective...");

    // Fire moves thaw a frozen target.
    if (move.type === 'FIRE' && target.status === 'FRZ' && target.hp > 0) {
      target.status = null;
      UI.setStatusChip(targetSide, null);
      await UI.say(`${creatureName(target)} thawed out!`);
    }

    // Recoil (Struggle)
    if (move.recoil && landed > 0) {
      const rec = Math.max(1, Math.floor(user.maxHp / 8));
      const uFrom = user.hp;
      user.hp = Math.max(0, user.hp - rec);
      await UI.say(`${name} is hit with recoil!`, { noWait: true, keep: true });
      await UI.animateHp(side, uFrom, user.hp, user.maxHp);
      UI.hideDialog();
    }

    // Secondary effect (single-hit moves)
    if (move.effect && !move.multi && target.hp > 0 && Math.random() < move.effect.chance) {
      await this.applyEffect(side, move.effect, user, target, uStages, tStages);
    }
    UI.hideDialog();
  }

  async applyEffect(side, eff, user, target, uStages, tStages) {
    if (!eff) return;
    const targetSide = side === 'player' ? 'enemy' : 'player';
    if (eff.status) {
      await this.inflictStatus(targetSide, target, eff.status);
      return;
    }
    if (eff.volatile === 'flinch') {
      this.vol[targetSide].flinch = true; // silent until it procs
      return;
    }
    if (eff.volatile === 'confuse') {
      if (this.vol[targetSide].confuse > 0 || target.hp <= 0) {
        await UI.say('But it failed!');
        return;
      }
      this.vol[targetSide].confuse = randInt(2, 5);
      Sfx.statusFx();
      await UI.say(`${this.battlerName(targetSide, target)} became confused!`);
      return;
    }
    // stat stage change
    const self = eff.target === 'self';
    const who = self ? user : target;
    const stages = self ? uStages : tStages;
    const stat = eff.stat;
    const cur = stages[stat];
    const next = Math.max(-6, Math.min(6, cur + eff.stages));
    const name = creatureName(who);
    if (next === cur) {
      await UI.say(`${name}'s ${STAGE_NAMES[stat]} won't go any ${eff.stages > 0 ? 'higher' : 'lower'}!`);
      return;
    }
    stages[stat] = next;
    if (eff.stages > 0) Sfx.statUp(); else Sfx.statDown();
    const adv = Math.abs(eff.stages) >= 2 ? 'sharply ' : '';
    await UI.say(`${name}'s ${STAGE_NAMES[stat]} ${adv}${eff.stages > 0 ? 'rose' : 'fell'}!`);
  }

  async applyLeechSeed(targetSide, target) {
    if (creatureTypes(target).includes('GRASS')) {
      await UI.say(`It doesn't affect ${creatureName(target)}...`);
      return;
    }
    if (this.vol[targetSide].seeded) {
      await UI.say('But it failed!');
      return;
    }
    this.vol[targetSide].seeded = true;
    Sfx.statusFx();
    await UI.say(`${this.battlerName(targetSide, target)} was seeded!`);
  }

  async inflictStatus(targetSide, target, status) {
    if (target.status || target.hp <= 0) {
      await UI.say('But it failed!');
      return;
    }
    const types = creatureTypes(target);
    if (status === 'BRN' && types.includes('FIRE')) { await UI.say(`It doesn't affect ${creatureName(target)}...`); return; }
    if (status === 'PSN' && (types.includes('POISON') || types.includes('STEEL'))) { await UI.say(`It doesn't affect ${creatureName(target)}...`); return; }
    target.status = status;
    if (status === 'SLP') target.sleepTurns = randInt(2, 4);
    Sfx.statusFx();
    UI.setStatusChip(targetSide, status);
    await UI.say(`${this.battlerName(targetSide, target)} was ${STATUS_INFO[status].text}!`);
  }

  // ---------- end of turn ----------
  async endOfTurn() {
    if (this.over) return;
    for (const side of ['player', 'enemy']) {
      const c = side === 'player' ? this.active : this.enemy;
      if (c.hp <= 0) continue;
      if (c.status === 'PSN' || c.status === 'BRN') {
        const dmg = Math.max(1, Math.floor(c.maxHp / 8));
        const from = c.hp;
        c.hp = Math.max(0, c.hp - dmg);
        Sfx.statusFx();
        const verb = c.status === 'PSN' ? 'hurt by poison' : 'hurt by its burn';
        await UI.say(`${creatureName(c)} is ${verb}!`, { noWait: true, keep: true });
        await UI.animateHp(side, from, c.hp, c.maxHp);
        UI.hideDialog();
        if (await this.resolveFaints()) return;
      }
      // Leech Seed drain
      if (this.vol[side].seeded && c.hp > 0) {
        const other = side === 'player' ? this.enemy : this.active;
        const dmg = Math.max(1, Math.floor(c.maxHp / 8));
        const from = c.hp;
        c.hp = Math.max(0, c.hp - dmg);
        Sfx.statusFx();
        await UI.say(`${creatureName(c)}'s health is sapped by Leech Seed!`, { noWait: true, keep: true });
        await UI.animateHp(side, from, c.hp, c.maxHp);
        if (other && other.hp > 0) {
          const oFrom = other.hp;
          other.hp = Math.min(other.maxHp, other.hp + dmg);
          await UI.animateHp(side === 'player' ? 'enemy' : 'player', oFrom, other.hp, other.maxHp);
        }
        UI.hideDialog();
        if (await this.resolveFaints()) return;
      }
    }
    this.vol.player.flinch = false;
    this.vol.enemy.flinch = false;
  }

  // Returns true if the battle ended (or flow should stop this turn).
  async resolveFaints() {
    // Enemy faint
    if (this.enemy.hp <= 0 && !this.over) {
      Sfx.faint();
      await this.faintAnim(this.fx.e);
      if (!this.wild) UI.setEnemyBalls(this.enemyParty); // darken the fallen one
      await UI.say(`${this.battlerName('enemy', this.enemy)} fainted!`);
      await this.awardExp();
      const next = this.enemyParty.findIndex(c => c.hp > 0);
      if (!this.wild && next !== -1) {
        this.enemyIdx = next;
        this.eStages = freshStages();
        this.vol.enemy = freshVolatiles();
        this.participants = new Set(this.active.hp > 0 ? [this.active.uid] : []);
        await UI.say(`${this.trainer.name} sent out ${creatureName(this.enemy)}!`);
        this.fx.e.vis = true; this.fx.e.dy = 0; this.fx.e.x = 260; this.fx.e.scale = 1;
        await this.tween(this.fx.e, 'x', 124, 350);
        UI.setBox('enemy', this.enemy);
        UI.setEnemyBalls(this.enemyParty);
      } else {
        if (!this.wild) {
          await UI.say(`You defeated ${this.trainer.name}!`);
          Game.player.money += this.trainer.prize;
          await UI.say(`You got $${this.trainer.prize} for winning!`);
        }
        this.over = true; this.result = 'win';
        return true;
      }
    }
    // Player faint
    if (this.active.hp <= 0 && !this.over) {
      this.active.status = null; this.active.sleepTurns = 0;
      this.vol.player = freshVolatiles();
      Sfx.faint();
      await this.faintAnim(this.fx.p);
      UI.setStatusChip('player', null);
      await UI.say(`${creatureName(this.active)} fainted!`);
      const anyLeft = this.party.some(c => c.hp > 0);
      if (!anyLeft) {
        this.over = true; this.result = 'lose';
        return true;
      }
      let idx;
      do {
        idx = await UI.partyScreen({ title: 'Choose the next team member.', forced: true });
      } while (this.party[idx].hp <= 0);
      await this.doSwitch(idx, false);
      return true; // faint interrupts remaining actions this turn
    }
    return this.over;
  }

  async faintAnim(fx) {
    await this.tween(fx, 'dy', 30, 250);
    fx.vis = false;
    fx.dy = 0;
  }

  // ---------- EXP / levels ----------
  // Later-gen style EXP Share: every able party member earns experience —
  // battle participants get the full amount, benchwarmers get half.
  async awardExp() {
    if (this.enemyIsCaught) return;
    const sp = SPECIES[this.enemy.species];
    let base = Math.floor(sp.expYield * this.enemy.level / 7);
    if (!this.wild) base = Math.floor(base * 1.5);
    base = Math.max(1, base);
    for (const c of this.party) {
      if (c.hp <= 0 || c.level >= 100) continue;
      const amount = this.participants.has(c.uid) ? base : Math.max(1, Math.floor(base / 2));
      await this.gainExp(c, amount);
    }
  }

  async gainExp(c, amount) {
    if (c.level >= 100) return;
    Sfx.expTick();
    await UI.say(`${creatureName(c)} gained ${amount} EXP. Points!`);
    const isActive = c === this.active;
    while (c.level < 100) {
      const next = expForLevel(c.level + 1);
      if (c.exp + amount < next) {
        c.exp += amount;
        amount = 0;
        if (isActive) await UI.animateExp(0, expProgress(c));
        break;
      }
      amount -= (next - c.exp);
      c.exp = next;
      if (isActive) await UI.animateExp(expProgress(c), 1);
      await this.levelUp(c);
    }
  }

  async levelUp(c) {
    c.level++;
    const oldMax = c.maxHp;
    calcStats(c);
    c.hp = Math.min(c.maxHp, c.hp + (c.maxHp - oldMax));
    Sfx.levelUp();
    if (c === this.active) UI.setBox('player', this.active);
    await UI.say(`${creatureName(c)} grew to Lv${c.level}!`);
    // new moves at this level
    const sp = SPECIES[c.species];
    for (const entry of sp.learnset.filter(e => e.lv === c.level)) {
      await this.learnMove(c, entry.move);
    }
    // queue evolution
    if (sp.evolve && c.level >= sp.evolve.at && !this.evoQueue.includes(c)) {
      this.evoQueue.push(c);
    }
  }

  async learnMove(c, moveId) {
    if (c.moves.some(m => m.id === moveId)) return;
    const mv = MOVES[moveId];
    if (c.moves.length < 4) {
      c.moves.push({ id: moveId, pp: mv.pp, maxPp: mv.pp });
      Sfx.statUp();
      await UI.say(`${creatureName(c)} learned ${mv.name}!`);
      return;
    }
    await UI.say(`${creatureName(c)} wants to learn ${mv.name}. But it already knows 4 moves.`);
    const yes = await UI.yesNo(`Forget a move to make room for ${mv.name}?`);
    if (!yes) {
      await UI.say(`${creatureName(c)} did not learn ${mv.name}.`);
      return;
    }
    UI.setPrompt('Forget which move?');
    const pick = await UI.choose(c.moves.map(m => MOVES[m.id].name).concat('CANCEL'),
      { style: { right: '14px', bottom: '126px' } });
    UI.hideDialog();
    if (pick === -1 || pick === 4) {
      await UI.say(`${creatureName(c)} did not learn ${mv.name}.`);
      return;
    }
    const old = MOVES[c.moves[pick].id].name;
    c.moves[pick] = { id: moveId, pp: mv.pp, maxPp: mv.pp };
    await UI.say(`1... 2... and... poof! ${creatureName(c)} forgot ${old} and learned ${mv.name}!`);
  }

  async handleEvolutions() {
    for (const c of this.evoQueue) {
      const sp = SPECIES[c.species];
      if (!sp.evolve || c.level < sp.evolve.at) continue;
      const oldName = creatureName(c);
      await UI.say(`What? ${oldName} is evolving!`);
      Sfx.evolve();
      await UI.flashScreen(4);
      const oldMax = c.maxHp;
      c.species = sp.evolve.to;
      calcStats(c);
      c.hp = Math.min(c.maxHp, c.hp + (c.maxHp - oldMax));
      if (c === this.active && this.fx.p.vis) UI.setBox('player', this.active);
      await UI.say(`Congratulations! Your ${oldName} evolved into ${creatureName(c)}!`);
      // check for moves learnable at this exact level in the new form
      for (const entry of SPECIES[c.species].learnset.filter(e => e.lv === c.level)) {
        await this.learnMove(c, entry.move);
      }
    }
    this.evoQueue = [];
  }

  // ---------- capture ----------
  async throwOrb(id) {
    Game.player.bag[id]--;
    await UI.say(`You threw a ${ITEMS[id].name}!`, { noWait: true, keep: true });
    Sfx.thrown();
    // clear the HUD so the ball takes center stage during the attempt
    UI.hideBoxes();

    // ball arc to the enemy
    const orb = this.fx.orb;
    orb.vis = true;
    await this.arcTween(orb, 60, 110, 172, 36, 450);
    // enemy gets pulled into the ball (shrink + flash)
    this.fx.e.flash = 12;
    Sfx.statusFx();
    await this.tween(this.fx.e, 'scale', 0, 320);
    this.fx.e.vis = false;
    this.fx.e.scale = 1;
    await this.tween(orb, 'y', 76, 250);

    // Gen 3 catch formula
    const en = this.enemy;
    const rate = SPECIES[en.species].catchRate;
    const ball = ITEMS[id].rate;
    const statusMul = (en.status === 'SLP' || en.status === 'FRZ') ? 2 : en.status ? 1.5 : 1;
    let a = Math.floor((3 * en.maxHp - 2 * en.hp) * rate * ball / (3 * en.maxHp)) * statusMul;
    a = Math.max(1, Math.floor(a));
    let shakes = 0;
    if (a >= 255) shakes = 4;
    else {
      const b = Math.floor(1048560 / Math.sqrt(Math.sqrt(Math.floor(16711680 / a))));
      for (let i = 0; i < 4; i++) {
        if (randInt(0, 65535) < b) shakes++;
        else break;
      }
    }

    // shake animation: up to 3 distinct wobbles, each with its own beep
    for (let i = 0; i < Math.min(shakes, 3); i++) {
      await wait(480);
      Sfx.shake();
      await this.tween(orb, 'rot', -1.6, 110);
      await this.tween(orb, 'rot', 1.6, 170);
      await this.tween(orb, 'rot', 0, 110);
    }
    await wait(480);

    if (shakes === 4) {
      // the lock click + a burst of stars
      Sfx.catchClick();
      this.spawnEffect('CAUGHT_STARS', orb.x, orb.y - 6);
      await wait(550);
      Sfx.caught();
      UI.hideDialog();
      await UI.say(`Gotcha! ${creatureName(en)} was caught!`);
      orb.vis = false;
      this.enemyIsCaught = true;
      if (Game.player.party.length < 6) {
        Game.player.party.push(en);
        await UI.say(`${creatureName(en)} joined your team!`);
      } else {
        Game.player.vault.push(en);
        await UI.say(`Your team is full. ${creatureName(en)} was sent to the storage vault!`);
      }
      this.over = true;
      this.result = 'catch';
      return true;
    }

    // breakout: the ball bursts open with a flash and flying shell pieces
    Sfx.breakout();
    this.spawnEffect('BALL_BREAK', orb.x, orb.y);
    this.shake = Math.max(this.shake, 10);
    orb.vis = false;
    this.fx.e.vis = true;
    this.fx.e.flash = 10;
    UI.setBox('enemy', this.enemy);
    UI.setBox('player', this.active);
    UI.hideDialog();
    const msgs = [
      'Oh no! It broke free!',
      'Aww! It appeared to be caught!',
      'Aargh! Almost had it!',
      'Shoot! It was so close, too!',
    ];
    await UI.say(msgs[shakes]);
    return false;
  }

  // ---------- animations / drawing ----------
  tween(obj, prop, to, ms) {
    const from = obj[prop];
    return new Promise(res => {
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / ms);
        obj[prop] = from + (to - from) * k;
        if (k < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
  }

  arcTween(orb, x0, y0, x1, y1, ms) {
    return new Promise(res => {
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / ms);
        orb.x = x0 + (x1 - x0) * k;
        orb.y = y0 + (y1 - y0) * k - 46 * Math.sin(Math.PI * k);
        if (k < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
  }

  draw(ctx) {
    ctx.save();
    if (this.shake > 0) {
      this.shake--;
      const m = Math.min(3, this.shake * 0.45);
      ctx.translate((Math.random() * 2 - 1) * m, (Math.random() * 2 - 1) * m);
    }
    // backdrop fills the whole (possibly widened) viewport, cover-scaled so
    // the painted ground sits where the sprites stand; the 240px-wide scene
    // composition is centered inside it
    const W = Game.viewW;
    const bg = GameAssets.battleBackground();
    if (bg) {
      const s = Math.max((W + 8) / 320, 168 / 240);
      const bw = 320 * s, bh = 240 * s;
      ctx.drawImage(bg, (W - bw) / 2, (160 - bh) / 2, bw, bh);
    } else {
      ctx.fillStyle = '#a8d8f0';
      ctx.fillRect(-4, -4, W + 8, 120);
      ctx.fillStyle = '#90c878';
      ctx.fillRect(-4, 112, W + 8, 56);
    }
    ctx.translate((W - 240) / 2, 0);

    const e = this.fx.e, p = this.fx.p, orb = this.fx.orb;
    if (e.flash > 0) e.flash--;
    if (p.flash > 0) p.flash--;

    // soft ground shadows anchored under each combatant (kills the
    // floating-in-air look and moves with lunge animations)
    const shadow = (cx, cy, rx) => {
      ctx.fillStyle = 'rgba(24,48,24,.28)';
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, rx * 0.3, 0, 0, Math.PI * 2); ctx.fill();
    };
    if (e.vis) shadow(e.x + 48, 90, 32);
    if (p.vis) shadow(p.x + 48, 127, 36);
    if (orb.vis) shadow(orb.x, 84, 9);

    if (e.vis && (e.flash <= 0 || Math.floor(e.flash / 3) % 2 === 0)) {
      const img = GameAssets.frontFor(this.enemy.species, this.enemy.shiny)
        || Sprites.creature(this.enemy.species);
      const sc = e.scale === undefined ? 1 : e.scale;
      const sz = 96 * sc;
      ctx.drawImage(img, e.x + (96 - sz) / 2, e.y + e.dy + (96 - sz), sz, sz);
    }
    if (p.vis && (p.flash <= 0 || Math.floor(p.flash / 3) % 2 === 0)) {
      const img = GameAssets.backFor(this.active.species, this.active.shiny)
        || Sprites.creature(this.active.species);
      ctx.drawImage(img, p.x, p.y + p.dy, 96, 96);
    }
    if (orb.vis) {
      ctx.save();
      // tilt + sideways rock so the wobble reads clearly at GBA scale
      ctx.translate(orb.x + orb.rot * 3, orb.y);
      ctx.rotate(orb.rot * 0.45);
      ctx.fillStyle = '#303038';
      ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e04838';
      ctx.beginPath(); ctx.arc(0, -0.5, 4, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#f0f0f0';
      ctx.beginPath(); ctx.arc(0, 0.8, 4, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(-1, -1, 2, 2);
      ctx.restore();
    }

    this.drawParticles(ctx);
    ctx.restore();
  }
}
