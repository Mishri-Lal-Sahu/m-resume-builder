import { NextResponse } from "next/server";

import { otpRequestSchema } from "@/features/auth/validation";
import { db } from "@/lib/server/db";
import { sendMail, professionalOtpEmail } from "@/lib/server/mailer";
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
    return NextResponse.json({ message: "If account exists, OTP sent" }, { status: 200 });
  }

  // Rate Limiting: Max 5 OTPs per 24 hours
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentOtps = await db.otpToken.count({
    where: {
      email: parsed.data.email,
      createdAt: { gte: yesterday },
    },
  });

  if (recentOtps >= 5) {
    return NextResponse.json(
      { message: "You have reached the limit of 5 OTP requests per day. Please try again tomorrow." },
      { status: 429 }
    );
  }

  const otp = generateNumericOtp(6);
  const tokenHash = hashToken(otp);

  await db.otpToken.deleteMany({ where: { email: parsed.data.email } });
  await db.otpToken.create({
    data: {
      email: parsed.data.email,
      tokenHash,
      expiresAt: expiryFromNow(10),
    },
  });

  try {
    await sendMail({
      to: parsed.data.email,
      subject: "Your M-Docs Verification Code",
      text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
      html: professionalOtpEmail(otp, "Email Verification"),
    });
  } catch {
    return NextResponse.json({ message: "Failed to send OTP email. Check SMTP settings." }, { status: 500 });
  }

  return NextResponse.json({ message: "OTP sent" }, { status: 200 });
}
