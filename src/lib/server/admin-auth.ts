import "server-only";

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/server/db";

const ADMIN_COOKIE = "admin_token";
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");
  return secret;
}

// ── Simple signed token: base64(payload).signature ───────────────────────────
function signPayload(payload: object): string {
  const secret = getSecret();
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verifyToken(token: string): { adminId: string; exp: number } | null {
  try {
    const secret = getSecret();
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;

    const expectedSig = createHmac("sha256", secret).update(body).digest("base64url");
    // Timing-safe comparison
    const sigBuf = Buffer.from(sig, "base64url");
    const expBuf = Buffer.from(expectedSig, "base64url");
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;

    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.adminId || !payload.exp) return null;
    if (Date.now() / 1000 > payload.exp) return null; // expired

    return payload as { adminId: string; exp: number };
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export function createAdminToken(adminId: string): string {
  const payload = {
    adminId,
    exp: Math.floor(Date.now() / 1000) + TOKEN_MAX_AGE,
    iat: Math.floor(Date.now() / 1000),
  };
  return signPayload(payload);
}

export async function setAdminCookie(adminId: string): Promise<void> {
  const token = createAdminToken(adminId);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
}

export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export type AdminSession = {
  id: string;
  name: string | null;
  email: string;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    const admin = await db.admin.findUnique({
      where: { id: payload.adminId },
      select: { id: true, name: true, email: true },
    });

    return admin ?? null;
  } catch {
    return null;
  }
}
