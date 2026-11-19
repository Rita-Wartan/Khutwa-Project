import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './styles/global.css';
import './styles/layout-overrides.css';
import './styles/job-enhancements.css';
import './styles/header-dropdown.css';
import './styles/header-dropdown-bridge.css';
import './styles/auth-state.css';

createRoot(document.getElementById('root')).render(<StrictMode><AuthProvider><App /></AuthProvider></StrictMode>);
