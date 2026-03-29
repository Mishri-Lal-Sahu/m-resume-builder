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
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
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
import { ShareActions } from "./share-actions";
import { ThemeEditor } from "./theme-editor";
import { WorkspaceToolbar } from "./workspace-toolbar";
import { StrengthMeter } from "./strength-meter";
import { JsonTools } from "./json-tools";
import { VersionHistory, type Snapshot } from "./version-history";
import { PrintPreview } from "./print-preview";
import { KeywordSuggestions } from "./keyword-suggestions";
import { DocumentEditor } from "@/components/editor/document-editor";

type ResumeBuilderProps = {
  resumeId: string;
  initialTitle: string;
  initialTemplateKey: string;
  initialProfilePhotoUrl: string | null;
  initialVisibility: "PRIVATE" | "LINK_ONLY" | "PUBLIC";
  initialSlug: string | null;
  initialContent: ResumeDocument;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";
type SidebarTab = "design" | "strength" | "data" | "history";
type EditMode = "editor" | "preview";

export function ResumeBuilder(props: ResumeBuilderProps) {
  const [title, setTitle] = useState(props.initialTitle);
  const [templateKey, setTemplateKey] = useState(props.initialTemplateKey);
  const {
    state: content,
    set: setContent,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<ResumeDocument>(props.initialContent);

  const [visibility, setVisibility] = useState(props.initialVisibility);
  const [slug, setSlug] = useState(props.initialSlug);
  const [addType, setAddType] = useState<ResumeSectionType>("projects");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    props.initialContent.sections[0]?.id ?? null,
  );
  const [zoom, setZoom] = useState(1);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("design");
  const [printOpen, setPrintOpen] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [editMode, setEditMode] = useState<EditMode>("editor");

  // ── Keyboard shortcuts ──────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "Z"))) { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "p") { e.preventDefault(); setPrintOpen(true); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // ── Auto-save ───────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("saving");
      try {
        const response = await fetch(`/api/resumes/${props.resumeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, templateKey, content }),
          signal: controller.signal,
        });
        if (!response.ok) { setStatus("error"); return; }
        setStatus("saved");
      } catch { setStatus("error"); }
    }, 800);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [content, title, templateKey, props.resumeId]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setContent((prev) => {
      const oldIndex = prev.sections.findIndex((s) => s.id === active.id);
      const newIndex = prev.sections.findIndex((s) => s.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      return { ...prev, sections: arrayMove(prev.sections, oldIndex, newIndex) };
    });
  }

  function updateSection(id: string, patch: Partial<ResumeSection>, options?: { skipHistory?: boolean }) {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }), options?.skipHistory);
  }

  function removeSection(id: string) {
    setContent((prev) => {
      const next = prev.sections.filter((s) => s.id !== id);
      return { ...prev, sections: next.length > 0 ? next : [createSection("summary")] };
    });
    if (selectedSectionId === id) setSelectedSectionId(null);
  }

  function duplicateSection(id: string) {
    setContent((prev) => {
      const index = prev.sections.findIndex((s) => s.id === id);
      if (index < 0) return prev;
      const newSection = { ...prev.sections[index], id: crypto.randomUUID() };
      const next = [...prev.sections];
      next.splice(index + 1, 0, newSection);
      return { ...prev, sections: next };
    });
  }

  function moveSection(id: string, direction: "up" | "down") {
    setContent((prev) => {
      const index = prev.sections.findIndex((s) => s.id === id);
      if (index < 0) return prev;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.sections.length) return prev;
      return { ...prev, sections: arrayMove(prev.sections, index, target) };
    });
  }

  function applyTool(id: string, tool: ContentTool) {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === id ? { ...s, content: applyContentTool(tool, s.content, s.type) } : s,
      ),
    }));
  }

  function addSection(type: ResumeSectionType = addType, atIndex?: number) {
    const ns = createSection(type);
    setContent((p) => {
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
    setContent((p) => {
      const next = [...p.sections];
      if (atIndex !== undefined) next.splice(atIndex, 0, ns);
      else next.push(ns);
      return { ...p, sections: next };
    });
    setSelectedSectionId(ns.id);
  }

  // ── ATS toggle ──────────────────────────────────────────
  function toggleATS() {
    if (templateKey === "ats") {
      setTemplateKey(props.initialTemplateKey === "ats" ? "modern" : props.initialTemplateKey);
    } else {
      setTemplateKey("ats");
    }
  }

  // ── Version history ─────────────────────────────────────
  function saveSnapshot(name: string) {
    setSnapshots((prev) => {
      const next: Snapshot = {
        id: crypto.randomUUID(),
        name,
        createdAt: Date.now(),
        content: JSON.parse(JSON.stringify(content)),
        title,
      };
      return [...prev.slice(-19), next]; // max 20
    });
  }

  function restoreSnapshot(snap: Snapshot) {
    setContent(JSON.parse(JSON.stringify(snap.content)));
    setTitle(snap.title);
  }

  function deleteSnapshot(id: string) {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  }

  // ── Keyword insert ──────────────────────────────────────
  const insertKeyword = useCallback((kw: string) => {
    if (!selectedSectionId) return;
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === selectedSectionId
          ? { ...s, content: s.content + (s.content.endsWith("\n") || s.content === "" ? "" : "\n") + kw }
          : s,
      ),
    }));
  }, [selectedSectionId, setContent]);

  const activeSection = content.sections.find((s) => s.id === selectedSectionId) ?? null;

  // ── Sidebar tabs UI ─────────────────────────────────────
  const TABS: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "design", label: "Design",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 9h6"/><path d="M9 13h6"/><path d="M9 17h4"/></svg>,
    },
    {
      id: "strength", label: "Score",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    },
    {
      id: "data", label: "Data",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6"/></svg>,
    },
    {
      id: "history", label: "History",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>,
    },
  ];

  return (
    <>
      {/* Print Preview Overlay */}
      <PrintPreview
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        templateKey={templateKey}
        title={title}
        content={content}
        profilePhotoUrl={props.initialProfilePhotoUrl}
      />

      <div className="flex h-screen flex-col bg-[#f8f9fa] dark:bg-zinc-950 font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900">
        {/* Header */}
        <header className="z-40 flex h-16 items-center justify-between border-b border-white/20 bg-white/70 px-8 py-2 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="group flex items-center gap-2 text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 transition-colors group-hover:bg-zinc-200 dark:bg-zinc-800 dark:group-hover:bg-zinc-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </div>
            </Link>
            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex flex-col">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-transparent text-base font-bold tracking-tight text-zinc-900 outline-none focus:ring-0 dark:text-zinc-100"
                placeholder="Untitled Resume"
              />
              <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">
                {status === "saving" ? "Saving…" : status === "saved" ? "All Changes Saved ✓" : "Idle"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* ATS Toggle */}
            <button
              onClick={toggleATS}
              title={templateKey === "ats" ? "Switch back to previous template" : "Switch to ATS-safe template"}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all active:scale-95 ${
                templateKey === "ats"
                  ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 dark:border-green-700"
                  : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              {templateKey === "ats" ? "ATS: On" : "ATS Mode"}
            </button>
            {/* Print Preview */}
            <button
              onClick={() => setPrintOpen(true)}
              title="Print Preview (Ctrl+P)"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[11px] font-bold text-zinc-500 transition hover:border-zinc-400 active:scale-95 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
              Preview
            </button>
            <ShareActions
              resumeId={props.resumeId}
              initialVisibility={visibility}
              initialSlug={slug}
              onUpdate={({ visibility: v, slug: s }) => {
                if (v) setVisibility(v);
                if (s) setSlug(s);
              }}
            />
            <ExportActions resumeId={props.resumeId} title={title} content={content} pageCount={content.theme.pageCount} />
          </div>
        </header>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <main className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <aside className="no-scrollbar z-20 flex w-[360px] shrink-0 flex-col border-r border-zinc-200 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-900/80">
              {/* Tab bar */}
              <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSidebarTab(tab.id)}
                    className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition ${
                      sidebarTab === tab.id
                        ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">

                {/* ── Design Tab ── */}
                {sidebarTab === "design" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Template</label>
                      <select
                        value={templateKey}
                        onChange={(e) => setTemplateKey(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
                      >
                        {templateRegistry.map((t) => <option key={t.key} value={t.key}>{t.name}</option>)}
                      </select>
                    </div>

                    <ThemeEditor
                      theme={content.theme}
                      onChange={(patch) => setContent((p) => ({ ...p, theme: { ...p.theme, ...patch } }))}
                    />

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Add Section</label>
                        <button
                          onClick={() => {
                            // insert right after selected section (like Google Docs), else append
                            const idx = content.sections.findIndex(s => s.id === selectedSectionId);
                            addText(11, "New Text Block", idx >= 0 ? idx + 1 : undefined);
                          }}
                          className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3H7"/><path d="M7 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z"/><path d="M12 3v18"/></svg>
                          Add Text
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={addType}
                          onChange={(e) => setAddType(e.target.value as ResumeSectionType)}
                          className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950 focus:border-zinc-900"
                        >
                          {sectionTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <button
                          onClick={() => {
                            const idx = content.sections.findIndex(s => s.id === selectedSectionId);
                            addSection(addType, idx >= 0 ? idx + 1 : undefined);
                          }}
                          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white font-medium transition-transform active:scale-95 shadow-lg dark:bg-zinc-200 dark:text-zinc-900"
                        >Add</button>
                      </div>
                      {selectedSectionId && (
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-600">
                          ↳ Inserting after <em>{content.sections.find(s => s.id === selectedSectionId)?.title || "selected section"}</em>
                        </p>
                      )}
                    </div>

                    {/* Keyword suggestions */}
                    {activeSection && (
                      <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
                        <KeywordSuggestions
                          sectionType={activeSection.type}
                          onInsert={insertKeyword}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* ── Strength Tab ── */}
                {sidebarTab === "strength" && (
                  <StrengthMeter sections={content.sections} />
                )}

                {/* ── Data Tab ── */}
                {sidebarTab === "data" && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">Import / Export</p>
                      <JsonTools
                        content={content}
                        title={title}
                        onImport={(doc, newTitle) => {
                          setContent(doc);
                          if (newTitle) setTitle(newTitle);
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* ── History Tab ── */}
                {sidebarTab === "history" && (
                  <VersionHistory
                    snapshots={snapshots}
                    onSave={saveSnapshot}
                    onRestore={restoreSnapshot}
                    onDelete={deleteSnapshot}
                  />
                )}
              </div>
            </aside>

            {/* Main canvas */}
            <main className="flex flex-1 flex-col overflow-hidden bg-zinc-100 dark:bg-zinc-950">
              <WorkspaceToolbar
                activeSection={activeSection}
                theme={content.theme}
                onThemeChange={(patch) => setContent((p) => ({ ...p, theme: { ...p.theme, ...patch } }))}
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
                  style={{ width: "210mm", transform: `scale(${zoom})`, transformOrigin: "top center" }}
                >
                  <TemplatePreview
                    templateKey={templateKey}
                    title={title}
                    sections={content.sections}
                    theme={content.theme}
                    profilePhotoUrl={props.initialProfilePhotoUrl}
                    selectedSectionId={selectedSectionId}
                    onSelectSection={setSelectedSectionId}
                    onChangeSection={(id, patch, options) => updateSection(id, patch as Partial<ResumeSection>, options)}
                    onAddSection={addSection}
                    onAddText={addText}
                    onTool={applyTool}
                    onTitleChange={setTitle}
                  />
                </div>
              </div>

              {/* Footer */}
              <footer className="flex h-10 w-full items-center justify-between border-t border-zinc-200 bg-white/80 px-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
                <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <span>Section: {activeSection?.type ?? "None"}</span>
                  <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
                  <span>Sections: {content.sections.length}</span>
                  <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
                  <span>Pages: {content.theme.pageCount} / 10</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-zinc-500">{Math.round(zoom * 100)}%</span>
                  <input
                    type="range" min="0.5" max="1.5" step="0.05" value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-24 h-1 bg-zinc-200 rounded-full appearance-none accent-zinc-900 dark:bg-zinc-700 dark:accent-zinc-100"
                  />
                </div>
              </footer>
            </main>
          </main>
        </DndContext>
      </div>
    </>
  );
}
