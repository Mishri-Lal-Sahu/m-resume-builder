import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { db } from "@/lib/server/db";
import { TipTapDoc } from "@/features/resumes/tiptap-bridge";

export const runtime = "nodejs";
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

async function getPublicDoc(id: string) {
  return db.resume.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      visibility: true,
      passwordHash: true,
      rawContent: true,
    },
  });
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const doc = await getPublicDoc(id);
  if (!doc) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const isPublic = doc.visibility === "PUBLIC" || doc.visibility === "LINK_ONLY";
  if (!isPublic) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  if (doc.passwordHash) {
    return NextResponse.json({ passwordRequired: true }, { status: 401 });
  }

  const parsed = normalizeRawContent(doc.rawContent);

  return NextResponse.json({
    title: doc.title,
    content: parsed.content,
    pages: parsed.pages,
  });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const doc = await getPublicDoc(id);
  if (!doc) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const isPublic = doc.visibility === "PUBLIC" || doc.visibility === "LINK_ONLY";
  if (!isPublic) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as { password?: string };
  const password = body.password?.trim();

  if (!doc.passwordHash) {
    const parsed = normalizeRawContent(doc.rawContent);
    return NextResponse.json({
      title: doc.title,
      content: parsed.content,
      pages: parsed.pages,
    });
  }

  if (!password) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  const valid = await compare(password, doc.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const parsed = normalizeRawContent(doc.rawContent);
  return NextResponse.json({
    title: doc.title,
    content: parsed.content,
    pages: parsed.pages,
  });
}
