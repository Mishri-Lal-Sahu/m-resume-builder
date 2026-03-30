"use client";

import { useState } from "react";
import { AdminSettingsForm } from "./settings-form";
import { PlatformSettingsForm } from "./platform-settings-form";
import type { PlatformSettings } from "@/lib/server/settings";

type Props = {
  initialName: string;
  email: string;
  platformSettings: PlatformSettings;
};

const TABS = [
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
      </svg>
    ),
  },
  {
    id: "platform",
    label: "Platform",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminSettingsTabs({ initialName, email, platformSettings }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border p-1 transition-colors" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-gradient-to-r from-rose-600 to-orange-600 text-white shadow-md shadow-rose-500/20"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
              }`}
              style={isActive ? {} : { color: "var(--text-secondary)" }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      {activeTab === "profile" && (
        <div className="rounded-2xl border p-6 transition-colors shadow-sm" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
          <div className="mb-5 pb-5 border-b transition-colors" style={{ borderColor: "var(--card-border)" }}>
            <p className="font-bold transition-colors" style={{ color: "var(--text-primary)" }}>Admin Profile</p>
            <p className="text-xs mt-0.5 transition-colors" style={{ color: "var(--text-muted)" }}>Manage your admin account name and password.</p>
          </div>
          <AdminSettingsForm initialName={initialName} email={email} />
        </div>
      )}

      {activeTab === "platform" && (
        <PlatformSettingsForm initial={platformSettings} />
      )}
    </div>
  );
}
