"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import type { ResumeTheme, ResumeSection } from "@/features/resumes/types";
import type { ContentTool } from "@/features/resumes/content-tools";

type WorkspaceToolbarProps = {
  activeSection: ResumeSection | null;
  theme: ResumeTheme;
  onThemeChange: (patch: Partial<ResumeTheme>) => void;
  onSectionChange: (id: string, patch: Partial<ResumeSection>) => void;
  onTool: (id: string, tool: ContentTool) => void;
  onDuplicate: (id: string) => void;
  onMove?: (id: string, direction: "up" | "down") => void;
  onDelete: (id: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
};

// ─── helpers ──────────────────────────────────────────────
function iconBtn(title: string, onClick: () => void, children: React.ReactNode, extra = "") {
  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 ${extra}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1.5 h-6 w-px bg-zinc-200 dark:bg-zinc-800" />;
}

// live word/char count from active editable element
function useWordCount(sectionId: string | null) {
  const [counts, setCounts] = useState({ words: 0, chars: 0 });
  useEffect(() => {
    if (!sectionId) { setCounts({ words: 0, chars: 0 }); return; }
    const update = () => {
      const el = document.getElementById(`section-content-${sectionId}`);
      if (!el) return;
      const text = el.innerText.trim();
      const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
      setCounts({ words, chars: text.length });
    };
    update();
    const el = document.getElementById(`section-content-${sectionId}`);
    el?.addEventListener("input", update);
    return () => el?.removeEventListener("input", update);
  }, [sectionId]);
  return counts;
}

export function WorkspaceToolbar({
  activeSection,
  theme,
  onThemeChange,
  onSectionChange,
  onTool,
  onDuplicate,
  onMove,
  onDelete,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: WorkspaceToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const [activeColor, setActiveColor] = useState("#111827");
  const counts = useWordCount(activeSection?.id ?? null);

  // close color picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!activeSection) return null;

  const getActiveEditable = () => {
    const activeEl = document.activeElement as HTMLElement | null;
    if (activeEl?.isContentEditable) return activeEl;
    const contentEl = document.getElementById(`section-content-${activeSection.id}`) as HTMLElement | null;
    if (contentEl) {
      contentEl.focus();
      const range = document.createRange();
      range.selectNodeContents(contentEl);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      return contentEl;
    }
    return null;
  };

  const runCmd = (command: string, value?: string) => {
    const el = getActiveEditable();
    if (!el) return;
    document.execCommand(command, false, value);
    el.focus();
  };

  const applyFontColor = (color: string) => {
    setActiveColor(color);
    setShowColorPicker(false);
    runCmd("foreColor", color);
  };

  const PRESET_COLORS = [
    "#111827", "#374151", "#6b7280", "#ef4444", "#f97316",
    "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899",
    "#06b6d4", "#ffffff",
  ];

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 flex h-12 w-full items-center justify-between border-b border-zinc-200 bg-white/95 px-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 overflow-x-auto scrollbar-hide"
    >
      {/* ─── LEFT GROUP ─── */}
      <div className="flex items-center gap-0.5 shrink-0">

        {/* Font Family */}
        <select
          value={theme.font}
          onChange={(e) => onThemeChange({ font: e.target.value as ResumeTheme["font"] })}
          className="h-8 rounded-md border-none bg-zinc-50 px-2 text-[11px] font-medium outline-none hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          <option value="sans">Sans Serif</option>
          <option value="serif">Serif</option>
          <option value="mono">Monospace</option>
        </select>

        {/* Font Size */}
        <div className="flex items-center ml-1">
          <button onClick={() => onThemeChange({ fontSize: Math.max(8, theme.fontSize - 0.5) })} className="flex h-8 w-6 items-center justify-center rounded-l-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm font-bold">−</button>
          <span className="min-w-[28px] text-center text-[11px] font-bold border-t border-b border-zinc-200 dark:border-zinc-700 h-8 flex items-center justify-center">{theme.fontSize}</span>
          <button onClick={() => onThemeChange({ fontSize: Math.min(24, theme.fontSize + 0.5) })} className="flex h-8 w-6 items-center justify-center rounded-r-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm font-bold">+</button>
        </div>

        <Divider />

        {/* Paragraph / Heading style selector — H1 through H6 + P */}
        <select
          defaultValue="p"
          onMouseDown={(e) => e.preventDefault()}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "p") runCmd("formatBlock", "P");
            else runCmd("formatBlock", v.toUpperCase());
            e.target.value = "p"; // reset after applying
          }}
          className="h-8 rounded-md border-none bg-zinc-50 px-2 text-[11px] font-medium outline-none hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          title="Paragraph style"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
        </select>

        {/* Bold */}
        {iconBtn("Bold (Ctrl+B)", () => runCmd("bold"),
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
        )}
        {/* Italic */}
        {iconBtn("Italic (Ctrl+I)", () => runCmd("italic"),
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>
        )}
        {/* Underline */}
        {iconBtn("Underline (Ctrl+U)", () => runCmd("underline"),
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" x2="20" y1="21" y2="21"/></svg>
        )}
        {/* Strikethrough */}
        {iconBtn("Strikethrough", () => runCmd("strikeThrough"),
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/></svg>
        )}

        <Divider />

        {/* Font Color Picker */}
        <div className="relative" ref={colorPickerRef}>
          <button
            onMouseDown={(e) => { e.preventDefault(); setShowColorPicker(!showColorPicker); }}
            className="flex h-8 w-8 flex-col items-center justify-center gap-0.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Font Color"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 7 6.5 17"/><path d="M15 7l2.5 10"/><path d="M5 12h14"/><path d="M3 19h18"/></svg>
            <div className="h-1 w-5 rounded-sm" style={{ backgroundColor: activeColor }} />
          </button>
          {showColorPicker && (
            <div className="absolute left-0 top-9 z-50 rounded-xl border border-zinc-200 bg-white p-2.5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 grid grid-cols-6 gap-1.5 w-[136px]">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => applyFontColor(c)}
                  className={`h-5 w-5 rounded-full border-2 transition hover:scale-110 ${c === activeColor ? "border-zinc-900 dark:border-zinc-100" : "border-transparent"} ${c === "#ffffff" ? "ring-1 ring-zinc-300" : ""}`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
              <div className="col-span-6 mt-1">
                <input
                  type="color"
                  value={activeColor}
                  onChange={(e) => applyFontColor(e.target.value)}
                  className="h-6 w-full cursor-pointer rounded border-0 bg-transparent"
                  title="Custom color"
                />
              </div>
            </div>
          )}
        </div>

        <Divider />

        {/* Lists */}
        {iconBtn("Bullet List", () => runCmd("insertUnorderedList"),
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" x2="21" y1="6" y2="6"/><line x1="9" x2="21" y1="12" y2="12"/><line x1="9" x2="21" y1="18" y2="18"/><circle cx="4" cy="6" r="1.2"/><circle cx="4" cy="12" r="1.2"/><circle cx="4" cy="18" r="1.2"/></svg>
        )}
        {iconBtn("Numbered List", () => runCmd("insertOrderedList"),
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M4 14h2l-2 4h2"/></svg>
        )}
        {iconBtn("Insert Link", () => { const url = window.prompt("Enter URL"); if (url?.trim()) runCmd("createLink", url.trim()); },
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L10 5"/><path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 1 0 7.07 7.07L14 18"/></svg>
        )}

        <Divider />

        {/* Alignment — now includes Justify */}
        <div className="flex items-center gap-0.5">
          {(["left", "center", "right", "justify"] as const).map((align) => (
            <button
              key={align}
              onClick={() => {
                if (align === "justify") runCmd("justifyFull");
                else onSectionChange(activeSection.id, { textAlign: align as "left" | "center" | "right" });
              }}
              title={`Align ${align}`}
              className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
                activeSection.textAlign === align
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {align === "left"    && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></svg>}
              {align === "center"  && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="18" x2="6" y1="12" y2="12"/><line x1="17" x2="7" y1="18" y2="18"/></svg>}
              {align === "right"   && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="7" y1="18" y2="18"/></svg>}
              {align === "justify" && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="12" y2="12"/><line x1="21" x2="3" y1="18" y2="18"/></svg>}
            </button>
          ))}
        </div>
      </div>

      {/* ─── RIGHT GROUP ─── */}
      <div className="flex items-center gap-0.5 shrink-0">

        {/* Word / Char Count */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-zinc-50 px-2.5 py-1 text-[10px] font-semibold text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 select-none mr-1">
          <span title="Words">{counts.words}w</span>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <span title="Characters">{counts.chars}c</span>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <button onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)"
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${canUndo ? "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800" : "text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-50"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
          <button onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)"
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${canRedo ? "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800" : "text-zinc-300 dark:text-zinc-700 cursor-not-allowed opacity-50"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
          </button>
        </div>

        <Divider />

        {/* Gap slider */}
        <div className="flex items-center gap-1.5 rounded-lg bg-zinc-50 px-2.5 py-1 dark:bg-zinc-800">
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Gap</span>
          <input type="range" min="0" max="100" step="4"
            value={activeSection.spacing ?? theme.sectionSpacing}
            onChange={(e) => onSectionChange(activeSection.id, { spacing: parseInt(e.target.value) })}
            className="w-16 h-1 bg-zinc-200 rounded-full appearance-none accent-zinc-900 dark:bg-zinc-700 dark:accent-zinc-100"
          />
        </div>

        <Divider />

        {/* Content Tools */}
        <div className="flex items-center gap-0.5">
          {iconBtn("Add bullets", () => onTool(activeSection.id, "bullets"),
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
          )}
          <button onClick={() => onTool(activeSection.id, "quantify")} className="rounded-md px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300" title="Add measurable metrics">Metrics</button>
          <button onClick={() => onTool(activeSection.id, "actionVerbs")} className="rounded-md px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300" title="Replace weak verbs">Verbs</button>
          <button onClick={() => onTool(activeSection.id, "tighten")} className="rounded-md px-1.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300" title="Clean & tighten">Clean</button>
        </div>

        <Divider />

        {/* Section Controls */}
        <div className="flex items-center gap-0.5">
          {/* Collapse / Expand */}
          <button
            onClick={() => onSectionChange(activeSection.id, { collapsed: !activeSection.collapsed })}
            title={activeSection.collapsed ? "Expand Section" : "Collapse Section"}
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            {activeSection.collapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            )}
          </button>
          {iconBtn("Move Up", () => onMove?.(activeSection.id, "up"),
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          )}
          {iconBtn("Move Down", () => onMove?.(activeSection.id, "down"),
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          )}
          {iconBtn("Duplicate Section", () => onDuplicate(activeSection.id),
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><rect width="10" height="10" x="9" y="9" rx="2"/><rect width="10" height="10" x="5" y="5" rx="2"/></svg>
          )}
          <button
            onClick={() => {
              const sel = window.getSelection();
              // If user has text highlighted inside a contentEditable, delete just that text
              if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                const container = range.commonAncestorContainer as HTMLElement;
                const inEditable = container.isContentEditable ||
                  (container.parentElement?.isContentEditable ?? false) ||
                  !!container.parentElement?.closest('[contenteditable="true"]');
                if (inEditable) {
                  document.execCommand("delete");
                  return;
                }
              }
              // Otherwise delete the whole section
              onDelete(activeSection.id);
            }}
            title="Delete selected text, or entire section if no text selected"
            className="flex h-8 w-8 items-center justify-center rounded-md text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
