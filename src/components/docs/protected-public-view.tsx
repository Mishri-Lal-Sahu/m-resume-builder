"use client";

import { useState } from "react";
import { PublicDocsViewer } from "@/components/docs/public-viewer";
import { TipTapDoc } from "@/features/resumes/tiptap-bridge";

type Props = {
  docId: string;
  title: string;
};

export function ProtectedPublicView({ docId, title }: Props) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<TipTapDoc | null>(null);
  const [pages, setPages] = useState<TipTapDoc[] | undefined>(undefined);

  const unlock = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/docs/public/${docId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Unable to unlock document.");
        return;
      }
      setContent(data.content ?? { type: "doc", content: [] });
      setPages(Array.isArray(data.pages) ? data.pages : undefined);
    } catch {
      setError("Unable to unlock document.");
    } finally {
      setLoading(false);
    }
  };

  if (content) {
    return <PublicDocsViewer title={title} initialContent={content} initialPages={pages} />;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">This document is password protected.</p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter document password"
        className="mt-4 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <button
        onClick={unlock}
        disabled={loading || password.trim().length < 1}
        className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? "Unlocking..." : "Unlock"}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </main>
  );
}
