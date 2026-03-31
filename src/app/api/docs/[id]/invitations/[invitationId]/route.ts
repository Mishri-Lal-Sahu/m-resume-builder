import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/server/auth";
import { getDocInvitationModel } from "@/lib/server/collaboration/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string; invitationId: string }> },
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id, invitationId } = await context.params;

  const docInvitation = getDocInvitationModel();
  if (!docInvitation) {
    return NextResponse.json(
      { error: "Collaboration tables are unavailable. Run prisma generate/db push and restart the server." },
      { status: 503 },
    );
  }

  const invitation = await docInvitation.findFirst({
    where: {
      id: invitationId,
      resumeId: id,
      resume: { userId: session.user.id },
    },
    select: {
      id: true,
      status: true,
    },
  });

  const activeInvitation = invitation as { id: string; status: "PENDING" | "ACCEPTED" | "WITHDRAWN" | "REVOKED" } | null;
  if (!activeInvitation) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  if (activeInvitation.status !== "PENDING" && activeInvitation.status !== "ACCEPTED") {
    return NextResponse.json({ error: "Invitation is not active." }, { status: 400 });
  }

  const status = activeInvitation.status === "PENDING" ? "WITHDRAWN" : "REVOKED";
  await docInvitation.update({
    where: { id: activeInvitation.id },
    data: { status },
  });

  return NextResponse.json({ success: true, status });
}
