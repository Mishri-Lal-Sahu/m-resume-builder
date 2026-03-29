import { getAuthSession } from "@/lib/server/auth";
import { AdminSettingsForm } from "@/components/admin/settings-form";

export const metadata = { title: "Admin Settings | M-Docs" };

export default async function AdminSettingsPage() {
  const session = await getAuthSession();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl transition-colors" style={{ color: "var(--text-primary)" }}>
          Profile Settings
        </h1>
        <p className="mt-1 text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
          Manage your administrator account details and security.
        </p>
      </div>

      <div className="rounded-2xl border p-6 transition-colors shadow-sm" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
        <AdminSettingsForm initialName={session?.user.name ?? ""} email={session?.user.email ?? ""} />
      </div>
    </div>
  );
}
