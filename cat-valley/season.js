/**
 * 猫山谷 · 谷季（每季 35–40 天）
 * 每季对应一款 S 级皮肤；未到季的 skin 可先占位命名。
 */
const ValleySeason = {
  /** 猫山谷谷季纪元 — 从 S1 起算（与泡季独立） */
  EPOCH_MS: new Date(2026, 8, 1).getTime(),
  MIN_DAYS: 35,
  MAX_DAYS: 40,

  /** 季名 · 图标 · 皮肤 id · 皮肤名（S 级） */
  DEFS: [
    { name: '雪绒季', icon: '❄️', skinId: 'yinjiao', skinName: '银角' },
    { name: '嫩叶季', icon: '🌿', skinId: 'naiwa', skinName: '奶蛙' },
    { name: '暖沙季', icon: '🏜️', skinId: 'daodun', skinName: '刀盾' },
    { name: '麦风季', icon: '🌾', skinId: 'feidudu', skinName: '肥嘟嘟' },
    { name: '溪光季', icon: '💧', skinId: 'xiguang', skinName: '溪光' },
    { name: '松雾季', icon: '🌲', skinId: 'songwu', skinName: '松雾' },
    { name: '落金季', icon: '🍂', skinId: 'luojin', skinName: '落金' },
    { name: '云爪季', icon: '☁️', skinId: 'yunzhao', skinName: '云爪' },
    { name: '霜耳季', icon: '🧊', skinId: 'shuanger', skinName: '霜耳' },
    { name: '琥珀季', icon: '🟠', skinId: 'hupo', skinName: '琥珀' },
    { name: '星坠季', icon: '⭐', skinId: 'xingzhui', skinName: '星坠' },
    { name: '竹影季', icon: '🎋', skinId: 'zhuying', skinName: '竹影' },
    { name: '晚霞季', icon: '🌇', skinId: 'wanxia', skinName: '晚霞' },
    { name: '琉璃季', icon: '💎', skinId: 'liuli', skinName: '琉璃' },
    { name: '晨露季', icon: '🌅', skinId: 'chenlu', skinName: '晨露' },
    { name: '暮雪季', icon: '🌙', skinId: 'muxue', skinName: '暮雪' },
    { name: '烟波季', icon: '🌫️', skinId: 'yanbo', skinName: '烟波' },
    { name: '花藤季', icon: '🌸', skinId: 'huateng', skinName: '花藤' },
    { name: '裂谷季', icon: '⛰️', skinId: 'liegu', skinName: '裂谷' },
    { name: '虹桥季', icon: '🌈', skinId: 'hongqiao', skinName: '虹桥' },
    { name: '静泉季', icon: '♨️', skinId: 'jingquan', skinName: '静泉' },
    { name: '脆角季', icon: '🔺', skinId: 'cuijiao', skinName: '脆角王' },
    { name: '深林季', icon: '🌳', skinId: 'shenlin', skinName: '深林客' },
    { name: '远丘季', icon: '🏔️', skinId: 'yuanqiu', skinName: '远丘行' },
  ],

  _hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  },

  lengthDays(seasonIndex) {
    const span = this.MAX_DAYS - this.MIN_DAYS + 1;
    return this.MIN_DAYS + (this._hash(`valley_season_len_${seasonIndex}`) % span);
  },

  windowFor(seasonIndex) {
    let start = this.EPOCH_MS;
    for (let i = 0; i < seasonIndex; i++) {
      start += this.lengthDays(i) * 86400000;
    }
    const lengthDays = this.lengthDays(seasonIndex);
    return { index: seasonIndex, start, end: start + lengthDays * 86400000, lengthDays };
  },

  current(now = Date.now()) {
    let idx = 0;
    while (idx < 500) {
      const win = this.windowFor(idx);
      if (now < win.end) return win;
      idx++;
    }
    return this.windowFor(0);
  },

  defFor(seasonIndex) {
    const n = this.DEFS.length;
    const i = ((seasonIndex % n) + n) % n;
    return this.DEFS[i];
  },

  badgeFor(seasonIndex) {
    const d = this.defFor(seasonIndex);
    const skin = CatSkins.get(d.skinId);
    return {
      icon: d.icon,
      name: d.name,
      skinId: d.skinId,
      skinName: d.skinName || skin.name,
      seasonNo: seasonIndex + 1,
      rankLabel: `S${seasonIndex + 1}`,
    };
  },

  sync(state) {
    const info = this.current();
    const def = this.defFor(info.index);
    const prev = typeof state.seasonIndex === 'number' ? state.seasonIndex : -1;
    const changed = prev >= 0 && prev !== info.index;
    state.seasonIndex = info.index;

    let skinNewlyUnlocked = false;
    if (!state.unlockedSkins.includes(def.skinId)) {
      state.unlockedSkins.push(def.skinId);
      skinNewlyUnlocked = true;
    }

    return { info, def, changed, skinNewlyUnlocked, isFirst: prev < 0 };
  },

  updateBadge(seasonIndex) {
    const b = this.badgeFor(seasonIndex);
    const iconEl = document.getElementById('valley-season-icon');
    const rankEl = document.getElementById('valley-season-rank');
    const nameEl = document.getElementById('valley-season-name');
    const skinEl = document.getElementById('valley-season-skin');
    const badge = document.getElementById('valley-season-badge');
    if (iconEl) iconEl.textContent = b.icon;
    if (rankEl) rankEl.textContent = b.rankLabel;
    if (nameEl) nameEl.textContent = b.name;
    if (skinEl) skinEl.textContent = `本季 · ${b.skinName}`;
    if (badge) {
      badge.title = `${b.rankLabel} · ${b.name} · 本季 S「${b.skinName}」· 点我打开背包皮肤`;
      badge.dataset.skinId = b.skinId;
    }
  },
};
