import React from 'react';

export default function Creative({ data }) {
  if (!data) return null;

  return (
    <div style={{ padding: '0', background: '#fff', color: '#333', fontFamily: '"Outfit", "Segoe UI", sans-serif', lineHeight: '1.6', display: 'flex', minHeight: '100%' }}>
      {/* Left Column */}
      <div style={{ width: '30%', background: '#f0f4f8', padding: '2.5rem 2rem', borderRight: '1px solid #e2e8f0' }}>
        <h1 style={{ margin: '0 0 1.5rem 0', fontSize: '2.2rem', fontWeight: '800', color: '#1a365d', lineHeight: '1.2' }}>{data.personalInfo.name}</h1>
        
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#2b6cb0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Contact</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem', color: '#4a5568' }}>
            {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
            {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
            {data.personalInfo.location && <div>{data.personalInfo.location}</div>}
            {data.personalInfo.linkedin && <div><a href={data.personalInfo.linkedin} style={{ color: '#3182ce', textDecoration: 'none' }}>LinkedIn</a></div>}
            {data.personalInfo.github && <div><a href={data.personalInfo.github} style={{ color: '#3182ce', textDecoration: 'none' }}>GitHub</a></div>}
          </div>
        </div>

        {data.skills && data.skills.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#2b6cb0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {data.skills.map((skill, i) => (
                <span key={i} style={{ background: '#fff', border: '1px solid #cbd5e0', color: '#2d3748', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '500' }}>{skill}</span>
              ))}
            </div>
          </div>
        )}

        {data.education && data.education.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#2b6cb0', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Education</h3>
            {data.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#2d3748' }}>{edu.degree}</div>
                <div style={{ fontSize: '0.9rem', color: '#4a5568', marginBottom: '0.2rem' }}>{edu.institution}</div>
                <div style={{ fontSize: '0.85rem', color: '#718096' }}>{edu.year}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column */}
      <div style={{ width: '70%', padding: '3rem' }}>
        {data.summary && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a365d', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '30px', height: '3px', background: '#3182ce', display: 'inline-block' }}></span> Profile
            </h2>
            <p style={{ margin: 0, color: '#4a5568', fontSize: '1.05rem', lineHeight: '1.7' }}>{data.summary}</p>
          </section>
        )}

        {data.experience && data.experience.length > 0 && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a365d', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '30px', height: '3px', background: '#3182ce', display: 'inline-block' }}></span> Experience
            </h2>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: '#2d3748' }}>{exp.title}</h3>
                  <span style={{ fontSize: '0.9rem', color: '#3182ce', fontWeight: '600', backgroundColor: '#ebf8ff', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>{exp.duration}</span>
                </div>
                <div style={{ fontSize: '1rem', color: '#718096', fontWeight: '500', marginBottom: '0.75rem' }}>{exp.company}</div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#4a5568' }}>
                  {exp.responsibilities.map((resp, j) => (
                    <li key={j} style={{ marginBottom: '0.3rem', paddingLeft: '0.2rem' }}>{resp}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {data.projects && data.projects.length > 0 && (
          <section>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1a365d', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '30px', height: '3px', background: '#3182ce', display: 'inline-block' }}></span> Projects
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              {data.projects.map((proj, i) => (
                <div key={i} style={{ padding: '1.5rem', background: '#f7fafc', borderRadius: '8px', borderLeft: '4px solid #3182ce' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#2d3748' }}>{proj.title}</h3>
                    {proj.link && <a href={proj.link} style={{ fontSize: '0.85rem', color: '#3182ce', textDecoration: 'none', fontWeight: '600' }}>View ↗</a>}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#718096', fontWeight: '600', marginBottom: '0.75rem' }}>{proj.technologies.join(' • ')}</div>
                  <p style={{ margin: 0, color: '#4a5568', fontSize: '0.95rem' }}>{proj.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
