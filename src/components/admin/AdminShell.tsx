"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { DemoBanner } from "./DemoBanner";

type UserInfo = {
  name: string;
  role: string;
};

export function AdminShell({
  user,
  isDemoUser,
  children,
}: {
  user: UserInfo;
  isDemoUser: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Admin.sidebar");
  const isRTL = locale === "ar";

  // ─── إغلاق القائمة عند تغيير المسار ───
  // نمط React الرسمي: "Adjusting State When a Prop Changes"
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setIsOpen(false);
  }

  // ─── منع تمرير الصفحة عند فتح القائمة ───
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // ─── حساب اتجاه انزلاق القائمة ───
  const drawerTransform = isOpen
    ? "translate-x-0"
    : isRTL
      ? "translate-x-full"
      : "-translate-x-full";

  return (
    <div className="min-h-screen bg-background">
      {/* ═══ الشريط العلوي (للجوال فقط) ═══ */}
      <header className="lg:hidden sticky top-0 z-30 bg-foreground text-background flex items-center justify-between px-4 h-14 border-b border-white/10">
        <Link href="/admin" className="text-xl font-bold text-accent">
          Lumière
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={t("openMenu")}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* ═══ خلفية معتمة (للجوال فقط عند الفتح) ═══ */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ═══ القائمة الجانبية ═══ */}
      <div
        className={`
          fixed top-0 bottom-0 z-50 w-64
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isRTL ? "right-0" : "left-0"}
          ${drawerTransform}
        `}
      >
        <AdminSidebar user={user} onClose={() => setIsOpen(false)} />
      </div>

      {/* ═══ المحتوى الرئيسي ═══ */}
      <main className="lg:ps-64">
        {isDemoUser && <DemoBanner />}
        {children}
      </main>
    </div>
  );
}