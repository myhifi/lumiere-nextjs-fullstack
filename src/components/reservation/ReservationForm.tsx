"use client";

import { useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { FormField, inputClasses } from "@/components/ui/FormField";
import {
  createReservation,
  type CreateReservationResult,
} from "@/actions/reservation";
import { Link } from "@/i18n/navigation";
import { Form } from "@/components/ui/Form";

// ─── توليد خيارات الوقت (12:00 → 22:00 كل 30 دقيقة) ───
const TIME_SLOTS = Array.from({ length: 21 }, (_, i) => {
  const totalMinutes = 12 * 60 + i * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  return { value, label: value };
});

const TODAY = new Date().toISOString().split("T")[0];

type Result =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; tableNumber: number; reservationId: string }
  | { kind: "error"; message: string; fieldErrors?: Record<string, string[]> };

export function ReservationForm() {
  const t = useTranslations("Reserve");

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

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
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
        <h2 className="text-2xl font-bold mb-3">{t("success.title")}</h2>
        <p className="text-muted mb-6">
          {t("success.message", { tableNumber: result.tableNumber })}
        </p>
        <p className="text-xs text-muted mb-8">
          {t("success.reservationIdLabel")}{" "}
          <code className="bg-background px-2 py-1 rounded">
            {result.reservationId.slice(0, 12)}...
          </code>
        </p>
        <Link
          href="/menu"
          className="inline-block bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors"
        >
          {t("success.browseMenu")}
        </Link>
      </div>
    );
  }

  // ─── النموذج ───
  return (
    <Form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField label={t("form.guestName")} required>
          <input
            type="text"
            name="guestName"
            value={formData.guestName}
            onChange={handleChange}
            required
            placeholder={t("form.guestNamePlaceholder")}
            className={inputClasses}
          />
          {result.kind === "error" && result.fieldErrors?.guestName && (
            <p className="text-xs text-red-600 mt-1">
              {result.fieldErrors.guestName[0]}
            </p>
          )}
        </FormField>

        <FormField label={t("form.guestEmail")} required>
          <input
            type="email"
            name="guestEmail"
            value={formData.guestEmail}
            onChange={handleChange}
            required
            placeholder={t("form.guestEmailPlaceholder")}
            className={inputClasses}
            dir="ltr"
          />
          {result.kind === "error" && result.fieldErrors?.guestEmail && (
            <p className="text-xs text-red-600 mt-1">
              {result.fieldErrors.guestEmail[0]}
            </p>
          )}
        </FormField>

        <FormField label={t("form.guestPhone")} required>
          <input
            type="tel"
            name="guestPhone"
            value={formData.guestPhone}
            onChange={handleChange}
            required
            placeholder={t("form.guestPhonePlaceholder")}
            className={inputClasses}
            dir="ltr"
          />
          {result.kind === "error" && result.fieldErrors?.guestPhone && (
            <p className="text-xs text-red-600 mt-1">
              {result.fieldErrors.guestPhone[0]}
            </p>
          )}
        </FormField>

        <FormField label={t("form.guestsCount")} required>
          <select
            name="guestsCount"
            value={formData.guestsCount}
            onChange={handleChange}
            className={inputClasses}
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {t("form.guestCountFormat", { count: n })}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label={t("form.date")} required>
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

        <FormField label={t("form.time")} required>
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
          <FormField label={t("form.notes")}>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder={t("form.notesPlaceholder")}
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
        {result.kind === "submitting" ? t("form.submitting") : t("form.submit")}
      </button>
    </Form>
  );
}