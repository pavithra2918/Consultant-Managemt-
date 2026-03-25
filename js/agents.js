/* =============================================
   HEXAWARE - AI Agent Framework Page
   ============================================= */
'use strict';

let agentsInited = false;
let agentsAnimId = null;

const AGENT_DATA = [
  {
    id:     'resume',
    name:   'Resume Agent',
    icon:   '📄',
    color:  '#00D4FF',
    role:   'Monitors and validates consultant resume submissions, ensuring they are up-to-date and complete.',
    inputs: ['Consultant ID', 'Resume file (PDF/DOCX)', 'Last update timestamp'],
    outputs:['Update status', 'Validation report', 'Missing sections alert', 'Compliance score'],
    ai:     'Uses Gemini LLM to extract resume sections, validate formatting, and provide improvement suggestions via prompt engineering on resume text.'
  },
  {
    id:     'attendance',
    name:   'Attendance Agent',
    icon:   '📅',
    color:  '#00FFB3',
    role:   'Tracks and reports daily attendance for bench consultants, detecting anomalies in real time.',
    inputs: ['Consultant ID', 'Daily check-in/out logs', 'Calendar events'],
    outputs:['Attendance percentage', 'Missed report alert', 'Monthly summary', 'Compliance flag'],
    ai:     'Uses generative AI to infer attendance patterns, predict risk of disengagement, and generate natural-language attendance summaries.'
  },
  {
    id:     'opportunity',
    name:   'Opportunity Agent',
    icon:   '🎯',
    color:  '#FFB800',
    role:   'Matches bench consultants to open project opportunities based on skills, availability, and client needs.',
    inputs: ['Consultant skill profile', 'Available opportunities DB', 'Project requirements'],
    outputs:['Match score', 'Recommended opportunities list', 'Interview scheduling trigger', 'Gap analysis'],
    ai:     'Uses embedding-based semantic search and LLM reasoning to rank and explain opportunity matches beyond keyword matching.'
  },
  {
    id:     'training',
    name:   'Training Agent',
    icon:   '🎓',
    color:  '#7B2FFF',
    role:   'Prescribes and tracks training paths for consultants based on skill gaps and market demand.',
    inputs: ['Skill gap report', 'Training catalog', 'Consultant learning history'],
    outputs:['Personalized training plan', 'Completion status', 'Certification recommendations', 'Progress report'],
    ai:     'Uses LLM to generate dynamic, personalized learning paths and produce progress summaries in plain English for managers.'
  }
];

window.initAgents = function() {
  createStars();
  initAgentGraph();
  agentsInited = true;
};

/* ─── Star particles ─── */
function createStars() {
  const container = document.getElementById('star-bg');
  if (!container || container.children.length > 0) return;
  for (let i = 0; i < 120; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2 + 0.5;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%; top:${Math.random()*100}%;
      --duration:${2 + Math.random()*4}s;
      --delay:${Math.random()*4}s;
      --min-op:${0.1 + Math.random()*0.3};
      --max-op:${0.5 + Math.random()*0.5};
    `;
    container.appendChild(s);
  }
}

/* ─── Canvas Node Graph ─── */
function initAgentGraph() {
  const canvas = document.getElementById('agent-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); computeLayout(); });

  // Node positions (computed after resize)
  const nodes = AGENT_DATA.map((a, i) => ({
    ...a,
    x: 0, y: 0,
    radius: 40,
    pulsePhase: i * (Math.PI / 2),
    hovered: false
  }));

  function computeLayout() {
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const spacing = Math.min(W * 0.22, 200);
    const startX = cx - spacing * 1.5;
    nodes.forEach((n, i) => {
      n.x = startX + i * spacing;
      n.y = cy + Math.sin(i * 0.8) * 40;
    });
  }
  computeLayout();

  // Flow particles along edges
  const flowParticles = [];
  function spawnFlowParticle(fromNode, toNode) {
    flowParticles.push({ from: fromNode, to: toNode, t: 0, speed: 0.005 + Math.random() * 0.004, color: fromNode.color });
  }

  // Spawn initial particles
  for (let i = 0; i < nodes.length - 1; i++) {
    for (let k = 0; k < 3; k++) {
      setTimeout(() => spawnFlowParticle(nodes[i], nodes[i+1]), k * 400);
    }
  }
  setInterval(() => {
    const i = Math.floor(Math.random() * (nodes.length - 1));
    spawnFlowParticle(nodes[i], nodes[i+1]);
  }, 600);

  // Detail panel
  const panel = document.getElementById('agent-detail-panel');
  const closeBtn = document.getElementById('agent-detail-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (panel) panel.classList.remove('open');
    });
  }

  // Mouse interactions
  let mx = -999, my = -999;
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mx = e.clientX - rect.left;
    my = e.clientY - rect.top;
    nodes.forEach(n => {
      const dx = mx - n.x, dy = my - n.y;
      n.hovered = Math.sqrt(dx*dx + dy*dy) < n.radius + 10;
    });
    canvas.style.cursor = nodes.some(n => n.hovered) ? 'pointer' : 'default';
  });

  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy2= e.clientY - rect.top;
    nodes.forEach(n => {
      const dx = cx - n.x, dy = cy2 - n.y;
      if (Math.sqrt(dx*dx + dy*dy) < n.radius + 10) openAgentPanel(n);
    });
  });

  function openAgentPanel(agent) {
    if (!panel) return;
    document.getElementById('panel-icon').textContent  = agent.icon;
    document.getElementById('panel-icon').style.background = `rgba(${hexToRgb(agent.color)},0.15)`;
    document.getElementById('panel-name').textContent  = agent.name;
    document.getElementById('panel-role').textContent  = agent.role;
    document.getElementById('panel-inputs').innerHTML  = agent.inputs.map(i => `<span class="agent-detail-tag">⟶ ${i}</span>`).join('');
    document.getElementById('panel-outputs').innerHTML = agent.outputs.map(o => `<span class="agent-detail-tag" style="border-color:rgba(${hexToRgb(agent.color)},0.4);color:${agent.color}">◈ ${o}</span>`).join('');
    document.getElementById('panel-ai').textContent    = agent.ai;
    panel.classList.add('open');
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `${r},${g},${b}`;
  }

  // Animation loop
  let t = 0;
  function animate() {
    agentsAnimId = requestAnimationFrame(animate);
    t += 0.016;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Draw edges (bezier)
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i], b = nodes[i+1];
      const cpx = (a.x + b.x) / 2;
      const cpy = (a.y + b.y) / 2 - 60;

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(cpx, cpy, b.x, b.y);
      ctx.strokeStyle = `rgba(0,212,255,0.1)`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pulsing glow on edges
      const alpha = 0.05 + Math.abs(Math.sin(t * 1.5 + i)) * 0.15;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(cpx, cpy, b.x, b.y);
      ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    // Flow particles
    for (let i = flowParticles.length - 1; i >= 0; i--) {
      const p = flowParticles[i];
      p.t += p.speed;
      if (p.t >= 1) { flowParticles.splice(i, 1); continue; }

      const a = p.from, b = p.to;
      const cpx = (a.x + b.x) / 2;
      const cpy = (a.y + b.y) / 2 - 60;
      const qt = p.t;
      const px = (1-qt)*(1-qt)*a.x + 2*(1-qt)*qt*cpx + qt*qt*b.x;
      const py = (1-qt)*(1-qt)*a.y + 2*(1-qt)*qt*cpy + qt*qt*b.y;

      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.globalAlpha = 1 - Math.abs(qt - 0.5) * 1.5;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // Draw nodes
    nodes.forEach(n => {
      const pulse = Math.sin(t * 2.5 + n.pulsePhase) * 0.15 + 1;
      const r = n.radius * pulse;
      const rgb = hexToRgb(n.color);

      // Outer glow rings
      for (let ring = 3; ring >= 1; ring--) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r + ring * 12, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${0.03 / ring})`;
        ctx.fill();
      }

      // Node background
      const grad = ctx.createRadialGradient(n.x - r*0.3, n.y - r*0.3, 0, n.x, n.y, r);
      grad.addColorStop(0, `rgba(${rgb},0.6)`);
      grad.addColorStop(1, `rgba(${rgb},0.2)`);
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Border
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = n.color;
      ctx.lineWidth = n.hovered ? 3 : 2;
      ctx.shadowColor = n.color;
      ctx.shadowBlur = n.hovered ? 30 : 15;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Icon
      ctx.font = `${Math.round(r * 0.6)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(n.icon, n.x, n.y);

      // Label below
      ctx.font = `bold 11px Orbitron, sans-serif`;
      ctx.fillStyle = n.color;
      ctx.shadowColor = n.color;
      ctx.shadowBlur = 8;
      ctx.fillText(n.name, n.x, n.y + r + 20);
      ctx.shadowBlur = 0;

      if (n.hovered) {
        ctx.font = '10px DM Sans, sans-serif';
        ctx.fillStyle = 'rgba(232,244,255,0.6)';
        ctx.fillText('Click to explore →', n.x, n.y + r + 36);
      }
    });

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }
  animate();
}
