"use client";

import { useState } from "react";

type UserInfo = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN" | string;
  country: string | null;
  createdAt: Date;
  _count: { resumes: number };
};

export function UsersTable({ initialUsers }: { initialUsers: UserInfo[] }) {
  const [search, setSearch] = useState("");

  const filtered = initialUsers.filter((u) => {
    return (
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-xl border px-4 py-2 text-sm transition-colors focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          style={{ borderColor: "var(--sidebar-border)", background: "var(--page-bg)", color: "var(--text-primary)" }}
        />
        <div className="text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
          Showing {filtered.length} user{filtered.length !== 1 && "s"}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border transition-colors shadow-sm" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b transition-colors bg-zinc-50 dark:bg-zinc-900/50" style={{ borderColor: "var(--card-border)" }}>
              <tr>
                <th className="px-5 py-3 font-semibold transition-colors" style={{ color: "var(--text-secondary)" }}>Account</th>
                <th className="px-5 py-3 font-semibold transition-colors" style={{ color: "var(--text-secondary)" }}>Role</th>
                <th className="px-5 py-3 font-semibold transition-colors" style={{ color: "var(--text-secondary)" }}>Documents</th>
                <th className="px-5 py-3 font-semibold transition-colors" style={{ color: "var(--text-secondary)" }}>Country</th>
                <th className="px-5 py-3 font-semibold transition-colors" style={{ color: "var(--text-secondary)" }}>Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 transition-colors">
              {filtered?.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 font-bold">
                        {(u.name?.[0] || u.email[0]).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold transition-colors" style={{ color: "var(--text-primary)" }}>{u.name || "Setup Pending"}</p>
                        <p className="text-xs transition-colors" style={{ color: "var(--text-muted)" }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        u.role === "ADMIN"
                          ? "bg-rose-500/15 text-rose-500 border-rose-500/30"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 transition-colors" style={{ color: "var(--text-primary)" }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      {u._count.resumes}
                    </div>
                  </td>
                  <td className="px-5 py-3 transition-colors" style={{ color: "var(--text-muted)" }}>
                    {u.country || "Unknown"}
                  </td>
                  <td className="px-5 py-3 transition-colors" style={{ color: "var(--text-muted)" }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
