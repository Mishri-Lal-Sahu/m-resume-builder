"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  AuthLayout, AuthHeading, AuthSubtext, AuthInput,
  AuthLabel, AuthButton, AuthAlert, AuthDivider,
} from "@/components/auth/auth-layout";

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error,  setError]  = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setStatus("loading");
    try {
      await fetch("/api/auth/password-reset/request", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus("sent"); // Always show success — prevents email enumeration
    } catch { setError("Network error. Please try again."); setStatus("idle"); }
  }

  return (
    <AuthLayout>
      {status === "sent" ? (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Check your inbox</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            If <strong style={{ color: "var(--text-primary)" }}>{email}</strong> has an M-Docs account, a reset link has been sent.
          </p>
          <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
            Didn&apos;t get it? Check spam or{" "}
            <button onClick={() => setStatus("idle")} className="text-indigo-500 hover:text-indigo-400 underline transition">try again</button>.
          </p>
        </div>
      ) : (
        <>
          <AuthHeading>Forgot password?</AuthHeading>
          <AuthSubtext>We&apos;ll email you a reset link.</AuthSubtext>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div className="space-y-1">
              <AuthLabel htmlFor="email">Your email</AuthLabel>
              <AuthInput id="email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            {error && <AuthAlert variant="error">{error}</AuthAlert>}
            <AuthButton loading={status === "loading"}>Send Reset Link</AuthButton>
          </form>
        </>
      )}

      <AuthDivider />
      <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
        <Link href="/login" className="text-indigo-500 hover:text-indigo-400 transition">← Back to login</Link>
      </p>
    </AuthLayout>
  );
}
