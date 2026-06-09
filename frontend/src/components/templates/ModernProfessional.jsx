import React from 'react';

export default function ModernProfessional({ data }) {
  if (!data) return null;

  return (
    <div style={{ padding: '2rem', background: '#fff', color: '#333', fontFamily: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif', lineHeight: '1.6' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem', fontWeight: 'bold', color: '#111', letterSpacing: '-0.5px' }}>{data.personalInfo.name}</h1>
        <p style={{ margin: 0, color: '#555', fontSize: '1rem' }}>
          {data.personalInfo.email} | {data.personalInfo.phone || ''} | {data.personalInfo.location || ''}
        </p>
        {(data.personalInfo.linkedin || data.personalInfo.github) && (
          <p style={{ margin: '0.25rem 0 0 0', color: '#555', fontSize: '0.9rem' }}>
            {data.personalInfo.linkedin && <a href={data.personalInfo.linkedin} style={{ color: '#0066cc', textDecoration: 'none' }}>LinkedIn</a>}
            {data.personalInfo.linkedin && data.personalInfo.github && ' • '}
            {data.personalInfo.github && <a href={data.personalInfo.github} style={{ color: '#0066cc', textDecoration: 'none' }}>GitHub</a>}
          </p>
        )}
      </div>

      {/* Summary */}
      {data.summary && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', borderBottom: '2px solid #e0e0e0', paddingBottom: '0.5rem', marginBottom: '0.75rem', color: '#222', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Professional Summary</h2>
          <p style={{ margin: 0 }}>{data.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', borderBottom: '2px solid #e0e0e0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#222', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Experience</h2>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#111' }}>{exp.title}</h3>
                <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>{exp.duration}</span>
              </div>
              <div style={{ fontSize: '1rem', color: '#444', fontWeight: '500', marginBottom: '0.5rem' }}>{exp.company}</div>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#333' }}>
                {exp.responsibilities.map((resp, j) => (
                  <li key={j} style={{ marginBottom: '0.3rem', paddingLeft: '0.25rem' }}>{resp}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', borderBottom: '2px solid #e0e0e0', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#222', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Projects</h2>
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600', color: '#111' }}>{proj.title}</h3>
                {proj.link && (
                  <a href={proj.link} style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: '#0066cc', textDecoration: 'none' }}>[Link]</a>
                )}
              </div>
              <p style={{ margin: '0 0 0.25rem 0' }}>{proj.description}</p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}><strong>Technologies:</strong> {proj.technologies.join(', ')}</p>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', borderBottom: '2px solid #e0e0e0', paddingBottom: '0.5rem', marginBottom: '0.75rem', color: '#222', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Education</h2>
          {data.education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600', color: '#111' }}>{edu.degree}</h3>
                <div style={{ color: '#444' }}>{edu.institution}</div>
              </div>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>{edu.year}</span>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', borderBottom: '2px solid #e0e0e0', paddingBottom: '0.5rem', marginBottom: '0.75rem', color: '#222', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skills</h2>
          <p style={{ margin: 0 }}>{data.skills.join(' • ')}</p>
        </section>
      )}
    </div>
  );
}
