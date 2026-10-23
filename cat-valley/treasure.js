/**
 * 妙脆角猫寻宝屋 — 独立房间，按钮进入（同游乐园）
 */
const CatTreasure = {
  PICK_RADIUS: 105,
  FIRST_COINS: 12,

  totalCount() {
    return (CatWorld.treasureChests || []).length;
  },

  foundCount(state) {
    return Object.keys(state.treasuresFound || {}).length;
  },

  isFound(state, id) {
    return !!(state.treasuresFound && state.treasuresFound[id]);
  },

  inZone(wx, wy) {
    return CatWorld.inCatTreasureRoom(wx, wy);
  },

  tick(state, cat, dt, hooks) {
    if (!state.treasureMode || !cat || cat.id !== state.selectedId) return;
    if (!this.inZone(cat.wx, cat.wy)) return;
    (CatWorld.treasureChests || []).forEach(chest => {
      if (this.isFound(state, chest.id)) return;
      const d = Math.hypot(cat.wx - chest.x, cat.wy - chest.y);
      if (d > this.PICK_RADIUS) return;
      this.collect(state, chest, hooks);
    });
  },

  collect(state, chest, hooks) {
    if (!chest || this.isFound(state, chest.id)) return;
    if (!state.treasuresFound) state.treasuresFound = {};
    state.treasuresFound[chest.id] = true;
    hooks.addCoins(chest.coins || 8, `找到木箱！+${chest.coins || 8} 金币`);
    hooks.syncCodex();
    const left = this.totalCount() - this.foundCount(state);
    if (left <= 0) {
      hooks.showToast('🎉 寻宝屋的木箱全找齐啦！');
      hooks.setCaption('寻宝完成 · 图鉴里可查看 · 点左上角返回山谷');
    } else {
      hooks.setCaption(`📦 寻宝屋 · 还剩 ${left} 个木箱`);
    }
    hooks.updateTreasureButton?.();
    hooks.save();
  },

  hitChestAt(wx, wy, state) {
    if (!state.treasureMode) return null;
    let best = null;
    let bestD = Infinity;
    (CatWorld.treasureChests || []).forEach(c => {
      if (this.isFound(state, c.id)) return;
      const d = Math.hypot(wx - c.x, wy - c.y);
      if (d < 48 && d < bestD) {
        bestD = d;
        best = c;
      }
    });
    return best;
  },

  tickFollow(state, dt, helpers) {
    if (!state.inTreasureRoom || !helpers) return;
    const lead = state.cats.find(c => c.id === state.selectedId);
    const follow = state.cats.find(c => c.id !== state.selectedId);
    if (!lead || !follow) return;
    const dx = lead.wx - follow.wx;
    const dy = lead.wy - follow.wy;
    const d = Math.hypot(dx, dy);
    const gap = 78;
    if (d <= gap) {
      follow.moving = false;
      follow.vx = 0;
      follow.vy = 0;
      return;
    }
    const speed = 150;
    const step = Math.min(d - gap, speed * dt);
    follow.wx += (dx / d) * step;
    follow.wy += (dy / d) * step;
    follow.facing = dx >= 0 ? 1 : -1;
    follow.moving = step > 1.5;
    follow.walkPhase += dt * 7;
    helpers.clampCat(follow);
    follow.onMountain = false;
    follow.mountainElevation = 0;
    helpers.tickCatHunger(follow, step, dt);
  },
};
