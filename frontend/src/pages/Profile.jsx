import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { 
  User, Mail, FileText, Trash2, Upload, AlertCircle, CheckCircle, 
  RefreshCw, Calendar, Edit3, Shield, Key, Laptop, History, X 
} from 'lucide-react';
import '../admin.css';

export default function Profile() {

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [user, setUser] = useState(null);
  
  // Resume Edit states
  const [editingResumeId, setEditingResumeId] = useState(null);
  const [editingResumeName, setEditingResumeName] = useState('');
  const fileInputRef = useRef(null);

  // Profile Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Password Change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sessions and History states
  const [activeSessions, setActiveSessions] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);


  const fetchUserData = async () => {
    try {
      const data = await api.get('/api/auth/get-me');
      if (data.user) {
        setUser(data.user);
        setEditName(data.user.name);
        setEditEmail(data.user.email);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchResumes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/resumeUpload/');
      setResumes(data.resumes || []);
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setError('Could not retrieve resumes from your profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionsAndHistory = async () => {
    try {
      const [sessionsRes, historyRes] = await Promise.all([
        api.get('/api/auth/profile/active-sessions'),
        api.get('/api/auth/profile/login-history')
      ]);
      setActiveSessions(sessionsRes.data || []);
      setLoginHistory(historyRes.data || []);
    } catch (err) {
      console.error('Error fetching sessions/history:', err);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchResumes();
    fetchSessionsAndHistory();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.put('/api/auth/profile', { name: editName, email: editEmail });
      setSuccess("Profile updated successfully.");
      setUser(res.user);
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Profile update failed:', err);
      setError(err.message || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    try {
      await api.put('/api/auth/profile/change-password', { currentPassword, newPassword });
      setSuccess("Password updated successfully.");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password update failed:', err);
      setError(err.message || 'Failed to change password.');
    }
  };

  const handleRevokeSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to force log out this device session?")) return;
    setError('');
    setSuccess('');
    try {
      await api.post('/api/auth/profile/active-sessions/revoke', { sessionId });
      setSuccess("Session revoked successfully.");
      fetchSessionsAndHistory();
    } catch (err) {
      console.error('Session revocation failed:', err);
      setError(err.message || 'Failed to revoke device session.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    uploadResumeFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    uploadResumeFile(file);
  };

  const uploadResumeFile = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      await api.upload('/api/resumeUpload/', formData);
      setSuccess(`"${file.name}" uploaded successfully.`);
      fetchResumes();
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload resume.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (resumeId, filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) return;

    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/resumeUpload/${resumeId}`);
      setSuccess(`"${filename}" deleted successfully.`);
      setResumes(prev => prev.filter(r => r._id !== resumeId));
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err.message || 'Failed to delete resume.');
    }
  };

  const startRename = (resume) => {
    setEditingResumeId(resume._id);
    setEditingResumeName(resume.filename);
  };

  const cancelRename = () => {
    setEditingResumeId(null);
    setEditingResumeName('');
  };

  const saveRename = async (resumeId) => {
    if (!editingResumeName.trim()) {
      setError('Resume name cannot be empty.');
      return;
    }
    setError('');
    setSuccess('');
    try {
      const res = await api.patch(`/api/resumeUpload/rename/${resumeId}`, { newName: editingResumeName });
      setSuccess(res.message || 'Resume renamed successfully.');
      setResumes(prev => prev.map(r => r._id === resumeId ? { ...r, filename: res.filename } : r));
      setEditingResumeId(null);
    } catch (err) {
      console.error('Rename failed:', err);
      setError(err.message || 'Failed to rename resume.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="profile-page animate-fade-in" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1>Account & Profile Settings</h1>
        <p className="subtitle">Manage uploaded resumes, edit details, update credentials, and review logged devices</p>
      </div>

      {error && (
        <div className="auth-error-alert" style={{ marginBottom: '20px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="auth-success-alert" style={{ marginBottom: '20px' }}>
          <CheckCircle size={18} style={{ marginRight: '8px' }} />
          <span>{success}</span>
        </div>
      )}

      <div className="profile-grid">
        {/* Left Hand: Settings Forms */}
        <div className="form-column">
          {/* Account details card */}
          <div className="profile-user-card card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Account Information</h3>
              {!isEditingProfile && (
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="pagination-btn" 
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px' }}
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-muted)' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="search-input-field"
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-text-muted)' }}>Email Address</label>
                  <input 
                    type="email" 
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="search-input-field"
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button type="submit" className="pagination-btn" style={{ backgroundColor: 'var(--admin-primary)', color: 'white', borderColor: 'var(--admin-primary)', padding: '6px 14px' }}>
                    Save Changes
                  </button>
                  <button type="button" onClick={() => { setIsEditingProfile(false); setEditName(user.name); setEditEmail(user.email); }} className="pagination-btn">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="user-details-list">
                <div className="user-detail-row">
                  <User size={18} className="detail-icon" />
                  <div className="detail-info">
                    <span className="detail-lbl">Full Name</span>
                    <span className="detail-val">{user?.name || 'Career Aspirant'}</span>
                  </div>
                </div>
                
                <div className="user-detail-row">
                  <Mail size={18} className="detail-icon" />
                  <div className="detail-info">
                    <span className="detail-lbl">Email Address</span>
                    <span className="detail-val">{user?.email || 'N/A'}</span>
                  </div>
                </div>

                <div className="user-detail-row">
                  <Shield size={18} className="detail-icon" />
                  <div className="detail-info">
                    <span className="detail-lbl">System Role Privilege</span>
                    <span className="detail-val" style={{ textTransform: 'capitalize', fontWeight: 600, color: user?.role === 'admin' ? 'var(--admin-primary)' : 'var(--admin-success)' }}>
                      {user?.role || 'user'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Change Password Card */}
          <div className="card" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Key size={18} style={{ color: 'var(--admin-text-muted)' }} />
              <h3 style={{ margin: 0 }}>Security & Credentials</h3>
            </div>
            
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--admin-text-muted)' }}>Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password..."
                  className="search-input-field"
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--admin-text-muted)' }}>New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters..."
                  className="search-input-field"
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--admin-text-muted)' }}>Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password..."
                  className="search-input-field"
                  required
                />
              </div>

              <button type="submit" className="pagination-btn" style={{ alignSelf: 'flex-start', marginTop: '6px', padding: '6px 14px' }}>
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Right Hand: Saved Resumes */}
        <div className="form-column">
          <div className="card resumes-manager-card">
            <h3>Saved Resumes</h3>
            
            {loading ? (
              <div className="loading-state-box">
                <RefreshCw className="spinner" size={24} />
                <p>Fetching resumes...</p>
              </div>
            ) : resumes.length === 0 ? (
              <p className="no-resumes-msg">You haven't saved any resumes to your profile yet.</p>
            ) : (
              <div className="profile-resumes-list">
                {resumes.map((resume) => (
                  <div key={resume._id} className="profile-resume-row">
                    <div className="resume-row-left">
                      <FileText className="file-icon" size={20} />
                      <div className="resume-meta-info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {editingResumeId === resume._id ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={editingResumeName}
                              onChange={(e) => setEditingResumeName(e.target.value)}
                              autoFocus
                              className="search-input-field"
                              style={{ padding: '2px 6px', fontSize: '13px' }}
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveRename(resume._id);
                                  if (e.key === 'Escape') cancelRename();
                              }}
                            />
                            <button onClick={() => saveRename(resume._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-success)' }}>
                              <CheckCircle size={14} />
                            </button>
                            <button onClick={cancelRename} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)' }}>
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="resume-name-title" style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={resume.filename}>
                              {resume.filename}
                            </span>
                            <button onClick={() => startRename(resume)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-muted)', display: 'inline-flex' }}>
                              <Edit3 size={12} />
                            </button>
                          </div>
                        )}
                        <span className="resume-date-stamp" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', marginTop: '2px' }}>
                          <Calendar size={11} />
                          {formatDate(resume.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      className="delete-resume-btn" 
                      onClick={() => handleDelete(resume._id, resume.filename)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="profile-uploader-section" style={{ marginTop: '20px' }}>
              <span className="section-label">Upload a New Resume</span>
              <div 
                className={`dropzone-card card profile-dropzone ${isDragOver ? 'dragover' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf" 
                  style={{ display: 'none' }}
                />
                
                {uploading ? (
                  <div className="dropzone-prompt">
                    <RefreshCw className="spinner upload-icon-color" size={30} />
                    <h4>Parsing PDF...</h4>
                  </div>
                ) : (
                  <div className="dropzone-prompt">
                    <Upload size={30} className="upload-icon-color" />
                    <h4>Select or Drop PDF</h4>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Grid for Security Auditing (Active Sessions & Login History) */}
      <div className="charts-grid animate-fade-in" style={{ marginTop: '24px' }}>
        {/* Active Sessions Panel */}
        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Laptop size={18} style={{ color: 'var(--admin-text-muted)' }} />
            <h3 style={{ margin: 0 }}>Active Browser Sessions</h3>
          </div>
          
          <div style={{ maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
            {activeSessions.length === 0 ? (
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '13px' }}>No active devices logged.</p>
            ) : (
              activeSessions.map(sess => (
                <div key={sess._id} className="session-card">
                  <div className="session-info-left">
                    <Laptop size={18} className="session-icon" />
                    <div className="session-details">
                      <span className="session-ua" title={sess.userAgent}>
                        {sess.userAgent.split(' ')[0]} on {sess.ipAddress}
                      </span>
                      <span className="session-meta">
                        Login: {new Date(sess.loginAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  {sess.token !== sessionStorage.getItem('token') && (
                    <button 
                      onClick={() => handleRevokeSession(sess._id)}
                      className="btn-revoke-session"
                    >
                      Remote Log Out
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Login History Log list */}
        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <History size={18} style={{ color: 'var(--admin-text-muted)' }} />
            <h3 style={{ margin: 0 }}>Login History Ledger</h3>
          </div>
          
          <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
            {loginHistory.length === 0 ? (
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '13px' }}>No login logs available.</p>
            ) : (
              <div className="table-wrapper">
                <table className="admin-table" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>IP</th>
                      <th>State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginHistory.slice(0, 10).map(hist => (
                      <tr key={hist._id}>
                        <td>{new Date(hist.loginAt).toLocaleString()}</td>
                        <td>{hist.ipAddress}</td>
                        <td>
                          <span className={`badge ${hist.active ? 'badge-success' : 'badge-danger'}`}>
                            {hist.active ? 'active' : 'logged out'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
