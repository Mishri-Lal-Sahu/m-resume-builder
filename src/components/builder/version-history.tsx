"use client";

import { useState } from "react";
import type { ResumeDocument } from "@/features/resumes/types";

export type Snapshot = {
  id: string;
  name: string;
  createdAt: number; // Unix ms
  content: ResumeDocument;
  title: string;
};

type Props = {
  snapshots: Snapshot[];
  onSave: (name: string) => void;
  onRestore: (snapshot: Snapshot) => void;
  onDelete: (id: string) => void;
};

function timeAgo(ms: number) {
  const secs = Math.floor((Date.now() - ms) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function VersionHistory({ snapshots, onSave, onRestore, onDelete }: Props) {
  const [label, setLabel] = useState("");
  const [showInput, setShowInput] = useState(false);

  function save() {
    const name = label.trim() || `Version ${snapshots.length + 1}`;
    onSave(name);
    setLabel("");
    setShowInput(false);
  }

  return (
    <div className="space-y-3">
      {/* Save new snapshot */}
      {showInput ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setShowInput(false); }}
            placeholder="Snapshot name…"
            className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-[12px] outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-400"
          />
          <button onClick={save} className="rounded-lg bg-zinc-900 px-3 py-1.5 text-[12px] font-bold text-white active:scale-95 dark:bg-zinc-100 dark:text-zinc-900">Save</button>
          <button onClick={() => setShowInput(false)} className="rounded-lg px-2 py-1.5 text-[12px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">✕</button>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="flex w-full items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-[12px] font-semibold text-zinc-500 transition hover:border-zinc-500 hover:text-zinc-700 active:scale-95 dark:border-zinc-700 dark:hover:border-zinc-500 dark:text-zinc-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Save Snapshot
        </button>
      )}

      {/* Snapshot list */}
      {snapshots.length === 0 ? (
        <p className="text-[11px] text-zinc-400 text-center py-4 dark:text-zinc-600">No versions saved yet.</p>
      ) : (
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {[...snapshots].reverse().map((snap) => (
            <div key={snap.id} className="group flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition">
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 truncate">{snap.name}</p>
                <p className="text-[10px] text-zinc-400">{timeAgo(snap.createdAt)}</p>
              </div>
              <button
                onClick={() => onRestore(snap)}
                title="Restore this version"
                className="hidden group-hover:flex h-7 items-center gap-1 rounded-md bg-zinc-900 px-2 text-[10px] font-bold text-white dark:bg-zinc-200 dark:text-zinc-900 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Restore
              </button>
              <button
                onClick={() => onDelete(snap.id)}
                title="Delete snapshot"
                className="hidden group-hover:flex h-7 w-7 items-center justify-center rounded-md text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-zinc-400 dark:text-zinc-600">Max 20 snapshots stored in-session.</p>
    </div>
  );
}
