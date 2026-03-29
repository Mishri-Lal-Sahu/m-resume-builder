import ats from "@/features/templates/data/ats-friendly.json";
import blank from "@/features/templates/data/blank.json";
import corporate from "@/features/templates/data/corporate.json";
import creative from "@/features/templates/data/creative.json";
import minimal from "@/features/templates/data/minimal.json";
import modern from "@/features/templates/data/modern.json";
import professional from "@/features/templates/data/professional.json";
import type { TemplateDefinition, TemplateKey } from "@/features/templates/types";

export const templateRegistry: TemplateDefinition[] = [
  blank,
  modern,
  professional,
  minimal,
  creative,
  corporate,
  ats,
] as TemplateDefinition[];

export function getTemplateByKey(key: string): TemplateDefinition {
  return templateRegistry.find((item) => item.key === key) ?? templateRegistry[0];
}

export function isValidTemplateKey(key: string): key is TemplateKey {
  return templateRegistry.some((item) => item.key === key);
}
