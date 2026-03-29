"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ShareActionsProps = {
  resumeId: string;
  initialVisibility: "PRIVATE" | "LINK_ONLY" | "PUBLIC";
  initialSlug: string | null;
  onUpdate: (patch: { visibility?: "PRIVATE" | "LINK_ONLY" | "PUBLIC"; slug?: string }) => void;
};

export function ShareActions({ resumeId, initialVisibility, initialSlug, onUpdate }: ShareActionsProps) {
  const [open, setOpen] = useState(false);
  const [visibility, setVisibility] = useState(initialVisibility);
  const [slug, setSlug] = useState(initialSlug || "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    setStatus("saving");
    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility, slug }),
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("saved");
      onUpdate({ visibility, slug });
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  };

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/resume/${slug || resumeId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
        Share
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 rounded-xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Visibility</label>
                <div className="mt-2 flex flex-col gap-2">
                  {(["PRIVATE", "PUBLIC"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setVisibility(v)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition text-left flex items-center justify-between ${
                        visibility === v 
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900" 
                          : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                      }`}
                    >
                      {v}
                      {visibility === v && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                  ))}
                </div>
              </div>

              {visibility === "PUBLIC" && (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Custom Slug</label>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="my-awesome-resume"
                      className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <button
                  onClick={handleSave}
                  disabled={status === "saving"}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  {status === "saving" ? "Saving..." : status === "saved" ? "Saved!" : "Update Settings"}
                </button>
                {visibility === "PUBLIC" && (
                  <button
                    onClick={copyToClipboard}
                    className="text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
