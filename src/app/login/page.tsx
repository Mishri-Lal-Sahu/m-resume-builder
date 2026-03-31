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
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const justVerified = searchParams.get("verified") === "1";
  const justReset = searchParams.get("reset") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (!result || result.error) {
      if (result?.error === "EmailNotVerified") {
        setError("EmailNotVerified");
      } else {
        setError("Invalid email / password. Please try again.");
      }
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <AuthLayout>
      {justVerified && <AuthAlert variant="success" >✓ Email verified! You can now sign in.</AuthAlert>}
      {justReset && <AuthAlert variant="info">✓ Password updated. Sign in with your new password.</AuthAlert>}
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

        {error === "EmailNotVerified" ? (
          <div className="rounded-md bg-yellow-50 flex flex-col items-start p-3 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/50">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">
              Your email is not verified yet.
            </p>
            <button
              type="button"
              onClick={() => router.push(`/verify-otp?email=${encodeURIComponent(email)}`)}
              className="text-sm font-bold text-yellow-900 hover:text-yellow-700 underline dark:text-yellow-400 dark:hover:text-yellow-200"
            >
              Proceed to verify email &rarr;
            </button>
          </div>
        ) : error ? (
          <AuthAlert variant="error">{error}</AuthAlert>
        ) : null}

        <AuthButton loading={loading}>Sign in</AuthButton>
      </form>

      <AuthDivider />
      <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
        No account?{" "}
        <Link href="/signup" className="font-semibold text-indigo-500 hover:text-indigo-400 transition">Create one free</Link>
      </p>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return <Suspense><LoginFormInner /></Suspense>;
}
