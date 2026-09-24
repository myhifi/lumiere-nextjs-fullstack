import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MenuItemForm } from "@/components/admin/MenuItemForm";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditMenuItemPage({ params }: PageProps) {
  const { id } = await params;

  const [categories, item] = await Promise.all([
    prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.menuItem.findUnique({ where: { id } }),
  ]);

  if (!item) notFound();

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/menu"
          className="text-sm text-muted hover:text-accent transition-colors"
        >
          ← العودة إلى الأطباق
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">✎ تعديل: {item.name}</h1>
      <p className="text-muted mb-8">عدّل البيانات ثم احفظ التغييرات</p>

      <MenuItemForm
        categories={categories}
        initialData={{
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description ?? "",
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