/**
 * 慢净 — 风景绘制（Canvas）
 */
const CleanArt = {
  LEVELS: [
    { id: 'lake', name: '湖面晨雾', emoji: '🌅' },
    { id: 'forest', name: '林窗光影', emoji: '🌲' },
    { id: 'rain', name: '雨后天晴', emoji: '🌈' },
    { id: 'flower', name: '窗边白花', emoji: '🤍' },
    { id: 'beach', name: '海边落日', emoji: '🌊' },
    { id: 'snow', name: '雪后小筑', emoji: '❄️' },
    { id: 'terrace', name: '梯田夕照', emoji: '🌾' },
    { id: 'town', name: '古镇河桥', emoji: '🏮' },
    { id: 'lotus', name: '荷塘清夏', emoji: '🪷' },
    { id: 'maple', name: '枫叶山谷', emoji: '🍁' },
    { id: 'cloudpeak', name: '云海上峰', emoji: '⛰️' },
    { id: 'bamboo', name: '竹径听雨', emoji: '🎋' },
  ],

  EGG_LEVELS: [
    { id: 'starry', name: '星窗彩蛋', emoji: '🌠', secret: true },
    { id: 'aurora', name: '极光彩蛋', emoji: '🌌', secret: true },
    { id: 'kitty', name: '猫窗彩蛋', emoji: '🐱', secret: true },
    { id: 'bubble', name: '泡泡彩蛋', emoji: '🫧', secret: true },
    { id: 'koi', name: '锦鲤彩蛋', emoji: '🎏', secret: true },
    { id: 'teahouse', name: '茶亭彩蛋', emoji: '🍵', secret: true },
  ],

  drawScene(ctx, w, h, levelId) {
    switch (levelId) {
      case 'forest': this._forest(ctx, w, h); break;
      case 'rain': this._rain(ctx, w, h); break;
      case 'flower': this._flower(ctx, w, h); break;
      case 'beach': this._beach(ctx, w, h); break;
      case 'snow': this._snow(ctx, w, h); break;
      case 'terrace': this._terrace(ctx, w, h); break;
      case 'town': this._town(ctx, w, h); break;
      case 'lotus': this._lotus(ctx, w, h); break;
      case 'maple': this._maple(ctx, w, h); break;
      case 'cloudpeak': this._cloudpeak(ctx, w, h); break;
      case 'bamboo': this._bamboo(ctx, w, h); break;
      case 'starry': this._starry(ctx, w, h); break;
      case 'aurora': this._aurora(ctx, w, h); break;
      case 'kitty': this._kitty(ctx, w, h); break;
      case 'bubble': this._bubble(ctx, w, h); break;
      case 'koi': this._koi(ctx, w, h); break;
      case 'teahouse': this._teahouse(ctx, w, h); break;
      default: this._lake(ctx, w, h); break;
    }
  },

  _sky(ctx, w, h, top, bottom) {
    const g = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    g.addColorStop(0, top);
    g.addColorStop(1, bottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h * 0.55);
  },

  _lake(ctx, w, h) {
    this._sky(ctx, w, h, '#ffd4a8', '#9ec5e8');
    ctx.fillStyle = '#6a9e72';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.42);
    ctx.quadraticCurveTo(w * 0.3, h * 0.36, w * 0.55, h * 0.4);
    ctx.quadraticCurveTo(w * 0.85, h * 0.44, w, h * 0.38);
    ctx.lineTo(w, h * 0.55);
    ctx.lineTo(0, h * 0.52);
    ctx.closePath();
    ctx.fill();

    const wg = ctx.createLinearGradient(0, h * 0.48, 0, h);
    wg.addColorStop(0, '#5a9fd4');
    wg.addColorStop(0.4, '#3d7fa8');
    wg.addColorStop(1, '#2a5878');
    ctx.fillStyle = wg;
    ctx.fillRect(0, h * 0.48, w, h * 0.52);

    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const y = h * (0.52 + i * 0.06);
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 24) {
        ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 4);
      }
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(255,220,160,0.85)';
    ctx.beginPath();
    ctx.arc(w * 0.78, h * 0.18, Math.min(w, h) * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4a7a52';
    ctx.beginPath();
    ctx.moveTo(w * 0.08, h * 0.48);
    ctx.lineTo(w * 0.12, h * 0.28);
    ctx.lineTo(w * 0.16, h * 0.48);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.88, h * 0.48);
    ctx.lineTo(w * 0.92, h * 0.3);
    ctx.lineTo(w * 0.96, h * 0.48);
    ctx.fill();
  },

  _forest(ctx, w, h) {
    this._sky(ctx, w, h, '#b8dcc8', '#7eb8a0');
    ctx.fillStyle = '#3d5c42';
    for (let i = 0; i < 8; i++) {
      const x = w * (0.05 + i * 0.12);
      const th = h * (0.22 + (i % 3) * 0.06);
      ctx.fillRect(x, h * 0.48 - th, w * 0.04, th);
      ctx.beginPath();
      ctx.moveTo(x - w * 0.03, h * 0.48 - th * 0.7);
      ctx.lineTo(x + w * 0.02, h * 0.48 - th - h * 0.08);
      ctx.lineTo(x + w * 0.07, h * 0.48 - th * 0.7);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = '#2a4030';
    ctx.fillRect(0, h * 0.48, w, h * 0.52);

    const lg = ctx.createRadialGradient(w * 0.55, h * 0.35, 10, w * 0.55, h * 0.35, w * 0.35);
    lg.addColorStop(0, 'rgba(255,248,220,0.55)');
    lg.addColorStop(1, 'rgba(255,248,220,0)');
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.arc((i * 173.7) % w, (i * 97.1) % (h * 0.5), 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  _drawSoftRainbow(ctx, cx, cy, radius, startA, endA) {
    const bands = [
      'rgba(255, 130, 130, 0.22)',
      'rgba(255, 190, 120, 0.20)',
      'rgba(255, 235, 150, 0.18)',
      'rgba(170, 220, 160, 0.18)',
      'rgba(140, 195, 255, 0.20)',
      'rgba(180, 160, 230, 0.18)',
    ];
    const step = Math.max(3, radius * 0.018);
    bands.forEach((color, i) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = step * 1.35;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, radius - i * step, startA, endA);
      ctx.stroke();
    });
  },

  _rain(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.52);
    sky.addColorStop(0, '#7a8fa8');
    sky.addColorStop(0.45, '#b8c9dc');
    sky.addColorStop(1, '#e8dcc8');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h * 0.52);

    const sunGlow = ctx.createRadialGradient(w * 0.72, h * 0.2, 0, w * 0.72, h * 0.2, w * 0.28);
    sunGlow.addColorStop(0, 'rgba(255, 236, 180, 0.75)');
    sunGlow.addColorStop(0.45, 'rgba(255, 220, 150, 0.25)');
    sunGlow.addColorStop(1, 'rgba(255, 220, 150, 0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, w, h * 0.5);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(w * 0.28, h * 0.16, w * 0.14, h * 0.045, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.36, h * 0.14, w * 0.11, h * 0.035, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.62, h * 0.18, w * 0.18, h * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();

    this._drawSoftRainbow(ctx, w * 0.42, h * 0.58, w * 0.34, Math.PI * 1.08, Math.PI * 1.82);

    const hill = ctx.createLinearGradient(0, h * 0.44, 0, h * 0.58);
    hill.addColorStop(0, '#6d8f6a');
    hill.addColorStop(1, '#4f6f52');
    ctx.fillStyle = hill;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.5);
    ctx.quadraticCurveTo(w * 0.25, h * 0.42, w * 0.5, h * 0.46);
    ctx.quadraticCurveTo(w * 0.78, h * 0.5, w, h * 0.44);
    ctx.lineTo(w, h * 0.58);
    ctx.lineTo(0, h * 0.56);
    ctx.closePath();
    ctx.fill();

    const meadow = ctx.createLinearGradient(0, h * 0.56, 0, h);
    meadow.addColorStop(0, '#5a8a62');
    meadow.addColorStop(0.35, '#4a7550');
    meadow.addColorStop(1, '#3a5c40');
    ctx.fillStyle = meadow;
    ctx.fillRect(0, h * 0.56, w, h * 0.44);

    ctx.fillStyle = 'rgba(180, 210, 230, 0.35)';
    for (let i = 0; i < 4; i++) {
      const px = w * (0.18 + i * 0.22);
      const py = h * (0.72 + (i % 2) * 0.06);
      ctx.beginPath();
      ctx.ellipse(px, py, w * 0.06, h * 0.012, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(w * (0.12 + i * 0.11), h * (0.08 + (i % 3) * 0.04), 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  _flower(ctx, w, h) {
    ctx.fillStyle = '#f5ebe0';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#d4c4b0';
    ctx.fillRect(w * 0.08, 0, w * 0.84, h);

    const winG = ctx.createLinearGradient(w * 0.15, h * 0.12, w * 0.85, h * 0.88);
    winG.addColorStop(0, '#a8cce8');
    winG.addColorStop(1, '#6a9ec8');
    ctx.fillStyle = winG;
    ctx.fillRect(w * 0.15, h * 0.12, w * 0.7, h * 0.76);

    ctx.strokeStyle = '#8a7a68';
    ctx.lineWidth = 8;
    ctx.strokeRect(w * 0.15, h * 0.12, w * 0.7, h * 0.76);

    ctx.fillStyle = '#fff';
    for (let i = 0; i < 5; i++) {
      const cx = w * (0.35 + (i % 3) * 0.15);
      const cy = h * (0.35 + Math.floor(i / 3) * 0.25);
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.ellipse(
          cx + Math.cos(a) * 14,
          cy + Math.sin(a) * 14,
          10, 14, a, 0, Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.fillStyle = '#ffe066';
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
    }

    ctx.fillStyle = '#6a5040';
    ctx.fillRect(w * 0.42, h * 0.78, w * 0.16, h * 0.14);
  },

  _beach(ctx, w, h) {
    const sg = ctx.createLinearGradient(0, 0, 0, h * 0.5);
    sg.addColorStop(0, '#ff9a76');
    sg.addColorStop(0.5, '#ffb88a');
    sg.addColorStop(1, '#ffd4a8');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, w, h * 0.5);

    ctx.fillStyle = '#4a9ec8';
    ctx.fillRect(0, h * 0.5, w, h * 0.28);

    ctx.fillStyle = '#e8d4a8';
    ctx.fillRect(0, h * 0.78, w, h * 0.22);

    ctx.fillStyle = 'rgba(255,200,120,0.9)';
    ctx.beginPath();
    ctx.arc(w * 0.72, h * 0.22, Math.min(w, h) * 0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.52);
    for (let x = 0; x <= w; x += 20) {
      ctx.lineTo(x, h * 0.52 + Math.sin(x * 0.03) * 5);
    }
    ctx.stroke();
  },

  _snow(ctx, w, h) {
    this._sky(ctx, w, h, '#c8dce8', '#e8f0f8');
    ctx.fillStyle = '#f0f4f8';
    ctx.fillRect(0, h * 0.42, w, h * 0.58);

    ctx.fillStyle = '#8a9aa8';
    ctx.fillRect(w * 0.35, h * 0.32, w * 0.3, h * 0.22);
    ctx.fillStyle = '#6a4040';
    ctx.beginPath();
    ctx.moveTo(w * 0.32, h * 0.32);
    ctx.lineTo(w * 0.5, h * 0.18);
    ctx.lineTo(w * 0.68, h * 0.32);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(w * 0.42, h * 0.42, w * 0.08, h * 0.12);

    for (let i = 0; i < 40; i++) {
      const sx = (i * 137.5) % w;
      const sy = (i * 97.3) % (h * 0.9);
      ctx.beginPath();
      ctx.arc(sx, sy, 1 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#5a7a62';
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.42);
    ctx.lineTo(w * 0.14, h * 0.28);
    ctx.lineTo(w * 0.18, h * 0.42);
    ctx.fill();
  },

  _starry(ctx, w, h) {
    const night = ctx.createLinearGradient(0, 0, 0, h);
    night.addColorStop(0, '#0f1830');
    night.addColorStop(0.55, '#1a2848');
    night.addColorStop(1, '#2a1e38');
    ctx.fillStyle = night;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 70; i++) {
      const sx = (i * 173.7) % w;
      const sy = (i * 97.1) % (h * 0.72);
      const r = 0.6 + (i % 4) * 0.45;
      ctx.fillStyle = `rgba(255,255,255,${0.35 + (i % 5) * 0.12})`;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const moonGlow = ctx.createRadialGradient(w * 0.78, h * 0.16, 0, w * 0.78, h * 0.16, w * 0.12);
    moonGlow.addColorStop(0, 'rgba(255, 248, 220, 0.95)');
    moonGlow.addColorStop(0.5, 'rgba(255, 248, 220, 0.35)');
    moonGlow.addColorStop(1, 'rgba(255, 248, 220, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(w * 0.78, h * 0.16, w * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff8e8';
    ctx.beginPath();
    ctx.arc(w * 0.78, h * 0.16, w * 0.055, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3d3028';
    ctx.fillRect(w * 0.1, h * 0.08, w * 0.8, h * 0.84);
    ctx.fillStyle = '#1a1420';
    ctx.fillRect(w * 0.16, h * 0.14, w * 0.68, h * 0.72);

    const skyWin = ctx.createLinearGradient(w * 0.16, h * 0.14, w * 0.84, h * 0.86);
    skyWin.addColorStop(0, '#1e2a48');
    skyWin.addColorStop(1, '#2a1840');
    ctx.fillStyle = skyWin;
    ctx.fillRect(w * 0.16, h * 0.14, w * 0.68, h * 0.72);

    for (let i = 0; i < 24; i++) {
      const sx = w * (0.18 + (i * 0.027) % 0.64);
      const sy = h * (0.16 + (i * 0.041) % 0.66);
      ctx.fillStyle = `rgba(255,255,255,${0.5 + (i % 3) * 0.15})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.8 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = '#5c4a38';
    ctx.lineWidth = 6;
    ctx.strokeRect(w * 0.16, h * 0.14, w * 0.68, h * 0.72);
    ctx.strokeStyle = '#8a7460';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.14);
    ctx.lineTo(w * 0.5, h * 0.86);
    ctx.moveTo(w * 0.16, h * 0.5);
    ctx.lineTo(w * 0.84, h * 0.5);
    ctx.stroke();

    const lamp = ctx.createRadialGradient(w * 0.28, h * 0.82, 0, w * 0.28, h * 0.82, w * 0.18);
    lamp.addColorStop(0, 'rgba(255, 200, 120, 0.55)');
    lamp.addColorStop(1, 'rgba(255, 200, 120, 0)');
    ctx.fillStyle = lamp;
    ctx.fillRect(0, h * 0.6, w, h * 0.4);

    ctx.fillStyle = '#6a5040';
    ctx.fillRect(w * 0.22, h * 0.78, w * 0.12, h * 0.14);
    ctx.fillStyle = '#ffe082';
    ctx.fillRect(w * 0.24, h * 0.8, w * 0.08, h * 0.06);

    ctx.font = `700 ${Math.max(11, w * 0.028)}px sans-serif`;
    ctx.fillStyle = 'rgba(255,236,200,0.75)';
    ctx.textAlign = 'center';
    ctx.fillText('最安静的风景', w * 0.5, h * 0.92);
  },

  _aurora(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
    sky.addColorStop(0, '#0a1028');
    sky.addColorStop(1, '#1a2840');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h * 0.7);

    const bands = ['rgba(80,220,160,0.35)', 'rgba(120,180,255,0.28)', 'rgba(200,120,255,0.22)'];
    bands.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, h * (0.18 + i * 0.06));
      for (let x = 0; x <= w; x += 20) {
        ctx.lineTo(x, h * (0.18 + i * 0.06) + Math.sin(x * 0.008 + i) * h * 0.08);
      }
      ctx.lineTo(w, h * 0.45);
      ctx.lineTo(0, h * 0.42);
      ctx.closePath();
      ctx.fill();
    });

    ctx.fillStyle = '#1a3040';
    ctx.fillRect(0, h * 0.62, w, h * 0.38);
    const ice = ctx.createLinearGradient(0, h * 0.62, 0, h);
    ice.addColorStop(0, '#a8c8d8');
    ice.addColorStop(1, '#6090a8');
    ctx.fillStyle = ice;
    ctx.fillRect(0, h * 0.68, w, h * 0.32);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = `700 ${Math.max(11, w * 0.028)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('极光在冰湖上跳舞', w * 0.5, h * 0.9);
  },

  _kitty(ctx, w, h) {
    this._sky(ctx, w, h, '#ffb088', '#8090c0');
    ctx.fillStyle = '#4a3828';
    ctx.fillRect(w * 0.1, h * 0.1, w * 0.8, h * 0.78);
    ctx.fillStyle = '#c8d8e8';
    ctx.fillRect(w * 0.16, h * 0.16, w * 0.68, h * 0.62);
    ctx.strokeStyle = '#6a5040';
    ctx.lineWidth = 5;
    ctx.strokeRect(w * 0.16, h * 0.16, w * 0.68, h * 0.62);

    ctx.fillStyle = '#e89050';
    ctx.beginPath();
    ctx.ellipse(w * 0.62, h * 0.58, w * 0.09, h * 0.045, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.56, h * 0.52);
    ctx.lineTo(w * 0.54, h * 0.46);
    ctx.lineTo(w * 0.58, h * 0.5);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.68, h * 0.52);
    ctx.lineTo(w * 0.7, h * 0.46);
    ctx.lineTo(w * 0.66, h * 0.5);
    ctx.fill();
    ctx.fillStyle = '#2a2030';
    ctx.beginPath();
    ctx.arc(w * 0.59, h * 0.555, 2, 0, Math.PI * 2);
    ctx.arc(w * 0.65, h * 0.555, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,220,160,0.85)';
    ctx.beginPath();
    ctx.arc(w * 0.28, h * 0.28, w * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `700 ${Math.max(11, w * 0.028)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('猫在等日落', w * 0.5, h * 0.92);
  },

  _bubble(ctx, w, h) {
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#d8ecff');
    bg.addColorStop(1, '#f0e8ff');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const colors = ['rgba(120,200,255,0.45)', 'rgba(255,180,220,0.4)', 'rgba(180,255,220,0.38)', 'rgba(255,220,160,0.42)'];
    for (let i = 0; i < 18; i++) {
      const cx = w * (0.08 + (i * 0.053) % 0.84);
      const cy = h * (0.12 + (i * 0.07) % 0.76);
      const r = w * (0.04 + (i % 5) * 0.012);
      const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
      g.addColorStop(0, 'rgba(255,255,255,0.85)');
      g.addColorStop(0.45, colors[i % colors.length]);
      g.addColorStop(1, 'rgba(255,255,255,0.05)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(80,120,160,0.65)';
    ctx.font = `700 ${Math.max(11, w * 0.028)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('泡泡轻轻飘', w * 0.5, h * 0.92);
  },

  _koi(ctx, w, h) {
    ctx.fillStyle = '#3a5868';
    ctx.fillRect(0, 0, w, h * 0.35);
    ctx.fillStyle = '#5a8898';
    ctx.fillRect(0, h * 0.35, w, h * 0.65);

    const wg = ctx.createLinearGradient(0, h * 0.35, 0, h);
    wg.addColorStop(0, '#4a8898');
    wg.addColorStop(1, '#2a5868');
    ctx.fillStyle = wg;
    ctx.fillRect(0, h * 0.35, w, h * 0.65);

    const drawKoi = (cx, cy, color, flip) => {
      ctx.save();
      ctx.translate(cx, cy);
      if (flip) ctx.scale(-1, 1);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.07, h * 0.028, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-w * 0.07, 0);
      ctx.lineTo(-w * 0.1, -h * 0.02);
      ctx.lineTo(-w * 0.1, h * 0.02);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(w * 0.02, -h * 0.008, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    drawKoi(w * 0.35, h * 0.58, '#f07040', false);
    drawKoi(w * 0.62, h * 0.68, '#fff', true);
    drawKoi(w * 0.48, h * 0.78, '#f0a030', false);

    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(w * (0.2 + i * 0.12), h * (0.45 + (i % 2) * 0.05), 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = `700 ${Math.max(11, w * 0.028)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('锦鲤游过水面', w * 0.5, h * 0.92);
  },

  _teahouse(ctx, w, h) {
    this._sky(ctx, w, h, '#c8dce8', '#e8dcc8');
    ctx.fillStyle = '#5a7058';
    ctx.fillRect(0, h * 0.5, w, h * 0.5);

    ctx.fillStyle = '#8a6848';
    ctx.fillRect(w * 0.22, h * 0.38, w * 0.56, h * 0.28);
    ctx.fillStyle = '#6a4030';
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h * 0.38);
    ctx.lineTo(w * 0.5, h * 0.28);
    ctx.lineTo(w * 0.8, h * 0.38);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse(w * (0.38 + i * 0.04), h * (0.62 - i * 0.03), 8, 16, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#c8b090';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.72, w * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6a5040';
    ctx.fillRect(w * 0.46, h * 0.74, w * 0.08, h * 0.04);

    ctx.fillStyle = 'rgba(120,160,100,0.8)';
    ctx.beginPath();
    ctx.arc(w * 0.18, h * 0.62, w * 0.04, 0, Math.PI * 2);
    ctx.arc(w * 0.82, h * 0.64, w * 0.035, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(60,80,50,0.75)';
    ctx.font = `700 ${Math.max(11, w * 0.028)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('茶亭里慢慢喝', w * 0.5, h * 0.9);
  },

  _terrace(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.45);
    sky.addColorStop(0, '#ffb870');
    sky.addColorStop(1, '#ffd8a8');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h * 0.45);

    ctx.fillStyle = 'rgba(255,160,80,0.75)';
    ctx.beginPath();
    ctx.arc(w * 0.78, h * 0.14, w * 0.07, 0, Math.PI * 2);
    ctx.fill();

    const colors = ['#8a9a48', '#7a8a3a', '#6a7a30', '#5a6a28'];
    for (let i = 0; i < 5; i++) {
      const y = h * (0.38 + i * 0.11);
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(0, y + h * 0.08);
      for (let x = 0; x <= w; x += w * 0.08) {
        ctx.lineTo(x, y + Math.sin(x * 0.015 + i) * h * 0.015);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
    }
  },

  _town(ctx, w, h) {
    this._sky(ctx, w, h, '#8098b8', '#c8d4e0');
    ctx.fillStyle = '#607888';
    ctx.fillRect(0, h * 0.55, w, h * 0.45);

    ctx.fillStyle = '#6a5040';
    ctx.fillRect(w * 0.08, h * 0.42, w * 0.18, h * 0.22);
    ctx.fillRect(w * 0.72, h * 0.4, w * 0.2, h * 0.24);
    ctx.fillStyle = '#8a4030';
    ctx.beginPath();
    ctx.moveTo(w * 0.06, h * 0.42);
    ctx.lineTo(w * 0.17, h * 0.32);
    ctx.lineTo(w * 0.28, h * 0.42);
    ctx.fill();

    ctx.strokeStyle = '#5a4030';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.58);
    ctx.quadraticCurveTo(w * 0.5, h * 0.48, w * 0.9, h * 0.56);
    ctx.stroke();

    ctx.fillStyle = '#a06040';
    ctx.fillRect(w * 0.44, h * 0.5, w * 0.12, h * 0.04);

    ctx.fillStyle = '#ff6040';
    ctx.beginPath();
    ctx.arc(w * 0.15, h * 0.48, 6, 0, Math.PI * 2);
    ctx.arc(w * 0.8, h * 0.46, 5, 0, Math.PI * 2);
    ctx.fill();
  },

  _lotus(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.4);
    sky.addColorStop(0, '#a8d8f0');
    sky.addColorStop(1, '#d8ecf8');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h * 0.4);

    ctx.fillStyle = '#4a8868';
    ctx.fillRect(0, h * 0.38, w, h * 0.62);

    ctx.fillStyle = '#3a7058';
    for (let i = 0; i < 8; i++) {
      const cx = w * (0.12 + (i * 0.11) % 0.76);
      const cy = h * (0.55 + (i % 3) * 0.12);
      ctx.beginPath();
      ctx.ellipse(cx, cy, w * 0.06, h * 0.025, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    const drawLotus = (cx, cy, color) => {
      for (let p = 0; p < 6; p++) {
        const a = (p / 6) * Math.PI * 2;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(cx + Math.cos(a) * 10, cy + Math.sin(a) * 8, 9, 14, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ffe066';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
    };
    drawLotus(w * 0.35, h * 0.58, '#f8b4c4');
    drawLotus(w * 0.62, h * 0.68, '#ffc8d8');
    drawLotus(w * 0.48, h * 0.78, '#f0a0b8');
  },

  _maple(ctx, w, h) {
    this._sky(ctx, w, h, '#c8d8e8', '#f0d8c0');
    ctx.fillStyle = '#6a5848';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.5);
    ctx.quadraticCurveTo(w * 0.35, h * 0.38, w * 0.6, h * 0.44);
    ctx.quadraticCurveTo(w * 0.85, h * 0.5, w, h * 0.42);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    const leafColors = ['#d84828', '#e86830', '#c83820', '#f08040'];
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = leafColors[i % leafColors.length];
      const lx = w * ((i * 0.137) % 0.9);
      const ly = h * (0.15 + (i * 0.043) % 0.55);
      ctx.beginPath();
      ctx.ellipse(lx, ly, 5, 8, (i * 0.5) % Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#5a4030';
    ctx.fillRect(w * 0.46, h * 0.44, w * 0.04, h * 0.18);
    ctx.beginPath();
    ctx.arc(w * 0.48, h * 0.4, w * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = '#c84028';
    ctx.fill();
  },

  _cloudpeak(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    sky.addColorStop(0, '#5090d8');
    sky.addColorStop(1, '#b8d8f0');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (let i = 0; i < 4; i++) {
      const cx = w * (0.1 + i * 0.22);
      const cy = h * (0.52 + (i % 2) * 0.06);
      ctx.beginPath();
      ctx.ellipse(cx, cy, w * 0.14, h * 0.035, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#708898';
    ctx.beginPath();
    ctx.moveTo(w * 0.38, h * 0.55);
    ctx.lineTo(w * 0.5, h * 0.18);
    ctx.lineTo(w * 0.62, h * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(w * 0.44, h * 0.28);
    ctx.lineTo(w * 0.5, h * 0.18);
    ctx.lineTo(w * 0.56, h * 0.28);
    ctx.lineTo(w * 0.52, h * 0.32);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillRect(0, h * 0.58, w, h * 0.42);
  },

  _bamboo(ctx, w, h) {
    this._sky(ctx, w, h, '#98b8a8', '#c8dcd0');
    ctx.fillStyle = '#4a6850';
    ctx.fillRect(0, h * 0.45, w, h * 0.55);

    for (let i = 0; i < 7; i++) {
      const x = w * (0.12 + i * 0.12);
      const th = h * (0.35 + (i % 3) * 0.08);
      ctx.strokeStyle = '#3a7848';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x, h * 0.48);
      ctx.lineTo(x, h * 0.48 - th);
      ctx.stroke();
      ctx.strokeStyle = '#4a9858';
      ctx.lineWidth = 2;
      for (let j = 0; j < 3; j++) {
        const ny = h * 0.48 - th * (0.25 + j * 0.28);
        ctx.beginPath();
        ctx.moveTo(x - 12, ny);
        ctx.lineTo(x + 12, ny);
        ctx.stroke();
      }
      ctx.fillStyle = '#5a9860';
      ctx.beginPath();
      ctx.ellipse(x + 14, h * (0.42 - (i % 2) * 0.04), 16, 5, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(200,220,210,0.35)';
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.moveTo(w * (i * 0.09), 0);
      ctx.lineTo(w * (i * 0.09 + 0.02), h * 0.45);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(180,210,200,0.25)';
      ctx.stroke();
    }
  },

  _drawKoiFish(ctx, w, h, cx, cy, color, flip) {
    ctx.save();
    ctx.translate(cx, cy);
    if (flip) ctx.scale(-1, 1);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.07, h * 0.028, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-w * 0.07, 0);
    ctx.lineTo(-w * 0.1, -h * 0.02);
    ctx.lineTo(-w * 0.1, h * 0.02);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(w * 0.02, -h * 0.008, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  _drawKittyCat(ctx, w, h, bounce) {
    const by = bounce || 0;
    const cx = w * 0.62;
    const cy = h * 0.58 + by;
    ctx.fillStyle = '#e89050';
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.09, h * 0.045, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.06, cy - h * 0.06);
    ctx.lineTo(cx - w * 0.08, cy - h * 0.12);
    ctx.lineTo(cx - w * 0.04, cy - h * 0.06);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + w * 0.06, cy - h * 0.06);
    ctx.lineTo(cx + w * 0.08, cy - h * 0.12);
    ctx.lineTo(cx + w * 0.04, cy - h * 0.06);
    ctx.fill();
    ctx.fillStyle = '#2a2030';
    ctx.beginPath();
    ctx.arc(cx - w * 0.03, cy - h * 0.025, 2.5, 0, Math.PI * 2);
    ctx.arc(cx + w * 0.03, cy - h * 0.025, 2.5, 0, Math.PI * 2);
    ctx.fill();
    if (Math.abs(by) > 0.5) {
      ctx.strokeStyle = '#c87040';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx + w * 0.1, cy + h * 0.02, w * 0.04, 0.2, Math.PI * 0.9);
      ctx.stroke();
    }
  },

  drawInteractOverlay(ctx, w, h, levelId, play, now) {
    play.ripples = play.ripples.filter(r => now - r.t < 1600);
    play.ripples.forEach(r => {
      const age = (now - r.t) / 1600;
      ctx.strokeStyle = `rgba(255,255,255,${0.5 * (1 - age)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.maxR * age, 0, Math.PI * 2);
      ctx.stroke();
    });

    play.bubbles = play.bubbles.filter(b => now - b.t < 3200);
    play.bubbles.forEach(b => {
      const age = (now - b.t) / 3200;
      const cy = b.y - age * h * 0.38;
      const r = b.r * (1 + age * 0.4);
      const g = ctx.createRadialGradient(b.x - r * 0.3, cy - r * 0.3, 0, b.x, cy, r);
      g.addColorStop(0, `rgba(255,255,255,${0.85 * (1 - age * 0.7)})`);
      g.addColorStop(0.5, `rgba(180,220,255,${0.45 * (1 - age * 0.7)})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, cy, r, 0, Math.PI * 2);
      ctx.fill();
    });

    play.petals = play.petals.filter(p => now - p.t < 2200);
    play.petals.forEach(p => {
      const age = (now - p.t) / 2200;
      const px = p.x + Math.sin(age * 8) * 12;
      const py = p.y + age * h * 0.22;
      ctx.fillStyle = `rgba(255,255,255,${0.85 * (1 - age)})`;
      ctx.beginPath();
      ctx.ellipse(px, py, 7, 10, p.rot + age * 2, 0, Math.PI * 2);
      ctx.fill();
    });

    play.leaves = play.leaves.filter(l => now - l.t < 2600);
    play.leaves.forEach(l => {
      const age = (now - l.t) / 2600;
      const lx = l.x + Math.sin(age * 6 + l.phase) * 18;
      const ly = l.y + age * h * 0.28;
      ctx.fillStyle = l.color.replace(/[\d.]+\)$/, `${0.9 * (1 - age)})`);
      ctx.beginPath();
      ctx.ellipse(lx, ly, 5, 8, l.rot + age * 3, 0, Math.PI * 2);
      ctx.fill();
    });

    play.motes = play.motes.filter(m => now - m.t < 1800);
    play.motes.forEach(m => {
      const age = (now - m.t) / 1800;
      const mx = m.x + Math.cos(m.angle) * age * 40;
      const my = m.y + Math.sin(m.angle) * age * 40 - age * 20;
      ctx.fillStyle = `rgba(255,248,200,${0.7 * (1 - age)})`;
      ctx.beginPath();
      ctx.arc(mx, my, 2 + (1 - age) * 2, 0, Math.PI * 2);
      ctx.fill();
    });

    play.steam = play.steam.filter(s => now - s.t < 2000);
    play.steam.forEach(s => {
      const age = (now - s.t) / 2000;
      const sy = s.y - age * h * 0.12;
      ctx.fillStyle = `rgba(255,255,255,${0.35 * (1 - age)})`;
      ctx.beginPath();
      ctx.ellipse(s.x + Math.sin(age * 10) * 6, sy, 10 + age * 8, 18 + age * 10, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    if (play.kittyTap && now - play.kittyTap < 900) {
      const bounce = Math.sin((now - play.kittyTap) / 100) * 8 * (1 - (now - play.kittyTap) / 900);
      ctx.fillStyle = '#c8d8e8';
      ctx.fillRect(w * 0.5, h * 0.44, w * 0.22, h * 0.2);
      this._drawKittyCat(ctx, w, h, bounce);
    }

    if (levelId === 'koi' && play.koiDash && now - play.koiDash.t < 2200) {
      const t = (now - play.koiDash.t) / 2200;
      const ease = 1 - Math.pow(1 - t, 2);
      const cx = play.koiDash.x0 + (play.koiDash.x1 - play.koiDash.x0) * ease;
      const cy = play.koiDash.y0 + (play.koiDash.y1 - play.koiDash.y0) * ease;
      this._drawKoiFish(ctx, w, h, cx, cy, play.koiDash.color, play.koiDash.flip);
    }

    if (play.shootStar && now - play.shootStar.t < 1400) {
      const age = (now - play.shootStar.t) / 1400;
      const sx = play.shootStar.x0 + (play.shootStar.x1 - play.shootStar.x0) * age;
      const sy = play.shootStar.y0 + (play.shootStar.y1 - play.shootStar.y0) * age;
      const grad = ctx.createLinearGradient(sx - 30, sy - 10, sx, sy);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(1, `rgba(255,255,255,${0.95 * (1 - age * 0.5)})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sx - 40, sy - 12);
      ctx.lineTo(sx, sy);
      ctx.stroke();
    }

    if (play.sunPulse && now - play.sunPulse < 1200) {
      const age = (now - play.sunPulse) / 1200;
      const pulse = (1 - age) * 0.35;
      const g = ctx.createRadialGradient(play.sunX, play.sunY, 0, play.sunX, play.sunY, w * 0.2 * (1 + age));
      g.addColorStop(0, `rgba(255,220,140,${pulse})`);
      g.addColorStop(1, 'rgba(255,220,140,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h * 0.5);
    }

    if (play.auroraPulse && now - play.auroraPulse < 1500) {
      const age = (now - play.auroraPulse) / 1500;
      ctx.fillStyle = `rgba(100,240,180,${0.22 * (1 - age)})`;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.15);
      for (let x = 0; x <= w; x += 16) {
        ctx.lineTo(x, h * 0.15 + Math.sin(x * 0.012 + age * 4) * h * 0.1);
      }
      ctx.lineTo(w, h * 0.42);
      ctx.lineTo(0, h * 0.38);
      ctx.closePath();
      ctx.fill();
    }

    if (play.lanternPulse && now - play.lanternPulse < 1000) {
      const age = (now - play.lanternPulse) / 1000;
      const g = ctx.createRadialGradient(play.lanternX, play.lanternY, 0, play.lanternX, play.lanternY, 28 + age * 20);
      g.addColorStop(0, `rgba(255,120,80,${0.55 * (1 - age)})`);
      g.addColorStop(1, 'rgba(255,120,80,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(play.lanternX, play.lanternY, 28 + age * 20, 0, Math.PI * 2);
      ctx.fill();
    }

    if (play.snowPuff && now - play.snowPuff < 1100) {
      const age = (now - play.snowPuff) / 1100;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const dist = age * 22;
        ctx.fillStyle = `rgba(255,255,255,${0.8 * (1 - age)})`;
        ctx.beginPath();
        ctx.arc(
          play.snowX + Math.cos(a) * dist,
          play.snowY + Math.sin(a) * dist - age * 10,
          2 + (1 - age) * 2,
          0, Math.PI * 2,
        );
        ctx.fill();
      }
    }

    if (play.rainbowPulse && now - play.rainbowPulse < 1300) {
      const age = (now - play.rainbowPulse) / 1300;
      this._drawSoftRainbow(ctx, w * 0.42, h * 0.58, w * 0.34 * (1 + age * 0.08), Math.PI * 1.08, Math.PI * 1.82);
    }

    if (play.bambooSway && now - play.bambooSway < 1400) {
      const age = (now - play.bambooSway) / 1400;
      const sway = Math.sin(age * Math.PI * 3) * 6 * (1 - age);
      ctx.strokeStyle = `rgba(120,200,140,${0.45 * (1 - age)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(play.bambooX, h * 0.48);
      ctx.quadraticCurveTo(play.bambooX + sway, h * 0.28, play.bambooX + sway * 1.5, h * 0.12);
      ctx.stroke();
    }
  },

  hasActiveOverlay(play, now, levelId) {
    if (play.ripples.length || play.bubbles.length || play.petals.length
      || play.leaves.length || play.motes.length || play.steam.length) return true;
    if (levelId === 'koi' && play.koiDash && now - play.koiDash.t < 2200) return true;
    if (play.kittyTap && now - play.kittyTap < 900) return true;
    if (play.shootStar && now - play.shootStar.t < 1400) return true;
    if (play.sunPulse && now - play.sunPulse < 1200) return true;
    if (play.auroraPulse && now - play.auroraPulse < 1500) return true;
    if (play.lanternPulse && now - play.lanternPulse < 1000) return true;
    if (play.snowPuff && now - play.snowPuff < 1100) return true;
    if (play.rainbowPulse && now - play.rainbowPulse < 1300) return true;
    if (play.bambooSway && now - play.bambooSway < 1400) return true;
    return false;
  },
};
