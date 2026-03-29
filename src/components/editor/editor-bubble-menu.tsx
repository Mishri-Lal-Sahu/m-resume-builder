"use client";

import type { Editor } from "@tiptap/react";
import { useState, useEffect, useRef, useCallback } from "react";

type Props = { editor: Editor };

function Btn({
  active, onClick, title, children,
}: {
  active?: boolean; onClick: () => void; title: string; children: React.ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded text-xs font-bold transition-all ${
        active ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
               : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
      }`}
    >
      {children}
    </button>
  );
}

const TEXT_COLORS = ["#111827","#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899"];
const HL_COLORS  = ["#fef08a","#bbf7d0","#bfdbfe","#fecaca","#e9d5ff","#fed7aa"];

export function EditorBubbleMenu({ editor }: Props) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [showColors, setShowColors] = useState(false);
  const [showHL, setShowHL] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const update = useCallback(() => {
    const { view, state } = editor;
    const { from, to, empty } = state.selection;
    if (empty) { setVisible(false); return; }

    // Get bounding rect of selection
    const start = view.coordsAtPos(from);
    const end   = view.coordsAtPos(to);
    const wrapRect = view.dom.parentElement?.getBoundingClientRect();
    if (!wrapRect) return;

    const left  = Math.max(0, ((start.left + end.left) / 2) - wrapRect.left - 120);
    const top   = start.top - wrapRect.top - 46;

    setPos({ top, left });
    setVisible(true);
  }, [editor]);

  useEffect(() => {
    editor.on("selectionUpdate", update);
    editor.on("blur", () => { setVisible(false); setShowColors(false); setShowHL(false); });
    return () => {
      editor.off("selectionUpdate", update);
    };
  }, [editor, update]);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 flex items-center gap-0.5 rounded-xl border border-zinc-200 bg-white p-1 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
      style={{ top: pos.top, left: pos.left, minWidth: 260 }}
      onMouseDown={(e) => e.preventDefault()} // keep selection alive
    >
      {/* Heading level */}
      <select
        value={
          editor.isActive("heading", { level: 1 }) ? "1"
          : editor.isActive("heading", { level: 2 }) ? "2"
          : editor.isActive("heading", { level: 3 }) ? "3"
          : "p"
        }
        onChange={(e) => {
          const v = e.target.value;
          if (v === "p") editor.chain().focus().setParagraph().run();
          else editor.chain().focus().toggleHeading({ level: parseInt(v) as 1|2|3|4|5|6 }).run();
        }}
        className="h-7 rounded bg-zinc-50 px-1 text-xs text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 outline-none"
      >
        <option value="p">¶ Text</option>
        <option value="1">H1</option>
        <option value="2">H2</option>
        <option value="3">H3</option>
      </select>

      <div className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-700" />

      <Btn active={editor.isActive("bold")}      onClick={() => editor.chain().focus().toggleBold().run()}      title="Bold (Ctrl+B)"><strong>B</strong></Btn>
      <Btn active={editor.isActive("italic")}    onClick={() => editor.chain().focus().toggleItalic().run()}    title="Italic (Ctrl+I)"><em>I</em></Btn>
      <Btn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline (Ctrl+U)"><span className="underline">U</span></Btn>
      <Btn active={editor.isActive("strike")}    onClick={() => editor.chain().focus().toggleStrike().run()}    title="Strikethrough"><span className="line-through">S</span></Btn>

      <div className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-700" />

      {/* Text color */}
      <div className="relative">
        <Btn active={showColors} onClick={() => { setShowColors(!showColors); setShowHL(false); }} title="Text Colour">
          <span style={{ color: editor.getAttributes("textStyle").color ?? "#111" }} className="font-black">A</span>
        </Btn>
        {showColors && (
          <div className="absolute left-0 top-full mt-1 z-50 flex gap-1 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            {TEXT_COLORS.map((c) => (
              <button key={c} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(c).run(); setShowColors(false); }}
                className="h-5 w-5 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
            ))}
            <button onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); setShowColors(false); }}
              className="h-5 w-5 rounded-full border border-zinc-300 bg-white text-[8px] font-bold text-zinc-500 hover:border-zinc-500 transition">✕</button>
          </div>
        )}
      </div>

      {/* Highlight */}
      <div className="relative">
        <Btn active={showHL || editor.isActive("highlight")} onClick={() => { setShowHL(!showHL); setShowColors(false); }} title="Highlight">
          <span className="text-base">🖊</span>
        </Btn>
        {showHL && (
          <div className="absolute left-0 top-full mt-1 z-50 flex gap-1 rounded-lg border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            {HL_COLORS.map((c) => (
              <button key={c} onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHighlight({ color: c }).run(); setShowHL(false); }}
                className="h-5 w-5 rounded border border-zinc-200 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
            ))}
            <button onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetHighlight().run(); setShowHL(false); }}
              className="h-5 w-5 rounded border border-zinc-300 bg-white text-[8px] font-bold text-zinc-500">✕</button>
          </div>
        )}
      </div>

      <div className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-700" />

      <Btn active={editor.isActive("bulletList")}  onClick={() => editor.chain().focus().toggleBulletList().run()}  title="Bullet List">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
      </Btn>
      <Btn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
      </Btn>

      <div className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-700" />

      <Btn active={false} onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 7V4h16v3"/><path d="M5 20h6"/><path d="M13 4 8 20"/><line x1="22" x2="16" y1="15" y2="21"/><line x1="16" x2="22" y1="15" y2="21"/></svg>
      </Btn>
    </div>
  );
}
