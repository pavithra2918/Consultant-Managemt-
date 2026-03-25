import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

// Import our new React global CSS and legacy styles
import './index.css';
import '../css/main.css';
import '../css/home.css';
import '../css/admin.css';
import '../css/dashboard.css';
import '../css/agents.css';
import '../css/splash.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
