import { notFound, redirect } from "next/navigation";
import { DocsBuilder } from "@/components/docs/docs-builder";
import { PublicDocsViewer } from "@/components/docs/public-viewer";
import { getAuthSession } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { getDocAccess } from "@/lib/server/collaboration/helpers";
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
  const resume = await db.resume.findUnique({
    where: { id },
    select: { id: true, title: true, content: true, rawContent: true, userId: true },
  });

  if (!resume) {
    notFound();
  }

  const access = await getDocAccess({
    resumeId: id,
    userId: session.user.id,
    email: session.user.email,
  });

  console.info(`[docs-access] doc=${id} user=${session.user.id} reason=${access.reason}`);

  if (!access.canRead) {
    notFound();
  }

  let initialTipTapJson: TipTapDoc | null = null;
  let initialPages: TipTapDoc[] | undefined;
  let initialHeader: string | undefined;
  let initialFooter: string | undefined;

  if (resume.rawContent && typeof resume.rawContent === "object") {
    const raw = resume.rawContent as { type?: string; pages?: TipTapDoc[]; header?: string; footer?: string };

    if (raw.type === "mdocs-document") {
      // ── New format: header + footer + multi-page content ──
      if (Array.isArray(raw.pages) && raw.pages.length > 0) {
        initialPages = raw.pages as TipTapDoc[];
        initialTipTapJson = raw.pages[0] as TipTapDoc;
      }
      initialHeader = typeof raw.header === "string" ? raw.header : undefined;
      initialFooter = typeof raw.footer === "string" ? raw.footer : undefined;

    } else if (raw.type === "doc") {
      // ── Legacy format: plain TipTap doc (no header/footer) ──
      initialTipTapJson = raw as TipTapDoc;
    }
  }

  // Final fallback: convert old section-based resume content
  if (!initialTipTapJson && resume.content) {
    initialTipTapJson = resumeToTipTap(
      resume.content as unknown as ResumeDocument,
      resume.title,
    );
  }

  if (!access.isOwner) {
    return (
      <PublicDocsViewer
        title={resume.title}
        initialContent={initialTipTapJson ?? { type: "doc", content: [] }}
        initialPages={initialPages}
      />
    );
  }

  return (
    <DocsBuilder
      resumeId={resume.id}
      initialTitle={resume.title}
      initialContent={initialTipTapJson}
      initialPages={initialPages}
      initialHeader={initialHeader}
      initialFooter={initialFooter}
    />
  );
}
