/**
 * 白噪音台 — 多轨混音 · 场景 · 定时
 */
const STORAGE_KEY = 'bai_zao_yin_v2';

const PRESETS = {
  rain:    { label: '雨声',   icon: '🌧', color: '#6a9ec8', cat: '自然' },
  thunder: { label: '远雷',   icon: '⛈', color: '#586880', cat: '自然' },
  ocean:   { label: '海浪',   icon: '🌊', color: '#5090b0', cat: '自然' },
  stream:  { label: '溪流',   icon: '💧', color: '#68a8b8', cat: '自然' },
  wind:    { label: '风声',   icon: '🍃', color: '#7aa890', cat: '自然' },
  birds:   { label: '鸟鸣',   icon: '🐦', color: '#88b868', cat: '自然' },
  night:   { label: '虫鸣',   icon: '🌙', color: '#7088a8', cat: '自然' },
  snow:    { label: '雪夜',   icon: '❄', color: '#a8b8c8', cat: '自然' },
  sand:    { label: '沙声',   icon: '🏜', color: '#b89a6a', cat: '自然' },
  fire:    { label: '炉火',   icon: '🔥', color: '#d08050', cat: '室内' },
  cafe:    { label: '咖啡馆', icon: '☕', color: '#a88868', cat: '室内' },
  fan:     { label: '风扇',   icon: '🌀', color: '#8898a8', cat: '室内' },
  clock:   { label: '时钟',   icon: '🕰', color: '#9890a0', cat: '室内' },
  train:   { label: '火车',   icon: '🚂', color: '#787880', cat: '节奏' },
  keyboard:{ label: '键盘',   icon: '⌨', color: '#8090a0', cat: '节奏' },
};

const SCENES = {
  rainNight:  { label: '雨夜',   icon: '🌧', desc: '雨 + 远雷', mix: { rain: 0.7, thunder: 0.35, wind: 0.12 } },
  seaside:    { label: '海边',   icon: '🏖', desc: '浪 + 海鸥', mix: { ocean: 0.78, wind: 0.22, birds: 0.4 } },
  forest:     { label: '森林',   icon: '🌲', desc: '溪水 + 鸟叫', mix: { stream: 0.78, birds: 0.72, wind: 0.06 } },
  winter:     { label: '冬夜',   icon: '🔥', desc: '炉火 + 窗外雪', mix: { fire: 0.82, snow: 0.58, night: 0.12 } },
  cafeRain:   { label: '窗雨咖啡', icon: '☕', desc: '人声 + 窗外雨', mix: { cafe: 0.58, rain: 0.48, clock: 0.1 } },
  focus:      { label: '专注',   icon: '📖', desc: '风扇 + 敲键 + 秒针', mix: { fan: 0.5, keyboard: 0.62, clock: 0.4 } },
  nap:        { label: '午睡',   icon: '💤', desc: '闷雪 + 细沙 + 虫鸣', mix: { snow: 0.65, sand: 0.42, night: 0.12 } },
  zen:        { label: '枯山水', icon: '🏜', desc: '耙沙 + 细流', mix: { sand: 0.72, stream: 0.38, wind: 0.05 } },
};

const state = {
  playing: false,
  master: 0.7,
  layers: {},
  timerMin: 0,
  timerEnd: 0,
  activeScene: '',
  filterCat: '全部',
};

let ac = null;
let masterGain = null;
let layerNodes = {};
const tickTimers = {};
let countdownTimer = null;
let fadeTimer = null;

function defaultLayers() {
  const out = {};
  for (const id of Object.keys(PRESETS)) out[id] = { on: false, vol: 0.55 };
  return out;
}

function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('bai_zao_yin_v1');
    if (!raw) return;
    const d = JSON.parse(raw);
    if (Number.isFinite(d.master)) state.master = Math.max(0, Math.min(1, d.master));
    if (Number.isFinite(d.timerMin)) state.timerMin = d.timerMin | 0;
    if (d.activeScene && SCENES[d.activeScene]) state.activeScene = d.activeScene;
    if (d.layers) {
      for (const id of Object.keys(PRESETS)) {
        if (d.layers[id]) {
          state.layers[id] = {
            on: !!d.layers[id].on,
            vol: Math.max(0, Math.min(1, Number(d.layers[id].vol) || 0.55)),
          };
        }
      }
    }
  } catch (e) {}
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      master: state.master,
      timerMin: state.timerMin,
      layers: state.layers,
      activeScene: state.activeScene,
    }));
  } catch (e) {}
}

function ensureAudio() {
  if (!ac) {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ac.createGain();
    masterGain.gain.value = state.master;
    masterGain.connect(ac.destination);
  }
  if (ac.state === 'suspended') ac.resume();
}

function noiseBuffer(seconds = 3) {
  const len = Math.floor(ac.sampleRate * seconds);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function burst(t, dur, vol, filterHz, type = 'lowpass') {
  const len = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  const f = ac.createBiquadFilter();
  f.type = type;
  f.frequency.value = filterHz;
  src.connect(f).connect(g).connect(masterGain);
  src.start(t);
  src.stop(t + dur + 0.02);
}

function toneBurst(t, freq, dur, vol) {
  const src = ac.createOscillator();
  const g = ac.createGain();
  src.type = 'sine';
  src.frequency.setValueAtTime(freq, t);
  src.frequency.exponentialRampToValueAtTime(freq * 0.92, t + dur);
  g.gain.setValueAtTime(0.001, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(g).connect(masterGain);
  src.start(t);
  src.stop(t + dur + 0.02);
}

function ensureTick(id, fn, ms) {
  if (tickTimers[id]) return;
  tickTimers[id] = setInterval(fn, ms);
}

function clearTick(id) {
  if (tickTimers[id]) {
    clearInterval(tickTimers[id]);
    delete tickTimers[id];
  }
}

function clearAllTicks() {
  for (const id of Object.keys(tickTimers)) clearTick(id);
}

function stopLayer(id) {
  const nodes = layerNodes[id];
  if (!nodes) return;
  try {
    nodes.sources?.forEach(s => { try { s.stop(); } catch (e) {} });
    nodes.extras?.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch (e) {} });
  } catch (e) {}
  delete layerNodes[id];
  clearTick(id);
}

function setLayerVolume(id, vol) {
  const nodes = layerNodes[id];
  if (nodes?.gain) nodes.gain.gain.setTargetAtTime(vol, ac.currentTime, 0.08);
}

function layerVol(id) {
  return state.layers[id]?.vol || 0.55;
}

function layerOn(id) {
  return !!(state.playing && state.layers[id]?.on);
}

function loopNoise(gain, hp, lp, bp) {
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(4);
  src.loop = true;
  let node = src;
  if (hp) {
    const f = ac.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = hp;
    node.connect(f);
    node = f;
  }
  if (bp) {
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = bp.f;
    f.Q.value = bp.q || 0.7;
    node.connect(f);
    node = f;
  }
  if (lp) {
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = lp;
    node.connect(f);
    node = f;
  }
  node.connect(gain);
  src.start();
  return { gain, sources: [src], extras: [] };
}

function startLayer(id) {
  stopLayer(id);
  ensureAudio();
  const vol = layerVol(id);
  const gain = ac.createGain();
  gain.gain.value = vol;
  gain.connect(masterGain);
  let nodes;

  switch (id) {
    case 'rain':
      nodes = loopNoise(gain, null, 1200);
      ensureTick('rain', () => {
        if (!layerOn('rain')) return;
        burst(ac.currentTime, 0.045, 0.045 * layerVol('rain'), 1800);
      }, 240);
      break;
    case 'thunder':
      nodes = { gain, sources: [], extras: [] };
      ensureTick('thunder', () => {
        if (!layerOn('thunder') || Math.random() > 0.18) return;
        const t = ac.currentTime;
        const v = layerVol('thunder') * 0.5;
        burst(t, 1.8, v, 120, 'lowpass');
        burst(t + 0.1, 2.4, v * 0.7, 80, 'lowpass');
      }, 2200);
      break;
    case 'ocean':
      nodes = loopNoise(gain, null, 680);
      { const lfo = ac.createOscillator(); const lg = ac.createGain(); lg.gain.value = 0.38;
        lfo.frequency.value = 0.1; lfo.connect(lg).connect(gain.gain); lfo.start(); nodes.extras = [lfo]; }
      break;
    case 'stream':
      nodes = loopNoise(gain, 320, 3200);
      ensureTick('stream', () => {
        if (!layerOn('stream') || Math.random() > 0.5) return;
        burst(ac.currentTime, 0.06, 0.025 * layerVol('stream'), 2400, 'bandpass');
      }, 380);
      break;
    case 'wind': {
      const src = ac.createBufferSource();
      src.buffer = noiseBuffer(4);
      src.loop = true;
      const bp = ac.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 380;
      bp.Q.value = 0.55;
      src.connect(bp).connect(gain);
      src.start();
      const lfo = ac.createOscillator();
      const lg = ac.createGain();
      lg.gain.value = 160;
      lfo.frequency.value = 0.06;
      lfo.connect(lg).connect(bp.frequency);
      lfo.start();
      nodes = { gain, sources: [src], extras: [lfo] };
      break;
    }
    case 'birds':
      nodes = { gain, sources: [], extras: [] };
      ensureTick('birds', () => {
        if (!layerOn('birds') || Math.random() > 0.55) return;
        const freqs = [880, 990, 1100, 1320, 1540];
        toneBurst(ac.currentTime, freqs[Math.random() * freqs.length | 0], 0.12 + Math.random() * 0.08, 0.022 * layerVol('birds'));
      }, 700);
      break;
    case 'night':
      nodes = loopNoise(gain, 4000, 9000);
      ensureTick('night', () => {
        if (!layerOn('night') || Math.random() > 0.55) return;
        toneBurst(ac.currentTime, 4200 + Math.random() * 800, 0.04, 0.012 * layerVol('night'));
      }, 520);
      break;
    case 'snow':
      nodes = loopNoise(gain, null, 280);
      break;
    case 'sand':
      nodes = loopNoise(gain, null, 420);
      break;
    case 'fire':
      nodes = loopNoise(gain, 180, 2400);
      ensureTick('fire', () => {
        if (!layerOn('fire') || Math.random() > 0.5) return;
        burst(ac.currentTime, 0.07, 0.04 * layerVol('fire'), 2000);
      }, 400);
      break;
    case 'cafe':
      nodes = loopNoise(gain, 200, 900);
      { const lfo = ac.createOscillator(); const lg = ac.createGain(); lg.gain.value = 0.08;
        lfo.frequency.value = 0.25; lfo.connect(lg).connect(gain.gain); lfo.start(); nodes.extras = [lfo]; }
      break;
    case 'fan': {
      const src = ac.createBufferSource();
      src.buffer = noiseBuffer(4);
      src.loop = true;
      const bp = ac.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 220;
      bp.Q.value = 0.85;
      src.connect(bp).connect(gain);
      src.start();
      nodes = { gain, sources: [src], extras: [] };
      break;
    }
    case 'clock':
      nodes = { gain, sources: [], extras: [] };
      ensureTick('clock', () => {
        if (!layerOn('clock')) return;
        const t = ac.currentTime;
        const v = layerVol('clock');
        toneBurst(t, 1200, 0.025, 0.032 * v);
        toneBurst(t + 0.04, 520, 0.08, 0.022 * v);
      }, 1000);
      break;
    case 'train':
      nodes = loopNoise(gain, null, 500);
      { const lfo = ac.createOscillator(); const lg = ac.createGain(); lg.gain.value = 0.45;
        lfo.frequency.value = 1.1; lfo.connect(lg).connect(gain.gain); lfo.start(); nodes.extras = [lfo]; }
      ensureTick('train', () => {
        if (!layerOn('train') || Math.random() > 0.35) return;
        burst(ac.currentTime, 0.15, 0.06 * layerVol('train'), 300);
      }, 1800);
      break;
    case 'keyboard':
      nodes = { gain, sources: [], extras: [] };
      ensureTick('keyboard', () => {
        if (!layerOn('keyboard')) return;
        const n = 1 + (Math.random() * 3 | 0);
        for (let i = 0; i < n; i++) {
          setTimeout(() => {
            if (!layerOn('keyboard')) return;
            burst(ac.currentTime, 0.018 + Math.random() * 0.02, 0.028 * layerVol('keyboard'), 2800 + Math.random() * 1200, 'bandpass');
          }, i * (40 + Math.random() * 90));
        }
      }, 420);
      break;
    default:
      nodes = loopNoise(gain, null, 800);
  }

  layerNodes[id] = nodes;
}

function anyLayerOn() {
  return Object.keys(PRESETS).some(id => state.layers[id]?.on);
}

function syncLayers() {
  for (const id of Object.keys(PRESETS)) {
    if (state.playing && state.layers[id]?.on) startLayer(id);
    else stopLayer(id);
  }
}

function stopAll() {
  state.playing = false;
  for (const id of Object.keys(PRESETS)) stopLayer(id);
  clearAllTicks();
  clearTimeout(fadeTimer);
  fadeTimer = null;
  state.timerEnd = 0;
  updateUI();
}

function fadeOutAndStop(ms = 1800) {
  if (!masterGain || !ac) { stopAll(); return; }
  masterGain.gain.setTargetAtTime(0.001, ac.currentTime, ms / 4000);
  clearTimeout(fadeTimer);
  fadeTimer = setTimeout(() => {
    if (masterGain) masterGain.gain.value = state.master;
    stopAll();
  }, ms);
}

function applyScene(sceneId) {
  const scene = SCENES[sceneId];
  if (!scene) return;
  state.activeScene = sceneId;
  for (const id of Object.keys(PRESETS)) {
    state.layers[id].on = false;
    state.layers[id].vol = 0.55;
  }
  for (const [id, vol] of Object.entries(scene.mix)) {
    if (!state.layers[id]) state.layers[id] = { on: false, vol: 0.55 };
    state.layers[id].on = true;
    state.layers[id].vol = Math.max(0.08, Math.min(1, vol));
  }
  renderCards();
  if (state.playing) syncLayers();
  updateUI();
  saveProgress();
}

function clearSceneHighlight() {
  state.activeScene = '';
  document.querySelectorAll('.scene-chip').forEach(c => c.classList.remove('active'));
}

function startPlay() {
  if (!anyLayerOn()) applyScene('rainNight');
  ensureAudio();
  state.playing = true;
  if (masterGain) masterGain.gain.setTargetAtTime(state.master, ac.currentTime, 0.05);
  syncLayers();
  startCountdown();
  updateUI();
  saveProgress();
}

function togglePlay() {
  if (state.playing) fadeOutAndStop();
  else startPlay();
}

function startCountdown() {
  clearInterval(countdownTimer);
  if (!state.timerMin) { updateTimerLabel(); return; }
  state.timerEnd = Date.now() + state.timerMin * 60 * 1000;
  countdownTimer = setInterval(() => {
    if (!state.timerEnd) return;
    if (state.timerEnd - Date.now() <= 0) {
      clearInterval(countdownTimer);
      fadeOutAndStop(2500);
      return;
    }
    updateTimerLabel();
  }, 1000);
  updateTimerLabel();
}

function updateTimerLabel() {
  const el = document.getElementById('timer-left');
  if (!el) return;
  if (!state.timerEnd || !state.playing) {
    el.textContent = state.timerMin ? `已设 ${state.timerMin} 分钟定时` : '';
    return;
  }
  const sec = Math.max(0, Math.ceil((state.timerEnd - Date.now()) / 1000));
  el.textContent = `剩余 ${(sec / 60 | 0)}:${String(sec % 60).padStart(2, '0')} 后渐弱停止`;
}

function updateAmbientBg() {
  const bg = document.getElementById('ambient-bg');
  if (!bg) return;
  const active = Object.keys(PRESETS).filter(id => state.layers[id]?.on);
  bg.classList.toggle('playing', state.playing);
  if (!active.length) {
    bg.style.background = 'radial-gradient(ellipse 80% 60% at 50% 40%, #1a2838 0%, #0e1218 70%)';
    return;
  }
  bg.style.background = `radial-gradient(ellipse 90% 70% at 50% 35%, ${PRESETS[active[0]].color}33 0%, ${PRESETS[active[active.length - 1]].color}18 45%, #0e1218 75%)`;
}

function updateUI() {
  const btn = document.getElementById('play-btn');
  if (btn) {
    btn.textContent = state.playing ? '⏹ 停止' : '▶ 播放';
    btn.classList.toggle('on', state.playing);
  }
  const status = document.getElementById('status-line');
  if (status) {
    const n = Object.keys(PRESETS).filter(id => state.layers[id]?.on).length;
    const scene = state.activeScene && SCENES[state.activeScene];
    status.textContent = state.playing
      ? (scene ? `场景「${scene.label}」· ${n} 轨` : (n ? `正在混音 ${n} 轨` : '选声音或场景'))
      : '点场景一键混音，或自己勾选单轨';
  }
  document.querySelectorAll('.sound-card').forEach(card => {
    card.classList.toggle('on', !!state.layers[card.dataset.id]?.on);
  });
  document.querySelectorAll('.timer-chip').forEach(chip => {
    chip.classList.toggle('active', (chip.dataset.min | 0) === state.timerMin);
  });
  document.querySelectorAll('.cat-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.cat === state.filterCat);
  });
  document.querySelectorAll('.scene-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.scene === state.activeScene);
  });
  updateAmbientBg();
  updateTimerLabel();
}

function renderScenes() {
  const row = document.getElementById('scene-row');
  if (!row) return;
  row.innerHTML = '';
  for (const [id, s] of Object.entries(SCENES)) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'scene-chip';
    btn.dataset.scene = id;
    btn.textContent = s.desc ? `${s.icon} ${s.label} · ${s.desc}` : `${s.icon} ${s.label}`;
    btn.addEventListener('click', () => applyScene(id));
    row.appendChild(btn);
  }
}

function renderCatFilters() {
  const row = document.getElementById('cat-row');
  if (!row) return;
  const cats = ['全部', '自然', '室内', '节奏'];
  row.innerHTML = '';
  for (const cat of cats) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cat-chip';
    btn.dataset.cat = cat;
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      state.filterCat = cat;
      renderCards();
      updateUI();
    });
    row.appendChild(btn);
  }
}

function renderCards() {
  const grid = document.getElementById('sound-grid');
  if (!grid) return;
  grid.innerHTML = '';
  for (const [id, p] of Object.entries(PRESETS)) {
    if (state.filterCat !== '全部' && p.cat !== state.filterCat) continue;
    const card = document.createElement('div');
    card.className = 'sound-card';
    card.dataset.id = id;
    card.style.setProperty('--card-accent', p.color);
    card.innerHTML = `
      <div class="ico">${p.icon}</div>
      <div class="name">${p.label}</div>
      <div class="cat-tag">${p.cat}</div>
      <input type="range" min="0" max="100" value="${Math.round((state.layers[id]?.vol || 0.55) * 100)}" aria-label="${p.label}音量">
    `;
    card.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT') return;
      clearSceneHighlight();
      state.layers[id].on = !state.layers[id].on;
      if (state.playing) {
        if (state.layers[id].on) startLayer(id);
        else stopLayer(id);
      }
      updateUI();
      saveProgress();
    });
    const slider = card.querySelector('input');
    slider.addEventListener('input', (e) => {
      e.stopPropagation();
      clearSceneHighlight();
      state.layers[id].vol = slider.value / 100;
      setLayerVolume(id, state.layers[id].vol);
      saveProgress();
    });
    slider.addEventListener('click', e => e.stopPropagation());
    grid.appendChild(card);
  }
}

function wireUI() {
  document.getElementById('play-btn')?.addEventListener('click', togglePlay);
  document.getElementById('master-vol')?.addEventListener('input', (e) => {
    state.master = e.target.value / 100;
    if (masterGain) masterGain.gain.setTargetAtTime(state.master, ac?.currentTime || 0, 0.06);
    saveProgress();
  });
  document.querySelectorAll('.timer-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.timerMin = chip.dataset.min | 0;
      if (state.playing) startCountdown();
      else updateTimerLabel();
      updateUI();
      saveProgress();
    });
  });
  window.addEventListener('pagehide', saveProgress);
}

function init() {
  state.layers = defaultLayers();
  loadSave();
  for (const id of Object.keys(PRESETS)) {
    if (!state.layers[id]) state.layers[id] = { on: false, vol: 0.55 };
  }
  renderScenes();
  renderCatFilters();
  renderCards();
  wireUI();
  const masterEl = document.getElementById('master-vol');
  if (masterEl) masterEl.value = Math.round(state.master * 100);
  updateUI();
}

document.addEventListener('DOMContentLoaded', init);
