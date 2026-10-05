"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

// ═══════════════════════════════════════════════════
// ⬆️ ScrollToTopButton
// ═══════════════════════════════════════════════════
// Appears after scrolling ~400px. Fades in smoothly.
// Positioned bottom-right (WhatsApp is bottom-left).
// Uses physical "right" — RTL/LTR do not flip this,
// because the WhatsApp button is also physically left.

const SHOW_AFTER_PX = 400;

export function ScrollToTopButton() {
  const t = useTranslations("UI");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    }

    // Initial check — in case the user lands mid-page
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={t("scrollToTop")}
      title={t("scrollToTop")}
      className={`
        fixed bottom-6 right-6 z-50
        w-12 h-12 rounded-full
        bg-accent hover:bg-accent-dark text-white
        flex items-center justify-center
        shadow-lg hover:shadow-xl
        transition-all duration-300
        ${visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-3 pointer-events-none"}
      `}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}