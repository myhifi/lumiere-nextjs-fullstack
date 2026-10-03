import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { CategoryFilter } from "@/components/menu/CategoryFilter";
import { getLocalizedName } from "@/lib/utils/locale";

export const dynamic = "force-dynamic";

type MenuPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
};

// ═══════════════════════════════════════════════════
// 🌐 Dynamic metadata per locale
// ═══════════════════════════════════════════════════
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Menu" });

  return {
    title: t("title"),
    description: t("metaDescription"),
    openGraph: {
      title: `${t("title")} | Lumière`,
      description: t("metaDescription"),
      type: "website",
    },
  };
}

// ═══════════════════════════════════════════════════
// 🍽️ Menu Page
// ═══════════════════════════════════════════════════
export default async function MenuPage({
  params,
  searchParams,
}: MenuPageProps) {
  const { locale } = await params;
  const { category } = await searchParams;
  const t = await getTranslations("Menu");

  // Fetch categories + items in parallel
  const [categoriesRaw, itemsRaw] = await Promise.all([
    prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true, nameEn: true, slug: true },
    }),
    prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        ...(category && { category: { slug: category } }),
      },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
      include: {
        category: { select: { name: true, nameEn: true, slug: true } },
      },
    }),
  ]);

  // Translate category names to the current locale
  const categories = categoriesRaw.map((cat) => ({
    id: cat.id,
    name: getLocalizedName(cat.name, cat.nameEn, locale),
    slug: cat.slug,
  }));

  const items = itemsRaw.map((item) => ({
    ...item,
    name: getLocalizedName(item.name, item.nameEn, locale),
    description: item.description
      ? getLocalizedName(item.description, item.descriptionEn, locale)
      : null,
    category: {
      ...item.category,
      name: getLocalizedName(
        item.category.name,
        item.category.nameEn,
        locale
      ),
    },
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <span className="text-accent text-sm font-medium tracking-widest">
          {t("kicker")}
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
          {t("title")}
        </h1>
        <p className="text-muted max-w-xl mx-auto">{t("subtitle")}</p>
      </div>

      {/* Filter buttons */}
      <CategoryFilter categories={categories} allLabel={t("all")} />

      {/* Items grid */}
      {items.length === 0 ? (
        <p className="text-center text-muted py-16">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <MenuItemCard key={item.id} item={item} priority={index < 3} />
          ))}
        </div>
      )}
    </div>
  );
}