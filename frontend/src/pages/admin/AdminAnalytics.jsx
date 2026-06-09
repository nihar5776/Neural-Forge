import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { 
  Sparkles, Percent, Clock, DollarSign, RefreshCw, 
  AlertTriangle, CheckCircle, HelpCircle, FileSpreadsheet, FileText 
} from 'lucide-react';
import '../../admin.css';

export default function AdminAnalytics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/admin/analytics');
      setMetrics(res.data || null);
    } catch (err) {
      console.error('Error fetching AI analytics:', err);
      setError(err.message || 'Failed to retrieve AI Analytics metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="admin-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw className="spinner" size={40} style={{ color: 'var(--admin-primary)' }} />
          <p style={{ marginTop: '12px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>Loading AI analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="auth-error-alert" style={{ margin: '40px 0' }}>
          <AlertTriangle size={24} style={{ marginRight: '12px' }} />
          <div>
            <h4 style={{ margin: 0, fontWeight: 700 }}>Telemetry Error</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const totalGemini = typeof metrics?.totalGeminiRequests === 'number' ? metrics.totalGeminiRequests : 0;
  const totalGroq = typeof metrics?.totalGroqRequests === 'number' ? metrics.totalGroqRequests : 0;
  const totalRequests = totalGemini + totalGroq;
  const successRate = typeof metrics?.successRate === 'number' ? Number(metrics.successRate.toFixed(1)) : 100;
  const failedRequests = typeof metrics?.failedRequests === 'number' ? metrics.failedRequests : 0;
  const averageLatency = typeof metrics?.averageLatency === 'number' ? Math.round(metrics.averageLatency) : 0;
  const estimatedCost = typeof metrics?.estimatedCost === 'number' ? metrics.estimatedCost : 0.00000;

  return (
    <div className="admin-container animate-fade-in">
      <div className="admin-header">
        <div>
          <h1>AI Analytics Dashboard</h1>
          <p>Usage counts, provider distribution, SLA success, latencies, and token costs</p>
        </div>
        <button 
          onClick={fetchAnalytics} 
          className="pagination-btn" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} />
          <span>Sync Logs</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-blue">
            <Sparkles size={22} />
          </div>
          <div className="kpi-title">Gemini Requests</div>
          <div className="kpi-value">{totalGemini}</div>
          <div className="kpi-footer">
            <span>Primary fallback stack</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-purple">
            <Sparkles size={22} />
          </div>
          <div className="kpi-title">Groq Requests</div>
          <div className="kpi-value">{totalGroq}</div>
          <div className="kpi-footer">
            <span>Transcription / Llama stack</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-green">
            <Percent size={22} />
          </div>
          <div className="kpi-title">API Success Rate</div>
          <div className="kpi-value">{successRate}%</div>
          <div className="kpi-footer">
            <span style={{ color: failedRequests > 0 ? 'var(--admin-danger)' : 'var(--admin-success)', fontWeight: 600 }}>
              {failedRequests} outages logged
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-orange">
            <Clock size={22} />
          </div>
          <div className="kpi-title">Average Round-Trip</div>
          <div className="kpi-value">{averageLatency} ms</div>
          <div className="kpi-footer">
            <span>Average token delivery latency</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Cost Summary Card */}
        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3>Token Usage & SLA Cost</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '24px 0' }}>
              <span style={{ fontSize: '48px', fontWeight: 900, color: 'var(--admin-text-dark)', letterSpacing: '-0.03em' }}>
                ${estimatedCost.toFixed(5)}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--admin-text-muted)', fontWeight: 600 }}>USD</span>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--admin-text-muted)', lineHeight: '1.6', margin: 0 }}>
              Pricing calculations are aggregated using standard token models:
            </p>
            <ul style={{ fontSize: '12px', color: 'var(--admin-text-muted)', paddingLeft: '20px', marginTop: '8px', lineHeight: '1.8' }}>
              <li><strong>Gemini Flash</strong>: $0.075 / 1M Input | $0.30 / 1M Output</li>
              <li><strong>Groq Llama 3</strong>: $0.59 / 1M Input | $0.79 / 1M Output</li>
              <li><strong>Groq Whisper</strong>: $0.001 flat per voice transcription</li>
            </ul>
          </div>
          
          <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--admin-text-muted)' }}>
            <span>Billing cycle active</span>
            <span style={{ color: 'var(--admin-success)', fontWeight: 600 }}>Real-time updates</span>
          </div>
        </div>

        {/* Action Panel for raw exports */}
        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3>Raw Telemetry Logs Export</h3>
            <p style={{ fontSize: '13px', color: 'var(--admin-text-muted)', lineHeight: '1.6', margin: '8px 0 20px 0' }}>
              Export the raw, itemized history of all AI request logs. This report details prompt tokens, completion tokens, latency, features, and error traces.
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a 
              href="http://localhost:3000/api/admin/export/analytics?format=xlsx" 
              download 
              className="btn-export btn-export-xlsx"
              style={{ textDecoration: 'none' }}
            >
              <FileSpreadsheet size={16} />
              <span>Download Excel Ledger</span>
            </a>
            
            <a 
              href="http://localhost:3000/api/admin/export/analytics?format=pdf" 
              download 
              className="btn-export btn-export-pdf"
              style={{ textDecoration: 'none' }}
            >
              <FileText size={16} />
              <span>Download PDF Audit</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
