"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleTableActive, deleteTable } from "@/actions/admin-tables";

type Table = {
  id: string;
  number: number;
  capacity: number;
  location: string | null;
  isActive: boolean;
  reservationsCount: number;
};

const LOCATION_LABELS: Record<string, string> = {
  Indoor: "داخلي",
  Window: "بجانب النافذة",
  Outdoor: "خارجي",
  VIP: "VIP",
};

export function TableRow({
  table,
  isAdmin,
}: {
  table: Table;
  isAdmin: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = await toggleTableActive(table.id, !table.isActive);
      if (!result.success) setError(result.error);
    });
  }

  function handleDelete() {
    if (
      !confirm(
        `حذف الطاولة رقم ${table.number}؟${table.reservationsCount > 0 ? " ⚠️ لها حجوزات — سيُرفض" : ""}`
      )
    )
      return;
    setError(null);
    startTransition(async () => {
      const result = await deleteTable(table.id);
      if (!result.success) setError(result.error);
    });
  }

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
              {table.capacity} {table.capacity === 1 ? "كرسي" : "كراسي"}
            </span>
            {table.location && (
              <span className="text-xs bg-accent-light text-accent-dark px-2 py-0.5 rounded-full">
                {LOCATION_LABELS[table.location] ?? table.location}
              </span>
            )}
            {table.reservationsCount > 0 && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                {table.reservationsCount} حجز
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
          {table.isActive ? "نشطة" : "معطّلة"}
        </span>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleToggle}
            disabled={isPending}
            className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
          >
            {table.isActive ? "⊘ تعطيل" : "✓ تفعيل"}
          </button>

          <Link
            href={`/admin/tables/${table.id}/edit`}
            className="text-xs px-3 py-1.5 rounded-full border border-accent text-accent hover:bg-accent hover:text-white transition-colors"
          >
            ✎ تعديل
          </Link>

          {isAdmin && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="text-xs px-3 py-1.5 rounded-full border border-red-500 text-red-700 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-40"
            >
              🗑 حذف
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