import React from 'react';

export default function Corporate({ data }) {
  if (!data) return null;

  return (
    <div style={{ padding: '2rem', background: '#fff', color: '#000', fontFamily: '"Times New Roman", Times, serif', lineHeight: '1.5' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '2.2rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{data.personalInfo.name}</h1>
        <p style={{ margin: 0, fontSize: '1rem' }}>
          {data.personalInfo.location || ''} • {data.personalInfo.phone || ''} • {data.personalInfo.email}
        </p>
        {(data.personalInfo.linkedin || data.personalInfo.github) && (
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem' }}>
            {data.personalInfo.linkedin && <a href={data.personalInfo.linkedin} style={{ color: '#000', textDecoration: 'none' }}>{data.personalInfo.linkedin}</a>}
            {data.personalInfo.linkedin && data.personalInfo.github && ' | '}
            {data.personalInfo.github && <a href={data.personalInfo.github} style={{ color: '#000', textDecoration: 'none' }}>{data.personalInfo.github}</a>}
          </p>
        )}
      </div>

      {/* Summary */}
      {data.summary && (
        <section style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '0.2rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Summary</h2>
          <p style={{ margin: 0, textAlign: 'justify' }}>{data.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '0.2rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Professional Experience</h2>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{exp.company}</span>
                <span style={{ fontWeight: 'bold' }}>{exp.duration}</span>
              </div>
              <div style={{ fontStyle: 'italic', marginBottom: '0.25rem' }}>{exp.title}</div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                {exp.responsibilities.map((resp, j) => (
                  <li key={j} style={{ marginBottom: '0.2rem', paddingLeft: '0.2rem' }}>{resp}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '0.2rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Key Projects</h2>
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 'bold' }}>{proj.title}</span>
                {proj.link && (
                  <a href={proj.link} style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: '#000', textDecoration: 'underline' }}>View Project</a>
                )}
              </div>
              <p style={{ margin: '0.1rem 0', fontStyle: 'italic' }}>Technologies: {proj.technologies.join(', ')}</p>
              <p style={{ margin: 0 }}>{proj.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '0.2rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Education</h2>
          {data.education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
              <div>
                <span style={{ fontWeight: 'bold' }}>{edu.institution}</span>
                <span> - {edu.degree}</span>
              </div>
              <span>{edu.year}</span>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '0.2rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Core Competencies</h2>
          <p style={{ margin: 0 }}>{data.skills.join(', ')}</p>
        </section>
      )}
    </div>
  );
}
