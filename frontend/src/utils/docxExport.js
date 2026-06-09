import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export async function exportToDocx(data, templateId, customFilename) {
  if (!data) return;

  // Define fonts based on template
  let font = 'Helvetica';
  let headingAlignment = AlignmentType.LEFT;
  let textAlignment = AlignmentType.LEFT;

  switch (templateId) {
    case 'corporate':
      font = 'Times New Roman';
      textAlignment = AlignmentType.JUSTIFIED;
      headingAlignment = AlignmentType.CENTER;
      break;
    case 'minimal':
      font = 'Arial';
      break;
    case 'creative':
      font = 'Segoe UI';
      break;
    case 'student':
      font = 'Tahoma';
      break;
    default:
      font = 'Helvetica';
      break;
  }

  const createHeading = (text, level) => {
    return new Paragraph({
      text: text,
      heading: level,
      alignment: level === HeadingLevel.HEADING_1 ? headingAlignment : AlignmentType.LEFT,
      spacing: { before: 240, after: 120 },
    });
  };

  const createText = (text, bold = false, italics = false) => {
    return new TextRun({
      text: text,
      font: font,
      bold: bold,
      italics: italics,
      size: 22, // 11pt
    });
  };

  const sections = [];

  // Header (Personal Info)
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.personalInfo.name,
          bold: true,
          size: 32, // 16pt
          font: font,
        }),
      ],
      alignment: headingAlignment,
      spacing: { after: 120 },
    })
  );

  const contactInfo = [
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location,
    data.personalInfo.linkedin,
    data.personalInfo.github,
  ].filter(Boolean).join(' | ');

  sections.push(
    new Paragraph({
      children: [createText(contactInfo)],
      alignment: headingAlignment,
      spacing: { after: 240 },
    })
  );

  // Summary
  if (data.summary) {
    sections.push(createHeading('Professional Summary', HeadingLevel.HEADING_2));
    sections.push(
      new Paragraph({
        children: [createText(data.summary)],
        alignment: textAlignment,
        spacing: { after: 240 },
      })
    );
  }

  // Define builders
  const buildExperience = () => {
    const expSections = [];
    if (data.experience && data.experience.length > 0) {
      expSections.push(createHeading('Experience', HeadingLevel.HEADING_2));
      data.experience.forEach(exp => {
        expSections.push(
          new Paragraph({
            children: [
              createText(exp.title, true),
              createText(' - '),
              createText(exp.company, false, true),
              createText(` (${exp.duration})`, false, true),
            ],
            spacing: { before: 120, after: 60 },
          })
        );
        exp.responsibilities.forEach(resp => {
          expSections.push(
            new Paragraph({
              children: [createText(resp)],
              bullet: { level: 0 },
              alignment: textAlignment,
            })
          );
        });
      });
    }
    return expSections;
  };

  const buildEducation = () => {
    const eduSections = [];
    if (data.education && data.education.length > 0) {
      eduSections.push(createHeading('Education', HeadingLevel.HEADING_2));
      data.education.forEach(edu => {
        eduSections.push(
          new Paragraph({
            children: [
              createText(edu.degree, true),
              createText(` - ${edu.institution}`),
              createText(` (${edu.year})`),
            ],
            spacing: { before: 60, after: 60 },
          })
        );
      });
    }
    return eduSections;
  };

  const buildProjects = () => {
    const projSections = [];
    if (data.projects && data.projects.length > 0) {
      projSections.push(createHeading('Projects', HeadingLevel.HEADING_2));
      data.projects.forEach(proj => {
        projSections.push(
          new Paragraph({
            children: [
              createText(proj.title, true),
            ],
            spacing: { before: 120, after: 60 },
          })
        );
        projSections.push(
          new Paragraph({
            children: [createText(`Technologies: ${proj.technologies.join(', ')}`, false, true)],
          })
        );
        projSections.push(
          new Paragraph({
            children: [createText(proj.description)],
            alignment: textAlignment,
            spacing: { after: 120 },
          })
        );
      });
    }
    return projSections;
  };

  const buildSkills = () => {
    const skillSections = [];
    if (data.skills && data.skills.length > 0) {
      skillSections.push(createHeading('Skills', HeadingLevel.HEADING_2));
      skillSections.push(
        new Paragraph({
          children: [createText(data.skills.join(', '))],
          spacing: { after: 240 },
        })
      );
    }
    return skillSections;
  };

  // Reorder sections based on template
  if (templateId === 'student') {
    sections.push(...buildEducation());
    sections.push(...buildSkills());
    sections.push(...buildProjects());
    sections.push(...buildExperience());
  } else {
    sections.push(...buildExperience());
    sections.push(...buildProjects());
    sections.push(...buildEducation());
    sections.push(...buildSkills());
  }

  // Create doc
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  // Export
  const blob = await Packer.toBlob(doc);
  const filename = customFilename ? (customFilename.endsWith('.docx') ? customFilename : `${customFilename}.docx`) : `${data.personalInfo.name.replace(/\s+/g, '_')}_Resume.docx`;
  saveAs(blob, filename);
}
