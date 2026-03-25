import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Settings, BrainCircuit } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navs = [
    { id: 'home', path: '/home', label: 'Home' },
    { id: 'dashboard', path: '/dashboard', label: 'Consultant Portal' },
    { id: 'admin', path: '/admin', label: 'Admin Console' },
    { id: 'agents', path: '/agents', label: 'AI Framework' }
  ];

  return (
    <nav className="top-nav">
      <div className="nav-logo" onClick={() => navigate('/home')}>
        <div className="nav-logo-hex">H</div>
        <div className="nav-logo-text">Hexa<span>ware</span></div>
      </div>
      <div className="nav-links">
        {navs.map(n => (
          <button 
            key={n.id}
            className={`nav-link ${location.pathname === n.path ? 'active' : ''}`}
            onClick={() => navigate(n.path)}
          >
            {n.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
