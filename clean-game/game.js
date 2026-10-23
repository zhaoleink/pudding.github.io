/**
 * 慢净 — 擦净看见 · 独立解压游戏
 */
const STORAGE_KEY = 'manjing_clean_v2';
const FOG_SAVE_STEP = 8;
const CLEAR_THRESHOLD = 0.99;
const SAMPLE_STEP = 12;

const TOOLS = {
  cloth: { radius: 62, soft: 0.94 },
  finger: { radius: 34, soft: 0.98 },
  squeegee: { radius: 28, soft: 1, line: true },
};

const CORNER_FRAC = 0.17;
const CORNER_CLEAR = 0.72;

const EGG_RULES = [
  { id: 'koi', emoji: '🎏', name: '锦鲤彩蛋', riddle: '四角角落，也擦干净了吗？' },
  { id: 'bubble', emoji: '🫧', name: '泡泡彩蛋', riddle: '「雨后天晴」关 · 用刮板擦到 99%' },
  { id: 'kitty', emoji: '🐱', name: '猫窗彩蛋', riddle: '软布太粗放，花儿不肯开' },
  { id: 'teahouse', emoji: '🍵', name: '茶亭彩蛋', riddle: '安静的时候，别用刮板' },
  { id: 'starry', emoji: '🌠', name: '星窗彩蛋', riddle: '雪夜无声，四角才见星' },
  { id: 'aurora', emoji: '🌌', name: '极光彩蛋', riddle: '十二景净了，且悟出三道谜' },
];

const EGG_UNLOCK_MSG = {
  koi: '🎏 角落也净了 · 锦鲤游来',
  bubble: '🫧 刮板收尾 · 泡泡来了',
  kitty: '🐱 细擦成花 · 猫窗出现',
  teahouse: '🍵 静擦林窗 · 茶亭现形',
  starry: '🌠 雪夜四角净 · 星窗打开',
  aurora: '🌌 十二景三谜 · 极光降临',
};

const EGG_DONE_MSG = {
  starry: '最安静的风景 🌙',
  aurora: '极光在冰湖上跳舞',
  kitty: '猫在等日落',
  bubble: '泡泡轻轻飘',
  koi: '锦鲤游过水面',
  teahouse: '茶亭里慢慢喝',
};

const state = {
  levelIndex: 0,
  maxUnlocked: 0,
  completed: [],
  unlockedEggs: [],
  sfxOn: true,
  ambientOn: true,
  started: false,
  wiping: false,
  completedLevel: false,
  tool: 'cloth',
  lastX: 0,
  lastY: 0,
  attemptTools: [],
  cornerState: { tl: false, tr: false, bl: false, br: false, all: false },
  levelProgress: {},
  freePlay: false,
};

let sceneCtx = null;
let fogCtx = null;
let progressTimer = null;
let resizeObserver = null;
let toastTimer = null;
let resizeDebounce = null;
let saveProgressDebounce = null;
let lastFrameW = 0;
let lastFrameH = 0;
let canvasDpr = 1;

const scenePlay = {
  ripples: [],
  bubbles: [],
  petals: [],
  leaves: [],
  motes: [],
  steam: [],
  koiDash: null,
  kittyTap: 0,
  shootStar: null,
  sunPulse: 0,
  sunX: 0,
  sunY: 0,
  auroraPulse: 0,
  lanternPulse: 0,
  lanternX: 0,
  lanternY: 0,
  snowPuff: 0,
  snowX: 0,
  snowY: 0,
  rainbowPulse: 0,
  bambooSway: 0,
  bambooX: 0,
  animId: null,
};

const GameAudio = {
  ctx: null,
  rainNodes: null,
  rainStarting: false,
  lastWipeAt: 0,

  init() {
    if (this.ctx) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
    } catch {}
  },

  async wake() {
    this.init();
    if (!this.ctx) return false;
    if (this.ctx.state === 'suspended') {
      try { await this.ctx.resume(); } catch { return false; }
    }
    return this.ctx.state === 'running';
  },

  playTone(t, freq, volume, duration, type = 'sine') {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  },

  playTap() {
    if (!state.sfxOn) return;
    this.wake().then(ok => {
      if (!ok || !this.ctx) return;
      this.playTone(this.ctx.currentTime, 480, 0.028, 0.1);
    });
  },

  playWipe() {
    if (!state.sfxOn) return;
    const now = performance.now();
    if (now - this.lastWipeAt < 130) return;
    this.lastWipeAt = now;
    this.wake().then(ok => {
      if (!ok || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 520;
      filter.Q.value = 0.7;
      osc.type = 'sine';
      const f0 = 210 + Math.random() * 30;
      osc.frequency.setValueAtTime(f0, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(80, f0 * 0.82), t + 0.11);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.024, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.13);
    });
  },

  playComplete() {
    if (!state.sfxOn) return;
    this.wake().then(ok => {
      if (!ok || !this.ctx) return;
      const t = this.ctx.currentTime;
      [523, 659, 784].forEach((freq, i) => {
        this.playTone(t + i * 0.11, freq, 0.042, 0.38);
      });
    });
  },

  buildRainBuffer() {
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.09;
    }
    return buffer;
  },

  async startRain() {
    if (!state.ambientOn || this.rainNodes || this.rainStarting) return;
    this.rainStarting = true;
    const ok = await this.wake();
    this.rainStarting = false;
    if (!ok || !this.ctx || !state.ambientOn || this.rainNodes) return;

    const t = this.ctx.currentTime;
    const source = this.ctx.createBufferSource();
    source.buffer = this.buildRainBuffer();
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2400;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.17, t + 0.5);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    source.start(t);
    this.rainNodes = { source, gain, filter };
  },

  stopRain() {
    if (!this.rainNodes) return;
    const { source, gain } = this.rainNodes;
    this.rainNodes = null;
    try {
      const t = this.ctx?.currentTime ?? 0;
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(gain.gain.value, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.2);
      source.stop(t + 0.25);
    } catch {
      try { source.stop(); } catch {}
    }
  },

  async setAmbient(on) {
    if (on) await this.startRain();
    else this.stopRain();
  },

  syncAmbient() {
    if (state.ambientOn) return this.startRain();
    this.stopRain();
    return Promise.resolve();
  },
};

function bytesToBase64(bytes) {
  let s = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(s);
}

function base64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function migrateLegacySave() {
  try {
    const raw = localStorage.getItem('manjing_clean_v1');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function load() {
  try {
    let d = null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) d = JSON.parse(raw);
    else d = migrateLegacySave();

    if (!d) {
      state.maxUnlocked = 0;
      return;
    }

    state.maxUnlocked = Math.max(0, Math.min(CleanArt.LEVELS.length - 1, d.maxUnlocked | 0));
    state.completed = Array.isArray(d.completed) ? d.completed.filter(id => typeof id === 'string') : [];
    state.unlockedEggs = Array.isArray(d.unlockedEggs) ? d.unlockedEggs.filter(id => typeof id === 'string') : [];
    if (d.eggUnlocked && !state.unlockedEggs.includes('starry')) {
      state.unlockedEggs.push('starry');
    }
    state.sfxOn = d.sfxOn !== false;
    state.ambientOn = d.ambientOn !== false;
    state.started = !!d.started;
    if (['cloth', 'finger', 'squeegee'].includes(d.tool)) state.tool = d.tool;
    state.levelProgress = (d.levelProgress && typeof d.levelProgress === 'object') ? d.levelProgress : {};

    const maxIdx = Math.max(0, allLevels().length - 1);
    state.levelIndex = Math.max(0, Math.min(maxIdx, d.levelIndex | 0));
  } catch {
    state.maxUnlocked = 0;
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      levelIndex: state.levelIndex,
      maxUnlocked: state.maxUnlocked,
      completed: state.completed,
      unlockedEggs: state.unlockedEggs,
      sfxOn: state.sfxOn,
      ambientOn: state.ambientOn,
      started: state.started,
      tool: state.tool,
      levelProgress: state.levelProgress,
    }));
  } catch {}
}

function currentProgressPct() {
  const text = document.getElementById('progress-text')?.textContent || '0%';
  const n = parseInt(text, 10);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
}

function captureLevelProgress() {
  const fog = document.getElementById('fog-canvas');
  if (!fogCtx || !fog || fog.width < 1 || fog.height < 1) return null;

  const w = fog.width;
  const h = fog.height;
  const sw = Math.max(1, Math.ceil(w / FOG_SAVE_STEP));
  const sh = Math.max(1, Math.ceil(h / FOG_SAVE_STEP));
  const img = fogCtx.getImageData(0, 0, w, h);
  const d = img.data;
  const alpha = new Uint8Array(sw * sh);

  for (let gy = 0; gy < sh; gy++) {
    for (let gx = 0; gx < sw; gx++) {
      const x = Math.min(w - 1, gx * FOG_SAVE_STEP + (FOG_SAVE_STEP >> 1));
      const y = Math.min(h - 1, gy * FOG_SAVE_STEP + (FOG_SAVE_STEP >> 1));
      alpha[gy * sw + gx] = d[(y * w + x) * 4 + 3];
    }
  }

  return {
    sw,
    sh,
    cw: w,
    ch: h,
    alpha: bytesToBase64(alpha),
  };
}

function restoreFogFromProgress(prog) {
  const fog = document.getElementById('fog-canvas');
  if (!fogCtx || !fog || !prog?.alpha) return;

  const w = fog.width;
  const h = fog.height;
  let alpha;
  try {
    alpha = base64ToBytes(prog.alpha);
  } catch {
    return;
  }

  const sw = prog.sw | 0;
  const sh = prog.sh | 0;
  if (sw < 1 || sh < 1 || alpha.length < sw * sh) return;

  const stepX = w / sw;
  const stepY = h / sh;
  const patchR = Math.max(stepX, stepY) * 0.72;

  fogCtx.setTransform(1, 0, 0, 1, 0, 0);
  fogCtx.globalCompositeOperation = 'destination-out';
  fogCtx.fillStyle = 'rgba(0,0,0,1)';

  for (let gy = 0; gy < sh; gy++) {
    for (let gx = 0; gx < sw; gx++) {
      if (alpha[gy * sw + gx] >= 40) continue;
      const cx = (gx + 0.5) * stepX;
      const cy = (gy + 0.5) * stepY;
      fogCtx.beginPath();
      fogCtx.arc(cx, cy, patchR, 0, Math.PI * 2);
      fogCtx.fill();
    }
  }

  fogCtx.globalCompositeOperation = 'source-over';
}

function persistCurrentLevel() {
  if (!state.started || !fogCtx) return;
  const id = currentLevel().id;
  const base = {
    attemptTools: [...state.attemptTools],
    cornerState: { ...state.cornerState },
    progress: currentProgressPct(),
  };

  if (state.completedLevel || state.completed.includes(id)) {
    state.levelProgress[id] = {
      ...base,
      completedLevel: true,
      progress: 100,
    };
    return;
  }

  const cap = captureLevelProgress();
  if (!cap) return;
  state.levelProgress[id] = {
    ...cap,
    ...base,
    completedLevel: false,
  };
}

function schedulePersistLevel() {
  clearTimeout(saveProgressDebounce);
  saveProgressDebounce = setTimeout(() => {
    persistCurrentLevel();
    save();
  }, 700);
}

function clearLevelProgress(id) {
  if (state.levelProgress[id]) delete state.levelProgress[id];
}

function eggLevels() {
  return CleanArt.EGG_LEVELS.filter(lv => state.unlockedEggs.includes(lv.id));
}

function allLevels() {
  return [...CleanArt.LEVELS, ...eggLevels()];
}

function hasEgg(id) {
  return state.unlockedEggs.includes(id);
}

function unlockEgg(id) {
  if (hasEgg(id)) return false;
  state.unlockedEggs.push(id);
  save();
  const frame = document.getElementById('canvas-frame');
  if (frame) {
    frame.classList.add('egg-unlock-flash');
    setTimeout(() => frame.classList.remove('egg-unlock-flash'), 600);
  }
  GameAudio.playComplete();
  showToast(`${EGG_UNLOCK_MSG[id] || '✨ 发现彩蛋！'} · 去选关看看`);
  refreshEggStats();
  return true;
}

function resetAttempt() {
  state.attemptTools = [];
  state.cornerState = { tl: false, tr: false, bl: false, br: false, all: false };
}

function usedTool(tool) {
  return state.attemptTools.includes(tool);
}

function sampleRegionClear(d, w, x0, y0, x1, y1, step) {
  let clear = 0;
  let total = 0;
  for (let y = y0; y < y1; y += step) {
    for (let x = x0; x < x1; x += step) {
      const i = (Math.floor(y) * w + Math.floor(x)) * 4 + 3;
      if (i < 0 || i >= d.length) continue;
      total++;
      if (d[i] < 40) clear++;
    }
  }
  return total ? clear / total : 0;
}

function measureCorners() {
  if (!fogCtx) return state.cornerState;
  const fog = document.getElementById('fog-canvas');
  const w = fog.width;
  const h = fog.height;
  const d = fogCtx.getImageData(0, 0, w, h).data;
  const cw = w * CORNER_FRAC;
  const ch = h * CORNER_FRAC;
  const step = 8;
  const tl = sampleRegionClear(d, w, 0, 0, cw, ch, step) >= CORNER_CLEAR;
  const tr = sampleRegionClear(d, w, w - cw, 0, w, ch, step) >= CORNER_CLEAR;
  const bl = sampleRegionClear(d, w, 0, h - ch, cw, h, step) >= CORNER_CLEAR;
  const br = sampleRegionClear(d, w, w - cw, h - ch, w, h, step) >= CORNER_CLEAR;
  return { tl, tr, bl, br, all: tl && tr && bl && br };
}

function updateCornerMarkers() {
  const wrap = document.getElementById('corner-markers');
  if (!wrap) return;
  const lv = currentLevel();
  const needCorners = (lv.id === 'lake' && !hasEgg('koi')) || (lv.id === 'snow' && !hasEgg('starry'));
  wrap.hidden = !state.started || state.completedLevel || !needCorners;
  if (wrap.hidden) return;
  const c = state.cornerState;
  wrap.querySelector('.tl')?.classList.toggle('lit', c.tl);
  wrap.querySelector('.tr')?.classList.toggle('lit', c.tr);
  wrap.querySelector('.bl')?.classList.toggle('lit', c.bl);
  wrap.querySelector('.br')?.classList.toggle('lit', c.br);
}

function checkEggUnlocks() {
  const lv = currentLevel();
  if (lv.secret) return;

  const corners = state.cornerState;

  if (!hasEgg('koi') && lv.id === 'lake' && corners.all) unlockEgg('koi');
  if (!hasEgg('bubble') && lv.id === 'rain' && usedTool('squeegee')) unlockEgg('bubble');
  if (!hasEgg('kitty') && lv.id === 'flower' && !usedTool('cloth')) unlockEgg('kitty');
  if (!hasEgg('teahouse') && lv.id === 'forest' && !state.ambientOn && !usedTool('squeegee')) unlockEgg('teahouse');
  if (!hasEgg('starry') && lv.id === 'snow' && !state.ambientOn && corners.all) unlockEgg('starry');

  if (!hasEgg('aurora')) {
    const mainDone = CleanArt.LEVELS.every(l => state.completed.includes(l.id));
    const eggCount = state.unlockedEggs.filter(id => id !== 'aurora').length;
    if (mainDone && eggCount >= 3) unlockEgg('aurora');
  }
}

function levelHint(lv) {
  if (lv.secret) return '彩蛋关卡 · 擦到 99% 过关';
  const map = {
    lake: hasEgg('koi') ? null : '这一湖…四角角落也净了吗？',
    rain: hasEgg('bubble') ? null : '雨痕的最后一道，该交给谁？',
    flower: hasEgg('kitty') ? null : '花儿要细擦，软布也许太粗',
    forest: hasEgg('teahouse') ? null : '关雨声，且别急着用刮板',
    snow: hasEgg('starry') ? null : '雪夜要静，四角也要净',
  };
  return map[lv.id] || '按住拖动擦 · 擦到 99% 过关 · 也许另有擦法';
}

function renderEggClues() {
  const list = document.getElementById('egg-clue-list');
  if (!list) return;
  list.innerHTML = '';
  EGG_RULES.forEach(rule => {
    const li = document.createElement('li');
    const found = hasEgg(rule.id);
    li.className = found ? 'egg-clue done' : 'egg-clue';
    li.textContent = found
      ? `✓ ${rule.emoji} ${rule.name}`
      : `${rule.emoji} · ??? — ${rule.riddle}`;
    list.appendChild(li);
  });
}

function refreshEggStats() {
  const total = CleanArt.EGG_LEVELS.length;
  const found = state.unlockedEggs.length;
  const el = document.getElementById('stat-done');
  if (el) el.textContent = `已完成 ${state.completed.length} 关 · 彩蛋 ${found}/${total}`;
}

function currentLevel() {
  return allLevels()[state.levelIndex] || allLevels()[0];
}

function resizeCanvases(forceReset = false) {
  const frame = document.getElementById('canvas-frame');
  const scene = document.getElementById('scene-canvas');
  const fog = document.getElementById('fog-canvas');
  if (!frame || !scene || !fog) return;

  canvasDpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = frame.getBoundingClientRect();
  const w = Math.max(1, Math.floor(rect.width));
  const h = Math.max(1, Math.floor(rect.height));
  const sizeChanged = w !== lastFrameW || h !== lastFrameH;
  if (!sizeChanged && !forceReset) return;

  const preserveFog = state.started && !state.completedLevel && !forceReset && sizeChanged && fog.width > 0 && fog.height > 0;
  let savedFog = null;
  let oldPw = 0;
  let oldPh = 0;
  if (preserveFog && fogCtx) {
    fogCtx.setTransform(1, 0, 0, 1, 0, 0);
    oldPw = fog.width;
    oldPh = fog.height;
    savedFog = document.createElement('canvas');
    savedFog.width = oldPw;
    savedFog.height = oldPh;
    savedFog.getContext('2d').drawImage(fog, 0, 0);
  }

  lastFrameW = w;
  lastFrameH = h;

  [scene, fog].forEach(c => {
    c.width = w * canvasDpr;
    c.height = h * canvasDpr;
    c.style.width = `${w}px`;
    c.style.height = `${h}px`;
  });

  sceneCtx = scene.getContext('2d');
  fogCtx = fog.getContext('2d');
  sceneCtx.setTransform(canvasDpr, 0, 0, canvasDpr, 0, 0);
  fogCtx.setTransform(1, 0, 0, 1, 0, 0);

  drawScene();
  if (forceReset || !state.started) {
    resetFog();
  } else if (state.completedLevel) {
    clearFogForPlay();
    ensureSceneAnim();
  } else if (savedFog) {
    fogCtx.drawImage(savedFog, 0, 0, oldPw, oldPh, 0, 0, fog.width, fog.height);
    measureProgress();
  } else {
    resetFog();
  }
}

function toolRadius() {
  return TOOLS[state.tool].radius * canvasDpr;
}

function drawScene() {
  if (!sceneCtx) return;
  const scene = document.getElementById('scene-canvas');
  const w = scene.width / canvasDpr;
  const h = scene.height / canvasDpr;
  sceneCtx.clearRect(0, 0, w, h);
  CleanArt.drawScene(sceneCtx, w, h, currentLevel().id);
  if (state.completedLevel) {
    CleanArt.drawInteractOverlay(sceneCtx, w, h, currentLevel().id, scenePlay, performance.now());
  }
}

function resetScenePlay() {
  scenePlay.ripples = [];
  scenePlay.bubbles = [];
  scenePlay.petals = [];
  scenePlay.leaves = [];
  scenePlay.motes = [];
  scenePlay.steam = [];
  scenePlay.koiDash = null;
  scenePlay.kittyTap = 0;
  scenePlay.shootStar = null;
  scenePlay.sunPulse = 0;
  scenePlay.auroraPulse = 0;
  scenePlay.lanternPulse = 0;
  scenePlay.snowPuff = 0;
  scenePlay.rainbowPulse = 0;
  scenePlay.bambooSway = 0;
}

function stopSceneAnim() {
  if (scenePlay.animId) {
    cancelAnimationFrame(scenePlay.animId);
    scenePlay.animId = null;
  }
}

function sceneAnimTick() {
  if (!state.completedLevel || !sceneCtx) {
    stopSceneAnim();
    return;
  }
  drawScene();
  const now = performance.now();
  if (CleanArt.hasActiveOverlay(scenePlay, now, currentLevel().id)) {
    scenePlay.animId = requestAnimationFrame(sceneAnimTick);
  } else {
    scenePlay.animId = null;
  }
}

function ensureSceneAnim() {
  if (!scenePlay.animId) scenePlay.animId = requestAnimationFrame(sceneAnimTick);
}

function clearFogForPlay() {
  const fog = document.getElementById('fog-canvas');
  if (!fogCtx || !fog) return;
  fogCtx.setTransform(1, 0, 0, 1, 0, 0);
  fogCtx.clearRect(0, 0, fog.width, fog.height);
}

function enablePlayMode() {
  clearFogForPlay();
  resetScenePlay();
  document.getElementById('canvas-frame')?.classList.add('play-mode');
  const hint = document.getElementById('game-hint');
  if (hint) hint.textContent = '净了 · 点一点画面，会有小惊喜 🌿';
  drawScene();
}

function disablePlayMode() {
  document.getElementById('canvas-frame')?.classList.remove('play-mode');
  stopSceneAnim();
  resetScenePlay();
}

function addRipple(x, y) {
  const size = Math.min(lastFrameW || 400, lastFrameH || 300);
  scenePlay.ripples.push({ x, y, t: performance.now(), maxR: size * 0.14 });
}

function pointerLogical(e) {
  const p = pointerPos(e);
  return { x: p.x / canvasDpr, y: p.y / canvasDpr };
}

function handleSceneTap(x, y) {
  const id = currentLevel().id;
  const w = lastFrameW || 400;
  const h = lastFrameH || 300;
  const now = performance.now();

  GameAudio.playTap();

  if (['lake', 'beach', 'lotus', 'koi', 'teahouse', 'bamboo'].includes(id)) {
    addRipple(x, y);
  }

  switch (id) {
    case 'kitty':
      scenePlay.kittyTap = now;
      break;
    case 'bubble':
      scenePlay.bubbles.push({ x, y, t: now, r: 10 + Math.random() * 14 });
      break;
    case 'koi':
      scenePlay.koiDash = {
        t: now,
        x0: w * 0.35,
        y0: h * 0.58,
        x1: x,
        y1: y,
        color: '#f07040',
        flip: x > w * 0.5,
      };
      break;
    case 'starry':
      scenePlay.shootStar = {
        t: now,
        x0: x,
        y0: y * 0.4,
        x1: x + w * 0.35,
        y1: y * 0.4 + h * 0.18,
      };
      break;
    case 'aurora':
      scenePlay.auroraPulse = now;
      break;
    case 'forest':
      for (let i = 0; i < 10; i++) {
        scenePlay.motes.push({
          x: w * 0.55 + (Math.random() - 0.5) * 40,
          y: h * 0.35 + (Math.random() - 0.5) * 30,
          t: now + i * 40,
          angle: Math.random() * Math.PI * 2,
        });
      }
      break;
    case 'rain':
      scenePlay.rainbowPulse = now;
      break;
    case 'flower':
      for (let i = 0; i < 6; i++) {
        scenePlay.petals.push({
          x, y, t: now + i * 50, rot: Math.random() * Math.PI,
        });
      }
      break;
    case 'snow':
      scenePlay.snowPuff = now;
      scenePlay.snowX = x;
      scenePlay.snowY = y;
      break;
    case 'terrace':
    case 'beach':
      scenePlay.sunPulse = now;
      scenePlay.sunX = w * 0.78;
      scenePlay.sunY = h * 0.14;
      break;
    case 'town': {
      const lanterns = [{ x: w * 0.15, y: h * 0.48 }, { x: w * 0.8, y: h * 0.46 }];
      const near = lanterns.reduce((a, b) =>
        Math.hypot(x - a.x, y - a.y) < Math.hypot(x - b.x, y - b.y) ? a : b);
      scenePlay.lanternPulse = now;
      scenePlay.lanternX = near.x;
      scenePlay.lanternY = near.y;
      break;
    }
    case 'maple':
      for (let i = 0; i < 8; i++) {
        scenePlay.leaves.push({
          x, y, t: now + i * 60,
          rot: Math.random() * Math.PI,
          phase: Math.random() * Math.PI * 2,
          color: ['rgba(216,72,40,0.9)', 'rgba(232,104,48,0.9)', 'rgba(240,128,64,0.9)'][i % 3],
        });
      }
      break;
    case 'cloudpeak':
      addRipple(x, y);
      scenePlay.bubbles.push({ x, y: h * 0.6, t: now, r: 16 });
      break;
    case 'bamboo':
      scenePlay.bambooSway = now;
      scenePlay.bambooX = x;
      break;
    case 'teahouse':
      scenePlay.steam.push({ x: w * 0.5, y: h * 0.72, t: now });
      scenePlay.steam.push({ x: w * 0.48, y: h * 0.7, t: now + 120 });
      break;
    default:
      addRipple(x, y);
      break;
  }

  ensureSceneAnim();
}

function onSceneTap(e) {
  if (!state.completedLevel) return;
  e.preventDefault();
  GameAudio.wake();
  const p = pointerLogical(e);
  handleSceneTap(p.x, p.y);
}

function resetFog() {
  if (!fogCtx) return;
  const fog = document.getElementById('fog-canvas');
  const pw = fog.width;
  const ph = fog.height;
  fogCtx.setTransform(1, 0, 0, 1, 0, 0);
  fogCtx.clearRect(0, 0, pw, ph);

  fogCtx.fillStyle = 'rgba(235, 242, 248, 0.92)';
  fogCtx.fillRect(0, 0, pw, ph);

  const img = fogCtx.getImageData(0, 0, pw, ph);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 18;
    d[i] = Math.min(255, Math.max(200, d[i] + n));
    d[i + 1] = Math.min(255, Math.max(210, d[i + 1] + n));
    d[i + 2] = Math.min(255, Math.max(220, d[i + 2] + n));
  }
  fogCtx.putImageData(img, 0, 0);

  fogCtx.fillStyle = 'rgba(255,255,255,0.25)';
  for (let i = 0; i < 80; i++) {
    fogCtx.beginPath();
    fogCtx.arc(Math.random() * pw, Math.random() * ph, (20 + Math.random() * 60) * canvasDpr, 0, Math.PI * 2);
    fogCtx.fill();
  }

  resetAttempt();
  state.completedLevel = false;
  disablePlayMode();
  document.getElementById('complete-badge').hidden = true;
  updateProgress(0);
  updateCornerMarkers();
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
  progressTimer = setInterval(measureProgress, 120);
}

function wipeStroke(x0, y0, x1, y1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy);
  const step = Math.max(6 * canvasDpr, toolRadius() * 0.28);
  const n = Math.max(1, Math.ceil(dist / step));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = x0 + dx * t;
    const y = y0 + dy * t;
    const px = i === 0 ? null : x0 + dx * ((i - 1) / n);
    const py = i === 0 ? null : y0 + dy * ((i - 1) / n);
    wipeAt(x, y, px, py, i === 0);
  }
}

function wipeAt(x, y, prevX, prevY, playSound = true) {
  if (!fogCtx || (state.completedLevel && !state.freePlay)) return;
  if (!state.attemptTools.includes(state.tool)) {
    state.attemptTools.push(state.tool);
  }
  const tool = TOOLS[state.tool];
  const r = toolRadius();

  fogCtx.save();
  fogCtx.setTransform(1, 0, 0, 1, 0, 0);
  fogCtx.globalCompositeOperation = 'destination-out';

  if (tool.line && prevX != null) {
    fogCtx.lineCap = 'round';
    fogCtx.lineJoin = 'round';
    fogCtx.lineWidth = r * 2;
    fogCtx.beginPath();
    fogCtx.moveTo(prevX, prevY);
    fogCtx.lineTo(x, y);
    fogCtx.stroke();
  }

  const grad = fogCtx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, `rgba(0,0,0,${tool.soft})`);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  fogCtx.fillStyle = grad;
  fogCtx.beginPath();
  fogCtx.arc(x, y, r, 0, Math.PI * 2);
  fogCtx.fill();
  fogCtx.restore();

  if (playSound && Math.random() < 0.35) spawnSparkle(x, y);
  if (playSound) GameAudio.playWipe();
}

function spawnSparkle(deviceX, deviceY) {
  const layer = document.getElementById('sparkle-layer');
  const fog = document.getElementById('fog-canvas');
  if (!layer || !fog) return;
  const rect = fog.getBoundingClientRect();
  const cssX = rect.width > 0 ? (deviceX / fog.width) * rect.width : deviceX;
  const cssY = rect.height > 0 ? (deviceY / fog.height) * rect.height : deviceY;
  const el = document.createElement('div');
  el.className = 'sparkle';
  el.style.left = `${cssX}px`;
  el.style.top = `${cssY}px`;
  layer.appendChild(el);
  setTimeout(() => el.remove(), 650);
}

function measureProgress() {
  if (!fogCtx || (state.completedLevel && !state.freePlay)) return;
  const fog = document.getElementById('fog-canvas');
  const w = fog.width;
  const h = fog.height;
  const img = fogCtx.getImageData(0, 0, w, h);
  const d = img.data;
  let clear = 0;
  let total = 0;
  const step = SAMPLE_STEP;

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * 4 + 3;
      total++;
      if (d[i] < 40) clear++;
    }
  }

  const pct = total ? clear / total : 0;
  state.cornerState = measureCorners();
  updateCornerMarkers();
  updateProgress(pct);

  if (pct >= CLEAR_THRESHOLD && !state.completedLevel && !state.freePlay) {
    onLevelComplete();
  }
  schedulePersistLevel();
}

function updateProgress(pct) {
  const fill = document.getElementById('progress-fill');
  const text = document.getElementById('progress-text');
  const v = Math.round(pct * 100);
  if (fill) fill.style.width = `${v}%`;
  if (text) text.textContent = `${v}%`;
}

function onLevelComplete() {
  state.completedLevel = true;
  const badge = document.getElementById('complete-badge');
  badge.hidden = false;
  const lv = currentLevel();
  const label = badge.querySelector('span');
  if (label) label.textContent = lv.secret ? '🌠 彩蛋净了' : '✨ 净了';
  const id = lv.id;
  if (!state.completed.includes(id)) {
    state.completed.push(id);
  }
  if (state.levelIndex >= state.maxUnlocked && state.levelIndex < CleanArt.LEVELS.length - 1) {
    state.maxUnlocked = state.levelIndex + 1;
  }
  save();
  refreshEggStats();
  GameAudio.playComplete();
  checkEggUnlocks();
  enablePlayMode();
  if (lv.secret) showToast(EGG_DONE_MSG[lv.id] || '彩蛋擦净了 ✨');
  else showToast('点一点画面，会有小惊喜 🌿');
}

function nextLevel() {
  const levels = allLevels();
  if (state.levelIndex < levels.length - 1) {
    state.levelIndex++;
    save();
    loadLevel();
  } else {
    state.levelIndex = 0;
    save();
    loadLevel();
    showToast(eggLevels().length ? '全部擦净 · 从头再来' : `${CleanArt.LEVELS.length} 景擦净一轮 · 从头再来`);
  }
}

function loadLevel() {
  const lv = currentLevel();
  const done = state.completed.includes(lv.id);
  state.completedLevel = done && !state.freePlay;
  document.getElementById('level-title').textContent = lv.name;
  document.getElementById('stat-level').textContent = state.freePlay
    ? '🌿 自由擦'
    : lv.secret
      ? '🌠 隐藏彩蛋'
      : `第 ${state.levelIndex + 1} 关`;
  const badge = document.getElementById('complete-badge');
  if (badge) badge.hidden = true;
  disablePlayMode();
  const label = badge?.querySelector('span');
  if (label) label.textContent = state.freePlay ? '🌿 自由玩' : '✨ 净了';
  const hint = document.getElementById('game-hint');
  if (hint) {
    hint.textContent = state.freePlay
      ? '自由擦：慢慢擦，没有过关要求'
      : levelHint(lv);
  }
  stopSceneAnim();
  resetFog();
  const prog = state.levelProgress[lv.id];
  if (!state.freePlay && prog?.alpha && !prog.completedLevel) {
    restoreFogFromProgress(prog);
  } else if (done && !state.freePlay) {
    enablePlayMode();
  }
  drawScene();
  updateCornerMarkers();
  if (!state.freePlay && prog && !prog.completedLevel) {
    updateProgress(prog.progress != null ? prog.progress / 100 : 0);
  }
  document.getElementById('btn-free-play')?.classList.toggle('on', state.freePlay);
  save();
}

function toggleFreePlay() {
  state.freePlay = !state.freePlay;
  loadLevel();
  showToast(state.freePlay ? '自由擦：选景慢慢擦，不计过关' : '已回到闯关模式');
}

function refreshStats() {
  refreshEggStats();
}

function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2400);
}

function closeLevelPicker() {
  const picker = document.getElementById('level-picker');
  if (picker) picker.hidden = true;
}

function pickLevel(index) {
  if (!Number.isFinite(index) || index < 0 || index >= allLevels().length) return;
  const lv = allLevels()[index];
  const mainIndex = CleanArt.LEVELS.findIndex(l => l.id === lv.id);
  if (mainIndex >= 0 && mainIndex > state.maxUnlocked) {
    showToast('这一关还没解锁 · 先净掉前面的景');
    return;
  }
  state.levelIndex = index;
  save();
  loadLevel();
  closeLevelPicker();
}

function wireLevelChip(btn) {
  btn.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    if (btn.disabled) return;
    pickLevel(Number(btn.dataset.levelIndex));
  });
}

function renderEggChip(lv, indexInAll) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'level-chip secret';
  btn.dataset.levelIndex = String(indexInAll);
  const done = state.completed.includes(lv.id);
  btn.innerHTML = `<span class="chip-emoji">${lv.emoji}</span><span class="chip-name">${lv.name}</span>${done ? '<span class="chip-done">✓ 已净</span>' : '<span class="chip-done">✨ 彩蛋</span>'}`;
  wireLevelChip(btn);
  return btn;
}

function renderLevelPicker() {
  const list = document.getElementById('level-list');
  const eggList = document.getElementById('egg-list');
  const eggSection = document.getElementById('egg-section');
  const eggTitle = document.getElementById('egg-section-title');
  if (!list) return;
  renderEggClues();
  list.innerHTML = '';
  CleanArt.LEVELS.forEach((lv, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const locked = i > state.maxUnlocked;
    btn.className = locked ? 'level-chip locked' : 'level-chip';
    btn.dataset.levelIndex = String(i);
    if (locked) btn.disabled = true;
    const done = state.completed.includes(lv.id);
    btn.innerHTML = `<span class="chip-emoji">${lv.emoji}</span><span class="chip-name">${lv.name}</span>${locked ? '<span class="chip-done">🔒</span>' : done ? '<span class="chip-done">✓ 已净</span>' : ''}`;
    wireLevelChip(btn);
    list.appendChild(btn);
  });

  const eggs = eggLevels();
  if (eggSection && eggList) {
    eggSection.hidden = eggs.length === 0;
    eggList.innerHTML = '';
    if (eggTitle) {
      eggTitle.textContent = `隐藏彩蛋 ${eggs.length}/${CleanArt.EGG_LEVELS.length}`;
    }
    eggs.forEach(lv => {
      const idx = allLevels().findIndex(x => x.id === lv.id);
      if (idx >= 0) eggList.appendChild(renderEggChip(lv, idx));
    });
  }
}

function pointerPos(e) {
  const fog = document.getElementById('fog-canvas');
  const rect = fog.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const scaleX = rect.width > 0 ? fog.width / rect.width : 1;
  const scaleY = rect.height > 0 ? fog.height / rect.height : 1;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

function bindWipe() {
  const fog = document.getElementById('fog-canvas');
  if (!fog) return;

  const start = e => {
    if (state.completedLevel) {
      onSceneTap(e);
      return;
    }
    e.preventDefault();
    GameAudio.wake();
    state.wiping = true;
    const p = pointerPos(e);
    state.lastX = p.x;
    state.lastY = p.y;
    wipeAt(p.x, p.y, null, null);
  };

  const move = e => {
    if (!state.wiping || state.completedLevel) return;
    e.preventDefault();
    const p = pointerPos(e);
    wipeStroke(state.lastX, state.lastY, p.x, p.y);
    state.lastX = p.x;
    state.lastY = p.y;
  };

  const end = () => {
    state.wiping = false;
  };

  fog.addEventListener('mousedown', start);
  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);
  fog.addEventListener('touchstart', start, { passive: false });
  window.addEventListener('touchmove', move, { passive: false });
  window.addEventListener('touchend', end);
  window.addEventListener('touchcancel', end);
}

async function startGame() {
  await GameAudio.wake();
  state.started = true;
  document.getElementById('start-screen').hidden = true;
  document.getElementById('game-wrap').hidden = false;
  document.getElementById('footer').hidden = false;
  closeLevelPicker();
  await GameAudio.syncAmbient();
  lastFrameW = 0;
  lastFrameH = 0;
  resizeCanvases(true);
  loadLevel();
}

function onClick(e) {
  const t = e.target.closest('button');
  if (!t || !t.id && !t.dataset.tool && !t.classList.contains('level-chip')) return;

  if (t.id === 'start-btn') {
    startGame();
    return;
  }
  if (t.id === 'next-btn') {
    nextLevel();
    return;
  }
  if (t.id === 'reset-btn') {
    resetFog();
    showToast('重新擦这一景');
    return;
  }
  if (t.id === 'btn-levels') {
    if (!state.started) {
      showToast('先点「开始慢净」');
      return;
    }
    renderLevelPicker();
    document.getElementById('level-picker').hidden = false;
    return;
  }
  if (t.id === 'btn-free-play') {
    if (!state.started) {
      showToast('先点「开始慢净」');
      return;
    }
    toggleFreePlay();
    return;
  }
  if (t.id === 'level-picker-close' || t.id === 'level-picker-back') {
    closeLevelPicker();
    return;
  }
  if (t.classList.contains('level-chip')) {
    pickLevel(Number(t.dataset.levelIndex));
    return;
  }
  if (t.id === 'btn-sfx') {
    state.sfxOn = !state.sfxOn;
    t.classList.toggle('on', state.sfxOn);
    t.setAttribute('aria-pressed', String(state.sfxOn));
    t.textContent = state.sfxOn ? '🔊 音效开' : '🔇 音效关';
    save();
    return;
  }
  if (t.id === 'btn-ambient') {
    state.ambientOn = !state.ambientOn;
    t.classList.toggle('on', state.ambientOn);
    t.setAttribute('aria-pressed', String(state.ambientOn));
    t.textContent = state.ambientOn ? '🌧 雨声开' : '🌧 雨声关';
    void GameAudio.setAmbient(state.ambientOn);
    save();
    const hint = document.getElementById('game-hint');
    if (hint && state.started) hint.textContent = levelHint(currentLevel());
    return;
  }
  if (t.dataset.tool) {
    document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
    t.classList.add('active');
    state.tool = t.dataset.tool;
    const hint = document.getElementById('game-hint');
    if (hint && state.started && !currentLevel().secret) {
      hint.textContent = levelHint(currentLevel());
    }
  }
}

function scheduleResize() {
  if (!state.started) return;
  clearTimeout(resizeDebounce);
  resizeDebounce = setTimeout(() => resizeCanvases(false), 120);
}

function bindUI() {
  document.addEventListener('click', onClick);

  document.getElementById('level-picker')?.addEventListener('click', e => {
    if (e.target.id === 'level-picker') closeLevelPicker();
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLevelPicker();
  });

  window.addEventListener('resize', scheduleResize);

  const frame = document.getElementById('canvas-frame');
  if (window.ResizeObserver && frame) {
    resizeObserver = new ResizeObserver(scheduleResize);
    resizeObserver.observe(frame);
  }
}

function init() {
  if (typeof CleanArt === 'undefined') {
    document.body.innerHTML = '<p style="padding:24px;text-align:center">游戏加载失败，请刷新页面</p>';
    return;
  }

  load();
  refreshEggStats();
  bindUI();
  bindWipe();
  checkEggUnlocks();

  closeLevelPicker();
  document.getElementById('start-screen').hidden = false;
  document.getElementById('game-wrap').hidden = true;
  document.getElementById('footer').hidden = true;

  const sfxBtn = document.getElementById('btn-sfx');
  const ambBtn = document.getElementById('btn-ambient');
  if (sfxBtn) {
    sfxBtn.classList.toggle('on', state.sfxOn);
    sfxBtn.textContent = state.sfxOn ? '🔊 音效开' : '🔇 音效关';
  }
  if (ambBtn) {
    ambBtn.classList.toggle('on', state.ambientOn);
    ambBtn.textContent = state.ambientOn ? '🌧 雨声开' : '🌧 雨声关';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
