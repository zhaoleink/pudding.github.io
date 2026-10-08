/**
 * 弹弹球 · 台面弹射 + 合成币；合成在独立 6×16 合成台（craft-grid.js）
 */
const MarbleGame = {
  COIN_GOAL: 100,
  COIN_PER_HIT: 4,

  marbles: [],
  bounds: { w: 800, h: 520 },
  playerId: null,
  aimMarbleId: null,
  aiming: null,
  hits: 0,
  shots: 0,
  craftCoins: 0,
  equippedPlayerTier: 'pink',
  playerSpawn: { x: 400, y: 442 },
  _pairCooldown: new Map(),
  _pointerId: null,

  colors: {
    player: ['#ff6b9d', '#ffc1e3', '#ffffff'],
    pink: ['#ff6b9d', '#ffc1e3', '#ffffff'],
    blue: ['#42a5f5', '#1565c0', '#e3f2fd'],
    purple: ['#ab47bc', '#6a1b9a', '#f3e5f5'],
    green: ['#66bb6a', '#2e7d32', '#e8f5e9'],
    white: ['#fafafa', '#bdbdbd', '#ffffff'],
    black: ['#424242', '#212121', '#9e9e9e'],
    targets: [
      ['#4fc3f7', '#0288d1', '#e1f5fe'],
      ['#aed581', '#689f38', '#f1f8e9'],
      ['#ffd54f', '#ff8f00', '#fff8e1'],
      ['#b39ddb', '#7e57c2', '#ede7f6'],
      ['#ff8a65', '#e64a19', '#fbe9e7'],
      ['#4dd0e1', '#0097a7', '#e0f7fa'],
      ['#f06292', '#c2185b', '#fce4ec'],
    ],
  },

  init() {
    try {
      this.canvas = document.getElementById('marble-canvas');
      if (!this.canvas) throw new Error('找不到画布');
      this.ctx = this.canvas.getContext('2d');
      if (!this.ctx) throw new Error('无法创建画布');
      this.bindInput();
      this.initCraftGrid();
      window.addEventListener('resize', () => this.resize());
      this.resize();
      this.resetBoard(false);
      this.syncCraftUi();
      requestAnimationFrame(t => this.loop(t));
    } catch (err) {
      console.error(err);
      this.toast('游戏加载失败，请刷新页面');
    }
  },

  addCraftCoins(n) {
    if (n <= 0) return;
    this.craftCoins += n;
    this.tryAutoGrantPink();
    this.saveCraftGrid();
    this.updateHud();
    this.updateCraftHud();
  },

  resetBoard(clearCoins) {
    if (clearCoins) this.craftCoins = 0;
    this.hits = 0;
    this.shots = 0;
    this.aiming = null;
    this.aimMarbleId = null;
    this._pairCooldown.clear();
    this._pointerId = null;
    this.marbles = [];
    const cx = this.bounds.w * 0.5;
    const cy = this.bounds.h * 0.42;
    this.playerSpawn = { x: cx, y: this.bounds.h - 78 };
    const ring = [
      [0, 0], [50, 0], [-50, 0],
      [25, 44], [-25, 44], [25, -44], [-25, -44],
    ];
    ring.forEach((o, i) => {
      this.marbles.push(this.makeMarble(cx + o[0], cy + o[1], 16, this.colors.targets[i % this.colors.targets.length], {
        kind: 'target',
        isPlayer: false,
      }));
    });
    this.separateOverlaps(8);
    this.equipPlayerTier(this.equippedPlayerTier || 'pink', false);
    this.separateOverlaps(6);
    this.updateHud();
    this.syncCraftUi();
  },

  mass(m) {
    return m.mass ?? m.r * m.r;
  },

  CRAFT_USE_TIERS: {
    blue: { r: 22, powerMult: 1.05, powerCap: 500, label: '蓝球' },
    purple: { r: 26, powerMult: 1.22, powerCap: 540, label: '紫球' },
    green: { r: 30, powerMult: 1.42, powerCap: 600, label: '绿球' },
    white: { r: 34, powerMult: 1.65, powerCap: 660, label: '白球' },
    black: { r: 38, powerMult: 1.92, powerCap: 720, label: '黑球' },
  },

  spawnPlayer() {
    return this.equipPlayerTier('pink', true);
  },

  equipPlayerTier(tier, atSpawnOnly) {
    const isDefaultPink = tier === 'pink' || !tier;
    const spec = isDefaultPink
      ? { r: 20, powerMult: 0.78, powerCap: 380, label: '粉球', palette: this.colors.player }
      : { ...this.CRAFT_USE_TIERS[tier], palette: this.colors[tier] };

    if (!spec.palette && !isDefaultPink) return this.spawnPlayer();

    const existing = this.player();
    if (atSpawnOnly && existing && existing.tier === 'pink' && isDefaultPink) {
      existing.x = this.playerSpawn.x;
      existing.y = this.playerSpawn.y;
      existing.vx = 0;
      existing.vy = 0;
      return existing;
    }

    if (existing) {
      this.marbles = this.marbles.filter(m => m.id !== existing.id);
    }

    const pl = this.makeMarble(this.playerSpawn.x, this.playerSpawn.y, spec.r, spec.palette, {
      kind: 'player',
      isPlayer: true,
      tier: isDefaultPink ? 'pink' : tier,
      shotPowerMult: spec.powerMult,
      shotPowerCap: spec.powerCap,
      mass: spec.r * spec.r * 1.1,
    });
    this.playerId = pl.id;
    this.marbles.push(pl);
    this.equippedPlayerTier = isDefaultPink ? 'pink' : tier;
    this.separateOverlaps(4);
    if (typeof this.saveCraftGrid === 'function') this.saveCraftGrid();
    return pl;
  },

  equipPlayerFromCraft(tier) {
    if (!this.CRAFT_USE_TIERS[tier]) return;
    this.equipPlayerTier(tier, false);
    this.updateHud();
    const label = this.CRAFT_USE_TIERS[tier].label;
    this.toast(`已使用${label} · 比粉球更大更有劲`);
  },

  makeMarble(x, y, r, palette, opts) {
    return {
      id: Math.random().toString(36).slice(2, 9),
      x,
      y,
      vx: 0,
      vy: 0,
      r,
      palette,
      kind: opts.kind || 'target',
      isPlayer: !!opts.isPlayer,
      tier: opts.tier || null,
      shotPowerMult: opts.shotPowerMult ?? 1,
      shotPowerCap: opts.shotPowerCap ?? 480,
      mass: opts.mass,
    };
  },

  player() {
    return this.marbles.find(m => m.id === this.playerId);
  },

  separateOverlaps(passes) {
    for (let n = 0; n < passes; n++) {
      for (let i = 0; i < this.marbles.length; i++) {
        for (let j = i + 1; j < this.marbles.length; j++) {
          this.resolvePair(this.marbles[i], this.marbles[j], true);
        }
      }
    }
  },

  resize() {
    const stage = document.getElementById('marble-stage');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.viewW = w;
    this.viewH = h;
    const scale = Math.min(w / this.bounds.w, h / this.bounds.h);
    this.scale = scale;
    this.offsetX = (w - this.bounds.w * scale) * 0.5;
    this.offsetY = (h - this.bounds.h * scale) * 0.5;
  },

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.offsetX) / this.scale,
      y: (sy - this.offsetY) / this.scale,
    };
  },

  marbleAt(wx, wy, pad, filterFn) {
    const reach = pad ?? 38;
    let best = null;
    let bestDist = Infinity;
    for (const m of this.marbles) {
      if (filterFn && !filterFn(m)) continue;
      const d = Math.hypot(wx - m.x, wy - m.y);
      if (d <= m.r + reach && d < bestDist) {
        bestDist = d;
        best = m;
      }
    }
    return best;
  },

  bindInput() {
    const pick = e => {
      const r = this.canvas.getBoundingClientRect();
      if (e.clientX != null) {
        return { id: e.pointerId ?? 'mouse', x: e.clientX - r.left, y: e.clientY - r.top };
      }
      const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]);
      if (!t) return null;
      return { id: t.identifier, x: t.clientX - r.left, y: t.clientY - r.top };
    };

    const onDown = e => {
      if (this._pointerId != null) return;
      const p = pick(e);
      if (!p) return;
      const w = this.screenToWorld(p.x, p.y);

      if (this.aiming) return;
      const pl = this.marbleAt(w.x, w.y, 38, m => m.kind === 'player');
      if (!pl) return;
      this._pointerId = p.id;
      this.aimMarbleId = pl.id;
      this.aiming = { sx: p.x, sy: p.y, wx: pl.x, wy: pl.y };
      e.preventDefault();
    };

    const onMove = e => {
      const p = pick(e);
      if (!p || p.id !== this._pointerId) return;

      if (!this.aiming) return;
      this.aiming.sx = p.x;
      this.aiming.sy = p.y;
      e.preventDefault();
    };

    const onUp = e => {
      const p = pick(e);
      if (this._pointerId != null && p && p.id !== this._pointerId) return;

      if (!this.aiming) {
        this._pointerId = null;
        return;
      }
      const shot = this.marbles.find(m => m.id === this.aimMarbleId);
      const end = p ? this.screenToWorld(p.x, p.y) : this.screenToWorld(this.aiming.sx, this.aiming.sy);
      const dx = this.aiming.wx - end.x;
      const dy = this.aiming.wy - end.y;
      const mult = shot.shotPowerMult ?? 1;
      const cap = shot.shotPowerCap ?? 480;
      const power = Math.min(cap, Math.hypot(dx, dy) * 4 * mult);
      if (power > 14 && shot) {
        const len = Math.hypot(dx, dy) || 1;
        shot.vx = (dx / len) * power;
        shot.vy = (dy / len) * power;
        this.shots += 1;
        this.updateHud();
      }
      this.aiming = null;
      this.aimMarbleId = null;
      this._pointerId = null;
      e.preventDefault();
    };

    if (window.PointerEvent) {
      this.canvas.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    } else {
      this.canvas.addEventListener('mousedown', onDown);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      this.canvas.addEventListener('touchstart', onDown, { passive: false });
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onUp, { passive: false });
      window.addEventListener('touchcancel', onUp);
    }

    document.getElementById('btn-reset')?.addEventListener('click', () => this.resetBoard(false));
  },

  syncCraftUi() {
    const hint = document.getElementById('marble-hint');
    if (hint) {
      hint.textContent = '台面弹珠撞彩珠得合成币 · 点「合成台」在格子里合成';
    }
  },

  toast(msg) {
    const el = document.getElementById('merge-toast');
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => { el.hidden = true; }, 2200);
  },

  updateHud() {
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(val);
    };
    set('stat-hits', this.hits);
    const blacks = (this.craftCells || []).filter(c => c === 'black').length;
    set('stat-blacks', blacks);
    const pl = this.player();
    const tierEl = document.getElementById('stat-player-tier');
    if (tierEl && pl) {
      const names = { pink: '粉', blue: '蓝', purple: '紫', green: '绿', white: '白', black: '黑' };
      tierEl.textContent = names[pl.tier] || '粉';
    }
    const c = document.getElementById('stat-coins');
    if (c) c.textContent = String(this.craftCoins);
    const prog = document.getElementById('coin-progress');
    if (prog) prog.textContent = `/${this.COIN_GOAL}`;
  },

  pairKey(a, b) {
    return a.id < b.id ? `${a.id}:${b.id}` : `${b.id}:${a.id}`;
  },

  registerHit(a, b, impulse) {
    if (impulse < 0.8) return;
    const key = this.pairKey(a, b);
    const now = performance.now();
    if (this._pairCooldown.get(key) > now) return;
    this._pairCooldown.set(key, now + 280);
    const playerHit = a.isPlayer || b.isPlayer;
    const other = a.isPlayer ? b : a;
    if (playerHit && other.kind === 'target') {
      this.hits += 1;
      this.addCraftCoins(this.COIN_PER_HIT);
    }
  },

  step(dt) {
    const substeps = 4;
    const h = dt / substeps;
    for (let s = 0; s < substeps; s++) {
      const damp = Math.pow(0.988, h * 60);
      for (const m of this.marbles) {
        m.x += m.vx * h;
        m.y += m.vy * h;
        m.vx *= damp;
        m.vy *= damp;
        const pad = m.r + 2;
        if (m.x < pad) { m.x = pad; m.vx = Math.abs(m.vx) * 0.65; }
        if (m.x > this.bounds.w - pad) { m.x = this.bounds.w - pad; m.vx = -Math.abs(m.vx) * 0.65; }
        if (m.y < pad) { m.y = pad; m.vy = Math.abs(m.vy) * 0.65; }
        if (m.y > this.bounds.h - pad) { m.y = this.bounds.h - pad; m.vy = -Math.abs(m.vy) * 0.65; }
      }
      for (let k = 0; k < 3; k++) {
        const list = this.marbles.slice();
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const a = this.marbles.find(m => m.id === list[i].id);
            const b = this.marbles.find(m => m.id === list[j].id);
            if (a && b) this.resolvePair(a, b, false);
          }
        }
      }
    }
  },

  resolvePair(a, b, setupOnly) {
    let dx = b.x - a.x;
    let dy = b.y - a.y;
    let dist = Math.hypot(dx, dy);
    const min = a.r + b.r;
    if (dist === 0) {
      const ang = Math.random() * Math.PI * 2;
      dx = Math.cos(ang);
      dy = Math.sin(ang);
      dist = 0.001;
    }
    if (dist >= min) return;

    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = min - dist;
    a.x -= nx * overlap * 0.5;
    a.y -= ny * overlap * 0.5;
    b.x += nx * overlap * 0.5;
    b.y += ny * overlap * 0.5;

    if (setupOnly) return;

    const ma = this.mass(a);
    const mb = this.mass(b);
    const dvx = a.vx - b.vx;
    const dvy = a.vy - b.vy;
    let rel = dvx * nx + dvy * ny;
    const bounce = 0.9;
    if (rel > 0) {
      const imp = (rel * bounce * 2) / (ma + mb);
      a.vx -= imp * mb * nx;
      a.vy -= imp * mb * ny;
      b.vx += imp * ma * nx;
      b.vy += imp * ma * ny;
    } else if (overlap > 0.4) {
      const wake = (overlap * 120) / (ma + mb);
      a.vx -= wake * mb * nx;
      a.vy -= wake * mb * ny;
      b.vx += wake * ma * nx;
      b.vy += wake * ma * ny;
      rel = -overlap * 30;
    } else {
      return;
    }
    this.registerHit(a, b, Math.abs(rel));
  },

  drawBoard(ctx) {
    const w = this.bounds.w;
    const h = this.bounds.h;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#8d6e63');
    g.addColorStop(0.4, '#6d4c41');
    g.addColorStop(1, '#5d4037');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255, 235, 200, 0.35)';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, w - 16, h - 16);
  },

  drawMarble(ctx, m) {
    ctx.save();
    ctx.translate(m.x, m.y);
    const [c1, c2, c3] = m.palette;
    const g = ctx.createRadialGradient(-m.r * 0.35, -m.r * 0.4, m.r * 0.1, 0, 0, m.r);
    g.addColorStop(0, c3);
    g.addColorStop(0.45, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, m.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.ellipse(-m.r * 0.28, -m.r * 0.32, m.r * 0.22, m.r * 0.14, -0.5, 0, Math.PI * 2);
    ctx.fill();
    if (m.isPlayer) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, m.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  },

  drawAim(ctx) {
    if (!this.aiming) return;
    const pl = this.marbles.find(m => m.id === this.aimMarbleId);
    if (!pl) return;
    const end = this.screenToWorld(this.aiming.sx, this.aiming.sy);
    let dx = pl.x - end.x;
    let dy = pl.y - end.y;
    const len = Math.hypot(dx, dy) || 1;
    const show = Math.min(90, len);
    dx = (dx / len) * show;
    dy = (dy / len) * show;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(pl.x, pl.y);
    ctx.lineTo(pl.x + dx, pl.y + dy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  },

  draw() {
    const ctx = this.ctx;
    const vw = this.viewW;
    const vh = this.viewH;
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(0, 0, vw, vh);
    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);
    this.drawBoard(ctx);
    for (const m of this.marbles) this.drawMarble(ctx, m);
    this.drawAim(ctx);
    ctx.restore();
  },

  loop(now) {
    try {
      if (!this._last) this._last = now;
      const dt = Math.min(0.033, (now - this._last) / 1000);
      this._last = now;
      this.step(dt);
      this.draw();
    } catch (err) {
      console.error(err);
    }
    requestAnimationFrame(t => this.loop(t));
  },
};

document.addEventListener('DOMContentLoaded', () => MarbleGame.init());
