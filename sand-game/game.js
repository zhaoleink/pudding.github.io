/**
 * 静沙 — 耙沙纹 · 解压
 * 按住拖动，在沙盘上划出纹路；不是擦、不是戳泡。
 */
const STORAGE_KEY = 'jing_sha_v3';

const TOOLS = {
  narrow: { label: '细耙', icon: '〰️', radius: 6, strength: 38 },
  wide:   { label: '宽耙', icon: '≡', radius: 22, strength: 28, useMs: 10000, cooldownMs: 9500 },
  wave:   { label: '波纹', icon: '🌊', radius: 10, strength: 32, wave: true },
};

const WIDE_USE_MS = TOOLS.wide.useMs;
const WIDE_COOLDOWN_MS = TOOLS.wide.cooldownMs;

const SAND_BASE = [152, 128, 96];
const SAND_LIGHT = [218, 206, 182];

const SAND_TEMPLATES = [
  {
    id: 'enso',
    name: '圆相',
    points: Array.from({ length: 48 }, (_, i) => {
      const a = (i / 48) * Math.PI * 2;
      return { x: 0.5 + Math.cos(a) * 0.28, y: 0.5 + Math.sin(a) * 0.22 };
    }),
  },
  {
    id: 'wave',
    name: '波纹',
    points: Array.from({ length: 40 }, (_, i) => ({
      x: 0.12 + (i / 39) * 0.76,
      y: 0.5 + Math.sin(i * 0.45) * 0.14,
    })),
  },
  {
    id: 'moon',
    name: '月弧',
    points: Array.from({ length: 36 }, (_, i) => {
      const a = Math.PI * 0.15 + (i / 35) * Math.PI * 0.7;
      return { x: 0.5 + Math.cos(a) * 0.3, y: 0.55 + Math.sin(a) * 0.24 };
    }),
  },
];

const state = {
  tool: 'narrow',
  mode: 'rake',
  wiping: false,
  lastX: 0,
  lastY: 0,
  wavePhase: 0,
  totalRaked: 0,
  resetAnim: null,
  wideUseUntil: 0,
  wideCooldownUntil: 0,
  templateId: null,
  templateMatch: 0,
};

const MAX_FIELD_DIM = 640;

let canvas, ctx;
let sandCanvas = null;
let fieldW = 0;
let fieldH = 0;
let sandField = null;
let stones = [];
let draggedStone = null;
let dpr = 1;
let displayW = 0;
let displayH = 0;
let animId = null;
let grainSeed = Math.random() * 1000;
let lastSandSoundAt = 0;
let saveDebounce = null;
let pendingSave = null;
let wideTimer = null;

const sandAudio = {
  ctx: null,
  wake() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  },
  softRake() {
    const now = performance.now();
    if (now - lastSandSoundAt < 160) return;
    lastSandSoundAt = now;
    this.wake();
    if (!this.ctx) return;
    const ac = this.ctx;
    const t = ac.currentTime;
    const len = Math.floor(ac.sampleRate * 0.05);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      lp += 0.06 * ((Math.random() * 2 - 1) * (1 - i / len) - lp);
      d[i] = lp;
    }
    const src = ac.createBufferSource();
    src.buffer = buf;
    const filt = ac.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 520;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(0.028, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    src.connect(filt).connect(g).connect(ac.destination);
    src.start(t);
    src.stop(t + 0.06);
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

function defaultStones() {
  return [
    { x: 0.28, y: 0.38, r: 0.055, shade: 0.15 },
    { x: 0.62, y: 0.52, r: 0.07, shade: 0.22 },
    { x: 0.44, y: 0.68, r: 0.048, shade: 0.12 },
  ];
}

function sampleFieldBilinear(src, srcW, srcH, u, v) {
  const x = Math.max(0, Math.min(srcW - 1.001, u));
  const y = Math.max(0, Math.min(srcH - 1.001, v));
  const x0 = x | 0;
  const y0 = y | 0;
  const x1 = Math.min(srcW - 1, x0 + 1);
  const y1 = Math.min(srcH - 1, y0 + 1);
  const tx = x - x0;
  const ty = y - y0;
  const i00 = y0 * srcW + x0;
  const i10 = y0 * srcW + x1;
  const i01 = y1 * srcW + x0;
  const i11 = y1 * srcW + x1;
  return (src[i00] * (1 - tx) + src[i10] * tx) * (1 - ty)
       + (src[i01] * (1 - tx) + src[i11] * tx) * ty;
}

function restoreFieldToCurrent(data) {
  if (!sandField || !data) return;

  if (data.field) {
    try {
      const src = base64ToBytes(data.field);
      const srcW = data.fieldW | 0;
      const srcH = data.fieldH | 0;
      if (srcW > 0 && srcH > 0 && srcW <= MAX_FIELD_DIM && srcH <= MAX_FIELD_DIM
          && src.length >= srcW * srcH) {
        if (srcW === fieldW && srcH === fieldH) {
          for (let i = 0; i < sandField.length; i++) sandField[i] = src[i] || 0;
        } else {
          for (let y = 0; y < fieldH; y++) {
            for (let x = 0; x < fieldW; x++) {
              const u = (x + 0.5) / fieldW * srcW - 0.5;
              const v = (y + 0.5) / fieldH * srcH - 0.5;
              sandField[y * fieldW + x] = sampleFieldBilinear(src, srcW, srcH, u, v);
            }
          }
        }
        return;
      }
    } catch (e) {}
  }

  if (!data.grid || !data.sw || !data.sh) return;
  try {
    const grid = base64ToBytes(data.grid);
    const sw = data.sw | 0;
    const sh = data.sh | 0;
    for (let y = 0; y < fieldH; y++) {
      for (let x = 0; x < fieldW; x++) {
        const u = (x + 0.5) / fieldW * sw - 0.5;
        const v = (y + 0.5) / fieldH * sh - 0.5;
        sandField[y * fieldW + x] = sampleFieldBilinear(grid, sw, sh, u, v);
      }
    }
  } catch (e) {}
}

function captureSaveData() {
  if (!sandField || fieldW < 1 || fieldH < 1) return null;

  const field = new Uint8Array(sandField.length);
  for (let i = 0; i < sandField.length; i++) {
    field[i] = Math.min(255, sandField[i]) | 0;
  }

  return {
    version: 3,
    totalRaked: state.totalRaked | 0,
    tool: state.tool,
    templateId: state.templateId,
    templateMatch: state.templateMatch,
    mode: state.mode,
    wavePhase: state.wavePhase,
    grainSeed,
    fieldW,
    fieldH,
    field: bytesToBase64(field),
    stones: stones.map(st => ({
      x: st.x,
      y: st.y,
      r: st.r,
      shade: st.shade,
    })),
    wideUseUntil: state.wideUseUntil | 0,
    wideCooldownUntil: state.wideCooldownUntil | 0,
  };
}

function applySaveData(d) {
  if (!d || !sandField) return;

  if (Number.isFinite(d.totalRaked) && d.totalRaked >= 0) state.totalRaked = d.totalRaked | 0;
  if (typeof d.templateId === 'string' || d.templateId === null) state.templateId = d.templateId || null;
  if (Number.isFinite(d.templateMatch)) state.templateMatch = d.templateMatch;
  if (Number.isFinite(d.wavePhase)) state.wavePhase = d.wavePhase;
  if (Number.isFinite(d.grainSeed)) grainSeed = d.grainSeed;

  const now = Date.now();
  state.wideUseUntil = (d.wideUseUntil | 0) > now ? (d.wideUseUntil | 0) : 0;
  state.wideCooldownUntil = (d.wideCooldownUntil | 0) > now ? (d.wideCooldownUntil | 0) : 0;

  if (Array.isArray(d.stones) && d.stones.length) {
    stones = d.stones
      .filter(st => Number.isFinite(st.x) && Number.isFinite(st.y))
      .map(st => ({
        x: Math.max(0.04, Math.min(0.96, st.x)),
        y: Math.max(0.04, Math.min(0.96, st.y)),
        r: Math.max(0.03, Math.min(0.12, st.r || 0.05)),
        shade: st.shade || 0,
      }));
  }

  restoreFieldToCurrent(d);

  let toolKey = d.mode === 'stone' ? 'stone' : (TOOLS[d.tool] ? d.tool : 'narrow');
  if (toolKey === 'wide' && (wideOnCooldown() || !wideSessionActive())) {
    toolKey = 'narrow';
  }
  setTool(toolKey, true);
}

function loadSave() {
  try {
    for (const key of [STORAGE_KEY, 'jing_sha_v2', 'jing_sha_v1']) {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    }
    return null;
  } catch (e) {
    return null;
  }
}

function saveProgress() {
  try {
    const data = captureSaveData();
    if (!data) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
}

function scheduleSave() {
  clearTimeout(saveDebounce);
  saveDebounce = setTimeout(saveProgress, 500);
}

function syncStats() {
  const el = document.getElementById('stat-raked');
  if (el) el.textContent = String(state.totalRaked);
}

function wideOnCooldown(now = Date.now()) {
  return state.wideCooldownUntil > now;
}

function wideRemainingMs(now = Date.now()) {
  return Math.max(0, state.wideUseUntil - now);
}

function wideSessionActive(now = Date.now()) {
  return state.wideUseUntil > now;
}

function reconcileWideState() {
  const now = Date.now();
  if (state.wideCooldownUntil > 0 && state.wideCooldownUntil <= now) {
    state.wideCooldownUntil = 0;
  }
  if (state.wideUseUntil > 0 && state.wideUseUntil <= now) {
    state.wideUseUntil = 0;
    if (state.tool === 'wide' && !wideOnCooldown(now)) {
      state.wideCooldownUntil = now + WIDE_COOLDOWN_MS;
    }
  }
  if (state.tool === 'wide' && !wideSessionActive(now) && !wideOnCooldown(now)) {
    state.tool = 'narrow';
    state.mode = 'rake';
    document.getElementById('canvas-wrap')?.classList.remove('stone-mode');
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === 'narrow');
    });
  }
}

function formatCdSec(msLeft) {
  return (Math.max(0, msLeft) / 1000).toFixed(1);
}

function setHint(msg) {
  const el = document.getElementById('hint');
  if (el) el.textContent = msg;
}

function syncHintForTool() {
  if (wideOnCooldown()) return;
  if (state.mode === 'stone') {
    setHint('拖动石头 · 点空白处可再放一块');
  } else if (state.tool === 'wide' && wideSessionActive()) {
    setHint(`宽耙 · 剩余 ${formatCdSec(wideRemainingMs())} 秒`);
  } else if (TOOLS[state.tool]?.wave) {
    setHint('按住拖动 · 耙出波纹纹路');
  } else {
    setHint('按住拖动 · 像耙沙子一样划开纹路');
  }
}

function startWideSession() {
  state.wideUseUntil = Date.now() + WIDE_USE_MS;
  state.wideCooldownUntil = 0;
  syncWideUI();
  startWideTimer();
  scheduleSave();
}

function endWideSession(withCooldown) {
  state.wideUseUntil = 0;
  if (withCooldown) {
    state.wideCooldownUntil = Date.now() + WIDE_COOLDOWN_MS;
  }
  syncWideUI();
  startWideTimer();
  scheduleSave();
}

function syncWideUI() {
  const btn = document.querySelector('.tool-btn[data-tool="wide"]');
  const normalFace = document.getElementById('wide-normal');
  const cooldownFace = document.getElementById('wide-cooldown-face');
  const cdEl = document.getElementById('wide-cd');
  if (!btn) return;

  const now = Date.now();
  btn.classList.remove('cooldown', 'wide-active');

  if (wideOnCooldown(now)) {
    btn.classList.add('cooldown');
    btn.disabled = true;
    const left = formatCdSec(state.wideCooldownUntil - now);
    if (normalFace) normalFace.hidden = true;
    if (cooldownFace) {
      cooldownFace.hidden = false;
      cooldownFace.textContent = `${left}秒`;
    }
    if (cdEl) cdEl.textContent = '';
  } else {
    if (normalFace) normalFace.hidden = false;
    if (cooldownFace) cooldownFace.hidden = true;

    if (state.tool === 'wide' && wideSessionActive(now)) {
      btn.classList.add('wide-active');
      btn.disabled = false;
      const left = formatCdSec(wideRemainingMs(now));
      if (cdEl) cdEl.textContent = `${left}秒`;
      setHint(`宽耙 · 剩余 ${left} 秒`);
    } else {
      btn.disabled = false;
      if (cdEl) cdEl.textContent = '';
      syncHintForTool();
    }
  }
}

function stopWideTimer() {
  if (wideTimer) {
    clearInterval(wideTimer);
    wideTimer = null;
  }
}

function startWideTimer() {
  stopWideTimer();
  const now = Date.now();
  if (!wideOnCooldown(now) && !(state.tool === 'wide' && wideSessionActive(now))) return;

  wideTimer = setInterval(() => {
    const t = Date.now();
    if (state.resetAnim) {
      syncWideUI();
      return;
    }
    if (state.tool === 'wide' && state.wideUseUntil && t >= state.wideUseUntil) {
      endWideSession(true);
      setTool('narrow', true);
      return;
    }
    syncWideUI();
    if (!wideOnCooldown(t) && !(state.tool === 'wide' && wideSessionActive(t))) {
      stopWideTimer();
    }
  }, 100);
  syncWideUI();
}

function canRakeWithCurrentTool() {
  if (state.tool !== 'wide') return true;
  return wideSessionActive();
}

function initField(w, h, keepStones) {
  fieldW = w;
  fieldH = h;
  sandField = new Float32Array(w * h);
  for (let i = 0; i < sandField.length; i++) {
    sandField[i] = Math.random() * 8;
  }
  if (!keepStones) stones = defaultStones();
}

function fieldIndex(x, y) {
  const ix = x | 0;
  const iy = y | 0;
  if (ix < 0 || iy < 0 || ix >= fieldW || iy >= fieldH) return -1;
  return iy * fieldW + ix;
}

function rakeAt(fx, fy, toolKey) {
  if (toolKey === 'wide' && !canRakeWithCurrentTool()) return;
  const t = TOOLS[toolKey];
  const r = t.radius;
  const r2 = r * r;
  const cx = fx | 0;
  const cy = fy | 0;
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r2) continue;
      const idx = fieldIndex(cx + dx, cy + dy);
      if (idx < 0) continue;
      const falloff = 1 - Math.sqrt(dx * dx + dy * dy) / (r + 0.001);
      sandField[idx] = Math.min(255, sandField[idx] + t.strength * falloff);
    }
  }
}

function rakeLine(x0, y0, x1, y1) {
  const t = TOOLS[state.tool];
  const dist = Math.hypot(x1 - x0, y1 - y0);
  const steps = Math.max(1, Math.ceil(dist / 2));
  let scratched = false;

  for (let i = 0; i <= steps; i++) {
    const p = i / steps;
    let x = x0 + (x1 - x0) * p;
    let y = y0 + (y1 - y0) * p;

    if (t.wave) {
      const angle = Math.atan2(y1 - y0, x1 - x0);
      const wave = Math.sin(state.wavePhase + p * dist * 0.08) * 14;
      x += Math.cos(angle + Math.PI / 2) * wave;
      y += Math.sin(angle + Math.PI / 2) * wave;
    }

    rakeAt(x, y, state.tool);
    scratched = true;
  }

  if (scratched) {
    state.totalRaked += dist | 0;
    state.wavePhase += dist * 0.12;
    if (dist > 2) sandAudio.softRake();
    scheduleSave();
  }
}

function activeTemplate() {
  return SAND_TEMPLATES.find(t => t.id === state.templateId) || null;
}

function templateFieldPoints(tmpl) {
  if (!tmpl || fieldW < 1 || fieldH < 1) return [];
  return tmpl.points.map(p => ({ x: p.x * fieldW, y: p.y * fieldH }));
}

function updateTemplateMatch() {
  const tmpl = activeTemplate();
  if (!tmpl || !sandField) {
    state.templateMatch = 0;
    return;
  }
  const pts = templateFieldPoints(tmpl);
  let hit = 0;
  for (const p of pts) {
    const ix = Math.max(0, Math.min(fieldW - 1, Math.round(p.x)));
    const iy = Math.max(0, Math.min(fieldH - 1, Math.round(p.y)));
    if ((sandField[iy * fieldW + ix] | 0) > 18) hit += 1;
  }
  state.templateMatch = pts.length ? hit / pts.length : 0;
  syncTemplateUI();
}

function syncTemplateUI() {
  const el = document.getElementById('template-progress');
  if (!el) return;
  const tmpl = activeTemplate();
  if (!tmpl) {
    el.hidden = true;
    return;
  }
  el.hidden = false;
  el.textContent = `跟划「${tmpl.name}」· 贴合 ${Math.round(state.templateMatch * 100)}%`;
}

function drawTemplateGuide() {
  const tmpl = activeTemplate();
  if (!tmpl || !ctx) return;
  const pts = templateFieldPoints(tmpl);
  if (pts.length < 2) return;
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.strokeStyle = 'rgba(240, 232, 208, 0.42)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 8]);
  ctx.beginPath();
  ctx.moveTo(pts[0].x / fieldW * displayW, pts[0].y / fieldH * displayH);
  for (let i = 1; i < pts.length; i += 1) {
    ctx.lineTo(pts[i].x / fieldW * displayW, pts[i].y / fieldH * displayH);
  }
  if (tmpl.id === 'enso') ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function openTemplatePicker() {
  const el = document.getElementById('template-picker');
  if (!el) return;
  el.hidden = false;
  el.innerHTML = SAND_TEMPLATES.map(t =>
    `<button type="button" class="template-pick" data-template="${t.id}">${t.name}</button>`
  ).join('') + '<button type="button" class="template-pick ghost" data-template="">关闭跟划</button>';
  el.querySelectorAll('.template-pick').forEach(btn => {
    btn.addEventListener('click', () => {
      state.templateId = btn.dataset.template || null;
      state.templateMatch = 0;
      el.hidden = true;
      syncTemplateUI();
      renderSand();
      setHint(state.templateId ? '沿着淡线跟划 · 贴合越高越好' : '按住拖动 · 像耙沙子一样划开纹路');
      scheduleSave();
    });
  });
}

function renderSand() {
  if (!ctx || !sandField) return;

  if (!sandCanvas) sandCanvas = document.createElement('canvas');
  if (sandCanvas.width !== fieldW || sandCanvas.height !== fieldH) {
    sandCanvas.width = fieldW;
    sandCanvas.height = fieldH;
  }
  const sctx = sandCanvas.getContext('2d');
  const img = sctx.createImageData(fieldW, fieldH);
  const d = img.data;

  for (let y = 0; y < fieldH; y++) {
    for (let x = 0; x < fieldW; x++) {
      const i = y * fieldW + x;
      const h = sandField[i];
      const t = Math.min(1, h / 255);
      const grain = Math.sin((x + grainSeed) * 12.7 + y * 9.3) * 0.5 + 0.5;
      const mix = Math.min(1, t * 0.88 + grain * 0.04);

      const pi = i * 4;
      d[pi]     = SAND_BASE[0] + (SAND_LIGHT[0] - SAND_BASE[0]) * mix;
      d[pi + 1] = SAND_BASE[1] + (SAND_LIGHT[1] - SAND_BASE[1]) * mix;
      d[pi + 2] = SAND_BASE[2] + (SAND_LIGHT[2] - SAND_BASE[2]) * mix;
      d[pi + 3] = 255;
    }
  }

  sctx.putImageData(img, 0, 0);
  ctx.clearRect(0, 0, displayW, displayH);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(sandCanvas, 0, 0, displayW, displayH);
  drawStones();
  drawTemplateGuide();
}

function drawStones() {
  stones.forEach(st => {
    const cx = st.x * displayW;
    const cy = st.y * displayH;
    const r = st.r * Math.min(displayW, displayH);

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = r * 0.5;
    ctx.shadowOffsetY = r * 0.15;

    const g = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, r * 0.1, cx, cy, r);
    const base = 90 + st.shade * 40;
    g.addColorStop(0, `rgb(${base + 50}, ${base + 48}, ${base + 44})`);
    g.addColorStop(0.55, `rgb(${base + 10}, ${base + 8}, ${base + 6})`);
    g.addColorStop(1, `rgb(${base - 20}, ${base - 22}, ${base - 26})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.05, r * 0.88, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.2, cy - r * 0.25, r * 0.35, r * 0.18, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function pointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const x = ((clientX - rect.left) / rect.width) * fieldW;
  const y = ((clientY - rect.top) / rect.height) * fieldH;
  return { x, y, nx: (clientX - rect.left) / rect.width, ny: (clientY - rect.top) / rect.height };
}

function stoneAt(nx, ny) {
  for (let i = stones.length - 1; i >= 0; i--) {
    const st = stones[i];
    const dx = nx - st.x;
    const dy = ny - st.y;
    const hit = st.r * 1.3;
    if (dx * dx + dy * dy < hit * hit) return st;
  }
  return null;
}

function onPointerDown(e) {
  if (state.resetAnim) return;
  e.preventDefault();
  const p = pointerPos(e);
  state.wiping = true;

  if (state.mode === 'stone') {
    draggedStone = stoneAt(p.nx, p.ny);
    document.getElementById('canvas-wrap')?.classList.toggle('dragging', !!draggedStone);
    if (!draggedStone && stones.length < 6) {
      stones.push({
        x: p.nx,
        y: p.ny,
        r: 0.04 + Math.random() * 0.025,
        shade: Math.random() * 0.3,
      });
      renderSand();
      scheduleSave();
    }
  } else if (canRakeWithCurrentTool()) {
    state.lastX = p.x;
    state.lastY = p.y;
    rakeAt(p.x, p.y, state.tool);
    renderSand();
    ensureAnim();
    scheduleSave();
  }
}

function onPointerMove(e) {
  if (!state.wiping || state.resetAnim) return;
  e.preventDefault();
  const p = pointerPos(e);

  if (state.mode === 'stone' && draggedStone) {
    draggedStone.x = Math.max(0.06, Math.min(0.94, p.nx));
    draggedStone.y = Math.max(0.06, Math.min(0.94, p.ny));
    renderSand();
    scheduleSave();
    return;
  }

  if (state.mode !== 'rake' || !canRakeWithCurrentTool()) return;
  rakeLine(state.lastX, state.lastY, p.x, p.y);
  state.lastX = p.x;
  state.lastY = p.y;
  updateTemplateMatch();
  renderSand();
  ensureAnim();
}

function onPointerUp() {
  state.wiping = false;
  draggedStone = null;
  document.getElementById('canvas-wrap')?.classList.remove('dragging');
  syncStats();
  saveProgress();
}

function ensureAnim() {
  if (animId) return;
  animId = requestAnimationFrame(tick);
}

function tick() {
  animId = null;
  if (state.resetAnim) {
    if (!sandField) {
      state.resetAnim = null;
      return;
    }
    const a = state.resetAnim;
    a.t += 0.035;
    let changed = false;
    for (let i = 0; i < sandField.length; i++) {
      if (sandField[i] > 0.5) {
        sandField[i] *= 0.88;
        changed = true;
      } else {
        sandField[i] = 0;
      }
    }
    renderSand();
    if (a.t < 1.2 && changed) {
      animId = requestAnimationFrame(tick);
    } else {
      for (let i = 0; i < sandField.length; i++) sandField[i] = 0;
      state.resetAnim = null;
      state.wiping = false;
      renderSand();
      reconcileWideState();
      syncWideUI();
      startWideTimer();
      saveProgress();
    }
    return;
  }
}

function smoothSand() {
  if (state.resetAnim) return;
  state.resetAnim = { t: 0 };
  ensureAnim();
}

function setTool(key, fromLoad) {
  const prevTool = state.tool;
  const prevMode = state.mode;

  if (key === 'wide' && wideOnCooldown()) {
    syncWideUI();
    return;
  }

  if (key === 'smooth') {
    state.wiping = false;
    draggedStone = null;
    document.getElementById('canvas-wrap')?.classList.remove('dragging');
    smoothSand();
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === state.tool);
    });
    syncWideUI();
    startWideTimer();
    if (!fromLoad) scheduleSave();
    return;
  }

  if (prevTool === 'wide' && prevMode === 'rake' && key !== 'wide' && wideSessionActive()) {
    endWideSession(true);
  }

  if (key === 'stone') {
    state.mode = 'stone';
    document.getElementById('canvas-wrap')?.classList.add('stone-mode');
  } else {
    state.mode = 'rake';
    state.tool = key;
    document.getElementById('canvas-wrap')?.classList.remove('stone-mode');
    if (key === 'wide' && !fromLoad && !wideOnCooldown() && (prevTool !== 'wide' || !wideSessionActive())) {
      startWideSession();
    }
  }

  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tool === key);
  });

  if (state.mode === 'stone') {
    setHint('拖动石头 · 点空白处可再放一块');
  } else if (TOOLS[key]?.wave) {
    setHint('按住拖动 · 耙出波纹纹路');
  } else if (key !== 'wide' || !wideSessionActive()) {
    setHint('按住拖动 · 像耙沙子一样划开纹路');
  }

  syncWideUI();
  startWideTimer();
  if (!fromLoad) scheduleSave();
}

function resampleField(oldField, oldW, oldH) {
  if (!oldField || oldW < 1 || oldH < 1) return;
  const src = new Uint8Array(oldField.length);
  for (let i = 0; i < oldField.length; i++) src[i] = oldField[i] | 0;
  for (let y = 0; y < fieldH; y++) {
    for (let x = 0; x < fieldW; x++) {
      const u = (x + 0.5) / fieldW * oldW - 0.5;
      const v = (y + 0.5) / fieldH * oldH - 0.5;
      sandField[y * fieldW + x] = sampleFieldBilinear(src, oldW, oldH, u, v);
    }
  }
}

function resize() {
  const wrap = document.getElementById('canvas-wrap');
  if (!wrap || !canvas) return;

  dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = wrap.getBoundingClientRect();
  displayW = Math.max(1, Math.floor(rect.width));
  displayH = Math.max(1, Math.floor(rect.height));

  const fw = Math.max(120, Math.floor(displayW * 0.55));
  const fh = Math.max(90, Math.floor(displayH * 0.55));

  if (fw === fieldW && fh === fieldH && canvas.width === displayW * dpr) return;

  const oldField = sandField ? new Float32Array(sandField) : null;
  const oldW = fieldW;
  const oldH = fieldH;
  const oldStones = stones.map(st => ({ ...st }));

  canvas.width = displayW * dpr;
  canvas.height = displayH * dpr;
  canvas.style.width = `${displayW}px`;
  canvas.style.height = `${displayH}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  initField(fw, fh, true);
  stones = oldStones.length ? oldStones : defaultStones();
  if (oldField && oldW > 0 && oldH > 0) resampleField(oldField, oldW, oldH);

  renderSand();
}

function wireUI() {
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => setTool(btn.dataset.tool));
  });
  document.getElementById('btn-template')?.addEventListener('click', openTemplatePicker);

  canvas.addEventListener('mousedown', onPointerDown);
  canvas.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  canvas.addEventListener('touchstart', onPointerDown, { passive: false });
  canvas.addEventListener('touchmove', onPointerMove, { passive: false });
  canvas.addEventListener('touchend', onPointerUp);
  canvas.addEventListener('touchcancel', onPointerUp);

  window.addEventListener('resize', resize);
  window.addEventListener('pagehide', saveProgress);
  window.addEventListener('beforeunload', saveProgress);
}

function init() {
  try {
    canvas = document.getElementById('sand-canvas');
    if (!canvas) throw new Error('canvas missing');
    ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('canvas context missing');
    pendingSave = loadSave();
    wireUI();
    resize();

    if (pendingSave) {
      applySaveData(pendingSave);
      pendingSave = null;
    } else {
      setTool('narrow', true);
    }

    reconcileWideState();
    syncStats();
    syncWideUI();
    startWideTimer();
    renderSand();
    syncTemplateUI();
  } catch (e) {
    console.error('静沙 init failed', e);
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = '<p style="padding:24px;text-align:center;color:#f0e8d8;line-height:1.8">静沙加载失败，请刷新页面<br><span style="font-size:12px;color:#a89878">若仍空白，可在浏览器设置里清除本站数据后重试</span></p>';
    }
  }
}

document.addEventListener('DOMContentLoaded', init);
