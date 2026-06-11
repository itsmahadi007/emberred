// ===== All art is original, drawn in code =====
// Creature sprites are 16x16 pixel maps. Default: 16 rows of 8 chars,
// mirrored to 16 wide. Sprites with `wide: true` use full 16-char rows.
// '.' = transparent; other chars index into the sprite's palette.

function _expandRows(rows, mirror) {
  return rows.map(r => mirror ? r + r.split('').reverse().join('') : r);
}

function spriteFromRows(rows, pal, mirror = true) {
  const full = _expandRows(rows, mirror);
  const h = full.length, w = full[0].length;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const x = cv.getContext('2d');
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const ch = full[j][i];
      if (ch === '.' || !pal[ch]) continue;
      x.fillStyle = pal[ch];
      x.fillRect(i, j, 1, 1);
    }
  }
  return cv;
}

// ---------- Creature pixel art (original interpretations) ----------
const CREATURE_ART = {
  bulbasaur: { pal: { o:'#1c3a30', g:'#52a08a', d:'#3a7a66', b:'#4caa50', l:'#7cd880', e:'#c83838', p:'#200808' }, rows: [
    '........', '.....bb.', '...bblb.', '....bbb.', '...ooooo', '..oggggg',
    '.ogepggg', '.ogggggg', '.oggdggg', '..oooggg', '.ogggggg', '.ogdgggg',
    '.oggggdg', '.ogdgggg', '..og..og', '..oo..oo',
  ]},
  ivysaur: { pal: { o:'#1c3a30', g:'#52a08a', d:'#3a7a66', b:'#e87898', l:'#f8b8c8', f:'#4caa50', e:'#c83838', p:'#200808' }, rows: [
    '.....lb.', '....bbb.', '...fbff.', '..fffff.', '...ooooo', '..oggggg',
    '.ogepggg', '.ogggggg', '.oggdggg', '..oooggg', '.ogggggg', '.ogdgggg',
    '.oggggdg', '.ogdgggg', '..og..og', '..oo..oo',
  ]},
  venusaur: { pal: { o:'#16302a', g:'#46907c', d:'#306856', b:'#e85878', l:'#f8a8b8', f:'#3e9444', y:'#f8e060', e:'#c83838', p:'#200808' }, rows: [
    '..lb.bl.', '.lbbybb.', '..bbbbb.', '..fffff.', '.offffff', '.oogggggg'.slice(0,8),
    'ogepgggg', 'oggggggg', 'oggdgggg', 'oogggggg', 'ogggdggg', 'ogdggggg',
    'oggggdgg', 'ogdgggdg', '.ogg.ogg', '.ooo.ooo',
  ]},
  charmander: { wide: true, pal: { o:'#5a2410', g:'#f08838', d:'#d06820', c:'#f8e0a8', e:'#fff', p:'#281008', f:'#f8d030', r:'#f06028' }, rows: [
    '................', '.....oooo.......', '....oggggo......', '...oggggggo.....',
    '...ogepgggo.....', '...ogggggo......', '....ogggo.......', '...ogggggo......',
    '..ogccccggo..f..', '..ogccccggo.frf.', '..ogccccggo.frf.', '...ogccggo..of..',
    '...oggggggo.o...', '....oggggggoo...', '....og..og......', '....oo..oo......',
  ]},
  charmeleon: { wide: true, pal: { o:'#481c10', g:'#d84830', d:'#b03020', c:'#f8d8a0', e:'#fff', p:'#240a06', f:'#f8d030', r:'#f06028', h:'#a02818' }, rows: [
    '......o.........', '.....ohoo.......', '....oggggo......', '...oggggggo.....',
    '...ogepgggo.....', '...ogggggo......', '....ogggo...ff..', '...ogggggo.frrf.',
    '..ogccccggo.frf.', '..ogccccggo.frf.', '..ogccccggo..f..', '...ogccggo...o..',
    '...oggggggo..o..', '....ogggggoo.o..', '....og..ogoo....', '....oo..oo......',
  ]},
  charizard: { pal: { o:'#48200e', g:'#f08030', d:'#c86018', c:'#f8e0a8', w:'#3878a8', l:'#60a8d8', e:'#f8e858', p:'#241006' }, rows: [
    '...o..o.', '..oooooo', '..oggggg', '.ogggggg', '.ogepggg', '.ogggggg',
    'w..ooggg', 'ww.ogggg', 'lwwogccc', 'llwogccc', 'lwoggccc', 'w.oggccc',
    '..ogggcc', '.ogggggg', '..og..og', '..oo..oo',
  ]},
  squirtle: { pal: { o:'#1c3450', g:'#58a8e0', d:'#3880b8', s:'#c89858', t:'#e8d8a8', e:'#fff', p:'#101c30' }, rows: [
    '........', '...oooo.', '..oggggo', '.ogggggg', '.ogepggg', '.ogggggg',
    '..oggggo', '..osssss', '.ogtttts', '.ogtttts', '.ogtttts', '..osssss',
    '..oggggg', '...ogggg', '...og.og', '...oo.oo',
  ]},
  wartortle: { pal: { o:'#243044', g:'#7890c0', d:'#5870a0', s:'#b08850', t:'#e8d8a8', w:'#d8e0f0', e:'#fff', p:'#10182c' }, rows: [
    '.w......', 'ww.oooo.', '.woggggo', '.ogggggg', '.ogepggg', '.ogggggg',
    '..oggggo', '..osssss', '.ogtttts', '.ogtttts', 'wogtttts', 'ww.sssss',
    'w.oggggg', '...ogggg', '...og.og', '...oo.oo',
  ]},
  blastoise: { pal: { o:'#1c2c44', g:'#4878b8', d:'#305890', s:'#b09060', t:'#e8d8a8', k:'#a8b0b8', e:'#fff', p:'#0c1628' }, rows: [
    '........', '..oooooo', '.ogggggg', 'kogepggg', 'kkgggggg', 'kogggggg',
    '.ooggggg', '.ossssss', 'ogtttttt', 'ogtttttt', 'ogtttttt', 'ogtttttt',
    '.ossssss', '.ogggggg', '..ogg.og', '..ooo.oo',
  ]},
  caterpie: { pal: { o:'#243c14', g:'#78c048', d:'#58a030', y:'#e8e090', r:'#e85048', e:'#fff', p:'#142408' }, rows: [
    '....r.r.', '....rrr.', '...ooooo', '..oggggg', '..ogepgg', '..oyyggg',
    '...ooooo', '..oggggg', '..ogdggg', '...ooooo', '..oggggg', '..ogdggg',
    '...ooooo', '..oggggg', '...oyyyy', '....oooo',
  ]},
  metapod: { pal: { o:'#1e3812', g:'#68a838', d:'#4c8424', l:'#90c860', e:'#203010', p:'#101808' }, rows: [
    '.......o', '.....oog', '....oggg', '...ogggg', '..ogggdg', '..ogggg.',
    '.oggpeg.', '.ogggggg', '.ogggdgg', '.oggggdg', '.olggggg', '.olggdgg',
    '..olgggg', '..lloggg', '...ollgg', '....oooo',
  ]},
  butterfree: { pal: { o:'#2c2440', g:'#7058a0', d:'#504078', w:'#f4f4f8', l:'#d8d8e8', e:'#e84848', p:'#481010' }, rows: [
    '.o....o.', '..o..o..', '.wwwoooo', 'wwwwwogg', 'wwwwooge', 'wwwwogep',
    '.wwwoggg', '..wwoggg', '..wwoggg', '.wwwwogg', 'wwwwwogd', 'wwwwoggg',
    'wwwooggg', '.ww.oggd', '......og', '.......o',
  ]},
  weedle: { pal: { o:'#3c2c14', g:'#d8a858', d:'#b88840', y:'#f0c878', r:'#e87878', e:'#fff', p:'#241808' }, rows: [
    '.......o', '......oo', '...oooog', '..oggggg', '..ogepgg', '..ogggrr',
    '...ooooo', '..oyyggg', '..ogggdg', '...ooooo', '..oggggg', '..ogdggg',
    '...ooooo', '...ogggg', '....oyyy', '.....ooo',
  ]},
  kakuna: { pal: { o:'#4a3808', g:'#e8c838', d:'#c8a020', l:'#f8e070', e:'#241c04', p:'#100c02' }, rows: [
    '........', '...oooo.', '..ogggg.', '..olggg.', '.oglggg.', '.oggggg.',
    '.ogepgg.', '.ogggggg', '.ogdggg.', '.oggggg.', '.ogdggg.', '..ogggg.',
    '..ogdgg.', '..olggg.', '...oggg.', '....ooo.',
  ]},
  beedrill: { pal: { o:'#3c2c08', g:'#f0c838', d:'#a87818', k:'#302408', w:'#e8e8f0', n:'#d8d8d8', e:'#c83838', p:'#400c0c' }, rows: [
    '.o....o.', '..o..o..', '...oooo.', '..oggggo', '..ogepgo', '...oooo.',
    'w.ogggg.', 'ww.oggg.', '.wwoooo.', 'n.oggggo', 'nnogkkgo', '.nogggg.',
    '..ogkkg.', '...oggg.', '....oo..', '.....o..',
  ]},
  pidgey: { pal: { o:'#3a2c18', g:'#c09058', d:'#a07038', c:'#f0e0c0', y:'#e8b040', e:'#241608', p:'#100a04' }, rows: [
    '........', '........', '...oooo.', '..oggggo', '..oepggg', '..ogggyy',
    '...ooooo', '..ogcccc', '.oggcccc', '.ogdgccc', '.oggdgcc', '..ogggcc',
    '..odgggg', '...ogggg', '....oyy.', '....yy..',
  ]},
  pidgeotto: { pal: { o:'#342414', g:'#b08048', d:'#906030', c:'#f0e0c0', r:'#e86848', y:'#e8b040', e:'#241608', p:'#100a04' }, rows: [
    '....r...', '...rr...', '...orro.', '..oggggo', '..ogepgg', '..ogggyy',
    '...ooooo', '..ogcccc', '.oggcccc', '.ogdgccc', '.oggdgcc', '.oggggcc',
    '..odggcc', '...ogggg', '....oyy.', '....yy..',
  ]},
  pidgeot: { pal: { o:'#30200e', g:'#c89858', d:'#a87838', c:'#f8ecd0', r:'#e85838', y:'#f8d048', e:'#241608', p:'#100a04' }, rows: [
    '....y...', '...yr...', '...ry...', '...oyro.', '..oggggo', '..ogepgg',
    '..ogggyy', '..oooooo', '.oggcccc', '.oggcccc', 'oggdgccc', 'oggggccc',
    '.ogdggcc', '..oggggg', '...ogyy.', '....yy..',
  ]},
  rattata: { pal: { o:'#2c1c34', g:'#9068b0', d:'#704c90', c:'#e8d8c8', w:'#f8f8f8', e:'#c83838', p:'#380c0c' }, rows: [
    '.o...o..', '.oo.oo..', '.ogoogo.', '..ogggg.', '.ogepggg', '..oggggg',
    '...owwgg', '...ooogg', '..oggggg', '.oggdggg', '.ogggggg', '.ogdgggg',
    '..oggggg', '..ogggg.', '..og.og.', '..oo.oo.',
  ]},
  raticate: { pal: { o:'#342414', g:'#c09058', d:'#a07038', c:'#f0e4d0', w:'#f8f8f8', k:'#705838', e:'#c83838', p:'#380c0c' }, rows: [
    '.oo..oo.', '.ogo.ogo', '..oggggo', '.ogggggg', '.ogepggg', 'k.oggggg',
    '.k.owwgg', '..kooogg', '.occcggg', 'occcgggg', 'occgggdg', 'ocgggggg',
    '.ogdgggg', '..oggggg', '..ogg.og', '..ooo.oo',
  ]},
};

// ---------- Human pixel art (player + NPC palette swaps) ----------
const HUMAN_DOWN = [
  '........', '...ooooo', '..occccc', '..occccc', '..ohssss', '..ohspss',
  '..ohssss', '...ossss', '..obbbbb', '.osbbbbb', '.osbbbbb', '..obbbbb',
  '..onnnnn', '...onnnn', '...onn..', '...oo...',
];
const HUMAN_UP = [
  '........', '...ooooo', '..occccc', '..occccc', '..ohhhhh', '..ohhhhh',
  '..ohhhhh', '...ohhhh', '..obbbbb', '.osbbbbb', '.osbbbbb', '..obbbbb',
  '..onnnnn', '...onnnn', '...onn..', '...oo...',
];
// Side view is asymmetric: full 16-wide rows (facing left).
const HUMAN_SIDE = [
  '................', '.....oooooo.....', '....occccccc...', '....occcccccc..',
  '....ohsssshho...', '....ohpssshho...', '....ohsssshho...', '.....ossssoo....',
  '.....obbbbbbo...', '....osbbbbbbo...', '....osbbbbbbo...', '.....obbbbbo....',
  '.....onnnnno....', '.....onnnnno....', '.....onn.nno....', '.....oo..oo.....',
];

const HUMAN_PALETTES = {
  player:  { o:'#2c2420', c:'#d04030', h:'#5a3a20', s:'#f0c8a0', p:'#241c14', b:'#3858b8', n:'#384048', e:'#fff' },
  rival:   { o:'#2c2420', c:'#5a4028', h:'#5a4028', s:'#f0c8a0', p:'#241c14', b:'#8048a8', n:'#303840', e:'#fff' },
  parent:  { o:'#2c2420', c:'#7a4a28', h:'#7a4a28', s:'#f0c8a0', p:'#241c14', b:'#d87890', n:'#806858', e:'#fff' },
  villager:{ o:'#2c2420', c:'#7a5a34', h:'#7a5a34', s:'#f0c8a0', p:'#241c14', b:'#58a050', n:'#605040', e:'#fff' },
  villager2:{o:'#2c2420', c:'#404858', h:'#404858', s:'#e8bc94', p:'#241c14', b:'#c8a040', n:'#485058', e:'#fff' },
  nurse:   { o:'#2c2420', c:'#e88098', h:'#e88098', s:'#f8d8b8', p:'#241c14', b:'#f8f0f0', n:'#e88098', e:'#fff' },
  clerk:   { o:'#2c2420', c:'#3878a8', h:'#3878a8', s:'#f0c8a0', p:'#241c14', b:'#4890c0', n:'#28404e', e:'#fff' },
  prof:    { o:'#2c2420', c:'#9a9a96', h:'#9a9a96', s:'#f0c8a0', p:'#241c14', b:'#e8e8e0', n:'#506050', e:'#fff' },
  scout:   { o:'#2c2420', c:'#e89030', h:'#4a3018', s:'#f0c8a0', p:'#241c14', b:'#e8a040', n:'#506858', e:'#fff' },
  picnic:  { o:'#2c2420', c:'#d05060', h:'#7a3a20', s:'#f0c8a0', p:'#241c14', b:'#48a8a0', n:'#a04858', e:'#fff' },
  hiker:   { o:'#2c2420', c:'#6a5038', h:'#6a5038', s:'#e0b088', p:'#241c14', b:'#907858', n:'#4a3c2c', e:'#fff' },
  leader:  { o:'#2c2420', c:'#b03828', h:'#302820', s:'#e8bc94', p:'#241c14', b:'#883028', n:'#282830', e:'#fff' },
};

// ---------- Tile art (16x16, drawn procedurally) ----------
function _tileCanvas(draw) {
  const cv = document.createElement('canvas');
  cv.width = 16; cv.height = 16;
  const x = cv.getContext('2d');
  draw(x);
  return cv;
}

// Deterministic speckle positions so tiles look hand-placed, not noisy.
const _SPECK = [[2,3],[7,1],[12,4],[4,9],[10,11],[14,8],[1,13],[8,14],[13,13],[5,6]];

function _grassBase(x) {
  x.fillStyle = '#78c850'; x.fillRect(0, 0, 16, 16);
  x.fillStyle = '#68b845';
  for (const [i, j] of _SPECK) x.fillRect(i, j, 2, 1);
}
function _floorBase(x) {
  x.fillStyle = '#e8e0cc'; x.fillRect(0, 0, 16, 16);
  x.strokeStyle = '#d8d0b8'; x.lineWidth = 1;
  x.strokeRect(0.5, 0.5, 15, 15);
}

const TILE_ART = {
  '.': _grassBase,
  ':': (x) => {
    x.fillStyle = '#e0d09c'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#d0bc84';
    for (const [i, j] of _SPECK) x.fillRect(i, j, 1, 1);
  },
  't': (x) => {
    _grassBase(x);
    x.fillStyle = '#3c8c34';
    for (const i of [1, 4, 7, 10, 13]) { x.fillRect(i, 5, 2, 10); x.fillRect(i + 1, 3, 1, 3); }
    x.fillStyle = '#58b048';
    for (const i of [2, 5, 8, 11, 14]) x.fillRect(i, 7, 1, 8);
  },
  'T': (x) => {
    _grassBase(x);
    x.fillStyle = '#7a4e24'; x.fillRect(6, 10, 4, 6);
    x.fillStyle = '#2c6c30'; x.fillRect(2, 2, 12, 10);
    x.fillStyle = '#38883c'; x.fillRect(3, 1, 10, 9);
    x.fillStyle = '#4ca050'; x.fillRect(4, 2, 4, 3); x.fillRect(9, 5, 3, 2);
  },
  'W': (x) => {
    x.fillStyle = '#4088d8'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#70b0ec';
    x.fillRect(2, 4, 5, 1); x.fillRect(9, 9, 5, 1); x.fillRect(4, 13, 4, 1);
  },
  'F': (x) => {
    _grassBase(x);
    x.fillStyle = '#e84840'; x.fillRect(3, 3, 3, 3); x.fillStyle = '#f8e8a0'; x.fillRect(4, 4, 1, 1);
    x.fillStyle = '#f8d030'; x.fillRect(10, 9, 3, 3); x.fillStyle = '#fff'; x.fillRect(11, 10, 1, 1);
  },
  'f': (x) => {
    _grassBase(x);
    x.fillStyle = '#a87848'; x.fillRect(0, 6, 16, 3); x.fillRect(0, 11, 16, 2);
    x.fillStyle = '#8a5e34'; x.fillRect(2, 4, 3, 11); x.fillRect(11, 4, 3, 11);
  },
  'r': (x) => {
    x.fillStyle = '#c84840'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#a83028'; x.fillRect(0, 5, 16, 2); x.fillRect(0, 12, 16, 2);
    x.fillStyle = '#e06858'; x.fillRect(0, 0, 16, 2);
  },
  'w': (x) => {
    x.fillStyle = '#d8d0bc'; x.fillRect(0, 0, 16, 16);
    x.strokeStyle = '#b0a890'; x.lineWidth = 1;
    x.beginPath();
    x.moveTo(0, 5.5); x.lineTo(16, 5.5); x.moveTo(0, 10.5); x.lineTo(16, 10.5);
    x.moveTo(8.5, 0); x.lineTo(8.5, 5.5); x.moveTo(4.5, 5.5); x.lineTo(4.5, 10.5);
    x.moveTo(12.5, 5.5); x.lineTo(12.5, 10.5); x.moveTo(8.5, 10.5); x.lineTo(8.5, 16);
    x.stroke();
    x.fillStyle = '#c0b8a0'; x.fillRect(0, 14, 16, 2);
  },
  'D': (x) => {
    TILE_ART['w'](x);
    x.fillStyle = '#6a4220'; x.fillRect(2, 1, 12, 15);
    x.fillStyle = '#8a5e34'; x.fillRect(3, 2, 10, 13);
    x.fillStyle = '#503014'; x.fillRect(4, 4, 8, 11);
    x.fillStyle = '#e8c860'; x.fillRect(10, 9, 2, 2);
  },
  's': (x) => {
    _grassBase(x);
    x.fillStyle = '#7a4e24'; x.fillRect(7, 8, 2, 8);
    x.fillStyle = '#c89858'; x.fillRect(2, 2, 12, 7);
    x.fillStyle = '#8a6434'; x.fillRect(3, 4, 10, 1); x.fillRect(3, 6, 10, 1);
  },
  '_': _floorBase,
  'k': (x) => {
    x.fillStyle = '#b07840'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#d09858'; x.fillRect(0, 0, 16, 6);
    x.fillStyle = '#8a5e30'; x.fillRect(0, 6, 16, 2);
  },
  'm': (x) => {
    _floorBase(x);
    x.fillStyle = '#788088'; x.fillRect(1, 1, 14, 14);
    x.fillStyle = '#98a0a8'; x.fillRect(3, 3, 10, 10);
  },
  'b': (x) => {
    x.fillStyle = '#7a4e24'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#503014'; x.fillRect(1, 2, 14, 5); x.fillRect(1, 9, 14, 5);
    const cols = ['#c84840', '#4878c8', '#48a050', '#d8b030'];
    cols.forEach((c, i) => { x.fillStyle = c; x.fillRect(2 + i * 3, 3, 2, 4); x.fillRect(3 + i * 3, 10, 2, 4); });
  },
  'O': (x) => {
    _floorBase(x);
    x.fillStyle = '#686058'; x.fillRect(2, 4, 12, 11);
    x.fillStyle = '#8a8278'; x.fillRect(3, 3, 10, 10);
    x.fillStyle = '#a8a098'; x.fillRect(4, 4, 5, 4);
  },
  'R': (x) => { // healing-center roof (bright red, rounded shading)
    x.fillStyle = '#e84838'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#c02818'; x.fillRect(0, 5, 16, 2); x.fillRect(0, 12, 16, 2);
    x.fillStyle = '#f87860'; x.fillRect(0, 0, 16, 2);
  },
  'M': (x) => { // mart roof (blue)
    x.fillStyle = '#3868d8'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#2848a8'; x.fillRect(0, 5, 16, 2); x.fillRect(0, 12, 16, 2);
    x.fillStyle = '#6898f0'; x.fillRect(0, 0, 16, 2);
  },
  'c': (x) => { // wall tile with ball emblem (healing center sign)
    TILE_ART['w'](x);
    x.fillStyle = '#f8f8f8'; x.fillRect(2, 2, 12, 12);
    x.fillStyle = '#383838'; x.fillRect(2, 2, 12, 1); x.fillRect(2, 13, 12, 1);
    x.fillRect(2, 2, 1, 12); x.fillRect(13, 2, 1, 12);
    x.fillStyle = '#e84838'; x.fillRect(5, 4, 6, 3);   // ball top half
    x.fillStyle = '#383838'; x.fillRect(5, 7, 6, 1);   // band
    x.fillStyle = '#d8d8d8'; x.fillRect(5, 8, 6, 3);   // bottom half
    x.fillStyle = '#383838'; x.fillRect(7, 6, 2, 2);   // button
  },
  'g': (x) => { // wall tile with mart emblem
    TILE_ART['w'](x);
    x.fillStyle = '#f8f8f8'; x.fillRect(2, 2, 12, 12);
    x.fillStyle = '#2848a8'; x.fillRect(3, 3, 10, 10);
    x.fillStyle = '#f8f8f8'; x.fillRect(5, 5, 2, 5); x.fillRect(9, 5, 2, 5);
    x.fillRect(7, 7, 2, 3);
  },
  'H': (x) => { // healing machine (interior)
    _floorBase(x);
    x.fillStyle = '#b8c0c8'; x.fillRect(1, 2, 14, 13);
    x.fillStyle = '#8890a0'; x.fillRect(1, 2, 14, 3);
    x.fillStyle = '#303840'; x.fillRect(3, 7, 10, 6);
    x.fillStyle = '#e84838'; x.fillRect(4, 8, 3, 2); x.fillRect(9, 8, 3, 2);
    x.fillStyle = '#f8f8f8'; x.fillRect(4, 11, 3, 1); x.fillRect(9, 11, 3, 1);
    x.fillStyle = '#48e858'; x.fillRect(12, 3, 2, 1);
  },
  'G': (x) => { // goods shelf (mart interior)
    x.fillStyle = '#4868b8'; x.fillRect(0, 0, 16, 16);
    x.fillStyle = '#283878'; x.fillRect(1, 4, 14, 4); x.fillRect(1, 10, 14, 4);
    const goods = ['#e8d048', '#e85048', '#58c858', '#f8f8f8'];
    goods.forEach((cl, i) => {
      x.fillStyle = cl;
      x.fillRect(2 + i * 3.5, 5, 3, 3); x.fillRect(2 + ((i + 2) % 4) * 3.5, 11, 3, 3);
    });
  },
  'n': (x) => { // bench (interior)
    _floorBase(x);
    x.fillStyle = '#7a4e24'; x.fillRect(1, 5, 14, 7);
    x.fillStyle = '#a87848'; x.fillRect(1, 5, 14, 3);
    x.fillStyle = '#503014'; x.fillRect(2, 12, 2, 3); x.fillRect(12, 12, 2, 3);
  },
  'B': (x) => { // bed
    _floorBase(x);
    x.fillStyle = '#7a4e24'; x.fillRect(1, 1, 14, 14);
    x.fillStyle = '#d04848'; x.fillRect(2, 5, 12, 9);
    x.fillStyle = '#e87070'; x.fillRect(2, 5, 12, 3);
    x.fillStyle = '#f8f8f0'; x.fillRect(3, 2, 10, 3);
  },
  'h': (x) => { // stairs
    _floorBase(x);
    x.fillStyle = '#a09888';
    x.fillRect(1, 1, 14, 14);
    x.fillStyle = '#c8c0b0';
    for (const y of [2, 6, 10]) x.fillRect(2, y, 12, 3);
    x.fillStyle = '#706858'; x.fillRect(1, 1, 1, 14); x.fillRect(14, 1, 1, 14);
  },
  'x': (x) => { x.fillStyle = '#101018'; x.fillRect(0, 0, 16, 16); },
};

// Starter pedestal tiles: desk with a colored ball device.
function _pedestal(orbColor) {
  return (x) => {
    _floorBase(x);
    x.fillStyle = '#b07840'; x.fillRect(1, 6, 14, 9);
    x.fillStyle = '#d09858'; x.fillRect(1, 6, 14, 3);
    x.fillStyle = '#303030'; x.fillRect(5, 2, 6, 6);
    x.fillStyle = orbColor;  x.fillRect(6, 3, 4, 4);
    x.fillStyle = '#ffffff'; x.fillRect(6, 3, 2, 2);
  };
}
TILE_ART['1'] = _pedestal('#78c850');
TILE_ART['2'] = _pedestal('#f08030');
TILE_ART['3'] = _pedestal('#6890f0');

// ---------- Sprite cache / API ----------
const Sprites = {
  tiles: {},
  creatures: {},
  humans: {},

  init() {
    for (const ch of Object.keys(TILE_ART)) this.tiles[ch] = _tileCanvas(TILE_ART[ch]);
    for (const id of Object.keys(CREATURE_ART)) {
      const a = CREATURE_ART[id];
      this.creatures[id] = spriteFromRows(a.rows, a.pal, !a.wide);
    }
    for (const kind of Object.keys(HUMAN_PALETTES)) {
      const pal = HUMAN_PALETTES[kind];
      this.humans[kind] = {
        down: spriteFromRows(HUMAN_DOWN, pal, true),
        up: spriteFromRows(HUMAN_UP, pal, true),
        left: spriteFromRows(HUMAN_SIDE, pal, false),
        right: _flipped(spriteFromRows(HUMAN_SIDE, pal, false)),
      };
    }
  },

  tile(ch) { return this.tiles[ch] || this.tiles['.']; },
  creature(id) { return this.creatures[id]; },
  human(kind, facing) {
    const h = this.humans[kind] || this.humans.villager;
    return h[facing] || h.down;
  },
};

function _flipped(cv) {
  const out = document.createElement('canvas');
  out.width = cv.width; out.height = cv.height;
  const x = out.getContext('2d');
  x.translate(cv.width, 0); x.scale(-1, 1);
  x.drawImage(cv, 0, 0);
  return out;
}
