"use client";

import { useState } from "react";
import { sendNewsletter } from "@/app/admin/(dashboard)/newsletter/actions";

export function NewsletterForm({ subscriberCount }: { subscriberCount: number }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error" | "idle"; message: string }>({ type: "idle", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subscriberCount === 0) {
      setStatus({ type: "error", message: "You cannot send a newsletter because there are 0 active subscribers." });
      return;
    }
    
    if (!confirm(`Are you sure you want to send this email to ${subscriberCount} subscribers?`)) return;

    setLoading(true);
    setStatus({ type: "idle", message: "" });

    const res = await sendNewsletter(subject, body);
    
    setLoading(false);
    if (res.error) {
      setStatus({ type: "error", message: res.error });
    } else {
      setStatus({ type: "success", message: `Newsletter successfully dispatched to ${res.count} recipient(s)!` });
      setSubject("");
      setBody("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status.type !== "idle" && (
        <div className={`rounded-xl p-4 text-sm font-medium ${status.type === "error" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
          {status.message}
        </div>
      )}

      <div className="flex items-center gap-3 rounded-lg border px-4 py-3 bg-rose-500/5 text-sm font-medium text-rose-500" style={{ borderColor: "var(--sidebar-border)" }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Ready to send to {subscriberCount} active subscribers
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold transition-colors" style={{ color: "var(--text-primary)" }}>
          Subject Line
        </label>
        <input
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Announcing new features for M-Docs!"
          className="w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          style={{ borderColor: "var(--sidebar-border)", background: "var(--page-bg)", color: "var(--text-primary)" }}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold transition-colors" style={{ color: "var(--text-primary)" }}>
          Message Body
        </label>
        <textarea
          required
          rows={10}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your email here... (Supports basic line breaks)"
          className="w-full resize-y rounded-xl border px-4 py-3 text-sm transition-colors focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          style={{ borderColor: "var(--sidebar-border)", background: "var(--page-bg)", color: "var(--text-primary)" }}
        />
      </div>

      <div className="pt-4 border-t transition-colors" style={{ borderColor: "var(--card-border)" }}>
        <button
          type="submit"
          disabled={loading || subscriberCount === 0}
          className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          {loading ? "Dispatching..." : "Send Newsletter"}
        </button>
      </div>
    </form>
  );
}
