/* =============================================
   HEXAWARE - Admin Console
   ============================================= */
'use strict';

let adminInited = false;

const CONSULTANTS = [
  { name:'Aditya Sharma',   dept:'Cloud',      skill:'AWS, K8s',      status:'Updated',     opp:5, train:'Completed' },
  { name:'Priya Nair',      dept:'AI/ML',       skill:'Python, TF',    status:'In Progress', opp:3, train:'In Progress' },
  { name:'Rahul Mehta',     dept:'Java',        skill:'Spring, SQL',   status:'Pending',     opp:2, train:'Not Started' },
  { name:'Sneha Patel',     dept:'DevOps',      skill:'Docker, CI/CD', status:'Updated',     opp:7, train:'Completed' },
  { name:'Vikram Rao',      dept:'Frontend',    skill:'React, TS',     status:'Updated',     opp:4, train:'Completed' },
  { name:'Ananya Singh',    dept:'Data',        skill:'Spark, Scala',  status:'Pending',     opp:1, train:'Not Started' },
  { name:'Kiran Kumar',     dept:'Security',    skill:'SIEM, IAM',     status:'In Progress', opp:3, train:'In Progress' },
  { name:'Deepa Thomas',    dept:'Cloud',       skill:'Azure, ARM',    status:'Updated',     opp:6, train:'Completed' }
];

let filteredData = [...CONSULTANTS];

window.initAdmin = function() {
  if (!adminInited) {
    buildTable(CONSULTANTS);
    initFilterChips();
    initFilterActions();
    initGauges();
    initAgentQueues();
    initReportGeneration();
    adminInited = true;
  } else {
    buildTable(CONSULTANTS);
    animateGauges();
    animateQueues();
  }
};

/* ─── Table ─── */
function buildTable(data) {
  const tbody = document.getElementById('consultant-tbody');
  if (!tbody) return;

  const statusBadge = (s) => {
    const map = { 'Updated':'tag-success', 'Pending':'tag-warning', 'In Progress':'tag-cyan' };
    return `<span class="tag ${map[s]||'tag-cyan'}">${s}</span>`;
  };
  const trainBadge = (t) => {
    const map = { 'Completed':'tag-success', 'In Progress':'tag-cyan', 'Not Started':'tag-warning' };
    return `<span class="tag ${map[t]||'tag-warning'}" style="font-size:0.65rem">${t}</span>`;
  };

  tbody.innerHTML = data.map(c => {
    const initials = c.name.split(' ').map(w => w[0]).join('');
    return `<tr>
      <td><div class="consultant-name-cell"><div class="table-avatar">${initials}</div>${c.name}</div></td>
      <td>${c.dept}</td>
      <td><span style="color:var(--text-muted);font-size:0.78rem">${c.skill}</span></td>
      <td>${statusBadge(c.status)}</td>
      <td style="color:var(--accent-cyan);font-family:var(--font-display);font-weight:700">${c.opp}</td>
      <td>${trainBadge(c.train)}</td>
    </tr>`;
  }).join('');

  const countEl = document.getElementById('table-count');
  if (countEl) countEl.textContent = data.length;
}

/* ─── Filter Chips ─── */
function initFilterChips() {
  document.querySelectorAll('#page-admin .status-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#page-admin .status-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
}

/* ─── Apply Filter ─── */
function initFilterActions() {
  const applyBtn = document.getElementById('filter-apply-btn');
  if (!applyBtn) return;

  applyBtn.addEventListener('click', () => {
    const search = (document.getElementById('admin-search') || {}).value?.toLowerCase() || '';
    const dept   = (document.getElementById('dept-filter') || {}).value || 'All';
    const activeChip = document.querySelector('#page-admin .status-chip.active');
    const status = activeChip ? activeChip.dataset.status : 'all';

    filteredData = CONSULTANTS.filter(c => {
      const matchSearch = !search || c.name.toLowerCase().includes(search) || c.skill.toLowerCase().includes(search);
      const matchDept   = dept === 'All' || c.dept === dept;
      const matchStatus = status === 'all' || c.status === status;
      return matchSearch && matchDept && matchStatus;
    });
    buildTable(filteredData);
  });
}

/* ─── Gauge Charts ─── */
const GAUGE_DATA = [
  { id: 'gauge-resume',    value: 72,  color: '#00D4FF', label: '72ms',   queue: 68,  error: 'low'  },
  { id: 'gauge-attend',    value: 45,  color: '#00FFB3', label: '45ms',   queue: 42,  error: 'low'  },
  { id: 'gauge-opp',       value: 88,  color: '#FFB800', label: '88ms',   queue: 85,  error: 'med'  },
  { id: 'gauge-training',  value: 55,  color: '#7B2FFF', label: '55ms',   queue: 55,  error: 'low'  }
];

function initGauges() {
  GAUGE_DATA.forEach(g => {
    drawGauge(g.id, 0, g.color, '0ms');
    const valEl = document.getElementById(g.id + '-val');
    if (valEl) valEl.textContent = '0ms';
  });
  setTimeout(animateGauges, 300);
}

function animateGauges() {
  GAUGE_DATA.forEach((g, i) => {
    setTimeout(() => {
      drawGauge(g.id, g.value, g.color, g.label);
      const valEl = document.getElementById(g.id + '-val');
      if (valEl) {
        let v = 0;
        const interval = setInterval(() => {
          v += 2;
          if (v >= g.value) { v = g.value; clearInterval(interval); }
          valEl.textContent = v + 'ms';
        }, 20);
      }
    }, i * 150);
  });
}

function drawGauge(id, value, color, label) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = 80, H = canvas.height = 50;
  ctx.clearRect(0, 0, W, H);

  const cx = W / 2, cy = H - 8;
  const r  = 34;
  const startAngle = Math.PI;
  const endAngle   = startAngle + Math.PI;
  const fillAngle  = startAngle + (value / 100) * Math.PI;

  // Track
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle);
  ctx.strokeStyle = 'rgba(255,255,255,0.07)';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Fill
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, fillAngle);
  ctx.strokeStyle = color;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

/* ─── Agent Queue Bars ─── */
function initAgentQueues() {
  setTimeout(animateQueues, 600);
}

function animateQueues() {
  GAUGE_DATA.forEach((g, i) => {
    const fill = document.getElementById('queue-fill-' + i);
    const pctEl = document.getElementById('queue-pct-' + i);
    if (fill) {
      fill.style.width = '0%';
      fill.style.background = g.color;
      setTimeout(() => { fill.style.width = g.queue + '%'; }, 100);
    }
    if (pctEl) pctEl.textContent = g.queue + '%';
  });
}

/* ─── Report Generation ─── */
function initReportGeneration() {
  const genBtn = document.getElementById('generate-report-btn');
  if (!genBtn) return;

  genBtn.addEventListener('click', () => {
    const preview = document.getElementById('report-preview-card');
    if (!preview) return;

    const type   = (document.getElementById('report-type') || {}).value || 'individual';
    const name   = type === 'individual'
      ? ((document.getElementById('report-consultant') || {}).value || 'Aditya Sharma')
      : 'All Departments';

    const now = new Date();
    preview.innerHTML = `
      <div class="report-preview-header">📄 Consultant Report — ${name}</div>
      <div class="report-preview-shimmer"></div>
      <div class="report-preview-row"><span>Generated</span><span style="color:var(--accent-cyan)">${now.toLocaleString('en-IN')}</span></div>
      <div class="report-preview-row"><span>Resume Status</span><span style="color:var(--success)">Updated</span></div>
      <div class="report-preview-row"><span>Attendance</span><span style="color:var(--accent-cyan)">92%</span></div>
      <div class="report-preview-row"><span>Opportunities</span><span style="color:var(--text-primary)">5</span></div>
      <div class="report-preview-row"><span>Training</span><span style="color:var(--warning)">In Progress</span></div>
      <div class="report-preview-row"><span>Agent Cycles</span><span style="color:var(--text-primary)">48</span></div>
    `;

    // Animate btn
    genBtn.textContent = '✓ Generated!';
    genBtn.style.background = 'linear-gradient(135deg,#00FFB3,#00c890)';
    setTimeout(() => {
      genBtn.textContent = 'Generate Report';
      genBtn.style.background = '';
    }, 2000);
  });

  // Export buttons
  ['pdf', 'csv'].forEach(type => {
    const btn = document.getElementById('export-' + type);
    if (!btn) return;
    btn.addEventListener('click', () => {
      btn.textContent = '✓ Exported!';
      setTimeout(() => btn.textContent = type.toUpperCase(), 1500);
    });
  });
}
