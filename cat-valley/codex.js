/**
 * 图鉴 — 去过哪、找到啥、穿过啥
 */
const CatCodex = {
  panel: null,

  BIOME_LABELS: {
    snow: '❄️ 雪谷',
    forest: '🌲 深林',
    leafwood: '🍂 落叶林',
    osmanthus: '🌼 桂花林',
    desert: '🏜️ 暖沙',
    meadow: '🌾 草原',
  },

  init() {
    this.panel = document.getElementById('codex-panel');
    document.getElementById('btn-codex')?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle(true);
    });
    document.getElementById('codex-close')?.addEventListener('click', () => this.toggle(false));
    this.panel?.addEventListener('click', e => {
      if (e.target === this.panel) this.toggle(false);
    });
  },

  isOpen() {
    return this.panel && !this.panel.hidden;
  },

  toggle(open) {
    if (!this.panel) return;
    const show = open ?? this.panel.hidden;
    this.panel.hidden = !show;
    this.panel.setAttribute('aria-hidden', show ? 'false' : 'true');
    if (show) this.render();
  },

  sync(state) {
    if (this.isOpen()) this.render();
  },

  render() {
    const list = document.getElementById('codex-list');
    if (!list || typeof state === 'undefined') return;
    const biomes = state.visitedBiomes || [];
    const biomeRows = Object.keys(this.BIOME_LABELS).map(id => {
      const ok = biomes.includes(id);
      return `<li class="${ok ? 'done' : ''}">${this.BIOME_LABELS[id]} ${ok ? '✓' : '—'}</li>`;
    }).join('');

    const treasureN = CatTreasure ? CatTreasure.foundCount(state) : 0;
    const treasureTotal = CatTreasure ? CatTreasure.totalCount() : 0;
    const skinN = (state.unlockedSkins || []).length;
    const sSkins = (state.unlockedSkins || []).filter(id => {
      const s = CatSkins.get(id);
      return s.seasonOnly || s.tier === 'S';
    }).length;

    list.innerHTML = `
      <section class="codex-section">
        <h4>🗺 去过的地方</h4>
        <ul class="codex-ul">${biomeRows}</ul>
      </section>
      <section class="codex-section">
        <h4>🎡 游乐园</h4>
        <p class="codex-line ${state.paradiseFound ? 'done' : ''}">${state.paradiseFound ? '✓ 去过妙脆角猫游乐园' : '— 还没去过'}</p>
      </section>
      <section class="codex-section">
        <h4>📦 寻宝屋</h4>
        <p class="codex-line ${state.treasureRoomFound ? 'done' : ''}">${state.treasureRoomFound ? '✓ 去过妙脆角猫寻宝屋' : '— 还没去过'}</p>
        <p class="codex-line">木箱 ${treasureN} / ${treasureTotal}</p>
      </section>
      <section class="codex-section">
        <h4>🚪 秘密通道</h4>
        <p class="codex-line ${state.secretGateFound ? 'done' : ''}">${state.secretGateFound ? '✓ 发现深林秘密通道' : '— 进深林后看屏幕紫色箭头'}</p>
        <p class="codex-line">入口：深林西北 · 大绿山后 · 淡蓝圆门</p>
        <p class="codex-line ${state.secretRoomFound ? 'done' : ''}">${state.secretRoomFound ? '✓ 进过秘密小室' : '— 还没进去'}</p>
        <p class="codex-line">光球 ${CatSecret ? CatSecret.orbCount(state) : 0} / ${CatSecret ? CatSecret.orbTotal() : 0}</p>
      </section>
      <section class="codex-section">
        <h4>👕 皮肤</h4>
        <p class="codex-line">${skinN} 款 · 其中 S 级 ${sSkins} 款</p>
      </section>
      <section class="codex-section">
        <h4>🍽 喂养</h4>
        <p class="codex-line">累计喂 ${state.totalFed || 0} 次</p>
      </section>
      <section class="codex-section">
        <h4>⛺ 休息</h4>
        <p class="codex-line">歇脚 ${state.restVisits || 0} 次</p>
      </section>
    `;
  },
};
