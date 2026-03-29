import { db } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin Overview | M-Docs" };

export default async function AdminOverviewPage() {
  const [totalUsers, totalDocs, totalSubscribers, recentUsers] = await Promise.all([
    db.user.count(),
    db.resume.count(),
    db.newsletterSubscriber.count(),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
  ]);

  const stats = [
    { label: "Total Users", value: totalUsers, icon: UserIcon, color: "text-blue-500" },
    { label: "Total Documents", value: totalDocs, icon: FileIcon, color: "text-emerald-500" },
    { label: "Subscribers", value: totalSubscribers, icon: MailIcon, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl transition-colors" style={{ color: "var(--text-primary)" }}>
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
          High-level metrics and recent platform activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border p-5 shadow-sm transition-colors" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800/60 ${s.color}`}>
              <s.icon />
            </div>
            <div>
              <p className="text-sm font-medium transition-colors" style={{ color: "var(--text-muted)" }}>{s.label}</p>
              <p className="text-2xl font-bold transition-colors" style={{ color: "var(--text-primary)" }}>{s.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border shadow-sm transition-colors" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
        <div className="border-b px-5 py-4 transition-colors" style={{ borderColor: "var(--card-border)" }}>
          <h2 className="font-bold transition-colors" style={{ color: "var(--text-primary)" }}>Recent Users</h2>
        </div>
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800 transition-colors">
          {recentUsers.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs font-bold transition-colors" style={{ color: "var(--text-primary)" }}>
                  {(u.name?.[0] || u.email[0]).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold transition-colors" style={{ color: "var(--text-primary)" }}>{u.name || "Unknown"}</p>
                  <p className="text-xs transition-colors" style={{ color: "var(--text-muted)" }}>{u.email}</p>
                </div>
              </div>
              <span className="text-xs transition-colors" style={{ color: "var(--text-muted)" }}>
                {new Date(u.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
          {recentUsers.length === 0 && (
            <div className="p-8 text-center text-sm transition-colors" style={{ color: "var(--text-muted)" }}>No users found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  );
}
function FileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
  );
}
function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  );
}
