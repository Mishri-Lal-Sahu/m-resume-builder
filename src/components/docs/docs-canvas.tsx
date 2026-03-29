"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
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
import { suggestion } from "@/features/resumes/tiptap-suggestion";

import type { TipTapDoc } from "@/features/resumes/tiptap-bridge";
import { EditorBubbleMenu } from "@/components/editor/editor-bubble-menu";
import { DocsSubEditor } from "./docs-subeditor";

// Shared TipTap extensions used for every page editor
function buildExtensions() {
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
    Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-blue-600 underline cursor-pointer" } }),
    Table.configure({ resizable: true }),
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
        class: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-medium px-1.5 py-0.5 rounded-md mx-0.5 cursor-pointer",
      },
      suggestion,
    }),
    Placeholder.configure({ placeholder: "Start typing…" }),
  ];
}

// A4 dimensions in pixels at 96dpi
const PAGE_WIDTH_PX = 794; // 210mm
const PAGE_HEIGHT_PX = 1123; // 297mm
// Header + footer zones are fixed at 30mm each. Usable content height is ~237mm (about 897px at 96dpi).
const PRINTABLE_HEIGHT_PX = 897;
const SPLIT_SAFETY_PX = 6;

function isDocEffectivelyEmpty(docJson: any): boolean {
  if (!docJson || typeof docJson !== "object") return true;
  if (!Array.isArray(docJson.content) || docJson.content.length === 0) return true;

  let hasText = false;
  let hasMeaningfulNode = false;

  const visit = (node: any) => {
    if (!node || typeof node !== "object") return;

    if (typeof node.text === "string" && node.text.trim().length > 0) {
      hasText = true;
    }

    if (node.type && node.type !== "doc" && node.type !== "paragraph") {
      hasMeaningfulNode = true;
    }

    if (Array.isArray(node.content)) {
      node.content.forEach(visit);
    }
  };

  docJson.content.forEach(visit);
  return !hasText && !hasMeaningfulNode;
}

// ---------- Single Page Component ----------
type PageEditorProps = {
  pageIndex: number;
  totalPages: number;
  headerContent: string;
  footerContent: string;
  setHeaderContent: (html: string) => void;
  setFooterContent: (html: string) => void;
  initialContent?: TipTapDoc | null;
  onReady: (pageIndex: number, editor: any) => void;
  onFocus?: (editor: any) => void;
  onOverflow: (pageIndex: number, overflowNodes: any[], focusNext: boolean) => void;
  onUnderflow: (pageIndex: number, isEmpty: boolean) => void;
  onChange: (pageIndex: number, json: any) => void;
};

function PageEditor({
  pageIndex,
  totalPages,
  headerContent,
  footerContent,
  setHeaderContent,
  setFooterContent,
  initialContent,
  onReady,
  onFocus,
  onOverflow,
  onUnderflow,
  onChange,
}: PageEditorProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: buildExtensions(),
    content: initialContent ?? { type: "doc", content: [{ type: "paragraph" }] },
    editorProps: {
      attributes: {
        class: "outline-none",
        spellcheck: "true",
      },
    },
    onFocus({ editor: e }) {
      if (onFocus) onFocus(e);
    },
    onUpdate({ editor: e }) {
      onChange(pageIndex, e.getJSON());

      requestAnimationFrame(() => {
        const proseMirrorDiv = contentRef.current?.querySelector(".ProseMirror") as HTMLElement | null;
        if (!proseMirrorDiv) return;
        const contentHeight = proseMirrorDiv.scrollHeight;
        const doc = e.state.doc;

        const plainText = doc.textBetween(0, doc.content.size, " ", " ").trim();
        let hasMeaningfulNode = false;
        doc.forEach((node) => {
          if (node.isText) return;
          if (node.type.name === "paragraph" && node.textContent.trim() === "") return;
          hasMeaningfulNode = true;
        });
        const isEffectivelyEmpty = plainText.length === 0 && !hasMeaningfulNode;

        if (contentHeight > PRINTABLE_HEIGHT_PX) {
          let runningHeight = 0;
          let splitPos = -1;
          const children = proseMirrorDiv.children;
          let idx = 0;
          doc.forEach((_node, _offset, i) => {
            if (idx < children.length) {
              const childH = (children[idx] as HTMLElement).offsetHeight;
              if (runningHeight + childH > PRINTABLE_HEIGHT_PX && splitPos === -1) {
                splitPos = i;
              }
              runningHeight += childH;
            }
            idx++;
          });

          if (splitPos > 0 && splitPos < doc.childCount) {
            const overflowContent: any[] = [];
            doc.forEach((node, _offset, i) => {
              if (i >= splitPos) overflowContent.push(node.toJSON());
            });

            // Remove overflow nodes from this page
            const { tr } = e.state;
            let pos = doc.content.size;
            for (let i = doc.childCount - 1; i >= splitPos; i--) {
              const node = doc.child(i);
              pos -= node.nodeSize;
              tr.delete(pos, pos + node.nodeSize);
            }
            try {
              e.view.dispatch(tr);
            } catch {
              return;
            }

            // Signal parent to create next page; cursor should follow
            onOverflow(pageIndex, overflowContent, true);
          }
        } else if (pageIndex > 0 && isEffectivelyEmpty) {
          // Page is empty — remove it, move cursor to end of previous page
          onUnderflow(pageIndex, true);
        } else {
          // Page has room now, try to pull content from the next page upward.
          onUnderflow(pageIndex, false);
        }
      });
    },
    onCreate({ editor: e }) {
      onReady(pageIndex, e);
    },
    immediatelyRender: false,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  return (
    <div
      className="docs-page-box relative mx-auto flex shrink-0 flex-col overflow-hidden bg-white shadow-xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 print:shadow-none print:ring-0"
      style={{ width: `${PAGE_WIDTH_PX}px`, minHeight: `${PAGE_HEIGHT_PX}px`, height: `${PAGE_HEIGHT_PX}px` }}
    >
      {/* ── Header ── */}
      <div
        className="z-10 box-border flex h-[30mm] shrink-0 items-center border-b border-zinc-100 bg-white px-[25.4mm] py-[6mm] dark:border-zinc-800 dark:bg-zinc-900"
      >
        <DocsSubEditor
          content={headerContent}
          onChange={setHeaderContent}
          placeholder="Add document header…"
          onFocus={onFocus}
        />
      </div>

      {/* ── Content Area ── */}
      <div
        ref={contentRef}
        className="relative z-0 flex-1 overflow-hidden px-[25.4mm]"
        style={{
          fontFamily: "Arial, sans-serif",
          fontSize: "11pt",
          lineHeight: 1.6,
          color: "#1a1a1a",
        }}
      >
        {editor && <EditorContent editor={editor} className="h-full" />}
        {editor && <EditorBubbleMenu editor={editor} />}
      </div>

      {/* ── Footer ── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 box-border flex h-[30mm] items-center gap-4 border-t border-zinc-100 bg-white px-[25.4mm] py-[6mm] dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex-1">
          <DocsSubEditor
            content={footerContent}
            onChange={setFooterContent}
            placeholder="Add document footer…"
            onFocus={onFocus}
          />
        </div>
        <span className="text-[8pt] text-zinc-400 font-medium tracking-widest uppercase shrink-0 print:hidden">
          Page {pageIndex + 1} of {totalPages}
        </span>
      </div>
    </div>
  );
}

// ---------- Doc Canvas ----------
type DocsCanvasProps = {
  initialContent: TipTapDoc | null;
  onReady: (editor: any) => void;
  onChange: (json: TipTapDoc) => void;
  onFocus?: (editor: any) => void;
};

export function DocsCanvas({ initialContent, onReady, onChange, onFocus }: DocsCanvasProps) {
  const [headerContent, setHeaderContent] = useState("<p></p>");
  const [footerContent, setFooterContent] = useState("<p></p>");

  // Each page has its own content JSON
  const [pages, setPages] = useState<(TipTapDoc | null)[]>([initialContent]);
  const editorsRef = useRef<{ [pageIndex: number]: any }>({});
  const rebalancingRef = useRef(false);

  const removePage = useCallback((pageIndex: number) => {
    if (pageIndex <= 0) return;

    setPages(prev => {
      if (prev.length <= 1 || pageIndex >= prev.length) return prev;
      const next = [...prev];
      next.splice(pageIndex, 1);
      return next;
    });

    const shifted: { [pageIndex: number]: any } = {};
    Object.entries(editorsRef.current).forEach(([k, editor]) => {
      const idx = Number(k);
      if (idx < pageIndex) shifted[idx] = editor;
      if (idx > pageIndex) shifted[idx - 1] = editor;
    });
    editorsRef.current = shifted;

    setTimeout(() => {
      const prevEditor = editorsRef.current[pageIndex - 1];
      if (prevEditor) {
        prevEditor.commands.focus();
        prevEditor.commands.setTextSelection(prevEditor.state.doc.content.size);
        if (onFocus) onFocus(prevEditor);
      }
    }, 50);
  }, [onFocus]);

  const handleReady = useCallback((pageIndex: number, editor: any) => {
    editorsRef.current[pageIndex] = editor;
    if (pageIndex === 0) onReady(editor);
  }, [onReady]);

  const handleChange = useCallback((pageIndex: number, json: any) => {
    if (pageIndex === 0) onChange(json);
  }, [onChange]);

  const handleOverflow = useCallback((pageIndex: number, overflowNodes: any[], focusNext: boolean) => {
    const nextEditor = editorsRef.current[pageIndex + 1];

    if (nextEditor) {
      // Important: when next page is already mounted, update its live editor state directly.
      // Updating only React state here can drop/misplace content because TipTap doesn't remount on prop change.
      const existing = nextEditor.getJSON?.() as any;
      const existingContent = existing?.content ?? [];
      try {
        nextEditor.commands.setContent({ type: "doc", content: [...overflowNodes, ...existingContent] }, false);
      } catch {
        return;
      }
    } else {
      setPages(prev => {
        const next = [...prev];
        const overflowDoc: TipTapDoc = { type: "doc", content: overflowNodes };
        next.push(overflowDoc as any);
        return next;
      });
    }

    if (focusNext) {
      // After next render, focus the next page's editor and move cursor to its start
      setTimeout(() => {
        const nextEditor = editorsRef.current[pageIndex + 1];
        if (nextEditor) {
          nextEditor.commands.focus();
          nextEditor.commands.setTextSelection(0);
          if (onFocus) onFocus(nextEditor);
        }
      }, 50);
    }
  }, [onFocus]);

  const pullFromNextPage = useCallback((pageIndex: number) => {
    if (rebalancingRef.current) return;
    const currentEditor = editorsRef.current[pageIndex];
    const nextEditor = editorsRef.current[pageIndex + 1];
    if (!currentEditor || !nextEditor) return;

    const nextDoc = nextEditor.state.doc;
    if (nextDoc.childCount === 0) {
      removePage(pageIndex + 1);
      return;
    }

    const firstNode = nextDoc.child(0);
    if (!firstNode) return;

    rebalancingRef.current = true;
    try {
      currentEditor.chain().focus().insertContent(firstNode.toJSON()).run();

      const tr = nextEditor.state.tr;
      tr.delete(0, firstNode.nodeSize);
      nextEditor.view.dispatch(tr);
    } catch {
      // Ignore if either editor is tearing down due to page remount.
    } finally {
      setTimeout(() => {
        rebalancingRef.current = false;
      }, 0);
    }

    const nextJson = nextEditor.getJSON?.();
    if (isDocEffectivelyEmpty(nextJson)) {
      removePage(pageIndex + 1);
    }
  }, [removePage]);

  const handleUnderflow = useCallback((pageIndex: number, isEmpty: boolean) => {
    if (isEmpty) {
      removePage(pageIndex);
      return;
    }
    pullFromNextPage(pageIndex);
  }, [pullFromNextPage, removePage]);

  // Register print hooks — traverse up from docs-print-root and hide all sibling elements
  useEffect(() => {
    const hiddenEls: { el: HTMLElement; display: string }[] = [];

    const before = () => {
      const root = document.getElementById('docs-print-root');
      if (!root) return;

      // Walk every ancestor up to body, hiding their siblings
      let node: HTMLElement | null = root;
      while (node && node !== document.body) {
        const parent: HTMLElement | null = node.parentElement;
        if (parent) {
          Array.from(parent.children).forEach(child => {
            if (child !== node) {
              const el = child as HTMLElement;
              hiddenEls.push({ el, display: el.style.display });
              el.style.setProperty('display', 'none', 'important');
            }
          });
        }
        node = parent;
      }
    };

    const after = () => {
      hiddenEls.forEach(({ el, display }) => {
        el.style.display = display;
      });
      hiddenEls.length = 0;
    };

    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
    };
  }, []);


  return (
    <div id="docs-print-root" className="relative w-full flex flex-col items-center gap-[24px] py-8 pb-32">
      {pages.map((pageContent, i) => (
        <PageEditor
          key={i}
          pageIndex={i}
          totalPages={pages.length}
          headerContent={headerContent}
          footerContent={footerContent}
          setHeaderContent={setHeaderContent}
          setFooterContent={setFooterContent}
          initialContent={pageContent}
          onReady={handleReady}
          onFocus={onFocus}
          onOverflow={handleOverflow}
          onUnderflow={handleUnderflow}
          onChange={handleChange}
        />
      ))}

      {/* Print styles */}
      <style>{`
        @page {
          size: A4;
          margin: 0;
        }

        @media print {
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          html, body { margin: 0; padding: 0; background: white; }

          #docs-print-root {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }

          .docs-page-box {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            overflow: hidden !important;
            page-break-after: always;
            page-break-inside: avoid;
            box-shadow: none !important;
            border: none !important;
            outline: none !important;
            margin: 0 auto !important;
            position: relative !important;
          }
          .docs-page-box:last-child {
            page-break-after: auto !important;
            margin-bottom: 0 !important;
          }

          .docs-page-box .ProseMirror {
            overflow: visible !important;
            height: auto !important;
          }
        }

        .ProseMirror { outline: none; min-height: 60px; padding-top: 1px; box-sizing: border-box; }
        .ProseMirror > :first-child { margin-top: 0 !important; }
        .ProseMirror > :last-child { margin-bottom: 0 !important; }
        .ProseMirror p { margin: 0; min-height: 1.6em; }
        .ProseMirror h1 { font-size: 26pt; font-weight: normal; margin: 16pt 0 6pt; }
        .ProseMirror h2 { font-size: 20pt; font-weight: normal; margin: 14pt 0 4pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
        .ProseMirror h3 { font-size: 16pt; font-weight: normal; margin: 12pt 0 4pt; color: #444; }
        .ProseMirror h4 { font-size: 13pt; font-weight: bold; margin: 10pt 0 4pt; }
        .ProseMirror h5 { font-size: 11pt; font-weight: bold; margin: 10pt 0 2pt; }
        .ProseMirror h6 { font-size: 10pt; font-weight: bold; margin: 10pt 0 2pt; font-style: italic; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.5em; margin: 4pt 0; }
        .ProseMirror li { margin: 1pt 0; }
        .ProseMirror blockquote { border-left: 3px solid #c0c0c0; padding-left: 1em; color: #666; margin: 8pt 0; }
        .ProseMirror table { width: 100%; border-collapse: collapse; margin: 8pt 0; }
        .ProseMirror td, .ProseMirror th { border: 1px solid #d1d5db; padding: 6px 10px; min-width: 50px; vertical-align: top; }
        .ProseMirror th { background: #f8fafc; font-weight: 600; }
        .ProseMirror code { background: #f3f4f6; font-family: monospace; padding: 1px 4px; border-radius: 3px; font-size: 90%; }
        .ProseMirror pre code { background: transparent; padding: 0; }
        .ProseMirror pre { background: #1e293b; color: #e2e8f0; padding: 12px 16px; border-radius: 6px; overflow-x: auto; margin: 8pt 0; }
        .ProseMirror a { color: #2563eb; text-decoration: underline; }
        .ProseMirror hr { border: none; border-top: 1px solid #d1d5db; margin: 12pt 0; }
        .ProseMirror img { max-width: 100%; height: auto; border-radius: 4px; display: block; }
        .ProseMirror .task-list-item { display: flex; align-items: flex-start; gap: 8px; }
        .ProseMirror .task-list-item input[type="checkbox"] { margin-top: 3px; cursor: pointer; }
      `}</style>
    </div>
  );
}
