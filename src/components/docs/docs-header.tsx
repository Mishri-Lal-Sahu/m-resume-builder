import Link from "next/link";
import { SaveStatus } from "./docs-builder";
import type { Editor } from "@tiptap/react";
import type { TipTapDoc } from "@/features/resumes/tiptap-bridge";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ADVANCED_TEMPLATES } from "@/features/resumes/templates";
import { exportDocxAction } from "@/features/export/docx-action";
import { DocsSharePanel } from "./docs-share-panel";

type Props = {
  resumeId: string;
  title: string;
  editor: Editor | null;
  onTitleChange: (v: string) => void;
  status: SaveStatus;
  getAllPages?: () => TipTapDoc[];
};

// --- Custom Minimal Dropdown System ---
function MenuDropdown({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`px-2 py-0.5 rounded cursor-pointer border text-zinc-700 dark:text-zinc-200 ${open
            ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-inner"
            : "border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
      >
        {label}
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 min-w-[200px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl py-1.5 z-[120] flex flex-col"
          onClick={() => setOpen(false)} // Auto-close on any item click
        >
          {children}
        </div>
      )}
    </div>
  );
}

function MenuItem({ label, shortcut, onClick, disabled }: { label: string; shortcut?: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`w-full text-left px-4 py-1.5 text-sm flex justify-between items-center ${disabled
          ? "opacity-40 cursor-not-allowed"
          : "hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-blue-700 dark:hover:text-zinc-100 text-zinc-700 dark:text-zinc-300"
        }`}
    >
      <span>{label}</span>
      {shortcut && <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium tracking-wide">{shortcut}</span>}
    </button>
  );
}
function MenuDivider() {
  return <div className="w-full h-px bg-zinc-100 dark:bg-zinc-800 my-1" />;
}
// --------------------------------------

export function DocsHeader({ resumeId, title, editor, onTitleChange, status, getAllPages }: Props) {
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <header className="relative z-[90] flex items-center gap-2 border-b border-zinc-200/80 bg-white/95 px-4 py-2 dark:border-zinc-800/80 dark:bg-zinc-900/95 backdrop-blur-sm">
      {/* M-Docs Logo */}
      <Link href="/dashboard" className="mr-2 shrink-0">
        <div className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/30 transition-transform group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>
          </div>
          <span className="hidden sm:block text-sm font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">M-Docs</span>
        </div>
      </Link>

      <div className="min-w-0 flex flex-1 flex-col justify-center">
        {/* Title & Status */}
        <div className="flex items-center gap-3">
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="bg-transparent text-lg font-medium text-zinc-800 outline-none hover:ring-1 hover:ring-zinc-300 focus:ring-2 focus:ring-blue-500 rounded px-1 -ml-1 dark:text-zinc-100 transition-shadow"
            placeholder="Untitled Document"
          />
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
            {status === "saving" && (
              <>
                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Saving...
              </>
            )}
            {status === "saved" && (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                Saved to cloud
              </>
            )}
            {status === "error" && "Save failed"}
          </span>
        </div>

        {/* Menus */}
        <div className="mt-0.5 -ml-2 flex flex-wrap items-center gap-1 text-[13.5px] font-medium">

          <MenuDropdown label="File">
            <MenuItem label="New from Template" onClick={() => setShowTemplates(true)} />
            <MenuItem label="New document" onClick={() => window.open('/dashboard', '_self')} />
            <MenuItem label="Rename" onClick={() => {
              const el = document.querySelector('input[placeholder="Untitled Document"]') as HTMLInputElement;
              if (el) { el.focus(); el.select(); }
            }} />
            <MenuDivider />
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Download</div>
            <MenuItem label="PDF Document (.pdf)" onClick={() => window.print()} />
            <MenuItem label="Microsoft Word (.docx)" onClick={async () => {
              if (!editor) return;
              const allContent = getAllPages ? getAllPages() : [editor.getJSON() as any];
              const mergedDoc: TipTapDoc = { type: "doc", content: allContent.flatMap(p => p.content || []) };
              const res = await exportDocxAction(title, mergedDoc);
              if (res.error) {
                alert(res.error);
                return;
              }
              const link = document.createElement("a");
              link.href = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${res.base64}`;
              link.download = res.filename || "document.docx";
              link.click();
            }} />
            <MenuItem label="Plain Text (.txt)" onClick={() => {
              if (!editor) return;
              const text = editor.getText();
              const blob = new Blob([text], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${title || "document"}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }} />
            <MenuItem label="TipTap JSON" onClick={() => {
              if (!editor) return;
              const json = editor.getJSON();
              const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${title || "document"}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }} />
            <MenuDivider />
            <MenuItem label="Print" shortcut="Ctrl+P" onClick={() => window.print()} />
          </MenuDropdown>

          <MenuDropdown label="Edit">
            <MenuItem label="Undo" shortcut="Ctrl+Z" disabled={!editor?.can().undo()} onClick={() => editor?.chain().focus().undo().run()} />
            <MenuItem label="Redo" shortcut="Ctrl+Y" disabled={!editor?.can().redo()} onClick={() => editor?.chain().focus().redo().run()} />
            <MenuDivider />
            <MenuItem label="Cut" shortcut="Ctrl+X" onClick={() => document.execCommand('cut')} />
            <MenuItem label="Copy" shortcut="Ctrl+C" onClick={() => document.execCommand('copy')} />
            <MenuItem label="Paste" shortcut="Ctrl+V" onClick={() => document.execCommand('paste')} />
            <MenuDivider />
            <MenuItem label="Select all" shortcut="Ctrl+A" onClick={() => editor?.chain().focus().selectAll().run()} />
            <MenuItem label="Delete" onClick={() => editor?.chain().focus().deleteSelection().run()} />
          </MenuDropdown>

          <MenuDropdown label="View">
            {/* Using a custom class event pattern just to trigger a re-render/CSS toggle generically */}
            <MenuItem label="Full screen" onClick={() => {
              if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => { });
              else document.exitFullscreen().catch(() => { });
            }} />
          </MenuDropdown>

          <MenuDropdown label="Insert">
            <MenuItem label="Image" onClick={() => {
              const url = window.prompt("Enter image URL:");
              if (url) editor?.chain().focus().setImage({ src: url }).run();
            }} />
            <MenuItem label="Table" onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
            <MenuDivider />
            <MenuItem label="Horizontal line" onClick={() => editor?.chain().focus().setHorizontalRule().run()} />
            <MenuItem label="Link" shortcut="Ctrl+K" onClick={() => {
              const url = window.prompt("Enter link URL:");
              if (url) editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
            }} />
            <MenuDivider />
            <MenuItem label="Checkbox" onClick={() => editor?.chain().focus().toggleTaskList().run()} />
            <MenuItem label="Status Pill" onClick={() => editor?.chain().focus().insertContent('<span data-type="status-pill" statusId="not-started"></span> ').run()} />
            <MenuItem label="E-Signature" onClick={() => editor?.chain().focus().insertContent('<span data-type="signature"></span> ').run()} />
            <MenuItem label="Bar Chart" onClick={() => editor?.chain().focus().insertContent('<div data-type="interactive-chart"></div> ').run()} />
            <MenuItem label="Drawing Board" onClick={() => editor?.chain().focus().insertContent('<div data-type="drawing-board"></div> ').run()} />
            <MenuDivider />
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Building Blocks</div>
            <MenuItem label="Meeting Notes" onClick={() => {
              const html = `
                <h2>📅 Meeting Notes</h2>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Attendees:</strong> <span data-type="mention" data-id="Team">@Team</span></p>
                <hr>
                <h3>Agenda</h3>
                <ul data-type="taskList">
                  <li data-type="taskItem" data-checked="false"><p>Review previous action items</p></li>
                  <li data-type="taskItem" data-checked="false"><p>Project updates</p></li>
                  <li data-type="taskItem" data-checked="false"><p>Open discussion</p></li>
                </ul>
                <h3>Action Items</h3>
                <table>
                  <tr>
                    <th style="background-color: #f3f4f6; width: 60%">Task</th>
                    <th style="background-color: #f3f4f6">Owner</th>
                    <th style="background-color: #f3f4f6">Status</th>
                  </tr>
                  <tr>
                    <td>Initial draft</td>
                    <td></td>
                    <td><span data-type="status-pill" statusId="not-started"></span></td>
                  </tr>
                </table><p></p>
              `;
              editor?.chain().focus().insertContent(html).run();
            }} />
            <MenuItem label="Project Tracker" onClick={() => {
              const html = `
                <h2>📊 Project Tracker</h2>
                <table>
                  <tr>
                    <th style="background-color: #e5e7eb">Feature</th>
                    <th style="background-color: #e5e7eb">Assignee</th>
                    <th style="background-color: #e5e7eb">Target Date</th>
                    <th style="background-color: #e5e7eb">Status</th>
                  </tr>
                  <tr>
                    <td>Authentication</td>
                    <td><span data-type="mention" data-id="Engineering">@Engineering</span></td>
                    <td>Q3 2026</td>
                    <td><span data-type="status-pill" statusId="in-progress"></span></td>
                  </tr>
                  <tr>
                    <td>Database Migration</td>
                    <td></td>
                    <td></td>
                    <td><span data-type="status-pill" statusId="not-started"></span></td>
                  </tr>
                </table><p></p>
              `;
              editor?.chain().focus().insertContent(html).run();
            }} />
          </MenuDropdown>

          <MenuDropdown label="Format">
            <MenuItem label="Bold" shortcut="Ctrl+B" onClick={() => editor?.chain().focus().toggleBold().run()} />
            <MenuItem label="Italic" shortcut="Ctrl+I" onClick={() => editor?.chain().focus().toggleItalic().run()} />
            <MenuItem label="Underline" shortcut="Ctrl+U" onClick={() => editor?.chain().focus().toggleUnderline().run()} />
            <MenuItem label="Strikethrough" onClick={() => editor?.chain().focus().toggleStrike().run()} />
            <MenuItem label="Superscript" onClick={() => editor?.chain().focus().toggleSuperscript().run()} />
            <MenuItem label="Subscript" onClick={() => editor?.chain().focus().toggleSubscript().run()} />
            <MenuDivider />
            <MenuItem label="Align left" onClick={() => editor?.chain().focus().setTextAlign('left').run()} />
            <MenuItem label="Align center" onClick={() => editor?.chain().focus().setTextAlign('center').run()} />
            <MenuItem label="Align right" onClick={() => editor?.chain().focus().setTextAlign('right').run()} />
            <MenuItem label="Justify" onClick={() => editor?.chain().focus().setTextAlign('justify').run()} />
            <MenuDivider />
            <MenuItem label="Clear formatting" onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()} />
          </MenuDropdown>

          <MenuDropdown label="Tools">
            <MenuItem label="Word count" shortcut="Ctrl+Shift+C" onClick={() => {
              if (!editor) return;
              const text = editor.getText();
              const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
              const chars = text.length;
              alert(`Word Count:\n\nWords: ${words}\nCharacters: ${chars}\nCharacters (excluding spaces): ${text.replace(/\s/g, '').length}`);
            }} />
          </MenuDropdown>

        </div>
      </div>

      <div className="ml-auto flex items-center gap-3 print:hidden">
        <DocsSharePanel resumeId={resumeId} />

        {/* Print / PDF */}
        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" /></svg>
          Print / PDF
        </button>

        {/* Dark / Light toggle */}
        <button
          onClick={() => {
            const html = document.documentElement;
            const isDark = html.classList.toggle('dark');
            try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch {}
          }}
          className="flex items-center justify-center w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition shadow-sm"
          title="Toggle dark / light mode"
        >
          <svg className="hidden dark:block" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          <svg className="block dark:hidden" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>

        <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-zinc-500 uppercase">U</div>
      </div>

      {/* Templates Modal */}
      {showTemplates && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
          <div className="w-full max-w-5xl h-[80vh] flex flex-col rounded-xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-6 py-4 relative z-10">
              <h2 className="text-xl font-bold tracking-tight">Template Gallery</h2>
              <button
                onClick={() => setShowTemplates(false)}
                className="rounded-full p-2 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                title="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-zinc-100/50 dark:bg-zinc-900/50">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {['Personal / Career', 'Business', 'Product', 'Marketing', 'Project Management', 'Design', 'HR', 'Academic'].map(category => {
                  const items = ADVANCED_TEMPLATES.filter(t => t.category === category);
                  if (items.length === 0) return null;
                  return (
                    <div key={category} className="col-span-full mt-4 first:mt-0">
                      <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">{category}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {items.map(t => (
                          <div
                            key={t.id}
                            onClick={() => {
                              if (confirm("Replace current document with this template?")) {
                                editor?.commands.setContent(t.html);
                                setShowTemplates(false);
                              }
                            }}
                            className="group flex flex-col cursor-pointer"
                          >
                            <div className="aspect-[1/1.414] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm group-hover:shadow-md group-hover:border-blue-500 transition-all flex items-center justify-center p-4 overflow-hidden relative">
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-50/50 dark:to-zinc-900/50 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                              <div className="scale-[0.3] origin-top opacity-50 w-[300%] pointer-events-none" dangerouslySetInnerHTML={{ __html: t.html }} />
                            </div>
                            <div className="mt-3 font-medium text-sm text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 transition-colors">{t.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
