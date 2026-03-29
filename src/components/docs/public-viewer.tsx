"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import FontFamily from "@tiptap/extension-font-family";
import Link from "@tiptap/extension-link";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import Image from "@tiptap/extension-image";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { FontSize, CustomTableCell, CustomTableHeader } from "@/features/resumes/tiptap-extensions";
import { StatusPillExtension } from "@/features/resumes/tiptap-status-node";
import { SignatureExtension } from "@/features/resumes/tiptap-signature-node";
import { ChartExtension } from "@/features/resumes/tiptap-chart-node";
import { BoardExtension } from "@/features/resumes/tiptap-board-node";
import Mention from "@tiptap/extension-mention";
import { TipTapDoc } from "@/features/resumes/tiptap-bridge";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const PAGE_WIDTH_PX = 794; // 210mm
const PAGE_HEIGHT_PX = 1123; // 297mm

function buildReadOnlyExtensions() {
  return [
    StarterKit.configure({}),
    Underline,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    Typography,
    TaskList,
    TaskItem.configure({ nested: true }),
    FontFamily,
    Link.configure({ openOnClick: true, HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" } }),
    Table.configure({ resizable: false }),
    TableRow,
    CustomTableCell,
    CustomTableHeader,
    Image.configure({ inline: true, allowBase64: true }),
    Subscript,
    Superscript,
    FontSize,
    StatusPillExtension,
    SignatureExtension,
    ChartExtension,
    BoardExtension,
    Mention.configure({
      HTMLAttributes: {
        class: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-medium px-1.5 py-0.5 rounded-md mx-0.5",
      },
      // Suggestion not needed for read-only
    }),
  ];
}

export function PublicDocsViewer({ title, initialContent }: { title: string; initialContent: TipTapDoc }) {
  const editor = useEditor({
    extensions: buildReadOnlyExtensions(),
    content: initialContent,
    editable: false,
    editorProps: {
      attributes: {
        class: "outline-none",
      },
    },
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-100 dark:bg-zinc-950 font-sans selection:bg-blue-200">
      {/* Chrome Header */}
      <header className="sticky top-0 z-50 flex w-full h-14 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 py-2 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80 md:px-8 print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-md shadow-indigo-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
          </div>
          <p className="max-w-[12rem] truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100 md:max-w-md">{title}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 md:flex">
            <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
            Public View
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>
            Print / PDF
          </button>
          <div className="flex h-8 items-center border-l dark:border-zinc-800 pl-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Pages Container */}
      <main className="flex-1 w-full flex flex-col items-center gap-8 py-10 print:py-0 print:gap-0 bg-zinc-50 dark:bg-zinc-950 overflow-y-auto overflow-x-hidden">
        <div id="docs-print-root" className="relative transition-all duration-300">
          <div
            className="docs-page-box relative bg-white dark:bg-zinc-900 shadow-xl ring-1 ring-zinc-200 dark:ring-zinc-800 mx-auto shrink-0 print:shadow-none print:ring-0"
            style={{ width: `${PAGE_WIDTH_PX}px`, minHeight: `${PAGE_HEIGHT_PX}px` }}
          >
             <div
                className="absolute left-0 right-0 overflow-hidden px-[25.4mm]"
                style={{
                  top: "30mm",
                  bottom: "30mm",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "11pt",
                  lineHeight: 1.6,
                }}
              >
                <EditorContent
                  editor={editor}
                  className="prose dark:prose-invert prose-zinc max-w-none h-full text-zinc-900 dark:text-zinc-100"
                />
              </div>
          </div>
        </div>
      </main>

      <footer className="w-full flex justify-center py-6 text-xs text-zinc-500 font-medium tracking-tight opacity-50 select-none print:hidden">
        Built with M-Docs &bull; M-Prime Group
      </footer>

      <style>{`
        .ProseMirror { outline: none; }
        .ProseMirror p { margin: 0; min-height: 1.6em; }
        .ProseMirror h1 { font-size: 26pt; font-weight: normal; margin: 16pt 0 6pt; }
        .ProseMirror h2 { font-size: 20pt; font-weight: normal; margin: 14pt 0 4pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
        .ProseMirror h3 { font-size: 16pt; font-weight: normal; margin: 12pt 0 4pt; color: #444; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.5em; margin: 4pt 0; }
        .ProseMirror table { width: 100%; border-collapse: collapse; margin: 8pt 0; }
        .ProseMirror td, .ProseMirror th { border: 1px solid #d1d5db; padding: 6px 10px; min-width: 50px; vertical-align: top; }
        .ProseMirror .task-list-item { display: flex; align-items: flex-start; gap: 8px; }
        
        @media print {
          @page { size: A4; margin: 0; }
          #docs-print-root { margin: 0 !important; width: 100% !important; }
          .docs-page-box { box-shadow: none !important; ring: 0 !important; width: 210mm !important; height: 297mm !important; }
        }
      `}</style>
    </div>
  );
}
