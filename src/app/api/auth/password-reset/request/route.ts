import { NextResponse } from "next/server";

import { otpRequestSchema } from "@/features/auth/validation";
import { db } from "@/lib/server/db";
import { sendMail } from "@/lib/server/mailer";
import { expiryFromNow, generateToken, hashToken } from "@/lib/server/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = otpRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return NextResponse.json({ message: "If account exists, reset sent" }, { status: 200 });
  }

  const rawToken = generateToken(24);
  const tokenHash = hashToken(rawToken);

  await db.passwordResetToken.deleteMany({ where: { email: parsed.data.email } });
  await db.passwordResetToken.create({
    data: {
      email: parsed.data.email,
      tokenHash,
      expiresAt: expiryFromNow(30),
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?email=${encodeURIComponent(parsed.data.email)}&token=${rawToken}`;

  await sendMail({
    to: parsed.data.email,
    subject: "Reset your password",
    text: `Use this link to reset your password: ${resetUrl}`,
  });

  return NextResponse.json({ message: "Reset link sent" }, { status: 200 });
}
