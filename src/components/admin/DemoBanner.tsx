"use client";

import { useTranslations } from "next-intl";

// ═══════════════════════════════════════════════════
// ⚠️ Banner shown to the demo account only
// ═══════════════════════════════════════════════════
// Informs the user that changes are temporary.

export function DemoBanner() {
  const t = useTranslations("Admin.demoBanner");

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3 text-sm text-yellow-900 flex items-center gap-3">
      <span className="text-lg">⚠️</span>
      <div className="flex-1">
        <strong className="font-bold">{t("title")}</strong> — {t("message")}
      </div>
    </div>
  );
}