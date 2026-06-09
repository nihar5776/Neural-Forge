import React from 'react';
import { Plus, Trash2, User, Briefcase, GraduationCap, Code, FileText } from 'lucide-react';

export default function ResumeEditor({ data, onChange }) {
  if (!data) return null;

  const handleChange = (section, field, value) => {
    if (section === 'personalInfo') {
      onChange({ ...data, personalInfo: { ...data.personalInfo, [field]: value } });
    } else {
      onChange({ ...data, [section]: value });
    }
  };

  const handleArrayChange = (section, index, field, value) => {
    const newArray = [...data[section]];
    if (field === 'responsibilities' || field === 'technologies') {
      newArray[index][field] = value.split('\n').filter(item => item.trim() !== '');
    } else {
      newArray[index][field] = value;
    }
    onChange({ ...data, [section]: newArray });
  };

  const addArrayItem = (section, emptyItem) => {
    const newArray = [...(data[section] || []), emptyItem];
    onChange({ ...data, [section]: newArray });
  };

  const removeArrayItem = (section, index) => {
    const newArray = [...data[section]];
    newArray.splice(index, 1);
    onChange({ ...data, [section]: newArray });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Personal Info */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: 'hsl(var(--primary))' }}>
          <User size={20} /> Personal Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label className="section-label" style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Full Name</label>
            <input type="text" value={data.personalInfo.name || ''} onChange={(e) => handleChange('personalInfo', 'name', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))' }} />
          </div>
          <div>
            <label className="section-label" style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Email Address</label>
            <input type="email" value={data.personalInfo.email || ''} onChange={(e) => handleChange('personalInfo', 'email', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))' }} />
          </div>
          <div>
            <label className="section-label" style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Phone Number</label>
            <input type="text" value={data.personalInfo.phone || ''} onChange={(e) => handleChange('personalInfo', 'phone', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))' }} />
          </div>
          <div>
            <label className="section-label" style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Location</label>
            <input type="text" value={data.personalInfo.location || ''} onChange={(e) => handleChange('personalInfo', 'location', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))' }} />
          </div>
          <div>
            <label className="section-label" style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>LinkedIn</label>
            <input type="text" value={data.personalInfo.linkedin || ''} onChange={(e) => handleChange('personalInfo', 'linkedin', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))' }} />
          </div>
          <div>
            <label className="section-label" style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>GitHub / Portfolio</label>
            <input type="text" value={data.personalInfo.github || ''} onChange={(e) => handleChange('personalInfo', 'github', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))' }} />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: 'hsl(var(--primary))' }}>
          <FileText size={20} /> Professional Summary
        </h3>
        <textarea 
          rows={5} 
          value={data.summary || ''} 
          onChange={(e) => handleChange('summary', null, e.target.value)}
          style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))', fontFamily: 'inherit', lineHeight: '1.5' }}
        />
      </div>

      {/* Skills */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', color: 'hsl(var(--primary))' }}>
          <Code size={20} /> Skills
        </h3>
        <p style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', marginBottom: '1rem' }}>Separate skills with commas</p>
        <textarea 
          rows={3} 
          value={(data.skills || []).join(', ')} 
          onChange={(e) => handleChange('skills', null, e.target.value.split(',').map(s => s.trim()).filter(s => s))}
          style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))', fontFamily: 'inherit', lineHeight: '1.5' }}
        />
      </div>

      {/* Experience */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'hsl(var(--primary))', margin: 0 }}>
            <Briefcase size={20} /> Experience
          </h3>
          <button type="button" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => addArrayItem('experience', { title: '', company: '', duration: '', responsibilities: [] })}>
            <Plus size={16} /> Add Role
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {(data.experience || []).map((exp, i) => (
            <div key={i} style={{ padding: '1.5rem', border: '1px solid hsl(var(--border-color))', borderRadius: '12px', position: 'relative', background: 'hsl(var(--bg-app))' }}>
              <button type="button" onClick={() => removeArrayItem('experience', i)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'hsl(var(--danger-light))', border: 'none', color: 'hsl(var(--danger))', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', paddingRight: '40px' }}>
                <div>
                  <label className="section-label" style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Job Title</label>
                  <input type="text" value={exp.title} onChange={(e) => handleArrayChange('experience', i, 'title', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))' }} />
                </div>
                <div>
                  <label className="section-label" style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Company</label>
                  <input type="text" value={exp.company} onChange={(e) => handleArrayChange('experience', i, 'company', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="section-label" style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Duration</label>
                  <input type="text" value={exp.duration} onChange={(e) => handleArrayChange('experience', i, 'duration', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="section-label" style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Responsibilities (One per line)</label>
                  <textarea 
                    rows={4} 
                    value={(exp.responsibilities || []).join('\n')} 
                    onChange={(e) => handleArrayChange('experience', i, 'responsibilities', e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))', fontFamily: 'inherit', lineHeight: '1.5' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'hsl(var(--primary))', margin: 0 }}>
            <Code size={20} /> Projects
          </h3>
          <button type="button" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => addArrayItem('projects', { title: '', description: '', technologies: [], link: '' })}>
            <Plus size={16} /> Add Project
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {(data.projects || []).map((proj, i) => (
            <div key={i} style={{ padding: '1.5rem', border: '1px solid hsl(var(--border-color))', borderRadius: '12px', position: 'relative', background: 'hsl(var(--bg-app))' }}>
              <button type="button" onClick={() => removeArrayItem('projects', i)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'hsl(var(--danger-light))', border: 'none', color: 'hsl(var(--danger))', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingRight: '40px' }}>
                <div>
                  <label className="section-label" style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Project Title</label>
                  <input type="text" value={proj.title} onChange={(e) => handleArrayChange('projects', i, 'title', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))' }} />
                </div>
                <div>
                  <label className="section-label" style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Link</label>
                  <input type="text" value={proj.link || ''} onChange={(e) => handleArrayChange('projects', i, 'link', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="section-label" style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Technologies (Comma Separated)</label>
                  <input type="text" value={(proj.technologies || []).join(', ')} onChange={(e) => handleArrayChange('projects', i, 'technologies', e.target.value.split(',').join('\n'))} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="section-label" style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Description</label>
                  <textarea 
                    rows={3} 
                    value={proj.description} 
                    onChange={(e) => handleArrayChange('projects', i, 'description', e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))', fontFamily: 'inherit', lineHeight: '1.5' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'hsl(var(--primary))', margin: 0 }}>
            <GraduationCap size={20} /> Education
          </h3>
          <button type="button" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => addArrayItem('education', { degree: '', institution: '', year: '' })}>
            <Plus size={16} /> Add Degree
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {(data.education || []).map((edu, i) => (
            <div key={i} style={{ padding: '1.5rem', border: '1px solid hsl(var(--border-color))', borderRadius: '12px', position: 'relative', background: 'hsl(var(--bg-app))', display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <button type="button" onClick={() => removeArrayItem('education', i)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'hsl(var(--danger-light))', border: 'none', color: 'hsl(var(--danger))', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
              <div style={{ paddingRight: '40px' }}>
                <label className="section-label" style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Degree / Major</label>
                <input type="text" value={edu.degree} onChange={(e) => handleArrayChange('education', i, 'degree', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))' }} />
              </div>
              <div style={{ paddingRight: '40px' }}>
                <label className="section-label" style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Institution</label>
                <input type="text" value={edu.institution} onChange={(e) => handleArrayChange('education', i, 'institution', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))' }} />
              </div>
              <div style={{ paddingRight: '40px' }}>
                <label className="section-label" style={{ fontSize: '12px', color: 'hsl(var(--text-muted))' }}>Year / Duration</label>
                <input type="text" value={edu.year} onChange={(e) => handleArrayChange('education', i, 'year', e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--border-color))' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
