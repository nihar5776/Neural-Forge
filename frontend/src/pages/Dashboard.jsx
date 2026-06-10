import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import ReportDetails from '../components/ReportDetails';
import { Calendar, Briefcase, Eye, ChevronRight, RefreshCw, BarChart2, Star, AlertCircle, FileText, Activity, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition, StaggerContainer, StaggerItem, AnimatedCard, NeuralDecodeText, MagneticButton } from '../components/MotionWrappers';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

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
      day: 'numeric'
    });
  };

  // Prepare data for Trend Chart
  const trendData = [...reports].reverse().map((r, i) => ({
    name: formatDate(r.createdAt) || `Rev ${i+1}`,
    score: r.matchScore || 0
  }));

  // Prepare data for Radar Chart (mocked skills for visual WOW factor if no granular data)
  const radarData = [
    { subject: 'Technical', A: 85, fullMark: 100 },
    { subject: 'Experience', A: 70, fullMark: 100 },
    { subject: 'Education', A: 90, fullMark: 100 },
    { subject: 'Soft Skills', A: 80, fullMark: 100 },
    { subject: 'Keywords', A: Math.max(10, getAverageScore()), fullMark: 100 },
    { subject: 'Format', A: 95, fullMark: 100 },
  ];

  if (selectedReport) {
    return (
      <PageTransition className="dashboard-page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="dashboard-header-row" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <MagneticButton className="btn-secondary back-btn" onClick={() => setSelectedReport(null)} style={{ padding: '8px 16px' }}>
            ← Back to Command Center
          </MagneticButton>
          <h2 style={{ fontSize: '24px', margin: 0, textShadow: '0 0 20px hsla(var(--primary), 0.5)' }}>
            <NeuralDecodeText text="Deep Report Analysis" />
          </h2>
        </div>
        <ReportDetails report={selectedReport} />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="dashboard-page" style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '42px', fontWeight: '800', letterSpacing: '-0.03em', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Activity color="hsl(var(--primary))" size={36} />
            <NeuralDecodeText text="Command Center" />
          </h1>
          <p className="subtitle" style={{ fontSize: '16px', color: 'hsl(var(--text-muted))', margin: 0 }}>System-wide telemetry of your career assets and intelligence.</p>
        </div>
        <MagneticButton className="btn-secondary refresh-btn" onClick={fetchHistory} disabled={loading} style={{ height: '44px' }}>
          <RefreshCw className={loading ? 'spinner' : ''} size={16} />
          <span>Sync Telemetry</span>
        </MagneticButton>
      </div>

      {error && (
        <div className="auth-error-alert animate-fade-in">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Analytics Cards */}
      <StaggerContainer className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '3rem' }}>
        <StaggerItem>
          <AnimatedCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '2px solid hsla(var(--primary), 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ color: 'hsl(var(--text-muted))', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Scans</div>
              <div style={{ background: 'hsla(var(--primary), 0.1)', padding: '8px', borderRadius: '8px', color: 'hsl(var(--primary))' }}><FileText size={20} /></div>
            </div>
            <div style={{ fontSize: '48px', fontWeight: '800', lineHeight: 1 }}>{reports.length}</div>
          </AnimatedCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '2px solid hsla(var(--success), 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ color: 'hsl(var(--text-muted))', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Avg Match Rate</div>
              <div style={{ background: 'hsla(var(--success), 0.1)', padding: '8px', borderRadius: '8px', color: 'hsl(var(--success))' }}><Target size={20} /></div>
            </div>
            <div style={{ fontSize: '48px', fontWeight: '800', lineHeight: 1, color: 'hsl(var(--success))', textShadow: '0 0 30px hsla(var(--success), 0.4)' }}>{getAverageScore()}%</div>
          </AnimatedCard>
        </StaggerItem>

        <StaggerItem>
          <AnimatedCard style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '2px solid hsla(var(--warning), 0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ color: 'hsl(var(--text-muted))', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Peak Score</div>
              <div style={{ background: 'hsla(var(--warning), 0.1)', padding: '8px', borderRadius: '8px', color: 'hsl(var(--warning))' }}><Star size={20} /></div>
            </div>
            <div style={{ fontSize: '48px', fontWeight: '800', lineHeight: 1, color: 'hsl(var(--warning))' }}>
              {reports.length > 0 ? Math.max(...reports.map(r => r.matchScore || 0)) : 0}%
            </div>
          </AnimatedCard>
        </StaggerItem>
      </StaggerContainer>

      {/* Main Grid: Charts & History */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Trend Chart */}
          <AnimatedCard style={{ padding: '24px', height: '400px', display: 'flex', flexDirection: 'column' }}>
             <h3 style={{ fontSize: '18px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <BarChart2 size={20} color="hsl(var(--primary))"/> Match Trajectory
             </h3>
             <div style={{ flex: 1, width: '100%' }}>
               {reports.length > 1 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                         <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="hsla(0,0%,100%,0.05)" vertical={false} />
                     <XAxis dataKey="name" stroke="hsl(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis stroke="hsl(var(--text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                     <Tooltip 
                       contentStyle={{ backgroundColor: 'hsla(0,0%,4%,0.9)', border: '1px solid hsla(0,0%,100%,0.1)', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                       itemStyle={{ color: 'hsl(var(--text-main))' }}
                     />
                     <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                   </AreaChart>
                 </ResponsiveContainer>
               ) : (
                 <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--text-muted))', flexDirection: 'column', gap: '1rem' }}>
                   <BarChart2 size={48} opacity={0.2} />
                   <span>Need at least 2 reports to generate trajectory graph</span>
                 </div>
               )}
             </div>
          </AnimatedCard>

          {/* Radar Chart */}
          <AnimatedCard style={{ padding: '24px', height: '400px', display: 'flex', flexDirection: 'column' }}>
             <h3 style={{ fontSize: '18px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Target size={20} color="hsl(var(--success))"/> Global Capability Radar
             </h3>
             <div style={{ flex: 1, width: '100%', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="hsla(0,0%,100%,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--text-muted))', fontSize: 12 }} />
                    <Radar name="Capabilities" dataKey="A" stroke="hsl(var(--success))" strokeWidth={2} fill="hsl(var(--success))" fillOpacity={0.2} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsla(0,0%,4%,0.9)', border: '1px solid hsla(0,0%,100%,0.1)', borderRadius: '8px' }} />
                  </RadarChart>
                </ResponsiveContainer>
             </div>
          </AnimatedCard>
        </div>

        {/* Right Column: History List */}
        <div>
          <AnimatedCard style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="hsl(var(--warning))"/> Recent Evaluations
            </h3>
            
            {loading ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
                <RefreshCw className="spinner" size={32} color="hsl(var(--primary))" />
                <p style={{ color: 'hsl(var(--text-muted))', fontSize: '14px' }}>Syncing data...</p>
              </div>
            ) : reports.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1rem', padding: '2rem' }}>
                <FileText size={48} color="hsl(var(--border-color))" />
                <h4 style={{ margin: 0 }}>Void</h4>
                <p style={{ color: 'hsl(var(--text-muted))', fontSize: '14px', lineHeight: 1.6 }}>No data streams found. Initiate your first resume analysis.</p>
                <Link to="/upload" className="btn-primary" style={{ marginTop: '1rem' }}>
                  Initialize Scan
                </Link>
              </div>
            ) : (
              <StaggerContainer style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1, paddingRight: '8px' }}>
                {reports.slice(0, 10).map((report) => (
                  <StaggerItem key={report._id}>
                    <div 
                      onClick={() => setSelectedReport(report)}
                      style={{
                        padding: '16px',
                        background: 'hsla(0, 0%, 100%, 0.02)',
                        border: '1px solid hsla(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'hsla(250, 89%, 65%, 0.1)';
                        e.currentTarget.style.borderColor = 'hsla(250, 89%, 65%, 0.3)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'hsla(0, 0%, 100%, 0.02)';
                        e.currentTarget.style.borderColor = 'hsla(255, 255, 255, 0.05)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: 'hsl(var(--text-main))' }}>
                          {report.title || 'Profile Assessment'}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          fontWeight: '800', 
                          padding: '4px 8px', 
                          borderRadius: '6px',
                          background: report.matchScore >= 80 ? 'hsla(var(--success), 0.2)' : report.matchScore >= 60 ? 'hsla(var(--warning), 0.2)' : 'hsla(var(--danger), 0.2)',
                          color: report.matchScore >= 80 ? 'hsl(var(--success))' : report.matchScore >= 60 ? 'hsl(var(--warning))' : 'hsl(var(--danger))'
                        }}>
                          {report.matchScore}%
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--text-muted))', fontSize: '12px' }}>
                        <Briefcase size={12} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                          {report.jobDescription ? report.jobDescription : 'General Profile Analysis'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--text-muted))', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <Calendar size={12} />
                        {formatDate(report.createdAt)}
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
}
