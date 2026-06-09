import React from 'react';

export default function Minimal({ data }) {
  if (!data) return null;

  return (
    <div style={{ padding: '2.5rem', background: '#fff', color: '#111', fontFamily: '"Roboto", "Helvetica", sans-serif', lineHeight: '1.7', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '2.8rem', fontWeight: '300', letterSpacing: '1px' }}>{data.personalInfo.name}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.95rem', color: '#555' }}>
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
          {data.personalInfo.linkedin && <a href={data.personalInfo.linkedin} style={{ color: '#555', textDecoration: 'none' }}>LinkedIn</a>}
          {data.personalInfo.github && <a href={data.personalInfo.github} style={{ color: '#555', textDecoration: 'none' }}>GitHub</a>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <section style={{ marginBottom: '2.5rem' }}>
          <p style={{ margin: 0, fontSize: '1.05rem', color: '#333' }}>{data.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', color: '#888', marginBottom: '1.5rem' }}>Experience</h2>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{exp.title}</span>
                <span style={{ fontSize: '0.9rem', color: '#777' }}>{exp.duration}</span>
              </div>
              <div style={{ fontSize: '1rem', color: '#555', marginBottom: '0.75rem' }}>{exp.company}</div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#444' }}>
                {exp.responsibilities.map((resp, j) => (
                  <li key={j} style={{ marginBottom: '0.4rem', paddingLeft: '0.2rem' }}>{resp}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', color: '#888', marginBottom: '1.5rem' }}>Projects</h2>
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>{proj.title}</span>
                {proj.link && (
                  <a href={proj.link} style={{ marginLeft: '1rem', fontSize: '0.9rem', color: '#888', textDecoration: 'none' }}>Link ↗</a>
                )}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#777', marginBottom: '0.5rem' }}>{proj.technologies.join(' · ')}</div>
              <p style={{ margin: 0, color: '#444' }}>{proj.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', color: '#888', marginBottom: '1.5rem' }}>Education</h2>
          {data.education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{edu.degree}</div>
                <div style={{ color: '#555' }}>{edu.institution}</div>
              </div>
              <span style={{ fontSize: '0.9rem', color: '#777' }}>{edu.year}</span>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', color: '#888', marginBottom: '1rem' }}>Skills</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {data.skills.map((skill, i) => (
              <span key={i} style={{ background: '#f4f4f4', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.95rem' }}>{skill}</span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
