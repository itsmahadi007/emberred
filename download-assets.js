// Dev-only: downloads sprite/item assets locally (node download-assets.js).
// Sources: 42arch/pokemon-dataset-zh (front renders) and PokeAPI/sprites
// (back sprites, item icons, front fallbacks). The game itself never
// hotlinks — it only reads from the local assets/ folder.
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = __dirname;
const DIRS = ['assets', 'assets/sprites', 'assets/sprites/front', 'assets/sprites/back',
  'assets/sprites/front-shiny', 'assets/sprites/back-shiny', 'assets/items'];
for (const d of DIRS) fs.mkdirSync(path.join(ROOT, d), { recursive: true });

// First 20 National Dex entries with their official Chinese names
// (pokemon-dataset-zh home/ filename convention: NNNN-<zh-name>.png).
const SPECIES_ZH = [
  [1, '妙蛙种子'], [2, '妙蛙草'], [3, '妙蛙花'],
  [4, '小火龙'], [5, '火恐龙'], [6, '喷火龙'],
  [7, '杰尼龟'], [8, '卡咪龟'], [9, '水箭龟'],
  [10, '绿毛虫'], [11, '铁甲蛹'], [12, '巴大蝶'],
  [13, '独角虫'], [14, '铁壳蛹'], [15, '大针蜂'],
  [16, '波波'], [17, '比比鸟'], [18, '大比鸟'],
  [19, '小拉达'], [20, '拉达'],
];

const ITEMS = [
  'poke-ball', 'great-ball', 'potion', 'super-potion', 'antidote',
  'paralyze-heal', 'awakening', 'burn-heal', 'ice-heal', 'full-heal',
];

const ZH_BASE = 'https://raw.githubusercontent.com/42arch/pokemon-dataset-zh/main/data/images/home/';
const API_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/';

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return get(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function isPng(buf) {
  return buf && buf.length > 100 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
}

async function fetchTo(dest, urls) {
  const out = path.join(ROOT, dest);
  if (fs.existsSync(out) && isPng(fs.readFileSync(out))) {
    console.log(`skip   ${dest} (exists)`);
    return true;
  }
  for (const url of urls) {
    try {
      const buf = await get(url);
      if (!isPng(buf)) throw new Error('not a PNG');
      fs.writeFileSync(out, buf);
      console.log(`ok     ${dest}  <-  ${decodeURI(url).slice(0, 90)}`);
      return true;
    } catch (e) {
      console.log(`retry  ${dest}: ${e.message}`);
    }
  }
  console.log(`FAIL   ${dest}`);
  return false;
}

(async () => {
  let fails = 0;
  for (const [id, zh] of SPECIES_ZH) {
    const nnnn = String(id).padStart(4, '0');
    const okF = await fetchTo(`assets/sprites/front/${id}.png`, [
      ZH_BASE + encodeURIComponent(`${nnnn}-${zh}.png`),
      `${API_BASE}pokemon/${id}.png`, // fallback
    ]);
    const okB = await fetchTo(`assets/sprites/back/${id}.png`, [
      `${API_BASE}pokemon/back/${id}.png`,
    ]);
    const okFS = await fetchTo(`assets/sprites/front-shiny/${id}.png`, [
      `${API_BASE}pokemon/shiny/${id}.png`,
    ]);
    const okBS = await fetchTo(`assets/sprites/back-shiny/${id}.png`, [
      `${API_BASE}pokemon/back/shiny/${id}.png`,
    ]);
    if (!okF || !okB || !okFS || !okBS) fails++;
  }
  for (const item of ITEMS) {
    const ok = await fetchTo(`assets/items/${item}.png`, [
      `${API_BASE}items/${item}.png`,
    ]);
    if (!ok) fails++;
  }
  console.log(fails ? `${fails} DOWNLOADS FAILED` : 'ALL ASSETS DOWNLOADED');
  process.exit(fails ? 1 : 0);
})();
