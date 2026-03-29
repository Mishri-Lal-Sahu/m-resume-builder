"use client";

import { formatDistanceToNow } from "date-fns";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type Doc = {
  id: string;
  title: string;
  visibility: "PRIVATE" | "LINK_ONLY" | "PUBLIC";
  updatedAt: Date;
};

type DocManagerProps = { initialResumes: Doc[] };

// ─── Visibility Badge ─────────────────────────────────────────────────────────

function VisibilityBadge({ v, onClick }: { v: Doc["visibility"]; onClick: () => void }) {
  const map = {
    PUBLIC:    { label: "Public",     cls: "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 border-emerald-500/30" },
    LINK_ONLY: { label: "Link Only",  cls: "bg-amber-500/15  text-amber-500 dark:text-amber-400  border-amber-500/30"  },
    PRIVATE:   { label: "Private",    cls: "bg-zinc-500/10 dark:bg-zinc-700/50 text-zinc-500 dark:text-zinc-400 border-zinc-500/20 dark:border-zinc-600/40"    },
  };
  const { label, cls } = map[v];
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition hover:opacity-80 ${cls}`}
    >
      {label}
    </button>
  );
}

// ─── Doc Card ─────────────────────────────────────────────────────────────────

const docColors = [
  "from-indigo-500 to-violet-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-rose-600",
  "from-pink-500 to-purple-600",
  "from-amber-500 to-orange-600",
];

function DocCard({
  doc,
  idx,
  onDelete,
  onToggleVisibility,
}: {
  doc: Doc;
  idx: number;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string, current: string) => void;
}) {
  const color = docColors[idx % docColors.length];
  const initials = doc.title.trim().slice(0, 2).toUpperCase() || "DC";
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    const url = `${window.location.origin}/d/${doc.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/20"
      style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-sm font-bold text-white shadow-lg`}>
          {initials}
        </div>
        <VisibilityBadge v={doc.visibility} onClick={() => onToggleVisibility(doc.id, doc.visibility)} />
      </div>

      {/* Body */}
      <div className="mt-4 flex-1">
        <h3 className="line-clamp-1 text-sm font-bold transition-colors" style={{ color: "var(--text-primary)" }}>{doc.title || "Untitled Document"}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs transition-colors" style={{ color: "var(--text-muted)" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {formatDistanceToNow(new Date(doc.updatedAt))} ago
        </p>
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center gap-2">
        <Link
          href={`/docs/${doc.id}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500 shadow-sm shadow-indigo-500/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Open
        </Link>
        <button
          onClick={copyLink}
          disabled={doc.visibility === "PRIVATE"}
          className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 ${
            copied ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : "hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600"
          } disabled:opacity-30 disabled:cursor-not-allowed`}
          style={copied ? {} : { borderColor: "var(--card-border)", color: "var(--text-muted)" }}
          title={doc.visibility === "PRIVATE" ? "Set to Public to copy link" : copied ? "Copied!" : "Copy Link"}
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          )}
        </button>
        <button
          onClick={() => {
            if (confirm(`Delete "${doc.title || "this document"}"?`)) onDelete(doc.id);
          }}
          className="icon-btn flex h-9 w-9 items-center justify-center rounded-xl border transition-colors hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600"
          style={{ borderColor: "var(--card-border)", color: "var(--text-muted)" }}
          title="Delete"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onCreate, creating }: { onCreate: () => void; creating: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed px-8 py-20 text-center transition-colors"
      style={{ borderColor: "var(--card-border)", background: "transparent" }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-xl shadow-indigo-500/30"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      </motion.div>
      <h3 className="text-base font-bold transition-colors" style={{ color: "var(--text-primary)" }}>No documents yet</h3>
      <p className="mt-2 max-w-xs text-sm transition-colors" style={{ color: "var(--text-secondary)" }}>Create your first document and start writing. Auto-save keeps everything safe.</p>
      <button
        onClick={onCreate}
        disabled={creating}
        className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 disabled:opacity-50"
      >
        {creating ? "Creating…" : "Create Document"}
      </button>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DocManager({ initialResumes }: DocManagerProps) {
  const [docs, setDocs] = useState<Doc[]>(initialResumes);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const createDoc = async () => {
    setCreating(true);
    try {
      const resp = await fetch("/api/resumes", { method: "POST" });
      if (resp.ok) {
        const { resume } = await resp.json();
        router.push(`/docs/${resume.id}`);
      }
    } finally {
      setCreating(false);
    }
  };

  const deleteDoc = async (id: string) => {
    try {
      const resp = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (resp.ok) setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleVisibility = async (id: string, current: string) => {
    const next = current === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    try {
      const resp = await fetch(`/api/resumes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: next }),
      });
      if (resp.ok) {
        setDocs((prev) =>
          prev.map((d) => (d.id === id ? { ...d, visibility: next as Doc["visibility"] } : d))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* ─ Header ─ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl transition-colors" style={{ color: "var(--text-primary)" }}>My Documents</h2>
          <p className="mt-1 text-sm transition-colors" style={{ color: "var(--text-muted)" }}>All your M-Docs in one place.</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={createDoc}
            disabled={creating}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {creating ? "Creating…" : "New Document"}
          </motion.button>
          <button
            onClick={() => signOut()}
            className="rounded-xl border px-5 py-2.5 text-sm font-semibold transition hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
            style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)" }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ─ Grid ─ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {docs.map((doc, idx) => (
            <DocCard
              key={doc.id}
              doc={doc}
              idx={idx}
              onDelete={deleteDoc}
              onToggleVisibility={toggleVisibility}
            />
          ))}
        </AnimatePresence>

        {docs.length === 0 && !creating && (
          <EmptyState onCreate={createDoc} creating={creating} />
        )}
      </div>
    </div>
  );
}

