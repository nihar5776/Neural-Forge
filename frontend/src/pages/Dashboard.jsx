import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import ReportDetails from '../components/ReportDetails';
import { Calendar, Briefcase, Eye, ChevronRight, RefreshCw, BarChart2, Star, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/interview/history');
      setReports(data.reports || []);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError(err.message || 'Could not fetch history reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getAverageScore = () => {
    if (reports.length === 0) return 0;
    const total = reports.reduce((acc, r) => acc + (r.matchScore || 0), 0);
    return Math.round(total / reports.length);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (selectedReport) {
    return (
      <div className="dashboard-page animate-fade-in">
        <div className="dashboard-header-row">
          <button className="btn-secondary back-btn" onClick={() => setSelectedReport(null)}>
            ← Back to History
          </button>
          <h2>Report Analysis</h2>
        </div>
        <ReportDetails report={selectedReport} />
      </div>
    );
  }

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1>Your Career Dashboard</h1>
          <p className="subtitle">Track your resume matches, key skill gaps, and interview prep history</p>
        </div>
        <button className="btn-secondary refresh-btn" onClick={fetchHistory} disabled={loading}>
          <RefreshCw className={loading ? 'spinner' : ''} size={18} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="auth-error-alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Analytics Cards */}
      <div className="analytics-grid">
        <div className="analytics-card card">
          <div className="analytics-icon-bg info">
            <FileText size={24} />
          </div>
          <div className="analytics-data">
            <span className="analytics-num">{reports.length}</span>
            <span className="analytics-label">Resumes Analyzed</span>
          </div>
        </div>

        <div className="analytics-card card">
          <div className="analytics-icon-bg success">
            <BarChart2 size={24} />
          </div>
          <div className="analytics-data">
            <span className="analytics-num">{getAverageScore()}%</span>
            <span className="analytics-label">Average Match Score</span>
          </div>
        </div>

        <div className="analytics-card card">
          <div className="analytics-icon-bg primary">
            <Star size={24} />
          </div>
          <div className="analytics-data">
            <span className="analytics-num">
              {reports.length > 0 ? Math.max(...reports.map(r => r.matchScore || 0)) : 0}%
            </span>
            <span className="analytics-label">Highest Score</span>
          </div>
        </div>
      </div>

      <div className="history-section">
        <h3>Coaching & Analysis History</h3>
        
        {loading ? (
          <div className="loading-state-box">
            <RefreshCw className="spinner" size={32} />
            <p>Loading your career history...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="empty-state-card card">
            <FileText size={48} className="empty-icon" />
            <h4>No reports generated yet</h4>
            <p>Upload your resume and enter a target job description to get a full gap analysis and coaching roadmap.</p>
            <Link to="/upload" className="btn-primary">
              Analyze Your Resume Now
            </Link>
          </div>
        ) : (
          <div className="reports-history-list">
            {reports.map((report) => (
              <div 
                key={report._id} 
                className="report-history-row card stagger-item"
                onClick={() => setSelectedReport(report)}
              >
                <div className="report-row-main">
                  <div className="report-row-info">
                    <span className="report-row-date">
                      <Calendar size={14} />
                      {formatDate(report.createdAt)}
                    </span>
                    <h4>{report.title || 'Career Profile Assessment'}</h4>
                    <p className="report-row-jd">
                      <Briefcase size={14} />
                      {report.jobDescription ? (
                        report.jobDescription.length > 60 
                          ? `${report.jobDescription.substring(0, 60)}...` 
                          : report.jobDescription
                      ) : 'General Profile'}
                    </p>
                  </div>
                </div>
                
                <div className="report-row-actions">
                  <div className="report-row-score">
                    <span className="score-lbl">Match</span>
                    <span className="score-val">{report.matchScore}%</span>
                  </div>
                  <button className="view-report-inline-btn" title="View Full Report">
                    <Eye size={18} />
                    <span>View</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
