"use client";

import { EditorContent, useEditor } from "@tiptap/react";
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
import { useEffect, useCallback, useRef } from "react";
import type { ResumeDocument, ResumeSection } from "@/features/resumes/types";
import { tiptapToResume, resumeToTipTap } from "@/features/resumes/tiptap-bridge";
import { EditorBubbleMenu } from "@/components/editor/editor-bubble-menu";
import { BlockInserter } from "@/components/editor/block-inserter";

type DocumentEditorProps = {
  title: string;
  content: ResumeDocument;
  theme: ResumeDocument["theme"];
  onTitleChange: (t: string) => void;
  onContentChange: (doc: ResumeDocument, title: string) => void;
};

// Font class map
const fontFamilyMap: Record<string, string> = {
  sans: "Inter, ui-sans-serif, system-ui, sans-serif",
  serif: "Georgia, ui-serif, serif",
  mono: "ui-monospace, SFMono-Regular, monospace",
};

export function DocumentEditor({
  title,
  content,
  theme,
  onTitleChange,
  onContentChange,
}: DocumentEditorProps) {
  const onChangeRef = useRef(onContentChange);
  onChangeRef.current = onContentChange;
  const onTitleRef = useRef(onTitleChange);
  onTitleRef.current = onTitleChange;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Typography,
      TaskList,
      TaskItem.configure({ nested: true }),
      FontFamily,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-blue-500 underline" } }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading" && (node.attrs.level as number) === 1) {
            return "Your Name";
          }
          return "Start typing… or press / for commands";
        },
      }),
    ],
    content: resumeToTipTap(content, title),
    editorProps: {
      attributes: {
        class: "outline-none min-h-full",
        spellcheck: "true",
      },
    },
    onUpdate({ editor }) {
      const json = editor.getJSON() as Parameters<typeof tiptapToResume>[0];
      const { sections, title: newTitle } = tiptapToResume(json, content.sections as ResumeSection[]);
      onChangeRef.current({ ...content, sections }, newTitle);
      if (newTitle !== title) onTitleRef.current(newTitle);
    },
    immediatelyRender: false,
  });

  // Sync external title/content changes (e.g. from version restore or JSON import)
  const lastSyncRef = useRef("");
  useEffect(() => {
    if (!editor) return;
    const key = `${title}::${content.sections.length}`;
    if (key === lastSyncRef.current) return;
    lastSyncRef.current = key;
    const newDoc = resumeToTipTap(content, title);
    editor.commands.setContent(newDoc);
  }, [editor, title, content]);

  // Sync font from theme
  useEffect(() => {
    if (!editor) return;
    const family = fontFamilyMap[theme.font] ?? fontFamilyMap.sans;
    editor.commands.setFontFamily(family);
  }, [editor, theme.font]);

  const fontStyle: React.CSSProperties = {
    fontFamily: fontFamilyMap[theme.font] ?? fontFamilyMap.sans,
    fontSize: `${theme.fontSize}pt`,
    lineHeight: theme.lineHeight,
    letterSpacing: `${theme.letterSpacing}em`,
    color: "#111827",
  };

  const padding = theme.margins === "narrow"
    ? "16mm"
    : theme.margins === "wide"
    ? "28mm"
    : "20mm";

  return (
    <div className="relative w-full">
      {/* BubbleMenu — floating format bar on text selection */}
      {editor && <EditorBubbleMenu editor={editor} />}

      {/* A4 page */}
      <div
        className="relative mx-auto bg-white dark:bg-zinc-900 shadow-md ring-1 ring-zinc-200 dark:ring-zinc-800"
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding,
          ...fontStyle,
        }}
      >
        <EditorContent
          editor={editor}
          className="w-full min-h-full"
          style={fontStyle}
        />

        {/* Block inserter */}
        {editor && <BlockInserter editor={editor} />}
      </div>

      {/* TipTap editor styles */}
      <style>{`
        .ProseMirror {
          outline: none;
          min-height: 260mm;
        }
        .ProseMirror h1 {
          font-size: 1.9em;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 0.25em;
          letter-spacing: -0.02em;
        }
        .ProseMirror h2 {
          font-size: 1.1em;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 1em;
          margin-bottom: 0.25em;
          color: ${theme.accent};
          border-bottom: 1.5px solid ${theme.accent};
          padding-bottom: 0.2em;
        }
        .ProseMirror h3 {
          font-size: 1em;
          font-weight: 600;
          margin-top: 0.75em;
          margin-bottom: 0.1em;
        }
        .ProseMirror h4, .ProseMirror h5, .ProseMirror h6 {
          font-size: 0.9em;
          font-weight: 600;
          margin-top: 0.5em;
        }
        .ProseMirror p {
          margin: 0.2em 0;
          min-height: 1.4em;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.4em;
          margin: 0.2em 0;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.4em;
          margin: 0.2em 0;
        }
        .ProseMirror li p { margin: 0; }
        .ProseMirror ul[data-type="taskList"] { list-style: none; padding-left: 0; }
        .ProseMirror ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 0.5em; }
        .ProseMirror ul[data-type="taskList"] input[type="checkbox"] { margin-top: 0.25em; }
        .ProseMirror blockquote {
          border-left: 3px solid ${theme.accent};
          padding-left: 1em;
          color: #6b7280;
          margin: 0.5em 0;
        }
        .ProseMirror hr {
          border: none;
          border-top: 2px dashed #d1d5db;
          margin: 1em 0;
        }
        .ProseMirror code {
          background: #f3f4f6;
          padding: 0.1em 0.3em;
          border-radius: 3px;
          font-family: monospace;
          font-size: 0.85em;
        }
        .ProseMirror pre {
          background: #1f2937;
          color: #f9fafb;
          padding: 0.75em 1em;
          border-radius: 6px;
          overflow-x: auto;
        }
        .ProseMirror a { color: #3b82f6; text-decoration: underline; }
        .ProseMirror mark { padding: 0 2px; border-radius: 2px; }
        /* Placeholder */
        .ProseMirror p.is-editor-empty:first-child::before,
        .ProseMirror .is-empty::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        /* Selection */
        .ProseMirror ::selection { background: rgba(59,130,246,0.2); }

        /* Print styles */
        @media print {
          .ProseMirror h2 { color: #111 !important; border-bottom-color: #111 !important; }
        }
      `}</style>
    </div>
  );
}
