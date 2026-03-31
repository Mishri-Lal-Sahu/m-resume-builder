import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";
import { getAuthSession } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { getActiveCollaboratorSlotUsage, getDocInvitationModel, getMaxCollaboratorsPerDoc } from "@/lib/server/collaboration/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateShareSchema = z.object({
  visibility: z.enum(["PRIVATE", "PUBLIC"]).optional(),
  passwordEnabled: z.boolean().optional(),
  password: z.string().min(6).max(64).optional(),
});

async function findOwnedResume(id: string, userId: string) {
  return db.resume.findFirst({
    where: { id, userId },
    select: {
      id: true,
      title: true,
      visibility: true,
      passwordHash: true,
      userId: true,
    },
  });
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

  const docInvitation = getDocInvitationModel();
  if (!docInvitation) {
    return NextResponse.json(
      { error: "Collaboration tables are unavailable. Run prisma generate/db push and restart the server." },
      { status: 503 },
    );
  }

  const [maxCollaborators, usedSlots, invitations] = await Promise.all([
    getMaxCollaboratorsPerDoc(),
    getActiveCollaboratorSlotUsage(id),
    docInvitation.findMany({
      where: {
        resumeId: id,
        status: { in: ["PENDING", "ACCEPTED"] },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
        acceptedAt: true,
        invitedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    share: {
      visibility: resume.visibility === "PRIVATE" ? "PRIVATE" : "PUBLIC",
      passwordEnabled: Boolean(resume.passwordHash),
      shareUrl: `/d/${resume.id}`,
      maxCollaborators,
      usedSlots,
      invitations,
    },
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const resume = await findOwnedResume(id, session.user.id);
  if (!resume) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const payload = await request.json();
  const parsed = updateShareSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const data = parsed.data;
  if (data.passwordEnabled && !data.password && !resume.passwordHash) {
    return NextResponse.json({ error: "Password is required to enable protection." }, { status: 400 });
  }

  const passwordHash = data.passwordEnabled
    ? (data.password ? await hash(data.password, 12) : resume.passwordHash)
    : data.passwordEnabled === false
      ? null
      : undefined;

  const updated = await db.resume.update({
    where: { id },
    data: {
      visibility: data.visibility ? (data.visibility === "PUBLIC" ? "PUBLIC" : "PRIVATE") : undefined,
      passwordHash,
    },
    select: {
      id: true,
      visibility: true,
      passwordHash: true,
    },
  });

  return NextResponse.json({
    share: {
      visibility: updated.visibility === "PRIVATE" ? "PRIVATE" : "PUBLIC",
      passwordEnabled: Boolean(updated.passwordHash),
      shareUrl: `/d/${updated.id}`,
    },
  });
}
