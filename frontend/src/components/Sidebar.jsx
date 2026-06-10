import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { LayoutDashboard, FileText, Briefcase, LogOut, User, ClipboardList, MessageSquare, Wand2, Sparkles, Activity, Download, Trophy } from 'lucide-react';

export default function Sidebar({ 
  user, 
  onLogoutSuccess, 
  xp = 0, 
  level = 1, 
  xpNeeded = 100, 
  classNameTitle = 'Resume Novice',
  onToggleCollapse
}) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      onLogoutSuccess();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      // Even if API logout fails client session is cleared
      onLogoutSuccess();
      navigate('/login');
    }
  };

  return (
    <aside className="sidebar" style={{
      backgroundColor: '#fffcf0', // Soft creamy retro yellow/white
      borderRight: '3px solid #000000',
    }}>
      {/* Gamified Logo */}
      <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="logo-icon" style={{ 
            background: '#e52521', 
            color: '#ffffff',
            border: '3px solid #000000',
            boxShadow: '2px 2px 0px #000000',
            borderRadius: '0px',
            fontSize: '20px',
            fontWeight: '900',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            fontFamily: 'monospace'
          }}>
            N
          </span>
          <span className="logo-text" style={{ 
            color: '#e52521', 
            fontWeight: 'bold',
            fontFamily: 'var(--font-heading)',
            textShadow: '1.5px 1.5px 0px #000000',
            WebkitTextStroke: '0.5px #000000',
            fontSize: '18px',
            letterSpacing: '0.5px'
          }}>
            NEURAL FORGE
          </span>
        </div>

        {/* Toggle Close Button */}
        <button 
          onClick={onToggleCollapse}
          title="Close Sidebar"
          style={{
            background: '#ffffff',
            border: '3px solid #000000',
            color: '#000000',
            width: '30px',
            height: '30px',
            fontSize: '14px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '2px 2px 0px #000000',
            borderRadius: '0px',
            padding: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e52521';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.color = '#000000';
          }}
        >
          ◀
        </button>
      </div>

      {/* Gamified Hero XP Status panel - Super Mario HUD */}
      <div className="rpg-status-panel" style={{
        padding: '14px',
        background: '#fff7d6', // Soft question block yellow
        border: '3px solid #000000',
        borderRadius: '0px', // NES theme sharp corners
        marginBottom: '24px',
        fontFamily: 'monospace',
        fontSize: '13px',
        boxShadow: '3px 3px 0px #000000',
        color: '#000000'
      }}>
        {/* PLAYER info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: 'bold' }}>PLAYER:</span>
          <span style={{ fontWeight: 'bold', color: '#e52521' }}>{user?.name?.toUpperCase() || 'MARIO'}</span>
        </div>
        {/* CLASS info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: 'bold' }}>CLASS:</span>
          <span style={{ fontWeight: 'bold', color: '#43b047' }}>{classNameTitle.toUpperCase()}</span>
        </div>
        {/* COIN info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>COINS:</span>
          <span style={{ fontWeight: 'bold', color: '#fbd000', display: 'flex', alignItems: 'center', gap: '4px', WebkitTextStroke: '0.5px #000000' }}>
            🪙 x {xp}
          </span>
        </div>
        {/* Timer Bar label */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px' }}>
          <span>EXP TIMER</span>
          <span>{Math.round((xp / xpNeeded) * 100)}%</span>
        </div>
        {/* Timer Bar */}
        <div style={{
          width: '100%',
          height: '18px',
          background: '#ffffff',
          border: '3px solid #000000',
          padding: '1px',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(xp / xpNeeded) * 100}%`,
            height: '100%',
            background: '#e52521', // Mario Red
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}></div>
        </div>
        <div style={{ marginTop: '6px', fontSize: '10px', textAlign: 'center', color: '#555' }}>
          XP: {xp} / {xpNeeded} (LVL {level})
        </div>
      </div>

      {/* Hero Badge Profile */}
      <div className="user-profile-badge" style={{ 
        border: '3px solid #000000',
        borderRadius: '0px',
        backgroundColor: '#ffffff',
        boxShadow: '2px 2px 0px #000000',
        marginBottom: '20px'
      }}>
        <div className="avatar" style={{ 
          background: '#e52521', 
          color: '#ffffff',
          border: '2px solid #000000',
          borderRadius: '0px',
          width: '36px',
          height: '36px'
        }}>
          <User size={20} />
        </div>
        <div className="user-info">
          <p className="username" style={{ color: '#000000', fontWeight: 'bold' }}>{user?.name || 'MARIO'}</p>
          <p className="user-email" style={{ color: '#333333', fontSize: '11px', fontFamily: 'monospace' }}>
            {user?.role === 'admin' ? `[ADMIN] ${user?.email}` : user?.email}
          </p>
        </div>
      </div>

      {/* Gamified RPG Navigation */}
      <nav className="sidebar-nav">
        {user?.role === 'admin' ? (
          <>
            <div className="sidebar-divider" style={{ borderTop: '3px solid #000000', margin: '0 10px 10px 10px', paddingTop: '10px', fontSize: '11px', fontWeight: 700, color: '#e52521', letterSpacing: '0.05em' }}>
              ADMIN PORTAL
            </div>
            <NavLink 
              to="/" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end
            >
              <LayoutDashboard size={20} />
              <span>Overview</span>
            </NavLink>
            <NavLink 
              to="/admin/users" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <User size={20} />
              <span>Users</span>
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
              <span>Health</span>
            </NavLink>
            <NavLink 
              to="/admin/export" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Download size={20} />
              <span>Export</span>
            </NavLink>
            <NavLink 
              to="/profile" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <User size={20} />
              <span>Profile</span>
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
              <span>Resume Coach</span>
            </NavLink>
            <NavLink 
              to="/tailor" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Wand2 size={20} />
              <span>Resume Tailor</span>
            </NavLink>
            <NavLink 
              to="/jobs" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Briefcase size={20} />
              <span>Jobs</span>
            </NavLink>
            <NavLink 
              to="/profile" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Trophy size={20} />
              <span>Profile</span>
            </NavLink>
            <NavLink 
              to="/quiz" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <ClipboardList size={20} />
              <span>Quiz</span>
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

      <button 
        className="logout-btn" 
        onClick={handleLogout} 
        style={{ 
          border: '3px solid #000000', 
          borderRadius: '0px',
          background: '#ffffff',
          color: '#e52521',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          fontFamily: 'monospace',
          boxShadow: '2px 2px 0px #000000',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#e52521';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#ffffff';
          e.currentTarget.style.color = '#e52521';
        }}
      >
        <LogOut size={20} />
        <span>Log Out</span>
      </button>
    </aside>
  );
}
