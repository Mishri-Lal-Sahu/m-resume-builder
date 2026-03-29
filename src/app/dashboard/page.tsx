import { redirect } from "next/navigation";
import { DocManager } from "@/components/dashboard/doc-manager";
import { UserMenu } from "@/components/ui/user-menu";
import { SidebarLogout } from "@/components/ui/sidebar-logout";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getAuthSession } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  let docs: Array<{
    id: string;
    title: string;
    visibility: "PRIVATE" | "LINK_ONLY" | "PUBLIC";
    updatedAt: Date;
  }> = [];

  try {
    docs = await db.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, visibility: true, updatedAt: true },
    });
  } catch {
    docs = [];
  }

  const firstName = session.user.name?.split(" ")[0] ?? session.user.email?.split("@")[0] ?? "there";

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ background: "var(--page-bg)" }}>
      <div className="flex min-h-screen">

        {/* ── Sidebar (md+) ── */}
        <aside className="hidden md:flex w-60 flex-col border-r backdrop-blur-md transition-colors" style={{ background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}>
          {/* Logo */}
          <div className="flex h-16 items-center gap-2.5 border-b px-5 transition-colors" style={{ borderColor: "var(--sidebar-border)" }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                <path d="M10 9H8"/>
                <path d="M16 13H8"/>
                <path d="M16 17H8"/>
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight transition-colors" style={{ color: "var(--text-primary)" }}>M-Docs</span>
          </div>

          {/* Nav */}
          <nav className="flex flex-1 flex-col gap-1 p-3">
            <SidebarNavItem
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>}
              label="Documents"
              active
            />
          </nav>

          {/* Bottom — user + controls */}
          <div className="border-t p-4 space-y-3 transition-colors" style={{ borderColor: "var(--sidebar-border)" }}>
            {/* Theme toggle row */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs transition-colors" style={{ color: "var(--text-muted)" }}>Theme</span>
              <ThemeToggle />
            </div>

            {/* User info */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white uppercase shrink-0">
                {firstName.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold transition-colors" style={{ color: "var(--text-primary)" }}>{session.user.name ?? session.user.email}</p>
                <p className="text-[10px] transition-colors" style={{ color: "var(--text-muted)" }}>Free plan</p>
              </div>
            </div>

            {/* Logout */}
            <SidebarLogout />
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex flex-1 flex-col overflow-auto">
          {/* Top bar */}
          <header className="flex h-16 items-center justify-between border-b px-5 backdrop-blur-md md:px-8 transition-colors" style={{ background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}>
            {/* Mobile logo */}
            <div className="flex items-center gap-2 md:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                  <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                </svg>
              </div>
              <span className="text-sm font-bold transition-colors" style={{ color: "var(--text-primary)" }}>M-Docs</span>
            </div>
            <p className="hidden text-sm transition-colors md:block" style={{ color: "var(--text-secondary)" }}>
              Welcome back, <span className="font-semibold transition-colors" style={{ color: "var(--text-primary)" }}>{firstName}</span> 👋
            </p>
            {/* User menu (theme toggle + profile dropdown + logout) */}
            <UserMenu />
          </header>

          {/* Page body */}
          <div className="flex-1 px-5 py-8 md:px-8 md:py-10">
            <DocManager initialResumes={docs} />
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarNavItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
      active ? "bg-indigo-600/10 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-300" : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
    }`} style={active ? {} : { color: "var(--text-secondary)" }}>
      <span className={active ? "text-indigo-500 dark:text-indigo-400" : ""} style={active ? {} : { color: "var(--text-muted)" }}>{icon}</span>
      {label}
    </div>
  );
}
