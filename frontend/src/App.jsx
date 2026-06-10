import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import Home from './pages/Home';

// Admin Views
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminExport from './pages/admin/AdminExport';
import AdminProfile from './pages/admin/AdminProfile';

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    // Clear auth token
    sessionStorage.removeItem('token');
    // Clear all feature session data so the next user starts fresh
    const featureKeys = [
      'resume_upload_session',
      'tailor_resume_session',
      'job_search_session',
      'quiz_session',
      'mock_interview_session',
    ];
    featureKeys.forEach(key => sessionStorage.removeItem(key));
  };

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background bg-cyber-glow relative overflow-hidden font-sans">
        <div className="cyber-grid" />
        <div className="cyber-scanlines" />
        <div className="text-center flex flex-col items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-heading font-extrabold text-2xl shadow-lg border border-cyan/40 spinner relative">
            <div className="absolute inset-0 rounded-xl border border-accent animate-ping opacity-35" />
            NF
          </div>
          <h2 className="text-3xl font-heading font-extrabold tracking-wider text-text-main uppercase">Neural Forge OS</h2>
          <p className="text-cyan text-xs font-mono tracking-widest uppercase animate-pulse">Initializing Career Intelligence Core...</p>
        </div>
      </div>
    );
  }

  // Handle routing guards for guest users
  if (!user) {
    return (
      <div className="bg-background min-h-screen bg-cyber-glow text-text-main relative overflow-hidden">
        <div className="cyber-grid" />
        <div className="cyber-scanlines" />
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background bg-cyber-glow text-text-main font-sans selection:bg-primary/30 selection:text-white relative overflow-hidden">
      <div className="cyber-grid" />
      <div className="cyber-scanlines" />
      
      <Sidebar 
        user={user} 
        onLogoutSuccess={handleLogoutSuccess} 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      <main className={`flex-1 p-6 md:p-10 min-w-0 transition-all duration-300 relative z-10 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="w-full max-w-7xl mx-auto"
          >
            <Routes location={location}>
              {user?.role === 'admin' ? (
                <>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers currentUser={user} />} />
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/admin/export" element={<AdminExport />} />
                  <Route path="/profile" element={<AdminProfile />} />
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
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

