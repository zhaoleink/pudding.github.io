/**
 * 镜头 — 俯视跟随（最初版）
 */
const ValleyCam = {
  zoom: 0.78,
  anchorX: 0.5,
  anchorY: 0.68,
  x: CatWorld.spawn.x,
  y: CatWorld.spawn.y,
  lookAhead: 90,

  viewSize(vw, vh) {
    return { w: vw / this.zoom, h: vh / this.zoom };
  },

  viewRect(vw, vh, pad = 240) {
    const { w: vwWorld, h: vhWorld } = this.viewSize(vw, vh);
    return {
      left: this.x - vwWorld * 0.5 - pad,
      top: this.y - vhWorld * 0.5 - pad,
      right: this.x + vwWorld * 0.5 + pad,
      bottom: this.y + vhWorld * 0.5 + pad,
    };
  },

  worldToScreen(wx, wy, vw, vh) {
    return {
      x: (wx - this.x) * this.zoom + vw * this.anchorX,
      y: (wy - this.y) * this.zoom + vh * this.anchorY,
    };
  },

  screenToWorld(sx, sy, vw, vh) {
    return {
      wx: (sx - vw * this.anchorX) / this.zoom + this.x,
      wy: (sy - vh * this.anchorY) / this.zoom + this.y,
    };
  },

  screenRadius(worldR) {
    return worldR * this.zoom;
  },

  follow(cat, dt, vw, vh) {
    const tx = cat.wx + cat.facing * this.lookAhead * (cat.moving ? 1 : 0.35);
    const ty = cat.wy - vh * 0.06 / this.zoom;
    const ease = 0.055;
    this.x += (tx - this.x) * ease;
    this.y += (ty - this.y) * ease;
    this.clamp(vw, vh);
  },

  clamp(vw, vh) {
    const { w: vwWorld, h: vhWorld } = this.viewSize(vw, vh);
    const hw = vwWorld * 0.5;
    const hh = vhWorld * 0.5;
    this.x = Math.max(hw, Math.min(CatWorld.W - hw, this.x));
    this.y = Math.max(hh, Math.min(CatWorld.H - hh, this.y));
  },

  applyTransform(ctx, vw, vh) {
    ctx.translate(vw * this.anchorX, vh * this.anchorY);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -this.y);
  },
};
