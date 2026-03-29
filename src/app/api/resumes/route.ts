import { NextResponse } from "next/server";

import { defaultResumeDocument } from "@/features/resumes/types";
import { limits } from "@/lib/config/app";
import { getAuthSession } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const resumes = await db.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      visibility: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ resumes }, { status: 200 });
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const currentCount = await db.resume.count({ where: { userId: session.user.id } });

  if (currentCount >= limits.maxDocsPerUser) {
    return NextResponse.json(
      { message: `Document limit reached (${limits.maxDocsPerUser})` },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { title?: string };
  const title = body.title?.trim() || `Document ${currentCount + 1}`;

  const resume = await db.resume.create({
    data: {
      userId: session.user.id,
      title,
      templateKey: "modern",
      content: defaultResumeDocument(),
    },
    select: { id: true, title: true, createdAt: true },
  });

  return NextResponse.json({ resume }, { status: 201 });
}
