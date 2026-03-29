"use client";

import React from "react";

/**
 * Shared shell for all auth pages (login, signup, verify-otp, forgot-password,
 * reset-password, admin/login).  Uses CSS variables defined in globals.css so
 * the page automatically adapts to dark / light theme.
 */

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center px-5 py-10 transition-colors duration-200"
      style={{ background: "var(--page-bg)" }}
    >
      {/* Floating theme toggle — top-right */}
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-2xl backdrop-blur-sm transition-colors duration-200"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
        }}
      >
        {/* M-Docs logo */}
        <div className="mb-6 flex justify-center">
          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                <path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>
              </svg>
            </div>
            <span
              className="text-base font-bold tracking-tight transition-colors"
              style={{ color: "var(--text-primary)" }}
            >
              M-Docs
            </span>
          </Link>
        </div>

        {children}
      </div>
    </main>
  );
}

// ── Reusable styled sub-elements ─────────────────────────────────────────────

export function AuthHeading({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className="text-xl font-bold transition-colors"
      style={{ color: "var(--text-primary)" }}
    >
      {children}
    </h1>
  );
}

export function AuthSubtext({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1 text-sm transition-colors" style={{ color: "var(--text-secondary)" }}>
      {children}
    </p>
  );
}

export const AuthInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function AuthInput(props, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors duration-200
          focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
          ${props.className ?? ""}`}
        style={{
          background: "var(--page-bg)",
          border: "1px solid var(--card-border)",
          color: "var(--text-primary)",
          ...props.style,
        }}
      />
    );
  }
);

export function AuthLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs font-semibold uppercase tracking-wider transition-colors"
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </label>
  );
}

export function AuthButton({
  children,
  loading,
  disabled,
  ...props
}: {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      type={props.type ?? "submit"}
      disabled={disabled ?? loading}
      className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {children}
        </span>
      ) : children}
    </button>
  );
}

export function AuthDivider() {
  return <div className="my-5 border-t transition-colors" style={{ borderColor: "var(--card-border)" }} />;
}

export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-medium underline-offset-2 transition-colors hover:underline"
      style={{ color: "var(--text-primary)" }}
    >
      {children}
    </Link>
  );
}

export function AuthAlert({
  variant,
  children,
}: {
  variant: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  const variants = {
    error:   "border-red-200  bg-red-50  text-red-700  dark:border-red-800/50 dark:bg-red-950/40  dark:text-red-400",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-400",
    info:    "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-950/40 dark:text-indigo-300",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${variants[variant]}`}>
      {children}
    </div>
  );
}
