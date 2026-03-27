import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import Sidebar from '../components/Sidebar';
import { Search, Filter, DownloadCloud, FileText, AlertCircle, RefreshCw } from 'lucide-react';

const AdminConsole = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Phase 5: Dynamic Remote Datastores
  const [consultants, setConsultants] = useState([]);
  const [metrics, setMetrics] = useState({ agents: [], alerts: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Poll background server for structural mappings
  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3000/api/admin/consultants').then(r => r.json()),
      fetch('http://localhost:3000/api/admin/metrics').then(r => r.json())
    ]).then(([consData, metData]) => {
      if(consData.success) setConsultants(consData.consultants);
      if(metData.success) {
        setMetrics({ agents: metData.agents, alerts: metData.alerts });
      }
      setIsLoading(false);
    }).catch(e => {
      console.error("Admin Sync Offline", e);
      setIsLoading(false);
    });
  }, []);

  const filteredConsultants = useMemo(() => {
    return consultants.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase()) || c.skills.join(', ').toLowerCase().includes(searchTerm.toLowerCase());
      const matchDept = deptFilter === 'All' || c.department.includes(deptFilter);
      const matchStatus = statusFilter === 'All' || c.resumeStatus === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [searchTerm, deptFilter, statusFilter, consultants]);

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Department', 'Skills', 'Status'];
    const rows = filteredConsultants.map(c => [
      c.id, c.name, c.department, `"${c.skills.join(', ')}"`, c.resumeStatus
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `consultants_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageTransition>
      <div className="layout-with-sidebar" id="page-admin">
        <Sidebar isAdminView={true} />
        
        <main className="main-content">
          <div className="dashboard-header">
            <div>
              <h1 style={{ margin:0, fontSize:'1.8rem', letterSpacing:'1px', textTransform:'uppercase' }}>Admin <span className="violet">Console</span></h1>
              <div style={{ color:'var(--text-muted)', marginTop:'5px', fontSize:'0.9rem' }}>Command center for AI frameworks and consultant pool management.</div>
            </div>
            
            <div style={{ display:'flex', gap:'10px' }}>
              <button className="btn btn-secondary" onClick={exportCSV} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <FileText size={16}/> CSV
              </button>
              <button className="btn btn-primary" onClick={() => alert("Report Generation Agent triggered: Assembling PDF report from current filter view.")} style={{ display:'flex', alignItems:'center', gap:'8px', background:'var(--accent-violet)', borderColor:'var(--accent-violet)' }}>
                <DownloadCloud size={16}/> Export Report
              </button>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'30px', alignItems:'start' }}>
            
            {isLoading ? (
               <div style={{gridColumn:'1 / -1', padding:'60px', textAlign:'center', color:'var(--accent-cyan)'}}>
                 <RefreshCw className="spin-slow" size={32} style={{marginBottom:'15px'}}/><br/>
                 Syncing Global Hexaware Database Nodes...
               </div>
            ) : (
            <>
            {/* Consultant Pool Table */}
            <div className="glass-card" style={{ padding:'30px', display:'flex', flexDirection:'column', height:'calc(100vh - 160px)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                <h3 style={{ margin:0 }}><Search size={18} style={{marginRight:'8px', verticalAlign:'middle'}}/> Candidate Search</h3>
                
                <div style={{ display:'flex', gap:'10px' }}>
                  <select 
                    className="filter-select"
                    value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
                    style={{ background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', padding:'8px 12px', borderRadius:'6px' }}
                  >
                    <option value="All">All Departments</option>
                    <option value="Java">Java</option>
                    <option value="React">React</option>
                    <option value="Cloud">Cloud</option>
                  </select>
                  
                  <select 
                    className="filter-select"
                    value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    style={{ background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', padding:'8px 12px', borderRadius:'6px' }}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active Match">Active Match</option>
                    <option value="In Training">In Training</option>
                    <option value="Updated">Updated</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div style={{ position:'relative', marginBottom:'20px' }}>
                <Search size={18} style={{ position:'absolute', left:'15px', top:'10px', color:'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search by ID, Name, or Skill..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width:'100%', background:'rgba(0,0,0,0.3)', border:'1px solid rgba(0,212,255,0.3)', color:'#fff', padding:'10px 10px 10px 40px', borderRadius:'6px', outline:'none' }}
                />
              </div>

              <div style={{ flex:1, overflowY:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.9rem' }}>
                  <thead>
                    <tr style={{ background:'rgba(255,255,255,0.05)', textAlign:'left' }}>
                      <th style={{ padding:'12px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>ID / Name</th>
                      <th style={{ padding:'12px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>Department</th>
                      <th style={{ padding:'12px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>Core Skills</th>
                      <th style={{ padding:'12px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>Resume</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredConsultants.map((c, i) => (
                        <motion.tr 
                          initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
                          key={c.id} 
                          style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', background: `rgba(0,212,255,${i%2===0?0.02:0})` }}
                        >
                          <td style={{ padding:'12px' }}>
                            <div style={{ fontWeight:'600', color:'#fff' }}>{c.name}</div>
                            <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{c.id}</div>
                          </td>
                          <td style={{ padding:'12px' }}>{c.department}</td>
                          <td style={{ padding:'12px' }}>
                            <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
                              {c.skills.slice(0,2).map(s => (
                                <span key={s} style={{ background:'rgba(255,255,255,0.1)', padding:'3px 8px', borderRadius:'12px', fontSize:'0.75rem' }}>{s}</span>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding:'12px' }}>
                            <span style={{
                              background: c.resumeStatus === 'Active Match' ? 'rgba(0,255,179,0.1)' 
                                : c.resumeStatus === 'In Training' ? 'rgba(0,212,255,0.1)' 
                                : c.resumeStatus === 'Updated' ? 'rgba(255,255,255,0.1)'
                                : 'rgba(255,184,0,0.1)',
                              color: c.resumeStatus === 'Active Match' ? '#00FFB3' 
                                : c.resumeStatus === 'In Training' ? '#00D4FF' 
                                : c.resumeStatus === 'Updated' ? '#aaa'
                                : '#FFB800',
                              padding:'4px 8px', borderRadius:'12px', fontSize:'0.75rem'
                            }}>
                              {c.resumeStatus}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
                {filteredConsultants.length === 0 && (
                  <div style={{ textAlign:'center', padding:'40px', color:'var(--text-muted)' }}>No consultants found matching your filters.</div>
                )}
              </div>
            </div>

            {/* Agentic Framework Monitor Panel */}
            <div style={{ display:'flex', flexDirection:'column', gap:'30px', height:'calc(100vh - 160px)', overflowY:'auto' }}>
              
              <div className="glass-card" style={{ padding:'30px' }}>
                <h3 style={{ margin:'0 0 20px', display:'flex', alignItems:'center', gap:'8px' }}>
                  <RefreshCw size={18} className="spin-slow" style={{color:'var(--accent-cyan)'}}/>
                  Agentic Framework Monitor
                </h3>
                
                <div style={{ display:'flex', flexDirection:'column', gap:'15px' }}>
                  {metrics.agents.map(a => (
                    <div key={a.id} style={{ background:'rgba(0,0,0,0.3)', padding:'15px', borderRadius:'8px', borderLeft:`4px solid ${a.color}` }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                        <span style={{ fontWeight:'600', fontSize:'0.9rem' }}>{a.name} Node</span>
                        <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{a.metrics.queueLoad}% Load</span>
                      </div>
                      
                      <div style={{ height:'4px', background:'rgba(255,255,255,0.1)', borderRadius:'2px', marginBottom:'10px' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${a.metrics.queueLoad}%` }}
                          transition={{ duration: 1, type:'spring' }}
                          style={{ height:'100%', background: a.color, borderRadius:'2px', boxShadow:`0 0 8px ${a.color}` }}
                        />
                      </div>
                      
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--text-muted)' }}>
                        <span style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                          <span style={{ width:'6px', height:'6px', borderRadius:'50%', background: a.metrics.latency < 50 ? '#00FFB3' : '#FFB800' }}></span>
                          Latency: {a.metrics.latency}ms
                        </span>
                        <span style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                          <span style={{ width:'6px', height:'6px', borderRadius:'50%', background: a.metrics.errorRate > 1 ? '#FF3366' : '#00FFB3' }}></span>
                          Errors: {a.metrics.errorRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card" style={{ padding:'30px', background:'linear-gradient(135deg, rgba(123,47,255,0.05), rgba(0,212,255,0.05))' }}>
                <h3 style={{ margin:'0 0 15px', display:'flex', alignItems:'center', gap:'8px' }}>
                  <AlertCircle size={18} style={{color:'#FFB800'}}/> System Alerts
                </h3>
                <div style={{ fontSize:'0.85rem', color:'var(--text-muted)', lineHeight:'1.5' }}>
                  {metrics.alerts.length > 0 ? metrics.alerts.map((al, idx) => (
                    <p key={idx}><strong style={{color:'#fff'}}>[{al.time}]</strong> {al.msg}</p>
                  )) : (
                    <p>System Operating Nominally.</p>
                  )}
                </div>
              </div>

            </div>
            </>
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default AdminConsole;
