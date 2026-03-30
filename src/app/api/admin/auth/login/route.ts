import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { db } from "@/lib/server/db";
import { setAdminCookie } from "@/lib/server/admin-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email ?? "").toLowerCase().trim();
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    // Look up in the separate Admin table
    const admin = await db.admin.findUnique({ where: { email } });
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const valid = await compare(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    // Issue httpOnly cookie
    await setAdminCookie(admin.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/auth/login]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
