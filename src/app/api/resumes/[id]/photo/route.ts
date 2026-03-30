import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { saveProfilePhoto } from "@/lib/server/uploads/profile-photo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const resume = await db.resume.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });

  if (!resume) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("photo");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Photo file is required" }, { status: 400 });
  }

  try {
    const photoUrl = await saveProfilePhoto(file, resume.id);

    await db.resume.update({
      where: { id: resume.id },
      data: { profilePhotoUrl: photoUrl },
    });

    return NextResponse.json({ photoUrl }, { status: 200 });
  } catch (error) {
    console.error("[photo upload error]", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 400 });
  }
}
