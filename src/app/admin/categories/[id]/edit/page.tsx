import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/CategoryForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/categories"
          className="text-sm text-muted hover:text-accent transition-colors"
        >
          ← العودة إلى التصنيفات
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-2">✎ تعديل: {category.name}</h1>
      <p className="text-muted mb-8">عدّل بيانات التصنيف</p>
      <CategoryForm
        initialData={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          displayOrder: category.displayOrder,
        }}
      />
    </div>
  );
}