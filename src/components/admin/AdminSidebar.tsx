"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { signOut } from "next-auth/react";

type UserInfo = {
  name: string;
  role: string;
};

// روابط عامة لكل المستخدمين (ADMIN + STAFF)
const commonLinks = [
  { href: "/admin", label: "نظرة عامة", icon: "📊", exact: true },
  { href: "/admin/reservations", label: "الحجوزات", icon: "📅" },
  { href: "/admin/menu", label: "الأطباق", icon: "🍽️" },
  { href: "/admin/categories", label: "التصنيفات", icon: "📂" },
  { href: "/admin/tables", label: "الطاولات", icon: "🪑" },
  { href: "/admin/audit-log", label: "سجل الإجراءات", icon: "📋" },
] as const;

// روابط للمدير فقط
const adminOnlyLinks = [
  { href: "/admin/users", label: "الموظفون", icon: "👥" },
] as const;

export function AdminSidebar({ user }: { user: UserInfo }) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const isAdmin = user.role === "ADMIN";

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }
  
  function handleLogout() {
    if (!confirm("تسجيل الخروج من لوحة التحكم؟")) return;
    startTransition(async () => {
      await signOut({ callbackUrl: "/login" });
    });
  }

  return (
    <aside className="w-64 bg-foreground text-background flex flex-col shrink-0 h-screen sticky top-0">
      {/* الشعار */}
      <div className="p-6 border-b border-white/10">
        <Link href="/admin" className="text-2xl font-bold text-accent">
          Lumière
        </Link>
        <p className="text-xs text-white/50 mt-1">لوحة التحكم</p>
      </div>

      {/* الروابط */}
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        {commonLinks.map((link) => (
          <SidebarLink
            key={link.href}
            href={link.href}
            label={link.label}
            icon={link.icon}
            active={isActive(link.href, "exact" in link && link.exact)}
          />
        ))}

        {/* روابط المدير فقط */}
        {isAdmin && (
          <>
            <div className="border-t border-white/10 my-2" />
            {adminOnlyLinks.map((link) => (
              <SidebarLink
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                active={isActive(link.href)}
              />
            ))}
          </>
        )}
      </nav>

      {/* المستخدم + الخروج */}
      <div className="p-3 border-t border-white/10 space-y-1">
        {/* معلومات المستخدم */}
        <div className="px-4 py-3 bg-white/5 rounded-lg">
          <div className="text-sm font-medium truncate">{user.name}</div>
          <div className="text-xs text-white/50 mt-0.5">
            {user.role === "ADMIN" ? "مدير" : "موظف"}
          </div>
        </div>

        {/* عرض الموقع */}
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-white/50 hover:bg-white/10 hover:text-white transition-colors"
        >
          <span className="text-lg">🌐</span>
          <span>عرض الموقع</span>
        </Link>

        {/* تسجيل الخروج */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">🚪</span>
          <span>{isPending ? "جاري الخروج..." : "تسجيل الخروج"}</span>
        </button>
      </div>
    </aside>
  );
}

// مكون فرعي لتبسيط روابط القائمة الجانبية وإدارة حالة النشاط
function SidebarLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
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