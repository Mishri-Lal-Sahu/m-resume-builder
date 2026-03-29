import type { ResumeSectionType } from "@/features/resumes/types";

export type ContentTool = "starter" | "bullets" | "quantify" | "tighten" | "summarize" | "actionVerbs";

const starters: Record<ResumeSectionType, string> = {
  personalInfo:
    "Alexandra Chen\nalex.chen@email.com  |  +1 (555) 012-3456  |  San Francisco, CA 94105\nlinkedin.com/in/alexchen  |  github.com/alexchen  |  alexchen.dev",

  summary:
    "Results-driven Full-Stack Software Engineer with 6+ years of experience designing, developing, and scaling high-performance web applications.\n" +
    "Expert in React, TypeScript, Node.js, and cloud-native architecture (AWS, GCP). Delivered products serving 1M+ users across SaaS, fintech, and e-commerce domains.\n" +
    "Strong track record of leading cross-functional teams, reducing time-to-market by 30%, and mentoring engineers at every level.\n" +
    "Passionate about clean architecture, developer experience, and building software that solves real human problems.",

  skills:
    "Programming Languages:  TypeScript, JavaScript (ES2023+), Python 3, Go, SQL, Bash\n" +
    "Frontend:               React 18, Next.js 14, Tailwind CSS, Vite, Storybook, Figma\n" +
    "Backend:                Node.js, Express, FastAPI, GraphQL, REST APIs, WebSockets\n" +
    "Databases:              PostgreSQL, MySQL, MongoDB, Redis, DynamoDB, Prisma ORM\n" +
    "Cloud & DevOps:         AWS (EC2, S3, Lambda, RDS, CloudFront), GCP, Docker, Kubernetes, Terraform\n" +
    "CI/CD & Tooling:        GitHub Actions, CircleCI, Jest, Playwright, Datadog, Sentry\n" +
    "Soft Skills:            Technical leadership, system design, agile delivery, stakeholder communication",

  experience:
    "Senior Software Engineer  —  Acme Corp, San Francisco, CA  |  Jan 2022 – Present\n" +
    "• Architected a real-time event pipeline (Kafka + Go) processing 4M+ events/day, cutting P99 latency from 800ms → 120ms.\n" +
    "• Led a 5-engineer squad to ship the customer analytics dashboard (React + D3.js), boosting weekly active users by 42%.\n" +
    "• Decomposed a 250K-line Rails monolith into 12 domain microservices; reduced deployment cycle from 90 min → 8 min.\n" +
    "• Introduced contract testing (Pact) and improved code coverage from 38% → 87%, eliminating a class of regression bugs.\n" +
    "• Mentored 3 junior engineers through biweekly 1-on-1s, code reviews, and internal tech-talk program.\n\n" +
    "Software Engineer  —  TechStart Inc, Remote  |  Jun 2019 – Dec 2021\n" +
    "• Built an ML-driven fraud detection service (Python + scikit-learn) reducing chargeback rate by 67% ($2.3M saved/yr).\n" +
    "• Developed Stripe payment integration handling $12M+ in annual GMV with 99.97% uptime SLA.\n" +
    "• Shipped an automated reporting system that eliminated 40+ hours/week of manual analyst work.\n" +
    "• Created internal component library (TypeScript + Storybook) adopted across 6 product squads.\n\n" +
    "Junior Developer  —  WebCraft Agency, Austin, TX  |  Aug 2017 – May 2019\n" +
    "• Delivered 15+ client websites (WordPress, React) on schedule with zero post-launch critical bugs.\n" +
    "• Reduced average page load time by 55% through image optimisation, lazy-loading, and CDN configuration.",

  education:
    "M.S. Computer Science  —  Stanford University  |  Sep 2015 – Jun 2017\n" +
    "Specialisation: Distributed Systems & Machine Learning  |  GPA: 3.9/4.0\n" +
    "Thesis: \"Adaptive Load Balancing for Stateful Microservices at Scale\"\n\n" +
    "B.S. Computer Science  —  University of California, Berkeley  |  Sep 2011 – Jun 2015\n" +
    "GPA: 3.8/4.0  |  Dean's List (2013, 2014, 2015)  |  Phi Beta Kappa Honor Society\n" +
    "Activities: ACM Chapter President, Hackathon Co-Organiser, Teaching Assistant (CS61B)",

  projects:
    "OpenMetrics  —  Open-source observability platform  |  github.com/alexchen/openmetrics\n" +
    "• Distributed tracing + metrics aggregation built with Go, Prometheus, ClickHouse, and Next.js dashboard.\n" +
    "• 3,800+ GitHub stars, 140+ contributors; adopted by companies including HashiCorp and Cloudflare.\n" +
    "• Featured in \"Go Weekly\" newsletter and presented at GopherCon 2023.\n\n" +
    "ResumeCraft  —  AI resume builder SaaS  |  resumecraft.app\n" +
    "• Full-stack app (Next.js 14, Prisma, PostgreSQL, Stripe) with PDF export, sharing, and template switching.\n" +
    "• Acquired 8,000+ users in 3 months post-launch; #3 Product of the Day on Product Hunt.\n\n" +
    "ClimateBoard  —  Real-time climate data visualisation\n" +
    "• Built with React, MapboxGL, and FastAPI, ingesting 60+ public climate APIs.\n" +
    "• Won TechCrunch Disrupt Hackathon 2022 (1st place, 240+ teams).",

  certifications:
    "AWS Certified Solutions Architect – Professional  |  Amazon Web Services  |  2023  (Expires 2026)\n" +
    "Google Cloud Professional Data Engineer            |  Google                |  2022  (Expires 2025)\n" +
    "Certified Kubernetes Administrator (CKA)           |  CNCF                 |  2021  (Expires 2024)\n" +
    "Meta React Advanced Developer Certificate          |  Coursera / Meta      |  2021",

  languages:
    "English        —  Native / Full professional proficiency\n" +
    "Mandarin Chinese  —  Professional proficiency (HSK Level 5)\n" +
    "Spanish        —  Conversational (B2)\n" +
    "French         —  Elementary (A2)",

  achievements:
    "TechCrunch Disrupt Hackathon  —  1st Place  |  2022\n" +
    "  Built ClimateBoard in 48 hours; selected from 240+ teams by panel of industry judges.\n\n" +
    "Employee of the Quarter  —  Acme Corp  |  Q3 2023\n" +
    "  Recognised for delivering the analytics platform 2 weeks ahead of schedule under budget.\n\n" +
    "Open Source Impact  —  GitHub Top Contributor  |  2022–Present\n" +
    "  4,600+ total stars across personal projects; consistent contributions to React, Prisma, and dnd-kit.\n\n" +
    "Speaker  —  GopherCon 2023, San Diego\n" +
    "  Talk: \"Building Production-Ready Observability in Go\" — 400+ attendees.",

  socialLinks:
    "LinkedIn:    https://linkedin.com/in/alexchen\n" +
    "GitHub:      https://github.com/alexchen\n" +
    "Portfolio:   https://alexchen.dev\n" +
    "Twitter/X:   https://twitter.com/alexchen_dev\n" +
    "Medium:      https://medium.com/@alexchen   (12K followers)\n" +
    "Dev.to:      https://dev.to/alexchen",

  text:
    "Add your custom text here.\n" +
    "Use the toolbar above to apply bold, italic, underline, headings, or lists.\n" +
    "You can also type / on a new line to open the command menu.",

  pageBreak: "",
};

export function applyContentTool(
  tool: ContentTool,
  content: string,
  sectionType: ResumeSectionType,
): string {
  if (tool === "starter") {
    return content.trim().length > 0 ? content : starters[sectionType];
  }

  if (tool === "tighten") {
    return content
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  if (tool === "summarize") {
    if (content.length < 50) return content;
    const plain = content.replace(/<[^>]+>/g, "").trim();
    const sentences = plain.split(/(?<=[.!?])\s+|\n/).filter(Boolean);
    const top = sentences.slice(0, 3).join(" ").trim();
    return top ? `${top}.` : plain.slice(0, 200) + "...";
  }

  if (tool === "actionVerbs") {
    const verbMap: Record<string, string> = {
      led: "Spearheaded",
      built: "Engineered",
      improved: "Optimized",
      increased: "Accelerated",
      made: "Pioneered",
      helped: "Empowered",
      ran: "Orchestrated",
      managed: "Directed",
      worked: "Executed",
      created: "Architected",
      developed: "Delivered",
      used: "Leveraged",
      reduced: "Streamlined",
      handled: "Oversaw",
      wrote: "Authored",
      designed: "Crafted",
      implemented: "Deployed",
      fixed: "Resolved",
      supported: "Championed",
      tested: "Validated",
    };
    let result = content;
    Object.entries(verbMap).forEach(([old, replacement]) => {
      result = result.replace(new RegExp(`\\b${old}\\b`, "gi"), replacement);
    });
    return result;
  }

  const lines = content
    .replace(/<[^>]+>/g, "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return content;

  if (tool === "bullets") {
    return lines.map((line) => (line.startsWith("• ") || line.startsWith("- ") ? line : `• ${line}`)).join("\n");
  }

  if (tool === "quantify") {
    return lines
      .map((line) => {
        if (line.includes("%") || /\d/.test(line)) return line;
        return `${line} — improved efficiency by ~25%`;
      })
      .join("\n");
  }

  return content;
}
