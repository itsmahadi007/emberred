// ===== Species data: National Dex #001-#020, Gen 3 stats =====
// base: [hp, atk, def, spa, spd, spe]
// catchRate: 0-255. expYield: Gen 3 base experience.
// learnset: FireRed level-up moves (trimmed to the implemented move pool).
// All blurb text is original flavor writing.
const SPECIES = {
  // --- Bulbasaur line ---
  bulbasaur: {
    name: 'BULBASAUR', types: ['GRASS', 'POISON'], base: [45, 49, 49, 65, 65, 45],
    catchRate: 45, expYield: 64,
    evolve: { at: 16, to: 'ivysaur' },
    learnset: [
      { lv: 1, move: 'tackle' }, { lv: 4, move: 'growl' },
      { lv: 7, move: 'leechseed' }, { lv: 10, move: 'vinewhip' },
      { lv: 15, move: 'poisonpowder' }, { lv: 15, move: 'sleeppowder' },
      { lv: 20, move: 'razorleaf' }, { lv: 25, move: 'sweetscent' },
      { lv: 32, move: 'growth' },
    ],
    blurb: 'The seed on its back drinks sunlight and grows along with it.',
  },
  ivysaur: {
    name: 'IVYSAUR', types: ['GRASS', 'POISON'], base: [60, 62, 63, 80, 80, 60],
    catchRate: 45, expYield: 141,
    evolve: { at: 32, to: 'venusaur' },
    learnset: [
      { lv: 1, move: 'tackle' }, { lv: 1, move: 'growl' }, { lv: 1, move: 'leechseed' },
      { lv: 10, move: 'vinewhip' }, { lv: 15, move: 'poisonpowder' }, { lv: 15, move: 'sleeppowder' },
      { lv: 22, move: 'razorleaf' }, { lv: 29, move: 'sweetscent' }, { lv: 38, move: 'growth' },
    ],
    blurb: 'Its heavy bud bends its legs, but the bloom to come is worth the weight.',
  },
  venusaur: {
    name: 'VENUSAUR', types: ['GRASS', 'POISON'], base: [80, 82, 83, 100, 100, 80],
    catchRate: 45, expYield: 208,
    learnset: [
      { lv: 1, move: 'tackle' }, { lv: 1, move: 'growl' }, { lv: 1, move: 'leechseed' },
      { lv: 1, move: 'vinewhip' }, { lv: 15, move: 'poisonpowder' }, { lv: 15, move: 'sleeppowder' },
      { lv: 22, move: 'razorleaf' }, { lv: 29, move: 'sweetscent' }, { lv: 41, move: 'growth' },
    ],
    blurb: 'The great flower on its back perfumes whole valleys after rain.',
  },

  // --- Charmander line ---
  charmander: {
    name: 'CHARMANDER', types: ['FIRE'], base: [39, 52, 43, 60, 50, 65],
    catchRate: 45, expYield: 65,
    evolve: { at: 16, to: 'charmeleon' },
    learnset: [
      { lv: 1, move: 'scratch' }, { lv: 1, move: 'growl' },
      { lv: 7, move: 'ember' }, { lv: 13, move: 'metalclaw' },
      { lv: 19, move: 'smokescreen' }, { lv: 25, move: 'scaryface' },
      { lv: 31, move: 'flamethrower' }, { lv: 37, move: 'slash' },
    ],
    blurb: 'The flame on its tail burns steady when it is healthy and happy.',
  },
  charmeleon: {
    name: 'CHARMELEON', types: ['FIRE'], base: [58, 64, 58, 80, 65, 80],
    catchRate: 45, expYield: 142,
    evolve: { at: 36, to: 'charizard' },
    learnset: [
      { lv: 1, move: 'scratch' }, { lv: 1, move: 'growl' }, { lv: 1, move: 'ember' },
      { lv: 13, move: 'metalclaw' }, { lv: 20, move: 'smokescreen' },
      { lv: 27, move: 'scaryface' }, { lv: 34, move: 'flamethrower' }, { lv: 41, move: 'slash' },
    ],
    blurb: 'Hot-headed and proud. The night sky glows faintly above its lair.',
  },
  charizard: {
    name: 'CHARIZARD', types: ['FIRE', 'FLYING'], base: [78, 84, 78, 109, 85, 100],
    catchRate: 45, expYield: 209,
    learnset: [
      { lv: 1, move: 'scratch' }, { lv: 1, move: 'growl' }, { lv: 1, move: 'ember' },
      { lv: 1, move: 'metalclaw' }, { lv: 20, move: 'smokescreen' }, { lv: 27, move: 'scaryface' },
      { lv: 34, move: 'flamethrower' }, { lv: 36, move: 'wingattack' }, { lv: 44, move: 'slash' },
    ],
    blurb: 'Its wingbeats fan its tail flame white-hot. It answers to no leash.',
  },

  // --- Squirtle line ---
  squirtle: {
    name: 'SQUIRTLE', types: ['WATER'], base: [44, 48, 65, 50, 64, 43],
    catchRate: 45, expYield: 66,
    evolve: { at: 16, to: 'wartortle' },
    learnset: [
      { lv: 1, move: 'tackle' }, { lv: 4, move: 'tailwhip' },
      { lv: 7, move: 'bubble' }, { lv: 10, move: 'withdraw' },
      { lv: 13, move: 'watergun' }, { lv: 18, move: 'bite' },
      { lv: 23, move: 'rapidspin' },
    ],
    blurb: 'Its round shell sheds water and worry alike. A patient little paddler.',
  },
  wartortle: {
    name: 'WARTORTLE', types: ['WATER'], base: [59, 63, 80, 65, 80, 58],
    catchRate: 45, expYield: 143,
    evolve: { at: 36, to: 'blastoise' },
    learnset: [
      { lv: 1, move: 'tackle' }, { lv: 1, move: 'tailwhip' }, { lv: 1, move: 'bubble' },
      { lv: 10, move: 'withdraw' }, { lv: 13, move: 'watergun' },
      { lv: 19, move: 'bite' }, { lv: 25, move: 'rapidspin' },
    ],
    blurb: 'The fur on its tail darkens with age. Old ones are said to bring luck.',
  },
  blastoise: {
    name: 'BLASTOISE', types: ['WATER'], base: [79, 83, 100, 85, 105, 78],
    catchRate: 45, expYield: 210,
    learnset: [
      { lv: 1, move: 'tackle' }, { lv: 1, move: 'tailwhip' }, { lv: 1, move: 'bubble' },
      { lv: 1, move: 'withdraw' }, { lv: 13, move: 'watergun' },
      { lv: 19, move: 'bite' }, { lv: 25, move: 'rapidspin' },
    ],
    blurb: 'The cannons on its shell can punch through a cliff face — or open a coconut.',
  },

  // --- Caterpie line ---
  caterpie: {
    name: 'CATERPIE', types: ['BUG'], base: [45, 30, 35, 20, 20, 45],
    catchRate: 255, expYield: 53,
    evolve: { at: 7, to: 'metapod' },
    learnset: [
      { lv: 1, move: 'tackle' }, { lv: 1, move: 'stringshot' },
    ],
    blurb: 'It eats its own weight in leaves daily and dreams of wings.',
  },
  metapod: {
    name: 'METAPOD', types: ['BUG'], base: [50, 20, 55, 25, 25, 30],
    catchRate: 120, expYield: 72,
    evolve: { at: 10, to: 'butterfree' },
    learnset: [
      { lv: 1, move: 'tackle' }, { lv: 1, move: 'harden' },
    ],
    blurb: 'Inside the green shell, everything is being rebuilt. Please do not knock.',
  },
  butterfree: {
    name: 'BUTTERFREE', types: ['BUG', 'FLYING'], base: [60, 45, 50, 80, 80, 70],
    catchRate: 45, expYield: 160,
    learnset: [
      { lv: 1, move: 'tackle' }, { lv: 10, move: 'confusion' },
      { lv: 13, move: 'poisonpowder' }, { lv: 14, move: 'stunspore' },
      { lv: 15, move: 'sleeppowder' }, { lv: 18, move: 'supersonic' },
      { lv: 28, move: 'gust' }, { lv: 34, move: 'psybeam' },
    ],
    blurb: 'Its wing scales scatter in the sun like slow snow. Loves flower fields.',
  },

  // --- Weedle line ---
  weedle: {
    name: 'WEEDLE', types: ['BUG', 'POISON'], base: [40, 35, 30, 20, 20, 50],
    catchRate: 255, expYield: 52,
    evolve: { at: 7, to: 'kakuna' },
    learnset: [
      { lv: 1, move: 'poisonsting' }, { lv: 1, move: 'stringshot' },
    ],
    blurb: 'The spike on its head is no decoration. Pick it up at your own risk.',
  },
  kakuna: {
    name: 'KAKUNA', types: ['BUG', 'POISON'], base: [45, 25, 50, 25, 25, 35],
    catchRate: 120, expYield: 71,
    evolve: { at: 10, to: 'beedrill' },
    learnset: [
      { lv: 1, move: 'poisonsting' }, { lv: 1, move: 'harden' },
    ],
    blurb: 'It hangs from branches, perfectly still — except when it is not.',
  },
  beedrill: {
    name: 'BEEDRILL', types: ['BUG', 'POISON'], base: [65, 80, 40, 45, 80, 75],
    catchRate: 45, expYield: 159,
    learnset: [
      { lv: 1, move: 'poisonsting' }, { lv: 10, move: 'furyattack' },
      { lv: 20, move: 'twineedle' }, { lv: 30, move: 'pursuit' },
      { lv: 35, move: 'pinmissile' }, { lv: 40, move: 'agility' },
    ],
    blurb: 'Three lances, one temper. Its drone is the forest\'s final warning.',
  },

  // --- Pidgey line ---
  pidgey: {
    name: 'PIDGEY', types: ['NORMAL', 'FLYING'], base: [40, 45, 40, 35, 35, 56],
    catchRate: 255, expYield: 55,
    evolve: { at: 18, to: 'pidgeotto' },
    learnset: [
      { lv: 1, move: 'tackle' }, { lv: 5, move: 'sandattack' },
      { lv: 9, move: 'gust' }, { lv: 13, move: 'quickattack' },
      { lv: 25, move: 'twister' }, { lv: 31, move: 'featherdance' },
      { lv: 39, move: 'agility' },
    ],
    blurb: 'A common, mild-tempered bird. It kicks up sand when cornered.',
  },
  pidgeotto: {
    name: 'PIDGEOTTO', types: ['NORMAL', 'FLYING'], base: [63, 60, 55, 50, 50, 71],
    catchRate: 120, expYield: 113,
    evolve: { at: 36, to: 'pidgeot' },
    learnset: [
      { lv: 1, move: 'tackle' }, { lv: 1, move: 'sandattack' }, { lv: 1, move: 'gust' },
      { lv: 13, move: 'quickattack' }, { lv: 27, move: 'twister' },
      { lv: 34, move: 'featherdance' }, { lv: 43, move: 'agility' },
    ],
    blurb: 'It patrols a wide territory and never forgets a face — or a slight.',
  },
  pidgeot: {
    name: 'PIDGEOT', types: ['NORMAL', 'FLYING'], base: [83, 80, 75, 70, 70, 91],
    catchRate: 45, expYield: 172,
    learnset: [
      { lv: 1, move: 'tackle' }, { lv: 1, move: 'sandattack' }, { lv: 1, move: 'gust' },
      { lv: 13, move: 'quickattack' }, { lv: 27, move: 'twister' },
      { lv: 34, move: 'featherdance' }, { lv: 44, move: 'agility' },
    ],
    blurb: 'Its dive splits ponds clean to the bed. The crest is pure showmanship.',
  },

  // --- Rattata line ---
  rattata: {
    name: 'RATTATA', types: ['NORMAL'], base: [30, 56, 35, 25, 35, 72],
    catchRate: 255, expYield: 57,
    evolve: { at: 20, to: 'raticate' },
    learnset: [
      { lv: 1, move: 'tackle' }, { lv: 1, move: 'tailwhip' },
      { lv: 4, move: 'quickattack' }, { lv: 13, move: 'hyperfang' },
      { lv: 20, move: 'pursuit' }, { lv: 27, move: 'superfang' },
    ],
    blurb: 'It will gnaw on anything once. Twice, if it was tasty.',
  },
  raticate: {
    name: 'RATICATE', types: ['NORMAL'], base: [55, 81, 60, 50, 70, 97],
    catchRate: 127, expYield: 116,
    learnset: [
      { lv: 1, move: 'tackle' }, { lv: 1, move: 'tailwhip' }, { lv: 1, move: 'quickattack' },
      { lv: 13, move: 'hyperfang' }, { lv: 20, move: 'pursuit' }, { lv: 30, move: 'superfang' },
    ],
    blurb: 'Its fangs never stop growing, so neither does its appetite for trouble.',
  },
};

// ===== Creature helpers =====
let _uid = 1;

// Medium-fast experience curve.
function expForLevel(level) { return level * level * level; }

function statFromBase(base, level) { return Math.floor(2 * base * level / 100) + 5; }
function hpFromBase(base, level) { return Math.floor(2 * base * level / 100) + level + 10; }

function calcStats(c) {
  const b = SPECIES[c.species].base;
  c.maxHp = hpFromBase(b[0], c.level);
  c.atk = statFromBase(b[1], c.level);
  c.def = statFromBase(b[2], c.level);
  c.spa = statFromBase(b[3], c.level);
  c.spd = statFromBase(b[4], c.level);
  c.spe = statFromBase(b[5], c.level);
}

// Moves known at a given level: the 4 most recent learnset entries.
function movesAtLevel(speciesId, level) {
  const known = SPECIES[speciesId].learnset.filter(e => e.lv <= level).map(e => e.move);
  const dedup = [...new Set(known)];
  return dedup.slice(-4);
}

function makeCreature(speciesId, level) {
  const c = {
    uid: _uid++,
    species: speciesId,
    level,
    exp: expForLevel(level),
    shiny: Math.random() < 1 / 512,   // shiny encounter rate: 1 in 512
    status: null,       // null | 'PSN' | 'BRN' | 'PAR' | 'SLP' | 'FRZ'
    sleepTurns: 0,
    moves: movesAtLevel(speciesId, level).map(id => ({
      id, pp: MOVES[id].pp, maxPp: MOVES[id].pp,
    })),
  };
  calcStats(c);
  c.hp = c.maxHp;
  return c;
}

function creatureName(c) { return SPECIES[c.species].name; }
function creatureTypes(c) { return SPECIES[c.species].types; }

// Exp needed to go from current total to the next level.
function expToNext(c) {
  if (c.level >= 100) return 0;
  return expForLevel(c.level + 1) - c.exp;
}

// 0..1 progress through the current level's exp band.
function expProgress(c) {
  if (c.level >= 100) return 1;
  const lo = expForLevel(c.level), hi = expForLevel(c.level + 1);
  return Math.max(0, Math.min(1, (c.exp - lo) / (hi - lo)));
}
