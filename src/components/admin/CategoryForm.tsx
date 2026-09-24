"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField, inputClasses } from "@/components/ui/FormField";
import {
  createCategory,
  updateCategory,
} from "@/actions/admin-categories";

type InitialData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
};

type Props = { initialData?: InitialData };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function CategoryForm({ initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const [formData, setFormData] = useState<InitialData>({
    id: initialData?.id,
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    displayOrder: initialData?.displayOrder ?? 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: isEdit ? prev.slug : slugify(name),
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      displayOrder: formData.displayOrder,
    };

    const result = isEdit
      ? await updateCategory(formData.id!, payload)
      : await createCategory(payload);

    if (!result.success) {
      setError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
      setIsSubmitting(false);
      return;
    }

    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-2xl p-6 md:p-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="اسم التصنيف" required>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleNameChange}
            required
            placeholder="مثال: أطباق رئيسية"
            className={inputClasses}
          />
          {fieldErrors.name && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.name[0]}</p>
          )}
        </FormField>

        <FormField label="المعرّف (Slug)" required>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            placeholder="main-courses"
            dir="ltr"
            className={inputClasses}
          />
          {fieldErrors.slug && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.slug[0]}</p>
          )}
        </FormField>

        <FormField label="ترتيب العرض" required>
          <input
            type="number"
            name="displayOrder"
            value={formData.displayOrder}
            onChange={handleChange}
            required
            min="0"
            step="1"
            dir="ltr"
            className={inputClasses}
          />
          <p className="text-xs text-muted mt-1">
            الرقم الأصغر يظهر أولاً
          </p>
        </FormField>

        <div className="md:col-span-2">
          <FormField label="الوصف (اختياري)">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              placeholder="وصف موجز..."
              className={inputClasses}
            />
            {fieldErrors.description && (
              <p className="text-xs text-red-600 mt-1">
                {fieldErrors.description[0]}
              </p>
            )}
          </FormField>
        </div>
      </div>

      {error && !Object.keys(fieldErrors).length && (
        <div className="mt-6 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
          {error}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          className="px-6 py-3 rounded-full border border-border hover:border-foreground transition-colors"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "جاري الحفظ..."
            : isEdit
              ? "حفظ التعديلات"
              : "إضافة التصنيف"}
        </button>
      </div>
    </form>
  );
}