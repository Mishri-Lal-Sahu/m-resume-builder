"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  AuthLayout, AuthHeading, AuthSubtext, AuthInput,
  AuthLabel, AuthAlert, AuthDivider,
} from "@/components/auth/auth-layout";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid credentials.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      {/* Admin badge */}
      <div className="mb-4 flex justify-center">
        <span className="rounded-full border border-rose-300 dark:border-rose-800/50 bg-rose-50 dark:bg-rose-950/40 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
          Admin Access
        </span>
      </div>

      <AuthHeading>Admin Login</AuthHeading>
      <AuthSubtext>M-Docs administration panel — separate secure access</AuthSubtext>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div className="space-y-1">
          <AuthLabel htmlFor="admin-email">Admin email</AuthLabel>
          <AuthInput id="admin-email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" />
        </div>
        <div className="space-y-1">
          <AuthLabel htmlFor="admin-password">Password</AuthLabel>
          <AuthInput id="admin-password" type="password" required minLength={8} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <AuthAlert variant="error">{error}</AuthAlert>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:from-rose-500 hover:to-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in to Admin"}
        </button>
      </form>

      <AuthDivider />
      <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
        Not an admin?{" "}
        <Link href="/login" className="text-indigo-500 hover:text-indigo-400 transition">Regular login</Link>
      </p>
    </AuthLayout>
  );
}

