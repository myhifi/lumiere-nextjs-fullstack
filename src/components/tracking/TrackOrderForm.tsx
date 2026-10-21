"use client";

import { useState } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

export function TrackOrderForm({ initialQuery = "" }: { initialQuery?: string }) {
  const t = useTranslations("Tracking");
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSubmitting(true);
    
    // Check if it looks like an email or an ID to set the correct param
    const isEmail = query.includes("@");
    const param = isEmail ? "email" : "id";
    
    router.push(`${pathname}?${param}=${encodeURIComponent(query.trim())}`);
    
    // Reset loading state after a short delay (navigation takes over)
    setTimeout(() => setIsSubmitting(false), 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
          aria-label={t("searchLabel")}
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting || !query.trim()}
        className="bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {isSubmitting ? t("searchButtonLoading") : t("searchButton")}
      </button>
    </form>
  );
}