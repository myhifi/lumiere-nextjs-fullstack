import { type ReactNode } from "react";

// فئات الإدخال المشتركة (تُستخدم في كل الحقول)
export const inputClasses =
  "w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all";

// غلاف موحّد لكل حقل: عنوان + علامة إلزامي + المحتوى
export function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-2">
        {label}
        {required && <span className="text-accent mr-1">*</span>}
      </span>
      {children}
    </label>
  );
}