"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      setError(data?.message ?? "Unable to create account");
      setIsSubmitting(false);
      return;
    }
    // Registration successful — redirect to OTP verification.
    // Do NOT attempt signIn here: email is not yet verified.
    setIsSubmitting(false);
    router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Full name</label>
        <input
          id="name" required minLength={2}
          value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          style={{ background: "var(--page-bg)", border: "1px solid var(--card-border)", color: "var(--text-primary)" }}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Email</label>
        <input
          id="email" type="email" required autoComplete="username"
          value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          style={{ background: "var(--page-bg)", border: "1px solid var(--card-border)", color: "var(--text-primary)" }}
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Password</label>
        <input
          id="password" type="password" required minLength={8} autoComplete="new-password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          style={{ background: "var(--page-bg)", border: "1px solid var(--card-border)", color: "var(--text-primary)" }}
        />
      </div>
      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>
      )}
      <button
        type="submit" disabled={isSubmitting}
        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
