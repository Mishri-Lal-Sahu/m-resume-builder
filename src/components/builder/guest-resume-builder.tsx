"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { useHistory } from "@/hooks/use-history";

import { TemplatePreview } from "@/components/templates/template-preview";
import { applyContentTool, type ContentTool } from "@/features/resumes/content-tools";
import {
  createSection,
  sectionTypeOptions,
  type ResumeDocument,
  type ResumeSection,
  type ResumeSectionType,
} from "@/features/resumes/types";
import { templateRegistry } from "@/features/templates/registry";
import { ExportActions } from "./export-actions";
import { ThemeEditor } from "./theme-editor";
import { WorkspaceToolbar } from "./workspace-toolbar";

type GuestResumeBuilderProps = {
  initialTitle?: string;
  initialTemplateKey?: string;
};

const STORAGE_KEY = "m-resume-guest-draft";

const DEFAULT_DRAFT: ResumeDocument = {
  sections: [
    {
      id: "1",
      type: "summary",
      title: "Professional Summary",
      content: "Ambitious professional with experience in building unique digital experiences...",
    },
    {
      id: "2",
      type: "experience",
      title: "Work Experience",
      content: "Senior Developer | Tech Corp | 2020 - Present\n- Led development of premium web applications...",
    },
  ],
  theme: {
    accent: "#111111",
    font: "sans",
    layout: "single",
    density: "balanced",
    sectionStyle: "plain",
    headingCase: "upper",
    canvas: "plain",
    pageCount: 1,
    lineHeight: 1.5,
    letterSpacing: 0,
    sectionSpacing: 24,
    margins: "normal",
    fontSize: 11,
  },
};


export function GuestResumeBuilder({ initialTitle = "My Resume", initialTemplateKey = "modern" }: GuestResumeBuilderProps) {
  const [title, setTitle] = useState(initialTitle);
  const [templateKey, setTemplateKey] = useState(initialTemplateKey);
  const { 
    state: draft, 
    set: setDraft, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistory<ResumeDocument>(DEFAULT_DRAFT);
  
  const [addType, setAddType] = useState<ResumeSectionType>("projects");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.theme.fontSize) parsed.theme.fontSize = 11;
        if (!parsed.theme.lineHeight) parsed.theme.lineHeight = 1.5;
        if (parsed.theme.pageCount === undefined) parsed.theme.pageCount = 1;
        if (parsed.theme.letterSpacing === undefined) parsed.theme.letterSpacing = 0;
        setDraft(parsed, true); // Skip history for initial load
      } catch (e) {
        console.error("Failed to parse saved draft", e);
      }
    }
  }, [setDraft]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "Z"))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setDraft((prev) => {
      const oldIndex = prev.sections.findIndex((s) => s.id === active.id);
      const newIndex = prev.sections.findIndex((s) => s.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      return { ...prev, sections: arrayMove(prev.sections, oldIndex, newIndex) };
    });
  }

  function updateSection(id: string, patch: Partial<ResumeSection>, options?: { skipHistory?: boolean }) {
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }), options?.skipHistory);
  }

  function removeSection(id: string) {
    setDraft((prev) => {
      const next = prev.sections.filter((s) => s.id !== id);
      return { ...prev, sections: next.length > 0 ? next : [createSection("summary")] };
    });
    if (selectedSectionId === id) setSelectedSectionId(null);
  }

  function duplicateSection(id: string) {
    setDraft((prev) => {
      const index = prev.sections.findIndex((s) => s.id === id);
      if (index < 0) return prev;
      const newSection = { ...prev.sections[index], id: crypto.randomUUID() };
      const next = [...prev.sections];
      next.splice(index + 1, 0, newSection);
      return { ...prev, sections: next };
    });
  }

  function moveSection(id: string, direction: "up" | "down") {
    setDraft((prev) => {
      const index = prev.sections.findIndex((s) => s.id === id);
      if (index < 0) return prev;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.sections.length) return prev;
      return { ...prev, sections: arrayMove(prev.sections, index, target) };
    });
  }

  function addSection(type: ResumeSectionType = addType, atIndex?: number) {
    const ns = createSection(type);
    setDraft(p => {
      const next = [...p.sections];
      if (atIndex !== undefined) next.splice(atIndex, 0, ns);
      else next.push(ns);
      return { ...p, sections: next };
    });
    setSelectedSectionId(ns.id);
  }

  function addText(size: number, label: string, atIndex?: number) {
    const ns = createSection("text");
    ns.title = label;
    ns.fontSize = size;
    setDraft(p => {
      const next = [...p.sections];
      if (atIndex !== undefined) next.splice(atIndex, 0, ns);
      else next.push(ns);
      return { ...p, sections: next };
    });
    setSelectedSectionId(ns.id);
  }

  function applyTool(id: string, tool: ContentTool) {
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => s.id === id ? { ...s, content: applyContentTool(tool, s.content, s.type) } : s),
    }));
  }

  const effectiveSelectedSectionId =
    selectedSectionId && draft.sections.some((s) => s.id === selectedSectionId)
      ? selectedSectionId
      : (draft.sections[0]?.id ?? null);

  return (
    <div className="flex h-screen flex-col bg-[#f8f9fa] dark:bg-zinc-950 font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900">
      <header className="z-40 flex h-16 items-center justify-between border-b border-white/20 bg-white/70 px-8 py-2 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent text-base font-bold tracking-tight text-zinc-900 outline-none focus:ring-0 dark:text-zinc-100"
            />
            <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">
              Guest Mode • Local Draft
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ExportActions resumeId="guest" title={title} content={draft} pageCount={draft.theme.pageCount} />
        </div>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <main className="flex flex-1 overflow-hidden">
          <aside className="no-scrollbar z-20 w-[420px] border-r border-zinc-200 bg-white/80 backdrop-blur-lg overflow-y-auto dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="p-8">
              <div className="mb-8 grid gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Template</label>
                  <select
                    value={templateKey}
                    onChange={(e) => setTemplateKey(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950/50 transition-colors focus:border-zinc-900"
                  >
                    {templateRegistry.map((t) => <option key={t.key} value={t.key}>{t.name}</option>)}
                  </select>
                </div>

                <ThemeEditor 
                  theme={draft.theme} 
                  onChange={(patch) => setDraft(p => ({ ...p, theme: { ...p.theme, ...patch } }))} 
                />

                <div className="space-y-1.5">
                   <div className="flex items-center justify-between">
                     <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Add Section</label>
                     <button 
                       onClick={() => addText(11, "New Text Block")}
                       className="group flex items-center gap-1 text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                       title="Quick Add Text"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3H7"/><path d="M7 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"/><path d="M12 3v18"/></svg>
                       Add Text
                     </button>
                   </div>
                   <div className="flex gap-2">
                      <select
                        value={addType}
                        onChange={(e) => setAddType(e.target.value as ResumeSectionType)}
                        className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950/50 transition-colors focus:border-zinc-900"
                      >
                        {sectionTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <button 
                        onClick={() => addSection()} 
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-200 dark:text-zinc-900 font-medium transition-transform active:scale-95"
                      >
                        Add
                      </button>
                   </div>
                </div>
              </div>

              <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-8" />

              <div className="rounded-2xl bg-zinc-50/50 p-4 border border-zinc-100 dark:bg-zinc-950/20 dark:border-zinc-800/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4 text-center">Canvas-Only Editing</p>
                <p className="text-xs text-zinc-500 text-center leading-relaxed">Sections have been moved to the canvas for a direct, visually intuitive experience. Click any section on the paper to edit and format.</p>
              </div>
            </div>
          </aside>

        <main className="flex-1 flex flex-col overflow-hidden bg-zinc-100 dark:bg-zinc-950">
          <WorkspaceToolbar 
            activeSection={draft.sections.find(s => s.id === effectiveSelectedSectionId) || null}
            theme={draft.theme}
            onThemeChange={(patch) => setDraft(p => ({ ...p, theme: { ...p.theme, ...patch } }))}
            onSectionChange={updateSection}
            onTool={applyTool}
            onDuplicate={duplicateSection}
            onMove={moveSection}
            onDelete={removeSection}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
          
          <div className="flex-1 overflow-auto p-12 scrollbar-hide">
            <div 
              className="mx-auto transition-all duration-300 ease-out"
              style={{ 
                width: "210mm",
                transform: `scale(${zoom})`,
                transformOrigin: "top center",
              }}
            >
                <TemplatePreview
                  templateKey={templateKey}
                  title={title}
                  sections={draft.sections}
                  theme={draft.theme}
                  profilePhotoUrl={null}
                  selectedSectionId={effectiveSelectedSectionId}
                  onSelectSection={setSelectedSectionId}
                  onChangeSection={(id, patch, options) => updateSection(id, patch as Partial<ResumeSection>, options)}
                  onAddSection={addSection}
                  onAddText={addText}
                  onTool={applyTool}
                />
            </div>
          </div>

          <footer className="flex h-10 w-full items-center justify-between border-t border-zinc-200 bg-white/80 px-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <span>Section: {draft.sections.find(s => s.id === effectiveSelectedSectionId)?.type || 'None'}</span>
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
              <span>Pages: {draft.theme.pageCount} / 10</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-zinc-500">{Math.round(zoom * 100)}%</span>
              <input 
                type="range"
                min="0.5"
                max="1.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-24 h-1 bg-zinc-200 rounded-full appearance-none accent-zinc-900 dark:bg-zinc-700 dark:accent-zinc-100"
              />
            </div>
          </footer>
        </main>
      </main>
    </DndContext>
    </div>
  );
}
