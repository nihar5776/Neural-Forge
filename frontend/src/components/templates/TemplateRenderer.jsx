import React from 'react';
import ModernProfessional from './ModernProfessional';
import Corporate from './Corporate';
import Minimal from './Minimal';
import Creative from './Creative';
import StudentFresher from './StudentFresher';

export default function TemplateRenderer({ templateId, data }) {
  if (!data) return null;

  switch (templateId) {
    case 'modern':
      return <ModernProfessional data={data} />;
    case 'corporate':
      return <Corporate data={data} />;
    case 'minimal':
      return <Minimal data={data} />;
    case 'creative':
      return <Creative data={data} />;
    case 'student':
      return <StudentFresher data={data} />;
    default:
      return <ModernProfessional data={data} />;
  }
}
