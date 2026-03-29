"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import type { ContentTool } from "@/features/resumes/content-tools";
import { sectionTypeOptions, type ResumeSectionType } from "@/features/resumes/types";

type SlashMenuProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: ContentTool) => void;
  onAddSection: (type: ResumeSectionType) => void;
  onAddText: (size: number, label: string) => void;
  position: { top: number; left: number };
};

export function SlashMenu({ isOpen, onClose, onSelectTool, onAddSection, onAddText, position }: SlashMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  type SlashMenuItem =
    | { id: string; type: "separator" }
    | { id: ContentTool; label: string; icon: string; type: "tool" }
    | { id: ResumeSectionType; label: string; icon: string; type: "section" }
    | { id: string; label: string; icon: string; type: "text-preset"; size: number };

  const items = useMemo<SlashMenuItem[]>(() => [
    { id: "summarize", label: "Magic Summarize", icon: "✨", type: "tool" },
    { id: "starter", label: "Starter Template", icon: "🧩", type: "tool" },
    { id: "bullets", label: "Convert to List", icon: "📋", type: "tool" },
    { id: "quantify", label: "Add Metrics", icon: "📈", type: "tool" },
    { id: "actionVerbs", label: "Upgrade Verbs", icon: "🚀", type: "tool" },
    { id: "tighten", label: "Tighten Content", icon: "✂️", type: "tool" },
    { id: "sep1", type: "separator" },
    { id: "h1", label: "Add Heading", icon: "H1", type: "text-preset", size: 24 },
    { id: "h2", label: "Add Subheading", icon: "H2", type: "text-preset", size: 18 },
    { id: "p", label: "Add Body Text", icon: "Aa", type: "text-preset", size: 11 },
    { id: "sep2", type: "separator" },
    ...sectionTypeOptions
      .filter((t) => t !== "text")
      .map((t) => ({ id: t, label: `Insert ${t}`, icon: "➕", type: "section" as const })),
  ], []);

  const getNextSelectableIndex = useCallback((from: number, direction: 1 | -1) => {
    let next = from;
    for (let i = 0; i < items.length; i += 1) {
      next = (next + direction + items.length) % items.length;
      if (items[next].type !== "separator") return next;
    }
    return 0;
  }, [items]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => getNextSelectableIndex(prev, 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => getNextSelectableIndex(prev, -1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = items[selectedIndex];
        if (item.type === "tool") onSelectTool(item.id);
        else if (item.type === "section") onAddSection(item.id);
        else if (item.type === "text-preset") onAddText(item.size, item.label);
        onClose();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, getNextSelectableIndex, items, onSelectTool, onAddSection, onAddText, onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          style={{ 
            position: "fixed",
            top: position.top,
            left: position.left,
            zIndex: 100,
          }}
          className="w-64 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="px-2 py-1.5 mb-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Magic Commands</p>
          </div>
          <div className="max-h-80 overflow-y-auto no-scrollbar">
            {items.map((item, index) => {
              if (item.type === "separator") {
                return <div key={item.id} className="my-1 h-px bg-zinc-100 dark:bg-zinc-800" />;
              }
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.type === "tool") onSelectTool(item.id);
                    else if (item.type === "section") onAddSection(item.id);
                    else if (item.type === "text-preset") onAddText(item.size, item.label);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs transition ${
                    selectedIndex === index 
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" 
                      : "text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
