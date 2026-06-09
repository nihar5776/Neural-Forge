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

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Validate session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await api.get('/api/auth/get-me');
        if (data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.log('No active session / unauthorized.');
        setUser(null);
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
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<ResumeUpload />} />
          <Route path="/jobs" element={<JobSearch />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/dashboard/mock-interview" element={<MockInterview />} />
          <Route path="/tailor" element={<TailorResume />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
