"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { importDocumentAction } from "@/features/import/import-action";
import { useRouter } from "next/navigation";
import { ADVANCED_TEMPLATES } from "@/features/resumes/templates";

type ImportWizardModalProps = {
  open: boolean;
  onClose: () => void;
  onBlankSubmit: () => void;
  onTemplateSelect?: (template: typeof ADVANCED_TEMPLATES[0]) => void;
};

export function ImportWizardModal({ open, onClose, onBlankSubmit, onTemplateSelect }: ImportWizardModalProps) {
  const router = useRouter();
  const [view, setView] = useState<"menu" | "import" | "templates">("menu");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Quick client-size validation (50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError("File exceeds the 50MB limit.");
      return;
    }
    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const res = await importDocumentAction(formData);
      
      if (res?.error) {
        setError(res.error);
        if (res.limitType === "documents") {
            setError(`Limit Reached: ${res.error}`);
        }
      } else if (res?.success && res.id) {
        router.push(`/docs/${res.id}`);
      }
    } catch (err) {
      setError("An unexpected error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={uploading ? undefined : onClose}
        />

        <motion.div
          variants={menuVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50 px-6 py-4 dark:border-zinc-800/50 dark:bg-zinc-900/50">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              {view === "menu" ? "Create a Document" : "Import Document"}
            </h2>
            <button
              onClick={uploading ? undefined : onClose}
              disabled={uploading}
              className="rounded-full p-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="p-6">
            {view === "menu" && (
              <div className="grid gap-4 sm:grid-cols-3">
                <button
                  onClick={onBlankSubmit}
                  className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-900/20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:bg-zinc-800 dark:group-hover:bg-indigo-900/50 dark:group-hover:text-indigo-400">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-bold text-zinc-900 group-hover:text-indigo-700 dark:text-zinc-100 dark:group-hover:text-indigo-300">Blank</h3>
                    <p className="mt-1 text-xs text-zinc-500">Empty canvas.</p>
                  </div>
                </button>

                <button
                  onClick={() => setView("templates")}
                  className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-900/20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:bg-zinc-800 dark:group-hover:bg-indigo-900/50 dark:group-hover:text-indigo-400">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-bold text-zinc-900 group-hover:text-indigo-700 dark:text-zinc-100 dark:group-hover:text-indigo-300">Templates</h3>
                    <p className="mt-1 text-xs text-zinc-500">Pick a layout.</p>
                  </div>
                </button>

                <button
                  onClick={() => setView("import")}
                  className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-900/20"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:bg-zinc-800 dark:group-hover:bg-indigo-900/50 dark:group-hover:text-indigo-400">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-bold text-zinc-900 group-hover:text-indigo-700 dark:text-zinc-100 dark:group-hover:text-indigo-300">Import</h3>
                    <p className="mt-1 text-xs text-zinc-500">PDF or DOCX.</p>
                  </div>
                </button>
              </div>
            )}

            {view === "templates" && (
              <div className="flex-1 overflow-y-auto max-h-[60vh] -mx-2 px-2 pb-4 space-y-6">
                {['Personal / Career', 'Business', 'Product', 'Marketing', 'Project Management', 'Design', 'HR', 'Academic'].map(category => {
                  const items = ADVANCED_TEMPLATES.filter(t => t.category === category);
                  if (items.length === 0) return null;
                  return (
                    <div key={category} className="mb-6 last:mb-0">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 pl-1">{category}</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {items.map(tmpl => (
                          <button
                            key={tmpl.id}
                            onClick={() => onTemplateSelect?.(tmpl)}
                            className="flex flex-col text-left rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-indigo-500 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-indigo-500/50"
                          >
                            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-2">{tmpl.name}</h4>
                            <div className="w-full h-24 overflow-hidden rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 relative pointer-events-none p-2 flex items-start justify-center">
                              <div className="scale-[0.25] origin-top opacity-60 w-[400%]" dangerouslySetInnerHTML={{ __html: tmpl.html }} />
                              <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-zinc-50 dark:from-zinc-900 to-transparent" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {view === "import" && (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-full rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-10 text-center transition hover:border-indigo-400 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-indigo-500/50 dark:hover:bg-zinc-800">
                  {uploading ? (
                    <div className="flex flex-col items-center justify-center gap-3">
                       <svg className="animate-spin text-indigo-500 h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                       <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Importing document... Please wait.</p>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 text-zinc-500 dark:bg-zinc-700/50 dark:text-zinc-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                      </div>
                      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        Drag and drop your document here
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        (PDF, DOC, DOCX up to 50MB)
                      </p>
                      <label className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-xl bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                        Browse Files
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </>
                  )}
                </div>

                {error && (
                  <div className="w-full rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
                    <p className="font-semibold">Import Failed</p>
                    <p className="mt-1 opacity-90">{error}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {(view === "import" || view === "templates") && !uploading && (
             <div className="flex items-center gap-2 border-t border-zinc-100 p-4 dark:border-zinc-800/50">
               <button
                 onClick={() => { setView("menu"); setError(""); }}
                 className="rounded-lg px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
               >
                 &larr; Back
               </button>
             </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
