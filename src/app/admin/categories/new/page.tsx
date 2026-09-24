import Link from "next/link";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default function NewCategoryPage() {
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
      <h1 className="text-3xl font-bold mb-2">📂 تصنيف جديد</h1>
      <p className="text-muted mb-8">أضف تصنيفاً جديداً لتنظيم القائمة</p>
      <CategoryForm />
    </div>
  );
}