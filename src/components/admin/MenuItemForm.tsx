"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField, inputClasses } from "@/components/ui/FormField";
import {
  createMenuItem,
  updateMenuItem,
  type MenuItemActionResult,
} from "@/actions/admin-menu";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type InitialData = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  isAvailable: boolean;
  isFeatured: boolean;
};

type Props = {
  categories: Category[];
  initialData?: InitialData;
};

// ─── توليد slug من الاسم (للإنجليزية فقط) ───
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function MenuItemForm({ categories, initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const [formData, setFormData] = useState<InitialData>({
    id: initialData?.id,
    name: initialData?.name ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price ?? 0,
    imageUrl: initialData?.imageUrl ?? "",
    categoryId: initialData?.categoryId ?? categories[0]?.id ?? "",
    isAvailable: initialData?.isAvailable ?? true,
    isFeatured: initialData?.isFeatured ?? false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // توليد slug تلقائياً عند تغيير الاسم (فقط في وضع الإضافة)
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
      price: formData.price,
      imageUrl: formData.imageUrl,
      categoryId: formData.categoryId,
      isAvailable: formData.isAvailable,
      isFeatured: formData.isFeatured,
    };

    const result: MenuItemActionResult = isEdit
      ? await updateMenuItem(formData.id!, payload)
      : await createMenuItem(payload);

    if (!result.success) {
      setError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
      setIsSubmitting(false);
      return;
    }

    router.push("/admin/menu");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-2xl p-6 md:p-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* الاسم */}
        <FormField label="اسم الطبق" required>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleNameChange}
            required
            placeholder="مثال: حمص بالطحينة"
            className={inputClasses}
          />
          {fieldErrors.name && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.name[0]}</p>
          )}
        </FormField>

        {/* Slug */}
        <FormField label="المعرّف (Slug)" required>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            placeholder="hummus"
            dir="ltr"
            className={inputClasses}
          />
          <p className="text-xs text-muted mt-1">
            حروف إنجليزية صغيرة وأرقام وشرطات فقط
          </p>
          {fieldErrors.slug && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.slug[0]}</p>
          )}
        </FormField>

        {/* السعر */}
        <FormField label="السعر (ج.م)" required>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.5"
            placeholder="55"
            dir="ltr"
            className={inputClasses}
          />
          {fieldErrors.price && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.price[0]}</p>
          )}
        </FormField>

        {/* التصنيف */}
        <FormField label="التصنيف" required>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            className={inputClasses}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {fieldErrors.categoryId && (
            <p className="text-xs text-red-600 mt-1">
              {fieldErrors.categoryId[0]}
            </p>
          )}
        </FormField>

        {/* رابط الصورة */}
        <div className="md:col-span-2">
          <FormField label="رابط الصورة (اختياري)">
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              dir="ltr"
              className={inputClasses}
            />
            {fieldErrors.imageUrl && (
              <p className="text-xs text-red-600 mt-1">
                {fieldErrors.imageUrl[0]}
              </p>
            )}
          </FormField>
        </div>

        {/* الوصف */}
        <div className="md:col-span-2">
          <FormField label="الوصف (اختياري)">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="وصف موجز للطبق..."
              className={inputClasses}
            />
            {fieldErrors.description && (
              <p className="text-xs text-red-600 mt-1">
                {fieldErrors.description[0]}
              </p>
            )}
          </FormField>
        </div>

        {/* الخيارات */}
        <div className="md:col-span-2 flex flex-wrap gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="w-4 h-4 accent-[--color-accent]"
            />
            <span className="text-sm font-medium">متاح للعرض في القائمة</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="w-4 h-4 accent-[--color-accent]"
            />
            <span className="text-sm font-medium">⭐ طبق مميز (يظهر في الصفحة الرئيسية)</span>
          </label>
        </div>
      </div>

      {/* خطأ عام */}
      {error && !Object.keys(fieldErrors).length && (
        <div className="mt-6 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
          {error}
        </div>
      )}

      {/* الأزرار */}
      <div className="mt-8 flex flex-wrap gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.push("/admin/menu")}
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
              : "إضافة الطبق"}
        </button>
      </div>
    </form>
  );
}