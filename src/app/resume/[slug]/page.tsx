import { db } from "@/lib/server/db";
import { notFound } from "next/navigation";
import { TemplatePreview } from "@/components/templates/template-preview";
import { normalizeResumeDocument } from "@/features/resumes/types";

type PublicResumePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublicResumePage({ params }: PublicResumePageProps) {
  const { slug } = await params;
  const resume = await db.resume.findUnique({
    where: { slug },
  });

  if (!resume || resume.visibility !== "PUBLIC") {
    notFound();
  }

  const content = normalizeResumeDocument(resume.content);

  return (
    <div className="min-h-screen bg-zinc-50 py-12 dark:bg-zinc-950">
      <div className="mx-auto w-[210mm] shadow-2xl">
        <TemplatePreview
          templateKey={resume.templateKey}
          title={resume.title}
          sections={content.sections}
          theme={content.theme}
          profilePhotoUrl={resume.profilePhotoUrl}
          readOnly
        />
      </div>
      <div className="mt-8 text-center">
        <p className="text-sm text-zinc-500">
          Built with <span className="font-bold text-zinc-900 dark:text-zinc-100">M-Docs</span>
        </p>
      </div>
    </div>
  );
}
