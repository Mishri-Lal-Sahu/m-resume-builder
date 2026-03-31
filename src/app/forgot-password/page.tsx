"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthLayout, AuthHeading, AuthSubtext, AuthInput,
  AuthLabel, AuthButton, AuthAlert, AuthDivider,
} from "@/components/auth/auth-layout";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail]   = useState("");
  const [otp, setOtp]       = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [status, setStatus] = useState<"idle" | "loading" | "otp_sent" | "verifying" | "success">("idle");
  const [error,  setError]  = useState<string | null>(null);

  async function requestOtp(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setError(null); setStatus("loading");
    try {
      const res = await fetch("/api/auth/password-reset/request", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      // Show rate limit errors or success
      if (res.status === 429) {
        setError(data.message || "Too many requests. Try again later.");
        setStatus("idle");
      } else {
        setStatus("otp_sent"); // Hide user enumeration on 200
      }
    } catch { 
      setError("Network error. Please try again."); 
      setStatus("idle"); 
    }
  }

  async function verifyAndReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (otp.length !== 6) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    setError(null); setStatus("verifying");
    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await res.json().catch(() => ({}));
      
      if (res.ok) {
        setStatus("success");
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
        setStatus("otp_sent");
      }
    } catch { 
      setError("Network error. Please check your connection."); 
      setStatus("otp_sent"); 
    }
  }

  return (
    <AuthLayout>
      {status === "success" ? (
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Password Updated!</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            Your password has been successfully reset.
          </p>
          <AuthButton onClick={() => router.push("/login")}>Proceed to Login</AuthButton>
        </div>
      ) : status === "otp_sent" || status === "verifying" ? (
        <div className="space-y-6">
          <div>
            <AuthHeading>Reset Password</AuthHeading>
            <AuthSubtext>Enter the 6-digit OTP sent to <strong className="text-indigo-500">{email}</strong></AuthSubtext>
          </div>
          <form onSubmit={verifyAndReset} className="space-y-4">
            <div className="space-y-1">
              <AuthLabel htmlFor="otp">6-Digit Code</AuthLabel>
              <AuthInput
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                className="text-center text-2xl font-bold tracking-[0.4em]"
                disabled={status === "verifying"}
              />
            </div>
            <div className="space-y-1">
              <AuthLabel htmlFor="password">New Password</AuthLabel>
              <AuthInput
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                disabled={status === "verifying"}
              />
            </div>
            <div className="space-y-1">
              <AuthLabel htmlFor="confirmPassword">Confirm Password</AuthLabel>
              <AuthInput
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                disabled={status === "verifying"}
              />
            </div>
            
            {error && <AuthAlert variant="error">{error}</AuthAlert>}
            
            <AuthButton loading={status === "verifying"}>Update Password</AuthButton>
            
             <p className="mt-4 text-center text-xs text-zinc-500">
                Didn't receive the code?{" "}
                <button type="button" onClick={() => setStatus("idle")} className="text-indigo-500 hover:text-indigo-400 transition" disabled={status === "verifying"}>
                   Request another OTP
                </button>
             </p>
          </form>
        </div>
      ) : (
        <>
          <AuthHeading>Forgot password?</AuthHeading>
          <AuthSubtext>We'll email you a secure resetting code.</AuthSubtext>
          <form onSubmit={requestOtp} className="mt-5 space-y-4">
            <div className="space-y-1">
              <AuthLabel htmlFor="email">Your email</AuthLabel>
              <AuthInput id="email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={status === "loading"} />
            </div>
            {error && <AuthAlert variant="error">{error}</AuthAlert>}
            <AuthButton loading={status === "loading"}>Send Reset Code</AuthButton>
          </form>
        </>
      )}

      {status !== "success" && (
        <>
          <AuthDivider />
          <p className="text-center text-xs text-zinc-500">
            <Link href="/login" className="text-indigo-500 hover:text-indigo-400 transition">← Back to login</Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
