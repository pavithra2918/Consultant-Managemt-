import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import PageTransition from '../components/PageTransition';
import AGENTS from '../../data/agents.json';

const AIFrameworkPage = () => {
  const canvasRef = useRef(null);
  const animIdRef = useRef(null);
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    // Star BG
    const container = document.getElementById('star-bg');
    if (container && container.children.length === 0) {
      for (let i = 0; i < 120; i++) {
        const s = document.createElement('div');
        s.className = 'star';
        const size = Math.random() * 2 + 0.5;
        s.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--duration:${2+Math.random()*4}s;--delay:${Math.random()*4}s;--min-op:${0.1+Math.random()*0.3};--max-op:${0.5+Math.random()*0.5};`;
        container.appendChild(s);
      }
    }

    // Graph Canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;
    
    const nodes = AGENTS.agents.map((a, i) => ({
      ...a, x: 0, y: 0, radius: 40,
      pulsePhase: i * (Math.PI / 2), hovered: false
    }));

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      const spacing = Math.min(W * 0.22, 200);
      const startX  = W / 2 - spacing * 1.5;
      nodes.forEach((n, i) => { 
        n.x = startX + i * spacing; 
        n.y = H / 2 + Math.sin(i * 0.8) * 40; 
      });
    };
    resize();
    window.addEventListener('resize', resize);

    const flows = [];
    const spawnFlow = (a, b) => flows.push({ from: a, to: b, t: 0, speed: 0.005 + Math.random() * 0.004, color: a.color });
    for (let i = 0; i < nodes.length - 1; i++) {
      for (let k = 0; k < 3; k++) setTimeout(() => spawnFlow(nodes[i], nodes[i+1]), k * 400);
    }
    const flowInterval = setInterval(() => { 
      const i = Math.floor(Math.random() * (nodes.length - 1)); 
      spawnFlow(nodes[i], nodes[i+1]); 
    }, 600);

    let mx = -999, my = -999;
    const handleMouse = e => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
      nodes.forEach(n => {
        const dx = mx - n.x, dy = my - n.y;
        n.hovered = Math.sqrt(dx*dx + dy*dy) < n.radius + 10;
      });
      canvas.style.cursor = nodes.some(n => n.hovered) ? 'pointer' : 'default';
    };
    canvas.addEventListener('mousemove', handleMouse);

    const handleClick = e => {
      const r = canvas.getBoundingClientRect();
      const cx2 = e.clientX - r.left, cy2 = e.clientY - r.top;
      nodes.forEach(n => { 
        const dx = cx2-n.x, dy=cy2-n.y; 
        if (Math.sqrt(dx*dx+dy*dy)<n.radius+10) setSelectedAgent(n); 
      });
    };
    canvas.addEventListener('click', handleClick);

    let t = 0;
    function animate() {
      animIdRef.current = requestAnimationFrame(animate);
      t += 0.016;
      ctx.clearRect(0, 0, W, H);

      // Edges
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i], b = nodes[i+1];
        const cpx = (a.x + b.x) / 2, cpy = (a.y + b.y) / 2 - 60;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(cpx, cpy, b.x, b.y);
        ctx.strokeStyle = `rgba(0,212,255,${0.05 + Math.abs(Math.sin(t*1.5+i))*0.15})`; 
        ctx.lineWidth = 3; ctx.stroke();
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
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI*2); 
        ctx.fillStyle = grad; ctx.fill();
        
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI*2);
        ctx.strokeStyle = n.color; ctx.lineWidth = n.hovered ? 3 : 2;
        ctx.shadowColor = n.color; ctx.shadowBlur = n.hovered ? 30 : 15; 
        ctx.stroke(); ctx.shadowBlur = 0;
        
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

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('click', handleClick);
      clearInterval(flowInterval);
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, []);

  return (
    <PageTransition>
      <section className="page active" id="page-agents" style={{ display: 'block' }}>
        <div className="agents-mesh"></div>
        <div className="star-bg" id="star-bg"></div>
        <canvas ref={canvasRef} id="agent-canvas"></canvas>

        <Navbar />

        <div className="agents-header">
          <div className="section-badge">◈ Multi-Agent System</div>
          <div className="agents-header-title">AI Agent <span style={{color:'var(--accent-cyan)'}}>Framework</span></div>
          <div className="agents-header-sub">Click any node to explore agent details, inputs & outputs</div>
        </div>

        <div className={`agent-detail-panel ${selectedAgent ? 'open' : ''}`} id="agent-detail-panel">
          {selectedAgent && (
            <>
              <div className="agent-detail-close" onClick={() => setSelectedAgent(null)}>✕</div>
              <div 
                className="agent-detail-icon" 
                style={{ width:'60px', height:'60px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', background:`rgba(${selectedAgent.colorRgb},0.15)` }}
              >
                {selectedAgent.icon}
              </div>
              <div className="agent-detail-name">{selectedAgent.name}</div>

              <div className="agent-detail-section">
                <div className="agent-detail-section-title">Role</div>
                <div className="agent-detail-text">{selectedAgent.role}</div>
              </div>

              <div className="agent-detail-section">
                <div className="agent-detail-section-title">Inputs</div>
                <div className="agent-detail-tags">
                  {selectedAgent.inputs.map((inp, i) => <span key={i} className="agent-detail-tag">⟶ {inp}</span>)}
                </div>
              </div>

              <div className="agent-detail-section">
                <div className="agent-detail-section-title">Outputs</div>
                <div className="agent-detail-tags">
                  {selectedAgent.outputs.map((out, i) => (
                    <span key={i} className="agent-detail-tag" style={{ borderColor:`rgba(${selectedAgent.colorRgb},0.4)`, color: selectedAgent.color }}>◈ {out}</span>
                  ))}
                </div>
              </div>

              <div className="agent-detail-section">
                <div className="agent-detail-section-title">Live Metrics</div>
                <div className="flip-face-back" style={{ border:'none', padding:0, gap:'6px', display:'flex', flexDirection:'column' }}>
                  <div className="flip-detail-row"><span className="flip-detail-key">Latency</span><span className="flip-detail-val cyan">{selectedAgent.metrics.latency}ms</span></div>
                  <div className="flip-detail-row"><span className="flip-detail-key">Queue Load</span><span className="flip-detail-val">{selectedAgent.metrics.queueLoad}%</span></div>
                  <div className="flip-detail-row">
                    <span className="flip-detail-key">Error Rate</span>
                    <span className={`flip-detail-val ${selectedAgent.metrics.errorRate > 1 ? 'warning' : 'success'}`}>{selectedAgent.metrics.errorRate}%</span>
                  </div>
                  <div className="flip-detail-row"><span className="flip-detail-key">Cycles Run</span><span className="flip-detail-val">{selectedAgent.metrics.cyclesRun.toLocaleString()}</span></div>
                </div>
              </div>

              <div className="agent-detail-section">
                <div className="agent-detail-section-title">Generative AI Reasoning</div>
                <div className="agent-ai-reasoning">{selectedAgent.aiReasoning}</div>
              </div>
            </>
          )}
        </div>
      </section>
    </PageTransition>
  );
};

export default AIFrameworkPage;
