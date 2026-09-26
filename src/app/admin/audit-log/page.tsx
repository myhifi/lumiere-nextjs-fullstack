import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AuditLogCard } from "@/components/admin/AuditLogCard";

export const metadata: Metadata = {
  title: "سجل الإجراءات",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{
    severity?: string;
    entity?: string;
    page?: string;
  }>;
};

// ─── فلاتر الـ severity ───
const SEVERITY_FILTERS = [
  { value: undefined, label: "الكل", color: "text-foreground" },
  { value: "info", label: "عادي", color: "text-blue-700" },
  { value: "warning", label: "حساس", color: "text-amber-800" },
  { value: "critical", label: "خطير", color: "text-red-800" },
] as const;

// ─── فلاتر الـ entity ───
const ENTITY_FILTERS = [
  { value: undefined, label: "كل الكيانات" },
  { value: "MenuItem", label: "أطباق" },
  { value: "Table", label: "طاولات" },
  { value: "User", label: "موظفون" },
  { value: "Reservation", label: "حجوزات" },
] as const;

const PAGE_SIZE = 30;

// ─── مساعد: بناء رابط ───
function buildURL(params: {
  severity?: string;
  entity?: string;
  page?: number;
}): string {
  const qs = new URLSearchParams();
  if (params.severity) qs.set("severity", params.severity);
  if (params.entity) qs.set("entity", params.entity);
  if (params.page && params.page > 1) qs.set("page", String(params.page));
  const query = qs.toString();
  return `/admin/audit-log${query ? `?${query}` : ""}`;
}

export default async function AuditLogPage({ searchParams }: PageProps) {
  const { severity, entity, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);

  // ─── شرط الفلترة ───
  const where = {
    ...(severity && { severity }),
    ...(entity && { entity }),
  };

  // ─── جلب البيانات ───
  const [logs, totalCount] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="p-8 max-w-5xl">
      {/* الترويسة */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">📋 سجل الإجراءات</h1>
        <p className="text-muted">
          {totalCount} إجراء
          {severity || entity ? " (بعد التصفية)" : " إجمالاً"}
        </p>
      </div>

      {/* فلاتر severity */}
      <div className="flex flex-wrap gap-2 mb-3">
        {SEVERITY_FILTERS.map((f) => {
          const isActive = severity === f.value;
          return (
            <Link
              key={f.label}
              href={buildURL({ severity: f.value, entity })}
              className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                isActive
                  ? "bg-accent text-white border-accent"
                  : "bg-card border-border hover:border-accent hover:text-accent"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* فلاتر entity */}
      <div className="flex flex-wrap gap-2 mb-6">
        {ENTITY_FILTERS.map((f) => {
          const isActive = entity === f.value;
          return (
            <Link
              key={f.label}
              href={buildURL({ severity, entity: f.value })}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                isActive
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card border-border hover:border-foreground"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* القائمة */}
      {logs.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-lg font-bold mb-2">لا توجد سجلات</h3>
          <p className="text-muted text-sm">
            {severity || entity
              ? "جرّب تغيير الفلاتر."
              : "لم يُسجَّل أي إجراء بعد."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <AuditLogCard key={log.id} log={log} />
          ))}
        </div>
      )}

      {/* الترقيم */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {/* السابق */}
          {currentPage > 1 ? (
            <Link
              href={buildURL({
                severity,
                entity,
                page: currentPage - 1,
              })}
              className="text-sm px-4 py-2 rounded-full border border-border hover:border-accent hover:text-accent transition-colors"
            >
              ← السابق
            </Link>
          ) : (
            <span className="text-sm px-4 py-2 rounded-full border border-border text-muted opacity-40">
              ← السابق
            </span>
          )}

          <span className="text-sm text-muted px-3">
            صفحة {currentPage} من {totalPages}
          </span>

          {/* التالي */}
          {currentPage < totalPages ? (
            <Link
              href={buildURL({
                severity,
                entity,
                page: currentPage + 1,
              })}
              className="text-sm px-4 py-2 rounded-full border border-border hover:border-accent hover:text-accent transition-colors"
            >
              التالي →
            </Link>
          ) : (
            <span className="text-sm px-4 py-2 rounded-full border border-border text-muted opacity-40">
              التالي →
            </span>
          )}
        </div>
      )}
    </div>
  );
}