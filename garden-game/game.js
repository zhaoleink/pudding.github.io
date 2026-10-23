/**
 * 花鱼小院 — 独立小游戏
 * 种植逻辑与泡泡农场一致：每阶浇水 → 生长 → 再浇水 → 直到成熟
 */
const STORAGE_KEY = 'huayu_garden_v2';
const SEEDS_STORAGE_KEY = 'huayu_garden_seeds_v1';
const SAVE_VERSION = 6;
const MANOR_DECOR_MAX = 24;
const VALID_TABS = ['garden', 'pond', 'insect', 'dew', 'shop', 'bugcatch', 'seedshop', 'bird', 'rain', 'fruitshop', 'compost', 'mushroom', 'well', 'manor'];
const AUTO_SAVE_MS = 30000;
const PLOT_COUNT = 6;
const POND_UNLOCK_COINS = 80;
const MAX_FISH = 6;
const HUNGER_TICK_MS = 12000;
const HUNGER_DECAY = 1;
const INSECT_SLOT_COUNT = 12;
const INSECT_HUNGER_TICK_MS = 15000;
const INSECT_HUNGER_DECAY = 1;
const INSECT_FEED_COST = 4;
const DEW_POOL_UNLOCK_TOTAL = 5;
const DEW_UPGRADE_COSTS = [12, 25, 45];
const DEW_CONDENSE_MS = 25000;
const DEW_CONDENSE_PER_LEVEL = [0, 1, 2, 3];
const DEW_COST_WATER_ALL = 5;
const DEW_COST_BOOST = 8;
const DEW_COST_NOURISH = 4;
const DEW_COST_HARVEST_ALL = 6;
const DEW_COST_PLANT_ALL = 4;
const SHOP_UNLOCK_HARVESTS = 3;
const SHOP_VISITOR_INTERVAL_MS = 10000;
const SHOP_VISITOR_WAIT_MS = 22000;
const SHOP_ORDERS = {
  flower: { label: '一朵小花', price: 14, stock: { flower: 1 } },
  tree: { label: '一盆小盆栽', price: 32, stock: { tree: 1 } },
  bouquet: { label: '一束花', price: 50, stock: { flower: 3 } },
  potted: { label: '大盆栽', price: 75, stock: { tree: 2 } },
};
const SHOP_ORDER_WEIGHTS = [
  { type: 'flower', w: 25 },
  { type: 'tree', w: 25 },
  { type: 'bouquet', w: 25 },
  { type: 'potted', w: 25 },
];
const SHOP_GUEST_TYPES = ['cat', 'bunny', 'bird'];
const SHOP_GUEST_LABELS = { cat: '小猫', bunny: '小兔', bird: '小鸟' };
const BUGCATCH_UNLOCK_INSECTS = 1;
const BUGCATCH_DURATION_SEC = 30;
const BUGCATCH_SPAWN_MS = 900;
const BUGCATCH_COIN = 3;
const SEEDSHOP_UNLOCK_SOLD = 10;
const FRUITSHOP_UNLOCK_PICKS = 3;
const BIRD_UNLOCK_HARVESTS = 5;
const BIRD_FOOD_COST = 6;
const BIRD_FOOD_MS = 55000;
const BIRD_GIFT_WAIT_MS = 18000;
const RAIN_SHELTER_MAX_LEVEL = 6;
const RAIN_SHELTER_COSTS = [35, 55, 85, 120, 165, 220];
const RAIN_SHELTER_NAMES = ['未搭建', '简易雨棚', '扩宽雨棚', '连廊雨棚', '花园雨亭', '琉璃雨阁', '花鱼雨苑'];
const RAIN_SHELTER_WATER_MS = [0, 0, 15000, 11000, 8000, 5500, 3500];
const RAIN_SHELTER_DEW_BONUS = 1;
const RAIN_INTERVAL_MS = 60000;
const RAIN_DURATION_MS = 14000;
const BASE_SEEDS = ['flower', 'tree'];
const AUDIO_PREFS_KEY = 'huayu_garden_audio';
const OFFLINE_MIN_MS = 8000;
const COMPOST_FLOWER_GAIN = 10;
const COMPOST_TREE_GAIN = 18;
const COMPOST_MAX = 100;
const MUSHROOM_UNLOCK_DEW = 15;
const MUSHROOM_PLOT_COUNT = 3;
const WELL_DRAW_COSTS = [8, 6, 4];
const WELL_UPGRADE_COSTS = [30, 55];
const WELL_DEW_DRAW_COST = 3;
const MANOR_MAX_LEVEL = 4;
const MANOR_UPGRADE_COSTS = [60, 120, 200, 320];
const MANOR_LEVEL_NAMES = ['花间小筑', '芳菲庄园', '鱼鸟清园', '锦绣华园', '花鱼天庄'];
const MANOR_DECOR_CATEGORIES = [
  { id: 'all', label: '全部' },
  { id: 'yard', label: '院饰' },
  { id: 'path', label: '路径' },
  { id: 'light', label: '灯光' },
  { id: 'plant', label: '绿植' },
];
const MANOR_DECOR_ITEMS = [
  { id: 'fence_wood', label: '木栅栏', cat: 'yard', cost: 18, emoji: '🪵' },
  { id: 'fence_stone', label: '石围栏', cat: 'yard', cost: 28, emoji: '🧱', minLevel: 1 },
  { id: 'bench', label: '花园长椅', cat: 'yard', cost: 22, emoji: '🪑' },
  { id: 'lantern_stone', label: '石灯笼', cat: 'yard', cost: 35, emoji: '🏮', minLevel: 1 },
  { id: 'mailbox', label: '小信箱', cat: 'yard', cost: 16, emoji: '📮' },
  { id: 'windmill', label: '小风车', cat: 'yard', cost: 45, emoji: '🌀', minLevel: 2 },
  { id: 'bird_bath', label: '鸟浴盆', cat: 'yard', cost: 30, emoji: '🛁', minLevel: 2 },
  { id: 'path_stone', label: '石板路', cat: 'path', cost: 12, emoji: '🪨' },
  { id: 'path_pebble', label: '鹅卵石', cat: 'path', cost: 14, emoji: '⚪' },
  { id: 'bridge_wood', label: '木小桥', cat: 'path', cost: 38, emoji: '🌉', minLevel: 1 },
  { id: 'step_stone', label: '踏脚石', cat: 'path', cost: 10, emoji: '🦶' },
  { id: 'light_hang', label: '挂灯', cat: 'light', cost: 20, emoji: '💡' },
  { id: 'light_ground', label: '地灯', cat: 'light', cost: 24, emoji: '🔦' },
  { id: 'light_string', label: '串灯', cat: 'light', cost: 32, emoji: '✨', minLevel: 1 },
  { id: 'light_torch', label: '暖火炬', cat: 'light', cost: 26, emoji: '🔥', minLevel: 2 },
  { id: 'plant_pot', label: '陶盆花', cat: 'plant', cost: 15, emoji: '🪴' },
  { id: 'plant_bush', label: '修剪灌木', cat: 'plant', cost: 20, emoji: '🌳' },
  { id: 'plant_bamboo', label: '竹丛', cat: 'plant', cost: 25, emoji: '🎋', minLevel: 1 },
  { id: 'plant_bed', label: '方形花坛', cat: 'plant', cost: 30, emoji: '🌷' },
  { id: 'plant_sakura', label: '小樱树', cat: 'plant', cost: 55, emoji: '🌸', minLevel: 2 },
  { id: 'plant_pine', label: '盆景松', cat: 'plant', cost: 40, emoji: '🌲', minLevel: 2 },
  { id: 'scarecrow', label: '稻草人', cat: 'yard', cost: 36, emoji: '🧑‍🌾', minLevel: 3 },
  { id: 'fountain', label: '小喷泉', cat: 'yard', cost: 68, emoji: '⛲', minLevel: 3 },
  { id: 'banner', label: '欢迎旗', cat: 'yard', cost: 42, emoji: '🚩', minLevel: 4 },
];
const MANOR_AREAS = [
  { id: 'garden', label: '花园' },
  { id: 'pond', label: '鱼池', need: () => state.pondUnlocked },
  { id: 'insect', label: '昆虫' },
  { id: 'dew', label: '露水', need: () => state.dewPoolUnlocked },
  { id: 'shop', label: '花房', need: () => state.shopUnlocked },
  { id: 'compost', label: '堆肥', need: () => state.compostUnlocked },
  { id: 'mushroom', label: '蘑菇', need: () => state.mushroomUnlocked },
  { id: 'well', label: '小井', need: () => state.wellUnlocked },
  { id: 'bugcatch', label: '捉虫', need: () => state.bugcatchUnlocked },
  { id: 'seedshop', label: '种子铺', need: () => state.seedshopUnlocked },
  { id: 'bird', label: '鸟架', need: () => state.birdUnlocked },
  { id: 'rain', label: '雨棚', need: () => state.rainUnlocked },
  { id: 'fruitshop', label: '水果铺', need: () => state.fruitshopUnlocked },
];

const MUSHROOM_TYPES = {
  shiitake: { label: '香菇', growMs: 12000, coin: 36, sporeCost: 20 },
  oyster: { label: '平菇', growMs: 8500, coin: 24, sporeCost: 14 },
};

const LEAF_LAYOUT = [
  { edge: 'left', pos: 16 },
  { edge: 'left', pos: 38 },
  { edge: 'left', pos: 58 },
  { edge: 'left', pos: 78 },
  { edge: 'right', pos: 22 },
  { edge: 'right', pos: 42 },
  { edge: 'right', pos: 62 },
  { edge: 'right', pos: 80 },
  { edge: 'bottom', pos: 16 },
  { edge: 'bottom', pos: 36 },
  { edge: 'bottom', pos: 58 },
  { edge: 'bottom', pos: 78 },
];

const FREE_BRANCH_INDICES = [0, 4, 8];

const HABITAT_TYPES = {
  leaf: { label: '阔叶', price: 15 },
  branch: { label: '细枝', price: 22 },
};

const INSECT_TYPES = {
  ladybug: { label: '瓢虫', price: 25, habitats: ['leaf', 'branch'] },
  butterfly: { label: '蝴蝶', price: 48, habitats: ['leaf', 'branch'] },
  caterpillar: { label: '毛毛虫', price: 18, habitats: ['leaf'] },
  bee: { label: '蜜蜂', price: 38, habitats: ['branch'] },
};

const PLANTS = {
  flower: {
    label: '小花',
    growMs: 3000,
    coin: 10,
    dew: 5,
  },
  tree: {
    label: '小树',
    growMs: 6000,
    coin: 25,
    dew: 12,
  },
  tulip: {
    label: '郁金香',
    growMs: 4000,
    coin: 18,
    dew: 8,
    shopPrice: 45,
    stockKey: 'flower',
  },
  sunflower: {
    label: '向日葵',
    growMs: 5000,
    coin: 22,
    dew: 9,
    shopPrice: 55,
    stockKey: 'flower',
  },
  pine: {
    label: '小松树',
    growMs: 8000,
    coin: 40,
    dew: 15,
    shopPrice: 90,
    stockKey: 'tree',
  },
  spruce: {
    label: '云杉',
    growMs: 8500,
    coin: 42,
    dew: 16,
    shopPrice: 98,
    stockKey: 'tree',
  },
  lavender: {
    label: '薰衣草',
    growMs: 3500,
    coin: 16,
    dew: 7,
    shopPrice: 38,
    stockKey: 'flower',
  },
  rose: {
    label: '玫瑰',
    growMs: 4500,
    coin: 28,
    dew: 10,
    shopPrice: 68,
    stockKey: 'flower',
  },
  bamboo: {
    label: '凤尾竹',
    growMs: 7000,
    coin: 34,
    dew: 13,
    shopPrice: 75,
    stockKey: 'tree',
  },
  pothos: {
    label: '绿萝',
    growMs: 4200,
    coin: 20,
    dew: 8,
    shopPrice: 52,
    stockKey: 'flower',
  },
  succulent: {
    label: '多肉',
    growMs: 5500,
    coin: 26,
    dew: 10,
    shopPrice: 65,
    stockKey: 'flower',
    autoGrow: true,
  },
  cherry: {
    label: '樱花树',
    growMs: 9000,
    coin: 48,
    dew: 18,
    shopPrice: 110,
    stockKey: 'tree',
  },
  blueberry: {
    label: '蓝莓树',
    growMs: 8200,
    coin: 18,
    dew: 9,
    shopPrice: 88,
    stockKey: 'tree',
    fruitKey: 'blueberry',
    fruitLabel: '蓝莓',
    fruitSellPrice: 14,
  },
  strawberry: {
    label: '草莓',
    growMs: 4600,
    coin: 14,
    dew: 6,
    shopPrice: 56,
    stockKey: 'flower',
    fruitKey: 'strawberry',
    fruitLabel: '草莓',
    fruitSellPrice: 11,
  },
  tomato: {
    label: '番茄',
    growMs: 5200,
    coin: 15,
    dew: 7,
    shopPrice: 50,
    stockKey: 'flower',
    fruitKey: 'tomato',
    fruitLabel: '番茄',
    fruitSellPrice: 10,
  },
  apple: {
    label: '苹果树',
    growMs: 9800,
    coin: 22,
    dew: 11,
    shopPrice: 108,
    stockKey: 'tree',
    fruitKey: 'apple',
    fruitLabel: '苹果',
    fruitSellPrice: 16,
  },
};

const FISH_TYPES = {
  goldfish: { label: '金鱼', price: 30 },
  koi: { label: '锦鲤', price: 80 },
};

const state = {
  coins: 50,
  dew: 0,
  harvestTotal: 0,
  pondUnlocked: false,
  selectedSeed: 'flower',
  plots: [],
  fish: [],
  fishIdSeq: 1,
  insectSlots: [],
  selectedHabitat: 'leaf',
  selectedInsect: 'ladybug',
  dewPoolLevel: 0,
  dewTotalEarned: 0,
  dewPoolUnlocked: false,
  lastDewCondense: Date.now(),
  shopUnlocked: false,
  shopStock: { flower: 0, tree: 0 },
  shopSoldTotal: 0,
  shopVisitor: null,
  lastShopVisitorAt: 0,
  unlockedSeeds: [],
  bugcatchUnlocked: false,
  bugcatchBest: 0,
  seedshopUnlocked: false,
  birdUnlocked: false,
  birdFoodUntil: 0,
  birdGift: null,
  lastBirdAt: 0,
  rainUnlocked: false,
  rainShelterLevel: 0,
  lastRainWaterAt: 0,
  raining: false,
  rainUntil: 0,
  nextRainAt: 0,
  fruitshopUnlocked: false,
  fruitInventory: {},
  fruitPickTotal: 0,
  fruitSoldTotal: 0,
  activeTab: 'garden',
  manorReturnTab: 'garden',
  savedAt: 0,
  tutorialComplete: false,
  tutorialStep: 'welcome',
  compostUnlocked: false,
  compostPoints: 0,
  compostTotal: 0,
  mushroomUnlocked: false,
  selectedMushroom: 'oyster',
  mushroomPlots: [],
  wellUnlocked: false,
  wellLevel: 0,
  wellDrawTotal: 0,
  manorLevel: 0,
  manorDecorPlacements: [],
  layoutMode: false,
  dailyCommissionDay: '',
  dailyCommissionId: '',
  dailyCommissionProgress: 0,
  dailyCommissionDone: false,
  dailyCommissionClaimed: false,
  dailyTrackHarvest: 0,
  dailyTrackWater: 0,
  dailyTrackSell: 0,
  dailyTrackFeedFish: 0,
};

const DAILY_COMMISSION_POOL = [
  { id: 'harvest2', label: '收获 2 次', target: 2, track: 'harvest', reward: 12 },
  { id: 'water4', label: '浇水 4 次', target: 4, track: 'water', reward: 10 },
  { id: 'sell3', label: '花房卖 3 次', target: 3, track: 'sell', reward: 15 },
  { id: 'feedfish2', label: '喂鱼 2 次', target: 2, track: 'feedfish', reward: 10 },
];

let growTimer = null;
let hungerTimer = null;
let insectHungerTimer = null;
const fishSwimTimers = [];
const fishDom = new Map();
let pondFeeding = false;
let insectFeeding = false;
let lastPlantedBranchIdx = -1;
let dewCondenseTimer = null;
let shopVisitorTimer = null;
let bugcatchSpawnTimer = null;
let bugcatchTickTimer = null;
let bugcatchActive = false;
let bugcatchScore = 0;
let bugcatchTimeLeft = 0;
let rainTimer = null;
let birdTimer = null;
let toastTimer = null;
let autoSaveTimer = null;
let pendingOfflineReport = null;
let musicTimer = null;

function defaultMushroomPlots() {
  return Array.from({ length: MUSHROOM_PLOT_COUNT }, () => ({
    type: null,
    stage: 0,
    wet: false,
    waterAt: 0,
  }));
}

function normalizeMushroomPlot(p) {
  const type = MUSHROOM_TYPES[p?.type] ? p.type : null;
  if (!type) return { type: null, stage: 0, wet: false, waterAt: 0 };
  const stage = Math.min(3, Math.max(0, p.stage | 0));
  return {
    type,
    stage,
    wet: !!p.wet && stage > 0 && stage < 3,
    waterAt: p.waterAt || 0,
  };
}

function ensureMushroomPlots() {
  if (!Array.isArray(state.mushroomPlots) || state.mushroomPlots.length !== MUSHROOM_PLOT_COUNT) {
    state.mushroomPlots = defaultMushroomPlots();
    return;
  }
  state.mushroomPlots = state.mushroomPlots.map(normalizeMushroomPlot);
}

function defaultInsectSlots() {
  const slots = Array.from({ length: INSECT_SLOT_COUNT }, () => ({
    habitat: null,
    insect: null,
    hunger: 0,
  }));
  FREE_BRANCH_INDICES.forEach(i => {
    slots[i].habitat = 'leaf';
  });
  return slots;
}

function normalizeInsectSlot(s) {
  const habitat = HABITAT_TYPES[s.habitat] ? s.habitat : null;
  const insect = habitat && INSECT_TYPES[s.insect] ? s.insect : null;
  const hunger = Number(s.hunger);
  return {
    habitat,
    insect,
    hunger: insect
      ? Math.min(100, Math.max(0, Number.isFinite(hunger) ? Math.round(hunger) : 75))
      : 0,
  };
}

function defaultPlots() {
  return Array.from({ length: PLOT_COUNT }, () => ({
    plant: null,
    stage: 0,
    wet: false,
    waterAt: 0,
    fruitReady: false,
    fruitRegrowAt: 0,
  }));
}

function ensurePlots() {
  if (!Array.isArray(state.plots) || state.plots.length !== PLOT_COUNT) {
    state.plots = defaultPlots();
    return;
  }
  state.plots = state.plots.map(normalizePlot);
}

function countEmptyPlots() {
  return state.plots.filter(p => !p.plant || p.stage <= 0).length;
}

function resetGardenPlots() {
  state.plots = defaultPlots();
  state.selectedSeed = PLANTS[state.selectedSeed] ? state.selectedSeed : 'flower';
  save();
  showToast('已恢复6块空地 · 先选种子，再点格子种花');
  renderGarden();
  refreshGardenStats();
  refreshEcoBanner();
}

function repairGardenIfBroken() {
  ensurePlots();
  if (state.harvestTotal > 0) return;
  const hasPlants = state.plots.some(p => p.plant);
  if (hasPlants) return;
  const empty = countEmptyPlots();
  if (empty < PLOT_COUNT) return;
  state.plots = defaultPlots();
}

function plantHasFruit(plantType) {
  return !!PLANTS[plantType]?.fruitKey;
}

function getFruitKeys() {
  const keys = new Set();
  Object.values(PLANTS).forEach(def => {
    if (def.fruitKey) keys.add(def.fruitKey);
  });
  return [...keys];
}

function getFruitMeta(fruitKey) {
  for (const def of Object.values(PLANTS)) {
    if (def.fruitKey === fruitKey) {
      return {
        label: def.fruitLabel || fruitKey,
        sellPrice: def.fruitSellPrice || 10,
      };
    }
  }
  return { label: fruitKey, sellPrice: 10 };
}

function normalizeUnlockedSeeds(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  list.forEach(s => {
    if (!PLANTS[s] || BASE_SEEDS.includes(s) || seen.has(s)) return;
    seen.add(s);
    out.push(s);
  });
  return out;
}

function readSeedBackup() {
  try {
    const raw = localStorage.getItem(SEEDS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeSeedBackup() {
  try {
    localStorage.setItem(SEEDS_STORAGE_KEY, JSON.stringify({
      v: 1,
      unlockedSeeds: state.unlockedSeeds,
      selectedSeed: state.selectedSeed,
      seedshopUnlocked: state.seedshopUnlocked,
      at: Date.now(),
    }));
  } catch (err) {
    console.warn('[花鱼小院] 种子库备份失败', err);
  }
}

function mergeSeedLibrary(primaryList) {
  const backup = readSeedBackup();
  state.unlockedSeeds = normalizeUnlockedSeeds([
    ...(Array.isArray(primaryList) ? primaryList : []),
    ...(Array.isArray(state.unlockedSeeds) ? state.unlockedSeeds : []),
    ...(backup?.unlockedSeeds || []),
  ]);
  if (backup?.selectedSeed && PLANTS[backup.selectedSeed]) {
    state.selectedSeed = backup.selectedSeed;
  }
  if (backup?.seedshopUnlocked) state.seedshopUnlocked = true;
}

function unlockSeedPermanent(seedKey, select = false) {
  if (!PLANTS[seedKey] || BASE_SEEDS.includes(seedKey)) return false;
  if (!state.unlockedSeeds.includes(seedKey)) state.unlockedSeeds.push(seedKey);
  if (select) state.selectedSeed = seedKey;
  writeSeedBackup();
  return true;
}

function ensureUnlockedSeeds() {
  state.unlockedSeeds = normalizeUnlockedSeeds(state.unlockedSeeds);
  if (state.selectedSeed && PLANTS[state.selectedSeed]?.shopPrice) {
    unlockSeedPermanent(state.selectedSeed, false);
  }
  state.plots.forEach(p => {
    if (p.plant && PLANTS[p.plant]?.shopPrice) unlockSeedPermanent(p.plant, false);
  });
}

function salvageSaveFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      mergeSeedLibrary([]);
      ensureUnlockedSeeds();
      return;
    }
    const d = JSON.parse(raw);
    mergeSeedLibrary(d.unlockedSeeds);
    if (d.shopStock) {
      state.shopStock = {
        flower: Math.max(0, d.shopStock.flower ?? 0),
        tree: Math.max(0, d.shopStock.tree ?? 0),
      };
    }
    if (d.fruitInventory && typeof d.fruitInventory === 'object') {
      state.fruitInventory = { ...d.fruitInventory };
      getFruitKeys().forEach(k => {
        state.fruitInventory[k] = Math.max(0, state.fruitInventory[k] | 0);
      });
    }
    if (Number.isFinite(d.coins)) state.coins = Math.max(0, d.coins);
    if (Number.isFinite(d.dew)) state.dew = Math.max(0, d.dew);
    if (PLANTS[d.selectedSeed]) state.selectedSeed = d.selectedSeed;
    if (d.seedshopUnlocked != null) state.seedshopUnlocked = !!d.seedshopUnlocked;
    if (Number.isFinite(d.shopSoldTotal)) state.shopSoldTotal = Math.max(0, d.shopSoldTotal);
    ensureUnlockedSeeds();
  } catch {}
}

function normalizePlot(p) {
  if (!p || typeof p !== 'object') {
    return {
      plant: null,
      stage: 0,
      wet: false,
      waterAt: 0,
      fruitReady: false,
      fruitRegrowAt: 0,
    };
  }
  const plant = PLANTS[p.plant] ? p.plant : null;
  let stage = plant ? Math.min(3, Math.max(0, p.stage | 0)) : 0;
  let wet = !!p.wet;
  let waterAt = p.waterAt || 0;
  if (!plant) {
    stage = 0;
    wet = false;
    waterAt = 0;
  } else if (PLANTS[plant].autoGrow && stage > 0 && stage < 3) {
    if (!waterAt) waterAt = Date.now();
    wet = true;
  }
  if (plant && stage >= 3 && plantHasFruit(plant)) {
    wet = false;
    waterAt = 0;
  }
  const fruitReady = plant && stage >= 3 && plantHasFruit(plant) ? !!p.fruitReady : false;
  const fruitRegrowAt = plant && fruitReady ? (p.fruitRegrowAt || 0) : 0;
  return {
    plant,
    stage,
    wet,
    waterAt,
    fruitReady,
    fruitRegrowAt,
  };
}

function clearPlot(plot) {
  plot.plant = null;
  plot.stage = 0;
  plot.wet = false;
  plot.waterAt = 0;
  plot.fruitReady = false;
  plot.fruitRegrowAt = 0;
}

function pickFruitFromPlot(plot, silent = false) {
  if (!plot.plant || plot.stage < 3 || !plantHasFruit(plot.plant)) return false;
  const def = PLANTS[plot.plant];
  const key = def.fruitKey;
  state.fruitInventory[key] = (state.fruitInventory[key] || 0) + 1;
  state.fruitPickTotal += 1;
  const label = def.fruitLabel;
  clearPlot(plot);
  if (!silent) {
    showToast(`采到${label} · 这块地空出来啦`);
    tryUnlockFruitshop();
  }
  return true;
}

function normalizeFish(f) {
  const hunger = Number(f.hunger);
  return {
    id: f.id,
    species: FISH_TYPES[f.species] ? f.species : 'goldfish',
    hunger: Number.isFinite(hunger) ? Math.min(100, Math.max(0, Math.round(hunger))) : 75,
    x: Number.isFinite(Number(f.x)) ? Number(f.x) : 50,
    y: Number.isFinite(Number(f.y)) ? Number(f.y) : 40,
    flip: !!f.flip,
  };
}

function buildSaveData() {
  const now = Date.now();
  state.savedAt = now;
  return {
    version: SAVE_VERSION,
    savedAt: now,
    activeTab: state.activeTab,
    coins: state.coins,
    dew: state.dew,
    harvestTotal: state.harvestTotal,
    pondUnlocked: state.pondUnlocked,
    selectedSeed: state.selectedSeed,
    plots: state.plots,
    fish: state.fish,
    fishIdSeq: state.fishIdSeq,
    insectSlots: state.insectSlots,
    selectedHabitat: state.selectedHabitat,
    selectedInsect: state.selectedInsect,
    dewPoolLevel: state.dewPoolLevel,
    dewTotalEarned: state.dewTotalEarned,
    dewPoolUnlocked: state.dewPoolUnlocked,
    lastDewCondense: state.lastDewCondense,
    shopUnlocked: state.shopUnlocked,
    shopStock: state.shopStock,
    shopSoldTotal: state.shopSoldTotal,
    shopVisitor: state.shopVisitor,
    lastShopVisitorAt: state.lastShopVisitorAt,
    unlockedSeeds: state.unlockedSeeds,
    bugcatchUnlocked: state.bugcatchUnlocked,
    bugcatchBest: state.bugcatchBest,
    seedshopUnlocked: state.seedshopUnlocked,
    birdUnlocked: state.birdUnlocked,
    birdFoodUntil: state.birdFoodUntil,
    birdGift: state.birdGift,
    lastBirdAt: state.lastBirdAt,
    rainUnlocked: state.rainUnlocked,
    rainShelterLevel: state.rainShelterLevel,
    lastRainWaterAt: state.lastRainWaterAt,
    raining: state.raining,
    rainUntil: state.rainUntil,
    nextRainAt: state.nextRainAt,
    fruitshopUnlocked: state.fruitshopUnlocked,
    fruitInventory: state.fruitInventory,
    fruitPickTotal: state.fruitPickTotal,
    fruitSoldTotal: state.fruitSoldTotal,
    tutorialComplete: state.tutorialComplete,
    tutorialStep: state.tutorialStep,
    compostUnlocked: state.compostUnlocked,
    compostPoints: state.compostPoints,
    compostTotal: state.compostTotal,
    mushroomUnlocked: state.mushroomUnlocked,
    selectedMushroom: state.selectedMushroom,
    mushroomPlots: state.mushroomPlots,
    wellUnlocked: state.wellUnlocked,
    wellLevel: state.wellLevel,
    wellDrawTotal: state.wellDrawTotal,
    manorLevel: state.manorLevel,
    manorDecorPlacements: state.manorDecorPlacements,
    manorReturnTab: state.manorReturnTab,
    layoutMode: state.layoutMode,
    dailyCommissionDay: state.dailyCommissionDay,
    dailyCommissionId: state.dailyCommissionId,
    dailyCommissionProgress: state.dailyCommissionProgress,
    dailyCommissionDone: state.dailyCommissionDone,
    dailyCommissionClaimed: state.dailyCommissionClaimed,
    dailyTrackHarvest: state.dailyTrackHarvest,
    dailyTrackWater: state.dailyTrackWater,
    dailyTrackSell: state.dailyTrackSell,
    dailyTrackFeedFish: state.dailyTrackFeedFish,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      state.plots = defaultPlots();
      state.insectSlots = defaultInsectSlots();
      state.mushroomPlots = defaultMushroomPlots();
      state.nextRainAt = Date.now() + RAIN_INTERVAL_MS;
      state.savedAt = Date.now();
      state.activeTab = 'garden';
      state.tutorialComplete = false;
      state.tutorialStep = 'welcome';
      return;
    }
    const d = JSON.parse(raw);
    const hadSavedAt = Number.isFinite(d.savedAt) && d.savedAt > 0;
    state.coins = Math.max(0, d.coins ?? 50);
    state.dew = Math.max(0, d.dew ?? 0);
    state.harvestTotal = Math.max(0, d.harvestTotal ?? 0);
    state.pondUnlocked = !!d.pondUnlocked || state.coins >= POND_UNLOCK_COINS;
    state.selectedSeed = PLANTS[d.selectedSeed] ? d.selectedSeed : 'flower';
    state.fishIdSeq = d.fishIdSeq ?? 1;
    state.fish = Array.isArray(d.fish)
      ? d.fish.filter(f => FISH_TYPES[f.species]).map(normalizeFish)
      : [];
    if (Array.isArray(d.insectSlots) && d.insectSlots.length) {
      const slots = d.insectSlots.map(normalizeInsectSlot);
      while (slots.length < INSECT_SLOT_COUNT) {
        slots.push({ habitat: null, insect: null, hunger: 0 });
      }
      state.insectSlots = slots.slice(0, INSECT_SLOT_COUNT);
    } else {
      state.insectSlots = defaultInsectSlots();
    }
    if (!state.insectSlots.some(s => s.habitat)) {
      FREE_BRANCH_INDICES.forEach(i => {
        state.insectSlots[i].habitat = 'leaf';
      });
    }
    state.selectedHabitat = HABITAT_TYPES[d.selectedHabitat] ? d.selectedHabitat : 'leaf';
    state.selectedInsect = INSECT_TYPES[d.selectedInsect] ? d.selectedInsect : 'ladybug';
    state.dewPoolLevel = Math.min(3, Math.max(0, d.dewPoolLevel | 0));
    state.dewTotalEarned = Math.max(0, d.dewTotalEarned ?? state.dew);
    state.dewPoolUnlocked = !!d.dewPoolUnlocked || state.dewTotalEarned >= DEW_POOL_UNLOCK_TOTAL;
    state.lastDewCondense = d.lastDewCondense || Date.now();
    state.shopUnlocked = !!d.shopUnlocked || state.harvestTotal >= SHOP_UNLOCK_HARVESTS;
    state.shopStock = {
      flower: Math.max(0, d.shopStock?.flower ?? 0),
      tree: Math.max(0, d.shopStock?.tree ?? 0),
    };
    state.shopSoldTotal = Math.max(0, d.shopSoldTotal ?? 0);
    state.shopVisitor = d.shopVisitor && SHOP_ORDERS[d.shopVisitor.type]
      ? {
        type: d.shopVisitor.type,
        guest: SHOP_GUEST_TYPES.includes(d.shopVisitor.guest) ? d.shopVisitor.guest : 'cat',
        at: d.shopVisitor.at || Date.now(),
      }
      : null;
    state.lastShopVisitorAt = d.lastShopVisitorAt || 0;
    mergeSeedLibrary(d.unlockedSeeds);
    state.bugcatchUnlocked = !!d.bugcatchUnlocked || countInsectsFromSlots(state.insectSlots) >= BUGCATCH_UNLOCK_INSECTS;
    state.bugcatchBest = Math.max(0, d.bugcatchBest ?? 0);
    state.seedshopUnlocked = !!d.seedshopUnlocked || state.shopSoldTotal >= SEEDSHOP_UNLOCK_SOLD;
    state.birdUnlocked = !!d.birdUnlocked || state.harvestTotal >= BIRD_UNLOCK_HARVESTS;
    state.birdFoodUntil = d.birdFoodUntil || 0;
    state.birdGift = d.birdGift && (d.birdGift.coins || d.birdGift.seed) ? d.birdGift : null;
    state.lastBirdAt = d.lastBirdAt || 0;
    state.rainUnlocked = !!d.rainUnlocked || state.dewPoolUnlocked;
    state.rainShelterLevel = Math.min(RAIN_SHELTER_MAX_LEVEL, Math.max(0, d.rainShelterLevel | 0));
    state.lastRainWaterAt = d.lastRainWaterAt || 0;
    state.raining = !!d.raining && (d.rainUntil || 0) > Date.now();
    state.rainUntil = d.rainUntil || 0;
    state.nextRainAt = d.nextRainAt || Date.now() + RAIN_INTERVAL_MS;
    state.fruitshopUnlocked = !!d.fruitshopUnlocked || (d.fruitPickTotal ?? 0) >= FRUITSHOP_UNLOCK_PICKS;
    state.fruitInventory = d.fruitInventory && typeof d.fruitInventory === 'object' ? d.fruitInventory : {};
    state.fruitPickTotal = Math.max(0, d.fruitPickTotal ?? 0);
    state.fruitSoldTotal = Math.max(0, d.fruitSoldTotal ?? 0);
    getFruitKeys().forEach(k => {
      state.fruitInventory[k] = Math.max(0, state.fruitInventory[k] | 0);
    });
    state.activeTab = VALID_TABS.includes(d.activeTab) ? d.activeTab : 'garden';
    state.savedAt = hadSavedAt ? d.savedAt : Date.now();
    state.tutorialComplete = !!d.tutorialComplete || state.harvestTotal > 0;
    state.tutorialStep = state.tutorialComplete ? 'done' : (d.tutorialStep || 'welcome');
    state.compostUnlocked = !!d.compostUnlocked || state.shopUnlocked;
    state.compostPoints = Math.min(COMPOST_MAX, Math.max(0, d.compostPoints ?? 0));
    state.compostTotal = Math.max(0, d.compostTotal ?? 0);
    state.mushroomUnlocked = !!d.mushroomUnlocked
      || (state.dewPoolUnlocked && state.dewTotalEarned >= MUSHROOM_UNLOCK_DEW);
    state.selectedMushroom = MUSHROOM_TYPES[d.selectedMushroom] ? d.selectedMushroom : 'oyster';
    if (Array.isArray(d.mushroomPlots) && d.mushroomPlots.length) {
      const plots = d.mushroomPlots.map(normalizeMushroomPlot);
      while (plots.length < MUSHROOM_PLOT_COUNT) plots.push({ type: null, stage: 0, wet: false, waterAt: 0 });
      state.mushroomPlots = plots.slice(0, MUSHROOM_PLOT_COUNT);
    } else {
      state.mushroomPlots = defaultMushroomPlots();
    }
    state.wellUnlocked = !!d.wellUnlocked || state.pondUnlocked;
    state.wellLevel = Math.min(2, Math.max(0, d.wellLevel | 0));
    state.wellDrawTotal = Math.max(0, d.wellDrawTotal ?? 0);
    state.manorLevel = Math.min(MANOR_MAX_LEVEL, Math.max(0, d.manorLevel | 0));
    state.manorDecorPlacements = Array.isArray(d.manorDecorPlacements)
      ? d.manorDecorPlacements
        .filter(p => p && MANOR_DECOR_ITEMS.some(i => i.id === p.decorId))
        .map(p => ({
          uid: p.uid || Math.random().toString(36).slice(2, 9),
          decorId: p.decorId,
          x: Math.max(16, Math.min(384, Number(p.x) || 200)),
          y: Math.max(36, Math.min(300, Number(p.y) || 240)),
        }))
        .slice(0, MANOR_DECOR_MAX)
      : [];
    state.manorReturnTab = VALID_TABS.includes(d.manorReturnTab) ? d.manorReturnTab : 'garden';
    state.layoutMode = !!d.layoutMode;
    state.dailyCommissionDay = d.dailyCommissionDay || '';
    state.dailyCommissionId = d.dailyCommissionId || '';
    state.dailyCommissionProgress = d.dailyCommissionProgress | 0;
    state.dailyCommissionDone = !!d.dailyCommissionDone;
    state.dailyCommissionClaimed = !!d.dailyCommissionClaimed;
    state.dailyTrackHarvest = d.dailyTrackHarvest | 0;
    state.dailyTrackWater = d.dailyTrackWater | 0;
    state.dailyTrackSell = d.dailyTrackSell | 0;
    state.dailyTrackFeedFish = d.dailyTrackFeedFish | 0;
    ensureDailyCommissionDay();
    if (!PLANTS[state.selectedSeed]) state.selectedSeed = 'flower';
    if (Array.isArray(d.plots) && d.plots.length === PLOT_COUNT) {
      state.plots = d.plots.map(normalizePlot);
    } else {
      state.plots = defaultPlots();
    }
    if (hadSavedAt) {
      const elapsedMs = Math.max(0, Date.now() - state.savedAt);
      if (elapsedMs >= OFFLINE_MIN_MS) {
        const before = takeOfflineSnapshot();
        const changed = catchUpOfflineProgress();
        pendingOfflineReport = buildOfflineReport(before, takeOfflineSnapshot(), elapsedMs);
        if (changed) save();
      } else if (catchUpOfflineProgress()) {
        save();
      }
    }
    repairGardenIfBroken();
    ensurePlots();
    ensureMushroomPlots();
    ensureUnlockedSeeds();
  } catch (err) {
    console.warn('[花鱼小院] 读档失败，尝试恢复种子库等数据', err);
    salvageSaveFromStorage();
    state.plots = defaultPlots();
    state.insectSlots = defaultInsectSlots();
    state.mushroomPlots = defaultMushroomPlots();
    state.nextRainAt = Date.now() + RAIN_INTERVAL_MS;
    state.savedAt = Date.now();
    state.activeTab = 'garden';
    state.tutorialComplete = false;
    state.tutorialStep = 'welcome';
  }
}

function save() {
  try {
    writeSeedBackup();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buildSaveData()));
  } catch (err) {
    console.warn('[花鱼小院] 存档失败', err);
    try { writeSeedBackup(); } catch {}
  }
}

function setupAutoSave() {
  const flush = () => save();
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    if (syncAllGardenGrowth(false)) save();
    refreshDewActions();
    GameAudio.resumeAll();
    if (document.getElementById('panel-garden')?.classList.contains('open')) renderGarden(true);
    else if (document.getElementById('panel-dew')?.classList.contains('open')) renderDewPool();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  autoSaveTimer = setInterval(flush, AUTO_SAVE_MS);
}

function syncTabHighlight(tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
  document.getElementById('topbar-manor-btn')?.classList.toggle('active', tabId === 'manor');
  const manorOn = tabId === 'manor';
  document.getElementById('app')?.classList.toggle('manor-mode', manorOn);
  document.body?.classList.toggle('manor-mode', manorOn);
  const floatLayer = document.getElementById('manor-float-layer');
  if (floatLayer) {
    floatLayer.hidden = !manorOn;
    floatLayer.setAttribute('aria-hidden', manorOn ? 'false' : 'true');
  }
  if (manorOn) {
    setManorDockOpen(false);
    setManorCardOpen(false);
  } else {
    setManorCardOpen(false);
  }
  refreshManorDock();
}

function exitManor() {
  cancelManorPlacePending(true);
  switchTab(state.manorReturnTab || 'garden');
}

function renderManorButtonPreview() {
  const el = document.getElementById('topbar-manor-preview');
  if (el && typeof GardenArt !== 'undefined') {
    el.innerHTML = GardenArt.manorButtonPreview(state.manorLevel);
  }
}

function canAccessTab(tabId) {
  if (tabId === 'pond' && !state.pondUnlocked) return false;
  if (tabId === 'dew' && !state.dewPoolUnlocked) return false;
  if (tabId === 'shop' && !state.shopUnlocked) return false;
  if (tabId === 'bugcatch' && !state.bugcatchUnlocked) return false;
  if (tabId === 'seedshop' && !state.seedshopUnlocked) return false;
  if (tabId === 'bird' && !state.birdUnlocked) return false;
  if (tabId === 'rain' && !state.rainUnlocked) return false;
  if (tabId === 'fruitshop' && !state.fruitshopUnlocked) return false;
  if (tabId === 'compost' && !state.compostUnlocked) return false;
  if (tabId === 'mushroom' && !state.mushroomUnlocked) return false;
  if (tabId === 'well' && !state.wellUnlocked) return false;
  return VALID_TABS.includes(tabId);
}

function restoreActiveTab() {
  let tab = canAccessTab(state.activeTab) ? state.activeTab : 'garden';
  if (tab === 'manor') {
    tab = state.manorReturnTab && state.manorReturnTab !== 'manor' ? state.manorReturnTab : 'garden';
  }
  state.activeTab = tab;
  syncTabHighlight(tab);
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('open'));
  document.getElementById(`panel-${tab}`)?.classList.add('open');
  if (tab === 'garden') renderGarden();
  if (tab === 'pond') renderPond();
  if (tab === 'insect') renderInsect();
  if (tab === 'dew') renderDewPool();
  if (tab === 'shop') renderShop();
  if (tab === 'bugcatch') renderBugcatch();
  if (tab === 'seedshop') renderSeedshop();
  if (tab === 'bird') renderBird();
  if (tab === 'rain') renderRain();
  if (tab === 'fruitshop') renderFruitshop();
  if (tab === 'compost') renderCompost();
  if (tab === 'mushroom') renderMushroom();
  if (tab === 'well') renderWell();
  if (tab === 'manor') renderManor();
}

function catchUpRain(now) {
  if (!state.rainUnlocked) return false;
  let changed = false;
  let guard = 0;
  while (guard++ < 500) {
    if (state.raining) {
      if (now >= state.rainUntil) {
        state.raining = false;
        state.nextRainAt = state.rainUntil + RAIN_INTERVAL_MS;
        if (onRainEnd(true)) changed = true;
        changed = true;
        continue;
      }
      if (tickRainWaterDuringStorm(now)) changed = true;
      break;
    }
    if (now >= state.nextRainAt) {
      const rainStart = state.nextRainAt;
      state.raining = true;
      state.rainUntil = rainStart + RAIN_DURATION_MS;
      if (onRainStart(rainStart)) changed = true;
      if (now >= state.rainUntil) {
        state.raining = false;
        state.nextRainAt = state.rainUntil + RAIN_INTERVAL_MS;
        if (onRainEnd(true)) changed = true;
        changed = true;
        continue;
      }
      changed = true;
      break;
    }
    break;
  }
  return changed;
}

function catchUpDewCondense(now) {
  if (!state.dewPoolUnlocked || state.dewPoolLevel <= 0) return false;
  const perGain = DEW_CONDENSE_PER_LEVEL[state.dewPoolLevel] || 1;
  let changed = false;
  while (now - state.lastDewCondense >= DEW_CONDENSE_MS) {
    state.dew += perGain;
    state.lastDewCondense += DEW_CONDENSE_MS;
    changed = true;
  }
  return changed;
}

function catchUpFishHunger(elapsedMs) {
  if (!state.pondUnlocked || !state.fish.length || elapsedMs <= 0) return false;
  const ticks = Math.floor(elapsedMs / HUNGER_TICK_MS);
  if (ticks <= 0) return false;
  state.fish.forEach(f => {
    f.hunger = Math.max(0, Math.round(Number(f.hunger) || 0) - ticks * HUNGER_DECAY);
  });
  return true;
}

function catchUpInsectHunger(elapsedMs) {
  if (!countInsectsFromSlots(state.insectSlots) || elapsedMs <= 0) return false;
  const ticks = Math.floor(elapsedMs / INSECT_HUNGER_TICK_MS);
  if (ticks <= 0) return false;
  state.insectSlots.forEach(s => {
    if (!s.insect) return;
    s.hunger = Math.max(0, Math.round(Number(s.hunger) || 0) - ticks * INSECT_HUNGER_DECAY);
  });
  return true;
}

function spawnShopVisitorAt(at) {
  const type = pickShopOrderType();
  state.shopVisitor = {
    type,
    guest: SHOP_GUEST_TYPES[Math.floor(Math.random() * SHOP_GUEST_TYPES.length)],
    at,
  };
  state.lastShopVisitorAt = at;
}

function catchUpShopVisitors(now) {
  if (!state.shopUnlocked) return false;
  let changed = false;
  let guard = 0;
  while (guard++ < 100) {
    if (state.shopVisitor) {
      if (now - state.shopVisitor.at >= SHOP_VISITOR_WAIT_MS) {
        state.shopVisitor = null;
        state.lastShopVisitorAt = now;
        changed = true;
        continue;
      }
      break;
    }
    const last = state.lastShopVisitorAt || 0;
    if (now - last >= SHOP_VISITOR_INTERVAL_MS) {
      spawnShopVisitorAt(now);
      changed = true;
      if (now - state.shopVisitor.at >= SHOP_VISITOR_WAIT_MS) {
        state.shopVisitor = null;
        state.lastShopVisitorAt = now;
        continue;
      }
      break;
    }
    break;
  }
  return changed;
}

function catchUpBirds(now) {
  if (!state.birdUnlocked) return false;
  let changed = false;
  if (state.birdFoodUntil > 0 && state.birdFoodUntil <= now) {
    state.birdFoodUntil = 0;
    changed = true;
  }
  if (!state.birdGift && state.birdFoodUntil > now) {
    if (now - (state.lastBirdAt || 0) >= BIRD_GIFT_WAIT_MS) {
      const roll = Math.random();
      if (roll < 0.55) {
        state.birdGift = { coins: 8 + Math.floor(Math.random() * 10) };
      } else {
        const seeds = getAvailableSeeds();
        state.birdGift = { seed: seeds[Math.floor(Math.random() * seeds.length)] };
      }
      state.lastBirdAt = now;
      changed = true;
    }
  }
  return changed;
}

function catchUpOfflineProgress() {
  const now = Date.now();
  const savedAt = state.savedAt || now;
  const elapsedMs = Math.max(0, now - savedAt);
  if (elapsedMs < 2000) return false;

  let changed = false;
  if (catchUpRain(now)) changed = true;
  while (tickGardenGrowth(false)) changed = true;
  if (catchUpDewCondense(now)) changed = true;
  if (catchUpFishHunger(elapsedMs)) changed = true;
  if (catchUpInsectHunger(elapsedMs)) changed = true;
  if (catchUpShopVisitors(now)) changed = true;
  if (catchUpBirds(now)) changed = true;
  return changed;
}

function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

function plotSvg(plot) {
  if (typeof GardenArt === 'undefined') return '';
  return GardenArt.plotSvg(plot);
}

function plotLabel(plot) {
  if (!plot.plant || plot.stage <= 0) return '';
  if (plot.stage >= 3 && plantHasFruit(plot.plant)) return '采果实';
  if (plot.stage >= 3) return '收获';
  const def = PLANTS[plot.plant];
  const grow = def.growMs / getEcoGrowMultiplier();
  const left = Math.max(0, grow - (Date.now() - (plot.waterAt || 0)));
  const sec = Math.ceil(left / 1000);
  if (def.autoGrow) {
    return sec > 0 ? `自生长 ${sec}s` : '自生长中';
  }
  if (!plot.wet) return '浇水';
  return sec > 0 ? `生长 ${sec}s` : '生长中';
}

function plantAutoGrow(plantType) {
  return !!PLANTS[plantType]?.autoGrow;
}

function initPlotPlant(plot, plantType) {
  plot.plant = plantType;
  plot.stage = 1;
  plot.fruitReady = false;
  plot.fruitRegrowAt = 0;
  if (plantAutoGrow(plantType)) {
    plot.wet = true;
    plot.waterAt = Date.now();
  } else {
    plot.wet = false;
    plot.waterAt = 0;
  }
}

function manorLevelName(level = state.manorLevel) {
  return MANOR_LEVEL_NAMES[Math.min(MANOR_MAX_LEVEL, Math.max(0, level | 0))] || MANOR_LEVEL_NAMES[0];
}

function manorUpgradeCost() {
  if (state.manorLevel >= MANOR_MAX_LEVEL) return null;
  return MANOR_UPGRADE_COSTS[state.manorLevel] || null;
}

function getManorHarvestBonus() {
  return state.manorLevel * 0.05;
}

function applyHarvestCoins(baseCoin) {
  return Math.max(0, Math.floor(baseCoin * (1 + getManorHarvestBonus())));
}

function countManorAreasUnlocked() {
  return MANOR_AREAS.filter(a => !a.need || a.need()).length;
}

function getManorUnlockFlags() {
  const flags = {};
  MANOR_AREAS.forEach(a => {
    flags[a.id] = !a.need || a.need();
  });
  return flags;
}

function refreshManorUpgradeTip() {
  const btn = document.getElementById('manor-upgrade-tip');
  const title = document.getElementById('manor-upgrade-tip-title');
  const text = document.getElementById('manor-upgrade-tip-text');
  if (!btn || !title || !text) return;
  const cost = manorUpgradeCost();
  const bonus = Math.round(getManorHarvestBonus() * 100);
  title.textContent = `${manorLevelName()} · 收获+${bonus}%`;
  if (cost == null) {
    btn.disabled = true;
    text.textContent = '已满级 · 庄园最大';
    return;
  }
  btn.disabled = false;
  const next = manorLevelName(state.manorLevel + 1);
  const nextBonus = Math.round((state.manorLevel + 1) * 5);
  if (state.coins >= cost) {
    text.textContent = `点我升级 → ${next} · ${cost} 金 · 收获+${nextBonus}%`;
  } else {
    const left = cost - state.coins;
    text.textContent = `升级要 ${cost} 金 · 还差 ${left} · →${next}`;
  }
}

function upgradeManor() {
  const cost = manorUpgradeCost();
  if (cost == null) {
    showToast('庄园已是最高等级');
    return;
  }
  if (state.coins < cost) {
    showToast(`修缮庄园要 ${cost} 金币`);
    return;
  }
  state.coins -= cost;
  state.manorLevel += 1;
  save();
  GameAudio.play('unlock');
  showToast(`庄园升为「${manorLevelName()}」· 收获金币 +${Math.round(getManorHarvestBonus() * 100)}%`);
  renderManor();
  refreshManorDock();
  refreshWallet();
  refreshManorUpgradeTip();
}

let manorDecorFilter = 'all';
let manorPlacePending = null;

function cancelManorPlacePending(refundIfUnplaced = false) {
  if (manorPlacePending && refundIfUnplaced) {
    state.coins += manorPlacePending.item.cost;
    save();
    refreshWallet();
    showToast('已取消摆放 · 金币已退回');
  }
  manorPlacePending = null;
  document.getElementById('manor-scene-wrap')?.classList.remove('manor-placing');
}

function startManorDecorate() {
  cancelManorPlacePending(true);
  openManorDecoratePanel();
}

function manorScenePointerToSvg(ev) {
  const svg = document.getElementById('manor-scene')?.querySelector('svg');
  if (!svg || typeof svg.createSVGPoint !== 'function') return null;
  const pt = svg.createSVGPoint();
  pt.x = ev.clientX;
  pt.y = ev.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const sp = pt.matrixTransform(ctm.inverse());
  return {
    x: Math.max(16, Math.min(384, sp.x)),
    y: Math.max(36, Math.min(300, sp.y)),
  };
}

function renderManorDecorOnScene() {
  const svg = document.getElementById('manor-scene')?.querySelector('svg');
  if (!svg) return;
  svg.querySelectorAll('.manor-user-decor').forEach(n => n.remove());
  state.manorDecorPlacements.forEach(p => {
    const item = MANOR_DECOR_ITEMS.find(i => i.id === p.decorId);
    if (!item) return;
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', String(p.x));
    t.setAttribute('y', String(p.y));
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('dominant-baseline', 'middle');
    t.setAttribute('font-size', '22');
    t.setAttribute('class', 'manor-user-decor');
    t.textContent = item.emoji;
    svg.appendChild(t);
  });
}

function openManorDecoratePanel() {
  const overlay = document.getElementById('manor-decorate-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  overlay.removeAttribute('hidden');
  overlay.setAttribute('aria-hidden', 'false');
  setManorCardOpen(false);
  renderManorDecoratePanel();
}

function closeManorDecoratePanel() {
  const overlay = document.getElementById('manor-decorate-overlay');
  if (!overlay) return;
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('hidden', '');
}

function renderManorDecoratePanel() {
  const tabs = document.getElementById('manor-decorate-tabs');
  const grid = document.getElementById('manor-decorate-grid');
  if (!tabs || !grid) return;
  tabs.innerHTML = MANOR_DECOR_CATEGORIES.map(c =>
    `<button type="button" class="manor-decorate-tab${manorDecorFilter === c.id ? ' active' : ''}" data-decor-cat="${c.id}">${c.label}</button>`
  ).join('');
  const items = manorDecorFilter === 'all'
    ? MANOR_DECOR_ITEMS
    : MANOR_DECOR_ITEMS.filter(i => i.cat === manorDecorFilter);
  grid.innerHTML = items.map(item => {
    const needLv = item.minLevel || 0;
    const locked = state.manorLevel < needLv;
    const placed = state.manorDecorPlacements.filter(p => p.decorId === item.id).length;
    const afford = state.coins >= item.cost;
    return `<button type="button" class="manor-decorate-item${locked ? ' locked' : ''}${!locked && !afford ? ' cant-afford' : ''}" data-decor-id="${item.id}">
      <span class="manor-decorate-item-icon" aria-hidden="true">${item.emoji}</span>
      <span class="manor-decorate-item-name">${item.label}</span>
      <span class="manor-decorate-item-cost">${locked ? `庄园 Lv.${needLv}` : `${item.cost} 金币${placed ? ` · 已摆${placed}` : ''}`}</span>
    </button>`;
  }).join('');
}

function pickManorDecorItem(id) {
  const item = MANOR_DECOR_ITEMS.find(i => i.id === id);
  if (!item) return;
  const needLv = item.minLevel || 0;
  if (state.manorLevel < needLv) {
    showToast(`庄园升到「${manorLevelName(needLv)}」后解锁`);
    return;
  }
  if (state.manorDecorPlacements.length >= MANOR_DECOR_MAX) {
    showToast(`最多摆 ${MANOR_DECOR_MAX} 件，先换一批再试`);
    return;
  }
  if (state.coins < item.cost) {
    showToast(`要 ${item.cost} 金币 · 还差 ${item.cost - state.coins}`);
    return;
  }
  state.coins -= item.cost;
  save();
  refreshWallet();
  manorPlacePending = { decorId: id, item };
  closeManorDecoratePanel();
  document.getElementById('manor-scene-wrap')?.classList.add('manor-placing');
  showToast(`已买「${item.label}」· 点庄园画面摆放`);
}

function placeManorDecorAt(ev) {
  if (!manorPlacePending || state.activeTab !== 'manor') return;
  const pt = manorScenePointerToSvg(ev);
  if (!pt) return;
  state.manorDecorPlacements.push({
    uid: Math.random().toString(36).slice(2, 9),
    decorId: manorPlacePending.decorId,
    x: pt.x,
    y: pt.y,
  });
  const label = manorPlacePending.item.label;
  manorPlacePending = null;
  document.getElementById('manor-scene-wrap')?.classList.remove('manor-placing');
  save();
  GameAudio.play('unlock');
  showToast(`「${label}」摆好了`);
  renderManor();
}

function renderManor() {
  const scene = document.getElementById('manor-scene');
  if (scene && typeof GardenArt !== 'undefined') {
    scene.innerHTML = GardenArt.manorScene(getManorUnlockFlags(), state.manorLevel);
    renderManorDecorOnScene();
  }
  renderManorButtonPreview();
  const title = document.getElementById('manor-title');
  if (title) title.textContent = manorLevelName();
  const summary = document.getElementById('manor-summary');
  if (summary) {
    summary.textContent = `已点亮 ${countManorAreasUnlocked()}/${MANOR_AREAS.length} 处 · 庄园收获加成 +${Math.round(getManorHarvestBonus() * 100)}%`;
  }
  refreshWallet();
  refreshManorDock();
  refreshManorUpgradeTip();
}

function refreshManorDock() {
  const chips = document.getElementById('manor-dock-chips');
  const mapBtn = document.getElementById('manor-dock-map-btn');
  const summary = document.getElementById('manor-dock-summary');
  const toggle = document.getElementById('manor-dock-toggle');
  const toggleLabel = document.getElementById('manor-dock-toggle-label');
  const toggleIcon = toggle?.querySelector('.manor-dock-toggle-icon');
  if (summary) {
    summary.textContent = `${countManorAreasUnlocked()}/${MANOR_AREAS.length} 处`;
  }
  const inManor = state.activeTab === 'manor';
  toggle?.classList.toggle('active', inManor);
  mapBtn?.classList.toggle('active', inManor);
  if (toggleLabel) toggleLabel.textContent = inManor ? manorLevelName().slice(0, 2) : '庄园';
  if (toggleIcon) toggleIcon.textContent = inManor ? '🏡' : '🗺';
  toggle?.setAttribute('title', inManor ? '展开庄园详情' : '庄园快捷');
  toggle?.setAttribute('aria-controls', inManor ? 'manor-ui-card' : 'manor-dock');
  if (!chips) return;
  chips.innerHTML = MANOR_AREAS.map(area => {
    const open = !area.need || area.need();
    const active = state.activeTab === area.id;
    let label = area.label;
    if (area.id === 'seedshop' && !state.seedshopUnlocked && state.shopUnlocked) {
      label = `种子铺 ${state.shopSoldTotal}/${SEEDSHOP_UNLOCK_SOLD}`;
    }
    const pulse = area.id === 'seedshop' && state.shopUnlocked && !state.seedshopUnlocked;
    return `<button type="button" class="manor-dock-chip${open ? '' : ' locked'}${active ? ' active' : ''}${pulse ? ' tab-goal-pulse' : ''}" data-manor-dock="${area.id}">${label}</button>`;
  }).join('');
}

function setManorCardOpen(open) {
  const app = document.getElementById('app');
  const toggle = document.getElementById('manor-dock-toggle');
  if (!app || !app.classList.contains('manor-mode')) return;
  app.classList.toggle('manor-card-open', open);
  toggle?.classList.toggle('open', open);
  toggle?.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function setManorDockOpen(open) {
  const dock = document.getElementById('manor-dock');
  const toggle = document.getElementById('manor-dock-toggle');
  if (!dock || !toggle) return;
  if (state.activeTab === 'manor') return;
  dock.hidden = !open;
  dock.classList.toggle('open', open);
  toggle.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function toggleManorDock() {
  if (state.activeTab === 'manor') {
    const app = document.getElementById('app');
    setManorCardOpen(!app?.classList.contains('manor-card-open'));
    return;
  }
  const dock = document.getElementById('manor-dock');
  if (!dock) return;
  setManorDockOpen(dock.hidden);
}

function getEcoPollinationBonus() {
  const bugs = countInsectsFromSlots(state.insectSlots);
  return Math.min(0.25, bugs * 0.05);
}

function getCompostGrowBonus() {
  if (state.compostPoints >= 100) return 0.25;
  if (state.compostPoints >= 60) return 0.18;
  if (state.compostPoints >= 30) return 0.1;
  return 0;
}

function getEcoGrowMultiplier() {
  let mult = 1 + getEcoPollinationBonus() + getCompostGrowBonus();
  if (state.birdFoodUntil > Date.now()) mult += 0.05;
  if (state.fish.length >= 3 && state.pondUnlocked) mult += 0.05;
  return mult;
}

function getFishCareBonus() {
  if (!state.fish.length) return 0;
  const avg = state.fish.reduce((s, f) => s + (Number(f.hunger) || 0), 0) / state.fish.length;
  if (avg >= 70) return 0.25;
  if (avg >= 45) return 0.12;
  return 0;
}

function compostLevelLabel() {
  if (state.compostPoints >= 100) return '熟肥';
  if (state.compostPoints >= 60) return '温肥';
  if (state.compostPoints >= 30) return '初肥';
  return '空堆';
}

function refreshEcoBanner() {
  const el = document.getElementById('eco-banner');
  if (!el) return;
  const parts = [];
  const poll = getEcoPollinationBonus();
  if (poll > 0) parts.push(`授粉+${Math.round(poll * 100)}%`);
  const comp = getCompostGrowBonus();
  if (comp > 0) parts.push(`堆肥+${Math.round(comp * 100)}%`);
  if (state.birdFoodUntil > Date.now()) parts.push('鸟访+5%');
  if (state.fish.length >= 3) parts.push('鱼池+5%');
  const fishCare = getFishCareBonus();
  if (fishCare > 0) parts.push(`鱼饱-${Math.round(fishCare * 100)}%饿`);
  el.textContent = parts.length
    ? `🌿 生态联动：${parts.join(' · ')}`
    : '🌿 生态：养虫授粉 · 堆肥加速 · 喂饱鱼减饿 · 撒鸟食加成';
}

function tryUnlockCompost() {
  if (state.compostUnlocked) return;
  if (state.shopUnlocked) {
    state.compostUnlocked = true;
    save();
    showToast('堆肥角解锁！卖剩的花材可以堆肥');
    refreshCompostTab();
  }
}

function tryUnlockMushroom() {
  if (state.mushroomUnlocked) return;
  if (state.dewPoolUnlocked && state.dewTotalEarned >= MUSHROOM_UNLOCK_DEW) {
    state.mushroomUnlocked = true;
    save();
    showToast('蘑菇角解锁！阴凉角种蘑菇');
    refreshMushroomTab();
  }
}

function tryUnlockWell() {
  if (state.wellUnlocked) return;
  if (state.pondUnlocked) {
    state.wellUnlocked = true;
    save();
    showToast('小井解锁！可以打水浇花园');
    refreshWellTab();
  }
}

function refreshCompostTab() {
  const tab = document.getElementById('tab-compost');
  if (!tab) return;
  tab.disabled = !state.compostUnlocked;
  tab.title = state.compostUnlocked ? '堆肥角' : '花房开张后解锁';
}

function refreshMushroomTab() {
  const tab = document.getElementById('tab-mushroom');
  if (!tab) return;
  tab.disabled = !state.mushroomUnlocked;
  tab.title = state.mushroomUnlocked ? '蘑菇角' : `累计 ${MUSHROOM_UNLOCK_DEW} 露水解锁`;
}

function refreshWellTab() {
  const tab = document.getElementById('tab-well');
  if (!tab) return;
  tab.disabled = !state.wellUnlocked;
  tab.title = state.wellUnlocked ? '小井' : '鱼池解锁后可用';
}

function addCompostStock(kind) {
  if (!state.compostUnlocked) {
    showToast('花房开张后才用得了堆肥角');
    return;
  }
  const key = kind === 'tree' ? 'tree' : 'flower';
  if ((state.shopStock[key] || 0) <= 0) {
    showToast(`没有${key === 'tree' ? '小树' : '小花'}库存了`);
    return;
  }
  state.shopStock[key] -= 1;
  const gain = key === 'tree' ? COMPOST_TREE_GAIN : COMPOST_FLOWER_GAIN;
  state.compostPoints = Math.min(COMPOST_MAX, state.compostPoints + gain);
  state.compostTotal += 1;
  save();
  GameAudio.play('plant');
  showToast(`堆肥+${gain} · ${compostLevelLabel()} ${state.compostPoints}/${COMPOST_MAX}`);
  renderCompost();
  refreshEcoBanner();
  if (document.getElementById('panel-shop')?.classList.contains('open')) renderShop();
}

function renderCompost() {
  const scene = document.getElementById('compost-scene');
  if (scene && typeof GardenArt !== 'undefined') scene.innerHTML = GardenArt.compostScene(state.compostPoints);
  const meter = document.getElementById('compost-meter-fill');
  const label = document.getElementById('compost-meter-label');
  if (meter) meter.style.width = `${state.compostPoints}%`;
  if (label) {
    label.textContent = `${compostLevelLabel()} ${state.compostPoints}/${COMPOST_MAX} · 累计 ${state.compostTotal} 次`;
  }
  const flowerBtn = document.getElementById('compost-flower-btn');
  const treeBtn = document.getElementById('compost-tree-btn');
  if (flowerBtn) {
    flowerBtn.disabled = (state.shopStock.flower || 0) <= 0;
    flowerBtn.textContent = `堆小花库存 · +${COMPOST_FLOWER_GAIN}（剩 ${state.shopStock.flower || 0}）`;
  }
  if (treeBtn) {
    treeBtn.disabled = (state.shopStock.tree || 0) <= 0;
    treeBtn.textContent = `堆小树库存 · +${COMPOST_TREE_GAIN}（剩 ${state.shopStock.tree || 0}）`;
  }
  refreshEcoBanner();
  refreshWallet();
}

function tickMushroomGrowth(persist = true) {
  ensureMushroomPlots();
  let changed = false;
  const mult = getEcoGrowMultiplier();
  state.mushroomPlots.forEach(plot => {
    if (!plot.type || plot.stage <= 0 || plot.stage >= 3) return;
    if (!plot.wet || !plot.waterAt) return;
    const grow = MUSHROOM_TYPES[plot.type].growMs / mult;
    if (Date.now() - plot.waterAt < grow) return;
    plot.stage += 1;
    if (plot.stage < 3) {
      plot.wet = false;
      plot.waterAt = 0;
    } else {
      plot.wet = true;
    }
    changed = true;
  });
  if (changed && persist) save();
  return changed;
}

function mushroomPlotLabel(plot) {
  if (!plot.type || plot.stage <= 0) return '';
  const def = MUSHROOM_TYPES[plot.type];
  if (plot.stage >= 3) return '收蘑菇';
  if (!plot.wet) return '浇水';
  const left = Math.max(0, Math.ceil((def.growMs / getEcoGrowMultiplier() - (Date.now() - plot.waterAt)) / 1000));
  return left > 0 ? `生长 ${left}s` : '生长中';
}

function onMushroomPlotClick(idx) {
  tickMushroomGrowth(false);
  const plot = state.mushroomPlots[idx];
  if (!plot) return;
  if (!plot.type || plot.stage <= 0) {
    const kind = state.selectedMushroom;
    const def = MUSHROOM_TYPES[kind];
    if (state.coins < def.sporeCost) {
      showToast(`种${def.label}要 ${def.sporeCost} 金币`);
      return;
    }
    state.coins -= def.sporeCost;
    plot.type = kind;
    plot.stage = 1;
    plot.wet = false;
    plot.waterAt = 0;
    save();
    GameAudio.play('plant');
    showToast(`种下${def.label} · 记得浇水`);
    renderMushroom();
    return;
  }
  if (plot.stage >= 3) {
    const def = MUSHROOM_TYPES[plot.type];
    const gained = applyHarvestCoins(def.coin);
    state.coins += gained;
    state.harvestTotal += 1;
    plot.type = null;
    plot.stage = 0;
    plot.wet = false;
    plot.waterAt = 0;
    save();
    GameAudio.play('harvest');
    showToast(`收${def.label} · +${gained} 金币`);
    renderMushroom();
    refreshWallet();
    return;
  }
  if (!plot.wet) {
    plot.wet = true;
    plot.waterAt = Date.now();
    save();
    GameAudio.play('water');
    showToast('浇水成功');
    renderMushroom();
  }
}

function renderMushroom() {
  ensureMushroomPlots();
  tickMushroomGrowth(false);
  const scene = document.getElementById('mushroom-scene');
  if (scene && typeof GardenArt !== 'undefined') scene.innerHTML = GardenArt.mushroomScene();
  document.querySelectorAll('.mushroom-pick').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.mushroom === state.selectedMushroom);
  });
  const grid = document.getElementById('mushroom-grid');
  if (!grid) return;
  grid.innerHTML = '';
  state.mushroomPlots.forEach((plot, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'plot mushroom-plot';
    if (!plot.type || plot.stage <= 0) btn.classList.add('plot-empty');
    if (plot.wet && plot.stage > 0 && plot.stage < 3) btn.classList.add('wet');
    if (plot.stage >= 3) btn.classList.add('ready');
    const art = typeof GardenArt !== 'undefined' ? GardenArt.mushroomPlotSvg(plot) : '';
    btn.innerHTML = `<span class="plot-art">${art}</span><span class="label">${mushroomPlotLabel(plot)}</span>`;
    btn.dataset.mushroomIdx = String(idx);
    btn.addEventListener('click', () => onMushroomPlotClick(idx));
    grid.appendChild(btn);
  });
  refreshEcoBanner();
  refreshWallet();
}

function wellDrawCost() {
  return WELL_DRAW_COSTS[Math.min(2, state.wellLevel | 0)] || 8;
}

function wellUpgradeCost() {
  if (state.wellLevel >= 2) return null;
  return WELL_UPGRADE_COSTS[state.wellLevel] || null;
}

function drawWellWater(useDew = false) {
  if (!state.wellUnlocked) return;
  const cost = useDew ? WELL_DEW_DRAW_COST : wellDrawCost();
  if (useDew) {
    if (state.dew < cost) {
      showToast(`打水要 ${cost} 露水`);
      return;
    }
    state.dew -= cost;
  } else if (state.coins < cost) {
    showToast(`打水要 ${cost} 金币`);
    return;
  } else {
    state.coins -= cost;
  }
  let watered = 0;
  state.plots.forEach(plot => {
    if (!plot.plant || plot.stage <= 0 || plot.stage >= 3) return;
    if (plantAutoGrow(plot.plant)) return;
    if (plot.wet) return;
    plot.wet = true;
    plot.waterAt = Date.now();
    watered += 1;
  });
  state.wellDrawTotal += 1;
  save();
  GameAudio.play('water');
  showToast(watered > 0 ? `小井打水 · 浇了 ${watered} 格` : '没有需要浇水的格子');
  renderWell();
  if (document.getElementById('panel-garden')?.classList.contains('open')) renderGarden();
  refreshWallet();
}

function upgradeWell() {
  const cost = wellUpgradeCost();
  if (cost == null) {
    showToast('小井已满级');
    return;
  }
  if (state.coins < cost) {
    showToast(`升级小井要 ${cost} 金币`);
    return;
  }
  state.coins -= cost;
  state.wellLevel += 1;
  save();
  GameAudio.play('unlock');
  showToast(`小井升到 Lv.${state.wellLevel + 1} · 打水更便宜`);
  renderWell();
}

function renderWell() {
  const scene = document.getElementById('well-scene');
  if (scene && typeof GardenArt !== 'undefined') scene.innerHTML = GardenArt.wellScene(state.wellLevel);
  const status = document.getElementById('well-status');
  if (status) {
    status.textContent = state.wellLevel >= 2
      ? `小井 Lv.3 · 打水 ${wellDrawCost()} 金币 或 ${WELL_DEW_DRAW_COST} 露水 · 累计 ${state.wellDrawTotal} 次`
      : `小井 Lv.${state.wellLevel + 1} · 打水 ${wellDrawCost()} 金币 · 累计 ${state.wellDrawTotal} 次`;
  }
  const drawBtn = document.getElementById('well-draw-btn');
  const dewBtn = document.getElementById('well-draw-dew-btn');
  const upBtn = document.getElementById('well-upgrade-btn');
  if (drawBtn) {
    drawBtn.disabled = state.coins < wellDrawCost();
    drawBtn.textContent = `打水浇花园 · ${wellDrawCost()} 金币`;
  }
  if (dewBtn) {
    dewBtn.disabled = state.dew < WELL_DEW_DRAW_COST;
    dewBtn.textContent = `灵露打水 · ${WELL_DEW_DRAW_COST} 露水`;
  }
  if (upBtn) {
    const cost = wellUpgradeCost();
    if (cost == null) {
      upBtn.disabled = true;
      upBtn.textContent = '小井已满级';
    } else {
      upBtn.disabled = state.coins < cost;
      upBtn.textContent = `升级小井 · ${cost} 金币`;
    }
  }
  refreshWallet();
}

function tickGardenGrowth(persist = true) {
  let changed = false;
  state.plots.forEach(plot => {
    if (!plot.plant || plot.stage <= 0 || plot.stage >= 3) return;
    const def = PLANTS[plot.plant];
    const auto = def.autoGrow;
    if (!auto && (!plot.wet || !plot.waterAt)) return;
    if (auto && !plot.waterAt) {
      plot.waterAt = Date.now();
      plot.wet = true;
    }
    const grow = def.growMs / getEcoGrowMultiplier();
    if (Date.now() - plot.waterAt < grow) return;
    plot.stage += 1;
    if (auto && plot.stage < 3) {
      plot.wet = true;
      plot.waterAt = Date.now();
    } else if (plot.stage < 3) {
      plot.wet = false;
      plot.waterAt = 0;
    } else if (plantHasFruit(plot.plant)) {
      plot.wet = false;
      plot.waterAt = 0;
    } else {
      plot.wet = true;
    }
    changed = true;
  });
  if (changed && persist) save();
  return changed;
}

function countInsectsFromSlots(slots) {
  return (slots || state.insectSlots).filter(s => s.insect).length;
}

function shopStockKey(plantType) {
  return PLANTS[plantType]?.stockKey || plantType;
}

function getAvailableSeeds() {
  return [...BASE_SEEDS, ...state.unlockedSeeds.filter(s => PLANTS[s] && !BASE_SEEDS.includes(s))];
}

function addShopStockFromHarvest(plantType, count = 1) {
  if (!PLANTS[plantType] || count <= 0) return;
  const key = shopStockKey(plantType);
  state.shopStock[key] = (state.shopStock[key] || 0) + count;
}

function tryUnlockShop() {
  if (state.shopUnlocked) return;
  if (state.harvestTotal >= SHOP_UNLOCK_HARVESTS) {
    state.shopUnlocked = true;
    state.lastShopVisitorAt = Date.now();
    save();
    showToast('花房开张啦！客人会来买花');
    refreshShopTab();
    refreshGardenStats();
    refreshSeedQuest();
  }
}

function refreshShopTab() {
  const tab = document.getElementById('tab-shop');
  if (!tab) return;
  tab.disabled = !state.shopUnlocked;
  tab.title = state.shopUnlocked ? '花房' : `累计收获 ${SHOP_UNLOCK_HARVESTS} 次解锁`;
  refreshSeedQuest();
  refreshShopHint();
}

function refreshWallet() {
  const coinIcon = document.getElementById('coin-icon');
  const dewIcon = document.getElementById('dew-icon');
  const coinNum = document.getElementById('coin-num');
  const dewNum = document.getElementById('dew-num');
  if (coinIcon && typeof GardenArt !== 'undefined') coinIcon.innerHTML = GardenArt.coinIcon();
  if (dewIcon && typeof GardenArt !== 'undefined') dewIcon.innerHTML = GardenArt.dewIcon();
  if (coinNum) coinNum.textContent = String(state.coins);
  if (dewNum) dewNum.textContent = String(state.dew);
  tryUnlockPond();
  tryUnlockDewPool();
  tryUnlockShop();
  tryUnlockBugcatch();
  tryUnlockSeedshop();
  tryUnlockBird();
  tryUnlockRain();
  tryUnlockFruitshop();
  tryUnlockCompost();
  tryUnlockMushroom();
  tryUnlockWell();
  if (state.activeTab === 'manor') refreshManorUpgradeTip();
}

function tryUnlockDewPool() {
  if (state.dewPoolUnlocked) return;
  if (state.dewTotalEarned >= DEW_POOL_UNLOCK_TOTAL) {
    state.dewPoolUnlocked = true;
    save();
    showToast('露水池解锁！露水有用处啦');
    refreshDewTab();
    refreshGardenStats();
  }
  tryUnlockRain();
}

function refreshDewTab() {
  const tab = document.getElementById('tab-dew');
  if (!tab) return;
  tab.disabled = !state.dewPoolUnlocked;
  tab.title = state.dewPoolUnlocked ? '露水池' : `累计获得 ${DEW_POOL_UNLOCK_TOTAL} 露水解锁`;
}

function refreshGardenStats() {
  const harvestEl = document.getElementById('harvest-count');
  if (harvestEl) {
    harvestEl.textContent = `累计收获 ${state.harvestTotal} 次（和能不能种花无关）`;
  }
  const hint = document.getElementById('pond-unlock-hint');
  if (!hint) return;
  const empty = countEmptyPlots();
  if (empty > 0) {
    hint.textContent = `有 ${empty} 块空地 · 先选上面种子，再点空地格子`;
    hint.style.color = '#2e7d32';
    return;
  }
  if (state.harvestTotal <= 0 && !state.pondUnlocked) {
    hint.textContent = '点上面空地免费种 · 种完记得浇水 · 成熟点一下收获';
    hint.style.color = '#2e7d32';
    return;
  }
  if (state.pondUnlocked && state.dewPoolUnlocked) {
    hint.textContent = '鱼池与露水池都已解锁';
    hint.style.color = '#0288d1';
  } else if (state.pondUnlocked) {
    hint.textContent = '鱼池已解锁 · 去养鱼吧';
    hint.style.color = '#0288d1';
  } else if (state.dewPoolUnlocked) {
    const left = Math.max(0, POND_UNLOCK_COINS - state.coins);
    hint.textContent = left > 0 ? `露水池已解锁 · 鱼池还差 ${left} 金币` : '鱼池即将解锁…';
    hint.style.color = '#039be5';
  } else {
    const pondLeft = Math.max(0, POND_UNLOCK_COINS - state.coins);
    const dewLeft = Math.max(0, DEW_POOL_UNLOCK_TOTAL - state.dewTotalEarned);
    hint.textContent = pondLeft > 0
      ? `继续种花收获 · 鱼池还差 ${pondLeft} 金币（不影响种地）`
      : `鱼池即将解锁 · 露水池差 ${dewLeft} 露水`;
    hint.style.color = '';
  }
  refreshSeedQuest();
}

function refreshSeedBar() {
  const bar = document.getElementById('seed-bar');
  if (!bar) return;
  const seeds = getAvailableSeeds();
  bar.innerHTML = seeds.map(seed => {
    const def = PLANTS[seed];
    const sec = Math.ceil(def.growMs / 1000);
    const sel = state.selectedSeed === seed ? ' selected' : '';
    const growHint = plantAutoGrow(seed) ? '免浇水自长' : (PLANTS[seed].fruitKey ? '采一次果' : `每阶${sec}秒`);
    return `<button type="button" class="seed${sel}" data-seed="${seed}">
      <span class="seed-icon" data-seed-icon="${seed}"></span>
      <span class="seed-name">${def.label}</span>
      <em>${growHint}</em>
    </button>`;
  }).join('');
  bar.querySelectorAll('.seed').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedSeed = btn.dataset.seed;
      save();
      refreshSeedBar();
    });
    const icon = btn.querySelector('[data-seed-icon]');
    if (icon && typeof GardenArt !== 'undefined') icon.innerHTML = GardenArt.seedIcon(btn.dataset.seed);
  });
  refreshDewActions();
}

function initStaticArt() {
  if (typeof GardenArt === 'undefined') return;
  const brand = document.getElementById('brand-icon');
  if (brand) brand.innerHTML = GardenArt.courtyardIcon();
  const insectTabIcon = document.getElementById('tab-insect-icon');
  if (insectTabIcon) insectTabIcon.innerHTML = GardenArt.tabInsectIcon();
  const dewTabIcon = document.getElementById('tab-dew-icon');
  if (dewTabIcon) dewTabIcon.innerHTML = GardenArt.tabDewIcon();
  const shopTabIcon = document.getElementById('tab-shop-icon');
  if (shopTabIcon) shopTabIcon.innerHTML = GardenArt.tabShopIcon();
  const bugTabIcon = document.getElementById('tab-bugcatch-icon');
  if (bugTabIcon) bugTabIcon.innerHTML = GardenArt.tabBugcatchIcon();
  const seedTabIcon = document.getElementById('tab-seedshop-icon');
  if (seedTabIcon) seedTabIcon.innerHTML = GardenArt.tabSeedshopIcon();
  const birdTabIcon = document.getElementById('tab-bird-icon');
  if (birdTabIcon) birdTabIcon.innerHTML = GardenArt.tabBirdIcon();
  const rainTabIcon = document.getElementById('tab-rain-icon');
  if (rainTabIcon) rainTabIcon.innerHTML = GardenArt.tabRainIcon();
  const fruitTabIcon = document.getElementById('tab-fruitshop-icon');
  if (fruitTabIcon) fruitTabIcon.innerHTML = GardenArt.tabFruitshopIcon();
  const compostTabIcon = document.getElementById('tab-compost-icon');
  if (compostTabIcon) compostTabIcon.innerHTML = GardenArt.tabCompostIcon();
  const mushroomTabIcon = document.getElementById('tab-mushroom-icon');
  if (mushroomTabIcon) mushroomTabIcon.innerHTML = GardenArt.tabMushroomIcon();
  const wellTabIcon = document.getElementById('tab-well-icon');
  if (wellTabIcon) wellTabIcon.innerHTML = GardenArt.tabWellIcon();
  renderManorButtonPreview();
  refreshInsectBars();
  refreshWallet();
  refreshSeedBar();
  refreshDewTab();
  refreshShopTab();
  refreshBugcatchTab();
  refreshSeedshopTab();
  refreshBirdTab();
  refreshRainTab();
  refreshFruitshopTab();
  refreshCompostTab();
  refreshMushroomTab();
  refreshWellTab();
  refreshManorDock();
  refreshSeedQuest();
}

function refreshInsectBars() {
  if (typeof GardenArt === 'undefined') return;
  document.querySelectorAll('.insect-pick').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.habitat === state.selectedHabitat);
    const icon = btn.querySelector('[data-habitat-icon]');
    if (icon) icon.innerHTML = GardenArt.habitatIcon(btn.dataset.habitat);
  });
  document.querySelectorAll('.insect-buy').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.insect === state.selectedInsect);
    const icon = btn.querySelector('[data-insect-icon]');
    if (icon) icon.innerHTML = GardenArt.insectSvg(btn.dataset.insect);
  });
}

function flushGardenGrowth(persist = false) {
  return tickGardenGrowth(persist);
}

function syncAllGardenGrowth(persist = false) {
  let changed = false;
  for (let i = 0; i < 8; i++) {
    if (!flushGardenGrowth(false)) break;
    changed = true;
  }
  if (changed && persist) save();
  return changed;
}

function renderGarden(skipGrowthTick = false) {
  ensurePlots();
  if (!skipGrowthTick) syncAllGardenGrowth(false);
  const grid = document.getElementById('garden-grid');
  if (!grid) return;
  grid.innerHTML = '';
  state.plots.forEach((plot, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'plot';
    const isEmpty = !plot.plant || plot.stage <= 0;
    if (isEmpty) btn.classList.add('plot-empty');
    if (plot.plant) btn.classList.add('planted');
    if (plot.plant && plot.stage > 0 && plot.stage < 3 && !plot.wet && !plantAutoGrow(plot.plant)) {
      btn.classList.add('dry');
    }
    if (plot.plant && plantAutoGrow(plot.plant) && plot.stage > 0 && plot.stage < 3) {
      btn.classList.add('autogrow');
    }
    if (plot.wet && plot.stage > 0 && plot.stage < 3 && !plantAutoGrow(plot.plant)) btn.classList.add('wet');
    if (plot.stage >= 3 && plantHasFruit(plot.plant)) {
      btn.classList.add('ready');
    } else if (plot.stage >= 3) {
      btn.classList.add('ready');
    }
    const wetBadge = plot.wet && plot.stage > 0 && plot.stage < 3 && !plantAutoGrow(plot.plant) && typeof GardenArt !== 'undefined'
      ? `<span class="plot-wet-badge">${GardenArt.waterDrop()}</span>` : '';
    btn.innerHTML = `<span class="plot-art">${plotSvg(plot)}</span><span class="label">${plotLabel(plot)}</span>${wetBadge}`;
    btn.dataset.plotIdx = String(idx);
    grid.appendChild(btn);
  });
  const resetBtn = document.getElementById('garden-reset-btn');
  if (resetBtn) {
    resetBtn.classList.toggle('hidden', countEmptyPlots() > 0);
  }
  refreshWallet();
  refreshGardenStats();
  refreshEcoBanner();
  refreshSeedBar();
  refreshPondTab();
  refreshDewTab();
}

function spawnHarvestPop(btn, text) {
  const grid = document.getElementById('garden-grid');
  if (!grid || !btn) return;
  const r = btn.getBoundingClientRect();
  const gr = grid.getBoundingClientRect();
  const pop = document.createElement('div');
  pop.className = 'harvest-pop';
  pop.textContent = text;
  pop.style.left = `${r.left - gr.left + r.width / 2 - 20}px`;
  pop.style.top = `${r.top - gr.top - 4}px`;
  grid.appendChild(pop);
  setTimeout(() => pop.remove(), 1000);
}

function tryUnlockPond() {
  if (state.pondUnlocked) return;
  if (state.coins >= POND_UNLOCK_COINS) {
    state.pondUnlocked = true;
    save();
    showToast('鱼池解锁！可以去养鱼了');
    refreshPondTab();
    refreshGardenStats();
  }
}

function onPlotClick(idx, btn) {
  const now = Date.now();
  if (now - (onPlotClick._lastAt || 0) < 280 && onPlotClick._lastIdx === idx) return;
  onPlotClick._lastAt = now;
  onPlotClick._lastIdx = idx;
  if (syncAllGardenGrowth(false)) save();
  const plot = state.plots[idx];
  if (!plot) return;

  if (!plot.plant || plot.stage <= 0) {
    if (!PLANTS[state.selectedSeed]) state.selectedSeed = 'flower';
    initPlotPlant(plot, state.selectedSeed);
    save();
    const def = PLANTS[state.selectedSeed];
    GameAudio.play('plant');
    maybeAdvanceTutorial('plant');
    showToast(def.autoGrow
      ? `种下${def.label} · 自己会慢慢长`
      : `种下${def.label} · 记得浇水`);
    renderGarden();
    return;
  }

  if (plot.stage >= 3) {
    if (plantHasFruit(plot.plant)) {
      const fruitLabel = PLANTS[plot.plant].fruitLabel;
      if (pickFruitFromPlot(plot)) {
        save();
        GameAudio.play('fruit');
        maybeAdvanceTutorial('harvest');
        spawnHarvestPop(btn, `+1 ${fruitLabel}`);
        renderGarden();
        if (document.getElementById('panel-fruitshop')?.classList.contains('open')) renderFruitshop();
      }
      return;
    }
    const def = PLANTS[plot.plant];
    const gained = applyHarvestCoins(def.coin);
    state.coins += gained;
    state.dew += def.dew;
    state.harvestTotal += 1;
    state.dewTotalEarned += def.dew;
    bumpDailyCommission('harvest');
    addShopStockFromHarvest(plot.plant);
    clearPlot(plot);
    save();
    GameAudio.play('harvest');
    maybeAdvanceTutorial('harvest');
    spawnHarvestPop(btn, `+${gained} 金币 +${def.dew} 露水`);
    showToast(state.shopUnlocked ? `收获${def.label} · 已入花房` : `收获${def.label}！`);
    tryUnlockPond();
    tryUnlockDewPool();
    tryUnlockShop();
    tryUnlockBird();
    renderGarden();
    return;
  }

  if (plantAutoGrow(plot.plant)) {
    showToast('这株自己长，不用浇水');
    return;
  }

  if (!plot.wet) {
    plot.wet = true;
    plot.waterAt = Date.now();
    save();
    GameAudio.play('water');
    bumpDailyCommission('water');
    maybeAdvanceTutorial('water');
    showToast('浇水成功 · 等它长大');
    renderGarden();
  }
}

function refreshPondTab() {
  const tab = document.getElementById('tab-pond');
  if (!tab) return;
  tab.disabled = !state.pondUnlocked;
  if (state.pondUnlocked) tab.title = '鱼池';
  else tab.title = `金币 ${POND_UNLOCK_COINS} 后解锁`;
}

function renderPondPlants() {
  const el = document.getElementById('pond-plants');
  if (!el || typeof GardenArt === 'undefined') return;
  el.innerHTML = `
    <div class="pond-plant" style="left:6%;bottom:14%">${GardenArt.pondLotus()}</div>
    <div class="pond-plant" style="left:76%;bottom:10%;transform:scale(0.9)">${GardenArt.pondReed()}</div>
    <div class="pond-plant" style="left:40%;bottom:20%;transform:scale(0.75)">${GardenArt.pondReed()}</div>`;
}

function clearFishSwimTimers() {
  fishSwimTimers.forEach(t => clearTimeout(t));
  fishSwimTimers.length = 0;
}

function scheduleFishSwim(index) {
  if (fishSwimTimers[index]) clearTimeout(fishSwimTimers[index]);
  const delay = 3800 + Math.random() * 4200;
  fishSwimTimers[index] = setTimeout(() => {
    if (!state.pondUnlocked || !state.fish[index]) return;
    if (pondFeeding) {
      scheduleFishSwim(index);
      return;
    }
    idleSwimFish(index);
    scheduleFishSwim(index);
  }, delay);
}

function scheduleAllFishSwim() {
  clearFishSwimTimers();
  state.fish.forEach((_, i) => scheduleFishSwim(i));
}

function idleSwimFish(index) {
  const f = state.fish[index];
  if (!f) return;
  const stepX = 14;
  const stepY = 10;
  const nextX = Math.max(8, Math.min(86, f.x + (Math.random() * stepX * 2 - stepX)));
  const nextY = Math.max(18, Math.min(73, f.y + (Math.random() * stepY * 2 - stepY)));
  f.flip = nextX >= f.x;
  f.x = nextX;
  f.y = nextY;
  const el = fishDom.get(f.id);
  if (el?.isConnected) {
    el.innerHTML = typeof GardenArt !== 'undefined' ? GardenArt.fishSvg(f.species, f.flip) : '';
    el.style.left = `${f.x}%`;
    el.style.top = `${f.y}%`;
  }
  save();
  if (document.getElementById('panel-pond')?.classList.contains('open')) {
    renderFishList();
  }
}

function renderFishLayer() {
  const layer = document.getElementById('pond-fish-layer');
  if (!layer) return;
  const alive = new Set(state.fish.map(f => f.id));
  fishDom.forEach((el, id) => {
    if (!alive.has(id)) {
      el.remove();
      fishDom.delete(id);
    }
  });
  state.fish.forEach(f => {
    let el = fishDom.get(f.id);
    if (!el) {
      el = document.createElement('div');
      el.className = 'pond-fish';
      fishDom.set(f.id, el);
      layer.appendChild(el);
      el.style.transition = 'none';
      el.style.left = `${f.x}%`;
      el.style.top = `${f.y}%`;
      if (typeof GardenArt !== 'undefined') {
        el.innerHTML = GardenArt.fishSvg(f.species, f.flip);
      }
      requestAnimationFrame(() => { el.style.transition = ''; });
      return;
    }
    if (typeof GardenArt !== 'undefined') {
      el.innerHTML = GardenArt.fishSvg(f.species, f.flip);
    }
    el.style.left = `${f.x}%`;
    el.style.top = `${f.y}%`;
  });
}

function renderFishList() {
  const list = document.getElementById('pond-fish-list');
  if (!list) return;
  if (!state.fish.length) {
    list.innerHTML = '<div class="fish-card"><span class="name" style="color:#888">还没有鱼 · 买一条试试吧</span></div>';
    return;
  }
  list.innerHTML = state.fish.map(f => {
    const meta = FISH_TYPES[f.species];
    const hunger = Math.max(0, Math.min(100, Math.round(f.hunger)));
    const thumb = typeof GardenArt !== 'undefined'
      ? `<span class="fish-thumb">${GardenArt.fishSvg(f.species, false)}</span>` : '';
    return `
      <div class="fish-card">
        <div class="fish-card-main">
          ${thumb}
          <div>
            <div class="name">${meta.label}</div>
            <div class="meta">饱食度</div>
            <div class="fish-bar"><i style="width:${hunger}%"></i></div>
          </div>
        </div>
        <div class="meta">${hunger}%</div>
      </div>`;
  }).join('');
}

function allFishFull() {
  return state.fish.length > 0
    && state.fish.every(f => Math.round(Number(f.hunger) || 0) >= 100);
}

function refreshFeedBtn() {
  const btn = document.getElementById('pond-feed-btn');
  if (!btn) return;
  btn.disabled = pondFeeding || !state.fish.length || state.coins < 5 || allFishFull();
}

function renderPond() {
  renderPondPlants();
  renderFishLayer();
  renderFishList();
  document.querySelectorAll('.pond-buy').forEach(btn => {
    const sp = btn.dataset.fish;
    const price = FISH_TYPES[sp]?.price ?? 999;
    btn.disabled = state.coins < price || state.fish.length >= MAX_FISH;
  });
  refreshFeedBtn();
  refreshWallet();
}

function swimFish() {
  state.fish.forEach((_, i) => idleSwimFish(i));
}

function buyFish(species) {
  const def = FISH_TYPES[species];
  if (!def || state.fish.length >= MAX_FISH) return;
  if (state.coins < def.price) {
    showToast('金币不够');
    return;
  }
  state.coins -= def.price;
  state.fish.push(normalizeFish({
    id: state.fishIdSeq++,
    species,
    hunger: 70 + Math.random() * 20,
    x: 20 + Math.random() * 60,
    y: 30 + Math.random() * 40,
    flip: Math.random() > 0.5,
  }));
  save();
  showToast(`${def.label} 入池啦`);
  renderPond();
  scheduleFishSwim(state.fish.length - 1);
}

function spawnPondPellets() {
  const layer = document.getElementById('pond-pellet-layer');
  if (!layer) return [];
  layer.innerHTML = '';
  const pellets = [];
  const count = 6 + Math.min(state.fish.length, 4);
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'pond-pellet';
    const x = 10 + Math.random() * 80;
    p.style.left = `${x}%`;
    p.style.top = `${2 + Math.random() * 7}%`;
    p.style.setProperty('--fall-dy', `${135 + Math.random() * 75}px`);
    p.style.animationDelay = `${i * 0.07}s`;
    if (i >= count - 2) {
      p.style.width = '5px';
      p.style.height = '5px';
    }
    layer.appendChild(p);
    pellets.push({ el: p, x, landY: 32 + Math.random() * 38 });
  }
  return pellets;
}

function feedAllFish() {
  if (pondFeeding) return;
  if (!state.fish.length) return;
  if (allFishFull()) {
    showToast('鱼儿们都饱啦');
    return;
  }
  if (state.coins < 5) {
    showToast('喂食需要 5 金币');
    return;
  }
  pondFeeding = true;
  const btn = document.getElementById('pond-feed-btn');
  if (btn) btn.disabled = true;

  state.coins -= 5;
  state.fish.forEach(f => {
    f.hunger = Math.min(100, Math.round(Number(f.hunger) || 0) + 35);
  });
  bumpDailyCommission('feedfish');
  save();

  const pellets = spawnPondPellets();
  showToast('鱼粮撒下来啦');

  setTimeout(() => {
    state.fish.forEach((f, i) => {
      const target = pellets[i % pellets.length];
      if (!target) return;
      const jitter = 7;
      const tx = Math.max(8, Math.min(86, target.x + (Math.random() * jitter * 2 - jitter)));
      const ty = Math.max(18, Math.min(73, target.landY));
      f.flip = tx >= f.x;
      f.x = tx;
      f.y = ty;
      const el = fishDom.get(f.id);
      if (el?.isConnected) {
        el.innerHTML = typeof GardenArt !== 'undefined' ? GardenArt.fishSvg(f.species, f.flip) : '';
        el.style.left = `${f.x}%`;
        el.style.top = `${f.y}%`;
        el.classList.add('happy', 'eating');
      }
    });
    save();
  }, 380);

  setTimeout(() => {
    pellets.forEach(p => {
      if (!p.el.isConnected) return;
      p.el.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
      p.el.style.opacity = '0';
      p.el.style.transform = 'scale(0.15)';
      setTimeout(() => p.el.remove(), 300);
    });
    document.querySelectorAll('.pond-fish').forEach(el => el.classList.remove('happy', 'eating'));
    pondFeeding = false;
    renderPond();
  }, 1900);

  refreshWallet();
  renderFishList();
}

function nextEmptyLeafIndex() {
  return state.insectSlots.findIndex(s => !s.habitat);
}

function insectBranchArt(slot, layout) {
  if (typeof GardenArt === 'undefined' || !slot.habitat || !layout) return '';
  return GardenArt.branchSprig(layout.edge, slot.habitat, slot.insect);
}

function applyBranchLayout(el, layout) {
  el.classList.add(`edge-${layout.edge}`);
  el.style.setProperty('--edge-pos', String(layout.pos));
}

function refreshInsectAddBtn() {
  const btn = document.getElementById('insect-add-leaf-btn');
  if (!btn) return;
  const def = HABITAT_TYPES[state.selectedHabitat];
  const empty = nextEmptyLeafIndex();
  btn.textContent = empty < 0 ? '边缘已满' : `从边缘插一枝 · ${def?.price ?? 0}`;
  btn.disabled = empty < 0 || !def || state.coins < def.price;
}

function renderInsectPatch() {
  const bg = document.getElementById('insect-patch-bg');
  const layer = document.getElementById('insect-leaf-layer');
  if (!layer) return;
  if (bg && typeof GardenArt !== 'undefined') {
    bg.innerHTML = GardenArt.insectPatchBg();
  }
  layer.innerHTML = '';
  state.insectSlots.forEach((slot, idx) => {
    if (!slot.habitat) return;
    const layout = LEAF_LAYOUT[idx] || LEAF_LAYOUT[0];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'insect-branch-item';
    if (slot.insect) btn.classList.add('has-bug');
    if (idx === lastPlantedBranchIdx) btn.classList.add('planting');
    applyBranchLayout(btn, layout);
    btn.innerHTML = insectBranchArt(slot, layout);
    btn.title = slot.insect
      ? `${INSECT_TYPES[slot.insect].label} · 饱食 ${Math.round(Number(slot.hunger) || 0)}%`
      : `${HABITAT_TYPES[slot.habitat].label} · 点枝头买小虫`;
    btn.addEventListener('click', () => onInsectLeafClick(idx));
    layer.appendChild(btn);
  });
  if (lastPlantedBranchIdx >= 0) {
    const planted = lastPlantedBranchIdx;
    setTimeout(() => {
      if (lastPlantedBranchIdx === planted) lastPlantedBranchIdx = -1;
    }, 700);
  }
  const habCount = document.getElementById('insect-habitat-count');
  const bugCount = document.getElementById('insect-bug-count');
  if (habCount) habCount.textContent = `叶丛里 ${countInsectHabitats()} 片叶/枝`;
  if (bugCount) bugCount.textContent = `小虫 ${countInsects()} 只`;
  refreshInsectAddBtn();
}

function renderInsect() {
  refreshInsectBars();
  renderInsectPatch();
  renderInsectList();
  refreshInsectFeedBtn();
  refreshWallet();
}

function addInsectLeaf() {
  const idx = nextEmptyLeafIndex();
  if (idx < 0) {
    showToast('叶丛里已经塞满啦');
    return;
  }
  const def = HABITAT_TYPES[state.selectedHabitat];
  if (!def) return;
  if (state.coins < def.price) {
    showToast('金币不够');
    return;
  }
  state.coins -= def.price;
  state.insectSlots[idx].habitat = state.selectedHabitat;
  lastPlantedBranchIdx = idx;
  save();
  showToast(`${def.label} 从边缘插进叶丛啦`);
  renderInsect();
}

function onInsectLeafClick(idx) {
  const slot = state.insectSlots[idx];
  if (!slot?.habitat) return;

  if (!slot.insect) {
    const bug = INSECT_TYPES[state.selectedInsect];
    if (!bug) return;
    if (!bug.habitats.includes(slot.habitat)) {
      const likes = bug.habitats.map(h => HABITAT_TYPES[h].label).join('或');
      showToast(`${bug.label}更适合${likes}`);
      return;
    }
    if (state.coins < bug.price) {
      showToast('金币不够');
      return;
    }
    state.coins -= bug.price;
    slot.insect = state.selectedInsect;
    slot.hunger = 70 + Math.round(Math.random() * 20);
    save();
    showToast(`${bug.label} 住进叶丛啦`);
    tryUnlockBugcatch();
    renderInsect();
    return;
  }

  const hunger = Math.round(Number(slot.hunger) || 0);
  showToast(`${INSECT_TYPES[slot.insect].label} · 饱食 ${hunger}%`);
}

function countInsectHabitats() {
  return state.insectSlots.filter(s => s.habitat).length;
}

function countInsects() {
  return state.insectSlots.filter(s => s.insect).length;
}

function allInsectsFull() {
  const bugs = state.insectSlots.filter(s => s.insect);
  return bugs.length > 0 && bugs.every(s => Math.round(Number(s.hunger) || 0) >= 100);
}

function refreshInsectFeedBtn() {
  const btn = document.getElementById('insect-feed-btn');
  if (!btn) return;
  btn.disabled = insectFeeding || !countInsects() || state.coins < INSECT_FEED_COST || allInsectsFull();
}

function renderInsectList() {
  const list = document.getElementById('insect-list');
  if (!list) return;
  const bugs = state.insectSlots
    .map((s, idx) => ({ ...s, idx }))
    .filter(s => s.insect);
  if (!bugs.length) {
    list.innerHTML = '<div class="insect-card"><span class="name" style="color:#888">还没有小虫 · 先添叶/枝，再点叶丛买虫</span></div>';
    return;
  }
  list.innerHTML = bugs.map(s => {
    const meta = INSECT_TYPES[s.insect];
    const hab = HABITAT_TYPES[s.habitat];
    const hunger = Math.max(0, Math.min(100, Math.round(Number(s.hunger) || 0)));
    const thumb = typeof GardenArt !== 'undefined'
      ? `<span class="insect-card-thumb">${GardenArt.insectSvg(s.insect)}</span>` : '';
    return `
      <div class="insect-card">
        <div class="insect-card-main">
          ${thumb}
          <div>
            <div class="name">${meta.label}</div>
            <div class="meta">${hab.label} · 叶丛中</div>
            <div class="insect-bar"><i style="width:${hunger}%"></i></div>
          </div>
        </div>
        <div class="meta">${hunger}%</div>
      </div>`;
  }).join('');
}

function spawnInsectCrumbs() {
  const layer = document.getElementById('insect-crumb-layer');
  if (!layer) return;
  layer.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const c = document.createElement('div');
    c.className = 'insect-crumb';
    c.style.left = `${8 + Math.random() * 84}%`;
    c.style.top = `${4 + Math.random() * 10}%`;
    c.style.animationDelay = `${i * 0.06}s`;
    layer.appendChild(c);
    setTimeout(() => c.remove(), 1400);
  }
}

function feedAllInsects() {
  if (insectFeeding) return;
  if (!countInsects()) return;
  if (allInsectsFull()) {
    showToast('小虫们都饱啦');
    return;
  }
  if (state.coins < INSECT_FEED_COST) {
    showToast(`喂食需要 ${INSECT_FEED_COST} 金币`);
    return;
  }
  insectFeeding = true;
  const btn = document.getElementById('insect-feed-btn');
  if (btn) btn.disabled = true;
  state.coins -= INSECT_FEED_COST;
  state.insectSlots.forEach(s => {
    if (!s.insect) return;
    s.hunger = Math.min(100, Math.round(Number(s.hunger) || 0) + 32);
  });
  save();
  spawnInsectCrumbs();
  showToast('蜜屑撒下来啦');
  setTimeout(() => {
    insectFeeding = false;
    renderInsect();
  }, 1300);
}

function tickInsectHunger() {
  if (!countInsects() || insectFeeding) return;
  let changed = false;
  state.insectSlots.forEach(s => {
    if (!s.insect) return;
    s.hunger = Math.max(0, Math.min(100, Math.round(Number(s.hunger) || 0)));
    if (s.hunger <= 0) return;
    s.hunger -= INSECT_HUNGER_DECAY;
    changed = true;
  });
  if (!changed) return;
  save();
  if (document.getElementById('panel-insect')?.classList.contains('open')) {
    renderInsectList();
    renderInsectPatch();
    refreshInsectFeedBtn();
  }
}

function switchTab(tabId) {
  if (tabId === 'pond' && !state.pondUnlocked) {
    showToast(`鱼池要 ${POND_UNLOCK_COINS} 金币才开 · 先在花园种花收获，跟种地无关`);
    return;
  }
  if (tabId === 'dew' && !state.dewPoolUnlocked) {
    showToast(`累计获得 ${DEW_POOL_UNLOCK_TOTAL} 露水解锁露水池`);
    return;
  }
  if (tabId === 'shop' && !state.shopUnlocked) {
    showToast(`累计收获 ${SHOP_UNLOCK_HARVESTS} 次解锁花房`);
    return;
  }
  if (tabId === 'bugcatch' && !state.bugcatchUnlocked) {
    showToast(`养 ${BUGCATCH_UNLOCK_INSECTS} 只虫解锁捉虫大赛`);
    return;
  }
  if (tabId === 'seedshop' && !state.seedshopUnlocked) {
    const left = Math.max(0, SEEDSHOP_UNLOCK_SOLD - state.shopSoldTotal);
    if (!state.shopUnlocked) {
      showToast(`先收获 ${SHOP_UNLOCK_HARVESTS} 次开花房，再卖 ${SEEDSHOP_UNLOCK_SOLD} 次开种子铺`);
    } else {
      showToast(`花房再卖 ${left} 次开种子铺（已卖 ${state.shopSoldTotal}/${SEEDSHOP_UNLOCK_SOLD}）`);
    }
    return;
  }
  if (tabId === 'bird' && !state.birdUnlocked) {
    showToast(`累计收获 ${BIRD_UNLOCK_HARVESTS} 次解锁鸟架`);
    return;
  }
  if (tabId === 'rain' && !state.rainUnlocked) {
    showToast('露水池解锁后可用雨棚');
    return;
  }
  if (tabId === 'fruitshop' && !state.fruitshopUnlocked) {
    showToast(`采摘 ${FRUITSHOP_UNLOCK_PICKS} 个果实解锁水果铺`);
    return;
  }
  if (tabId === 'compost' && !state.compostUnlocked) {
    showToast('花房开张后解锁堆肥角');
    return;
  }
  if (tabId === 'mushroom' && !state.mushroomUnlocked) {
    showToast(`累计获得 ${MUSHROOM_UNLOCK_DEW} 露水解锁蘑菇角`);
    return;
  }
  if (tabId === 'well' && !state.wellUnlocked) {
    showToast('鱼池解锁后可用小井');
    return;
  }
  if (tabId === 'manor' && state.activeTab !== 'manor') {
    state.manorReturnTab = state.activeTab;
  }
  if (state.activeTab === 'bugcatch' && tabId !== 'bugcatch' && bugcatchActive) {
    stopBugcatchGame();
  }
  state.activeTab = tabId;
  save();
  syncTabHighlight(tabId);
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('open'));
  document.getElementById(`panel-${tabId}`)?.classList.add('open');
  if (tabId === 'garden') {
    ensurePlots();
    renderGarden();
  }
  if (tabId === 'pond') renderPond();
  if (tabId === 'insect') renderInsect();
  if (tabId === 'dew') renderDewPool();
  if (tabId === 'shop') {
    tickShopVisitors();
    renderShop();
  }
  if (tabId === 'bugcatch') renderBugcatch();
  if (tabId === 'seedshop') renderSeedshop();
  if (tabId === 'bird') renderBird();
  if (tabId === 'rain') renderRain();
  if (tabId === 'fruitshop') renderFruitshop();
  if (tabId === 'compost') renderCompost();
  if (tabId === 'mushroom') renderMushroom();
  if (tabId === 'well') renderWell();
  if (tabId === 'manor') renderManor();
}

function tickFishHunger() {
  if (!state.pondUnlocked || !state.fish.length || pondFeeding) return;
  let changed = false;
  state.fish.forEach(f => {
    f.hunger = Math.max(0, Math.min(100, Math.round(Number(f.hunger) || 0)));
    if (f.hunger <= 0) return;
    f.hunger -= HUNGER_DECAY * (1 - getFishCareBonus());
    changed = true;
  });
  if (!changed) return;
  save();
  if (document.getElementById('panel-pond')?.classList.contains('open')) {
    renderFishList();
    refreshFeedBtn();
  }
}

function todayCommissionKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function ensureDailyCommissionDay() {
  const day = todayCommissionKey();
  if (state.dailyCommissionDay === day) return;
  const idx = day.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % DAILY_COMMISSION_POOL.length;
  state.dailyCommissionDay = day;
  state.dailyCommissionId = DAILY_COMMISSION_POOL[idx].id;
  state.dailyCommissionProgress = 0;
  state.dailyCommissionDone = false;
  state.dailyCommissionClaimed = false;
  state.dailyTrackHarvest = 0;
  state.dailyTrackWater = 0;
  state.dailyTrackSell = 0;
  state.dailyTrackFeedFish = 0;
}

function currentDailyCommission() {
  ensureDailyCommissionDay();
  return DAILY_COMMISSION_POOL.find(c => c.id === state.dailyCommissionId) || DAILY_COMMISSION_POOL[0];
}

function bumpDailyCommission(track, n = 1) {
  if (state.dailyCommissionClaimed) return;
  ensureDailyCommissionDay();
  const def = currentDailyCommission();
  if (def.track !== track) return;
  if (track === 'harvest') state.dailyTrackHarvest += n;
  if (track === 'water') state.dailyTrackWater += n;
  if (track === 'sell') state.dailyTrackSell += n;
  if (track === 'feedfish') state.dailyTrackFeedFish += n;
  const val = {
    harvest: state.dailyTrackHarvest,
    water: state.dailyTrackWater,
    sell: state.dailyTrackSell,
    feedfish: state.dailyTrackFeedFish,
  }[def.track] | 0;
  state.dailyCommissionProgress = Math.min(def.target, val);
  if (!state.dailyCommissionDone && state.dailyCommissionProgress >= def.target) {
    state.dailyCommissionDone = true;
    showToast(`委托完成：${def.label}`);
  }
  renderDailyCommission();
  save();
}

function renderDailyCommission() {
  const box = document.getElementById('daily-commission');
  if (!box) return;
  ensureDailyCommissionDay();
  const def = currentDailyCommission();
  const cur = state.dailyCommissionProgress | 0;
  box.hidden = false;
  box.innerHTML = state.dailyCommissionClaimed
    ? `<span class="dc-done">✓ 今日委托已完成</span>`
    : `<div class="dc-head"><span>📋 今日委托</span><strong>${def.label}</strong></div>
       <div class="dc-bar"><i style="width:${Math.min(100, Math.round((cur / def.target) * 100))}%"></i></div>
       <div class="dc-foot"><span>${cur}/${def.target}</span>
       ${state.dailyCommissionDone ? `<button type="button" id="dc-claim" class="dc-claim">领 ${def.reward}💰</button>` : ''}</div>`;
  document.getElementById('dc-claim')?.addEventListener('click', claimDailyCommission);
}

function claimDailyCommission() {
  if (!state.dailyCommissionDone || state.dailyCommissionClaimed) return;
  const def = currentDailyCommission();
  state.dailyCommissionClaimed = true;
  state.coins += def.reward;
  showToast(`委托奖励 +${def.reward} 金币`);
  renderDailyCommission();
  refreshWallet();
  save();
}

function pauseGardenTimers() {
  if (growTimer) clearInterval(growTimer);
  if (hungerTimer) clearInterval(hungerTimer);
  if (insectHungerTimer) clearInterval(insectHungerTimer);
  if (dewCondenseTimer) clearInterval(dewCondenseTimer);
  if (shopVisitorTimer) clearInterval(shopVisitorTimer);
  if (rainTimer) clearInterval(rainTimer);
  if (birdTimer) clearInterval(birdTimer);
  growTimer = hungerTimer = insectHungerTimer = dewCondenseTimer = shopVisitorTimer = rainTimer = birdTimer = null;
}

function toggleLayoutMode() {
  state.layoutMode = !state.layoutMode;
  document.getElementById('btn-layout-mode')?.classList.toggle('active', state.layoutMode);
  document.getElementById('app')?.classList.toggle('layout-mode', state.layoutMode);
  if (state.layoutMode) {
    pauseGardenTimers();
    switchTab('manor');
    openManorDecoratePanel();
    showToast('布置模式：时间暂停，专心装饰庄园');
  } else {
    closeManorDecoratePanel();
    startTimers();
    showToast('已退出布置模式');
  }
  save();
}

function startTimers() {
  if (state.layoutMode) return;
  pauseGardenTimers();
  growTimer = setInterval(() => {
    const changed = syncAllGardenGrowth(false);
    if (changed) save();
    refreshDewActions();
    if (changed && document.getElementById('panel-garden')?.classList.contains('open')) {
      renderGarden(true);
    }
    if (tickMushroomGrowth(false) && document.getElementById('panel-mushroom')?.classList.contains('open')) {
      renderMushroom();
    }
  }, 300);
  hungerTimer = setInterval(tickFishHunger, HUNGER_TICK_MS);
  insectHungerTimer = setInterval(tickInsectHunger, INSECT_HUNGER_TICK_MS);
  dewCondenseTimer = setInterval(tickDewCondense, 5000);
  shopVisitorTimer = setInterval(tickShopVisitors, 2000);
  rainTimer = setInterval(tickRain, 3000);
  birdTimer = setInterval(tickBirds, 4000);
  scheduleAllFishSwim();
}

function bindUI() {
  bindGardenControls();
  document.getElementById('garden-reset-btn')?.addEventListener('click', resetGardenPlots);
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  document.getElementById('topbar-manor-btn')?.addEventListener('click', () => {
    if (state.activeTab === 'manor') exitManor();
    else switchTab('manor');
  });
  document.getElementById('btn-layout-mode')?.addEventListener('click', toggleLayoutMode);
  document.getElementById('manor-exit-btn')?.addEventListener('click', exitManor);
  document.getElementById('manor-back-float')?.addEventListener('click', exitManor);
  document.getElementById('manor-upgrade-tip')?.addEventListener('click', upgradeManor);
  document.getElementById('manor-decorate-btn')?.addEventListener('click', e => {
    e.stopPropagation();
    startManorDecorate();
  });
  document.getElementById('manor-decorate-close')?.addEventListener('click', closeManorDecoratePanel);
  document.getElementById('manor-decorate-overlay')?.addEventListener('click', e => {
    if (e.target.closest('.manor-decorate-panel')) return;
    closeManorDecoratePanel();
  });
  document.getElementById('manor-decorate-tabs')?.addEventListener('click', e => {
    const tab = e.target.closest('[data-decor-cat]');
    if (!tab) return;
    manorDecorFilter = tab.dataset.decorCat;
    renderManorDecoratePanel();
  });
  document.getElementById('manor-decorate-grid')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-decor-id]');
    if (!btn) return;
    pickManorDecorItem(btn.dataset.decorId);
  });
  document.getElementById('manor-scene-wrap')?.addEventListener('click', e => {
    if (!manorPlacePending) return;
    if (e.target.closest('#manor-ui-card')) return;
    placeManorDecorAt(e);
  });
  document.getElementById('seed-quest-go')?.addEventListener('click', () => switchTab('shop'));
  document.getElementById('manor-dock-toggle')?.addEventListener('click', e => {
    e.stopPropagation();
    toggleManorDock();
  });
  document.getElementById('manor-dock-map-btn')?.addEventListener('click', () => {
    switchTab('manor');
    setManorDockOpen(false);
  });
  document.getElementById('manor-dock-chips')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-manor-dock]');
    if (!btn) return;
    switchTab(btn.dataset.manorDock);
    setManorDockOpen(false);
  });
  document.addEventListener('click', e => {
    if (e.target.closest('#manor-dock-root')) return;
    if (e.target.closest('#manor-ui-card')) return;
    if (e.target.closest('#manor-float-layer')) return;
    if (e.target.closest('#manor-decorate-overlay')) return;
    setManorDockOpen(false);
    setManorCardOpen(false);
  });
  document.querySelectorAll('.pond-buy').forEach(btn => {
    btn.addEventListener('click', () => buyFish(btn.dataset.fish));
  });
  document.getElementById('pond-feed-btn')?.addEventListener('click', feedAllFish);
  document.querySelectorAll('.insect-pick').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedHabitat = btn.dataset.habitat;
      save();
      refreshInsectBars();
      refreshInsectAddBtn();
    });
  });
  document.getElementById('insect-add-leaf-btn')?.addEventListener('click', addInsectLeaf);
  document.querySelectorAll('.insect-buy').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedInsect = btn.dataset.insect;
      save();
      refreshInsectBars();
    });
  });
  document.getElementById('insect-feed-btn')?.addEventListener('click', feedAllInsects);
  document.getElementById('dew-harvest-all-btn')?.addEventListener('click', dewHarvestAllGarden);
  document.getElementById('dew-plant-all-btn')?.addEventListener('click', dewPlantAllGarden);
  document.getElementById('dew-water-all-btn')?.addEventListener('click', dewWaterAllGarden);
  document.getElementById('dew-boost-btn')?.addEventListener('click', dewBoostGrow);
  document.getElementById('dew-nourish-btn')?.addEventListener('click', dewNourishAll);
  document.getElementById('dew-upgrade-btn')?.addEventListener('click', upgradeDewPool);
  document.getElementById('shop-serve-btn')?.addEventListener('click', serveShopVisitor);
  document.getElementById('bugcatch-start-btn')?.addEventListener('click', startBugcatchGame);
  document.getElementById('bird-feed-btn')?.addEventListener('click', fillBirdFood);
  document.getElementById('bird-collect-btn')?.addEventListener('click', collectBirdGift);
  document.getElementById('rain-upgrade-btn')?.addEventListener('click', upgradeRainShelter);
  document.getElementById('compost-flower-btn')?.addEventListener('click', () => addCompostStock('flower'));
  document.getElementById('compost-tree-btn')?.addEventListener('click', () => addCompostStock('tree'));
  document.querySelectorAll('.mushroom-pick').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedMushroom = btn.dataset.mushroom;
      save();
      renderMushroom();
    });
  });
  document.getElementById('well-draw-btn')?.addEventListener('click', () => drawWellWater(false));
  document.getElementById('well-draw-dew-btn')?.addEventListener('click', () => drawWellWater(true));
  document.getElementById('well-upgrade-btn')?.addEventListener('click', upgradeWell);
  document.getElementById('seedshop-list')?.addEventListener('click', e => {
    const btn = e.target.closest('.seedshop-buy:not(.owned)');
    if (btn?.dataset.seed) buySeedFromShop(btn.dataset.seed);
  });
}

function getDewCondenseProgress() {
  if (state.dewPoolLevel <= 0) return 0;
  const elapsed = Date.now() - (state.lastDewCondense || Date.now());
  return Math.min(1, elapsed / DEW_CONDENSE_MS);
}

function getDewCondenseLeftSec() {
  if (state.dewPoolLevel <= 0) return 0;
  const left = DEW_CONDENSE_MS - (Date.now() - state.lastDewCondense);
  return Math.max(0, Math.ceil(left / 1000));
}

function tickDewCondense() {
  if (!state.dewPoolUnlocked || state.dewPoolLevel <= 0) return;
  const now = Date.now();
  if (now - state.lastDewCondense < DEW_CONDENSE_MS) {
    if (document.getElementById('panel-dew')?.classList.contains('open')) {
      updateDewCondenseUI();
      refreshDewActions();
    }
    return;
  }
  const gain = DEW_CONDENSE_PER_LEVEL[state.dewPoolLevel] || 1;
  state.dew += gain;
  state.lastDewCondense = now;
  save();
  if (document.getElementById('panel-dew')?.classList.contains('open')) {
    renderDewPool();
    spawnDewCondensePop(gain);
  } else {
    refreshWallet();
  }
}

function spawnDewCondensePop(amount) {
  const pool = document.getElementById('dew-pool-scene');
  if (!pool) return;
  const pop = document.createElement('div');
  pop.className = 'dew-condense-pop';
  pop.textContent = `+${amount} 露水`;
  pool.appendChild(pop);
  setTimeout(() => pop.remove(), 1200);
}

function updateDewCondenseUI() {
  const fill = document.getElementById('dew-condense-fill');
  const label = document.getElementById('dew-condense-label');
  if (fill) fill.style.width = `${Math.round(getDewCondenseProgress() * 100)}%`;
  if (label) {
    label.textContent = state.dewPoolLevel <= 0
      ? '扩建水池后可自动凝露'
      : `凝露中 · ${getDewCondenseLeftSec()}s · +${DEW_CONDENSE_PER_LEVEL[state.dewPoolLevel]}`;
  }
}

function renderDewPool() {
  syncAllGardenGrowth(false);
  const scene = document.getElementById('dew-pool-scene');
  if (scene && typeof GardenArt !== 'undefined') {
    scene.innerHTML = GardenArt.dewPoolScene(state.dewPoolLevel);
  }
  const lv = document.getElementById('dew-pool-level');
  if (lv) lv.textContent = `水池 Lv.${state.dewPoolLevel}`;
  const earned = document.getElementById('dew-total-earned');
  if (earned) earned.textContent = `累计获得露水 ${state.dewTotalEarned}`;
  updateDewCondenseUI();
  refreshDewActions();
  refreshWallet();
}

function countReadyPlots() {
  return state.plots.filter(p => p.plant && p.stage >= 3).length;
}

function refreshDewActions() {
  syncAllGardenGrowth(false);
  const h = document.getElementById('dew-harvest-all-btn');
  const p = document.getElementById('dew-plant-all-btn');
  const w = document.getElementById('dew-water-all-btn');
  const b = document.getElementById('dew-boost-btn');
  const n = document.getElementById('dew-nourish-btn');
  const u = document.getElementById('dew-upgrade-btn');
  const ready = countReadyPlots();
  const empty = countEmptyPlots();
  const seedDef = PLANTS[state.selectedSeed] || PLANTS.flower;
  if (h) {
    h.textContent = ready > 0
      ? `收获全场 · ${DEW_COST_HARVEST_ALL} 露水 (${ready}处可收)`
      : `收获全场 · ${DEW_COST_HARVEST_ALL} 露水`;
    h.disabled = state.dew < DEW_COST_HARVEST_ALL || ready <= 0;
  }
  if (w) w.disabled = state.dew < DEW_COST_WATER_ALL;
  if (p) {
    p.textContent = `灵露种${seedDef.label} · ${DEW_COST_PLANT_ALL} 露水`;
    p.disabled = state.dew < DEW_COST_PLANT_ALL || empty <= 0;
  }
  if (b) b.disabled = state.dew < DEW_COST_BOOST;
  if (n) {
    const hasLife = state.fish.length > 0 || state.insectSlots.some(s => s.insect);
    n.disabled = state.dew < DEW_COST_NOURISH || !hasLife;
  }
  if (u) {
    const lv = state.dewPoolLevel;
    if (lv >= 3) {
      u.textContent = '水池已满级';
      u.disabled = true;
    } else {
      const cost = DEW_UPGRADE_COSTS[lv];
      u.textContent = `扩建水池 · ${cost} 露水`;
      u.disabled = state.dew < cost;
    }
  }
}

function dewPlantAllGarden() {
  if (state.dew < DEW_COST_PLANT_ALL) {
    showToast('露水不够');
    return;
  }
  const seed = PLANTS[state.selectedSeed] ? state.selectedSeed : 'flower';
  const def = PLANTS[seed];
  let count = 0;
  state.plots.forEach(p => {
    if (p.plant && p.stage > 0) return;
    initPlotPlant(p, seed);
    count += 1;
  });
  if (!count) {
    showToast('花园里没有空地了');
    return;
  }
  state.dew -= DEW_COST_PLANT_ALL;
  save();
  showToast(def.autoGrow
    ? `灵露种下 ${count} 处${def.label} · 免浇水自长`
    : `灵露种下 ${count} 处${def.label} · 记得浇水`);
  renderDewPool();
  if (document.getElementById('panel-garden')?.classList.contains('open')) renderGarden();
}

function dewHarvestAllGarden() {
  syncAllGardenGrowth(false);
  if (state.dew < DEW_COST_HARVEST_ALL) {
    showToast('露水不够');
    return;
  }
  let count = 0;
  let coins = 0;
  let dewGain = 0;
  state.plots.forEach(p => {
    if (!p.plant || p.stage < 3) return;
    if (plantHasFruit(p.plant)) {
      if (pickFruitFromPlot(p, true)) count += 1;
      return;
    }
    const def = PLANTS[p.plant];
    coins += applyHarvestCoins(def.coin);
    dewGain += def.dew;
    count += 1;
    addShopStockFromHarvest(p.plant);
    clearPlot(p);
  });
  if (!count) {
    showToast('没有可收获的或待采的果实');
    return;
  }
  state.dew -= DEW_COST_HARVEST_ALL;
  if (coins > 0 || dewGain > 0) {
    state.dew += dewGain;
    state.coins += coins;
    state.harvestTotal += count;
    state.dewTotalEarned += dewGain;
  }
  save();
  GameAudio.play('harvest');
  showToast(coins > 0 ? `收获全场 ${count} 处 · +${coins} 金币` : `采了 ${count} 个果实 · 地都空啦`);
  tryUnlockPond();
  tryUnlockDewPool();
  tryUnlockShop();
  tryUnlockBird();
  tryUnlockFruitshop();
  renderDewPool();
  if (document.getElementById('panel-garden')?.classList.contains('open')) renderGarden();
}

function pickShopOrderType() {
  const total = SHOP_ORDER_WEIGHTS.reduce((sum, item) => sum + item.w, 0);
  let roll = Math.random() * total;
  for (const item of SHOP_ORDER_WEIGHTS) {
    roll -= item.w;
    if (roll <= 0) return item.type;
  }
  return 'flower';
}

function canFulfillShopOrder(type) {
  const order = SHOP_ORDERS[type];
  if (!order) return false;
  return Object.entries(order.stock).every(([key, need]) => (state.shopStock[key] || 0) >= need);
}

function deductShopOrderStock(type) {
  const order = SHOP_ORDERS[type];
  if (!order) return;
  Object.entries(order.stock).forEach(([key, need]) => {
    state.shopStock[key] = Math.max(0, (state.shopStock[key] || 0) - need);
  });
}

function spawnShopVisitor() {
  spawnShopVisitorAt(Date.now());
}

function getShopVisitorWaitLeftSec() {
  if (!state.shopVisitor) return 0;
  const left = SHOP_VISITOR_WAIT_MS - (Date.now() - state.shopVisitor.at);
  return Math.max(0, Math.ceil(left / 1000));
}

function getShopNextVisitorSec() {
  if (state.shopVisitor) return 0;
  const left = SHOP_VISITOR_INTERVAL_MS - (Date.now() - (state.lastShopVisitorAt || 0));
  return Math.max(0, Math.ceil(left / 1000));
}

function tickShopVisitors() {
  if (!state.shopUnlocked) return;
  const now = Date.now();
  let changed = false;
  if (state.shopVisitor && now - state.shopVisitor.at >= SHOP_VISITOR_WAIT_MS) {
    state.shopVisitor = null;
    state.lastShopVisitorAt = now;
    changed = true;
    showToast('客人等太久，走了');
  } else if (!state.shopVisitor && now - (state.lastShopVisitorAt || 0) >= SHOP_VISITOR_INTERVAL_MS) {
    spawnShopVisitor();
    changed = true;
    if (document.getElementById('panel-shop')?.classList.contains('open')) {
      showToast('有客人上门啦');
    }
  }
  if (changed) save();
  if (document.getElementById('panel-shop')?.classList.contains('open')) {
    renderShop();
  }
}

function serveShopVisitor() {
  const visitor = state.shopVisitor;
  if (!visitor) {
    showToast('还没有客人');
    return;
  }
  if (!canFulfillShopOrder(visitor.type)) {
    showToast('花材不够，客人还在等');
    return;
  }
  const order = SHOP_ORDERS[visitor.type];
  deductShopOrderStock(visitor.type);
  state.coins += order.price;
  state.shopSoldTotal += 1;
  state.shopVisitor = null;
  state.lastShopVisitorAt = Date.now();
  bumpDailyCommission('sell');
  save();
  GameAudio.play('sell');
  showToast(`${order.label}卖出 · +${order.price} 金币`);
  tryUnlockSeedshop();
  renderShop();
}

function renderShop() {
  const scene = document.getElementById('shop-scene');
  if (scene && typeof GardenArt !== 'undefined') {
    scene.innerHTML = GardenArt.shopScene(state.shopStock);
  }
  const guestLayer = document.getElementById('shop-guest-layer');
  if (guestLayer && typeof GardenArt !== 'undefined') {
    guestLayer.innerHTML = state.shopVisitor
      ? GardenArt.shopGuest(state.shopVisitor.guest || 'cat')
      : '';
    guestLayer.classList.toggle('visible', !!state.shopVisitor);
  }
  const flowerStock = document.getElementById('shop-flower-stock');
  const treeStock = document.getElementById('shop-tree-stock');
  const sold = document.getElementById('shop-sold-total');
  const status = document.getElementById('shop-visitor-status');
  const order = document.getElementById('shop-visitor-order');
  const serveBtn = document.getElementById('shop-serve-btn');
  if (flowerStock) flowerStock.textContent = String(state.shopStock.flower || 0);
  if (treeStock) treeStock.textContent = String(state.shopStock.tree || 0);
  if (sold) {
    if (state.seedshopUnlocked) {
      sold.textContent = `累计售出 ${state.shopSoldTotal} 次 · 种子铺已开张`;
    } else {
      const seedLeft = Math.max(0, SEEDSHOP_UNLOCK_SOLD - state.shopSoldTotal);
      sold.textContent = `累计售出 ${state.shopSoldTotal} 次 · 距种子铺还差 ${seedLeft} 次（${state.shopSoldTotal}/${SEEDSHOP_UNLOCK_SOLD}）`;
    }
  }
  refreshShopHint();
  refreshSeedQuest();
  if (state.shopVisitor) {
    const def = SHOP_ORDERS[state.shopVisitor.type];
    const canServe = canFulfillShopOrder(state.shopVisitor.type);
    if (status) {
      const guestLabel = SHOP_GUEST_LABELS[state.shopVisitor.guest] || '客人';
      status.textContent = `${guestLabel}来了 · ${getShopVisitorWaitLeftSec()}s 后离开`;
    }
    if (order) {
      order.textContent = canServe
        ? `想要：${def.label} · ${def.price} 金币`
        : `想要：${def.label} · 花材不够，快去种`;
      order.classList.toggle('short', !canServe);
    }
    if (serveBtn) {
      serveBtn.textContent = `卖给客人 · ${def.price} 金币`;
      serveBtn.disabled = !canServe;
    }
  } else {
    const next = getShopNextVisitorSec();
    if (status) status.textContent = next > 0 ? `等待客人… · ${next}s 后可能上门` : '等待客人上门…';
    if (order) {
      order.textContent = '有花材时客人才会买';
      order.classList.remove('short');
    }
    if (serveBtn) {
      serveBtn.textContent = '卖给客人';
      serveBtn.disabled = true;
    }
  }
  refreshWallet();
}

function dewWaterAllGarden() {
  if (state.dew < DEW_COST_WATER_ALL) {
    showToast('露水不够');
    return;
  }
  let any = false;
  state.plots.forEach(p => {
    if (!p.plant || p.stage <= 0 || p.stage >= 3 || p.wet || plantAutoGrow(p.plant)) return;
    p.wet = true;
    p.waterAt = Date.now();
    any = true;
  });
  if (!any) {
    showToast('花园里没有需要浇水的');
    return;
  }
  state.dew -= DEW_COST_WATER_ALL;
  save();
  showToast('灵露洒向全场花园');
  renderDewPool();
  if (document.getElementById('panel-garden')?.classList.contains('open')) renderGarden();
}

function dewBoostGrow() {
  if (state.dew < DEW_COST_BOOST) {
    showToast('露水不够');
    return;
  }
  let any = false;
  state.plots.forEach(p => {
    if (!p.plant || p.stage <= 0 || p.stage >= 3 || !p.wet || !p.waterAt) return;
    const grow = PLANTS[p.plant].growMs;
    const left = grow - (Date.now() - p.waterAt);
    if (left <= 500) return;
    p.waterAt = Date.now() - (grow - left * 0.5);
    any = true;
  });
  tickGardenGrowth();
  if (!any) {
    showToast('没有正在生长的植物');
    return;
  }
  state.dew -= DEW_COST_BOOST;
  save();
  showToast('催露生长 · 倒计时减半');
  renderDewPool();
  if (document.getElementById('panel-garden')?.classList.contains('open')) renderGarden();
}

function dewNourishAll() {
  if (state.dew < DEW_COST_NOURISH) {
    showToast('露水不够');
    return;
  }
  let any = false;
  state.fish.forEach(f => {
    f.hunger = Math.min(100, Math.round(Number(f.hunger) || 0) + 25);
    any = true;
  });
  state.insectSlots.forEach(s => {
    if (!s.insect) return;
    s.hunger = Math.min(100, Math.round(Number(s.hunger) || 0) + 25);
    any = true;
  });
  if (!any) {
    showToast('还没有鱼或虫可以滋养');
    return;
  }
  state.dew -= DEW_COST_NOURISH;
  save();
  showToast('灵露滋养鱼与虫');
  renderDewPool();
}

function upgradeDewPool() {
  const lv = state.dewPoolLevel;
  if (lv >= 3) return;
  const cost = DEW_UPGRADE_COSTS[lv];
  if (state.dew < cost) {
    showToast('露水不够');
    return;
  }
  state.dew -= cost;
  state.dewPoolLevel += 1;
  state.lastDewCondense = Date.now();
  save();
  showToast(`露水池升到 Lv.${state.dewPoolLevel}`);
  renderDewPool();
}

function tryUnlockBugcatch() {
  if (state.bugcatchUnlocked) return;
  if (countInsects() >= BUGCATCH_UNLOCK_INSECTS) {
    state.bugcatchUnlocked = true;
    save();
    showToast('捉虫大赛解锁！');
    refreshBugcatchTab();
  }
}

function tryUnlockSeedshop() {
  if (state.seedshopUnlocked) return;
  if (state.shopSoldTotal >= SEEDSHOP_UNLOCK_SOLD) {
    state.seedshopUnlocked = true;
    save();
    showToast('种子铺开张啦！');
    refreshSeedshopTab();
  }
}

function tryUnlockSeedshop() {
  if (state.seedshopUnlocked) return;
  if (state.shopSoldTotal >= SEEDSHOP_UNLOCK_SOLD) {
    state.seedshopUnlocked = true;
    save();
    showToast('种子铺开张啦！');
    refreshSeedshopTab();
  }
}

function tryUnlockFruitshop() {
  if (state.fruitshopUnlocked) return;
  if (state.fruitPickTotal >= FRUITSHOP_UNLOCK_PICKS) {
    state.fruitshopUnlocked = true;
    save();
    showToast('水果铺开张啦！');
    refreshFruitshopTab();
  }
}

function refreshFruitshopTab() {
  const tab = document.getElementById('tab-fruitshop');
  if (!tab) return;
  tab.disabled = !state.fruitshopUnlocked;
  tab.title = state.fruitshopUnlocked ? '水果铺' : `采摘 ${FRUITSHOP_UNLOCK_PICKS} 个果实解锁`;
}

function renderFruitshop() {
  const scene = document.getElementById('fruitshop-scene');
  if (scene && typeof GardenArt !== 'undefined') scene.innerHTML = GardenArt.fruitshopScene();
  const list = document.getElementById('fruitshop-list');
  const total = document.getElementById('fruit-sold-total');
  const stock = document.getElementById('fruit-stock-summary');
  if (total) total.textContent = `累计卖出 ${state.fruitSoldTotal} 个果实`;
  const keys = getFruitKeys();
  let totalCount = 0;
  keys.forEach(k => { totalCount += state.fruitInventory[k] || 0; });
  if (stock) {
    stock.textContent = totalCount > 0 ? `篮子里 ${totalCount} 个果实` : '篮子里还没有果实 · 去花园采吧';
  }
  if (!list) return;
  list.innerHTML = keys.map(key => {
    const meta = getFruitMeta(key);
    const count = state.fruitInventory[key] || 0;
    return `<div class="fruitshop-row${count <= 0 ? ' empty' : ''}">
      <span class="fruitshop-row-icon">${typeof GardenArt !== 'undefined' ? GardenArt.fruitIcon(key) : ''}</span>
      <span class="fruitshop-row-info">
        <strong>${meta.label}</strong>
        <em>库存 ${count} · ${meta.sellPrice} 金币/个</em>
      </span>
      <button type="button" class="fruitshop-sell-one" data-fruit="${key}" ${count <= 0 ? 'disabled' : ''}>卖1</button>
      <button type="button" class="fruitshop-sell-all" data-fruit="${key}" ${count <= 0 ? 'disabled' : ''}>全卖</button>
    </div>`;
  }).join('');
  list.querySelectorAll('.fruitshop-sell-one').forEach(btn => {
    btn.addEventListener('click', () => sellFruit(btn.dataset.fruit, 1));
  });
  list.querySelectorAll('.fruitshop-sell-all').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.fruit;
      sellFruit(key, state.fruitInventory[key] || 0);
    });
  });
  refreshWallet();
}

function sellFruit(fruitKey, amount) {
  const count = state.fruitInventory[fruitKey] || 0;
  const sell = Math.min(amount, count);
  if (sell <= 0) {
    showToast('没有这个水果');
    return;
  }
  const meta = getFruitMeta(fruitKey);
  const gain = sell * meta.sellPrice;
  state.fruitInventory[fruitKey] = count - sell;
  state.coins += gain;
  state.fruitSoldTotal += sell;
  save();
  GameAudio.play('sell');
  showToast(`卖出 ${sell} 个${meta.label} · +${gain} 金币`);
  renderFruitshop();
  refreshWallet();
}

function tryUnlockBird() {
  if (state.birdUnlocked) return;
  if (state.harvestTotal >= BIRD_UNLOCK_HARVESTS) {
    state.birdUnlocked = true;
    save();
    showToast('鸟架搭好了！');
    refreshBirdTab();
  }
}

function tryUnlockRain() {
  if (state.rainUnlocked) return;
  if (state.dewPoolUnlocked) {
    state.rainUnlocked = true;
    if (!state.nextRainAt) state.nextRainAt = Date.now() + RAIN_INTERVAL_MS;
    save();
    showToast('雨棚区解锁 · 可以搭雨棚啦');
    refreshRainTab();
  }
}

function refreshBugcatchTab() {
  const tab = document.getElementById('tab-bugcatch');
  if (!tab) return;
  tab.disabled = !state.bugcatchUnlocked;
  tab.title = state.bugcatchUnlocked ? '捉虫大赛' : `养 ${BUGCATCH_UNLOCK_INSECTS} 只虫解锁`;
}

function refreshSeedQuest() {
  const root = document.getElementById('seed-quest');
  if (!root) return;
  if (state.seedshopUnlocked) {
    root.hidden = true;
    document.getElementById('manor-dock-toggle')?.classList.remove('tab-goal-pulse');
    const tab = document.getElementById('tab-seedshop');
    tab?.classList.remove('tab-goal-pulse');
    const label = tab?.querySelector('.tab-label');
    if (label) label.textContent = '种子铺';
    return;
  }
  root.hidden = false;
  const step1 = document.getElementById('seed-quest-step1');
  const step2 = document.getElementById('seed-quest-step2');
  const bar1 = document.getElementById('seed-quest-bar1');
  const bar2 = document.getElementById('seed-quest-bar2');
  const num1 = document.getElementById('seed-quest-num1');
  const num2 = document.getElementById('seed-quest-num2');
  const now = document.getElementById('seed-quest-now');
  const go = document.getElementById('seed-quest-go');

  const h1 = Math.min(state.harvestTotal, SHOP_UNLOCK_HARVESTS);
  const s2 = Math.min(state.shopSoldTotal, SEEDSHOP_UNLOCK_SOLD);

  if (num1) num1.textContent = `${h1}/${SHOP_UNLOCK_HARVESTS}`;
  if (bar1) bar1.style.width = `${(h1 / SHOP_UNLOCK_HARVESTS) * 100}%`;
  if (num2) num2.textContent = `${s2}/${SEEDSHOP_UNLOCK_SOLD}`;
  if (bar2) bar2.style.width = state.shopUnlocked ? `${(s2 / SEEDSHOP_UNLOCK_SOLD) * 100}%` : '0%';

  step1?.classList.toggle('done', state.shopUnlocked);
  step1?.classList.toggle('active', !state.shopUnlocked);
  step2?.classList.toggle('done', false);
  step2?.classList.toggle('active', state.shopUnlocked);

  if (now) {
    now.textContent = !state.shopUnlocked
      ? `现在就做：在下方花园种花、浇水，熟了点一下收获（${h1}/${SHOP_UNLOCK_HARVESTS}）`
      : `现在就做：点「去花房卖货」，有库存时按「卖给客人」（${s2}/${SEEDSHOP_UNLOCK_SOLD}）`;
  }
  if (go) go.hidden = !state.shopUnlocked;

  document.getElementById('manor-dock-toggle')?.classList.toggle(
    'tab-goal-pulse',
    state.shopUnlocked && !state.seedshopUnlocked
  );
  const tab = document.getElementById('tab-seedshop');
  if (tab) {
    tab.classList.toggle('tab-goal-pulse', state.shopUnlocked);
    const label = tab.querySelector('.tab-label');
    if (label) {
      label.textContent = state.shopUnlocked ? `种子铺 ${s2}/${SEEDSHOP_UNLOCK_SOLD}` : '种子铺 🔒';
    }
  }
  refreshManorDock();
}

function refreshSeedshopHint() {
  const hint = document.getElementById('seedshop-hint');
  if (!hint) return;
  if (state.seedshopUnlocked) {
    hint.textContent = '用金币买稀有种子 · 买到的会进花园上方种子栏 · 刷新也不会丢';
    return;
  }
  if (!state.shopUnlocked) {
    hint.textContent = `先在花园累计收获 ${SHOP_UNLOCK_HARVESTS} 次开花房，再在花房卖 ${SEEDSHOP_UNLOCK_SOLD} 次才能进种子铺`;
    return;
  }
  const left = Math.max(0, SEEDSHOP_UNLOCK_SOLD - state.shopSoldTotal);
  hint.textContent = left > 0
    ? `花房再卖 ${left} 次就开张（已卖 ${state.shopSoldTotal}/${SEEDSHOP_UNLOCK_SOLD}）· 买稀有种子回花园种`
    : '花房卖够次数了 · 刷新后种子铺会亮起来';
}

function refreshShopHint() {
  const hint = document.getElementById('shop-hint');
  if (!hint) return;
  if (state.seedshopUnlocked) {
    hint.textContent = '花园收获会入库 · 客人上门 · 有货点「卖给客人」· 种子铺已开张';
    return;
  }
  const left = Math.max(0, SEEDSHOP_UNLOCK_SOLD - state.shopSoldTotal);
  hint.textContent = left > 0
    ? `花园收获会入库 · 卖给客人 · 累计卖满 ${SEEDSHOP_UNLOCK_SOLD} 次开种子铺（还差 ${left} 次）`
    : '花园收获会入库 · 卖给客人 · 种子铺即将开张';
}

function refreshSeedshopTab() {
  const tab = document.getElementById('tab-seedshop');
  if (!tab) return;
  tab.disabled = !state.seedshopUnlocked;
  tab.title = state.seedshopUnlocked
    ? '种子铺 · 买稀有种子'
    : `花房卖出 ${SEEDSHOP_UNLOCK_SOLD} 次解锁（当前 ${state.shopSoldTotal}/${SEEDSHOP_UNLOCK_SOLD}）`;
  refreshSeedQuest();
  refreshSeedshopHint();
}

function refreshBirdTab() {
  const tab = document.getElementById('tab-bird');
  if (!tab) return;
  tab.disabled = !state.birdUnlocked;
  tab.title = state.birdUnlocked ? '鸟架' : `累计收获 ${BIRD_UNLOCK_HARVESTS} 次解锁`;
}

function refreshRainTab() {
  const tab = document.getElementById('tab-rain');
  if (!tab) return;
  tab.disabled = !state.rainUnlocked;
  tab.title = state.rainUnlocked ? '雨棚' : '露水池解锁后可用';
}

function ensureBugcatchFieldBg() {
  const field = document.getElementById('bugcatch-field');
  if (!field || field.querySelector('.bugcatch-field-bg')) return;
  const bg = document.createElement('div');
  bg.className = 'bugcatch-field-bg';
  if (typeof GardenArt !== 'undefined') {
    bg.innerHTML = GardenArt.bugcatchFieldScene();
  }
  field.prepend(bg);
}

function clearBugcatchBugs() {
  document.querySelectorAll('#bugcatch-field .bugcatch-bug').forEach(b => b.remove());
}

function renderBugcatch() {
  ensureBugcatchFieldBg();
  const best = document.getElementById('bugcatch-best');
  const score = document.getElementById('bugcatch-score');
  const time = document.getElementById('bugcatch-time');
  const btn = document.getElementById('bugcatch-start-btn');
  if (best) best.textContent = `最佳 ${state.bugcatchBest}`;
  if (score) score.textContent = `得分 ${bugcatchScore}`;
  if (time) time.textContent = bugcatchActive ? `${bugcatchTimeLeft}s` : `${BUGCATCH_DURATION_SEC}s`;
  if (btn) {
    btn.disabled = bugcatchActive;
    btn.textContent = bugcatchActive ? '捉虫进行中…' : '开始捉虫大赛';
  }
}

function spawnBugcatchBug() {
  const field = document.getElementById('bugcatch-field');
  if (!field || !bugcatchActive) return;
  const types = ['ladybug', 'butterfly', 'bee', 'caterpillar'];
  const species = types[Math.floor(Math.random() * types.length)];
  const bug = document.createElement('button');
  bug.type = 'button';
  bug.className = `bugcatch-bug bugcatch-move bugcatch-move-${species}`;
  const x0 = 8 + Math.random() * 74;
  const y0 = 12 + Math.random() * 66;
  let x1 = x0 + (Math.random() > 0.5 ? 1 : -1) * (18 + Math.random() * 28);
  let y1 = y0 + (Math.random() - 0.5) * 14;
  if (species === 'butterfly' || species === 'bee') {
    x1 = 8 + Math.random() * 74;
    y1 = 8 + Math.random() * 58;
  } else if (species === 'caterpillar') {
    x1 = x0 + (Math.random() > 0.5 ? 1 : -1) * (22 + Math.random() * 32);
    y1 = y0 + (Math.random() - 0.5) * 6;
  }
  x1 = Math.max(6, Math.min(92, x1));
  y1 = Math.max(8, Math.min(82, y1));
  const midX = (x0 + x1) / 2;
  const arcLift = species === 'caterpillar' ? 12 + Math.random() * 10 : 10 + Math.random() * 14;
  const midY = Math.max(6, Math.min(y0, y1) - arcLift);
  bug.style.left = `${x0}%`;
  bug.style.top = `${y0}%`;
  bug.style.setProperty('--bx0', `${x0}%`);
  bug.style.setProperty('--by0', `${y0}%`);
  bug.style.setProperty('--bx1', `${x1}%`);
  bug.style.setProperty('--by1', `${y1}%`);
  bug.style.setProperty('--bmx', `${midX}%`);
  bug.style.setProperty('--bmy', `${midY}%`);
  bug.style.setProperty('--move-dur', `${1.3 + Math.random() * 1.4}s`);
  if (x1 < x0 && species !== 'butterfly' && species !== 'bee') bug.classList.add('bugcatch-face-left');
  if (typeof GardenArt !== 'undefined') bug.innerHTML = GardenArt.insectSvg(species);
  bug.addEventListener('click', () => {
    if (!bugcatchActive) return;
    bugcatchScore += 1;
    state.coins += BUGCATCH_COIN;
    save();
    bug.classList.add('caught');
    setTimeout(() => bug.remove(), 180);
    renderBugcatch();
    refreshWallet();
  });
  field.appendChild(bug);
  setTimeout(() => bug.remove(), 2800);
}

function stopBugcatchGame() {
  bugcatchActive = false;
  clearInterval(bugcatchSpawnTimer);
  clearInterval(bugcatchTickTimer);
  bugcatchSpawnTimer = null;
  bugcatchTickTimer = null;
  const field = document.getElementById('bugcatch-field');
  if (field) clearBugcatchBugs();
  if (bugcatchScore > state.bugcatchBest) state.bugcatchBest = bugcatchScore;
  const gain = bugcatchScore * BUGCATCH_COIN;
  save();
  showToast(`捉虫结束 · 共 ${bugcatchScore} 只 · +${gain} 金币`);
  renderBugcatch();
  refreshWallet();
}

function startBugcatchGame() {
  if (bugcatchActive) return;
  bugcatchActive = true;
  bugcatchScore = 0;
  bugcatchTimeLeft = BUGCATCH_DURATION_SEC;
  const field = document.getElementById('bugcatch-field');
  if (field) clearBugcatchBugs();
  renderBugcatch();
  bugcatchSpawnTimer = setInterval(spawnBugcatchBug, BUGCATCH_SPAWN_MS);
  bugcatchTickTimer = setInterval(() => {
    bugcatchTimeLeft -= 1;
    renderBugcatch();
    if (bugcatchTimeLeft <= 0) stopBugcatchGame();
  }, 1000);
  spawnBugcatchBug();
}

function renderSeedshop() {
  refreshSeedshopHint();
  const scene = document.getElementById('seedshop-scene');
  if (scene && typeof GardenArt !== 'undefined') scene.innerHTML = GardenArt.seedshopScene();
  const list = document.getElementById('seedshop-list');
  if (!list) return;
  list.innerHTML = Object.keys(PLANTS).filter(k => PLANTS[k].shopPrice).sort((a, b) => PLANTS[a].shopPrice - PLANTS[b].shopPrice).map(key => {
    const def = PLANTS[key];
    const owned = state.unlockedSeeds.includes(key);
    return `<button type="button" class="seedshop-buy${owned ? ' owned' : ''}" data-seed="${key}" ${owned ? 'disabled' : ''}>
      <span class="seedshop-buy-icon">${typeof GardenArt !== 'undefined' ? GardenArt.seedIcon(key) : ''}</span>
      <span>${def.label}</span>
      <em>${owned ? '已拥有' : `${def.shopPrice} 金币 · 采${def.fruitLabel || '果'}${def.autoGrow ? ' · 免浇水' : ''}`}</em>
    </button>`;
  }).join('');
}

function buySeedFromShop(seedKey) {
  const def = PLANTS[seedKey];
  if (!def?.shopPrice) return;
  if (state.unlockedSeeds.includes(seedKey)) {
    showToast('已经买过了');
    return;
  }
  if (state.coins < def.shopPrice) {
    showToast('金币不够');
    return;
  }
  state.coins -= def.shopPrice;
  unlockSeedPermanent(seedKey, true);
  save();
  showToast(`买到${def.label}种子 · 已入种子库`);
  renderSeedshop();
  refreshSeedBar();
  refreshWallet();
  if (document.getElementById('panel-garden')?.classList.contains('open')) renderGarden();
}

function renderBird() {
  const scene = document.getElementById('bird-scene');
  if (scene && typeof GardenArt !== 'undefined') scene.innerHTML = GardenArt.birdPerchScene(!!state.birdGift);
  const layer = document.getElementById('bird-guest-layer');
  if (layer && typeof GardenArt !== 'undefined') {
    const hasBird = state.birdFoodUntil > Date.now() || state.birdGift;
    layer.innerHTML = hasBird ? GardenArt.birdGuest() : '';
    layer.classList.toggle('visible', hasBird);
  }
  const status = document.getElementById('bird-status');
  const feedBtn = document.getElementById('bird-feed-btn');
  const collectBtn = document.getElementById('bird-collect-btn');
  const foodLeft = Math.max(0, Math.ceil((state.birdFoodUntil - Date.now()) / 1000));
  if (status) {
    status.textContent = state.birdGift
      ? '小鸟留下了礼物！'
      : foodLeft > 0
        ? `鸟食剩余 ${foodLeft}s · 等小鸟飞来`
        : '撒鸟食引小鸟来';
  }
  if (feedBtn) feedBtn.disabled = state.coins < BIRD_FOOD_COST;
  if (collectBtn) collectBtn.disabled = !state.birdGift;
  refreshWallet();
}

function fillBirdFood() {
  if (state.coins < BIRD_FOOD_COST) {
    showToast('金币不够');
    return;
  }
  state.coins -= BIRD_FOOD_COST;
  state.birdFoodUntil = Date.now() + BIRD_FOOD_MS;
  state.lastBirdAt = Date.now();
  save();
  showToast('鸟食撒好啦');
  renderBird();
}

function tickBirds() {
  if (!state.birdUnlocked) return;
  const now = Date.now();
  if (state.birdGift) return;
  if (state.birdFoodUntil <= now) return;
  if (now - (state.lastBirdAt || 0) < BIRD_GIFT_WAIT_MS) return;
  state.lastBirdAt = now;
  const roll = Math.random();
  if (roll < 0.55) {
    state.birdGift = { coins: 8 + Math.floor(Math.random() * 10) };
  } else {
    const seeds = getAvailableSeeds();
    state.birdGift = { seed: seeds[Math.floor(Math.random() * seeds.length)] };
  }
  save();
  if (document.getElementById('panel-bird')?.classList.contains('open')) {
    renderBird();
    showToast('小鸟飞来啦！');
  }
}

function collectBirdGift() {
  if (!state.birdGift) return;
  GameAudio.play('coin');
  if (state.birdGift.coins) {
    state.coins += state.birdGift.coins;
    showToast(`收到 ${state.birdGift.coins} 金币`);
  } else if (state.birdGift.seed) {
    unlockSeedPermanent(state.birdGift.seed, true);
    showToast(`收到 ${PLANTS[state.birdGift.seed]?.label || '种子'} · 已入种子库`);
  }
  state.birdGift = null;
  save();
  renderBird();
  refreshWallet();
  refreshSeedBar();
  if (document.getElementById('panel-garden')?.classList.contains('open')) renderGarden();
  if (document.getElementById('panel-seedshop')?.classList.contains('open')) renderSeedshop();
}

function rainShelterWaterMs(level) {
  const lv = Math.min(RAIN_SHELTER_MAX_LEVEL, Math.max(0, level | 0));
  return RAIN_SHELTER_WATER_MS[lv] || 0;
}

function rainShelterEffectText(level) {
  const lv = Math.min(RAIN_SHELTER_MAX_LEVEL, Math.max(0, level | 0));
  const name = RAIN_SHELTER_NAMES[lv] || `Lv.${lv}`;
  if (lv <= 0) return '搭雨棚后，下雨可自动浇花园';
  if (lv === 1) return `${name} · 每场雨开始时自动浇水`;
  const sec = Math.round(rainShelterWaterMs(lv) / 1000);
  if (lv >= RAIN_SHELTER_MAX_LEVEL) {
    return `${name} · 下雨每 ${sec}s 自动浇水 · 雨停 +${RAIN_SHELTER_DEW_BONUS} 露水`;
  }
  return `${name} · 下雨每 ${sec}s 自动浇水`;
}

function onRainStart(now) {
  if (state.rainShelterLevel <= 0) return false;
  state.lastRainWaterAt = now;
  return applyRainWater();
}

function tickRainWaterDuringStorm(now) {
  const lv = state.rainShelterLevel;
  if (lv <= 1 || !state.raining) return false;
  const interval = rainShelterWaterMs(lv);
  if (!interval || now - (state.lastRainWaterAt || 0) < interval) return false;
  state.lastRainWaterAt = now;
  return applyRainWater();
}

function onRainEnd(silent = false) {
  if (state.rainShelterLevel < RAIN_SHELTER_MAX_LEVEL) return false;
  state.dew += RAIN_SHELTER_DEW_BONUS;
  state.dewTotalEarned += RAIN_SHELTER_DEW_BONUS;
  if (!silent) showToast(`花鱼雨苑 · 雨停凝露 +${RAIN_SHELTER_DEW_BONUS}`);
  return true;
}

function renderRain() {
  const scene = document.getElementById('rain-scene');
  if (scene && typeof GardenArt !== 'undefined') {
    scene.innerHTML = GardenArt.rainShelterScene(state.rainShelterLevel, state.raining);
  }
  const overlay = document.getElementById('rain-overlay');
  if (overlay) overlay.classList.toggle('active', state.raining);
  const status = document.getElementById('rain-status');
  const btn = document.getElementById('rain-upgrade-btn');
  const now = Date.now();
  const lv = state.rainShelterLevel;
  if (status) {
    if (state.raining) {
      const left = Math.max(0, Math.ceil((state.rainUntil - now) / 1000));
      status.textContent = lv > 0
        ? `下雨中 · ${left}s · ${rainShelterEffectText(lv)}`
        : `下雨中 · ${left}s · 快搭雨棚`;
    } else {
      const next = Math.max(0, Math.ceil((state.nextRainAt - now) / 1000));
      status.textContent = lv > 0
        ? `天气：晴 · 下次雨 ${next}s · ${RAIN_SHELTER_NAMES[lv]} Lv.${lv}`
        : `天气：晴 · 下次雨 ${next}s · ${rainShelterEffectText(0)}`;
    }
  }
  if (btn) {
    if (lv >= RAIN_SHELTER_MAX_LEVEL) {
      btn.textContent = `${RAIN_SHELTER_NAMES[lv]} · 已满级`;
      btn.disabled = true;
    } else {
      const cost = RAIN_SHELTER_COSTS[lv];
      const nextName = RAIN_SHELTER_NAMES[lv + 1];
      btn.textContent = lv <= 0 ? `搭${nextName} · ${cost} 金币` : `扩建为${nextName} · ${cost} 金币`;
      btn.disabled = state.coins < cost;
    }
  }
  refreshWallet();
}

function upgradeRainShelter() {
  const lv = state.rainShelterLevel;
  if (lv >= RAIN_SHELTER_MAX_LEVEL) return;
  const cost = RAIN_SHELTER_COSTS[lv];
  if (state.coins < cost) {
    showToast('金币不够');
    return;
  }
  state.coins -= cost;
  state.rainShelterLevel += 1;
  if (state.raining) onRainStart(Date.now());
  save();
  showToast(`${RAIN_SHELTER_NAMES[state.rainShelterLevel]} Lv.${state.rainShelterLevel}`);
  renderRain();
}

function applyRainWater() {
  let any = false;
  state.plots.forEach(p => {
    if (!p.plant || p.stage <= 0 || p.stage >= 3 || p.wet || plantAutoGrow(p.plant)) return;
    p.wet = true;
    p.waterAt = Date.now();
    any = true;
  });
  if (any) save();
}

function tickRain() {
  if (!state.rainUnlocked) return;
  const now = Date.now();
  if (state.raining) {
    tickRainWaterDuringStorm(now);
    if (now >= state.rainUntil) {
      state.raining = false;
      state.nextRainAt = now + RAIN_INTERVAL_MS;
      onRainEnd();
      save();
    }
  } else if (now >= state.nextRainAt) {
    state.raining = true;
    state.rainUntil = now + RAIN_DURATION_MS;
    onRainStart(now);
    save();
  }
  if (document.getElementById('panel-rain')?.classList.contains('open')) renderRain();
  if (document.getElementById('panel-garden')?.classList.contains('open') && state.raining) renderGarden();
}

const GameAudio = {
  ctx: null,
  musicOn: true,
  sfxOn: true,
  musicStarted: false,
  musicNodes: null,
  waterNodes: null,
  output: null,
  sfxBus: null,
  ambientBus: null,

  loadPrefs() {
    try {
      const p = JSON.parse(localStorage.getItem(AUDIO_PREFS_KEY) || '{}');
      this.musicOn = p.musicOn !== false;
      this.sfxOn = p.sfxOn !== false;
    } catch {
      this.musicOn = true;
      this.sfxOn = true;
    }
  },

  savePrefs() {
    try {
      localStorage.setItem(AUDIO_PREFS_KEY, JSON.stringify({
        musicOn: this.musicOn,
        sfxOn: this.sfxOn,
      }));
    } catch {}
  },

  init() {
    if (this.ctx) return;
    this.loadPrefs();
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.output = this.ctx.createGain();
      this.output.gain.value = 1;
      this.output.connect(this.ctx.destination);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 0.22;
      this.sfxFilter = this.ctx.createBiquadFilter();
      this.sfxFilter.type = 'lowpass';
      this.sfxFilter.frequency.value = 720;
      this.sfxFilter.Q.value = 0.25;
      this.sfxBus.connect(this.sfxFilter);
      this.sfxFilter.connect(this.output);
      this.ambientBus = this.ctx.createGain();
      this.ambientBus.gain.value = 0;
      this.ambientFilter = this.ctx.createBiquadFilter();
      this.ambientFilter.type = 'lowpass';
      this.ambientFilter.frequency.value = 480;
      this.ambientFilter.Q.value = 0.35;
      this.ambientBus.connect(this.ambientFilter);
      this.ambientFilter.connect(this.output);
      this.waterFxBus = this.ctx.createGain();
      this.waterFxBus.gain.value = 0.42;
      this.waterFxFilter = this.ctx.createBiquadFilter();
      this.waterFxFilter.type = 'lowpass';
      this.waterFxFilter.frequency.value = 3200;
      this.waterFxFilter.Q.value = 0.35;
      this.waterFxBus.connect(this.waterFxFilter);
      this.waterFxFilter.connect(this.output);
    } catch {}
  },

  async wake() {
    this.init();
    if (!this.ctx) return false;
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        return false;
      }
    }
    return this.ctx.state === 'running';
  },

  ensure() {
    this.wake();
  },

  stopWaterStreamNodes() {
    if (!this.waterNodes) return;
    this._clearWaterTimers();
    try {
      this.waterNodes.layerA?.source?.stop?.();
      this.waterNodes.layerB?.source?.stop?.();
      this.waterNodes.layerC?.source?.stop?.();
      this.waterNodes.lfos?.forEach(o => o?.stop?.());
    } catch {}
    ['layerA', 'layerB', 'layerC'].forEach(key => {
      if (this.waterNodes[key]) {
        Object.values(this.waterNodes[key]).forEach(node => {
          try { node?.disconnect?.(); } catch {}
        });
      }
    });
    try { this.waterNodes.mix?.disconnect?.(); } catch {}
    this.waterNodes.lfoNodes?.forEach(node => {
      try { node?.disconnect?.(); } catch {}
    });
    this.waterNodes = null;
    if (this.ambientBus) this.ambientBus.gain.value = 0;
  },

  _clearWaterTimers() {
    if (!this.waterNodes) return;
    ['gurgleTimer', 'bubbleTimer', 'fallTimer'].forEach(key => {
      if (this.waterNodes[key]) {
        clearTimeout(this.waterNodes[key]);
        this.waterNodes[key] = null;
      }
    });
  },

  _playWaterOneShot(buildBuffer, vol, filterSetup, useFxBus = true) {
    if (!this.ctx || !this.waterNodes) return;
    const dest = useFxBus ? this.waterFxBus : this.ambientBus;
    if (!dest) return;
    const { buffer, dur } = buildBuffer(this.ctx.sampleRate);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const g = this.ctx.createGain();
    g.gain.value = vol;
    src.connect(g);
    if (filterSetup) {
      const bp = this.ctx.createBiquadFilter();
      filterSetup(bp);
      g.connect(bp);
      bp.connect(dest);
    } else {
      g.connect(dest);
    }
    const t0 = this.ctx.currentTime;
    src.start(t0);
    src.stop(t0 + dur + 0.03);
  },

  _buildGurgleBuffer(sr) {
    const dur = 0.12 + Math.random() * 0.18;
    const n = Math.ceil(sr * dur);
    const data = new Float32Array(n);
    const glugCount = Math.random() < 0.5 ? 2 : 1;
    let lp = 0;
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const white = Math.random() * 2 - 1;
      lp = lp * 0.7 + white * 0.3;
      let mod = 0;
      for (let g = 0; g < glugCount; g++) {
        const tg = t - g * 0.07;
        if (tg <= 0) continue;
        const hz = 480 * Math.exp(-tg * 13) + 85;
        mod += Math.exp(-tg * 12) * (0.5 + 0.5 * Math.sin(tg * hz * Math.PI * 2));
      }
      const env = Math.exp(-t * 8) * (1 - Math.exp(-t * 55));
      data[i] = lp * mod * env * 0.48;
    }
    const buffer = this.ctx.createBuffer(1, n, sr);
    buffer.getChannelData(0).set(data);
    return { buffer, dur };
  },

  _buildBubblePopBuffer(sr) {
    const dur = 0.035 + Math.random() * 0.055;
    const n = Math.ceil(sr * dur);
    const data = new Float32Array(n);
    const f0 = 880 + Math.random() * 720;
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const attack = 1 - Math.exp(-t * 700);
      const decay = Math.exp(-t * 32);
      const env = attack * decay;
      const freq = f0 * Math.exp(-t * 18) + 140;
      const pop = Math.sin(t * freq * Math.PI * 2);
      const click = t < 0.005 ? (Math.random() * 2 - 1) * (1 - t / 0.005) * 0.28 : 0;
      data[i] = (pop * 0.82 + click) * env * 0.72;
    }
    const buffer = this.ctx.createBuffer(1, n, sr);
    buffer.getChannelData(0).set(data);
    return { buffer, dur };
  },

  _buildFallBuffer(sr) {
    const dur = 0.08 + Math.random() * 0.15;
    const n = Math.ceil(sr * dur);
    const data = new Float32Array(n);
    let lp = 0;
    for (let i = 0; i < n; i++) {
      const t = i / sr;
      const p = t / dur;
      const white = Math.random() * 2 - 1;
      const lpAlpha = 0.62 + p * 0.28;
      lp = lp * lpAlpha + white * (1 - lpAlpha);
      const env = Math.exp(-t * 11) * (1 - Math.exp(-t * 120)) * (1 - p * 0.25);
      data[i] = lp * env * 0.65;
    }
    const buffer = this.ctx.createBuffer(1, n, sr);
    buffer.getChannelData(0).set(data);
    return { buffer, dur };
  },

  _playWaterGurgle() {
    if (!this.waterNodes) return;
    this._playWaterOneShot(
      sr => this._buildGurgleBuffer(sr),
      0.009 + Math.random() * 0.007,
      bp => {
        bp.type = 'bandpass';
        bp.frequency.value = 180 + Math.random() * 160;
        bp.Q.value = 0.85;
      },
    );
  },

  _playWaterBubblePop() {
    if (!this.waterNodes) return;
    this._playWaterOneShot(
      sr => this._buildBubblePopBuffer(sr),
      0.014 + Math.random() * 0.01,
      bp => {
        bp.type = 'bandpass';
        bp.frequency.value = 680 + Math.random() * 520;
        bp.Q.value = 0.9;
      },
    );
  },

  _playWaterBubbleCluster() {
    if (!this.waterNodes) return;
    const n = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++) {
      setTimeout(() => this._playWaterBubblePop(), i * (55 + Math.random() * 95));
    }
  },

  _playWaterFall() {
    if (!this.waterNodes) return;
    this._playWaterOneShot(
      sr => this._buildFallBuffer(sr),
      0.006 + Math.random() * 0.005,
      bp => {
        bp.type = 'lowpass';
        bp.frequency.value = 520 + Math.random() * 280;
        bp.Q.value = 0.5;
      },
    );
  },

  _scheduleWaterGurgle() {
    if (!this.waterNodes) return;
    this.waterNodes.gurgleTimer = setTimeout(() => {
      if (!this.waterNodes) return;
      this._playWaterGurgle();
      if (Math.random() < 0.35) setTimeout(() => this._playWaterGurgle(), 90 + Math.random() * 120);
      this._scheduleWaterGurgle();
    }, 480 + Math.random() * 900);
  },

  _scheduleWaterBubble() {
    if (!this.waterNodes) return;
    this.waterNodes.bubbleTimer = setTimeout(() => {
      if (!this.waterNodes) return;
      if (Math.random() < 0.65) this._playWaterBubbleCluster();
      else this._playWaterBubblePop();
      this._scheduleWaterBubble();
    }, 110 + Math.random() * 260);
  },

  _scheduleWaterFall() {
    if (!this.waterNodes) return;
    this.waterNodes.fallTimer = setTimeout(() => {
      if (!this.waterNodes) return;
      this._playWaterFall();
      if (Math.random() < 0.4) setTimeout(() => this._playWaterFall(), 60 + Math.random() * 100);
      this._scheduleWaterFall();
    }, 700 + Math.random() * 1100);
  },

  _startWaterExtras() {
    this._playWaterBubbleCluster();
    setTimeout(() => { if (this.waterNodes) this._playWaterBubblePop(); }, 380);
    this._scheduleWaterGurgle();
    this._scheduleWaterBubble();
    this._scheduleWaterFall();
  },

  createNoiseBuffer(seconds = 2) {
    const sr = this.ctx.sampleRate;
    const len = Math.floor(sr * seconds);
    const buffer = this.ctx.createBuffer(1, len, sr);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  },

  _waterLfo(targetParam, center, depth, rate, type = 'sine') {
    targetParam.value = center;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = rate;
    const depthGain = this.ctx.createGain();
    depthGain.gain.value = depth;
    osc.connect(depthGain);
    depthGain.connect(targetParam);
    osc.start();
    return { osc, depthGain };
  },

  _waterLayer(seconds, baseLp, baseHp, baseGain) {
    const source = this.ctx.createBufferSource();
    source.buffer = this.createNoiseBuffer(seconds);
    source.loop = true;

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = baseHp;
    highpass.Q.value = 0.4;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = baseLp;
    lowpass.Q.value = 0.45;

    const gain = this.ctx.createGain();
    gain.gain.value = baseGain;

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gain);
    return { source, highpass, lowpass, gain };
  },

  startWaterStreamNodes() {
    if (!this.ctx) return false;
    this.stopWaterStreamNodes();

    const mix = this.ctx.createGain();
    mix.gain.value = 1;

    const layerA = this._waterLayer(2.1, 310, 175, 0.022);
    const layerB = this._waterLayer(2.7, 460, 210, 0.015);
    const layerC = this._waterLayer(1.6, 620, 270, 0.01);

    layerA.gain.connect(mix);
    layerB.gain.connect(mix);
    layerC.gain.connect(mix);
    mix.connect(this.ambientBus);

    const lfoNodes = [];
    const lfos = [];
    const track = (lfo) => {
      lfoNodes.push(lfo.depthGain, lfo.osc);
      lfos.push(lfo.osc);
    };

    track(this._waterLfo(layerA.lowpass.frequency, 300, 110, 0.32));
    track(this._waterLfo(layerA.gain.gain, 0.022, 0.0055, 0.55));
    track(this._waterLfo(layerA.highpass.frequency, 170, 35, 0.24));

    track(this._waterLfo(layerB.lowpass.frequency, 440, 135, 0.41));
    track(this._waterLfo(layerB.gain.gain, 0.015, 0.004, 0.68));
    track(this._waterLfo(layerB.highpass.frequency, 205, 32, 0.36));

    track(this._waterLfo(layerC.lowpass.frequency, 590, 160, 0.72));
    track(this._waterLfo(layerC.gain.gain, 0.01, 0.003, 0.85));

    track(this._waterLfo(mix.gain, 1, 0.1, 0.19));
    track(this._waterLfo(mix.gain, 1, 0.04, 0.74, 'triangle'));

    layerA.source.start();
    layerB.source.start();
    layerC.source.start();
    this.ambientBus.gain.value = 1.12;
    this.waterNodes = { mix, layerA, layerB, layerC, lfos, lfoNodes };
    this._startWaterExtras();
    return true;
  },

  async startWaterAmbient() {
    const ok = await this.wake();
    if (!ok) return false;
    if (this.waterNodes) return true;
    try {
      const started = this.startWaterStreamNodes();
      this.musicStarted = started;
      return started;
    } catch {
      this.musicStarted = false;
      return false;
    }
  },

  stopWaterAmbient() {
    this.stopWaterStreamNodes();
    this.musicStarted = false;
  },

  gardenChime(freq, dur, vol = 0.009, when = 0, type = 'triangle') {
    if (!this.ctx || !this.sfxBus) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.sfxBus);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  },

  gardenSwell(freqStart, freqEnd, dur, vol = 0.008, when = 0) {
    if (!this.ctx || !this.sfxBus) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freqStart, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 40), t0 + dur * 0.7);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.sfxBus);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  },

  play(name) {
    if (!this.sfxOn) return;
    this.wake().then(ok => {
      if (!ok) return;
      this._playSfx(name);
    });
  },

  _playSfx(name) {
    switch (name) {
      case 'plant':
        this.gardenSwell(180, 240, 0.22, 0.007);
        break;
      case 'water':
        this.gardenChime(520, 0.28, 0.008);
        this.gardenChime(390, 0.2, 0.005, 0.04);
        break;
      case 'harvest':
        this.gardenChime(392, 0.24, 0.008);
        this.gardenChime(494, 0.28, 0.006, 0.1);
        break;
      case 'fruit':
        this.gardenChime(440, 0.22, 0.007);
        this.gardenChime(554, 0.26, 0.006, 0.09);
        break;
      case 'sell':
        this.gardenChime(440, 0.2, 0.006);
        this.gardenChime(523, 0.24, 0.005, 0.08);
        break;
      case 'coin':
        this.gardenChime(587, 0.18, 0.006);
        break;
      case 'unlock':
        this.gardenChime(330, 0.22, 0.006);
        this.gardenChime(392, 0.26, 0.005, 0.12);
        this.gardenChime(494, 0.32, 0.005, 0.24);
        break;
      default:
        break;
    }
  },

  startMusic() {
    if (!this.musicOn) return;
    this.startWaterAmbient();
  },

  _startMusicNodes() {
    this.startWaterAmbient();
  },

  stopMusic() {
    this.stopWaterAmbient();
  },

  setMusic(on) {
    this.musicOn = on;
    this.savePrefs();
    if (!on) this.stopWaterAmbient();
    updateAudioButtons();
  },

  setSfx(on) {
    this.sfxOn = on;
    this.savePrefs();
    updateAudioButtons();
  },

  onUserGesture() {
    this.wake().then(ok => {
      if (ok && this.musicOn) this.startWaterAmbient();
    });
  },

  async resumeAll() {
    const ok = await this.wake();
    if (!ok) return;
    if (this.musicOn && !this.waterNodes) {
      await this.startWaterAmbient();
    }
  },
};

function updateAudioButtons() {
  const musicBtn = document.getElementById('btn-music-toggle');
  const sfxBtn = document.getElementById('btn-sfx-toggle');
  if (musicBtn) {
    musicBtn.classList.toggle('on', GameAudio.musicOn);
    musicBtn.setAttribute('aria-pressed', GameAudio.musicOn ? 'true' : 'false');
    musicBtn.textContent = GameAudio.musicOn ? '💧 流水声 · 开' : '💧 流水声 · 关';
    musicBtn.title = GameAudio.musicOn ? '点击关闭流水背景声' : '点击开启流水背景声';
  }
  if (sfxBtn) {
    sfxBtn.classList.toggle('on', GameAudio.sfxOn);
    sfxBtn.setAttribute('aria-pressed', GameAudio.sfxOn ? 'true' : 'false');
    sfxBtn.textContent = GameAudio.sfxOn ? '🔊 游戏音效 · 开' : '🔊 游戏音效 · 关';
    sfxBtn.title = GameAudio.sfxOn ? '点击关闭游戏音效' : '点击开启游戏音效';
  }
}

function formatAwayTime(ms) {
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec} 秒`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} 分钟`;
  const hr = Math.floor(min / 60);
  const remMin = min % 60;
  return remMin > 0 ? `${hr} 小时 ${remMin} 分钟` : `${hr} 小时`;
}

function takeOfflineSnapshot() {
  syncAllGardenGrowth(false);
  return {
    coins: state.coins,
    dew: state.dew,
    plotMature: state.plots.filter(p => p.plant && p.stage >= 3).length,
    plotGrowing: state.plots.filter(p => p.plant && p.stage > 0 && p.stage < 3).length,
    plotDry: state.plots.filter(p => {
      if (!p.plant || p.stage <= 0 || p.stage >= 3 || plantAutoGrow(p.plant)) return false;
      return !p.wet;
    }).length,
    shopVisitor: !!state.shopVisitor,
    birdGift: !!state.birdGift,
    fishHungry: state.fish.filter(f => f.hunger < 25).length,
    insectHungry: state.insectSlots.filter(s => s.insect && s.hunger < 25).length,
  };
}

function buildOfflineReport(before, after, elapsedMs) {
  const lines = [];
  const dewGained = after.dew - before.dew;
  const coinsGained = after.coins - before.coins;
  const newMature = after.plotMature - before.plotMature;

  if (newMature > 0) lines.push(`${newMature} 株植物已成熟，可以收获`);
  if (after.plotDry > 0) lines.push(`${after.plotDry} 块地干了，记得浇水`);
  if (dewGained > 0) lines.push(`露水池凝露 +${dewGained}`);
  if (coinsGained > 0) lines.push(`金币 +${coinsGained}`);
  if (after.shopVisitor && !before.shopVisitor) lines.push('花房有新客人上门');
  if (after.birdGift && !before.birdGift) lines.push('鸟架上有小鸟礼物');
  if (after.fishHungry > before.fishHungry) lines.push('鱼池里的鱼有点饿了');
  if (after.insectHungry > before.insectHungry) lines.push('叶丛里的小虫需要喂食');
  if (after.plotGrowing > 0 && newMature === 0 && lines.length < 3) {
    lines.push(`${after.plotGrowing} 株还在慢慢生长`);
  }
  if (!lines.length) lines.push('小院一切安好，等你来照料');

  return {
    elapsedMs,
    lines,
    show: elapsedMs >= OFFLINE_MIN_MS,
  };
}

function hideOfflineOverlay() {
  const overlay = document.getElementById('offline-overlay');
  overlay?.classList.add('hidden');
  overlay?.setAttribute('aria-hidden', 'true');
  overlay?.setAttribute('hidden', '');
}

function forceHideAllOverlays() {
  document.querySelectorAll('#offline-overlay, #tutorial-overlay, #tutorial-spot').forEach(el => {
    el.classList.add('hidden');
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('hidden', '');
  });
  hideTutorialOverlay();
  hideOfflineOverlay();
}

function showBootError(err) {
  const el = document.getElementById('boot-error');
  const msg = err?.message || String(err || '未知错误');
  if (el) {
    el.hidden = false;
    el.textContent = `游戏启动出错：${msg} · 请刷新页面（若仍不行，清除浏览器缓存）`;
  }
  console.error('[花鱼小院] boot failed', err);
}

function bindGardenControls() {
  const gardenPanel = document.getElementById('panel-garden');
  if (gardenPanel && gardenPanel.dataset.plotBound !== '1') {
    gardenPanel.dataset.plotBound = '1';
    const handlePlotTarget = (target, e) => {
      const plotBtn = target?.closest?.('.plot');
      if (!plotBtn || !gardenPanel.contains(plotBtn)) return false;
      const idx = Number(plotBtn.dataset.plotIdx);
      if (!Number.isFinite(idx)) return false;
      e?.preventDefault?.();
      onPlotClick(idx, plotBtn);
      return true;
    };
    gardenPanel.addEventListener('click', e => handlePlotTarget(e.target, e));
    gardenPanel.addEventListener('touchend', e => {
      if (handlePlotTarget(e.target, e)) e.preventDefault();
    }, { passive: false });
  }
}

function showOfflineSummary(report) {
  if (!report?.show) return;
  const brief = report.lines.slice(0, 2).join(' · ');
  showToast(`你离开${formatAwayTime(report.elapsedMs)} · ${brief}`);
}

function findTutorialPlotButton(mode) {
  const grid = document.getElementById('garden-grid');
  if (!grid) return null;
  const btns = [...grid.querySelectorAll('.plot')];
  if (mode === 'empty') {
    return btns.find((btn, idx) => {
      const plot = state.plots[idx];
      return plot && (!plot.plant || plot.stage <= 0);
    }) || btns[0];
  }
  if (mode === 'planted') {
    return btns.find((btn, idx) => {
      const plot = state.plots[idx];
      return plot && plot.plant && plot.stage > 0 && plot.stage < 3;
    }) || btns[0];
  }
  return btns[0] || null;
}

function hideTutorialOverlay() {
  const overlay = document.getElementById('tutorial-overlay');
  const spot = document.getElementById('tutorial-spot');
  const card = document.getElementById('tutorial-card');
  overlay?.classList.add('hidden');
  overlay?.setAttribute('aria-hidden', 'true');
  overlay?.setAttribute('hidden', '');
  spot?.classList.add('hidden');
  card?.classList.remove('positioned');
  const hint = document.getElementById('garden-hint');
  hint?.classList.remove('garden-hint-tutorial');
}

function positionTutorialUi(targetEl, centerCard) {
  const spot = document.getElementById('tutorial-spot');
  const card = document.getElementById('tutorial-card');
  if (!spot || !card) return;
  if (centerCard || !targetEl) {
    spot.classList.add('hidden');
    card.classList.remove('positioned');
    card.style.left = '50%';
    card.style.top = '50%';
    card.style.transform = 'translate(-50%, -50%)';
    return;
  }
  const r = targetEl.getBoundingClientRect();
  const pad = 10;
  spot.style.left = `${Math.max(8, r.left - pad)}px`;
  spot.style.top = `${Math.max(8, r.top - pad)}px`;
  spot.style.width = `${r.width + pad * 2}px`;
  spot.style.height = `${r.height + pad * 2}px`;
  spot.classList.remove('hidden');
  card.classList.add('positioned');
  card.style.transform = 'translateX(-50%)';
  card.style.left = '50%';
  card.style.top = 'auto';
  card.style.bottom = 'max(18px, env(safe-area-inset-bottom))';
  card.style.maxWidth = 'min(340px, calc(100vw - 24px))';
}

function updateTutorialStep() {
  if (state.tutorialComplete || state.tutorialStep === 'done') {
    hideTutorialOverlay();
    return;
  }
  const overlay = document.getElementById('tutorial-overlay');
  const text = document.getElementById('tutorial-text');
  const nextBtn = document.getElementById('tutorial-next-btn');
  if (!overlay || !text) return;

  overlay.classList.remove('hidden');
  overlay.removeAttribute('hidden');
  overlay.setAttribute('aria-hidden', 'false');

  if (state.tutorialStep === 'welcome') {
    text.textContent = '欢迎来到花鱼小院！从一粒种子开始：种花、浇水、收获，慢慢解锁鱼池、露水和更多玩法。';
    nextBtn.textContent = '开始';
    positionTutorialUi(null, true);
    return;
  }
  if (state.tutorialStep === 'plant') {
    text.textContent = '先点一块绿色空地，种下你的第一株花。（可随时跳过引导）';
    nextBtn.textContent = '好的';
    positionTutorialUi(findTutorialPlotButton('empty'), false);
    return;
  }
  if (state.tutorialStep === 'water') {
    text.textContent = '很好！现在点击这株花给它浇水。（点错了也没关系）';
    nextBtn.textContent = '明白';
    positionTutorialUi(findTutorialPlotButton('planted'), false);
    return;
  }
  if (state.tutorialStep === 'grow') {
    text.textContent = '等倒计时走完，再点一次就能收获金币和露水啦。';
    nextBtn.textContent = '我去等等';
    positionTutorialUi(findTutorialPlotButton('planted'), false);
    const hint = document.getElementById('garden-hint');
    hint?.classList.add('garden-hint-tutorial');
    return;
  }
  hideTutorialOverlay();
}

function restoreGardenHint() {
  const hint = document.getElementById('garden-hint');
  if (!hint) return;
  hint.classList.remove('garden-hint-tutorial');
  hint.textContent = '点一块空地就能免费种 · 不花金币 · 收获几次后再解锁鱼池等玩法';
}

function finishTutorial() {
  state.tutorialComplete = true;
  state.tutorialStep = 'done';
  save();
  hideTutorialOverlay();
  restoreGardenHint();
  showToast('引导完成 · 慢慢经营你的小院吧');
  GameAudio.play('unlock');
}

function skipTutorial() {
  state.tutorialComplete = true;
  state.tutorialStep = 'done';
  save();
  hideTutorialOverlay();
  restoreGardenHint();
  showToast('已跳过引导 · 随时可以在花园里摸索');
}

function beginTutorial() {
  if (state.tutorialComplete) return;
  if (state.activeTab !== 'garden') switchTab('garden');
  renderGarden();
  updateTutorialStep();
}

function onTutorialNextClick() {
  if (state.tutorialStep === 'welcome') {
    state.tutorialStep = 'plant';
    save();
    updateTutorialStep();
    return;
  }
  if (state.tutorialStep === 'grow') {
    hideTutorialOverlay();
    const hint = document.getElementById('garden-hint');
    if (hint) hint.textContent = '等植物成熟后点击收获 · 引导进行中';
    save();
    return;
  }
  updateTutorialStep();
}

function maybeAdvanceTutorial(action) {
  if (state.tutorialComplete) return;
  if (action === 'plant' && state.tutorialStep === 'plant') {
    state.tutorialStep = 'water';
    save();
    setTimeout(updateTutorialStep, 350);
  } else if (action === 'water' && state.tutorialStep === 'water') {
    state.tutorialStep = 'grow';
    save();
    setTimeout(updateTutorialStep, 350);
  } else if (action === 'harvest' && (state.tutorialStep === 'grow' || state.tutorialStep === 'water' || state.tutorialStep === 'plant')) {
    finishTutorial();
  }
}

function skipTutorialIfAlreadyPlaying() {
  if (state.tutorialComplete) return;
  const hasGarden = state.plots.some(p => p.plant && p.stage > 0);
  if (state.harvestTotal > 0 || hasGarden) {
    state.tutorialComplete = true;
    state.tutorialStep = 'done';
    save();
    hideTutorialOverlay();
    restoreGardenHint();
  }
}

function queueWelcomeFlows() {
  hideTutorialOverlay();
  hideOfflineOverlay();
  skipTutorialIfAlreadyPlaying();
  if (pendingOfflineReport?.show) {
    showOfflineSummary(pendingOfflineReport);
  }
  pendingOfflineReport = null;
}

function initUx() {
  forceHideAllOverlays();
  GameAudio.init();
  updateAudioButtons();

  document.getElementById('btn-music-toggle')?.addEventListener('click', async () => {
    await GameAudio.wake();
    const turningOn = !GameAudio.musicOn;
    GameAudio.setMusic(turningOn);
    if (turningOn) {
      const played = await GameAudio.startWaterAmbient();
      showToast(played ? '流水声已开启 · 留意听泡泡啵啵声' : '还听不到？请检查系统音量，或点一下屏幕再试');
    } else {
      showToast('流水声已关闭');
    }
  });
  document.getElementById('btn-sfx-toggle')?.addEventListener('click', async () => {
    const ok = await GameAudio.wake();
    const turningOn = !GameAudio.sfxOn;
    GameAudio.setSfx(turningOn);
    if (turningOn) {
      if (ok) GameAudio._playSfx('coin');
      showToast(ok ? '游戏音效已开启' : '还听不到？请检查系统音量');
    } else {
      showToast('游戏音效已关闭');
    }
  });
  document.getElementById('garden-help-btn')?.addEventListener('click', () => {
    GameAudio.onUserGesture();
    state.tutorialComplete = false;
    state.tutorialStep = 'welcome';
    save();
    beginTutorial();
  });
  document.getElementById('tutorial-next-btn')?.addEventListener('click', () => {
    GameAudio.onUserGesture();
    onTutorialNextClick();
  });
  document.getElementById('tutorial-skip-btn')?.addEventListener('click', () => {
    GameAudio.onUserGesture();
    skipTutorial();
  });

  const unlockAudio = () => GameAudio.onUserGesture();
  document.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('resize', () => {
    if (!state.tutorialComplete && state.tutorialStep !== 'done' && state.tutorialStep !== 'welcome') {
      updateTutorialStep();
    }
  });
}

function bootGame() {
  let loaded = false;
  try {
    load();
    loaded = true;
    ensurePlots();
    repairGardenIfBroken();
    bindUI();
    try {
      initStaticArt();
    } catch (err) {
      console.warn('[花鱼小院] initStaticArt failed', err);
    }
    setupAutoSave();
    initUx();
    renderGarden();
    renderDailyCommission();
    try {
      restoreActiveTab();
    } catch (err) {
      console.warn('[花鱼小院] restoreActiveTab failed', err);
      state.activeTab = 'garden';
      syncTabHighlight('garden');
    }
    if (state.layoutMode) {
      document.getElementById('btn-layout-mode')?.classList.add('active');
      document.getElementById('app')?.classList.add('layout-mode');
    } else {
      startTimers();
    }
    queueWelcomeFlows();
  } catch (err) {
    showBootError(err);
    try {
      bindUI();
      renderGarden();
    } catch {}
  } finally {
    if (loaded) {
      ensureUnlockedSeeds();
      writeSeedBackup();
      save();
    }
  }
}

bootGame();
