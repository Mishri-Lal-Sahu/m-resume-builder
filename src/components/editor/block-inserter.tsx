"use client";

import { type Editor } from "@tiptap/react";
import { useState, useEffect, useCallback } from "react";

type Props = { editor: Editor };

type BlockOption = {
  label: string;
  icon: React.ReactNode;
  action: (editor: Editor) => void;
};

const BLOCK_OPTIONS: BlockOption[] = [
  {
    label: "Text",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M17 3H7"/><path d="M12 3v18"/></svg>,
    action: (ed) => ed.chain().focus().setParagraph().run(),
  },
  {
    label: "Heading 1",
    icon: <span className="text-[11px] font-black">H1</span>,
    action: (ed) => ed.chain().focus().setHeading({ level: 1 }).run(),
  },
  {
    label: "Heading 2",
    icon: <span className="text-[11px] font-bold">H2</span>,
    action: (ed) => ed.chain().focus().setHeading({ level: 2 }).run(),
  },
  {
    label: "Heading 3",
    icon: <span className="text-[11px] font-semibold">H3</span>,
    action: (ed) => ed.chain().focus().setHeading({ level: 3 }).run(),
  },
  {
    label: "Bullet List",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>,
    action: (ed) => ed.chain().focus().toggleBulletList().run(),
  },
  {
    label: "Numbered List",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>,
    action: (ed) => ed.chain().focus().toggleOrderedList().run(),
  },
  {
    label: "Task List",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect width="8" height="8" x="3" y="8" rx="1"/><path d="m7 12 2 2 4-4"/><line x1="15" x2="21" y1="10" y2="10"/><line x1="15" x2="21" y1="14" y2="14"/></svg>,
    action: (ed) => ed.chain().focus().toggleTaskList().run(),
  },
  {
    label: "Blockquote",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>,
    action: (ed) => ed.chain().focus().toggleBlockquote().run(),
  },
  {
    label: "Divider",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" x2="21" y1="12" y2="12"/></svg>,
    action: (ed) => ed.chain().focus().setHorizontalRule().run(),
  },
];

export function BlockInserter({ editor }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [hovering, setHovering] = useState(false);

  // Track cursor position to show + button at right y
  const updatePos = useCallback(() => {
    if (!editor) return;
    const { view } = editor;
    const { state } = view;
    const { selection } = state;
    const domPos = view.domAtPos(selection.anchor);
    let node = domPos.node as HTMLElement;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement!;
    const rect = node?.getBoundingClientRect?.();
    if (!rect) return;
    const wrapRect = view.dom.closest(".ProseMirror")?.parentElement?.getBoundingClientRect();
    if (!wrapRect) return;
    setPos({
      top: rect.top - wrapRect.top + rect.height / 2 - 12,
      left: -44,
    });
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    editor.on("selectionUpdate", updatePos);
    editor.on("focus", updatePos);
    return () => {
      editor.off("selectionUpdate", updatePos);
      editor.off("focus", updatePos);
    };
  }, [editor, updatePos]);

  if (!editor.isFocused && !hovering) return null;

  return (
    <div
      className="absolute z-30 flex items-center"
      style={{ top: pos.top, left: pos.left }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setOpen(false); }}
    >
      {/* + button */}
      <button
        onMouseDown={(e) => { e.preventDefault(); setOpen(!open); }}
        className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-150 ${
          open
            ? "border-zinc-400 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-400"
            : "border-zinc-200 bg-white text-zinc-400 hover:border-zinc-400 hover:text-zinc-700 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
        } shadow-sm`}
        title="Insert block"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      </button>

      {/* Block menu */}
      {open && (
        <div className="ml-2 flex flex-col gap-0.5 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 min-w-[160px]">
          <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Insert Block</p>
          {BLOCK_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onMouseDown={(e) => {
                e.preventDefault();
                opt.action(editor);
                setOpen(false);
              }}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="flex h-5 w-5 items-center justify-center text-zinc-500 dark:text-zinc-400">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
