/* =============================================
   HEXAWARE - Main Router & Transitions
   ============================================= */

'use strict';

/* ─── Global State ─── */
window.HEX = {
  currentPage: null,
  warpCanvas: null,
  warpCtx: null,
  warpParticles: [],
  isTransitioning: false
};

/* ─── Page IDs ─── */
const PAGES = {
  splash:    'page-splash',
  home:      'page-home',
  dashboard: 'page-dashboard',
  admin:     'page-admin',
  agents:    'page-agents'
};

/* ─── Init on DOM ready ─── */
document.addEventListener('DOMContentLoaded', () => {
  initWarpCanvas();
  initNavLinks();
  showPage('splash');
  updateNavActive('splash');
});

/* ─── Nav ─── */
function initNavLinks() {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => {
      const target = el.dataset.nav;
      navigateTo(target);
    });
  });
}

function updateNavActive(pageKey) {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.classList.toggle('active', el.dataset.nav === pageKey);
  });
}

/* ─── Page Navigation ─── */
window.navigateTo = function(pageKey) {
  if (HEX.isTransitioning || HEX.currentPage === pageKey) return;
  showSpinner();
  playWarpTransition(() => {
    showPage(pageKey);
    hideSpinner();
    updateNavActive(pageKey);
  });
};

function showPage(pageKey) {
  // Hide all
  Object.values(PAGES).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = 'none';
      el.classList.remove('active', 'fade-in');
    }
  });

  // Show target
  const pageId = PAGES[pageKey];
  const page   = document.getElementById(pageId);
  if (!page) return;

  page.style.display = 'flex';
  page.classList.add('active');

  // Stagger fade-in
  requestAnimationFrame(() => {
    page.style.opacity = '0';
    requestAnimationFrame(() => {
      page.style.transition = 'opacity 0.5s ease';
      page.style.opacity = '1';
      HEX.currentPage = pageKey;
      triggerPageInit(pageKey);
      staggerFadeIn(page);
    });
  });
}

/* ─── Stagger fade-up for items ─── */
function staggerFadeIn(page) {
  const items = page.querySelectorAll('.stagger-item');
  items.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    setTimeout(() => {
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    }, 80 + i * 100);
  });
}

/* ─── Page Initializers ─── */
function triggerPageInit(pageKey) {
  switch (pageKey) {
    case 'splash':    if (window.initSplash)    window.initSplash();    break;
    case 'home':      if (window.initHome)      window.initHome();      break;
    case 'dashboard': if (window.initDashboard) window.initDashboard(); break;
    case 'admin':     if (window.initAdmin)     window.initAdmin();     break;
    case 'agents':    if (window.initAgents)    window.initAgents();    break;
  }
}

/* ─── Warp Particle Tunnel Transition ─── */
function initWarpCanvas() {
  const canvas = document.createElement('canvas');
  canvas.id = 'warp-canvas';
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:10000;pointer-events:none;display:none;';
  document.body.appendChild(canvas);
  HEX.warpCanvas = canvas;
  HEX.warpCtx = canvas.getContext('2d');
  resizeWarpCanvas();
  window.addEventListener('resize', resizeWarpCanvas);
}

function resizeWarpCanvas() {
  if (!HEX.warpCanvas) return;
  HEX.warpCanvas.width  = window.innerWidth;
  HEX.warpCanvas.height = window.innerHeight;
}

function playWarpTransition(onComplete) {
  HEX.isTransitioning = true;
  const canvas = HEX.warpCanvas;
  const ctx    = HEX.warpCtx;
  canvas.style.display = 'block';

  const W = canvas.width  = window.innerWidth;
  const H = canvas.height = window.innerHeight;
  const cx = W / 2, cy = H / 2;

  // Create stars
  const stars = Array.from({ length: 160 }, () => ({
    angle:  Math.random() * Math.PI * 2,
    radius: Math.random() * 4 + 1,
    dist:   Math.random() * 40 + 10,
    speed:  Math.random() * 8 + 4,
    color:  Math.random() > 0.5 ? '#00D4FF' : '#7B2FFF',
    alpha:  Math.random() * 0.6 + 0.4
  }));

  let frame = 0;
  const totalFrames = 45;

  function animate() {
    ctx.clearRect(0, 0, W, H);

    // Dark overlay growing
    const progress = frame / totalFrames;
    ctx.fillStyle = `rgba(5,10,26,${Math.min(progress * 2, 1)})`;
    ctx.fillRect(0, 0, W, H);

    // Warp lines shooting outward
    stars.forEach(s => {
      const speed = s.speed * (1 + progress * 10);
      s.dist += speed;
      const x1 = cx + Math.cos(s.angle) * s.dist;
      const y1 = cy + Math.sin(s.angle) * s.dist;
      const x2 = cx + Math.cos(s.angle) * (s.dist + speed * 3);
      const y2 = cy + Math.sin(s.angle) * (s.dist + speed * 3);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, s.color);
      ctx.strokeStyle = grad;
      ctx.lineWidth = s.radius * (1 + progress);
      ctx.globalAlpha = s.alpha * (1 - progress * 0.5);
      ctx.stroke();
    });

    ctx.globalAlpha = 1;
    frame++;

    if (frame < totalFrames) {
      requestAnimationFrame(animate);
    } else {
      // Call onComplete then fade out overlay
      onComplete();
      setTimeout(() => {
        let alpha = 1;
        function fadeOut() {
          alpha -= 0.08;
          if (alpha > 0) {
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = `rgba(5,10,26,${alpha})`;
            ctx.fillRect(0, 0, W, H);
            requestAnimationFrame(fadeOut);
          } else {
            canvas.style.display = 'none';
            HEX.isTransitioning = false;
          }
        }
        fadeOut();
      }, 50);
    }
  }
  requestAnimationFrame(animate);
}

/* ─── Spinner ─── */
function showSpinner() {
  const el = document.getElementById('page-spinner');
  if (el) el.classList.add('show');
}
function hideSpinner() {
  const el = document.getElementById('page-spinner');
  if (el) el.classList.remove('show');
}

/* ─── 3D Mouse Parallax Tilt ─── */
window.initTiltCards = function(selector) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg) translateZ(8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
      card.style.transition = 'transform 0.5s ease';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });
  });
};

/* ─── Animated Counter ─── */
window.animateCounter = function(el, from, to, duration = 1500, suffix = '') {
  if (!el) return;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * eased) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
};

/* ─── Resize handler ─── */
window.addEventListener('resize', () => {
  if (HEX.currentPage === 'dashboard') {
    if (window.resizeDashboard) window.resizeDashboard();
  }
});
