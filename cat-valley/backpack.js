/**
 * 皮肤背包 — 查看已抽到的皮肤并给当前猫穿戴
 */
const CatBackpack = {
  panel: null,
  grid: null,

  init() {
    this.panel = document.getElementById('backpack-panel');
    this.grid = document.getElementById('bp-grid');
    document.getElementById('btn-bag')?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle(true);
    });
    document.getElementById('btn-skins')?.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      this.openSkins(true);
    });
    document.getElementById('bp-close')?.addEventListener('click', () => this.toggle(false));
    this.panel?.addEventListener('click', e => {
      if (e.target === this.panel) this.toggle(false);
    });
    const inner = this.panel?.querySelector('.bp-inner');
    const stopTouchBubble = e => e.stopPropagation();
    this.panel?.addEventListener('touchstart', stopTouchBubble, { passive: true });
    this.panel?.addEventListener('touchmove', stopTouchBubble, { passive: true });
    inner?.addEventListener('touchstart', stopTouchBubble, { passive: true });
    inner?.addEventListener('touchmove', stopTouchBubble, { passive: true });
    const pickBtn = document.getElementById('btn-pick-berry');
    if (pickBtn && !pickBtn.dataset.bound) {
      pickBtn.dataset.bound = '1';
      pickBtn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        tryPickBerry();
      });
    }
  },

  isOpen() {
    return this.panel && !this.panel.hidden;
  },

  toggle(open) {
    if (!this.panel) return;
    const show = open ?? this.panel.hidden;
    this.panel.hidden = !show;
    this.panel.setAttribute('aria-hidden', show ? 'false' : 'true');
    if (show) {
      if (typeof updateForagePickState === 'function') updateForagePickState();
      this.render();
    }
  },

  openSkins(open = true) {
    this.toggle(open);
    requestAnimationFrame(() => {
      document.getElementById('bp-grid')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  },

  renderSeasonBlock() {
    const block = document.getElementById('bp-season-block');
    if (!block || typeof ValleySeason === 'undefined' || typeof state === 'undefined') return;
    const idx = typeof state.seasonIndex === 'number' ? state.seasonIndex : ValleySeason.current().index;
    const def = ValleySeason.defFor(idx);
    const skin = CatSkins.get(def.skinId);
    const unlocked = state.unlockedSkins.includes(def.skinId);
    block.hidden = false;
    const title = document.getElementById('bp-season-title');
    const desc = document.getElementById('bp-season-desc');
    const wear = document.getElementById('btn-equip-season-skin');
    if (title) title.textContent = `${def.icon} S${idx + 1} · ${skin.name}`;
    if (desc) {
      desc.textContent = unlocked
        ? `${def.name}谷季 S 级 · 在下方皮肤格点选即可穿戴`
        : `${def.name} · 进入对应谷季后自动解锁（与扭蛋池无关）`;
    }
    if (wear) wear.hidden = true;
    const cv = document.getElementById('bp-season-preview');
    if (cv) {
      const cctx = cv.getContext('2d');
      if (cctx) {
        cctx.clearRect(0, 0, cv.width, cv.height);
        CatArt.drawSkinPreview(cctx, 44, 46, 1.05, def.skinId, 1, 1);
      }
    }
  },

  render() {
    if (!this.grid || typeof state === 'undefined') return;
    if (typeof updateForagePickState === 'function') updateForagePickState();
    if (typeof updateBackpackStash === 'function') updateBackpackStash();
    const cat = selectedCat();
    const hint = document.getElementById('bp-cat-hint');
    if (hint && cat) {
      hint.textContent = `🎰 扭蛋抽新皮肤 · 点卡片给${cat.label}穿戴`;
    }
    this.renderSeasonBlock();

    this.grid.innerHTML = '';
    const ids = [...state.unlockedSkins];
    if (!ids.includes('default')) ids.unshift('default');
    ids.sort((a, b) => {
      const sa = CatSkins.get(a);
      const sb = CatSkins.get(b);
      if (sa.seasonOnly !== sb.seasonOnly) return sa.seasonOnly ? -1 : 1;
      return sa.name.localeCompare(sb.name, 'zh-CN');
    });

    ids.forEach(id => {
      const skin = CatSkins.get(id);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bp-item' + (cat && cat.skinId === id ? ' equipped' : '');
      btn.dataset.skin = id;

      const cv = document.createElement('canvas');
      cv.width = 72;
      cv.height = 72;
      cv.className = 'bp-thumb';
      const cctx = cv.getContext('2d');
      if (cctx) CatArt.drawSkinPreview(cctx, 36, 38, 0.82, id, 1, 1);

      const label = document.createElement('span');
      label.className = 'bp-name';
      label.textContent = skin.name;

      if (skin.seasonOnly) {
        const tier = document.createElement('em');
        tier.className = 'bp-tier-s';
        tier.textContent = 'S';
        btn.appendChild(tier);
      }

      if (cat && cat.skinId === id) {
        const tag = document.createElement('em');
        tag.className = 'bp-tag';
        tag.textContent = '穿着';
        btn.appendChild(tag);
      }

      btn.appendChild(cv);
      btn.appendChild(label);
      btn.addEventListener('click', () => equipSkin(id));
      this.grid.appendChild(btn);
    });
  },
};
