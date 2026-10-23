/** 森林布局：分区、树、地上落叶 */
const FOREST_WORLD = {
  width: 2400,
  height: 1800,
  season: 'autumn',
  zones: [
    { id: 'entrance', name: '森林入口', x: 80, y: 720, w: 320, h: 280, blurb: '松涛与落叶小径' },
    { id: 'maple', name: '枫林', x: 420, y: 180, w: 520, h: 420, blurb: '枫树叶子像小手掌' },
    { id: 'sycamore', name: '梧桐道', x: 980, y: 320, w: 480, h: 380, blurb: '宽大梧桐叶铺成路' },
    { id: 'ginkgo', name: '银杏谷', x: 1520, y: 140, w: 420, h: 360, blurb: '扇形叶子像小扇子' },
    { id: 'oak', name: '橡树林', x: 200, y: 980, w: 460, h: 400, blurb: '波状叶缘的橡树叶' },
    { id: 'birch', name: '白桦湾', x: 780, y: 920, w: 400, h: 340, blurb: '白树干旁的小三角叶' },
    { id: 'willow', name: '柳岸', x: 1280, y: 880, w: 420, h: 320, blurb: '细长柳叶垂向水面' },
    { id: 'deep', name: '深林', x: 1680, y: 720, w: 520, h: 480, blurb: '香樟与松针混杂' },
  ],
};

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function buildForestTrees() {
  const rand = mulberry32(20260316);
  const trees = [];
  const pickSpecies = zoneId => {
    if (zoneId === 'maple') return 'maple';
    if (zoneId === 'sycamore') return 'sycamore';
    if (zoneId === 'ginkgo') return 'ginkgo';
    if (zoneId === 'oak') return 'oak';
    if (zoneId === 'birch') return 'birch';
    if (zoneId === 'willow') return 'willow';
    if (zoneId === 'deep') return rand() < 0.55 ? 'camphor' : 'pine';
    if (zoneId === 'entrance') return rand() < 0.6 ? 'pine' : 'birch';
    return 'oak';
  };

  FOREST_WORLD.zones.forEach(z => {
    const n = 8 + Math.floor(rand() * 10);
    for (let i = 0; i < n; i += 1) {
      const sp = pickSpecies(z.id);
      trees.push({
        species: sp,
        x: z.x + 40 + rand() * (z.w - 80),
        y: z.y + 40 + rand() * (z.h - 80),
        r: 36 + rand() * 44,
        trunk: 10 + rand() * 8,
      });
    }
  });
  return trees;
}

function buildGroundLeaves(trees, targetCount) {
  const rand = mulberry32(771024);
  const leaves = [];
  for (let i = 0; i < targetCount; i += 1) {
    const tree = trees[Math.floor(rand() * trees.length)];
    const species = tree.species;
    const spread = 55 + rand() * 90;
    const ang = rand() * Math.PI * 2;
    leaves.push({
      id: `L${i}-${Math.floor(rand() * 1e6)}`,
      species,
      x: tree.x + Math.cos(ang) * spread,
      y: tree.y + Math.sin(ang) * spread + 30,
      rot: rand() * Math.PI * 2,
      scale: 0.55 + rand() * 0.45,
      wobble: rand() * Math.PI * 2,
    });
  }
  return leaves;
}

function zoneAt(x, y) {
  return FOREST_WORLD.zones.find(
    z => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h,
  );
}
