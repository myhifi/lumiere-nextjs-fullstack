"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALES_DATA: Record<string, { label: string; code: string }> = {
  ar: { label: "العربية", code: "eg" },
  en: { label: "English", code: "gb" },
  fr: { label: "Français", code: "fr" },
  de: { label: "Deutsch", code: "de" },
  es: { label: "Español", code: "es" },
};

type Props = {
  variant?: "light" | "dark";
};

export function LanguageSwitcher({ variant = "light" }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isDark = variant === "dark";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(newLocale: string) {
    setIsOpen(false);
    router.replace(pathname, { locale: newLocale });
  }

  const currentLocale = LOCALES_DATA[locale] || LOCALES_DATA.en;

  const buttonClasses = isDark
    ? "flex items-center gap-2 bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white/90 hover:border-accent hover:text-accent transition-colors cursor-pointer w-full"
    : "flex items-center gap-2 bg-transparent border border-border rounded-lg px-3 py-1.5 text-sm cursor-pointer hover:border-accent focus:outline-none focus:border-accent transition-colors";

  const dropdownPositionClasses = isDark
    ? "absolute bottom-full mb-2 inset-e-0 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 min-w-35"
    : "absolute top-full mt-2 inset-e-0 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 min-w-35";

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClasses}
      >
        <Image
          src={`https://flagcdn.com/24x18/${currentLocale.code}.png`}
          alt={locale}
          width={20}
          height={15}
          className="object-cover rounded-sm"
        />
        <span>{currentLocale.label}</span>
        <span className="text-xs opacity-60 ms-auto">▼</span>
      </button>

      {isOpen && (
        <div className={dropdownPositionClasses}>
          {routing.locales.map((loc) => {
            const data = LOCALES_DATA[loc];
            const isActive = loc === locale;
            return (
              <button
                key={loc}
                type="button"
                onClick={() => handleChange(loc)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-start transition-colors hover:bg-accent-light ${
                  isActive ? "bg-accent-light font-medium" : ""
                }`}
              >
                <Image
                  src={`https://flagcdn.com/24x18/${data.code}.png`}
                  alt={loc}
                  width={20}
                  height={15}
                  className="object-cover rounded-sm"
                />
                <span
                  className={isActive ? "text-accent-dark" : "text-foreground"}
                >
                  {data.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}