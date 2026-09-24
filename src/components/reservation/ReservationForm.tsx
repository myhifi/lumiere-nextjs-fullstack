"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { FormField, inputClasses } from "@/components/ui/FormField";
import {
  createReservation,
  type CreateReservationResult,
} from "@/actions/reservation";

// ─── توليد خيارات الوقت (12:00 → 22:00 كل 30 دقيقة) ───
const TIME_SLOTS = Array.from({ length: 21 }, (_, i) => {
  const totalMinutes = 12 * 60 + i * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return { value, label: value };
});

const TODAY = new Date().toISOString().split("T")[0];

// ─── حالة النتيجة ───
type Result =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; tableNumber: number; reservationId: string }
  | { kind: "error"; message: string; fieldErrors?: Record<string, string[]> };

export function ReservationForm() {
  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    guestsCount: 2,
    date: TODAY,
    time: "20:00",
    notes: "",
  });

  const [result, setResult] = useState<Result>({ kind: "idle" });

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setResult({ kind: "submitting" });

    const response: CreateReservationResult = await createReservation(formData);

    if (response.success) {
      setResult({
        kind: "success",
        tableNumber: response.tableNumber,
        reservationId: response.reservationId,
      });
      return;
    }

    setResult({
      kind: "error",
      message: response.error,
      fieldErrors: response.fieldErrors,
    });
  }

  // ─── عرض شاشة النجاح ───
  if (result.kind === "success") {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 md:p-12 text-center shadow-sm">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold mb-3">تم استلام حجزك!</h2>
        <p className="text-muted mb-6">
          تم تخصيص <span className="text-accent font-bold">طاولة رقم {result.tableNumber}</span> لك.
          سنراجع حجزك ونرسل التأكيد عبر البريد الإلكتروني قريباً.
        </p>
        <p className="text-xs text-muted mb-8">
          رقم الحجز: <code className="bg-background px-2 py-1 rounded">{result.reservationId.slice(0, 12)}...</code>
        </p>
        <a
          href="/menu"
          className="inline-block bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors"
        >
          تصفح القائمة
        </a>
      </div>
    );
  }

  // ─── النموذج ───
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label="الاسم الكامل" required>
          <input
            type="text"
            name="guestName"
            value={formData.guestName}
            onChange={handleChange}
            required
            placeholder="مثال: أحمد محمد"
            className={inputClasses}
          />
          {result.kind === "error" && result.fieldErrors?.guestName && (
            <p className="text-xs text-red-600 mt-1">
              {result.fieldErrors.guestName[0]}
            </p>
          )}
        </FormField>

        <FormField label="البريد الإلكتروني" required>
          <input
            type="email"
            name="guestEmail"
            value={formData.guestEmail}
            onChange={handleChange}
            required
            placeholder="example@email.com"
            className={inputClasses}
            dir="ltr"
          />
          {result.kind === "error" && result.fieldErrors?.guestEmail && (
            <p className="text-xs text-red-600 mt-1">
              {result.fieldErrors.guestEmail[0]}
            </p>
          )}
        </FormField>

        <FormField label="رقم الهاتف" required>
          <input
            type="tel"
            name="guestPhone"
            value={formData.guestPhone}
            onChange={handleChange}
            required
            placeholder="+20 1XX XXX XXXX"
            className={inputClasses}
            dir="ltr"
          />
          {result.kind === "error" && result.fieldErrors?.guestPhone && (
            <p className="text-xs text-red-600 mt-1">
              {result.fieldErrors.guestPhone[0]}
            </p>
          )}
        </FormField>

        <FormField label="عدد الأشخاص" required>
          <select
            name="guestsCount"
            value={formData.guestsCount}
            onChange={handleChange}
            className={inputClasses}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "شخص" : n === 2 ? "شخصان" : "أشخاص"}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="التاريخ" required>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={TODAY}
            required
            className={inputClasses}
          />
          {result.kind === "error" && result.fieldErrors?.date && (
            <p className="text-xs text-red-600 mt-1">
              {result.fieldErrors.date[0]}
            </p>
          )}
        </FormField>

        <FormField label="الوقت" required>
          <select
            name="time"
            value={formData.time}
            onChange={handleChange}
            className={inputClasses}
          >
            {TIME_SLOTS.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
          {result.kind === "error" && result.fieldErrors?.time && (
            <p className="text-xs text-red-600 mt-1">
              {result.fieldErrors.time[0]}
            </p>
          )}
        </FormField>

        <div className="md:col-span-2">
          <FormField label="ملاحظات إضافية">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="مناسبة خاصة، حساسية طعام، إلخ (اختياري)"
              className={inputClasses}
            />
          </FormField>
        </div>
      </div>

      {result.kind === "error" && !result.fieldErrors && (
        <div className="mt-6 p-4 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
          {result.message}
        </div>
      )}

      <button
        type="submit"
        disabled={result.kind === "submitting"}
        className="mt-6 w-full bg-accent hover:bg-accent-dark text-white font-medium py-3 px-8 rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {result.kind === "submitting" ? "جاري الحجز..." : "تأكيد الحجز"}
      </button>
    </form>
  );
}