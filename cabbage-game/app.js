/**
 * 白菜对我笑 — 迷宫大逃杀（热梗版）
 * 八方轮盘 · 复杂环路迷宫 · 白菜挡正路
 */
const MAZES = [
  [
    '###############',
    '#P............#',
    '#.###...###...#',
    '#...#...#...#.#',
    '#.#.#####.#.#.#',
    '#.#.....#.#.#.#',
    '#...#...C...#.#',
    '#.###.#####.#.#',
    '#.....#.....#.#',
    '#.#####.###.#.#',
    '#...........#.#',
    '#...........#E#',
    '###############',
  ],
  [
    '###############',
    '#P............#',
    '#.#####.#####.#',
    '#.....#.....#.#',
    '#.###.#.###.#.#',
    '#.#...#...#.#.#',
    '#.#.###C###.#.#',
    '#.#.....#...#.#',
    '#.#####.#.###.#',
    '#.......#.....#',
    '#.#######.###.#',
    '#...........#E#',
    '###############',
  ],
  [
    '###############',
    '#P............#',
    '#...###.###...#',
    '#.#.#.....#.#.#',
    '#.#.#.###.#.#.#',
    '#...#...#...#.#',
    '#.#####C#####.#',
    '#.....#.....#.#',
    '#.###.#.###.#.#',
    '#.#...#...#...#',
    '#.#.#####.###.#',
    '#...........#E#',
    '###############',
  ],
  [
    '###############',
    '#P............#',
    '#.###.#.#####.#',
    '#.....#.....#.#',
    '#.#####.###.#.#',
    '#.....#...#...#',
    '#.###.#C#.#.#.#',
    '#.....#...#.#.#',
    '#.#####.###.#.#',
    '#...........#.#',
    '#.#######.###.#',
    '#...........#E#',
    '###############',
  ],
  [
    '###############',
    '#P...#........#',
    '###.#.#.#####.#',
    '#...#.#.....#.#',
    '#.###.###.#.#.#',
    '#.....#...#.#.#',
    '#.#####C#.#.#.#',
    '#.......#.#.#.#',
    '#.#######.#.#.#',
    '#.........#...#',
    '#.#######.###.#',
    '#...........#E#',
    '###############',
  ],
  [
    '###############',
    '#P............#',
    '#.#####.#####.#',
    '#.#...#...#.#.#',
    '#.#.#.#.#.#.#.#',
    '#...#...#...#.#',
    '#.###C###.###.#',
    '#.....#.......#',
    '#.#######.###.#',
    '#...........#.#',
    '#.#######.###.#',
    '#...........#E#',
    '###############',
  ],
  [
    '###############',
    '#P.#..........#',
    '#.#.#######.#.#',
    '#...#.....#.#.#',
    '###.#.###.#.#.#',
    '#...#.#...#.#.#',
    '#.###.#C#.#.#.#',
    '#.....#...#...#',
    '#.#######.###.#',
    '#.............#',
    '#.###########.#',
    '#...........#E#',
    '###############',
  ],
  [
    '###############',
    '#P............#',
    '#.###...###...#',
    '#.#.#.#.#.#.#.#',
    '#.#.#.#.#.#.#.#',
    '#...#...#...#.#',
    '#.#####C#####.#',
    '#.#.........#.#',
    '#.#.#######.#.#',
    '#...#.....#...#',
    '#.###.###.###.#',
    '#...........#E#',
    '###############',
  ],
  [
    '###############',
    '#P...#....#...#',
    '#.#.#.#..#.#..#',
    '#.#.###.##.#..#',
    '#...#...#..#..#',
    '###.#.###.#.#.#',
    '#...#...#C#...#',
    '#.#######.#.###',
    '#.........#...#',
    '#.#######.###.#',
    '#...........#.#',
    '#...........#E#',
    '###############',
  ],
  [
    '###############',
    '#P............#',
    '#.###.###.###.#',
    '#.#...#...#...#',
    '#.#.###C###.#.#',
    '#.#.....#...#.#',
    '#.#####.#.###.#',
    '#.....#.#.....#',
    '#.###.#.#.###.#',
    '#.#...#.#.....#',
    '#.#.###.#####.#',
    '#...........#E#',
    '###############',
  ],
  [
    '###############',
    '#P.#..........#',
    '#.#.#####.#.#.#',
    '#...#...#.#...#',
    '###.#.#.#.#.###',
    '#...#...#C#...#',
    '#.#####.#.#####',
    '#.....#.#.....#',
    '#.###.#.#.###.#',
    '#.........#...#',
    '#.#######.###.#',
    '#...........#E#',
    '###############',
  ],
  [
    '###############',
    '#P............#',
    '#.#####.#####.#',
    '#.....#.#.....#',
    '###.#.#.#.###.#',
    '#...#.#.#...#.#',
    '#.###C###.###.#',
    '#...#.....#...#',
    '#.#######.#.###',
    '#.........#...#',
    '#.#######.###.#',
    '#...........#E#',
    '###############',
  ],
];

const MOVE_DIRS = [
  [0, -1], [1, -1], [1, 0], [1, 1],
  [0, 1], [-1, 1], [-1, 0], [-1, -1],
];

const WHEEL_SECTORS = [
  { dx: 0, dy: -1, angle: 0 },
  { dx: 1, dy: -1, angle: 45 },
  { dx: 1, dy: 0, angle: 90 },
  { dx: 1, dy: 1, angle: 135 },
  { dx: 0, dy: 1, angle: 180 },
  { dx: -1, dy: 1, angle: 225 },
  { dx: -1, dy: 0, angle: 270 },
  { dx: -1, dy: -1, angle: 315 },
];

const CABBAGE_MOVE_EVERY = 2;
const HEAD_START_MOVES = 4;

const PICKUP_TYPES = [
  {
    id: 'garlic',
    name: '大蒜',
    fig: 'garlic',
    class: 'pickup-garlic',
    brief: '定住白菜',
    apply() { state.effects.freeze = 5; },
  },
  {
    id: 'chili',
    name: '辣椒',
    fig: 'chili',
    class: 'pickup-chili',
    brief: '白菜变慢',
    apply() { state.effects.slow = 6; },
  },
  {
    id: 'soap',
    name: '肥皂',
    fig: 'soap',
    class: 'pickup-soap',
    brief: '推开白菜',
    apply() { teleportCabbageAway(); },
  },
  {
    id: 'mint',
    name: '薄荷',
    fig: 'mint',
    class: 'pickup-mint',
    brief: '出口高亮',
    apply() { state.effects.glow = 8; },
  },
  {
    id: 'mushroom',
    name: '蘑菇',
    fig: 'mushroom',
    class: 'pickup-mushroom',
    brief: '出口高亮',
    apply() { state.effects.glow = 6; },
  },
  {
    id: 'paddle',
    name: '拍子',
    fig: 'paddle',
    class: 'pickup-paddle',
    brief: '拍飞白菜',
    apply() { teleportCabbageAway(); state.effects.freeze = 3; },
  },
];

const CABBAGE_TAUNTS = [
  '白菜：嘿嘿，闻到你了～',
  '白菜：别跑呀，对我笑一个！',
  '白菜：迷宫是我家，你跑不掉的',
  '白菜：越跑越香是怎么回事',
  '白菜：等等我嘛～',
];

const LOSE_LINES = [
  '白菜对我笑～',
  '被白菜贴脸了！',
  '笑什么笑，先跑了再说',
];

const FACE_TAUNTS = [
  '白菜对我笑～',
  '抓到你了…诶？',
  '别跑呀哈哈哈',
  '笑一个嘛！',
];

const MOOD_LABEL = {
  lazy: '装死型',
  chase: '猛追型',
  blocker: '堵路型',
};

const CHAPTERS = [
  {
    name: '第一章 · 初见白菜',
    moods: ['lazy', 'lazy', 'lazy', 'lazy'],
    cabbageCount: [1, 1, 1, 1],
    pickupMin: 2,
    pickupMax: 2,
    headStartBonus: 3,
    moveEvery: 3,
  },
  {
    name: '第二章 · 它学坏了',
    moods: ['chase', 'blocker', 'lazy', 'chase'],
    cabbageCount: [1, 1, 1, 1],
    pickupMin: 1,
    pickupMax: 2,
    headStartBonus: 2,
    moveEvery: 2,
  },
  {
    name: '第三章 · 噩梦追击',
    moods: ['chase', 'blocker', 'chase', 'blocker'],
    cabbageCount: [1, 1, 2, 2],
    pickupMin: 0,
    pickupMax: 1,
    headStartBonus: 1,
    moveEvery: 2,
  },
];

const state = {
  maze: [],
  rows: 0,
  cols: 0,
  player: { x: 0, y: 0 },
  cabbages: [],
  exit: { x: 0, y: 0 },
  pickups: [],
  effects: { freeze: 0, slow: 0, glow: 0, block: 0 },
  combatFlash: false,
  pickupToast: '',
  parMoves: 20,
  wins: 0,
  thrillingEscapes: 0,
  over: false,
  locked: false,
  moveCount: 0,
  mazeIndex: -1,
  lastResult: null,
  lastStars: 0,
  winNearMiss: false,
  faceTaunt: '',
  levelCfg: null,
  spawn: null,
  staticRoute: null,
  exitGateIdx: 0,
  revealedTruePath: null,
  gameMode: 'story',
  endlessFloor: 1,
  sprintSecondsLeft: 0,
  sprintTimerId: null,
};

function $(id) {
  return document.getElementById(id);
}

function loadWins() {
  try {
    state.wins = parseInt(localStorage.getItem('cabbage_maze_wins_v1'), 10) || 0;
  } catch {}
}

function saveWins() {
  try {
    localStorage.setItem('cabbage_maze_wins_v1', String(state.wins));
  } catch {}
}

function loadThrills() {
  try {
    state.thrillingEscapes = parseInt(localStorage.getItem('cabbage_maze_thrills_v1'), 10) || 0;
  } catch {}
}

function saveThrills() {
  try {
    localStorage.setItem('cabbage_maze_thrills_v1', String(state.thrillingEscapes));
  } catch {}
}

function chapterForLevel(idx) {
  return CHAPTERS[Math.min(Math.floor(idx / 4), CHAPTERS.length - 1)];
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateProceduralMaze(cols = 15, rows = 13) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(1));
  function carve(x, y) {
    grid[y][x] = 0;
    shuffle([[0, -2], [0, 2], [-2, 0], [2, 0]]).forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && grid[ny][nx] === 1) {
        grid[y + dy / 2][x + dx / 2] = 0;
        carve(nx, ny);
      }
    });
  }
  carve(1, 1);
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (x === 0 || y === 0 || x === cols - 1 || y === rows - 1) grid[y][x] = 1;
    }
  }
  const floors = [];
  for (let y = 1; y < rows - 1; y += 1) {
    for (let x = 1; x < cols - 1; x += 1) {
      if (grid[y][x] === 0) floors.push({ x, y });
    }
  }
  const start = floors[0] || { x: 1, y: 1 };
  let exit = floors[floors.length - 1] || start;
  for (let i = floors.length - 1; i >= 0; i -= 1) {
    const p = floors[i];
    if (Math.abs(p.x - start.x) + Math.abs(p.y - start.y) > 8) {
      exit = p;
      break;
    }
  }
  const cabbageSpot = floors[Math.floor(floors.length * 0.45)] || start;
  const lines = grid.map(row => row.map(c => (c ? '#' : '.')).join(''));
  const py = start.y;
  const px = start.x;
  const cy = cabbageSpot.y;
  const cx = cabbageSpot.x;
  const ey = exit.y;
  const ex = exit.x;
  lines[py] = `${lines[py].slice(0, px)}P${lines[py].slice(px + 1)}`;
  if (!(cy === py && cx === px)) lines[cy] = `${lines[cy].slice(0, cx)}C${lines[cy].slice(cx + 1)}`;
  lines[ey] = `${lines[ey].slice(0, ex)}E${lines[ey].slice(ex + 1)}`;
  return lines;
}

function stopSprintTimer() {
  if (state.sprintTimerId) {
    clearInterval(state.sprintTimerId);
    state.sprintTimerId = null;
  }
}

function startSprintTimer() {
  stopSprintTimer();
  state.sprintSecondsLeft = 60;
  const el = $('sprint-timer');
  if (el) {
    el.hidden = false;
    el.textContent = `⏱ ${state.sprintSecondsLeft}s`;
    el.classList.remove('urgent');
  }
  state.sprintTimerId = setInterval(() => {
    state.sprintSecondsLeft -= 1;
    if (el) {
      el.textContent = `⏱ ${Math.max(0, state.sprintSecondsLeft)}s`;
      el.classList.toggle('urgent', state.sprintSecondsLeft <= 10);
    }
    if (state.sprintSecondsLeft <= 0 && !state.over) {
      state.over = true;
      stopSprintTimer();
      showMemeOverlay(false);
      const status = $('game-status');
      if (status) status.textContent = '时间到！白菜还在笑…';
    }
  }, 1000);
}

function setGameMode(mode) {
  if (!['story', 'endless', 'sprint'].includes(mode)) return;
  state.gameMode = mode;
  document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  stopSprintTimer();
  const sprintEl = $('sprint-timer');
  if (sprintEl) sprintEl.hidden = mode !== 'sprint';
  hideMemeOverlay();
  resetRound();
  if (mode === 'story') loadMazeByIndex(Math.max(0, state.mazeIndex));
  else if (mode === 'endless') loadEndlessFloor(1);
  else loadSprintMaze();
  renderMaze();
}

function loadEndlessFloor(floor) {
  clearEffects();
  state.endlessFloor = Math.max(1, floor | 0);
  state.mazeIndex = -1;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    parseMaze(generateProceduralMaze());
    if (pathExists(state.player, state.exit, true, false)) break;
  }
  const chapter = CHAPTERS[Math.min(Math.floor((state.endlessFloor - 1) / 4), CHAPTERS.length - 1)];
  state.levelCfg = {
    chapter,
    slot: (state.endlessFloor - 1) % 4,
    mood: 'chase',
    cabbageCount: Math.min(2, 1 + Math.floor(state.endlessFloor / 4)),
    pickupCount: state.endlessFloor >= 4 && Math.random() > 0.45 ? 1 : 0,
  };
  state.parMoves = computeParMoves();
  setupLevelChapter();
  placePickups();
  state.revealedTruePath = null;
  state.staticRoute = null;
}

function loadSprintMaze() {
  loadEndlessFloor(1 + Math.floor(Math.random() * 3));
  state.levelCfg.chapter = { ...CHAPTERS[0], moveEvery: 1, headStartBonus: 1 };
  startSprintTimer();
}

function isNightmareChapter() {
  return chapterForLevel(state.mazeIndex) === CHAPTERS[2];
}

function isExitPhantomWall(x, y) {
  if (!isNightmareChapter()) return false;
  if (state.maze[y]?.[x] !== '#') return false;
  const { x: ex, y: ey } = state.exit;
  return x === ex - 1 && y === ey;
}

function isWalkableForPlayer(x, y) {
  if (x < 0 || y < 0 || x >= state.cols || y >= state.rows) return false;
  if (state.maze[y][x] !== '#') return true;
  return isExitPhantomWall(x, y);
}

function pathKey(x, y) {
  return `${x},${y}`;
}

function wallNeighborCount(x, y) {
  return MOVE_DIRS.filter(([dx, dy]) => !isWalkable(x + dx, y + dy)).length;
}

function findExitGateIdx(routePath) {
  if (!routePath || routePath.length < 2) return 0;
  for (let i = routePath.length - 2; i >= 0; i -= 1) {
    const { x, y } = routePath[i];
    if (wallNeighborCount(x, y) >= 2) return i;
  }
  return Math.max(0, routePath.length - 3);
}

function initNightmareRoute() {
  state.revealedTruePath = new Set();
  if (!isNightmareChapter()) {
    state.spawn = null;
    state.staticRoute = null;
    state.exitGateIdx = 0;
    return;
  }
  state.spawn = { x: state.player.x, y: state.player.y };
  state.staticRoute = bfsPath(state.spawn, state.exit, false, true) || [];
  state.exitGateIdx = findExitGateIdx(state.staticRoute);
}

function revealPathSegment(path, startIdx, endIdx) {
  if (!path?.length) return;
  const end = Math.min(endIdx, path.length - 1);
  for (let i = Math.max(0, startIdx); i <= end; i += 1) {
    state.revealedTruePath.add(pathKey(path[i].x, path[i].y));
  }
}

function updateNightmareReveal(prevDist) {
  if (!isNightmareChapter() || state.over) return;
  const dist = manhattan(state.player, state.exit);
  if (dist >= prevDist) return;

  const dynamic = bfsPath(state.player, state.exit, true, true);
  if (dynamic) revealPathSegment(dynamic, 0, dynamic.length - 1);

  if (!state.staticRoute?.length) return;
  const idx = state.staticRoute.findIndex(p => p.x === state.player.x && p.y === state.player.y);
  if (idx < 0) return;

  const nearExit = dist <= 4 || idx >= state.exitGateIdx;
  const end = nearExit ? state.staticRoute.length - 1 : state.exitGateIdx;
  revealPathSegment(state.staticRoute, idx, end);
}

function buildLevelConfig(idx) {
  const chapter = chapterForLevel(idx);
  const slot = idx % 4;
  const pickupMax = chapter.pickupMax;
  const pickupMin = chapter.pickupMin;
  let pickupCount = pickupMax;
  if (pickupMax > pickupMin) {
    pickupCount = pickupMin + Math.floor(Math.random() * (pickupMax - pickupMin + 1));
  }
  return {
    chapter,
    slot,
    mood: chapter.moods[slot] || 'chase',
    cabbageCount: chapter.cabbageCount[slot] || 1,
    pickupCount,
  };
}

function levelCfg() {
  if (!state.levelCfg) state.levelCfg = buildLevelConfig(state.mazeIndex);
  return state.levelCfg;
}

function cabbageAt(x, y) {
  return state.cabbages.some(c => c.x === x && c.y === y);
}

function cabbagesAt(x, y) {
  return state.cabbages.filter(c => c.x === x && c.y === y);
}

function minCabbageDist() {
  if (!state.cabbages.length) return Infinity;
  return Math.min(...state.cabbages.map(c => manhattan(state.player, c)));
}

function closestCabbage() {
  if (!state.cabbages.length) return null;
  return state.cabbages.reduce((best, c) => (
    manhattan(state.player, c) < manhattan(state.player, best) ? c : best
  ));
}

function cabbageTarget(cabbage) {
  if (cabbage.mood === 'blocker') {
    const path = bfsPath(state.player, state.exit, true, isNightmareChapter());
    if (path && path.length > 3) {
      const idx = Math.max(1, Math.floor(path.length * 0.45));
      return path[idx];
    }
    if (path && path.length > 1) return path[1];
  }
  return state.player;
}

function parseMaze(lines) {
  state.maze = lines.map(row => row.split(''));
  state.rows = state.maze.length;
  state.cols = state.maze[0].length;
  state.cabbages = [];
  for (let y = 0; y < state.rows; y += 1) {
    for (let x = 0; x < state.cols; x += 1) {
      const c = state.maze[y][x];
      if (c === 'P') {
        state.player = { x, y };
        state.maze[y][x] = '.';
      } else if (c === 'C') {
        state.cabbages.push({ x, y, mood: 'chase' });
        state.maze[y][x] = '.';
      } else if (c === 'E') {
        state.exit = { x, y };
        state.maze[y][x] = '.';
      } else if (c === '#') {
        state.maze[y][x] = '#';
      } else {
        state.maze[y][x] = '.';
      }
    }
  }
}

function spawnExtraCabbage() {
  const cfg = levelCfg();
  while (state.cabbages.length < cfg.cabbageCount) {
    let best = null;
    let bestScore = -1;
    const path = bfsPath(state.player, state.exit, true);
    const pathSet = new Set((path || []).map(p => `${p.x},${p.y}`));
    for (let y = 0; y < state.rows; y += 1) {
      for (let x = 0; x < state.cols; x += 1) {
        if (!isWalkable(x, y)) continue;
        if (x === state.player.x && y === state.player.y) continue;
        if (x === state.exit.x && y === state.exit.y) continue;
        if (cabbageAt(x, y)) continue;
        if (hasPickupAt(x, y)) continue;
        const onRoute = pathSet.has(`${x},${y}`) ? 2 : 0;
        const score = manhattan({ x, y }, state.player) + onRoute;
        if (score > bestScore) {
          bestScore = score;
          best = { x, y };
        }
      }
    }
    if (!best) break;
    state.cabbages.push({ x: best.x, y: best.y, mood: cfg.mood });
  }
}

function setupLevelChapter() {
  const cfg = levelCfg();
  if (!state.cabbages.length) {
    spawnExtraCabbage();
  }
  state.cabbages.forEach((c) => {
    c.mood = cfg.mood;
  });
  spawnExtraCabbage();
}

function isWalkable(x, y) {
  if (x < 0 || y < 0 || x >= state.cols || y >= state.rows) return false;
  return state.maze[y][x] !== '#';
}

function hasPickupAt(x, y) {
  return state.pickups.some(p => p.x === x && p.y === y);
}

function isWalkableForCabbage(x, y) {
  if (!isWalkable(x, y)) return false;
  if (hasPickupAt(x, y)) return false;
  return true;
}

function pickupBetween(a, b) {
  for (let i = 0; i < state.pickups.length; i += 1) {
    const p = state.pickups[i];
    if (a.x === b.x && p.x === a.x) {
      const lo = Math.min(a.y, b.y);
      const hi = Math.max(a.y, b.y);
      if (p.y > lo && p.y < hi) return p;
    }
    if (a.y === b.y && p.y === a.y) {
      const lo = Math.min(a.x, b.x);
      const hi = Math.max(a.x, b.x);
      if (p.x > lo && p.x < hi) return p;
    }
  }
  return null;
}

function isBlockedByCabbage(x, y) {
  return cabbageAt(x, y);
}

function canStep(dx, dy) {
  return isWalkableForPlayer(state.player.x + dx, state.player.y + dy);
}

function stepBlockReason(dx, dy) {
  if (!canStep(dx, dy)) return '这边是墙，过不去';
  return '';
}

function bfsPath(from, to, avoidCabbage, forPlayer = false) {
  const pass = (x, y) => (forPlayer ? isWalkableForPlayer(x, y) : isWalkable(x, y));
  const key = (x, y) => `${x},${y}`;
  const queue = [{ x: from.x, y: from.y, path: [{ x: from.x, y: from.y }] }];
  const seen = new Set([key(from.x, from.y)]);

  while (queue.length) {
    const node = queue.shift();
    if (node.x === to.x && node.y === to.y) return node.path;
    MOVE_DIRS.forEach(([dx, dy]) => {
      const nx = node.x + dx;
      const ny = node.y + dy;
      const k = key(nx, ny);
      if (!pass(nx, ny) || seen.has(k)) return;
      if (avoidCabbage && cabbageAt(nx, ny)) return;
      seen.add(k);
      queue.push({ x: nx, y: ny, path: node.path.concat([{ x: nx, y: ny }]) });
    });
  }
  return null;
}

function pathExists(from, to, avoidCabbage = false, forPlayer = false) {
  return bfsPath(from, to, avoidCabbage, forPlayer) !== null;
}

function headStartForLevel() {
  const cfg = levelCfg();
  let base = HEAD_START_MOVES + (cfg.chapter.headStartBonus || 0);
  const moods = state.cabbages.map(c => c.mood);
  if (moods.length && moods.every(m => m === 'lazy')) base += 2;
  return Math.max(3, base);
}

function cabbageMoveEvery() {
  const cfg = levelCfg();
  let every = cfg.chapter.moveEvery || 2;
  const moods = state.cabbages.map(c => c.mood);
  if (moods.length && moods.every(m => m === 'lazy')) every = Math.max(every, 3);
  return every;
}

function computeParMoves() {
  const forPlayer = isNightmareChapter();
  const path = bfsPath(state.player, state.exit, true, forPlayer);
  if (!path) return 22;
  return path.length - 1 + 4;
}

function pickupDef(id) {
  return PICKUP_TYPES.find(p => p.id === id);
}

function pickupAt(x, y) {
  return state.pickups.find(p => p.x === x && p.y === y);
}

function pickupCandidateCells() {
  const taken = new Set([
    `${state.player.x},${state.player.y}`,
    `${state.exit.x},${state.exit.y}`,
  ]);
  state.cabbages.forEach(c => taken.add(`${c.x},${c.y}`));
  const candidates = [];
  for (let y = 0; y < state.rows; y += 1) {
    for (let x = 0; x < state.cols; x += 1) {
      if (!isWalkable(x, y)) continue;
      const k = `${x},${y}`;
      if (taken.has(k)) continue;
      if (manhattan({ x, y }, state.player) < 4) continue;
      if (state.cabbages.some(c => manhattan({ x, y }, c) < 2)) continue;
      candidates.push({ x, y });
    }
  }
  return candidates;
}

function placePickups() {
  state.pickups = [];
  const cfg = levelCfg();
  const count = cfg.pickupCount;
  if (count <= 0) return;
  const pool = PICKUP_TYPES.map(p => p.id);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const types = pool.slice(0, count);
  const cells = pickupCandidateCells();
  types.forEach((typeId) => {
    if (!cells.length) return;
    const idx = Math.floor(Math.random() * cells.length);
    const spot = cells.splice(idx, 1)[0];
    state.pickups.push({ x: spot.x, y: spot.y, typeId });
  });
}

function farthestCellFromPlayer(skipCabbages = true) {
  let best = null;
  let bestDist = -1;
  for (let y = 0; y < state.rows; y += 1) {
    for (let x = 0; x < state.cols; x += 1) {
      if (!isWalkable(x, y)) continue;
      if (x === state.player.x && y === state.player.y) continue;
      if (x === state.exit.x && y === state.exit.y) continue;
      if (state.pickups.some(p => p.x === x && p.y === y)) continue;
      if (skipCabbages && cabbageAt(x, y)) continue;
      const d = manhattan({ x, y }, state.player);
      if (d > bestDist) {
        bestDist = d;
        best = { x, y };
      }
    }
  }
  return best;
}

function teleportCabbageAway() {
  state.cabbages.forEach((cabbage) => {
    const spot = farthestCellFromPlayer(true);
    if (spot) {
      cabbage.x = spot.x;
      cabbage.y = spot.y;
    }
  });
}

function collectPickup(x, y) {
  const idx = state.pickups.findIndex(p => p.x === x && p.y === y);
  if (idx < 0) return;
  const item = state.pickups[idx];
  const def = pickupDef(item.typeId);
  state.pickups.splice(idx, 1);
  if (def) {
    def.apply();
    state.effects.block += 1;
    state.pickupToast = `${def.name}！${def.brief} · 护体+1（碰到白菜不算输）`;
  }
}

function activeEffectHud() {
  if (state.effects.block > 0) return { name: '道具护体', turns: state.effects.block, unit: '次' };
  if (state.effects.freeze > 0) return { name: '大蒜', turns: state.effects.freeze, unit: '步' };
  if (state.effects.slow > 0) return { name: '辣椒', turns: state.effects.slow, unit: '步' };
  if (state.effects.glow > 0) return { name: '薄荷', turns: state.effects.glow, unit: '步' };
  return null;
}

function tickEffectsAfterTurn() {
  if (state.effects.glow > 0) state.effects.glow -= 1;
  if (state.effects.slow > 0) state.effects.slow -= 1;
}

function updatePickupLegend() {
  const el = $('pickup-legend');
  if (!el) return;
  if (!state.pickups.length) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = state.pickups.map((p) => {
    const def = pickupDef(p.typeId);
    if (!def) return '';
    return `<span class="legend-item pickup-tag"><span class="legend-icon">${fig(def.fig, 'token token-legend')}</span>${def.name}</span>`;
  }).join('');
}

function starsForMoves(moves, par, nearMiss) {
  let stars = 1;
  if (moves <= par) stars = 3;
  else if (moves <= par + 5) stars = 2;
  if (nearMiss) stars = Math.min(3, stars + 1);
  return stars;
}

function pickTaunt(seed) {
  return CABBAGE_TAUNTS[Math.abs(seed) % CABBAGE_TAUNTS.length];
}

function cabbageBlocksMainRoute() {
  const direct = bfsPath(state.player, state.exit, false, isNightmareChapter());
  if (!direct) return false;
  const onRoute = direct.some(p => cabbageAt(p.x, p.y));
  if (!onRoute) return false;
  return pathExists(state.player, state.exit, true);
}

function bfsNextStep(from, to, forCabbage = false) {
  const pass = (x, y) => (forCabbage ? isWalkableForCabbage(x, y) : isWalkable(x, y));
  const key = (x, y) => `${x},${y}`;
  const queue = [{ x: from.x, y: from.y, path: [] }];
  const seen = new Set([key(from.x, from.y)]);

  while (queue.length) {
    const node = queue.shift();
    if (node.x === to.x && node.y === to.y) {
      return node.path[0] || null;
    }
    MOVE_DIRS.forEach(([dx, dy]) => {
      const nx = node.x + dx;
      const ny = node.y + dy;
      const k = key(nx, ny);
      if (!pass(nx, ny) || seen.has(k)) return;
      seen.add(k);
      queue.push({ x: nx, y: ny, path: node.path.concat([{ x: nx, y: ny }]) });
    });
  }
  return null;
}

function moveOneCabbage(cabbage, reserved) {
  const target = cabbageTarget(cabbage);
  const next = bfsNextStep(cabbage, target, true);
  if (next) {
    const k = `${next.x},${next.y}`;
    if (!reserved.has(k)) {
      reserved.add(k);
      return { x: next.x, y: next.y };
    }
  }
  const options = MOVE_DIRS
    .map(([dx, dy]) => ({ x: cabbage.x + dx, y: cabbage.y + dy }))
    .filter(p => isWalkableForCabbage(p.x, p.y))
    .filter(p => !reserved.has(`${p.x},${p.y}`))
    .sort((a, b) => manhattan(b, state.player) - manhattan(a, state.player));
  if (options.length) {
    const pick = options[0];
    reserved.add(`${pick.x},${pick.y}`);
    return pick;
  }
  return null;
}

function moveCabbage() {
  if (state.effects.freeze > 0) {
    state.effects.freeze -= 1;
    return;
  }
  const headStart = headStartForLevel();
  let moveEvery = cabbageMoveEvery();
  if (state.effects.slow > 0) moveEvery *= 2;
  if (state.moveCount <= headStart) return;
  if ((state.moveCount - headStart) % moveEvery !== 0) return;

  const reserved = new Set();
  state.cabbages.forEach((cabbage) => {
    const dest = moveOneCabbage(cabbage, reserved);
    if (dest) {
      cabbage.x = dest.x;
      cabbage.y = dest.y;
    }
  });
}

function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function exitDirectionHint() {
  const dx = state.exit.x - state.player.x;
  const dy = state.exit.y - state.player.y;
  const parts = [];
  if (dy < 0) parts.push('上');
  if (dy > 0) parts.push('下');
  if (dx < 0) parts.push('左');
  if (dx > 0) parts.push('右');
  const dir = parts.length ? parts.join('') : '这里';
  return `出口在${dir}方 · 还有 ${manhattan(state.player, state.exit)} 格`;
}

function applyCellRound(cell, x, y, isWall) {
  const blocked = (dx, dy) => !isWalkable(x + dx, y + dy);
  if (isWall) {
    if (!blocked(0, -1) && !blocked(-1, 0)) cell.classList.add('round-nw');
    if (!blocked(0, -1) && !blocked(1, 0)) cell.classList.add('round-ne');
    if (!blocked(0, 1) && !blocked(-1, 0)) cell.classList.add('round-sw');
    if (!blocked(0, 1) && !blocked(1, 0)) cell.classList.add('round-se');
    return;
  }
  if (blocked(0, -1) && blocked(-1, 0)) cell.classList.add('round-nw');
  if (blocked(0, -1) && blocked(1, 0)) cell.classList.add('round-ne');
  if (blocked(0, 1) && blocked(-1, 0)) cell.classList.add('round-sw');
  if (blocked(0, 1) && blocked(1, 0)) cell.classList.add('round-se');
}

function layoutMazeGrid() {
  const wrap = document.querySelector('.maze-wrap');
  const el = $('maze');
  if (!wrap || !el) return;
  const width = wrap.clientWidth || wrap.parentElement?.clientWidth || 360;
  const cellPx = Math.max(18, Math.floor(width / state.cols));
  const fontPx = Math.max(13, Math.floor(cellPx * 0.72));
  const exitPx = Math.max(16, Math.floor(cellPx * 0.88));
  el.style.setProperty('--cell-font', `${fontPx}px`);
  el.style.setProperty('--exit-font', `${exitPx}px`);
  el.style.gridTemplateColumns = `repeat(${state.cols}, ${cellPx}px)`;
  el.style.width = `${cellPx * state.cols}px`;
}

function renderMaze() {
  const el = $('maze');
  if (!el) return;
  el.innerHTML = '';
  layoutMazeGrid();

  for (let y = 0; y < state.rows; y += 1) {
    for (let x = 0; x < state.cols; x += 1) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.setAttribute('role', 'gridcell');

      const isExit = x === state.exit.x && y === state.exit.y;
      const isPlayer = x === state.player.x && y === state.player.y;
      const isPhantom = isExitPhantomWall(x, y);
      const isWall = state.maze[y][x] === '#' && !(isPhantom && isPlayer);
      const cabbagesHere = cabbagesAt(x, y);
      const isCabbage = cabbagesHere.length > 0;

      if (isWall) {
        cell.classList.add('wall');
      } else if (state.revealedTruePath?.has(pathKey(x, y))) {
        cell.classList.add('true-path');
      }
      applyCellRound(cell, x, y, isWall);
      if (isExit) {
        cell.classList.add('exit');
        if (state.effects.glow > 0) cell.classList.add('exit-glow');
      }
      if (isPlayer && isCabbage) {
        cell.classList.add('both');
        cell.innerHTML = fig('caught', 'token token-caught');
      } else if (isPlayer) {
        cell.classList.add('player');
        if (state.effects.block > 0) cell.classList.add('player-shielded');
        cell.innerHTML = fig('player', 'token token-player');
      } else if (isCabbage) {
        cell.classList.add('cabbage');
        const d = manhattan(state.player, cabbagesHere[0]);
        if (d <= 1) cell.classList.add('cabbage-in-face');
        else if (d <= 2) cell.classList.add('cabbage-close');
        const mood = cabbagesHere[0].mood;
        if (mood) cell.classList.add(`cabbage-mood-${mood}`);
        const label = cabbagesHere.length > 1 ? '两颗白菜' : '白菜';
        cell.innerHTML = fig('cabbage', 'token token-cabbage');
        cell.setAttribute('aria-label', label);
      } else if (isExit) {
        cell.innerHTML = `<span class="exit-mark">${fig('exit', 'token token-exit')}</span>`;
      } else {
        const item = pickupAt(x, y);
        if (item) {
          const def = pickupDef(item.typeId);
          if (def) {
            cell.classList.add('pickup', 'pickup-barrier', def.class);
            cell.innerHTML = fig(def.fig, `token token-pickup token-${def.fig}`);
          }
        }
      }

      el.appendChild(cell);
    }
  }

  const dist = minCabbageDist();
  const exitDist = manhattan(state.player, state.exit);
  const cfg = levelCfg();
  const levelTag = state.gameMode === 'endless'
    ? `无尽 · 第 ${state.endlessFloor} 层`
    : state.gameMode === 'sprint'
      ? '限时冲刺'
      : `${cfg.chapter.name} · 第 ${cfg.slot + 1}/4 关`;
  const chapterEl = $('chapter-tag');
  if (chapterEl) {
    if (state.gameMode === 'endless') {
      chapterEl.textContent = `无尽追猎 · 第 ${state.endlessFloor} 层 · ${cfg.cabbageCount} 颗白菜`;
    } else if (state.gameMode === 'sprint') {
      chapterEl.textContent = `限时冲刺 · 60 秒内冲到出口`;
    } else {
      const moodText = MOOD_LABEL[cfg.mood] || '';
      const extra = cfg.cabbageCount > 1 ? ` · ${cfg.cabbageCount} 颗白菜` : '';
      chapterEl.textContent = `${cfg.chapter.name}（${moodText}${extra}）`;
    }
  }
  const wrap = document.querySelector('.maze-wrap');
  const bubble = $('cabbage-meme-bubble');
  if (wrap && !state.over) {
    wrap.classList.toggle('cabbage-near', dist <= 2);
    wrap.classList.toggle('cabbage-face', dist <= 1);
    wrap.classList.toggle('nightmare-chapter', isNightmareChapter());
  }
  if (bubble) {
    if (dist <= 1 && !state.over) {
      bubble.hidden = false;
      bubble.textContent = FACE_TAUNTS[(state.moveCount + dist) % FACE_TAUNTS.length];
    } else {
      bubble.hidden = true;
    }
  }
  const stepEl = $('step-count');
  const parEl = $('par-count');
  const buffHud = $('buff-hud');
  const buffName = $('buff-name');
  const buffTurns = $('buff-turns');
  if (stepEl) stepEl.textContent = String(state.moveCount);
  if (parEl) parEl.textContent = String(state.parMoves);
  const active = activeEffectHud();
  if (buffHud && buffName && buffTurns) {
    if (active) {
      buffHud.hidden = false;
      buffName.textContent = active.name;
      buffTurns.textContent = `${active.turns}${active.unit || '步'}`;
    } else {
      buffHud.hidden = true;
    }
  }
  updatePickupLegend();

  const status = $('game-status');
  if (status && !state.over) {
    const exitHint = exitDirectionHint();
    const headStart = headStartForLevel();
    const pickupHint = state.pickups.length
      ? state.pickups.map(p => pickupDef(p.typeId)?.name).filter(Boolean).join('、')
      : '';
    if (state.pickupToast) {
      status.textContent = `${levelTag} · ${state.pickupToast} · ${exitHint}`;
      status.className = 'status win';
      state.pickupToast = '';
    } else if (exitDist <= 1) {
      status.textContent = `${levelTag} · 就在门口！朝门的方向走一步就赢`;
      status.className = 'status win';
    } else if (state.effects.freeze > 0) {
      status.textContent = `${levelTag} · 大蒜生效！白菜被熏住了 ${state.effects.freeze} 步 · ${exitHint}`;
      status.className = 'status win';
    } else if (state.effects.block > 0) {
      status.textContent = `${levelTag} · 道具护体（剩 ${state.effects.block} 次）碰到白菜不算输 · ${exitHint}`;
      status.className = 'status win';
    } else if (closestCabbage() && pickupBetween(state.player, closestCabbage())) {
      const mid = pickupBetween(state.player, closestCabbage());
      const midName = pickupDef(mid.typeId)?.name || '道具';
      status.textContent = `${levelTag} · 你和白菜中间的${midName}挡住了它！ · ${exitHint}`;
      status.className = 'status win';
    } else if (state.effects.glow > 0) {
      status.textContent = `${levelTag} · 薄荷生效！出口在发光 · ${exitHint}`;
      status.className = 'status win';
    } else if (state.moveCount <= headStart) {
      status.textContent = `${levelTag} · ${exitHint} · 前 ${headStart - state.moveCount} 步白菜不动`;
      status.className = 'status win';
    } else if (isNightmareChapter() && exitDist <= 3 && manhattan(state.player, {
      x: state.exit.x - 1,
      y: state.exit.y,
    }) <= 2) {
      status.textContent = `${levelTag} · 门左边那堵墙可以穿！小球直接走过去 · ${exitHint}`;
      status.className = 'status win';
    } else if (isNightmareChapter() && state.revealedTruePath?.size > 0) {
      status.textContent = `${levelTag} · 真路已亮（黄线）· 沿它绕开白菜 · ${exitHint}`;
      status.className = 'status win';
    } else if (isNightmareChapter()) {
      status.textContent = `${levelTag} · 朝门的方向走，真路会亮到门口附近 · ${exitHint}`;
      status.className = 'status';
    } else if (dist <= 1) {
      status.textContent = `${levelTag} · 贴脸了！！${pickTaunt(dist + state.moveCount)} · ${exitHint}`;
      status.className = 'status danger';
    } else if (dist <= 3) {
      status.textContent = `${levelTag} · ${pickTaunt(dist * 7 + state.moveCount)} · ${exitHint}`;
      status.className = 'status danger';
    } else if (pickupHint) {
      status.textContent = `${levelTag} · 本关道具：${pickupHint}（都能挡白菜）· ${exitHint}`;
      status.className = 'status';
    } else {
      status.textContent = `${levelTag} · ${exitHint} · 少用步数冲三星`;
      status.className = 'status';
    }
  }

  $('win-count').textContent = String(state.wins);
  const thrillEl = $('thrill-count');
  if (thrillEl) thrillEl.textContent = String(state.thrillingEscapes);
  updateWheelHighlight();
  requestAnimationFrame(() => {
    layoutMazeGrid();
    scrollMazeIntoView();
  });
}

function scrollMazeIntoView() {
  const wrap = document.querySelector('.maze-wrap');
  if (!wrap) return;
  const playerIdx = state.player.y * state.cols + state.player.x;
  const cells = wrap.querySelectorAll('.cell');
  const playerCell = cells[playerIdx];
  if (playerCell) {
    playerCell.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' });
  }
}

function pickWheelDir(clientX, clientY) {
  const dial = $('wheel');
  if (!dial) return null;
  const rect = dial.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  const dist = Math.hypot(dx, dy);
  if (dist < 30) return null;
  let deg = Math.atan2(dx, -dy) * (180 / Math.PI);
  if (deg < 0) deg += 360;
  const idx = Math.round(deg / 45) % 8;
  return WHEEL_SECTORS[idx];
}

function flashWheelSector() {
  const dial = $('wheel');
  if (!dial) return;
  dial.classList.add('tapped');
  clearTimeout(flashWheelSector._t);
  flashWheelSector._t = setTimeout(() => dial.classList.remove('tapped'), 160);
}

function updateWheelHighlight() {
  /* 方向轮盘整盘点击，无需单独按钮高亮 */
}

function showMemeOverlay(win) {
  const overlay = $('meme-overlay');
  const text = $('meme-text');
  const sub = $('meme-sub');
  const starsEl = $('meme-stars');
  const btn = $('meme-btn');
  if (!overlay || !text) return;
  state.lastResult = win ? 'win' : 'lose';
  if (win) {
    state.lastStars = starsForMoves(state.moveCount, state.parMoves, state.winNearMiss);
    text.textContent = state.winNearMiss ? '极限逃生！白菜刚要笑…' : '逃掉了！下一关马上来～';
    if (sub) {
      sub.hidden = false;
      const thrill = state.winNearMiss ? ' · 惊险逃脱 +1 星' : '';
      sub.textContent = `${state.moveCount} 步 · 目标 ≤ ${state.parMoves} 步${thrill}`;
    }
    if (starsEl) {
      starsEl.hidden = false;
      starsEl.textContent = '★'.repeat(state.lastStars) + '☆'.repeat(3 - state.lastStars);
      starsEl.className = `meme-stars stars-${state.lastStars}`;
    }
  } else {
    text.textContent = LOSE_LINES[Math.floor(Math.random() * LOSE_LINES.length)];
    if (sub) sub.hidden = true;
    if (starsEl) starsEl.hidden = true;
    const wrap = document.querySelector('.maze-wrap');
    if (wrap) {
      wrap.classList.add('shake');
      clearTimeout(showMemeOverlay._shake);
      showMemeOverlay._shake = setTimeout(() => wrap.classList.remove('shake'), 450);
    }
  }
  if (btn) btn.textContent = win ? '下一关' : '再逃一次';
  overlay.hidden = false;
}

function hideMemeOverlay() {
  const overlay = $('meme-overlay');
  if (overlay) overlay.hidden = true;
}

function repelCabbage() {
  state.cabbages.forEach((cabbage) => {
    const options = MOVE_DIRS
      .map(([dx, dy]) => ({ x: cabbage.x + dx, y: cabbage.y + dy }))
      .filter(p => isWalkable(p.x, p.y))
      .filter(p => !(p.x === state.player.x && p.y === state.player.y))
      .sort((a, b) => manhattan(b, state.player) - manhattan(a, state.player));
    if (options.length) {
      cabbage.x = options[0].x;
      cabbage.y = options[0].y;
    }
  });
}

function flashCombat() {
  state.combatFlash = true;
  const wrap = document.querySelector('.maze-wrap');
  if (wrap) wrap.classList.add('combat-flash');
  clearTimeout(flashCombat._t);
  flashCombat._t = setTimeout(() => {
    state.combatFlash = false;
    if (wrap) wrap.classList.remove('combat-flash');
  }, 380);
}

function useBlockCharge() {
  state.effects.block -= 1;
  repelCabbage();
  flashCombat();
  const left = state.effects.block;
  state.pickupToast = left > 0
    ? `道具护体挡住了！还能挡 ${left} 次`
    : '道具护体挡住了！这次用完了';
}

function resolveCabbageCollision() {
  if (!cabbageAt(state.player.x, state.player.y)) return false;
  if (state.effects.block > 0) {
    useBlockCharge();
    return false;
  }
  state.over = true;
  showMemeOverlay(false);
  return true;
}

function checkEnd() {
  if (state.player.x === state.exit.x && state.player.y === state.exit.y) {
    state.over = true;
    stopSprintTimer();
    clearEffects();
    state.winNearMiss = minCabbageDist() === 1;
    if (state.winNearMiss) {
      state.thrillingEscapes += 1;
      saveThrills();
    }
    state.wins += 1;
    saveWins();
    const status = $('game-status');
    if (status) {
      if (state.gameMode === 'sprint') {
        status.textContent = `冲刺成功！还剩 ${Math.max(0, state.sprintSecondsLeft)} 秒`;
      } else if (state.gameMode === 'endless') {
        status.textContent = `第 ${state.endlessFloor} 层通过！`;
      } else {
        status.textContent = '逃出生天！绕路大成功～';
      }
      status.className = 'status win';
    }
    showMemeOverlay(true);
    clearTimeout(startNextMaze._auto);
    startNextMaze._auto = setTimeout(() => startNextMaze(), 1400);
    return true;
  }
  if (resolveCabbageCollision()) return true;
  return false;
}

function pulseWheel() {
  const wheel = $('wheel');
  if (!wheel) return;
  wheel.classList.add('spin');
  clearTimeout(pulseWheel._t);
  pulseWheel._t = setTimeout(() => wheel.classList.remove('spin'), 500);
}

function bumpStatus(msg) {
  const status = $('game-status');
  if (!status || state.over) return;
  status.textContent = msg;
  status.className = 'status danger';
  clearTimeout(bumpStatus._t);
  bumpStatus._t = setTimeout(() => renderMaze(), 900);
}

function tryMove(dx, dy) {
  if (state.over || state.locked) return;
  if (!canStep(dx, dy)) {
    bumpStatus('这边是墙 · 换圆盘上别的方向');
    return;
  }

  state.locked = true;
  try {
    pulseWheel();
    const prevExitDist = manhattan(state.player, state.exit);
    state.moveCount += 1;
    const nx = state.player.x + dx;
    const ny = state.player.y + dy;
    state.player = { x: nx, y: ny };
    collectPickup(nx, ny);
    updateNightmareReveal(prevExitDist);

    if (!checkEnd()) {
      moveCabbage();
      checkEnd();
    }
    tickEffectsAfterTurn();
    renderMaze();
  } finally {
    clearTimeout(tryMove._t);
    tryMove._t = setTimeout(() => { state.locked = false; }, 160);
  }
}

function loadMazeByIndex(index) {
  clearEffects();
  const len = MAZES.length;
  for (let i = 0; i < len; i += 1) {
    const idx = ((index + i) % len + len) % len;
    parseMaze(MAZES[idx]);
    const forPlayer = chapterForLevel(idx) === CHAPTERS[2];
    if (pathExists(state.player, state.exit, true, forPlayer)) {
      state.mazeIndex = idx;
      state.levelCfg = buildLevelConfig(idx);
      state.parMoves = computeParMoves();
      setupLevelChapter();
      placePickups();
      initNightmareRoute();
      return;
    }
  }
  state.mazeIndex = 0;
  state.levelCfg = buildLevelConfig(0);
  parseMaze(MAZES[0]);
  state.parMoves = computeParMoves();
  setupLevelChapter();
  placePickups();
  initNightmareRoute();
}

function clearEffects() {
  state.effects.freeze = 0;
  state.effects.slow = 0;
  state.effects.glow = 0;
  state.effects.block = 0;
  state.combatFlash = false;
  state.pickupToast = '';
}

function resetRound() {
  state.over = false;
  state.locked = false;
  state.moveCount = 0;
  state.lastResult = null;
  state.pickups = [];
  clearEffects();
  state.winNearMiss = false;
  state.levelCfg = null;
  state.revealedTruePath = null;
}

function startNextMaze() {
  clearTimeout(startNextMaze._auto);
  hideMemeOverlay();
  resetRound();
  if (state.gameMode === 'endless') loadEndlessFloor(state.endlessFloor + 1);
  else if (state.gameMode === 'sprint') loadSprintMaze();
  else loadMazeByIndex(state.mazeIndex + 1);
  renderMaze();
}

function retrySameMaze() {
  hideMemeOverlay();
  resetRound();
  clearEffects();
  parseMaze(MAZES[state.mazeIndex]);
  state.levelCfg = buildLevelConfig(state.mazeIndex);
  state.parMoves = computeParMoves();
  setupLevelChapter();
  placePickups();
  initNightmareRoute();
  renderMaze();
}

function bindWheelDial() {
  const dial = $('wheel');
  if (!dial) return;

  const onPick = (e) => {
    if (state.over) return;
    const pt = e.changedTouches?.[0] || e;
    const sector = pickWheelDir(pt.clientX, pt.clientY);
    if (!sector) return;
    e.preventDefault();
    flashWheelSector();
    tryMove(sector.dx, sector.dy);
  };

  dial.addEventListener('pointerup', onPick);
}

function restartCurrentRound() {
  hideMemeOverlay();
  resetRound();
  if (state.gameMode === 'endless') loadEndlessFloor(state.endlessFloor);
  else if (state.gameMode === 'sprint') loadSprintMaze();
  else retrySameMaze();
  renderMaze();
}

function bindUI() {
  bindWheelDial();
  $('btn-restart')?.addEventListener('click', restartCurrentRound);
  document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.addEventListener('click', () => setGameMode(btn.dataset.mode));
  });
  $('meme-btn')?.addEventListener('click', () => {
    if (state.lastResult === 'win') startNextMaze();
    else restartCurrentRound();
  });

  const keys = {
    ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
    w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
  };
  window.addEventListener('keydown', (e) => {
    const move = keys[e.key];
    if (!move) return;
    e.preventDefault();
    tryMove(move[0], move[1]);
  });
}

function init() {
  loadWins();
  loadThrills();
  const memeFig = document.getElementById('meme-figure');
  if (memeFig) memeFig.innerHTML = fig('cabbage', 'token token-meme');
  const brandIcon = document.querySelector('.brand-icon');
  if (brandIcon) brandIcon.innerHTML = fig('brand', 'token token-brand');
  document.querySelectorAll('[data-fig]').forEach(el => {
    el.innerHTML = fig(el.dataset.fig, 'token token-legend');
  });
  bindUI();
  setGameMode('story');
  window.addEventListener('resize', () => {
    if (!state.over) renderMaze();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
