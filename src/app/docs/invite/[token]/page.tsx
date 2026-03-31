import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/server/auth";
import { getDocInvitationModel } from "@/lib/server/collaboration/helpers";

export const dynamic = "force-dynamic";

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const session = await getAuthSession();
  const { token } = await params;

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/docs/invite/${token}`)}`);
  }

  const docInvitation = getDocInvitationModel();
  if (!docInvitation) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-xl font-bold">Collaboration not ready</h1>
        <p className="mt-2 text-sm text-zinc-600">Please run Prisma generate + db push, then restart the server.</p>
      </main>
    );
  }

  const invite = (await docInvitation.findUnique({
    where: { token },
    select: {
      id: true,
      email: true,
      status: true,
      expiresAt: true,
      resumeId: true,
      resume: { select: { title: true } },
    },
  })) as {
    id: string;
    email: string;
    status: "PENDING" | "ACCEPTED" | "WITHDRAWN" | "REVOKED" | "DECLINED" | "EXPIRED";
    expiresAt: Date | null;
    resumeId: string;
    resume: { title: string };
  } | null;

  if (!invite) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-xl font-bold">Invitation not found</h1>
        <p className="mt-2 text-sm text-zinc-600">This invitation link is invalid or has already been removed.</p>
        <Link className="mt-6 inline-block text-sm font-semibold text-indigo-600" href="/dashboard">Go to dashboard</Link>
      </main>
    );
  }

  if (invite.status !== "PENDING") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-xl font-bold">Invitation is no longer active</h1>
        <p className="mt-2 text-sm text-zinc-600">This invitation has already been accepted, withdrawn, or revoked.</p>
        <Link className="mt-6 inline-block text-sm font-semibold text-indigo-600" href="/dashboard">Go to dashboard</Link>
      </main>
    );
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    await docInvitation.update({
      where: { id: invite.id },
      data: { status: "EXPIRED" },
    });

    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-xl font-bold">Invitation expired</h1>
        <p className="mt-2 text-sm text-zinc-600">Ask the document owner to send a new invitation.</p>
        <Link className="mt-6 inline-block text-sm font-semibold text-indigo-600" href="/dashboard">Go to dashboard</Link>
      </main>
    );
  }

  const sessionEmail = session.user.email?.trim().toLowerCase();
  if (!sessionEmail || sessionEmail !== invite.email) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-xl font-bold">Email mismatch</h1>
        <p className="mt-2 text-sm text-zinc-600">
          This invite is for <strong>{invite.email}</strong>. You are signed in as <strong>{session.user.email}</strong>.
        </p>
        <Link className="mt-6 inline-block text-sm font-semibold text-indigo-600" href="/dashboard">Go to dashboard</Link>
      </main>
    );
  }

  await docInvitation.update({
    where: { id: invite.id },
    data: {
      status: "ACCEPTED",
      invitedUserId: session.user.id,
      acceptedAt: new Date(),
    },
  });

  redirect(`/docs/${invite.resumeId}?inviteAccepted=1`);
}
