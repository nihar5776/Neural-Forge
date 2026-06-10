import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Upload, FileText, AlertCircle, RefreshCw, CheckCircle, Info, Sparkles, FolderOpen, 
  Star, Compass, UserCheck, BookOpen, ArrowRight, TrendingUp, MessageSquare, Award, ChevronDown, 
  ChevronUp, Smile, Mic, MicOff, Play, Square, Trash2, Keyboard, Zap, Focus, Target, Radio
} from 'lucide-react';
import { PageTransition, AnimatedCard, FadeIn, NeuralDecodeText, MagneticButton } from '../components/MotionWrappers';
import { motion, AnimatePresence } from 'framer-motion';

export default function MockInterview() {
  const [savedResumes, setSavedResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [resumeSource, setResumeSource] = useState('none'); 
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const [jobRole, setJobRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium'); 

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); 
  const [error, setError] = useState('');
  const [session, setSession] = useState(null); 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [answerType, setAnswerType] = useState('text'); 
  const [answer, setAnswer] = useState(''); 
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null); 

  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const presetRoles = [
    "React Frontend Engineer",
    "Node.js Backend Developer",
    "Full Stack Web Developer",
    "Product Manager",
    "Data Scientist"
  ];

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
          setResumeSource('none');
        }
      } catch (err) {
        console.error("Failed to load saved resumes:", err);
        setResumeSource('none');
      } finally {
        setResumesLoading(false);
      }
    };
    fetchResumesList();
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const startRecording = async () => {
    setError(''); setAudioUrl(''); setAudioBlob(null); audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setError("Failed to access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteRecording = () => { setAudioUrl(''); setAudioBlob(null); };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => { setIsDragOver(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragOver(false); validateAndSetFile(e.dataTransfer.files[0]); };
  const handleFileChange = (e) => { validateAndSetFile(e.target.files[0]); };
  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') { setError('Please upload a PDF file only.'); setFile(null); return; }
    if (selectedFile.size > 10 * 1024 * 1024) { setError('File size must be under 10MB.'); setFile(null); return; }
    setError(''); setFile(selectedFile);
  };
  const triggerFileSelect = () => { fileInputRef.current.click(); };
  const removeFile = (e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!jobRole.trim()) { setError('Please enter or select a target job role.'); return; }

    setLoading(true); setError(''); setLoadingStep(1);

    try {
      let finalResumeId = null;
      if (resumeSource === 'upload' && file) {
        const formData = new FormData();
        formData.append('resume', file);
        const uploadData = await api.upload('/api/resumeUpload/', formData);
        if (uploadData.response && uploadData.response._id) {
          finalResumeId = uploadData.response._id;
          setSavedResumes(prev => [uploadData.response, ...prev]);
          setSelectedResumeId(uploadData.response._id);
          setResumeSource('saved');
        }
      } else if (resumeSource === 'saved') {
        finalResumeId = selectedResumeId;
      }

      setLoadingStep(2);
      const startData = await api.post('/api/mock-interview/start', { jobRole: jobRole.trim(), resumeId: finalResumeId, difficulty });

      if (startData.interview) {
        setSession(startData.interview);
        setCurrentQuestionIndex(0);
        setAnswer('');
        setEvaluationResult(null);
        deleteRecording();
      }
    } catch (err) {
      setError(err.message || 'Failed to generate interview. Please check your network and API key.');
    } finally {
      setLoading(false); setLoadingStep(0);
    }
  };

  const handleSubmitAnswer = async () => {
    if (answerType === 'text' && !answer.trim()) return;
    if (answerType === 'audio' && !audioBlob) return;

    setEvaluating(true); setError('');

    try {
      const formData = new FormData();
      formData.append('questionIndex', currentQuestionIndex);
      formData.append('answerType', answerType);

      if (answerType === 'text') formData.append('userAnswer', answer);
      else formData.append('audio', new File([audioBlob], 'recording.webm', { type: 'audio/webm' }));

      const data = await api.upload(`/api/mock-interview/${session._id}/answer`, formData);
      setEvaluationResult(data.evaluation);
      if (answerType === 'audio' && data.evaluation.userAnswer) {
        setAnswer(data.evaluation.userAnswer);
      }
    } catch (err) {
      setError(err.message || "Failed to submit response. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (evaluationResult && evaluationResult.nextQuestion) {
      const nextQ = evaluationResult.nextQuestion;
      setSession(prev => {
        const updatedQs = [...prev.questions];
        updatedQs[currentQuestionIndex].userAnswer = answer;
        updatedQs[currentQuestionIndex].score = evaluationResult.score;
        updatedQs[currentQuestionIndex].feedback = evaluationResult.feedback;
        updatedQs[currentQuestionIndex].idealAnswer = evaluationResult.idealAnswer;
        updatedQs.push({ question: nextQ.question, category: nextQ.category, topic: nextQ.topic, userAnswer: '', score: null, feedback: '', idealAnswer: '' });
        return { ...prev, questions: updatedQs };
      });
      setCurrentQuestionIndex(prev => prev + 1);
      setAnswer('');
      setEvaluationResult(null);
      deleteRecording();
      setError('');
    }
  };

  const handleFinishInterview = async () => {
    setLoading(true); setLoadingStep(3); setError('');
    try {
      const data = await api.post(`/api/mock-interview/${session._id}/finish`);
      setSession(data.interview);
    } catch (err) {
      setError(err.message || "Failed to compile report. Please try again.");
    } finally {
      setLoading(false); setLoadingStep(0);
    }
  };

  const resetInterview = () => { setSession(null); setAnswer(''); setEvaluationResult(null); deleteRecording(); setError(''); };

  const getScoreColorClass = (score) => {
    if (score >= 80) return 'text-success bg-success-light border-success-light';
    if (score >= 60) return 'text-warning bg-warning-light border-warning-light';
    return 'text-danger bg-danger-light border-danger-light';
  };
  const getStrokeColor = (score) => {
    if (score >= 80) return 'hsl(var(--success))';
    if (score >= 60) return 'hsl(var(--warning))';
    return 'hsl(var(--danger))';
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // ==========================================
  // RENDER: LOADING VIEW
  // ==========================================
  if (loading) {
    const steps = [
      { id: 1, title: "Bootstrapping Neural Planner", desc: "Analyzing target job role details, core technologies, and parsing projects." },
      { id: 2, title: "Formulating Initial Queries", desc: "Creating initial Technical and Behavioral concept challenges." },
      { id: 3, title: "Compiling Post-Action Report", desc: "Aggregating transcripts, checking scores, and writing recommendations." }
    ];

    return (
      <PageTransition className="dashboard-page animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 100px)' }}>
        <AnimatedCard style={{ maxWidth: '600px', width: '100%', padding: '0', overflow: 'hidden', border: '1px solid hsla(var(--primary), 0.3)', boxShadow: '0 0 80px hsla(var(--primary), 0.15)' }}>
          <div style={{ background: 'hsla(0,0%,0%,0.8)', padding: '24px 32px', borderBottom: '1px solid hsla(0,0%,100%,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Radio className="spinner" size={24} color="hsl(var(--primary))" />
            <span style={{ fontFamily: 'monospace', fontSize: '14px', letterSpacing: '0.1em', color: 'hsl(var(--text-main))' }}>NEURAL AI COACH // ACTIVE</span>
          </div>
          
          <div style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {steps.map(s => {
              const isActive = loadingStep === s.id;
              const isDone = loadingStep > s.id || (loadingStep === 0 && s.id < 3); // simplistic visual
              return (
                <div key={s.id} style={{ display: 'flex', gap: '16px', opacity: isActive || isDone ? 1 : 0.3 }}>
                  <div style={{ marginTop: '2px' }}>
                    {isDone ? <CheckCircle size={20} color="hsl(var(--success))" /> : isActive ? <RefreshCw className="spinner" size={20} color="hsl(var(--primary))" /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--border-color))', margin: '6px' }} />}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: isDone ? 'hsl(var(--success))' : isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))' }}>{s.title}</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'hsl(var(--text-muted))' }}>{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </AnimatedCard>
      </PageTransition>
    );
  }

  // ==========================================
  // RENDER: RESULTS DASHBOARD SCREEN
  // ==========================================
  if (session && session.status === 'completed') {
    const radius = 55;
    const strokeWidth = 10;
    const circumference = 2 * Math.PI * radius;
    const overallOffset = circumference - (session.overallScore / 100) * circumference;

    return (
      <PageTransition className="dashboard-page" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'hsla(var(--primary), 0.2)', color: 'hsl(var(--primary))' }}>
                {session.difficulty} Mode
              </span>
              <span style={{ color: 'hsl(var(--text-muted))', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} /> Evaluation Complete
              </span>
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', letterSpacing: '-0.03em', margin: '0 0 8px 0' }}>Performance Telemetry</h1>
            <p style={{ fontSize: '16px', color: 'hsl(var(--text-muted))', margin: 0 }}>Role: <span style={{ color: 'hsl(var(--text-main))' }}>{session.jobRole}</span></p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }} className="no-print">
            <button className="btn-secondary" onClick={() => window.print()} style={{ height: '44px' }}>
              <FileText size={16} /> Export Intel
            </button>
            <button className="btn-primary" onClick={resetInterview} style={{ height: '44px' }}>
              <RefreshCw size={16} /> New Session
            </button>
          </div>
        </div>

        {/* Scoring Dashboard Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          <AnimatedCard style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', padding: '32px', borderTop: '2px solid hsla(var(--primary), 0.5)' }}>
            <div style={{ position: 'relative', width: '130px', height: '130px' }}>
              <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="65" cy="65" r={radius} stroke="hsla(0,0%,100%,0.05)" strokeWidth={strokeWidth} fill="transparent" />
                <circle cx="65" cy="65" r={radius} stroke={getStrokeColor(session.overallScore)} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={overallOffset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
              </svg>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '130px', height: '130px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '32px', fontWeight: '800', color: getStrokeColor(session.overallScore), textShadow: `0 0 20px ${getStrokeColor(session.overallScore)}` }}>
                  {session.overallScore}%
                </span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Global Rating</h3>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                This metric aggregates your structural, technical, and communicative vectors against standard industry benchmarks.
              </p>
            </div>
          </AnimatedCard>

          <AnimatedCard style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '24px', padding: '32px', borderTop: '2px solid hsla(var(--warning), 0.5)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span style={{ color: 'hsl(var(--text-muted))' }}>Technical Vector</span>
                <span style={{ color: getStrokeColor(session.technicalScore) }}>{session.technicalScore}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'hsla(0,0%,100%,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${session.technicalScore}%` }} transition={{ duration: 1, ease: "easeOut" }} style={{ height: '100%', backgroundColor: getStrokeColor(session.technicalScore), borderRadius: '100px', boxShadow: `0 0 10px ${getStrokeColor(session.technicalScore)}` }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span style={{ color: 'hsl(var(--text-muted))' }}>Communication Vector</span>
                <span style={{ color: getStrokeColor(session.communicationScore) }}>{session.communicationScore}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'hsla(0,0%,100%,0.05)', borderRadius: '100px', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${session.communicationScore}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }} style={{ height: '100%', backgroundColor: getStrokeColor(session.communicationScore), borderRadius: '100px', boxShadow: `0 0 10px ${getStrokeColor(session.communicationScore)}` }} />
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Strengths & Weaknesses Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <AnimatedCard style={{ padding: '32px', borderTop: '2px solid hsla(var(--success), 0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ padding: '8px', background: 'hsla(var(--success), 0.1)', borderRadius: '8px' }}><UserCheck size={20} color="hsl(var(--success))" /></div>
              <h3 style={{ fontSize: '18px', margin: 0 }}>Confirmed Strengths</h3>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {session.strengths.map((str, idx) => (
                <li key={idx} style={{ display: 'flex', gap: '12px', fontSize: '14px', lineHeight: '1.6', color: 'hsl(var(--text-main))' }}>
                  <CheckCircle size={16} color="hsl(var(--success))" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </AnimatedCard>

          <AnimatedCard style={{ padding: '32px', borderTop: '2px solid hsla(var(--danger), 0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ padding: '8px', background: 'hsla(var(--danger), 0.1)', borderRadius: '8px' }}><AlertCircle size={20} color="hsl(var(--danger))" /></div>
              <h3 style={{ fontSize: '18px', margin: 0 }}>Identified Anomalies</h3>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {session.weaknesses.map((weak, idx) => (
                <li key={idx} style={{ display: 'flex', gap: '12px', fontSize: '14px', lineHeight: '1.6', color: 'hsl(var(--text-main))' }}>
                  <AlertCircle size={16} color="hsl(var(--danger))" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </AnimatedCard>
        </div>

        <h2 style={{ fontSize: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}><MessageSquare size={24} color="hsl(var(--primary))"/> Transcript & Detailed Feedback</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {session.questions.map((q, idx) => (
            <AnimatedCard key={idx} style={{ padding: '0', overflow: 'hidden' }}>
              <div 
                onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: expandedQuestion === idx ? 'hsla(0,0%,100%,0.02)' : 'transparent', transition: 'background 0.2s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>
                    Q{idx + 1}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', margin: '0 0 4px 0', color: 'hsl(var(--text-main))' }}>{q.question.length > 80 ? q.question.substring(0, 80) + '...' : q.question}</h4>
                    <span style={{ fontSize: '12px', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{q.category}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {q.score && (
                    <div style={{ padding: '4px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: '800', background: `hsla(${q.score >= 80 ? 'var(--success)' : q.score >= 60 ? 'var(--warning)' : 'var(--danger)'}, 0.1)`, color: getStrokeColor(q.score) }}>
                      {q.score}%
                    </div>
                  )}
                  {expandedQuestion === idx ? <ChevronUp size={20} color="hsl(var(--text-muted))" /> : <ChevronDown size={20} color="hsl(var(--text-muted))" />}
                </div>
              </div>

              <AnimatePresence>
                {expandedQuestion === idx && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '24px', borderTop: '1px solid hsla(0,0%,100%,0.05)', background: 'hsla(0,0%,0%,0.2)' }}>
                      <p style={{ fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px 0', color: 'hsl(var(--text-main))' }}><strong>Q:</strong> {q.question}</p>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ background: 'hsla(0,0%,100%,0.02)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid hsl(var(--border-color))' }}>
                          <h5 style={{ margin: '0 0 8px 0', fontSize: '12px', textTransform: 'uppercase', color: 'hsl(var(--text-muted))' }}>Your Answer</h5>
                          <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'hsl(var(--text-muted))' }}>{q.userAnswer}</p>
                        </div>
                        
                        <div style={{ background: 'hsla(var(--primary), 0.05)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid hsl(var(--primary))' }}>
                          <h5 style={{ margin: '0 0 8px 0', fontSize: '12px', textTransform: 'uppercase', color: 'hsl(var(--primary))' }}>AI Feedback</h5>
                          <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'hsl(var(--text-main))' }}>{q.feedback}</p>
                        </div>

                        <div style={{ background: 'hsla(var(--success), 0.05)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid hsl(var(--success))' }}>
                          <h5 style={{ margin: '0 0 8px 0', fontSize: '12px', textTransform: 'uppercase', color: 'hsl(var(--success))' }}>Ideal Answer Structure</h5>
                          <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: 'hsl(var(--text-main))' }}>{q.idealAnswer}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </AnimatedCard>
          ))}
        </div>
      </PageTransition>
    );
  }

  // ==========================================
  // RENDER: ACTIVE INTERVIEW SESSION
  // ==========================================
  if (session && session.status !== 'completed') {
    const q = session.questions[currentQuestionIndex];
    return (
      <PageTransition style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', padding: '2rem', overflow: 'hidden' }}>
        
        {/* HUD Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', borderRadius: '100px', fontSize: '13px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', border: '1px solid hsla(var(--primary), 0.3)' }}>
               <Radio className="spinner" size={14} /> LIVE SESSION
             </div>
             <div style={{ color: 'hsl(var(--text-muted))', fontSize: '14px', fontWeight: '600' }}>{session.jobRole}</div>
           </div>
           
           <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
             <div style={{ fontSize: '14px', fontWeight: '600', color: 'hsl(var(--text-muted))' }}>
               Phase {currentQuestionIndex + 1}
             </div>
             <button className="btn-secondary" onClick={handleFinishInterview} style={{ padding: '8px 16px', fontSize: '13px', borderColor: 'hsla(var(--danger), 0.3)', color: 'hsl(var(--danger))' }}>
               Abort & Compile Report
             </button>
           </div>
        </div>

        {/* AI Question Card */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          
          <AnimatePresence mode="wait">
            {!evaluating && !evaluationResult && (
              <motion.div key="question" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} style={{ width: '100%', maxWidth: '800px' }}>
                <AnimatedCard style={{ padding: '40px', textAlign: 'center', background: 'linear-gradient(180deg, hsla(250, 10%, 8%, 0.8) 0%, hsla(250, 10%, 4%, 0.9) 100%)', border: '1px solid hsla(var(--primary), 0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'hsla(0,0%,100%,0.05)', borderRadius: '100px', marginBottom: '24px', border: '1px solid hsla(0,0%,100%,0.1)' }}>
                    <Focus size={14} color="hsl(var(--primary))" />
                    <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'hsl(var(--text-muted))' }}>{q.category}</span>
                  </div>
                  
                  <h2 style={{ fontSize: '32px', lineHeight: '1.4', margin: '0 0 40px 0', fontWeight: '600', letterSpacing: '-0.02em', color: 'hsl(var(--text-main))' }}>
                    {q.question}
                  </h2>

                  {/* Input Selector */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', background: 'hsla(0,0%,0%,0.5)', padding: '6px', borderRadius: '100px', border: '1px solid hsla(0,0%,100%,0.05)' }}>
                      <button type="button" onClick={() => setAnswerType('text')} style={{ padding: '8px 24px', borderRadius: '100px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', background: answerType === 'text' ? 'hsla(var(--primary), 0.2)' : 'transparent', color: answerType === 'text' ? 'hsl(var(--text-main))' : 'hsl(var(--text-muted))', transition: 'all 0.2s', border: 'none' }}>
                        <Keyboard size={16} /> Keyboard Input
                      </button>
                      <button type="button" onClick={() => setAnswerType('audio')} style={{ padding: '8px 24px', borderRadius: '100px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', background: answerType === 'audio' ? 'hsla(var(--primary), 0.2)' : 'transparent', color: answerType === 'audio' ? 'hsl(var(--text-main))' : 'hsl(var(--text-muted))', transition: 'all 0.2s', border: 'none' }}>
                        <Mic size={16} /> Voice Comms
                      </button>
                    </div>
                  </div>

                  {error && <div style={{ color: 'hsl(var(--danger))', fontSize: '14px', marginBottom: '16px' }}>{error}</div>}

                  {answerType === 'text' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <textarea
                        rows={6}
                        placeholder="Type your detailed response here..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        style={{ width: '100%', padding: '20px', borderRadius: '16px', background: 'hsla(0,0%,100%,0.02)', border: '1px solid hsla(0,0%,100%,0.1)', color: 'hsl(var(--text-main))', fontSize: '16px', resize: 'none', lineHeight: '1.6', outline: 'none' }}
                      />
                      <MagneticButton className="btn-primary" onClick={handleSubmitAnswer} disabled={!answer.trim()} style={{ padding: '16px', borderRadius: '100px', fontSize: '16px', fontWeight: '800', width: '100%' }}>
                        Submit Response
                      </MagneticButton>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                      {!isRecording && !audioBlob && (
                        <button onClick={startRecording} style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'hsla(var(--danger), 0.1)', border: '2px solid hsl(var(--danger))', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 30px hsla(var(--danger), 0.2)' }}>
                          <Mic size={32} color="hsl(var(--danger))" />
                        </button>
                      )}

                      {isRecording && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                          <div style={{ position: 'relative' }}>
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ position: 'absolute', top: -10, left: -10, right: -10, bottom: -10, borderRadius: '50%', background: 'hsla(var(--danger), 0.2)' }} />
                            <button onClick={stopRecording} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', background: 'hsl(var(--danger))', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
                              <Square size={24} color="#fff" fill="#fff" />
                            </button>
                          </div>
                          <span style={{ fontFamily: 'monospace', fontSize: '24px', fontWeight: '600', color: 'hsl(var(--danger))' }}>{formatTimer(recordingSeconds)}</span>
                          <span className="spinner" style={{ fontSize: '12px', color: 'hsl(var(--danger))', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recording Transmission...</span>
                        </div>
                      )}

                      {audioBlob && !isRecording && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'hsla(0,0%,100%,0.05)', padding: '12px 24px', borderRadius: '100px', border: '1px solid hsla(0,0%,100%,0.1)' }}>
                            <audio src={audioUrl} controls style={{ height: '36px' }} />
                            <button onClick={deleteRecording} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer' }}><Trash2 size={20}/></button>
                          </div>
                          <button className="btn-primary" onClick={handleSubmitAnswer} style={{ padding: '16px 40px', borderRadius: '100px', fontSize: '16px', fontWeight: '800', width: '100%' }}>
                            Submit Audio Transmission
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </AnimatedCard>
              </motion.div>
            )}

            {evaluating && (
              <motion.div key="evaluating" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '50%', border: '2px dashed hsl(var(--primary))', opacity: 0.5 }} />
                  <Sparkles size={40} color="hsl(var(--primary))" className="spinner" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>Analyzing Transmission...</h3>
                  <p style={{ margin: 0, color: 'hsl(var(--text-muted))', fontSize: '14px' }}>Evaluating vector semantics and generating AI feedback.</p>
                </div>
              </motion.div>
            )}

            {evaluationResult && !evaluating && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '800px' }}>
                <AnimatedCard style={{ padding: '40px', background: 'linear-gradient(180deg, hsla(250, 10%, 8%, 0.8) 0%, hsla(250, 10%, 4%, 0.9) 100%)', border: '1px solid hsla(var(--success), 0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CheckCircle size={24} color="hsl(var(--success))" /> 
                        Feedback Generated
                      </h3>
                      <p style={{ margin: 0, color: 'hsl(var(--text-muted))', fontSize: '14px' }}>Question {currentQuestionIndex + 1} completed.</p>
                    </div>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: `4px solid ${getStrokeColor(evaluationResult.score)}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '24px', fontWeight: '800', color: getStrokeColor(evaluationResult.score) }}>{evaluationResult.score}%</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ background: 'hsla(var(--primary), 0.05)', padding: '20px', borderRadius: '12px', borderLeft: '4px solid hsl(var(--primary))' }}>
                      <h5 style={{ margin: '0 0 8px 0', fontSize: '12px', textTransform: 'uppercase', color: 'hsl(var(--primary))', letterSpacing: '0.05em' }}>AI Feedback</h5>
                      <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', color: 'hsl(var(--text-main))' }}>{evaluationResult.feedback}</p>
                    </div>
                    <div style={{ background: 'hsla(var(--success), 0.05)', padding: '20px', borderRadius: '12px', borderLeft: '4px solid hsl(var(--success))' }}>
                      <h5 style={{ margin: '0 0 8px 0', fontSize: '12px', textTransform: 'uppercase', color: 'hsl(var(--success))', letterSpacing: '0.05em' }}>Ideal Vector Structure</h5>
                      <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', color: 'hsl(var(--text-main))' }}>{evaluationResult.idealAnswer}</p>
                    </div>
                  </div>

                  {evaluationResult.isLast ? (
                    <button className="btn-primary" onClick={handleFinishInterview} style={{ width: '100%', padding: '20px', borderRadius: '100px', fontSize: '16px', fontWeight: '800' }}>
                      Compile Final Report
                    </button>
                  ) : (
                    <button className="btn-primary" onClick={handleNextQuestion} style={{ width: '100%', padding: '20px', borderRadius: '100px', fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      Proceed to Next Phase <ArrowRight size={20} />
                    </button>
                  )}

                </AnimatedCard>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </PageTransition>
    );
  }

  // ==========================================
  // RENDER: PRE-GENERATION FORM
  // ==========================================
  return (
    <PageTransition className="upload-page" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '48px', fontWeight: '800', letterSpacing: '-0.04em', margin: '0 0 16px 0', textShadow: '0 0 40px hsla(var(--primary), 0.3)' }}>
          <NeuralDecodeText text="AI Interview Simulator" />
        </h1>
        <p className="subtitle" style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto', color: 'hsl(var(--text-muted))' }}>
          Engage in a live, adaptive mock interview. The AI will dynamically generate questions based on your background and target role.
        </p>
      </div>

      {error && (
        <div className="auth-error-alert animate-fade-in" style={{ justifyContent: 'center' }}>
          <AlertCircle size={20} />
          <span style={{ fontWeight: '600' }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleStartInterview} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Source Profile */}
        <AnimatedCard style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary))' }}>1</div>
            Source Profile Selection
          </h3>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', background: 'hsla(0,0%,100%,0.03)', padding: '6px', borderRadius: '12px', border: '1px solid hsla(0,0%,100%,0.05)' }}>
            <button type="button" style={{ flex: 1, padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', background: resumeSource === 'none' ? 'hsla(var(--primary), 0.2)' : 'transparent', color: resumeSource === 'none' ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))', border: `1px solid ${resumeSource === 'none' ? 'hsla(var(--primary), 0.5)' : 'transparent'}`, transition: 'all 0.2s' }} onClick={() => setResumeSource('none')}>
              General Profile
            </button>
            <button type="button" style={{ flex: 1, padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', background: resumeSource === 'upload' ? 'hsla(var(--primary), 0.2)' : 'transparent', color: resumeSource === 'upload' ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))', border: `1px solid ${resumeSource === 'upload' ? 'hsla(var(--primary), 0.5)' : 'transparent'}`, transition: 'all 0.2s' }} onClick={() => setResumeSource('upload')}>
              Upload CV
            </button>
            <button type="button" style={{ flex: 1, padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', background: resumeSource === 'saved' ? 'hsla(var(--primary), 0.2)' : 'transparent', color: resumeSource === 'saved' ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))', border: `1px solid ${resumeSource === 'saved' ? 'hsla(var(--primary), 0.5)' : 'transparent'}`, transition: 'all 0.2s' }} onClick={() => setResumeSource('saved')} disabled={savedResumes.length === 0}>
              Databank
            </button>
          </div>

          <AnimatePresence mode="wait">
            {resumeSource === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                <div 
                  style={{ height: '200px', borderRadius: 'var(--radius-lg)', border: `2px dashed ${isDragOver ? 'hsl(var(--primary))' : file ? 'hsl(var(--success))' : 'hsla(0,0%,100%,0.1)'}`, background: isDragOver ? 'hsla(var(--primary), 0.05)' : file ? 'hsla(var(--success), 0.05)' : 'hsla(0,0%,100%,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden', marginTop: '16px' }}
                  onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={!file ? triggerFileSelect : undefined}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" style={{ display: 'none' }} />
                  {file ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 10 }}>
                      <CheckCircle size={32} color="hsl(var(--success))" />
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: 0, color: 'hsl(var(--text-main))', fontWeight: '600', fontSize: '16px' }}>{file.name}</p>
                        <p style={{ margin: '4px 0 0 0', color: 'hsl(var(--text-muted))', fontSize: '13px' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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
            )}

            {resumeSource === 'saved' && (
              <motion.div key="saved" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                <select value={selectedResumeId} onChange={(e) => setSelectedResumeId(e.target.value)} style={{ width: '100%', padding: '20px', borderRadius: '12px', background: 'hsla(0,0%,100%,0.03)', border: '1px solid hsla(0,0%,100%,0.1)', color: 'hsl(var(--text-main))', fontSize: '15px', outline: 'none', cursor: 'pointer', marginTop: '16px' }}>
                  {savedResumes.map(r => <option key={r._id} value={r._id} style={{ background: 'hsl(var(--bg-app))' }}>[{r.filename}]</option>)}
                </select>
              </motion.div>
            )}

            {resumeSource === 'none' && (
              <motion.div key="none" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
                <p style={{ margin: '16px 0 0 0', color: 'hsl(var(--text-muted))', fontSize: '14px', padding: '16px', background: 'hsla(0,0%,100%,0.02)', borderRadius: '8px' }}>
                  Proceeding without a CV. The AI will base questions purely on the target job role.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </AnimatedCard>

        {/* Target Role & Difficulty */}
        <AnimatedCard style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '18px', margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary))' }}>2</div>
            Target Parameters
          </h3>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--text-main))' }}>Target Role *</label>
            <input
              type="text"
              placeholder="e.g. Senior Frontend Developer"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              required
              style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'hsla(0,0%,100%,0.02)', border: '1px solid hsla(0,0%,100%,0.05)', color: 'hsl(var(--text-main))', fontSize: '15px', outline: 'none' }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
              {presetRoles.map(role => (
                <span key={role} onClick={() => setJobRole(role)} style={{ fontSize: '12px', padding: '4px 12px', background: 'hsla(0,0%,100%,0.05)', borderRadius: '100px', cursor: 'pointer', color: 'hsl(var(--text-muted))', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'hsla(var(--primary), 0.2)'; e.currentTarget.style.color = 'hsl(var(--primary))'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'hsla(0,0%,100%,0.05)'; e.currentTarget.style.color = 'hsl(var(--text-muted))'; }}>
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'hsl(var(--text-main))' }}>Simulation Difficulty</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div onClick={() => setDifficulty('easy')} style={{ padding: '16px', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${difficulty === 'easy' ? 'hsla(var(--success), 0.5)' : 'hsla(0,0%,100%,0.05)'}`, background: difficulty === 'easy' ? 'hsla(var(--success), 0.1)' : 'transparent', textAlign: 'center', transition: 'all 0.2s' }}>
                <Smile size={24} color={difficulty === 'easy' ? 'hsl(var(--success))' : 'hsl(var(--text-muted))'} style={{ margin: '0 auto 8px auto' }} />
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: difficulty === 'easy' ? 'hsl(var(--success))' : 'inherit' }}>Easy</h4>
              </div>
              <div onClick={() => setDifficulty('medium')} style={{ padding: '16px', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${difficulty === 'medium' ? 'hsla(var(--warning), 0.5)' : 'hsla(0,0%,100%,0.05)'}`, background: difficulty === 'medium' ? 'hsla(var(--warning), 0.1)' : 'transparent', textAlign: 'center', transition: 'all 0.2s' }}>
                <TrendingUp size={24} color={difficulty === 'medium' ? 'hsl(var(--warning))' : 'hsl(var(--text-muted))'} style={{ margin: '0 auto 8px auto' }} />
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: difficulty === 'medium' ? 'hsl(var(--warning))' : 'inherit' }}>Medium</h4>
              </div>
              <div onClick={() => setDifficulty('hard')} style={{ padding: '16px', borderRadius: '12px', cursor: 'pointer', border: `1px solid ${difficulty === 'hard' ? 'hsla(var(--danger), 0.5)' : 'hsla(0,0%,100%,0.05)'}`, background: difficulty === 'hard' ? 'hsla(var(--danger), 0.1)' : 'transparent', textAlign: 'center', transition: 'all 0.2s' }}>
                <Award size={24} color={difficulty === 'hard' ? 'hsl(var(--danger))' : 'hsl(var(--text-muted))'} style={{ margin: '0 auto 8px auto' }} />
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: difficulty === 'hard' ? 'hsl(var(--danger))' : 'inherit' }}>Hard</h4>
              </div>
            </div>
          </div>
        </AnimatedCard>

        <MagneticButton 
          type="submit" 
          className="btn-primary" 
          disabled={!jobRole.trim() || loading}
          style={{ width: '100%', padding: '24px', fontSize: '18px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '16px' }}
        >
          {loading ? <RefreshCw className="spinner" size={24} /> : <><Play size={24} fill="currentColor" /> Initiate Simulation</>}
        </MagneticButton>
      </form>
    </PageTransition>
  );
}
