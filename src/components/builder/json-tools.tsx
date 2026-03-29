"use client";

import { useRef } from "react";
import type { ResumeDocument } from "@/features/resumes/types";

type Props = {
  content: ResumeDocument;
  title: string;
  onImport: (doc: ResumeDocument, title?: string) => void;
};

export function JsonTools({ content, title, onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const payload = { title, content };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_") || "resume"}_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    inputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        // accept both { title, content } wrapper and bare ResumeDocument
        if (parsed?.content?.sections) {
          onImport(parsed.content, parsed.title ?? title);
        } else if (parsed?.sections) {
          onImport(parsed, title);
        } else {
          alert("Invalid resume JSON file.");
        }
      } catch {
        alert("Could not parse the file. Make sure it is a valid JSON resume export.");
      }
    };
    reader.readAsText(file);
    // Reset so same file can be re-imported
    e.target.value = "";
  }

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFileChange} />
      <button
        onClick={handleExport}
        className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[12px] font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-white active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        Export JSON
      </button>
      <button
        onClick={handleImportClick}
        className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-[12px] font-semibold text-zinc-700 transition hover:border-zinc-300 hover:bg-white active:scale-95 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
        Import JSON
      </button>
      <p className="text-[10px] text-zinc-400 dark:text-zinc-600 leading-relaxed">
        Export saves all content, theme, and sections. Import replaces the current resume — undo (Ctrl+Z) to revert.
      </p>
    </div>
  );
}
