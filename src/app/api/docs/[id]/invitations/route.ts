import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { generateToken } from "@/lib/server/tokens";
import { professionalInvitationEmail, sendMail } from "@/lib/server/mailer";
import { getActiveCollaboratorSlotUsage, getDocInvitationModel, getMaxCollaboratorsPerDoc } from "@/lib/server/collaboration/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const createInviteSchema = z.object({
  email: z.email().max(320),
});

async function findOwnedResume(id: string, userId: string) {
  return db.resume.findFirst({
    where: { id, userId },
    select: { id: true, title: true, userId: true },
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

  const invitations = await docInvitation.findMany({
    where: { resumeId: id, status: { in: ["PENDING", "ACCEPTED"] } },
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
  });

  return NextResponse.json({ invitations });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
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

  const payload = await request.json();
  const parsed = createInviteSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const inviteEmail = parsed.data.email.trim().toLowerCase();
  const ownerEmail = session.user.email?.trim().toLowerCase();
  if (ownerEmail && inviteEmail === ownerEmail) {
    return NextResponse.json({ error: "You already have access as the owner." }, { status: 400 });
  }

  const existing = await docInvitation.findFirst({
    where: {
      resumeId: id,
      email: inviteEmail,
      status: { in: ["PENDING", "ACCEPTED"] },
    },
    select: { id: true, status: true },
  });

  const existingInvite = existing as { id: string; status: "PENDING" | "ACCEPTED" } | null;
  if (existingInvite) {
    return NextResponse.json({ error: existingInvite.status === "PENDING" ? "Invitation already sent." : "User already has access." }, { status: 400 });
  }

  const [limit, currentUsage] = await Promise.all([
    getMaxCollaboratorsPerDoc(),
    getActiveCollaboratorSlotUsage(id),
  ]);

  if (currentUsage >= limit) {
    return NextResponse.json(
      {
        error: "Collaboration limit reached.",
        limitType: "collaborators",
        limit,
        current: currentUsage,
        message: `This document already uses ${currentUsage}/${limit} collaboration slots (owner + pending + accepted).`,
      },
      { status: 403 },
    );
  }

  const token = generateToken(24);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invitation = await docInvitation.create({
    data: {
      resumeId: id,
      email: inviteEmail,
      token,
      status: "PENDING",
      invitedById: session.user.id,
      expiresAt,
    },
    select: {
      id: true,
      email: true,
      status: true,
      createdAt: true,
      acceptedAt: true,
    },
  });

  const origin = new URL(request.url).origin;
  const acceptUrl = `${origin}/docs/invite/${token}`;

  const inviterName = session.user.name?.trim() || session.user.email || "A team member";

  await sendMail({
    to: inviteEmail,
    subject: `Invitation: ${resume.title} on M-Docs`,
    text: `${inviterName} invited you to collaborate on "${resume.title}". Accept here: ${acceptUrl}`,
    html: professionalInvitationEmail({
      inviterName,
      documentTitle: resume.title,
      acceptUrl,
      expiresAt,
    }),
  });

  return NextResponse.json({ invitation }, { status: 201 });
}
