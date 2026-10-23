/**
 * 妙脆角猫山谷 — 缓慢过渡的天气与粒子
 */
const ValleyWeather = {
  LABELS: {
    clear: '晴朗',
    snow: '飘雪',
    rain: '细雨',
    leaves: '落叶',
    haze: '风沙',
  },

  /** 各片区偏好天气 */
  preferredForBiome(biomeId) {
    const map = {
      snow: 'snow',
      forest: 'rain',
      leafwood: 'leaves',
      osmanthus: 'leaves',
      desert: 'haze',
      meadow: 'clear',
    };
    return map[biomeId] || 'clear';
  },

  goalIntensity(type) {
    if (type === 'clear') return 0;
    if (type === 'haze') return 0.5;
    if (type === 'rain') return 0.65;
    return 0.78;
  },

  createState() {
    return {
      type: 'snow',
      prevType: 'snow',
      blend: 1,
      intensity: 0.78,
      goalType: 'snow',
      goalIntensity: 0.78,
      stableBiome: 'snow',
      stableTimer: 0,
      lockTimer: 120,
      particles: [],
    };
  },

  spawnParticles(type, count, vw, vh) {
    const n = Math.max(8, Math.floor(count));
    const out = [];
    for (let i = 0; i < n; i++) {
      out.push(this._makeParticle(type, vw, vh, true));
    }
    return out;
  },

  _makeParticle(type, vw, vh, randomY) {
    const base = {
      x: Math.random(),
      y: randomY ? Math.random() : -0.05 - Math.random() * 0.1,
    };
    if (type === 'snow') {
      return {
        ...base,
        kind: 'snow',
        r: 1 + Math.random() * 2.2,
        vy: 0.00006 + Math.random() * 0.00008,
        vx: (Math.random() - 0.5) * 0.00003,
        a: 0.28 + Math.random() * 0.42,
      };
    }
    if (type === 'rain') {
      return {
        ...base,
        kind: 'rain',
        len: 8 + Math.random() * 14,
        vy: 0.00055 + Math.random() * 0.00035,
        vx: -0.00006,
        a: 0.18 + Math.random() * 0.22,
      };
    }
    if (type === 'leaves') {
      const hues = ['#c87830', '#d4a040', '#b85828', '#e8b050'];
      return {
        ...base,
        kind: 'leaves',
        r: 2 + Math.random() * 3,
        vy: 0.00012 + Math.random() * 0.0001,
        vx: (Math.random() - 0.5) * 0.00014,
        rot: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.004,
        color: hues[(Math.random() * hues.length) | 0],
        a: 0.35 + Math.random() * 0.4,
      };
    }
    if (type === 'haze') {
      return {
        ...base,
        kind: 'haze',
        r: 20 + Math.random() * 40,
        vy: (Math.random() - 0.5) * 0.00004,
        vx: 0.00008 + Math.random() * 0.00006,
        a: 0.04 + Math.random() * 0.06,
      };
    }
    return { ...base, kind: 'clear', a: 0 };
  },

  resizeParticles(state, vw, vh) {
    const target = this._particleCount(state.type, state.intensity, vw, vh);
    while (state.particles.length < target) {
      state.particles.push(this._makeParticle(state.type, vw, vh, true));
    }
    if (state.particles.length > target + 12) {
      state.particles.length = target;
    }
  },

  _particleCount(type, intensity, vw, vh) {
    if (type === 'clear' || intensity < 0.05) return 0;
    const area = (vw * vh) / (390 * 844);
    const scale = {
      snow: 42, rain: 55, leaves: 38, haze: 14,
    }[type] || 0;
    return Math.floor(scale * intensity * Math.max(0.7, area));
  },

  update(state, cat, dt, vw, vh) {
    const w = state.weather;
    if (!w) return;

    const bio = CatWorld.biomeAt(cat.wx, cat.wy);
    if (bio.id === w.stableBiome) {
      w.stableTimer += dt;
    } else {
      w.stableBiome = bio.id;
      w.stableTimer = 0;
    }

    w.lockTimer = Math.max(0, w.lockTimer - dt);

    const STABLE_NEED = 22;
    const LOCK_AFTER_CHANGE = 95;

    if (w.lockTimer <= 0 && w.stableTimer >= STABLE_NEED) {
      const preferred = this.preferredForBiome(w.stableBiome);
      const nextIntensity = this.goalIntensity(preferred);
      if (preferred !== w.goalType || Math.abs(nextIntensity - w.goalIntensity) > 0.08) {
        w.goalType = preferred;
        w.goalIntensity = nextIntensity;
        if (preferred !== w.type) {
          w.prevType = w.type;
          w.blend = 0;
        }
        w.lockTimer = LOCK_AFTER_CHANGE;
        w.stableTimer = 0;
      }
    }

    const TRANS = 32;
    if (w.type !== w.goalType) {
      w.blend = Math.min(1, w.blend + dt / TRANS);
      if (w.blend >= 1) {
        w.type = w.goalType;
        w.prevType = w.goalType;
        w.blend = 1;
      }
    }

    const intensitySpeed = dt / 26;
    if (w.intensity < w.goalIntensity) {
      w.intensity = Math.min(w.goalIntensity, w.intensity + intensitySpeed);
    } else if (w.intensity > w.goalIntensity) {
      w.intensity = Math.max(w.goalIntensity, w.intensity - intensitySpeed);
    }

    this.resizeParticles(w, vw, vh);
    this._tickParticles(w, dt, vw, vh);

    this._maybeNotify(state, w);
  },

  _tickParticles(w, dt, vw, vh) {
    const types = w.blend < 1 ? [w.prevType, w.type] : [w.type];
    w.particles.forEach(p => {
      if (!types.includes(p.kind) && p.kind !== 'clear') {
        p.y = Math.random();
        p.x = Math.random();
        Object.assign(p, this._makeParticle(w.type, vw, vh, true));
      }
      p.x += (p.vx || 0) * dt * 60;
      p.y += p.vy * dt * 60;
      if (p.spin) p.rot += p.spin * dt * 60;
      if (p.y > 1.08) {
        p.y = -0.06 - Math.random() * 0.08;
        p.x = Math.random();
      }
      if (p.x < -0.05) p.x = 1.05;
      if (p.x > 1.05) p.x = -0.05;
    });
  },

  _maybeNotify(state, w) {
    if (w.intensity < 0.35 || w.blend < 0.85) return;
    const label = this.LABELS[w.type] || '';
    const key = `${w.type}:${Math.round(w.intensity * 10)}`;
    if (!label || key === w.lastNote) return;
    if (w.type === 'clear' && w.intensity < 0.12) return;
    w.lastNote = key;
    if (typeof setCaption === 'function') {
      setCaption(`${label} · 天气会慢慢变，不用急`);
    }
  },

  displayType(w) {
    if (w.blend < 1 && w.intensity > 0.08) return w.prevType;
    return w.type;
  },

  displayIntensity(w) {
    return w.intensity * (w.blend < 1 ? w.blend : 1);
  },

  drawScreen(ctx, vw, vh, w) {
    if (!w || w.intensity < 0.04) return;

    const tint = {
      snow: 'rgba(196, 214, 232, 0.09)',
      rain: 'rgba(110, 130, 150, 0.11)',
      leaves: 'rgba(220, 170, 60, 0.05)',
      haze: 'rgba(210, 180, 120, 0.12)',
    };

    const drawType = w.type;
    const drawPrev = w.blend < 1 ? w.prevType : null;
    const aNow = w.intensity * (w.blend < 1 ? w.blend : 1);
    const aPrev = w.intensity * (1 - w.blend);

    if (drawPrev && aPrev > 0.03) {
      ctx.fillStyle = tint[drawPrev] || 'transparent';
      ctx.globalAlpha = aPrev;
      ctx.fillRect(0, 0, vw, vh);
      this._drawParticles(ctx, vw, vh, w.particles, drawPrev, aPrev);
    }
    if (aNow > 0.03) {
      ctx.fillStyle = tint[drawType] || 'transparent';
      ctx.globalAlpha = aNow;
      ctx.fillRect(0, 0, vw, vh);
      this._drawParticles(ctx, vw, vh, w.particles, drawType, aNow);
    }
    ctx.globalAlpha = 1;
  },

  _drawParticles(ctx, vw, vh, particles, kind, alpha) {
    particles.forEach(p => {
      if (p.kind !== kind) return;
      const px = p.x * vw;
      const py = p.y * vh;
      ctx.globalAlpha = p.a * alpha;
      if (kind === 'snow') {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (kind === 'rain') {
        ctx.strokeStyle = 'rgba(180, 200, 220, 0.85)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + p.vx * vh * 80, py + p.len);
        ctx.stroke();
      } else if (kind === 'leaves') {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(p.rot || 0);
        ctx.fillStyle = p.color || '#c87830';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (kind === 'haze') {
        ctx.fillStyle = 'rgba(230, 200, 150, 0.55)';
        ctx.beginPath();
        ctx.ellipse(px, py, p.r, p.r * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
  },

  /** 天气相关的 idle 动作 */
  suggestAction(weatherType, cat, idleSec) {
    if (cat.moving || !cat.happy) return null;
    if (weatherType === 'rain' && idleSec > 6 && Math.random() < 0.018) return 'shake';
    if (weatherType === 'snow' && idleSec > 8 && Math.random() < 0.012) return 'sneeze';
    if (weatherType === 'leaves' && idleSec > 4 && Math.random() < 0.008) return 'paw';
    if (weatherType === 'clear' && idleSec > 10 && Math.random() < 0.006) return 'stretch';
    if (idleSec > 14 && Math.random() < 0.004) return 'stretch';
    return null;
  },

  actionDuration(action) {
    return { shake: 0.75, sneeze: 0.55, stretch: 1.1, paw: 0.65, nap: 2.4, jump: 0.55 }[action] || 0.6;
  },
};
