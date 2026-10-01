"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  updateReservationStatus,
  deleteReservation,
} from "@/actions/admin-reservations";

type Reservation = {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestsCount: number;
  reservationDate: Date;
  durationMinutes: number;
  status: string;
  notes: string | null;
  table: { number: number; capacity: number };
};

type Props = {
  reservation: Reservation;
  isAdmin: boolean;
  locale: string;
};

export function ReservationRow({ reservation, isAdmin, locale }: Props) {
  const t = useTranslations("Admin.reservations");
  const tOverview = useTranslations("Admin.overview");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const date = new Date(reservation.reservationDate);

  function handleStatus(
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  ) {
    setError(null);
    startTransition(async () => {
      const result = await updateReservationStatus(reservation.id, status);
      if (!result.success) setError(result.error);
    });
  }

  function handleDelete() {
    if (!confirm(t("deleteConfirm", { name: reservation.guestName }))) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteReservation(reservation.id);
      if (!result.success) setError(result.error);
    });
  }

  // ─── تنسيق التاريخ حسب اللغة ───
  const dateLocale = locale === "ar" ? "ar-EG" : locale;

  return (
    <div
      className={`p-4 transition-opacity ${
        isPending ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* معلومات الضيف */}
        <div className="flex-1 min-w-50">
          <div className="font-medium">{reservation.guestName}</div>
          <div className="text-xs text-muted mt-1" dir="ltr">
            {reservation.guestEmail}
          </div>
          <div className="text-xs text-muted" dir="ltr">
            {reservation.guestPhone}
          </div>
        </div>

        {/* الوقت */}
        <div className="text-sm min-w-35">
          <div className="font-medium">
            {date.toLocaleDateString(dateLocale, {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
          <div className="text-xs text-muted">
            {date.toLocaleTimeString(dateLocale, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {/* الحجم + الطاولة */}
        <div className="text-sm min-w-25">
          <div className="font-medium">
            {t("guests", { count: reservation.guestsCount })}
          </div>
          <div className="text-xs text-muted">
            {t("table", { number: reservation.table.number })}
          </div>
        </div>

        <StatusBadge
          status={reservation.status}
          labels={{
            PENDING: tOverview("statusPending"),
            CONFIRMED: tOverview("statusConfirmed"),
            CANCELLED: tOverview("statusCancelled"),
            COMPLETED: tOverview("statusCompleted"),
          }}
        />

        {/* الأزرار */}
        <div className="flex flex-wrap gap-2">
          {reservation.status === "PENDING" && (
            <>
              <ActionButton
                label={t("confirm")}
                variant="success"
                onClick={() => handleStatus("CONFIRMED")}
                disabled={isPending}
              />
              <ActionButton
                label={t("cancel")}
                variant="danger"
                onClick={() => handleStatus("CANCELLED")}
                disabled={isPending}
              />
            </>
          )}
          {reservation.status === "CONFIRMED" && (
            <>
              <ActionButton
                label={t("complete")}
                variant="primary"
                onClick={() => handleStatus("COMPLETED")}
                disabled={isPending}
              />
              <ActionButton
                label={t("cancel")}
                variant="danger"
                onClick={() => handleStatus("CANCELLED")}
                disabled={isPending}
              />
            </>
          )}
          {(reservation.status === "CANCELLED" ||
            reservation.status === "COMPLETED") &&
            isAdmin && (
              <ActionButton
                label={t("delete")}
                variant="danger"
                onClick={handleDelete}
                disabled={isPending}
              />
            )}
        </div>
      </div>

      {/* ملاحظات إن وُجدت */}
      {reservation.notes && (
        <div className="mt-3 text-xs text-muted bg-background/50 rounded p-2">
          📝 {reservation.notes}
        </div>
      )}

      {error && (
        <div className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
    </div>
  );
}

// ─── مساعدات ───
function ActionButton({
  label,
  variant,
  onClick,
  disabled,
}: {
  label: string;
  variant: "primary" | "success" | "danger";
  onClick: () => void;
  disabled: boolean;
}) {
  const styles: Record<string, string> = {
    primary: "border-accent text-accent hover:bg-accent hover:text-white",
    success:
      "border-green-600 text-green-700 hover:bg-green-600 hover:text-white",
    danger: "border-red-500 text-red-700 hover:bg-red-500 hover:text-white",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]}`}
    >
      {label}
    </button>
  );
}

function StatusBadge({
  status,
  labels,
}: {
  status: string;
  labels: Record<string, string>;
}) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-50 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-green-50 text-green-800 border-green-200",
    CANCELLED: "bg-red-50 text-red-800 border-red-200",
    COMPLETED: "bg-blue-50 text-blue-800 border-blue-200",
  };

  return (
    <span
      className={`text-xs px-3 py-1 rounded-full border shrink-0 ${
        styles[status] ?? "bg-gray-50 text-gray-800 border-gray-200"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}