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

// Admin Views
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminHealth from './pages/admin/AdminHealth';
import AdminExport from './pages/admin/AdminExport';

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
          <div className="logo-accent spinner">VG</div>
          <h2>VidyaGuide</h2>
          <p>Initializing your career path...</p>
        </div>
      </div>
    );
  }

  // Handle routing guards
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <Sidebar user={user} onLogoutSuccess={handleLogoutSuccess} />
      <main className="main-content">
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
