import { redirect } from "next/navigation";
import Link from "next/link";
import { UserMenu } from "@/components/ui/user-menu";
import { SidebarLogout } from "@/components/ui/sidebar-logout";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getAuthSession } from "@/lib/server/auth";
import { getDocInvitationModel } from "@/lib/server/collaboration/helpers";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

export default async function CollaborationsPage() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login?callbackUrl=/dashboard/collaborations");
  }

  let collaboratedDocs: Array<{
    id: string;
    title: string;
    visibility: "PRIVATE" | "LINK_ONLY" | "PUBLIC";
    updatedAt: Date;
    ownerName: string | null;
    ownerEmail: string | null;
  }> = [];

  try {
    const docInvitation = getDocInvitationModel();
    if (docInvitation) {
      const acceptedInvites = (await docInvitation.findMany({
        where: {
          status: "ACCEPTED",
          invitedUserId: session.user.id,
        },
        orderBy: { updatedAt: "desc" },
        select: {
          resume: {
            select: {
              id: true,
              title: true,
              visibility: true,
              updatedAt: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      })) as Array<{
        resume: {
          id: string;
          title: string;
          visibility: "PRIVATE" | "LINK_ONLY" | "PUBLIC";
          updatedAt: Date;
          user: { name: string | null; email: string | null } | null;
        };
      }>;

      collaboratedDocs = acceptedInvites.map((item) => ({
        id: item.resume.id,
        title: item.resume.title,
        visibility: item.resume.visibility,
        updatedAt: item.resume.updatedAt,
        ownerName: item.resume.user?.name ?? null,
        ownerEmail: item.resume.user?.email ?? null,
      }));
    }
  } catch {
    collaboratedDocs = [];
  }

  const firstName = session.user.name?.split(" ")[0] ?? session.user.email?.split("@")[0] ?? "there";

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ background: "var(--page-bg)" }}>
      <div className="flex min-h-screen">

        <aside className="hidden md:flex w-60 flex-col border-r backdrop-blur-md transition-colors" style={{ background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}>
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

          <nav className="flex flex-1 flex-col gap-1 p-3">
            <SidebarNavItem
              href="/dashboard"
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>}
              label="Documents"
            />
            <SidebarNavItem
              href="/dashboard/collaborations"
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>}
              label="Collaborated"
              active
            />
          </nav>

          <div className="border-t p-4 space-y-3 transition-colors" style={{ borderColor: "var(--sidebar-border)" }}>
            <div className="flex items-center justify-between px-1">
              <span className="text-xs transition-colors" style={{ color: "var(--text-muted)" }}>Theme</span>
              <ThemeToggle />
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white uppercase shrink-0">
                {firstName.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold transition-colors" style={{ color: "var(--text-primary)" }}>{session.user.name ?? session.user.email}</p>
                <p className="text-[10px] transition-colors" style={{ color: "var(--text-muted)" }}>Free plan</p>
              </div>
            </div>

            <SidebarLogout />
          </div>
        </aside>

        <main className="flex flex-1 flex-col overflow-auto">
          <header className="relative z-50 flex h-16 shrink-0 items-center justify-between border-b px-5 backdrop-blur-md md:px-8 transition-colors" style={{ background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}>
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
            <UserMenu />
          </header>

          <div className="flex-1 px-5 py-8 md:px-8 md:py-10">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl transition-colors" style={{ color: "var(--text-primary)" }}>Collaborated With Me</h2>
                <p className="mt-1 text-sm transition-colors" style={{ color: "var(--text-muted)" }}>Documents shared with you by other creators.</p>
              </div>

              {collaboratedDocs.length === 0 ? (
                <div className="rounded-2xl border border-dashed px-5 py-8 text-sm" style={{ borderColor: "var(--card-border)", color: "var(--text-muted)" }}>
                  No shared documents yet.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {collaboratedDocs.map((doc) => (
                    <div key={doc.id} className="group relative flex flex-col rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/20" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white shadow-lg">
                          {(doc.title.trim().slice(0, 2).toUpperCase() || "DC")}
                        </div>
                        <span className="rounded-full border border-blue-500/30 bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Shared</span>
                      </div>

                      <div className="mt-4 flex-1">
                        <h3 className="line-clamp-1 text-sm font-bold transition-colors" style={{ color: "var(--text-primary)" }}>{doc.title || "Untitled Document"}</h3>
                        <p className="mt-1 text-xs transition-colors" style={{ color: "var(--text-muted)" }}>
                          Owner: {doc.ownerName || doc.ownerEmail || "Unknown owner"}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs transition-colors" style={{ color: "var(--text-muted)" }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                          </svg>
                          {formatDistanceToNow(new Date(doc.updatedAt))} ago
                        </p>
                      </div>

                      <div className="mt-5 flex items-center gap-2">
                        <Link
                          href={`/docs/${doc.id}`}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 shadow-sm shadow-blue-500/20"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Open
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarNavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
      active ? "bg-indigo-600/10 text-indigo-600 dark:bg-indigo-600/20 dark:text-indigo-300" : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
    }`} style={active ? {} : { color: "var(--text-secondary)" }}>
      <span className={active ? "text-indigo-500 dark:text-indigo-400" : ""} style={active ? {} : { color: "var(--text-muted)" }}>{icon}</span>
      {label}
    </Link>
  );
}
