/**
 * 脆果厨房 — 按订单摆盘 · 无倒计时
 */
const Kitchen = {
  SAVE_KEY: 'cuiguo_kitchen_v1',

  ING: {
    bread: { name: '小面包' },
    berry: { name: '野果' },
    cuicui: { name: '脆脆角' },
    date: { name: '干枣' },
    cone: { name: '松果' },
    clover: { name: '三叶草' },
  },

  LEVELS: [
    { id: 0, name: '饥饿幼崽', items: ['bread'], hint: '先上一块小面包', coins: 5 },
    { id: 1, name: '野果面包', items: ['bread', 'berry'], hint: '面包上配野果', coins: 8 },
    { id: 2, name: '脆角套餐', items: ['bread', 'cuicui'], hint: '三角脆脆角，三角各有一个椭圆口', coins: 10 },
    { id: 3, name: '野果双拼', items: ['berry', 'berry'], hint: '两串野果', coins: 8 },
    { id: 4, name: '暖沙小食', items: ['date', 'bread'], hint: '干枣配面包', coins: 10 },
    { id: 5, name: '深林味', items: ['cone', 'berry'], hint: '松果和野果', coins: 11 },
    { id: 6, name: '草原幸运', items: ['clover', 'bread'], hint: '三叶草加面包', coins: 12 },
    { id: 7, name: '山谷全家桶', items: ['bread', 'berry', 'cuicui'], hint: '三样都要', coins: 18 },
    { id: 8, name: '脆果大满贯', items: ['cuicui', 'berry', 'date'], hint: '不用面包也行', coins: 16 },
    { id: 9, name: '厨师长考验', items: ['bread', 'clover', 'cone'], hint: '三种特产一次齐', coins: 20 },
  ],

  state: {
    level: 0,
    maxLevel: 0,
    coins: 0,
    plate: [],
    totalServed: 0,
  },

  init() {
    this.load();
    const titleRow = document.querySelector('.k-title-row');
    if (titleRow && !titleRow.querySelector('.k-logo-icon')) {
      titleRow.insertBefore(KitchenIcon.logo(), titleRow.querySelector('.k-title-text'));
    }
    this.buildPantry();
    this.bind();
    this.render();
  },

  buildPantry() {
    const pantry = document.querySelector('.k-pantry');
    if (!pantry || pantry.dataset.built) return;
    pantry.dataset.built = '1';
    pantry.innerHTML = '';
    Object.keys(this.ING).forEach(id => {
      const ing = this.ING[id];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'k-ing-btn';
      btn.dataset.ing = id;
      btn.appendChild(KitchenIcon.create(id, 'lg'));
      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = ing.name;
      btn.appendChild(name);
      pantry.appendChild(btn);
    });
  },

  load() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (typeof d.level === 'number') this.state.level = Math.min(d.level, this.LEVELS.length - 1);
      if (typeof d.maxLevel === 'number') this.state.maxLevel = d.maxLevel;
      if (typeof d.coins === 'number') this.state.coins = d.coins;
      if (typeof d.totalServed === 'number') this.state.totalServed = d.totalServed;
    } catch (_) {}
  },

  save() {
    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify({
        level: this.state.level,
        maxLevel: this.state.maxLevel,
        coins: this.state.coins,
        totalServed: this.state.totalServed,
      }));
    } catch (_) {}
  },

  currentLevel() {
    return this.LEVELS[this.state.level] || this.LEVELS[0];
  },

  bind() {
    document.querySelectorAll('.k-ing-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.ing;
        if (id) this.addIngredient(id);
      });
    });
    document.getElementById('btn-clear')?.addEventListener('click', () => this.clearPlate());
    document.getElementById('btn-serve')?.addEventListener('click', () => this.serve());
    document.getElementById('btn-next')?.addEventListener('click', () => this.closeWin(true));
    document.getElementById('btn-stay')?.addEventListener('click', () => this.closeWin(false));
    document.getElementById('level-chips')?.addEventListener('click', e => {
      const chip = e.target.closest('.k-lv-chip');
      if (!chip) return;
      const lv = Number(chip.dataset.level);
      if (Number.isNaN(lv) || lv > this.state.maxLevel) return;
      this.state.level = lv;
      this.clearPlate(false);
      this.render();
      this.save();
    });
  },

  addIngredient(id) {
    const lv = this.currentLevel();
    if (this.state.plate.length >= lv.items.length) {
      this.toast('盘子满了，先上菜或清空');
      return;
    }
    if (!this.ING[id]) return;
    this.state.plate.push(id);
    this.render();
  },

  clearPlate(saveAfter = true) {
    this.state.plate = [];
    this.render();
    if (saveAfter) this.save();
  },

  sortedKey(arr) {
    return [...arr].sort().join(',');
  },

  serve() {
    const lv = this.currentLevel();
    if (this.state.plate.length !== lv.items.length) {
      this.toast(`还要放 ${lv.items.length - this.state.plate.length} 样`);
      return;
    }
    const want = this.sortedKey(lv.items);
    const got = this.sortedKey(this.state.plate);
    if (want !== got) {
      this.toast('不对哦，对照订单再试试');
      return;
    }
    this.state.coins += lv.coins;
    this.state.totalServed += 1;
    if (this.state.level >= this.state.maxLevel && this.state.level < this.LEVELS.length - 1) {
      this.state.maxLevel = this.state.level + 1;
    }
    this.showWin(lv);
    this.clearPlate(false);
    this.save();
    this.render();
  },

  showWin(lv) {
    const overlay = document.getElementById('win-overlay');
    const title = document.getElementById('win-title');
    const msg = document.getElementById('win-msg');
    if (title) title.textContent = `${lv.name} · 完成`;
    if (msg) msg.textContent = `+${lv.coins} 厨房币 · 累计 ${this.state.coins} 币`;
    if (overlay) overlay.hidden = false;
  },

  closeWin(advance) {
    const overlay = document.getElementById('win-overlay');
    if (overlay) overlay.hidden = true;
    if (advance && this.state.level < this.LEVELS.length - 1) {
      this.state.level += 1;
      this.toast('下一关');
      this.save();
      this.render();
    }
  },

  toast(msg) {
    const el = document.getElementById('k-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => el.classList.remove('show'), 2200);
  },

  render() {
    const lv = this.currentLevel();
    const orderName = document.getElementById('order-name');
    const orderWant = document.getElementById('order-want');
    const orderHint = document.getElementById('order-hint');
    const statCoins = document.getElementById('stat-coins');
    const statLevel = document.getElementById('stat-level');
    const statServed = document.getElementById('stat-served');

    if (orderName) orderName.textContent = `第 ${lv.id + 1} 关 · ${lv.name}`;
    if (orderHint) orderHint.textContent = lv.hint;
    if (orderWant) {
      orderWant.innerHTML = '';
      lv.items.forEach(key => {
        orderWant.appendChild(KitchenIcon.create(key));
      });
    }
    if (statCoins) statCoins.textContent = String(this.state.coins);
    if (statLevel) statLevel.textContent = `${this.state.level + 1} / ${this.LEVELS.length}`;
    if (statServed) statServed.textContent = String(this.state.totalServed);

    const plate = document.getElementById('plate-slots');
    if (plate) {
      plate.innerHTML = '';
      const slots = Math.max(3, lv.items.length);
      for (let i = 0; i < slots; i++) {
        const div = document.createElement('div');
        div.className = 'k-slot';
        const id = this.state.plate[i];
        if (id && this.ING[id]) {
          div.appendChild(KitchenIcon.create(id, 'lg'));
        } else if (i < lv.items.length) {
          div.classList.add('empty');
          div.textContent = '+';
        } else {
          div.classList.add('empty');
          div.textContent = '·';
          div.style.opacity = '0.35';
        }
        plate.appendChild(div);
      }
    }

    const serveBtn = document.getElementById('btn-serve');
    if (serveBtn) {
      serveBtn.disabled = this.state.plate.length === 0;
    }

    const chips = document.getElementById('level-chips');
    if (chips) {
      chips.innerHTML = '';
      this.LEVELS.forEach((L, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'k-lv-chip';
        b.dataset.level = String(i);
        b.textContent = `${i + 1}`;
        if (i < this.state.maxLevel) b.classList.add('done');
        if (i > this.state.maxLevel) b.classList.add('locked');
        if (i === this.state.level) b.classList.add('current');
        chips.appendChild(b);
      });
    }
  },
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Kitchen.init());
} else {
  Kitchen.init();
}
