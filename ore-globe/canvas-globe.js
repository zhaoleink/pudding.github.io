/**
 * 纯 Canvas 地球 · 无 Three.js · 无 ES Module · file:// 也能秒开
 */
(function () {
  const MINERAL_LIST = [
    { key: 'ALL', label: '全部', color: '#ffffff' },
    /* 元素（固体矿物常见，不含气体 / 剧毒 / 放射性） */
    { key: 'LI', label: '锂', color: '#81d4fa' },
    { key: 'B', label: '硼', color: '#ffe082' },
    { key: 'C', label: '碳', color: '#424242' },
    { key: 'NA', label: '钠', color: '#fff9c4' },
    { key: 'MG', label: '镁', color: '#c8e6c9' },
    { key: 'AL', label: '铝', color: '#b0bec5' },
    { key: 'SI', label: '硅', color: '#cfd8dc' },
    { key: 'P', label: '磷', color: '#ffcc80' },
    { key: 'K', label: '钾', color: '#f48fb1' },
    { key: 'CA', label: '钙', color: '#fff59d' },
    { key: 'SC', label: '钪', color: '#90caf9' },
    { key: 'TI', label: '钛', color: '#78909c' },
    { key: 'V', label: '钒', color: '#7e57c2' },
    { key: 'CR', label: '铬', color: '#9ccc65' },
    { key: 'MN', label: '锰', color: '#8d6e63' },
    { key: 'FE', label: '铁', color: '#bcaaa4' },
    { key: 'CO', label: '钴', color: '#7986cb' },
    { key: 'NI', label: '镍', color: '#9575cd' },
    { key: 'CU', label: '铜', color: '#ff7043' },
    { key: 'ZN', label: '锌', color: '#4dd0e1' },
    { key: 'GA', label: '镓', color: '#b3e5fc' },
    { key: 'GE', label: '锗', color: '#80cbc4' },
    { key: 'SR', label: '锶', color: '#ce93d8' },
    { key: 'Y', label: '钇', color: '#f06292' },
    { key: 'ZR', label: '锆', color: '#90a4ae' },
    { key: 'NB', label: '铌', color: '#7986cb' },
    { key: 'MO', label: '钼', color: '#5c6bc0' },
    { key: 'RU', label: '钌', color: '#8d99ae' },
    { key: 'RH', label: '铑', color: '#eceff1' },
    { key: 'PD', label: '钯', color: '#cfd8dc' },
    { key: 'AG', label: '银', color: '#eceff1' },
    { key: 'IN', label: '铟', color: '#81d4fa' },
    { key: 'SN', label: '锡', color: '#cfd8dc' },
    { key: 'BA', label: '钡', color: '#e0e0e0' },
    { key: 'LA', label: '镧', color: '#ffccbc' },
    { key: 'CE', label: '铈', color: '#ffab91' },
    { key: 'W', label: '钨', color: '#4e342e' },
    { key: 'PT', label: '铂', color: '#eeeeee' },
    { key: 'AU', label: '金', color: '#ffd54f' },
    { key: 'BI', label: '铋', color: '#f48fb1' },
    /* 常见矿物 */
    { key: 'AU_NAT', label: '自然金', color: '#ffd700' },
    { key: 'CU_NAT', label: '自然铜', color: '#e65100' },
    { key: 'CRYSTAL', label: '水晶', color: '#e1f5fe' },
    { key: 'AGATE', label: '玛瑙', color: '#ff7043' },
    { key: 'MARBLE', label: '大理石', color: '#f5f5f5' },
    { key: 'LAPIS', label: '青金石', color: '#283593' },
    { key: 'DIAMOND', label: '金刚石', color: '#e8f4ff' },
    { key: 'GRAPHITE', label: '石墨', color: '#616161' },
    { key: 'CORUNDUM', label: '刚玉', color: '#ef5350' },
    { key: 'GARNET', label: '石榴石', color: '#c62828' },
    { key: 'AMETHYST', label: '紫水晶', color: '#9c27b0' },
    { key: 'FELDSPAR', label: '长石', color: '#ffccbc' },
    { key: 'MICA', label: '云母', color: '#d7ccc8' },
    { key: 'TALC', label: '滑石', color: '#fafafa' },
    { key: 'KAOLIN', label: '高岭土', color: '#fff3e0' },
    { key: 'DOLOMITE', label: '白云石', color: '#eeeeee' },
    { key: 'CALCITE', label: '方解石', color: '#fffde7' },
    { key: 'MAGNESITE', label: '菱镁矿', color: '#c8e6c9' },
    { key: 'POTASH', label: '钾盐', color: '#f8bbd0' },
    { key: 'ALUM', label: '明矾', color: '#eceff1' },
    { key: 'BORAX', label: '硼砂', color: '#fff8e1' },
    { key: 'GREEN', label: '绿泥石', color: '#43a047' },
    { key: 'BERYL', label: '绿柱石', color: '#26a69a' },
    { key: 'OLIVINE', label: '橄榄石', color: '#7cb342' },
    { key: 'APATITE', label: '磷灰石', color: '#4fc3f7' },
    { key: 'JADE', label: '玉石', color: '#2e7d32' },
    { key: 'TURQ', label: '绿松石', color: '#00acc1' },
    { key: 'MALACHITE', label: '孔雀石', color: '#00897b' },
    { key: 'QUARTZ', label: '石英', color: '#fafafa' },
    { key: 'FLUOR', label: '萤石', color: '#ab47bc' },
    { key: 'PYRITE', label: '黄铁矿', color: '#fbc02d' },
    { key: 'MAG', label: '磁铁矿', color: '#37474f' },
    { key: 'HEMATITE', label: '赤铁矿', color: '#8d6e63' },
    { key: 'LIMONITE', label: '褐铁矿', color: '#a1887f' },
    { key: 'CHALCOPYRITE', label: '黄铜矿', color: '#ffb300' },
    { key: 'SPHALERITE', label: '闪锌矿', color: '#ff7043' },
    { key: 'CASSITERITE', label: '锡石', color: '#bdbdbd' },
    { key: 'SCHEELITE', label: '白钨矿', color: '#fff59d' },
    { key: 'ZIRCON', label: '锆石', color: '#ef9a9a' },
    { key: 'RUTILE', label: '金红石', color: '#ff8a65' },
    { key: 'CHROMITE', label: '铬铁矿', color: '#33691e' },
    { key: 'CELESTINE', label: '天青石', color: '#64b5f6' },
    { key: 'BARITE', label: '重晶石', color: '#e1bee7' },
    { key: 'GYPSUM', label: '石膏', color: '#eeeeee' },
    { key: 'SALT', label: '岩盐', color: '#ffffff' },
    { key: 'SUL', label: '硫', color: '#fff176' },
    { key: 'MN_FE', label: '锰铁', color: '#5d4037' },
    { key: 'REE', label: '稀土', color: '#ff8a65' },
    { key: 'COAL', label: '煤', color: '#212121' },
    { key: 'AMBER', label: '琥珀', color: '#ff9100' },
    { key: 'OIL', label: '石油', color: '#263238' },
  ];

  const MINERALS = Object.fromEntries(MINERAL_LIST.map(m => [m.key, m]));

  const ORE_CODE_TO_KEY = {
    AU: 'AU', CU: 'CU', FE: 'FE', AG: 'AG', LI: 'LI', NI: 'NI',
    ZN: 'ZN', CO: 'CO', MN: 'MN',
  };

  const ZONES = [
    { name: '安第斯铜矿带', lat: -22, lon: -69, spread: 14, codes: ['CU', 'LI'], count: 14 },
    { name: '智利阿塔卡马锂区', lat: -23.5, lon: -68, spread: 8, codes: ['LI'], count: 11 },
    { name: '巴西铁矿区', lat: -19, lon: -44, spread: 12, codes: ['FE'], count: 12 },
    { name: '圭亚那盾金铜区', lat: 5, lon: -59, spread: 10, codes: ['AU', 'CU'], count: 10 },
    { name: '墨西哥银锌区', lat: 24, lon: -103, spread: 9, codes: ['AG', 'ZN'], count: 11 },
    { name: '美国西部铜金区', lat: 39, lon: -115, spread: 11, codes: ['CU', 'AU'], count: 12 },
    { name: '加拿大镍铜区', lat: 48, lon: -85, spread: 12, codes: ['NI', 'CU'], count: 10 },
    { name: '西非金带', lat: 10, lon: -4, spread: 10, codes: ['AU'], count: 12 },
    { name: '刚果铜钴区', lat: -10, lon: 26, spread: 9, codes: ['CU', 'CO'], count: 14 },
    { name: '南非金区', lat: -26, lon: 27, spread: 7, codes: ['AU'], count: 11 },
    { name: '赞比亚铜带', lat: -13, lon: 28, spread: 6, codes: ['CU'], count: 9 },
    { name: '西伯利亚镍区', lat: 68, lon: 88, spread: 14, codes: ['NI'], count: 9 },
    { name: '蒙古铜金区', lat: 46, lon: 105, spread: 9, codes: ['CU', 'AU'], count: 10 },
    { name: '中国北方铁区', lat: 41, lon: 118, spread: 12, codes: ['FE'], count: 12 },
    { name: '澳大利亚铁矿带', lat: -23, lon: 119, spread: 13, codes: ['FE'], count: 13 },
    { name: '澳大利亚锂镍区', lat: -31, lon: 121, spread: 11, codes: ['LI', 'NI'], count: 11 },
    { name: '印尼镍区', lat: -2, lon: 121, spread: 9, codes: ['NI'], count: 10 },
    { name: '印度铁矿区', lat: 22, lon: 85, spread: 9, codes: ['FE'], count: 9 },
    { name: '波兰铜银区', lat: 51, lon: 16, spread: 6, codes: ['CU', 'AG'], count: 8 },
    { name: '瑞典铁矿带', lat: 67, lon: 20, spread: 8, codes: ['FE'], count: 8 },
  ];

  const DRAG_CLICK_MAX = 10;
  const DEG = Math.PI / 180;

  const app = {
    canvas: null,
    ctx: null,
    stage: null,
    rotY: -25,
    rotX: 10,
    zoom: 1,
    filter: 'ALL',
    points: [],
    pointers: new Map(),
    dragging: false,
    dragMoved: false,
    dragDist: 0,
    lastX: 0,
    lastY: 0,
    autoSpin: false,
    bgStars: [],
    landDots: [],
  };

  function oreKeyFromCodes(codes) {
    const order = ['AU', 'CU', 'FE', 'LI', 'NI', 'AG', 'ZN', 'CO', 'MN'];
    for (const c of order) {
      if (codes.includes(c)) return ORE_CODE_TO_KEY[c] || c;
    }
    return ORE_CODE_TO_KEY[codes[0]] || 'QUARTZ';
  }

  function scatterMineralPoints() {
    MINERAL_LIST.forEach(m => {
      if (m.key === 'ALL') return;
      const n = 2;
      for (let i = 0; i < n; i += 1) {
        app.points.push({
          lat: (Math.random() - 0.5) * 120,
          lon: (Math.random() - 0.5) * 340,
          region: '全球示意',
          mineralKey: m.key,
          codes: [],
        });
      }
    });
  }

  function buildLandDots() {
    const regions = [
      { lat: 52, lon: -105, wLat: 32, wLon: 48, n: 140 },
      { lat: 68, lon: -105, wLat: 14, wLon: 42, n: 55 },
      { lat: 18, lon: -92, wLat: 10, wLon: 28, n: 35 },
      { lat: -12, lon: -58, wLat: 42, wLon: 24, n: 130 },
      { lat: 52, lon: 12, wLat: 18, wLon: 38, n: 85 },
      { lat: 64, lon: 18, wLat: 12, wLon: 28, n: 40 },
      { lat: 8, lon: 22, wLat: 38, wLon: 38, n: 110 },
      { lat: -22, lon: 24, wLat: 26, wLon: 32, n: 75 },
      { lat: 28, lon: 42, wLat: 14, wLon: 22, n: 35 },
      { lat: 55, lon: 85, wLat: 22, wLon: 55, n: 95 },
      { lat: 35, lon: 105, wLat: 22, wLon: 38, n: 100 },
      { lat: 22, lon: 78, wLat: 18, wLon: 22, n: 45 },
      { lat: 5, lon: 115, wLat: 18, wLon: 28, n: 55 },
      { lat: -25, lon: 135, wLat: 18, wLon: 32, n: 70 },
      { lat: -42, lon: 172, wLat: 10, wLon: 18, n: 25 },
      { lat: 36, lon: 138, wLat: 8, wLon: 12, n: 22 },
      { lat: -2, lon: 118, wLat: 8, wLon: 18, n: 35 },
      { lat: 72, lon: -40, wLat: 10, wLon: 35, n: 45 },
      { lat: -78, lon: 0, wLat: 12, wLon: 360, n: 40 },
    ];
    let seed = 90210;
    const rnd = () => {
      seed = (seed * 48271) % 2147483647;
      return (seed & 0x7fffffff) / 2147483647;
    };
    app.landDots = [];
    regions.forEach(reg => {
      for (let i = 0; i < reg.n; i += 1) {
        app.landDots.push({
          lat: reg.lat + (rnd() - 0.5) * reg.wLat,
          lon: reg.lon + (rnd() - 0.5) * reg.wLon,
        });
      }
    });
  }

  function buildPoints() {
    app.points = [];
    ZONES.forEach(z => {
      const codes = z.codes || [];
      const n = z.count || 8;
      for (let i = 0; i < n; i += 1) {
        app.points.push({
          lat: z.lat + (Math.random() - 0.5) * z.spread,
          lon: z.lon + (Math.random() - 0.5) * z.spread * 1.1,
          region: z.name,
          codes,
          mineralKey: oreKeyFromCodes(codes),
        });
      }
    });
    scatterMineralPoints();
  }

  function filteredPoints() {
    if (app.filter === 'ALL') return app.points;
    return app.points.filter(p => p.mineralKey === app.filter);
  }

  function latLonToXYZ(lat, lon, rotY, rotX) {
    const la = lat * DEG;
    const lo = (lon + rotY) * DEG;
    let x = Math.cos(la) * Math.sin(lo);
    let y = Math.sin(la);
    let z = Math.cos(la) * Math.cos(lo);
    const cx = Math.cos(rotX * DEG);
    const sx = Math.sin(rotX * DEG);
    const y2 = y * cx - z * sx;
    const z2 = y * sx + z * cx;
    return { x, y: y2, z: z2 };
  }

  function layout() {
    const stage = app.stage;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = stage.clientWidth || 300;
    const h = stage.clientHeight || 300;
    app.w = w;
    app.h = h;
    app.canvas.width = Math.floor(w * dpr);
    app.canvas.height = Math.floor(h * dpr);
    app.canvas.style.width = `${w}px`;
    app.canvas.style.height = `${h}px`;
    app.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    app.cx = w * 0.5;
    app.cy = h * 0.52;
    app.R = Math.min(w, h) * 0.36 * app.zoom;
    if (!app.bgStars.length) {
      const n = Math.min(500, Math.floor((w * h) / 2000));
      for (let i = 0; i < n; i += 1) {
        app.bgStars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.2 + 0.3,
          p: Math.random() * 6,
        });
      }
    }
  }

  function drawBackground(now) {
    const { ctx, w, h } = app;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0a1020');
    g.addColorStop(1, '#020308');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    app.bgStars.forEach(s => {
      const a = 0.55 + 0.25 * (0.5 + 0.5 * Math.sin(now * 0.00035 + s.p));
      ctx.fillStyle = `rgba(220, 235, 255, ${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawGlobe() {
    const { ctx, cx, cy, R } = app;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.clip();

    const ocean = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
    ocean.addColorStop(0, '#1e88e5');
    ocean.addColorStop(0.55, '#1565c0');
    ocean.addColorStop(1, '#0d47a1');
    ctx.fillStyle = ocean;
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

    const drawLandLayer = (color, sizeMul, zMin) => {
      ctx.fillStyle = color;
      app.landDots.forEach(dot => {
        const p = latLonToXYZ(dot.lat, dot.lon, app.rotY, app.rotX);
        if (p.z <= zMin) return;
        const sx = cx + (p.x / (1 + p.z * 0.12)) * R;
        const sy = cy - (p.y / (1 + p.z * 0.12)) * R;
        const rr = R * (0.045 + p.z * 0.04) * sizeMul;
        ctx.beginPath();
        ctx.arc(sx, sy, rr, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    drawLandLayer('rgba(27, 94, 32, 0.92)', 1.35, 0.02);
    drawLandLayer('rgba(102, 187, 106, 0.88)', 1.0, 0.05);
    drawLandLayer('rgba(200, 230, 201, 0.55)', 0.65, 0.12);
    ctx.restore();

    ctx.strokeStyle = 'rgba(130, 190, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawOrePoints() {
    const { ctx, cx, cy, R } = app;
    const list = filteredPoints();
    app.screenPoints = [];
    list.forEach(pt => {
      const p = latLonToXYZ(pt.lat, pt.lon, app.rotY, app.rotX);
      if (p.z <= 0.08) return;
      const scale = 1 / (1 + p.z * 0.12);
      const sx = cx + p.x * R * scale;
      const sy = cy - p.y * R * scale;
      const col = MINERALS[pt.mineralKey]?.color || '#ffb74d';
      const r = Math.max(5, R * 0.018 + p.z * R * 0.032);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.arc(sx, sy, r + 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.45)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      app.screenPoints.push({ sx, sy, r: r + 8, data: pt });
    });
  }

  function draw(now) {
    if (!app.ctx) return;
    drawBackground(now);
    drawGlobe();
    drawOrePoints();
  }

  function animate(now) {
    draw(now);
    requestAnimationFrame(animate);
  }

  function dismissLoading() {
    const loading = document.getElementById('ore-loading');
    if (!loading || loading.classList.contains('hide')) return;
    loading.classList.add('fade-out');
    loading.setAttribute('aria-busy', 'false');
    setTimeout(() => {
      loading.classList.add('hide');
      window.__oreStopLoadingBoot?.();
    }, 500);
  }

  function updateStats() {
    const el = document.getElementById('ore-stats');
    if (!el) return;
    const n = filteredPoints().length;
    const name = MINERALS[app.filter]?.label || '全部';
    el.textContent = app.filter === 'ALL'
      ? `约 ${n} 个光点 · ${MINERAL_LIST.length - 1} 种矿物`
      : `「${name}」约 ${n} 处示意`;
  }

  function setFilter(key) {
    app.filter = key;
    document.querySelectorAll('#ore-filters button').forEach(b => {
      b.classList.toggle('active', b.dataset.key === key);
    });
    document.querySelectorAll('#ore-legend-list li').forEach(li => {
      li.classList.toggle('active', li.dataset.key === key);
    });
    updateStats();
  }

  function bindFilters() {
    const wrap = document.getElementById('ore-filters');
    const list = document.getElementById('ore-legend-list');
    if (!list) return;
    MINERAL_LIST.forEach(cfg => {
      const li = document.createElement('li');
      li.dataset.key = cfg.key;
      if (cfg.key === 'ALL') li.classList.add('active');
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.style.background = cfg.key === 'ALL'
        ? 'linear-gradient(135deg, #ffd54f, #ff7043, #81d4fa)'
        : (cfg.color || '#fff');
      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = cfg.label;
      li.appendChild(dot);
      li.appendChild(name);
      li.addEventListener('click', () => setFilter(cfg.key));
      list.appendChild(li);
    });
  }

  function showDetail(pt) {
    const box = document.getElementById('ore-detail');
    if (!box) return;
    const mineralName = MINERALS[pt.mineralKey]?.label || '矿物';
    const labels = pt.codes.length
      ? pt.codes.map(c => MINERALS[ORE_CODE_TO_KEY[c]]?.label || c).join('、')
      : mineralName;
    box.innerHTML = `
      <h2>${pt.region}</h2>
      <p>这一带比较常见：${labels}</p>
      <p class="meta">只是大概位置，用来感受分布，不是精确矿坑。</p>
      <button type="button" id="ore-detail-close">关闭</button>
    `;
    box.classList.add('show');
    box.querySelector('#ore-detail-close')?.addEventListener('click', () => box.classList.remove('show'));
  }

  function tryPick(clientX, clientY) {
    let best = null;
    let bestD = Infinity;
    (app.screenPoints || []).forEach(sp => {
      const d = Math.hypot(clientX - sp.sx, clientY - sp.sy);
      if (d < sp.r && d < bestD) {
        bestD = d;
        best = sp.data;
      }
    });
    if (best) showDetail(best);
    else document.getElementById('ore-detail')?.classList.remove('show');
  }

  function applyDragDelta(dx, dy) {
    app.rotY += dx * 0.38;
    app.rotX = Math.max(-58, Math.min(58, app.rotX + dy * 0.3));
  }

  function bindKeyboard() {
    window.addEventListener('keydown', e => {
      if (window.HubKeyboard?.shouldIgnoreGameKey?.(e)) return;
      if (e.target.closest('button')) return;
      const step = e.shiftKey ? 2 : 7;
      let handled = false;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        app.rotY -= step;
        handled = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        app.rotY += step;
        handled = true;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        app.rotX = Math.max(-58, app.rotX - step * 0.55);
        handled = true;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        app.rotX = Math.min(58, app.rotX + step * 0.55);
        handled = true;
      }
      if (handled) e.preventDefault();
    });
  }

  function bindInteraction() {
    const el = app.canvas;
    el.style.touchAction = 'none';

    const onDown = (clientX, clientY, pointerId) => {
      if (pointerId != null) {
        app.pointers.set(pointerId, { x: clientX, y: clientY });
        try {
          el.setPointerCapture(pointerId);
        } catch {
          /* ok */
        }
      }
      app.dragging = true;
      app.dragMoved = false;
      app.dragDist = 0;
      app.lastX = clientX;
      app.lastY = clientY;
    };

    const onMove = (clientX, clientY) => {
      if (!app.dragging) return;
      const dx = clientX - app.lastX;
      const dy = clientY - app.lastY;
      app.lastX = clientX;
      app.lastY = clientY;
      app.dragDist += Math.hypot(dx, dy);
      if (app.dragDist > DRAG_CLICK_MAX) app.dragMoved = true;
      if (app.dragMoved) applyDragDelta(dx, dy);
    };

    const onUp = (clientX, clientY, pointerId) => {
      if (pointerId != null) {
        app.pointers.delete(pointerId);
        try {
          el.releasePointerCapture(pointerId);
        } catch {
          /* ok */
        }
      }
      if (app.dragging && !app.dragMoved) {
        const rect = el.getBoundingClientRect();
        tryPick(clientX - rect.left, clientY - rect.top);
      }
      if (app.pointers.size === 0) app.dragging = false;
    };

    el.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      el.focus({ preventScroll: true });
      onDown(e.clientX, e.clientY, e.pointerId);
    });
    el.addEventListener('pointermove', e => {
      if (!app.pointers.has(e.pointerId) && e.pointerType !== 'mouse') return;
      e.preventDefault();
      onMove(e.clientX, e.clientY);
    });
    el.addEventListener('pointerup', e => {
      e.preventDefault();
      onUp(e.clientX, e.clientY, e.pointerId);
    });
    el.addEventListener('pointercancel', e => {
      onUp(e.clientX, e.clientY, e.pointerId);
    });

    el.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      onDown(e.clientX, e.clientY, null);
    });
    window.addEventListener('mousemove', e => {
      if (!app.dragging || app.pointers.size > 0) return;
      onMove(e.clientX, e.clientY);
    });
    window.addEventListener('mouseup', e => {
      if (!app.dragging || app.pointers.size > 0) return;
      onUp(e.clientX, e.clientY, null);
    });
  }

  function init() {
    app.canvas = document.getElementById('ore-canvas');
    app.stage = document.getElementById('ore-stage');
    if (!app.canvas || !app.stage) return;
    app.ctx = app.canvas.getContext('2d');
    if (!app.ctx) return;

    buildLandDots();
    buildPoints();
    bindFilters();
    bindInteraction();
    bindKeyboard();
    layout();
    window.addEventListener('resize', layout);
    updateStats();
    requestAnimationFrame(() => {
      draw(performance.now());
      dismissLoading();
    });
    requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
