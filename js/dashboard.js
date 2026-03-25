/* =============================================
   HEXAWARE - Consultant Dashboard
   ============================================= */
'use strict';

let dashInited = false;

window.initDashboard = function() {
  animateMetrics();
  initWorkflow();
  initFlipCards();
  initTiltCards && initTiltCards('#page-dashboard .metric-card');
  updateDashDate();
  dashInited = true;
};

window.resizeDashboard = function() {
  // Reinit charts if needed
};

/* ─── Update date ─── */
function updateDashDate() {
  const el = document.getElementById('dash-date');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

/* ─── Animate all metric cards ─── */
function animateMetrics() {
  // Ring - Resume Status
  animateRing('resume-ring', 78, '#00D4FF');
  // Attendance chart
  animateBarChart();
  // Opportunities counter
  const ctrEl = document.getElementById('opp-counter');
  if (ctrEl) animateCounter(ctrEl, 0, 12, 1500);
  // Training segments
  animateTraining();
}

/* ─── SVG Ring Animation ─── */
function animateRing(id, pct, color) {
  const ring = document.getElementById(id);
  if (!ring) return;
  const circumference = 220;
  const offset = circumference - (pct / 100) * circumference;
  ring.style.stroke = color;
  ring.style.strokeDasharray = circumference;

  setTimeout(() => {
    ring.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)';
    ring.style.strokeDashoffset = offset;
  }, 400);
}

/* ─── Bar Chart (Attendance) ─── */
function animateBarChart() {
  const bars = document.querySelectorAll('#page-dashboard .mini-bar');
  const data  = [
    { h: 90, type: 'completed' }, { h: 60, type: 'missed' },
    { h: 100, type: 'completed' }, { h: 85, type: 'completed' },
    { h: 40, type: 'missed' }, { h: 95, type: 'completed' },
    { h: 70, type: 'completed' }
  ];
  bars.forEach((bar, i) => {
    if (data[i]) {
      bar.style.height = data[i].h + '%';
      setTimeout(() => {
        bar.style.transform = 'scaleY(1)';
      }, 400 + i * 80);
    }
  });
}

/* ─── Training Segments ─── */
function animateTraining() {
  const segs = document.querySelectorAll('#page-dashboard .training-segment');
  const widths = [40, 25, 35]; // completed, in-progress, pending (%)
  segs.forEach((seg, i) => {
    seg.style.flex = widths[i];
    setTimeout(() => {
      seg.style.transform = 'scaleX(1)';
    }, 500 + i * 200);
  });
}

/* ─── Workflow Steps ─── */
function initWorkflow() {
  const steps = [
    { id: 'wf-step-0', state: 'done' },
    { id: 'wf-step-1', state: 'done' },
    { id: 'wf-step-2', state: 'active' },
    { id: 'wf-step-3', state: 'pending' }
  ];

  steps.forEach((s, i) => {
    const el = document.getElementById(s.id);
    if (!el) return;
    setTimeout(() => {
      el.className = 'workflow-step-circle ' + s.state;

      // Also update parent step's label
      const stepEl = el.closest('.workflow-step');
      if (stepEl) stepEl.classList.add(s.state);

      // Connectors
      const conn = document.getElementById('wf-conn-' + i);
      if (conn && s.state === 'done') {
        const fill = conn.querySelector('.workflow-connector-fill');
        if (fill) fill.classList.add('active');
      }
    }, 300 + i * 400);
  });
}

/* ─── 3D Flip Cards ─── */
function initFlipCards() {
  document.querySelectorAll('#page-dashboard .flip-card-3d').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });

  document.querySelectorAll('#page-dashboard .detail-card').forEach(card => {
    card.addEventListener('click', () => {
      const flipEl = card.querySelector('.flip-card-3d');
      if (flipEl) flipEl.classList.toggle('flipped');
    });
  });
}
