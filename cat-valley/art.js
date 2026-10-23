/**
 * 妙脆角猫 — 世界坐标绘制（与猫同一比例）
 */
const CatArt = {
  _roundRect(ctx, x, y, rw, rh, rad) {
    const r = Math.min(rad, rw * 0.5, rh * 0.5);
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, rw, rh, r);
      return;
    }
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + rw - r, y);
    ctx.quadraticCurveTo(x + rw, y, x + rw, y + r);
    ctx.lineTo(x + rw, y + rh - r);
    ctx.quadraticCurveTo(x + rw, y + rh, x + rw - r, y + rh);
    ctx.lineTo(x + r, y + rh);
    ctx.quadraticCurveTo(x, y + rh, x, y + rh - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  },

  drawSecretOnlyScene(ctx, view, t, opts) {
    opts = opts || {};
    const { left, top, right, bottom } = view;
    const time = t || 0;
    const sky = ctx.createLinearGradient(left, top, left, bottom);
    sky.addColorStop(0, '#1a237e');
    sky.addColorStop(0.4, '#3949ab');
    sky.addColorStop(1, '#1b5e20');
    ctx.fillStyle = sky;
    ctx.fillRect(left, top, right - left, bottom - top);
    this.drawCatSecretZone(ctx, view, t);
    this.drawSecretRoomExit(ctx, view, t, opts);
    this.drawSecretOrbs(ctx, view, t, opts);
  },

  drawSecretRoomExit(ctx, view, t, opts) {
    const exit = CatWorld.secretRoomExit;
    if (!exit) return;
    const { left, top, right, bottom } = view;
    if (exit.x + exit.r < left || exit.x - exit.r > right || exit.y + exit.r < top || exit.y - exit.r > bottom) return;
    const time = t || 0;
    const near = opts.nearSecretExit;
    const pulse = 0.92 + Math.sin(time * 2.2) * 0.08;
    ctx.fillStyle = near ? 'rgba(129, 212, 250, 0.45)' : 'rgba(129, 212, 250, 0.28)';
    ctx.beginPath();
    ctx.arc(exit.x, exit.y, exit.r * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = near ? 'rgba(100, 181, 246, 0.95)' : 'rgba(100, 181, 246, 0.65)';
    ctx.lineWidth = near ? 4 : 2.5;
    ctx.beginPath();
    ctx.arc(exit.x, exit.y, exit.r * 0.7 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#455a64';
    this._roundRect(ctx, exit.x - 24, exit.y - 30, 48, 56, 6);
    ctx.fill();
    ctx.fillStyle = 'rgba(129, 212, 250, 0.9)';
    ctx.beginPath();
    ctx.arc(exit.x, exit.y - 4, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8eaf6';
    ctx.font = `bold ${Math.max(11, 12 * ValleyCam.zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('← 回猫山谷', exit.x, exit.y - exit.r * 0.72);
    ctx.font = `${Math.max(10, 11 * ValleyCam.zoom)}px sans-serif`;
    ctx.fillText(near ? '走近离开' : '出口', exit.x, exit.y + exit.r * 0.55);
    ctx.textAlign = 'left';
  },

  drawCatSecretZone(ctx, view, t) {
    const r = CatWorld.catSecretRoom;
    if (!r) return;
    const { left, top, right, bottom } = view;
    if (r.x + r.rx < left || r.x - r.rx > right || r.y + r.ry < top || r.y - r.ry > bottom) return;
    const time = t || 0;
    const g = ctx.createRadialGradient(r.x, r.y, r.rx * 0.05, r.x, r.y, r.rx);
    g.addColorStop(0, 'rgba(129, 212, 250, 0.45)');
    g.addColorStop(0.5, 'rgba(102, 187, 106, 0.35)');
    g.addColorStop(1, 'rgba(27, 94, 32, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, r.rx, r.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(129, 212, 250, 0.5)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, r.rx, r.ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#5c6bc0';
    ctx.font = `bold ${Math.max(13, 15 * ValleyCam.zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🚪 秘密小室', r.x, r.y - r.ry * 0.52);
    ctx.font = `${Math.max(10, 11 * ValleyCam.zoom)}px sans-serif`;
    ctx.fillStyle = '#e8eaf6';
    ctx.fillText('上方出口 · 中间光球可收集', r.x, r.y - r.ry * 0.38);
    ctx.textAlign = 'left';
    for (let i = 0; i < 10; i++) {
      const a = time * 0.6 + i * 0.9;
      const sx = r.x + Math.cos(a) * (r.rx * 0.55);
      const sy = r.y + Math.sin(a * 1.2) * (r.ry * 0.4);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.arc(sx, sy, 2 + Math.sin(time * 3 + i), 0, Math.PI * 2);
      ctx.fill();
    }
  },

  drawSecretOrbs(ctx, view, t, opts) {
    const found = opts.secretOrbsFound || {};
    const time = t || 0;
    const { left, top, right, bottom } = view;
    (CatWorld.secretOrbs || []).forEach(orb => {
      if (found[orb.id]) return;
      if (orb.x < left - 40 || orb.x > right + 40 || orb.y < top - 40 || orb.y > bottom + 40) return;
      const pulse = 0.85 + Math.sin(time * 2.4 + orb.x * 0.01) * 0.15;
      const g = ctx.createRadialGradient(orb.x, orb.y, 4, orb.x, orb.y, 28 * pulse);
      g.addColorStop(0, '#fff9c4');
      g.addColorStop(0.5, '#81d4fa');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, 28 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `${Math.max(12, 13 * ValleyCam.zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('✨', orb.x, orb.y + 4);
      ctx.textAlign = 'left';
    });
  },

  drawSecretGate(ctx, view, t, opts) {
    const gate = CatWorld.secretGate;
    if (!gate) return;
    const { left, top, right, bottom } = view;
    if (gate.x + gate.r < left || gate.x - gate.r > right || gate.y + gate.r < top || gate.y - gate.r > bottom) return;
    const time = t || 0;
    const near = opts.nearSecretGate;
    const found = opts.secretGateFound;
    const alpha = found ? 0.85 : near ? 0.55 : 0.28;
    const pulse = 0.9 + Math.sin(time * 1.8) * 0.1;
    ctx.fillStyle = `rgba(129, 212, 250, ${alpha * 0.35})`;
    ctx.beginPath();
    ctx.arc(gate.x, gate.y, gate.r * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(100, 181, 246, ${alpha})`;
    ctx.lineWidth = near ? 4 : 2;
    ctx.beginPath();
    ctx.arc(gate.x, gate.y, gate.r * 0.72 * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#37474f';
    this._roundRect(ctx, gate.x - 22, gate.y - 28, 44, 52, 6);
    ctx.fill();
    ctx.fillStyle = `rgba(129, 212, 250, ${alpha})`;
    ctx.beginPath();
    ctx.arc(gate.x, gate.y - 4, 14, 0, Math.PI * 2);
    ctx.fill();
    const showLabel = near || found || opts.hintSecretGate;
    if (showLabel) {
      ctx.fillStyle = '#e3f2fd';
      ctx.font = `${Math.max(10, 11 * ValleyCam.zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(found ? '🚪 秘密通道' : '🚪 秘密通道？', gate.x, gate.y - gate.r * 0.85);
      if (near || found) ctx.fillText('走进去', gate.x, gate.y + gate.r * 0.55);
      else ctx.fillText('淡蓝圆门', gate.x, gate.y + gate.r * 0.55);
      ctx.textAlign = 'left';
    }
  },

  drawSecretDirectionHint(ctx, vw, vh, catWx, catWy) {
    const gate = CatWorld.secretGate;
    if (!gate) return;
    const dx = gate.x - catWx;
    const dy = gate.y - catWy;
    const d = Math.hypot(dx, dy);
    if (d < CatSecret.DISCOVER_RADIUS) return;
    const angle = Math.atan2(dy, dx);
    const cx = vw * 0.5 + Math.cos(angle) * Math.min(vw, vh) * 0.36;
    const cy = vh * 0.42 + Math.sin(angle) * Math.min(vw, vh) * 0.36;
    ctx.save();
    ctx.fillStyle = 'rgba(126, 87, 194, 0.92)';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    this._roundRect(ctx, cx - 58, cy - 22, 116, 44, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚪 秘密通道', cx, cy - 2);
    ctx.font = '10px sans-serif';
    ctx.fillText('这个方向', cx, cy + 12);
    ctx.textAlign = 'left';
    ctx.restore();
  },

  drawTreasureOnlyScene(ctx, view, t, opts) {
    opts = opts || {};
    const { left, top, right, bottom } = view;
    const time = t || 0;
    const sky = ctx.createLinearGradient(left, top, left, bottom);
    sky.addColorStop(0, '#3e2723');
    sky.addColorStop(0.35, '#5d4037');
    sky.addColorStop(1, '#8d6e63');
    ctx.fillStyle = sky;
    ctx.fillRect(left, top, right - left, bottom - top);
    [[0.15, 0.2, '#ffd54f'], [0.82, 0.25, '#ffb74d'], [0.5, 0.65, '#fff8e1']].forEach(([fx, fy, col]) => {
      const cx = left + (right - left) * fx;
      const cy = top + (bottom - top) * fy;
      const pulse = 0.7 + Math.sin(time * 0.9 + fx * 6) * 0.15;
      const g = ctx.createRadialGradient(cx, cy, 6, cx, cy, 90 * pulse);
      g.addColorStop(0, col);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, 90 * pulse, 0, Math.PI * 2);
      ctx.fill();
    });
    this.drawCatTreasureZone(ctx, view, t);
    this.drawTreasureChests(ctx, view, t, { ...opts, inTreasureRoom: true });
  },

  drawCatTreasureZone(ctx, view, t) {
    const r = CatWorld.catTreasureRoom;
    if (!r) return;
    const { left, top, right, bottom } = view;
    if (r.x + r.rx < left || r.x - r.rx > right || r.y + r.ry < top || r.y - r.ry > bottom) return;
    const time = t || 0;

    const g = ctx.createRadialGradient(r.x, r.y, r.rx * 0.06, r.x, r.y, r.rx);
    g.addColorStop(0, 'rgba(255, 224, 130, 0.55)');
    g.addColorStop(0.45, 'rgba(255, 183, 77, 0.38)');
    g.addColorStop(0.75, 'rgba(141, 110, 63, 0.42)');
    g.addColorStop(1, 'rgba(62, 39, 35, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, r.rx, r.ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 193, 7, 0.55)';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 7]);
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, r.rx, r.ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ffb300';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(r.x - 110, r.y - r.ry * 0.58);
    ctx.lineTo(r.x - 110, r.y - r.ry * 0.58 - 78);
    ctx.quadraticCurveTo(r.x, r.y - r.ry * 0.58 - 112, r.x + 110, r.y - r.ry * 0.58 - 78);
    ctx.lineTo(r.x + 110, r.y - r.ry * 0.58);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.max(14, 16 * ValleyCam.zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('妙脆角猫寻宝屋', r.x, r.y - r.ry * 0.58 - 40);
    ctx.font = `${Math.max(11, 12 * ValleyCam.zoom)}px sans-serif`;
    ctx.fillText('📦 走近木箱自动开启', r.x, r.y - r.ry * 0.58 - 22);
    ctx.textAlign = 'left';

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + time * 0.15;
      const dist = r.rx * (0.35 + (i % 3) * 0.12);
      const sx = r.x + Math.cos(a) * dist;
      const sy = r.y + Math.sin(a) * dist * 0.75;
      if (sx < left - 20 || sx > right + 20) continue;
      ctx.fillStyle = i % 2 ? 'rgba(255, 215, 64, 0.35)' : 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(sx, sy, 4 + Math.sin(time * 2 + i) * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  drawParadiseOnlyScene(ctx, view, t, opts) {
    opts = opts || {};
    const { left, top, right, bottom } = view;
    const sky = ctx.createLinearGradient(left, top, left, bottom);
    sky.addColorStop(0, '#ffd6ef');
    sky.addColorStop(0.45, '#fff0f8');
    sky.addColorStop(1, '#fff8e1');
    ctx.fillStyle = sky;
    ctx.fillRect(left, top, right - left, bottom - top);
    [[0.2, 0.18, '#fff'], [0.75, 0.22, '#ffe0f0'], [0.55, 0.72, '#e3f2fd']].forEach(([fx, fy, col]) => {
      const cx = left + (right - left) * fx;
      const cy = top + (bottom - top) * fy;
      const g = ctx.createRadialGradient(cx, cy, 8, cx, cy, 120);
      g.addColorStop(0, col);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, 120, 0, Math.PI * 2);
      ctx.fill();
    });
    this.drawCatParadiseZone(ctx, view, t, { indoor: true });
    this.drawParadiseToys(ctx, view, t, opts);
  },

  drawCatParadiseZone(ctx, view, t, zoneOpts) {
    zoneOpts = zoneOpts || {};
    const p = CatWorld.catParadise;
    if (!p) return;
    const { left, top, right, bottom } = view;
    if (p.x + p.rx < left || p.x - p.rx > right || p.y + p.ry < top || p.y - p.ry > bottom) return;

    const time = t || 0;
    const g = ctx.createRadialGradient(p.x, p.y, p.rx * 0.08, p.x, p.y, p.rx);
    g.addColorStop(0, 'rgba(255, 240, 180, 0.5)');
    g.addColorStop(0.45, 'rgba(255, 182, 220, 0.38)');
    g.addColorStop(0.75, 'rgba(180, 220, 255, 0.32)');
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2);
    ctx.fill();

    const stripeN = 14;
    for (let i = 0; i < stripeN; i++) {
      const a0 = (i / stripeN) * Math.PI * 2;
      const a1 = ((i + 0.45) / stripeN) * Math.PI * 2;
      ctx.fillStyle = i % 2 ? 'rgba(255, 105, 180, 0.08)' : 'rgba(100, 200, 255, 0.08)';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.arc(p.x, p.y, p.rx * 0.92, a0, a1);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(255, 105, 180, 0.55)';
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (zoneOpts.indoor) {
      ctx.fillStyle = '#ff4081';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.x - 100, p.y - p.ry * 0.55);
      ctx.lineTo(p.x - 100, p.y - p.ry * 0.55 - 80);
      ctx.quadraticCurveTo(p.x, p.y - p.ry * 0.55 - 118, p.x + 100, p.y - p.ry * 0.55 - 80);
      ctx.lineTo(p.x + 100, p.y - p.ry * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.max(14, 16 * ValleyCam.zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('妙脆角猫游乐园', p.x, p.y - p.ry * 0.55 - 42);
      ctx.font = `${Math.max(11, 12 * ValleyCam.zoom)}px sans-serif`;
      ctx.fillText('🎡 欢迎来玩', p.x, p.y - p.ry * 0.55 - 24);
      ctx.textAlign = 'left';
    }

    const balloons = [
      [p.x - p.rx * 0.75, p.y - p.ry * 0.35, '#ff6eb4'],
      [p.x + p.rx * 0.7, p.y - p.ry * 0.4, '#64b5f6'],
      [p.x, p.y - p.ry * 0.82, '#ffd54f'],
    ];
    balloons.forEach(([bx, by, col], i) => {
      const bob = Math.sin(time * 0.72 + i * 1.4) * 6;
      const sway = Math.sin(time * 0.48 + i * 0.9) * 4;
      ctx.strokeStyle = 'rgba(80,80,80,0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bx + sway, by + bob + 16);
      ctx.lineTo(bx + sway + 4, by + bob + 36);
      ctx.stroke();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(bx + sway, by + bob, 14, 17, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  },

  drawParadiseToys(ctx, view, t, opts) {
    opts = opts || {};
    const { left, top, right, bottom } = view;
    const time = t || 0;
    (CatWorld.catParadiseToys || []).forEach(toy => {
      if (toy.x < left - 120 || toy.x > right + 120 || toy.y < top - 120 || toy.y > bottom + 120) return;
      if (toy.kind === 'tramp') {
        const breathe = 0.9 + Math.sin(time * 0.95) * 0.045;
        ctx.fillStyle = '#42a5f5';
        ctx.strokeStyle = '#1565c0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(toy.x, toy.y, toy.r, toy.r * breathe, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = `${Math.max(12, 13 * ValleyCam.zoom)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('蹦', toy.x, toy.y + 5);
        ctx.textAlign = 'left';
      } else if (toy.kind === 'slide') {
        ctx.fillStyle = '#ff7043';
        ctx.strokeStyle = '#e64a19';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(toy.x - toy.w * 0.4, toy.y - 20);
        ctx.lineTo(toy.x2 + toy.w * 0.35, toy.y2 - 30);
        ctx.lineTo(toy.x2 + toy.w * 0.35, toy.y2 + toy.w * 0.35);
        ctx.lineTo(toy.x - toy.w * 0.4, toy.y + toy.w * 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fillRect(toy.x - 8, toy.y - 28, 16, 22);
        ctx.fillStyle = '#fff';
        ctx.font = `${Math.max(11, 12 * ValleyCam.zoom)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('滑', (toy.x + toy.x2) * 0.5, (toy.y + toy.y2) * 0.5);
        ctx.textAlign = 'left';
      } else if (toy.kind === 'spin') {
        ctx.save();
        ctx.translate(toy.x, toy.y);
        ctx.rotate(time * 0.28);
        ctx.fillStyle = 'rgba(255, 213, 79, 0.35)';
        ctx.strokeStyle = '#f9a825';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, toy.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          ctx.fillStyle = i % 2 ? '#ef5350' : '#42a5f5';
          ctx.beginPath();
          ctx.arc(Math.cos(a) * toy.r * 0.65, Math.sin(a) * toy.r * 0.65, 16, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        ctx.fillStyle = '#fff';
        ctx.font = `${Math.max(11, 12 * ValleyCam.zoom)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('转', toy.x, toy.y + 5);
        ctx.textAlign = 'left';
      } else if (toy.kind === 'photo') {
        ctx.fillStyle = '#fff8e1';
        ctx.strokeStyle = '#ff6f00';
        ctx.lineWidth = 4;
        ctx.beginPath();
        this._roundRect(ctx, toy.x - toy.w * 0.5, toy.y - toy.h * 0.5, toy.w, toy.h, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#e65100';
        ctx.font = `bold ${Math.max(11, 12 * ValleyCam.zoom)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('📸 打卡墙', toy.x, toy.y - 4);
        ctx.font = `${Math.max(9, 10 * ValleyCam.zoom)}px sans-serif`;
        ctx.fillText('点我摆 pose', toy.x, toy.y + 12);
        ctx.textAlign = 'left';
      } else if (toy.kind === 'sdisplay') {
        const glow = opts.sdisplayGlow;
        const pulse = 0.55 + Math.sin(time * 1.6) * 0.18;
        if (glow) {
          const rg = ctx.createRadialGradient(toy.x, toy.y - 8, 8, toy.x, toy.y - 8, toy.r * 1.6);
          rg.addColorStop(0, `rgba(255, 215, 64, ${0.55 * pulse})`);
          rg.addColorStop(0.5, `rgba(255, 105, 180, ${0.28 * pulse})`);
          rg.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.arc(toy.x, toy.y - 8, toy.r * 1.55, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = glow ? '#ffd54f' : '#e0e0e0';
        ctx.strokeStyle = glow ? '#ff8f00' : '#9e9e9e';
        ctx.lineWidth = glow ? 4 : 3;
        ctx.beginPath();
        ctx.ellipse(toy.x, toy.y + 18, toy.r * 0.95, toy.r * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = glow ? '#fff8e1' : '#fafafa';
        ctx.strokeStyle = glow ? '#ffb300' : '#bdbdbd';
        ctx.lineWidth = 3;
        ctx.beginPath();
        this._roundRect(ctx, toy.x - toy.r * 0.55, toy.y - toy.r * 0.35, toy.r * 1.1, toy.r * 0.55, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = glow ? '#e65100' : '#757575';
        ctx.font = `bold ${Math.max(11, 12 * ValleyCam.zoom)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('✨ S 展示台', toy.x, toy.y - toy.r * 0.08);
        ctx.font = `${Math.max(9, 10 * ValleyCam.zoom)}px sans-serif`;
        ctx.fillText(glow ? `展示 ${glow.name}` : '穿 S 级皮肤站上来', toy.x, toy.y + toy.r * 0.22);
        ctx.textAlign = 'left';
      }
    });
  },

  drawTreasureChests(ctx, view, t, opts) {
    if (!opts.inTreasureRoom) return;
    const found = opts.treasuresFound || {};
    const time = t || 0;
    const { left, top, right, bottom } = view;
    (CatWorld.treasureChests || []).forEach(chest => {
      if (found[chest.id]) return;
      if (chest.x < left - 60 || chest.x > right + 60 || chest.y < top - 60 || chest.y > bottom + 60) return;
      const bob = Math.sin(time * 2.2 + chest.x * 0.01) * 3;
      const cx = chest.x;
      const cy = chest.y + bob;
      ctx.fillStyle = 'rgba(255, 193, 7, 0.22)';
      ctx.beginPath();
      ctx.arc(cx, cy + 6, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8d6e63';
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = 2;
      ctx.beginPath();
      this._roundRect(ctx, cx - 18, cy - 8, 36, 24, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffd54f';
      ctx.fillRect(cx - 18, cy - 2, 36, 5);
      ctx.strokeStyle = '#ffb300';
      ctx.strokeRect(cx - 18, cy - 2, 36, 5);
      ctx.fillStyle = '#fff';
      ctx.font = `${Math.max(14, 15 * ValleyCam.zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('📦', cx, cy - 14);
      ctx.font = `${Math.max(9, 10 * ValleyCam.zoom)}px sans-serif`;
      ctx.fillStyle = 'rgba(60, 40, 10, 0.85)';
      ctx.fillText(`+${chest.coins}`, cx, cy + 22);
      ctx.textAlign = 'left';
    });
  },

  _streamSamples(points, step = 52) {
    const out = [];
    if (!points || points.length < 2) return out;
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const len = Math.hypot(dx, dy);
      const n = Math.max(1, Math.floor(len / step));
      for (let j = 0; j < n; j++) {
        const u = j / n;
        out.push({ x: a[0] + dx * u, y: a[1] + dy * u });
      }
    }
    const last = points[points.length - 1];
    out.push({ x: last[0], y: last[1] });
    return out;
  },

  _traceStream(ctx, points) {
    ctx.beginPath();
    points.forEach((p, i) => (i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1])));
  },

  _drawStreamSpring(ctx, x, y, w, t) {
    const time = t || 0;
    const rockN = 10;
    for (let i = 0; i < rockN; i++) {
      const ang = (i / rockN) * Math.PI * 2 + 0.12;
      const rr = w * (1.08 + (i % 3) * 0.07);
      const rx = x + Math.cos(ang) * rr;
      const ry = y + Math.sin(ang) * rr * 0.7;
      const rs = w * (0.2 + (i % 4) * 0.035);
      ctx.fillStyle = i % 2 ? '#8a9099' : '#6e737c';
      ctx.beginPath();
      ctx.ellipse(rx, ry, rs * 1.12, rs * 0.82, ang * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.14)';
      ctx.beginPath();
      ctx.ellipse(rx - rs * 0.15, ry - rs * 0.22, rs * 0.32, rs * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    const g = ctx.createRadialGradient(x, y, w * 0.04, x, y, w * 1.15);
    g.addColorStop(0, 'rgba(235, 248, 255, 0.98)');
    g.addColorStop(0.4, 'rgba(120, 195, 240, 0.6)');
    g.addColorStop(1, 'rgba(66, 165, 245, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, w * 1.08, w * 0.84, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let b = 0; b < 5; b++) {
      const phase = time * 2.6 + b * 1.55;
      const bx = x + Math.cos(phase) * w * 0.2;
      const by = y + Math.sin(phase * 1.25) * w * 0.14 - (Math.sin(phase * 2.1) * 0.5 + 0.5) * w * 0.18;
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.arc(bx, by, w * (0.05 + (b % 2) * 0.015), 0, Math.PI * 2);
      ctx.fill();
    }
  },

  _drawStreams(ctx, view, t) {
    const { left, top, right, bottom } = view;
    const time = t || 0;
    (CatWorld.streams || []).forEach((stream, si) => {
      const pts = stream.points;
      if (!pts || pts.length < 2) return;
      const mid = pts[Math.floor(pts.length / 2)] || pts[0];
      if (mid[0] + stream.w * 4 < left || mid[0] - stream.w * 4 > right) return;
      if (mid[1] + stream.w * 4 < top || mid[1] - stream.w * 4 > bottom) return;
      const biomeId = CatWorld.biomeAt(mid[0], mid[1]).id;
      if (biomeId === 'desert') return;

      const w = stream.w;
      const deep = biomeId === 'snow' ? '#4a8fc8' : '#1976d2';
      const midC = biomeId === 'snow' ? '#7eb8e8' : '#42a5f5';
      const shine = 'rgba(220, 240, 255, 0.82)';

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.strokeStyle = 'rgba(25, 70, 110, 0.2)';
      ctx.lineWidth = w * 1.38;
      this._traceStream(ctx, pts);
      ctx.stroke();

      ctx.globalAlpha = biomeId === 'forest' ? 0.7 : 0.84;
      ctx.strokeStyle = midC;
      ctx.lineWidth = w;
      this._traceStream(ctx, pts);
      ctx.stroke();

      ctx.globalAlpha = 0.38;
      ctx.strokeStyle = deep;
      ctx.lineWidth = w * 0.42;
      this._traceStream(ctx, pts);
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = shine;
      ctx.lineWidth = w * 0.26;
      ctx.globalAlpha = 0.58;
      ctx.setLineDash([16, 28]);
      ctx.lineDashOffset = -(time * 100 + si * 36);
      this._traceStream(ctx, pts);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      const samples = this._streamSamples(pts, 54);
      if (samples.length > 2) {
        const flowBase = (time * 75 + si * 90) % samples.length;
        for (let k = 0; k < 6; k++) {
          const idx = Math.floor((flowBase + k * (samples.length / 6)) % samples.length);
          const sp = samples[idx];
          if (sp.x < left - 24 || sp.x > right + 24 || sp.y < top - 24 || sp.y > bottom + 24) continue;
          const tw = 0.45 + Math.sin(time * 4.5 + k + si) * 0.55;
          ctx.globalAlpha = 0.3 + tw * 0.5;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(sp.x, sp.y - w * 0.06, w * 0.11, w * 0.055, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      pts.forEach((p, pi) => {
        if (pi === 0 || pi === pts.length - 1) return;
        if (pi % 2 !== 0) return;
        for (let r = 0; r < 2; r++) {
          const h = CatWorld._hash(si * 19 + pi, r * 29);
          const side = r === 0 ? -1 : 1;
          const nx = p[0] + side * w * (0.72 + h * 0.28);
          const ny = p[1] + (h - 0.5) * w * 0.35;
          if (nx < left - 28 || nx > right + 28) continue;
          const rs = w * (0.13 + h * 0.11);
          ctx.fillStyle = h > 0.55 ? '#828892' : '#6a707a';
          ctx.beginPath();
          ctx.ellipse(nx, ny, rs * 1.1, rs * 0.88, h * 3.1, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      const head = pts[0];
      if (head[0] + w * 5 >= left && head[0] - w * 5 <= right && head[1] + w * 5 >= top && head[1] - w * 5 <= bottom) {
        this._drawStreamSpring(ctx, head[0], head[1], w, time);
      }
    });
  },

  _drawTerrain(ctx, view) {
    const { left, top, right, bottom } = view;
    const terrain = CatWorld.buildTerrain();
    const tw = terrain.width;
    const th = terrain.height;
    const sx = left / CatWorld.W * tw;
    const sy = top / CatWorld.H * th;
    const sw = (right - left) / CatWorld.W * tw;
    const sh = (bottom - top) / CatWorld.H * th;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(terrain, sx, sy, sw, sh, left, top, right - left, bottom - top);
  },

  drawWorld(ctx, view, t, opts) {
    opts = opts || {};
    if (opts.secretOnly) {
      this.drawSecretOnlyScene(ctx, view, t, opts);
      return;
    }
    if (opts.treasureOnly) {
      this.drawTreasureOnlyScene(ctx, view, t, opts);
      return;
    }
    if (opts.paradiseOnly) {
      this.drawParadiseOnlyScene(ctx, view, t, opts);
      return;
    }
    const { left, top, right, bottom } = view;
    const camX = ValleyCam.x;
    const camY = ValleyCam.y;

    const skyTop = CatWorld.biomeMixColor(camX, camY - 400, 'skyTop');
    const skyBot = CatWorld.biomeMixColor(camX, camY + 200, 'skyBot');
    const sky = ctx.createLinearGradient(left, top, left, bottom);
    sky.addColorStop(0, skyTop);
    sky.addColorStop(0.62, skyBot);
    sky.addColorStop(1, CatWorld.biomeMixColor(camX, camY + 600, 'ground'));
    ctx.fillStyle = sky;
    ctx.fillRect(left, top, right - left, bottom - top);

    const horizon = top + (bottom - top) * 0.34;
    ctx.fillStyle = CatWorld.biomeMixColor(camX, camY, 'ground');
    ctx.fillRect(left, horizon, right - left, bottom - horizon);

    this._drawTerrain(ctx, view);

    (CatWorld.leafPatches || []).forEach(p => {
      if (!CatWorld.propFitsBiome(p.x, p.y, ['leafwood'])) return;
      if (p.x + p.r < left || p.x - p.r > right || p.y + p.r < top || p.y - p.r > bottom) return;
      const g = ctx.createRadialGradient(p.x, p.y, p.r * 0.08, p.x, p.y, p.r);
      g.addColorStop(0, 'rgba(255, 193, 7, 0.42)');
      g.addColorStop(0.55, 'rgba(255, 160, 0, 0.18)');
      g.addColorStop(1, 'rgba(200, 140, 40, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    (CatWorld.osmanthusPatches || []).forEach(p => {
      if (!CatWorld.propFitsBiome(p.x, p.y, ['osmanthus'])) return;
      if (p.x + p.r < left || p.x - p.r > right || p.y + p.r < top || p.y - p.r > bottom) return;
      const g = ctx.createRadialGradient(p.x, p.y, p.r * 0.06, p.x, p.y, p.r);
      g.addColorStop(0, 'rgba(255, 220, 120, 0.38)');
      g.addColorStop(0.5, 'rgba(255, 200, 80, 0.16)');
      g.addColorStop(1, 'rgba(120, 150, 90, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      const petalN = 6;
      for (let i = 0; i < petalN; i++) {
        const a = (i / petalN) * Math.PI * 2 + (t || 0) * 0.0008 + p.x * 0.002;
        const pr = p.r * (0.35 + (i % 3) * 0.12);
        const px = p.x + Math.cos(a) * pr;
        const py = p.y + Math.sin(a) * pr * 0.85;
        ctx.globalAlpha = 0.35;
        CatArt._drawOsmanthusFlower(ctx, px, py, 2.8, '#ffe082');
        ctx.globalAlpha = 1;
      }
    });

    (CatWorld.forestPatches || []).forEach(p => {
      if (!CatWorld.propFitsBiome(p.x, p.y, ['forest'])) return;
      if (p.x + p.r < left || p.x - p.r > right || p.y + p.r < top || p.y - p.r > bottom) return;
      const g = ctx.createRadialGradient(p.x, p.y, p.r * 0.1, p.x, p.y, p.r);
      g.addColorStop(0, 'rgba(45, 74, 50, 0.55)');
      g.addColorStop(1, 'rgba(45, 74, 50, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    (CatWorld.dunes || []).forEach(d => {
      if (!CatWorld.propFitsBiome(d.x, d.y, ['desert'])) return;
      if (d.x + d.w < left || d.x - d.w > right) return;
      ctx.fillStyle = 'rgba(255, 220, 160, 0.45)';
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, d.w * 0.5, d.h, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(210, 170, 100, 0.25)';
      ctx.beginPath();
      ctx.ellipse(d.x + d.w * 0.15, d.y - d.h * 0.2, d.w * 0.35, d.h * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    CatWorld.mountains.forEach(m => {
      if (m.x + m.w < left || m.x - m.w > right || m.y + 80 < top || m.y - m.h > bottom) return;
      const peak = m.y - m.h;
      ctx.fillStyle = m.c;
      ctx.beginPath();
      ctx.moveTo(m.x - m.w * 0.5, m.y);
      ctx.lineTo(m.x - m.w * 0.15, peak);
      ctx.lineTo(m.x + m.w * 0.2, peak + m.h * 0.08);
      ctx.lineTo(m.x + m.w * 0.55, m.y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.moveTo(m.x - m.w * 0.05, peak + m.h * 0.12);
      ctx.lineTo(m.x + m.w * 0.08, peak + m.h * 0.05);
      ctx.lineTo(m.x + m.w * 0.12, peak + m.h * 0.22);
      ctx.closePath();
      ctx.fill();
    });

    CatWorld.oases.forEach(o => {
      if (!CatWorld.propFitsBiome(o.x, o.y, ['desert', 'meadow'])) return;
      if (o.x + o.r < left || o.x - o.r > right || o.y + o.r < top || o.y - o.r > bottom) return;
      const g = ctx.createRadialGradient(o.x, o.y, o.r * 0.1, o.x, o.y, o.r);
      g.addColorStop(0, '#c8e6c9');
      g.addColorStop(0.6, '#a5d6a7');
      g.addColorStop(1, '#66bb6a');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(o.x, o.y, o.r, o.r * 0.88, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    this._drawStreams(ctx, view, t);

    (CatWorld.restSpots || []).forEach(sp => {
      if (sp.x + sp.r < left || sp.x - sp.r > right || sp.y + sp.r < top || sp.y - sp.r > bottom) return;
      const active = opts.resting && opts.nearRest && opts.nearRest.name === sp.name;
      const pulse = 0.5 + Math.sin((t || 0) * 2.2) * 0.12;
      ctx.fillStyle = active ? `rgba(255, 200, 64, ${0.22 * pulse})` : 'rgba(240, 160, 32, 0.16)';
      ctx.strokeStyle = active ? 'rgba(255, 210, 80, 0.72)' : 'rgba(240, 160, 32, 0.48)';
      ctx.lineWidth = active ? 3 : 2;
      ctx.setLineDash(active ? [] : [8, 6]);
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.r * 0.72, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = `${Math.max(16, 18 * ValleyCam.zoom)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(sp.icon || '⛺', sp.x, sp.y + 6);
      if (!active) {
        ctx.font = `${Math.max(10, 11 * ValleyCam.zoom)}px sans-serif`;
        ctx.fillStyle = 'rgba(80, 60, 20, 0.75)';
        ctx.fillText('点我歇脚', sp.x, sp.y + sp.r * 0.42);
      }
      ctx.textAlign = 'left';
    });

    (CatWorld.specialtyNodes || []).forEach(n => {
      const bio = CatWorld.specialtyBiome(n.kind);
      if (bio && !CatWorld.propFitsBiome(n.x, n.y, [bio])) return;
      if (n.x < left || n.x > right || n.y < top || n.y > bottom) return;
      const s = n.s || 1;
      if (n.kind === 'date') {
        ctx.fillStyle = '#8d6e63';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(n.x + (i - 1) * 10 * s, n.y - 4 * s, 5 * s, 7 * s, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#c62828';
        ctx.beginPath();
        ctx.arc(n.x, n.y - 14 * s, 4 * s, 0, Math.PI * 2);
        ctx.fill();
      } else if (n.kind === 'cone') {
        ctx.fillStyle = '#6d4c41';
        ctx.beginPath();
        ctx.moveTo(n.x, n.y - 12 * s);
        ctx.lineTo(n.x - 9 * s, n.y + 4 * s);
        ctx.lineTo(n.x + 9 * s, n.y + 4 * s);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(n.x - 3 * s, n.y + 4 * s, 6 * s, 5 * s);
      } else if (n.kind === 'clover') {
        ctx.fillStyle = '#43a047';
        [-1, 0, 1].forEach(i => {
          ctx.beginPath();
          ctx.arc(n.x + i * 7 * s, n.y - 2 * s, 5 * s, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.strokeStyle = '#2e7d32';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(n.x, n.y + 10 * s);
        ctx.stroke();
      } else if (n.kind === 'guihua') {
        CatArt._drawOsmanthusBushPick(ctx, n.x, n.y, s);
      }
    });

    CatWorld.bushes.forEach(b => {
      if (!CatWorld.propFitsBiome(b.x, b.y, ['snow', 'forest', 'meadow'])) return;
      if (b.x < left || b.x > right || b.y < top || b.y > bottom) return;
      const r = 34 * b.s;
      ctx.fillStyle = '#33691e';
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      ctx.arc(b.x - r * 0.65, b.y + r * 0.15, r * 0.7, 0, Math.PI * 2);
      ctx.arc(b.x + r * 0.65, b.y + r * 0.1, r * 0.65, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < b.berries; i++) {
        const a = (i / b.berries) * Math.PI * 2;
        ctx.fillStyle = i % 2 ? '#c62828' : '#ef6c00';
        ctx.beginPath();
        ctx.arc(b.x + Math.cos(a) * r * 0.5, b.y + Math.sin(a) * r * 0.35, 5 * b.s, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    (CatWorld.cacti || []).forEach(c => {
      if (!CatWorld.propFitsBiome(c.x, c.y, ['desert'])) return;
      if (c.x < left || c.x > right || c.y < top || c.y > bottom) return;
      const s = c.s;
      ctx.fillStyle = '#558b2f';
      ctx.fillRect(c.x - 8 * s, c.y - 40 * s, 16 * s, 48 * s);
      ctx.fillRect(c.x - 22 * s, c.y - 28 * s, 14 * s, 10 * s);
      ctx.fillRect(c.x - 22 * s, c.y - 42 * s, 10 * s, 18 * s);
      ctx.fillRect(c.x + 10 * s, c.y - 22 * s, 14 * s, 10 * s);
      ctx.fillRect(c.x + 14 * s, c.y - 36 * s, 10 * s, 16 * s);
    });

    CatWorld.trees.forEach(tr => {
      const kind = tr.kind || 'snow';
      if (!CatWorld.propFitsBiome(tr.x, tr.y, [kind])) return;
      if (tr.x < left || tr.x > right || tr.y < top || tr.y > bottom) return;
      const s = tr.s;
      if (kind === 'osmanthus') {
        CatArt._drawOsmanthusTree(ctx, tr.x, tr.y, s, t);
        return;
      }
      if (kind === 'leafwood') {
        const key = `${tr.x},${tr.y}`;
        const cd = opts.cuicuiCooldowns && opts.cuicuiCooldowns[key];
        const ready = !cd || (opts.now || 0) >= cd;
        const total = tr.fruits || 4;
        const knocked = ready ? (opts.cuicuiKnockedMap && opts.cuicuiKnockedMap[key]) || [] : [];
        let visible = 0;
        if (ready) {
          for (let i = 0; i < total; i++) {
            if (!knocked.includes(i)) visible++;
          }
        }
        CatArt._drawLeafwoodTree(ctx, tr.x, tr.y, s, visible, t, tr, knocked);
        return;
      }
      const trunkH = (kind === 'forest' ? 68 : 52) * s;
      const crownR = (kind === 'forest' ? 52 : 42) * s;
      ctx.fillStyle = kind === 'forest' ? '#4e342e' : '#5d4037';
      ctx.fillRect(tr.x - 7 * s, tr.y - trunkH * 0.2, 14 * s, trunkH);
      const crown1 = kind === 'forest' ? '#1b5e20' : kind === 'meadow' ? '#43a047' : '#2e7d32';
      const crown2 = kind === 'forest' ? '#2e7d32' : kind === 'meadow' ? '#66bb6a' : '#388e3c';
      ctx.fillStyle = crown1;
      ctx.beginPath();
      ctx.arc(tr.x, tr.y - trunkH * 0.55, crownR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = crown2;
      ctx.beginPath();
      ctx.arc(tr.x - crownR * 0.55, tr.y - trunkH * 0.45, crownR * 0.72, 0, Math.PI * 2);
      ctx.arc(tr.x + crownR * 0.5, tr.y - trunkH * 0.5, crownR * 0.65, 0, Math.PI * 2);
      if (kind === 'forest') {
        ctx.arc(tr.x, tr.y - trunkH * 0.75, crownR * 0.55, 0, Math.PI * 2);
      }
      ctx.fill();
    });

    this.drawSecretGate(ctx, view, t, opts);
  },

  /** 脆脆角 — 与猫头脆角耳同色、同形 */
  drawCuicuiFruit(ctx, x, y, s) {
    const pal = typeof CrispyPalette !== 'undefined' ? CrispyPalette : { body: '#f0a020' };
    const size = 13.5 * s;
    this.drawCrispyEar(ctx, x, y + size * 0.14, 0, size, pal.body, { mouth: true });
  },

  /** 金桂 — 四瓣小花 */
  _drawOsmanthusFlower(ctx, x, y, size, color) {
    color = color || '#ffe082';
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(
        x + Math.cos(a) * size * 0.45,
        y + Math.sin(a) * size * 0.45,
        size * 0.42,
        size * 0.15,
        a,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.fillStyle = '#f9a825';
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.6, size * 0.1), 0, Math.PI * 2);
    ctx.fill();
  },

  _drawOsmanthusCluster(ctx, x, y, s, count) {
    count = count || 6;
    const cols = ['#fff9c4', '#ffe082', '#ffca28'];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + i * 0.7;
      const r = (2.5 + (i % 3)) * s;
      const fx = x + Math.cos(a) * r * 1.8;
      const fy = y + Math.sin(a) * r * 1.2;
      this._drawOsmanthusFlower(ctx, fx, fy, 2.6 * s, cols[i % cols.length]);
    }
  },

  _drawOsmanthusLeafPair(ctx, x, y, s, ang) {
    ang = ang || 0;
    [-1, 1].forEach(side => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang + side * 0.55);
      ctx.fillStyle = '#1b5e20';
      ctx.beginPath();
      ctx.ellipse(side * 5.5 * s, 0, 8 * s, 3.2 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2e7d32';
      ctx.beginPath();
      ctx.ellipse(side * 5 * s, -0.5 * s, 6.5 * s, 2.6 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  },

  _drawOsmanthusBushPick(ctx, x, y, s) {
    ctx.fillStyle = '#33691e';
    ctx.beginPath();
    ctx.ellipse(x - 4 * s, y + 6 * s, 12 * s, 7 * s, -0.2, 0, Math.PI * 2);
    ctx.ellipse(x + 6 * s, y + 4 * s, 11 * s, 6 * s, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 2 * s;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y + 4 * s);
    ctx.lineTo(x + 6 * s, y - 10 * s);
    ctx.lineTo(x + 14 * s, y - 22 * s);
    ctx.stroke();
    this._drawOsmanthusLeafPair(ctx, x + 4 * s, y - 2 * s, s, -0.35);
    this._drawOsmanthusLeafPair(ctx, x + 9 * s, y - 12 * s, s, -0.5);
    this._drawOsmanthusLeafPair(ctx, x + 15 * s, y - 20 * s, s, -0.65);
    this._drawOsmanthusCluster(ctx, x + 16 * s, y - 24 * s, s * 1.1, 9);
    this._drawOsmanthusCluster(ctx, x + 8 * s, y - 14 * s, s * 0.95, 5);
  },

  _drawOsmanthusTree(ctx, x, y, s, t) {
    const trunkH = 54 * s;
    const sway = Math.sin((t || 0) * 0.001 + x * 0.003) * 2 * s;
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(x - 6 * s, y - trunkH * 0.1, 12 * s, trunkH);
    const canopy = [
      { ox: 0, oy: -38, rx: 38, ry: 28 },
      { ox: -26, oy: -32, rx: 30, ry: 24 },
      { ox: 24, oy: -34, rx: 32, ry: 26 },
      { ox: -12, oy: -48, rx: 28, ry: 22 },
      { ox: 14, oy: -46, rx: 26, ry: 20 },
    ];
    canopy.forEach(c => {
      ctx.fillStyle = '#1b5e20';
      ctx.beginPath();
      ctx.ellipse(
        x + c.ox * s + sway * 0.4,
        y + c.oy * s,
        c.rx * s,
        c.ry * s,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    });
    ctx.fillStyle = 'rgba(255, 193, 7, 0.07)';
    ctx.beginPath();
    ctx.ellipse(x + sway * 0.3, y - 40 * s, 42 * s, 32 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    const branchTips = [
      { bx: x - 18 * s + sway, by: y - 52 * s, ang: -0.9, n: 7 },
      { bx: x + 20 * s + sway, by: y - 50 * s, ang: 0.75, n: 8 },
      { bx: x - 8 * s + sway, by: y - 58 * s, ang: -0.2, n: 9 },
      { bx: x + 10 * s + sway, by: y - 60 * s, ang: 0.15, n: 8 },
      { bx: x - 28 * s + sway, by: y - 38 * s, ang: -1.1, n: 6 },
      { bx: x + 30 * s + sway, by: y - 40 * s, ang: 1.0, n: 6 },
      { bx: x + sway, by: y - 62 * s, ang: -Math.PI / 2, n: 10 },
    ];
    const trunkTopY = y - trunkH * 0.88;
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = 1.8 * s;
    ctx.lineCap = 'round';
    branchTips.forEach(tip => {
      ctx.beginPath();
      ctx.moveTo(x + sway * 0.2, trunkTopY);
      ctx.quadraticCurveTo(
        x + (tip.bx - x) * 0.45,
        tip.by + 12 * s,
        tip.bx,
        tip.by,
      );
      ctx.stroke();
      this._drawOsmanthusLeafPair(ctx, tip.bx, tip.by + 3 * s, s, tip.ang);
      this._drawOsmanthusCluster(ctx, tip.bx, tip.by - 2 * s, s, tip.n);
    });
  },

  _drawLeafwoodTree(ctx, x, y, s, fruitCount, t, tr, knockedIndices) {
    tr = tr || { x, y, s, fruits: fruitCount };
    knockedIndices = knockedIndices || [];
    const trunkH = 62 * s;
    const crownR = 48 * s;
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(x - 8 * s, y - trunkH * 0.15, 16 * s, trunkH);

    const wobble = Math.sin((t || 0) * 0.0012 + x * 0.004) * 2 * s;
    const c1 = '#ffeb3b';
    const c2 = '#ffc107';
    const c3 = '#ffb300';
    ctx.fillStyle = c2;
    ctx.beginPath();
    ctx.arc(x + wobble, y - trunkH * 0.58, crownR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c1;
    ctx.beginPath();
    ctx.arc(x - crownR * 0.52 + wobble, y - trunkH * 0.48, crownR * 0.72, 0, Math.PI * 2);
    ctx.arc(x + crownR * 0.48 + wobble, y - trunkH * 0.52, crownR * 0.68, 0, Math.PI * 2);
    ctx.arc(x + wobble * 0.5, y - trunkH * 0.72, crownR * 0.52, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c3;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(x + wobble, y - trunkH * 0.55, crownR * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (fruitCount > 0) {
      const slots = CatArt.getLeafwoodFruitPositions(tr, t);
      const total = tr.fruits || 4;
      for (let i = 0; i < total; i++) {
        if (knockedIndices.includes(i)) continue;
        const slot = slots[i];
        if (!slot) continue;
        CatArt.drawCuicuiFruit(ctx, slot.x, slot.y, 0.72 * s);
      }
    }
  },

  getLeafwoodFruitPositions(tr, t) {
    const s = tr.s || 1;
    const trunkH = 62 * s;
    const crownR = 48 * s;
    const wobble = Math.sin((t || 0) * 0.0012 + tr.x * 0.004) * 2 * s;
    const count = tr.fruits || 4;
    const slots = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + tr.x * 0.01;
      slots.push({
        x: tr.x + Math.cos(a) * crownR * 0.55 + wobble,
        y: tr.y - trunkH * 0.55 + Math.sin(a) * crownR * 0.35,
        r: 14 * s,
      });
    }
    return slots;
  },

  drawSnowflakesScreen(ctx, vw, vh, flakes) {
    ctx.fillStyle = '#fff';
    flakes.forEach(f => {
      ctx.globalAlpha = f.a;
      ctx.beginPath();
      ctx.arc(f.x * vw, f.y * vh, f.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  },

  drawMinimap(ctx, vw, vh, cats, selectedId, opts) {
    opts = opts || {};
    const gate = CatWorld.secretGate;
    const mw = 92;
    const mh = 68;
    const mx = vw - mw - 10;
    const my = 48;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.strokeStyle = 'rgba(240,160,32,0.45)';
    ctx.lineWidth = 2;
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeRect(mx, my, mw, mh);
    const sx = mw / CatWorld.W;
    const sy = mh / CatWorld.H;
    const miniColors = {
      snow: '#dce4ec', forest: '#3d5c40', leafwood: '#e8c060',
      osmanthus: '#d4c878', desert: '#e6c88a', meadow: '#b8d4a0',
    };
    (CatWorld.biomeZones || []).forEach(z => {
      ctx.fillStyle = miniColors[z.id] || '#ccc';
      ctx.globalAlpha = 0.42;
      ctx.beginPath();
      ctx.ellipse(mx + z.x * sx, my + z.y * sy, z.rx * sx * 0.38, z.ry * sy * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    CatWorld.oases.forEach(o => {
      ctx.fillStyle = 'rgba(102,187,106,0.75)';
      ctx.beginPath();
      ctx.arc(mx + o.x * sx, my + o.y * sy, Math.max(2, o.r * sx * 0.3), 0, Math.PI * 2);
      ctx.fill();
    });
    const vx = ValleyCam.x / CatWorld.W * mw;
    const vy = ValleyCam.y / CatWorld.H * mh;
    ctx.strokeStyle = 'rgba(240,160,32,0.85)';
    ctx.strokeRect(mx + vx - 12, my + vy - 9, 24, 18);
    if (opts.hintSecretGate && gate) {
      ctx.fillStyle = 'rgba(126, 87, 194, 0.95)';
      ctx.beginPath();
      ctx.arc(mx + gate.x * sx, my + gate.y * sy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    cats.forEach(c => {
      ctx.fillStyle = c.id === selectedId ? '#f0a020' : '#888';
      ctx.beginPath();
      ctx.arc(mx + c.wx * sx, my + c.wy * sy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  },

  drawCrispyEar(ctx, x, y, rot, size, color, opts) {
    const pal = typeof CrispyPalette !== 'undefined' ? CrispyPalette : {
      body: '#f0a020', stroke: '#c27800', mouth: '#c27800', mouthIn: '#8f5c18',
    };
    opts = opts || {};
    const fill = color || pal.body;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(-size * 0.55, size * 0.38);
    ctx.lineTo(size * 0.55, size * 0.38);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (opts.stroke !== false) {
      ctx.strokeStyle = opts.stroke || pal.stroke;
      ctx.lineWidth = Math.max(1, size * 0.07);
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
    if (opts.mouth) {
      ctx.fillStyle = pal.mouth;
      ctx.beginPath();
      ctx.ellipse(0, -size * 0.78, size * 0.34, size * 0.23, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = pal.mouthIn;
      ctx.beginPath();
      ctx.ellipse(0, -size * 0.8, size * 0.21, size * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawSeasonSkinExtras(ctx, rx, ry, skin) {
    const t = performance.now() / 1000;
    ctx.save();
    if (skin.kind === 'silver') {
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 6; i++) {
        const a = t * 1.4 + i * 1.05;
        const sx = Math.cos(a) * rx * 0.55;
        const sy = Math.sin(a * 0.9) * ry * 0.45 - ry * 0.05;
        ctx.globalAlpha = 0.12 + 0.1 * Math.sin(t * 2 + i);
        ctx.fillStyle = '#e3f2fd';
        ctx.beginPath();
        ctx.arc(sx, sy, rx * 0.06, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    } else if (skin.kind === 'shield') {
      ctx.strokeStyle = 'rgba(180, 140, 90, 0.55)';
      ctx.lineWidth = Math.max(1, rx * 0.045);
      ctx.beginPath();
      ctx.moveTo(-rx * 0.55, -ry * 0.15);
      ctx.lineTo(0, -ry * 0.55);
      ctx.lineTo(rx * 0.55, -ry * 0.15);
      ctx.stroke();
    } else if (skin.kind === 'chubby') {
      ctx.fillStyle = 'rgba(255, 248, 220, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, ry * 0.05, rx * 0.78, ry * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 200, 100, 0.35)';
    } else if (skin.kind === 'frog') {
      ctx.fillStyle = 'rgba(200, 255, 180, 0.2)';
      ctx.beginPath();
      ctx.ellipse(0, -ry * 0.35, rx * 0.35, ry * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(120, 200, 80, 0.4)';
    } else {
      ctx.strokeStyle = 'rgba(255, 200, 80, 0.42)';
    }
    ctx.lineWidth = Math.max(1, rx * 0.038);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * 0.94, ry * 0.94, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 213, 79, 0.95)';
    ctx.font = `900 ${Math.max(8, rx * 0.28)}px system-ui,sans-serif`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('S', rx * 0.82, -ry * 0.88);
    ctx.textAlign = 'left';
    ctx.restore();
  },

  drawSkinEar(ctx, x, y, rot, size, skin) {
    if (skin.kind === 'frog') {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot * 0.35);
      ctx.fillStyle = skin.ear;
      ctx.beginPath();
      ctx.arc(0, -size * 0.12, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = skin.stripe;
      ctx.lineWidth = size * 0.07;
      ctx.stroke();
      ctx.restore();
      return;
    }
    if (skin.kind === 'silver') {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      const g = ctx.createLinearGradient(-size, -size, size * 0.5, size);
      g.addColorStop(0, skin.earHi || '#f0f4f8');
      g.addColorStop(0.45, skin.ear);
      g.addColorStop(1, skin.earLo || '#889098');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(-size * 0.55, size * 0.38);
      ctx.lineTo(size * 0.55, size * 0.38);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = size * 0.08;
      ctx.stroke();
      ctx.restore();
      return;
    }
    this.drawCrispyEar(ctx, x, y, rot, size, skin.ear);
  },

  drawBladeShieldGear(ctx, rx, ry) {
    const lw = Math.max(1, rx * 0.035);
    ctx.save();
    ctx.translate(-rx * 0.58, ry * 0.02);
    ctx.rotate(-0.35);
    ctx.fillStyle = '#8a6848';
    ctx.fillRect(-rx * 0.04, -ry * 0.02, rx * 0.08, ry * 0.22);
    const blade = ctx.createLinearGradient(0, -ry * 0.55, 0, ry * 0.05);
    blade.addColorStop(0, '#f0f4f8');
    blade.addColorStop(0.5, '#c8d0d8');
    blade.addColorStop(1, '#98a4b0');
    ctx.fillStyle = blade;
    ctx.beginPath();
    ctx.moveTo(0, -ry * 0.52);
    ctx.lineTo(rx * 0.07, ry * 0.02);
    ctx.lineTo(-rx * 0.07, ry * 0.02);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#787878';
    ctx.lineWidth = lw;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(rx * 0.55, ry * 0.05);
    const sr = rx * 0.26;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#8a6848';
    ctx.lineWidth = Math.max(1.5, rx * 0.045);
    ctx.beginPath();
    ctx.moveTo(0, -sr);
    ctx.lineTo(sr * 0.85, -sr * 0.2);
    ctx.lineTo(sr * 0.65, sr * 0.85);
    ctx.lineTo(-sr * 0.65, sr * 0.85);
    ctx.lineTo(-sr * 0.85, -sr * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#8a6848';
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(0, -sr * 0.5);
    ctx.lineTo(0, sr * 0.4);
    ctx.moveTo(-sr * 0.32, 0);
    ctx.lineTo(sr * 0.32, 0);
    ctx.stroke();
    ctx.restore();
  },

  drawCatFace(ctx, rx, ry, skin, opts) {
    const hunger = opts.hunger ?? 0.5;
    const blink = opts.blink ?? 0;
    const happy = opts.happy ?? false;
    const walkPhase = opts.walkPhase ?? 0;
    const moving = opts.moving ?? false;

    const bodyG = ctx.createRadialGradient(-rx * 0.2, -ry * 0.25, rx * 0.1, 0, 0, rx);
    bodyG.addColorStop(0, skin.bodyHi);
    bodyG.addColorStop(0.55, skin.bodyMid);
    bodyG.addColorStop(1, skin.bodyLo);
    ctx.fillStyle = bodyG;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, Math.PI, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    const tabbyG = ctx.createLinearGradient(0, -ry, 0, 0);
    tabbyG.addColorStop(0, skin.capHi);
    tabbyG.addColorStop(1, skin.capLo);
    ctx.fillStyle = tabbyG;
    ctx.fillRect(-rx, -ry, rx * 2, ry);
    if (skin.kind !== 'frog') {
      ctx.strokeStyle = skin.stripe;
      ctx.lineWidth = Math.max(1, rx * 0.07);
      [-0.45, -0.12, 0.18, 0.48].forEach(s => {
        ctx.beginPath();
        ctx.moveTo(s * rx, -ry);
        ctx.quadraticCurveTo(s * rx * 1.05, -ry * 0.35, s * rx * 0.92, 0);
        ctx.stroke();
      });
    }
    ctx.restore();

    const earS = rx * 0.24 * (skin.kind === 'chubby' ? 0.92 : 1);
    this.drawSkinEar(ctx, -rx * 0.4, -ry * 0.78, -0.32, earS, skin);
    this.drawSkinEar(ctx, rx * 0.4, -ry * 0.78, 0.32, earS, skin);

    const eyeY = -ry * 0.02;
    const eyeX = rx * 0.3;
    const eyeR = rx * 0.22 * (skin.kind === 'chubby' ? 0.88 : 1);
    const frogEye = skin.kind === 'frog';
    if (blink > 0.88) {
      ctx.strokeStyle = skin.eye;
      ctx.lineWidth = Math.max(1, rx * 0.055);
      ctx.lineCap = 'round';
      [-1, 1].forEach(s => {
        ctx.beginPath();
        ctx.moveTo(s * eyeX - eyeR * 0.45, eyeY);
        ctx.lineTo(s * eyeX + eyeR * 0.45, eyeY);
        ctx.stroke();
      });
    } else {
      ctx.fillStyle = skin.eye;
      ctx.beginPath();
      if (frogEye) {
        ctx.ellipse(-eyeX, eyeY, eyeR * 1.15, eyeR * 0.78, 0, 0, Math.PI * 2);
        ctx.ellipse(eyeX, eyeY, eyeR * 1.15, eyeR * 0.78, 0, 0, Math.PI * 2);
      } else {
        ctx.ellipse(-eyeX, eyeY, eyeR * 0.92, eyeR, 0, 0, Math.PI * 2);
        ctx.ellipse(eyeX, eyeY, eyeR * 0.92, eyeR, 0, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-eyeX + eyeR * 0.28, eyeY - eyeR * 0.22, eyeR * 0.3, 0, Math.PI * 2);
      ctx.arc(eyeX + eyeR * 0.28, eyeY - eyeR * 0.22, eyeR * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (skin.kind === 'chubby') {
      ctx.fillStyle = skin.blush;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.ellipse(-rx * 0.42, ry * 0.08, rx * 0.14, ry * 0.09, 0, 0, Math.PI * 2);
      ctx.ellipse(rx * 0.42, ry * 0.08, rx * 0.14, ry * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = skin.blush;
    ctx.beginPath();
    ctx.arc(0, ry * 0.14, rx * 0.075, 0, Math.PI * 2);
    ctx.fill();

    if (skin.kind === 'shield') this.drawBladeShieldGear(ctx, rx, ry);

    if (skin.seasonOnly) this.drawSeasonSkinExtras(ctx, rx, ry, skin);

    ctx.strokeStyle = '#777';
    ctx.lineWidth = Math.max(1, rx * 0.035);
    ctx.lineCap = 'round';
    if (happy) {
      ctx.beginPath();
      ctx.arc(0, ry * 0.24, rx * 0.11, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else if (hunger > 0.4) {
      ctx.beginPath();
      ctx.moveTo(-rx * 0.07, ry * 0.3);
      ctx.lineTo(0, ry * 0.26);
      ctx.lineTo(rx * 0.07, ry * 0.3);
      ctx.stroke();
    }

    const legSwing = moving ? Math.sin(walkPhase) * rx * 0.08 : 0;
    if (moving || happy) {
      ctx.fillStyle = skin.bodyHi;
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = Math.max(1, rx * 0.04);
      [-0.32, 0.2].forEach((lx, i) => {
        const swing = i === 0 ? legSwing : -legSwing;
        ctx.fillRect(lx * rx, ry * 0.72 + swing, rx * 0.11, ry * 0.16);
        ctx.strokeRect(lx * rx, ry * 0.72 + swing, rx * 0.11, ry * 0.16);
      });
    }
  },

  _catActionOffset(action, actT, actDur, rx, ry, facing) {
    const p = actDur > 0 ? Math.min(1, actT / actDur) : 0;
    if (!action || p <= 0) return { dx: 0, dy: 0, scale: 1 };
    if (action === 'shake') {
      return { dx: Math.sin(p * Math.PI * 7) * rx * 0.1, dy: 0, scale: 1 };
    }
    if (action === 'sneeze') {
      const s = Math.sin(p * Math.PI);
      return { dx: 0, dy: -s * ry * 0.08, scale: 1 + s * 0.07 };
    }
    if (action === 'stretch') {
      const s = Math.sin(p * Math.PI);
      return { dx: 0, dy: -s * ry * 0.14, scale: 1 + s * 0.05 };
    }
    if (action === 'paw') {
      return { dx: Math.sin(p * Math.PI * 2) * rx * 0.06 * facing, dy: -Math.sin(p * Math.PI) * ry * 0.04, scale: 1 };
    }
    if (action === 'nap') {
      const s = 0.88 + Math.sin(p * Math.PI * 2) * 0.02;
      return { dx: 0, dy: ry * 0.1, scale: s };
    }
    if (action === 'jump') {
      const s = Math.sin(p * Math.PI);
      const land = p > 0.82 ? (p - 0.82) / 0.18 : 0;
      return {
        dx: 0,
        dy: -s * ry * 0.58,
        scale: 1 + s * 0.06,
        scaleX: 1 + land * 0.14,
        scaleY: 1 - land * 0.16,
      };
    }
    return { dx: 0, dy: 0, scale: 1 };
  },

  /** 与 drawCatWorld 一致的画面上锚点（选中圈对齐用） */
  catDrawAnchor(wx, wy, r, opts = {}) {
    const elev = opts.elevation || 0;
    const skin = CatSkins.get(opts.skinId || 'default');
    const bob = (opts.bob ?? 0) / ValleyCam.zoom;
    const facing = opts.facing ?? 1;
    const squash = opts.squash ?? 1;
    const lift = elev * 0.06;
    const yy = wy + bob - lift;
    const rx = r * squash * (skin.rxMul || 1);
    const ry = r * (2 - squash) * (skin.ryMul || 1);
    const act = this._catActionOffset(opts.action, opts.actionT, opts.actionDur, rx, ry, facing);
    return { x: wx + act.dx, y: yy + act.dy, r };
  },

  /** 正脸圆滚滚妙脆角猫 — 支持皮肤 */
  drawCatWorld(ctx, wx, wy, r, opts = {}) {
    const elev = opts.elevation || 0;
    const skin = CatSkins.get(opts.skinId || 'default');
    const bob = (opts.bob ?? 0) / ValleyCam.zoom;
    const facing = opts.facing ?? 1;
    const squash = opts.squash ?? 1;
    const lift = elev * 0.06;
    const yy = wy + bob - lift;
    const rxMul = skin.rxMul || 1;
    const ryMul = skin.ryMul || 1;
    const rx = r * squash * rxMul;
    const ry = r * (2 - squash) * ryMul;
    const shadowScale = Math.max(0.45, 1 - elev / 900);
    const act = this._catActionOffset(opts.action, opts.actionT, opts.actionDur, rx, ry, facing);

    const sx = act.scaleX ?? act.scale;
    const sy = act.scaleY ?? act.scale;

    ctx.save();
    ctx.translate(wx + act.dx, yy + act.dy);
    ctx.scale(facing * sx, sy);

    ctx.fillStyle = `rgba(50, 70, 90, ${0.12 * shadowScale})`;
    ctx.beginPath();
    ctx.ellipse(0, ry * 0.95 + lift * 0.5, rx * 0.88 * shadowScale, ry * 0.14 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    this.drawCatFace(ctx, rx, ry, skin, opts);

    if (opts.action === 'sneeze' && opts.actionT && opts.actionDur) {
      const sp = Math.min(1, opts.actionT / opts.actionDur);
      if (sp > 0.2 && sp < 0.75) {
        ctx.strokeStyle = 'rgba(180, 210, 240, 0.65)';
        ctx.lineWidth = Math.max(1, rx * 0.04);
        ctx.lineCap = 'round';
        [-1, 1].forEach(s => {
          ctx.beginPath();
          ctx.moveTo(s * rx * 0.08, -ry * 0.02);
          ctx.lineTo(s * rx * 0.28, -ry * 0.22);
          ctx.stroke();
        });
      }
    }
    if (opts.action === 'jump' && opts.actionT && opts.actionDur) {
      const jp = Math.min(1, opts.actionT / opts.actionDur);
      const lift = Math.sin(jp * Math.PI);
      if (lift > 0.35) {
        ctx.fillStyle = skin.bodyHi;
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = Math.max(1, rx * 0.035);
        [-0.38, 0.28].forEach(lx => {
          ctx.fillRect(lx * rx, ry * 0.68 - lift * ry * 0.12, rx * 0.12, ry * 0.14);
          ctx.strokeRect(lx * rx, ry * 0.68 - lift * ry * 0.12, rx * 0.12, ry * 0.14);
        });
      }
    }

    if (opts.action === 'paw' && opts.actionT && opts.actionDur) {
      const pp = Math.min(1, opts.actionT / opts.actionDur);
      const lift = Math.sin(pp * Math.PI) * ry * 0.22;
      ctx.fillStyle = skin.bodyHi;
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = Math.max(1, rx * 0.035);
      ctx.fillRect(facing * rx * 0.38, ry * 0.5 - lift, rx * 0.12, ry * 0.14);
      ctx.strokeRect(facing * rx * 0.38, ry * 0.5 - lift, rx * 0.12, ry * 0.14);
    }

    ctx.restore();
  },

  drawSkinPreview(ctx, x, y, scale, skinId, alpha, pulse) {
    if (alpha <= 0) return;
    const skin = CatSkins.get(skinId);
    const r = 36 * scale * pulse;
    ctx.save();
    ctx.globalAlpha = alpha;

    const glow = ctx.createRadialGradient(x, y, r * 0.1, x, y, r * 2);
    glow.addColorStop(0, 'rgba(255, 220, 120, 0.45)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(x, y);
    this.drawCatFace(ctx, r, r * 1.05, skin, { hunger: 0.2, blink: 0, happy: true, moving: false, walkPhase: 0 });

    ctx.globalAlpha = alpha * 0.9;
    ctx.fillStyle = '#fff';
    ctx.font = `800 ${Math.max(14, r * 0.42)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(skin.name, 0, r + 26);

    ctx.restore();
  },

  drawSnack(ctx, x, y, size, selected) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = selected ? '#e8a030' : '#d4942a';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.82, 0.25, Math.PI * 1.12);
    ctx.arc(size * 0.12, -size * 0.08, size * 0.52, Math.PI * 1.15, Math.PI * 0.08, true);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b87820';
    ctx.lineWidth = Math.max(1, size * 0.08);
    ctx.stroke();
    ctx.restore();
  },

  drawCrunch(ctx, x, y, age, text = '吧唧') {
    const a = 1 - age;
    if (a <= 0) return;
    ctx.globalAlpha = a;
    ctx.font = `bold ${12 + age * 8}px sans-serif`;
    ctx.fillStyle = text === '嗯～' ? '#c62828' : '#d4942a';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y - age * 24);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  },

  /** 世界坐标选中圈 — 始终圆圈套住猫（含爬山） */
  drawSelectionWorld(ctx, wx, wy, r, t) {
    const pulse = 1 + Math.sin(t * 0.006) * 0.04;
    const z = ValleyCam.zoom;
    ctx.strokeStyle = 'rgba(240, 160, 32, 0.85)';
    ctx.lineWidth = 2.5 / z;
    ctx.setLineDash([5 / z, 4 / z]);
    ctx.beginPath();
    ctx.ellipse(wx, wy, r * 1.2 * pulse, r * 1.1 * pulse, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  },
};
