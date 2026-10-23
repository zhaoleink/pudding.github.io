/** 不依赖 Three.js，页面打开立刻显示星空加载 */
(function () {
  const canvas = document.getElementById('ore-loading-stars');
  const loading = document.getElementById('ore-loading');
  if (!canvas || !loading) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let stars = [];
  let frame = 0;
  let shoot = { active: false, life: 0, x: 0, y: 0, vx: 0, vy: 0 };

  function size() {
    const stage = document.getElementById('ore-stage') || canvas.parentElement;
    const w = stage?.clientWidth || window.innerWidth;
    const h = stage?.clientHeight || window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!stars.length) {
      const n = Math.min(900, Math.floor((w * h) / 1100));
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        p: Math.random() * 6.28,
        s: 0.5 + Math.random(),
        a: 0.3 + Math.random() * 0.7,
      }));
    }
    return { w, h };
  }

  function draw(now) {
    if (loading.classList.contains('hide')) return;
    const { w, h } = size();
    ctx.clearRect(0, 0, w, h);
    stars.forEach(st => {
      const tw = 0.5 + 0.5 * Math.sin(now * 0.001 * st.s + st.p);
      ctx.fillStyle = `rgba(235, 244, 255, ${st.a * tw})`;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    });
    if (!shoot.active && Math.random() < 0.002) {
      shoot = {
        active: true,
        life: 0,
        x: Math.random() * w * 0.5,
        y: Math.random() * h * 0.4,
        vx: 5 + Math.random() * 2,
        vy: 2 + Math.random() * 2,
      };
    }
    if (shoot.active) {
      shoot.life += 1;
      shoot.x += shoot.vx;
      shoot.y += shoot.vy;
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(shoot.x, shoot.y);
      ctx.lineTo(shoot.x - 36, shoot.y - 14);
      ctx.stroke();
      if (shoot.life > 30) shoot.active = false;
    }
    frame = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', size);
  frame = requestAnimationFrame(draw);
  window.__oreStopLoadingBoot = () => cancelAnimationFrame(frame);
})();
