/**
 * Admin Seeder Script
 * 
 * Usage:
 *   npx ts-node --project tsconfig.json scripts/seed-admin.ts
 *   OR (using tsx):
 *   npx tsx scripts/seed-admin.ts
 * 
 * Set ADMIN_EMAIL and ADMIN_PASSWORD env vars, or edit the defaults below.
 */
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@mdocs.local";
  const password = process.env.ADMIN_PASSWORD ?? "Admin@12345";
  const name = process.env.ADMIN_NAME ?? "Super Admin";

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  const passwordHash = await hash(password, 12);

  const existing = await db.admin.findUnique({ where: { email } });

  if (existing) {
    // Update credentials
    await db.admin.update({
      where: { email },
      data: { passwordHash, name },
    });
    console.log(`✅ Admin updated: ${email}`);
  } else {
    await db.admin.create({
      data: { email, passwordHash, name },
    });
    console.log(`✅ Admin created: ${email}`);
  }

  console.log(`   Password: ${password}`);
  console.log(`   Login at: /admin/login`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
