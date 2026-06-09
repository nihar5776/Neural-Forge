import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { Upload, FileText, AlertCircle, RefreshCw, CheckCircle, Info, Sparkles, FolderOpen, Printer, Download, Edit3, Save, LayoutTemplate, Briefcase, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import TemplateRenderer from '../components/templates/TemplateRenderer';
import ResumeEditor from '../components/ResumeEditor';
import { exportToDocx } from '../utils/docxExport';

export default function TailorResume() {
  const [savedResumes, setSavedResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [resumeSource, setResumeSource] = useState('saved'); // 'saved' or 'upload'
  const [selectedResumeId, setSelectedResumeId] = useState('');

  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [resumeName, setResumeName] = useState('');
  
  const [isDragOver, setIsDragOver] = useState(false);
  
  const templates = [
    { id: 'modern', name: 'Modern Professional', desc: 'Clean layout, ideal for tech roles' },
    { id: 'corporate', name: 'Corporate', desc: 'Traditional business style, ATS-friendly' },
    { id: 'minimal', name: 'Minimal', desc: 'Simple black-and-white, max spacing' },
    { id: 'creative', name: 'Creative', desc: 'Modern visual design, highlight sections' },
    { id: 'student', name: 'Student / Fresher', desc: 'Prioritizes education and projects' }
  ];
  const fileInputRef = useRef(null);

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

  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < 4 ? prev + 1 : prev));
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const loadingMessages = [
    "Analyzing Base Resume...",
    "Extracting Job Description Keywords...",
    "Aligning Experience and Skills...",
    "Optimizing for ATS Formatting...",
    "Rendering Final Output..."
  ];

  const extractJobTitle = (jd) => {
    if (!jd) return 'Tailored_Resume';
    const match = jd.match(/(?:job title|role|position)[\s:]*([a-zA-Z0-9\s-]+)/i);
    let titleStr = '';
    if (match && match[1]) {
      titleStr = match[1].trim();
    } else {
      titleStr = jd.split('\n')[0].trim().split(/\s+/).slice(0, 4).join(' ');
    }
    return (titleStr.replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '_') + '_Resume').replace(/^_+|_+$/g, '');
  };

  // Drag and drop handlers...
  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => { setIsDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e) => validateAndSetFile(e.target.files[0]);
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
  const triggerFileSelect = () => fileInputRef.current.click();
  const removeFile = () => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (resumeSource === 'saved' && !selectedResumeId) return setError('Please select a saved resume.');
    if (resumeSource === 'upload' && !file) return setError('Please upload a resume PDF file.');

    setLoading(true);
    setError('');
    setResult(null);

    try {
      let data;
      if (resumeSource === 'saved') {
        data = await api.post('/api/tailor/', { resumeId: selectedResumeId, jobDescription });
      } else {
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDescription);
        data = await api.upload('/api/tailor/', formData);
      }
      setResult(data.response);
      setResumeName(extractJobTitle(jobDescription));
    } catch (err) {
      setError(err.message || 'An error occurred during resume tailoring.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setJobDescription('');
    setResult(null);
    setError('');
    setIsEditing(false);
    setResumeName('');
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
      .catch(console.error)
      .finally(() => setResumesLoading(false));
  };

  const isSubmitDisabled = () => (!jobDescription || (resumeSource === 'saved' && !selectedResumeId) || (resumeSource === 'upload' && !file));
  
  const handlePrint = () => {
    const originalTitle = document.title;
    if (resumeName) document.title = resumeName;
    window.print();
    document.title = originalTitle;
  };
  const handleDocxDownload = () => exportToDocx(result, selectedTemplate, resumeName);
  
  const handleSaveToProfile = async () => {
    if (!resumeName.trim()) {
      setError('Resume Name cannot be empty.');
      return;
    }
    setIsSaving(true);
    setSaveSuccess('');
    setError('');
    try {
      await api.post('/api/tailor/save', { editedData: result, resumeName });
      setSaveSuccess('Saved successfully!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save resume. ' + (err.message || ''));
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------
  // RENDER: Post-Generation (Workspace Layout)
  // -------------------------------------------------------------
  if (result) {
    return (
      <div className="animate-fade-in" style={{ padding: '0 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
           <span style={{ color: 'hsl(var(--text-muted))', cursor: 'pointer', fontWeight: '500' }} onClick={resetForm}>Tailoring</span>
           <ChevronRight size={16} color="hsl(var(--text-muted))" />
           <span style={{ fontWeight: '600' }}>Workspace</span>
        </div>

        <div className="workspace-layout">
          
          {/* Left Sidebar */}
          {!isEditing && (
            <div className="workspace-sidebar no-print">
              
              {/* Actions Card */}
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Edit3 size={18} color="hsl(var(--primary))"/> Workspace Actions
                </h3>
                <button className="btn-primary" onClick={() => setIsEditing(true)} style={{ width: '100%' }}>
                  Edit Resume Content
                </button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <button className="btn-secondary" onClick={handleSaveToProfile} disabled={isSaving}>
                    <Save size={16} /> {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button className="btn-secondary" onClick={resetForm}>
                    <RefreshCw size={16} /> Start Over
                  </button>
                </div>
                {saveSuccess && <div style={{ color: 'hsl(var(--success))', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' }}>{saveSuccess}</div>}
                {error && <div style={{ color: 'hsl(var(--danger))', fontSize: '13px', textAlign: 'center' }}>{error}</div>}
              </div>

              {/* Export Card */}
              <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Download size={18} color="hsl(var(--primary))"/> Export Options
                </h3>
                <button className="btn-secondary" onClick={handleDocxDownload} style={{ width: '100%', justifyContent: 'flex-start' }}>
                  <FileText size={16} style={{ color: 'hsl(var(--primary))' }} /> Download as DOCX
                </button>
                <button className="btn-secondary" onClick={handlePrint} style={{ width: '100%', justifyContent: 'flex-start' }}>
                  <Printer size={16} style={{ color: 'hsl(var(--primary))' }} /> Print / Save as PDF
                </button>
              </div>

              {/* Templates Card */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <LayoutTemplate size={18} color="hsl(var(--primary))"/> Change Template
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {templates.map(tpl => (
                    <div 
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: selectedTemplate === tpl.id ? '2px solid hsl(var(--primary))' : '1px solid hsl(var(--border-color))',
                        background: selectedTemplate === tpl.id ? 'hsl(var(--primary-light))' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontWeight: selectedTemplate === tpl.id ? '600' : '500', color: selectedTemplate === tpl.id ? 'hsl(var(--primary))' : 'inherit' }}>{tpl.name}</span>
                      {selectedTemplate === tpl.id && <CheckCircle size={16} color="hsl(var(--primary))" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* ATS Dashboard Card */}
              <div className="card" style={{ padding: '1.5rem' }}>
                 <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Sparkles size={18} color="hsl(var(--primary))"/> ATS Dashboard
                 </h3>
                 
                 <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
                    <svg viewBox="0 0 36 36" className={`circular-chart ${result.atsAnalysis.matchScore >= 80 ? 'success' : result.atsAnalysis.matchScore >= 60 ? 'warning' : 'danger'}`}>
                      <path className="circle-bg"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path className="circle"
                        strokeDasharray={`${result.atsAnalysis.matchScore}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <text x="18" y="20.35" className="percentage">{result.atsAnalysis.matchScore}%</text>
                    </svg>
                    <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', marginTop: '0.5rem', fontWeight: '500' }}>Match Score</div>
                 </div>

                 <div style={{ marginBottom: '1.5rem' }}>
                   <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'hsl(var(--text-muted))', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Matched Skills</h4>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                     {result.atsAnalysis.matchingSkills.map((skill, i) => <span key={i} className="chip success">{skill}</span>)}
                   </div>
                 </div>

                 <div style={{ marginBottom: '1.5rem' }}>
                   <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'hsl(var(--text-muted))', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Missing Skills</h4>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                     {result.atsAnalysis.missingSkills.map((skill, i) => <span key={i} className="chip danger">{skill}</span>)}
                   </div>
                 </div>
                 
                 <details style={{ background: 'hsl(var(--bg-app))', padding: '1rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))' }}>
                   <summary style={{ fontWeight: '600', cursor: 'pointer', color: 'hsl(var(--primary))', fontSize: '14px' }}>View Suggestions</summary>
                   <ul style={{ marginTop: '1rem', paddingLeft: '1.2rem', fontSize: '13px', color: 'hsl(var(--text-main))', lineHeight: '1.6' }}>
                     {result.atsAnalysis.suggestionsForImprovement.map((sug, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{sug}</li>)}
                   </ul>
                 </details>
              </div>

            </div>
          )}

          {/* Right Canvas */}
          <div className="workspace-canvas" style={{ display: 'block', overflowX: 'auto', padding: '2rem' }}>
            {/* Resume Name Editor */}
            <div className="no-print" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'hsl(var(--bg-card))', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))', maxWidth: isEditing ? '100%' : '210mm', margin: isEditing ? '0 0 1.5rem 0' : '0 auto 1.5rem auto' }}>
              <FileText size={20} color="hsl(var(--primary))" />
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'hsl(var(--text-muted))', fontWeight: 'bold', letterSpacing: '0.05em' }}>Resume Name</label>
                <input 
                  type="text" 
                  value={resumeName} 
                  onChange={(e) => setResumeName(e.target.value.replace(/[^a-zA-Z0-9_ -\.]/g, ''))}
                  style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '16px', fontWeight: '600', color: 'hsl(var(--text-main))', outline: 'none', padding: '2px 0' }}
                  placeholder="e.g. Software_Engineer_Resume"
                  required
                />
              </div>
              <Edit3 size={16} color="hsl(var(--text-muted))" />
            </div>

            {isEditing ? (
              <div style={{ display: 'flex', gap: '2rem', width: '100%', alignItems: 'flex-start' }}>
                <div style={{ flex: '0 0 500px', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="no-print">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'hsl(var(--bg-card))', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', border: '1px solid hsl(var(--border-color))' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Edit3 size={20} color="hsl(var(--primary))"/> Editing Resume
                    </h3>
                    <button className="btn-secondary" onClick={() => setIsEditing(false)} style={{ padding: '8px 16px', fontSize: '13px' }}>
                      Close Editor
                    </button>
                  </div>
                  <ResumeEditor data={result} onChange={setResult} />
                </div>
                {/* Live Preview scaled down to fit next to editor smoothly */}
                <div style={{ flex: '1', overflowX: 'auto', paddingBottom: '2rem' }}>
                  <div className="tailored-resume live-preview" style={{ width: '210mm', minWidth: '210mm', minHeight: '297mm', boxShadow: 'var(--shadow-lg)', background: '#fff', margin: '0 auto', zoom: 0.85 }}>
                    <TemplateRenderer templateId={selectedTemplate} data={result} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="tailored-resume" style={{ width: '210mm', minWidth: '210mm', minHeight: '297mm', boxShadow: 'var(--shadow-lg)', background: '#fff', margin: '0 auto' }}>
                <TemplateRenderer templateId={selectedTemplate} data={result} />
              </div>
            )}
          </div>
          
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * { visibility: hidden; }
            .tailored-resume, .tailored-resume * { visibility: visible; }
            .tailored-resume { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; zoom: 1 !important; }
            .no-print { display: none !important; }
          }
        `}} />
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Pre-Generation (Multi-Step Form)
  // -------------------------------------------------------------
  return (
    <div className="upload-page animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '36px' }}>AI Resume Tailoring</h1>
        <p className="subtitle">Optimize your resume against a specific job description to maximize ATS compatibility.</p>
      </div>

      {error && (
        <div className="auth-error-alert animate-fade-in">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="step-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem' }}>
          <div className="loading-sequence">
            <div className="pulse-sparkle" style={{ transform: 'scale(1.5)' }}>
              <Sparkles size={48} className="sparkle-icon spinner" color="hsl(var(--primary))" />
            </div>
            <h2 style={{ marginTop: '1rem', fontSize: '24px' }}>Tailoring Your Resume</h2>
            <p className="loading-text">{loadingMessages[loadingStep]}</p>
            <div style={{ width: '100%', maxWidth: '400px', height: '8px', background: 'hsl(var(--border-color))', borderRadius: '10px', overflow: 'hidden', marginTop: '1rem' }}>
              <div style={{ width: `${(loadingStep + 1) * 20}%`, height: '100%', background: 'hsl(var(--primary))', transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          
          {/* Step 1 */}
          <div className="step-card animate-fade-in">
            <div className="step-header">
              <div className="step-number">1</div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px' }}>Select Base Resume</h3>
                <p style={{ color: 'hsl(var(--text-muted))', fontSize: '14px', margin: '4px 0 0 0' }}>Choose a saved resume from your profile or upload a new PDF.</p>
              </div>
            </div>
            
            <div style={{ padding: '0 0.5rem' }}>
              {resumesLoading ? (
                <div className="loading-dropdown-box" style={{ padding: '1rem', background: 'hsl(var(--bg-app))', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', color: 'hsl(var(--text-muted))' }}>
                  <RefreshCw className="spinner" size={16} /> Loading your resumes...
                </div>
              ) : (
                <div className="resume-selector-wrapper" style={{ marginBottom: '1.5rem' }}>
                  <select
                    className="resume-dropdown-select"
                    style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))', fontSize: '15px', background: 'hsl(var(--bg-card))', cursor: 'pointer' }}
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
                      <option key={r._id} value={r._id}>💾 {r.filename}</option>
                    ))}
                    <option value="upload">➕ Upload a new resume...</option>
                  </select>
                </div>
              )}

              {resumeSource === 'upload' ? (
                <div 
                  className={`dropzone-card card ${isDragOver ? 'dragover' : ''} ${file ? 'has-file' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={!file ? triggerFileSelect : undefined}
                  style={{ borderStyle: 'dashed', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', borderColor: isDragOver ? 'hsl(var(--primary))' : 'hsl(var(--border-color))', background: isDragOver ? 'hsl(var(--primary-light))' : 'hsl(var(--bg-app))' }}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" style={{ display: 'none' }} />
                  {file ? (
                    <div className="file-info-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <FileText size={48} color="hsl(var(--primary))" />
                      <div className="file-meta">
                        <p style={{ fontWeight: '600', fontSize: '16px' }}>{file.name}</p>
                        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '13px' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button type="button" className="btn-secondary" onClick={(e) => { e.stopPropagation(); removeFile(); }} style={{ marginTop: '0.5rem' }}>
                        Remove File
                      </button>
                    </div>
                  ) : (
                    <div className="dropzone-prompt" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
                      <Upload size={48} color="hsl(var(--text-muted))" />
                      <div>
                        <h4 style={{ fontSize: '16px', marginBottom: '0.25rem' }}>Drag & Drop Resume PDF</h4>
                        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '14px' }}>or click to browse local files (max 10MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="saved-resume-selected-card card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'hsl(var(--bg-app))', border: '1px solid hsl(var(--border-color))' }}>
                  <FolderOpen size={32} color="hsl(var(--primary))" />
                  <div className="selected-info">
                    <h4 style={{ fontSize: '15px' }}>Saved Resume Selected</h4>
                    <p style={{ color: 'hsl(var(--text-muted))', fontSize: '13px' }}>Using stored resume data from your Profile. No upload required.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2 */}
          <div className="step-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="step-header">
              <div className="step-number">2</div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px' }}>Target Job Description</h3>
                <p style={{ color: 'hsl(var(--text-muted))', fontSize: '14px', margin: '4px 0 0 0' }}>Paste the full job description to optimize for keywords.</p>
              </div>
            </div>
            <div style={{ padding: '0 0.5rem' }}>
              <textarea
                rows={8}
                placeholder="Example: We are looking for a Software Engineer with strong experience in React, Node.js, and MongoDB..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))', fontSize: '15px', fontFamily: 'inherit', lineHeight: '1.5', resize: 'vertical' }}
                required
              />
              <div style={{ textAlign: 'right', fontSize: '12px', color: 'hsl(var(--text-muted))', marginTop: '0.5rem' }}>
                {jobDescription.length} characters
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="step-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="step-header">
              <div className="step-number">3</div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px' }}>Select Visual Template</h3>
                <p style={{ color: 'hsl(var(--text-muted))', fontSize: '14px', margin: '4px 0 0 0' }}>Choose how your tailored resume will be formatted.</p>
              </div>
            </div>
            <div className="template-grid" style={{ padding: '0 0.5rem' }}>
              {templates.map(tpl => (
                <div 
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`template-card ${selectedTemplate === tpl.id ? 'selected' : ''}`}
                >
                  <LayoutTemplate size={32} className="template-icon" />
                  <h4 style={{ fontSize: '15px', marginBottom: '0.5rem', color: selectedTemplate === tpl.id ? 'hsl(var(--primary))' : 'inherit' }}>{tpl.name}</h4>
                  <p style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', margin: 0 }}>{tpl.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div style={{ textAlign: 'center', marginTop: '3rem' }} className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
             <button type="submit" className="btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '30px', boxShadow: 'var(--shadow-md)' }} disabled={isSubmitDisabled() || loading}>
               <Sparkles size={20} /> Generate Tailored Resume
             </button>
          </div>
        </form>
      )}
    </div>
  );
}
