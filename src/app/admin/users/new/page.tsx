import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserForm } from "@/components/admin/UserForm";

export default async function NewUserPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="text-sm text-muted hover:text-accent transition-colors"
        >
          ← العودة إلى الموظفين
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-2">👥 موظف جديد</h1>
      <p className="text-muted mb-8">
        أضف موظفاً جديداً بصلاحيات محدودة (STAFF) أو كاملة (ADMIN)
      </p>
      <UserForm />
    </div>
  );
}