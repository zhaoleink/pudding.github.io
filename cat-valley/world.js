/**
 * 妙脆角猫山谷 — 超大世界：雪谷 · 森林 · 落叶林 · 桂花林 · 暖沙 · 草原
 */
const CatWorld = {
  W: 9000,
  H: 6800,
  margin: 48,

  catRadius(scale = 1) {
    return 18 * scale;
  },

  biomeDefs: {
    snow: { id: 'snow', name: '雪谷', skyTop: '#b8c4ce', skyBot: '#dce4ec', ground: '#eef3f8', ground2: '#e2eaf2' },
    forest: { id: 'forest', name: '深林', skyTop: '#7a9a88', skyBot: '#a8c4b0', ground: '#2d4a32', ground2: '#3d5c40' },
    leafwood: { id: 'leafwood', name: '落叶林', skyTop: '#c9a050', skyBot: '#e8cc88', ground: '#c8a858', ground2: '#b89240' },
    desert: { id: 'desert', name: '暖沙', skyTop: '#e8c88a', skyBot: '#f5deb8', ground: '#e6c88a', ground2: '#d4a855' },
    meadow: { id: 'meadow', name: '草原', skyTop: '#9ec8e8', skyBot: '#c8e6f5', ground: '#b8d4a0', ground2: '#9bc47a' },
    osmanthus: {
      id: 'osmanthus', name: '桂花林',
      skyTop: '#b8d4a8', skyBot: '#f0e4c8', ground: '#9aab78', ground2: '#889966',
    },
  },

  /** 六大片区 — 边界用噪声扭曲，过渡自然但不乱 */
  biomeZones: [
    { id: 'snow', x: 2300, y: 1700, rx: 3100, ry: 2300 },
    { id: 'forest', x: 6700, y: 1900, rx: 2900, ry: 2500 },
    { id: 'leafwood', x: 4500, y: 3100, rx: 2100, ry: 1700 },
    { id: 'osmanthus', x: 4800, y: 4300, rx: 1900, ry: 1500 },
    { id: 'desert', x: 2300, y: 5100, rx: 2900, ry: 2100 },
    { id: 'meadow', x: 6700, y: 5100, rx: 2700, ry: 2300 },
  ],

  biomeDef(id) {
    return this.biomeDefs[id] || this.biomeDefs.snow;
  },

  _hash(x, y) {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
  },

  _noise2(wx, wy) {
    const x0 = Math.floor(wx);
    const y0 = Math.floor(wy);
    const fx = wx - x0;
    const fy = wy - y0;
    const u = fx * fx * (3 - 2 * fx);
    const v = fy * fy * (3 - 2 * fy);
    const a = this._hash(x0, y0);
    const b = this._hash(x0 + 1, y0);
    const c = this._hash(x0, y0 + 1);
    const d = this._hash(x0 + 1, y0 + 1);
    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
  },

  _warp(wx, wy) {
    const n = this._noise2(wx * 0.00075, wy * 0.00075);
    return {
      x: wx + Math.sin(wy * 0.00115 + n * 6.28) * 560,
      y: wy + Math.cos(wx * 0.00105 + n * 5.5) * 500,
    };
  },

  _zoneWeight(wx, wy, z) {
    const p = this._warp(wx, wy);
    const dx = (p.x - z.x) / z.rx;
    const dy = (p.y - z.y) / z.ry;
    const d2 = dx * dx + dy * dy;
    if (d2 >= 1) return 0;
    const t = 1 - d2;
    return t * t;
  },

  biomeBlendAt(wx, wy) {
    const weights = { snow: 0, forest: 0, leafwood: 0, osmanthus: 0, desert: 0, meadow: 0 };
    let sum = 0;
    this.biomeZones.forEach(z => {
      const w = this._zoneWeight(wx, wy, z);
      weights[z.id] = w;
      sum += w;
    });
    if (sum < 0.02) {
      let nearId = 'snow';
      let nearD = Infinity;
      const p = this._warp(wx, wy);
      this.biomeZones.forEach(z => {
        const d = Math.hypot((p.x - z.x) / z.rx, (p.y - z.y) / z.ry);
        if (d < nearD) { nearD = d; nearId = z.id; }
      });
      weights[nearId] = 1;
      return weights;
    }
    Object.keys(weights).forEach(id => { weights[id] /= sum; });
    return weights;
  },

  biomeAt(wx, wy) {
    const blend = this.biomeBlendAt(wx, wy);
    let bestId = 'snow';
    let best = 0;
    Object.keys(blend).forEach(id => {
      if (blend[id] > best) { best = blend[id]; bestId = id; }
    });
    return this.biomeDef(bestId);
  },

  biomeMixColor(wx, wy, key) {
    const blend = this.biomeBlendAt(wx, wy);
    let r = 0; let g = 0; let b = 0;
    Object.keys(blend).forEach(id => {
      const w = blend[id];
      if (w <= 0) return;
      const hex = this.biomeDef(id)[key] || '#888888';
      const n = parseInt(hex.slice(1), 16);
      r += ((n >> 16) & 255) * w;
      g += ((n >> 8) & 255) * w;
      b += (n & 255) * w;
    });
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  },

  propFitsBiome(wx, wy, allowed) {
    const id = this.biomeAt(wx, wy).id;
    return !allowed || allowed.includes(id);
  },

  _terrainScale: 10,
  _terrainCanvas: null,

  groundColorAt(wx, wy) {
    const blend = this.biomeBlendAt(wx, wy);
    let r = 0;
    let g = 0;
    let b = 0;
    Object.keys(blend).forEach(id => {
      const w = blend[id];
      if (w <= 0) return;
      const hex = this.biomeDef(id).ground;
      const n = parseInt(hex.slice(1), 16);
      r += ((n >> 16) & 255) * w;
      g += ((n >> 8) & 255) * w;
      b += (n & 255) * w;
    });
    const grain = this._noise2(wx * 0.007, wy * 0.007);
    const v = 1 + (grain - 0.5) * 0.09;
    return [r, g, b].map(c => Math.max(0, Math.min(255, Math.round(c * v))));
  },

  buildTerrain() {
    if (this._terrainCanvas) return this._terrainCanvas;
    const tw = Math.ceil(this.W / this._terrainScale);
    const th = Math.ceil(this.H / this._terrainScale);
    const c = document.createElement('canvas');
    c.width = tw;
    c.height = th;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(tw, th);
    for (let py = 0; py < th; py++) {
      for (let px = 0; px < tw; px++) {
        const wx = px * this._terrainScale + this._terrainScale * 0.5;
        const wy = py * this._terrainScale + this._terrainScale * 0.5;
        const rgb = this.groundColorAt(wx, wy);
        const i = (py * tw + px) * 4;
        img.data[i] = rgb[0];
        img.data[i + 1] = rgb[1];
        img.data[i + 2] = rgb[2];
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    this._terrainCanvas = c;
    return c;
  },

  mountains: [
    { x: 800, y: 520, w: 1100, h: 680, c: '#9aa8b4' },
    { x: 2200, y: 380, w: 1400, h: 820, c: '#8a98a4' },
    { x: 3600, y: 480, w: 1200, h: 720, c: '#949fac' },
    { x: 1400, y: 1200, w: 900, h: 500, c: '#a8b4be' },
    { x: 3200, y: 1100, w: 1000, h: 560, c: '#9facb6' },
    { x: 5800, y: 420, w: 1300, h: 760, c: '#6a8070' },
    { x: 7200, y: 580, w: 1100, h: 640, c: '#5a7060' },
    { x: 6200, y: 1400, w: 900, h: 480, c: '#708878' },
    { x: 1200, y: 4200, w: 1400, h: 520, c: '#c4a878' },
    { x: 2800, y: 4500, w: 1000, h: 400, c: '#b89868' },
    { x: 7000, y: 4800, w: 1200, h: 460, c: '#88a878' },
  ],

  /** 休息点 — 站定不动可歇脚、缓饿、打盹 */
  restSpots: [
    { x: 820, y: 980, r: 115, name: '雪谷营', icon: '⛺' },
    { x: 1100, y: 1380, r: 105, name: '溪边石', icon: '💧' },
    { x: 2500, y: 1200, r: 100, name: '冷溪畔', icon: '💧' },
    { x: 4200, y: 3050, r: 125, name: '落叶垫', icon: '🍂' },
    { x: 4780, y: 4280, r: 120, name: '桂香石', icon: '🌼' },
    { x: 5100, y: 920, r: 110, name: '林下破', icon: '🍃' },
    { x: 1500, y: 5180, r: 210, name: '绿洲荫', icon: '🌴' },
    { x: 3200, y: 5380, r: 230, name: '清泉边', icon: '♨️' },
    { x: 6800, y: 5280, r: 120, name: '草坡歇', icon: '🌾' },
    { x: 7200, y: 5600, r: 115, name: '远丘亭', icon: '🏔️' },
  ],

  /** 各区特产 — 沙漠干枣 · 深林松果 · 草原三叶草 */
  specialtyNodes: [
    { x: 900, y: 4000, kind: 'date', qty: 4, s: 1 },
    { x: 1600, y: 4600, kind: 'date', qty: 3, s: 1.1 },
    { x: 2400, y: 4800, kind: 'date', qty: 5, s: 0.95 },
    { x: 3200, y: 4400, kind: 'date', qty: 4, s: 1.05 },
    { x: 3600, y: 5000, kind: 'date', qty: 3, s: 1.15 },
    { x: 5300, y: 880, kind: 'cone', qty: 4, s: 1.2 },
    { x: 6200, y: 760, kind: 'cone', qty: 3, s: 1.3 },
    { x: 7100, y: 900, kind: 'cone', qty: 4, s: 1.15 },
    { x: 5800, y: 1600, kind: 'cone', qty: 3, s: 1.25 },
    { x: 7200, y: 2100, kind: 'cone', qty: 4, s: 1.1 },
    { x: 5800, y: 5200, kind: 'clover', qty: 4, s: 1 },
    { x: 6400, y: 5400, kind: 'clover', qty: 5, s: 1.05 },
    { x: 7200, y: 5600, kind: 'clover', qty: 3, s: 0.95 },
    { x: 8000, y: 5800, kind: 'clover', qty: 4, s: 1.1 },
    { x: 4500, y: 4100, kind: 'guihua', qty: 4, s: 1.05 },
    { x: 4900, y: 4350, kind: 'guihua', qty: 5, s: 1.1 },
    { x: 5200, y: 4180, kind: 'guihua', qty: 3, s: 0.95 },
    { x: 4600, y: 4550, kind: 'guihua', qty: 4, s: 1.15 },
    { x: 5100, y: 4480, kind: 'guihua', qty: 4, s: 1 },
  ],

  oases: [
    { x: 1400, y: 5200, r: 240 }, { x: 2200, y: 5600, r: 280 },
    { x: 3200, y: 5400, r: 300 }, { x: 3800, y: 5900, r: 220 },
    { x: 7200, y: 5200, r: 260 }, { x: 8200, y: 5600, r: 200 },
  ],

  streams: [
    { points: [[600, 1100], [900, 1300], [1200, 1500], [1500, 1750], [1800, 2000], [2100, 2200]], w: 42 },
    { points: [[2400, 800], [2500, 1100], [2550, 1400], [2600, 1750], [2650, 2100], [2700, 2450]], w: 38 },
    { points: [[3200, 1600], [3400, 1900], [3600, 2200], [3800, 2500], [4000, 2750]], w: 34 },
    { points: [[1400, 2800], [1700, 2920], [2000, 2980], [2300, 3020]], w: 36 },
    { points: [[5000, 600], [5400, 900], [5800, 1200], [6200, 1500], [6600, 1800]], w: 40 },
    { points: [[5600, 4200], [6000, 4600], [6400, 5000], [6800, 5400], [7200, 5800]], w: 36 },
    { points: [[800, 4800], [1200, 5100], [1600, 5400], [2000, 5700]], w: 32 },
  ],

  trees: [
    { x: 680, y: 860, s: 1.1, kind: 'snow' }, { x: 820, y: 920, s: 0.85, kind: 'snow' },
    { x: 760, y: 960, s: 0.95, kind: 'snow' }, { x: 2180, y: 920, s: 1.2, kind: 'snow' },
    { x: 2380, y: 1000, s: 0.9, kind: 'snow' }, { x: 2250, y: 1040, s: 1.0, kind: 'snow' },
    { x: 3840, y: 1120, s: 1.0, kind: 'snow' }, { x: 3980, y: 1200, s: 0.8, kind: 'snow' },
    { x: 1040, y: 2040, s: 1.05, kind: 'snow' }, { x: 1180, y: 2160, s: 0.88, kind: 'snow' },
    { x: 2520, y: 1880, s: 1.15, kind: 'snow' }, { x: 2680, y: 2000, s: 0.92, kind: 'snow' },
    { x: 4040, y: 2440, s: 0.95, kind: 'snow' }, { x: 1720, y: 2940, s: 1.1, kind: 'snow' },
    { x: 5000, y: 720, s: 1.3, kind: 'forest' }, { x: 5300, y: 880, s: 1.5, kind: 'forest' },
    { x: 5600, y: 640, s: 1.2, kind: 'forest' }, { x: 5900, y: 920, s: 1.4, kind: 'forest' },
    { x: 6200, y: 760, s: 1.35, kind: 'forest' }, { x: 6500, y: 1100, s: 1.1, kind: 'forest' },
    { x: 6800, y: 680, s: 1.45, kind: 'forest' }, { x: 7100, y: 900, s: 1.25, kind: 'forest' },
    { x: 7400, y: 720, s: 1.5, kind: 'forest' }, { x: 7700, y: 1000, s: 1.2, kind: 'forest' },
    { x: 8000, y: 840, s: 1.3, kind: 'forest' }, { x: 5200, y: 1400, s: 1.15, kind: 'forest' },
    { x: 5800, y: 1600, s: 1.4, kind: 'forest' }, { x: 6400, y: 1300, s: 1.25, kind: 'forest' },
    { x: 7000, y: 1500, s: 1.35, kind: 'forest' }, { x: 7600, y: 1280, s: 1.2, kind: 'forest' },
    { x: 8200, y: 1600, s: 1.1, kind: 'forest' }, { x: 5400, y: 2000, s: 1.3, kind: 'forest' },
    { x: 6200, y: 2200, s: 1.4, kind: 'forest' }, { x: 7200, y: 2100, s: 1.25, kind: 'forest' },
    { x: 3600, y: 2800, s: 1.15, kind: 'leafwood', fruits: 6 },
    { x: 4000, y: 3000, s: 1.25, kind: 'leafwood', fruits: 5 },
    { x: 4400, y: 2700, s: 1.3, kind: 'leafwood', fruits: 8 },
    { x: 4800, y: 2900, s: 1.1, kind: 'leafwood', fruits: 7 },
    { x: 5200, y: 3100, s: 1.35, kind: 'leafwood', fruits: 5 },
    { x: 5400, y: 2950, s: 1.2, kind: 'leafwood', fruits: 6 },
    { x: 4200, y: 3400, s: 1.05, kind: 'leafwood', fruits: 7 },
    { x: 5000, y: 3500, s: 1.15, kind: 'leafwood', fruits: 8 },
    { x: 4380, y: 4050, s: 1.2, kind: 'osmanthus' }, { x: 4680, y: 4220, s: 1.35, kind: 'osmanthus' },
    { x: 4980, y: 4100, s: 1.15, kind: 'osmanthus' }, { x: 5280, y: 4280, s: 1.4, kind: 'osmanthus' },
    { x: 5520, y: 4150, s: 1.25, kind: 'osmanthus' }, { x: 4720, y: 4480, s: 1.1, kind: 'osmanthus' },
    { x: 5080, y: 4580, s: 1.3, kind: 'osmanthus' }, { x: 5400, y: 4420, s: 1.05, kind: 'osmanthus' },
    { x: 5800, y: 5200, s: 1.0, kind: 'meadow' }, { x: 6400, y: 5400, s: 1.1, kind: 'meadow' },
    { x: 7200, y: 5600, s: 0.95, kind: 'meadow' }, { x: 8000, y: 5800, s: 1.05, kind: 'meadow' },
  ],

  bushes: [
    { x: 680, y: 1120, berries: 4, s: 1 }, { x: 820, y: 1180, berries: 3, s: 0.95 },
    { x: 2480, y: 860, berries: 4, s: 1 }, { x: 5080, y: 680, berries: 3, s: 0.9 },
    { x: 640, y: 900, berries: 4, s: 1 }, { x: 880, y: 880, berries: 3, s: 0.9 },
    { x: 2220, y: 1020, berries: 5, s: 1.1 }, { x: 2460, y: 940, berries: 3, s: 0.85 },
    { x: 3920, y: 1240, berries: 4, s: 1 }, { x: 1080, y: 2220, berries: 3, s: 0.95 },
    { x: 2620, y: 2120, berries: 5, s: 1 }, { x: 4120, y: 2620, berries: 4, s: 0.88 },
    { x: 1640, y: 3060, berries: 3, s: 1 },
    { x: 5100, y: 1200, berries: 4, s: 1.1 }, { x: 6800, y: 1800, berries: 5, s: 0.9 },
    { x: 7600, y: 1400, berries: 3, s: 1 }, { x: 6000, y: 5000, berries: 4, s: 1.05 },
    { x: 7400, y: 5400, berries: 5, s: 0.95 },
  ],

  cacti: [
    { x: 900, y: 4000, s: 1.1 }, { x: 1200, y: 4300, s: 0.9 }, { x: 1600, y: 4600, s: 1.2 },
    { x: 2000, y: 4200, s: 1.0 }, { x: 2400, y: 4800, s: 1.15 }, { x: 2800, y: 5100, s: 0.85 },
    { x: 3200, y: 4400, s: 1.05 }, { x: 3600, y: 5000, s: 1.25 }, { x: 4000, y: 4600, s: 0.95 },
    { x: 1400, y: 5600, s: 1.1 }, { x: 2200, y: 5900, s: 1.0 }, { x: 3000, y: 6200, s: 1.2 },
    { x: 3800, y: 5800, s: 0.9 },
  ],

  dunes: [
    { x: 800, y: 3800, w: 520, h: 90 }, { x: 1800, y: 4000, w: 680, h: 110 },
    { x: 2600, y: 3900, w: 600, h: 95 }, { x: 3400, y: 4100, w: 720, h: 100 },
    { x: 1200, y: 5000, w: 640, h: 105 }, { x: 2400, y: 5400, w: 580, h: 90 },
    { x: 3600, y: 5200, w: 700, h: 115 }, { x: 2000, y: 6100, w: 620, h: 95 },
  ],

  forestPatches: [
    { x: 5200, y: 500, r: 380 }, { x: 6800, y: 800, r: 420 }, { x: 7800, y: 600, r: 350 },
    { x: 5600, y: 1700, r: 400 }, { x: 7200, y: 1900, r: 360 },
  ],

  /** 落叶林地面 — 金黄落叶层 */
  leafPatches: [
    { x: 4000, y: 2900, r: 420 }, { x: 4800, y: 3100, r: 380 }, { x: 5400, y: 2900, r: 350 },
    { x: 4400, y: 3400, r: 400 },
  ],

  /** 桂花林 — 地面金雾与桂香 */
  osmanthusPatches: [
    { x: 4700, y: 4200, r: 440 }, { x: 5200, y: 4350, r: 380 },
    { x: 4550, y: 4500, r: 360 }, { x: 5050, y: 4080, r: 320 },
  ],

  /** 雪谷起点 — 左上角，靠近溪流和松树，不在地图正中 */
  spawn: { x: 780, y: 1020 },

  isMapCenter(wx, wy) {
    const cx = this.W * 0.5;
    const cy = this.H * 0.5;
    return Math.hypot(wx - cx, wy - cy) < Math.min(this.W, this.H) * 0.14;
  },

  spawnPosFor(catId) {
    const o = catId === 'small' ? { dx: 72, dy: 28 } : { dx: 0, dy: 0 };
    return { x: this.spawn.x + o.dx, y: this.spawn.y + o.dy };
  },

  specialtyBiome(kind) {
    if (kind === 'date') return 'desert';
    if (kind === 'cone') return 'forest';
    if (kind === 'clover') return 'meadow';
    if (kind === 'guihua') return 'osmanthus';
    return null;
  },

  /** 与 art.js 中山体轮廓一致的四边形顶点 */
  mountainShape(m) {
    const peak = m.y - m.h;
    return {
      x0: m.x - m.w * 0.5,
      x1: m.x - m.w * 0.15,
      x2: m.x + m.w * 0.2,
      x3: m.x + m.w * 0.55,
      peak,
      peakR: peak + m.h * 0.08,
      baseY: m.y,
    };
  },

  /** 山体表面高度（世界 y），wx 不在山体横向范围内则返回 null */
  mountainSurfaceY(wx, m) {
    const s = this.mountainShape(m);
    if (wx < s.x0 || wx > s.x3) return null;
    if (wx <= s.x1) {
      const t = (wx - s.x0) / (s.x1 - s.x0);
      return s.baseY + (s.peak - s.baseY) * t;
    }
    if (wx <= s.x2) {
      const t = (wx - s.x1) / (s.x2 - s.x1);
      return s.peak + (s.peakR - s.peak) * t;
    }
    const t = (wx - s.x2) / (s.x3 - s.x2);
    return s.peakR + (s.baseY - s.peakR) * t;
  },

  /** 该点是否在山体实心区域内（接近坡面、尚未贴到表面） */
  isInsideMountain(wx, wy, m, footBand = 90) {
    const sy = this.mountainSurfaceY(wx, m);
    if (sy === null) return false;
    const s = this.mountainShape(m);
    if (wy > s.baseY) return false;
    const gap = wy - sy;
    return gap > 2 && gap <= footBand;
  },

  /** 找当前位置应站立的山坡（取最接近脚面的表面） */
  findMountainStand(wx, footY, footBand = 90) {
    let best = null;
    for (const m of this.mountains) {
      const sy = this.mountainSurfaceY(wx, m);
      if (sy === null) continue;
      const gap = footY - sy;
      if (gap < -18 || gap > footBand) continue;
      if (!best || Math.abs(gap) < Math.abs(best.gap)) {
        best = { m, sy, gap, elevation: Math.max(0, m.y - sy) };
      }
    }
    return best;
  },

  /** 将猫约束到可爬的山坡表面 */
  applyMountainPhysics(c, footOff) {
    if (c.mountainJumpOffUntil && performance.now() < c.mountainJumpOffUntil) {
      c.onMountain = false;
      c.mountainElevation = 0;
      return;
    }
    const footY = c.wy + footOff;
    const stand = this.findMountainStand(c.wx, footY);
    if (stand) {
      c.wy = stand.sy - footOff;
      c.onMountain = true;
      c.mountainElevation = stand.elevation;
      return;
    }

    for (const m of this.mountains) {
      if (!this.isInsideMountain(c.wx, footY, m)) continue;
      const sy = this.mountainSurfaceY(c.wx, m);
      c.wy = sy - footOff;
      c.onMountain = true;
      c.mountainElevation = Math.max(0, m.y - sy);
      return;
    }

    c.onMountain = false;
    c.mountainElevation = 0;
  },

  /** 蹦跳脱离山坡 — 落到该山脚平地，短暂不再被吸回坡面 */
  dismountFromMountain(c, footOff) {
    if (!c.onMountain && !(c.mountainElevation > 0)) return false;
    let target = null;
    for (const m of this.mountains) {
      const s = this.mountainShape(m);
      if (c.wx >= s.x0 && c.wx <= s.x3) {
        target = m;
        break;
      }
    }
    if (target) {
      c.wy = target.y - footOff;
    }
    c.onMountain = false;
    c.mountainElevation = 0;
    c.mountainJumpOffUntil = performance.now() + 480;
    return true;
  },

  /** 山体横向跨度 */
  mountainSpan(m) {
    const s = this.mountainShape(m);
    return { x0: s.x0, x3: s.x3 };
  },

  /** 妙脆角猫乐园 — 彩色游乐区，在山谷中央（蛋仔式逛玩） */
  catParadise: {
    x: 4500,
    y: 3400,
    rx: 760,
    ry: 680,
    name: '妙脆角猫游乐园',
    gateX: 3780,
    gateY: 3020,
  },

  catParadiseToys: [
    { id: 'tramp-a', kind: 'tramp', x: 4150, y: 3180, r: 82 },
    { id: 'tramp-b', kind: 'tramp', x: 4850, y: 3180, r: 82 },
    { id: 'slide-a', kind: 'slide', x: 4320, y: 3480, x2: 4560, y2: 3720, w: 88 },
    { id: 'spin-a', kind: 'spin', x: 4500, y: 3320, r: 105, speed: 0.55 },
    { id: 'photo-a', kind: 'photo', x: 4740, y: 3510, w: 210, h: 95 },
    { id: 'sdisplay-a', kind: 'sdisplay', x: 4620, y: 3460, r: 72 },
  ],

  /** 妙脆角猫寻宝屋 — 独立房间，按钮进入（不在大世界地图上） */
  catTreasureRoom: {
    x: 8200,
    y: 3200,
    rx: 640,
    ry: 520,
    name: '妙脆角猫寻宝屋',
  },

  /** 寻宝木箱 — 只在寻宝屋内 */
  treasureChests: [
    { id: 'tc-1', x: 7900, y: 2980, coins: 8 },
    { id: 'tc-2', x: 8500, y: 2980, coins: 10 },
    { id: 'tc-3', x: 8200, y: 2820, coins: 9 },
    { id: 'tc-4', x: 7620, y: 3180, coins: 10 },
    { id: 'tc-5', x: 8780, y: 3180, coins: 12 },
    { id: 'tc-6', x: 7980, y: 3420, coins: 9 },
    { id: 'tc-7', x: 8420, y: 3420, coins: 11 },
    { id: 'tc-8', x: 8200, y: 3580, coins: 10 },
    { id: 'tc-9', x: 7720, y: 3480, coins: 12 },
    { id: 'tc-10', x: 8680, y: 3480, coins: 13 },
    { id: 'tc-11', x: 8080, y: 3120, coins: 14 },
    { id: 'tc-12', x: 8320, y: 3280, coins: 15 },
  ],

  inCatTreasureRoom(wx, wy) {
    const r = this.catTreasureRoom;
    if (!r) return false;
    const dx = (wx - r.x) / r.rx;
    const dy = (wy - r.y) / r.ry;
    return dx * dx + dy * dy <= 1;
  },

  treasureSpawnFor(catId) {
    const r = this.catTreasureRoom;
    const o = catId === 'small' ? { dx: 48, dy: 32 } : { dx: -36, dy: 24 };
    return { x: r.x + o.dx, y: r.y + o.dy };
  },

  /** 秘密通道 — 深林山后小房间（大世界里找入口） */
  secretGate: { x: 5480, y: 680, r: 95, name: '秘密通道' },

  catSecretRoom: {
    x: 2000,
    y: 6200,
    rx: 520,
    ry: 440,
    name: '秘密小室',
  },

  /** 秘密小室出口 — 入口旁圆门，进门即见 */
  secretRoomExit: { x: 2000, y: 5795, r: 88 },

  secretOrbs: [
    { id: 'so-1', x: 1720, y: 6080, coins: 10 },
    { id: 'so-2', x: 2000, y: 5980, coins: 12 },
    { id: 'so-3', x: 2280, y: 6080, coins: 11 },
    { id: 'so-4', x: 1840, y: 6320, coins: 13 },
    { id: 'so-5', x: 2160, y: 6320, coins: 14 },
  ],

  inCatSecretRoom(wx, wy) {
    const r = this.catSecretRoom;
    if (!r) return false;
    const dx = (wx - r.x) / r.rx;
    const dy = (wy - r.y) / r.ry;
    return dx * dx + dy * dy <= 1;
  },

  secretSpawnFor(catId) {
    const ex = this.secretRoomExit;
    const o = catId === 'small' ? { dx: 52, dy: 108 } : { dx: -46, dy: 104 };
    return { x: ex.x + o.dx, y: ex.y + o.dy };
  },

  clampInSecretRoom(c) {
    const r = this.catSecretRoom;
    if (!r || !c) return;
    const dx = (c.wx - r.x) / r.rx;
    const dy = (c.wy - r.y) / r.ry;
    const d2 = dx * dx + dy * dy;
    if (d2 <= 0.92 * 0.92) return;
    const d = Math.sqrt(d2) || 1;
    c.wx = r.x + (dx / d) * r.rx * 0.92;
    c.wy = r.y + (dy / d) * r.ry * 0.92;
  },

  clampInTreasureRoom(c) {
    const r = this.catTreasureRoom;
    if (!r || !c) return;
    const dx = (c.wx - r.x) / r.rx;
    const dy = (c.wy - r.y) / r.ry;
    const d2 = dx * dx + dy * dy;
    if (d2 <= 0.92 * 0.92) return;
    const d = Math.sqrt(d2) || 1;
    c.wx = r.x + (dx / d) * r.rx * 0.92;
    c.wy = r.y + (dy / d) * r.ry * 0.92;
  },

  inCatParadise(wx, wy) {
    const p = this.catParadise;
    if (!p) return false;
    const dx = (wx - p.x) / p.rx;
    const dy = (wy - p.y) / p.ry;
    return dx * dx + dy * dy <= 1;
  },

  paradiseSpawnFor(catId) {
    const p = this.catParadise;
    const o = catId === 'small' ? { dx: 58, dy: 36 } : { dx: -42, dy: 28 };
    return { x: p.x + o.dx, y: p.y + o.dy };
  },

  clampInParadise(c) {
    const p = this.catParadise;
    if (!p || !c) return;
    const dx = (c.wx - p.x) / p.rx;
    const dy = (c.wy - p.y) / p.ry;
    const d2 = dx * dx + dy * dy;
    if (d2 <= 0.92 * 0.92) return;
    const d = Math.sqrt(d2) || 1;
    c.wx = p.x + (dx / d) * p.rx * 0.92;
    c.wy = p.y + (dy / d) * p.ry * 0.92;
  },

  _pointSegDist(px, py, ax, ay, bx, by) {
    const abx = bx - ax;
    const aby = by - ay;
    const len2 = abx * abx + aby * aby;
    if (len2 < 1e-6) return { dist: Math.hypot(px - ax, py - ay) };
    let t = ((px - ax) * abx + (py - ay) * aby) / len2;
    t = Math.max(0, Math.min(1, t));
    const qx = ax + abx * t;
    const qy = ay + aby * t;
    return { dist: Math.hypot(px - qx, py - qy) };
  },

  /** 脚下是否在溪里、水流方向（顺溪向下）与强度 0~1 */
  streamCurrentAt(wx, wy) {
    let best = null;
    for (const stream of this.streams) {
      const pts = stream.points;
      if (!pts || pts.length < 2) continue;
      const mid = pts[Math.floor(pts.length / 2)] || pts[0];
      if (this.biomeAt(mid[0], mid[1]).id === 'desert') continue;
      const halfW = stream.w * 0.54;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const hit = this._pointSegDist(wx, wy, a[0], a[1], b[0], b[1]);
        if (hit.dist > halfW) continue;
        if (!best || hit.dist < best.dist) {
          const dx = b[0] - a[0];
          const dy = b[1] - a[1];
          const len = Math.hypot(dx, dy) || 1;
          const depth = 1 - hit.dist / halfW;
          best = {
            dist: hit.dist,
            ux: dx / len,
            uy: dy / len,
            strength: 0.28 + depth * 0.72,
          };
        }
      }
    }
    if (!best) return { inWater: false, ux: 0, uy: 0, strength: 0 };
    return { inWater: true, ux: best.ux, uy: best.uy, strength: best.strength };
  },

  /** 与 art.js 绘制一致的溪边/泉眼石头，用于碰撞 */
  ensureStreamRocks() {
    if (this.streamRocks) return this.streamRocks;
    const rocks = [];
    this.streams.forEach((stream, si) => {
      const pts = stream.points;
      if (!pts || pts.length < 2) return;
      const w = stream.w;
      const mid = pts[Math.floor(pts.length / 2)] || pts[0];
      if (this.biomeAt(mid[0], mid[1]).id === 'desert') return;

      const head = pts[0];
      const rockN = 10;
      for (let i = 0; i < rockN; i++) {
        const ang = (i / rockN) * Math.PI * 2 + 0.12;
        const rr = w * (1.08 + (i % 3) * 0.07);
        const rx = head[0] + Math.cos(ang) * rr;
        const ry = head[1] + Math.sin(ang) * rr * 0.7;
        const rs = w * (0.2 + (i % 4) * 0.035);
        rocks.push({ x: rx, y: ry, rx: rs * 1.12, ry: rs * 0.82 });
      }

      pts.forEach((p, pi) => {
        if (pi === 0 || pi === pts.length - 1) return;
        if (pi % 2 !== 0) return;
        for (let r = 0; r < 2; r++) {
          const h = this._hash(si * 19 + pi, r * 29);
          const side = r === 0 ? -1 : 1;
          const nx = p[0] + side * w * (0.72 + h * 0.28);
          const ny = p[1] + (h - 0.5) * w * 0.35;
          const rs = w * (0.13 + h * 0.11);
          rocks.push({ x: nx, y: ny, rx: rs * 1.1, ry: rs * 0.88 });
        }
      });
    });
    this.streamRocks = rocks;
    return rocks;
  },

  streamRockBlocks(wx, wy, footR = 14) {
    const pad = footR * 0.36;
    for (const rock of this.ensureStreamRocks()) {
      const dx = wx - rock.x;
      const dy = wy - rock.y;
      const rx = rock.rx + pad;
      const ry = rock.ry + pad;
      const v = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
      if (v < 1) return true;
    }
    return false;
  },

  resolveStreamRocks(c, footR = 14) {
    if (!c) return;
    const pad = footR * 0.36;
    for (let pass = 0; pass < 5; pass++) {
      let moved = false;
      for (const rock of this.ensureStreamRocks()) {
        const dx = c.wx - rock.x;
        const dy = c.wy - rock.y;
        const rx = rock.rx + pad;
        const ry = rock.ry + pad;
        const v = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry);
        if (v < 1 && v > 1e-8) {
          const s = 1 / Math.sqrt(v);
          c.wx = rock.x + dx * s;
          c.wy = rock.y + dy * s;
          moved = true;
        }
      }
      if (!moved) break;
    }
  },
};
