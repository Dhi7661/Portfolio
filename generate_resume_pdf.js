// generate_resume_pdf.js
// Standalone script to generate Dhiraj_Kurangale_Resume.pdf conforming to PDF-1.4 standard
const fs = require('fs');
const path = require('path');

// Standard Helvetica character widths in 1/1000th of an em
// Default fallback width
function getCharWidth(char, isBold) {
  // Approximate width table for standard ascii
  if (char === ' ') return isBold ? 278 : 278;
  if (char === 'i' || char === 'l' || char === '!' || char === '|' || char === ':' || char === ';' || char === '.' || char === ',') return isBold ? 278 : 222;
  if (char === 'f' || char === 't' || char === 'I' || char === 'j' || char === 'r' || char === '(' || char === ')' || char === '[' || char === ']' || char === '{' || char === '}') return isBold ? 333 : 300;
  if (char === 'm' || char === 'M' || char === 'W' || char === 'w') return isBold ? 850 : 800;
  if (char >= 'A' && char <= 'Z') return isBold ? 722 : 667;
  if (char >= '0' && char <= '9') return isBold ? 556 : 556;
  return isBold ? 556 : 500;
}

function measureText(text, fontSize, isBold) {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    width += (getCharWidth(text[i], isBold) * fontSize) / 1000;
  }
  return width;
}

function wrapText(text, maxWidth, fontSize, isBold) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const w = measureText(testLine, fontSize, isBold);
    if (w > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function escapePdf(text) {
  return text.replace(/\\/g, '\\\\')
             .replace(/\(/g, '\\(')
             .replace(/\)/g, '\\)');
}

class PDFDoc {
  constructor() {
    this.ops = [];
    this.width = 595.28;  // A4 width
    this.height = 841.89; // A4 height
    this.margin = 38;     // Margins
  }

  setColor(r, g, b) {
    this.ops.push(`${(r/255).toFixed(3)} ${(g/255).toFixed(3)} ${(b/255).toFixed(3)} rg`);
  }

  setStrokeColor(r, g, b) {
    this.ops.push(`${(r/255).toFixed(3)} ${(g/255).toFixed(3)} ${(b/255).toFixed(3)} RG`);
  }

  drawRect(x, y, w, h, r, g, b) {
    this.setColor(r, g, b);
    this.ops.push(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
  }

  drawLine(x1, y1, x2, y2, thickness = 1, r = 2, g = 82, b = 152) {
    this.setStrokeColor(r, g, b);
    this.ops.push(`${thickness.toFixed(2)} w`);
    this.ops.push(`${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  }

  drawText(text, x, y, fontSize, font = '/F2', r = 26, g = 26, b = 26) {
    this.setColor(r, g, b);
    this.ops.push(`BT ${font} ${fontSize.toFixed(2)} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${escapePdf(text)}) Tj ET`);
  }

  drawCenteredText(text, y, fontSize, font = '/F1', r = 15, g = 23, b = 42) {
    const isBold = font === '/F1';
    const textWidth = measureText(text, fontSize, isBold);
    const x = (this.width - textWidth) / 2;
    this.drawText(text, x, y, fontSize, font, r, g, b);
  }

  build() {
    let out = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
    const offsets = [];

    const streamContent = this.ops.join('\n');
    const streamLen = Buffer.byteLength(streamContent, 'utf8');

    const objs = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${this.width.toFixed(2)} ${this.height.toFixed(2)}] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> /Contents 7 0 R >>`,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>',
      `<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream`
    ];

    for (let i = 0; i < objs.length; i++) {
      offsets.push(Buffer.byteLength(out, 'utf8'));
      out += `${i + 1} 0 obj\n${objs[i]}\nendobj\n`;
    }

    const startXref = Buffer.byteLength(out, 'utf8');
    out += `xref\n0 ${objs.length + 1}\n`;
    out += '0000000000 65535 f \n';
    for (const offset of offsets) {
      out += `${String(offset).padStart(10, '0')} 00000 n \n`;
    }
    out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
    return Buffer.from(out, 'utf8');
  }
}

function generateResume() {
  const doc = new PDFDoc();
  let y = 808;
  const leftX = doc.margin;
  const rightX = doc.width - doc.margin;
  const contentWidth = rightX - leftX;

  // 1. Header
  doc.drawCenteredText('DHIRAJ GANESH KURANGALE', y, 16.5, '/F1', 15, 23, 42);
  y -= 14;
  doc.drawCenteredText('Frontend Developer | Full Stack Web Developer', y, 9.5, '/F1', 2, 132, 199);
  y -= 11.5;
  doc.drawCenteredText('Rasayani, Panvel, Mumbai, Maharashtra, India  •  +91-7249397069  •  dhirajkurangale1@gmail.com', y, 7.8, '/F2', 60, 70, 85);
  y -= 10.5;
  doc.drawCenteredText('Portfolio   •   LinkedIn   •   GitHub', y, 7.8, '/F1', 2, 132, 199);
  y -= 12;

  // Helper function for Section Titles
  function drawSection(title) {
    doc.drawText(title, leftX, y, 9, '/F1', 2, 82, 152);
    y -= 3;
    doc.drawLine(leftX, y, rightX, y, 0.8, 2, 82, 152);
    y -= 8;
  }

  // 2. Professional Summary
  drawSection('PROFESSIONAL SUMMARY');
  const summary = 'I am a Full Stack Developer passionate about building fast, intuitive, and responsive web applications from the ground up. My core stack centers on Javascript, React.js, Next.js, Typescript, Node.js, Express.js, MongoDB and Tailwind CSS. During my frontend internship, I worked on real-world CRM systems—architecting role-based permission systems, approval pipelines, and responsive interfaces designed around user needs. I thrive on solving complex frontend state issues, writing clean backend APIs, and continuously expanding my full-stack capabilities.';
  const sumLines = wrapText(summary, contentWidth, 7.5, false);
  for (const line of sumLines) {
    doc.drawText(line, leftX, y, 7.5, '/F2', 30, 41, 59);
    y -= 9;
  }
  y -= 4;

  // 3. Technical Skills
  drawSection('TECHNICAL SKILLS');
  const skills = [
    { label: 'Web & Frontend:', val: 'React.js, Next.js, JavaScript (ES6+), TypeScript, HTML5, CSS3, Tailwind CSS, State Management, DOM Manipulation' },
    { label: 'Backend & APIs:', val: 'Node.js, Express.js, RESTful API Integration, CRUD Operations, Form Validation' },
    { label: 'Databases & Tools:', val: 'MongoDB, SQL, Git, GitHub, Google Stitch, Figma' },
    { label: 'Methodologies:', val: 'Responsive Web Design, Component-Driven UI, Debugging, Cross-Browser Testing, Git Workflows' }
  ];

  for (const sk of skills) {
    doc.drawText(sk.label, leftX, y, 7.5, '/F1', 15, 23, 42);
    doc.drawText(sk.val, leftX + 90, y, 7.5, '/F2', 30, 41, 59);
    y -= 9.5;
  }
  y -= 4;

  // 4. Professional Experience
  drawSection('PROFESSIONAL EXPERIENCE');
  doc.drawText('Frontend Developer Intern — ', leftX, y, 8, '/F2', 15, 23, 42);
  const wPitch = measureText('Frontend Developer Intern — ', 8, false);
  doc.drawText('Pitchmatter', leftX + wPitch, y, 8, '/F1', 15, 23, 42);
  const dateStr = 'June 2026 – September 2026';
  const wDate = measureText(dateStr, 7.5, false);
  doc.drawText(dateStr, rightX - wDate, y, 7.5, '/F2', 71, 85, 105);
  y -= 9.5;

  const expBullets = [
    'Developed responsive and interactive web interfaces using React.js, TypeScript, HTML5, CSS3, and Tailwind CSS.',
    'Developed CRM frontend modules using React functional components, React Hooks, reusable UI components, Tailwind CSS, and REST API integration.',
    'Implemented user-management interfaces with reusable React components, controlled forms, client-side validation, search/filter state management, pagination, status toggles, and API-driven data rendering.',
    'Developed client approval workflows using React state management, conditional rendering, reusable forms and modals, route-based navigation, validation logic, status-based UI states, and REST API integration.',
    'Implemented role-based interfaces using conditional rendering, route protection, role-based UI logic, reusable components, and application-level access-control rules.',
    'Integrated frontend features with RESTful APIs using Axios, handling request/response states, loading states, validation errors, authentication errors, and dynamic data rendering.',
    'Built reusable frontend components including Cards, Buttons, Inputs, Badges, Modals, Tables, Pagination, Sidebar, and Topbar components.',
    'Implemented responsive layouts using Tailwind CSS, reusable styling patterns, responsive breakpoints, light/dark theme support, and mobile-friendly UI structures.',
    'Worked with React Router, protected routes, token/session handling, Git/GitHub feature workflows, debugging, reviews, and sprint-based development.'
  ];

  for (const bullet of expBullets) {
    const lines = wrapText(bullet, contentWidth - 14, 7.2, false);
    doc.drawText('•', leftX + 2, y, 7.2, '/F1', 71, 85, 105);
    for (let i = 0; i < lines.length; i++) {
      doc.drawText(lines[i], leftX + 11, y, 7.2, '/F2', 30, 41, 59);
      y -= 8.5;
    }
  }
  y -= 3;

  // 5. Featured Projects
  drawSection('FEATURED PROJECTS');
  
  // Project 1: WebLens
  doc.drawText('WebLens', leftX, y, 8, '/F1', 15, 23, 42);
  const wWl = measureText('WebLens', 8, true);
  doc.drawText(' — Website Intelligence & Quality Analysis Platform | React 19, TypeScript, Tailwind CSS v4, Node.js/Express, MongoDB Atlas', leftX + wWl, y, 7.2, '/F2', 51, 65, 85);
  const demo1 = 'Live Demo';
  const wD1 = measureText(demo1, 7.5, true);
  doc.drawText(demo1, rightX - wD1, y, 7.5, '/F1', 2, 132, 199);
  y -= 9;

  const wlBullets = [
    'Built an enterprise-grade, full-stack website intelligence and automated quality assurance platform that analyzes live websites rather than relying on generic reports.',
    'Implemented a secure, sandboxed headless Chromium workflow using Puppeteer to crawl webpages, inspect live DOM structure and network timings, and run five specialized diagnostic audit engines.',
    'Developed regression tracking and interactive reporting to help developers identify, prioritize, and resolve website quality issues overtime.',
    'Integrated a Grounded AI Copilot that provides context-aware guidance for prioritized fixes within the website analysis workflow.'
  ];
  for (const b of wlBullets) {
    const lines = wrapText(b, contentWidth - 14, 7.1, false);
    doc.drawText('•', leftX + 2, y, 7.1, '/F1', 71, 85, 105);
    for (const line of lines) {
      doc.drawText(line, leftX + 11, y, 7.1, '/F2', 30, 41, 59);
      y -= 8.2;
    }
  }
  y -= 2;

  // Project 2: Saffron Table
  doc.drawText('Saffron Table', leftX, y, 8, '/F1', 15, 23, 42);
  const wSt = measureText('Saffron Table', 8, true);
  doc.drawText(' — Fine Dining Restaurant Website | React.js, JavaScript, Tailwind CSS', leftX + wSt, y, 7.2, '/F2', 51, 65, 85);
  doc.drawText('Live Demo', rightX - wD1, y, 7.5, '/F1', 2, 132, 199);
  y -= 9;

  const stBullets = [
    'Developed a modern, high-performance restaurant web application delivering a polished, immersive visual dining experience.',
    'Built interactive, reusable UI sections and smooth client-side navigation using React.js and modern CSS.',
    'Implemented mobile-first, responsive layouts ensuring pixel-perfect display across smartphones, tablets, and desktops.'
  ];
  for (const b of stBullets) {
    const lines = wrapText(b, contentWidth - 14, 7.1, false);
    doc.drawText('•', leftX + 2, y, 7.1, '/F1', 71, 85, 105);
    for (const line of lines) {
      doc.drawText(line, leftX + 11, y, 7.1, '/F2', 30, 41, 59);
      y -= 8.2;
    }
  }
  y -= 2;

  // Project 3: TechKart
  doc.drawText('TechKart', leftX, y, 8, '/F1', 15, 23, 42);
  const wTk = measureText('TechKart', 8, true);
  doc.drawText(' — MERN E-Commerce Platform | MongoDB, Express.js, React.js, Node.js', leftX + wTk, y, 7.2, '/F2', 51, 65, 85);
  doc.drawText('Live Demo', rightX - wD1, y, 7.5, '/F1', 2, 132, 199);
  y -= 9;

  const tkBullets = [
    'Architected a MERN-stack e-commerce frontend featuring dynamic product catalogs, category filtering, and cart state management.',
    'Integrated modular frontend components with RESTful APIs for inventory display and seamless checkout flow.'
  ];
  for (const b of tkBullets) {
    const lines = wrapText(b, contentWidth - 14, 7.1, false);
    doc.drawText('•', leftX + 2, y, 7.1, '/F1', 71, 85, 105);
    for (const line of lines) {
      doc.drawText(line, leftX + 11, y, 7.1, '/F2', 30, 41, 59);
      y -= 8.2;
    }
  }
  y -= 4;

  // 6. Education
  drawSection('EDUCATION');
  
  // B.Sc. IT
  doc.drawText('Bachelor of Science in Information Technology', leftX, y, 7.8, '/F1', 15, 23, 42);
  const wDeg = measureText('Bachelor of Science in Information Technology', 7.8, true);
  doc.drawText(' — Pillai College of Arts, Sci. & Comm.', leftX + wDeg, y, 7.5, '/F2', 51, 65, 85);
  const bscScore = '2023 – 2026 | 84.71%';
  const wScore1 = measureText(bscScore, 7.5, true);
  doc.drawText(bscScore, rightX - wScore1, y, 7.5, '/F1', 15, 23, 42);
  y -= 9.5;

  // HSC
  doc.drawText('Higher Secondary Certificate (HSC)', leftX, y, 7.8, '/F1', 15, 23, 42);
  const wHsc = measureText('Higher Secondary Certificate (HSC)', 7.8, true);
  doc.drawText(' — Reliance Foundation School', leftX + wHsc, y, 7.5, '/F2', 51, 65, 85);
  const hscScore = '56.67%';
  const wHscSc = measureText(hscScore, 7.5, false);
  doc.drawText(hscScore, rightX - wHscSc, y, 7.5, '/F2', 15, 23, 42);
  y -= 9.5;

  // SSC
  doc.drawText('Secondary School Certificate (SSC)', leftX, y, 7.8, '/F1', 15, 23, 42);
  const wSsc = measureText('Secondary School Certificate (SSC)', 7.8, true);
  doc.drawText(' — Reliance Foundation School', leftX + wSsc, y, 7.5, '/F2', 51, 65, 85);
  const sscScore = '71.40%';
  const wSscSc = measureText(sscScore, 7.5, false);
  doc.drawText(sscScore, rightX - wSscSc, y, 7.5, '/F2', 15, 23, 42);
  y -= 11;

  // 7. Certification & Additional Details
  drawSection('CERTIFICATION & ADDITIONAL DETAILS');
  doc.drawText('Certification:', leftX, y, 7.8, '/F1', 15, 23, 42);
  doc.drawText('Web Development - link', leftX + 58, y, 7.5, '/F2', 2, 132, 199);
  y -= 9.5;
  doc.drawText('Availability:', leftX, y, 7.8, '/F1', 15, 23, 42);
  doc.drawText('Immediate Joiner  •  Full-Time Web / Frontend Development', leftX + 54, y, 7.5, '/F2', 30, 41, 59);

  return doc.build();
}

const pdfBuffer = generateResume();
const outPath = path.join(__dirname, 'Dhiraj_Kurangale_Resume.pdf');
fs.writeFileSync(outPath, pdfBuffer);
console.log('Successfully generated Dhiraj_Kurangale_Resume.pdf at', outPath, 'Bytes:', pdfBuffer.length);

