import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { CategoryRow } from "@/components/admin/CategoryRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { getLocalizedName } from "@/lib/utils/locale";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminCategoriesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const t = await getTranslations("Admin.categories");

  const categoriesRaw = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      _count: { select: { items: true } },
    },
  });

  // Translate category names for display
  const categories = categoriesRaw.map((cat) => ({
    id: cat.id,
    name: getLocalizedName(cat.name, cat.nameEn, locale),
    slug: cat.slug,
    description: cat.description,
    displayOrder: cat.displayOrder,
    itemsCount: cat._count.items,
  }));

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            {t("title")}
          </h1>
          <p className="text-muted text-sm lg:text-base">
            {t("count", { count: categories.length })}
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="bg-accent hover:bg-accent-dark text-white font-medium px-6 py-3 rounded-full transition-colors text-sm lg:text-base"
        >
          {t("newItem")}
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {categories.length === 0 ? (
          <EmptyState
            icon="📂"
            title={t("emptyAll")}
            description={t("emptyDescription")}
            action={
              <Link
                href="/admin/categories/new"
                className="inline-block bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors"
              >
                {t("addNew")}
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-border">
            {categories.map((cat) => (
              <CategoryRow
                key={cat.id}
                category={cat}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}