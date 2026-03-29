import { db } from "@/lib/server/db";
import { DocsTable } from "@/components/admin/docs-table";

export const dynamic = "force-dynamic";

export const metadata = { title: "Document Moderation | M-Docs Admin" };

export default async function AdminDocsPage() {
  const docs = await db.resume.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl transition-colors" style={{ color: "var(--text-primary)" }}>
          Document Moderation
        </h1>
        <p className="mt-1 text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
          Review and manage all documents created on the platform.
        </p>
      </div>

      <DocsTable initialDocs={docs} />
    </div>
  );
}
