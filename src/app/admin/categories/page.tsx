import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CategoryRow } from "@/components/admin/CategoryRow";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminCategoriesPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      _count: { select: { items: true } },
    },
  });

  return (
    <div className="p-8">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold mb-2">📂 إدارة التصنيفات</h1>
          <p className="text-muted">{categories.length} تصنيف</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="bg-accent hover:bg-accent-dark text-white font-medium px-6 py-3 rounded-full transition-colors"
        >
          + تصنيف جديد
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {categories.length === 0 ? (
        <EmptyState
        icon="📂"
        title="لا توجد تصنيفات بعد"
        description="أضف تصنيفاً واحداً على الأقل لتنظيم قائمتك."
        action={
            <Link
            href="/admin/categories/new"
            className="inline-block bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors"
            >
            + إضافة تصنيف جديد
            </Link>
        }
        />
        ) : (
          <div className="divide-y divide-border">
            {categories.map((cat) => (
              <CategoryRow
                key={cat.id}
                category={{
                  id: cat.id,
                  name: cat.name,
                  slug: cat.slug,
                  description: cat.description,
                  displayOrder: cat.displayOrder,
                  itemsCount: cat._count.items,
                }}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}