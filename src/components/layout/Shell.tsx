"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Navbar() {
  const pathname = usePathname();

  // Hide nav on dashboard, admin, and editor/viewer pages
  const isAuthPage = pathname?.startsWith("/dashboard") || 
                     pathname?.startsWith("/admin") || 
                     pathname?.startsWith("/docs") ||
                     pathname?.startsWith("/d/");
  
  if (isAuthPage) return null;

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-5 py-3.5 sm:px-10 sm:py-4 transition-all border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>
          </div>
          <span className="text-lg font-bold tracking-tight dark:text-white text-black">M-Docs</span>
        </Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:hover:bg-zinc-800" style={{ color: "var(--text-secondary)" }}>
          Login
        </Link>
        <Link href="/signup" className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500 sm:px-5">
          Get Started
        </Link>
      </div>
    </nav>
  );
}

export function Footer() {
  const pathname = usePathname();

  // Hide footer on dashboard, admin, and editor/viewer pages
  const isAuthPage = pathname?.startsWith("/dashboard") || 
                     pathname?.startsWith("/admin") || 
                     pathname?.startsWith("/docs") ||
                     pathname?.startsWith("/d/");
  
  if (isAuthPage) return null;

  return (
    <footer className="relative z-10 border-t px-5 py-8 text-center text-xs transition-colors mt-auto bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm" style={{ borderColor: "var(--card-border)", color: "var(--text-muted)" }}>
      <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:px-10">
        <div className="flex flex-col items-center gap-1 sm:items-start text-[11px] dark:text-zinc-300 text-zinc-600 sm:text-xs">
          <span>© {new Date().getFullYear()} M-Docs. All rights reserved.</span>
          <span>Developed by <a href="https://m-pg.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-indigo-500 hover:text-indigo-400 transition-colors">M-Prime Group</a></span>
          <span>Support: <a href="mailto:m-docs@m-pg.in" className="hover:text-indigo-400 transition-colors">m-docs@m-pg.in</a></span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:justify-end font-medium">
          <Link href="/about" className="hover:text-indigo-500 dark:text-zinc-200 text-zinc-800 transition-colors">About</Link>
          <Link href="/contact" className="hover:text-indigo-500 dark:text-zinc-200 text-zinc-800 transition-colors">Contact</Link>
          <Link href="/privacy" className="hover:text-indigo-500 dark:text-zinc-200 text-zinc-800 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-indigo-500 dark:text-zinc-200 text-zinc-800 transition-colors">Terms</Link>
          <Link href="/disclaimer" className="hover:text-indigo-500 dark:text-zinc-200 text-zinc-800 transition-colors">Disclaimer</Link>
        </div>
      </div>
    </footer>
  );
}
