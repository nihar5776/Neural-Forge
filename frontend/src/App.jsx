import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { api } from './utils/api';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import JobSearch from './pages/JobSearch';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Quiz from './pages/Quiz';
import MockInterview from './pages/MockInterview';
import TailorResume from './pages/TailorResume';
import GamificationEngine from './components/GamificationEngine';

// Admin Views
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminHealth from './pages/admin/AdminHealth';
import AdminExport from './pages/admin/AdminExport';

// Authenticated layout wrapper forwarding XP stats to the Sidebar
function AppLayout({ user, handleLogoutSuccess, xp, level, xpNeeded, classNameTitle }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Floating Toggle Button to OPEN sidebar (only visible when collapsed) */}
      {isSidebarCollapsed && (
        <button 
          onClick={() => setIsSidebarCollapsed(false)}
          className="sidebar-toggle-open"
          style={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            zIndex: 99,
            background: '#fbd000',
            border: '3px solid #000000',
            color: '#000000',
            padding: '8px 12px',
            fontSize: '14px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            boxShadow: '2px 2px 0px #000000',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e52521';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fbd000';
            e.currentTarget.style.color = '#000000';
          }}
        >
          <span>▶</span> OPEN MENU
        </button>
      )}

      <Sidebar 
        user={user} 
        onLogoutSuccess={handleLogoutSuccess} 
        xp={xp} 
        level={level} 
        xpNeeded={xpNeeded} 
        classNameTitle={classNameTitle} 
        onToggleCollapse={() => setIsSidebarCollapsed(true)}
      />
      <main className="main-content animate-fade-in">
        <Routes>
          {user?.role === 'admin' ? (
            <>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers currentUser={user} />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/health" element={<AdminHealth />} />
              <Route path="/admin/export" element={<AdminExport />} />
              <Route path="/profile" element={<Profile />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<ResumeUpload />} />
              <Route path="/tailor" element={<TailorResume />} />
              <Route path="/jobs" element={<JobSearch />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/dashboard/mock-interview" element={<MockInterview />} />
            </>
          )}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Validate session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setUser(null);
        setAuthChecked(true);
        return;
      }
      try {
        const data = await api.get('/api/auth/get-me');
        if (data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.log('No active session / unauthorized.');
        setUser(null);
        sessionStorage.removeItem('token');
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogoutSuccess = () => {
    setUser(null);
    sessionStorage.removeItem('token');
  };

  if (!authChecked) {
    return (
      <div className="app-splash-loader">
        <div className="splash-card">
          <div className="logo-accent spinner" style={{ background: '#e52521', border: '2.5px solid #000' }}>NF</div>
          <h2>Neural Forge</h2>
          <p>Initializing your career path...</p>
        </div>
      </div>
    );
  }

  // Handle routing guards
  if (!user) {
    return (
      <GamificationEngine>
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </GamificationEngine>
    );
  }

  return (
    <GamificationEngine>
      <AppLayout user={user} handleLogoutSuccess={handleLogoutSuccess} />
    </GamificationEngine>
  );
}
