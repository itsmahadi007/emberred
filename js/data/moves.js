// ===== Move data (Gen 3 values; category follows the Gen 3 by-type split) =====
// cat: 'phys' | 'spec' | 'status'
// effect: { status, chance }                       — inflict major status
//         { stat, stages, target, chance }         — stat stage change ('self' | 'foe')
//           stats: atk def spa spd spe acc eva
//         { volatile: 'flinch'|'confuse', chance } — volatile condition
// prio: priority bracket. hiCrit: 1/8 crit. multi: [min,max] or 2 (multi-hit).
// special: 'superfang' | 'leechseed'
const MOVES = {
  // --- NORMAL ---
  tackle:      { name: 'Tackle',       type: 'NORMAL', cat: 'phys', power: 35, acc: 95, pp: 35,
                 desc: 'A full-body charge attack.' },
  scratch:     { name: 'Scratch',      type: 'NORMAL', cat: 'phys', power: 40, acc: 100, pp: 35,
                 desc: 'Rakes the foe with sharp claws.' },
  quickattack: { name: 'Quick Attack', type: 'NORMAL', cat: 'phys', power: 40, acc: 100, pp: 30, prio: 1,
                 desc: 'An extremely fast attack that always strikes first.' },
  slash:       { name: 'Slash',        type: 'NORMAL', cat: 'phys', power: 70, acc: 100, pp: 20, hiCrit: true,
                 desc: 'Slashes with claws. High critical-hit ratio.' },
  hyperfang:   { name: 'Hyper Fang',   type: 'NORMAL', cat: 'phys', power: 80, acc: 90, pp: 15,
                 effect: { volatile: 'flinch', chance: 0.1 },
                 desc: 'Bites with huge fangs. May make the foe flinch.' },
  superfang:   { name: 'Super Fang',   type: 'NORMAL', cat: 'phys', power: 1, acc: 90, pp: 10, special: 'superfang',
                 desc: "Cuts the foe's remaining HP in half." },
  rapidspin:   { name: 'Rapid Spin',   type: 'NORMAL', cat: 'phys', power: 20, acc: 100, pp: 40,
                 desc: 'A spinning tackle attack.' },
  growl:       { name: 'Growl',        type: 'NORMAL', cat: 'status', power: 0, acc: 100, pp: 40,
                 effect: { stat: 'atk', stages: -1, target: 'foe', chance: 1 },
                 desc: "A soft growl that lowers the foe's Attack." },
  tailwhip:    { name: 'Tail Whip',    type: 'NORMAL', cat: 'status', power: 0, acc: 100, pp: 30,
                 effect: { stat: 'def', stages: -1, target: 'foe', chance: 1 },
                 desc: "Wags the tail to lower the foe's Defense." },
  smokescreen: { name: 'Smokescreen',  type: 'NORMAL', cat: 'status', power: 0, acc: 100, pp: 20,
                 effect: { stat: 'acc', stages: -1, target: 'foe', chance: 1 },
                 desc: "A smoke cloud that lowers the foe's accuracy." },
  sweetscent:  { name: 'Sweet Scent',  type: 'NORMAL', cat: 'status', power: 0, acc: 100, pp: 20,
                 effect: { stat: 'eva', stages: -1, target: 'foe', chance: 1 },
                 desc: "A sweet aroma that lowers the foe's evasiveness." },
  scaryface:   { name: 'Scary Face',   type: 'NORMAL', cat: 'status', power: 0, acc: 90, pp: 10,
                 effect: { stat: 'spe', stages: -2, target: 'foe', chance: 1 },
                 desc: "A frightening face that sharply lowers the foe's Speed." },
  growth:      { name: 'Growth',       type: 'NORMAL', cat: 'status', power: 0, acc: true, pp: 40,
                 effect: { stat: 'spa', stages: 1, target: 'self', chance: 1 },
                 desc: 'Grows the body to raise Sp. Atk.' },
  harden:      { name: 'Harden',       type: 'NORMAL', cat: 'status', power: 0, acc: true, pp: 30,
                 effect: { stat: 'def', stages: 1, target: 'self', chance: 1 },
                 desc: 'Stiffens the body to raise Defense.' },
  supersonic:  { name: 'Supersonic',   type: 'NORMAL', cat: 'status', power: 0, acc: 55, pp: 20,
                 effect: { volatile: 'confuse', chance: 1 },
                 desc: 'Bizarre sound waves that confuse the foe.' },
  struggle:    { name: 'Struggle',     type: 'NORMAL', cat: 'phys', power: 50, acc: 100, pp: 1, recoil: 0.25,
                 desc: 'Used only when all moves are out of PP.' },

  // --- GRASS ---
  vinewhip:    { name: 'Vine Whip',    type: 'GRASS', cat: 'spec', power: 35, acc: 100, pp: 10,
                 desc: 'Whips the foe with slender vines.' },
  razorleaf:   { name: 'Razor Leaf',   type: 'GRASS', cat: 'spec', power: 55, acc: 95, pp: 25, hiCrit: true,
                 desc: 'Cutting leaves. High critical-hit ratio.' },
  leechseed:   { name: 'Leech Seed',   type: 'GRASS', cat: 'status', power: 0, acc: 90, pp: 10, special: 'leechseed',
                 desc: "Plants a seed that saps the foe's HP every turn." },
  sleeppowder: { name: 'Sleep Powder', type: 'GRASS', cat: 'status', power: 0, acc: 75, pp: 15,
                 effect: { status: 'SLP', chance: 1 },
                 desc: 'Scatters a powder that puts the foe to sleep.' },
  stunspore:   { name: 'Stun Spore',   type: 'GRASS', cat: 'status', power: 0, acc: 75, pp: 30,
                 effect: { status: 'PAR', chance: 1 },
                 desc: 'Scatters a powder that paralyzes the foe.' },

  // --- POISON ---
  poisonsting: { name: 'Poison Sting', type: 'POISON', cat: 'phys', power: 15, acc: 100, pp: 35,
                 effect: { status: 'PSN', chance: 0.3 },
                 desc: 'A toxic barb that may poison the foe.' },
  poisonpowder:{ name: 'PoisonPowder', type: 'POISON', cat: 'status', power: 0, acc: 75, pp: 35,
                 effect: { status: 'PSN', chance: 1 },
                 desc: 'Scatters a powder that poisons the foe.' },

  // --- FIRE ---
  ember:       { name: 'Ember',        type: 'FIRE', cat: 'spec', power: 40, acc: 100, pp: 25,
                 effect: { status: 'BRN', chance: 0.1 },
                 desc: 'A weak fire attack that may burn the foe.' },
  flamethrower:{ name: 'Flamethrower', type: 'FIRE', cat: 'spec', power: 95, acc: 100, pp: 15,
                 effect: { status: 'BRN', chance: 0.1 },
                 desc: 'A powerful stream of fire. May burn the foe.' },

  // --- WATER ---
  bubble:      { name: 'Bubble',       type: 'WATER', cat: 'spec', power: 20, acc: 100, pp: 30,
                 effect: { stat: 'spe', stages: -1, target: 'foe', chance: 0.1 },
                 desc: "Sprays bubbles that may lower the foe's Speed." },
  watergun:    { name: 'Water Gun',    type: 'WATER', cat: 'spec', power: 40, acc: 100, pp: 25,
                 desc: 'Squirts water forcefully at the foe.' },
  withdraw:    { name: 'Withdraw',     type: 'WATER', cat: 'status', power: 0, acc: true, pp: 40,
                 effect: { stat: 'def', stages: 1, target: 'self', chance: 1 },
                 desc: 'Pulls into the shell to raise Defense.' },

  // --- BUG ---
  stringshot:  { name: 'String Shot',  type: 'BUG', cat: 'status', power: 0, acc: 95, pp: 40,
                 effect: { stat: 'spe', stages: -1, target: 'foe', chance: 1 },
                 desc: "Binds the foe with silk to lower its Speed." },
  twineedle:   { name: 'Twineedle',    type: 'BUG', cat: 'phys', power: 25, acc: 100, pp: 20, multi: 2,
                 effect: { status: 'PSN', chance: 0.2 },
                 desc: 'Stings twice with a pair of needles. May poison.' },
  pinmissile:  { name: 'Pin Missile',  type: 'BUG', cat: 'phys', power: 14, acc: 85, pp: 20, multi: [2, 5],
                 desc: 'Fires sharp pins that hit 2 to 5 times.' },

  // --- FLYING ---
  gust:        { name: 'Gust',         type: 'FLYING', cat: 'phys', power: 40, acc: 100, pp: 35,
                 desc: 'Whips up a gust of wind with the wings.' },
  wingattack:  { name: 'Wing Attack',  type: 'FLYING', cat: 'phys', power: 60, acc: 100, pp: 35,
                 desc: 'Strikes the foe with wings spread wide.' },
  featherdance:{ name: 'FeatherDance', type: 'FLYING', cat: 'status', power: 0, acc: 100, pp: 15,
                 effect: { stat: 'atk', stages: -2, target: 'foe', chance: 1 },
                 desc: "A downy cloak that sharply lowers the foe's Attack." },

  // --- GROUND ---
  sandattack:  { name: 'Sand Attack',  type: 'GROUND', cat: 'status', power: 0, acc: 100, pp: 15,
                 effect: { stat: 'acc', stages: -1, target: 'foe', chance: 1 },
                 desc: "Kicks sand to lower the foe's accuracy." },

  // --- STEEL ---
  metalclaw:   { name: 'Metal Claw',   type: 'STEEL', cat: 'phys', power: 50, acc: 95, pp: 35,
                 effect: { stat: 'atk', stages: 1, target: 'self', chance: 0.1 },
                 desc: "Claws of steel. May raise the user's Attack." },

  // --- PSYCHIC ---
  confusion:   { name: 'Confusion',    type: 'PSYCHIC', cat: 'spec', power: 50, acc: 100, pp: 25,
                 effect: { volatile: 'confuse', chance: 0.1 },
                 desc: 'A weak telekinetic attack. May confuse the foe.' },
  psybeam:     { name: 'Psybeam',      type: 'PSYCHIC', cat: 'spec', power: 65, acc: 100, pp: 20,
                 effect: { volatile: 'confuse', chance: 0.1 },
                 desc: 'A strange beam that may confuse the foe.' },
  agility:     { name: 'Agility',      type: 'PSYCHIC', cat: 'status', power: 0, acc: true, pp: 30,
                 effect: { stat: 'spe', stages: 2, target: 'self', chance: 1 },
                 desc: 'Relaxes the body to sharply raise Speed.' },

  // --- DARK (special in Gen 3) ---
  bite:        { name: 'Bite',         type: 'DARK', cat: 'spec', power: 60, acc: 100, pp: 25,
                 effect: { volatile: 'flinch', chance: 0.3 },
                 desc: 'Bites with vicious fangs. May cause flinching.' },
  pursuit:     { name: 'Pursuit',      type: 'DARK', cat: 'spec', power: 40, acc: 100, pp: 20,
                 desc: 'A sudden attack from the shadows.' },

  // --- DRAGON ---
  twister:     { name: 'Twister',      type: 'DRAGON', cat: 'spec', power: 40, acc: 100, pp: 20,
                 effect: { volatile: 'flinch', chance: 0.2 },
                 desc: 'Whips up a vicious twister. May cause flinching.' },

  // --- NORMAL multi-hit ---
  furyattack:  { name: 'Fury Attack',  type: 'NORMAL', cat: 'phys', power: 15, acc: 85, pp: 20, multi: [2, 5],
                 desc: 'Jabs the foe 2 to 5 times in a row.' },
};

// Status condition display data
const STATUS_INFO = {
  PSN: { name: 'PSN', text: 'poisoned' },
  BRN: { name: 'BRN', text: 'burned' },
  PAR: { name: 'PAR', text: 'paralyzed' },
  SLP: { name: 'SLP', text: 'asleep' },
  FRZ: { name: 'FRZ', text: 'frozen solid' },
};
