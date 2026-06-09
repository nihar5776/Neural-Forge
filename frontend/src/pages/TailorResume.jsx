import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { Upload, FileText, AlertCircle, RefreshCw, CheckCircle, Info, Sparkles, FolderOpen, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TailorResume() {
  const [savedResumes, setSavedResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [resumeSource, setResumeSource] = useState('saved'); // 'saved' or 'upload'
  const [selectedResumeId, setSelectedResumeId] = useState('');

  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch saved resumes list on mount
  useEffect(() => {
    const fetchResumesList = async () => {
      try {
        const data = await api.get('/api/resumeUpload/');
        const list = data.resumes || [];
        setSavedResumes(list);
        if (list.length > 0) {
          setSelectedResumeId(list[0]._id);
          setResumeSource('saved');
        } else {
          setResumeSource('upload');
        }
      } catch (err) {
        console.error("Failed to load saved resumes:", err);
        setResumeSource('upload');
      } finally {
        setResumesLoading(false);
      }
    };
    fetchResumesList();
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
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      setFile(null);
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      setFile(null);
      return;
    }
    setError('');
    setFile(selectedFile);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (resumeSource === 'saved' && !selectedResumeId) {
      setError('Please select a saved resume from the dropdown.');
      return;
    }
    if (resumeSource === 'upload' && !file) {
      setError('Please select or drop a resume PDF file.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      let data;
      if (resumeSource === 'saved') {
        data = await api.post('/api/tailor/', {
          resumeId: selectedResumeId,
          jobDescription
        });
      } else {
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDescription);
        data = await api.upload('/api/tailor/', formData);
      }
      setResult(data.response);
    } catch (err) {
      console.error('Tailoring failed:', err);
      setError(err.message || 'An error occurred during resume tailoring. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setJobDescription('');
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    setResumesLoading(true);
    api.get('/api/resumeUpload/')
      .then(data => {
        const list = data.resumes || [];
        setSavedResumes(list);
        if (list.length > 0) {
          setSelectedResumeId(list[0]._id);
          setResumeSource('saved');
        } else {
          setResumeSource('upload');
        }
      })
      .catch(err => console.error(err))
      .finally(() => setResumesLoading(false));
  };

  const isSubmitDisabled = () => {
    if (!jobDescription) return true;
    if (resumeSource === 'saved' && !selectedResumeId) return true;
    if (resumeSource === 'upload' && !file) return true;
    return false;
  };

  const handlePrint = () => {
    window.print();
  };

  if (result) {
    return (
      <div className="upload-page animate-fade-in">
        <div className="dashboard-header-row no-print">
          <button className="btn-primary" onClick={resetForm}>
            Tailor Another Resume
          </button>
          <h2>Tailored Resume Complete!</h2>
          <button className="btn-secondary" onClick={handlePrint}>
            <Printer size={18} style={{ marginRight: '8px' }} />
            Print to PDF
          </button>
        </div>

        <div className="resume-preview-container" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          
          {/* Left Column: The Tailored Resume */}
          <div className="tailored-resume card" style={{ flex: '1 1 60%', padding: '2rem', background: '#fff', color: '#000', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>{result.personalInfo.name}</h1>
            <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#333' }}>
              {result.personalInfo.email} | {result.personalInfo.phone || ''} | {result.personalInfo.location || ''}
            </p>

            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginTop: '1.5rem' }}>Professional Summary</h3>
            <p style={{ marginTop: '0.5rem' }}>{result.summary}</p>

            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginTop: '1.5rem' }}>Experience</h3>
            {result.experience.map((exp, i) => (
              <div key={i} style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>{exp.title}</span>
                  <span>{exp.duration}</span>
                </div>
                <div style={{ fontStyle: 'italic', marginBottom: '0.5rem' }}>{exp.company}</div>
                <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                  {exp.responsibilities.map((resp, j) => (
                    <li key={j} style={{ marginBottom: '0.25rem' }}>{resp}</li>
                  ))}
                </ul>
              </div>
            ))}

            {result.projects && result.projects.length > 0 && (
              <>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginTop: '1.5rem' }}>Projects</h3>
                {result.projects.map((proj, i) => (
                  <div key={i} style={{ marginTop: '1rem' }}>
                    <div style={{ fontWeight: 'bold' }}>{proj.title}</div>
                    <p style={{ margin: '0.25rem 0' }}>{proj.description}</p>
                    <p style={{ margin: 0, fontSize: '0.9em', color: '#555' }}><strong>Technologies:</strong> {proj.technologies.join(', ')}</p>
                  </div>
                ))}
              </>
            )}

            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginTop: '1.5rem' }}>Education</h3>
            {result.education.map((edu, i) => (
              <div key={i} style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{edu.degree}</div>
                  <div>{edu.institution}</div>
                </div>
                <div style={{ fontStyle: 'italic' }}>{edu.year}</div>
              </div>
            ))}

            <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '0.5rem', marginTop: '1.5rem' }}>Skills</h3>
            <p style={{ marginTop: '0.5rem' }}>{result.skills.join(', ')}</p>
          </div>

          {/* Right Column: ATS Analysis (Hidden in Print) */}
          <div className="ats-analysis card no-print" style={{ flex: '1 1 30%', alignSelf: 'flex-start' }}>
            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>ATS Analysis</h3>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: result.atsAnalysis.matchScore >= 80 ? 'var(--success)' : result.atsAnalysis.matchScore >= 60 ? 'var(--warning)' : 'var(--danger)' }}>
                {result.atsAnalysis.matchScore}%
              </div>
              <p className="text-muted">Match Score</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Matching Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {result.atsAnalysis.matchingSkills.map((skill, i) => (
                  <span key={i} style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>{skill}</span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Missing Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {result.atsAnalysis.missingSkills.map((skill, i) => (
                  <span key={i} style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>{skill}</span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4>Keyword Match Analysis</h4>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{result.atsAnalysis.keywordMatchAnalysis}</p>
            </div>

            <div>
              <h4>Suggestions for Improvement</h4>
              <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {result.atsAnalysis.suggestionsForImprovement.map((sug, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>{sug}</li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .tailored-resume, .tailored-resume * {
              visibility: visible;
            }
            .tailored-resume {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              border: none;
              box-shadow: none;
            }
            .no-print {
              display: none !important;
            }
          }
        `}} />
      </div>
    );
  }

  return (
    <div className="upload-page animate-fade-in">
      <div className="page-header">
        <h1>AI Resume Tailoring</h1>
        <p className="subtitle">Optimize your resume against a specific job description for maximum ATS compatibility.</p>
      </div>

      {error && (
        <div className="auth-error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-card card animate-pulse">
          <div className="loading-content">
            <div className="pulse-sparkle">
              <Sparkles size={36} className="sparkle-icon spinner" />
            </div>
            <h2>Tailoring Your Resume...</h2>
            <div className="loading-steps">
              <div className="step-row active">
                <CheckCircle size={16} />
                <span>Reading original resume</span>
              </div>
              <div className="step-row active">
                <CheckCircle size={16} />
                <span>Analyzing job description keywords</span>
              </div>
              <div className="step-row pending">
                <RefreshCw size={16} className="spinner" />
                <span>Aligning experiences and quantifying impact</span>
              </div>
              <div className="step-row pending text-muted">
                <span>Generating ATS optimization report</span>
              </div>
            </div>
            <p className="loading-hint">This usually takes about 15-20 seconds. Please do not close the page.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="upload-form-grid">
          {/* Resume Selector & Upload Zone */}
          <div className="form-column">
            <div className="form-group">
              <label className="section-label">Resume Selector *</label>
              <span className="input-hint">Select a saved resume from your profile or upload a new file</span>
              
              {resumesLoading ? (
                <div className="loading-dropdown-box">
                  <RefreshCw className="spinner" size={16} />
                  <span>Loading your resumes...</span>
                </div>
              ) : (
                <div className="resume-selector-wrapper">
                  <select
                    className="resume-dropdown-select"
                    value={resumeSource === 'upload' ? 'upload' : selectedResumeId}
                    onChange={(e) => {
                      if (e.target.value === 'upload') {
                        setResumeSource('upload');
                        setSelectedResumeId('');
                      } else {
                        setResumeSource('saved');
                        setSelectedResumeId(e.target.value);
                      }
                    }}
                  >
                    {savedResumes.map(r => (
                      <option key={r._id} value={r._id}>
                        💾 {r.filename}
                      </option>
                    ))}
                    <option value="upload">➕ Upload a new resume...</option>
                  </select>
                </div>
              )}
            </div>

            {resumeSource === 'upload' ? (
              <div className="form-group">
                <label className="section-label">Upload PDF *</label>
                <div 
                  className={`dropzone-card card ${isDragOver ? 'dragover' : ''} ${file ? 'has-file' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={!file ? triggerFileSelect : undefined}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".pdf" 
                    style={{ display: 'none' }}
                  />
                  
                  {file ? (
                    <div className="file-info-container">
                      <FileText size={48} className="file-icon-color" />
                      <div className="file-meta">
                        <p className="file-name">{file.name}</p>
                        <p className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button type="button" className="btn-secondary remove-file-btn" onClick={removeFile}>
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <div className="dropzone-prompt">
                      <Upload size={48} className="upload-icon-color" />
                      <h3>Drag & Drop Resume PDF</h3>
                      <p>or click to browse local files (max 10MB)</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="saved-resume-selected-card card animate-fade-in">
                <FolderOpen size={32} className="folder-icon" />
                <div className="selected-info">
                  <h4>Saved Resume Selected</h4>
                  <p className="text-muted">Using stored resume data from your Profile. No upload required.</p>
                  <Link to="/profile" className="profile-edit-lnk">Manage your Resumes →</Link>
                </div>
              </div>
            )}

            <div className="info-helper-box">
              <Info size={16} />
              <p>Tailoring works best with resumes that contain clear sections (Experience, Education, Skills).</p>
            </div>
          </div>

          {/* Form Context Info */}
          <div className="form-column">
            <div className="form-group">
              <label htmlFor="jobDescription" className="section-label">Target Job Role / Description *</label>
              <span className="input-hint">Paste the complete job description to optimize for keywords and skills</span>
              <textarea
                id="jobDescription"
                rows={10}
                placeholder="Example: We are looking for a Software Engineer with strong experience in React, Node.js, and MongoDB. You will be responsible for building scalable APIs..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary start-analysis-btn" disabled={isSubmitDisabled() || loading}>
              Generate Tailored Resume
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
