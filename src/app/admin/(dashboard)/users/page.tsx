import { db } from "@/lib/server/db";
import { UsersTable } from "@/components/admin/users-table";

export const dynamic = "force-dynamic";

export const metadata = { title: "User Management | M-Docs Admin" };

export default async function AdminUsersPage() {
  const users = await db.user.findMany({
    include: {
      _count: {
        select: { resumes: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl transition-colors" style={{ color: "var(--text-primary)" }}>
          Users Management
        </h1>
        <p className="mt-1 text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
          View all registered accounts and their platform usage.
        </p>
      </div>

      <UsersTable initialUsers={users} />
    </div>
  );
}
