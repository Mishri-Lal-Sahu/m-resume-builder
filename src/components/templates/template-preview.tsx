"use client";

import Image from "next/image";
import type { TemplateRenderProps } from "@/features/templates/types";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState, useEffect, useRef } from "react";
import { SlashMenu } from "@/components/builder/slash-menu";
import type { ResumeSectionType } from "@/features/resumes/types";
import type { ContentTool } from "@/features/resumes/content-tools";

// ─────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────

function fontClass(font: TemplateRenderProps["theme"]["font"]) {
  if (font === "serif") return "font-serif";
  if (font === "mono") return "font-mono";
  return "font-sans";
}

function densityGap(density: TemplateRenderProps["theme"]["density"]) {
  if (density === "compact") return 8;
  if (density === "spacious") return 26;
  return 16;
}

function marginPadding(margins: TemplateRenderProps["theme"]["margins"]) {
  if (margins === "narrow") return "p-[8mm]";
  if (margins === "wide") return "p-[28mm]";
  return "p-[16mm]";
}

function paginateSections<T>(items: T[], pages: number): T[][] {
  const count = Math.max(1, Math.min(10, pages));
  const result = Array.from({ length: count }, () => [] as T[]);
  if (items.length === 0) return result;
  const perPage = Math.ceil(items.length / count);
  for (let i = 0; i < count; i++) result[i] = items.slice(i * perPage, i * perPage + perPage);
  return result;
}

// ─────────────────────────────────────────────────────────
// SectionItem — ALL templates use this for full edit support
// ─────────────────────────────────────────────────────────

type SectionItemProps = {
  section: TemplateRenderProps["sections"][number];
  theme: TemplateRenderProps["theme"];
  selected: boolean;
  onSelect: (id: string) => void;
  onChangeSection?: TemplateRenderProps["onChangeSection"];
  onAddSection?: (type: ResumeSectionType, atIndex?: number) => void;
  onAddText?: (size: number, label: string, atIndex?: number) => void;
  onTool?: (id: string, tool: ContentTool) => void;
  readOnly?: boolean;
  // Visual customisation per template
  headingClass?: string;
  headingStyle?: React.CSSProperties;
  contentClass?: string;
  contentStyle?: React.CSSProperties;
  outerClass?: string;
  /** render heading + content in a row instead of stacked column */
  horizontal?: boolean;
  /** hide the section heading (used in minimal-style) */
  labelWidth?: string; // e.g. "6rem"
};

function SectionItem({
  section, theme, selected, onSelect,
  onChangeSection, onAddSection, onAddText, onTool, readOnly,
  headingClass, headingStyle, contentClass, contentStyle, outerClass,
  horizontal, labelWidth,
}: SectionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    disabled: readOnly,
  });

  // ── resize/move state ───────────────────────────────────
  const [isBoxResizing, setIsBoxResizing] = useState<"width" | "height" | "both" | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const startY = useRef(0), startX = useRef(0);
  const startWidth = useRef(0), startHeight = useRef(0);
  const startPosX = useRef(0), startPosY = useRef(0);

  const [slashMenu, setSlashMenu] = useState<{ open: boolean; pos: { top: number; left: number } }>({ open: false, pos: { top: 0, left: 0 } });

  const isAbsolute = section.x !== undefined && section.y !== undefined;

  const outerStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: (isBoxResizing || isMoving) ? "none" : transition,
    marginBottom: isAbsolute ? 0 : `${section.spacing ?? theme.sectionSpacing}px`,
    opacity: isDragging ? 0.4 : 1,
    zIndex: (isDragging || isBoxResizing || isMoving) ? 50 : "auto",
    width: section.width ? `${section.width}%` : "100%",
    minHeight: section.height ? `${section.height}px` : "auto",
    position: isAbsolute ? "absolute" : "relative",
    left: isAbsolute ? `${section.x}%` : undefined,
    top: isAbsolute ? `${section.y}%` : undefined,
  };

  // ── drag listeners ──────────────────────────────────────
  useEffect(() => {
    if (isBoxResizing) {
      const onMove = (e: MouseEvent) => {
        const dx = e.clientX - startX.current, dy = e.clientY - startY.current;
        const u: Partial<TemplateRenderProps["sections"][number]> = {};
        if (isBoxResizing === "width" || isBoxResizing === "both") u.width = Math.max(10, Math.min(100, startWidth.current + (dx / 800) * 100));
        if (isBoxResizing === "height" || isBoxResizing === "both") u.height = Math.max(20, startHeight.current + dy);
        onChangeSection?.(section.id, u, { skipHistory: true });
      };
      const onUp = (e: MouseEvent) => {
        const dx = e.clientX - startX.current, dy = e.clientY - startY.current;
        const u: Partial<TemplateRenderProps["sections"][number]> = {};
        if (isBoxResizing === "width" || isBoxResizing === "both") u.width = Math.max(10, Math.min(100, startWidth.current + (dx / 800) * 100));
        if (isBoxResizing === "height" || isBoxResizing === "both") u.height = Math.max(20, startHeight.current + dy);
        onChangeSection?.(section.id, u);
        setIsBoxResizing(null); document.body.style.cursor = "";
      };
      window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
      return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    }
    if (isMoving) {
      const onMove = (e: MouseEvent) => {
        onChangeSection?.(section.id, {
          x: Math.max(0, Math.min(90, startPosX.current + ((e.clientX - startX.current) / 800) * 100)),
          y: Math.max(0, Math.min(95, startPosY.current + ((e.clientY - startY.current) / 1120) * 100)),
        }, { skipHistory: true });
      };
      const onUp = (e: MouseEvent) => {
        onChangeSection?.(section.id, {
          x: Math.max(0, Math.min(90, startPosX.current + ((e.clientX - startX.current) / 800) * 100)),
          y: Math.max(0, Math.min(95, startPosY.current + ((e.clientY - startY.current) / 1120) * 100)),
        });
        setIsMoving(false); document.body.style.cursor = "";
      };
      window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
      return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    }
  }, [isBoxResizing, isMoving, section.id, onChangeSection]);

  const onBoxResizeStart = (e: React.MouseEvent, t: "width" | "height" | "both") => {
    e.preventDefault(); e.stopPropagation(); setIsBoxResizing(t);
    startX.current = e.clientX; startY.current = e.clientY;
    startWidth.current = section.width ?? 100; startHeight.current = section.height ?? 0;
    document.body.style.cursor = t === "width" ? "ew-resize" : t === "height" ? "ns-resize" : "nwse-resize";
  };
  const onMoveStart = (e: React.MouseEvent) => {
    if (readOnly || !e.shiftKey) return;
    if ((e.target as HTMLElement).closest('[contenteditable="true"]') || (e.target as HTMLElement).closest("button")) return;
    e.preventDefault(); setIsMoving(true);
    startX.current = e.clientX; startY.current = e.clientY;
    startPosX.current = section.x ?? 0; startPosY.current = section.y ?? 0;
    document.body.style.cursor = "move";
  };

  const resolvedHStyle: React.CSSProperties = { fontSize: `${(section.fontSize ?? theme.fontSize) * 0.95}pt`, ...headingStyle };
  const resolvedCStyle: React.CSSProperties = { lineHeight: theme.lineHeight, letterSpacing: `${theme.letterSpacing}em`, fontSize: `${(section.fontSize ?? theme.fontSize) * 0.88}pt`, ...contentStyle };

  const innerContent = (
    <div className={`relative ${selected ? "border-l-2 border-zinc-300 dark:border-zinc-600 pl-2" : "border-l-2 border-transparent pl-2"} transition-all duration-150`}>
      {/* Heading */}
      {horizontal ? (
        <div className={`shrink-0 pt-px ${labelWidth ? "" : "w-24"}`} style={labelWidth ? { width: labelWidth } : {}}>
          <span
            id={`section-title-${section.id}`}
            className={`outline-none block ${headingClass ?? "text-[0.65em] font-semibold uppercase tracking-widest text-zinc-400"}`}
            style={resolvedHStyle}
            contentEditable={!readOnly && selected}
            suppressContentEditableWarning
            onBlur={(e) => onChangeSection?.(section.id, { title: e.currentTarget.innerText })}
          >{section.title}</span>
        </div>
      ) : (
        <h3
          id={`section-title-${section.id}`}
          className={`outline-none ${headingClass ?? "font-semibold uppercase tracking-wider text-[0.72em]"}`}
          style={resolvedHStyle}
          contentEditable={!readOnly && selected}
          suppressContentEditableWarning
          onBlur={(e) => onChangeSection?.(section.id, { title: e.currentTarget.innerText })}
        >{section.title}</h3>
      )}

      {/* Content */}
      <div
        id={`section-content-${section.id}`}
        className={`outline-none min-h-[1em] ${contentClass ?? "whitespace-pre-wrap text-zinc-600 dark:text-zinc-400 mt-0.5"}`}
        style={resolvedCStyle}
        contentEditable={!readOnly && selected}
        suppressContentEditableWarning
        onKeyDown={(e) => {
          if (e.key === "/" && !slashMenu.open) {
            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
              const r = sel.getRangeAt(0).getBoundingClientRect();
              setSlashMenu({ open: true, pos: { top: r.bottom + window.scrollY, left: r.left + window.scrollX } });
            }
          }
        }}
        onBlur={(e) => {
          const val = e.currentTarget.innerHTML;
          setTimeout(() => { if (val !== undefined) onChangeSection?.(section.id, { content: val }); }, 200);
        }}
        dangerouslySetInnerHTML={{ __html: section.content }}
      />

      {!readOnly && selected && (
        <SlashMenu
          isOpen={slashMenu.open}
          onClose={() => setSlashMenu((p) => ({ ...p, open: false }))}
          position={slashMenu.pos}
          onSelectTool={(tool) => onTool?.(section.id, tool)}
          onAddSection={(type) => onAddSection?.(type)}
          onAddText={(size, label) => onAddText?.(size, label)}
        />
      )}

      {/* Resize handles — bottom edge only to adjust section gap */}
      {!readOnly && selected && (
        <>
          <div onMouseDown={(e) => onBoxResizeStart(e, "width")} className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-zinc-300/60 dark:hover:bg-zinc-600/60 z-20 transition-colors" />
          <div onMouseDown={(e) => onBoxResizeStart(e, "height")} className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-zinc-300/60 dark:hover:bg-zinc-600/60 z-20 transition-colors" />
        </>
      )}
    </div>
  );

  // ── Page Break special case ─────────────────────────────
  if (section.type === "pageBreak") {
    return (
      <div
        ref={setNodeRef}
        style={{ ...outerStyle, marginBottom: 0 }}
        data-section-id={section.id}
        id={`section-preview-${section.id}`}
        className={`group relative flex items-center gap-2 py-1 print:break-after-page ${outerClass ?? ""}`}
        onClick={() => !readOnly && onSelect(section.id)}
      >
        {!readOnly && (
          <div {...attributes} {...listeners} className="absolute -left-7 top-1 hidden p-1 text-zinc-300 group-hover:flex cursor-grab print:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
          </div>
        )}
        <div className="flex-1 border-t-2 border-dashed border-zinc-300 dark:border-zinc-700 print:border-transparent" />
        <span className="shrink-0 text-[0.6em] font-bold uppercase tracking-widest text-zinc-300 dark:text-zinc-700 print:hidden select-none">Page Break</span>
        <div className="flex-1 border-t-2 border-dashed border-zinc-300 dark:border-zinc-700 print:border-transparent" />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={outerStyle}
      data-section-id={section.id}
      id={`section-preview-${section.id}`}
      onClick={() => !readOnly && onSelect(section.id)}
      onMouseDown={onMoveStart}
      className={`group relative ${outerClass ?? ""} ${horizontal ? "flex gap-4 items-start" : ""}`}
    >
      {/* Drag handle — suppressHydrationWarning silences dnd-kit aria-describedby SSR/client ID mismatch */}
      {!readOnly && (
        <div {...attributes} {...listeners} suppressHydrationWarning className="absolute -left-7 top-1 hidden p-1 text-zinc-300 hover:text-zinc-500 group-hover:flex dark:text-zinc-700 dark:hover:text-zinc-400 print:hidden cursor-grab active:cursor-grabbing z-30">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
        </div>
      )}

      {/* Collapsed state — compact title bar only */}
      {section.collapsed ? (
        <div className={`relative flex items-center gap-2 px-2 py-1.5 rounded-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 ${selected ? "ring-2 ring-zinc-900/60 dark:ring-zinc-100/60" : ""}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 shrink-0"><path d="m6 9 6 6 6-6"/></svg>
          <span className="text-[0.7em] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">{section.title}</span>
          <span className="ml-auto text-[0.6em] text-zinc-400 dark:text-zinc-600 font-medium print:hidden">collapsed</span>
        </div>
      ) : horizontal ? (
        <>
          {/* For horizontal layout, wrap heading + content separately */}
          <div className={`shrink-0 pt-px ${labelWidth ? "" : "w-24"}`} style={labelWidth ? { width: labelWidth } : {}}>
            <span
              id={`section-title-${section.id}`}
              className={`outline-none block ${headingClass ?? "text-[0.65em] font-semibold uppercase tracking-widest text-zinc-400"}`}
              style={resolvedHStyle}
              contentEditable={!readOnly && selected}
              suppressContentEditableWarning
              onBlur={(e) => onChangeSection?.(section.id, { title: e.currentTarget.innerText })}
            >{section.title}</span>
          </div>
          <div className="flex-1 min-w-0 relative">
            <div
              id={`section-content-${section.id}`}
              className={`outline-none min-h-[1em] ${contentClass ?? "whitespace-pre-wrap text-zinc-600 dark:text-zinc-400"}`}
              style={resolvedCStyle}
              contentEditable={!readOnly && selected}
              suppressContentEditableWarning
              onKeyDown={(e) => {
                if (e.key === "/" && !slashMenu.open) {
                  const sel = window.getSelection();
                  if (sel && sel.rangeCount > 0) {
                    const r = sel.getRangeAt(0).getBoundingClientRect();
                    setSlashMenu({ open: true, pos: { top: r.bottom + window.scrollY, left: r.left + window.scrollX } });
                  }
                }
              }}
              onBlur={(e) => {
                const val = e.currentTarget.innerHTML;
                setTimeout(() => { if (val !== undefined) onChangeSection?.(section.id, { content: val }); }, 200);
              }}
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
            {!readOnly && selected && (
              <SlashMenu isOpen={slashMenu.open} onClose={() => setSlashMenu((p) => ({ ...p, open: false }))} position={slashMenu.pos} onSelectTool={(t) => onTool?.(section.id, t)} onAddSection={(t) => onAddSection?.(t)} onAddText={(s, l) => onAddText?.(s, l)} />
            )}
          </div>
        </>
      ) : innerContent}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// InsertionIndicator
// ─────────────────────────────────────────────────────────

function InsertionIndicator({ index, onAddSection, onAddText }: { index: number; onAddSection?: (type: ResumeSectionType, atIndex?: number) => void; onAddText?: (size: number, label: string, atIndex?: number) => void; }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="group relative flex h-5 w-full items-center justify-center print:hidden" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className={`h-px w-full bg-zinc-300 dark:bg-zinc-700 transition-opacity ${hovered ? "opacity-100" : "opacity-0"}`} />
      <div className={`absolute flex items-center gap-1 transition-all duration-150 ${hovered ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        <button onClick={() => onAddSection?.("experience", index)} className="flex h-6 items-center gap-1 rounded-full bg-zinc-900 px-3 text-[10px] font-bold text-white shadow-md active:scale-95 dark:bg-zinc-100 dark:text-zinc-900">
          <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg> Add
        </button>
        <button onClick={() => onAddText?.(11, "Text Block", index)} className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-zinc-800 shadow border border-zinc-200 active:scale-95 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3H7"/><path d="M7 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"/><path d="M12 3v18"/></svg>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SectionList — shared sortable list
// ─────────────────────────────────────────────────────────

type SectionListProps = {
  sections: TemplateRenderProps["sections"];
  theme: TemplateRenderProps["theme"];
  selectedSectionId?: string | null;
  onSelectSection?: (id: string) => void;
  onChangeSection?: TemplateRenderProps["onChangeSection"];
  onAddSection?: (type: ResumeSectionType, atIndex?: number) => void;
  onAddText?: (size: number, label: string, atIndex?: number) => void;
  onTool?: (id: string, tool: ContentTool) => void;
  readOnly?: boolean;
  headingClass?: string;
  headingStyle?: React.CSSProperties;
  contentClass?: string;
  contentStyle?: React.CSSProperties;
  outerClass?: string;
  horizontal?: boolean;
  labelWidth?: string;
};

function SectionList({ sections, theme, selectedSectionId, onSelectSection, onChangeSection, onAddSection, onAddText, onTool, readOnly, headingClass, headingStyle, contentClass, contentStyle, outerClass, horizontal, labelWidth }: SectionListProps) {
  const ids = useMemo(() => sections.map((s) => s.id), [sections]);
  return (
    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
      <div className="relative">
        <InsertionIndicator index={0} onAddSection={onAddSection} onAddText={onAddText} />
        {sections.map((section, index) => (
          <div key={section.id}>
            <SectionItem section={section} theme={theme} selected={!readOnly && selectedSectionId === section.id} onSelect={(id) => onSelectSection?.(id)} onChangeSection={onChangeSection} onAddSection={onAddSection} onAddText={onAddText} onTool={onTool} readOnly={readOnly} headingClass={headingClass} headingStyle={headingStyle} contentClass={contentClass} contentStyle={contentStyle} outerClass={outerClass} horizontal={horizontal} labelWidth={labelWidth} />
            <InsertionIndicator index={index + 1} onAddSection={onAddSection} onAddText={onAddText} />
          </div>
        ))}
      </div>
    </SortableContext>
  );
}

// ─────────────────────────────────────────────────────────
// ══════════════ 6 TEMPLATE DESIGNS ══════════════
// ─────────────────────────────────────────────────────────

type TProps = TemplateRenderProps & { templateKey: string; pageNumber: number };

/** Shared helper: editable title h1 */
function EditableTitle({ title, className, style, onTitleChange, readOnly }: {
  title: string; className: string; style?: React.CSSProperties;
  onTitleChange?: (t: string) => void; readOnly?: boolean;
}) {
  return (
    <h1
      className={`outline-none ${className}`}
      style={style}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      onBlur={(e) => onTitleChange?.(e.currentTarget.innerText.trim() || title)}
      dangerouslySetInnerHTML={{ __html: title }}
    />
  );
}

/** MODERN — Left accent strip, solid-colour heading badges */
function ModernTemplate({ title, sections, theme, profilePhotoUrl, selectedSectionId, onSelectSection, onChangeSection, onAddSection, onAddText, onTool, onTitleChange, readOnly }: TProps) {
  const accent = theme.accent;
  return (
    <article className={`h-[297mm] w-full ${fontClass(theme.font)} bg-white dark:bg-zinc-900 flex overflow-hidden`} style={{ fontSize: `${theme.fontSize}pt` }}>
      <div className="w-[5px] shrink-0" style={{ backgroundColor: accent }} />
      <div className={`flex-1 ${marginPadding(theme.margins)} overflow-hidden`}>
        <div className="flex items-start gap-4 mb-5">
          {profilePhotoUrl && <Image src={profilePhotoUrl} alt="Profile" width={72} height={72} className="h-16 w-16 rounded-full object-cover border-2 shrink-0" style={{ borderColor: accent }} />}
          <div>
            <EditableTitle title={title} onTitleChange={onTitleChange} readOnly={readOnly} className="text-[1.9em] font-extrabold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50" />
            <div className="mt-1 h-[3px] w-10 rounded-full" style={{ backgroundColor: accent }} />
          </div>
        </div>
        <SectionList sections={sections} theme={theme} selectedSectionId={selectedSectionId} onSelectSection={onSelectSection} onChangeSection={onChangeSection} onAddSection={onAddSection} onAddText={onAddText} onTool={onTool} readOnly={readOnly}
          headingClass="font-bold tracking-widest uppercase text-white px-2 py-0.5 inline-block mb-1 text-[0.65em]"
          headingStyle={{ backgroundColor: accent }}
          contentClass="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 mt-1 text-[0.88em]"
        />
      </div>
    </article>
  );
}

/** PROFESSIONAL — Centered serif header, ruled accent underlines */
function ProfessionalTemplate({ title, sections, theme, profilePhotoUrl, selectedSectionId, onSelectSection, onChangeSection, onAddSection, onAddText, onTool, onTitleChange, readOnly }: TProps) {
  const accent = theme.accent;
  return (
    <article className={`h-[297mm] w-full font-serif ${marginPadding(theme.margins)} bg-white dark:bg-zinc-900 overflow-hidden`} style={{ fontSize: `${theme.fontSize}pt` }}>
      <header className="text-center mb-5">
        {profilePhotoUrl && <div className="flex justify-center mb-2"><Image src={profilePhotoUrl} alt="Profile" width={64} height={64} className="h-14 w-14 rounded-full object-cover border-2 border-zinc-300" /></div>}
        <EditableTitle title={title} onTitleChange={onTitleChange} readOnly={readOnly} className="text-[2em] font-bold tracking-[0.1em] uppercase text-zinc-900 dark:text-zinc-50" />
        <div className="mt-2 h-[2px] w-full" style={{ backgroundColor: accent }} />
        <div className="mt-0.5 h-px w-full bg-zinc-300 dark:bg-zinc-700" />
      </header>
      <SectionList sections={sections} theme={theme} selectedSectionId={selectedSectionId} onSelectSection={onSelectSection} onChangeSection={onChangeSection} onAddSection={onAddSection} onAddText={onAddText} onTool={onTool} readOnly={readOnly}
        headingClass="font-bold uppercase tracking-widest pb-0.5 border-b-2 w-full mb-1 block text-[0.7em]"
        headingStyle={{ color: accent, borderColor: accent }}
        contentClass="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 mt-1 font-sans text-[0.88em]"
      />
    </article>
  );
}

/** MINIMAL — Two-column: label left, content right, lots of whitespace */
function MinimalTemplate({ title, sections, theme, profilePhotoUrl, selectedSectionId, onSelectSection, onChangeSection, onAddSection, onAddText, onTool, onTitleChange, readOnly }: TProps) {
  return (
    <article className={`h-[297mm] w-full ${fontClass(theme.font)} ${marginPadding(theme.margins)} bg-white dark:bg-zinc-900 overflow-hidden`} style={{ fontSize: `${theme.fontSize}pt` }}>
      <header className="flex items-end justify-between mb-6">
        <div>
          <EditableTitle title={title} onTitleChange={onTitleChange} readOnly={readOnly} className="text-[1.8em] font-light tracking-[0.12em] text-zinc-900 dark:text-zinc-50" />
          <div className="mt-1 h-px w-full bg-zinc-300 dark:bg-zinc-700" />
        </div>
        {profilePhotoUrl && <Image src={profilePhotoUrl} alt="Profile" width={56} height={56} className="h-12 w-12 rounded-sm object-cover grayscale opacity-80 ml-4 shrink-0" />}
      </header>
      <SectionList sections={sections} theme={theme} selectedSectionId={selectedSectionId} onSelectSection={onSelectSection} onChangeSection={onChangeSection} onAddSection={onAddSection} onAddText={onAddText} onTool={onTool} readOnly={readOnly}
        horizontal
        labelWidth="6rem"
        headingClass="text-[0.62em] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500"
        contentClass="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 text-[0.88em]"
      />
    </article>
  );
}

/** CREATIVE — Colored left panel (first ~3 sections), white right panel (rest) */
function CreativeTemplate({ title, sections, theme, profilePhotoUrl, selectedSectionId, onSelectSection, onChangeSection, onAddSection, onAddText, onTool, onTitleChange, readOnly }: TProps) {
  const accent = theme.accent;
  const sidebarCount = Math.min(3, sections.length);
  const sidebarSections = sections.slice(0, sidebarCount);
  const mainSections = sections.slice(sidebarCount);

  return (
    <article className={`h-[297mm] w-full ${fontClass(theme.font)} flex overflow-hidden`} style={{ fontSize: `${theme.fontSize}pt` }}>
      <div className="w-[36%] shrink-0 flex flex-col p-6 overflow-hidden" style={{ backgroundColor: accent }}>
        {profilePhotoUrl ? (
          <Image src={profilePhotoUrl} alt="Profile" width={80} height={80} className="h-18 w-18 rounded-full object-cover border-4 border-white/30 mb-3 mx-auto" style={{ height: 72, width: 72 }} />
        ) : (
          <div className="h-16 w-16 rounded-full border-4 border-white/30 mb-3 mx-auto flex items-center justify-center bg-white/20">
            <span className="text-white text-xl font-bold">{title.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <EditableTitle title={title} onTitleChange={onTitleChange} readOnly={readOnly} className="text-center text-[1.05em] font-extrabold tracking-tight text-white mb-1 leading-tight" />
        <div className="h-px w-8 bg-white/40 mx-auto mb-4" />
        <SectionList sections={sidebarSections} theme={theme} selectedSectionId={selectedSectionId} onSelectSection={onSelectSection} onChangeSection={onChangeSection} onAddSection={onAddSection} onAddText={onAddText} onTool={onTool} readOnly={readOnly}
          headingClass="text-white/60 text-[0.6em] font-bold uppercase tracking-widest mb-0.5 block"
          contentClass="text-white/90 text-[0.8em] leading-relaxed whitespace-pre-wrap"
        />
      </div>
      <div className="flex-1 bg-white dark:bg-zinc-900 p-6 overflow-hidden">
        <SectionList sections={mainSections} theme={theme} selectedSectionId={selectedSectionId} onSelectSection={onSelectSection} onChangeSection={onChangeSection} onAddSection={onAddSection} onAddText={onAddText} onTool={onTool} readOnly={readOnly}
          headingClass="font-bold tracking-widest uppercase mb-1 text-[0.7em] flex items-center gap-1"
          headingStyle={{ color: accent }}
          contentClass="whitespace-pre-wrap text-zinc-600 dark:text-zinc-400 mt-1 text-[0.88em]"
        />
      </div>
    </article>
  );
}

/** CORPORATE — Accent banner header, card-grid sections */
function CorporateTemplate({ title, sections, theme, profilePhotoUrl, selectedSectionId, onSelectSection, onChangeSection, onAddSection, onAddText, onTool, onTitleChange, readOnly }: TProps) {
  const accent = theme.accent;
  const gap = densityGap(theme.density);
  return (
    <article className={`h-[297mm] w-full ${fontClass(theme.font)} ${marginPadding(theme.margins)} bg-zinc-50 dark:bg-zinc-950 overflow-hidden`} style={{ fontSize: `${theme.fontSize}pt` }}>
      <header className="px-4 py-3 rounded flex items-center gap-4 mb-4" style={{ backgroundColor: accent, marginBottom: `${gap}px` }}>
        {profilePhotoUrl && <Image src={profilePhotoUrl} alt="Profile" width={48} height={48} className="h-11 w-11 rounded object-cover border-2 border-white/40 shrink-0" />}
        <div>
          <EditableTitle title={title} onTitleChange={onTitleChange} readOnly={readOnly} className="text-[1.4em] font-extrabold tracking-tight text-white leading-tight" />
          <p className="text-white/60 text-[0.65em] uppercase tracking-widest mt-0.5">Curriculum Vitae</p>
        </div>
      </header>
      <SectionList sections={sections} theme={theme} selectedSectionId={selectedSectionId} onSelectSection={onSelectSection} onChangeSection={onChangeSection} onAddSection={onAddSection} onAddText={onAddText} onTool={onTool} readOnly={readOnly}
        outerClass="rounded border bg-white dark:bg-zinc-900 p-3 mb-2 border-zinc-200 dark:border-zinc-800"
        headingClass="font-bold uppercase tracking-widest mb-1 text-[0.65em]"
        headingStyle={{ color: accent }}
        contentClass="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 text-[0.85em] leading-relaxed"
      />
    </article>
  );
}

/** ATS — Pure text, monospace, zero decoration, scanner-safe */
function ATSTemplate({ title, sections, theme, selectedSectionId, onSelectSection, onChangeSection, onAddSection, onAddText, onTool, onTitleChange, readOnly }: TProps) {
  return (
    <article className={`h-[297mm] w-full font-mono ${marginPadding(theme.margins)} bg-white dark:bg-zinc-900 overflow-hidden`} style={{ fontSize: `${theme.fontSize}pt`, color: "#111" }}>
      <header className="mb-5">
        <EditableTitle title={title} onTitleChange={onTitleChange} readOnly={readOnly} className="text-[1.35em] font-bold tracking-tight" />
        <div className="mt-1 border-b-2 border-current w-full" />
      </header>
      <SectionList sections={sections} theme={theme} selectedSectionId={selectedSectionId} onSelectSection={onSelectSection} onChangeSection={onChangeSection} onAddSection={onAddSection} onAddText={onAddText} onTool={onTool} readOnly={readOnly}
        headingClass="font-bold uppercase tracking-widest block border-b border-current mb-1 text-[0.72em]"
        headingStyle={{ color: "#111" }}
        contentClass="whitespace-pre-wrap text-zinc-800 dark:text-zinc-200 mt-0.5 text-[0.88em]"
      />
    </article>
  );
}

/** BLANK — Clean white canvas, no decoration, full editing support */
function BlankTemplate({ title, sections, theme, selectedSectionId, onSelectSection, onChangeSection, onAddSection, onAddText, onTool, onTitleChange, readOnly }: TProps) {
  return (
    <article
      className={`h-[297mm] w-full ${fontClass(theme.font)} ${marginPadding(theme.margins)} bg-white dark:bg-zinc-900 overflow-hidden`}
      style={{ fontSize: `${theme.fontSize}pt` }}
    >
      {/* Editable title */}
      <EditableTitle
        title={title}
        onTitleChange={onTitleChange}
        readOnly={readOnly}
        className="text-[1.6em] font-bold text-zinc-900 dark:text-zinc-50 mb-2 block w-full"
      />
      <div className="mb-4 h-px w-full bg-zinc-200 dark:bg-zinc-700" />

      {/* Empty state — shown when no sections exist yet */}
      {sections.length === 0 && !readOnly && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-zinc-300 dark:text-zinc-700 select-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" x2="12" y1="12" y2="18"/><line x1="9" x2="15" y1="15" y2="15"/></svg>
          <div className="text-center">
            <p className="text-sm font-semibold">Your blank canvas is ready</p>
            <p className="text-xs mt-1">Use the sidebar → Add Section to insert content here</p>
          </div>
          {onAddSection && (
            <button
              onClick={() => onAddSection("experience")}
              className="mt-1 rounded-full border border-zinc-200 dark:border-zinc-700 px-4 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition active:scale-95"
            >
              + Add first section
            </button>
          )}
        </div>
      )}

      {/* Section list — plain styling, no colors or borders */}
      {sections.length > 0 && (
        <SectionList
          sections={sections}
          theme={theme}
          selectedSectionId={selectedSectionId}
          onSelectSection={onSelectSection}
          onChangeSection={onChangeSection}
          onAddSection={onAddSection}
          onAddText={onAddText}
          onTool={onTool}
          readOnly={readOnly}
          headingClass="font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 text-[0.72em] mb-0.5 block"
          contentClass="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300 text-[0.88em]"
        />
      )}
    </article>
  );
}

// ─────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────

function TemplatePage(props: TProps) {
  switch (props.templateKey) {
    case "professional": return <ProfessionalTemplate {...props} />;
    case "minimal":      return <MinimalTemplate {...props} />;
    case "creative":     return <CreativeTemplate {...props} />;
    case "corporate":    return <CorporateTemplate {...props} />;
    case "ats":          return <ATSTemplate {...props} />;
    case "blank":        return <BlankTemplate {...props} />;
    default:             return <ModernTemplate {...props} />;
  }
}

// ─────────────────────────────────────────────────────────
// TemplatePreview — public export
// ─────────────────────────────────────────────────────────

export function TemplatePreview({
  templateKey, title, sections, theme, profilePhotoUrl,
  selectedSectionId, onSelectSection, onChangeSection,
  onAddSection, onAddText, onTool, onTitleChange, readOnly,
}: TemplateRenderProps & { templateKey: string }) {
  const pages = paginateSections(sections, theme.pageCount);
  return (
    <div className="flex flex-col gap-8">
      {pages.map((pageSections, index) => (
        <div key={index} id={`resume-page-${index + 1}`}>
          {pages.length > 1 && (
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Page {index + 1} / {pages.length}
            </p>
          )}
          <div className="overflow-visible rounded-sm bg-white shadow-md ring-1 ring-zinc-200 dark:ring-zinc-800">
            <TemplatePage templateKey={templateKey} title={title} sections={pageSections} theme={theme} profilePhotoUrl={profilePhotoUrl} selectedSectionId={selectedSectionId} onSelectSection={onSelectSection} onChangeSection={onChangeSection} readOnly={readOnly} onAddSection={onAddSection} onAddText={onAddText} onTool={onTool} onTitleChange={index === 0 ? onTitleChange : undefined} pageNumber={index + 1} />
          </div>
        </div>
      ))}
    </div>
  );
}
