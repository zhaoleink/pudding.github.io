/**
 * 小球棋 · 不透明是我的球，透明是别人的；我的球撞到就归我
 */
const BallCaptureGame = {
  bounds: { w: 800, h: 520 },
  balls: [],
  playerTeam: 'mine',
  aiming: null,
  aimId: null,
  _pointerId: null,
  _pairCooldown: new Map(),
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  viewW: 800,
  viewH: 520,
  _winHandled: false,
  _pendingWinReturn: false,

  paletteRandom() {
    const hues = [200, 260, 140, 30, 330, 180, 50];
    const h = hues[Math.floor(Math.random() * hues.length)];
    return `hsl(${h}, 72%, 58%)`;
  },

  init() {
    try {
      this.canvas = document.getElementById('bc-canvas');
      if (!this.canvas) throw new Error('找不到画布');
      this.ctx = this.canvas.getContext('2d');
      if (!this.ctx) throw new Error('无法创建画布');
    } catch (err) {
      console.error(err);
      return;
    }
    this.embed = new URLSearchParams(location.search).get('embed') === '1';
    this.started = this.embed;
    this.bindInput();
    this.bindEntryButton();
    window.addEventListener('resize', () => this.resize());
    this.resize();
    if (this.started) this.resetBoard();
    else document.body.classList.add('bc-entry');
    requestAnimationFrame(t => this.loop(t));
  },

  bindEntryButton() {
    const btn = document.getElementById('bc-entry-btn');
    if (!btn) return;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (this.started) return;
      this.started = true;
      document.body.classList.remove('bc-entry');
      btn.hidden = true;
      this.resetBoard();
    });
    if (this.embed) btn.hidden = true;
  },

  resetBoard() {
    this.balls = [];
    this.aiming = null;
    this.aimId = null;
    this._pointerId = null;
    this._pairCooldown.clear();
    this._winHandled = false;
    this._pendingWinReturn = false;
    clearTimeout(this._winReturnT);
    const cx = this.bounds.w * 0.5;
    const cy = this.bounds.h * 0.48;
    const count = 10 + Math.floor(Math.random() * 5);
    const spots = [];
    for (let i = 0; i < 80; i++) {
      spots.push([
        cx + (Math.random() - 0.5) * (this.bounds.w - 120),
        cy + (Math.random() - 0.5) * (this.bounds.h - 140),
      ]);
    }
    let placed = 0;
    const tryPlace = (r, team, opts = {}) => {
      for (const [x, y] of spots) {
        if (this.balls.some(b => Math.hypot(b.x - x, b.y - y) < b.r + r + 8)) continue;
        this.balls.push({
          id: Math.random().toString(36).slice(2, 9),
          x,
          y,
          vx: 0,
          vy: 0,
          r,
          team,
          color: opts.color || this.paletteRandom(),
        });
        placed++;
        return true;
      }
      return false;
    };
    tryPlace(22, 'mine', { color: '#ff6b9d' });
    while (placed < count) {
      if (!tryPlace(16 + Math.random() * 4, 'neutral')) break;
    }
    this.separateOverlaps(10);
    this.updateHud();
    const entryBtn = document.getElementById('bc-entry-btn');
    if (entryBtn) entryBtn.hidden = true;
    document.body.classList.remove('bc-entry');
    this.started = true;
  },

  mineCount() {
    return this.balls.filter(b => b.team === 'mine').length;
  },

  allStopped() {
    return this.balls.every(b => Math.hypot(b.vx, b.vy) < 8);
  },

  separateOverlaps(passes) {
    for (let n = 0; n < passes; n++) {
      for (let i = 0; i < this.balls.length; i++) {
        for (let j = i + 1; j < this.balls.length; j++) {
          this.resolvePair(this.balls[i], this.balls[j], true);
        }
      }
    }
  },

  mass(b) {
    return b.r * b.r;
  },

  pairKey(a, b) {
    return a.id < b.id ? `${a.id}:${b.id}` : `${b.id}:${a.id}`;
  },

  tryCapture(a, b, impulse) {
    if (impulse < 1.2) return;
    const key = this.pairKey(a, b);
    const now = performance.now();
    if (this._pairCooldown.get(key) > now) return;
    this._pairCooldown.set(key, now + 320);
    let mine = null;
    let other = null;
    if (a.team === 'mine' && b.team === 'neutral') {
      mine = a;
      other = b;
    } else if (b.team === 'mine' && a.team === 'neutral') {
      mine = b;
      other = a;
    } else {
      return;
    }
    other.team = 'mine';
    other.color = mine.color;
    this.toast('收到一颗球！');
    this.updateHud();
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
    const bounce = 0.92;
    if (rel > 0) {
      const imp = (rel * bounce * 2) / (ma + mb);
      a.vx -= imp * mb * nx;
      a.vy -= imp * mb * ny;
      b.vx += imp * ma * nx;
      b.vy += imp * ma * ny;
    } else if (overlap > 0.35) {
      const wake = (overlap * 110) / (ma + mb);
      a.vx -= wake * mb * nx;
      a.vy -= wake * mb * ny;
      b.vx += wake * ma * nx;
      b.vy += wake * ma * ny;
      rel = -overlap * 28;
    } else {
      return;
    }
    this.tryCapture(a, b, Math.abs(rel));
  },

  step(dt) {
    const substeps = 4;
    const h = dt / substeps;
    for (let s = 0; s < substeps; s++) {
      const damp = Math.pow(0.988, h * 60);
      for (const m of this.balls) {
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
        const list = this.balls.slice();
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const a = this.balls.find(x => x.id === list[i].id);
            const b = this.balls.find(x => x.id === list[j].id);
            if (a && b) this.resolvePair(a, b, false);
          }
        }
      }
    }
  },

  resize() {
    const stage = document.getElementById('bc-stage');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.viewW = w;
    this.viewH = h;
    this.scale = Math.min(w / this.bounds.w, h / this.bounds.h);
    this.offsetX = (w - this.bounds.w * this.scale) * 0.5;
    this.offsetY = (h - this.bounds.h * this.scale) * 0.5;
  },

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.offsetX) / this.scale,
      y: (sy - this.offsetY) / this.scale,
    };
  },

  ballAt(wx, wy, pad) {
    let best = null;
    let bestD = Infinity;
    for (const m of this.balls) {
      if (m.team !== 'mine') continue;
      const d = Math.hypot(wx - m.x, wy - m.y);
      if (d <= m.r + (pad ?? 36) && d < bestD) {
        bestD = d;
        best = m;
      }
    }
    return best;
  },

  bindInput() {
    const pick = e => {
      const r = this.canvas.getBoundingClientRect();
      const t = e.touches?.[0] ?? e.changedTouches?.[0];
      const cx = e.clientX ?? t?.clientX;
      const cy = e.clientY ?? t?.clientY;
      if (cx == null) return null;
      return { id: e.pointerId ?? t?.identifier ?? 'mouse', x: cx - r.left, y: cy - r.top };
    };

    const onDown = e => {
      if (this._pointerId != null) return;
      const p = pick(e);
      if (!p) return;
      const w = this.screenToWorld(p.x, p.y);
      const b = this.ballAt(w.x, w.y);
      if (!b) return;
      this._pointerId = p.id;
      this.aimId = b.id;
      this.aiming = { sx: p.x, sy: p.y, wx: b.x, wy: b.y };
      e.preventDefault();
    };

    const onMove = e => {
      const p = pick(e);
      if (!p || p.id !== this._pointerId || !this.aiming) return;
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
      const shot = this.balls.find(m => m.id === this.aimId);
      const end = p ? this.screenToWorld(p.x, p.y) : this.screenToWorld(this.aiming.sx, this.aiming.sy);
      const dx = this.aiming.wx - end.x;
      const dy = this.aiming.wy - end.y;
      const power = Math.min(520, Math.hypot(dx, dy) * 4.2);
      if (power > 12 && shot) {
        const len = Math.hypot(dx, dy) || 1;
        shot.vx = (dx / len) * power;
        shot.vy = (dy / len) * power;
      }
      this.aiming = null;
      this.aimId = null;
      this._pointerId = null;
      e.preventDefault();
    };

    this.canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    document.getElementById('btn-bc-reset')?.addEventListener('click', () => this.resetBoard());
  },

  toast(msg) {
    const el = document.getElementById('bc-toast');
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => { el.hidden = true; }, 1800);
  },

  updateHud() {
    const mine = this.mineCount();
    const total = this.balls.length;
    const m = document.getElementById('stat-mine');
    const t = document.getElementById('stat-total');
    if (m) m.textContent = String(mine);
    if (t) t.textContent = String(total);
    if (mine >= total && total > 1 && !this._winHandled) {
      this._winHandled = true;
      this._pendingWinReturn = true;
      this.toast('全收齐了！你赢了');
    }
  },

  returnToEntry() {
    this.balls = [];
    this.aiming = null;
    this.aimId = null;
    this._pointerId = null;
    this._pairCooldown.clear();
    this._winHandled = false;
    this._pendingWinReturn = false;
    clearTimeout(this._winReturnT);
    this.started = false;
    document.body.classList.add('bc-entry');
    const entryBtn = document.getElementById('bc-entry-btn');
    if (entryBtn) entryBtn.hidden = false;
    const m = document.getElementById('stat-mine');
    const t = document.getElementById('stat-total');
    if (m) m.textContent = '1';
    if (t) t.textContent = '0';
  },

  finishWin() {
    if (this.embed) {
      try {
        window.parent.postMessage({ type: 'bc-win' }, '*');
      } catch (_) { /* ignore */ }
      this.balls = [];
      this.started = false;
      this._winHandled = false;
      this._pendingWinReturn = false;
      return;
    }
    this.returnToEntry();
    this.toast('回到「棋」，点它再玩一局');
  },

  drawBall(ctx, b) {
    const mine = b.team === 'mine';
    ctx.save();
    ctx.translate(b.x, b.y);
    const g = ctx.createRadialGradient(-b.r * 0.3, -b.r * 0.35, b.r * 0.08, 0, 0, b.r);
    if (mine) {
      g.addColorStop(0, '#fff');
      g.addColorStop(0.4, b.color);
      g.addColorStop(1, '#c2185b');
      ctx.globalAlpha = 1;
    } else {
      g.addColorStop(0, 'rgba(255,255,255,0.55)');
      g.addColorStop(0.5, b.color);
      g.addColorStop(1, 'rgba(80,80,80,0.35)');
      ctx.globalAlpha = 0.42;
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, b.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = mine ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)';
    ctx.lineWidth = mine ? 2.5 : 1.5;
    if (!mine) ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, b.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  },

  drawAim(ctx) {
    if (!this.aiming) return;
    const pl = this.balls.find(m => m.id === this.aimId);
    if (!pl) return;
    const end = this.screenToWorld(this.aiming.sx, this.aiming.sy);
    let dx = pl.x - end.x;
    let dy = pl.y - end.y;
    const len = Math.hypot(dx, dy) || 1;
    const show = Math.min(90, len);
    dx = (dx / len) * show;
    dy = (dy / len) * show;
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(pl.x, pl.y);
    ctx.lineTo(pl.x + dx, pl.y + dy);
    ctx.stroke();
    ctx.setLineDash([]);
  },

  drawBoard(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, this.bounds.h);
    g.addColorStop(0, '#8d6e63');
    g.addColorStop(1, '#5d4037');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, this.bounds.w, this.bounds.h);
    ctx.strokeStyle = 'rgba(255,235,200,0.35)';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, this.bounds.w - 16, this.bounds.h - 16);
  },

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(0, 0, this.viewW, this.viewH);
    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);
    this.drawBoard(ctx);
    if (!this.started) {
      ctx.restore();
      return;
    }
    for (const b of this.balls) this.drawBall(ctx, b);
    this.drawAim(ctx);
    ctx.restore();
  },

  loop(now) {
    if (!this._last) this._last = now;
    const dt = Math.min(0.033, (now - this._last) / 1000);
    this._last = now;
    if (this.started) this.step(dt);
    this.draw();
    if (this._pendingWinReturn && this.allStopped()) {
      this._pendingWinReturn = false;
      clearTimeout(this._winReturnT);
      this._winReturnT = setTimeout(() => this.finishWin(), 1400);
    }
    requestAnimationFrame(t => this.loop(t));
  },
};

document.addEventListener('DOMContentLoaded', () => BallCaptureGame.init());
