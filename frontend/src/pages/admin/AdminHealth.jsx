import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { 
  Activity, Server, Database, Sparkles, RefreshCw, 
  AlertTriangle, Clock, ShieldCheck, HeartPulse 
} from 'lucide-react';
import '../../admin.css';

export default function AdminHealth() {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHealth = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/admin/health');
      setHealthData(res.data || []);
    } catch (err) {
      console.error('Error fetching system health telemetry:', err);
      setError(err.message || 'Failed to retrieve system health.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const formatUptime = (seconds) => {
    if (seconds === null || seconds === undefined) return 'N/A (SaaS Provider)';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  };

  const getServiceIcon = (name) => {
    switch (name) {
      case 'backend':
        return <Server size={20} />;
      case 'mongodb':
        return <Database size={20} />;
      case 'gemini':
      case 'groq':
        return <Sparkles size={20} />;
      default:
        return <Activity size={20} />;
    }
  };

  const getServiceTitle = (name) => {
    switch (name) {
      case 'backend':
        return 'Express Backend API';
      case 'mongodb':
        return 'MongoDB Database';
      case 'gemini':
        return 'Google Gemini API';
      case 'groq':
        return 'Groq Llama/Whisper API';
      default:
        return name.toUpperCase();
    }
  };

  return (
    <div className="admin-container animate-fade-in">
      <div className="admin-header">
        <div>
          <h1>System Diagnostics</h1>
          <p>Real-time heartbeats, database status, event loop delay, and AI connection latencies</p>
        </div>
        <button 
          onClick={fetchHealth} 
          className="pagination-btn" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
          disabled={loading}
        >
          <RefreshCw className={loading ? 'spinner' : ''} size={16} />
          <span>Trigger Diagnostics Check</span>
        </button>
      </div>

      {error && (
        <div className="auth-error-alert" style={{ marginBottom: '20px' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading && healthData.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <RefreshCw className="spinner" size={36} style={{ color: 'var(--admin-primary)' }} />
            <p style={{ marginTop: '12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Executing health checks...</p>
          </div>
        </div>
      ) : (
        <div className="health-grid">
          {healthData.map(svc => (
            <div key={svc.service} className="health-card">
              <div className="health-status-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="kpi-icon-wrapper" style={{ margin: 0, width: '32px', height: '32px', borderRadius: '8px', backgroundColor: svc.status === 'healthy' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: svc.status === 'healthy' ? 'var(--admin-success)' : 'var(--admin-danger)' }}>
                    {getServiceIcon(svc.service)}
                  </div>
                  <h3 style={{ fontSize: '15px' }}>{getServiceTitle(svc.service)}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: svc.status === 'healthy' ? 'var(--admin-success)' : 'var(--admin-danger)' }}>
                    {svc.status === 'healthy' ? 'Healthy' : 'Outage'}
                  </span>
                  <span className={`pulsate-dot ${svc.status === 'healthy' ? 'healthy' : 'unhealthy'}`}></span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                <div className="health-metric-row">
                  <span className="health-metric-lbl">Ping Response</span>
                  <span className="health-metric-val">{svc.responseTimeMs} ms</span>
                </div>

                {/* Horizontal latency bar */}
                <div style={{ width: '100%', height: '4px', backgroundColor: '#f1f5f9', borderRadius: '2px', marginTop: '4px', marginBottom: '12px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${Math.min((svc.responseTimeMs / 1000) * 100, 100)}%`, 
                      backgroundColor: svc.responseTimeMs > 400 ? 'var(--admin-warning)' : 'var(--admin-success)',
                      borderRadius: '2px',
                      transition: 'width 0.4s ease'
                    }}
                  ></div>
                </div>

                <div className="health-metric-row">
                  <span className="health-metric-lbl">Active Uptime</span>
                  <span className="health-metric-val" style={{ fontSize: '12px' }}>{formatUptime(svc.uptime)}</span>
                </div>

                <div className="health-metric-row">
                  <span className="health-metric-lbl">Rolling Uptime SLA (24h)</span>
                  <span className="health-metric-val" style={{ color: 'var(--admin-primary)' }}>
                    {svc.rollingUptimeSla.toFixed(2)}%
                  </span>
                </div>

                <div className="health-metric-row">
                  <span className="health-metric-lbl">Last Check Clocked</span>
                  <span className="health-metric-val" style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>
                    {new Date(svc.lastCheckedAt).toLocaleTimeString()}
                  </span>
                </div>

                {svc.error && (
                  <div className="auth-error-alert" style={{ marginTop: '12px', padding: '8px 12px', borderRadius: '8px', fontSize: '11px' }}>
                    <strong>Outage Detail:</strong> {svc.error}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Diagnostics explanation card */}
      <div className="table-card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <HeartPulse size={36} style={{ color: 'var(--admin-primary)', opacity: 0.8 }} />
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700 }}>Telemetry Status & Cron Polling</h4>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--admin-text-muted)', lineHeight: '1.5' }}>
            A background checking worker automatically polls all services every 5 minutes to write statistics to MongoDB. The 24-hour SLA computes the rolling success percentage of these background heartbeats.
          </p>
        </div>
      </div>
    </div>
  );
}
