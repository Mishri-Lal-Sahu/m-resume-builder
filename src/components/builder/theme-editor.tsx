"use client";

import type { ResumeTheme } from "@/features/resumes/types";
import { motion } from "framer-motion";

type ThemeEditorProps = {
  theme: ResumeTheme;
  onChange: (theme: Partial<ResumeTheme>) => void;
};

export function ThemeEditor({ theme, onChange }: ThemeEditorProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Margins</label>
          <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-950">
            {(["narrow", "normal", "wide"] as const).map((m) => (
              <button
                key={m}
                onClick={() => onChange({ margins: m })}
                className={`flex-1 rounded-md py-1.5 text-[10px] font-bold uppercase transition ${
                  theme.margins === m
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Density</label>
          <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-950">
            {(["compact", "balanced", "spacious"] as const).map((d) => (
              <button
                key={d}
                onClick={() => onChange({ density: d })}
                className={`flex-1 rounded-md py-1.5 text-[10px] font-bold uppercase transition ${
                  theme.density === d
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {d[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Line Height</label>
            <span className="text-[10px] font-medium text-zinc-400">{theme.lineHeight}</span>
          </div>
          <input
            type="range"
            min="1"
            max="2"
            step="0.1"
            value={theme.lineHeight}
            onChange={(e) => onChange({ lineHeight: parseFloat(e.target.value) })}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900 dark:bg-zinc-800 dark:accent-zinc-100"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Letter Spacing</label>
            <span className="text-[10px] font-medium text-zinc-400">{theme.letterSpacing}em</span>
          </div>
          <input
            type="range"
            min="-0.05"
            max="0.2"
            step="0.01"
            value={theme.letterSpacing}
            onChange={(e) => onChange({ letterSpacing: parseFloat(e.target.value) })}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900 dark:bg-zinc-800 dark:accent-zinc-100"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Section Spacing</label>
            <span className="text-[10px] font-medium text-zinc-400">{theme.sectionSpacing}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="64"
            step="4"
            value={theme.sectionSpacing}
            onChange={(e) => onChange({ sectionSpacing: parseInt(e.target.value) })}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900 dark:bg-zinc-800 dark:accent-zinc-100"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Font Size</label>
            <span className="text-[10px] font-medium text-zinc-400">{theme.fontSize}px</span>
          </div>
          <input
            type="range"
            min="8"
            max="16"
            step="0.5"
            value={theme.fontSize}
            onChange={(e) => onChange({ fontSize: parseFloat(e.target.value) })}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900 dark:bg-zinc-800 dark:accent-zinc-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Layout</label>
          <select
            value={theme.layout}
            onChange={(e) => onChange({ layout: e.target.value as "single" | "split" })}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="single">Single Column</option>
            <option value="split">Split Layout</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Style</label>
          <select
            value={theme.sectionStyle}
            onChange={(e) => onChange({ sectionStyle: e.target.value as "plain" | "card" | "line" })}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs outline-none dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="plain">Plain</option>
            <option value="card">Cards</option>
            <option value="line">Line Decor</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Page Management</label>
        <div className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <span className="flex-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">{theme.pageCount} {theme.pageCount === 1 ? 'Page' : 'Pages'} (A4)</span>
          <div className="flex gap-2">
            <button 
              onClick={() => onChange({ pageCount: Math.max(1, theme.pageCount - 1) })}
              className="rounded border border-zinc-200 px-2 py-1 text-xs hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              -
            </button>
            <button 
              onClick={() => onChange({ pageCount: Math.min(10, theme.pageCount + 1) })}
              className="rounded border border-zinc-200 px-2 py-1 text-xs hover:bg-white dark:border-zinc-800 dark:hover:bg-zinc-900"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
