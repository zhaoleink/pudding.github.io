/**
 * 造语坊 — 创造自己的语言
 */
const STORAGE_KEY = 'langcraft_v1';
const APP_VERSION = 'v34';

const PICK_CHARS = '测试语言名字我的新词义月亮星星水火木金土一二三四五六七八九十你好世界花鱼';

const POS_LABELS = {
  noun: '名词',
  verb: '动词',
  adj: '形容词',
  adv: '副词',
  pron: '代词',
  part: '虚词',
  other: '其他',
};

const state = {
  languages: [],
  currentId: null,
  tab: 'overview',
  dictFilter: '',
  quizMode: 'toMeaning',
  quizCurrent: null,
};

const board = {
  canvas: null,
  ctx: null,
  dpr: 1,
  tool: 'pen',
  color: '#1a1830',
  size: 4,
  drawing: false,
  stroke: null,
  eraserLast: null,
  saveTimer: null,
  redrawRaf: null,
  bound: false,
};

function uid() {
  return `lang_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function defaultLanguage(name, emoji) {
  return {
    id: uid(),
    name: name || '未命名语言',
    emoji: emoji || '🌐',
    description: '',
    alphabet: [],
    words: [],
    grammar: {
      wordOrder: '',
      rules: '',
      phrases: '',
    },
    drawBoard: { strokes: [], baseImage: '', undoStack: [] },
    drawnGlyphs: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function ensureDrawBoard(lang) {
  if (!lang.drawBoard || !Array.isArray(lang.drawBoard.strokes)) {
    lang.drawBoard = { strokes: [], baseImage: '', undoStack: [] };
  }
  if (lang.drawBoard.baseImage == null) lang.drawBoard.baseImage = '';
  if (!Array.isArray(lang.drawBoard.undoStack)) lang.drawBoard.undoStack = [];
  lang.drawBoard.strokes = lang.drawBoard.strokes.filter(s => s && s.tool !== 'eraser');
  if (!Array.isArray(lang.drawnGlyphs)) {
    lang.drawnGlyphs = [];
  }
}

function currentLang() {
  return state.languages.find(l => l.id === state.currentId) || null;
}

function touchLang(lang) {
  lang.updatedAt = Date.now();
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (Array.isArray(d.languages)) {
      state.languages = d.languages.map(normalizeLang);
    }
  } catch {}
}

function serializeLanguagesForSave() {
  return state.languages.map(l => ({
    ...l,
    drawBoard: {
      baseImage: l.drawBoard?.baseImage || '',
      strokes: Array.isArray(l.drawBoard?.strokes)
        ? l.drawBoard.strokes.filter(s => s && s.tool !== 'eraser')
        : [],
    },
  }));
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ languages: serializeLanguagesForSave() }));
  } catch {
    showToast('保存失败，存储可能已满');
  }
}

function normalizeLang(l) {
  return {
    id: l.id || uid(),
    name: l.name || '未命名语言',
    emoji: l.emoji || '🌐',
    description: l.description || '',
    alphabet: Array.isArray(l.alphabet) ? l.alphabet : [],
    words: Array.isArray(l.words) ? l.words.map(w => ({
      id: w.id || uid(),
      text: w.text || '',
      meaning: w.meaning || '',
      pos: POS_LABELS[w.pos] ? w.pos : 'other',
      note: w.note || '',
    })) : [],
    grammar: {
      wordOrder: l.grammar?.wordOrder || '',
      rules: l.grammar?.rules || '',
      phrases: l.grammar?.phrases || '',
    },
    drawBoard: {
      strokes: Array.isArray(l.drawBoard?.strokes)
        ? l.drawBoard.strokes.filter(s => s && s.tool !== 'eraser')
        : [],
      baseImage: l.drawBoard?.baseImage || '',
      undoStack: [],
    },
    drawnGlyphs: Array.isArray(l.drawnGlyphs)
      ? l.drawnGlyphs.map(g => ({
        id: g.id || uid(),
        label: g.label || '',
        roman: g.roman || '',
        imageData: g.imageData || '',
        note: g.note || '',
        createdAt: g.createdAt || Date.now(),
      }))
      : [],
    createdAt: l.createdAt || Date.now(),
    updatedAt: l.updatedAt || Date.now(),
  };
}

function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove('show'), 2400);
}

function showScreen(name) {
  document.getElementById('home-screen').hidden = name !== 'home';
  document.getElementById('editor-screen').hidden = name !== 'editor';
  renderTopActions(name);
  if (name === 'home') {
    resumeMiniGameIfOpen();
  } else {
    pauseMiniGame();
  }
}

function resumeMiniGameIfOpen() {
  if (miniDock.active === 'fish') startFishPond();
  else if (miniDock.active === 'bubble') startBubbleMini();
  else if (miniDock.active === 'rain') startRainMini();
  else if (miniDock.active === 'star') startStarMini();
}

function pauseMiniGame() {
  stopAllMiniGames();
}

function renderTopActions(screen) {
  const el = document.getElementById('top-actions');
  if (!el) return;
  if (screen === 'home') {
    el.innerHTML = `
      <button type="button" class="btn" id="btn-import">导入</button>
      <button type="button" class="btn primary" id="btn-new-lang">＋ 新建语言</button>`;
    document.getElementById('btn-new-lang')?.addEventListener('click', openNewModal);
    document.getElementById('btn-import')?.addEventListener('click', () => {
      document.getElementById('import-file')?.click();
    });
  } else {
    el.innerHTML = `<button type="button" class="btn danger" id="btn-delete-lang">删除语言</button>`;
    document.getElementById('btn-delete-lang')?.addEventListener('click', deleteCurrentLang);
  }
}

function langMatchesSearch(lang, query) {
  if (!query) return true;
  const hay = `${lang.name || ''} ${lang.emoji || ''}`.toLowerCase();
  return query.split(/\s+/).filter(Boolean).every(part => hay.includes(part));
}

function renderHome() {
  const grid = document.getElementById('lang-grid');
  const empty = document.getElementById('home-empty');
  const searchEmpty = document.getElementById('home-search-empty');
  if (!grid) return;

  grid.innerHTML = '';
  const q = document.getElementById('lang-search')?.value.trim().toLowerCase() || '';

  if (!state.languages.length) {
    if (empty) empty.hidden = false;
    if (searchEmpty) searchEmpty.hidden = true;
    return;
  }
  if (empty) empty.hidden = true;

  const list = state.languages
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .filter(lang => langMatchesSearch(lang, q));

  if (!list.length) {
    if (searchEmpty) searchEmpty.hidden = false;
    return;
  }
  if (searchEmpty) searchEmpty.hidden = true;

  list.forEach(lang => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lang-card';
      btn.innerHTML = `
        <div class="emoji">${lang.emoji}</div>
        <h3>${escapeHtml(lang.name)}</h3>
        <div class="meta">${lang.words.length} 词 · ${lang.alphabet.length} 字符<br>${formatDate(lang.updatedAt)}</div>`;
      btn.addEventListener('click', () => openLang(lang.id));
      grid.appendChild(btn);
    });
}

function formatDate(ts) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} 更新`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function openLang(id) {
  state.currentId = id;
  state.tab = 'overview';
  showScreen('editor');
  renderEditor();
}

function openNewModal() {
  document.getElementById('new-lang-name').value = '';
  document.getElementById('new-lang-emoji').value = '🌐';
  document.getElementById('modal-backdrop').hidden = false;
  fillCharPickers();
  /* 不自动聚焦输入框：键盘/输入法异常时会立刻灌进乱码 */
}

function closeModal() {
  document.getElementById('modal-backdrop').hidden = true;
}

function createLanguageQuick(name, emoji = '🌐') {
  const n = String(name || '').trim();
  if (!n) {
    showToast('请给语言起个名字');
    return;
  }
  const lang = defaultLanguage(n, emoji || '🌐');
  state.languages.push(lang);
  save();
  closeModal();
  renderHome();
  openLang(lang.id);
  showToast(`「${n}」诞生了 ✨`);
}

function createLanguage() {
  const name = document.getElementById('new-lang-name').value.trim();
  const emoji = document.getElementById('new-lang-emoji').value.trim() || '🌐';
  createLanguageQuick(name, emoji);
}

function deleteCurrentLang() {
  const lang = currentLang();
  if (!lang) return;
  if (!confirm(`确定删除「${lang.name}」？词库和语法都会消失。`)) return;
  state.languages = state.languages.filter(l => l.id !== lang.id);
  state.currentId = null;
  save();
  showScreen('home');
  renderHome();
  showToast('已删除');
}

function setTab(tab) {
  state.tab = tab;
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  document.querySelectorAll('.panel').forEach(p => {
    p.hidden = p.id !== `panel-${tab}`;
  });
  if (tab === 'quiz') nextQuiz();
  if (tab === 'play') renderPlayground();
  if (tab === 'board') initDrawBoard();
}

function renderEditor() {
  const lang = currentLang();
  if (!lang) return;

  document.getElementById('editor-title').textContent = `${lang.emoji} ${lang.name}`;

  document.getElementById('lang-name').value = lang.name;
  document.getElementById('lang-emoji').value = lang.emoji;
  document.getElementById('lang-desc').value = lang.description;

  document.getElementById('grammar-wordorder').value = lang.grammar.wordOrder;
  document.getElementById('grammar-rules').value = lang.grammar.rules;
  document.getElementById('grammar-phrases').value = lang.grammar.phrases;

  ensureDrawBoard(lang);
  renderOverviewStats(lang);
  renderAlphabet(lang);
  renderDict(lang);
  renderGlyphGallery(lang);
  setTab(state.tab);
}

function renderOverviewStats(lang) {
  const el = document.getElementById('overview-stats');
  if (!el) return;
  el.innerHTML = `
    <span class="stat-pill">${lang.words.length} 词语</span>
    <span class="stat-pill">${lang.alphabet.length} 字符</span>
    <span class="stat-pill">${lang.drawnGlyphs?.length || 0} 手写字</span>
    <span class="stat-pill">创建于 ${formatDate(lang.createdAt)}</span>`;
}

function getBoardStrokes(lang) {
  ensureDrawBoard(lang);
  return lang.drawBoard.strokes;
}

function cloneBoardSnapshot(lang) {
  ensureDrawBoard(lang);
  return {
    baseImage: lang.drawBoard.baseImage || '',
    strokes: JSON.parse(JSON.stringify(lang.drawBoard.strokes)),
  };
}

function pushBoardHistory(lang) {
  ensureDrawBoard(lang);
  lang.drawBoard.undoStack.push(cloneBoardSnapshot(lang));
  if (lang.drawBoard.undoStack.length > 50) lang.drawBoard.undoStack.shift();
}

function restoreBoardSnapshot(lang, snap) {
  lang.drawBoard.baseImage = snap.baseImage || '';
  lang.drawBoard.strokes = Array.isArray(snap.strokes) ? snap.strokes : [];
  board._baseSrc = '';
  board._baseImg = null;
}

function bakeBoardFromCanvas(lang) {
  if (!board.canvas || !lang) return;
  lang.drawBoard.baseImage = board.canvas.toDataURL('image/png');
  lang.drawBoard.strokes = [];
  board._baseSrc = '';
  board._baseImg = null;
}

function waitForBoardImage() {
  return new Promise(resolve => {
    if (!board._baseImg || board._baseImg.complete) {
      resolve();
      return;
    }
    board._baseImg.onload = () => resolve();
    board._baseImg.onerror = () => resolve();
  });
}

function canvasHasInk() {
  if (!board.ctx || !board.canvas) return false;
  const w = board.canvas.width;
  const h = board.canvas.height;
  if (w < 1 || h < 1) return false;
  const data = board.ctx.getImageData(0, 0, w, h).data;
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 8) continue;
    if (r < 248 || g < 246 || b < 236) return true;
  }
  return false;
}

function boardNeedsCompact(lang) {
  ensureDrawBoard(lang);
  return !!(lang.drawBoard.baseImage && getBoardStrokes(lang).length);
}

async function compactDrawBoardIfNeeded(lang) {
  if (!lang || !boardNeedsCompact(lang) || !board.ctx) return false;
  redrawBoard(lang);
  await waitForBoardImage();
  redrawBoard(lang);
  bakeBoardFromCanvas(lang);
  return true;
}

async function prepareBoardCapture(lang) {
  redrawBoard(lang);
  await waitForBoardImage();
  redrawBoard(lang);
  if (getBoardStrokes(lang).length) {
    bakeBoardFromCanvas(lang);
    redrawBoard(lang);
    await waitForBoardImage();
  }
}

async function flushDrawBoard(lang) {
  if (!lang || state.tab !== 'board') return;
  if (await compactDrawBoardIfNeeded(lang)) {
    touchLang(lang);
    save();
  }
}

function resizeDrawCanvas() {
  const frame = document.getElementById('board-frame');
  const canvas = document.getElementById('draw-canvas');
  if (!frame || !canvas) return;

  board.dpr = Math.min(window.devicePixelRatio || 1, 3);
  const rect = frame.getBoundingClientRect();
  const w = Math.max(1, Math.floor(rect.width));
  const h = Math.max(320, Math.floor(rect.height));

  canvas.width = w * board.dpr;
  canvas.height = h * board.dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  board.canvas = canvas;
  board.ctx = canvas.getContext('2d');
  board.ctx.setTransform(board.dpr, 0, 0, board.dpr, 0, 0);
  board.ctx.imageSmoothingEnabled = true;
  board.ctx.imageSmoothingQuality = 'high';

  const lang = currentLang();
  if (lang) redrawBoard(lang);
}

function redrawBoard(lang) {
  if (!board.ctx || !board.canvas) return;
  const w = board.canvas.width / board.dpr;
  const h = board.canvas.height / board.dpr;
  const ctx = board.ctx;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, board.canvas.width, board.canvas.height);
  ctx.restore();

  ctx.fillStyle = BOARD_PAPER;
  ctx.fillRect(0, 0, w, h);

  if (lang.drawBoard.baseImage) {
    drawBoardBaseImage(ctx, w, h, lang.drawBoard.baseImage);
  }
  getBoardStrokes(lang).forEach(stroke => {
    if (stroke.tool !== 'eraser') drawStroke(ctx, w, h, stroke);
  });
}

function drawBoardBaseImage(ctx, w, h, src) {
  if (!board._baseImg || board._baseSrc !== src) {
    board._baseImg = new Image();
    board._baseSrc = src;
    board._baseImg.src = src;
    board._baseImg.onload = () => {
      const lang = currentLang();
      if (lang) redrawBoard(lang);
    };
  }
  if (board._baseImg.complete) {
    ctx.drawImage(board._baseImg, 0, 0, w, h);
  }
}

function strokePointsToXY(points, w, h) {
  return points.map(p => ({ x: p.nx * w, y: p.ny * h }));
}

const BOARD_PAPER = '#fffef8';

function applyStrokeStyle(ctx, stroke) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineWidth = stroke.size;
  ctx.strokeStyle = stroke.color;
  ctx.fillStyle = stroke.color;
}

function drawEraserSegment(from, to, w, h) {
  if (!board.ctx || !from || !to) return;
  const ctx = board.ctx;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = board.size * 1.2;
  ctx.strokeStyle = 'rgba(0,0,0,1)';
  ctx.beginPath();
  ctx.moveTo(from.nx * w, from.ny * h);
  ctx.lineTo(to.nx * w, to.ny * h);
  ctx.stroke();
  ctx.restore();
}

function drawStroke(ctx, w, h, stroke) {
  if (!stroke.points?.length) return;
  const pts = strokePointsToXY(stroke.points, w, h);
  ctx.save();
  applyStrokeStyle(ctx, stroke);

  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, stroke.size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);

  if (pts.length === 2) {
    ctx.lineTo(pts[1].x, pts[1].y);
  } else {
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    const last = pts[pts.length - 1];
    const prev = pts[pts.length - 2];
    ctx.quadraticCurveTo(prev.x, prev.y, last.x, last.y);
  }

  ctx.stroke();
  ctx.restore();
}

function interpolateBoardPoints(last, cur, w, h) {
  const x0 = last.nx * w;
  const y0 = last.ny * h;
  const x1 = cur.nx * w;
  const y1 = cur.ny * h;
  const dist = Math.hypot(x1 - x0, y1 - y0);
  const step = 1.2;
  const n = Math.max(1, Math.ceil(dist / step));
  const out = [];
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    out.push({
      nx: last.nx + (cur.nx - last.nx) * t,
      ny: last.ny + (cur.ny - last.ny) * t,
    });
  }
  return out;
}

function scheduleBoardRedraw() {
  if (board.redrawRaf) return;
  board.redrawRaf = requestAnimationFrame(() => {
    board.redrawRaf = null;
    const lang = currentLang();
    if (lang) redrawBoard(lang);
  });
}

function boardPointer(e) {
  const canvas = board.canvas;
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const cx = e.touches ? e.touches[0].clientX : e.clientX;
  const cy = e.touches ? e.touches[0].clientY : e.clientY;
  const w = canvas.width / board.dpr;
  const h = canvas.height / board.dpr;
  return {
    nx: Math.min(1, Math.max(0, (cx - rect.left) / rect.width)),
    ny: Math.min(1, Math.max(0, (cy - rect.top) / rect.height)),
    w,
    h,
  };
}

function startDraw(e) {
  if (state.tab !== 'board') return;
  const lang = currentLang();
  if (!lang || !board.ctx) return;
  e.preventDefault();
  const p = boardPointer(e);
  if (!p) return;

  board.drawing = true;
  pushBoardHistory(lang);

  if (board.tool === 'eraser') {
    board.stroke = null;
    board.eraserLast = { nx: p.nx, ny: p.ny };
    redrawBoard(lang);
    drawEraserSegment(board.eraserLast, board.eraserLast, p.w, p.h);
    return;
  }

  board.eraserLast = null;
  board.stroke = {
    tool: 'pen',
    color: board.color,
    size: board.size,
    points: [{ nx: p.nx, ny: p.ny }],
  };
  getBoardStrokes(lang).push(board.stroke);
}

function moveDraw(e) {
  if (state.tab !== 'board' || !board.drawing) return;
  e.preventDefault();
  const p = boardPointer(e);
  if (!p) return;

  if (board.tool === 'eraser') {
    const last = board.eraserLast;
    if (!last) return;
    if (Math.hypot(p.nx - last.nx, p.ny - last.ny) < 0.0008) return;
    interpolateBoardPoints(last, p, p.w, p.h).forEach(pt => {
      drawEraserSegment(last, pt, p.w, p.h);
      board.eraserLast = pt;
    });
    board.eraserLast = { nx: p.nx, ny: p.ny };
    scheduleBoardSave(currentLang());
    return;
  }

  if (!board.stroke) return;
  const stroke = board.stroke;
  const last = stroke.points[stroke.points.length - 1];
  const dist = Math.hypot(p.nx - last.nx, p.ny - last.ny);
  if (dist < 0.0008) return;

  interpolateBoardPoints(last, p, p.w, p.h).forEach(pt => {
    stroke.points.push(pt);
  });

  const lang = currentLang();
  if (!lang) return;
  scheduleBoardRedraw();
  scheduleBoardSave(lang);
}

async function endDraw() {
  if (!board.drawing) return;
  const lang = currentLang();
  const wasEraser = board.tool === 'eraser';
  board.drawing = false;
  board.stroke = null;
  board.eraserLast = null;

  if (lang) {
    if (wasEraser) bakeBoardFromCanvas(lang);
    else {
      redrawBoard(lang);
      await compactDrawBoardIfNeeded(lang);
    }
    touchLang(lang);
    save();
  }
}

function scheduleBoardSave(lang) {
  clearTimeout(board.saveTimer);
  board.saveTimer = setTimeout(() => {
    touchLang(lang);
    save();
  }, 400);
}

function setBoardTool(tool) {
  board.tool = tool;
  document.querySelectorAll('.board-tool[data-tool]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tool === tool);
  });
  if (board.canvas) {
    board.canvas.style.cursor = tool === 'eraser' ? 'cell' : 'crosshair';
  }
}

async function undoBoardStroke() {
  const lang = currentLang();
  if (!lang) return;
  ensureDrawBoard(lang);
  if (!lang.drawBoard.undoStack.length) {
    showToast('没有可撤销的操作');
    return;
  }
  restoreBoardSnapshot(lang, lang.drawBoard.undoStack.pop());
  touchLang(lang);
  save();
  redrawBoard(lang);
  await waitForBoardImage();
  redrawBoard(lang);
  showToast('已撤销');
}

function clearBoard() {
  const lang = currentLang();
  if (!lang) return;
  if ((getBoardStrokes(lang).length || lang.drawBoard.baseImage) && !confirm('清空画板？')) return;
  lang.drawBoard.strokes = [];
  lang.drawBoard.baseImage = '';
  lang.drawBoard.undoStack = [];
  board._baseSrc = '';
  touchLang(lang);
  save();
  redrawBoard(lang);
  showToast('画板已清空');
}

async function saveBoardAsGlyph() {
  const lang = currentLang();
  if (!lang || !board.canvas) return;
  const label = document.getElementById('glyph-label')?.value.trim();
  const roman = document.getElementById('glyph-roman')?.value.trim();
  if (!label) {
    showToast('请填字符名称');
    return;
  }

  await prepareBoardCapture(lang);
  if (!canvasHasInk()) {
    showToast('画板上还没有内容');
    return;
  }

  const imageData = board.canvas.toDataURL('image/png');
  lang.drawBoard.baseImage = imageData;
  lang.drawBoard.strokes = [];
  board._baseSrc = '';
  board._baseImg = null;

  lang.drawnGlyphs.push({
    id: uid(),
    label,
    roman,
    imageData,
    note: '',
    createdAt: Date.now(),
  });

  const exists = lang.alphabet.some(a => a.glyph === label);
  if (!exists) {
    lang.alphabet.push({ glyph: `[${label}]`, roman, note: '手绘画板' });
  }

  touchLang(lang);
  save();
  renderGlyphGallery(lang);
  renderAlphabet(lang);
  renderOverviewStats(lang);
  document.getElementById('glyph-label').value = '';
  document.getElementById('glyph-roman').value = '';
  showToast(`已保存手写「${label}」`);
}

function renderGlyphGallery(lang) {
  const gallery = document.getElementById('glyph-gallery');
  if (!gallery) return;
  ensureDrawBoard(lang);
  gallery.innerHTML = '';

  if (!lang.drawnGlyphs.length) {
    gallery.innerHTML = '<p class="hint" style="grid-column:1/-1;text-align:center;padding:16px">还没有保存的手写字符</p>';
    return;
  }

  lang.drawnGlyphs.slice().reverse().forEach(g => {
    const card = document.createElement('div');
    card.className = 'glyph-card';
    card.innerHTML = `
      <img src="${g.imageData}" alt="${escapeHtml(g.label)}">
      <div class="glyph-name">${escapeHtml(g.label)}</div>
      ${g.roman ? `<div class="glyph-roman">${escapeHtml(g.roman)}</div>` : ''}
      <div class="glyph-actions">
        <button type="button" class="icon-btn load-glyph" title="载入画板">📥</button>
        <button type="button" class="icon-btn del-glyph" title="删除">🗑</button>
      </div>`;
    card.querySelector('.load-glyph').addEventListener('click', () => loadGlyphToBoard(g));
    card.querySelector('.del-glyph').addEventListener('click', () => {
      lang.drawnGlyphs = lang.drawnGlyphs.filter(x => x.id !== g.id);
      touchLang(lang);
      save();
      renderGlyphGallery(lang);
      renderOverviewStats(lang);
    });
    gallery.appendChild(card);
  });
}

async function loadGlyphToBoard(g) {
  const lang = currentLang();
  if (!lang || !g.imageData) return;
  pushBoardHistory(lang);
  lang.drawBoard.strokes = [];
  lang.drawBoard.baseImage = g.imageData;
  board._baseSrc = '';
  board._baseImg = null;
  touchLang(lang);
  save();
  redrawBoard(lang);
  await waitForBoardImage();
  redrawBoard(lang);
  showToast(`已载入「${g.label}」· ↩ 可撤销`);
}

function bindDrawBoard() {
  if (board.bound) return;
  board.bound = true;

  const canvas = document.getElementById('draw-canvas');
  if (!canvas) return;

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', moveDraw);
  window.addEventListener('mouseup', endDraw);
  canvas.addEventListener('touchstart', startDraw, { passive: false });
  window.addEventListener('touchmove', moveDraw, { passive: false });
  window.addEventListener('touchend', endDraw);

  document.querySelectorAll('.board-tool[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => setBoardTool(btn.dataset.tool));
  });

  document.getElementById('board-color')?.addEventListener('input', e => {
    board.color = e.target.value;
    setBoardTool('pen');
  });

  document.getElementById('board-size')?.addEventListener('input', e => {
    board.size = Number(e.target.value) || 6;
  });

  document.getElementById('board-undo')?.addEventListener('click', undoBoardStroke);
  document.getElementById('board-clear')?.addEventListener('click', clearBoard);
  document.getElementById('btn-save-glyph')?.addEventListener('click', saveBoardAsGlyph);

  window.addEventListener('resize', () => {
    if (state.tab === 'board') resizeDrawCanvas();
  });

  window.addEventListener('pagehide', () => {
    flushDrawBoard(currentLang());
  });
}

function initDrawBoard() {
  bindDrawBoard();
  requestAnimationFrame(async () => {
    resizeDrawCanvas();
    const lang = currentLang();
    if (!lang) return;
    if (await compactDrawBoardIfNeeded(lang)) {
      touchLang(lang);
      save();
    }
    renderGlyphGallery(lang);
  });
}

function bindOverviewInputs() {
  const bind = (id, key) => {
    const el = document.getElementById(id);
    if (!el) return;
    bindImeSafeInput(el, e => {
      const lang = currentLang();
      if (!lang) return;
      lang[key] = e.target.value;
      touchLang(lang);
      save();
      if (id === 'lang-name' || id === 'lang-emoji') {
        document.getElementById('editor-title').textContent = `${lang.emoji} ${lang.name}`;
      }
    });
  };
  bind('lang-name', 'name');
  bind('lang-emoji', 'emoji');
  bind('lang-desc', 'description');
}

function renderAlphabet(lang) {
  const grid = document.getElementById('alpha-grid');
  if (!grid) return;
  grid.innerHTML = '';
  lang.alphabet.forEach((a, i) => {
    const chip = document.createElement('div');
    chip.className = 'alpha-chip';
    chip.innerHTML = `
      <div class="glyph">${escapeHtml(a.glyph)}</div>
      <div class="roman">${escapeHtml(a.roman)}</div>
      ${a.note ? `<div class="roman">${escapeHtml(a.note)}</div>` : ''}
      <button type="button" class="icon-btn" data-i="${i}" title="删除">✕</button>`;
    chip.querySelector('.icon-btn').addEventListener('click', () => {
      lang.alphabet.splice(i, 1);
      touchLang(lang);
      save();
      renderAlphabet(lang);
      renderOverviewStats(lang);
    });
    grid.appendChild(chip);
  });
}

function addAlpha() {
  const lang = currentLang();
  if (!lang) return;
  const glyph = document.getElementById('alpha-glyph').value.trim();
  const roman = document.getElementById('alpha-roman').value.trim();
  const note = document.getElementById('alpha-note').value.trim();
  if (!glyph) {
    showToast('请输入字符');
    return;
  }
  lang.alphabet.push({ glyph, roman, note });
  touchLang(lang);
  save();
  document.getElementById('alpha-glyph').value = '';
  document.getElementById('alpha-roman').value = '';
  document.getElementById('alpha-note').value = '';
  renderAlphabet(lang);
  renderOverviewStats(lang);
  showToast('已添加字符');
}

function renderDict(lang) {
  const list = document.getElementById('dict-list');
  if (!list) return;
  const q = state.dictFilter.trim().toLowerCase();
  const words = lang.words
    .filter(w => !q || w.text.toLowerCase().includes(q) || w.meaning.toLowerCase().includes(q))
    .sort((a, b) => a.text.localeCompare(b.text, 'zh'));

  list.innerHTML = '';
  if (!words.length) {
    list.innerHTML = '<p class="hint" style="text-align:center;padding:20px">还没有词语，在上面添加</p>';
    return;
  }

  words.forEach(w => {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <div class="word">${escapeHtml(w.text)}</div>
      <div class="meaning">${escapeHtml(w.meaning)}</div>
      <div class="actions">
        <button type="button" class="icon-btn del" title="删除">🗑</button>
      </div>
      <div class="tags">${POS_LABELS[w.pos] || '其他'}${w.note ? ' · ' + escapeHtml(w.note) : ''}</div>`;
    row.querySelector('.del').addEventListener('click', () => {
      lang.words = lang.words.filter(x => x.id !== w.id);
      touchLang(lang);
      save();
      renderDict(lang);
      renderOverviewStats(lang);
    });
    list.appendChild(row);
  });
}

function addWord() {
  const lang = currentLang();
  if (!lang) return;
  const text = document.getElementById('word-text').value.trim();
  const meaning = document.getElementById('word-meaning').value.trim();
  const pos = document.getElementById('word-pos').value;
  const note = document.getElementById('word-note').value.trim();
  if (!text || !meaning) {
    showToast('词语和释义都要填');
    return;
  }
  lang.words.push({ id: uid(), text, meaning, pos, note });
  touchLang(lang);
  save();
  document.getElementById('word-text').value = '';
  document.getElementById('word-meaning').value = '';
  document.getElementById('word-note').value = '';
  renderDict(lang);
  renderOverviewStats(lang);
  showToast('已添加词语');
}

function saveGrammar() {
  const lang = currentLang();
  if (!lang) return;
  lang.grammar.wordOrder = document.getElementById('grammar-wordorder').value.trim();
  lang.grammar.rules = document.getElementById('grammar-rules').value.trim();
  lang.grammar.phrases = document.getElementById('grammar-phrases').value.trim();
  touchLang(lang);
  save();
  showToast('语法已保存');
}

function wordMap(lang) {
  const map = new Map();
  lang.words.forEach(w => {
    map.set(w.text.toLowerCase(), w);
  });
  return map;
}

function renderPlayground() {
  const lang = currentLang();
  const input = document.getElementById('play-input');
  const output = document.getElementById('play-output');
  if (!lang || !input || !output) return;

  const text = input.value;
  const map = wordMap(lang);
  const tokens = text.split(/(\s+|[,.!?;，。！？；、]+)/);

  output.innerHTML = tokens.map(tok => {
    if (/^\s+$/.test(tok) || /^[,.!?;，。！？；、]+$/.test(tok)) {
      return escapeHtml(tok);
    }
    const w = map.get(tok.toLowerCase());
    if (w) {
      return `<span class="play-token" title="${escapeHtml(w.meaning)}">${escapeHtml(tok)}</span>`;
    }
    if (tok) return `<span class="play-token unknown" title="未收录">${escapeHtml(tok)}</span>`;
    return '';
  }).join('');
}

function nextQuiz() {
  const lang = currentLang();
  const display = document.getElementById('quiz-display');
  const prompt = document.getElementById('quiz-prompt');
  const feedback = document.getElementById('quiz-feedback');
  const answer = document.getElementById('quiz-answer');
  if (!lang || !display) return;

  feedback.textContent = '';
  feedback.className = 'quiz-feedback';
  if (answer) answer.value = '';

  if (!lang.words.length) {
    display.textContent = '—';
    prompt.textContent = '请先在词库添加词语';
    state.quizCurrent = null;
    return;
  }

  state.quizCurrent = lang.words[Math.floor(Math.random() * lang.words.length)];
  if (state.quizMode === 'toWord') {
    prompt.textContent = '看释义，写出词语';
    display.textContent = state.quizCurrent.meaning;
  } else {
    prompt.textContent = '看词语，写出释义';
    display.textContent = state.quizCurrent.text;
  }
}

function checkQuiz() {
  const feedback = document.getElementById('quiz-feedback');
  const answer = document.getElementById('quiz-answer');
  if (!state.quizCurrent || !answer || !feedback) return;

  const user = answer.value.trim().toLowerCase();
  const expected = state.quizMode === 'toWord'
    ? state.quizCurrent.text.trim().toLowerCase()
    : state.quizCurrent.meaning.trim().toLowerCase();

  if (!user) {
    feedback.textContent = '先输入答案';
    feedback.className = 'quiz-feedback no';
    return;
  }

  if (user === expected) {
    feedback.textContent = '✓ 对了！';
    feedback.className = 'quiz-feedback ok';
  } else {
    feedback.textContent = `✗ 答案是：${state.quizMode === 'toWord' ? state.quizCurrent.text : state.quizCurrent.meaning}`;
    feedback.className = 'quiz-feedback no';
  }
}

function setQuizMode(mode) {
  state.quizMode = mode;
  document.getElementById('quiz-mode-meaning').classList.toggle('primary', mode === 'toWord');
  document.getElementById('quiz-mode-word').classList.toggle('primary', mode === 'toMeaning');
  nextQuiz();
}

function exportLang() {
  const lang = currentLang();
  if (!lang) return;
  const blob = new Blob([JSON.stringify(lang, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${lang.name.replace(/[^\w\u4e00-\u9fff-]/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('已导出 JSON');
}

function importLang(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const lang = normalizeLang(data);
      lang.id = uid();
      lang.createdAt = Date.now();
      touchLang(lang);
      state.languages.push(lang);
      save();
      renderHome();
      showToast(`已导入「${lang.name}」`);
      openLang(lang.id);
    } catch {
      showToast('导入失败，不是有效的语言文件');
    }
  };
  reader.readAsText(file);
}

function isTypingElement(el) {
  if (!el || el === document.body) return false;
  if (el.closest?.('input, textarea, select, [contenteditable="true"]')) return true;
  const tag = (el.tagName || '').toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select';
}

/** 组字过程中不跑 input 回调，避免 Mac 中文输入法被打断 */
function bindImeSafeInput(el, handler) {
  if (!el || el.dataset.imeSafeBound === '1') return;
  el.dataset.imeSafeBound = '1';
  let composing = false;
  el.addEventListener('compositionstart', () => {
    composing = true;
  });
  el.addEventListener('compositionend', e => {
    composing = false;
    handler(e);
  });
  el.addEventListener('input', e => {
    if (composing || e.isComposing) return;
    handler(e);
  });
}

function bindTypingFocus() {
  document.getElementById('app')?.addEventListener('focusin', e => {
    if (!isTypingElement(e.target)) return;
    if (miniDock.active) closeMiniGame();
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) {
      lastTextField = t;
    }
  });
  document.getElementById('modal-backdrop')?.addEventListener('focusin', e => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) {
      lastTextField = t;
    }
  });
}

/** 让 Mac / iPad 中文输入法正常组字（勿用 inputmode=search 等会锁英文键盘的属性） */
function bindImeFriendly() {
  const skipType = new Set(['color', 'file', 'range', 'checkbox', 'radio', 'button', 'submit', 'hidden']);
  document.querySelectorAll('#app input, #app textarea, #app select, #modal-backdrop input, #modal-backdrop textarea').forEach(el => {
    let type = (el.getAttribute('type') || 'text').toLowerCase();
    if (skipType.has(type)) return;
    if (type === 'search') {
      el.setAttribute('type', 'text');
      type = 'text';
    }
    el.setAttribute('lang', 'zh-CN');
    el.setAttribute('spellcheck', 'true');
    el.removeAttribute('inputmode');
    el.removeAttribute('autocapitalize');
    el.removeAttribute('enterkeyhint');
    el.removeAttribute('autocomplete');
  });
}

let lastTextField = null;

function insertAtCursor(el, text) {
  if (!el || !text) return;
  const start = typeof el.selectionStart === 'number' ? el.selectionStart : (el.value || '').length;
  const end = typeof el.selectionEnd === 'number' ? el.selectionEnd : start;
  const v = el.value || '';
  el.value = v.slice(0, start) + text + v.slice(end);
  const pos = start + text.length;
  try {
    el.focus();
    el.selectionStart = pos;
    el.selectionEnd = pos;
  } catch {}
  el.dispatchEvent(new Event('input', { bubbles: true }));
  showToast(`已加入：${text}`);
}

function fillCharPickers() {
  document.querySelectorAll('[data-char-picker-for]').forEach(box => {
    if (box.dataset.charPickerReady === '1') return;
    box.dataset.charPickerReady = '1';
    const targetId = box.dataset.charPickerFor;
    const label = document.createElement('div');
    label.className = 'char-picker-label';
    label.textContent = '拼音不好用？点字放进框里：';
    const row = document.createElement('div');
    row.className = 'char-picker-row';
    [...PICK_CHARS].forEach(ch => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'char-pick';
      btn.textContent = ch;
      btn.addEventListener('mousedown', e => {
        e.preventDefault();
        e.stopPropagation();
        insertAtCursor(document.getElementById(targetId), ch);
      });
      row.appendChild(btn);
    });
    box.appendChild(label);
    box.appendChild(row);
  });
}

function bindCapsLockHint() {
  const modalHint = document.getElementById('caps-hint-modal');
  const update = e => {
    if (!isTypingElement(e.target)) return;
    const on = e.getModifierState?.('CapsLock') === true;
    if (modalHint) modalHint.hidden = !on;
    if (on && e.key === 'CapsLock') {
      showToast('Caps Lock 大写锁定开着');
    }
  };
  document.addEventListener('keydown', update, true);
}

function bindQuickLangCreate() {
  document.querySelectorAll('[data-quick-lang]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      createLanguageQuick(btn.dataset.quickLang, btn.dataset.quickEmoji || '🌐');
    });
  });
  document.getElementById('btn-clear-lang-name')?.addEventListener('click', () => {
    const el = document.getElementById('new-lang-name');
    if (el) {
      el.value = '';
      el.focus();
    }
  });
}

function bindUI() {
  const ver = document.getElementById('app-version');
  if (ver) ver.textContent = APP_VERSION;

  document.getElementById('btn-back')?.addEventListener('click', () => {
    showScreen('home');
    renderHome();
  });

  bindTypingFocus();
  bindImeFriendly();
  fillCharPickers();
  bindQuickLangCreate();
  bindCapsLockHint();
  bindImeSafeInput(document.getElementById('lang-search'), () => renderHome());

  document.getElementById('modal-cancel')?.addEventListener('click', closeModal);
  document.getElementById('modal-create')?.addEventListener('click', createLanguage);
  document.getElementById('modal-backdrop')?.addEventListener('click', e => {
    if (e.target.id === 'modal-backdrop') closeModal();
  });

  document.querySelectorAll('#editor-tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => setTab(tab.dataset.tab));
  });

  document.getElementById('btn-add-alpha')?.addEventListener('click', addAlpha);
  document.getElementById('btn-add-word')?.addEventListener('click', addWord);
  document.getElementById('btn-save-grammar')?.addEventListener('click', saveGrammar);
  document.getElementById('btn-export')?.addEventListener('click', exportLang);

  bindImeSafeInput(document.getElementById('dict-search'), e => {
    state.dictFilter = e.target.value;
    const lang = currentLang();
    if (lang) renderDict(lang);
  });

  bindImeSafeInput(document.getElementById('play-input'), () => renderPlayground());

  document.getElementById('btn-quiz-check')?.addEventListener('click', checkQuiz);
  document.getElementById('btn-quiz-next')?.addEventListener('click', nextQuiz);
  document.getElementById('quiz-mode-meaning')?.addEventListener('click', () => setQuizMode('toWord'));
  document.getElementById('quiz-mode-word')?.addEventListener('click', () => setQuizMode('toMeaning'));

  document.getElementById('quiz-answer')?.addEventListener('keydown', e => {
    if (e.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter') checkQuiz();
  });

  document.getElementById('import-file')?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (file) importLang(file);
    e.target.value = '';
  });

  bindOverviewInputs();

}

const miniDock = {
  active: null,
  lastToggleAt: 0,
  closeTimer: null,
  bound: false,
};

const MINI_TITLES = {
  fish: '造鱼池',
  bubble: '吹泡泡',
  rain: '字母雨',
  star: '点星星',
};

const fishPond = {
  canvas: null,
  ctx: null,
  dpr: 1,
  w: 0,
  h: 0,
  fishes: [],
  bubbles: [],
  ripples: [],
  touches: 0,
  running: false,
  raf: null,
  bound: false,
  lastTapAt: 0,
};

const bubbleMini = {
  canvas: null,
  ctx: null,
  dpr: 1,
  w: 0,
  h: 0,
  items: [],
  popped: 0,
  running: false,
  raf: null,
  tapBound: false,
};

const rainMini = {
  canvas: null,
  ctx: null,
  dpr: 1,
  w: 0,
  h: 0,
  drops: [],
  caught: 0,
  running: false,
  raf: null,
  tapBound: false,
  spawnAt: 0,
};

const starMini = {
  canvas: null,
  ctx: null,
  dpr: 1,
  w: 0,
  h: 0,
  star: null,
  lit: 0,
  running: false,
  raf: null,
  bound: false,
  lastTapAt: 0,
};

const FISH_TYPES = ['🐟', '🐠', '🐡', '🦑'];
const FUN_GLYPHS = '☀️🌙⭐🌊🍃🔥💧🌸✨🦋🐚🌿🪸'.split('');
const FISH_SPEED_CAP = 0.72;
const FISH_BOOST_PEAK = 0.55;
const FISH_BOOST_STEP = 0.22;
const FISH_BOOST_MUL = 0.12;
const FISH_BOOST_DECAY = 1 / (3.5 * 60);

function randomPondGlyph() {
  const pool = [];
  state.languages.forEach(lang => {
    lang.alphabet.forEach(a => { if (a.glyph) pool.push(a.glyph); });
    lang.words.forEach(w => { if (w.text) pool.push(w.text.slice(0, 4)); });
    if (lang.emoji) pool.push(lang.emoji);
  });
  if (pool.length && Math.random() < 0.45) {
    return pool[Math.floor(Math.random() * pool.length)];
  }
  if (Math.random() < 0.35) {
    return FUN_GLYPHS[Math.floor(Math.random() * FUN_GLYPHS.length)];
  }
  const letters = 'abcdefghijklmnopqrstuvwxyz一二三四五六七八九十星月水木火风语言词语';
  return letters[Math.floor(Math.random() * letters.length)];
}

function pondReady() {
  return fishPond.w >= 40 && fishPond.h >= 40;
}

function clampFishInPond(f, w, h) {
  if (w < f.size * 2 || h < f.size * 2) {
    f.x = w / 2;
    f.y = h / 2;
    return;
  }
  f.x = Math.min(Math.max(f.size, f.x), w - f.size);
  f.y = Math.min(Math.max(f.size, f.y), h - f.size);
}

function fishInPond(f, w, h) {
  return f.x >= 0 && f.x <= w && f.y >= 0 && f.y <= h;
}

function spawnFish(count) {
  if (!pondReady()) return;
  fishPond.fishes = [];
  for (let i = 0; i < count; i += 1) {
    const size = 22 + Math.random() * 10;
    const baseVx = (Math.random() > 0.5 ? 1 : -1) * (0.28 + Math.random() * 0.32);
    const baseVy = (Math.random() - 0.5) * 0.2;
    const spanX = Math.max(20, fishPond.w - size * 2);
    const spanY = Math.max(20, fishPond.h - size * 2);
    fishPond.fishes.push({
      x: size + Math.random() * spanX,
      y: size + Math.random() * spanY,
      vx: baseVx,
      vy: baseVy,
      baseVx,
      baseVy,
      size,
      emoji: FISH_TYPES[i % FISH_TYPES.length],
      phase: Math.random() * Math.PI * 2,
      happy: 0,
      boost: 0,
    });
  }
}

function clampFishSpeed(f) {
  const spd = Math.hypot(f.vx, f.vy);
  if (spd > FISH_SPEED_CAP) {
    f.vx = (f.vx / spd) * FISH_SPEED_CAP;
    f.vy = (f.vy / spd) * FISH_SPEED_CAP;
  }
}

function bumpFishOnHit(f) {
  f.happy = 1;
  f.boost = Math.min(FISH_BOOST_PEAK, f.boost + FISH_BOOST_STEP);
  const dir = Math.sign(f.vx || f.baseVx) || 1;
  f.vx = -dir * Math.abs(f.baseVx);
  clampFishSpeed(f);
}

function updateFishMotion(f, w, h) {
  if (w < f.size * 2 || h < f.size * 2) return;

  f.boost = Math.max(0, f.boost - FISH_BOOST_DECAY);
  if (f.happy > 0) f.happy -= 0.04;

  const mul = 1 + f.boost * FISH_BOOST_MUL;
  const targetVx = Math.sign(f.vx || f.baseVx) * Math.min(Math.abs(f.baseVx) * mul, FISH_SPEED_CAP);
  const targetVy = Math.sign(f.vy || f.baseVy || 1) * Math.min(Math.abs(f.baseVy) * mul, FISH_SPEED_CAP * 0.55);
  f.vx += (targetVx - f.vx) * 0.04;
  f.vy += (targetVy - f.vy) * 0.04;

  f.phase += 0.04;
  f.x += f.vx;
  f.y += f.vy + Math.sin(f.phase) * 0.08;

  if (f.x < f.size) { f.x = f.size; f.vx = Math.abs(f.vx); }
  if (f.x > w - f.size) { f.x = w - f.size; f.vx = -Math.abs(f.vx); }
  if (f.y < f.size) { f.y = f.size; f.vy = Math.abs(f.vy); }
  if (f.y > h - f.size) { f.y = h - f.size; f.vy = -Math.abs(f.vy); }

  clampFishSpeed(f);
  clampFishInPond(f, w, h);
}

function ensurePondFish(force = false) {
  if (!pondReady()) return;
  const visible = fishPond.fishes.filter(f => fishInPond(f, fishPond.w, fishPond.h));
  if (force || !fishPond.fishes.length || visible.length < 2) {
    spawnFish(5);
  } else {
    fishPond.fishes.forEach(f => clampFishInPond(f, fishPond.w, fishPond.h));
  }
}

function resizeFishPond() {
  const canvas = fishPond.canvas;
  if (!canvas) return;
  const wrap = canvas.parentElement;
  if (!wrap) return;
  const w = wrap.clientWidth;
  const h = parseInt(getComputedStyle(canvas).height, 10) || 96;
  fishPond.dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(w * fishPond.dpr));
  canvas.height = Math.max(1, Math.floor(h * fishPond.dpr));
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  fishPond.ctx.setTransform(fishPond.dpr, 0, 0, fishPond.dpr, 0, 0);
  fishPond.w = w;
  fishPond.h = h;
  ensurePondFish(false);
}

function pondPointFromEvent(e) {
  const rect = fishPond.canvas.getBoundingClientRect();
  const t = e.touches?.[0] || e.changedTouches?.[0];
  const cx = t ? t.clientX : e.clientX;
  const cy = t ? t.clientY : e.clientY;
  return { x: cx - rect.left, y: cy - rect.top };
}

function tapFishPond(e) {
  if (!fishPond.canvas || document.getElementById('home-screen')?.hidden) return;
  const now = Date.now();
  if (now - fishPond.lastTapAt < 120) return;
  fishPond.lastTapAt = now;
  e.preventDefault();
  const p = pondPointFromEvent(e);
  let hit = null;
  fishPond.fishes.forEach(f => {
    const dx = p.x - f.x;
    const dy = p.y - f.y;
    const r = f.size * 0.9;
    if (dx * dx + dy * dy <= r * r && (!hit || f.size > hit.size)) hit = f;
  });
  if (!hit) return;
  bumpFishOnHit(hit);
  fishPond.touches += 1;
  fishPond.bubbles.push({
    x: hit.x,
    y: hit.y - hit.size * 0.4,
    vy: -0.55 - Math.random() * 0.35,
    life: 1,
    text: randomPondGlyph(),
    wobble: Math.random() * Math.PI * 2,
  });
  fishPond.ripples.push({ x: hit.x, y: hit.y, r: 8, life: 1 });
  const meta = document.getElementById('fish-pond-meta');
  if (meta) meta.textContent = `碰到了 ${fishPond.touches} 条小鱼`;
}

function drawFishPondFrame() {
  const { ctx } = fishPond;
  if (!ctx) return;
  if (!pondReady()) {
    resizeFishPond();
    return;
  }
  const { w, h } = fishPond;
  ensurePondFish(false);

  const t = performance.now() * 0.001;
  ctx.clearRect(0, 0, w, h);

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, 'rgba(255,255,255,0.35)');
  sky.addColorStop(0.45, 'rgba(184,232,240,0.15)');
  sky.addColorStop(1, 'rgba(92,184,168,0.25)');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    for (let x = 0; x <= w; x += 6) {
      const y = h * (0.25 + i * 0.22) + Math.sin(x * 0.02 + t * 1.2 + i) * 4;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  fishPond.ripples = fishPond.ripples.filter(r => r.life > 0.02);
  fishPond.ripples.forEach(r => {
    r.r += 1.6;
    r.life -= 0.035;
    ctx.strokeStyle = `rgba(255,255,255,${r.life * 0.55})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
    ctx.stroke();
  });

  fishPond.fishes.forEach(f => {
    updateFishMotion(f, w, h);

    ctx.save();
    ctx.translate(f.x, f.y);
    if (f.vx < 0) ctx.scale(-1, 1);
    const bounce = f.happy > 0 ? Math.sin(t * 18) * 4 * f.happy : Math.sin(f.phase) * 1.5;
    ctx.translate(0, bounce);
    ctx.font = `${f.size}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(f.emoji, 0, 0);
    ctx.restore();
  });

  fishPond.bubbles = fishPond.bubbles.filter(b => b.life > 0.02);
  fishPond.bubbles.forEach(b => {
    b.y += b.vy;
    b.wobble += 0.08;
    b.life -= 0.012;
    const r = 14 + (1 - b.life) * 6;
    ctx.fillStyle = `rgba(255,255,255,${b.life * 0.85})`;
    ctx.beginPath();
    ctx.arc(b.x + Math.sin(b.wobble) * 3, b.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(124,108,240,${b.life * 0.5})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = `rgba(42,40,56,${b.life * 0.9})`;
    ctx.font = `${Math.min(16, 10 + b.text.length * 2)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.text, b.x + Math.sin(b.wobble) * 3, b.y);
  });
}

function fishPondLoop() {
  if (!fishPond.running) return;
  drawFishPondFrame();
  fishPond.raf = requestAnimationFrame(fishPondLoop);
}

function startFishPond() {
  if (!fishPond.canvas || miniDock.active !== 'fish') return;
  if (!fishPond.running) {
    fishPond.running = true;
    fishPondLoop();
  }
}

function stopFishPond() {
  fishPond.running = false;
  if (fishPond.raf) {
    cancelAnimationFrame(fishPond.raf);
    fishPond.raf = null;
  }
}

function resizeMiniCanvas(state, canvas) {
  if (!canvas || !state.ctx) return;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width || canvas.parentElement?.clientWidth || 0;
  const h = rect.height || parseInt(getComputedStyle(canvas).height, 10) || 96;
  if (w < 1 || h < 1) return;
  state.dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(w * state.dpr));
  canvas.height = Math.max(1, Math.floor(h * state.dpr));
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  state.ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  state.w = w;
  state.h = h;
}

function ensureMiniCanvasSize(state, canvas, resizeFn) {
  if (!canvas) return false;
  if (!miniCanvasReady(state)) resizeFn();
  if (!miniCanvasReady(state)) {
    requestAnimationFrame(resizeFn);
  }
  return miniCanvasReady(state);
}

function miniCanvasReady(state) {
  return state.w >= 40 && state.h >= 40;
}

function miniPointFromEvent(state, e) {
  if (Number.isFinite(e.offsetX) && Number.isFinite(e.offsetY)) {
    return { x: e.offsetX, y: e.offsetY };
  }
  const rect = state.canvas.getBoundingClientRect();
  const scaleX = rect.width > 0 ? state.w / rect.width : 1;
  const scaleY = rect.height > 0 ? state.h / rect.height : 1;
  const cx = e.clientX ?? e.touches?.[0]?.clientX ?? e.changedTouches?.[0]?.clientX ?? 0;
  const cy = e.clientY ?? e.touches?.[0]?.clientY ?? e.changedTouches?.[0]?.clientY ?? 0;
  return { x: (cx - rect.left) * scaleX, y: (cy - rect.top) * scaleY };
}

function bindMiniCanvasTap(canvas, state, handler) {
  if (!canvas || state.tapBound) return;
  state.canvas = canvas;
  state.ctx = canvas.getContext('2d');
  state.tapBound = true;
  state._lastTapAt = 0;
  const onTap = e => {
    const now = Date.now();
    if (now - state._lastTapAt < 220) return;
    state._lastTapAt = now;
    e.preventDefault();
    handler(e);
  };
  canvas.addEventListener('pointerdown', onTap);
  canvas.addEventListener('click', onTap);
}

function findRainDropHit(p, drops) {
  let best = null;
  let bestScore = Infinity;
  drops.forEach(d => {
    const cy = d.y + d.size * 0.15;
    const halfW = Math.max(24, d.size * Math.max(1.1, d.text.length * 0.5));
    const halfH = d.size * 1.35;
    const dx = p.x - d.x;
    const dy = p.y - cy;
    if (Math.abs(dx) <= halfW && Math.abs(dy) <= halfH) {
      const score = dx * dx + dy * dy;
      if (score < bestScore) {
        bestScore = score;
        best = d;
      }
    }
  });
  if (best) return best;
  drops.forEach(d => {
    const cy = d.y + d.size * 0.15;
    const dx = p.x - d.x;
    const dy = p.y - cy;
    const score = dx * dx + dy * dy;
    if (score <= 32 * 32 && score < bestScore) {
      bestScore = score;
      best = d;
    }
  });
  return best;
}

function stopAllMiniGames() {
  stopFishPond();
  stopBubbleMini();
  stopRainMini();
  stopStarMini();
}

function openMiniGame(id, e) {
  e?.preventDefault();
  e?.stopPropagation();
  const now = Date.now();
  if (now - miniDock.lastToggleAt < 450) return;
  if (miniDock.active === id) return;
  miniDock.lastToggleAt = now;
  stopAllMiniGames();
  miniDock.active = id;

  const pop = document.getElementById('mini-popover');
  const title = document.getElementById('mini-popover-title');
  if (title) title.textContent = MINI_TITLES[id] || '小游戏';
  document.querySelectorAll('.mini-panel').forEach(p => {
    p.hidden = p.dataset.miniPanel !== id;
  });
  document.querySelectorAll('.mini-fab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mini === id);
  });

  if (pop) {
    if (miniDock.closeTimer) {
      clearTimeout(miniDock.closeTimer);
      miniDock.closeTimer = null;
    }
    pop.removeAttribute('hidden');
    requestAnimationFrame(() => pop.classList.add('open'));
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (id === 'fish') {
        resizeFishPond();
        ensurePondFish(true);
        startFishPond();
      } else if (id === 'bubble') {
        bubbleMini.items = [];
        resizeBubbleMini();
        ensureMiniCanvasSize(bubbleMini, bubbleMini.canvas, resizeBubbleMini);
        startBubbleMini();
      } else if (id === 'rain') {
        resizeRainMini();
        rainMini.spawnAt = performance.now();
        startRainMini();
      } else if (id === 'star') {
        resizeStarMini();
        spawnStarMini();
        startStarMini();
      }
    });
  });
}

function closeMiniGame(e) {
  e?.preventDefault();
  e?.stopPropagation();
  const now = Date.now();
  if (e && now - miniDock.lastToggleAt < 450) return;
  if (e) miniDock.lastToggleAt = now;
  stopAllMiniGames();
  miniDock.active = null;

  const pop = document.getElementById('mini-popover');
  document.querySelectorAll('.mini-fab').forEach(btn => btn.classList.remove('active'));
  if (pop) {
    pop.classList.remove('open');
    miniDock.closeTimer = setTimeout(() => {
      if (!miniDock.active) pop.setAttribute('hidden', '');
    }, 220);
  }
}

function bindMiniDock() {
  if (miniDock.bound) return;
  miniDock.bound = true;
  document.querySelectorAll('.mini-fab').forEach(btn => {
    btn.addEventListener('click', e => openMiniGame(btn.dataset.mini, e));
  });
  document.getElementById('mini-popover-close')?.addEventListener('click', closeMiniGame);
  window.addEventListener('resize', () => {
    if (miniDock.active === 'fish') resizeFishPond();
    else if (miniDock.active === 'bubble') resizeBubbleMini();
    else if (miniDock.active === 'rain') resizeRainMini();
    else if (miniDock.active === 'star') resizeStarMini();
  });
}

function bindFishPond() {
  const canvas = document.getElementById('fish-pond-canvas');
  if (!canvas || fishPond.bound) return;
  fishPond.canvas = canvas;
  fishPond.ctx = canvas.getContext('2d');
  fishPond.bound = true;
  canvas.addEventListener('click', tapFishPond);
  canvas.addEventListener('touchend', tapFishPond, { passive: false });
}

function startBubbleMini() {
  if (!bubbleMini.canvas || miniDock.active !== 'bubble') return;
  if (!bubbleMini.running) {
    bubbleMini.running = true;
    bubbleMiniLoop();
  }
}

function stopBubbleMini() {
  bubbleMini.running = false;
  if (bubbleMini.raf) {
    cancelAnimationFrame(bubbleMini.raf);
    bubbleMini.raf = null;
  }
}

function resizeBubbleMini() {
  if (!bubbleMini.canvas) return;
  resizeMiniCanvas(bubbleMini, bubbleMini.canvas);
}

function tapBubbleMini(e) {
  if (!bubbleMini.canvas || miniDock.active !== 'bubble') return;
  ensureMiniCanvasSize(bubbleMini, bubbleMini.canvas, resizeBubbleMini);
  if (!miniCanvasReady(bubbleMini)) return;
  const p = miniPointFromEvent(bubbleMini, e);
  let hit = null;
  bubbleMini.items.forEach(b => {
    if (b.pop > 0) return;
    const dx = p.x - b.x;
    const dy = p.y - b.y;
    const r = b.r * 0.82;
    if (dx * dx + dy * dy <= r * r && (!hit || r > hit.r)) hit = b;
  });
  if (hit) {
    hit.pop = 0.01;
    bubbleMini.popped += 1;
    const meta = document.getElementById('bubble-mini-meta');
    if (meta) meta.textContent = `点哪里，哪里冒泡 · 戳破了 ${bubbleMini.popped} 个`;
    return;
  }
  const r = 11 + Math.random() * 7;
  bubbleMini.items.push({
    x: Math.max(r, Math.min(bubbleMini.w - r, p.x)),
    y: Math.max(r, Math.min(bubbleMini.h - r, p.y)),
    r,
    vy: -0.32 - Math.random() * 0.18,
    wobble: Math.random() * Math.PI * 2,
    hue: 190 + Math.random() * 40,
    pop: 0,
  });
}

function drawBubbleMiniFrame() {
  if (!bubbleMini.ctx) return;
  if (!miniCanvasReady(bubbleMini)) {
    resizeBubbleMini();
    if (!miniCanvasReady(bubbleMini)) return;
  }
  const { ctx, w, h } = bubbleMini;
  ctx.clearRect(0, 0, w, h);
  bubbleMini.items = bubbleMini.items.filter(b => b.pop < 1 && b.y + b.r > -12);
  bubbleMini.items.forEach(b => {
    if (b.pop > 0) {
      b.pop += 0.08;
      b.r += 1.2;
      ctx.strokeStyle = `rgba(255,255,255,${1 - b.pop})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }
    b.wobble += 0.05;
    b.y += b.vy;
    b.x += Math.sin(b.wobble) * 0.15;
    const g = ctx.createRadialGradient(b.x - b.r * 0.25, b.y - b.r * 0.25, 1, b.x, b.y, b.r);
    g.addColorStop(0, `hsla(${b.hue}, 85%, 92%, 0.95)`);
    g.addColorStop(0.55, `hsla(${b.hue}, 70%, 72%, 0.55)`);
    g.addColorStop(1, `hsla(${b.hue}, 70%, 60%, 0.15)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  });
}

function bubbleMiniLoop() {
  if (!bubbleMini.running) return;
  drawBubbleMiniFrame();
  bubbleMini.raf = requestAnimationFrame(bubbleMiniLoop);
}

function bindBubbleMini() {
  bindMiniCanvasTap(document.getElementById('bubble-mini-canvas'), bubbleMini, tapBubbleMini);
}

function startRainMini() {
  if (!rainMini.canvas || miniDock.active !== 'rain') return;
  if (!rainMini.running) {
    rainMini.running = true;
    rainMiniLoop();
  }
}

function stopRainMini() {
  rainMini.running = false;
  if (rainMini.raf) {
    cancelAnimationFrame(rainMini.raf);
    rainMini.raf = null;
  }
}

function resizeRainMini() {
  if (!rainMini.canvas) return;
  resizeMiniCanvas(rainMini, rainMini.canvas);
}

function spawnRainDrop() {
  if (!miniCanvasReady(rainMini)) return;
  const size = 14 + Math.random() * 4;
  rainMini.drops.push({
    x: size + Math.random() * Math.max(10, rainMini.w - size * 2),
    y: -size,
    vy: 0.45 + Math.random() * 0.35,
    text: randomPondGlyph(),
    size,
  });
}

function tapRainMini(e) {
  if (!rainMini.canvas || miniDock.active !== 'rain') return;
  if (!miniCanvasReady(rainMini)) {
    resizeRainMini();
    if (!miniCanvasReady(rainMini)) return;
  }
  const p = miniPointFromEvent(rainMini, e);
  const hit = findRainDropHit(p, rainMini.drops);
  if (!hit) return;
  rainMini.drops = rainMini.drops.filter(d => d !== hit);
  rainMini.caught += 1;
  const meta = document.getElementById('rain-mini-meta');
  if (meta) meta.textContent = `接到了 ${rainMini.caught} 个字母`;
}

function drawRainMiniFrame() {
  const { ctx, w, h } = rainMini;
  if (!ctx || !miniCanvasReady(rainMini)) return;
  const now = performance.now();
  if (now - rainMini.spawnAt > 700) {
    spawnRainDrop();
    rainMini.spawnAt = now;
  }
  ctx.clearRect(0, 0, w, h);
  rainMini.drops = rainMini.drops.filter(d => d.y < h + d.size);
  rainMini.drops.forEach(d => {
    d.y += d.vy;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.ellipse(d.x, d.y + d.size * 0.55, d.size * 0.55, d.size * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a3560';
    ctx.font = `${d.size}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.text, d.x, d.y);
  });
}

function rainMiniLoop() {
  if (!rainMini.running) return;
  drawRainMiniFrame();
  rainMini.raf = requestAnimationFrame(rainMiniLoop);
}

function bindRainMini() {
  bindMiniCanvasTap(document.getElementById('rain-mini-canvas'), rainMini, tapRainMini);
}

function startStarMini() {
  if (!starMini.canvas || miniDock.active !== 'star') return;
  if (!starMini.running) {
    starMini.running = true;
    starMiniLoop();
  }
}

function stopStarMini() {
  starMini.running = false;
  if (starMini.raf) {
    cancelAnimationFrame(starMini.raf);
    starMini.raf = null;
  }
}

function resizeStarMini() {
  if (!starMini.canvas) return;
  resizeMiniCanvas(starMini, starMini.canvas);
}

function spawnStarMini() {
  if (!miniCanvasReady(starMini)) return;
  const pad = 16;
  starMini.star = {
    x: pad + Math.random() * Math.max(20, starMini.w - pad * 2),
    y: pad + Math.random() * Math.max(20, starMini.h - pad * 2),
    life: 1,
    pulse: Math.random() * Math.PI * 2,
  };
}

function tapStarMini(e) {
  if (!starMini.canvas || miniDock.active !== 'star') return;
  const now = Date.now();
  if (now - starMini.lastTapAt < 120) return;
  starMini.lastTapAt = now;
  e.preventDefault();
  if (!miniCanvasReady(starMini) || !starMini.star) return;
  const p = miniPointFromEvent(starMini, e);
  const s = starMini.star;
  const dx = p.x - s.x;
  const dy = p.y - s.y;
  if (dx * dx + dy * dy > 18 * 18) return;
  starMini.lit += 1;
  const meta = document.getElementById('star-mini-meta');
  if (meta) meta.textContent = `点亮了 ${starMini.lit} 颗星`;
  spawnStarMini();
}

function drawStarMiniFrame() {
  const { ctx, w, h } = starMini;
  if (!ctx || !miniCanvasReady(starMini)) return;
  ctx.clearRect(0, 0, w, h);
  for (let i = 0; i < 12; i += 1) {
    const sx = ((i * 47) % 100) / 100 * w;
    const sy = ((i * 29) % 100) / 100 * h;
    ctx.fillStyle = `rgba(255,255,255,${0.08 + (i % 3) * 0.04})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 1 + (i % 2), 0, Math.PI * 2);
    ctx.fill();
  }
  if (!starMini.star) spawnStarMini();
  const s = starMini.star;
  if (!s) return;
  s.life -= 0.006;
  s.pulse += 0.07;
  if (s.life <= 0) spawnStarMini();
  const glow = 0.55 + Math.sin(s.pulse) * 0.25;
  ctx.font = `${16 + glow * 6}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255, 230, 120, 0.9)';
  ctx.shadowBlur = 10 + glow * 8;
  ctx.fillStyle = `rgba(255, 236, 140, ${0.55 + s.life * 0.45})`;
  ctx.fillText('⭐', s.x, s.y);
  ctx.shadowBlur = 0;
}

function starMiniLoop() {
  if (!starMini.running) return;
  drawStarMiniFrame();
  starMini.raf = requestAnimationFrame(starMiniLoop);
}

function bindStarMini() {
  const canvas = document.getElementById('star-mini-canvas');
  if (!canvas || starMini.bound) return;
  starMini.canvas = canvas;
  starMini.ctx = canvas.getContext('2d');
  starMini.bound = true;
  canvas.addEventListener('click', tapStarMini);
  canvas.addEventListener('touchend', tapStarMini, { passive: false });
}

function init() {
  load();
  bindUI();
  bindMiniDock();
  bindFishPond();
  bindBubbleMini();
  bindRainMini();
  bindStarMini();
  showScreen('home');
  renderHome();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
