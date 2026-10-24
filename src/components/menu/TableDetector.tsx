"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useTranslations } from "next-intl";
import { X, UtensilsCrossed } from "lucide-react";

function TableDetectorContent() {
  const searchParams = useSearchParams();
  const tableParam = searchParams.get("table");
  const { tableNumber, setTableNumber } = useCartStore();
  const t = useTranslations("Menu");

  useEffect(() => {
    if (tableParam && tableParam !== tableNumber) {
      setTableNumber(tableParam);
    }
  }, [tableParam, tableNumber, setTableNumber]);

  if (!tableNumber) return null;

  return (
    <div className="bg-accent text-white px-4 py-3 rounded-2xl mb-8 flex justify-between items-center shadow-sm animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-3">
        <UtensilsCrossed className="w-5 h-5" />
        <span className="font-medium">
          {t("dineInBanner", { table: tableNumber })}
        </span>
      </div>
      <button 
        onClick={() => setTableNumber(null)}
        className="p-1 hover:bg-white/20 rounded-full transition-colors"
        title={t("clearTable")}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

export function TableDetector() {
  return (
    <Suspense fallback={null}>
      <TableDetectorContent />
    </Suspense>
  );
}