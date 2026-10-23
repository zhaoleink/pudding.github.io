/**
 * 妙脆角猫乐园 — 蹦床 · 滑梯 · 旋转台 · 拍照墙
 */
const CatParadise = {
  FIRST_COINS: 15,
  _trampCd: {},
  _slideLock: {},
  _playToy: {},
  _lastCaption: '',

  inZone(wx, wy) {
    return CatWorld.inCatParadise(wx, wy);
  },

  hitToyAt(wx, wy) {
    let best = null;
    let bestD = Infinity;
    (CatWorld.catParadiseToys || []).forEach(toy => {
      let d = Infinity;
      if (toy.kind === 'tramp') {
        d = Math.hypot(wx - toy.x, wy - toy.y);
        if (d > toy.r * 0.85) return;
      } else if (toy.kind === 'spin') {
        d = Math.hypot(wx - toy.x, wy - toy.y);
        if (d > toy.r * 0.75) return;
      } else if (toy.kind === 'slide') {
        d = this._distToSlide(wx, wy, toy);
        if (d > toy.w * 0.65) return;
      } else if (toy.kind === 'photo') {
        if (Math.abs(wx - toy.x) > toy.w * 0.55 || Math.abs(wy - toy.y) > toy.h * 0.55) return;
        d = Math.hypot(wx - toy.x, wy - toy.y);
      } else if (toy.kind === 'sdisplay') {
        d = Math.hypot(wx - toy.x, wy - toy.y);
        if (d > toy.r * 0.95) return;
      }
      if (d < bestD) {
        bestD = d;
        best = toy;
      }
    });
    return best;
  },

  _distToSlide(wx, wy, toy) {
    const dx = toy.x2 - toy.x;
    const dy = toy.y2 - toy.y;
    const len2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((wx - toy.x) * dx + (wy - toy.y) * dy) / len2));
    const px = toy.x + dx * t;
    const py = toy.y + dy * t;
    return Math.hypot(wx - px, wy - py);
  },

  _slideDir(toy) {
    const dx = toy.x2 - toy.x;
    const dy = toy.y2 - toy.y;
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len, len };
  },

  onToyTap(toy, cat, hooks) {
    if (!toy || !cat) return;
    this._playToy[cat.id] = toy.id;
    if (toy.kind === 'photo') {
      hooks.setCaption('📸 妙脆角猫游乐园 · 点顶栏 📷 拍照');
      hooks.showToast('打卡墙 · 点 📷 拍照');
      return;
    }
    if (toy.kind === 'tramp') {
      hooks.showToast('蹦床 · 站上去会自动蹦跳');
      return;
    }
    if (toy.kind === 'spin') {
      hooks.showToast('站上去就会转圈圈～');
    }
    if (toy.kind === 'slide') {
      hooks.showToast('从彩色滑梯滑下去～');
    }
    if (toy.kind === 'sdisplay') {
      const skin = CatSkins.get(cat.skinId);
      if (skin.seasonOnly || skin.tier === 'S') {
        hooks.setCaption(`✨ S 展示台 · 正在展示「${skin.name}」`);
        hooks.showToast(`✨ ${skin.name} 站上展示台啦`);
      } else {
        hooks.showToast('换上 S 级季节皮肤再来展示～');
      }
    }
  },

  tick(state, cat, dt, hooks, input) {
    if (!state.paradiseMode || !cat || cat.id !== state.selectedId) return;
    input = input || { x: 0, y: 0 };
    const wantsMove = Math.hypot(input.x, input.y) > 0.12;
    const inside = this.inZone(cat.wx, cat.wy);
    state.inParadise = inside;

    if (!inside) {
      this._slideLock[cat.id] = false;
      this._playToy[cat.id] = null;
      return;
    }

    if (wantsMove) {
      this._slideLock[cat.id] = false;
      this._playToy[cat.id] = null;
      return;
    }

    (CatWorld.catParadiseToys || []).forEach(toy => {
      if (toy.kind === 'tramp') this._tickTramp(cat, toy, dt);
      else if (toy.kind === 'slide') this._tickSlide(cat, toy, dt, hooks, wantsMove);
      else if (toy.kind === 'spin') this._tickSpin(cat, toy, dt, wantsMove);
      else if (toy.kind === 'photo') this._tickPhoto(cat, toy);
      else if (toy.kind === 'sdisplay') this._tickSdisplay(cat, toy, hooks, wantsMove);
    });
  },

  _tickTramp(cat, toy, dt) {
    if (!cat || Math.hypot(cat.wx - toy.x, cat.wy - toy.y) > toy.r * 0.88) return;
    cat.moving = false;
    cat.vx = 0;
    cat.vy = 0;
    if (cat.act === 'jump') {
      cat.actT += dt;
      if (cat.actT < cat.actDur) return;
    }
    cat.act = 'jump';
    cat.actT = 0;
    cat.actDur = 0.52;
  },

  _tickSlide(_cat, _toy, _dt, _hooks, _wantsMove) {
    /* 滑梯仅作装饰，不拽猫 */
  },

  _tickSpin(_cat, _toy, _dt, _wantsMove) {
    /* 旋转台仅作装饰，不拽猫 */
  },

  _tickPhoto(_cat, _toy) {
    /* 拍照墙不触发动作，避免猫乱动 */
  },

  _tickSdisplay(cat, toy, hooks, wantsMove) {
    if (!cat || wantsMove) return;
    const d = Math.hypot(cat.wx - toy.x, cat.wy - toy.y);
    if (d > toy.r * 0.92) return;
    const skin = CatSkins.get(cat.skinId);
    if (!(skin.seasonOnly || skin.tier === 'S')) return;
    cat.moving = false;
    cat.vx = 0;
    cat.vy = 0;
    const cap = `✨ S 展示台 · 「${skin.name}」`;
    if (cap !== this._lastCaption) {
      this._lastCaption = cap;
      hooks.setCaption(cap);
    }
  },

  tickFollow(state, dt, helpers) {
    if (!state.inParadise || !helpers) return;
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
    CatWorld.applyMountainPhysics(follow, helpers.catFootOffset(follow));
    helpers.tickCatHunger(follow, step, dt);
  },
};
