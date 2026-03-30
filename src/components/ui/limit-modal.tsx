"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type LimitType = "documents" | "pages" | "collaborators";

type LimitModalProps = {
  open: boolean;
  onClose: () => void;
  limitType: LimitType;
  limit: number;
  current?: number;
  message?: string;
};

const LIMIT_CONFIG: Record<LimitType, { icon: React.ReactNode; title: string; color: string; accent: string }> = {
  documents: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
    ),
    title: "Document Limit Reached",
    color: "from-orange-500 to-rose-600",
    accent: "text-orange-600 dark:text-orange-400",
  },
  pages: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2"/>
        <path d="M3 9h18"/>
        <path d="M3 15h18"/>
        <path d="M9 3v18"/>
      </svg>
    ),
    title: "Page Limit Reached",
    color: "from-violet-500 to-indigo-600",
    accent: "text-violet-600 dark:text-violet-400",
  },
  collaborators: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Collaborator Limit Reached",
    color: "from-cyan-500 to-teal-600",
    accent: "text-cyan-600 dark:text-cyan-400",
  },
};

export function LimitModal({ open, onClose, limitType, limit, current, message }: LimitModalProps) {
  const config = LIMIT_CONFIG[limitType];

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            {/* Header */}
            <div className={`flex items-center gap-4 rounded-t-2xl bg-gradient-to-br ${config.color} p-6 text-white`}>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                {config.icon}
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">Limit Exceeded</p>
                <h2 className="text-lg font-bold leading-tight">{config.title}</h2>
              </div>
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Limit meter */}
              <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Current Usage</span>
                  <span className={`text-sm font-bold ${config.accent}`}>{current ?? limit} / {limit}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${config.color}`}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              {/* Message */}
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {message || `You've reached the maximum of ${limit} ${limitType}. To continue, please free up existing ${limitType} or contact your administrator to increase the limit.`}
              </p>

              {/* Tip */}
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/30">
                <svg className="mt-0.5 shrink-0 text-amber-500" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                  <path d="M12 8v4"/><path d="M12 16h.01"/>
                </svg>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Administrators can adjust these limits from <strong>Admin → Settings → Platform</strong>.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <button
                onClick={onClose}
                className="rounded-xl bg-zinc-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
