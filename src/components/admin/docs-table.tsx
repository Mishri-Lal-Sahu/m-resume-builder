"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteDocumentAsAdmin } from "@/app/admin/(dashboard)/docs/actions";

type DocInfo = {
  id: string;
  title: string;
  visibility: "PRIVATE" | "LINK_ONLY" | "PUBLIC";
  createdAt: Date;
  updatedAt: Date;
  user: { name: string | null; email: string } | null;
};

export function DocsTable({ initialDocs }: { initialDocs: DocInfo[] }) {
  const [docs, setDocs] = useState<DocInfo[]>(initialDocs);
  const [search, setSearch] = useState("");
  const [filterVis, setFilterVis] = useState<string>("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = docs.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.user?.email.toLowerCase().includes(search.toLowerCase()) ||
      d.user?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesVis = filterVis === "ALL" || d.visibility === filterVis;
    return matchesSearch && matchesVis;
  });

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to completely delete "${title}"? This cannot be undone.`)) return;
    
    setLoadingId(id);
    const res = await deleteDocumentAsAdmin(id);
    if (res.success) {
      setDocs((prev) => prev.filter((doc) => doc.id !== id));
    } else {
      alert(res.error);
    }
    setLoadingId(null);
  };

  const getVisibilityBadge = (v: string) => {
    const map: Record<string, string> = {
      PUBLIC: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      LINK_ONLY: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      PRIVATE: "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
    };
    return (
      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[v]}`}>
        {v.replace("_", " ")}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by title, name, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-xl border px-4 py-2 text-sm transition-colors focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          style={{ borderColor: "var(--sidebar-border)", background: "var(--page-bg)", color: "var(--text-primary)" }}
        />
        <select
          value={filterVis}
          onChange={(e) => setFilterVis(e.target.value)}
          className="rounded-xl border px-4 py-2 text-sm transition-colors focus:border-rose-500 focus:outline-none"
          style={{ borderColor: "var(--sidebar-border)", background: "var(--page-bg)", color: "var(--text-primary)" }}
        >
          <option value="ALL">All Visibility</option>
          <option value="PUBLIC">Public</option>
          <option value="PRIVATE">Private</option>
          <option value="LINK_ONLY">Link Only</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border transition-colors shadow-sm" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b transition-colors bg-zinc-50 dark:bg-zinc-900/50" style={{ borderColor: "var(--card-border)" }}>
              <tr>
                <th className="px-5 py-3 font-semibold transition-colors" style={{ color: "var(--text-secondary)" }}>Document Title</th>
                <th className="px-5 py-3 font-semibold transition-colors" style={{ color: "var(--text-secondary)" }}>Owner</th>
                <th className="px-5 py-3 font-semibold transition-colors" style={{ color: "var(--text-secondary)" }}>Visibility</th>
                <th className="px-5 py-3 font-semibold transition-colors" style={{ color: "var(--text-secondary)" }}>Updated At</th>
                <th className="px-5 py-3 font-semibold transition-colors text-right" style={{ color: "var(--text-secondary)" }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 transition-colors">
              {filtered?.map((doc) => (
                <tr key={doc.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-5 py-3 font-medium transition-colors" style={{ color: "var(--text-primary)" }}>
                    <div className="flex items-center gap-2">
                      <div className="flex justify-center items-center h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 font-bold text-xs shrink-0">{doc.title.slice(0, 2).toUpperCase() || "DC"}</div>
                      <span className="truncate max-w-[12rem]">{doc.title || "Untitled"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 transition-colors" style={{ color: "var(--text-primary)" }}>
                    {doc.user ? (
                      <div>
                        <p>{doc.user.name || "Unknown"}</p>
                        <p className="text-xs transition-colors" style={{ color: "var(--text-muted)" }}>{doc.user.email}</p>
                      </div>
                    ) : (
                      <span className="italic" style={{ color: "var(--text-muted)" }}>Anonymous</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {getVisibilityBadge(doc.visibility)}
                  </td>
                  <td className="px-5 py-3 transition-colors" style={{ color: "var(--text-muted)" }}>
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/docs/${doc.id}`}
                        target="_blank"
                        className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(doc.id, doc.title)}
                        disabled={loadingId === doc.id}
                        className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                      >
                        {loadingId === doc.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
                    No documents match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
