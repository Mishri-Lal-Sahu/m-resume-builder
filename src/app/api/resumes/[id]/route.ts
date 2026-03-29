import { NextResponse } from "next/server";
import { normalizeResumeDocument } from "@/features/resumes/types";
import { resumePatchSchema } from "@/features/resumes/validation";
import { getAuthSession } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function findOwnedResume(id: string, userId: string) {
  return db.resume.findFirst({ where: { id, userId } });
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const resume = await findOwnedResume(id, session.user.id);

  if (!resume) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      resume: {
        id: resume.id,
        title: resume.title,
        templateKey: resume.templateKey,
        profilePhotoUrl: resume.profilePhotoUrl,
        content: normalizeResumeDocument(resume.content),
        updatedAt: resume.updatedAt,
        visibility: resume.visibility,
        slug: resume.slug,
      },
    },
    { status: 200 },
  );
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await findOwnedResume(id, session.user.id);

  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const result = resumePatchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { title, templateKey, content, rawContent, visibility, slug } = result.data;

  if (slug) {
    const existingSlugResume = await db.resume.findFirst({
      where: { slug, id: { not: id } },
    });
    if (existingSlugResume) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
    }
  }

  const updated = await db.resume.update({
    where: { id: id },
    data: {
      title: title ?? undefined,
      templateKey: templateKey ?? undefined,
      content: content ? (content as unknown as Prisma.InputJsonValue) : undefined,
      rawContent: rawContent !== undefined ? (rawContent as Prisma.InputJsonValue) : undefined,
      visibility: visibility ?? undefined,
      slug: slug ?? undefined,
    },
  });

  return NextResponse.json({ resume: updated }, { status: 200 });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await findOwnedResume(id, session.user.id);

  if (!existing) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await db.resume.delete({
    where: { id },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
