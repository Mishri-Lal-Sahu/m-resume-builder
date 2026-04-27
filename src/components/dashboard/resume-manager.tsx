"use client";

import { Resume } from "@/generated/prisma/client";
import { formatDistanceToNow } from "date-fns";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ResumeManagerProps = {
  initialResumes: Array<{
    id: string;
    title: string;
    visibility: "PRIVATE" | "LINK_ONLY" | "PUBLIC";
    updatedAt: Date;
  }>;
};

export function ResumeManager({ initialResumes }: ResumeManagerProps) {
  const [resumes, setResumes] = useState(initialResumes);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const createResume = async () => {
    setCreating(true);
    try {
      const resp = await fetch("/api/resumes", { method: "POST" });
      if (resp.ok) {
        const { resume } = await resp.json();
        router.push(`/builder/${resume.id}`);
      }
    } finally {
      setCreating(false);
    }
  };

  const deleteResume = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      const resp = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (resp.ok) {
        setResumes((prev) => prev.filter((r) => r.id !== id));
      }
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
        setResumes((prev) => prev.map((r) => (r.id === id ? { ...r, visibility: next as "PRIVATE" | "PUBLIC" | "LINK_ONLY" } : r)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">My Resumes</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage and create your professional resumes.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={createResume}
            disabled={creating}
            className="rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {creating ? "Creating..." : "New Resume"}
          </button>
          <button
            onClick={() => signOut()}
            className="rounded-xl border border-zinc-200 px-6 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {resumes.map((resume) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 shadow-sm"
            >
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 dark:text-zinc-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleVisibility(resume.id, resume.visibility)}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition ${
                        resume.visibility === "PUBLIC" 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {resume.visibility}
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">{resume.title}</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Last updated {formatDistanceToNow(new Date(resume.updatedAt))} ago
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <Link
                  href={`/builder/${resume.id}`}
                  className="flex-1 rounded-lg bg-zinc-100 px-4 py-2 text-center text-xs font-semibold text-zinc-900 transition hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  Block Builder
                </Link>
                <Link
                  href={`/docs/${resume.id}`}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-xs font-semibold text-white transition hover:bg-blue-700 shadow-sm"
                >
                  Docs Editor
                </Link>
                <button
                  onClick={() => deleteResume(resume.id)}
                  className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/10"
                  title="Delete Document"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a0 1 0-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {resumes.length === 0 && !creating && (
          <div className="col-span-full py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No resumes yet</h3>
            <p className="mt-1 text-sm text-zinc-500">Create your first resume to get started.</p>
            <button
              onClick={createResume}
              className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Start Building
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
