"use client";

import { usePathname } from "@/i18n/navigation";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

type UserInfo = {
  name: string;
  role: string;
};

const commonLinks = [
  { href: "/admin", labelKey: "overview", icon: "📊", exact: true },
  { href: "/admin/reservations", labelKey: "reservations", icon: "📅" },
  { href: "/admin/menu", labelKey: "menu", icon: "🍽️" },
  { href: "/admin/categories", labelKey: "categories", icon: "📂" },
  { href: "/admin/tables", labelKey: "tables", icon: "🪑" },
  { href: "/admin/reviews", labelKey: "reviews", icon: "⭐" },
  { href: "/admin/audit-log", labelKey: "auditLog", icon: "📋" },
] as const;

const adminOnlyLinks = [
  { href: "/admin/users", labelKey: "users", icon: "👥" },
] as const;

type Props = {
  user: UserInfo;
  onClose?: () => void;
};

export function AdminSidebar({ user, onClose }: Props) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("Admin.sidebar");
  const isAdmin = user.role === "ADMIN";

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  function handleLogout() {
    if (!confirm(t("logoutConfirm"))) return;
    startTransition(async () => {
      await signOut({ callbackUrl: "/login" });
    });
  }

  return (
    <aside className="w-64 h-full bg-foreground text-background shrink-0 overflow-y-auto">
      {/* حاوية داخلية بحد أدنى = ارتفاع الشاشة */}
      <div className="flex flex-col min-h-full">
        {/* الشعار + زر إغلاق (للجوال فقط) */}
        <div className="p-4 lg:p-6 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <Link
              href="/admin"
              onClick={onClose}
              className="text-2xl font-bold text-accent"
            >
              Lumière
            </Link>
            <p className="text-xs text-white/50 mt-1">{t("brand")}</p>
          </div>

          {/* زر إغلاق الجوال */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={t("closeMenu")}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* الروابط — بلا flex-1 (ارتفاع طبيعي) */}
        <nav className="p-3 flex flex-col gap-1 shrink-0">
          {commonLinks.map((link) => (
            <SidebarLink
              key={link.href}
              href={link.href}
              label={t(link.labelKey)}
              icon={link.icon}
              active={isActive(link.href, "exact" in link && link.exact)}
              onClick={onClose}
            />
          ))}

          {isAdmin && (
            <>
              <div className="border-t border-white/10 my-2" />
              {adminOnlyLinks.map((link) => (
                <SidebarLink
                  key={link.href}
                  href={link.href}
                  label={t(link.labelKey)}
                  icon={link.icon}
                  active={isActive(link.href)}
                  onClick={onClose}
                />
              ))}
            </>
          )}
        </nav>

        {/* المستخدم + الخروج — mt-auto يدفعها للأسفل عند توفر مساحة */}
        <div className="p-3 border-t border-white/10 space-y-1 mt-auto shrink-0">
          <div className="px-4 py-3 bg-white/5 rounded-lg">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs text-white/50 mt-0.5">
              {user.role === "ADMIN" ? t("roleAdmin") : t("roleStaff")}
            </div>
          </div>

          <LanguageSwitcher variant="dark" />

          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span className="text-lg">🌐</span>
            <span>{t("viewSite")}</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">🚪</span>
            <span>{isPending ? t("loggingOut") : t("logout")}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  label,
  icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
        active
          ? "bg-accent text-white font-medium"
          : "text-white/75 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}