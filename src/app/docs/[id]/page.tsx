import { notFound, redirect } from "next/navigation";
import { DocsBuilder } from "@/components/docs/docs-builder";
import { getAuthSession } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { ResumeDocument } from "@/features/resumes/types";
import { resumeToTipTap } from "@/features/resumes/tiptap-bridge";
import type { TipTapDoc } from "@/features/resumes/tiptap-bridge";

export const dynamic = "force-dynamic";

export default async function DocsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const resume = await db.resume.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    select: {
      id: true,
      title: true,
      content: true,
      rawContent: true, // We will use this primarily, fallback to converting content
    },
  });

  if (!resume) {
    notFound();
  }

  // Use rawContent (saved from docs mode) if available.
  // Otherwise, convert the old section-based content.
  let initialTipTapJson: TipTapDoc | null = null;
  if (resume.rawContent && typeof resume.rawContent === "object" && (resume.rawContent as any).type === "doc") {
    initialTipTapJson = resume.rawContent as unknown as TipTapDoc;
  } else if (resume.content) {
    initialTipTapJson = resumeToTipTap(resume.content as unknown as ResumeDocument, resume.title);
  }

  return (
    <DocsBuilder
      resumeId={resume.id}
      initialTitle={resume.title}
      initialContent={initialTipTapJson}
    />
  );
}
