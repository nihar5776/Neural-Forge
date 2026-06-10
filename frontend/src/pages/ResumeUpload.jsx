import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import ReportDetails from '../components/ReportDetails';
import { Upload, FileText, AlertCircle, RefreshCw, CheckCircle, Info, Sparkles, FolderOpen, Terminal, Code, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition, AnimatedCard } from '../components/MotionWrappers';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResumeUpload() {
  const [savedResumes, setSavedResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [resumeSource, setResumeSource] = useState('saved'); 
  const [selectedResumeId, setSelectedResumeId] = useState('');

  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [selfDescription, setSelfDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Fake loading sequence for the "Wow Factor"
  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < 4 ? prev + 1 : prev));
      }, 3500); // Progress step every 3.5s
    }
    return () => clearInterval(interval);
  }, [loading]);

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

  const removeFile = (e) => {
    e.stopPropagation();
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
        data = await api.post('/api/interview/', {
          resumeId: selectedResumeId,
          jobDescription,
          selfDescription
        });
      } else {
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDescription);
        formData.append('selfDescription', selfDescription);
        data = await api.upload('/api/interview/', formData);
      }
      setResult(data.response);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.message || 'An error occurred during resume analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setJobDescription('');
    setSelfDescription('');
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

  if (result) {
    return (
      <PageTransition className="upload-page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '28px', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle color="hsl(var(--success))" size={32} />
            Telemetry Complete
          </h2>
          <button className="btn-primary" onClick={resetForm} style={{ padding: '10px 20px', borderRadius: '100px' }}>
            Initialize New Scan
          </button>
        </div>
        <ReportDetails report={result} />
      </PageTransition>
    );
  }

  const steps = [
    { title: "Parsing PDF Document Structure", activeColor: "var(--primary)" },
    { title: "Extracting Semantic Capabilities", activeColor: "var(--primary)" },
    { title: "Executing Vector Matching on JD", activeColor: "var(--warning)" },
    { title: "Generating Strategic Roadmap", activeColor: "var(--success)" },
  ];

  return (
    <PageTransition className="upload-page" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', letterSpacing: '-0.04em', margin: '0 0 16px 0', textShadow: '0 0 40px hsla(var(--primary), 0.3)' }}>
          Profile Injection
        </h1>
        <p className="subtitle" style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto', color: 'hsl(var(--text-muted))' }}>
          Upload your raw career data. Our AI models will instantly compute ATS viability and generate a personalized success trajectory.
        </p>
      </div>

      {error && (
        <div className="auth-error-alert animate-fade-in" style={{ justifyContent: 'center' }}>
          <AlertCircle size={20} />
          <span style={{ fontWeight: '600' }}>{error}</span>
        </div>
      )}

      {loading ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ width: '100%', maxWidth: '700px', margin: '0 auto' }}
        >
          <AnimatedCard style={{ padding: '0', overflow: 'hidden', border: '1px solid hsla(var(--primary), 0.3)', boxShadow: '0 0 60px hsla(var(--primary), 0.15)' }}>
            <div style={{ background: 'hsla(0,0%,0%,0.5)', padding: '16px 24px', borderBottom: '1px solid hsla(0,0%,100%,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Terminal size={20} color="hsl(var(--primary))" />
              <span style={{ fontFamily: 'monospace', fontSize: '14px', letterSpacing: '0.1em', color: 'hsl(var(--text-muted))' }}>NEURAL-FORGE // ANALYSIS THREAD</span>
            </div>
            
            <div style={{ padding: '40px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                <div style={{ position: 'relative' }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    style={{ width: '120px', height: '120px', borderRadius: '50%', border: '2px dashed hsla(var(--primary), 0.5)', position: 'absolute', top: -10, left: -10 }}
                  />
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 20px hsla(var(--primary), 0.3)' }}>
                    <Cpu size={40} color="hsl(var(--primary))" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {steps.map((step, idx) => {
                  const isActive = idx === loadingStep;
                  const isDone = idx < loadingStep;
                  const isPending = idx > loadingStep;

                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
                    >
                      <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isDone ? (
                          <CheckCircle size={20} color={`hsl(${step.activeColor})`} />
                        ) : isActive ? (
                          <RefreshCw size={20} className="spinner" color={`hsl(${step.activeColor})`} />
                        ) : (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--border-color))' }} />
                        )}
                      </div>
                      <span style={{ 
                        fontFamily: 'monospace', 
                        fontSize: '15px', 
                        color: isDone ? `hsl(${step.activeColor})` : isActive ? 'hsl(var(--text-main))' : 'hsl(var(--text-muted))',
                        textShadow: isActive || isDone ? `0 0 10px hsla(${step.activeColor}, 0.5)` : 'none'
                      }}>
                        {step.title}
                        {isActive && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }}>...</motion.span>}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
            <div style={{ background: 'hsla(var(--primary), 0.05)', padding: '16px', textAlign: 'center', borderTop: '1px solid hsla(0,0%,100%,0.05)' }}>
              <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Processing encrypted data. Do not disconnect.</span>
            </div>
          </AnimatedCard>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'start' }}>
          {/* Upload Zone */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'hsl(var(--primary))' }}>Data Source</label>
              <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', margin: 0 }}>Inject a local PDF or link a pre-stored profile.</p>
            </div>

            {resumesLoading ? (
              <AnimatedCard style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <RefreshCw className="spinner" size={20} color="hsl(var(--primary))" />
                <span style={{ color: 'hsl(var(--text-muted))' }}>Querying databanks...</span>
              </AnimatedCard>
            ) : (
              <div style={{ display: 'flex', gap: '12px', background: 'hsla(0,0%,100%,0.03)', padding: '6px', borderRadius: '12px', border: '1px solid hsla(0,0%,100%,0.05)' }}>
                <button
                  type="button"
                  style={{
                    flex: 1, padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                    background: resumeSource === 'upload' ? 'hsla(var(--primary), 0.2)' : 'transparent',
                    color: resumeSource === 'upload' ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
                    border: '1px solid',
                    borderColor: resumeSource === 'upload' ? 'hsla(var(--primary), 0.5)' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setResumeSource('upload')}
                >
                  <Upload size={16} style={{ marginRight: '8px' }} /> Local PDF
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1, padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
                    background: resumeSource === 'saved' ? 'hsla(var(--primary), 0.2)' : 'transparent',
                    color: resumeSource === 'saved' ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
                    border: '1px solid',
                    borderColor: resumeSource === 'saved' ? 'hsla(var(--primary), 0.5)' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setResumeSource('saved')}
                  disabled={savedResumes.length === 0}
                >
                  <FolderOpen size={16} style={{ marginRight: '8px' }} /> Databank
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {resumeSource === 'upload' ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div 
                    style={{
                      height: '320px',
                      borderRadius: 'var(--radius-lg)',
                      border: `2px dashed ${isDragOver ? 'hsl(var(--primary))' : file ? 'hsl(var(--success))' : 'hsla(0,0%,100%,0.1)'}`,
                      background: isDragOver ? 'hsla(var(--primary), 0.05)' : file ? 'hsla(var(--success), 0.05)' : 'hsla(0,0%,100%,0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
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
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 10 }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'hsla(var(--success), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid hsla(var(--success), 0.3)' }}>
                          <CheckCircle size={40} color="hsl(var(--success))" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <h3 style={{ margin: '0 0 8px 0', color: 'hsl(var(--success))' }}>Payload Loaded</h3>
                          <p style={{ margin: 0, color: 'hsl(var(--text-main))', fontWeight: '600' }}>{file.name}</p>
                          <p style={{ margin: '4px 0 0 0', color: 'hsl(var(--text-muted))', fontSize: '13px' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button type="button" onClick={removeFile} style={{ marginTop: '16px', padding: '8px 16px', background: 'hsla(var(--danger), 0.1)', color: 'hsl(var(--danger))', border: '1px solid hsla(var(--danger), 0.3)', borderRadius: '100px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
                          Eject Payload
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', zIndex: 10 }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid hsla(var(--primary), 0.3)' }}>
                          <Upload size={40} color="hsl(var(--primary))" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Initiate Drop Sequence</h3>
                          <p style={{ margin: 0, color: 'hsl(var(--text-muted))' }}>Drag & drop your PDF file here</p>
                          <p style={{ margin: '4px 0 0 0', color: 'hsla(0,0%,100%,0.3)', fontSize: '13px' }}>Maximum capacity: 10MB</p>
                        </div>
                      </div>
                    )}

                    {/* Background glow effects */}
                    {isDragOver && (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at center, hsla(var(--primary), 0.2) 0%, transparent 70%)', zIndex: 0 }}
                      />
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <AnimatedCard style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid hsla(var(--primary), 0.3)' }}>
                        <FolderOpen size={28} color="hsl(var(--primary))" />
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Select Target Profile</h3>
                        <p style={{ margin: 0, color: 'hsl(var(--text-muted))', fontSize: '14px' }}>Querying from stored databanks</p>
                      </div>
                    </div>
                    
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      style={{
                        width: '100%', padding: '16px', borderRadius: '12px',
                        background: 'hsla(0,0%,100%,0.03)', border: '1px solid hsla(0,0%,100%,0.1)',
                        color: 'hsl(var(--text-main))', fontSize: '15px', outline: 'none', cursor: 'pointer'
                      }}
                    >
                      {savedResumes.map(r => (
                        <option key={r._id} value={r._id} style={{ background: 'hsl(var(--bg-app))', color: 'hsl(var(--text-main))' }}>
                          [{r.filename}] - Uploaded {new Date(r.uploadedAt).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </AnimatedCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Form Context Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '16px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'hsl(var(--primary))' }}>Target Matrix</label>
              <p style={{ fontSize: '14px', color: 'hsl(var(--text-muted))', margin: 0 }}>Define the job description and custom parameters.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'hsla(0,0%,100%,0.02)', border: '1px solid hsla(0,0%,100%,0.05)', borderRadius: '12px', padding: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--text-main))' }}>Job Description (Required)</label>
                <textarea
                  rows={6}
                  placeholder="Inject raw job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  required
                  style={{
                    width: '100%', background: 'transparent', border: 'none', outline: 'none',
                    color: 'hsl(var(--text-main))', fontSize: '14px', resize: 'none', lineHeight: '1.6'
                  }}
                />
              </div>

              <div style={{ background: 'hsla(0,0%,100%,0.02)', border: '1px solid hsla(0,0%,100%,0.05)', borderRadius: '12px', padding: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--text-main))' }}>Custom Vector Tuning (Optional)</label>
                <textarea
                  rows={4}
                  placeholder="Inject specific achievements or instructions to prioritize..."
                  value={selfDescription}
                  onChange={(e) => setSelfDescription(e.target.value)}
                  style={{
                    width: '100%', background: 'transparent', border: 'none', outline: 'none',
                    color: 'hsl(var(--text-main))', fontSize: '14px', resize: 'none', lineHeight: '1.6'
                  }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isSubmitDisabled() || loading}
              style={{
                width: '100%', padding: '20px', fontSize: '16px', fontWeight: '800', textTransform: 'uppercase',
                letterSpacing: '0.1em', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                marginTop: '16px'
              }}
            >
              <Code size={20} />
              Execute Deep Analysis
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'hsl(var(--text-muted))', fontSize: '12px' }}>
              <Info size={14} />
              <span>AES-256 encrypted transit. Data securely discarded after session.</span>
            </div>
          </div>
        </form>
      )}
    </PageTransition>
  );
}
