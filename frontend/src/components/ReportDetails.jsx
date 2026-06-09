import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, XCircle, Calendar, Briefcase, Eye } from 'lucide-react';

export default function ReportDetails({ report }) {
  const [expandedQuestions, setExpandedQuestions] = useState({});

  if (!report) return null;

  const toggleQuestion = (index, type) => {
    const key = `${type}-${index}`;
    setExpandedQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Get color and icon based on severity of skill gap
  const getSeverityStyle = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return {
          bg: 'var(--danger-light)',
          border: 'hsla(var(--danger), 0.2)',
          text: 'hsl(var(--danger))',
          label: 'Critical Gap',
          icon: <XCircle size={16} />
        };
      case 'medium':
        return {
          bg: 'var(--warning-light)',
          border: 'hsla(var(--warning), 0.2)',
          text: 'hsl(var(--warning))',
          label: 'Moderate Gap',
          icon: <AlertTriangle size={16} />
        };
      case 'low':
      default:
        return {
          bg: 'var(--success-light)',
          border: 'hsla(var(--success), 0.2)',
          text: 'hsl(var(--success))',
          label: 'Minor Gap',
          icon: <CheckCircle size={16} />
        };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="report-details-container animate-fade-in">
      <div className="report-header-card card">
        <div className="report-meta">
          <span className="report-date">
            <Calendar size={16} />
            {formatDate(report.createdAt)}
          </span>
          <span className="report-role">
            <Briefcase size={16} />
            Target: {report.jobDescription || 'General Profile'}
          </span>
        </div>
        <h2 className="report-title">{report.title || 'Career Profile Assessment'}</h2>
        
        <div className="score-section">
          <div 
            className="progress-circle animate-scale-in" 
            style={{ '--progress': report.matchScore || 0 }}
          >
            <span className="progress-text">{report.matchScore || 0}%</span>
          </div>
          <div className="score-info">
            <h3>Match Score</h3>
            <p>
              Your resume aligns {report.matchScore}% with the target job requirements.
              {report.matchScore >= 80 ? ' Excellent match! Focus on direct applications.' : 
               report.matchScore >= 50 ? ' Good match, but addressing the skill gaps below will boost response rates.' : 
               ' Significant gaps found. Review the recommended learning path.'}
            </p>
          </div>
        </div>
      </div>

      <div className="report-grid">
        {/* Skill Gaps Card */}
        <div className="report-section card">
          <h3 className="section-title">Identified Skill Gaps</h3>
          <p className="section-subtitle">Areas requiring upskilling or highlight refinement in your resume</p>
          
          {report.skillGaps && report.skillGaps.length > 0 ? (
            <div className="skill-gaps-list">
              {report.skillGaps.map((gap, index) => {
                const style = getSeverityStyle(gap.severity);
                return (
                  <div 
                    key={index} 
                    className="skill-gap-item stagger-item" 
                    style={{ 
                      backgroundColor: `hsl(${style.bg})`, 
                      borderColor: style.border,
                      color: style.text 
                    }}
                  >
                    <div className="skill-gap-main">
                      {style.icon}
                      <span className="skill-name">{gap.skill}</span>
                    </div>
                    <span className="skill-severity">{style.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-data-msg">No key skill gaps identified! You are fully aligned.</p>
          )}
        </div>

        {/* 7-Day Prep Plan Card */}
        <div className="report-section card">
          <h3 className="section-title">Coaching & Preparation Plan</h3>
          <p className="section-subtitle">Structured roadmap to get you ready for technical screening</p>
          
          {report.preparationPlan && report.preparationPlan.length > 0 ? (
            <div className="prep-plan-timeline">
              {report.preparationPlan.map((plan, index) => (
                <div key={index} className="timeline-day stagger-item">
                  <div className="timeline-badge">Day {plan.day}</div>
                  <div className="timeline-content">
                    <h4 className="timeline-focus">{plan.focus}</h4>
                    <ul className="timeline-tasks">
                      {plan.tasks && plan.tasks.map((task, tIndex) => (
                        <li key={tIndex}>{task}</li>
                      ))}
                    </ul>
                    {plan.resources && plan.resources.length > 0 && (
                      <div className="timeline-resources">
                        <span className="resources-lbl">Recommended Learning:</span>
                        <div className="resources-list">
                          {plan.resources.map((res, rIndex) => (
                            <a 
                              key={rIndex} 
                              href={res.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`resource-tag ${res.type}`}
                            >
                              {res.type === 'youtube' ? '🎥' : '📄'} {res.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data-msg">No preparation plan generated.</p>
          )}
        </div>
      </div>

      {/* Technical Interview Preparation */}
      <div className="qa-section card">
        <h3 className="section-title">Predicted Technical Questions</h3>
        <p className="section-subtitle">Likely interview questions based on the skill gaps and match requirements</p>
        
        {report.technicalQuestions && report.technicalQuestions.length > 0 ? (
          <div className="qa-list">
            {report.technicalQuestions.map((qa, index) => {
              const isExpanded = expandedQuestions[`tech-${index}`];
              return (
                <div key={index} className={`qa-item ${isExpanded ? 'expanded' : ''} stagger-item`}>
                  <button className="qa-trigger" onClick={() => toggleQuestion(index, 'tech')}>
                    <span className="question-text">Q: {qa.question}</span>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  <div className="qa-expanded-body">
                    <div className="qa-meta-block">
                      <strong>Recruiter Intent:</strong>
                      <p>{qa.intention}</p>
                    </div>
                    <div className="qa-meta-block">
                      <strong>Suggested Response:</strong>
                      <p className="suggested-answer">{qa.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="no-data-msg">No technical questions available.</p>
        )}
      </div>

      {/* Behavioral Interview Preparation */}
      <div className="qa-section card">
        <h3 className="section-title">Predicted Behavioral Questions</h3>
        <p className="section-subtitle">Situational questions focusing on culture fit and soft skills</p>
        
        {report.behavioralQuestions && report.behavioralQuestions.length > 0 ? (
          <div className="qa-list">
            {report.behavioralQuestions.map((qa, index) => {
              const isExpanded = expandedQuestions[`behavioral-${index}`];
              return (
                <div key={index} className={`qa-item ${isExpanded ? 'expanded' : ''} stagger-item`}>
                  <button className="qa-trigger" onClick={() => toggleQuestion(index, 'behavioral')}>
                    <span className="question-text">Q: {qa.question}</span>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  <div className="qa-expanded-body">
                    <div className="qa-meta-block">
                      <strong>Recruiter Intent:</strong>
                      <p>{qa.intention}</p>
                    </div>
                    <div className="qa-meta-block">
                      <strong>Suggested Response:</strong>
                      <p className="suggested-answer">{qa.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="no-data-msg">No behavioral questions available.</p>
        )}
      </div>
    </div>
  );
}
