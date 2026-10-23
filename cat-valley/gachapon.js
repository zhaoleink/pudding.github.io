/**
 * 扭蛋机 — 抽球 → 落下 → 变大 → 打开，奖励扭蛋专属皮肤
 */
const Gachapon = {
  visible: false,
  phase: 'idle',
  time: 0,
  lastNow: 0,
  animId: null,
  onComplete: null,
  hooks: null,
  spinCost: 100,
  capsuleHue: 330,
  rolledSkinId: null,
  crackLine: null,
  canvas: null,
  ctx: null,
  w: 0,
  h: 0,

  PHASES: [
    { id: 'crank', dur: 1.25 },
    { id: 'drop', dur: 0.62 },
    { id: 'bounce', dur: 0.55 },
    { id: 'grow', dur: 1.55 },
    { id: 'open', dur: 1.85 },
    { id: 'reveal', dur: 2.35 },
  ],

  init() {
    this.canvas = document.getElementById('gacha-canvas');
    this.ctx = this.canvas?.getContext('2d');
    this.layer = document.getElementById('gacha-layer');
    const handleTap = e => {
      const pt = e.touches?.[0] || e.changedTouches?.[0] || e;
      const rect = this.canvas.getBoundingClientRect();
      this.onTap(pt.clientX - rect.left, pt.clientY - rect.top);
    };
    this.canvas?.addEventListener('click', handleTap);
    this.canvas?.addEventListener('touchend', e => {
      e.preventDefault();
      handleTap(e);
    }, { passive: false });
    window.addEventListener('resize', () => {
      if (this.visible) this.resize();
    });
  },

  isPlaying() {
    return this.visible;
  },

  onTap(sx, sy) {
    if (!this.visible) return;
    if (this.phase === 'waiting') {
      if (this.hitCrank(sx, sy)) {
        if (this.hooks?.canSpin && !this.hooks.canSpin()) {
          this.hooks.onDeny?.();
          return;
        }
        if (this.hooks?.onSpin) this.hooks.onSpin();
        this.beginSpin();
        return;
      }
      if (!this.hitMachine(sx, sy)) {
        this.cancel();
      }
      return;
    }
    if (this.phase === 'reveal' || this.phase === 'done') this.finish();
  },

  resize() {
    if (!this.canvas || !this.layer) return;
    const rect = this.layer.getBoundingClientRect();
    this.w = Math.floor(rect.width);
    this.h = Math.floor(rect.height);
    if (this.w < 10 || this.h < 10) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(this.w * dpr);
    this.canvas.height = Math.floor(this.h * dpr);
    this.canvas.style.width = `${this.w}px`;
    this.canvas.style.height = `${this.h}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  },

  open(onComplete, hooks) {
    if (this.visible) return false;
    this.visible = true;
    this.phase = 'waiting';
    this.time = 0;
    this.lastNow = 0;
    this.onComplete = onComplete;
    this.hooks = hooks || null;
    if (hooks?.spinCost != null) this.spinCost = hooks.spinCost;
    this.layer?.removeAttribute('hidden');
    this.resize();
    cancelAnimationFrame(this.animId);
    this.animId = requestAnimationFrame(t => this.loop(t));
    return true;
  },

  beginSpin() {
    if (this.phase !== 'waiting') return false;
    this.phase = 'crank';
    this.time = 0;
    this.lastNow = 0;
    this.capsuleHue = 300 + Math.random() * 50;
    this.rolledSkinId = CatSkins.rollGacha();
    this.crackLine = this.buildCrackLine(Math.random() * 100);
    return true;
  },

  cancel() {
    if (!this.visible) return;
    this.visible = false;
    this.phase = 'idle';
    this.layer?.setAttribute('hidden', '');
    cancelAnimationFrame(this.animId);
    this.rolledSkinId = null;
    this.onComplete = null;
    this.hooks = null;
  },

  finish() {
    if (!this.visible) return;
    const wasDone = this.phase === 'reveal' || this.phase === 'done';
    this.visible = false;
    this.phase = 'idle';
    this.layer?.setAttribute('hidden', '');
    cancelAnimationFrame(this.animId);
    const cb = this.onComplete;
    const result = wasDone && this.rolledSkinId
      ? { skinId: this.rolledSkinId, name: CatSkins.get(this.rolledSkinId).name }
      : null;
    this.rolledSkinId = null;
    this.onComplete = null;
    this.hooks = null;
    if (wasDone) cb?.(result);
  },

  phaseLocalT() {
    let acc = 0;
    for (const p of this.PHASES) {
      if (p.id === this.phase) return this.time - acc;
      acc += p.dur;
    }
    return 0;
  },

  phaseDur(id) {
    const p = this.PHASES.find(x => x.id === id);
    return p ? p.dur : 1;
  },

  advancePhase() {
    if (this.phase === 'waiting') return;
    let acc = 0;
    for (const p of this.PHASES) {
      acc += p.dur;
      if (this.time < acc) {
        if (this.phase !== p.id) this.phase = p.id;
        return;
      }
    }
    this.phase = 'done';
    if (this.time > acc + 0.55) this.finish();
  },

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  },

  easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  machineLayout() {
    const cx = this.w * 0.5;
    const top = this.h * 0.06;
    const bodyW = Math.min(this.w * 0.52, 280);
    const bodyH = bodyW * 1.05;
    const chuteY = top + bodyH * 0.88;
    const landY = this.h * 0.66;
    const crankX = cx + bodyW * 0.52;
    const crankY = top + bodyH * 0.62;
    const crankHitR = bodyW * 0.17;
    return { cx, top, bodyW, bodyH, chuteY, landY, crankX, crankY, crankHitR };
  },

  hitCrank(sx, sy) {
    const { crankX, crankY, crankHitR } = this.machineLayout();
    return Math.hypot(sx - crankX, sy - crankY) < crankHitR;
  },

  /** 扭蛋机本体 + 摇杆区域（点外面则关闭） */
  hitMachine(sx, sy) {
    const { cx, top, bodyW, bodyH, crankX, crankY, crankHitR } = this.machineLayout();
    const inBody = sx >= cx - bodyW * 0.54 && sx <= cx + bodyW * 0.54
      && sy >= top - bodyW * 0.06 && sy <= top + bodyH + bodyW * 0.06;
    const inCrank = Math.hypot(sx - crankX, sy - crankY) < crankHitR * 1.35;
    return inBody || inCrank;
  },

  capsulePose() {
    const { cx, chuteY, landY } = this.machineLayout();
    const lt = this.phaseLocalT();
    let x = cx;
    let y = chuteY;
    let scale = 0.42;
    let rot = 0;
    let openAmt = 0;

    if (this.phase === 'crank') {
      y = chuteY - 6;
      scale = 0.38;
    } else if (this.phase === 'drop') {
      const dropDur = this.phaseDur('drop');
      const p = Math.min(1, lt / dropDur);
      const e = this.easeOutCubic(p);
      y = chuteY + (landY - chuteY) * e;
      rot = p * Math.PI * 2.4;
      scale = 0.42 + p * 0.06;
    } else if (this.phase === 'bounce') {
      const p = Math.min(1, lt / this.phaseDur('bounce'));
      y = landY - Math.sin(p * Math.PI) * 28;
      scale = 0.48;
      rot = 0.15;
    } else if (this.phase === 'grow') {
      const p = Math.min(1, lt / this.phaseDur('grow'));
      const e = this.easeOutBack(p);
      y = landY - e * (landY - this.h * 0.52);
      x = cx + (this.w * 0.5 - cx) * 0;
      scale = 0.48 + e * 0.92;
      rot = (1 - p) * 0.2;
    } else if (this.phase === 'open' || this.phase === 'reveal' || this.phase === 'done') {
      y = this.h * 0.52;
      scale = 1.38;
      openAmt = this.phase === 'open'
        ? Math.min(1, lt / this.phaseDur('open'))
        : 1;
    }

    return { x, y, scale, rot, openAmt };
  },

  prizePose() {
    const cap = this.capsulePose();
    const lt = this.phaseLocalT();
    let scale = 0;
    let yOff = 0;
    let alpha = 0;

    if (this.phase === 'open') {
      const p = Math.min(1, lt / this.phaseDur('open'));
      const crack = Math.max(0, (p - 0.28) / 0.72);
      scale = 0.12 + crack * 0.58;
      yOff = -crack * 10;
      alpha = crack > 0.05 ? Math.min(1, crack * 1.4) : 0;
    } else if (this.phase === 'reveal' || this.phase === 'done') {
      const revealDur = this.phaseDur('reveal');
      const p = this.phase === 'reveal' ? Math.min(1, lt / (revealDur * 0.72)) : 1;
      scale = 0.72 + this.easeOutBack(p) * 0.65;
      yOff = -12 - p * 6;
      alpha = 1;
    }

    return {
      x: cap.x,
      y: cap.y + yOff,
      scale,
      alpha,
      pulse: this.phase === 'reveal' ? 1 + Math.sin(lt * 3.2) * 0.05 : 1,
    };
  },

  /** 一道锯齿裂缝 — 把球分成两半 */
  buildCrackLine(seed) {
    const splitAngle = seed * 0.13;
    const lineAngle = splitAngle + Math.PI / 2;
    const steps = 9;
    const points = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const along = (t - 0.5) * 2;
      const zig = (i % 2 === 0 ? 1 : -1) * 0.075 * (1 - Math.abs(along) * 0.45);
      points.push({
        x: Math.cos(lineAngle) * along * 0.98 + Math.cos(splitAngle) * zig,
        y: Math.sin(lineAngle) * along * 0.98 + Math.sin(splitAngle) * zig,
      });
    }
    return { splitAngle, points };
  },

  _roundRect(ctx, x, y, rw, rh, rad) {
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, rw, rh, rad);
    } else {
      ctx.rect(x, y, rw, rh);
    }
  },

  drawMachine(ctx, crankAngle) {
    const { cx, top, bodyW, bodyH } = this.machineLayout();
    const r = bodyW * 0.12;

    ctx.save();

    const domeGrad = ctx.createLinearGradient(cx, top, cx, top + bodyH * 0.45);
    domeGrad.addColorStop(0, 'rgba(255,255,255,0.55)');
    domeGrad.addColorStop(1, 'rgba(255,220,240,0.25)');
    ctx.fillStyle = domeGrad;
    ctx.strokeStyle = '#e05070';
    ctx.lineWidth = 4;
    this._roundRect(ctx, cx - bodyW * 0.44, top, bodyW * 0.88, bodyH * 0.48, r);
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < 7; i++) {
      const bx = cx - bodyW * 0.3 + (i % 4) * bodyW * 0.18;
      const by = top + bodyH * 0.14 + Math.floor(i / 4) * bodyH * 0.12;
      const hue = (i * 47 + 320) % 360;
      ctx.fillStyle = `hsl(${hue}, 72%, 62%)`;
      ctx.beginPath();
      ctx.arc(bx, by, bodyW * 0.055, 0, Math.PI * 2);
      ctx.fill();
    }

    const bodyGrad = ctx.createLinearGradient(cx, top + bodyH * 0.4, cx, top + bodyH);
    bodyGrad.addColorStop(0, '#ff6b88');
    bodyGrad.addColorStop(1, '#d83858');
    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = '#b02848';
    ctx.lineWidth = 4;
    this._roundRect(ctx, cx - bodyW * 0.44, top + bodyH * 0.42, bodyW * 0.88, bodyH * 0.58, r);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffd54f';
    ctx.font = `800 ${bodyW * 0.11}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('扭蛋', cx, top + bodyH * 0.72);

    const slotY = top + bodyH * 0.86;
    ctx.fillStyle = '#3a2030';
    this._roundRect(ctx, cx - bodyW * 0.18, slotY, bodyW * 0.36, bodyH * 0.1, 8);
    ctx.fill();

    const { crankX, crankY } = this.machineLayout();
    ctx.strokeStyle = '#ffd54f';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(crankX, crankY, bodyW * 0.09, 0, Math.PI * 2);
    ctx.stroke();
    ctx.save();
    ctx.translate(crankX, crankY);
    ctx.rotate(crankAngle);
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(-bodyW * 0.025, -bodyW * 0.14, bodyW * 0.05, bodyW * 0.28);
    ctx.restore();

    ctx.restore();
  },

  ballFill(ctx, r, hue, lx, ly) {
    const gx = lx ?? -r * 0.28;
    const gy = ly ?? -r * 0.32;
    const grad = ctx.createRadialGradient(gx, gy, r * 0.08, 0, 0, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.28, `hsl(${hue}, 82%, 74%)`);
    grad.addColorStop(0.72, `hsl(${hue}, 76%, 58%)`);
    grad.addColorStop(1, `hsl(${hue}, 70%, 44%)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.14)';
    ctx.lineWidth = Math.max(1.5, r * 0.04);
    ctx.stroke();
  },

  drawCrackLines(ctx, r, crackT, hue) {
    const line = this.crackLine;
    if (!line || !line.points.length) return;

    ctx.save();
    ctx.strokeStyle = `hsl(${hue}, 52%, 28%)`;
    ctx.lineWidth = Math.max(2, r * 0.038);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.4 + crackT * 0.55;

    const pts = line.points;
    const n = pts.length - 1;
    const reach = Math.min(n, crackT * n);
    const maxI = Math.max(1, Math.floor(reach));
    const frac = reach - Math.floor(reach);

    ctx.beginPath();
    ctx.moveTo(pts[0].x * r, pts[0].y * r);
    for (let i = 1; i <= maxI; i++) {
      const t = i === maxI && maxI < n ? frac : 1;
      const a = pts[i - 1];
      const b = pts[i];
      ctx.lineTo((a.x + (b.x - a.x) * t) * r, (a.y + (b.y - a.y) * t) * r);
    }
    ctx.stroke();
    ctx.restore();
  },

  clipHalfBall(ctx, r, splitAngle, side) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, splitAngle - Math.PI / 2, splitAngle + Math.PI / 2, side > 0);
    ctx.closePath();
    ctx.clip();
  },

  drawBrokenShards(ctx, r, splitT, hue) {
    const line = this.crackLine;
    if (!line) return;

    const fade = Math.min(1, splitT * 1.12);
    const gap = splitT * r * 0.5;
    const dx = Math.cos(line.splitAngle) * gap;
    const dy = Math.sin(line.splitAngle) * gap;
    const spin = splitT * 0.22;

    [1, -1].forEach(side => {
      ctx.save();
      ctx.translate(side * dx, side * dy);
      ctx.rotate(side * spin);
      ctx.globalAlpha = 1 - fade * 0.9;
      this.clipHalfBall(ctx, r, line.splitAngle, side);
      this.ballFill(ctx, r, hue);
      ctx.restore();

      ctx.save();
      ctx.translate(side * dx, side * dy);
      ctx.rotate(side * spin);
      ctx.globalAlpha = (1 - fade * 0.7) * 0.9;
      ctx.strokeStyle = `hsl(${hue}, 48%, 26%)`;
      ctx.lineWidth = Math.max(1.2, r * 0.03);
      ctx.beginPath();
      ctx.arc(0, 0, r, line.splitAngle - Math.PI / 2, line.splitAngle + Math.PI / 2, side > 0);
      ctx.stroke();
      ctx.restore();
    });
  },

  drawGachaBall(ctx, x, y, scale, rot, openAmt, hue) {
    const r = 46 * scale;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    if (openAmt <= 0) {
      this.ballFill(ctx, r, hue);
    } else if (openAmt < 0.28) {
      this.ballFill(ctx, r, hue);
      this.drawCrackLines(ctx, r, openAmt / 0.28, hue);
    } else {
      const splitT = (openAmt - 0.28) / 0.72;
      this.drawBrokenShards(ctx, r, splitT, hue);
    }

    ctx.restore();
  },

  drawPrize(ctx, x, y, scale, alpha, pulse) {
    if (alpha <= 0 || !this.rolledSkinId) return;
    CatArt.drawSkinPreview(ctx, x, y, scale, this.rolledSkinId, alpha, pulse);
  },

  drawCrankHint(ctx, now) {
    const { crankX, crankY, crankHitR } = this.machineLayout();
    const pulse = 1 + Math.sin(now * 0.005) * 0.14;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 213, 79, 0.9)';
    ctx.lineWidth = 3.5;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.arc(crankX, crankY, crankHitR * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.font = '700 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`点右边摇杆 · ${this.spinCost} 金币抽新皮肤`, this.w * 0.5, this.h * 0.82);
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.font = '600 12px sans-serif';
    ctx.fillText('🎰 扭蛋池共 6 款专属造型 · 重复抽退半金币', this.w * 0.5, this.h * 0.87);
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = '600 12px sans-serif';
    ctx.fillText('点扭蛋机旁边空白处可退出 · 金币不够转不动', this.w * 0.5, this.h * 0.92);
    ctx.restore();
  },

  draw(now) {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.w, this.h);

    ctx.fillStyle = 'rgba(18, 22, 32, 0.72)';
    ctx.fillRect(0, 0, this.w, this.h);

    const crankAngle = this.phase === 'crank'
      ? this.phaseLocalT() / this.phaseDur('crank') * Math.PI * 3.2
      : this.phase === 'waiting' ? 0 : Math.PI * 3.2;

    this.drawMachine(ctx, crankAngle);

    if (this.phase === 'waiting') {
      this.drawCrankHint(ctx, now);
      return;
    }

    const cap = this.capsulePose();
    this.drawGachaBall(ctx, cap.x, cap.y, cap.scale, cap.rot, cap.openAmt, this.capsuleHue);

    const prize = this.prizePose();
    this.drawPrize(ctx, prize.x, prize.y, prize.scale, prize.alpha, prize.pulse);

    if (this.phase === 'open' || this.phase === 'reveal') {
      const lt = this.phaseLocalT();
      const openDur = this.phaseDur('open');
      const burst = this.phase === 'open'
        ? Math.min(1, Math.max(0, (lt - openDur * 0.26) / (openDur * 0.38)))
        : 0.55;
      if (this.crackLine) {
        const a = this.crackLine.splitAngle;
        const zig = 78 * burst;
        ctx.save();
        ctx.globalAlpha = burst * 0.42;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cap.x, cap.y);
        ctx.lineTo(cap.x + Math.cos(a) * zig, cap.y + Math.sin(a) * zig);
        ctx.lineTo(cap.x + Math.cos(a) * (zig + 16), cap.y + Math.sin(a) * (zig + 16));
        ctx.stroke();
        ctx.restore();
      }
    }

    if (this.phase === 'reveal' || this.phase === 'done') {
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = '600 13px sans-serif';
      ctx.textAlign = 'center';
      const skinName = this.rolledSkinId ? CatSkins.get(this.rolledSkinId).name : '';
      ctx.fillText(`「${skinName}」已入背包 · 点击收起`, this.w * 0.5, this.h * 0.88);
    }
  },

  loop(now) {
    const dt = this.lastNow ? Math.min(0.05, (now - this.lastNow) / 1000) : 0.016;
    this.lastNow = now;
    if (this.phase !== 'waiting') {
      this.time += dt;
      this.advancePhase();
    }
    this.draw(now);
    if (this.visible) this.animId = requestAnimationFrame(t => this.loop(t));
  },
};
