import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { MenuItemForm } from "@/components/admin/MenuItemForm";
import { getLocalizedName } from "@/lib/utils/locale";

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function EditMenuItemPage({ params }: PageProps) {
  const { id, locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Admin.menuForm");

  const [categoriesRaw, item] = await Promise.all([
    prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true, nameEn: true, slug: true },
    }),
    prisma.menuItem.findUnique({ where: { id } }),
  ]);

  if (!item) notFound();

  const categories = categoriesRaw.map((cat) => ({
    id: cat.id,
    name: getLocalizedName(cat.name, cat.nameEn, locale),
    slug: cat.slug,
  }));

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
        {t("editTitle", { name: item.name })}
      </h1>
      <p className="text-muted mb-8">{t("editSubtitle")}</p>

      <MenuItemForm
        categories={categories}
        initialData={{
          id: item.id,
          name: item.name,
          nameEn: item.nameEn ?? "",
          slug: item.slug,
          description: item.description ?? "",
          descriptionEn: item.descriptionEn ?? "",
          price: item.price,
          imageUrl: item.imageUrl ?? "",
          categoryId: item.categoryId,
          isAvailable: item.isAvailable,
          isFeatured: item.isFeatured,
        }}
      />
    </div>
  );
}