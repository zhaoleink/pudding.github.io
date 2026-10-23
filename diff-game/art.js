/**
 * 找不同 — 场景绘制
 * draw(ctx, w, h, side)  side: 'left' | 'right'
 */
const DiffArt = {
  LEVELS: [
    { id: 'garden', name: '花鱼小院', emoji: '🌸', intro: '小院几乎一样……慢慢找有几处不一样。' },
    { id: 'lab', name: '实验台', emoji: '🧪', intro: '两张图都是实验台，慢慢对一对。' },
    { id: 'window', name: '窗边风景', emoji: '🪟', intro: '像慢净擦完后的窗景，找细微差别。' },
    { id: 'bubble', name: '泡泡屏', emoji: '🫧', intro: '满屏泡泡，有几颗悄悄变了。' },
    { id: 'market', name: '庙市摊', emoji: '🏮', intro: '摊子上摆得差不多，别漏看角落。' },
    { id: 'sand', name: '静沙盘', emoji: '🏜', intro: '沙盘纹路很像，石头和波纹有出入。' },
  ],

  getDiffs(levelId) {
    return DIFF_SPOTS[levelId] || [];
  },

  draw(levelId, ctx, w, h, side) {
    const fn = SCENES[levelId];
    if (fn) fn(ctx, w, h, side);
  },
};

const DIFF_SPOTS = {
  garden: [
    { id: 'd1', x: 0.78, y: 0.16, r: 0.07, hint: '天上' },
    { id: 'd2', x: 0.22, y: 0.62, r: 0.07, hint: '左边花丛' },
    { id: 'd3', x: 0.52, y: 0.78, r: 0.08, hint: '池塘里' },
    { id: 'd4', x: 0.72, y: 0.52, r: 0.06, hint: '小窗' },
    { id: 'd5', x: 0.38, y: 0.22, r: 0.06, hint: '云朵' },
  ],
  lab: [
    { id: 'd1', x: 0.18, y: 0.72, r: 0.07, hint: '烧杯' },
    { id: 'd2', x: 0.42, y: 0.68, r: 0.07, hint: '锥形瓶' },
    { id: 'd3', x: 0.62, y: 0.75, r: 0.06, hint: '酒精灯' },
    { id: 'd4', x: 0.82, y: 0.35, r: 0.06, hint: '试剂架' },
    { id: 'd5', x: 0.55, y: 0.28, r: 0.06, hint: '上方标签' },
  ],
  window: [
    { id: 'd1', x: 0.75, y: 0.14, r: 0.07, hint: '太阳' },
    { id: 'd2', x: 0.15, y: 0.45, r: 0.07, hint: '远山' },
    { id: 'd3', x: 0.48, y: 0.55, r: 0.08, hint: '湖面' },
    { id: 'd4', x: 0.85, y: 0.48, r: 0.06, hint: '树梢' },
    { id: 'd5', x: 0.32, y: 0.72, r: 0.06, hint: '近处草' },
  ],
  bubble: [
    { id: 'd1', x: 0.25, y: 0.28, r: 0.06, hint: '粉泡' },
    { id: 'd2', x: 0.58, y: 0.42, r: 0.06, hint: '蓝泡' },
    { id: 'd3', x: 0.78, y: 0.62, r: 0.06, hint: '大泡' },
    { id: 'd4', x: 0.35, y: 0.68, r: 0.06, hint: '小泡' },
    { id: 'd5', x: 0.68, y: 0.22, r: 0.06, hint: '顶部' },
  ],
  market: [
    { id: 'd1', x: 0.2, y: 0.35, r: 0.07, hint: '灯笼' },
    { id: 'd2', x: 0.48, y: 0.55, r: 0.07, hint: '果盘' },
    { id: 'd3', x: 0.72, y: 0.42, r: 0.06, hint: '招牌' },
    { id: 'd4', x: 0.38, y: 0.75, r: 0.06, hint: '桌角' },
    { id: 'd5', x: 0.85, y: 0.68, r: 0.06, hint: '布帘' },
  ],
  sand: [
    { id: 'd1', x: 0.22, y: 0.35, r: 0.07, hint: '石头' },
    { id: 'd2', x: 0.55, y: 0.48, r: 0.08, hint: '沙纹' },
    { id: 'd3', x: 0.78, y: 0.32, r: 0.06, hint: '右上' },
    { id: 'd4', x: 0.42, y: 0.72, r: 0.06, hint: '左下纹' },
    { id: 'd5', x: 0.68, y: 0.78, r: 0.06, hint: '右下' },
  ],
};

function sky(ctx, w, h, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, h * 0.55);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

const SCENES = {
  garden(ctx, w, h, side) {
    sky(ctx, w, h, '#b3e5fc', '#e1f5fe');
    ctx.fillStyle = '#a5d6a7';
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    ctx.fillStyle = '#4fc3f7';
    ctx.beginPath();
    ctx.ellipse(w * 0.52, h * 0.78, w * 0.22, h * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    if (side === 'right') {
      ctx.fillStyle = '#ff7043';
      ctx.beginPath();
      ctx.ellipse(w * 0.52, h * 0.76, w * 0.025, h * 0.012, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = side === 'right' ? '#ffeb3b' : '#f48fb1';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(w * (0.18 + i * 0.03), h * 0.6, w * 0.025, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#388e3c';
    ctx.fillRect(w * 0.72, h * 0.35, w * 0.18, h * 0.22);
    ctx.fillStyle = side === 'right' ? '#fff9c4' : '#fff';
    ctx.fillRect(w * 0.76, h * 0.42, w * 0.04, h * 0.05);

    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(w * 0.78, h * 0.16, w * 0.05, 0, Math.PI * 2);
    ctx.fill();

    if (side === 'left') {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(w * 0.38, h * 0.22, w * 0.045, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  lab(ctx, w, h, side) {
    sky(ctx, w, h, '#37474f', '#546e7a');
    ctx.fillStyle = '#78909c';
    ctx.fillRect(0, h * 0.62, w, h * 0.38);

    ctx.fillStyle = '#455a64';
    ctx.fillRect(w * 0.05, h * 0.08, w * 0.9, h * 0.08);

    const beakerL = side === 'right' ? '#81d4fa' : '#4fc3f7';
    ctx.fillStyle = beakerL;
    ctx.fillRect(w * 0.12, h * 0.55, w * 0.12, h * 0.18);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(w * 0.14, h * 0.58, w * 0.03, h * 0.12);

    ctx.fillStyle = side === 'right' ? '#ce93d8' : '#ba68c8';
    ctx.beginPath();
    ctx.moveTo(w * 0.38, h * 0.72);
    ctx.lineTo(w * 0.42, h * 0.52);
    ctx.lineTo(w * 0.48, h * 0.72);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ff7043';
    ctx.fillRect(w * 0.58, h * 0.68, w * 0.06, h * 0.1);
    if (side === 'right') {
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.ellipse(w * 0.61, h * 0.64, w * 0.015, h * 0.025, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = side === 'right' && i === 2 ? '#ef5350' : '#aed581';
      ctx.fillRect(w * 0.78 + i * w * 0.04, h * 0.28, w * 0.025, h * 0.08);
    }

    ctx.fillStyle = '#eceff1';
    ctx.font = `bold ${Math.max(10, w * 0.028)}px sans-serif`;
    ctx.fillText(side === 'right' ? 'B 组' : 'A 组', w * 0.48, h * 0.24);
  },

  window(ctx, w, h, side) {
    ctx.fillStyle = '#efebe9';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(w * 0.06, h * 0.06, w * 0.88, h * 0.88);
    ctx.fillStyle = '#bcaaa4';
    ctx.fillRect(w * 0.1, h * 0.1, w * 0.8, h * 0.8);

    sky(ctx, w, h, side === 'right' ? '#ffcc80' : '#ffd4a8', '#9ec5e8');

    ctx.save();
    ctx.beginPath();
    ctx.rect(w * 0.1, h * 0.1, w * 0.8, h * 0.8);
    ctx.clip();

    ctx.fillStyle = '#6a9e72';
    ctx.fillRect(0, h * 0.42, w, h * 0.2);

    ctx.fillStyle = '#5a9fd4';
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    ctx.fillStyle = side === 'right' ? '#ffab40' : '#ffd54f';
    ctx.beginPath();
    ctx.arc(w * 0.75, h * 0.14, w * 0.06, 0, Math.PI * 2);
    ctx.fill();

    if (side === 'left') {
      ctx.fillStyle = '#558b2f';
      ctx.beginPath();
      ctx.moveTo(w * 0.82, h * 0.42);
      ctx.lineTo(w * 0.88, h * 0.55);
      ctx.lineTo(w * 0.78, h * 0.55);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = side === 'right' ? '#81c784' : '#66bb6a';
    ctx.fillRect(w * 0.28, h * 0.68, w * 0.12, h * 0.08);

    ctx.restore();
  },

  bubble(ctx, w, h, side) {
    sky(ctx, w, h, '#1a237e', '#283593');
    const bubbles = [
      { x: 0.25, y: 0.28, r: 0.07, c: side === 'right' ? '#f48fb1' : '#f8bbd0' },
      { x: 0.58, y: 0.42, r: 0.09, c: side === 'right' ? '#4dd0e1' : '#80deea' },
      { x: 0.78, y: 0.62, r: 0.11, c: '#b39ddb' },
      { x: 0.35, y: 0.68, r: 0.05, c: '#fff59d' },
      { x: 0.68, y: 0.22, r: 0.06, c: '#a5d6a7' },
    ];
    if (side === 'right') bubbles[2].r = 0.08;
    if (side === 'left') bubbles[4].r = 0.045;

    bubbles.forEach(b => {
      ctx.fillStyle = b.c;
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.arc(w * b.x, h * b.y, w * b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  },

  market(ctx, w, h, side) {
    sky(ctx, w, h, '#fce4ec', '#f8bbd0');
    ctx.fillStyle = '#d7ccc8';
    ctx.fillRect(0, h * 0.65, w, h * 0.35);

    ctx.fillStyle = side === 'right' ? '#e53935' : '#c62828';
    ctx.beginPath();
    ctx.arc(w * 0.2, h * 0.32, w * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(w * 0.18, h * 0.32, w * 0.04, h * 0.12);

    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(w * 0.32, h * 0.58, w * 0.36, h * 0.12);
    ctx.fillStyle = side === 'right' ? '#ffb74d' : '#ff9800';
    ctx.beginPath();
    ctx.arc(w * 0.44, h * 0.52, w * 0.025, 0, Math.PI * 2);
    ctx.arc(w * 0.52, h * 0.52, w * 0.025, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5d4037';
    ctx.fillRect(w * 0.68, h * 0.28, w * 0.2, h * 0.08);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.max(10, w * 0.03)}px sans-serif`;
    ctx.fillText(side === 'right' ? '茶' : '货', w * 0.73, h * 0.34);

    if (side === 'right') {
      ctx.fillStyle = '#ef5350';
      ctx.fillRect(w * 0.34, h * 0.72, w * 0.04, h * 0.04);
    }

    ctx.fillStyle = side === 'left' ? '#8d6e63' : '#6d4c41';
    ctx.fillRect(w * 0.82, h * 0.55, w * 0.06, h * 0.18);
  },

  sand(ctx, w, h, side) {
    ctx.fillStyle = '#d4c4a8';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(120, 90, 60, 0.35)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      const y = h * (0.25 + i * 0.08);
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 20) {
        ctx.lineTo(x, y + Math.sin(x * 0.015 + i) * (side === 'right' && i === 3 ? 8 : 5));
      }
      ctx.stroke();
    }

    ctx.fillStyle = '#78909c';
    ctx.beginPath();
    ctx.ellipse(w * 0.22, h * 0.35, w * 0.05, h * 0.025, -0.3, 0, Math.PI * 2);
    ctx.fill();

    if (side === 'right') {
      ctx.fillStyle = '#607d8b';
      ctx.beginPath();
      ctx.arc(w * 0.78, h * 0.32, w * 0.035, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(100, 70, 40, 0.25)';
    ctx.beginPath();
    ctx.arc(w * 0.55, h * 0.48, w * 0.12, 0.5, Math.PI * 1.2);
    ctx.stroke();

    if (side === 'left') {
      ctx.beginPath();
      ctx.arc(w * 0.42, h * 0.72, w * 0.08, Math.PI * 0.2, Math.PI * 0.9);
      ctx.stroke();
    }
  },
};
