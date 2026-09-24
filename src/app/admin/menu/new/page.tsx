import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MenuItemForm } from "@/components/admin/MenuItemForm";

export default async function NewMenuItemPage() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });

  if (categories.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">لا توجد تصنيفات بعد</h2>
          <p className="text-muted mb-4">
            يجب إنشاء تصنيف واحد على الأقل قبل إضافة الأطباق.
          </p>
          <Link
            href="/admin/categories"
            className="inline-block bg-accent hover:bg-accent-dark text-white px-6 py-3 rounded-full transition-colors"
          >
            إدارة التصنيفات
          </Link>
        </div>
      </div>
    );
  }

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

      <h1 className="text-3xl font-bold mb-2">🍽️ إضافة طبق جديد</h1>
      <p className="text-muted mb-8">
        املأ البيانات وسيظهر الطبق في القائمة فوراً
      </p>

      <MenuItemForm categories={categories} />
    </div>
  );
}