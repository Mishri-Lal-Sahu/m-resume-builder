/**
 * tiptap-bridge.ts
 *
 * Converts between the existing ResumeDocument (section-based) format
 * and TipTap/ProseMirror JSON so both the rich-text editor and the
 * template renderers can consume the same data.
 */

import type { ResumeDocument, ResumeSection } from "./types";

// ─── TipTap JSON types (minimal, no external dep needed) ──────────────────────

export type TipTapMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

export type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: TipTapMark[];
  text?: string;
};

export type TipTapDoc = {
  type: "doc";
  content: TipTapNode[];
};

// ─── resume → TipTap ─────────────────────────────────────────────────────────

/**
 * Build a top-level text node from an HTML string.
 * We keep it simple: strip tags and use the inner text as a paragraph.
 * When we read back the HTML from TipTap we use the generated HTML directly.
 */
function htmlToTextNode(html: string): TipTapNode {
  // Basic strip — works server-side, no DOM needed
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
  return { type: "text", text };
}

function sectionToNodes(section: ResumeSection): TipTapNode[] {
  const nodes: TipTapNode[] = [];

  // Section heading as H2
  if (section.title) {
    nodes.push({
      type: "heading",
      attrs: { level: 2, "data-section-id": section.id, "data-section-type": section.type },
      content: [{ type: "text", text: section.title }],
    });
  }

  // Section content — try to split on newlines into paragraphs
  const rawText = section.content
    ? section.content
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .trim()
    : "";

  if (rawText) {
    const lines = rawText.split("\n").filter(Boolean);
    for (const line of lines) {
      nodes.push({
        type: "paragraph",
        attrs: { "data-section-id": section.id },
        content: line ? [{ type: "text", text: line }] : undefined,
      });
    }
  } else {
    // Empty paragraph placeholder
    nodes.push({
      type: "paragraph",
      attrs: { "data-section-id": section.id },
    });
  }

  return nodes;
}

export function resumeToTipTap(doc: ResumeDocument, title: string): TipTapDoc {
  const nodes: TipTapNode[] = [];

  // Document title as H1
  nodes.push({
    type: "heading",
    attrs: { level: 1 },
    content: [{ type: "text", text: title || "My Resume" }],
  });

  for (const section of doc.sections) {
    if (section.type === "pageBreak") {
      // Horizontal rule as page break marker
      nodes.push({ type: "horizontalRule", attrs: { "data-page-break": "true" } });
      continue;
    }
    nodes.push(...sectionToNodes(section));
  }

  // Always end with an empty paragraph so user can type past the last section
  nodes.push({ type: "paragraph" });

  return { type: "doc", content: nodes };
}

// ─── TipTap → resume ─────────────────────────────────────────────────────────

function nodeToHtml(node: TipTapNode): string {
  if (node.type === "text") {
    let text = node.text ?? "";
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === "bold") text = `<strong>${text}</strong>`;
        else if (mark.type === "italic") text = `<em>${text}</em>`;
        else if (mark.type === "underline") text = `<u>${text}</u>`;
        else if (mark.type === "strike") text = `<s>${text}</s>`;
        else if (mark.type === "textStyle") {
          const style = mark.attrs?.color ? `color:${mark.attrs.color}` : "";
          if (style) text = `<span style="${style}">${text}</span>`;
        }
        else if (mark.type === "highlight") {
          const bg = mark.attrs?.color ? `background-color:${mark.attrs.color}` : "background-color:yellow";
          text = `<mark style="${bg}">${text}</mark>`;
        }
      }
    }
    return text;
  }

  const inner = (node.content ?? []).map(nodeToHtml).join("");

  switch (node.type) {
    case "paragraph": return inner ? `<p>${inner}</p>` : "";
    case "heading": {
      const l = (node.attrs?.level as number) ?? 2;
      return `<h${l}>${inner}</h${l}>`;
    }
    case "bulletList": return `<ul>${inner}</ul>`;
    case "orderedList": return `<ol>${inner}</ol>`;
    case "listItem": return `<li>${inner}</li>`;
    case "taskList": return `<ul class="task-list">${inner}</ul>`;
    case "taskItem": {
      const checked = node.attrs?.checked ? "checked" : "";
      return `<li class="task-item"><input type="checkbox" ${checked} readonly /> ${inner}</li>`;
    }
    case "hardBreak": return "<br />";
    case "horizontalRule": return "<hr />";
    case "blockquote": return `<blockquote>${inner}</blockquote>`;
    case "codeBlock": return `<pre><code>${inner}</code></pre>`;
    default: return inner;
  }
}

/**
 * Convert TipTap JSON back to ResumeDocument sections.
 * We group content by H2 headings (which map to section titles).
 */
export function tiptapToResume(
  tiptapDoc: TipTapDoc,
  existingSections: ResumeSection[],
): { sections: ResumeSection[]; title: string } {
  const nodes = tiptapDoc.content ?? [];
  let title = "My Resume";
  const sections: ResumeSection[] = [];

  let currentSectionId: string | null = null;
  let currentTitle = "";
  let currentType: ResumeSection["type"] = "summary";
  let currentHtml: string[] = [];

  const flush = () => {
    if (!currentSectionId) return;
    const existing = existingSections.find((s) => s.id === currentSectionId);
    const html = currentHtml.join("");
    sections.push({
      ...(existing ?? {
        id: currentSectionId,
        type: currentType,
        title: currentTitle,
        content: html,
        fontSize: undefined,
        spacing: undefined,
        collapsed: false,
        width: undefined,
        height: undefined,
        x: undefined,
        y: undefined,
      }),
      title: currentTitle,
      content: html,
    });
    currentHtml = [];
    currentSectionId = null;
  };

  for (const node of nodes) {
    if (node.type === "heading" && (node.attrs?.level as number) === 1) {
      // Document title
      title = (node.content ?? []).map((n) => n.text ?? "").join("");
      continue;
    }

    if (node.type === "horizontalRule" && node.attrs?.["data-page-break"]) {
      flush();
      const existing = existingSections.find((s) => s.type === "pageBreak");
      sections.push({
        id: existing?.id ?? crypto.randomUUID(),
        type: "pageBreak",
        title: "Page Break",
        content: "",
        collapsed: false,
      } as ResumeSection);
      continue;
    }

    if (node.type === "heading" && (node.attrs?.level as number) === 2) {
      flush();
      // Start a new section
      const sectionId = (node.attrs?.["data-section-id"] as string) ?? crypto.randomUUID();
      const sectionType = ((node.attrs?.["data-section-type"] as ResumeSection["type"]) ?? "summary");
      currentSectionId = sectionId;
      currentTitle = (node.content ?? []).map((n) => n.text ?? "").join("");
      currentType = sectionType;
      continue;
    }

    if (currentSectionId) {
      const html = nodeToHtml(node);
      if (html) currentHtml.push(html);
    }
  }

  flush();

  return { sections, title };
}
