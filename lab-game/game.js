/**
 * 小小实验室 — 自由实验台（家庭安全级反应）
 */
const STORAGE_KEY = 'little_lab_v1';
const SECRETS_KEY = 'little_lab_secrets_v1';

const WATER_REAGENT_IDS = ['coldWater', 'warmWater', 'hotWater'];

const REAGENTS = {
  coldWater: { id: 'coldWater', name: '凉水', icon: '🧊', ph: 7, kind: 'liquid', isWater: true, tempLabel: '0~15°C' },
  warmWater: { id: 'warmWater', name: '常温水', icon: '💧', ph: 7, kind: 'liquid', isWater: true, pourTemp: 25, tempLabel: '约25°C' },
  hotWater: { id: 'hotWater', name: '热水', icon: '♨️', ph: 7, kind: 'liquid', isWater: true, pourTemp: 50, tempLabel: '约50°C' },
  vinegar: { id: 'vinegar', name: '醋', icon: '🍶', ph: 2.5, kind: 'liquid' },
  lemonJuice: { id: 'lemonJuice', name: '柠檬汁', icon: '🍋', ph: 2.2, kind: 'liquid' },
  cola: { id: 'cola', name: '可乐', icon: '🥤', ph: 2.8, kind: 'liquid' },
  limeWater: { id: 'limeWater', name: '澄清石灰水', icon: '🏺', ph: 12, kind: 'liquid', detectsCO2: true },
  h2o2: { id: 'h2o2', name: '双氧水', icon: '🫧', kind: 'liquid' },
  dishSoap: { id: 'dishSoap', name: '洗洁精', icon: '🧴', kind: 'liquid' },
  milk: { id: 'milk', name: '牛奶', icon: '🥛', kind: 'liquid' },
  tea: { id: 'tea', name: '茶水', icon: '🍵', kind: 'liquid' },
  honey: { id: 'honey', name: '蜂蜜水', icon: '🍯', kind: 'liquid' },
  eggWhite: { id: 'eggWhite', name: '蛋白', icon: '🥚', kind: 'liquid' },
  starch: { id: 'starch', name: '淀粉液', icon: '⚪', kind: 'liquid' },
  flourPaste: { id: 'flourPaste', name: '面粉糊', icon: '🌾', kind: 'liquid' },
  iodine: { id: 'iodine', name: '碘液', icon: '🟤', kind: 'liquid' },
  cabbageJuice: { id: 'cabbageJuice', name: '紫甘蓝汁', icon: '🟣', kind: 'liquid', indicator: true },
  litmus: { id: 'litmus', name: '石蕊液', icon: '🌺', kind: 'liquid', indicator: true },
  copperSulfate: { id: 'copperSulfate', name: '硫酸铜液', icon: '🟦', element: 'Cu', kind: 'liquid' },
  bakingSoda: { id: 'bakingSoda', name: '小苏打', icon: '🧂', element: 'Na', kind: 'solid' },
  bakingPowder: { id: 'bakingPowder', name: '泡打粉', icon: '🥧', kind: 'solid' },
  citricAcid: { id: 'citricAcid', name: '柠檬酸', icon: '🍊', kind: 'solid' },
  chalkPowder: { id: 'chalkPowder', name: '石粉笔末', icon: '🪨', kind: 'solid' },
  sugar: { id: 'sugar', name: '白糖', icon: '🍬', kind: 'solid' },
  salt: { id: 'salt', name: '食盐', icon: '🥄', element: 'Na', kind: 'solid' },
  ironNail: { id: 'ironNail', name: '铁钉', icon: '🔩', element: 'Fe', kind: 'solid' },
  copperCoin: { id: 'copperCoin', name: '铜片', icon: '🟠', element: 'Cu', kind: 'solid' },
  zincPlate: { id: 'zincPlate', name: '锌片', icon: '⚙️', element: 'Zn', kind: 'solid' },
  magnesium: { id: 'magnesium', name: '镁条', icon: '✨', element: 'Mg', kind: 'solid' },
  aluminum: { id: 'aluminum', name: '铝箔', icon: '📎', element: 'Al', kind: 'solid' },
  carbon: { id: 'carbon', name: '碳粉', icon: '⚫', element: 'C', kind: 'solid' },
  hydrogenGas: { id: 'hydrogenGas', name: '氢气', icon: '⚪', element: 'H', kind: 'gas' },
  oxygenGas: { id: 'oxygenGas', name: '氧气', icon: '💨', element: 'O', kind: 'gas' },
  nitrogenGas: { id: 'nitrogenGas', name: '氮气', icon: '🌫️', element: 'N', kind: 'gas' },
  sodaAsh: { id: 'sodaAsh', name: '食用碱', icon: '⚗️', element: 'Na', kind: 'solid' },
  phenolphthalein: { id: 'phenolphthalein', name: '酚酞', icon: '🩷', kind: 'liquid', indicator: true },
  ammonia: { id: 'ammonia', name: '氨水', icon: '☁️', ph: 11, kind: 'liquid' },
  sodaWater: { id: 'sodaWater', name: '苏打水', icon: '🫙', ph: 6, kind: 'liquid' },
  glycerin: { id: 'glycerin', name: '甘油', icon: '💧', kind: 'liquid' },
  appleJuice: { id: 'appleJuice', name: '苹果汁', icon: '🍎', ph: 3.4, kind: 'liquid' },
  soapWater: { id: 'soapWater', name: '肥皂水', icon: '🧼', ph: 9, kind: 'liquid' },
  ethanol: { id: 'ethanol', name: '酒精', icon: '🍶', kind: 'liquid' },
  marble: { id: 'marble', name: '大理石', icon: '🪨', kind: 'solid' },
  activatedCharcoal: { id: 'activatedCharcoal', name: '活性炭', icon: '⬛', kind: 'solid' },
  distilledWater: { id: 'distilledWater', name: '蒸馏水', icon: '💎', ph: 7, kind: 'liquid', productOnly: true },
  teaEssence: { id: 'teaEssence', name: '茶精华', icon: '🍵', kind: 'liquid', productOnly: true },
  lemonEssence: { id: 'lemonEssence', name: '柠檬精华', icon: '🍋', kind: 'liquid', productOnly: true },
  honeyEssence: { id: 'honeyEssence', name: '蜂蜜精华', icon: '🍯', kind: 'liquid', productOnly: true },
  herbEssence: { id: 'herbEssence', name: '植物精华', icon: '🌿', kind: 'liquid', productOnly: true },
  appleEssence: { id: 'appleEssence', name: '苹果精华', icon: '🍎', kind: 'liquid', productOnly: true },
};

const EXTRACTABLE = {
  tea: { essence: 'teaEssence', name: '茶精华' },
  lemonJuice: { essence: 'lemonEssence', name: '柠檬精华' },
  honey: { essence: 'honeyEssence', name: '蜂蜜精华' },
  cabbageJuice: { essence: 'herbEssence', name: '植物精华' },
  appleJuice: { essence: 'appleEssence', name: '苹果精华' },
};

const DISTILL_RECEIVER = 'tube';

const CONTAINER_IDS = ['beaker1', 'beaker2', 'flask', 'tube', 'cylinder', 'dish'];

const EQUIPMENT = [
  { id: 'burner', name: '酒精灯', icon: '🔥' },
  { id: 'dropper', name: '滴管', icon: '💧' },
  { id: 'stirRod', name: '玻璃棒', icon: '🥢' },
  { id: 'thermo', name: '温度计', icon: '🌡️' },
  { id: 'phPaper', name: 'pH试纸', icon: '📋' },
  { id: 'goggles', name: '护目镜', icon: '🥽' },
  { id: 'funnel', name: '漏斗', icon: '🔻' },
  { id: 'rack', name: '试管架', icon: '🗂️' },
  { id: 'wireGauze', name: '石棉网', icon: '🕸️' },
  { id: 'washBottle', name: '洗瓶', icon: '🍼' },
  { id: 'burette', name: '滴定管', icon: '📏' },
  { id: 'mortar', name: '研钵', icon: '🥣' },
  { id: 'filter', name: '滤纸', icon: '⭕' },
  { id: 'magnifier', name: '放大镜', icon: '🔍' },
  { id: 'gloves', name: '手套', icon: '🧤' },
  { id: 'tongs', name: '坩埚钳', icon: '🔧' },
  { id: 'distill', name: '蒸馏装置', icon: '⚗️' },
  { id: 'condenser', name: '冷凝管', icon: '🧊' },
  { id: 'sepFunnel', name: '分液漏斗', icon: '🫗' },
  { id: 'extractor', name: '提取器', icon: '✨' },
];
const MAX_VOLUME = 88;
const HEAT_RANGE_PX = 78;
const BURNER_W = 48;
const BURNER_H = 56;
const DEFAULT_BURNER_POS = { left: 10, bottom: 14 };
const VOLUME_WATER = 14;
const VOLUME_LIQUID = 18;
const VOLUME_SOLID = 12;

function emptyContents() {
  return {
    liquids: [],
    solids: [],
    gasCO2: 0,
    gasH2: 0,
    gasO2: 0,
    gasN2: 0,
    foam: 0,
    cloudy: false,
    starchBlue: false,
    fillPct: 0,
    volume: 0,
    waterDoses: 0,
    isFull: false,
    overflowing: false,
    bubbling: false,
    ironRusted: false,
    copperPatina: false,
    notedSalt: false,
    notedSugar: false,
    notedSugarIodine: false,
    notedBakingPowder: false,
    curdled: false,
    proteinDenatured: false,
    teaDark: false,
    zincReacted: false,
    notedFoamReaction: false,
    notedIndAcid: false,
    notedIndBase: false,
    notedBoil: false,
    notedEvaporating: false,
    magnesiumReacted: false,
    aluminumReacted: false,
    ironDisplaced: false,
    notedN2: false,
    notedGasMix: false,
    notedCarbon: false,
    notedSodaDissolve: false,
    notedCitricDissolve: false,
    notedLimeNeutral: false,
    saltMelted: false,
    notedSaltBubble: false,
    notedSaltWarmHint: false,
    lastWaterPourTemp: null,
    lastPourReagent: null,
    intenseBubbleUntil: 0,
    saltSplashUntil: 0,
    splashGen: 0,
    ground: false,
    phenPink: false,
    notedCharcoalTea: false,
    notedSodaAsh: false,
    notedMarble: false,
    notedAmmoniaNeutral: false,
    notedSodaWater: false,
    notedEthanol: false,
    notedPhenAcid: false,
    notedDistilling: false,
    notedRedistill: false,
    notedExtracted: false,
  };
}

function evaporateAllLiquids(id, c) {
  c.liquids = [];
  c.waterDoses = 0;
  c.gasCO2 = 0;
  c.gasH2 = 0;
  c.gasO2 = 0;
  c.gasN2 = 0;
  c.foam = 0;
  c.cloudy = false;
  c.starchBlue = false;
  c.curdled = false;
  c.proteinDenatured = false;
  c.teaDark = false;
  c.notedEvaporating = false;
  c.notedBoil = false;
  c.bubbling = false;
  c.color = null;
  c.isFull = false;

  if (c.solids.length) {
    c.volume = Math.max(8, Math.min(20, c.solids.length * 10));
    addLog(`${containerLabel(id)} 液体全部蒸干了，剩下固体。`, true);
  } else if (c.ironRusted || c.copperPatina || c.zincReacted) {
    c.volume = 12;
    addLog(`${containerLabel(id)} 液体蒸干了，金属还在里面。`, true);
  } else {
    c.volume = 0;
    addLog(`${containerLabel(id)} 液体全部蒸发干了！`, true);
    state.temps[id] = Math.max(30, getTemp(id) - 15);
  }
  updateFill(c);
}

const bubbleTimers = {};
const splashTimers = {};

function isWaterReagent(id) {
  return WATER_REAGENT_IDS.includes(id);
}

function waterPourTemp(id) {
  if (id === 'coldWater') return Math.floor(Math.random() * 16);
  const def = REAGENTS[id];
  return def?.pourTemp ?? 25;
}

function applyPourTemperature(containerId, pourTemp, volAdd) {
  const c = state.containers[containerId];
  const prev = getTemp(containerId);
  const volBefore = Math.max(0, (c.volume || 0) - volAdd);
  if (volBefore <= 0) {
    state.temps[containerId] = pourTemp;
    return;
  }
  state.temps[containerId] = Math.round((prev * volBefore + pourTemp * volAdd) / (volBefore + volAdd));
}

function hasAcid(c) {
  return c.liquids.includes('vinegar') || c.liquids.includes('lemonJuice')
    || c.liquids.includes('cola') || c.liquids.includes('appleJuice')
    || c.solids.includes('citricAcid');
}

function hasBaseSolid(c) {
  return c.solids.includes('bakingSoda') || c.solids.includes('chalkPowder')
    || c.solids.includes('sodaAsh');
}

function hasBaseLiquid(c) {
  return c.liquids.includes('limeWater') || c.liquids.includes('ammonia')
    || c.liquids.includes('soapWater');
}

function hasBase(c) {
  return hasBaseSolid(c) || hasBaseLiquid(c);
}

function hasStarchLike(c) {
  return c.liquids.includes('starch') || c.liquids.includes('flourPaste');
}

function acidLabel(c) {
  if (c.liquids.includes('lemonJuice')) return '柠檬汁';
  if (c.liquids.includes('appleJuice')) return '苹果汁';
  if (c.liquids.includes('cola')) return '可乐';
  if (c.solids.includes('citricAcid')) return '柠檬酸';
  return '醋';
}

function indicatorColor(contents) {
  if (hasAcid(contents) && hasBase(contents)) {
    return contents.liquids.includes('litmus') ? '#7e57c2' : '#7b1fa2';
  }
  if (contents.phenPink || (contents.liquids.includes('phenolphthalein') && hasBase(contents))) {
    return '#ec407a';
  }
  let ph = 7;
  if (hasAcid(contents)) ph = 3;
  if (hasBase(contents)) ph = 11;
  if (ph <= 4) return '#e91e63';
  if (ph >= 9) return '#00897b';
  return contents.liquids.includes('litmus') ? '#7e57c2' : '#7b1fa2';
}

const state = {
  selectedReagent: 'vinegar',
  waterPickerOpen: false,
  selectedContainer: 'beaker1',
  tubeConnected: false,
  transferSource: null,
  heatTarget: null,
  burnerPos: { ...DEFAULT_BURNER_POS },
  equip: {
    burnerOn: false,
    dropperMode: false,
    showThermo: false,
    gogglesOn: false,
    funnelMode: false,
    rackOn: true,
    wireGauzeOn: false,
    washBottleMode: false,
    buretteMode: false,
    glovesOn: false,
    distillOn: false,
    condenserOn: false,
    sepFunnelOn: false,
  },
  temps: {},
  containers: {
    beaker1: emptyContents(),
    beaker2: emptyContents(),
    flask: emptyContents(),
    tube: emptyContents(),
    cylinder: emptyContents(),
    dish: emptyContents(),
  },
  log: [],
  pourCount: 0,
  secrets: {
    rainbowFlame: false,
    nightLab: false,
    archiveWhisper: false,
    waterSpell: false,
    fullGear: false,
    cornerLamp: false,
    luckyPour: false,
    logEcho: false,
  },
  _titleClicks: 0,
  _logHeaderClicks: 0,
  _equipSeq: [],
  _equipSeqAt: 0,
  _keyBuf: '',
};

function getTemp(id) {
  return state.temps[id] ?? 25;
}

function loadSecrets() {
  try {
    const d = JSON.parse(localStorage.getItem(SECRETS_KEY));
    if (d && typeof d === 'object') {
      Object.keys(state.secrets).forEach(k => {
        if (typeof d[k] === 'boolean') state.secrets[k] = d[k];
      });
    }
  } catch {}
}

function saveSecrets() {
  try {
    localStorage.setItem(SECRETS_KEY, JSON.stringify({ ...state.secrets }));
  } catch {}
}

function unlockSecret(key, logMsg, toastMsg) {
  if (state.secrets[key]) return false;
  state.secrets[key] = true;
  saveSecrets();
  addLog(logMsg, true);
  showToast(toastMsg);
  applySecretEffects();
  return true;
}

function applySecretEffects() {
  const s = state.secrets;
  document.body.classList.toggle('night-lab', s.nightLab);
  document.body.classList.toggle('full-gear-lab', s.fullGear);
  const burner = document.getElementById('prop-burner');
  if (burner) {
    burner.classList.toggle('rainbow-flame', s.rainbowFlame);
    burner.classList.toggle('ghost-flame', s.cornerLamp);
  }
}

function trackEquipSequence(step) {
  const want = ['goggles', 'gloves', 'thermo'];
  const now = Date.now();
  if (now - state._equipSeqAt > 8000) state._equipSeq = [];
  state._equipSeqAt = now;
  state._equipSeq.push(step);
  if (state._equipSeq.length > 3) state._equipSeq.shift();
  if (state._equipSeq.length === 3 && state._equipSeq.every((v, i) => v === want[i])) {
    unlockSecret('fullGear', '护目镜→手套→温度计，按顺序穿戴完毕！实验室进入「全副武装」模式。', '🥽 全副武装');
    state._equipSeq = [];
  }
}

function checkBurnerCornerSecret() {
  if (!state.equip.burnerOn || state.secrets.cornerLamp) return;
  const bench = document.getElementById('bench');
  if (!bench) return;
  const br = bench.getBoundingClientRect();
  if (state.burnerPos.left > br.width * 0.58 && state.burnerPos.bottom > br.height * 0.52) {
    unlockSecret('cornerLamp', '燃着的灯被挪到角落…焰舌悄悄变成幽蓝色。', '🌌 幽蓝灯焰');
  }
}

function checkLuckyPourSecret() {
  if (state.pourCount === 42) {
    unlockSecret('luckyPour', '第四十二次加液！也许…这实验室里还有别的东西在等你发现。', '✨ 四十二');
  }
}

function bindSecretsUI() {
  const title = document.getElementById('lab-title');
  title?.addEventListener('click', () => {
    state._titleClicks += 1;
    clearTimeout(bindSecretsUI._titleT);
    bindSecretsUI._titleT = setTimeout(() => { state._titleClicks = 0; }, 1200);
    if (state._titleClicks >= 7) {
      state._titleClicks = 0;
      unlockSecret('rainbowFlame', '标题被点了七下…酒精灯焰忽然变成彩虹色！', '🌈 彩虹火焰');
    }
  });

  const sub = document.getElementById('lab-subtitle');
  sub?.addEventListener('dblclick', (e) => {
    e.preventDefault();
    unlockSecret('nightLab', '副标题连点两下…实验室灯光暗下来，像深夜还在做实验。', '🌙 夜实验室');
  });

  const saveEl = document.getElementById('save-status');
  if (saveEl) {
    let pressT = null;
    const clearPress = () => { clearTimeout(pressT); pressT = null; };
    saveEl.addEventListener('mousedown', () => {
      clearPress();
      pressT = setTimeout(() => {
        pressT = null;
        unlockSecret('archiveWhisper', '你长按了存档条…它悄悄说：继续实验吧，别停。', '📼 档案低语');
      }, 900);
    });
    saveEl.addEventListener('mouseup', clearPress);
    saveEl.addEventListener('mouseleave', clearPress);
    saveEl.addEventListener('touchstart', () => {
      clearPress();
      pressT = setTimeout(() => {
        pressT = null;
        unlockSecret('archiveWhisper', '你长按了存档条…它悄悄说：继续实验吧，别停。', '📼 档案低语');
      }, 900);
    }, { passive: true });
    saveEl.addEventListener('touchend', clearPress);
  }

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target && /input|textarea/i.test(e.target.tagName)) return;
    const ch = e.key.length === 1 ? e.key : '';
    if (!ch) return;
    state._keyBuf = (state._keyBuf + ch).slice(-3);
    if (state._keyBuf.toUpperCase() === 'H2O') {
      state._keyBuf = '';
      unlockSecret('waterSpell', '键盘敲出 H2O…试剂架上的水好像亮了一下。', '💧 水的咒语');
      document.body.classList.add('water-spell-flash');
      setTimeout(() => document.body.classList.remove('water-spell-flash'), 2400);
    }
  });

  const logHead = document.querySelector('#log-panel h2');
  logHead?.addEventListener('click', () => {
    state._logHeaderClicks += 1;
    clearTimeout(bindSecretsUI._logT);
    bindSecretsUI._logT = setTimeout(() => { state._logHeaderClicks = 0; }, 1500);
    if (state._logHeaderClicks >= 5) {
      state._logHeaderClicks = 0;
      unlockSecret('logEcho', '实验记录标题连点五下…最早的一条记录轻轻闪了闪。', '📜 记录回响');
      const list = document.getElementById('log-list');
      list?.classList.add('log-echo');
      setTimeout(() => list?.classList.remove('log-echo'), 2000);
    }
  });
}

const SOLUBLE_SOLIDS = new Set(['bakingSoda', 'citricAcid', 'sugar', 'salt', 'bakingPowder', 'sodaAsh']);
const INSOLUBLE_SOLIDS = new Set([
  'ironNail', 'copperCoin', 'zincPlate', 'magnesium', 'aluminum', 'carbon', 'chalkPowder',
  'marble', 'activatedCharcoal',
]);

function solidLabel(id) {
  return REAGENTS[id]?.name || id;
}

function hasDissolvedSolids(c) {
  return c.liquids.includes('water') && c.solids.some(s => SOLUBLE_SOLIDS.has(s));
}

function hasOnlyInsolubleSolidsInWater(c) {
  return c.liquids.includes('water') && c.solids.length > 0
    && !c.solids.some(s => SOLUBLE_SOLIDS.has(s));
}

function isDistillReady() {
  return state.equip.distillOn && state.equip.condenserOn && state.tubeConnected;
}

function containerHasWater(c) {
  return c.liquids.includes('water') || c.liquids.includes('distilledWater');
}

function tryDistill(fromId, toId) {
  if (!isDistillReady() || fromId !== 'flask') return false;
  const src = state.containers[fromId];
  const dst = state.containers[toId];
  if (src.liquids.includes('distilledWater') && !src.liquids.includes('water')) {
    if (!src.notedRedistill) {
      src.notedRedistill = true;
      addLog('已经是蒸馏水了，再蒸也不会更纯——只是又变成水蒸气跑掉，白白耗费热量。');
      showToast('💎 够纯啦，反复蒸没区别');
    }
    return false;
  }
  if (!src.liquids.includes('water')) return false;
  if (getTemp(fromId) < 95) return false;
  if (dst.isFull) {
    showToast('接收瓶满了，先倒掉一些');
    return false;
  }

  const transferVol = 7;
  src.volume = Math.max(0, src.volume - transferVol);
  dst.volume = Math.min(MAX_VOLUME, (dst.volume || 0) + transferVol);
  if (!dst.liquids.includes('distilledWater')) dst.liquids.push('distilledWater');
  dst.waterDoses = (dst.waterDoses || 0) + 1;

  if (src.volume <= 8) {
    src.liquids = src.liquids.filter(l => l !== 'water');
    src.waterDoses = Math.max(0, (src.waterDoses || 0) - 1);
  }
  if (src.volume <= 0 && !src.liquids.length && !src.solids.length) {
    src.volume = 0;
  }

  updateFill(src);
  updateFill(dst);

  if (!src.notedDistilling) {
    src.notedDistilling = true;
    addLog('蒸馏装置运转：锥形瓶里的水沸腾→水蒸气经冷凝管液化→流入试管，得到纯净蒸馏水！', true);
    showToast('💎 蒸馏水正在收集…');
  }
  dst.bubbling = true;
  return true;
}

function runExtraction(id) {
  const c = state.containers[id];
  if (!state.equip.sepFunnelOn) {
    showToast('先启用分液漏斗');
    return;
  }
  const sourceKey = Object.keys(EXTRACTABLE).find(k => c.liquids.includes(k));
  if (!sourceKey) {
    showToast('需要茶/果汁/蜂蜜等才能提取精华');
    return;
  }
  if (!c.liquids.includes('ethanol') && !c.liquids.includes('water')) {
    showToast('先加酒精或水作提取溶剂');
    return;
  }
  const info = EXTRACTABLE[sourceKey];
  if (c.liquids.includes(info.essence)) {
    showToast('精华已经提取过了');
    return;
  }
  c.liquids.push(info.essence);
  c.volume = Math.min(MAX_VOLUME, (c.volume || 0) + 10);
  c.notedExtracted = true;
  updateFill(c);
  addLog(`分液漏斗 + 提取器：从${REAGENTS[sourceKey].name}里分离出${info.name}！`, true);
  showToast(`✨ 提取到${info.name}`);
  resolveReactions(id);
  renderBench();
  persistLab();
}

function canTestPH(c) {
  if (c.liquids.some(l => l !== 'water' && l !== 'distilledWater')) return true;
  if (hasDissolvedSolids(c)) return true;
  if (c.liquids.includes('water') && !c.solids.length) return true;
  return false;
}

function computePH(c) {
  if (hasAcid(c) && hasBase(c)) return 7;
  if (hasAcid(c)) return 2.8;
  if (hasBase(c)) return 11.5;
  if (c.liquids.includes('sodaWater')) return 6.2;
  if (c.liquids.includes('water') && c.solids.includes('bakingSoda')) return 11.2;
  if (c.liquids.includes('water') && c.solids.includes('citricAcid')) return 3.2;
  if (c.liquids.includes('water') && c.solids.includes('bakingPowder')) return 8.5;
  if (hasDissolvedSolids(c)) return 7;
  if (c.liquids.includes('cabbageJuice') || c.liquids.includes('litmus')) return 7;
  return 7;
}

function phLabel(ph) {
  if (ph <= 3) return '强酸性';
  if (ph <= 6) return '弱酸性';
  if (ph <= 8) return '中性';
  if (ph <= 11) return '弱碱性';
  return '强碱性';
}

function mergeContainer(saved) {
  const base = emptyContents();
  if (!saved || typeof saved !== 'object') return base;
  return {
    ...base,
    ...saved,
    liquids: Array.isArray(saved.liquids) ? saved.liquids.slice() : [],
    solids: Array.isArray(saved.solids) ? saved.solids.slice() : [],
  };
}

function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    if (Array.isArray(d.log)) state.log = d.log.slice(-30);
    if (typeof d.pourCount === 'number') state.pourCount = d.pourCount;

    if (d.v >= 2) {
      if (d.selectedReagent) {
        if (d.selectedReagent === 'water') state.selectedReagent = 'warmWater';
        else if (REAGENTS[d.selectedReagent]) state.selectedReagent = d.selectedReagent;
      }
      if (d.selectedContainer && CONTAINER_IDS.includes(d.selectedContainer)) {
        state.selectedContainer = d.selectedContainer;
      }
      if (typeof d.tubeConnected === 'boolean') state.tubeConnected = d.tubeConnected;
      state.heatTarget = CONTAINER_IDS.includes(d.heatTarget) ? d.heatTarget : null;
      if (d.burnerPos && typeof d.burnerPos.left === 'number') {
        state.burnerPos = {
          left: d.burnerPos.left,
          bottom: typeof d.burnerPos.bottom === 'number' ? d.burnerPos.bottom : DEFAULT_BURNER_POS.bottom,
        };
      }
      state.transferSource = null;
      if (d.equip && typeof d.equip === 'object') {
        Object.assign(state.equip, d.equip);
      }
      if (d.temps && typeof d.temps === 'object') {
        CONTAINER_IDS.forEach(id => {
          if (typeof d.temps[id] === 'number') state.temps[id] = d.temps[id];
        });
      }
      if (d.containers && typeof d.containers === 'object') {
        CONTAINER_IDS.forEach(id => {
          if (d.containers[id]) state.containers[id] = mergeContainer(d.containers[id]);
        });
      }
      return true;
    }
    return !!(d.log && d.log.length);
  } catch {
    return false;
  }
}

function save() {
  try {
    const payload = {
      v: 2,
      savedAt: Date.now(),
      log: state.log.slice(-30),
      pourCount: state.pourCount,
      selectedReagent: state.selectedReagent,
      selectedContainer: state.selectedContainer,
      tubeConnected: state.tubeConnected,
      heatTarget: state.heatTarget,
      burnerPos: { ...state.burnerPos },
      equip: { ...state.equip },
      temps: { ...state.temps },
      containers: CONTAINER_IDS.reduce((acc, id) => {
        acc[id] = { ...state.containers[id] };
        return acc;
      }, {}),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    updateSaveIndicator();
  } catch {}
}

function persistLab() {
  clearTimeout(persistLab._t);
  persistLab._t = setTimeout(save, 400);
}

function updateSaveIndicator() {
  const el = document.getElementById('save-status');
  if (!el) return;
  const t = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  el.textContent = `💾 已存档 ${t}`;
}

function addLog(text, highlight = false) {
  const entry = { t: Date.now(), text, highlight };
  state.log.unshift(entry);
  if (state.log.length > 30) state.log.length = 30;
  renderLog();
  save();
}

function showToast(msg) {
  const el = document.getElementById('lab-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove('show'), 2400);
}

function blendHex(c1, c2, t) {
  const parse = (h) => {
    const n = parseInt(h.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const [r1, g1, b1] = parse(c1);
  const [r2, g2, b2] = parse(c2);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function getDilution(contents) {
  if (!contents.waterDoses) return 0;
  const solute = contents.liquids.filter(l => l !== 'water' && l !== 'distilledWater').length + contents.solids.length;
  if (solute === 0) return 1;
  return Math.min(0.92, contents.waterDoses / (solute * 1.8 + 0.5));
}

function mixColorRaw(contents) {
  if (contents.starchBlue) return '#1a237e';
  if (contents.teaDark) return '#212121';
  if (contents.copperPatina) return '#00838f';
  if (contents.ironRusted) return '#8d6e63';
  if (contents.curdled || contents.proteinDenatured) return '#efebe9';
  if (contents.cloudy) return '#eceff1';
  if (!contents.liquids.length && !contents.solids.length) return null;
  if (contents.phenPink) return '#f48fb1';
  if (contents.liquids.includes('cabbageJuice') || contents.liquids.includes('litmus')
    || contents.liquids.includes('phenolphthalein')) {
    return indicatorColor(contents);
  }
  if (contents.ironDisplaced) return '#6d4c41';
  if (contents.liquids.includes('copperSulfate')) return '#1976d2';
  if (contents.liquids.includes('iodine')) return '#4e342e';
  if (contents.liquids.includes('cola')) return '#4e342e';
  if (contents.liquids.includes('tea')) return '#795548';
  if (contents.liquids.includes('milk')) return '#fffde7';
  if (contents.liquids.includes('honey')) return '#ffb74d';
  if (contents.liquids.includes('eggWhite')) return '#fafafa';
  if (contents.liquids.includes('flourPaste')) return '#fff8e1';
  if (contents.notedLimeNeutral && hasAcid(contents) && contents.liquids.includes('limeWater')) {
    return '#e8f5e9';
  }
  if (contents.liquids.includes('limeWater')) return '#e0f7fa';
  if (contents.liquids.includes('ammonia')) return '#e8eaf6';
  if (contents.liquids.includes('soapWater')) return '#e0f2f1';
  if (contents.liquids.includes('sodaWater')) return '#e3f2fd';
  if (contents.liquids.includes('appleJuice')) return '#ffecb3';
  if (contents.liquids.includes('glycerin')) return '#fafafa';
  if (contents.liquids.includes('ethanol')) return '#f5f5f5';
  if (contents.liquids.includes('lemonJuice')) return '#fffde7';
  if (contents.liquids.includes('vinegar')) return '#fff8e1';
  if (contents.liquids.includes('h2o2')) return '#fafafa';
  if (contents.solids.includes('sugar') && contents.liquids.includes('water')) return '#fff9c4';
  if (contents.liquids.includes('distilledWater')) return '#e1f5fe';
  if (contents.liquids.includes('teaEssence')) return '#5d4037';
  if (contents.liquids.includes('lemonEssence')) return '#fff176';
  if (contents.liquids.includes('honeyEssence')) return '#ffca28';
  if (contents.liquids.includes('herbEssence')) return '#7b1fa2';
  if (contents.liquids.includes('appleEssence')) return '#ffb300';
  if (contents.liquids.length === 1 && contents.liquids[0] === 'water') return '#cfe8f6';
  return '#b3e5fc';
}

function mixColor(contents) {
  const base = mixColorRaw(contents);
  if (!base) return null;
  const dilution = getDilution(contents);
  if (dilution <= 0) return base;
  const clear = '#e8f4fc';
  const strength = contents.starchBlue ? 0.35 : 0.88;
  return blendHex(base, clear, dilution * strength);
}

function updateFill(contents) {
  if (typeof contents.volume !== 'number') {
    const n = contents.liquids.length + contents.solids.length;
    contents.volume = Math.min(MAX_VOLUME, 20 + n * 14 + (contents.gasCO2 > 0 ? 8 : 0));
  }
  contents.fillPct = Math.min(MAX_VOLUME, contents.volume);
  contents.isFull = contents.volume >= MAX_VOLUME;
}

function resolveReactions(id) {
  const c = state.containers[id];
  let changed = false;

  const hasSoda = c.solids.includes('bakingSoda');
  const hasSodaAsh = c.solids.includes('sodaAsh');
  const hasChalk = c.solids.includes('chalkPowder');
  const hasMarble = c.solids.includes('marble');
  const hasCitric = c.solids.includes('citricAcid');
  const hasIodine = c.liquids.includes('iodine');
  const hasH2O2 = c.liquids.includes('h2o2');
  const hasSoap = c.liquids.includes('dishSoap');
  const acidName = acidLabel(c);

  if (hasAcid(c) && hasSoda) {
    c.solids = c.solids.filter(s => s !== 'bakingSoda');
    if (hasCitric) c.solids = c.solids.filter(s => s !== 'citricAcid');
    if (!c.liquids.includes('water')) c.liquids.push('water');
    c.gasCO2 += c.liquids.includes('cola') ? 3 : 2.5;
    c.bubbling = true;
    addLog(`${acidName}遇到小苏打：剧烈冒泡！产生了二氧化碳气体。`, true);
    changed = true;
  }

  if (hasAcid(c) && hasChalk) {
    c.solids = c.solids.filter(s => s !== 'chalkPowder');
    if (!c.liquids.includes('water')) c.liquids.push('water');
    c.gasCO2 += 2;
    c.bubbling = true;
    addLog(`${acidName}遇到石粉笔末（碳酸钙）：冒泡产生二氧化碳！`, true);
    changed = true;
  }

  if (hasAcid(c) && hasMarble && !c.notedMarble) {
    c.notedMarble = true;
    c.solids = c.solids.filter(s => s !== 'marble');
    if (!c.liquids.includes('water')) c.liquids.push('water');
    c.gasCO2 += 2.2;
    c.bubbling = true;
    addLog(`${acidName}遇到大理石（碳酸钙）：冒泡产生二氧化碳！`, true);
    changed = true;
  }

  if (hasAcid(c) && hasSodaAsh) {
    c.solids = c.solids.filter(s => s !== 'sodaAsh');
    if (!c.liquids.includes('water')) c.liquids.push('water');
    c.gasCO2 += 2.8;
    c.bubbling = true;
    addLog(`${acidName}遇到食用碱：冒泡更猛，二氧化碳呼呼地出！`, true);
    changed = true;
  }

  if (hasAcid(c) && c.liquids.includes('ammonia') && !c.notedAmmoniaNeutral) {
    c.notedAmmoniaNeutral = true;
    addLog(`${acidName}遇到氨水：酸碱中和，刺激性气味变淡（虚拟实验）。`, true);
    changed = true;
  }

  if (hasAcid(c) && c.liquids.includes('limeWater') && !c.notedLimeNeutral) {
    c.notedLimeNeutral = true;
    addLog(`${acidName}遇到澄清石灰水：酸碱中和！生成盐和水，溶液变成中性（pH ≈ 7）。`, true);
    changed = true;
  }

  if (c.solids.includes('bakingPowder') && c.liquids.includes('water') && !c.notedBakingPowder) {
    c.notedBakingPowder = true;
    c.gasCO2 += 1.8;
    c.bubbling = true;
    addLog('泡打粉遇水：内置的小苏打和酸反应，冒出二氧化碳。', true);
    changed = true;
  }

  if (hasIodine && hasStarchLike(c) && !c.starchBlue) {
    c.starchBlue = true;
    const src = c.liquids.includes('flourPaste') ? '面粉糊' : '淀粉';
    addLog(`碘液遇到${src}：变成蓝黑色——这是检验淀粉的特征反应。`, true);
    changed = true;
  }

  if (hasIodine && c.solids.includes('sugar') && !c.notedSugarIodine) {
    c.notedSugarIodine = true;
    addLog('碘液遇糖：没有变蓝——只有淀粉才会变蓝黑色。');
    changed = true;
  }

  if (hasH2O2 && hasSoap && !c.notedFoamReaction) {
    c.notedFoamReaction = true;
    c.foam = Math.min(3, c.foam + 1);
    c.bubbling = true;
    addLog('双氧水 + 洗洁精：产生大量氧气，泡沫涌出来（简化版「大象牙膏」）。', true);
    changed = true;
  }

  if (c.liquids.includes('limeWater') && c.gasCO2 > 0.5) {
    if (!c.cloudy) {
      c.cloudy = true;
      addLog('二氧化碳通入澄清石灰水：溶液变浑浊，说明气体是 CO₂。', true);
      changed = true;
    }
  }

  if (c.solids.includes('ironNail') && hasAcid(c) && !c.ironRusted) {
    c.ironRusted = true;
    c.bubbling = true;
    addLog('铁钉放进酸里：铁和醋酸反应放出氢气，所以冒小泡；溶液慢慢变褐色。', true);
    changed = true;
  }

  if (c.solids.includes('copperCoin') && hasAcid(c) && !c.copperPatina) {
    c.copperPatina = true;
    addLog('铜片在酸溶液里：溶液慢慢变成蓝绿色（铜绿）。', true);
    changed = true;
  }

  if (c.solids.includes('zincPlate') && hasAcid(c) && !c.zincReacted) {
    c.zincReacted = true;
    c.bubbling = true;
    c.gasH2 = (c.gasH2 || 0) + 1;
    addLog('锌(Zn)在酸里：锌比铁更活泼，氢气冒泡更猛！', true);
    changed = true;
  }

  if (c.solids.includes('magnesium') && hasAcid(c) && !c.magnesiumReacted) {
    c.magnesiumReacted = true;
    c.bubbling = true;
    c.gasH2 = (c.gasH2 || 0) + 2;
    addLog('镁(Mg)在酸里：反应非常剧烈，大量氢气(H)冒出！', true);
    changed = true;
  }

  if (c.solids.includes('aluminum') && hasAcid(c) && !c.aluminumReacted) {
    c.aluminumReacted = true;
    c.bubbling = true;
    c.gasH2 = (c.gasH2 || 0) + 0.8;
    addLog('铝(Al)在酸里：表面生成氧化膜后慢慢冒氢气泡。', true);
    changed = true;
  }

  if (c.liquids.includes('copperSulfate') && c.solids.includes('ironNail') && !c.ironDisplaced) {
    c.ironDisplaced = true;
    c.bubbling = true;
    addLog('铁(Fe)放入硫酸铜(Cu)：铁置换出铜，溶液蓝色变浅！', true);
    changed = true;
  }

  if ((c.gasH2 || 0) > 0.5 && (c.gasO2 || 0) > 0.5 && !c.notedGasMix) {
    c.notedGasMix = true;
    addLog('氢(H)和氧(O)混在一起：点燃会生成水（虚拟实验不点火）。', true);
    changed = true;
  }

  if ((c.gasN2 || 0) > 0.5 && !c.notedN2) {
    c.notedN2 = true;
    addLog('氮(N)气化学性质很稳定，一般不易反应。');
    changed = true;
  }

  if (c.solids.includes('carbon') && hasAcid(c) && !c.notedCarbon) {
    c.notedCarbon = true;
    addLog('碳(C)粉与醋酸：常温下几乎不反应。');
    changed = true;
  }

  if (c.liquids.includes('milk') && hasAcid(c) && !c.curdled) {
    c.curdled = true;
    addLog('酸倒进牛奶：蛋白质凝固，出现白色絮状物（像豆腐脑）。', true);
    changed = true;
  }

  if (c.liquids.includes('eggWhite') && hasAcid(c) && !c.proteinDenatured) {
    c.proteinDenatured = true;
    c.cloudy = true;
    addLog('酸让蛋白变性凝固，溶液变浑浊，像煮熟的蛋白。', true);
    changed = true;
  }

  if (c.liquids.includes('tea') && c.solids.includes('ironNail') && !c.teaDark) {
    c.teaDark = true;
    addLog('茶水遇见铁：单宁和铁离子结合，变成深黑色。', true);
    changed = true;
  }

  if (c.liquids.includes('tea') && c.solids.includes('activatedCharcoal') && !c.notedCharcoalTea) {
    c.notedCharcoalTea = true;
    c.teaDark = false;
    addLog('活性炭吸附茶水里的色素，颜色明显变浅了。', true);
    changed = true;
  }

  if (c.liquids.includes('phenolphthalein') && hasBase(c) && !c.phenPink) {
    c.phenPink = true;
    addLog('酚酞遇碱：溶液变成粉红色！这是碱性的标志。', true);
    changed = true;
  }

  if (c.liquids.includes('sodaWater') && !c.notedSodaWater) {
    c.notedSodaWater = true;
    c.gasCO2 += 0.6;
    c.bubbling = true;
    addLog('苏打水本身含溶解的二氧化碳，打开就嘶嘶冒小泡。', true);
    changed = true;
  }

  if (c.liquids.includes('ethanol') && !c.notedEthanol) {
    c.notedEthanol = true;
    addLog('酒精易挥发，远离明火（虚拟实验不点火）。');
    changed = true;
  }

  if (c.saltMelted && c.liquids.includes('water') && !c.notedSaltBubble) {
    const coldPour = c.lastPourReagent === 'coldWater'
      || (typeof c.lastWaterPourTemp === 'number' && c.lastWaterPourTemp <= 15);
    if (coldPour) {
      c.notedSaltBubble = true;
      c.solids = c.solids.filter(s => s !== 'salt');
      c.saltMelted = false;
      c.saltSplashUntil = Date.now() + 650;
      c.splashGen = Date.now();
      c.intenseBubbleUntil = Date.now() + 4500;
      c.bubbling = true;
      c.foam = Math.min(3, (c.foam || 0) + 1.5);
      addLog('熔化的盐倒进冷水：溅了一下，接着咕嘟咕嘟猛冒泡泡！（真实操作要小心）', true);
      showToast('💦 溅！🫧 冒泡泡～');
      changed = true;
    } else if (!c.notedSaltWarmHint) {
      c.notedSaltWarmHint = true;
      c.bubbling = true;
      addLog('熔盐遇常温水/热水：只轻轻冒了点泡。要猛冒泡，得连点💧水选🧊凉水！');
      showToast('要用🧊凉水才猛冒泡！');
      changed = true;
    }
  }

  if (c.liquids.includes('water')) {
    if (c.solids.includes('salt') && !c.notedSalt && !c.saltMelted) {
      c.notedSalt = true;
      addLog('食盐在水里溶解了，变成了盐水。想试熔盐冒泡：先别加水，加热到熔化，再倒🧊凉水。');
      changed = true;
    }
    if (c.solids.includes('sugar') && !c.notedSugar) {
      c.notedSugar = true;
      addLog('白糖在水里溶解了，溶液略带甜黄色，可以测 pH。');
      changed = true;
    }
    if (c.solids.includes('bakingSoda') && !c.notedSodaDissolve) {
      c.notedSodaDissolve = true;
      addLog('小苏打溶于水呈弱碱性，可以测 pH。');
      changed = true;
    }
    if (c.solids.includes('citricAcid') && !c.notedCitricDissolve) {
      c.notedCitricDissolve = true;
      addLog('柠檬酸溶于水呈酸性，可以测 pH。');
      changed = true;
    }
    if (c.solids.includes('sodaAsh') && !c.notedSodaAsh) {
      c.notedSodaAsh = true;
      addLog(`食用碱${c.ground ? '（已研细）' : ''}溶于水呈碱性，可以测 pH。`);
      changed = true;
    }
  }

  if (c.liquids.includes('cabbageJuice') || c.liquids.includes('litmus')) {
    const indName = c.liquids.includes('litmus') ? '石蕊' : '紫甘蓝汁';
    if (hasAcid(c) && !c.notedIndAcid) {
      c.notedIndAcid = true;
      addLog(`${indName}遇酸变红：酸碱指示剂。`);
      changed = true;
    }
    if (hasBase(c) && !c.notedIndBase) {
      c.notedIndBase = true;
      addLog(`${indName}遇碱变蓝绿色。`);
      changed = true;
    }
  }

  if (c.liquids.includes('phenolphthalein') && hasAcid(c) && !c.notedPhenAcid) {
    c.notedPhenAcid = true;
    c.phenPink = false;
    addLog('酚酞遇酸：仍是无色。');
    changed = true;
  }

  updateFill(c);

  if (id === 'flask' && c.gasCO2 > 0) {
    c.balloonScale = Math.min(1.2, 0.35 + c.gasCO2 * 0.12);
  }

  if (changed) propagateGas(id);
  return changed;
}

function propagateGas(fromId) {
  const src = state.containers[fromId];
  if (src.gasCO2 < 0.3) return;

  if (state.tubeConnected && fromId === 'flask') {
    const tube = state.containers.tube;
    if (tube.liquids.includes('limeWater')) {
      tube.gasCO2 += src.gasCO2 * 0.4;
      src.gasCO2 *= 0.6;
      resolveReactions('tube');
    }
  }

  if (fromId === 'beaker1' || fromId === 'beaker2') {
    const other = fromId === 'beaker1' ? 'beaker2' : 'beaker1';
    const target = state.containers[other];
    if (target.liquids.includes('limeWater') && src.gasCO2 > 0.5) {
      target.gasCO2 += src.gasCO2 * 0.5;
      src.gasCO2 *= 0.5;
      resolveReactions(other);
      addLog('气体从邻近烧杯进入石灰水，石灰水变浑浊。');
    }
  }
}

function triggerOverflow(containerId) {
  const c = state.containers[containerId];
  c.overflowing = true;
  addLog(`${containerLabel(containerId)}满了，再倒溶液从杯口溢出来了！`, true);
  showToast('跑出来了！先倒掉一些再倒');
  renderBench();
  clearTimeout(triggerOverflow._t);
  triggerOverflow._t = setTimeout(() => {
    c.overflowing = false;
    renderBench();
  }, 1800);
}

function pourReagent(containerId, reagentId) {
  const def = REAGENTS[reagentId];
  const c = state.containers[containerId];
  if (!def) return;

  if (c.isFull) {
    triggerOverflow(containerId);
    return;
  }

  let repeatPour = false;
  let volAdd = 0;

  if (def.kind === 'liquid') {
    if (def.isWater) {
      c.waterDoses += 1;
      if (!c.liquids.includes('water')) c.liquids.push('water');
      volAdd = VOLUME_WATER;
      repeatPour = c.waterDoses > 1;
      if (state.equip.dropperMode) volAdd = Math.max(6, Math.round(volAdd * 0.5));
    } else {
      repeatPour = c.liquids.includes(reagentId);
      if (!repeatPour) c.liquids.push(reagentId);
      volAdd = VOLUME_LIQUID;
    }
  } else if (def.kind === 'gas') {
    if (reagentId === 'hydrogenGas') c.gasH2 = (c.gasH2 || 0) + 1.2;
    else if (reagentId === 'oxygenGas') c.gasO2 = (c.gasO2 || 0) + 1.2;
    else if (reagentId === 'nitrogenGas') c.gasN2 = (c.gasN2 || 0) + 1.2;
    volAdd = 8;
  } else {
    repeatPour = c.solids.includes(reagentId);
    if (!repeatPour) c.solids.push(reagentId);
    volAdd = VOLUME_SOLID;
  }

  if (state.equip.dropperMode && !def.isWater) {
    volAdd = Math.max(6, Math.round(volAdd * 0.5));
  }
  if (state.equip.buretteMode) {
    volAdd = Math.max(4, Math.round(volAdd * 0.35));
  }
  if (state.equip.washBottleMode && def.isWater) {
    volAdd = Math.round(volAdd * 1.15);
  }

  c.volume = Math.min(MAX_VOLUME, c.volume + volAdd);
  updateFill(c);

  let pourTemp = null;
  if (def.isWater) {
    pourTemp = waterPourTemp(reagentId);
    c.lastWaterPourTemp = pourTemp;
    c.lastPourReagent = reagentId;
    applyPourTemperature(containerId, pourTemp, volAdd);
  }

  state.pourCount += 1;
  checkLuckyPourSecret();
  let via = '';
  if (state.equip.dropperMode) via = '（滴管滴加）';
  else if (state.equip.buretteMode) via = '（滴定管精确滴加）';
  else if (state.equip.washBottleMode && def.isWater) via = '（洗瓶冲洗）';
  const tempNote = pourTemp != null ? `（${pourTemp}°C）` : '';
  if (def.isWater && repeatPour && containerHasStuff(c)) {
    addLog(`往${containerLabel(containerId)}里又加了${def.name}${tempNote}，溶液慢慢变稀、变清了。${via}`);
  } else if (repeatPour) {
    addLog(`往${containerLabel(containerId)}里又加了一些 ${def.name}${tempNote}。${via}`);
  } else {
    addLog(`往${containerLabel(containerId)}里加了 ${def.name}${tempNote}。${via}`);
  }

  resolveReactions(containerId);
  renderBench();
  save();
}

function containerLabel(id) {
  return {
    beaker1: '烧杯 A', beaker2: '烧杯 B', flask: '锥形瓶', tube: '试管',
    cylinder: '量筒', dish: '蒸发皿',
  }[id] || id;
}

function containerHasStuff(c) {
  return !!(c.liquids.length || c.solids.length || c.gasCO2 > 0 || c.gasH2 > 0
    || c.gasO2 > 0 || c.gasN2 > 0 || c.foam > 0 || c.cloudy || c.starchBlue
    || c.ironRusted || c.copperPatina || c.curdled || c.proteinDenatured || c.teaDark
    || c.zincReacted || c.magnesiumReacted || c.aluminumReacted || c.ironDisplaced);
}

function drainContainer(containerId) {
  const c = state.containers[containerId];
  if (!containerHasStuff(c)) {
    showToast(`${containerLabel(containerId)} 已经是空的`);
    return;
  }
  const drainAmt = 5;
  c.volume = Math.max(0, (c.volume || 0) - drainAmt);
  c.isFull = false;
  c.overflowing = false;
  if (c.gasCO2 > 0) c.gasCO2 = Math.max(0, c.gasCO2 - 0.1);
  updateFill(c);
  addLog(`从 ${containerLabel(containerId)} 倒出一点点（就一小口）。`);
  showToast(`${containerLabel(containerId)} 倒掉了一小口`);
  renderBench();
  save();
}

function emptyContainer(containerId) {
  const c = state.containers[containerId];
  if (!containerHasStuff(c)) {
    showToast(`${containerLabel(containerId)} 已经是空的`);
    return;
  }
  if (state.transferSource === containerId) cancelTransferSource();
  if (state.heatTarget === containerId) state.heatTarget = null;
  clearTimeout(bubbleTimers[containerId]);
  state.containers[containerId] = emptyContents();
  state.temps[containerId] = 25;
  addLog(`把 ${containerLabel(containerId)} 里的东西全部倒掉了。`);
  showToast(`${containerLabel(containerId)} 已全部倒掉`);
  renderBench();
  save();
}

function cancelTransferSource(silent = false) {
  state.transferSource = null;
  clearTimeout(cancelTransferSource._t);
  if (!silent) renderBench();
}

function mergeIntoContainer(target, source) {
  source.liquids.forEach(l => {
    if (!target.liquids.includes(l)) target.liquids.push(l);
  });
  source.solids.forEach(s => {
    if (!target.solids.includes(s)) target.solids.push(s);
  });
  target.waterDoses = (target.waterDoses || 0) + (source.waterDoses || 0);
  target.volume = (target.volume || 0) + (source.volume || 0);
  target.gasCO2 = (target.gasCO2 || 0) + (source.gasCO2 || 0);
  target.gasH2 = (target.gasH2 || 0) + (source.gasH2 || 0);
  target.gasO2 = (target.gasO2 || 0) + (source.gasO2 || 0);
  target.gasN2 = (target.gasN2 || 0) + (source.gasN2 || 0);
  target.foam = Math.max(target.foam || 0, source.foam || 0);
  target.cloudy = target.cloudy || source.cloudy;
  target.starchBlue = target.starchBlue || source.starchBlue;
  target.ironRusted = target.ironRusted || source.ironRusted;
  target.copperPatina = target.copperPatina || source.copperPatina;
  target.notedSalt = target.notedSalt || source.notedSalt;
  target.saltMelted = target.saltMelted || source.saltMelted;
  target.notedSaltBubble = target.notedSaltBubble || source.notedSaltBubble;
  target.notedSaltWarmHint = target.notedSaltWarmHint || source.notedSaltWarmHint;
  target.intenseBubbleUntil = Math.max(target.intenseBubbleUntil || 0, source.intenseBubbleUntil || 0);
  target.notedSugar = target.notedSugar || source.notedSugar;
  target.notedSugarIodine = target.notedSugarIodine || source.notedSugarIodine;
  target.notedBakingPowder = target.notedBakingPowder || source.notedBakingPowder;
  target.curdled = target.curdled || source.curdled;
  target.proteinDenatured = target.proteinDenatured || source.proteinDenatured;
  target.teaDark = target.teaDark || source.teaDark;
  target.zincReacted = target.zincReacted || source.zincReacted;
  target.notedFoamReaction = target.notedFoamReaction || source.notedFoamReaction;
  target.notedIndAcid = target.notedIndAcid || source.notedIndAcid;
  target.notedIndBase = target.notedIndBase || source.notedIndBase;
  target.notedBoil = target.notedBoil || source.notedBoil;
  target.notedEvaporating = target.notedEvaporating || source.notedEvaporating;
  target.magnesiumReacted = target.magnesiumReacted || source.magnesiumReacted;
  target.aluminumReacted = target.aluminumReacted || source.aluminumReacted;
  target.ironDisplaced = target.ironDisplaced || source.ironDisplaced;
  target.notedN2 = target.notedN2 || source.notedN2;
  target.notedGasMix = target.notedGasMix || source.notedGasMix;
  target.notedCarbon = target.notedCarbon || source.notedCarbon;
  target.notedSodaDissolve = target.notedSodaDissolve || source.notedSodaDissolve;
  target.notedCitricDissolve = target.notedCitricDissolve || source.notedCitricDissolve;
  target.bubbling = target.bubbling || source.bubbling;
  if (source.balloonScale) {
    target.balloonScale = Math.max(target.balloonScale || 0.35, source.balloonScale);
  }
  updateFill(target);
}

function transferContainer(fromId, toId) {
  const from = state.containers[fromId];
  const to = state.containers[toId];

  if (!containerHasStuff(from)) {
    showToast(`${containerLabel(fromId)} 是空的，没什么可倒的`);
    return;
  }

  const newVolume = (to.volume || 0) + (from.volume || 0);
  if (newVolume > MAX_VOLUME) {
    showToast(`${containerLabel(toId)} 装不下，先倒出一些`);
    return;
  }

  mergeIntoContainer(to, from);
  state.containers[fromId] = emptyContents();

  if (toId === 'flask' && to.gasCO2 > 0) {
    to.balloonScale = Math.min(1.2, 0.35 + to.gasCO2 * 0.12);
  }

  resolveReactions(toId);
  const funnelNote = state.equip.funnelMode ? '（经漏斗，减少洒漏）' : '';
  addLog(`把 ${containerLabel(fromId)} 里的东西倒进了 ${containerLabel(toId)}。${funnelNote}`, true);
  showToast(`${containerLabel(fromId)} → ${containerLabel(toId)} 倒完了`);
  renderBench();
  save();
}

function handleTripleClick(containerId) {
  if (state.transferSource) {
    if (state.transferSource === containerId) {
      showToast('请连点三次另一个容器');
      return;
    }
    transferContainer(state.transferSource, containerId);
    cancelTransferSource(true);
    renderBench();
    return;
  }

  if (!containerHasStuff(state.containers[containerId])) {
    showToast(`${containerLabel(containerId)} 是空的，没什么可倒的`);
    return;
  }

  state.transferSource = containerId;
  showToast(`已选中 ${containerLabel(containerId)}，连点三次目标容器`);
  clearTimeout(cancelTransferSource._t);
  cancelTransferSource._t = setTimeout(() => {
    if (state.transferSource) {
      showToast('倒液已取消');
      cancelTransferSource();
    }
  }, 6000);
  renderBench();
}

function resetBench() {
  CONTAINER_IDS.forEach(id => {
    state.containers[id] = emptyContents();
    state.temps[id] = 25;
  });
  state.tubeConnected = false;
  state.heatTarget = null;
  state.burnerPos = { ...DEFAULT_BURNER_POS };
  state.equip.burnerOn = false;
  cancelTransferSource(true);
  addLog('实验台已清空，可以重新开始。');
  renderBench();
  renderLabProps();
  save();
}

function stirContainer(id) {
  const c = state.containers[id];
  if (!containerHasStuff(c)) {
    showToast('容器是空的，没什么可搅拌');
    return;
  }
  c.bubbling = c.bubbling || c.gasCO2 > 0;
  resolveReactions(id);
  addLog(`用玻璃棒搅拌 ${containerLabel(id)}，溶液混合均匀。`);
  const wrap = document.querySelector(`.container-wrap[data-id="${id}"]`);
  wrap?.classList.add('stirring');
  setTimeout(() => wrap?.classList.remove('stirring'), 800);
  renderBench();
  save();
}

function testPH(id) {
  const c = state.containers[id];
  if (!containerHasStuff(c)) {
    showToast('先往容器里加点东西');
    return;
  }

  if (c.solids.length && !c.liquids.length) {
    const names = c.solids.map(solidLabel).join('、');
    showToast('固体不能直接用试纸！先加水溶解');
    addLog(`pH试纸测 ${containerLabel(id)}：${names} 是固体，须先加水溶成溶液才能测。`);
    return;
  }

  if (hasOnlyInsolubleSolidsInWater(c)) {
    const insoluble = c.solids.filter(s => INSOLUBLE_SOLIDS.has(s)).map(solidLabel).join('、');
    showToast(`${insoluble} 不溶于水，测不出 pH`);
    addLog(`pH试纸测 ${containerLabel(id)}：${insoluble} 不溶于水，不能测 pH。可溶的固体（食盐、小苏打等）溶后才能测。`);
    return;
  }

  if (!canTestPH(c)) {
    showToast('需要溶液才行：液体，或可溶固体+水');
    addLog(`pH试纸只能测溶液，${containerLabel(id)} 里还没有能测的液体。`);
    return;
  }

  const ph = computePH(c);
  const note = c.solids.length && c.liquids.includes('water') ? '（已溶解的溶液）' : '';
  addLog(`pH试纸检测 ${containerLabel(id)}${note}：pH ≈ ${ph.toFixed(1)}（${phLabel(ph)}）`);
  showToast(`pH ≈ ${ph.toFixed(1)} · ${phLabel(ph)}`);
}

function applyBurnerPosition() {
  const burner = document.getElementById('prop-burner');
  if (!burner) return;
  burner.style.left = `${state.burnerPos.left}px`;
  burner.style.bottom = `${state.burnerPos.bottom}px`;
}

function rectsOverlap(a, b, pad = 0) {
  return !(
    a.right - pad <= b.left + pad ||
    a.left + pad >= b.right - pad ||
    a.bottom - pad <= b.top + pad ||
    a.top + pad >= b.bottom - pad
  );
}

function burnerOverlapsVessel() {
  const burner = document.getElementById('prop-burner');
  if (!burner) return false;
  const bb = burner.getBoundingClientRect();
  return [...document.querySelectorAll('.container-wrap .vessel')].some(vessel => {
    return rectsOverlap(bb, vessel.getBoundingClientRect(), 8);
  });
}

function clampBurnerPosition({ rescue = false } = {}) {
  const bench = document.getElementById('bench');
  if (!bench) return false;

  const benchRect = bench.getBoundingClientRect();
  state.burnerPos.left = Math.max(4, Math.min(benchRect.width - BURNER_W - 4, state.burnerPos.left));
  state.burnerPos.bottom = Math.max(8, Math.min(benchRect.height - BURNER_H - 8, state.burnerPos.bottom));
  applyBurnerPosition();

  for (let i = 0; i < 12; i++) {
    if (!burnerOverlapsVessel()) return false;
    state.burnerPos.bottom = Math.max(8, state.burnerPos.bottom - 16);
    applyBurnerPosition();
  }

  for (let i = 0; i < 8; i++) {
    if (!burnerOverlapsVessel()) return false;
    state.burnerPos.left = Math.max(4, state.burnerPos.left - 18);
    applyBurnerPosition();
    if (!burnerOverlapsVessel()) return false;
    state.burnerPos.left = Math.min(benchRect.width - BURNER_W - 4, state.burnerPos.left + 36);
    applyBurnerPosition();
  }

  if (burnerOverlapsVessel()) {
    state.burnerPos = { ...DEFAULT_BURNER_POS };
    applyBurnerPosition();
    if (rescue) showToast('酒精灯已移回实验台边缘');
    return true;
  }
  return false;
}

function getBurnerCenter() {
  const bench = document.getElementById('bench');
  const burner = document.getElementById('prop-burner');
  if (!bench || !burner) return null;
  const br = bench.getBoundingClientRect();
  const bb = burner.getBoundingClientRect();
  return {
    x: bb.left + bb.width / 2 - br.left,
    y: bb.top + bb.height / 2 - br.top,
  };
}

function findNearestHeatContainer() {
  const center = getBurnerCenter();
  const bench = document.getElementById('bench');
  if (!center || !bench) return null;
  const br = bench.getBoundingClientRect();
  let best = null;
  let bestDist = HEAT_RANGE_PX;
  document.querySelectorAll('.container-wrap').forEach(wrap => {
    const id = wrap.dataset.id;
    if (!CONTAINER_IDS.includes(id)) return;
    if (!containerHasStuff(state.containers[id])) return;
    const wr = wrap.getBoundingClientRect();
    const cx = wr.left + wr.width / 2 - br.left;
    const cy = wr.top + wr.height / 2 - br.top;
    const dist = Math.hypot(center.x - cx, center.y - cy);
    if (dist < bestDist) {
      bestDist = dist;
      best = id;
    }
  });
  return best;
}

function updateBurnerProximity() {
  const near = state.equip.burnerOn ? findNearestHeatContainer() : null;
  const changed = state.heatTarget !== near;
  state.heatTarget = near;
  document.getElementById('prop-burner')?.classList.toggle('in-range', !!near && state.equip.burnerOn);
  if (changed) renderBench();
  return near;
}

function toggleBurner() {
  const eq = state.equip;
  eq.burnerOn = !eq.burnerOn;
  if (eq.burnerOn) {
    eq.showThermo = true;
    const near = updateBurnerProximity();
    if (near) {
      showToast(`🔥 正在加热 ${containerLabel(near)}（看右上角温度）`);
      addLog(`酒精灯靠近 ${containerLabel(near)}，开始加热。`);
    } else {
      showToast('🔥 灯亮了！按住酒精灯拖到烧杯旁边');
    }
  } else {
    state.heatTarget = null;
    document.getElementById('prop-burner')?.classList.remove('in-range');
    showToast('酒精灯已熄灭');
  }
  renderEquipment();
  renderLabProps();
  renderBench();
  persistLab();
}

function bindBurnerDrag() {
  const burner = document.getElementById('prop-burner');
  const bench = document.getElementById('bench');
  if (!burner || !bench) return;

  let dragging = false;
  let moved = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startBottom = 0;

  const onStart = (clientX, clientY) => {
    dragging = true;
    moved = false;
    burner.classList.add('dragging');
    bench.classList.add('burner-dragging');
    startX = clientX;
    startY = clientY;
    startLeft = state.burnerPos.left;
    startBottom = state.burnerPos.bottom;
  };

  const onMove = (clientX, clientY) => {
    if (!dragging) return;
    const dx = clientX - startX;
    const dy = clientY - startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
    const benchRect = bench.getBoundingClientRect();
    state.burnerPos.left = startLeft + dx;
    state.burnerPos.bottom = startBottom - dy;
    clampBurnerPosition();
    updateBurnerProximity();
  };

  const onEnd = () => {
    if (!dragging) return;
    dragging = false;
    burner.classList.remove('dragging');
    bench.classList.remove('burner-dragging');
    const near = updateBurnerProximity();
    persistLab();
    if (!moved) {
      toggleBurner();
      return;
    }
    if (state.equip.burnerOn && near) {
      showToast(`🔥 正在加热 ${containerLabel(near)}`);
    } else if (state.equip.burnerOn) {
      showToast('再靠近一些，火焰要能挨着容器');
    }
    checkBurnerCornerSecret();
  };

  burner.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onStart(e.clientX, e.clientY);
  });
  window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', onEnd);

  burner.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    if (!t) return;
    onStart(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    e.preventDefault();
    const t = e.touches[0];
    if (t) onMove(t.clientX, t.clientY);
  }, { passive: false });
  window.addEventListener('touchend', onEnd);
  window.addEventListener('touchcancel', onEnd);

  applyBurnerPosition();
}

function clearPourModes(except) {
  if (except !== 'dropper') state.equip.dropperMode = false;
  if (except !== 'burette') state.equip.buretteMode = false;
  if (except !== 'washBottle') state.equip.washBottleMode = false;
}

function grindContainer(id) {
  const c = state.containers[id];
  if (!c.solids.length) {
    showToast('没有固体可研磨');
    return;
  }
  if (c.ground) {
    showToast('已经研得很细了');
    return;
  }
  c.ground = true;
  addLog(`研钵研磨 ${containerLabel(id)} 里的固体，颗粒变细、更容易溶解。`);
  resolveReactions(id);
  renderBench();
  persistLab();
}

function filterContainer(id) {
  const c = state.containers[id];
  if (!c.liquids.length) {
    showToast('没有液体，滤不了');
    return;
  }
  const insoluble = c.solids.filter(s => INSOLUBLE_SOLIDS.has(s));
  if (!insoluble.length) {
    showToast('没有不溶固体可过滤');
    return;
  }
  c.solids = c.solids.filter(s => !INSOLUBLE_SOLIDS.has(s));
  addLog(`滤纸过滤 ${containerLabel(id)}：${insoluble.map(s => REAGENTS[s]?.name || s).join('、')} 留在滤纸上，滤液更清。`, true);
  updateFill(c);
  renderBench();
  persistLab();
}

function inspectContainer(id) {
  const c = state.containers[id];
  if (!containerHasStuff(c)) {
    showToast('空的，没什么可看的');
    return;
  }
  const parts = [];
  if (c.liquids.length) parts.push(`液体：${c.liquids.map(l => REAGENTS[l]?.name || l).join('、')}`);
  if (c.solids.length) parts.push(`固体：${c.solids.map(s => REAGENTS[s]?.name || s).join('、')}`);
  if (c.gasCO2 > 0.5) parts.push('CO₂');
  if (c.gasH2 > 0.5) parts.push('H₂');
  if (c.saltMelted) parts.push('熔融盐');
  const msg = parts.join(' · ');
  addLog(`放大镜观察 ${containerLabel(id)}（${getTemp(id)}°C）：${msg}`);
  showToast(`🔍 ${msg}`);
}

function useTongs(id) {
  const t = getTemp(id);
  if (!containerHasStuff(state.containers[id])) {
    showToast('钳子夹了个寂寞——容器是空的');
    return;
  }
  if (t >= 55) {
    addLog(`坩埚钳夹住烫手的 ${containerLabel(id)}（${t}°C），小心移动。`);
    showToast(`🔧 好烫！${t}°C，用钳子夹稳了`);
  } else {
    showToast(`${containerLabel(id)} 才 ${t}°C，还不够烫`);
  }
}

function toggleEquipment(eqId) {
  const eq = state.equip;
  switch (eqId) {
    case 'burner':
      toggleBurner();
      return;
    case 'dropper':
      eq.dropperMode = !eq.dropperMode;
      if (eq.dropperMode) clearPourModes('dropper');
      showToast(eq.dropperMode ? '滴管模式：每次加半量' : '退出滴管模式');
      break;
    case 'burette':
      eq.buretteMode = !eq.buretteMode;
      if (eq.buretteMode) clearPourModes('burette');
      showToast(eq.buretteMode ? '滴定管：精确少量滴加' : '收起滴定管');
      break;
    case 'washBottle':
      eq.washBottleMode = !eq.washBottleMode;
      if (eq.washBottleMode) clearPourModes('washBottle');
      showToast(eq.washBottleMode ? '洗瓶模式：水流冲洗容器' : '收起洗瓶');
      break;
    case 'wireGauze':
      eq.wireGauzeOn = !eq.wireGauzeOn;
      showToast(eq.wireGauzeOn ? '石棉网已垫上，加热更均匀' : '收起石棉网');
      break;
    case 'gloves':
      eq.glovesOn = !eq.glovesOn;
      if (eq.glovesOn) trackEquipSequence('gloves');
      showToast(eq.glovesOn ? '🧤 手套已戴好' : '摘下手套');
      break;
    case 'thermo':
      eq.showThermo = !eq.showThermo;
      if (eq.showThermo) trackEquipSequence('thermo');
      showToast(eq.showThermo ? '温度计已插入读数' : '收起温度计');
      break;
    case 'goggles':
      eq.gogglesOn = !eq.gogglesOn;
      if (eq.gogglesOn) trackEquipSequence('goggles');
      showToast(eq.gogglesOn ? '🥽 护目镜已戴好' : '摘下护目镜');
      break;
    case 'funnel':
      eq.funnelMode = !eq.funnelMode;
      showToast(eq.funnelMode ? '漏斗就位，倒液更稳' : '收起漏斗');
      break;
    case 'rack':
      eq.rackOn = !eq.rackOn;
      showToast(eq.rackOn ? '试管已上架' : '取下试管架');
      break;
    case 'stirRod':
      stirContainer(state.selectedContainer);
      break;
    case 'phPaper':
      testPH(state.selectedContainer);
      break;
    case 'mortar':
      grindContainer(state.selectedContainer);
      return;
    case 'filter':
      filterContainer(state.selectedContainer);
      return;
    case 'magnifier':
      inspectContainer(state.selectedContainer);
      return;
    case 'tongs':
      useTongs(state.selectedContainer);
      return;
    case 'distill':
      eq.distillOn = !eq.distillOn;
      showToast(eq.distillOn
        ? '蒸馏装置就绪：锥形瓶+导管+冷凝管+加热→收集蒸馏水'
        : '收起蒸馏装置');
      break;
    case 'condenser':
      eq.condenserOn = !eq.condenserOn;
      showToast(eq.condenserOn ? '冷凝管已装上，水蒸气会在这里液化' : '卸下冷凝管');
      break;
    case 'sepFunnel':
      eq.sepFunnelOn = !eq.sepFunnelOn;
      showToast(eq.sepFunnelOn ? '分液漏斗就位，可提取精华' : '收起分液漏斗');
      break;
    case 'extractor':
      runExtraction(state.selectedContainer);
      return;
  }
  renderEquipment();
  renderLabProps();
  renderBench();
  persistLab();
}

function tickHeat() {
  if (!state.equip.burnerOn) return;
  updateBurnerProximity();
  if (!state.heatTarget) return;
  const id = state.heatTarget;
  const c = state.containers[id];
  if (!c || !containerHasStuff(c)) return;

  const prev = getTemp(id);
  const heatStep = state.equip.wireGauzeOn ? 7 : 5;
  state.temps[id] = Math.min(100, prev + heatStep);
  let heated = false;

  if (getTemp(id) >= 40 && prev < 40) {
    addLog(`${containerLabel(id)} 开始变热… 当前 ${getTemp(id)}°C`);
  }

  const saltMeltTemp = id === 'dish' ? 80 : 90;
  if (c.solids.includes('salt') && !c.liquids.includes('water') && getTemp(id) >= saltMeltTemp && !c.saltMelted) {
    c.saltMelted = true;
    addLog(`${containerLabel(id)} 里的食盐热到滚烫，已经熔化成液态了！`, true);
    showToast('🧂熔化了！连点💧水 → 选🧊凉水倒进去');
    heated = true;
  }

  if (getTemp(id) >= 50 && c.liquids.includes('milk') && !c.curdled) {
    c.curdled = true;
    addLog(`加热 ${containerLabel(id)}：牛奶蛋白凝固，出现絮状物！`, true);
    heated = true;
  }
  if (getTemp(id) >= 65 && c.liquids.includes('eggWhite') && !c.proteinDenatured) {
    c.proteinDenatured = true;
    c.cloudy = true;
    addLog(`加热 ${containerLabel(id)}：蛋白变性凝固！`, true);
    heated = true;
  }
  if (getTemp(id) >= 95 && c.liquids.includes('water') && !c.notedBoil) {
    c.notedBoil = true;
    c.bubbling = true;
    addLog(`${containerLabel(id)} 里的水沸腾了！咕嘟咕嘟~`, true);
    heated = true;
  }

  let distilled = false;
  if (isDistillReady() && id === 'flask' && getTemp(id) >= 95 && c.liquids.includes('water')) {
    distilled = tryDistill('flask', DISTILL_RECEIVER);
    if (distilled) heated = true;
  }

  const evapStart = id === 'dish' ? 55 : 65;
  if (!distilled && getTemp(id) >= evapStart && c.liquids.length) {
    c.bubbling = true;
    if (!c.notedEvaporating) {
      c.notedEvaporating = true;
      addLog(`${containerLabel(id)} 液体受热蒸发，慢慢变少…`, true);
    }
    const base = Math.max(2, Math.round(c.volume / 20));
    const evapRate = id === 'dish' ? base + 1 : base;
    c.volume = Math.max(0, c.volume - evapRate);
    c.isFull = false;
    updateFill(c);
    if (c.volume <= 0) {
      evaporateAllLiquids(id, c);
      heated = true;
    }
  }

  if (heated) resolveReactions(id);
  renderBench();
  persistLab();
}

function toggleTube() {
  state.tubeConnected = !state.tubeConnected;
  if (state.tubeConnected && state.equip.distillOn) {
    showToast('导管已接好：锥形瓶 → 冷凝管 → 试管（接收蒸馏水）');
  } else {
    showToast(state.tubeConnected ? '导管已连接：flask → 试管' : '导管已断开');
  }
  renderBench();
  persistLab();
}

function renderReagents() {
  const bar = document.getElementById('reagent-bar');
  if (!bar) return;

  const waterActive = isWaterReagent(state.selectedReagent);
  const activeWater = waterActive ? REAGENTS[state.selectedReagent] : REAGENTS.warmWater;
  const otherReagents = Object.values(REAGENTS).filter(r => !r.isWater && !r.productOnly);

  bar.innerHTML = `
    <div class="reagent-water-wrap">
      <button type="button" class="reagent-btn water-hub${waterActive ? ' selected' : ''}" id="water-hub-btn">
        <span class="ico">${waterActive ? activeWater.icon : '💧'}</span>
        <span class="name">${waterActive ? activeWater.name : '水'}</span>
        <span class="water-hint">连点选温度</span>
      </button>
      ${state.waterPickerOpen ? `
        <div class="water-picker" role="menu">
          ${WATER_REAGENT_IDS.map(id => {
            const w = REAGENTS[id];
            return `<button type="button" class="water-opt${state.selectedReagent === id ? ' active' : ''}" data-water="${id}">
              <span class="w-ico">${w.icon}</span>
              <span class="w-name">${w.name}</span>
              <span class="w-temp">${w.tempLabel}</span>
            </button>`;
          }).join('')}
        </div>
      ` : ''}
    </div>
    ${otherReagents.map(r => `
      <button type="button" class="reagent-btn${state.selectedReagent === r.id ? ' selected' : ''}" data-reagent="${r.id}">
        <span class="ico">${r.icon}</span>
        <span class="name">${r.name}</span>
        ${r.element ? `<span class="el">${r.element}</span>` : ''}
      </button>
    `).join('')}
  `;

  bar.querySelectorAll('.reagent-btn[data-reagent]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedReagent = btn.dataset.reagent;
      state.waterPickerOpen = false;
      renderReagents();
    });
  });

  bar.querySelectorAll('.water-opt').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.selectedReagent = btn.dataset.water;
      state.waterPickerOpen = false;
      renderReagents();
      showToast(`已选 ${REAGENTS[state.selectedReagent].name} · ${REAGENTS[state.selectedReagent].tempLabel}`);
    });
  });

  const hub = document.getElementById('water-hub-btn');
  if (hub) {
    let clicks = 0;
    let timer = null;
    hub.addEventListener('click', () => {
      clicks += 1;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const count = clicks;
        clicks = 0;
        timer = null;
        if (count >= 2) {
          state.waterPickerOpen = !state.waterPickerOpen;
          renderReagents();
          return;
        }
        if (!isWaterReagent(state.selectedReagent)) state.selectedReagent = 'warmWater';
        renderReagents();
      }, 320);
    });
  }
}

function renderBubbles(wrap, active, intense = false) {
  let layer = wrap.querySelector('.bubbles-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'bubbles-layer';
    wrap.querySelector('.vessel').appendChild(layer);
  }
  layer.innerHTML = '';
  wrap.classList.toggle('salt-bubbling', intense);
  if (!active) return;
  const count = intense ? 22 : 8;
  for (let i = 0; i < count; i++) {
    const b = document.createElement('span');
    b.className = intense ? 'bubble-particle bubble-intense' : 'bubble-particle';
    b.style.left = `${8 + Math.random() * 84}%`;
    b.style.animationDelay = `${Math.random() * (intense ? 0.5 : 0.8)}s`;
    b.style.animationDuration = `${(intense ? 0.45 : 0.9) + Math.random() * (intense ? 0.35 : 0.6)}s`;
    if (intense) b.style.width = b.style.height = `${7 + Math.random() * 8}px`;
    layer.appendChild(b);
  }
}

function renderSplashParticles(wrap, active, gen) {
  let layer = wrap.querySelector('.splash-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'splash-layer';
    wrap.appendChild(layer);
  }
  if (!active) {
    layer.innerHTML = '';
    delete layer.dataset.gen;
    return;
  }
  if (layer.dataset.gen === String(gen)) return;
  layer.dataset.gen = String(gen);
  layer.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const p = document.createElement('span');
    p.className = 'splash-particle';
    const rad = (Math.random() * 100 - 50) * Math.PI / 180;
    const dist = 14 + Math.random() * 22;
    p.style.setProperty('--sx', `${Math.sin(rad) * dist}px`);
    p.style.setProperty('--sy', `${-Math.abs(Math.cos(rad)) * dist - 6}px`);
    p.style.animationDelay = `${Math.random() * 0.08}s`;
    p.style.width = p.style.height = `${4 + Math.random() * 4}px`;
    layer.appendChild(p);
  }
}

function renderContainer(id) {
  const c = state.containers[id];
  const wrap = document.querySelector(`.container-wrap[data-id="${id}"]`);
  if (!wrap) return;

  wrap.classList.toggle('selected', state.selectedContainer === id);
  wrap.classList.toggle('transfer-source', state.transferSource === id);
  const liquid = wrap.querySelector('.liquid');
  const foam = wrap.querySelector('.foam-layer');
  const balloon = wrap.querySelector('.balloon');

  const dilution = getDilution(c);
  const moltenSalt = c.saltMelted && c.solids.includes('salt') && !c.liquids.includes('water');
  const color = moltenSalt
    ? 'linear-gradient(180deg, #fff9c4 0%, #ff9800 55%, #e65100 100%)'
    : (mixColor(c) || 'rgba(255,255,255,0.12)');
  if (liquid) {
    const fill = moltenSalt ? Math.max(35, c.fillPct || 35) : (c.fillPct || (c.liquids.length || c.solids.length ? 45 : 0));
    liquid.style.height = `${fill}%`;
    liquid.style.background = color;
    const hasLiquid = c.liquids.length || c.solids.length || c.cloudy || moltenSalt;
    const baseOpacity = hasLiquid ? 0.92 : 0.25;
    liquid.style.opacity = moltenSalt ? 0.95 : Math.max(0.38, baseOpacity - dilution * 0.48);
  }
  wrap.classList.toggle('salt-molten', moltenSalt);

  let fullTip = wrap.querySelector('.full-tip');
  if (!fullTip) {
    fullTip = document.createElement('div');
    fullTip.className = 'full-tip';
    fullTip.textContent = '满了！不要再倒了，再倒就要跑出来了';
    wrap.appendChild(fullTip);
  }
  wrap.classList.toggle('is-full', c.isFull);
  const splashing = (c.saltSplashUntil || 0) > Date.now();
  const intenseBubble = (c.intenseBubbleUntil || 0) > Date.now();
  wrap.classList.toggle('overflowing', c.overflowing);
  wrap.classList.toggle('salt-splash', splashing);

  renderSplashParticles(wrap, splashing, c.splashGen || 0);
  renderBubbles(wrap, c.bubbling || intenseBubble, intenseBubble);

  if (splashing) {
    clearTimeout(splashTimers[id]);
    splashTimers[id] = setTimeout(() => {
      state.containers[id].saltSplashUntil = 0;
      renderContainer(id);
    }, 650);
  }
  if (c.bubbling || intenseBubble) {
    clearTimeout(bubbleTimers[id]);
    bubbleTimers[id] = setTimeout(() => {
      const cur = state.containers[id];
      cur.bubbling = false;
      cur.intenseBubbleUntil = 0;
      renderContainer(id);
    }, intenseBubble ? 4500 : 3500);
  }

  if (foam) foam.classList.toggle('active', c.foam > 0);
  if (balloon) {
    const scale = c.balloonScale || 0.35;
    balloon.style.transform = `translateX(-50%) scale(${scale})`;
  }

  if (id === 'flask') {
    wrap.classList.toggle('flask-setup', state.tubeConnected);
    wrap.classList.toggle('distilling', isDistillReady() && state.heatTarget === 'flask' && c.liquids.includes('water') && getTemp(id) >= 95);
  }
  if (id === DISTILL_RECEIVER) {
    wrap.classList.toggle('distill-receiver', isDistillReady() && state.containers.flask?.notedDistilling);
  }

  if (id === 'tube') {
    wrap.classList.toggle('on-rack', state.equip.rackOn);
  }

  const isHeating = state.equip.burnerOn && state.heatTarget === id && containerHasStuff(c);
  wrap.classList.toggle('heating', isHeating);
  wrap.classList.toggle('heat-target', state.heatTarget === id);

  let heatLabel = wrap.querySelector('.heat-label');
  if (isHeating) {
    if (!heatLabel) {
      heatLabel = document.createElement('span');
      heatLabel.className = 'heat-label';
      heatLabel.textContent = '🔥加热中';
      wrap.appendChild(heatLabel);
    }
    heatLabel.style.display = '';
  } else if (heatLabel) {
    heatLabel.style.display = 'none';
  }

  let meltHint = wrap.querySelector('.melt-hint');
  if (moltenSalt) {
    if (!meltHint) {
      meltHint = document.createElement('span');
      meltHint.className = 'melt-hint';
      wrap.appendChild(meltHint);
    }
    meltHint.textContent = '🧂已熔化 · 快倒🧊凉水';
    meltHint.style.display = '';
  } else if (meltHint) {
    meltHint.style.display = 'none';
  }

  let tempBadge = wrap.querySelector('.temp-badge');
  const showTemp = (state.equip.showThermo || isHeating) && containerHasStuff(c);
  if (showTemp) {
    if (!tempBadge) {
      tempBadge = document.createElement('span');
      tempBadge.className = 'temp-badge';
      wrap.appendChild(tempBadge);
    }
    tempBadge.textContent = `${getTemp(id)}°C`;
    tempBadge.style.display = '';
  } else if (tempBadge) {
    tempBadge.style.display = 'none';
  }
}

function renderEquipment() {
  const bar = document.getElementById('equipment-bar');
  if (!bar) return;
  const toggles = ['burner', 'dropper', 'thermo', 'goggles', 'funnel', 'rack',
    'wireGauze', 'washBottle', 'burette', 'gloves', 'distill', 'condenser', 'sepFunnel'];
  bar.innerHTML = EQUIPMENT.map(e => {
    const on = toggles.includes(e.id) && state.equip[{
      burner: 'burnerOn', dropper: 'dropperMode', thermo: 'showThermo',
      goggles: 'gogglesOn', funnel: 'funnelMode', rack: 'rackOn',
      wireGauze: 'wireGauzeOn', washBottle: 'washBottleMode', burette: 'buretteMode',
      gloves: 'glovesOn', distill: 'distillOn', condenser: 'condenserOn', sepFunnel: 'sepFunnelOn',
    }[e.id]];
    const action = ['stirRod', 'phPaper', 'mortar', 'filter', 'magnifier', 'tongs', 'extractor'].includes(e.id);
    return `<button type="button" class="equip-btn${on ? ' active' : ''}${action ? ' action' : ''}" data-equip="${e.id}" title="${e.name}">
      <span class="ico">${e.icon}</span><span class="name">${e.name}</span>
    </button>`;
  }).join('');
  bar.querySelectorAll('.equip-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleEquipment(btn.dataset.equip));
  });
}

function renderLabProps() {
  const burner = document.getElementById('prop-burner');
  if (burner) {
    burner.classList.toggle('lit', state.equip.burnerOn);
    applyBurnerPosition();
  }
  document.getElementById('prop-goggles')?.classList.toggle('show', state.equip.gogglesOn);
  document.getElementById('prop-rack')?.classList.toggle('show', state.equip.rackOn);
  document.getElementById('prop-funnel')?.classList.toggle('show', state.equip.funnelMode);
  document.getElementById('prop-dropper')?.classList.toggle('show', state.equip.dropperMode);
  document.getElementById('prop-condenser')?.classList.toggle('show', state.equip.condenserOn);
  document.getElementById('prop-sep-funnel')?.classList.toggle('show', state.equip.sepFunnelOn);
  document.getElementById('prop-distill')?.classList.toggle('show', state.equip.distillOn);
  applySecretEffects();
}

function renderBench() {
  CONTAINER_IDS.forEach(renderContainer);
  renderLabProps();
}

function renderLog() {
  const list = document.getElementById('log-list');
  if (!list) return;
  if (!state.log.length) {
    list.innerHTML = '<li><span class="time">提示</span>点一下加试剂；连点两下全部倒掉；连点三下倒液；连点四下倒掉一小口。试试醋 + 小苏打！</li>';
    return;
  }
  list.innerHTML = state.log.map(entry => {
    const time = new Date(entry.t).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return `<li><span class="time">${time}</span><span class="${entry.highlight ? 'highlight' : ''}">${entry.text}</span></li>`;
  }).join('');
}

function bindUI() {
  const CLICK_GAP_MS = 360;

  document.querySelectorAll('.container-wrap').forEach(wrap => {
    let clickCount = 0;
    let clickTimer = null;

    wrap.addEventListener('click', (e) => {
      e.preventDefault();
      clickCount += 1;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        const id = wrap.dataset.id;
        const count = clickCount;
        clickCount = 0;
        clickTimer = null;

        if (count === 4) {
          drainContainer(id);
          return;
        }
        if (count === 3) {
          handleTripleClick(id);
          return;
        }
        if (count === 2) {
          emptyContainer(id);
          return;
        }

        state.selectedContainer = id;

        if (state.equip.burnerOn && state.selectedReagent) {
          pourReagent(id, state.selectedReagent);
          renderBench();
          return;
        }

        if (state.selectedReagent) {
          pourReagent(id, state.selectedReagent);
        } else {
          showToast('请先在上方选一种试剂');
        }
        renderBench();
      }, CLICK_GAP_MS);
    });
  });

  document.getElementById('btn-clear')?.addEventListener('click', resetBench);
  document.getElementById('btn-tube')?.addEventListener('click', toggleTube);
  document.getElementById('btn-hint')?.addEventListener('click', () => {
    const hints = [
      '💎 蒸馏水：蒸馏装置+冷凝管+连接导管→锥形瓶加水→加热到沸腾→试管收蒸馏水',
      '✨ 提精华：分液漏斗+提取器→烧杯里加茶/果汁+酒精或水→点提取器',
      '酒精灯：①点🔥点灯 ②按住灯拖到器皿旁 ③看温度升高',
    ];
    const i = (state._hintIdx = ((state._hintIdx || 0) + 1) % hints.length);
    showToast(hints[i]);
  });
  document.getElementById('btn-distill')?.addEventListener('click', () => {
    state.equip.distillOn = !state.equip.distillOn;
    state.equip.condenserOn = state.equip.distillOn ? true : state.equip.condenserOn;
    if (!state.tubeConnected && state.equip.distillOn) {
      state.tubeConnected = true;
    }
    showToast(state.equip.distillOn
      ? '⚗️ 蒸馏套装已组装：锥形瓶→冷凝管→试管，快去加热！'
      : '蒸馏套装已收起');
    renderEquipment();
    renderLabProps();
    renderBench();
    persistLab();
  });

  bindBurnerDrag();
}

function init() {
  CONTAINER_IDS.forEach(id => { state.temps[id] = 25; });
  loadSecrets();
  const restored = loadSave();
  renderReagents();
  renderEquipment();
  renderBench();
  renderLog();
  bindUI();
  bindSecretsUI();
  applySecretEffects();
  if (clampBurnerPosition({ rescue: true })) persistLab();
  if (state.equip.burnerOn) updateBurnerProximity();
  else state.heatTarget = null;
  setInterval(tickHeat, 2000);
  if (!state.log.length) {
    addLog('欢迎来到小小实验室！实验会自动存档，下次打开接着做。');
  } else if (restored && localStorage.getItem(STORAGE_KEY)) {
    showToast('已恢复上次实验 🧪');
    updateSaveIndicator();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
