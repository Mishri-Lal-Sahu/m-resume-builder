"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Visibility = "PRIVATE" | "LINK_ONLY" | "PUBLIC";

type ShareActionsProps = {
  resumeId: string;
  initialVisibility: Visibility;
  initialSlug: string | null;
  onUpdate: (patch: { visibility?: Visibility; slug?: string }) => void;
};

const VISIBILITY_OPTIONS: { value: Visibility; label: string; description: string }[] = [
  { value: "PRIVATE", label: "Private", description: "Only you can access" },
  { value: "LINK_ONLY", label: "Anyone with link", description: "Accessible via direct link" },
  { value: "PUBLIC", label: "Public", description: "Listed publicly + direct link" },
];

export function ShareActions({ resumeId, initialVisibility, initialSlug, onUpdate }: ShareActionsProps) {
  const [open, setOpen] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>(initialVisibility);
  const [slug, setSlug] = useState(initialSlug || "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    setStatus("saving");
    try {
      const body: Record<string, unknown> = { visibility };
      if (visibility === "PUBLIC" && slug) body.slug = slug;

      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setStatus("error");
        console.error("[share] patch failed:", data);
        return;
      }

      setStatus("saved");
      onUpdate({ visibility, slug: visibility === "PUBLIC" ? slug : undefined });
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  };

  const shareIdentifier = visibility === "PUBLIC" && slug ? slug : resumeId;
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/d/${shareIdentifier}`
      : `/d/${shareIdentifier}`;

  const isShareable = visibility !== "PRIVATE";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" x2="12" y1="2" y2="15"/>
        </svg>
        Share
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-20 mt-2 w-96 rounded-xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Share document</p>
                  <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                {/* Visibility selector */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Visibility
                  </label>
                  <div className="mt-2 flex flex-col gap-2">
                    {VISIBILITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setVisibility(opt.value)}
                        className={`rounded-lg border px-3 py-2.5 text-left transition flex items-center justify-between gap-2 ${
                          visibility === opt.value
                            ? "border-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/10"
                            : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                        }`}
                      >
                        <div>
                          <p className={`text-sm font-semibold ${visibility === opt.value ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-700 dark:text-zinc-300"}`}>
                            {opt.label}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">{opt.description}</p>
                        </div>
                        {visibility === opt.value && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-indigo-500">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom slug (only for PUBLIC) */}
                {visibility === "PUBLIC" && (
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Custom Slug (optional)
                    </label>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      placeholder="my-awesome-resume"
                      className="mt-2 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                    />
                    <p className="mt-1 text-[11px] text-zinc-400">Letters, numbers and hyphens only</p>
                  </div>
                )}

                {/* Share link preview */}
                {isShareable && (
                  <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Share Link</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate font-mono">{shareUrl}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <button
                    onClick={handleSave}
                    disabled={status === "saving"}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {status === "saving" ? "Saving…" : status === "saved" ? "✓ Saved" : status === "error" ? "Failed — retry" : "Save"}
                  </button>
                  {isShareable && (
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {copied
                          ? <polyline points="20 6 9 17 4 12"/>
                          : <><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></>
                        }
                      </svg>
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
