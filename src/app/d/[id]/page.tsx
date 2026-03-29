import { notFound } from "next/navigation";
import { db } from "@/lib/server/db";
import { getAuthSession } from "@/lib/server/auth";
import { PublicDocsViewer } from "@/components/docs/public-viewer";
import { TipTapDoc } from "@/features/resumes/tiptap-bridge";

export const dynamic = "force-dynamic";

export default async function PublicDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getAuthSession();

  const doc = await db.resume.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      visibility: true,
      rawContent: true,
      userId: true,
    },
  });

  if (!doc) {
    notFound();
  }

  // Privacy Logic
  const isOwner = session?.user?.id === doc.userId;
  const isPublic = doc.visibility === "PUBLIC" || doc.visibility === "LINK_ONLY";

  if (!isOwner && !isPublic) {
    notFound(); // Hide existence of private documents
  }

  const initialContent = (doc.rawContent as unknown as TipTapDoc) || { type: "doc", content: [] };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 transition-colors duration-200">
      <PublicDocsViewer
        title={doc.title}
        initialContent={initialContent}
      />
    </div>
  );
}
