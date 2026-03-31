"use client";

import { useEffect, useMemo, useState } from "react";

type ShareVisibility = "PRIVATE" | "PUBLIC";

type Invitation = {
  id: string;
  email: string;
  status: "PENDING" | "ACCEPTED";
  createdAt: string;
  acceptedAt: string | null;
  invitedUser: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

type ShareResponse = {
  share: {
    visibility: ShareVisibility;
    passwordEnabled: boolean;
    shareUrl: string;
    maxCollaborators: number;
    usedSlots: number;
    invitations: Invitation[];
  };
};

export function DocsSharePanel({ resumeId }: { resumeId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState("");
  const [visibility, setVisibility] = useState<ShareVisibility>("PRIVATE");
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [maxCollaborators, setMaxCollaborators] = useState(5);
  const [usedSlots, setUsedSlots] = useState(1);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/docs/${resumeId}/share`, { cache: "no-store" });
      const data = (await res.json()) as ShareResponse & { error?: string };
      if (!res.ok) {
        setError(data.error || "Unable to load share settings.");
        return;
      }
      setVisibility(data.share.visibility);
      setPasswordEnabled(data.share.passwordEnabled);
      setShareUrl(`${window.location.origin}${data.share.shareUrl}`);
      setMaxCollaborators(data.share.maxCollaborators);
      setUsedSlots(data.share.usedSlots);
      setInvitations(data.share.invitations);
    } catch {
      setError("Unable to load share settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, resumeId]);

  const activeInvites = useMemo(
    () => invitations.filter((i) => i.status === "PENDING" || i.status === "ACCEPTED"),
    [invitations],
  );

  const saveShare = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/docs/${resumeId}/share`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visibility,
          passwordEnabled,
          password: password || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Unable to save share settings.");
        return;
      }
      setPassword("");
      setMessage("Share settings updated.");
      await load();
    } catch {
      setError("Unable to save share settings.");
    } finally {
      setSaving(false);
    }
  };

  const sendInvitation = async () => {
    if (!email.trim()) return;
    setInviting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/docs/${resumeId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || data.message || "Unable to send invitation.");
        return;
      }
      setEmail("");
      setMessage("Invitation sent successfully.");
      await load();
    } catch {
      setError("Unable to send invitation.");
    } finally {
      setInviting(false);
    }
  };

  const deactivateInvitation = async (invitation: Invitation) => {
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/docs/${resumeId}/invitations/${invitation.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Unable to update invitation.");
        return;
      }
      setMessage(invitation.status === "PENDING" ? "Invitation withdrawn." : "Access removed.");
      await load();
    } catch {
      setError("Unable to update invitation.");
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setMessage("Share URL copied.");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
      >
        Share
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[120]" onClick={() => setOpen(false)} />
          <section className="absolute right-0 z-[130] mt-2 w-[460px] max-w-[calc(100vw-2rem)] rounded-xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Share document</h3>
              <button onClick={() => setOpen(false)} className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100">Close</button>
            </div>

            {loading ? (
              <p className="text-sm text-zinc-500">Loading...</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setVisibility("PRIVATE")}
                    className={`rounded-md border px-3 py-2 text-sm ${visibility === "PRIVATE" ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-zinc-200 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"}`}
                  >
                    Private
                  </button>
                  <button
                    onClick={() => setVisibility("PUBLIC")}
                    className={`rounded-md border px-3 py-2 text-sm ${visibility === "PUBLIC" ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-zinc-200 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"}`}
                  >
                    Public
                  </button>
                </div>

                <div className="space-y-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                  <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={passwordEnabled}
                      onChange={(e) => setPasswordEnabled(e.target.checked)}
                    />
                    Password protect document
                  </label>
                  {passwordEnabled && (
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Set or rotate password (min 6 chars)"
                      className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                  )}
                  <button
                    onClick={saveShare}
                    disabled={saving}
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save settings"}
                  </button>
                </div>

                <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Share URL</p>
                  <p className="mt-1 truncate font-mono text-xs text-zinc-700 dark:text-zinc-300">{shareUrl}</p>
                  <button
                    onClick={copyUrl}
                    className="mt-2 rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  >
                    Copy link
                  </button>
                </div>

                <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Collaboration limit</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">{usedSlots}/{maxCollaborators} used</p>
                  </div>
                  <p className="mb-2 text-xs text-zinc-500">Includes owner + pending invitations + users with access.</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@company.com"
                      className="flex-1 rounded-md border border-zinc-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                    <button
                      onClick={sendInvitation}
                      disabled={inviting || usedSlots >= maxCollaborators}
                      className="rounded-md bg-zinc-900 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                    >
                      {inviting ? "Sending..." : "Invite"}
                    </button>
                  </div>
                </div>

                <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Current access + invitations</p>
                  {activeInvites.length === 0 ? (
                    <p className="text-xs text-zinc-500">No invitations yet.</p>
                  ) : (
                    activeInvites.map((invite) => (
                      <div key={invite.id} className="flex items-center justify-between rounded-md border border-zinc-200 px-2.5 py-2 dark:border-zinc-800">
                        <div>
                          <p className="text-xs font-medium text-zinc-800 dark:text-zinc-100">{invite.email}</p>
                          <p className="text-[11px] text-zinc-500">{invite.status === "PENDING" ? "Pending invitation" : "Access granted"}</p>
                        </div>
                        <button
                          onClick={() => deactivateInvitation(invite)}
                          className="rounded-md border border-red-300 px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
                        >
                          {invite.status === "PENDING" ? "Withdraw" : "Remove"}
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {message && <p className="text-xs text-emerald-600">{message}</p>}
                {error && <p className="text-xs text-red-600">{error}</p>}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
