/**
 * 小蛇吃豆 · 无限大地图，镜头跟着蛇走，不会撞墙也不会咬到自己
 */
const SnakeGame = {
  viewRows: 21,
  viewCols: 21,
  snake: [],
  segmentCount: 3,
  snakeDisplayMax: 72,
  trailKeepSegments: 120,
  heading: 0,
  targetHeading: 0,
  turnRate: 5.4,
  baseSpeed: 7.2,
  speed: 7.2,
  segmentSpacing: 1,
  trail: [],
  fruitStep: 1.05,
  fruitDensity: 0.3,
  eatenFruits: null,
  score: 0,
  fruitWallet: 0,
  boostLeft: 0,
  boostCost: 12,
  boostDuration: 20,
  boostMul: 1.65,
  bombCost: 28,
  bombRadius: 130,
  bombMaxGrab: 1000,
  bombRegrowSec: 120,
  bombShopCooldownSec: 90,
  bombCooldownLeft: 0,
  fruitRegrowLeft: 0,
  bombEatenBatch: null,
  bombFxUntil: 0,
  bombFx: null,
  shopOpen: false,
  running: false,
  paused: false,
  animFrame: null,
  _simTime: 0,
  pointerFollowActive: false,
  pointerWorld: null,
  pointerClient: null,
  pointerSteerDead: 2.4,
  joystickActive: false,
  fruitKinds: ['apple', 'orange', 'grape', 'cherry', 'lemon', 'plum', 'peach'],
  bigFruitReward: 5,
  bigFruitKinds: ['durian', 'bigApple', 'watermelon', 'pineapple'],
  bigFruitLabels: { durian: '榴莲', bigApple: '大苹果', watermelon: '大西瓜', pineapple: '大菠萝' },

  init() {
    this.viewW = 300;
    this.viewH = 300;
    this.viewSize = 300;
    this.cell = 14;
    this.canvas = document.getElementById('snake-canvas');
    this.stage = document.getElementById('snake-stage');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;
    this.bindChromeButtons();
    this.bindShop();
    this.bindTapToStart();
    this.bindInput();
    this.bindJoystick();
    this.bindPointerFollow();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('load', () => this.resize());
    this.resetGame(false);
    this.resize();
    this.startRenderLoop();
  },

  startRenderLoop() {
    if (this._renderLoop) return;
    this._renderLoop = true;
    const loop = now => {
      this.animFrame = requestAnimationFrame(loop);
      const dt = (now - (this._simTime || now)) / 1000;
      this._simTime = now;
      try {
        this.updateSim(dt);
        this.draw(now);
      } catch (err) {
        console.error('[SnakeGame draw]', err);
      }
    };
    this.animFrame = requestAnimationFrame(loop);
  },

  headingVector() {
    return { x: Math.cos(this.heading), y: Math.sin(this.heading) };
  },

  normalizeAngle(a) {
    let x = a;
    while (x > Math.PI) x -= Math.PI * 2;
    while (x < -Math.PI) x += Math.PI * 2;
    return x;
  },

  steerTowardTarget(dt) {
    let diff = this.normalizeAngle(this.targetHeading - this.heading);
    const cap = this.turnRate * dt;
    if (Math.abs(diff) <= cap) this.heading = this.targetHeading;
    else this.heading += Math.sign(diff) * cap;
  },

  trailArcLength() {
    let len = 0;
    for (let i = 1; i < this.trail.length; i += 1) {
      const a = this.trail[i - 1];
      const b = this.trail[i];
      len += Math.hypot(b.x - a.x, b.y - a.y);
    }
    return len;
  },

  sampleTrail(distFromHead) {
    const trail = this.trail;
    if (!trail.length) return { x: 0, y: 0 };
    if (distFromHead <= 0) return { ...trail[trail.length - 1] };
    let left = distFromHead;
    for (let i = trail.length - 1; i > 0; i -= 1) {
      const head = trail[i];
      const prev = trail[i - 1];
      const seg = Math.hypot(head.x - prev.x, head.y - prev.y);
      if (left <= seg || seg < 0.0001) {
        const t = seg < 0.0001 ? 0 : left / seg;
        return {
          x: head.x + (prev.x - head.x) * t,
          y: head.y + (prev.y - head.y) * t,
        };
      }
      left -= seg;
    }
    return { ...trail[0] };
  },

  trimTrail() {
    const keepSeg = Math.min(this.segmentCount, this.trailKeepSegments);
    const need = keepSeg * this.segmentSpacing * 1.4 + 2;
    while (this.trail.length > 3 && this.trailArcLength() > need) {
      this.trail.shift();
    }
  },

  logicalLength() {
    return this.segmentCount;
  },

  rebuildDisplaySnake(head) {
    const h = head || this.head();
    if (!h) return;
    const total = this.segmentCount;
    const sp = this.segmentSpacing;
    const maxPts = this.snakeDisplayMax;
    const n = Math.min(Math.max(2, total), maxPts);
    const tailDist = Math.min((total - 1) * sp, this.trailArcLength());
    const pts = new Array(n);
    for (let i = 0; i < n; i += 1) {
      const t = n <= 1 ? 1 : i / (n - 1);
      const dist = tailDist * (1 - t);
      pts[i] = dist <= 0.001 ? { x: h.x, y: h.y } : this.sampleTrail(dist);
    }
    pts[n - 1] = { x: h.x, y: h.y };
    this.snake = pts;
  },

  cameraOriginForHead(h) {
    const head = h || { x: 0, y: 0 };
    return {
      x: head.x - Math.floor(this.viewCols / 2),
      y: head.y - Math.floor(this.viewRows / 2),
    };
  },

  worldToScreen(x, y, cam) {
    const c = this.cell;
    return {
      px: (x - cam.x) * c + c * 0.5,
      py: (y - cam.y) * c + c * 0.5,
    };
  },

  screenToWorld(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    const c = this.cell || 14;
    const head = this.head() || { x: 0, y: 0 };
    const cam = this.cameraOriginForHead(head);
    return {
      x: cam.x + (sx - c * 0.5) / c,
      y: cam.y + (sy - c * 0.5) / c,
    };
  },

  refreshPointerWorldFromScreen() {
    const p = this.pointerClient;
    if (!p || !this.pointerFollowActive) return null;
    const world = this.screenToWorld(p.x, p.y);
    this.pointerWorld = world;
    return world;
  },

  updatePointerSteer() {
    if (!this.running || !this.pointerFollowActive || this.joystickActive) return;
    const world = this.refreshPointerWorldFromScreen();
    if (!world) return;
    const head = this.head();
    if (!head) return;
    const dx = world.x - head.x;
    const dy = world.y - head.y;
    const dist = Math.hypot(dx, dy);
    this.speed = this.baseSpeed;
    if (dist < this.pointerSteerDead) return;
    this.targetHeading = Math.atan2(dy, dx);
  },

  bindChromeButtons() {
    const app = document.getElementById('app');
    if (!app) return;
    let last = 0;
    const handle = e => {
      if (e.target.closest('#snake-shop-panel, #btn-buy-boost, #btn-buy-bomb, #btn-shop-close, #btn-snake-shop')) return;
      const restart = e.target.closest('#btn-snake-restart');
      const start = e.target.closest('#btn-snake-start-hud');
      if (!restart && !start) return;
      if (Date.now() - last < 280) return;
      last = Date.now();
      e.preventDefault();
      e.stopPropagation();
      if (restart) this.resetGame(false);
      else this.startFromIntro();
    };
    app.addEventListener('click', handle, true);
    app.addEventListener('touchend', handle, { capture: true, passive: false });
  },

  bindTapToStart() {
    const stage = this.stage;
    if (!stage) return;
    stage.addEventListener(
      'pointerdown',
      e => {
        if (this.running) return;
        if (e.target.closest('#snake-joystick, #snake-hud-actions, #snake-shop, button, .hub-nav')) return;
        this.startFromIntro();
      },
      { capture: true },
    );
  },

  updatePlayChrome() {
    const startBtn = document.getElementById('btn-snake-start-hud');
    if (startBtn) {
      startBtn.hidden = this.running;
      startBtn.textContent = this.score > 0 && !this.running ? '再来一局' : '开始';
    }
    if (this.stage) this.stage.classList.toggle('snake-waiting', !this.running);
  },

  head() {
    if (this.trail.length) return this.trail[this.trail.length - 1];
    return this.snake[this.snake.length - 1];
  },

  resize() {
    const stage = this.stage || document.getElementById('snake-stage');
    if (!stage || !this.canvas || !this.ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = stage.getBoundingClientRect();
    const w = Math.max(200, Math.floor(rect.width) || stage.clientWidth || 300);
    const h = Math.max(160, Math.floor(rect.height) || stage.clientHeight || 300);
    this.viewW = w;
    this.viewH = h;
    this.viewSize = Math.min(w, h);
    this.cell = h / this.viewRows;
    this.viewCols = w / this.cell;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.draw();
  },

  resetGame(showIntro) {
    this.running = false;
    this.paused = false;
    this.score = 0;
    this.baseSpeed = 7.2;
    this.speed = 7.2;
    this.heading = 0;
    this.targetHeading = 0;
    this._simTime = performance.now();
    this.segmentCount = 3;
    this.trail = [
      { x: -2, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 0 },
    ];
    this.rebuildDisplaySnake(this.trail[this.trail.length - 1]);
    this.eatenFruits = new Set();
    this.fruitWallet = 0;
    this.boostLeft = 0;
    this.bombCooldownLeft = 0;
    this.fruitRegrowLeft = 0;
    this.bombEatenBatch = [];
    this.bombFxUntil = 0;
    this.bombFx = null;
    this.shopOpen = false;
    this.closeShop(false);
    this.updateHud();
    this.updatePlayChrome();
    if (!showIntro) this.startPlaying();
    else {
      this.running = false;
      this.updatePlayChrome();
    }
  },

  startFromIntro() {
    if (this.running) return;
    this.resetGame(false);
  },

  startPlaying() {
    this.running = true;
    this.paused = this.shopOpen;
    this._simTime = performance.now();
    this.updatePlayChrome();
  },

  moveSpeedNow() {
    let s = this.baseSpeed;
    if (this.boostLeft > 0) s *= this.boostMul;
    return s;
  },

  tickBoost(dt) {
    if (this.boostLeft > 0) {
      this.boostLeft = Math.max(0, this.boostLeft - dt);
    }
    if (this.bombCooldownLeft > 0) {
      this.bombCooldownLeft = Math.max(0, this.bombCooldownLeft - dt);
    }
    if (this.fruitRegrowLeft > 0) {
      this.fruitRegrowLeft = Math.max(0, this.fruitRegrowLeft - dt);
    } else if (this.bombEatenBatch?.length) {
      this.bombEatenBatch.forEach(k => this.eatenFruits.delete(k));
      this.bombEatenBatch = [];
      this.toast('炸弹扫过的果子终于长回来了');
    }
  },

  openShop() {
    this.shopOpen = true;
    this.paused = true;
    const el = document.getElementById('snake-shop');
    if (el) {
      el.hidden = false;
      el.setAttribute('aria-hidden', 'false');
    }
    this.renderShop();
  },

  closeShop(unpause = true) {
    this.shopOpen = false;
    const el = document.getElementById('snake-shop');
    if (el) {
      el.hidden = true;
      el.setAttribute('aria-hidden', 'true');
    }
    if (unpause && this.running) this.paused = false;
  },

  buySpeedBoost() {
    if (this.fruitWallet < this.boostCost) {
      this.toast(`果子不够 · 需要 ${this.boostCost} 颗`);
      return;
    }
    this.fruitWallet -= this.boostCost;
    this.boostLeft += this.boostDuration;
    this.toast(`加速 ${this.boostDuration} 秒！`);
    this.updateHud();
    this.renderShop();
    this.closeShop(true);
  },

  detonateFruitBomb() {
    if (this.bombCooldownLeft > 0) {
      this.toast(`炸弹还在冷却 · ${Math.ceil(this.bombCooldownLeft)} 秒`);
      return;
    }
    if (this.fruitWallet < this.bombCost) {
      this.toast(`果子不够 · 需要 ${this.bombCost} 颗`);
      return;
    }
    const head = this.head();
    if (!head) return;
    this.fruitWallet -= this.bombCost;
    const step = this.fruitStep;
    const r = this.bombRadius;
    const minIx = Math.floor((head.x - r) / step);
    const maxIx = Math.ceil((head.x + r) / step);
    const minIy = Math.floor((head.y - r) / step);
    const maxIy = Math.ceil((head.y + r) / step);
    const batch = [];
    let grabbed = 0;
    for (let ix = minIx; ix <= maxIx && grabbed < this.bombMaxGrab; ix += 1) {
      for (let iy = minIy; iy <= maxIy && grabbed < this.bombMaxGrab; iy += 1) {
        const hasSmall = this.hasWorldFruit(ix, iy);
        const hasBig = this.hasBigFruit(ix, iy);
        if (!hasSmall && !hasBig) continue;
        const fp = this.fruitWorldPos(ix, iy);
        if (Math.hypot(fp.x - head.x, fp.y - head.y) > r) continue;
        const key = this.fruitCellKey(ix, iy);
        if (this.eatenFruits.has(key)) continue;
        this.eatenFruits.add(key);
        batch.push(key);
        grabbed += this.fruitPickupValue(ix, iy);
      }
    }
    if (grabbed === 0) {
      this.fruitWallet += this.bombCost;
      this.toast('这一带暂时没有果子可炸');
      this.updateHud();
      this.renderShop();
      return;
    }
    this.bombEatenBatch = batch;
    this.addFruitPickup(grabbed);
    this.fruitRegrowLeft = this.bombRegrowSec;
    this.bombCooldownLeft = this.bombShopCooldownSec;
    this.bombFx = { x: head.x, y: head.y, r: 0, maxR: r };
    this.bombFxUntil = performance.now() + 700;
    this.toast(`💥 炸来 ${grabbed} 颗果子 · ${this.bombRegrowSec} 秒内大地很稀`);
    this.updateHud();
    this.renderShop();
    this.closeShop(true);
  },

  renderShop() {
    const w = document.getElementById('stat-snake-wallet');
    const btnBoost = document.getElementById('btn-buy-boost');
    const btnBomb = document.getElementById('btn-buy-bomb');
    if (w) w.textContent = String(this.fruitWallet);
    if (btnBoost) {
      btnBoost.disabled = this.fruitWallet < this.boostCost;
      btnBoost.textContent = `⚡ 加速 ${this.boostDuration} 秒 · ${this.boostCost} 颗果子`;
    }
    if (btnBomb) {
      const cd = this.bombCooldownLeft > 0;
      const regrow = this.fruitRegrowLeft > 0;
      btnBomb.disabled = cd || regrow || this.fruitWallet < this.bombCost;
      if (cd) {
        btnBomb.textContent = `💣 炸弹冷却中 · ${Math.ceil(this.bombCooldownLeft)} 秒`;
      } else if (regrow) {
        btnBomb.textContent = `💣 大地恢复中 · ${Math.ceil(this.fruitRegrowLeft)} 秒`;
      } else {
        btnBomb.textContent = `💣 果子全图吸入 · ${this.bombCost} 颗果子（恢复很慢）`;
      }
    }
  },

  bindShop() {
    document.getElementById('btn-snake-shop')?.addEventListener('click', e => {
      e.stopPropagation();
      if (!this.running) {
        this.toast('先开始游戏再吃果子攒货');
        return;
      }
      this.openShop();
    });
    document.getElementById('btn-shop-close')?.addEventListener('click', e => {
      e.stopPropagation();
      this.closeShop(true);
    });
    document.getElementById('btn-buy-boost')?.addEventListener('click', e => {
      e.stopPropagation();
      this.buySpeedBoost();
    });
    document.getElementById('btn-buy-bomb')?.addEventListener('click', e => {
      e.stopPropagation();
      this.detonateFruitBomb();
    });
  },

  fruitHash(ix, iy) {
    let n = ix * 374761393 + iy * 668265263;
    n = (n ^ (n >>> 13)) * 1274126177;
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  },

  fruitCellKey(ix, iy) {
    return `${ix},${iy}`;
  },

  fruitDensityNow() {
    if (this.fruitRegrowLeft > 0) return this.fruitDensity * 0.12;
    return this.fruitDensity;
  },

  hasBigFruit(ix, iy) {
    if (!this.eatenFruits || this.eatenFruits.has(this.fruitCellKey(ix, iy))) return false;
    const rare = this.fruitHash(ix * 19 + 3, iy * 23 + 7);
    const gate = this.fruitRegrowLeft > 0 ? 0.996 : 0.984;
    return rare > gate;
  },

  hasWorldFruit(ix, iy) {
    if (!this.eatenFruits || this.eatenFruits.has(this.fruitCellKey(ix, iy))) return false;
    if (this.hasBigFruit(ix, iy)) return false;
    return this.fruitHash(ix, iy) < this.fruitDensityNow();
  },

  fruitKindAt(ix, iy) {
    if (this.hasBigFruit(ix, iy)) return this.bigFruitKindAt(ix, iy);
    const h = this.fruitHash(ix * 5 + 17, iy * 7 + 31);
    return this.fruitKinds[Math.floor(h * this.fruitKinds.length)];
  },

  bigFruitKindAt(ix, iy) {
    const h = this.fruitHash(ix * 41 + 11, iy * 37 + 19);
    const list = this.bigFruitKinds;
    return list[Math.floor(h * list.length)];
  },

  fruitPickupValue(ix, iy) {
    if (this.hasBigFruit(ix, iy)) return this.bigFruitReward;
    return 1;
  },

  fruitWorldPos(ix, iy) {
    const step = this.fruitStep;
    const jx = (this.fruitHash(ix + 911, iy) - 0.5) * step * 0.42;
    const jy = (this.fruitHash(ix, iy + 911) - 0.5) * step * 0.42;
    return { x: ix * step + jx, y: iy * step + jy };
  },

  forEachFruitInView(cam, fn) {
    const step = this.fruitStep;
    const pad = 3;
    const minIx = Math.floor((cam.x - pad) / step);
    const maxIx = Math.ceil((cam.x + this.viewCols + pad) / step);
    const minIy = Math.floor((cam.y - pad) / step);
    const maxIy = Math.ceil((cam.y + this.viewRows + pad) / step);
    for (let ix = minIx; ix <= maxIx; ix += 1) {
      for (let iy = minIy; iy <= maxIy; iy += 1) {
        const big = this.hasBigFruit(ix, iy);
        if (!big && !this.hasWorldFruit(ix, iy)) continue;
        fn(ix, iy, this.fruitWorldPos(ix, iy), this.fruitKindAt(ix, iy));
      }
    }
  },

  fruitDotColor(kind) {
    const m = {
      apple: '#e53935',
      orange: '#fb8c00',
      grape: '#8e24aa',
      cherry: '#d50000',
      lemon: '#fdd835',
      plum: '#5e35b1',
      peach: '#ff7043',
    };
    return m[kind] || '#ffca28';
  },

  /** 已吃果子数 = 分数；蛇长 = 初始 3 节 + 分数（商城买东西不会变短） */
  syncSnakeLengthToScore() {
    this.segmentCount = 3 + this.score;
  },

  addFruitPickup(n) {
    if (n <= 0) return;
    this.score += n;
    this.fruitWallet += n;
    this.syncSnakeLengthToScore();
  },

  updateSim(dt) {
    if (!this.running || this.paused || !this.snake.length) return;
    dt = Math.min(0.05, Math.max(0, dt));
    this.tickBoost(dt);
    this.updatePointerSteer();
    this.steerTowardTarget(dt);
    const head = this.head();
    if (!head) return;
    const step = this.moveSpeedNow() * dt;
    const nh = {
      x: head.x + Math.cos(this.heading) * step,
      y: head.y + Math.sin(this.heading) * step,
    };
    const lastTrail = this.trail[this.trail.length - 1];
    if (!lastTrail || Math.hypot(nh.x - lastTrail.x, nh.y - lastTrail.y) > 0.04) {
      this.trail.push({ x: nh.x, y: nh.y });
    } else {
      this.trail[this.trail.length - 1] = { x: nh.x, y: nh.y };
    }
    this.trimTrail();
    this.rebuildDisplaySnake(nh);

    const eatRSmall = 0.36;
    const eatRBig = 0.58;
    const fStep = this.fruitStep;
    const cix = Math.round(nh.x / fStep);
    const ciy = Math.round(nh.y / fStep);
    let ate = false;
    for (let dx = -3; dx <= 3 && !ate; dx += 1) {
      for (let dy = -3; dy <= 3 && !ate; dy += 1) {
        const ix = cix + dx;
        const iy = ciy + dy;
        const fp = this.fruitWorldPos(ix, iy);
        const big = this.hasBigFruit(ix, iy);
        const small = !big && this.hasWorldFruit(ix, iy);
        if (!big && !small) continue;
        const eatR = big ? eatRBig : eatRSmall;
        if (Math.hypot(fp.x - nh.x, fp.y - nh.y) >= eatR) continue;
        const gain = this.fruitPickupValue(ix, iy);
        this.eatenFruits.add(this.fruitCellKey(ix, iy));
        this.addFruitPickup(gain);
        ate = true;
        if (big) {
          const name = this.bigFruitLabels[this.bigFruitKindAt(ix, iy)] || '大水果';
          this.toast(`${name}！+${gain} 长度 · +${gain} 分`);
        } else if (this.score === 1 || this.score % 6 === 0) this.toast('好吃！变长一节');
        if (this.score % 3 === 0) {
          this.baseSpeed = Math.min(11.5, this.baseSpeed + 0.35);
          this.speed = this.baseSpeed;
        }
      }
    }
    this.updateHud();
  },

  gameOver(msg) {
    this.running = false;
    this.updatePlayChrome();
    this.toast(
      msg
        ? `${msg} · 点上方「开始」或点画面`
        : `吃了 ${this.score} 颗 · 蛇长 ${this.logicalLength()} · 点「开始」`,
    );
  },

  setHeadingFromVector(dx, dy, minLen, snap) {
    if (!this.running) return;
    const len = Math.hypot(dx, dy);
    if (len < minLen) return;
    const ang = Math.atan2(dy, dx);
    this.targetHeading = ang;
    if (snap) {
      this.heading = ang;
    }
    this.speed = this.baseSpeed;
  },

  bindInput() {
    const ignore = e => window.HubKeyboard?.shouldIgnoreGameKey?.(e);
    window.addEventListener('keydown', e => {
      if (ignore(e)) return;
      const k = e.key;
      if (k === 'ArrowUp' || k === 'w' || k === 'W') {
        this.setHeadingFromVector(0, -1, 0.001, true);
      } else if (k === 'ArrowDown' || k === 's' || k === 'S') {
        this.setHeadingFromVector(0, 1, 0.001, true);
      } else if (k === 'ArrowLeft' || k === 'a' || k === 'A') {
        this.setHeadingFromVector(-1, 0, 0.001, true);
      } else if (k === 'ArrowRight' || k === 'd' || k === 'D') {
        this.setHeadingFromVector(1, 0, 0.001, true);
      }
      else if (k === ' ' || k === 'Enter') {
        if (!this.running) this.startFromIntro();
      }
    });

  },

  bindPointerFollow() {
    const stage = this.stage || this.canvas;
    if (!stage) return;
    const sync = e => {
      if (!this.running || this.joystickActive) return;
      if (e.target.closest('#snake-joystick, button, .hub-nav')) return;
      const rect = stage.getBoundingClientRect();
      if (
        e.clientX < rect.left
        || e.clientX > rect.right
        || e.clientY < rect.top
        || e.clientY > rect.bottom
      ) {
        this.pointerFollowActive = false;
        this.pointerClient = null;
        return;
      }
      this.pointerFollowActive = true;
      this.pointerClient = { x: e.clientX, y: e.clientY };
      this.refreshPointerWorldFromScreen();
    };
    window.addEventListener('pointermove', sync, { passive: true });
    stage.addEventListener('pointerdown', sync, { passive: true });
    stage.addEventListener('pointerleave', () => {
      this.pointerFollowActive = false;
      this.pointerClient = null;
    });
    window.addEventListener('pointerup', e => {
      if (e.pointerType === 'mouse') return;
      const rect = stage.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left
        && e.clientX <= rect.right
        && e.clientY >= rect.top
        && e.clientY <= rect.bottom;
      if (!inside) {
        this.pointerFollowActive = false;
        this.pointerClient = null;
      }
    });
  },

  bindJoystick() {
    const root = document.getElementById('snake-joystick');
    const base = root?.querySelector('.joy-base');
    const knob = root?.querySelector('.joy-knob');
    if (!base || !knob) return;

    let pointerId = null;

    const maxOffset = () => Math.max(18, (base.clientWidth - knob.clientWidth) * 0.42);

    const centerClient = () => {
      const r = base.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };

    const moveKnob = (dx, dy) => {
      const max = maxOffset();
      const len = Math.hypot(dx, dy);
      if (len > max) {
        dx = (dx / len) * max;
        dy = (dy / len) * max;
      }
      knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      return { dx, dy };
    };

    const resetKnob = () => {
      knob.style.transform = 'translate(-50%, -50%)';
      this.speed = this.baseSpeed;
    };

    const steerFrom = (dx, dy) => {
      this.setHeadingFromVector(dx, dy, 12, false);
    };

    const onDown = e => {
      if (!this.running) return;
      this.joystickActive = true;
      this.pointerFollowActive = false;
      pointerId = e.pointerId;
      base.setPointerCapture(e.pointerId);
      e.preventDefault();
      const c = centerClient();
      const { dx, dy } = moveKnob(e.clientX - c.x, e.clientY - c.y);
      steerFrom(dx, dy);
    };

    const onMove = e => {
      if (pointerId !== e.pointerId) return;
      e.preventDefault();
      const c = centerClient();
      const { dx, dy } = moveKnob(e.clientX - c.x, e.clientY - c.y);
      steerFrom(dx, dy);
    };

    const onUp = e => {
      if (pointerId !== e.pointerId) return;
      pointerId = null;
      this.joystickActive = false;
      try {
        base.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      resetKnob();
    };

    base.addEventListener('pointerdown', onDown);
    base.addEventListener('pointermove', onMove);
    base.addEventListener('pointerup', onUp);
    base.addEventListener('pointercancel', onUp);
  },

  updateHud() {
    const s = document.getElementById('stat-snake-score');
    const l = document.getElementById('stat-snake-len');
    const w = document.getElementById('stat-snake-wallet-hud');
    const boostEl = document.getElementById('snake-boost-hud');
    const boostSec = document.getElementById('stat-boost-sec');
    if (s) s.textContent = String(this.score);
    if (l) l.textContent = String(this.logicalLength());
    if (w) w.textContent = String(this.fruitWallet);
    if (boostEl) boostEl.hidden = !(this.boostLeft > 0.05);
    if (boostSec) boostSec.textContent = String(Math.ceil(this.boostLeft));
    this.renderShop();
  },

  toast(msg) {
    const el = document.getElementById('snake-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this.toast._t);
    this.toast._t = setTimeout(() => el.classList.remove('show'), 900);
  },

  drawFruitDot(ctx, px, py, kind, cell) {
    const r = Math.max(1.4, cell * 0.065);
    ctx.fillStyle = this.fruitDotColor(kind);
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  },

  drawBigFruit(ctx, px, py, kind, cell, now) {
    const pulse = 1 + Math.sin((now || 0) * 0.004 + px * 0.02) * 0.06;
    const R = cell * 0.24 * pulse;
    ctx.save();
    ctx.translate(px, py);
    if (kind === 'durian') {
      ctx.fillStyle = '#558b2f';
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 0.95, R * 1.05, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#33691e';
      ctx.lineWidth = 2;
      for (let i = 0; i < 10; i += 1) {
        const a = (i / 10) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * R * 0.35, Math.sin(a) * R * 0.35);
        ctx.lineTo(Math.cos(a) * R * 1.05, Math.sin(a) * R * 1.05);
        ctx.stroke();
      }
      ctx.fillStyle = '#c0ca33';
      ctx.beginPath();
      ctx.ellipse(0, R * 0.05, R * 0.55, R * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'bigApple') {
      ctx.fillStyle = '#c62828';
      ctx.beginPath();
      ctx.arc(0, R * 0.05, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff8a80';
      ctx.beginPath();
      ctx.arc(-R * 0.25, -R * 0.15, R * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.ellipse(R * 0.15, -R * 0.85, R * 0.22, R * 0.12, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -R * 0.75);
      ctx.lineTo(R * 0.2, -R * 1.05);
      ctx.stroke();
    } else if (kind === 'watermelon') {
      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 1.05, R * 0.88, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1b5e20';
      ctx.lineWidth = R * 0.08;
      for (let i = -2; i <= 2; i += 1) {
        ctx.beginPath();
        ctx.moveTo(i * R * 0.22, -R * 0.9);
        ctx.quadraticCurveTo(i * R * 0.35, 0, i * R * 0.22, R * 0.9);
        ctx.stroke();
      }
      ctx.fillStyle = '#ef5350';
      ctx.beginPath();
      ctx.arc(0, R * 0.08, R * 0.72, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#212121';
      for (let i = 0; i < 6; i += 1) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * R * 0.35, R * 0.08 + Math.sin(a) * R * 0.28, R * 0.06, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (kind === 'pineapple') {
      ctx.fillStyle = '#fdd835';
      ctx.beginPath();
      ctx.ellipse(0, R * 0.1, R * 0.78, R * 0.95, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f9a825';
      ctx.lineWidth = 1.5;
      for (let row = -2; row <= 2; row += 1) {
        for (let col = -2; col <= 2; col += 1) {
          ctx.strokeRect(col * R * 0.22 - R * 0.11, row * R * 0.2 - R * 0.05, R * 0.22, R * 0.18);
        }
      }
      ctx.fillStyle = '#43a047';
      for (let i = 0; i < 5; i += 1) {
        const a = -Math.PI / 2 + (i - 2) * 0.35;
        ctx.beginPath();
        ctx.moveTo(0, -R * 0.75);
        ctx.lineTo(Math.cos(a) * R * 0.55, -R * 1.15);
        ctx.lineTo(Math.cos(a + 0.2) * R * 0.45, -R * 0.85);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, R * 1.12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  draw(now = performance.now()) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.viewW || this.viewSize || 300;
    const h = this.viewH || this.viewSize || 300;
    const c = this.cell || w / this.viewCols;

    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#8bc34a');
    bg.addColorStop(1, '#33691e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    if (this.bombFx && now < this.bombFxUntil) {
      const headDisp = this.head();
      const cam = this.cameraOriginForHead(headDisp);
      const t = 1 - (this.bombFxUntil - now) / 700;
      const ringR = (this.bombFx.maxR || 80) * this.cell * (0.2 + t * 1.1);
      const { px, py } = this.worldToScreen(this.bombFx.x, this.bombFx.y, cam);
      ctx.save();
      ctx.strokeStyle = `rgba(255, 235, 59, ${0.55 * (1 - t)})`;
      ctx.fillStyle = `rgba(255, 111, 0, ${0.12 * (1 - t)})`;
      ctx.lineWidth = 3 + t * 4;
      ctx.beginPath();
      ctx.arc(px, py, ringR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else {
      this.bombFx = null;
    }

    if (!this.snake.length) return;

    const display = this.snake.map(s => ({ x: s.x, y: s.y }));
    const headDisp = display[display.length - 1] || this.head();
    const cam = this.cameraOriginForHead(headDisp);
    const moving = this.running;
    const hv = this.headingVector();

    this.forEachFruitInView(cam, (ix, iy, pos, kind) => {
      const { px, py } = this.worldToScreen(pos.x, pos.y, cam);
      if (px < -20 || px > w + 20 || py < -20 || py > h + 20) return;
      if (this.hasBigFruit(ix, iy)) {
        this.drawBigFruit(ctx, px, py, this.bigFruitKindAt(ix, iy), c, now);
      } else {
        this.drawFruitDot(ctx, px, py, kind, c);
      }
    });

    if (!display.length && this.snake.length) {
      display.push(...this.snake.map(s => ({ x: s.x, y: s.y })));
    }

    const heavy = this.segmentCount > 400;
    const screenPts = display.map((seg, i) => {
      let { px, py } = this.worldToScreen(seg.x, seg.y, cam);
      if (!heavy) {
        const wobble = Math.sin(now * 0.016 + i * 0.55) * c * 0.035;
        px += wobble * hv.y;
        py -= wobble * hv.x;
      }
      return { px, py };
    });

    this.drawSnakeTube(ctx, screenPts, c, moving, now);
  },

  /** 一条圆滚滚的蛇，不要一格一格的块 */
  drawSnakeTube(ctx, pts, c, moving, now) {
    if (!pts.length) return;

    const headPulse = moving ? 1 + Math.sin(now * 0.022) * 0.04 : 1;
    const bodyW = c * 0.72 * headPulse;
    const tailW = c * 0.38;

    const strokePath = () => {
      if (pts.length === 1) {
        ctx.moveTo(pts[0].px, pts[0].py);
        ctx.lineTo(pts[0].px + 0.01, pts[0].py);
        return;
      }
      ctx.moveTo(pts[0].px, pts[0].py);
      for (let i = 1; i < pts.length - 1; i += 1) {
        const mx = (pts[i].px + pts[i + 1].px) * 0.5;
        const my = (pts[i].py + pts[i + 1].py) * 0.5;
        ctx.quadraticCurveTo(pts[i].px, pts[i].py, mx, my);
      }
      const last = pts[pts.length - 1];
      const prev = pts[pts.length - 2];
      ctx.quadraticCurveTo(prev.px, prev.py, last.px, last.py);
    };

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.lineWidth = bodyW + c * 0.16;
    ctx.beginPath();
    strokePath();
    ctx.stroke();

    ctx.strokeStyle = '#33691e';
    ctx.lineWidth = bodyW + c * 0.06;
    ctx.beginPath();
    strokePath();
    ctx.stroke();

    ctx.strokeStyle = '#ffee58';
    ctx.lineWidth = bodyW;
    ctx.beginPath();
    strokePath();
    ctx.stroke();

    ctx.strokeStyle = '#fff9c4';
    ctx.lineWidth = bodyW * 0.42;
    ctx.beginPath();
    strokePath();
    ctx.stroke();

    const head = pts[pts.length - 1];
    const hr = bodyW * 0.58;
    const dx = Math.cos(this.heading);
    const dy = Math.sin(this.heading);
    const hx = head.px + dx * hr * 0.35;
    const hy = head.py + dy * hr * 0.35;

    ctx.fillStyle = '#1b5e20';
    ctx.beginPath();
    ctx.ellipse(hx, hy, hr * 1.08, hr * 0.95, Math.atan2(dy, dx), 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#76ff03';
    ctx.beginPath();
    ctx.ellipse(hx, hy, hr * 0.95, hr * 0.82, Math.atan2(dy, dx), 0, Math.PI * 2);
    ctx.fill();

    const ex = hx + hr * 0.32 * dx - hr * 0.1 * dy;
    const ey = hy + hr * 0.32 * dy + hr * 0.1 * dx;
    const eyeR = Math.max(2.5, hr * 0.18);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ex - dy * eyeR * 0.9, ey + dx * eyeR * 0.9, eyeR, 0, Math.PI * 2);
    ctx.arc(ex + dy * eyeR * 0.9, ey - dx * eyeR * 0.9, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1b5e20';
    ctx.beginPath();
    ctx.arc(ex - dy * eyeR * 0.9 + dx * eyeR * 0.25, ey + dx * eyeR * 0.9 + dy * eyeR * 0.25, eyeR * 0.45, 0, Math.PI * 2);
    ctx.arc(ex + dy * eyeR * 0.9 + dx * eyeR * 0.25, ey - dx * eyeR * 0.9 + dy * eyeR * 0.25, eyeR * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#e53935';
    ctx.lineWidth = Math.max(2, c * 0.045);
    ctx.lineCap = 'round';
    const tx = hx + dx * hr * 0.75;
    const ty = hy + dy * hr * 0.75;
    ctx.beginPath();
    ctx.moveTo(hx + dx * hr * 0.2, hy + dy * hr * 0.2);
    ctx.quadraticCurveTo(tx + dy * hr * 0.15, ty - dx * hr * 0.15, tx, ty);
    ctx.stroke();

    if (pts.length > 1) {
      const tail = pts[0];
      ctx.fillStyle = '#558b2f';
      ctx.beginPath();
      ctx.arc(tail.px, tail.py, tailW * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  },
};

(function bootSnakeGame() {
  window.SnakeGame = SnakeGame;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SnakeGame.init(), { once: true });
  } else {
    SnakeGame.init();
  }
})();
