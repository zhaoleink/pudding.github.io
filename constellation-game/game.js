/**
 * 星座连线 · 按顺序点星，连出星座
 */
const StarGame = {
  puzzles: [
    {
      id: 'dipper',
      name: '北斗七星',
      hint: '1→7：先绕勺斗一圈，再沿勺柄甩出去（像大勺子）',
      // 勺斗在左下，勺柄向右上弯（天枢→天璇→天玑→天权→玉衡→开阳→摇光）
      stars: [
        { x: 0.24, y: 0.62, n: 1 }, // 天枢 · 勺斗下口
        { x: 0.28, y: 0.50, n: 2 }, // 天璇 · 勺斗左侧
        { x: 0.38, y: 0.42, n: 3 }, // 天玑 · 勺斗上沿
        { x: 0.48, y: 0.44, n: 4 }, // 天权 · 斗柄相接
        { x: 0.60, y: 0.38, n: 5 }, // 玉衡 · 柄
        { x: 0.72, y: 0.33, n: 6 }, // 开阳 · 柄
        { x: 0.84, y: 0.30, n: 7 }, // 摇光 · 柄端
      ],
      path: [0, 1, 2, 3, 4, 5, 6],
      // 勺斗收口（1 连 4），连完才像斗
      closeBowl: [0, 3],
    },
    {
      id: 'cassiopeia',
      name: '仙后座',
      hint: 'W 形五颗星，按顺序连起来',
      stars: [
        { x: 0.28, y: 0.32, n: 1 },
        { x: 0.38, y: 0.42, n: 2 },
        { x: 0.48, y: 0.35, n: 3 },
        { x: 0.58, y: 0.44, n: 4 },
        { x: 0.68, y: 0.34, n: 5 },
      ],
      path: [0, 1, 2, 3, 4],
    },
    {
      id: 'orion',
      name: '猎户腰带',
      hint: '三颗排成一线的亮星',
      stars: [
        { x: 0.32, y: 0.48, n: 1 },
        { x: 0.48, y: 0.46, n: 2 },
        { x: 0.64, y: 0.48, n: 3 },
        { x: 0.48, y: 0.28, n: 4 },
        { x: 0.48, y: 0.68, n: 5 },
      ],
      path: [3, 0, 1, 2, 4],
    },
  ],

  level: 0,
  step: 0,
  done: false,
  twinkle: 0,
  dust: [],

  init() {
    this.canvas = document.getElementById('star-canvas');
    if (!this.canvas) {
      console.error('星座：找不到画布');
      return;
    }
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;
    this.seedDust();
    this.bindInput();
    document.getElementById('btn-hint')?.addEventListener('click', () => this.showHint());
    document.getElementById('btn-skip')?.addEventListener('click', () => this.nextLevel());
    document.getElementById('btn-next')?.addEventListener('click', () => this.nextLevel());
    window.addEventListener('resize', () => this.resize());
    this.resize();
    this.syncHud();
    requestAnimationFrame(t => this.loop(t));
  },

  seedDust() {
    this.dust = [];
    for (let i = 0; i < 80; i++) {
      this.dust.push({
        x: Math.random(),
        y: Math.random(),
        s: Math.random() * 1.2 + 0.3,
        ph: Math.random() * Math.PI * 2,
      });
    }
  },

  puzzle() {
    return this.puzzles[this.level] || this.puzzles[0];
  },

  syncHud() {
    const P = this.puzzle();
    document.getElementById('level-title').textContent = P.name;
    document.getElementById('level-hint').textContent = P.hint;
    document.getElementById('level-progress').textContent =
      `${Math.min(this.step, P.path.length)} / ${P.path.length}`;
  },

  showHint() {
    this.toast(this.puzzle().hint, 2800);
  },

  toast(msg, ms) {
    const el = document.getElementById('star-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => el.classList.remove('show'), ms || 2200);
  },

  nextLevel() {
    document.getElementById('star-win')?.classList.remove('show');
    if (this.level < this.puzzles.length - 1) {
      this.level += 1;
    } else {
      this.level = 0;
      this.toast('从头再玩一遍～', 2000);
    }
    this.step = 0;
    this.done = false;
    this.syncHud();
  },

  bindInput() {
    const tap = e => {
      if (this.done) return;
      const p = this.pointer(e);
      const hit = this.hitStar(p.x, p.y);
      if (hit == null) return;
      const P = this.puzzle();
      const want = P.path[this.step];
      if (hit === want) {
        this.step += 1;
        this.syncHud();
        if (this.step >= P.path.length) {
          this.done = true;
          document.getElementById('win-title').textContent = `${P.name} 连好了！`;
          document.getElementById('win-msg').textContent = '星星都亮起来了';
          document.getElementById('star-win')?.classList.add('show');
        }
      } else {
        this.toast(`先点第 ${P.stars[P.path[this.step]].n} 颗星`, 1800);
      }
      e.preventDefault();
    };
    this.canvas.addEventListener('mousedown', tap);
    this.canvas.addEventListener('touchstart', tap, { passive: false });
  },

  pointer(e) {
    const r = this.canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  },

  hitStar(sx, sy) {
    const P = this.puzzle();
    const r = 28;
    let best = null;
    let bestD = r;
    for (let i = 0; i < P.stars.length; i++) {
      const s = P.stars[i];
      const wx = s.x * this.viewW;
      const wy = s.y * this.viewH;
      const d = Math.hypot(sx - wx, sy - wy);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  },

  resize() {
    const stage = document.getElementById('star-stage');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.viewW = w;
    this.viewH = h;
  },

  draw() {
    const ctx = this.ctx;
    const w = this.viewW;
    const h = this.viewH;
    const P = this.puzzle();

    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#050814');
    bg.addColorStop(0.5, '#0a1230');
    bg.addColorStop(1, '#12082a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    for (const d of this.dust) {
      const a = 0.15 + Math.sin(this.twinkle + d.ph) * 0.12;
      ctx.fillStyle = `rgba(200, 220, 255, ${a})`;
      ctx.fillRect(d.x * w, d.y * h, d.s, d.s);
    }

    if (P.id === 'dipper' && !this.done && this.step === 0) {
      ctx.strokeStyle = 'rgba(129, 212, 250, 0.14)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 7]);
      ctx.lineCap = 'round';
      for (let i = 1; i < P.path.length; i++) {
        const a = P.stars[P.path[i - 1]];
        const b = P.stars[P.path[i]];
        ctx.beginPath();
        ctx.moveTo(a.x * w, a.y * h);
        ctx.lineTo(b.x * w, b.y * h);
        ctx.stroke();
      }
      if (P.closeBowl) {
        const a = P.stars[P.closeBowl[0]];
        const b = P.stars[P.closeBowl[1]];
        ctx.beginPath();
        ctx.moveTo(a.x * w, a.y * h);
        ctx.lineTo(b.x * w, b.y * h);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    ctx.strokeStyle = 'rgba(100, 181, 246, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    for (let i = 1; i < this.step; i++) {
      const a = P.stars[P.path[i - 1]];
      const b = P.stars[P.path[i]];
      ctx.beginPath();
      ctx.moveTo(a.x * w, a.y * h);
      ctx.lineTo(b.x * w, b.y * h);
      ctx.stroke();
    }

    if (P.closeBowl && (this.done || this.step >= 4)) {
      ctx.strokeStyle = this.done ? 'rgba(255, 245, 157, 0.75)' : 'rgba(100, 181, 246, 0.5)';
      ctx.lineWidth = 2.5;
      const a = P.stars[P.closeBowl[0]];
      const b = P.stars[P.closeBowl[1]];
      ctx.beginPath();
      ctx.moveTo(a.x * w, a.y * h);
      ctx.lineTo(b.x * w, b.y * h);
      ctx.stroke();
    }

    if (this.done) {
      ctx.shadowColor = '#fff59d';
      ctx.shadowBlur = 18;
    }

    P.stars.forEach((s, i) => {
      const x = s.x * w;
      const y = s.y * h;
      const lit = this.done || P.path.slice(0, this.step).includes(i);
      const next = !this.done && P.path[this.step] === i;
      const pulse = next ? 1 + Math.sin(this.twinkle * 4) * 0.15 : 1;
      const rad = (lit ? 10 : 7) * pulse;

      const g = ctx.createRadialGradient(x, y, 0, x, y, rad * 2.2);
      g.addColorStop(0, lit ? '#fff' : 'rgba(200,230,255,0.9)');
      g.addColorStop(0.4, lit ? '#81d4fa' : 'rgba(129,212,250,0.5)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, rad * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = next ? '#fff59d' : 'rgba(255,255,255,0.85)';
      ctx.font = `bold ${next ? 13 : 11}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(s.n), x, y + rad + 12);
    });

    ctx.shadowBlur = 0;
  },

  loop(now) {
    if (!this._last) this._last = now;
    this.twinkle += (now - this._last) / 1000;
    this._last = now;
    this.draw();
    requestAnimationFrame(t => this.loop(t));
  },
};

document.addEventListener('DOMContentLoaded', () => StarGame.init());
