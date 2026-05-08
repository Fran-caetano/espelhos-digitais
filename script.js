/* ============================================================/* ============================================================
   ESPELHO DIGITAL — SCRIPT SYSTEM
   Faculdade CESMAC do Agreste · PSIC AGRESTE 2025-2026
   ============================================================ */

'use strict';

// ── STATE ────────────────────────────────────────────────────
const state = {
  mouse: { x: 0, y: 0, rx: 0.5, ry: 0.5 },
  phraseIdx: 0,
  iaHistory: [],
  loaded: false
};

// ── UTILITY ──────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => [...document.querySelectorAll(sel)];
const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ── MOUSE TRACKING ────────────────────────────────────────────
document.addEventListener('mousemove', (e) => {
  state.mouse.x = e.clientX;
  state.mouse.y = e.clientY;
  state.mouse.rx = e.clientX / window.innerWidth;
  state.mouse.ry = e.clientY / window.innerHeight;
});

// ── CUSTOM CURSOR ─────────────────────────────────────────────
(function initCursor() {
  const dot  = $('cursor-dot');
  const ring = $('cursor-ring');
  if (!dot || !ring) return;

  let rx = 0, ry = 0;
  let tx = 0, ty = 0;

  function loop() {
    rx += (state.mouse.x - rx) * 0.2;
    ry += (state.mouse.y - ry) * 0.2;
    tx += (state.mouse.x - tx) * 0.08;
    ty += (state.mouse.y - ty) * 0.08;

    dot.style.left  = state.mouse.x + 'px';
    dot.style.top   = state.mouse.y + 'px';
    ring.style.left = tx + 'px';
    ring.style.top  = ty + 'px';
    requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll('a, button, .teoria-card, .ia-sug').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
})();

// ── LOADER ────────────────────────────────────────────────────
(function initLoader() {
  const canvas  = $('loader-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      r: rand(0.5, 2),
      vx: rand(-0.3, 0.3),
      vy: rand(-0.3, 0.3),
      o: rand(0.1, 0.5)
    });
  }

  function drawLoader() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,200,255,${p.o})`;
      ctx.fill();
    });
    if (!state.loaded) requestAnimationFrame(drawLoader);
  }
  drawLoader();

  // Start loader bar animation
  setTimeout(() => {
    const bar = qs('.loader-bar');
    if (bar) bar.style.width = '100%';
  }, 100);

  setTimeout(() => {
    state.loaded = true;
    const loader = $('loader');
    if (loader) loader.classList.add('done');
    initMirrorIntro();
  }, 2800);
})();

// ── MIRROR INTRO ─────────────────────────────────────────────
function initMirrorIntro() {
  const canvas = $('mirror-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const container = $('mirror-container');
  const pbCanvas = $('particle-bg');
  const pbCtx = pbCanvas ? pbCanvas.getContext('2d') : null;

  let W = canvas.offsetWidth, H = canvas.offsetHeight;
  canvas.width = W; canvas.height = H;
  if (pbCanvas) {
    pbCanvas.width  = window.innerWidth;
    pbCanvas.height = window.innerHeight;
  }

  // Mirror particles
  const mirrorParticles = [];
  for (let i = 0; i < 80; i++) {
    mirrorParticles.push({
      x: rand(0, W), y: rand(0, H),
      r: rand(0.5, 2.5),
      vx: rand(-0.4, 0.4),
      vy: rand(-0.4, 0.4),
      o: rand(0.1, 0.6),
      color: Math.random() > 0.7 ? '255,255,255' : '0,200,255'
    });
  }

  // Background particles
  const bgParticles = [];
  for (let i = 0; i < 150; i++) {
    bgParticles.push({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      r: rand(0.3, 1.5),
      vx: rand(-0.15, 0.15),
      vy: rand(-0.15, 0.15),
      o: rand(0.05, 0.3)
    });
  }

  let t = 0;
  let animId;

  function drawMirror() {
    t++;
    const mx = state.mouse.x - container.getBoundingClientRect().left;
    const my = state.mouse.y - container.getBoundingClientRect().top;

    ctx.clearRect(0, 0, W, H);

    // Mirror base gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0,   '#060d18');
    grad.addColorStop(0.4, '#0a1826');
    grad.addColorStop(1,   '#030a12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Radial glow following mouse
    if (mx > 0 && mx < W && my > 0 && my < H) {
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, 160);
      mg.addColorStop(0, 'rgba(0,200,255,0.08)');
      mg.addColorStop(1, 'transparent');
      ctx.fillStyle = mg;
      ctx.fillRect(0, 0, W, H);
    }

    // Center glow
    const cg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, H * 0.6);
    cg.addColorStop(0, `rgba(0,119,182,${0.06 + 0.02 * Math.sin(t * 0.02)})`);
    cg.addColorStop(0.5, 'rgba(0,50,100,0.04)');
    cg.addColorStop(1, 'transparent');
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, W, H);

    // Border frame
    ctx.strokeStyle = `rgba(0,200,255,${0.3 + 0.1 * Math.sin(t * 0.03)})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, W - 2, H - 2);
    ctx.strokeStyle = 'rgba(0,200,255,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, W - 16, H - 16);

    // Scan line
    const scanY = (t * 1.5) % (H + 40) - 20;
    const sl = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
    sl.addColorStop(0, 'transparent');
    sl.addColorStop(0.5, 'rgba(0,200,255,0.15)');
    sl.addColorStop(1, 'transparent');
    ctx.fillStyle = sl;
    ctx.fillRect(0, scanY - 2, W, 4);

    // Internal crack lines
    ctx.strokeStyle = 'rgba(0,200,255,0.06)';
    ctx.lineWidth = 0.5;
    [[W*0.5, 0, W*0.3, H*0.4],
     [W*0.5, H*0.4, W*0.7, H*0.8],
     [W*0.5, H*0.4, W*0.2, H*0.7],
     [W*0.5, H*0.4, W*0.6, H],
    ].forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    });

    // Particles
    mirrorParticles.forEach(p => {
      const dx = mx - p.x, dy = my - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 100) {
        p.vx -= (dx / dist) * 0.3;
        p.vy -= (dy / dist) * 0.3;
      }
      p.vx *= 0.96; p.vy *= 0.96;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.o})`;
      ctx.fill();
    });

    // Corner decorations
    [
      [12, 12], [W-12, 12], [12, H-12], [W-12, H-12]
    ].forEach(([cx, cy]) => {
      ctx.strokeStyle = 'rgba(0,200,255,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const s = 16;
      if (cx < W/2) { ctx.moveTo(cx, cy+s); ctx.lineTo(cx, cy); ctx.lineTo(cx+s, cy); }
      else          { ctx.moveTo(cx-s, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy+s); }
      if (cy > H/2) { ctx.moveTo(cx, cy-s); ctx.lineTo(cx, cy); }
      ctx.stroke();
    });

    // Background particles
    if (pbCtx) {
      pbCtx.clearRect(0, 0, pbCanvas.width, pbCanvas.height);
      bgParticles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = pbCanvas.width;
        if (p.x > pbCanvas.width)  p.x = 0;
        if (p.y < 0) p.y = pbCanvas.height;
        if (p.y > pbCanvas.height) p.y = 0;
        pbCtx.beginPath();
        pbCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        pbCtx.fillStyle = `rgba(0,200,255,${p.o})`;
        pbCtx.fill();
      });
    }

    animId = requestAnimationFrame(drawMirror);
  }
  drawMirror();

  // Click to shatter
  container.addEventListener('click', () => {
    cancelAnimationFrame(animId);
    shatterMirror();
  });
}

// ── GLASS SHATTER ─────────────────────────────────────────────
function shatterMirror() {
  const overlay = $('shatter-overlay');
  const intro   = $('mirror-intro');
  const site    = $('main-site');

  // Create shards
  const numShards = 28;
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;

  for (let i = 0; i < numShards; i++) {
    const shard = document.createElement('div');
    shard.className = 'shard';
    const size = rand(60, 200);
    const angle = rand(0, 360);
    const dist  = rand(200, 800);
    const tx = Math.cos(angle * Math.PI/180) * dist;
    const ty = Math.sin(angle * Math.PI/180) * dist;
    const dur  = rand(0.6, 1.2);
    const rot  = rand(-540, 540);

    shard.style.cssText = `
      left: ${cx - size/2 + rand(-100,100)}px;
      top:  ${cy - size/2 + rand(-100,100)}px;
      width: ${size}px; height: ${size}px;
      --tx: ${tx}px; --ty: ${ty}px;
      --rot: ${rot}deg; --dur: ${dur}s;
      animation-delay: ${rand(0, 0.15)}s;
    `;
    overlay.appendChild(shard);
  }

  // Flash
  document.body.style.transition = 'background 0.05s';
  document.body.style.background = 'rgba(0,200,255,0.12)';
  setTimeout(() => { document.body.style.background = ''; }, 60);

  // Reveal site
  setTimeout(() => {
    intro.classList.add('gone');
    site.classList.remove('hidden');
    setTimeout(() => {
      site.classList.add('visible');
      initHero();
      initSilhouette();
      initIntersectionObserver();
      initTimeline();
      initPhraseCycle();
      initNavScroll();
      initNavToggle();
      animateHeroTitles();
      setTimeout(() => {
        overlay.innerHTML = '';
        overlay.style.display = 'none';
      }, 1800);
    }, 100);
  }, 400);
}

// ── HERO CANVAS ───────────────────────────────────────────────
function initHero() {
  const canvas = $('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    pts = [];
    for (let i = 0; i < 100; i++) {
      pts.push({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.2, 0.2), vy: rand(-0.2, 0.2),
        r: rand(0.5, 2.5),
        o: rand(0.05, 0.4),
        color: Math.random() > 0.8 ? '0,200,255' : '0,119,182'
      });
    }
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Connections
    ctx.strokeStyle = 'rgba(0,100,150,0.06)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i+1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        if (dx*dx + dy*dy < 12000) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }

    pts.forEach(p => {
      const dx = state.mouse.x - p.x;
      const dy = state.mouse.y - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 120) {
        p.vx += (dx / dist) * 0.05;
        p.vy += (dy / dist) * 0.05;
      }
      p.vx *= 0.98; p.vy *= 0.98;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.o})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
}

// ── ANIMATE HERO TITLES ───────────────────────────────────────
function animateHeroTitles() {
  const lines = qsa('.title-line');
  lines.forEach((line, i) => {
    setTimeout(() => line.classList.add('in'), 200 + i * 180);
  });

  const reveals = qsa('.reveal-item');
  reveals.forEach((el, i) => {
    setTimeout(() => el.classList.add('revealed'), 300 + i * 120);
  });
}

// ── SILHOUETTE CANVAS ─────────────────────────────────────────
function initSilhouette() {
  const canvas = $('silhouette-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Particle system for silhouette
  const pts = [];
  function buildSilhouette() {
    pts.length = 0;
    const cx = W/2, cy = H/2;
    const hw = Math.min(W, 600);

    // Head
    for (let i = 0; i < 300; i++) {
      const a = rand(0, Math.PI * 2);
      const r = rand(0, hw * 0.09);
      pts.push({
        ox: cx + Math.cos(a) * r,
        oy: cy - hw * 0.32 + Math.sin(a) * r,
        x: 0, y: 0, vx: 0, vy: 0
      });
    }
    // Neck
    for (let i = 0; i < 60; i++) {
      pts.push({
        ox: cx + rand(-hw*0.025, hw*0.025),
        oy: cy + rand(-hw*0.215, -hw*0.185),
        x: 0, y: 0, vx: 0, vy: 0
      });
    }
    // Torso
    for (let i = 0; i < 600; i++) {
      pts.push({
        ox: cx + rand(-hw*0.12, hw*0.12),
        oy: cy + rand(-hw*0.18, hw*0.1),
        x: 0, y: 0, vx: 0, vy: 0
      });
    }
    // Arms
    for (let side of [-1, 1]) {
      for (let i = 0; i < 200; i++) {
        const t = rand(0, 1);
        pts.push({
          ox: cx + side * (hw * 0.12 + t * hw * 0.18),
          oy: cy + rand(-hw*0.17, hw*0.08),
          x: 0, y: 0, vx: 0, vy: 0
        });
      }
    }
    // Legs
    for (let side of [-0.05, 0.05]) {
      for (let i = 0; i < 250; i++) {
        pts.push({
          ox: cx + side * hw + rand(-hw*0.055, hw*0.055),
          oy: cy + rand(hw*0.1, hw*0.38),
          x: 0, y: 0, vx: 0, vy: 0
        });
      }
    }

    pts.forEach(p => { p.x = p.ox; p.y = p.oy; });
  }
  buildSilhouette();
  window.addEventListener('resize', () => { resize(); buildSilhouette(); });

  let scroll = 0;
  window.addEventListener('scroll', () => {
    const sec = $('eu-digital');
    if (!sec) return;
    const rect = sec.getBoundingClientRect();
    const total = sec.offsetHeight;
    scroll = clamp(-rect.top / total, 0, 1);
  });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const rect = canvas.getBoundingClientRect();
    const mx = state.mouse.x - rect.left;
    const my = state.mouse.y - rect.top;
    const fragmentation = scroll;

    pts.forEach(p => {
      const dx = mx - p.ox;
      const dy = my - p.oy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const force = Math.max(0, 80 - dist) / 80;

      const fx = -(dx/dist || 0) * force * 30;
      const fy = -(dy/dist || 0) * force * 30;

      const fragX = fragmentation > 0.3
        ? (p.ox - W/2) * fragmentation * 1.5 + rand(-fragmentation*40, fragmentation*40)
        : 0;
      const fragY = fragmentation > 0.3
        ? fragmentation * 60
        : 0;

      const tx = p.ox + fx + fragX;
      const ty = p.oy + fy + fragY;

      p.vx += (tx - p.x) * 0.1;
      p.vy += (ty - p.y) * 0.1;
      p.vx *= 0.8; p.vy *= 0.8;
      p.x += p.vx; p.y += p.vy;

      const alpha = clamp(1 - fragmentation * 1.2, 0, 1);
      const hue = dist < 60 ? `0,200,255` : `0,150,220`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, rand(0.5, 1.5), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${hue},${alpha * rand(0.3, 0.8)})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
}

// ── PHRASE CYCLE ──────────────────────────────────────────────
function initPhraseCycle() {
  const phrases = qsa('.phrase');
  if (!phrases.length) return;

  function next() {
    phrases[state.phraseIdx].classList.remove('active');
    state.phraseIdx = (state.phraseIdx + 1) % phrases.length;
    phrases[state.phraseIdx].classList.add('active');
  }
  setInterval(next, 3200);
}

// ── INTERSECTION OBSERVER (REVEAL) ───────────────────────────
function initIntersectionObserver() {
  const items = qsa('.reveal-item');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => obs.observe(el));

  // Title lines inside hero
  const titleLines = qsa('.title-line');
  const titleObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        qsa('.title-line').forEach((line, i) => {
          setTimeout(() => line.classList.add('in'), i * 180);
        });
        titleObs.disconnect();
      }
    });
  }, { threshold: 0.2 });
  if (titleLines.length) titleObs.observe(titleLines[0].closest('section') || titleLines[0]);
}

// ── TIMELINE SCROLL ───────────────────────────────────────────
function initTimeline() {
  const track = qs('.timeline-track');
  if (!track) return;
  // Enable horizontal scroll with wheel
  track.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      track.scrollLeft += e.deltaY * 0.8;
    }
  }, { passive: false });
}

// ── NAV SCROLL ────────────────────────────────────────────────
function initNavScroll() {
  const nav = $('main-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  });

  // Smooth anchor links
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = $(a.getAttribute('href').slice(1));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        const mob = $('mobile-nav');
        if (mob) mob.classList.remove('open');
      }
    });
  });
}

// ── NAV TOGGLE ────────────────────────────────────────────────
function initNavToggle() {
  const btn = $('nav-toggle');
  const mob = $('mobile-nav');
  if (!btn || !mob) return;
  btn.addEventListener('click', () => mob.classList.toggle('open'));
}

// ══════════════════════════════════════════════════════════════
// CHATBOT LOCAL — BASE DE CONHECIMENTO COMPLETA DO PROJETO
// Sem dependência de API externa. 100% offline/GitHub Pages.
// ══════════════════════════════════════════════════════════════

const KB = [

  // ── PROJETO / VISÃO GERAL ──────────────────────────────────
  {
    keys: ['projeto','pesquisa','sobre','trata','tema','título','título','espelho digital','labirintos','o que é'],
    answer: `<p>Este projeto se chama <strong>"Nos Labirintos do Espelho Digital: A idealização da imagem e o eclipse da alteridade na adolescência hiperconectada"</strong>.</p>
<p>Foi desenvolvido na <strong>Faculdade CESMAC do Agreste (FEJAL)</strong>, em Arapiraca-AL, dentro do <strong>Programa Semente de Iniciação Científica – PSIC AGRESTE 2025-2026</strong>, vinculado ao Núcleo de Apoio à Pesquisa (NAP).</p>
<p>O objetivo central é investigar os efeitos do uso excessivo das redes sociais e outras formas de comunicação virtual no <strong>desenvolvimento da alteridade</strong> e nas relações sociais dos adolescentes — compreendendo como a hiperconectividade influencia a construção da identidade e a capacidade de se relacionar com o outro.</p>`
  },

  // ── OBJETIVO ──────────────────────────────────────────────
  {
    keys: ['objetivo','objetivos','propósito','finalidade','pretende','investigar'],
    answer: `<p>O projeto tem como <strong>objetivo principal</strong> compreender de que maneira a virtualidade, usada de forma excessiva, interfere nas relações sociais dos adolescentes e no desenvolvimento da alteridade.</p>
<p>Especificamente, busca-se:</p>
<p>→ Analisar como o ambiente digital influenciou a construção da identidade adolescente;<br>
→ Investigar como os jovens vivenciam suas relações no mundo virtual e as consequências para o presencial;<br>
→ Compreender como a internet molda a forma como os jovens lidam com a diferença, com o outro e com a própria identidade.</p>
<p>A pesquisa também visa promover reflexões que contribuam para um <strong>uso mais consciente das tecnologias</strong>, favorecendo relações mais empáticas e saudáveis.</p>`
  },

  // ── HIPÓTESE ──────────────────────────────────────────────
  {
    keys: ['hipótese','hipotese','pressuposto','parte de'],
    answer: `<p>O projeto parte da hipótese de que <strong>a virtualidade, quando utilizada de maneira excessiva e sem mediação, pode fragilizar habilidades sociais importantes para o convívio humano</strong>.</p>
<p>Isso inclui dificuldades em expressar empatia, dialogar de forma assertiva, criar vínculos significativos e reconhecer o outro como sujeito — especialmente nas interações presenciais, que são as mais afetadas por esse processo.</p>`
  },

  // ── METODOLOGIA ───────────────────────────────────────────
  {
    keys: ['metodologia','método','como foi feita','abordagem','qualitativa','bibliográfica','etapas'],
    answer: `<p>O projeto adota uma <strong>abordagem qualitativa e bibliográfica</strong>, com perspectiva indutiva.</p>
<p>Inicialmente estava estruturado em duas etapas: revisão bibliográfica e pesquisa de campo com entrevistas em escolas. No entanto, ao longo do desenvolvimento, as exigências éticas, logísticas e o tempo disponível para pesquisa com menores de idade tornaram a etapa de campo inviável no cronograma estabelecido.</p>
<p>Por isso, a pesquisa foi <strong>reformulada para um estudo exclusivamente bibliográfico</strong> — articulando artigos científicos, livros e produções relevantes em psicanálise, psicologia do desenvolvimento e filosofia da alteridade. Essa escolha não representa limitação, mas coerência metodológica para aprofundar a compreensão teórica do tema.</p>`
  },

  // ── ALTERIDADE ────────────────────────────────────────────
  {
    keys: ['alteridade','o outro','reconhecer outro','diferença','outro como sujeito'],
    answer: `<p><strong>Alteridade</strong> é a capacidade de reconhecer o outro como um ser diferente, com opiniões, sentimentos e formas de pensar que não necessariamente coincidem com as próprias. É a abertura ao encontro genuíno com o diferente.</p>
<p>Na perspectiva de <strong>Emmanuel Levinas</strong>, o encontro com o rosto do outro é o fundamento ético das relações humanas. No ambiente virtual, esse rosto é frequentemente mediado, fragmentado ou ausente — o que pode favorecer processos de desumanização.</p>
<p>No contexto desta pesquisa, a alteridade é entendida como uma habilidade que se desenvolve principalmente nas <strong>interações presenciais</strong> — na escuta ativa, na convivência, nas trocas afetivas e na empatia. O uso excessivo das redes sociais pode comprometer esse desenvolvimento.</p>
<p><em>Perdendo-se a capacidade simbólica adquirida pelos encontros com os outros, o que resta ao indivíduo é o ato — às vezes contra si, às vezes contra o outro. Uma compreensão fragmentada de alteridade e existência.</em></p>`
  },

  // ── LACAN / ESTÁGIO DO ESPELHO ────────────────────────────
  {
    keys: ['lacan','estágio do espelho','estadio','espelho','identificação','imagem','outro simbólico'],
    answer: `<p><strong>Jacques Lacan</strong> (1901–1981) é um dos pilares teóricos deste projeto. Em 1949, formulou a teoria do <strong>Estádio do Espelho</strong>, que descreve um período em que a criança passa a se reconhecer como um eu unificado ao ver sua imagem refletida — momento de transitivismo em que se distingue do outro.</p>
<p>Fazendo uma analogia ao cenário atual: na hiperconectividade, o adolescente que precisa se separar de suas figuras maternas e paternas encontra um espelho digital — <strong>editado, filtrado, idealizado</strong>. Esse espelho intensifica processos identificatórios marcados por idealizações e pode dificultar o reconhecimento da própria falta, elemento estruturante do sujeito.</p>
<p>Como aponta Mendes (2020): <em>"O fato de sermos falantes implica que não somos regidos apenas pelo que se passa em nosso corpo [...] o que nos torna sujeitos de linguagem é a passagem de um corpo biológico para um corpo erógeno, banhado pela linguagem e pela cultura."</em> Uma existência que se desenvolve no encontro com o Outro — nas propriedades lacanianas do simbólico.</p>
<p>Na contemporaneidade, as identificações se dão não apenas na relação direta com o semelhante, mas também via <strong>imagens digitais cuidadosamente curadas e compartilhadas</strong>.</p>`
  },

  // ── FREUD / MAL-ESTAR ─────────────────────────────────────
  {
    keys: ['freud','mal-estar','civilização','reconhecimento','aprovação','psicanálise freudiana'],
    answer: `<p><strong>Sigmund Freud</strong> (1856–1939) contribui para este projeto especialmente por meio de <em>O Mal-Estar na Civilização</em> (1930), obra em que já apontava as estranhezas do processo civilizatório.</p>
<p>Freud escreveu: <em>"É difícil escapar à impressão de que em geral as pessoas usam medidas falsas, de que buscam poder, sucesso e riqueza para si mesmas e admiram aqueles que os têm, subestimando os autênticos valores da vida."</em></p>
<p>Na contemporaneidade, isso se potencializa nas redes sociais: a busca por curtidas, seguidores e aprovação digital é uma versão amplificada desse mal-estar. Há uma <strong>intensificação nos moldes humanos de espreitar a vida buscando ideais e admirações inatingíveis</strong>, pelas construções de imagens produzidas que buscam propositalmente efeitos de perfeição.</p>
<p>A psicanálise freudiana permite compreender que o sofrimento psíquico do adolescente hiperconectado não é novo — é uma expressão contemporânea de uma tensão estrutural entre o sujeito e a civilização.</p>`
  },

  // ── BAUMAN / MODERNIDADE LÍQUIDA ─────────────────────────
  {
    keys: ['bauman','modernidade líquida','liquida','vínculos','descartável','fluido','relações passageiras'],
    answer: `<p><strong>Zygmunt Bauman</strong> (1925–2017) e seu conceito de <strong>Modernidade Líquida</strong> são fundamentais para este projeto. Para Bauman, na contemporaneidade os vínculos sólidos se dissolvem — as relações tornam-se fluidas, instáveis e descartáveis.</p>
<p>No ambiente virtual, isso se manifesta com clareza: o outro pode ser bloqueado, ignorado ou substituído com um clique. As relações online, embora aparentemente intensas, são muitas vezes superficiais e passageiras, o que pode gerar <strong>sentimentos de solidão, ansiedade e dificuldade de conexão emocional no mundo real</strong>.</p>
<p>Essa lógica relacional dificulta o desenvolvimento da alteridade: quando o suporte simbólico familiar se enfraquece, o adolescente pode buscar nas redes um espaço de reconhecimento e pertencimento — ainda que de forma precária e temporária.</p>`
  },

  // ── LEVINAS ───────────────────────────────────────────────
  {
    keys: ['levinas','rosto','ética','exterioridade','totalidade','infinito','encontro ético'],
    answer: `<p><strong>Emmanuel Levinas</strong> (1906–1995), filósofo fenomenólogo, fundamenta neste projeto a discussão sobre <strong>ética da alteridade</strong>. Em <em>Totalidade e Infinito</em> (1961), afirma que o encontro com o rosto do outro é o fundamento ético das relações humanas — é o que nos impede de reduzir o outro a um objeto.</p>
<p>No contexto virtual, esse encontro é frequentemente <strong>mediado ou ausente</strong>: não vemos o rosto real, não percebemos o corpo, não sentimos a presença. Isso pode favorecer processos de desumanização observados nas práticas de agressividade, exclusão e indiferença nas interações online.</p>
<p>A ausência do corpo e da presença física tende a reduzir a percepção do outro como sujeito, comprometendo o exercício do respeito ao que é da ordem da diferença — elemento central para o desenvolvimento ético do adolescente.</p>`
  },

  // ── WALLON ────────────────────────────────────────────────
  {
    keys: ['wallon','afetividade','emoção','expressão afetiva','desenvolvimento afetivo'],
    answer: `<p><strong>Henri Wallon</strong> (1879–1962), psicólogo do desenvolvimento, destaca que a <strong>afetividade ocupa um lugar central no desenvolvimento humano</strong>. As emoções e as trocas afetivas são estruturantes do psiquismo desde a infância.</p>
<p>Neste projeto, Wallon contribui para compreender que a mediação tecnológica tende a <strong>reconfigurar as formas de expressão afetiva</strong>, muitas vezes esvaziando a densidade das relações. A comunicação digital, embora ágil e ampla, pode limitar a experiência do encontro com o outro em sua complexidade — restringindo a interação a respostas imediatas e superficiais.</p>
<p>Isso repercute diretamente na construção da empatia e da alteridade, aspectos fundamentais para o desenvolvimento psíquico e social do adolescente.</p>`
  },

  // ── ERIKSON ───────────────────────────────────────────────
  {
    keys: ['erikson','identidade','crise','confusão de papéis','fase','desenvolvimento','construção do eu'],
    answer: `<p><strong>Erik Erikson</strong> (1902–1994) é referência central para compreender a adolescência neste projeto. Em <em>Identidade: Juventude e Crise</em> (1968), Erikson descreve como a adolescência é marcada pelo conflito fundamental entre <strong>identidade e confusão de papéis</strong>.</p>
<p>É nesse período que o indivíduo começa a construir sua identidade, questionar padrões, buscar autonomia e construir relações significativas fora do núcleo familiar. O contato com o outro é essencial nesse processo.</p>
<p>As redes sociais <strong>ampliam as possibilidades de identificação</strong>, mas também intensificam a instabilidade e a fragmentação do eu. O ambiente digital opera simultaneamente como espaço de experimentação identitária e de vulnerabilidade psíquica, exacerbando a crise eriksoniana — especialmente pela lógica de comparação constante e pelos ideais muitas vezes inalcançáveis propagados pelas plataformas.</p>`
  },

  // ── ADOLESCÊNCIA ──────────────────────────────────────────
  {
    keys: ['adolescência','adolescente','jovem','puberdade','nativa digital','geração'],
    answer: `<p>A <strong>adolescência</strong> é entendida neste projeto como uma fase crucial no desenvolvimento humano — período de descobertas, transformação da identidade e necessidade de pertencimento.</p>
<p>Como define Piletti (2024, p.155): <em>"a palavra adolescência para a atual sociedade ocidental refere-se a uma categoria que a define como fase preparatória para a entrada no mundo adulto, comumente caracterizada por alterações corporais e hormonais, psicológicas, cognitivas e sociais."</em></p>
<p>Os adolescentes contemporâneos, chamados de "nativos digitais", cresceram com o mundo virtual presente em quase todas as dimensões da vida cotidiana. Esse contexto molda comportamentos, emoções e percepções sobre o outro e sobre si mesmo — tornando essencial compreender como a hiperconectividade atravessa esse processo de subjetivação.</p>`
  },

  // ── REDES SOCIAIS ─────────────────────────────────────────
  {
    keys: ['redes sociais','instagram','tiktok','whatsapp','plataformas','curtidas','filtros','feed','algoritmo'],
    answer: `<p>As <strong>redes sociais</strong> são o objeto central desta pesquisa. Plataformas como Instagram, TikTok e WhatsApp transformaram profundamente as formas de comunicação e relacionamento, especialmente entre os adolescentes.</p>
<p>Nas redes, as interações são marcadas por <strong>filtros, curtidas, comentários rápidos e uma constante busca por aprovação</strong>. Há uma intensificação na busca por ideais e admirações inatingíveis, pelas construções de imagens que buscam propositalmente efeitos de perfeição.</p>
<p>O problema não está no uso da tecnologia em si, mas na <strong>forma como é utilizada</strong>. Quando usada com consciência, a internet pode ser uma ferramenta positiva para o aprendizado e a comunicação. Quando o uso é excessivo e sem mediação, traz prejuízos significativos ao desenvolvimento humano e social — dificultando a paciência para ouvir o outro, a empatia e a capacidade de lidar com frustrações reais.</p>`
  },

  // ── RESULTADOS / CONCLUSÃO ────────────────────────────────
  {
    keys: ['resultado','resultados','conclusão','concluiu','descobriu','conclui','achados','o que encontrou'],
    answer: `<p>Os resultados desta pesquisa bibliográfica indicam que o <strong>desenvolvimento da alteridade na adolescência contemporânea é profundamente atravessado pelas transformações nas formas de laço social</strong>.</p>
<p>Os principais achados foram:<br>
→ A adolescência encontra na contemporaneidade novos atravessamentos mediados pela virtualidade, com impactos na construção da identidade (Erikson);<br>
→ A mediação tecnológica reconfigura expressões afetivas e pode esvaziar a densidade das relações (Wallon);<br>
→ As identificações se dão via imagens digitais idealizadas, dificultando o reconhecimento da própria falta (Lacan);<br>
→ Os vínculos virtuais tendem a ser mais fluidos e descartáveis (Bauman);<br>
→ A ausência do rosto compromete o exercício ético com o outro (Levinas).</p>
<p>Por outro lado, a virtualidade também pode funcionar como <strong>espaço de apoio e pertencimento</strong>, especialmente em grupos de saúde mental e diversidade. A conclusão aponta para a necessidade de equilíbrio e de <em>"promover um uso mais consciente das tecnologias, incentivando relações pautadas no respeito, na empatia e no reconhecimento do outro."</em></p>`
  },

  // ── EQUIPE ────────────────────────────────────────────────
  {
    keys: ['equipe','quem fez','pesquisadoras','orientadora','autores','integrantes','coorientador','wildicleia','cícero'],
    answer: `<p>O projeto foi desenvolvido pela seguinte equipe da <strong>Faculdade CESMAC do Agreste</strong>:</p>
<p><strong>Orientadora:</strong> Profa. Wildicleia de Oliveira Santos Lopes<br>
<strong>Coorientador:</strong> Prof. Cícero José Barbosa da Fonseca</p>
<p><strong>Pesquisadoras:</strong><br>
· Jessica Mariane da Silva Santos<br>
· Maria Eduarda Malta Ramos<br>
· Franciele Caetano Soares da Silva<br>
· Priscilla Silva Barbosa<br>
· Ramyle Vívian de Lima Santos<br>
· Emmily Vitória Barros Dos Prazeres</p>
<p>O projeto foi desenvolvido entre <strong>maio de 2025 e abril de 2026</strong>, dentro do Programa Semente de Iniciação Científica (PSIC), vinculado ao Núcleo de Apoio à Pesquisa (NAP) da FEJAL.</p>`
  },

  // ── DIFICULDADES ──────────────────────────────────────────
  {
    keys: ['dificuldades','desafios','problemas','entraves','limitações','mudança','reformulação'],
    answer: `<p>A principal dificuldade foi a <strong>necessidade de reformular a metodologia</strong> originalmente planejada. A proposta inicial previa entrevistas com adolescentes de escolas públicas e privadas, mas as exigências éticas, logísticas e o tempo disponível tornaram essa etapa inviável.</p>
<p>Obter autorizações institucionais, contatar escolas e cumprir os trâmites para pesquisa com menores de idade se mostraram mais complexos do que previsto. Diante disso, a pesquisa foi redirecionada para um formato <strong>exclusivamente bibliográfico</strong> — decisão que permitiu manter qualidade e profundidade.</p>
<p>Outra dificuldade foi a <strong>gestão do tempo</strong>, já que todas as integrantes conciliam o projeto com atividades da graduação, estágios e outras responsabilidades acadêmicas. A superação dessas dificuldades evidenciou a importância do planejamento coletivo e da flexibilidade científica.</p>`
  },

  // ── PONTOS POSITIVOS ──────────────────────────────────────
  {
    keys: ['pontos positivos','positivo','conquistas','aprendizado','amadurecimento','contribuições','formação'],
    answer: `<p>Entre os fatores positivos, destaca-se em primeiro lugar o <strong>engajamento e a dedicação de toda a equipe</strong> ao longo do processo — mantendo o compromisso com a pesquisa mesmo diante dos desafios encontrados.</p>
<p>A riqueza do material bibliográfico disponível sobre psicanálise, adolescência e virtualidade permitiu aprofundar a compreensão do tema de forma consistente. A <strong>orientação da professora Wildicleia</strong> foi essencial para a condução da pesquisa, especialmente no redirecionamento metodológico.</p>
<p>A aproximação com autores como Freud, Lacan e Bauman de maneira contextualizada com a realidade contemporânea trouxe um <strong>amadurecimento teórico</strong> que vai além do projeto — contribuindo para a formação das pesquisadoras como futuras psicólogas.</p>`
  },

  // ── PALAVRAS-CHAVE ────────────────────────────────────────
  {
    keys: ['palavras-chave','palavras chave','keywords','termos'],
    answer: `<p>As <strong>palavras-chave</strong> deste projeto são:</p>
<p><strong>Adolescência · Redes Sociais · Virtualidade · Alteridade · Relações Sociais · Psicanálise · Identidade · Hiperconectividade</strong></p>
<p>Esses termos refletem os eixos centrais da pesquisa: o sujeito adolescente, o contexto digital contemporâneo, as teorias que embasam a análise e os impactos nas relações humanas.</p>`
  },

  // ── REFERÊNCIAS ───────────────────────────────────────────
  {
    keys: ['referências','referencia','bibliografia','autores','livros','obras citadas','fontes'],
    answer: `<p>As principais <strong>referências bibliográficas</strong> do projeto são:</p>
<p>· ALBERTO, Sônia. <em>O adolescente e o Outro.</em> Zahar, 2004.<br>
· BAUMAN, Zygmunt. <em>Modernidade líquida.</em> Zahar, 2001.<br>
· ERIKSON, Erik H. <em>Identidade: juventude e crise.</em> Zahar, 1976.<br>
· FREUD, Sigmund. <em>O mal-estar na civilização.</em> Companhia das Letras, 2010.<br>
· LACAN, Jacques. O estádio do espelho (1949). In: <em>Escritos.</em> Zahar, 1998.<br>
· LEVINAS, Emmanuel. <em>Totalidade e infinito.</em> Edições 70, 2008.<br>
· MENDES, E. D. Impasses na constituição do sujeito causado pelas tecnologias digitais. <em>Revista Subjetividades,</em> 2020.<br>
· PILETTI, N. et al. <em>Psicologia do desenvolvimento.</em> Contexto, 2024.<br>
· WALLON, Henrique. <em>A evolução psicológica da criança.</em> Martins Fontes, 2007.</p>`
  },

  // ── IDENTIDADE FRAGMENTADA ────────────────────────────────
  {
    keys: ['identidade','quem sou','imagem','selfie','autoimagem','fragmentação','inadequação','ansiedade'],
    answer: `<p>A <strong>construção da identidade</strong> é um processo central na adolescência. A partir de Erikson (1971), sabemos que essa fase é marcada pelo conflito entre identidade e confusão de papéis.</p>
<p>No ambiente digital, esse processo é atravessado por uma <strong>lógica de comparação constante</strong>. As redes sociais reforçam ideais muitas vezes inalcançáveis — filtros, edições, corpos perfeitos — contribuindo para sentimentos de inadequação, ansiedade e fragilidade na autoimagem.</p>
<p>Freud (1930) já apontava que a civilização exige renúncias que geram sofrimento. Na contemporaneidade, isso se intensifica: o adolescente não apenas se compara com os de seu círculo, mas com influenciadores globais que constroem imagens propositalmente idealizadas para gerar engajamento.</p>`
  },

  // ── FAMÍLIA / ESCOLA ──────────────────────────────────────
  {
    keys: ['família','pais','escola','educação','professor','mediação','orientação','adultos'],
    answer: `<p>A pesquisa aponta que <strong>família, escola e profissionais de saúde mental</strong> assumem papel fundamental na sustentação do adolescente em seu processo de desenvolvimento.</p>
<p>Quando o suporte simbólico oferecido pela família se enfraquece ou quando há ausência da função parental, o adolescente pode buscar nas redes sociais um espaço de reconhecimento e pertencimento — ainda que de forma precária.</p>
<p>A presença de <strong>espaços de escuta</strong> — tanto no contexto familiar quanto escolar e clínico — é fundamental para sustentar o jovem diante das demandas de um mundo hiperconectado. Torna-se essencial investir em estratégias educativas que favoreçam a reflexão crítica sobre o uso das tecnologias e a valorização do encontro presencial com o outro.</p>`
  },

  // ── TECNOLOGIA POSITIVA ───────────────────────────────────
  {
    keys: ['positivo','benefício','lado bom','tecnologia positiva','apoio','pertencimento','grupos','saúde mental'],
    answer: `<p>A pesquisa tem uma visão <strong>não reducionista da virtualidade</strong>: o ambiente digital não deve ser compreendido apenas como espaço de risco.</p>
<p>As redes sociais podem funcionar como importantes <strong>dispositivos de apoio</strong>, especialmente para adolescentes que encontram nelas possibilidades de expressão, identificação e acolhimento. Grupos ligados à saúde mental, diversidade e causas sociais podem favorecer a construção de vínculos significativos e o fortalecimento da identidade.</p>
<p>O que se evidencia não é uma oposição entre mundo real e mundo virtual, mas a importância de um <strong>equilíbrio entre essas dimensões</strong> — acompanhado de orientação, escuta e reflexão crítica.</p>`
  },

  // ── SAUDAÇÕES ─────────────────────────────────────────────
  {
    keys: ['olá','ola','oi','bom dia','boa tarde','boa noite','hey','tudo bem','como vai','hello'],
    answer: `<p>Olá! Sou o <strong>Psi·Bot</strong>, assistente digital do projeto <em>Nos Labirintos do Espelho Digital</em>.</p>
<p>Estou aqui para responder perguntas sobre este projeto de pesquisa desenvolvido na CESMAC do Agreste (2025–2026). Você pode me perguntar sobre:</p>
<p>→ Objetivos e metodologia do projeto<br>
→ Conceitos como alteridade, identidade e hiperconectividade<br>
→ Os autores: Lacan, Freud, Bauman, Levinas, Wallon, Erikson<br>
→ Resultados e conclusões<br>
→ A equipe de pesquisadoras</p>
<p>O que você gostaria de explorar?</p>`
  },

  // ── AGRADECIMENTO ─────────────────────────────────────────
  {
    keys: ['obrigado','obrigada','valeu','thanks','grato','grata'],
    answer: `<p>De nada! Foi um prazer contribuir com sua compreensão sobre este projeto.</p>
<p>Se tiver mais dúvidas sobre <em>adolescência, alteridade, psicanálise ou hiperconectividade</em>, é só perguntar.</p>`
  }

];

// ── RESPOSTA PADRÃO (não reconheceu) ──────────────────────
const DEFAULT_REPLIES = [
  `<p>Não encontrei uma resposta específica para isso no conteúdo do projeto. Tente reformular sua pergunta ou escolha um dos temas sugeridos.</p><p>Posso responder sobre: <strong>alteridade, Lacan, Freud, Bauman, Levinas, Wallon, Erikson, adolescência, redes sociais, metodologia, equipe, resultados e conclusão.</strong></p>`,
  `<p>Essa pergunta está um pouco fora do escopo deste projeto. Experimente perguntar sobre os <strong>conceitos teóricos</strong>, os <strong>autores</strong> ou os <strong>resultados</strong> da pesquisa.</p>`,
  `<p>Não tenho dados suficientes sobre esse tópico específico no relatório. Mas posso falar sobre a <strong>influência das redes sociais na adolescência</strong>, sobre a <strong>construção da identidade digital</strong> ou sobre qualquer autor citado no projeto.</p>`
];

let _defIdx = 0;

// ── MOTOR DE BUSCA ────────────────────────────────────────
function findAnswer(input) {
  const q = input.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9\s]/g, ' ');

  let best = null;
  let bestScore = 0;

  for (const entry of KB) {
    let score = 0;
    for (const kw of entry.keys) {
      const kwNorm = kw.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (q.includes(kwNorm)) {
        score += kwNorm.split(' ').length; // palavras compostas valem mais
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  if (bestScore > 0) return best.answer;
  return DEFAULT_REPLIES[_defIdx++ % DEFAULT_REPLIES.length];
}

// ── UI DO CHATBOT ─────────────────────────────────────────
function chatAddMsg(html, isUser = false) {
  const chat = $('ia-chat');
  if (!chat) return;
  const wrap = document.createElement('div');
  if (isUser) {
    wrap.className = 'ia-user-bubble';
    wrap.textContent = html;
  } else {
    wrap.className = 'ia-message ia-msg';
    wrap.innerHTML = `<div class="ia-msg-avatar">◈</div><div class="ia-msg-bubble">${html}</div>`;
  }
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

function chatTyping(show) {
  const existing = $('chat-typing');
  if (show && !existing) {
    const chat = $('ia-chat');
    if (!chat) return;
    const div = document.createElement('div');
    div.id = 'chat-typing';
    div.className = 'ia-message ia-msg';
    div.innerHTML = `<div class="ia-msg-avatar">◈</div><div class="ia-msg-bubble"><div class="ia-typing"><span></span><span></span><span></span></div></div>`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  } else if (!show && existing) {
    existing.remove();
  }
}

function chatRespond(userMsg) {
  const send = $('ia-send');
  const input = $('ia-input');
  if (send) send.disabled = true;
  if (input) input.disabled = true;

  chatTyping(true);

  // Simula tempo de digitação realista (600–1400ms)
  const delay = 600 + Math.random() * 800;
  setTimeout(() => {
    chatTyping(false);
    const answer = findAnswer(userMsg);
    chatAddMsg(answer, false);
    if (send) send.disabled = false;
    if (input) { input.disabled = false; input.focus(); }
  }, delay);
}

function sendMessage() {
  const input = $('ia-input');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  chatAddMsg(msg, true);
  chatRespond(msg);
}

function sendSuggestion(btn) {
  const msg = btn.textContent.trim();
  chatAddMsg(msg, true);
  chatRespond(msg);
}

// ── EVENT LISTENERS DO CHAT ───────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const sendBtn = $('ia-send');
  const inputEl = $('ia-input');
  if (sendBtn) sendBtn.addEventListener('click', sendMessage);
  if (inputEl) inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  // Sugestões
  qsa('.ia-sug').forEach(btn => {
    btn.addEventListener('click', () => sendSuggestion(btn));
  });
});

// Enter key support (fallback)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'ia-input') {
    sendMessage();
  }
});

// ── OCCASIONAL GLITCH ─────────────────────────────────────────
(function initGlitch() {
  const hero = qs('.hero-title');
  if (!hero) return;
  setInterval(() => {
    if (Math.random() > 0.92) {
      hero.classList.add('glitch-text');
      setTimeout(() => hero.classList.remove('glitch-text'), 600);
    }
  }, 4000);
})();

// ── SUBTLE BACKGROUND BREATHING ───────────────────────────────
(function initBreathing() {
  let t = 0;
  function breath() {
    t += 0.005;
    const r = Math.sin(t) * 2;
    document.body.style.setProperty('--breath', r);
    requestAnimationFrame(breath);
  }
  breath();
})();

// Expose for HTML onclick
window.sendMessage = sendMessage;
window.sendSuggestion = sendSuggestion;
   ESPELHO DIGITAL — SCRIPT SYSTEM
   Faculdade CESMAC do Agreste · PSIC AGRESTE 2025-2026
   ============================================================ */

'use strict';

// ── STATE ────────────────────────────────────────────────────
const state = {
  mouse: { x: 0, y: 0, rx: 0.5, ry: 0.5 },
  phraseIdx: 0,
  iaHistory: [],
  loaded: false
};

// ── UTILITY ──────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => [...document.querySelectorAll(sel)];
const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ── MOUSE TRACKING ────────────────────────────────────────────
document.addEventListener('mousemove', (e) => {
  state.mouse.x = e.clientX;
  state.mouse.y = e.clientY;
  state.mouse.rx = e.clientX / window.innerWidth;
  state.mouse.ry = e.clientY / window.innerHeight;
});

// ── CUSTOM CURSOR ─────────────────────────────────────────────
(function initCursor() {
  const dot  = $('cursor-dot');
  const ring = $('cursor-ring');
  if (!dot || !ring) return;

  let rx = 0, ry = 0;
  let tx = 0, ty = 0;

  function loop() {
    rx += (state.mouse.x - rx) * 0.2;
    ry += (state.mouse.y - ry) * 0.2;
    tx += (state.mouse.x - tx) * 0.08;
    ty += (state.mouse.y - ty) * 0.08;

    dot.style.left  = state.mouse.x + 'px';
    dot.style.top   = state.mouse.y + 'px';
    ring.style.left = tx + 'px';
    ring.style.top  = ty + 'px';
    requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll('a, button, .teoria-card, .ia-sug').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
})();

// ── LOADER ────────────────────────────────────────────────────
(function initLoader() {
  const canvas  = $('loader-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      r: rand(0.5, 2),
      vx: rand(-0.3, 0.3),
      vy: rand(-0.3, 0.3),
      o: rand(0.1, 0.5)
    });
  }

  function drawLoader() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,200,255,${p.o})`;
      ctx.fill();
    });
    if (!state.loaded) requestAnimationFrame(drawLoader);
  }
  drawLoader();

  // Start loader bar animation
  setTimeout(() => {
    const bar = qs('.loader-bar');
    if (bar) bar.style.width = '100%';
  }, 100);

  setTimeout(() => {
    state.loaded = true;
    const loader = $('loader');
    if (loader) loader.classList.add('done');
    initMirrorIntro();
  }, 2800);
})();

// ── MIRROR INTRO ─────────────────────────────────────────────
function initMirrorIntro() {
  const canvas = $('mirror-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const container = $('mirror-container');
  const pbCanvas = $('particle-bg');
  const pbCtx = pbCanvas ? pbCanvas.getContext('2d') : null;

  let W = canvas.offsetWidth, H = canvas.offsetHeight;
  canvas.width = W; canvas.height = H;
  if (pbCanvas) {
    pbCanvas.width  = window.innerWidth;
    pbCanvas.height = window.innerHeight;
  }

  // Mirror particles
  const mirrorParticles = [];
  for (let i = 0; i < 80; i++) {
    mirrorParticles.push({
      x: rand(0, W), y: rand(0, H),
      r: rand(0.5, 2.5),
      vx: rand(-0.4, 0.4),
      vy: rand(-0.4, 0.4),
      o: rand(0.1, 0.6),
      color: Math.random() > 0.7 ? '255,255,255' : '0,200,255'
    });
  }

  // Background particles
  const bgParticles = [];
  for (let i = 0; i < 150; i++) {
    bgParticles.push({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      r: rand(0.3, 1.5),
      vx: rand(-0.15, 0.15),
      vy: rand(-0.15, 0.15),
      o: rand(0.05, 0.3)
    });
  }

  let t = 0;
  let animId;

  function drawMirror() {
    t++;
    const mx = state.mouse.x - container.getBoundingClientRect().left;
    const my = state.mouse.y - container.getBoundingClientRect().top;

    ctx.clearRect(0, 0, W, H);

    // Mirror base gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0,   '#060d18');
    grad.addColorStop(0.4, '#0a1826');
    grad.addColorStop(1,   '#030a12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Radial glow following mouse
    if (mx > 0 && mx < W && my > 0 && my < H) {
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, 160);
      mg.addColorStop(0, 'rgba(0,200,255,0.08)');
      mg.addColorStop(1, 'transparent');
      ctx.fillStyle = mg;
      ctx.fillRect(0, 0, W, H);
    }

    // Center glow
    const cg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, H * 0.6);
    cg.addColorStop(0, `rgba(0,119,182,${0.06 + 0.02 * Math.sin(t * 0.02)})`);
    cg.addColorStop(0.5, 'rgba(0,50,100,0.04)');
    cg.addColorStop(1, 'transparent');
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, W, H);

    // Border frame
    ctx.strokeStyle = `rgba(0,200,255,${0.3 + 0.1 * Math.sin(t * 0.03)})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, W - 2, H - 2);
    ctx.strokeStyle = 'rgba(0,200,255,0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 8, W - 16, H - 16);

    // Scan line
    const scanY = (t * 1.5) % (H + 40) - 20;
    const sl = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
    sl.addColorStop(0, 'transparent');
    sl.addColorStop(0.5, 'rgba(0,200,255,0.15)');
    sl.addColorStop(1, 'transparent');
    ctx.fillStyle = sl;
    ctx.fillRect(0, scanY - 2, W, 4);

    // Internal crack lines
    ctx.strokeStyle = 'rgba(0,200,255,0.06)';
    ctx.lineWidth = 0.5;
    [[W*0.5, 0, W*0.3, H*0.4],
     [W*0.5, H*0.4, W*0.7, H*0.8],
     [W*0.5, H*0.4, W*0.2, H*0.7],
     [W*0.5, H*0.4, W*0.6, H],
    ].forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    });

    // Particles
    mirrorParticles.forEach(p => {
      const dx = mx - p.x, dy = my - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 100) {
        p.vx -= (dx / dist) * 0.3;
        p.vy -= (dy / dist) * 0.3;
      }
      p.vx *= 0.96; p.vy *= 0.96;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.o})`;
      ctx.fill();
    });

    // Corner decorations
    [
      [12, 12], [W-12, 12], [12, H-12], [W-12, H-12]
    ].forEach(([cx, cy]) => {
      ctx.strokeStyle = 'rgba(0,200,255,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const s = 16;
      if (cx < W/2) { ctx.moveTo(cx, cy+s); ctx.lineTo(cx, cy); ctx.lineTo(cx+s, cy); }
      else          { ctx.moveTo(cx-s, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy+s); }
      if (cy > H/2) { ctx.moveTo(cx, cy-s); ctx.lineTo(cx, cy); }
      ctx.stroke();
    });

    // Background particles
    if (pbCtx) {
      pbCtx.clearRect(0, 0, pbCanvas.width, pbCanvas.height);
      bgParticles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = pbCanvas.width;
        if (p.x > pbCanvas.width)  p.x = 0;
        if (p.y < 0) p.y = pbCanvas.height;
        if (p.y > pbCanvas.height) p.y = 0;
        pbCtx.beginPath();
        pbCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        pbCtx.fillStyle = `rgba(0,200,255,${p.o})`;
        pbCtx.fill();
      });
    }

    animId = requestAnimationFrame(drawMirror);
  }
  drawMirror();

  // Click to shatter
  container.addEventListener('click', () => {
    cancelAnimationFrame(animId);
    shatterMirror();
  });
}

// ── GLASS SHATTER ─────────────────────────────────────────────
function shatterMirror() {
  const overlay = $('shatter-overlay');
  const intro   = $('mirror-intro');
  const site    = $('main-site');

  // Create shards
  const numShards = 28;
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;

  for (let i = 0; i < numShards; i++) {
    const shard = document.createElement('div');
    shard.className = 'shard';
    const size = rand(60, 200);
    const angle = rand(0, 360);
    const dist  = rand(200, 800);
    const tx = Math.cos(angle * Math.PI/180) * dist;
    const ty = Math.sin(angle * Math.PI/180) * dist;
    const dur  = rand(0.6, 1.2);
    const rot  = rand(-540, 540);

    shard.style.cssText = `
      left: ${cx - size/2 + rand(-100,100)}px;
      top:  ${cy - size/2 + rand(-100,100)}px;
      width: ${size}px; height: ${size}px;
      --tx: ${tx}px; --ty: ${ty}px;
      --rot: ${rot}deg; --dur: ${dur}s;
      animation-delay: ${rand(0, 0.15)}s;
    `;
    overlay.appendChild(shard);
  }

  // Flash
  document.body.style.transition = 'background 0.05s';
  document.body.style.background = 'rgba(0,200,255,0.12)';
  setTimeout(() => { document.body.style.background = ''; }, 60);

  // Reveal site
  setTimeout(() => {
    intro.classList.add('gone');
    site.classList.remove('hidden');
    setTimeout(() => {
      site.classList.add('visible');
      initHero();
      initSilhouette();
      initIntersectionObserver();
      initTimeline();
      initPhraseCycle();
      initNavScroll();
      initNavToggle();
      animateHeroTitles();
      setTimeout(() => {
        overlay.innerHTML = '';
        overlay.style.display = 'none';
      }, 1800);
    }, 100);
  }, 400);
}

// ── HERO CANVAS ───────────────────────────────────────────────
function initHero() {
  const canvas = $('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    pts = [];
    for (let i = 0; i < 100; i++) {
      pts.push({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.2, 0.2), vy: rand(-0.2, 0.2),
        r: rand(0.5, 2.5),
        o: rand(0.05, 0.4),
        color: Math.random() > 0.8 ? '0,200,255' : '0,119,182'
      });
    }
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Connections
    ctx.strokeStyle = 'rgba(0,100,150,0.06)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i+1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        if (dx*dx + dy*dy < 12000) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }

    pts.forEach(p => {
      const dx = state.mouse.x - p.x;
      const dy = state.mouse.y - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 120) {
        p.vx += (dx / dist) * 0.05;
        p.vy += (dy / dist) * 0.05;
      }
      p.vx *= 0.98; p.vy *= 0.98;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.o})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
}

// ── ANIMATE HERO TITLES ───────────────────────────────────────
function animateHeroTitles() {
  const lines = qsa('.title-line');
  lines.forEach((line, i) => {
    setTimeout(() => line.classList.add('in'), 200 + i * 180);
  });

  const reveals = qsa('.reveal-item');
  reveals.forEach((el, i) => {
    setTimeout(() => el.classList.add('revealed'), 300 + i * 120);
  });
}

// ── SILHOUETTE CANVAS ─────────────────────────────────────────
function initSilhouette() {
  const canvas = $('silhouette-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Particle system for silhouette
  const pts = [];
  function buildSilhouette() {
    pts.length = 0;
    const cx = W/2, cy = H/2;
    const hw = Math.min(W, 600);

    // Head
    for (let i = 0; i < 300; i++) {
      const a = rand(0, Math.PI * 2);
      const r = rand(0, hw * 0.09);
      pts.push({
        ox: cx + Math.cos(a) * r,
        oy: cy - hw * 0.32 + Math.sin(a) * r,
        x: 0, y: 0, vx: 0, vy: 0
      });
    }
    // Neck
    for (let i = 0; i < 60; i++) {
      pts.push({
        ox: cx + rand(-hw*0.025, hw*0.025),
        oy: cy + rand(-hw*0.215, -hw*0.185),
        x: 0, y: 0, vx: 0, vy: 0
      });
    }
    // Torso
    for (let i = 0; i < 600; i++) {
      pts.push({
        ox: cx + rand(-hw*0.12, hw*0.12),
        oy: cy + rand(-hw*0.18, hw*0.1),
        x: 0, y: 0, vx: 0, vy: 0
      });
    }
    // Arms
    for (let side of [-1, 1]) {
      for (let i = 0; i < 200; i++) {
        const t = rand(0, 1);
        pts.push({
          ox: cx + side * (hw * 0.12 + t * hw * 0.18),
          oy: cy + rand(-hw*0.17, hw*0.08),
          x: 0, y: 0, vx: 0, vy: 0
        });
      }
    }
    // Legs
    for (let side of [-0.05, 0.05]) {
      for (let i = 0; i < 250; i++) {
        pts.push({
          ox: cx + side * hw + rand(-hw*0.055, hw*0.055),
          oy: cy + rand(hw*0.1, hw*0.38),
          x: 0, y: 0, vx: 0, vy: 0
        });
      }
    }

    pts.forEach(p => { p.x = p.ox; p.y = p.oy; });
  }
  buildSilhouette();
  window.addEventListener('resize', () => { resize(); buildSilhouette(); });

  let scroll = 0;
  window.addEventListener('scroll', () => {
    const sec = $('eu-digital');
    if (!sec) return;
    const rect = sec.getBoundingClientRect();
    const total = sec.offsetHeight;
    scroll = clamp(-rect.top / total, 0, 1);
  });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const rect = canvas.getBoundingClientRect();
    const mx = state.mouse.x - rect.left;
    const my = state.mouse.y - rect.top;
    const fragmentation = scroll;

    pts.forEach(p => {
      const dx = mx - p.ox;
      const dy = my - p.oy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const force = Math.max(0, 80 - dist) / 80;

      const fx = -(dx/dist || 0) * force * 30;
      const fy = -(dy/dist || 0) * force * 30;

      const fragX = fragmentation > 0.3
        ? (p.ox - W/2) * fragmentation * 1.5 + rand(-fragmentation*40, fragmentation*40)
        : 0;
      const fragY = fragmentation > 0.3
        ? fragmentation * 60
        : 0;

      const tx = p.ox + fx + fragX;
      const ty = p.oy + fy + fragY;

      p.vx += (tx - p.x) * 0.1;
      p.vy += (ty - p.y) * 0.1;
      p.vx *= 0.8; p.vy *= 0.8;
      p.x += p.vx; p.y += p.vy;

      const alpha = clamp(1 - fragmentation * 1.2, 0, 1);
      const hue = dist < 60 ? `0,200,255` : `0,150,220`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, rand(0.5, 1.5), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${hue},${alpha * rand(0.3, 0.8)})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
}

// ── PHRASE CYCLE ──────────────────────────────────────────────
function initPhraseCycle() {
  const phrases = qsa('.phrase');
  if (!phrases.length) return;

  function next() {
    phrases[state.phraseIdx].classList.remove('active');
    state.phraseIdx = (state.phraseIdx + 1) % phrases.length;
    phrases[state.phraseIdx].classList.add('active');
  }
  setInterval(next, 3200);
}

// ── INTERSECTION OBSERVER (REVEAL) ───────────────────────────
function initIntersectionObserver() {
  const items = qsa('.reveal-item');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => obs.observe(el));

  // Title lines inside hero
  const titleLines = qsa('.title-line');
  const titleObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        qsa('.title-line').forEach((line, i) => {
          setTimeout(() => line.classList.add('in'), i * 180);
        });
        titleObs.disconnect();
      }
    });
  }, { threshold: 0.2 });
  if (titleLines.length) titleObs.observe(titleLines[0].closest('section') || titleLines[0]);
}

// ── TIMELINE SCROLL ───────────────────────────────────────────
function initTimeline() {
  const track = qs('.timeline-track');
  if (!track) return;
  // Enable horizontal scroll with wheel
  track.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      track.scrollLeft += e.deltaY * 0.8;
    }
  }, { passive: false });
}

// ── NAV SCROLL ────────────────────────────────────────────────
function initNavScroll() {
  const nav = $('main-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  });

  // Smooth anchor links
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = $(a.getAttribute('href').slice(1));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
        const mob = $('mobile-nav');
        if (mob) mob.classList.remove('open');
      }
    });
  });
}

// ── NAV TOGGLE ────────────────────────────────────────────────
function initNavToggle() {
  const btn = $('nav-toggle');
  const mob = $('mobile-nav');
  if (!btn || !mob) return;
  btn.addEventListener('click', () => mob.classList.toggle('open'));
}

// ── IA PSICOLÓGICA ────────────────────────────────────────────
const IA_SYSTEM = `Você é a Psi·IA, assistente psicológica digital do projeto de pesquisa acadêmica "Nos Labirintos do Espelho Digital: A idealização da imagem e o eclipse da alteridade na adolescência hiperconectada", desenvolvido na Faculdade CESMAC do Agreste (FEJAL), Arapiraca-AL, no programa PSIC AGRESTE 2025-2026.

A equipe é composta por: Professora Orientadora Wildicleia de Oliveira Santos Lopes, Professor Coorientador Cícero José Barbosa da Fonseca, e as pesquisadoras Jessica Mariane, Maria Eduarda Malta, Franciele Caetano, Priscilla Barbosa, Ramyle Vívian e Emmily Vitória.

O projeto investiga os efeitos do uso excessivo das redes sociais no desenvolvimento da alteridade e nas relações sociais dos adolescentes. Utiliza abordagem qualitativa e bibliográfica com base em Freud, Lacan, Bauman, Levinas, Wallon e Erikson.

Principais conceitos:
- ALTERIDADE: Capacidade de reconhecer o outro como diferente, com opiniões e sentimentos próprios. Nas redes sociais, o outro é frequentemente reduzido à imagem, dificultando o encontro real.
- ESTÁGIO DO ESPELHO (Lacan, 1949): A identidade se constrói pelo olhar do outro. O espelho digital — editado, filtrado — intensifica processos de idealização e fragmentação do eu.
- MODERNIDADE LÍQUIDA (Bauman): Relações digitais são fluidas e descartáveis, dificultando vínculos duradouros.
- ÉTICA DA ALTERIDADE (Levinas): O encontro com o rosto do outro como fundamento ético. No digital, esse rosto é mediado ou ausente.
- MAL-ESTAR (Freud, 1930): A busca por reconhecimento nas redes espelha o mal-estar civilizatório.
- ADOLESCÊNCIA: Fase de construção identitária (Erikson) marcada pelo conflito entre identidade e confusão de papéis, agravado pelas dinâmicas das redes sociais.

Responda de forma elegante, psicanalítica e acessível. Use linguagem sofisticada mas compreensível. Seja concisa (máximo 3-4 parágrafos). Conecte sempre à experiência digital contemporânea. Responda em português.`;

function addMessage(html, isUser = false) {
  const chat = $('ia-chat');
  if (!chat) return;
  const div = document.createElement('div');

  if (isUser) {
    div.className = 'ia-user-bubble';
    div.textContent = html;
  } else {
    div.className = 'ia-message ia-msg';
    div.innerHTML = `
      <div class="ia-msg-avatar">◈</div>
      <div class="ia-msg-bubble">${html}</div>
    `;
  }

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

function addTyping() {
  const chat = $('ia-chat');
  if (!chat) return null;
  const div = document.createElement('div');
  div.className = 'ia-message ia-msg';
  div.id = 'ia-typing-indicator';
  div.innerHTML = `
    <div class="ia-msg-avatar">◈</div>
    <div class="ia-msg-bubble">
      <div class="ia-typing"><span></span><span></span><span></span></div>
    </div>
  `;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

async function queryIA(userMsg) {
  state.iaHistory.push({ role: 'user', content: userMsg });

  const typingEl = addTyping();
  const sendBtn = $('ia-send');
  if (sendBtn) sendBtn.disabled = true;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: IA_SYSTEM,
        messages: state.iaHistory
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || 'Não foi possível processar sua pergunta.';

    if (typingEl) typingEl.remove();

    // Format text to HTML
    const formatted = text
      .split('\n\n')
      .filter(p => p.trim())
      .map(p => `<p>${p.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')}</p>`)
      .join('');

    addMessage(formatted);
    state.iaHistory.push({ role: 'assistant', content: text });

  } catch (err) {
    if (typingEl) typingEl.remove();
    addMessage('<p>Houve uma falha na conexão com o servidor. Por favor, tente novamente.</p>');
  } finally {
    if (sendBtn) sendBtn.disabled = false;
  }
}

function sendMessage() {
  const input = $('ia-input');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  addMessage(msg, true);
  queryIA(msg);
}

function sendSuggestion(btn) {
  const msg = btn.textContent.trim();
  addMessage(msg, true);
  queryIA(msg);
}

// Enter key support
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && document.activeElement.id === 'ia-input') {
    sendMessage();
  }
});

// ── OCCASIONAL GLITCH ─────────────────────────────────────────
(function initGlitch() {
  const hero = qs('.hero-title');
  if (!hero) return;
  setInterval(() => {
    if (Math.random() > 0.92) {
      hero.classList.add('glitch-text');
      setTimeout(() => hero.classList.remove('glitch-text'), 600);
    }
  }, 4000);
})();

// ── SUBTLE BACKGROUND BREATHING ───────────────────────────────
(function initBreathing() {
  let t = 0;
  function breath() {
    t += 0.005;
    const r = Math.sin(t) * 2;
    document.body.style.setProperty('--breath', r);
    requestAnimationFrame(breath);
  }
  breath();
})();

// Expose for HTML onclick
window.sendMessage = sendMessage;
window.sendSuggestion = sendSuggestion;
