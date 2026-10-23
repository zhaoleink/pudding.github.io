/**
 * 秘密通道 — 深林山后隐藏小房间 · 点门进入 · 小室内出口离开
 */
const CatSecret = {
  DISCOVER_RADIUS: 130,
  GATE_TAP_RADIUS: 95,
  EXIT_RADIUS: 100,
  ORB_PICK: 92,
  FIRST_COINS: 18,
  EXIT_COOLDOWN_MS: 1800,
  RETURN_PUSH: 28,

  tickWorld(state, cat, hooks) {
    if (state.secretMode || state.paradiseMode || state.treasureMode || !cat || cat.id !== state.selectedId) return;
    if (state.secretEnterBlockUntil && Date.now() < state.secretEnterBlockUntil) return;
    const gate = CatWorld.secretGate;
    if (!gate) return;
    const d = Math.hypot(cat.wx - gate.x, cat.wy - gate.y);
    if (d > this.DISCOVER_RADIUS) return;
    if (!state.secretGateFound) {
      state.secretGateFound = true;
      hooks.syncCodex();
      hooks.showToast('🚪 发现淡蓝圆门！走近点一下门就能进');
      hooks.save();
    }
    if (d <= this.GATE_TAP_RADIUS) {
      hooks.setCaption('🚪 秘密通道 · 点一下淡蓝圆门进入');
    }
  },

  hitGateAt(wx, wy) {
    const gate = CatWorld.secretGate;
    if (!gate) return false;
    return Math.hypot(wx - gate.x, wy - gate.y) <= gate.r * 0.95;
  },

  tickRoom(state, cat, hooks) {
    if (!state.secretMode || !cat || cat.id !== state.selectedId) return;
    const exit = CatWorld.secretRoomExit;
    if (exit) {
      const ed = Math.hypot(cat.wx - exit.x, cat.wy - exit.y);
      if (ed <= this.EXIT_RADIUS) {
        hooks.exitSecretMode();
        return;
      }
      if (ed <= this.EXIT_RADIUS * 2) {
        hooks.setCaption('🚪 出口在上方 · 走近淡蓝圆门离开');
      }
    }
    (CatWorld.secretOrbs || []).forEach(orb => {
      if ((state.secretOrbsFound || {})[orb.id]) return;
      const d = Math.hypot(cat.wx - orb.x, cat.wy - orb.y);
      if (d > this.ORB_PICK) return;
      if (!state.secretOrbsFound) state.secretOrbsFound = {};
      state.secretOrbsFound[orb.id] = true;
      hooks.addCoins(orb.coins || 10, `秘密光球 +${orb.coins || 10} 金币`);
      hooks.syncCodex();
      hooks.save();
    });
  },

  orbCount(state) {
    return Object.keys(state.secretOrbsFound || {}).length;
  },

  orbTotal() {
    return (CatWorld.secretOrbs || []).length;
  },

  returnPosForCat(c) {
    const gate = CatWorld.secretGate;
    if (!gate || !c) return { x: c.wx, y: c.wy };
    const dx = c.wx - gate.x;
    const dy = c.wy - gate.y;
    const d = Math.hypot(dx, dy) || 1;
    const push = gate.r + CatSecret.RETURN_PUSH;
    const ang = d > 8 ? Math.atan2(dy, dx) : Math.PI * 0.55;
    return {
      x: Math.max(CatWorld.margin, Math.min(CatWorld.W - CatWorld.margin, gate.x + Math.cos(ang) * push)),
      y: Math.max(CatWorld.margin, Math.min(CatWorld.H - CatWorld.margin, gate.y + Math.sin(ang) * push)),
    };
  },

  tickFollow(state, dt, helpers) {
    if (!state.inSecretRoom || !helpers) return;
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
