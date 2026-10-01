"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { toggleTableActive, deleteTable } from "@/actions/admin-tables";

type Table = {
  id: string;
  number: number;
  capacity: number;
  location: string | null;
  isActive: boolean;
  reservationsCount: number;
};

export function TableRow({
  table,
  isAdmin,
}: {
  table: Table;
  isAdmin: boolean;
}) {
  const t = useTranslations("Admin.tables");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // ─── ترجمة اسم الموقع ───
  function getLocationLabel(location: string | null): string | null {
    if (!location) return null;
    const map: Record<string, string> = {
      Indoor: t("locationIndoor"),
      Window: t("locationWindow"),
      Outdoor: t("locationOutdoor"),
      VIP: t("locationVip"),
    };
    return map[location] ?? location;
  }

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = await toggleTableActive(table.id, !table.isActive);
      if (!result.success) setError(result.error);
    });
  }

  function handleDelete() {
    const warning = table.reservationsCount > 0 ? t("deleteWarning") : "";
    if (!confirm(t("deleteConfirm", { number: table.number }) + warning)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteTable(table.id);
      if (!result.success) setError(result.error);
    });
  }

  const locationLabel = getLocationLabel(table.location);
  const seatLabel = table.capacity === 1 ? t("seatSingle") : t("seatPlural");

  return (
    <div
      className={`p-4 transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="text-lg font-bold text-accent-dark min-w-15" dir="ltr">
          #{table.number}
        </div>

        <div className="flex-1 min-w-50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">
              {table.capacity} {seatLabel}
            </span>
            {locationLabel && (
              <span className="text-xs bg-accent-light text-accent-dark px-2 py-0.5 rounded-full">
                {locationLabel}
              </span>
            )}
            {table.reservationsCount > 0 && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                {t("reservationsBadge", { count: table.reservationsCount })}
              </span>
            )}
          </div>
        </div>

        <span
          className={`text-xs px-3 py-1 rounded-full border ${
            table.isActive
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {table.isActive ? t("active") : t("inactive")}
        </span>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
          >
            {table.isActive ? t("disable") : t("enable")}
          </button>

          <Link
            href={`/admin/tables/${table.id}/edit`}
            className="text-xs px-3 py-1.5 rounded-full border border-accent text-accent hover:bg-accent hover:text-white transition-colors"
          >
            {t("edit")}
          </Link>

          {isAdmin && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="text-xs px-3 py-1.5 rounded-full border border-red-500 text-red-700 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-40"
            >
              {t("delete")}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
    </div>
  );
}