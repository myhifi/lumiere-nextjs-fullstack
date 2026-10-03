"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export function ErrorFallback({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("UI");
  const router = useRouter();

  function handleRetry() {
    // Bust the router cache first, then reset the boundary —
    // otherwise the same cached error payload re-renders.
    router.refresh();
    reset();
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="bg-card border border-red-200 rounded-2xl p-8 max-w-md text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2">{t("errorTitle")}</h2>
        <p className="text-muted text-sm mb-6">{t("errorDescription")}</p>
        {error.digest && (
          <p className="text-xs text-muted mb-6" dir="ltr">
            Error ID: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={handleRetry}
          className="bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors"
        >
          {t("errorRetry")}
        </button>
      </div>
    </div>
  );
}