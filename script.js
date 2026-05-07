/* ============================================================
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
