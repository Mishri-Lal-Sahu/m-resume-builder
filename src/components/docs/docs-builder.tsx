"use client";

import { useState, useRef, useCallback } from "react";
import type { TipTapDoc } from "@/features/resumes/tiptap-bridge";
import { DocsHeader } from "./docs-header";
import { DocsToolbar } from "./docs-toolbar";
import { DocsCanvas } from "./docs-canvas";

/** The full document blob saved into rawContent in the DB */
export type MDocsDocument = {
  type: "mdocs-document";
  version: 1;
  header: string;
  footer: string;
  pages: TipTapDoc[];
};

type DocsBuilderProps = {
  resumeId: string;
  initialTitle: string;
  initialContent: TipTapDoc | null;
  initialHeader?: string;
  initialFooter?: string;
};

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function DocsBuilder({ resumeId, initialTitle, initialContent, initialHeader, initialFooter }: DocsBuilderProps) {
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [activeMainEditor, setActiveMainEditor] = useState<any>(null);
  const [zoom, setZoom] = useState(1);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep latest header/footer/pages in refs so title-change saves include them
  const lastHeaderRef = useRef(initialHeader ?? "<p></p>");
  const lastFooterRef = useRef(initialFooter ?? "<p></p>");
  const lastPagesRef = useRef<TipTapDoc[]>([]);

  const handleSave = useCallback(
    async (newTitle: string, header: string, footer: string, pages: TipTapDoc[]) => {
      setStatus("saving");
      const rawContent: MDocsDocument = {
        type: "mdocs-document",
        version: 1,
        header,
        footer,
        pages,
      };
      try {
        const res = await fetch(`/api/resumes/${resumeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle, rawContent }),
        });
        if (!res.ok) throw new Error("Save failed");
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    },
    [resumeId],
  );

  const debouncedSave = useCallback(
    (newTitle: string, header: string, footer: string, pages: TipTapDoc[]) => {
      // Always update the latest refs so title changes don't lose content
      lastHeaderRef.current = header;
      lastFooterRef.current = footer;
      if (pages.length > 0) lastPagesRef.current = pages;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setStatus("saving");
      saveTimerRef.current = setTimeout(() => {
        handleSave(newTitle, header, footer, pages);
      }, 1500);
    },
    [handleSave],
  );

  const decreaseZoom = useCallback(() => {
    setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10));
  }, []);

  const increaseZoom = useCallback(() => {
    setZoom((z) => Math.min(2, Math.round((z + 0.1) * 10) / 10));
  }, []);

  return (
    <div className="flex h-screen flex-col bg-[#f8f9fc] dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100 print:bg-white print:h-auto print:block">
      {/* Chrome Header */}
      <div className="print:hidden">
        <DocsHeader
          title={title}
          editor={activeMainEditor || editorInstance}
          onTitleChange={(t: string) => {
            setTitle(t);
            // Immediate save for title change, using the last known header/footer/pages
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            handleSave(t, lastHeaderRef.current, lastFooterRef.current, lastPagesRef.current);
          }}
          status={status}
        />
      </div>

      {/* Ribbon Toolbar */}
      <div className="border-b border-zinc-200 bg-white px-4 py-1.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex-shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <DocsToolbar editor={activeMainEditor || editorInstance} />
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-1.5 py-1 dark:border-zinc-700 dark:bg-zinc-800/60">
            <button
              onClick={decreaseZoom}
              className="flex h-7 w-7 items-center justify-center rounded text-zinc-700 transition hover:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-700"
              title="Zoom out"
            >
              -
            </button>
            <button
              onClick={() => setZoom(1)}
              className="min-w-14 rounded px-1 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-700"
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={increaseZoom}
              className="flex h-7 w-7 items-center justify-center rounded text-zinc-700 transition hover:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-700"
              title="Zoom in"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Document Outline (Left Sidebar) */}
        <aside className="w-64 flex-shrink-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 hidden md:flex flex-col print:hidden">
          <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Document Outline</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
            {!editorInstance && <div className="text-sm text-zinc-400">Loading...</div>}
            {editorInstance && (() => {
              const items: { level: number; text: string; pos: number; isFirstLine: boolean }[] = [];
              editorInstance.state.doc.descendants((node: any, pos: number) => {
                if (node.type.name === 'heading') {
                  const raw = node.textContent?.trim() || '';
                  const words = raw.split(/\s+/).slice(0, 7).join(' ');
                  items.push({ level: parseInt(node.attrs.level), text: words || '(Untitled)', pos, isFirstLine: false });
                } else if (node.type.name === 'paragraph' && items.length === 0) {
                  const raw = node.textContent?.trim() || '';
                  if (raw) {
                    const words = raw.split(/\s+/).slice(0, 7).join(' ');
                    items.push({ level: 1, text: words, pos, isFirstLine: true });
                  }
                }
              });

              if (items.length === 0) {
                return <div className="text-sm text-zinc-400 italic">Start typing to see outline.</div>;
              }

              return items.map((h, idx) => (
                <button
                  key={idx}
                  className={`text-left text-sm truncate rounded px-2 py-1 w-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                    h.isFirstLine
                      ? 'font-semibold text-zinc-700 dark:text-zinc-200'
                      : 'text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                  style={{ paddingLeft: `${(h.level - 1) * 12 + 8}px`, fontSize: `${Math.max(11, 14 - h.level)}px` }}
                  onClick={() => {
                    const dom = editorInstance.view.dom;
                    let target: Element | null = null;
                    if (h.isFirstLine) {
                      target = dom.querySelector('p');
                    } else {
                      const els = dom.querySelectorAll(`h${h.level}`);
                      target = Array.from(els).find((e: any) => e.textContent?.startsWith(h.text.split(' ')[0])) as Element || null;
                    }
                    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  {h.text}
                </button>
              ));
            })()}
          </div>
        </aside>

        {/* Main Document Area */}
        <main className="flex-1 overflow-y-auto overflow-x-auto p-6 sm:p-12 scrollbar-hide flex justify-center print:overflow-visible print:block print:p-0 bg-zinc-100 dark:bg-zinc-950 relative">
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              width: "794px",
              transition: "transform 120ms ease",
            }}
          >
            <DocsCanvas
              initialContent={initialContent}
              initialHeader={initialHeader}
              initialFooter={initialFooter}
              onReady={(e: any) => {
                setEditorInstance(e);
                setActiveMainEditor(e);
              }}
              onChange={(header, footer, pages) => debouncedSave(title, header, footer, pages)}
              onFocus={setActiveMainEditor}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
