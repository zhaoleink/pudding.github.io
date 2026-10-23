/**
 * 森林拾叶 · 在林子里走动，捡起枫叶、梧桐叶等
 */
const ForestLeavesGame = {
  canvas: null,
  ctx: null,
  stage: null,
  trees: [],
  leaves: [],
  player: { x: 200, y: 900, r: 14 },
  cam: { x: 0, y: 0 },
  speed: 140,
  heading: 0,
  targetHeading: 0,
  turnRate: 8,
  running: true,
  bag: {},
  total: 0,
  season: 'autumn',
  zoneNameEl: null,
  _simTime: 0,
  _joy: { active: false, dx: 0, dy: 0 },

  init() {
    this.canvas = document.getElementById('fl-canvas');
    this.stage = document.getElementById('fl-stage');
    this.zoneNameEl = document.getElementById('fl-zone');
    if (!this.canvas || !this.stage) return;
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;
    this.trees = buildForestTrees();
    this.leaves = buildGroundLeaves(this.trees, 140);
    this.loadSave();
    this.bindUi();
    this.bindJoystick();
    this.bindKeyboard();
    window.addEventListener('resize', () => this.resize());
    this.resize();
    this._simTime = performance.now();
    requestAnimationFrame(t => this.loop(t));
  },

  saveKey: 'forest-leaves-save-v1',

  loadSave() {
    try {
      const raw = localStorage.getItem(this.saveKey);
      if (raw) {
        const data = JSON.parse(raw);
        this.bag = data.bag || {};
        this.total = data.total || 0;
      }
    } catch {
      this.bag = {};
    }
    this.refreshHud();
    this.renderAlbum();
  },

  persist() {
    try {
      localStorage.setItem(
        this.saveKey,
        JSON.stringify({ bag: this.bag, total: this.total }),
      );
    } catch {
      /* ignore */
    }
  },

  refreshHud() {
    const t = document.getElementById('fl-total');
    const k = document.getElementById('fl-kinds');
    if (t) t.textContent = String(this.total);
    const kinds = Object.keys(this.bag).filter(id => this.bag[id] > 0).length;
    if (k) k.textContent = String(kinds);
  },

  bindUi() {
    document.getElementById('btn-fl-album')?.addEventListener('click', () => {
      document.getElementById('fl-album')?.classList.add('open');
    });
    document.getElementById('btn-fl-close-album')?.addEventListener('click', () => {
      document.getElementById('fl-album')?.classList.remove('open');
    });
    document.getElementById('btn-fl-season')?.addEventListener('click', () => {
      this.season = this.season === 'autumn' ? 'summer' : 'autumn';
      const btn = document.getElementById('btn-fl-season');
      if (btn) btn.textContent = this.season === 'autumn' ? '🍂 秋色' : '🌿 夏绿';
    });
    this.canvas.addEventListener('pointerdown', e => {
      if (e.target.closest('#fl-joystick, #fl-album, button')) return;
      const world = this.screenToWorld(e.clientX, e.clientY);
      this.tryPickLeaf(world.x, world.y, true);
    });
  },

  bindKeyboard() {
    const ignore = e => window.HubKeyboard?.shouldIgnoreGameKey?.(e);
    window.addEventListener('keydown', e => {
      if (ignore(e)) return;
      const k = e.key;
      if (k === 'ArrowUp' || k === 'w' || k === 'W') this.targetHeading = -Math.PI / 2;
      else if (k === 'ArrowDown' || k === 's' || k === 'S') this.targetHeading = Math.PI / 2;
      else if (k === 'ArrowLeft' || k === 'a' || k === 'A') this.targetHeading = Math.PI;
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') this.targetHeading = 0;
      else if (k === 'Escape') document.getElementById('fl-album')?.classList.remove('open');
      else return;
      this.heading = this.targetHeading;
      e.preventDefault();
    });
    window.addEventListener('blur', () => {
      this._joy.active = false;
      this._joy.dx = 0;
      this._joy.dy = 0;
    });
  },

  bindJoystick() {
    const base = document.querySelector('#fl-joystick .joy-base');
    const knob = document.querySelector('#fl-joystick .joy-knob');
    if (!base || !knob) return;
    let pid = null;
    const center = () => {
      const r = base.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };
    const max = () => Math.max(16, base.clientWidth * 0.38);
    const setKnob = (dx, dy) => {
      const m = max();
      const len = Math.hypot(dx, dy);
      if (len > m) {
        dx = (dx / len) * m;
        dy = (dy / len) * m;
      }
      knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      this._joy.dx = dx;
      this._joy.dy = dy;
      this._joy.active = len > 10;
      if (this._joy.active) {
        this.targetHeading = Math.atan2(dy, dx);
      }
    };
    const reset = () => {
      knob.style.transform = 'translate(-50%, -50%)';
      this._joy.active = false;
      this._joy.dx = 0;
      this._joy.dy = 0;
    };
    base.addEventListener('pointerdown', e => {
      pid = e.pointerId;
      base.setPointerCapture(e.pointerId);
      const c = center();
      setKnob(e.clientX - c.x, e.clientY - c.y);
      e.preventDefault();
    });
    base.addEventListener('pointermove', e => {
      if (pid !== e.pointerId) return;
      const c = center();
      setKnob(e.clientX - c.x, e.clientY - c.y);
      e.preventDefault();
    });
    const up = e => {
      if (pid !== e.pointerId) return;
      pid = null;
      reset();
      try {
        base.releasePointerCapture(e.pointerId);
      } catch {
        /* ok */
      }
    };
    base.addEventListener('pointerup', up);
    base.addEventListener('pointercancel', up);
  },

  normalizeAngle(a) {
    let x = a;
    while (x > Math.PI) x -= Math.PI * 2;
    while (x < -Math.PI) x += Math.PI * 2;
    return x;
  },

  updatePlayer(dt) {
    if (this._joy.active) {
      let diff = this.normalizeAngle(this.targetHeading - this.heading);
      const cap = this.turnRate * dt;
      if (Math.abs(diff) <= cap) this.heading = this.targetHeading;
      else this.heading += Math.sign(diff) * cap;
    }
    let vx = 0;
    let vy = 0;
    if (this._joy.active) {
      const mag = Math.min(1, Math.hypot(this._joy.dx, this._joy.dy) / 40);
      vx = Math.cos(this.heading) * this.speed * mag;
      vy = Math.sin(this.heading) * this.speed * mag;
    }
    this.player.x += vx * dt;
    this.player.y += vy * dt;
    const pad = 40;
    this.player.x = Math.max(pad, Math.min(FOREST_WORLD.width - pad, this.player.x));
    this.player.y = Math.max(pad, Math.min(FOREST_WORLD.height - pad, this.player.y));
    this.tryPickLeaf(this.player.x, this.player.y, false);
    const z = zoneAt(this.player.x, this.player.y);
    if (this.zoneNameEl) {
      this.zoneNameEl.textContent = z ? `${z.name} · ${z.blurb}` : '沿着小径继续走…';
    }
  },

  tryPickLeaf(x, y, fromTap) {
    const pickR = fromTap ? 36 : 28;
    for (let i = this.leaves.length - 1; i >= 0; i -= 1) {
      const L = this.leaves[i];
      if (Math.hypot(L.x - x, L.y - y) < pickR) {
        this.collectLeaf(L, i);
        return true;
      }
    }
    return false;
  },

  collectLeaf(leaf, index) {
    this.leaves.splice(index, 1);
    const id = leaf.species;
    this.bag[id] = (this.bag[id] || 0) + 1;
    this.total += 1;
    const spec = LEAF_SPECIES[id];
    this.toast(`捡到了 ${spec?.name || ''}叶`);
    this.persist();
    this.refreshHud();
    this.renderAlbum();
    if (this.leaves.length < 90) {
      this.leaves.push(...buildGroundLeaves(this.trees, 12));
    }
  },

  toast(msg) {
    const el = document.getElementById('fl-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => el.classList.remove('show'), 1200);
  },

  screenToWorld(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    return {
      x: sx / this.scale + this.cam.x,
      y: sy / this.scale + this.cam.y,
    };
  },

  updateCamera() {
    const vw = this.viewW / this.scale;
    const vh = this.viewH / this.scale;
    this.cam.x = this.player.x - vw / 2;
    this.cam.y = this.player.y - vh / 2;
    this.cam.x = Math.max(0, Math.min(FOREST_WORLD.width - vw, this.cam.x));
    this.cam.y = Math.max(0, Math.min(FOREST_WORLD.height - vh, this.cam.y));
  },

  resize() {
    const rect = this.stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.viewW = Math.max(200, rect.width);
    this.viewH = Math.max(200, rect.height);
    this.scale = Math.min(this.viewW / 520, this.viewH / 520, 1.4);
    this.canvas.width = Math.floor(this.viewW * dpr);
    this.canvas.height = Math.floor(this.viewH * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.updateCamera();
  },

  loop(now) {
    const dt = Math.min(0.05, (now - (this._simTime || now)) / 1000);
    this._simTime = now;
    this.updatePlayer(dt);
    this.updateCamera();
    this.draw(now);
    requestAnimationFrame(t => this.loop(t));
  },

  drawTree(ctx, tree, now) {
    const sway = Math.sin(now * 0.001 + tree.x * 0.01) * 3;
    ctx.save();
    ctx.translate(tree.x, tree.y);
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(-tree.trunk / 2, 0, tree.trunk, tree.r * 0.55);
    const spec = LEAF_SPECIES[tree.species];
    const col = spec ? leafSeasonColor(spec, this.season) : '#2e7d32';
    ctx.fillStyle = col;
    ctx.globalAlpha = 0.88;
    ctx.beginPath();
    ctx.ellipse(sway, -tree.r * 0.35, tree.r, tree.r * 0.82, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    if (tree.species === 'birch') {
      ctx.fillStyle = '#efebe9';
      ctx.fillRect(-tree.trunk / 2, 0, tree.trunk, tree.r * 0.55);
      ctx.strokeStyle = '#bdbdbd';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-tree.trunk / 2 + 2, 8 + i * 14);
        ctx.lineTo(tree.trunk / 2 - 2, 12 + i * 14);
        ctx.stroke();
      }
    }
    ctx.restore();
  },

  drawGround(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, FOREST_WORLD.height);
    g.addColorStop(0, '#1b5e20');
    g.addColorStop(0.35, '#2e7d32');
    g.addColorStop(1, '#33691e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, FOREST_WORLD.width, FOREST_WORLD.height);
    FOREST_WORLD.zones.forEach(z => {
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.beginPath();
      ctx.ellipse(z.x + z.w / 2, z.y + z.h / 2, z.w * 0.48, z.h * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font = '600 14px PingFang SC, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(z.name, z.x + z.w / 2, z.y + 24);
    });
  },

  drawPlayer(ctx) {
    const p = this.player;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffcc80';
    ctx.beginPath();
    ctx.arc(0, 0, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5d4037';
    ctx.beginPath();
    ctx.arc(-4, -2, 2.5, 0, Math.PI * 2);
    ctx.arc(4, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff3e0';
    ctx.fillRect(-8, 8, 16, 10);
    ctx.strokeStyle = '#6d4c41';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, p.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  },

  draw(now) {
    const ctx = this.ctx;
    const w = this.viewW;
    const h = this.viewH;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.scale(this.scale, this.scale);
    ctx.translate(-this.cam.x, -this.cam.y);
    this.drawGround(ctx);
    this.trees.forEach(t => this.drawTree(ctx, t, now));
    this.leaves.forEach(L => {
      const bob = Math.sin(now * 0.002 + L.wobble) * 1.5;
      drawLeafOnGround(ctx, L.species, L.x, L.y + bob, L.rot, L.scale, this.season);
    });
    this.drawPlayer(ctx);
    ctx.restore();
  },

  renderAlbum() {
    const grid = document.getElementById('fl-album-grid');
    if (!grid) return;
    grid.innerHTML = '';
    Object.keys(LEAF_SPECIES).forEach(id => {
      const spec = LEAF_SPECIES[id];
      const n = this.bag[id] || 0;
      const card = document.createElement('div');
      card.className = `fl-species${n ? ' owned' : ''}`;
      const cvs = document.createElement('canvas');
      cvs.width = 80;
      cvs.height = 80;
      const c = cvs.getContext('2d');
      if (c && n) drawLeafIcon(c, id, 40, 44, 52, this.season);
      else if (c) {
        c.fillStyle = '#cfd8dc';
        c.font = '28px sans-serif';
        c.textAlign = 'center';
        c.fillText('?', 40, 48);
      }
      const title = document.createElement('p');
      title.className = 'fl-species-name';
      title.textContent = spec.name;
      const sub = document.createElement('p');
      sub.className = 'fl-species-sub';
      sub.textContent = n ? `已收集 ${n} 片 · ${spec.hint}` : `还没捡到 · ${spec.hint}`;
      card.appendChild(cvs);
      card.appendChild(title);
      card.appendChild(sub);
      grid.appendChild(card);
    });
  },
};

(function boot() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ForestLeavesGame.init(), { once: true });
  } else {
    ForestLeavesGame.init();
  }
})();
