import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { LayoutDashboard, FileText, Briefcase, LogOut, User, ClipboardList, MessageSquare, Wand2 } from 'lucide-react';

export default function Sidebar({ user, onLogoutSuccess }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      onLogoutSuccess();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      // Even if API logout fails (e.g. server down or cookie already cleared), we still clean client state
      onLogoutSuccess();
      navigate('/login');
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">VG</span>
        <span className="logo-text">VidyaGuide</span>
      </div>

      <div className="user-profile-badge">
        <div className="avatar">
          <User size={20} />
        </div>
        <div className="user-info">
          <p className="username">{user?.name || 'Career Aspirant'}</p>
          <p className="user-email">{user?.email || ''}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink 
          to="/upload" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <FileText size={20} />
          <span>Resume Coaching</span>
        </NavLink>
        <NavLink 
          to="/tailor" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Wand2 size={20} />
          <span>Resume Tailoring</span>
        </NavLink>
        <NavLink 
          to="/jobs" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Briefcase size={20} />
          <span>Job Search</span>
        </NavLink>
        <NavLink 
          to="/profile" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <User size={20} />
          <span>Profile</span>
        </NavLink>
        <NavLink 
          to="/quiz" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <ClipboardList size={20} />
          <span>Interview Quiz</span>
        </NavLink>
        <NavLink 
          to="/dashboard/mock-interview" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <MessageSquare size={20} />
          <span>Mock Interview</span>
        </NavLink>
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={20} />
        <span>Log Out</span>
      </button>
    </aside>
  );
}
