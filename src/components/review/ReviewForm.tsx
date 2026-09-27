"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import Link from "next/link"; // <-- إضافة جديدة
import { FormField, inputClasses } from "@/components/ui/FormField";
import { StarRatingInput } from "@/components/ui/StarRatingInput";
import { createReview } from "@/actions/reviews";

// ─── حالة النتيجة (Discriminated Union) ───
type Result =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | {
      kind: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

export function ReviewForm() {
  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    rating: 0,
    comment: "",
  });

  const [result, setResult] = useState<Result>({ kind: "idle" });

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleRatingChange(rating: number) {
    setFormData((prev) => ({ ...prev, rating }));
  }

  function resetForm() {
    setFormData({
      guestName: "",
      guestEmail: "",
      rating: 0,
      comment: "",
    });
    setResult({ kind: "idle" });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (formData.rating === 0) {
      setResult({
        kind: "error",
        message: "يرجى اختيار تقييم بالنجوم",
      });
      return;
    }

    setResult({ kind: "submitting" });

    const response = await createReview(formData);

    if (response.success) {
      setResult({ kind: "success" });
      return;
    }

    setResult({
      kind: "error",
      message: response.error,
      fieldErrors: response.fieldErrors,
    });
  }

  // ─── شاشة النجاح ───
  if (result.kind === "success") {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 md:p-12 text-center shadow-sm">
        <div className="text-6xl mb-4">⭐</div>
        <h2 className="text-2xl font-bold mb-3">شكراً لتقييمك!</h2>
        <p className="text-muted mb-6">
          تم استلام تقييمك بنجاح. سيتم مراجعته من فريقنا ونشره قريباً.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={resetForm}
            className="inline-block bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors"
          >
            إرسال تقييم آخر
          </button>
          <Link
            href="/"
            className="inline-block bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-white font-medium px-8 py-3 rounded-full transition-colors"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  // ─── النموذج ───
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm"
    >
      <div className="space-y-6">
        {/* ─── النجوم ─── */}
        <div>
          <label className="block text-sm font-medium mb-3">
            تقييمك العام <span className="text-accent">*</span>
          </label>
          <StarRatingInput
            value={formData.rating}
            onChange={handleRatingChange}
            size={36}
          />
        </div>

        {/* ─── الاسم ─── */}
        <FormField label="الاسم" required>
          <input
            type="text"
            name="guestName"
            value={formData.guestName}
            onChange={handleChange}
            required
            placeholder="اسمك الكامل"
            className={inputClasses}
          />
          {result.kind === "error" && result.fieldErrors?.guestName && (
            <p className="text-xs text-red-600 mt-1">
              {result.fieldErrors.guestName[0]}
            </p>
          )}
        </FormField>

        {/* ─── البريد (اختياري) ─── */}
        <FormField label="البريد الإلكتروني (اختياري)">
          <input
            type="email"
            name="guestEmail"
            value={formData.guestEmail}
            onChange={handleChange}
            placeholder="example@email.com"
            className={inputClasses}
            dir="ltr"
          />
          <p className="text-xs text-muted mt-1">
            لن يُنشر بريدك — للتواصل فقط إن احتجنا.
          </p>
          {result.kind === "error" && result.fieldErrors?.guestEmail && (
            <p className="text-xs text-red-600 mt-1">
              {result.fieldErrors.guestEmail[0]}
            </p>
          )}
        </FormField>

        {/* ─── التعليق ─── */}
        <FormField label="تجربتك" required>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            required
            rows={5}
            minLength={10}
            maxLength={500}
            placeholder="شاركنا تجربتك في Lumière — الأطباق، الخدمة، الأجواء..."
            className={inputClasses}
          />
          <div className="flex justify-between text-xs text-muted mt-1">
            <span>10 أحرف على الأقل</span>
            <span>{formData.comment.length} / 500</span>
          </div>
          {result.kind === "error" && result.fieldErrors?.comment && (
            <p className="text-xs text-red-600 mt-1">
              {result.fieldErrors.comment[0]}
            </p>
          )}
        </FormField>
      </div>

      {/* ─── خطأ عام ─── */}
      {result.kind === "error" && !result.fieldErrors && (
        <div className="mt-5 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
          {result.message}
        </div>
      )}

      {/* ─── الزر ─── */}
      <button
        type="submit"
        disabled={result.kind === "submitting"}
        className="mt-6 w-full bg-accent hover:bg-accent-dark text-white font-medium py-3 px-8 rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {result.kind === "submitting" ? "جاري الإرسال..." : "إرسال التقييم"}
      </button>
    </form>
  );
}