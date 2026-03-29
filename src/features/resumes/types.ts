export const sectionTypeOptions = [
  "personalInfo",
  "summary",
  "skills",
  "experience",
  "education",
  "projects",
  "certifications",
  "languages",
  "achievements",
  "socialLinks",
  "text",
  "pageBreak",
] as const;

export type ResumeSectionType = (typeof sectionTypeOptions)[number];

export type ResumeSection = {
  id: string;
  type: ResumeSectionType;
  title: string;
  content: string;
  collapsed?: boolean;   // collapse/expand toggle
  spacing?: number;
  fontSize?: number;
  textAlign?: "left" | "center" | "right";
  width?: number; // 0-100 percentage
  height?: number; // optional fixed height override
  x?: number; // optional absolute X pos (%)
  y?: number; // optional absolute Y pos (%)
};

export type ResumeTheme = {
  accent: string;
  font: "sans" | "serif" | "mono";
  layout: "single" | "split";
  density: "compact" | "balanced" | "spacious";
  sectionStyle: "plain" | "card" | "line";
  headingCase: "upper" | "title";
  canvas: "plain" | "soft" | "grid";
  pageCount: number;
  lineHeight: number;
  letterSpacing: number;
  sectionSpacing: number;
  margins: "narrow" | "normal" | "wide";
  fontSize: number;
};

export type ResumeDocument = {
  sections: ResumeSection[];
  theme: ResumeTheme;
};

const defaultTheme: ResumeTheme = {
  accent: "#111827",
  font: "sans",
  layout: "single",
  density: "balanced",
  sectionStyle: "plain",
  headingCase: "upper",
  canvas: "plain",
  pageCount: 1,
  lineHeight: 1.5,
  letterSpacing: 0,
  sectionSpacing: 24,
  margins: "normal",
  fontSize: 11,
};

const defaultTitles: Record<ResumeSectionType, string> = {
  personalInfo: "Personal Info",
  summary: "Professional Summary",
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
  achievements: "Achievements",
  socialLinks: "Social Links",
  text: "Text Block",
  pageBreak: "— Page Break —",
};

export function createSection(type: ResumeSectionType): ResumeSection {
  return {
    id: crypto.randomUUID(),
    type,
    title: defaultTitles[type],
    content: "",
  };
}

function makeSection(type: ResumeSectionType, content: string): ResumeSection {
  return { ...createSection(type), content };
}

export function defaultResumeDocument(): ResumeDocument {
  return {
    sections: [
      makeSection(
        "personalInfo",
        "your.name@email.com  |  +1 (555) 000-0000  |  Your City, State\nlinkedin.com/in/yourname  |  github.com/yourname  |  yourportfolio.dev"
      ),
      makeSection(
        "summary",
        "Results-driven [Your Role] with [X]+ years of experience in [your domain].\n" +
        "Skilled in [Skill 1], [Skill 2], and [Skill 3]. Passionate about building scalable solutions.\n" +
        "Recognised for delivering measurable outcomes, collaborating cross-functionally, and mentoring team members."
      ),
      makeSection(
        "skills",
        "Technical:   [Skill 1], [Skill 2], [Skill 3], [Skill 4], [Skill 5]\n" +
        "Tools:       [Tool 1], [Tool 2], [Tool 3]\n" +
        "Soft Skills: Leadership, Communication, Problem Solving, Agile / Scrum"
      ),
      makeSection(
        "experience",
        "[Company Name]  |  [Your Role]  |  [Month Year] – Present\n" +
        "• Led [initiative/project] that improved [metric] by [X%].\n" +
        "• Built [feature/system], reducing [time/cost] by [X%] and serving [X] users.\n" +
        "• Collaborated with [team/stakeholders] to deliver [outcome] on time and within budget.\n\n" +
        "[Previous Company]  |  [Previous Role]  |  [Month Year] – [Month Year]\n" +
        "• Managed [responsibility] across [scope/scale].\n" +
        "• Delivered [result] that saved [X hours/dollars] per [week/month].\n" +
        "• Mentored [X] junior team members and conducted weekly code/work reviews."
      ),
      makeSection(
        "education",
        "[University Name]  |  B.S. / M.S. [Your Degree]  |  [Year] – [Year]\n" +
        "GPA: [X.X]/4.0  |  [Honour/Award if applicable]\n" +
        "Relevant Coursework: [Course 1], [Course 2], [Course 3]\n" +
        "Activities: [Club/Society], [Achievement]"
      ),
      makeSection(
        "projects",
        "[Project Name]  |  [Link / github.com/yourname/project]\n" +
        "• Built with [tech stack]. Solved [problem] for [audience].\n" +
        "• Outcome: [X users / X stars / featured in X].\n\n" +
        "[Second Project]  |  [Link]\n" +
        "• [Short description of what it does and why it matters].\n" +
        "• Impact: [measurable result]."
      ),
      makeSection(
        "certifications",
        "[Certification Name]  |  [Issuing Organisation]  |  [Year]\n" +
        "[Certification Name]  |  [Issuing Organisation]  |  [Year]\n" +
        "[Certification Name]  |  [Issuing Organisation]  |  [Year]"
      ),
      makeSection(
        "achievements",
        "[Award / Recognition]  —  [Organisation]  |  [Year]\n" +
        "  [Brief description of what you did and the impact it had.]\n\n" +
        "[Award / Recognition]  —  [Organisation]  |  [Year]\n" +
        "  [Brief description of the achievement with measurable result.]"
      ),
    ],
    theme: defaultTheme,
  };
}

export function normalizeResumeDocument(input: unknown): ResumeDocument {
  const fallback = defaultResumeDocument();

  if (!input || typeof input !== "object") {
    return fallback;
  }

  const data = input as Partial<ResumeDocument>;

  const sections = Array.isArray(data.sections)
    ? data.sections
        .filter((section) => section && typeof section === "object")
        .map((section) => {
          const item = section as Partial<ResumeSection>;
          const type = sectionTypeOptions.includes(item.type as ResumeSectionType)
            ? (item.type as ResumeSectionType)
            : "summary";

          return {
            id: typeof item.id === "string" && item.id ? item.id : crypto.randomUUID(),
            type,
            title:
              typeof item.title === "string" && item.title.trim()
                ? item.title
                : defaultTitles[type],
            content: typeof item.content === "string" ? item.content : "",
            collapsed: typeof item.collapsed === "boolean" ? item.collapsed : undefined,
            spacing: typeof item.spacing === "number" ? item.spacing : undefined,
            fontSize: typeof item.fontSize === "number" ? item.fontSize : undefined,
            textAlign: (item.textAlign === "left" || item.textAlign === "center" || item.textAlign === "right") ? item.textAlign : undefined,
            width: typeof item.width === "number" ? item.width : undefined,
            height: typeof item.height === "number" ? item.height : undefined,
            x: typeof item.x === "number" ? item.x : undefined,
            y: typeof item.y === "number" ? item.y : undefined,
          };
        })
    : fallback.sections;

  const theme = {
    accent:
      typeof data.theme?.accent === "string" && data.theme.accent.trim()
        ? data.theme.accent
        : fallback.theme.accent,
    font:
      data.theme?.font === "serif" || data.theme?.font === "mono" || data.theme?.font === "sans"
        ? data.theme.font
        : fallback.theme.font,
    layout: data.theme?.layout === "split" || data.theme?.layout === "single" ? data.theme.layout : fallback.theme.layout,
    density:
      data.theme?.density === "compact" ||
      data.theme?.density === "balanced" ||
      data.theme?.density === "spacious"
        ? data.theme.density
        : fallback.theme.density,
    sectionStyle:
      data.theme?.sectionStyle === "plain" ||
      data.theme?.sectionStyle === "card" ||
      data.theme?.sectionStyle === "line"
        ? data.theme.sectionStyle
        : fallback.theme.sectionStyle,
    headingCase:
      data.theme?.headingCase === "upper" || data.theme?.headingCase === "title"
        ? data.theme.headingCase
        : fallback.theme.headingCase,
    canvas:
      data.theme?.canvas === "plain" ||
      data.theme?.canvas === "soft" ||
      data.theme?.canvas === "grid"
        ? data.theme.canvas
        : fallback.theme.canvas,
    pageCount:
      typeof data.theme?.pageCount === "number" &&
      Number.isInteger(data.theme.pageCount) &&
      data.theme.pageCount >= 1 &&
      data.theme.pageCount <= 10
        ? data.theme.pageCount
        : fallback.theme.pageCount,
    lineHeight: typeof data.theme?.lineHeight === "number" ? data.theme.lineHeight : fallback.theme.lineHeight,
    letterSpacing: typeof data.theme?.letterSpacing === "number" ? data.theme.letterSpacing : fallback.theme.letterSpacing,
    sectionSpacing: typeof data.theme?.sectionSpacing === "number" ? data.theme.sectionSpacing : fallback.theme.sectionSpacing,
    margins:
      data.theme?.margins === "narrow" || data.theme?.margins === "normal" || data.theme?.margins === "wide"
        ? data.theme.margins
        : fallback.theme.margins,
    fontSize: typeof data.theme?.fontSize === "number" ? data.theme.fontSize : fallback.theme.fontSize,
  };

  return {
    sections: sections.length > 0 ? sections : fallback.sections,
    theme,
  };
}
