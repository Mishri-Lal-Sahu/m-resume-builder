import { NextResponse } from "next/server";

import { otpRequestSchema } from "@/features/auth/validation";
import { db } from "@/lib/server/db";
import { professionalOtpEmail, sendMail } from "@/lib/server/mailer";
import { expiryFromNow, generateNumericOtp, hashToken } from "@/lib/server/tokens";

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

  // Rate Limiting: Max 5 Password Reset OTPs per 24 hours
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentResets = await db.passwordResetToken.count({
    where: {
      email: parsed.data.email,
      createdAt: { gte: yesterday },
    },
  });

  if (recentResets >= 5) {
    return NextResponse.json(
      { message: "You have reached the limit of 5 password reset requests per day. Please try again tomorrow." },
      { status: 429 }
    );
  }

  const rawToken = generateNumericOtp(6);
  const tokenHash = hashToken(rawToken);

  await db.passwordResetToken.deleteMany({ where: { email: parsed.data.email } });
  await db.passwordResetToken.create({
    data: {
      email: parsed.data.email,
      tokenHash,
      expiresAt: expiryFromNow(30),
    },
  });

  await sendMail({
    to: parsed.data.email,
    subject: "Reset your M-Docs password",
    text: `Your password reset OTP code is ${rawToken}. It expires in 30 minutes.`,
    html: professionalOtpEmail(rawToken, "Password Reset"),
  });

  return NextResponse.json({ message: "Reset OTP sent" }, { status: 200 });
}
