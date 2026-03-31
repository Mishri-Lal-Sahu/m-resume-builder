import { NextResponse } from "next/server";
import { defaultResumeDocument } from "@/features/resumes/types";
import { getAuthSession } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { htmlToTipTapNodes, chunkNodesToPages } from "@/features/import/html-to-tiptap";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getMaxDocsPerUser(): Promise<number> {
  try {
    const settings = await (db as any).adminSettings.findFirst();
    return settings?.maxDocsPerUser ?? 10;
  } catch {
    return 10;
  }
}

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const resumes = await db.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      visibility: true,
      updatedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ resumes }, { status: 200 });
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const maxDocs = await getMaxDocsPerUser();
  const currentCount = await db.resume.count({ where: { userId: session.user.id } });

  if (currentCount >= maxDocs) {
    return NextResponse.json(
      {
        limitType: "documents",
        limit: maxDocs,
        current: currentCount,
        message: `You have reached the document limit of ${maxDocs}. Please delete an existing document or contact your administrator to increase the limit.`,
      },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { title?: string; templateKey?: string; rawContent?: any; htmlContent?: string };
  const title = body.title?.trim() || `Document ${currentCount + 1}`;

  let finalRawContent = body.rawContent;

  if (body.htmlContent) {
    const nodes = htmlToTipTapNodes(body.htmlContent);
    finalRawContent = {
      type: "mdocs-document",
      version: 1,
      header: "<p></p>",
      footer: "<p></p>",
      pages: chunkNodesToPages(nodes, 3500),
    };
  }

  const resume = await db.resume.create({
    data: {
      userId: session.user.id,
      title,
      templateKey: body.templateKey || "modern",
      content: defaultResumeDocument(),
      ...(finalRawContent ? { rawContent: finalRawContent } : {}),
    },
    select: { id: true, title: true, createdAt: true },
  });

  return NextResponse.json({ resume }, { status: 201 });
}
