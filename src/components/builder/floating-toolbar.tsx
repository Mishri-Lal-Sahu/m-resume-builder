"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import type { ContentTool } from "@/features/resumes/content-tools";

type FloatingToolbarProps = {
  id: string | null;
  currentSpacing?: number;
  currentAlign?: "left" | "center" | "right";
  onTool: (tool: ContentTool) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSpacingChange: (value: number) => void;
  onAlignChange: (value: "left" | "center" | "right") => void;
};

export function FloatingToolbar({ id, currentSpacing, currentAlign, onTool, onDuplicate, onDelete, onSpacingChange, onAlignChange }: FloatingToolbarProps) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) {
      setCoords(null);
      return;
    }

    const updatePosition = () => {
      const el = document.querySelector(`[data-section-id="${id}"]`) || 
                 document.getElementById(`section-editor-${id}`);
      
      if (el) {
        const rect = el.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY - 48,
          left: rect.left + window.scrollX + (rect.width / 2),
        });
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [id]);

  return (
    <AnimatePresence>
      {id && coords && (
        <motion.div
          ref={toolbarRef}
          initial={{ opacity: 0, y: 10, x: "-50%", scale: 0.95 }}
          animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
          exit={{ opacity: 0, y: 10, x: "-50%", scale: 0.95 }}
          style={{ 
            position: "absolute",
            top: coords.top,
            left: coords.left,
            zIndex: 50,
          }}
          className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white/80 p-1 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80"
        >
          <div className="flex items-center gap-0.5 border-r border-zinc-100 pr-1 dark:border-zinc-800">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => document.execCommand("bold")}
              className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Bold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => document.execCommand("italic")}
              className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Italic"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></svg>
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => document.execCommand("underline")}
              className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" x2="20" y1="21" y2="21"/></svg>
            </button>
          </div>

          <div className="flex items-center gap-0.5 border-r border-zinc-100 pr-1 dark:border-zinc-800">
            {(["left", "center", "right"] as const).map((align) => (
              <button
                key={align}
                onClick={() => onAlignChange(align)}
                className={`rounded-full p-2 transition ${
                  currentAlign === align 
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" 
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`}
                title={`Align ${align}`}
              >
                {align === "left" && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/><line x1="9" x2="3" y1="24" y2="24"/></svg>}
                {align === "center" && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="18" x2="6" y1="12" y2="12"/><line x1="17" x2="7" y1="18" y2="18"/><line x1="14" x2="10" y1="24" y2="24"/></svg>}
                {align === "right" && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="7" y1="18" y2="18"/><line x1="21" x2="15" y1="24" y2="24"/></svg>}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-0.5 border-r border-zinc-100 pr-1 dark:border-zinc-800">
            {(["bullets", "summarize", "tighten"] as const).map((tool) => (
              <button
                key={tool}
                onClick={() => onTool(tool)}
                className="rounded-full px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                {tool === "bullets" ? "LIST" : tool === "summarize" ? "AI" : tool}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-2 border-r border-zinc-100 dark:border-zinc-800">
            <span className="text-[9px] font-bold text-zinc-400">GAP</span>
            <input 
              type="range"
              min="0"
              max="100"
              step="4"
              value={currentSpacing ?? 24}
              onChange={(e) => onSpacingChange(parseInt(e.target.value))}
              className="w-16 h-1 bg-zinc-200 rounded-full appearance-none accent-zinc-900 dark:bg-zinc-800 dark:accent-zinc-100"
            />
          </div>
          
          <div className="flex items-center gap-0.5 pl-0.5">
            <button
              onClick={onDuplicate}
              className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              title="Duplicate"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
            <button
              onClick={onDelete}
              className="rounded-full p-2 text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
