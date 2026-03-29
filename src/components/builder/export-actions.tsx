"use client";

import { Document, Packer, Paragraph, TextRun, HeadingLevel, FileChild } from "docx";
import { useState } from "react";
import { ResumeDocument } from "@/features/resumes/types";

type ExportActionsProps = {
  resumeId: string;
  title: string;
  content: ResumeDocument;
  pageCount: number;
};

export function ExportActions({ title, pageCount, content }: ExportActionsProps) {
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);

  const exportToPdf = () => {
    setExporting("pdf");

    // Build @media print CSS that shows only the resume pages in A4
    const styleId = "resume-print-style";
    let el = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = styleId;
      document.head.appendChild(el);
    }

    const pageIds = Array.from({ length: pageCount }, (_, i) => `#resume-page-${i + 1}`).join(
      ", "
    );

    el.textContent = `
      @media print {
        /* Hide everything */
        body > * { display: none !important; }

        /* Show only the resume pages — walk up the DOM to make ancestors visible */
        ${pageIds},
        ${pageIds
          .split(", ")
          .map((id) => `${id} *`)
          .join(", ")} { display: revert !important; }

        /* Reset the canvas/zoom transform so print matches screen */
        [style*="transform: scale"] { transform: none !important; }
        [style*="transform:scale"] { transform: none !important; }

        /* Remove editor chrome on print */
        .print\\:hidden, [data-print="hidden"] { display: none !important; }

        /* A4 page setup */
        @page {
          size: A4 portrait;
          margin: 0;
        }

        /* Make each resume page a full print page */
        ${pageIds
          .split(", ")
          .map(
            (id) => `
          ${id} {
            display: block !important;
            position: relative !important;
            width: 210mm !important;
            min-height: 297mm !important;
            page-break-after: always;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }`
          )
          .join("")}

        /* Remove outer wrappers' padding when printing */
        body, html {
          margin: 0 !important;
          padding: 0 !important;
        }
      }
    `;

    // Print
    window.print();

    // Cleanup after print dialog closes
    const cleanup = () => {
      el?.remove();
      setExporting(null);
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);

    // Safety fallback: cleanup after 30 seconds even if afterprint didn't fire
    setTimeout(cleanup, 30000);
  };

  const exportToDocx = async () => {
    setExporting("docx");
    try {
      const children: FileChild[] = [
        new Paragraph({
          text: title,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }),
      ];

      content.sections.forEach((section) => {
        children.push(
          new Paragraph({
            text: section.title,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );

        // Strip HTML tags from content for DOCX
        const plainText = section.content.replace(/<[^>]+>/g, "");
        plainText.split("\n").forEach((line) => {
          children.push(
            new Paragraph({
              children: [new TextRun(line)],
              spacing: { after: 100 },
            })
          );
        });
      });

      const doc = new Document({
        sections: [
          {
            properties: {},
            children,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const fileName = `${title.replace(/\s+/g, "_")}.docx`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("DOCX Export failed", error);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToPdf}
        disabled={!!exporting}
        className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
          <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
        {exporting === "pdf" ? "Preparing..." : "Export PDF"}
      </button>
      <button
        onClick={exportToDocx}
        disabled={!!exporting}
        className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300 disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        {exporting === "docx" ? "Exporting..." : "Export DOCX"}
      </button>
    </div>
  );
}
