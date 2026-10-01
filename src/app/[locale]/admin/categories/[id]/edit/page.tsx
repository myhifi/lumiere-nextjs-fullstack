import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { CategoryForm } from "@/components/admin/CategoryForm";

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function EditCategoryPage({ params }: PageProps) {
  const { id, locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Admin.categoryForm");

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/categories"
          className="text-sm text-muted hover:text-accent transition-colors"
        >
          {t("backToCategories")}
        </Link>
      </div>
      <h1 className="text-2xl lg:text-3xl font-bold mb-2">
        {t("editTitle", { name: category.name })}
      </h1>
      <p className="text-muted mb-8">{t("editSubtitle")}</p>
      <CategoryForm
        initialData={{
          id: category.id,
          name: category.name,
          nameEn: category.nameEn ?? "",
          slug: category.slug,
          description: category.description ?? "",
          displayOrder: category.displayOrder,
        }}
      />
    </div>
  );
}