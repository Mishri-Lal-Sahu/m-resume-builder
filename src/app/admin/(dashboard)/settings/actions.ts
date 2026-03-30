"use server";

import { db } from "@/lib/server/db";
import { getAdminSession } from "@/lib/server/admin-auth";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateAdminProfile(name: string, password?: string) {
  const admin = await getAdminSession();
  if (!admin) {
    return { error: "Unauthorized" };
  }

  const data: { name?: string; passwordHash?: string } = {};

  if (name.trim()) {
    data.name = name.trim();
  }

  if (password) {
    if (password.length < 8) {
      return { error: "Password must be at least 8 characters long." };
    }
    data.passwordHash = await hash(password, 12);
  }

  try {
    await db.admin.update({
      where: { id: admin.id },
      data,
    });
    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Admin profile update failed:", error);
    return { error: "An error occurred while updating the profile." };
  }
}

