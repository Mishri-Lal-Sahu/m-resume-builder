import "server-only";

import crypto from "crypto";
import path from "path";
import { promises as fs } from "fs";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

export async function saveProfilePhoto(file: File, resumeId: string) {
  const ext = ALLOWED_MIME_TYPES.get(file.type);

  if (!ext) {
    throw new Error("Unsupported file type");
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new Error("File too large");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = `${resumeId}-${crypto.randomUUID()}${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes");
  await fs.mkdir(uploadDir, { recursive: true });

  const diskPath = path.join(uploadDir, safeName);
  await fs.writeFile(diskPath, buffer);

  return `/uploads/resumes/${safeName}`;
}
