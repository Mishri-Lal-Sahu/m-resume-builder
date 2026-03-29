"use client";

import { useState } from "react";
import { updateAdminProfile } from "@/app/admin/(dashboard)/settings/actions";

export function AdminSettingsForm({ initialName, email }: { initialName: string; email: string }) {
  const [name, setName] = useState(initialName);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error" | "idle"; message: string }>({ type: "idle", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "idle", message: "" });

    const res = await updateAdminProfile(name, password || undefined);
    
    setLoading(false);
    if (res.error) {
      setStatus({ type: "error", message: res.error });
    } else {
      setStatus({ type: "success", message: "Profile updated successfully. Changes may take a reload to appear in the sidebar." });
      setPassword(""); // Clear password field on success
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {status.type !== "idle" && (
        <div className={`rounded-xl p-4 text-sm font-medium ${status.type === "error" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
          {status.message}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-semibold transition-colors" style={{ color: "var(--text-primary)" }}>
          Email Address
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full rounded-xl border px-4 py-2.5 text-sm transition-colors opacity-70 cursor-not-allowed"
          style={{ borderColor: "var(--sidebar-border)", background: "var(--page-bg)", color: "var(--text-secondary)" }}
        />
        <p className="mt-1 text-xs transition-colors" style={{ color: "var(--text-muted)" }}>Email addresses cannot be changed.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold transition-colors" style={{ color: "var(--text-primary)" }}>
          Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          style={{ borderColor: "var(--sidebar-border)", background: "var(--page-bg)", color: "var(--text-primary)" }}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold transition-colors" style={{ color: "var(--text-primary)" }}>
          New Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Leave blank to keep current password"
          className="w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          style={{ borderColor: "var(--sidebar-border)", background: "var(--page-bg)", color: "var(--text-primary)" }}
        />
      </div>

      <div className="pt-4 border-t transition-colors" style={{ borderColor: "var(--card-border)" }}>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
