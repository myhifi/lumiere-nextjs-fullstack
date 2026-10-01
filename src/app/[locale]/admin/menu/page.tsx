import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { MenuItemRow } from "@/components/admin/MenuItemRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { getLocalizedName } from "@/lib/utils/locale";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; availability?: string }>;
};

export default async function AdminMenuPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  const { category, availability } = await searchParams;
  const isAdmin = session?.user?.role === "ADMIN";
  const t = await getTranslations("Admin.menu");

  const categoriesRaw = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    select: { id: true, name: true, nameEn: true, slug: true },
  });

  // Translate category names for filter buttons
  const categories = categoriesRaw.map((cat) => ({
    id: cat.id,
    name: getLocalizedName(cat.name, cat.nameEn, locale),
    slug: cat.slug,
  }));

  const items = await prisma.menuItem.findMany({
    where: {
      ...(category && { category: { slug: category } }),
      ...(availability === "available" && { isAvailable: true }),
      ...(availability === "hidden" && { isAvailable: false }),
    },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    include: { category: { select: { name: true, nameEn: true } } },
  });

    // Translate category names for each item
  const itemsWithTranslatedCategory = items.map((item) => ({
    ...item,
    category: {
      ...item.category,
      name: getLocalizedName(
        item.category.name,
        item.category.nameEn,
        locale
      ),
    },
  }));
  function buildURL(params: { category?: string; availability?: string }) {
    const qs = new URLSearchParams();
    if (params.category) qs.set("category", params.category);
    if (params.availability) qs.set("availability", params.availability);
    const query = qs.toString();
    return `/admin/menu${query ? `?${query}` : ""}`;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            {t("title")}
          </h1>
          <p className="text-muted text-sm lg:text-base">
            {t("count", { count: items.length })}
            {category || availability ? t("countFiltered") : t("countTotal")}
          </p>
        </div>
        <Link
          href="/admin/menu/new"
          className="bg-accent hover:bg-accent-dark text-white font-medium px-6 py-3 rounded-full transition-colors text-sm lg:text-base"
        >
          {t("newItem")}
        </Link>
      </div>

      {/* التصفية حسب التصنيف */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Link
          href={buildURL({ availability })}
          className={`text-sm px-4 py-2 rounded-full border transition-colors ${
            !category
              ? "bg-accent text-white border-accent"
              : "bg-card border-border hover:border-accent hover:text-accent"
          }`}
        >
          {t("all")}
        </Link>
        {categories.map((cat) => {
          const isActive = category === cat.slug;
          return (
            <Link
              key={cat.id}
              href={buildURL({ category: cat.slug, availability })}
              className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                isActive
                  ? "bg-accent text-white border-accent"
                  : "bg-card border-border hover:border-accent hover:text-accent"
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>

      {/* التصفية حسب التوفر */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href={buildURL({ category })}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !availability
              ? "bg-foreground text-background border-foreground"
              : "bg-card border-border hover:border-foreground"
          }`}
        >
          {t("filterAllStates")}
        </Link>
        <Link
          href={buildURL({ category, availability: "available" })}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            availability === "available"
              ? "bg-green-600 text-white border-green-600"
              : "bg-card border-border hover:border-green-600 hover:text-green-700"
          }`}
        >
          {t("filterAvailable")}
        </Link>
        <Link
          href={buildURL({ category, availability: "hidden" })}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            availability === "hidden"
              ? "bg-red-600 text-white border-red-600"
              : "bg-card border-border hover:border-red-500 hover:text-red-700"
          }`}
        >
          {t("filterHidden")}
        </Link>
      </div>

      {/* القائمة */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {items.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title={
              category || availability ? t("emptyFiltered") : t("emptyAll")
            }
            description={
              category || availability
                ? t("emptyDescriptionFiltered")
                : t("emptyDescriptionAll")
            }
            action={
              <Link
                href="/admin/menu/new"
                className="inline-block bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors"
              >
                {t("addNew")}
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-border">
            {itemsWithTranslatedCategory.map((item) => (
              <MenuItemRow key={item.id} item={item} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}