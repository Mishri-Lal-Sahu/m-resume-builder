"use client";

import type { Editor } from "@tiptap/react";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

function Btn({
  active, onClick, title, children, disabled
}: {
  active?: boolean; onClick: () => void; title: string; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded text-[13px] font-bold transition-all ${disabled ? "opacity-30 cursor-not-allowed" :
          active ? "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200"
            : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        }`}
    >
      {children}
    </button>
  );
}

const Divider = () => <div className="mx-1 h-5 w-px bg-zinc-200 dark:bg-zinc-700 shrink-0" />;

// Color picker popover helper
function ColorPicker({
  icon,
  currentColor,
  onColorSelect,
  title
}: {
  icon: React.ReactNode;
  currentColor: string;
  onColorSelect: (c: string | null) => void;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const colors = [
    "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#cccccc", "#d9d9d9", "#efefef", "#f3f3f3", "#ffffff",
    "#980000", "#ff0000", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff", "#ff00ff",
    "#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#cfe2f3", "#d9d2e9", "#ead1dc",
    "#cc4125", "#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6d9eeb", "#9fc5e8", "#b4a7d6", "#d5a6bd",
  ];

  const updateMenuPosition = () => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const menuWidth = 192; // w-48
    const margin = 8;
    const left = Math.max(margin, Math.min(rect.left, window.innerWidth - menuWidth - margin));
    setMenuPos({ top: rect.bottom + 6, left });
  };

  const toggleOpen = () => {
    if (!open) {
      updateMenuPosition();
      setOpen(true);
      return;
    }
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleScroll = () => setOpen(false);
    const handleResize = () => updateMenuPosition();

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Btn active={open} onClick={toggleOpen} title={title}>{icon}</Btn>
      {open && menuPos && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[150] w-48 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xl rounded-lg grid grid-cols-10 gap-1"
          style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
          onMouseDown={e => e.preventDefault()}
        >
          {colors.map(c => (
            <button key={c} onClick={() => { onColorSelect(c); setOpen(false); }} title={c}
              className={`w-3.5 h-3.5 rounded-sm border ${c === currentColor ? 'border-blue-500 scale-125 z-10' : 'border-zinc-200 dark:border-zinc-700 hover:scale-110'}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <div className="col-span-10 mt-1 flex justify-center">
            <button onClick={() => { onColorSelect(null); setOpen(false); }} className="text-[10px] w-full py-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">Reset Color</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export function DocsToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return <div className="h-8 animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded w-full" />;

  return (
    <>
      <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide py-0.5">
        {/* Undo / Redo */}
        <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
        </Btn>

        <Divider />

        {/* Styles */}
        <select
          value={
            editor.isActive("heading", { level: 1 }) ? "1" :
              editor.isActive("heading", { level: 2 }) ? "2" :
                editor.isActive("heading", { level: 3 }) ? "3" :
                  editor.isActive("heading", { level: 4 }) ? "4" :
                    editor.isActive("heading", { level: 5 }) ? "5" :
                      editor.isActive("heading", { level: 6 }) ? "6" : "p"
          }
          onChange={(e) => {
            const v = e.target.value;
            if (v === "p") editor.chain().focus().setParagraph().run();
            else editor.chain().focus().setHeading({ level: Number(v) as 1 | 2 | 3 | 4 | 5 | 6 }).run();
          }}
          className="h-7 w-28 rounded hover:bg-zinc-100 px-1.5 text-xs text-zinc-700 border-transparent bg-transparent outline-none dark:hover:bg-zinc-800 dark:text-zinc-300 font-medium cursor-pointer"
        >
          <option value="p">Normal text</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="4">Heading 4</option>
          <option value="5">Heading 5</option>
          <option value="6">Heading 6</option>
        </select>

        <Divider />

        {/* Font Family */}
        <select
          value={editor.getAttributes('textStyle').fontFamily || "Arial"}
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
          className="h-7 w-24 rounded hover:bg-zinc-100 px-1.5 text-xs text-zinc-700 border-transparent bg-transparent outline-none dark:hover:bg-zinc-800 dark:text-zinc-300 font-medium cursor-pointer"
        >
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Inter">Inter</option>
          <option value="Times New Roman">Times Roman</option>
          <option value="Courier New">Courier New</option>
        </select>

        <Divider />

        {/* Font Size */}
        <div className="flex items-center">
          <button
            onClick={() => {
              const current = parseInt(editor.getAttributes('textStyle').fontSize || "11");
              if (current > 1) editor.chain().focus().setFontSize(`${current - 1}pt`).run();
            }}
            className="h-7 w-6 flex justify-center items-center text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded font-bold"
          >-</button>
          <input
            type="number"
            value={parseInt(editor.getAttributes('textStyle').fontSize || "11")}
            onChange={(e) => editor.chain().focus().setFontSize(`${e.target.value}pt`).run()}
            className="h-7 w-10 text-center text-xs bg-transparent border border-transparent hover:border-zinc-200 focus:border-blue-500 outline-none rounded appearance-none"
          />
          <button
            onClick={() => {
              const current = parseInt(editor.getAttributes('textStyle').fontSize || "11");
              if (current < 100) editor.chain().focus().setFontSize(`${current + 1}pt`).run();
            }}
            className="h-7 w-6 flex justify-center items-center text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded font-bold"
          >+</button>
        </div>

        <Divider />

        {/* Formatting */}
        <Btn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)">
          <span className="font-black font-serif text-[15px]">B</span>
        </Btn>
        <Btn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)">
          <span className="font-serif italic text-[15px]">I</span>
        </Btn>
        <Btn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline (Ctrl+U)">
          <span className="font-serif underline text-[15px]">U</span>
        </Btn>
        <Btn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
          <span className="font-serif line-through text-[15px]">S</span>
        </Btn>
        <Btn active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code">
          <span className="font-mono text-[11px]">&lt;/&gt;</span>
        </Btn>
        <Btn active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </Btn>

        <Divider />

        {/* Color and Highlight */}
        <ColorPicker
          title="Text Color"
          currentColor={editor.getAttributes('textStyle').color || "#000000"}
          onColorSelect={(c) => c ? editor.chain().focus().setColor(c).run() : editor.chain().focus().unsetColor().run()}
          icon={<span className="border-b-4 leading-none h-4 font-bold font-serif" style={{ borderColor: editor.getAttributes('textStyle').color || "#000" }}>A</span>}
        />
        <ColorPicker
          title="Highlight Color"
          currentColor={editor.getAttributes('highlight').color || "#ffffff"}
          onColorSelect={(c) => c ? editor.chain().focus().setHighlight({ color: c }).run() : editor.chain().focus().unsetHighlight().run()}
          icon={<span className="border-b-4 leading-none h-4" style={{ borderColor: editor.getAttributes('highlight').color || "#fef08a" }}>🖊</span>}
        />

        <Divider />

        {/* Alignment */}
        <Btn active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Left align">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><line x1="21" x2="3" y1="6" y2="6" /><line x1="15" x2="3" y1="12" y2="12" /><line x1="17" x2="3" y1="18" y2="18" /></svg>
        </Btn>
        <Btn active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Center align">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><line x1="21" x2="3" y1="6" y2="6" /><line x1="17" x2="7" y1="12" y2="12" /><line x1="19" x2="5" y1="18" y2="18" /></svg>
        </Btn>
        <Btn active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Right align">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><line x1="21" x2="3" y1="6" y2="6" /><line x1="21" x2="9" y1="12" y2="12" /><line x1="21" x2="7" y1="18" y2="18" /></svg>
        </Btn>

        <Divider />

        {/* Lists */}
        <Btn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bulleted list (Ctrl+Shift+8)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><circle cx="4" cy="6" r="1.5" /><circle cx="4" cy="12" r="1.5" /><circle cx="4" cy="18" r="1.5" /></svg>
        </Btn>
        <Btn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list (Ctrl+Shift+7)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="10" x2="21" y1="6" y2="6" /><line x1="10" x2="21" y1="12" y2="12" /><line x1="10" x2="21" y1="18" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></svg>
        </Btn>

        <Divider />

        {/* Indentation (Blocks) */}
        <Btn onClick={() => editor.chain().focus().sinkListItem("listItem").run()} disabled={!editor.can().sinkListItem("listItem")} title="Increase indent (Tab)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="21" x2="11" y1="12" y2="12" /><line x1="21" x2="11" y1="6" y2="6" /><line x1="21" x2="11" y1="18" y2="18" /><polyline points="3 8 7 12 3 16" /></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().liftListItem("listItem").run()} disabled={!editor.can().liftListItem("listItem")} title="Decrease indent (Shift+Tab)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="21" x2="11" y1="12" y2="12" /><line x1="21" x2="11" y1="6" y2="6" /><line x1="21" x2="11" y1="18" y2="18" /><polyline points="7 8 3 12 7 16" /></svg>
        </Btn>

        <Divider />

        {/* Clear Formatting */}
        <Btn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 7V4h16v3" /><path d="M5 20h6" /><path d="M13 4 8 20" /><line x1="22" x2="16" y1="15" y2="21" /><line x1="16" x2="22" y1="15" y2="21" /></svg>
        </Btn>

        <Divider />

        {/* Advanced Inserts */}
        <Btn active={editor.isActive("link")} onClick={() => {
          const prevUrl = editor.getAttributes("link").href;
          const url = window.prompt("Enter link URL", prevUrl || "https://");
          if (url === null) return;
          if (url === "") editor.chain().focus().unsetLink().run();
          else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }} title="Insert Link (Ctrl+K)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
        </Btn>
        <Btn onClick={() => {
          const url = window.prompt("Enter image URL");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }} title="Insert Image">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
        </Btn>
        <Btn active={editor.isActive("table")} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert Table">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><line x1="3" x2="21" y1="15" y2="15" /><line x1="9" x2="9" y1="3" y2="21" /><line x1="15" x2="15" y1="3" y2="21" /></svg>
        </Btn>
      </div>

      {editor.isActive('table') && (
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1 border-t border-zinc-100 dark:border-zinc-800 mt-1 pl-1 bg-yellow-50/50 dark:bg-yellow-900/10">
          <span className="text-[10px] uppercase font-bold text-zinc-500 mr-2">Table:</span>
          <Btn onClick={() => editor.chain().focus().addColumnBefore().run()} title="Add column before"><span className="text-[11px]">Col +L</span></Btn>
          <Btn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add column after"><span className="text-[11px]">Col +R</span></Btn>
          <Btn onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete column"><span className="text-[11px] text-red-500">Del Col</span></Btn>
          <Divider />
          <Btn onClick={() => editor.chain().focus().addRowBefore().run()} title="Add row before"><span className="text-[11px]">Row +U</span></Btn>
          <Btn onClick={() => editor.chain().focus().addRowAfter().run()} title="Add row after"><span className="text-[11px]">Row +D</span></Btn>
          <Btn onClick={() => editor.chain().focus().deleteRow().run()} title="Delete row"><span className="text-[11px] text-red-500">Del Row</span></Btn>
          <Divider />
          <Btn onClick={() => editor.chain().focus().mergeCells().run()} title="Merge cells"><span className="text-[11px]">Merge</span></Btn>
          <Btn onClick={() => editor.chain().focus().splitCell().run()} title="Split cell"><span className="text-[11px]">Split</span></Btn>
          <Divider />
          <ColorPicker
            title="Cell Background"
            currentColor={editor.getAttributes('tableCell').backgroundColor || editor.getAttributes('tableHeader').backgroundColor || "#ffffff"}
            onColorSelect={(c) => editor.chain().focus().setCellAttribute('backgroundColor', c).run()}
            icon={<span className="text-[10px] font-bold px-1 rounded" style={{ backgroundColor: editor.getAttributes('tableCell').backgroundColor || editor.getAttributes('tableHeader').backgroundColor || "transparent" }}>Fill</span>}
          />
          <ColorPicker
            title="Border Color"
            currentColor={editor.getAttributes('tableCell').borderColor || editor.getAttributes('tableHeader').borderColor || "#e5e7eb"}
            onColorSelect={(c) => editor.chain().focus().setCellAttribute('borderColor', c).run()}
            icon={<div className="w-3 h-3 border-2 border-zinc-400" />}
          />
          <select
            onChange={(e) => editor.chain().focus().setCellAttribute('borderWidth', e.target.value).run()}
            value={editor.getAttributes('tableCell').borderWidth || editor.getAttributes('tableHeader').borderWidth || "1px"}
            className="h-6 text-[10px] bg-transparent border border-zinc-200 dark:border-zinc-700 rounded px-1 outline-none"
          >
            <option value="0px">0px</option>
            <option value="1px">1px</option>
            <option value="2px">2px</option>
            <option value="3px">3px</option>
          </select>
          <Divider />
          <Btn onClick={() => editor.chain().focus().setCellAttribute('verticalAlign', 'top').run()} title="Align Top"><span className="text-[11px] font-bold">^ Top</span></Btn>
          <Btn onClick={() => editor.chain().focus().setCellAttribute('verticalAlign', 'middle').run()} title="Align Middle"><span className="text-[11px] font-bold">- Mid</span></Btn>
          <Btn onClick={() => editor.chain().focus().setCellAttribute('verticalAlign', 'bottom').run()} title="Align Bottom"><span className="text-[11px] font-bold">v Bot</span></Btn>
          <Divider />
          <Btn onClick={() => editor.chain().focus().deleteTable().run()} title="Delete table"><span className="text-[11px] text-red-500 font-bold">Delete Table</span></Btn>
        </div>
      )}
    </>
  );
}
