import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { db } from "@/lib/server/db";

// ── Encryption helpers (AES-256-GCM) ─────────────────────────────────────────
function getEncKey(): Buffer {
  const raw = process.env.SETTINGS_ENCRYPTION_KEY ?? process.env.NEXTAUTH_SECRET ?? "";
  // Derive a 32-byte key (AES-256) from whatever is provided
  const key = Buffer.alloc(32);
  Buffer.from(raw).copy(key);
  return key;
}

export function encryptField(plaintext: string): string {
  if (!plaintext) return "";
  const key = getEncKey();
  const iv = randomBytes(12); // 96-bit IV for GCM
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Format: hex(ciphertext):hex(iv):hex(authTag)
  return `${encrypted.toString("hex")}:${iv.toString("hex")}:${authTag.toString("hex")}`;
}

export function decryptField(ciphertext: string): string {
  if (!ciphertext) return "";
  try {
    const key = getEncKey();
    const [encHex, ivHex, tagHex] = ciphertext.split(":");
    if (!encHex || !ivHex || !tagHex) return "";
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const enc = Buffer.from(encHex, "hex");
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return decipher.update(enc) + decipher.final("utf8");
  } catch {
    return "";
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────
export type PlatformSettings = {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string; // decrypted in memory, never persisted in plaintext
  smtpFrom: string;
  maxDocsPerUser: number;
  maxPagesPerDoc: number;
  maxCollaboratorsPerDoc: number;
};

export const DEFAULT_SETTINGS: PlatformSettings = {
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPass: "",
  smtpFrom: "",
  maxDocsPerUser: 10,
  maxPagesPerDoc: 50,
  maxCollaboratorsPerDoc: 5,
};

// ── DB helpers ────────────────────────────────────────────────────────────────

export async function getAdminSettings(): Promise<PlatformSettings> {
  const row = await db.adminSettings.findFirst();
  if (!row) return DEFAULT_SETTINGS;

  return {
    smtpHost: row.smtpHost ?? "",
    smtpPort: row.smtpPort ?? 587,
    smtpUser: row.smtpUser ?? "",
    smtpPass: row.smtpPassEncrypted ? decryptField(row.smtpPassEncrypted) : "",
    smtpFrom: row.smtpFrom ?? "",
    maxDocsPerUser: row.maxDocsPerUser,
    maxPagesPerDoc: row.maxPagesPerDoc,
    maxCollaboratorsPerDoc: row.maxCollaboratorsPerDoc,
  };
}

export async function saveAdminSettings(data: PlatformSettings): Promise<void> {
  const existing = await db.adminSettings.findFirst();

  const payload = {
    smtpHost: data.smtpHost || null,
    smtpPort: data.smtpPort || null,
    smtpUser: data.smtpUser || null,
    smtpPassEncrypted: data.smtpPass ? encryptField(data.smtpPass) : null,
    smtpFrom: data.smtpFrom || null,
    maxDocsPerUser: data.maxDocsPerUser,
    maxPagesPerDoc: data.maxPagesPerDoc,
    maxCollaboratorsPerDoc: data.maxCollaboratorsPerDoc,
  };

  if (existing) {
    await db.adminSettings.update({ where: { id: existing.id }, data: payload });
  } else {
    await db.adminSettings.create({ data: payload });
  }
}
