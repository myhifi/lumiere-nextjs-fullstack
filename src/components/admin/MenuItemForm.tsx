// MenuItemForm.tsx
"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormField, inputClasses } from "@/components/ui/FormField";
import {
  createMenuItem,
  updateMenuItem,
  type MenuItemActionResult,
} from "@/actions/admin-menu";
import { Form } from "@/components/ui/Form";

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
  const t = useTranslations("Admin.menuForm");
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
  const [, startTransition] = useTransition();

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: isEdit ? prev.slug : slugify(name),
    }));
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
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
    startTransition(() => {
      router.push("/admin/menu");
      router.refresh();
    });
  }

  return (
    <Form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-2xl p-6 md:p-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label={t("nameLabel")} required>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleNameChange}
            required
            placeholder={t("namePlaceholder")}
            className={inputClasses}
          />
          {fieldErrors.name && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.name[0]}</p>
          )}
        </FormField>

        <FormField label={t("slugLabel")} required>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            placeholder={t("slugPlaceholder")}
            dir="ltr"
            className={inputClasses}
          />
          <p className="text-xs text-muted mt-1">{t("slugHint")}</p>
          {fieldErrors.slug && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.slug[0]}</p>
          )}
        </FormField>

        <FormField label={t("priceLabel")} required>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.5"
            placeholder={t("pricePlaceholder")}
            dir="ltr"
            className={inputClasses}
          />
          {fieldErrors.price && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.price[0]}</p>
          )}
        </FormField>

        <FormField label={t("categoryLabel")} required>
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

        <div className="md:col-span-2">
          <FormField label={t("imageUrlLabel")}>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder={t("imageUrlPlaceholder")}
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

        <div className="md:col-span-2">
          <FormField label={t("descriptionLabel")}>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder={t("descriptionPlaceholder")}
              className={inputClasses}
            />
            {fieldErrors.description && (
              <p className="text-xs text-red-600 mt-1">
                {fieldErrors.description[0]}
              </p>
            )}
          </FormField>
        </div>

        <div className="md:col-span-2 flex flex-wrap gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
              className="w-4 h-4 accent-[--color-accent]"
            />
            <span className="text-sm font-medium">{t("isAvailableLabel")}</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="w-4 h-4 accent-[--color-accent]"
            />
            <span className="text-sm font-medium">{t("isFeaturedLabel")}</span>
          </label>
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
          onClick={() => router.push("/admin/menu")}
          className="px-6 py-3 rounded-full border border-border hover:border-foreground transition-colors"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t("saving") : isEdit ? t("save") : t("create")}
        </button>
      </div>
    </Form>
  );
}