"use server";

// No static import for pdf-parse to avoid Turbopack proxies

import mammoth from "mammoth";
import { getAuthSession } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import type { MDocsDocument } from "@/components/docs/docs-builder";
import {
  htmlToTipTapNodes,
  plainTextToTipTapNodes,
  chunkNodesToPages,
} from "./html-to-tiptap";

export async function importDocumentAction(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) return { error: "No file provided" };

  if (file.size > 50 * 1024 * 1024) {
    return { error: "File exceeds 50MB limit." };
  }

  const session = await getAuthSession();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let allNodes: any[] = [];

    const isPDF = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isDOCX =
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx") ||
      file.name.endsWith(".doc");

    if (isPDF) {
      // Use eval("require") to bypass Turbopack's broken ESM proxy for this CJS-only lib
      const pdfParse = eval("require")("fresh-pdf-parse");
      const data = await pdfParse(buffer);
      // Convert plain text using smart heuristics for headings, bullets, paragraphs
      allNodes = plainTextToTipTapNodes(data.text);
    } else if (isDOCX) {
      // Use mammoth HTML output to preserve bold, italic, headings, lists
      const result = await mammoth.convertToHtml({ buffer });
      allNodes = htmlToTipTapNodes(result.value);
    } else {
      return { error: "Unsupported file type. Please upload a PDF or DOCX." };
    }

    // Check user document limits
    let maxDocs = 10;
    try {
      const settings = await (db as any).adminSettings.findFirst();
      if (settings?.maxDocsPerUser) maxDocs = settings.maxDocsPerUser;
    } catch {}

    const count = await db.resume.count({ where: { userId: session.user.id } });
    if (count >= maxDocs) {
      return {
        limitType: "documents",
        limit: maxDocs,
        current: count,
        error: "Document limit reached. Upgrade to pro to create more documents.",
      };
    }

    // Paginate nodes into A4-sized pages (~3000 chars each)
    const pages = chunkNodesToPages(allNodes, 3000);
    const fallbackSinglePage = pages[0] ?? { type: "doc", content: [{ type: "paragraph" }] };

    const rawContent: MDocsDocument = {
      type: "mdocs-document",
      version: 1,
      header: "<p></p>",
      footer: "<p></p>",
      pages,
    };

    const newDoc = await db.resume.create({
      data: {
        userId: session.user.id,
        title: file.name.replace(/\.[^/.]+$/, ""), // strip extension
        content: JSON.stringify(fallbackSinglePage),
        rawContent: rawContent as any,
        templateKey: "modern",
      },
    });

    return { success: true, id: newDoc.id };
  } catch (err: any) {
    return { error: err.message || "Failed to import document." };
  }
}
