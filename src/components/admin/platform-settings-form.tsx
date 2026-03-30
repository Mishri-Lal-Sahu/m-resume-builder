"use client";

import { useState } from "react";
import { type PlatformSettings } from "@/lib/server/settings";
import { updatePlatformSettings } from "@/app/admin/(dashboard)/settings/platform-actions";

type Props = { initial: PlatformSettings };

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold transition-colors" style={{ color: "var(--text-primary)" }}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs transition-colors" style={{ color: "var(--text-muted)" }}>{hint}</p>}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
      style={{ borderColor: "var(--sidebar-border)", background: "var(--page-bg)", color: "var(--text-primary)" }}
    />
  );
}

function SectionTitle({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b transition-colors" style={{ borderColor: "var(--card-border)" }}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
        {icon}
      </div>
      <div>
        <p className="font-bold transition-colors" style={{ color: "var(--text-primary)" }}>{title}</p>
        <p className="text-xs transition-colors mt-0.5" style={{ color: "var(--text-muted)" }}>{description}</p>
      </div>
    </div>
  );
}

export function PlatformSettingsForm({ initial }: Props) {
  const [settings, setSettings] = useState<PlatformSettings>(initial);
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({ type: "idle", message: "" });
  const [loading, setLoading] = useState(false);

  function update<K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "idle", message: "" });

    const res = await updatePlatformSettings(settings);
    setLoading(false);

    if ("error" in res) {
      setStatus({ type: "error", message: res.error });
    } else {
      setStatus({ type: "success", message: "Platform settings saved successfully." });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {status.type !== "idle" && (
        <div className={`rounded-xl p-4 text-sm font-medium ${status.type === "error" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-600"}`}>
          {status.message}
        </div>
      )}

      {/* ── SMTP / Mail Config ─────────────────────────── */}
      <div className="rounded-2xl border p-6 space-y-5 transition-colors shadow-sm" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
        <SectionTitle
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          }
          title="Mail Configuration"
          description="SMTP settings for sending transactional emails (OTP, password resets). The password is stored encrypted."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="SMTP Host" hint="e.g. smtp.gmail.com or mail.yourdomain.com">
            <Input type="text" value={settings.smtpHost} onChange={(e) => update("smtpHost", e.target.value)} placeholder="smtp.gmail.com" />
          </FieldGroup>

          <FieldGroup label="SMTP Port" hint="Usually 587 (TLS) or 465 (SSL)">
            <Input type="number" value={settings.smtpPort} onChange={(e) => update("smtpPort", Number(e.target.value))} placeholder="587" min={1} max={65535} />
          </FieldGroup>

          <FieldGroup label="SMTP Username" hint="Usually your email address">
            <Input type="email" value={settings.smtpUser} onChange={(e) => update("smtpUser", e.target.value)} placeholder="you@example.com" />
          </FieldGroup>

          <FieldGroup label="SMTP Password" hint="Stored AES-256 encrypted in the database">
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                value={settings.smtpPass}
                onChange={(e) => update("smtpPass", e.target.value)}
                placeholder="Leave blank to keep existing"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </FieldGroup>

          <FieldGroup label="From Address" hint="The sender name/email shown to recipients">
            <Input type="text" value={settings.smtpFrom} onChange={(e) => update("smtpFrom", e.target.value)} placeholder="M-Docs <noreply@example.com>" />
          </FieldGroup>
        </div>
      </div>

      {/* ── User & Document Limits ────────────────────── */}
      <div className="rounded-2xl border p-6 space-y-5 transition-colors shadow-sm" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
        <SectionTitle
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }
          title="User Limits"
          description="Control how many documents each user can create."
        />
        <FieldGroup label="Max Documents per User" hint="How many total documents a single user account can create (0 = unlimited).">
          <Input type="number" value={settings.maxDocsPerUser} onChange={(e) => update("maxDocsPerUser", Number(e.target.value))} min={1} max={10000} />
        </FieldGroup>
      </div>

      {/* ── Document Limits ───────────────────────────── */}
      <div className="rounded-2xl border p-6 space-y-5 transition-colors shadow-sm" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
        <SectionTitle
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          }
          title="Document Limits"
          description="Set limits on the size and structure of individual documents."
        />
        <FieldGroup label="Max Pages per Document" hint="Maximum number of pages allowed per single document.">
          <Input type="number" value={settings.maxPagesPerDoc} onChange={(e) => update("maxPagesPerDoc", Number(e.target.value))} min={1} max={10000} />
        </FieldGroup>
      </div>

      {/* ── Collaboration Limits ──────────────────────── */}
      <div className="rounded-2xl border p-6 space-y-5 transition-colors shadow-sm" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
        <SectionTitle
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }
          title="Collaboration Limits"
          description="Control how many users can be joined/invited to a single shared document."
        />
        <FieldGroup label="Max Users Joined per Document" hint="Maximum number of collaborators (including owner) allowed per document.">
          <Input type="number" value={settings.maxCollaboratorsPerDoc} onChange={(e) => update("maxCollaboratorsPerDoc", Number(e.target.value))} min={1} max={1000} />
        </FieldGroup>
      </div>

      {/* ── Save ─────────────────────────────────────── */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:from-rose-500 hover:to-orange-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Saving…
            </>
          ) : (
            "Save Platform Settings"
          )}
        </button>
      </div>
    </form>
  );
}
