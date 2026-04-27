import "server-only";

import { db } from "@/lib/server/db";
import type { Prisma } from "@/generated/prisma/client";

const ACTIVE_INVITE_STATUSES = ["PENDING", "ACCEPTED"] as const;

export type DocAccess = {
  canRead: boolean;
  canComment: boolean;
  isOwner: boolean;
  reason: "owner" | "accepted_invitation" | "no_access" | "not_found";
};

type DocInvitationModel = {
  count(args: Prisma.DocInvitationCountArgs): Promise<number>;
  findMany(args: Prisma.DocInvitationFindManyArgs): Promise<unknown[]>;
  findFirst(args: Prisma.DocInvitationFindFirstArgs): Promise<unknown>;
  create(args: Prisma.DocInvitationCreateArgs): Promise<unknown>;
  update(args: Prisma.DocInvitationUpdateArgs): Promise<unknown>;
  findUnique(args: Prisma.DocInvitationFindUniqueArgs): Promise<unknown>;
};

type DocCommentModel = {
  findMany(args: Prisma.DocCommentFindManyArgs): Promise<unknown[]>;
  create(args: Prisma.DocCommentCreateArgs): Promise<unknown>;
};

export function getDocInvitationModel(): DocInvitationModel | null {
  const prisma = db as unknown as { docInvitation?: DocInvitationModel };
  return prisma.docInvitation ?? null;
}

export function getDocCommentModel(): DocCommentModel | null {
  const prisma = db as unknown as { docComment?: DocCommentModel };
  return prisma.docComment ?? null;
}

export async function getMaxCollaboratorsPerDoc(): Promise<number> {
  const settings = await db.adminSettings.findFirst({
    select: { maxCollaboratorsPerDoc: true },
  });
  return settings?.maxCollaboratorsPerDoc ?? 5;
}

export async function getActiveCollaboratorSlotUsage(resumeId: string): Promise<number> {
  const docInvitation = getDocInvitationModel();
  if (!docInvitation) {
    return 1;
  }

  const activeInvites = await docInvitation.count({
    where: {
      resumeId,
      status: { in: [...ACTIVE_INVITE_STATUSES] },
    },
  });

  // Include owner in slots
  return 1 + activeInvites;
}

export async function hasAcceptedInvitation(params: {
  resumeId: string;
  userId?: string | null;
  email?: string | null;
}): Promise<boolean> {
  const docInvitation = getDocInvitationModel();
  if (!docInvitation) return false;

  const email = params.email?.trim().toLowerCase();
  if (!params.userId && !email) return false;

  const invitation = await docInvitation.findFirst({
    where: {
      resumeId: params.resumeId,
      status: "ACCEPTED",
      OR: [
        ...(params.userId ? [{ invitedUserId: params.userId }] : []),
        ...(email ? [{ email }] : []),
      ],
    },
    select: { id: true },
  });

  return Boolean(invitation);
}

export async function getDocAccess(params: {
  resumeId: string;
  userId?: string | null;
  email?: string | null;
}): Promise<DocAccess> {
  const resume = await db.resume.findUnique({
    where: { id: params.resumeId },
    select: { userId: true },
  });

  if (!resume) {
    return { canRead: false, canComment: false, isOwner: false, reason: "not_found" };
  }

  const isOwner = !!params.userId && resume.userId === params.userId;
  if (isOwner) {
    return { canRead: true, canComment: true, isOwner: true, reason: "owner" };
  }

  const accepted = await hasAcceptedInvitation(params);
  if (accepted) {
    return { canRead: true, canComment: true, isOwner: false, reason: "accepted_invitation" };
  }

  return { canRead: false, canComment: false, isOwner: false, reason: "no_access" };
}
