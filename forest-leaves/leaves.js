/**
 * 手绘叶形 · 参考真实树种轮廓（示意，非照片）
 */
const LEAF_SPECIES = {
  maple: {
    id: 'maple',
    name: '枫树',
    latin: 'Acer',
    hint: '掌状裂叶，秋日常变红',
    autumn: '#c62828',
    summer: '#2e7d32',
    draw(ctx, s) {
      ctx.save();
      ctx.scale(s, s);
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(8, -8);
      ctx.lineTo(28, -4);
      ctx.lineTo(10, 6);
      ctx.lineTo(14, 26);
      ctx.lineTo(0, 16);
      ctx.lineTo(-14, 26);
      ctx.lineTo(-10, 6);
      ctx.lineTo(-28, -4);
      ctx.lineTo(-8, -8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(0, 14);
      ctx.stroke();
      ctx.restore();
    },
  },
  sycamore: {
    id: 'sycamore',
    name: '梧桐',
    latin: 'Platanus',
    hint: '叶大如掌，常三浅裂',
    autumn: '#bf360c',
    summer: '#558b2f',
    draw(ctx, s) {
      ctx.save();
      ctx.scale(s, s);
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.quadraticCurveTo(22, -18, 34, 4);
      ctx.quadraticCurveTo(18, 12, 8, 28);
      ctx.lineTo(0, 18);
      ctx.quadraticCurveTo(-18, 12, -34, 4);
      ctx.quadraticCurveTo(-22, -18, 0, -32);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.lineTo(0, 16);
      ctx.moveTo(-12, -4);
      ctx.lineTo(12, 2);
      ctx.moveTo(12, -4);
      ctx.lineTo(-8, 2);
      ctx.stroke();
      ctx.restore();
    },
  },
  ginkgo: {
    id: 'ginkgo',
    name: '银杏',
    latin: 'Ginkgo biloba',
    hint: '扇形叶，秋天金黄',
    autumn: '#f9a825',
    summer: '#7cb342',
    draw(ctx, s) {
      ctx.save();
      ctx.scale(s, s);
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.quadraticCurveTo(26, -8, 22, 18);
      ctx.quadraticCurveTo(8, 26, 0, 22);
      ctx.quadraticCurveTo(-8, 26, -22, 18);
      ctx.quadraticCurveTo(-26, -8, 0, -26);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(0, 18);
      ctx.stroke();
      ctx.restore();
    },
  },
  oak: {
    id: 'oak',
    name: '橡树',
    latin: 'Quercus',
    hint: '叶缘波状 lobes',
    autumn: '#e65100',
    summer: '#33691e',
    draw(ctx, s) {
      ctx.save();
      ctx.scale(s, s);
      const lobes = 6;
      ctx.beginPath();
      for (let i = 0; i < lobes; i += 1) {
        const a0 = (i / lobes) * Math.PI * 2 - Math.PI / 2;
        const a1 = ((i + 0.5) / lobes) * Math.PI * 2 - Math.PI / 2;
        const a2 = ((i + 1) / lobes) * Math.PI * 2 - Math.PI / 2;
        const rOut = 26;
        const rIn = 14;
        if (i === 0) ctx.moveTo(Math.cos(a0) * rOut, Math.sin(a0) * rOut);
        ctx.quadraticCurveTo(Math.cos(a1) * rIn, Math.sin(a1) * rIn, Math.cos(a2) * rOut, Math.sin(a2) * rOut);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    },
  },
  birch: {
    id: 'birch',
    name: '白桦',
    latin: 'Betula',
    hint: '小三角叶，叶缘有锯齿',
    autumn: '#ff8f00',
    summer: '#689f38',
    draw(ctx, s) {
      ctx.save();
      ctx.scale(s, s);
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(16, 20);
      ctx.lineTo(0, 12);
      ctx.lineTo(-16, 20);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(i * 4, -8);
        ctx.lineTo(i * 6, 14);
        ctx.stroke();
      }
      ctx.restore();
    },
  },
  willow: {
    id: 'willow',
    name: '柳树',
    latin: 'Salix',
    hint: '细长柳叶',
    autumn: '#827717',
    summer: '#7cb342',
    draw(ctx, s) {
      ctx.save();
      ctx.scale(s, s);
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(0, 22);
      ctx.stroke();
      ctx.restore();
    },
  },
  camphor: {
    id: 'camphor',
    name: '香樟',
    latin: 'Cinnamomum',
    hint: '革质阔叶，揉碎有香气',
    autumn: '#558b2f',
    summer: '#2e7d32',
    draw(ctx, s) {
      ctx.save();
      ctx.scale(s, s);
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.bezierCurveTo(20, -16, 24, 8, 6, 24);
      ctx.bezierCurveTo(0, 20, -6, 24, -6, 24);
      ctx.bezierCurveTo(-24, 8, -20, -16, 0, -22);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    },
  },
  pine: {
    id: 'pine',
    name: '松树',
    latin: 'Pinus',
    hint: '针叶成束，森林深处常见',
    autumn: '#1b5e20',
    summer: '#1b5e20',
    draw(ctx, s) {
      ctx.save();
      ctx.scale(s, s);
      ctx.lineCap = 'round';
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = ctx.fillStyle;
      const needles = [
        [0, -18, 0, 16],
        [-6, -12, 4, 14],
        [6, -12, -4, 14],
      ];
      needles.forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
      ctx.restore();
    },
  },
};

function leafSeasonColor(spec, season) {
  return season === 'autumn' ? spec.autumn : spec.summer;
}

function drawLeafOnGround(ctx, speciesId, x, y, rot, scale, season) {
  const spec = LEAF_SPECIES[speciesId];
  if (!spec) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = leafSeasonColor(spec, season);
  spec.draw(ctx, scale);
  ctx.restore();
}

function drawLeafIcon(ctx, speciesId, x, y, size, season) {
  const spec = LEAF_SPECIES[speciesId];
  if (!spec) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = leafSeasonColor(spec, season);
  spec.draw(ctx, size / 56);
  ctx.restore();
}
