// src/components/admin/OrderRow.tsx
"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateOrderStatus } from "@/actions/admin-orders";

type Order = {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  deliveryAddress: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  items: {
    quantity: number;
    menuItem: { name: string };
  }[];
};

type Props = {
  order: Order;
  locale: string;
};

export function OrderRow({ order, locale }: Props) {
  const t = useTranslations("Admin.orders");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleStatusChange(newStatus: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(
        order.id,
        newStatus as "PAID" | "PREPARING" | "DELIVERED" | "CANCELLED"
      );
      if (!result.success) setError(result.error);
    });
  }

  const dateLocale = locale === "ar" ? "ar-EG" : locale;
  const formattedDate = new Intl.DateTimeFormat(dateLocale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(order.createdAt));

  // Type-safe mapping for translations
  const statusLabels: Record<string, string> = {
    PENDING: t("statusPending"),
    PAID: t("statusPaid"),
    PREPARING: t("statusPreparing"),
    DELIVERED: t("statusDelivered"),
    CANCELLED: t("statusCancelled"),
  };

  return (
    <div className={`p-4 transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}>
      <div className="flex flex-wrap items-start gap-4">
        
        {/* Customer & Date */}
        <div className="flex-1 min-w-50">
          <div className="font-medium">{order.guestName}</div>
          <div className="text-xs text-muted mt-1">{formattedDate}</div>
          <p className="text-sm text-gray-500">{order.guestEmail}</p>
          <div className="text-xs text-muted mt-1" dir="ltr">{order.guestPhone}</div>
          <div className="text-xs text-muted mt-1 line-clamp-1">{order.deliveryAddress}</div>
        </div>

        {/* Items Summary */}
        <div className="flex-1 min-w-40">
          <div className="text-sm font-medium mb-1">{t("details")}:</div>
          <ul className="text-xs text-muted space-y-1">
            {order.items.map((item, idx) => (
              <li key={idx}>
                {item.quantity} × {item.menuItem.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Total */}
        <div className="text-lg font-bold text-accent-dark min-w-25">
          {order.totalAmount} <span className="text-xs font-normal">AED</span>
        </div>

        {/* Status Badge & Action */}
        <div className="flex flex-col gap-2 items-end min-w-35">
          <span className={`text-xs px-3 py-1 rounded-full border ${
            order.status === "PAID" ? "bg-blue-50 text-blue-800 border-blue-200" :
            order.status === "PREPARING" ? "bg-yellow-50 text-yellow-800 border-yellow-200" :
            order.status === "DELIVERED" ? "bg-green-50 text-green-800 border-green-200" :
            "bg-red-50 text-red-800 border-red-200"
          }`}>
            {statusLabels[order.status] || order.status}
          </span>

          {/* Status Selector */}
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isPending || order.status === "DELIVERED" || order.status === "CANCELLED"}
            className="text-xs px-2 py-1 rounded border border-border bg-background focus:outline-none focus:border-accent"
          >
            <option value="PENDING">{t("statusPending")}</option>
            <option value="PAID">{t("statusPaid")}</option>
            <option value="PREPARING">{t("statusPreparing")}</option>
            <option value="DELIVERED">{t("statusDelivered")}</option>
            <option value="CANCELLED">{t("statusCancelled")}</option>
          </select>
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