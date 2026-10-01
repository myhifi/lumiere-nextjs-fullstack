"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function MenuItemNotFoundClient() {
  const t = useTranslations("ItemDetail");

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="text-8xl mb-6">🍽️</div>
      <h1 className="text-3xl font-bold mb-4">{t("notFoundTitle")}</h1>
      <p className="text-muted mb-8">{t("notFoundDescription")}</p>
      <Link
        href="/menu"
        className="inline-block bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors"
      >
        {t("backToMenu")}
      </Link>
    </div>
  );
}