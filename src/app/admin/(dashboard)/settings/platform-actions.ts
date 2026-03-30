"use server";

import { getAdminSession } from "@/lib/server/admin-auth";
import { getAdminSettings, saveAdminSettings, type PlatformSettings } from "@/lib/server/settings";
import { revalidatePath } from "next/cache";

export async function fetchPlatformSettings(): Promise<PlatformSettings | { error: string }> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Unauthorized" };
  return getAdminSettings();
}

export async function updatePlatformSettings(
  data: PlatformSettings
): Promise<{ success: boolean } | { error: string }> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Unauthorized" };

  // Validate limits
  if (data.maxDocsPerUser < 1 || data.maxDocsPerUser > 10000) {
    return { error: "Max docs per user must be between 1 and 10,000." };
  }
  if (data.maxPagesPerDoc < 1 || data.maxPagesPerDoc > 10000) {
    return { error: "Max pages per doc must be between 1 and 10,000." };
  }
  if (data.maxCollaboratorsPerDoc < 1 || data.maxCollaboratorsPerDoc > 1000) {
    return { error: "Max collaborators per doc must be between 1 and 1,000." };
  }

  try {
    await saveAdminSettings(data);
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err) {
    console.error("[platform settings save]", err);
    return { error: "Failed to save settings." };
  }
}
