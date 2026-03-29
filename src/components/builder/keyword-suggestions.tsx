"use client";

import type { ResumeSectionType } from "@/features/resumes/types";

const keywords: Partial<Record<ResumeSectionType, string[]>> = {
  experience: [
    "Led", "Architected", "Delivered", "Spearheaded", "Optimized",
    "Reduced latency", "Improved by X%", "Scaled to X users",
    "Cross-functional", "Mentored", "Shipped", "Revenue impact",
    "Cost savings", "Agile / Scrum", "On time", "Under budget",
  ],
  skills: [
    "Python", "JavaScript", "TypeScript", "React", "Node.js",
    "SQL", "AWS", "Docker", "Kubernetes", "REST API",
    "CI/CD", "Git", "System design", "Microservices", "Data structures",
  ],
  summary: [
    "Years of experience", "Domain expertise", "Key achievement",
    "Leadership", "Results-driven", "Cross-functional",
    "Innovative", "Scalable solutions", "Mission-driven",
  ],
  projects: [
    "Open source", "GitHub stars", "Live product", "API integration",
    "Tech stack", "Problem solved", "Outcome / Impact",
    "Users / Downloads", "Performance gain",
  ],
  education: [
    "GPA", "Honours / Dean's List", "Relevant coursework",
    "Thesis / Research", "Scholarships", "Activities / Clubs",
  ],
  certifications: [
    "AWS Certified", "Google Cloud", "Kubernetes (CKA)",
    "Scrum Master", "PMP", "Meta / Coursera",
    "Expiry date", "Badge / Credential URL",
  ],
  achievements: [
    "Award name", "Organisation", "Year",
    "Measurable impact", "Rank / Placement",
    "Competitive", "Recognition",
  ],
};

type Props = {
  sectionType: ResumeSectionType | null;
  onInsert: (keyword: string) => void;
};

export function KeywordSuggestions({ sectionType, onInsert }: Props) {
  if (!sectionType) return null;
  const chips = keywords[sectionType];
  if (!chips || chips.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
        Suggested keywords — {sectionType}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((kw) => (
          <button
            key={kw}
            onClick={() => onInsert(kw)}
            title={`Insert "${kw}" into selected section`}
            className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600 transition hover:border-zinc-900 hover:bg-zinc-900 hover:text-white active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 dark:hover:border-zinc-100"
          >
            {kw}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-zinc-400 dark:text-zinc-600">
        Click a chip to append it to the selected section.
      </p>
    </div>
  );
}
