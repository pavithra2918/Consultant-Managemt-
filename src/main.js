/**
 * HEXAWARE POOL CONSULTANT MANAGEMENT SYSTEM
 * Vite Entry Point — ES Module (imports Three.js, GSAP from npm, JSON from /data/)
 */

// ─── npm imports ───
import * as THREE from 'three';
import { gsap }   from 'gsap';

// ─── JSON data imports ───
import consultantsData from '/data/consultants.json';
import agentsData      from '/data/agents.json';

// ─── Make globally available for legacy page scripts ───
window.THREE       = THREE;
window.gsap        = gsap;
window.CONSULTANTS = consultantsData.consultants;
window.AGENT_METRICS = consultantsData.agentMetrics;
window.AGENTS      = agentsData.agents;

/* ─────────────────────────────────────────────
   PAGE ROUTER
   ───────────────────────────────────────────── */
window.HEX = {
  currentPage: null,
  isTransitioning: false
};

const PAGES = {
  splash:    'page-splash',
  home:      'page-home',
  dashboard: 'page-dashboard',
  admin:     'page-admin',
  agents:    'page-agents'
};

document.addEventListener('DOMContentLoaded', () => {
  initWarpCanvas();
  initNavLinks();
  showPage('splash');
  updateNavActive('splash');
  console.log('%c[Hexaware] System boot. Agents loaded: ' + window.AGENTS.length, 'color:#00D4FF;font-weight:bold;font-size:12px');
  console.log('%c[Hexaware] Consultants loaded: ' + window.CONSULTANTS.length, 'color:#00FFB3;font-weight:bold;font-size:12px');
});

function initNavLinks() {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', () => navigateTo(el.dataset.nav));
  });
}

function updateNavActive(key) {
  document.querySelectorAll('[data-nav]').forEach(el =>
    el.classList.toggle('active', el.dataset.nav === key)
  );
}

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
  Object.values(PAGES).forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'none'; el.classList.remove('active'); }
  });

  const page = document.getElementById(PAGES[pageKey]);
  if (!page) return;

  page.style.display   = 'flex';
  page.style.opacity   = '0';
  page.classList.add('active');

  requestAnimationFrame(() => {
    page.style.transition = 'opacity 0.5s ease';
    page.style.opacity    = '1';
    HEX.currentPage = pageKey;
    triggerPageInit(pageKey);
    staggerFadeIn(page);
  });
}

function staggerFadeIn(page) {
  page.querySelectorAll('.stagger-item').forEach((item, i) => {
    item.style.opacity   = '0';
    item.style.transform = 'translateY(30px)';
    setTimeout(() => {
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      item.style.opacity    = '1';
      item.style.transform  = 'translateY(0)';
    }, 80 + i * 100);
  });
}

function triggerPageInit(pageKey) {
  const inits = {
    splash:    window.initSplash,
    home:      window.initHome,
    dashboard: window.initDashboard,
    admin:     window.initAdmin,
    agents:    window.initAgents
  };
  if (inits[pageKey]) inits[pageKey]();
}

/* ─── Warp Particle Tunnel ─── */
let warpCanvas, warpCtx;

function initWarpCanvas() {
  warpCanvas = document.createElement('canvas');
  warpCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:10000;pointer-events:none;display:none;';
  document.body.appendChild(warpCanvas);
  warpCtx = warpCanvas.getContext('2d');
  window.addEventListener('resize', () => {
    warpCanvas.width  = window.innerWidth;
    warpCanvas.height = window.innerHeight;
  });
  warpCanvas.width  = window.innerWidth;
  warpCanvas.height = window.innerHeight;
}

function playWarpTransition(onComplete) {
  HEX.isTransitioning = true;
  warpCanvas.style.display = 'block';

  const W = warpCanvas.width  = window.innerWidth;
  const H = warpCanvas.height = window.innerHeight;
  const cx = W / 2, cy = H / 2;

  // GSAP-powered animation via native rAF for canvas
  const stars = Array.from({ length: 160 }, () => ({
    angle: Math.random() * Math.PI * 2,
    radius: Math.random() * 4 + 1,
    dist: Math.random() * 40 + 10,
    speed: Math.random() * 8 + 4,
    color: Math.random() > 0.5 ? '#00D4FF' : '#7B2FFF',
    alpha: Math.random() * 0.6 + 0.4
  }));

  let frame = 0;
  const totalFrames = 45;

  function animate() {
    warpCtx.clearRect(0, 0, W, H);
    const progress = frame / totalFrames;
    warpCtx.fillStyle = `rgba(5,10,26,${Math.min(progress * 2, 1)})`;
    warpCtx.fillRect(0, 0, W, H);

    stars.forEach(s => {
      const speed = s.speed * (1 + progress * 10);
      s.dist += speed;
      const x1 = cx + Math.cos(s.angle) * s.dist;
      const y1 = cy + Math.sin(s.angle) * s.dist;
      const x2 = cx + Math.cos(s.angle) * (s.dist + speed * 3);
      const y2 = cy + Math.sin(s.angle) * (s.dist + speed * 3);

      warpCtx.beginPath();
      warpCtx.moveTo(x1, y1);
      warpCtx.lineTo(x2, y2);
      const grad = warpCtx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, s.color);
      warpCtx.strokeStyle = grad;
      warpCtx.lineWidth   = s.radius * (1 + progress);
      warpCtx.globalAlpha = s.alpha * (1 - progress * 0.5);
      warpCtx.stroke();
    });

    warpCtx.globalAlpha = 1;
    frame++;

    if (frame < totalFrames) {
      requestAnimationFrame(animate);
    } else {
      onComplete();
      setTimeout(() => {
        let alpha = 1;
        function fadeOut() {
          alpha -= 0.08;
          if (alpha > 0) {
            warpCtx.clearRect(0, 0, W, H);
            warpCtx.fillStyle = `rgba(5,10,26,${alpha})`;
            warpCtx.fillRect(0, 0, W, H);
            requestAnimationFrame(fadeOut);
          } else {
            warpCanvas.style.display = 'none';
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
function showSpinner() { document.getElementById('page-spinner')?.classList.add('show'); }
function hideSpinner() { document.getElementById('page-spinner')?.classList.remove('show'); }

/* ─── 3D Mouse Tilt ─── */
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
    card.addEventListener('mouseenter', () => { card.style.transition = 'transform 0.1s ease'; });
  });
};

/* ─── Animated Counter ─── */
window.animateCounter = function(el, from, to, duration = 1500, suffix = '') {
  if (!el) return;
  const start = performance.now();
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * eased) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
};

/* ─────────────────────────────────────────────
   SPLASH PAGE — Three.js Globe
   ───────────────────────────────────────────── */
let splashInited = false;

window.initSplash = function() {
  if (splashInited) return;
  splashInited = true;

  const canvas = document.getElementById('splash-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 3.2;

  // Globe
  const globeGeo = new THREE.SphereGeometry(1.2, 48, 48);
  const wireMesh = new THREE.Mesh(globeGeo,
    new THREE.MeshBasicMaterial({ color: 0x00D4FF, wireframe: true, transparent: true, opacity: 0.12 }));
  scene.add(wireMesh);

  // Rings
  const mkRing = (color, tiltX, tiltY, opacity) => {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(1.25, 0.008, 16, 100),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity })
    );
    m.rotation.x = tiltX; m.rotation.y = tiltY;
    scene.add(m); return m;
  };
  const ring1 = mkRing(0x00D4FF, Math.PI / 2, 0, 0.5);
  const ring2 = mkRing(0x7B2FFF, Math.PI / 4, 0, 0.35);

  // Consultant nodes — driven from JSON data
  const nodeGroup = new THREE.Group();
  scene.add(nodeGroup);
  const nodeColors = [0x00D4FF, 0x7B2FFF, 0x00FFB3, 0xFFB800];

  // Use consultants from JSON to position nodes
  window.CONSULTANTS.forEach((c, i) => {
    const phi   = (i * 0.7 + 0.5);
    const theta = (i * 1.3 + 0.3);
    const x = 1.21 * Math.sin(phi) * Math.cos(theta);
    const y = 1.21 * Math.cos(phi);
    const z = 1.21 * Math.sin(phi) * Math.sin(theta);

    const geo  = new THREE.SphereGeometry(0.03, 8, 8);
    const col  = nodeColors[i % nodeColors.length];
    const node = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col }));
    node.position.set(x, y, z);
    node.userData = { pulseFactor: i * (Math.PI / 4) };
    nodeGroup.add(node);
  });

  // Particle field
  const pPos = new Float32Array(300 * 3);
  for (let i = 0; i < 300; i++) {
    pPos[i*3] = (Math.random() - 0.5) * 8;
    pPos[i*3+1] = (Math.random() - 0.5) * 6;
    pPos[i*3+2] = (Math.random() - 0.5) * 4;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x1E6FFF, size: 0.025, transparent: true, opacity: 0.5 })));

  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.008;
    wireMesh.rotation.y = nodeGroup.rotation.y = t * 0.5;
    ring1.rotation.z = t * 0.3;
    ring2.rotation.y = t * 0.2;
    nodeGroup.children.forEach(c => {
      if (c.userData.pulseFactor !== undefined) {
        const s = 0.8 + Math.sin(t * 2 + c.userData.pulseFactor) * 0.5;
        c.scale.setScalar(s);
      }
    });
    renderer.render(scene, camera);
  })();

  // Resize
  window.addEventListener('resize', () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  });

  // Progress bar
  startProgressBar();
};

function startProgressBar() {
  const labels = [
    'Initializing Agents...',
    'Loading Resume Agent...',
    'Syncing Attendance Agent...',
    'Activating Opportunity Agent...',
    'Deploying Training Agent...',
    'Activating AI Framework...',
    `System Ready ✦ — ${window.CONSULTANTS.length} Consultants Loaded`
  ];
  const fill  = document.getElementById('splash-fill');
  const label = document.getElementById('splash-label');
  const pct   = document.getElementById('splash-pct');
  let step = 0;

  function tick() {
    if (step >= labels.length) {
      setTimeout(() => window.navigateTo('home'), 600);
      return;
    }
    const p = Math.round((step / (labels.length - 1)) * 100);
    if (label) { label.style.opacity = '0'; setTimeout(() => { label.textContent = labels[step]; label.style.opacity = '1'; }, 200); }
    if (fill)  fill.style.width = p + '%';
    if (pct)   pct.textContent  = p + '%';
    step++;
    setTimeout(tick, 650 + Math.random() * 300);
  }
  setTimeout(tick, 600);
}

/* ─────────────────────────────────────────────
   HOME PAGE — Neural Particle Canvas
   ───────────────────────────────────────────── */
let homeAnimId, homeInited = false;

window.initHome = function() {
  if (homeInited) { if (homeAnimId) cancelAnimationFrame(homeAnimId); }
  homeInited = true;
  initNeuralParticles();
  initTiltCards('.agent-flip-card');
};

function initNeuralParticles() {
  const canvas = document.getElementById('home-particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const resize = () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; };
  resize();
  window.addEventListener('resize', resize);

  const COUNT = 80, RADIUS = 150;
  const particles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
    r: Math.random() * 2 + 1,
    color: Math.random() > 0.6 ? '#00D4FF' : Math.random() > 0.5 ? '#7B2FFF' : '#1E6FFF',
    alpha: Math.random() * 0.6 + 0.3
  }));

  let mx = W / 2, my = H / 2;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function draw() {
    homeAnimId = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx*dx + dy*dy);
      if (d < 100) {
        p.vx += dx / d * 0.1; p.vy += dy / d * 0.1;
        const sp = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
        if (sp > 2) { p.vx /= sp * 0.5; p.vy /= sp * 0.5; }
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill();
    });
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < RADIUS) {
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${(1 - d/RADIUS) * 0.25})`; ctx.lineWidth = 0.8; ctx.globalAlpha = 1; ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }
  draw();
}

/* ─────────────────────────────────────────────
   CONSULTANT DASHBOARD — driven by JSON
   ───────────────────────────────────────────── */
let dashInited = false;

window.initDashboard = function() {
  dashInited = true;
  const c = window.CONSULTANTS[0]; // Load first consultant (Aditya)
  updateDashFromJson(c);
  initWorkflow(c.workflowStep);
  initFlipCards();
  initTiltCards('#page-dashboard .metric-card');
  const el = document.getElementById('dash-date');
  if (el) el.textContent = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
};

function updateDashFromJson(c) {
  // Animate ring
  const ring = document.getElementById('resume-ring');
  if (ring) {
    const offset = 220 - (c.resumeScore / 100) * 220;
    setTimeout(() => {
      ring.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)';
      ring.style.strokeDashoffset = offset;
    }, 400);
  }

  // Bar chart
  const bars = document.querySelectorAll('#page-dashboard .mini-bar');
  bars.forEach((bar, i) => {
    const val = c.attendanceWeek[i] || 0;
    bar.style.height = val + '%';
    setTimeout(() => { bar.style.transform = 'scaleY(1)'; }, 400 + i * 80);
  });

  // Counter
  const ctrEl = document.getElementById('opp-counter');
  if (ctrEl) animateCounter(ctrEl, 0, c.opportunities, 1500);

  // Training segments
  const segs = document.querySelectorAll('#page-dashboard .training-segment');
  const widths = [c.training.completed, c.training.inProgress, c.training.pending];
  segs.forEach((seg, i) => {
    seg.style.flex = widths[i];
    setTimeout(() => { seg.style.transform = 'scaleX(1)'; }, 500 + i * 200);
  });

  // Greeting
  const g = document.getElementById('dash-greeting');
  if (g) g.innerHTML = `Welcome back, <span>${c.name.split(' ')[0]}</span> 👋`;
}

function initWorkflow(activeStep) {
  const states = ['done','done','active','pending'];
  // Adjust based on workflowStep from JSON
  const computed = [0,1,2,3].map(i => i < activeStep ? 'done' : i === activeStep ? 'active' : 'pending');

  computed.forEach((state, i) => {
    setTimeout(() => {
      const el = document.getElementById('wf-step-' + i);
      if (el) { el.className = 'workflow-step-circle ' + state; el.closest('.workflow-step')?.classList.add(state); }
      const conn = document.getElementById('wf-conn-' + i);
      if (conn && state === 'done') conn.querySelector('.workflow-connector-fill')?.classList.add('active');
    }, 300 + i * 400);
  });
}

function initFlipCards() {
  document.querySelectorAll('#page-dashboard .flip-card-3d, #page-dashboard .detail-card').forEach(card => {
    card.addEventListener('click', () => {
      const flip = card.classList.contains('flip-card-3d') ? card : card.querySelector('.flip-card-3d');
      if (flip) flip.classList.toggle('flipped');
    });
  });
}

/* ─────────────────────────────────────────────
   ADMIN CONSOLE — fully driven by JSON
   ───────────────────────────────────────────── */
let adminInited = false, filteredRows = [];

window.initAdmin = function() {
  filteredRows = [...window.CONSULTANTS];
  if (!adminInited) {
    buildTable(filteredRows);
    initFilterChips();
    document.getElementById('filter-apply-btn')?.addEventListener('click', applyFilters);
    initGaugesFromJson();
    initQueueBarsFromJson();
    initReportGeneration();
    adminInited = true;
  } else {
    buildTable(filteredRows);
    animateGauges();
    animateQueues();
  }
};

function buildTable(data) {
  const tbody = document.getElementById('consultant-tbody');
  if (!tbody) return;

  const statusBadge = s => ({
    'Updated': '<span class="tag tag-success">Updated</span>',
    'Pending': '<span class="tag tag-warning">Pending</span>',
    'In Progress': '<span class="tag tag-cyan">In Progress</span>'
  }[s] || '');

  const trainBadge = t => ({
    'Completed': '<span class="tag tag-success" style="font-size:.65rem">Completed</span>',
    'In Progress':'<span class="tag tag-cyan" style="font-size:.65rem">In Progress</span>',
    'Not Started':'<span class="tag tag-warning" style="font-size:.65rem">Not Started</span>'
  }[t] || '');

  const trainLabel = c => c.training.completed >= 70 ? 'Completed' : c.training.inProgress > 0 ? 'In Progress' : 'Not Started';

  tbody.innerHTML = data.map(c => `
    <tr>
      <td><div class="consultant-name-cell"><div class="table-avatar">${c.initials}</div>${c.name}</div></td>
      <td>${c.department}</td>
      <td><span style="color:var(--text-muted);font-size:.78rem">${c.skills.slice(0,2).join(', ')}</span></td>
      <td>${statusBadge(c.resumeStatus)}</td>
      <td style="color:var(--accent-cyan);font-family:var(--font-display);font-weight:700">${c.opportunities}</td>
      <td>${trainBadge(trainLabel(c))}</td>
    </tr>`).join('');

  const countEl = document.getElementById('table-count');
  if (countEl) countEl.textContent = data.length;
}

function initFilterChips() {
  document.querySelectorAll('#page-admin .status-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#page-admin .status-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
}

function applyFilters() {
  const search = document.getElementById('admin-search')?.value?.toLowerCase() || '';
  const dept   = document.getElementById('dept-filter')?.value || 'All';
  const activeChip = document.querySelector('#page-admin .status-chip.active');
  const status = activeChip?.dataset.status || 'all';

  filteredRows = window.CONSULTANTS.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search) || c.skills.join(' ').toLowerCase().includes(search);
    const matchDept   = dept === 'All' || c.department === dept;
    const matchStatus = status === 'all' || c.resumeStatus === status;
    return matchSearch && matchDept && matchStatus;
  });
  buildTable(filteredRows);
}

function initGaugesFromJson() {
  const metrics = window.AGENTS.map(a => a.metrics);
  metrics.forEach((m, i) => drawGauge('gauge-' + ['resume','attend','opp','training'][i], 0, window.AGENTS[i].color, '0ms'));
  setTimeout(animateGauges, 300);
}

function animateGauges() {
  window.AGENTS.forEach((agent, i) => {
    const id = 'gauge-' + ['resume','attend','opp','training'][i];
    setTimeout(() => {
      drawGauge(id, agent.metrics.latency, agent.color, `${agent.metrics.latency}ms`);
      const valEl = document.getElementById(id + '-val');
      if (valEl) animateCounter(valEl, 0, agent.metrics.latency, 800, 'ms');
    }, i * 150);
  });
}

function drawGauge(id, value, color, label) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = 80; canvas.height = 50;
  ctx.clearRect(0, 0, 80, 50);
  const cx = 40, cy = 42, r = 34;
  ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.stroke();
  if (value > 0) {
    ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, Math.PI + (value / 100) * Math.PI);
    ctx.strokeStyle = color; ctx.lineWidth = 7; ctx.shadowColor = color; ctx.shadowBlur = 10; ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

function initQueueBarsFromJson() { setTimeout(animateQueues, 600); }

function animateQueues() {
  window.AGENTS.forEach((agent, i) => {
    const fill = document.getElementById('queue-fill-' + i);
    const pct  = document.getElementById('queue-pct-' + i);
    if (fill) { fill.style.width = '0%'; fill.style.background = agent.color; setTimeout(() => fill.style.width = agent.metrics.queueLoad + '%', 100); }
    if (pct)  pct.textContent = agent.metrics.queueLoad + '%';
  });
}

function initReportGeneration() {
  document.getElementById('generate-report-btn')?.addEventListener('click', () => {
    const type = document.getElementById('report-type')?.value || 'individual';
    const cName  = document.getElementById('report-consultant')?.value || window.CONSULTANTS[0].name;
    const consultant = window.CONSULTANTS.find(c => c.name === cName) || window.CONSULTANTS[0];

    const preview = document.getElementById('report-preview-card');
    if (!preview) return;

    preview.innerHTML = `
      <div class="report-preview-header">📄 ${type === 'individual' ? consultant.name : 'All Departments'}</div>
      <div class="report-preview-shimmer"></div>
      <div class="report-preview-row"><span>Generated</span><span style="color:var(--accent-cyan)">${new Date().toLocaleString('en-IN')}</span></div>
      <div class="report-preview-row"><span>Resume Status</span>${consultant.resumeStatus === 'Updated' ? '<span style="color:var(--success)">Updated</span>' : `<span style="color:var(--warning)">${consultant.resumeStatus}</span>`}</div>
      <div class="report-preview-row"><span>Attendance</span><span style="color:var(--accent-cyan)">${consultant.attendancePct}%</span></div>
      <div class="report-preview-row"><span>Opportunities</span><span style="color:var(--text-primary)">${consultant.opportunities}</span></div>
      <div class="report-preview-row"><span>Resume Score</span><span style="color:var(--text-primary)">${consultant.resumeScore}/100</span></div>`;

    const btn = document.getElementById('generate-report-btn');
    btn.textContent = '✓ Generated!';
    btn.style.background = 'linear-gradient(135deg,#00FFB3,#00c890)';
    setTimeout(() => { btn.textContent = 'Generate Report'; btn.style.background = ''; }, 2000);
  });

  ['pdf','csv'].forEach(type => {
    document.getElementById('export-' + type)?.addEventListener('click', function() {
      this.textContent = '✓ Exported!';
      setTimeout(() => this.textContent = type.toUpperCase(), 1500);
    });
  });
}

/* ─────────────────────────────────────────────
   AI AGENT FRAMEWORK — Canvas Node Graph (JSON)
   ───────────────────────────────────────────── */
let agentsInited = false, agentsAnimId;

window.initAgents = function() {
  createStars();
  initAgentGraph();
  agentsInited = true;
};

function createStars() {
  const container = document.getElementById('star-bg');
  if (!container || container.children.length > 0) return;
  for (let i = 0; i < 120; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2 + 0.5;
    s.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--duration:${2+Math.random()*4}s;--delay:${Math.random()*4}s;--min-op:${0.1+Math.random()*0.3};--max-op:${0.5+Math.random()*0.5};`;
    container.appendChild(s);
  }
}

function initAgentGraph() {
  const canvas = document.getElementById('agent-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
  resize();
  window.addEventListener('resize', () => { resize(); computeLayout(); });

  // Build node array from JSON
  const nodes = window.AGENTS.map((a, i) => ({
    ...a, x: 0, y: 0, radius: 40,
    pulsePhase: i * (Math.PI / 2), hovered: false
  }));

  function computeLayout() {
    const W = canvas.width, H = canvas.height;
    const spacing = Math.min(W * 0.22, 200);
    const startX  = W / 2 - spacing * 1.5;
    nodes.forEach((n, i) => { n.x = startX + i * spacing; n.y = H / 2 + Math.sin(i * 0.8) * 40; });
  }
  computeLayout();

  // Flow particles
  const flows = [];
  const spawnFlow = (a, b) => flows.push({ from: a, to: b, t: 0, speed: 0.005 + Math.random() * 0.004, color: a.color });
  for (let i = 0; i < nodes.length - 1; i++) {
    for (let k = 0; k < 3; k++) setTimeout(() => spawnFlow(nodes[i], nodes[i+1]), k * 400);
  }
  setInterval(() => { const i = Math.floor(Math.random() * (nodes.length - 1)); spawnFlow(nodes[i], nodes[i+1]); }, 600);

  // Panel
  const panel = document.getElementById('agent-detail-panel');
  document.getElementById('agent-detail-close')?.addEventListener('click', () => panel?.classList.remove('open'));

  function openPanel(n) {
    if (!panel) return;
    document.getElementById('panel-icon').textContent  = n.icon;
    document.getElementById('panel-icon').style.background = `rgba(${n.colorRgb},0.15)`;
    document.getElementById('panel-name').textContent  = n.name;
    document.getElementById('panel-role').textContent  = n.role;
    document.getElementById('panel-inputs').innerHTML  = n.inputs.map(inp => `<span class="agent-detail-tag">⟶ ${inp}</span>`).join('');
    document.getElementById('panel-outputs').innerHTML = n.outputs.map(out => `<span class="agent-detail-tag" style="border-color:rgba(${n.colorRgb},0.4);color:${n.color}">◈ ${out}</span>`).join('');
    document.getElementById('panel-ai').textContent    = n.aiReasoning;
    // Metrics from JSON
    const metricsEl = document.getElementById('panel-metrics');
    if (metricsEl && n.metrics) {
      metricsEl.innerHTML = `
        <div class="flip-detail-row"><span class="flip-detail-key">Latency</span><span class="flip-detail-val cyan">${n.metrics.latency}ms</span></div>
        <div class="flip-detail-row"><span class="flip-detail-key">Queue Load</span><span class="flip-detail-val">${n.metrics.queueLoad}%</span></div>
        <div class="flip-detail-row"><span class="flip-detail-key">Error Rate</span><span class="flip-detail-val ${n.metrics.errorRate > 1 ? 'warning' : 'success'}">${n.metrics.errorRate}%</span></div>
        <div class="flip-detail-row"><span class="flip-detail-key">Cycles Run</span><span class="flip-detail-val">${n.metrics.cyclesRun.toLocaleString()}</span></div>`;
    }
    panel.classList.add('open');
  }

  // Mouse
  let mx = -999, my = -999;
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top;
    nodes.forEach(n => {
      const dx = mx - n.x, dy = my - n.y;
      n.hovered = Math.sqrt(dx*dx + dy*dy) < n.radius + 10;
    });
    canvas.style.cursor = nodes.some(n => n.hovered) ? 'pointer' : 'default';
  });
  canvas.addEventListener('click', e => {
    const r = canvas.getBoundingClientRect();
    const cx2 = e.clientX - r.left, cy2 = e.clientY - r.top;
    nodes.forEach(n => { const dx = cx2-n.x, dy=cy2-n.y; if (Math.sqrt(dx*dx+dy*dy)<n.radius+10) openPanel(n); });
  });

  let t = 0;
  function animate() {
    agentsAnimId = requestAnimationFrame(animate);
    t += 0.016;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Edges
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i], b = nodes[i+1];
      const cpx = (a.x + b.x) / 2, cpy = (a.y + b.y) / 2 - 60;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(cpx, cpy, b.x, b.y);
      ctx.strokeStyle = `rgba(0,212,255,${0.05 + Math.abs(Math.sin(t*1.5+i))*0.15})`; ctx.lineWidth = 3; ctx.stroke();
    }

    // Flow particles
    for (let i = flows.length - 1; i >= 0; i--) {
      const p = flows[i]; p.t += p.speed;
      if (p.t >= 1) { flows.splice(i, 1); continue; }
      const a = p.from, b = p.to;
      const cpx = (a.x + b.x) / 2, cpy = (a.y + b.y) / 2 - 60;
      const q = p.t;
      const px = (1-q)*(1-q)*a.x + 2*(1-q)*q*cpx + q*q*b.x;
      const py = (1-q)*(1-q)*a.y + 2*(1-q)*q*cpy + q*q*b.y;
      ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI*2);
      ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 10;
      ctx.globalAlpha = 1 - Math.abs(q-0.5)*1.5; ctx.fill();
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    }

    // Nodes
    nodes.forEach(n => {
      const pulse = Math.sin(t * 2.5 + n.pulsePhase) * 0.15 + 1;
      const r = n.radius * pulse;
      const [rr,gg,bb] = n.colorRgb.split(',').map(Number);
      for (let ring = 3; ring >= 1; ring--) {
        ctx.beginPath(); ctx.arc(n.x, n.y, r + ring*12, 0, Math.PI*2);
        ctx.fillStyle = `rgba(${rr},${gg},${bb},${0.03/ring})`; ctx.fill();
      }
      const grad = ctx.createRadialGradient(n.x-r*.3, n.y-r*.3, 0, n.x, n.y, r);
      grad.addColorStop(0, `rgba(${rr},${gg},${bb},0.6)`);
      grad.addColorStop(1, `rgba(${rr},${gg},${bb},0.2)`);
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI*2); ctx.fillStyle = grad; ctx.fill();
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI*2);
      ctx.strokeStyle = n.color; ctx.lineWidth = n.hovered ? 3 : 2;
      ctx.shadowColor = n.color; ctx.shadowBlur = n.hovered ? 30 : 15; ctx.stroke(); ctx.shadowBlur = 0;
      ctx.font = `${Math.round(r*0.6)}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff'; ctx.fillText(n.icon, n.x, n.y);
      ctx.font = 'bold 11px Orbitron, sans-serif';
      ctx.fillStyle = n.color; ctx.shadowColor = n.color; ctx.shadowBlur = 8;
      ctx.fillText(n.name, n.x, n.y + r + 20); ctx.shadowBlur = 0;
      if (n.hovered) {
        ctx.font = '10px DM Sans, sans-serif'; ctx.fillStyle = 'rgba(232,244,255,0.6)';
        ctx.fillText('Click to explore →', n.x, n.y + r + 36);
      }
    });
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  }
  animate();
}
