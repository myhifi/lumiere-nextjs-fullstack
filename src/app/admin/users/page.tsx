import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserRow } from "@/components/admin/UserRow";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminUsersPage() {
  const session = await auth();
  // 🛡️ الموظف لا يمكنه رؤية هذه الصفحة
  if (session?.user?.role !== "ADMIN") redirect("/admin");
  const currentUserId = session?.user?.id;

  // الموظف لا يرى هذه الصفحة (سيتحقق من الصلاحيات لاحقاً في layout)
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
    },
  });

  const activeAdmins = users.filter((u) => u.role === "ADMIN" && u.isActive)
    .length;

  return (
    <div className="p-8">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold mb-2">👥 إدارة الموظفين</h1>
          <p className="text-muted">
            {users.length} مستخدم · {activeAdmins} مدير نشط
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="bg-accent hover:bg-accent-dark text-white font-medium px-6 py-3 rounded-full transition-colors"
        >
          + موظف جديد
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {users.length === 0 ? (
        <EmptyState
            icon="👥"
            title="لا يوجد مستخدمون"
            description="أضف أول موظف للبدء."
            action={
                <Link
                href="/admin/users/new"
                className="inline-block bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors"
                >
                + إضافة موظف جديد
                </Link>
            }
        />
        ) : (
          <div className="divide-y divide-border">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                currentUserId={currentUserId ?? ""}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}