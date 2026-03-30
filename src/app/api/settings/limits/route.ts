import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public endpoint that returns non-sensitive platform limits.
 * Used client-side (e.g. DocsCanvas) to enforce page/collaborator limits.
 */
export async function GET() {
  try {
    const settings = await db.adminSettings.findFirst({
      select: {
        maxDocsPerUser: true,
        maxPagesPerDoc: true,
        maxCollaboratorsPerDoc: true,
      },
    });

    return NextResponse.json({
      maxDocsPerUser: settings?.maxDocsPerUser ?? 10,
      maxPagesPerDoc: settings?.maxPagesPerDoc ?? 50,
      maxCollaboratorsPerDoc: settings?.maxCollaboratorsPerDoc ?? 5,
    });
  } catch {
    // Safe defaults if DB is unavailable
    return NextResponse.json({
      maxDocsPerUser: 10,
      maxPagesPerDoc: 50,
      maxCollaboratorsPerDoc: 5,
    });
  }
}
