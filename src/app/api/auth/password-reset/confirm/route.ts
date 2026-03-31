import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { passwordResetConfirmSchema } from "@/features/auth/validation";
import { db } from "@/lib/server/db";
import { hashToken } from "@/lib/server/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = passwordResetConfirmSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input" }, { status: 400 });
  }

  const tokenHash = hashToken(parsed.data.otp);

  const token = await db.passwordResetToken.findFirst({
    where: {
      email: parsed.data.email,
      tokenHash,
      expiresAt: { gt: new Date() },
    },
  });

  if (!token) {
    return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
  }

  const passwordHash = await hash(parsed.data.password, 12);

  await db.$transaction([
    db.user.update({
      where: { email: parsed.data.email },
      data: { passwordHash },
    }),
    db.passwordResetToken.deleteMany({ where: { email: parsed.data.email } }),
  ]);

  return NextResponse.json({ message: "Password updated" }, { status: 200 });
}
