import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import HomePage from './pages/HomePage';
import AIFrameworkPage from './pages/AIFrameworkPage';
import ConsultantDashboard from './pages/ConsultantDashboard';
import AdminConsole from './pages/AdminConsole';

function App() {
  const location = useLocation();

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/dashboard" element={<ConsultantDashboard />} />
          <Route path="/admin" element={<AdminConsole />} />
          <Route path="/agents" element={<AIFrameworkPage />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
