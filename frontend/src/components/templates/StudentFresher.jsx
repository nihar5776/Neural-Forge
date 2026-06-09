import React from 'react';

export default function StudentFresher({ data }) {
  if (!data) return null;

  return (
    <div style={{ padding: '2.5rem', background: '#fff', color: '#333', fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif', lineHeight: '1.6' }}>
      {/* Header */}
      <div style={{ borderBottom: '3px solid #2c3e50', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.6rem', color: '#2c3e50', fontWeight: 'bold' }}>{data.personalInfo.name}</h1>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', color: '#555', fontSize: '1rem' }}>
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span>| {data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span>| {data.personalInfo.location}</span>}
          {data.personalInfo.linkedin && <span>| <a href={data.personalInfo.linkedin} style={{ color: '#2980b9', textDecoration: 'none' }}>LinkedIn</a></span>}
          {data.personalInfo.github && <span>| <a href={data.personalInfo.github} style={{ color: '#2980b9', textDecoration: 'none' }}>GitHub</a></span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <section style={{ marginBottom: '2rem' }}>
          <p style={{ margin: 0, fontSize: '1.1rem', color: '#444' }}>{data.summary}</p>
        </section>
      )}

      {/* Education (Prioritized for Student/Fresher) */}
      {data.education && data.education.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '0.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Education</h2>
          {data.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50' }}>{edu.degree}</h3>
                <div style={{ fontSize: '1rem', color: '#555' }}>{edu.institution}</div>
              </div>
              <span style={{ fontSize: '0.95rem', color: '#7f8c8d', fontWeight: 'bold' }}>{edu.year}</span>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '0.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Technical Skills</h2>
          <p style={{ margin: 0, fontSize: '1.05rem', color: '#444', lineHeight: '1.8' }}>
            {data.skills.join(' • ')}
          </p>
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '0.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Academic & Personal Projects</h2>
          {data.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#2c3e50' }}>{proj.title}</h3>
                {proj.link && <a href={proj.link} style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: '#2980b9', textDecoration: 'none' }}>[Link]</a>}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#7f8c8d', fontWeight: '600', marginBottom: '0.5rem' }}>{proj.technologies.join(', ')}</div>
              <p style={{ margin: 0, color: '#555' }}>{proj.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Experience (If any internships/part-time) */}
      {data.experience && data.experience.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.4rem', color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '0.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>Experience</h2>
          {data.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#2c3e50' }}>{exp.title}</h3>
                <span style={{ fontSize: '0.95rem', color: '#7f8c8d', fontWeight: 'bold' }}>{exp.duration}</span>
              </div>
              <div style={{ fontSize: '1rem', color: '#555', marginBottom: '0.5rem', fontStyle: 'italic' }}>{exp.company}</div>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#444' }}>
                {exp.responsibilities.map((resp, j) => (
                  <li key={j} style={{ marginBottom: '0.25rem' }}>{resp}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
