import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import Navbar from '../components/Navbar';
import AGENTS from '../../data/agents.json';

const HomePage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const animIdRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;
    
    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
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
    const handleMouse = e => { mx = e.clientX; my = e.clientY; };
    window.addEventListener('mousemove', handleMouse);

    function draw() {
      animIdRef.current = requestAnimationFrame(draw);
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
            ctx.strokeStyle = `rgba(0,212,255,${(1 - d/RADIUS) * 0.25})`; 
            ctx.lineWidth = 0.8; ctx.globalAlpha = 1; ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    }
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, []);

  const handleTilt = (e, card) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg) translateZ(8px)`;
  };

  const resetTilt = (card) => {
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
    card.style.transition = 'transform 0.5s ease';
  };

  return (
    <PageTransition>
      <section className="page active" style={{ display: 'block' }}>
        <canvas ref={canvasRef} id="home-particle-canvas"></canvas>
        <Navbar />

        <div className="home-hero">
          <div className="hero-badge visible">
            <span className="hero-badge-dot"></span>
            Powered by Multi-Agent Framework
          </div>
          <div className="hero-title-wrapper visible">
            <h1 className="hero-title stagger-item visible" style={{ animation: 'bobbing 6s ease-in-out infinite' }}>
              <span className="accent">AI-Powered</span><br />
              Pool Consultant<br />
              <span className="accent2">Management</span>
            </h1>
          </div>
          <p className="hero-subtitle stagger-item visible" style={{ animationDelay: '0.1s' }}>
            <strong>Streamline. Track. Empower.</strong><br />
            Powered by Hexaware's Multi-Agent AI Framework — automating resume tracking,
            attendance monitoring, opportunity matching, and training management.
          </p>
          <div className="hero-ctas stagger-item visible" style={{ animationDelay: '0.2s' }}>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              <span>👤</span> Consultant Portal
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
              <span>⚙️</span> Admin Console
            </button>
            <button className="btn btn-violet" onClick={() => navigate('/agents')}>
              <span>🤖</span> AI Framework
            </button>
          </div>
          <div className="hero-scroll-hint">
            <span>Explore Agents</span>
            <div className="scroll-arrow"></div>
          </div>
        </div>

        <div className="home-agents" id="home-agents">
          <div className="section-badge stagger-item visible">✦ Multi-Agent Framework</div>
          <h2 className="home-agents-title stagger-item visible">Four <span style={{color:'var(--accent-cyan)'}}>AI Agents</span>, One Platform</h2>
          <p className="home-agents-subtitle stagger-item visible">Hover to discover inputs & outputs.</p>

          <div className="agent-cards-grid">
            {AGENTS.agents.map((agent, i) => (
              <div 
                key={agent.id}
                className="agent-flip-card agent-float-anim stagger-item visible" 
                style={{ animationDelay: `${i * 0.2}s` }}
                onMouseMove={(e) => handleTilt(e, e.currentTarget)}
                onMouseLeave={(e) => resetTilt(e.currentTarget)}
                onMouseEnter={(e) => { e.currentTarget.style.transition = 'transform 0.1s ease'; }}
              >
                <div className="agent-flip-inner">
                  <div className="agent-front glass-card">
                    <div className="agent-icon" style={{ color: agent.color, textShadow: `0 0 15px ${agent.color}` }}>{agent.icon}</div>
                    <div className="agent-name">{agent.name}</div>
                    <div className="agent-tagline">{agent.role}</div>
                    <div className="agent-hover-hint">↻ Hover to reveal</div>
                  </div>
                  <div className="agent-back">
                    <div className="agent-back-section">
                      <div className="agent-back-label">📥 Inputs</div>
                      <div className="agent-back-value">{agent.inputs.join(' · ')}</div>
                    </div>
                    <div className="agent-back-section">
                      <div className="agent-back-label">📤 Outputs</div>
                      <div className="agent-back-value">{agent.outputs.join(' · ')}</div>
                    </div>
                    <div className="agent-back-section">
                      <div className="agent-back-label">🤖 AI Use</div>
                      <div className="agent-back-value">{agent.aiReasoning}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer style={{ textAlign:'center', padding:'24px', borderTop:'1px solid rgba(0,212,255,0.08)', fontSize:'0.72rem', color:'var(--text-muted)', fontFamily:'var(--font-display)', letterSpacing:'1.5px', position:'relative', zIndex:2 }}>
          © 2026 Hexaware Technologies Limited. All rights reserved &nbsp;|&nbsp; <span style={{color:'var(--accent-cyan)'}}>www.hexaware.com</span>
        </footer>
      </section>
    </PageTransition>
  );
};

export default HomePage;
