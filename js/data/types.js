// ===== Type system: full Gen 3 type chart =====
const TYPES = {
  NORMAL:   { name: 'NORMAL',   color: '#a8a878' },
  FIRE:     { name: 'FIRE',     color: '#f08030' },
  WATER:    { name: 'WATER',    color: '#6890f0' },
  ELECTRIC: { name: 'ELECTRIC', color: '#f8d030' },
  GRASS:    { name: 'GRASS',    color: '#78c850' },
  ICE:      { name: 'ICE',      color: '#98d8d8' },
  FIGHTING: { name: 'FIGHTING', color: '#c03028' },
  POISON:   { name: 'POISON',   color: '#a040a0' },
  GROUND:   { name: 'GROUND',   color: '#e0c068' },
  FLYING:   { name: 'FLYING',   color: '#a890f0' },
  PSYCHIC:  { name: 'PSYCHIC',  color: '#f85888' },
  BUG:      { name: 'BUG',      color: '#a8b820' },
  ROCK:     { name: 'ROCK',     color: '#b8a038' },
  GHOST:    { name: 'GHOST',    color: '#705898' },
  DRAGON:   { name: 'DRAGON',   color: '#7038f8' },
  DARK:     { name: 'DARK',     color: '#705848' },
  STEEL:    { name: 'STEEL',    color: '#b8b8d0' },
};

// TYPE_CHART[attacker][defender] = multiplier (missing = 1x). Gen 3 values.
const TYPE_CHART = {
  NORMAL:   { ROCK: 0.5, GHOST: 0, STEEL: 0.5 },
  FIRE:     { FIRE: 0.5, WATER: 0.5, GRASS: 2, ICE: 2, BUG: 2, ROCK: 0.5, DRAGON: 0.5, STEEL: 2 },
  WATER:    { FIRE: 2, WATER: 0.5, GRASS: 0.5, GROUND: 2, ROCK: 2, DRAGON: 0.5 },
  ELECTRIC: { WATER: 2, ELECTRIC: 0.5, GRASS: 0.5, GROUND: 0, FLYING: 2, DRAGON: 0.5 },
  GRASS:    { FIRE: 0.5, WATER: 2, GRASS: 0.5, POISON: 0.5, GROUND: 2, FLYING: 0.5, BUG: 0.5, ROCK: 2, DRAGON: 0.5, STEEL: 0.5 },
  ICE:      { FIRE: 0.5, WATER: 0.5, GRASS: 2, ICE: 0.5, GROUND: 2, FLYING: 2, DRAGON: 2, STEEL: 0.5 },
  FIGHTING: { NORMAL: 2, ICE: 2, POISON: 0.5, FLYING: 0.5, PSYCHIC: 0.5, BUG: 0.5, ROCK: 2, GHOST: 0, DARK: 2, STEEL: 2 },
  POISON:   { GRASS: 2, POISON: 0.5, GROUND: 0.5, ROCK: 0.5, GHOST: 0.5, STEEL: 0 },
  GROUND:   { FIRE: 2, ELECTRIC: 2, GRASS: 0.5, POISON: 2, FLYING: 0, BUG: 0.5, ROCK: 2, STEEL: 2 },
  FLYING:   { ELECTRIC: 0.5, GRASS: 2, FIGHTING: 2, BUG: 2, ROCK: 0.5, STEEL: 0.5 },
  PSYCHIC:  { FIGHTING: 2, POISON: 2, PSYCHIC: 0.5, DARK: 0, STEEL: 0.5 },
  BUG:      { FIRE: 0.5, GRASS: 2, FIGHTING: 0.5, POISON: 0.5, FLYING: 0.5, PSYCHIC: 2, GHOST: 0.5, DARK: 2, STEEL: 0.5 },
  ROCK:     { FIRE: 2, ICE: 2, FIGHTING: 0.5, GROUND: 0.5, FLYING: 2, BUG: 2, STEEL: 0.5 },
  GHOST:    { NORMAL: 0, PSYCHIC: 2, GHOST: 2, DARK: 0.5, STEEL: 0.5 },
  DRAGON:   { DRAGON: 2, STEEL: 0.5 },
  DARK:     { FIGHTING: 0.5, PSYCHIC: 2, GHOST: 2, DARK: 0.5, STEEL: 0.5 },
  STEEL:    { FIRE: 0.5, WATER: 0.5, ELECTRIC: 0.5, ICE: 2, ROCK: 2, STEEL: 0.5 },
};

// Multiply across all of the defender's types.
function typeEffectiveness(moveType, defenderTypes) {
  let mult = 1;
  const row = TYPE_CHART[moveType] || {};
  for (const t of defenderTypes) {
    if (row[t] !== undefined) mult *= row[t];
  }
  return mult;
}
