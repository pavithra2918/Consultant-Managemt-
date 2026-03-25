import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import Sidebar from '../components/Sidebar';
import CONSULTANTS from '../../data/consultants.json';
import { 
  FileText, UploadCloud, CheckCircle, Clock, Search, 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  TrendingUp, Award, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ------------------------------------------------------------------
// CURRENT STATUS TAB
// ------------------------------------------------------------------
const CurrentStatusTab = ({ user }) => {
  return (
    <div className="tab-anim-wrapper">
      <div className="dashboard-metrics-grid">
        {/* Metric 1: Resume */}
        <div className="dashboard-metric-card glass-card">
          <div className="metric-header">
            <div className="metric-title">Resume Status</div>
            <div className="metric-icon">📄</div>
          </div>
          <div className="metric-content">
            <div style={{ position:'relative', width:'80px', height:'80px', margin:'0 auto' }}>
              <svg width="80" height="80" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <motion.circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke={user.resumeStatus === 'Updated' ? '#00FFB3' : '#FFB800'} 
                  strokeWidth="8" strokeDasharray="283" 
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: user.resumeStatus === 'Updated' ? 0 : 140 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:'bold', color: user.resumeStatus === 'Updated' ? '#00FFB3' : '#FFB800' }}>
                {user.resumeStatus === 'Updated' ? '100%' : '50%'}
              </div>
            </div>
            <div style={{ textAlign:'center', marginTop:'15px', color:'var(--text-muted)' }}>
              {user.resumeStatus}
            </div>
          </div>
        </div>

        {/* Metric 2: Attendance */}
        <div className="dashboard-metric-card glass-card">
          <div className="metric-header">
            <div className="metric-title">Attendance</div>
            <div className="metric-icon">📅</div>
          </div>
          <div className="metric-content" style={{ display:'flex', alignItems:'flex-end', height:'80px', gap:'8px', padding:'0 10px' }}>
            {[80, 100, 100, 40, 100].map((h, i) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'5px' }}>
                <motion.div 
                  initial={{ height: 0 }} 
                  animate={{ height: `${h}%` }} 
                  transition={{ duration: 0.8, delay: i*0.1 }}
                  style={{ width:'100%', background: h < 100 ? '#FF3366' : '#00D4FF', borderRadius:'4px 4px 0 0' }}
                />
                <span style={{ fontSize:'0.6rem', color:'var(--text-muted)' }}>{['M','T','W','T','F'][i]}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:'15px', color:'var(--text-muted)' }}>
            4/5 Days Logged
          </div>
        </div>

        {/* Metric 3: Opportunities */}
        <div className="dashboard-metric-card glass-card">
          <div className="metric-header">
            <div className="metric-title">Opportunities</div>
            <div className="metric-icon">💼</div>
          </div>
          <div className="metric-content" style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'80px' }}>
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ type:'spring', bounce:0.5 }}
              style={{ fontSize:'3rem', fontWeight:'700', color:'#7B2FFF', textShadow:'0 0 20px rgba(123,47,255,0.5)' }}
            >
              12
            </motion.div>
          </div>
          <div style={{ textAlign:'center', marginTop:'15px', color:'var(--text-muted)' }}>
            Client Interviews Lined Up
          </div>
        </div>

        {/* Metric 4: Training */}
        <div className="dashboard-metric-card glass-card">
          <div className="metric-header">
            <div className="metric-title">Training</div>
            <div className="metric-icon">🎓</div>
          </div>
          <div className="metric-content" style={{ display:'flex', flexDirection:'column', justifyContent:'center', height:'80px', gap:'10px' }}>
            <div style={{ display:'flex', gap:'5px' }}>
              <div style={{ flex:1, height:'8px', background:'#00FFB3', borderRadius:'4px', boxShadow:'0 0 10px #00FFB3' }}></div>
              <div style={{ flex:1, height:'8px', background:'#00FFB3', borderRadius:'4px', boxShadow:'0 0 10px #00FFB3' }}></div>
              <div style={{ flex:1, height:'8px', background:'rgba(255,255,255,0.1)', borderRadius:'4px' }}></div>
            </div>
            <div style={{ fontSize:'0.85rem' }}>Cloud Native Arch.</div>
            <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>66% Completed</div>
          </div>
        </div>
      </div>

      {/* Workflow Progress */}
      <h3 style={{ marginTop:'40px', marginBottom:'20px', fontSize:'1.1rem', color:'rgba(232,244,255,0.7)' }}>Real-Time Readiness Workflow</h3>
      <div className="glass-card" style={{ padding:'30px', position:'relative' }}>
        <div style={{ position:'absolute', top:'50px', left:'60px', right:'60px', height:'4px', background:'rgba(255,255,255,0.1)', zIndex:0 }}></div>
        <div style={{ position:'absolute', top:'50px', left:'60px', width:'66%', height:'4px', background:'var(--accent-cyan)', boxShadow:'0 0 15px var(--accent-cyan)', zIndex:1 }}></div>
        
        <div style={{ display:'flex', justifyContent:'space-between', position:'relative', zIndex:2 }}>
          {['Resume Updated', 'Attendance Verified', 'Training Completed', 'Client Ready'].map((step, i) => {
            const status = i < 2 ? 'done' : i === 2 ? 'active' : 'pending';
            const color = status === 'done' ? '#00FFB3' : status === 'active' ? '#00D4FF' : '#555';
            return (
              <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'15px', width:'120px' }}>
                <div style={{ 
                  width:'40px', height:'40px', borderRadius:'50%', 
                  background: status === 'pending' ? 'rgba(0,0,0,0.5)' : '#050A1A',
                  border: `2px solid ${color}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow: status !== 'pending' ? `0 0 15px ${color}` : 'none'
                }}>
                  {status === 'done' ? <CheckCircle size={20} color={color} /> : <div style={{width:'10px', height:'10px', borderRadius:'50%', background:color}}></div>}
                </div>
                <div style={{ textAlign:'center', fontSize:'0.85rem', color: status === 'pending' ? 'var(--text-muted)' : '#fff' }}>{step}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// RESUME TAB
// ------------------------------------------------------------------
const ResumeTab = () => {
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [skills, setSkills] = useState([]);

  const handleUpload = (e) => {
    e.preventDefault();
    setFile("aditya_sharma_resume_v4.pdf");
    setExtracting(true);
    
    // Simulate AI extraction
    setTimeout(() => {
      setExtracting(false);
      setSkills(['Java 17', 'Spring Boot 3', 'Microservices', 'Docker', 'Kubernetes', 'AWS EC2', 'PostgreSQL', 'Kafka', 'React.js']);
    }, 2500);
  };

  return (
    <div className="tab-anim-wrapper" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px' }}>
      <div className="glass-card" style={{ padding:'40px', display:'flex', flexDirection:'column', gap:'20px' }}>
        <h3><FileText size={20} style={{marginRight:'10px', verticalAlign:'middle'}}/> Upload Resume</h3>
        <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>Upload your latest resume. Our AI agent will automatically parse and extract your skills to update your consultant profile.</p>
        
        <div 
          onClick={handleUpload}
          style={{ 
            border: '2px dashed rgba(0,212,255,0.3)', borderRadius:'12px', padding:'50px 20px', 
            textAlign:'center', cursor:'pointer', background:'rgba(0,212,255,0.05)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor='rgba(0,212,255,0.8)'}
          onMouseLeave={e => e.currentTarget.style.borderColor='rgba(0,212,255,0.3)'}
        >
          {file ? (
            <div style={{ color:'var(--accent-cyan)' }}>
              <FileText size={40} style={{margin:'0 auto 15px'}} />
              <strong>{file}</strong>
              <div style={{fontSize:'0.8rem', marginTop:'10px', color:'var(--text-muted)'}}>Click to replace file</div>
            </div>
          ) : (
            <div>
              <UploadCloud size={40} style={{ margin:'0 auto 15px', color:'var(--text-muted)' }} />
              <strong>Drag & Drop or Click to Upload</strong>
              <div style={{fontSize:'0.8rem', marginTop:'10px', color:'var(--text-muted)'}}>PDF, DOCX up to 5MB</div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ padding:'40px' }}>
        <h3><Search size={20} style={{marginRight:'10px', verticalAlign:'middle'}}/> AI Skill Extraction</h3>
        <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', marginBottom:'30px' }}>
          Extracted skills will feed into the Multi-Agent Framework for opportunity matching and gap analysis.
        </p>
        
        {extracting ? (
          <div style={{ textAlign:'center', padding:'50px 0' }}>
            <div className="spinner-ring" style={{width:'40px', height:'40px', margin:'0 auto 20px', borderWidth:'3px'}}></div>
            <div className="cyan" style={{ animation: 'pulse 1.5s infinite' }}>AI Agent Parsing Resume...</div>
          </div>
        ) : skills.length > 0 ? (
          <motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
              {skills.map((s, i) => (
                <motion.span 
                  initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay: i*0.1, type:'spring' }}
                  key={i} 
                  style={{ 
                    background:'rgba(123,47,255,0.15)', border:'1px solid rgba(123,47,255,0.4)', 
                    color:'#E8F4FF', padding:'8px 16px', borderRadius:'20px', fontSize:'0.85rem',
                    boxShadow: '0 0 10px rgba(123,47,255,0.2)'
                  }}
                >
                  {s}
                </motion.span>
              ))}
            </div>
            <div style={{ marginTop:'30px', padding:'15px', background:'rgba(0,255,179,0.1)', borderLeft:'4px solid #00FFB3', fontSize:'0.85rem' }}>
              <strong>Extraction Success:</strong> 9 technical skills mapped to standard ontology. Profile synchronized.
            </div>
          </motion.div>
        ) : (
          <div style={{ textAlign:'center', padding:'50px 0', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'12px', color:'var(--text-muted)' }}>
            No resume uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// ATTENDANCE TAB
// ------------------------------------------------------------------
const AttendanceTab = () => {
  const days = Array.from({length: 31}, (_, i) => i + 1);
  const getStatus = (day) => {
    if (day > 25) return 'future';
    if ([6, 7, 13, 14, 20, 21].includes(day)) return 'weekend';
    if (day === 10) return 'absent';
    if (day === 18) return 'leave';
    return 'present';
  };

  return (
    <div className="tab-anim-wrapper glass-card" style={{ padding:'40px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px' }}>
        <h3><CalendarIcon size={20} style={{marginRight:'10px', verticalAlign:'middle'}}/> March 2026</h3>
        <div style={{ display:'flex', gap:'10px' }}>
          <button className="btn" style={{padding:'8px', background:'transparent', border:'1px solid rgba(255,255,255,0.1)'}}><ChevronLeft size={18}/></button>
          <button className="btn" style={{padding:'8px', background:'transparent', border:'1px solid rgba(255,255,255,0.1)'}}><ChevronRight size={18}/></button>
        </div>
      </div>

      <div style={{ display:'flex', gap:'20px', marginBottom:'30px', fontSize:'0.85rem' }}>
        <span style={{display:'flex', alignItems:'center', gap:'8px'}}><div style={{width:'12px',height:'12px',borderRadius:'50%',background:'#00FFB3'}}></div> Present (16)</span>
        <span style={{display:'flex', alignItems:'center', gap:'8px'}}><div style={{width:'12px',height:'12px',borderRadius:'50%',background:'#FF3366'}}></div> Absent (1)</span>
        <span style={{display:'flex', alignItems:'center', gap:'8px'}}><div style={{width:'12px',height:'12px',borderRadius:'50%',background:'#FFB800'}}></div> Leave (1)</span>
        <span style={{display:'flex', alignItems:'center', gap:'8px'}}><div style={{width:'12px',height:'12px',borderRadius:'50%',background:'rgba(255,255,255,0.05)'}}></div> Weekend/Future</span>
      </div>

      <div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'10px', textAlign:'center', color:'var(--text-muted)', marginBottom:'15px', fontSize:'0.9rem' }}>
          <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'10px' }}>
          {/* Padding days */}
          <div className="cal-day pad"></div><div className="cal-day pad"></div><div className="cal-day pad"></div><div className="cal-day pad"></div><div className="cal-day pad"></div><div className="cal-day pad"></div>
          
          {days.map(d => {
            const status = getStatus(d);
            let bg = 'rgba(255,255,255,0.03)';
            let border = '1px solid rgba(255,255,255,0.05)';
            if (status === 'present') { bg = 'rgba(0,255,179,0.1)'; border = '1px solid rgba(0,255,179,0.4)'; }
            if (status === 'absent')  { bg = 'rgba(255,51,102,0.1)'; border = '1px solid rgba(255,51,102,0.4)'; }
            if (status === 'leave')   { bg = 'rgba(255,184,0,0.1)'; border = '1px solid rgba(255,184,0,0.4)'; }
            
            return (
              <motion.div 
                whileHover={{ y:-2, background:'rgba(255,255,255,0.1)' }}
                key={d} 
                style={{
                  aspectRatio:'1', background:bg, border:border, borderRadius:'8px',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem',
                  color: status === 'future' || status === 'weekend' ? 'rgba(255,255,255,0.3)' : '#fff',
                  cursor:'pointer'
                }}
              >
                {d}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------
// TRAINING TAB
// ------------------------------------------------------------------
const TrainingTab = () => {
  return (
    <div className="tab-anim-wrapper" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px' }}>
      <div className="glass-card" style={{ padding:'40px' }}>
        <h3><Zap size={20} style={{marginRight:'10px', color:'var(--accent-cyan)', verticalAlign:'middle'}}/> AI Skill Gap Analysis</h3>
        <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', marginBottom:'30px' }}>
          Comparing your extracted skills against the standard <strong style={{color:'#fff'}}>"Senior Full Stack Engineer"</strong> role requirements.
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
          <div>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'0.85rem'}}>
              <span>React ecosystem (Matches role)</span> <span style={{color:'#00FFB3'}}>100% Match</span>
            </div>
            <div style={{height:'6px', background:'rgba(255,255,255,0.1)', borderRadius:'3px'}}><div style={{width:'100%',height:'100%',background:'#00FFB3',borderRadius:'3px',boxShadow:'0 0 10px #00FFB3'}}></div></div>
          </div>
          <div>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'0.85rem'}}>
              <span>Java / Spring Boot (Matches role)</span> <span style={{color:'#00FFB3'}}>100% Match</span>
            </div>
            <div style={{height:'6px', background:'rgba(255,255,255,0.1)', borderRadius:'3px'}}><div style={{width:'100%',height:'100%',background:'#00FFB3',borderRadius:'3px',boxShadow:'0 0 10px #00FFB3'}}></div></div>
          </div>
          <div>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'0.85rem'}}>
              <span>System Design & Architecture</span> <span style={{color:'#FFB800'}}>Gap Detected</span>
            </div>
            <div style={{height:'6px', background:'rgba(255,255,255,0.1)', borderRadius:'3px'}}><div style={{width:'40%',height:'100%',background:'#FFB800',borderRadius:'3px',boxShadow:'0 0 10px #FFB800'}}></div></div>
          </div>
          <div>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px', fontSize:'0.85rem'}}>
              <span>GraphQL / Apollo</span> <span style={{color:'#FF3366'}}>Missing</span>
            </div>
            <div style={{height:'6px', background:'rgba(255,255,255,0.1)', borderRadius:'3px'}}><div style={{width:'10%',height:'100%',background:'#FF3366',borderRadius:'3px'}}></div></div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding:'40px' }}>
        <h3><Award size={20} style={{marginRight:'10px', verticalAlign:'middle'}}/> Recommended Training Plan</h3>
        <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', marginBottom:'30px' }}>
          Auto-enrolled modules based on gap analysis. Keep completing these to improve your placement chances.
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:'15px' }}>
          <div style={{ padding:'20px', background:'rgba(255,255,255,0.03)', borderLeft:'3px solid #00FFB3', borderRadius:'4px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
              <strong style={{fontSize:'0.95rem'}}>Hexaware Cloud Native Architecture</strong>
              <span style={{fontSize:'0.75rem', background:'rgba(0,255,179,0.1)', color:'#00FFB3', padding:'4px 8px', borderRadius:'12px'}}>Completed</span>
            </div>
            <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Completed on: Mar 15, 2026</div>
          </div>

          <div style={{ padding:'20px', background:'rgba(255,255,255,0.03)', borderLeft:'3px solid #00D4FF', borderRadius:'4px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
              <strong style={{fontSize:'0.95rem'}}>System Design Masterclass</strong>
              <span style={{fontSize:'0.75rem', background:'rgba(0,212,255,0.1)', color:'#00D4FF', padding:'4px 8px', borderRadius:'12px'}}>In Progress</span>
            </div>
            <div style={{height:'4px', background:'rgba(255,255,255,0.1)', borderRadius:'2px', marginBottom:'10px'}}><div style={{width:'40%',height:'100%',background:'#00D4FF',borderRadius:'2px',boxShadow:'0 0 8px #00D4FF'}}></div></div>
            <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Estimated completion: Mar 28, 2026</div>
          </div>

          <div style={{ padding:'20px', background:'rgba(255,255,255,0.03)', borderLeft:'3px solid #555', borderRadius:'4px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
              <strong style={{fontSize:'0.95rem'}}>GraphQL Fundamentals</strong>
              <span style={{fontSize:'0.75rem', background:'rgba(255,255,255,0.1)', color:'#aaa', padding:'4px 8px', borderRadius:'12px'}}>Not Started</span>
            </div>
            <button className="btn btn-secondary" style={{padding:'6px 15px', fontSize:'0.75rem'}}>Start Module</button>
          </div>
        </div>
      </div>
    </div>
  );
};


// ------------------------------------------------------------------
// MAIN DASHBOARD COMPONENT
// ------------------------------------------------------------------
const ConsultantDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Parse '?tab=' from URL, default to 'overview'
  const params = new URLSearchParams(location.search);
  const activeTab = params.get('tab') || 'overview';
  
  const user = CONSULTANTS.consultants[0];

  const handleTabChange = (tabId) => {
    navigate(`/dashboard?tab=${tabId}`, { replace: true });
  };

  const tabs = [
    { id: 'overview', label: 'Current Status' },
    { id: 'resume', label: 'My Resume' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'training', label: 'Training & Skills' }
  ];

  return (
    <PageTransition>
      <div className="layout-with-sidebar" id="page-dashboard">
        <Sidebar isAdminView={false} />
        
        <main className="main-content">
          <div className="dashboard-header">
            <div>
              <h1 style={{ margin:0, fontSize:'1.8rem', letterSpacing:'1px', textTransform:'uppercase' }}>Consultant <span className="cyan">Portal</span></h1>
              <div style={{ color:'var(--text-muted)', marginTop:'5px', fontSize:'0.9rem' }}>Welcome back, {user.name}. Here is your benchmark status.</div>
            </div>
            <button className="btn btn-primary" style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <TrendingUp size={18}/> View Market Opportunities
            </button>
          </div>

          <div className="dashboard-tabs" style={{ display:'flex', gap:'10px', borderBottom:'1px solid rgba(255,255,255,0.1)', marginBottom:'30px', paddingBottom:'2px' }}>
            {tabs.map(t => (
              <button 
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                style={{
                  background: 'none', border: 'none', 
                  padding: '12px 20px', fontSize: '0.95rem', cursor: 'pointer',
                  color: activeTab === t.id ? '#00D4FF' : '#aaa',
                  borderBottom: activeTab === t.id ? '2px solid #00D4FF' : '2px solid transparent',
                  transition: 'all 0.2s', fontWeight: activeTab === t.id ? '600' : '400'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && <CurrentStatusTab user={user} />}
              {activeTab === 'resume' && <ResumeTab />}
              {activeTab === 'attendance' && <AttendanceTab />}
              {activeTab === 'training' && <TrainingTab />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </PageTransition>
  );
};

export default ConsultantDashboard;
