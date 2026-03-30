/**
 * Converts a mammoth HTML string into an array of TipTap-compatible JSON nodes.
 * Handles: h1-h6, p, ul/ol+li, strong/b, em/i, u, a, br, tables (as plain text).
 */

type TipTapMark = { type: string; attrs?: Record<string, any> };
type TipTapNode = {
  type: string;
  attrs?: Record<string, any>;
  content?: TipTapNode[];
  marks?: TipTapMark[];
  text?: string;
};

/** Parse inline marks from an HTML element's innerHTML */
function parseInlineContent(html: string): TipTapNode[] {
  // Normalise html
  const nodes: TipTapNode[] = [];

  // We'll use a simple tag-aware splitter
  const tagRe = /<(\/?)([a-z0-9]+)([^>]*)>/gi;
  let activeBold = false;
  let activeItalic = false;
  let activeUnderline = false;
  let activeLinkHref: string | null = null;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const pushText = (raw: string) => {
    // Decode basic HTML entities
    const text = raw
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ")
      .replace(/&quot;/g, '"');
    if (!text) return;

    const marks: TipTapMark[] = [];
    if (activeBold) marks.push({ type: "bold" });
    if (activeItalic) marks.push({ type: "italic" });
    if (activeUnderline) marks.push({ type: "underline" });
    if (activeLinkHref) marks.push({ type: "link", attrs: { href: activeLinkHref } });

    nodes.push({ type: "text", text, ...(marks.length ? { marks } : {}) });
  };

  while ((match = tagRe.exec(html)) !== null) {
    // Push text before this tag
    const textBefore = html.slice(lastIndex, match.index);
    if (textBefore) pushText(textBefore);
    lastIndex = match.index + match[0].length;

    const closing = match[1] === "/";
    const tag = match[2].toLowerCase();
    const attrsStr = match[3];

    if (!closing) {
      if (tag === "strong" || tag === "b") activeBold = true;
      if (tag === "em" || tag === "i") activeItalic = true;
      if (tag === "u") activeUnderline = true;
      if (tag === "br") nodes.push({ type: "hardBreak" });
      if (tag === "a") {
        const hrefMatch = /href="([^"]*)"/.exec(attrsStr);
        activeLinkHref = hrefMatch ? hrefMatch[1] : null;
      }
    } else {
      if (tag === "strong" || tag === "b") activeBold = false;
      if (tag === "em" || tag === "i") activeItalic = false;
      if (tag === "u") activeUnderline = false;
      if (tag === "a") activeLinkHref = null;
    }
  }

  // Push remaining text
  const remaining = html.slice(lastIndex);
  if (remaining) pushText(remaining);

  return nodes.filter(Boolean);
}

/** Strip all HTML tags returning plain text (for fallback) */
function stripTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Converts mammoth HTML output to an array of top-level TipTap block nodes.
 */
export function htmlToTipTapNodes(html: string): TipTapNode[] {
  const nodes: TipTapNode[] = [];

  // Match top-level block tags
  const blockRe = /<(h[1-6]|p|ul|ol|li|table|thead|tbody|tr|td|th)([^>]*)>([\s\S]*?)<\/\1>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const processedRanges: [number, number][] = [];

  while ((match = blockRe.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const inner = match[3];
    const start = match.index;
    const end = match.index + match[0].length;

    // Skip if already inside a parent block we processed
    if (processedRanges.some(([s, e]) => start > s && end <= e)) continue;
    processedRanges.push([start, end]);
    lastIndex = end;

    if (/^h[1-6]$/.test(tag)) {
      const level = parseInt(tag[1]);
      const inlineContent = parseInlineContent(inner);
      if (inlineContent.length > 0) {
        nodes.push({
          type: "heading",
          attrs: { level },
          content: inlineContent,
        });
      }
    } else if (tag === "p") {
      const inlineContent = parseInlineContent(inner);
      nodes.push({
        type: "paragraph",
        content: inlineContent.length > 0 ? inlineContent : undefined,
      });
    } else if (tag === "ul" || tag === "ol") {
      const listType = tag === "ul" ? "bulletList" : "orderedList";
      const itemRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      const items: TipTapNode[] = [];
      let liMatch: RegExpExecArray | null;
      while ((liMatch = itemRe.exec(inner)) !== null) {
        const liInner = liMatch[1];
        const inlineContent = parseInlineContent(liInner);
        items.push({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: inlineContent.length > 0 ? inlineContent : undefined,
            },
          ],
        });
      }
      if (items.length > 0) {
        nodes.push({ type: listType, content: items });
      }
    } else if (tag === "table") {
      // Tables: render each row as a paragraph (full table support is complex)
      const cellRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      let cellText = "";
      let cellMatch: RegExpExecArray | null;
      const cellTexts: string[] = [];
      while ((cellMatch = cellRe.exec(inner)) !== null) {
        const t = stripTags(cellMatch[1]);
        if (t) cellTexts.push(t);
      }
      if (cellTexts.length > 0) {
        nodes.push({
          type: "paragraph",
          content: [{ type: "text", text: cellTexts.join(" | ") }],
        });
      }
    }
  }

  if (nodes.length === 0) {
    nodes.push({ type: "paragraph" });
  }

  return nodes;
}

/**
 * Chunks an array of TipTap nodes into pages by estimated character count.
 */
export function chunkNodesToPages(
  allNodes: TipTapNode[],
  charsPerPage = 3000
): { type: "doc"; content: TipTapNode[] }[] {
  const pages: { type: "doc"; content: TipTapNode[] }[] = [];
  let currentNodes: TipTapNode[] = [];
  let currentChars = 0;

  const nodeTextLength = (node: TipTapNode): number => {
    if (node.text) return node.text.length;
    if (node.content) return node.content.reduce((s, c) => s + nodeTextLength(c), 0);
    return 0;
  };

  for (const node of allNodes) {
    const len = nodeTextLength(node);
    if (currentChars + len > charsPerPage && currentNodes.length > 0) {
      pages.push({ type: "doc", content: currentNodes });
      currentNodes = [];
      currentChars = 0;
    }
    currentNodes.push(node);
    currentChars += len;
  }

  if (currentNodes.length > 0 || pages.length === 0) {
    if (currentNodes.length === 0) currentNodes.push({ type: "paragraph" });
    pages.push({ type: "doc", content: currentNodes });
  }

  return pages;
}

/**
 * Smart heuristic converter for plain text (from PDF) into TipTap nodes.
 * Detects headings (short all-caps / title-case lines), bullets, numbered lists.
 */
export function plainTextToTipTapNodes(text: string): TipTapNode[] {
  const lines = text.split(/\n/).map((l) => l.trimEnd());
  const nodes: TipTapNode[] = [];

  const isHeading = (line: string): boolean => {
    const t = line.trim();
    if (!t || t.length < 2 || t.length > 120) return false;
    // All caps and short → heading
    if (t === t.toUpperCase() && /[A-Z]/.test(t) && t.length < 60) return true;
    // Title Case and short — no sentence-ending punctuation
    const words = t.split(/\s+/);
    if (words.length <= 8 && !/[.;,!?]$/.test(t)) {
      const titleCase = words.every(
        (w) => /^[A-Z\d"'(]/.test(w) || w.length <= 3
      );
      if (titleCase) return true;
    }
    return false;
  };

  const isBullet = (line: string): string | null => {
    const t = line.trim();
    if (/^[•\-\*→▸◆▪▶]\s+/.test(t)) return t.replace(/^[•\-\*→▸◆▪▶]\s+/, "");
    if (/^\d+[\.\)]\s+/.test(t)) return t.replace(/^\d+[\.\)]\s+/, "");
    return null;
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      // blank line — emit empty paragraph as spacer between sections
      if (nodes.length > 0 && nodes[nodes.length - 1].type !== "paragraph") {
        nodes.push({ type: "paragraph" });
      }
      i++;
      continue;
    }

    const bulletContent = isBullet(trimmed);
    if (bulletContent !== null) {
      // Collect consecutive bullets into a bulletList
      const items: TipTapNode[] = [];
      while (i < lines.length) {
        const bc = isBullet(lines[i].trim());
        if (bc !== null) {
          items.push({
            type: "listItem",
            content: [{ type: "paragraph", content: [{ type: "text", text: bc }] }],
          });
          i++;
        } else {
          break;
        }
      }
      nodes.push({ type: "bulletList", content: items });
      continue;
    }

    if (isHeading(trimmed)) {
      // Determine level: ALL_CAPS = h1, short title-case = h2
      const level = trimmed === trimmed.toUpperCase() ? 1 : 2;
      nodes.push({
        type: "heading",
        attrs: { level },
        content: [{ type: "text", text: trimmed }],
      });
      i++;
      continue;
    }

    // Normal paragraph — collect indented continuation lines
    let paraText = trimmed;
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !isHeading(lines[i].trim()) &&
      isBullet(lines[i].trim()) === null
    ) {
      paraText += " " + lines[i].trim();
      i++;
    }

    nodes.push({
      type: "paragraph",
      content: [{ type: "text", text: paraText }],
    });
  }

  if (nodes.length === 0) nodes.push({ type: "paragraph" });
  return nodes;
}
