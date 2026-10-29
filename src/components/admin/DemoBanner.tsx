"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function DemoBanner() {
  const t = useTranslations("Admin.demoBanner");
  // Default to true so it always shows on mount
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="text-amber-800 font-bold text-sm">⚠️ {t("title")}</span>
        <span className="text-amber-700 text-sm hidden sm:inline">{t("message")}</span>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="text-amber-800 hover:text-amber-900 text-sm font-medium p-1 rounded hover:bg-amber-100 transition-colors"
        aria-label="Close banner"
      >
        ✕
      </button>
    </div>
  );
}