"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const name = session?.user?.name ?? session?.user?.email ?? "User";
  const email = session?.user?.email ?? "";
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      {/* Theme toggle */}
      <ThemeToggle />

      {/* Avatar + dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition hover:shadow-indigo-500/40 hover:scale-105"
          aria-label="Open user menu"
        >
          {initial}
        </button>

        {open && (
          <div
            className="absolute right-0 top-11 z-50 w-56 rounded-2xl border shadow-2xl overflow-hidden animate-fade-in-up transition-colors"
            style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}
          >
            {/* Profile header */}
            <div className="px-4 py-3 border-b transition-colors" style={{ borderColor: "var(--card-border)" }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shrink-0">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold transition-colors" style={{ color: "var(--text-primary)" }}>{name}</p>
                  <p className="truncate text-xs transition-colors" style={{ color: "var(--text-secondary)" }}>{email}</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1.5">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                style={{ color: "var(--text-secondary)" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                My Documents
              </Link>

              <div className="my-1 border-t transition-colors" style={{ borderColor: "var(--card-border)" }} />

              {/* Dark / Light toggle row */}
              <div className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm transition-colors" style={{ color: "var(--text-muted)" }}>Appearance</span>
                <ThemeToggle />
              </div>

              <div className="my-1 border-t transition-colors" style={{ borderColor: "var(--card-border)" }} />

              <button
                onClick={() => { setOpen(false); signOut({ callbackUrl: window.location.origin + "/login" }); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

