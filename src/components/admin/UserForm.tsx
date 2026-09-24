"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { createUser, updateUser } from "@/actions/admin-users";

type InitialData = {
  id?: string;
  email: string;
  name: string;
  role: "ADMIN" | "STAFF";
  isActive: boolean;
};

type Props = {
  initialData?: InitialData;
  isSelf?: boolean; // لتعديل حسابك الخاص
};

export function UserForm({ initialData, isSelf }: Props) {
  const router = useRouter();
  const isEdit = !!initialData?.id;

  const [formData, setFormData] = useState({
    email: initialData?.email ?? "",
    name: initialData?.name ?? "",
    role: initialData?.role ?? ("STAFF" as "ADMIN" | "STAFF"),
    isActive: initialData?.isActive ?? true,
    password: "",
    newPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload = isEdit
      ? {
          name: formData.name,
          role: formData.role,
          isActive: formData.isActive,
          newPassword: formData.newPassword,
        }
      : {
          email: formData.email,
          name: formData.name,
          password: formData.password,
          role: formData.role,
          isActive: formData.isActive,
        };

    const result = isEdit
      ? await updateUser(initialData!.id!, payload)
      : await createUser(payload);

    if (!result.success) {
      setError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
      setIsSubmitting(false);
      return;
    }

    router.push("/admin/users");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-2xl p-6 md:p-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="البريد الإلكتروني" required={!isEdit}>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required={!isEdit}
            disabled={isEdit}
            placeholder="staff@lumiere.com"
            dir="ltr"
            className={`${inputClasses} ${isEdit ? "opacity-60 cursor-not-allowed" : ""}`}
          />
          {isEdit && (
            <p className="text-xs text-muted mt-1">لا يمكن تغيير البريد</p>
          )}
          {fieldErrors.email && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.email[0]}</p>
          )}
        </FormField>

        <FormField label="الاسم الكامل" required>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="مثال: محمد أحمد"
            className={inputClasses}
          />
          {fieldErrors.name && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.name[0]}</p>
          )}
        </FormField>

        <FormField label="الدور" required>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={inputClasses}
            disabled={isSelf}
          >
            <option value="STAFF">موظف (صلاحيات محدودة)</option>
            <option value="ADMIN">مدير (صلاحيات كاملة)</option>
          </select>
          {isSelf && (
            <p className="text-xs text-muted mt-1">
              لا يمكنك تغيير دورك الخاص
            </p>
          )}
        </FormField>

        {!isEdit && (
          <FormField label="كلمة السر" required>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              placeholder="8 أحرف على الأقل"
              dir="ltr"
              className={inputClasses}
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-600 mt-1">
                {fieldErrors.password[0]}
              </p>
            )}
          </FormField>
        )}

        {isEdit && (
          <FormField label="كلمة سر جديدة (اختياري)">
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              minLength={8}
              placeholder="اترك فارغاً لعدم التغيير"
              dir="ltr"
              className={inputClasses}
            />
            {fieldErrors.newPassword && (
              <p className="text-xs text-red-600 mt-1">
                {fieldErrors.newPassword[0]}
              </p>
            )}
          </FormField>
        )}

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              disabled={isSelf}
              className="w-4 h-4 accent-[--color-accent]"
            />
            <span className="text-sm font-medium">
              حساب نشط (يستطيع الدخول)
            </span>
          </label>
          {isSelf && (
            <p className="text-xs text-muted mt-1">
              لا يمكنك تعطيل حسابك الخاص
            </p>
          )}
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
          onClick={() => router.push("/admin/users")}
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
              : "إضافة الموظف"}
        </button>
      </div>
    </form>
  );
}