"use client";

import Link from "next/link";
import { FormEvent, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AuthLayout, AuthHeading, AuthSubtext, AuthInput,
  AuthLabel, AuthButton, AuthAlert, AuthDivider,
} from "@/components/auth/auth-layout";

function ResetPasswordInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email  = searchParams.get("email") ?? "";
  const token  = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [status,   setStatus]   = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message,  setMessage]  = useState<string | null>(null);

  const isInvalidLink = !email || !token;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirm) { setStatus("error"); setMessage("Passwords do not match."); return; }
    setStatus("loading"); setMessage(null);
    try {
      const res = await fetch("/api/auth/password-reset/confirm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = (await res.json()) as { message?: string };
      if (res.ok) {
        setStatus("success"); setMessage("Password updated! Redirecting to login…");
        setTimeout(() => router.replace("/login?reset=1"), 2000);
      } else { setStatus("error"); setMessage(data.message ?? "Reset failed. The link may have expired."); }
    } catch { setStatus("error"); setMessage("Network error. Please try again."); }
  }

  return (
    <AuthLayout>
      {isInvalidLink ? (
        <>
          <AuthHeading>Invalid reset link</AuthHeading>
          <div className="mt-4">
            <AuthAlert variant="error">
              This link is invalid or has expired.{" "}
              <Link href="/forgot-password" className="font-semibold underline">Request a new one</Link>
            </AuthAlert>
          </div>
        </>
      ) : (
        <>
          <AuthHeading>Set new password</AuthHeading>
          <AuthSubtext>Resetting password for <span className="font-medium text-indigo-500">{email}</span></AuthSubtext>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div className="space-y-1">
              <AuthLabel htmlFor="password">New password</AuthLabel>
              <AuthInput id="password" type="password" required minLength={8} placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} disabled={status === "success"} />
            </div>
            <div className="space-y-1">
              <AuthLabel htmlFor="confirm">Confirm password</AuthLabel>
              <AuthInput id="confirm" type="password" required minLength={8} placeholder="Repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={status === "success"} />
            </div>
            {message && <AuthAlert variant={status === "success" ? "success" : "error"}>{message}</AuthAlert>}
            <AuthButton loading={status === "loading"} disabled={status === "success"}>
              {status === "success" ? "Updated ✓" : "Update Password"}
            </AuthButton>
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

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordInner /></Suspense>;
}
