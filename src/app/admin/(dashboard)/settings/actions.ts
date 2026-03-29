"use server";

import { db } from "@/lib/server/db";
import { getAuthSession } from "@/lib/server/auth";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateAdminProfile(name: string, password?: string) {
  const session = await getAuthSession();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  const data: any = {};
  
  if (name.trim()) {
    data.name = name.trim();
  }

  if (password) {
    if (password.length < 6) {
      return { error: "Password must be at least 6 characters long." };
    }
    data.passwordHash = await hash(password, 12);
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data,
    });
    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Profile update failed:", error);
    return { error: "An error occurred while updating the profile." };
  }
}
