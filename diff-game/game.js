/**
 * 找不同 — 慢版 · 无计时
 */
const STORAGE_KEY = 'diff_slow_v1';

const state = {
  levelIdx: 0,
  found: {},
  completed: [],
  hintsLeft: 3,
  hintCooldownUntil: 0,
  pickerOpen: true,
  totalFound: 0,
  celebrate: false,
};

let canvasL, canvasR, ctxL, ctxR;
let panelW = 0;
let panelH = 0;

function currentLevel() {
  return DiffArt.LEVELS[state.levelIdx] || DiffArt.LEVELS[0];
}

function levelFoundSet() {
  const id = currentLevel().id;
  if (!state.found[id]) state.found[id] = [];
  return state.found[id];
}

function normalizeFoundStore() {
  DiffArt.LEVELS.forEach(lv => {
    const raw = state.found[lv.id];
    if (!Array.isArray(raw)) {
      state.found[lv.id] = [];
      return;
    }
    const valid = new Set(DiffArt.getDiffs(lv.id).map(d => d.id));
    state.found[lv.id] = [...new Set(raw.filter(id => valid.has(id)))];
  });
}

function uniqueFoundCount(lvId) {
  const diffs = DiffArt.getDiffs(lvId);
  const found = state.found[lvId] || [];
  const valid = new Set(diffs.map(d => d.id));
  return [...new Set(found.filter(id => valid.has(id)))].length;
}

function isLevelComplete(lvId) {
  const diffs = DiffArt.getDiffs(lvId);
  if (!diffs.length) return false;
  return uniqueFoundCount(lvId) >= diffs.length;
}

function loadSave() {
  try {
    const d = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!d) return;
    if (typeof d.levelIdx === 'number') state.levelIdx = Math.min(d.levelIdx, DiffArt.LEVELS.length - 1);
    if (d.found && typeof d.found === 'object') state.found = d.found;
    if (Array.isArray(d.completed)) state.completed = d.completed;
    if (typeof d.hintsLeft === 'number') state.hintsLeft = d.hintsLeft;
    if (typeof d.totalFound === 'number') state.totalFound = d.totalFound;
    if (typeof d.pickerOpen === 'boolean') state.pickerOpen = d.pickerOpen;
    normalizeFoundStore();
  } catch {}
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      v: 1,
      levelIdx: state.levelIdx,
      found: state.found,
      completed: state.completed,
      hintsLeft: state.hintsLeft,
      totalFound: state.totalFound,
      pickerOpen: state.pickerOpen,
    }));
  } catch {}
}

function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove('show'), 2400);
}

function setSpeech(html) {
  const el = document.getElementById('tip-speech');
  if (el) el.innerHTML = html;
}

function resizeCanvases() {
  const wrap = document.getElementById('panels-wrap');
  if (!wrap || !canvasL || !canvasR) return;
  panelW = Math.floor(wrap.clientWidth);
  panelH = Math.floor(panelW * 0.48);
  if (panelW < 10 || panelH < 10) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  [canvasL, canvasR].forEach(c => {
    c.width = Math.floor(panelW * dpr);
    c.height = Math.floor(panelH * dpr);
    c.style.width = `${panelW}px`;
    c.style.height = `${panelH}px`;
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  });
  ctxL = canvasL.getContext('2d');
  ctxR = canvasR.getContext('2d');
  drawPanels();
  renderMarkers();
}

function drawPanels() {
  const lv = currentLevel();
  if (!ctxL || !ctxR || !panelW) return;
  ctxL.clearRect(0, 0, panelW, panelH);
  ctxR.clearRect(0, 0, panelW, panelH);
  DiffArt.draw(lv.id, ctxL, panelW, panelH, 'left');
  DiffArt.draw(lv.id, ctxR, panelW, panelH, 'right');
  if (state.celebrate) {
    [ctxL, ctxR].forEach(ctx => {
      ctx.fillStyle = 'rgba(255, 235, 59, 0.15)';
      ctx.fillRect(0, 0, panelW, panelH);
    });
  }
}

function renderMarkers() {
  const layer = document.getElementById('marker-layer');
  if (!layer) return;
  layer.innerHTML = '';
  const lv = currentLevel();
  const found = levelFoundSet();
  const diffs = DiffArt.getDiffs(lv.id);

  diffs.forEach(d => {
    if (!found.includes(d.id)) return;
    [[0], [0.5]].forEach(yOff => {
      const m = document.createElement('span');
      m.className = 'diff-marker found';
      m.style.left = `${d.x * 100}%`;
      m.style.top = `${(yOff[0] + d.y * 0.5) * 100}%`;
      const size = Math.max(26, d.r * (panelW || 280) * 1.9);
      m.style.width = `${size}px`;
      m.style.height = `${size}px`;
      layer.appendChild(m);
    });
  });
}

function normFromEvent(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX ?? e.pageX) - rect.left;
  const cy = (e.clientY ?? e.pageY) - rect.top;
  return { nx: cx / rect.width, ny: cy / rect.height };
}

function tryHit(nx, ny) {
  const lv = currentLevel();
  const found = levelFoundSet();
  const diffs = DiffArt.getDiffs(lv.id);
  const foundSet = new Set(found);
  for (const d of diffs) {
    if (foundSet.has(d.id)) continue;
    const dist = Math.hypot(nx - d.x, ny - d.y);
    if (dist <= d.r * 1.15) return d;
  }
  return null;
}

function onPanelClick(canvas, e) {
  const { nx, ny } = normFromEvent(canvas, e);
  const hit = tryHit(nx, ny);
  if (!hit) {
    showToast('这里好像一样……再找找？');
    canvas.classList.add('shake');
    setTimeout(() => canvas.classList.remove('shake'), 400);
    return;
  }
  const found = levelFoundSet();
  if (found.includes(hit.id)) {
    checkComplete();
    return;
  }
  found.push(hit.id);
  state.totalFound += 1;
  save();
  const lv = currentLevel();
  showToast(`找到了！(${uniqueFoundCount(lv.id)}/${DiffArt.getDiffs(lv.id).length})`);
  setSpeech(`对了！<em>${hit.hint}</em> 那里不一样。`);
  renderMarkers();
  updateProgress();
  checkComplete();
}

function showLevelCompleteOverlay() {
  const lv = currentLevel();
  if (!state.completed.includes(lv.id)) {
    state.completed.push(lv.id);
    save();
  }
  state.celebrate = true;
  drawPanels();
  setSpeech(`<em>${lv.name}</em> 全部找齐！👍 点「继续」下一组`);
  document.getElementById('complete-overlay')?.classList.add('show');
  document.getElementById('stat-done').textContent = String(state.completed.length);
  renderLevelPicker();
  clearTimeout(showLevelCompleteOverlay._celebrateT);
  showLevelCompleteOverlay._celebrateT = setTimeout(() => {
    state.celebrate = false;
    drawPanels();
  }, 1800);
}

function checkComplete() {
  const lv = currentLevel();
  const diffs = DiffArt.getDiffs(lv.id);
  if (!diffs.length) return;
  if (uniqueFoundCount(lv.id) < diffs.length) return;
  showLevelCompleteOverlay();
}

function syncSessionAfterReturn() {
  normalizeFoundStore();
  const lv = currentLevel();
  if (isLevelComplete(lv.id)) {
    showLevelCompleteOverlay();
  } else {
    document.getElementById('complete-overlay')?.classList.remove('show');
    state.celebrate = false;
  }
  updateProgress();
  renderMarkers();
  renderLevelPicker();
}

function hideComplete() {
  document.getElementById('complete-overlay')?.classList.remove('show');
  const next = DiffArt.LEVELS.findIndex((lv, i) => i > state.levelIdx && !state.completed.includes(lv.id));
  if (next >= 0) selectLevel(next);
  else showToast('这一组都对上了 · 换关试试');
}

function selectLevel(idx) {
  state.levelIdx = idx;
  state.pickerOpen = false;
  state.celebrate = false;
  save();
  document.getElementById('complete-overlay')?.classList.remove('show');
  renderAll();
}

function useHint() {
  const now = Date.now();
  if (now < state.hintCooldownUntil) {
    showToast('稍等一下再提示');
    return;
  }
  if (state.hintsLeft <= 0) {
    showToast('提示用完了，自己慢慢对');
    return;
  }
  const lv = currentLevel();
  const found = levelFoundSet();
  const missing = DiffArt.getDiffs(lv.id).filter(d => !found.includes(d.id));
  if (!missing.length) {
    showToast('这一关已经找齐啦');
    return;
  }
  const target = missing[Math.floor(Math.random() * missing.length)];
  state.hintsLeft -= 1;
  state.hintCooldownUntil = now + 4500;
  save();
  document.getElementById('stat-hints').textContent = String(state.hintsLeft);

  const ring = document.createElement('span');
  ring.className = 'hint-ring';
  ring.style.left = `${target.x * 100}%`;
  ring.style.top = `${target.y * 50}%`;
  const size = Math.max(32, target.r * (panelW || 280) * 2.2);
  ring.style.width = `${size}px`;
  ring.style.height = `${size}px`;
  document.getElementById('marker-layer')?.appendChild(ring);
  setTimeout(() => ring.remove(), 2800);

  showToast(`提示：看看${target.hint}附近`);
  setSpeech(`看看 <em>${target.hint}</em> 附近，好像有点不一样。`);
}

function resetLevel() {
  const id = currentLevel().id;
  state.found[id] = [];
  state.completed = state.completed.filter(x => x !== id);
  state.celebrate = false;
  save();
  document.getElementById('complete-overlay')?.classList.remove('show');
  renderAll();
  showToast('重新找这一关');
}

function renderLevelPicker() {
  const chips = document.getElementById('level-chips');
  const picker = document.getElementById('level-picker');
  if (!chips) return;
  picker.hidden = !state.pickerOpen;
  chips.innerHTML = '';
  DiffArt.LEVELS.forEach((lv, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'level-chip';
    if (i === state.levelIdx) btn.classList.add('active');
    if (state.completed.includes(lv.id)) btn.classList.add('done');
    btn.innerHTML = `<span>${lv.emoji}</span><span>${lv.name}</span>${state.completed.includes(lv.id) ? '<span class="chip-done">✓</span>' : ''}`;
    btn.addEventListener('click', () => selectLevel(i));
    chips.appendChild(btn);
  });
}

function updateProgress() {
  const lv = currentLevel();
  const diffs = DiffArt.getDiffs(lv.id);
  const el = document.getElementById('scene-progress');
  if (el) el.textContent = `${uniqueFoundCount(lv.id)} / ${diffs.length}`;
  document.getElementById('stat-found').textContent = String(state.totalFound);
}

function renderAll() {
  const lv = currentLevel();
  document.getElementById('scene-title').textContent = `${lv.emoji} ${lv.name}`;
  setSpeech(lv.intro);
  renderLevelPicker();
  updateProgress();
  document.getElementById('stat-done').textContent = String(state.completed.length);
  document.getElementById('stat-hints').textContent = String(state.hintsLeft);
  resizeCanvases();
}

function bindUI() {
  canvasL = document.getElementById('canvas-left');
  canvasR = document.getElementById('canvas-right');
  if (!canvasL || !canvasR) {
    console.error('找不同：找不到画布');
    return;
  }

  const bindTap = (canvas) => {
    canvas.addEventListener('click', e => onPanelClick(canvas, e));
    canvas.addEventListener('touchend', e => {
      e.preventDefault();
      const t = e.changedTouches[0];
      if (t) onPanelClick(canvas, { clientX: t.clientX, clientY: t.clientY });
    }, { passive: false });
  };
  bindTap(canvasL);
  bindTap(canvasR);

  window.addEventListener('resize', () => {
    clearTimeout(bindUI._rz);
    bindUI._rz = setTimeout(resizeCanvases, 120);
  });

  document.getElementById('btn-toggle-picker')?.addEventListener('click', () => {
    state.pickerOpen = !state.pickerOpen;
    save();
    renderLevelPicker();
  });
  document.getElementById('btn-hint')?.addEventListener('click', useHint);
  document.getElementById('btn-reset')?.addEventListener('click', resetLevel);
  document.getElementById('btn-next')?.addEventListener('click', hideComplete);
}

function init() {
  loadSave();
  bindUI();
  renderAll();
  syncSessionAfterReturn();
  if (state.completed.length) showToast('已恢复上次进度');
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') save();
  });
  window.addEventListener('pagehide', () => save());
  window.addEventListener('pageshow', e => {
    if (!e.persisted) return;
    loadSave();
    renderAll();
    syncSessionAfterReturn();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
