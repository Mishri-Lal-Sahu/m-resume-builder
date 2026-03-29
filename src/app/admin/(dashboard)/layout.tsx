import { redirect } from "next/navigation";
import { UserMenu } from "@/components/ui/user-menu";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { getAuthSession } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard"); // Non-admins are redirected back to the user dashboard
  }

  const name = session.user.name ?? session.user.email ?? "Admin";
  const firstName = name.split(" ")[0];

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ background: "var(--page-bg)" }}>
      <div className="flex min-h-screen">
        {/* Shared layout sidebar for all admin pages */}
        <AdminSidebar name={name} email={session.user.email ?? ""} />

        {/* Main Workspace */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Top Bar Navigation Additions */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b px-5 backdrop-blur-md md:px-8 transition-colors" style={{ background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}>
            
            <div className="flex items-center gap-2 md:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-600 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span className="text-sm font-bold transition-colors" style={{ color: "var(--text-primary)" }}>Admin</span>
            </div>
            
            <p className="hidden text-sm transition-colors md:block" style={{ color: "var(--text-secondary)" }}>
              Admin Panel <span className="mx-2 text-zinc-300 dark:text-zinc-700">|</span> <span className="font-semibold transition-colors" style={{ color: "var(--text-primary)" }}>{firstName}</span> 👋
            </p>
            
            <UserMenu />
          </header>

          {/* Children Viewport */}
          <div className="flex-1 overflow-y-auto px-5 py-8 md:px-8 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
