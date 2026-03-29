import { z } from "zod";
import { sectionTypeOptions } from "@/features/resumes/types";

export const resumeDocumentSchema = z.object({
  sections: z
    .array(
      z.object({
        id: z.string().min(1),
        type: z.enum(sectionTypeOptions),
        title: z.string().min(1).max(80),
        content: z.string().max(4000),
      })
    )
    .min(1)
    .max(20),
  theme: z.object({
    accent: z.string().min(4).max(20),
    font: z.enum(["sans", "serif", "mono"]),
    layout: z.enum(["single", "split"]),
    density: z.enum(["compact", "balanced", "spacious"]),
    sectionStyle: z.enum(["plain", "card", "line"]),
    headingCase: z.enum(["upper", "title"]),
    canvas: z.enum(["plain", "soft", "grid"]),
    pageCount: z.number().int().min(1).max(10),
  }),
});

export const resumePatchSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  templateKey: z.string().min(1).max(50).optional(),
  visibility: z.enum(["PRIVATE", "LINK_ONLY", "PUBLIC"]).optional(),
  slug: z.string().min(1).max(100).optional(),
  content: resumeDocumentSchema.optional(),
  rawContent: z.any().optional(),
});
