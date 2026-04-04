import { notFound, redirect } from "next/navigation";
import { ResumeBuilder } from "@/components/builder/resume-builder";
import { normalizeResumeDocument } from "@/features/resumes/types";
import { getAuthSession } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
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
      templateKey: true,
      profilePhotoUrl: true,
      content: true,
      visibility: true,
      slug: true,
    },
  });

  if (!resume) {
    notFound();
  }

  return (
    <ResumeBuilder
      resumeId={resume.id}
      initialTitle={resume.title}
      initialTemplateKey={resume.templateKey}
      initialProfilePhotoUrl={resume.profilePhotoUrl}
      initialVisibility={resume.visibility}
      initialSlug={resume.slug}
      initialContent={normalizeResumeDocument(resume.content)}
    />
  );
}
