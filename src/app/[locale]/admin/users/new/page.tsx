import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { UserForm } from "@/components/admin/UserForm";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewUserPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  const t = await getTranslations("Admin.userForm");

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
        {t("newTitle")}
      </h1>
      <p className="text-muted mb-8">{t("newSubtitle")}</p>
      <UserForm />
    </div>
  );
}