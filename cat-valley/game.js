/**
 * 妙脆角猫山谷 — 大世界 · 最初正脸猫
 */
const SAVE_VERSION = 19;
const VALLEY_BUILD = 34;
const STORAGE_KEY = `miao_cui_cat_valley_v${SAVE_VERSION}`;
const LEGACY_SAVE_KEYS = [
  'miao_cui_cat_valley_v18',
  'miao_cui_cat_valley_v17',
  'miao_cui_cat_valley_v16',
  'miao_cui_cat_valley_v10',
  'miao_cui_cat_valley_v9',
  'miao_cui_cat_valley_v8',
  'miao_cui_cat_valley_v7',
  'miao_cui_cat_valley_v6',
  'miao_cui_cat_valley_v5',
  'miao_cui_cat_valley_v4',
  'miao_cui_cat_valley_v3',
  'miao_cui_cat_valley_v2',
];

const HUNGER_FULL = 25;
const GACHA_COST = 100;
const COINS_PER_FEED = 5;
const COINS_FEED_FULL = 8;
const COINS_BIOME_FIRST = 12;
const COINS_WALK_EVERY = 650;
const COINS_WALK_CHUNK = 4;
const COINS_BOTH_HAPPY = 10;
const STREAM_DRIFT_MIN = 58;
const STREAM_DRIFT_MAX = 112;

const BERRY_PICK_RADIUS = 165;
const BERRY_TAP_RADIUS = 58;
const BERRY_REGROW_MS = 48000;
const BERRY_HUNGER_RELIEF = 24;
const CUICUI_GROUND_PICK_RADIUS = 85;
const CUICUI_TAP_RADIUS = 2.8;
const CUICUI_FRUIT_HIT_MIN = 42;
const CUICUI_BIOME_MIN = 0.22;
const CUICUI_REGROW_MS = 52000;
const CUICUI_HUNGER_RELIEF = 26;
const HUNGER_PECKISH = 65;
const HUNGER_STOP = 88;
const SPECIALTY_PICK_RADIUS = 155;
const SPECIALTY_TAP_RADIUS = 55;
const SPECIALTY_REGROW_MS = 50000;
const DATE_HUNGER_RELIEF = 22;
const CONE_HUNGER_RELIEF = 21;
const CLOVER_HUNGER_RELIEF = 20;
const GUIHUA_HUNGER_RELIEF = 19;

function makeCat(id, wx, wy, scale, label) {
  const pos = (wx == null || wy == null) ? CatWorld.spawnPosFor(id) : { x: wx, y: wy };
  return {
    id, wx: pos.x, wy: pos.y, scale, label,
    skinId: 'default',
    hunger: 82, happy: false, bounce: 0,
    facing: 1, vx: 0, vy: 0, walkPhase: 0, moving: false,
    tired: 0, onMountain: false, mountainElevation: 0,
    act: null, actT: 0, actDur: 0, idleSec: 0, resting: false,
  };
}

function placeCatAtSpawn(c) {
  const p = CatWorld.spawnPosFor(c.id);
  c.wx = p.x;
  c.wy = p.y;
  c.moving = false;
  c.tired = 0;
  c.onMountain = false;
  c.mountainElevation = 0;
  c.resting = false;
}

function reconcileCatHunger(c) {
  c.happy = c.hunger <= HUNGER_FULL;
}

function tickCatHunger(c, dist, dt) {
  const wasHappy = c.happy;
  const chillMul = state.chillMode ? 0.32 : 1;
  const restMul = (c.resting && !c.moving ? 0.28 : 1) * chillMul;
  if (c.happy) {
    c.hunger = Math.min(100, c.hunger + (dist * 0.016 + dt * (c.moving ? 1.4 : 0.55)) * restMul);
    if (c.hunger >= HUNGER_PECKISH) c.happy = false;
  } else if (c.hunger < 100) {
    if (c.resting && !c.moving) {
      c.hunger = Math.max(0, c.hunger - dt * (state.chillMode ? 1.4 : 1.1));
    } else {
      c.hunger = Math.min(100, c.hunger + dt * (state.chillMode ? 0.12 : 0.25));
    }
  }
  if (wasHappy && !c.happy) {
    state.bothHappyAwarded = false;
    if (c.id === state.selectedId) {
      showToast(`${c.label}走远了，又饿了～`);
      setCaption('幼崽又饿了——喂 🥐 小面包');
    }
    updateUI();
    save();
  }
}

function addCoins(n, toastMsg) {
  if (n <= 0) return;
  state.coins += n;
  if (toastMsg) showToast(toastMsg);
  updateUI();
  scheduleSave();
}

function checkBothHappyBonus() {
  if (state.bothHappyAwarded) return;
  if (!state.cats.every(c => c.happy)) return;
  state.bothHappyAwarded = true;
  addCoins(COINS_BOTH_HAPPY, `两只都吃饱了！+${COINS_BOTH_HAPPY} 金币`);
  save();
}

function tickExploreCoins(c, dist) {
  if (c.id !== state.selectedId || !c.happy || dist < 0.5) return;
  state.exploreMeters += dist;
  while (state.exploreMeters >= COINS_WALK_EVERY) {
    state.exploreMeters -= COINS_WALK_EVERY;
    addCoins(COINS_WALK_CHUNK, `探索山谷 +${COINS_WALK_CHUNK} 金币`);
  }
}

const state = {
  cats: [
    makeCat('big', null, null, 1, '大幼崽'),
    makeCat('small', null, null, 0.72, '小幼崽'),
  ],
  selectedId: 'big',
  input: { up: false, down: false, left: false, right: false },
  joystick: { active: false, x: 0, y: 0 },
  snacks: 6,
  wildBerries: 0,
  cuicuiFruits: 0,
  bushCooldowns: {},
  cuicuiCooldowns: {},
  cuicuiKnockedMap: {},
  cuicuiDrops: [],
  desertDates: 0,
  pineCones: 0,
  meadowClover: 0,
  osmanthusBlossoms: 0,
  specialtyCooldowns: {},
  nearBush: null,
  nearRest: null,
  inParadise: false,
  paradiseMode: false,
  paradiseFound: false,
  paradiseReturn: null,
  inTreasureRoom: false,
  treasureReturn: null,
  treasureRoomFound: false,
  secretMode: false,
  inSecretRoom: false,
  secretReturn: null,
  secretGateFound: false,
  secretRoomFound: false,
  secretOrbsFound: {},
  secretEnterBlockUntil: 0,
  photoMode: false,
  immerseLevel: 0,
  coins: 50,
  totalFed: 0,
  introSeen: false,
  unlockedSkins: ['default'],
  visitedBiomes: [],
  exploreMeters: 0,
  bothHappyAwarded: false,
  captionLoaded: false,
  crunch: null,
  weather: null,
  seasonIndex: -1,
  chillMode: false,
  treasureMode: false,
  treasuresFound: {},
  restVisits: 0,
};

let canvas, ctx, w, h;
let animId = null;
let lastNow = 0;
let blinkT = 0;
let uiPointerActive = false;
let seasonCheckT = 0;

function catWorldR(c) {
  return CatWorld.catRadius(c.scale);
}

function catFootOffset(c) {
  return catWorldR(c) * 0.55;
}

function clampCat(c) {
  if (state.paradiseMode) {
    CatWorld.clampInParadise(c);
    return;
  }
  if (state.treasureMode) {
    CatWorld.clampInTreasureRoom(c);
    return;
  }
  if (state.secretMode) {
    CatWorld.clampInSecretRoom(c);
    return;
  }
  const m = CatWorld.margin || 48;
  c.wx = Math.max(m, Math.min(CatWorld.W - m, c.wx));
  c.wy = Math.max(m, Math.min(CatWorld.H - m, c.wy));
}

function selectedCat() {
  return state.cats.find(c => c.id === state.selectedId) || state.cats[0];
}

function resetAllSkins() {
  state.unlockedSkins = ['default'];
  state.cats.forEach(c => { c.skinId = 'default'; });
}

function readSaveData() {
  const keys = [STORAGE_KEY, ...LEGACY_SAVE_KEYS];
  for (let i = 0; i < keys.length; i++) {
    const raw = localStorage.getItem(keys[i]);
    if (!raw) continue;
    try {
      return JSON.parse(raw);
    } catch {}
  }
  return null;
}

function pruneCooldowns(map) {
  const now = Date.now();
  const out = {};
  Object.keys(map || {}).forEach(k => {
    if (map[k] > now) out[k] = map[k];
  });
  return out;
}

function buildSaveData() {
  return {
    v: SAVE_VERSION,
    savedAt: Date.now(),
    cats: state.cats.map(c => ({
      id: c.id,
      wx: c.wx,
      wy: c.wy,
      scale: c.scale,
      label: c.label,
      hunger: c.hunger,
      happy: c.happy,
      facing: c.facing,
      skinId: c.skinId || 'default',
      tired: c.tired || 0,
    })),
    selectedId: state.selectedId,
    snacks: state.snacks,
    wildBerries: state.wildBerries,
    cuicuiFruits: state.cuicuiFruits,
    bushCooldowns: pruneCooldowns(state.bushCooldowns),
    cuicuiCooldowns: pruneCooldowns(state.cuicuiCooldowns),
    cuicuiKnockedMap: state.cuicuiKnockedMap,
    desertDates: state.desertDates,
    pineCones: state.pineCones,
    meadowClover: state.meadowClover,
    osmanthusBlossoms: state.osmanthusBlossoms,
    specialtyCooldowns: pruneCooldowns(state.specialtyCooldowns),
    cuicuiDrops: state.cuicuiDrops.map(d => ({
      id: d.id,
      treeKey: d.treeKey,
      wx: d.wx,
      wy: d.wy,
      landY: d.landY,
      phase: d.phase,
    })),
    coins: state.coins,
    totalFed: state.totalFed,
    unlockedSkins: [...state.unlockedSkins],
    visitedBiomes: [...state.visitedBiomes],
    exploreMeters: state.exploreMeters,
    bothHappyAwarded: state.bothHappyAwarded,
    introSeen: state.introSeen,
    camX: ValleyCam.x,
    camY: ValleyCam.y,
    caption: document.getElementById('caption-bar')?.textContent || '',
    seasonIndex: state.seasonIndex,
    paradiseFound: state.paradiseFound,
    treasureRoomFound: state.treasureRoomFound,
    secretGateFound: state.secretGateFound,
    secretRoomFound: state.secretRoomFound,
    secretOrbsFound: { ...(state.secretOrbsFound || {}) },
    chillMode: state.chillMode,
    treasuresFound: { ...(state.treasuresFound || {}) },
    restVisits: state.restVisits || 0,
  };
}

function applySaveData(d) {
  const legacySpawn = !d.v || d.v < 6;
  const skinWipe = !d.v || d.v < 7;

  if (Array.isArray(d.cats)) {
    d.cats.forEach((saved, i) => {
      if (!state.cats[i]) return;
      if (typeof saved.wx === 'number') {
        Object.assign(state.cats[i], saved, { moving: false, vx: 0, vy: 0, bounce: 0 });
        if (typeof saved.hunger === 'number') state.cats[i].hunger = saved.hunger;
        if (typeof saved.happy === 'boolean') state.cats[i].happy = saved.happy;
        if (typeof saved.facing === 'number') state.cats[i].facing = saved.facing;
        if (typeof saved.tired === 'number') state.cats[i].tired = saved.tired;
        if (!skinWipe && saved.skinId) state.cats[i].skinId = saved.skinId;
        reconcileCatHunger(state.cats[i]);
      } else if (typeof saved.nx === 'number') {
        state.cats[i].wx = saved.nx * CatWorld.W;
        state.cats[i].wy = saved.ny * CatWorld.H;
      }
      if (legacySpawn || CatWorld.isMapCenter(state.cats[i].wx, state.cats[i].wy)) {
        placeCatAtSpawn(state.cats[i]);
      }
    });
  }

  if (skinWipe) {
    resetAllSkins();
    state.coins = 50;
  } else {
    if (typeof d.coins === 'number') state.coins = d.coins;
    if (Array.isArray(d.unlockedSkins)) state.unlockedSkins = d.unlockedSkins;
  }

  if (typeof d.snacks === 'number') state.snacks = d.snacks;
  if (typeof d.wildBerries === 'number') state.wildBerries = d.wildBerries;
  if (typeof d.cuicuiFruits === 'number') state.cuicuiFruits = d.cuicuiFruits;
  if (typeof d.desertDates === 'number') state.desertDates = d.desertDates;
  if (typeof d.pineCones === 'number') state.pineCones = d.pineCones;
  if (typeof d.meadowClover === 'number') state.meadowClover = d.meadowClover;
  if (typeof d.osmanthusBlossoms === 'number') state.osmanthusBlossoms = d.osmanthusBlossoms;
  if (d.specialtyCooldowns && typeof d.specialtyCooldowns === 'object') {
    state.specialtyCooldowns = pruneCooldowns(d.specialtyCooldowns);
  }
  if (d.bushCooldowns && typeof d.bushCooldowns === 'object') {
    state.bushCooldowns = pruneCooldowns(d.bushCooldowns);
  }
  if (d.cuicuiCooldowns && typeof d.cuicuiCooldowns === 'object') {
    state.cuicuiCooldowns = pruneCooldowns(d.cuicuiCooldowns);
  }
  if (d.cuicuiKnockedMap && typeof d.cuicuiKnockedMap === 'object') {
    state.cuicuiKnockedMap = d.cuicuiKnockedMap;
  }
  if (Array.isArray(d.cuicuiDrops)) {
    state.cuicuiDrops = d.cuicuiDrops.map(d => ({
      ...d,
      vy: 0,
      phase: d.phase === 'fall' ? 'ground' : d.phase,
    }));
  }
  sanitizeForageState();
  if (typeof d.totalFed === 'number') state.totalFed = d.totalFed;
  if (Array.isArray(d.visitedBiomes)) state.visitedBiomes = d.visitedBiomes;
  if (typeof d.exploreMeters === 'number') state.exploreMeters = d.exploreMeters;
  if (typeof d.bothHappyAwarded === 'boolean') state.bothHappyAwarded = d.bothHappyAwarded;
  if (typeof d.introSeen === 'boolean') state.introSeen = d.introSeen;
  if (typeof d.paradiseFound === 'boolean') state.paradiseFound = d.paradiseFound;
  if (typeof d.treasureRoomFound === 'boolean') state.treasureRoomFound = d.treasureRoomFound;
  if (typeof d.secretGateFound === 'boolean') state.secretGateFound = d.secretGateFound;
  if (typeof d.secretRoomFound === 'boolean') state.secretRoomFound = d.secretRoomFound;
  if (d.secretOrbsFound && typeof d.secretOrbsFound === 'object') {
    state.secretOrbsFound = d.secretOrbsFound;
  }
  if (typeof d.chillMode === 'boolean') state.chillMode = d.chillMode;
  if (d.treasuresFound && typeof d.treasuresFound === 'object') {
    state.treasuresFound = d.treasuresFound;
  }
  if (typeof d.restVisits === 'number') state.restVisits = d.restVisits;
  if (d.selectedId) state.selectedId = d.selectedId;
  state.treasureMode = false;
  state.inTreasureRoom = false;
  state.treasureReturn = null;
  state.secretMode = false;
  state.inSecretRoom = false;
  state.secretReturn = null;
  document.body.classList.toggle('valley-chill-mode', !!state.chillMode);
  document.body.classList.remove('valley-treasure-mode');
  document.body.classList.remove('valley-secret-mode');

  if (!legacySpawn && typeof d.camX === 'number') ValleyCam.x = d.camX;
  if (!legacySpawn && typeof d.camY === 'number') ValleyCam.y = d.camY;
  if (legacySpawn || CatWorld.isMapCenter(ValleyCam.x, ValleyCam.y)) {
    const lead = state.cats.find(c => c.id === state.selectedId) || state.cats[0];
    if (lead) {
      ValleyCam.x = lead.wx;
      ValleyCam.y = lead.wy;
    }
  }

  if (typeof d.caption === 'string' && d.caption.trim()) {
    setCaption(d.caption);
    state.captionLoaded = true;
  }
  if (typeof d.seasonIndex === 'number') state.seasonIndex = d.seasonIndex;

  return legacySpawn || skinWipe;
}

function syncValleySeason(opts = {}) {
  const result = ValleySeason.sync(state);
  ValleySeason.updateBadge(result.info.index);
  const { def, changed, skinNewlyUnlocked, isFirst } = result;
  const skinName = CatSkins.get(def.skinId).name;
  const rank = `S${result.info.index + 1}`;
  if (changed && skinNewlyUnlocked && !opts.silent) {
    showToast(`${rank} ${def.name} · 解锁「${skinName}」`);
    setCaption(`${rank} · 「${skinName}」· 打开 🎒 穿戴`);
  } else if (isFirst && skinNewlyUnlocked && !opts.silent) {
    showToast(`${rank} ${def.name} · 「${skinName}」已解锁`);
  } else if (changed && !opts.silent) {
    showToast(`${rank} ${def.name}到了 · 「${skinName}」`);
    setCaption(`${rank} · 继续探索山谷`);
  }
  if (skinNewlyUnlocked || changed) {
    updateUI();
    if (!opts.silent) save();
  }
  return result;
}

function loadSave() {
  try {
    const d = readSaveData();
    if (!d) return;
    const needsResave = applySaveData(d);
    if (needsResave || !d.v || d.v < SAVE_VERSION) save();
  } catch {}
}

let saveTimer = null;
let lastSavedPos = '';

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildSaveData()));
    const cat = selectedCat();
    if (cat) lastSavedPos = `${cat.wx.toFixed(0)},${cat.wy.toFixed(0)}`;
  } catch {}
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 350);
}

function bindAutoSave() {
  window.addEventListener('pagehide', save);
  window.addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') save();
  });
}

function showBootError(err) {
  let el = document.getElementById('valley-boot-error');
  if (!el) {
    el = document.createElement('div');
    el.id = 'valley-boot-error';
    el.setAttribute('role', 'alert');
    el.style.cssText = [
      'position:fixed', 'inset:12px', 'z-index:99999', 'padding:16px',
      'background:rgba(255,255,255,0.97)', 'color:#b71c1c', 'border:2px solid #ef9a9a',
      'border-radius:12px', 'font:14px/1.5 sans-serif', 'overflow:auto',
      'box-shadow:0 8px 32px rgba(0,0,0,0.15)',
    ].join(';');
    document.body.appendChild(el);
  }
  const intro = document.getElementById('intro-card');
  if (intro) intro.hidden = true;
  const msg = err && (err.stack || err.message || String(err));
  el.textContent = `猫山谷加载出错，请强刷页面（Ctrl+F5）\n\n${msg || '未知错误'}`;
}

function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove('show'), 2400);
}

function setCaption(text) {
  const el = document.getElementById('caption-bar');
  if (el) el.textContent = text;
}

function updateSelectedLabel() {
  const el = document.getElementById('selected-label');
  const c = selectedCat();
  if (el && c) el.textContent = `控制：${c.label}`;
}

function resetWalkStamina(cat) {
  if (cat) cat.tired = 0;
}

function hitCat(sx, sy) {
  let best = null;
  let bestD = Infinity;
  state.cats.forEach(c => {
    const p = ValleyCam.worldToScreen(c.wx, c.wy, w, h);
    const sr = ValleyCam.screenRadius(catWorldR(c));
    const pad = c.scale < 1 ? 2 : 1.5;
    const d = Math.hypot(sx - p.x, sy - p.y);
    if (d < sr * pad && d < bestD) {
      bestD = d;
      best = c;
    }
  });
  return best;
}

function nextHungryCat(prefer = null) {
  if (prefer && !prefer.happy) return prefer;
  return state.cats.find(c => !c.happy) || null;
}

function selectCat(cat) {
  state.selectedId = cat.id;
  updateSelectedLabel();
  setCaption(`镜头跟着${cat.label} · 远处是山和绿洲`);
  save();
}

function switchCat() {
  const idx = state.cats.findIndex(c => c.id === state.selectedId);
  const next = state.cats[(idx + 1) % state.cats.length];
  selectCat(next);
  showToast(`现在控制：${next.label}`);
  if (CatBackpack.isOpen()) CatBackpack.render();
}

function bushKey(b) {
  return `${b.x},${b.y}`;
}

/** 修复存档：冷却过了但 knocked 还在，会导致树上永远没果 */
function sanitizeForageState() {
  Object.keys(state.cuicuiKnockedMap || {}).forEach(key => {
    if (!state.cuicuiCooldowns[key]) delete state.cuicuiKnockedMap[key];
  });
  Object.keys(state.cuicuiCooldowns || {}).forEach(key => {
    refreshTreeCuicuiCooldown(key);
  });
}

function hitBushAt(wx, wy) {
  const now = Date.now();
  let best = null;
  let bestD = Infinity;
  CatWorld.bushes.forEach(b => {
    if (!CatWorld.propFitsBiome(b.x, b.y, ['snow', 'forest', 'meadow'])) return;
    const key = bushKey(b);
    if (state.bushCooldowns[key] && now < state.bushCooldowns[key]) return;
    const r = 38 * (b.s || 1);
    const d = Math.hypot(wx - b.x, wy - b.y);
    if (d <= Math.max(BERRY_TAP_RADIUS, r) && d < bestD) {
      bestD = d;
      best = b;
    }
  });
  return best;
}

function cuicuiTreeKey(tr) {
  return `${tr.x},${tr.y}`;
}

function nearestPickableBush(cat) {
  if (!cat) return null;
  const now = Date.now();
  let best = null;
  let bestD = Infinity;
  CatWorld.bushes.forEach(b => {
    if (!CatWorld.propFitsBiome(b.x, b.y, ['snow', 'forest', 'meadow'])) return;
    const key = bushKey(b);
    if (state.bushCooldowns[key] && now < state.bushCooldowns[key]) return;
    const d = Math.hypot(cat.wx - b.x, cat.wy - b.y);
    if (d <= BERRY_PICK_RADIUS && d < bestD) {
      bestD = d;
      best = b;
    }
  });
  return best;
}

function pickWildBerry(bush) {
  if (!bush) return;
  const key = bushKey(bush);
  const now = Date.now();
  if (state.bushCooldowns[key] && now < state.bushCooldowns[key]) {
    showToast('这丛还没长出新果子');
    return;
  }
  const gain = Math.max(1, bush.berries || 3);
  state.wildBerries += gain;
  state.bushCooldowns[key] = now + BERRY_REGROW_MS;
  showToast(`摘了 ${gain} 个野果 🍇 · 点顶栏 🍇 喂猫`);
  updateForagePickState();
  updateUI();
  save();
}

const SPECIALTY_META = {
  date: { key: 'desertDates', label: '干枣', emoji: '🌴', relief: DATE_HUNGER_RELIEF, biome: 'desert' },
  cone: { key: 'pineCones', label: '松果', emoji: '🌲', relief: CONE_HUNGER_RELIEF, biome: 'forest' },
  clover: { key: 'meadowClover', label: '三叶草', emoji: '🍀', relief: CLOVER_HUNGER_RELIEF, biome: 'meadow' },
  guihua: { key: 'osmanthusBlossoms', label: '桂花', emoji: '🌼', relief: GUIHUA_HUNGER_RELIEF, biome: 'osmanthus' },
};

function specialtyKey(n) {
  return `${n.kind}:${n.x},${n.y}`;
}

function hitSpecialtyAt(wx, wy) {
  const now = Date.now();
  let best = null;
  let bestD = Infinity;
  (CatWorld.specialtyNodes || []).forEach(n => {
    const meta = SPECIALTY_META[n.kind];
    if (!meta) return;
    if (!CatWorld.propFitsBiome(n.x, n.y, [meta.biome])) return;
    const key = specialtyKey(n);
    if (state.specialtyCooldowns[key] && now < state.specialtyCooldowns[key]) return;
    const r = 36 * (n.s || 1);
    const d = Math.hypot(wx - n.x, wy - n.y);
    if (d <= Math.max(SPECIALTY_TAP_RADIUS, r) && d < bestD) {
      bestD = d;
      best = n;
    }
  });
  return best;
}

function nearestSpecialty(cat) {
  if (!cat) return null;
  const now = Date.now();
  let best = null;
  let bestD = Infinity;
  (CatWorld.specialtyNodes || []).forEach(n => {
    const meta = SPECIALTY_META[n.kind];
    if (!meta) return;
    if (!CatWorld.propFitsBiome(n.x, n.y, [meta.biome])) return;
    const key = specialtyKey(n);
    if (state.specialtyCooldowns[key] && now < state.specialtyCooldowns[key]) return;
    const d = Math.hypot(cat.wx - n.x, cat.wy - n.y);
    if (d <= SPECIALTY_PICK_RADIUS && d < bestD) {
      bestD = d;
      best = n;
    }
  });
  return best;
}

function pickSpecialty(node) {
  if (!node) return;
  const meta = SPECIALTY_META[node.kind];
  if (!meta) return;
  const key = specialtyKey(node);
  const now = Date.now();
  if (state.specialtyCooldowns[key] && now < state.specialtyCooldowns[key]) {
    showToast('还没长出来');
    return;
  }
  const gain = Math.max(1, node.qty || 3);
  state[meta.key] += gain;
  state.specialtyCooldowns[key] = now + SPECIALTY_REGROW_MS;
  showToast(`摘了 ${gain} 个${meta.label} ${meta.emoji} · 背包里喂`);
  updateForagePickState();
  updateUI();
  save();
}

function tryPickSpecialty() {
  const cat = selectedCat();
  const node = nearestSpecialty(cat);
  if (node) pickSpecialty(node);
  else showToast('特产：暖沙干枣、深林松果、草原三叶草、桂花林桂花');
}

function nearestRestSpot(cat) {
  if (!cat) return null;
  let best = null;
  let bestD = Infinity;
  (CatWorld.restSpots || []).forEach(sp => {
    const d = Math.hypot(cat.wx - sp.x, cat.wy - sp.y);
    if (d <= sp.r && d < bestD) {
      bestD = d;
      best = sp;
    }
  });
  return best;
}

function hitRestSpotAt(wx, wy) {
  let best = null;
  let bestD = Infinity;
  (CatWorld.restSpots || []).forEach(sp => {
    const d = Math.hypot(wx - sp.x, wy - sp.y);
    if (d <= sp.r * 0.72 && d < bestD) {
      bestD = d;
      best = sp;
    }
  });
  return best;
}

function beginRestAt(cat, sp, fromTap = false) {
  if (!cat || !sp) return false;
  const reach = sp.r + CatWorld.catRadius(cat.scale);
  const d = Math.hypot(cat.wx - sp.x, cat.wy - sp.y);
  if (d > reach) {
    showToast(`再走近「${sp.name}」一点才能歇脚`);
    return false;
  }
  state.joystick.x = 0;
  state.joystick.y = 0;
  state.joystick.active = false;
  Object.keys(state.input).forEach(k => { state.input[k] = false; });
  cat.moving = false;
  cat.vx = 0;
  cat.vy = 0;
  if (d > 8) {
    cat.wx = sp.x + (cat.wx - sp.x) * 0.35;
    cat.wy = sp.y + (cat.wy - sp.y) * 0.35;
    clampCat(cat);
    CatWorld.applyMountainPhysics(cat, catFootOffset(cat));
  }
  cat.resting = true;
  cat.act = 'nap';
  cat.actT = 0;
  cat.actDur = 2.4;
  state.nearRest = sp;
  lastRestNote = sp.name;
  const msg = `${sp.icon || '⛺'} ${sp.name} · 歇脚中，饿得慢、饿着会缓一些`;
  setCaption(msg);
  if (fromTap) showToast(`${sp.icon || '⛺'} 在${sp.name}歇脚～`);
  state.restVisits = (state.restVisits || 0) + 1;
  CatCodex.sync(state);
  return true;
}

let lastRestNote = '';
function tickRestSpot(cat, dt) {
  if (!cat || cat.id !== state.selectedId) return;
  const sp = nearestRestSpot(cat);
  state.nearRest = sp;
  if (!sp || cat.moving) {
    if (cat.resting) lastRestNote = '';
    cat.resting = false;
    return;
  }
  cat.resting = true;
  cat.tired = Math.max(0, cat.tired - dt * 2.5);
  if (cat.act !== 'nap') {
    cat.act = 'nap';
    cat.actT = 0;
    cat.actDur = 2.4;
  }
  cat.actT += dt;
  if (cat.actT >= cat.actDur) cat.actT -= cat.actDur;
  const noteKey = sp.name;
  if (noteKey !== lastRestNote) {
    lastRestNote = noteKey;
    state.restVisits = (state.restVisits || 0) + 1;
    CatCodex.sync(state);
    setCaption(`${sp.icon || '⛺'} ${sp.name} · 歇脚中，饿得慢、饿着会缓一些`);
  }
}

function promptRenameCat() {
  const cat = selectedCat();
  if (!cat) return;
  const name = prompt('给幼崽改名字（最多 8 字）', cat.label);
  if (!name) return;
  const trimmed = name.trim().slice(0, 8);
  if (!trimmed) return;
  cat.label = trimmed;
  updateSelectedLabel();
  save();
  showToast(`现在叫「${cat.label}」`);
  if (CatBackpack.isOpen()) CatBackpack.render();
}

function isImmersed() {
  return state.immerseLevel > 0;
}

function inSideRoom() {
  return state.paradiseMode || state.treasureMode || state.secretMode;
}

function syncImmerseUI() {
  const lv = state.immerseLevel;
  document.body.classList.toggle('valley-immerse-mode', lv > 0);
  document.body.classList.toggle('valley-immerse-full', lv >= 2);
  const immerse = document.getElementById('btn-immerse');
  const full = document.getElementById('btn-immerse-full');
  const exit = document.getElementById('btn-immerse-exit');
  if (immerse) {
    immerse.hidden = false;
    immerse.classList.toggle('is-active', lv === 1);
  }
  if (full) {
    full.hidden = false;
    full.classList.toggle('is-active', lv >= 2);
  }
  if (exit) exit.hidden = lv === 0;
}

function setImmerseLevel(level) {
  state.immerseLevel = level;
  syncImmerseUI();
}

function enterImmerseSoft() {
  if (Gachapon.isPlaying()) return;
  if (state.photoMode) togglePhotoMode(false);
  CatBackpack.toggle(false);
  CatCodex.toggle(false);
  setImmerseLevel(1);
}

function enterImmerseFull() {
  if (Gachapon.isPlaying()) return;
  if (state.photoMode) togglePhotoMode(false);
  CatBackpack.toggle(false);
  CatCodex.toggle(false);
  setImmerseLevel(2);
}

function exitImmerse() {
  setImmerseLevel(0);
}

function toggleImmerseSoft() {
  if (state.immerseLevel === 0) enterImmerseSoft();
  else if (state.immerseLevel === 1) exitImmerse();
  else setImmerseLevel(1);
}

function toggleImmerseFull() {
  if (state.immerseLevel >= 2) exitImmerse();
  else enterImmerseFull();
}

function togglePhotoMode(force) {
  const next = typeof force === 'boolean' ? force : !state.photoMode;
  state.photoMode = next;
  document.body.classList.toggle('valley-photo-mode', next);
  const hint = document.getElementById('photo-hint');
  if (hint) hint.hidden = !next;
  if (next) {
    if (isImmersed()) exitImmerse();
    CatBackpack.toggle(false);
    showToast('拍照模式 · 点一下屏幕退出');
  }
}

function updateParadiseButton() {
  const btn = document.getElementById('btn-paradise');
  if (!btn) return;
  if (state.paradiseMode) {
    btn.textContent = '← 返回猫山谷';
    btn.title = '回到大世界';
  } else {
    btn.textContent = '🎡 妙脆角猫游乐园';
    btn.title = '进入游乐园';
  }
  btn.disabled = !!state.treasureMode || !!state.secretMode;
}

function updateTreasureButton() {
  const btn = document.getElementById('btn-treasure');
  if (!btn) return;
  const left = CatTreasure.totalCount() - CatTreasure.foundCount(state);
  if (state.treasureMode) {
    btn.textContent = '← 返回猫山谷';
    btn.title = '离开寻宝屋';
  } else if (left < CatTreasure.totalCount()) {
    btn.textContent = `📦 妙脆角猫寻宝屋 · ${left}`;
    btn.title = `进入寻宝屋 · 还剩 ${left} 个木箱`;
  } else {
    btn.textContent = '📦 妙脆角猫寻宝屋';
    btn.title = '进入寻宝屋找木箱';
  }
  btn.disabled = !!state.paradiseMode || !!state.secretMode;
}

function enterParadiseMode() {
  if (state.paradiseMode || state.treasureMode || state.secretMode || Gachapon.isPlaying() || state.photoMode) return;
  const p = CatWorld.catParadise;
  if (!p) return;
  CatBackpack.toggle(false);
  CatCodex.toggle(false);
  if (isImmersed()) exitImmerse();
  state.paradiseReturn = {
    cats: state.cats.map(c => ({ id: c.id, wx: c.wx, wy: c.wy })),
    camX: ValleyCam.x,
    camY: ValleyCam.y,
  };
  state.paradiseMode = true;
  state.inParadise = true;
  document.body.classList.add('valley-paradise-mode');
  state.cats.forEach(c => {
    const s = CatWorld.paradiseSpawnFor(c.id);
    c.wx = s.x;
    c.wy = s.y;
    c.moving = false;
    c.resting = false;
    c.vx = 0;
    c.vy = 0;
    c.onMountain = false;
    c.mountainElevation = 0;
    c.bounce = 0;
    c.act = null;
    c.actT = 0;
  });
  ValleyCam.x = p.x;
  ValleyCam.y = p.y;
  ValleyCam.clamp(w, h);
  if (!state.paradiseFound) {
    state.paradiseFound = true;
    addCoins(CatParadise.FIRST_COINS, `第一次来游乐园！+${CatParadise.FIRST_COINS} 金币`);
    syncCodex();
  }
  setCaption('🎡 妙脆角猫游乐园 · 摇杆/WASD 走动 · 饿了也能逛');
  showToast('进入妙脆角猫游乐园～');
  updateParadiseButton();
  updateTreasureButton();
  save();
}

function enterTreasureMode() {
  if (state.treasureMode || state.paradiseMode || state.secretMode || Gachapon.isPlaying() || state.photoMode) return;
  const r = CatWorld.catTreasureRoom;
  if (!r) return;
  CatBackpack.toggle(false);
  CatCodex.toggle(false);
  if (isImmersed()) exitImmerse();
  state.treasureReturn = {
    cats: state.cats.map(c => ({ id: c.id, wx: c.wx, wy: c.wy })),
    camX: ValleyCam.x,
    camY: ValleyCam.y,
  };
  state.treasureMode = true;
  state.inTreasureRoom = true;
  document.body.classList.add('valley-treasure-mode');
  state.cats.forEach(c => {
    const s = CatWorld.treasureSpawnFor(c.id);
    c.wx = s.x;
    c.wy = s.y;
    c.moving = false;
    c.resting = false;
    c.vx = 0;
    c.vy = 0;
    c.onMountain = false;
    c.mountainElevation = 0;
    c.bounce = 0;
    c.act = null;
    c.actT = 0;
  });
  ValleyCam.x = r.x;
  ValleyCam.y = r.y;
  ValleyCam.clamp(w, h);
  if (!state.treasureRoomFound) {
    state.treasureRoomFound = true;
    addCoins(CatTreasure.FIRST_COINS, `第一次来寻宝屋！+${CatTreasure.FIRST_COINS} 金币`);
    syncCodex();
  }
  const left = CatTreasure.totalCount() - CatTreasure.foundCount(state);
  setCaption(`📦 妙脆角猫寻宝屋 · 走近木箱自动开启 · 还剩 ${left} 个`);
  showToast('进入妙脆角猫寻宝屋～');
  updateTreasureButton();
  updateParadiseButton();
  save();
}

function enterSecretMode() {
  if (state.secretMode || state.paradiseMode || state.treasureMode || Gachapon.isPlaying() || state.photoMode) return;
  const r = CatWorld.catSecretRoom;
  if (!r) return;
  CatBackpack.toggle(false);
  CatCodex.toggle(false);
  if (isImmersed()) exitImmerse();
  state.secretReturn = {
    cats: state.cats.map(c => {
      const p = CatSecret.returnPosForCat(c);
      return { id: c.id, wx: p.x, wy: p.y };
    }),
    camX: ValleyCam.x,
    camY: ValleyCam.y,
  };
  state.secretMode = true;
  state.inSecretRoom = true;
  document.body.classList.add('valley-secret-mode');
  state.cats.forEach(c => {
    const s = CatWorld.secretSpawnFor(c.id);
    c.wx = s.x;
    c.wy = s.y;
    c.moving = false;
    c.resting = false;
    c.vx = 0;
    c.vy = 0;
    c.onMountain = false;
    c.mountainElevation = 0;
    c.bounce = 0;
    c.act = null;
    c.actT = 0;
  });
  const ex = CatWorld.secretRoomExit;
  ValleyCam.x = r.x;
  ValleyCam.y = ex ? ex.y + 100 : r.y;
  ValleyCam.clamp(w, h);
  if (!state.secretRoomFound) {
    state.secretRoomFound = true;
    addCoins(CatSecret.FIRST_COINS, `第一次进秘密小室！+${CatSecret.FIRST_COINS} 金币`);
    syncCodex();
  }
  setCaption('🚪 秘密小室 · 上方淡蓝圆门走出去');
  showToast('进入秘密小室～ 往上走就是出口');
  updateParadiseButton();
  updateTreasureButton();
  save();
}

function exitSecretMode() {
  if (!state.secretMode) return;
  const ret = state.secretReturn;
  if (ret?.cats) {
    ret.cats.forEach(saved => {
      const c = state.cats.find(x => x.id === saved.id);
      if (c) {
        c.wx = saved.wx;
        c.wy = saved.wy;
        c.moving = false;
        c.resting = false;
        c.onMountain = false;
        c.mountainElevation = 0;
      }
    });
    if (typeof ret.camX === 'number') ValleyCam.x = ret.camX;
    if (typeof ret.camY === 'number') ValleyCam.y = ret.camY;
    ValleyCam.clamp(w, h);
  }
  state.secretMode = false;
  state.inSecretRoom = false;
  state.secretReturn = null;
  state.secretEnterBlockUntil = Date.now() + CatSecret.EXIT_COOLDOWN_MS;
  document.body.classList.remove('valley-secret-mode');
  setCaption('回到猫山谷 · 继续探索');
  showToast('回到猫山谷啦');
  updateParadiseButton();
  updateTreasureButton();
  save();
}

function exitTreasureMode() {
  if (!state.treasureMode) return;
  const ret = state.treasureReturn;
  if (ret?.cats) {
    ret.cats.forEach(saved => {
      const c = state.cats.find(x => x.id === saved.id);
      if (c) {
        c.wx = saved.wx;
        c.wy = saved.wy;
        c.moving = false;
        c.resting = false;
        c.onMountain = false;
        c.mountainElevation = 0;
      }
    });
    if (typeof ret.camX === 'number') ValleyCam.x = ret.camX;
    if (typeof ret.camY === 'number') ValleyCam.y = ret.camY;
    ValleyCam.clamp(w, h);
  }
  state.treasureMode = false;
  state.inTreasureRoom = false;
  state.treasureReturn = null;
  document.body.classList.remove('valley-treasure-mode');
  setCaption('回到猫山谷 · 继续探索');
  showToast('回到猫山谷啦');
  updateTreasureButton();
  updateParadiseButton();
  save();
}

function toggleTreasureMode() {
  if (state.treasureMode) exitTreasureMode();
  else enterTreasureMode();
}

function exitParadiseMode() {
  if (!state.paradiseMode) return;
  const ret = state.paradiseReturn;
  if (ret?.cats) {
    ret.cats.forEach(saved => {
      const c = state.cats.find(x => x.id === saved.id);
      if (c) {
        c.wx = saved.wx;
        c.wy = saved.wy;
        c.moving = false;
        c.resting = false;
        c.onMountain = false;
        c.mountainElevation = 0;
      }
    });
    if (typeof ret.camX === 'number') ValleyCam.x = ret.camX;
    if (typeof ret.camY === 'number') ValleyCam.y = ret.camY;
    ValleyCam.clamp(w, h);
  }
  state.paradiseMode = false;
  state.inParadise = false;
  state.paradiseReturn = null;
  document.body.classList.remove('valley-paradise-mode');
  setCaption('回到猫山谷 · 继续探索');
  showToast('回到猫山谷啦');
  updateParadiseButton();
  updateTreasureButton();
  save();
}

function toggleParadiseMode() {
  if (state.paradiseMode) exitParadiseMode();
  else enterParadiseMode();
}

function syncCodex() {
  CatCodex.sync(state);
}

function updateChillButton() {
  const btn = document.getElementById('btn-chill');
  if (!btn) return;
  if (state.chillMode) {
    btn.textContent = '🐾 慢游中';
    btn.classList.add('mode-active');
    btn.title = '关闭慢游 · 饿得慢、走得慢';
  } else {
    btn.textContent = '🐾 慢游';
    btn.classList.remove('mode-active');
    btn.title = '慢游模式 · 饿得慢、慢慢逛';
  }
}

function toggleChillMode() {
  state.chillMode = !state.chillMode;
  document.body.classList.toggle('valley-chill-mode', state.chillMode);
  updateChillButton();
  if (state.chillMode) {
    setCaption('🐾 慢游中 · 饿得慢、走得慢，慢慢逛山谷');
    showToast('慢游模式 · 适合随便走走');
  } else {
    setCaption('继续正常探索猫山谷');
    showToast('慢游模式已关闭');
  }
  save();
}

function modeHooks() {
  return {
    showToast,
    setCaption,
    save,
    addCoins,
    updateTreasureButton,
    syncCodex,
    enterSecretMode,
    exitSecretMode,
  };
}

function nearSecretGate(cat) {
  const gate = CatWorld.secretGate;
  if (!gate || !cat) return false;
  return Math.hypot(cat.wx - gate.x, cat.wy - gate.y) <= CatSecret.DISCOVER_RADIUS;
}

function nearSecretExit(cat) {
  const exit = CatWorld.secretRoomExit;
  if (!exit || !cat) return false;
  return Math.hypot(cat.wx - exit.x, cat.wy - exit.y) <= CatSecret.EXIT_RADIUS * 1.6;
}

function refreshTreeCuicuiCooldown(key) {
  const now = Date.now();
  if (state.cuicuiCooldowns[key] && now >= state.cuicuiCooldowns[key]) {
    delete state.cuicuiCooldowns[key];
    delete state.cuicuiKnockedMap[key];
  }
}

function isFruitOnTree(tree, index) {
  if (tree.kind !== 'leafwood') return false;
  const key = cuicuiTreeKey(tree);
  refreshTreeCuicuiCooldown(key);
  if (state.cuicuiCooldowns[key]) return false;
  const knocked = state.cuicuiKnockedMap[key] || [];
  return !knocked.includes(index);
}

function hitTreeCuicuiFruit(wx, wy) {
  const now = Date.now();
  let best = null;
  let bestD = Infinity;
  (CatWorld.trees || []).forEach(tr => {
    if (tr.kind !== 'leafwood') return;
    const slots = CatArt.getLeafwoodFruitPositions(tr, now);
    slots.forEach((slot, i) => {
      if (!isFruitOnTree(tr, i)) return;
      const d = Math.hypot(wx - slot.x, wy - slot.y);
      const hitR = Math.max(CUICUI_FRUIT_HIT_MIN, slot.r * CUICUI_TAP_RADIUS);
      if (d <= hitR && d < bestD) {
        bestD = d;
        best = { tree: tr, index: i, x: slot.x, y: slot.y };
      }
    });
  });
  return best;
}

function hitFallenCuicui(wx, wy) {
  let best = null;
  let bestD = Infinity;
  state.cuicuiDrops.forEach(drop => {
    if (drop.phase !== 'ground') return;
    const d = Math.hypot(wx - drop.wx, wy - drop.wy);
    if (d <= 36 && d < bestD) {
      bestD = d;
      best = drop;
    }
  });
  return best;
}

function knockCuicuiFruit(hit) {
  const tree = hit.tree;
  const key = cuicuiTreeKey(tree);
  if (!isFruitOnTree(tree, hit.index)) return;

  if (!state.cuicuiKnockedMap[key]) state.cuicuiKnockedMap[key] = [];
  state.cuicuiKnockedMap[key].push(hit.index);

  const total = tree.fruits || 4;
  if (state.cuicuiKnockedMap[key].length >= total) {
    state.cuicuiCooldowns[key] = Date.now() + CUICUI_REGROW_MS;
  }

  state.cuicuiDrops.push({
    id: `${key}:${hit.index}:${Date.now()}`,
    treeKey: key,
    wx: hit.x,
    wy: hit.y,
    vy: 0,
    landY: tree.y + 10 * (tree.s || 1),
    phase: 'fall',
  });

  showToast('脆脆果掉下来了 · 走过去捡');
  save();
}

function collectCuicuiDrop(drop) {
  if (!drop) return false;
  state.cuicuiFruits += 1;
  state.cuicuiDrops = state.cuicuiDrops.filter(d => d.id !== drop.id);
  showToast('捡到脆脆果 🔺 · 点顶栏 🔺 喂猫');
  updateUI();
  save();
  return true;
}

function tryCollectCuicuiDrop(drop) {
  const cat = selectedCat();
  if (!cat || !drop || drop.phase !== 'ground') return;
  if (Math.hypot(cat.wx - drop.wx, cat.wy - drop.wy) > CUICUI_GROUND_PICK_RADIUS) {
    showToast('走过去一点再捡');
    return;
  }
  collectCuicuiDrop(drop);
}

function updateCuicuiDrops(dt) {
  state.cuicuiDrops.forEach(drop => {
    if (drop.phase !== 'fall') return;
    drop.vy += 920 * dt;
    drop.wy += drop.vy * dt;
    if (drop.wy >= drop.landY) {
      drop.wy = drop.landY;
      drop.vy = 0;
      drop.phase = 'ground';
    }
  });
}

function tryAutoCollectCuicuiDrops(cat) {
  if (!cat) return;
  for (let i = state.cuicuiDrops.length - 1; i >= 0; i--) {
    const drop = state.cuicuiDrops[i];
    if (drop.phase !== 'ground') continue;
    if (Math.hypot(cat.wx - drop.wx, cat.wy - drop.wy) <= CUICUI_GROUND_PICK_RADIUS) {
      collectCuicuiDrop(drop);
    }
  }
}

function tryPickBerry() {
  const cat = selectedCat();
  const bush = nearestPickableBush(cat);
  if (bush) pickWildBerry(bush);
  else if (cat) {
    const near = CatWorld.bushes.find(b => {
      const key = bushKey(b);
      const now = Date.now();
      if (state.bushCooldowns[key] && now < state.bushCooldowns[key]) return false;
      return Math.hypot(cat.wx - b.x, cat.wy - b.y) <= BERRY_PICK_RADIUS + 40;
    });
    if (near) showToast('再靠近草丛一点点');
    else showToast('找不到野果丛 · 雪谷起点旁边就有');
  } else showToast('再走近一点 · 站到草丛旁边');
}

function showFeedCrunch(cat, label) {
  if (w <= 0 || h <= 0) return;
  const p = ValleyCam.worldToScreen(cat.wx, cat.wy, w, h);
  state.crunch = {
    x: p.x,
    y: p.y - ValleyCam.screenRadius(catWorldR(cat)),
    age: 0,
    text: label,
  };
}

function feedCat(cat, food = 'bread') {
  if (cat.happy) {
    showToast(`${cat.label}已经吃饱了`);
    return;
  }

  const wasHappyBefore = cat.happy;

  if (food === 'berry') {
    if (state.wildBerries <= 0) {
      showToast('没有野果 · 靠近草丛点「采摘野果」');
      return;
    }
    state.wildBerries -= 1;
    state.totalFed += 1;
    cat.hunger = Math.max(0, cat.hunger - BERRY_HUNGER_RELIEF);
    cat.tired = 0;
    reconcileCatHunger(cat);
    showFeedCrunch(cat, '嗯～');
    document.getElementById('btn-berry')?.classList.add('fed-flash');
    setTimeout(() => document.getElementById('btn-berry')?.classList.remove('fed-flash'), 320);
    if (!wasHappyBefore && cat.happy) {
      showToast(`${cat.label} 吃野果吃饱了！`);
      checkBothHappyBonus();
    } else if (cat.happy) {
      showToast('野果真甜！');
      checkBothHappyBonus();
    } else {
      showToast('野果味……还差一点');
    }
    updateUI();
    save();
    return;
  }

  if (food === 'date' || food === 'cone' || food === 'clover' || food === 'guihua') {
    const meta = SPECIALTY_META[food];
    if (!meta || state[meta.key] <= 0) {
      showToast(`没有${meta?.label || '特产'} · 去对应区域摘`);
      return;
    }
    state[meta.key] -= 1;
    state.totalFed += 1;
    cat.hunger = Math.max(0, cat.hunger - meta.relief);
    cat.tired = 0;
    reconcileCatHunger(cat);
    showFeedCrunch(cat, '嗯～');
    if (!wasHappyBefore && cat.happy) {
      showToast(`${cat.label} 吃${meta.label}吃饱了！`);
      checkBothHappyBonus();
    } else if (cat.happy) {
      showToast(`${meta.label}真香！`);
      checkBothHappyBonus();
    } else {
      showToast(`${meta.label}……还差一点`);
    }
    updateUI();
    save();
    return;
  }

  if (food === 'cuicui') {
    if (state.cuicuiFruits <= 0) {
      showToast('没有脆脆果 · 去落叶林点树上的黄果子');
      return;
    }
    state.cuicuiFruits -= 1;
    state.totalFed += 1;
    cat.hunger = Math.max(0, cat.hunger - CUICUI_HUNGER_RELIEF);
    cat.tired = 0;
    reconcileCatHunger(cat);
    showFeedCrunch(cat, '脆～');
    document.getElementById('btn-cuicui')?.classList.add('fed-flash');
    setTimeout(() => document.getElementById('btn-cuicui')?.classList.remove('fed-flash'), 320);
    if (!wasHappyBefore && cat.happy) {
      showToast(`${cat.label} 吃脆脆果吃饱了！`);
      checkBothHappyBonus();
    } else if (cat.happy) {
      showToast('脆脆果又酥又甜！');
      checkBothHappyBonus();
    } else {
      showToast('四面体小果……再来一个？');
    }
    updateUI();
    save();
    return;
  }

  if (state.snacks <= 0) {
    showToast('小面包不够了，点 🛍️ 或去摘野果');
    return;
  }
  state.snacks -= 1;
  state.totalFed += 1;
  cat.hunger = Math.max(0, cat.hunger - 28);
  cat.tired = 0;
  reconcileCatHunger(cat);
  addCoins(COINS_PER_FEED, null);
  showFeedCrunch(cat, '吧唧');
  const holdBtn = document.getElementById('btn-hold');
  holdBtn?.classList.add('fed-flash');
  setTimeout(() => holdBtn?.classList.remove('fed-flash'), 320);
  if (!wasHappyBefore && cat.happy) {
    addCoins(COINS_FEED_FULL, `吃饱了！+${COINS_FEED_FULL} 金币`);
    checkBothHappyBonus();
  } else if (cat.happy) {
    showToast('吃饱了！去别处走走赚金币');
    checkBothHappyBonus();
  } else {
    showToast('吧唧……还差一点');
  }
  save();
}

function unlockSkin(skinId) {
  if (!state.unlockedSkins.includes(skinId)) {
    state.unlockedSkins.push(skinId);
    syncCodex();
  }
}

function unlockGachaSkin(skinId) {
  const name = CatSkins.get(skinId).name;
  if (state.unlockedSkins.includes(skinId)) {
    state.coins += Math.floor(GACHA_COST * 0.5);
    showToast(`又是「${name}」～ 退 ${Math.floor(GACHA_COST * 0.5)} 金币`);
  } else {
    unlockSkin(skinId);
    showToast(`抽到「${name}」！打开 🎒 背包穿戴`);
  }
  updateUI();
  if (CatBackpack.isOpen()) CatBackpack.render();
  save();
}

function equipSkin(skinId) {
  if (!state.unlockedSkins.includes(skinId)) return;
  const cat = selectedCat();
  if (!cat) return;
  cat.skinId = skinId;
  const name = CatSkins.get(skinId).name;
  showToast(`${cat.label} 穿上「${name}」`);
  setCaption(`${cat.label} · ${name} · 继续探索山谷`);
  updateUI();
  if (CatBackpack.isOpen()) CatBackpack.render();
  save();
}

function equipCurrentSeasonSkin() {
  syncValleySeason({ silent: true });
  const def = ValleySeason.defFor(state.seasonIndex);
  if (!state.unlockedSkins.includes(def.skinId)) {
    showToast('本季皮肤还没解锁，先在山谷里玩一会儿');
    return;
  }
  equipSkin(def.skinId);
}

function feedSelectedCat(food = 'bread') {
  const picked = nextHungryCat(selectedCat());
  if (!picked) {
    showToast('两只幼崽都吃饱了');
    return;
  }
  if (picked.id !== state.selectedId) {
    selectCat(picked);
    const feedLabel = food === 'berry' ? '野果' : food === 'cuicui' ? '脆脆果' : '小面包';
    showToast(`给${picked.label}喂${feedLabel}`);
  }
  feedCat(picked, food);
}

function updateForagePickState() {
  const cat = selectedCat();
  state.nearBush = nearestPickableBush(cat);
  const nearSpec = nearestSpecialty(cat);

  const berryBtn = document.getElementById('btn-pick-berry');
  const specBtn = document.getElementById('btn-pick-specialty');
  const hint = document.getElementById('bp-pick-hint');

  if (berryBtn) berryBtn.classList.toggle('ready', !!state.nearBush);
  if (specBtn) specBtn.classList.toggle('ready', !!nearSpec);

  if (hint) {
    if (cat?.resting && state.nearRest) {
      hint.textContent = `${state.nearRest.icon || '⛺'} ${state.nearRest.name} · 歇脚中，松开摇杆别动`;
    } else if (state.nearRest) {
      hint.textContent = `在${state.nearRest.name} · 停下或点⛺图标歇脚`;
    } else if (nearSpec) {
      const m = SPECIALTY_META[nearSpec.kind];
      hint.textContent = `在${m.label}边 · 点「摘特产」`;
    } else if (state.nearBush) {
      hint.textContent = '在草丛边 · 点「摘野果」';
    } else {
      hint.textContent = '虚线圈⛺是休息点 · 左上角进游乐园 / 寻宝屋';
    }
  }
}

function updateBerryPickState() {
  updateForagePickState();
}

function playSelectedCatAction(action) {
  if (Gachapon.isPlaying() || state.photoMode) return;
  const cat = selectedCat();
  if (!cat) return;
  if (cat.resting) {
    showToast('歇脚中呢，站起来再蹦～');
    return;
  }
  if (action === 'jump') {
    if (isCatJumping(cat)) return;
    const dur = ValleyWeather.actionDuration('jump');
    if (!dur) return;
    const foot = catFootOffset(cat);
    if (cat.onMountain || cat.mountainElevation > 0) {
      CatWorld.dismountFromMountain(cat, foot);
      clampCat(cat);
    }
    cat.act = 'jump';
    cat.actT = 0;
    cat.actDur = dur;
    cat.idleSec = 0;
    const steer = steeringVector();
    cat.jumpVerticalOnly = !steeringActive();
    cat.jumpDx = 0;
    cat.jumpDy = 0;
    if (!cat.jumpVerticalOnly) {
      cat.jumpDx = steer.x;
      cat.jumpDy = steer.y;
      if (Math.abs(steer.x) > 0.05) cat.facing = steer.x >= 0 ? 1 : -1;
      for (let d = 20; d >= 8; d -= 4) {
        const tx = cat.wx + steer.x * d;
        const ty = cat.wy + steer.y * d;
        if (!CatWorld.streamRockBlocks(tx, ty, foot)) {
          cat.wx = tx;
          cat.wy = ty;
          break;
        }
      }
      clampCat(cat);
    }
    const offMountain = cat.mountainJumpOffUntil && performance.now() < cat.mountainJumpOffUntil;
    state.crunch = {
      x: cat.wx,
      y: cat.wy - 42,
      age: 0,
      text: offMountain ? '跳下！' : '蹦！',
    };
    return;
  }
  if (cat.moving) {
    showToast('停一下再做动作');
    return;
  }
  if (cat.act && cat.act !== 'nap') return;
  const dur = ValleyWeather.actionDuration(action);
  if (!dur) return;
  cat.act = action;
  cat.actT = 0;
  cat.actDur = dur;
  cat.idleSec = 0;
}

function tickCatAction(c, dt) {
  if (inSideRoom()) {
    if (c.act) {
      c.actT += dt;
      if (c.actT >= c.actDur) {
        c.act = null;
        c.actT = 0;
        c.actDur = 0;
      }
    }
    return;
  }
  if (c.resting && c.act === 'nap') {
    c.actT += dt;
    if (c.actT >= c.actDur) c.actT -= c.actDur;
    return;
  }
  if (c.resting) return;
  if (c.act) {
    if (c.act === 'jump' && !inSideRoom() && !c.jumpVerticalOnly) {
      const p = c.actDur > 0 ? c.actT / c.actDur : 1;
      if (p < 0.72) {
        const jdx = c.jumpDx != null ? c.jumpDx : (c.facing || 1);
        const jdy = c.jumpDy != null ? c.jumpDy : 0;
        const glide = 16 * dt * (1 - p * 0.45);
        c.wx += jdx * glide;
        c.wy += jdy * glide;
        clampCat(c);
      }
    }
    c.actT += dt;
    if (c.actT >= c.actDur) {
      if (c.act === 'jump' && !inSideRoom()) {
        CatWorld.resolveStreamRocks(c, catFootOffset(c));
      }
      c.jumpVerticalOnly = false;
      c.jumpDx = 0;
      c.jumpDy = 0;
      c.act = null;
      c.actT = 0;
      c.actDur = 0;
    }
    return;
  }
  if (c.moving) {
    c.idleSec = 0;
    return;
  }
  c.idleSec += dt;
  if (c.id !== state.selectedId || !state.weather) return;
  const wType = ValleyWeather.displayType(state.weather);
  const next = ValleyWeather.suggestAction(wType, c, c.idleSec);
  if (!next) return;
  c.act = next;
  c.actT = 0;
  c.actDur = ValleyWeather.actionDuration(next);
  c.idleSec = 0;
}

function moveCat(c, dx, dy, dt) {
  if (isCatJumping(c)) {
    c.moving = false;
    c.vx = 0;
    c.vy = 0;
    tickCatAction(c, dt);
    return;
  }
  if (!dx && !dy) {
    c.moving = false;
    c.vx = 0;
    c.vy = 0;
    tickCatAction(c, dt);
    return;
  }
  c.resting = false;
  lastRestNote = '';
  if (c.act && c.act !== 'nap' && c.act !== 'jump') {
    c.act = null;
    c.actT = 0;
    c.actDur = 0;
  }
  const len = Math.hypot(dx, dy) || 1;
  let speed = c.happy ? 200 : 90;
  if (state.chillMode) speed *= 0.72;
  if (!c.happy && c.hunger >= HUNGER_STOP) {
    speed = inSideRoom() ? 130 : 48;
    if (c.id === state.selectedId) {
      setCaption('饿晕了……还能慢走，快喂 🥐 小面包');
    }
  }
  if (c.onMountain) speed *= 0.82;
  if (!inSideRoom() && CatWorld.streamCurrentAt(c.wx, c.wy).inWater) speed *= 0.74;
  const prevWx = c.wx;
  const prevWy = c.wy;
  c.vx = dx / len;
  c.vy = dy / len;
  const foot = catFootOffset(c);
  let nx = c.wx + c.vx * speed * dt;
  let ny = c.wy + c.vy * speed * dt;
  if (streamRocksBlockCat(c, nx, c.wy, foot)) nx = c.wx;
  if (streamRocksBlockCat(c, nx, ny, foot)) ny = c.wy;
  c.wx = nx;
  c.wy = ny;
  if (!isCatJumping(c)) CatWorld.resolveStreamRocks(c, foot);
  if (Math.abs(dx) > 0.05) c.facing = dx >= 0 ? 1 : -1;
  c.walkPhase += dt * (c.happy ? 8 : 4);
  c.moving = true;
  clampCat(c);
  if (inSideRoom()) {
    c.onMountain = false;
    c.mountainElevation = 0;
  } else {
    CatWorld.applyMountainPhysics(c, catFootOffset(c));
    if (c.onMountain && c.wx !== prevWx) {
      CatWorld.applyMountainPhysics(c, catFootOffset(c));
    }
  }
  const step = Math.hypot(c.wx - prevWx, c.wy - prevWy);
  tickCatHunger(c, step, dt);
  if (!inSideRoom()) tickExploreCoins(c, step);
  if (!inSideRoom()) noteBiome(c);
  if (!inSideRoom()) noteMountain(c);
  tickCatAction(c, dt);
}

let lastBiomeNote = '';
let lastMountainNote = '';
let lastStreamNote = '';

function isCatJumping(c) {
  return !!(c && c.act === 'jump' && c.actDur > 0 && c.actT < c.actDur);
}

function steeringVector() {
  let dx = state.joystick.x;
  let dy = state.joystick.y;
  if (state.input.up) dy -= 1;
  if (state.input.down) dy += 1;
  if (state.input.left) dx -= 1;
  if (state.input.right) dx += 1;
  const len = Math.hypot(dx, dy);
  if (len > 0.01) return { x: dx / len, y: dy / len };
  return { x: 0, y: 0 };
}

function steeringActive() {
  const j = state.joystick;
  if (Math.hypot(j.x, j.y) > 0.07) return true;
  return !!(state.input.up || state.input.down || state.input.left || state.input.right);
}

function streamRocksBlockCat(c, wx, wy, footR) {
  if (isCatJumping(c)) return false;
  return CatWorld.streamRockBlocks(wx, wy, footR);
}

function applyStreamDrift(c, dt) {
  if (inSideRoom()) {
    c.inStream = false;
    return;
  }
  const flow = CatWorld.streamCurrentAt(c.wx, c.wy);
  c.inStream = flow.inWater;
  if (!flow.inWater) return;
  const drift = STREAM_DRIFT_MIN + flow.strength * (STREAM_DRIFT_MAX - STREAM_DRIFT_MIN);
  const foot = catFootOffset(c);
  let nx = c.wx + flow.ux * drift * dt;
  let ny = c.wy + flow.uy * drift * dt;
  if (streamRocksBlockCat(c, nx, c.wy, foot)) nx = c.wx;
  if (streamRocksBlockCat(c, nx, ny, foot)) ny = c.wy;
  c.wx = nx;
  c.wy = ny;
  if (!isCatJumping(c)) CatWorld.resolveStreamRocks(c, foot);
  clampCat(c);
}

function noteStream(c) {
  if (inSideRoom() || c.id !== state.selectedId) return;
  const key = c.inStream ? 'in' : 'out';
  if (lastStreamNote === key) return;
  lastStreamNote = key;
  if (c.inStream) {
    showToast('进溪水啦～会慢慢被冲走');
    setCaption('溪水哗哗 · 不动也会漂向下游 · 往上游要走快点');
  }
}
function noteMountain(c) {
  if (inSideRoom() || c.id !== state.selectedId) return;
  const key = c.onMountain ? 'on' : 'off';
  if (key === lastMountainNote) return;
  lastMountainNote = key;
  if (c.onMountain) {
    setCaption('爬上山坡啦 · 左右走可以沿坡移动');
  }
}

function noteBiome(c) {
  if (inSideRoom() || c.id !== state.selectedId) return;
  const bio = CatWorld.biomeAt(c.wx, c.wy);
  const key = `${c.id}:${bio.id}`;
  if (key === lastBiomeNote) return;
  lastBiomeNote = key;
  if (!state.visitedBiomes.includes(bio.id)) {
    state.visitedBiomes.push(bio.id);
    addCoins(COINS_BIOME_FIRST, `第一次到${bio.name}！+${COINS_BIOME_FIRST} 金币`);
    syncCodex();
    save();
  }
  if (bio.id === 'forest' && !state.secretGateFound) {
    setCaption('🌲 深林 · 往西北找淡蓝门 🚪 秘密通道（大绿山后面）');
  } else if (bio.id === 'osmanthus') {
    setCaption('🌼 桂花林 · 金桂飘香 · 靠近黄点可摘桂花');
  } else {
    setCaption(`在${bio.name} · 吃饱走一走也能赚金币`);
  }
}

function tickSecretHint(cat) {
  if (!cat || cat.id !== state.selectedId || inSideRoom() || state.secretGateFound) return;
  const bio = CatWorld.biomeAt(cat.wx, cat.wy);
  if (bio.id !== 'forest') return;
  const gate = CatWorld.secretGate;
  if (!gate) return;
  const d = Math.hypot(cat.wx - gate.x, cat.wy - gate.y);
  if (d <= CatSecret.DISCOVER_RADIUS) return;
  const dx = gate.x - cat.wx;
  const dy = gate.y - cat.wy;
  let dir = '';
  if (Math.abs(dx) >= Math.abs(dy)) dir = dx > 0 ? '往东' : '往西';
  else dir = dy > 0 ? '往南' : '往北';
  setCaption(`🚪 秘密通道在${dir} · 还有一段路 · 找淡蓝圆门`);
}

function updateMovement(dt) {
  if (Gachapon.isPlaying() || state.photoMode) return;

  state.cats.forEach(c => {
    if (inSideRoom()) c.bounce = 0;
    else if (c.bounce > 0) c.bounce = Math.max(0, c.bounce - dt * 2.5);
    if (c.id !== state.selectedId) {
      c.moving = false;
      tickCatHunger(c, 0, dt);
    }
  });

  const cat = selectedCat();
  let moveInput = { x: 0, y: 0 };
  if (cat) {
    let dx = state.joystick.x;
    let dy = state.joystick.y;
    if (state.input.up) dy -= 1;
    if (state.input.down) dy += 1;
    if (state.input.left) dx -= 1;
    if (state.input.right) dx += 1;
    const moveLen = Math.hypot(dx, dy);
    if (moveLen > 0.01) {
      dx /= moveLen;
      dy /= moveLen;
    } else {
      dx = 0;
      dy = 0;
    }
    moveInput = { x: dx, y: dy };
    if (dx || dy) {
      resetWalkStamina(cat);
      moveCat(cat, dx, dy, dt);
      state.nearRest = nearestRestSpot(cat);
    } else {
      moveCat(cat, 0, 0, dt);
      if (!inSideRoom()) {
        CatWorld.applyMountainPhysics(cat, catFootOffset(cat));
        tickRestSpot(cat, dt);
      }
      tickCatHunger(cat, 0, dt);
    }
  }

  state.cats.forEach(c => applyStreamDrift(c, dt));
  if (cat) noteStream(cat);

  updateCuicuiDrops(dt);

  if (cat) {
    ValleyCam.follow(cat, dt, w, h);
    tryAutoCollectCuicuiDrops(cat);
    if (cat.moving) {
      const posKey = `${cat.wx.toFixed(0)},${cat.wy.toFixed(0)}`;
      if (posKey !== lastSavedPos) scheduleSave();
    }
  }

  const lead = selectedCat();
  if (lead && state.weather && !inSideRoom()) {
    ValleyWeather.update(state, lead, dt, w, h);
    const weatherEl = document.getElementById('stat-weather');
    if (weatherEl) weatherEl.textContent = weatherEmoji();
  }

  seasonCheckT += dt;
  if (seasonCheckT >= 45) {
    seasonCheckT = 0;
    syncValleySeason();
  }

  if (cat && state.paradiseMode) {
    CatParadise.tick(state, cat, dt, paradiseHooks(), moveInput);
    CatParadise.tickFollow(state, dt, paradiseHelpers());
  } else if (cat && state.treasureMode) {
    state.inParadise = false;
    state.inTreasureRoom = CatTreasure.inZone(cat.wx, cat.wy);
    CatTreasure.tick(state, cat, dt, modeHooks());
    CatTreasure.tickFollow(state, dt, paradiseHelpers());
  } else if (cat && state.secretMode) {
    state.inParadise = false;
    state.inTreasureRoom = false;
    state.inSecretRoom = CatWorld.inCatSecretRoom(cat.wx, cat.wy);
    CatSecret.tickRoom(state, cat, modeHooks());
    CatSecret.tickFollow(state, dt, paradiseHelpers());
  } else {
    state.inParadise = false;
    state.inTreasureRoom = false;
    state.inSecretRoom = false;
    if (cat) {
      CatSecret.tickWorld(state, cat, modeHooks());
      tickSecretHint(cat);
    }
  }
}

function paradiseHooks() {
  return {
    addCoins,
    showToast,
    setCaption,
    save,
    clampCat,
    catFootOffset,
  };
}

function paradiseHelpers() {
  return { clampCat, catFootOffset, tickCatHunger };
}

function drawFrame(now) {
  if (!ctx) return;
  const dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0.016;
  lastNow = now;
  blinkT += dt;
  updateMovement(dt);

  ctx.clearRect(0, 0, w, h);
  const view = ValleyCam.viewRect(w, h);
  const leadCat = selectedCat();
  const animT = blinkT;

  ctx.save();
  ValleyCam.applyTransform(ctx, w, h);
  let sdisplayGlow = null;
  if (state.paradiseMode && leadCat) {
    const sToy = (CatWorld.catParadiseToys || []).find(t => t.kind === 'sdisplay');
    if (sToy) {
      const skin = CatSkins.get(leadCat.skinId);
      const onPad = Math.hypot(leadCat.wx - sToy.x, leadCat.wy - sToy.y) <= sToy.r * 0.92;
      if (onPad && (skin.seasonOnly || skin.tier === 'S')) sdisplayGlow = skin;
    }
  }

  CatArt.drawWorld(ctx, view, animT, {
    cuicuiCooldowns: state.cuicuiCooldowns,
    cuicuiKnockedMap: state.cuicuiKnockedMap,
    now: Date.now(),
    nearRest: state.nearRest,
    resting: !!leadCat?.resting,
    paradiseOnly: state.paradiseMode,
    treasureOnly: state.treasureMode,
    secretOnly: state.secretMode,
    treasuresFound: state.treasuresFound,
    secretOrbsFound: state.secretOrbsFound,
    secretGateFound: state.secretGateFound,
    nearSecretGate: leadCat && nearSecretGate(leadCat),
    nearSecretExit: leadCat && state.secretMode && nearSecretExit(leadCat),
    hintSecretGate: leadCat && !state.secretGateFound && CatWorld.biomeAt(leadCat.wx, leadCat.wy).id === 'forest',
    sdisplayGlow,
  });

  if (!inSideRoom()) state.cuicuiDrops.forEach(drop => {
    if (drop.wx < view.left - 40 || drop.wx > view.right + 40) return;
    if (drop.wy < view.top - 40 || drop.wy > view.bottom + 40) return;
    CatArt.drawCuicuiFruit(ctx, drop.wx, drop.wy, 0.72);
  });

  const blink = (Math.sin(blinkT * 0.65) + 1) / 2;
  const drawCats = [...state.cats].sort((a, b) => a.wy - b.wy);
  drawCats.forEach(c => {
    if (c.wx < view.left - 50 || c.wx > view.right + 50) return;
    const r = catWorldR(c);
    const room = inSideRoom();
    const bob = room
      ? (c.moving ? Math.sin(c.walkPhase) * 2 : 0)
      : Math.sin(animT * 2.8 + c.wx * 0.008) * (c.moving ? 2 : 3) - c.bounce * 8;
    const drawOpts = {
      skinId: c.skinId,
      hunger: c.hunger / 100,
      bob, blink,
      happy: c.happy,
      facing: c.facing,
      walkPhase: c.walkPhase,
      moving: c.moving,
      elevation: room ? 0 : (c.mountainElevation || 0),
      action: c.act,
      actionT: c.actT,
      actionDur: c.actDur,
      squash: room ? 1 : 1 + Math.sin(animT * 2 + c.wx * 0.01) * 0.02,
    };
    CatArt.drawCatWorld(ctx, c.wx, c.wy, r, drawOpts);
  });
  ctx.restore();

  if (state.weather && !inSideRoom() && !isImmersed()) {
    ValleyWeather.drawScreen(ctx, w, h, state.weather);
  }

  if (state.crunch && !isImmersed()) {
    state.crunch.age += dt * 1.8;
    CatArt.drawCrunch(ctx, state.crunch.x, state.crunch.y, state.crunch.age, state.crunch.text);
    if (state.crunch.age >= 1) state.crunch = null;
  }
  if (!inSideRoom() && !isImmersed()) {
    CatArt.drawMinimap(ctx, w, h, state.cats, state.selectedId, {
      hintSecretGate: leadCat && !state.secretGateFound && CatWorld.biomeAt(leadCat.wx, leadCat.wy).id === 'forest',
    });
  }
  if (leadCat && !state.secretGateFound && !inSideRoom()) {
    const bio = CatWorld.biomeAt(leadCat.wx, leadCat.wy);
    if (bio.id === 'forest') {
      CatArt.drawSecretDirectionHint(ctx, w, h, leadCat.wx, leadCat.wy);
    }
  }
  updateBerryPickState();
}

function loop(now) {
  try {
    drawFrame(now);
  } catch (err) {
    console.error(err);
    showBootError(err);
  }
  animId = requestAnimationFrame(loop);
}

function pointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  return { sx: e.clientX - rect.left, sy: e.clientY - rect.top };
}

function onCanvasTap(e) {
  if (uiPointerActive || e.target !== canvas) return;
  if (Gachapon.isPlaying()) return;
  if (isImmersed()) return;
  if (state.photoMode) {
    togglePhotoMode(false);
    return;
  }

  const { sx, sy } = pointerPos(e);
  const { wx, wy } = ValleyCam.screenToWorld(sx, sy, w, h);
  const cat = selectedCat();

  if (!inSideRoom() && CatSecret.hitGateAt(wx, wy)) {
    if (state.secretEnterBlockUntil && Date.now() < state.secretEnterBlockUntil) {
      showToast('刚出来，稍等再进门');
      return;
    }
    const gate = CatWorld.secretGate;
    if (cat && Math.hypot(cat.wx - gate.x, cat.wy - gate.y) <= CatSecret.GATE_TAP_RADIUS * 1.4) {
      if (!state.secretGateFound) {
        state.secretGateFound = true;
        syncCodex();
        save();
      }
      enterSecretMode();
    } else {
      showToast('再靠近一点才能进门');
    }
    return;
  }

  const toyHit = state.paradiseMode ? CatParadise.hitToyAt(wx, wy) : null;
  if (toyHit && cat) {
    const reach = toyHit.kind === 'photo' ? 165 : toyHit.kind === 'slide' ? 150 : 130;
    const cx = toyHit.kind === 'slide' ? (toyHit.x + toyHit.x2) * 0.5 : toyHit.x;
    const cy = toyHit.kind === 'slide' ? (toyHit.y + toyHit.y2) * 0.5 : toyHit.y;
    if (Math.hypot(cat.wx - cx, cat.wy - cy) <= reach) {
      CatParadise.onToyTap(toyHit, cat, paradiseHooks());
    } else {
      showToast('再靠近一点才能玩');
    }
    return;
  }

  const chestHit = state.treasureMode ? CatTreasure.hitChestAt(wx, wy, state) : null;
  if (chestHit && cat) {
    if (Math.hypot(cat.wx - chestHit.x, cat.wy - chestHit.y) <= CatTreasure.PICK_RADIUS) {
      CatTreasure.collect(state, chestHit, modeHooks());
    } else {
      showToast('再靠近一点才能开木箱');
    }
    return;
  }

  const restHit = hitRestSpotAt(wx, wy);
  if (restHit && cat) {
    beginRestAt(cat, restHit, true);
    return;
  }

  const groundHit = hitFallenCuicui(wx, wy);
  if (groundHit) {
    tryCollectCuicuiDrop(groundHit);
    return;
  }

  const treeHit = hitTreeCuicuiFruit(wx, wy);
  if (treeHit) {
    knockCuicuiFruit(treeHit);
    return;
  }

  const specHit = hitSpecialtyAt(wx, wy);
  if (specHit && cat && Math.hypot(cat.wx - specHit.x, cat.wy - specHit.y) <= SPECIALTY_PICK_RADIUS) {
    pickSpecialty(specHit);
    return;
  }
  if (specHit && cat) {
    showToast('再靠近一点才能摘特产');
    return;
  }

  const bushHit = hitBushAt(wx, wy);
  if (bushHit && cat && Math.hypot(cat.wx - bushHit.x, cat.wy - bushHit.y) <= BERRY_PICK_RADIUS) {
    pickWildBerry(bushHit);
    return;
  }
  if (bushHit && cat) {
    showToast('猫要再靠近草丛才能摘');
    return;
  }

  if (CatBackpack.isOpen()) return;

  const tappedCat = hitCat(sx, sy);
  if (!tappedCat) return;
  selectCat(tappedCat);
  if (!tappedCat.happy && state.snacks > 0) feedCat(tappedCat);
}

function setInput(dir, on) {
  state.input[dir] = on;
  if (on) resetWalkStamina(selectedCat());
}

function bindToolButton(btn, onTap) {
  if (!btn || btn.dataset.bound) return;
  btn.dataset.bound = '1';
  let lastFire = 0;
  const fire = e => {
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    if (now - lastFire < 350) return;
    lastFire = now;
    uiPointerActive = true;
    onTap();
    setTimeout(() => { uiPointerActive = false; }, 160);
  };
  btn.addEventListener('click', fire);
  btn.addEventListener('touchend', fire, { passive: false });
}

function bindJumpButton(btn) {
  if (!btn || btn.dataset.bound) return;
  btn.dataset.bound = '1';
  let holdTimer = null;
  const JUMP_REPEAT_MS = 520;

  const pulse = () => {
    if (isCatJumping(selectedCat())) return;
    uiPointerActive = true;
    playSelectedCatAction('jump');
  };

  const stopHold = () => {
    if (holdTimer != null) {
      clearInterval(holdTimer);
      holdTimer = null;
    }
    setTimeout(() => { uiPointerActive = false; }, 160);
  };

  const onStart = e => {
    e.preventDefault();
    e.stopPropagation();
    pulse();
    if (holdTimer != null) clearInterval(holdTimer);
    holdTimer = setInterval(pulse, JUMP_REPEAT_MS);
  };

  btn.addEventListener('pointerdown', onStart);
  btn.addEventListener('pointerup', e => {
    e.preventDefault();
    e.stopPropagation();
    stopHold();
  });
  btn.addEventListener('pointerleave', stopHold);
  btn.addEventListener('pointercancel', stopHold);
}

const MOVE_KEY_MAP = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', W: 'up', s: 'down', S: 'down', a: 'left', A: 'left', d: 'right', D: 'right',
};

function syncJoystickKnobVisual() {
  const base = document.getElementById('joystick-base');
  const knob = document.getElementById('joystick-knob');
  if (!base || !knob || state.joystick.active) return;
  let x = 0;
  let y = 0;
  if (state.input.left) x -= 1;
  if (state.input.right) x += 1;
  if (state.input.up) y -= 1;
  if (state.input.down) y += 1;
  const len = Math.hypot(x, y);
  if (len > 0) {
    x /= len;
    y /= len;
  }
  const max = base.clientWidth * 0.42;
  knob.style.transform = `translate(${x * max}px, ${y * max}px)`;
}

function bindJoystick() {
  const base = document.getElementById('joystick-base');
  const knob = document.getElementById('joystick-knob');
  if (!base || !knob) return;

  let dragging = false;
  const dead = 0.12;

  function maxTravel() {
    return base.clientWidth * 0.42;
  }

  function baseCenter() {
    const r = base.getBoundingClientRect();
    return { cx: r.left + r.width * 0.5, cy: r.top + r.height * 0.5 };
  }

  function setKnob(nx, ny) {
    const max = maxTravel();
    knob.style.transform = `translate(${nx * max}px, ${ny * max}px)`;
  }

  function applyStick(clientX, clientY) {
    const { cx, cy } = baseCenter();
    let ox = clientX - cx;
    let oy = clientY - cy;
    const dist = Math.hypot(ox, oy);
    const max = maxTravel();
    if (dist > max) {
      ox = (ox / dist) * max;
      oy = (oy / dist) * max;
    }
    const nx = ox / max;
    const ny = oy / max;
    state.joystick.active = true;
    state.joystick.x = Math.abs(nx) > dead ? nx : 0;
    state.joystick.y = Math.abs(ny) > dead ? ny : 0;
    setKnob(nx, ny);
    if (state.joystick.x || state.joystick.y) resetWalkStamina(selectedCat());
  }

  function releaseStick() {
    dragging = false;
    base.classList.remove('active');
    state.joystick.active = false;
    state.joystick.x = 0;
    state.joystick.y = 0;
    syncJoystickKnobVisual();
  }

  function onStart(e) {
    if (e.type === 'mousedown' && e.button !== 0) return;
    e.preventDefault();
    dragging = true;
    base.classList.add('active');
    uiPointerActive = true;
    const pt = e.touches ? e.touches[0] : e;
    applyStick(pt.clientX, pt.clientY);
  }

  function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const pt = e.touches ? e.touches[0] : e;
    applyStick(pt.clientX, pt.clientY);
  }

  function onEnd() {
    if (!dragging) return;
    uiPointerActive = false;
    releaseStick();
  }

  base.addEventListener('mousedown', onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);
  base.addEventListener('touchstart', onStart, { passive: false });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onEnd);
  window.addEventListener('touchcancel', onEnd);

  window.addEventListener('keydown', e => {
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      if (e.repeat) return;
      playSelectedCatAction('jump');
      return;
    }
    const dir = MOVE_KEY_MAP[e.key];
    if (!dir || e.repeat) return;
    e.preventDefault();
    setInput(dir, true);
    syncJoystickKnobVisual();
  });
  window.addEventListener('keyup', e => {
    const dir = MOVE_KEY_MAP[e.key];
    if (!dir) return;
    setInput(dir, false);
    syncJoystickKnobVisual();
  });

  window.addEventListener('blur', () => {
    ['up', 'down', 'left', 'right'].forEach(dir => setInput(dir, false));
    if (dragging) {
      uiPointerActive = false;
      releaseStick();
    }
  });
}

function bindUI() {
  canvas = document.getElementById('valley-canvas');
  if (!canvas) {
    throw new Error('找不到游戏画布 #valley-canvas');
  }
  ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建 2D 画布');
  }
  canvas.addEventListener('click', onCanvasTap);
  canvas.addEventListener('touchend', e => {
    if (uiPointerActive || !e.changedTouches[0]) return;
    const t = e.changedTouches[0];
    onCanvasTap({
      clientX: t.clientX,
      clientY: t.clientY,
      target: canvas,
      preventDefault() {},
      stopPropagation() {},
    });
    e.preventDefault();
  }, { passive: false });
  bindJoystick();

  bindToolButton(document.getElementById('valley-season-badge'), () => {
    if (typeof CatBackpack !== 'undefined') CatBackpack.openSkins(true);
  });
  bindToolButton(document.getElementById('btn-gacha'), () => {
    if (Gachapon.isPlaying()) return;
    Gachapon.open(result => {
      if (!result?.skinId) return;
      unlockGachaSkin(result.skinId);
    }, {
      spinCost: GACHA_COST,
      canSpin: () => state.coins >= GACHA_COST,
      onDeny: () => showToast(`金币不够！喂猫赚金币 · 需要 ${GACHA_COST} 金币`),
      onSpin: () => {
        state.coins -= GACHA_COST;
        updateUI();
        save();
      },
    });
  });
  bindToolButton(document.getElementById('btn-hold'), () => feedSelectedCat('bread'));
  bindToolButton(document.getElementById('btn-berry'), () => feedSelectedCat('berry'));
  bindToolButton(document.getElementById('btn-cuicui'), () => feedSelectedCat('cuicui'));
  bindToolButton(document.getElementById('btn-refill'), () => {
    state.snacks = Math.min(9, state.snacks + 3);
    showToast('又买了一袋小面包');
    updateUI();
    save();
  });
  bindToolButton(document.getElementById('btn-photo'), () => togglePhotoMode());
  bindToolButton(document.getElementById('btn-immerse'), () => toggleImmerseSoft());
  bindToolButton(document.getElementById('btn-immerse-full'), () => toggleImmerseFull());
  bindToolButton(document.getElementById('btn-immerse-exit'), () => exitImmerse());
  bindJumpButton(document.getElementById('btn-act-jump'));
  bindToolButton(document.getElementById('btn-act-stretch'), () => playSelectedCatAction('stretch'));
  bindToolButton(document.getElementById('btn-paradise'), () => toggleParadiseMode());
  updateParadiseButton();
  bindToolButton(document.getElementById('btn-chill'), () => toggleChillMode());
  bindToolButton(document.getElementById('btn-treasure'), () => toggleTreasureMode());
  updateChillButton();
  updateTreasureButton();
  bindToolButton(document.getElementById('btn-reset'), () => {
    if (state.paradiseMode) {
      state.paradiseReturn = null;
      state.paradiseMode = false;
      state.inParadise = false;
      document.body.classList.remove('valley-paradise-mode');
      updateParadiseButton();
    }
    if (state.treasureMode) {
      state.treasureReturn = null;
      state.treasureMode = false;
      state.inTreasureRoom = false;
      document.body.classList.remove('valley-treasure-mode');
      updateTreasureButton();
    }
    if (state.secretMode) {
      state.secretReturn = null;
      state.secretMode = false;
      state.inSecretRoom = false;
      document.body.classList.remove('valley-secret-mode');
    }
    state.cats = [
      makeCat('big', null, null, 1, '大幼崽'),
      makeCat('small', null, null, 0.72, '小幼崽'),
    ];
    state.selectedId = 'big';
    ValleyCam.x = CatWorld.spawn.x;
    ValleyCam.y = CatWorld.spawn.y;
    setCaption('饥饿让幼崽停下脚步');
    updateUI();
    updateSelectedLabel();
    save();
    showToast('回到雪谷起点');
  });

  document.getElementById('btn-rename')?.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    promptRenameCat();
  });
  document.getElementById('btn-pick-specialty')?.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    tryPickSpecialty();
  });
  ['date', 'cone', 'clover', 'guihua'].forEach(kind => {
    document.getElementById(`btn-feed-${kind}`)?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      feedSelectedCat(kind);
    });
  });

  const switchBtn = document.getElementById('btn-switch');
  if (switchBtn) {
    switchBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      switchCat();
    });
  }

  const intro = document.getElementById('intro-card');
  if (!state.introSeen && intro) {
    intro.hidden = false;
    document.getElementById('btn-start')?.addEventListener('click', () => {
      intro.hidden = true;
      state.introSeen = true;
      save();
    });
  } else if (intro) intro.hidden = true;

  window.addEventListener('resize', () => {
    clearTimeout(bindUI._rz);
    bindUI._rz = setTimeout(resize, 100);
  });
}

function updateBackpackStash() {
  const bpBerry = document.getElementById('bp-berry-count');
  const bpCuicui = document.getElementById('bp-cuicui-count');
  const bpDate = document.getElementById('bp-date-count');
  const bpCone = document.getElementById('bp-cone-count');
  const bpClover = document.getElementById('bp-clover-count');
  if (bpBerry) bpBerry.textContent = String(state.wildBerries);
  if (bpCuicui) bpCuicui.textContent = String(state.cuicuiFruits);
  if (bpDate) bpDate.textContent = String(state.desertDates);
  if (bpCone) bpCone.textContent = String(state.pineCones);
  if (bpClover) bpClover.textContent = String(state.meadowClover);
  const bpGuihua = document.getElementById('bp-guihua-count');
  if (bpGuihua) bpGuihua.textContent = String(state.osmanthusBlossoms);
}

function updateUI() {
  document.getElementById('stat-snacks').textContent = String(state.snacks);
  const berryEl = document.getElementById('stat-berries');
  if (berryEl) berryEl.textContent = String(state.wildBerries);
  const cuicuiEl = document.getElementById('stat-cuicui');
  if (cuicuiEl) cuicuiEl.textContent = String(state.cuicuiFruits);
  document.getElementById('stat-coins').textContent = String(state.coins);
  document.getElementById('stat-fed').textContent = String(state.totalFed);
  document.getElementById('stat-hungry').textContent = String(state.cats.filter(c => !c.happy).length);
  const skinEl = document.getElementById('stat-skins');
  if (skinEl) skinEl.textContent = String(state.unlockedSkins.length);
  const weatherEl = document.getElementById('stat-weather');
  if (weatherEl) weatherEl.textContent = weatherEmoji();
  updateBackpackStash();
}

function resize() {
  const stage = document.getElementById('game-stage');
  if (!stage || !canvas) return;
  w = Math.floor(stage.clientWidth);
  h = Math.floor(stage.clientHeight);
  if (w < 10 || h < 10) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ValleyCam.clamp(w, h);
  if (state.weather) ValleyWeather.resizeParticles(state.weather, w, h);
}

function weatherEmoji() {
  const w = state.weather;
  if (!w || w.intensity < 0.12) return '☀️';
  const t = ValleyWeather.displayType(w);
  return { clear: '☀️', snow: '❄️', rain: '🌧️', leaves: '🍂', haze: '🌫️' }[t] || '☀️';
}

function initWeather() {
  state.weather = ValleyWeather.createState();
  const cat = selectedCat();
  if (cat) {
    const bio = CatWorld.biomeAt(cat.wx, cat.wy);
    const type = ValleyWeather.preferredForBiome(bio.id);
    Object.assign(state.weather, {
      type,
      prevType: type,
      goalType: type,
      stableBiome: bio.id,
      intensity: ValleyWeather.goalIntensity(type),
      goalIntensity: ValleyWeather.goalIntensity(type),
      blend: 1,
      lockTimer: 120,
    });
  }
  if (w > 0 && h > 0) ValleyWeather.resizeParticles(state.weather, w, h);
}

function init() {
  try {
    Gachapon.init();
    CatBackpack.init();
    CatCodex.init();
    CatWorld.buildTerrain();
    loadSave();
    sanitizeForageState();
    const cat = selectedCat();
    if (cat) {
      ValleyCam.x = cat.wx;
      ValleyCam.y = cat.wy;
    }
    bindAutoSave();
    bindUI();
    resize();
    initWeather();
    syncValleySeason();
    updateUI();
    updateSelectedLabel();
    updateChillButton();
    updateTreasureButton();
    state.cats.forEach(reconcileCatHunger);
    if (!state.captionLoaded) {
      setCaption('点左上角 🎡 妙脆角猫游乐园 · 随时去玩');
    }
    cancelAnimationFrame(animId);
    lastNow = 0;
    blinkT = 0;
    animId = requestAnimationFrame(loop);
    const buildKey = `valley_build_${VALLEY_BUILD}`;
    if (sessionStorage.getItem(buildKey) !== '1') {
      sessionStorage.setItem(buildKey, '1');
      setTimeout(() => showToast(`已加载 v${VALLEY_BUILD}`), 600);
    }
  } catch (err) {
    console.error(err);
    showBootError(err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
