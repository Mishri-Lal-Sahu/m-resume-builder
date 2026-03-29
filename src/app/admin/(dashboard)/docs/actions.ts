"use server";

import { db } from "@/lib/server/db";
import { getAuthSession } from "@/lib/server/auth";
import { revalidatePath } from "next/cache";

export async function deleteDocumentAsAdmin(docId: string) {
  const session = await getAuthSession();
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await db.resume.delete({
      where: { id: docId },
    });
    
    revalidatePath("/admin/docs");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete document:", error);
    return { error: "Failed to delete document. It may have already been removed." };
  }
}
