import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { LayoutDashboard, FileText, Briefcase, LogOut, User, ClipboardList, MessageSquare, Wand2, Sparkles, Activity, Download, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Sidebar({ user, onLogoutSuccess, isOpen, toggleSidebar }) {
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
    <aside className={`sidebar ${isOpen ? '' : 'closed'}`}>
      <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: isOpen ? 'space-between' : 'center', marginBottom: '40px' }}>
        {isOpen ? (
          <div className="sidebar-logo" style={{ margin: 0 }}>
            <span className="logo-icon">NF</span>
            <span className="logo-text">Neural Forge</span>
          </div>
        ) : (
          <span className="logo-icon" style={{ margin: 0 }}>NF</span>
        )}
        <button className="sidebar-toggle-btn" onClick={toggleSidebar} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: isOpen ? 0 : '24px' }}>
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <div className={`user-profile-badge ${isOpen ? '' : 'closed'}`}>
        <div className="avatar">
          <User size={20} />
        </div>
        {isOpen && (
          <div className="user-info">
            <p className="username">{user?.name || 'Career Aspirant'}</p>
            <p className="user-email">{user?.role === 'admin' ? `[ADMIN] ${user?.email}` : user?.email}</p>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {user?.role === 'admin' ? (
          <>
            {isOpen && (
              <div className="sidebar-divider" style={{ borderTop: '1px solid hsla(0, 0%, 0%, 0.1)', margin: '0 10px 10px 10px', paddingTop: '10px', fontSize: '11px', fontWeight: 700, color: 'hsl(var(--text-muted))', letterSpacing: '0.05em' }}>
                ADMIN PORTAL
              </div>
            )}
            <NavLink 
              to="/" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end
            >
              <LayoutDashboard size={20} />
              <span>Admin Overview</span>
            </NavLink>
            <NavLink 
              to="/admin/users" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <User size={20} />
              <span>User Manager</span>
            </NavLink>
            <NavLink 
              to="/admin/analytics" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Sparkles size={20} />
              <span>AI Analytics</span>
            </NavLink>
            <NavLink 
              to="/admin/health" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Activity size={20} />
              <span>System Health</span>
            </NavLink>
            <NavLink 
              to="/admin/export" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Download size={20} />
              <span>Export Reports</span>
            </NavLink>
            <NavLink 
              to="/profile" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <User size={20} />
              <span>Profile Settings</span>
            </NavLink>
          </>
        ) : (
          <>
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
          </>
        )}
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={20} />
        <span>Log Out</span>
      </button>
    </aside>
  );
}
