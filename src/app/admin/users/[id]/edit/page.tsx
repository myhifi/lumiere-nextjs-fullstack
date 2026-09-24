import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserForm } from "@/components/admin/UserForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditUserPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  const isSelf = session.user.id === user.id;

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
      <h1 className="text-3xl font-bold mb-2">✎ تعديل: {user.name}</h1>
      <p className="text-muted mb-8">عدّل البيانات أو اترك كلمة السر فارغة لعدم التغيير</p>
      <UserForm
        initialData={{
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as "ADMIN" | "STAFF",
          isActive: user.isActive,
        }}
        isSelf={isSelf}
      />
    </div>
  );
}