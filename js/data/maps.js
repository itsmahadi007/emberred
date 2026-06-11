// ===== Map data =====
// Tile legend:
//   . grass   : path    t tall grass (encounters)   T tree    W water
//   F flowers f fence   r roof   w wall   D door(warp)   s sign
//   _ floor   k counter m exit mat(warp)  b bookshelf  O boulder
//   B bed     h stairs(warp)
//   R center roof   M mart roof   c center emblem   g mart emblem
//   H healing machine   G goods shelf   n bench
//   1 2 3 starter desks   x void
// Solid: T W f r w s k b O B R M c g H G n 1 2 3 x  (D, m, h are walkable warps)
const SOLID_TILES = new Set(['T', 'W', 'f', 'r', 'w', 's', 'k', 'b', 'O', 'B',
  'R', 'M', 'c', 'g', 'H', 'G', 'n', '1', '2', '3', 'x']);

// All names and dialogue below are original.
const MAPS = {
  // ------------------------------------------------ Player's bedroom (upstairs)
  bedroom: {
    name: 'YOUR ROOM',
    rows: [
      'wwwwwwwwww',
      'wBB_____hw',
      'w________w',
      'w_b______w',
      'w________w',
      'w________w',
      'wwwwwwwwww',
    ],
    warps: { '8,1': { map: 'house', x: 8, y: 2, facing: 'down' } },
    signs: {},
    npcs: [],
  },

  // ------------------------------------------------ Player's house (downstairs)
  house: {
    name: 'YOUR HOUSE',
    rows: [
      'wwwwwwwwww',
      'w_______hw',
      'w________w',
      'w_kk_____w',
      'w________w',
      'w________w',
      'w___m____w',
      'wwwwwwwwww',
    ],
    warps: {
      '8,1': { map: 'bedroom', x: 8, y: 2, facing: 'down' },
      '4,6': { map: 'hometown', x: 4, y: 8, facing: 'down' },
    },
    signs: {},
    npcs: [
      { id: 'mom', x: 4, y: 3, kind: 'parent', facing: 'down', special: 'parent' },
    ],
  },

  // ------------------------------------------------ WILLOWBROOK (start town)
  // Buildings are ~7 tiles tall as drawn, so each footprint keeps 4 clear
  // rows above it (made solid at runtime while the building image covers them).
  hometown: {
    name: 'WILLOWBROOK',
    outdoor: true,
    rows: [
      'TTTTTTTTT::TTTTTTTTT',
      'T........::........T',
      'T........::........T',
      'T........::........T',
      'T........::........T',
      'T.rrrrr..::..rrrrr.T',
      'T.rrrrr..::..rrrrr.T',
      'T.wwDww..::..wwDww.T',
      'T.s.:....::....:s..T',
      'T::::::::::::::::::T',
      'T..FF..........FF..T',
      'T..FF..........FF..T',
      'T..................T',
      'T..................T',
      'T..................T',
      'T.......rrrrr......T',
      'T.......rrrrr......T',
      'T.......wwDww.s....T',
      'T.........:........T',
      'T.........:........T',
      'T..................T',
      'TTTTTTTTTTTTTTTTTTTT',
    ],
    links: { up: 'route1' },
    warps: {
      '4,7':  { map: 'house',    x: 4, y: 5, facing: 'up' },
      '15,7': { map: 'rexhouse', x: 5, y: 4, facing: 'up' },
      '10,17':{ map: 'lab',      x: 5, y: 6, facing: 'up' },
    },
    signs: {
      '2,8':  "YOUR HOUSE\nSomeone left the porch light on for you.",
      '16,8': "REX'S HOUSE\nThe doormat says 'WINNERS ONLY'.",
      '14,17': "MAPLE POKEMON LAB\n\"Every journey starts with a friend.\"",
    },
    npcs: [
      { id: 'hv1', x: 14, y: 13, kind: 'villager', facing: 'down',
        dialog: [
          'Going into the tall grass without your own partner? Bad idea, kid.',
          'Wild ones jump out of the grass when you least expect it.',
          'If you want a partner of your own, Prof. MAPLE is the person to see. Her lab is the big building south of here.',
        ] },
      { id: 'hv2', x: 5, y: 12, kind: 'villager2', facing: 'down',
        dialog: [
          'My back aches, so let me give you wisdom instead of a battle.',
          'Type matchups decide everything. WATER douses FIRE, FIRE burns GRASS, GRASS drinks WATER.',
          'And do not sleep on status effects! A poisoned foe wears down. A paralyzed one is easier to catch.',
        ] },
    ],
  },

  // ------------------------------------------------ Rex's house
  rexhouse: {
    name: "REX'S HOUSE",
    rows: [
      'wwwwwwwwww',
      'w_b____b_w',
      'w________w',
      'w_kk_____w',
      'w________w',
      'w____m___w',
      'wwwwwwwwww',
    ],
    warps: { '5,5': { map: 'hometown', x: 15, y: 8, facing: 'down' } },
    signs: {},
    npcs: [
      { id: 'aunt', x: 4, y: 2, kind: 'villager2', facing: 'down',
        dialog: [
          "Oh, hello dear. You must be looking for REX. He stormed off to MAPLE's lab at sunrise.",
          'He kept shouting about "picking the strongest one before anybody else."',
          "He's a good boy underneath it all. Several layers underneath.",
        ] },
    ],
  },

  // ------------------------------------------------ Maple's lab
  lab: {
    name: "MAPLE'S LAB",
    rows: [
      'wwwwwwwwwwww',
      'wbb______bbw',
      'w__________w',
      'w__________w',
      'w___123____w',
      'w__________w',
      'w__________w',
      'w____m_____w',
      'wwwwwwwwwwww',
    ],
    warps: { '5,7': { map: 'hometown', x: 10, y: 18, facing: 'down' } },
    signs: {},
    npcs: [
      { id: 'prof', x: 5, y: 2, kind: 'prof', facing: 'down', special: 'prof' },
      { id: 'rex', x: 8, y: 3, kind: 'rival', facing: 'down', hiddenIf: 'rex_gone',
        dialog: [
          "REX: Oh, it's you. Took you long enough to roll out of bed.",
          "REX: I'm only waiting because MAPLE made me. Hurry up and pick so I can pick better.",
        ] },
    ],
  },

  // ------------------------------------------------ FERNWAY TRAIL (route)
  route1: {
    name: 'FERNWAY TRAIL',
    outdoor: true,
    rows: [
      'TTTTTTTTT::TTTTTTTTT',
      'T........::........T',
      'T..ttt...::...ttt..T',
      'T..ttt...::...ttt..T',
      'T.ttttt..::..ttttt.T',
      'T........::........T',
      'T.tttt...::...tttt.T',
      'T.tttt...::...tttt.T',
      'T.tttt...::...tttt.T',
      'T........::........T',
      'T..s.....::........T',
      'T........::........T',
      'T........::..ttttt.T',
      'T........::..ttttt.T',
      'T........::..ttttt.T',
      'T........::........T',
      'T.WW.....::.....WW.T',
      'T.WW.....::.....WW.T',
      'T........::........T',
      'Tttt.....::.....tttT',
      'Tttt.....::.....tttT',
      'T........::........T',
      'T........::........T',
      'TTTTTTTTT::TTTTTTTTT',
    ],
    links: { up: 'stonegate', down: 'hometown' },
    warps: {},
    signs: {
      '3,10': 'FERNWAY TRAIL\nWild creatures lurk in the tall grass!',
    },
    encounters: {
      rate: 0.14,
      levels: [2, 5],
      table: [
        ['pidgey', 30], ['rattata', 30], ['caterpie', 20], ['weedle', 20],
      ],
    },
    npcs: [
      { id: 'cal', x: 8, y: 8, kind: 'scout', facing: 'right',
        trainer: {
          flag: 'tr_cal', name: 'Scout CAL', range: 3,
          party: [['rattata', 5]], prize: 100,
          intro: ['Halt! Nobody walks the FERNWAY without saying hello to me first.',
                  'And around here, "hello" means BATTLE!'],
          loseText: 'Routed on my own route!',
          after: ['Not bad at all. You keep your cool when the pressure is on.',
                  'The gym up in STONEGATE rewards that. Go see for yourself.'],
        } },
      { id: 'mira', x: 11, y: 13, kind: 'picnic', facing: 'left',
        trainer: {
          flag: 'tr_mira', name: 'Picnicker MIRA', range: 3,
          party: [['caterpie', 4], ['weedle', 4]], prize: 80,
          intro: ['Shh! You almost stepped on my bug friends!',
                  'As an apology, you can battle them. They love the exercise!'],
          loseText: 'Squished!',
          after: ['Bug types grow up so fast. One day a CATERPIE, next week wings!',
                  'Raise one yourself and see. They are everywhere in this grass.'],
        } },
    ],
  },

  // ------------------------------------------------ STONEGATE (gym town)
  stonegate: {
    name: 'STONEGATE',
    outdoor: true,
    rows: [
      'TTTTTTTTTTTTTTTTTTTT',
      'T..................T',
      'T..................T',
      'T..................T',
      'T..................T',
      'T....rrrrrrr.......T',
      'T....rrrrrrr.......T',
      'T....wwwDwww..s....T',
      'T.......:..........T',
      'T.......:..........T',
      'T.......:..........T',
      'T.RRRRR.:....MMMMM.T',
      'T.RRRRR.:....MMMMM.T',
      'T.wcDww.:....wDgww.T',
      'T.s.:...:.....:..s.T',
      'T...::::::::::::...T',
      'T........:.........T',
      'T..s.....:.........T',
      'T........:.........T',
      'TTTTTTTTT::TTTTTTTTT',
    ],
    links: { down: 'route1' },
    warps: {
      '4,13':  { map: 'healstone', x: 6, y: 5, facing: 'up' },
      '14,13': { map: 'shop1',     x: 5, y: 4, facing: 'up' },
      '8,7':   { map: 'gym',       x: 6, y: 9, facing: 'up' },
    },
    signs: {
      '14,7': 'STONEGATE GYM\nLeader: MASON, the Wall That Walks.',
      '2,14': 'POKEMON CENTER\nHeal your team — free of charge.',
      '17,14': 'POKE MART\nEverything a trainer needs.',
      '3,17': 'STONEGATE\n"Built on rock, run on grit."',
    },
    npcs: [
      { id: 'sv1', x: 13, y: 16, kind: 'villager2', facing: 'down',
        dialog: [
          'Challenging MASON? Listen close, because everyone learns this the hard way.',
          'His team shrugs off weak hits. Chip damage will not get you anywhere.',
          'Bring something that hits HARD, or wear him down with poison and powders.',
        ] },
      { id: 'sv2', x: 16, y: 16, kind: 'villager', facing: 'left',
        dialog: [
          'The POKEMON CENTER fixed my PIDGEY up in seconds. Marvelous machine they have.',
          'Rest your team before the gym. Walking in tired is walking out crying.',
        ] },
    ],
  },

  // ------------------------------------------------ Interiors (Stonegate)
  healstone: {
    name: 'POKEMON CENTER',
    rows: [
      'wwwwwwwwwwww',
      'w__H_______w',
      'w__kkkkkk__w',
      'w__________w',
      'w_n______n_w',
      'w__________w',
      'w_____m____w',
      'wwwwwwwwwwww',
    ],
    warps: { '6,6': { map: 'stonegate', x: 4, y: 14, facing: 'down' } },
    signs: {},
    npcs: [
      { id: 'nurse1', x: 5, y: 1, kind: 'nurse', facing: 'down', special: 'nurse' },
    ],
  },

  shop1: {
    name: 'POKE MART',
    rows: [
      'wwwwwwwwww',
      'w___G_GG_w',
      'w_kkkk___w',
      'w________w',
      'w______G_w',
      'w____m___w',
      'wwwwwwwwww',
    ],
    warps: { '5,5': { map: 'stonegate', x: 14, y: 14, facing: 'down' } },
    signs: {},
    npcs: [
      { id: 'clerk1', x: 3, y: 1, kind: 'clerk', facing: 'down', special: 'shop' },
    ],
  },

  gym: {
    name: 'STONEGATE GYM',
    rows: [
      'wwwwwwwwwwww',
      'w__________w',
      'w__________w',
      'w__O____O__w',
      'w__________w',
      'w____O_____w',
      'w__________w',
      'w__________w',
      'w__O____O__w',
      'w__________w',
      'w_____m____w',
      'wwwwwwwwwwww',
    ],
    warps: { '6,10': { map: 'stonegate', x: 8, y: 8, facing: 'down' } },
    signs: {},
    npcs: [
      { id: 'rocco', x: 3, y: 6, kind: 'hiker', facing: 'right',
        trainer: {
          flag: 'tr_rocco', name: 'Trainee ROCCO', range: 3,
          party: [['metapod', 9], ['kakuna', 9]], prize: 180,
          intro: ['MASON taught me that defense wins championships.',
                  'My partners are basically two very angry rocks. Observe!'],
          loseText: 'Cracked clean through!',
          after: ['You broke the shell. Few do.',
                  'MASON hits a lot harder than he blocks, though. Brace yourself.'],
        } },
      { id: 'mason', x: 5, y: 1, kind: 'leader', facing: 'down', special: 'leader',
        trainer: {
          flag: 'tr_mason', name: 'Leader MASON', range: 0,
          party: [['pidgeotto', 11], ['raticate', 13]], prize: 1300, badge: true,
          intro: ['So you are the one ROCCO could not stop. I am MASON. I cut stone for a living and trainers for fun.',
                  'My team is hard as the cliffs this town stands on. Chisel away, if you can!'],
          loseText: 'Well struck... the wall comes down.',
          after: ['Take the GRANITE BADGE. You have earned every gram of it.',
                  'The world past STONEGATE is wide and wild. Go meet it head on.'],
        } },
    ],
  },
};
