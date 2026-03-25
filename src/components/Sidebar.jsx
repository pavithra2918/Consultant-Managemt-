import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Settings, BrainCircuit, FileText, Calendar, Crosshair, GraduationCap } from 'lucide-react';

const Sidebar = ({ isAdminView }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => navigate(path);
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate('/home')} style={{cursor:'pointer'}}>
        <div className="sidebar-logo-hex">H</div>
        <div className="sidebar-logo-text">
          Hexaware
          <small>{isAdminView ? 'Admin Console' : 'Consultant Portal'}</small>
        </div>
      </div>
      
      <div className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        
        {isAdminView ? (
          <>
            <div className={`sidebar-nav-item ${isActive('/admin')}`} onClick={() => handleNav('/admin')}>
              <span className="sidebar-nav-icon">⚙️</span> Admin Console
            </div>
            <div className={`sidebar-nav-item ${isActive('/agents')}`} onClick={() => handleNav('/agents')}>
              <span className="sidebar-nav-icon">🤖</span> AI Agents
            </div>
            <div className={`sidebar-nav-item ${isActive('/dashboard')}`} onClick={() => handleNav('/dashboard')}>
              <span className="sidebar-nav-icon">📊</span> Consultant View
            </div>
          </>
        ) : (
          <>
            <div className={`sidebar-nav-item ${isActive('/dashboard')}`} onClick={() => handleNav('/dashboard')}>
              <span className="sidebar-nav-icon">📊</span> Dashboard
            </div>
            <div className={`sidebar-nav-item ${isActive('/agents')}`} onClick={() => handleNav('/agents')}>
              <span className="sidebar-nav-icon">🤖</span> AI Agents
            </div>
            {/* These tabs are handled inside the Dashboard router, but for quick access we could link them */}
            <div className="sidebar-nav-item" onClick={() => navigate('/dashboard?tab=resume')}>
              <span className="sidebar-nav-icon">📄</span> My Resume
            </div>
            <div className="sidebar-nav-item" onClick={() => navigate('/dashboard?tab=attendance')}>
              <span className="sidebar-nav-icon">📅</span> Attendance
            </div>
            <div className="sidebar-nav-item" onClick={() => navigate('/dashboard?tab=training')}>
              <span className="sidebar-nav-icon">🎓</span> Training
            </div>
          </>
        )}

        <div className="sidebar-section-label">System</div>
        {!isAdminView && (
          <div className={`sidebar-nav-item ${isActive('/admin')}`} onClick={() => handleNav('/admin')}>
            <span className="sidebar-nav-icon">⚙️</span> Admin Console
          </div>
        )}
        <div className={`sidebar-nav-item ${isActive('/home')}`} onClick={() => handleNav('/home')}>
          <span className="sidebar-nav-icon">🏠</span> Home
        </div>
      </div>
      
      <div className="sidebar-bottom">
        <div className="sidebar-consultant-info">
          {isAdminView ? (
            <>
              <div className="sidebar-avatar" style={{background:'linear-gradient(135deg,#7B2FFF,#1E6FFF)'}}>AD</div>
              <div>
                <div className="sidebar-consultant-name">Admin User</div>
                <div className="sidebar-consultant-role">Pool Manager</div>
              </div>
            </>
          ) : (
            <>
              <div className="sidebar-avatar">AS</div>
              <div>
                <div className="sidebar-consultant-name">Aditya Sharma</div>
                <div className="sidebar-consultant-role">Java · Pool Bench</div>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
