"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteCategory } from "@/actions/admin-categories";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  itemsCount: number;
};

export function CategoryRow({
  category,
  isAdmin,
}: {
  category: Category;
  isAdmin: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (
      !confirm(
        `حذف تصنيف "${category.name}"؟${category.itemsCount > 0 ? " ⚠️ يحتوي على أطباق — سيُرفض" : ""}`
      )
    )
      return;
    setError(null);
    startTransition(async () => {
      const result = await deleteCategory(category.id);
      if (!result.success) setError(result.error);
    });
  }

  return (
    <div
      className={`p-4 transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{category.name}</span>
            <span className="text-xs bg-background text-muted px-2 py-0.5 rounded-full">
              ترتيب {category.displayOrder}
            </span>
            <span className="text-xs bg-accent-light text-accent-dark px-2 py-0.5 rounded-full">
              {category.itemsCount} طبق
            </span>
          </div>
          <div className="text-xs text-muted mt-1" dir="ltr">
            /{category.slug}
          </div>
          {category.description && (
            <div className="text-xs text-muted mt-1 line-clamp-1">
              {category.description}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/categories/${category.id}/edit`}
            className="text-xs px-3 py-1.5 rounded-full border border-accent text-accent hover:bg-accent hover:text-white transition-colors"
          >
            ✎ تعديل
          </Link>
          {isAdmin && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="text-xs px-3 py-1.5 rounded-full border border-red-500 text-red-700 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-40"
            >
              🗑 حذف
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
    </div>
  );
}