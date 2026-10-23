import * as THREE from 'three';

const COMMODITIES = {
  ALL: { label: '全部', codes: [], color: 0xffffff },
  AU: { label: '金', codes: ['AU'], color: 0xffd54f },
  CU: { label: '铜', codes: ['CU'], color: 0xff7043 },
  FE: { label: '铁', codes: ['FE'], color: 0xbcaaa4 },
  AG: { label: '银', codes: ['AG'], color: 0xeceff1 },
  LI: { label: '锂', codes: ['LI'], color: 0x81d4fa },
  U: { label: '铀', codes: ['U'], color: 0xaed581 },
  NI: { label: '镍', codes: ['NI'], color: 0x9575cd },
  ZN: { label: '锌', codes: ['ZN'], color: 0x4dd0e1 },
  PB: { label: '铅', codes: ['PB'], color: 0x90a4ae },
  CO: { label: '钴', codes: ['CO'], color: 0x7986cb },
  MN: { label: '锰', codes: ['MN'], color: 0x8d6e63 },
};

const LONG_PRESS_MS = 380;
const EARTH_RADIUS = 1;
const DEPOSIT_RADIUS = 1.012;
const FETCH_MS = 12000;
const FORCE_ENTER_MS = 5000;

function latLonToVector3(lat, lon, radius) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function parseCodes(codeList) {
  if (!codeList) return [];
  return String(codeList)
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter(Boolean);
}

function primaryCode(codes) {
  const order = ['AU', 'CU', 'FE', 'LI', 'U', 'NI', 'AG', 'ZN', 'PB', 'CO', 'MN'];
  for (const c of order) {
    if (codes.includes(c)) return c;
  }
  return codes[0] || 'OTHER';
}

function commodityLabels(codes) {
  return codes
    .map(c => COMMODITIES[c]?.label || c)
    .filter(Boolean)
    .join('、') || '多种矿物';
}

function geoZonesCount(deposits) {
  return new Set(deposits.map(d => d.region)).size;
}

async function fetchJson(url, ms = FETCH_MS) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: 'force-cache' });
    if (!res.ok) throw new Error(String(res.status));
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

const OreGlobeApp = {
  filter: 'ALL',
  deposits: [],
  meta: null,
  longPressTimer: null,
  rotateArmed: false,
  isDragging: false,
  lastX: 0,
  lastY: 0,
  pointers: new Map(),
  ready: false,

  async init() {
    this.canvas = document.getElementById('ore-canvas');
    this.stage = document.getElementById('ore-stage');
    this.hint = document.getElementById('ore-hint');
    this.detail = document.getElementById('ore-detail');
    this.loading = document.getElementById('ore-loading');
    this.loadingMsg = document.getElementById('ore-loading-msg');
    this.statsEl = document.getElementById('ore-stats');
    if (!this.canvas) return;

    this.bindFilters();
    this.bindDetailClose();
    this.setLoadingMsg('正在启动地球…');

    const watchdog = setTimeout(() => {
      if (!this.ready) this.forceEnter('加载偏慢，先进入地球（矿点稍后补上）');
    }, FORCE_ENTER_MS);

    try {
      this.setupScene();
      this.buildSpaceStars();
      this.buildEarth();
      this.bindInteraction();
      window.addEventListener('resize', () => this.onResize());
      this.onResize();
      this.animate();

      this.setLoadingMsg('正在撒矿带光点…');
      const dataJob = this.loadData();
      await Promise.race([
        dataJob,
        new Promise(resolve => setTimeout(resolve, 3500)),
      ]);
      if (this.deposits.length) this.buildDeposits();
      dataJob.then(() => {
        if (this.deposits.length) this.buildDeposits();
        this.updateStats();
      }).catch(() => {});

      clearTimeout(watchdog);
      this.forceEnter();
    } catch (err) {
      console.error('[OreGlobe]', err);
      clearTimeout(watchdog);
      this.forceEnter('加载出错，已显示基础地球');
    }
  },

  setLoadingMsg(text) {
    if (this.loadingMsg) this.loadingMsg.textContent = text;
  },

  forceEnter(msg) {
    if (this.ready) return;
    this.ready = true;
    if (msg) this.setLoadingMsg(msg);
    this.dismissLoading();
    this.updateStats();
  },

  dismissLoading() {
    if (!this.loading || this.loading.classList.contains('hide')) return;
    this.loading.classList.add('fade-out');
    this.loading.setAttribute('aria-busy', 'false');
    setTimeout(() => {
      this.loading.classList.add('hide');
      window.__oreStopLoadingBoot?.();
    }, 650);
  },

  async loadData() {
    const geo = await fetchJson('ore-globe/ore-zones.json?v=1');
    this.meta = { note: geo.note || '示意矿带' };
    this.deposits = [];
    (geo.zones || []).forEach(z => {
      const codes = (z.codes || []).map(c => String(c).toUpperCase());
      const n = Math.max(4, z.count || 8);
      for (let i = 0; i < n; i += 1) {
        const lat = z.lat + (Math.random() - 0.5) * (z.spread || 8);
        const lon = z.lon + (Math.random() - 0.5) * (z.spread || 8) * 1.15;
        this.deposits.push({
          lon,
          lat,
          name: z.name,
          region: z.name,
          codes,
          primary: primaryCode(codes),
        });
      }
    });
  },

  updateStats() {
    if (!this.statsEl) return;
    const n = this.filteredDeposits().length;
    const total = this.deposits.length;
    if (!total) {
      this.statsEl.textContent = '矿带加载中…';
      return;
    }
    this.statsEl.textContent = `约 ${n} 个光点 · ${geoZonesCount(this.deposits)} 条主要矿带示意`;
  },

  createEarthTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 256;
    const g = c.getContext('2d');
    const ocean = g.createLinearGradient(0, 0, 0, 256);
    ocean.addColorStop(0, '#1565c0');
    ocean.addColorStop(1, '#0d47a1');
    g.fillStyle = ocean;
    g.fillRect(0, 0, 512, 256);

    const land = '#43a047';
    const blobs = [
      [120, 95, 70, 52], [175, 88, 55, 48], [230, 110, 62, 44], [300, 92, 78, 50],
      [380, 100, 52, 40], [420, 130, 36, 28], [90, 145, 48, 36], [145, 150, 42, 30],
      [210, 165, 38, 26], [350, 155, 44, 32], [260, 70, 30, 22],
    ];
    g.fillStyle = land;
    blobs.forEach(([x, y, rw, rh]) => {
      g.beginPath();
      g.ellipse(x, y, rw, rh, 0, 0, Math.PI * 2);
      g.fill();
    });
    g.fillStyle = 'rgba(255,255,255,0.06)';
    for (let i = 0; i < 80; i += 1) {
      g.fillRect(Math.random() * 512, Math.random() * 256, 1, 1);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  },

  buildSpaceStars() {
    const count = 1400;
    const positions = [];
    for (let i = 0; i < count; i += 1) {
      const r = 24 + Math.random() * 18;
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      positions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      );
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xe8f0ff,
      size: 0.06,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    this.spaceStars = new THREE.Points(geom, mat);
    this.scene.add(this.spaceStars);
  },

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x030508);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(0, 0, 2.8);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    this.globeGroup = new THREE.Group();
    this.scene.add(this.globeGroup);

    const amb = new THREE.AmbientLight(0x88aaff, 0.55);
    const sun = new THREE.DirectionalLight(0xffffff, 1.15);
    sun.position.set(4, 2, 5);
    this.scene.add(amb, sun);
  },

  buildEarth() {
    const geo = new THREE.SphereGeometry(EARTH_RADIUS, 40, 40);
    const tex = this.createEarthTexture();
    const mat = new THREE.MeshPhongMaterial({
      map: tex,
      specular: new THREE.Color(0x222222),
      shininess: 8,
    });
    this.earthMesh = new THREE.Mesh(geo, mat);
    this.globeGroup.add(this.earthMesh);

    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS * 1.015, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x6eb5ff,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide,
      }),
    );
    this.globeGroup.add(atmo);
  },

  filteredDeposits() {
    if (this.filter === 'ALL') return this.deposits;
    const codes = COMMODITIES[this.filter]?.codes || [];
    return this.deposits.filter(d => d.codes.some(c => codes.includes(c)));
  },

  buildDeposits() {
    if (!this.globeGroup) return;
    if (this.depositPoints) {
      this.globeGroup.remove(this.depositPoints);
      this.depositPoints.geometry.dispose();
      this.depositPoints.material.dispose();
    }
    const list = this.filteredDeposits();
    const positions = [];
    const colors = [];
    const color = new THREE.Color();
    list.forEach(d => {
      const v = latLonToVector3(d.lat, d.lon, DEPOSIT_RADIUS);
      positions.push(v.x, v.y, v.z);
      const cfg = COMMODITIES[d.primary] || COMMODITIES.CU;
      color.setHex(cfg.color);
      colors.push(color.r, color.g, color.b);
    });

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.026,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    });
    this.depositPoints = new THREE.Points(geom, mat);
    this.globeGroup.add(this.depositPoints);
    this.depositLookup = list;
    this.updateStats();
  },

  bindFilters() {
    const wrap = document.getElementById('ore-filters');
    if (!wrap) return;
    Object.entries(COMMODITIES).forEach(([key, cfg]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = cfg.label;
      btn.dataset.key = key;
      if (key === 'ALL') btn.classList.add('active');
      btn.addEventListener('click', () => {
        wrap.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filter = key;
        this.buildDeposits();
      });
      wrap.appendChild(btn);
    });
  },

  bindDetailClose() {
    const btn = document.getElementById('ore-detail-close');
    btn?.addEventListener('click', () => this.hideDetail());
  },

  hideDetail() {
    this.detail?.classList.remove('show');
  },

  showDetail(d) {
    if (!this.detail) return;
    this.detail.innerHTML = `
      <h2>${d.region || d.name}</h2>
      <p>这一带比较常见：${commodityLabels(d.codes)}</p>
      <p class="meta">只是大概位置，用来感受全球分布，不是精确矿坑。</p>
      <button type="button" id="ore-detail-close">关闭</button>
    `;
    this.detail.classList.add('show');
    this.detail.querySelector('#ore-detail-close')?.addEventListener('click', () => this.hideDetail());
  },

  bindInteraction() {
    const el = this.canvas;
    el.addEventListener('contextmenu', e => e.preventDefault());

    el.addEventListener('pointerdown', e => {
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      el.setPointerCapture(e.pointerId);
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.isDragging = true;
      clearTimeout(this.longPressTimer);
      this.rotateArmed = false;
      this.hint?.classList.remove('rotate-on');
      this.longPressTimer = setTimeout(() => {
        if (this.pointers.size === 1) {
          this.rotateArmed = true;
          if (this.hint) this.hint.textContent = '拖动旋转地球';
          this.hint?.classList.add('rotate-on');
        }
      }, LONG_PRESS_MS);
    });

    el.addEventListener('pointermove', e => {
      if (!this.pointers.has(e.pointerId)) return;
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (!this.rotateArmed && this.pointers.size === 1) {
        const dx = e.clientX - this.lastX;
        const dy = e.clientY - this.lastY;
        if (Math.hypot(dx, dy) > 12) clearTimeout(this.longPressTimer);
      }

      if (this.pointers.size === 2) {
        clearTimeout(this.longPressTimer);
        this.rotateArmed = false;
        this.hint?.classList.remove('rotate-on');
        this.handlePinch();
        return;
      }

      if (!this.rotateArmed || this.pointers.size !== 1) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.globeGroup.rotation.y += dx * 0.005;
      this.globeGroup.rotation.x += dy * 0.005;
      this.globeGroup.rotation.x = THREE.MathUtils.clamp(this.globeGroup.rotation.x, -1.2, 1.2);
    });

    const endPointer = e => {
      this.pointers.delete(e.pointerId);
      if (this.pointers.size === 0) {
        clearTimeout(this.longPressTimer);
        const wasRotate = this.rotateArmed;
        this.rotateArmed = false;
        this.isDragging = false;
        this.hint?.classList.remove('rotate-on');
        if (this.hint) this.hint.textContent = '长按并拖动 · 旋转地球';
        if (!wasRotate && e.type === 'pointerup') this.tryPick(e);
      }
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ok */
      }
    };
    el.addEventListener('pointerup', endPointer);
    el.addEventListener('pointercancel', endPointer);
  },

  handlePinch() {
    const pts = [...this.pointers.values()];
    if (pts.length < 2) return;
    const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    if (!this._pinchStart) {
      this._pinchStart = dist;
      this._camStart = this.camera.position.z;
      return;
    }
    const scale = this._pinchStart / Math.max(1, dist);
    this.camera.position.z = THREE.MathUtils.clamp(this._camStart * scale, 1.6, 4.5);
  },

  tryPick(e) {
    if (!this.depositPoints) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const ndc = new THREE.Vector2(x, y);
    this.raycaster = this.raycaster || new THREE.Raycaster();
    this.raycaster.params.Points.threshold = 0.03;
    this.raycaster.setFromCamera(ndc, this.camera);
    const hits = this.raycaster.intersectObject(this.depositPoints);
    if (!hits.length) {
      this.hideDetail();
      return;
    }
    const idx = hits[0].index;
    const d = this.depositLookup[idx];
    if (d) this.showDetail(d);
  },

  onResize() {
    const w = this.stage?.clientWidth || window.innerWidth;
    const h = this.stage?.clientHeight || window.innerHeight;
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  },

  animate() {
    requestAnimationFrame(() => this.animate());
    if (!this.renderer || !this.scene || !this.camera) return;
    if (this.globeGroup && !this.rotateArmed && this.pointers.size === 0) {
      this.globeGroup.rotation.y += 0.00035;
    }
    this._pinchStart = null;
    this.renderer.render(this.scene, this.camera);
  },
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => OreGlobeApp.init(), { once: true });
} else {
  OreGlobeApp.init();
}
