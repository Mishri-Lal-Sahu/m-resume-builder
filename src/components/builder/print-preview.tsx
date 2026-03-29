"use client";

import { useEffect } from "react";
import { TemplatePreview } from "@/components/templates/template-preview";
import type { ResumeDocument } from "@/features/resumes/types";

type Props = {
  open: boolean;
  onClose: () => void;
  templateKey: string;
  title: string;
  content: ResumeDocument;
  profilePhotoUrl: string | null;
};

export function PrintPreview({ open, onClose, templateKey, title, content, profilePhotoUrl }: Props) {
  // Keyboard ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  function printNow() {
    const style = document.createElement("style");
    style.id = "__print_preview_override__";
    style.innerHTML = `
      @media print {
        body > *:not(#print-preview-overlay) { display: none !important; }
        #print-preview-overlay { position: static !important; }
        #print-preview-topbar { display: none !important; }
        .resume-page { break-after: page; }
      }
      @page { size: A4 portrait; margin: 0; }
    `;
    document.head.appendChild(style);
    window.print();
    window.addEventListener("afterprint", () => style.remove(), { once: true });
  }

  return (
    <div
      id="print-preview-overlay"
      className="fixed inset-0 z-[100] flex flex-col bg-zinc-900/95 backdrop-blur-sm"
    >
      {/* Top bar */}
      <div
        id="print-preview-topbar"
        className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-700 bg-zinc-900 px-6"
      >
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-bold text-white">Print Preview</span>
          <span className="text-xs text-zinc-400">Read-only — no editing in preview mode</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={printNow}
            className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-[12px] font-bold text-white transition hover:bg-green-400 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
            Print / Save PDF
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-[12px] font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            Close (Esc)
          </button>
        </div>
      </div>

      {/* Scrollable preview area */}
      <div className="flex-1 overflow-auto p-10">
        <div className="mx-auto" style={{ width: "210mm" }}>
          <TemplatePreview
            templateKey={templateKey}
            title={title}
            sections={content.sections}
            theme={content.theme}
            profilePhotoUrl={profilePhotoUrl}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
