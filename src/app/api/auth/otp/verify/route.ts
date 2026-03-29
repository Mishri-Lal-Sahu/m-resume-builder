import { NextResponse } from "next/server";

import { otpVerifySchema } from "@/features/auth/validation";
import { db } from "@/lib/server/db";
import { hashToken } from "@/lib/server/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = otpVerifySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  const otpHash = hashToken(parsed.data.otp);

  const token = await db.otpToken.findFirst({
    where: {
      email: parsed.data.email,
      tokenHash: otpHash,
      expiresAt: { gt: new Date() },
    },
  });

  if (!token) {
    return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
  }

  await db.$transaction([
    db.user.update({
      where: { email: parsed.data.email },
      data: { emailVerified: new Date() },
    }),
    db.otpToken.deleteMany({ where: { email: parsed.data.email } }),
  ]);

  return NextResponse.json({ message: "Email verified" }, { status: 200 });
}
