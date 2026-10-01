import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { UserForm } from "@/components/admin/UserForm";

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function EditUserPage({ params }: PageProps) {
  const { id, locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  const t = await getTranslations("Admin.userForm");

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  const isSelf = session.user.id === user.id;

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="text-sm text-muted hover:text-accent transition-colors"
        >
          {t("backToUsers")}
        </Link>
      </div>
      <h1 className="text-2xl lg:text-3xl font-bold mb-2">
        {t("editTitle", { name: user.name })}
      </h1>
      <p className="text-muted mb-8">{t("editSubtitle")}</p>
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