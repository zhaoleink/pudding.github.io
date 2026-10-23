// ══════════════════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════════════════
const state = {
  bubbles: [],
  popped: 0,
  score: 0,
  coins: 0,
  bubblePearls: 0,
  glowShards: 0,
  wavePetals: 0,
  nextId: 0,
  bubbleShape: 'circle',
  bubbleColor: '#4fc3f7',
  bubbleRainbow: false,
  bubbleSize: 45,
  waterPct: 40,
  sandPct: 20,
  diamondPct: 2,
  golddiamondPct: 1,
  darkmatterPct: 0.8,
  galaxyPct: 0.6,
  blackholePct: 0.4,
  neutronstarPct: 0.4,
  whiteholePct: 0.4,
  superclusterPct: 0.4,
  universePct: 0.4,
  superuniversePct: 0.4,
  bombPct: 5,
  jiaoshueeePct: 5,
  jiaoshuiPct: 5,
  rainbowsmokePct: 8,
  tntPct: 1.5,
  glassWaterPct: 10,
  watermelonPct: 0.8,
  watermelonActive: false,  // true during 10-sec conversion window
  watermelonTimer: null,
  watermelonWarnTimer: null,
  strawberryPct: 2,
  strawberryJuiceActive: false,  // true during 5-sec juice flood
  strawberryJuiceTimer: null,
  fireworkPct: 1.5,
  luckyPct: 0.8,
  grapePct: 3,
  soapPct: 3,
  icePct: 3,
  jellyPct: 3,
  balloonPct: 3,
  lightningPct: 3,
  magnetPct: 3,
  clockPct: 3,
  speedbubblePct: 3,
  invisiblePct: 3,
  combo: 0,
  lastPopAt: 0,
  comboHideTimer: null,
  timeScale: 1,
  slowTimer: null,
  speedBoostTimer: null,
  speedBoostActive: false,
  speedSpawnSide: null, // 'left' | 'right' during speed boost
  baseSpawnInterval: 800,
  passLevel: 0,          // 0 = none, 1–6 = completed that level
  passChallenge: null,   // active challenge state
  poppedTotal: 0,        // total pops ever (for challenge tracking)
  level: 1,
  rockets: 0,
  inventory: {
    slowclock: 0,
    magnet: 0,
    watermelon: 0,
    lucky: 0,
    spawner: 0,
    coinbag: 0,
    megacoin: 0,
  },
  stageRocketsGiven: new Set(),
  spawnInterval: 800,
  boardColor: '#ffffff',
  animFrame: null,
  spawnTimer: null,
  instantPop: false,  // true when instant pop mode is active
  zenMode: false,
};

const COIN_STORAGE = 'bubbleRelief_coins_v1';
const WALLET_STORAGE = 'bubbleRelief_wallet_v1';
const LEVEL_STORAGE = 'bubbleRelief_level_v1';
const STARTER_COINS = 500;
const STARTER_WALLET = { bubblePearls: 100, glowShards: 20, wavePetals: 30 };
const FISHING_COIN_STORAGE = 'bubbleRelief_fishingCoins_v1';
const PET_MEET_TOKEN_PRICE = 3000;

const WALLET_POP_CHIP = {
  coins: 'hud-chip-coins',
  pearl: 'hud-chip-pearl',
  glow: 'hud-chip-glow',
  wave: 'hud-chip-wave',
  fish: 'hud-chip-fish',
};

function loadCoins() {
  try {
    const raw = localStorage.getItem(COIN_STORAGE);
    if (raw != null && raw !== '') {
      const n = parseInt(raw, 10);
      if (!Number.isNaN(n) && n >= 0) state.coins = n;
    }
  } catch (e) {}
}

function loadWallet() {
  try {
    const raw = localStorage.getItem(WALLET_STORAGE);
    if (raw) {
      const d = JSON.parse(raw);
      state.bubblePearls = (d.bubblePearls ?? d.eggCoins ?? 0) | 0;
      state.glowShards = (d.glowShards ?? d.fiber ?? 0) | 0;
      state.wavePetals = (d.wavePetals ?? d.bottleCaps ?? 0) | 0;
    }
  } catch (e) {}
}

function saveWallet() {
  try {
    localStorage.setItem(WALLET_STORAGE, JSON.stringify({
      bubblePearls: state.bubblePearls | 0,
      glowShards: state.glowShards | 0,
      wavePetals: state.wavePetals | 0,
    }));
  } catch (e) {}
}

function ensureStarterWallet() {
  if (localStorage.getItem(WALLET_STORAGE) != null) return;
  state.bubblePearls = STARTER_WALLET.bubblePearls;
  state.glowShards = STARTER_WALLET.glowShards;
  state.wavePetals = STARTER_WALLET.wavePetals;
  saveWallet();
}

function resetWallet(toStarter = false) {
  if (toStarter) {
    state.bubblePearls = STARTER_WALLET.bubblePearls;
    state.glowShards = STARTER_WALLET.glowShards;
    state.wavePetals = STARTER_WALLET.wavePetals;
  } else {
    state.bubblePearls = 0;
    state.glowShards = 0;
    state.wavePetals = 0;
  }
  saveWallet();
}

function saveCoins() {
  try {
    localStorage.setItem(COIN_STORAGE, String(Math.max(0, state.coins | 0)));
  } catch (e) {}
}

function loadLevel() {
  try {
    const raw = localStorage.getItem(LEVEL_STORAGE);
    if (!raw) return;
    const d = JSON.parse(raw);
    const lv = (d.level ?? d.lv ?? 1) | 0;
    if (lv >= 1 && lv <= 200) state.level = lv;
    const pass = (d.passLevel ?? d.pass ?? 0) | 0;
    if (pass >= 0 && pass <= 6) state.passLevel = pass;
    if (Array.isArray(d.stageRocketsGiven)) {
      state.stageRocketsGiven = new Set(
        d.stageRocketsGiven.filter(n => Number.isFinite(n) && n >= 4 && n <= 6)
      );
    }
  } catch (e) {}
}

function saveLevel() {
  try {
    localStorage.setItem(LEVEL_STORAGE, JSON.stringify({
      level: state.level | 0,
      passLevel: state.passLevel | 0,
      stageRocketsGiven: [...state.stageRocketsGiven],
    }));
  } catch (e) {}
}

function syncMainCurrencyHUD(opts = {}) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = String(val); };
  set('hud-coins', state.coins | 0);
  set('hud-pearls', state.bubblePearls | 0);
  set('hud-glow', state.glowShards | 0);
  set('hud-wave', state.wavePetals | 0);
  set('hud-fish-coins', fishingScene.fishingCoins | 0);
  set('stat-pearls', state.bubblePearls | 0);
  set('stat-glow', state.glowShards | 0);
  set('stat-wave', state.wavePetals | 0);
  set('stat-fish', fishingScene.fishingCoins | 0);
  set('shop-w-coins', state.coins | 0);
  set('shop-w-pearls', state.bubblePearls | 0);
  set('shop-w-glow', state.glowShards | 0);
  set('shop-w-wave', state.wavePetals | 0);
  set('shop-w-fish', fishingScene.fishingCoins | 0);
  saveWallet();
  const chipId = WALLET_POP_CHIP[opts.pop];
  if (chipId) {
    const chip = document.getElementById(chipId);
    if (chip) {
      chip.classList.remove('mch-pop');
      void chip.offsetWidth;
      chip.classList.add('mch-pop');
    }
  }
}

function addWallet(key, amount, opts = {}) {
  if (!(key in state) || key === 'coins') return;
  const n = amount | 0;
  if (n <= 0) return;
  state[key] = (state[key] | 0) + n;
  const popKey = key === 'bubblePearls' ? 'pearl' : key === 'glowShards' ? 'glow' : key === 'wavePetals' ? 'wave' : key;
  syncMainCurrencyHUD({ pop: opts.pop === false ? undefined : popKey });
  saveWallet();
}

function spendWallet(key, amount, opts = {}) {
  if (!(key in state) || key === 'coins') return false;
  const n = amount | 0;
  if (n <= 0) return true;
  if ((state[key] | 0) < n) return false;
  state[key] = (state[key] | 0) - n;
  const popKey = key === 'bubblePearls' ? 'pearl' : key === 'glowShards' ? 'glow' : key === 'wavePetals' ? 'wave' : key;
  syncMainCurrencyHUD({ pop: opts.pop === false ? undefined : popKey });
  saveWallet();
  return true;
}

function rewardComboWallet(combo) {
  if (combo === 10) addWallet('bubblePearls', 2, { pop: 'pearl' });
  if (combo === 20) {
    addWallet('bubblePearls', 5, { pop: 'pearl' });
    addWallet('glowShards', 3, { pop: 'glow' });
  }
  if (combo === 50) addWallet('wavePetals', 10, { pop: 'wave' });
}

function syncCoinUI(opts = {}) {
  const n = state.coins | 0;
  const stat = document.getElementById('stat-coins');
  const shop = document.getElementById('shop-coins-display');
  if (stat) stat.textContent = n;
  if (shop) shop.textContent = n + ' 金币';
  syncMainCurrencyHUD(opts);
  saveCoins();
}

function addCoins(amount, opts = {}) {
  const n = amount | 0;
  if (n <= 0) return;
  state.coins += n;
  syncCoinUI({ pop: opts.pop === false ? undefined : 'coins' });
  if (!opts.skipShop) refreshShopItems();
  if (!opts.skipLevel) refreshLevelUI();
}

function spendCoins(amount, opts = {}) {
  const n = amount | 0;
  if (n <= 0) return true;
  if (state.coins < n) return false;
  state.coins -= n;
  syncCoinUI();
  if (!opts.skipRefresh) refreshShopItems();
  refreshLevelUI();
  return true;
}

function getHoldMs() {
  const item = SHOP_CATALOG.find(i => i.id === shop.activeMode);
  return item ? item.holdMs : 700;
}

// ══════════════════════════════════════════════════════════════════
//  LEVEL SYSTEM
// ══════════════════════════════════════════════════════════════════
const STAGE_INFO = [
  null, // index 0 unused
  { name: '第一阶段', nameEn: '第一阶段',   range: [1,   2],   discount: 0.9, rockets: 0, badge: '🌱', color: '#66bb6a' },
  { name: '第二阶段', nameEn: '第二阶段',  range: [2,   50],  discount: 0.7, rockets: 0, badge: '⚡', color: '#42a5f5' },
  { name: '第三阶段', nameEn: '第三阶段', range: [50,  70],  discount: 0.5, rockets: 0, badge: '🔥', color: '#ffa726' },
  { name: '第四阶段', nameEn: '第四阶段',  range: [70,  120], discount: 0.5, rockets: 3, badge: '🚀', color: '#ab47bc' },
  { name: '第五阶段', nameEn: '第五阶段',   range: [120, 150], discount: 0.5, rockets: 4, badge: '💫', color: '#ef5350' },
  { name: '第六阶段', nameEn: '第六阶段',  range: [150, 200], discount: 0.5, rockets: 7, badge: '👑', color: '#ffd700' },
];

function getStage(lv) {
  if (lv < 2)   return 1;
  if (lv < 50)  return 2;
  if (lv < 70)  return 3;
  if (lv < 120) return 4;
  if (lv < 150) return 5;
  return 6;
}

function getLevelUpCost(lv) {
  if (lv >= 200) return Infinity;
  if (lv < 20)   return 200;
  if (lv < 50)   return 300;
  if (lv < 70)   return 500;
  if (lv < 120)  return 1000;
  if (lv < 150)  return 1500;
  return 2000;
}

function getShopDiscount() {
  return STAGE_INFO[getStage(state.level)].discount;
}

function levelUp() {
  const cost = getLevelUpCost(state.level);
  if (state.level >= 200) return false;
  if (!spendCoins(cost)) return false;
  state.level += 1;
  addWallet('glowShards', 2, { pop: 'glow' });
  const newStage = getStage(state.level);
  // Give rockets on first entry into stages 4-6
  if ([4, 5, 6].includes(newStage) && !state.stageRocketsGiven.has(newStage)) {
    state.stageRocketsGiven.add(newStage);
    const bonus = STAGE_INFO[newStage].rockets;
    state.rockets += bonus;
    saveInventory();
    showToast(`🚀 进入${STAGE_INFO[newStage].name}！获得 ${bonus} 枚火箭筒！`, STAGE_INFO[newStage].color);
  }
  refreshLevelUI();
  refreshShopItems();
  saveLevel();
  checkAchievements();
  return true;
}

function useRocket(opts = {}) {
  const quiet = !!opts.quiet;
  if (state.rockets <= 0) return false;
  state.rockets -= 1;
  saveInventory();
  refreshLevelUI();
  if (!quiet) showToast('🚀 火箭筒发射！清空全场！', '#ff6b35');
  // Launch visual then clear all
  spawnRocketEffect();
  setTimeout(() => {
    const toBlast = [...state.bubbles];
    toBlast.forEach((b, i) => {
      setTimeout(() => { if (!b.popping) triggerPop(b); }, i * 18);
    });
  }, quiet ? 120 : 400);
  return true;
}

function spawnRocketEffect() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed; inset:0; z-index:9999; pointer-events:none;
    background:radial-gradient(circle, rgba(255,120,0,0.7) 0%, rgba(255,60,0,0.3) 50%, transparent 80%);
    animation: rocketFlash 0.5s ease-out forwards;
  `;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 550);

  // Rocket emoji flying across screen
  for (let i = 0; i < 7; i++) {
    const r = document.createElement('div');
    const startY = Math.random() * window.innerHeight;
    r.style.cssText = `
      position:fixed; left:-60px; top:${startY}px;
      font-size:${28 + Math.random()*20}px;
      z-index:10000; pointer-events:none;
      transition: left 0.4s ${i*0.05}s linear, top 0.4s ${i*0.05}s ease-in;
    `;
    r.textContent = '🚀';
    document.body.appendChild(r);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      r.style.left = (window.innerWidth + 80) + 'px';
      r.style.top  = (Math.random() * window.innerHeight) + 'px';
    }));
    setTimeout(() => r.remove(), 500 + i * 60);
  }
}

function showToast(msg, color = '#fff') {
  const t = document.createElement('div');
  t.style.cssText = `
    position:fixed; top:80px; left:50%; transform:translateX(-50%);
    background:rgba(0,0,0,0.85); color:${color};
    padding:10px 22px; border-radius:24px; font-size:15px; font-weight:700;
    border:2px solid ${color}; z-index:9999; pointer-events:none;
    animation: float-up 2.2s ease-out forwards;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

function refreshLevelUI() {
  const lv    = state.level;
  const stage = getStage(lv);
  const info  = STAGE_INFO[stage];
  const cost  = getLevelUpCost(lv);
  const disc  = Math.round((1 - info.discount) * 100);

  document.getElementById('lv-num').textContent   = lv;
  document.getElementById('lv-max').textContent   = '/200';
  document.getElementById('lv-stage').textContent = `${info.badge} ${info.name}`;
  document.getElementById('lv-stage').style.color = info.color;
  document.getElementById('lv-discount').textContent = disc > 0 ? `商店${Math.round(info.discount*10)}折` : '';
  document.getElementById('lv-cost').textContent  = lv >= 200 ? '已满级' : `${cost} 💰 升级`;
  document.getElementById('lv-up-btn').disabled   = lv >= 200 || state.coins < cost;
  document.getElementById('lv-up-btn').style.opacity = (lv >= 200 || state.coins < cost) ? '0.45' : '1';

  refreshBackpackUI();

  // Progress bar within stage
  const [s, e] = info.range;
  const pct = e === s ? 100 : Math.min(100, Math.round(((lv - s) / (e - s)) * 100));
  document.getElementById('lv-bar-fill').style.width = pct + '%';
  document.getElementById('lv-bar-fill').style.background = info.color;
  syncMainCurrencyHUD();
}

// ══════════════════════════════════════════════════════════════════
//  PASS CHALLENGE SYSTEM
// ══════════════════════════════════════════════════════════════════
const PASS_LEVELS = [
  null,
  { type: 'popTimed',   target: 50,  durationMs: 60000,  coins: 500,  rockets: 2,  label: '1 级通行证', icon: '🥉' },
  { type: 'popTimed',   target: 60,  durationMs: 60000,  coins: 1500, rockets: 4,  label: '2 级通行证', icon: '🥈' },
  { type: 'popTimed',   target: 65,  durationMs: 60000,  coins: 3000, rockets: 7,  label: '3 级通行证', icon: '🥇' },
  { type: 'combo',      target: 18,  durationMs: 90000,  coins: 4500, rockets: 8,  label: '4 级通行证', icon: '⚡' },
  { type: 'coins',      target: 700, durationMs: 90000,  coins: 6000, rockets: 9,  label: '5 级通行证', icon: '💰' },
  { type: 'popEndless', target: 100, durationMs: 0,      coins: 8000, rockets: 10, label: '6 级通行证', icon: '🌟' },
];
const PASS_REPLAY_LEVEL = 3;
const PASS_PEARL_REWARDS = [0, 20, 40, 60, 80, 100, 120];
let passTimerInterval = null;

function passLevelType(pl) {
  return pl?.type || 'popTimed';
}

function passLevelHasTimer(pl) {
  return (pl?.durationMs | 0) > 0;
}

function passLevelDesc(pl) {
  const sec = Math.round((pl.durationMs | 0) / 1000);
  switch (passLevelType(pl)) {
    case 'popTimed':   return `${sec} 秒内爆破 ${pl.target} 个气泡`;
    case 'combo':      return `${sec} 秒内达成 ${pl.target} 连击`;
    case 'coins':      return `${sec} 秒内获得 ${pl.target} 金币`;
    case 'popEndless': return `不限时累计戳破 ${pl.target} 个气泡`;
    default:           return `完成 ${pl.target} 个目标`;
  }
}

function passLevelShortReq(pl) {
  switch (passLevelType(pl)) {
    case 'popTimed':   return `1 分钟内爆破 <b>${pl.target}</b> 个气泡`;
    case 'combo':      return `90 秒内达成 <b>${pl.target}</b> 连击`;
    case 'coins':      return `90 秒内获得 <b>${pl.target}</b> 金币`;
    case 'popEndless': return `不限时累计戳破 <b>${pl.target}</b> 个`;
    default:           return `目标 <b>${pl.target}</b>`;
  }
}

function getPassChallengeProgress(ch) {
  const pl = PASS_LEVELS[ch.level];
  switch (passLevelType(pl)) {
    case 'popTimed':
    case 'popEndless':
      return state.poppedTotal - ch.popsAtStart;
    case 'combo':
      return ch.peakCombo | 0;
    case 'coins':
      return ch.coinsEarned | 0;
    default:
      return 0;
  }
}

function formatPassProgressText(ch, current) {
  const pl = PASS_LEVELS[ch.level];
  switch (passLevelType(pl)) {
    case 'combo':
      return `×${current} / ×${ch.target}`;
    case 'coins':
      return `${current} / ${ch.target}💰`;
    default:
      return `${current} / ${ch.target}`;
  }
}

function buildPassChallengeState(level, pl, replay) {
  return {
    level,
    type: passLevelType(pl),
    target: pl.target,
    popsAtStart: state.poppedTotal,
    coinsAtStart: state.coins | 0,
    peakCombo: 0,
    startTime: Date.now(),
    endTime: passLevelHasTimer(pl) ? Date.now() + pl.durationMs : 0,
    replay,
  };
}

function onPassChallengePop(b, combo, coinsEarned) {
  const ch = state.passChallenge;
  if (!ch) return;
  const pl = PASS_LEVELS[ch.level];
  const type = passLevelType(pl);

  if (type === 'combo') {
    ch.peakCombo = Math.max(ch.peakCombo | 0, combo | 0);
    if (ch.peakCombo >= ch.target) {
      clearInterval(passTimerInterval);
      completePassChallenge(true);
    }
  } else if (type === 'coins') {
    ch.coinsEarned = (ch.coinsEarned | 0) + Math.max(0, coinsEarned | 0);
    if (ch.coinsEarned >= ch.target) {
      clearInterval(passTimerInterval);
      completePassChallenge(true);
    }
  }
}

function tickPassChallengeUI(ch) {
  const pl = PASS_LEVELS[ch.level];
  const current = getPassChallengeProgress(ch);
  const pct = Math.min(100, (current / ch.target) * 100);

  const timerEl = document.getElementById('pass-timer');
  if (passLevelHasTimer(pl)) {
    const msLeft = Math.max(0, ch.endTime - Date.now());
    const secLeft = Math.ceil(msLeft / 1000);
    timerEl.textContent = String(secLeft);
    timerEl.classList.toggle('urgent', secLeft <= 10);
    if (msLeft <= 0 && current < ch.target) {
      clearInterval(passTimerInterval);
      completePassChallenge(false);
      return false;
    }
  } else {
    timerEl.textContent = '∞';
    timerEl.classList.remove('urgent');
  }

  document.getElementById('pass-pop-count').textContent = formatPassProgressText(ch, current);
  document.getElementById('pass-progress-bar').style.width = pct + '%';
  document.getElementById('pass-progress-bar').style.background =
    pct >= 100 ? '#4caf50' : 'linear-gradient(90deg,#00e5ff,#76ff03)';

  const statusEl = document.getElementById(`pass-status-${ch.level}`);
  if (statusEl) {
    const prefix = ch.replay ? '⏱ 复习 ' : '⏱ ';
    statusEl.textContent = prefix + formatPassProgressText(ch, current);
  }

  if (current >= ch.target && passLevelType(pl) !== 'combo') {
    clearInterval(passTimerInterval);
    completePassChallenge(true);
    return false;
  }
  return true;
}

function isPassFullyComplete() {
  return state.passLevel >= PASS_LEVELS.length - 1;
}

function getPassReplayLevel() {
  return PASS_REPLAY_LEVEL;
}

const PASS_REPLAY_COINS = 500;

function openPassModal() {
  refreshPassUI();
  document.getElementById('pass-overlay').classList.add('open');
}
function closePassModal() {
  document.getElementById('pass-overlay').classList.remove('open');
}

function refreshPassUI() {
  const nextLevel = state.passLevel + 1;
  const maxLevel  = PASS_LEVELS.length - 1;
  const active    = state.passChallenge;

  // Update cards
  for (let lv = 1; lv <= maxLevel; lv++) {
    const card   = document.getElementById(`pass-card-${lv}`);
    const status = document.getElementById(`pass-status-${lv}`);
    card.className = 'pass-level-card';
    if (state.passLevel >= lv) {
      card.classList.add('completed');
      status.textContent = '✅ 已完成';
      status.className   = 'pass-level-status done';
    } else if (lv === nextLevel) {
      card.classList.add('current');
      status.textContent = active ? '⏱ 挑战中…' : '← 当前目标';
      status.className   = 'pass-level-status active';
    } else {
      status.textContent = '🔒 未解锁';
      status.className   = 'pass-level-status';
    }
  }

  // Update challenge area
  const btn  = document.getElementById('pass-start-btn');
  const info = document.getElementById('pass-challenge-info');

  if (state.passLevel >= maxLevel) {
    const replayLv = getPassReplayLevel();
    const pl = PASS_LEVELS[replayLv];
    if (active?.replay) {
      btn.textContent = '⏳ 复习挑战进行中…';
      btn.disabled = true;
      info.textContent = `复习目标：${passLevelDesc(pl)} · 成功 +${SEASON_XP_SOURCES.passWin} 泡季经验`;
    } else {
      btn.textContent = `▶ 泡季复习挑战（${pl.target}泡/60秒）`;
      btn.disabled = false;
      info.textContent = `🏆 六级已全通 · 可反复复习 · 成功 +${PASS_REPLAY_COINS}💰 +${SEASON_XP_SOURCES.passWin} 泡季经验（不再升通行证等级）`;
      document.getElementById('pass-timer').textContent = passLevelHasTimer(pl) ? String(Math.round(pl.durationMs / 1000)) : '∞';
      document.getElementById('pass-timer').classList.remove('urgent');
      document.getElementById('pass-pop-count').textContent = formatPassProgressText({ level: replayLv, target: pl.target }, 0);
      document.getElementById('pass-progress-bar').style.width = '0%';
      document.getElementById('pass-progress-bar').style.background = 'linear-gradient(90deg,#00e5ff,#76ff03)';
    }
    return;
  }

  if (active) {
    btn.textContent = '⏳ 挑战进行中…';
    btn.disabled    = true;
    info.textContent= `目标：${passLevelDesc(PASS_LEVELS[active.level])}`;
  } else {
    const pl = PASS_LEVELS[nextLevel];
    btn.textContent = `▶ 开始挑战 ${pl.label}`;
    btn.disabled    = false;
    info.textContent= `${passLevelDesc(pl)}   奖励: +${pl.coins}💰 +${pl.rockets}🚀`;
    document.getElementById('pass-timer').textContent = passLevelHasTimer(pl) ? String(Math.round(pl.durationMs / 1000)) : '∞';
    document.getElementById('pass-timer').classList.remove('urgent');
    document.getElementById('pass-pop-count').textContent = formatPassProgressText({ level: nextLevel, target: pl.target }, 0);
    document.getElementById('pass-progress-bar').style.width = '0%';
    document.getElementById('pass-progress-bar').style.background = 'linear-gradient(90deg,#00e5ff,#76ff03)';
  }
}

function startPassChallenge() {
  if (state.passChallenge) return;

  const replay = isPassFullyComplete();
  const nextLevel = replay ? getPassReplayLevel() : state.passLevel + 1;
  if (!replay && nextLevel > PASS_LEVELS.length - 1) return;

  const pl = PASS_LEVELS[nextLevel];
  state.passChallenge = buildPassChallengeState(nextLevel, pl, replay);
  state.passChallenge.target = pl.target;

  refreshPassUI();
  showToast(
    replay
      ? `🎫 泡季复习挑战！${passLevelDesc(pl)} · 成功 +${SEASON_XP_SOURCES.passWin} 泡季经验`
      : `🎫 通行证挑战开始！${passLevelDesc(pl)}`,
    '#00e5ff'
  );

  passTimerInterval = setInterval(() => {
    const ch = state.passChallenge;
    if (!ch) { clearInterval(passTimerInterval); return; }
    tickPassChallengeUI(ch);
  }, 200);
}

function completePassChallenge(success) {
  const ch = state.passChallenge;
  state.passChallenge = null;
  clearInterval(passTimerInterval);

  if (success) {
    const pl = PASS_LEVELS[ch.level];
    if (ch.replay) {
      addCoins(PASS_REPLAY_COINS);
      syncCoinUI();
      showToast(`🎫 复习挑战成功！+${PASS_REPLAY_COINS}💰 +${SEASON_XP_SOURCES.passWin} 泡季经验`, '#76ff03');
      playPassSuccessSound();
      recordSeasonPassWin();
    } else {
      state.passLevel = ch.level;
      addCoins(pl.coins);
      addWallet('bubblePearls', PASS_PEARL_REWARDS[ch.level] || 20, { pop: 'pearl' });
      state.rockets += pl.rockets;

      // Upgrade player level by 3 (capped at 200)
      const lvBefore = state.level;
      state.level = Math.min(200, state.level + 3);
      // Check if crossed into a new stage that grants rockets
      for (let lv = lvBefore + 1; lv <= state.level; lv++) {
        const newStage = getStage(lv);
        if ([4,5,6].includes(newStage) && !state.stageRocketsGiven.has(newStage)) {
          state.stageRocketsGiven.add(newStage);
          state.rockets += STAGE_INFO[newStage].rockets;
        }
      }

      refreshLevelUI();
      refreshShopItems();
      saveLevel();
      saveInventory();

      showToast(`🎫 通行证 ${pl.label} 完成！+3级 +${pl.coins}💰 +${PASS_PEARL_REWARDS[ch.level]||20}🫧 +${pl.rockets}🚀`, '#76ff03');
      playPassSuccessSound();
      recordSeasonPassWin();
      checkAchievements();
    }

    // Celebratory particle burst
    const boardRect = board.getBoundingClientRect();
    const cx = boardRect.width / 2, cy = boardRect.height / 2;
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const fake = { x: cx + (Math.random()-0.5)*400, y: cy + (Math.random()-0.5)*300,
                       r: 20 + Math.random()*30, color: `hsl(${Math.random()*360},90%,65%)` };
        spawnExplosion(fake);
      }, i * 60);
    }
  } else {
    const current = getPassChallengeProgress(ch);
    const pl = PASS_LEVELS[ch.level];
    const unit = passLevelType(pl) === 'combo' ? '连击' : (passLevelType(pl) === 'coins' ? '金币' : '个');
    showToast(`❌ 挑战失败！${formatPassProgressText(ch, current)}${passLevelType(pl) === 'coins' ? '' : ' ' + unit}，再试一次！`, '#ff4444');
  }

  document.getElementById('pass-timer').classList.remove('urgent');
  refreshPassUI();
}

function playPassSuccessSound() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    [523,659,784,1047,1319,1568].forEach((freq, i) => {
      const t = now + i * 0.08;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      o.connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + 0.55);
    });
  } catch(e) {}
}

// ══════════════════════════════════════════════════════════════════
//  DAILY BUBBLE QUEST — 玩 3 种泡游戏 · 皮肤/节日主题/限时奖励
// ══════════════════════════════════════════════════════════════════
const DAILY_QUEST_GOAL = 3;
const DAILY_QUEST_STORAGE = 'bubbleRelief_dailyQuest_v1';
const BOARD_DAILY_STORAGE = 'bubbleRelief_boardDaily_v1';
const BOARD_DAILY_CHALLENGES = [
  { id: 'pop60', name: '戳破 60 个泡', target: 60, track: 'pops' },
  { id: 'combo10', name: '达成 10 连击', target: 10, track: 'combo' },
  { id: 'score800', name: '单局得 800 分', target: 800, track: 'score' },
  { id: 'water30', name: '戳 30 个水球', target: 30, track: 'water', bubbleType: 'water' },
];
const boardDaily = {
  dayKey: '',
  challengeId: '',
  progress: 0,
  peakCombo: 0,
  waterPops: 0,
  completed: false,
  claimed: false,
};

const BUBBLE_GAME_BTN_MAP = {
  'btn-blow': 'blow', 'btn-shoot': 'shoot', 'btn-match': 'match', 'btn-tower': 'tower',
  'btn-catch': 'catch', 'btn-rainbow': 'rainbow', 'btn-maze': 'maze', 'btn-guard': 'guard',
  'btn-bath': 'bath', 'btn-shadow': 'shadow', 'btn-chain': 'chain', 'btn-workshop': 'workshop',
  'btn-keepup': 'keepup', 'btn-merge': 'merge', 'btn-floatpop': 'floatpop', 'btn-goal': 'goal',
  'btn-split': 'split', 'btn-simon': 'simon', 'btn-wipe': 'wipe', 'btn-pinball': 'pinball',
  'btn-scale': 'scale', 'btn-bfish': 'bfish', 'btn-jumprope': 'jumprope', 'btn-colortap': 'colortap',
  'btn-rush30': 'rush30', 'btn-balance': 'balance', 'btn-bigpick': 'bigpick', 'btn-oddone': 'oddone',
  'btn-countpop': 'countpop', 'btn-inflate': 'inflate',
};

const BUBBLE_GAMES = {
  blow: { name: '吹泡', icon: '🫧' }, shoot: { name: '泡泡射击', icon: '🎯' },
  match: { name: '配对消消', icon: '🃏' }, tower: { name: '泡泡塔', icon: '🗼' },
  catch: { name: '接泡', icon: '🧺' }, rainbow: { name: '吹彩虹泡', icon: '🌈' },
  maze: { name: '泡泡迷宫', icon: '🗺️' }, guard: { name: '护泡过河', icon: '🛡️' },
  bath: { name: '泡泡浴', icon: '🛁' }, shadow: { name: '追泡影', icon: '👤' },
  chain: { name: '串泡', icon: '🔗' }, workshop: { name: '泡车间', icon: '🧪' },
  keepup: { name: '保泡', icon: '🎈' }, merge: { name: '泡合并', icon: '🔮' },
  floatpop: { name: '点飘泡', icon: '💨' }, goal: { name: '泡射门', icon: '🥅' },
  split: { name: '泡分裂', icon: '💥' }, simon: { name: '泡顺序', icon: '🎵' },
  wipe: { name: '擦玻璃泡', icon: '🧽' }, pinball: { name: '泡弹珠', icon: '🎱' },
  scale: { name: '泡称重', icon: '⚖️' }, bfish: { name: '泡钓鱼', icon: '🎏' },
  jumprope: { name: '泡跳绳', icon: '⏭️' }, colortap: { name: '泡配色', icon: '🎨' },
  rush30: { name: '泡连戳', icon: '⚡' }, balance: { name: '泡平衡', icon: '🌊' },
  bigpick: { name: '泡猜大', icon: '📏' }, oddone: { name: '泡找不同', icon: '🔍' },
  countpop: { name: '泡数数', icon: '🔢' }, inflate: { name: '吹爆泡', icon: '💢' },
};

const BUBBLE_GAME_IDS = Object.keys(BUBBLE_GAMES);

const OTHER_GAME_BTN_MAP = {
  'btn-playmode': 'playmode', 'btn-fishing': 'fishing', 'btn-beach': 'beach',
  'btn-tank': 'tank', 'btn-pond': 'pond', 'btn-boat': 'boat', 'btn-ice': 'ice',
};

const OTHER_GAMES = {
  playmode: { name: '玩法', icon: '🧩' }, fishing: { name: '钓鱼', icon: '🎣' },
  beach: { name: '赶海', icon: '🏖️' }, tank: { name: '喂鱼', icon: '🐠' },
  pond: { name: '捞金鱼', icon: '🐟' }, boat: { name: '放纸船', icon: '⛵' },
  ice: { name: '敲冰块', icon: '🧊' },
};

const SHOP_MINI_GAME_BTN_MAP = { ...BUBBLE_GAME_BTN_MAP, ...OTHER_GAME_BTN_MAP };
const MINI_GAMES = { ...BUBBLE_GAMES, ...OTHER_GAMES };
const MINI_GAME_IDS = Object.keys(MINI_GAMES);

const QUEST_SKIN_REWARDS = [
  { type: 'skin', id: 'qskin_sakura', icon: '🌸', name: '樱花泡泡肤', desc: '粉泡 + 浅粉背景', bubble: '#f8bbd0', board: '#fff0f5' },
  { type: 'skin', id: 'qskin_mint', icon: '🍃', name: '薄荷泡泡肤', desc: '深薄荷泡 + 青绿底', bubble: '#00897b', board: '#b2dfdb' },
  { type: 'skin', id: 'qskin_lavender', icon: '💜', name: '薰衣草泡泡肤', desc: '淡紫舒缓配色', bubble: '#b39ddb', board: '#ede7f6' },
  { type: 'skin', id: 'qskin_sunset', icon: '🌅', name: '晚霞泡泡肤', desc: '底阳浅黄慢晕 · 顶深橙红', bubble: '#ff8a65', board: '#fff8e1', render: 'sunset' },
];

const QUEST_HOLIDAY_THEMES = [
  { type: 'theme', id: 'qtheme_spring', icon: '🧧', name: '春节泡泡主题', desc: '红金节日泡氛围', bubble: '#ef5350', board: '#ffebee', month: 1, from: 18, to: 31, pick: 3 },
  { type: 'theme', id: 'qtheme_midautumn', icon: '🥮', name: '中秋泡泡主题', desc: '金泡映深蓝夜', bubble: '#ffb74d', board: '#1a237e', month: 9, from: 12, to: 28, pick: 3 },
  { type: 'theme', id: 'qtheme_xmas', icon: '🎄', name: '圣诞泡泡主题', desc: '绿泡红底节日感', bubble: '#66bb6a', board: '#b71c1c', month: 12, from: 18, to: 31, pick: 4 },
];

const QUEST_LIMITED_REWARDS = [
  { type: 'limited', id: 'qlim_sparkle', icon: '✨', name: '限时·闪泡特效', desc: '今日主场景发光泡感', effect: 'sparkle' },
  { type: 'limited', id: 'qlim_rainbow', icon: '🌈', name: '限时·彩虹泡局', desc: '今日主场景彩虹泡', effect: 'rainbow' },
];

const QUEST_COIN_REWARD = { type: 'coins', id: 'qcoins', icon: '🪙', name: '泡币礼包', desc: '每日免费领取', coins: 120 };

const QUEST_WALLET_BONUS_ROLL_MAX = 10000;

function getTodayQuestWalletBonus(dayKey = questTodayKey()) {
  const roll = questDayHash(`${dayKey}_wallet`) % QUEST_WALLET_BONUS_ROLL_MAX;
  if (roll < 9900) {
    return { kind: 'coins_only', icon: '🪙', name: '泡币', amount: 0, desc: '额外奖励：泡币' };
  }
  if (roll < 9950) {
    return { kind: 'wavePetals', icon: '🌊', name: '波瓣', amount: 5, desc: '额外奖励：波瓣 ×5' };
  }
  if (roll < 9975) {
    return { kind: 'glowShards', icon: '✨', name: '虹芒', amount: 8, desc: '额外奖励：虹芒 ×8' };
  }
  return { kind: 'bubblePearls', icon: '🫧', name: '泡珠', amount: 12, desc: '额外奖励：泡珠 ×12' };
}

function applyDailyQuestWalletBonus(bonus) {
  if (bonus.kind === 'wavePetals') addWallet('wavePetals', bonus.amount, { pop: 'wave' });
  else if (bonus.kind === 'glowShards') addWallet('glowShards', bonus.amount, { pop: 'glow' });
  else if (bonus.kind === 'bubblePearls') addWallet('bubblePearls', bonus.amount, { pop: 'pearl' });
}

function formatDailyQuestWalletBonusToast(bonus) {
  if (bonus.kind === 'coins_only') return '';
  if (bonus.kind === 'wavePetals') return ` +${bonus.amount}🌊`;
  if (bonus.kind === 'glowShards') return ` +${bonus.amount}虹芒`;
  if (bonus.kind === 'bubblePearls') return ` +${bonus.amount}🫧`;
  return '';
}

const QUEST_REWARDS = [
  ...QUEST_SKIN_REWARDS,
  ...QUEST_HOLIDAY_THEMES.map(({ month, from, to, pick, ...r }) => r),
  ...QUEST_LIMITED_REWARDS,
  QUEST_COIN_REWARD,
];

const QUEST_SKIN_DAYS_PER_MONTH = 6;
const QUEST_LIMITED_DAYS_PER_MONTH = 3;

const GACHA_EXCLUSIVE_SKINS = [
  { type: 'skin', id: 'gskin_ocean', icon: '🌊', name: '深海泡泡肤', desc: '深蓝泡 + 浅蓝底', bubble: '#0277bd', board: '#e1f5fe', rarity: 'blue' },
  { type: 'skin', id: 'gskin_peach', icon: '🍑', name: '蜜桃泡泡肤', desc: '暖橙泡 + 奶油底', bubble: '#ff8a65', board: '#fff3e0', rarity: 'blue' },
  { type: 'skin', id: 'gskin_forest', icon: '🌲', name: '森林泡泡肤', desc: '深绿泡 + 浅绿底', bubble: '#388e3c', board: '#e8f5e9', rarity: 'blue' },
  { type: 'skin', id: 'gskin_neon', icon: '⚡', name: '霓虹泡泡肤', desc: '电光青泡 + 深紫夜底 · 彩色档', bubble: '#00e5ff', board: '#1a0a2e', rarity: 'color' },
  { type: 'skin', id: 'gskin_candy', icon: '🍬', name: '糖果泡泡肤', desc: '粉泡 + 糖纸底', bubble: '#ec407a', board: '#fce4ec', rarity: 'purple' },
  { type: 'skin', id: 'gskin_aurora', icon: '🌈', name: '极光泡泡肤', desc: '渐变彩泡 + 浅紫底', bubble: '#ab47bc', board: '#e8eaf6', rarity: 'color', render: 'sunset' },
  { type: 'skin', id: 'gskin_gold', icon: '✨', name: '黄金泡泡肤', desc: '金泡 + 米白底 · 五彩', bubble: '#ffb300', board: '#fffde7', rarity: 'rainbow', rainbow: true },
];

function gachaRarityForQuestSkin(s) {
  if (s.id === 'qskin_mint') return 'blue';
  if (s.id === 'qskin_lavender') return 'purple';
  if (s.id === 'qskin_sakura') return 'purple';
  if (s.id === 'qskin_sunset') return 'color';
  return 'purple';
}

const GACHA_POOL = [
  ...QUEST_SKIN_REWARDS.map(s => ({ ...s, rarity: gachaRarityForQuestSkin(s) })),
  ...QUEST_HOLIDAY_THEMES.map(({ month, from, to, pick, ...r }) => ({ ...r, rarity: 'rainbow', rainbow: true })),
  ...GACHA_EXCLUSIVE_SKINS,
];

const GACHA_DRAW_COST = 25;
const GACHA_DRAW10_PEARL_COST = 110;
const GACHA_DRAW10_COIN_COST = 10000;
const GACHA_DUP_REFUND = 20;

const GACHA_RARITY_LABEL = {
  blue: '蓝色皮肤',
  purple: '紫色皮肤',
  color: '彩色皮肤',
  rainbow: '五彩皮肤',
};

const dailyQuest = {
  dateKey: '',
  played: [],
  todayCoinBanked: false,
  todaySkinBanked: false,
  pendingClaims: [],
  lastBankDate: '',
  streak: 0,
  lastClaimDate: '',
  unlocked: [],
  equipped: null,
  limitedActive: null,
  featuredBonusGiven: false,
};

function questTodayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function questYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return questTodayKey(d);
}

function questDayHash(key) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = ((h << 5) - h) + key.charCodeAt(i);
  return Math.abs(h);
}

function questPickDays(year, month, salt, count, fromDay, toDay) {
  const lo = Math.max(1, fromDay);
  const hi = Math.max(lo, toDay);
  const pool = [];
  for (let d = lo; d <= hi; d++) pool.push(d);
  const picked = new Set();
  let i = 0;
  while (picked.size < Math.min(count, pool.length) && i < 160) {
    picked.add(pool[questDayHash(`${year}-${month}-${salt}-${i}`) % pool.length]);
    i++;
  }
  return picked;
}

function getTodayHolidayQuestReward(year, month, day) {
  for (const theme of QUEST_HOLIDAY_THEMES) {
    if (theme.month !== month) continue;
    const lastDay = new Date(year, month, 0).getDate();
    const to = Math.min(theme.to, lastDay);
    if (day < theme.from || day > to) continue;
    const days = questPickDays(year, month, theme.id, theme.pick, theme.from, to);
    if (!days.has(day)) continue;
    const { month: _m, from: _f, to: _t, pick: _p, ...reward } = theme;
    return { ...reward, desc: `${reward.desc} · 节日限定日` };
  }
  return null;
}

function getTodayQuestSkinBonus(dayKey = questTodayKey(), now = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const lastDay = new Date(year, month, 0).getDate();

  const holiday = getTodayHolidayQuestReward(year, month, day);
  if (holiday) return holiday;

  const skinDays = questPickDays(year, month, 'skin', QUEST_SKIN_DAYS_PER_MONTH, 1, lastDay);
  if (skinDays.has(day)) {
    const skin = QUEST_SKIN_REWARDS[questDayHash(`${dayKey}-skin`) % QUEST_SKIN_REWARDS.length];
    return { ...skin, desc: `${skin.desc} · 本月皮肤日` };
  }

  const limitedDays = questPickDays(year, month, 'limited', QUEST_LIMITED_DAYS_PER_MONTH, 1, lastDay);
  if (limitedDays.has(day)) {
    return QUEST_LIMITED_REWARDS[questDayHash(`${dayKey}-lim`) % QUEST_LIMITED_REWARDS.length];
  }

  return null;
}

function getTodayQuestCurrencyLine(dayKey = questTodayKey()) {
  const walletBonus = getTodayQuestWalletBonus(dayKey);
  const baseCoins = QUEST_COIN_REWARD.coins;
  if (walletBonus.kind === 'coins_only') {
    return {
      icon: '🪙',
      name: '泡币礼包',
      desc: `每日免费 ${baseCoins} 泡币（资源 99% 为泡币）`,
      walletBonus,
      baseCoins,
    };
  }
  return {
    icon: walletBonus.icon,
    name: walletBonus.name,
    desc: `免费 ${baseCoins} 泡币 + ${walletBonus.desc}`,
    walletBonus,
    baseCoins,
  };
}

function questDateFromKey(dayKey) {
  const [y, m, d] = dayKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function questWalletBonusFromStored(entry) {
  if (entry.walletKind === 'wavePetals') {
    return { kind: 'wavePetals', icon: '🌊', name: '波瓣', amount: entry.walletAmount, desc: '' };
  }
  if (entry.walletKind === 'glowShards') {
    return { kind: 'glowShards', icon: '✨', name: '虹芒', amount: entry.walletAmount, desc: '' };
  }
  if (entry.walletKind === 'bubblePearls') {
    return { kind: 'bubblePearls', icon: '🫧', name: '泡珠', amount: entry.walletAmount, desc: '' };
  }
  return { kind: 'coins_only', icon: '🪙', name: '泡币', amount: 0, desc: '' };
}

function applyFeaturedBonusToPending() {
  if (!dailyQuest.featuredBonusGiven) return;
  bankTodayFreeCoinReward();
  const entry = dailyQuest.pendingClaims.find(p => p.dateKey === questTodayKey());
  if (!entry) return;
  entry.featuredCoins = 20;
  entry.featuredGlow = 5;
  saveDailyQuest();
}

function getOrCreateTodayPendingEntry(dayKey = questTodayKey()) {
  let entry = dailyQuest.pendingClaims.find(p => p.dateKey === dayKey);
  if (entry) return entry;

  const y = questYesterdayKey();
  if (dailyQuest.lastBankDate === y) dailyQuest.streak += 1;
  else if (dailyQuest.lastBankDate !== dayKey) dailyQuest.streak = 1;
  dailyQuest.lastBankDate = dayKey;

  const currency = getTodayQuestCurrencyLine(dayKey);
  entry = {
    dateKey: dayKey,
    baseCoins: currency.baseCoins,
    walletKind: currency.walletBonus.kind,
    walletAmount: currency.walletBonus.amount || 0,
    skinId: null,
    streakSnapshot: dailyQuest.streak,
    featuredCoins: 0,
    featuredGlow: 0,
    coinBanked: false,
    skinBanked: false,
  };
  dailyQuest.pendingClaims.push(entry);
  return entry;
}

function bankTodayFreeCoinReward() {
  const dayKey = questTodayKey();
  if (dailyQuest.todayCoinBanked) return false;

  const existing = dailyQuest.pendingClaims.find(p => p.dateKey === dayKey);
  if (existing?.coinBanked) {
    dailyQuest.todayCoinBanked = true;
    return false;
  }

  const entry = getOrCreateTodayPendingEntry(dayKey);
  const currency = getTodayQuestCurrencyLine(dayKey);
  entry.baseCoins = currency.baseCoins;
  entry.walletKind = currency.walletBonus.kind;
  entry.walletAmount = currency.walletBonus.amount || 0;
  entry.coinBanked = true;
  dailyQuest.todayCoinBanked = true;
  saveDailyQuest();
  touchQuestStreakForAch();
  return true;
}

function bankTodayQuestSkinReward() {
  const dayKey = questTodayKey();
  if (dailyQuest.todaySkinBanked) return false;
  if (dailyQuest.played.length < DAILY_QUEST_GOAL) return false;

  const entry = getOrCreateTodayPendingEntry(dayKey);
  if (entry.skinBanked) {
    dailyQuest.todaySkinBanked = true;
    return false;
  }

  const skinBonus = getTodayQuestSkinBonus(dayKey);
  entry.skinId = skinBonus?.id || null;
  entry.skinBanked = true;
  if (dailyQuest.featuredBonusGiven) {
    entry.featuredCoins = 20;
    entry.featuredGlow = 5;
  }
  dailyQuest.todaySkinBanked = true;
  saveDailyQuest();
  touchQuestStreakForAch();
  return true;
}

function summarizePendingQuestClaims() {
  let coins = 0;
  let skins = 0;
  dailyQuest.pendingClaims.forEach(entry => {
    coins += (entry.baseCoins || 0) + 40 + (entry.streakSnapshot || 1) * 15 + (entry.featuredCoins || 0);
    if (entry.skinId) skins += 1;
    if (entry.walletKind === 'wavePetals') coins += 0;
  });
  return { days: dailyQuest.pendingClaims.length, coins, skins };
}

function getFeaturedBubbleGameId() {
  return MINI_GAME_IDS[questDayHash(questTodayKey() + '_feat') % MINI_GAME_IDS.length];
}

function loadDailyQuest() {
  try {
    const raw = localStorage.getItem(DAILY_QUEST_STORAGE);
    if (raw) {
      const d = JSON.parse(raw);
      Object.assign(dailyQuest, d);
      if (!Array.isArray(dailyQuest.pendingClaims)) dailyQuest.pendingClaims = [];
      if (typeof dailyQuest.todayCoinBanked !== 'boolean') {
        dailyQuest.todayCoinBanked = !!(d.todayCoinBanked ?? d.todayBanked ?? d.claimed);
      }
      if (typeof dailyQuest.todaySkinBanked !== 'boolean') {
        dailyQuest.todaySkinBanked = !!(d.todaySkinBanked ?? d.todayBanked ?? d.claimed);
      }
      dailyQuest.pendingClaims.forEach(entry => {
        if (typeof entry.coinBanked !== 'boolean') entry.coinBanked = true;
        if (typeof entry.skinBanked !== 'boolean') entry.skinBanked = !!entry.skinId;
      });
    }
  } catch (e) {}
  if (dailyQuest.equipped === 'qtheme_halloween') dailyQuest.equipped = null;
  dailyQuest.unlocked = dailyQuest.unlocked.filter(id => id !== 'qtheme_halloween');
  ensureDailyQuestDay();
  if (dailyQuest.equipped) {
    applyEquippedQuestTheme();
  } else {
    applyQuestDefaultSkin();
  }
  refreshQuestUI();
}

function saveDailyQuest() {
  try {
    localStorage.setItem(DAILY_QUEST_STORAGE, JSON.stringify({
      dateKey: dailyQuest.dateKey,
      played: dailyQuest.played,
      todayCoinBanked: dailyQuest.todayCoinBanked,
      todaySkinBanked: dailyQuest.todaySkinBanked,
      pendingClaims: dailyQuest.pendingClaims,
      lastBankDate: dailyQuest.lastBankDate,
      streak: dailyQuest.streak,
      lastClaimDate: dailyQuest.lastClaimDate,
      unlocked: dailyQuest.unlocked,
      equipped: dailyQuest.equipped,
      limitedActive: dailyQuest.limitedActive,
      featuredBonusGiven: dailyQuest.featuredBonusGiven,
    }));
  } catch (e) {}
}

function ensureDailyQuestDay() {
  const today = questTodayKey();
  if (dailyQuest.dateKey === today) return;
  const y = questYesterdayKey();
  if (dailyQuest.lastBankDate && dailyQuest.lastBankDate !== y) {
    dailyQuest.streak = 0;
  }
  dailyQuest.dateKey = today;
  dailyQuest.played = [];
  dailyQuest.todayCoinBanked = false;
  dailyQuest.todaySkinBanked = false;
  dailyQuest.featuredBonusGiven = false;
  const boardEl = document.getElementById('board');
  if (boardEl) boardEl.classList.remove('quest-limited-sparkle');
  saveDailyQuest();
}

function getQuestRewardById(id) {
  const s = SEASON_EXCLUSIVE_SKINS.find(r => r.id === id);
  if (s) return s;
  const g = GACHA_POOL.find(r => r.id === id);
  if (g) return g;
  return QUEST_REWARDS.find(r => r.id === id);
}

function isSkinReward(reward) {
  return reward && (reward.type === 'skin' || reward.type === 'theme');
}

function unlockSkinId(id) {
  if (!id || dailyQuest.unlocked.includes(id)) return false;
  dailyQuest.unlocked.push(id);
  saveDailyQuest();
  return true;
}

function rollGachaSkin() {
  const roll = Math.random() * 100;
  let tier = 'blue';
  if (roll < 5) tier = 'rainbow';
  else if (roll < 17) tier = 'color';
  else if (roll < 45) tier = 'purple';
  let pool = GACHA_POOL.filter(s => s.rarity === tier);
  if (!pool.length) pool = GACHA_POOL.filter(s => s.rarity === 'blue');
  if (!pool.length) pool = GACHA_POOL;
  return pool[Math.floor(Math.random() * pool.length)];
}

function performSkinGachaDraw(times = 1) {
  const count = times === 10 ? 10 : 1;
  const pearlCost = count === 10 ? GACHA_DRAW10_PEARL_COST : GACHA_DRAW_COST;
  const coinCost = count === 10 ? GACHA_DRAW10_COIN_COST : 0;
  if ((state.bubblePearls | 0) < pearlCost) {
    showToast(`泡珠不够 · 需要 ${pearlCost}🫧`, '#ef5350');
    return null;
  }
  if (coinCost > 0 && (state.coins | 0) < coinCost) {
    showToast(`金币不够 · 十连还需 ${coinCost.toLocaleString('zh-CN')}💰`, '#ef5350');
    return null;
  }
  if (!spendWallet('bubblePearls', pearlCost)) {
    showToast(`泡珠不够 · 需要 ${pearlCost}🫧`, '#ef5350');
    return null;
  }
  if (coinCost > 0 && !spendCoins(coinCost, { skipRefresh: true })) {
    addWallet('bubblePearls', pearlCost, { pop: false });
    showToast(`金币不够 · 十连还需 ${coinCost.toLocaleString('zh-CN')}💰`, '#ef5350');
    return null;
  }

  const results = [];
  for (let i = 0; i < count; i += 1) {
    const skin = rollGachaSkin();
    const isNew = unlockSkinId(skin.id);
    if (!isNew) addWallet('bubblePearls', GACHA_DUP_REFUND, { pop: false });
    results.push({ skin, isNew });
  }

  refreshSkinGachaUI(results);
  refreshQuestUI();
  return results;
}

function getTodayBoardChallenge() {
  const dayKey = questTodayKey();
  const idx = questDayHash(`${dayKey}_board`) % BOARD_DAILY_CHALLENGES.length;
  return BOARD_DAILY_CHALLENGES[idx];
}

function ensureBoardDailyDay() {
  const dayKey = questTodayKey();
  if (boardDaily.dayKey === dayKey) return;
  const ch = getTodayBoardChallenge();
  boardDaily.dayKey = dayKey;
  boardDaily.challengeId = ch.id;
  boardDaily.progress = 0;
  boardDaily.peakCombo = 0;
  boardDaily.waterPops = 0;
  boardDaily.completed = false;
  boardDaily.claimed = false;
  saveBoardDaily();
}

function loadBoardDaily() {
  try {
    const raw = localStorage.getItem(BOARD_DAILY_STORAGE);
    if (!raw) return;
    const d = JSON.parse(raw);
    Object.assign(boardDaily, d);
  } catch {}
  ensureBoardDailyDay();
}

function saveBoardDaily() {
  try {
    localStorage.setItem(BOARD_DAILY_STORAGE, JSON.stringify(boardDaily));
  } catch {}
}

function currentBoardDailyDef() {
  ensureBoardDailyDay();
  return BOARD_DAILY_CHALLENGES.find(c => c.id === boardDaily.challengeId) || getTodayBoardChallenge();
}

function boardDailyProgressValue(def) {
  switch (def.track) {
    case 'combo': return boardDaily.peakCombo | 0;
    case 'water': return boardDaily.waterPops | 0;
    case 'score': return state.score | 0;
    default: return boardDaily.progress | 0;
  }
}

function refreshBoardDailyUI() {
  const el = document.getElementById('board-daily-challenge');
  if (!el || state.zenMode) {
    if (el) el.hidden = true;
    return;
  }
  ensureBoardDailyDay();
  const def = currentBoardDailyDef();
  const cur = boardDailyProgressValue(def);
  const pct = Math.min(100, Math.round((cur / def.target) * 100));
  el.hidden = false;
  el.innerHTML = boardDaily.claimed
    ? `<span class="bdc-done">✓ 今日挑战已完成</span>`
    : `<span class="bdc-title">📌 ${def.name}</span>
       <span class="bdc-bar"><i style="width:${pct}%"></i></span>
       <span class="bdc-num">${Math.min(cur, def.target)}/${def.target}</span>
       ${boardDaily.completed && !boardDaily.claimed ? '<button type="button" id="board-daily-claim" class="bdc-claim">领 15🫧</button>' : ''}`;
  document.getElementById('board-daily-claim')?.addEventListener('click', claimBoardDailyReward);
}

function claimBoardDailyReward() {
  if (!boardDaily.completed || boardDaily.claimed) return;
  boardDaily.claimed = true;
  addWallet('bubblePearls', 15, { pop: 'pearl' });
  saveBoardDaily();
  showToast('今日挑战奖励 +15🫧', '#81d4fa');
  refreshBoardDailyUI();
}

function onBoardDailyPop(b, combo) {
  if (state.zenMode || boardDaily.claimed) return;
  ensureBoardDailyDay();
  const def = currentBoardDailyDef();
  if (def.track === 'pops') boardDaily.progress += 1;
  if (def.track === 'combo') boardDaily.peakCombo = Math.max(boardDaily.peakCombo | 0, combo | 0);
  if (def.track === 'water' && (b.type === 'wet' || b.wet)) boardDaily.waterPops += 1;
  if (def.track === 'score') boardDaily.progress = state.score | 0;
  const cur = boardDailyProgressValue(def);
  if (!boardDaily.completed && cur >= def.target) {
    boardDaily.completed = true;
    showToast(`今日挑战完成：${def.name}`, '#ce93d8');
  }
  saveBoardDaily();
  refreshBoardDailyUI();
}

function setZenMode(on) {
  state.zenMode = !!on;
  document.getElementById('board')?.classList.toggle('zen-mode', state.zenMode);
  document.getElementById('btn-zen-mode')?.classList.toggle('active', state.zenMode);
  document.getElementById('game-sidebar')?.classList.toggle('zen-sidebar', state.zenMode);
  refreshBoardDailyUI();
  showToast(state.zenMode ? '禅模式：只戳泡，不计分' : '已退出禅模式', state.zenMode ? '#a5d6a7' : '#90a4ae');
}

function toggleZenMode() {
  setZenMode(!state.zenMode);
}

function refreshSkinGachaUI(lastResults = null) {
  const pearlsEl = document.getElementById('gacha-pearls');
  if (pearlsEl) pearlsEl.textContent = String(state.bubblePearls | 0);
  const coinsEl = document.getElementById('gacha-coins');
  if (coinsEl) coinsEl.textContent = String(state.coins | 0);

  const resultEl = document.getElementById('gacha-result');
  if (resultEl && lastResults?.length) {
    const main = lastResults[lastResults.length - 1].skin;
    const dupCount = lastResults.filter(r => !r.isNew).length;
    resultEl.innerHTML = `
      <div class="gacha-result-bubble" style="--g-bubble:${main.bubble};--g-board:${main.board}">${main.icon}</div>
      <div class="gacha-result-name">${main.name}</div>
      <div class="gacha-result-meta"><span class="gacha-rarity-tag gacha-rarity-${main.rarity || 'blue'}">${GACHA_RARITY_LABEL[main.rarity] || '蓝色皮肤'}</span>${lastResults.length > 1 ? ` · 共 ${lastResults.length} 抽` : ''}${dupCount ? ` · ${dupCount} 个重复已退 ${GACHA_DUP_REFUND}🫧` : ''}</div>
    `;
    resultEl.classList.add('pop');
    clearTimeout(refreshSkinGachaUI._pop);
    refreshSkinGachaUI._pop = setTimeout(() => resultEl.classList.remove('pop'), 600);
  }

  const ownedEl = document.getElementById('gacha-owned');
  if (ownedEl) {
    const skinIds = dailyQuest.unlocked.filter(id => {
      const r = getQuestRewardById(id);
      return isSkinReward(r);
    });
    if (!skinIds.length) {
      ownedEl.innerHTML = '<span class="gacha-owned-empty">还没有皮肤 · 点下面抽一发试试</span>';
    } else {
      const defaultOn = !dailyQuest.equipped;
      const defaultBtn = `<button type="button" class="quest-collect-btn gacha-equip-btn${defaultOn ? ' equipped' : ''}" data-gacha-id="__default__">🫧 默认${defaultOn ? ' ✓' : ''}</button>`;
      const btns = skinIds.map(id => {
        const r = getQuestRewardById(id);
        if (!r) return '';
        const on = dailyQuest.equipped === id;
        return `<button type="button" class="quest-collect-btn gacha-equip-btn${on ? ' equipped' : ''}" data-gacha-id="${id}">${r.icon} ${r.name}${on ? ' ✓' : ''}</button>`;
      }).join('');
      ownedEl.innerHTML = defaultBtn + btns;
      ownedEl.querySelectorAll('[data-gacha-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.dataset.gachaId === '__default__') {
            applyQuestDefaultSkin();
          } else {
            const r = getQuestRewardById(btn.dataset.gachaId);
            if (r) applyQuestVisual(r, true);
          }
          refreshSkinGachaUI();
          refreshQuestUI();
          showToast('已换上泡泡皮肤', '#4fc3f7');
        });
      });
    }
  }
}

function openSkinGachaModal() {
  refreshSkinGachaUI();
  document.getElementById('skin-gacha-overlay')?.classList.add('open');
}

function closeSkinGachaModal() {
  document.getElementById('skin-gacha-overlay')?.classList.remove('open');
}

const QUEST_DEFAULT_SKIN = {
  bubble: '#4fc3f7',
  board: '#ffffff',
  rainbow: false,
};

function applyQuestDefaultSkin() {
  state.bubbleColor = QUEST_DEFAULT_SKIN.bubble;
  state.boardColor = QUEST_DEFAULT_SKIN.board;
  state.bubbleRainbow = QUEST_DEFAULT_SKIN.rainbow;
  document.documentElement.style.removeProperty('--board-bg');
  const boardEl = document.getElementById('board');
  if (boardEl) {
    boardEl.style.removeProperty('background');
    boardEl.style.removeProperty('background-color');
    boardEl.classList.remove('quest-limited-sparkle', 'quest-skin-sunset', 'quest-skin-glass', 'quest-theme-midautumn');
  }
  dailyQuest.equipped = null;
  dailyQuest.limitedActive = null;
  saveDailyQuest();
}

function isSunsetBubbleSkinEquipped() {
  const reward = dailyQuest.equipped ? getQuestRewardById(dailyQuest.equipped) : null;
  return reward?.render === 'sunset' || dailyQuest.equipped === 'qskin_sunset';
}

function getEquippedBubbleSkinRender() {
  const reward = dailyQuest.equipped ? getQuestRewardById(dailyQuest.equipped) : null;
  if (!reward || reward.type !== 'skin') return null;
  if (reward.render === 'sunset' || reward.render === 'glass') return reward.render;
  return null;
}

function clearQuestBoardThemeClasses(boardEl) {
  if (!boardEl) return;
  boardEl.classList.remove('quest-skin-sunset', 'quest-skin-glass', 'quest-theme-midautumn');
}

function applyQuestVisual(reward, equip = true) {
  if (!reward) return;
  const boardEl = document.getElementById('board');
  if (reward.type === 'skin' || reward.type === 'theme') {
    state.bubbleColor = reward.bubble;
    state.boardColor = reward.board;
    state.bubbleRainbow = !!reward.rainbow;
    clearQuestBoardThemeClasses(boardEl);
    if (reward.render === 'sunset') {
      document.documentElement.style.removeProperty('--board-bg');
      if (boardEl) {
        boardEl.style.removeProperty('background');
        boardEl.style.removeProperty('background-color');
        boardEl.classList.add('quest-skin-sunset');
      }
    } else if (reward.render === 'glass') {
      document.documentElement.style.setProperty('--board-bg', reward.board);
      if (boardEl) {
        boardEl.style.background = reward.board;
        boardEl.classList.add('quest-skin-glass');
      }
    } else if (reward.id === 'qtheme_midautumn') {
      document.documentElement.style.setProperty('--board-bg', reward.board);
      if (boardEl) {
        boardEl.style.background = reward.board;
        boardEl.classList.add('quest-theme-midautumn');
      }
    } else {
      document.documentElement.style.setProperty('--board-bg', reward.board);
      if (boardEl) {
        boardEl.style.background = reward.board;
      }
    }
    if (equip) dailyQuest.equipped = reward.id;
  }
  if (reward.type === 'limited') {
    dailyQuest.limitedActive = reward.effect;
    const boardEl = document.getElementById('board');
    if (boardEl) {
      boardEl.classList.toggle('quest-limited-sparkle', reward.effect === 'sparkle');
    }
    if (reward.effect === 'rainbow') {
      state.bubbleRainbow = true;
    }
    if (equip) dailyQuest.equipped = reward.id;
  }
  saveDailyQuest();
}

function applyEquippedQuestTheme() {
  if (!dailyQuest.equipped) return;
  const reward = getQuestRewardById(dailyQuest.equipped);
  if (reward) applyQuestVisual(reward, false);
}

function recordBubbleGamePlay(gameId) {
  ensureDailyQuestDay();
  bankTodayFreeCoinReward();
  recordMiniGamePlayed(gameId);
  if (!MINI_GAMES[gameId]) return;
  if (!dailyQuest.played.includes(gameId)) {
    dailyQuest.played.push(gameId);
    saveDailyQuest();
    const left = Math.max(0, DAILY_QUEST_GOAL - dailyQuest.played.length);
    if (left > 0) {
      showToast(`📅 今日泡计划 ${dailyQuest.played.length}/${DAILY_QUEST_GOAL} · 还差 ${left} 种`, '#ce93d8');
    } else if (bankTodayQuestSkinReward()) {
      showToast('📅 皮肤任务完成！奖励已存起来 · 打开泡计划点「领取」', '#ffd54f');
    }
  }
  if (gameId === getFeaturedBubbleGameId() && !dailyQuest.featuredBonusGiven) {
    dailyQuest.featuredBonusGiven = true;
    saveDailyQuest();
    bankTodayFreeCoinReward();
    if (dailyQuest.played.length >= DAILY_QUEST_GOAL) {
      bankTodayQuestSkinReward();
    } else {
      applyFeaturedBonusToPending();
    }
    showToast(`⭐ 今日限定「${MINI_GAMES[gameId].name}」奖励已存入 · 点「领取」再拿`, '#ffd54f');
  }
  refreshQuestUI();
  markShopBubbleGameBadges();
}

function recordBubbleGameFromBtn(btnId) {
  const gameId = SHOP_MINI_GAME_BTN_MAP[btnId];
  if (gameId) recordBubbleGamePlay(gameId);
}

function claimDailyQuestReward() {
  ensureDailyQuestDay();
  bankTodayFreeCoinReward();
  if (!dailyQuest.pendingClaims.length) return;

  let totalCoins = 0;
  let skinCount = 0;
  const walletNotes = [];

  dailyQuest.pendingClaims.forEach(entry => {
    const streak = entry.streakSnapshot || 1;
    const coinBonus = (entry.baseCoins || 0) + 40 + streak * 15 + (entry.featuredCoins || 0);
    totalCoins += coinBonus;
    addCoins(coinBonus);

    const walletBonus = questWalletBonusFromStored(entry);
    applyDailyQuestWalletBonus(walletBonus);
    const walletTxt = formatDailyQuestWalletBonusToast(walletBonus);
    if (walletTxt) walletNotes.push(walletTxt);

    if (entry.featuredGlow) addWallet('glowShards', entry.featuredGlow, { pop: 'glow' });

    if (entry.skinId && !dailyQuest.unlocked.includes(entry.skinId)) {
      dailyQuest.unlocked.push(entry.skinId);
      skinCount += 1;
    }
  });

  const days = dailyQuest.pendingClaims.length;
  dailyQuest.pendingClaims = [];
  dailyQuest.lastClaimDate = questTodayKey();

  saveDailyQuest();
  touchQuestStreakForAch();
  recordSeasonQuestClaim();
  checkAchievements();
  refreshQuestUI();
  refreshShopItems();

  const skinTxt = skinCount ? ` · 皮肤/主题 ${skinCount} 个已入库` : '';
  showToast(`📅 领取 ${days} 天奖励！+${totalCoins}💰${walletNotes.join('')}${skinTxt}`, '#ce93d8');
}

function refreshQuestUI() {
  ensureDailyQuestDay();
  bankTodayFreeCoinReward();
  const played = dailyQuest.played;
  const count = played.length;
  if (count >= DAILY_QUEST_GOAL && !dailyQuest.todaySkinBanked) bankTodayQuestSkinReward();
  const pending = summarizePendingQuestClaims();
  const currency = getTodayQuestCurrencyLine();
  const skinBonus = getTodayQuestSkinBonus();
  const featured = getFeaturedBubbleGameId();
  const featInfo = MINI_GAMES[featured];
  const todayKey = questTodayKey();
  const todayClaimed = dailyQuest.lastClaimDate === todayKey;

  const streakEl = document.getElementById('quest-streak-val');
  if (streakEl) streakEl.textContent = `🔥 ${dailyQuest.streak} 天`;

  for (let i = 1; i <= DAILY_QUEST_GOAL; i++) {
    const dot = document.getElementById(`quest-dot-${i}`);
    if (dot) dot.classList.toggle('done', count >= i);
  }

  const list = document.getElementById('quest-played-list');
  if (list) {
    list.innerHTML = played.length
      ? played.map(id => {
          const g = MINI_GAMES[id];
          const cls = id === featured ? 'quest-played-chip featured' : 'quest-played-chip';
          return `<span class="${cls}">${g.icon} ${g.name}${id === featured ? ' · 限定' : ''}</span>`;
        }).join('')
      : '<span class="quest-played-chip">还没有开始 · 去商店选小游戏</span>';
  }

  const curIcon = document.getElementById('quest-currency-icon');
  const curName = document.getElementById('quest-currency-name');
  const curDesc = document.getElementById('quest-currency-desc');
  const bonIcon = document.getElementById('quest-bonus-icon');
  const bonName = document.getElementById('quest-bonus-name');
  const bonDesc = document.getElementById('quest-bonus-desc');
  if (curIcon) curIcon.textContent = currency.icon;
  if (curName) curName.textContent = currency.name;
  if (curDesc) curDesc.textContent = `${currency.desc} · 不含钓鱼币`;
  if (bonIcon) bonIcon.textContent = skinBonus ? skinBonus.icon : '—';
  if (bonName) bonName.textContent = skinBonus ? skinBonus.name : '今日无皮肤/主题';
  if (bonDesc) {
    bonDesc.textContent = skinBonus
      ? `${skinBonus.desc} · 完成 3 种小游戏后领取`
      : '完成 3 种小游戏后解锁 · 每月随机几天才有';
  }

  const labelEl = document.getElementById('quest-reward-label');
  if (labelEl) {
    if (pending.days > 0) {
      labelEl.textContent = `待领取 ${pending.days} 天 · 泡币礼包免费 · 点下方领取`;
    } else {
      labelEl.textContent = '泡币礼包每天免费 · 皮肤/主题需完成 3 种小游戏';
    }
  }

  const pendingEl = document.getElementById('quest-pending-hint');
  if (pendingEl) {
    if (pending.days > 0) {
      pendingEl.textContent = `📦 已存 ${pending.days} 天 · 约 +${pending.coins}💰${pending.skins ? ` · 含 ${pending.skins} 个皮肤/主题` : ''}`;
    } else if (todayClaimed) {
      pendingEl.textContent = '✅ 今日泡币已领取 · 明天继续领';
    } else if (dailyQuest.todayCoinBanked) {
      pendingEl.textContent = '✅ 今日泡币礼包已存入 · 点「领取」即可拿到';
    } else if (count >= DAILY_QUEST_GOAL) {
      pendingEl.textContent = '皮肤任务已完成 · 奖励正在存入…';
    } else {
      pendingEl.textContent = `泡币礼包免费领 · 皮肤任务 ${count}/${DAILY_QUEST_GOAL}`;
    }
  }

  const featEl = document.getElementById('quest-featured');
  if (featEl) {
    featEl.textContent = `⭐ 今日限定小游戏：${featInfo.icon} ${featInfo.name} · 玩它 +20 金币 +5 虹芒（存入后点领取）`;
  }

  const claimBtn = document.getElementById('quest-claim-btn');
  if (claimBtn) {
    claimBtn.classList.remove('ready');
    if (pending.days > 0) {
      claimBtn.disabled = false;
      claimBtn.classList.add('ready');
      claimBtn.textContent = pending.days > 1
        ? `领取 ${pending.days} 天奖励 · 约 +${pending.coins}💰`
        : `免费领取 · 约 +${pending.coins}💰`;
    } else if (todayClaimed) {
      claimBtn.disabled = true;
      claimBtn.textContent = '✅ 今日已领取';
    } else {
      claimBtn.disabled = true;
      claimBtn.textContent = '泡币礼包准备中…';
    }
  }

  const col = document.getElementById('quest-collection');
  if (col) {
    const defaultOn = !dailyQuest.equipped;
    const defaultBtn = `<button type="button" class="quest-collect-btn${defaultOn ? ' equipped' : ''}" data-quest-id="__default__">🫧 默认皮肤${defaultOn ? ' ✓' : ''}</button>`;
    const unlockedBtns = dailyQuest.unlocked.map(id => {
      const r = getQuestRewardById(id);
      if (!r || r.type === 'coins') return '';
      const on = dailyQuest.equipped === id;
      return `<button type="button" class="quest-collect-btn${on ? ' equipped' : ''}" data-quest-id="${id}">${r.icon} ${r.name}${on ? ' ✓' : ''}</button>`;
    }).join('');
    if (!dailyQuest.unlocked.length) {
      col.innerHTML = defaultBtn + '<span class="quest-played-chip">完成皮肤任务解锁更多泡泡肤 / 节日主题</span>';
    } else {
      col.innerHTML = defaultBtn + unlockedBtns;
    }
    col.querySelectorAll('[data-quest-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.questId === '__default__') {
          applyQuestDefaultSkin();
          refreshQuestUI();
          showToast('已切换 🫧 默认皮肤', '#4fc3f7');
          return;
        }
        const r = getQuestRewardById(btn.dataset.questId);
        if (!r) return;
        applyQuestVisual(r, true);
        refreshQuestUI();
        showToast(`已切换 ${r.icon} ${r.name}`, '#4fc3f7');
      });
    });
  }

  const questBtn = document.getElementById('btn-quest');
  if (questBtn) {
    questBtn.classList.toggle('quest-ready', pending.days > 0);
  }
}

function markShopBubbleGameBadges() {
  const featured = getFeaturedBubbleGameId();
  Object.entries(SHOP_MINI_GAME_BTN_MAP).forEach(([btnId, gameId]) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.classList.toggle('quest-played-today', dailyQuest.played.includes(gameId));
    btn.classList.toggle('quest-featured-today', gameId === featured);
  });
}

function openQuestModal() {
  refreshQuestUI();
  markShopBubbleGameBadges();
  document.getElementById('quest-overlay').classList.add('open');
}

function closeQuestModal() {
  document.getElementById('quest-overlay').classList.remove('open');
}

// ══════════════════════════════════════════════════════════════════
//  SEASON  (泡季 · 每季 45–60 天)
// ══════════════════════════════════════════════════════════════════
const SEASON_STORAGE = 'bubbleRelief_season_v1';
const SEASON_EPOCH_MS = new Date(2026, 0, 1).getTime(); // 2026-01-01 本地零点
const SEASON_MIN_DAYS = 45;
const SEASON_MAX_DAYS = 60;
const SEASON_MAX_TIER = 30;

const SEASON_THEME_NAMES = [
  '初泡之春', '夏泡长浪', '秋泡拾光', '冬泡星霜',
  '泡海纪元', '虹芒序章', '波瓣远航', '泡豆天穹',
];

/** 每季专属泡泡肤 · render: glass 为精细玻璃泡绘制 */
const SEASON_EXCLUSIVE_SKINS = [
  { type: 'skin', id: 'sskin_spring', icon: '🌸', name: '初泡之春肤', desc: '泡季专属 · 透亮春泡 + 浅绿底', bubble: '#81c784', board: '#e8f5e9', render: 'glass', glass: { hi: '#e8f5e9', mid: '#66bb6a', rim: '#2e7d32' } },
  { type: 'skin', id: 'sskin_summer', icon: '🌊', name: '夏泡长浪肤', desc: '泡季专属 · 海蓝玻璃泡 + 浪光底', bubble: '#29b6f6', board: '#e1f5fe', render: 'glass', glass: { hi: '#e1f5fe', mid: '#039be5', rim: '#01579b' } },
  { type: 'skin', id: 'sskin_autumn', icon: '🍁', name: '秋泡拾光肤', desc: '泡季专属 · 琥珀泡 + 暖杏底', bubble: '#ffb74d', board: '#fff3e0', render: 'glass', glass: { hi: '#fff8e1', mid: '#ffa726', rim: '#e65100' } },
  { type: 'skin', id: 'sskin_winter', icon: '❄️', name: '冬泡星霜肤', desc: '泡季专属 · 霜白泡 + 冷蓝底', bubble: '#90caf9', board: '#eceff1', render: 'glass', glass: { hi: '#ffffff', mid: '#64b5f6', rim: '#37474f' } },
  { type: 'skin', id: 'sskin_era', icon: '🫧', name: '泡海纪元肤', desc: '泡季专属 · 深青泡 + 雾蓝底', bubble: '#4dd0e1', board: '#e0f7fa', render: 'glass', glass: { hi: '#e0f7fa', mid: '#00acc1', rim: '#006064' } },
  { type: 'skin', id: 'sskin_rainbow', icon: '🌈', name: '虹芒序章肤', desc: '泡季专属 · 虹彩玻璃泡', bubble: '#ab47bc', board: '#f3e5f5', render: 'glass', glass: { hi: '#fce4ec', mid: '#ec407a', rim: '#6a1b9a', rainbow: true } },
  { type: 'skin', id: 'sskin_petal', icon: '🌺', name: '波瓣远航肤', desc: '泡季专属 · 粉瓣泡 + 暮紫底', bubble: '#f06292', board: '#ede7f6', render: 'glass', glass: { hi: '#f8bbd0', mid: '#e91e63', rim: '#880e4f' } },
  { type: 'skin', id: 'sskin_sky', icon: '☁️', name: '泡豆天穹肤', desc: '泡季专属 · 天青泡 + 云白底', bubble: '#7986cb', board: '#e8eaf6', render: 'glass', glass: { hi: '#ffffff', mid: '#5c6bc0', rim: '#283593' } },
];

function getSeasonExclusiveSkin(seasonIndex) {
  const i = ((seasonIndex | 0) % SEASON_EXCLUSIVE_SKINS.length + SEASON_EXCLUSIVE_SKINS.length) % SEASON_EXCLUSIVE_SKINS.length;
  const base = SEASON_EXCLUSIVE_SKINS[i];
  const theme = SEASON_THEME_NAMES[i] || '泡季';
  return { ...base, desc: `${theme} · ${base.desc}` };
}

function grantSeasonExclusiveSkin(seasonIndex, opts = {}) {
  const skin = getSeasonExclusiveSkin(seasonIndex);
  const isNew = unlockSkinId(skin.id);
  if (opts.equip !== false) applyQuestVisual(skin, true);
  if (!opts.silent) {
    showSeasonToast('新赛季泡泡肤', `${skin.icon} ${skin.name} · 精细玻璃泡已${isNew ? '解锁并' : ''}装备`);
  }
  return skin;
}

function ensureSeasonExclusiveSkinOwned() {
  if (seasonState.seasonIndex < 0) return;
  const skin = getSeasonExclusiveSkin(seasonState.seasonIndex);
  const had = dailyQuest.unlocked.includes(skin.id);
  if (!had) {
    unlockSkinId(skin.id);
    if (!dailyQuest.equipped) applyQuestVisual(skin, true);
  } else if (dailyQuest.equipped && dailyQuest.equipped.startsWith('sskin_') && dailyQuest.equipped !== skin.id) {
    applyQuestVisual(skin, true);
  }
}

const SEASON_XP_SOURCES = {
  pop: 2,
  miniGame: 18,
  questClaim: 150,
  fish: 10,
  farm: 12,
  passWin: 220,
};

const SEASON_XP_GUIDE = [
  { icon: '🫧', label: '戳破气泡', desc: '主屏每戳破 1 个', key: 'pop' },
  { icon: '🎮', label: '玩小游戏', desc: '每种小游戏本赛季首次参与', key: 'miniGame' },
  { icon: '📅', label: '领取泡计划', desc: '泡计划点「领取」每领 1 次', key: 'questClaim' },
  { icon: '🎣', label: '钓上一条鱼', desc: '钓鱼每成功入篓 1 条', key: 'fish' },
  { icon: '🌾', label: '农场收获', desc: '泡泡农场每收获 1 次', key: 'farm' },
  { icon: '🎫', label: '完成通行证挑战', desc: '60 秒内达标；全通后可「复习挑战」继续拿经验', key: 'passWin' },
];

const SEASON_TASK_DEFS = [
  { id: 'pops5k', name: '戳泡五千', desc: '本赛季累计戳破 5000 个气泡', goal: 5000, xp: 350,
    progress() { return seasonState.stats.pops | 0; } },
  { id: 'mini15', name: '小游戏巡游', desc: '本赛季玩过 15 种不同小游戏', goal: 15, xp: 300,
    progress() { return (seasonState.stats.miniGames || []).length; } },
  { id: 'quest10', name: '泡计划十日', desc: '本赛季领取泡计划奖励 10 次', goal: 10, xp: 400,
    progress() { return seasonState.stats.questClaims | 0; } },
  { id: 'fish60', name: '渔季丰收', desc: '本赛季钓上 60 条鱼', goal: 60, xp: 280,
    progress() { return seasonState.stats.fish | 0; } },
  { id: 'farm50', name: '农场季收', desc: '本赛季农场收获 50 次', goal: 50, xp: 280,
    progress() { return seasonState.stats.farm | 0; } },
];

const seasonState = {
  seasonIndex: -1,
  xp: 0,
  claimedTiers: {},
  tasksDone: {},
  stats: { pops: 0, miniGames: [], questClaims: 0, fish: 0, farm: 0 },
};

function seasonLengthDays(seasonIndex) {
  const span = SEASON_MAX_DAYS - SEASON_MIN_DAYS + 1;
  return SEASON_MIN_DAYS + (questDayHash(`season_len_v1_${seasonIndex}`) % span);
}

function getSeasonWindow(seasonIndex) {
  let start = SEASON_EPOCH_MS;
  for (let i = 0; i < seasonIndex; i++) {
    start += seasonLengthDays(i) * 86400000;
  }
  const lengthDays = seasonLengthDays(seasonIndex);
  const end = start + lengthDays * 86400000;
  return { index: seasonIndex, start, end, lengthDays };
}

function getCurrentSeasonInfo(now = Date.now()) {
  let idx = 0;
  while (true) {
    const win = getSeasonWindow(idx);
    if (now < win.end) {
      const daysLeft = Math.max(0, Math.ceil((win.end - now) / 86400000));
      const dayIndex = Math.min(win.lengthDays, Math.floor((now - win.start) / 86400000) + 1);
      return { ...win, daysLeft, dayIndex };
    }
    idx++;
    if (idx > 500) break;
  }
  return getSeasonWindow(0);
}

function getSeasonDisplayName(seasonIndex) {
  const base = SEASON_THEME_NAMES[seasonIndex % SEASON_THEME_NAMES.length];
  return `${base} · 第 ${seasonIndex + 1} 季`;
}

function seasonTierXpNeed(tier) {
  return 90 + tier * 38;
}

function seasonXpForTier(tier) {
  let total = 0;
  for (let t = 1; t <= tier; t++) total += seasonTierXpNeed(t);
  return total;
}

function getSeasonTierFromXp(xp) {
  let tier = 0;
  for (let t = 1; t <= SEASON_MAX_TIER; t++) {
    if (xp >= seasonXpForTier(t)) tier = t;
    else break;
  }
  return tier;
}

function getSeasonTierReward(tier) {
  const coins = 180 + tier * 55;
  const reward = { coins };
  if (tier % 5 === 0) reward.glow = 4 + Math.floor(tier / 5) * 3;
  if (tier % 7 === 0) reward.wave = 3 + Math.floor(tier / 7) * 2;
  if (tier === SEASON_MAX_TIER) reward.rockets = 6;
  return reward;
}

function formatSeasonReward(reward) {
  const parts = [];
  if (reward.coins) parts.push(`+${reward.coins.toLocaleString('zh-CN')}💰`);
  if (reward.glow) parts.push(`+${reward.glow}✨`);
  if (reward.wave) parts.push(`+${reward.wave}🌊`);
  if (reward.rockets) parts.push(`+${reward.rockets}🚀`);
  return parts.join(' ');
}

function normalizeSeasonState() {
  if (!seasonState.stats || typeof seasonState.stats !== 'object') {
    seasonState.stats = { pops: 0, miniGames: [], questClaims: 0, fish: 0, farm: 0 };
  }
  if (!Array.isArray(seasonState.stats.miniGames)) seasonState.stats.miniGames = [];
  if (!seasonState.claimedTiers || typeof seasonState.claimedTiers !== 'object') {
    seasonState.claimedTiers = {};
  }
  if (!seasonState.tasksDone || typeof seasonState.tasksDone !== 'object') {
    seasonState.tasksDone = {};
  }
}

function resetSeasonProgress(seasonIndex) {
  seasonState.seasonIndex = seasonIndex;
  seasonState.xp = 0;
  seasonState.claimedTiers = {};
  seasonState.tasksDone = {};
  seasonState.stats = { pops: 0, miniGames: [], questClaims: 0, fish: 0, farm: 0 };
  grantSeasonExclusiveSkin(seasonIndex, { silent: false, equip: true });
}

function grantSeasonTierReward(tier, opts = {}) {
  if (seasonState.claimedTiers[tier]) return false;
  seasonState.claimedTiers[tier] = true;
  const reward = getSeasonTierReward(tier);
  if (reward.coins) addCoins(reward.coins);
  if (reward.glow) addWallet('glowShards', reward.glow, { pop: 'glow' });
  if (reward.wave) addWallet('wavePetals', reward.wave, { pop: 'wave' });
  if (reward.rockets) {
    state.rockets = (state.rockets | 0) + reward.rockets;
    saveInventory();
    refreshLevelUI();
  }
  saveSeason();
  if (!opts.silent) {
    showSeasonToast(`泡季 ${tier} 级`, formatSeasonReward(reward));
  }
  return true;
}

function showSeasonToast(title, rewardTxt) {
  const t = document.createElement('div');
  t.className = 'ach-unlock-toast season';
  t.innerHTML = `
    <div class="ach-unlock-toast-head">🌸 ${title}</div>
    <div class="ach-unlock-toast-name">阶梯奖励已自动发放</div>
    <div class="ach-unlock-toast-reward">${rewardTxt}</div>`;
  document.body.appendChild(t);
  setTimeout(() => {
    t.classList.add('out');
    setTimeout(() => t.remove(), 320);
  }, 2800);
}

function checkSeasonTiers(opts = {}) {
  const tier = getSeasonTierFromXp(seasonState.xp);
  const newlyGranted = [];
  for (let t = 1; t <= tier; t++) {
    if (seasonState.claimedTiers[t]) continue;
    if (grantSeasonTierReward(t, { silent: true })) newlyGranted.push(t);
  }
  if (!opts.silent) {
    newlyGranted.forEach((t, i) => {
      setTimeout(() => {
        const reward = getSeasonTierReward(t);
        showSeasonToast(`泡季 ${t} 级`, formatSeasonReward(reward));
      }, i * 2900);
    });
  }
  if (newlyGranted.length) updateSeasonBadge();
  if (document.getElementById('season-overlay')?.classList.contains('open')) {
    refreshSeasonUI();
  }
}

function grantUnclaimedSeasonTiersSilent() {
  for (let t = 1; t <= SEASON_MAX_TIER; t++) {
    if (seasonState.claimedTiers[t]) continue;
    if (seasonState.xp >= seasonXpForTier(t)) grantSeasonTierReward(t, { silent: true });
  }
}

function addSeasonXp(amount) {
  const amt = amount | 0;
  if (amt <= 0) return;
  ensureSeasonCurrent();
  seasonState.xp += amt;
  saveSeason();
  checkSeasonTiers();
  updateSeasonBadge();
  if (document.getElementById('season-overlay')?.classList.contains('open')) {
    refreshSeasonUI();
  }
}

function ensureSeasonCurrent() {
  normalizeSeasonState();
  const info = getCurrentSeasonInfo();
  if (seasonState.seasonIndex === info.index) return info;
  if (seasonState.seasonIndex >= 0) {
    grantUnclaimedSeasonTiersSilent();
  }
  resetSeasonProgress(info.index);
  saveSeason();
  return info;
}

function checkSeasonTasks() {
  let any = false;
  SEASON_TASK_DEFS.forEach(task => {
    if (seasonState.tasksDone[task.id]) return;
    const cur = task.progress();
    if (cur < task.goal) return;
    seasonState.tasksDone[task.id] = true;
    seasonState.xp += task.xp;
    any = true;
    if (!document.hidden) {
      showSeasonToast(`任务「${task.name}」`, `+${task.xp} 泡季经验`);
    }
  });
  if (any) {
    saveSeason();
    checkSeasonTiers();
    updateSeasonBadge();
    if (document.getElementById('season-overlay')?.classList.contains('open')) {
      refreshSeasonUI();
    }
  }
}

function recordSeasonPop() {
  ensureSeasonCurrent();
  seasonState.stats.pops = (seasonState.stats.pops | 0) + 1;
  addSeasonXp(SEASON_XP_SOURCES.pop);
  checkSeasonTasks();
  saveSeason();
}

function recordSeasonMiniGame(gameId) {
  if (!gameId || !MINI_GAMES[gameId]) return;
  ensureSeasonCurrent();
  normalizeSeasonState();
  const isNew = !seasonState.stats.miniGames.includes(gameId);
  if (isNew) seasonState.stats.miniGames.push(gameId);
  if (isNew) addSeasonXp(SEASON_XP_SOURCES.miniGame);
  checkSeasonTasks();
  saveSeason();
}

function recordSeasonQuestClaim() {
  ensureSeasonCurrent();
  seasonState.stats.questClaims = (seasonState.stats.questClaims | 0) + 1;
  addSeasonXp(SEASON_XP_SOURCES.questClaim);
  checkSeasonTasks();
  saveSeason();
}

function recordSeasonFish() {
  ensureSeasonCurrent();
  seasonState.stats.fish = (seasonState.stats.fish | 0) + 1;
  addSeasonXp(SEASON_XP_SOURCES.fish);
  checkSeasonTasks();
  saveSeason();
}

function recordSeasonFarm() {
  ensureSeasonCurrent();
  seasonState.stats.farm = (seasonState.stats.farm | 0) + 1;
  addSeasonXp(SEASON_XP_SOURCES.farm);
  checkSeasonTasks();
  saveSeason();
}

function recordSeasonPassWin() {
  addSeasonXp(SEASON_XP_SOURCES.passWin);
}

function loadSeason() {
  try {
    const raw = localStorage.getItem(SEASON_STORAGE);
    if (raw) {
      const d = JSON.parse(raw);
      seasonState.seasonIndex = (d.seasonIndex ?? -1) | 0;
      seasonState.xp = d.xp || 0;
      seasonState.claimedTiers = d.claimedTiers || {};
      seasonState.tasksDone = d.tasksDone || {};
      seasonState.stats = d.stats || seasonState.stats;
    }
  } catch (e) {}
  normalizeSeasonState();
  ensureSeasonCurrent();
  grantUnclaimedSeasonTiersSilent();
  updateSeasonBadge();
}

function saveSeason() {
  normalizeSeasonState();
  try {
    localStorage.setItem(SEASON_STORAGE, JSON.stringify({
      seasonIndex: seasonState.seasonIndex,
      xp: seasonState.xp,
      claimedTiers: seasonState.claimedTiers,
      tasksDone: seasonState.tasksDone,
      stats: seasonState.stats,
    }));
  } catch (e) {}
}

function updateSeasonBadge() {
  const btn = document.getElementById('btn-season');
  if (!btn) return;
  const tier = getSeasonTierFromXp(seasonState.xp);
  let unclaimed = false;
  for (let t = 1; t <= tier; t++) {
    if (!seasonState.claimedTiers[t]) { unclaimed = true; break; }
  }
  btn.classList.toggle('season-ready', unclaimed);
  const info = getCurrentSeasonInfo();
  const label = document.getElementById('btn-season-label');
  const daysEl = document.getElementById('btn-season-days');
  if (label) label.textContent = `泡季 Lv.${tier}`;
  if (daysEl) daysEl.textContent = `剩 ${info.daysLeft} 天 · 本季 ${info.lengthDays} 天`;
}

function refreshSeasonUI() {
  ensureSeasonCurrent();
  const info = getCurrentSeasonInfo();
  const tier = getSeasonTierFromXp(seasonState.xp);
  const nextTier = Math.min(SEASON_MAX_TIER, tier + 1);
  const curFloor = tier > 0 ? seasonXpForTier(tier) : 0;
  const nextNeed = seasonXpForTier(nextTier);
  const xpInBand = seasonState.xp - curFloor;
  const bandSize = Math.max(1, nextNeed - curFloor);
  const pct = tier >= SEASON_MAX_TIER ? 100 : Math.min(100, Math.round((xpInBand / bandSize) * 100));

  const titleEl = document.getElementById('season-header-title');
  if (titleEl) titleEl.textContent = `🌸 ${getSeasonDisplayName(info.index)}`;
  const intro = document.getElementById('season-intro');
  if (intro) {
    intro.textContent = `每季 ${SEASON_MIN_DAYS}–${SEASON_MAX_DAYS} 天 · 本季共 ${info.lengthDays} 天 · 戳泡/小游戏/泡计划等攒泡季经验`;
  }
  const nameEl = document.getElementById('season-name');
  if (nameEl) nameEl.textContent = getSeasonDisplayName(info.index);
  const daysEl = document.getElementById('season-days-left');
  if (daysEl) daysEl.textContent = `第 ${info.dayIndex}/${info.lengthDays} 天 · 剩余 ${info.daysLeft} 天`;
  const tierLabel = document.getElementById('season-tier-label');
  if (tierLabel) tierLabel.textContent = tier >= SEASON_MAX_TIER ? `泡季等级 ${tier}（已满）` : `泡季等级 ${tier}`;
  const xpNum = document.getElementById('season-xp-num');
  if (xpNum) {
    xpNum.textContent = tier >= SEASON_MAX_TIER
      ? `${seasonState.xp.toLocaleString('zh-CN')} XP`
      : `${xpInBand.toLocaleString('zh-CN')} / ${bandSize.toLocaleString('zh-CN')} XP`;
  }
  const bar = document.getElementById('season-xp-bar-fill');
  if (bar) bar.style.width = `${pct}%`;

  const skinCard = document.getElementById('season-skin-card');
  if (skinCard) {
    const skin = getSeasonExclusiveSkin(info.index);
    const owned = dailyQuest.unlocked.includes(skin.id);
    const equipped = dailyQuest.equipped === skin.id;
    skinCard.innerHTML = `
      <div class="season-skin-card-inner">
        <span class="season-skin-icon">${skin.icon}</span>
        <div>
          <div class="season-skin-title">本季泡泡肤 · ${skin.name}</div>
          <div class="season-skin-desc">${skin.desc} · 玻璃泡高光 + rim 细边</div>
          <div class="season-skin-meta">${owned ? (equipped ? '已装备' : '已解锁 · 在 🎲 抽皮肤 → 我的皮肤 换上') : '新赛季自动解锁并装备'}</div>
        </div>
      </div>`;
  }

  const guideEl = document.getElementById('season-xp-guide');
  if (guideEl) {
    guideEl.innerHTML = SEASON_XP_GUIDE.map(row => {
      const xp = SEASON_XP_SOURCES[row.key] | 0;
      return `
        <div class="season-xp-row">
          <div class="season-xp-row-icon">${row.icon}</div>
          <div class="season-xp-row-info">
            <div class="season-xp-row-label">${row.label}</div>
            <div class="season-xp-row-desc">${row.desc}</div>
          </div>
          <div class="season-xp-row-val">+${xp} XP</div>
        </div>`;
    }).join('') + `
      <div id="season-xp-guide-note">💡 下方「赛季任务」达成后还会一次性奖励大量泡季经验；升阶后阶梯奖励自动发放到账户。</div>`;
  }

  const tiersEl = document.getElementById('season-tiers');
  if (tiersEl) {
    tiersEl.innerHTML = Array.from({ length: SEASON_MAX_TIER }, (_, i) => {
      const t = i + 1;
      const done = !!seasonState.claimedTiers[t];
      const current = !done && t === nextTier;
      const reward = getSeasonTierReward(t);
      return `
        <div class="season-tier${done ? ' done' : ''}${current ? ' current' : ''}">
          <div class="season-tier-lv">${done ? '✓' : t}</div>
          <div class="season-tier-info">
            <div class="season-tier-reward">${formatSeasonReward(reward)}</div>
            <div class="season-tier-xp">需要 ${seasonXpForTier(t).toLocaleString('zh-CN')} 累计泡季经验</div>
          </div>
        </div>`;
    }).join('');
  }

  const tasksEl = document.getElementById('season-tasks');
  if (tasksEl) {
    tasksEl.innerHTML = SEASON_TASK_DEFS.map(task => {
      const cur = Math.min(task.progress(), task.goal);
      const pctT = Math.round((cur / task.goal) * 100);
      const done = !!seasonState.tasksDone[task.id];
      return `
        <div class="season-task${done ? ' done' : ''}">
          <div class="season-task-name">${done ? '✓ ' : ''}${task.name}</div>
          <div class="season-task-desc">${task.desc} · 完成 +${task.xp} 泡季经验</div>
          <div class="season-task-bar-bg"><div class="season-task-bar-fill" style="width:${pctT}%"></div></div>
          <div class="season-task-meta">${cur.toLocaleString('zh-CN')} / ${task.goal.toLocaleString('zh-CN')}</div>
        </div>`;
    }).join('');
  }
  updateSeasonBadge();
}

function openSeasonModal() {
  refreshSeasonUI();
  document.getElementById('season-overlay').classList.add('open');
}

function closeSeasonModal() {
  document.getElementById('season-overlay').classList.remove('open');
}

// ══════════════════════════════════════════════════════════════════
//  ACHIEVEMENT WALL  (长期动力)
// ══════════════════════════════════════════════════════════════════
const ACH_STORAGE = 'bubbleRelief_achievements_v1';

const achievementStats = {
  lifetimePops: 0,
  farmHarvests: 0,
  fishingCatches: 0,
  uniqueMiniGames: [],
  maxCombo: 0,
  questClaimDays: 0,
  bestQuestStreak: 0,
  paodouMaxFloor: 0,
};
const achievementState = { unlocked: {}, claimed: {} };

const ACH_CATEGORIES = [
  { id: 'pop', title: '🫧 戳泡 · 连击' },
  { id: 'grow', title: '📈 成长 · 通行证' },
  { id: 'play', title: '🎮 小游戏 · 探索' },
  { id: 'life', title: '🌾 农场 · 泡宠 · 泡豆' },
  { id: 'legend', title: '⭐ 传说' },
];

function getContinentPearlTotal() {
  return (mistIsles?.total | 0) + (rainbowBay?.total | 0) + (crystalFrost?.total | 0)
    + (goldPlains?.total | 0) + (deepBath?.total | 0) + (rainforest?.total | 0);
}

function getUniqueMiniGameCount() {
  return (achievementStats.uniqueMiniGames || []).length;
}

function getQuestStreakBest() {
  return Math.max(achievementStats.bestQuestStreak | 0, dailyQuest.streak | 0);
}

function getPaodouFloorBest() {
  return Math.max(achievementStats.paodouMaxFloor | 0, pdTowerFloor | 0);
}

function getStarCrownProgress() {
  let n = 0;
  if (state.level >= 200) n++;
  if (state.passLevel >= 6) n++;
  if (achievementStats.lifetimePops >= 500000) n++;
  if (achievementStats.maxCombo >= 60) n++;
  if (getPaodouFloorBest() >= PD_TOWER_FLOORS) n++;
  return n;
}

function formatAchReward(def) {
  const parts = [];
  if (def.rewardCoins) parts.push(`+${def.rewardCoins.toLocaleString('zh-CN')}💰`);
  if (def.rewardGlow) parts.push(`+${def.rewardGlow}✨`);
  if (def.rewardWave) parts.push(`+${def.rewardWave}🌊`);
  if (def.rewardRockets) parts.push(`+${def.rewardRockets}🚀`);
  return parts.join(' ');
}

const ACHIEVEMENT_DEFS = [
  {
    id: 'pop500', category: 'pop', icon: '💥', name: '戳泡新手',
    desc: '累计戳破 500 个气泡', goal: 500, rewardCoins: 300,
    progress() { return achievementStats.lifetimePops; },
  },
  {
    id: 'pop10k', category: 'pop', icon: '🫧', name: '万泡大师',
    desc: '累计戳破 10000 个气泡', goal: 10000, rewardCoins: 100000,
    progress() { return achievementStats.lifetimePops; },
  },
  {
    id: 'pop50k', category: 'pop', icon: '🌊', name: '泡海征服者',
    desc: '累计戳破 50000 个气泡', goal: 50000, rewardCoins: 200000, rewardGlow: 30,
    progress() { return achievementStats.lifetimePops; },
  },
  {
    id: 'combo15', category: 'pop', icon: '⚡', name: '连击快手',
    desc: '单局连击达到 15', goal: 15, rewardCoins: 600,
    progress() { return achievementStats.maxCombo; },
  },
  {
    id: 'combo40', category: 'pop', icon: '🔥', name: '连击狂魔',
    desc: '单局连击达到 40', goal: 40, rewardCoins: 3500, rewardWave: 15,
    progress() { return achievementStats.maxCombo; },
  },
  {
    id: 'level25', category: 'grow', icon: '🌱', name: '泡友进阶',
    desc: '主等级达到 25', goal: 25, rewardCoins: 1500,
    progress() { return state.level; },
  },
  {
    id: 'level75', category: 'grow', icon: '🚀', name: '泡界老手',
    desc: '主等级达到 75', goal: 75, rewardCoins: 8000, rewardGlow: 20,
    progress() { return state.level; },
  },
  {
    id: 'pass1', category: 'grow', icon: '🥉', name: '通行证入门',
    desc: '完成 1 级通行证挑战', goal: 1, rewardCoins: 800,
    progress() { return state.passLevel; },
  },
  {
    id: 'pass3', category: 'grow', icon: '🥇', name: '通行证全通',
    desc: '完成全部 6 级通行证', goal: 6, rewardCoins: 8000, rewardRockets: 5,
    progress() { return state.passLevel; },
  },
  {
    id: 'mini5', category: 'play', icon: '🎯', name: '小游戏尝鲜',
    desc: '玩过 5 种不同小游戏', goal: 5, rewardCoins: 500,
    progress() { return getUniqueMiniGameCount(); },
  },
  {
    id: 'mini20', category: 'play', icon: '🎪', name: '小游戏达人',
    desc: '玩过 20 种不同小游戏', goal: 20, rewardCoins: 3000, rewardWave: 20,
    progress() { return getUniqueMiniGameCount(); },
  },
  {
    id: 'fish30', category: 'play', icon: '🎣', name: '钓鱼学徒',
    desc: '累计钓上 30 条鱼', goal: 30, rewardCoins: 700,
    progress() { return achievementStats.fishingCatches; },
  },
  {
    id: 'fish100', category: 'play', icon: '🐟', name: '钓鱼高手',
    desc: '累计钓上 100 条鱼', goal: 100, rewardCoins: 2500,
    progress() { return achievementStats.fishingCatches; },
  },
  {
    id: 'pearl80', category: 'play', icon: '🗺', name: '大陆拾珠人',
    desc: '泡泡大陆累计收集 80 颗区域珍珠', goal: 80, rewardCoins: 1800,
    progress() { return getContinentPearlTotal(); },
  },
  {
    id: 'streak7', category: 'play', icon: '📅', name: '泡计划一周',
    desc: '每日泡计划连续完成 7 天', goal: 7, rewardCoins: 1200, rewardGlow: 10,
    progress() { return getQuestStreakBest(); },
  },
  {
    id: 'farm100', category: 'life', icon: '🌾', name: '百次丰收',
    desc: '农场累计收获 100 次', goal: 100, rewardCoins: 3000,
    progress() { return achievementStats.farmHarvests; },
  },
  {
    id: 'farm300', category: 'life', icon: '🚜', name: '农场主力',
    desc: '农场累计收获 300 次', goal: 300, rewardCoins: 9000,
    progress() { return achievementStats.farmHarvests; },
  },
  {
    id: 'bond3', category: 'life', icon: '🫧', name: '泡缘初识',
    desc: '结缘 3 种不同泡宠', goal: 3, rewardCoins: 400,
    progress() { return (bubblePet?.bondedSpecies || []).length; },
  },
  {
    id: 'bond5', category: 'life', icon: '🎋', name: '泡缘五友',
    desc: '结缘 5 种不同泡宠', goal: 5, rewardCoins: 500,
    progress() { return (bubblePet?.bondedSpecies || []).length; },
  },
  {
    id: 'bond10', category: 'life', icon: '💞', name: '泡宠大家庭',
    desc: '结缘 10 种不同泡宠', goal: 10, rewardCoins: 2500, rewardWave: 25,
    progress() { return (bubblePet?.bondedSpecies || []).length; },
  },
  {
    id: 'paodou15', category: 'life', icon: '🏙', name: '大楼攀登者',
    desc: '泡豆大楼到达 15 层', goal: 15, rewardCoins: 1500,
    progress() { return getPaodouFloorBest(); },
  },
  {
    id: 'paodou40', category: 'life', icon: '🛗', name: '半楼征服',
    desc: '泡豆大楼到达 40 层', goal: 40, rewardCoins: 6000, rewardRockets: 2,
    progress() { return getPaodouFloorBest(); },
  },
  {
    id: 'starCrown', category: 'legend', icon: '👑', name: '泡泡星冕',
    desc: '满级 · 通行证全通 · 五十万戳泡 · 连击六十 · 登顶泡豆大楼（五项集齐）',
    goal: 5, rewardCoins: 888888, rewardGlow: 88, rewardWave: 88, rewardRockets: 8,
    legend: true,
    progress() { return getStarCrownProgress(); },
  },
];

function normalizeAchievementStats() {
  if (!Array.isArray(achievementStats.uniqueMiniGames)) {
    achievementStats.uniqueMiniGames = [];
  }
}

function loadAchievementStats() {
  try {
    const raw = localStorage.getItem(ACH_STORAGE);
    if (raw) {
      const d = JSON.parse(raw);
      achievementStats.lifetimePops = d.lifetimePops || 0;
      achievementStats.farmHarvests = d.farmHarvests || 0;
      achievementStats.fishingCatches = d.fishingCatches || 0;
      achievementStats.uniqueMiniGames = Array.isArray(d.uniqueMiniGames) ? d.uniqueMiniGames : [];
      achievementStats.maxCombo = d.maxCombo || 0;
      achievementStats.questClaimDays = d.questClaimDays || 0;
      achievementStats.bestQuestStreak = d.bestQuestStreak || 0;
      achievementStats.paodouMaxFloor = d.paodouMaxFloor || 0;
      achievementState.unlocked = d.unlocked || {};
      achievementState.claimed = d.claimed || {};
    }
  } catch (e) {}
  normalizeAchievementStats();
  ACHIEVEMENT_DEFS.forEach(def => {
    if (def.progress() >= def.goal) achievementState.unlocked[def.id] = true;
  });
  ACHIEVEMENT_DEFS.forEach(def => {
    if (!achievementState.claimed[def.id] && def.progress() >= def.goal) {
      grantAchievementReward(def.id, { silent: true });
    }
  });
  updateAchievementBadge();
}

function saveAchievementStats() {
  normalizeAchievementStats();
  try {
    localStorage.setItem(ACH_STORAGE, JSON.stringify({
      lifetimePops: achievementStats.lifetimePops,
      farmHarvests: achievementStats.farmHarvests,
      fishingCatches: achievementStats.fishingCatches,
      uniqueMiniGames: achievementStats.uniqueMiniGames,
      maxCombo: achievementStats.maxCombo,
      questClaimDays: achievementStats.questClaimDays,
      bestQuestStreak: achievementStats.bestQuestStreak,
      paodouMaxFloor: achievementStats.paodouMaxFloor,
      unlocked: achievementState.unlocked,
      claimed: achievementState.claimed,
    }));
  } catch (e) {}
}

function recordLifetimePop() {
  achievementStats.lifetimePops += 1;
  saveAchievementStats();
  recordSeasonPop();
  checkAchievements();
}

function recordFarmHarvest() {
  achievementStats.farmHarvests += 1;
  saveAchievementStats();
  recordSeasonFarm();
  checkAchievements();
}

function recordMiniGamePlayed(gameId) {
  if (!gameId || !MINI_GAMES[gameId]) return;
  normalizeAchievementStats();
  if (achievementStats.uniqueMiniGames.includes(gameId)) {
    recordSeasonMiniGame(gameId);
    return;
  }
  achievementStats.uniqueMiniGames.push(gameId);
  saveAchievementStats();
  recordSeasonMiniGame(gameId);
  checkAchievements();
}

function recordComboForAch(combo) {
  const c = combo | 0;
  if (c <= (achievementStats.maxCombo | 0)) return;
  achievementStats.maxCombo = c;
  saveAchievementStats();
  checkAchievements();
}

function recordFishingCatchForAch() {
  achievementStats.fishingCatches += 1;
  saveAchievementStats();
  recordSeasonFish();
  checkAchievements();
}

function touchQuestStreakForAch() {
  const s = dailyQuest.streak | 0;
  if (s <= (achievementStats.bestQuestStreak | 0)) return;
  achievementStats.bestQuestStreak = s;
  saveAchievementStats();
  checkAchievements();
}

function recordPaodouFloorForAch(floor) {
  const f = floor | 0;
  if (f <= (achievementStats.paodouMaxFloor | 0)) return;
  achievementStats.paodouMaxFloor = f;
  saveAchievementStats();
  checkAchievements();
}

function grantAchievementReward(id, opts = {}) {
  const def = ACHIEVEMENT_DEFS.find(d => d.id === id);
  if (!def || achievementState.claimed[id]) return false;
  if (def.progress() < def.goal) return false;

  achievementState.unlocked[id] = true;
  achievementState.claimed[id] = true;
  if (def.rewardCoins) addCoins(def.rewardCoins);
  if (def.rewardGlow) addWallet('glowShards', def.rewardGlow, { pop: 'glow' });
  if (def.rewardWave) addWallet('wavePetals', def.rewardWave, { pop: 'wave' });
  if (def.rewardRockets) {
    state.rockets = (state.rockets | 0) + def.rewardRockets;
    saveInventory();
    refreshLevelUI();
  }
  saveAchievementStats();
  if (!opts.silent) showAchievementToast(def);
  return true;
}

function showAchievementToast(def) {
  const rewardTxt = formatAchReward(def);
  const t = document.createElement('div');
  t.className = `ach-unlock-toast${def.legend ? ' legend' : ''}`;
  t.innerHTML = `
    <div class="ach-unlock-toast-head">${def.icon} 成就完成</div>
    <div class="ach-unlock-toast-name">${def.name}</div>
    <div class="ach-unlock-toast-reward">已自动发放 ${rewardTxt}</div>`;
  document.body.appendChild(t);
  setTimeout(() => {
    t.classList.add('out');
    setTimeout(() => t.remove(), 320);
  }, 2800);
}

function checkAchievements() {
  const newlyGranted = [];
  ACHIEVEMENT_DEFS.forEach(def => {
    if (achievementState.claimed[def.id]) return;
    if (def.progress() < def.goal) return;
    if (grantAchievementReward(def.id, { silent: true })) newlyGranted.push(def);
  });
  newlyGranted.forEach((def, i) => {
    setTimeout(() => showAchievementToast(def), i * 2900);
  });
  if (newlyGranted.length) updateAchievementBadge();
  if (document.getElementById('achievement-overlay')?.classList.contains('open')) {
    refreshAchievementUI();
  }
}

function updateAchievementBadge() {
  const btn = document.getElementById('btn-achievement');
  if (!btn) return;
  btn.classList.remove('ach-ready');
}

function refreshAchievementUI() {
  const list = document.getElementById('achievement-list');
  if (!list) return;
  const unlockedCount = ACHIEVEMENT_DEFS.filter(d => achievementState.unlocked[d.id]).length;
  const intro = document.getElementById('achievement-intro');
  if (intro) {
    intro.textContent = `长期动力 · 已解锁 ${unlockedCount}/${ACHIEVEMENT_DEFS.length} · 达成后右上角提示并自动发放奖励`;
  }
  list.innerHTML = ACH_CATEGORIES.map(cat => {
    const defs = ACHIEVEMENT_DEFS.filter(d => d.category === cat.id);
    if (!defs.length) return '';
    const cards = defs.map(def => {
      const cur = Math.min(def.progress(), def.goal);
      const pct = Math.round((cur / def.goal) * 100);
      const done = !!achievementState.claimed[def.id];
      const rewardTxt = formatAchReward(def);
      let actionHtml;
      if (done) {
        actionHtml = `<div class="ach-done-label">✓ 已完成 · ${rewardTxt}</div>`;
      } else {
        const curLabel = def.goal >= 1000 ? cur.toLocaleString('zh-CN') : String(cur);
        const goalLabel = def.goal >= 1000 ? def.goal.toLocaleString('zh-CN') : String(def.goal);
        actionHtml = `<div class="ach-progress-label">${curLabel} / ${goalLabel}</div>`;
      }
      return `
        <div class="ach-card${done ? ' unlocked claimed' : ''}${def.legend ? ' legend' : ''}">
          <div class="ach-icon">${def.icon}</div>
          <div class="ach-info">
            <div class="ach-name">${def.name}</div>
            <div class="ach-desc">${def.desc}</div>
            <div class="ach-bar-bg"><div class="ach-bar-fill" style="width:${pct}%"></div></div>
            ${actionHtml}
          </div>
        </div>`;
    }).join('');
    return `<div class="ach-category"><div class="ach-category-title">${cat.title}</div>${cards}</div>`;
  }).join('');
}

function claimAchievement(id) {
  grantAchievementReward(id);
  refreshAchievementUI();
}

function openAchievementModal() {
  checkAchievements();
  refreshAchievementUI();
  document.getElementById('achievement-overlay').classList.add('open');
}

function closeAchievementModal() {
  document.getElementById('achievement-overlay').classList.remove('open');
}

// ══════════════════════════════════════════════════════════════════
//  AUDIO  (Web Audio API — no files needed)
// ══════════════════════════════════════════════════════════════════
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playPopSuperUniverse() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    // Multiverse collapse — deeper sub-bass than anything before
    [8, 11, 14, 18, 22, 28, 36].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = f;
      g.gain.setValueAtTime(0.6, now + i * 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + 3.5);
      o.connect(g).connect(ctx.destination);
      o.start(now + i * 0.02); o.stop(now + 3.7);
    });

    // 5 simultaneous Big Bang detonations — one per pocket universe
    [0, 0.12, 0.26, 0.42, 0.60].forEach((delay, ui) => {
      const bufLen = Math.floor(ctx.sampleRate * 0.5);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const flt = ctx.createBiquadFilter();
      flt.type = 'bandpass';
      flt.frequency.value = 300 + ui * 1000;
      flt.Q.value = 0.4;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.7, now + delay);
      ng.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.6);
      src.connect(flt).connect(ng).connect(ctx.destination);
      src.start(now + delay); src.stop(now + delay + 0.65);
    });

    // Hyperdimensional chord — 20 harmonics spanning 5 octaves
    [27, 41, 55, 73, 98, 110, 130, 164, 196, 220, 261, 329, 392, 440, 523, 659, 784, 880, 1047, 1319].forEach((freq, i) => {
      const delay = i * 0.04;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = i % 4 === 0 ? 'sine' : i % 4 === 1 ? 'triangle' : i % 4 === 2 ? 'sine' : 'triangle';
      o.frequency.setValueAtTime(freq, now + delay);
      o.frequency.linearRampToValueAtTime(freq * 1.08, now + delay + 1.5);
      g.gain.setValueAtTime(0.001, now + delay);
      g.gain.linearRampToValueAtTime(0.07, now + delay + 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, now + delay + 2.5);
      o.connect(g).connect(ctx.destination);
      o.start(now + delay); o.stop(now + delay + 2.7);
    });

    // Omega transcendence — soaring to frequencies beyond the universe
    [1047, 1319, 1568, 2093, 2637, 3136, 4186].forEach((freq, i) => {
      const delay = 0.6 + i * 0.1;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, now + delay);
      o.frequency.exponentialRampToValueAtTime(freq * 1.5, now + delay + 2.0);
      g.gain.setValueAtTime(0.001, now + delay);
      g.gain.linearRampToValueAtTime(0.13, now + delay + 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, now + delay + 2.8);
      o.connect(g).connect(ctx.destination);
      o.start(now + delay); o.stop(now + delay + 3.0);
    });

    // Infinite reverb shimmer tail — reality dissolving into infinity
    for (let i = 0; i < 8; i++) {
      const delay = 1.0 + i * 0.25;
      const freq = 660 * Math.pow(1.12, i);
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, now + delay);
      o.frequency.linearRampToValueAtTime(freq * 0.85, now + delay + 1.8);
      g.gain.setValueAtTime(0.09 - i * 0.009, now + delay);
      g.gain.exponentialRampToValueAtTime(0.001, now + delay + 2.0);
      o.connect(g).connect(ctx.destination);
      o.start(now + delay); o.stop(now + delay + 2.2);
    }
  } catch(e) {}
}

function playPopUniverse() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    // Big Bang — everything at once, from absolute silence to full cosmos
    // Sub-bass shockwave — the fabric of spacetime tearing
    [16, 20, 25, 32, 40].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = f;
      g.gain.setValueAtTime(0.5, now + i*0.03);
      g.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
      o.connect(g).connect(ctx.destination);
      o.start(now + i*0.03); o.stop(now + 3.0);
    });
    // Full spectrum noise burst — the Big Bang flash
    const bufLen = Math.floor(ctx.sampleRate * 0.4);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random()*2-1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.8, now); ng.gain.exponentialRampToValueAtTime(0.001, now+0.4);
    src.connect(ng).connect(ctx.destination);
    src.start(now); src.stop(now+0.45);
    // Ascending cosmic chord — matter forming, stars igniting
    [55,73,98,130,164,196,261,329,392,523,659,784,1047,1319,1568].forEach((freq,i) => {
      const delay = i * 0.055;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = i % 3 === 0 ? 'sine' : i % 3 === 1 ? 'triangle' : 'sine';
      o.frequency.setValueAtTime(freq, now + delay);
      g.gain.setValueAtTime(0.001, now + delay);
      g.gain.linearRampToValueAtTime(0.09, now + delay + 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, now + delay + 1.8);
      o.connect(g).connect(ctx.destination);
      o.start(now + delay); o.stop(now + delay + 2.0);
    });
    // Soaring finale — universe fully born, singing its name
    [880, 1109, 1320, 1760].forEach((freq, i) => {
      const delay = 0.5 + i * 0.12;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, now + delay);
      o.frequency.linearRampToValueAtTime(freq * 1.25, now + delay + 1.5);
      g.gain.setValueAtTime(0.001, now + delay);
      g.gain.linearRampToValueAtTime(0.16, now + delay + 0.2);
      g.gain.exponentialRampToValueAtTime(0.001, now + delay + 2.2);
      o.connect(g).connect(ctx.destination);
      o.start(now + delay); o.stop(now + delay + 2.4);
    });
  } catch(e) {}
}

function playPopSupercluster() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    // Majestic deep orchestral chord — 9 layered sine harmonics
    [27.5, 55, 110, 146, 196, 261, 330, 440, 587].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = i < 3 ? 'sawtooth' : 'sine';
      o.frequency.setValueAtTime(freq * (1 + (Math.random()-0.5)*0.008), now + i*0.02);
      g.gain.setValueAtTime(0.001, now + i*0.02);
      g.gain.linearRampToValueAtTime(0.14 - i*0.01, now + i*0.02 + 0.18);
      g.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
      o.connect(g).connect(ctx.destination);
      o.start(now + i*0.02); o.stop(now + 2.4);
    });
    // 7 cluster pings — each galaxy cluster shattering
    [200,320,430,560,680,800,950].forEach((freq, i) => {
      const t = now + i * 0.07;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, t);
      o.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.5);
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      o.connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + 0.6);
    });
    // Cosmic filament shatter — white noise explosion
    const bufLen = Math.floor(ctx.sampleRate * 0.3);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random()*2-1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass'; lpf.frequency.value = 1200;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.5, now); ng.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    src.connect(lpf).connect(ng).connect(ctx.destination);
    src.start(now); src.stop(now + 0.35);
    // Sub-bass gravitational shockwave
    [18, 22, 28].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.45, now + i*0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      o.connect(g).connect(ctx.destination);
      o.start(now + i*0.05); o.stop(now + 2.0);
    });
    // Final soaring high note — the universe singing
    const soar = ctx.createOscillator();
    const sg   = ctx.createGain();
    soar.type = 'sine';
    soar.frequency.setValueAtTime(880, now + 0.4);
    soar.frequency.linearRampToValueAtTime(1760, now + 1.6);
    sg.gain.setValueAtTime(0.001, now + 0.4);
    sg.gain.linearRampToValueAtTime(0.15, now + 0.7);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
    soar.connect(sg).connect(ctx.destination);
    soar.start(now + 0.4); soar.stop(now + 2.1);
  } catch(e) {}
}

function playPopWhiteHole() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    // Explosive ascending pitch — exact opposite of black hole
    const explode = ctx.createOscillator();
    const exG = ctx.createGain();
    explode.type = 'sawtooth';
    explode.frequency.setValueAtTime(25, now);
    explode.frequency.exponentialRampToValueAtTime(1800, now + 0.7);
    exG.gain.setValueAtTime(0.55, now);
    exG.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    explode.connect(exG).connect(ctx.destination);
    explode.start(now); explode.stop(now + 0.85);
    // Rainbow harmonic burst — 7 ascending chimes (one per colour)
    [261, 330, 392, 523, 659, 784, 1047].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, now + i * 0.045);
      o.frequency.linearRampToValueAtTime(freq * 1.5, now + i * 0.045 + 0.35);
      g.gain.setValueAtTime(0.18, now + i * 0.045);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.045 + 0.45);
      o.connect(g).connect(ctx.destination);
      o.start(now + i * 0.045); o.stop(now + i * 0.045 + 0.5);
    });
    // Violent outward noise whoosh — energy being expelled
    const bufLen = Math.floor(ctx.sampleRate * 0.2);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.setValueAtTime(200, now);
    hpf.frequency.exponentialRampToValueAtTime(6000, now + 0.2);
    const wg = ctx.createGain();
    wg.gain.setValueAtTime(0.6, now);
    wg.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    src.connect(hpf).connect(wg).connect(ctx.destination);
    src.start(now); src.stop(now + 0.25);
    // Final blinding flash — ultra-bright spike
    const flash = ctx.createOscillator();
    const fg = ctx.createGain();
    flash.type = 'sine';
    flash.frequency.value = 4000;
    fg.gain.setValueAtTime(0.4, now + 0.3);
    fg.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    flash.connect(fg).connect(ctx.destination);
    flash.start(now + 0.3); flash.stop(now + 0.4);
  } catch(e) {}
}

function playPopNeutronStar() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    // Rapid pulsar ticks — 6 evenly spaced clicks
    for (let i = 0; i < 6; i++) {
      const t = now + i * 0.055;
      const bufLen = Math.floor(ctx.sampleRate * 0.018);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let j = 0; j < bufLen; j++) d[j] = (Math.random()*2-1) * (1 - j/bufLen);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass'; bpf.frequency.value = 3500 - i * 200; bpf.Q.value = 4;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.55 - i*0.06, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
      src.connect(bpf).connect(g).connect(ctx.destination);
      src.start(t); src.stop(t + 0.025);
    }
    // X-ray burst — sharp high ping
    const xray = ctx.createOscillator();
    const xg   = ctx.createGain();
    xray.type = 'sine';
    xray.frequency.setValueAtTime(3200, now);
    xray.frequency.exponentialRampToValueAtTime(800, now + 0.35);
    xg.gain.setValueAtTime(0.28, now);
    xg.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    xray.connect(xg).connect(ctx.destination);
    xray.start(now); xray.stop(now + 0.42);
    // Deep gravitational hum
    const hum = ctx.createOscillator();
    const hg  = ctx.createGain();
    hum.type = 'sine';
    hum.frequency.setValueAtTime(55, now);
    hum.frequency.linearRampToValueAtTime(30, now + 0.8);
    hg.gain.setValueAtTime(0.35, now);
    hg.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    hum.connect(hg).connect(ctx.destination);
    hum.start(now); hum.stop(now + 0.9);
    // Electromagnetic flash — brief white noise burst
    const bufLen2 = Math.floor(ctx.sampleRate * 0.06);
    const buf2 = ctx.createBuffer(1, bufLen2, ctx.sampleRate);
    const d2 = buf2.getChannelData(0);
    for (let i = 0; i < bufLen2; i++) d2[i] = Math.random()*2-1;
    const src2 = ctx.createBufferSource();
    src2.buffer = buf2;
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass'; hpf.frequency.value = 5000;
    const fg = ctx.createGain();
    fg.gain.setValueAtTime(0.4, now); fg.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    src2.connect(hpf).connect(fg).connect(ctx.destination);
    src2.start(now); src2.stop(now + 0.07);
  } catch(e) {}
}

function playPopBlackHole() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    // Gravitational implosion — ultra-deep descending pitch
    const implode = ctx.createOscillator();
    const impG = ctx.createGain();
    implode.type = 'sawtooth';
    implode.frequency.setValueAtTime(80, now);
    implode.frequency.exponentialRampToValueAtTime(18, now + 0.9);
    impG.gain.setValueAtTime(0.6, now);
    impG.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    implode.connect(impG).connect(ctx.destination);
    implode.start(now); implode.stop(now + 1.1);
    // Spaghettification — high shriek descending into the abyss
    const shriek = ctx.createOscillator();
    const shG = ctx.createGain();
    shriek.type = 'sine';
    shriek.frequency.setValueAtTime(1200, now);
    shriek.frequency.exponentialRampToValueAtTime(25, now + 1.3);
    shG.gain.setValueAtTime(0.001, now);
    shG.gain.linearRampToValueAtTime(0.22, now + 0.1);
    shG.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
    shriek.connect(shG).connect(ctx.destination);
    shriek.start(now); shriek.stop(now + 1.4);
    // Sub-bass gravitational wave pulse
    [28, 35, 42].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.4 - i * 0.08, now + i * 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
      o.connect(g).connect(ctx.destination);
      o.start(now + i * 0.04); o.stop(now + 1.1);
    });
    // Short violent noise burst — tidal disruption event
    const bufLen = ctx.sampleRate * 0.12;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass'; lpf.frequency.value = 180;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.9, now); ng.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    src.connect(lpf).connect(ng).connect(ctx.destination);
    src.start(now); src.stop(now + 0.14);
  } catch(e) {}
}

function playPopGalaxy() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    // Ethereal cosmic chord — 5 detuned sine waves
    [130, 196, 261, 330, 392].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq * (1 + (Math.random()-0.5)*0.015), now);
      o.frequency.linearRampToValueAtTime(freq * 0.7, now + 1.4);
      g.gain.setValueAtTime(0.001, now + i * 0.03);
      g.gain.linearRampToValueAtTime(0.12, now + i * 0.03 + 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      o.connect(g).connect(ctx.destination);
      o.start(now + i * 0.03); o.stop(now + 1.6);
    });
    // Dark-matter sub-bass rumble
    [38, 52].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(freq, now);
      o.frequency.exponentialRampToValueAtTime(freq * 0.35, now + 1.1);
      g.gain.setValueAtTime(0.28 - i * 0.06, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      o.connect(g).connect(ctx.destination);
      o.start(now); o.stop(now + 1.3);
    });
    // Cosmic whoosh — wide-band noise sweep
    const bufLen = ctx.sampleRate * 0.25;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.setValueAtTime(3000, now);
    bpf.frequency.linearRampToValueAtTime(400, now + 0.25);
    bpf.Q.value = 1;
    const wg = ctx.createGain();
    wg.gain.setValueAtTime(0.55, now);
    wg.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    src.connect(bpf).connect(wg).connect(ctx.destination);
    src.start(now); src.stop(now + 0.28);
    // High crystal shimmer
    [2093, 2637].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.09, now + i * 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.4);
      o.connect(g).connect(ctx.destination);
      o.start(now + i * 0.06); o.stop(now + 0.5);
    });
  } catch(e) {}
}

function playPopDarkMatter() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    // Sub-bass void rumble — very low freq
    [40, 55, 70].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = i === 0 ? 'sawtooth' : 'sine';
      o.frequency.setValueAtTime(freq, now);
      o.frequency.exponentialRampToValueAtTime(freq * 0.4, now + 1.2);
      g.gain.setValueAtTime(i === 0 ? 0.35 : 0.2, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      o.connect(g).connect(ctx.destination);
      o.start(now); o.stop(now + 1.3);
    });
    // Dark energy crack — short noise burst
    const bufLen = ctx.sampleRate * 0.15;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass'; lpf.frequency.value = 300;
    const crackG = ctx.createGain();
    crackG.gain.setValueAtTime(0.6, now);
    crackG.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    src.connect(lpf).connect(crackG).connect(ctx.destination);
    src.start(now); src.stop(now + 0.18);
    // Eerie high whine fade-in
    const whine = ctx.createOscillator();
    const whineG = ctx.createGain();
    whine.type = 'sine';
    whine.frequency.setValueAtTime(900, now + 0.05);
    whine.frequency.linearRampToValueAtTime(300, now + 0.8);
    whineG.gain.setValueAtTime(0.001, now + 0.05);
    whineG.gain.linearRampToValueAtTime(0.14, now + 0.2);
    whineG.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    whine.connect(whineG).connect(ctx.destination);
    whine.start(now + 0.05); whine.stop(now + 1.0);
  } catch(e) {}
}

function playPopGoldDiamond() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    // Deep golden gong hit
    const gong = ctx.createOscillator();
    const gongG = ctx.createGain();
    gong.type = 'sine';
    gong.frequency.setValueAtTime(220, now);
    gong.frequency.exponentialRampToValueAtTime(110, now + 0.6);
    gongG.gain.setValueAtTime(0.5, now);
    gongG.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    gong.connect(gongG).connect(ctx.destination);
    gong.start(now); gong.stop(now + 0.85);
    // Bright crystal chimes on top
    [1047, 1319, 1568, 2093].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, now + i * 0.05);
      g.gain.linearRampToValueAtTime(0.18, now + i * 0.05 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.5);
      o.connect(g).connect(ctx.destination);
      o.start(now + i * 0.05); o.stop(now + i * 0.05 + 0.55);
    });
    // Golden shimmer noise
    const bufLen = ctx.sampleRate * 0.1;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass'; bpf.frequency.value = 4000; bpf.Q.value = 1.5;
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.4, now); sg.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    src.connect(bpf).connect(sg).connect(ctx.destination);
    src.start(now); src.stop(now + 0.12);
  } catch(e) {}
}

function playPopDiamond() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    // bright crystal chime — three high sine harmonics
    [1047, 1319, 1568].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, now + i * 0.04);
      g.gain.linearRampToValueAtTime(0.22, now + i * 0.04 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.55);
      o.connect(g).connect(ctx.destination);
      o.start(now + i * 0.04);
      o.stop(now + i * 0.04 + 0.6);
    });
    // sparkle shimmer noise burst
    const bufLen = ctx.sampleRate * 0.08;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass'; bpf.frequency.value = 6000; bpf.Q.value = 2;
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.3, now);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    src.connect(bpf).connect(sg).connect(ctx.destination);
    src.start(now); src.stop(now + 0.1);
  } catch(e) {}
}

function playPopSand() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    // gritty broad-spectrum noise — like sand scattering
    const bufLen = ctx.sampleRate * 0.18;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    // highpass to get that scratchy texture
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 2200;
    // lowpass cap to avoid harsh shrillness
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 7000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    src.connect(hpf).connect(lpf).connect(gain).connect(ctx.destination);
    src.start(now); src.stop(now + 0.2);
    // low thud underneath
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.35, now);
    og.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(og).connect(ctx.destination);
    osc.start(now); osc.stop(now + 0.16);
  } catch(e) {}
}

function playPressStart(wet) {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(wet ? 280 : 440, now);
    osc.frequency.linearRampToValueAtTime(wet ? 200 : 360, now + 0.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(wet ? 0.06 : 0.12, now + 0.08);
    g.gain.linearRampToValueAtTime(0.001, now + 0.6);
    osc.connect(g).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.65);
  } catch(e) { /* ignore */ }
}

function playPop(wet) {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    // noise burst
    const bufLen = ctx.sampleRate * 0.12;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);

    const src = ctx.createBufferSource();
    src.buffer = buf;

    // bandpass centered differently for wet vs dry
    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = wet ? 600 : 1800;
    bpf.Q.value = wet ? 3 : 6;

    // short-decay envelope
    const gain = ctx.createGain();
    const vol = wet ? 0.18 : 0.55;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (wet ? 0.18 : 0.10));

    // slight pitch sine for the "pop" click
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(wet ? 180 : 320, now);
    osc.frequency.exponentialRampToValueAtTime(wet ? 60 : 80, now + 0.1);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(wet ? 0.12 : 0.45, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    src.connect(bpf).connect(gain).connect(ctx.destination);
    osc.connect(oscGain).connect(ctx.destination);
    src.start(now);
    src.stop(now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch(e) { /* ignore */ }
}

/** 敲冰块：1=轻敲 2=重裂 3=敲碎取出（偏闷实，少玻璃脆感） */
function playIceCrack(level) {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    const iceThud = (freq, dur, vol, drop = 0.45) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, now);
      o.frequency.exponentialRampToValueAtTime(freq * drop, now + dur);
      g.gain.setValueAtTime(vol, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur + 0.02);
      o.connect(g).connect(ctx.destination);
      o.start(now);
      o.stop(now + dur + 0.04);
    };

    const crackNoise = (dur, vol, hp, lp) => {
      const bufLen = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        const env = Math.pow(1 - i / bufLen, 1.6);
        data[i] = (Math.random() * 2 - 1) * env;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const hpf = ctx.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.value = hp;
      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = lp;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      src.connect(hpf).connect(lpf).connect(gain).connect(ctx.destination);
      src.start(now);
      src.stop(now + dur + 0.02);
    };

    if (level === 1) {
      iceThud(165, 0.07, 0.22);
      crackNoise(0.04, 0.12, 420, 2400);
    } else if (level === 2) {
      iceThud(130, 0.1, 0.28);
      crackNoise(0.07, 0.2, 320, 2800);
      iceThud(95, 0.08, 0.1, 0.55);
    } else {
      iceThud(110, 0.12, 0.32);
      crackNoise(0.11, 0.24, 260, 3200);
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(520, now + 0.03);
      o.frequency.exponentialRampToValueAtTime(360, now + 0.18);
      g.gain.setValueAtTime(0.001, now + 0.03);
      g.gain.linearRampToValueAtTime(0.08, now + 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      o.connect(g).connect(ctx.destination);
      o.start(now + 0.03);
      o.stop(now + 0.25);
    }
  } catch (e) {}
}

let bathSoundLast = 0;
/** 泡泡浴搓泡沫：轻柔咕嘟声，自动节流避免连发太吵 */
function playBathFoamSound() {
  try {
    const t = performance.now();
    if (t - bathSoundLast < 75) return;
    bathSoundLast = t;

    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    const bufLen = Math.floor(ctx.sampleRate * 0.14);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 520 + Math.random() * 280;
    bpf.Q.value = 2.5;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    src.connect(bpf).connect(gain).connect(ctx.destination);
    src.start(now);
    src.stop(now + 0.16);

    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(210 + Math.random() * 40, now);
    o.frequency.exponentialRampToValueAtTime(95, now + 0.12);
    g.gain.setValueAtTime(0.08, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    o.connect(g).connect(ctx.destination);
    o.start(now);
    o.stop(now + 0.15);
  } catch (e) {}
}

// ══════════════════════════════════════════════════════════════════
//  CANVAS SETUP
// ══════════════════════════════════════════════════════════════════
const board  = document.getElementById('board');
const canvas = document.getElementById('game-canvas');
const ctx2d  = canvas.getContext('2d');

let canvasScale = 1;

function canvasW() {
  return canvas.width / canvasScale;
}

function canvasH() {
  return canvas.height / canvasScale;
}

function resizeCanvas() {
  canvasScale = Math.min(window.devicePixelRatio || 1, 2);
  const w = board.clientWidth;
  const h = board.clientHeight;
  canvas.width = Math.max(1, Math.floor(w * canvasScale));
  canvas.height = Math.max(1, Math.floor(h * canvasScale));
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx2d.setTransform(canvasScale, 0, 0, canvasScale, 0, 0);
}
resizeCanvas();
new ResizeObserver(resizeCanvas).observe(board);

// ══════════════════════════════════════════════════════════════════
//  BUBBLE FACTORY
// ══════════════════════════════════════════════════════════════════
const SHAPES = ['circle','star','heart','square','hexagon','diamond'];
const RAINBOW = ['#f44336','#ff9800','#ffeb3b','#4caf50','#2196f3','#9c27b0','#e91e63'];

function randomColor() {
  return RAINBOW[Math.floor(Math.random() * RAINBOW.length)];
}

function pickShape() {
  if (state.bubbleShape === 'mix') return SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return state.bubbleShape;
}

function pickColor() {
  if (state.bubbleRainbow) return randomColor();
  return state.bubbleColor;
}

function pickBubbleType() {
  const entries = [];
  const push = (id, pct, skip = false) => {
    const p = skip ? 0 : Math.max(0, +pct || 0);
    if (p > 0) entries.push({ id, pct: p });
  };
  push('watermelon', state.watermelonPct, state.watermelonActive);
  push('strawberry', state.strawberryPct);
  push('firework', state.fireworkPct);
  push('lucky', state.luckyPct);
  push('grape', state.grapePct);
  push('soap', state.soapPct);
  push('ice', state.icePct);
  push('jelly', state.jellyPct);
  push('balloon', state.balloonPct);
  push('lightning', state.lightningPct);
  push('magnet', state.magnetPct);
  push('clock', state.clockPct);
  push('speedbubble', state.speedbubblePct);
  push('invisible', state.invisiblePct);
  push('glasswater', state.glassWaterPct);
  push('tnt', state.tntPct);
  push('rainbowsmoke', state.rainbowsmokePct);
  push('jiaoshuee', state.jiaoshueeePct);
  push('jiaoshui', state.jiaoshuiPct);
  push('bomb', state.bombPct);
  push('superuniverse', state.superuniversePct);
  push('universe', state.universePct);
  push('supercluster', state.superclusterPct);
  push('whitehole', state.whiteholePct);
  push('neutronstar', state.neutronstarPct);
  push('blackhole', state.blackholePct);
  push('galaxy', state.galaxyPct);
  push('darkmatter', state.darkmatterPct);
  push('golddiamond', state.golddiamondPct);
  push('diamond', state.diamondPct);
  push('sand', state.sandPct);
  push('water', state.waterPct);

  const total = entries.reduce((sum, e) => sum + e.pct, 0);
  if (total <= 0) return 'dry';

  const roll = Math.random() * 100;
  if (total > 100) {
    let cum = 0;
    for (const e of entries) {
      cum += (e.pct / total) * 100;
      if (roll < cum) return e.id;
    }
    return entries[entries.length - 1].id;
  }

  let cum = 0;
  for (const e of entries) {
    cum += e.pct;
    if (roll < cum) return e.id;
  }
  return 'dry';
}

function createBubble() {
  const w = canvasW(), h = canvasH();
  const type = pickBubbleType(); // 'dry' | 'wet' | 'sand'
  let sizeMul = 1;
  if (type === 'soap') sizeMul = 1.55;
  if (type === 'balloon') sizeMul = 1.15;
  if (type === 'grape') sizeMul = 1.05;
  const r = state.bubbleSize * sizeMul * (0.7 + Math.random() * 0.6);
  const color = type === 'sand'
    ? ['#c8a96e','#d4aa60','#b8956a','#c9a05a','#e0b87a'][Math.floor(Math.random()*5)]
    : type === 'diamond'
    ? ['#a8d8f0','#b39ddb','#80deea','#ce93d8','#90caf9'][Math.floor(Math.random()*5)]
    : type === 'golddiamond'
    ? ['#ffd700','#ffca28','#ffc107','#ffb300','#ffe082'][Math.floor(Math.random()*5)]
    : type === 'darkmatter'
    ? ['#1a0030','#0d001a','#120020','#0a0018','#160028'][Math.floor(Math.random()*5)]
    : type === 'galaxy'
    ? ['#050015','#070020','#040012','#060018','#080025'][Math.floor(Math.random()*5)]
    : type === 'blackhole'
    ? '#000000'
    : type === 'neutronstar'
    ? ['#ddf4ff','#c8eeff','#b0e0ff','#e8f8ff','#a0d8f8'][Math.floor(Math.random()*5)]
    : type === 'whitehole'
    ? '#ffffff'
    : type === 'supercluster'
    ? '#020008'
    : type === 'universe'
    ? '#000005'
    : type === 'superuniverse'
    ? '#000000'
    : type === 'bomb'
    ? '#222222'
    : type === 'jiaoshuee'
    ? '#fffde7'
    : type === 'jiaoshui'
    ? '#e3f2fd'
    : type === 'rainbowsmoke'
    ? '#ffccff'
    : type === 'tnt'
    ? '#cc1100'
    : type === 'glasswater'
    ? '#c8eeff'
    : type === 'watermelon'
    ? '#1a7a0a'
    : type === 'strawberry'
    ? '#e53935'
    : type === 'firework'
    ? '#ff4081'
    : type === 'lucky'
    ? '#ffd54f'
    : type === 'grape'
    ? '#7b1fa2'
    : type === 'soap'
    ? '#e0f7fa'
    : type === 'ice'
    ? '#b3e5fc'
    : type === 'jelly'
    ? '#f48fb1'
    : type === 'balloon'
    ? '#ef5350'
    : type === 'lightning'
    ? '#ffee58'
    : type === 'magnet'
    ? '#78909c'
    : type === 'clock'
    ? '#a1887f'
    : type === 'speedbubble'
    ? '#66bb6a'
    : type === 'invisible'
    ? '#cfd8dc'
    : pickColor();
  let x, y;
  if (state.speedBoostActive && state.speedSpawnSide) {
    // Spawn squeezed into left or right half, then drift to spread
    const halfW = w * 0.5;
    if (state.speedSpawnSide === 'left') {
      x = r + Math.random() * Math.max(1, halfW - r * 2);
    } else {
      x = halfW + r + Math.random() * Math.max(1, halfW - r * 2);
    }
    y = r + Math.random() * (h - r * 2);
  } else {
    x = r + Math.random() * (w - r * 2);
    y = r + Math.random() * (h - r * 2);
  }
  const spreadTargetX = r + Math.random() * (w - r * 2);
  const spreadTargetY = r + Math.random() * (h - r * 2);
  return {
    id: state.nextId++,
    x,
    y,
    r,
    spreadTargetX: state.speedBoostActive ? spreadTargetX : null,
    spreadTargetY: state.speedBoostActive ? spreadTargetY : null,
    spreadUntil: state.speedBoostActive ? performance.now() + 1600 + Math.random() * 1400 : 0,
    shape: pickShape(),
    color,
    type,       // 'dry' | 'wet' | 'sand'
    wet: type === 'wet',   // keep backward compat for drawing
    alpha: 0,
    wobble: 0,
    wobbleDir: Math.random() > 0.5 ? 1 : -1,
    wobbleSpeed: 0.02 + Math.random() * 0.03,
    popping: false,
    popProgress: 0,
    pressing: false,
    pressProgress: 0,
    sandGrains: type === 'sand'
      ? Array.from({length: 28}, () => ({
          ox: (Math.random() - 0.5) * 1.6,
          oy: (Math.random() - 0.5) * 1.6,
          s:  0.04 + Math.random() * 0.1,
          a:  0.4 + Math.random() * 0.5,
        }))
      : null,
    // watermelon: seeds + stripe angles
    wmSeeds: type === 'watermelon'
      ? Array.from({length: 9}, (_, i) => ({
          angle: (Math.PI * 2 / 9) * i + (Math.random()-0.5)*0.4,
          dist:  0.28 + Math.random() * 0.28,
          rot:   Math.random() * Math.PI,
          w:     0.06 + Math.random() * 0.04,
          h:     0.12 + Math.random() * 0.06,
        }))
      : null,
    wmStripes: type === 'watermelon'
      ? Array.from({length: 8}, (_, i) => ({
          angle: (Math.PI * 2 / 8) * i,
          width: 0.08 + Math.random() * 0.06,
        }))
      : null,
    // strawberry: yellow seeds on surface
    sbSeeds: type === 'strawberry'
      ? Array.from({length: 14}, (_, i) => ({
          angle: (Math.PI * 2 / 14) * i + (Math.random()-0.5)*0.35,
          dist:  0.25 + Math.random() * 0.45,
          rot:   Math.random() * Math.PI,
          w:     0.04 + Math.random() * 0.03,
          h:     0.07 + Math.random() * 0.04,
        }))
      : null,
    // glass water: tiny air bubbles + wave phase
    glassAirBubbles: type === 'glasswater'
      ? Array.from({length: 6}, () => ({
          ox:    (Math.random()-0.5) * 1.1,
          oy:    0.1 + Math.random() * 0.6,
          r:     0.03 + Math.random() * 0.05,
          speed: 0.003 + Math.random() * 0.005,
          phase: Math.random() * Math.PI * 2,
        }))
      : null,
    glassWavePhase: type === 'glasswater' ? Math.random() * Math.PI * 2 : 0,
    // TNT: fuse sparks (shares fuse style with bomb)
    tntFuse: type === 'tnt' ? {
      fusePhase: Math.random() * Math.PI * 2,
      sparks: Array.from({length: 8}, () => ({
        angle: -Math.PI/2 + (Math.random()-0.5)*0.7,
        dist:  0.25 + Math.random() * 0.3,
        size:  0.05 + Math.random() * 0.06,
        phase: Math.random() * Math.PI * 2,
        speed: 4 + Math.random() * 5,
        color: ['255,220,0','255,100,0','255,255,50','255,50,0'][Math.floor(Math.random()*4)],
      })),
    } : null,
    // rainbow smoke: drifting wisps inside
    smokeWisps: type === 'rainbowsmoke'
      ? Array.from({length: 10}, (_, i) => ({
          ox:    (Math.random()-0.5) * 1.5,
          oy:    (Math.random()-0.5) * 1.5,
          r:     0.12 + Math.random() * 0.22,
          hue:   i * 36,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 0.8,
          drift: (Math.random()-0.5) * 0.012,
        }))
      : null,
    // multi-hit bubbles: hp system
    hp:          type === 'jelly' ? 2 : (type === 'jiaoshuee' || type === 'jiaoshui') ? 3 : null,
    maxHp:       type === 'jelly' ? 2 : (type === 'jiaoshuee' || type === 'jiaoshui') ? 3 : null,
    frozenUntil: 0,
    revealed: type !== 'invisible',
    inflate: 1,
    hitCooldown: false,
    shakeUntil:  0,
    cracks: (type === 'jelly' || type === 'jiaoshuee' || type === 'jiaoshui')
      ? []   // crack positions added on each hit
      : null,
    // 浇水: water drop particles
    waterDrops: type === 'jiaoshui'
      ? Array.from({length: 8}, (_, i) => ({
          angle: (Math.PI * 2 / 8) * i,
          phase: Math.random() * Math.PI * 2,
          speed: 0.8 + Math.random() * 1.2,
          dist:  0.5 + Math.random() * 0.3,
          size:  0.06 + Math.random() * 0.06,
        }))
      : null,
    // bomb: animated fuse sparks
    bombData: type === 'bomb' ? {
      fusePhase: Math.random() * Math.PI * 2,
      sparks: Array.from({length: 6}, () => ({
        angle: -Math.PI/2 + (Math.random()-0.5)*0.6,
        dist:  0.3 + Math.random() * 0.25,
        size:  0.04 + Math.random() * 0.05,
        phase: Math.random() * Math.PI * 2,
        speed: 3 + Math.random() * 4,
        color: ['255,220,0','255,160,0','255,80,0','255,255,100'][Math.floor(Math.random()*4)],
      })),
      explosionRadius: 0, // set at pop time
    } : null,
    // superuniverse: multiverse pocket universes + hyperdimensional geometry
    suData: type === 'superuniverse' ? {
      // 5 pocket universes orbiting inside
      pockets: Array.from({length: 5}, (_, i) => ({
        angle:  (Math.PI * 2 / 5) * i,
        orbitR: 0.42 + Math.random() * 0.15,
        size:   0.14 + Math.random() * 0.12,
        speed:  0.006 + Math.random() * 0.008,
        hue:    i * 72,
        spin:   Math.random() * Math.PI * 2,
        spinSpd:0.02 + Math.random() * 0.02,
        stars:  Array.from({length: 12}, () => ({
          ox: (Math.random()-0.5)*1.6, oy: (Math.random()-0.5)*1.6,
          size: 0.06 + Math.random() * 0.1,
          phase: Math.random()*Math.PI*2, speed: 1+Math.random()*2,
        })),
      })),
      // Hyperdimensional mandala rings — impossible rotating geometry
      rings: Array.from({length: 8}, (_, i) => ({
        r: 0.15 + i * 0.1,
        sides: 3 + i,
        speed: (i % 2 === 0 ? 1 : -1) * (0.008 + i * 0.003),
        angle: (Math.PI * 2 / 8) * i,
        hue:   i * 45,
        alpha: 0.25 + (8 - i) * 0.04,
      })),
      // Fractal starfield — 3 nested depth layers
      stars: Array.from({length: 100}, () => ({
        ox: (Math.random()-0.5)*1.9, oy: (Math.random()-0.5)*1.9,
        size: 0.004 + Math.random() * 0.016,
        phase: Math.random()*Math.PI*2, speed: 0.5+Math.random()*3,
        color: ['255,255,255','255,200,120','180,200,255','255,180,255','120,255,220','255,255,120'][Math.floor(Math.random()*6)],
      })),
      corePhase: Math.random() * Math.PI * 2,
    } : null,
    // universe: all cosmic elements combined
    uniData: type === 'universe' ? {
      // 3 layers of stars at different depths
      stars: Array.from({length: 80}, () => ({
        ox: (Math.random()-0.5)*1.85, oy: (Math.random()-0.5)*1.85,
        size: 0.005 + Math.random()*0.022,
        phase: Math.random()*Math.PI*2, speed: 0.3+Math.random()*3,
        color: ['255,255,255','255,220,180','180,210,255','255,180,255','180,255,220'][Math.floor(Math.random()*5)],
      })),
      // 5 nebulae clouds
      nebulae: Array.from({length: 5}, (_, i) => ({
        ox: (Math.random()-0.5)*1.2, oy: (Math.random()-0.5)*1.2,
        size: 0.25+Math.random()*0.35,
        hue: i*72 + Math.random()*40,
        phase: Math.random()*Math.PI*2,
      })),
      // 6 mini galaxies
      galaxies: Array.from({length: 6}, () => ({
        ox: (Math.random()-0.5)*1.5, oy: (Math.random()-0.5)*1.5,
        size: 0.06+Math.random()*0.1,
        spin: Math.random()*Math.PI*2,
        spinSpeed: (Math.random()-0.5)*0.02,
        hue: Math.random()*360,
      })),
      // 3 mini black holes
      holes: Array.from({length: 3}, () => ({
        ox: (Math.random()-0.5)*1.4, oy: (Math.random()-0.5)*1.4,
        size: 0.04+Math.random()*0.06,
        diskAngle: Math.random()*Math.PI*2,
        diskSpeed: 0.01+Math.random()*0.02,
      })),
      // Big Bang core pulse
      bigBangPhase: Math.random()*Math.PI*2,
    } : null,
    // supercluster: cosmic web nodes (galaxy clusters)
    scNodes: type === 'supercluster'
      ? (() => {
          const nodes = Array.from({length: 7}, (_, i) => ({
            ox: (Math.random() - 0.5) * 1.4,
            oy: (Math.random() - 0.5) * 1.4,
            size: 0.1 + Math.random() * 0.2,
            color: ['80,140,255','200,80,255','255,120,80','80,220,200','255,200,80','180,255,120','255,80,160'][i],
            phase: Math.random() * Math.PI * 2,
            spinSpeed: (Math.random() - 0.5) * 0.015,
            spinAngle: Math.random() * Math.PI * 2,
          }));
          return nodes;
        })()
      : null,
    // supercluster: background stars
    scStars: type === 'supercluster'
      ? Array.from({length: 50}, () => ({
          ox: (Math.random() - 0.5) * 1.8,
          oy: (Math.random() - 0.5) * 1.8,
          size: 0.008 + Math.random() * 0.018,
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 2,
        }))
      : null,
    // whitehole: outward-streaming rainbow ejecta
    ejecta: type === 'whitehole'
      ? Array.from({length: 24}, (_, i) => ({
          angle:  (Math.PI * 2 / 24) * i + Math.random() * 0.1,
          speed:  0.012 + Math.random() * 0.018,
          r:      0.6 + Math.random() * 0.7,
          size:   0.03 + Math.random() * 0.055,
          alpha:  0.5 + Math.random() * 0.5,
          color:  [
            '255,80,80','255,160,0','255,240,0',
            '80,255,120','0,200,255','140,80,255','255,80,200',
          ][i % 7],
        }))
      : null,
    // neutronstar: magnetosphere charged particles
    magParticles: type === 'neutronstar'
      ? Array.from({length: 22}, (_, i) => ({
          angle:  (Math.PI * 2 / 22) * i,
          r:      0.9 + Math.random() * 0.55,
          speed:  0.04 + Math.random() * 0.06,
          size:   0.025 + Math.random() * 0.04,
          alpha:  0.5 + Math.random() * 0.5,
          color:  ['180,230,255','120,200,255','200,240,255','255,255,255','140,180,255'][Math.floor(Math.random()*5)],
        }))
      : null,
    // blackhole: Hawking radiation particles orbiting the event horizon
    hawking: type === 'blackhole'
      ? Array.from({length: 18}, (_, i) => ({
          angle: (Math.PI * 2 / 18) * i + Math.random() * 0.3,
          orbitR: 1.05 + Math.random() * 0.35,
          speed:  0.018 + Math.random() * 0.025,
          size:   0.025 + Math.random() * 0.04,
          alpha:  0.5 + Math.random() * 0.5,
          color:  ['255,160,30','255,220,80','255,100,0','255,255,180','200,120,255'][Math.floor(Math.random()*5)],
        }))
      : null,
    // galaxy: twinkling stars
    stars: type === 'galaxy'
      ? Array.from({length: 32}, () => ({
          ox:    (Math.random() - 0.5) * 1.7,
          oy:    (Math.random() - 0.5) * 1.7,
          size:  0.02 + Math.random() * 0.055,
          phase: Math.random() * Math.PI * 2,
          speed: 0.8 + Math.random() * 2.5,
          color: ['255,255,255','200,180,255','180,220,255','255,200,180','180,255,220'][Math.floor(Math.random()*5)],
        }))
      : null,
    // dark matter: orbiting void wisps
    wisps: type === 'darkmatter'
      ? Array.from({length: 10}, (_, i) => ({
          angle: (Math.PI * 2 / 10) * i,
          orbitR: 0.55 + Math.random() * 0.45,
          speed:  0.008 + Math.random() * 0.012,
          size:   0.06 + Math.random() * 0.1,
          alpha:  0.4 + Math.random() * 0.5,
        }))
      : null,
    sparkles: (type === 'diamond' || type === 'golddiamond')
      ? Array.from({length: type === 'golddiamond' ? 14 : 8}, () => ({
          ox:    (Math.random() - 0.5) * 1.4,
          oy:    (Math.random() - 0.5) * 1.4,
          size:  0.06 + Math.random() * 0.12,
          phase: Math.random() * Math.PI * 2,
          speed: 1.5 + Math.random() * 2,
        }))
      : null,
  };
}

// ══════════════════════════════════════════════════════════════════
//  SHAPE PATHS
// ══════════════════════════════════════════════════════════════════
function buildPath(ctx, shape, x, y, r, wobble) {
  const w = r * (1 + Math.sin(wobble) * 0.06);
  const h2 = r * (1 + Math.cos(wobble * 1.3) * 0.06);
  ctx.beginPath();
  switch(shape) {
    case 'circle':
      ctx.ellipse(x, y, w, h2, 0, 0, Math.PI * 2);
      break;
    case 'square': {
      const s = r * 1.35;
      const rc = r * 0.18;
      roundRect(ctx, x - s/2, y - s/2, s, s, rc);
      break;
    }
    case 'diamond': {
      const d = r * 1.4;
      ctx.moveTo(x, y - d * (1 + Math.sin(wobble)*0.05));
      ctx.lineTo(x + d * 0.7, y);
      ctx.lineTo(x, y + d * (1 + Math.cos(wobble)*0.05));
      ctx.lineTo(x - d * 0.7, y);
      ctx.closePath();
      break;
    }
    case 'hexagon': {
      const sides = 6;
      for (let i = 0; i < sides; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6 + wobble * 0.05;
        const px = x + Math.cos(a) * r * 1.15;
        const py = y + Math.sin(a) * r * 1.15;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    }
    case 'star': {
      const pts = 5;
      for (let i = 0; i < pts * 2; i++) {
        const a = (Math.PI / pts) * i - Math.PI / 2 + wobble * 0.04;
        const rad = i % 2 === 0 ? r * 1.2 : r * 0.5;
        const px = x + Math.cos(a) * rad;
        const py = y + Math.sin(a) * rad;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    }
    case 'heart': {
      const s = r * 0.052;
      ctx.moveTo(x, y + r * 0.35);
      ctx.bezierCurveTo(x - r*1.1, y - r*0.3 + Math.sin(wobble)*3,
                        x - r*1.1, y - r*1.1,
                        x, y - r*0.35);
      ctx.bezierCurveTo(x + r*1.1, y - r*1.1,
                        x + r*1.1, y - r*0.3 + Math.sin(wobble)*3,
                        x, y + r*0.35);
      break;
    }
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ══════════════════════════════════════════════════════════════════
//  DRAW
// ══════════════════════════════════════════════════════════════════
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
}

const SUNSET_SKIN_SPECIAL_TYPES = new Set([
  'superuniverse', 'universe', 'supercluster', 'whitehole', 'neutronstar',
  'blackhole', 'galaxy', 'darkmatter', 'sand', 'rainbowsmoke', 'jiaoshuee',
  'jiaoshui', 'watermelon', 'strawberry', 'firework', 'lucky', 'glasswater',
  'tnt', 'bomb', 'diamond', 'golddiamond', 'soap', 'ice', 'jelly', 'balloon',
  'lightning', 'magnet', 'clock', 'speedbubble', 'invisible', 'grape',
]);

function shouldPaintPremiumBubble(b) {
  const mode = getEquippedBubbleSkinRender();
  if (!mode) return null;
  if (b.popping || b.wet || SUNSET_SKIN_SPECIAL_TYPES.has(b.type)) return null;
  return mode;
}

function shouldPaintSunsetBubble(b) {
  return shouldPaintPremiumBubble(b) === 'sunset';
}

function paintSunsetBubbleFill(b, alpha, squishY, scale) {
  const now = performance.now();
  const pulse = 0.5 + 0.5 * Math.sin(now / 3400);
  const spread = 0.34 + pulse * 0.14;
  const top = b.y - b.r * squishY * scale;
  const bottom = b.y + b.r * squishY * scale;
  const sunY = b.y + b.r * 0.76 * squishY * scale;
  const sunCoreR = b.r * (0.19 + pulse * 0.035);
  const sunGlowR = sunCoreR * 2.35;

  const sky = ctx2d.createLinearGradient(b.x, top, b.x, bottom);
  sky.addColorStop(0, `rgba(107, 28, 22, ${0.94 * alpha})`);
  sky.addColorStop(0.22, `rgba(156, 52, 28, ${0.9 * alpha})`);
  sky.addColorStop(0.42, `rgba(198, 82, 32, ${0.82 * alpha})`);
  sky.addColorStop(0.58 + spread * 0.08, `rgba(255, 183, 77, ${0.62 * alpha})`);
  sky.addColorStop(0.78, `rgba(255, 236, 160, ${0.48 * alpha})`);
  sky.addColorStop(1, `rgba(255, 249, 196, ${0.36 * alpha})`);
  ctx2d.fillStyle = sky;
  ctx2d.fillRect(b.x - b.r * 2, top - b.r * 0.2, b.r * 4, bottom - top + b.r * 0.5);

  const glow = ctx2d.createRadialGradient(b.x, sunY, sunCoreR * 0.35, b.x, sunY, sunGlowR);
  glow.addColorStop(0, `rgba(255, 248, 210, ${0.55 * alpha})`);
  glow.addColorStop(0.45, `rgba(255, 236, 140, ${0.28 * alpha})`);
  glow.addColorStop(1, 'rgba(255, 193, 7, 0)');
  ctx2d.fillStyle = glow;
  ctx2d.beginPath();
  ctx2d.arc(b.x, sunY, sunGlowR, 0, Math.PI * 2);
  ctx2d.fill();

  const core = ctx2d.createRadialGradient(
    b.x - sunCoreR * 0.22, sunY - sunCoreR * 0.22, 0,
    b.x, sunY, sunCoreR
  );
  core.addColorStop(0, `rgba(255, 255, 245, ${0.98 * alpha})`);
  core.addColorStop(0.55, `rgba(255, 244, 180, ${0.94 * alpha})`);
  core.addColorStop(1, `rgba(255, 213, 90, ${0.82 * alpha})`);
  ctx2d.fillStyle = core;
  ctx2d.beginPath();
  ctx2d.arc(b.x, sunY, sunCoreR, 0, Math.PI * 2);
  ctx2d.fill();

  const riseGlow = ctx2d.createRadialGradient(
    b.x, sunY, sunCoreR * 0.5,
    b.x, sunY - b.r * spread * squishY * scale, b.r * (0.92 + pulse * 0.1)
  );
  riseGlow.addColorStop(0, `rgba(255, 248, 210, ${0.28 * alpha})`);
  riseGlow.addColorStop(0.55, `rgba(255, 238, 150, ${0.12 * alpha})`);
  riseGlow.addColorStop(1, 'rgba(255, 248, 210, 0)');
  ctx2d.fillStyle = riseGlow;
  ctx2d.fillRect(b.x - b.r * 2, top, b.r * 4, bottom - top);
}

function paintGlassBubbleFill(b, alpha, squishY, scale, reward) {
  const g = reward?.glass || {};
  const now = performance.now();
  const pulse = 0.5 + 0.5 * Math.sin(now / 2800 + (b.id || 0) * 0.3);
  const top = b.y - b.r * squishY * scale;
  const bottom = b.y + b.r * squishY * scale;
  const [cr, cg, cb] = hexToRgb(reward?.bubble || b.color || '#64b5f6');

  const body = ctx2d.createRadialGradient(
    b.x - b.r * 0.28, b.y - b.r * 0.32, b.r * 0.08,
    b.x, b.y, b.r * 1.02
  );
  body.addColorStop(0, `rgba(255,255,255,${0.92 * alpha})`);
  body.addColorStop(0.35, `rgba(${cr},${cg},${cb},${0.28 * alpha})`);
  body.addColorStop(0.72, `rgba(${cr},${cg},${cb},${0.62 * alpha})`);
  body.addColorStop(1, `rgba(${Math.max(0, cr - 45)},${Math.max(0, cg - 45)},${Math.max(0, cb - 45)},${0.78 * alpha})`);
  ctx2d.fillStyle = body;
  ctx2d.fillRect(b.x - b.r * 1.6, top - b.r * 0.15, b.r * 3.2, bottom - top + b.r * 0.3);

  if (g.rainbow) {
    ctx2d.save();
    for (let i = 0; i < 5; i++) {
      const hue = (now / 40 + i * 72 + (b.id || 0) * 17) % 360;
      ctx2d.globalAlpha = alpha * 0.22;
      ctx2d.strokeStyle = `hsla(${hue}, 85%, 62%, 0.85)`;
      ctx2d.lineWidth = b.r * 0.07;
      ctx2d.beginPath();
      ctx2d.arc(b.x, b.y, b.r * (0.62 + i * 0.04), (now / 3000 + i) * 0.8, (now / 3000 + i) * 0.8 + 1.2);
      ctx2d.stroke();
    }
    ctx2d.restore();
  }

  ctx2d.fillStyle = `rgba(255,255,255,${0.9 * alpha})`;
  ctx2d.beginPath();
  ctx2d.ellipse(b.x - b.r * 0.28, b.y - b.r * 0.32, b.r * 0.34, b.r * 0.22, -0.6, 0, Math.PI * 2);
  ctx2d.fill();

  ctx2d.save();
  ctx2d.globalAlpha = alpha * (0.35 + pulse * 0.2);
  ctx2d.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx2d.lineWidth = Math.max(1, b.r * 0.06);
  ctx2d.beginPath();
  ctx2d.arc(b.x, b.y, b.r * 0.88, -2.4, -0.9);
  ctx2d.stroke();
  ctx2d.restore();
}

function drawBubble(b) {
  const alpha = b.popping ? 1 - b.popProgress : b.alpha;
  if (alpha <= 0) return;

  const [cr,cg,cb] = hexToRgb(b.color);
  const p = b.pressProgress;

  // Squeeze deformation while pressing: squish horizontally, stretch vertically
  const squishX = 1 - p * 0.22;
  const squishY = 1 + p * 0.22;

  ctx2d.save();
  ctx2d.globalAlpha = alpha;

  const inflate = (b.type === 'balloon' && b.inflate) ? b.inflate : 1;
  const scale = (b.popping ? 1 + b.popProgress * 0.6 : 1) * inflate;
  ctx2d.translate(b.x, b.y);
  ctx2d.scale(scale * squishX, scale * squishY);
  ctx2d.translate(-b.x, -b.y);

  // Soap: translucent rainbow wash
  if (b.type === 'soap' && !b.popping) {
    const now2 = performance.now();
    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.clip();
    for (let i = 0; i < 6; i++) {
      ctx2d.globalAlpha = alpha * 0.18;
      ctx2d.fillStyle = `hsla(${(now2/30 + i*60)%360},90%,70%,1)`;
      ctx2d.beginPath();
      ctx2d.arc(b.x + Math.cos(i)*b.r*0.3, b.y + Math.sin(i)*b.r*0.3, b.r*0.55, 0, Math.PI*2);
      ctx2d.fill();
    }
    ctx2d.restore();
  }
  // Ice crystal tint on ice bubbles themselves
  if (b.type === 'ice' && !b.popping) {
    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.fillStyle = `rgba(180,230,255,${0.35*alpha})`;
    ctx2d.fill();
    ctx2d.restore();
  }

  const darken = p * 0.3;
  buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);

  const premiumRender = shouldPaintPremiumBubble(b);
  if (premiumRender === 'sunset') {
    ctx2d.save();
    ctx2d.clip();
    paintSunsetBubbleFill(b, alpha, squishY, scale);
    ctx2d.restore();
  } else if (premiumRender === 'glass') {
    const skinReward = dailyQuest.equipped ? getQuestRewardById(dailyQuest.equipped) : null;
    ctx2d.save();
    ctx2d.clip();
    paintGlassBubbleFill(b, alpha, squishY, scale, skinReward);
    ctx2d.restore();
  } else if (b.type === 'superuniverse' || b.type === 'universe' || b.type === 'supercluster') {
    ctx2d.fillStyle = 'rgba(0,0,5,1)';
    ctx2d.fill();
  } else if (b.type === 'whitehole') {
    ctx2d.fillStyle = 'rgba(255,255,255,1)';
    ctx2d.fill();
  } else if (b.type === 'neutronstar') {
    ctx2d.fillStyle = `rgba(${hexToRgb(b.color).join(',')},0.92)`;
    ctx2d.fill();
  } else if (b.type === 'blackhole' || b.type === 'galaxy' || b.type === 'darkmatter') {
    ctx2d.fillStyle = `rgba(0,0,0,1)`;
    ctx2d.fill();
  } else if (b.type === 'sand') {
    ctx2d.fillStyle = `rgba(${cr},${cg},${cb},0.82)`;
    ctx2d.fill();
  } else if (b.wet) {
    ctx2d.fillStyle = `rgba(${Math.max(0,cr-darken*255)},${Math.max(0,cg-darken*100)},${cb},0.35)`;
    ctx2d.fill();
  } else {
    ctx2d.fillStyle = `rgba(${cr},${cg},${cb},${0.75 + p * 0.15})`;
    ctx2d.fill();
  }

  // Water fill
  if (b.wet) {
    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.clip();
    const waterH = b.r * 2 * 0.65;
    const waterY = b.y + b.r - waterH + Math.sin(performance.now() / 600 + b.id) * 2;
    ctx2d.fillStyle = `rgba(${cr},${cg},${cb},0.55)`;
    ctx2d.fillRect(b.x - b.r * 1.5, waterY, b.r * 3, waterH + b.r);
    ctx2d.restore();
  }

  // Sand grain fill
  if (b.type === 'sand' && b.sandGrains) {
    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.clip();
    for (const g of b.sandGrains) {
      const gx = b.x + g.ox * b.r;
      const gy = b.y + g.oy * b.r;
      const gs = g.s * b.r;
      ctx2d.globalAlpha = alpha * g.a;
      ctx2d.fillStyle = `rgba(90,60,20,0.9)`;
      ctx2d.beginPath();
      ctx2d.ellipse(gx, gy, gs, gs * 0.7, g.ox * 2, 0, Math.PI * 2);
      ctx2d.fill();
    }
    ctx2d.globalAlpha = alpha;
    // sandy fill at bottom
    const sandFillY = b.y + b.r * 0.1;
    const sandGrd = ctx2d.createLinearGradient(b.x, sandFillY - b.r * 0.4, b.x, sandFillY + b.r * 0.9);
    sandGrd.addColorStop(0, `rgba(${cr},${Math.max(0,cg-20)},${Math.max(0,cb-40)},0)`);
    sandGrd.addColorStop(1, `rgba(${cr},${Math.max(0,cg-20)},${Math.max(0,cb-40)},0.5)`);
    ctx2d.fillStyle = sandGrd;
    ctx2d.fillRect(b.x - b.r * 1.5, sandFillY - b.r * 0.4, b.r * 3, b.r * 1.5);
    ctx2d.restore();
  }

  // ── 彩虹烟 — rainbow smoke bubble ───────────────────────────────
  if (b.type === 'rainbowsmoke') {
    const now = performance.now();

    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.clip();

    // Base — soft white-grey smoky fill
    const baseGrd = ctx2d.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    baseGrd.addColorStop(0,   'rgba(255,255,255,0.9)');
    baseGrd.addColorStop(0.5, 'rgba(240,235,255,0.75)');
    baseGrd.addColorStop(1,   'rgba(200,190,220,0.6)');
    ctx2d.fillStyle = baseGrd;
    ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

    // Drifting rainbow smoke puffs
    if (b.smokeWisps) {
      for (const w of b.smokeWisps) {
        w.phase += w.speed * 0.018;
        w.ox    += w.drift;
        if (w.ox > 0.8 || w.ox < -0.8) w.drift *= -1;
        const wx  = b.x + w.ox * b.r;
        const wy  = b.y + w.oy * b.r + Math.sin(w.phase) * b.r * 0.12;
        const wr  = w.r * b.r * (0.8 + 0.2 * Math.sin(w.phase * 1.3));
        const hue = (w.hue + now / 60) % 360;
        const puffGrd = ctx2d.createRadialGradient(wx, wy, 0, wx, wy, wr);
        puffGrd.addColorStop(0,   `hsla(${hue},90%,75%,0.65)`);
        puffGrd.addColorStop(0.5, `hsla(${(hue+40)%360},80%,70%,0.3)`);
        puffGrd.addColorStop(1,   'rgba(255,255,255,0)');
        ctx2d.save();
        ctx2d.globalAlpha = alpha * 0.85;
        ctx2d.fillStyle = puffGrd;
        ctx2d.beginPath();
        ctx2d.arc(wx, wy, wr, 0, Math.PI*2);
        ctx2d.fill();
        ctx2d.restore();
      }
    }

    // Rainbow shimmer ring near edge
    for (let i = 0; i < 7; i++) {
      const hue = (i * 51 + now / 80) % 360;
      const a0  = (Math.PI * 2 / 7) * i + now / 2000;
      const a1  = a0 + (Math.PI * 2 / 7) * 0.92;
      ctx2d.save();
      ctx2d.globalAlpha = alpha * 0.45;
      ctx2d.strokeStyle = `hsla(${hue},100%,65%,1)`;
      ctx2d.lineWidth   = b.r * 0.1;
      ctx2d.beginPath();
      ctx2d.arc(b.x, b.y, b.r * 0.78, a0, a1);
      ctx2d.stroke();
      ctx2d.restore();
    }

    ctx2d.restore();

    // Soft external glow
    const glowPulse = 0.5 + 0.5 * Math.sin(now / 600);
    ctx2d.save();
    ctx2d.globalAlpha = alpha * 0.2 * glowPulse;
    const extGrd = ctx2d.createRadialGradient(b.x, b.y, b.r * 0.7, b.x, b.y, b.r * 1.5);
    extGrd.addColorStop(0,   `hsla(${(now/50)%360},90%,75%,0.6)`);
    extGrd.addColorStop(1,   'rgba(0,0,0,0)');
    ctx2d.fillStyle = extGrd;
    ctx2d.beginPath();
    ctx2d.arc(b.x, b.y, b.r * 1.5, 0, Math.PI*2);
    ctx2d.fill();
    ctx2d.restore();
  }

  // ── 教书鹅 — white goose bubble, 3 hits to pop ──────────────────
  if (b.type === 'jiaoshuee') {
    const now = performance.now();
    // Shake when hit
    let sx = b.x, sy = b.y;
    if (b.shakeUntil && now < b.shakeUntil) {
      const t = 1 - (b.shakeUntil - now) / 380;
      sx += Math.sin(now / 40) * b.r * 0.12 * (1 - t);
      sy += Math.cos(now / 35) * b.r * 0.08 * (1 - t);
    }

    ctx2d.save();
    buildPath(ctx2d, b.shape, sx, sy, b.r, b.wobble);
    ctx2d.clip();

    // Cream-white body
    const gooseGrd = ctx2d.createRadialGradient(sx - b.r*0.25, sy - b.r*0.25, 0, sx, sy, b.r);
    gooseGrd.addColorStop(0, '#fffff5');
    gooseGrd.addColorStop(0.6, '#fffde7');
    gooseGrd.addColorStop(1, '#f5e6a0');
    ctx2d.fillStyle = gooseGrd;
    ctx2d.fillRect(sx - b.r*1.5, sy - b.r*1.5, b.r*3, b.r*3);

    // Cracks
    if (b.cracks) {
      ctx2d.save();
      ctx2d.strokeStyle = 'rgba(120,80,0,0.55)';
      ctx2d.lineWidth = Math.max(0.8, b.r * 0.025);
      for (const c of b.cracks) {
        const cx = sx + Math.cos(c.angle) * c.dist * b.r;
        const cy = sy + Math.sin(c.angle) * c.dist * b.r;
        ctx2d.beginPath();
        ctx2d.moveTo(cx, cy);
        ctx2d.lineTo(cx + Math.cos(c.rot) * c.len * b.r, cy + Math.sin(c.rot) * c.len * b.r);
        ctx2d.moveTo(cx, cy);
        ctx2d.lineTo(cx - Math.cos(c.rot + 0.8) * c.len * b.r * 0.6, cy - Math.sin(c.rot + 0.8) * c.len * b.r * 0.6);
        ctx2d.stroke();
      }
      ctx2d.restore();
    }

    ctx2d.restore();

    // HP hearts above bubble
    if (b.hp != null) {
      const hearts = '❤️'.repeat(b.hp) + '🖤'.repeat(3 - b.hp);
      ctx2d.save();
      ctx2d.font = `${Math.max(10, b.r * 0.4)}px serif`;
      ctx2d.textAlign = 'center';
      ctx2d.textBaseline = 'bottom';
      ctx2d.globalAlpha = alpha;
      ctx2d.fillText(hearts, sx, sy - b.r * squishY * scale - 4);
      ctx2d.restore();
    }
  }

  // ── 浇水 — watering-can bubble, 3 hits to pop ────────────────────
  if (b.type === 'jiaoshui') {
    const now = performance.now();
    let sx = b.x, sy = b.y;
    if (b.shakeUntil && now < b.shakeUntil) {
      const t = 1 - (b.shakeUntil - now) / 380;
      sx += Math.sin(now / 38) * b.r * 0.11 * (1 - t);
      sy += Math.cos(now / 42) * b.r * 0.07 * (1 - t);
    }

    ctx2d.save();
    buildPath(ctx2d, b.shape, sx, sy, b.r, b.wobble);
    ctx2d.clip();

    // Water body gradient — blue to cyan
    const waterGrd = ctx2d.createRadialGradient(sx - b.r*0.2, sy - b.r*0.3, 0, sx, sy, b.r);
    waterGrd.addColorStop(0, '#e3f6ff');
    waterGrd.addColorStop(0.4, '#90d4f7');
    waterGrd.addColorStop(0.8, '#42a5d5');
    waterGrd.addColorStop(1, '#1565c0');
    ctx2d.fillStyle = waterGrd;
    ctx2d.fillRect(sx - b.r*1.5, sy - b.r*1.5, b.r*3, b.r*3);

    // Water level — drops with hp
    if (b.hp != null) {
      const levelFrac = b.hp / 3;
      const waterY = sy + b.r * (1 - levelFrac * 1.6);
      ctx2d.save();
      ctx2d.globalAlpha = alpha * 0.35;
      ctx2d.fillStyle = '#1565c0';
      ctx2d.fillRect(sx - b.r, waterY, b.r*2, sy + b.r - waterY);
      // Animated ripple line at water surface
      ctx2d.beginPath();
      ctx2d.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx2d.lineWidth = b.r * 0.04;
      for (let wx = sx - b.r; wx <= sx + b.r; wx += 2) {
        const wy = waterY + Math.sin((wx - sx) / b.r * Math.PI * 2 + now / 300) * b.r * 0.05;
        wx === sx - b.r ? ctx2d.moveTo(wx, wy) : ctx2d.lineTo(wx, wy);
      }
      ctx2d.stroke();
      ctx2d.restore();
    }

    // Floating water drops orbiting
    if (b.waterDrops) {
      for (const wd of b.waterDrops) {
        const a = wd.angle + now / 800 * wd.speed;
        const wx = sx + Math.cos(a) * b.r * wd.dist;
        const wy = sy + Math.sin(a) * b.r * wd.dist * 0.7;
        const pulse = 0.5 + 0.5 * Math.sin(now / 500 * wd.speed + wd.phase);
        ctx2d.save();
        ctx2d.globalAlpha = alpha * pulse * 0.75;
        ctx2d.fillStyle = `rgba(150,220,255,${pulse})`;
        ctx2d.beginPath();
        // Teardrop shape
        ctx2d.arc(wx, wy, Math.max(1, wd.size * b.r), 0, Math.PI*2);
        ctx2d.fill();
        ctx2d.restore();
      }
    }

    // Cracks (damp streaks)
    if (b.cracks) {
      ctx2d.save();
      ctx2d.strokeStyle = 'rgba(20,80,160,0.5)';
      ctx2d.lineWidth = Math.max(0.8, b.r * 0.03);
      for (const c of b.cracks) {
        const cx = sx + Math.cos(c.angle) * c.dist * b.r;
        const cy = sy + Math.sin(c.angle) * c.dist * b.r;
        ctx2d.beginPath();
        ctx2d.moveTo(cx, cy);
        ctx2d.lineTo(cx + Math.cos(c.rot) * c.len * b.r, cy + Math.sin(c.rot) * c.len * b.r);
        ctx2d.moveTo(cx, cy);
        ctx2d.lineTo(cx - Math.cos(c.rot+0.7)*c.len*b.r*0.5, cy - Math.sin(c.rot+0.7)*c.len*b.r*0.5);
        ctx2d.stroke();
      }
      ctx2d.restore();
    }

    ctx2d.restore();

    // HP drops above bubble
    if (b.hp != null) {
      const drops = '💧'.repeat(b.hp) + '🩶'.repeat(3 - b.hp);
      ctx2d.save();
      ctx2d.font = `${Math.max(10, b.r * 0.4)}px serif`;
      ctx2d.textAlign = 'center';
      ctx2d.textBaseline = 'bottom';
      ctx2d.globalAlpha = alpha;
      ctx2d.fillText(drops, sx, sy - b.r * squishY * scale - 4);
      ctx2d.restore();
    }
  }

  // ── 🍉 西瓜泡泡 ─────────────────────────────────────────────────
  if (b.type === 'watermelon') {
    const now = performance.now();

    // Pulsing green outer glow
    const pulse = 0.5 + 0.5 * Math.sin(now / 400);
    ctx2d.save();
    ctx2d.globalAlpha = alpha * 0.3 * pulse;
    const outerGlow = ctx2d.createRadialGradient(b.x, b.y, b.r*0.8, b.x, b.y, b.r*1.5);
    outerGlow.addColorStop(0, 'rgba(50,200,30,0.6)');
    outerGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx2d.fillStyle = outerGlow;
    ctx2d.beginPath(); ctx2d.arc(b.x, b.y, b.r*1.5, 0, Math.PI*2); ctx2d.fill();
    ctx2d.restore();

    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.clip();

    // ── Green rind base ──
    const rindGrd = ctx2d.createRadialGradient(b.x, b.y, b.r*0.55, b.x, b.y, b.r);
    rindGrd.addColorStop(0,   '#2ab818');
    rindGrd.addColorStop(0.6, '#1a8a0a');
    rindGrd.addColorStop(1,   '#0f5a06');
    ctx2d.fillStyle = rindGrd;
    ctx2d.fillRect(b.x-b.r*1.5, b.y-b.r*1.5, b.r*3, b.r*3);

    // ── Dark green stripes ──
    if (b.wmStripes) {
      for (const st of b.wmStripes) {
        ctx2d.save();
        ctx2d.translate(b.x, b.y);
        ctx2d.rotate(st.angle);
        ctx2d.globalAlpha = alpha * 0.55;
        ctx2d.fillStyle = '#0a5005';
        ctx2d.beginPath();
        ctx2d.moveTo(-st.width*b.r, -b.r);
        ctx2d.lineTo( st.width*b.r, -b.r);
        ctx2d.lineTo( st.width*b.r*1.4,  b.r);
        ctx2d.lineTo(-st.width*b.r*1.4,  b.r);
        ctx2d.closePath();
        ctx2d.fill();
        ctx2d.restore();
      }
    }

    // ── Red flesh (inner circle) ──
    const fleshR = b.r * 0.72;
    const fleshGrd = ctx2d.createRadialGradient(b.x-fleshR*0.2, b.y-fleshR*0.2, 0, b.x, b.y, fleshR);
    fleshGrd.addColorStop(0,   '#ff6b6b');
    fleshGrd.addColorStop(0.4, '#ee2222');
    fleshGrd.addColorStop(0.8, '#cc1111');
    fleshGrd.addColorStop(1,   '#991010');
    ctx2d.save();
    ctx2d.globalAlpha = alpha;
    ctx2d.fillStyle = fleshGrd;
    ctx2d.beginPath(); ctx2d.arc(b.x, b.y, fleshR, 0, Math.PI*2); ctx2d.fill();
    ctx2d.restore();

    // Flesh shine
    ctx2d.save();
    ctx2d.globalAlpha = alpha * 0.28;
    const shineG = ctx2d.createRadialGradient(b.x-fleshR*0.3, b.y-fleshR*0.35, 0, b.x-fleshR*0.3, b.y-fleshR*0.35, fleshR*0.55);
    shineG.addColorStop(0, 'rgba(255,200,200,0.8)'); shineG.addColorStop(1, 'rgba(255,255,255,0)');
    ctx2d.fillStyle = shineG;
    ctx2d.beginPath(); ctx2d.arc(b.x-fleshR*0.3, b.y-fleshR*0.35, fleshR*0.55, 0, Math.PI*2); ctx2d.fill();
    ctx2d.restore();

    // ── Black seeds ──
    if (b.wmSeeds) {
      for (const sd of b.wmSeeds) {
        const sx = b.x + Math.cos(sd.angle) * sd.dist * b.r;
        const sy = b.y + Math.sin(sd.angle) * sd.dist * b.r;
        ctx2d.save();
        ctx2d.translate(sx, sy);
        ctx2d.rotate(sd.rot);
        ctx2d.globalAlpha = alpha * 0.9;
        ctx2d.fillStyle = '#111';
        ctx2d.beginPath();
        ctx2d.ellipse(0, 0, sd.w*b.r, sd.h*b.r, 0, 0, Math.PI*2);
        ctx2d.fill();
        // Seed highlight
        ctx2d.globalAlpha = alpha * 0.3;
        ctx2d.fillStyle = '#555';
        ctx2d.beginPath();
        ctx2d.ellipse(-sd.w*b.r*0.2, -sd.h*b.r*0.25, sd.w*b.r*0.35, sd.h*b.r*0.25, 0, 0, Math.PI*2);
        ctx2d.fill();
        ctx2d.restore();
      }
    }

    // White rind ring between green and red
    ctx2d.save();
    ctx2d.globalAlpha = alpha * 0.6;
    ctx2d.strokeStyle = 'rgba(220,240,200,0.8)';
    ctx2d.lineWidth   = b.r * 0.07;
    ctx2d.beginPath(); ctx2d.arc(b.x, b.y, fleshR + b.r*0.035, 0, Math.PI*2); ctx2d.stroke();
    ctx2d.restore();

    ctx2d.restore(); // end clip
  }

  // ── 🍓 草莓泡泡 ─────────────────────────────────────────────────
  if (b.type === 'strawberry') {
    const now = performance.now();
    const pulse = 0.5 + 0.5 * Math.sin(now / 380);

    ctx2d.save();
    ctx2d.globalAlpha = alpha * 0.35 * pulse;
    const outerGlow = ctx2d.createRadialGradient(b.x, b.y, b.r*0.7, b.x, b.y, b.r*1.45);
    outerGlow.addColorStop(0, 'rgba(255,60,90,0.7)');
    outerGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx2d.fillStyle = outerGlow;
    ctx2d.beginPath(); ctx2d.arc(b.x, b.y, b.r*1.45, 0, Math.PI*2); ctx2d.fill();
    ctx2d.restore();

    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.clip();

    const flesh = ctx2d.createRadialGradient(b.x - b.r*0.2, b.y - b.r*0.25, 0, b.x, b.y, b.r);
    flesh.addColorStop(0,   '#ff8a9a');
    flesh.addColorStop(0.45,'#e53935');
    flesh.addColorStop(0.85,'#c62828');
    flesh.addColorStop(1,   '#8e0000');
    ctx2d.fillStyle = flesh;
    ctx2d.fillRect(b.x-b.r*1.5, b.y-b.r*1.5, b.r*3, b.r*3);

    // Leafy top
    ctx2d.save();
    ctx2d.globalAlpha = alpha * 0.95;
    ctx2d.fillStyle = '#2e7d32';
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI/2 + (i - 2) * 0.35;
      const lx = b.x + Math.cos(a) * b.r * 0.15;
      const ly = b.y - b.r * 0.55;
      ctx2d.beginPath();
      ctx2d.ellipse(lx, ly, b.r*0.18, b.r*0.28, a, 0, Math.PI*2);
      ctx2d.fill();
    }
    ctx2d.restore();

    // Seeds
    if (b.sbSeeds) {
      for (const sd of b.sbSeeds) {
        const sx = b.x + Math.cos(sd.angle) * sd.dist * b.r;
        const sy = b.y + Math.sin(sd.angle) * sd.dist * b.r;
        ctx2d.save();
        ctx2d.translate(sx, sy);
        ctx2d.rotate(sd.rot);
        ctx2d.globalAlpha = alpha * 0.9;
        ctx2d.fillStyle = '#ffecb3';
        ctx2d.beginPath();
        ctx2d.ellipse(0, 0, sd.w*b.r, sd.h*b.r, 0, 0, Math.PI*2);
        ctx2d.fill();
        ctx2d.restore();
      }
    }

    // Shine
    ctx2d.save();
    ctx2d.globalAlpha = alpha * 0.3;
    const shine = ctx2d.createRadialGradient(b.x-b.r*0.3, b.y-b.r*0.35, 0, b.x-b.r*0.3, b.y-b.r*0.35, b.r*0.5);
    shine.addColorStop(0, 'rgba(255,255,255,0.85)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    ctx2d.fillStyle = shine;
    ctx2d.beginPath(); ctx2d.arc(b.x-b.r*0.3, b.y-b.r*0.35, b.r*0.5, 0, Math.PI*2); ctx2d.fill();
    ctx2d.restore();

    ctx2d.restore(); // end clip
  }

  // ── 🎆 烟花泡泡 ─────────────────────────────────────────────────
  if (b.type === 'firework') {
    const now = performance.now();
    const pulse = 0.5 + 0.5 * Math.sin(now / 220);
    ctx2d.save();
    ctx2d.globalAlpha = alpha * 0.4 * pulse;
    const glow = ctx2d.createRadialGradient(b.x, b.y, b.r*0.5, b.x, b.y, b.r*1.5);
    glow.addColorStop(0, `hsla(${(now/8)%360},100%,65%,0.9)`);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx2d.fillStyle = glow;
    ctx2d.beginPath(); ctx2d.arc(b.x, b.y, b.r*1.5, 0, Math.PI*2); ctx2d.fill();
    ctx2d.restore();

    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.clip();
    const base = ctx2d.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    base.addColorStop(0, '#fff3e0');
    base.addColorStop(0.35, '#ff80ab');
    base.addColorStop(0.7, '#e040fb');
    base.addColorStop(1, '#7b1fa2');
    ctx2d.fillStyle = base;
    ctx2d.fillRect(b.x-b.r*1.5, b.y-b.r*1.5, b.r*3, b.r*3);

    // Spark spokes
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI * 2 / 10) * i + now / 600;
      const len = b.r * (0.35 + 0.15 * Math.sin(now/200 + i));
      ctx2d.strokeStyle = `hsla(${(i*36 + now/10)%360},100%,70%,${0.7*alpha})`;
      ctx2d.lineWidth = Math.max(1.5, b.r * 0.06);
      ctx2d.beginPath();
      ctx2d.moveTo(b.x, b.y);
      ctx2d.lineTo(b.x + Math.cos(a)*len, b.y + Math.sin(a)*len);
      ctx2d.stroke();
    }
    ctx2d.restore();
  }

  // ── 🍀 幸运泡泡 ─────────────────────────────────────────────────
  if (b.type === 'lucky') {
    const now = performance.now();
    const pulse = 0.5 + 0.5 * Math.sin(now / 300);
    ctx2d.save();
    ctx2d.globalAlpha = alpha * 0.45 * pulse;
    const glow = ctx2d.createRadialGradient(b.x, b.y, b.r*0.4, b.x, b.y, b.r*1.55);
    glow.addColorStop(0, 'rgba(255,235,120,0.95)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx2d.fillStyle = glow;
    ctx2d.beginPath(); ctx2d.arc(b.x, b.y, b.r*1.55, 0, Math.PI*2); ctx2d.fill();
    ctx2d.restore();

    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.clip();
    const gold = ctx2d.createRadialGradient(b.x-b.r*0.2, b.y-b.r*0.25, 0, b.x, b.y, b.r);
    gold.addColorStop(0, '#fff8e1');
    gold.addColorStop(0.35, '#ffd54f');
    gold.addColorStop(0.75, '#ffb300');
    gold.addColorStop(1, '#ff6f00');
    ctx2d.fillStyle = gold;
    ctx2d.fillRect(b.x-b.r*1.5, b.y-b.r*1.5, b.r*3, b.r*3);

    // Inner star sparkle
    ctx2d.globalAlpha = alpha * (0.55 + 0.35 * pulse);
    ctx2d.fillStyle = '#fffde7';
    ctx2d.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI/2 + (Math.PI / 5) * i;
      const rad = i % 2 === 0 ? b.r * 0.42 : b.r * 0.18;
      const px = b.x + Math.cos(a) * rad;
      const py = b.y + Math.sin(a) * rad;
      i === 0 ? ctx2d.moveTo(px, py) : ctx2d.lineTo(px, py);
    }
    ctx2d.closePath();
    ctx2d.fill();
    ctx2d.restore();
  }

  // ── 玻璃水球 — glass outer + water inside ───────────────────────
  if (b.type === 'glasswater') {
    const now = performance.now();
    b.glassWavePhase += 0.022;

    // Water layer (clipped to bubble)
    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.clip();

    const waterR = b.r * 0.78;
    const waterGrd = ctx2d.createRadialGradient(b.x, b.y + waterR*0.1, 0, b.x, b.y, waterR);
    waterGrd.addColorStop(0,   'rgba(120,210,255,0.92)');
    waterGrd.addColorStop(0.6, 'rgba(50,150,230,0.85)');
    waterGrd.addColorStop(1,   'rgba(20,100,200,0.75)');
    ctx2d.save();
    ctx2d.globalAlpha = alpha * 0.88;
    ctx2d.fillStyle = waterGrd;
    ctx2d.beginPath();
    ctx2d.arc(b.x, b.y, waterR, 0, Math.PI*2);
    ctx2d.fill();
    ctx2d.restore();

    // Animated wave surface
    ctx2d.save();
    ctx2d.globalAlpha = alpha * 0.7;
    ctx2d.fillStyle = 'rgba(180,235,255,0.6)';
    ctx2d.beginPath();
    const waveTop = b.y - waterR * 0.7;
    ctx2d.moveTo(b.x - waterR, waveTop);
    for (let wx = b.x - waterR; wx <= b.x + waterR; wx += 2) {
      const wy = waveTop
        + Math.sin((wx - b.x) / waterR * Math.PI * 2.5 + b.glassWavePhase) * waterR * 0.06
        + Math.sin((wx - b.x) / waterR * Math.PI * 1.2 + b.glassWavePhase * 0.7) * waterR * 0.04;
      ctx2d.lineTo(wx, wy);
    }
    ctx2d.lineTo(b.x + waterR, b.y + waterR);
    ctx2d.lineTo(b.x - waterR, b.y + waterR);
    ctx2d.closePath();
    ctx2d.fill();
    ctx2d.restore();

    // Rising air bubbles
    if (b.glassAirBubbles) {
      for (const ab of b.glassAirBubbles) {
        ab.oy -= ab.speed;
        if (ab.oy < -0.85) ab.oy = 0.7 + Math.random() * 0.2;
        const ax = b.x + ab.ox * b.r, ay = b.y + ab.oy * b.r;
        ctx2d.save();
        ctx2d.globalAlpha = alpha * 0.55;
        ctx2d.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx2d.lineWidth   = Math.max(0.5, b.r * 0.018);
        ctx2d.beginPath();
        ctx2d.arc(ax, ay, Math.max(1, ab.r * b.r), 0, Math.PI*2);
        ctx2d.stroke();
        ctx2d.restore();
      }
    }

    // Inner water glint
    ctx2d.save();
    ctx2d.globalAlpha = alpha * 0.3;
    ctx2d.fillStyle = 'rgba(255,255,255,0.9)';
    ctx2d.beginPath();
    ctx2d.ellipse(b.x - waterR*0.25, b.y - waterR*0.35, waterR*0.18, waterR*0.08, -0.5, 0, Math.PI*2);
    ctx2d.fill();
    ctx2d.restore();

    ctx2d.restore(); // end water clip

    // Glass shell on top
    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.clip();

    const glassGrd = ctx2d.createRadialGradient(b.x, b.y, b.r * 0.6, b.x, b.y, b.r);
    glassGrd.addColorStop(0,   'rgba(200,240,255,0)');
    glassGrd.addColorStop(0.7, 'rgba(180,230,255,0.08)');
    glassGrd.addColorStop(1,   'rgba(160,220,255,0.35)');
    ctx2d.globalAlpha = alpha;
    ctx2d.fillStyle = glassGrd;
    ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

    // Glass rim highlight top-left arc
    ctx2d.save();
    ctx2d.globalAlpha = alpha * 0.7;
    ctx2d.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx2d.lineWidth   = b.r * 0.07;
    ctx2d.lineCap     = 'round';
    ctx2d.beginPath();
    ctx2d.arc(b.x, b.y, b.r * 0.88, Math.PI * 1.15, Math.PI * 1.7);
    ctx2d.stroke();
    ctx2d.restore();

    // Secondary glint
    ctx2d.save();
    ctx2d.globalAlpha = alpha * 0.45;
    ctx2d.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx2d.lineWidth   = b.r * 0.04;
    ctx2d.beginPath();
    ctx2d.arc(b.x, b.y, b.r * 0.88, Math.PI * 1.85, Math.PI * 2.1);
    ctx2d.stroke();
    ctx2d.restore();

    ctx2d.restore(); // end glass clip
  }

  // ── TNT — mega block, triggers all bombs = full clear ───────────
  if (b.type === 'tnt') {
    const now = performance.now();
    const td  = b.tntFuse;

    // Intense pulsing red danger aura
    const danger = 0.55 + 0.45 * Math.abs(Math.sin(now / 150));
    ctx2d.save();
    ctx2d.globalAlpha = alpha * 0.6 * danger;
    const auraGrd = ctx2d.createRadialGradient(b.x, b.y, b.r * 0.6, b.x, b.y, b.r * 1.7);
    auraGrd.addColorStop(0,   'rgba(255,30,0,0.8)');
    auraGrd.addColorStop(0.5, 'rgba(255,80,0,0.35)');
    auraGrd.addColorStop(1,   'rgba(0,0,0,0)');
    ctx2d.fillStyle = auraGrd;
    ctx2d.beginPath();
    ctx2d.arc(b.x, b.y, b.r * 1.7, 0, Math.PI * 2);
    ctx2d.fill();
    ctx2d.restore();

    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.clip();

    // Red body
    const bodyGrd = ctx2d.createRadialGradient(b.x - b.r*0.25, b.y - b.r*0.3, 0, b.x, b.y, b.r);
    bodyGrd.addColorStop(0,   '#ff3311');
    bodyGrd.addColorStop(0.5, '#cc1100');
    bodyGrd.addColorStop(1,   '#6e0800');
    ctx2d.fillStyle = bodyGrd;
    ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

    // Brick grid lines
    ctx2d.save();
    ctx2d.strokeStyle = 'rgba(80,0,0,0.55)';
    ctx2d.lineWidth   = Math.max(0.8, b.r * 0.04);
    const brickRows = 3, brickCols = 4;
    for (let row = 1; row < brickRows; row++) {
      const ly = b.y - b.r + (b.r * 2 / brickRows) * row;
      ctx2d.beginPath(); ctx2d.moveTo(b.x - b.r, ly); ctx2d.lineTo(b.x + b.r, ly); ctx2d.stroke();
    }
    for (let col = 1; col < brickCols; col++) {
      const lx = b.x - b.r + (b.r * 2 / brickCols) * col;
      ctx2d.beginPath(); ctx2d.moveTo(lx, b.y - b.r); ctx2d.lineTo(lx, b.y + b.r); ctx2d.stroke();
    }
    ctx2d.restore();

    // "TNT" text
    const fontSize = Math.max(10, b.r * 0.44);
    ctx2d.save();
    ctx2d.font         = `900 ${fontSize}px monospace`;
    ctx2d.textAlign    = 'center';
    ctx2d.textBaseline = 'middle';
    ctx2d.fillStyle    = '#ffe600';
    ctx2d.shadowColor  = '#ff6600';
    ctx2d.shadowBlur   = b.r * 0.15;
    ctx2d.globalAlpha  = alpha;
    ctx2d.fillText('TNT', b.x, b.y);
    ctx2d.restore();

    ctx2d.restore(); // end clip

    // Fuse (identical style to bomb)
    const fuseBase = { x: b.x, y: b.y - b.r * squishY * scale * 0.9 };
    const fuseEnd  = { x: b.x + b.r * 0.4,  y: b.y - b.r * squishY * scale * 1.6 };
    const fuseMid  = { x: b.x + b.r * 0.55, y: b.y - b.r * squishY * scale * 1.25 };
    ctx2d.save();
    ctx2d.globalAlpha = alpha;
    ctx2d.strokeStyle = '#7a5500';
    ctx2d.lineWidth   = Math.max(2, b.r * 0.07);
    ctx2d.lineCap     = 'round';
    ctx2d.beginPath();
    ctx2d.moveTo(fuseBase.x, fuseBase.y);
    ctx2d.quadraticCurveTo(fuseMid.x, fuseMid.y, fuseEnd.x, fuseEnd.y);
    ctx2d.stroke();
    ctx2d.restore();

    // Fuse sparks — bigger than bomb
    if (td) {
      for (const sp of td.sparks) {
        const flicker = Math.abs(Math.sin(now / 70 * sp.speed + sp.phase));
        if (flicker < 0.12) continue;
        const sx = fuseEnd.x + Math.cos(sp.angle + now/250) * b.r * sp.dist * flicker;
        const sy = fuseEnd.y + Math.sin(sp.angle + now/250) * b.r * sp.dist * flicker;
        ctx2d.save();
        ctx2d.globalAlpha = alpha * flicker;
        ctx2d.shadowBlur  = b.r * 0.2;
        ctx2d.shadowColor = `rgba(${sp.color},0.9)`;
        ctx2d.fillStyle   = `rgba(${sp.color},${flicker})`;
        ctx2d.beginPath();
        ctx2d.arc(sx, sy, Math.max(1.5, b.r * sp.size * flicker), 0, Math.PI*2);
        ctx2d.fill();
        ctx2d.restore();
      }
      // Big fuse-tip glow
      const tipPulse = 0.7 + 0.3 * Math.sin(now / 100 + td.fusePhase);
      ctx2d.save();
      ctx2d.globalAlpha = alpha * tipPulse;
      const tipGrd = ctx2d.createRadialGradient(fuseEnd.x, fuseEnd.y, 0, fuseEnd.x, fuseEnd.y, b.r * 0.35);
      tipGrd.addColorStop(0,   'rgba(255,255,180,1)');
      tipGrd.addColorStop(0.4, 'rgba(255,100,0,0.7)');
      tipGrd.addColorStop(1,   'rgba(255,0,0,0)');
      ctx2d.fillStyle = tipGrd;
      ctx2d.beginPath();
      ctx2d.arc(fuseEnd.x, fuseEnd.y, b.r * 0.35, 0, Math.PI*2);
      ctx2d.fill();
      ctx2d.restore();
    }
  }

  // Bomb — lit fuse, danger glow, chain explosion on pop
  if (b.type === 'bomb') {
    const now = performance.now();
    const bd  = b.bombData;

    // Danger pulsing glow ring outside bubble
    const dangerPulse = 0.5 + 0.5 * Math.sin(now / 200);
    ctx2d.save();
    ctx2d.globalAlpha = alpha * 0.55 * dangerPulse;
    const glowGrd = ctx2d.createRadialGradient(b.x, b.y, b.r * 0.8, b.x, b.y, b.r * 1.5);
    glowGrd.addColorStop(0,   'rgba(255,60,0,0.7)');
    glowGrd.addColorStop(0.5, 'rgba(255,120,0,0.3)');
    glowGrd.addColorStop(1,   'rgba(0,0,0,0)');
    ctx2d.fillStyle = glowGrd;
    ctx2d.beginPath();
    ctx2d.arc(b.x, b.y, b.r * 1.5, 0, Math.PI*2);
    ctx2d.fill();
    ctx2d.restore();

    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.clip();

    // Body — dark metallic gradient
    const bodyGrd = ctx2d.createRadialGradient(b.x - b.r*0.3, b.y - b.r*0.3, b.r*0.05, b.x, b.y, b.r);
    bodyGrd.addColorStop(0,   '#555');
    bodyGrd.addColorStop(0.4, '#222');
    bodyGrd.addColorStop(1,   '#000');
    ctx2d.fillStyle = bodyGrd;
    ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

    // Shine highlight
    ctx2d.save();
    ctx2d.globalAlpha = alpha * 0.35;
    const shineGrd = ctx2d.createRadialGradient(b.x - b.r*0.3, b.y - b.r*0.35, 0, b.x - b.r*0.3, b.y - b.r*0.35, b.r*0.55);
    shineGrd.addColorStop(0, 'rgba(255,255,255,0.7)');
    shineGrd.addColorStop(1, 'rgba(255,255,255,0)');
    ctx2d.fillStyle = shineGrd;
    ctx2d.beginPath();
    ctx2d.arc(b.x - b.r*0.3, b.y - b.r*0.35, b.r*0.55, 0, Math.PI*2);
    ctx2d.fill();
    ctx2d.restore();

    ctx2d.restore(); // end clip

    // Fuse — curved line from top of bubble
    const fuseBase = { x: b.x, y: b.y - b.r * squishY * scale * 0.9 };
    const fuseEnd  = { x: b.x + b.r * 0.35, y: b.y - b.r * squishY * scale * 1.5 };
    const fuseMid  = { x: b.x + b.r * 0.5,  y: b.y - b.r * squishY * scale * 1.2 };
    ctx2d.save();
    ctx2d.globalAlpha = alpha;
    ctx2d.strokeStyle = '#8B6914';
    ctx2d.lineWidth = Math.max(1.5, b.r * 0.06);
    ctx2d.lineCap = 'round';
    ctx2d.beginPath();
    ctx2d.moveTo(fuseBase.x, fuseBase.y);
    ctx2d.quadraticCurveTo(fuseMid.x, fuseMid.y, fuseEnd.x, fuseEnd.y);
    ctx2d.stroke();
    ctx2d.restore();

    // Fuse sparks at the tip
    if (bd) {
      for (const sp of bd.sparks) {
        const flicker = Math.abs(Math.sin(now / 80 * sp.speed + sp.phase));
        if (flicker < 0.15) continue;
        const sx = fuseEnd.x + Math.cos(sp.angle + now/300) * b.r * sp.dist * flicker;
        const sy = fuseEnd.y + Math.sin(sp.angle + now/300) * b.r * sp.dist * flicker;
        ctx2d.save();
        ctx2d.globalAlpha = alpha * flicker * 0.95;
        ctx2d.fillStyle = `rgba(${sp.color},${flicker})`;
        ctx2d.shadowBlur = b.r * 0.15;
        ctx2d.shadowColor = `rgba(${sp.color},0.8)`;
        ctx2d.beginPath();
        ctx2d.arc(sx, sy, Math.max(1, b.r * sp.size * flicker), 0, Math.PI*2);
        ctx2d.fill();
        ctx2d.restore();
      }
      // Bright fuse tip glow
      const tipPulse = 0.6 + 0.4 * Math.sin(now / 120 + bd.fusePhase);
      ctx2d.save();
      ctx2d.globalAlpha = alpha * tipPulse;
      const tipGrd = ctx2d.createRadialGradient(fuseEnd.x, fuseEnd.y, 0, fuseEnd.x, fuseEnd.y, b.r * 0.25);
      tipGrd.addColorStop(0, 'rgba(255,255,180,1)');
      tipGrd.addColorStop(0.4, 'rgba(255,140,0,0.7)');
      tipGrd.addColorStop(1, 'rgba(255,0,0,0)');
      ctx2d.fillStyle = tipGrd;
      ctx2d.beginPath();
      ctx2d.arc(fuseEnd.x, fuseEnd.y, b.r * 0.25, 0, Math.PI*2);
      ctx2d.fill();
      ctx2d.restore();
    }
  }

  // Super Universe — multiverse, infinite parallel realities colliding
  if (b.type === 'superuniverse') {
    const now = performance.now();
    const su = b.suData;
    if (su) {
      // Outer boundary — cascading rainbow shockwaves, faster than universe
      for (let ring = 0; ring < 9; ring++) {
        const phase = ((now / 500 + ring * 0.14) % 1);
        const ringR  = b.r * (1.06 + ring * 0.15 + phase * 0.6);
        const opacity = (1 - phase) * 0.22;
        const hue = (ring * 40 + now / 40) % 360;
        ctx2d.save();
        ctx2d.globalAlpha = alpha * opacity;
        ctx2d.beginPath();
        ctx2d.arc(b.x, b.y, ringR, 0, Math.PI * 2);
        ctx2d.strokeStyle = `hsla(${hue},100%,75%,1)`;
        ctx2d.lineWidth = 2.2;
        ctx2d.stroke();
        ctx2d.restore();
      }

      ctx2d.save();
      buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
      ctx2d.clip();

      // Absolute void — deeper than any darkness
      ctx2d.fillStyle = 'rgba(0,0,0,1)';
      ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

      // Hyperdimensional rotating polygon mandala
      ctx2d.save();
      ctx2d.translate(b.x, b.y);
      for (const ring of su.rings) {
        ring.angle += ring.speed;
        const rr = ring.r * b.r;
        const sides = ring.sides;
        const hue = (ring.hue + now / 50) % 360;
        ctx2d.save();
        ctx2d.rotate(ring.angle);
        ctx2d.globalAlpha = alpha * ring.alpha * (0.7 + 0.3 * Math.sin(now/600 + ring.r*10));
        ctx2d.strokeStyle = `hsla(${hue},100%,70%,1)`;
        ctx2d.lineWidth = 1.2;
        ctx2d.beginPath();
        for (let s = 0; s < sides; s++) {
          const a = (Math.PI * 2 / sides) * s - Math.PI / 2;
          const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
          s === 0 ? ctx2d.moveTo(px, py) : ctx2d.lineTo(px, py);
        }
        ctx2d.closePath();
        ctx2d.stroke();
        ctx2d.restore();
      }
      ctx2d.restore();

      // Fractal background starfield
      for (const st of su.stars) {
        const sx = b.x + st.ox * b.r, sy = b.y + st.oy * b.r;
        const twinkle = 0.2 + 0.8 * Math.abs(Math.sin(now / 450 * st.speed + st.phase));
        const ss = st.size * b.r * twinkle;
        ctx2d.save();
        ctx2d.globalAlpha = alpha * twinkle * 0.85;
        ctx2d.fillStyle = `rgba(${st.color},${twinkle})`;
        ctx2d.beginPath();
        ctx2d.arc(sx, sy, Math.max(0.25, ss), 0, Math.PI*2);
        ctx2d.fill();
        ctx2d.restore();
      }

      // 5 Pocket universes orbiting the center
      for (const pk of su.pockets) {
        pk.angle  += pk.speed;
        pk.spin   += pk.spinSpd;
        const px   = b.x + Math.cos(pk.angle) * b.r * pk.orbitR;
        const py   = b.y + Math.sin(pk.angle) * b.r * pk.orbitR;
        const pr   = pk.size * b.r;
        const hue  = (pk.hue + now / 60) % 360;
        const pulse = 0.7 + 0.3 * Math.sin(now / 700 + pk.angle * 3);

        // Pocket universe glow halo
        ctx2d.save();
        ctx2d.globalAlpha = alpha * 0.35 * pulse;
        const pkHalo = ctx2d.createRadialGradient(px, py, 0, px, py, pr * 2);
        pkHalo.addColorStop(0,   `hsla(${hue},100%,80%,0.7)`);
        pkHalo.addColorStop(0.5, `hsla(${(hue+60)%360},90%,60%,0.2)`);
        pkHalo.addColorStop(1,   'rgba(0,0,0,0)');
        ctx2d.fillStyle = pkHalo;
        ctx2d.beginPath();
        ctx2d.arc(px, py, pr * 2, 0, Math.PI*2);
        ctx2d.fill();
        ctx2d.restore();

        // Mini universe interior — deep space with stars
        ctx2d.save();
        ctx2d.beginPath();
        ctx2d.arc(px, py, pr, 0, Math.PI*2);
        ctx2d.clip();
        ctx2d.fillStyle = 'rgba(0,0,8,0.95)';
        ctx2d.fillRect(px-pr, py-pr, pr*2, pr*2);
        // Mini stars inside each pocket universe
        ctx2d.translate(px, py);
        ctx2d.rotate(pk.spin);
        for (const st of pk.stars) {
          const sx2 = st.ox * pr * 0.8, sy2 = st.oy * pr * 0.8;
          const tw = 0.3 + 0.7 * Math.abs(Math.sin(now/400 * st.speed + st.phase));
          ctx2d.globalAlpha = alpha * tw * 0.9;
          ctx2d.fillStyle = `hsla(${hue},80%,85%,${tw})`;
          ctx2d.beginPath();
          ctx2d.arc(sx2, sy2, Math.max(0.3, st.size * pr), 0, Math.PI*2);
          ctx2d.fill();
        }
        // Pocket universe core
        const pkCore = ctx2d.createRadialGradient(0, 0, 0, 0, 0, pr * 0.4);
        pkCore.addColorStop(0, 'rgba(255,255,255,0.95)');
        pkCore.addColorStop(1, 'rgba(0,0,0,0)');
        ctx2d.globalAlpha = alpha * pulse;
        ctx2d.fillStyle = pkCore;
        ctx2d.beginPath();
        ctx2d.arc(0, 0, pr * 0.4, 0, Math.PI*2);
        ctx2d.fill();
        ctx2d.restore();

        // Orbit trail
        ctx2d.save();
        ctx2d.globalAlpha = alpha * 0.12;
        ctx2d.strokeStyle = `hsla(${hue},80%,70%,1)`;
        ctx2d.lineWidth = 0.6;
        ctx2d.setLineDash([3, 5]);
        ctx2d.beginPath();
        ctx2d.arc(b.x, b.y, b.r * pk.orbitR, 0, Math.PI*2);
        ctx2d.stroke();
        ctx2d.setLineDash([]);
        ctx2d.restore();
      }

      // Central Omega Point — the singularity containing all realities
      const omegaPulse = 0.5 + 0.5 * Math.sin(now / 250 + su.corePhase);
      const omegaR = b.r * (0.14 + omegaPulse * 0.06);
      // Rotating rainbow outer corona
      for (let i = 0; i < 12; i++) {
        const a = (Math.PI * 2 / 12) * i + now / 400;
        const hue2 = (i * 30 + now / 30) % 360;
        ctx2d.save();
        ctx2d.globalAlpha = alpha * (0.5 + 0.5 * Math.sin(now/200 + i)) * 0.7;
        ctx2d.fillStyle = `hsla(${hue2},100%,75%,1)`;
        const rx = b.x + Math.cos(a) * omegaR * 1.6;
        const ry = b.y + Math.sin(a) * omegaR * 1.6;
        ctx2d.beginPath();
        ctx2d.arc(rx, ry, omegaR * 0.3 * omegaPulse, 0, Math.PI*2);
        ctx2d.fill();
        ctx2d.restore();
      }
      // Blinding white core
      const omegaGrd = ctx2d.createRadialGradient(b.x, b.y, 0, b.x, b.y, omegaR * 2);
      omegaGrd.addColorStop(0,   'rgba(255,255,255,1)');
      omegaGrd.addColorStop(0.3, 'rgba(220,200,255,0.85)');
      omegaGrd.addColorStop(0.7, 'rgba(150,100,255,0.35)');
      omegaGrd.addColorStop(1,   'rgba(0,0,0,0)');
      ctx2d.save();
      ctx2d.globalAlpha = alpha * omegaPulse;
      ctx2d.fillStyle = omegaGrd;
      ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);
      ctx2d.restore();

      ctx2d.restore(); // end clip
    }
  }

  // Universe — everything that exists, all at once
  if (b.type === 'universe') {
    const now = performance.now();
    const u = b.uniData;
    if (!u) { /* fallback */ }
    else {
      // Slow breathing outer rings — expansion of the universe
      for (let ring = 0; ring < 7; ring++) {
        const phase = ((now / 800 + ring * 0.18) % 1);
        const ringR  = b.r * (1.06 + ring * 0.18 + phase * 0.5);
        const opacity = (1 - phase) * 0.18;
        const hue = (ring * 52 + now / 60) % 360;
        ctx2d.save();
        ctx2d.globalAlpha = alpha * opacity;
        ctx2d.beginPath();
        ctx2d.arc(b.x, b.y, ringR, 0, Math.PI * 2);
        ctx2d.strokeStyle = `hsla(${hue},100%,70%,1)`;
        ctx2d.lineWidth = 2;
        ctx2d.stroke();
        ctx2d.restore();
      }

      ctx2d.save();
      buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
      ctx2d.clip();

      // Absolute deep space background
      ctx2d.fillStyle = 'rgba(0,0,5,1)';
      ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

      // Nebulae clouds — colorful gas regions
      for (const neb of u.nebulae) {
        const nx = b.x + neb.ox * b.r;
        const ny = b.y + neb.oy * b.r;
        const nr = neb.size * b.r;
        const drift = Math.sin(now / 2500 + neb.phase) * b.r * 0.04;
        const nebPulse = 0.5 + 0.5 * Math.sin(now / 1800 + neb.phase);
        ctx2d.save();
        ctx2d.globalAlpha = alpha * 0.28 * nebPulse;
        const nGrd = ctx2d.createRadialGradient(nx+drift, ny+drift, 0, nx, ny, nr);
        nGrd.addColorStop(0,   `hsla(${neb.hue},90%,70%,0.8)`);
        nGrd.addColorStop(0.4, `hsla(${(neb.hue+40)%360},80%,55%,0.4)`);
        nGrd.addColorStop(0.75,`hsla(${(neb.hue+90)%360},70%,40%,0.15)`);
        nGrd.addColorStop(1,   'rgba(0,0,0,0)');
        ctx2d.fillStyle = nGrd;
        ctx2d.beginPath();
        ctx2d.ellipse(nx+drift, ny+drift, nr, nr*0.65, now/4000+neb.phase, 0, Math.PI*2);
        ctx2d.fill();
        ctx2d.restore();
      }

      // Background star field — 3 depth layers
      for (const st of u.stars) {
        const sx = b.x + st.ox * b.r;
        const sy = b.y + st.oy * b.r;
        const twinkle = 0.25 + 0.75 * Math.abs(Math.sin(now / 500 * st.speed + st.phase));
        const ss = st.size * b.r * (0.5 + twinkle * 0.8);
        ctx2d.save();
        ctx2d.globalAlpha = alpha * twinkle * 0.9;
        ctx2d.fillStyle = `rgba(${st.color},${twinkle})`;
        ctx2d.beginPath();
        ctx2d.arc(sx, sy, Math.max(0.3, ss), 0, Math.PI*2);
        ctx2d.fill();
        // Cross glint on brighter stars
        if (ss > b.r * 0.012) {
          ctx2d.strokeStyle = `rgba(${st.color},${twinkle * 0.5})`;
          ctx2d.lineWidth = 0.4;
          ctx2d.beginPath();
          ctx2d.moveTo(sx - ss*2.5, sy); ctx2d.lineTo(sx + ss*2.5, sy);
          ctx2d.moveTo(sx, sy - ss*2.5); ctx2d.lineTo(sx, sy + ss*2.5);
          ctx2d.stroke();
        }
        ctx2d.restore();
      }

      // Mini galaxies scattered throughout
      for (const gal of u.galaxies) {
        gal.spin += gal.spinSpeed;
        const gx = b.x + gal.ox * b.r;
        const gy = b.y + gal.oy * b.r;
        const gr = gal.size * b.r;
        ctx2d.save();
        ctx2d.translate(gx, gy);
        ctx2d.rotate(gal.spin);
        // Two spiral arms
        for (let arm = 0; arm < 2; arm++) {
          for (let t = 0; t < 12; t++) {
            const frac = t/12;
            const a = arm*Math.PI + frac*Math.PI*2.2;
            const d = frac * gr * 0.9;
            const px = Math.cos(a)*d, py = Math.sin(a)*d;
            const ws = gr*(0.15 - frac*0.09);
            const galGrd = ctx2d.createRadialGradient(px,py,0,px,py,ws);
            galGrd.addColorStop(0, `hsla(${gal.hue},85%,75%,${0.6-frac*0.35})`);
            galGrd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx2d.globalAlpha = alpha * (0.6 - frac*0.35);
            ctx2d.fillStyle = galGrd;
            ctx2d.beginPath();
            ctx2d.arc(px, py, Math.max(0.3,ws), 0, Math.PI*2);
            ctx2d.fill();
          }
        }
        // Core
        const galCore = ctx2d.createRadialGradient(0,0,0,0,0,gr*0.35);
        galCore.addColorStop(0,'rgba(255,255,255,0.9)');
        galCore.addColorStop(1,'rgba(0,0,0,0)');
        ctx2d.globalAlpha = alpha * 0.9;
        ctx2d.fillStyle = galCore;
        ctx2d.beginPath();
        ctx2d.arc(0,0,gr*0.35,0,Math.PI*2);
        ctx2d.fill();
        ctx2d.restore();
      }

      // Mini black holes — dark spots with tiny accretion disks
      for (const hole of u.holes) {
        hole.diskAngle += hole.diskSpeed;
        const hx = b.x + hole.ox * b.r;
        const hy = b.y + hole.oy * b.r;
        const hr = hole.size * b.r;
        // Dark core
        ctx2d.save();
        ctx2d.globalAlpha = alpha;
        ctx2d.fillStyle = '#000000';
        ctx2d.beginPath();
        ctx2d.arc(hx, hy, hr, 0, Math.PI*2);
        ctx2d.fill();
        // Mini disk
        ctx2d.translate(hx, hy);
        ctx2d.rotate(hole.diskAngle);
        ctx2d.globalAlpha = alpha * 0.7;
        ctx2d.strokeStyle = 'rgba(255,160,0,0.8)';
        ctx2d.lineWidth = hr * 0.4;
        ctx2d.beginPath();
        ctx2d.ellipse(0, 0, hr*1.8, hr*0.4, 0, 0, Math.PI*2);
        ctx2d.stroke();
        ctx2d.restore();
      }

      // Big Bang core — eternal blazing heart of the universe
      const bbPulse = 0.6 + 0.4 * Math.sin(now / 400 + u.bigBangPhase);
      const bbGrd = ctx2d.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 0.22 * bbPulse);
      bbGrd.addColorStop(0,   'rgba(255,255,255,1)');
      bbGrd.addColorStop(0.3, 'rgba(255,240,180,0.85)');
      bbGrd.addColorStop(0.7, 'rgba(255,120,50,0.4)');
      bbGrd.addColorStop(1,   'rgba(120,0,60,0)');
      ctx2d.save();
      ctx2d.globalAlpha = alpha * bbPulse;
      ctx2d.fillStyle = bbGrd;
      ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);
      ctx2d.restore();

      // Cosmic microwave background — very subtle warm glow
      const cmbGrd = ctx2d.createRadialGradient(b.x, b.y, b.r*0.3, b.x, b.y, b.r);
      cmbGrd.addColorStop(0,  'rgba(0,0,0,0)');
      cmbGrd.addColorStop(0.7,'rgba(30,10,20,0.06)');
      cmbGrd.addColorStop(1,  'rgba(80,30,40,0.22)');
      ctx2d.fillStyle = cmbGrd;
      ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

      ctx2d.restore(); // end clip
    }
  }

  // Supercluster — cosmic web, galaxy clusters, filaments, full universe
  if (b.type === 'supercluster') {
    const now = performance.now();

    // Outer cosmic boundary pulses — slow majestic rings
    for (let ring = 0; ring < 6; ring++) {
      const hue  = (ring * 40 + now / 80) % 360;
      const pulse = 0.3 + 0.5 * Math.sin(now / 1400 + ring * 1.05);
      ctx2d.save();
      ctx2d.globalAlpha = alpha * (0.08 + pulse * 0.1) * (1 - ring * 0.12);
      ctx2d.beginPath();
      ctx2d.arc(b.x, b.y, b.r * (1.08 + ring * 0.17 + pulse * 0.04), 0, Math.PI * 2);
      ctx2d.strokeStyle = `hsla(${hue},80%,70%,1)`;
      ctx2d.lineWidth = 2;
      ctx2d.stroke();
      ctx2d.restore();
    }

    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.clip();

    // Deep cosmic void background
    const voidGrd = ctx2d.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    voidGrd.addColorStop(0,    'rgba(2,0,12,1)');
    voidGrd.addColorStop(0.55, 'rgba(5,0,20,0.98)');
    voidGrd.addColorStop(1,    'rgba(15,5,40,0.9)');
    ctx2d.fillStyle = voidGrd;
    ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

    // Background stars
    if (b.scStars) {
      for (const st of b.scStars) {
        const sx = b.x + st.ox * b.r;
        const sy = b.y + st.oy * b.r;
        const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(now / 500 * st.speed + st.phase));
        const ss = st.size * b.r * twinkle;
        ctx2d.save();
        ctx2d.globalAlpha = alpha * twinkle * 0.8;
        ctx2d.fillStyle = 'rgba(255,255,255,0.9)';
        ctx2d.beginPath();
        ctx2d.arc(sx, sy, Math.max(0.4, ss), 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.restore();
      }
    }

    // Cosmic web filaments — connect cluster nodes with glowing threads
    if (b.scNodes) {
      const nodes = b.scNodes;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i], n2 = nodes[j];
          const x1 = b.x + n1.ox * b.r, y1 = b.y + n1.oy * b.r;
          const x2 = b.x + n2.ox * b.r, y2 = b.y + n2.oy * b.r;
          const dist = Math.hypot(x2-x1, y2-y1);
          if (dist > b.r * 1.1) continue; // skip distant pairs
          const filPulse = 0.4 + 0.4 * Math.sin(now / 1200 + i * j * 0.3);
          ctx2d.save();
          ctx2d.globalAlpha = alpha * filPulse * (1 - dist / (b.r * 1.2)) * 0.6;
          const filGrd = ctx2d.createLinearGradient(x1, y1, x2, y2);
          filGrd.addColorStop(0,   `rgba(${n1.color},0.8)`);
          filGrd.addColorStop(0.5, `rgba(200,180,255,0.4)`);
          filGrd.addColorStop(1,   `rgba(${n2.color},0.8)`);
          ctx2d.strokeStyle = filGrd;
          ctx2d.lineWidth = 0.8 + filPulse * 0.6;
          ctx2d.beginPath();
          // Slightly curved filament
          const mx = (x1+x2)/2 + Math.sin(now/900+i*j)*b.r*0.08;
          const my = (y1+y2)/2 + Math.cos(now/900+i*j)*b.r*0.08;
          ctx2d.moveTo(x1, y1);
          ctx2d.quadraticCurveTo(mx, my, x2, y2);
          ctx2d.stroke();
          ctx2d.restore();
        }
      }

      // Galaxy cluster nodes — each a mini spinning galaxy
      for (const node of nodes) {
        node.spinAngle += node.spinSpeed;
        const nx = b.x + node.ox * b.r;
        const ny = b.y + node.oy * b.r;
        const nr = node.size * b.r;
        const gPulse = 0.7 + 0.3 * Math.sin(now / 800 + node.phase);

        // Cluster glow
        ctx2d.save();
        ctx2d.globalAlpha = alpha * gPulse * 0.7;
        const clGrd = ctx2d.createRadialGradient(nx, ny, 0, nx, ny, nr * 1.8);
        clGrd.addColorStop(0,   `rgba(${node.color},0.9)`);
        clGrd.addColorStop(0.4, `rgba(${node.color},0.35)`);
        clGrd.addColorStop(1,   'rgba(0,0,0,0)');
        ctx2d.fillStyle = clGrd;
        ctx2d.beginPath();
        ctx2d.arc(nx, ny, nr * 1.8, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.restore();

        // Mini spiral arms
        ctx2d.save();
        ctx2d.globalAlpha = alpha * gPulse * 0.5;
        ctx2d.translate(nx, ny);
        ctx2d.rotate(node.spinAngle);
        for (let arm = 0; arm < 2; arm++) {
          const aOff = arm * Math.PI;
          for (let t = 0; t < 18; t++) {
            const frac = t / 18;
            const a = aOff + frac * Math.PI * 2.5;
            const d = frac * nr * 0.95;
            const px = Math.cos(a) * d, py = Math.sin(a) * d;
            const ws = nr * (0.14 - frac * 0.08);
            ctx2d.globalAlpha = alpha * gPulse * (0.5 - frac * 0.3);
            const agrd = ctx2d.createRadialGradient(px, py, 0, px, py, ws);
            agrd.addColorStop(0, `rgba(${node.color},0.8)`);
            agrd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx2d.fillStyle = agrd;
            ctx2d.beginPath();
            ctx2d.arc(px, py, ws, 0, Math.PI * 2);
            ctx2d.fill();
          }
        }
        ctx2d.restore();

        // Bright cluster core
        ctx2d.save();
        ctx2d.globalAlpha = alpha * gPulse;
        const coreGrd = ctx2d.createRadialGradient(nx, ny, 0, nx, ny, nr * 0.4);
        coreGrd.addColorStop(0,   'rgba(255,255,255,1)');
        coreGrd.addColorStop(0.5, `rgba(${node.color},0.7)`);
        coreGrd.addColorStop(1,   'rgba(0,0,0,0)');
        ctx2d.fillStyle = coreGrd;
        ctx2d.beginPath();
        ctx2d.arc(nx, ny, nr * 0.4, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.restore();
      }
    }

    // Overall cosmic haze overlay
    const hazeGrd = ctx2d.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    hazeGrd.addColorStop(0,   'rgba(30,10,60,0)');
    hazeGrd.addColorStop(0.6, 'rgba(20,5,40,0.08)');
    hazeGrd.addColorStop(1,   'rgba(60,20,120,0.3)');
    ctx2d.fillStyle = hazeGrd;
    ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

    ctx2d.restore(); // end clip
  }

  // White Hole — blasting everything outward, rainbow prism core
  if (b.type === 'whitehole') {
    const now = performance.now();
    const spin = now / 1400;

    // Outer expelled shockwave rings (rapidly expanding style)
    for (let ring = 0; ring < 5; ring++) {
      const phase = ((now / 600 + ring * 0.22) % 1);
      const ringR = b.r * (1.05 + ring * 0.2 + phase * 0.4);
      const rOpacity = (1 - phase) * 0.25;
      const hue = (ring * 51 + now / 30) % 360;
      ctx2d.save();
      ctx2d.globalAlpha = alpha * rOpacity;
      ctx2d.beginPath();
      ctx2d.arc(b.x, b.y, ringR, 0, Math.PI * 2);
      ctx2d.strokeStyle = `hsla(${hue},100%,75%,1)`;
      ctx2d.lineWidth = 2.5 - ring * 0.3;
      ctx2d.stroke();
      ctx2d.restore();
    }

    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.clip();

    // Blinding white interior
    ctx2d.fillStyle = 'rgba(255,255,255,1)';
    ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

    // Rotating rainbow prism beams — 12 rays shooting from center
    ctx2d.save();
    ctx2d.translate(b.x, b.y);
    ctx2d.rotate(spin);
    for (let ray = 0; ray < 12; ray++) {
      const rayAngle = (Math.PI * 2 / 12) * ray;
      const hue = (ray * 30 + now / 20) % 360;
      ctx2d.save();
      ctx2d.rotate(rayAngle);
      ctx2d.globalAlpha = alpha * 0.55;
      const rayGrd = ctx2d.createLinearGradient(0, 0, b.r, 0);
      rayGrd.addColorStop(0,    `hsla(${hue},100%,98%,0.9)`);
      rayGrd.addColorStop(0.4,  `hsla(${hue},100%,75%,0.55)`);
      rayGrd.addColorStop(1,    `hsla(${hue},100%,60%,0)`);
      ctx2d.fillStyle = rayGrd;
      ctx2d.beginPath();
      ctx2d.moveTo(0, -b.r * 0.06);
      ctx2d.lineTo(b.r, -b.r * 0.1);
      ctx2d.lineTo(b.r,  b.r * 0.1);
      ctx2d.lineTo(0,  b.r * 0.06);
      ctx2d.closePath();
      ctx2d.fill();
      ctx2d.restore();
    }
    ctx2d.restore();

    // Reverse accretion — matter being expelled outward in a bright disk
    ctx2d.save();
    ctx2d.translate(b.x, b.y);
    ctx2d.rotate(-spin * 0.7);
    for (let layer = 0; layer < 4; layer++) {
      const diskR  = b.r * (0.38 + layer * 0.16);
      const diskRY = diskR * 0.18;
      const hue2 = (layer * 60 + now / 25) % 360;
      const dOpacity = (0.7 - layer * 0.12) * (0.7 + 0.3 * Math.sin(now/300 + layer));
      ctx2d.save();
      ctx2d.globalAlpha = alpha * dOpacity;
      ctx2d.beginPath();
      ctx2d.ellipse(0, 0, diskR, diskRY, 0, 0, Math.PI * 2);
      ctx2d.strokeStyle = `hsla(${hue2},100%,85%,1)`;
      ctx2d.lineWidth = b.r * 0.04;
      ctx2d.stroke();
      ctx2d.restore();
    }
    ctx2d.restore();

    // Blinding core over everything
    const coreGrd = ctx2d.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 0.5);
    coreGrd.addColorStop(0,   'rgba(255,255,255,1)');
    coreGrd.addColorStop(0.4, 'rgba(255,255,240,0.8)');
    coreGrd.addColorStop(1,   'rgba(255,255,255,0)');
    ctx2d.fillStyle = coreGrd;
    ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

    ctx2d.restore(); // end clip

    // Outward-flying rainbow ejecta particles
    if (b.ejecta) {
      for (const ej of b.ejecta) {
        ej.angle += ej.speed * 0.3;
        ej.r = Math.min(2.2, ej.r + 0.003); // drift outward slowly
        const ex = b.x + Math.cos(ej.angle) * b.r * ej.r;
        const ey = b.y + Math.sin(ej.angle) * b.r * ej.r * 0.85;
        const es = ej.size * b.r * (1 - (ej.r - 0.6) / 1.6 * 0.5);
        const ePulse = 0.5 + 0.5 * Math.sin(now / 180 + ej.angle * 3);
        if (ej.r > 2.0) ej.r = 0.6; // wrap back
        ctx2d.save();
        ctx2d.globalAlpha = alpha * ej.alpha * ePulse * (1 - (ej.r - 0.6) / 1.6);
        const eGrd = ctx2d.createRadialGradient(ex, ey, 0, ex, ey, es);
        eGrd.addColorStop(0,   `rgba(${ej.color},1)`);
        eGrd.addColorStop(0.5, `rgba(${ej.color},0.4)`);
        eGrd.addColorStop(1,   'rgba(255,255,255,0)');
        ctx2d.fillStyle = eGrd;
        ctx2d.beginPath();
        ctx2d.arc(ex, ey, Math.max(0.5, es), 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.restore();
      }
    }
  }

  // Neutron Star — pulsar with rotating magnetic beams
  if (b.type === 'neutronstar') {
    const now = performance.now();
    const spinFast = now / 280; // neutron stars spin very fast

    // Outer magnetosphere halos
    for (let ring = 0; ring < 4; ring++) {
      const pulse = 0.5 + 0.5 * Math.sin(now / 180 + ring * 0.8); // fast pulse
      ctx2d.save();
      ctx2d.globalAlpha = alpha * (0.15 + pulse * 0.2) * (1 - ring * 0.2);
      ctx2d.beginPath();
      ctx2d.arc(b.x, b.y, b.r * (1.1 + ring * 0.16 + pulse * 0.05), 0, Math.PI * 2);
      const haloColor = ring % 2 === 0
        ? `rgba(150,220,255,0.9)` : `rgba(200,240,255,0.7)`;
      ctx2d.strokeStyle = haloColor;
      ctx2d.lineWidth = 2.5 - ring * 0.4;
      ctx2d.stroke();
      ctx2d.restore();
    }

    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.clip();

    // Ultra-hot bluewhite stellar surface
    const [cr2,cg2,cb2] = hexToRgb(b.color);
    const surfGrd = ctx2d.createRadialGradient(
      b.x - b.r*0.2, b.y - b.r*0.2, 0,
      b.x, b.y, b.r
    );
    surfGrd.addColorStop(0,   'rgba(255,255,255,1)');
    surfGrd.addColorStop(0.2, 'rgba(220,245,255,0.98)');
    surfGrd.addColorStop(0.5, `rgba(${cr2},${cg2},${cb2},0.9)`);
    surfGrd.addColorStop(0.85,'rgba(80,140,220,0.7)');
    surfGrd.addColorStop(1,   'rgba(30,80,180,0.4)');
    ctx2d.fillStyle = surfGrd;
    ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

    // Rotating magnetic field lines (6 arcs spinning fast)
    ctx2d.save();
    ctx2d.translate(b.x, b.y);
    ctx2d.rotate(spinFast);
    for (let line = 0; line < 6; line++) {
      const la = (Math.PI / 3) * line;
      ctx2d.save();
      ctx2d.rotate(la);
      ctx2d.globalAlpha = alpha * 0.22;
      ctx2d.strokeStyle = 'rgba(180,220,255,0.8)';
      ctx2d.lineWidth = 0.8;
      ctx2d.beginPath();
      ctx2d.ellipse(0, 0, b.r * 0.45, b.r * 0.9, 0, 0, Math.PI * 2);
      ctx2d.stroke();
      ctx2d.restore();
    }
    ctx2d.restore();

    // Pulsar polar beams — two sweeping lighthouse beams
    for (const dir of [-1, 1]) {
      const beamAngle = spinFast * 2;
      const bx1 = Math.cos(beamAngle + dir * 0.15) * b.r * 0.05;
      const by1 = Math.sin(beamAngle + dir * 0.15) * b.r * 0.05;
      const beamLen = b.r * 0.9;
      ctx2d.save();
      ctx2d.globalAlpha = alpha * (0.45 + 0.35 * Math.abs(Math.sin(spinFast * 2)));
      const bGrd = ctx2d.createLinearGradient(
        b.x + bx1, b.y + by1,
        b.x + Math.cos(beamAngle) * beamLen * dir,
        b.y + Math.sin(beamAngle) * beamLen
      );
      bGrd.addColorStop(0,   'rgba(255,255,255,0.95)');
      bGrd.addColorStop(0.3, 'rgba(180,230,255,0.6)');
      bGrd.addColorStop(1,   'rgba(100,180,255,0)');
      ctx2d.fillStyle = bGrd;
      ctx2d.beginPath();
      ctx2d.moveTo(b.x - b.r*0.06, b.y - b.r*0.06);
      ctx2d.lineTo(b.x + b.r*0.06, b.y + b.r*0.06);
      ctx2d.lineTo(
        b.x + Math.cos(beamAngle + 0.18) * beamLen,
        b.y + Math.sin(beamAngle + 0.18) * beamLen * dir
      );
      ctx2d.lineTo(
        b.x + Math.cos(beamAngle - 0.18) * beamLen,
        b.y + Math.sin(beamAngle - 0.18) * beamLen * dir
      );
      ctx2d.closePath();
      ctx2d.fill();
      ctx2d.restore();
    }

    // Blazing core
    const coreGrd = ctx2d.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 0.38);
    coreGrd.addColorStop(0,   'rgba(255,255,255,1)');
    coreGrd.addColorStop(0.5, 'rgba(200,235,255,0.7)');
    coreGrd.addColorStop(1,   'rgba(120,190,255,0)');
    ctx2d.fillStyle = coreGrd;
    ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

    ctx2d.restore(); // end clip

    // Magnetosphere charged particles orbiting
    if (b.magParticles) {
      for (const mp of b.magParticles) {
        mp.angle += mp.speed;
        const mx2 = b.x + Math.cos(mp.angle) * b.r * mp.r;
        const my2 = b.y + Math.sin(mp.angle) * b.r * mp.r * 0.55;
        const ms = mp.size * b.r;
        const mpulse = 0.4 + 0.6 * Math.abs(Math.sin(now / 150 + mp.angle * 5));
        ctx2d.save();
        ctx2d.globalAlpha = alpha * mp.alpha * mpulse;
        const mpGrd = ctx2d.createRadialGradient(mx2, my2, 0, mx2, my2, ms);
        mpGrd.addColorStop(0,   `rgba(${mp.color},1)`);
        mpGrd.addColorStop(0.5, `rgba(${mp.color},0.4)`);
        mpGrd.addColorStop(1,   'rgba(255,255,255,0)');
        ctx2d.fillStyle = mpGrd;
        ctx2d.beginPath();
        ctx2d.arc(mx2, my2, ms, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.restore();
      }
    }
  }

  // Black Hole — rendered first (rarest, highest score)
  if (b.type === 'blackhole') {
    const now = performance.now();
    const spin = now / 1800;

    // Gravitational lensing distortion rings (outside bubble)
    for (let ring = 0; ring < 5; ring++) {
      const pulse = 0.4 + 0.6 * Math.sin(now / 600 + ring * 0.7);
      const ringScale = 1.12 + ring * 0.14 + pulse * 0.04;
      ctx2d.save();
      ctx2d.globalAlpha = alpha * (0.18 - ring * 0.03) * pulse;
      ctx2d.beginPath();
      ctx2d.ellipse(b.x, b.y, b.r * ringScale, b.r * ringScale * (0.3 + ring * 0.14), spin * 0.3, 0, Math.PI * 2);
      const ringColor = ring < 2
        ? `rgba(255,${140 - ring*30},0,0.9)`
        : ring < 4 ? `rgba(255,${80+ring*20},${ring*40},0.7)` : `rgba(180,100,255,0.5)`;
      ctx2d.strokeStyle = ringColor;
      ctx2d.lineWidth = 3.5 - ring * 0.5;
      ctx2d.stroke();
      ctx2d.restore();
    }

    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.clip();

    // Absolute black event horizon
    ctx2d.fillStyle = '#000000';
    ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

    // Accretion disk — hot plasma ring inside (tilted ellipse sweep)
    const diskColors = [
      [255, 255, 220], [255, 200, 80], [255, 120, 0], [200, 60, 0], [100, 0, 60],
    ];
    ctx2d.save();
    ctx2d.translate(b.x, b.y);
    ctx2d.rotate(spin * 0.6);
    for (let layer = 0; layer < 5; layer++) {
      const frac = layer / 5;
      const diskR  = b.r * (0.55 + frac * 0.42);
      const diskRY = diskR * 0.22;
      const [dr, dg, db2] = diskColors[layer];
      const diskOpacity = (0.9 - frac * 0.5) * (0.6 + 0.4 * Math.sin(now / 400 + layer));
      ctx2d.save();
      ctx2d.globalAlpha = alpha * diskOpacity;
      ctx2d.beginPath();
      ctx2d.ellipse(0, 0, diskR, diskRY, 0, 0, Math.PI * 2);
      const dGrd = ctx2d.createRadialGradient(0, 0, diskR * 0.35, 0, 0, diskR);
      dGrd.addColorStop(0,   `rgba(${dr},${dg},${db2},0.9)`);
      dGrd.addColorStop(0.5, `rgba(${dr},${dg},${db2},0.5)`);
      dGrd.addColorStop(1,   `rgba(${dr},${dg},${db2},0)`);
      ctx2d.strokeStyle = `rgba(${dr},${dg},${db2},${diskOpacity})`;
      ctx2d.lineWidth = b.r * 0.045;
      ctx2d.stroke();
      ctx2d.restore();
    }
    ctx2d.restore();

    // Relativistic jets — two polar beams (top and bottom)
    for (const dir of [-1, 1]) {
      const jetLen = b.r * 0.75;
      const jetPulse = 0.5 + 0.5 * Math.sin(now / 350 + dir);
      ctx2d.save();
      ctx2d.globalAlpha = alpha * 0.55 * jetPulse;
      const jGrd = ctx2d.createLinearGradient(b.x, b.y, b.x, b.y + dir * jetLen);
      jGrd.addColorStop(0,   'rgba(180,100,255,0.8)');
      jGrd.addColorStop(0.5, 'rgba(100,160,255,0.4)');
      jGrd.addColorStop(1,   'rgba(0,200,255,0)');
      ctx2d.fillStyle = jGrd;
      ctx2d.beginPath();
      ctx2d.moveTo(b.x - b.r * 0.06, b.y);
      ctx2d.lineTo(b.x + b.r * 0.06, b.y);
      ctx2d.lineTo(b.x + b.r * 0.02, b.y + dir * jetLen);
      ctx2d.lineTo(b.x - b.r * 0.02, b.y + dir * jetLen);
      ctx2d.closePath();
      ctx2d.fill();
      ctx2d.restore();
    }

    // Innermost photon sphere glow
    const photonGrd = ctx2d.createRadialGradient(b.x, b.y, b.r*0.3, b.x, b.y, b.r*0.58);
    photonGrd.addColorStop(0,   'rgba(0,0,0,0)');
    photonGrd.addColorStop(0.7, 'rgba(255,160,0,0.12)');
    photonGrd.addColorStop(1,   'rgba(255,220,80,0.35)');
    ctx2d.fillStyle = photonGrd;
    ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

    ctx2d.restore(); // end clip

    // Hawking radiation — glowing particles orbiting just outside
    if (b.hawking) {
      for (const h of b.hawking) {
        h.angle += h.speed;
        const hx = b.x + Math.cos(h.angle) * b.r * h.orbitR;
        const hy = b.y + Math.sin(h.angle) * b.r * h.orbitR * 0.35;
        const hs = h.size * b.r;
        const hPulse = 0.5 + 0.5 * Math.sin(now / 200 + h.angle * 4);
        ctx2d.save();
        ctx2d.globalAlpha = alpha * h.alpha * hPulse;
        const hGrd = ctx2d.createRadialGradient(hx, hy, 0, hx, hy, hs);
        hGrd.addColorStop(0,   `rgba(${h.color},1)`);
        hGrd.addColorStop(0.6, `rgba(${h.color},0.3)`);
        hGrd.addColorStop(1,   'rgba(0,0,0,0)');
        ctx2d.fillStyle = hGrd;
        ctx2d.beginPath();
        ctx2d.arc(hx, hy, hs, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.restore();
      }
    }
  }

  // Galaxy + Dark Matter — rendered first
  if (b.type === 'galaxy') {
    const now = performance.now();
    const spin = now / 3000; // slow galaxy rotation

    // Outer cosmic glow rings
    for (let ring = 0; ring < 4; ring++) {
      const pulse = 0.5 + 0.5 * Math.sin(now / 900 + ring * 0.9);
      ctx2d.save();
      ctx2d.globalAlpha = alpha * (0.1 + pulse * 0.12) * (1 - ring * 0.2);
      ctx2d.beginPath();
      ctx2d.arc(b.x, b.y, b.r * (1.15 + ring * 0.18 + pulse * 0.06), 0, Math.PI * 2);
      ctx2d.strokeStyle = ring % 2 === 0 ? 'rgba(100,60,255,0.8)' : 'rgba(0,180,255,0.6)';
      ctx2d.lineWidth = 2.5 - ring * 0.5;
      ctx2d.stroke();
      ctx2d.restore();
    }

    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.clip();

    // Deep void core
    const coreGrd = ctx2d.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
    coreGrd.addColorStop(0,    'rgba(0,0,0,1)');
    coreGrd.addColorStop(0.18, 'rgba(5,0,20,0.98)');
    coreGrd.addColorStop(0.5,  'rgba(15,0,50,0.88)');
    coreGrd.addColorStop(0.78, 'rgba(30,10,80,0.6)');
    coreGrd.addColorStop(1,    'rgba(60,0,120,0.3)');
    ctx2d.fillStyle = coreGrd;
    ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

    // Spiral arms — 2 arms rotating
    const armColors = [
      ['rgba(0,140,255,', 'rgba(80,0,255,'],
      ['rgba(255,80,180,', 'rgba(0,200,255,'],
    ];
    for (let arm = 0; arm < 2; arm++) {
      const armOffset = arm * Math.PI;
      ctx2d.save();
      ctx2d.globalAlpha = alpha * 0.65;
      for (let t = 0; t < 80; t++) {
        const frac = t / 80;
        const angle = spin + armOffset + frac * Math.PI * 3.2;
        const dist = frac * b.r * 0.88;
        const px = b.x + Math.cos(angle) * dist;
        const py = b.y + Math.sin(angle) * dist;
        const w = b.r * (0.18 - frac * 0.12);
        const [c1, c2] = armColors[arm];
        const grd = ctx2d.createRadialGradient(px, py, 0, px, py, w);
        grd.addColorStop(0,   c1 + (0.7 - frac * 0.4) + ')');
        grd.addColorStop(0.6, c2 + (0.3 - frac * 0.2) + ')');
        grd.addColorStop(1,   'rgba(0,0,0,0)');
        ctx2d.fillStyle = grd;
        ctx2d.beginPath();
        ctx2d.arc(px, py, w, 0, Math.PI * 2);
        ctx2d.fill();
      }
      ctx2d.restore();
    }

    // Dark matter void wisps inside galaxy
    for (let v = 0; v < 4; v++) {
      const va = now / 1800 + v * (Math.PI / 2);
      const vx = b.x + Math.cos(va) * b.r * 0.4;
      const vy = b.y + Math.sin(va) * b.r * 0.4;
      ctx2d.globalAlpha = alpha * 0.28;
      const vGrd = ctx2d.createRadialGradient(vx, vy, 0, vx, vy, b.r * 0.32);
      vGrd.addColorStop(0, 'rgba(80,0,160,0.6)');
      vGrd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx2d.fillStyle = vGrd;
      ctx2d.beginPath();
      ctx2d.arc(vx, vy, b.r * 0.32, 0, Math.PI * 2);
      ctx2d.fill();
    }
    ctx2d.globalAlpha = alpha;

    // Bright galactic core glow
    const coreGlow = ctx2d.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 0.3);
    coreGlow.addColorStop(0,   'rgba(255,240,200,0.7)');
    coreGlow.addColorStop(0.4, 'rgba(180,100,255,0.25)');
    coreGlow.addColorStop(1,   'rgba(0,0,0,0)');
    ctx2d.fillStyle = coreGlow;
    ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

    ctx2d.restore();

    // Twinkling stars
    if (b.stars) {
      for (const st of b.stars) {
        const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(now / 500 * st.speed + st.phase));
        const sx = b.x + st.ox * b.r;
        const sy = b.y + st.oy * b.r;
        const ss = st.size * b.r * (0.6 + twinkle * 0.8);
        ctx2d.save();
        ctx2d.globalAlpha = alpha * twinkle * 0.95;
        ctx2d.fillStyle = `rgba(${st.color},${twinkle})`;
        ctx2d.beginPath();
        // 4-point star
        ctx2d.translate(sx, sy);
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI / 4) * i;
          const rad = i % 2 === 0 ? ss : ss * 0.25;
          i === 0 ? ctx2d.moveTo(Math.cos(a)*rad, Math.sin(a)*rad)
                  : ctx2d.lineTo(Math.cos(a)*rad, Math.sin(a)*rad);
        }
        ctx2d.closePath();
        ctx2d.fill();
        ctx2d.restore();
      }
    }
  }

  // Dark Matter — rendered first
  if (b.type === 'darkmatter') {
    const now = performance.now();

    // Outer void aura (pulsing rings outside the bubble)
    for (let ring = 0; ring < 3; ring++) {
      const pulse = Math.abs(Math.sin(now / 700 + ring * 1.1));
      ctx2d.save();
      ctx2d.globalAlpha = alpha * (0.12 + pulse * 0.18) * (1 - ring * 0.28);
      ctx2d.beginPath();
      ctx2d.arc(b.x, b.y, b.r * (1.18 + ring * 0.22 + pulse * 0.08), 0, Math.PI * 2);
      ctx2d.strokeStyle = `rgb(${80 + ring*20},0,${140 + ring*20})`;
      ctx2d.lineWidth = 3 - ring * 0.8;
      ctx2d.stroke();
      ctx2d.restore();
    }

    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.clip();

    // Deep void core gradient
    const vGrd = ctx2d.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 1.05);
    vGrd.addColorStop(0,   'rgba(0,0,0,0.98)');
    vGrd.addColorStop(0.5, 'rgba(20,0,45,0.92)');
    vGrd.addColorStop(0.8, 'rgba(60,0,100,0.7)');
    vGrd.addColorStop(1,   'rgba(100,0,160,0.4)');
    ctx2d.fillStyle = vGrd;
    ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

    // Swirling nebula streaks
    ctx2d.globalAlpha = alpha * 0.35;
    for (let s = 0; s < 5; s++) {
      const sa = now / 2000 + s * (Math.PI * 2 / 5);
      const sx = b.x + Math.cos(sa) * b.r * 0.55;
      const sy = b.y + Math.sin(sa) * b.r * 0.55;
      const nebGrd = ctx2d.createRadialGradient(sx, sy, 0, sx, sy, b.r * 0.45);
      nebGrd.addColorStop(0,   'rgba(140,0,255,0.7)');
      nebGrd.addColorStop(0.5, 'rgba(60,0,120,0.3)');
      nebGrd.addColorStop(1,   'rgba(0,0,0,0)');
      ctx2d.fillStyle = nebGrd;
      ctx2d.beginPath();
      ctx2d.arc(sx, sy, b.r * 0.45, 0, Math.PI * 2);
      ctx2d.fill();
    }
    ctx2d.globalAlpha = alpha;

    // Event-horizon rim glow
    const rimGrd = ctx2d.createRadialGradient(b.x, b.y, b.r*0.72, b.x, b.y, b.r);
    rimGrd.addColorStop(0,   'rgba(0,0,0,0)');
    rimGrd.addColorStop(0.6, 'rgba(80,0,160,0.25)');
    rimGrd.addColorStop(1,   'rgba(160,0,255,0.55)');
    ctx2d.fillStyle = rimGrd;
    ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

    ctx2d.restore();

    // Orbiting wisps
    if (b.wisps) {
      for (const w of b.wisps) {
        w.angle += w.speed;
        const wx = b.x + Math.cos(w.angle) * b.r * w.orbitR;
        const wy = b.y + Math.sin(w.angle) * b.r * w.orbitR;
        const ws = w.size * b.r;
        const wPulse = 0.5 + 0.5 * Math.sin(now / 300 + w.angle * 3);
        ctx2d.save();
        ctx2d.globalAlpha = alpha * w.alpha * wPulse;
        const wGrd = ctx2d.createRadialGradient(wx, wy, 0, wx, wy, ws);
        wGrd.addColorStop(0,   'rgba(200,100,255,0.9)');
        wGrd.addColorStop(0.5, 'rgba(100,0,200,0.4)');
        wGrd.addColorStop(1,   'rgba(0,0,0,0)');
        ctx2d.fillStyle = wGrd;
        ctx2d.beginPath();
        ctx2d.arc(wx, wy, ws, 0, Math.PI * 2);
        ctx2d.fill();
        ctx2d.restore();
      }
    }
  }

  // Gold+Diamond fusion — rendered before diamond block
  if (b.type === 'golddiamond') {
    const now = performance.now();
    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.clip();

    // Rotating golden shimmer
    const angle = now / 1200;
    const gx1 = b.x + Math.cos(angle) * b.r * 0.4;
    const gy1 = b.y + Math.sin(angle) * b.r * 0.4;
    const goldGrd = ctx2d.createRadialGradient(gx1, gy1, 0, b.x, b.y, b.r * 1.1);
    goldGrd.addColorStop(0,   'rgba(255,255,220,0.9)');
    goldGrd.addColorStop(0.25,`rgba(${cr},${cg},${cb},0.75)`);
    goldGrd.addColorStop(0.6, 'rgba(180,100,0,0.3)');
    goldGrd.addColorStop(1,   `rgba(${cr},${Math.max(0,cg-40)},0,0.15)`);
    ctx2d.fillStyle = goldGrd;
    ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

    // Diamond crystal facets over gold
    const shimmerX = b.x + Math.sin(now / 700 + b.id) * b.r * 0.25;
    const dGrd = ctx2d.createRadialGradient(shimmerX, b.y - b.r*0.2, 0, shimmerX, b.y, b.r);
    dGrd.addColorStop(0,   'rgba(255,255,255,0.5)');
    dGrd.addColorStop(0.35,'rgba(180,220,255,0.15)');
    dGrd.addColorStop(1,   'rgba(255,200,0,0.0)');
    ctx2d.fillStyle = dGrd;
    ctx2d.fillRect(b.x - b.r*1.5, b.y - b.r*1.5, b.r*3, b.r*3);

    // Gold facet lines
    ctx2d.strokeStyle = 'rgba(255,255,200,0.3)';
    ctx2d.lineWidth = 1;
    ctx2d.beginPath(); ctx2d.moveTo(b.x, b.y - b.r*0.9); ctx2d.lineTo(b.x - b.r*0.7, b.y + b.r*0.5); ctx2d.stroke();
    ctx2d.beginPath(); ctx2d.moveTo(b.x, b.y - b.r*0.9); ctx2d.lineTo(b.x + b.r*0.7, b.y + b.r*0.5); ctx2d.stroke();
    ctx2d.beginPath(); ctx2d.moveTo(b.x - b.r*0.7, b.y + b.r*0.5); ctx2d.lineTo(b.x + b.r*0.7, b.y + b.r*0.5); ctx2d.stroke();
    ctx2d.beginPath(); ctx2d.moveTo(b.x - b.r*0.35, b.y - b.r*0.9); ctx2d.lineTo(b.x, b.y + b.r*0.5); ctx2d.stroke();
    ctx2d.beginPath(); ctx2d.moveTo(b.x + b.r*0.35, b.y - b.r*0.9); ctx2d.lineTo(b.x, b.y + b.r*0.5); ctx2d.stroke();
    ctx2d.restore();

    // Animated golden+white sparkles
    if (b.sparkles) {
      for (const sp of b.sparkles) {
        const pulse = 0.4 + 0.6 * Math.abs(Math.sin(now / 400 * sp.speed + sp.phase));
        const sx = b.x + sp.ox * b.r;
        const sy = b.y + sp.oy * b.r;
        const ss = sp.size * b.r * pulse;
        ctx2d.save();
        ctx2d.globalAlpha = alpha * pulse;
        // alternate gold and white sparkles
        ctx2d.fillStyle = sp.phase < Math.PI ? 'rgba(255,255,255,0.95)' : `rgba(${cr},${cg},80,0.95)`;
        ctx2d.translate(sx, sy);
        ctx2d.rotate(now / 800 * sp.speed);
        ctx2d.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI / 4) * i;
          const rad = i % 2 === 0 ? ss : ss * 0.28;
          i === 0 ? ctx2d.moveTo(Math.cos(a)*rad, Math.sin(a)*rad)
                  : ctx2d.lineTo(Math.cos(a)*rad, Math.sin(a)*rad);
        }
        ctx2d.closePath();
        ctx2d.fill();
        ctx2d.restore();
      }
    }
  }

  // Diamond inner facet shimmer
  if (b.type === 'diamond') {
    ctx2d.save();
    buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
    ctx2d.clip();
    const now = performance.now();
    // animated prismatic sheen
    const shimmerX = b.x + Math.sin(now / 700 + b.id) * b.r * 0.3;
    const shGrd = ctx2d.createRadialGradient(shimmerX, b.y - b.r * 0.2, 0, shimmerX, b.y, b.r * 1.1);
    shGrd.addColorStop(0,   'rgba(255,255,255,0.55)');
    shGrd.addColorStop(0.3, `rgba(${cr},${cg},${cb},0.2)`);
    shGrd.addColorStop(0.6, 'rgba(180,120,255,0.15)');
    shGrd.addColorStop(1,   `rgba(${cr},${cg},${cb},0.05)`);
    ctx2d.fillStyle = shGrd;
    ctx2d.fillRect(b.x - b.r * 1.5, b.y - b.r * 1.5, b.r * 3, b.r * 3);
    // facet lines
    ctx2d.strokeStyle = `rgba(255,255,255,0.18)`;
    ctx2d.lineWidth = 0.8;
    ctx2d.beginPath(); ctx2d.moveTo(b.x, b.y - b.r * 0.9); ctx2d.lineTo(b.x - b.r * 0.7, b.y + b.r * 0.5); ctx2d.stroke();
    ctx2d.beginPath(); ctx2d.moveTo(b.x, b.y - b.r * 0.9); ctx2d.lineTo(b.x + b.r * 0.7, b.y + b.r * 0.5); ctx2d.stroke();
    ctx2d.beginPath(); ctx2d.moveTo(b.x - b.r * 0.7, b.y + b.r * 0.5); ctx2d.lineTo(b.x + b.r * 0.7, b.y + b.r * 0.5); ctx2d.stroke();
    ctx2d.restore();

    // orbiting sparkle stars
    if (b.sparkles) {
      for (const sp of b.sparkles) {
        const pulse = 0.4 + 0.6 * Math.abs(Math.sin(now / 500 * sp.speed + sp.phase));
        const sx = b.x + sp.ox * b.r;
        const sy = b.y + sp.oy * b.r;
        const ss = sp.size * b.r * pulse;
        ctx2d.save();
        ctx2d.globalAlpha = alpha * pulse * 0.9;
        ctx2d.fillStyle = 'rgba(255,255,255,0.95)';
        // 4-point star
        ctx2d.translate(sx, sy);
        ctx2d.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI / 4) * i;
          const rad = i % 2 === 0 ? ss : ss * 0.3;
          i === 0 ? ctx2d.moveTo(Math.cos(a)*rad, Math.sin(a)*rad)
                  : ctx2d.lineTo(Math.cos(a)*rad, Math.sin(a)*rad);
        }
        ctx2d.closePath();
        ctx2d.fill();
        ctx2d.restore();
      }
    }
  }

  // Gloss highlight (less glossy for sand)
  buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
  ctx2d.save();
  ctx2d.clip();
  const glossAmt = b.type === 'sand' ? 0.25 : 0.6;
  const grd = ctx2d.createRadialGradient(
    b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.05,
    b.x - b.r * 0.1, b.y - b.r * 0.1, b.r * 0.65
  );
  grd.addColorStop(0, `rgba(255,255,255,${glossAmt})`);
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  ctx2d.fillStyle = grd;
  buildPath(ctx2d, b.shape, b.x, b.y, b.r, b.wobble);
  ctx2d.fill();
  ctx2d.restore();

  ctx2d.restore();

  // Outline stroke
  ctx2d.save();
  ctx2d.globalAlpha = alpha * 0.5;
  buildPath(ctx2d, b.shape, b.x, b.y, b.r * squishX, b.wobble);
  ctx2d.strokeStyle = b.type === 'golddiamond'    ? `rgba(255,215,0,0.95)`
    : b.type === 'darkmatter'   ? `rgba(160,0,255,0.8)`
    : b.type === 'galaxy'       ? `rgba(80,160,255,0.85)`
    : b.type === 'blackhole'    ? `rgba(255,140,0,0.9)`
    : b.type === 'neutronstar'  ? `rgba(180,230,255,0.95)`
    : b.type === 'whitehole'    ? `rgba(255,200,255,0.9)`
    : b.type === 'supercluster' ? `rgba(160,100,255,0.9)`
    : b.type === 'universe'       ? `rgba(255,255,255,0.7)`
    : b.type === 'superuniverse'  ? `rgba(200,150,255,0.9)`
    : b.type === 'bomb'           ? `rgba(255,80,0,0.9)`
    : b.type === 'jiaoshuee'      ? `rgba(200,170,50,0.9)`
    : b.type === 'jiaoshui'       ? `rgba(30,120,220,0.9)`
    : b.type === 'rainbowsmoke'   ? `hsla(${(performance.now()/50)%360},90%,65%,0.9)`
    : b.type === 'tnt'            ? `rgba(255,60,0,1)`
    : b.type === 'glasswater'     ? `rgba(180,230,255,0.85)`
    : b.type === 'watermelon'     ? `rgba(20,160,10,0.9)`
    : b.type === 'strawberry'     ? `rgba(229,57,53,0.95)`
    : b.type === 'firework'       ? `hsla(${(performance.now()/20)%360},100%,65%,0.95)`
    : b.type === 'lucky'          ? `rgba(255,213,79,0.95)`
    : b.type === 'grape'          ? `rgba(123,31,162,0.95)`
    : b.type === 'soap'           ? `rgba(128,222,234,0.85)`
    : b.type === 'ice'            ? `rgba(129,212,250,0.95)`
    : b.type === 'jelly'          ? `rgba(244,143,177,0.95)`
    : b.type === 'balloon'        ? `rgba(239,83,80,0.95)`
    : b.type === 'lightning'      ? `rgba(255,238,88,0.95)`
    : b.type === 'magnet'         ? `rgba(120,144,156,0.95)`
    : b.type === 'clock'          ? `rgba(161,136,127,0.95)`
    : b.type === 'speedbubble'    ? `rgba(102,187,106,0.95)`
    : b.type === 'invisible'      ? `rgba(176,190,197,0.5)`
    : `rgba(${cr},${cg},${cb},0.9)`;
  ctx2d.lineWidth = b.type === 'golddiamond' ? 3
    : (b.type === 'darkmatter' || b.type === 'galaxy' || b.type === 'blackhole' || b.type === 'neutronstar' || b.type === 'whitehole' || b.type === 'supercluster' || b.type === 'universe' || b.type === 'superuniverse' || b.type === 'bomb') ? 2.5
    : b.wet ? 1.5 : b.type === 'sand' ? 2 : 2.5;
  if (b.type === 'sand') ctx2d.setLineDash([4, 3]);
  ctx2d.stroke();
  ctx2d.setLineDash([]);
  ctx2d.restore();

  // Type indicators
  if (!b.popping) {
    ctx2d.save();
    ctx2d.globalAlpha = alpha * 0.85;
    ctx2d.font = `${Math.max(10, b.r * 0.42)}px sans-serif`;
    ctx2d.textAlign = 'center';
    ctx2d.textBaseline = 'middle';
    if (b.wet)                    ctx2d.fillText('💧', b.x, b.y);
    if (b.type === 'sand')        ctx2d.fillText('🪨', b.x, b.y);
    if (b.type === 'diamond')     ctx2d.fillText('💎', b.x, b.y);
    if (b.type === 'golddiamond') ctx2d.fillText('👑', b.x, b.y);
    if (b.type === 'darkmatter')  ctx2d.fillText('🌑', b.x, b.y);
    if (b.type === 'galaxy')      ctx2d.fillText('🌌', b.x, b.y);
    if (b.type === 'blackhole')   ctx2d.fillText('⚫', b.x, b.y);
    if (b.type === 'neutronstar') ctx2d.fillText('✨', b.x, b.y);
    if (b.type === 'whitehole')      ctx2d.fillText('🌟', b.x, b.y);
    if (b.type === 'supercluster')   ctx2d.fillText('🔮', b.x, b.y);
    if (b.type === 'universe')        ctx2d.fillText('🌈', b.x, b.y);
    if (b.type === 'superuniverse')   ctx2d.fillText('♾️', b.x, b.y);
    if (b.type === 'bomb')            ctx2d.fillText('💣', b.x, b.y);
    if (b.type === 'rainbowsmoke')    ctx2d.fillText('🌈', b.x, b.y);
    if (b.type === 'watermelon')      ctx2d.fillText('🍉', b.x, b.y);
    if (b.type === 'strawberry')      ctx2d.fillText('🍓', b.x, b.y);
    if (b.type === 'firework')        ctx2d.fillText('🎆', b.x, b.y);
    if (b.type === 'lucky')           ctx2d.fillText('🍀', b.x, b.y);
    if (b.type === 'grape')           ctx2d.fillText('🍇', b.x, b.y);
    if (b.type === 'soap')            ctx2d.fillText('🫧', b.x, b.y);
    if (b.type === 'ice')             ctx2d.fillText('❄️', b.x, b.y);
    if (b.type === 'jelly')           ctx2d.fillText('🍮', b.x, b.y);
    if (b.type === 'balloon')         ctx2d.fillText('🎈', b.x, b.y);
    if (b.type === 'lightning')       ctx2d.fillText('⚡', b.x, b.y);
    if (b.type === 'magnet')          ctx2d.fillText('🧲', b.x, b.y);
    if (b.type === 'clock')           ctx2d.fillText('⏰', b.x, b.y);
    if (b.type === 'speedbubble')     ctx2d.fillText('🚀', b.x, b.y);
    if (b.type === 'invisible' && (b.revealed || b.pressing)) ctx2d.fillText('👻', b.x, b.y);
    // TNT text is drawn inside the bubble already — no emoji overlay needed
    if (b.type === 'jiaoshuee')       ctx2d.fillText('🪿', b.x, b.y);
    if (b.type === 'jiaoshui')        ctx2d.fillText('🪣', b.x, b.y);
    ctx2d.restore();
  }

  // ── PRESSURE RING (hold progress arc) ────────────────────────────
  if (b.pressing && p > 0 && !b.popping) {
    const ringR = b.r * 1.28;
    // Background track
    ctx2d.save();
    ctx2d.globalAlpha = 0.25;
    ctx2d.beginPath();
    ctx2d.arc(b.x, b.y, ringR, 0, Math.PI * 2);
    ctx2d.strokeStyle = `rgb(${cr},${cg},${cb})`;
    ctx2d.lineWidth = 4;
    ctx2d.stroke();
    ctx2d.restore();

    // Progress arc
    const startAngle = -Math.PI / 2;
    const endAngle   = startAngle + Math.PI * 2 * p;
    // Color shifts from bubble color → red as pressure builds
    const red   = Math.round(cr + (255 - cr) * p);
    const green = Math.round(cg * (1 - p * 0.8));
    const blue  = Math.round(cb * (1 - p * 0.8));
    ctx2d.save();
    ctx2d.globalAlpha = 0.85;
    ctx2d.beginPath();
    ctx2d.arc(b.x, b.y, ringR, startAngle, endAngle);
    ctx2d.strokeStyle = `rgb(${red},${green},${blue})`;
    ctx2d.lineWidth = 4;
    ctx2d.lineCap = 'round';
    ctx2d.stroke();
    ctx2d.restore();

    // Pulsing glow when nearly full
    if (p > 0.75) {
      const glow = (p - 0.75) / 0.25;
      ctx2d.save();
      ctx2d.globalAlpha = glow * 0.3 * (0.5 + 0.5 * Math.sin(performance.now() / 80));
      ctx2d.beginPath();
      ctx2d.arc(b.x, b.y, ringR + 6, 0, Math.PI * 2);
      ctx2d.strokeStyle = `rgb(255,80,80)`;
      ctx2d.lineWidth = 8;
      ctx2d.stroke();
      ctx2d.restore();
    }
  }
}

// ══════════════════════════════════════════════════════════════════
//  ANIMATION LOOP
// ══════════════════════════════════════════════════════════════════
function tick() {
  ctx2d.clearRect(0, 0, canvasW(), canvasH());

  const toRemove = [];
  const now = performance.now();
  const holdMs = getHoldMs();

  for (const b of state.bubbles) {
    // Fade in
    if (!b.popping && b.alpha < 1) b.alpha = Math.min(1, b.alpha + 0.04);

    // After speed-boost spawn: gently spread from left/right half toward full board
    if (b.spreadUntil && now < b.spreadUntil && b.spreadTargetX != null && !(b.frozenUntil && now < b.frozenUntil)) {
      b.x += (b.spreadTargetX - b.x) * 0.025;
      b.y += (b.spreadTargetY - b.y) * 0.025;
      b.x = Math.max(b.r, Math.min(canvasW() - b.r, b.x));
      b.y = Math.max(b.r, Math.min(canvasH() - b.r, b.y));
    } else if (b.spreadUntil && now >= b.spreadUntil) {
      b.spreadUntil = 0;
      b.spreadTargetX = null;
      b.spreadTargetY = null;
    }

    // Wobble — frozen bubbles stay stiff (Eggy snowball freeze)
    if (!(b.frozenUntil && now < b.frozenUntil)) {
      const wobbleSpeed = b.pressing ? b.wobbleSpeed * (1 + b.pressProgress * 4) : b.wobbleSpeed;
      b.wobble += wobbleSpeed * b.wobbleDir;
    }

    // Invisible stay faint until revealed
    if (b.type === 'invisible' && !b.revealed && !b.pressing && !b.popping) {
      b.alpha = Math.min(b.alpha, 0.14);
    }

    // Balloon inflates while held
    if (b.type === 'balloon') {
      b.inflate = b.pressing ? (1 + b.pressProgress * 0.85) : 1 + (b.inflate - 1) * 0.9;
    }

    // Magnet pull: gently tug neighbors while this bubble exists and not popping
    if (b.type === 'magnet' && !b.popping && b.alpha > 0.6) {
      for (const o of state.bubbles) {
        if (o === b || o.popping || (o.frozenUntil && now < o.frozenUntil)) continue;
        const dx = b.x - o.x, dy = b.y - o.y;
        const dist = Math.sqrt(dx*dx + dy*dy) || 1;
        if (dist < b.r * 6 && dist > b.r * 1.2) {
          o.x += dx / dist * 0.9;
          o.y += dy / dist * 0.9;
        }
      }
    }

    // Advance hold-charge (clock slows charging)
    if (b.pressing && !b.popping) {
      if (b.frozenUntil && now < b.frozenUntil) {
        b.pressing = false; b.pressProgress = 0;
      } else {
        const scale = state.timeScale || 1;
        const effectiveHold = holdMs === 0 ? 0 : holdMs / scale;
        b.pressProgress = effectiveHold === 0 ? 1 : Math.min(1, (now - b.pressStart) / effectiveHold);
        if (b.pressProgress >= 1) triggerPop(b);
      }
    }

    // Pop animation
    if (b.popping) {
      b.popProgress += 0.07;
      if (b.popProgress >= 1) toRemove.push(b.id);
    }

    drawBubble(b);
  }

  for (const id of toRemove) {
    const i = state.bubbles.findIndex(b => b.id === id);
    if (i !== -1) state.bubbles.splice(i, 1);
  }

  state.animFrame = requestAnimationFrame(tick);
}

// ══════════════════════════════════════════════════════════════════
//  SPAWN LOOP
// ══════════════════════════════════════════════════════════════════
/** Max bubbles ≈ packed into 1/4 screen (normal) or 1/2 (speed boost). */
function getMaxBubblesOnField() {
  const avgR = Math.max(12, state.bubbleSize * 0.95);
  const cell = (avgR * 2) * (avgR * 2) * 0.9;
  const area = canvasW() * canvasH();
  const frac = state.speedBoostActive ? 0.5 : 0.25;
  return Math.max(6, Math.floor((area * frac) / cell));
}

function startSpawnLoop() {
  clearInterval(state.spawnTimer);
  state.spawnTimer = setInterval(() => {
    const maxN = getMaxBubblesOnField();
    if (state.bubbles.filter(b => !b.popping).length < maxN) {
      const b = createBubble();
      // Keep whole board as watermelon during the mode
      if (state.watermelonActive) applyWatermelonTransform(b);
      state.bubbles.push(b);
    }
  }, state.spawnInterval);
}

// ══════════════════════════════════════════════════════════════════
//  HOLD-TO-EXPLODE SYSTEM
// ══════════════════════════════════════════════════════════════════
function pointInBubble(bx, by, br, mx, my) {
  const dx = mx - bx, dy = my - by;
  return Math.sqrt(dx*dx + dy*dy) < br * 1.15;
}

function findBubbleAt(mx, my) {
  for (let i = state.bubbles.length - 1; i >= 0; i--) {
    const b = state.bubbles[i];
    if (b.popping) continue;
    if (pointInBubble(b.x, b.y, b.r, mx, my)) return b;
  }
  return null;
}

let heldBubble = null;

function startPress(mx, my) {
  const b = findBubbleAt(mx, my);
  if (!b) return;
  if (b.frozenUntil && performance.now() < b.frozenUntil) {
    showToast('❄️ 冻结中…', '#81d4fa');
    return;
  }
  if (b.type === 'invisible') b.revealed = true;

  // Multi-hit bubbles: each press = 1 hit, no hold needed
  if ((b.type === 'jiaoshuee' || b.type === 'jiaoshui' || b.type === 'jelly') && !b.popping) {
    hitMultiBubble(b);
    return;
  }

  heldBubble = b;
  b.pressing = true;
  b.pressStart = performance.now();
  b.pressProgress = 0;
  playPressStart(b.wet);
}

function hitMultiBubble(b) {
  if (b.popping || b.hitCooldown) return;
  b.hp -= 1;
  b.hitCooldown = true;
  setTimeout(() => { b.hitCooldown = false; }, 250);

  // Add a crack at a random position on the surface
  if (b.cracks) {
    const angle = Math.random() * Math.PI * 2;
    const dist  = 0.3 + Math.random() * 0.5;
    b.cracks.push({ angle, dist, len: 0.15 + Math.random() * 0.2, rot: Math.random() * Math.PI });
  }

  if (b.hp <= 0) {
    triggerPop(b);
  } else {
    b.shakeUntil = performance.now() + 380;
    b.type === 'jiaoshuee' ? playGooseHonk() : b.type === 'jelly' ? playPressStart(false) : playWaterSplash();
    spawnHitFlash(b);
  }
}

function spawnHitFlash(b) {
  const col = b.type === 'jiaoshui' ? '80,160,255' : '255,200,80';
  const flash = document.createElement('div');
  flash.style.cssText = `
    position:absolute;
    left:${b.x - b.r}px; top:${b.y - b.r}px;
    width:${b.r*2}px; height:${b.r*2}px;
    border-radius:50%;
    background:rgba(${col},0.55);
    animation: hitFlash 0.35s ease-out forwards;
    pointer-events:none; z-index:90;
  `;
  board.appendChild(flash);
  setTimeout(() => flash.remove(), 380);
}

function endPress() {
  if (heldBubble) {
    heldBubble.pressing = false;
    heldBubble.pressProgress = 0;
    heldBubble = null;
  }
}


const NEW10_REWARD = {
  grape: 35, soap: 30, ice: 40, jelly: 45, balloon: 35,
  lightning: 50, magnet: 45, clock: 40, speedbubble: 40, invisible: 55,
};
function rewardFor(b, luckyReward) {
  if (b.type === 'lucky') return luckyReward;
  if (NEW10_REWARD[b.type] != null) return NEW10_REWARD[b.type];
  if (b.type === 'firework') return 40;
  if (b.type === 'strawberry') return 30;
  if (b.type === 'watermelon') return 25;
  if (b.type === 'glasswater') return 15;
  if (b.type === 'tnt' || b.type === 'bomb') return 0;
  if (b.type === 'rainbowsmoke') return 30;
  if (b.type === 'jiaoshuee' || b.type === 'jiaoshui') return 50;
  if (b.type === 'superuniverse') return 115;
  if (b.type === 'universe') return 110;
  if (b.type === 'supercluster') return 100;
  if (b.type === 'whitehole') return 95;
  if (b.type === 'neutronstar') return 90;
  if (b.type === 'blackhole') return 85;
  if (b.type === 'galaxy') return 80;
  if (b.type === 'darkmatter') return 70;
  if (b.type === 'golddiamond') return 50;
  if (b.type === 'diamond') return 25;
  if (b.type === 'sand') return 20;
  return b.wet ? 5 : 10;
}
function labelFor(b, luckyReward) {
  const map = {
    lucky: `🍀+${luckyReward}`, firework: '🎆+40', strawberry: '🍓+30', watermelon: '🍉+25',
    glasswater: '🫗+15', tnt: '💥TNT!', rainbowsmoke: '🌈+30', jiaoshuee: '🪿+50', jiaoshui: '🪣+50',
    bomb: '💥轰!', grape: '🍇+35', soap: '🫧+30', ice: '❄️+40', jelly: '🍮+45', balloon: '🎈+35',
    lightning: '⚡+50', magnet: '🧲+45', clock: '⏰+40', speedbubble: '🚀+40', invisible: '👻+55',
  };
  if (map[b.type]) return map[b.type];
  if (b.type === 'superuniverse') return '+115';
  if (b.type === 'universe') return '+110';
  if (b.type === 'supercluster') return '+100';
  if (b.type === 'whitehole') return '+95';
  if (b.type === 'neutronstar') return '+90';
  if (b.type === 'blackhole') return '+85';
  if (b.type === 'galaxy') return '+80';
  if (b.type === 'darkmatter') return '+70';
  if (b.type === 'golddiamond') return '+50';
  if (b.type === 'diamond') return '+25';
  if (b.type === 'sand') return '+20';
  return b.wet ? '+5' : '+10';
}

const COMBO_WINDOW_MS = 1500;

function registerCombo() {
  const now = performance.now();
  if (state.lastPopAt && now - state.lastPopAt <= COMBO_WINDOW_MS) {
    state.combo += 1;
  } else {
    state.combo = 1;
  }
  state.lastPopAt = now;
  updateComboDisplay();
  recordComboForAch(state.combo);
  return state.combo;
}

function updateComboDisplay() {
  const el = document.getElementById('combo-display');
  if (!el) return;
  if (state.comboHideTimer) {
    clearTimeout(state.comboHideTimer);
    state.comboHideTimer = null;
  }
  if (state.combo >= 2) {
    el.textContent = `连击 ×${state.combo}`;
    el.classList.add('show');
    state.comboHideTimer = setTimeout(() => {
      // 超时清零
      state.combo = 0;
      el.classList.remove('show');
      el.textContent = '';
      state.comboHideTimer = null;
    }, COMBO_WINDOW_MS);
  } else {
    el.classList.remove('show');
    el.textContent = '';
  }
}

function resetCombo() {
  state.combo = 0;
  state.lastPopAt = 0;
  if (state.comboHideTimer) {
    clearTimeout(state.comboHideTimer);
    state.comboHideTimer = null;
  }
  const el = document.getElementById('combo-display');
  if (el) {
    el.classList.remove('show');
    el.textContent = '';
  }
}

function triggerPop(b) {
  if (b.popping) return;
  b.popping = true;
  b.pressing = false;
  heldBubble = null;
  b.type === 'superuniverse'? playPopSuperUniverse()
    : b.type === 'universe'    ? playPopUniverse()
    : b.type === 'supercluster'? playPopSupercluster()
    : b.type === 'whitehole'   ? playPopWhiteHole()
    : b.type === 'neutronstar' ? playPopNeutronStar()
    : b.type === 'blackhole'   ? playPopBlackHole()
    : b.type === 'galaxy'      ? playPopGalaxy()
    : b.type === 'darkmatter'  ? playPopDarkMatter()
    : b.type === 'golddiamond' ? playPopGoldDiamond()
    : b.type === 'diamond' ? playPopDiamond()
    : b.type === 'sand'    ? playPopSand()
    : b.type === 'strawberry'  ? playPopStrawberry()
    : b.type === 'firework'     ? playPopFirework()
    : b.type === 'lucky'        ? playPopLucky()
    : b.type === 'grape' || b.type === 'soap' || b.type === 'ice' || b.type === 'jelly'
      || b.type === 'balloon' || b.type === 'lightning' || b.type === 'magnet'
      || b.type === 'clock' || b.type === 'speedbubble' || b.type === 'invisible'
      ? playPop(false)
    : b.type === 'watermelon'   ? playPopWatermelon()
    : b.type === 'glasswater'   ? playPopGlassWater()
    : b.type === 'tnt'          ? playPopTNT()
    : b.type === 'bomb'         ? playPopBomb()
    : b.type === 'jiaoshuee'    ? playGooseHonkFinal()
    : b.type === 'jiaoshui'     ? playWaterBurst()
    : b.type === 'rainbowsmoke' ? playPopRainbowSmoke()
    : playPop(b.wet);
  spawnExplosion(b);
  const luckyReward = b.type === 'lucky' ? (150 + Math.floor(Math.random() * 851)) : 0; // 150–1000
  if (b.type === 'rainbowsmoke') spawnRainbowSmokeEffect(b);
  if (b.type === 'glasswater')   spawnGlassWaterEffect(b);
  if (b.type === 'watermelon') {
    // Only the FIRST watermelon triggers the full effect.
    // While active: points only — no blast, no time reset/stack.
    if (!state.watermelonActive) {
      spawnWatermelonBlast(b);
      convertAllToWatermelon();
    }
  }
  if (b.type === 'strawberry') {
    spawnStrawberryBlast(b);
    if (!state.strawberryJuiceActive) floodBoardWithStrawberryJuice();
    // Juice already active: points only, no time extension
  }
  if (b.type === 'firework') {
    spawnFireworkEffect(b);
  }
  if (b.type === 'lucky') {
    spawnLuckyCoinRain(b, luckyReward);
  }
  if (b.type === 'grape')       spawnGrapeBurst(b);
  if (b.type === 'soap')        spawnSoapBurst(b);
  if (b.type === 'ice')         triggerIceFreeze(b);
  if (b.type === 'lightning')   triggerLightningZap(b);
  if (b.type === 'magnet')      triggerMagnetPull(b);
  if (b.type === 'clock')       triggerClockSlow();
  if (b.type === 'speedbubble') triggerSpawnSpeedBoost();
  if (b.type === 'balloon')     spawnBalloonPop(b);
  if (b.type === 'tnt')          triggerTNT(b);

  // Bomb chain reaction — explode all nearby bubbles
  if (b.type === 'bomb') {
    const blastR = b.r * 3.5;
    spawnBombBlast(b, blastR);
    setTimeout(() => {
      state.bubbles.forEach(other => {
        if (other === b || other.popping) return;
        const dx = other.x - b.x, dy = other.y - b.y;
        if (Math.sqrt(dx*dx + dy*dy) < blastR + other.r) {
          setTimeout(() => triggerPop(other), Math.random() * 120);
        }
      });
    }, 80);
  }

  const combo = registerCombo();
  state.popped += 1;
  if (state.zenMode) {
    document.getElementById('stat-popped').textContent = state.popped;
    return;
  }
  rewardComboWallet(combo);
  const mult  = Math.max(1, combo);
  const base  = rewardFor(b, luckyReward);
  const pts   = base * mult;
  const coins = base * mult;
  onPassChallengePop(b, combo, coins);
  state.score      += pts;
  state.poppedTotal += 1;
  recordLifetimePop();
  addCoins(coins);
  if (state.popped > 0 && state.popped % 25 === 0) addWallet('wavePetals', 1, { pop: 'wave' });
  document.getElementById('stat-popped').textContent = state.popped;
  document.getElementById('stat-score').textContent  = state.score;
  onBoardDailyPop(b, combo);

  // score float
  const scoreEl = document.createElement('div');
  scoreEl.className = 'pop-score';
  scoreEl.style.cssText = `left:${b.x}px; top:${b.y - b.r - 10}px; color:${b.color};`;
  let floatLabel = labelFor(b, luckyReward);
  if (mult > 1 && base > 0) floatLabel += ` ×${mult}`;
  scoreEl.textContent = floatLabel;
  board.appendChild(scoreEl);
  setTimeout(() => scoreEl.remove(), 900);

  // coin burst
  const rect = board.getBoundingClientRect();
  const coinEl = document.createElement('div');
  coinEl.className = 'coin-burst';
  coinEl.style.cssText = `left:${rect.left + b.x + 10}px; top:${rect.top + b.y - b.r - 10}px;`;
  coinEl.textContent = `+${coins}`;
  document.body.appendChild(coinEl);
  setTimeout(() => coinEl.remove(), 950);
}

function playPopRainbowSmoke() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    // Soft airy whoosh
    const bufLen = Math.floor(ctx.sampleRate * 0.5);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = (Math.random()*2-1) * Math.exp(-i/bufLen*3);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const flt = ctx.createBiquadFilter();
    flt.type = 'bandpass'; flt.frequency.value = 400; flt.Q.value = 0.5;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.35, now); ng.gain.exponentialRampToValueAtTime(0.001, now+0.55);
    src.connect(flt).connect(ng).connect(ctx.destination);
    src.start(now); src.stop(now+0.6);
    // Rainbow sparkle tones — 7 colours = 7 rising notes
    [523,587,659,698,784,880,988].forEach((freq, i) => {
      const t = now + i * 0.06;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, t);
      o.frequency.linearRampToValueAtTime(freq * 1.15, t + 0.3);
      g.gain.setValueAtTime(0.1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      o.connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + 0.45);
    });
  } catch(e) {}
}

function spawnRainbowSmokeEffect(b) {
  const COLORS = ['#ff4444','#ff9900','#ffee00','#44dd44','#4499ff','#9944ff','#ff44cc'];
  const count  = 28;
  for (let i = 0; i < count; i++) {
    const hue   = (i / count) * 360;
    const size  = 12 + Math.random() * 22;
    const angle = (Math.random() * Math.PI * 2);
    const dist  = b.r * (0.2 + Math.random() * 0.8);
    const sx    = b.x + Math.cos(angle) * dist;
    const sy    = b.y + Math.sin(angle) * dist;
    const driftX = (Math.random()-0.5) * 60;
    const riseY  = -(40 + Math.random() * 80);
    const dur    = 900 + Math.random() * 700;

    const puff = document.createElement('div');
    puff.style.cssText = `
      position:absolute;
      left:${sx - size/2}px; top:${sy - size/2}px;
      width:${size}px; height:${size}px;
      border-radius:50%;
      background: radial-gradient(circle, hsla(${hue},90%,70%,0.85) 0%, hsla(${(hue+40)%360},80%,75%,0.4) 60%, transparent 100%);
      filter: blur(${3 + Math.random()*4}px);
      pointer-events:none; z-index:95;
      transition: transform ${dur}ms ease-out, opacity ${dur}ms ease-out;
    `;
    board.appendChild(puff);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      puff.style.transform = `translate(${driftX}px, ${riseY}px) scale(${1.5 + Math.random()})`;
      puff.style.opacity   = '0';
    }));
    setTimeout(() => puff.remove(), dur + 50);
  }
}

function triggerTNT(b) {
  spawnTNTBlast(b);
  showToast('💥 TNT 引爆！连锁全清！', '#ff3300');

  // Phase 1 (80ms): ignite every bomb on screen
  setTimeout(() => {
    state.bubbles.forEach(other => {
      if (other === b || other.popping) return;
      if (other.type === 'bomb') {
        setTimeout(() => triggerPop(other), Math.random() * 80);
      }
    });
  }, 80);

  // Phase 2 (500ms): sweep up anything the bombs missed
  setTimeout(() => {
    const remaining = [...state.bubbles];
    remaining.forEach((other, i) => {
      if (other === b || other.popping) return;
      setTimeout(() => { if (!other.popping) triggerPop(other); }, i * 15);
    });
  }, 500);
}

function spawnTNTBlast(b) {
  // Massive full-screen flash
  const flash = document.createElement('div');
  flash.style.cssText = `
    position:fixed; inset:0; z-index:9998; pointer-events:none;
    background: radial-gradient(circle at ${b.x}px ${b.y}px,
      rgba(255,220,0,0.95) 0%, rgba(255,80,0,0.7) 30%, rgba(255,0,0,0.3) 60%, transparent 80%);
    animation: tntFlash 0.6s ease-out forwards;
  `;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 650);

  // 5 massive shockwave rings
  for (let i = 0; i < 5; i++) {
    const ring = document.createElement('div');
    const size = b.r * (4 + i * 3);
    ring.style.cssText = `
      position:absolute;
      left:${b.x - size}px; top:${b.y - size}px;
      width:${size*2}px; height:${size*2}px;
      border-radius:50%;
      border: ${5 - i}px solid rgba(255,${150-i*30},0,${0.9 - i*0.15});
      animation: bombRing ${0.4 + i*0.1}s ${i*0.06}s ease-out forwards;
      pointer-events:none; z-index:9997;
    `;
    board.appendChild(ring);
    setTimeout(() => ring.remove(), 700 + i*80);
  }

  // 40 ember/debris particles
  for (let i = 0; i < 40; i++) {
    const angle  = (Math.PI * 2 / 40) * i + Math.random() * 0.2;
    const speed  = b.r * (1.2 + Math.random() * 2.5);
    const size   = 5 + Math.random() * 14;
    const colors = ['255,220,0','255,100,0','255,40,0','255,255,80','200,100,0'];
    const col    = colors[Math.floor(Math.random() * colors.length)];
    const ember  = document.createElement('div');
    ember.style.cssText = `
      position:absolute;
      left:${b.x - size/2}px; top:${b.y - size/2}px;
      width:${size}px; height:${size}px;
      border-radius:50%;
      background:rgba(${col},1);
      box-shadow:0 0 ${size*2}px rgba(${col},0.9);
      transform:translate(${Math.cos(angle)*speed}px, ${Math.sin(angle)*speed}px);
      transition:transform 0.7s ease-out, opacity 0.7s ease-out;
      opacity:1; pointer-events:none; z-index:9999;
    `;
    board.appendChild(ember);
    requestAnimationFrame(() => requestAnimationFrame(() => { ember.style.opacity = '0'; }));
    setTimeout(() => ember.remove(), 750);
  }
}

function playPopTNT() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    // Massive sub-bass detonation — lower and heavier than bomb
    [20, 28, 36, 45, 55, 70].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = f;
      o.frequency.exponentialRampToValueAtTime(f * 0.25, now + 1.0);
      g.gain.setValueAtTime(0.8, now + i*0.01);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      o.connect(g).connect(ctx.destination);
      o.start(now + i*0.01); o.stop(now + 1.3);
    });

    // Primary explosion crack — full-spectrum noise
    const bufLen = Math.floor(ctx.sampleRate * 0.55);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random()*2-1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass'; flt.frequency.value = 2500;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(1.2, now); ng.gain.exponentialRampToValueAtTime(0.001, now+0.6);
    src.connect(flt).connect(ng).connect(ctx.destination);
    src.start(now); src.stop(now+0.65);

    // Secondary rumble
    const bufLen2 = Math.floor(ctx.sampleRate * 0.8);
    const buf2 = ctx.createBuffer(1, bufLen2, ctx.sampleRate);
    const d2 = buf2.getChannelData(0);
    for (let i = 0; i < bufLen2; i++) d2[i] = (Math.random()*2-1) * Math.exp(-i/bufLen2*3);
    const src2 = ctx.createBufferSource();
    src2.buffer = buf2;
    const flt2 = ctx.createBiquadFilter();
    flt2.type = 'lowpass'; flt2.frequency.value = 400;
    const ng2 = ctx.createGain();
    ng2.gain.setValueAtTime(0.7, now+0.1); ng2.gain.exponentialRampToValueAtTime(0.001, now+1.0);
    src2.connect(flt2).connect(ng2).connect(ctx.destination);
    src2.start(now+0.1); src2.stop(now+1.1);

    // Chain-reaction crackle: rapid repeat bangs
    [0.25, 0.38, 0.52, 0.68, 0.82].forEach((t, i) => {
      const bufC = Math.floor(ctx.sampleRate * 0.12);
      const bC   = ctx.createBuffer(1, bufC, ctx.sampleRate);
      const dC   = bC.getChannelData(0);
      for (let j = 0; j < bufC; j++) dC[j] = Math.random()*2-1;
      const sC = ctx.createBufferSource();
      sC.buffer = bC;
      const gC = ctx.createGain();
      gC.gain.setValueAtTime(0.5 - i*0.07, now+t);
      gC.gain.exponentialRampToValueAtTime(0.001, now+t+0.15);
      sC.connect(gC).connect(ctx.destination);
      sC.start(now+t); sC.stop(now+t+0.18);
    });
  } catch(e) {}
}

function playPopWatermelon() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    // Juicy wet smash — low thud
    [60, 90, 120].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      o.frequency.exponentialRampToValueAtTime(f*0.4, now+0.25);
      g.gain.setValueAtTime(0.5, now+i*0.01); g.gain.exponentialRampToValueAtTime(0.001, now+0.35);
      o.connect(g).connect(ctx.destination);
      o.start(now+i*0.01); o.stop(now+0.4);
    });
    // Splat — bandpass noise burst
    const blen = Math.floor(ctx.sampleRate * 0.22);
    const buf  = ctx.createBuffer(1, blen, ctx.sampleRate);
    const d    = buf.getChannelData(0);
    for (let i = 0; i < blen; i++) d[i] = (Math.random()*2-1)*Math.exp(-i/blen*8);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const flt = ctx.createBiquadFilter(); flt.type='bandpass'; flt.frequency.value=400; flt.Q.value=0.5;
    const ng  = ctx.createGain();
    ng.gain.setValueAtTime(1.0, now); ng.gain.exponentialRampToValueAtTime(0.001, now+0.28);
    src.connect(flt).connect(ng).connect(ctx.destination);
    src.start(now); src.stop(now+0.32);
    // Juicy drip cascade
    [0.08,0.15,0.22,0.3,0.4].forEach((t,i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type='sine'; o.frequency.setValueAtTime(900-i*80,now+t);
      o.frequency.exponentialRampToValueAtTime(300,now+t+0.18);
      g.gain.setValueAtTime(0.12,now+t); g.gain.exponentialRampToValueAtTime(0.001,now+t+0.22);
      o.connect(g).connect(ctx.destination); o.start(now+t); o.stop(now+t+0.25);
    });
    // Magic twinkle (transform signal)
    [800,1000,1200,1500].forEach((f,i) => {
      const t = now + 0.3 + i*0.07;
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type='sine'; o.frequency.value=f;
      g.gain.setValueAtTime(0.1,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.3);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t+0.35);
    });
  } catch(e) {}
}

function playPopFirework() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    // Whistle up
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(200, now);
    o.frequency.exponentialRampToValueAtTime(1400, now + 0.28);
    g.gain.setValueAtTime(0.12, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    o.connect(g).connect(ctx.destination);
    o.start(now); o.stop(now + 0.35);
    // Crackles
    for (let i = 0; i < 8; i++) {
      const t = now + 0.25 + i * 0.04;
      const blen = Math.floor(ctx.sampleRate * 0.06);
      const buf = ctx.createBuffer(1, blen, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let j = 0; j < blen; j++) d[j] = (Math.random()*2-1) * Math.exp(-j/blen*10);
      const src = ctx.createBufferSource(); src.buffer = buf;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.35, t); ng.gain.exponentialRampToValueAtTime(0.001, t+0.08);
      src.connect(ng).connect(ctx.destination);
      src.start(t); src.stop(t+0.09);
    }
  } catch(e) {}
}

function playPopLucky() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    [523, 659, 784, 1046].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      const t = now + i * 0.07;
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + 0.4);
    });
  } catch(e) {}
}

function spawnFireworkEffect(b) {
  showToast('🎆 烟花绽放！', '#ff80ab');
  const colors = ['#ff4081','#ffeb3b','#00e5ff','#76ff03','#ff9100','#e040fb','#fff','#ff1744'];
  // Several bursts across the board — 3x larger sparks & spread
  const bursts = 6 + Math.floor(Math.random() * 4);
  for (let n = 0; n < bursts; n++) {
    const bx = Math.random() * canvasW();
    const by = Math.random() * canvasH() * 0.85;
    const delay = n * 120;
    setTimeout(() => {
      const sparks = 18 + Math.floor(Math.random() * 12);
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < sparks; i++) {
        const spark = document.createElement('div');
        spark.className = 'fw-spark';
        const ang = (Math.PI * 2 / sparks) * i + Math.random() * 0.2;
        const dist = (40 + Math.random() * 90) * 3;
        const size = (3 + Math.random() * 5) * 3;
        spark.style.cssText = `
          left:${bx}px; top:${by}px;
          width:${size}px; height:${size}px;
          background:${color};
          box-shadow: 0 0 18px ${color};
          --dx:${Math.cos(ang)*dist}px;
          --dy:${Math.sin(ang)*dist}px;
          animation-duration:${1.0 + Math.random()*0.6}s;
        `;
        board.appendChild(spark);
        setTimeout(() => spark.remove(), 1800);
      }
    }, delay);
  }
}


function spawnGrapeBurst(b) {
  showToast('🍇 葡萄裂开了！', '#9c27b0');
  for (let i = 0; i < 7; i++) {
    const ang = (Math.PI * 2 / 7) * i + Math.random() * 0.2;
    const dist = b.r * (1.2 + Math.random());
    const bit = createBubble();
    // override into a tiny grape bit
    bit.type = 'dry';
    bit.color = '#7b1fa2';
    bit.wet = false;
    bit.r = Math.max(10, b.r * 0.35);
    bit.x = Math.max(bit.r, Math.min(canvasW() - bit.r, b.x + Math.cos(ang) * dist));
    bit.y = Math.max(bit.r, Math.min(canvasH() - bit.r, b.y + Math.sin(ang) * dist));
    bit.alpha = 1;
    bit.hp = null; bit.maxHp = null; bit.cracks = null;
    bit.wmSeeds = null; bit.wmStripes = null; bit.sbSeeds = null;
    state.bubbles.push(bit);
    if (state.watermelonActive) applyWatermelonTransform(bit);
  }
}
function spawnSoapBurst(b) {
  showToast('🫧 肥皂彩虹！', '#80deea');
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('div');
    const ang = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 100;
    const size = 8 + Math.random() * 14;
    p.style.cssText = `position:absolute;left:${b.x}px;top:${b.y}px;width:${size}px;height:${size}px;border-radius:50%;
      background:hsla(${Math.random()*360},90%,70%,0.75);pointer-events:none;z-index:88;
      transition:transform .7s ease-out, opacity .7s ease-out;`;
    board.appendChild(p);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      p.style.transform = `translate(${Math.cos(ang)*dist}px,${Math.sin(ang)*dist}px)`;
      p.style.opacity = '0';
    }));
    setTimeout(() => p.remove(), 750);
  }
}
function spawnBalloonPop(b) {
  showToast('🎈 气球爆了！', '#ef5350');
}
function spawnIceShatter(b) {
  for (let i = 0; i < 10; i++) {
    const shard = document.createElement('div');
    shard.className = 'ice-shard';
    const ang = Math.random() * Math.PI * 2;
    const dist = 25 + Math.random() * 55;
    const size = 8 + Math.random() * 12;
    shard.style.cssText = `
      left:${b.x}px; top:${b.y}px;
      width:${size}px; height:${size * 1.3}px;
      --ix:${Math.cos(ang)*dist}px; --iy:${Math.sin(ang)*dist - 10}px;
    `;
    board.appendChild(shard);
    setTimeout(() => shard.remove(), 600);
  }
}

function canSnowballFreezeTarget(freezer, target) {
  if (!target || target === freezer || target.popping) return false;
  // 雪球不冻雪球；炸弹/TNT 太烫也冻不住
  if (target.type === 'ice' || target.type === 'bomb' || target.type === 'tnt') return false;
  return true;
}

function triggerIceFreeze(b) {
  showToast('❄️ 雪球冰冻！', '#81d4fa');
  const until = performance.now() + 3800;
  const targets = [];
  state.bubbles.forEach(o => {
    if (!canSnowballFreezeTarget(b, o)) return;
    const dx = o.x - b.x, dy = o.y - b.y;
    if (Math.sqrt(dx*dx + dy*dy) < b.r * 5.5) targets.push(o);
  });

  // Throw Eggy-style snowballs at each target, then encase in ice
  targets.forEach((o, i) => {
    const ball = document.createElement('div');
    ball.className = 'eggy-snowball';
    const size = 16 + Math.random() * 10;
    ball.style.cssText = `
      left:${b.x - size/2}px; top:${b.y - size/2}px;
      width:${size}px; height:${size}px;
      --sx:${o.x - b.x}px; --sy:${o.y - b.y}px;
      animation-delay:${i * 40}ms;
    `;
    board.appendChild(ball);
    setTimeout(() => ball.remove(), 420 + i * 40);

    setTimeout(() => {
      if (o.popping) return;
      o.frozenUntil = until;
      // Impact puff
      const puff = document.createElement('div');
      puff.style.cssText = `
        position:absolute; left:${o.x - o.r}px; top:${o.y - o.r}px;
        width:${o.r*2}px; height:${o.r*2}px; border-radius:50%;
        background:radial-gradient(circle, rgba(255,255,255,0.9), rgba(144,202,249,0.3) 60%, transparent 70%);
        pointer-events:none; z-index:91; animation:hitFlash 0.4s ease-out forwards;
      `;
      board.appendChild(puff);
      setTimeout(() => puff.remove(), 420);

      // Shatter when thaw ends
      const delay = Math.max(0, until - performance.now());
      setTimeout(() => {
        if (!o.popping) spawnIceShatter(o);
      }, delay);
    }, 280 + i * 40);
  });
}
function triggerLightningZap(b) {
  showToast('⚡ 雷劈！', '#ffee58');
  const targets = [];
  state.bubbles.forEach(o => {
    if (o === b || o.popping) return;
    const dx = o.x - b.x, dy = o.y - b.y;
    if (Math.sqrt(dx*dx+dy*dy) < b.r * 4.5) targets.push(o);
  });
  targets.slice(0, 5).forEach((o, i) => setTimeout(() => triggerPop(o), 60 + i * 70));
}
function triggerMagnetPull(b) {
  showToast('🧲 磁力！', '#90a4ae');
  state.bubbles.forEach(o => {
    if (o === b || o.popping) return;
    const dx = b.x - o.x, dy = b.y - o.y;
    const dist = Math.sqrt(dx*dx+dy*dy) || 1;
    if (dist < b.r * 7) {
      o.x += dx / dist * Math.min(80, dist * 0.55);
      o.y += dy / dist * Math.min(80, dist * 0.55);
    }
  });
}
function triggerClockSlow() {
  showToast('⏰ 时间变慢！', '#a1887f');
  state.timeScale = 0.35;
  if (state.slowTimer) clearTimeout(state.slowTimer);
  state.slowTimer = setTimeout(() => {
    state.timeScale = 1;
    state.slowTimer = null;
    showToast('⏰ 时间恢复', '#ccc');
  }, 4000);
}
function triggerSpawnSpeedBoost() {
  showToast('🚀 刷泡加速！', '#66bb6a');
  if (!state.baseSpawnInterval) state.baseSpawnInterval = state.spawnInterval;
  state.speedBoostActive = true;
  state.speedSpawnSide = Math.random() < 0.5 ? 'left' : 'right';
  // 2x spawn rate only — do not change bubble movement speed
  state.spawnInterval = Math.max(120, Math.floor((state.baseSpawnInterval || 800) / 2));
  startSpawnLoop();
  if (state.speedBoostTimer) clearTimeout(state.speedBoostTimer);
  state.speedBoostTimer = setTimeout(() => {
    state.spawnInterval = state.baseSpawnInterval || 800;
    state.speedBoostActive = false;
    state.speedSpawnSide = null;
    startSpawnLoop();
    state.speedBoostTimer = null;
    showToast('🚀 加速结束', '#ccc');
  }, 5000);
}

function spawnLuckyCoinRain(b, reward) {
  showToast(`🍀 幸运！金币与分数各 +${reward}！`, '#ffd54f');

  const W = canvasW();
  const H = canvasH();
  const coinSize = 44; // 2x previous ~22px
  // Build a gold-coin mountain at the bottom of the screen
  const layers = 7;
  let idx = 0;
  for (let row = 0; row < layers; row++) {
    // Bottom row widest, top of pile narrowest
    const coinsInRow = 14 - row * 1.6;
    const count = Math.max(3, Math.round(coinsInRow + (Math.random() - 0.5)));
    const rowWidth = Math.min(W * 0.92, count * coinSize * 0.72);
    const startX = (W - rowWidth) / 2;
    const y = H - 18 - coinSize - row * (coinSize * 0.52);
    for (let i = 0; i < count; i++) {
      const coin = document.createElement('div');
      coin.className = 'lucky-coin';
      const t = count === 1 ? 0.5 : i / (count - 1);
      // Slight random scatter so it looks piled, not a perfect grid
      const x = startX + t * rowWidth + (Math.random() - 0.5) * 10 - coinSize / 2;
      const jitterY = y + (Math.random() - 0.5) * 8;
      coin.style.cssText = `
        left:${x}px; top:${jitterY}px;
        animation-delay:${idx * 28}ms;
        z-index:${85 + row};
      `;
      board.appendChild(coin);
      setTimeout(() => coin.remove(), 5000 + idx * 28 + 80);
      idx++;
    }
  }
  // Extra loose coins near the base for a fuller pile
  for (let i = 0; i < 12; i++) {
    const coin = document.createElement('div');
    coin.className = 'lucky-coin';
    const x = W * 0.12 + Math.random() * W * 0.76 - coinSize / 2;
    const y = H - 14 - coinSize - Math.random() * 36;
    coin.style.cssText = `
      left:${x}px; top:${y}px;
      animation-delay:${idx * 28}ms;
      z-index:84;
      transform: rotate(${(Math.random()-0.5)*40}deg);
    `;
    board.appendChild(coin);
    setTimeout(() => coin.remove(), 5000 + idx * 28 + 80);
    idx++;
  }
}

function playPopStrawberry() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    // Soft juicy pop — higher than watermelon
    [140, 220, 320].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      o.frequency.exponentialRampToValueAtTime(f * 0.45, now + 0.22);
      g.gain.setValueAtTime(0.4, now + i * 0.012);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      o.connect(g).connect(ctx.destination);
      o.start(now + i * 0.012); o.stop(now + 0.35);
    });
    // Splat noise
    const blen = Math.floor(ctx.sampleRate * 0.18);
    const buf  = ctx.createBuffer(1, blen, ctx.sampleRate);
    const d    = buf.getChannelData(0);
    for (let i = 0; i < blen; i++) d[i] = (Math.random()*2-1)*Math.exp(-i/blen*9);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const flt = ctx.createBiquadFilter(); flt.type='bandpass'; flt.frequency.value=700; flt.Q.value=0.6;
    const ng  = ctx.createGain();
    ng.gain.setValueAtTime(0.85, now); ng.gain.exponentialRampToValueAtTime(0.001, now+0.24);
    src.connect(flt).connect(ng).connect(ctx.destination);
    src.start(now); src.stop(now+0.28);
    // Juice drip
    [0.06,0.12,0.2,0.28].forEach((t,i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type='triangle'; o.frequency.setValueAtTime(1100-i*90, now+t);
      o.frequency.exponentialRampToValueAtTime(280, now+t+0.16);
      g.gain.setValueAtTime(0.1, now+t); g.gain.exponentialRampToValueAtTime(0.001, now+t+0.2);
      o.connect(g).connect(ctx.destination); o.start(now+t); o.stop(now+t+0.22);
    });
  } catch(e) {}
}

function spawnStrawberryBlast(b) {
  const flash = document.createElement('div');
  flash.style.cssText = `
    position:absolute; inset:0;
    background:radial-gradient(circle at ${b.x}px ${b.y}px, rgba(255,80,100,0.55), transparent 55%);
    pointer-events:none; z-index:190;
    animation:hitFlash 0.55s ease-out forwards;
  `;
  board.appendChild(flash);
  setTimeout(() => flash.remove(), 600);

  for (let i = 0; i < 14; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = b.r * (0.4 + Math.random() * 2.2);
    const size  = 8 + Math.random() * 16;
    const chunk = document.createElement('div');
    chunk.style.cssText = `
      position:absolute;
      left:${b.x-size/2}px; top:${b.y-size/2}px;
      width:${size}px; height:${size*0.7}px;
      border-radius:50% 50% 45% 45%;
      background:radial-gradient(circle at 35% 30%, #ff8a9a, #c62828);
      transform:rotate(${Math.random()*360}deg);
      transition:transform 0.6s ease-out, opacity 0.6s ease-out;
      opacity:1; pointer-events:none; z-index:200;
    `;
    board.appendChild(chunk);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      chunk.style.transform = `translate(${Math.cos(angle)*speed}px,${Math.sin(angle)*speed}px) rotate(${Math.random()*540}deg)`;
      chunk.style.opacity = '0';
    }));
    setTimeout(() => chunk.remove(), 650);
  }

  for (let i = 0; i < 16; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = b.r * (0.3 + Math.random() * 1.8);
    const seed = document.createElement('div');
    seed.style.cssText = `
      position:absolute; left:${b.x-3}px; top:${b.y-4}px;
      width:6px; height:9px; border-radius:50%;
      background:#ffecb3;
      transform:rotate(${Math.random()*360}deg);
      transition:transform 0.65s ease-out, opacity 0.65s ease-out;
      opacity:1; pointer-events:none; z-index:201;
    `;
    board.appendChild(seed);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      seed.style.transform = `translate(${Math.cos(angle)*speed}px,${Math.sin(angle)*speed}px) rotate(${Math.random()*720}deg)`;
      seed.style.opacity = '0';
    }));
    setTimeout(() => seed.remove(), 700);
  }
}

function floodBoardWithStrawberryJuice() {
  state.strawberryJuiceActive = true;
  showToast('🍓 草莓酱甩上墙了！5秒后消散！', '#e53935');

  const old = document.getElementById('strawberry-juice-overlay');
  if (old) old.remove();
  if (state.strawberryJuiceTimer) clearTimeout(state.strawberryJuiceTimer);

  const overlay = document.createElement('div');
  overlay.id = 'strawberry-juice-overlay';

  const W = board.clientWidth || canvasW();
  const H = board.clientHeight || canvasH();

  // Round opaque jam puddle + protruding bumps (click-through via pointer-events:none)
  function makePuddle(cx, cy, baseR, delayMs) {
    // Main solid circle body
    const core = document.createElement('div');
    core.className = 'sb-jam';
    core.style.cssText = `
      left:${cx - baseR}px; top:${cy - baseR}px;
      width:${baseR * 2}px; height:${baseR * 2}px;
      animation-delay:${delayMs}ms;
      z-index:1;
    `;
    overlay.appendChild(core);

    // Protruding bumps around the rim
    const bumps = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < bumps; i++) {
      const bump = document.createElement('div');
      bump.className = 'sb-jam-bump';
      const br = baseR * (0.22 + Math.random() * 0.2);
      const ang = (Math.PI * 2 / bumps) * i + (Math.random() - 0.5) * 0.25;
      // Sit on the edge so it sticks out of the circle
      const dist = baseR * (0.82 + Math.random() * 0.12);
      bump.style.cssText = `
        left:${cx + Math.cos(ang) * dist - br}px;
        top:${cy + Math.sin(ang) * dist - br}px;
        width:${br * 2}px; height:${br * 2}px;
        animation-delay:${delayMs + 30 + i * 18}ms;
        z-index:2;
      `;
      overlay.appendChild(bump);
    }

    // Seeds on the jam surface
    const seeds = 4 + Math.floor(Math.random() * 4);
    for (let s = 0; s < seeds; s++) {
      const seed = document.createElement('div');
      seed.className = 'sb-seed-dot';
      const sw = 3 + Math.random() * 3.5;
      const ang = Math.random() * Math.PI * 2;
      const dist = baseR * (0.15 + Math.random() * 0.55);
      seed.style.cssText = `
        left:${cx + Math.cos(ang) * dist - sw / 2}px;
        top:${cy + Math.sin(ang) * dist - sw * 0.7}px;
        width:${sw}px; height:${sw * 1.4}px;
        z-index:3;
        transform:rotate(${Math.random() * 40 - 20}deg);
      `;
      overlay.appendChild(seed);
    }

    // Tiny protruding flecks farther out
    const flecks = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < flecks; i++) {
      const fleck = document.createElement('div');
      fleck.className = 'sb-jam-bump';
      const fr = 5 + Math.random() * 10;
      const ang = Math.random() * Math.PI * 2;
      const dist = baseR * (1.05 + Math.random() * 0.25);
      fleck.style.cssText = `
        left:${cx + Math.cos(ang) * dist - fr}px;
        top:${cy + Math.sin(ang) * dist - fr}px;
        width:${fr * 2}px; height:${fr * 2}px;
        animation-delay:${delayMs + 80 + i * 20}ms;
        z-index:2;
      `;
      overlay.appendChild(fleck);
    }
  }

  // Scatter opaque puddles across the board — size is 2.5x then /1.5 of that era
  let delay = 0;
  const count = 9;
  for (let i = 0; i < count; i++) {
    const margin = 80;
    const cx = margin + Math.random() * Math.max(20, W - margin * 2);
    const cy = margin + Math.random() * Math.max(20, H - margin * 2);
    const baseR = (42 + Math.random() * 38) * 2.5 / 1.5;
    makePuddle(cx, cy, baseR, delay);
    delay += 45 + Math.random() * 55;
  }

  board.appendChild(overlay);

  setTimeout(() => {
    if (state.strawberryJuiceActive) showToast('🍓 草莓酱还剩2秒！', '#ff8a80');
  }, 3000);

  state.strawberryJuiceTimer = setTimeout(() => {
    overlay.classList.add('fading');
    setTimeout(() => {
      overlay.remove();
      state.strawberryJuiceActive = false;
      state.strawberryJuiceTimer = null;
      showToast('🍓 草莓酱消散了！', '#ff8a80');
    }, 850);
  }, 5000);
}

function spawnWatermelonBlast(b) {
  // Screen flash — green/red
  const flash = document.createElement('div');
  flash.style.cssText = `
    position:fixed; inset:0; z-index:9998; pointer-events:none;
    background:radial-gradient(circle at ${b.x}px ${b.y}px,
      rgba(255,60,60,0.7) 0%, rgba(30,180,10,0.4) 40%, transparent 70%);
    animation:tntFlash 0.5s ease-out forwards;
  `;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 550);

  // Red flesh chunks flying out
  for (let i = 0; i < 22; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = b.r * (0.8 + Math.random() * 1.8);
    const size  = 8 + Math.random() * 20;
    const chunk = document.createElement('div');
    chunk.style.cssText = `
      position:absolute;
      left:${b.x - size/2}px; top:${b.y - size/2}px;
      width:${size}px; height:${size*(0.6+Math.random()*0.6)}px;
      border-radius:${20+Math.random()*40}% ${30+Math.random()*40}% ${20+Math.random()*40}% ${30+Math.random()*40}%;
      background:radial-gradient(circle, #ff5555 0%, #cc1111 60%, #881010 100%);
      box-shadow:0 0 6px rgba(200,0,0,0.5);
      transform:rotate(${Math.random()*360}deg);
      transition:transform 0.6s ease-out, opacity 0.6s ease-out;
      opacity:1; pointer-events:none; z-index:200;
    `;
    board.appendChild(chunk);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      chunk.style.transform = `translate(${Math.cos(angle)*speed}px,${Math.sin(angle)*speed}px) rotate(${Math.random()*720}deg)`;
      chunk.style.opacity   = '0';
    }));
    setTimeout(() => chunk.remove(), 680);
  }

  // Green rind pieces
  for (let i = 0; i < 14; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = b.r * (0.5 + Math.random() * 1.2);
    const size  = 6 + Math.random() * 14;
    const rind  = document.createElement('div');
    rind.style.cssText = `
      position:absolute;
      left:${b.x-size/2}px; top:${b.y-size/2}px;
      width:${size*1.5}px; height:${size*0.4}px;
      border-radius:4px;
      background:linear-gradient(90deg,#1a8a0a,#0f5a06);
      border-top:${Math.max(1,size*0.15)}px solid #2ab818;
      transform:rotate(${Math.random()*360}deg);
      transition:transform 0.55s ease-out, opacity 0.55s ease-out;
      opacity:1; pointer-events:none; z-index:200;
    `;
    board.appendChild(rind);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      rind.style.transform = `translate(${Math.cos(angle)*speed}px,${Math.sin(angle)*speed}px) rotate(${Math.random()*540}deg)`;
      rind.style.opacity   = '0';
    }));
    setTimeout(() => rind.remove(), 620);
  }

  // Black seeds scattering
  for (let i = 0; i < 18; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = b.r * (0.3 + Math.random() * 2.0);
    const seed  = document.createElement('div');
    seed.style.cssText = `
      position:absolute;
      left:${b.x-4}px; top:${b.y-6}px;
      width:7px; height:11px;
      border-radius:50%;
      background:#111;
      transform:rotate(${Math.random()*360}deg);
      transition:transform 0.7s ease-out, opacity 0.7s ease-out;
      opacity:1; pointer-events:none; z-index:201;
    `;
    board.appendChild(seed);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      seed.style.transform = `translate(${Math.cos(angle)*speed}px,${Math.sin(angle)*speed}px) rotate(${Math.random()*720}deg)`;
      seed.style.opacity   = '0';
    }));
    setTimeout(() => seed.remove(), 750);
  }

  // Red juice splatter on board
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist  = b.r * (0.5 + Math.random() * 2);
    const sx = b.x + Math.cos(angle)*dist, sy = b.y + Math.sin(angle)*dist;
    const ms = 10 + Math.random() * 24;
    const splat = document.createElement('div');
    splat.style.cssText = `
      position:absolute;
      left:${sx-ms/2}px; top:${sy-ms/2}px;
      width:${ms}px; height:${ms*0.55}px;
      border-radius:50%;
      background:rgba(200,20,20,0.65);
      filter:blur(2px);
      pointer-events:none; z-index:199;
      animation:hitFlash 1.5s ease-out forwards;
    `;
    board.appendChild(splat);
    setTimeout(() => splat.remove(), 1600);
  }
}

function applyWatermelonTransform(b) {
  if (!b || b.popping || b._isWmConverted) return;

  // Natural watermelons must not remain watermelon after the mode ends
  const wasNaturalWm = b.type === 'watermelon';
  b._origType  = wasNaturalWm ? 'dry' : b.type;
  b._origColor = wasNaturalWm ? pickColor() : b.color;
  b._origWet   = wasNaturalWm ? false : !!b.wet;
  b._isWmConverted = true;

  b.type  = 'watermelon';
  b.color = '#1a7a0a';
  b.wet   = false;
  b.wmSeeds = Array.from({length: 9}, (_, i) => ({
    angle: (Math.PI*2/9)*i + (Math.random()-0.5)*0.4,
    dist:  0.28 + Math.random()*0.28,
    rot:   Math.random()*Math.PI,
    w:     0.06 + Math.random()*0.04,
    h:     0.12 + Math.random()*0.06,
  }));
  b.wmStripes = Array.from({length: 8}, (_, i) => ({
    angle: (Math.PI*2/8)*i,
    width: 0.08 + Math.random()*0.06,
  }));
}

function revertWatermelonTransform(b) {
  if (!b || b.popping) return;
  // Clear every watermelon look — converted or leftover natural
  if (b._isWmConverted) {
    b.type  = b._origType || 'dry';
    b.color = b._origColor || pickColor();
    b.wet   = !!b._origWet;
  } else if (b.type === 'watermelon') {
    b.type  = 'dry';
    b.color = pickColor();
    b.wet   = false;
  } else {
    return;
  }
  b._isWmConverted = false;
  b.wmSeeds   = null;
  b.wmStripes = null;
  delete b._origType;
  delete b._origColor;
  delete b._origWet;
}

function endWatermelonMode() {
  state.watermelonActive = false;
  state.watermelonTimer = null;
  state.watermelonWarnTimer = null;
  showToast('🍉 西瓜时间结束！', '#ff6644');

  // Revert ALL watermelons immediately — no leftovers, no seed dots
  state.bubbles.forEach(b => {
    if (b.popping) return;
    if (b._isWmConverted || b.type === 'watermelon') {
      revertWatermelonTransform(b);
      const fl = document.createElement('div');
      fl.style.cssText = `
        position:absolute;
        left:${b.x-b.r}px; top:${b.y-b.r}px;
        width:${b.r*2}px; height:${b.r*2}px;
        border-radius:50%;
        background:rgba(255,150,30,0.5);
        animation:hitFlash 0.4s ease-out forwards;
        pointer-events:none; z-index:90;
      `;
      board.appendChild(fl);
      setTimeout(() => fl.remove(), 420);
    }
  });
}

function convertAllToWatermelon() {
  // Hard lock immediately so rapid double-pops cannot stack
  if (state.watermelonActive) return;
  state.watermelonActive = true;

  // Clear any leftover timers (safety)
  if (state.watermelonTimer) clearTimeout(state.watermelonTimer);
  if (state.watermelonWarnTimer) clearTimeout(state.watermelonWarnTimer);

  showToast('🍉 全场变西瓜！10秒后恢复！每个+25分！', '#2ab818');

  // Convert EVERY bubble on screen (including existing watermelons)
  state.bubbles.forEach((b, idx) => {
    if (b.popping) return;
    setTimeout(() => {
      if (b.popping || !state.watermelonActive) return;
      applyWatermelonTransform(b);

      const fl = document.createElement('div');
      fl.style.cssText = `
        position:absolute;
        left:${b.x-b.r}px; top:${b.y-b.r}px;
        width:${b.r*2}px; height:${b.r*2}px;
        border-radius:50%;
        background:rgba(50,200,30,0.6);
        animation:hitFlash 0.4s ease-out forwards;
        pointer-events:none; z-index:90;
      `;
      board.appendChild(fl);
      setTimeout(() => fl.remove(), 420);
    }, idx * 40);
  });

  state.watermelonWarnTimer = setTimeout(() => {
    if (state.watermelonActive) showToast('🍉 西瓜还剩3秒！', '#ffcc00');
  }, 7000);

  state.watermelonTimer = setTimeout(endWatermelonMode, 10000);
}

function playPopGlassWater() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    // Glass clink — high pitched ping
    [2400, 3200, 4000].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.18, now + i*0.01);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      o.connect(g).connect(ctx.destination);
      o.start(now + i*0.01); o.stop(now + 0.4);
    });
    // Glass crack burst
    const bufLen = Math.floor(ctx.sampleRate * 0.06);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random()*2-1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const flt = ctx.createBiquadFilter();
    flt.type = 'highpass'; flt.frequency.value = 3000;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.5, now); ng.gain.exponentialRampToValueAtTime(0.001, now+0.08);
    src.connect(flt).connect(ng).connect(ctx.destination);
    src.start(now); src.stop(now+0.1);
    // Waterfall rush — loud sustained broadband noise
    const bufLen2 = Math.floor(ctx.sampleRate * 1.2);
    const buf2 = ctx.createBuffer(1, bufLen2, ctx.sampleRate);
    const d2 = buf2.getChannelData(0);
    for (let i = 0; i < bufLen2; i++) d2[i] = Math.random()*2-1;
    const src2 = ctx.createBufferSource();
    src2.buffer = buf2;
    const flt2 = ctx.createBiquadFilter();
    flt2.type = 'bandpass'; flt2.frequency.value = 500; flt2.Q.value = 0.3;
    const ng2 = ctx.createGain();
    ng2.gain.setValueAtTime(0, now);
    ng2.gain.linearRampToValueAtTime(1.0, now+0.08);
    ng2.gain.setValueAtTime(1.0, now+0.5);
    ng2.gain.exponentialRampToValueAtTime(0.001, now+1.3);
    src2.connect(flt2).connect(ng2).connect(ctx.destination);
    src2.start(now+0.04); src2.stop(now+1.35);
    // Low rumble layer for depth
    const bufLen3 = Math.floor(ctx.sampleRate * 1.0);
    const buf3 = ctx.createBuffer(1, bufLen3, ctx.sampleRate);
    const d3 = buf3.getChannelData(0);
    for (let i = 0; i < bufLen3; i++) d3[i] = Math.random()*2-1;
    const src3 = ctx.createBufferSource();
    src3.buffer = buf3;
    const flt3 = ctx.createBiquadFilter();
    flt3.type = 'lowpass'; flt3.frequency.value = 200;
    const ng3 = ctx.createGain();
    ng3.gain.setValueAtTime(0.5, now+0.05); ng3.gain.exponentialRampToValueAtTime(0.001, now+1.1);
    src3.connect(flt3).connect(ng3).connect(ctx.destination);
    src3.start(now+0.05); src3.stop(now+1.15);
    // Water droplet pings
    [0.1,0.2,0.3,0.42].forEach((t, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(1600-i*120, now+t);
      o.frequency.exponentialRampToValueAtTime(600, now+t+0.15);
      g.gain.setValueAtTime(0.1, now+t); g.gain.exponentialRampToValueAtTime(0.001, now+t+0.2);
      o.connect(g).connect(ctx.destination);
      o.start(now+t); o.stop(now+t+0.22);
    });
  } catch(e) {}
}

function spawnGlassWaterEffect(b) {
  // Glass shards flying out
  for (let i = 0; i < 14; i++) {
    const angle = (Math.PI * 2 / 14) * i + Math.random() * 0.4;
    const speed = b.r * (0.5 + Math.random() * 1.0);
    const size  = 4 + Math.random() * 9;
    const shard = document.createElement('div');
    shard.style.cssText = `
      position:absolute;
      left:${b.x - size/2}px; top:${b.y - size/2}px;
      width:${size}px; height:${size * 0.35}px;
      background:rgba(210,245,255,0.88);
      box-shadow:0 0 6px rgba(255,255,255,0.95);
      border-radius:1px;
      transform:rotate(${Math.random()*180}deg) translate(${Math.cos(angle)*speed}px,${Math.sin(angle)*speed}px);
      transition:transform 0.45s ease-out, opacity 0.45s ease-out;
      opacity:1; pointer-events:none; z-index:95;
    `;
    board.appendChild(shard);
    requestAnimationFrame(() => requestAnimationFrame(() => { shard.style.opacity = '0'; }));
    setTimeout(() => shard.remove(), 500);
  }

  const colW    = Math.max(40, b.r * 1.1);   // column width tied to bubble size
  const colH    = 380 + Math.random() * 120; // how far it falls
  const colDur  = 500;                        // total lifetime ms
  const startY  = b.y - b.r * 0.15;

  // ── Main water column ──
  const col = document.createElement('div');
  col.style.cssText = `
    position:absolute;
    left:${b.x - colW/2}px; top:${startY}px;
    width:${colW}px; height:3px;
    transform-origin:top center;
    border-radius:4px 4px 8px 8px;
    background:linear-gradient(180deg,
      rgba(220,248,255,0.98) 0%,
      rgba(80,180,255,0.92)  25%,
      rgba(40,140,240,0.85)  60%,
      rgba(20,100,220,0.4)   85%,
      transparent 100%);
    box-shadow:0 0 18px rgba(80,200,255,0.6), 0 0 6px rgba(255,255,255,0.5);
    transition:height ${colDur}ms cubic-bezier(0.1,0,0.3,1),
               opacity ${colDur}ms ease-out;
    opacity:0.95; pointer-events:none; z-index:98;
  `;
  board.appendChild(col);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    col.style.height = `${colH}px`;
    col.style.opacity = '0.05';
  }));
  setTimeout(() => col.remove(), colDur + 60);

  // ── Inner bright flow streaks (simulate rushing turbulence) ──
  for (let k = 0; k < 4; k++) {
    const sw    = colW * (0.08 + Math.random() * 0.12);
    const sx    = b.x + (Math.random() - 0.5) * colW * 0.6;
    const sDur  = 380 + Math.random() * 120;
    const sDel  = k * 30;
    const streak = document.createElement('div');
    streak.style.cssText = `
      position:absolute;
      left:${sx - sw/2}px; top:${startY + 2}px;
      width:${sw}px; height:4px;
      transform-origin:top center;
      border-radius:2px;
      background:linear-gradient(180deg,rgba(255,255,255,0.95),rgba(180,235,255,0.5),transparent);
      transition:height ${sDur}ms ${sDel}ms cubic-bezier(0.1,0,0.25,1),
                 opacity ${sDur}ms ${sDel}ms ease-out;
      opacity:0.85; pointer-events:none; z-index:99;
    `;
    board.appendChild(streak);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      streak.style.height  = `${colH * (0.6 + Math.random()*0.35)}px`;
      streak.style.opacity = '0';
    }));
    setTimeout(() => streak.remove(), sDur + sDel + 60);
  }

  // ── Side splash arcs from the impact point ──
  const impactY = startY + colH * 0.88;
  for (let i = 0; i < 20; i++) {
    const side  = i < 10 ? -1 : 1;
    const speed = 40 + Math.random() * 100;
    const riseY = -(20 + Math.random() * 45);
    const size  = 3 + Math.random() * 6;
    const dur   = 300 + Math.random() * 200;
    const delay = 160 + Math.random() * 120;     // triggers after column hits bottom
    const sp = document.createElement('div');
    sp.style.cssText = `
      position:absolute;
      left:${b.x - size/2}px; top:${impactY}px;
      width:${size}px; height:${size * 2}px;
      border-radius:50% 50% 60% 60%;
      background:rgba(180,235,255,0.85);
      box-shadow:0 0 4px rgba(100,210,255,0.5);
      transition:transform ${dur}ms ${delay}ms ease-out, opacity ${dur}ms ${delay}ms ease-out;
      opacity:0.9; pointer-events:none; z-index:97;
    `;
    board.appendChild(sp);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      sp.style.transform = `translate(${side * speed}px, ${riseY}px) scaleY(0.5)`;
      sp.style.opacity   = '0';
    }));
    setTimeout(() => sp.remove(), dur + delay + 60);
  }

  // ── Impact foam cloud ──
  for (let i = 0; i < 14; i++) {
    const mx   = b.x + (Math.random()-0.5) * colW * 2.5;
    const ms   = 18 + Math.random() * 26;
    const mist = document.createElement('div');
    mist.style.cssText = `
      position:absolute;
      left:${mx - ms/2}px; top:${impactY - ms/4}px;
      width:${ms}px; height:${ms * 0.45}px;
      border-radius:50%;
      background:rgba(210,245,255,0.55);
      filter:blur(${5 + Math.random()*5}px);
      transition:transform 0.45s ${180 + i*15}ms ease-out, opacity 0.45s ${180 + i*15}ms ease-out;
      opacity:0.65; pointer-events:none; z-index:96;
    `;
    board.appendChild(mist);
    setTimeout(() => {
      mist.style.transform = `translate(${(Math.random()-0.5)*50}px,-${5+Math.random()*15}px) scale(3.5)`;
      mist.style.opacity   = '0';
    }, 180 + i * 15);
    setTimeout(() => mist.remove(), 180 + i*15 + 500);
  }
}

function playGooseHonk() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    [320, 420, 560].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(f, now + i*0.015);
      o.frequency.linearRampToValueAtTime(f * 0.7, now + i*0.015 + 0.18);
      g.gain.setValueAtTime(0.25, now + i*0.015);
      g.gain.exponentialRampToValueAtTime(0.001, now + i*0.015 + 0.22);
      o.connect(g).connect(ctx.destination);
      o.start(now + i*0.015); o.stop(now + i*0.015 + 0.25);
    });
  } catch(e) {}
}

function playGooseHonkFinal() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    [0, 0.18, 0.36].forEach((t, n) => {
      [320, 480, 640, 800].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(f * (1 + n * 0.15), now + t + i*0.01);
        o.frequency.exponentialRampToValueAtTime(f * 0.5, now + t + 0.2);
        g.gain.setValueAtTime(0.3, now + t + i*0.01);
        g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.25);
        o.connect(g).connect(ctx.destination);
        o.start(now + t + i*0.01); o.stop(now + t + 0.28);
      });
    });
    const bufLen = Math.floor(ctx.sampleRate * 0.15);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random()*2-1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const flt = ctx.createBiquadFilter();
    flt.type = 'highpass'; flt.frequency.value = 2000;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.4, now+0.5); ng.gain.exponentialRampToValueAtTime(0.001, now+0.7);
    src.connect(flt).connect(ng).connect(ctx.destination);
    src.start(now+0.5); src.stop(now+0.75);
  } catch(e) {}
}

function playWaterSplash() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const bufLen = Math.floor(ctx.sampleRate * 0.12);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = (Math.random()*2-1) * Math.exp(-i/bufLen*8);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const flt = ctx.createBiquadFilter();
    flt.type = 'bandpass'; flt.frequency.value = 800; flt.Q.value = 0.6;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.55, now); ng.gain.exponentialRampToValueAtTime(0.001, now+0.18);
    src.connect(flt).connect(ng).connect(ctx.destination);
    src.start(now); src.stop(now+0.2);
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(1200, now+0.05);
    o.frequency.exponentialRampToValueAtTime(600, now+0.2);
    g.gain.setValueAtTime(0.12, now+0.05); g.gain.exponentialRampToValueAtTime(0.001, now+0.25);
    o.connect(g).connect(ctx.destination);
    o.start(now+0.05); o.stop(now+0.28);
  } catch(e) {}
}

function playWaterBurst() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const bufLen = Math.floor(ctx.sampleRate * 0.4);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = (Math.random()*2-1) * Math.exp(-i/bufLen*4);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const flt = ctx.createBiquadFilter();
    flt.type = 'bandpass'; flt.frequency.value = 600; flt.Q.value = 0.4;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.9, now); ng.gain.exponentialRampToValueAtTime(0.001, now+0.45);
    src.connect(flt).connect(ng).connect(ctx.destination);
    src.start(now); src.stop(now+0.5);
    [0.05, 0.12, 0.2, 0.3, 0.38].forEach((t, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(1400 - i*120, now+t);
      o.frequency.exponentialRampToValueAtTime(500, now+t+0.18);
      g.gain.setValueAtTime(0.18, now+t); g.gain.exponentialRampToValueAtTime(0.001, now+t+0.22);
      o.connect(g).connect(ctx.destination);
      o.start(now+t); o.stop(now+t+0.25);
    });
  } catch(e) {}
}

function spawnBombBlast(b, blastR) {
  // Massive orange shockwave ring
  for (let i = 0; i < 3; i++) {
    const ring = document.createElement('div');
    ring.style.cssText = `
      position:absolute;
      left:${b.x - blastR}px; top:${b.y - blastR}px;
      width:${blastR*2}px; height:${blastR*2}px;
      border-radius:50%;
      border: ${3 + i*2}px solid rgba(255,${120 - i*40},0,${0.9 - i*0.25});
      animation: bombRing ${0.5 + i*0.12}s ease-out forwards;
      pointer-events:none; z-index:99;
    `;
    board.appendChild(ring);
    setTimeout(() => ring.remove(), 800);
  }

  // Central fireball flash
  const flash = document.createElement('div');
  flash.style.cssText = `
    position:absolute;
    left:${b.x - blastR*0.7}px; top:${b.y - blastR*0.7}px;
    width:${blastR*1.4}px; height:${blastR*1.4}px;
    border-radius:50%;
    background: radial-gradient(circle, rgba(255,255,200,0.95) 0%, rgba(255,160,0,0.7) 40%, rgba(255,60,0,0.3) 70%, transparent 100%);
    animation: bombFlash 0.45s ease-out forwards;
    pointer-events:none; z-index:100;
  `;
  board.appendChild(flash);
  setTimeout(() => flash.remove(), 500);

  // Ember particles flying outward
  for (let i = 0; i < 24; i++) {
    const angle  = (Math.PI * 2 / 24) * i + Math.random() * 0.3;
    const speed  = blastR * (0.5 + Math.random() * 0.9);
    const size   = 4 + Math.random() * 8;
    const colors = ['255,220,0','255,140,0','255,60,0','255,255,100','200,200,200'];
    const col    = colors[Math.floor(Math.random() * colors.length)];
    const ember  = document.createElement('div');
    ember.style.cssText = `
      position:absolute;
      left:${b.x - size/2}px; top:${b.y - size/2}px;
      width:${size}px; height:${size}px;
      border-radius:50%;
      background:rgba(${col},1);
      box-shadow:0 0 ${size*1.5}px rgba(${col},0.8);
      transform:translate(${Math.cos(angle)*speed}px, ${Math.sin(angle)*speed}px);
      transition:transform 0.55s ease-out, opacity 0.55s ease-out;
      opacity:1; pointer-events:none; z-index:101;
    `;
    board.appendChild(ember);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ember.style.opacity = '0';
    }));
    setTimeout(() => ember.remove(), 600);
  }
}

function playPopBomb() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    // Thunderous sub-bass explosion thud
    [40, 55, 70, 90].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = f;
      o.frequency.exponentialRampToValueAtTime(f * 0.3, now + 0.6);
      g.gain.setValueAtTime(0.7, now + i*0.01);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      o.connect(g).connect(ctx.destination);
      o.start(now + i*0.01); o.stop(now + 0.85);
    });

    // White noise blast — the explosion body
    const bufLen = Math.floor(ctx.sampleRate * 0.35);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random()*2-1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass'; flt.frequency.value = 1800;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(1.0, now); ng.gain.exponentialRampToValueAtTime(0.001, now+0.4);
    src.connect(flt).connect(ng).connect(ctx.destination);
    src.start(now); src.stop(now+0.4);

    // Crackling debris — rapid metallic hits
    for (let i = 0; i < 10; i++) {
      const t = now + 0.05 + i * 0.06;
      const freq = 300 + Math.random() * 2000;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'square'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      o.connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + 0.1);
    }

    // Ringing aftermath — metallic echo
    [220, 350, 520].forEach((freq, i) => {
      const t = now + 0.15 + i * 0.08;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      o.connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + 1.3);
    });
  } catch(e) {}
}

function spawnExplosion(b) {
  const [cr,cg,cb] = hexToRgb(b.color);

  // Two ripple rings
  for (let i = 0; i < 2; i++) {
    const ripple = document.createElement('div');
    ripple.className = i === 0 ? 'ripple' : 'ripple2';
    ripple.style.cssText = `
      left:${b.x - b.r}px; top:${b.y - b.r}px;
      width:${b.r*2}px; height:${b.r*2}px;
      background:rgba(${cr},${cg},${cb},0.5);
    `;
    board.appendChild(ripple);
    setTimeout(() => ripple.remove(), 950);
  }

  // Particle shards
  const numShards = b.wet ? 8 : 16;
  for (let i = 0; i < numShards; i++) {
    const angle  = (Math.PI * 2 / numShards) * i + Math.random() * 0.3;
    const speed  = b.r * (0.6 + Math.random() * 1.2);
    const size   = 4 + Math.random() * (b.wet ? 6 : 10);
    const shard  = document.createElement('div');
    shard.className = 'shard';
    shard.style.cssText = `
      left:${b.x}px; top:${b.y}px;
      width:${size}px; height:${size}px;
      background:rgba(${cr},${cg},${cb},0.85);
      border-radius:${b.wet ? '50%' : '2px'};
    `;
    board.appendChild(shard);
    const duration = 400 + Math.random() * 350;
    shard.animate([
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(angle)*speed}px), calc(-50% + ${Math.sin(angle)*speed}px)) scale(0)`, opacity: 0 }
    ], { duration, easing: 'ease-out', fill: 'forwards' });
    setTimeout(() => shard.remove(), duration + 50);
  }
}

// ── Mouse ─────────────────────────────────────────────────────────
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const hit = findBubbleAt(e.clientX - rect.left, e.clientY - rect.top);
  board.classList.toggle('hovering', !!hit);
});

canvas.addEventListener('mousedown', e => {
  if (e.button !== 0) return;
  const rect = canvas.getBoundingClientRect();
  startPress(e.clientX - rect.left, e.clientY - rect.top);
});

canvas.addEventListener('mouseup',   () => endPress());
canvas.addEventListener('mouseleave',() => endPress());

// ── Touch ─────────────────────────────────────────────────────────
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const t = e.changedTouches[0];
  startPress(t.clientX - rect.left, t.clientY - rect.top);
}, { passive: false });

canvas.addEventListener('touchend',    () => endPress(), { passive: false });
canvas.addEventListener('touchcancel', () => endPress(), { passive: false });

// ══════════════════════════════════════════════════════════════════
//  CONTROLS
// ══════════════════════════════════════════════════════════════════

// Bubble shape
document.getElementById('bubble-shape').addEventListener('change', e => {
  state.bubbleShape = e.target.value;
});

// Bubble size
document.getElementById('bubble-size').addEventListener('input', e => {
  state.bubbleSize = +e.target.value;
});

// Water %
document.getElementById('water-pct').addEventListener('input', e => {
  state.waterPct = +e.target.value;
  document.getElementById('water-pct-val').textContent = e.target.value + '%';
});

document.getElementById('sand-pct').addEventListener('input', e => {
  state.sandPct = +e.target.value;
  document.getElementById('sand-pct-val').textContent = e.target.value + '%';
});

document.getElementById('diamond-pct').addEventListener('input', e => {
  state.diamondPct = +e.target.value;
  document.getElementById('diamond-pct-val').textContent = e.target.value + '%';
});

document.getElementById('golddiamond-pct').addEventListener('input', e => {
  state.golddiamondPct = +e.target.value;
  document.getElementById('golddiamond-pct-val').textContent = e.target.value + '%';
});

document.getElementById('darkmatter-pct').addEventListener('input', e => {
  state.darkmatterPct = +e.target.value;
  document.getElementById('darkmatter-pct-val').textContent = e.target.value + '%';
});

document.getElementById('galaxy-pct').addEventListener('input', e => {
  state.galaxyPct = +e.target.value;
  document.getElementById('galaxy-pct-val').textContent = e.target.value + '%';
});

document.getElementById('blackhole-pct').addEventListener('input', e => {
  state.blackholePct = +e.target.value;
  document.getElementById('blackhole-pct-val').textContent = e.target.value + '%';
});

document.getElementById('neutronstar-pct').addEventListener('input', e => {
  state.neutronstarPct = +e.target.value;
  document.getElementById('neutronstar-pct-val').textContent = e.target.value + '%';
});

document.getElementById('whitehole-pct').addEventListener('input', e => {
  state.whiteholePct = +e.target.value;
  document.getElementById('whitehole-pct-val').textContent = e.target.value + '%';
});

document.getElementById('supercluster-pct').addEventListener('input', e => {
  state.superclusterPct = +e.target.value;
  document.getElementById('supercluster-pct-val').textContent = e.target.value + '%';
});

document.getElementById('universe-pct').addEventListener('input', e => {
  state.universePct = +e.target.value;
  document.getElementById('universe-pct-val').textContent = e.target.value + '%';
});
document.getElementById('superuniverse-pct').addEventListener('input', e => {
  state.superuniversePct = +e.target.value;
  document.getElementById('superuniverse-pct-val').textContent = e.target.value + '%';
});
document.getElementById('bomb-pct').addEventListener('input', e => {
  state.bombPct = +e.target.value;
  document.getElementById('bomb-pct-val').textContent = e.target.value + '%';
});
document.getElementById('jiaoshuee-pct').addEventListener('input', e => {
  state.jiaoshueeePct = +e.target.value;
  document.getElementById('jiaoshuee-pct-val').textContent = e.target.value + '%';
});
document.getElementById('jiaoshui-pct').addEventListener('input', e => {
  state.jiaoshuiPct = +e.target.value;
  document.getElementById('jiaoshui-pct-val').textContent = e.target.value + '%';
});
document.getElementById('watermelon-pct').addEventListener('input', e => {
  state.watermelonPct = +e.target.value;
  document.getElementById('watermelon-pct-val').textContent = e.target.value + '%';
});
document.getElementById('strawberry-pct').addEventListener('input', e => {
  state.strawberryPct = +e.target.value;
  document.getElementById('strawberry-pct-val').textContent = e.target.value + '%';
});
document.getElementById('firework-pct').addEventListener('input', e => {
  state.fireworkPct = +e.target.value;
  document.getElementById('firework-pct-val').textContent = e.target.value + '%';
});
document.getElementById('lucky-pct').addEventListener('input', e => {
  state.luckyPct = +e.target.value;
  document.getElementById('lucky-pct-val').textContent = e.target.value + '%';
});

const NEW10_SLIDERS = [
  ['grape-pct','grapePct'],['soap-pct','soapPct'],['ice-pct','icePct'],['jelly-pct','jellyPct'],
  ['balloon-pct','balloonPct'],['lightning-pct','lightningPct'],['magnet-pct','magnetPct'],
  ['clock-pct','clockPct'],['speedbubble-pct','speedbubblePct'],['invisible-pct','invisiblePct'],
];
NEW10_SLIDERS.forEach(([id, key]) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', e => {
    state[key] = +e.target.value;
    const val = document.getElementById(id + '-val');
    if (val) val.textContent = e.target.value + '%';
  });
});
document.getElementById('glasswater-pct').addEventListener('input', e => {
  state.glassWaterPct = +e.target.value;
  document.getElementById('glasswater-pct-val').textContent = e.target.value + '%';
});
document.getElementById('tnt-pct').addEventListener('input', e => {
  state.tntPct = +e.target.value;
  document.getElementById('tnt-pct-val').textContent = e.target.value + '%';
});
document.getElementById('rainbowsmoke-pct').addEventListener('input', e => {
  state.rainbowsmokePct = +e.target.value;
  document.getElementById('rainbowsmoke-pct-val').textContent = e.target.value + '%';
});

// Spawn rate
document.getElementById('spawn-rate').addEventListener('input', e => {
  state.spawnInterval = +e.target.value;
  state.baseSpawnInterval = +e.target.value;
  startSpawnLoop();
});

// Board / bubble color pickers removed — colors set via default skin & quest themes only

// Board shape
document.getElementById('board-shape').addEventListener('change', e => {
  board.style.borderRadius = e.target.value;
});

// Clear
document.getElementById('btn-clear').addEventListener('click', () => {
  state.bubbles = [];
});

// Reset score
document.getElementById('btn-reset').addEventListener('click', () => {
  state.popped = 0;
  state.score = 0;
  state.coins = 0;
  state.bubbles = [];
  resetWallet(false);
  resetInventory();
  resetShop();
  document.getElementById('stat-popped').textContent = '0';
  document.getElementById('stat-score').textContent = '0';
  syncCoinUI();
  refreshShopItems();
});

// ══════════════════════════════════════════════════════════════════
//  SHOP
// ══════════════════════════════════════════════════════════════════
// purchased: set of item ids the player has bought
// activeMode: which item is currently activated ('none','speed1','speed2','speed3','instant')
const shop = {
  purchased: new Set(),
  activeMode: 'none',
};

let shopRocketHoldTimer = null;
let shopRocketHoldInterval = null;
let shopRocketHoldActive = false;
let shopRocketHoldBtn = null;

function stopShopRocketHold(refreshAfter = false) {
  if (shopRocketHoldTimer) { clearTimeout(shopRocketHoldTimer); shopRocketHoldTimer = null; }
  if (shopRocketHoldInterval) { clearInterval(shopRocketHoldInterval); shopRocketHoldInterval = null; }
  const wasHolding = shopRocketHoldActive;
  shopRocketHoldActive = false;
  shopRocketHoldBtn = null;
  if (refreshAfter && wasHolding) refreshShopItems();
}

const INVENTORY_STORAGE = 'bubbleRelief_inventory_v1';
const SHOP_STORAGE = 'bubbleRelief_shop_v1';

function loadInventory() {
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE);
    if (!raw) return;
    const d = JSON.parse(raw);
    Object.keys(state.inventory).forEach(k => {
      if (typeof d[k] === 'number' && d[k] >= 0) state.inventory[k] = d[k] | 0;
    });
    if (typeof d.rockets === 'number' && d.rockets >= 0) state.rockets = d.rockets | 0;
  } catch (e) {}
}

function saveInventory() {
  try {
    localStorage.setItem(INVENTORY_STORAGE, JSON.stringify({
      ...state.inventory,
      rockets: state.rockets | 0,
    }));
  } catch (e) {}
}

function loadShop() {
  try {
    const raw = localStorage.getItem(SHOP_STORAGE);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (Array.isArray(d.purchased)) {
      shop.purchased = new Set(d.purchased.filter(id => typeof id === 'string'));
    }
    shop.purchased.add('none');
    const mode = d.activeMode;
    if (typeof mode === 'string' && shop.purchased.has(mode) && SHOP_CATALOG.some(i => i.id === mode)) {
      shop.activeMode = mode;
      state.instantPop = mode === 'instant';
    }
  } catch (e) {}
}

function saveShop() {
  try {
    localStorage.setItem(SHOP_STORAGE, JSON.stringify({
      purchased: [...shop.purchased],
      activeMode: shop.activeMode,
    }));
  } catch (e) {}
}

function resetInventory() {
  Object.keys(state.inventory).forEach(k => { state.inventory[k] = 0; });
  state.rockets = 0;
  saveInventory();
}

function resetShop() {
  shop.purchased = new Set(['none']);
  shop.activeMode = 'none';
  state.instantPop = false;
  saveShop();
}

function formatShopCoins(n) {
  return (n | 0).toLocaleString('zh-CN');
}

const SHOP_DAILY_BUY_STORAGE = 'bubbleRelief_shopDailyBuys_v1';
const LEGACY_COINBAG_DAILY_STORAGE = 'bubbleRelief_coinBagDaily_v1';
const shopDailyBuys = { dateKey: '', counts: {} };

function getShopDailyLimit(item) {
  return item?.dailyLimit | 0;
}

function loadShopDailyBuys() {
  try {
    const raw = localStorage.getItem(SHOP_DAILY_BUY_STORAGE);
    if (raw) {
      const d = JSON.parse(raw);
      if (d.dateKey) shopDailyBuys.dateKey = d.dateKey;
      if (d.counts && typeof d.counts === 'object') shopDailyBuys.counts = { ...d.counts };
    }
    if (!shopDailyBuys.counts.coinbag) {
      const legacy = localStorage.getItem(LEGACY_COINBAG_DAILY_STORAGE);
      if (legacy) {
        const d = JSON.parse(legacy);
        if (d.dateKey) shopDailyBuys.dateKey = d.dateKey;
        if (typeof d.bought === 'number' && d.bought >= 0) shopDailyBuys.counts.coinbag = d.bought | 0;
      }
    }
  } catch (e) {}
}

function saveShopDailyBuys() {
  try {
    localStorage.setItem(SHOP_DAILY_BUY_STORAGE, JSON.stringify(shopDailyBuys));
  } catch (e) {}
}

function ensureShopDailyDay() {
  const today = questTodayKey();
  if (shopDailyBuys.dateKey !== today) {
    shopDailyBuys.dateKey = today;
    shopDailyBuys.counts = {};
    saveShopDailyBuys();
  }
}

function getShopDailyBought(itemId) {
  ensureShopDailyDay();
  return shopDailyBuys.counts[itemId] | 0;
}

function getShopDailyRemaining(item) {
  const limit = getShopDailyLimit(item);
  if (!limit) return Infinity;
  return Math.max(0, limit - getShopDailyBought(item.id));
}

function canBuyShopDailyItem(item) {
  const limit = getShopDailyLimit(item);
  if (!limit) return true;
  return getShopDailyRemaining(item) > 0;
}

function recordShopDailyPurchase(item) {
  const limit = getShopDailyLimit(item);
  if (!limit) return;
  ensureShopDailyDay();
  shopDailyBuys.counts[item.id] = (shopDailyBuys.counts[item.id] | 0) + 1;
  saveShopDailyBuys();
}

function shopDailyHoldBadgeHtml(item) {
  const limit = getShopDailyLimit(item);
  if (!limit) {
    return `<span style="color:#4fc3f7;font-weight:700">持有: ${getInvCount(item)} ${item.icon}</span>`;
  }
  const bought = getShopDailyBought(item.id);
  return `<span style="color:#4fc3f7;font-weight:700">持有: ${getInvCount(item)} ${item.icon} · 今日 ${bought}/${limit}</span>`;
}

function getInvCount(item) {
  if (!item) return 0;
  if (item.id === 'rocket') return state.rockets | 0;
  return state.inventory[item.id] | 0;
}

function getBackpackTotalCount() {
  let total = state.rockets | 0;
  if (state.inventory) {
    Object.keys(state.inventory).forEach(k => { total += state.inventory[k] | 0; });
  }
  return total;
}

function getBackpackItemCount(key) {
  if (key === 'rocket') return state.rockets | 0;
  return state.inventory[key] | 0;
}

function refreshBackpackUI() {
  const badge = document.getElementById('backpack-badge');
  const total = getBackpackTotalCount();
  if (badge) {
    badge.style.display = total > 0 ? 'block' : 'none';
  }
  document.querySelectorAll('.bp-use-item').forEach(btn => {
    const key = btn.dataset.bp;
    if (!key) return;
    const n = getBackpackItemCount(key);
    const em = document.getElementById('bp-' + key) || btn.querySelector('em');
    if (em) em.textContent = n;
    btn.disabled = n <= 0;
    btn.style.opacity = n <= 0 ? '0.42' : '1';
  });
}

function openBackpack() {
  refreshBackpackUI();
  document.getElementById('backpack-overlay').classList.add('open');
}

function closeBackpack() {
  document.getElementById('backpack-overlay').classList.remove('open');
}

function refreshItemBarUI() {
  refreshBackpackUI();
}

function useShopMagnetField(quiet) {
  const cx = canvasW() / 2;
  const cy = canvasH() / 2;
  state.bubbles.forEach(o => {
    if (o.popping) return;
    const dx = cx - o.x;
    const dy = cy - o.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    if (dist < Math.max(canvasW(), canvasH())) {
      o.x += dx / dist * Math.min(140, dist * 0.7);
      o.y += dy / dist * Math.min(140, dist * 0.7);
    }
  });
  if (!quiet) showToast('🧲 磁力石发动！', '#90a4ae');
}

function useShopLuckyTicket(opts = {}) {
  const quiet = !!opts.quiet;
  const reward = 200 + Math.floor(Math.random() * 251);
  addCoins(reward, { pop: quiet ? false : undefined });
  if (!quiet) {
    const fake = { x: canvasW() / 2, y: canvasH() / 2, r: 30, color: '#ffd54f' };
    spawnLuckyCoinRain(fake, reward);
  }
}

function useInventoryItem(key, opts = {}) {
  const quiet = !!opts.quiet;
  const n = state.inventory[key] | 0;
  if (n <= 0) return false;
  let ok = true;
  if (key === 'slowclock') {
    if (state.slowTimer) { if (!quiet) showToast('⏰ 慢时还在生效', '#ccc'); return false; }
    triggerClockSlow();
  } else if (key === 'magnet') {
    useShopMagnetField(quiet);
  } else if (key === 'watermelon') {
    if (state.watermelonActive) { if (!quiet) showToast('🍉 已在西瓜模式', '#ccc'); return false; }
    convertAllToWatermelon();
  } else if (key === 'lucky') {
    useShopLuckyTicket({ quiet });
  } else if (key === 'spawner') {
    if (state.speedBoostActive) { if (!quiet) showToast('💨 刷泡加速中', '#ccc'); return false; }
    triggerSpawnSpeedBoost();
  } else if (key === 'coinbag') {
    addCoins(200, { pop: quiet ? false : undefined });
    if (!quiet) showToast('💰 金币袋 +200！', '#ffd54f');
  } else if (key === 'megacoin') {
    addCoins(45000, { pop: quiet ? false : undefined });
    if (!quiet) showToast('💎 万金财箱 +45000 金币！', '#ffd54f');
  } else {
    ok = false;
  }
  if (!ok) return false;
  state.inventory[key] = n - 1;
  saveInventory();
  refreshItemBarUI();
  if (!quiet) refreshShopItems();
  return true;
}

function bindHoldAction(btn, cfg) {
  if (!btn || btn.dataset.holdBound) return;
  btn.dataset.holdBound = '1';
  const repeatMs = cfg.repeatMs ?? 140;
  const holdDelayMs = cfg.holdDelayMs ?? 380;
  let holdTimer = null;
  let holdInterval = null;
  function stopHold() {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    if (holdInterval) { clearInterval(holdInterval); holdInterval = null; }
    if (cfg.onEnd) cfg.onEnd();
  }
  const startHold = e => {
    if (e.button != null && e.button !== 0) return;
    e.preventDefault();
    stopHold();
    if (!cfg.onPress()) return;
    holdTimer = setTimeout(() => {
      holdInterval = setInterval(() => {
        if (!cfg.onRepeat()) stopHold();
      }, repeatMs);
    }, holdDelayMs);
  };
  const endHold = () => stopHold();
  btn.addEventListener('pointerdown', startHold);
  btn.addEventListener('pointerup', endHold);
  btn.addEventListener('pointerleave', endHold);
  btn.addEventListener('pointercancel', endHold);
  btn.addEventListener('click', e => e.preventDefault());
}

const SHOP_CATALOG = [
  {
    id: 'none',
    icon: '🫧',
    name: '普通（默认）',
    desc: '标准按住戳泡，无升级效果。',
    price: 0,
    holdMs: 700,
  },
  {
    id: 'speed1',
    icon: '⚡',
    name: '快手 I',
    desc: '蓄力速度 +10%，约按住 630ms 戳破。',
    price: 200,
    holdMs: 630,
  },
  {
    id: 'speed2',
    icon: '⚡⚡',
    name: '快手 II',
    desc: '蓄力速度 +50%，只需按住约 350ms。',
    price: 500,
    holdMs: 350,
  },
  {
    id: 'speed3',
    icon: '⚡⚡⚡',
    name: '快手 III',
    desc: '蓄力速度 +100%，几乎瞬发，约 80ms。',
    price: 1000,
    holdMs: 80,
  },
  {
    id: 'instant',
    icon: '💥',
    name: '瞬戳',
    desc: '点一下即爆，无需按住。',
    price: 1200,
    holdMs: 0,
  },
  {
    id: 'wavepact',
    icon: '🌊',
    name: '波瓣契约匣',
    desc: '需同时支付 2,000 金币 + 100 波瓣 · 获得 5 火箭 + 30 虹芒 + 50 泡珠',
    price: 0,
    holdMs: null,
    consumable: true,
    tier: 'premium',
    dualCost: { coins: 2000, wavePetals: 100 },
    bundleGrant: { rockets: 5, glowShards: 30, bubblePearls: 50 },
  },
  {
    id: 'megacoin',
    icon: '💎',
    name: '万金财箱',
    desc: '使用后立刻 +45000 金币 · 每日限购 10 个',
    price: 20000,
    holdMs: null,
    consumable: true,
    tier: 'premium',
    dailyLimit: 10,
  },
  {
    id: 'rocket20',
    icon: '🚀',
    name: '火箭箱 ×20',
    desc: '一次获得 20 枚火箭筒 · 比单买省 1600 金币',
    price: 4000,
    holdMs: null,
    consumable: true,
    tier: 'premium',
  },
  {
    id: 'rocket',
    icon: '🚀',
    name: '火箭筒',
    desc: '发射后清空全场所有泡泡！买了进 🎒 背包使用 · 长按可连买',
    price: 280,
    holdMs: null,
    consumable: true,
  },
  {
    id: 'slowclock',
    icon: '⏰',
    name: '慢时沙漏',
    desc: '全场变慢 4 秒，戳泡更轻松。买了在 🎒 背包里点 ⏰ 使用。',
    price: 350,
    holdMs: null,
    consumable: true,
  },
  {
    id: 'magnet',
    icon: '🧲',
    name: '磁力石',
    desc: '把所有泡往中间吸一把，方便连戳。',
    price: 280,
    holdMs: null,
    consumable: true,
  },
  {
    id: 'watermelon',
    icon: '🍉',
    name: '西瓜包',
    desc: '全场变西瓜 10 秒，每个 +25 分。',
    price: 420,
    holdMs: null,
    consumable: true,
  },
  {
    id: 'lucky',
    icon: '🍀',
    name: '幸运券',
    desc: '随机 +200～450 金币，并落金币雨。',
    price: 300,
    holdMs: null,
    consumable: true,
  },
  {
    id: 'spawner',
    icon: '💨',
    name: '刷泡器',
    desc: '5 秒内刷泡速度翻倍。',
    price: 260,
    holdMs: null,
    consumable: true,
  },
  {
    id: 'coinbag',
    icon: '💰',
    name: '金币袋',
    desc: '使用后 +200 金币 · 每日限购 10 个',
    price: 180,
    holdMs: null,
    consumable: true,
    dailyLimit: 10,
  },
  {
    id: 'meettoken',
    icon: '🎋',
    name: '结缘符',
    desc: '泡缘野地邂逅一次 · 去大陆左下「泡缘」使用',
    price: PET_MEET_TOKEN_PRICE,
    holdMs: null,
    consumable: true,
  },
];

// 'none' is always free & available
shop.purchased.add('none');

function getActiveItem() {
  return SHOP_CATALOG.find(i => i.id === shop.activeMode) || SHOP_CATALOG[0];
}

function activateItem(item, opts = {}) {
  shop.activeMode = item.id;
  state.instantPop = (item.id === 'instant');
  saveShop();
  if (!opts.skipRefresh) refreshShopItems();
  if (!opts.quiet) playActivateSound();
}

function getDiscountedPrice(price) {
  return Math.max(0, Math.floor(price * getShopDiscount()));
}

function getShopDualCoinPrice(item) {
  return item.dualCost ? getDiscountedPrice(item.dualCost.coins) : 0;
}

function canAffordShopItem(item) {
  if (item.dualCost) {
    return state.coins >= getShopDualCoinPrice(item)
      && (state.wavePetals | 0) >= item.dualCost.wavePetals;
  }
  if (item.price === 0) return true;
  return state.coins >= getDiscountedPrice(item.price);
}

function applyShopBundleGrant(grant, quiet) {
  if (!grant) return '';
  const parts = [];
  if (grant.rockets) {
    state.rockets = (state.rockets | 0) + grant.rockets;
    saveInventory();
    parts.push(`${grant.rockets}🚀`);
  }
  if (grant.glowShards) {
    addWallet('glowShards', grant.glowShards, { pop: quiet ? false : 'glow' });
    parts.push(`${grant.glowShards}✨`);
  }
  if (grant.bubblePearls) {
    addWallet('bubblePearls', grant.bubblePearls, { pop: quiet ? false : 'pearl' });
    parts.push(`${grant.bubblePearls}🫧`);
  }
  if (grant.coins) {
    addCoins(grant.coins, { pop: quiet ? false : undefined, skipShop: true });
    parts.push(`${grant.coins}🪙`);
  }
  Object.keys(state.inventory).forEach(key => {
    const n = grant[key];
    if (typeof n === 'number' && n > 0) {
      state.inventory[key] = (state.inventory[key] | 0) + n;
      parts.push(`${n}${key}`);
      saveInventory();
    }
  });
  refreshItemBarUI();
  return parts.join(' ');
}

function shopItemPriceHtml(item, owned, hasDiscount) {
  if (item.price === 0 && !item.dualCost) return '免费';
  if (item.dualCost) {
    const coinNeed = getShopDualCoinPrice(item);
    const waveNeed = item.dualCost.wavePetals;
    return `<span style="color:#ffd54f">${formatShopCoins(coinNeed)} 🪙</span> <span style="color:#80deea">+ ${waveNeed} 🌊</span>`;
  }
  const finalPrice = getDiscountedPrice(item.price);
  if (item.consumable) {
    return hasDiscount
      ? `<span style="text-decoration:line-through;color:#888;font-size:10px">${formatShopCoins(item.price)}</span> <span style="color:#ffd54f">${formatShopCoins(finalPrice)} 🪙</span>`
      : `${formatShopCoins(finalPrice)} 🪙`;
  }
  if (owned) return '已拥有 ✓';
  return hasDiscount
    ? `<span style="text-decoration:line-through;color:#888;font-size:10px">${formatShopCoins(item.price)}</span> <span style="color:#ffd54f">${formatShopCoins(finalPrice)} 🪙</span>`
    : `${formatShopCoins(finalPrice)} 🪙`;
}

function buyItem(item, opts = {}) {
  const quiet = !!opts.quiet;
  // Consumable: always buyable, just add to inventory
  if (item.consumable) {
    const finalPrice = getDiscountedPrice(item.price);
    if (getShopDailyLimit(item) && !canBuyShopDailyItem(item)) {
      if (!quiet) showToast(`${item.icon} ${item.name}今日限购 ${getShopDailyLimit(item)} 个，明天再来`, '#ffd54f');
      return false;
    }
    if (item.dualCost) {
      const dc = item.dualCost;
      const coinNeed = getShopDualCoinPrice(item);
      if ((state.wavePetals | 0) < dc.wavePetals) {
        if (!quiet) showToast(`🌊 波瓣不够，还需 ${dc.wavePetals}（现有 ${state.wavePetals | 0}）`, '#ffd54f');
        return false;
      }
      if (!spendCoins(coinNeed, { skipRefresh: !!opts.skipRefresh })) {
        if (!quiet) showToast(`🪙 金币不够，还需 ${formatShopCoins(coinNeed)}`, '#ffd54f');
        return false;
      }
      if (!spendWallet('wavePetals', dc.wavePetals)) {
        addCoins(coinNeed, { pop: false, skipShop: true, skipLevel: true });
        if (!quiet) showToast('🌊 波瓣扣除失败', '#ffd54f');
        return false;
      }
      const got = applyShopBundleGrant(item.bundleGrant, quiet);
      if (!quiet) showToast(`${item.icon} 波瓣契约成交！获得 ${got}`, '#29b6f6');
      refreshLevelUI();
      if (!opts.skipRefresh) refreshShopItems();
      if (!quiet) playBuySound();
      return true;
    }
    if (item.id === 'rocket20') {
      if (!spendCoins(finalPrice, { skipRefresh: !!opts.skipRefresh })) return false;
      state.rockets += 20;
      saveInventory();
      if (!quiet) showToast(`🚀 获得 20 枚火箭筒！现有 ${state.rockets} 枚`, '#ff6b35');
      refreshLevelUI();
      if (!opts.skipRefresh) refreshShopItems();
      if (!quiet) playBuySound();
      return true;
    }
    if (item.id === 'meettoken') {
      if (!spendCoins(finalPrice, { skipRefresh: !!opts.skipRefresh })) {
        if (!quiet) showToast(`🪙 金币不够，结缘符要 ${PET_MEET_TOKEN_PRICE}`, '#ffd54f');
        return false;
      }
      loadBubblePet();
      bubblePet.meetTokens += 1;
      saveBubblePet();
      refreshPetMeetUI();
      if (!quiet) showToast(`🎋 获得结缘符！现有 ${bubblePet.meetTokens} 张`, '#00897b');
      refreshLevelUI();
      if (!opts.skipRefresh) refreshShopItems();
      if (!quiet) playBuySound();
      return true;
    }
    if (!spendCoins(finalPrice, { skipRefresh: !!opts.skipRefresh })) return false;
    if (getShopDailyLimit(item)) recordShopDailyPurchase(item);
    if (item.id === 'rocket') {
      state.rockets += 1;
      saveInventory();
      if (!quiet) showToast(`🚀 获得1枚火箭筒！现有 ${state.rockets} 枚`, '#ff6b35');
    } else {
      state.inventory[item.id] = (state.inventory[item.id] | 0) + 1;
      if (!quiet) showToast(`${item.icon} 获得 ${item.name}！现有 ${state.inventory[item.id]} 个`, '#4fc3f7');
      saveInventory();
      refreshItemBarUI();
    }
    refreshLevelUI();
    if (!opts.skipRefresh) refreshShopItems();
    if (!quiet) playBuySound();
    return true;
  }
  if (shop.purchased.has(item.id)) { activateItem(item); return true; }
  const finalPrice = getDiscountedPrice(item.price);
  if (!spendCoins(finalPrice, { skipRefresh: !!opts.skipRefresh })) return false;
  shop.purchased.add(item.id);
  activateItem(item, { skipRefresh: !!opts.skipRefresh });
  saveShop();
  refreshLevelUI();
  playBuySound();
  return true;
}

function playBuySound() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    [0, 0.1, 0.2].forEach((dt, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 440 * Math.pow(1.25, i);
      g.gain.setValueAtTime(0.22, now + dt);
      g.gain.exponentialRampToValueAtTime(0.001, now + dt + 0.2);
      o.connect(g).connect(ctx.destination);
      o.start(now + dt); o.stop(now + dt + 0.25);
    });
  } catch(e) {}
}

function playActivateSound() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(600, now);
    o.frequency.linearRampToValueAtTime(800, now + 0.1);
    g.gain.setValueAtTime(0.15, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    o.connect(g).connect(ctx.destination);
    o.start(now); o.stop(now + 0.18);
  } catch(e) {}
}

function refreshShopItems() {
  stopShopRocketHold(false);
  const container = document.getElementById('shop-items');
  if (!container) return;
  container.innerHTML = '';
  document.getElementById('shop-coins-display').textContent = (state.coins | 0) + ' 金币';

  // update active bar
  const activeItem = SHOP_CATALOG.find(i => i.id === shop.activeMode);
  const activeName = document.getElementById('shop-active-name');
  if (activeName && activeItem) activeName.textContent = activeItem.icon + ' ' + activeItem.name;

  const disc = getShopDiscount();
  const discPct = Math.round((1 - disc) * 100);

  let premiumHeaderShown = false;
  let consumableHeaderShown = false;
  SHOP_CATALOG.forEach(item => {
    if (item.tier === 'premium' && !premiumHeaderShown) {
      premiumHeaderShown = true;
      const hdr = document.createElement('div');
      hdr.className = 'shop-section-label shop-section-premium';
      hdr.textContent = '💎 至尊专区 · 双货币商品';
      container.appendChild(hdr);
    }
    if (item.consumable && item.tier !== 'premium' && !consumableHeaderShown) {
      consumableHeaderShown = true;
      const hdr = document.createElement('div');
      hdr.className = 'shop-section-label';
      hdr.textContent = '🎒 实用道具 · 侧栏用 · 长按连买';
      container.appendChild(hdr);
    }
    const owned        = shop.purchased.has(item.id);
    const active       = shop.activeMode === item.id;
    const finalPrice   = getDiscountedPrice(item.price);
    const canAfford    = canAffordShopItem(item);
    const hasDiscount  = !owned && !item.dualCost && discPct > 0;

    const el = document.createElement('div');
    el.className = 'shop-item' +
      (item.tier === 'premium' ? ' shop-item-premium' : '') +
      (active          ? ' active-item' : '') +
      (owned && !active ? ' owned'      : '') +
      (canAfford ? ' can-afford' : '');

    let btnClass = '', btnDisabled = false, btnLabel = '';

    if (item.consumable) {
      const dailySoldOut = getShopDailyLimit(item) && !canBuyShopDailyItem(item);
      if (dailySoldOut) {
        btnClass = '';
        btnDisabled = true;
        btnLabel = '今日已满';
      } else if (item.dualCost) {
        const coinNeed = getShopDualCoinPrice(item);
        btnClass = '';
        btnDisabled = !canAfford;
        btnLabel = canAfford
          ? `购买 ${formatShopCoins(coinNeed)}🪙+${item.dualCost.wavePetals}🌊`
          : `${formatShopCoins(coinNeed)}🪙+${item.dualCost.wavePetals}🌊`;
      } else if (canAfford) {
        btnClass = ''; btnDisabled = false; btnLabel = `购买 ${formatShopCoins(finalPrice)} 🪙`;
      } else {
        btnClass = ''; btnDisabled = true; btnLabel = `${formatShopCoins(finalPrice)} 🪙`;
      }
    } else if (active) {
      btnClass = 'active-tag'; btnDisabled = true; btnLabel = '✓ 使用中';
    } else if (owned) {
      btnClass = 'switch-tag'; btnDisabled = false; btnLabel = '⇄ 切换';
    } else if (canAfford) {
      btnClass = ''; btnDisabled = false; btnLabel = `购买 ${formatShopCoins(finalPrice)} 🪙`;
    } else {
      btnClass = ''; btnDisabled = true; btnLabel = `${formatShopCoins(finalPrice)} 🪙`;
    }

    const priceHtml = shopItemPriceHtml(item, owned, hasDiscount);

    const holdBadge = item.dualCost
      ? `<span style="color:#80deea;font-weight:700">需 ${formatShopCoins(item.dualCost.coins)}🪙 + ${item.dualCost.wavePetals}波瓣 · 现有 🌊 ${state.wavePetals | 0}</span>`
      : item.consumable
      ? shopDailyHoldBadgeHtml(item)
      : item.holdMs === 0 ? '瞬发（0 毫秒）' : '按住 ' + item.holdMs + ' 毫秒';

    el.innerHTML = `
      <div class="shop-item-icon">${item.icon}</div>
      <div class="shop-item-info">
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-desc">${item.desc}</div>
        <div class="hold-badge">${holdBadge}</div>
      </div>
      <div class="shop-item-right">
        <div class="shop-price">${priceHtml}</div>
        <button class="shop-buy-btn ${btnClass}" ${btnDisabled ? 'disabled' : ''} data-id="${item.id}">
          ${btnLabel}
        </button>
      </div>
    `;
    container.appendChild(el);
  });

  // attach click / long-press handlers
  function updateConsumableBuyBtn(btn, item) {
    if (!item || !btn) return;
    const finalPrice = getDiscountedPrice(item.price);
    const canAfford = canAffordShopItem(item);
    const dailyOk = canBuyShopDailyItem(item);
    const canBuy = canAfford && dailyOk;
    btn.disabled = !canBuy;
    if (item.dualCost) {
      const coinNeed = getShopDualCoinPrice(item);
      btn.textContent = canBuy
        ? `购买 ${formatShopCoins(coinNeed)}🪙+${item.dualCost.wavePetals}🌊`
        : `${formatShopCoins(coinNeed)}🪙+${item.dualCost.wavePetals}🌊`;
    } else {
      btn.textContent = !dailyOk && getShopDailyLimit(item)
        ? '今日已满'
        : canAfford ? `购买 ${formatShopCoins(finalPrice)} 🪙` : `${formatShopCoins(finalPrice)} 🪙`;
    }
    const row = btn.closest('.shop-item');
    if (row) {
      const badge = row.querySelector('.hold-badge');
      if (badge) {
        if (item.dualCost) {
          badge.innerHTML = `<span style="color:#80deea;font-weight:700">需 ${formatShopCoins(item.dualCost.coins)}🪙 + ${item.dualCost.wavePetals}波瓣 · 现有 🌊 ${state.wavePetals | 0}</span>`;
        } else {
          badge.innerHTML = shopDailyHoldBadgeHtml(item);
        }
      }
      const priceEl = row.querySelector('.shop-price');
      if (priceEl) {
        const disc = getShopDiscount();
        const hasDiscount = disc < 1 && !item.dualCost;
        if (item.dualCost) {
          const coinNeed = getShopDualCoinPrice(item);
          priceEl.innerHTML = `<span style="color:#ffd54f">${formatShopCoins(coinNeed)} 🪙</span> <span style="color:#80deea">+ ${item.dualCost.wavePetals} 🌊</span>`;
        } else {
          priceEl.innerHTML = hasDiscount
            ? `<span style="text-decoration:line-through;color:#888;font-size:10px">${formatShopCoins(item.price)}</span> <span style="color:#ffd54f">${formatShopCoins(finalPrice)} 🪙</span>`
            : `${formatShopCoins(finalPrice)} 🪙`;
        }
      }
      row.classList.toggle('can-afford', canAfford);
    }
    const stat = document.getElementById('stat-coins');
    const shopCoins = document.getElementById('shop-coins-display');
    if (stat) stat.textContent = state.coins | 0;
    if (shopCoins) shopCoins.textContent = (state.coins | 0) + ' 金币';
    refreshItemBarUI();
    refreshLevelUI();
  }

  container.querySelectorAll('.shop-buy-btn:not([disabled])').forEach(btn => {
    const item = SHOP_CATALOG.find(i => i.id === btn.dataset.id);
    if (!item) return;

    if (item.consumable) {
      bindHoldAction(btn, {
        repeatMs: 140,
        holdDelayMs: 380,
        onPress: () => {
          stopShopRocketHold(false);
          shopRocketHoldBtn = btn;
          shopRocketHoldActive = false;
          const ok = buyItem(item, { quiet: false, skipRefresh: true });
          if (ok) updateConsumableBuyBtn(btn, item);
          return ok;
        },
        onRepeat: () => {
          if (shopRocketHoldBtn !== btn) return false;
          shopRocketHoldActive = true;
          const ok = buyItem(item, { quiet: true, skipRefresh: true });
          updateConsumableBuyBtn(btn, item);
          if (!ok) {
            stopShopRocketHold(true);
            showToast('🪙 金币不够了', '#ffd54f');
          }
          return ok;
        },
        onEnd: () => {
          if (shopRocketHoldBtn !== btn) return;
          stopShopRocketHold(false);
          refreshShopItems();
        },
      });
    } else {
      btn.addEventListener('click', () => buyItem(item));
    }
  });
}

// ── Playmode: neat grid, hold + drag to pop only bubbles under cursor ──
const playmode = {
  drawing: false,
  bubbles: [],
  cols: 8,
  rows: 10,
  colors: ['#4fc3f7','#81c784','#ffb74d','#f48fb1','#ce93d8','#80cbc4','#fff176','#90caf9'],
};

function openPlaymode() {
  document.getElementById('shop-overlay').classList.remove('open');
  document.getElementById('playmode-overlay').classList.add('open');
  requestAnimationFrame(() => buildPlaymodeBoard());
}

function closePlaymode() {
  playmode.drawing = false;
  document.getElementById('playmode-overlay').classList.remove('open');
}

function buildPlaymodeBoard() {
  const board = document.getElementById('playmode-board');
  board.innerHTML = '';
  playmode.bubbles = [];

  const W = board.clientWidth;
  const H = board.clientHeight;
  const cols = playmode.cols;
  const rows = playmode.rows;
  const padX = 16;
  const padY = 16;
  const gap = 6;
  const cellW = (W - padX * 2 - gap * (cols - 1)) / cols;
  const cellH = (H - padY * 2 - gap * (rows - 1)) / rows;
  const size = Math.min(cellW, cellH) * 0.92;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const el = document.createElement('div');
      el.className = 'pm-bubble';
      const left = padX + c * (cellW + gap) + (cellW - size) / 2;
      const top  = padY + r * (cellH + gap) + (cellH - size) / 2;
      const color = playmode.colors[(r + c) % playmode.colors.length];
      el.style.cssText = `left:${left}px;top:${top}px;width:${size}px;height:${size}px;background:${color};`;
      board.appendChild(el);
      playmode.bubbles.push({
        el,
        cx: left + size / 2,
        cy: top + size / 2,
        r: size / 2,
        popped: false,
      });
    }
  }
}

function playmodePopAt(x, y) {
  for (const b of playmode.bubbles) {
    if (b.popped) continue;
    const dx = x - b.cx, dy = y - b.cy;
    if (dx * dx + dy * dy <= b.r * b.r * 1.15) {
      b.popped = true;
      b.el.classList.add('popping');
      setTimeout(() => b.el.remove(), 200);
      // soft pop click (reuse if available)
      try { typeof playPop === 'function' && playPop(false); } catch (_) {}
      break; // only the one under finger, not a whole row
    }
  }
}

function playmodeLocalXY(e, board) {
  const rect = board.getBoundingClientRect();
  const src = e.touches && e.touches[0] ? e.touches[0] : e;
  return { x: src.clientX - rect.left, y: src.clientY - rect.top };
}

(() => {
  const board = document.getElementById('playmode-board');
  const onDown = e => {
    e.preventDefault();
    playmode.drawing = true;
    const { x, y } = playmodeLocalXY(e, board);
    playmodePopAt(x, y);
  };
  const onMove = e => {
    if (!playmode.drawing) return;
    e.preventDefault();
    const { x, y } = playmodeLocalXY(e, board);
    playmodePopAt(x, y);
  };
  const onUp = () => { playmode.drawing = false; };

  board.addEventListener('mousedown', onDown);
  board.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  board.addEventListener('touchstart', onDown, { passive: false });
  board.addEventListener('touchmove', onMove, { passive: false });
  board.addEventListener('touchend', onUp);
  board.addEventListener('touchcancel', onUp);

  document.getElementById('btn-playmode').addEventListener('click', e => {
    e.stopPropagation();
    openPlaymode();
  });
  document.getElementById('btn-fishing').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    document.getElementById('fishing-overlay').classList.add('open');
    initFishingScene();
  });
  document.getElementById('btn-beach').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openBeachScene();
  });
  document.getElementById('btn-tank').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openTankScene();
  });
  document.getElementById('btn-blow').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openBlowScene();
  });
  document.getElementById('btn-pond').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openPondScene();
  });
  document.getElementById('btn-shoot').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openShootScene();
  });
  document.getElementById('btn-match').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openMatchScene();
  });
  document.getElementById('btn-boat').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openBoatScene();
  });
  document.getElementById('btn-ice').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openIceScene();
  });
  document.getElementById('btn-tower').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openTowerScene();
  });
  document.getElementById('btn-catch').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openCatchScene();
  });
  document.getElementById('btn-rainbow').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openRainbowScene();
  });
  document.getElementById('btn-maze').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openMazeScene();
  });
  document.getElementById('btn-guard').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openGuardScene();
  });
  document.getElementById('btn-bath').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openBathScene();
  });
  document.getElementById('btn-shadow').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openShadowScene();
  });
  document.getElementById('btn-chain').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openChainScene();
  });
  document.getElementById('btn-workshop').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openWorkshopScene();
  });
  document.getElementById('btn-keepup').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openKeepupScene();
  });
  document.getElementById('btn-merge').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openMergeScene();
  });
  document.getElementById('btn-floatpop').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openFloatpopScene();
  });
  document.getElementById('btn-goal').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openGoalScene();
  });
  document.getElementById('btn-split').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openSplitScene();
  });
  document.getElementById('btn-simon').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openSimonScene();
  });
  document.getElementById('btn-wipe').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openWipeScene();
  });
  document.getElementById('btn-pinball').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openPinballScene();
  });
  document.getElementById('btn-scale').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openScaleScene();
  });
  document.getElementById('btn-bfish').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openBfishScene();
  });
  document.getElementById('btn-jumprope').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openJumpropeScene();
  });
  document.getElementById('btn-colortap').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openColortapScene();
  });
  document.getElementById('btn-rush30').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openRush30Scene();
  });
  document.getElementById('btn-balance').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openBalanceScene();
  });
  document.getElementById('btn-bigpick').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openBigpickScene();
  });
  document.getElementById('btn-oddone').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openOddoneScene();
  });
  document.getElementById('btn-countpop').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openCountpopScene();
  });
  document.getElementById('btn-inflate').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('shop-overlay').classList.remove('open');
    openInflateScene();
  });
  document.getElementById('beach-close').addEventListener('click', () => {
    closeBeachScene();
  });
  document.getElementById('tank-close').addEventListener('click', () => {
    closeTankScene();
  });
  document.getElementById('tank-feed-btn').addEventListener('click', () => {
    feedTankFish();
  });
  document.getElementById('blow-close').addEventListener('click', () => {
    closeBlowScene();
  });
  document.getElementById('pond-close').addEventListener('click', () => {
    closePondScene();
  });
  document.getElementById('shoot-close').addEventListener('click', () => {
    closeShootScene();
  });
  document.getElementById('match-close').addEventListener('click', closeMatchScene);
  document.getElementById('match-refresh').addEventListener('click', buildMatchBoard);
  document.getElementById('boat-close').addEventListener('click', closeBoatScene);
  document.getElementById('ice-close').addEventListener('click', closeIceScene);
  document.getElementById('ice-refresh').addEventListener('click', buildIceBoard);
  document.getElementById('tower-close').addEventListener('click', closeTowerScene);
  document.getElementById('tower-refresh').addEventListener('click', resetTowerScene);
  document.getElementById('catch-close').addEventListener('click', closeCatchScene);
  document.getElementById('catch-refresh').addEventListener('click', resetCatchScene);
  document.getElementById('rainbow-close').addEventListener('click', closeRainbowScene);
  document.getElementById('maze-close').addEventListener('click', closeMazeScene);
  document.getElementById('maze-refresh').addEventListener('click', buildMazeBoard);
  document.getElementById('guard-close').addEventListener('click', closeGuardScene);
  document.getElementById('guard-refresh').addEventListener('click', resetGuardScene);
  document.getElementById('guard-again').addEventListener('click', resetGuardScene);
  document.getElementById('bath-close').addEventListener('click', closeBathScene);
  document.getElementById('bath-refresh').addEventListener('click', resetBathScene);
  document.getElementById('shadow-close').addEventListener('click', closeShadowScene);
  document.getElementById('shadow-refresh').addEventListener('click', resetShadowScene);
  document.getElementById('chain-close').addEventListener('click', closeChainScene);
  document.getElementById('chain-refresh').addEventListener('click', () => {
    chainScene.score = 0;
    buildChainBoard();
  });
  document.getElementById('workshop-close').addEventListener('click', closeWorkshopScene);
  document.getElementById('workshop-refresh').addEventListener('click', newWorkshopOrder);
  document.getElementById('workshop-make').addEventListener('click', submitWorkshop);
  document.getElementById('keepup-close').addEventListener('click', closeKeepupScene);
  document.getElementById('keepup-refresh').addEventListener('click', resetKeepupScene);
  document.getElementById('merge-close').addEventListener('click', closeMergeScene);
  document.getElementById('merge-refresh').addEventListener('click', resetMergeScene);
  document.getElementById('floatpop-close').addEventListener('click', closeFloatpopScene);
  document.getElementById('floatpop-refresh').addEventListener('click', resetFloatpopScene);
  document.getElementById('goal-close').addEventListener('click', closeGoalScene);
  document.getElementById('goal-refresh').addEventListener('click', resetGoalScene);
  document.getElementById('split-close').addEventListener('click', closeSplitScene);
  document.getElementById('split-refresh').addEventListener('click', resetSplitScene);
  document.getElementById('simon-close').addEventListener('click', closeSimonScene);
  document.getElementById('simon-refresh').addEventListener('click', resetSimonScene);
  document.getElementById('wipe-close').addEventListener('click', closeWipeScene);
  document.getElementById('wipe-refresh').addEventListener('click', resetWipeScene);
  document.getElementById('pinball-close').addEventListener('click', closePinballScene);
  document.getElementById('pinball-refresh').addEventListener('click', resetPinballScene);
  document.getElementById('scale-close').addEventListener('click', closeScaleScene);
  document.getElementById('scale-refresh').addEventListener('click', resetScaleScene);
  document.getElementById('scale-check').addEventListener('click', checkScaleWeight);
  document.getElementById('bfish-close').addEventListener('click', closeBfishScene);
  document.getElementById('bfish-refresh').addEventListener('click', resetBfishScene);
  document.getElementById('bfish-cast').addEventListener('click', castBfishHook);
  document.getElementById('jumprope-close').addEventListener('click', closeJumpropeScene);
  document.getElementById('jumprope-refresh').addEventListener('click', resetJumpropeScene);
  document.getElementById('colortap-close').addEventListener('click', closeColortapScene);
  document.getElementById('colortap-refresh').addEventListener('click', resetColortapScene);
  document.getElementById('rush30-close').addEventListener('click', closeRush30Scene);
  document.getElementById('rush30-refresh').addEventListener('click', resetRush30Scene);
  document.getElementById('balance-close').addEventListener('click', closeBalanceScene);
  document.getElementById('paodou-close').addEventListener('click', closePaodouScene);
  document.getElementById('balance-refresh').addEventListener('click', resetBalanceScene);
  document.getElementById('bigpick-close').addEventListener('click', closeBigpickScene);
  document.getElementById('bigpick-refresh').addEventListener('click', resetBigpickScene);
  document.getElementById('oddone-close').addEventListener('click', closeOddoneScene);
  document.getElementById('oddone-refresh').addEventListener('click', resetOddoneScene);
  document.getElementById('countpop-close').addEventListener('click', closeCountpopScene);
  document.getElementById('countpop-refresh').addEventListener('click', resetCountpopScene);
  document.getElementById('inflate-close').addEventListener('click', closeInflateScene);
  document.getElementById('inflate-refresh').addEventListener('click', resetInflateScene);
  bindBlowControls();
  bindPondControls();
  bindShootControls();
  bindBoatControls();
  bindTowerControls();
  bindCatchControls();
  bindRainbowControls();
  bindMazeControls();
  bindGuardControls();
  bindBathControls();
  bindKeepupControls();
  bindFloatpopControls();
  bindGoalControls();
  bindWipeControls();
  bindPinballControls();
  bindScaleControls();
  bindBfishControls();
  bindJumpropeControls();
  bindBalanceControls();
  bindInflateControls();
  document.getElementById('fishing-close').addEventListener('click', () => {
    document.getElementById('fishing-overlay').classList.remove('open');
    toggleFishCatalog(false);
    toggleFishingGear(false);
    toggleFishingCoinModal(false);
    stopFishingScene();
  });
  document.getElementById('fishing-overlay').addEventListener('click', handleFishingOverlayClick);
  document.getElementById('fishing-side-dismiss')?.addEventListener('click', closeFishingSidePanels);
  document.getElementById('fishing-topbar')?.addEventListener('click', e => {
    if (!isFishingSidePanelOpen()) return;
    if (e.target.closest('button')) return;
    closeFishingSidePanels();
  });
  document.getElementById('fishing-catalog-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleFishCatalog();
  });
  document.getElementById('fishing-gear-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleFishingGear();
  });
  document.getElementById('fishing-coin-badge').addEventListener('click', e => {
    e.stopPropagation();
    toggleFishingCoinModal(true);
  });
  document.getElementById('fishing-coin-modal-close').addEventListener('click', () => {
    toggleFishingCoinModal(false);
  });
  document.getElementById('fishing-coin-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('fishing-coin-modal')) toggleFishingCoinModal(false);
  });
  document.getElementById('fishing-cast-btn').addEventListener('click', () => {
    castFishingLine();
  });
  document.getElementById('playmode-refresh').addEventListener('click', () => {
    playmode.drawing = false;
    buildPlaymodeBoard();
  });
  document.getElementById('playmode-close').addEventListener('click', closePlaymode);
  window.addEventListener('resize', () => {
    if (document.getElementById('playmode-overlay').classList.contains('open')) {
      buildPlaymodeBoard();
    }
  });
})();

// ── Beachcomb mini scene（赶海挖沙）────────────────────────────────
const BEACH_FLAT_FINDS = [
  { emoji: '🐚', name: '小贝壳', weight: 28 },
  { emoji: '🦴', name: '小骨头', weight: 18 },
  { emoji: '🫙', name: '小瓶子', weight: 16 },
  { emoji: null, name: '什么都没有', weight: 38 },
];
const beachScene = { digging: false };

function rollWeighted(list) {
  const total = list.reduce((s, f) => s + f.weight, 0);
  let r = Math.random() * total;
  for (const f of list) {
    r -= f.weight;
    if (r <= 0) return f;
  }
  return list[list.length - 1];
}

function openBeachScene() {
  document.getElementById('beach-overlay').classList.add('open');
  buildBeachDecor();
}

function closeBeachScene() {
  document.getElementById('beach-overlay').classList.remove('open');
  beachScene.digging = false;
}

// ── Deep Rainforest 深山雨林 ───────────────────────────────────────
const RF_STORAGE = 'bubbleRelief_rainforest_v1';
const RF_PEARL_META = {
  mist:     { label: '雾珠', emoji: '🫧' },
  fern:     { label: '叶珠', emoji: '🌿' },
  mushroom: { label: '菇珠', emoji: '🍄' },
  hollow:   { label: '光珠', emoji: '💫' },
  firefly:  { label: '萤珠', emoji: '✨' },
};

const rainforest = {
  pearls: { mist: 0, fern: 0, mushroom: 0, hollow: 0, firefly: 0 },
  total: 0,
  visited: false,
};

let rfAmbient = null;
let rfCricketTimer = null;
let rfIdleTimer = null;
let rfDripTimer = null;

function loadRainforest() {
  try {
    const raw = localStorage.getItem(RF_STORAGE);
    if (raw) {
      const d = JSON.parse(raw);
      if (d.pearls) Object.assign(rainforest.pearls, d.pearls);
      rainforest.total = d.total || 0;
      rainforest.visited = !!d.visited;
    }
  } catch (e) {}
}

function saveRainforest() {
  try {
    localStorage.setItem(RF_STORAGE, JSON.stringify({
      pearls: rainforest.pearls,
      total: rainforest.total,
      visited: rainforest.visited,
    }));
  } catch (e) {}
}

function refreshRainforestUI() {
  const bar = document.getElementById('rainforest-collect-bar');
  if (!bar) return;
  const parts = Object.entries(RF_PEARL_META)
    .filter(([k]) => rainforest.pearls[k] > 0)
    .map(([k, m]) => `${m.emoji}${rainforest.pearls[k]}`);
  bar.textContent = parts.length
    ? `泡珠 ${rainforest.total} · ${parts.join(' ')}`
    : `泡珠 · ${rainforest.total}`;
  const btn = document.getElementById('btn-rainforest-zone');
  if (btn) btn.classList.toggle('visited', rainforest.visited);
}

function playRfAmbientRain() {
  try {
    const ctx = getAudioCtx();
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 2.8;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.value = 0.035;
    src.connect(flt).connect(g).connect(ctx.destination);
    src.start();
    rfAmbient = { src, g };
  } catch (e) {}
}

function playRfCricket() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.07;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(4200 + i * 80, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.025, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.1);
    }
  } catch (e) {}
}

function playRfDrip() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(880, now);
    o.frequency.exponentialRampToValueAtTime(520, now + 0.12);
    g.gain.setValueAtTime(0.04, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    o.connect(g).connect(ctx.destination);
    o.start(now);
    o.stop(now + 0.2);
  } catch (e) {}
}

function playRfItemSound(type) {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const freqs = {
      mist: [520, 780],
      fern: [340, 480],
      mushroom: [280, 360, 440],
      hollow: [620, 980, 1240],
      firefly: [880, 1100, 1320],
    }[type] || [500, 700];
    freqs.forEach((f, i) => {
      const t = now + i * 0.05;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.07, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.4);
    });
  } catch (e) {}
}

function startRainforestAmbient() {
  stopRainforestAmbient();
  playRfAmbientRain();
  rfCricketTimer = setInterval(playRfCricket, 3500 + Math.random() * 4500);
  rfDripTimer = setInterval(playRfDrip, 2200 + Math.random() * 3000);
  rfIdleTimer = setInterval(spawnRainforestIdleFloat, 4500 + Math.random() * 3500);
}

function stopRainforestAmbient() {
  if (rfCricketTimer) { clearInterval(rfCricketTimer); rfCricketTimer = null; }
  if (rfDripTimer) { clearInterval(rfDripTimer); rfDripTimer = null; }
  if (rfIdleTimer) { clearInterval(rfIdleTimer); rfIdleTimer = null; }
  if (rfAmbient) {
    try { rfAmbient.src.stop(); } catch (e) {}
    rfAmbient = null;
  }
}

function spawnRainforestIdleFloat() {
  const stage = document.getElementById('rainforest-stage');
  if (!stage || !document.getElementById('rainforest-overlay').classList.contains('open')) return;
  const el = document.createElement('div');
  el.className = 'rf-float';
  el.textContent = ['✨', '🫧', '💧', '🌿'][Math.floor(Math.random() * 4)];
  el.style.left = (8 + Math.random() * 84) + '%';
  el.style.top = (20 + Math.random() * 55) + '%';
  stage.appendChild(el);
  setTimeout(() => el.remove(), 3600);
}

function buildRfSprucePaths(pal, hollow, seed = 0) {
  let r = seed + 0.31;
  const n = () => { r += 1.417; return Math.abs(Math.sin(r * 127.1) * 43758.5453) % 1; };
  const lean = (n() - 0.5) * 2.4;
  const tiers = 4 + Math.floor(n() * 2);
  const trunkH = 10 + n() * 4;
  const baseW = 19 + n() * 4;
  let y = 0;
  let parts = `<rect x="${(lean - 2.2).toFixed(1)}" y="0" width="4.4" height="${trunkH.toFixed(1)}" rx="1" fill="${pal.trunk}"/>`;
  y = -trunkH * 0.35;
  for (let i = 0; i < tiers; i++) {
    const w = Math.max(5, baseW - i * 3.2 + (n() - 0.5) * 2.5);
    const h = 13.5 - i * 0.9 + n() * 1.5;
    const cx = lean + (n() - 0.5) * 1.6;
    const col = pal.tiers[Math.min(i, pal.tiers.length - 1)];
    parts += `<path d="M${(cx - w).toFixed(1)} ${y.toFixed(1)} L${(cx + w).toFixed(1)} ${y.toFixed(1)} L${cx.toFixed(1)} ${(y - h).toFixed(1)} Z" fill="${col}"/>`;
    if (i === 1 && pal.hi) {
      parts += `<path d="M${(cx - w * 0.55).toFixed(1)} ${(y - h * 0.35).toFixed(1)} L${(cx + w * 0.15).toFixed(1)} ${(y - h * 0.55).toFixed(1)} L${(cx - w * 0.1).toFixed(1)} ${(y - h * 0.72).toFixed(1)} Z" fill="${pal.hi}" opacity="0.35"/>`;
    }
    y -= h * 0.68;
  }
  if (hollow) {
    parts += `<ellipse cx="${lean.toFixed(1)}" cy="${(trunkH * 0.42).toFixed(1)}" rx="3.8" ry="4.8" fill="#0a1008" opacity="0.88"/>`;
  }
  return parts;
}

function buildRfSpruceSvg({ depth, hollow, seed = 0 }) {
  const palettes = {
    back:  { trunk: '#6a7870', tiers: ['#9ab4a4', '#8aa698', '#7a9688'], hi: '#b0c8b8' },
    mid:   { trunk: '#4a4438', tiers: ['#5a8068', '#4d725a', '#40644e'], hi: '#6a9478' },
    front: { trunk: '#453828', tiers: ['#3f6648', '#35563c', '#2c4832'], hi: '#4d7858' },
  };
  const pal = palettes[depth] || palettes.mid;
  return `<svg class="rf-tree-svg" viewBox="-28 -92 56 92" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${buildRfSprucePaths(pal, hollow, seed)}</svg>`;
}

function buildRfGround() {
  const ground = document.getElementById('rf-ground');
  if (!ground) return;
  const rocks = [
    [70, 52, 22, 14, 0], [180, 48, 16, 11, 12], [310, 55, 28, 16, -8],
    [430, 50, 18, 12, 6], [560, 58, 24, 14, -5], [690, 47, 20, 13, 10],
    [820, 54, 26, 15, -6], [910, 49, 14, 10, 4], [250, 62, 12, 9, 0],
    [480, 64, 15, 10, -10], [740, 63, 13, 9, 8],
  ];
  const rockSvg = rocks.map(([cx, cy, rx, ry, rot]) =>
    `<g transform="translate(${cx} ${cy}) rotate(${rot})">
      <ellipse rx="${rx}" ry="${ry}" fill="#3a4540" opacity="0.92"/>
      <ellipse rx="${rx * 0.55}" ry="${ry * 0.45}" cx="${-rx * 0.2}" cy="${-ry * 0.25}" fill="#525a54" opacity="0.55"/>
      <ellipse rx="${rx * 0.3}" ry="${ry * 0.25}" cx="${rx * 0.25}" cy="${ry * 0.1}" fill="#2a322e" opacity="0.4"/>
    </g>`
  ).join('');
  ground.innerHTML = `
    <svg viewBox="0 0 1000 130" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="rfGndA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1a3828"/>
          <stop offset="40%" stop-color="#152e22"/>
          <stop offset="100%" stop-color="#0a1812"/>
        </linearGradient>
        <linearGradient id="rfGndB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e4030" stop-opacity="0"/>
          <stop offset="35%" stop-color="#183428" stop-opacity="0.45"/>
          <stop offset="100%" stop-color="#0e2016" stop-opacity="0.7"/>
        </linearGradient>
      </defs>
      <path d="M0 130 L0 72 C60 58 120 78 190 62 S340 48 470 68 S620 52 760 64 S900 54 1000 70 L1000 130 Z" fill="url(#rfGndB)"/>
      <path d="M0 130 L0 58 Q90 42 170 56 T340 44 T510 62 T680 48 T850 58 T1000 52 L1000 130 Z" fill="url(#rfGndA)"/>
      <path d="M0 58 Q90 42 170 56 T340 44 T510 62 T680 48 T850 58 T1000 52" fill="none" stroke="rgba(160,200,175,0.08)" stroke-width="2"/>
      ${rockSvg}
    </svg>`;
}

function rfSpruceRow(cfg) {
  const { start, end, step, depth, baseLeft = 0 } = cfg;
  const rows = [];
  let i = 0;
  for (let left = start; left <= end; left += step) {
    const t = i++;
    rows.push({
      left: baseLeft + left,
      scale: cfg.scale + Math.sin(left * 0.21) * cfg.scaleVar,
      heightVh: cfg.heightVh + (t % 4) * cfg.heightStep,
      bottomPct: cfg.bottom + Math.sin(left * 0.17) * cfg.bottomVar,
      swayDelay: -(left * 0.13 + t * 0.4),
      depth,
      vine: cfg.vine && t % 3 === 0,
      hollow: cfg.hollow && t === 0,
    });
  }
  return rows;
}

function buildRfRidgeHills() {
  const mount = document.querySelector('.rf-mountains');
  if (!mount) return;
  mount.innerHTML = `
    <svg class="rf-ridge-svg rf-ridge-back" viewBox="0 0 1000 240" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="rfRidgeBack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1a3828" stop-opacity="0"/>
          <stop offset="55%" stop-color="#183428" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#122820" stop-opacity="0.55"/>
        </linearGradient>
      </defs>
      <path d="M0 240 C140 150 260 190 400 130 S640 110 820 160 S940 120 1000 170 L1000 240 Z" fill="url(#rfRidgeBack)"/>
    </svg>
    <svg class="rf-ridge-svg rf-ridge-mid" viewBox="0 0 1000 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="rfRidgeMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e4030" stop-opacity="0"/>
          <stop offset="50%" stop-color="#1a3828" stop-opacity="0.42"/>
          <stop offset="100%" stop-color="#142e22" stop-opacity="0.62"/>
        </linearGradient>
      </defs>
      <path d="M0 200 C120 120 280 150 420 95 S660 80 820 125 S940 90 1000 130 L1000 200 Z" fill="url(#rfRidgeMid)"/>
    </svg>`;
}

function buildRfTreeSvg({ depth, hollow, seed = 0 }) {
  return buildRfSpruceSvg({ depth, hollow, seed });
}

function createRfFernSvg() {
  return `<svg viewBox="0 0 60 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M30 42 L30 18" stroke="#3d5c34" stroke-width="1.2" fill="none"/>
    <path d="M30 32 Q18 28 12 22" stroke="#4a7345" stroke-width="1" fill="none"/>
    <path d="M30 28 Q42 24 48 18" stroke="#4a7345" stroke-width="1" fill="none"/>
    <path d="M30 24 Q16 18 10 12" stroke="#5a8550" stroke-width="0.9" fill="none"/>
    <path d="M30 20 Q44 14 50 8" stroke="#5a8550" stroke-width="0.9" fill="none"/>
    <path d="M30 16 Q20 10 14 4" stroke="#6a9560" stroke-width="0.8" fill="none"/>
    <path d="M30 14 Q40 8 46 2" stroke="#6a9560" stroke-width="0.8" fill="none"/>
    <ellipse cx="30" cy="40" rx="14" ry="3" fill="rgba(0,0,0,0.15)"/>
  </svg>`;
}

function createRfTree(opts) {
  const {
    left, scale = 1, heightVh = 24, bottomPct = 0,
    depth = 'mid', swayDelay = 0, hollow = false, vine = false,
  } = opts;
  const seed = (left || 0) * 1.37 + heightVh * 0.19 + bottomPct * 0.07;

  const tree = document.createElement('div');
  tree.className = `rf-tree rf-tree-${depth}-tree`;
  tree.style.left = left + '%';
  tree.style.bottom = bottomPct + '%';
  tree.style.transform = `scale(${scale})`;

  const inner = document.createElement('div');
  inner.className = 'rf-tree-inner';
  inner.style.animationDelay = swayDelay + 's';

  const wrap = document.createElement('div');
  wrap.innerHTML = buildRfSpruceSvg({ depth, hollow, seed });
  const svg = wrap.firstElementChild;
  svg.style.height = heightVh + 'vh';
  inner.appendChild(svg);
  tree.appendChild(inner);

  if (vine) {
    const v = document.createElement('div');
    v.className = 'rf-vine';
    v.style.left = '48%';
    v.style.height = (heightVh * 0.55) + 'vh';
    v.style.animationDelay = (swayDelay - 0.8) + 's';
    tree.appendChild(v);
  }
  return tree;
}

function buildRainforestTrees() {
  const back = document.getElementById('rf-trees-back');
  const mid = document.getElementById('rf-trees-mid');
  const front = document.getElementById('rf-trees-front');
  const under = document.getElementById('rf-undergrowth');
  if (!back || !mid || !front) return;
  buildRfRidgeHills();
  buildRfGround();
  back.innerHTML = '';
  mid.innerHTML = '';
  front.innerHTML = '';
  if (under) under.innerHTML = '';

  /* 远景云杉 · 远高：落点更高、树更高 */
  rfSpruceRow({
    start: -3, end: 99, step: 6.5, depth: 'back',
    scale: 0.82, scaleVar: 0.08,
    heightVh: 40, heightStep: 2.5,
    bottom: 26, bottomVar: 3.5,
    vine: false, hollow: false,
  }).forEach(t => back.appendChild(createRfTree(t)));

  /* 中景云杉 */
  rfSpruceRow({
    start: 1, end: 95, step: 8.5, depth: 'mid',
    scale: 1.02, scaleVar: 0.1,
    heightVh: 48, heightStep: 2,
    bottom: 12, bottomVar: 2.5,
    vine: true, hollow: false,
  }).forEach(t => mid.appendChild(createRfTree(t)));

  /* 近景云杉 · 近低：贴地、更高大 */
  [
    { left: -4, scale: 1.22, heightVh: 54, bottomPct: 0, swayDelay: -0.4, hollow: true, vine: true },
    { left: 8,  scale: 1.15, heightVh: 50, bottomPct: 1.5, swayDelay: -1.1, vine: true },
    { left: 22, scale: 1.08, heightVh: 46, bottomPct: 2.5, swayDelay: -2.3 },
    { left: 68, scale: 1.12, heightVh: 48, bottomPct: 1, swayDelay: -1.6, vine: true },
    { left: 80, scale: 1.2,  heightVh: 52, bottomPct: 0.5, swayDelay: -0.8, vine: true },
    { left: 92, scale: 1.05, heightVh: 44, bottomPct: 3, swayDelay: -2.9 },
  ].forEach(t => front.appendChild(createRfTree({ ...t, depth: 'front' })));

  if (under) {
    [2, 10, 18, 26, 34, 42, 50, 58, 66, 74, 82, 90, 96].forEach((left, i) => {
      const f = document.createElement('div');
      f.className = 'rf-fern-clump';
      f.style.left = left + '%';
      f.style.bottom = (i % 2 === 0 ? 0 : 4) + 'px';
      f.style.transform = `scale(${0.9 + (i % 4) * 0.12})`;
      f.innerHTML = createRfFernSvg();
      under.appendChild(f);
    });
  }
}

function spawnRfCollectPop(btn, meta) {
  const stage = document.getElementById('rainforest-stage');
  if (!stage || !btn) return;
  const r = btn.getBoundingClientRect();
  const sr = stage.getBoundingClientRect();
  const pop = document.createElement('div');
  pop.className = 'rf-collect-pop';
  pop.textContent = `+1 ${meta.emoji}${meta.label}`;
  pop.style.left = (r.left - sr.left + r.width / 2 - 20) + 'px';
  pop.style.top = (r.top - sr.top - 8) + 'px';
  stage.appendChild(pop);
  setTimeout(() => pop.remove(), 1100);
}

function onRainforestItemClick(type, btn) {
  const meta = RF_PEARL_META[type];
  if (!meta) return;
  btn.classList.remove('pop');
  void btn.offsetWidth;
  btn.classList.add('pop');
  playRfItemSound(type);
  rainforest.pearls[type] = (rainforest.pearls[type] || 0) + 1;
  rainforest.total += 1;
  saveRainforest();
  refreshRainforestUI();
  checkAchievements();
  spawnRfCollectPop(btn, meta);
}

function openRainforestScene() {
  loadRainforest();
  rainforest.visited = true;
  saveRainforest();
  refreshRainforestUI();
  buildRainforestTrees();
  const overlay = document.getElementById('rainforest-overlay');
  document.getElementById('continent-overlay')?.classList.add('rf-hidden-during-rainforest');
  overlay.classList.remove('closing');
  overlay.classList.add('open', 'entering');
  startRainforestAmbient();
  spawnRainforestIdleFloat();
  setTimeout(() => overlay.classList.remove('entering'), 950);
}

function closeRainforestScene() {
  const overlay = document.getElementById('rainforest-overlay');
  if (!overlay.classList.contains('open')) return;
  overlay.classList.remove('entering');
  overlay.classList.add('closing');
  stopRainforestAmbient();
  document.getElementById('rainforest-stage')?.querySelectorAll('.rf-float, .rf-collect-pop').forEach(el => el.remove());
  setTimeout(() => {
    overlay.classList.remove('open', 'closing');
    overlay.style.opacity = '';
    document.getElementById('continent-overlay')?.classList.remove('rf-hidden-during-rainforest');
  }, 560);
}

function bindRainforestControls() {
  document.querySelectorAll('.rf-item[data-rf]').forEach(btn => {
    if (btn.dataset.rfBound) return;
    btn.dataset.rfBound = '1';
    btn.addEventListener('click', () => onRainforestItemClick(btn.dataset.rf, btn));
  });
  document.getElementById('rainforest-close')?.addEventListener('click', closeRainforestScene);
}

// ── Mist Isles 泡雾群岛 ─────────────────────────────────────────────────
const MI_STORAGE = 'bubbleRelief_mistIsles_v1';
const MI_PEARL_META = {
  bubble: { label: '泡珠', emoji: '🫧' },
  reef:   { label: '礁珠', emoji: '🪨' },
  shell:  { label: '螺珠', emoji: '🐚' },
  fog:    { label: '雾珠', emoji: '🌫' },
  tide:   { label: '潮珠', emoji: '🌊' },
};

const mistIsles = {
  pearls: { bubble: 0, reef: 0, shell: 0, fog: 0, tide: 0 },
  total: 0,
  visited: false,
};

let miAmbient = null;
let miWaveTimer = null;
let miIdleTimer = null;
let miFogTimer = null;

function loadMistIsles() {
  try {
    const raw = localStorage.getItem(MI_STORAGE);
    if (raw) {
      const d = JSON.parse(raw);
      if (d.pearls) Object.assign(mistIsles.pearls, d.pearls);
      mistIsles.total = d.total || 0;
      mistIsles.visited = !!d.visited;
    }
  } catch (e) {}
}

function saveMistIsles() {
  try {
    localStorage.setItem(MI_STORAGE, JSON.stringify({
      pearls: mistIsles.pearls,
      total: mistIsles.total,
      visited: mistIsles.visited,
    }));
  } catch (e) {}
}

function refreshMistIslesUI() {
  const bar = document.getElementById('mistisles-collect-bar');
  if (!bar) return;
  const parts = Object.entries(MI_PEARL_META)
    .filter(([k]) => mistIsles.pearls[k] > 0)
    .map(([k, m]) => `${m.emoji}${mistIsles.pearls[k]}`);
  bar.textContent = parts.length
    ? `岛珠 ${mistIsles.total} · ${parts.join(' ')}`
    : `岛珠 · ${mistIsles.total}`;
  document.getElementById('btn-mistisles-zone')?.classList.toggle('visited', mistIsles.visited);
}

function miPalmTree(x, y, s, curve = 0) {
  const c = Number(curve).toFixed(1);
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity="0.9">
    <path d="M0 0 Q${c} 5 0 12" stroke="#7a5c44" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <circle cx="-1.3" cy="1.2" r="0.38" fill="#8d6e63"/>
    <circle cx="0.5" cy="1.8" r="0.35" fill="#9e8468"/>
    <circle cx="1.4" cy="1.1" r="0.36" fill="#7a5c44"/>
    <circle cx="-0.4" cy="2.6" r="0.32" fill="#8a7058"/>
    <path d="M0 0 Q-7 -4 -9 -9" stroke="#5d8a55" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <path d="M0 0 Q7 -3 10 -8" stroke="#6b9b58" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    <path d="M0 0 Q-5 -7 -3 -12" stroke="#4caf50" stroke-width="1" fill="none" stroke-linecap="round"/>
    <path d="M0 0 Q4 -8 6 -11" stroke="#558b2f" stroke-width="1" fill="none" stroke-linecap="round"/>
    <path d="M0 -1 Q0 -9 0 -13" stroke="#689f38" stroke-width="0.9" fill="none" stroke-linecap="round"/>
  </g>`;
}

function buildMistIslesScenery() {
  const sea = document.getElementById('mi-sea');
  if (sea) {
    sea.innerHTML = `<svg class="mi-sea-fill" viewBox="0 0 1000 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="miSeaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#5a8a98"/>
          <stop offset="100%" stop-color="#3d6672"/>
        </linearGradient>
      </defs>
      <rect width="1000" height="320" fill="url(#miSeaGrad)"/>
    </svg>
    <div class="mi-sea-waves" aria-hidden="true">
      <svg class="mi-sea-swell-bg" viewBox="0 0 1000 320" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 48 Q125 36 250 44 T500 40 T750 48 T1000 42 L1000 320 L0 320 Z" fill="rgba(186,230,245,0.08)"/>
        <path d="M0 96 Q160 84 320 92 S640 86 1000 90 L1000 320 L0 320 Z" fill="rgba(176,220,235,0.05)"/>
      </svg>
      <div class="mi-roller mi-roller-1">
        <svg viewBox="0 0 1000 56" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path class="mi-roller-body" d="M0 34 Q125 18 250 30 T500 26 T750 38 T1000 30 L1000 56 L0 56 Z" fill="rgba(186,230,245,0.16)"/>
          <path class="mi-roller-crest" d="M0 32 Q125 16 250 28 T500 24 T750 36 T1000 28" fill="none" stroke="rgba(255,255,255,0.38)" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="mi-roller mi-roller-2">
        <svg viewBox="0 0 1000 56" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path class="mi-roller-body" d="M0 32 Q160 16 320 28 S640 22 1000 26 L1000 56 L0 56 Z" fill="rgba(176,220,235,0.12)"/>
          <path class="mi-roller-crest" d="M0 30 Q160 14 320 26 S640 20 1000 24" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="mi-roller mi-roller-3">
        <svg viewBox="0 0 1000 56" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path class="mi-roller-crest" d="M0 28 Q140 16 280 26 T560 22 T840 32 T1000 24" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
    </div>`;
  }
  const islands = document.getElementById('mi-islands');
  if (islands) {
    islands.innerHTML = `<svg viewBox="0 0 1000 520" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="miIsleNear" x1="0" y1="1" x2="0.12" y2="0">
          <stop offset="0%" stop-color="#7a6a5a"/>
          <stop offset="35%" stop-color="#a89888"/>
          <stop offset="70%" stop-color="#b8c4cc"/>
          <stop offset="92%" stop-color="#d4dee4" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#e8eef2" stop-opacity="0.5"/>
        </linearGradient>
        <linearGradient id="miIsleMid" x1="0" y1="1" x2="0.1" y2="0">
          <stop offset="0%" stop-color="#7a7468"/>
          <stop offset="45%" stop-color="#a09890"/>
          <stop offset="80%" stop-color="#b4bcc4"/>
          <stop offset="100%" stop-color="#ccd4da" stop-opacity="0.55"/>
        </linearGradient>
        <linearGradient id="miIsleFar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#6a7880"/>
          <stop offset="55%" stop-color="#8a949c"/>
          <stop offset="100%" stop-color="#a8b4bc" stop-opacity="0.45"/>
        </linearGradient>
      </defs>
      <!-- 远景雾层（收窄，不要横贯一大条） -->
      <ellipse cx="500" cy="252" rx="200" ry="16" fill="rgba(255,255,255,0.08)"/>
      <!-- 远岛 · 右后（扁浅、不凸起） -->
      <g opacity="0.48">
        <ellipse cx="778" cy="252" rx="44" ry="5" fill="#3a5868" opacity="0.22"/>
        <path d="M 732 254 Q 724 244 734 234 Q 752 224 778 222 Q 804 224 822 236 Q 832 246 822 254 Q 802 258 776 258 Q 742 256 732 254 Z" fill="url(#miIsleFar)" stroke="#6a7880" stroke-width="0.65" stroke-opacity="0.38"/>
        ${miPalmTree(778, 234, 0.4, 0.3)}
      </g>
      <!-- 中岛 · 正后方中间（小） -->
      <g opacity="0.62" transform="translate(498, 272) scale(0.36) translate(-228, -285)">
        <ellipse cx="228" cy="318" rx="58" ry="7" fill="#3a5868" opacity="0.18"/>
        <path d="M 172 322 Q 158 298 172 272 Q 198 242 238 248 Q 268 254 278 282 Q 286 306 258 324 Q 218 328 182 326 Q 168 324 172 322 Z" fill="url(#miIsleMid)" stroke="#7a7268" stroke-width="0.8" stroke-opacity="0.4"/>
        <path d="M 198 268 Q 228 248 258 262" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="0.9" stroke-linecap="round"/>
        ${miPalmTree(222, 262, 0.65, -0.3)}
        ${miPalmTree(248, 266, 0.5, 0.5)}
      </g>
      <!-- 近景雾（收窄） -->
      <ellipse cx="478" cy="408" rx="180" ry="14" fill="rgba(255,255,255,0.08)"/>
      <!-- 近岛 · 前景（压低后方中间隆起） -->
      <g>
        <ellipse cx="472" cy="472" rx="96" ry="8" fill="#2a4858" opacity="0.24"/>
        <path d="M 358 478 Q 348 462 356 444 Q 368 424 398 416 Q 428 410 462 412 Q 498 408 532 416 Q 558 424 568 442 Q 574 460 558 474 Q 532 488 478 490 Q 418 488 378 482 Q 358 480 358 478 Z" fill="url(#miIsleNear)" stroke="#6a5e52" stroke-width="0.85" stroke-opacity="0.48"/>
        <path d="M 362 438 Q 372 426 388 428 Q 382 440 370 442 Q 360 440 362 438 Z" fill="#8a8078" opacity="0.5"/>
        <path d="M 388 468 Q 472 462 548 468" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1.6" stroke-linecap="round"/>
        ${miPalmTree(392, 424, 0.78, 0.3)}
        ${miPalmTree(438, 418, 0.92, -0.4)}
        ${miPalmTree(478, 422, 0.85, 0.2)}
        ${miPalmTree(518, 428, 0.72, -0.5)}
      </g>
    </svg>`;
  }
}

function playMiAmbient() {
  try {
    const ctx = getAudioCtx();
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.015 * w) / 1.015;
      d[i] = last * 2.2;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.value = 650;
    const g = ctx.createGain();
    g.gain.value = 0.032;
    src.connect(flt).connect(g).connect(ctx.destination);
    src.start();
    miAmbient = { src, g };
  } catch (e) {}
}

function playMiWave() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(180, now);
    o.frequency.exponentialRampToValueAtTime(120, now + 0.4);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.035, now + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    o.connect(g).connect(ctx.destination);
    o.start(now);
    o.stop(now + 0.6);
  } catch (e) {}
}

function playMiFogChime() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    [620, 880].forEach((f, i) => {
      const t = now + i * 0.06;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.04, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.55);
    });
  } catch (e) {}
}

function playMiItemSound(type) {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const freqs = {
      bubble: [480, 720],
      reef:   [280, 380],
      shell:  [520, 680, 840],
      fog:    [340, 520],
      tide:   [160, 240, 320],
    }[type] || [500, 700];
    freqs.forEach((f, i) => {
      const t = now + i * 0.05;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.065, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.35);
    });
  } catch (e) {}
}

function startMistIslesAmbient() {
  stopMistIslesAmbient();
  playMiAmbient();
  miWaveTimer = setInterval(playMiWave, 4200 + Math.random() * 3800);
  miFogTimer = setInterval(playMiFogChime, 6000 + Math.random() * 5000);
  miIdleTimer = setInterval(spawnMistIslesIdleFloat, 4200 + Math.random() * 3200);
}

function stopMistIslesAmbient() {
  if (miWaveTimer) { clearInterval(miWaveTimer); miWaveTimer = null; }
  if (miFogTimer) { clearInterval(miFogTimer); miFogTimer = null; }
  if (miIdleTimer) { clearInterval(miIdleTimer); miIdleTimer = null; }
  if (miAmbient) {
    try { miAmbient.src.stop(); } catch (e) {}
    miAmbient = null;
  }
}

function spawnMistIslesIdleFloat() {
  const stage = document.getElementById('mistisles-stage');
  if (!stage || !document.getElementById('mistisles-overlay')?.classList.contains('open')) return;
  const el = document.createElement('div');
  el.className = 'mi-float';
  el.textContent = ['🫧', '🌫', '💧', '✨'][Math.floor(Math.random() * 4)];
  el.style.left = (10 + Math.random() * 80) + '%';
  el.style.top = (25 + Math.random() * 50) + '%';
  stage.appendChild(el);
  setTimeout(() => el.remove(), 3600);
}

function spawnMiCollectPop(btn, meta) {
  const stage = document.getElementById('mistisles-stage');
  if (!stage || !btn) return;
  const r = btn.getBoundingClientRect();
  const sr = stage.getBoundingClientRect();
  const pop = document.createElement('div');
  pop.className = 'mi-collect-pop';
  pop.textContent = `+1 ${meta.emoji}${meta.label}`;
  pop.style.left = (r.left - sr.left + r.width / 2 - 20) + 'px';
  pop.style.top = (r.top - sr.top - 8) + 'px';
  stage.appendChild(pop);
  setTimeout(() => pop.remove(), 1100);
}

function onMistIslesItemClick(type, btn) {
  const meta = MI_PEARL_META[type];
  if (!meta) return;
  btn.classList.remove('pop');
  void btn.offsetWidth;
  btn.classList.add('pop');
  playMiItemSound(type);
  if (type === 'fog') {
    document.querySelectorAll('#mistisles-stage .mi-mist').forEach(el => {
      el.style.opacity = '0.75';
      setTimeout(() => { el.style.opacity = ''; }, 800);
    });
  }
  if (type === 'tide') {
    const sea = document.getElementById('mi-sea');
    if (sea) {
      sea.style.transform = 'translateY(2px)';
      setTimeout(() => { sea.style.transform = ''; }, 550);
    }
  }
  mistIsles.pearls[type] = (mistIsles.pearls[type] || 0) + 1;
  mistIsles.total += 1;
  saveMistIsles();
  refreshMistIslesUI();
  checkAchievements();
  spawnMiCollectPop(btn, meta);
}

function openMistIslesScene() {
  loadMistIsles();
  mistIsles.visited = true;
  saveMistIsles();
  refreshMistIslesUI();
  buildMistIslesScenery();
  const overlay = document.getElementById('mistisles-overlay');
  document.getElementById('continent-overlay')?.classList.add('mi-hidden-during-mistisles');
  overlay.classList.remove('closing');
  overlay.classList.add('open', 'entering');
  startMistIslesAmbient();
  spawnMistIslesIdleFloat();
  setTimeout(() => overlay.classList.remove('entering'), 950);
}

function closeMistIslesScene() {
  const overlay = document.getElementById('mistisles-overlay');
  if (!overlay.classList.contains('open')) return;
  overlay.classList.remove('entering');
  overlay.classList.add('closing');
  stopMistIslesAmbient();
  document.getElementById('mistisles-stage')?.querySelectorAll('.mi-float, .mi-collect-pop').forEach(el => el.remove());
  setTimeout(() => {
    overlay.classList.remove('open', 'closing');
    overlay.style.opacity = '';
    document.getElementById('continent-overlay')?.classList.remove('mi-hidden-during-mistisles');
  }, 560);
}

function bindMistIslesControls() {
  document.querySelectorAll('.mi-item[data-mi]').forEach(btn => {
    if (btn.dataset.miBound) return;
    btn.dataset.miBound = '1';
    btn.addEventListener('click', () => onMistIslesItemClick(btn.dataset.mi, btn));
  });
  document.getElementById('mistisles-close')?.addEventListener('click', closeMistIslesScene);
}

// ── Rainbow Harbor 彩虹港湾 ─────────────────────────────────────────────
const RB_STORAGE = 'bubbleRelief_rainbowBay_v1';
const RB_PEARL_META = {
  bubble: { label: '虹珠', emoji: '🫧' },
  shell:  { label: '贝珠', emoji: '🐚' },
  tide:   { label: '潮珠', emoji: '🌊' },
  glow:   { label: '光珠', emoji: '✨' },
  arc:    { label: '弧珠', emoji: '🌈' },
};

const rainbowBay = {
  pearls: { bubble: 0, shell: 0, tide: 0, glow: 0, arc: 0 },
  total: 0,
  visited: false,
};

let rbAmbient = null;
let rbWaveTimer = null;
let rbIdleTimer = null;
let rbGullTimer = null;

function loadRainbowBay() {
  try {
    const raw = localStorage.getItem(RB_STORAGE);
    if (raw) {
      const d = JSON.parse(raw);
      if (d.pearls) Object.assign(rainbowBay.pearls, d.pearls);
      rainbowBay.total = d.total || 0;
      rainbowBay.visited = !!d.visited;
    }
  } catch (e) {}
}

function saveRainbowBay() {
  try {
    localStorage.setItem(RB_STORAGE, JSON.stringify({
      pearls: rainbowBay.pearls,
      total: rainbowBay.total,
      visited: rainbowBay.visited,
    }));
  } catch (e) {}
}

function refreshRainbowBayUI() {
  const bar = document.getElementById('rainbowbay-collect-bar');
  if (!bar) return;
  const parts = Object.entries(RB_PEARL_META)
    .filter(([k]) => rainbowBay.pearls[k] > 0)
    .map(([k, m]) => `${m.emoji}${rainbowBay.pearls[k]}`);
  bar.textContent = parts.length
    ? `港珠 ${rainbowBay.total} · ${parts.join(' ')}`
    : `港珠 · ${rainbowBay.total}`;
  document.getElementById('btn-rainbowbay-zone')?.classList.toggle('visited', rainbowBay.visited);
}

function buildRainbowBayScenery() {
  const arc = document.getElementById('rb-arc');
  if (arc) {
    arc.innerHTML = `<svg viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="rbArcGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#f48fb1" stop-opacity="0.92"/>
          <stop offset="25%" stop-color="#ffe082" stop-opacity="0.95"/>
          <stop offset="50%" stop-color="#a5d6a7" stop-opacity="0.92"/>
          <stop offset="75%" stop-color="#81d4fa" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#ce93d8" stop-opacity="0.92"/>
        </linearGradient>
      </defs>
      <path d="M60 298 A280 280 0 0 1 540 298" fill="none" stroke="url(#rbArcGrad)" stroke-width="24" stroke-linecap="round"/>
      <path d="M110 298 A230 230 0 0 1 490 298" fill="none" stroke="url(#rbArcGrad)" stroke-width="14" stroke-linecap="round" opacity="0.55"/>
    </svg>`;
  }
  const sea = document.getElementById('rb-sea');
  if (sea) {
    sea.innerHTML = `<svg viewBox="0 0 1000 280" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M0 280 L0 138 Q140 108 280 128 S560 112 720 132 S900 118 1000 128 L1000 280 Z" fill="#1a6275"/>
      <path d="M0 280 L0 158 Q160 128 320 148 S580 134 760 154 S920 141 1000 148 L1000 280 Z" fill="#238da3"/>
    </svg>`;
  }
  const ship = document.getElementById('rb-ship');
  if (ship) {
    ship.innerHTML = `<svg viewBox="0 0 1000 280" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="rbHullSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#78909c"/>
          <stop offset="45%" stop-color="#546e7a"/>
          <stop offset="100%" stop-color="#37474f"/>
        </linearGradient>
        <linearGradient id="rbHullDeck" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#90a4ae"/>
          <stop offset="50%" stop-color="#b0bec5"/>
          <stop offset="100%" stop-color="#78909c"/>
        </linearGradient>
      </defs>
      <!-- 浮标 -->
      <ellipse cx="420" cy="152" rx="7" ry="9" fill="#e53935" opacity="0.82"/>
      <rect x="417" y="142" width="6" height="5" rx="1" fill="#fff" opacity="0.5"/>
      <!-- 渔船：靠近栈桥，浮在水面（略放大） -->
      <g transform="translate(288, 124)">
        <g transform="scale(1.4)">
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,3; 0,0" dur="5.5s" repeatCount="indefinite"/>
            <ellipse cx="62" cy="42" rx="58" ry="9" fill="#163848" opacity="0.4"/>
            <path d="M4 38 Q62 46 118 38 L122 32 Q115 26 62 22 Q12 24 4 32 Z" fill="#2c4a58" opacity="0.9"/>
            <path d="M6 32 L10 26 Q62 18 112 24 L116 30 Q62 28 10 32 Z" fill="url(#rbHullSide)"/>
            <path d="M10 26 Q62 18 112 24 L110 22 Q62 16 12 22 Z" fill="url(#rbHullDeck)" opacity="0.85"/>
            <path d="M6 32 L116 30 L118 38 Q62 46 4 38 Z" fill="#455a64" opacity="0.55"/>
            <rect x="38" y="8" width="48" height="18" rx="2" fill="#607d8b"/>
            <path d="M38 8 L42 4 L86 4 L86 8 Z" fill="#78909c"/>
            <path d="M42 4 L46 2 L82 2 L86 4 Z" fill="#90a4ae"/>
            <rect x="44" y="11" width="11" height="9" rx="1" fill="#eceff1" opacity="0.6"/>
            <rect x="60" y="11" width="11" height="9" rx="1" fill="#cfd8dc" opacity="0.5"/>
            <rect x="76" y="12" width="8" height="12" fill="#546e7a"/>
            <line x1="96" y1="24" x2="96" y2="8" stroke="#455a64" stroke-width="2.2"/>
            <line x1="88" y1="12" x2="104" y2="12" stroke="#546e7a" stroke-width="1.8"/>
            <path d="M14 30 Q24 34 38 32" fill="none" stroke="#fff" stroke-width="1" opacity="0.2"/>
            <path d="M0 36 Q8 32 14 34" fill="none" stroke="#81d4fa" stroke-width="1.5" opacity="0.35"/>
            <path d="M118 34 Q126 32 130 36" fill="none" stroke="#81d4fa" stroke-width="1.5" opacity="0.35"/>
            <!-- 船头系缆柱 + 缆绳接船段（随船起伏） -->
            <path d="M-17 5.7 Q-6 11 4 16 L6 17" fill="none" stroke="#8d6e63" stroke-width="1.8" opacity="0.78"/>
            <rect x="4" y="21" width="5" height="4" rx="1" fill="#8d6e63" stroke="#6d4c41" stroke-width="0.8"/>
            <path d="M6 21 L6 17" stroke="#8d6e63" stroke-width="1.6" stroke-linecap="round"/>
            <circle cx="6" cy="17" r="2" fill="none" stroke="#8d6e63" stroke-width="1.3"/>
          </g>
        </g>
      </g>
    </svg>`;
  }
  const rope = document.getElementById('rb-rope');
  if (rope) {
    rope.innerHTML = `<svg viewBox="0 0 1000 280" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <!-- 缆绳：系船桩顶 → 栈桥水边 → 船头系缆柱（与海面/栈桥同坐标） -->
      <path d="M257 118 Q254 114 257 110" fill="none" stroke="#8d6e63" stroke-width="2" opacity="0.88"/>
      <path d="M257 118 L260 126 L264 132" fill="none" stroke="#8d6e63" stroke-width="2" opacity="0.82"/>
      <circle cx="257" cy="118" r="3" fill="none" stroke="#6d4c41" stroke-width="1.4"/>
    </svg>`;
  }
  const waves = document.getElementById('rb-sea-waves');
  if (waves) {
    const rbWaveSvg = (body) =>
      `<svg viewBox="0 0 1000 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g>${body}</g><g transform="translate(0,100)">${body}</g></svg>`;
    const deepBody = `
        <path d="M0 72 Q125 52 250 70 T500 60 T750 74 T1000 62 L1000 100 L0 100 Z" fill="rgba(22,88,108,0.45)"/>
        <path d="M0 58 Q160 38 320 52 S640 42 820 56 S980 48 1000 54" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2.2"/>`;
    const midBody = `
        <path d="M0 68 Q125 46 250 64 T500 52 T750 68 T1000 54 L1000 100 L0 100 Z" fill="rgba(255,255,255,0.09)"/>
        <path d="M0 52 Q140 32 280 46 S560 36 780 50 S960 42 1000 48" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2.4"/>`;
    const frontBody = `
        <path d="M0 62 Q125 40 250 58 T500 46 T750 62 T1000 48 L1000 100 L0 100 Z" fill="rgba(255,255,255,0.16)"/>
        <path d="M0 46 Q130 26 260 40 S540 30 780 44 S960 36 1000 42" fill="none" stroke="rgba(255,255,255,0.34)" stroke-width="2.8"/>`;
    const foamBody = `
        <path d="M0 58 Q100 38 220 52 T480 40 T740 54 T1000 44 L1000 100 L0 100 Z" fill="rgba(186,235,255,0.24)"/>
        <path d="M0 42 Q120 24 240 38 S520 28 760 42 S960 34 1000 40" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="2.2"/>
        <path d="M0 50 Q80 36 160 46 T320 42 T480 48 T640 44 T800 50 T1000 46" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.4"/>`;
    waves.innerHTML = `
      <div class="rb-wave-track rb-wave-deep">${rbWaveSvg(deepBody)}</div>
      <div class="rb-wave-track rb-wave-mid">${rbWaveSvg(midBody)}</div>
      <div class="rb-wave-track rb-wave-front">${rbWaveSvg(frontBody)}</div>
      <div class="rb-wave-track rb-wave-foam">${rbWaveSvg(foamBody)}</div>`;
  }
  const swash = document.getElementById('rb-swash');
  if (swash) {
    swash.innerHTML = `<svg viewBox="0 0 1000 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M0 88 Q125 52 250 72 T500 58 T750 76 T1000 62 L1000 120 L0 120 Z" fill="rgba(210,245,255,0.55)"/>
      <path d="M0 72 Q160 38 320 58 S640 44 820 62 S980 52 1000 58" fill="none" stroke="rgba(255,255,255,0.72)" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M0 96 Q140 78 280 88 S560 82 780 92 S960 86 1000 90" fill="none" stroke="rgba(144,210,235,0.45)" stroke-width="2"/>
    </svg>`;
  }
  const beach = document.getElementById('rb-beach');
  if (beach) {
    beach.innerHTML = `<svg viewBox="0 0 1000 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="rbQuay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#b8a890"/>
          <stop offset="100%" stop-color="#8a7868"/>
        </linearGradient>
      </defs>
      <path d="M0 100 L0 35 L1000 28 L1000 100 Z" fill="url(#rbQuay)"/>
      <!-- 栈桥陆段（水面线 y=0 与海上栈桥衔接） -->
      <path d="M0 100 L0 0 L260 0 L260 100 Z" fill="#7a6358" opacity="0.92"/>
      <rect x="0" y="0" width="260" height="4" fill="#6d4c41" opacity="0.85"/>
    </svg>
    <div class="rb-wet-sand" aria-hidden="true"></div>`;
  }
  const harbor = document.getElementById('rb-harbor');
  if (harbor) {
    harbor.innerHTML = `<svg viewBox="0 0 1000 280" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="rbPier" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8d6e63"/>
          <stop offset="100%" stop-color="#5d4037"/>
        </linearGradient>
      </defs>
      <!-- 左侧栈桥（水面以上，与海面同坐标系） -->
      <path d="M0 280 L0 151 L260 120 L260 280 Z" fill="url(#rbPier)" opacity="0.93"/>
      <rect x="0" y="143" width="260" height="5" fill="#6d4c41"/>
      <line x1="0" y1="157" x2="260" y2="157" stroke="#5d4037" stroke-width="0.8" opacity="0.35"/>
      <line x1="0" y1="171" x2="260" y2="171" stroke="#5d4037" stroke-width="0.8" opacity="0.35"/>
      <!-- 系船桩：贴近水面、栈桥末端 -->
      <g fill="#5d4037" stroke="#3e2723" stroke-width="0.8">
        <rect x="236" y="122" width="6" height="18" rx="1.2"/>
        <ellipse cx="239" cy="121" rx="4.5" ry="2.2" fill="#6d4c41"/>
        <rect x="246" y="120" width="6" height="20" rx="1.2"/>
        <ellipse cx="249" cy="119" rx="4.5" ry="2.2" fill="#6d4c41"/>
        <rect x="254" y="118" width="6" height="22" rx="1.2"/>
        <ellipse cx="257" cy="117" rx="4.5" ry="2.2" fill="#6d4c41"/>
      </g>
    </svg>`;
  }
}

function playRbAmbientWave() {
  try {
    const ctx = getAudioCtx();
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.015 * w) / 1.015;
      d[i] = last * 3.2;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.value = 520;
    const g = ctx.createGain();
    g.gain.value = 0.04;
    src.connect(flt).connect(g).connect(ctx.destination);
    src.start();
    rbAmbient = { src, g };
  } catch (e) {}
}

function playRbWaveLap() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(180, now);
    o.frequency.exponentialRampToValueAtTime(95, now + 0.35);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.045, now + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    o.connect(g).connect(ctx.destination);
    o.start(now);
    o.stop(now + 0.55);
  } catch (e) {}
}

function playRbSeagull() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    [0, 0.12].forEach((off, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(2100 - i * 200, now + off);
      o.frequency.exponentialRampToValueAtTime(1400, now + off + 0.15);
      g.gain.setValueAtTime(0.001, now + off);
      g.gain.linearRampToValueAtTime(0.018, now + off + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, now + off + 0.2);
      o.connect(g).connect(ctx.destination);
      o.start(now + off);
      o.stop(now + off + 0.25);
    });
  } catch (e) {}
}

function playRbItemSound(type) {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const freqs = {
      bubble: [620, 880, 1100],
      shell:  [480, 640],
      tide:   [220, 280, 340],
      glow:   [740, 980, 1180],
      arc:    [520, 680, 840, 1000],
    }[type] || [600, 800];
    freqs.forEach((f, i) => {
      const t = now + i * 0.045;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.065, t + 0.025);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.35);
    });
  } catch (e) {}
}

function startRainbowBayAmbient() {
  stopRainbowBayAmbient();
  playRbAmbientWave();
  rbWaveTimer = setInterval(playRbWaveLap, 2800 + Math.random() * 3200);
  rbGullTimer = setInterval(playRbSeagull, 12000 + Math.random() * 14000);
  rbIdleTimer = setInterval(spawnRainbowBayIdleFloat, 4200 + Math.random() * 3800);
}

function stopRainbowBayAmbient() {
  if (rbWaveTimer) { clearInterval(rbWaveTimer); rbWaveTimer = null; }
  if (rbGullTimer) { clearInterval(rbGullTimer); rbGullTimer = null; }
  if (rbIdleTimer) { clearInterval(rbIdleTimer); rbIdleTimer = null; }
  if (rbAmbient) {
    try { rbAmbient.src.stop(); } catch (e) {}
    rbAmbient = null;
  }
}

function spawnRainbowBayIdleFloat() {
  const stage = document.getElementById('rainbowbay-stage');
  if (!stage || !document.getElementById('rainbowbay-overlay').classList.contains('open')) return;
  const el = document.createElement('div');
  el.className = 'rb-float';
  el.textContent = ['🫧', '✨', '🌈', '🐚'][Math.floor(Math.random() * 4)];
  el.style.left = (10 + Math.random() * 80) + '%';
  el.style.top = (25 + Math.random() * 50) + '%';
  stage.appendChild(el);
  setTimeout(() => el.remove(), 3600);
}

function spawnRbCollectPop(btn, meta) {
  const stage = document.getElementById('rainbowbay-stage');
  if (!stage || !btn) return;
  const r = btn.getBoundingClientRect();
  const sr = stage.getBoundingClientRect();
  const pop = document.createElement('div');
  pop.className = 'rb-collect-pop';
  pop.textContent = `+1 ${meta.emoji}${meta.label}`;
  pop.style.left = (r.left - sr.left + r.width / 2 - 20) + 'px';
  pop.style.top = (r.top - sr.top - 8) + 'px';
  stage.appendChild(pop);
  setTimeout(() => pop.remove(), 1100);
}

function onRainbowBayItemClick(type, btn) {
  const meta = RB_PEARL_META[type];
  if (!meta) return;
  btn.classList.remove('pop');
  void btn.offsetWidth;
  btn.classList.add('pop');
  playRbItemSound(type);
  if (type === 'arc') {
    const arcEl = document.getElementById('rb-arc');
    if (arcEl) {
      arcEl.style.opacity = '1';
      setTimeout(() => { arcEl.style.opacity = ''; }, 900);
    }
  }
  if (type === 'tide') {
    const sea = document.getElementById('rb-sea');
    if (sea) {
      sea.style.transform = 'translateY(3px)';
      setTimeout(() => { sea.style.transform = ''; }, 600);
    }
  }
  rainbowBay.pearls[type] = (rainbowBay.pearls[type] || 0) + 1;
  rainbowBay.total += 1;
  saveRainbowBay();
  refreshRainbowBayUI();
  checkAchievements();
  spawnRbCollectPop(btn, meta);
}

function openRainbowBayScene() {
  loadRainbowBay();
  rainbowBay.visited = true;
  saveRainbowBay();
  refreshRainbowBayUI();
  buildRainbowBayScenery();
  const overlay = document.getElementById('rainbowbay-overlay');
  document.getElementById('continent-overlay')?.classList.add('rb-hidden-during-bay');
  overlay.classList.remove('closing');
  overlay.classList.add('open', 'entering');
  startRainbowBayAmbient();
  spawnRainbowBayIdleFloat();
  setTimeout(() => overlay.classList.remove('entering'), 950);
}

function closeRainbowBayScene() {
  const overlay = document.getElementById('rainbowbay-overlay');
  if (!overlay.classList.contains('open')) return;
  overlay.classList.remove('entering');
  overlay.classList.add('closing');
  stopRainbowBayAmbient();
  document.getElementById('rainbowbay-stage')?.querySelectorAll('.rb-float, .rb-collect-pop').forEach(el => el.remove());
  setTimeout(() => {
    overlay.classList.remove('open', 'closing');
    overlay.style.opacity = '';
    document.getElementById('continent-overlay')?.classList.remove('rb-hidden-during-bay');
  }, 560);
}

function bindRainbowBayControls() {
  document.querySelectorAll('.rb-item[data-rb]').forEach(btn => {
    if (btn.dataset.rbBound) return;
    btn.dataset.rbBound = '1';
    btn.addEventListener('click', () => onRainbowBayItemClick(btn.dataset.rb, btn));
  });
  document.getElementById('rainbowbay-close')?.addEventListener('click', closeRainbowBayScene);
}

// ── Crystal Frost 水晶雪原 ─────────────────────────────────────────────
const CF_STORAGE = 'bubbleRelief_crystalFrost_v1';
const CF_PEARL_META = {
  ice:     { label: '冰珠', emoji: '🫧' },
  crystal: { label: '晶珠', emoji: '💎' },
  frost:   { label: '霜珠', emoji: '❄️' },
  aurora:  { label: '光珠', emoji: '🌌' },
  drift:   { label: '团珠', emoji: '⛄' },
};

const crystalFrost = {
  pearls: { ice: 0, crystal: 0, frost: 0, aurora: 0, drift: 0 },
  total: 0,
  visited: false,
};

let cfAmbient = null;
let cfChimeTimer = null;
let cfSnowTimer = null;
let cfTickTimer = null;
let cfIdleTimer = null;

function loadCrystalFrost() {
  try {
    const raw = localStorage.getItem(CF_STORAGE);
    if (raw) {
      const d = JSON.parse(raw);
      if (d.pearls) Object.assign(crystalFrost.pearls, d.pearls);
      crystalFrost.total = d.total || 0;
      crystalFrost.visited = !!d.visited;
    }
  } catch (e) {}
}

function saveCrystalFrost() {
  try {
    localStorage.setItem(CF_STORAGE, JSON.stringify({
      pearls: crystalFrost.pearls,
      total: crystalFrost.total,
      visited: crystalFrost.visited,
    }));
  } catch (e) {}
}

function refreshCrystalFrostUI() {
  const bar = document.getElementById('crystalfrost-collect-bar');
  if (!bar) return;
  const parts = Object.entries(CF_PEARL_META)
    .filter(([k]) => crystalFrost.pearls[k] > 0)
    .map(([k, m]) => `${m.emoji}${crystalFrost.pearls[k]}`);
  bar.textContent = parts.length
    ? `雪珠 ${crystalFrost.total} · ${parts.join(' ')}`
    : `雪珠 · ${crystalFrost.total}`;
  document.getElementById('btn-crystalfrost-zone')?.classList.toggle('visited', crystalFrost.visited);
}

function buildCrystalFrostScenery() {
  const mt = document.getElementById('cf-mountains');
  if (mt) {
    mt.innerHTML = `<svg viewBox="0 0 1000 280" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="cfRockFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8a9bab"/>
          <stop offset="100%" stop-color="#5c6d7d"/>
        </linearGradient>
        <linearGradient id="cfRock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7a8794"/>
          <stop offset="55%" stop-color="#556270"/>
          <stop offset="100%" stop-color="#3e4852"/>
        </linearGradient>
        <linearGradient id="cfRockFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#6d7884"/>
          <stop offset="100%" stop-color="#434b54"/>
        </linearGradient>
        <linearGradient id="cfPeak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f8fcff"/>
          <stop offset="40%" stop-color="#dceaf4"/>
          <stop offset="100%" stop-color="#a8bdd0"/>
        </linearGradient>
      </defs>
      <path d="M0 280 L0 218 Q95 202 218 212 Q352 186 488 208 Q633 192 778 206 L1000 224 L1000 280 Z" fill="url(#cfRockFar)" opacity="0.42"/>
      <path d="M0 280 L0 206 L61 184 L133 158 L218 54 L276 132 L341 78 L418 176 L496 30 L558 112 L638 162 L706 60 L788 138 L871 184 L942 108 L1000 152 L1000 280 Z" fill="url(#cfRock)" opacity="0.94"/>
      <path d="M218 54 L241 88 L226 122 L198 108 L212 72 L191 96 Z" fill="url(#cfRockFace)" opacity="0.9"/>
      <path d="M496 30 L528 74 L512 118 L471 102 L484 58 L458 82 Z" fill="url(#cfRockFace)" opacity="0.93"/>
      <path d="M706 60 L731 98 L712 138 L684 118 L698 82 Z" fill="#5a6570" opacity="0.86"/>
      <path d="M341 78 L362 108 L338 132 L318 112 Z" fill="#646f7a" opacity="0.78"/>
      <path d="M871 184 L888 198 L862 208 L848 192 Z" fill="#58636e" opacity="0.72"/>
      <path d="M133 158 L152 176 L126 192 L108 172 L118 152 Z" fill="url(#cfRockFace)" opacity="0.82"/>
      <path d="M942 108 L962 122 L938 138 L912 124 L918 108 Z" fill="url(#cfRockFace)" opacity="0.84"/>
      <path d="M558 112 L572 128 L548 138 L532 122 Z" fill="#647080" opacity="0.65"/>
      <path d="M218 54 Q198 78 212 102 Q238 88 241 88 Q228 68 218 54 Z" fill="url(#cfPeak)" opacity="0.84"/>
      <path d="M496 30 Q478 58 492 82 Q518 72 528 74 Q512 48 496 30 Z" fill="url(#cfPeak)" opacity="0.9"/>
      <path d="M706 60 Q688 88 702 112 Q728 98 731 98 Q716 76 706 60 Z" fill="url(#cfPeak)" opacity="0.82"/>
      <path d="M341 78 Q328 92 338 108 Q358 98 362 108 Q348 86 341 78 Z" fill="#eef4f9" opacity="0.76"/>
      <path d="M418 176 Q432 158 448 168 Q438 182 418 176 Z" fill="#edf3f8" opacity="0.52"/>
      <path d="M638 162 Q622 148 612 158 Q628 172 638 162 Z" fill="#e6eef5" opacity="0.55"/>
      <path d="M0 280 L0 232 Q88 214 172 226 Q268 198 388 214 Q502 186 618 208 Q728 202 842 216 Q958 198 1000 216 L1000 280 Z" fill="#c5d8e8" opacity="0.48"/>
    </svg>`;
  }
  const back = document.getElementById('cf-snow-back');
  if (back) {
    back.innerHTML = `<svg viewBox="0 0 1000 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M0 120 L0 72 Q160 48 320 62 S560 52 760 68 S920 58 1000 64 L1000 120 Z" fill="#d8eaf2" opacity="0.85"/>
      <path d="M0 120 L0 88 Q140 68 280 78 S520 72 720 82 S920 76 1000 80 L1000 120 Z" fill="#e8f4fa" opacity="0.65"/>
    </svg>`;
  }
  const crystals = document.getElementById('cf-crystals');
  if (crystals) {
    crystals.innerHTML = `<svg viewBox="0 0 1000 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="cfGem" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e1f5fe"/>
          <stop offset="50%" stop-color="#81d4fa"/>
          <stop offset="100%" stop-color="#4fc3f7"/>
        </linearGradient>
      </defs>
      <g opacity="0.82">
        <path d="M180 160 L200 110 L220 160 L200 175 Z" fill="url(#cfGem)" stroke="#b3e5fc" stroke-width="1"/>
        <path d="M194 110 L200 92 L206 110 Z" fill="#fff" opacity="0.7"/>
        <path d="M420 170 L448 105 L476 170 L448 188 Z" fill="url(#cfGem)" stroke="#b3e5fc" stroke-width="1.2"/>
        <path d="M440 105 L448 82 L456 105 Z" fill="#fff" opacity="0.75"/>
        <path d="M680 155 L702 108 L724 155 L702 172 Z" fill="url(#cfGem)" stroke="#b3e5fc" stroke-width="1"/>
        <path d="M694 108 L702 90 L710 108 Z" fill="#fff" opacity="0.68"/>
        <path d="M820 165 L838 125 L856 165 L838 178 Z" fill="url(#cfGem)" stroke="#b3e5fc" stroke-width="0.9" opacity="0.75"/>
      </g>
    </svg>`;
  }
  const front = document.getElementById('cf-snow-front');
  if (front) {
    front.innerHTML = `<svg viewBox="0 0 1000 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M0 100 L0 55 Q180 38 360 48 S720 42 1000 50 L1000 100 Z" fill="#f2f9fc"/>
      <path d="M0 100 L0 68 Q200 52 420 60 S780 54 1000 62 L1000 100 Z" fill="#fff" opacity="0.55"/>
    </svg>`;
  }
  const fall = document.getElementById('cf-snowfall');
  if (fall) {
    fall.innerHTML = '';
    for (let i = 0; i < 32; i++) {
      const f = document.createElement('div');
      f.className = 'cf-flake';
      const sz = 2 + Math.random() * 4;
      f.style.left = Math.random() * 100 + '%';
      f.style.width = f.style.height = sz + 'px';
      f.style.opacity = 0.3 + Math.random() * 0.55;
      f.style.animationDuration = (5 + Math.random() * 9) + 's';
      f.style.animationDelay = (-Math.random() * 12) + 's';
      fall.appendChild(f);
    }
  }
}

function playCfAmbientSnow() {
  try {
    const ctx = getAudioCtx();
    const sr = ctx.sampleRate;
    const len = sr * 2;
    const buf = ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    let brown = 0;
    let drift = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      brown = (brown + 0.0032 * w) / 1.0032;
      drift = drift * 0.9996 + brown * 0.0004;
      const swell = 0.72 + 0.28 * Math.sin(i / sr * 0.35);
      d[i] = (brown * 0.55 + drift) * swell * 5.2;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const lp1 = ctx.createBiquadFilter();
    lp1.type = 'lowpass';
    lp1.frequency.value = 420;
    lp1.Q.value = 0.35;
    const lp2 = ctx.createBiquadFilter();
    lp2.type = 'lowpass';
    lp2.frequency.value = 260;
    lp2.Q.value = 0.5;
    const g = ctx.createGain();
    g.gain.value = 0.11;
    src.connect(lp1).connect(lp2).connect(g).connect(ctx.destination);
    src.start();
    cfAmbient = { nodes: [src], g };
  } catch (e) {}
}

/** 偶尔一阵雪势：低频软扑，不要高频沙沙（那会像雨） */
function playCfSnowFlurry() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const dur = 0.85 + Math.random() * 0.55;
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * dur);
    const buf = ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    let sm = 0;
    for (let i = 0; i < len; i++) {
      const t = i / len;
      const env = Math.sin(t * Math.PI);
      const w = Math.random() * 2 - 1;
      sm = (sm + 0.006 * w) / 1.006;
      d[i] = sm * env * 6;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 310;
    lp.Q.value = 0.4;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.055, now + dur * 0.22);
    g.gain.linearRampToValueAtTime(0.001, now + dur);
    src.connect(lp).connect(g).connect(ctx.destination);
    src.start(now);
  } catch (e) {}
}

/** 稀落雪粒：极轻、极低，偶尔一点 */
function playCfSnowflakeTick() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const n = ctx.createBufferSource();
    const blen = Math.floor(ctx.sampleRate * 0.04);
    const b = ctx.createBuffer(1, blen, ctx.sampleRate);
    const bd = b.getChannelData(0);
    for (let i = 0; i < blen; i++) bd[i] = (Math.random() * 2 - 1) * (1 - i / blen);
    n.buffer = b;
    o.type = 'sine';
    o.frequency.setValueAtTime(140 + Math.random() * 60, now);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 220;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.018, now + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    o.connect(g);
    n.connect(lp).connect(g);
    g.connect(ctx.destination);
    o.start(now);
    o.stop(now + 0.08);
    n.start(now);
  } catch (e) {}
}

function playCfCrystalChime() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    [880, 1170, 1480].forEach((f, i) => {
      const t = now + i * 0.07;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.038, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.6);
    });
  } catch (e) {}
}

function playCfItemSound(type) {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const freqs = {
      ice:     [640, 920, 1180],
      crystal: [980, 1320, 1680],
      frost:   [720, 960],
      aurora:  [520, 780, 1040, 1300],
      drift:   [440, 580, 720],
    }[type] || [700, 950];
    freqs.forEach((f, i) => {
      const t = now + i * 0.04;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.085, t + 0.025);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.32);
    });
  } catch (e) {}
}

function startCrystalFrostAmbient() {
  stopCrystalFrostAmbient();
  playCfAmbientSnow();
  cfSnowTimer = setInterval(playCfSnowFlurry, 7000 + Math.random() * 8000);
  cfTickTimer = setInterval(playCfSnowflakeTick, 1800 + Math.random() * 2400);
  cfChimeTimer = setInterval(playCfCrystalChime, 12000 + Math.random() * 14000);
  cfIdleTimer = setInterval(spawnCrystalFrostIdleFloat, 4500 + Math.random() * 4000);
}

function stopCrystalFrostAmbient() {
  if (cfSnowTimer) { clearInterval(cfSnowTimer); cfSnowTimer = null; }
  if (cfTickTimer) { clearInterval(cfTickTimer); cfTickTimer = null; }
  if (cfChimeTimer) { clearInterval(cfChimeTimer); cfChimeTimer = null; }
  if (cfIdleTimer) { clearInterval(cfIdleTimer); cfIdleTimer = null; }
  if (cfAmbient) {
    cfAmbient.nodes?.forEach(n => { try { n.stop(); } catch (e) {} });
    cfAmbient = null;
  }
}

function spawnCrystalFrostIdleFloat() {
  const stage = document.getElementById('crystalfrost-stage');
  if (!stage || !document.getElementById('crystalfrost-overlay').classList.contains('open')) return;
  const el = document.createElement('div');
  el.className = 'cf-float';
  el.textContent = ['❄️', '💎', '✨', '🫧'][Math.floor(Math.random() * 4)];
  el.style.left = (8 + Math.random() * 84) + '%';
  el.style.top = (20 + Math.random() * 55) + '%';
  stage.appendChild(el);
  setTimeout(() => el.remove(), 3600);
}

function spawnCfCollectPop(btn, meta) {
  const stage = document.getElementById('crystalfrost-stage');
  if (!stage || !btn) return;
  const r = btn.getBoundingClientRect();
  const sr = stage.getBoundingClientRect();
  const pop = document.createElement('div');
  pop.className = 'cf-collect-pop';
  pop.textContent = `+1 ${meta.emoji}${meta.label}`;
  pop.style.left = (r.left - sr.left + r.width / 2 - 20) + 'px';
  pop.style.top = (r.top - sr.top - 8) + 'px';
  stage.appendChild(pop);
  setTimeout(() => pop.remove(), 1100);
}

function onCrystalFrostItemClick(type, btn) {
  const meta = CF_PEARL_META[type];
  if (!meta) return;
  btn.classList.remove('pop');
  void btn.offsetWidth;
  btn.classList.add('pop');
  playCfItemSound(type);
  if (type === 'aurora') {
    const aur = document.querySelector('.cf-aurora');
    if (aur) {
      aur.style.opacity = '0.75';
      setTimeout(() => { aur.style.opacity = ''; }, 900);
    }
  }
  if (type === 'crystal') {
    const gems = document.getElementById('cf-crystals');
    if (gems) {
      gems.style.filter = 'brightness(1.25)';
      setTimeout(() => { gems.style.filter = ''; }, 700);
    }
  }
  crystalFrost.pearls[type] = (crystalFrost.pearls[type] || 0) + 1;
  crystalFrost.total += 1;
  saveCrystalFrost();
  refreshCrystalFrostUI();
  checkAchievements();
  spawnCfCollectPop(btn, meta);
}

function openCrystalFrostScene() {
  loadCrystalFrost();
  crystalFrost.visited = true;
  saveCrystalFrost();
  refreshCrystalFrostUI();
  buildCrystalFrostScenery();
  const overlay = document.getElementById('crystalfrost-overlay');
  document.getElementById('continent-overlay')?.classList.add('cf-hidden-during-frost');
  overlay.classList.remove('closing');
  overlay.classList.add('open', 'entering');
  startCrystalFrostAmbient();
  spawnCrystalFrostIdleFloat();
  setTimeout(() => overlay.classList.remove('entering'), 950);
}

function closeCrystalFrostScene() {
  const overlay = document.getElementById('crystalfrost-overlay');
  if (!overlay.classList.contains('open')) return;
  overlay.classList.remove('entering');
  overlay.classList.add('closing');
  stopCrystalFrostAmbient();
  document.getElementById('crystalfrost-stage')?.querySelectorAll('.cf-float, .cf-collect-pop').forEach(el => el.remove());
  setTimeout(() => {
    overlay.classList.remove('open', 'closing');
    overlay.style.opacity = '';
    document.getElementById('continent-overlay')?.classList.remove('cf-hidden-during-frost');
  }, 560);
}

function bindCrystalFrostControls() {
  document.querySelectorAll('.cf-item[data-cf]').forEach(btn => {
    if (btn.dataset.cfBound) return;
    btn.dataset.cfBound = '1';
    btn.addEventListener('click', () => onCrystalFrostItemClick(btn.dataset.cf, btn));
  });
  document.getElementById('crystalfrost-close')?.addEventListener('click', closeCrystalFrostScene);
}

// ── Gold Plains 金泡平原 ───────────────────────────────────────────────
const GP_STORAGE = 'bubbleRelief_goldPlains_v1';
const GP_PEARL_META = {
  gold:   { label: '金泡', emoji: '🫧' },
  wheat:  { label: '麦珠', emoji: '🌾' },
  sun:    { label: '日珠', emoji: '☀️' },
  flower: { label: '花珠', emoji: '🌼' },
  wind:   { label: '风珠', emoji: '💨' },
};

const goldPlains = {
  pearls: { gold: 0, wheat: 0, sun: 0, flower: 0, wind: 0 },
  total: 0,
  visited: false,
};

let gpAmbient = null;
let gpWindTimer = null;
let gpRustleTimer = null;
let gpIdleTimer = null;

function loadGoldPlains() {
  try {
    const raw = localStorage.getItem(GP_STORAGE);
    if (raw) {
      const d = JSON.parse(raw);
      if (d.pearls) Object.assign(goldPlains.pearls, d.pearls);
      goldPlains.total = d.total || 0;
      goldPlains.visited = !!d.visited;
    }
  } catch (e) {}
}

function saveGoldPlains() {
  try {
    localStorage.setItem(GP_STORAGE, JSON.stringify({
      pearls: goldPlains.pearls,
      total: goldPlains.total,
      visited: goldPlains.visited,
    }));
  } catch (e) {}
}

function refreshGoldPlainsUI() {
  const bar = document.getElementById('goldplains-collect-bar');
  if (!bar) return;
  const parts = Object.entries(GP_PEARL_META)
    .filter(([k]) => goldPlains.pearls[k] > 0)
    .map(([k, m]) => `${m.emoji}${goldPlains.pearls[k]}`);
  bar.textContent = parts.length
    ? `原珠 ${goldPlains.total} · ${parts.join(' ')}`
    : `原珠 · ${goldPlains.total}`;
  document.getElementById('btn-goldplains-zone')?.classList.toggle('visited', goldPlains.visited);
}

function buildGoldPlainsScenery() {
  const hills = document.getElementById('gp-hills');
  if (hills) {
    hills.innerHTML = `<svg viewBox="0 0 1000 280" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="gpHillFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d4b86a"/>
          <stop offset="100%" stop-color="#a08848"/>
        </linearGradient>
        <linearGradient id="gpHillNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#c9a85c"/>
          <stop offset="100%" stop-color="#8d7340"/>
        </linearGradient>
      </defs>
      <path d="M0 280 L0 228 Q118 198 248 212 Q382 178 518 198 Q652 172 798 188 Q912 182 1000 198 L1000 280 Z" fill="url(#gpHillFar)" opacity="0.55"/>
      <path d="M0 280 L0 248 Q92 218 208 232 Q348 205 492 222 Q628 210 768 228 Q898 218 1000 236 L1000 280 Z" fill="url(#gpHillNear)" opacity="0.72"/>
    </svg>`;
  }
  const wheat = document.getElementById('gp-wheat');
  if (wheat) {
    wheat.innerHTML = `<svg viewBox="0 0 1000 160" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="gpWheat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffe082"/>
          <stop offset="100%" stop-color="#ffb300"/>
        </linearGradient>
      </defs>
      <g opacity="0.88">
        <path d="M0 160 L0 88 Q120 72 240 82 Q380 68 520 78 Q660 70 800 80 Q920 74 1000 82 L1000 160 Z" fill="url(#gpWheat)" opacity="0.35"/>
        <path d="M80 120 L82 78 L84 120" stroke="#f9a825" stroke-width="2.2" fill="none" opacity="0.55"/>
        <path d="M180 125 L183 70 L186 125" stroke="#f9a825" stroke-width="2.4" fill="none" opacity="0.6"/>
        <path d="M290 118 L292 65 L295 118" stroke="#f9a825" stroke-width="2" fill="none" opacity="0.5"/>
        <path d="M420 122 L422 72 L425 122" stroke="#f9a825" stroke-width="2.3" fill="none" opacity="0.58"/>
        <path d="M540 115 L542 68 L545 115" stroke="#f9a825" stroke-width="2.1" fill="none" opacity="0.52"/>
        <path d="M680 120 L682 74 L685 120" stroke="#f9a825" stroke-width="2.4" fill="none" opacity="0.57"/>
        <path d="M820 118 L822 70 L825 118" stroke="#f9a825" stroke-width="2.2" fill="none" opacity="0.54"/>
        <path d="M920 124 L922 76 L925 124" stroke="#f9a825" stroke-width="2" fill="none" opacity="0.5"/>
      </g>
    </svg>`;
  }
  const bubbles = document.getElementById('gp-bubble-field');
  if (bubbles) {
    bubbles.innerHTML = `<svg viewBox="0 0 1000 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="120" cy="420" r="14" fill="rgba(255,248,220,0.35)" stroke="rgba(255,213,79,0.45)" stroke-width="1"/>
      <circle cx="280" cy="380" r="10" fill="rgba(255,255,255,0.28)" stroke="rgba(255,224,130,0.4)" stroke-width="1"/>
      <circle cx="460" cy="440" r="16" fill="rgba(255,248,220,0.32)" stroke="rgba(255,193,7,0.4)" stroke-width="1"/>
      <circle cx="620" cy="360" r="11" fill="rgba(255,255,255,0.25)" stroke="rgba(255,213,79,0.38)" stroke-width="1"/>
      <circle cx="780" cy="410" r="13" fill="rgba(255,248,220,0.3)" stroke="rgba(255,224,130,0.42)" stroke-width="1"/>
    </svg>`;
  }
  const wind = document.getElementById('gp-wind');
  if (wind) {
    wind.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const line = document.createElement('div');
      line.className = 'gp-wind-line';
      line.style.top = (18 + Math.random() * 55) + '%';
      line.style.width = (80 + Math.random() * 120) + 'px';
      line.style.animationDuration = (6 + Math.random() * 8) + 's';
      line.style.animationDelay = (-Math.random() * 10) + 's';
      wind.appendChild(line);
    }
  }
}

function playGpAmbientWind() {
  try {
    const ctx = getAudioCtx();
    const sr = ctx.sampleRate;
    const len = sr * 2;
    const buf = ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < len; i++) {
      brown = (brown + 0.0028 * (Math.random() * 2 - 1)) / 1.0028;
      const swell = 0.65 + 0.35 * Math.sin(i / sr * 0.22);
      d[i] = brown * swell * 4.8;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 520;
    const g = ctx.createGain();
    g.gain.value = 0.055;
    src.connect(lp).connect(g).connect(ctx.destination);
    src.start();
    gpAmbient = { nodes: [src] };
  } catch (e) {}
}

function playGpGrassRustle() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(180 + Math.random() * 80, now);
    o.frequency.exponentialRampToValueAtTime(120, now + 0.35);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.04, now + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    o.connect(g).connect(ctx.destination);
    o.start(now);
    o.stop(now + 0.42);
  } catch (e) {}
}

function playGpItemSound(type) {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const freqs = { gold: 523, wheat: 392, sun: 659, flower: 440, wind: 349 };
    const f = freqs[type] || 440;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(f, now);
    o.frequency.exponentialRampToValueAtTime(f * 1.08, now + 0.12);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.09, now + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    o.connect(g).connect(ctx.destination);
    o.start(now);
    o.stop(now + 0.3);
  } catch (e) {}
}

function startGoldPlainsAmbient() {
  stopGoldPlainsAmbient();
  playGpAmbientWind();
  gpRustleTimer = setInterval(playGpGrassRustle, 5000 + Math.random() * 6000);
  gpIdleTimer = setInterval(spawnGoldPlainsIdleFloat, 4200 + Math.random() * 3800);
}

function stopGoldPlainsAmbient() {
  if (gpRustleTimer) { clearInterval(gpRustleTimer); gpRustleTimer = null; }
  if (gpIdleTimer) { clearInterval(gpIdleTimer); gpIdleTimer = null; }
  if (gpAmbient) {
    gpAmbient.nodes?.forEach(n => { try { n.stop(); } catch (e) {} });
    gpAmbient = null;
  }
}

function spawnGoldPlainsIdleFloat() {
  const stage = document.getElementById('goldplains-stage');
  if (!stage || !document.getElementById('goldplains-overlay').classList.contains('open')) return;
  const el = document.createElement('div');
  el.className = 'gp-float';
  el.textContent = ['🫧', '🌾', '✨', '🌼'][Math.floor(Math.random() * 4)];
  el.style.left = (8 + Math.random() * 84) + '%';
  el.style.top = (22 + Math.random() * 50) + '%';
  stage.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

function spawnGpCollectPop(btn, meta) {
  const stage = document.getElementById('goldplains-stage');
  if (!stage || !btn) return;
  const r = btn.getBoundingClientRect();
  const sr = stage.getBoundingClientRect();
  const pop = document.createElement('div');
  pop.className = 'gp-collect-pop';
  pop.textContent = `+1 ${meta.emoji}${meta.label}`;
  pop.style.left = (r.left - sr.left + r.width / 2 - 20) + 'px';
  pop.style.top = (r.top - sr.top - 8) + 'px';
  stage.appendChild(pop);
  setTimeout(() => pop.remove(), 1100);
}

function onGoldPlainsItemClick(type, btn) {
  const meta = GP_PEARL_META[type];
  if (!meta) return;
  btn.classList.remove('pop');
  void btn.offsetWidth;
  btn.classList.add('pop');
  playGpItemSound(type);
  if (type === 'sun') {
    const sun = document.querySelector('.gp-sun');
    if (sun) {
      sun.style.filter = 'brightness(1.2)';
      setTimeout(() => { sun.style.filter = ''; }, 700);
    }
  }
  if (type === 'wheat') {
    const w = document.getElementById('gp-wheat');
    if (w) {
      w.style.transform = 'scale(1.02)';
      setTimeout(() => { w.style.transform = ''; }, 400);
    }
  }
  goldPlains.pearls[type] = (goldPlains.pearls[type] || 0) + 1;
  goldPlains.total += 1;
  saveGoldPlains();
  refreshGoldPlainsUI();
  checkAchievements();
  spawnGpCollectPop(btn, meta);
}

function openGoldPlainsScene() {
  loadGoldPlains();
  goldPlains.visited = true;
  saveGoldPlains();
  refreshGoldPlainsUI();
  buildGoldPlainsScenery();
  const overlay = document.getElementById('goldplains-overlay');
  document.getElementById('continent-overlay')?.classList.add('gp-hidden-during-plains');
  overlay.classList.remove('closing');
  overlay.classList.add('open', 'entering');
  startGoldPlainsAmbient();
  spawnGoldPlainsIdleFloat();
  setTimeout(() => overlay.classList.remove('entering'), 950);
}

function closeGoldPlainsScene() {
  const overlay = document.getElementById('goldplains-overlay');
  if (!overlay.classList.contains('open')) return;
  overlay.classList.remove('entering');
  overlay.classList.add('closing');
  stopGoldPlainsAmbient();
  document.getElementById('goldplains-stage')?.querySelectorAll('.gp-float, .gp-collect-pop').forEach(el => el.remove());
  setTimeout(() => {
    overlay.classList.remove('open', 'closing');
    overlay.style.opacity = '';
    document.getElementById('continent-overlay')?.classList.remove('gp-hidden-during-plains');
  }, 560);
}

function bindGoldPlainsControls() {
  document.querySelectorAll('.gp-item[data-gp]').forEach(btn => {
    if (btn.dataset.gpBound) return;
    btn.dataset.gpBound = '1';
    btn.addEventListener('click', () => onGoldPlainsItemClick(btn.dataset.gp, btn));
  });
  document.getElementById('goldplains-close')?.addEventListener('click', closeGoldPlainsScene);
}

// ── Bubble Farm 泡泡农场 ─────────────────────────────────────────────────
const FARM_STORAGE = 'bubbleRelief_bubbleFarm_v1';
const FARM_PLOT_COUNT = 9;
const FARM_GROW_MS = 12000;

const FARM_CROPS = {
  wheat:   { label: '泡麦', stages: ['', '🌱', '🌿', '🌾'], harvest: '🌾' },
  melon:   { label: '泡瓜', stages: ['', '🌱', '🍃', '🍉'], harvest: '🍉' },
  blossom: { label: '虹花', stages: ['', '🌱', '🌷', '🌸'], harvest: '🌸' },
};

const FARM_FOODS = {
  bread: { label: '泡麦包', icon: '🥖', coinValue: 18 },
  juice: { label: '泡瓜汁', icon: '🧃', coinValue: 14 },
  candy: { label: '虹花糖', icon: '🍬', coinValue: 14 },
  feast: { label: '泡宴盒', icon: '🍱', coinValue: 65 },
};

const FARM_RECIPES = [
  { id: 'bread', food: 'bread', cost: { wheat: 5 } },
  { id: 'juice', food: 'juice', cost: { melon: 3 } },
  { id: 'candy', food: 'candy', cost: { blossom: 3 } },
  { id: 'feast', food: 'feast', cost: { wheat: 5, melon: 5, blossom: 5 } },
];

const bubbleFarm = {
  plots: [],
  barn: { wheat: 0, melon: 0, blossom: 0 },
  pantry: { bread: 0, juice: 0, candy: 0, feast: 0 },
  selectedSeed: 'wheat',
  visited: false,
};

let fmGrowTimer = null;
let fmCloudTimer = null;

function defaultFarmPlots() {
  return Array.from({ length: FARM_PLOT_COUNT }, () => ({ crop: null, stage: 0, wet: false }));
}

function loadBubbleFarm() {
  try {
    const raw = localStorage.getItem(FARM_STORAGE);
    if (!raw) {
      bubbleFarm.plots = defaultFarmPlots();
      return;
    }
    const d = JSON.parse(raw);
    if (Array.isArray(d.plots) && d.plots.length === FARM_PLOT_COUNT) {
      bubbleFarm.plots = d.plots.map(p => ({
        crop: p.crop || null,
        stage: Math.min(3, Math.max(0, p.stage | 0)),
        wet: !!p.wet,
      }));
    } else {
      bubbleFarm.plots = defaultFarmPlots();
    }
    if (d.barn) Object.keys(bubbleFarm.barn).forEach(k => {
      bubbleFarm.barn[k] = Math.max(0, d.barn[k] | 0);
    });
    if (d.pantry) Object.keys(bubbleFarm.pantry).forEach(k => {
      bubbleFarm.pantry[k] = Math.max(0, d.pantry[k] | 0);
    });
    bubbleFarm.selectedSeed = FARM_CROPS[d.selectedSeed] ? d.selectedSeed : 'wheat';
    bubbleFarm.visited = !!d.visited;
  } catch (e) {
    bubbleFarm.plots = defaultFarmPlots();
  }
}

function saveBubbleFarm() {
  try {
    localStorage.setItem(FARM_STORAGE, JSON.stringify({
      plots: bubbleFarm.plots,
      barn: bubbleFarm.barn,
      pantry: bubbleFarm.pantry,
      selectedSeed: bubbleFarm.selectedSeed,
      visited: bubbleFarm.visited,
    }));
  } catch (e) {}
}

function farmPlotEmoji(plot) {
  if (!plot.crop || !FARM_CROPS[plot.crop]) return '⬜';
  return FARM_CROPS[plot.crop].stages[plot.stage] || '⬜';
}

function farmPlotHint(plot) {
  if (!plot.crop || plot.stage <= 0) return '空地';
  if (plot.stage >= 3) return '收获';
  return plot.wet ? '生长中' : '浇水';
}

function farmRecipeCostLabel(recipe) {
  return Object.entries(recipe.cost)
    .map(([crop, n]) => `${FARM_CROPS[crop].harvest}×${n}`)
    .join(' ');
}

function farmCanCraft(recipe) {
  return Object.entries(recipe.cost).every(([crop, n]) => (bubbleFarm.barn[crop] | 0) >= n);
}

function farmCraftFood(recipeId) {
  const recipe = FARM_RECIPES.find(r => r.id === recipeId);
  if (!recipe || !farmCanCraft(recipe)) return false;
  Object.entries(recipe.cost).forEach(([crop, n]) => {
    bubbleFarm.barn[crop] = Math.max(0, (bubbleFarm.barn[crop] | 0) - n);
  });
  bubbleFarm.pantry[recipe.food] = (bubbleFarm.pantry[recipe.food] | 0) + 1;
  saveBubbleFarm();
  refreshFarmUI();
  return true;
}

function farmSellAllFood() {
  let total = 0;
  Object.entries(bubbleFarm.pantry).forEach(([foodId, count]) => {
    const n = count | 0;
    if (n <= 0) return;
    const meta = FARM_FOODS[foodId];
    if (!meta) return;
    total += n * meta.coinValue;
    bubbleFarm.pantry[foodId] = 0;
  });
  if (total <= 0) return 0;
  saveBubbleFarm();
  addCoins(total, { pop: true });
  refreshFarmUI();
  syncCoinUI();
  return total;
}

function farmSellOneFood(foodId) {
  if ((bubbleFarm.pantry[foodId] | 0) <= 0) return 0;
  const meta = FARM_FOODS[foodId];
  if (!meta) return 0;
  bubbleFarm.pantry[foodId] -= 1;
  saveBubbleFarm();
  addCoins(meta.coinValue, { pop: true });
  refreshFarmUI();
  syncCoinUI();
  return meta.coinValue;
}

function renderFarmKitchen() {
  const recipesEl = document.getElementById('farm-recipes');
  const pantryBar = document.getElementById('farm-pantry-bar');
  if (!recipesEl) return;

  recipesEl.innerHTML = FARM_RECIPES.map(recipe => {
    const food = FARM_FOODS[recipe.food];
    const can = farmCanCraft(recipe);
    return `<button type="button" class="fm-recipe-btn${can ? '' : ' disabled'}" data-fm-recipe="${recipe.id}" ${can ? '' : 'disabled'} title="${can ? '加工' : '原料不够'}">
      <span class="fm-recipe-icon">${food.icon}</span>
      <span class="fm-recipe-name">${food.label}</span>
      <span class="fm-recipe-cost">${farmRecipeCostLabel(recipe)}</span>
      <span class="fm-recipe-coin">→ ${food.coinValue}💰</span>
    </button>`;
  }).join('');

  recipesEl.querySelectorAll('[data-fm-recipe]').forEach(btn => {
    if (btn.dataset.fmRecipeBound) return;
    btn.dataset.fmRecipeBound = '1';
    btn.addEventListener('click', () => {
      if (farmCraftFood(btn.dataset.fmRecipe)) {
        const food = FARM_FOODS[FARM_RECIPES.find(r => r.id === btn.dataset.fmRecipe)?.food];
        spawnFarmKitchenPop(food ? `+1 ${food.icon}${food.label}` : '加工完成');
      }
    });
  });

  if (pantryBar) {
    const parts = Object.entries(bubbleFarm.pantry)
      .filter(([, n]) => n > 0)
      .map(([id, n]) => `${FARM_FOODS[id]?.icon || '?'}${n}`);
    pantryBar.textContent = parts.length ? `成品 · ${parts.join(' ')}` : '成品 · 空';
  }

  const sellAll = document.getElementById('farm-sell-all');
  if (sellAll) {
    const hasFood = Object.values(bubbleFarm.pantry).some(n => (n | 0) > 0);
    sellAll.disabled = !hasFood;
  }
}

function spawnFarmKitchenPop(text) {
  const stage = document.getElementById('farm-kitchen');
  if (!stage) return;
  const pop = document.createElement('div');
  pop.className = 'fm-harvest-pop fm-kitchen-pop';
  pop.textContent = text;
  pop.style.left = '50%';
  pop.style.top = '8px';
  pop.style.transform = 'translateX(-50%)';
  stage.appendChild(pop);
  setTimeout(() => pop.remove(), 1000);
}

function refreshFarmUI() {
  const bar = document.getElementById('farm-barn-bar');
  if (bar) {
    const parts = Object.entries(bubbleFarm.barn)
      .filter(([, n]) => n > 0)
      .map(([k, n]) => `${FARM_CROPS[k].harvest}${n}`);
    bar.textContent = parts.length ? `仓库 · ${parts.join(' ')}` : '仓库 · 空';
  }
  document.getElementById('continent-farm-btn')?.classList.toggle('visited', bubbleFarm.visited);
  document.querySelectorAll('.fm-seed-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.fmSeed === bubbleFarm.selectedSeed);
  });
  renderFarmGrid();
  renderFarmKitchen();
}

function renderFarmGrid() {
  const grid = document.getElementById('farm-grid');
  if (!grid) return;
  grid.innerHTML = '';
  bubbleFarm.plots.forEach((plot, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fm-plot';
    if (plot.wet && plot.stage > 0 && plot.stage < 3) btn.classList.add('wet');
    if (plot.stage >= 3) btn.classList.add('ready');
    btn.dataset.fmPlot = String(idx);
    btn.innerHTML = `<span>${farmPlotEmoji(plot)}</span><span class="fm-plot-label">${farmPlotHint(plot)}</span>`;
    btn.addEventListener('click', () => onFarmPlotClick(idx, btn));
    grid.appendChild(btn);
  });
}

function spawnFarmHarvestPop(btn, text) {
  const stage = document.getElementById('farm-stage');
  if (!stage || !btn) return;
  const r = btn.getBoundingClientRect();
  const sr = stage.getBoundingClientRect();
  const pop = document.createElement('div');
  pop.className = 'fm-harvest-pop';
  pop.textContent = text;
  pop.style.left = (r.left - sr.left + r.width / 2 - 24) + 'px';
  pop.style.top = (r.top - sr.top - 6) + 'px';
  stage.appendChild(pop);
  setTimeout(() => pop.remove(), 1000);
}

function onFarmPlotClick(idx, btn) {
  const plot = bubbleFarm.plots[idx];
  if (!plot) return;

  if (!plot.crop || plot.stage <= 0) {
    plot.crop = bubbleFarm.selectedSeed;
    plot.stage = 1;
    plot.wet = false;
    saveBubbleFarm();
    refreshFarmUI();
    spawnFarmHarvestPop(btn, `种下${FARM_CROPS[plot.crop].label}`);
    return;
  }

  if (plot.stage >= 3) {
    bubbleFarm.barn[plot.crop] = (bubbleFarm.barn[plot.crop] | 0) + 1;
    const crop = plot.crop;
    plot.crop = null;
    plot.stage = 0;
    plot.wet = false;
    saveBubbleFarm();
    recordFarmHarvest();
    refreshFarmUI();
    spawnFarmHarvestPop(btn, `+1 ${FARM_CROPS[crop].harvest}`);
    return;
  }

  if (!plot.wet) {
    plot.wet = true;
    saveBubbleFarm();
    refreshFarmUI();
    spawnFarmHarvestPop(btn, '💧 浇水');
    return;
  }

  if (plot.stage < 3) {
    plot.stage += 1;
    plot.wet = plot.stage < 3 ? false : true;
    saveBubbleFarm();
    refreshFarmUI();
  }
}

function tickFarmGrowth() {
  let changed = false;
  bubbleFarm.plots.forEach(plot => {
    if (!plot.crop || plot.stage <= 0 || plot.stage >= 3) return;
    if (!plot.wet) return;
    plot.stage += 1;
    plot.wet = plot.stage < 3 ? false : true;
    changed = true;
  });
  if (changed) {
    saveBubbleFarm();
    if (document.getElementById('farm-overlay')?.classList.contains('open')) refreshFarmUI();
  }
}

function buildFarmScenery() {
  const scenery = document.getElementById('fm-scenery');
  if (!scenery || scenery.dataset.built) return;
  scenery.dataset.built = '1';
  for (let i = 0; i < 3; i++) {
    const cloud = document.createElement('div');
    cloud.className = 'fm-cloud';
    cloud.textContent = '☁️';
    cloud.style.top = (8 + i * 14) + '%';
    cloud.style.animationDuration = (38 + i * 12) + 's';
    cloud.style.animationDelay = (-i * 14) + 's';
    scenery.appendChild(cloud);
  }
}

function startFarmAmbient() {
  stopFarmAmbient();
  fmGrowTimer = setInterval(tickFarmGrowth, FARM_GROW_MS);
  fmCloudTimer = setInterval(() => {
    if (!document.getElementById('farm-overlay')?.classList.contains('open')) return;
    buildFarmScenery();
  }, 1000);
}

function stopFarmAmbient() {
  if (fmGrowTimer) { clearInterval(fmGrowTimer); fmGrowTimer = null; }
  if (fmCloudTimer) { clearInterval(fmCloudTimer); fmCloudTimer = null; }
}

function openFarmScene() {
  loadBubbleFarm();
  if (!bubbleFarm.plots.length) bubbleFarm.plots = defaultFarmPlots();
  bubbleFarm.visited = true;
  saveBubbleFarm();
  refreshFarmUI();
  buildFarmScenery();
  const overlay = document.getElementById('farm-overlay');
  document.getElementById('continent-overlay')?.classList.add('fm-hidden-during-farm');
  overlay.classList.remove('closing');
  overlay.classList.add('open', 'entering');
  startFarmAmbient();
  setTimeout(() => overlay.classList.remove('entering'), 950);
}

function closeFarmScene() {
  const overlay = document.getElementById('farm-overlay');
  if (!overlay.classList.contains('open')) return;
  overlay.classList.remove('entering');
  overlay.classList.add('closing');
  stopFarmAmbient();
  document.getElementById('farm-stage')?.querySelectorAll('.fm-harvest-pop').forEach(el => el.remove());
  setTimeout(() => {
    overlay.classList.remove('open', 'closing');
    overlay.style.opacity = '';
    document.getElementById('continent-overlay')?.classList.remove('fm-hidden-during-farm');
  }, 560);
}

function bindFarmControls() {
  document.querySelectorAll('.fm-seed-btn[data-fm-seed]').forEach(btn => {
    if (btn.dataset.fmSeedBound) return;
    btn.dataset.fmSeedBound = '1';
    btn.addEventListener('click', () => {
      bubbleFarm.selectedSeed = btn.dataset.fmSeed;
      saveBubbleFarm();
      refreshFarmUI();
    });
  });
  document.getElementById('farm-close')?.addEventListener('click', closeFarmScene);
  const sellAll = document.getElementById('farm-sell-all');
  if (sellAll && !sellAll.dataset.fmSellBound) {
    sellAll.dataset.fmSellBound = '1';
    sellAll.addEventListener('click', () => {
      const got = farmSellAllFood();
      if (got > 0) spawnFarmKitchenPop(`+${got} 💰 戳泡金币`);
    });
  }
  document.getElementById('farm-pantry-bar')?.addEventListener('click', e => {
    if (!e.target.closest('#farm-pantry-bar')) return;
    const parts = Object.entries(bubbleFarm.pantry).filter(([, n]) => n > 0);
    if (!parts.length) return;
    const [foodId] = parts[0];
    const got = farmSellOneFood(foodId);
    if (got > 0) spawnFarmKitchenPop(`+${got} 💰`);
  });
}

// ── Bubble Pet 泡宠 ─────────────────────────────────────────────────────
const PET_STORAGE = 'bubbleRelief_bubblePet_v4';
const PET_MEET_TOKENS_START = 8;
const PET_MEET_TRUST_GOAL = 100;
const PET_MEET_RESONANCE_HIT = 25;
const PET_MEET_MAX_TRIES = 8;
const PET_MEET_COLORS = {
  pink: { label: '粉泡', orbClass: 'pm-orb-pink' },
  blue: { label: '蓝泡', orbClass: 'pm-orb-blue' },
  gold: { label: '金泡', orbClass: 'pm-orb-gold' },
};
const PET_EXP_PER_LEVEL = 50;
const PET_BOND_FOLLOW_MIN = 35;
const PET_GROW_LEVEL = 5;

const PET_SPECIES = {
  bubbleCat:     { name: '泡喵', trait: '爱蹭人的小泡爪' },
  bubbleDog:     { name: '泡汪', trait: '摇尾泡泡超热情' },
  bubbleBunny:   { name: '泡兔', trait: '蹦跳时带小彩虹' },
  bubbleDuck:    { name: '泡鸭', trait: '嘎嘎叫也软乎乎' },
  bubbleBear:    { name: '泡熊', trait: '抱抱像云朵' },
  bubbleFox:     { name: '泡狐', trait: '尾巴尖会闪光' },
  bubblePanda:   { name: '泡熊猫', trait: '慢吞吞超治愈' },
  bubblePenguin: { name: '泡企鹅', trait: '滑行留下小泡痕' },
  bubbleFrog:    { name: '泡蛙', trait: '荷叶上打盹' },
  bubbleOwl:     { name: '泡枭', trait: '夜里眨眨眼' },
  bubblePig:     { name: '泡猪', trait: '哼唧也可爱' },
  bubbleFish:    { name: '泡鱼', trait: '吐圈圈的游泳家' },
};

function petMoodKey(mood) {
  if (mood < 30) return 'sad';
  if (mood >= 80) return 'happy';
  return 'normal';
}

function buildPetBubbleShell(uid) {
  return `
    <defs>
      <radialGradient id="ptBg${uid}" cx="34%" cy="28%" r="68%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.92"/>
        <stop offset="42%" stop-color="#b3e5fc" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#0288d1" stop-opacity="0.18"/>
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="46" fill="url(#ptBg${uid})" stroke="#ffffff" stroke-width="2.5" opacity="0.92"/>
    <ellipse cx="36" cy="34" rx="14" ry="8" fill="#ffffff" opacity="0.55" transform="rotate(-18 36 34)"/>
    <circle cx="62" cy="64" r="3" fill="#ffffff" opacity="0.25"/>
    <circle cx="70" cy="52" r="2" fill="#ffffff" opacity="0.2"/>`;
}

function buildPetFaceEyes(mood) {
  if (mood === 'happy') {
    return `
      <path d="M38 52 Q42 48 46 52" fill="none" stroke="#4e342e" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M54 52 Q58 48 62 52" fill="none" stroke="#4e342e" stroke-width="2.2" stroke-linecap="round"/>`;
  }
  if (mood === 'sad') {
    return `
      <ellipse cx="42" cy="54" rx="3.5" ry="4.5" fill="#4e342e"/>
      <ellipse cx="58" cy="54" rx="3.5" ry="4.5" fill="#4e342e"/>
      <path d="M40 50 Q42 48 44 50" fill="none" stroke="#fff" stroke-width="1"/>
      <path d="M56 50 Q58 48 60 50" fill="none" stroke="#fff" stroke-width="1"/>`;
  }
  return `
    <ellipse cx="42" cy="52" rx="4" ry="5" fill="#4e342e"/>
    <ellipse cx="58" cy="52" rx="4" ry="5" fill="#4e342e"/>
    <circle cx="43.5" cy="50.5" r="1.4" fill="#fff"/>
    <circle cx="59.5" cy="50.5" r="1.4" fill="#fff"/>`;
}

function buildBubblePetBody(species, mood) {
  const eyes = buildPetFaceEyes(mood);
  if (species === 'bubbleCat') {
    return `
      <g class="pt-creature pt-cat">
        <polygon points="31,40 27,20 41,34" fill="#fb8c00"/>
        <polygon points="69,40 73,20 59,34" fill="#fb8c00"/>
        <polygon points="33,38 30,26 39,34" fill="#ffcc80"/>
        <polygon points="67,38 70,26 61,34" fill="#ffcc80"/>
        <ellipse cx="50" cy="56" rx="23" ry="21" fill="#ffb74d"/>
        ${eyes}
        <polygon points="50,60 47,64 53,64" fill="#f48fb1"/>
        <path d="M50 64 Q46 68 42 66" fill="none" stroke="#6d4c41" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M50 64 Q54 68 58 66" fill="none" stroke="#6d4c41" stroke-width="1.2" stroke-linecap="round"/>
        <line x1="26" y1="56" x2="36" y2="58" stroke="#6d4c41" stroke-width="0.9"/>
        <line x1="26" y1="60" x2="36" y2="60" stroke="#6d4c41" stroke-width="0.9"/>
        <line x1="64" y1="58" x2="74" y2="56" stroke="#6d4c41" stroke-width="0.9"/>
        <line x1="64" y1="60" x2="74" y2="60" stroke="#6d4c41" stroke-width="0.9"/>
      </g>`;
  }
  if (species === 'bubbleDog') {
    return `
      <g class="pt-creature pt-dog">
        <ellipse cx="28" cy="48" rx="10" ry="16" fill="#8d6e63" transform="rotate(-18 28 48)"/>
        <ellipse cx="72" cy="48" rx="10" ry="16" fill="#8d6e63" transform="rotate(18 72 48)"/>
        <ellipse cx="50" cy="56" rx="24" ry="22" fill="#bcaaa4"/>
        <ellipse cx="50" cy="62" rx="16" ry="14" fill="#efebe9"/>
        ${eyes}
        <ellipse cx="50" cy="63" rx="7" ry="5" fill="#fff"/>
        <ellipse cx="50" cy="64" rx="4.5" ry="3" fill="#4e342e"/>
        ${mood === 'happy' ? '<ellipse cx="50" cy="70" rx="5" ry="3.5" fill="#ef5350"/>' : ''}
      </g>`;
  }
  if (species === 'bubbleBunny') {
    return `
      <g class="pt-creature pt-bunny">
        <ellipse cx="38" cy="28" rx="8" ry="20" fill="#fff" stroke="#e1bee7" stroke-width="1.2"/>
        <ellipse cx="62" cy="28" rx="8" ry="20" fill="#fff" stroke="#e1bee7" stroke-width="1.2"/>
        <ellipse cx="38" cy="28" rx="4.5" ry="14" fill="#f8bbd0"/>
        <ellipse cx="62" cy="28" rx="4.5" ry="14" fill="#f8bbd0"/>
        <ellipse cx="50" cy="58" rx="22" ry="20" fill="#fafafa" stroke="#e0e0e0" stroke-width="1"/>
        ${eyes}
        <ellipse cx="50" cy="62" rx="4" ry="3" fill="#f48fb1"/>
        <line x1="46" y1="64" x2="44" y2="66" stroke="#9e9e9e" stroke-width="0.8"/>
        <line x1="54" y1="64" x2="56" y2="66" stroke="#9e9e9e" stroke-width="0.8"/>
        <circle cx="36" cy="66" r="5" fill="#fce4ec" opacity="0.65"/>
        <circle cx="64" cy="66" r="5" fill="#fce4ec" opacity="0.65"/>
      </g>`;
  }
  if (species === 'bubbleDuck') {
    return `
      <g class="pt-creature pt-duck">
        <ellipse cx="50" cy="58" rx="24" ry="22" fill="#fff176"/>
        <ellipse cx="50" cy="62" rx="18" ry="14" fill="#ffee58"/>
        ${eyes}
        <ellipse cx="50" cy="66" rx="11" ry="7" fill="#ff9800"/>
        <ellipse cx="50" cy="65" rx="8" ry="4.5" fill="#ffb74d"/>
        <path d="M66 58 Q74 52 78 58 Q74 64 66 62 Z" fill="#fdd835" stroke="#f9a825" stroke-width="0.8"/>
        <path d="M34 72 Q50 78 66 72 L62 76 Q50 82 38 76 Z" fill="#ff9800"/>
      </g>`;
  }
  if (species === 'bubbleBear') {
    return `
      <g class="pt-creature pt-bear">
        <circle cx="30" cy="36" r="11" fill="#8d6e63"/>
        <circle cx="70" cy="36" r="11" fill="#8d6e63"/>
        <circle cx="30" cy="36" r="6" fill="#bcaaa4"/>
        <circle cx="70" cy="36" r="6" fill="#bcaaa4"/>
        <ellipse cx="50" cy="58" rx="26" ry="24" fill="#a1887f"/>
        <ellipse cx="50" cy="64" rx="16" ry="13" fill="#d7ccc8"/>
        ${eyes}
        <ellipse cx="50" cy="66" rx="8" ry="6" fill="#efebe9"/>
        <ellipse cx="50" cy="67" rx="5" ry="3.5" fill="#6d4c41"/>
      </g>`;
  }
  if (species === 'bubbleFox') {
    return `
      <g class="pt-creature pt-fox">
        <polygon points="28,42 22,18 38,34" fill="#e65100"/>
        <polygon points="72,42 78,18 62,34" fill="#e65100"/>
        <polygon points="30,40 26,26 36,34" fill="#fff3e0"/>
        <polygon points="70,40 74,26 64,34" fill="#fff3e0"/>
        <ellipse cx="50" cy="58" rx="22" ry="20" fill="#ff9800"/>
        <ellipse cx="50" cy="64" rx="14" ry="11" fill="#fff8e1"/>
        ${eyes}
        <ellipse cx="50" cy="66" rx="5" ry="3.5" fill="#4e342e"/>
        <path d="M50 68 L47 72 L53 72 Z" fill="#fff"/>
      </g>`;
  }
  if (species === 'bubblePanda') {
    return `
      <g class="pt-creature pt-panda">
        <circle cx="30" cy="34" r="10" fill="#212121"/>
        <circle cx="70" cy="34" r="10" fill="#212121"/>
        <ellipse cx="50" cy="58" rx="24" ry="22" fill="#fff"/>
        <ellipse cx="38" cy="54" rx="7" ry="8" fill="#212121"/>
        <ellipse cx="62" cy="54" rx="7" ry="8" fill="#212121"/>
        ${mood === 'happy'
          ? '<path d="M35 54 Q38 50 41 54" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M59 54 Q62 50 65 54" fill="none" stroke="#fff" stroke-width="1.5"/>'
          : mood === 'sad'
            ? '<ellipse cx="38" cy="56" rx="2.5" ry="3" fill="#fff"/><ellipse cx="62" cy="56" rx="2.5" ry="3" fill="#fff"/>'
            : '<circle cx="38" cy="54" r="2" fill="#fff"/><circle cx="62" cy="54" r="2" fill="#fff"/>'}
        <ellipse cx="50" cy="66" rx="6" ry="4.5" fill="#f5f5f5" stroke="#bdbdbd" stroke-width="0.8"/>
        <ellipse cx="50" cy="67" rx="3.5" ry="2.5" fill="#424242"/>
      </g>`;
  }
  if (species === 'bubblePenguin') {
    return `
      <g class="pt-creature pt-penguin">
        <ellipse cx="50" cy="58" rx="22" ry="24" fill="#37474f"/>
        <ellipse cx="50" cy="62" rx="14" ry="18" fill="#fff"/>
        ${eyes}
        <ellipse cx="50" cy="66" rx="7" ry="5" fill="#ff9800"/>
        <ellipse cx="50" cy="65" rx="5" ry="3" fill="#ffb74d"/>
        <ellipse cx="36" cy="72" rx="6" ry="3" fill="#ff9800" transform="rotate(-20 36 72)"/>
        <ellipse cx="64" cy="72" rx="6" ry="3" fill="#ff9800" transform="rotate(20 64 72)"/>
      </g>`;
  }
  if (species === 'bubbleFrog') {
    return `
      <g class="pt-creature pt-frog">
        <ellipse cx="50" cy="60" rx="24" ry="20" fill="#66bb6a"/>
        <circle cx="36" cy="46" r="10" fill="#fff"/>
        <circle cx="64" cy="46" r="10" fill="#fff"/>
        ${mood === 'happy'
          ? '<path d="M32 46 Q36 42 40 46" fill="none" stroke="#2e7d32" stroke-width="2"/><path d="M60 46 Q64 42 68 46" fill="none" stroke="#2e7d32" stroke-width="2"/>'
          : '<circle cx="36" cy="46" r="4" fill="#1b5e20"/><circle cx="64" cy="46" r="4" fill="#1b5e20"/><circle cx="37" cy="44" r="1.5" fill="#fff"/><circle cx="65" cy="44" r="1.5" fill="#fff"/>'}
        <path d="M42 66 Q50 72 58 66" fill="none" stroke="#2e7d32" stroke-width="1.5" stroke-linecap="round"/>
        <ellipse cx="50" cy="64" rx="8" ry="4" fill="#43a047"/>
      </g>`;
  }
  if (species === 'bubbleOwl') {
    return `
      <g class="pt-creature pt-owl">
        <polygon points="34,28 38,18 42,28" fill="#6d4c41"/>
        <polygon points="58,28 62,18 66,28" fill="#6d4c41"/>
        <ellipse cx="50" cy="58" rx="24" ry="22" fill="#8d6e63"/>
        <ellipse cx="50" cy="58" rx="18" ry="16" fill="#efebe9"/>
        ${mood === 'happy'
          ? '<path d="M40 54 Q44 50 48 54" fill="none" stroke="#4e342e" stroke-width="2"/><path d="M52 54 Q56 50 60 54" fill="none" stroke="#4e342e" stroke-width="2"/>'
          : '<circle cx="42" cy="54" r="7" fill="#fff" stroke="#5d4037" stroke-width="1"/><circle cx="58" cy="54" r="7" fill="#fff" stroke="#5d4037" stroke-width="1"/><circle cx="42" cy="54" r="3" fill="#3e2723"/><circle cx="58" cy="54" r="3" fill="#3e2723"/>'}
        <polygon points="50,62 47,68 53,68" fill="#ff9800"/>
      </g>`;
  }
  if (species === 'bubblePig') {
    return `
      <g class="pt-creature pt-pig">
        <ellipse cx="28" cy="40" rx="8" ry="10" fill="#f48fb1" transform="rotate(-25 28 40)"/>
        <ellipse cx="72" cy="40" rx="8" ry="10" fill="#f48fb1" transform="rotate(25 72 40)"/>
        <ellipse cx="50" cy="58" rx="24" ry="22" fill="#f8bbd0"/>
        ${eyes}
        <ellipse cx="50" cy="66" rx="12" ry="9" fill="#f48fb1" stroke="#ec407a" stroke-width="0.8"/>
        <ellipse cx="47" cy="66" rx="2" ry="3" fill="#c2185b"/>
        <ellipse cx="53" cy="66" rx="2" ry="3" fill="#c2185b"/>
        <path d="M68 68 Q72 64 74 68 Q72 72 68 70" fill="none" stroke="#ec407a" stroke-width="1.5" stroke-linecap="round"/>
      </g>`;
  }
  if (species === 'bubbleFish') {
    return `
      <g class="pt-creature pt-fish">
        <ellipse cx="48" cy="56" rx="20" ry="16" fill="#ff7043"/>
        <path d="M68 56 L82 44 L82 68 Z" fill="#ff5722"/>
        <path d="M34 50 Q28 44 32 56 Q28 68 34 62" fill="#ffab91"/>
        ${eyes}
        <path d="M40 56 Q48 52 56 56" fill="none" stroke="#bf360c" stroke-width="1" opacity="0.5"/>
        <circle cx="30" cy="52" r="3" fill="#fff" opacity="0.35"/>
        <circle cx="26" cy="60" r="2" fill="#fff" opacity="0.25"/>
      </g>`;
  }
  return '';
}

function buildBubblePetSvg(species, mood = 'normal') {
  const uid = species + '_' + (Math.random().toString(36).slice(2, 8));
  return `<svg class="pt-pet-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    ${buildPetBubbleShell(uid)}
    ${buildBubblePetBody(species, mood)}
  </svg>`;
}

function buildPetHubIconSvg() {
  return `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="24" cy="24" r="20" fill="#fce4ec" stroke="#fff" stroke-width="1.5"/>
    <ellipse cx="18" cy="18" rx="6" ry="3.5" fill="#fff" opacity="0.65"/>
    <ellipse cx="17" cy="27" rx="4.5" ry="5" fill="#880e4f"/>
    <ellipse cx="31" cy="27" rx="4.5" ry="5" fill="#880e4f"/>
    <ellipse cx="24" cy="33" rx="5.5" ry="4" fill="#ec407a"/>
    <circle cx="18.5" cy="25.5" r="1" fill="#fff"/>
    <circle cx="32.5" cy="25.5" r="1" fill="#fff"/>
    <path d="M14 31 C16 28 20 28 24 30 C28 28 32 28 34 31" fill="none" stroke="#880e4f" stroke-width="1.4" stroke-linecap="round"/>
  </svg>`;
}

function buildPetActionSvg(action) {
  if (action === 'feed') {
    return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="16" cy="24" rx="10" ry="3" fill="#bcaaa4" opacity="0.55"/>
      <path d="M8 22 L8 14 Q16 8 24 14 L24 22 Z" fill="#8d6e63" stroke="#5d4037" stroke-width="1"/>
      <ellipse cx="16" cy="14" rx="8" ry="5" fill="#ffcc80"/>
      <circle cx="13" cy="13" r="1.2" fill="#fff3e0"/>
      <circle cx="18" cy="12" r="1" fill="#fff3e0"/>
    </svg>`;
  }
  if (action === 'play') {
    return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="16" cy="16" r="10" fill="#66bb6a" stroke="#2e7d32" stroke-width="1.2"/>
      <path d="M10 16 Q16 10 22 16 Q16 22 10 16" fill="#a5d6a7" opacity="0.65"/>
      <path d="M16 8 L18 14 L24 14 L19 18 L21 24 L16 20 L11 24 L13 18 L8 14 L14 14 Z" fill="none" stroke="#fff" stroke-width="0.8" opacity="0.5"/>
    </svg>`;
  }
  if (action === 'bath') {
    return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6 20 L26 20 L24 26 L8 26 Z" fill="#81d4fa" stroke="#0288d1" stroke-width="1"/>
      <path d="M8 20 Q16 12 24 20" fill="#4fc3f7" stroke="#0288d1" stroke-width="1"/>
      <circle cx="12" cy="14" r="2" fill="#fff" opacity="0.75"/>
      <circle cx="18" cy="11" r="1.6" fill="#fff" opacity="0.65"/>
      <circle cx="22" cy="15" r="1.4" fill="#fff" opacity="0.55"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M8 18 Q16 8 24 18" fill="#5c6bc0" stroke="#3949ab" stroke-width="1"/>
    <circle cx="22" cy="10" r="2" fill="#fffde7"/>
    <text x="10" y="28" font-size="7" font-weight="700" fill="#880e4f">Zzz</text>
  </svg>`;
}

function renderPetAlbumGrid() {
  const grid = document.getElementById('pet-album-grid');
  const countEl = document.getElementById('pet-home-count');
  if (countEl) countEl.textContent = String(bubblePet.homeSpecies.length);
  if (!grid) return;
  grid.innerHTML = Object.entries(PET_SPECIES).map(([id, spec]) => {
    const atHome = isPetAtHome(id);
    const isActive = bubblePet.activeSpecies === id;
    const isBonded = bubblePet.bondedSpecies.includes(id);
    const known = atHome || isBonded || bubblePet.metSpecies.includes(id);
    let badge = '未结识';
    if (isActive) badge = '照料中';
    else if (atHome) badge = '在家';
    else if (isBonded) badge = '已结缘';
    else if (known) badge = '已结识';
    let action = '';
    if (isBonded && !atHome) {
      action = `<button type="button" class="pt-album-act pt-album-act-green" data-pt-album-act="home">带回家</button>`;
    } else if (atHome && !isActive) {
      action = `<button type="button" class="pt-album-act" data-pt-album-act="switch">切换照料</button>`;
    }
    const cls = [
      'pt-album-card',
      isActive ? 'pt-album-active' : '',
      atHome ? 'pt-album-home' : '',
      isBonded && !atHome ? 'pt-album-partner' : '',
      known ? '' : 'pt-album-unknown',
    ].filter(Boolean).join(' ');
    return `<div class="${cls}" data-pt-album="${id}">
      <span class="pt-album-art"></span>
      <span class="pt-album-name">${spec.name}</span>
      <span class="pt-album-badge">${badge}</span>
      ${action}
    </div>`;
  }).join('');
  grid.querySelectorAll('.pt-album-card[data-pt-album]').forEach(card => {
    const art = card.querySelector('.pt-album-art');
    const id = card.dataset.ptAlbum;
    if (art && id) art.innerHTML = buildBubblePetSvg(id, 'normal');
  });
}

function markPetSpeciesMet(speciesId) {
  if (!PET_SPECIES[speciesId]) return;
  if (!bubblePet.metSpecies.includes(speciesId)) {
    bubblePet.metSpecies.push(speciesId);
    saveBubblePet();
  }
}

function markAllPetSpeciesMet() {
  let changed = false;
  Object.keys(PET_SPECIES).forEach(id => {
    if (!bubblePet.metSpecies.includes(id)) {
      bubblePet.metSpecies.push(id);
      changed = true;
    }
  });
  if (changed) saveBubblePet();
}

function initPetVisuals() {
  const hub = document.querySelector('#continent-pet-btn .cp-icon');
  if (hub && !hub.dataset.ptBuilt) {
    hub.dataset.ptBuilt = '1';
    hub.innerHTML = buildPetHubIconSvg();
  }
  const meetHub = document.querySelector('#continent-meet-btn .cm-icon');
  if (meetHub && !meetHub.dataset.pmBuilt) {
    meetHub.dataset.pmBuilt = '1';
    meetHub.innerHTML = buildMeetHubIconSvg();
  }
  const pmStartArt = document.getElementById('pm-start-art');
  if (pmStartArt && !pmStartArt.dataset.pmBuilt) {
    pmStartArt.dataset.pmBuilt = '1';
    pmStartArt.innerHTML = buildMeetJarSvg();
  }
  document.querySelectorAll('.pt-act-btn[data-pt-act]').forEach(btn => {
    const icon = btn.querySelector('.pt-act-icon');
    if (icon && !icon.dataset.ptBuilt) {
      icon.dataset.ptBuilt = '1';
      icon.innerHTML = buildPetActionSvg(btn.dataset.ptAct);
    }
  });
}

function renderPetStageArt(species, mood) {
  const home = document.getElementById('pet-bubble-home');
  if (!home || !species) return;
  home.innerHTML = buildBubblePetSvg(species, petMoodKey(mood));
  const svg = home.querySelector('svg');
  if (svg) svg.classList.add('pt-pet-stage-svg');
}

const PET_ACTION_LABELS = {
  feed: '+饱食',
  play: '+心情',
  bath: '+清洁',
  sleep: '+活力',
};

const bubblePet = {
  visited: false,
  hasPet: false,
  species: null,
  hunger: 80,
  mood: 80,
  energy: 80,
  bond: 50,
  level: 1,
  exp: 0,
  lastTick: Date.now(),
  metSpecies: [],
  bondedSpecies: [],
  homeSpecies: [],
  activeSpecies: null,
  petProfiles: {},
  meetTokens: PET_MEET_TOKENS_START,
  meetVisited: false,
};

let petUiTimer = null;
let petPatCooldown = 0;
let petActiveTab = 'care';

function clampPetStat(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function defaultPetProfile() {
  return {
    hunger: 85,
    mood: 90,
    energy: 85,
    bond: 55,
    level: 1,
    exp: 0,
    lastTick: Date.now(),
  };
}

function isPetAtHome(speciesId) {
  return bubblePet.homeSpecies.includes(speciesId);
}

function getPetProfile(speciesId, create = false) {
  if (!PET_SPECIES[speciesId]) return null;
  if (!bubblePet.petProfiles[speciesId]) {
    if (!create) return null;
    bubblePet.petProfiles[speciesId] = defaultPetProfile();
  }
  return bubblePet.petProfiles[speciesId];
}

function getActivePetProfile() {
  if (!bubblePet.activeSpecies) return null;
  return getPetProfile(bubblePet.activeSpecies);
}

function syncBubblePetLegacyFields() {
  bubblePet.hasPet = bubblePet.homeSpecies.length > 0;
  bubblePet.species = bubblePet.activeSpecies;
  const p = getActivePetProfile();
  if (!p) return;
  bubblePet.hunger = p.hunger;
  bubblePet.mood = p.mood;
  bubblePet.energy = p.energy;
  bubblePet.bond = p.bond;
  bubblePet.level = p.level;
  bubblePet.exp = p.exp;
  bubblePet.lastTick = p.lastTick;
}

function migrateBubblePetData(d) {
  bubblePet.visited = !!d.visited;
  bubblePet.metSpecies = Array.isArray(d.metSpecies) ? d.metSpecies.filter(id => PET_SPECIES[id]) : [];
  bubblePet.bondedSpecies = Array.isArray(d.bondedSpecies) ? d.bondedSpecies.filter(id => PET_SPECIES[id]) : [];
  bubblePet.meetTokens = Math.max(0, d.meetTokens ?? PET_MEET_TOKENS_START);
  bubblePet.meetVisited = !!d.meetVisited;
  bubblePet.petProfiles = {};
  bubblePet.homeSpecies = [];
  bubblePet.activeSpecies = null;

  if (d.petProfiles && typeof d.petProfiles === 'object') {
    Object.entries(d.petProfiles).forEach(([id, prof]) => {
      if (!PET_SPECIES[id] || !prof) return;
      bubblePet.petProfiles[id] = {
        hunger: clampPetStat(prof.hunger ?? 80),
        mood: clampPetStat(prof.mood ?? 80),
        energy: clampPetStat(prof.energy ?? 80),
        bond: clampPetStat(prof.bond ?? 50),
        level: Math.max(1, prof.level | 0),
        exp: Math.max(0, prof.exp | 0),
        lastTick: prof.lastTick || Date.now(),
      };
    });
  }
  if (Array.isArray(d.homeSpecies)) {
    bubblePet.homeSpecies = d.homeSpecies.filter(id => PET_SPECIES[id]);
    bubblePet.homeSpecies.forEach(id => {
      if (!bubblePet.petProfiles[id]) getPetProfile(id, true);
    });
  }
  if (PET_SPECIES[d.activeSpecies]) bubblePet.activeSpecies = d.activeSpecies;

  if (!bubblePet.homeSpecies.length && d.hasPet && PET_SPECIES[d.species]) {
    const id = d.species;
    bubblePet.petProfiles[id] = {
      hunger: clampPetStat(d.hunger ?? 80),
      mood: clampPetStat(d.mood ?? 80),
      energy: clampPetStat(d.energy ?? 80),
      bond: clampPetStat(d.bond ?? 50),
      level: Math.max(1, d.level | 0),
      exp: Math.max(0, d.exp | 0),
      lastTick: d.lastTick || Date.now(),
    };
    bubblePet.homeSpecies = [id];
    bubblePet.activeSpecies = id;
    if (!bubblePet.bondedSpecies.includes(id)) bubblePet.bondedSpecies.push(id);
  }

  bubblePet.homeSpecies = bubblePet.homeSpecies.filter(id => !!bubblePet.petProfiles[id]);
  if (bubblePet.activeSpecies && !isPetAtHome(bubblePet.activeSpecies)) {
    bubblePet.activeSpecies = bubblePet.homeSpecies[0] || null;
  }
  if (!bubblePet.activeSpecies && bubblePet.homeSpecies.length) {
    bubblePet.activeSpecies = bubblePet.homeSpecies[0];
  }
  syncBubblePetLegacyFields();
}

function bringPetHome(speciesId, opts = {}) {
  const quiet = !!opts.quiet;
  if (!PET_SPECIES[speciesId]) return false;
  if (!bubblePet.bondedSpecies.includes(speciesId)) {
    if (!quiet) showToast('要先在泡缘野地结缘', '#00838f');
    return false;
  }
  const wasHome = isPetAtHome(speciesId);
  if (!wasHome) {
    bubblePet.homeSpecies.push(speciesId);
    getPetProfile(speciesId, true);
  }
  if (opts.makeActive === true || (!bubblePet.activeSpecies && opts.makeActive !== false)) {
    bubblePet.activeSpecies = speciesId;
  }
  markPetSpeciesMet(speciesId);
  syncBubblePetLegacyFields();
  saveBubblePet();
  if (!quiet) {
    showToast(
      wasHome ? `${PET_SPECIES[speciesId].name} 本来就在家呀` : `${PET_SPECIES[speciesId].name} 来家里一起养了`,
      '#ec407a'
    );
  }
  return true;
}

function switchActivePet(speciesId) {
  if (!PET_SPECIES[speciesId]) return;
  if (!isPetAtHome(speciesId)) {
    bringPetHome(speciesId);
    petActiveTab = 'care';
    refreshPetUI();
    return;
  }
  bubblePet.activeSpecies = speciesId;
  syncBubblePetLegacyFields();
  saveBubblePet();
  petActiveTab = 'care';
  refreshPetUI();
  showToast(`正在照料 ${PET_SPECIES[speciesId].name}`, '#ec407a');
}

function loadBubblePet() {
  try {
    const raw = localStorage.getItem(PET_STORAGE)
      || localStorage.getItem('bubbleRelief_bubblePet_v3')
      || localStorage.getItem('bubbleRelief_bubblePet_v2')
      || localStorage.getItem('bubbleRelief_bubblePet_v1');
    if (!raw) return;
    migrateBubblePetData(JSON.parse(raw));
  } catch (e) {}
}

function saveBubblePet() {
  try {
    syncBubblePetLegacyFields();
    localStorage.setItem(PET_STORAGE, JSON.stringify({
      visited: bubblePet.visited,
      activeSpecies: bubblePet.activeSpecies,
      homeSpecies: bubblePet.homeSpecies,
      petProfiles: bubblePet.petProfiles,
      metSpecies: bubblePet.metSpecies,
      bondedSpecies: bubblePet.bondedSpecies,
      meetTokens: bubblePet.meetTokens,
      meetVisited: bubblePet.meetVisited,
    }));
  } catch (e) {}
}

function tickPetDecay() {
  if (!bubblePet.homeSpecies.length) return;
  const now = Date.now();
  let changed = false;
  bubblePet.homeSpecies.forEach(id => {
    const p = getPetProfile(id);
    if (!p) return;
    const mins = Math.floor((now - p.lastTick) / 60000);
    if (mins <= 0) return;
    p.hunger = clampPetStat(p.hunger - mins * 2);
    p.mood = clampPetStat(p.mood - mins * 1.5);
    p.energy = clampPetStat(p.energy - mins);
    p.bond = clampPetStat(p.bond - mins * 0.5);
    p.lastTick = now;
    changed = true;
  });
  if (changed) {
    syncBubblePetLegacyFields();
    saveBubblePet();
  }
}

function petExpToNext(level) {
  const lv = level ?? bubblePet.level ?? 1;
  return PET_EXP_PER_LEVEL + (lv - 1) * 25;
}

function addPetExp(amount) {
  const p = getActivePetProfile();
  if (!p || !bubblePet.activeSpecies) return;
  const prevLevel = p.level;
  p.exp += amount;
  while (p.exp >= petExpToNext(p.level)) {
    p.exp -= petExpToNext(p.level);
    p.level += 1;
  }
  if (p.level > prevLevel) {
    const spec = PET_SPECIES[bubblePet.activeSpecies];
    if (spec) {
      showToast(`${spec.name} 升到 ${p.level} 级`, '#ec407a');
      if (p.level === PET_GROW_LEVEL) {
        showToast(`${spec.name} 的泡泡光晕更亮了`, '#ff8f00');
      }
    }
  }
  syncBubblePetLegacyFields();
}

function addPetBond(amount) {
  const p = getActivePetProfile();
  if (!p) return;
  p.bond = clampPetStat(p.bond + amount);
  syncBubblePetLegacyFields();
}

function getPetSpeech() {
  const p = getActivePetProfile();
  const spec = PET_SPECIES[bubblePet.activeSpecies];
  if (!p || !spec) return '…';
  if (p.hunger < 25) return `${spec.name} 肚子咕咕叫…`;
  if (p.energy < 20) return `${spec.name} 困困的想睡觉…`;
  if (p.mood < 30) return `${spec.name} 有点不开心…`;
  if (p.mood >= 85) return `${spec.name} 在泡泡里超开心！`;
  if (p.bond >= 85) return `${spec.name} 和你超亲近～`;
  return `${spec.name} 陪陪你～`;
}

function switchPetTab(tab) {
  petActiveTab = tab === 'album' ? 'album' : 'care';
  document.querySelectorAll('.pt-tab[data-pt-tab]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.ptTab === petActiveTab);
  });
  document.getElementById('pet-care-panel')?.classList.toggle('pt-hidden', petActiveTab !== 'care' || !bubblePet.homeSpecies.length);
  document.getElementById('pet-album-panel')?.classList.toggle('pt-hidden', petActiveTab !== 'album');
  if (petActiveTab === 'album') renderPetAlbumGrid();
}

function refreshContinentPetCompanion() {
  const box = document.getElementById('continent-pet-companion');
  if (!box) return;
  const p = getActivePetProfile();
  const show = bubblePet.activeSpecies
    && p
    && p.bond >= PET_BOND_FOLLOW_MIN
    && p.mood >= 40;
  if (!show) {
    box.classList.remove('pt-visible');
    box.innerHTML = '';
    box.setAttribute('aria-hidden', 'true');
    return;
  }
  box.innerHTML = buildBubblePetSvg(bubblePet.activeSpecies, petMoodKey(p.mood));
  box.classList.add('pt-visible');
  box.removeAttribute('aria-hidden');
}

function refreshPetUI() {
  tickPetDecay();
  document.getElementById('continent-pet-btn')?.classList.toggle('visited', bubblePet.visited);
  refreshContinentPetCompanion();

  const carePanel = document.getElementById('pet-care-panel');
  const albumPanel = document.getElementById('pet-album-panel');
  const tabRow = document.getElementById('pet-tab-row');
  const statusBar = document.getElementById('pet-status-bar');

  tabRow?.classList.remove('pt-hidden');

  if (!bubblePet.homeSpecies.length) {
    if (petActiveTab === 'care') petActiveTab = 'album';
    carePanel?.classList.add('pt-hidden');
    albumPanel?.classList.toggle('pt-hidden', petActiveTab !== 'album');
    document.querySelectorAll('.pt-tab[data-pt-tab]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.ptTab === petActiveTab);
    });
    if (statusBar) {
      statusBar.textContent = bubblePet.bondedSpecies.length
        ? '图鉴里点「带回家」· 已结缘的泡宠可以来一起养'
        : '先去大陆「泡缘」野地结缘';
    }
    renderPetAlbumGrid();
    return;
  }

  switchPetTab(petActiveTab);

  const p = getActivePetProfile();
  const spec = PET_SPECIES[bubblePet.activeSpecies];
  const nameTag = document.getElementById('pet-name-tag');
  const levelTag = document.getElementById('pet-level-tag');
  const traitTag = document.getElementById('pet-trait-tag');
  const wrap = document.querySelector('.pt-pet-wrap');
  const speech = document.getElementById('pet-speech');

  if (nameTag && spec) nameTag.textContent = spec.name;
  if (traitTag && spec) traitTag.textContent = spec.trait;
  if (levelTag && p) levelTag.textContent = String(p.level);
  if (spec && p) renderPetStageArt(bubblePet.activeSpecies, p.mood);
  if (statusBar && spec && p) {
    const homeN = bubblePet.homeSpecies.length;
    statusBar.textContent = `${spec.name} · ${p.level} 级 · 亲密 ${p.bond}% · 共 ${homeN} 只在家`;
  }

  if (p) {
    document.getElementById('pt-hunger-fill').style.width = p.hunger + '%';
    document.getElementById('pt-mood-fill').style.width = p.mood + '%';
    document.getElementById('pt-energy-fill').style.width = p.energy + '%';
    document.getElementById('pt-bond-fill').style.width = p.bond + '%';
  }

  if (wrap && p) {
    wrap.classList.toggle('pt-happy', p.mood >= 80);
    wrap.classList.toggle('pt-sad', p.mood < 30);
    wrap.classList.toggle('pt-grown', p.level >= PET_GROW_LEVEL);
  }
  if (speech) speech.textContent = getPetSpeech();

  const playBtn = document.querySelector('.pt-act-btn[data-pt-act="play"]');
  if (playBtn && p) playBtn.disabled = p.energy < 15;
}

function spawnPetActionPop(label) {
  const stage = document.getElementById('pet-stage');
  const home = document.getElementById('pet-bubble-home');
  if (!stage || !home) return;
  const r = home.getBoundingClientRect();
  const sr = stage.getBoundingClientRect();
  const pop = document.createElement('div');
  pop.className = 'pt-action-pop';
  pop.textContent = label;
  pop.style.left = (r.left - sr.left + r.width / 2 - 24) + 'px';
  pop.style.top = (r.top - sr.top + 20) + 'px';
  stage.appendChild(pop);
  setTimeout(() => pop.remove(), 900);
}

function spawnPetHeartPop() {
  const stage = document.getElementById('pet-stage');
  const home = document.getElementById('pet-bubble-home');
  if (!stage || !home) return;
  const r = home.getBoundingClientRect();
  const sr = stage.getBoundingClientRect();
  const pop = document.createElement('div');
  pop.className = 'pt-heart-pop';
  pop.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 20.5 C12 20.5 3 14.2 3 8.8 C3 6.1 5.2 4 7.9 4 C9.7 4 11.2 5 12 6.3 C12.8 5 14.3 4 16.1 4 C18.8 4 21 6.1 21 8.8 C21 14.2 12 20.5 12 20.5 Z" fill="#ec407a"/>
  </svg>`;
  pop.style.left = (r.left - sr.left + r.width / 2 - 9 + (Math.random() * 16 - 8)) + 'px';
  pop.style.top = (r.top - sr.top + 36 + (Math.random() * 10 - 5)) + 'px';
  stage.appendChild(pop);
  setTimeout(() => pop.remove(), 900);
}

function onPetPat() {
  const p = getActivePetProfile();
  if (!p || !bubblePet.activeSpecies) return;
  const now = Date.now();
  if (now < petPatCooldown) return;
  petPatCooldown = now + 2200;

  const home = document.getElementById('pet-bubble-home');
  home?.classList.add('pt-patting');
  setTimeout(() => home?.classList.remove('pt-patting'), 460);

  p.mood = clampPetStat(p.mood + 8);
  addPetBond(5);
  addPetExp(3);
  p.lastTick = now;
  saveBubblePet();

  spawnPetHeartPop();
  spawnPetActionPop('+亲密');
  const spec = PET_SPECIES[bubblePet.activeSpecies];
  const speech = document.getElementById('pet-speech');
  if (speech && spec) {
    speech.textContent = p.bond >= 85
      ? `${spec.name} 蹭了蹭你的手～`
      : `${spec.name} 咕噜咕噜～`;
  }
  refreshPetUI();
}

function onPetAction(action) {
  const p = getActivePetProfile();
  if (!p || !bubblePet.activeSpecies) return;
  const speechEl = document.getElementById('pet-speech');

  if (action === 'feed') {
    if (p.hunger >= 98) {
      if (speechEl) speechEl.textContent = '已经饱饱的啦～';
      return;
    }
    p.hunger = clampPetStat(p.hunger + 28);
    p.mood = clampPetStat(p.mood + 6);
    p.energy = clampPetStat(p.energy + 4);
    addPetBond(4);
    addPetExp(8);
    spawnPetActionPop(PET_ACTION_LABELS.feed);
  } else if (action === 'play') {
    if (p.energy < 15) {
      if (speechEl) speechEl.textContent = '太累了，先睡一会儿吧…';
      return;
    }
    p.mood = clampPetStat(p.mood + 26);
    p.energy = clampPetStat(p.energy - 18);
    p.hunger = clampPetStat(p.hunger - 10);
    addPetBond(6);
    addPetExp(12);
    spawnPetActionPop(PET_ACTION_LABELS.play);
  } else if (action === 'bath') {
    p.mood = clampPetStat(p.mood + 18);
    p.energy = clampPetStat(p.energy + 6);
    addPetBond(3);
    addPetExp(6);
    spawnPetActionPop(PET_ACTION_LABELS.bath);
  } else if (action === 'sleep') {
    if (p.energy >= 95) {
      if (speechEl) speechEl.textContent = '精神很好，不想睡～';
      return;
    }
    p.energy = clampPetStat(p.energy + 32);
    p.hunger = clampPetStat(p.hunger - 6);
    addPetBond(2);
    addPetExp(5);
    spawnPetActionPop(PET_ACTION_LABELS.sleep);
  }

  p.lastTick = Date.now();
  saveBubblePet();
  refreshPetUI();
}

function startPetAmbient() {
  stopPetAmbient();
  petUiTimer = setInterval(() => {
    if (!document.getElementById('pet-overlay')?.classList.contains('open')) return;
    refreshPetUI();
  }, 30000);
}

function stopPetAmbient() {
  if (petUiTimer) { clearInterval(petUiTimer); petUiTimer = null; }
}

function openPetScene() {
  loadBubblePet();
  bubblePet.visited = true;
  if (!bubblePet.homeSpecies.length) petActiveTab = 'album';
  saveBubblePet();
  refreshPetUI();
  const overlay = document.getElementById('pet-overlay');
  document.getElementById('continent-overlay')?.classList.add('pt-hidden-during-pet');
  overlay.classList.remove('closing');
  overlay.classList.add('open', 'entering');
  startPetAmbient();
  setTimeout(() => overlay.classList.remove('entering'), 950);
}

function closePetScene() {
  const overlay = document.getElementById('pet-overlay');
  if (!overlay.classList.contains('open')) return;
  overlay.classList.remove('entering');
  overlay.classList.add('closing');
  stopPetAmbient();
  document.getElementById('pet-stage')?.querySelectorAll('.pt-action-pop').forEach(el => el.remove());
  setTimeout(() => {
    overlay.classList.remove('open', 'closing');
    overlay.style.opacity = '';
    document.getElementById('continent-overlay')?.classList.remove('pt-hidden-during-pet');
    refreshContinentPetCompanion();
  }, 560);
}

function bindPetControls() {
  initPetVisuals();
  document.querySelectorAll('.pt-act-btn[data-pt-act]').forEach(btn => {
    if (btn.dataset.ptActBound) return;
    btn.dataset.ptActBound = '1';
    btn.addEventListener('click', () => onPetAction(btn.dataset.ptAct));
  });
  document.querySelectorAll('.pt-tab[data-pt-tab]').forEach(btn => {
    if (btn.dataset.ptTabBound) return;
    btn.dataset.ptTabBound = '1';
    btn.addEventListener('click', () => switchPetTab(btn.dataset.ptTab));
  });
  const home = document.getElementById('pet-bubble-home');
  if (home && !home.dataset.ptPatBound) {
    home.dataset.ptPatBound = '1';
    home.addEventListener('click', onPetPat);
  }
  const albumGrid = document.getElementById('pet-album-grid');
  if (albumGrid && !albumGrid.dataset.ptAlbumBound) {
    albumGrid.dataset.ptAlbumBound = '1';
    albumGrid.addEventListener('click', e => {
      const actBtn = e.target.closest('[data-pt-album-act]');
      if (!actBtn) return;
      const card = actBtn.closest('[data-pt-album]');
      const speciesId = card?.dataset.ptAlbum;
      if (!speciesId) return;
      if (actBtn.dataset.ptAlbumAct === 'home') bringPetHome(speciesId);
      else if (actBtn.dataset.ptAlbumAct === 'switch') switchActivePet(speciesId);
      refreshPetUI();
    });
  }
  document.getElementById('pet-close')?.addEventListener('click', closePetScene);
}

// ── Pet Meet 泡缘邂逅（色泡共鸣 · 与泡宠照料/蛋仔抓捕都不同）──────────────
let petMeetReturnTo = 'continent';
let petMeetEncounter = null;

function buildMeetHubIconSvg() {
  return `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="24" cy="26" r="14" fill="#b2ebf2" stroke="#fff" stroke-width="1.5"/>
    <ellipse cx="18" cy="20" rx="5" ry="3" fill="#fff" opacity="0.65"/>
    <path d="M24 12 C24 12 18 8 14 12 C10 16 12 22 24 26 C36 22 38 16 34 12 C30 8 24 12 24 12 Z" fill="#26a69a" opacity="0.85"/>
    <circle cx="24" cy="26" r="6" fill="none" stroke="#00897b" stroke-width="1.2" stroke-dasharray="3 2"/>
  </svg>`;
}

function buildMeetJarSvg() {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="50" cy="82" rx="24" ry="6" fill="#00838f" opacity="0.25"/>
    <path d="M34 38 Q50 28 66 38 L62 72 Q50 78 38 72 Z" fill="#80deea" stroke="#00838f" stroke-width="2"/>
    <ellipse cx="50" cy="38" rx="18" ry="6" fill="#4dd0e1" stroke="#00838f" stroke-width="1.5"/>
    <circle cx="50" cy="54" r="10" fill="#fff" opacity="0.45"/>
    <path d="M44 54 Q50 48 56 54" fill="none" stroke="#00897b" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;
}

function refreshPetMeetUI() {
  const tokenBar = document.getElementById('petmeet-tokens');
  if (tokenBar) tokenBar.textContent = `结缘符 ×${bubblePet.meetTokens}`;
  document.getElementById('continent-meet-btn')?.classList.toggle('visited', bubblePet.meetVisited);
  refreshPetMeetBuyUI();
}

function buyPetMeetToken(opts = {}) {
  const quiet = !!opts.quiet;
  loadBubblePet();
  if (!spendCoins(PET_MEET_TOKEN_PRICE)) {
    if (!quiet) showToast(`金币不足，结缘符要 ${PET_MEET_TOKEN_PRICE} 金币`, '#ffd54f');
    return false;
  }
  bubblePet.meetTokens += 1;
  saveBubblePet();
  refreshPetMeetUI();
  if (!quiet) {
    showToast(`🎋 买到结缘符！现有 ${bubblePet.meetTokens} 张`, '#00897b');
    playBuySound();
  }
  return true;
}

function refreshPetMeetBuyUI() {
  const btn = document.getElementById('pm-buy-token-btn');
  if (!btn) return;
  const afford = state.coins >= PET_MEET_TOKEN_PRICE;
  btn.textContent = afford
    ? `购买结缘符 · ${PET_MEET_TOKEN_PRICE} 金币`
    : `购买结缘符 · ${PET_MEET_TOKEN_PRICE} 金币（现有 ${state.coins}）`;
  btn.style.opacity = afford ? '1' : '0.52';
}

function pickWildPetSpecies() {
  const all = Object.keys(PET_SPECIES);
  const unbonded = all.filter(id => !bubblePet.bondedSpecies.includes(id));
  const pool = unbonded.length ? unbonded : all;
  return pool[Math.floor(Math.random() * pool.length)];
}

function rollPetMeetMoodColor() {
  const keys = Object.keys(PET_MEET_COLORS);
  return keys[Math.floor(Math.random() * keys.length)];
}

function setPetMeetStatus(text) {
  const el = document.getElementById('pm-status');
  if (el) el.textContent = text;
}

function refreshPetMeetResonanceUI() {
  if (!petMeetEncounter) return;
  const fill = document.getElementById('pm-trust-fill');
  if (fill) fill.style.width = petMeetEncounter.resonance + '%';
  const triesEl = document.getElementById('pm-tries-left');
  if (triesEl) triesEl.textContent = `剩余吹泡 ${petMeetEncounter.triesLeft} 次`;
  const orb = document.getElementById('pm-mood-orb');
  if (orb) {
    orb.className = '';
    orb.classList.add(PET_MEET_COLORS[petMeetEncounter.moodColor]?.orbClass || 'pm-orb-pink');
  }
  const wild = document.getElementById('pm-wild-art');
  if (wild) wild.classList.toggle('pm-revealed', petMeetEncounter.resonance >= 50);
}

function markPetBonded(speciesId) {
  if (!PET_SPECIES[speciesId]) return;
  markPetSpeciesMet(speciesId);
  if (!bubblePet.bondedSpecies.includes(speciesId)) {
    bubblePet.bondedSpecies.push(speciesId);
  }
  const isFirstHome = bubblePet.homeSpecies.length === 0;
  bringPetHome(speciesId, { quiet: true, makeActive: isFirstHome });
  saveBubblePet();
  checkAchievements();
}

function showPetMeetPanel(name) {
  document.getElementById('pm-start-panel')?.classList.toggle('pm-hidden', name !== 'start');
  document.getElementById('pm-encounter-panel')?.classList.toggle('pm-active', name === 'encounter');
  document.getElementById('pm-result-panel')?.classList.toggle('pm-active', name === 'result');
}

function beginPetMeetEncounter() {
  if (bubblePet.meetTokens <= 0) {
    showToast('结缘符用完了，明天再来泡缘野地吧', '#00838f');
    return;
  }
  bubblePet.meetTokens -= 1;
  saveBubblePet();
  refreshPetMeetUI();

  const speciesId = pickWildPetSpecies();
  const spec = PET_SPECIES[speciesId];
  markPetSpeciesMet(speciesId);

  petMeetEncounter = {
    speciesId,
    resonance: 0,
    moodColor: rollPetMeetMoodColor(),
    triesLeft: PET_MEET_MAX_TRIES,
    hintUsed: false,
    done: false,
  };

  const art = document.getElementById('pm-wild-art');
  const nameEl = document.getElementById('pm-wild-name');
  if (art) {
    art.innerHTML = buildBubblePetSvg(speciesId, 'sad');
    art.classList.remove('pm-revealed', 'pm-shy');
  }
  if (nameEl) nameEl.textContent = '???';

  document.getElementById('pm-hint-btn').disabled = false;
  document.querySelectorAll('.pm-color-btn').forEach(btn => btn.classList.remove('pm-correct-flash', 'pm-hint-flash'));

  showPetMeetPanel('encounter');
  refreshPetMeetResonanceUI();
  setPetMeetStatus('有泡灵躲在草里… 猜它今天喜欢什么颜色的泡');
}

function onPetMeetColorPick(colorId) {
  if (!petMeetEncounter || petMeetEncounter.done) return;
  if (!PET_MEET_COLORS[colorId]) return;

  petMeetEncounter.triesLeft -= 1;
  const btn = document.querySelector(`.pm-color-btn[data-pm-color="${colorId}"]`);
  const wild = document.getElementById('pm-wild-art');
  const spec = PET_SPECIES[petMeetEncounter.speciesId];

  if (colorId === petMeetEncounter.moodColor) {
    petMeetEncounter.resonance = Math.min(PET_MEET_TRUST_GOAL, petMeetEncounter.resonance + PET_MEET_RESONANCE_HIT);
    btn?.classList.add('pm-correct-flash');
    setTimeout(() => btn?.classList.remove('pm-correct-flash'), 420);
    setPetMeetStatus(`${PET_MEET_COLORS[colorId].label} 共鸣了！只涨不扣`);
    if (petMeetEncounter.resonance >= 50) {
      const nameEl = document.getElementById('pm-wild-name');
      if (nameEl && spec) nameEl.textContent = `野${spec.name}`;
    }
    if (petMeetEncounter.resonance >= PET_MEET_TRUST_GOAL) {
      finishPetMeetSuccess();
      refreshPetMeetResonanceUI();
      return;
    }
    petMeetEncounter.moodColor = rollPetMeetMoodColor();
    document.getElementById('pm-mood-hint').textContent = '它换了一种喜欢的泡色… 再试一次';
  } else {
    wild?.classList.remove('pm-shy');
    void wild?.offsetWidth;
    wild?.classList.add('pm-shy');
    setPetMeetStatus(`不对色，它躲进草里了… 共鸣不会减少`);
  }

  refreshPetMeetResonanceUI();
  if (petMeetEncounter.triesLeft <= 0) finishPetMeetFail();
}

function onPetMeetHint() {
  if (!petMeetEncounter || petMeetEncounter.done || petMeetEncounter.hintUsed) return;
  petMeetEncounter.hintUsed = true;
  document.getElementById('pm-hint-btn').disabled = true;
  const btn = document.querySelector(`.pm-color-btn[data-pm-color="${petMeetEncounter.moodColor}"]`);
  btn?.classList.add('pm-hint-flash');
  setTimeout(() => btn?.classList.remove('pm-hint-flash'), 900);
  setPetMeetStatus(`示好泡告诉你：它今天想要 ${PET_MEET_COLORS[petMeetEncounter.moodColor].label}`);
}

function finishPetMeetSuccess() {
  if (!petMeetEncounter) return;
  petMeetEncounter.done = true;
  const speciesId = petMeetEncounter.speciesId;
  const spec = PET_SPECIES[speciesId];
  markPetBonded(speciesId);

  showPetMeetPanel('result');
  const art = document.getElementById('pm-result-art');
  if (art) art.innerHTML = buildBubblePetSvg(speciesId, 'happy');
  document.getElementById('pm-result-title').textContent = '结缘成功';
  document.getElementById('pm-result-desc').textContent =
    `${spec.name} 自愿飘进了结缘囊！第一只会直接来家里；以后新结缘的请到泡宠图鉴点「带回家」。`;

  const homeBtn = document.getElementById('pm-result-home-btn');
  if (homeBtn) {
    homeBtn.style.display = '';
    homeBtn.textContent = '去泡宠图鉴';
    homeBtn.onclick = () => {
      closePetMeetScene();
      openPetScene();
      petActiveTab = bubblePet.homeSpecies.length ? 'care' : 'album';
      refreshPetUI();
    };
  }
  showToast(`${spec.name} 与你结缘`, '#00897b');
}

function finishPetMeetFail() {
  if (!petMeetEncounter) return;
  petMeetEncounter.done = true;
  showPetMeetPanel('result');
  document.getElementById('pm-result-art').innerHTML = buildMeetJarSvg();
  document.getElementById('pm-result-title').textContent = '今天没结缘成';
  document.getElementById('pm-result-desc').textContent = '野泡灵先走了。没关系——这里没有扣血惩罚，共鸣也不会变少，下次再带对的泡色来。';
  document.getElementById('pm-result-home-btn').style.display = 'none';
}

function resetPetMeetStage() {
  petMeetEncounter = null;
  showPetMeetPanel('start');
  document.getElementById('pm-hint-btn').disabled = false;
  document.getElementById('pm-mood-hint').textContent = '它今天想要什么颜色的泡？';
}

function openPetMeetScene(returnTo = 'continent') {
  loadBubblePet();
  petMeetReturnTo = returnTo === 'pet' ? 'pet' : 'continent';
  bubblePet.meetVisited = true;
  saveBubblePet();
  refreshPetMeetUI();
  resetPetMeetStage();

  const overlay = document.getElementById('petmeet-overlay');
  document.getElementById('continent-overlay')?.classList.add('pm-hidden-during-meet');
  if (petMeetReturnTo === 'pet') {
    document.getElementById('pet-overlay')?.classList.add('pm-hidden-during-meet');
  }
  overlay?.classList.remove('closing');
  overlay?.classList.add('open');
}

function closePetMeetScene() {
  const overlay = document.getElementById('petmeet-overlay');
  if (!overlay?.classList.contains('open')) return;
  overlay.classList.add('closing');
  setTimeout(() => {
    overlay.classList.remove('open', 'closing');
    document.getElementById('continent-overlay')?.classList.remove('pm-hidden-during-meet');
    document.getElementById('pet-overlay')?.classList.remove('pm-hidden-during-meet');
    resetPetMeetStage();
    if (petMeetReturnTo === 'pet') refreshPetUI();
  }, 450);
}

function bindPetMeetControls() {
  document.getElementById('pm-start-btn')?.addEventListener('click', beginPetMeetEncounter);
  document.getElementById('pm-buy-token-btn')?.addEventListener('click', () => buyPetMeetToken());
  document.querySelectorAll('.pm-color-btn[data-pm-color]').forEach(btn => {
    btn.addEventListener('click', () => onPetMeetColorPick(btn.dataset.pmColor));
  });
  document.getElementById('pm-hint-btn')?.addEventListener('click', onPetMeetHint);
  document.getElementById('pm-leave-btn')?.addEventListener('click', resetPetMeetStage);
  document.getElementById('pm-result-again-btn')?.addEventListener('click', () => {
    if (bubblePet.meetTokens <= 0) {
      showToast('结缘符不足', '#00838f');
      return;
    }
    beginPetMeetEncounter();
  });
  document.getElementById('pm-result-back-btn')?.addEventListener('click', closePetMeetScene);
  document.getElementById('petmeet-close')?.addEventListener('click', closePetMeetScene);
  document.getElementById('continent-meet-btn')?.addEventListener('click', () => openPetMeetScene('continent'));
}

// ── Deep Bath 深海泡浴 ───────────────────────────────────────────────────
const DB_STORAGE = 'bubbleRelief_deepBath_v1';
const DB_PEARL_META = {
  foam:  { label: '沫珠', emoji: '🫧' },
  coral: { label: '珊珠', emoji: '🪸' },
  pearl: { label: '海珠', emoji: '💎' },
  glow:  { label: '光珠', emoji: '✨' },
  vent:  { label: '泉珠', emoji: '♨️' },
};

const deepBath = {
  pearls: { foam: 0, coral: 0, pearl: 0, glow: 0, vent: 0 },
  total: 0,
  visited: false,
  rubbing: false,
  foamCount: 0,
  weedEmitters: [],
};

let dbAmbient = null;
let dbBubbleTimer = null;
let dbO2Timer = null;
let dbIdleTimer = null;

function loadDeepBath() {
  try {
    const raw = localStorage.getItem(DB_STORAGE);
    if (raw) {
      const d = JSON.parse(raw);
      if (d.pearls) Object.assign(deepBath.pearls, d.pearls);
      deepBath.total = d.total || 0;
      deepBath.visited = !!d.visited;
    }
  } catch (e) {}
}

function saveDeepBath() {
  try {
    localStorage.setItem(DB_STORAGE, JSON.stringify({
      pearls: deepBath.pearls,
      total: deepBath.total,
      visited: deepBath.visited,
    }));
  } catch (e) {}
}

function refreshDeepBathUI() {
  const bar = document.getElementById('deepbath-collect-bar');
  if (!bar) return;
  const parts = Object.entries(DB_PEARL_META)
    .filter(([k]) => deepBath.pearls[k] > 0)
    .map(([k, m]) => `${m.emoji}${deepBath.pearls[k]}`);
  bar.textContent = parts.length
    ? `深珠 ${deepBath.total} · ${parts.join(' ')}`
    : `深珠 · ${deepBath.total}`;
  document.getElementById('btn-deepbath-zone')?.classList.toggle('visited', deepBath.visited);
}

function dbKelpBedSvg(bedId) {
  const p = 'dbBed' + bedId;
  const grad = `
    <defs>
      <linearGradient id="${p}Root" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2d4a3e"/>
        <stop offset="100%" stop-color="#14241c"/>
      </linearGradient>
      <linearGradient id="${p}Deep" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#0d2818"/>
        <stop offset="50%" stop-color="#1b4332"/>
        <stop offset="100%" stop-color="#081c14"/>
      </linearGradient>
      <linearGradient id="${p}Mid" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#1b4332"/>
        <stop offset="55%" stop-color="#2d6a4f"/>
        <stop offset="100%" stop-color="#52b788"/>
      </linearGradient>
      <linearGradient id="${p}Lite" x1="0" y1="1" x2="0.3" y2="0">
        <stop offset="0%" stop-color="#2d6a4f"/>
        <stop offset="100%" stop-color="#95d5b2"/>
      </linearGradient>
    </defs>`;

  if (bedId === 0) {
    return `<svg viewBox="0 0 520 420" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      ${grad}
      <path d="M10 412 Q4 384 38 362 Q98 342 178 352 Q248 362 318 388 Q292 416 168 418 Q48 414 10 412 Z" fill="url(#${p}Root)"/>
      <path d="M36 406 Q142 394 285 402 Q210 412 88 410 Q36 408 36 406 Z" fill="#1b4332" opacity="0.9"/>
      <path d="M44 408 C26 352 22 248 36 148 C42 98 50 58 58 42 C66 68 60 118 58 178 C52 278 64 362 68 408 Z" fill="url(#${p}Deep)" opacity="0.9"/>
      <path d="M82 410 C62 328 58 210 72 108 C78 62 92 34 104 22 C114 48 106 98 108 162 C112 258 122 352 128 410 Z" fill="url(#${p}Mid)" opacity="0.93"/>
      <path d="M132 412 C102 298 96 175 118 78 C126 38 148 14 162 8 C174 36 162 92 166 158 C174 268 188 372 178 412 Z" fill="url(#${p}Lite)"/>
      <path d="M188 414 C152 285 148 148 172 52 C182 18 208 2 224 6 C238 34 226 92 232 168 C242 292 252 388 236 414 Z" fill="url(#${p}Mid)"/>
      <path d="M248 410 C268 318 272 198 258 102 C252 58 238 32 226 26 C214 54 222 108 218 172 C212 278 202 368 214 410 Z" fill="url(#${p}Deep)" opacity="0.88"/>
      <path d="M278 408 C302 330 308 215 292 118 C286 72 272 44 258 36 C246 62 254 118 248 182 C240 288 228 378 242 408 Z" fill="url(#${p}Mid)" opacity="0.91"/>
      <path d="M312 406 C328 348 318 252 302 168 C296 128 288 92 296 68 C306 88 312 138 318 208 C326 312 334 382 322 406 Z" fill="url(#${p}Deep)" opacity="0.86"/>
    </svg>`;
  }

  return `<svg viewBox="0 0 520 420" preserveAspectRatio="xMidYMax meet" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    ${grad}
    <path d="M14 410 Q18 378 52 358 Q128 338 215 346 Q312 356 506 372 Q518 392 504 414 Q340 420 120 416 Q28 412 14 410 Z" fill="url(#${p}Root)"/>
    <path d="M48 404 Q185 392 355 398 Q420 406 468 402 Q280 414 110 408 Q48 406 48 404 Z" fill="#1b4332" opacity="0.88"/>
    <path d="M62 406 C48 345 52 235 68 128 C74 82 86 48 98 36 C108 62 100 112 104 175 C108 272 118 362 124 406 Z" fill="url(#${p}Deep)" opacity="0.91"/>
    <path d="M108 408 C88 315 92 188 112 88 C120 48 138 22 152 14 C164 42 154 98 158 165 C166 275 178 378 168 408 Z" fill="url(#${p}Mid)" opacity="0.92"/>
    <path d="M158 410 C138 295 148 158 178 58 C188 22 218 6 232 12 C246 42 230 102 238 178 C248 305 262 395 246 410 Z" fill="url(#${p}Lite)"/>
    <path d="M218 412 C198 288 208 132 248 48 C262 16 292 4 308 14 C322 44 302 108 312 188 C324 318 338 402 318 412 Z" fill="url(#${p}Mid)"/>
    <path d="M278 408 C302 325 312 205 298 105 C290 58 272 28 254 22 C238 50 248 112 242 178 C234 288 222 372 236 408 Z" fill="url(#${p}Deep)" opacity="0.89"/>
    <path d="M328 406 C352 338 362 228 348 128 C340 82 322 52 304 44 C288 72 296 128 290 195 C282 302 268 388 282 406 Z" fill="url(#${p}Mid)" opacity="0.9"/>
    <path d="M378 404 C408 328 418 212 402 108 C394 62 376 36 358 30 C342 58 350 118 344 188 C336 298 318 382 332 404 Z" fill="url(#${p}Deep)" opacity="0.87"/>
    <path d="M428 402 C458 355 468 248 452 145 C444 98 428 62 412 48 C398 78 406 135 402 205 C396 310 382 388 394 402 Z" fill="url(#${p}Lite)" opacity="0.84"/>
  </svg>`;
}

function buildDeepBathSeaweed() {
  const bed = document.getElementById('db-seaweed');
  if (!bed) return;
  bed.innerHTML = '';
  deepBath.weedEmitters = [];
  const beds = [
    {
      cls: 'db-kelp-bed-left',
      h: 54,
      delay: 0,
      dur: 7.1,
      tips: [
        { x: 5, lift: 0.78 }, { x: 12, lift: 0.9 }, { x: 19, lift: 0.97 },
        { x: 26, lift: 0.82 }, { x: 33, lift: 0.91 }, { x: 40, lift: 0.74 },
      ],
    },
    {
      cls: 'db-kelp-bed-right',
      h: 54,
      delay: -1.6,
      dur: 6.3,
      tips: [
        { x: 56, lift: 0.8 }, { x: 63, lift: 0.93 }, { x: 70, lift: 0.88 },
        { x: 77, lift: 0.99 }, { x: 84, lift: 0.85 }, { x: 91, lift: 0.76 },
      ],
    },
  ];
  beds.forEach((b, i) => {
    const el = document.createElement('div');
    el.className = `db-kelp-bed ${b.cls}`;
    el.style.height = b.h + 'vh';
    el.style.animationDuration = b.dur + 's';
    el.style.animationDelay = b.delay + 's';
    el.innerHTML = dbKelpBedSvg(i);
    bed.appendChild(el);
    b.tips.forEach(t => {
      deepBath.weedEmitters.push({
        left: t.x,
        bottom: 16 + b.h * t.lift * 0.6,
      });
    });
  });
}

function spawnDbO2Bubble() {
  const rise = document.getElementById('db-rise');
  if (!rise || !deepBath.weedEmitters.length) return;
  if (!document.getElementById('deepbath-overlay')?.classList.contains('open')) return;
  const em = deepBath.weedEmitters[Math.floor(Math.random() * deepBath.weedEmitters.length)];
  const b = document.createElement('div');
  b.className = 'db-rise-bubble db-o2-bubble';
  const sz = 4 + Math.random() * 11;
  const dur = 7 + Math.random() * 9;
  b.style.width = b.style.height = sz + 'px';
  b.style.left = (em.left + (Math.random() * 1.2 - 0.6)) + '%';
  b.style.bottom = (em.bottom + Math.random() * 2) + '%';
  b.style.setProperty('--db-drift', ((Math.random() * 24 - 12) + 'px'));
  b.style.animationDuration = dur + 's';
  rise.appendChild(b);
  setTimeout(() => b.remove(), dur * 1000 + 120);
}

function buildDeepBathScenery() {
  const reef = document.getElementById('db-reef');
  if (reef) {
    reef.innerHTML = `<svg viewBox="0 0 1000 260" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="dbCoralA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f48fb1"/>
          <stop offset="100%" stop-color="#ad1457"/>
        </linearGradient>
        <linearGradient id="dbCoralB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ce93d8"/>
          <stop offset="100%" stop-color="#6a1b9a"/>
        </linearGradient>
        <linearGradient id="dbRock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3949ab"/>
          <stop offset="100%" stop-color="#1a237e"/>
        </linearGradient>
      </defs>
      <path d="M0 260 L0 198 Q120 178 248 192 Q380 168 520 186 Q660 172 820 188 Q920 182 1000 196 L1000 260 Z" fill="url(#dbRock)" opacity="0.55"/>
      <path d="M80 220 Q92 170 108 220 Q96 238 80 220 Z" fill="url(#dbCoralA)" opacity="0.72"/>
      <path d="M160 230 Q176 175 192 228 Q178 248 160 230 Z" fill="url(#dbCoralB)" opacity="0.68"/>
      <path d="M760 228 Q776 168 792 226 Q778 246 760 228 Z" fill="url(#dbCoralA)" opacity="0.7"/>
      <path d="M840 222 Q856 178 872 220 Q858 240 840 222 Z" fill="url(#dbCoralB)" opacity="0.66"/>
      <path d="M620 236 Q632 190 646 234 Q634 252 620 236 Z" fill="url(#dbCoralA)" opacity="0.58"/>
      <path d="M420 240 Q432 198 446 238 Q434 254 420 240 Z" fill="url(#dbCoralB)" opacity="0.52"/>
    </svg>`;
  }
  buildDeepBathSeaweed();
  const rise = document.getElementById('db-rise');
  if (rise) {
    rise.innerHTML = '';
    for (let i = 0; i < 10; i++) spawnDbO2Bubble();
  }
  const pool = document.getElementById('db-bath-pool');
  if (pool) pool.querySelectorAll('.db-foam').forEach(el => el.remove());
  deepBath.foamCount = 0;
}

function playDbAmbientDeep() {
  try {
    const ctx = getAudioCtx();
    const sr = ctx.sampleRate;
    const len = sr * 2;
    const buf = ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < len; i++) {
      brown = (brown + 0.0022 * (Math.random() * 2 - 1)) / 1.0022;
      const swell = 0.68 + 0.32 * Math.sin(i / sr * 0.18);
      d[i] = brown * swell * 4.2;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 280;
    const g = ctx.createGain();
    g.gain.value = 0.07;
    src.connect(lp).connect(g).connect(ctx.destination);
    src.start();
    dbAmbient = { nodes: [src] };
  } catch (e) {}
}

function playDbBubblePop() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(220 + Math.random() * 80, now);
    o.frequency.exponentialRampToValueAtTime(140, now + 0.08);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.045, now + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    o.connect(g).connect(ctx.destination);
    o.start(now);
    o.stop(now + 0.16);
  } catch (e) {}
}

function playDbItemSound(type) {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;
    const freqs = { foam: 440, coral: 349, pearl: 523, glow: 659, vent: 294 };
    const f = freqs[type] || 440;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(f, now);
    o.frequency.exponentialRampToValueAtTime(f * 1.06, now + 0.1);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.08, now + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    o.connect(g).connect(ctx.destination);
    o.start(now);
    o.stop(now + 0.28);
  } catch (e) {}
}

function startDeepBathAmbient() {
  stopDeepBathAmbient();
  playDbAmbientDeep();
  dbBubbleTimer = setInterval(playDbBubblePop, 3200 + Math.random() * 4200);
  dbO2Timer = setInterval(spawnDbO2Bubble, 650 + Math.random() * 550);
  dbIdleTimer = setInterval(spawnDeepBathIdleFloat, 4000 + Math.random() * 3600);
}

function stopDeepBathAmbient() {
  if (dbBubbleTimer) { clearInterval(dbBubbleTimer); dbBubbleTimer = null; }
  if (dbO2Timer) { clearInterval(dbO2Timer); dbO2Timer = null; }
  if (dbIdleTimer) { clearInterval(dbIdleTimer); dbIdleTimer = null; }
  if (dbAmbient) {
    dbAmbient.nodes?.forEach(n => { try { n.stop(); } catch (e) {} });
    dbAmbient = null;
  }
}

function spawnDeepBathIdleFloat() {
  const stage = document.getElementById('deepbath-stage');
  if (!stage || !document.getElementById('deepbath-overlay').classList.contains('open')) return;
  const el = document.createElement('div');
  el.className = 'db-float';
  el.textContent = ['🫧', '✨', '💎', '🪸'][Math.floor(Math.random() * 4)];
  el.style.left = (8 + Math.random() * 84) + '%';
  el.style.top = (18 + Math.random() * 58) + '%';
  stage.appendChild(el);
  setTimeout(() => el.remove(), 3600);
}

function spawnDbCollectPop(btn, meta) {
  const stage = document.getElementById('deepbath-stage');
  if (!stage || !btn) return;
  const r = btn.getBoundingClientRect();
  const sr = stage.getBoundingClientRect();
  const pop = document.createElement('div');
  pop.className = 'db-collect-pop';
  pop.textContent = `+1 ${meta.emoji}${meta.label}`;
  pop.style.left = (r.left - sr.left + r.width / 2 - 20) + 'px';
  pop.style.top = (r.top - sr.top - 8) + 'px';
  stage.appendChild(pop);
  setTimeout(() => pop.remove(), 1100);
}

function spawnDeepBathFoam(clientX, clientY) {
  const pool = document.getElementById('db-bath-pool');
  if (!pool) return;
  const r = pool.getBoundingClientRect();
  const x = ((clientX - r.left) / r.width) * 100 + (Math.random() * 6 - 3);
  const y = ((clientY - r.top) / r.height) * 100 + (Math.random() * 6 - 3);
  const size = 12 + Math.random() * 24;
  const el = document.createElement('div');
  el.className = 'db-foam';
  el.style.width = size + 'px';
  el.style.height = size + 'px';
  el.style.left = Math.max(2, Math.min(92, x)) + '%';
  el.style.top = Math.max(2, Math.min(90, y)) + '%';
  el.style.opacity = String(0.6 + Math.random() * 0.35);
  pool.appendChild(el);
  deepBath.foamCount += 1;
  playBathFoamSound();
  const drift = () => {
    if (!el.isConnected) return;
    const top = parseFloat(el.style.top);
    el.style.top = (top - 0.28) + '%';
    el.style.opacity = String(Math.max(0, parseFloat(el.style.opacity) - 0.0035));
    if (top < -4 || parseFloat(el.style.opacity) <= 0.05) {
      el.remove();
      return;
    }
    requestAnimationFrame(drift);
  };
  requestAnimationFrame(drift);
}

function onDeepBathItemClick(type, btn) {
  const meta = DB_PEARL_META[type];
  if (!meta) return;
  btn.classList.remove('pop');
  void btn.offsetWidth;
  btn.classList.add('pop');
  playDbItemSound(type);
  if (type === 'vent') {
    const pool = document.getElementById('db-bath-pool');
    if (pool) {
      pool.style.filter = 'brightness(1.15)';
      setTimeout(() => { pool.style.filter = ''; }, 650);
    }
  }
  if (type === 'glow') {
    const rays = document.querySelector('.db-rays');
    if (rays) {
      rays.style.opacity = '1';
      setTimeout(() => { rays.style.opacity = ''; }, 700);
    }
  }
  deepBath.pearls[type] = (deepBath.pearls[type] || 0) + 1;
  deepBath.total += 1;
  saveDeepBath();
  refreshDeepBathUI();
  checkAchievements();
  spawnDbCollectPop(btn, meta);
}

function openDeepBathScene() {
  loadDeepBath();
  deepBath.visited = true;
  saveDeepBath();
  refreshDeepBathUI();
  buildDeepBathScenery();
  const overlay = document.getElementById('deepbath-overlay');
  document.getElementById('continent-overlay')?.classList.add('db-hidden-during-bath');
  overlay.classList.remove('closing');
  overlay.classList.add('open', 'entering');
  startDeepBathAmbient();
  spawnDeepBathIdleFloat();
  setTimeout(() => overlay.classList.remove('entering'), 950);
}

function closeDeepBathScene() {
  const overlay = document.getElementById('deepbath-overlay');
  if (!overlay.classList.contains('open')) return;
  overlay.classList.remove('entering');
  overlay.classList.add('closing');
  stopDeepBathAmbient();
  deepBath.rubbing = false;
  document.getElementById('deepbath-stage')?.querySelectorAll('.db-float, .db-collect-pop').forEach(el => el.remove());
  setTimeout(() => {
    overlay.classList.remove('open', 'closing');
    overlay.style.opacity = '';
    document.getElementById('continent-overlay')?.classList.remove('db-hidden-during-bath');
  }, 560);
}

function bindDeepBathControls() {
  document.querySelectorAll('.db-item[data-db]').forEach(btn => {
    if (btn.dataset.dbBound) return;
    btn.dataset.dbBound = '1';
    btn.addEventListener('click', () => onDeepBathItemClick(btn.dataset.db, btn));
  });
  document.getElementById('deepbath-close')?.addEventListener('click', closeDeepBathScene);

  const pool = document.getElementById('db-bath-pool');
  if (!pool || pool.dataset.bound) return;
  pool.dataset.bound = '1';
  const foamAt = (e, touch) => {
    const pt = touch || e;
    spawnDeepBathFoam(pt.clientX, pt.clientY);
  };
  pool.addEventListener('mousedown', e => {
    if (!document.getElementById('deepbath-overlay').classList.contains('open')) return;
    deepBath.rubbing = true;
    foamAt(e);
  });
  pool.addEventListener('mousemove', e => {
    if (!deepBath.rubbing) return;
    if (Math.random() < 0.5) foamAt(e);
  });
  window.addEventListener('mouseup', () => { deepBath.rubbing = false; });
  pool.addEventListener('touchstart', e => {
    if (!document.getElementById('deepbath-overlay').classList.contains('open')) return;
    e.preventDefault();
    deepBath.rubbing = true;
    for (const t of e.changedTouches) foamAt(e, t);
  }, { passive: false });
  pool.addEventListener('touchmove', e => {
    if (!deepBath.rubbing) return;
    e.preventDefault();
    if (Math.random() < 0.45) foamAt(e, e.changedTouches[0]);
  }, { passive: false });
  pool.addEventListener('touchend', () => { deepBath.rubbing = false; });
}

function beachShowFind(sand, x, y, emoji, name, color) {
  if (emoji) {
    const fx = document.createElement('div');
    fx.className = 'dig-find';
    fx.textContent = emoji;
    fx.style.left = x + 'px';
    fx.style.top = y + 'px';
    sand.appendChild(fx);
    setTimeout(() => fx.remove(), 1100);
    showToast(`挖到了：${emoji} ${name}`, color || '#ffcc80');
  } else {
    showToast(name || '什么都没有…', '#a1887f');
  }
}

function buildBeachDecor() {
  const sand = document.getElementById('beach-sand');
  if (!sand) return;
  sand.querySelectorAll('.sand-mound, .hole-oval, .hole-round, .worm-hole, .shore-shell, .shore-litter, .dig-hole, .dig-find, .salt-grain, .chengzi-out').forEach(el => el.remove());

  // 沙包 → 猫眼螺
  for (let i = 0; i < 7; i++) {
    const m = document.createElement('div');
    m.className = 'sand-mound';
    m.title = '沙包（猫眼螺）';
    const w = 32 + Math.random() * 46;
    m.style.width = w + 'px';
    m.style.height = (w * (0.4 + Math.random() * 0.16)) + 'px';
    m.style.left = (6 + Math.random() * 86) + '%';
    m.style.top = (18 + Math.random() * 68) + '%';
    sand.appendChild(m);
  }

  // 椭圆洞 → 蛏子
  for (let i = 0; i < 10; i++) {
    const h = document.createElement('div');
    h.className = 'hole-oval';
    h.title = '椭圆洞（蛏子）';
    const rw = 5 + Math.random() * 5;
    h.style.width = (rw * 1.7) + 'px';
    h.style.height = rw + 'px';
    h.style.left = (4 + Math.random() * 90) + '%';
    h.style.top = (10 + Math.random() * 78) + '%';
    h.style.transform = `rotate(${Math.random() * 60 - 30}deg)`;
    sand.appendChild(h);
  }

  // 圆洞 → 贝壳 / 小螃蟹
  for (let i = 0; i < 10; i++) {
    const h = document.createElement('div');
    h.className = 'hole-round';
    h.title = '圆洞';
    const d = 8 + Math.random() * 8;
    h.style.width = d + 'px';
    h.style.height = d + 'px';
    h.style.left = (5 + Math.random() * 88) + '%';
    h.style.top = (12 + Math.random() * 76) + '%';
    sand.appendChild(h);
  }

  // 角落散落装饰（只是摆设）
  const litter = [
    ['🐚', 10], ['🦴', 8], ['🫙', 8], ['🐚', 9],
    ['🦴', 7], ['🫙', 7], ['🐚', 6], ['🫙', 5],
  ];
  litter.forEach((item, i) => {
    const s = document.createElement('div');
    s.className = 'shore-litter';
    s.textContent = item[0];
    const corner = i % 4;
    if (corner === 0) { s.style.left = (2 + Math.random() * 18) + '%'; s.style.top = (3 + Math.random() * 22) + '%'; }
    else if (corner === 1) { s.style.left = (78 + Math.random() * 18) + '%'; s.style.top = (4 + Math.random() * 24) + '%'; }
    else if (corner === 2) { s.style.left = (3 + Math.random() * 20) + '%'; s.style.top = (70 + Math.random() * 24) + '%'; }
    else { s.style.left = (75 + Math.random() * 20) + '%'; s.style.top = (68 + Math.random() * 26) + '%'; }
    s.style.fontSize = item[1] + 'px';
    s.style.transform = `rotate(${Math.random() * 70 - 35}deg)`;
    sand.appendChild(s);
  });

  bindBeachInteractives();
}

function chengziSVG() {
  // 蛏子：细长刀蛏壳 + 双水管（不是蜗牛，也不是点肉缩回）
  const id = 'cz' + Math.floor(Math.random() * 1e9);
  return `<svg viewBox="0 0 90 32" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#f5ead8"/>
        <stop offset="45%" stop-color="#d4b896"/>
        <stop offset="100%" stop-color="#9a734c"/>
      </linearGradient>
      <linearGradient id="${id}m" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#f8bbd0"/>
        <stop offset="100%" stop-color="#e57373"/>
      </linearGradient>
    </defs>
    <!-- 细长双壳 -->
    <ellipse cx="42" cy="16" rx="34" ry="9" fill="url(#${id}s)" stroke="#7a5a3a" stroke-width="0.9"/>
    <ellipse cx="42" cy="14.2" rx="28" ry="5.2" fill="#fff8e8" opacity="0.28"/>
    <path d="M12 16 Q28 11 42 16 Q56 21 72 16" fill="none" stroke="#b8956e" stroke-width="0.7" opacity="0.8"/>
    <path d="M14 18 Q30 14 43 18 Q56 22 70 17" fill="none" stroke="#a8845c" stroke-width="0.5" opacity="0.55"/>
    <ellipse cx="10" cy="16" rx="4" ry="6" fill="#c4a07a" stroke="#7a5a3a" stroke-width="0.55"/>
    <!-- 伸出的双水管 -->
    <rect x="74" y="10" width="3.2" height="11" rx="1.6" fill="url(#${id}m)" stroke="#c62828" stroke-width="0.3"/>
    <rect x="78.5" y="11.5" width="2.8" height="9.5" rx="1.4" fill="#ef9a9a" stroke="#c62828" stroke-width="0.25"/>
    <ellipse cx="75.6" cy="10" rx="1.7" ry="1.3" fill="#ad1457"/>
    <ellipse cx="79.9" cy="11.5" rx="1.5" ry="1.2" fill="#ad1457"/>
  </svg>`;
}

function maoyanSVG() {
  // 猫眼螺：螺旋壳 + 伸出的肉足；点肉后缩回，厣（猫眼）盖住止水
  const id = 'my' + Math.floor(Math.random() * 1e9);
  return `<svg viewBox="0 0 64 54" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="${id}sh" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#efe0c8"/>
        <stop offset="45%" stop-color="#c9a882"/>
        <stop offset="100%" stop-color="#8d6e4c"/>
      </radialGradient>
      <radialGradient id="${id}eye" cx="45%" cy="40%" r="55%">
        <stop offset="0%" stop-color="#fff8e1"/>
        <stop offset="35%" stop-color="#ffe082"/>
        <stop offset="70%" stop-color="#f9a825"/>
        <stop offset="100%" stop-color="#e65100"/>
      </radialGradient>
    </defs>
    <!-- 螺旋壳 -->
    <ellipse cx="28" cy="28" rx="20" ry="18" fill="url(#${id}sh)" stroke="#6d4c41" stroke-width="1"/>
    <path d="M28 12 C40 14 44 24 38 32 C32 40 20 40 16 32 C12 24 18 14 28 12
             C34 14 36 22 32 28 C28 34 22 34 20 30 C18 26 22 20 28 18
             C31 19 32 24 30 27" fill="none" stroke="#5d4037" stroke-width="1.1" opacity="0.85"/>
    <ellipse cx="24" cy="22" rx="5" ry="4" fill="#fff3e0" opacity="0.35"/>
    <!-- 伸出的肉（可点缩回） -->
    <g class="my-meat">
      <ellipse cx="48" cy="32" rx="12" ry="8" fill="#f48fb1" stroke="#c2185b" stroke-width="0.6"/>
      <ellipse cx="52" cy="30" rx="6" ry="4.5" fill="#f8bbd0"/>
      <ellipse cx="55" cy="28.5" rx="2.2" ry="1.8" fill="#ad1457"/>
      <circle cx="55.2" cy="28.2" r="0.55" fill="#ffebee"/>
    </g>
    <!-- 厣「猫眼」——缩回后盖住开口止水 -->
    <g class="my-eye">
      <ellipse cx="40" cy="31" rx="9" ry="8" fill="url(#${id}eye)" stroke="#bf360c" stroke-width="0.8"/>
      <ellipse cx="40" cy="31" rx="4.2" ry="3.8" fill="#fffde7" opacity="0.55"/>
      <ellipse cx="38.5" cy="29.5" rx="1.6" ry="1.4" fill="#fff" opacity="0.7"/>
      <circle cx="40" cy="31" r="1.2" fill="#e65100"/>
    </g>
  </svg>`;
}

function saltOutChengzi(hole, sand) {
  if (beachScene.digging || hole.classList.contains('used')) return;
  beachScene.digging = true;
  const rect = sand.getBoundingClientRect();
  const hr = hole.getBoundingClientRect();
  const x = hr.left + hr.width / 2 - rect.left;
  const y = hr.top + hr.height / 2 - rect.top;

  for (let i = 0; i < 7; i++) {
    const g = document.createElement('div');
    g.className = 'salt-grain';
    g.style.left = (x - 6 + Math.random() * 12) + 'px';
    g.style.top = (y - 8 + Math.random() * 6) + 'px';
    g.style.animationDelay = (i * 0.05) + 's';
    sand.appendChild(g);
    setTimeout(() => g.remove(), 900);
  }
  showToast('撒了点盐，等蛏子自己出来…', '#eceff1');

  setTimeout(() => {
    const out = document.createElement('div');
    out.className = 'chengzi-out';
    out.title = '蛏子';
    out.innerHTML = chengziSVG();
    out.style.left = x + 'px';
    out.style.top = y + 'px';
    sand.appendChild(out);
    hole.classList.add('used');
    showToast('挖到了：蛏子！', '#a5d6a7');
    beachScene.digging = false;
    out.addEventListener('animationend', () => out.remove(), { once: true });
  }, 1100);
}

function digMaoyanAt(mound, sand, x, y) {
  if (beachScene.digging || mound.classList.contains('taken')) return;
  beachScene.digging = true;
  mound.classList.add('taken');

  const out = document.createElement('div');
  out.className = 'maoyan-out';
  out.title = '猫眼螺（点肉会缩回去，厣止水）';
  out.innerHTML = maoyanSVG();
  out.style.left = x + 'px';
  out.style.top = y + 'px';
  sand.appendChild(out);
  showToast('挖到了：猫眼螺！点一下肉试试', '#ce93d8');
  beachScene.digging = false;

  out.addEventListener('animationend', () => out.classList.add('stay'), { once: true });
  out.addEventListener('click', e => {
    e.stopPropagation();
    if (out.classList.contains('sealed')) return;
    out.classList.add('sealed');
    showToast('肉缩回去了，猫眼盖住止水', '#ffe082');
    setTimeout(() => {
      out.style.transition = 'opacity 0.45s ease';
      out.style.opacity = '0';
      setTimeout(() => out.remove(), 460);
    }, 900);
  });
}

function digBeachAt(clientX, clientY, targetEl) {
  if (beachScene.digging) return;
  const sand = document.getElementById('beach-sand');
  if (!sand) return;
  const rect = sand.getBoundingClientRect();
  if (clientY < rect.top || clientY > rect.bottom) return;
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const hit = targetEl && targetEl.closest
    ? (targetEl.closest('.hole-oval') || targetEl.closest('.hole-round') || targetEl.closest('.sand-mound'))
    : null;

  // 椭圆洞：撒盐等蛏子
  if (hit && hit.classList.contains('hole-oval')) {
    saltOutChengzi(hit, sand);
    return;
  }

  // 圆洞：贝壳或小螃蟹
  if (hit && hit.classList.contains('hole-round')) {
    if (hit.classList.contains('used')) return;
    beachScene.digging = true;
    hit.classList.add('used');
    const find = Math.random() < 0.55
      ? { emoji: '🐚', name: '小贝壳', color: '#ffcc80' }
      : { emoji: '🦀', name: '小螃蟹', color: '#ff8a65' };
    const size = 28 + Math.random() * 10;
    const hole = document.createElement('div');
    hole.className = 'dig-hole';
    hole.style.width = size + 'px';
    hole.style.height = size * 0.72 + 'px';
    hole.style.left = (x - size / 2) + 'px';
    hole.style.top = (y - size * 0.36) + 'px';
    sand.appendChild(hole);
    setTimeout(() => {
      beachShowFind(sand, x, y, find.emoji, find.name, find.color);
      beachScene.digging = false;
    }, 260);
    return;
  }

  // 沙包：猫眼螺（螺旋壳+肉；点肉缩回、厣止水 —— 不是蛏子，也不是蜗牛）
  if (hit && hit.classList.contains('sand-mound')) {
    digMaoyanAt(hit, sand, x, y);
    return;
  }

  // 平沙：没东西 / 贝壳 / 骨头 / 小瓶子
  beachScene.digging = true;
  const size = 34 + Math.random() * 18;
  const hole = document.createElement('div');
  hole.className = 'dig-hole';
  hole.style.width = size + 'px';
  hole.style.height = size * 0.72 + 'px';
  hole.style.left = (x - size / 2) + 'px';
  hole.style.top = (y - size * 0.36) + 'px';
  sand.appendChild(hole);
  const find = rollWeighted(BEACH_FLAT_FINDS);
  setTimeout(() => {
    beachShowFind(sand, x, y, find.emoji, find.name);
    beachScene.digging = false;
  }, 280);
}

(() => {
  const sand = document.getElementById('beach-sand');
  if (!sand) return;
  const onDig = e => {
    e.preventDefault();
    const src = e.touches && e.touches[0] ? e.touches[0] : e;
    const target = e.target;
    digBeachAt(src.clientX, src.clientY, target);
  };
  sand.addEventListener('mousedown', onDig);
  sand.addEventListener('touchstart', onDig, { passive: false });
})();

// keep sea fish/star binds from previous helper if present
function bindBeachInteractives() {
  const sea = document.getElementById('beach-sea');
  if (!sea || sea.dataset.bound === '1') return;
  sea.dataset.bound = '1';

  sea.addEventListener('click', e => {
    const star = e.target.closest('.rock-star');
    if (star && !star.classList.contains('taken')) {
      e.stopPropagation();
      star.classList.add('taken');
      showToast('⭐ 捡到礁石上的海星！', '#ffd54f');
      setTimeout(() => star.remove(), 450);
      return;
    }
    const fish = e.target.closest('.beach-fish');
    if (fish && !fish.classList.contains('scatter')) {
      e.stopPropagation();
      const dx = (Math.random() > 0.5 ? 1 : -1) * (50 + Math.random() * 80);
      const dy = -20 - Math.random() * 50;
      fish.style.setProperty('--dx', dx + 'px');
      fish.style.setProperty('--dy', dy + 'px');
      fish.classList.add('scatter');
      showToast('小鱼吓跑了…', '#b3e5fc');
      setTimeout(() => {
        fish.classList.remove('scatter');
        fish.style.removeProperty('--dx');
        fish.style.removeProperty('--dy');
        fish.style.opacity = '0';
        setTimeout(() => { fish.style.opacity = ''; }, 900);
      }, 560);
    }
  });
}

// ── Aquarium mini scene（喂鱼观赏雏形）─────────────────────────────
// 规则（记住）：多种不同花纹；同一种花纹 2～3 条；最多 1～2 条鲶鱼感；其余外形不能都像鲶鱼
const tankScene = {
  fish: [],
  feeding: false,
  swimTimers: [],
};

const TANK_PATTERN_NAMES = {
  zebra: '斑马纹',
  spots: '圆斑纹',
  tiger: '虎皮纹',
  peacock: '孔雀彩',
  angel: '燕尾纹',
  catfish: '鲶鱼（触须）',
  fry: '小鱼苗',
};

function tankFishSVG(kind) {
  const id = 'tf' + Math.floor(Math.random() * 1e9);

  if (kind === 'fry') {
    const colors = [
      ['#ffe082', '#ffb300'],
      ['#b3e5fc', '#0288d1'],
      ['#f8bbd0', '#ec407a'],
      ['#c8e6c9', '#43a047'],
    ];
    const c = colors[Math.floor(Math.random() * colors.length)];
    return `<svg viewBox="0 0 40 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 6 C36 9 40 10 40 10 C40 10 36 11 30 14 Z" fill="${c[1]}"/>
      <ellipse cx="18" cy="10" rx="13" ry="6" fill="${c[0]}" stroke="${c[1]}" stroke-width="0.5"/>
      <circle cx="10" cy="9" r="1.3" fill="#263238"/><circle cx="9.6" cy="8.7" r="0.4" fill="#fff"/>
    </svg>`;
  }

  // 斑马纹：黄底黑横条（不是鲶鱼）
  if (kind === 'zebra') {
    return `<svg viewBox="0 0 76 34" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff59d"/><stop offset="100%" stop-color="#fbc02d"/>
        </linearGradient>
        <clipPath id="${id}c"><ellipse cx="34" cy="17" rx="26" ry="11"/></clipPath>
      </defs>
      <path d="M58 9 C67 13 74 17 74 17 C74 17 67 21 58 25 Z" fill="#f9a825"/>
      <ellipse cx="34" cy="17" rx="26" ry="11" fill="url(#${id}b)" stroke="#f57f17" stroke-width="0.55"/>
      <g clip-path="url(#${id}c)">
        <rect x="14" y="6" width="4" height="22" fill="#212121" opacity="0.88"/>
        <rect x="24" y="6" width="4" height="22" fill="#212121" opacity="0.88"/>
        <rect x="34" y="6" width="4" height="22" fill="#212121" opacity="0.88"/>
        <rect x="44" y="6" width="4" height="22" fill="#212121" opacity="0.88"/>
      </g>
      <circle cx="16" cy="15" r="2.1" fill="#212121"/><circle cx="15.5" cy="14.5" r="0.65" fill="#fff"/>
      <path d="M32 7 Q35 2 38 7" fill="#ffee58"/>
    </svg>`;
  }

  // 圆斑纹：蓝底白点（灯科感，不是鲶鱼）
  if (kind === 'spots') {
    return `<svg viewBox="0 0 74 34" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#e1f5fe"/><stop offset="45%" stop-color="#29b6f6"/><stop offset="100%" stop-color="#0277bd"/>
        </linearGradient>
        <clipPath id="${id}c"><ellipse cx="34" cy="17" rx="25" ry="10.5"/></clipPath>
      </defs>
      <path d="M57 10 C66 14 72 17 72 17 C72 17 66 20 57 24 Z" fill="#01579b"/>
      <ellipse cx="34" cy="17" rx="25" ry="10.5" fill="url(#${id}b)" stroke="#01579b" stroke-width="0.5"/>
      <g clip-path="url(#${id}c)">
        <circle cx="22" cy="14" r="2.2" fill="#fff" opacity="0.9"/>
        <circle cx="32" cy="20" r="2.4" fill="#fff" opacity="0.85"/>
        <circle cx="42" cy="13" r="2" fill="#fff" opacity="0.9"/>
        <circle cx="48" cy="19" r="1.8" fill="#fff" opacity="0.8"/>
        <circle cx="28" cy="12" r="1.4" fill="#b3e5fc"/>
      </g>
      <circle cx="17" cy="15.5" r="2" fill="#0d47a1"/><circle cx="16.5" cy="15" r="0.6" fill="#fff"/>
    </svg>`;
  }

  // 虎皮纹：橙底竖黑纹（短胖，不是鲶鱼）
  if (kind === 'tiger') {
    return `<svg viewBox="0 0 70 38" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffe0b2"/><stop offset="50%" stop-color="#ff9800"/><stop offset="100%" stop-color="#ef6c00"/>
        </linearGradient>
        <clipPath id="${id}c"><ellipse cx="32" cy="19" rx="22" ry="13"/></clipPath>
      </defs>
      <path d="M52 12 C60 16 66 19 66 19 C66 19 60 22 52 26 Z" fill="#e65100"/>
      <ellipse cx="32" cy="19" rx="22" ry="13" fill="url(#${id}b)" stroke="#e65100" stroke-width="0.55"/>
      <g clip-path="url(#${id}c)">
        <path d="M18 8 Q20 19 18 30" stroke="#212121" stroke-width="2.4" fill="none"/>
        <path d="M28 7 Q30 19 28 31" stroke="#212121" stroke-width="2.6" fill="none"/>
        <path d="M38 8 Q40 19 38 30" stroke="#212121" stroke-width="2.4" fill="none"/>
      </g>
      <circle cx="17" cy="17" r="2.1" fill="#212121"/><circle cx="16.5" cy="16.5" r="0.6" fill="#fff"/>
      <path d="M30 8 Q33 2 36 8" fill="#ffb74d"/>
    </svg>`;
  }

  // 孔雀彩：粉紫长尾（不是鲶鱼）
  if (kind === 'peacock') {
    return `<svg viewBox="0 0 78 42" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f8bbd0"/><stop offset="45%" stop-color="#ec407a"/><stop offset="100%" stop-color="#7b1fa2"/>
        </linearGradient>
      </defs>
      <path d="M48 8 C62 4 76 12 78 21 C76 30 62 38 48 34 C52 26 52 16 48 8Z" fill="#ce93d8" opacity="0.9"/>
      <path d="M52 14 C64 12 72 18 74 21 C72 24 64 30 52 28" fill="#ab47bc" opacity="0.55"/>
      <ellipse cx="30" cy="21" rx="20" ry="9.5" fill="url(#${id}b)" stroke="#880e4f" stroke-width="0.5"/>
      <ellipse cx="26" cy="17" rx="7" ry="3.5" fill="#fce4ec" opacity="0.45"/>
      <circle cx="24" cy="21" r="1.6" fill="#ffe082"/><circle cx="32" cy="18" r="1.2" fill="#80deea"/>
      <circle cx="15" cy="19" r="2" fill="#4a148c"/><circle cx="14.5" cy="18.5" r="0.55" fill="#fff"/>
      <path d="M28 12 Q32 5 36 12" fill="#f48fb1"/>
    </svg>`;
  }

  // 燕尾纹：银白+黑竖带，三角尾（燕鱼感，不是鲶鱼）
  if (kind === 'angel') {
    return `<svg viewBox="0 0 70 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fafafa"/><stop offset="100%" stop-color="#b0bec5"/>
        </linearGradient>
      </defs>
      <path d="M34 4 L40 22 L34 26 L28 22 Z" fill="#eceff1" stroke="#78909c" stroke-width="0.4"/>
      <path d="M34 46 L40 28 L34 24 L28 28 Z" fill="#cfd8dc" stroke="#78909c" stroke-width="0.4"/>
      <ellipse cx="30" cy="25" rx="16" ry="12" fill="url(#${id}b)" stroke="#546e7a" stroke-width="0.55"/>
      <path d="M22 14 L24 36" stroke="#212121" stroke-width="2.2"/>
      <path d="M30 13 L32 37" stroke="#212121" stroke-width="2.4"/>
      <path d="M38 15 L39 35" stroke="#212121" stroke-width="1.8"/>
      <path d="M44 20 C52 22 58 25 58 25 C58 25 52 28 44 30 Z" fill="#90a4ae"/>
      <circle cx="18" cy="23" r="1.9" fill="#263238"/><circle cx="17.5" cy="22.5" r="0.55" fill="#fff"/>
    </svg>`;
  }

  // 鲶鱼感：扁头+触须+淡斑 —— 全缸最多 1～2 条
  if (kind === 'catfish') {
    return `<svg viewBox="0 0 84 36" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d7ccc8"/><stop offset="55%" stop-color="#8d6e63"/><stop offset="100%" stop-color="#5d4037"/>
        </linearGradient>
      </defs>
      <path d="M62 12 C72 15 80 18 80 18 C80 18 72 21 62 24 Z" fill="#4e342e"/>
      <ellipse cx="38" cy="18" rx="30" ry="10" fill="url(#${id}b)" stroke="#4e342e" stroke-width="0.55"/>
      <ellipse cx="18" cy="18" rx="10" ry="8" fill="#a1887f" stroke="#4e342e" stroke-width="0.4"/>
      <circle cx="22" cy="14" r="2.2" fill="#3e2723" opacity="0.45"/>
      <circle cx="34" cy="20" r="2.6" fill="#3e2723" opacity="0.4"/>
      <circle cx="46" cy="15" r="2" fill="#3e2723" opacity="0.35"/>
      <!-- 触须 -->
      <path d="M12 20 Q2 28 6 32" fill="none" stroke="#5d4037" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M12 16 Q0 10 4 6" fill="none" stroke="#5d4037" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M14 22 Q8 30 12 34" fill="none" stroke="#6d4c41" stroke-width="1" stroke-linecap="round"/>
      <circle cx="14" cy="16" r="2" fill="#212121"/><circle cx="13.5" cy="15.5" r="0.55" fill="#fff"/>
    </svg>`;
  }

  // fallback
  return tankFishSVG('zebra');
}

function openTankScene() {
  document.getElementById('tank-overlay').classList.add('open');
  initTankFish();
}

function closeTankScene() {
  document.getElementById('tank-overlay').classList.remove('open');
  tankScene.feeding = false;
  tankScene.swimTimers.forEach(clearTimeout);
  tankScene.swimTimers = [];
  const water = document.getElementById('tank-water');
  if (water) {
    water.querySelectorAll('.tank-fish, .tank-pellet').forEach(el => el.remove());
  }
  tankScene.fish = [];
  const btn = document.getElementById('tank-feed-btn');
  if (btn) btn.disabled = false;
}

function spawnTankFish(water, kind, isFry) {
  const el = document.createElement('div');
  el.className = isFry ? 'tank-fish fry' : 'tank-fish';
  if (kind === 'angel' && !isFry) {
    el.style.width = '58px';
    el.style.height = '42px';
  }
  if (kind === 'catfish' && !isFry) {
    el.style.width = '72px';
    el.style.height = '32px';
  }
  el.innerHTML = tankFishSVG(kind);
  el.dataset.kind = kind;
  el.title = TANK_PATTERN_NAMES[kind] || (isFry ? '小鱼苗' : '观赏鱼');
  const left = isFry ? (20 + Math.random() * 50) : (8 + Math.random() * 70);
  const top = isFry ? (35 + Math.random() * 30) : (16 + Math.random() * 48);
  el.style.left = left + '%';
  el.style.top = top + '%';
  if (Math.random() > 0.5) el.classList.add('flip');
  water.appendChild(el);
  const idx = tankScene.fish.length;
  tankScene.fish.push({
    el, left, top,
    facingRight: el.classList.contains('flip'),
    isFry: !!isFry,
    kind,
  });
  scheduleTankSwim(idx);
}

function initTankFish() {
  const water = document.getElementById('tank-water');
  if (!water) return;
  water.querySelectorAll('.tank-fish, .tank-pellet').forEach(el => el.remove());
  tankScene.swimTimers.forEach(clearTimeout);
  tankScene.swimTimers = [];
  tankScene.fish = [];

  // 多种花纹；每种 2～3 条同款（外形各不相同，不全像鲶鱼）
  const patternGroups = [
    { kind: 'zebra', count: 3 },
    { kind: 'spots', count: 2 },
    { kind: 'tiger', count: 3 },
    { kind: 'peacock', count: 2 },
    { kind: 'angel', count: 2 },
  ];
  patternGroups.forEach(g => {
    for (let i = 0; i < g.count; i++) spawnTankFish(water, g.kind, false);
  });

  // 鲶鱼感：最多 1～2 条
  spawnTankFish(water, 'catfish', false);

  // 小鱼苗
  for (let i = 0; i < 6; i++) spawnTankFish(water, 'fry', true);
}

function scheduleTankSwim(index) {
  if (tankScene.swimTimers[index]) clearTimeout(tankScene.swimTimers[index]);
  const f = tankScene.fish[index];
  const delay = f && f.isFry
    ? (5000 + Math.random() * 4000)
    : (4200 + Math.random() * 3800);
  tankScene.swimTimers[index] = setTimeout(() => {
    if (!document.getElementById('tank-overlay').classList.contains('open')) return;
    if (tankScene.feeding) {
      scheduleTankSwim(index);
      return;
    }
    idleSwimTankFish(index);
    scheduleTankSwim(index);
  }, delay);
}

function idleSwimTankFish(index) {
  const f = tankScene.fish[index];
  if (!f || !f.el.isConnected) return;
  // 鱼苗步子更小，多在中下层慢慢晃
  const stepX = f.isFry ? 10 : 22;
  const stepY = f.isFry ? 8 : 14;
  const minT = f.isFry ? 28 : 14;
  const maxT = f.isFry ? 68 : 62;
  const nextL = Math.max(6, Math.min(78, f.left + (Math.random() * stepX - stepX / 2)));
  const nextT = Math.max(minT, Math.min(maxT, f.top + (Math.random() * stepY - stepY / 2)));
  f.facingRight = nextL >= f.left;
  f.el.classList.toggle('flip', f.facingRight);
  f.left = nextL;
  f.top = nextT;
  f.el.style.left = nextL + '%';
  f.el.style.top = nextT + '%';
}

function feedTankFish() {
  if (tankScene.feeding) return;
  const water = document.getElementById('tank-water');
  const btn = document.getElementById('tank-feed-btn');
  if (!water || !tankScene.fish.length) return;

  tankScene.feeding = true;
  if (btn) btn.disabled = true;
  showToast('撒了点饲料…', '#ffe082');

  const pellets = [];
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.className = 'tank-pellet';
    const x = 18 + Math.random() * 64;
    p.style.left = x + '%';
    p.style.top = (4 + Math.random() * 8) + '%';
    p.style.animationDelay = (i * 0.07) + 's';
    if (i >= 6) {
      p.style.width = '5px';
      p.style.height = '5px';
    }
    water.appendChild(p);
    pellets.push({ el: p, x, y: 42 + Math.random() * 28 });
  }

  // 大鱼 + 小鱼苗都会游向饲料
  setTimeout(() => {
    tankScene.fish.forEach((f, i) => {
      const target = pellets[i % pellets.length];
      const jitter = f.isFry ? 8 : 5;
      const tx = Math.max(6, Math.min(78, target.x - 4 + (Math.random() * jitter * 2 - jitter)));
      const ty = Math.max(12, Math.min(68, target.y - (f.isFry ? 4 : 8)));
      f.facingRight = tx >= f.left;
      f.el.classList.toggle('flip', f.facingRight);
      f.el.classList.add('eating');
      f.left = tx;
      f.top = ty;
      f.el.style.left = tx + '%';
      f.el.style.top = ty + '%';
    });
  }, 280);

  setTimeout(() => {
    pellets.forEach(p => {
      if (p.el.isConnected) {
        p.el.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        p.el.style.opacity = '0';
        p.el.style.transform = 'scale(0.2)';
        setTimeout(() => p.el.remove(), 280);
      }
    });
    tankScene.fish.forEach(f => f.el.classList.remove('eating'));
    showToast('大鱼小鱼都吃饱啦', '#a5d6a7');
    tankScene.feeding = false;
    if (btn) btn.disabled = false;
  }, 1800);
}

// ── Blow Bubble mini scene（吹泡比赛雏形）───────────────────────────
const BLOW_SAFE_MAX = 0.78;   // 进度条安全上限（再高进入危险）
const BLOW_POP_AT = 1.0;      // 吹满就破
const blowScene = {
  blowing: false,
  size: 0,          // 0～1
  raf: 0,
  lastTs: 0,
  locked: false,    // 破掉后短暂锁一下
};

function openBlowScene() {
  document.getElementById('blow-overlay').classList.add('open');
  resetBlowBubble(true);
  setBlowStatus('按住按钮吹大气泡，别吹破～');
}

function closeBlowScene() {
  stopBlowInflate();
  document.getElementById('blow-overlay').classList.remove('open');
  const stage = document.getElementById('blow-stage');
  if (stage) stage.querySelectorAll('.blow-kept, .blow-pop-bit').forEach(el => el.remove());
  resetBlowBubble(true);
}

function setBlowStatus(text) {
  const el = document.getElementById('blow-status');
  if (el) el.textContent = text || '';
}

function resetBlowBubble(clearMeter) {
  blowScene.size = 0;
  blowScene.locked = false;
  const active = document.getElementById('blow-active');
  if (active) {
    active.classList.remove('show', 'danger');
    active.style.width = '28px';
    active.style.height = '28px';
    active.style.marginLeft = '-14px';
    active.style.setProperty('--blow-scale', '1');
    active.style.transform = 'scale(0.4)';
    active.style.opacity = '0';
  }
  if (clearMeter) {
    const fill = document.getElementById('blow-meter-fill');
    if (fill) fill.style.width = '0%';
  }
  const btn = document.getElementById('blow-btn');
  if (btn) btn.classList.remove('blowing');
}

function updateBlowVisual() {
  const active = document.getElementById('blow-active');
  const fill = document.getElementById('blow-meter-fill');
  if (!active) return;
  const px = 28 + blowScene.size * 200;
  active.classList.add('show');
  active.style.opacity = '1';
  active.style.width = px + 'px';
  active.style.height = px + 'px';
  active.style.marginLeft = (-px / 2) + 'px';
  const scale = 1;
  active.style.setProperty('--blow-scale', String(scale));
  if (blowScene.size >= BLOW_SAFE_MAX) {
    active.classList.add('danger');
    active.style.transform = `scale(${scale})`;
  } else {
    active.classList.remove('danger');
    active.style.transform = `scale(${scale})`;
  }
  if (fill) fill.style.width = Math.min(100, blowScene.size * 100) + '%';
}

function blowInflateTick(ts) {
  if (!blowScene.blowing) return;
  if (!blowScene.lastTs) blowScene.lastTs = ts;
  const dt = Math.min(40, ts - blowScene.lastTs) / 1000;
  blowScene.lastTs = ts;
  // 大约 2.2 秒吹到满
  blowScene.size = Math.min(BLOW_POP_AT + 0.05, blowScene.size + dt * 0.45);
  updateBlowVisual();

  if (blowScene.size >= BLOW_POP_AT) {
    popBlowBubble();
    return;
  }
  if (blowScene.size >= BLOW_SAFE_MAX) {
    setBlowStatus('危险！快松手，要破了！');
  } else {
    setBlowStatus('继续吹…');
  }
  blowScene.raf = requestAnimationFrame(blowInflateTick);
}

function startBlowInflate(e) {
  if (e) e.preventDefault();
  if (blowScene.locked || blowScene.blowing) return;
  if (!document.getElementById('blow-overlay').classList.contains('open')) return;
  blowScene.blowing = true;
  blowScene.size = Math.max(0.08, blowScene.size);
  blowScene.lastTs = 0;
  const btn = document.getElementById('blow-btn');
  if (btn) btn.classList.add('blowing');
  updateBlowVisual();
  setBlowStatus('呼——正在吹…');
  blowScene.raf = requestAnimationFrame(blowInflateTick);
}

function stopBlowInflate(e) {
  if (e) e.preventDefault();
  if (!blowScene.blowing) return;
  blowScene.blowing = false;
  if (blowScene.raf) {
    cancelAnimationFrame(blowScene.raf);
    blowScene.raf = 0;
  }
  const btn = document.getElementById('blow-btn');
  if (btn) btn.classList.remove('blowing');

  if (blowScene.locked) return;
  if (blowScene.size < 0.12) {
    resetBlowBubble(true);
    setBlowStatus('吹太短了，再试一次');
    return;
  }
  if (blowScene.size >= BLOW_POP_AT) return;
  keepBlowBubble();
}

function keepBlowBubble() {
  const stage = document.getElementById('blow-stage');
  const active = document.getElementById('blow-active');
  if (!stage || !active) return;
  const px = 28 + blowScene.size * 200;
  const kept = document.createElement('div');
  kept.className = 'blow-kept';
  kept.style.width = px + 'px';
  kept.style.height = px + 'px';
  kept.style.left = '50%';
  kept.style.marginLeft = (-px / 2) + 'px';
  kept.style.bottom = '78px';
  stage.appendChild(kept);
  setTimeout(() => kept.remove(), 4600);

  const rating = blowScene.size >= BLOW_SAFE_MAX
    ? '好险！超大泡泡'
    : blowScene.size >= 0.55
      ? '漂亮的大泡泡！'
      : '泡泡留下了';
  showToast(rating, '#ce93d8');
  setBlowStatus(rating + ' · 再按住吹下一个');
  resetBlowBubble(true);
}

function popBlowBubble() {
  blowScene.blowing = false;
  blowScene.locked = true;
  if (blowScene.raf) {
    cancelAnimationFrame(blowScene.raf);
    blowScene.raf = 0;
  }
  const stage = document.getElementById('blow-stage');
  const active = document.getElementById('blow-active');
  const btn = document.getElementById('blow-btn');
  if (btn) btn.classList.remove('blowing');

  if (stage && active) {
    const rect = active.getBoundingClientRect();
    const srect = stage.getBoundingClientRect();
    const cx = rect.left + rect.width / 2 - srect.left;
    const cy = rect.top + rect.height / 2 - srect.top;
    for (let i = 0; i < 12; i++) {
      const bit = document.createElement('div');
      bit.className = 'blow-pop-bit';
      bit.style.left = cx + 'px';
      bit.style.top = cy + 'px';
      const ang = (Math.PI * 2 * i) / 12;
      const dist = 28 + Math.random() * 50;
      bit.style.setProperty('--px', Math.cos(ang) * dist + 'px');
      bit.style.setProperty('--py', Math.sin(ang) * dist + 'px');
      stage.appendChild(bit);
      setTimeout(() => bit.remove(), 560);
    }
  }

  showToast('破了！吹太大了', '#ef9a9a');
  setBlowStatus('破了…等一下再吹');
  resetBlowBubble(true);
  setTimeout(() => {
    blowScene.locked = false;
    setBlowStatus('再按住吹一个，别吹太满');
  }, 700);
}

function bindBlowControls() {
  const btn = document.getElementById('blow-btn');
  if (!btn || btn.dataset.bound) return;
  btn.dataset.bound = '1';
  btn.addEventListener('mousedown', startBlowInflate);
  btn.addEventListener('touchstart', startBlowInflate, { passive: false });
  window.addEventListener('mouseup', stopBlowInflate);
  window.addEventListener('touchend', stopBlowInflate);
  window.addEventListener('touchcancel', stopBlowInflate);
  btn.addEventListener('mouseleave', () => {
    if (blowScene.blowing) stopBlowInflate();
  });
}

// ── Pond 捞金鱼 mini scene（池塘版雏形）────────────────────────────
const POND_FAST_SPEED = 1.35; // px/ms，超过算太猛扑空
const pondScene = {
  fish: [],
  caught: 0,
  scooping: false,
  netX: 0,
  netY: 0,
  lastX: 0,
  lastY: 0,
  lastT: 0,
  speed: 0,
  raf: 0,
  hitCooldown: new WeakMap(),
};

function pondGoldSVG(big) {
  const id = 'pg' + Math.floor(Math.random() * 1e9);
  if (big) {
    return `<svg viewBox="0 0 84 44" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffe082"/><stop offset="55%" stop-color="#ff9800"/><stop offset="100%" stop-color="#e65100"/>
        </linearGradient>
      </defs>
      <path d="M58 8 C72 4 84 16 84 22 C84 28 72 40 58 36 C62 26 62 18 58 8Z" fill="#ff7043" opacity="0.9"/>
      <ellipse cx="36" cy="22" rx="28" ry="14" fill="url(#${id}b)" stroke="#e65100" stroke-width="0.6"/>
      <ellipse cx="30" cy="17" rx="10" ry="5" fill="#ffe0b2" opacity="0.4"/>
      <circle cx="18" cy="20" r="2.4" fill="#212121"/><circle cx="17.4" cy="19.4" r="0.7" fill="#fff"/>
      <path d="M34 10 Q38 2 42 10" fill="#ffb74d"/>
    </svg>`;
  }
  return `<svg viewBox="0 0 52 28" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffcc80"/><stop offset="100%" stop-color="#ff6f00"/>
      </linearGradient>
    </defs>
    <path d="M38 7 C46 10 52 14 52 14 C52 14 46 18 38 21 Z" fill="#ef6c00"/>
    <ellipse cx="24" cy="14" rx="18" ry="9" fill="url(#${id}b)" stroke="#e65100" stroke-width="0.45"/>
    <circle cx="12" cy="13" r="1.7" fill="#212121"/><circle cx="11.6" cy="12.6" r="0.5" fill="#fff"/>
  </svg>`;
}

function openPondScene() {
  document.getElementById('pond-overlay').classList.add('open');
  initPondFish();
  updatePondBowlUI();
}

function closePondScene() {
  document.getElementById('pond-overlay').classList.remove('open');
  pondScene.scooping = false;
  if (pondScene.raf) {
    cancelAnimationFrame(pondScene.raf);
    pondScene.raf = 0;
  }
  const water = document.getElementById('pond-water');
  if (water) water.querySelectorAll('.pond-gold').forEach(el => el.remove());
  pondScene.fish = [];
  const net = document.getElementById('pond-net');
  if (net) net.classList.remove('show', 'fast');
}

function initPondFish() {
  const water = document.getElementById('pond-water');
  if (!water) return;
  water.querySelectorAll('.pond-gold').forEach(el => el.remove());
  pondScene.fish = [];
  pondScene.caught = 0;

  // 小鱼若干 + 大鱼若干
  const roster = [
    { big: false }, { big: false }, { big: false }, { big: false }, { big: false },
    { big: true }, { big: true }, { big: true },
  ];
  roster.forEach((spec, i) => {
    const el = document.createElement('div');
    el.className = 'pond-gold';
    el.innerHTML = pondGoldSVG(spec.big);
    el.style.width = (spec.big ? 70 : 42) + 'px';
    el.style.height = (spec.big ? 38 : 24) + 'px';
    const x = 10 + Math.random() * 75;
    const y = 15 + Math.random() * 65;
    el.style.left = x + '%';
    el.style.top = y + '%';
    if (Math.random() > 0.5) el.classList.add('flip');
    water.appendChild(el);
    pondScene.fish.push({
      el,
      x, y,
      vx: (Math.random() * 0.035 + 0.012) * (Math.random() > 0.5 ? 1 : -1),
      vy: (Math.random() * 0.025 + 0.008) * (Math.random() > 0.5 ? 1 : -1),
      big: spec.big,
      hits: 0,
      need: spec.big ? 3 : 1,
      caught: false,
      spookUntil: 0,
    });
  });
  if (!pondScene.raf) pondScene.raf = requestAnimationFrame(tickPondFish);
  updatePondBowlUI();
}

function tickPondFish(ts) {
  if (!document.getElementById('pond-overlay').classList.contains('open')) {
    pondScene.raf = 0;
    return;
  }
  pondScene.fish.forEach(f => {
    if (f.caught || !f.el.isConnected) return;
    if (ts < f.spookUntil) {
      f.x += f.vx * 2.2;
      f.y += f.vy * 2.2;
    } else {
      f.x += f.vx;
      f.y += f.vy;
    }
    if (f.x < 4 || f.x > 88) { f.vx *= -1; f.x = Math.max(4, Math.min(88, f.x)); }
    if (f.y < 8 || f.y > 82) { f.vy *= -1; f.y = Math.max(8, Math.min(82, f.y)); }
    // 偶尔轻拐弯
    if (Math.random() < 0.008) {
      f.vx += (Math.random() - 0.5) * 0.02;
      f.vy += (Math.random() - 0.5) * 0.015;
      const sp = Math.hypot(f.vx, f.vy) || 0.02;
      const max = f.big ? 0.045 : 0.055;
      if (sp > max) { f.vx *= max / sp; f.vy *= max / sp; }
    }
    f.el.classList.toggle('flip', f.vx > 0);
    f.el.style.left = f.x + '%';
    f.el.style.top = f.y + '%';
  });

  if (pondScene.scooping) tryPondScoop(ts);
  pondScene.raf = requestAnimationFrame(tickPondFish);
}

function updatePondBowlUI() {
  const count = document.getElementById('pond-count');
  const box = document.getElementById('pond-bowl-fish');
  if (count) count.textContent = '碗里：' + pondScene.caught;
  if (!box) return;
  // 只显示最近几条
  const n = Math.min(8, pondScene.caught);
  let html = '';
  for (let i = 0; i < n; i++) html += '<span>🐟</span>';
  box.innerHTML = html;
}

function pondNetPos(clientX, clientY) {
  const water = document.getElementById('pond-water');
  if (!water) return null;
  const r = water.getBoundingClientRect();
  return {
    x: clientX - r.left,
    y: clientY - r.top,
    w: r.width,
    h: r.height,
  };
}

function setPondNet(x, y, fast) {
  const net = document.getElementById('pond-net');
  if (!net) return;
  net.style.left = x + 'px';
  net.style.top = y + 'px';
  net.classList.add('show');
  net.classList.toggle('fast', !!fast);
}

function tryPondScoop(ts) {
  const water = document.getElementById('pond-water');
  const net = document.getElementById('pond-net');
  if (!water || !net || !pondScene.scooping) return;

  const tooFast = pondScene.speed > POND_FAST_SPEED;
  net.classList.toggle('fast', tooFast);

  const netR = net.getBoundingClientRect();
  const nx = netR.left + netR.width * 0.42;
  const ny = netR.top + netR.height * 0.42;
  const nrad = Math.min(netR.width, netR.height) * 0.28;

  pondScene.fish.forEach(f => {
    if (f.caught || !f.el.isConnected) return;
    if (ts < f.spookUntil) return;

    const fr = f.el.getBoundingClientRect();
    const fx = fr.left + fr.width / 2;
    const fy = fr.top + fr.height / 2;
    const dist = Math.hypot(fx - nx, fy - ny);
    if (dist > nrad + (f.big ? 10 : 6)) return;

    // 太猛：扑空，鱼受惊逃走
    if (tooFast) {
      const lastMiss = pondScene.hitCooldown.get(f.el) || 0;
      if (ts - lastMiss < 500) return;
      pondScene.hitCooldown.set(f.el, ts);
      f.spookUntil = ts + 900;
      f.vx = (f.x < 50 ? -1 : 1) * (0.06 + Math.random() * 0.04);
      f.vy = (Math.random() - 0.5) * 0.08;
      showToast('太猛了，扑空！', '#ffcc80');
      return;
    }

    const lastHit = pondScene.hitCooldown.get(f.el) || 0;
    if (ts - lastHit < 280) return;
    pondScene.hitCooldown.set(f.el, ts);

    f.hits += 1;
    f.el.classList.add('hit');
    setTimeout(() => f.el.classList.remove('hit'), 200);

    if (f.hits >= f.need) {
      catchPondFish(f);
    } else {
      showToast(`大鱼还要捞 ${f.need - f.hits} 下`, '#ffe082');
    }
  });
}

function catchPondFish(f) {
  if (f.caught) return;
  f.caught = true;
  pondScene.caught += 1;
  const bowl = document.getElementById('pond-bowl');
  const water = document.getElementById('pond-water');
  if (bowl && water && f.el) {
    const wr = water.getBoundingClientRect();
    const br = bowl.getBoundingClientRect();
    const tx = ((br.left + br.width / 2 - wr.left) / wr.width) * 100;
    const ty = ((br.top + br.height / 2 - wr.top) / wr.height) * 100;
    f.el.classList.add('catching');
    f.el.style.left = tx + '%';
    f.el.style.top = ty + '%';
  }
  showToast(f.big ? '捞到大金鱼！' : '捞到小金鱼！', '#ffcc80');
  updatePondBowlUI();
  setTimeout(() => {
    if (f.el && f.el.isConnected) f.el.remove();
  }, 480);

  // 鱼不够时补几条
  const alive = pondScene.fish.filter(x => !x.caught).length;
  if (alive < 4) {
    setTimeout(() => {
      if (!document.getElementById('pond-overlay').classList.contains('open')) return;
      const water2 = document.getElementById('pond-water');
      if (!water2) return;
      const big = Math.random() < 0.35;
      const el = document.createElement('div');
      el.className = 'pond-gold';
      el.innerHTML = pondGoldSVG(big);
      el.style.width = (big ? 70 : 42) + 'px';
      el.style.height = (big ? 38 : 24) + 'px';
      const x = 10 + Math.random() * 75;
      const y = 15 + Math.random() * 65;
      el.style.left = x + '%';
      el.style.top = y + '%';
      water2.appendChild(el);
      pondScene.fish.push({
        el, x, y,
        vx: (Math.random() * 0.035 + 0.012) * (Math.random() > 0.5 ? 1 : -1),
        vy: (Math.random() * 0.025 + 0.008) * (Math.random() > 0.5 ? 1 : -1),
        big, hits: 0, need: big ? 3 : 1, caught: false, spookUntil: 0,
      });
    }, 600);
  }
}

function bindPondControls() {
  const water = document.getElementById('pond-water');
  if (!water || water.dataset.bound) return;
  water.dataset.bound = '1';

  const onDown = e => {
    if (!document.getElementById('pond-overlay').classList.contains('open')) return;
    e.preventDefault();
    const t = e.touches ? e.touches[0] : e;
    const p = pondNetPos(t.clientX, t.clientY);
    if (!p) return;
    pondScene.scooping = true;
    pondScene.netX = p.x;
    pondScene.netY = p.y;
    pondScene.lastX = p.x;
    pondScene.lastY = p.y;
    pondScene.lastT = performance.now();
    pondScene.speed = 0;
    setPondNet(p.x, p.y, false);
  };

  const onMove = e => {
    if (!pondScene.scooping) return;
    e.preventDefault();
    const t = e.touches ? e.touches[0] : e;
    const p = pondNetPos(t.clientX, t.clientY);
    if (!p) return;
    const now = performance.now();
    const dt = Math.max(8, now - pondScene.lastT);
    const dist = Math.hypot(p.x - pondScene.lastX, p.y - pondScene.lastY);
    pondScene.speed = dist / dt;
    pondScene.lastX = p.x;
    pondScene.lastY = p.y;
    pondScene.lastT = now;
    pondScene.netX = Math.max(0, Math.min(p.w, p.x));
    pondScene.netY = Math.max(0, Math.min(p.h, p.y));
    setPondNet(pondScene.netX, pondScene.netY, pondScene.speed > POND_FAST_SPEED);
  };

  const onUp = () => {
    pondScene.scooping = false;
    pondScene.speed = 0;
    const net = document.getElementById('pond-net');
    if (net) {
      net.classList.remove('fast');
      // 松手后网还留一会儿
      setTimeout(() => {
        if (!pondScene.scooping && net) net.classList.remove('show');
      }, 180);
    }
  };

  water.addEventListener('mousedown', onDown);
  water.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  water.addEventListener('touchstart', onDown, { passive: false });
  water.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onUp);
  window.addEventListener('touchcancel', onUp);
}

// ── Shoot 泡泡射击 mini scene（雏形：无血量/商店）──────────────────
const shootScene = {
  open: false,
  x: 50,            // 发射器位置 %
  keys: { left: false, right: false },
  dragging: false,
  holdingFireBtn: false,
  holdingFireKey: false,
  bubbles: [],
  darts: [],
  popped: 0,
  raf: 0,
  spawnAcc: 0,
  lastFire: 0,
};

function isShootFiring() {
  return shootScene.holdingFireBtn || shootScene.holdingFireKey;
}

function openShootScene() {
  document.getElementById('shoot-overlay').classList.add('open');
  shootScene.open = true;
  shootScene.x = 50;
  shootScene.popped = 0;
  shootScene.bubbles = [];
  shootScene.darts = [];
  shootScene.spawnAcc = 0;
  shootScene.holdingFireBtn = false;
  shootScene.holdingFireKey = false;
  shootScene.keys.left = false;
  shootScene.keys.right = false;
  const stage = document.getElementById('shoot-stage');
  if (stage) {
    stage.querySelectorAll('.shoot-fall, .shoot-dart').forEach(el => el.remove());
  }
  updateShootCannon();
  updateShootPoppedUI();
  if (!shootScene.raf) shootScene.raf = requestAnimationFrame(tickShootScene);
}

function closeShootScene() {
  document.getElementById('shoot-overlay').classList.remove('open');
  shootScene.open = false;
  shootScene.keys.left = false;
  shootScene.keys.right = false;
  shootScene.dragging = false;
  shootScene.holdingFireBtn = false;
  shootScene.holdingFireKey = false;
  if (shootScene.raf) {
    cancelAnimationFrame(shootScene.raf);
    shootScene.raf = 0;
  }
  const stage = document.getElementById('shoot-stage');
  if (stage) stage.querySelectorAll('.shoot-fall, .shoot-dart').forEach(el => el.remove());
  shootScene.bubbles = [];
  shootScene.darts = [];
}

function updateShootCannon() {
  const c = document.getElementById('shoot-cannon');
  if (!c) return;
  shootScene.x = Math.max(8, Math.min(92, shootScene.x));
  c.style.left = shootScene.x + '%';
}

function updateShootPoppedUI() {
  const el = document.getElementById('shoot-popped');
  if (el) el.textContent = '破了：' + shootScene.popped;
}

function spawnShootBubble() {
  const stage = document.getElementById('shoot-stage');
  if (!stage) return;
  const colors = ['rgba(129,212,250,0.5)', 'rgba(244,143,177,0.45)', 'rgba(255,224,130,0.5)', 'rgba(165,214,167,0.5)', 'rgba(206,147,216,0.45)'];
  const size = 28 + Math.random() * 26;
  const el = document.createElement('div');
  el.className = 'shoot-fall';
  el.style.width = size + 'px';
  el.style.height = size + 'px';
  el.style.setProperty('--bc', colors[Math.floor(Math.random() * colors.length)]);
  const x = 8 + Math.random() * 84;
  el.style.left = x + '%';
  el.style.top = (-size) + 'px';
  stage.appendChild(el);
  shootScene.bubbles.push({
    el,
    x,
    y: -size,
    r: size / 2,
    vy: 0.9 + Math.random() * 1.4,
    alive: true,
  });
}

function fireShootDart() {
  if (!shootScene.open) return;
  const now = performance.now();
  if (now - shootScene.lastFire < 160) return;
  shootScene.lastFire = now;
  const stage = document.getElementById('shoot-stage');
  if (!stage) return;
  const el = document.createElement('div');
  el.className = 'shoot-dart';
  el.style.left = shootScene.x + '%';
  el.style.bottom = '62px';
  stage.appendChild(el);
  const stageH = stage.clientHeight || 400;
  shootScene.darts.push({
    el,
    x: shootScene.x,
    y: stageH - 62,
    vy: 7.5,
    alive: true,
  });
}

function popShootBubble(b) {
  if (!b.alive) return;
  b.alive = false;
  shootScene.popped += 1;
  updateShootPoppedUI();
  b.el.classList.add('pop');
  setTimeout(() => { if (b.el.isConnected) b.el.remove(); }, 280);
}

function tickShootScene(ts) {
  if (!shootScene.open) {
    shootScene.raf = 0;
    return;
  }
  const stage = document.getElementById('shoot-stage');
  if (!stage) {
    shootScene.raf = requestAnimationFrame(tickShootScene);
    return;
  }
  const stageH = stage.clientHeight || 400;

  // 移动（可与按住发射同时进行）
  const move = (shootScene.keys.left ? -1 : 0) + (shootScene.keys.right ? 1 : 0);
  if (move) {
    shootScene.x += move * 1.35;
    updateShootCannon();
  }

  // 按住连发（fireShootDart 内部有射速间隔）
  if (isShootFiring()) fireShootDart();

  // 生成下落泡
  shootScene.spawnAcc += 1;
  if (shootScene.spawnAcc > 42) {
    shootScene.spawnAcc = 0;
    if (shootScene.bubbles.filter(b => b.alive).length < 10) spawnShootBubble();
  }

  // 更新泡
  shootScene.bubbles.forEach(b => {
    if (!b.alive || !b.el.isConnected) return;
    b.y += b.vy;
    b.el.style.top = b.y + 'px';
    b.el.style.left = b.x + '%';
    if (b.y > stageH + 40) {
      b.alive = false;
      b.el.remove();
    }
  });
  shootScene.bubbles = shootScene.bubbles.filter(b => b.alive && b.el.isConnected);

  // 更新飞针 + 碰撞
  const stageW = stage.clientWidth || 400;
  shootScene.darts.forEach(d => {
    if (!d.alive || !d.el.isConnected) return;
    d.y -= d.vy;
    d.el.style.bottom = 'auto';
    d.el.style.top = d.y + 'px';
    d.el.style.left = d.x + '%';
    if (d.y < -20) {
      d.alive = false;
      d.el.remove();
      return;
    }
    const dx = (d.x / 100) * stageW;
    const dy = d.y + 9;
    for (const b of shootScene.bubbles) {
      if (!b.alive) continue;
      const bx = (b.x / 100) * stageW + b.r;
      const by = b.y + b.r;
      if (Math.hypot(bx - dx, by - dy) < b.r + 6) {
        popShootBubble(b);
        d.alive = false;
        d.el.remove();
        break;
      }
    }
  });
  shootScene.darts = shootScene.darts.filter(d => d.alive && d.el.isConnected);

  shootScene.raf = requestAnimationFrame(tickShootScene);
}

function bindShootControls() {
  const pad = document.getElementById('shoot-pad');
  const fire = document.getElementById('shoot-fire');
  const stage = document.getElementById('shoot-stage');
  if (!pad || pad.dataset.bound) return;
  pad.dataset.bound = '1';

  const moveToClientX = clientX => {
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    shootScene.x = ((clientX - r.left) / r.width) * 100;
    updateShootCannon();
  };

  const startBtnFire = e => {
    if (!shootScene.open) return;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.pointerId === 'number' && fire) {
        try { fire.setPointerCapture(e.pointerId); } catch (_) {}
      }
    }
    const was = isShootFiring();
    shootScene.holdingFireBtn = true;
    if (!was) fireShootDart();
  };
  const stopBtnFire = () => { shootScene.holdingFireBtn = false; };
  const startKeyFire = e => {
    if (!shootScene.open) return;
    if (e) e.preventDefault();
    const was = isShootFiring();
    shootScene.holdingFireKey = true;
    if (!was) fireShootDart();
  };
  const stopKeyFire = () => { shootScene.holdingFireKey = false; };

  pad.addEventListener('mousedown', e => {
    if (!shootScene.open) return;
    if (e.target.closest('#shoot-fire')) return;
    shootScene.dragging = true;
    moveToClientX(e.clientX);
  });
  window.addEventListener('mousemove', e => {
    if (!shootScene.dragging) return;
    moveToClientX(e.clientX);
  });
  window.addEventListener('mouseup', () => { shootScene.dragging = false; });

  pad.addEventListener('touchstart', e => {
    if (!shootScene.open) return;
    if (e.target.closest('#shoot-fire')) return;
    e.preventDefault();
    shootScene.dragging = true;
    moveToClientX(e.touches[0].clientX);
  }, { passive: false });
  pad.addEventListener('touchmove', e => {
    if (!shootScene.dragging) return;
    e.preventDefault();
    moveToClientX(e.touches[0].clientX);
  }, { passive: false });
  window.addEventListener('touchend', e => {
    if (e.touches.length === 0) shootScene.dragging = false;
  });
  window.addEventListener('touchcancel', () => { shootScene.dragging = false; });

  if (fire) {
    fire.addEventListener('pointerdown', startBtnFire);
    fire.addEventListener('pointerup', stopBtnFire);
    fire.addEventListener('pointercancel', stopBtnFire);
    fire.addEventListener('lostpointercapture', stopBtnFire);
    fire.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); });
  }

  window.addEventListener('keydown', e => {
    if (!shootScene.open) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      shootScene.keys.left = true;
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      shootScene.keys.right = true;
      e.preventDefault();
    }
    if (e.key === ' ' || e.key === 'Spacebar') {
      if (!e.repeat) startKeyFire(e);
      else e.preventDefault();
    }
  });
  window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') shootScene.keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') shootScene.keys.right = false;
    if (e.key === ' ' || e.key === 'Spacebar') stopKeyFire();
  });
  window.addEventListener('blur', () => {
    stopBtnFire();
    stopKeyFire();
    shootScene.keys.left = false;
    shootScene.keys.right = false;
  });
}

// ── Match 配对消消 ────────────────────────────────────────────────
const MATCH_COLORS = [
  { id: 'blue',   color: '#81d4fa', emoji: '🔵' },
  { id: 'pink',   color: '#f48fb1', emoji: '🩷' },
  { id: 'yellow', color: '#ffe082', emoji: '🟡' },
  { id: 'green',  color: '#a5d6a7', emoji: '🟢' },
  { id: 'purple', color: '#ce93d8', emoji: '🟣' },
  { id: 'orange', color: '#ffcc80', emoji: '🟠' },
  { id: 'cyan',   color: '#80deea', emoji: '💎' },
  { id: 'red',    color: '#ef9a9a', emoji: '🔴' },
];
const matchScene = {
  cards: [],
  flipped: [],
  lock: false,
  matched: 0,
};

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function updateMatchStatus() {
  const el = document.getElementById('match-status');
  if (el) el.textContent = matchScene.matched >= 8
    ? '全部配对成功！'
    : `配对：${matchScene.matched} / 8`;
}

function buildMatchBoard() {
  const board = document.getElementById('match-board');
  if (!board) return;
  board.innerHTML = '';
  matchScene.flipped = [];
  matchScene.lock = false;
  matchScene.matched = 0;
  const deck = shuffle(MATCH_COLORS.concat(MATCH_COLORS));
  matchScene.cards = deck.map((c, i) => ({ ...c, i, matched: false }));
  matchScene.cards.forEach(card => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'match-card';
    btn.dataset.i = String(card.i);
    btn.innerHTML = `<div class="mc-inner"><div class="mc-face mc-back"></div><div class="mc-face mc-front" style="--mc:${card.color}"><span>${card.emoji}</span></div></div>`;
    btn.addEventListener('click', () => onMatchCardClick(card.i, btn));
    board.appendChild(btn);
  });
  updateMatchStatus();
}

function onMatchCardClick(i, btn) {
  if (matchScene.lock) return;
  const card = matchScene.cards[i];
  if (!card || card.matched) return;
  if (matchScene.flipped.some(f => f.i === i)) return;
  btn.classList.add('flipped');
  matchScene.flipped.push({ i, btn, id: card.id });
  if (matchScene.flipped.length < 2) return;
  matchScene.lock = true;
  const [a, b] = matchScene.flipped;
  if (a.id === b.id) {
    matchScene.cards[a.i].matched = true;
    matchScene.cards[b.i].matched = true;
    a.btn.classList.add('matched');
    b.btn.classList.add('matched');
    matchScene.matched += 1;
    matchScene.flipped = [];
    matchScene.lock = false;
    updateMatchStatus();
  } else {
    setTimeout(() => {
      a.btn.classList.remove('flipped');
      b.btn.classList.remove('flipped');
      matchScene.flipped = [];
      matchScene.lock = false;
    }, 650);
  }
}

function openMatchScene() {
  document.getElementById('match-overlay').classList.add('open');
  buildMatchBoard();
}
function closeMatchScene() {
  document.getElementById('match-overlay').classList.remove('open');
}

// ── Boat 放纸船 ───────────────────────────────────────────────────
const boatScene = {
  flying: false,
  cleared: false,
  raf: 0,
  x: 14,
  y: 55,
  vx: 0,
  vy: 0,
  lastAng: 10,
  lastPow: 58,
};

function hideBoatWin() {
  const win = document.getElementById('boat-win');
  if (win) win.classList.remove('open');
}

function showBoatWin(stars) {
  const win = document.getElementById('boat-win');
  const starsEl = document.getElementById('boat-win-stars');
  if (starsEl) {
    let html = '';
    for (let i = 1; i <= 3; i++) {
      html += i <= stars ? '⭐' : '<span class="dim">⭐</span>';
    }
    starsEl.innerHTML = html;
  }
  if (win) win.classList.add('open');
  const st = document.getElementById('boat-status');
  if (st) st.textContent = '通关！船停在对岸';
}

function boatClearStars(ang, pow) {
  // 中等力度 + 平缓角度更容易满星
  let s = 3;
  if (pow < 42 || pow > 78) s -= 1;
  if (Math.abs(ang) > 22) s -= 1;
  return Math.max(1, s);
}

function syncBoatAim() {
  const angEl = document.getElementById('boat-angle');
  const powEl = document.getElementById('boat-power');
  if (!angEl || !powEl) return;
  const ang = Number(angEl.value);
  const pow = Number(powEl.value);
  const angVal = document.getElementById('boat-angle-val');
  const powVal = document.getElementById('boat-power-val');
  if (angVal) angVal.textContent = ang + '°';
  if (powVal) powVal.textContent = String(pow);
  const aim = document.getElementById('boat-aim');
  if (aim) {
    aim.style.transform = `rotate(${-ang}deg)`;
    aim.style.width = (36 + pow * 0.5) + 'px';
    aim.style.opacity = (boatScene.flying || boatScene.cleared) ? '0' : '1';
  }
}

function resetBoatPos() {
  if (boatScene.raf) {
    cancelAnimationFrame(boatScene.raf);
    boatScene.raf = 0;
  }
  boatScene.flying = false;
  boatScene.cleared = false;
  boatScene.x = 14;
  boatScene.y = 55;
  boatScene.vx = 0;
  boatScene.vy = 0;
  hideBoatWin();
  const el = document.getElementById('paper-boat');
  if (el) {
    el.style.left = '14%';
    el.style.top = '55%';
    el.style.transform = 'rotate(0deg)';
  }
  const launch = document.getElementById('boat-launch');
  if (launch) launch.disabled = false;
  const st = document.getElementById('boat-status');
  if (st) st.textContent = '调好后点「放船」· 到黄岸通关';
  syncBoatAim();
}

function openBoatScene() {
  document.getElementById('boat-overlay').classList.add('open');
  resetBoatPos();
}
function closeBoatScene() {
  document.getElementById('boat-overlay').classList.remove('open');
  boatScene.flying = false;
  if (boatScene.raf) { cancelAnimationFrame(boatScene.raf); boatScene.raf = 0; }
  hideBoatWin();
}

function launchPaperBoat() {
  if (boatScene.flying || boatScene.cleared) return;
  if (boatScene.raf) {
    cancelAnimationFrame(boatScene.raf);
    boatScene.raf = 0;
  }
  const angDeg = Number(document.getElementById('boat-angle').value);
  const ang = angDeg * Math.PI / 180;
  const pow = Number(document.getElementById('boat-power').value) / 100;
  boatScene.lastAng = angDeg;
  boatScene.lastPow = Number(document.getElementById('boat-power').value);
  boatScene.flying = true;
  boatScene.cleared = false;
  boatScene.x = 14;
  boatScene.y = 55;
  // 稳定向右漂，角度只轻微抬/压船头；几乎总能到岸
  const speed = 1.05 + pow * 0.9;
  boatScene.vx = Math.max(0.95, Math.cos(ang) * speed + 0.55);
  boatScene.vy = -Math.sin(ang) * speed * 0.55;

  const aim = document.getElementById('boat-aim');
  if (aim) aim.style.opacity = '0';
  document.getElementById('boat-status').textContent = '漂啊漂…';
  const launchBtn = document.getElementById('boat-launch');
  if (launchBtn) launchBtn.disabled = true;

  const waterY = 52;
  const tick = () => {
    if (!boatScene.flying) return;

    boatScene.vy += (waterY - boatScene.y) * 0.0035;
    boatScene.vy *= 0.97;
    // 保持向右，不衰减到停住
    if (boatScene.vx < 0.9) boatScene.vx = 0.9;
    boatScene.x += boatScene.vx;
    boatScene.y += boatScene.vy;

    if (boatScene.y < 12) { boatScene.y = 12; boatScene.vy *= -0.2; }
    if (boatScene.y > 82) { boatScene.y = 82; boatScene.vy *= -0.2; }

    const el = document.getElementById('paper-boat');
    if (el) {
      el.style.left = boatScene.x + '%';
      el.style.top = boatScene.y + '%';
      const rot = Math.atan2(boatScene.vy, boatScene.vx) * 180 / Math.PI;
      el.style.transform = `rotate(${rot * 0.35}deg)`;
    }

    // 到黄岸 = 通关：停住，不踢回起点
    if (boatScene.x >= 72) {
      boatScene.flying = false;
      boatScene.cleared = true;
      boatScene.x = 82;
      boatScene.y = 48;
      if (el) {
        el.style.left = '82%';
        el.style.top = '48%';
        el.style.transform = 'rotate(-6deg)';
      }
      const stars = boatClearStars(boatScene.lastAng, boatScene.lastPow);
      showBoatWin(stars);
      return;
    }

    boatScene.raf = requestAnimationFrame(tick);
  };
  boatScene.raf = requestAnimationFrame(tick);
}

function bindBoatControls() {
  const ang = document.getElementById('boat-angle');
  const pow = document.getElementById('boat-power');
  const launch = document.getElementById('boat-launch');
  const again = document.getElementById('boat-win-again');
  if (!ang || ang.dataset.bound) return;
  ang.dataset.bound = '1';
  ang.addEventListener('input', syncBoatAim);
  pow.addEventListener('input', syncBoatAim);
  launch.addEventListener('click', () => {
    if (boatScene.flying || boatScene.cleared) return;
    launchPaperBoat();
  });
  if (again) {
    again.addEventListener('click', () => {
      resetBoatPos();
    });
  }
}

// ── Ice 敲冰块 ────────────────────────────────────────────────────
const ICE_PRIZES = ['🫧', '🐟', '🐚', '⭐', '💎', '🐠', '🫧', '🐟', '⭐'];
const iceScene = { collected: 0, total: 9 };

function updateIceStatus() {
  const el = document.getElementById('ice-status');
  if (!el) return;
  el.textContent = iceScene.collected >= iceScene.total
    ? '全部敲开了！'
    : `取出：${iceScene.collected} / ${iceScene.total}`;
}

function buildIceBoard() {
  const board = document.getElementById('ice-board');
  if (!board) return;
  board.innerHTML = '';
  iceScene.collected = 0;
  const prizes = shuffle(ICE_PRIZES);
  prizes.forEach(prize => {
    const hitsNeeded = 2 + Math.floor(Math.random() * 2); // 2–3
    let hits = 0;
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'ice-block';
    el.innerHTML = `<div class="ib-crack"></div><div class="ib-prize">${prize}</div>`;
    el.addEventListener('click', () => {
      if (el.classList.contains('broken')) return;
      hits += 1;
      el.classList.remove('hit1', 'hit2');
      if (hits === 1) el.classList.add('hit1');
      else if (hits >= 2 && hits < hitsNeeded) el.classList.add('hit2');
      if (hits >= hitsNeeded) {
        playIceCrack(3);
        el.classList.add('broken');
        iceScene.collected += 1;
        updateIceStatus();
      } else if (hits === 1) {
        playIceCrack(1);
      } else {
        playIceCrack(2);
      }
    });
    board.appendChild(el);
  });
  updateIceStatus();
}

function openIceScene() {
  document.getElementById('ice-overlay').classList.add('open');
  buildIceBoard();
}
function closeIceScene() {
  document.getElementById('ice-overlay').classList.remove('open');
}

// ── Tower 泡泡塔 ──────────────────────────────────────────────────
const TOWER_COLORS = ['#ce93d8', '#81d4fa', '#f48fb1', '#ffe082', '#a5d6a7', '#80cbc4'];
const TOWER_MAX_HEIGHT = 12;
const towerScene = {
  open: false,
  aimX: 50,
  falling: false,
  collapsed: false,
  lean: 0,
  stack: [], // {x, y, r, color, el}
  nextColor: TOWER_COLORS[0],
  best: 0,
  raf: 0,
  keys: { left: false, right: false },
};

function updateTowerStatus(msg) {
  const el = document.getElementById('tower-status');
  if (el) el.textContent = msg || (`高度：${towerScene.stack.length}` + (towerScene.best ? ` · 最高 ${towerScene.best}` : ''));
}

function setTowerDropEnabled(on) {
  const drop = document.getElementById('tower-drop');
  if (drop) drop.disabled = !on;
}

function paintTowerNext() {
  const el = document.getElementById('tower-next');
  if (!el) return;
  el.style.left = towerScene.aimX + '%';
  el.style.setProperty('--tc', towerScene.nextColor);
  el.style.opacity = towerScene.collapsed ? '0.25' : '0.9';
}

function clearTowerBubbles() {
  const stage = document.getElementById('tower-stage');
  if (stage) stage.querySelectorAll('.tower-bubble').forEach(n => n.remove());
  towerScene.stack = [];
}

function collapseTower(reason, fallX, tipDx) {
  towerScene.falling = false;
  towerScene.collapsed = true;
  setTowerDropEnabled(false);
  towerScene.best = Math.max(towerScene.best, towerScene.stack.length);
  updateTowerStatus(reason || '倒了！点重开再叠');
  const dx = tipDx || 18;
  towerScene.stack.forEach((b, i) => {
    if (!b.el) return;
    b.el.style.transition = `transform .5s ease-in ${i * 0.03}s, opacity .5s, top .55s ease-in`;
    b.el.style.transform = `translateX(${dx * (fallX >= 50 ? 1 : -1)}px) rotate(${dx * 0.4 * (fallX >= 50 ? 1 : -1)}deg)`;
    b.el.style.opacity = '0.15';
    b.el.style.top = '110%';
  });
  paintTowerNext();
}

function resetTowerScene() {
  towerScene.falling = false;
  towerScene.collapsed = false;
  towerScene.lean = 0;
  towerScene.aimX = 50;
  towerScene.nextColor = TOWER_COLORS[Math.floor(Math.random() * TOWER_COLORS.length)];
  clearTowerBubbles();
  setTowerDropEnabled(true);
  paintTowerNext();
  updateTowerStatus();
  if (towerScene.raf) { cancelAnimationFrame(towerScene.raf); towerScene.raf = 0; }
  if (towerScene.open) towerScene.raf = requestAnimationFrame(tickTowerScene);
}

function openTowerScene() {
  document.getElementById('tower-overlay').classList.add('open');
  towerScene.open = true;
  resetTowerScene();
}
function closeTowerScene() {
  document.getElementById('tower-overlay').classList.remove('open');
  towerScene.open = false;
  towerScene.falling = false;
  towerScene.collapsed = false;
  towerScene.keys.left = false;
  towerScene.keys.right = false;
  if (towerScene.raf) { cancelAnimationFrame(towerScene.raf); towerScene.raf = 0; }
}

function dropTowerBubble() {
  // 下落中 / 已倒塌 都不能再放（修：右边连点一直放）
  if (!towerScene.open || towerScene.falling || towerScene.collapsed) return;
  const stage = document.getElementById('tower-stage');
  if (!stage) return;

  if (towerScene.stack.length >= TOWER_MAX_HEIGHT) {
    collapseTower('叠满倒塌！点重开再叠', towerScene.aimX, 24);
    return;
  }

  const r = 18;
  const el = document.createElement('div');
  el.className = 'tower-bubble';
  el.style.width = (r * 2) + 'px';
  el.style.height = (r * 2) + 'px';
  el.style.marginLeft = (-r) + 'px';
  el.style.background = `radial-gradient(circle at 32% 28%, #fff, ${towerScene.nextColor} 65%)`;
  const x = towerScene.aimX;
  let y = 8;
  el.style.left = x + '%';
  el.style.top = y + '%';
  stage.appendChild(el);
  towerScene.falling = true;
  setTowerDropEnabled(false);
  const color = towerScene.nextColor;
  towerScene.nextColor = TOWER_COLORS[Math.floor(Math.random() * TOWER_COLORS.length)];
  paintTowerNext();

  const fall = () => {
    if (!towerScene.open || towerScene.collapsed) {
      if (el.isConnected) el.remove();
      towerScene.falling = false;
      return;
    }
    const stageH = stage.clientHeight || 400;
    let landYpct;
    if (towerScene.stack.length === 0) {
      landYpct = ((stageH - 24 - r) / stageH) * 100;
    } else {
      const top = towerScene.stack[towerScene.stack.length - 1];
      landYpct = top.y - (r * 2 / stageH) * 100 * 0.92;
    }

    // 塔顶已经顶到投放线：不能再叠，倒塌
    if (landYpct < 16) {
      if (el.isConnected) el.remove();
      collapseTower('太高倒了！点重开再叠', x, 22);
      return;
    }

    y += 1.8;
    el.style.top = y + '%';
    if (y < landYpct) {
      requestAnimationFrame(fall);
      return;
    }

    y = landYpct;
    el.style.top = y + '%';

    if (towerScene.stack.length > 0) {
      const top = towerScene.stack[towerScene.stack.length - 1];
      const dx = x - top.x;
      // 累计偏移：一直停在最右/最左连点也会越来越歪
      towerScene.lean += dx * (1 + towerScene.stack.length * 0.08);
      const tipByOffset = Math.abs(dx) > 9;
      const tipByLean = Math.abs(towerScene.lean) > 16;
      if (tipByOffset || tipByLean) {
        el.style.transition = 'top .45s ease-in, left .45s ease-in, opacity .45s';
        el.style.top = '110%';
        el.style.left = (x + dx * 0.8) + '%';
        el.style.opacity = '0';
        setTimeout(() => { if (el.isConnected) el.remove(); }, 500);
        collapseTower('倒了！点重开再叠', x, Math.abs(dx) || Math.abs(towerScene.lean));
        return;
      }
    }

    towerScene.stack.push({ x, y, r, color, el });
    towerScene.falling = false;
    towerScene.best = Math.max(towerScene.best, towerScene.stack.length);
    setTowerDropEnabled(true);
    updateTowerStatus();
  };
  requestAnimationFrame(fall);
}

function tickTowerScene() {
  if (!towerScene.open) {
    towerScene.raf = 0;
    return;
  }
  if (!towerScene.falling && !towerScene.collapsed) {
    const move = (towerScene.keys.left ? -1 : 0) + (towerScene.keys.right ? 1 : 0);
    if (move) {
      towerScene.aimX = Math.max(12, Math.min(88, towerScene.aimX + move * 1.4));
      paintTowerNext();
    }
  }
  towerScene.raf = requestAnimationFrame(tickTowerScene);
}

function bindTowerControls() {
  const stage = document.getElementById('tower-stage');
  const drop = document.getElementById('tower-drop');
  if (!stage || stage.dataset.bound) return;
  stage.dataset.bound = '1';

  const aimTo = clientX => {
    if (towerScene.collapsed || towerScene.falling) return;
    const r = stage.getBoundingClientRect();
    towerScene.aimX = Math.max(12, Math.min(88, ((clientX - r.left) / r.width) * 100));
    paintTowerNext();
  };
  stage.addEventListener('mousemove', e => {
    if (!towerScene.open || towerScene.falling || towerScene.collapsed) return;
    aimTo(e.clientX);
  });
  stage.addEventListener('touchmove', e => {
    if (!towerScene.open || towerScene.falling || towerScene.collapsed) return;
    e.preventDefault();
    aimTo(e.touches[0].clientX);
  }, { passive: false });
  if (drop) drop.addEventListener('click', dropTowerBubble);

  window.addEventListener('keydown', e => {
    if (!towerScene.open) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      towerScene.keys.left = true; e.preventDefault();
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      towerScene.keys.right = true; e.preventDefault();
    }
    if (e.key === ' ' || e.key === 'Enter') {
      dropTowerBubble(); e.preventDefault();
    }
  });
  window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') towerScene.keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') towerScene.keys.right = false;
  });
}

// ── Catch 接泡 ────────────────────────────────────────────────────
const CATCH_COLORS = ['#80cbc4', '#81d4fa', '#f48fb1', '#ffe082', '#a5d6a7'];
const catchScene = {
  open: false, x: 50, score: 0, lives: 3, items: [], raf: 0, spawnAcc: 0,
  keys: { left: false, right: false }, dragging: false,
};

function updateCatchStatus() {
  const el = document.getElementById('catch-status');
  if (el) el.textContent = catchScene.lives <= 0
    ? `结束！接到 ${catchScene.score} · 点重开`
    : `接到：${catchScene.score} · 命：${catchScene.lives}`;
}

function resetCatchScene() {
  const stage = document.getElementById('catch-stage');
  if (stage) stage.querySelectorAll('.catch-fall').forEach(n => n.remove());
  catchScene.items = [];
  catchScene.score = 0;
  catchScene.lives = 3;
  catchScene.x = 50;
  catchScene.spawnAcc = 0;
  const basket = document.getElementById('catch-basket');
  if (basket) basket.style.left = '50%';
  updateCatchStatus();
}

function openCatchScene() {
  document.getElementById('catch-overlay').classList.add('open');
  catchScene.open = true;
  resetCatchScene();
  if (!catchScene.raf) catchScene.raf = requestAnimationFrame(tickCatchScene);
}
function closeCatchScene() {
  document.getElementById('catch-overlay').classList.remove('open');
  catchScene.open = false;
  catchScene.keys.left = false;
  catchScene.keys.right = false;
  if (catchScene.raf) { cancelAnimationFrame(catchScene.raf); catchScene.raf = 0; }
}

function spawnCatchItem() {
  const stage = document.getElementById('catch-stage');
  if (!stage) return;
  const bomb = Math.random() < 0.22;
  const size = bomb ? 28 : 22 + Math.random() * 14;
  const el = document.createElement('div');
  el.className = 'catch-fall ' + (bomb ? 'bomb' : 'good');
  el.style.width = size + 'px';
  el.style.height = size + 'px';
  if (!bomb) el.style.setProperty('--cc', CATCH_COLORS[Math.floor(Math.random() * CATCH_COLORS.length)]);
  const x = 8 + Math.random() * 84;
  el.style.left = x + '%';
  el.style.top = (-size) + 'px';
  stage.appendChild(el);
  catchScene.items.push({ el, x, y: -size, r: size / 2, vy: 1.1 + Math.random() * 1.3, bomb, alive: true });
}

function tickCatchScene() {
  if (!catchScene.open) { catchScene.raf = 0; return; }
  const stage = document.getElementById('catch-stage');
  const basket = document.getElementById('catch-basket');
  if (!stage || !basket) {
    catchScene.raf = requestAnimationFrame(tickCatchScene);
    return;
  }
  const move = (catchScene.keys.left ? -1 : 0) + (catchScene.keys.right ? 1 : 0);
  if (move) {
    catchScene.x = Math.max(8, Math.min(92, catchScene.x + move * 1.6));
    basket.style.left = catchScene.x + '%';
  }
  if (catchScene.lives > 0) {
    catchScene.spawnAcc += 1;
    if (catchScene.spawnAcc > 36) {
      catchScene.spawnAcc = 0;
      if (catchScene.items.filter(i => i.alive).length < 8) spawnCatchItem();
    }
  }
  const stageH = stage.clientHeight || 400;
  const stageW = stage.clientWidth || 400;
  const bx = (catchScene.x / 100) * stageW;
  const by = stageH - 26;
  catchScene.items.forEach(it => {
    if (!it.alive || !it.el.isConnected) return;
    it.y += it.vy;
    it.el.style.top = it.y + 'px';
    it.el.style.left = it.x + '%';
    const ix = (it.x / 100) * stageW + it.r;
    const iy = it.y + it.r;
    if (iy > by - 8 && iy < by + 18 && Math.abs(ix - bx) < 36) {
      it.alive = false;
      it.el.remove();
      if (catchScene.lives <= 0) return;
      if (it.bomb) {
        catchScene.lives -= 1;
        updateCatchStatus();
      } else {
        catchScene.score += 1;
        updateCatchStatus();
      }
      return;
    }
    if (it.y > stageH + 30) {
      it.alive = false;
      it.el.remove();
    }
  });
  catchScene.items = catchScene.items.filter(i => i.alive && i.el.isConnected);
  catchScene.raf = requestAnimationFrame(tickCatchScene);
}

function bindCatchControls() {
  const stage = document.getElementById('catch-stage');
  if (!stage || stage.dataset.bound) return;
  stage.dataset.bound = '1';
  const moveTo = clientX => {
    const r = stage.getBoundingClientRect();
    catchScene.x = Math.max(8, Math.min(92, ((clientX - r.left) / r.width) * 100));
    const basket = document.getElementById('catch-basket');
    if (basket) basket.style.left = catchScene.x + '%';
  };
  stage.addEventListener('mousedown', e => { if (!catchScene.open) return; catchScene.dragging = true; moveTo(e.clientX); });
  window.addEventListener('mousemove', e => { if (catchScene.dragging) moveTo(e.clientX); });
  window.addEventListener('mouseup', () => { catchScene.dragging = false; });
  stage.addEventListener('touchstart', e => { if (!catchScene.open) return; e.preventDefault(); catchScene.dragging = true; moveTo(e.touches[0].clientX); }, { passive: false });
  stage.addEventListener('touchmove', e => { if (!catchScene.dragging) return; e.preventDefault(); moveTo(e.touches[0].clientX); }, { passive: false });
  window.addEventListener('touchend', () => { catchScene.dragging = false; });
  window.addEventListener('keydown', e => {
    if (!catchScene.open) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { catchScene.keys.left = true; e.preventDefault(); }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { catchScene.keys.right = true; e.preventDefault(); }
  });
  window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') catchScene.keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') catchScene.keys.right = false;
  });
}

// ── Rainbow 吹彩虹泡 ──────────────────────────────────────────────
const rainbowScene = { open: false, holding: false, size: 40, success: 0 };

function paintRainbowBubble() {
  const el = document.getElementById('rainbow-bubble');
  const fill = document.getElementById('rainbow-meter-fill');
  if (!el) return;
  const s = rainbowScene.size;
  el.style.width = s + 'px';
  el.style.height = s + 'px';
  el.style.marginLeft = (-s / 2) + 'px';
  el.style.marginTop = (-s / 2) + 'px';
  // 虚线圈约 120px：甜区大概 95–125
  const sweet = s >= 95 && s <= 125;
  el.classList.toggle('rainbow', sweet && !rainbowScene.holding && rainbowScene._justReleased);
  if (fill) fill.style.width = Math.min(100, ((s - 40) / 100) * 100) + '%';
}

function openRainbowScene() {
  document.getElementById('rainbow-overlay').classList.add('open');
  rainbowScene.open = true;
  rainbowScene.holding = false;
  rainbowScene.size = 40;
  rainbowScene._justReleased = false;
  document.getElementById('rainbow-status').textContent = '按住「吹」· 松在圈内变彩虹';
  paintRainbowBubble();
  document.getElementById('rainbow-bubble').classList.remove('rainbow');
}
function closeRainbowScene() {
  document.getElementById('rainbow-overlay').classList.remove('open');
  rainbowScene.open = false;
  rainbowScene.holding = false;
}

function bindRainbowControls() {
  const btn = document.getElementById('rainbow-btn');
  if (!btn || btn.dataset.bound) return;
  btn.dataset.bound = '1';
  let raf = 0;
  const grow = () => {
    if (!rainbowScene.open || !rainbowScene.holding) { raf = 0; return; }
    rainbowScene.size = Math.min(150, rainbowScene.size + 1.4);
    rainbowScene._justReleased = false;
    paintRainbowBubble();
    document.getElementById('rainbow-bubble').classList.remove('rainbow');
    if (rainbowScene.size >= 148) {
      rainbowScene.holding = false;
      document.getElementById('rainbow-status').textContent = '吹太大破了！再试';
      rainbowScene.size = 40;
      paintRainbowBubble();
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(grow);
  };
  const start = e => {
    if (!rainbowScene.open) return;
    e.preventDefault();
    rainbowScene.holding = true;
    rainbowScene._justReleased = false;
    rainbowScene.size = 40;
    document.getElementById('rainbow-bubble').classList.remove('rainbow');
    document.getElementById('rainbow-status').textContent = '继续吹…对准虚线圈大小';
    if (!raf) raf = requestAnimationFrame(grow);
  };
  const end = () => {
    if (!rainbowScene.holding) return;
    rainbowScene.holding = false;
    rainbowScene._justReleased = true;
    const s = rainbowScene.size;
    if (s >= 95 && s <= 125) {
      rainbowScene.success += 1;
      paintRainbowBubble();
      document.getElementById('rainbow-status').textContent = `彩虹成功！×${rainbowScene.success} · 再吹一个`;
    } else if (s < 95) {
      document.getElementById('rainbow-status').textContent = '太小了，再吹大一点';
      document.getElementById('rainbow-bubble').classList.remove('rainbow');
    } else {
      document.getElementById('rainbow-status').textContent = '偏大了，早一点松手';
      document.getElementById('rainbow-bubble').classList.remove('rainbow');
    }
    setTimeout(() => {
      if (!rainbowScene.open || rainbowScene.holding) return;
      rainbowScene.size = 40;
      rainbowScene._justReleased = false;
      document.getElementById('rainbow-bubble').classList.remove('rainbow');
      paintRainbowBubble();
    }, 900);
  };
  btn.addEventListener('pointerdown', start);
  btn.addEventListener('pointerup', end);
  btn.addEventListener('pointercancel', end);
  btn.addEventListener('pointerleave', e => { if (e.buttons === 0) end(); });
}

// ── Maze 泡泡迷宫 ─────────────────────────────────────────────────
// 0 path, 1 wall — 每次重开随机生成
const mazeScene = {
  open: false,
  row: 0,
  col: 0,
  cleared: false,
  grid: [],
  size: 11,
};

function shuffleDirs(dirs) {
  for (let i = dirs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
  }
  return dirs;
}

/** 递归回溯生成迷宫；尺寸取奇数，保证有解 */
function generateMazeGrid() {
  const sizes = [9, 11, 13];
  const n = sizes[Math.floor(Math.random() * sizes.length)];
  const grid = Array.from({ length: n }, () => Array(n).fill(1));

  const carve = (r, c) => {
    grid[r][c] = 0;
    const dirs = shuffleDirs([[0, 2], [0, -2], [2, 0], [-2, 0]]);
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nc > 0 && nr < n - 1 && nc < n - 1 && grid[nr][nc] === 1) {
        grid[r + dr / 2][c + dc / 2] = 0;
        carve(nr, nc);
      }
    }
  };

  // 从奇数格开始挖通
  carve(1, 1);

  // 入口 / 出口固定左上、右下，并保证连通到最近通路
  grid[0][0] = 0;
  grid[0][1] = 0;
  grid[1][0] = 0;
  grid[n - 1][n - 1] = 0;
  grid[n - 1][n - 2] = 0;
  grid[n - 2][n - 1] = 0;
  // 接到内部通路
  grid[1][1] = 0;
  grid[n - 2][n - 2] = 0;

  // 再随机拆几面墙增加岔路，避免每次都太像“单线迷宫”
  const extra = 4 + Math.floor(Math.random() * 6);
  for (let k = 0; k < extra; k++) {
    const r = 1 + Math.floor(Math.random() * (n - 2));
    const c = 1 + Math.floor(Math.random() * (n - 2));
    if (grid[r][c] === 1) {
      const openNear =
        (grid[r - 1] && grid[r - 1][c] === 0) ||
        (grid[r + 1] && grid[r + 1][c] === 0) ||
        grid[r][c - 1] === 0 ||
        grid[r][c + 1] === 0;
      if (openNear) grid[r][c] = 0;
    }
  }

  return { grid, n };
}

function mazePlaceBall() {
  const board = document.getElementById('maze-board');
  let ball = document.getElementById('maze-ball');
  if (!board) return;
  if (!ball) {
    ball = document.createElement('div');
    ball.id = 'maze-ball';
    board.appendChild(ball);
  }
  const cell = board.querySelector(`[data-r="${mazeScene.row}"][data-c="${mazeScene.col}"]`);
  if (!cell) return;
  const br = board.getBoundingClientRect();
  const cr = cell.getBoundingClientRect();
  ball.style.left = (cr.left - br.left + cr.width / 2) + 'px';
  ball.style.top = (cr.top - br.top + cr.height / 2) + 'px';
}

function buildMazeBoard() {
  const board = document.getElementById('maze-board');
  if (!board) return;
  const { grid, n } = generateMazeGrid();
  mazeScene.grid = grid;
  mazeScene.size = n;
  board.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
  board.innerHTML = '';
  mazeScene.row = 0;
  mazeScene.col = 0;
  mazeScene.cleared = false;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const cell = document.createElement('div');
      cell.className = 'maze-cell' + (grid[r][c] ? ' wall' : '');
      if (r === 0 && c === 0) cell.classList.add('start');
      if (r === n - 1 && c === n - 1) cell.classList.add('exit');
      cell.dataset.r = String(r);
      cell.dataset.c = String(c);
      board.appendChild(cell);
    }
  }
  const ball = document.createElement('div');
  ball.id = 'maze-ball';
  board.appendChild(ball);
  document.getElementById('maze-status').textContent = `新迷宫 ${n}×${n} · 推到黄格出口`;
  requestAnimationFrame(mazePlaceBall);
}

function tryMazeMove(dr, dc) {
  if (!mazeScene.open || mazeScene.cleared) return;
  const nr = mazeScene.row + dr;
  const nc = mazeScene.col + dc;
  const n = mazeScene.size;
  const grid = mazeScene.grid;
  if (!grid.length) return;
  if (nr < 0 || nc < 0 || nr >= n || nc >= n) return;
  if (grid[nr][nc]) return;
  mazeScene.row = nr;
  mazeScene.col = nc;
  mazePlaceBall();
  if (nr === n - 1 && nc === n - 1) {
    mazeScene.cleared = true;
    document.getElementById('maze-status').textContent = '通关！出迷宫了 ⭐ · 重开换新图';
  }
}

function openMazeScene() {
  document.getElementById('maze-overlay').classList.add('open');
  mazeScene.open = true;
  buildMazeBoard();
}
function closeMazeScene() {
  document.getElementById('maze-overlay').classList.remove('open');
  mazeScene.open = false;
}

function bindMazeControls() {
  const pad = document.getElementById('maze-pad');
  if (!pad || pad.dataset.bound) return;
  pad.dataset.bound = '1';
  pad.addEventListener('click', e => {
    const btn = e.target.closest('button[data-dir]');
    if (!btn) return;
    const d = btn.dataset.dir;
    if (d === 'u') tryMazeMove(-1, 0);
    if (d === 'd') tryMazeMove(1, 0);
    if (d === 'l') tryMazeMove(0, -1);
    if (d === 'r') tryMazeMove(0, 1);
  });
  window.addEventListener('keydown', e => {
    if (!mazeScene.open) return;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { tryMazeMove(-1, 0); e.preventDefault(); }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { tryMazeMove(1, 0); e.preventDefault(); }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { tryMazeMove(0, -1); e.preventDefault(); }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { tryMazeMove(0, 1); e.preventDefault(); }
  });
  window.addEventListener('resize', () => {
    if (mazeScene.open) mazePlaceBall();
  });
}

// ── Guard 护泡过河 ────────────────────────────────────────────────
const guardScene = {
  open: false, x: 12, y: 50, cleared: false, dead: false,
  spikes: [], raf: 0, spawnAcc: 0, keys: { up: false, down: false }, dragging: false,
};

function updateGuardStatus(msg) {
  const el = document.getElementById('guard-status');
  if (el) el.textContent = msg || '护航中… 上下躲开尖刺';
}

function clearGuardSpikes() {
  const stage = document.getElementById('guard-stage');
  if (stage) stage.querySelectorAll('.guard-spike').forEach(n => n.remove());
  guardScene.spikes = [];
}

function addGuardSpike(x, y, opts = {}) {
  const stage = document.getElementById('guard-stage');
  if (!stage) return;
  const fromTop = opts.fromTop != null ? opts.fromTop : y < 50;
  const el = document.createElement('div');
  el.className = 'guard-spike' + (fromTop ? '' : ' down');
  el.style.left = x + '%';
  el.style.top = y + '%';
  stage.appendChild(el);
  guardScene.spikes.push({
    el,
    x,
    y,
    fromTop,
    alive: true,
    fixed: !!opts.fixed,           // 中段固定刺，不往左飘走
    drift: opts.drift || 0,        // 缓慢上下晃，增加一点变化
    baseY: y,
    phase: Math.random() * Math.PI * 2,
  });
}

/** 起点和终点之间放少量中段刺：挡住「站中间不动」 */
function placeMidGuardSpikes() {
  // 3 根就够：一挡中央航道，上下各一，间距拉开方便躲开
  const mid = [
    { x: 36, y: 50, fromTop: true },   // 正中 —— AFK 必撞
    { x: 52, y: 28, fromTop: true },
    { x: 68, y: 72, fromTop: false },
  ];
  // 轻微随机，避免每局一模一样，但仍保证有一根靠近中线
  mid.forEach((s, i) => {
    let y = s.y + (Math.random() * 8 - 4);
    if (i === 0) y = 46 + Math.random() * 8; // 仍在中线附近
    y = Math.max(18, Math.min(82, y));
    addGuardSpike(s.x, y, { fixed: true, fromTop: y < 50, drift: i === 0 ? 0 : 0.12 });
  });
}

function resetGuardScene() {
  clearGuardSpikes();
  guardScene.x = 12;
  guardScene.y = 50;
  guardScene.cleared = false;
  guardScene.dead = false;
  guardScene.spawnAcc = 0;
  document.getElementById('guard-win').classList.remove('open');
  const b = document.getElementById('guard-bubble');
  if (b) { b.style.left = '12%'; b.style.top = '50%'; b.style.opacity = '1'; }
  placeMidGuardSpikes();
  updateGuardStatus('中段有刺，记得上下躲');
  if (guardScene.open && !guardScene.raf) {
    guardScene.raf = requestAnimationFrame(tickGuardScene);
  }
}

function openGuardScene() {
  document.getElementById('guard-overlay').classList.add('open');
  guardScene.open = true;
  resetGuardScene();
  if (!guardScene.raf) guardScene.raf = requestAnimationFrame(tickGuardScene);
}
function closeGuardScene() {
  document.getElementById('guard-overlay').classList.remove('open');
  guardScene.open = false;
  guardScene.keys.up = false;
  guardScene.keys.down = false;
  if (guardScene.raf) { cancelAnimationFrame(guardScene.raf); guardScene.raf = 0; }
}

function spawnGuardSpike() {
  // 额外飘刺很少：最多再补 1～2 根，且别扎堆
  const floating = guardScene.spikes.filter(s => s.alive && !s.fixed).length;
  if (floating >= 2) return;
  // 有时出现在中线高度，逼你动一动
  const midLane = Math.random() < 0.45;
  let y, fromTop;
  if (midLane) {
    y = 40 + Math.random() * 20;
    fromTop = y < 50;
  } else if (Math.random() < 0.5) {
    y = 14 + Math.random() * 18;
    fromTop = true;
  } else {
    y = 68 + Math.random() * 16;
    fromTop = false;
  }
  addGuardSpike(108, y, { fixed: false, fromTop });
}

function hitGuardSpike(s) {
  // 固定刺略好躲一点；飘刺同宽
  const hitX = s.fixed ? 6.5 : 5.5;
  const hitY = s.fixed ? 10 : 9;
  return Math.abs(s.x - guardScene.x) < hitX && Math.abs(s.y - guardScene.y) < hitY;
}

function tickGuardScene() {
  if (!guardScene.open) { guardScene.raf = 0; return; }
  const bubble = document.getElementById('guard-bubble');
  if (!bubble) {
    guardScene.raf = requestAnimationFrame(tickGuardScene);
    return;
  }

  if (!guardScene.cleared && !guardScene.dead) {
    const move = (guardScene.keys.up ? -1 : 0) + (guardScene.keys.down ? 1 : 0);
    if (move) guardScene.y = Math.max(12, Math.min(88, guardScene.y + move * 1.5));
    guardScene.x += 0.18; // 稍慢，方便躲中段刺
    bubble.style.left = guardScene.x + '%';
    bubble.style.top = guardScene.y + '%';

    guardScene.spawnAcc += 1;
    if (guardScene.spawnAcc > 70) {
      guardScene.spawnAcc = 0;
      spawnGuardSpike();
    }

    guardScene.spikes.forEach(s => {
      if (!s.alive || !s.el.isConnected) return;
      if (s.fixed) {
        if (s.drift) {
          s.phase += 0.03;
          s.y = s.baseY + Math.sin(s.phase) * 6 * s.drift / 0.12;
          s.el.style.top = s.y + '%';
        }
      } else {
        s.x -= 0.7;
        s.el.style.left = s.x + '%';
        if (s.x < -8) { s.alive = false; s.el.remove(); }
      }
      if (hitGuardSpike(s)) {
        guardScene.dead = true;
        bubble.style.opacity = '0.35';
        updateGuardStatus('扎破了！点重开再试');
      }
    });
    guardScene.spikes = guardScene.spikes.filter(s => s.alive && s.el.isConnected);

    if (!guardScene.dead && guardScene.x >= 86) {
      guardScene.cleared = true;
      guardScene.x = 88;
      bubble.style.left = '88%';
      document.getElementById('guard-win').classList.add('open');
      updateGuardStatus('过河成功！');
    }
  }

  guardScene.raf = requestAnimationFrame(tickGuardScene);
}

function bindGuardControls() {
  const stage = document.getElementById('guard-stage');
  if (!stage || stage.dataset.bound) return;
  stage.dataset.bound = '1';
  const moveTo = clientY => {
    if (guardScene.cleared || guardScene.dead) return;
    const r = stage.getBoundingClientRect();
    guardScene.y = Math.max(12, Math.min(88, ((clientY - r.top) / r.height) * 100));
  };
  stage.addEventListener('mousedown', e => {
    if (!guardScene.open) return;
    if (e.target.closest('#guard-win') || e.target.closest('#guard-refresh')) return;
    guardScene.dragging = true;
    moveTo(e.clientY);
  });
  window.addEventListener('mousemove', e => { if (guardScene.dragging) moveTo(e.clientY); });
  window.addEventListener('mouseup', () => { guardScene.dragging = false; });
  stage.addEventListener('touchstart', e => {
    if (!guardScene.open || e.target.closest('#guard-win') || e.target.closest('#guard-refresh')) return;
    e.preventDefault();
    guardScene.dragging = true;
    moveTo(e.touches[0].clientY);
  }, { passive: false });
  stage.addEventListener('touchmove', e => {
    if (!guardScene.dragging) return;
    e.preventDefault();
    moveTo(e.touches[0].clientY);
  }, { passive: false });
  window.addEventListener('touchend', () => { guardScene.dragging = false; });
  window.addEventListener('keydown', e => {
    if (!guardScene.open) return;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { guardScene.keys.up = true; e.preventDefault(); }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { guardScene.keys.down = true; e.preventDefault(); }
  });
  window.addEventListener('keyup', e => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') guardScene.keys.up = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') guardScene.keys.down = false;
  });
}

// ── Bath 泡泡浴 ───────────────────────────────────────────────────
const bathScene = { open: false, count: 0, rubbing: false };

function updateBathStatus() {
  const el = document.getElementById('bath-status');
  if (el) el.textContent = `泡沫：${bathScene.count}` + (bathScene.count >= 80 ? ' · 浴缸好满！' : '');
}

function spawnBathFoam(clientX, clientY) {
  const tub = document.getElementById('bath-tub');
  if (!tub) return;
  const r = tub.getBoundingClientRect();
  const x = ((clientX - r.left) / r.width) * 100 + (Math.random() * 6 - 3);
  const y = ((clientY - r.top) / r.height) * 100 + (Math.random() * 6 - 3);
  const size = 14 + Math.random() * 28;
  const el = document.createElement('div');
  el.className = 'bath-foam';
  el.style.width = size + 'px';
  el.style.height = size + 'px';
  el.style.left = Math.max(2, Math.min(92, x)) + '%';
  el.style.top = Math.max(2, Math.min(90, y)) + '%';
  el.style.opacity = String(0.65 + Math.random() * 0.35);
  tub.appendChild(el);
  bathScene.count += 1;
  playBathFoamSound();
  updateBathStatus();
  // 慢慢上浮消散
  const drift = () => {
    if (!el.isConnected) return;
    const top = parseFloat(el.style.top);
    el.style.top = (top - 0.35) + '%';
    el.style.opacity = String(Math.max(0, parseFloat(el.style.opacity) - 0.004));
    if (top < -5 || parseFloat(el.style.opacity) <= 0.05) {
      el.remove();
      return;
    }
    requestAnimationFrame(drift);
  };
  requestAnimationFrame(drift);
}

function resetBathScene() {
  const tub = document.getElementById('bath-tub');
  if (tub) tub.innerHTML = '';
  bathScene.count = 0;
  updateBathStatus();
}
function openBathScene() {
  document.getElementById('bath-overlay').classList.add('open');
  bathScene.open = true;
  resetBathScene();
}
function closeBathScene() {
  document.getElementById('bath-overlay').classList.remove('open');
  bathScene.open = false;
  bathScene.rubbing = false;
}
function bindBathControls() {
  const tub = document.getElementById('bath-tub');
  if (!tub || tub.dataset.bound) return;
  tub.dataset.bound = '1';
  const foamAt = (e, touch) => {
    const pt = touch || e;
    spawnBathFoam(pt.clientX, pt.clientY);
  };
  tub.addEventListener('mousedown', e => {
    if (!bathScene.open) return;
    bathScene.rubbing = true;
    foamAt(e);
  });
  tub.addEventListener('mousemove', e => {
    if (!bathScene.rubbing) return;
    if (Math.random() < 0.55) foamAt(e);
  });
  window.addEventListener('mouseup', () => { bathScene.rubbing = false; });
  tub.addEventListener('touchstart', e => {
    if (!bathScene.open) return;
    e.preventDefault();
    bathScene.rubbing = true;
    foamAt(null, e.touches[0]);
  }, { passive: false });
  tub.addEventListener('touchmove', e => {
    if (!bathScene.rubbing) return;
    e.preventDefault();
    if (Math.random() < 0.7) foamAt(null, e.touches[0]);
  }, { passive: false });
  window.addEventListener('touchend', () => { bathScene.rubbing = false; });
}

// ── Shadow 追泡影 ─────────────────────────────────────────────────
const SHADOW_COLORS = [
  { id: 'blue', color: '#81d4fa' },
  { id: 'pink', color: '#f48fb1' },
  { id: 'yellow', color: '#ffe082' },
  { id: 'green', color: '#a5d6a7' },
  { id: 'purple', color: '#ce93d8' },
];
const shadowScene = { open: false, score: 0, round: 0, locked: false, timer: 0 };

function updateShadowStatus(msg) {
  const el = document.getElementById('shadow-status');
  if (el) el.textContent = msg || `得分：${shadowScene.score}`;
}

function clearShadowStage() {
  const stage = document.getElementById('shadow-stage');
  if (stage) stage.innerHTML = '';
}

function startShadowRound() {
  if (!shadowScene.open) return;
  clearShadowStage();
  shadowScene.locked = true;
  shadowScene.round += 1;
  const stage = document.getElementById('shadow-stage');
  if (!stage) return;

  const answer = SHADOW_COLORS[Math.floor(Math.random() * SHADOW_COLORS.length)];
  const gx = 18 + Math.random() * 64;
  const gy = 18 + Math.random() * 55;
  const ghost = document.createElement('div');
  ghost.className = 'shadow-ghost';
  ghost.style.width = '46px';
  ghost.style.height = '46px';
  ghost.style.left = gx + '%';
  ghost.style.top = gy + '%';
  ghost.style.marginLeft = '-23px';
  ghost.style.marginTop = '-23px';
  // 影子带着一点颜色暗示
  ghost.style.boxShadow = `inset 0 0 0 3px ${answer.color}55`;
  stage.appendChild(ghost);
  updateShadowStatus('记住影子颜色…');

  // 影子飘一下
  let t = 0;
  const drift = () => {
    if (!shadowScene.open || !ghost.isConnected) return;
    t += 1;
    ghost.style.left = (gx + Math.sin(t / 18) * 8) + '%';
    ghost.style.top = (gy + Math.cos(t / 22) * 5) + '%';
    if (t < 55) requestAnimationFrame(drift);
  };
  requestAnimationFrame(drift);

  clearTimeout(shadowScene.timer);
  shadowScene.timer = setTimeout(() => {
    if (!shadowScene.open) return;
    ghost.remove();
    // 放出 3 个真泡：1 个正确答案 + 2 干扰
    const others = SHADOW_COLORS.filter(c => c.id !== answer.id);
    const decoys = [];
    while (decoys.length < 2) {
      const c = others[Math.floor(Math.random() * others.length)];
      if (!decoys.find(d => d.id === c.id)) decoys.push(c);
    }
    const options = [answer, ...decoys].sort(() => Math.random() - 0.5);
    options.forEach((c, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'shadow-real' + (c.id === answer.id ? '' : ' decoy');
      btn.style.setProperty('--sc', c.color);
      btn.style.width = '52px';
      btn.style.height = '52px';
      btn.style.left = (18 + i * 28 + Math.random() * 6) + '%';
      btn.style.top = (30 + Math.random() * 35) + '%';
      btn.style.marginLeft = '-26px';
      btn.style.marginTop = '-26px';
      btn.addEventListener('click', () => {
        if (!shadowScene.open || shadowScene.locked === false && false) return;
        if (shadowScene._picked) return;
        shadowScene._picked = true;
        if (c.id === answer.id) {
          shadowScene.score += 1;
          updateShadowStatus(`答对！得分 ${shadowScene.score}`);
        } else {
          updateShadowStatus('点错了… 再来');
        }
        setTimeout(() => {
          shadowScene._picked = false;
          startShadowRound();
        }, 700);
      });
      stage.appendChild(btn);
    });
    shadowScene.locked = false;
    updateShadowStatus(`点出影子对应的泡 · 得分 ${shadowScene.score}`);
  }, 1100);
}

function resetShadowScene() {
  clearTimeout(shadowScene.timer);
  shadowScene.score = 0;
  shadowScene.round = 0;
  shadowScene._picked = false;
  clearShadowStage();
  startShadowRound();
}
function openShadowScene() {
  document.getElementById('shadow-overlay').classList.add('open');
  shadowScene.open = true;
  resetShadowScene();
}
function closeShadowScene() {
  document.getElementById('shadow-overlay').classList.remove('open');
  shadowScene.open = false;
  clearTimeout(shadowScene.timer);
  clearShadowStage();
}

// ── Chain 串泡 ────────────────────────────────────────────────────
const CHAIN_COLORS = ['#81d4fa', '#f48fb1', '#ffe082', '#a5d6a7', '#ce93d8'];
const CHAIN_N = 7;
const chainScene = { open: false, grid: [], selected: [], score: 0, lock: false };

function updateChainStatus(msg) {
  const el = document.getElementById('chain-status');
  if (el) el.textContent = msg || `消除：${chainScene.score}`;
}

function buildChainBoard() {
  const board = document.getElementById('chain-board');
  if (!board) return;
  board.style.gridTemplateColumns = `repeat(${CHAIN_N}, 1fr)`;
  board.innerHTML = '';
  chainScene.grid = [];
  chainScene.selected = [];
  chainScene.lock = false;
  for (let r = 0; r < CHAIN_N; r++) {
    const row = [];
    for (let c = 0; c < CHAIN_N; c++) {
      const color = CHAIN_COLORS[Math.floor(Math.random() * CHAIN_COLORS.length)];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chain-cell';
      btn.style.setProperty('--cc', color);
      btn.dataset.r = String(r);
      btn.dataset.c = String(c);
      btn.addEventListener('click', () => onChainClick(r, c, btn));
      board.appendChild(btn);
      row.push({ color, el: btn, alive: true });
    }
    chainScene.grid.push(row);
  }
  updateChainStatus();
}

function chainNeighbors(r, c, color, visited) {
  const key = r + ',' + c;
  if (visited.has(key)) return;
  if (r < 0 || c < 0 || r >= CHAIN_N || c >= CHAIN_N) return;
  const cell = chainScene.grid[r][c];
  if (!cell || !cell.alive || cell.color !== color) return;
  visited.add(key);
  chainNeighbors(r - 1, c, color, visited);
  chainNeighbors(r + 1, c, color, visited);
  chainNeighbors(r, c - 1, color, visited);
  chainNeighbors(r, c + 1, color, visited);
}

function onChainClick(r, c) {
  if (!chainScene.open || chainScene.lock) return;
  const cell = chainScene.grid[r][c];
  if (!cell || !cell.alive) return;
  const visited = new Set();
  chainNeighbors(r, c, cell.color, visited);
  // 清掉旧选中
  chainScene.grid.flat().forEach(x => x.el && x.el.classList.remove('sel'));
  if (visited.size < 2) {
    updateChainStatus('至少 2 个同色相邻才能消');
    return;
  }
  visited.forEach(key => {
    const [rr, cc] = key.split(',').map(Number);
    chainScene.grid[rr][cc].el.classList.add('sel');
  });
  chainScene.lock = true;
  setTimeout(() => {
    visited.forEach(key => {
      const [rr, cc] = key.split(',').map(Number);
      const cell2 = chainScene.grid[rr][cc];
      cell2.alive = false;
      cell2.el.classList.add('pop');
    });
    chainScene.score += visited.size;
    updateChainStatus(`消除：${chainScene.score}`);
    setTimeout(() => {
      // 下落补泡
      for (let c = 0; c < CHAIN_N; c++) {
        const stack = [];
        for (let r = CHAIN_N - 1; r >= 0; r--) {
          if (chainScene.grid[r][c].alive) stack.push(chainScene.grid[r][c].color);
        }
        for (let r = CHAIN_N - 1; r >= 0; r--) {
          const color = stack.length
            ? stack.shift()
            : CHAIN_COLORS[Math.floor(Math.random() * CHAIN_COLORS.length)];
          const cell3 = chainScene.grid[r][c];
          cell3.color = color;
          cell3.alive = true;
          cell3.el.classList.remove('pop', 'sel');
          cell3.el.style.setProperty('--cc', color);
          cell3.el.style.opacity = '1';
          cell3.el.style.transform = '';
        }
      }
      chainScene.lock = false;
    }, 280);
  }, 180);
}

function openChainScene() {
  document.getElementById('chain-overlay').classList.add('open');
  chainScene.open = true;
  chainScene.score = 0;
  buildChainBoard();
}
function closeChainScene() {
  document.getElementById('chain-overlay').classList.remove('open');
  chainScene.open = false;
}

// ── Workshop 泡车间 ───────────────────────────────────────────────
const WS_COLORS = [
  { id: 'pink', name: '粉', color: '#f48fb1' },
  { id: 'blue', name: '蓝', color: '#81d4fa' },
  { id: 'yellow', name: '黄', color: '#ffe082' },
  { id: 'green', name: '绿', color: '#a5d6a7' },
  { id: 'purple', name: '紫', color: '#ce93d8' },
];
const WS_SHAPES = [
  { id: 'circle', name: '圆' },
  { id: 'square', name: '方' },
  { id: 'diamond', name: '菱' },
];
const workshopScene = {
  open: false,
  targetColor: 'pink',
  targetShape: 'circle',
  color: 'pink',
  shape: 'circle',
  score: 0,
};

function wsColor(id) {
  return WS_COLORS.find(c => c.id === id) || WS_COLORS[0];
}

function paintWorkshopBubbles() {
  const t = document.getElementById('ws-target-bubble');
  const p = document.getElementById('ws-preview-bubble');
  const tc = wsColor(workshopScene.targetColor).color;
  const pc = wsColor(workshopScene.color).color;
  if (t) {
    t.className = 'ws-bubble ' + workshopScene.targetShape;
    t.style.setProperty('--wc', tc);
  }
  if (p) {
    p.className = 'ws-bubble ' + workshopScene.shape;
    p.style.setProperty('--wc', pc);
  }
}

function paintWorkshopOptions() {
  const colors = document.getElementById('ws-colors');
  const shapes = document.getElementById('ws-shapes');
  if (!colors || colors.dataset.bound) {
    // 只更新 on 状态
    if (colors) {
      colors.querySelectorAll('button').forEach(b => {
        b.classList.toggle('on', b.dataset.id === workshopScene.color);
      });
    }
    if (shapes) {
      shapes.querySelectorAll('button').forEach(b => {
        b.classList.toggle('on', b.dataset.id === workshopScene.shape);
      });
    }
    return;
  }
  colors.dataset.bound = '1';
  WS_COLORS.forEach(c => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ws-opt' + (c.id === workshopScene.color ? ' on' : '');
    b.dataset.id = c.id;
    b.textContent = c.name;
    b.style.borderColor = c.color;
    b.addEventListener('click', () => {
      workshopScene.color = c.id;
      paintWorkshopOptions();
      paintWorkshopBubbles();
    });
    colors.appendChild(b);
  });
  WS_SHAPES.forEach(s => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ws-opt' + (s.id === workshopScene.shape ? ' on' : '');
    b.dataset.id = s.id;
    b.textContent = s.name;
    b.addEventListener('click', () => {
      workshopScene.shape = s.id;
      paintWorkshopOptions();
      paintWorkshopBubbles();
    });
    shapes.appendChild(b);
  });
}

function newWorkshopOrder() {
  workshopScene.targetColor = WS_COLORS[Math.floor(Math.random() * WS_COLORS.length)].id;
  workshopScene.targetShape = WS_SHAPES[Math.floor(Math.random() * WS_SHAPES.length)].id;
  paintWorkshopBubbles();
  const st = document.getElementById('workshop-status');
  if (st) st.textContent = `新订单：做成${wsColor(workshopScene.targetColor).name}色 · ${WS_SHAPES.find(s => s.id === workshopScene.targetShape).name}形`;
}

function submitWorkshop() {
  const ok =
    workshopScene.color === workshopScene.targetColor &&
    workshopScene.shape === workshopScene.targetShape;
  const st = document.getElementById('workshop-status');
  if (ok) {
    workshopScene.score += 1;
    if (st) st.textContent = `做对了！订单 ×${workshopScene.score}`;
    setTimeout(newWorkshopOrder, 700);
  } else if (st) {
    st.textContent = '不对哦，再对照目标调一下';
  }
}

function openWorkshopScene() {
  document.getElementById('workshop-overlay').classList.add('open');
  workshopScene.open = true;
  workshopScene.score = 0;
  workshopScene.color = 'pink';
  workshopScene.shape = 'circle';
  paintWorkshopOptions();
  newWorkshopOrder();
  paintWorkshopBubbles();
  paintWorkshopOptions();
}
function closeWorkshopScene() {
  document.getElementById('workshop-overlay').classList.remove('open');
  workshopScene.open = false;
}

// ── Keepup 保泡 ───────────────────────────────────────────────────
const keepupScene = {
  open: false,
  x: 50,
  y: 40,
  vx: 0,
  vy: 0,
  score: 0,
  best: 0,
  raf: 0,
  alive: true,
};

function updateKeepupStatus(msg) {
  const el = document.getElementById('keepup-status');
  if (el) el.textContent = msg || `连顶：${keepupScene.score}` + (keepupScene.best ? ` · 最高 ${keepupScene.best}` : '');
}

function paintKeepupBubble() {
  const b = document.getElementById('keepup-bubble');
  if (!b) return;
  const scale = 1 + Math.min(keepupScene.score, 30) * 0.015;
  const size = 48 * scale;
  b.style.width = size + 'px';
  b.style.height = size + 'px';
  b.style.marginLeft = (-size / 2) + 'px';
  b.style.marginTop = (-size / 2) + 'px';
  b.style.left = keepupScene.x + '%';
  b.style.top = keepupScene.y + '%';
  b.style.opacity = keepupScene.alive ? '1' : '0.35';
}

function tickKeepupScene() {
  if (!keepupScene.open) { keepupScene.raf = 0; return; }
  if (keepupScene.alive) {
    keepupScene.vy += 0.22;
    keepupScene.vx *= 0.992;
    keepupScene.vy *= 0.998;
    keepupScene.x += keepupScene.vx * 0.08;
    keepupScene.y += keepupScene.vy * 0.08;
    if (keepupScene.x < 8) { keepupScene.x = 8; keepupScene.vx = Math.abs(keepupScene.vx) * 0.5; }
    if (keepupScene.x > 92) { keepupScene.x = 92; keepupScene.vx = -Math.abs(keepupScene.vx) * 0.5; }
    if (keepupScene.y < 10) {
      keepupScene.y = 10;
      keepupScene.vy = Math.abs(keepupScene.vy) * 0.35;
    }
    if (keepupScene.y > 88) {
      keepupScene.alive = false;
      keepupScene.best = Math.max(keepupScene.best, keepupScene.score);
      updateKeepupStatus(`落地了！最高 ${keepupScene.best} · 点重开`);
    }
  }
  paintKeepupBubble();
  keepupScene.raf = requestAnimationFrame(tickKeepupScene);
}

function bumpKeepup(clientX, clientY) {
  if (!keepupScene.open || !keepupScene.alive) return;
  const stage = document.getElementById('keepup-stage');
  if (!stage) return;
  const r = stage.getBoundingClientRect();
  const bx = r.left + (keepupScene.x / 100) * r.width;
  const by = r.top + (keepupScene.y / 100) * r.height;
  const dx = bx - clientX;
  const dy = by - clientY;
  const dist = Math.hypot(dx, dy) || 1;
  keepupScene.vx += (dx / dist) * 2.8;
  keepupScene.vy += (dy / dist) * 4.2 - 1.2;
  keepupScene.score += 1;
  try { playPop(true); } catch (_) {}
  updateKeepupStatus();
}

function resetKeepupScene() {
  keepupScene.x = 50;
  keepupScene.y = 55;
  keepupScene.vx = (Math.random() - 0.5) * 1.5;
  keepupScene.vy = -3.5;
  keepupScene.score = 0;
  keepupScene.alive = true;
  updateKeepupStatus();
  paintKeepupBubble();
}

function openKeepupScene() {
  document.getElementById('keepup-overlay').classList.add('open');
  keepupScene.open = true;
  resetKeepupScene();
  if (!keepupScene.raf) keepupScene.raf = requestAnimationFrame(tickKeepupScene);
}
function closeKeepupScene() {
  document.getElementById('keepup-overlay').classList.remove('open');
  keepupScene.open = false;
}

function bindKeepupControls() {
  const stage = document.getElementById('keepup-stage');
  if (!stage || stage.dataset.bound) return;
  stage.dataset.bound = '1';
  const tap = e => {
    if (e.target.closest('#keepup-refresh')) return;
    e.preventDefault();
    const pt = e.touches ? e.touches[0] : e;
    bumpKeepup(pt.clientX, pt.clientY);
  };
  stage.addEventListener('mousedown', tap);
  stage.addEventListener('touchstart', tap, { passive: false });
}

// ── Merge 泡合并 ──────────────────────────────────────────────────
const MERGE_N = 4;
const MERGE_MAX = 5;
const MERGE_COLORS = ['#81d4fa', '#f48fb1', '#ffe082', '#a5d6a7', '#ce93d8'];
const MERGE_LABELS = ['微', '小', '中', '大', '巨'];
const mergeScene = { open: false, grid: [], sel: null, merges: 0, maxLv: 1 };

function mergeCellColor(lv) {
  return MERGE_COLORS[(lv - 1) % MERGE_COLORS.length];
}

function updateMergeStatus(msg) {
  const el = document.getElementById('merge-status');
  if (el) {
    el.textContent = msg || `最大：${MERGE_LABELS[mergeScene.maxLv - 1] || mergeScene.maxLv} 级 · 合并：${mergeScene.merges}` +
      (mergeScene.maxLv >= MERGE_MAX ? ' · 巨型泡达成！' : '');
  }
}

function paintMergeCell(cell) {
  if (!cell.el) return;
  const lv = cell.lv;
  cell.el.style.setProperty('--mc', mergeCellColor(lv));
  cell.el.textContent = MERGE_LABELS[lv - 1] || lv;
  const scale = 0.72 + lv * 0.06;
  cell.el.style.transform = cell.el.classList.contains('sel') ? `scale(${scale + 0.08})` : `scale(${scale})`;
}

function buildMergeBoard() {
  const board = document.getElementById('merge-board');
  if (!board) return;
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${MERGE_N}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${MERGE_N}, 1fr)`;
  mergeScene.grid = [];
  mergeScene.sel = null;
  mergeScene.merges = 0;
  mergeScene.maxLv = 1;
  for (let r = 0; r < MERGE_N; r++) {
    mergeScene.grid[r] = [];
    for (let c = 0; c < MERGE_N; c++) {
      const lv = 1 + Math.floor(Math.random() * 2);
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'merge-cell';
      const cell = { r, c, lv, el };
      mergeScene.grid[r][c] = cell;
      paintMergeCell(cell);
      el.addEventListener('click', () => onMergeClick(r, c));
      board.appendChild(el);
    }
  }
  updateMergeStatus();
}

function mergeAdjacent(r, c) {
  return [
    [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1],
  ].filter(([rr, cc]) => rr >= 0 && cc >= 0 && rr < MERGE_N && cc < MERGE_N);
}

function onMergeClick(r, c) {
  if (!mergeScene.open) return;
  const cell = mergeScene.grid[r][c];
  if (!cell) return;
  if (!mergeScene.sel) {
    mergeScene.sel = { r, c };
    cell.el.classList.add('sel');
    paintMergeCell(cell);
    return;
  }
  const sr = mergeScene.sel.r;
  const sc = mergeScene.sel.c;
  const prev = mergeScene.grid[sr][sc];
  prev.el.classList.remove('sel');
  paintMergeCell(prev);
  if (sr === r && sc === c) {
    mergeScene.sel = null;
    return;
  }
  const adj = mergeAdjacent(sr, sc).some(([rr, cc]) => rr === r && cc === c);
  if (!adj || prev.lv !== cell.lv || prev.lv >= MERGE_MAX) {
    mergeScene.sel = { r, c };
    cell.el.classList.add('sel');
    paintMergeCell(cell);
    if (!adj) updateMergeStatus('要选相邻的两格哦');
    else if (prev.lv >= MERGE_MAX) updateMergeStatus('已经是巨型泡啦');
    else updateMergeStatus('要同等级才能合');
    return;
  }
  mergeScene.sel = null;
  const newLv = prev.lv + 1;
  prev.lv = newLv;
  cell.lv = 1 + Math.floor(Math.random() * 2);
  prev.el.classList.add('merge-pop');
  cell.el.classList.add('merge-pop');
  setTimeout(() => {
    prev.el.classList.remove('merge-pop');
    cell.el.classList.remove('merge-pop');
  }, 260);
  paintMergeCell(prev);
  paintMergeCell(cell);
  mergeScene.merges += 1;
  mergeScene.maxLv = Math.max(mergeScene.maxLv, newLv);
  try { playPop(true); } catch (_) {}
  updateMergeStatus(newLv >= MERGE_MAX ? '合成巨型泡！继续挑战更高分' : undefined);
}

function resetMergeScene() {
  buildMergeBoard();
}

function openMergeScene() {
  document.getElementById('merge-overlay').classList.add('open');
  mergeScene.open = true;
  buildMergeBoard();
}
function closeMergeScene() {
  document.getElementById('merge-overlay').classList.remove('open');
  mergeScene.open = false;
  mergeScene.sel = null;
}

// ── Floatpop 点飘泡 ───────────────────────────────────────────────
const FLOATPOP_COLORS = ['#f48fb1', '#81d4fa', '#ffe082', '#a5d6a7', '#ce93d8'];
const floatpopScene = {
  open: false,
  score: 0,
  missed: 0,
  maxMiss: 5,
  spawnTimer: 0,
  raf: 0,
  bubbles: [],
};

function updateFloatpopStatus(msg) {
  const el = document.getElementById('floatpop-status');
  if (el) {
    el.textContent = msg || `戳破：${floatpopScene.score} · 漏泡：${floatpopScene.missed} / ${floatpopScene.maxMiss}`;
  }
}

function spawnFloatpopBubble() {
  const stage = document.getElementById('floatpop-stage');
  if (!stage || !floatpopScene.open) return;
  if (floatpopScene.missed >= floatpopScene.maxMiss) return;
  const size = 28 + Math.random() * 22;
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'floatpop-bubble';
  el.style.width = size + 'px';
  el.style.height = size + 'px';
  el.style.left = (8 + Math.random() * 84) + '%';
  el.style.bottom = '-10%';
  el.style.setProperty('--fc', FLOATPOP_COLORS[Math.floor(Math.random() * FLOATPOP_COLORS.length)]);
  const bubble = {
    el,
    y: -10,
    speed: 0.08 + Math.random() * 0.12,
    alive: true,
  };
  el.addEventListener('click', e => {
    e.stopPropagation();
    if (!bubble.alive || !floatpopScene.open) return;
    bubble.alive = false;
    el.classList.add('popped');
    floatpopScene.score += 1;
    try { playPop(false); } catch (_) {}
    updateFloatpopStatus();
    setTimeout(() => el.remove(), 220);
  });
  stage.appendChild(el);
  floatpopScene.bubbles.push(bubble);
}

function tickFloatpopScene() {
  if (!floatpopScene.open) { floatpopScene.raf = 0; return; }
  floatpopScene.spawnTimer += 1;
  const interval = Math.max(28, 55 - floatpopScene.score * 2);
  if (floatpopScene.spawnTimer >= interval && floatpopScene.missed < floatpopScene.maxMiss) {
    floatpopScene.spawnTimer = 0;
    spawnFloatpopBubble();
  }
  floatpopScene.bubbles = floatpopScene.bubbles.filter(b => {
    if (!b.alive) return false;
    b.y += b.speed;
    b.el.style.bottom = b.y + '%';
    if (b.y > 105) {
      b.alive = false;
      b.el.remove();
      floatpopScene.missed += 1;
      updateFloatpopStatus();
      if (floatpopScene.missed >= floatpopScene.maxMiss) {
        updateFloatpopStatus(`结束！戳破 ${floatpopScene.score} 个 · 点重开`);
      }
      return false;
    }
    return true;
  });
  floatpopScene.raf = requestAnimationFrame(tickFloatpopScene);
}

function resetFloatpopScene() {
  const stage = document.getElementById('floatpop-stage');
  if (stage) stage.innerHTML = '';
  floatpopScene.score = 0;
  floatpopScene.missed = 0;
  floatpopScene.spawnTimer = 0;
  floatpopScene.bubbles = [];
  updateFloatpopStatus();
  spawnFloatpopBubble();
}

function openFloatpopScene() {
  document.getElementById('floatpop-overlay').classList.add('open');
  floatpopScene.open = true;
  resetFloatpopScene();
  if (!floatpopScene.raf) floatpopScene.raf = requestAnimationFrame(tickFloatpopScene);
}
function closeFloatpopScene() {
  document.getElementById('floatpop-overlay').classList.remove('open');
  floatpopScene.open = false;
  floatpopScene.bubbles = [];
  const stage = document.getElementById('floatpop-stage');
  if (stage) stage.innerHTML = '';
}

function bindFloatpopControls() {
  /* spawn/tick handled in rAF */
}

// ── Goal 泡射门 ───────────────────────────────────────────────────
const goalScene = {
  open: false,
  score: 0,
  ringX: 50,
  ringT: 0,
  ballX: 50,
  ballY: 88,
  vx: 0,
  vy: 0,
  flying: false,
  aiming: false,
  aimX: 0,
  aimY: 0,
  raf: 0,
  scored: false,
};

function updateGoalStatus(msg) {
  const el = document.getElementById('goal-status');
  if (el) el.textContent = msg || `进球：${goalScene.score}`;
}

function paintGoalRing() {
  const ring = document.getElementById('goal-ring');
  if (ring) ring.style.left = goalScene.ringX + '%';
}

function paintGoalBall() {
  const ball = document.getElementById('goal-ball');
  if (!ball) return;
  ball.style.left = goalScene.ballX + '%';
  ball.style.top = goalScene.ballY + '%';
  ball.style.display = goalScene.flying || !goalScene.aiming ? 'block' : 'block';
}

function resetGoalBall() {
  goalScene.ballX = 50;
  goalScene.ballY = 88;
  goalScene.vx = 0;
  goalScene.vy = 0;
  goalScene.flying = false;
  goalScene.scored = false;
  const aim = document.getElementById('goal-aim');
  if (aim) aim.style.display = 'none';
  paintGoalBall();
}

function tickGoalScene() {
  if (!goalScene.open) { goalScene.raf = 0; return; }
  goalScene.ringT += 0.022;
  goalScene.ringX = 50 + Math.sin(goalScene.ringT) * 32;
  paintGoalRing();

  if (goalScene.flying) {
    goalScene.ballX += goalScene.vx;
    goalScene.ballY += goalScene.vy;
    goalScene.vy += 0.038;
    if (goalScene.ballX < 6 || goalScene.ballX > 94) goalScene.vx *= -0.85;
    if (!goalScene.scored && goalScene.ballY <= 20 && goalScene.ballY >= 10) {
      const dx = Math.abs(goalScene.ballX - goalScene.ringX);
      if (dx < 9) {
        goalScene.scored = true;
        goalScene.score += 1;
        try { playPop(false); } catch (_) {}
        updateGoalStatus('进了！再射一球');
      }
    }
    if (goalScene.ballY > 95 || goalScene.ballY < -5) {
      resetGoalBall();
      if (!goalScene.scored) updateGoalStatus();
    }
    paintGoalBall();
  }
  goalScene.raf = requestAnimationFrame(tickGoalScene);
}

function resetGoalScene() {
  goalScene.score = 0;
  goalScene.ringT = 0;
  resetGoalBall();
  updateGoalStatus();
  paintGoalRing();
}

function openGoalScene() {
  document.getElementById('goal-overlay').classList.add('open');
  goalScene.open = true;
  resetGoalScene();
  if (!goalScene.raf) goalScene.raf = requestAnimationFrame(tickGoalScene);
}
function closeGoalScene() {
  document.getElementById('goal-overlay').classList.remove('open');
  goalScene.open = false;
  goalScene.aiming = false;
}

function bindGoalControls() {
  const stage = document.getElementById('goal-stage');
  if (!stage || stage.dataset.bound) return;
  stage.dataset.bound = '1';
  const aim = document.getElementById('goal-aim');

  const startAim = e => {
    if (e.target.closest('#goal-refresh') || goalScene.flying) return;
    goalScene.aiming = true;
    const pt = e.touches ? e.touches[0] : e;
    goalScene.aimX = pt.clientX;
    goalScene.aimY = pt.clientY;
    if (aim) aim.style.display = 'block';
  };
  const moveAim = e => {
    if (!goalScene.aiming || goalScene.flying) return;
    const pt = e.touches ? e.touches[0] : e;
    const stageRect = stage.getBoundingClientRect();
    const sx = stageRect.left + stageRect.width * 0.5;
    const sy = stageRect.bottom - stageRect.height * 0.1;
    const dx = sx - pt.clientX;
    const dy = sy - pt.clientY;
    const len = Math.min(120, Math.hypot(dx, dy));
    const ang = Math.atan2(dx, dy) * 180 / Math.PI;
    if (aim) {
      aim.style.height = len + 'px';
      aim.style.transform = `rotate(${ang}deg)`;
    }
  };
  const shoot = e => {
    if (!goalScene.aiming || goalScene.flying) return;
    if (e.target.closest('#goal-refresh')) return;
    const pt = e.changedTouches ? e.changedTouches[0] : e;
    const stageRect = stage.getBoundingClientRect();
    const sx = stageRect.left + stageRect.width * 0.5;
    const sy = stageRect.bottom - stageRect.height * 0.1;
    const dx = sx - pt.clientX;
    const dy = sy - pt.clientY;
    const dist = Math.hypot(dx, dy) || 1;
    const power = Math.max(1.6, Math.min(4.2, dist / 32 + 1.1));
    goalScene.vx = (dx / dist) * power * 2.4;
    goalScene.vy = (dy / dist) * power * -3.0;
    goalScene.flying = true;
    goalScene.aiming = false;
    goalScene.scored = false;
    if (aim) aim.style.display = 'none';
    try { playPressStart(true); } catch (_) {}
  };

  stage.addEventListener('mousedown', startAim);
  stage.addEventListener('mousemove', moveAim);
  window.addEventListener('mouseup', shoot);
  stage.addEventListener('touchstart', startAim, { passive: true });
  stage.addEventListener('touchmove', moveAim, { passive: true });
  stage.addEventListener('touchend', shoot);
}

// ── Split 泡分裂 ──────────────────────────────────────────────────
const SPLIT_SIZES = { 3: 72, 2: 48, 1: 28 };
const SPLIT_COLORS = ['#f48fb1', '#81d4fa', '#ffe082', '#a5d6a7', '#ce93d8'];
const splitScene = { open: false, score: 0, wave: 1, bubbles: [] };

function updateSplitStatus(msg) {
  const el = document.getElementById('split-status');
  if (el) el.textContent = msg || `戳破：${splitScene.score} · 第 ${splitScene.wave} 波`;
}

function spawnSplitBubble(x, y, size, color) {
  const stage = document.getElementById('split-stage');
  if (!stage) return null;
  const px = SPLIT_SIZES[size];
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'split-bubble';
  el.style.width = px + 'px';
  el.style.height = px + 'px';
  el.style.left = `calc(${x}% - ${px / 2}px)`;
  el.style.top = `calc(${y}% - ${px / 2}px)`;
  const bubbleColor = color || SPLIT_COLORS[Math.floor(Math.random() * SPLIT_COLORS.length)];
  el.style.setProperty('--sc', bubbleColor);
  const bubble = { el, x, y, size, color: bubbleColor, alive: true };
  el.addEventListener('click', e => {
    e.stopPropagation();
    onSplitClick(bubble);
  });
  stage.appendChild(el);
  splitScene.bubbles.push(bubble);
  return bubble;
}

function onSplitClick(bubble) {
  if (!splitScene.open || !bubble.alive) return;
  if (bubble.size > 1) {
    bubble.alive = false;
    bubble.el.remove();
    splitScene.bubbles = splitScene.bubbles.filter(b => b !== bubble);
    const off = 6 + bubble.size * 2;
    spawnSplitBubble(Math.max(12, Math.min(88, bubble.x - off)), bubble.y, bubble.size - 1, bubble.color);
    spawnSplitBubble(Math.max(12, Math.min(88, bubble.x + off)), bubble.y, bubble.size - 1, bubble.color);
    try { playPop(true); } catch (_) {}
  } else {
    bubble.alive = false;
    bubble.el.classList.add('pop');
    splitScene.score += 1;
    splitScene.bubbles = splitScene.bubbles.filter(b => b !== bubble);
    try { playPop(false); } catch (_) {}
    updateSplitStatus();
    setTimeout(() => bubble.el.remove(), 260);
    if (splitScene.bubbles.length === 0) {
      splitScene.wave += 1;
      setTimeout(spawnSplitWave, 400);
    }
  }
}

function spawnSplitWave() {
  if (!splitScene.open) return;
  const count = 2 + Math.min(splitScene.wave, 4);
  for (let i = 0; i < count; i++) {
    spawnSplitBubble(18 + Math.random() * 64, 22 + Math.random() * 56, 3);
  }
  updateSplitStatus();
}

function resetSplitScene() {
  const stage = document.getElementById('split-stage');
  if (stage) stage.innerHTML = '';
  splitScene.score = 0;
  splitScene.wave = 1;
  splitScene.bubbles = [];
  spawnSplitWave();
}

function openSplitScene() {
  document.getElementById('split-overlay').classList.add('open');
  splitScene.open = true;
  resetSplitScene();
}
function closeSplitScene() {
  document.getElementById('split-overlay').classList.remove('open');
  splitScene.open = false;
  splitScene.bubbles = [];
  const stage = document.getElementById('split-stage');
  if (stage) stage.innerHTML = '';
}

// ── Simon 泡顺序 ──────────────────────────────────────────────────
const SIMON_PADS = [
  { id: 0, color: '#f48fb1' },
  { id: 1, color: '#81d4fa' },
  { id: 2, color: '#ffe082' },
  { id: 3, color: '#a5d6a7' },
];
const simonScene = {
  open: false,
  seq: [],
  step: 0,
  input: 0,
  round: 0,
  playing: false,
  locked: false,
  pads: [],
};

function updateSimonStatus(msg) {
  const el = document.getElementById('simon-status');
  if (el) el.textContent = msg || `第 ${simonScene.round} 关 · 长度 ${simonScene.seq.length}`;
}

function flashSimonPad(id) {
  const pad = simonScene.pads[id];
  if (!pad) return;
  pad.classList.add('flash');
  try { playPop(true); } catch (_) {}
  setTimeout(() => pad.classList.remove('flash'), 380);
}

function playSimonSequence(i, done) {
  if (i >= simonScene.seq.length) {
    simonScene.locked = false;
    simonScene.input = 0;
    updateSimonStatus('轮到你了');
    if (done) done();
    return;
  }
  setTimeout(() => {
    flashSimonPad(simonScene.seq[i]);
    playSimonSequence(i + 1, done);
  }, 520);
}

function simonNextRound() {
  simonScene.round += 1;
  simonScene.seq.push(Math.floor(Math.random() * 4));
  simonScene.locked = true;
  updateSimonStatus('看好了…');
  setTimeout(() => playSimonSequence(0), 600);
}

function onSimonPadClick(id) {
  if (!simonScene.open || simonScene.locked) return;
  flashSimonPad(id);
  if (id !== simonScene.seq[simonScene.input]) {
    simonScene.locked = true;
    updateSimonStatus(`错了！坚持到第 ${simonScene.round} 关 · 点重开`);
    return;
  }
  simonScene.input += 1;
  if (simonScene.input >= simonScene.seq.length) {
    simonScene.locked = true;
    updateSimonStatus('对了！下一关…');
    setTimeout(simonNextRound, 900);
  }
}

function buildSimonBoard() {
  const board = document.getElementById('simon-board');
  if (!board) return;
  board.innerHTML = '';
  simonScene.pads = [];
  SIMON_PADS.forEach(p => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'simon-pad';
    el.style.setProperty('--sc', p.color);
    el.addEventListener('click', () => onSimonPadClick(p.id));
    board.appendChild(el);
    simonScene.pads[p.id] = el;
  });
}

function resetSimonScene() {
  simonScene.seq = [];
  simonScene.round = 0;
  simonScene.input = 0;
  simonScene.locked = true;
  buildSimonBoard();
  simonNextRound();
}

function openSimonScene() {
  document.getElementById('simon-overlay').classList.add('open');
  simonScene.open = true;
  resetSimonScene();
}
function closeSimonScene() {
  document.getElementById('simon-overlay').classList.remove('open');
  simonScene.open = false;
  simonScene.locked = true;
}

// ── Wipe 擦玻璃泡 ─────────────────────────────────────────────────
const wipeScene = {
  open: false,
  left: 0,
  timeLeft: 45,
  timer: 0,
  wiping: false,
  raf: 0,
  bubbles: [],
};

function updateWipeStatus(msg) {
  const el = document.getElementById('wipe-status');
  const left = wipeScene.bubbles.filter(b => b.alive).length;
  if (el) {
    el.textContent = msg || `剩余：${left} 泡 · 时间：${Math.ceil(wipeScene.timeLeft)} 秒`;
  }
}

function spawnWipeBubbles() {
  const stage = document.getElementById('wipe-stage');
  if (!stage) return;
  stage.querySelectorAll('.wipe-bubble').forEach(n => n.remove());
  wipeScene.bubbles = [];
  const count = 16 + Math.floor(Math.random() * 6);
  for (let i = 0; i < count; i++) {
    const size = 22 + Math.random() * 34;
    const el = document.createElement('div');
    el.className = 'wipe-bubble';
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.left = (6 + Math.random() * 84) + '%';
    el.style.top = (8 + Math.random() * 78) + '%';
    stage.appendChild(el);
    wipeScene.bubbles.push({ el, alive: true, x: 0, y: 0, r: size / 2 });
  }
  requestAnimationFrame(() => {
    wipeScene.bubbles.forEach(b => {
      const r = b.el.getBoundingClientRect();
      b.x = r.left + r.width / 2;
      b.y = r.top + r.height / 2;
      b.r = r.width / 2;
    });
  });
}

function wipeAt(clientX, clientY) {
  const stage = document.getElementById('wipe-stage');
  const cursor = document.getElementById('wipe-cursor');
  if (stage && cursor) {
    const sr = stage.getBoundingClientRect();
    cursor.style.display = 'block';
    cursor.style.left = (clientX - sr.left) + 'px';
    cursor.style.top = (clientY - sr.top) + 'px';
  }
  if (wipeScene.timeLeft <= 0 && wipeScene.bubbles.some(b => b.alive)) return;
  let cleared = false;
  wipeScene.bubbles.forEach(b => {
    if (!b.alive) return;
    const r = b.el.getBoundingClientRect();
    b.x = r.left + r.width / 2;
    b.y = r.top + r.height / 2;
    b.r = r.width / 2;
    if (Math.hypot(clientX - b.x, clientY - b.y) < b.r + 24) {
      b.alive = false;
      b.el.classList.add('gone');
      cleared = true;
      setTimeout(() => b.el.remove(), 200);
    }
  });
  if (cleared) {
    try { playPop(true); } catch (_) {}
    updateWipeStatus();
    if (wipeScene.bubbles.every(b => !b.alive)) {
      updateWipeStatus(`擦干净了！用时 ${45 - Math.ceil(wipeScene.timeLeft)} 秒 · 点重开`);
    }
  }
}

function tickWipeScene() {
  if (!wipeScene.open) { wipeScene.raf = 0; return; }
  if (wipeScene.bubbles.some(b => b.alive) && wipeScene.timeLeft > 0) {
    wipeScene.timer += 1;
    if (wipeScene.timer >= 60) {
      wipeScene.timer = 0;
      wipeScene.timeLeft -= 1;
      updateWipeStatus();
      if (wipeScene.timeLeft <= 0) {
        updateWipeStatus(`时间到！还剩 ${wipeScene.bubbles.filter(b => b.alive).length} 泡 · 点重开`);
      }
    }
  }
  wipeScene.raf = requestAnimationFrame(tickWipeScene);
}

function resetWipeScene() {
  wipeScene.timeLeft = 45;
  wipeScene.timer = 0;
  wipeScene.wiping = false;
  const cursor = document.getElementById('wipe-cursor');
  if (cursor) cursor.style.display = 'none';
  spawnWipeBubbles();
  updateWipeStatus();
}

function openWipeScene() {
  document.getElementById('wipe-overlay').classList.add('open');
  wipeScene.open = true;
  resetWipeScene();
  if (!wipeScene.raf) wipeScene.raf = requestAnimationFrame(tickWipeScene);
}
function closeWipeScene() {
  document.getElementById('wipe-overlay').classList.remove('open');
  wipeScene.open = false;
  wipeScene.wiping = false;
  const stage = document.getElementById('wipe-stage');
  if (stage) stage.querySelectorAll('.wipe-bubble').forEach(n => n.remove());
  wipeScene.bubbles = [];
}

function bindWipeControls() {
  const stage = document.getElementById('wipe-stage');
  if (!stage || stage.dataset.bound) return;
  stage.dataset.bound = '1';
  const start = e => {
    if (wipeScene.timeLeft <= 0 && wipeScene.bubbles.some(b => b.alive)) return;
    wipeScene.wiping = true;
    const pt = e.touches ? e.touches[0] : e;
    wipeAt(pt.clientX, pt.clientY);
  };
  const move = e => {
    if (!wipeScene.wiping) return;
    const pt = e.touches ? e.touches[0] : e;
    wipeAt(pt.clientX, pt.clientY);
  };
  const end = () => {
    wipeScene.wiping = false;
    const cursor = document.getElementById('wipe-cursor');
    if (cursor) cursor.style.display = 'none';
  };
  stage.addEventListener('mousedown', start);
  stage.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);
  stage.addEventListener('touchstart', start, { passive: true });
  stage.addEventListener('touchmove', move, { passive: true });
  window.addEventListener('touchend', end);
}

// ── Pinball 泡弹珠 ────────────────────────────────────────────────
const PINBALL_PEG_LAYOUT = [
  [25, 18], [50, 14], [75, 18],
  [15, 32], [35, 28], [55, 30], [75, 32], [90, 28],
  [25, 46], [50, 42], [75, 46],
  [35, 58], [65, 58],
];
const pinballScene = {
  open: false,
  score: 0,
  lives: 3,
  paddleX: 50,
  ball: { x: 50, y: 72, vx: 1.8, vy: -2.6, r: 14 },
  pegEls: [],
  pegHit: [],
  raf: 0,
  dead: false,
  w: 0,
  h: 0,
};

function updatePinballStatus(msg) {
  const el = document.getElementById('pinball-status');
  if (el) el.textContent = msg || `得分：${pinballScene.score} · 命：${pinballScene.lives}`;
}

function buildPinballPegs() {
  const stage = document.getElementById('pinball-stage');
  if (!stage) return;
  stage.querySelectorAll('.pinball-peg').forEach(n => n.remove());
  pinballScene.pegEls = [];
  pinballScene.pegHit = [];
  PINBALL_PEG_LAYOUT.forEach(([px, py], i) => {
    const peg = document.createElement('div');
    peg.className = 'pinball-peg';
    peg.style.width = '16px';
    peg.style.height = '16px';
    peg.style.left = `calc(${px}% - 8px)`;
    peg.style.top = `calc(${py}% - 8px)`;
    stage.insertBefore(peg, document.getElementById('pinball-ball'));
    pinballScene.pegEls.push({ el: peg, x: px, y: py, r: 8, i });
    pinballScene.pegHit[i] = 0;
  });
}

function paintPinball() {
  const ball = document.getElementById('pinball-ball');
  const paddle = document.getElementById('pinball-paddle');
  const b = pinballScene.ball;
  if (ball) {
    ball.style.left = b.x + '%';
    ball.style.top = b.y + '%';
  }
  if (paddle) paddle.style.left = pinballScene.paddleX + '%';
}

function resetPinballBall() {
  pinballScene.ball.x = 50;
  pinballScene.ball.y = 68;
  pinballScene.ball.vx = (Math.random() > 0.5 ? 1 : -1) * (1.6 + Math.random());
  pinballScene.ball.vy = -(2.2 + Math.random() * 1.2);
  paintPinball();
}

function tickPinballScene() {
  if (!pinballScene.open) { pinballScene.raf = 0; return; }
  if (pinballScene.dead) {
    pinballScene.raf = requestAnimationFrame(tickPinballScene);
    return;
  }
  const stage = document.getElementById('pinball-stage');
  if (!stage) return;
  const b = pinballScene.ball;
  b.x += b.vx * 0.16;
  b.y += b.vy * 0.16;
  b.vy += 0.055;

  if (b.x < 5) { b.x = 5; b.vx = Math.abs(b.vx) * 1.02; }
  if (b.x > 95) { b.x = 95; b.vx = -Math.abs(b.vx) * 1.02; }
  if (b.y < 8) { b.y = 8; b.vy = Math.abs(b.vy) * 1.02; }

  const padW = 22;
  const padX = pinballScene.paddleX;
  if (b.vy > 0 && b.y >= 84 && b.y <= 92 && b.x >= padX - padW / 2 && b.x <= padX + padW / 2) {
    b.y = 84;
    b.vy = -Math.abs(b.vy) * 1.08 - 0.4;
    b.vx += (b.x - padX) * 0.12;
    try { playPop(true); } catch (_) {}
  }

  pinballScene.pegEls.forEach((peg, idx) => {
    const dx = b.x - peg.x;
    const dy = b.y - peg.y;
    const dist = Math.hypot(dx, dy) || 0.01;
    const minD = 5.5;
    if (dist < minD) {
      const nx = dx / dist;
      const ny = dy / dist;
      const dot = b.vx * nx + b.vy * ny;
      b.vx = (b.vx - 2 * dot * nx) * 1.05;
      b.vy = (b.vy - 2 * dot * ny) * 1.05;
      b.x = peg.x + nx * minD;
      b.y = peg.y + ny * minD;
      if (Date.now() - pinballScene.pegHit[idx] > 120) {
        pinballScene.pegHit[idx] = Date.now();
        pinballScene.score += 10;
        peg.el.classList.remove('hit');
        void peg.el.offsetWidth;
        peg.el.classList.add('hit');
        try { playPop(false); } catch (_) {}
        updatePinballStatus();
      }
    }
  });

  if (b.y > 96) {
    pinballScene.lives -= 1;
    if (pinballScene.lives <= 0) {
      pinballScene.dead = true;
      updatePinballStatus(`游戏结束 · 得分 ${pinballScene.score} · 点重开`);
    } else {
      resetPinballBall();
      updatePinballStatus();
    }
  }
  paintPinball();
  pinballScene.raf = requestAnimationFrame(tickPinballScene);
}

function resetPinballScene() {
  pinballScene.score = 0;
  pinballScene.lives = 3;
  pinballScene.dead = false;
  pinballScene.paddleX = 50;
  buildPinballPegs();
  resetPinballBall();
  updatePinballStatus();
}

function openPinballScene() {
  document.getElementById('pinball-overlay').classList.add('open');
  pinballScene.open = true;
  resetPinballScene();
  if (!pinballScene.raf) pinballScene.raf = requestAnimationFrame(tickPinballScene);
}
function closePinballScene() {
  document.getElementById('pinball-overlay').classList.remove('open');
  pinballScene.open = false;
}

function bindPinballControls() {
  const stage = document.getElementById('pinball-stage');
  if (!stage || stage.dataset.bound) return;
  stage.dataset.bound = '1';
  const movePad = e => {
    if (e.target.closest('#pinball-refresh')) return;
    const pt = e.touches ? e.touches[0] : e;
    const r = stage.getBoundingClientRect();
    pinballScene.paddleX = Math.max(14, Math.min(86, ((pt.clientX - r.left) / r.width) * 100));
    paintPinball();
  };
  stage.addEventListener('mousemove', movePad);
  stage.addEventListener('touchmove', movePad, { passive: true });
}

// ── Scale 泡称重 ──────────────────────────────────────────────────
const SCALE_COLORS = ['#81d4fa', '#f48fb1', '#ffe082', '#a5d6a7', '#ce93d8'];
const scaleScene = { open: false, target: 5, left: 0, round: 1, score: 0, items: [] };

function updateScaleStatus(msg) {
  const el = document.getElementById('scale-status');
  if (el) el.textContent = msg || `当前左盘：${scaleScene.left} · 过关：${scaleScene.score}`;
}

function paintScaleBeam() {
  const beam = document.getElementById('scale-beam');
  if (!beam) return;
  const diff = scaleScene.left - scaleScene.target;
  const tilt = Math.max(-14, Math.min(14, diff * 2.5));
  beam.style.transform = `rotate(${tilt}deg)`;
}

function addScaleBubble(weight) {
  if (!scaleScene.open) return;
  const pan = document.getElementById('scale-pan-left');
  if (!pan) return;
  const el = document.createElement('button');
  el.type = 'button';
  const cls = weight === 1 ? 'sm' : weight === 3 ? 'lg' : '';
  el.className = 'scale-bubble-item' + (cls ? ' ' + cls : '');
  el.textContent = weight;
  el.style.setProperty('--sc', SCALE_COLORS[Math.floor(Math.random() * SCALE_COLORS.length)]);
  el.addEventListener('click', () => {
    scaleScene.left -= weight;
    scaleScene.items = scaleScene.items.filter(it => it.el !== el);
    el.remove();
    paintScaleBeam();
    updateScaleStatus();
  });
  pan.appendChild(el);
  scaleScene.left += weight;
  scaleScene.items.push({ weight, el });
  paintScaleBeam();
  updateScaleStatus();
  try { playPop(true); } catch (_) {}
}

function newScaleRound() {
  scaleScene.target = 3 + Math.floor(Math.random() * 7) + Math.min(scaleScene.round, 3);
  const tgt = document.getElementById('scale-target');
  const ghost = document.getElementById('scale-ghost-w');
  if (tgt) tgt.textContent = '目标：' + scaleScene.target;
  if (ghost) ghost.textContent = scaleScene.target;
  const pan = document.getElementById('scale-pan-left');
  if (pan) pan.innerHTML = '';
  scaleScene.left = 0;
  scaleScene.items = [];
  paintScaleBeam();
  updateScaleStatus(`第 ${scaleScene.round} 关 · 左盘凑到 ${scaleScene.target}`);
}

function checkScaleWeight() {
  if (!scaleScene.open) return;
  if (scaleScene.left === scaleScene.target) {
    scaleScene.score += 1;
    scaleScene.round += 1;
    try { playPassSuccessSound(); } catch (_) {}
    updateScaleStatus('对了！下一关…');
    setTimeout(newScaleRound, 800);
  } else if (scaleScene.left > scaleScene.target) {
    updateScaleStatus(`太重了（${scaleScene.left}）· 拿掉一些泡`);
  } else {
    updateScaleStatus(`还不够（${scaleScene.left}）· 再加泡`);
  }
}

function resetScaleScene() {
  scaleScene.round = 1;
  scaleScene.score = 0;
  newScaleRound();
}

function openScaleScene() {
  document.getElementById('scale-overlay').classList.add('open');
  scaleScene.open = true;
  resetScaleScene();
}
function closeScaleScene() {
  document.getElementById('scale-overlay').classList.remove('open');
  scaleScene.open = false;
}

function bindScaleControls() {
  const tray = document.getElementById('scale-tray');
  if (!tray || tray.dataset.bound) return;
  tray.dataset.bound = '1';
  tray.querySelectorAll('button[data-w]').forEach(btn => {
    btn.addEventListener('click', () => addScaleBubble(Number(btn.dataset.w)));
  });
}

// ── Bfish 泡钓鱼 ──────────────────────────────────────────────────
const BFISH_TYPES = [
  { id: 's', size: 22, score: 1, color: '#81d4fa', weight: 50 },
  { id: 'm', size: 34, score: 2, color: '#f48fb1', weight: 30 },
  { id: 'l', size: 46, score: 3, color: '#ffe082', weight: 15 },
  { id: 'r', size: 40, score: 5, color: null, rainbow: true, weight: 5 },
];
const bfishScene = {
  open: false,
  score: 0,
  hookX: 50,
  hookY: 4,
  casting: false,
  bubbles: [],
  raf: 0,
  timer: 0,
};

function updateBfishStatus(msg) {
  const el = document.getElementById('bfish-status');
  if (el) el.textContent = msg || `捞到：${bfishScene.score} 分`;
}

function paintBfishHook() {
  const hook = document.getElementById('bfish-hook');
  const line = document.getElementById('bfish-line');
  if (hook) {
    hook.style.left = bfishScene.hookX + '%';
    hook.style.top = bfishScene.hookY + '%';
  }
  if (line) {
    line.style.left = bfishScene.hookX + '%';
    line.style.height = Math.max(0, bfishScene.hookY) + '%';
  }
}

function spawnBfishBubbles() {
  const sea = document.getElementById('bfish-sea');
  if (!sea) return;
  sea.querySelectorAll('.bfish-bubble').forEach(n => n.remove());
  bfishScene.bubbles = [];
  const count = 8 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) {
    const roll = Math.random() * 100;
    let type = BFISH_TYPES[0];
    let acc = 0;
    for (const t of BFISH_TYPES) {
      acc += t.weight;
      if (roll < acc) { type = t; break; }
    }
    const el = document.createElement('div');
    el.className = 'bfish-bubble' + (type.rainbow ? ' rainbow' : '');
    el.style.width = type.size + 'px';
    el.style.height = type.size + 'px';
    if (!type.rainbow) el.style.setProperty('--bc', type.color);
    const y = 35 + Math.random() * 50;
    const x = 10 + Math.random() * 80;
    el.style.left = `calc(${x}% - ${type.size / 2}px)`;
    el.style.top = `calc(${y}% - ${type.size / 2}px)`;
    sea.insertBefore(el, document.getElementById('bfish-line'));
    bfishScene.bubbles.push({
      el, x, y, size: type.size, score: type.score, alive: true,
      vx: (Math.random() - 0.5) * 0.12,
    });
  }
}

function tickBfishScene() {
  if (!bfishScene.open) { bfishScene.raf = 0; return; }
  if (!bfishScene.casting) {
    bfishScene.bubbles.forEach(b => {
      if (!b.alive) return;
      b.x += b.vx;
      if (b.x < 8 || b.x > 92) b.vx *= -1;
      b.el.style.left = `calc(${b.x}% - ${b.size / 2}px)`;
    });
  }
  bfishScene.raf = requestAnimationFrame(tickBfishScene);
}

function bfishTryCatch() {
  const hook = document.getElementById('bfish-hook');
  if (!hook) return null;
  const hookR = hook.getBoundingClientRect();
  const hx = hookR.left + hookR.width / 2;
  const hy = hookR.top + hookR.height * 0.85;
  let caught = null;
  let best = 999;
  bfishScene.bubbles.forEach(b => {
    if (!b.alive || !b.el.isConnected) return;
    const br = b.el.getBoundingClientRect();
    const bx = br.left + br.width / 2;
    const by = br.top + br.height / 2;
    const reach = br.width * 0.55 + hookR.width * 0.6 + 10;
    const dist = Math.hypot(hx - bx, hy - by);
    if (dist < reach && dist < best) {
      best = dist;
      caught = b;
    }
  });
  return caught;
}

function bfishFinishCatch(caught, startY, castBtn) {
  if (caught) {
    caught.alive = false;
    caught.el.remove();
    bfishScene.score += caught.score;
    try { playPop(false); } catch (_) {}
    updateBfishStatus(`+${caught.score} 分！`);
    if (bfishScene.bubbles.filter(b => b.alive).length === 0) {
      setTimeout(spawnBfishBubbles, 600);
    }
  } else {
    updateBfishStatus('没捞着…把钩移到泡上方再下');
  }
  let step = 0;
  const fromY = bfishScene.hookY;
  const reel = () => {
    step += 1;
    bfishScene.hookY = fromY - (fromY - startY) * (step / 12);
    paintBfishHook();
    if (step < 12) requestAnimationFrame(reel);
    else {
      bfishScene.hookY = startY;
      paintBfishHook();
      bfishScene.casting = false;
      if (castBtn) castBtn.disabled = false;
      if (caught) updateBfishStatus();
    }
  };
  requestAnimationFrame(reel);
}

function castBfishHook() {
  if (!bfishScene.open || bfishScene.casting) return;
  bfishScene.casting = true;
  const castBtn = document.getElementById('bfish-cast');
  if (castBtn) castBtn.disabled = true;
  const startY = bfishScene.hookY;
  const targetY = 82;
  let step = 0;
  const drop = () => {
    step += 1;
    bfishScene.hookY = startY + (targetY - startY) * (step / 22);
    paintBfishHook();
    const caught = bfishTryCatch();
    if (caught) {
      setTimeout(() => bfishFinishCatch(caught, startY, castBtn), 80);
      return;
    }
    if (step < 22) {
      requestAnimationFrame(drop);
      return;
    }
    bfishFinishCatch(null, startY, castBtn);
  };
  requestAnimationFrame(drop);
}

function resetBfishScene() {
  bfishScene.score = 0;
  bfishScene.hookX = 50;
  bfishScene.hookY = 4;
  bfishScene.casting = false;
  const castBtn = document.getElementById('bfish-cast');
  if (castBtn) castBtn.disabled = false;
  spawnBfishBubbles();
  paintBfishHook();
  updateBfishStatus();
}

function openBfishScene() {
  document.getElementById('bfish-overlay').classList.add('open');
  bfishScene.open = true;
  resetBfishScene();
  if (!bfishScene.raf) bfishScene.raf = requestAnimationFrame(tickBfishScene);
}
function closeBfishScene() {
  document.getElementById('bfish-overlay').classList.remove('open');
  bfishScene.open = false;
  bfishScene.casting = false;
}

function bindBfishControls() {
  const sea = document.getElementById('bfish-sea');
  if (!sea || sea.dataset.bound) return;
  sea.dataset.bound = '1';
  const moveHook = e => {
    if (bfishScene.casting) return;
    const pt = e.touches ? e.touches[0] : e;
    const r = sea.getBoundingClientRect();
    bfishScene.hookX = Math.max(8, Math.min(92, ((pt.clientX - r.left) / r.width) * 100));
    paintBfishHook();
  };
  sea.addEventListener('mousemove', moveHook);
  sea.addEventListener('touchstart', moveHook, { passive: true });
  sea.addEventListener('touchmove', moveHook, { passive: true });
  sea.addEventListener('click', e => {
    if (bfishScene.casting) return;
    const r = sea.getBoundingClientRect();
    bfishScene.hookX = Math.max(8, Math.min(92, ((e.clientX - r.left) / r.width) * 100));
    paintBfishHook();
  });
}

// ── Jumprope 泡跳绳（侧视：绳从右往左，绿区按跳）────────────────
const JR_ZONE_L = 14;
const JR_ZONE_R = 38;
const jumpropeScene = {
  open: false,
  score: 0,
  best: 0,
  ropeX: 108,
  speed: 0.38,
  jumping: false,
  jumpT: 0,
  jumpGrace: 0,
  dead: false,
  scoredPass: false,
  wait: 0,
  raf: 0,
};

function updateJumpropeStatus(msg) {
  const el = document.getElementById('jumprope-status');
  if (el) {
    el.textContent = msg || `跳过：${jumpropeScene.score}` + (jumpropeScene.best ? ` · 最高 ${jumpropeScene.best}` : '');
  }
}

function paintJumprope() {
  const rope = document.getElementById('jumprope-rope');
  const cue = document.getElementById('jumprope-cue');
  const zone = document.getElementById('jumprope-zone');
  const btn = document.getElementById('jumprope-jump-btn');
  if (rope) rope.style.left = jumpropeScene.ropeX + '%';
  // 「该跳了」：绳快到绿区前一小段（按早了也有容错）
  const jumpNow = jumpropeScene.ropeX <= 58 && jumpropeScene.ropeX >= 42 && !jumpropeScene.dead && jumpropeScene.wait <= 0;
  const getReady = jumpropeScene.ropeX <= 78 && jumpropeScene.ropeX >= 60 && !jumpropeScene.dead;
  if (cue) cue.classList.toggle('show', jumpNow);
  if (zone) zone.classList.toggle('warn', jumpNow || getReady);
  if (btn) btn.classList.toggle('ready', jumpNow);
}

function jumpropeJump() {
  if (!jumpropeScene.open || jumpropeScene.dead || jumpropeScene.wait > 0) return;
  if (jumpropeScene.jumping) return;
  jumpropeScene.jumping = true;
  jumpropeScene.jumpT = 0;
  jumpropeScene.jumpGrace = 55;
  const b = document.getElementById('jumprope-bubble');
  if (b) b.classList.add('jump');
  try { playPop(true); } catch (_) {}
}

function tickJumpropeScene() {
  if (!jumpropeScene.open) { jumpropeScene.raf = 0; return; }
  if (!jumpropeScene.dead) {
    if (jumpropeScene.wait > 0) {
      jumpropeScene.wait -= 1;
      if (jumpropeScene.wait === 0) updateJumpropeStatus('绳来了 · 看「跳！」亮了就按');
    } else {
      jumpropeScene.ropeX -= jumpropeScene.speed;
    }
    if (jumpropeScene.ropeX < -8) {
      jumpropeScene.ropeX = 108;
      jumpropeScene.scoredPass = false;
    }

    if (jumpropeScene.jumpGrace > 0) jumpropeScene.jumpGrace -= 1;

    if (jumpropeScene.jumping) {
      jumpropeScene.jumpT += 1;
      if (jumpropeScene.jumpT > 38) {
        jumpropeScene.jumping = false;
        const b = document.getElementById('jumprope-bubble');
        if (b) b.classList.remove('jump');
      }
    }

    const inZone = jumpropeScene.ropeX <= JR_ZONE_R && jumpropeScene.ropeX >= JR_ZONE_L;
    const safe = jumpropeScene.jumping || jumpropeScene.jumpGrace > 0;
    if (inZone && jumpropeScene.wait <= 0) {
      if (safe && !jumpropeScene.scoredPass) {
        jumpropeScene.scoredPass = true;
        jumpropeScene.score += 1;
        jumpropeScene.speed = Math.min(0.72, jumpropeScene.speed + 0.025);
        updateJumpropeStatus('跳过了！');
        try { playPop(false); } catch (_) {}
        setTimeout(updateJumpropeStatus, 500);
      } else if (!safe) {
        jumpropeScene.dead = true;
        jumpropeScene.best = Math.max(jumpropeScene.best, jumpropeScene.score);
        updateJumpropeStatus(`被绳扫到了！最高 ${jumpropeScene.best} · 点重开`);
      }
    }
    paintJumprope();
  }
  jumpropeScene.raf = requestAnimationFrame(tickJumpropeScene);
}

function resetJumpropeScene() {
  jumpropeScene.score = 0;
  jumpropeScene.ropeX = 108;
  jumpropeScene.speed = 0.38;
  jumpropeScene.jumping = false;
  jumpropeScene.jumpT = 0;
  jumpropeScene.jumpGrace = 0;
  jumpropeScene.dead = false;
  jumpropeScene.scoredPass = false;
  jumpropeScene.wait = 75;
  const b = document.getElementById('jumprope-bubble');
  if (b) b.classList.remove('jump');
  paintJumprope();
  updateJumpropeStatus('准备… 等按钮闪「跳！」再按');
}

function openJumpropeScene() {
  document.getElementById('jumprope-overlay').classList.add('open');
  jumpropeScene.open = true;
  resetJumpropeScene();
  if (!jumpropeScene.raf) jumpropeScene.raf = requestAnimationFrame(tickJumpropeScene);
}
function closeJumpropeScene() {
  document.getElementById('jumprope-overlay').classList.remove('open');
  jumpropeScene.open = false;
}

function bindJumpropeControls() {
  const btn = document.getElementById('jumprope-jump-btn');
  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = '1';
    btn.addEventListener('click', e => {
      e.stopPropagation();
      jumpropeJump();
    });
  }
}

// ── Colortap 泡配色 ───────────────────────────────────────────────
const CT_COLORS = [
  { id: 'pink', color: '#f48fb1', name: '粉' },
  { id: 'blue', color: '#81d4fa', name: '蓝' },
  { id: 'yellow', color: '#ffe082', name: '黄' },
  { id: 'green', color: '#a5d6a7', name: '绿' },
  { id: 'purple', color: '#ce93d8', name: '紫' },
];
const colortapScene = { open: false, score: 0, lives: 3, target: 'pink', timer: 0, raf: 0 };

function updateColortapStatus(msg) {
  const el = document.getElementById('colortap-status');
  if (el) el.textContent = msg || `得分：${colortapScene.score} · 命：${colortapScene.lives}`;
}

function pickColortapTarget() {
  const c = CT_COLORS[Math.floor(Math.random() * CT_COLORS.length)];
  colortapScene.target = c.id;
  const dot = document.getElementById('colortap-target-dot');
  if (dot) dot.style.setProperty('--tc', c.color);
}

function spawnColortapBubble() {
  const stage = document.getElementById('colortap-stage');
  if (!stage || !colortapScene.open || colortapScene.lives <= 0) return;
  if (stage.querySelectorAll('.colortap-bubble').length >= 10) return;
  const c = CT_COLORS[Math.floor(Math.random() * CT_COLORS.length)];
  const size = 36 + Math.random() * 20;
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'colortap-bubble';
  el.style.width = size + 'px';
  el.style.height = size + 'px';
  el.style.left = `calc(${10 + Math.random() * 80}% - ${size / 2}px)`;
  el.style.top = `calc(${8 + Math.random() * 78}% - ${size / 2}px)`;
  el.style.setProperty('--tc', c.color);
  el.dataset.color = c.id;
  el.addEventListener('click', () => {
    if (!colortapScene.open || colortapScene.lives <= 0) return;
    if (c.id === colortapScene.target) {
      colortapScene.score += 1;
      el.classList.add('pop');
      try { playPop(false); } catch (_) {}
      if (colortapScene.score % 4 === 0) pickColortapTarget();
      updateColortapStatus();
      setTimeout(() => el.remove(), 220);
    } else {
      colortapScene.lives -= 1;
      el.classList.add('pop');
      updateColortapStatus(colortapScene.lives <= 0 ? `结束 · 得分 ${colortapScene.score}` : '颜色不对！');
      setTimeout(() => el.remove(), 220);
    }
  });
  stage.appendChild(el);
}

function tickColortapScene() {
  if (!colortapScene.open) { colortapScene.raf = 0; return; }
  if (colortapScene.lives > 0) {
    colortapScene.timer += 1;
    if (colortapScene.timer >= 38) {
      colortapScene.timer = 0;
      spawnColortapBubble();
    }
  }
  colortapScene.raf = requestAnimationFrame(tickColortapScene);
}

function resetColortapScene() {
  const stage = document.getElementById('colortap-stage');
  if (stage) stage.innerHTML = '';
  colortapScene.score = 0;
  colortapScene.lives = 3;
  colortapScene.timer = 0;
  pickColortapTarget();
  for (let i = 0; i < 6; i++) spawnColortapBubble();
  updateColortapStatus();
}

function openColortapScene() {
  document.getElementById('colortap-overlay').classList.add('open');
  colortapScene.open = true;
  resetColortapScene();
  if (!colortapScene.raf) colortapScene.raf = requestAnimationFrame(tickColortapScene);
}
function closeColortapScene() {
  document.getElementById('colortap-overlay').classList.remove('open');
  colortapScene.open = false;
}

// ── Rush30 泡连戳 ─────────────────────────────────────────────────
const RUSH30_COLORS = ['#f48fb1', '#81d4fa', '#ffe082', '#a5d6a7', '#ce93d8'];
const rush30Scene = { open: false, score: 0, timeLeft: 30, timer: 0, spawnT: 0, raf: 0, done: false };

function updateRush30Status(msg) {
  const el = document.getElementById('rush30-status');
  if (el) el.textContent = msg || `戳破：${rush30Scene.score} · 时间：${Math.ceil(rush30Scene.timeLeft)} 秒`;
}

function spawnRush30Bubble() {
  const stage = document.getElementById('rush30-stage');
  if (!stage || !rush30Scene.open || rush30Scene.done) return;
  if (stage.querySelectorAll('.rush30-bubble').length >= 12) return;
  const size = 32 + Math.random() * 28;
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'rush30-bubble';
  el.style.width = size + 'px';
  el.style.height = size + 'px';
  el.style.left = `calc(${8 + Math.random() * 84}% - ${size / 2}px)`;
  el.style.top = `calc(${8 + Math.random() * 84}% - ${size / 2}px)`;
  el.style.setProperty('--rc', RUSH30_COLORS[Math.floor(Math.random() * RUSH30_COLORS.length)]);
  el.addEventListener('click', () => {
    if (rush30Scene.done) return;
    el.classList.add('pop');
    rush30Scene.score += 1;
    try { playPop(false); } catch (_) {}
    updateRush30Status();
    setTimeout(() => el.remove(), 180);
  });
  stage.appendChild(el);
  setTimeout(() => { if (el.isConnected) el.remove(); }, 2200);
}

function tickRush30Scene() {
  if (!rush30Scene.open) { rush30Scene.raf = 0; return; }
  if (!rush30Scene.done) {
    rush30Scene.spawnT += 1;
    const interval = Math.max(12, 28 - Math.floor(rush30Scene.score / 5));
    if (rush30Scene.spawnT >= interval) {
      rush30Scene.spawnT = 0;
      spawnRush30Bubble();
    }
    rush30Scene.timer += 1;
    if (rush30Scene.timer >= 60) {
      rush30Scene.timer = 0;
      rush30Scene.timeLeft -= 1;
      updateRush30Status();
      if (rush30Scene.timeLeft <= 0) {
        rush30Scene.done = true;
        updateRush30Status(`时间到！戳破 ${rush30Scene.score} 个 · 点重开`);
      }
    }
  }
  rush30Scene.raf = requestAnimationFrame(tickRush30Scene);
}

function resetRush30Scene() {
  const stage = document.getElementById('rush30-stage');
  if (stage) stage.innerHTML = '';
  rush30Scene.score = 0;
  rush30Scene.timeLeft = 30;
  rush30Scene.timer = 0;
  rush30Scene.spawnT = 0;
  rush30Scene.done = false;
  for (let i = 0; i < 5; i++) spawnRush30Bubble();
  updateRush30Status();
}

function openRush30Scene() {
  document.getElementById('rush30-overlay').classList.add('open');
  rush30Scene.open = true;
  resetRush30Scene();
  if (!rush30Scene.raf) rush30Scene.raf = requestAnimationFrame(tickRush30Scene);
}
function closeRush30Scene() {
  document.getElementById('rush30-overlay').classList.remove('open');
  rush30Scene.open = false;
  rush30Scene.done = true;
}

// ── Balance 泡平衡 ────────────────────────────────────────────────
const balanceScene = {
  open: false,
  x: 50,
  vx: 0,
  wind: 0,
  targetWind: 0,
  windT: 0,
  holdL: false,
  holdR: false,
  time: 0,
  dead: false,
  raf: 0,
};

function updateBalanceStatus(msg) {
  const el = document.getElementById('balance-status');
  if (el) el.textContent = msg || `坚持：${balanceScene.time.toFixed(1)} 秒` + (balanceScene.dead ? '' : '');
}

function paintBalanceBubble() {
  const b = document.getElementById('balance-bubble');
  const wind = document.getElementById('balance-wind');
  const arrow = document.getElementById('balance-wind-arrow');
  if (b) b.style.left = balanceScene.x + '%';
  if (wind && arrow) {
    const w = balanceScene.wind;
    wind.classList.remove('left', 'right', 'strong');
    if (w > 0.25) {
      arrow.textContent = '→';
      wind.classList.add('right');
    } else if (w < -0.25) {
      arrow.textContent = '←';
      wind.classList.add('left');
    } else {
      arrow.textContent = '·';
    }
    if (Math.abs(w) > 0.75) wind.classList.add('strong');
  }
}

function tickBalanceScene() {
  if (!balanceScene.open) { balanceScene.raf = 0; return; }
  if (!balanceScene.dead) {
    balanceScene.windT += 1;
    if (balanceScene.windT > 130) {
      balanceScene.windT = 0;
      balanceScene.targetWind = (Math.random() - 0.5) * 1.2;
    }
    balanceScene.wind += (balanceScene.targetWind - balanceScene.wind) * 0.025;

    let push = balanceScene.wind * 0.028;
    if (balanceScene.holdL) push -= 0.2;
    if (balanceScene.holdR) push += 0.2;
    balanceScene.vx = balanceScene.vx * 0.87 + push;
    if (balanceScene.vx > 1.6) balanceScene.vx = 1.6;
    if (balanceScene.vx < -1.6) balanceScene.vx = -1.6;
    balanceScene.x += balanceScene.vx;
    balanceScene.time += 1 / 60;
    if (balanceScene.x < 10 || balanceScene.x > 90) {
      balanceScene.dead = true;
      updateBalanceStatus(`掉下去了！坚持了 ${balanceScene.time.toFixed(1)} 秒 · 点重开`);
    } else {
      updateBalanceStatus();
    }
  }
  paintBalanceBubble();
  balanceScene.raf = requestAnimationFrame(tickBalanceScene);
}

function resetBalanceScene() {
  balanceScene.x = 50;
  balanceScene.vx = 0;
  balanceScene.wind = 0;
  balanceScene.targetWind = 0;
  balanceScene.windT = 0;
  balanceScene.holdL = false;
  balanceScene.holdR = false;
  balanceScene.time = 0;
  balanceScene.dead = false;
  paintBalanceBubble();
  updateBalanceStatus();
}

function openBalanceScene() {
  document.getElementById('balance-overlay').classList.add('open');
  balanceScene.open = true;
  resetBalanceScene();
  if (!balanceScene.raf) balanceScene.raf = requestAnimationFrame(tickBalanceScene);
}
function closeBalanceScene() {
  document.getElementById('balance-overlay').classList.remove('open');
  balanceScene.open = false;
  balanceScene.holdL = false;
  balanceScene.holdR = false;
}

// ── 泡豆漫游 · 独立可走动小泡灵（原创 · 非蛋形派对）────────────
const PD_BUDDY_STORAGE = 'bubbleRelief_paodou_v1';
const PD_BUDDY_LINES = ['咕噜~', '往前走呀', '泡岛好大', '视角在跟着', '我是泡豆！'];
const PD_TOWER_LINES = ['哇…泡豆大楼！', '好高的大泡泡楼~', '站顶楼看全岛！', '大楼里会有谁呀'];
const PD_WORLD_W = 3200;
const PD_WORLD_H = 5200;
const PD_WALK_PAD = 120;
const PD_TOWER_X = PD_WORLD_W / 2;
const PD_TOWER_Y = 4120;
const PD_TOWER_ENTER_Y = 4010;
const PD_TOWER_ANCHOR_Y = 4055;
const PD_TOWER_PAD = 340;
const PD_TOWER_ENTER_WX = 240;
const PD_TOWER_ENTER_WY = 200;
const PD_VIEW_PAN_X = 72;
const PD_VIEW_PAN_Y = 36;
const PD_SCREEN_ANCHOR_X = 0.5;
const PD_SCREEN_ANCHOR_Y = 0.76;
const PD_CAM_PITCH = 68;
const PD_CAM_PERSPECTIVE = 520;
const PD_CAM_DOLLY = 215;
const PD_BUDDY_LAYER_OFFSET_Y = -46;
const PD_BUDDY_SCREEN_RATIO = 0.62;

function getPdCameraMagnify() {
  return PD_CAM_PERSPECTIVE / (PD_CAM_PERSPECTIVE - PD_CAM_DOLLY);
}

function getPdBuddyScreenScale() {
  return getPdCameraMagnify() * PD_BUDDY_SCREEN_RATIO;
}

const pdBuddy = {
  wx: PD_WORLD_W / 2,
  wy: PD_WORLD_H - 520,
  facing: 1,
  walking: false,
};

const pdCamera = { yaw: 0, yawVel: 0 };
const pdWalkKeys = new Set();
const pdViewDrag = { active: false, lastX: 0, pointerId: null };
let pdBuddyRaf = null;
let pdBuddyControlsBound = false;
let pdTowerGreeted = false;
let pdTowerInside = false;
let pdTowerExitUntil = 0;
let pdTowerFloor = 1;
let pdTowerOnFloorRoom = false;
let pdTowerRoomEntering = false;
let pdTowerRoomEnterT = 0;
const pdTowerRoomPos = { x: 0.22, y: 0.72 };
const pdTowerRoomRender = { x: 0.22, y: 0.72 };
const pdTowerRoomVel = { vx: 0, vy: 0 };
let pdTowerRoomLastTick = 0;
const pdFloorFloatBubbles = [];
const pdFloorHunt = { floor: 0, found: 0, total: 3, beans: [] };
const pdElevGame = {
  active: false,
  ended: false,
  target: 1,
  pos: 1,
  dir: 1,
  raf: null,
  lastT: 0,
};

function pdClearFloorHunt() {
  pdFloorHunt.beans.forEach(b => b.el?.remove());
  pdFloorHunt.floor = 0;
  pdFloorHunt.found = 0;
  pdFloorHunt.total = 3;
  pdFloorHunt.beans.length = 0;
}

function pdBuddyNearHunt(x, y) {
  return Math.hypot(pdTowerRoomPos.x - x, pdTowerRoomPos.y - y) < 0.2;
}

function pdUpdateFloorHuntNear() {
  pdFloorHunt.beans.forEach(b => {
    if (b.found || !b.el) return;
    b.el.classList.toggle('near', pdBuddyNearHunt(b.x, b.y));
  });
}

function pdUpdateFloorHuntBar() {
  const bar = document.getElementById('pd-floor-hunt-bar');
  const count = document.getElementById('pd-floor-hunt-count');
  if (!bar || !count) return;
  count.textContent = `${pdFloorHunt.found}/${pdFloorHunt.total}`;
  bar.classList.toggle('done', pdFloorHunt.found >= pdFloorHunt.total);
}

function pdSetupFloorHunt(f) {
  pdClearFloorHunt();
  const scene = document.querySelector('#pd-tower-floor-room-stage .pd-floor-room-scene');
  if (!scene) return;
  pdFloorHunt.floor = f;
  pdFloorHunt.found = 0;
  pdFloorHunt.total = 3;
  const used = [];
  for (let i = 0; i < pdFloorHunt.total; i++) {
    let x;
    let y;
    let tries = 0;
    do {
      x = 0.14 + Math.random() * 0.72;
      /* 与楼层内可走动范围 y≈0.52–0.86 对齐，避免刷在够不着的地方 */
      y = 0.54 + Math.random() * 0.26;
      tries++;
    } while (tries < 24 && used.some(p => Math.hypot(p.x - x, p.y - y) < 0.16));
    used.push({ x, y });
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pd-floor-hunt-bean';
    btn.style.left = `${x * 100}%`;
    btn.style.top = `${y * 100}%`;
    btn.title = '隐藏的泡豆';
    btn.setAttribute('aria-label', '寻找泡豆');
    btn.dataset.huntIdx = String(i);
    scene.appendChild(btn);
    pdFloorHunt.beans.push({ x, y, el: btn, found: false });
  }
  pdUpdateFloorHuntBar();
}

function pdTapFloorHuntBean(btn) {
  const idx = parseInt(btn.dataset.huntIdx, 10);
  const bean = pdFloorHunt.beans[idx];
  if (!bean || bean.found || !pdTowerOnFloorRoom) return;
  if (!pdBuddyNearHunt(bean.x, bean.y)) {
    showPdFloorRoomNpcSpeech('再走近一点～');
    return;
  }
  bean.found = true;
  btn.classList.add('found');
  pdFloorHunt.found++;
  pdUpdateFloorHuntBar();
  showPdFloorRoomNpcSpeech(`找到啦！${pdFloorHunt.found}/${pdFloorHunt.total}`);
  if (pdFloorHunt.found >= pdFloorHunt.total) {
    showPdFloorRoomNpcSpeech('三颗都找到啦！🎉');
    showPdBuddySpeech(`${pdTowerFloor} 层寻泡完成～`);
    const stage = document.getElementById('pd-tower-floor-room-stage');
    const meta = PD_TOWER_FLOOR_META[pdTowerFloor] || {};
    const colors = PD_FLOOR_THEME_BEANS[meta.theme] || ['#81d4fa', '#ffd54f'];
    for (let i = 0; i < 6; i++) {
      const fakeSpot = document.createElement('span');
      fakeSpot.style.cssText = `position:absolute;left:${40 + Math.random() * 20}%;top:${42 + Math.random() * 12}%;width:1px;height:1px;`;
      stage?.appendChild(fakeSpot);
      pdReleaseFloorRoomBeans(fakeSpot, {
        releaseLine: '寻泡奖励～',
        beanCount: 1,
        beanColors: colors,
      });
      setTimeout(() => fakeSpot.remove(), 100);
    }
  }
}

function pdElevFloorToY(floor) {
  const shaft = document.getElementById('pd-elev-game-shaft');
  const h = shaft?.clientHeight || 220;
  const t = (PD_TOWER_FLOORS - floor) / (PD_TOWER_FLOORS - 1);
  return 12 + t * (h - 24);
}

function pdRenderElevGame() {
  const car = document.getElementById('pd-elev-game-car');
  const mark = document.getElementById('pd-elev-game-mark');
  const cur = document.getElementById('pd-elev-game-cur');
  const targetEl = document.getElementById('pd-elev-game-target');
  if (!car || !mark || !cur) return;
  const yCar = pdElevFloorToY(pdElevGame.pos);
  const yMark = pdElevFloorToY(pdElevGame.target);
  car.style.top = `${yCar}px`;
  mark.style.top = `${yMark}px`;
  cur.textContent = `当前：${Math.max(1, Math.min(PD_TOWER_FLOORS, Math.round(pdElevGame.pos)))} 层`;
  if (targetEl) {
    const meta = PD_TOWER_FLOOR_META[pdElevGame.target];
    targetEl.textContent = `${pdElevGame.target} 层${meta?.name ? ` · ${meta.name}` : ''}`;
  }
}

function pdStopElevGame() {
  pdElevGame.active = false;
  pdElevGame.ended = true;
  if (pdElevGame.raf) cancelAnimationFrame(pdElevGame.raf);
  pdElevGame.raf = null;
  const stopBtn = document.getElementById('pd-elev-game-stop');
  if (stopBtn) stopBtn.disabled = true;
}

function pdCloseElevGame() {
  pdStopElevGame();
  const overlay = document.getElementById('pd-elev-game');
  overlay?.setAttribute('hidden', '');
  overlay?.setAttribute('aria-hidden', 'true');
  const retry = document.getElementById('pd-elev-game-retry');
  retry?.setAttribute('hidden', '');
  const msg = document.getElementById('pd-elev-game-msg');
  if (msg) {
    msg.textContent = '';
    msg.className = 'pd-elev-game-msg';
  }
}

function pdStartElevGameRound() {
  const msg = document.getElementById('pd-elev-game-msg');
  const retry = document.getElementById('pd-elev-game-retry');
  const stopBtn = document.getElementById('pd-elev-game-stop');
  retry?.setAttribute('hidden', '');
  if (msg) {
    msg.textContent = '看准目标层，按「停！」';
    msg.className = 'pd-elev-game-msg';
  }
  if (stopBtn) stopBtn.disabled = false;
  pdElevGame.target = pdTowerFloor;
  pdElevGame.pos = 1 + Math.random() * (PD_TOWER_FLOORS - 1);
  pdElevGame.dir = pdElevGame.pos < pdElevGame.target ? 1 : -1;
  pdElevGame.active = true;
  pdElevGame.ended = false;
  pdElevGame.lastT = performance.now();
  pdRenderElevGame();
  if (pdElevGame.raf) cancelAnimationFrame(pdElevGame.raf);
  const tick = now => {
    if (!pdElevGame.active) return;
    const dt = Math.min(0.05, (now - pdElevGame.lastT) / 1000);
    pdElevGame.lastT = now;
    const speed = 7.5 + pdElevGame.pos * 0.12 + Math.abs(pdElevGame.target - pdElevGame.pos) * 0.04;
    pdElevGame.pos += pdElevGame.dir * speed * dt;
    if (pdElevGame.pos >= PD_TOWER_FLOORS) {
      pdElevGame.pos = PD_TOWER_FLOORS;
      pdElevGame.dir = -1;
    } else if (pdElevGame.pos <= 1) {
      pdElevGame.pos = 1;
      pdElevGame.dir = 1;
    }
    pdRenderElevGame();
    pdElevGame.raf = requestAnimationFrame(tick);
  };
  pdElevGame.raf = requestAnimationFrame(tick);
}

function pdOpenElevGame() {
  if (!pdTowerInside || pdTowerOnFloorRoom) return;
  if (!PD_TOWER_OPEN_FLOORS.includes(pdTowerFloor)) {
    showPdTowerNpcSpeech('这层还没开放～');
    return;
  }
  const overlay = document.getElementById('pd-elev-game');
  overlay?.removeAttribute('hidden');
  overlay?.setAttribute('aria-hidden', 'false');
  pdStartElevGameRound();
}

function pdElevGameStopTap() {
  if (!pdElevGame.active || pdElevGame.ended) return;
  pdStopElevGame();
  const stopped = Math.round(pdElevGame.pos);
  const diff = Math.abs(pdElevGame.pos - pdElevGame.target);
  const msg = document.getElementById('pd-elev-game-msg');
  const retry = document.getElementById('pd-elev-game-retry');
  if (diff <= 0.65) {
    if (msg) {
      msg.textContent = `停准啦！${stopped} 层 · 完美到站～`;
      msg.className = 'pd-elev-game-msg ok';
    }
    pdSelectTowerFloor(pdElevGame.target);
    showPdTowerNpcSpeech('泡电梯停得真准！');
    setTimeout(() => pdCloseElevGame(), 900);
    return;
  }
  if (diff <= 1.35) {
    if (msg) {
      msg.textContent = `差不多！停在 ${stopped} 层，差一点点～`;
      msg.className = 'pd-elev-game-msg ok';
    }
    pdSelectTowerFloor(pdElevGame.target);
    showPdTowerNpcSpeech('还行还行，到站啦～');
    setTimeout(() => pdCloseElevGame(), 900);
    return;
  }
  if (msg) {
    msg.textContent = `停在了 ${stopped} 层，目标 ${pdElevGame.target} 层，再试一次？`;
    msg.className = 'pd-elev-game-msg miss';
  }
  retry?.removeAttribute('hidden');
}

const PD_TOWER_FLOORS = 54;
const PD_TOWER_FLOOR_H = 13;
const PD_TOWER_SVG_W = 640;
const PD_TOWER_SVG_H = 72 + 18 + PD_TOWER_FLOORS * PD_TOWER_FLOOR_H + 210;
const PD_TOWER_INTERIOR_SVG_W = 520;
const PD_TOWER_INTERIOR_SVG_H = 720;
const PD_TOWER_FLOOR_GROUPS = [
  [1, 2, 3, 4],
  [5, 6, 7, 8, 9, 10],
  [34, 35],
  [54],
];
const PD_TOWER_OPEN_FLOORS = PD_TOWER_FLOOR_GROUPS.flat();
const PD_TOWER_FLOOR_META = {
  1: {
    name: '大厅', tag: '前台', theme: 'lobby',
    roomDesc: '金色光带、泡泡前台、访客沙发区',
    roomSpots: [
      { icon: '🛋', label: '休息区', line: '沙发好软～歇一歇', releaseLine: '放几颗软软泡豆～', beanCount: 4, beanColors: ['#fff9c4', '#ffe082', '#ffcc80'] },
      { icon: '🫧', label: '泡泡台', line: '前台泡泡在冒泡～', releaseLine: '放泡豆啦！咕嘟咕嘟～', beanCount: 8, beanColors: ['#81d4fa', '#4fc3f7', '#b3e5fc', '#fff59d'] },
      { icon: '🪴', label: '绿植角', line: '叶子也是泡泡形的', releaseLine: '放泡豆～带着叶香飘', beanCount: 5, beanColors: ['#c8e6c9', '#a5d6a7', '#81d4fa'] },
    ],
    deco: [{ emoji: '🏛', x: '18%', y: '42%' }, { emoji: '✨', x: '72%', y: '36%' }],
    npcLines: ['欢迎来泡豆大楼～', '右侧电梯选楼层哦', '1 层 最热闹！'],
  },
  2: {
    name: '泡泡廊', tag: '迎宾', theme: 'corridor',
    roomDesc: '地毯走廊、泡泡灯串、两侧展窗',
    roomSpots: [
      { icon: '🫧', label: '泡泡灯', line: '泡泡灯串亮起来啦', releaseLine: '灯串泡豆散开～' },
      { icon: '🖼', label: '展窗', line: '展窗里是泡岛风景', releaseLine: '窗里飘出一串泡～' },
      { icon: '🚪', label: '侧门', line: '侧门通向下一层～', releaseLine: '侧门放泡豆～' },
    ],
    deco: [{ emoji: '🫧', x: '24%', y: '38%' }, { emoji: '🫧', x: '58%', y: '44%' }, { emoji: '🫧', x: '78%', y: '40%' }],
    npcLines: ['2 层 走廊刚铺好地毯', '再往上还有惊喜', '小心地滑～'],
  },
  3: {
    name: '蓝调区', tag: '引导', theme: 'lounge',
    roomDesc: '蓝紫软座、轻音乐角、整面观景窗',
    roomSpots: [
      { icon: '🎵', label: '音乐角', line: '轻音乐咕咕响', releaseLine: '音符泡飘起来～' },
      { icon: '🛋', label: '软座', line: '蓝调软座超治愈', releaseLine: '软座放泡豆～' },
      { icon: '🌊', label: '观景窗', line: '窗外是整个泡岛', releaseLine: '窗外泡豆飞出去～' },
    ],
    deco: [{ emoji: '🎵', x: '20%', y: '40%' }, { emoji: '💙', x: '70%', y: '34%' }],
    npcLines: ['3 层 音乐很轻', '窗户看出去是整座泡岛', '泡泡不咬人放心'],
  },
  4: {
    name: '光庭', tag: '值班', theme: 'atrium',
    roomDesc: '阳光天井、玻璃穹顶、晒泡平台',
    roomSpots: [
      { icon: '☀', label: '阳光台', line: '阳光晒泡暖乎乎', releaseLine: '晒好的泡豆升空～' },
      { icon: '🌿', label: '小花园', line: '小花园冒泡泡', releaseLine: '花园泡豆冒出来～' },
      { icon: '🫧', label: '晒泡垫', line: '晒一晒不会融化', releaseLine: '晒泡垫放泡豆！' },
    ],
    deco: [{ emoji: '☀', x: '50%', y: '22%' }, { emoji: '🌼', x: '28%', y: '46%' }],
    npcLines: ['4 层 阳光最好', '晒晒泡不融化', '继续努力盖楼呀'],
  },
  5: {
    name: '泡工坊', tag: '工匠', theme: 'workshop',
    roomDesc: '小工作台、泡泡模具、手工区',
    roomSpots: [
      { icon: '🔧', label: '工作台', line: '叮叮当当做泡泡', releaseLine: '工坊泡豆出炉～' },
      { icon: '🫧', label: '模具台', line: '模具里冒小泡', releaseLine: '模具放泡豆！' },
      { icon: '📦', label: '材料架', line: '架子摆满泡材', releaseLine: '材料泡飞出来～' },
    ],
    deco: [{ emoji: '🔧', x: '22%', y: '40%' }, { emoji: '🫧', x: '68%', y: '36%' }],
    npcLines: ['5 层 泡工坊开张啦', '手工泡最耐用', '别碰热模具～'],
  },
  6: {
    name: '串泡间', tag: '串手', theme: 'corridor',
    roomDesc: '泡泡串成链、挂饰展示墙',
    roomSpots: [
      { icon: '📿', label: '串泡链', line: '泡泡串在一起', releaseLine: '串泡放豆啦～' },
      { icon: '🎀', label: '挂饰墙', line: '墙上挂满泡饰', releaseLine: '挂饰泡飘起来' },
      { icon: '🫧', label: '展示台', line: '展示台亮晶晶', releaseLine: '展示泡豆！' },
    ],
    deco: [{ emoji: '📿', x: '30%', y: '38%' }, { emoji: '✨', x: '72%', y: '42%' }],
    npcLines: ['6 层 串泡间好热闹', '一串十个泡', '轻点别弄断～'],
  },
  7: {
    name: '趣玩层', tag: '玩伴', theme: 'lounge',
    roomDesc: '弹泡垫、迷你游戏角、彩带区',
    roomSpots: [
      { icon: '🎮', label: '游戏角', line: '小游戏咕咕响', releaseLine: '游戏泡豆蹦出来' },
      { icon: '🎯', label: '弹泡垫', line: '弹一下飞很高', releaseLine: '弹垫放泡豆！' },
      { icon: '🎊', label: '彩带区', line: '彩带飘飘的', releaseLine: '彩带泡豆～' },
    ],
    deco: [{ emoji: '🎮', x: '24%', y: '36%' }, { emoji: '🎊', x: '66%', y: '40%' }],
    npcLines: ['7 层 趣玩层到啦', '弹泡别弹太远', '彩带粘泡豆～'],
  },
  8: {
    name: '静读阁', tag: '书泡', theme: 'lounge',
    roomDesc: '泡泡书架、安静阅读角、窗边看岛',
    roomSpots: [
      { icon: '📚', label: '书架', line: '泡泡书排整齐', releaseLine: '书页泡豆飞出' },
      { icon: '🛋', label: '阅读角', line: '安静读泡书', releaseLine: '阅读角放泡豆' },
      { icon: '🌊', label: '窗边', line: '窗边风很轻', releaseLine: '窗边泡飘走～' },
    ],
    deco: [{ emoji: '📚', x: '20%', y: '42%' }, { emoji: '📖', x: '74%', y: '38%' }],
    npcLines: ['8 层 静读阁要小声', '泡书不能撕页', '窗边看岛好远'],
  },
  9: {
    name: '空中园', tag: '园丁', theme: 'atrium',
    roomDesc: '中层空中花园、泡池、小径',
    roomSpots: [
      { icon: '🌿', label: '空中园', line: '花园冒小泡', releaseLine: '花园放泡豆～' },
      { icon: '💧', label: '泡池', line: '泡池咕嘟响', releaseLine: '泡池泡豆冒出来' },
      { icon: '🪴', label: '小径', line: '小径通观景台', releaseLine: '小径放泡豆！' },
    ],
    deco: [{ emoji: '🌿', x: '26%', y: '44%' }, { emoji: '🦋', x: '70%', y: '32%' }],
    npcLines: ['9 层 空中园好香', '泡池别踩深', '蝴蝶也是泡做的'],
  },
  10: {
    name: '聚泡厅', tag: '主持', theme: 'lobby',
    roomDesc: '低区最后一层、聚会打卡、泡友合影墙',
    roomSpots: [
      { icon: '🎉', label: '聚泡台', line: '大家围在一起放泡', releaseLine: '聚会泡豆蹦出来～', beanCount: 8 },
      { icon: '🎈', label: '庆典角', line: '彩泡挂得满满的', releaseLine: '庆典角放泡豆！' },
      { icon: '📸', label: '打卡墙', line: '和泡豆合个影', releaseLine: '打卡墙泡豆飞～' },
    ],
    deco: [{ emoji: '🎉', x: '28%', y: '38%' }, { emoji: '🎈', x: '68%', y: '34%' }],
    npcLines: ['10 层 聚泡厅到啦', '低区最后一层在这', '再往上要坐电梯好久'],
  },
  34: {
    name: '云际台', tag: '守望', theme: 'sky',
    roomDesc: '三十四层高空、云在脚边、整圈泡岛全景',
    roomSpots: [
      { icon: '🌬', label: '云海带', line: '云从脚边涌过去', releaseLine: '云泡被风卷走～' },
      { icon: '🗻', label: '全景窗', line: '泡岛一整圈看得清', releaseLine: '高处全景放泡豆！', beanCount: 8 },
      { icon: '💨', label: '高空气廊', line: '风大泡豆会飘远', releaseLine: '气廊把泡豆吹出去！' },
    ],
    deco: [{ emoji: '☁', x: '14%', y: '22%' }, { emoji: '☁', x: '72%', y: '18%' }, { emoji: '🌬', x: '46%', y: '32%' }],
    npcLines: ['34 层 云际台风很大', '云在脚边不是在地上', '比十层高得多啦'],
  },
  35: {
    name: '星阁', tag: '守望', theme: 'star',
    roomDesc: '星顶玻璃、贴窗小星、高空星阁',
    roomSpots: [
      { icon: '⭐', label: '星顶', line: '星顶一闪一闪', releaseLine: '星光泡飞起来～' },
      { icon: '🌙', label: '夜窗', line: '星星贴在窗上', releaseLine: '夜窗放泡豆～' },
      { icon: '🔭', label: '观景台', line: '再近一点会飘起来', releaseLine: '观景台泡豆飘走～' },
    ],
    deco: [{ emoji: '⭐', x: '22%', y: '18%' }, { emoji: '✨', x: '62%', y: '22%' }, { emoji: '🌙', x: '78%', y: '34%' }],
    npcLines: ['35 层 再往上是顶层', '晚上星星贴窗上', '别靠太近会飘'],
  },
  54: {
    name: '顶层', tag: '顶守', theme: 'crown',
    roomDesc: '泡豆大楼最高层、尖顶金光、整岛尽收眼底',
    roomSpots: [
      { icon: '👑', label: '尖顶', line: '尖顶金光闪闪', releaseLine: '顶层泡豆洒下来！', beanCount: 10, beanColors: ['#fff9c4', '#ffd54f', '#ffab00', '#fffde7'] },
      { icon: '🌟', label: '金台', line: '金台站得高', releaseLine: '金台放泡豆～' },
      { icon: '🫧', label: '顶泡池', line: '顶泡池最透亮', releaseLine: '顶泡飞满岛！' },
    ],
    deco: [{ emoji: '👑', x: '48%', y: '16%' }, { emoji: '✨', x: '22%', y: '24%' }, { emoji: '🌟', x: '72%', y: '20%' }],
    npcLines: ['54 层 到顶啦！', '这里是泡豆大楼顶层', '风大抓住泡豆～'],
  },
};

function pdIso(cx, baseY, x, y, z) {
  return {
    x: cx + (x - z) * 0.866,
    y: baseY - y + (x + z) * 0.5,
  };
}

function pdIsoLerp(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function pdIsoPoly(pts) {
  return pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

function pdTowerFaceColors(floorIdx, yawDeg) {
  const rad = yawDeg * Math.PI / 180;
  const wB = 0.42 + 0.58 * Math.max(0, Math.cos(rad + 0.35));
  const eB = 0.42 + 0.58 * Math.max(0, Math.sin(rad + 0.15));
  const sB = 0.48 + 0.52 * Math.max(0, Math.cos(rad - 0.45));
  const lift = floorIdx * 1.4;
  return {
    west: `rgb(${Math.round(10 + lift)},${Math.round(52 + 36 * wB)},${Math.round(138 + lift)})`,
    east: `rgb(${Math.round(22 + lift)},${Math.round(102 + 40 * eB)},${Math.round(198 + lift)})`,
    south: `rgb(${Math.round(48 + lift)},${Math.round(142 + 34 * sB)},${Math.round(248)})`,
    top: `rgb(${Math.round(210 + lift * 0.25)},${Math.round(236)},${Math.round(255)})`,
  };
}

function pdTowerIsoBoxParts(cx, baseY, w, d, h, y0, colors, floorIdx, opts = {}) {
  const { skipWindows = false } = opts;
  const hw = w / 2;
  const hd = d / 2;
  const p = (x, y, z) => pdIso(cx, baseY, x, y0 + y, z);
  const edge = 'rgba(255,255,255,0.42)';
  const parts = [];

  parts.push({
    pts: [p(-hw, 0, -hd), p(-hw, 0, hd), p(-hw, h, hd), p(-hw, h, -hd)],
    fill: colors.west,
    stroke: edge,
  });
  parts.push({
    pts: [p(hw, 0, hd), p(hw, 0, -hd), p(hw, h, -hd), p(hw, h, hd)],
    fill: colors.east,
    stroke: edge,
  });
  parts.push({
    pts: [p(-hw, 0, hd), p(hw, 0, hd), p(hw, h, hd), p(-hw, h, hd)],
    fill: colors.south,
    stroke: edge,
  });
  parts.push({
    pts: [p(-hw, h, -hd), p(hw, h, -hd), p(hw, h, hd), p(-hw, h, hd)],
    fill: colors.top,
    stroke: 'rgba(255,255,255,0.55)',
  });

  if (!skipWindows) {
    const bl = p(-hw, 0, hd);
    const br = p(hw, 0, hd);
    const tl = p(-hw, h, hd);
    const tr = p(hw, h, hd);
    for (let c = 0; c < 3; c++) {
      const t0 = 0.14 + c * 0.24;
      const t1 = t0 + 0.14;
      parts.push({
        pts: [
          pdIsoLerp(bl, br, t0),
          pdIsoLerp(bl, br, t1),
          pdIsoLerp(tl, tr, t1),
          pdIsoLerp(tl, tr, t0),
        ],
        fill: (floorIdx + c) % 4 === 0 ? '#fff6b3' : '#e6f3ff',
        stroke: 'rgba(255,255,255,0.5)',
        win: true,
      });
    }

    const erBl = p(hw, 0, -hd);
    const erBr = p(hw, 0, hd);
    const erTl = p(hw, h, hd);
    const erTr = p(hw, h, -hd);
    for (let c = 0; c < 2; c++) {
      const t0 = 0.2 + c * 0.34;
      const t1 = t0 + 0.2;
      parts.push({
        pts: [
          pdIsoLerp(erBl, erBr, t0),
          pdIsoLerp(erBl, erBr, t1),
          pdIsoLerp(erTl, erTr, t1),
          pdIsoLerp(erTl, erTr, t0),
        ],
        fill: (floorIdx + c) % 3 === 0 ? '#fff8cc' : '#d9ecff',
        stroke: 'rgba(255,255,255,0.38)',
        win: true,
      });
    }
  }

  return parts;
}

function paintPdTowerSvg(svg, yawDeg = 0) {
  const cx = PD_TOWER_SVG_W / 2;
  const baseY = PD_TOWER_SVG_H - 72;
  const floorH = PD_TOWER_FLOOR_H;
  const baseW = 210;
  const baseD = 118;
  const taper = (baseW - 112) / PD_TOWER_FLOORS;
  const chunks = [];

  chunks.push(`<ellipse cx="${cx}" cy="${baseY + 18}" rx="158" ry="32" fill="rgba(13,71,161,0.22)"/>`);

  const plazaParts = pdTowerIsoBoxParts(cx, baseY, 280, 150, 18, 0, {
    west: '#1565c0',
    east: '#42a5f5',
    south: '#64b5f6',
    top: '#e8f4ff',
  }, 0, { skipWindows: true });
  plazaParts.forEach(part => {
    chunks.push(`<polygon points="${pdIsoPoly(part.pts)}" fill="${part.fill}" stroke="${part.stroke}" stroke-width="1.5" stroke-linejoin="round"/>`);
  });

  for (let i = 0; i < PD_TOWER_FLOORS; i++) {
    const w = Math.max(96, baseW - i * taper);
    const d = Math.max(58, baseD - i * taper * 0.72);
    const y0 = 18 + i * floorH;
    const parts = pdTowerIsoBoxParts(cx, baseY, w, d, floorH - 1, y0, pdTowerFaceColors(i, yawDeg), i);
    parts.forEach(part => {
      const sw = part.win ? 0.8 : 1.1;
      chunks.push(`<polygon points="${pdIsoPoly(part.pts)}" fill="${part.fill}" stroke="${part.stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`);
    });
  }

  const topY = baseY - (18 + PD_TOWER_FLOORS * floorH);
  const rad = yawDeg * Math.PI / 180;
  const beamW = 34 + Math.sin(rad) * 8;
  chunks.push(`<polygon points="${pdIsoPoly([
    { x: cx - beamW * 0.34, y: topY - 300 },
    { x: cx + beamW * 0.34, y: topY - 300 },
    { x: cx + beamW, y: topY - 18 },
    { x: cx - beamW, y: topY - 18 },
  ])}" fill="url(#pdTowerBeam)" opacity="0.88"/>`);

  for (let i = 7; i >= 0; i--) {
    const t = i / 7;
    const y = topY - 10 - t * 78 * 1.05;
    const rx = (0.34 + 0.66 * Math.sqrt(Math.max(0, 1 - t * t))) * 78;
    const ry = rx * 0.34;
    chunks.push(`<ellipse cx="${cx + Math.sin(rad) * t * 5}" cy="${y}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="rgba(${120 + t * 60},${188 + t * 28},255,${0.84 + t * 0.1})" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>`);
  }

  chunks.push(`<line x1="${cx}" y1="${topY - 92}" x2="${cx}" y2="${topY - 148}" stroke="#ffe082" stroke-width="6" stroke-linecap="round"/>`);
  chunks.push(`<circle cx="${cx}" cy="${topY - 154}" r="10" fill="#ffeb3b" stroke="#fff" stroke-width="2.5"/>`);

  svg.innerHTML = `
    <defs>
      <linearGradient id="pdTowerBeam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(255,235,59,0.72)"/>
        <stop offset="100%" stop-color="rgba(255,235,59,0)"/>
      </linearGradient>
    </defs>
    ${chunks.join('')}
  `;
  svg.dataset.pdYaw = String(Math.round(yawDeg));
}

function pdTowerCutawaySlice(cx, baseY, w, d, h, y0, colors, opts = {}) {
  const { highlight = false } = opts;
  const hw = w / 2;
  const hd = d / 2;
  const p = (x, y, z) => pdIso(cx, baseY, x, y0 + y, z);
  const edge = highlight ? 'rgba(255,235,59,0.72)' : 'rgba(255,255,255,0.32)';
  const parts = [];

  parts.push({
    pts: [p(hw, 0, hd), p(hw, 0, -hd), p(hw, h, -hd), p(hw, h, hd)],
    fill: colors.east,
    stroke: edge,
  });
  parts.push({
    pts: [p(-hw, 0, hd), p(hw, 0, hd), p(hw, h, hd), p(-hw, h, hd)],
    fill: colors.south,
    stroke: edge,
  });
  parts.push({
    pts: [p(-hw, h, -hd), p(hw, h, -hd), p(hw, h, hd), p(-hw, h, hd)],
    fill: colors.top,
    stroke: highlight ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.42)',
  });

  if (highlight) {
    parts.push({
      pts: [p(-hw, 0, -hd), p(-hw, 0, hd), p(-hw, h, hd), p(-hw, h, -hd)],
      fill: '#e8f4ff',
      stroke: 'rgba(255,255,255,0.55)',
    });
    parts.push({
      pts: [p(-hw * 0.88, 0, -hd * 0.82), p(-hw * 0.88, 0, hd * 0.82), p(-hw * 0.62, 0, hd * 0.62), p(-hw * 0.62, 0, -hd * 0.62)],
      fill: '#fffde7',
      stroke: 'rgba(255,213,79,0.35)',
    });
    const bl = p(-hw, 0, hd);
    const br = p(hw, 0, hd);
    const tl = p(-hw, h, hd);
    const tr = p(hw, h, hd);
    for (let c = 0; c < 2; c++) {
      const t0 = 0.18 + c * 0.34;
      const t1 = t0 + 0.22;
      parts.push({
        pts: [
          pdIsoLerp(bl, br, t0),
          pdIsoLerp(bl, br, t1),
          pdIsoLerp(tl, tr, t1),
          pdIsoLerp(tl, tr, t0),
        ],
        fill: c === 0 ? '#fff8cc' : '#e3f2fd',
        stroke: 'rgba(255,255,255,0.45)',
      });
    }
    const desk = pdTowerIsoBoxParts(cx + hw * 0.08, baseY, w * 0.34, d * 0.28, h * 0.42, y0 + h * 0.08, {
      west: '#90caf9',
      east: '#64b5f6',
      south: '#42a5f5',
      top: '#e3f2fd',
    }, 0, { skipWindows: true });
    desk.forEach(part => {
      parts.push({ pts: part.pts, fill: part.fill, stroke: 'rgba(255,255,255,0.38)' });
    });
  } else {
    parts.push({
      pts: [p(-hw, 0, -hd), p(-hw, 0, hd), p(-hw, h, hd), p(-hw, h, -hd)],
      fill: colors.west,
      stroke: edge,
    });
  }

  return parts;
}

function paintPdTowerInteriorSvg(svg, yawDeg = 0, floorNum = 1) {
  const cx = PD_TOWER_INTERIOR_SVG_W / 2;
  const baseY = PD_TOWER_INTERIOR_SVG_H - 36;
  const sliceH = 8.4;
  const baseW = 198;
  const baseD = 110;
  const taper = (baseW - 106) / PD_TOWER_FLOORS;
  const chunks = [];

  chunks.push(`<ellipse cx="${cx}" cy="${baseY + 8}" rx="138" ry="22" fill="rgba(13,71,161,0.2)"/>`);

  chunks.push(`<polygon points="${pdIsoPoly([
    pdIso(cx, baseY, -112, 6, -48),
    pdIso(cx, baseY, -112, 6 + PD_TOWER_FLOORS * sliceH, -48),
    pdIso(cx, baseY, -92, 6 + PD_TOWER_FLOORS * sliceH, -36),
    pdIso(cx, baseY, -92, 6, -36),
  ])}" fill="rgba(38,50,56,0.28)" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>`);

  for (let i = 0; i < PD_TOWER_FLOORS; i++) {
    const f = i + 1;
    const w = Math.max(92, baseW - i * taper);
    const d = Math.max(56, baseD - i * taper * 0.72);
    const y0 = 6 + i * sliceH;
    const highlight = f === floorNum;
    const h = highlight ? sliceH * 2.55 : sliceH - 0.7;
    const colors = pdTowerFaceColors(i, yawDeg);
    const parts = pdTowerCutawaySlice(cx, baseY, w, d, h, y0, colors, { highlight });
    parts.forEach(part => {
      chunks.push(`<polygon points="${pdIsoPoly(part.pts)}" fill="${part.fill}" stroke="${part.stroke}" stroke-width="${highlight ? 1.4 : 0.9}" stroke-linejoin="round"/>`);
    });
    if (highlight) {
      const bandY = baseY - (y0 + h * 0.55);
      chunks.push(`<ellipse cx="${cx}" cy="${bandY}" rx="${(w * 0.34).toFixed(1)}" ry="5" fill="rgba(255,235,59,0.42)"/>`);
    }
  }

  const curIdx = Math.max(0, floorNum - 1);
  const markerY = baseY - (6 + curIdx * sliceH + sliceH * 1.1);
  chunks.push(`<text x="${cx + 108}" y="${markerY}" font-size="13" font-weight="800" fill="#01579b" stroke="#fff" stroke-width="2" paint-order="stroke">${floorNum} 层</text>`);

  const topY = baseY - (6 + PD_TOWER_FLOORS * sliceH);
  const rad = yawDeg * Math.PI / 180;
  chunks.push(`<polygon points="${pdIsoPoly([
    { x: cx - 16, y: topY - 120 },
    { x: cx + 16, y: topY - 120 },
    { x: cx + 28, y: topY - 8 },
    { x: cx - 28, y: topY - 8 },
  ])}" fill="url(#pdTowerIntBeam)" opacity="0.82"/>`);
  chunks.push(`<ellipse cx="${cx + Math.sin(rad) * 3}" cy="${topY - 18}" rx="34" ry="12" fill="rgba(129,212,250,0.88)" stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>`);

  svg.innerHTML = `
    <defs>
      <linearGradient id="pdTowerIntBeam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(255,235,59,0.65)"/>
        <stop offset="100%" stop-color="rgba(255,235,59,0)"/>
      </linearGradient>
    </defs>
    ${chunks.join('')}
  `;
  svg.dataset.pdYaw = String(Math.round(yawDeg));
  svg.dataset.pdFloor = String(floorNum);
}

function updatePdTowerFloorLabel() {
  const meta = PD_TOWER_FLOOR_META[pdTowerFloor];
  const el = document.getElementById('pd-tower-floor-label');
  if (el) el.textContent = `${pdTowerFloor} 层 · ${meta?.name || '楼层'}`;
  updatePdTowerEnterFloorBtn();
}

function showPdFloorRoomNpcSpeech(text) {
  const el = document.getElementById('pd-floor-room-npc-speech');
  if (!el) return;
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(showPdFloorRoomNpcSpeech._t);
  showPdFloorRoomNpcSpeech._t = setTimeout(() => el.classList.remove('show'), 2400);
}

const PD_FLOOR_THEME_BEANS = {
  lobby: ['#fff9c4', '#ffe082', '#81d4fa', '#ffcc80'],
  corridor: ['#b3e5fc', '#81d4fa', '#e1f5fe', '#4fc3f7'],
  lounge: ['#c5cae9', '#9fa8da', '#7986cb', '#81d4fa'],
  atrium: ['#fff176', '#ffee58', '#ffd54f', '#fff9c4'],
  sky: ['#b2ebf2', '#80deea', '#4dd0e1', '#e0f7fa'],
  star: ['#e8eaf6', '#c5cae9', '#9fa8da', '#fff59d'],
  workshop: ['#cfd8dc', '#b0bec5', '#90a4ae', '#eceff1'],
  crown: ['#fff9c4', '#ffd54f', '#ffab00', '#fffde7'],
};

function pdClearFloorFloatBubbles() {
  pdFloorFloatBubbles.forEach(b => b.el?.remove());
  pdFloorFloatBubbles.length = 0;
}

function pdTickFloorFloatBubbles(stage) {
  if (!stage) return;
  const sw = stage.clientWidth;
  const sh = stage.clientHeight;
  for (let i = pdFloorFloatBubbles.length - 1; i >= 0; i--) {
    const b = pdFloorFloatBubbles[i];
    b.x += b.vx;
    b.y += b.vy;
    b.vy -= 0.018;
    b.vx += (Math.random() - 0.5) * 0.05;
    b.vx *= 0.988;
    b.life -= 0.0045;
    b.el.style.left = `${b.x}px`;
    b.el.style.top = `${b.y}px`;
    b.el.style.opacity = String(Math.max(0, Math.min(1, b.life)));
    if (b.life <= 0 || b.y < -24 || b.x < -24 || b.x > sw + 24 || b.y > sh + 24) {
      b.el.remove();
      pdFloorFloatBubbles.splice(i, 1);
    }
  }
}

function pdReleaseFloorRoomBeans(spotEl, spotMeta) {
  const stage = document.getElementById('pd-tower-floor-room-stage');
  if (!stage || !spotEl || !spotMeta) return;
  const now = performance.now();
  if (spotEl.dataset.releaseUntil && now < parseFloat(spotEl.dataset.releaseUntil)) return;
  spotEl.dataset.releaseUntil = String(now + 420);
  spotEl.classList.add('lit');
  clearTimeout(spotEl._pdLitT);
  spotEl._pdLitT = setTimeout(() => spotEl.classList.remove('lit'), 4500);
  stage.classList.add('pd-floor-room-lit');
  clearTimeout(stage._pdLitT);
  stage._pdLitT = setTimeout(() => stage.classList.remove('pd-floor-room-lit'), 4500);
  let layer = stage.querySelector('.pd-floor-room-beans');
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'pd-floor-room-beans';
    layer.setAttribute('aria-hidden', 'true');
    stage.appendChild(layer);
  }
  const floorMeta = PD_TOWER_FLOOR_META[pdTowerFloor] || {};
  const colors = spotMeta.beanColors
    || PD_FLOOR_THEME_BEANS[floorMeta.theme]
    || ['#81d4fa', '#4fc3f7', '#b3e5fc', '#fff59d'];
  const count = spotMeta.beanCount || 6;
  const sr = spotEl.getBoundingClientRect();
  const pr = stage.getBoundingClientRect();
  const ox = sr.left + sr.width / 2 - pr.left;
  const oy = sr.top + sr.height * 0.35 - pr.top;
  for (let i = 0; i < count; i++) {
    const bean = document.createElement('span');
    bean.className = 'pd-floor-room-bean pd-floor-room-bean--live';
    const size = 12 + Math.random() * 14;
    bean.style.width = `${size}px`;
    bean.style.height = `${size}px`;
    const bx = ox + (Math.random() - 0.5) * 32;
    const by = oy + (Math.random() - 0.5) * 12;
    bean.style.left = `${bx}px`;
    bean.style.top = `${by}px`;
    bean.style.background = colors[i % colors.length];
    layer.appendChild(bean);
    pdFloorFloatBubbles.push({
      el: bean,
      x: bx,
      y: by,
      vx: (Math.random() - 0.5) * 1.4,
      vy: -1.6 - Math.random() * 1.4,
      life: 0.88 + Math.random() * 0.12,
    });
  }
  spotEl.classList.add('releasing');
  setTimeout(() => spotEl.classList.remove('releasing'), 420);
  const msg = spotMeta.releaseLine || spotMeta.line || '放泡豆～';
  showPdFloorRoomNpcSpeech(msg);
  showPdBuddySpeech(msg);
}

function paintPdTowerFloorRoom(f) {
  const stage = document.getElementById('pd-tower-floor-room-stage');
  const meta = PD_TOWER_FLOOR_META[f];
  if (!stage || !meta) return;
  stage.className = `pd-tower-floor-room-stage pd-floor-theme-${meta.theme || 'lobby'}`;
  const spots = (meta.roomSpots || []).map((spot, idx) =>
    `<button type="button" class="pd-floor-room-spot" data-spot-idx="${idx}" title="${spot.label} · 点我放泡豆" aria-label="${spot.label} · 放泡豆">
      <i>${spot.icon}</i>${spot.label}
    </button>`
  ).join('');
  const deco = (meta.deco || []).map(d =>
    `<span class="pd-floor-room-deco" style="left:${d.x};top:${d.y}">${d.emoji}</span>`
  ).join('');
  stage.innerHTML = `
    <div class="pd-floor-room-scene" aria-hidden="true">
      <div class="pd-floor-room-window left"></div>
      <div class="pd-floor-room-window right"></div>
      <div class="pd-floor-room-floor"></div>
      ${deco}
    </div>
    <div class="pd-floor-room-head">
      <span class="pd-floor-room-badge">${f} 层</span>
      <h2 class="pd-floor-room-title">${meta.name}</h2>
      <div class="pd-floor-hunt-bar" id="pd-floor-hunt-bar">
        <span>🔍 寻泡</span>
        <span id="pd-floor-hunt-count">0/3</span>
      </div>
    </div>
    <p class="pd-floor-room-desc">${meta.roomDesc || ''}</p>
    <div class="pd-floor-room-spots">${spots}</div>
    <div class="pd-floor-room-beans" aria-hidden="true"></div>
    <button type="button" class="pd-floor-room-npc" title="点我聊天" aria-label="楼层泡泡">
      <span class="pd-floor-room-npc-body" aria-hidden="true">🫧</span>
      <span class="pd-floor-room-npc-tag">${meta.tag || '泡泡'}</span>
      <span class="pd-floor-room-npc-speech" id="pd-floor-room-npc-speech" aria-live="polite"></span>
    </button>
    <div id="pd-floor-room-buddy-slot" class="pd-floor-room-buddy-slot"></div>
  `;
  pdSetupFloorHunt(f);
  attachPdBuddyToFloorRoom();
  if (pdTowerRoomEntering) {
    const buddy = document.getElementById('pd-buddy');
    buddy?.classList.add('walking', 'pd-room-entering');
  }
}

function pdResetFloorRoomMotion(x, y) {
  pdTowerRoomPos.x = x;
  pdTowerRoomPos.y = y;
  pdTowerRoomRender.x = x;
  pdTowerRoomRender.y = y;
  pdTowerRoomVel.vx = 0;
  pdTowerRoomVel.vy = 0;
  pdTowerRoomLastTick = performance.now();
}

function attachPdBuddyToFloorRoom() {
  const slot = document.getElementById('pd-floor-room-buddy-slot');
  const buddy = document.getElementById('pd-buddy');
  if (!slot || !buddy) return;
  buddy.style.opacity = '0';
  slot.appendChild(buddy);
  buddy.classList.add('pd-buddy-in-room');
  updatePdFloorRoomBuddyPos(true);
  requestAnimationFrame(() => {
    buddy.style.opacity = '1';
    buddy.style.transition = 'opacity 0.25s ease';
  });
}

function detachPdBuddyFromFloorRoom() {
  const layer = document.getElementById('pd-buddy-layer');
  const buddy = document.getElementById('pd-buddy');
  if (!layer || !buddy) return;
  layer.appendChild(buddy);
  buddy.classList.remove('pd-buddy-in-room', 'pd-room-entering', 'walking');
  buddy.style.opacity = '';
  buddy.style.transition = '';
  buddy.style.transform = '';
}

function updatePdFloorRoomBuddyPos(forceSnap = false) {
  const slot = document.getElementById('pd-floor-room-buddy-slot');
  const stage = document.getElementById('pd-tower-floor-room-stage');
  if (!slot || !stage || !pdTowerOnFloorRoom) return;
  if (forceSnap) {
    pdTowerRoomRender.x = pdTowerRoomPos.x;
    pdTowerRoomRender.y = pdTowerRoomPos.y;
  }
  const px = pdTowerRoomRender.x * stage.clientWidth;
  const py = pdTowerRoomRender.y * stage.clientHeight;
  const depthT = Math.max(0, Math.min(1, (pdTowerRoomRender.y - 0.52) / 0.34));
  const depthScale = 0.78 + depthT * 0.22;
  slot.style.left = '0';
  slot.style.top = '0';
  slot.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%) scale(${depthScale})`;
}

function pdTickFloorRoomBuddy(now) {
  const stage = document.getElementById('pd-tower-floor-room-stage');
  const buddy = document.getElementById('pd-buddy');
  if (!stage) return;
  const dt = Math.min(2.4, Math.max(0.35, (now - (pdTowerRoomLastTick || now)) / 16.67));
  pdTowerRoomLastTick = now;

  if (pdTowerRoomEntering) {
    const dur = 2400;
    const t = Math.min(1, (now - pdTowerRoomEnterT) / dur);
    const ease = t * t * (3 - 2 * t);
    const tx = 0.5 + (0.24 - 0.5) * ease;
    const ty = 0.9 + (0.66 - 0.9) * ease;
    pdTowerRoomPos.x = tx;
    pdTowerRoomPos.y = ty;
    pdTowerRoomRender.x += (tx - pdTowerRoomRender.x) * Math.min(1, 0.22 * dt);
    pdTowerRoomRender.y += (ty - pdTowerRoomRender.y) * Math.min(1, 0.22 * dt);
    pdBuddy.facing = pdTowerRoomRender.x > 0.27 ? -1 : 1;
    pdBuddy.walking = true;
    if (buddy) {
      buddy.classList.add('walking', 'pd-room-entering');
      buddy.style.transform = `scaleX(${pdBuddy.facing < 0 ? -1 : 1})`;
    }
    if (t >= 1) {
      pdTowerRoomEntering = false;
      pdTowerRoomVel.vx = 0;
      pdTowerRoomVel.vy = 0;
      buddy?.classList.remove('pd-room-entering');
    }
  } else {
    const walk = pdCollectMapWalk();
    const len = Math.hypot(walk.mx, walk.my);
    const maxSp = 0.018;
    const accel = 0.11;
    const friction = 0.78;
    if (len > 0) {
      const targetVx = (walk.mx / len) * maxSp;
      const targetVy = (walk.my / len) * maxSp;
      pdTowerRoomVel.vx += (targetVx - pdTowerRoomVel.vx) * accel * dt;
      pdTowerRoomVel.vy += (targetVy - pdTowerRoomVel.vy) * accel * dt;
    } else {
      pdTowerRoomVel.vx *= Math.pow(friction, dt);
      pdTowerRoomVel.vy *= Math.pow(friction, dt);
      if (Math.abs(pdTowerRoomVel.vx) < 0.00035) pdTowerRoomVel.vx = 0;
      if (Math.abs(pdTowerRoomVel.vy) < 0.00035) pdTowerRoomVel.vy = 0;
    }
    pdTowerRoomPos.x = Math.max(0.08, Math.min(0.88, pdTowerRoomPos.x + pdTowerRoomVel.vx * dt));
    pdTowerRoomPos.y = Math.max(0.52, Math.min(0.86, pdTowerRoomPos.y + pdTowerRoomVel.vy * dt));
    pdTowerRoomRender.x += (pdTowerRoomPos.x - pdTowerRoomRender.x) * Math.min(1, 0.42 * dt);
    pdTowerRoomRender.y += (pdTowerRoomPos.y - pdTowerRoomRender.y) * Math.min(1, 0.42 * dt);
    const moving = len > 0 || Math.hypot(pdTowerRoomVel.vx, pdTowerRoomVel.vy) > 0.0015;
    if (moving) {
      if (Math.abs(pdTowerRoomVel.vx) > 0.0012) pdBuddy.facing = pdTowerRoomVel.vx < 0 ? -1 : 1;
      pdBuddy.walking = true;
      if (buddy) {
        buddy.classList.add('walking');
        buddy.classList.remove('pd-room-entering');
        buddy.style.transform = `scaleX(${pdBuddy.facing < 0 ? -1 : 1})`;
      }
    } else if (pdBuddy.walking) {
      pdBuddy.walking = false;
      buddy?.classList.remove('walking', 'pd-room-entering');
    }
  }
  updatePdFloorRoomBuddyPos();
  pdUpdateFloorHuntNear();
  pdTickFloorFloatBubbles(stage);
}

function updatePdTowerEnterFloorBtn() {
  const btn = document.getElementById('pd-tower-enter-floor-btn');
  if (!btn) return;
  if (!pdTowerInside) {
    btn.hidden = true;
    return;
  }
  btn.hidden = false;
  const meta = PD_TOWER_FLOOR_META[pdTowerFloor];
  const numEl = btn.querySelector('.pd-enter-floor-num');
  const actEl = btn.querySelector('.pd-enter-floor-action');
  if (pdTowerOnFloorRoom) {
    btn.classList.add('is-back');
    if (numEl) numEl.textContent = `${pdTowerFloor} 层 · ${meta?.name || '楼层'}`;
    if (actEl) actEl.textContent = '返回选层';
    btn.title = '返回大楼剖面选层';
    btn.setAttribute('aria-label', '返回选层');
    btn.disabled = false;
    return;
  }
  btn.classList.remove('is-back');
  if (numEl) numEl.textContent = `${pdTowerFloor} 层 · ${meta?.name || '楼层'}`;
  if (actEl) actEl.textContent = '进入本层';
  btn.title = `进入 ${pdTowerFloor} 层 ${meta?.name || '本层'}`;
  btn.setAttribute('aria-label', `进入 ${pdTowerFloor} 层 ${meta?.name || '本层'}`);
  btn.disabled = !PD_TOWER_OPEN_FLOORS.includes(pdTowerFloor);
}

function updatePdTowerFloorRoomView() {
  const room = document.getElementById('pd-tower-floor-room');
  const playfield = document.getElementById('paodou-playfield');
  if (room) {
    room.hidden = !pdTowerOnFloorRoom;
    room.setAttribute('aria-hidden', pdTowerOnFloorRoom ? 'false' : 'true');
  }
  playfield?.classList.toggle('pd-on-floor-room', pdTowerInside && pdTowerOnFloorRoom);
  updatePdBuddyFloorPicker();
  updatePdTowerEnterFloorBtn();
  if (pdTowerOnFloorRoom) updatePdFloorRoomBuddyPos(true);
  else detachPdBuddyFromFloorRoom();
}

function pdEnterTowerFloorRoom() {
  if (!pdTowerInside || pdTowerOnFloorRoom) return;
  if (!PD_TOWER_OPEN_FLOORS.includes(pdTowerFloor)) {
    showPdTowerNpcSpeech('这层还在装修～');
    return;
  }
  pdClearFloorFloatBubbles();
  pdTowerOnFloorRoom = true;
  pdTowerRoomEntering = true;
  pdTowerRoomEnterT = performance.now();
  pdResetFloorRoomMotion(0.5, 0.9);
  paintPdTowerFloorRoom(pdTowerFloor);
  updatePdTowerFloorRoomView();
  const meta = PD_TOWER_FLOOR_META[pdTowerFloor];
  showPdFloorRoomNpcSpeech('寻泡：用方向键走到半透明泡豆旁，再点它～');
  if (meta?.npcLines?.[0]) {
    setTimeout(() => showPdFloorRoomNpcSpeech(meta.npcLines[0]), 2600);
  }
}

function pdLeaveTowerFloorRoom() {
  if (!pdTowerOnFloorRoom) return;
  pdTowerOnFloorRoom = false;
  pdTowerRoomEntering = false;
  pdClearFloorFloatBubbles();
  pdClearFloorHunt();
  detachPdBuddyFromFloorRoom();
  updatePdTowerFloorRoomView();
  paintPdTowerInterior(true);
  refreshPdBuddyDOM();
  showPdBuddySpeech('回到剖面选层啦');
}

function pdToggleTowerFloorRoom() {
  if (pdTowerOnFloorRoom) pdLeaveTowerFloorRoom();
  else pdEnterTowerFloorRoom();
}

function showPdTowerNpcSpeech(text) {
  const el = document.getElementById('pd-tower-npc-speech');
  if (!el) return;
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(showPdTowerNpcSpeech._t);
  showPdTowerNpcSpeech._t = setTimeout(() => el.classList.remove('show'), 2400);
}

function updatePdTowerNpcPosition() {
  const npc = document.getElementById('pd-tower-npc');
  if (!npc) return;
  const pct = 10 + ((pdTowerFloor - 1) / (PD_TOWER_FLOORS - 1)) * 68;
  npc.style.bottom = `${pct}%`;
  const tag = document.getElementById('pd-tower-npc-tag');
  if (tag) tag.textContent = PD_TOWER_FLOOR_META[pdTowerFloor]?.tag || '泡泡';
}

function buildPdTowerFloorMenu() {
  const list = document.getElementById('pd-tower-floor-list');
  if (!list) return;
  const expected = PD_TOWER_OPEN_FLOORS.length;
  if (list.dataset.bound) {
    const btns = list.querySelectorAll('.pd-elev-btn');
    if (btns.length !== expected) {
      list.innerHTML = '';
      delete list.dataset.bound;
    } else {
      btns.forEach(btn => {
        btn.classList.toggle('on', parseInt(btn.dataset.floor, 10) === pdTowerFloor);
      });
      return;
    }
  }
  list.dataset.bound = '1';
  const addBtn = f => {
    const meta = PD_TOWER_FLOOR_META[f];
    const btn = document.createElement('button');
    btn.type = 'button';
    const topCls = f === PD_TOWER_FLOORS ? ' pd-elev-btn-top' : '';
    btn.className = `pd-elev-btn${PD_TOWER_OPEN_FLOORS.includes(f) ? '' : ' locked'}${topCls}`;
    btn.dataset.floor = String(f);
    btn.textContent = String(f);
    btn.title = `${f} 层 ${meta?.name || ''}${f === PD_TOWER_FLOORS ? ' · 顶层' : ''}`;
    btn.setAttribute('aria-label', `${f} 层 ${meta?.name || '楼层'}`);
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      pdSelectTowerFloor(f);
    });
    list.appendChild(btn);
  };
  PD_TOWER_FLOOR_GROUPS.forEach((group, gi) => {
    if (gi > 0) {
      const sep = document.createElement('div');
      sep.className = 'pd-elev-sep';
      list.appendChild(sep);
    }
    group.forEach(addBtn);
  });
}

function pdSelectTowerFloor(f) {
  if (!PD_TOWER_OPEN_FLOORS.includes(f)) {
    showPdTowerNpcSpeech('这层还在装修～');
    return;
  }
  if (pdTowerOnFloorRoom) {
    pdTowerOnFloorRoom = false;
    pdTowerRoomEntering = false;
    pdClearFloorFloatBubbles();
    pdClearFloorHunt();
  }
  pdTowerFloor = f;
  recordPaodouFloorForAch(f);
  paintPdTowerInterior(true);
  updatePdTowerFloorRoomView();
  updatePdTowerInteriorBuddyPos();
  const lines = PD_TOWER_FLOOR_META[f]?.npcLines || PD_TOWER_LINES;
  showPdTowerNpcSpeech(lines[Math.floor(Math.random() * lines.length)]);
}

function paintPdTowerInterior(force = false) {
  const svg = document.getElementById('pd-tower-interior-svg');
  if (!svg) return;
  const lastYaw = parseFloat(svg.dataset.pdYaw || 'NaN');
  const lastFloor = parseInt(svg.dataset.pdFloor || '0', 10);
  if (!force && lastFloor === pdTowerFloor && Number.isFinite(lastYaw) && Math.abs(lastYaw - pdCamera.yaw) < 0.45) return;
  paintPdTowerInteriorSvg(svg, pdCamera.yaw, pdTowerFloor);
  updatePdTowerFloorLabel();
  buildPdTowerFloorMenu();
  updatePdBuddyFloorPicker();
  updatePdTowerNpcPosition();
}

function updatePdTowerInteriorYaw() {
  paintPdTowerInterior(false);
}

function updatePdTowerInteriorView() {
  const rig = document.getElementById('pd-tower-interior-rig');
  if (!rig || !pdTowerInside) return;
  // 楼内剖面正立显示；拖视角只换 SVG 等距侧面，不再整屏 rotateX 倾斜
  const rad = pdCamera.yaw * Math.PI / 180;
  const panX = Math.sin(rad) * 10;
  const panY = -Math.cos(rad) * 5;
  rig.style.transform = `translate(${panX}px, ${panY}px)`;
  updatePdTowerInteriorYaw();
  updatePdTowerInteriorBuddyPos();
  updatePdViewArrow();
}

function updatePdTowerInteriorBuddyPos() {
  const layer = document.getElementById('pd-buddy-layer');
  const playfield = document.getElementById('paodou-playfield');
  if (!layer || !playfield || !pdTowerInside) return;
  const pr = playfield.getBoundingClientRect();
  if (pdTowerOnFloorRoom) {
    const room = document.getElementById('pd-tower-floor-room-stage');
    const rr = room?.getBoundingClientRect();
    if (rr && rr.width > 40) {
      layer.style.left = `${rr.left - pr.left + rr.width * 0.22}px`;
      layer.style.top = `${rr.top - pr.top + rr.height * 0.78}px`;
      layer.style.transform = 'translate(-50%, -46px)';
      layer.style.transformOrigin = '50% 100%';
      return;
    }
  }
  const viewport = document.getElementById('pd-tower-interior-viewport');
  if (!viewport) return;
  const vr = viewport.getBoundingClientRect();
  if (vr.width < 40 || vr.height < 40) return;
  const x = vr.left - pr.left + vr.width * 0.36;
  const y = vr.top - pr.top + vr.height * (0.18 + ((pdTowerFloor - 1) / (PD_TOWER_FLOORS - 1)) * 0.62);
  layer.style.left = `${x}px`;
  layer.style.top = `${y}px`;
  layer.style.transform = 'translate(-50%, -46px)';
  layer.style.transformOrigin = '50% 100%';
}

function updatePdTowerYaw() {
  const svg = document.querySelector('.pd-tower-svg');
  if (!svg) return;
  const last = parseFloat(svg.dataset.pdYaw || 'NaN');
  if (Number.isFinite(last) && Math.abs(last - pdCamera.yaw) < 0.45) return;
  paintPdTowerSvg(svg, pdCamera.yaw);
}

function createPdBubbleTower(scenery, cx, cy) {
  const tower = document.createElement('div');
  tower.className = 'pd-bubble-tower';
  tower.style.left = `${cx}px`;
  tower.style.top = `${cy}px`;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'pd-tower-svg');
  svg.setAttribute('viewBox', `0 0 ${PD_TOWER_SVG_W} ${PD_TOWER_SVG_H}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', '泡豆大楼');
  tower.appendChild(svg);

  const sign = document.createElement('div');
  sign.className = 'pd-tower-sign';
  sign.textContent = '🏙 泡豆大楼';
  tower.appendChild(sign);

  scenery.appendChild(tower);
  paintPdTowerSvg(svg, pdCamera.yaw);
}

function pdInTowerZone() {
  return Math.abs(pdBuddy.wx - PD_TOWER_X) < 420
    && pdBuddy.wy > PD_TOWER_ANCHOR_Y - 1820
    && pdBuddy.wy < PD_TOWER_Y + 240;
}

function pdNearTower() {
  const dDoor = Math.hypot(pdBuddy.wx - PD_TOWER_X, pdBuddy.wy - PD_TOWER_ENTER_Y);
  const dPlaza = Math.hypot(pdBuddy.wx - PD_TOWER_X, pdBuddy.wy - PD_TOWER_Y);
  return dDoor < PD_TOWER_PAD || dPlaza < PD_TOWER_PAD + 100 || pdInTowerZone();
}

function pdCanEnterTower() {
  if (pdTowerInside) return false;
  return Math.abs(pdBuddy.wx - PD_TOWER_X) < PD_TOWER_ENTER_WX
    && Math.abs(pdBuddy.wy - PD_TOWER_ENTER_Y) < PD_TOWER_ENTER_WY;
}

function pdCheckTowerEntry() {
  // 仅点徽章进楼，不自动开门
}

function pdEnterTowerFromBadge() {
  if (pdTowerInside) return;
  if (performance.now() < pdTowerExitUntil) return;
  if (!pdInTowerZone()) {
    showPdBuddySpeech('再靠近大楼一点～');
    return;
  }
  pdBuddy.wx = PD_TOWER_X;
  pdBuddy.wy = PD_TOWER_ENTER_Y;
  refreshPdBuddyDOM();
  openPdTowerLobby();
}

function updatePdBuddyTowerBadge() {
  const badge = document.getElementById('pd-buddy-tower-badge');
  if (!badge) return;
  const cooling = performance.now() < pdTowerExitUntil;
  const show = !pdTowerInside && !cooling && pdInTowerZone();
  badge.hidden = !show;
}

function buildPdBuddyFloorPicker() {
  const picker = document.getElementById('pd-buddy-floor-picker');
  if (!picker) return;
  const expected = PD_TOWER_OPEN_FLOORS.length;
  if (picker.dataset.bound) {
    const btns = picker.querySelectorAll('.pd-buddy-floor-btn');
    if (btns.length !== expected) {
      picker.innerHTML = '';
      delete picker.dataset.bound;
    } else {
      updatePdBuddyFloorPicker();
      return;
    }
  }
  picker.dataset.bound = '1';
  PD_TOWER_FLOOR_GROUPS.forEach((group, gi) => {
    if (gi > 0) {
      const sep = document.createElement('span');
      sep.className = 'pd-buddy-floor-sep';
      sep.setAttribute('aria-hidden', 'true');
      picker.appendChild(sep);
    }
    group.forEach(f => {
    const meta = PD_TOWER_FLOOR_META[f];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `pd-buddy-floor-btn${f === PD_TOWER_FLOORS ? ' pd-buddy-floor-btn-top' : ''}`;
    btn.dataset.floor = String(f);
    btn.textContent = String(f);
    btn.title = `${f} 层 ${meta?.name || ''}${f === PD_TOWER_FLOORS ? ' · 顶层' : ''}`;
    btn.setAttribute('aria-label', `${f} 层 ${meta?.name || '楼层'}`);
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      pdSelectTowerFloor(f);
    });
    picker.appendChild(btn);
    });
  });
  updatePdBuddyFloorPicker();
}

function updatePdBuddyFloorPicker() {
  const picker = document.getElementById('pd-buddy-floor-picker');
  if (!picker) return;
  picker.hidden = !pdTowerInside || pdTowerOnFloorRoom;
  picker.querySelectorAll('.pd-buddy-floor-btn').forEach(btn => {
    btn.classList.toggle('on', parseInt(btn.dataset.floor, 10) === pdTowerFloor);
  });
}

function updatePdTowerEnterBtn() {
  const btn = document.getElementById('pd-tower-enter-btn');
  if (btn) {
    btn.hidden = true;
    btn.setAttribute('aria-hidden', 'true');
  }
  updatePdBuddyTowerBadge();
  updatePdBuddyFloorPicker();
}

function openPdTowerLobby() {
  if (pdTowerInside) return;
  if (performance.now() < pdTowerExitUntil) return;
  pdTowerInside = true;
  pdTowerOnFloorRoom = false;
  pdTowerRoomEntering = false;
  pdClearFloorFloatBubbles();
  pdTowerGreeted = true;
  pdTowerFloor = 1;
  pdBuddy.wx = PD_TOWER_X;
  pdBuddy.wy = PD_TOWER_ENTER_Y;
  const interior = document.getElementById('pd-tower-interior');
  const playfield = document.getElementById('paodou-playfield');
  interior?.classList.add('open');
  interior?.setAttribute('aria-hidden', 'false');
  playfield?.classList.add('pd-inside-tower');
  buildPdTowerFloorMenu();
  buildPdBuddyFloorPicker();
  paintPdTowerInterior(true);
  updatePdTowerInteriorView();
  updatePdTowerEnterBtn();
  updatePdTowerFloorRoomView();
  refreshPdBuddyDOM();
  showPdTowerNpcSpeech(PD_TOWER_FLOOR_META[1].npcLines[0]);
  showPdBuddySpeech('选层后点左上角「进入本层」');
}

function closePdTowerLobby() {
  if (!pdTowerInside) return;
  pdCloseElevGame();
  pdTowerInside = false;
  pdTowerOnFloorRoom = false;
  pdTowerRoomEntering = false;
  pdClearFloorFloatBubbles();
  pdClearFloorHunt();
  pdTowerGreeted = false;
  pdTowerFloor = 1;
  pdTowerExitUntil = performance.now() + 2200;
  detachPdBuddyFromFloorRoom();
  const interior = document.getElementById('pd-tower-interior');
  const playfield = document.getElementById('paodou-playfield');
  interior?.classList.remove('open');
  interior?.setAttribute('aria-hidden', 'true');
  playfield?.classList.remove('pd-inside-tower');
  playfield?.classList.remove('pd-on-floor-room');
  pdBuddy.wx = PD_TOWER_X;
  pdBuddy.wy = PD_TOWER_Y + 140;
  updatePdTowerEnterBtn();
  updatePdTowerFloorRoomView();
  refreshPdBuddyDOM();
  updatePdCamera();
  showPdBuddySpeech('出大楼啦～');
}

function pdCheckTowerProximity() {
  if (pdTowerInside) return;
  updatePdTowerEnterBtn();
  pdCheckTowerEntry();
  if (pdNearTower()) {
    if (!pdTowerGreeted) {
      pdTowerGreeted = true;
      showPdBuddySpeech('到了！点 🏙 进大楼');
    }
  } else if (pdTowerGreeted) {
    pdTowerGreeted = false;
  }
}

function pdCollectMapWalk() {
  let mx = 0;
  let my = 0;
  if (pdWalkKeys.has('up')) my -= 1;
  if (pdWalkKeys.has('down')) my += 1;
  if (pdWalkKeys.has('left')) mx -= 1;
  if (pdWalkKeys.has('right')) mx += 1;
  return { mx, my };
}

function pdWalkVector() {
  if (pdTowerOnFloorRoom) return pdCollectMapWalk();

  const walk = pdCollectMapWalk();

  // 大楼广场：按 ↑ 一律往北（朝楼），避免转视角后顶在「空气墙」前
  if (!pdTowerInside && pdWalkKeys.has('up') && pdInTowerZone()) {
    return { mx: 0, my: -1 };
  }

  return walk;
}

function buildPaodouWorld() {
  const world = document.getElementById('pd-world');
  const scenery = document.getElementById('pd-world-scenery');
  if (!world || !scenery) return;

  world.style.width = `${PD_WORLD_W}px`;
  world.style.height = `${PD_WORLD_H}px`;
  scenery.innerHTML = '';

  const sky = document.createElement('div');
  sky.className = 'pd-sky';
  scenery.appendChild(sky);

  const mist = document.createElement('div');
  mist.className = 'pd-horizon-mist';
  scenery.appendChild(mist);

  const pathWrap = document.createElement('div');
  pathWrap.className = 'pd-isle-path pd-ground-layer';
  const segH = 260;
  const segCount = Math.ceil(PD_WORLD_H / segH) + 1;
  for (let i = 0; i < segCount; i++) {
    const y = i * segH;
    const nearT = 1 - Math.min(1, y / (PD_WORLD_H * 0.92));
    let width = 300 + nearT * 420;
    if (Math.abs(y - PD_TOWER_Y) < 420) width = Math.max(width, 1120);
    const height = segH - 18;
    const seg = document.createElement('div');
    seg.className = 'pd-path-seg';
    seg.style.top = `${y}px`;
    seg.style.left = `${PD_WORLD_W / 2 - width / 2}px`;
    seg.style.width = `${width}px`;
    seg.style.height = `${height}px`;
    pathWrap.appendChild(seg);
  }
  scenery.appendChild(pathWrap);

  const plazaSeg = document.createElement('div');
  plazaSeg.className = 'pd-path-seg pd-tower-pad';
  plazaSeg.style.top = `${PD_TOWER_Y - 150}px`;
  plazaSeg.style.left = `${PD_WORLD_W / 2 - 540}px`;
  plazaSeg.style.width = '1080px';
  plazaSeg.style.height = '440px';
  pathWrap.appendChild(plazaSeg);

  const entrance = document.createElement('div');
  entrance.className = 'pd-tower-entrance';
  entrance.style.left = `${PD_TOWER_X}px`;
  entrance.style.top = `${PD_TOWER_ENTER_Y}px`;
  entrance.innerHTML = '<span class="pd-tower-entrance-label">入口</span>';
  scenery.appendChild(entrance);

  createPdBubbleTower(scenery, PD_TOWER_X, PD_TOWER_ANCHOR_Y);

  const decorLayer = document.createElement('div');
  decorLayer.id = 'pd-decor-layer';
  decorLayer.className = 'pd-decor-layer';

  for (let i = 0; i < 14; i++) {
    const side = document.createElement('div');
    side.className = 'pd-side-isle';
    const w = 160 + Math.random() * 120;
    const h = 70 + Math.random() * 50;
    const y = 420 + i * ((PD_WORLD_H - 820) / 13);
    const leftSide = i % 2 === 0;
    side.style.width = `${w}px`;
    side.style.height = `${h}px`;
    side.style.top = `${y}px`;
    side.style.left = leftSide
      ? `${PD_WORLD_W / 2 - 420 - w * 0.4}px`
      : `${PD_WORLD_W / 2 + 420 - w * 0.6}px`;
    side.dataset.pdParallax = String(0.45 + (i % 4) * 0.12);
    decorLayer.appendChild(side);
  }

  const glowA = document.createElement('div');
  glowA.className = 'pd-glow pd-glow-a';
  glowA.style.left = `${PD_WORLD_W * 0.12}px`;
  glowA.style.top = `${PD_WORLD_H * 0.08}px`;
  decorLayer.appendChild(glowA);

  const glowB = document.createElement('div');
  glowB.className = 'pd-glow pd-glow-b';
  glowB.style.right = `${PD_WORLD_W * 0.1}px`;
  glowB.style.top = `${PD_WORLD_H * 0.14}px`;
  decorLayer.appendChild(glowB);

  for (let i = 0; i < 28; i++) {
    const f = document.createElement('div');
    f.className = 'pd-float';
    const size = 14 + Math.random() * 24;
    f.style.width = `${size}px`;
    f.style.height = `${size}px`;
    f.style.left = `${120 + Math.random() * (PD_WORLD_W - 240)}px`;
    f.style.top = `${180 + Math.random() * (PD_WORLD_H - 360)}px`;
    f.style.animationDelay = `${-Math.random() * 4}s`;
    f.dataset.pdParallax = String(0.28 + (i % 5) * 0.1);
    decorLayer.appendChild(f);
  }

  scenery.appendChild(decorLayer);
}

function loadPdBuddy() {
  try {
    const raw = localStorage.getItem(PD_BUDDY_STORAGE);
    if (raw) {
      const d = JSON.parse(raw);
      if (typeof d.wx === 'number') pdBuddy.wx = d.wx;
      if (typeof d.wy === 'number') pdBuddy.wy = d.wy;
      if (typeof d.yaw === 'number') pdCamera.yaw = d.yaw;
      else if (typeof d.x === 'number' && typeof d.y === 'number') {
        pdBuddy.wx = d.x * PD_WORLD_W;
        pdBuddy.wy = d.y * PD_WORLD_H;
      }
    }
  } catch (e) {}
}

function savePdBuddy() {
  try {
    localStorage.setItem(PD_BUDDY_STORAGE, JSON.stringify({
      wx: pdBuddy.wx,
      wy: pdBuddy.wy,
      yaw: pdCamera.yaw,
    }));
  } catch (e) {}
}

function clampPdBuddyPos() {
  pdBuddy.wx = Math.max(PD_WALK_PAD, Math.min(PD_WORLD_W - PD_WALK_PAD, pdBuddy.wx));
  pdBuddy.wy = Math.max(PD_WALK_PAD, Math.min(PD_WORLD_H - PD_WALK_PAD, pdBuddy.wy));
}

function getPdScreenAnchor() {
  const playfield = document.getElementById('paodou-playfield');
  const sw = playfield?.clientWidth || window.innerWidth;
  const sh = playfield?.clientHeight || window.innerHeight;
  return { cx: sw * PD_SCREEN_ANCHOR_X, cy: sh * PD_SCREEN_ANCHOR_Y };
}

function updatePdParallax() {
  const rad = pdCamera.yaw * Math.PI / 180;
  const lookX = Math.sin(rad);
  const lookY = -Math.cos(rad);
  document.querySelectorAll('[data-pd-parallax]').forEach(el => {
    const k = parseFloat(el.dataset.pdParallax) || 0.4;
    el.style.transform = `translate(${lookX * 62 * k}px, ${lookY * 34 * k}px)`;
  });
}

function updatePdTowerGuide() {
  const guide = document.getElementById('pd-tower-guide');
  if (!guide) return;
  if (pdNearTower()) {
    guide.classList.remove('show');
    return;
  }
  const dx = PD_TOWER_X - pdBuddy.wx;
  const dyTarget = pdBuddy.wy > PD_TOWER_ENTER_Y + 40 ? PD_TOWER_Y : PD_TOWER_ENTER_Y;
  const dy = dyTarget - pdBuddy.wy;
  const dist = Math.hypot(dx, dy);
  if (dist < 40) {
    guide.classList.remove('show');
    return;
  }
  const rad = pdCamera.yaw * Math.PI / 180;
  const screenDx = dx * Math.cos(rad) + dy * Math.sin(rad);
  const screenDy = -dx * Math.sin(rad) + dy * Math.cos(rad);
  const angle = Math.atan2(screenDy, screenDx) * 180 / Math.PI;
  const { cx, cy } = getPdScreenAnchor();
  const field = document.getElementById('paodou-playfield');
  const fr = field?.getBoundingClientRect();
  const r = Math.min(fr?.width || 800, fr?.height || 600) * 0.34;
  guide.textContent = '🏙 泡豆大楼';
  guide.style.left = `${cx + Math.cos((angle - 90) * Math.PI / 180) * r}px`;
  guide.style.top = `${cy + Math.sin((angle - 90) * Math.PI / 180) * r}px`;
  guide.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
  guide.classList.add('show');
}

function updatePdViewArrow() {
  const { cx, cy } = getPdScreenAnchor();
  const arrow = document.getElementById('pd-view-arrow');
  if (arrow) {
    arrow.style.left = `${cx}px`;
    arrow.style.top = `${cy}px`;
    arrow.style.transform = `translate(-50%, -50%) rotate(${pdCamera.yaw}deg)`;
  }
}

function updatePdCamera() {
  if (pdTowerInside) {
    updatePdTowerInteriorView();
    updatePdBuddyFloorPicker();
    return;
  }
  const world = document.getElementById('pd-world');
  if (!world) return;
  const { cx, cy } = getPdScreenAnchor();
  const rad = pdCamera.yaw * Math.PI / 180;
  // 平移环视：场景平移不 rotateY，主岛/大楼不转大风车
  const panX = Math.sin(rad) * PD_VIEW_PAN_X;
  const panY = -Math.cos(rad) * PD_VIEW_PAN_Y;
  world.style.transform = `
    translate3d(${cx + panX}px, ${cy + panY}px, 0)
    rotateX(${PD_CAM_PITCH}deg)
    translate3d(0, 0, ${PD_CAM_DOLLY}px)
    translate3d(${-pdBuddy.wx}px, ${-pdBuddy.wy}px, 0)
  `;
  updatePdParallax();
  updatePdViewArrow();
  updatePdTowerGuide();
  updatePdTowerEnterBtn();
  updatePdTowerYaw();
  const layer = document.getElementById('pd-buddy-layer');
  if (layer) {
    const mag = getPdBuddyScreenScale();
    layer.style.left = `${cx}px`;
    layer.style.top = `${cy}px`;
    // 镜头近、泡豆略小，避免占满屏幕
    layer.style.transform = `translate(-50%, ${PD_BUDDY_LAYER_OFFSET_Y}px) scale(${mag})`;
    layer.style.transformOrigin = '50% 100%';
  }
}

function refreshPdBuddyDOM() {
  const el = document.getElementById('pd-buddy');
  if (!el) return;
  el.classList.toggle('walking', pdBuddy.walking);
  const sx = pdBuddy.facing < 0 ? -1 : 1;
  el.style.transform = `scaleX(${sx})`;
  updatePdCamera();
}

function pdUpdateFacingFromMove(mx, my) {
  const rad = pdCamera.yaw * Math.PI / 180;
  const camRightX = Math.cos(rad);
  const camRightY = Math.sin(rad);
  const screenSide = mx * camRightX + my * camRightY;
  if (Math.abs(screenSide) > 0.08) pdBuddy.facing = screenSide < 0 ? -1 : 1;
}

function showPdBuddySpeech(text) {
  const el = document.querySelector('#pd-buddy .pd-buddy-speech');
  if (!el) return;
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(showPdBuddySpeech._t);
  showPdBuddySpeech._t = setTimeout(() => el.classList.remove('show'), 2000);
}

function pdBuddyTick() {
  if (!document.getElementById('paodou-overlay')?.classList.contains('open')) {
    pdBuddyRaf = null;
    return;
  }
  if (pdTowerInside) {
    if (pdTowerOnFloorRoom) {
      pdTickFloorRoomBuddy(performance.now());
      pdBuddyRaf = requestAnimationFrame(pdBuddyTick);
      return;
    }
    if (!pdViewDrag.active && Math.abs(pdCamera.yawVel) > 0.015) {
      pdCamera.yaw += pdCamera.yawVel;
      pdCamera.yawVel *= 0.9;
    }
    updatePdTowerInteriorView();
    pdBuddyRaf = requestAnimationFrame(pdBuddyTick);
    return;
  }
  let dx = 0;
  let dy = 0;
  const walk = pdWalkVector();
  dx = walk.mx;
  dy = walk.my;

  const len = Math.hypot(dx, dy);
  if (len > 0) {
    const sp = 3.2;
    pdBuddy.wx += (dx / len) * sp;
    pdBuddy.wy += (dy / len) * sp;
    pdUpdateFacingFromMove(dx, dy);
    pdBuddy.walking = true;
    clampPdBuddyPos();
    refreshPdBuddyDOM();
  } else {
    if (pdBuddy.walking) {
      pdBuddy.walking = false;
      refreshPdBuddyDOM();
    }
  }

  pdCheckTowerProximity();

  if (!pdViewDrag.active && Math.abs(pdCamera.yawVel) > 0.015) {
    pdCamera.yaw += pdCamera.yawVel;
    pdCamera.yawVel *= 0.9;
    updatePdCamera();
  } else if (!pdBuddy.walking && !pdViewDrag.active) {
    updatePdCamera();
  }

  pdBuddyRaf = requestAnimationFrame(pdBuddyTick);
}

function startPdBuddyLoop() {
  buildPaodouWorld();
  loadPdBuddy();
  buildPdBuddyFloorPicker();
  clampPdBuddyPos();
  pdTowerGreeted = false;
  pdTowerInside = false;
  pdTowerOnFloorRoom = false;
  pdTowerRoomEntering = false;
  pdClearFloorFloatBubbles();
  pdTowerFloor = 1;
  pdTowerExitUntil = 0;
  detachPdBuddyFromFloorRoom();
  document.getElementById('pd-tower-interior')?.classList.remove('open');
  document.getElementById('pd-tower-interior')?.setAttribute('aria-hidden', 'true');
  document.getElementById('paodou-playfield')?.classList.remove('pd-inside-tower');
  document.getElementById('paodou-playfield')?.classList.remove('pd-on-floor-room');
  refreshPdBuddyDOM();
  updatePdTowerEnterBtn();
  if (!pdBuddyRaf) pdBuddyRaf = requestAnimationFrame(pdBuddyTick);
  showPdBuddySpeech('广场点 🏙 进大楼 · 选层后点左上角进入本层');
}

function releasePdViewDrag() {
  const field = document.getElementById('paodou-playfield');
  const pid = pdViewDrag.pointerId;
  pdViewDrag.active = false;
  pdViewDrag.pointerId = null;
  pdCamera.yawVel = 0;
  field?.classList.remove('pd-dragging');
  if (field?.releasePointerCapture && pid != null) {
    try { field.releasePointerCapture(pid); } catch (_) {}
  }
}

function stopPdBuddyLoop() {
  if (pdBuddyRaf) {
    cancelAnimationFrame(pdBuddyRaf);
    pdBuddyRaf = null;
  }
  pdBuddy.walking = false;
  pdTowerInside = false;
  pdTowerOnFloorRoom = false;
  pdTowerRoomEntering = false;
  pdClearFloorFloatBubbles();
  pdTowerFloor = 1;
  detachPdBuddyFromFloorRoom();
  document.getElementById('pd-tower-interior')?.classList.remove('open');
  document.getElementById('pd-tower-interior')?.setAttribute('aria-hidden', 'true');
  document.getElementById('paodou-playfield')?.classList.remove('pd-inside-tower');
  document.getElementById('paodou-playfield')?.classList.remove('pd-on-floor-room');
  pdReleaseWalkKeys();
  releasePdViewDrag();
  savePdBuddy();
  refreshPdBuddyDOM();
}

function openPaodouScene() {
  document.getElementById('paodou-overlay').classList.add('open');
  startPdBuddyLoop();
}

function closePaodouScene() {
  document.getElementById('paodou-overlay').classList.remove('open');
  stopPdBuddyLoop();
}

function pdReleaseWalkKeys() {
  pdWalkKeys.clear();
  document.querySelectorAll('.pd-walk-btn.pressed').forEach(b => b.classList.remove('pressed'));
}

function bindPdBuddyControls() {
  if (pdBuddyControlsBound) return;
  pdBuddyControlsBound = true;

  const keyMap = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right',
    W: 'up', S: 'down', A: 'left', D: 'right',
  };

  window.addEventListener('keydown', e => {
    if (!document.getElementById('paodou-overlay')?.classList.contains('open')) return;
    const dir = keyMap[e.key];
    if (!dir) return;
    e.preventDefault();
    pdWalkKeys.add(dir);
  });
  window.addEventListener('keyup', e => {
    const dir = keyMap[e.key];
    if (dir) pdWalkKeys.delete(dir);
  });

  document.querySelectorAll('.pd-walk-btn[data-pd-walk]').forEach(btn => {
    const dir = btn.getAttribute('data-pd-walk');
    if (!dir) return;
    const pressOn = e => {
      e.preventDefault();
      e.stopPropagation();
      pdWalkKeys.add(dir);
      btn.classList.add('pressed');
      if (btn.setPointerCapture) btn.setPointerCapture(e.pointerId);
    };
    const pressOff = e => {
      pdWalkKeys.delete(dir);
      btn.classList.remove('pressed');
      if (btn.releasePointerCapture && e?.pointerId != null) {
        try { btn.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    };
    btn.addEventListener('pointerdown', pressOn);
    btn.addEventListener('pointerup', pressOff);
    btn.addEventListener('pointercancel', pressOff);
    btn.addEventListener('lostpointercapture', pressOff);
  });

  document.getElementById('pd-buddy')?.addEventListener('click', e => {
    e.stopPropagation();
    if (e.target.closest('#pd-buddy-tower-badge')) return;
    if (pdTowerInside) return;
    showPdBuddySpeech(PD_BUDDY_LINES[Math.floor(Math.random() * PD_BUDDY_LINES.length)]);
  });

  const buddyTowerBadge = document.getElementById('pd-buddy-tower-badge');
  if (buddyTowerBadge && !buddyTowerBadge.dataset.bound) {
    buddyTowerBadge.dataset.bound = '1';
    const onBuddyEnter = e => {
      e.preventDefault();
      e.stopPropagation();
      pdEnterTowerFromBadge();
    };
    buddyTowerBadge.addEventListener('click', onBuddyEnter);
    buddyTowerBadge.addEventListener('pointerdown', e => {
      e.stopPropagation();
    });
  }

  const exitBtn = document.getElementById('pd-tower-lobby-exit');
  if (exitBtn && !exitBtn.dataset.bound) {
    exitBtn.dataset.bound = '1';
    exitBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      closePdTowerLobby();
    });
    exitBtn.addEventListener('pointerdown', e => {
      e.stopPropagation();
    });
  }
  const npcBtn = document.getElementById('pd-tower-npc');
  if (npcBtn && !npcBtn.dataset.bound) {
    npcBtn.dataset.bound = '1';
    npcBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const lines = PD_TOWER_FLOOR_META[pdTowerFloor]?.npcLines || PD_TOWER_LINES;
      showPdTowerNpcSpeech(lines[Math.floor(Math.random() * lines.length)]);
    });
    npcBtn.addEventListener('pointerdown', e => {
      e.stopPropagation();
    });
  }
  const enterFloorBtn = document.getElementById('pd-tower-enter-floor-btn');
  if (enterFloorBtn && !enterFloorBtn.dataset.bound) {
    enterFloorBtn.dataset.bound = '1';
    enterFloorBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      pdToggleTowerFloorRoom();
    });
    enterFloorBtn.addEventListener('pointerdown', e => e.stopPropagation());
  }
  const floorRoom = document.getElementById('pd-tower-floor-room');
  if (floorRoom && !floorRoom.dataset.bound) {
    floorRoom.dataset.bound = '1';
    floorRoom.addEventListener('click', e => {
      if (!pdTowerOnFloorRoom) return;
      const hunt = e.target.closest('.pd-floor-hunt-bean');
      if (hunt) {
        e.preventDefault();
        e.stopPropagation();
        pdTapFloorHuntBean(hunt);
        return;
      }
      const spot = e.target.closest('.pd-floor-room-spot');
      if (spot) {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(spot.dataset.spotIdx, 10);
        const meta = PD_TOWER_FLOOR_META[pdTowerFloor];
        const s = meta?.roomSpots?.[idx];
        pdReleaseFloorRoomBeans(spot, s);
        spot.classList.add('tapped');
        setTimeout(() => spot.classList.remove('tapped'), 180);
        return;
      }
      const npc = e.target.closest('.pd-floor-room-npc');
      if (!npc) return;
      e.preventDefault();
      e.stopPropagation();
      const lines = PD_TOWER_FLOOR_META[pdTowerFloor]?.npcLines || PD_TOWER_LINES;
      showPdFloorRoomNpcSpeech(lines[Math.floor(Math.random() * lines.length)]);
    });
    floorRoom.addEventListener('pointerdown', e => {
      if (e.target.closest('.pd-floor-room-spot, .pd-floor-room-npc, .pd-floor-hunt-bean')) e.stopPropagation();
    });
  }
  const elevGameBtn = document.getElementById('pd-elev-game-btn');
  if (elevGameBtn && !elevGameBtn.dataset.bound) {
    elevGameBtn.dataset.bound = '1';
    elevGameBtn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      pdOpenElevGame();
    });
  }
  const elevStop = document.getElementById('pd-elev-game-stop');
  if (elevStop && !elevStop.dataset.bound) {
    elevStop.dataset.bound = '1';
    elevStop.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      pdElevGameStopTap();
    });
  }
  const elevClose = document.getElementById('pd-elev-game-close');
  if (elevClose && !elevClose.dataset.bound) {
    elevClose.dataset.bound = '1';
    elevClose.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      pdCloseElevGame();
    });
  }
  const elevRetry = document.getElementById('pd-elev-game-retry');
  if (elevRetry && !elevRetry.dataset.bound) {
    elevRetry.dataset.bound = '1';
    elevRetry.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      pdStartElevGameRound();
    });
  }
  ['pd-elev-game', 'pd-elev-game-stop', 'pd-elev-game-close', 'pd-elev-game-retry', 'pd-elev-game-btn'].forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener('pointerdown', e => e.stopPropagation());
  });
  const enterBtn = document.getElementById('pd-tower-enter-btn');
  if (enterBtn) {
    enterBtn.hidden = true;
    enterBtn.setAttribute('aria-hidden', 'true');
  }

  window.addEventListener('resize', () => {
    if (document.getElementById('paodou-overlay')?.classList.contains('open')) {
      refreshPdBuddyDOM();
      if (pdTowerInside) {
        if (pdTowerOnFloorRoom) updatePdFloorRoomBuddyPos(true);
        else updatePdTowerInteriorBuddyPos();
      }
    }
  });

  bindPdViewDrag();
}

function bindPdViewDrag() {
  const field = document.getElementById('paodou-playfield');
  if (!field || field.dataset.pdViewBound) return;
  field.dataset.pdViewBound = '1';

  const onDown = e => {
    if (!document.getElementById('paodou-overlay')?.classList.contains('open')) return;
    if (pdTowerOnFloorRoom) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (e.target.closest('#pd-walkpad, #pd-buddy, #pd-buddy-tower-badge, #pd-buddy-floor-picker, #pd-tower-enter-floor-btn, #pd-tower-floor-room, #pd-tower-enter-btn, #pd-tower-elevator, #pd-tower-npc, #pd-tower-interior-hud, #pd-elev-game, #pd-elev-game-btn, button, a')) return;
    e.preventDefault();
    pdViewDrag.active = true;
    pdViewDrag.lastX = e.clientX;
    pdViewDrag.pointerId = e.pointerId;
    pdCamera.yawVel = 0;
    field.classList.add('pd-dragging');
    if (field.setPointerCapture) field.setPointerCapture(e.pointerId);
  };

  const onMove = e => {
    if (!document.getElementById('paodou-overlay')?.classList.contains('open')) return;
    if (!pdViewDrag.active || e.pointerId !== pdViewDrag.pointerId) return;
    e.preventDefault();
    const dx = e.clientX - pdViewDrag.lastX;
    pdViewDrag.lastX = e.clientX;
    pdCamera.yaw += dx * 0.65;
    pdCamera.yawVel = dx * 0.14;
    updatePdCamera();
  };

  const endDrag = e => {
    if (!pdViewDrag.active) return;
    if (e && pdViewDrag.pointerId != null && e.pointerId !== pdViewDrag.pointerId) return;
    releasePdViewDrag();
  };

  field.addEventListener('pointerdown', onDown);
  field.addEventListener('pointermove', onMove);
  field.addEventListener('pointerup', endDrag);
  field.addEventListener('pointercancel', endDrag);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('blur', () => {
    releasePdViewDrag();
    pdReleaseWalkKeys();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) releasePdViewDrag();
  });
}

function bindBalanceControls() {
  const left = document.getElementById('balance-left');
  const right = document.getElementById('balance-right');
  const stage = document.getElementById('balance-stage');
  if (!left || left.dataset.bound) return;
  left.dataset.bound = '1';
  const onL = () => { balanceScene.holdL = true; };
  const offL = () => { balanceScene.holdL = false; };
  const onR = () => { balanceScene.holdR = true; };
  const offR = () => { balanceScene.holdR = false; };
  left.addEventListener('mousedown', onL);
  left.addEventListener('mouseup', offL);
  left.addEventListener('mouseleave', offL);
  left.addEventListener('touchstart', onL, { passive: true });
  left.addEventListener('touchend', offL);
  right.addEventListener('mousedown', onR);
  right.addEventListener('mouseup', offR);
  right.addEventListener('mouseleave', offR);
  right.addEventListener('touchstart', onR, { passive: true });
  right.addEventListener('touchend', offR);
  if (stage) {
    stage.addEventListener('click', e => {
      if (e.target.closest('#balance-refresh')) return;
      const r = stage.getBoundingClientRect();
      if (e.clientX < r.left + r.width / 2) { balanceScene.holdL = true; setTimeout(() => { balanceScene.holdL = false; }, 120); }
      else { balanceScene.holdR = true; setTimeout(() => { balanceScene.holdR = false; }, 120); }
    });
  }
}

// ── Bigpick 泡猜大 ────────────────────────────────────────────────
const bigpickScene = { open: false, score: 0, best: 0, bigSide: 'l' };

function updateBigpickStatus(msg) {
  const el = document.getElementById('bigpick-status');
  if (el) el.textContent = msg || `连对：${bigpickScene.score}` + (bigpickScene.best ? ` · 最高 ${bigpickScene.best}` : '');
}

function newBigpickRound() {
  const stage = document.getElementById('bigpick-stage');
  if (!stage) return;
  stage.innerHTML = '';
  const s1 = 48 + Math.random() * 36;
  const s2 = 48 + Math.random() * 36;
  const leftBig = s1 >= s2;
  bigpickScene.bigSide = leftBig ? 'l' : 'r';
  const szL = leftBig ? Math.max(s1, s2) : Math.min(s1, s2);
  const szR = leftBig ? Math.min(s1, s2) : Math.max(s1, s2);
  ['l', 'r'].forEach(side => {
    const sz = side === 'l' ? szL : szR;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bigpick-choice';
    btn.style.width = sz + 'px';
    btn.style.height = sz + 'px';
    btn.addEventListener('click', () => {
      if (!bigpickScene.open) return;
      if (side === bigpickScene.bigSide) {
        bigpickScene.score += 1;
        bigpickScene.best = Math.max(bigpickScene.best, bigpickScene.score);
        try { playPop(false); } catch (_) {}
        updateBigpickStatus('对了！');
        setTimeout(newBigpickRound, 400);
      } else {
        const s = bigpickScene.score;
        bigpickScene.score = 0;
        updateBigpickStatus(`选小了！刚才连对 ${s} · 再来`);
        setTimeout(newBigpickRound, 700);
      }
    });
    stage.appendChild(btn);
  });
}

function resetBigpickScene() {
  bigpickScene.score = 0;
  newBigpickRound();
  updateBigpickStatus();
}
function openBigpickScene() {
  document.getElementById('bigpick-overlay').classList.add('open');
  bigpickScene.open = true;
  resetBigpickScene();
}
function closeBigpickScene() {
  document.getElementById('bigpick-overlay').classList.remove('open');
  bigpickScene.open = false;
}

// ── Oddone 泡找不同 ───────────────────────────────────────────────
const ODD_PALETTES = [
  { base: '#f8bbd0', odd: '#f3a0b8' },
  { base: '#b3e5fc', odd: '#90caf9' },
  { base: '#fff9c4', odd: '#ffe082' },
  { base: '#c8e6c9', odd: '#a5d6a7' },
  { base: '#e1bee7', odd: '#ce93d8' },
];

function blendOddHex(hex, toward, t) {
  const parse = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const a = parse(hex);
  const b = parse(toward);
  const mix = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return '#' + mix.map(v => v.toString(16).padStart(2, '0')).join('');
}

const oddoneScene = { open: false, score: 0, oddR: 0, oddC: 0, n: 4 };

function updateOddoneStatus(msg) {
  const el = document.getElementById('oddone-status');
  if (el) el.textContent = msg || `找到：${oddoneScene.score}`;
}

function buildOddoneBoard() {
  const board = document.getElementById('oddone-board');
  if (!board) return;
  board.innerHTML = '';
  board.style.gridTemplateColumns = `repeat(${oddoneScene.n}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${oddoneScene.n}, 1fr)`;
  const palette = ODD_PALETTES[Math.floor(Math.random() * ODD_PALETTES.length)];
  const subtle = Math.min(0.55, 0.28 + oddoneScene.score * 0.03);
  const base = palette.base;
  const oddColor = blendOddHex(palette.base, palette.odd, subtle);
  oddoneScene.oddR = Math.floor(Math.random() * oddoneScene.n);
  oddoneScene.oddC = Math.floor(Math.random() * oddoneScene.n);
  for (let r = 0; r < oddoneScene.n; r++) {
    for (let c = 0; c < oddoneScene.n; c++) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'oddone-cell';
      const isOdd = r === oddoneScene.oddR && c === oddoneScene.oddC;
      el.style.setProperty('--oc', isOdd ? oddColor : base);
      el.addEventListener('click', () => {
        if (!oddoneScene.open) return;
        if (isOdd) {
          el.classList.add('found');
          oddoneScene.score += 1;
          if (oddoneScene.score % 3 === 0 && oddoneScene.n < 5) oddoneScene.n += 1;
          try { playPop(false); } catch (_) {}
          updateOddoneStatus('找到了！');
          setTimeout(buildOddoneBoard, 500);
        } else {
          updateOddoneStatus('不是这个…再找找');
        }
      });
      board.appendChild(el);
    }
  }
  updateOddoneStatus();
}

function resetOddoneScene() {
  oddoneScene.score = 0;
  oddoneScene.n = 4;
  buildOddoneBoard();
}
function openOddoneScene() {
  document.getElementById('oddone-overlay').classList.add('open');
  oddoneScene.open = true;
  resetOddoneScene();
}
function closeOddoneScene() {
  document.getElementById('oddone-overlay').classList.remove('open');
  oddoneScene.open = false;
}

// ── Countpop 泡数数 ───────────────────────────────────────────────
const countpopScene = { open: false, score: 0, answer: 0, phase: 'show', timer: 0, raf: 0 };

function updateCountpopStatus(msg) {
  const el = document.getElementById('countpop-status');
  if (el) el.textContent = msg || `得分：${countpopScene.score}`;
}

function buildCountpopPick() {
  const pick = document.getElementById('countpop-pick');
  if (!pick) return;
  pick.innerHTML = '';
  const opts = new Set([countpopScene.answer]);
  while (opts.size < 5) opts.add(3 + Math.floor(Math.random() * 6));
  [...opts].sort((a, b) => a - b).forEach(n => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = String(n);
    b.addEventListener('click', () => {
      if (countpopScene.phase !== 'pick') return;
      if (n === countpopScene.answer) {
        countpopScene.score += 1;
        try { playPop(false); } catch (_) {}
        updateCountpopStatus('对了！');
        setTimeout(startCountpopRound, 600);
      } else {
        updateCountpopStatus(`错了，是 ${countpopScene.answer} 个 · 再来`);
        setTimeout(startCountpopRound, 900);
      }
    });
    pick.appendChild(b);
  });
}

function startCountpopRound() {
  const stage = document.getElementById('countpop-stage');
  if (!stage || !countpopScene.open) return;
  stage.innerHTML = '';
  countpopScene.phase = 'show';
  countpopScene.answer = 3 + Math.floor(Math.random() * 5);
  countpopScene.timer = 0;
  updateCountpopStatus('记住数量…');
  const pick = document.getElementById('countpop-pick');
  if (pick) pick.innerHTML = '';
  for (let i = 0; i < countpopScene.answer; i++) {
    const el = document.createElement('div');
    el.className = 'countpop-dot';
    const sz = 22 + Math.random() * 16;
    el.style.width = sz + 'px';
    el.style.height = sz + 'px';
    el.style.left = (10 + Math.random() * 80) + '%';
    el.style.top = (10 + Math.random() * 75) + '%';
    stage.appendChild(el);
  }
}

function tickCountpopScene() {
  if (!countpopScene.open) { countpopScene.raf = 0; return; }
  if (countpopScene.phase === 'show') {
    countpopScene.timer += 1;
    if (countpopScene.timer >= 120) {
      const stage = document.getElementById('countpop-stage');
      if (stage) stage.innerHTML = '';
      countpopScene.phase = 'pick';
      buildCountpopPick();
      updateCountpopStatus('有几个？');
    }
  }
  countpopScene.raf = requestAnimationFrame(tickCountpopScene);
}

function resetCountpopScene() {
  countpopScene.score = 0;
  startCountpopRound();
  updateCountpopStatus();
}
function openCountpopScene() {
  document.getElementById('countpop-overlay').classList.add('open');
  countpopScene.open = true;
  resetCountpopScene();
  if (!countpopScene.raf) countpopScene.raf = requestAnimationFrame(tickCountpopScene);
}
function closeCountpopScene() {
  document.getElementById('countpop-overlay').classList.remove('open');
  countpopScene.open = false;
}

// ── Inflate 吹爆泡 ────────────────────────────────────────────────
const inflateScene = { open: false, score: 0, level: 0, holding: false, meter: 0, raf: 0 };

function updateInflateStatus(msg) {
  const el = document.getElementById('inflate-status');
  if (el) el.textContent = msg || `吹好：${inflateScene.score} 个`;
}

function paintInflate() {
  const b = document.getElementById('inflate-bubble');
  const fill = document.getElementById('inflate-meter-fill');
  const scale = 1 + inflateScene.meter / 100 * 1.6;
  if (b) {
    b.style.width = (56 * scale) + 'px';
    b.style.height = (56 * scale) + 'px';
  }
  if (fill) fill.style.width = inflateScene.meter + '%';
}

function tickInflateScene() {
  if (!inflateScene.open) { inflateScene.raf = 0; return; }
  if (inflateScene.holding) {
    inflateScene.meter += 0.55 + inflateScene.level * 0.04;
    if (inflateScene.meter >= 100) {
      inflateScene.holding = false;
      inflateScene.meter = 100;
      try { playPop(false); } catch (_) {}
      updateInflateStatus('吹爆了！松太早或太晚 · 再试');
      setTimeout(() => { inflateScene.meter = 0; paintInflate(); updateInflateStatus('按住「吹」'); }, 800);
    }
    paintInflate();
  }
  inflateScene.raf = requestAnimationFrame(tickInflateScene);
}

function releaseInflate() {
  if (!inflateScene.open || !inflateScene.holding) return;
  inflateScene.holding = false;
  const m = inflateScene.meter;
  if (m >= 52 && m <= 72) {
    inflateScene.score += 1;
    inflateScene.level += 1;
    try { playPassSuccessSound(); } catch (_) { try { playPop(true); } catch (_) {} }
    updateInflateStatus('刚刚好！');
    setTimeout(() => {
      inflateScene.meter = 0;
      paintInflate();
      updateInflateStatus('按住「吹」');
    }, 600);
  } else if (m < 52) {
    updateInflateStatus('太小了，再吹大一点');
    inflateScene.meter = 0;
    paintInflate();
  } else {
    updateInflateStatus('太大了，会爆！');
    inflateScene.meter = 0;
    paintInflate();
  }
}

function resetInflateScene() {
  inflateScene.score = 0;
  inflateScene.level = 0;
  inflateScene.holding = false;
  inflateScene.meter = 0;
  paintInflate();
  updateInflateStatus('按住「吹」· 绿区松手');
}

function openInflateScene() {
  document.getElementById('inflate-overlay').classList.add('open');
  inflateScene.open = true;
  resetInflateScene();
  if (!inflateScene.raf) inflateScene.raf = requestAnimationFrame(tickInflateScene);
}
function closeInflateScene() {
  document.getElementById('inflate-overlay').classList.remove('open');
  inflateScene.open = false;
  inflateScene.holding = false;
}

function bindInflateControls() {
  const btn = document.getElementById('inflate-btn');
  if (!btn || btn.dataset.bound) return;
  btn.dataset.bound = '1';
  const start = e => { e.preventDefault(); if (!inflateScene.open) return; inflateScene.holding = true; try { playPressStart(true); } catch (_) {} };
  const end = () => releaseInflate();
  btn.addEventListener('mousedown', start);
  btn.addEventListener('touchstart', start, { passive: false });
  window.addEventListener('mouseup', end);
  window.addEventListener('touchend', end);
}

// ── Fishing mini scene ─────────────────────────────────────────────
const FISHING_BASKET_MAX = 4;
const FISHING_HOOK_PRICE = 50;
const FISHING_BAIT_PRICE = 60;
const FISHING_SPEED_PRICE = 10;
const FISHING_SPEED_USES = 3;
const FISHING_HOOK_MAX_EQUIP = 3;
const FISHING_RARITIES = [
  { id: 'common',    name: '普通', label: '灰鱼', weight: 60, baitWeight: 0,  fill: '#9e9e9e', stroke: '#616161', opacity: 1, coinValue: 5 },
  { id: 'uncommon',  name: '少见', label: '粉鱼', weight: 20, baitWeight: 0,  fill: '#f48fb1', stroke: '#ec407a', opacity: 1, coinValue: 10 },
  { id: 'rare',      name: '稀有', label: '蓝鱼', weight: 15, baitWeight: 60, fill: '#42a5f5', stroke: '#1565c0', opacity: 1, coinValue: 20 },
  { id: 'legendary', name: '传说', label: '金鱼', weight: 5,  baitWeight: 40, fill: '#ffd54f', stroke: '#ff8f00', opacity: 0.82, coinValue: 40 },
];
const fishingScene = {
  ready: false,
  casting: false,
  animIds: [],
  shadows: [],
  recentBasket: [],
  caughtLog: [],
  fishCounts: { common: 0, uncommon: 0, rare: 0, legendary: 0 },
  fishingCoins: 0,
  hooksOwned: 1,
  hooksEquipped: 1,
  baitsOwned: 0,
  useBait: false,
  speedCharges: 0,
  useSpeed: false,
};

function fishSilhouetteSVG(fill = '#0a2744', stroke = 'none') {
  const sw = stroke === 'none' ? '0' : '1.2';
  return `<svg viewBox="0 0 48 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M34 4 L46 12 L34 20 Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
    <path d="M34 12
      C 34 5 26 2 18 2
      C 10 2 4 6 4 12
      C 4 18 10 22 18 22
      C 26 22 34 19 34 12 Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
    <circle cx="10" cy="11" r="1.4" fill="rgba(255,255,255,0.45)"/>
  </svg>`;
}

function backpackHooks() {
  return Math.max(0, fishingScene.hooksOwned - fishingScene.hooksEquipped);
}

function rollFishingRarity(useBait) {
  const key = useBait ? 'baitWeight' : 'weight';
  const pool = FISHING_RARITIES.filter(r => (r[key] || 0) > 0);
  const list = pool.length ? pool : FISHING_RARITIES.filter(r => r.weight > 0);
  const total = list.reduce((s, r) => s + (r[key] || r.weight), 0);
  let roll = Math.random() * total;
  for (const r of list) {
    roll -= (r[key] || r.weight);
    if (roll <= 0) return r;
  }
  return list[list.length - 1];
}

function refreshFishingCoinUI(opts = {}) {
  const el = document.getElementById('fishing-coin-amt');
  if (el) el.textContent = String(fishingScene.fishingCoins);
  try {
    localStorage.setItem(FISHING_COIN_STORAGE, String(fishingScene.fishingCoins | 0));
  } catch (e) {}
  syncMainCurrencyHUD(opts.pop ? { pop: 'fish' } : {});
}

function loadFishingCoins() {
  try {
    const raw = localStorage.getItem(FISHING_COIN_STORAGE);
    if (raw != null && raw !== '') {
      const n = parseInt(raw, 10);
      if (!Number.isNaN(n) && n >= 0) fishingScene.fishingCoins = n;
    }
  } catch (e) {}
}

function refreshFishingGearUI() {
  const shop = document.getElementById('fishing-gear-shop');
  const bait = document.getElementById('fishing-gear-bait');
  const speed = document.getElementById('fishing-gear-speed');
  const hooks = document.getElementById('fishing-gear-hooks');
  if (!shop || !bait || !hooks) return;
  const coins = fishingScene.fishingCoins;
  const bag = backpackHooks();

  shop.innerHTML = `
    <h4>商店</h4>
    <div class="fg-row">
      <span>🪝 鱼钩 · ${FISHING_HOOK_PRICE} 钓鱼币</span>
      <button type="button" class="fg-buy" id="fg-buy-hook" ${coins < FISHING_HOOK_PRICE ? 'disabled' : ''}>购买</button>
    </div>
    <div class="fg-row">
      <span>🪱 诱饵 · ${FISHING_BAIT_PRICE} 钓鱼币</span>
      <button type="button" class="fg-buy" id="fg-buy-bait" ${coins < FISHING_BAIT_PRICE ? 'disabled' : ''}>购买</button>
    </div>
    <div class="fg-row">
      <span>⚡ 速度加速 · ${FISHING_SPEED_PRICE} 钓鱼币</span>
      <button type="button" class="fg-buy" id="fg-buy-speed" ${coins < FISHING_SPEED_PRICE ? 'disabled' : ''}>购买</button>
    </div>
    <div class="fg-hint">钓鱼币：${coins}<br>买 <b>1 个</b>加速 = 接下来可加速 <b>${FISHING_SPEED_USES} 次</b>钓鱼</div>
  `;

  bait.innerHTML = `
    <h4>诱饵</h4>
    <label class="fg-toggle">
      <input type="checkbox" id="fg-use-bait" ${fishingScene.useBait ? 'checked' : ''} ${fishingScene.baitsOwned < 1 ? 'disabled' : ''}/>
      本次钓鱼使用诱饵
    </label>
    <div class="fg-hint">库存 ${fishingScene.baitsOwned} 个 · 默认不用<br>有诱饵：灰粉 0%，蓝 60%，金 40%</div>
  `;

  if (speed) {
    speed.innerHTML = `
      <h4>速度加速</h4>
      <label class="fg-toggle">
        <input type="checkbox" id="fg-use-speed" ${fishingScene.useSpeed ? 'checked' : ''} ${fishingScene.speedCharges < 1 ? 'disabled' : ''}/>
        使用加速（勾选后每次钓鱼都会加速，直到次数用完）
      </label>
      <div class="fg-hint">还可加速 <b>${fishingScene.speedCharges}</b> 次钓鱼 · 默认不勾选<br>商店买 1 个（${FISHING_SPEED_PRICE}币）就加 ${FISHING_SPEED_USES} 次</div>
    `;
  }

  let slots = '';
  for (let i = 0; i < FISHING_HOOK_MAX_EQUIP; i++) {
    slots += `<div class="fg-slot ${i < fishingScene.hooksEquipped ? '' : 'empty'}">${i < fishingScene.hooksEquipped ? '🪝' : ''}</div>`;
  }
  hooks.innerHTML = `
    <h4>鱼钩 · 背包</h4>
    <div class="fg-row"><span>已装备</span><div class="fg-slots">${slots}</div></div>
    <div class="fg-row"><span>背包里</span><strong>${bag} 个</strong></div>
    <div class="fg-row">
      <button type="button" class="fg-act" id="fg-equip-hook" ${bag < 1 || fishingScene.hooksEquipped >= FISHING_HOOK_MAX_EQUIP ? 'disabled' : ''}>装备 +1</button>
      <button type="button" class="fg-act secondary" id="fg-unequip-hook" ${fishingScene.hooksEquipped <= 1 ? 'disabled' : ''}>卸下到背包</button>
    </div>
    <div class="fg-hint">默认 1 钩；最多装 3 钩。<br>装备几个钩，一次同时钓几条鱼。</div>
  `;

  const buyHook = document.getElementById('fg-buy-hook');
  const buyBait = document.getElementById('fg-buy-bait');
  const buySpeed = document.getElementById('fg-buy-speed');
  const useBait = document.getElementById('fg-use-bait');
  const useSpeed = document.getElementById('fg-use-speed');
  const equip = document.getElementById('fg-equip-hook');
  const unequip = document.getElementById('fg-unequip-hook');
  if (buyHook) buyHook.onclick = () => buyFishingHook();
  if (buyBait) buyBait.onclick = () => buyFishingBait();
  if (buySpeed) buySpeed.onclick = () => buyFishingSpeed();
  if (useBait) useBait.onchange = () => {
    fishingScene.useBait = !!useBait.checked && fishingScene.baitsOwned > 0;
    if (useBait.checked && fishingScene.baitsOwned < 1) {
      useBait.checked = false;
      fishingScene.useBait = false;
      showToast('没有诱饵了', '#81c784');
    }
    refreshFishingGearUI();
  };
  if (useSpeed) useSpeed.onchange = () => {
    fishingScene.useSpeed = !!useSpeed.checked && fishingScene.speedCharges > 0;
    if (useSpeed.checked && fishingScene.speedCharges < 1) {
      useSpeed.checked = false;
      fishingScene.useSpeed = false;
      showToast('没有速度次数了', '#ffb74d');
    }
    refreshFishingGearUI();
  };
  if (equip) equip.onclick = () => {
    if (backpackHooks() < 1 || fishingScene.hooksEquipped >= FISHING_HOOK_MAX_EQUIP) return;
    fishingScene.hooksEquipped += 1;
    refreshFishingGearUI();
    showToast(`🪝 已装备 ${fishingScene.hooksEquipped} 个鱼钩`, '#66bb6a');
  };
  if (unequip) unequip.onclick = () => {
    if (fishingScene.hooksEquipped <= 1) return;
    fishingScene.hooksEquipped -= 1;
    refreshFishingGearUI();
    showToast(`🪝 卸下 1 个到背包（装备 ${fishingScene.hooksEquipped}）`, '#78909c');
  };
}

function buyFishingHook() {
  if (fishingScene.fishingCoins < FISHING_HOOK_PRICE) {
    showToast('钓鱼币不够', '#ef5350');
    return;
  }
  fishingScene.fishingCoins -= FISHING_HOOK_PRICE;
  fishingScene.hooksOwned += 1;
  if (fishingScene.hooksEquipped < FISHING_HOOK_MAX_EQUIP) {
    fishingScene.hooksEquipped += 1;
    showToast(`购买鱼钩成功！已装备 ${fishingScene.hooksEquipped} 个`, '#66bb6a');
  } else {
    showToast('购买鱼钩成功！已放入背包', '#66bb6a');
  }
  refreshFishingCoinUI();
  refreshFishingGearUI();
}

function buyFishingBait() {
  if (fishingScene.fishingCoins < FISHING_BAIT_PRICE) {
    showToast('钓鱼币不够', '#ef5350');
    return;
  }
  fishingScene.fishingCoins -= FISHING_BAIT_PRICE;
  fishingScene.baitsOwned += 1;
  refreshFishingCoinUI();
  refreshFishingGearUI();
  showToast('🪱 买到诱饵 ×1', '#8d6e63');
}

function buyFishingSpeed() {
  if (fishingScene.fishingCoins < FISHING_SPEED_PRICE) {
    showToast('钓鱼币不够', '#ef5350');
    return;
  }
  fishingScene.fishingCoins -= FISHING_SPEED_PRICE;
  fishingScene.speedCharges += FISHING_SPEED_USES;
  refreshFishingCoinUI();
  refreshFishingGearUI();
  showToast(`⚡ 买到 1 个加速：可加速 ${FISHING_SPEED_USES} 次钓鱼（现有 ${fishingScene.speedCharges} 次）`, '#ffb300');
}

function toggleFishingGear(force) {
  const panel = document.getElementById('fishing-gear');
  const btn = document.getElementById('fishing-gear-btn');
  if (!panel) return;
  const open = typeof force === 'boolean' ? force : !panel.classList.contains('open');
  if (open) toggleFishCatalog(false);
  panel.classList.toggle('open', open);
  if (btn) btn.classList.toggle('active', open);
  if (open) refreshFishingGearUI();
  syncFishingSideDismiss();
}

function isFishingSidePanelOpen() {
  return !!(
    document.getElementById('fishing-gear')?.classList.contains('open')
    || document.getElementById('fishing-catalog')?.classList.contains('open')
  );
}

function closeFishingSidePanels() {
  if (!isFishingSidePanelOpen()) return;
  toggleFishingGear(false);
  toggleFishCatalog(false);
}

function syncFishingSideDismiss() {
  const dismiss = document.getElementById('fishing-side-dismiss');
  if (!dismiss) return;
  dismiss.classList.toggle('show', isFishingSidePanelOpen());
}

function handleFishingOverlayClick(e) {
  if (!isFishingSidePanelOpen()) return;
  const t = e.target;
  if (t.closest('#fishing-gear')) return;
  if (t.closest('#fishing-catalog')) return;
  if (t.closest('#fishing-gear-btn')) return;
  if (t.closest('#fishing-catalog-btn')) return;
  if (t.closest('#fishing-coin-badge')) return;
  if (t.closest('#fishing-coin-modal')) return;
  if (t.closest('#fishing-close')) return;
  if (t.closest('#fishing-cast-btn')) return;
  closeFishingSidePanels();
}

function getCatchCounts() {
  return { ...fishingScene.fishCounts };
}

function updateSlotPreview(slot, rarity) {
  const range = slot.querySelector('input[type="range"]');
  const preview = slot.querySelector('.fc-preview');
  const go = slot.querySelector('.fc-go-btn');
  if (!range || !preview || !go) return;
  const n = Number(range.value) || 0;
  const gain = n * rarity.coinValue;
  preview.textContent = n > 0 ? `卖 ${n} 条 → +${gain} 钓鱼币` : '拖动滑条选择数量';
  go.disabled = n < 1;
}

function refreshFishCatalog() {
  const grid = document.getElementById('fishing-catalog-grid');
  if (!grid) return;
  const counts = getCatchCounts();
  grid.innerHTML = '';
  FISHING_RARITIES.forEach(r => {
    const n = counts[r.id] || 0;
    const unlocked = n > 0;
    const slot = document.createElement('div');
    slot.className = 'fc-slot' + (unlocked ? '' : ' locked');
    slot.dataset.id = r.id;
    const fill = unlocked ? r.fill : '#90a4ae';
    const stroke = unlocked ? r.stroke : '#607d8b';
    const opacity = unlocked ? r.opacity : 1;
    slot.innerHTML = `
      <div class="fc-name">${r.name}·${r.label}</div>
      <div class="fc-rate">1条 = ${r.coinValue} 钓鱼币</div>
      <div class="fc-fish-wrap">
        <div class="fc-fish" style="opacity:${opacity}">${fishSilhouetteSVG(fill, stroke)}</div>
        <span class="fc-count">${n}</span>
      </div>
      <div class="fc-trade" style="${unlocked ? '' : 'display:none'}">
        <div class="fc-trade-row">
          <input type="range" min="0" max="${Math.max(n, 0)}" value="${n > 0 ? 1 : 0}" step="1" ${n < 1 ? 'disabled' : ''}/>
          <button type="button" class="fc-max-btn">最大</button>
        </div>
        <div class="fc-preview"></div>
        <button type="button" class="fc-go-btn">兑换</button>
      </div>
    `;
    grid.appendChild(slot);
    if (unlocked) {
      const range = slot.querySelector('input[type="range"]');
      const maxBtn = slot.querySelector('.fc-max-btn');
      const go = slot.querySelector('.fc-go-btn');
      range.addEventListener('input', () => updateSlotPreview(slot, r));
      maxBtn.addEventListener('click', () => {
        range.value = String(n);
        updateSlotPreview(slot, r);
      });
      go.addEventListener('click', () => {
        const amt = Number(range.value) || 0;
        exchangeFishForCoins(r.id, amt);
      });
      updateSlotPreview(slot, r);
    }
  });
}

function exchangeFishForCoins(rarityId, amount) {
  const rarity = FISHING_RARITIES.find(r => r.id === rarityId);
  if (!rarity) return;
  const have = fishingScene.fishCounts[rarityId] || 0;
  const amt = Math.max(0, Math.min(have, Math.floor(amount)));
  if (amt < 1) return;
  fishingScene.fishCounts[rarityId] = have - amt;
  // 从 caughtLog 末尾去掉对应数量（保持记录大致同步）
  let left = amt;
  for (let i = fishingScene.caughtLog.length - 1; i >= 0 && left > 0; i--) {
    if (fishingScene.caughtLog[i].id === rarityId) {
      fishingScene.caughtLog.splice(i, 1);
      left -= 1;
    }
  }
  const gain = amt * rarity.coinValue;
  fishingScene.fishingCoins += gain;
  refreshFishingCoinUI({ pop: true });
  refreshFishCatalog();
  showToast(`💱 兑换 ${amt} 条${rarity.label} → +${gain} 钓鱼币`, '#ffb300');
}

function toggleFishCatalog(force) {
  const panel = document.getElementById('fishing-catalog');
  const btn = document.getElementById('fishing-catalog-btn');
  if (!panel) return;
  const open = typeof force === 'boolean' ? force : !panel.classList.contains('open');
  if (open) toggleFishingGear(false);
  panel.classList.toggle('open', open);
  if (btn) btn.classList.toggle('active', open);
  if (open) refreshFishCatalog();
  syncFishingSideDismiss();
}

function toggleFishingCoinModal(force) {
  const modal = document.getElementById('fishing-coin-modal');
  if (!modal) return;
  const open = typeof force === 'boolean' ? force : !modal.classList.contains('open');
  modal.classList.toggle('open', open);
}

function refreshFishBasket() {
  const box = document.getElementById('fish-basket-fish');
  if (!box) return;
  box.innerHTML = '';
  const list = fishingScene.recentBasket.slice(-FISHING_BASKET_MAX);
  list.forEach((r, i) => {
    const d = document.createElement('div');
    d.className = 'bf';
    d.style.left = (2 + (i % 2) * 10) + 'px';
    d.style.bottom = (1 + Math.floor(i / 2) * 7) + 'px';
    d.style.opacity = String(r.opacity);
    d.innerHTML = fishSilhouetteSVG(r.fill, r.stroke);
    box.appendChild(d);
  });
}

function putFishInBasket(rarity) {
  fishingScene.caughtLog.push({
    id: rarity.id,
    name: rarity.name,
    fill: rarity.fill,
    stroke: rarity.stroke,
    opacity: rarity.opacity,
    at: Date.now(),
  });
  fishingScene.fishCounts[rarity.id] = (fishingScene.fishCounts[rarity.id] || 0) + 1;
  fishingScene.recentBasket.push(rarity);
  if (fishingScene.recentBasket.length > FISHING_BASKET_MAX) {
    fishingScene.recentBasket = fishingScene.recentBasket.slice(-FISHING_BASKET_MAX);
  }
  refreshFishBasket();
  refreshFishingCoinUI();
  if (document.getElementById('fishing-catalog') && document.getElementById('fishing-catalog').classList.contains('open')) {
    refreshFishCatalog();
  }
  recordFishingCatchForAch();
}

function initFishingScene() {
  const shadowsEl = document.getElementById('fishing-shadows');
  const catchesEl = document.getElementById('fishing-catches');
  if (!shadowsEl) return;
  stopFishingScene();
  shadowsEl.innerHTML = '';
  catchesEl.innerHTML = '';
  fishingScene.ready = true;
  fishingScene.casting = false;
  fishingScene.shadows = [];
  document.getElementById('fishing-cast-btn').disabled = false;
  refreshFishBasket();
  refreshFishingCoinUI();
  refreshFishCatalog();
  refreshFishingGearUI();

  const count = 7;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'fish-sil';
    el.innerHTML = fishSilhouetteSVG('#061a2e');
    const size = 0.7 + Math.random() * 0.7;
    const topPct = 18 + Math.random() * 62;
    const facingRight = Math.random() > 0.5;
    el.style.width = (48 * size) + 'px';
    el.style.height = (24 * size) + 'px';
    el.style.top = topPct + '%';
    el.style.opacity = String(0.18 + Math.random() * 0.18);
    if (facingRight) el.classList.add('flip');
    shadowsEl.appendChild(el);

    const shadow = {
      el,
      x: Math.random() * 100,
      y: topPct,
      speed: (0.8 + Math.random() * 1.4) * (facingRight ? 1 : -1),
      facingRight,
      bob: Math.random() * Math.PI * 2,
    };
    fishingScene.shadows.push(shadow);
  }

  let last = performance.now();
  function tick(now) {
    if (!fishingScene.ready) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    fishingScene.shadows.forEach(s => {
      s.x += s.speed * dt * 12;
      s.bob += dt * 2;
      if (s.speed > 0 && s.x > 108) { s.x = -8; }
      if (s.speed < 0 && s.x < -8) { s.x = 108; }
      const yOff = Math.sin(s.bob) * 1.2;
      s.el.style.left = s.x + '%';
      s.el.style.transform = `translateY(${yOff}px)${s.facingRight ? ' scaleX(-1)' : ''}`;
    });
    const id = requestAnimationFrame(tick);
    fishingScene.animIds[0] = id;
  }
  fishingScene.animIds[0] = requestAnimationFrame(tick);
}

function stopFishingScene() {
  fishingScene.ready = false;
  fishingScene.casting = false;
  fishingScene.animIds.forEach(id => cancelAnimationFrame(id));
  fishingScene.animIds = [];
  fishingScene.shadows = [];
  const raft = document.getElementById('fishing-raft');
  if (raft) raft.classList.remove('casting', 'reeling');
}

function castFishingLine() {
  if (!document.getElementById('fishing-overlay').classList.contains('open')) return;
  if (!fishingScene.ready) initFishingScene();
  if (fishingScene.casting) return;
  fishingScene.casting = true;
  const btn = document.getElementById('fishing-cast-btn');
  const raft = document.getElementById('fishing-raft');
  if (btn) btn.disabled = true;
  if (raft) {
    raft.classList.remove('reeling');
    raft.classList.add('casting');
  }

  const hooks = Math.max(1, Math.min(FISHING_HOOK_MAX_EQUIP, fishingScene.hooksEquipped || 1));
  let usedBait = false;
  if (fishingScene.useBait && fishingScene.baitsOwned > 0) {
    fishingScene.baitsOwned -= 1;
    usedBait = true;
    if (fishingScene.baitsOwned < 1) fishingScene.useBait = false;
    refreshFishingGearUI();
    showToast('🪱 使用诱饵：蓝60% · 金40%', '#8d6e63');
  } else if (fishingScene.useBait && fishingScene.baitsOwned < 1) {
    fishingScene.useBait = false;
    refreshFishingGearUI();
  }

  let speedMul = 1;
  if (fishingScene.useSpeed && fishingScene.speedCharges > 0) {
    fishingScene.speedCharges -= 1;
    speedMul = 3;
    if (fishingScene.speedCharges < 1) fishingScene.useSpeed = false;
    refreshFishingGearUI();
    showToast(`⚡ 加速钓鱼（剩余 ${fishingScene.speedCharges} 次）`, '#ffb300');
  } else if (fishingScene.useSpeed && fishingScene.speedCharges < 1) {
    fishingScene.useSpeed = false;
    refreshFishingGearUI();
  }

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    if (raft) raft.classList.remove('casting', 'reeling');
    fishingScene.casting = false;
    if (btn) btn.disabled = false;
  };
  const castDelay = Math.round(900 / speedMul);
  setTimeout(finish, Math.round(5500 / speedMul) + 800);

  // 甩竿后：多钩同时上鱼，再一起提起来
  setTimeout(() => {
    try {
      spawnCaughtFishBatch(hooks, { useBait: usedBait, speedMul }, finish);
    } catch (err) {
      console.error(err);
      finish();
    }
  }, castDelay);
}

function spawnCaughtFishBatch(count, opts, done) {
  const layer = document.getElementById('fishing-catches');
  const raft = document.getElementById('fishing-raft');
  if (!layer) { done && done(); return; }

  const useBait = !!opts.useBait;
  const speedMul = Math.max(1, opts.speedMul || 1);
  const n = Math.max(1, count);
  const catches = [];
  for (let i = 0; i < n; i++) {
    catches.push(rollFishingRarity(useBait));
  }

  const names = catches.map(r => r.label).join('、');
  showToast(`🎣 同时上钩 ×${n}：${names}`, '#4fc3f7');

  const els = catches.map((rarity, i) => {
    const el = document.createElement('div');
    el.className = 'fish-catch rarity-' + rarity.id;
    el.dataset.rarity = rarity.id;
    el.innerHTML = fishSilhouetteSVG(rarity.fill, rarity.stroke);
    el.style.opacity = '0';
    const startX = 6 + Math.random() * 40;
    const startY = 50 + Math.random() * 35;
    const endX = 64 + i * 5;
    const endY = 8 + (i % 2) * 5;
    el.style.left = startX + '%';
    el.style.top = startY + '%';
    el.style.width = (58 + Math.random() * 10) + 'px';
    el.style.height = '28px';
    layer.appendChild(el);
    requestAnimationFrame(() => {
      el.classList.add('show');
      el.style.opacity = String(rarity.opacity);
    });
    return { el, rarity, startX, startY, endX, endY };
  });

  const t0 = performance.now();
  const swimDur = Math.round(1100 / speedMul);
  const fadeMs = Math.round(160 / speedMul);
  const flyMs = Math.round(550 / speedMul);
  function swim(now) {
    const p = Math.min(1, (now - t0) / swimDur);
    const ease = 1 - Math.pow(1 - p, 2.4);
    els.forEach((f, i) => {
      const x = f.startX + (f.endX - f.startX) * ease;
      const y = f.startY + (f.endY - f.startY) * ease + Math.sin(p * Math.PI * 2 + i) * 2.5;
      f.el.style.left = x + '%';
      f.el.style.top = y + '%';
      f.el.style.transform = 'scaleX(-1)';
    });
    if (p < 1) {
      requestAnimationFrame(swim);
    } else {
      if (raft) raft.classList.add('reeling');
      els.forEach(f => {
        f.el.style.transition = `opacity ${Math.max(0.08, 0.2 / speedMul)}s ease`;
        f.el.style.opacity = '0';
      });
      setTimeout(() => {
        els.forEach(f => f.el.remove());
        if (!raft) {
          catches.forEach(r => putFishInBasket(r));
          done && done();
          return;
        }
        const flies = catches.map((rarity, i) => {
          const fly = document.createElement('div');
          fly.className = 'fly-to-basket';
          fly.innerHTML = fishSilhouetteSVG(rarity.fill, rarity.stroke);
          fly.style.left = (2 + i * 10) + 'px';
          fly.style.top = (i * 4) + 'px';
          fly.style.opacity = String(rarity.opacity);
          if (speedMul > 1) {
            fly.style.transitionDuration = `${Math.max(0.15, 0.55 / speedMul)}s`;
          }
          raft.appendChild(fly);
          return fly;
        });
        requestAnimationFrame(() => {
          flies.forEach((fly, i) => {
            fly.style.left = (48 + (i % 2) * 8) + 'px';
            fly.style.top = (6 + Math.floor(i / 2) * 6) + 'px';
            fly.style.transform = 'scale(0.5)';
            fly.style.opacity = '0';
          });
        });
        setTimeout(() => {
          flies.forEach(f => f.remove());
          catches.forEach(r => putFishInBasket(r));
          if (raft) raft.classList.remove('reeling', 'casting');
          done && done();
        }, flyMs);
      }, fadeMs);
    }
  }
  requestAnimationFrame(swim);
}

function spawnCaughtFish(done, opts = {}) {
  // 兼容单钩：走批量 1 条
  spawnCaughtFishBatch(1, opts || {}, done);
}

// Shop open/close
document.getElementById('btn-shop').addEventListener('click', () => {
  syncCoinUI();
  refreshShopItems();
  markShopBubbleGameBadges();
  document.getElementById('shop-overlay').classList.add('open');
});

function openContinent() {
  loadBubblePet();
  refreshContinentPetCompanion();
  document.getElementById('continent-overlay').classList.add('open');
}
function closeContinent() {
  document.getElementById('continent-overlay').classList.remove('open');
}

document.getElementById('btn-continent').addEventListener('click', openContinent);
document.getElementById('btn-paodou').addEventListener('click', openPaodouScene);
document.getElementById('continent-close').addEventListener('click', closeContinent);
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (document.getElementById('paodou-overlay')?.classList.contains('open')) closePaodouScene();
  else if (document.getElementById('continent-overlay')?.classList.contains('open')) closeContinent();
});
document.getElementById('btn-rainforest-zone').addEventListener('click', openRainforestScene);
document.getElementById('btn-mistisles-zone').addEventListener('click', openMistIslesScene);
document.getElementById('btn-rainbowbay-zone').addEventListener('click', openRainbowBayScene);
document.getElementById('btn-crystalfrost-zone').addEventListener('click', openCrystalFrostScene);
document.getElementById('btn-goldplains-zone').addEventListener('click', openGoldPlainsScene);
document.getElementById('continent-farm-btn').addEventListener('click', openFarmScene);
document.getElementById('continent-pet-btn').addEventListener('click', openPetScene);
document.getElementById('btn-deepbath-zone').addEventListener('click', openDeepBathScene);
document.getElementById('continent-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('continent-overlay')) closeContinent();
});

document.getElementById('shop-close').addEventListener('click', () => {
  stopShopRocketHold(false);
  document.getElementById('shop-overlay').classList.remove('open');
});

document.getElementById('shop-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('shop-overlay')) {
    stopShopRocketHold(false);
    document.getElementById('shop-overlay').classList.remove('open');
  }
});

// 商店小游戏条：仅横滑/横向滚轮；竖滑交给整页商店滚动（泡泡专区 + 其它各一条）
(function bindShopGamesScroll() {
  document.querySelectorAll('.shop-games-scroll').forEach(sc => {
    if (sc.dataset.dragBound) return;
    sc.dataset.dragBound = '1';

    sc.addEventListener('wheel', e => {
      const dx = e.deltaX;
      const dy = e.deltaY;
      if (Math.abs(dx) <= Math.abs(dy)) return;
      const max = sc.scrollWidth - sc.clientWidth;
      if (max <= 0) return;
      const next = Math.max(0, Math.min(max, sc.scrollLeft + dx));
      if (next !== sc.scrollLeft) {
        e.preventDefault();
        sc.scrollLeft = next;
      }
    }, { passive: false });

    let down = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;
    sc.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = sc.scrollLeft;
      sc.classList.add('dragging');
    });
    window.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      sc.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', () => {
      down = false;
      sc.classList.remove('dragging');
    });
    sc.addEventListener('click', e => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    }, true);
  });
})();

// ══════════════════════════════════════════════════════════════════
//  KICK OFF
// ══════════════════════════════════════════════════════════════════
bindPdBuddyControls();

document.getElementById('start-btn').addEventListener('click', () => {
  const screen = document.getElementById('start-screen');
  screen.style.transition = 'opacity .4s';
  screen.style.opacity = '0';
  setTimeout(() => screen.remove(), 420);
  loadCoins();
  loadWallet();
  loadLevel();
  ensureStarterWallet();
  if (state.coins <= 0) addCoins(STARTER_COINS, { pop: false });
  else syncCoinUI();
  refreshLevelUI();
  resetCombo();
  resizeCanvas();
  for (let i = 0; i < 12; i++) state.bubbles.push(createBubble());
  startSpawnLoop();
  tick();
});

(() => {
  const sidebar = document.getElementById('game-sidebar');
  const toggle = document.getElementById('panel-toggle');
  const backdrop = document.getElementById('panel-backdrop');
  const closeSidebar = () => {
    sidebar?.classList.remove('open');
    backdrop?.classList.remove('show');
  };
  toggle?.addEventListener('click', () => {
    const open = sidebar?.classList.toggle('open');
    backdrop?.classList.toggle('show', !!open);
  });
  backdrop?.addEventListener('click', closeSidebar);
})();

bindHoldAction(document.getElementById('lv-up-btn'), {
  holdDelayMs: 420,
  repeatMs: 260,
  onPress: () => levelUp(),
  onRepeat: () => levelUp(),
});

document.getElementById('btn-backpack').addEventListener('click', openBackpack);
document.getElementById('backpack-close').addEventListener('click', closeBackpack);
document.getElementById('backpack-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('backpack-overlay')) closeBackpack();
});

document.querySelectorAll('.bp-use-item').forEach(btn => {
  const key = btn.dataset.bp;
  if (!key) return;
  const isRocket = key === 'rocket';
  bindHoldAction(btn, {
    repeatMs: isRocket ? 100 : 140,
    holdDelayMs: 380,
    onPress: () => isRocket ? useRocket({ quiet: false }) : useInventoryItem(key, { quiet: false }),
    onRepeat: () => isRocket ? useRocket({ quiet: true }) : useInventoryItem(key, { quiet: true }),
    onEnd: () => {
      refreshBackpackUI();
      refreshShopItems();
    },
  });
});

document.getElementById('btn-restart').addEventListener('click', () => {
  if (!confirm('确定要重新开始吗？当前进度将会清空。')) return;

  // Stop ongoing timers
  clearInterval(state.spawnTimer);
  clearInterval(passTimerInterval);
  if (state.passChallenge) {
    state.passChallenge = null;
    document.getElementById('pass-overlay').classList.remove('open');
  }

  // Reset state
  state.bubbles       = [];
  state.score         = 0;
  state.popped        = 0;
  state.poppedTotal   = 0;
  state.coins         = STARTER_COINS;
  resetWallet(true);
  state.level         = 1;
  state.passLevel     = 0;
  resetInventory();
  state.stageRocketsGiven = new Set();
  saveLevel();
  resetCombo();
  state.watermelonActive  = false;
  if (state.watermelonTimer) { clearTimeout(state.watermelonTimer); state.watermelonTimer = null; }
  if (state.watermelonWarnTimer) { clearTimeout(state.watermelonWarnTimer); state.watermelonWarnTimer = null; }
  state.strawberryJuiceActive = false;
  if (state.strawberryJuiceTimer) {
    clearTimeout(state.strawberryJuiceTimer);
    state.strawberryJuiceTimer = null;
  }
  const juiceOverlay = document.getElementById('strawberry-juice-overlay');
  if (juiceOverlay) juiceOverlay.remove();

  // Reset shop
  resetShop();

  // Update UI
  document.getElementById('stat-score').textContent  = '0';
  document.getElementById('stat-popped').textContent = '0';
  syncCoinUI();
  refreshLevelUI();
  refreshShopItems();
  refreshPassUI();

  // Restart spawn loop and tick
  for (let i = 0; i < 12; i++) state.bubbles.push(createBubble());
  startSpawnLoop();

  showToast('🔄 游戏已重新开始！', '#ff5555');
});

// Pass modal
document.getElementById('btn-pass').addEventListener('click', openPassModal);
document.getElementById('pass-close').addEventListener('click', closePassModal);
document.getElementById('pass-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('pass-overlay')) closePassModal();
});
document.getElementById('pass-start-btn').addEventListener('click', startPassChallenge);
document.getElementById('pass-open-shop-btn').addEventListener('click', () => {
  syncCoinUI();
  refreshShopItems();
  markShopBubbleGameBadges();
  document.getElementById('shop-overlay').classList.add('open');
});

// Daily bubble quest
loadDailyQuest();
loadBoardDaily();
refreshBoardDailyUI();
document.getElementById('btn-zen-mode')?.addEventListener('click', toggleZenMode);
loadRainforest();
refreshRainforestUI();
bindRainforestControls();
bindMistIslesControls();
bindRainbowBayControls();
bindCrystalFrostControls();
bindGoldPlainsControls();
bindFarmControls();
bindPetControls();
bindPetMeetControls();
bindDeepBathControls();
loadRainbowBay();
refreshRainbowBayUI();
loadMistIsles();
refreshMistIslesUI();
loadCrystalFrost();
refreshCrystalFrostUI();
loadCoins();
loadWallet();
loadLevel();
loadInventory();
loadShop();
loadShopDailyBuys();
ensureShopDailyDay();
ensureStarterWallet();
loadFishingCoins();
syncCoinUI();
syncMainCurrencyHUD();
refreshItemBarUI();
loadGoldPlains();
refreshGoldPlainsUI();
loadBubbleFarm();
refreshFarmUI();
loadBubblePet();
loadAchievementStats();
loadSeason();
ensureSeasonExclusiveSkinOwned();
refreshPetUI();
refreshPetMeetUI();
loadDeepBath();
refreshDeepBathUI();
refreshLevelUI();
refreshShopItems();
document.getElementById('btn-quest').addEventListener('click', openQuestModal);
document.getElementById('btn-season').addEventListener('click', openSeasonModal);
document.getElementById('season-close').addEventListener('click', closeSeasonModal);
document.getElementById('season-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('season-overlay')) closeSeasonModal();
});
document.getElementById('btn-achievement').addEventListener('click', openAchievementModal);
document.getElementById('achievement-close').addEventListener('click', closeAchievementModal);
document.getElementById('achievement-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('achievement-overlay')) closeAchievementModal();
});
document.getElementById('quest-close').addEventListener('click', closeQuestModal);
document.getElementById('quest-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('quest-overlay')) closeQuestModal();
});
document.getElementById('quest-claim-btn').addEventListener('click', claimDailyQuestReward);
document.getElementById('btn-skin-gacha')?.addEventListener('click', openSkinGachaModal);
document.getElementById('shop-open-gacha')?.addEventListener('click', openSkinGachaModal);
document.getElementById('gacha-close')?.addEventListener('click', closeSkinGachaModal);
document.getElementById('skin-gacha-overlay')?.addEventListener('click', e => {
  if (e.target?.id === 'skin-gacha-overlay') closeSkinGachaModal();
});
document.getElementById('gacha-draw-1')?.addEventListener('click', () => {
  const res = performSkinGachaDraw(1);
  if (res) {
    const s = res[0].skin;
    const tag = res[0].isNew ? '新皮肤' : `重复 · 退 ${GACHA_DUP_REFUND}🫧`;
    showToast(`${s.icon} ${s.name} · ${tag}`, res[0].isNew ? '#ffb74d' : '#90a4ae');
  }
});
document.getElementById('gacha-draw-10')?.addEventListener('click', () => {
  const res = performSkinGachaDraw(10);
  if (res) {
    const newN = res.filter(r => r.isNew).length;
    showToast(`十连抽完成 · 新皮肤 ${newN} 个`, '#ffb74d');
  }
});
// 捕获阶段记录：按钮 click 里 stopPropagation 会挡住冒泡，必须在捕获阶段先记
document.getElementById('shop-games-strip').addEventListener('click', e => {
  const btn = e.target.closest('button[id^="btn-"]');
  if (btn && SHOP_MINI_GAME_BTN_MAP[btn.id]) recordBubbleGameFromBtn(btn.id);
}, true);
