import { NextResponse } from "next/server";

import { otpRequestSchema } from "@/features/auth/validation";
import { db } from "@/lib/server/db";
import { sendMail } from "@/lib/server/mailer";
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

  await sendMail({
    to: parsed.data.email,
    subject: "Your OTP code",
    text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
  });

  return NextResponse.json({ message: "OTP sent" }, { status: 200 });
}
