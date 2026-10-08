/** 6×16 合成台格子（挂到 MarbleGame） */
Object.assign(MarbleGame, {
  GRID_COLS: 16,
  GRID_ROWS: 6,
  CRAFT_SAVE_KEY: 'marble_craft_grid_v1',

  craftCells: [],
  craftDragFrom: null,
  craftSelectedIndex: null,

  CRAFT_CELL_KINDS: ['pink', 'blue', 'purple', 'green', 'white', 'black'],

  normalizeCraftKind(c) {
    if (c === 'child') return 'purple';
    return this.CRAFT_CELL_KINDS.includes(c) ? c : null;
  },

  mergeToastFor(kind) {
    const msg = {
      blue: '合成蓝球！',
      purple: '合成紫球！',
      green: '合成绿球！',
      white: '合成白球！',
      black: '合成黑球！',
    };
    return msg[kind] || '合成成功！';
  },

  gridSize() {
    return this.GRID_COLS * this.GRID_ROWS;
  },

  initCraftGrid() {
    this.loadCraftGrid();
    const root = document.getElementById('craft-grid');
    if (!root) return;
    root.innerHTML = '';
    for (let i = 0; i < this.gridSize(); i++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'craft-cell';
      cell.dataset.index = String(i);
      cell.setAttribute('aria-label', `格子 ${i + 1}`);
      root.appendChild(cell);
    }
    this.renderCraftGrid();
    this.bindCraftInput();
    document.getElementById('btn-craft')?.addEventListener('click', () => this.openCraftPanel());
    document.getElementById('btn-craft-close')?.addEventListener('click', () => this.closeCraftPanel());
    document.getElementById('btn-claim-pink')?.addEventListener('click', () => this.claimPinkOnGrid());
    document.getElementById('btn-craft-use')?.addEventListener('click', () => this.useSelectedCraftBall());
    this.updateHud();
    this.updateCraftHud();
  },

  loadCraftGrid() {
    const empty = () => Array(this.gridSize()).fill(null);
    try {
      const raw = localStorage.getItem(this.CRAFT_SAVE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (Array.isArray(d.cells) && d.cells.length === this.gridSize()) {
          this.craftCells = d.cells.map(c => this.normalizeCraftKind(c));
        } else {
          this.craftCells = empty();
        }
        if (typeof d.coins === 'number' && d.coins >= 0) this.craftCoins = Math.floor(d.coins);
        let t = d.equippedPlayerTier;
        if (t === 'child') t = 'purple';
        if (t === 'pink' || this.CRAFT_USE_TIERS?.[t]) this.equippedPlayerTier = t;
      } else {
        this.craftCells = empty();
        try {
          const legacy = Number(localStorage.getItem('marble_craft_coins_v1'));
          if (Number.isFinite(legacy) && legacy >= 0) this.craftCoins = Math.floor(legacy);
        } catch (e2) { /* ignore */ }
      }
    } catch (e) {
      this.craftCells = empty();
    }
    if (!this.craftCells.length) this.craftCells = empty();
  },

  saveCraftGrid() {
    try {
      localStorage.setItem(this.CRAFT_SAVE_KEY, JSON.stringify({
        coins: this.craftCoins,
        cells: this.craftCells,
        equippedPlayerTier: this.equippedPlayerTier || 'pink',
      }));
    } catch (e) { /* ignore */ }
  },

  firstEmptyCell() {
    return this.craftCells.findIndex(c => c == null);
  },

  placePinkOnGrid() {
    const idx = this.firstEmptyCell();
    if (idx < 0) {
      this.toast('合成台格子满了，先合成或挪一挪');
      return false;
    }
    this.craftCells[idx] = 'pink';
    this.renderCraftGrid();
    this.saveCraftGrid();
    return true;
  },

  claimPinkOnGrid() {
    if (this.craftCoins < this.COIN_GOAL) {
      this.toast(`还差 ${this.COIN_GOAL - this.craftCoins} 合成币`);
      return;
    }
    if (!this.placePinkOnGrid()) return;
    this.craftCoins -= this.COIN_GOAL;
    this.saveCraftGrid();
    this.updateHud();
    this.updateCraftHud();
    this.toast('粉球已入格 · 拖到另一颗粉球合成蓝球');
  },

  tryAutoGrantPink() {
    while (this.craftCoins >= this.COIN_GOAL) {
      if (!this.placePinkOnGrid()) break;
      this.craftCoins -= this.COIN_GOAL;
      this.toast('满 100 合成币 · 粉球已放上合成台');
    }
    this.saveCraftGrid();
    this.updateHud();
    this.updateCraftHud();
  },

  mergeKind(a, b) {
    if (a === 'pink' && b === 'pink') return 'blue';
    if (a === 'blue' && b === 'blue') return 'purple';
    if (a === 'purple' && b === 'purple') return 'green';
    if (a === 'green' && b === 'green') return 'white';
    if (a === 'white' && b === 'white') return 'black';
    return null;
  },

  dropCraftCell(from, to) {
    if (from == null || to == null) return;
    if (from === to) {
      this.craftSelectedIndex = from;
      this.renderCraftGrid();
      this.updateCraftHud();
      return;
    }
    const a = this.craftCells[from];
    const b = this.craftCells[to];
    if (!a) return;

    if (b == null) {
      this.craftCells[to] = a;
      this.craftCells[from] = null;
    } else {
      const merged = this.mergeKind(a, b);
      if (merged) {
        this.craftCells[to] = merged;
        this.craftCells[from] = null;
        this.toast(this.mergeToastFor(merged));
        this.craftSelectedIndex = to;
      } else {
        this.craftCells[to] = a;
        this.craftCells[from] = b;
      }
    }
    this.renderCraftGrid();
    this.saveCraftGrid();
    this.updateHud();
    this.updateCraftHud();
  },

  renderCraftGrid() {
    const root = document.getElementById('craft-grid');
    if (!root) return;
    root.querySelectorAll('.craft-cell').forEach(cell => {
      const i = Number(cell.dataset.index);
      const kind = this.craftCells[i];
      cell.classList.toggle('has-marble', !!kind);
      cell.classList.toggle('selected', this.craftSelectedIndex === i);
      cell.dataset.kind = kind || '';
      cell.innerHTML = kind
        ? `<span class="cell-marble ${kind}" aria-hidden="true"></span>`
        : '';
    });
  },

  bindCraftInput() {
    const root = document.getElementById('craft-grid');
    if (!root) return;

    const cellFromEvent = e => {
      const t = e.target.closest('.craft-cell');
      return t ? Number(t.dataset.index) : null;
    };

    root.addEventListener('pointerdown', e => {
      const i = cellFromEvent(e);
      if (i == null || !this.craftCells[i]) return;
      this.craftDragFrom = i;
      root.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    root.addEventListener('pointerup', e => {
      if (this.craftDragFrom == null) return;
      let to = cellFromEvent(e);
      if (to == null && document.elementFromPoint) {
        const hit = document.elementFromPoint(e.clientX, e.clientY);
        const cell = hit && hit.closest && hit.closest('.craft-cell');
        if (cell && root.contains(cell)) to = Number(cell.dataset.index);
      }
      if (to != null) this.dropCraftCell(this.craftDragFrom, to);
      this.craftDragFrom = null;
      try { root.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      e.preventDefault();
    });

    root.addEventListener('pointercancel', () => {
      this.craftDragFrom = null;
    });
  },

  openCraftPanel() {
    const el = document.getElementById('craft-overlay');
    if (!el) return;
    el.hidden = false;
    this.updateCraftHud();
    this.renderCraftGrid();
  },

  closeCraftPanel() {
    const el = document.getElementById('craft-overlay');
    if (el) el.hidden = true;
    this.craftDragFrom = null;
    this.craftSelectedIndex = null;
  },

  useSelectedCraftBall() {
    const i = this.craftSelectedIndex;
    if (i == null) {
      this.toast('先点选格子里的一颗球');
      return;
    }
    const kind = this.craftCells[i];
    if (!kind) {
      this.toast('这一格是空的');
      return;
    }
    if (kind === 'pink') {
      this.toast('粉球只能在格子里合成，合成蓝球后再「使用」');
      return;
    }
    if (!this.CRAFT_USE_TIERS[kind]) return;

    this.craftCells[i] = null;
    this.craftSelectedIndex = null;
    this.renderCraftGrid();
    this.saveCraftGrid();
    this.updateHud();
    this.updateCraftHud();
    this.equipPlayerFromCraft(kind);
    this.closeCraftPanel();
  },

  updateCraftHud() {
    const c = document.getElementById('craft-coins');
    if (c) c.textContent = String(this.craftCoins);
    const btn = document.getElementById('btn-claim-pink');
    if (btn) btn.disabled = this.craftCoins < this.COIN_GOAL || this.firstEmptyCell() < 0;
    const useBtn = document.getElementById('btn-craft-use');
    const sel = document.getElementById('craft-selected-label');
    const kind = this.craftSelectedIndex != null ? this.craftCells[this.craftSelectedIndex] : null;
    const canUse = kind && kind !== 'pink' && !!this.CRAFT_USE_TIERS[kind];
    if (useBtn) useBtn.disabled = !canUse;
    if (sel) {
      const names = { pink: '粉球', blue: '蓝球', purple: '紫球', green: '绿球', white: '白球', black: '黑球' };
      sel.textContent = kind ? `已选：${names[kind] || kind}` : '已选：无（点格子选中）';
    }
  },
});
