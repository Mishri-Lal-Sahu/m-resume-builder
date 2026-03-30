import { getAdminSession } from "@/lib/server/admin-auth";
import { getAdminSettings } from "@/lib/server/settings";
import { AdminSettingsTabs } from "@/components/admin/settings-tabs";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Settings | M-Docs" };

export default async function AdminSettingsPage() {
  const [admin, platformSettings] = await Promise.all([
    getAdminSession(),
    getAdminSettings(),
  ]);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl transition-colors" style={{ color: "var(--text-primary)" }}>
          Admin Settings
        </h1>
        <p className="mt-1 text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
          Manage your profile, security, and global platform configuration.
        </p>
      </div>

      <AdminSettingsTabs
        initialName={admin?.name ?? ""}
        email={admin?.email ?? ""}
        platformSettings={platformSettings}
      />
    </div>
  );
}

