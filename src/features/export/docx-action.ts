"use server";

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { TipTapDoc, TipTapNode } from "@/features/resumes/tiptap-bridge";

/**
 * Maps TipTap marks (bold, italic, etc.) to TextRun properties
 */
function getRunProperties(marks?: any[]) {
  if (!marks) return {};
  const props: any = {};
  for (const mark of marks) {
    if (mark.type === "bold") props.bold = true;
    if (mark.type === "italic") props.italics = true;
    if (mark.type === "underline") props.underline = {};
    if (mark.type === "strike") props.strike = true;
  }
  return props;
}

/**
 * Recursively converts TipTap nodes to docx components
 */
function convertNodes(nodes: TipTapNode[]): any[] {
  const elements: any[] = [];

  for (const node of nodes) {
    if (node.type === "heading") {
      const level = node.attrs?.level as number;
      elements.push(
        new Paragraph({
          text: (node.content ?? []).map((n) => n.text).join(""),
          heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (node.type === "paragraph") {
      const children = (node.content ?? []).map((n) => {
        if (n.type === "text") {
          return new TextRun({
            text: n.text ?? "",
            ...getRunProperties(n.marks),
          });
        }
        return null; // Skip non-text for now in simple paragraphs
      }).filter(Boolean) as TextRun[];

      elements.push(
        new Paragraph({
          children,
          spacing: { after: 120 },
        })
      );
    } else if (node.type === "horizontalRule") {
      elements.push(new Paragraph({ border: { bottom: { color: "auto", space: 1, style: "single", size: 6 } } }));
    }
    // Add more node types (lists, tables) as needed for higher fidelity
  }

  return elements;
}

export async function exportDocxAction(title: string, tiptapJson: TipTapDoc) {
  try {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: convertNodes(tiptapJson.content),
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    return { 
      base64: buffer.toString("base64"),
      filename: `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase() || "document"}.docx`
    };
  } catch (error) {
    console.error("DOCX Export failed:", error);
    return { error: "Failed to generate Word document." };
  }
}
