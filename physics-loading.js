/**
 * Physics Loading Screen — دكتور محمد عبد الله (عميد الفيزياء)
 * 5-second cinematic physics experience before revealing index.html
 */
(function () {
  'use strict';

  /* ── helpers ── */
  const TAU = Math.PI * 2;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ── Build the overlay DOM ── */
  function buildLoader() {
    const el = document.createElement('div');
    el.id = 'physics-loader';
    el.setAttribute('aria-label', 'جاري تحميل المنصة...');
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');

    el.innerHTML = `
      <!-- full-screen canvas for particles & field lines -->
      <canvas id="loader-canvas"></canvas>

      <!-- Scene: magnet + rings + pulses -->
      <div class="loader-scene">

        <!-- energy pulses behind magnet -->
        <div style="position:absolute;top:50%;left:50%;width:0;height:0;">
          <div class="energy-pulse"></div>
          <div class="energy-pulse"></div>
          <div class="energy-pulse"></div>
        </div>

        <!-- field lines (spinning SVG) -->
        <svg class="field-lines-svg" id="fieldLinesSvg" viewBox="-1 -1 2 2" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="gf">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.025"/>
            </filter>
          </defs>
          ${generateFieldLines()}
        </svg>

        <!-- orbit rings -->
        <div class="orbit-ring orbit-ring-1"></div>
        <div class="orbit-ring orbit-ring-2"></div>
        <div class="orbit-ring orbit-ring-3"></div>

        <!-- magnet SVG -->
        <div class="loader-magnet" id="loaderMagnet">
          <svg class="magnet-body" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="lmgBody" cx="50%" cy="70%" r="60%">
                <stop offset="0%" stop-color="#1e3a5f"/>
                <stop offset="100%" stop-color="#050d1a"/>
              </radialGradient>
              <radialGradient id="lmgGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="rgba(56,189,248,0.35)"/>
                <stop offset="100%" stop-color="rgba(56,189,248,0)"/>
              </radialGradient>
              <filter id="lmgBlur">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.5"/>
              </filter>
            </defs>
            <!-- glow halo -->
            <ellipse cx="60" cy="65" rx="50" ry="44" fill="url(#lmgGlow)" filter="url(#lmgBlur)" opacity="0.7"/>
            <!-- horseshoe body -->
            <path d="M22 55 C22 82 38 98 60 98 C82 98 98 82 98 55 V36 H74 V55 C74 65 67 72 60 72 C53 72 46 65 46 55 V36 H22 Z"
                  fill="url(#lmgBody)" stroke="rgba(56,189,248,0.4)" stroke-width="1.8"/>
            <!-- flux lines above -->
            <path d="M36 32 C36 10 84 10 84 32" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="5 4" opacity="0.75"/>
            <path d="M28 31 C28 4  92 4  92 31" stroke="#38bdf8" stroke-width="1" stroke-dasharray="6 5" opacity="0.4"/>
            <!-- N pole -->
            <rect x="22" y="24" width="24" height="18" rx="4" fill="#dc2626"/>
            <text x="34" y="37.5" fill="#fff" font-size="12" font-weight="900" text-anchor="middle" font-family="sans-serif" dominant-baseline="middle">N</text>
            <!-- S pole -->
            <rect x="74" y="24" width="24" height="18" rx="4" fill="#0284c7"/>
            <text x="86" y="37.5" fill="#fff" font-size="12" font-weight="900" text-anchor="middle" font-family="sans-serif" dominant-baseline="middle">S</text>
            <!-- center inner arc highlight -->
            <path d="M46 58 C46 64 52 70 60 70 C68 70 74 64 74 58" stroke="rgba(56,189,248,0.5)" stroke-width="1" fill="none"/>
          </svg>

          <!-- lightning bolt -->
          <svg class="loader-spark-bolt" width="32" height="48" viewBox="0 0 32 48" fill="none">
            <path d="M18 2 L8 24 H16 L10 46 L26 20 H18 Z"
                  fill="#fbbf24"
                  stroke="#f59e0b"
                  stroke-width="1"
                  filter="drop-shadow(0 0 6px #fbbf24)"/>
          </svg>
        </div>

      </div><!-- /.loader-scene -->

      <!-- text block -->
      <div class="loader-text-block" id="loaderTextBlock">
        <div class="loader-name-wrap">
          <span class="loader-name-prefix">د ك ت و ر</span>
          <div class="loader-name">محمد عبد الله</div>
        </div>
        <div class="loader-title">
          <span class="loader-title-line"></span>
          <span class="loader-title-text">عميد الفيزياء</span>
          <span class="loader-title-icons">⚡🧲</span>
          <span class="loader-title-line"></span>
        </div>
        <div class="loader-sub" id="loaderSub">جاري تجهيز عالم الفيزياء...</div>
      </div>

      <!-- progress bar -->
      <div class="loader-progress-wrap" id="loaderProgressWrap">
        <div class="loader-progress-bar" id="loaderProgressBar"></div>
      </div>
    `;

    document.body.insertBefore(el, document.body.firstChild);
    return el;
  }

  /* ── Generate curved field lines SVG paths ── */
  function generateFieldLines() {
    const lines = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * TAU;
      const cos = Math.cos(angle).toFixed(4);
      const sin = Math.sin(angle).toFixed(4);
      const r1 = 0.38, r2 = 0.7, ctrl = 0.95;
      const x1 = (r1 * cos), y1 = (r1 * sin);
      const x2 = (r2 * cos), y2 = (r2 * sin);
      // perpendicular control point
      const cx = (ctrl * -sin), cy = (ctrl * cos);
      const opacity = 0.3 + 0.4 * Math.abs(Math.cos(angle * 2));
      lines.push(
        `<path d="M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}" stroke="#38bdf8" stroke-width="0.015" stroke-opacity="${opacity.toFixed(2)}" fill="none" filter="url(#gf)"/>`
      );
    }
    return lines.join('\n');
  }

  /* ── Canvas particle engine ── */
  function initCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, cx, cy, particles = [], sparks = [], phase = 0;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      cx = W / 2; cy = H / 2;
    }
    resize();
    window.addEventListener('resize', resize);

    // Particle class
    class Particle {
      constructor() { this.reset(true); }
      reset(init) {
        this.angle  = rand(0, TAU);
        this.orbit  = rand(80, clamp(Math.min(W, H) * 0.38, 100, 300));
        this.speed  = rand(0.004, 0.014) * (Math.random() < 0.5 ? 1 : -1);
        this.radius = rand(1.5, 4);
        this.alpha  = init ? rand(0, 1) : 0;
        this.targetAlpha = rand(0.5, 1);
        this.color  = Math.random() < 0.7
          ? `hsl(${rand(195,215)},90%,65%)`   // sky-blue
          : `hsl(${rand(38,48)},96%,64%)`;    // amber
        this.glowSize = this.radius * rand(3, 6);
        this.trail  = [];
        this.maxTrail = Math.floor(rand(4, 12));
      }
      update() {
        this.angle += this.speed;
        this.alpha = clamp(this.alpha + 0.02, 0, this.targetAlpha);
        const x = cx + Math.cos(this.angle) * this.orbit;
        const y = cy + Math.sin(this.angle) * this.orbit;
        this.trail.push({ x, y });
        if (this.trail.length > this.maxTrail) this.trail.shift();
        this.x = x; this.y = y;
      }
      draw(ctx) {
        // trail
        for (let i = 0; i < this.trail.length - 1; i++) {
          const t = i / this.trail.length;
          ctx.beginPath();
          ctx.moveTo(this.trail[i].x, this.trail[i].y);
          ctx.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
          ctx.strokeStyle = this.color;
          ctx.globalAlpha = this.alpha * t * 0.4;
          ctx.lineWidth = this.radius * t * 0.8;
          ctx.stroke();
        }
        // glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.glowSize, 0, TAU);
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.glowSize);
        g.addColorStop(0, this.color);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.globalAlpha = this.alpha * 0.25;
        ctx.fill();
        // core
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, TAU);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Spark class
    class Spark {
      constructor() { this.reset(); }
      reset() {
        const angle = rand(0, TAU);
        const r = rand(30, 90);
        this.x = cx + Math.cos(angle) * r;
        this.y = cy + Math.sin(angle) * r;
        this.vx = rand(-3, 3);
        this.vy = rand(-3, 3);
        this.life = 1;
        this.decay = rand(0.04, 0.09);
        this.size = rand(1, 3);
        this.color = Math.random() < 0.6 ? '#38bdf8' : '#fbbf24';
      }
      update() { this.x += this.vx; this.y += this.vy; this.vy += 0.08; this.life -= this.decay; this.vx *= 0.96; }
      draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, TAU);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life * 0.9;
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
      get dead() { return this.life <= 0; }
    }

    // initialise particles progressively
    for (let i = 0; i < 30; i++) particles.push(new Particle());

    let lastSparkTime = 0;

    function loop(ts) {
      ctx.clearRect(0, 0, W, H);
      phase = ts / 1000;

      /* background deep-space gradient */
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
      bg.addColorStop(0,   'rgba(5,20,50,0.25)');
      bg.addColorStop(0.5, 'rgba(2,10,30,0.15)');
      bg.addColorStop(1,   'rgba(2,8,20,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // spawning rate increases over time
      const pTarget = Math.min(60, 30 + Math.floor(phase * 6));
      while (particles.length < pTarget) particles.push(new Particle());

      particles.forEach(p => { p.update(); p.draw(ctx); });

      // sparks after phase 2
      if (phase > 2 && ts - lastSparkTime > 180) {
        const num = Math.floor(rand(2, 6));
        for (let i = 0; i < num; i++) sparks.push(new Spark());
        lastSparkTime = ts;
      }
      sparks = sparks.filter(s => !s.dead);
      sparks.forEach(s => { s.update(); s.draw(ctx); });

      animId = requestAnimationFrame(loop);
    }

    let animId = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }

  /* ── Orchestrate the 5-second sequence ── */
  function runSequence(loader) {
    const fieldSvg   = document.getElementById('fieldLinesSvg');
    const textBlock  = document.getElementById('loaderTextBlock');
    const progressW  = document.getElementById('loaderProgressWrap');
    const progressB  = document.getElementById('loaderProgressBar');
    const canvas     = document.getElementById('loader-canvas');

    const stopCanvas = initCanvas(canvas);

    // progress bar update every 50ms
    const startTime = performance.now();
    const TOTAL = 5000;
    const progressInterval = setInterval(() => {
      const pct = clamp((performance.now() - startTime) / TOTAL * 100, 0, 100);
      progressB.style.width = pct + '%';
    }, 50);
    progressW.classList.add('visible');

    // Sec 1: field lines appear
    setTimeout(() => fieldSvg.classList.add('visible'), 1000);

    // Sec 3: text fades in
    setTimeout(() => textBlock.classList.add('visible'), 3000);

    // Sec 4: sub-text updates
    setTimeout(() => {
      const sub = document.getElementById('loaderSub');
      if (sub) sub.textContent = 'المنصة جاهزة..';
    }, 4200);

    // Sec 5: fade-out loader, reveal page
    setTimeout(() => {
      clearInterval(progressInterval);
      progressB.style.width = '100%';
      stopCanvas();
      loader.classList.add('fade-out');
      // fully remove after transition
      setTimeout(() => {
        loader.remove();
        document.body.style.overflow = '';
      }, 750);
    }, TOTAL);
  }

  /* ── Entry: hide body, inject, run ── */
  function init() {
    // Prevent scroll during loading
    document.body.style.overflow = 'hidden';
    const loader = buildLoader();
    runSequence(loader);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
