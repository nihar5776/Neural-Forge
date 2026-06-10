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
        {/* Repeating brick outer wrapper */}
        <div style={{
          background: 'repeating-linear-gradient(90deg, #b03a00, #b03a00 24px, #000000 24px, #000000 26px), repeating-linear-gradient(0deg, #b03a00, #b03a00 16px, #000000 16px, #000000 18px)',
          border: '3px solid #000000',
          padding: '16px',
          boxShadow: '8px 8px 0px #000000',
          marginTop: '24px'
        }}>
          {/* Black panel with yellowish brick border */}
          <div style={{
            background: '#000000',
            border: '6px double #fbd000', // Yellow retro double border
            padding: '24px 16px',
            fontFamily: 'monospace',
            color: '#ffffff'
          }}>
            {/* Header: SUPER PLAYER'S with animated Mario / Luigi SVGs */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              {/* Mario 8-bit SVG */}
              <svg width="28" height="28" viewBox="0 0 12 12" style={{ transform: 'scaleX(-1)' }}>
                <rect x="3" y="1" width="6" height="2" fill="#e52521"/>
                <rect x="4" y="2" width="7" height="1" fill="#e52521"/>
                <rect x="4" y="3" width="5" height="3" fill="#fcb494"/>
                <rect x="3" y="4" width="1" height="2" fill="#fcb494"/>
                <rect x="7" y="3" width="1" height="1" fill="#000"/>
                <rect x="6" y="4" width="3" height="1" fill="#4a2306"/>
                <rect x="3" y="6" width="6" height="4" fill="#e52521"/>
                <rect x="4" y="6" width="4" height="4" fill="#002fbe"/>
                <rect x="2" y="7" width="1" height="2" fill="#e52521"/>
                <rect x="9" y="7" width="1" height="2" fill="#e52521"/>
              </svg>

              <h3 style={{
                fontFamily: 'monospace',
                fontWeight: '900',
                fontSize: '22px',
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                margin: 0,
                textShadow: '3px 3px 0px #000000',
                WebkitTextStroke: '0.5px #000'
              }}>
                SUPER PLAYER'S
              </h3>

              {/* Luigi 8-bit SVG */}
              <svg width="28" height="28" viewBox="0 0 12 12">
                <rect x="3" y="1" width="6" height="2" fill="#43b047"/>
                <rect x="4" y="2" width="7" height="1" fill="#43b047"/>
                <rect x="4" y="3" width="5" height="3" fill="#fcb494"/>
                <rect x="3" y="4" width="1" height="2" fill="#fcb494"/>
                <rect x="7" y="3" width="1" height="1" fill="#000"/>
                <rect x="6" y="4" width="3" height="1" fill="#4a2306"/>
                <rect x="3" y="6" width="6" height="4" fill="#43b047"/>
                <rect x="4" y="6" width="4" height="4" fill="#002fbe"/>
                <rect x="2" y="7" width="1" height="2" fill="#43b047"/>
                <rect x="9" y="7" width="1" height="2" fill="#43b047"/>
              </svg>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '12px' }}>
                <RefreshCw className="spinner" size={28} style={{ color: '#fbd000' }} />
                <p style={{ color: '#fff', fontSize: '13px' }}>LOADING GAME RECORDS...</p>
              </div>
            ) : reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <p style={{ color: '#fbd000', fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>NO SCORE ENTRIES YET</p>
                <p style={{ fontSize: '12px', color: '#ccc', marginBottom: '20px' }}>Upload a resume to set your first score on the high score board!</p>
                <Link to="/upload" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                  Forge First Score
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {reports.slice(0, 10).map((report, index) => {
                  const rank = index + 1;
                  // Color highlights: Green for top 3, white/grey for lower ranks
                  const rankColor = rank <= 3 ? '#43b047' : '#ffffff';
                  const nameColor = rank <= 3 ? '#43b047' : '#ffffff';
                  const stageColor = '#00f0ff'; // cyan/blue stage
                  const scoreColor = '#ffffff'; // white scores

                  const getStageName = (score) => {
                    if (score >= 90) return '8W-4';
                    if (score >= 80) return '6W-1';
                    if (score >= 70) return '5W-4';
                    if (score >= 60) return '3W-4';
                    if (score >= 50) return '2W-1';
                    return '1W-1';
                  };

                  // Clean title to simulate a 3-letter or 8-letter candidate tag
                  const candidateTag = report.title 
                    ? report.title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase().padEnd(8, ' ')
                    : 'RESUME  ';

                  return (
                    <div 
                      key={report._id}
                      onClick={() => setSelectedReport(report)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        background: 'transparent',
                        borderBottom: '1px dashed #333333',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#222222';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {/* Left: Rank & Candidate tag */}
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ color: rankColor, width: '28px', fontSize: '15px' }}>
                          {String(rank).padEnd(2, ' ')}
                        </span>
                        <span style={{ color: nameColor, fontSize: '15px', letterSpacing: '1px' }}>
                          {candidateTag}
                        </span>
                      </div>
                      
                      {/* Right: Stage & Score */}
                      <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
                        <span style={{ color: stageColor, fontSize: '15px', letterSpacing: '1px' }}>
                          {getStageName(report.matchScore)}
                        </span>
                        <span style={{ color: scoreColor, fontSize: '15px', letterSpacing: '1px' }}>
                          {String((report.matchScore || 0) * 1000).padStart(6, '0')} ({report.matchScore || 0}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
