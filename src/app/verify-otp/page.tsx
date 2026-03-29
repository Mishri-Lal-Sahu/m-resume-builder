"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AuthLayout, AuthHeading, AuthSubtext, AuthInput,
  AuthLabel, AuthButton, AuthAlert, AuthDivider,
} from "@/components/auth/auth-layout";

function VerifyOtpInner() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const email       = searchParams.get("email") ?? "";

  const [otp, setOtp]         = useState("");
  const [status, setStatus]   = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [resendCd, setResendCd] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!email) router.replace("/signup"); }, [email, router]);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    if (resendCd <= 0) return;
    const t = setTimeout(() => setResendCd((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCd]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (otp.length !== 6 || status === "loading") return;
    setStatus("loading"); setMessage(null);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = (await res.json()) as { message?: string };
      if (res.ok) {
        setStatus("success"); setMessage("Email verified! Redirecting to login…");
        setTimeout(() => router.replace("/login?verified=1"), 1800);
      } else {
        setStatus("error"); setMessage(data.message ?? "Invalid or expired OTP. Try again.");
        setOtp(""); inputRef.current?.focus();
      }
    } catch { setStatus("error"); setMessage("Network error. Please try again."); }
  }

  async function resend() {
    if (resendCd > 0 || !email) return;
    setMessage(null); setResendCd(60);
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { message?: string };
      setMessage(data.message ?? (res.ok ? "New OTP sent to your email." : "Failed to resend."));
    } catch { setMessage("Network error."); setResendCd(0); }
  }

  if (!email) return null;

  return (
    <AuthLayout>
      <AuthHeading>Verify your email</AuthHeading>
      <AuthSubtext>We sent a 6-digit code to</AuthSubtext>
      <p className="mt-0.5 text-sm font-semibold text-indigo-500 break-all">{email}</p>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <div className="space-y-1">
          <AuthLabel htmlFor="otp">6-digit code</AuthLabel>
          <AuthInput
            ref={inputRef}
            id="otp"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            required
            minLength={6}
            maxLength={6}
            placeholder="••••••"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            disabled={status === "loading" || status === "success"}
            className="text-center text-2xl font-bold tracking-[0.4em]"
          />
        </div>

        {message && <AuthAlert variant={status === "success" ? "success" : "error"}>{message}</AuthAlert>}

        <AuthButton loading={status === "loading"} disabled={otp.length !== 6 || status === "success"}>
          {status === "success" ? "Verified ✓" : "Verify Email"}
        </AuthButton>

        <div className="text-center">
          <button type="button" onClick={resend} disabled={resendCd > 0 || status === "success"}
            className="text-sm transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-40"
            style={{ color: "var(--text-muted)" }}>
            {resendCd > 0 ? `Resend in ${resendCd}s` : "Didn't receive a code? Resend"}
          </button>
        </div>
      </form>

      <AuthDivider />
      <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
        Wrong account?{" "}
        <Link href="/signup" className="text-indigo-500 hover:text-indigo-400 transition">Sign up again</Link>
        {" · "}
        <Link href="/login" className="text-indigo-500 hover:text-indigo-400 transition">Login</Link>
      </p>
    </AuthLayout>
  );
}

export default function VerifyOtpPage() {
  return <Suspense><VerifyOtpInner /></Suspense>;
}
