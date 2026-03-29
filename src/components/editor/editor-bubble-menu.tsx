"use client";

import type { Editor } from "@tiptap/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Selection } from "@tiptap/pm/state";

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
  const [tableToolsVisible, setTableToolsVisible] = useState(false);
  const [tableMenuOpen, setTableMenuOpen] = useState(false);
  const [tableToolsPos, setTableToolsPos] = useState({ top: 0, left: 0 });
  const [tableAnchorPos, setTableAnchorPos] = useState<number | null>(null);
  const [tableSelectionJSON, setTableSelectionJSON] = useState<Record<string, unknown> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const getActiveRowElement = useCallback((): HTMLTableRowElement | null => {
    const { view, state } = editor;
    const pos = state.selection.$from.pos;
    const domInfo = view.domAtPos(pos);
    const baseEl =
      domInfo.node instanceof HTMLElement
        ? domInfo.node
        : domInfo.node.parentElement;
    if (!baseEl) return null;
    const cellEl = baseEl.closest("td,th") as HTMLElement | null;
    if (!cellEl) return null;
    return cellEl.closest("tr") as HTMLTableRowElement | null;
  }, [editor]);

  const update = useCallback(() => {
    const { view, state } = editor;
    const { from, to, empty } = state.selection;
    const isCellSelection = Boolean((state.selection as { $anchorCell?: unknown })?.$anchorCell);
    const wrapRect = view.dom.parentElement?.getBoundingClientRect();
    const rowEl = getActiveRowElement();

    if (rowEl && wrapRect) {
      const rowRect = rowEl.getBoundingClientRect();
      const left = Math.max(4, rowRect.left - wrapRect.left - 28);
      const top = Math.max(4, rowRect.top - wrapRect.top + rowRect.height / 2 - 12);
      setTableToolsPos({ top, left });
      setTableToolsVisible(true);
      setTableSelectionJSON(state.selection.toJSON());
      try {
        const cellEl = rowEl.querySelector("td,th") as HTMLElement | null;
        if (!cellEl) throw new Error("No table cell");
        const p = editor.view.posAtDOM(cellEl as HTMLElement, 0);
        setTableAnchorPos(p);
      } catch {
        setTableAnchorPos(null);
      }
    } else {
      setTableToolsVisible(false);
      setTableMenuOpen(false);
      setTableAnchorPos(null);
      setTableSelectionJSON(null);
    }

    // When selecting text/range (including inside table cell), prioritize text popup.
    if (!empty && !isCellSelection) {
      if (!rowEl) {
        setTableToolsVisible(false);
        setTableMenuOpen(false);
      }
    }

    if (empty || tableMenuOpen) { setVisible(false); return; }

    // Get bounding rect of selection
    const start = view.coordsAtPos(from);
    const end   = view.coordsAtPos(to);
    if (!wrapRect) return;

    const left  = Math.max(0, ((start.left + end.left) / 2) - wrapRect.left - 120);
    const top   = start.top - wrapRect.top - 46;

    setPos({ top, left });
    setVisible(true);
  }, [editor, getActiveRowElement, tableMenuOpen]);

  useEffect(() => {
    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    editor.on("blur", () => {
      setVisible(false);
      setShowColors(false);
      setShowHL(false);
      setTableToolsVisible(false);
      setTableMenuOpen(false);
    });
    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor, update]);

  const runTableAction = (action: () => boolean) => {
    // Restore table/cell selection before action (required for merge cells).
    if (tableSelectionJSON) {
      try {
        const sel = Selection.fromJSON(editor.state.doc, tableSelectionJSON);
        const tr = editor.state.tr.setSelection(sel);
        editor.view.dispatch(tr);
      } catch {
        // Fallback: if selection can't be restored (doc changed), focus anchor cell.
        const focusPos = tableAnchorPos !== null ? tableAnchorPos + 1 : undefined;
        if (typeof focusPos === "number") editor.commands.focus(focusPos);
        else editor.commands.focus();
      }
    } else if (!editor.isFocused) {
      const focusPos = tableAnchorPos !== null ? tableAnchorPos + 1 : undefined;
      if (typeof focusPos === "number") editor.commands.focus(focusPos);
      else editor.commands.focus();
    }

    action();
    setTableMenuOpen(false);
  };

  if (!visible && !tableToolsVisible) return null;

  return (
    <>
      {visible && !tableToolsVisible && (
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
      )}

      {tableToolsVisible && (
        <div
          className="absolute z-[60]"
          style={{ top: tableToolsPos.top, left: tableToolsPos.left }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <button
            className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white/95 text-[12px] font-bold text-zinc-700 shadow-md hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/95 dark:text-zinc-200 dark:hover:bg-zinc-800"
            onClick={() => setTableMenuOpen((v) => !v)}
            title="Table actions"
          >
            ⋮
          </button>

          {tableMenuOpen && (
            <div className="absolute left-7 top-0 w-[252px] rounded-xl border border-zinc-200 bg-white/95 p-2 shadow-xl backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/95">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Table Actions</div>
              <div className="max-h-64 overflow-y-auto rounded-md border border-zinc-200 dark:border-zinc-700">
                <ul className="divide-y divide-zinc-200 text-[12px] dark:divide-zinc-700">
                  <li><button className="w-full px-2 py-1.5 text-left text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800" onClick={() => runTableAction(() => editor.commands.addRowBefore())}>Add Row Above</button></li>
                  <li><button className="w-full px-2 py-1.5 text-left text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800" onClick={() => runTableAction(() => editor.commands.addRowAfter())}>Add Row Below</button></li>
                  <li><button className="w-full px-2 py-1.5 text-left text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800" onClick={() => runTableAction(() => editor.commands.addColumnBefore())}>Add Column Left</button></li>
                  <li><button className="w-full px-2 py-1.5 text-left text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800" onClick={() => runTableAction(() => editor.commands.addColumnAfter())}>Add Column Right</button></li>
                  <li><button className="w-full px-2 py-1.5 text-left text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800" onClick={() => runTableAction(() => editor.commands.mergeCells())}>Merge Selected Cells</button></li>
                  <li><button className="w-full px-2 py-1.5 text-left text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800" onClick={() => runTableAction(() => editor.commands.splitCell())}>Split Cell</button></li>
                  <li><button className="w-full px-2 py-1.5 text-left text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40" onClick={() => runTableAction(() => editor.commands.deleteRow())}>Delete Row</button></li>
                  <li><button className="w-full px-2 py-1.5 text-left text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40" onClick={() => runTableAction(() => editor.commands.deleteColumn())}>Delete Column</button></li>
                  <li><button className="w-full px-2 py-1.5 text-left font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40" onClick={() => runTableAction(() => editor.commands.deleteTable())}>Delete Table</button></li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
