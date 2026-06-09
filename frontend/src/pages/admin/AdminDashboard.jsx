import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { 
  Users, FileText, ClipboardList, MessageSquare, Briefcase, 
  Percent, Clock, DollarSign, RefreshCw, AlertCircle, Sparkles, TrendingUp
} from 'lucide-react';
import '../../admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [aiStats, setAiStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, aiData] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/analytics')
      ]);
      setStats(statsData.data || null);
      setAiStats(aiData.data || null);
    } catch (err) {
      console.error('Error fetching admin dashboard metrics:', err);
      setError(err.message || 'Failed to retrieve dashboard stats. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="admin-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw className="spinner" size={40} style={{ color: 'var(--admin-primary)' }} />
          <p style={{ marginTop: '12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Loading admin metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="auth-error-alert" style={{ margin: '40px 0', padding: '20px', borderRadius: '12px' }}>
          <AlertCircle size={24} style={{ marginRight: '12px' }} />
          <div>
            <h4 style={{ margin: 0, fontWeight: 700 }}>Access Error</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Fallbacks if stats fail to load
  const totalUsers = stats?.totalUsers || 0;
  const activeUsers = stats?.activeUsers || 0;
  const newUsersThisWeek = stats?.newUsersThisWeek || 0;
  const resumeAnalysesCount = stats?.resumeAnalysesCount || 0;
  const mockInterviewsCount = stats?.mockInterviewsCount || 0;
  const quizAttemptsCount = stats?.quizAttemptsCount || 0;
  const jobSearchesCount = stats?.jobSearchesCount || 0;
  const averageAtsScore = stats?.averageAtsScore || 0;

  // Dynamic engagement trend chart preparation
  const trendData = stats?.activityTrend && stats.activityTrend.length > 0
    ? stats.activityTrend
    : [
        { day: 'Mon', count: 0 },
        { day: 'Tue', count: 0 },
        { day: 'Wed', count: 0 },
        { day: 'Thu', count: 0 },
        { day: 'Fri', count: 0 },
        { day: 'Sat', count: 0 },
        { day: 'Sun', count: 0 }
      ];

  const maxCount = Math.max(...trendData.map(d => d.count), 0);
  const scaleFactor = Math.max(maxCount, 5);
  const divisor = trendData.length > 1 ? trendData.length - 1 : 1;
  const points = trendData.map((d, i) => {
    const x = 40 + i * (440 / divisor);
    const y = 170 - (d.count / scaleFactor) * 150;
    return { x, y, day: d.day, count: d.count };
  });

  const yMaxLabel = maxCount > 0 ? maxCount : 5;
  const yMedLabel = maxCount > 0 ? Math.round(maxCount / 2) : 2;
  const yLowLabel = 0;

  const getControlPoints = (p0, p1, p2, p3, t = 0.15) => {
    const cp1x = p1.x + (p2.x - p0.x) * t;
    const cp1y = p1.y + (p2.y - p0.y) * t;
    const cp2x = p2.x - (p3.x - p1.x) * t;
    const cp2y = p2.y - (p3.y - p1.y) * t;
    return [
      Math.max(40, Math.min(480, cp1x)),
      Math.max(20, Math.min(170, cp1y)),
      Math.max(40, Math.min(480, cp2x)),
      Math.max(20, Math.min(170, cp2y))
    ];
  };

  let linePath = '';
  let fillPath = '';

  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const p0 = points[i - 1] || p1;
      const p3 = points[i + 2] || p2;
      const [cp1x, cp1y, cp2x, cp2y] = getControlPoints(p0, p1, p2, p3);
      linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    fillPath = `M ${points[0].x} 170 L ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      const p0 = points[i - 1] || p1;
      const p3 = points[i + 2] || p2;
      const [cp1x, cp1y, cp2x, cp2y] = getControlPoints(p0, p1, p2, p3);
      fillPath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    fillPath += ` L ${points[points.length - 1].x} 170 Z`;
  }

  // AI details
  const totalGemini = typeof aiStats?.totalGeminiRequests === 'number' ? aiStats.totalGeminiRequests : 0;
  const totalGroq = typeof aiStats?.totalGroqRequests === 'number' ? aiStats.totalGroqRequests : 0;
  const totalAiRequests = totalGemini + totalGroq;
  const successRate = typeof aiStats?.successRate === 'number' ? Number(aiStats.successRate.toFixed(1)) : 100;
  const failedAiRequests = typeof aiStats?.failedRequests === 'number' ? aiStats.failedRequests : 0;
  const averageLatency = typeof aiStats?.averageLatency === 'number' ? Math.round(aiStats.averageLatency) : 0;
  const estimatedCost = typeof aiStats?.estimatedCost === 'number' ? aiStats.estimatedCost : 0.0000;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1>Admin Overview</h1>
          <p>Real-time system statistics and usage analytics</p>
        </div>
        <button 
          onClick={fetchDashboardData} 
          className="pagination-btn" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
        >
          <RefreshCw size={16} />
          <span>Refresh Stats</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid animate-fade-in">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-blue">
            <Users size={22} />
          </div>
          <div className="kpi-title">Total Accounts</div>
          <div className="kpi-value">{totalUsers}</div>
          <div className="kpi-footer">
            <TrendingUp size={14} style={{ color: 'var(--admin-success)' }} />
            <span style={{ color: 'var(--admin-success)', fontWeight: 600 }}>+{newUsersThisWeek}</span>
            <span>registered this week</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-green">
            <Users size={22} />
          </div>
          <div className="kpi-title">Active Users (30d)</div>
          <div className="kpi-value">{activeUsers}</div>
          <div className="kpi-footer">
            <span>Uptime activity:</span>
            <span style={{ fontWeight: 600, color: 'var(--admin-text-dark)' }}>
              {totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-orange">
            <FileText size={22} />
          </div>
          <div className="kpi-title">ATS Match Scans</div>
          <div className="kpi-value">{resumeAnalysesCount}</div>
          <div className="kpi-footer">
            <Percent size={14} />
            <span>Avg Match score:</span>
            <span style={{ fontWeight: 600, color: 'var(--admin-text-dark)' }}>{averageAtsScore}%</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-purple">
            <MessageSquare size={22} />
          </div>
          <div className="kpi-title">Mock Interviews</div>
          <div className="kpi-value">{mockInterviewsCount}</div>
          <div className="kpi-footer">
            <span>Total practice sessions completed</span>
          </div>
        </div>
      </div>

      {/* Second KPI row for AI Metrics */}
      <div className="kpi-grid animate-fade-in">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-blue">
            <Sparkles size={22} />
          </div>
          <div className="kpi-title">AI Requests (Gemini + Groq)</div>
          <div className="kpi-value">{totalAiRequests}</div>
          <div className="kpi-footer">
            <span>Gemini: {totalGemini} | Groq: {totalGroq}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-green">
            <Percent size={22} />
          </div>
          <div className="kpi-title">LLM Success Rate</div>
          <div className="kpi-value">{successRate}%</div>
          <div className="kpi-footer">
            <span style={{ color: failedAiRequests > 0 ? 'var(--admin-danger)' : 'var(--admin-success)' }}>
              {failedAiRequests} failed requests recorded
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-orange">
            <Clock size={22} />
          </div>
          <div className="kpi-title">Average Latency</div>
          <div className="kpi-value">{averageLatency} ms</div>
          <div className="kpi-footer">
            <span>API round-trip response time</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-red">
            <DollarSign size={22} />
          </div>
          <div className="kpi-title">Estimated Cost</div>
          <div className="kpi-value">${estimatedCost.toFixed(4)}</div>
          <div className="kpi-footer">
            <span>Calculated from token weightings</span>
          </div>
        </div>
      </div>

      {/* Charts Panel */}
      <div className="charts-grid animate-fade-in">
        {/* User Engagement SVG Line Chart */}
        <div className="chart-card">
          <h3>System Engagement Activity</h3>
          <div className="svg-chart-container">
            <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%' }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="170" x2="480" y2="170" stroke="#f1f5f9" strokeWidth="2" />
              
              {/* Gradient Area */}
              {fillPath && (
                <path 
                  d={fillPath} 
                  fill="url(#chartGradient)" 
                />
              )}
              
              {/* Main Line */}
              {linePath && (
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="#2563eb" 
                  strokeWidth="3.5" 
                  className="chart-line" 
                />
              )}

              {/* Data points */}
              {points.map((p, i) => (
                <g key={i} className="chart-point-group">
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="5" 
                    fill="#2563eb" 
                    stroke="#ffffff" 
                    strokeWidth="2" 
                    style={{ transition: 'all 0.3s ease' }}
                  />
                  {/* Tooltip / hover target */}
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="12" 
                    fill="transparent" 
                    className="hover-trigger"
                    style={{ cursor: 'pointer' }}
                  >
                    <title>{`${p.day}: ${p.count} activities`}</title>
                  </circle>
                </g>
              ))}

              {/* Axes Labels */}
              {points.map((p, i) => (
                <text key={i} x={p.x} y={190} fill="var(--admin-text-muted)" fontSize="10" textAnchor="middle">
                  {p.day}
                </text>
              ))}

              <text x="30" y="173" fill="var(--admin-text-muted)" fontSize="9" textAnchor="end">{yLowLabel}</text>
              <text x="30" y="95" fill="var(--admin-text-muted)" fontSize="9" textAnchor="end">{yMedLabel}</text>
              <text x="30" y="23" fill="var(--admin-text-muted)" fontSize="9" textAnchor="end">{yMaxLabel}</text>
            </svg>
          </div>
        </div>

        {/* AI Provider Distribution Donut Chart */}
        <div className="chart-card">
          <h3>AI Models Used</h3>
          <div className="svg-chart-container" style={{ position: 'relative' }}>
            {totalAiRequests === 0 ? (
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '13px' }}>No AI requests logged yet.</p>
            ) : (
              <>
                <svg viewBox="0 0 160 160" style={{ width: '130px', height: '130px' }}>
                  {/* Background Circle */}
                  <circle cx="80" cy="80" r="60" fill="none" stroke="#f1f5f9" strokeWidth="18" />
                  
                  {/* Gemini portion */}
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="60" 
                    fill="none" 
                    stroke="#2563eb" 
                    strokeWidth="18" 
                    strokeDasharray={`${(totalGemini / totalAiRequests) * 377} 377`}
                    transform="rotate(-90 80 80)"
                  />

                  {/* Center stats */}
                  <text x="80" y="77" fill="var(--admin-text-dark)" fontSize="14" fontWeight="800" textAnchor="middle">
                    {totalAiRequests}
                  </text>
                  <text x="80" y="94" fill="var(--admin-text-muted)" fontSize="8" fontWeight="600" textAnchor="middle">
                    Requests
                  </text>
                </svg>
                {/* Custom Legend */}
                <div style={{ position: 'absolute', bottom: '10px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '11px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'inline-block' }}></span>
                    <span>Gemini ({totalGemini})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'inline-block' }}></span>
                    <span>Groq ({totalGroq})</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Feature Usage Details Table */}
      <div className="table-card animate-fade-in">
        <div className="table-header-row">
          <h3>Interactive Modules Usage</h3>
        </div>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Module / Activity Type</th>
                <th>Global Run Metric</th>
                <th>Service Status Indicator</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Job Searches Run</strong></td>
                <td>{jobSearchesCount} searches recorded</td>
                <td><span className="badge badge-success">Healthy</span></td>
              </tr>
              <tr>
                <td><strong>Quiz Attempts Saved</strong></td>
                <td>{quizAttemptsCount} completions logged</td>
                <td><span className="badge badge-success">Healthy</span></td>
              </tr>
              <tr>
                <td><strong>Resume Tailor Requests</strong></td>
                <td>All tailoring requests saved in reports</td>
                <td><span className="badge badge-success">Healthy</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
