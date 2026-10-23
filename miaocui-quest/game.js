/**
 * 妙脆小猫 · 按钮关 — 四关教程 + 十五关正式
 */
const MiaoQuest = {
  SAVE_KEY: 'miaocui_quest_tutorial_v1',
  /** 小猫走路时的脚点高度（和 spawn.wy 一致） */
  WALK_Y: 410,
  /** 深坑上沿（地面在这里断开） */
  GAP_LIP_Y: 430,

  tutorialLevels: [
    {
      id: 1,
      name: '教程 ① 跳过深坑',
      winMode: 'touch',
      tutorialStart: '① 摇杆向右走 · 按蹦跳键跳过深坑 · 过去碰过关按钮',
      tutorialGap: '按蹦跳键，跳过深坑',
      spawn: { x: 180, y: 410 },
      gap: { x: 500, w: 155 },
      button: { x: 1020, y: 372, w: 140, h: 64, label: '过关' },
      platform: { x: 1020, y: 408, w: 200, h: 26 },
    },
    {
      id: 2,
      name: '教程 ② 够到按钮',
      winMode: 'jump',
      tutorialStart: '② 走到按钮下方 · 按蹦跳键，够到过关按钮',
      tutorialJump: '按蹦跳键，够到过关按钮',
      spawn: { x: 700, y: 410 },
      button: { x: 1020, y: 348, w: 140, h: 64, label: '过关' },
      platform: { x: 1020, y: 390, w: 220, h: 26 },
    },
    {
      id: 3,
      name: '教程 ③ 一起练',
      winMode: 'jump',
      tutorialStart: '③ 先蹦跳过深坑 · 再蹦起来碰过关按钮',
      tutorialGap: '按蹦跳键，跳过深坑',
      tutorialJump: '按蹦跳键，够到过关按钮',
      spawn: { x: 160, y: 410 },
      gap: { x: 480, w: 150 },
      button: { x: 1120, y: 348, w: 140, h: 64, label: '过关' },
      platform: { x: 1120, y: 390, w: 220, h: 26 },
    },
    {
      id: 4,
      name: '教程 ④ 蹦弹垫开按钮',
      winMode: 'touch',
      tutorialStart: '④ 坑边蹦弹垫飞过深坑 · 踩开关打开过关按钮 · 再碰按钮过关',
      tutorialGap: '站橙垫按蹦跳，跳过深坑',
      tutorialSwitch: '踩紫色开关，打开过关按钮',
      spawn: { x: 160, y: 410 },
      gap: { x: 640, w: 155 },
      bouncePads: [{ x: 512, surfaceY: 410, w: 98, h: 20 }],
      switches: [{ id: 'main', x: 820, surfaceY: 410, w: 88, h: 18 }],
      button: {
        x: 1060,
        y: 372,
        w: 140,
        h: 64,
        label: '过关',
        requiresSwitch: 'main',
        offLabel: '先踩开关',
      },
      platform: { x: 1060, y: 408, w: 200, h: 26 },
    },
  ],

  formalLevels: [
    {
      id: 1,
      name: '正式 ① 碰按钮',
      winMode: 'touch',
      spawn: { x: 260, y: 410 },
      button: { x: 980, y: 372, w: 140, h: 64, label: '过关' },
      platform: { x: 980, y: 408, w: 200, h: 26 },
    },
    {
      id: 2,
      name: '正式 ② 跳沟',
      winMode: 'touch',
      spawn: { x: 200, y: 410 },
      gap: { x: 520, w: 138 },
      button: { x: 1080, y: 410, w: 140, h: 64, label: '过关' },
    },
    {
      id: 3,
      name: '正式 ③ 沟再蹦够',
      winMode: 'jump',
      spawn: { x: 170, y: 410 },
      gap: { x: 490, w: 142 },
      button: { x: 1100, y: 348, w: 140, h: 64, label: '过关' },
      platform: { x: 1100, y: 390, w: 220, h: 26 },
    },
    {
      id: 4,
      name: '正式 ④ 蹦弹垫',
      winMode: 'touch',
      tutorialStart: '④ 坑边地上的蹦弹垫 · 站上去按蹦跳（跳高×2）',
      spawn: { x: 160, y: 410 },
      gap: { x: 660, w: 152 },
      bouncePads: [{ x: 534, surfaceY: 410, w: 98, h: 20 }],
      button: { x: 1120, y: 410, w: 140, h: 64, label: '过关' },
    },
    {
      id: 5,
      name: '正式 ⑤ 踩开关',
      winMode: 'jump',
      tutorialStart: '⑤ 先踩紫色开关 · 再蹦起来碰过关按钮',
      spawn: { x: 180, y: 410 },
      switches: [{ id: 'main', x: 560, surfaceY: 410, w: 88, h: 18 }],
      gap: { x: 740, w: 128 },
      button: {
        x: 1080,
        y: 348,
        w: 140,
        h: 64,
        label: '过关',
        requiresSwitch: 'main',
        offLabel: '先踩开关',
      },
      platform: { x: 1080, y: 390, w: 220, h: 26 },
    },
    {
      id: 6,
      name: '正式 ⑥ 超长弹沟',
      winMode: 'touch',
      spawn: { x: 130, y: 410 },
      gap: { x: 630, w: 172 },
      bouncePads: [{ x: 484, surfaceY: 410, w: 100, h: 20 }],
      button: { x: 1160, y: 410, w: 140, h: 64, label: '过关' },
    },
    {
      id: 7,
      name: '正式 ⑦ 弹沟蹦开钮',
      winMode: 'jump',
      spawn: { x: 140, y: 410 },
      gap: { x: 610, w: 158 },
      bouncePads: [{ x: 481, surfaceY: 410, w: 98, h: 20 }],
      switches: [{ id: 'main', x: 795, surfaceY: 410, w: 88, h: 18 }],
      button: {
        x: 1090,
        y: 336,
        w: 140,
        h: 64,
        label: '过关',
        requiresSwitch: 'main',
        offLabel: '先踩开关',
      },
      platform: { x: 1090, y: 378, w: 220, h: 26 },
    },
    {
      id: 8,
      name: '正式 ⑧ 双坑连弹',
      winMode: 'touch',
      spawn: { x: 130, y: 410 },
      gap: { x: 455, w: 112 },
      gap2: { x: 695, w: 115 },
      bouncePads: [
        { x: 339, surfaceY: 410, w: 90, h: 18 },
        { x: 577, surfaceY: 410, w: 90, h: 18 },
      ],
      button: { x: 1140, y: 410, w: 140, h: 64, label: '过关' },
    },
    {
      id: 9,
      name: '正式 ⑨ 开关联弹蹦',
      winMode: 'jump',
      spawn: { x: 150, y: 410 },
      switches: [{ id: 'main', x: 455, surfaceY: 410, w: 88, h: 18 }],
      gap: { x: 695, w: 175 },
      bouncePads: [{ x: 557, surfaceY: 410, w: 98, h: 20 }],
      button: {
        x: 1130,
        y: 332,
        w: 140,
        h: 64,
        label: '过关',
        requiresSwitch: 'main',
        offLabel: '先踩开关',
      },
      platform: { x: 1130, y: 374, w: 220, h: 26 },
    },
    {
      id: 10,
      name: '正式 ⑩ 终局',
      winMode: 'jump',
      spawn: { x: 110, y: 410 },
      gap: { x: 655, w: 182 },
      bouncePads: [{ x: 504, surfaceY: 410, w: 98, h: 20 }],
      switches: [{ id: 'main', x: 925, surfaceY: 410, w: 88, h: 18 }],
      button: {
        x: 1160,
        y: 326,
        w: 140,
        h: 64,
        label: '过关',
        requiresSwitch: 'main',
        offLabel: '先踩开关',
      },
      platform: { x: 1160, y: 368, w: 220, h: 26 },
    },
    {
      id: 11,
      name: '正式 ⑪ 远途双坑开蹦',
      winMode: 'jump',
      spawn: { x: 70, y: 410 },
      gap: { x: 460, w: 148 },
      gap2: { x: 780, w: 155 },
      bouncePads: [
        { x: 326, surfaceY: 410, w: 96, h: 20 },
        { x: 654, surfaceY: 410, w: 96, h: 20 },
      ],
      switches: [{ id: 'main', x: 970, surfaceY: 410, w: 88, h: 18 }],
      button: {
        x: 1210,
        y: 328,
        w: 140,
        h: 64,
        label: '过关',
        requiresSwitch: 'main',
        offLabel: '先踩开关',
      },
      platform: { x: 1210, y: 370, w: 220, h: 26 },
    },
    {
      id: 12,
      name: '正式 ⑫ 最宽弹沟',
      winMode: 'jump',
      spawn: { x: 100, y: 410 },
      gap: { x: 675, w: 188 },
      bouncePads: [{ x: 491, surfaceY: 410, w: 100, h: 20 }],
      switches: [{ id: 'main', x: 955, surfaceY: 410, w: 88, h: 18 }],
      button: {
        x: 1190,
        y: 322,
        w: 140,
        h: 64,
        label: '过关',
        requiresSwitch: 'main',
        offLabel: '先踩开关',
      },
      platform: { x: 1190, y: 364, w: 220, h: 26 },
    },
    {
      id: 13,
      name: '正式 ⑬ 开关联宽弹',
      winMode: 'jump',
      spawn: { x: 110, y: 410 },
      switches: [{ id: 'main', x: 430, surfaceY: 410, w: 88, h: 18 }],
      gap: { x: 710, w: 182 },
      bouncePads: [{ x: 568, surfaceY: 410, w: 98, h: 20 }],
      button: {
        x: 1170,
        y: 320,
        w: 140,
        h: 64,
        label: '过关',
        requiresSwitch: 'main',
        offLabel: '先踩开关',
      },
      platform: { x: 1170, y: 362, w: 220, h: 26 },
    },
    {
      id: 14,
      name: '正式 ⑭ 双坑开蹦',
      winMode: 'jump',
      spawn: { x: 95, y: 410 },
      gap: { x: 415, w: 120 },
      gap2: { x: 705, w: 128 },
      bouncePads: [
        { x: 305, surfaceY: 410, w: 90, h: 18 },
        { x: 581, surfaceY: 410, w: 90, h: 18 },
      ],
      switches: [{ id: 'main', x: 875, surfaceY: 410, w: 88, h: 18 }],
      button: {
        x: 1200,
        y: 318,
        w: 140,
        h: 64,
        label: '过关',
        requiresSwitch: 'main',
        offLabel: '先踩开关',
      },
      platform: { x: 1200, y: 360, w: 220, h: 26 },
    },
    {
      id: 15,
      name: '正式 ⑮ 终章·连环',
      winMode: 'jump',
      spawn: { x: 55, y: 410 },
      switches: [{ id: 'main', x: 355, surfaceY: 410, w: 88, h: 18 }],
      gap: { x: 478, w: 146 },
      gap2: { x: 808, w: 168 },
      bouncePads: [
        { x: 335, surfaceY: 410, w: 98, h: 20 },
        { x: 664, surfaceY: 410, w: 98, h: 20 },
      ],
      button: {
        x: 1270,
        y: 278,
        w: 140,
        h: 64,
        label: '过关',
        requiresSwitch: 'main',
        offLabel: '先踩开关',
      },
      platform: { x: 1270, y: 322, w: 240, h: 28 },
    },
  ],

  playMode: 'tutorial',
  tutorialDone: false,
  unlocked: 0,
  progress: {
    tutorial: { level: 0, unlocked: 0 },
    formal: { level: 0, unlocked: 0 },
  },

  state: {
    level: 0,
    won: false,
    input: { up: false, down: false, left: false, right: false },
    joystick: { active: false, x: 0, y: 0 },
    cat: null,
    t: 0,
    popText: null,
    switches: {},
    jumpBoost: 1,
  },

  init() {
    this.canvas = document.getElementById('quest-canvas');
    if (!this.canvas) throw new Error('找不到画布 #quest-canvas');
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) throw new Error('无法创建 2D 画布');
    this.load();
    this.resetLevel(false);
    this.bindInput();
    this.bindAction();
    this.bindModeTabs();
    this.syncModeTabs();
    this.renderLevelChips();
    window.addEventListener('resize', () => this.resize());
    this.resize();
    requestAnimationFrame(t => this.loop(t));
  },

  getLevels() {
    return this.playMode === 'formal' ? this.formalLevels : this.tutorialLevels;
  },

  applyModeProgress() {
    const p = this.progress[this.playMode];
    this.state.level = p.level;
    this.unlocked = p.unlocked;
  },

  stashModeProgress() {
    this.progress[this.playMode] = {
      level: this.state.level,
      unlocked: this.unlocked,
    };
  },

  setPlayMode(mode) {
    if (mode === 'formal' && !this.tutorialDone) return;
    if (mode === this.playMode) return;
    this.stashModeProgress();
    this.playMode = mode;
    this.applyModeProgress();
    this.save();
    this.syncModeTabs();
    this.resetLevel(false);
  },

  clampProgress(mode) {
    const max = (mode === 'formal' ? this.formalLevels : this.tutorialLevels).length - 1;
    const p = this.progress[mode];
    p.level = Math.min(max, Math.max(0, Number(p.level) || 0));
    p.unlocked = Math.min(max, Math.max(0, Number(p.unlocked) || 0));
  },

  load() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (typeof d.tutorialDone === 'boolean') this.tutorialDone = d.tutorialDone;
        if (d.progress?.tutorial) this.progress.tutorial = { ...this.progress.tutorial, ...d.progress.tutorial };
        if (d.progress?.formal) this.progress.formal = { ...this.progress.formal, ...d.progress.formal };
        if (typeof d.level === 'number' && !d.progress) {
          const maxT = this.tutorialLevels.length - 1;
          this.progress.tutorial.level = Math.min(maxT, Math.max(0, d.level));
          this.progress.tutorial.unlocked = Math.min(maxT, Math.max(0, d.unlocked ?? 0));
        }
        this.clampProgress('tutorial');
        this.clampProgress('formal');
        if (this.tutorialDone) {
          this.playMode = d.playMode === 'tutorial' ? 'tutorial' : 'formal';
        } else if (d.playMode === 'formal') {
          this.playMode = 'formal';
        }
        this.applyModeProgress();
      }
    } catch (e) { /* ignore */ }
  },

  save() {
    this.stashModeProgress();
    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify({
        tutorialDone: this.tutorialDone,
        playMode: this.playMode,
        progress: this.progress,
      }));
    } catch (e) { /* ignore */ }
  },

  bindModeTabs() {
    document.getElementById('tab-tutorial')?.addEventListener('click', () => this.setPlayMode('tutorial'));
    document.getElementById('tab-formal')?.addEventListener('click', () => this.setPlayMode('formal'));
  },

  syncModeTabs() {
    const tabs = document.getElementById('mode-tabs');
    if (!tabs) return;
    tabs.hidden = !this.tutorialDone;
    document.getElementById('tab-tutorial')?.classList.toggle('on', this.playMode === 'tutorial');
    document.getElementById('tab-formal')?.classList.toggle('on', this.playMode === 'formal');
  },

  isLevelUnlocked(index) {
    return index <= this.unlocked;
  },

  renderLevelChips() {
    const row = document.getElementById('level-chips');
    if (!row) return;
    row.innerHTML = '';
    this.getLevels().forEach((L, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'level-chip';
      const locked = !this.isLevelUnlocked(i);
      if (i === this.state.level) b.classList.add('on');
      if (locked) b.classList.add('locked');
      if (locked) {
        b.innerHTML = '<svg class="chip-lock-shadow" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3-9H9V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2z"/></svg>';
        b.setAttribute('aria-label', `第 ${i + 1} 关未解锁`);
      } else {
        b.textContent = String(i + 1);
        b.setAttribute('aria-label', L.name);
      }
      b.title = locked ? `第 ${i + 1} 关 · 先通第 ${i} 关` : L.name;
      b.addEventListener('click', () => {
        if (this.state.won) return;
        if (locked) {
          this.toast(i === 0 ? '从第一关开始玩吧' : `第 ${i + 1} 关还锁着 · 先通第 ${i} 关`, 2600);
          return;
        }
        this.state.level = i;
        this.save();
        this.resetLevel(false);
        this.renderLevelChips();
      });
      row.appendChild(b);
    });
  },

  levelDef() {
    const lv = this.getLevels();
    return lv[this.state.level] || lv[0];
  },

  levelGaps(L) {
    L = L || this.levelDef();
    const out = [];
    if (L.gap) out.push(L.gap);
    if (L.gap2) out.push(L.gap2);
    return out;
  },

  resetLevel(showHint) {
    const L = this.levelDef();
    this.state.won = false;
    this.state.popText = null;
    this.state.switches = {};
    this.state.jumpBoost = 1;
    this.state.cat = {
      wx: L.spawn.x,
      wy: L.spawn.y,
      facing: 1,
      walkPhase: 0,
      moving: false,
      happy: true,
      blink: 0,
      act: null,
      actT: 0,
      actDur: 0,
    };
    ValleyCam.x = L.spawn.x;
    ValleyCam.y = L.spawn.y;
    document.getElementById('win-overlay').hidden = true;
    const lv = this.getLevels();
    const modeLabel = this.playMode === 'formal' ? '正式' : '教程';
    document.getElementById('level-pill').textContent = `${modeLabel} · ${L.name}（${this.state.level + 1}/${lv.length}）`;
    this.renderLevelChips();
    this.syncModeTabs();
    if (L.tutorialStart) this.toast(L.tutorialStart, 5200);
    else if (showHint) this.toast('已回到本关起点');
  },

  resize() {
    const stage = document.getElementById('game-stage');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.viewW = w;
    this.viewH = h;
  },

  bindInput() {
    const keyMap = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right',
    };
    window.addEventListener('keydown', e => {
      const k = keyMap[e.key];
      if (k) { this.state.input[k] = true; e.preventDefault(); }
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        this.playAction('jump');
      }
    });
    window.addEventListener('keyup', e => {
      const k = keyMap[e.key];
      if (k) { this.state.input[k] = false; e.preventDefault(); }
    });

    const base = document.getElementById('joystick-base');
    const knob = document.getElementById('joystick-knob');
    let joyId = null;
    let cx = 0;
    let cy = 0;
    const maxR = () => base.clientWidth * 0.36;

    const setJoy = (nx, ny) => {
      const dead = 0.12;
      this.state.joystick.active = nx * nx + ny * ny > dead * dead;
      this.state.joystick.x = Math.abs(nx) > dead ? nx : 0;
      this.state.joystick.y = Math.abs(ny) > dead ? ny : 0;
      knob.style.transform = `translate(${nx * maxR()}px, ${ny * maxR()}px)`;
    };

    const onStart = e => {
      if (joyId != null) return;
      const pt = e.touches ? e.touches[0] : e;
      joyId = pt.identifier ?? 'mouse';
      const r = base.getBoundingClientRect();
      cx = r.left + r.width / 2;
      cy = r.top + r.height / 2;
      e.preventDefault();
    };

    const onMove = e => {
      if (joyId == null) return;
      const pts = e.touches ? [...e.touches] : [{ identifier: 'mouse', clientX: e.clientX, clientY: e.clientY }];
      const pt = pts.find(p => (p.identifier ?? 'mouse') === joyId);
      if (!pt) return;
      const dx = pt.clientX - cx;
      const dy = pt.clientY - cy;
      const len = Math.hypot(dx, dy) || 1;
      const cap = maxR();
      const nx = (dx / len) * Math.min(len, cap) / cap;
      const ny = (dy / len) * Math.min(len, cap) / cap;
      setJoy(nx, ny);
      e.preventDefault();
    };

    const onEnd = () => {
      joyId = null;
      setJoy(0, 0);
    };

    base.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    base.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);

  },

  bindAction() {
    document.getElementById('btn-jump')?.addEventListener('click', () => this.playAction('jump'));
    document.getElementById('btn-replay').addEventListener('click', () => this.resetLevel(true));
    document.getElementById('btn-next').addEventListener('click', () => {
      const nextBtn = document.getElementById('btn-next');
      document.getElementById('win-overlay').hidden = true;
      const max = this.getLevels().length - 1;
      const startFormal = nextBtn?.dataset.action === 'start-formal'
        || (this.playMode === 'tutorial' && this.state.level >= this.tutorialLevels.length - 1
          && nextBtn?.textContent === '开始正式玩');
      if (startFormal) {
        this.stashModeProgress();
        this.tutorialDone = true;
        this.playMode = 'formal';
        this.applyModeProgress();
        this.state.won = false;
        this.save();
        this.syncModeTabs();
        this.toast('教程完成 · 已进入正式关卡', 4200);
        this.resetLevel(false);
        return;
      }
      if (this.state.level < max) {
        this.state.level += 1;
        this.save();
        this.resetLevel(false);
      } else {
        this.state.won = false;
        this.resetLevel(false);
      }
    });
  },

  isJumpAirborne(c) {
    if (!c || c.act !== 'jump' || !c.actDur) return false;
    const p = c.actT / c.actDur;
    return p >= 0.12 && p <= 0.88;
  },

  jumpLiftY(c) {
    if (!this.isJumpAirborne(c)) return 0;
    const p = c.actT / c.actDur;
    const s = Math.sin(p * Math.PI);
    const boost = c.jumpBoost || 1;
    return s * 52 * 2 * 0.58 * boost;
  },

  surfaceY(item) {
    return item.surfaceY != null ? item.surfaceY : this.WALK_Y;
  },

  feetOnFloorItem(c, item) {
    if (!c || !item) return false;
    const sy = this.surfaceY(item);
    const hw = item.w * 0.5 + 14;
    return Math.abs(c.wx - item.x) <= hw && Math.abs(c.wy - sy) <= 24;
  },

  isOnBouncePad(c) {
    const pads = this.levelDef().bouncePads;
    if (!pads || !c) return false;
    return pads.some(p => this.feetOnFloorItem(c, p));
  },

  applySwitches(c) {
    const list = this.levelDef().switches;
    if (!list || !c) return;
    for (const sw of list) {
      if (this.feetOnFloorItem(c, sw)) this.state.switches[sw.id] = true;
    }
  },

  buttonActive(b) {
    if (!b?.requiresSwitch) return true;
    return !!this.state.switches[b.requiresSwitch];
  },

  applyGapPhysics(c) {
    if (!c) return;
    const L = this.levelDef();
    for (const gap of this.levelGaps(L)) {
      const left = gap.x - gap.w * 0.5;
      const right = gap.x + gap.w * 0.5;
      const inGap = c.wx > left && c.wx < right;
      if (!inGap) continue;
      if (this.isJumpAirborne(c)) return;
      const push = c.wx < gap.x ? left - 8 : right + 8;
      c.wx = push;
      c.wy = this.WALK_Y;
      if (!this._gapToastT || this.state.t - this._gapToastT > 1.2) {
        this._gapToastT = this.state.t;
        if (L.tutorialGap) this.toast(L.tutorialGap, 3200);
      }
      return;
    }
  },

  maybeTutorialJumpHint() {
    const L = this.levelDef();
    if (L.winMode !== 'jump' || this.state.won) return;
    const c = this.state.cat;
    const b = L.button;
    if (Math.abs(c.wx - b.x) > 130) return;
    if (this.isJumpAirborne(c)) return;
    if (this._jumpHintT && this.state.t - this._jumpHintT < 2.2) return;
    this._jumpHintT = this.state.t;
    if (L.tutorialJump) this.toast(L.tutorialJump, 3200);
  },

  maybeTutorialSwitchHint() {
    const L = this.levelDef();
    if (!L.tutorialSwitch || this.state.won) return;
    const b = L.button;
    if (!b?.requiresSwitch || this.buttonActive(b)) return;
    const c = this.state.cat;
    if (Math.abs(c.wx - b.x) > 150) return;
    if (this._switchHintT && this.state.t - this._switchHintT < 2.4) return;
    this._switchHintT = this.state.t;
    this.toast(L.tutorialSwitch, 3200);
  },

  playAction(action) {
    if (this.state.won) return;
    const c = this.state.cat;
    if (!c) return;
    if (c.act && c.actT < c.actDur) return;
    if (action !== 'jump') return;
    const dur = 0.55;
    c.act = action;
    c.actT = 0;
    c.actDur = dur;
    if (action === 'jump') {
      const boosted = this.isOnBouncePad(c);
      c.jumpBoost = boosted ? 2 : 1;
      this.state.popText = {
        wx: c.wx,
        wy: c.wy - 48,
        t: 0,
        text: boosted ? '弹飞！' : '蹦！',
      };
    }
  },

  tickCatAction(dt) {
    const c = this.state.cat;
    if (!c?.act) return;
    c.actT += dt;
    if (c.actT >= c.actDur) {
      c.act = null;
      c.actT = 0;
      c.actDur = 0;
      c.jumpBoost = 1;
    }
    const pop = this.state.popText;
    if (pop) {
      pop.t += dt;
      if (pop.t > 0.7) this.state.popText = null;
    }
  },

  catHitsButton() {
    const L = this.levelDef();
    const c = this.state.cat;
    const b = L.button;
    if (!this.buttonActive(b)) return false;
    const catR = L.winMode === 'touch' ? 52 : 46;
    const left = b.x - b.w * 0.5;
    const right = b.x + b.w * 0.5;
    const top = b.y - b.h * 0.5;
    const bottom = b.y + b.h * 0.5;
    const hitY = L.winMode === 'jump' ? c.wy - this.jumpLiftY(c) : c.wy;
    const nx = Math.max(left, Math.min(c.wx, right));
    const ny = Math.max(top, Math.min(hitY, bottom));
    if (Math.hypot(c.wx - nx, hitY - ny) >= catR) return false;
    if (L.winMode === 'jump') return this.isJumpAirborne(c);
    return true;
  },

  winLevel() {
    if (this.state.won) return;
    this.state.won = true;
    this.state.cat.happy = true;
    this.state.cat.moving = false;
    const max = this.getLevels().length - 1;
    if (this.state.level >= this.unlocked && this.state.level < max) {
      this.unlocked = this.state.level + 1;
    }
    this.save();
    const L = this.levelDef();
    document.getElementById('win-title').textContent = `${L.name} 完成`;
    const nextBtn = document.getElementById('btn-next');
    if (this.playMode === 'tutorial' && this.state.level >= max) {
      document.getElementById('win-msg').textContent = '教程练完啦 · 点下面开始正式玩';
      nextBtn.textContent = '开始正式玩';
      nextBtn.dataset.action = 'start-formal';
    } else if (this.state.level < max) {
      document.getElementById('win-msg').textContent = this.playMode === 'tutorial'
        ? '做得好 · 点下一关继续教程'
        : '过关 · 点下一关';
      nextBtn.textContent = '下一关';
      nextBtn.dataset.action = 'next';
    } else {
      document.getElementById('win-msg').textContent = this.playMode === 'formal'
        ? '正式关卡都过啦，随时可重玩。'
        : '过关啦';
      nextBtn.textContent = '知道了';
      nextBtn.dataset.action = 'dismiss';
    }
    document.getElementById('win-overlay').hidden = false;
    this.renderLevelChips();
  },

  toast(msg, ms) {
    const el = document.getElementById('hint-toast');
    if (!el) return;
    el.hidden = false;
    el.textContent = msg;
    clearTimeout(this._toastT);
    const dur = ms || 2600;
    this._toastT = setTimeout(() => {
      el.hidden = true;
      el.textContent = '';
    }, dur);
  },

  moveCat(dt) {
    const c = this.state.cat;
    let dx = this.state.joystick.x;
    let dy = this.state.joystick.y;
    if (!dx && !dy) {
      if (this.state.input.up) dy -= 1;
      if (this.state.input.down) dy += 1;
      if (this.state.input.left) dx -= 1;
      if (this.state.input.right) dx += 1;
    }
    if (!dx && !dy) {
      c.moving = false;
      return;
    }
    const len = Math.hypot(dx, dy) || 1;
    let speed = 200;
    if (c.act === 'jump' && (c.jumpBoost || 1) >= 2) speed = 400;
    c.wx += (dx / len) * speed * dt;
    c.wy += (dy / len) * speed * dt;
    if (Math.abs(dx) > 0.05) c.facing = dx >= 0 ? 1 : -1;
    c.walkPhase += dt * 8;
    c.moving = true;
    const m = 80;
    c.wx = Math.max(m, Math.min(CatWorld.W - m, c.wx));
    c.wy = Math.max(m, Math.min(CatWorld.H - m, c.wy));
  },

  loop(now) {
    try {
      if (!this._last) this._last = now;
      const dt = Math.min(0.05, (now - this._last) / 1000);
      this._last = now;
      this.state.t += dt;

      this.tickCatAction(dt);
      if (!this.state.won) {
        this.moveCat(dt);
        this.applySwitches(this.state.cat);
        this.applyGapPhysics(this.state.cat);
        this.maybeTutorialJumpHint();
        this.maybeTutorialSwitchHint();
        ValleyCam.x += (this.state.cat.wx - ValleyCam.x) * Math.min(1, dt * 4);
        ValleyCam.y += (this.state.cat.wy - ValleyCam.y) * Math.min(1, dt * 4);
        if (this.catHitsButton()) this.winLevel();
      }

      this.draw();
    } catch (err) {
      questBootError('运行出错：' + (err && err.message ? err.message : err));
      console.error(err);
      return;
    }
    requestAnimationFrame(t => this.loop(t));
  },

  draw() {
    const ctx = this.ctx;
    const vw = this.viewW;
    const vh = this.viewH;
    const view = ValleyCam.viewRect(vw, vh, 80);
    ctx.fillStyle = '#a8d4a0';
    ctx.fillRect(0, 0, vw || 300, vh || 300);

    ctx.save();
    ctx.translate(vw * ValleyCam.anchorX, vh * ValleyCam.anchorY);
    ctx.scale(ValleyCam.zoom, ValleyCam.zoom);
    ctx.translate(-ValleyCam.x, -ValleyCam.y);

    const grd = ctx.createLinearGradient(0, view.top, 0, view.bottom);
    grd.addColorStop(0, '#b8dce8');
    grd.addColorStop(0.45, '#a8d4a0');
    grd.addColorStop(1, '#8fbc8f');
    ctx.fillStyle = grd;
    ctx.fillRect(view.left, view.top, view.right - view.left, view.bottom - view.top);

    ctx.fillStyle = 'rgba(90, 130, 90, 0.25)';
    for (let i = 0; i < 12; i++) {
      const gx = 180 + i * 110;
      ctx.beginPath();
      ctx.ellipse(gx, 520, 90, 36, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const L = this.levelDef();
    this.levelGaps(L).forEach(g => this.drawGap(ctx, g));
    if (L.platform) this.drawPlatform(ctx, L.platform);
    (L.bouncePads || []).forEach(p => this.drawBouncePad(ctx, p));
    (L.switches || []).forEach(sw => this.drawFloorSwitch(ctx, sw, !!this.state.switches[sw.id]));
    this.drawWorldButton(ctx, L.button, this.state.won, this.buttonActive(L.button));

    const c = this.state.cat;
    CatArt.drawCatWorld(ctx, c.wx, c.wy, 52, {
      skinId: 'default',
      hunger: 0.1,
      blink: 0,
      happy: c.happy,
      walkPhase: c.walkPhase,
      moving: c.moving,
      facing: c.facing,
      bob: Math.sin(this.state.t * 3) * 3,
      action: c.act,
      actionT: c.actT,
      actionDur: c.actDur,
    });

    const pop = this.state.popText;
    if (pop) {
      ctx.save();
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(230, 81, 0, ${1 - pop.t / 0.7})`;
      ctx.fillText(pop.text, pop.wx, pop.wy - pop.t * 28);
      ctx.restore();
    }

    ctx.restore();
  },

  drawGap(ctx, gap) {
    const left = gap.x - gap.w * 0.5;
    const top = this.GAP_LIP_Y;
    const depth = 100;
    ctx.save();
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(left, top, gap.w, depth);
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(left + 6, top + 8, gap.w - 12, depth - 16);
    ctx.fillStyle = 'rgba(120, 180, 220, 0.35)';
    ctx.fillRect(left + 20, top + 40, gap.w - 40, 24);
    ctx.restore();
  },

  drawPlatform(ctx, pl) {
    const x = pl.x - pl.w * 0.5;
    const y = pl.y - pl.h * 0.5;
    ctx.save();
    ctx.fillStyle = '#8d6e63';
    if (typeof CatArt._roundRect === 'function') {
      CatArt._roundRect(ctx, x, y, pl.w, pl.h, 8);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, pl.w, pl.h);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(x + 10, y + 4, pl.w - 20, 5);
    ctx.restore();
  },

  drawBouncePad(ctx, p) {
    const x = p.x - p.w * 0.5;
    const top = this.surfaceY(p);
    const bottom = this.GAP_LIP_Y;
    const h = Math.max(p.h || 16, bottom - top);
    const pulse = 0.85 + Math.sin(this.state.t * 6) * 0.08;
    ctx.save();
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(x - 6, top + 2, p.w + 12, bottom - top + 4);
    ctx.fillStyle = '#ff9800';
    if (typeof CatArt._roundRect === 'function') {
      CatArt._roundRect(ctx, x, top, p.w, h, 8);
      ctx.fill();
    } else {
      ctx.fillRect(x, top, p.w, h);
    }
    ctx.fillStyle = `rgba(255, 235, 180, ${pulse})`;
    ctx.fillRect(x + 8, top + 4, p.w - 16, 6);
    ctx.fillStyle = '#558b2f';
    ctx.fillRect(x - 8, top - 3, p.w + 16, 5);
    ctx.fillStyle = '#bf360c';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('蹦弹垫', p.x, top + h * 0.42);
    ctx.restore();
  },

  drawFloorSwitch(ctx, sw, on) {
    const x = sw.x - sw.w * 0.5;
    const top = this.surfaceY(sw);
    const y = top;
    const h = sw.h || 16;
    ctx.save();
    ctx.fillStyle = '#558b2f';
    ctx.fillRect(x - 4, top - 3, sw.w + 8, 4);
    if (typeof CatArt._roundRect === 'function') {
      CatArt._roundRect(ctx, x, y, sw.w, h, 8);
      ctx.fillStyle = on ? '#7e57c2' : '#9575cd';
      ctx.fill();
    } else {
      ctx.fillStyle = on ? '#7e57c2' : '#9575cd';
      ctx.fillRect(x, y, sw.w, h);
    }
    ctx.fillStyle = on ? '#fff59d' : 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(sw.x, top + h * 0.45 - (on ? 2 : 0), 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4527a0';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(on ? '开' : '踩', sw.x, top + h * 0.45);
    ctx.restore();
  },

  drawWorldButton(ctx, b, pressed, active) {
    const x = b.x - b.w * 0.5;
    const y = b.y - b.h * 0.5;
    const live = active !== false;
    ctx.save();
    if (typeof CatArt._roundRect === 'function') {
      ctx.fillStyle = pressed ? '#66bb6a' : (live ? '#ffc107' : '#bdbdbd');
      CatArt._roundRect(ctx, x, y, b.w, b.h, 14);
      ctx.fill();
      ctx.strokeStyle = live ? '#e65100' : '#757575';
      ctx.lineWidth = 4;
      ctx.stroke();
    } else {
      ctx.fillStyle = pressed ? '#66bb6a' : (live ? '#ffc107' : '#bdbdbd');
      ctx.fillRect(x, y, b.w, b.h);
    }
    ctx.fillStyle = live ? '#5d4037' : '#616161';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = live ? b.label : (b.offLabel || '未激活');
    ctx.fillText(label, b.x, b.y + (pressed ? 2 : 0));
    ctx.restore();
  },
};

function questBootError(msg) {
  let el = document.getElementById('quest-boot-error');
  if (!el) {
    el = document.createElement('div');
    el.id = 'quest-boot-error';
    el.setAttribute('role', 'alert');
    document.body.appendChild(el);
  }
  el.textContent = msg;
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    if (typeof ValleyCam === 'undefined' || typeof CatWorld === 'undefined') {
      throw new Error('世界模块未加载，请确认用文件夹打开整份 jieya，或刷新页面。');
    }
    if (typeof CatArt === 'undefined') {
      throw new Error('猫山谷绘制模块未加载，请从 jieya 文件夹打开本页并刷新。');
    }
    MiaoQuest.init();
  } catch (err) {
    questBootError(String(err && err.message ? err.message : err));
    console.error(err);
  }
});
