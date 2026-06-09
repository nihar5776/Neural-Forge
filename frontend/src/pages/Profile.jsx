import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { User, Mail, FileText, Trash2, Upload, AlertCircle, CheckCircle, RefreshCw, Calendar, Edit3 } from 'lucide-react';

export default function Profile() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [user, setUser] = useState(null);
  const [editingResumeId, setEditingResumeId] = useState(null);
  const [editingResumeName, setEditingResumeName] = useState('');
  const fileInputRef = useRef(null);

  const fetchUserData = async () => {
    try {
      const data = await api.get('/api/auth/get-me');
      if (data.user) {
        setUser(data.user);
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

  useEffect(() => {
    fetchUserData();
    fetchResumes();
  }, []);

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
      setSuccess(`"${file.name}" uploaded successfully to your profile.`);
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
      // Optimistic state update
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
    <div className="profile-page animate-fade-in">
      <div className="page-header">
        <h1>Your Profile & Resumes</h1>
        <p className="subtitle">Manage your uploaded resumes and account details</p>
      </div>

      {error && (
        <div className="auth-error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="auth-success-alert">
          <CheckCircle size={18} style={{ marginRight: '8px', verticalAlign: 'middle', display: 'inline' }} />
          <span>{success}</span>
        </div>
      )}

      <div className="profile-grid">
        {/* User details card */}
        <div className="form-column">
          <div className="profile-user-card card">
            <h3>Account Settings</h3>
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
            </div>
          </div>

          <div className="info-helper-box">
            <CheckCircle size={16} />
            <p>Uploaded resumes are parsed and stored in your profile, allowing you to quickly select them during coaching sessions.</p>
          </div>
        </div>

        {/* Resumes List & Uploader */}
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
                  <div key={resume._id} className="profile-resume-row stagger-item">
                    <div className="resume-row-left">
                      <FileText className="file-icon" size={20} />
                      <div className="resume-meta-info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {editingResumeId === resume._id ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={editingResumeName}
                              onChange={(e) => setEditingResumeName(e.target.value.replace(/[^a-zA-Z0-9_ -\.]/g, ''))}
                              autoFocus
                              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid hsl(var(--primary))', fontSize: '14px', width: '200px' }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveRename(resume._id);
                                if (e.key === 'Escape') cancelRename();
                              }}
                            />
                            <button onClick={() => saveRename(resume._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--success))' }} title="Save">
                              <CheckCircle size={16} />
                            </button>
                            <button onClick={cancelRename} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))' }} title="Cancel">
                              <AlertCircle size={16} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="resume-name-title" title={resume.filename}>
                              {resume.filename}
                            </span>
                            <button onClick={() => startRename(resume)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-muted))', padding: '0' }} title="Rename">
                              <Edit3 size={14} />
                            </button>
                          </div>
                        )}
                        <span className="resume-date-stamp">
                          <Calendar size={12} />
                          {formatDate(resume.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      className="delete-resume-btn" 
                      onClick={() => handleDelete(resume._id, resume.filename)}
                      title="Delete Resume"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="profile-uploader-section">
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
                    <RefreshCw className="spinner upload-icon-color" size={36} />
                    <h3>Uploading and Parsing PDF...</h3>
                  </div>
                ) : (
                  <div className="dropzone-prompt">
                    <Upload size={36} className="upload-icon-color" />
                    <h4>Select or Drop PDF Resume</h4>
                    <p>Adds PDF safely to your profile</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
