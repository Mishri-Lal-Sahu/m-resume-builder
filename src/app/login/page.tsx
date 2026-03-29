"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";
import {
  AuthLayout, AuthHeading, AuthSubtext, AuthInput,
  AuthLabel, AuthButton, AuthAlert, AuthDivider,
} from "@/components/auth/auth-layout";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl   = searchParams.get("callbackUrl") ?? "/dashboard";
  const justVerified  = searchParams.get("verified") === "1";
  const justReset     = searchParams.get("reset")    === "1";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (!result || result.error) {
      setError("Invalid email / password, or email not yet verified.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <AuthLayout>
      {justVerified && <AuthAlert variant="success" >✓ Email verified! You can now sign in.</AuthAlert>}
      {justReset    && <AuthAlert variant="info">✓ Password updated. Sign in with your new password.</AuthAlert>}
      <div className={justVerified || justReset ? "mt-4" : ""}>
        <AuthHeading>Welcome back</AuthHeading>
        <AuthSubtext>Sign in to your M-Docs account.</AuthSubtext>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div className="space-y-1">
          <AuthLabel htmlFor="email">Email</AuthLabel>
          <AuthInput id="email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <AuthLabel htmlFor="password">Password</AuthLabel>
            <Link href="/forgot-password" className="text-xs text-indigo-500 hover:text-indigo-400 transition">Forgot?</Link>
          </div>
          <AuthInput id="password" type="password" required minLength={8} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <AuthAlert variant="error">{error}</AuthAlert>}
        <AuthButton loading={loading}>Sign in</AuthButton>
      </form>

      <AuthDivider />
      <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
        No account?{" "}
        <Link href="/signup" className="font-semibold text-indigo-500 hover:text-indigo-400 transition">Create one free</Link>
      </p>
      <p className="mt-2 text-center text-xs" style={{ color: "var(--text-muted)" }}>
        <Link href="/admin/login" className="hover:underline transition" style={{ color: "var(--text-muted)" }}>Admin login →</Link>
      </p>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return <Suspense><LoginFormInner /></Suspense>;
}
