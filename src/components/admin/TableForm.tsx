"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useScrollToFirstError } from "@/lib/hooks/use-scroll-to-first-error";
import { useRouter } from "@/i18n/navigation";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { createTable, updateTable } from "@/actions/admin-tables";
import { Form } from "@/components/ui/Form";

type InitialData = {
  id?: string;
  number: number;
  capacity: number;
  location: string;
  isActive: boolean;
};

type Props = { initialData?: InitialData };

export function TableForm({ initialData }: Props) {
  const router = useRouter();
  const t = useTranslations("Admin.tableForm");
  const isEdit = !!initialData?.id;

  const [formData, setFormData] = useState<InitialData>({
    id: initialData?.id,
    number: initialData?.number ?? 1,
    capacity: initialData?.capacity ?? 2,
    location: initialData?.location ?? "",
    isActive: initialData?.isActive ?? true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  useScrollToFirstError(
    Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined
  );
  const [, startTransition] = useTransition();

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload = {
      number: formData.number,
      capacity: formData.capacity,
      location: formData.location,
      isActive: formData.isActive,
    };

    const result = isEdit
      ? await updateTable(formData.id!, payload)
      : await createTable(payload);

    if (!result.success) {
      setError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
      setIsSubmitting(false);
      return;
    }

    startTransition(() => {
      router.push("/admin/tables");
      router.refresh();
    });
  }

  return (
    <Form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-2xl p-6 md:p-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label={t("numberLabel")} required>
          <input
            type="number"
            name="number"
            value={formData.number}
            onChange={handleChange}
            required
            min="1"
            step="1"
            dir="ltr"
            className={inputClasses}
          />
          {fieldErrors.number && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.number[0]}</p>
          )}
        </FormField>

        <FormField label={t("capacityLabel")} required>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
            min="1"
            step="1"
            dir="ltr"
            className={inputClasses}
          />
          {fieldErrors.capacity && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.capacity[0]}</p>
          )}
        </FormField>

        <FormField label={t("locationLabel")}>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={inputClasses}
          >
            <option value="">{t("locationNone")}</option>
            <option value="Indoor">{t("locationIndoor")}</option>
            <option value="Window">{t("locationWindow")}</option>
            <option value="Outdoor">{t("locationOutdoor")}</option>
            <option value="VIP">{t("locationVip")}</option>
          </select>
          {fieldErrors.location && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.location[0]}</p>
          )}
        </FormField>

        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer pb-3">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 accent-[--color-accent]"
            />
            <span className="text-sm font-medium">{t("isActiveLabel")}</span>
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
          onClick={() => router.push("/admin/tables")}
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