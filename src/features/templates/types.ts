import type { ResumeDocument, ResumeSection, ResumeSectionType } from "@/features/resumes/types";
import type { ContentTool } from "@/features/resumes/content-tools";

export type TemplateKey = "modern" | "professional" | "minimal" | "creative" | "corporate" | "ats" | "blank";

export type TemplateDefinition = {
  key: TemplateKey;
  name: string;
  description: string;
  atsFriendly: boolean;
  defaultFont: ResumeDocument["theme"]["font"];
};

export type TemplateRenderProps = {
  title: string;
  sections: ResumeSection[];
  theme: ResumeDocument["theme"];
  profilePhotoUrl: string | null;
  selectedSectionId?: string | null;
  onSelectSection?: (id: string) => void;
  onChangeSection?: (id: string, patch: Partial<ResumeSection>, options?: { skipHistory?: boolean }) => void;
  onAddSection?: (type: ResumeSectionType, atIndex?: number) => void;
  onAddText?: (size: number, label: string, atIndex?: number) => void;
  onTool?: (id: string, tool: ContentTool) => void;
  onTitleChange?: (title: string) => void;
  readOnly?: boolean;
};
