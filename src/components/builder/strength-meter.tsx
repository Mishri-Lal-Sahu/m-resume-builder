"use client";

import { useMemo } from "react";
import type { ResumeSection } from "@/features/resumes/types";

type Props = { sections: ResumeSection[] };

type Check = { label: string; met: boolean; tip: string };

function score(sections: ResumeSection[]): { checks: Check[]; total: number; max: number } {
  const has = (type: string) => sections.some(s => s.type === type && s.content.replace(/<[^>]+>/g, "").trim().length > 40);
  const wordCount = (type: string) => {
    const s = sections.find(sec => sec.type === type);
    return s ? s.content.replace(/<[^>]+>/g, "").trim().split(/\s+/).filter(Boolean).length : 0;
  };

  const checks: Check[] = [
    { label: "Contact Info", met: has("personalInfo"), tip: "Add email, phone, and LinkedIn to Personal Info." },
    { label: "Summary (50+ words)", met: wordCount("summary") >= 50, tip: "Write at least 50 words in your Professional Summary." },
    { label: "Work Experience", met: has("experience"), tip: "Add at least one job entry with details." },
    { label: "Education", met: has("education"), tip: "Include your degree, university, and graduation year." },
    { label: "Skills (5+ listed)", met: (sections.find(s => s.type === "skills")?.content.replace(/<[^>]+>/g, "").split(/[,\n]/).filter(x => x.trim()).length ?? 0) >= 5, tip: "List at least 5 skills." },
    { label: "Projects or Certs", met: has("projects") || has("certifications"), tip: "Add a Projects or Certifications section." },
    { label: "Bullet points used", met: sections.some(s => s.content.includes("•") || s.content.includes("<li>") || s.content.includes("- ")), tip: "Use bullet points to improve readability." },
    { label: "Metrics / Numbers", met: sections.some(s => /\d+%|\d+x|\$\d|\d+ (users|clients|teams|projects)/i.test(s.content.replace(/<[^>]+>/g, ""))), tip: "Add at least one quantified achievement (e.g. 40%, $2M)." },
    { label: "Action verbs", met: sections.some(s => /\b(Led|Built|Developed|Managed|Architected|Delivered|Spearheaded|Engineered|Optimized|Deployed)\b/.test(s.content.replace(/<[^>]+>/g, ""))), tip: "Start bullet points with strong action verbs." },
    { label: "No empty sections", met: !sections.some(s => s.type !== "pageBreak" && s.content.replace(/<[^>]+>/g, "").trim().length === 0), tip: "Remove or fill in all empty sections." },
  ];

  return { checks, total: checks.filter(c => c.met).length, max: checks.length };
}

export function StrengthMeter({ sections }: Props) {
  const { checks, total, max } = useMemo(() => score(sections), [sections]);
  const pct = Math.round((total / max) * 100);
  const color = pct >= 80 ? "#22c55e" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const label = pct >= 80 ? "Strong" : pct >= 50 ? "Good" : "Weak";

  return (
    <div className="space-y-3">
      {/* Score ring */}
      <div className="flex items-center gap-3">
        <svg width="52" height="52" viewBox="0 0 52 52" className="shrink-0">
          <circle cx="26" cy="26" r="22" fill="none" stroke="#e4e4e7" strokeWidth="5" />
          <circle
            cx="26" cy="26" r="22" fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${2 * Math.PI * 22}`}
            strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
            strokeLinecap="round"
            transform="rotate(-90 26 26)"
          />
          <text x="26" y="30" textAnchor="middle" fontSize="12" fontWeight="700" fill={color}>{pct}%</text>
        </svg>
        <div>
          <p className="text-sm font-bold" style={{ color }}>{label}</p>
          <p className="text-[11px] text-zinc-400">{total}/{max} checks passed</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>

      {/* Checklist */}
      <div className="space-y-1 mt-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-start gap-2 group">
            <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full flex items-center justify-center ${c.met ? "bg-green-100 dark:bg-green-900/30" : "bg-zinc-100 dark:bg-zinc-800"}`}>
              {c.met ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
              )}
            </div>
            <div>
              <p className={`text-[11px] font-semibold leading-tight ${c.met ? "text-zinc-500 dark:text-zinc-400" : "text-zinc-700 dark:text-zinc-300"}`}>{c.label}</p>
              {!c.met && <p className="text-[10px] text-zinc-400 dark:text-zinc-600 leading-tight mt-0.5">{c.tip}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
