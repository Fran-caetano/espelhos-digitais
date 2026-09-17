/* ============================================================
   ESPELHO DIGITAL — SCRIPT SYSTEM (CORRIGIDO)
   Faculdade CESMAC do Agreste · PSIC AGRESTE 2025-2026
   ============================================================ */

'use strict';

// ── STATE ────────────────────────────────────────────────────
const state = {
  mouse: { x: -999, y: -999, rx: 0.5, ry: 0.5 },
  phraseIdx: 0,
  loaded: false,
  siteReady: false
};

// ── UTILITY ──────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => [...document.querySelectorAll(sel)];
const rand = (a, b) => Math.random() * (b - a) + a;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const isTouch = window.matchMedia('(hover: none)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── MOUSE TRACKING ───────────────────────────────────────────
document.addEventListener('mousemove', (e) => {
  state.mouse.x = e.clientX;
  state.mouse.y = e.clientY;
  state.mouse.rx = e.clientX / window.innerWidth;
  state.mouse.ry = e.clientY / window.innerHeight;
}, { passive: true });

// ── CUSTOM CURSOR (desativado em touch) ──────────────────────
(function initCursor() {
  const dot  = $('cursor-dot');
  const ring = $('cursor-ring');
  if (!dot || !ring) return;

  if (isTouch) {
    dot.style.display = 'none';
    ring.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  let tx = 0, ty = 0;
  function loop() {
    tx += (state.mouse.x - tx) * 0.12;
    ty += (state.mouse.y - ty) * 0.12;
    dot.style.transform  = `translate(${state.mouse.x}px, ${state.mouse.y}px) translate(-50%,-50%)`;
    ring.style.transform = `translate(${tx}px, ${ty}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .teoria-card, .ia-sug, .mirror-container')) {
      ring.classList.add('hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, .teoria-card, .ia-sug, .mirror-container')) {
      ring.classList.remove('hover');
    }
  });
})();

// ── LOADER ───────────────────────────────────────────────────
(function initLoader() {
  const canvas = $('loader-canvas');
  let stop = false;

  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let W, H;
    const particles = [];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: rand(0, window.innerWidth),
        y: rand(0, window.innerHeight),
        r: rand(0.5, 2),
        vx: rand(-0.3, 0.3),
        vy: rand(-0.3, 0.3),
        o: rand(0.1, 0.5)
      });
    }

    (function draw() {
      if (stop) return;
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
      requestAnimationFrame(draw);
    })();
  }

  setTimeout(() => {
    const bar = qs('.loader-bar');
    if (bar) bar.style.width = '100%';
  }, 100);

  setTimeout(() => {
    stop = true;
    state.loaded = true;
    const loader = $('loader');
    if (loader) loader.classList.add('done');
    initMirrorIntro();
  }, 2600);
})();

// ── MIRROR INTRO ─────────────────────────────────────────────
function initMirrorIntro() {
  const container = $('mirror-container');
  const canvas = $('mirror-canvas');

  // Garantia: se algo faltar no HTML, entra direto no site (nunca trava).
  if (!container || !canvas) { shatterMirror(); return; }

  const ctx = canvas.getContext('2d');
  const pbCanvas = $('particle-bg');
  const pbCtx = pbCanvas ? pbCanvas.getContext('2d') : null;

  let W = canvas.offsetWidth  || 400;
  let H = canvas.offsetHeight || 500;
  canvas.width = W; canvas.height = H;
  if (pbCanvas) {
    pbCanvas.width  = window.innerWidth;
    pbCanvas.height = window.innerHeight;
  }

  const mirrorParticles = [];
  for (let i = 0; i < 60; i++) {
    mirrorParticles.push({
      x: rand(0, W), y: rand(0, H),
      r: rand(0.5, 2.5),
      vx: rand(-0.4, 0.4), vy: rand(-0.4, 0.4),
      o: rand(0.1, 0.6),
      color: Math.random() > 0.7 ? '255,255,255' : '0,200,255'
    });
  }

  const bgParticles = [];
  for (let i = 0; i < 100; i++) {
    bgParticles.push({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      r: rand(0.3, 1.5),
      vx: rand(-0.15, 0.15), vy: rand(-0.15, 0.15),
      o: rand(0.05, 0.3)
    });
  }

  let t = 0, animId = null, running = true;

  function drawMirror() {
    if (!running) return;
    t++;
    const rect = container.getBoundingClientRect();
    const mx = state.mouse.x - rect.left;
    const my = state.mouse.y - rect.top;

    ctx.clearRect(0, 0, W, H);

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0,   '#060d18');
    grad.addColorStop(0.4, '#0a1826');
    grad.addColorStop(1,   '#030a12');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    if (mx > 0 && mx < W && my > 0 && my < H) {
      const mg = ctx.createRadialGradient(mx, my, 0, mx, my, 160);
      mg.addColorStop(0, 'rgba(0,200,255,0.08)');
      mg.addColorStop(1, 'rgba(0,200,255,0)');
      ctx.fillStyle = mg;
      ctx.fillRect(0, 0, W, H);
    }

    const cg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, H * 0.6);
    cg.addColorStop(0, `rgba(0,119,182,${0.06 + 0.02 * Math.sin(t * 0.02)})`);
    cg.addColorStop(0.5, 'rgba(0,50,100,0.04)');
    cg.addColorStop(1, 'rgba(0,50,100,0)');
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = `rgba(0,200,255,${0.3 + 0.1 * Math.sin(t * 0.03)})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, W - 2, H - 2);
    ctx.strokeStyle = 'rgba(0,200,255,0.1)';
    ctx.strokeRect(8, 8, W - 16, H - 16);

    const scanY = (t * 1.5) % (H + 40) - 20;
    const sl = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
    sl.addColorStop(0, 'rgba(0,200,255,0)');
    sl.addColorStop(0.5, 'rgba(0,200,255,0.15)');
    sl.addColorStop(1, 'rgba(0,200,255,0)');
    ctx.fillStyle = sl;
    ctx.fillRect(0, scanY - 2, W, 4);

    ctx.strokeStyle = 'rgba(0,200,255,0.06)';
    ctx.lineWidth = 0.5;
    [[W*0.5, 0, W*0.3, H*0.4],
     [W*0.5, H*0.4, W*0.7, H*0.8],
     [W*0.5, H*0.4, W*0.2, H*0.7],
     [W*0.5, H*0.4, W*0.6, H]].forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    });

    mirrorParticles.forEach(p => {
      const dx = mx - p.x, dy = my - p.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < 100) { p.vx -= (dx / dist) * 0.3; p.vy -= (dy / dist) * 0.3; }
      p.vx *= 0.96; p.vy *= 0.96;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.o})`;
      ctx.fill();
    });

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

  function enter() {
    if (!running) return;         // impede clique duplo
    running = false;
    if (animId) cancelAnimationFrame(animId);
    shatterMirror();
  }

  container.addEventListener('click', enter);
  container.addEventListener('touchstart', (e) => { e.preventDefault(); enter(); }, { passive: false });
  // Escape de segurança: qualquer tecla também atravessa o espelho
  document.addEventListener('keydown', enter, { once: true });
}

// ── GLASS SHATTER ────────────────────────────────────────────
function shatterMirror() {
  if (state.siteReady) return;
  state.siteReady = true;

  const overlay = $('shatter-overlay');
  const intro   = $('mirror-intro');
  const site    = $('main-site');

  if (overlay && !reduceMotion) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    for (let i = 0; i < 24; i++) {
      const shard = document.createElement('div');
      shard.className = 'shard';
      const size  = rand(60, 200);
      const angle = rand(0, 360);
      const dist  = rand(200, 800);
      shard.style.cssText = `
        left:${cx - size/2 + rand(-100,100)}px;
        top:${cy - size/2 + rand(-100,100)}px;
        width:${size}px;height:${size}px;
        --tx:${Math.cos(angle * Math.PI/180) * dist}px;
        --ty:${Math.sin(angle * Math.PI/180) * dist}px;
        --rot:${rand(-540,540)}deg;--dur:${rand(0.6,1.2)}s;
        animation-delay:${rand(0,0.15)}s;`;
      overlay.appendChild(shard);
    }
  }

  setTimeout(() => {
    if (intro) intro.classList.add('gone');
    if (site) {
      site.classList.remove('hidden');
      requestAnimationFrame(() => site.classList.add('visible'));
    }

    initHero();
    initSilhouette();
    initIntersectionObserver();
    initTimeline();
    initPhraseCycle();
    initNavScroll();
    initNavToggle();
    animateHeroTitles();

    setTimeout(() => {
      if (intro) intro.style.display = 'none';
      if (overlay) { overlay.innerHTML = ''; overlay.style.display = 'none'; }
    }, 1800);
  }, 400);
}

// ── HERO CANVAS ──────────────────────────────────────────────
function initHero() {
  const canvas = $('hero-canvas');
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, pts = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    const count = W < 700 ? 45 : 90;
    pts = [];
    for (let i = 0; i < count; i++) {
      pts.push({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.2, 0.2), vy: rand(-0.2, 0.2),
        r: rand(0.5, 2.5), o: rand(0.05, 0.4),
        color: Math.random() > 0.8 ? '0,200,255' : '0,119,182'
      });
    }
  }
  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(0,100,150,0.06)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        if (dx*dx + dy*dy < 12000) {
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
        }
      }
    }
    ctx.stroke();

    const rect = canvas.getBoundingClientRect();
    pts.forEach(p => {
      const dx = (state.mouse.x - rect.left) - p.x;
      const dy = (state.mouse.y - rect.top) - p.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < 120) { p.vx += (dx / dist) * 0.05; p.vy += (dy / dist) * 0.05; }
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

// ── ANIMATE HERO TITLES ──────────────────────────────────────
function animateHeroTitles() {
  qsa('.title-line').forEach((line, i) => {
    setTimeout(() => line.classList.add('in'), 200 + i * 180);
  });
  qsa('#hero .reveal-item').forEach((el, i) => {
    setTimeout(() => el.classList.add('revealed'), 300 + i * 120);
  });
}

// ── SILHOUETTE CANVAS ────────────────────────────────────────
function initSilhouette() {
  const canvas = $('silhouette-canvas');
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;
  const pts = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function buildSilhouette() {
    pts.length = 0;
    const cx = W / 2, cy = H / 2;
    const hw = Math.min(W, 600);
    const push = (ox, oy) => pts.push({ ox, oy, x: ox, y: oy, vx: 0, vy: 0 });

    for (let i = 0; i < 220; i++) {                       // cabeça
      const a = rand(0, Math.PI * 2), r = rand(0, hw * 0.09);
      push(cx + Math.cos(a) * r, cy - hw * 0.32 + Math.sin(a) * r);
    }
    for (let i = 0; i < 50; i++)                          // pescoço
      push(cx + rand(-hw*0.025, hw*0.025), cy + rand(-hw*0.215, -hw*0.185));
    for (let i = 0; i < 420; i++)                         // tronco
      push(cx + rand(-hw*0.12, hw*0.12), cy + rand(-hw*0.18, hw*0.1));
    for (const side of [-1, 1])                           // braços
      for (let i = 0; i < 150; i++)
        push(cx + side * (hw*0.12 + rand(0,1) * hw*0.18), cy + rand(-hw*0.17, hw*0.08));
    for (const side of [-0.05, 0.05])                     // pernas
      for (let i = 0; i < 180; i++)
        push(cx + side * hw + rand(-hw*0.055, hw*0.055), cy + rand(hw*0.1, hw*0.38));
  }

  resize(); buildSilhouette();
  window.addEventListener('resize', () => { resize(); buildSilhouette(); });

  let fragmentation = 0;
  window.addEventListener('scroll', () => {
    const sec = $('eu-digital');
    if (!sec) return;
    const rect = sec.getBoundingClientRect();
    fragmentation = clamp(-rect.top / sec.offsetHeight, 0, 1);
  }, { passive: true });

  function draw() {
    const rect = canvas.getBoundingClientRect();
    // Pausa quando fora da tela: evita travar a página
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      requestAnimationFrame(draw);
      return;
    }
    ctx.clearRect(0, 0, W, H);
    const mx = state.mouse.x - rect.left;
    const my = state.mouse.y - rect.top;
    const alpha = clamp(1 - fragmentation * 1.2, 0, 1);

    pts.forEach(p => {
      const dx = mx - p.ox, dy = my - p.oy;
      const dist = Math.hypot(dx, dy) || 1;
      const force = Math.max(0, 80 - dist) / 80;
      const fx = -(dx / dist) * force * 30;
      const fy = -(dy / dist) * force * 30;

      const fragX = fragmentation > 0.3
        ? (p.ox - W/2) * fragmentation * 1.5 + rand(-fragmentation*40, fragmentation*40) : 0;
      const fragY = fragmentation > 0.3 ? fragmentation * 60 : 0;

      p.vx += ((p.ox + fx + fragX) - p.x) * 0.1;
      p.vy += ((p.oy + fy + fragY) - p.y) * 0.1;
      p.vx *= 0.8; p.vy *= 0.8;
      p.x += p.vx; p.y += p.vy;

      ctx.beginPath();
      ctx.arc(p.x, p.y, rand(0.5, 1.5), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${dist < 60 ? '0,200,255' : '0,150,220'},${alpha * rand(0.3, 0.8)})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ── PHRASE CYCLE ─────────────────────────────────────────────
function initPhraseCycle() {
  const phrases = qsa('.phrase');
  if (phrases.length < 2) return;
  setInterval(() => {
    phrases[state.phraseIdx].classList.remove('active');
    state.phraseIdx = (state.phraseIdx + 1) % phrases.length;
    phrases[state.phraseIdx].classList.add('active');
  }, 3200);
}

// ── INTERSECTION OBSERVER (REVEAL) ───────────────────────────
function initIntersectionObserver() {
  const items = qsa('.reveal-item');
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('revealed'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(el => obs.observe(el));
}

// ── TIMELINE SCROLL ──────────────────────────────────────────
function initTimeline() {
  const track = qs('.timeline-track');
  if (!track) return;
  track.addEventListener('wheel', (e) => {
    const atStart = track.scrollLeft <= 0;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    // Só sequestra a roda se ainda houver trilho para percorrer
    if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;
    e.preventDefault();
    track.scrollLeft += e.deltaY * 0.8;
  }, { passive: false });
}

// ── NAV ──────────────────────────────────────────────────────
function initNavScroll() {
  const nav = $('main-nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 80);
    }, { passive: true });
  }
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = $(a.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      const mob = $('mobile-nav');
      if (mob) mob.classList.remove('open');
    });
  });
}

function initNavToggle() {
  const btn = $('nav-toggle');
  const mob = $('mobile-nav');
  if (!btn || !mob) return;
  btn.addEventListener('click', () => mob.classList.toggle('open'));
}

// ══════════════════════════════════════════════════════════════
// CHATBOT LOCAL — 100% offline, funciona em GitHub Pages
// ══════════════════════════════════════════════════════════════

const KB = [
  {
    keys: ['projeto','pesquisa','sobre','trata','tema','titulo','espelho digital','labirintos','o que e'],
    answer: `<p>Este projeto se chama <strong>"Nos Labirintos do Espelho Digital: A idealização da imagem e o eclipse da alteridade na adolescência hiperconectada"</strong>.</p>
<p>Foi desenvolvido na <strong>Faculdade CESMAC do Agreste (FEJAL)</strong>, em Arapiraca-AL, dentro do <strong>Programa Semente de Iniciação Científica – PSIC AGRESTE 2025-2026</strong>, vinculado ao Núcleo de Apoio à Pesquisa (NAP).</p>
<p>O objetivo central é investigar os efeitos do uso excessivo das redes sociais e outras formas de comunicação virtual no <strong>desenvolvimento da alteridade</strong> e nas relações sociais dos adolescentes.</p>`
  },
  {
    keys: ['objetivo','objetivos','proposito','finalidade','pretende','investigar'],
    answer: `<p>O <strong>objetivo principal</strong> é compreender de que maneira a virtualidade, usada de forma excessiva, interfere nas relações sociais dos adolescentes e no desenvolvimento da alteridade.</p>
<p>→ Analisar como o ambiente digital influenciou a construção da identidade adolescente;<br>
→ Investigar como os jovens vivenciam suas relações no mundo virtual e as consequências para o presencial;<br>
→ Compreender como a internet molda a forma como os jovens lidam com a diferença e com a própria identidade.</p>
<p>A pesquisa também visa promover reflexões que contribuam para um <strong>uso mais consciente das tecnologias</strong>.</p>`
  },
  {
    keys: ['hipotese','pressuposto','parte de'],
    answer: `<p>O projeto parte da hipótese de que <strong>a virtualidade, quando utilizada de maneira excessiva e sem mediação, pode fragilizar habilidades sociais importantes para o convívio humano</strong>.</p>
<p>Isso inclui dificuldades em expressar empatia, dialogar de forma assertiva, criar vínculos significativos e reconhecer o outro como sujeito — especialmente nas interações presenciais.</p>`
  },
  {
    keys: ['metodologia','metodo','como foi feita','abordagem','qualitativa','bibliografica','etapas'],
    answer: `<p>O projeto adota uma <strong>abordagem qualitativa e bibliográfica</strong>, com perspectiva indutiva.</p>
<p>Inicialmente estava estruturado em duas etapas: revisão bibliográfica e pesquisa de campo com entrevistas em escolas. As exigências éticas, logísticas e o tempo disponível para pesquisa com menores de idade tornaram a etapa de campo inviável no cronograma.</p>
<p>Por isso, a pesquisa foi <strong>reformulada para um estudo exclusivamente bibliográfico</strong> — articulando psicanálise, psicologia do desenvolvimento e filosofia da alteridade.</p>`
  },
  {
    keys: ['alteridade','o outro','reconhecer outro','diferenca','outro como sujeito'],
    answer: `<p><strong>Alteridade</strong> é a capacidade de reconhecer o outro como um ser diferente, com opiniões, sentimentos e formas de pensar próprias. É a abertura ao encontro genuíno com o diferente.</p>
<p>Na perspectiva de <strong>Emmanuel Levinas</strong>, o encontro com o rosto do outro é o fundamento ético das relações humanas. No ambiente virtual, esse rosto é frequentemente mediado, fragmentado ou ausente.</p>
<p>Nesta pesquisa, a alteridade é entendida como uma habilidade que se desenvolve principalmente nas <strong>interações presenciais</strong> — na escuta ativa, na convivência e na empatia.</p>`
  },
  {
    keys: ['lacan','estagio do espelho','estadio','espelho','identificacao','imagem','outro simbolico'],
    answer: `<p><strong>Jacques Lacan</strong> (1901–1981) formulou em 1949 a teoria do <strong>Estádio do Espelho</strong>: a criança passa a se reconhecer como um eu unificado ao ver sua imagem refletida.</p>
<p>Na hiperconectividade, o adolescente encontra um espelho digital — <strong>editado, filtrado, idealizado</strong>. Esse espelho intensifica processos identificatórios marcados por idealizações e pode dificultar o reconhecimento da própria falta.</p>
<p>As identificações contemporâneas se dão não apenas na relação com o semelhante, mas via <strong>imagens digitais cuidadosamente curadas</strong>.</p>`
  },
  {
    keys: ['freud','mal-estar','mal estar','civilizacao','reconhecimento','aprovacao'],
    answer: `<p><strong>Sigmund Freud</strong> (1856–1939) contribui especialmente por <em>O Mal-Estar na Civilização</em> (1930), onde já apontava as estranhezas do processo civilizatório.</p>
<p>Na contemporaneidade isso se potencializa: a busca por curtidas, seguidores e aprovação digital é uma versão amplificada desse mal-estar, com <strong>ideais e admirações inatingíveis</strong> produzidos para gerar efeitos de perfeição.</p>
<p>O sofrimento psíquico do adolescente hiperconectado não é novo — é uma expressão contemporânea de uma tensão estrutural entre o sujeito e a civilização.</p>`
  },
  {
    keys: ['bauman','modernidade liquida','liquida','vinculos','descartavel','relacoes passageiras'],
    answer: `<p><strong>Zygmunt Bauman</strong> (1925–2017) e a <strong>Modernidade Líquida</strong>: os vínculos sólidos se dissolvem e as relações tornam-se fluidas, instáveis e descartáveis.</p>
<p>No ambiente virtual, o outro pode ser bloqueado, ignorado ou substituído com um clique. As relações online, embora aparentemente intensas, são muitas vezes superficiais — gerando <strong>solidão, ansiedade e dificuldade de conexão emocional</strong>.</p>
<p>Essa lógica dificulta o desenvolvimento da alteridade e leva o adolescente a buscar nas redes um reconhecimento precário e temporário.</p>`
  },
  {
    keys: ['levinas','rosto','etica','exterioridade','totalidade','infinito','encontro etico'],
    answer: `<p><strong>Emmanuel Levinas</strong> (1906–1995) fundamenta a discussão sobre <strong>ética da alteridade</strong>. Em <em>Totalidade e Infinito</em> (1961), o encontro com o rosto do outro é o fundamento ético das relações humanas.</p>
<p>No contexto virtual, esse encontro é frequentemente <strong>mediado ou ausente</strong>: não vemos o rosto real, não percebemos o corpo, não sentimos a presença — o que favorece processos de desumanização.</p>
<p>A ausência do corpo reduz a percepção do outro como sujeito, comprometendo o respeito ao que é da ordem da diferença.</p>`
  },
  {
    keys: ['wallon','afetividade','emocao','expressao afetiva','desenvolvimento afetivo'],
    answer: `<p><strong>Henri Wallon</strong> (1879–1962) destaca que a <strong>afetividade ocupa lugar central no desenvolvimento humano</strong>. As emoções e trocas afetivas são estruturantes do psiquismo desde a infância.</p>
<p>A mediação tecnológica tende a <strong>reconfigurar as formas de expressão afetiva</strong>, esvaziando a densidade das relações e restringindo a interação a respostas imediatas e superficiais.</p>
<p>Isso repercute na construção da empatia e da alteridade.</p>`
  },
  {
    keys: ['erikson','identidade','crise','confusao de papeis','construcao do eu'],
    answer: `<p><strong>Erik Erikson</strong> (1902–1994), em <em>Identidade: Juventude e Crise</em> (1968), descreve a adolescência pelo conflito entre <strong>identidade e confusão de papéis</strong>.</p>
<p>É quando o indivíduo constrói sua identidade, questiona padrões e busca autonomia. O contato com o outro é essencial nesse processo.</p>
<p>As redes sociais <strong>ampliam as possibilidades de identificação</strong>, mas intensificam a instabilidade e a fragmentação do eu, exacerbando a crise eriksoniana pela comparação constante.</p>`
  },
  {
    keys: ['adolescencia','adolescente','jovem','puberdade','nativo digital','geracao'],
    answer: `<p>A <strong>adolescência</strong> é entendida como fase crucial do desenvolvimento — período de descobertas, transformação da identidade e necessidade de pertencimento.</p>
<p>Piletti (2024, p.155) define a adolescência como fase preparatória para a entrada no mundo adulto, caracterizada por alterações corporais, hormonais, psicológicas, cognitivas e sociais.</p>
<p>Os "nativos digitais" cresceram com o mundo virtual presente em quase todas as dimensões da vida — o que molda comportamentos, emoções e percepções sobre o outro e sobre si.</p>`
  },
  {
    keys: ['redes sociais','instagram','tiktok','whatsapp','plataformas','curtidas','filtros','feed','algoritmo'],
    answer: `<p>As <strong>redes sociais</strong> são o objeto central desta pesquisa. Instagram, TikTok e WhatsApp transformaram as formas de comunicação e relacionamento entre adolescentes.</p>
<p>As interações são marcadas por <strong>filtros, curtidas, comentários rápidos e busca constante por aprovação</strong>, com construções de imagem que buscam efeitos de perfeição.</p>
<p>O problema não está na tecnologia em si, mas na <strong>forma como é utilizada</strong>: com consciência, é ferramenta positiva; em excesso e sem mediação, traz prejuízos ao desenvolvimento humano e social.</p>`
  },
  {
    keys: ['resultado','resultados','conclusao','concluiu','descobriu','achados','o que encontrou'],
    answer: `<p>Os resultados indicam que o <strong>desenvolvimento da alteridade na adolescência contemporânea é profundamente atravessado pelas transformações nas formas de laço social</strong>.</p>
<p>→ Novos atravessamentos mediados pela virtualidade na construção da identidade (Erikson);<br>
→ A mediação tecnológica reconfigura expressões afetivas (Wallon);<br>
→ Identificações via imagens digitais idealizadas (Lacan);<br>
→ Vínculos virtuais mais fluidos e descartáveis (Bauman);<br>
→ A ausência do rosto compromete o exercício ético com o outro (Levinas).</p>
<p>Por outro lado, a virtualidade também pode ser <strong>espaço de apoio e pertencimento</strong>. A conclusão aponta para a necessidade de equilíbrio e de um uso mais consciente das tecnologias.</p>`
  },
  {
    keys: ['equipe','quem fez','pesquisadoras','orientadora','integrantes','coorientador','wildicleia','cicero'],
    answer: `<p>Equipe da <strong>Faculdade CESMAC do Agreste</strong>:</p>
<p><strong>Orientadora:</strong> Profa. Wildicleia de Oliveira Santos Lopes<br>
<strong>Coorientador:</strong> Prof. Cícero José Barbosa da Fonseca</p>
<p><strong>Pesquisadoras:</strong><br>
· Jessica Mariane da Silva Santos<br>
· Maria Eduarda Malta Ramos<br>
· Franciele Caetano Soares da Silva<br>
· Priscilla Silva Barbosa<br>
· Ramyle Vívian de Lima Santos<br>
· Emmily Vitória Barros Dos Prazeres</p>
<p>Desenvolvido entre <strong>maio de 2025 e abril de 2026</strong>, no PSIC, vinculado ao NAP da FEJAL.</p>`
  },
  {
    keys: ['dificuldades','desafios','problemas','entraves','limitacoes','reformulacao'],
    answer: `<p>A principal dificuldade foi a <strong>necessidade de reformular a metodologia</strong>. A proposta inicial previa entrevistas com adolescentes de escolas públicas e privadas, mas exigências éticas, logísticas e de tempo tornaram a etapa inviável.</p>
<p>A pesquisa foi redirecionada para um formato <strong>exclusivamente bibliográfico</strong>, mantendo qualidade e profundidade.</p>
<p>Outra dificuldade foi a <strong>gestão do tempo</strong>, já que as integrantes conciliam o projeto com graduação e estágios.</p>`
  },
  {
    keys: ['pontos positivos','positivo','conquistas','aprendizado','amadurecimento','formacao'],
    answer: `<p>Destaca-se o <strong>engajamento e a dedicação de toda a equipe</strong> ao longo do processo.</p>
<p>A riqueza do material bibliográfico sobre psicanálise, adolescência e virtualidade permitiu aprofundar o tema. A <strong>orientação da professora Wildicleia</strong> foi essencial, especialmente no redirecionamento metodológico.</p>
<p>A aproximação com Freud, Lacan e Bauman de forma contextualizada trouxe <strong>amadurecimento teórico</strong> para a formação das pesquisadoras.</p>`
  },
  {
    keys: ['palavras-chave','palavras chave','keywords','termos'],
    answer: `<p>As <strong>palavras-chave</strong> do projeto:</p>
<p><strong>Adolescência · Redes Sociais · Virtualidade · Alteridade · Relações Sociais · Psicanálise · Identidade · Hiperconectividade</strong></p>`
  },
  {
    keys: ['referencias','referencia','bibliografia','autores','livros','obras citadas','fontes'],
    answer: `<p>Principais <strong>referências</strong>:</p>
<p>· ALBERTO, Sônia. <em>O adolescente e o Outro.</em> Zahar, 2004.<br>
· BAUMAN, Zygmunt. <em>Modernidade líquida.</em> Zahar, 2001.<br>
· ERIKSON, Erik H. <em>Identidade: juventude e crise.</em> Zahar, 1976.<br>
· FREUD, Sigmund. <em>O mal-estar na civilização.</em> Companhia das Letras, 2010.<br>
· LACAN, Jacques. O estádio do espelho (1949). In: <em>Escritos.</em> Zahar, 1998.<br>
· LEVINAS, Emmanuel. <em>Totalidade e infinito.</em> Edições 70, 2008.<br>
· MENDES, E. D. Impasses na constituição do sujeito causado pelas tecnologias digitais. <em>Revista Subjetividades</em>, 2020.<br>
· PILETTI, N. et al. <em>Psicologia do desenvolvimento.</em> Contexto, 2024.<br>
· WALLON, Henrique. <em>A evolução psicológica da criança.</em> Martins Fontes, 2007.</p>`
  },
  {
    keys: ['familia','pais','escola','educacao','professor','mediacao','orientacao','adultos'],
    answer: `<p><strong>Família, escola e profissionais de saúde mental</strong> assumem papel fundamental na sustentação do adolescente.</p>
<p>Quando o suporte simbólico familiar se enfraquece, o adolescente pode buscar nas redes um espaço de reconhecimento e pertencimento — ainda que precário.</p>
<p>A presença de <strong>espaços de escuta</strong> é essencial, assim como estratégias educativas que favoreçam a reflexão crítica sobre o uso das tecnologias.</p>`
  },
  {
    keys: ['beneficio','lado bom','tecnologia positiva','apoio','pertencimento','grupos','saude mental'],
    answer: `<p>A pesquisa tem uma visão <strong>não reducionista da virtualidade</strong>: o digital não é apenas espaço de risco.</p>
<p>As redes podem funcionar como <strong>dispositivos de apoio</strong> — grupos ligados à saúde mental, diversidade e causas sociais favorecem vínculos significativos e fortalecimento da identidade.</p>
<p>O que se evidencia é a importância de um <strong>equilíbrio</strong> entre as dimensões virtual e presencial.</p>`
  },
  {
    keys: ['ola','oi','bom dia','boa tarde','boa noite','hey','tudo bem','como vai','hello'],
    answer: `<p>Olá! Sou a <strong>Psi·IA</strong>, assistente digital do projeto <em>Nos Labirintos do Espelho Digital</em>.</p>
<p>Você pode me perguntar sobre:</p>
<p>→ Objetivos e metodologia<br>
→ Alteridade, identidade e hiperconectividade<br>
→ Lacan, Freud, Bauman, Levinas, Wallon, Erikson<br>
→ Resultados e conclusões<br>
→ A equipe de pesquisadoras</p>`
  },
  {
    keys: ['obrigado','obrigada','valeu','thanks','grato','grata'],
    answer: `<p>De nada! Se tiver mais dúvidas sobre <em>adolescência, alteridade, psicanálise ou hiperconectividade</em>, é só perguntar.</p>`
  }
];

const DEFAULT_REPLIES = [
  `<p>Não encontrei uma resposta específica para isso no conteúdo do projeto. Tente reformular a pergunta.</p><p>Posso responder sobre: <strong>alteridade, Lacan, Freud, Bauman, Levinas, Wallon, Erikson, adolescência, redes sociais, metodologia, equipe, resultados e conclusão.</strong></p>`,
  `<p>Essa pergunta está um pouco fora do escopo do projeto. Experimente perguntar sobre os <strong>conceitos teóricos</strong>, os <strong>autores</strong> ou os <strong>resultados</strong>.</p>`,
  `<p>Não tenho dados suficientes sobre esse tópico. Mas posso falar sobre a <strong>influência das redes sociais na adolescência</strong> ou sobre qualquer autor citado.</p>`
];

let _defIdx = 0;

const normalize = (s) => s.toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ').trim();

function findAnswer(input) {
  const q = normalize(input);
  let best = null, bestScore = 0;

  for (const entry of KB) {
    let score = 0;
    for (const kw of entry.keys) {
      const k = normalize(kw);
      if (k && q.includes(k)) score += k.split(' ').length;
    }
    if (score > bestScore) { bestScore = score; best = entry; }
  }
  if (best) return best.answer;
  return DEFAULT_REPLIES[_defIdx++ % DEFAULT_REPLIES.length];
}

// ── UI DO CHAT ───────────────────────────────────────────────
function chatAddMsg(content, isUser = false) {
  const chat = $('ia-chat');
  if (!chat) return;
  const wrap = document.createElement('div');
  if (isUser) {
    wrap.className = 'ia-user-bubble';
    wrap.textContent = content;               // texto do usuário nunca vira HTML
  } else {
    wrap.className = 'ia-message ia-msg';
    wrap.innerHTML = `<div class="ia-msg-avatar">◈</div><div class="ia-msg-bubble">${content}</div>`;
  }
  chat.appendChild(wrap);
  chat.scrollTop = chat.scrollHeight;
}

function chatTyping(show) {
  const existing = $('chat-typing');
  const chat = $('ia-chat');
  if (!chat) return;
  if (show && !existing) {
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

let chatBusy = false;

function chatRespond(userMsg) {
  if (chatBusy) return;
  chatBusy = true;
  const send = $('ia-send');
  const input = $('ia-input');
  if (send) send.disabled = true;
  if (input) input.disabled = true;

  chatTyping(true);
  setTimeout(() => {
    chatTyping(false);
    chatAddMsg(findAnswer(userMsg), false);
    chatBusy = false;
    if (send) send.disabled = false;
    if (input) { input.disabled = false; input.focus(); }
  }, 600 + Math.random() * 700);
}

function sendMessage() {
  const input = $('ia-input');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg || chatBusy) return;
  input.value = '';
  chatAddMsg(msg, true);
  chatRespond(msg);
}

function sendSuggestion(btn) {
  const msg = btn.textContent.trim();
  if (chatBusy) return;
  chatAddMsg(msg, true);
  chatRespond(msg);
}

// ── EVENT LISTENERS DO CHAT ──────────────────────────────────
function initChat() {
  const sendBtn = $('ia-send');
  const inputEl = $('ia-input');
  if (sendBtn) sendBtn.addEventListener('click', sendMessage);
  if (inputEl) inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
  });
  qsa('.ia-sug').forEach(btn => btn.addEventListener('click', () => sendSuggestion(btn)));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChat);
} else {
  initChat();
}

// ── GLITCH OCASIONAL ─────────────────────────────────────────
(function initGlitch() {
  if (reduceMotion) return;
  setInterval(() => {
    const hero = qs('.hero-title');
    if (!hero) return;
    if (Math.random() > 0.92) {
      hero.classList.add('glitch-text');
      setTimeout(() => hero.classList.remove('glitch-text'), 600);
    }
  }, 4000);
})();

// Expostos para os onclick do HTML
window.sendMessage = sendMessage;
window.sendSuggestion = sendSuggestion;
