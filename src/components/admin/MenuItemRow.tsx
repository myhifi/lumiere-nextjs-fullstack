"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  toggleMenuItemAvailability,
  toggleMenuItemFeatured,
  deleteMenuItem,
} from "@/actions/admin-menu";

type MenuItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  category: { name: string };
};

type Props = {
  item: MenuItem;
  isAdmin: boolean;
};

export function MenuItemRow({ item, isAdmin }: Props) {
  const t = useTranslations("Admin.menu");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggleAvailable() {
    setError(null);
    startTransition(async () => {
      const result = await toggleMenuItemAvailability(
        item.id,
        !item.isAvailable
      );
      if (!result.success) setError(result.error);
    });
  }

  function handleToggleFeatured() {
    setError(null);
    startTransition(async () => {
      const result = await toggleMenuItemFeatured(item.id, !item.isFeatured);
      if (!result.success) setError(result.error);
    });
  }

  function handleDelete() {
    if (!confirm(t("deleteConfirm", { name: item.name }))) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteMenuItem(item.id);
      if (!result.success) setError(result.error);
    });
  }

  return (
    <div
      className={`p-4 transition-opacity ${
        isPending ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{item.name}</span>
            {item.isFeatured && (
              <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full">
                {t("featured")}
              </span>
            )}
            {!item.isAvailable && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                {t("unavailable")}
              </span>
            )}
          </div>
          <div className="text-xs text-muted mt-1">
            {item.category.name} · <span dir="ltr">/{item.slug}</span>
          </div>
          {item.description && (
            <div className="text-xs text-muted mt-1 line-clamp-1">
              {item.description}
            </div>
          )}
        </div>

        <div className="text-sm font-bold text-accent-dark min-w-25">
          {item.price} <span className="font-normal text-xs">{t("currency")}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleToggleAvailable}
            disabled={isPending}
            className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
          >
            {item.isAvailable ? t("hide") : t("show")}
          </button>

          <button
            type="button"
            onClick={handleToggleFeatured}
            disabled={isPending}
            className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
          >
            {item.isFeatured ? t("unfeature") : t("feature")}
          </button>

          <Link
            href={`/admin/menu/${item.id}/edit`}
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