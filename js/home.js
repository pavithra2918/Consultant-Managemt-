/* =============================================
   HEXAWARE - Home / Landing Page
   ============================================= */
'use strict';

let homeParticleCanvas = null;
let homeAnimId = null;
let homeInited = false;

window.initHome = function() {
  if (homeInited) { reinitParticles(); return; }
  homeInited = true;
  initNeuralParticles();
  initTiltCards && initTiltCards('.agent-flip-card');
};

function reinitParticles() {
  if (homeAnimId) cancelAnimationFrame(homeAnimId);
  initNeuralParticles();
}

/* ─── Neural Network Particle Background ─── */
function initNeuralParticles() {
  const canvas = document.getElementById('home-particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT  = 80;
  const RADIUS = 150;

  const particles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    r:  Math.random() * 2 + 1,
    color: Math.random() > 0.6 ? '#00D4FF' : Math.random() > 0.5 ? '#7B2FFF' : '#1E6FFF',
    alpha: Math.random() * 0.6 + 0.3
  }));

  let mouseX = W / 2, mouseY = H / 2;
  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  function draw() {
    homeAnimId = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, W, H);

    // Move particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      // Mouse repulsion
      const dx = p.x - mouseX, dy = p.y - mouseY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 100) {
        p.vx += dx / dist * 0.1;
        p.vy += dy / dist * 0.1;
        const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
        if (speed > 2) { p.vx /= speed * 0.5; p.vy /= speed * 0.5; }
      }

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < RADIUS) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          const alpha = (1 - d / RADIUS) * 0.25;
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
          ctx.lineWidth   = 0.8;
          ctx.globalAlpha = 1;
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }
  draw();
}
