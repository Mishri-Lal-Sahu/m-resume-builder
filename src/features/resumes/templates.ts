export const ADVANCED_TEMPLATES = [
  {
    category: "Personal / Career",
    id: "demo_resume",
    name: "Full Demo Resume",
    html: `
      <h1 style="text-align: center;">Mishri Lal Sahu</h1>
      <p style="text-align: center; color: #666;">Software Engineer & Web Developer | Contact: mishri@example.com</p>
      <hr>
      <h2>Professional Summary</h2>
      <p>Hardworking software developer with experience in building scalable web applications. Passionate about learning new technologies and creating efficient solutions.</p>
      <h2>Experience</h2>
      <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true"><p>Built full-stack React applications</p></li>
        <li data-type="taskItem" data-checked="true"><p>Designed RESTful APIs using Node.js</p></li>
      </ul>
      <h2>Key Skills</h2>
      <table>
        <tr>
          <th style="background-color: #f3f4f6;">Frontend</th>
          <th style="background-color: #f3f4f6;">Backend</th>
        </tr>
        <tr>
          <td>React, Next.js, HTML, CSS</td>
          <td>Node.js, Express, PostgreSQL</td>
        </tr>
      </table><p></p>
    `,
  },
  {
    category: "Business",
    id: "invoice",
    name: "Sales Invoice",
    html: `<h1>INVOICE</h1><p><strong>Date:</strong> 2026-03-23</p><table><tr><th>Item</th><th>Qty</th><th>Price</th></tr><tr><td>Consulting</td><td>10</td><td>$150</td></tr></table>`,
  },
  {
    category: "Business",
    id: "nda",
    name: "Non-Disclosure Agreement (NDA)",
    html: `<h2>NON-DISCLOSURE AGREEMENT</h2><p>This Agreement is entered into on <span data-type="mention" data-id="Today">@Today</span> by and between [Party A] and [Party B].</p><p><strong>1. Confidential Information:</strong> Both parties agree not to disclose...</p><span data-type="signature"></span>`,
  },
  {
    category: "Business",
    id: "proposal",
    name: "Consulting Proposal",
    html: `<h1>Project Proposal</h1><h2>Executive Summary</h2><p>Overview of the project goals...</p><h2>Cost Breakdown</h2><table><tr><th>Milestone</th><th>Cost</th></tr><tr><td>Phase 1</td><td>$5,000</td></tr></table>`,
  },
  {
    category: "Business",
    id: "offer",
    name: "Job Offer Letter",
    html: `<h2>Offer of Employment</h2><p>Dear [Name],</p><p>We are thrilled to offer you the position of [Title] at [Company].</p><h3>Compensation</h3><ul><li>Base: $__</li><li>Equity: __</li></ul><p>Please sign below:</p><span data-type="signature"></span>`,
  },
  {
    category: "Product",
    id: "prd",
    name: "Product Requirements Docs (PRD)",
    html: `<h1>PRD: [Feature Name]</h1><p><strong>Status:</strong> <span data-type="status-pill" statusId="needs-review"></span></p><h3>Goals</h3><ul><li><p>Increase conversion by 5%</p></li></ul><h3>Specs</h3><p>...</p>`,
  },
  {
    category: "Product",
    id: "architecture",
    name: "Software Architecture",
    html: `<h1>System Architecture</h1><p>Below is the high level flow:</p><div data-type="drawing-board"></div><h3>Components</h3><ul><li><p>Frontend: Next.js</p></li><li><p>Backend: Node.js</p></li></ul>`,
  },
  {
    category: "Product",
    id: "wireframe",
    name: "SaaS Wireframe Specs",
    html: `<h1>Wireframes</h1><p>Draw the layout here:</p><div data-type="drawing-board"></div>`,
  },
  {
    category: "Product",
    id: "bug_report",
    name: "QA Bug Report",
    html: `<h2>Bug Report</h2><p><strong>Severity:</strong> <span data-type="status-pill" statusId="blocked"></span></p><h3>Steps to Reproduce</h3><ol><li><p>Log in</p></li><li><p>Click X</p></li></ol>`,
  },
  {
    category: "Marketing",
    id: "press_release",
    name: "Press Release",
    html: `<h2>FOR IMMEDIATE RELEASE</h2><p><strong>[City, State] – [Date]</strong> – [Company] today announced...</p><h3>Media Contact</h3><p>Name: User</p>`,
  },
  {
    category: "Marketing",
    id: "marketing_plan",
    name: "Go-to-Market Strategy",
    html: `<h1>GTM Plan: Q3</h1><h2>Target Audience</h2><p>...</p><h2>Budget</h2><div data-type="interactive-chart"></div>`,
  },
  {
    category: "Marketing",
    id: "seo_strategy",
    name: "SEO Strategy",
    html: `<h1>SEO Content Plan</h1><table><tr><th>Keyword</th><th>Volume</th><th>Difficulty</th></tr><tr><td>"best software"</td><td>10K</td><td>Hard</td></tr></table>`,
  },
  {
    category: "Marketing",
    id: "content_calendar",
    name: "Content Calendar Tracker",
    html: `<h1>Content Calendar</h1><table><tr><th>Title</th><th>Date</th><th>Status</th></tr><tr><td>Blog Post 1</td><td>Oct 12</td><td><span data-type="status-pill" statusId="not-started"></span></td></tr></table>`,
  },
  {
    category: "Design",
    id: "persona",
    name: "User Persona",
    html: `<h1>User Persona: [Name]</h1><p><strong>Age:</strong> 30</p><p><strong>Goals:</strong> Save time on accounting.</p><h3>Pain Points</h3><ul><li><p>Too many manual steps</p></li></ul>`,
  },
  {
    category: "Design",
    id: "creative_brief",
    name: "Creative Brief",
    html: `<h1>Creative Brief</h1><h2>Objective</h2><p>...</p><h2>Deliverables</h2><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Logo Redesign</p></li></ul>`,
  },
  {
    category: "HR",
    id: "employee_handbook",
    name: "Employee Handbook Section",
    html: `<h2>Company Policies</h2><h3>PTO Policy</h3><p>Employees are entitled to 20 days of paid time off.</p>`,
  },
  {
    category: "Academic",
    id: "academic_paper",
    name: "Academic Research Paper",
    html: `<h1>[Title of Paper]</h1><p><strong>Abstract:</strong> ...</p><h2>1. Introduction</h2><p>...</p><h2>2. Methodology</h2><p>...</p>`,
  },
  {
    category: "Project Management",
    id: "weekly_status",
    name: "Weekly Status Report",
    html: `<h1>Weekly Sync</h1><p><strong>Overall Status:</strong> <span data-type="status-pill" statusId="in-progress"></span></p><h3>Updates</h3><ul><li><p>...</p></li></ul>`,
  },
  {
    category: "Project Management",
    id: "project_brief",
    name: "Project Brief",
    html: `<h1>Project Brief</h1><h2>Scope</h2><p>...</p><h2>Timeline</h2><table><tr><th>Phase</th><th>Deadline</th></tr><tr><td>Research</td><td>Nov 1</td></tr></table>`,
  },
  {
    category: "Project Management",
    id: "meeting_agenda",
    name: "Meeting Agenda",
    html: `<h1>Meeting Agenda</h1><p><strong>Date:</strong> <span data-type="mention" data-id="Today">@Today</span></p><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Discuss Q1 metrics</p></li></ul>`,
  },
  {
    category: "Personal / Career",
    id: "cover_letter",
    name: "Cover Letter",
    html: `<p>[Your Name]<br>[Address]</p><br><p>Dear Hiring Manager,</p><p>I am writing to express my interest in the...</p><br><p>Sincerely,</p><span data-type="signature"></span>`,
  }
];
