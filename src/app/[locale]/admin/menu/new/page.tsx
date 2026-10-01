import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { MenuItemForm } from "@/components/admin/MenuItemForm";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewMenuItemPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Admin.menuForm");

  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });

  if (categories.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">{t("noCategoriesTitle")}</h2>
          <p className="text-muted mb-4">{t("noCategoriesMessage")}</p>
          <Link
            href="/admin/categories"
            className="inline-block bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-full transition-colors"
          >
            {t("manageCategories")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/menu"
          className="text-sm text-muted hover:text-accent transition-colors"
        >
          {t("backToMenu")}
        </Link>
      </div>

      <h1 className="text-2xl lg:text-3xl font-bold mb-2">
        {t("newTitle")}
      </h1>
      <p className="text-muted mb-8">{t("newSubtitle")}</p>

      <MenuItemForm categories={categories} />
    </div>
  );
}