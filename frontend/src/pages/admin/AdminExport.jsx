import React from 'react';
import { 
  Users, FileText, ClipboardList, MessageSquare, Sparkles, 
  FileSpreadsheet, Download, ShieldCheck, AlertCircle 
} from 'lucide-react';
import '../../admin.css';

export default function AdminExport() {
  const BASE_URL = 'http://localhost:3000/api/admin/export';

  const exportCategories = [
    {
      title: 'Users Directory',
      description: 'Export all registered accounts including metadata like registration timestamp, last active activity, status, and system role.',
      endpoint: '/users',
      icon: <Users size={22} />,
      badgeColor: 'kpi-blue'
    },
    {
      title: 'ATS Match Reports',
      description: 'Export parsed resume analyses containing job description details, match scores, resume filename, and user association references.',
      endpoint: '/ats',
      icon: <FileText size={22} />,
      badgeColor: 'kpi-green'
    },
    {
      title: 'Mock Interview Sessions',
      description: 'Export mock interview runs containing job role targets, difficulty levels, scores (overall, technical, communication), and status.',
      endpoint: '/interviews',
      icon: <MessageSquare size={22} />,
      badgeColor: 'kpi-purple'
    },
    {
      title: 'AI Analytics Log Ledger',
      description: 'Export complete historical analytics logs tracking LLM provider (Gemini/Groq), tokens used, response round-trip latencies, success codes, and error traces.',
      endpoint: '/analytics',
      icon: <Sparkles size={22} />,
      badgeColor: 'kpi-orange'
    }
  ];

  return (
    <div className="admin-container animate-fade-in">
      <div className="admin-header">
        <div>
          <h1>Export Reports</h1>
          <p>Export database directories in CSV, Microsoft Excel (.xlsx), or Adobe PDF formats</p>
        </div>
      </div>

      <div className="export-grid">
        {exportCategories.map(cat => (
          <div key={cat.title} className="export-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div className={`kpi-icon-wrapper ${cat.badgeColor}`} style={{ margin: 0, width: '40px', height: '40px', borderRadius: '10px' }}>
                {cat.icon}
              </div>
              <h3 style={{ margin: 0, fontSize: '16px' }}>{cat.title}</h3>
            </div>
            
            <p>{cat.description}</p>
            
            <div className="export-actions">
              <a 
                href={`${BASE_URL}${cat.endpoint}?format=csv`}
                download
                className="btn-export btn-export-csv"
                style={{ textDecoration: 'none' }}
              >
                <Download size={14} />
                <span>Download CSV</span>
              </a>

              <a 
                href={`${BASE_URL}${cat.endpoint}?format=xlsx`}
                download
                className="btn-export btn-export-xlsx"
                style={{ textDecoration: 'none' }}
              >
                <FileSpreadsheet size={14} />
                <span>Download Excel Sheet</span>
              </a>

              <a 
                href={`${BASE_URL}${cat.endpoint}?format=pdf`}
                download
                className="btn-export btn-export-pdf"
                style={{ textDecoration: 'none' }}
              >
                <FileText size={14} />
                <span>Download PDF Report</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="table-card" style={{ padding: '20px', marginTop: '28px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <ShieldCheck size={36} style={{ color: 'var(--admin-success)', opacity: 0.8 }} />
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700 }}>Data Streams & Memory Performance</h4>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--admin-text-muted)', lineHeight: '1.5' }}>
            Exports query and compile rows dynamically using database cursor buffers, writing chunks directly to the response download. Large records are streamed efficiently without causing high memory consumption on the server.
          </p>
        </div>
      </div>
    </div>
  );
}
