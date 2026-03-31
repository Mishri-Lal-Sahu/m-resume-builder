import { notFound } from "next/navigation";
import { db } from "@/lib/server/db";
import { getAuthSession } from "@/lib/server/auth";
import { PublicDocsViewer } from "@/components/docs/public-viewer";
import { ProtectedPublicView } from "@/components/docs/protected-public-view";
import { TipTapDoc } from "@/features/resumes/tiptap-bridge";

export const dynamic = "force-dynamic";

function normalizeRawContent(rawContent: unknown): { content: TipTapDoc; pages?: TipTapDoc[] } {
  if (rawContent && typeof rawContent === "object") {
    const raw = rawContent as { type?: string; pages?: unknown[] };
    if (raw.type === "mdocs-document" && Array.isArray(raw.pages)) {
      const pages = raw.pages as TipTapDoc[];
      return { content: pages[0] ?? { type: "doc", content: [] }, pages };
    }
    if (raw.type === "doc") {
      return { content: raw as TipTapDoc };
    }
  }
  return { content: { type: "doc", content: [] } };
}

export default async function PublicDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getAuthSession();

  const doc = await db.resume.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      visibility: true,
      passwordHash: true,
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

  if (!isOwner && doc.passwordHash) {
    return <ProtectedPublicView docId={doc.id} title={doc.title} />;
  }

  const parsed = normalizeRawContent(doc.rawContent);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 transition-colors duration-200">
      <PublicDocsViewer
        title={doc.title}
        initialContent={parsed.content}
        initialPages={parsed.pages}
      />
    </div>
  );
}
