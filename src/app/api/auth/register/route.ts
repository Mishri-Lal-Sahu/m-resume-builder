import { hash } from "bcryptjs";
import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";

import { signupSchema } from "@/features/auth/validation";
import { db } from "@/lib/server/db";
import { sendMail } from "@/lib/server/mailer";
import { expiryFromNow, generateNumericOtp, hashToken } from "@/lib/server/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const existing = await db.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await hash(parsed.data.password, 12);
    const otp = generateNumericOtp(6);
    const tokenHash = hashToken(otp);

    await db.$transaction([
      db.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          passwordHash,
          emailVerified: null,
        },
      }),
      db.otpToken.deleteMany({ where: { email: parsed.data.email } }),
      db.otpToken.create({
        data: {
          email: parsed.data.email,
          tokenHash,
          expiresAt: expiryFromNow(10),
        },
      }),
    ]);

    await sendMail({
      to: parsed.data.email,
      subject: "Verify your email",
      text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
    });

    return NextResponse.json(
      { message: "Account created. Verify OTP to login." },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return NextResponse.json(
        { message: "Database schema is not initialized. Run setup migration." },
        { status: 503 },
      );
    }

    return NextResponse.json({ message: "Unable to create account" }, { status: 500 });
  }
}
