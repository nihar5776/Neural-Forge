import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { Upload, FileText, AlertCircle, RefreshCw, CheckCircle, Sparkles, FolderOpen, Printer, Download, Edit3, Save, LayoutTemplate, Briefcase, ChevronRight, CheckSquare, Zap, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import TemplateRenderer from '../components/templates/TemplateRenderer';
import ResumeEditor from '../components/ResumeEditor';
import { exportToDocx } from '../utils/docxExport';
import { PageTransition, AnimatedCard } from '../components/MotionWrappers';
import { motion, AnimatePresence } from 'framer-motion';

export default function TailorResume() {
  const [savedResumes, setSavedResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [resumeSource, setResumeSource] = useState('saved');
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
  const previewContainerRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);
  
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

  useEffect(() => {
    if (!previewContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const padding = 48; // 24px padding * 2
        const availableWidth = entry.contentRect.width - padding;
        const availableHeight = entry.contentRect.height - padding;
        const widthScale = availableWidth / 794; // A4 width
        const heightScale = availableHeight / 1123; // A4 height
        // Scale to fit the container precisely
        setPreviewScale(Math.min(widthScale, heightScale, 1));
      }
    });
    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, [isEditing, result]);

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
  const removeFile = (e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

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
      setSaveSuccess('Profile payload saved to databanks successfully.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save resume. ' + (err.message || ''));
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------
  // RENDER: Workspace UI
  // -------------------------------------------------------------
  if (result) {
    return (
      <PageTransition style={{ padding: '0 2rem', height: 'calc(100vh - 80px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }} className="no-print">
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <button className="btn-secondary" onClick={resetForm} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid hsla(0,0%,100%,0.1)' }}>
               ← IDE Exit
             </button>
             <ChevronRight size={16} color="hsl(var(--text-muted))" />
             <span style={{ fontWeight: '600', color: 'hsl(var(--primary))' }}>Tailoring Workspace</span>
           </div>
           
           <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'hsl(var(--bg-card))', padding: '6px 12px', borderRadius: '8px', border: '1px solid hsla(0,0%,100%,0.1)' }}>
                <FileText size={16} color="hsl(var(--primary))" />
                <input 
                  type="text" 
                  value={resumeName} 
                  onChange={(e) => setResumeName(e.target.value.replace(/[^a-zA-Z0-9_ -\.]/g, ''))}
                  style={{ width: '200px', border: 'none', background: 'transparent', fontSize: '14px', fontWeight: '600', color: 'hsl(var(--text-main))', outline: 'none' }}
                  placeholder="e.g. Software_Engineer_Resume"
                />
              </div>
              <button className="btn-primary" onClick={handleSaveToProfile} disabled={isSaving} style={{ padding: '8px 24px' }}>
                {isSaving ? <RefreshCw className="spinner" size={16} /> : <Save size={16} />}
                {isSaving ? 'Syncing...' : 'Commit to Profile'}
              </button>
           </div>
        </div>

        {saveSuccess && <div className="no-print" style={{ background: 'hsla(var(--success), 0.1)', color: 'hsl(var(--success))', padding: '12px 24px', borderRadius: '8px', marginBottom: '1rem', border: '1px solid hsla(var(--success), 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16}/> {saveSuccess}</div>}
        {error && <div className="no-print auth-error-alert">{error}</div>}

        <div style={{ display: 'flex', gap: '2rem', flex: 1, overflow: 'hidden' }}>
          
          {/* Left Panel: Insight & Actions */}
          <div className="no-print" style={{ width: '380px', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '8px' }}>
            
            {/* ATS Score & Diff Board */}
            <AnimatedCard style={{ padding: '24px', position: 'relative', overflow: 'hidden', borderTop: '2px solid hsla(var(--primary), 0.5)' }}>
               <h3 style={{ fontSize: '16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                 <Target size={18} color="hsl(var(--primary))"/> ATS Diagnostics
               </h3>
               
               <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                 <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsla(0,0%,100%,0.05)" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray={`${result.atsAnalysis.matchScore}, 100`} style={{ transition: 'stroke-dasharray 1s ease-out' }} />
                      <text x="18" y="20.35" fill="hsl(var(--text-main))" fontSize="10" fontWeight="bold" textAnchor="middle">{result.atsAnalysis.matchScore}%</text>
                    </svg>
                 </div>
                 <div style={{ flex: 1 }}>
                   <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Missing Vectors</div>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                     {result.atsAnalysis.missingSkills.length ? result.atsAnalysis.missingSkills.map((skill, i) => (
                       <span key={i} style={{ background: 'hsla(var(--danger), 0.1)', color: 'hsl(var(--danger))', border: '1px solid hsla(var(--danger), 0.3)', padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: '600' }}>{skill}</span>
                     )) : <span style={{ color: 'hsl(var(--success))', fontSize: '12px' }}>Perfect Match</span>}
                   </div>
                 </div>
               </div>

               <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid hsla(0,0%,100%,0.05)' }}>
                 <div style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>AI Modifications Made</div>
                 <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '13px', color: 'hsl(var(--text-main))', lineHeight: '1.6' }}>
                   {result.atsAnalysis.suggestionsForImprovement.slice(0,3).map((sug, i) => (
                     <li key={i} style={{ marginBottom: '8px', color: 'hsl(var(--primary))' }}><span style={{ color: 'hsl(var(--text-main))' }}>{sug}</span></li>
                   ))}
                 </ul>
               </div>
            </AnimatedCard>

            <AnimatedCard style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                 <Edit3 size={16} color="hsl(var(--warning))"/> Source Editor
              </h3>
              <p style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', marginBottom: '16px' }}>Directly modify the AST content. Changes will instantly reflect on the right canvas.</p>
              <button 
                onClick={() => setIsEditing(!isEditing)} 
                style={{ width: '100%', padding: '12px', background: isEditing ? 'hsl(var(--primary))' : 'hsla(0,0%,100%,0.05)', color: isEditing ? '#fff' : 'hsl(var(--text-main))', border: isEditing ? 'none' : '1px solid hsla(0,0%,100%,0.1)', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
              >
                <Edit3 size={16} /> {isEditing ? 'Close Editor Pane' : 'Open JSON Editor Pane'}
              </button>
            </AnimatedCard>

            <AnimatedCard style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                 <LayoutTemplate size={16} color="hsl(var(--success))"/> Render Template
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {templates.map(tpl => (
                  <div 
                    key={tpl.id}
                    onClick={() => setSelectedTemplate(tpl.id)}
                    style={{
                      padding: '12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s',
                      background: selectedTemplate === tpl.id ? 'hsla(var(--success), 0.1)' : 'transparent',
                      border: `1px solid ${selectedTemplate === tpl.id ? 'hsla(var(--success), 0.3)' : 'hsla(0,0%,100%,0.05)'}`
                    }}
                  >
                    <span style={{ fontSize: '14px', fontWeight: selectedTemplate === tpl.id ? '600' : '500', color: selectedTemplate === tpl.id ? 'hsl(var(--success))' : 'hsl(var(--text-main))' }}>{tpl.name}</span>
                    {selectedTemplate === tpl.id && <CheckSquare size={16} color="hsl(var(--success))" />}
                  </div>
                ))}
              </div>
            </AnimatedCard>

            <AnimatedCard style={{ padding: '24px', display: 'flex', gap: '12px' }}>
              <button className="btn-secondary" onClick={handleDocxDownload} style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: 'auto' }}>
                <FileText size={20} color="hsl(var(--primary))" />
                <span style={{ fontSize: '12px' }}>DOCX</span>
              </button>
              <button className="btn-secondary" onClick={handlePrint} style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: 'auto' }}>
                <Printer size={20} color="hsl(var(--primary))" />
                <span style={{ fontSize: '12px' }}>PDF</span>
              </button>
            </AnimatedCard>

          </div>

          {/* Right Panel: Split Editor / Canvas */}
          <div style={{ flex: 1, display: 'flex', gap: '24px', background: 'hsl(var(--bg-app))', borderRadius: '16px', overflow: 'hidden' }}>
            {isEditing && (
              <div className="no-print" style={{ flex: 1, background: 'hsl(var(--bg-card))', borderRight: '1px solid hsla(0,0%,100%,0.05)', overflowY: 'auto', padding: '24px' }}>
                <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid hsla(0,0%,100%,0.05)' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}><Code size={20} color="hsl(var(--primary))"/> Content AST Editor</h3>
                </div>
                <ResumeEditor data={result} onChange={setResult} />
              </div>
            )}
            
            <div ref={previewContainerRef} style={{ flex: isEditing ? 1 : 2, background: 'hsl(var(--bg-app))', overflowY: 'auto', overflowX: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', backgroundImage: 'radial-gradient(hsla(0,0%,0%,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px', position: 'relative', padding: '40px 0' }}>
              <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top center', transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)', marginBottom: '40px' }}>
                <div className="tailored-resume live-preview" style={{ width: '794px', minHeight: '1123px', height: 'auto', paddingBottom: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', background: '#fff', position: 'relative' }}>
                  <TemplateRenderer templateId={selectedTemplate} data={result} />
                </div>
              </div>
            </div>
          </div>

        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * { visibility: hidden; }
            .tailored-resume, .tailored-resume * { visibility: visible; }
            .tailored-resume { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; transform: scale(1) !important; margin: 0; }
            .no-print { display: none !important; }
          }
        `}} />
      </PageTransition>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Pre-Generation
  // -------------------------------------------------------------
  const steps = [
    { title: "Analyzing Semantic Graph", activeColor: "var(--primary)" },
    { title: "Aligning Job Description Vectors", activeColor: "var(--primary)" },
    { title: "Rewriting Bullet Points via LLM", activeColor: "var(--warning)" },
    { title: "Optimizing ATS Layout", activeColor: "var(--success)" },
    { title: "Rendering Final Asset", activeColor: "var(--success)" }
  ];

  return (
    <PageTransition className="upload-page" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', letterSpacing: '-0.04em', margin: '0 0 16px 0', textShadow: '0 0 40px hsla(var(--primary), 0.3)' }}>
          AI Resume Compiler
        </h1>
        <p className="subtitle" style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto', color: 'hsl(var(--text-muted))' }}>
          Configure your build parameters. The AI will rewrite your resume to exactly match the target job description.
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
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ width: '100%', maxWidth: '700px', margin: '0 auto' }}
        >
          <AnimatedCard style={{ padding: '0', overflow: 'hidden', border: '1px solid hsla(var(--primary), 0.3)', boxShadow: '0 0 60px hsla(var(--primary), 0.15)' }}>
            <div style={{ background: 'hsla(0,0%,0%,0.5)', padding: '16px 24px', borderBottom: '1px solid hsla(0,0%,100%,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Zap size={20} color="hsl(var(--primary))" />
              <span style={{ fontFamily: 'monospace', fontSize: '14px', letterSpacing: '0.1em', color: 'hsl(var(--text-muted))' }}>COMPILER THREAD // RUNNING</span>
            </div>
            
            <div style={{ padding: '40px 32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {steps.map((step, idx) => {
                  const isActive = idx === loadingStep;
                  const isDone = idx < loadingStep;
                  const isPending = idx > loadingStep;

                  return (
                    <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: isPending ? 0.3 : 1, x: 0 }} transition={{ delay: idx * 0.1 }} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isDone ? <CheckCircle size={20} color={`hsl(${step.activeColor})`} /> : isActive ? <RefreshCw size={20} className="spinner" color={`hsl(${step.activeColor})`} /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--border-color))' }} />}
                      </div>
                      <span style={{ fontFamily: 'monospace', fontSize: '15px', color: isDone ? `hsl(${step.activeColor})` : isActive ? 'hsl(var(--text-main))' : 'hsl(var(--text-muted))', textShadow: isActive || isDone ? `0 0 10px hsla(${step.activeColor}, 0.5)` : 'none' }}>
                        {step.title}
                        {isActive && <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }}>...</motion.span>}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </AnimatedCard>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          
          {/* Base Resume */}
          <AnimatedCard style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '18px', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary))' }}>1</div>
              Source Profile Target
            </h3>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', background: 'hsla(0,0%,100%,0.03)', padding: '6px', borderRadius: '12px', border: '1px solid hsla(0,0%,100%,0.05)' }}>
              <button type="button" style={{ flex: 1, padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', background: resumeSource === 'upload' ? 'hsla(var(--primary), 0.2)' : 'transparent', color: resumeSource === 'upload' ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))', border: `1px solid ${resumeSource === 'upload' ? 'hsla(var(--primary), 0.5)' : 'transparent'}`, transition: 'all 0.2s' }} onClick={() => setResumeSource('upload')}>
                <Upload size={16} style={{ marginRight: '8px' }} /> Local PDF
              </button>
              <button type="button" style={{ flex: 1, padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', background: resumeSource === 'saved' ? 'hsla(var(--primary), 0.2)' : 'transparent', color: resumeSource === 'saved' ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))', border: `1px solid ${resumeSource === 'saved' ? 'hsla(var(--primary), 0.5)' : 'transparent'}`, transition: 'all 0.2s' }} onClick={() => setResumeSource('saved')} disabled={savedResumes.length === 0}>
                <FolderOpen size={16} style={{ marginRight: '8px' }} /> Databank
              </button>
            </div>

            <AnimatePresence mode="wait">
              {resumeSource === 'upload' ? (
                <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <div 
                    style={{ height: '200px', borderRadius: 'var(--radius-lg)', border: `2px dashed ${isDragOver ? 'hsl(var(--primary))' : file ? 'hsl(var(--success))' : 'hsla(0,0%,100%,0.1)'}`, background: isDragOver ? 'hsla(var(--primary), 0.05)' : file ? 'hsla(var(--success), 0.05)' : 'hsla(0,0%,100%,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}
                    onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={!file ? triggerFileSelect : undefined}
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" style={{ display: 'none' }} />
                    {file ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <CheckCircle size={32} color="hsl(var(--success))" />
                          <div>
                            <p style={{ margin: 0, color: 'hsl(var(--text-main))', fontWeight: '600', fontSize: '16px' }}>{file.name}</p>
                            <p style={{ margin: '4px 0 0 0', color: 'hsl(var(--text-muted))', fontSize: '13px' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button type="button" onClick={removeFile} style={{ padding: '6px 16px', background: 'hsla(var(--danger), 0.1)', color: 'hsl(var(--danger))', border: '1px solid hsla(var(--danger), 0.3)', borderRadius: '100px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Eject Payload</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 10 }}>
                        <Upload size={32} color="hsl(var(--primary))" />
                        <h4 style={{ margin: 0, fontSize: '16px' }}>Initiate Drop Sequence</h4>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="saved" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <select value={selectedResumeId} onChange={(e) => setSelectedResumeId(e.target.value)} style={{ width: '100%', padding: '20px', borderRadius: '12px', background: 'hsla(0,0%,100%,0.03)', border: '1px solid hsla(0,0%,100%,0.1)', color: 'hsl(var(--text-main))', fontSize: '15px', outline: 'none', cursor: 'pointer' }}>
                    {savedResumes.map(r => <option key={r._id} value={r._id} style={{ background: 'hsl(var(--bg-app))' }}>[{r.filename}] - Uploaded {new Date(r.uploadedAt).toLocaleDateString()}</option>)}
                  </select>
                </motion.div>
              )}
            </AnimatePresence>
          </AnimatedCard>

          {/* Job Description */}
          <AnimatedCard style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '18px', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary))' }}>2</div>
              Job Description Injection
            </h3>
            <textarea
              rows={6}
              placeholder="Inject raw job description here to optimize vectors..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
              style={{ width: '100%', background: 'hsla(0,0%,100%,0.02)', border: '1px solid hsla(0,0%,100%,0.05)', borderRadius: '12px', padding: '20px', color: 'hsl(var(--text-main))', fontSize: '15px', resize: 'none', lineHeight: '1.6', outline: 'none' }}
            />
          </AnimatedCard>

          {/* Templates */}
          <AnimatedCard style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '18px', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary))' }}>3</div>
              Output Render Schematic
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {templates.map(tpl => (
                <div 
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  style={{ padding: '20px', borderRadius: '12px', border: `2px solid ${selectedTemplate === tpl.id ? 'hsl(var(--primary))' : 'hsla(0,0%,100%,0.05)'}`, background: selectedTemplate === tpl.id ? 'hsla(var(--primary), 0.05)' : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.2s' }}
                >
                  <LayoutTemplate size={24} color={selectedTemplate === tpl.id ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))'} />
                  <div>
                    <h4 style={{ fontSize: '15px', margin: '0 0 4px 0', color: selectedTemplate === tpl.id ? 'hsl(var(--primary))' : 'inherit' }}>{tpl.name}</h4>
                    <p style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', margin: 0, lineHeight: '1.4' }}>{tpl.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isSubmitDisabled() || loading}
            style={{ width: '100%', padding: '24px', fontSize: '18px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '16px' }}
          >
            <Zap size={24} /> Compile Tailored Resume
          </button>
        </form>
      )}
    </PageTransition>
  );
}
