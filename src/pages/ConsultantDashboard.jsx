import { useState, useEffect, useRef } from 'react';
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
  const [experience, setExperience] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile.name);
    setExtracting(true);
    
    const formData = new FormData();
    formData.append('resume', selectedFile);
    
    try {
      const response = await fetch('http://localhost:3000/api/resume/analyze', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      
      if (data.success) {
        setSkills(data.skills);
        setExperience(data.experienceYears);
      } else {
        console.error("Extraction failed: " + data.message);
        setSkills(['Parsing Failed']);
      }
    } catch (err) {
      console.error(err);
      setSkills(['Backend Offline']);
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="tab-anim-wrapper" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px' }}>
      <div className="glass-card" style={{ padding:'40px', display:'flex', flexDirection:'column', gap:'20px' }}>
        <h3><FileText size={20} style={{marginRight:'10px', verticalAlign:'middle'}}/> Upload Resume</h3>
        <p style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>Upload your latest resume. Our AI agent will automatically parse and extract your skills to update your consultant profile.</p>
        
        <div 
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          style={{ 
            border: '2px dashed rgba(0,212,255,0.3)', borderRadius:'12px', padding:'50px 20px', 
            textAlign:'center', cursor:'pointer', background:'rgba(0,212,255,0.05)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor='rgba(0,212,255,0.8)'}
          onMouseLeave={e => e.currentTarget.style.borderColor='rgba(0,212,255,0.3)'}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept=".pdf,.txt,.docx" 
          />
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
              <strong>Extraction Success:</strong> {skills.length} technical skills mapped to standard ontology. Profile synchronized.
              <br/><br/>
              <strong>Estimated Experience:</strong> {experience} years based on chronological parsing.
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
  const [attendance, setAttendance] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/consultant/1/state')
      .then(r => r.json())
      .then(data => {
        if(data.success) setAttendance(data.state.attendance);
      }).catch(err => console.error("Agent Sync Error:", err));
  }, []);

  const toggleDay = async (day) => {
    if (!attendance) return;
    const current = attendance[day];
    if (current === 'future' || current === 'weekend') return; // Cannot edit future or weekends
    
    // Cycle: present -> absent -> leave -> present
    const cycle = { present: 'absent', absent: 'leave', leave: 'present' };
    const nextStatus = cycle[current];
    
    // Optimistic UI Data Sync
    setAttendance(prev => ({ ...prev, [day]: nextStatus }));

    // Emit mutation to Backend Agent
    try {
      await fetch('http://localhost:3000/api/attendance/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultantId: "1", day, status: nextStatus })
      });
    } catch(e) { 
      console.error("Database sync failed", e); 
      alert("⚠️ Warning: Node.js Backend is disconnected! Attendance was updated in React memory, but could not sync to persistent database.");
    }
  };

  if (!attendance) return <div style={{padding:'40px', textAlign:'center', color:'var(--accent-cyan)'}}>Syncing with Attendance Agent DB...</div>;

  const counts = { present: 0, absent: 0, leave: 0 };
  Object.values(attendance).forEach(val => { if (counts[val] !== undefined) counts[val]++ });

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
        <span style={{display:'flex', alignItems:'center', gap:'8px'}}><div style={{width:'12px',height:'12px',borderRadius:'50%',background:'#00FFB3'}}></div> Present ({counts.present})</span>
        <span style={{display:'flex', alignItems:'center', gap:'8px'}}><div style={{width:'12px',height:'12px',borderRadius:'50%',background:'#FF3366'}}></div> Absent ({counts.absent})</span>
        <span style={{display:'flex', alignItems:'center', gap:'8px'}}><div style={{width:'12px',height:'12px',borderRadius:'50%',background:'#FFB800'}}></div> Leave ({counts.leave})</span>
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
            const status = attendance[d];
            let bg = 'rgba(255,255,255,0.03)';
            let border = '1px solid rgba(255,255,255,0.05)';
            if (status === 'present') { bg = 'rgba(0,255,179,0.1)'; border = '1px solid rgba(0,255,179,0.4)'; }
            if (status === 'absent')  { bg = 'rgba(255,51,102,0.1)'; border = '1px solid rgba(255,51,102,0.4)'; }
            if (status === 'leave')   { bg = 'rgba(255,184,0,0.1)'; border = '1px solid rgba(255,184,0,0.4)'; }
            
            return (
              <motion.div 
                whileHover={{ y: (status === 'future' || status === 'weekend') ? 0 : -2, background: (status === 'future' || status === 'weekend') ? bg : 'rgba(255,255,255,0.1)' }}
                key={d} 
                onClick={() => toggleDay(d)}
                style={{
                  aspectRatio:'1', background:bg, border:border, borderRadius:'8px',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem',
                  color: status === 'future' || status === 'weekend' ? 'rgba(255,255,255,0.3)' : '#fff',
                  cursor: status === 'future' || status === 'weekend' ? 'default' : 'pointer'
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
// TRAINING TAB (Phase 4 Dynamic Hub)
// ------------------------------------------------------------------
const TrainingTab = ({ user }) => {
  const [targetJobId, setTargetJobId] = useState(102); // Default target Job
  const [trainingPlan, setTrainingPlan] = useState(null);

  // Fetch dynamic recommendations when target job changes
  useEffect(() => {
    fetch('http://localhost:3000/api/training/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultantId: "1", targetJobId, userSkills: user.skills })
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) setTrainingPlan(data);
    }).catch(e => console.error("Dynamic Training Sync Failed", e));
  }, [targetJobId, user.skills]);

  const handleEnrollment = async (courseId) => {
    // Optimistic UI update
    setTrainingPlan(prev => ({
      ...prev,
      recommendations: prev.recommendations.map(c => c.id === courseId ? { ...c, status: 'In Progress' } : c)
    }));

    try {
      await fetch('http://localhost:3000/api/training/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultantId: "1", targetModule: courseId })
      });
    } catch (e) { 
      alert("⚠️ Warning: Node.js Backend is disconnected! State updated in memory.");
    }
  };

  if (!trainingPlan) return <div style={{padding:'40px', color:'var(--accent-cyan)'}}>Generating AI Training Plan based on your skills...</div>;

  return (
    <div className="tab-anim-wrapper" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px' }}>
      <div className="glass-card" style={{ padding:'40px' }}>
        <h3><Zap size={20} style={{marginRight:'10px', color:'var(--accent-cyan)', verticalAlign:'middle'}}/> Dynamic Skill Gap Analysis</h3>
        <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', marginBottom:'20px' }}>
          Comparing your current skills against <strong style={{color:'#fff'}}>{trainingPlan.targetJob}</strong>.
        </p>
        
        <div style={{ marginBottom:'25px' }}>
          <label style={{ fontSize:'0.85rem', color:'var(--text-muted)', display:'block', marginBottom:'8px' }}>Change Target Role:</label>
          <select 
            value={targetJobId} onChange={e => setTargetJobId(parseInt(e.target.value))}
            style={{ width:'100%', padding:'10px', background:'rgba(0,0,0,0.3)', color:'#fff', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'6px' }}
          >
            <option value={101}>Senior Backend Developer</option>
            <option value={102}>Full Stack Architect</option>
            <option value={103}>Data Scientist</option>
            <option value={104}>Cloud Infrastructure Dev</option>
            <option value={105}>React Frontend Engineer</option>
          </select>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          <strong style={{ fontSize:'0.9rem', color:'#fff' }}>Identified Missing Skills:</strong>
          {trainingPlan.missingSkills.length === 0 ? (
            <div style={{ color:'#00FFB3', fontSize:'0.9rem' }}>You possess all required skills for this role! 🎉</div>
          ) : (
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
              {trainingPlan.missingSkills.map(s => (
                <span key={s} style={{ padding:'6px 12px', background:'rgba(255,51,102,0.1)', color:'#FF3366', borderRadius:'16px', fontSize:'0.8rem', border:'1px solid rgba(255,51,102,0.3)' }}>
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="glass-card" style={{ padding:'40px' }}>
        <h3><Award size={20} style={{marginRight:'10px', verticalAlign:'middle'}}/> Recommended Courses</h3>
        <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', marginBottom:'30px' }}>
          Curated modules to permanently bridge your technical gaps.
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:'15px' }}>
          {trainingPlan.recommendations.length === 0 ? (
            <div style={{ color:'var(--text-muted)', fontSize:'0.9rem' }}>No training required. Ready for deployment.</div>
          ) : (
            trainingPlan.recommendations.map(course => (
              <div key={course.id} style={{ padding:'20px', background:'rgba(255,255,255,0.03)', borderLeft: course.status === 'In Progress' ? '3px solid #00D4FF' : '3px solid #555', borderRadius:'4px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                  <strong style={{fontSize:'0.95rem'}}>{course.title}</strong>
                  <span style={{
                    fontSize:'0.75rem', 
                    background: course.status === 'In Progress' ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.1)', 
                    color: course.status === 'In Progress' ? '#00D4FF' : '#aaa', 
                    padding:'4px 8px', borderRadius:'12px'
                  }}>
                    {course.status}
                  </span>
                </div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'10px' }}>Targets: {course.skill}</div>
                
                {course.status === 'In Progress' ? (
                  <div style={{height:'4px', background:'rgba(255,255,255,0.1)', borderRadius:'2px'}}>
                    <motion.div initial={{width:0}} animate={{width:'5%'}} transition={{duration:1.5}} style={{height:'100%',background:'#00D4FF',borderRadius:'2px',boxShadow:'0 0 8px #00D4FF'}}/>
                  </div>
                ) : (
                  <button className="btn btn-secondary" onClick={() => handleEnrollment(course.id)} style={{padding:'6px 15px', fontSize:'0.75rem'}}>Start Module</button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};


// ------------------------------------------------------------------
// OPPORTUNITIES TAB (Phase 4 Dynamic Hub)
// ------------------------------------------------------------------
const OpportunitiesTab = ({ user }) => {
  const [opps, setOpps] = useState(null);

  // Dynamically calculate matching network state based on actual User Skills constraint
  useEffect(() => {
    fetch('http://localhost:3000/api/opportunities/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultantId: "1", userSkills: user.skills })
    })
    .then(r => r.json())
    .then(data => {
      if (data.success) setOpps(data.matches);
    }).catch(e => console.error("Dynamic Sync Failed", e));
  }, [user.skills]);

  const applyForJob = async (id) => {
    setOpps(prev => prev.map(o => o.id === id ? { ...o, status: 'Applied' } : o)); // Optimistic UI
    try {
      await fetch('http://localhost:3000/api/opportunities/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consultantId: "1", jobId: id })
      });
    } catch (e) { 
      alert("⚠️ Warning: Node.js Backend is disconnected! Job Application was successful in React memory.");
    }
  };

  if (!opps) return <div style={{padding:'40px', color:'var(--accent-cyan)'}}>Running Mathematical Skill Intersection Agent...</div>;

  return (
    <div className="tab-anim-wrapper glass-card" style={{ padding:'40px' }}>
      <h3><TrendingUp size={20} style={{marginRight:'10px', color:'var(--accent-cyan)', verticalAlign:'middle'}}/> Market Opportunities</h3>
      <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', marginBottom:'30px' }}>
        AI-Matched roles algorithmically dynamically scored against your latest skill extraction ({user.skills.join(', ')}).
      </p>
      
      <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
        <AnimatePresence>
          {opps.map((opp) => (
            <motion.div 
              key={opp.id} 
              layout
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              style={{ background:'rgba(255,255,255,0.03)', padding:'25px', borderRadius:'12px', borderLeft:`4px solid ${opp.matchScore >= 90 ? '#00FFB3' : opp.matchScore >= 60 ? '#00D4FF' : '#FFB800'}`, borderBottom:'1px solid rgba(255,255,255,0.05)' }}
            >
               <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                 <h4 style={{ margin:0, fontSize:'1.1rem', display:'flex', alignItems:'center', gap:'10px' }}>
                   {opp.title}
                   {opp.matchScore < 60 && (
                     <span style={{ fontSize:'0.7rem', padding:'4px 8px', background:'rgba(255,184,0,0.1)', color:'#FFB800', borderRadius:'12px', border:'1px solid rgba(255,184,0,0.4)', fontWeight:'normal' }}>
                       ⚠️ Need to improve skills
                     </span>
                   )}
                 </h4>
                 <span style={{ color: opp.matchScore >= 90 ? '#00FFB3' : opp.matchScore >= 60 ? '#00D4FF' : '#FFB800', fontWeight:'bold', display:'flex', alignItems:'center', gap:'5px' }}>
                   <Zap size={14}/> {opp.matchScore}% Match
                 </span>
               </div>
               
               <div style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'15px' }}>{opp.client} • {opp.location}</div>
               
               {/* Dynamically Map Missing Skills if any exist */}
               {opp.missingSkills.length > 0 && (
                 <div style={{ marginBottom:'20px', fontSize:'0.8rem' }}>
                   <strong style={{ color:'#aaa' }}>Missing Skills:</strong>
                   <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', marginTop:'5px' }}>
                     {opp.missingSkills.map(ms => (
                       <span key={ms} style={{ background:'rgba(255,51,102,0.1)', color:'#FF3366', padding:'2px 8px', borderRadius:'4px', border:'1px solid rgba(255,51,102,0.2)' }}>{ms}</span>
                     ))}
                   </div>
                 </div>
               )}

               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                 <span style={{ 
                   fontSize:'0.75rem', padding:'6px 12px', borderRadius:'20px', 
                   background: opp.status === 'New Match' ? 'rgba(0,212,255,0.1)' : opp.status === 'Applied' ? 'rgba(255,184,0,0.1)' : 'rgba(0,255,179,0.1)',
                   color: opp.status === 'New Match' ? '#00D4FF' : opp.status === 'Applied' ? '#FFB800' : '#00FFB3',
                   border: `1px solid ${opp.status === 'New Match' ? 'rgba(0,212,255,0.3)' : opp.status === 'Applied' ? 'rgba(255,184,0,0.3)' : 'rgba(0,255,179,0.3)'}`
                 }}>
                   {opp.status}
                 </span>
                 
                 {opp.status === 'New Match' && (
                   <button onClick={() => applyForJob(opp.id)} className="btn btn-primary" style={{ padding:'8px 20px', fontSize:'0.8rem' }}>Express Interest</button>
                 )}
                 {opp.status !== 'New Match' && (
                   <button className="btn btn-secondary" style={{ padding:'8px 20px', fontSize:'0.8rem', opacity:0.5 }}>Application Sent</button>
                 )}
               </div>
            </motion.div>
          ))}
        </AnimatePresence>
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
    { id: 'training', label: 'Training & Skills' },
    { id: 'opportunities', label: 'Opportunities' }
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
            <button 
              className="btn btn-primary" 
              onClick={() => alert(`Opportunity Matching Agent Activated!\n\nScanning Hexaware client network for ${user.department} roles requiring ${user.skills.join(', ')}...`)}
              style={{ display:'flex', alignItems:'center', gap:'8px' }}
            >
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
              {activeTab === 'training' && <TrainingTab user={user} />}
              {activeTab === 'opportunities' && <OpportunitiesTab user={user} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </PageTransition>
  );
};

export default ConsultantDashboard;
