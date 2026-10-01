import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { AuditLogCard } from "@/components/admin/AuditLogCard";
import { EmptyState } from "@/components/ui/EmptyState";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    severity?: string;
    entity?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 30;

export default async function AuditLogPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { severity, entity, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const t = await getTranslations("Admin.auditLog");

  const SEVERITY_FILTERS = [
    { value: undefined, label: t("filterSeverityAll") },
    { value: "info", label: t("filterSeverityInfo") },
    { value: "warning", label: t("filterSeverityWarning") },
    { value: "critical", label: t("filterSeverityCritical") },
  ] as const;

  const ENTITY_FILTERS = [
    { value: undefined, label: t("filterEntityAll") },
    { value: "MenuItem", label: t("filterEntityMenu") },
    { value: "Table", label: t("filterEntityTable") },
    { value: "User", label: t("filterEntityUser") },
    { value: "Reservation", label: t("filterEntityReservation") },
    { value: "Review", label: t("filterEntityReview") },
  ] as const;

  const where = {
    ...(severity && { severity }),
    ...(entity && { entity }),
  };

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

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* الترويسة */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted text-sm lg:text-base">
          {t("count", { count: totalCount })}
          {severity || entity ? t("countFiltered") : t("countTotal")}
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
        <div className="bg-card border border-border rounded-2xl">
          <EmptyState
            icon="📭"
            title={severity || entity ? t("emptyFiltered") : t("emptyAll")}
            description={
              severity || entity
                ? t("emptyDescriptionFiltered")
                : t("emptyDescriptionAll")
            }
          />
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
          {currentPage > 1 ? (
            <Link
              href={buildURL({
                severity,
                entity,
                page: currentPage - 1,
              })}
              className="text-sm px-4 py-2 rounded-full border border-border hover:border-accent hover:text-accent transition-colors"
            >
              {t("paginationPrev")}
            </Link>
          ) : (
            <span className="text-sm px-4 py-2 rounded-full border border-border text-muted opacity-40">
              {t("paginationPrev")}
            </span>
          )}

          <span className="text-sm text-muted px-3">
            {t("paginationInfo", {
              current: currentPage,
              total: totalPages,
            })}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={buildURL({
                severity,
                entity,
                page: currentPage + 1,
              })}
              className="text-sm px-4 py-2 rounded-full border border-border hover:border-accent hover:text-accent transition-colors"
            >
              {t("paginationNext")}
            </Link>
          ) : (
            <span className="text-sm px-4 py-2 rounded-full border border-border text-muted opacity-40">
              {t("paginationNext")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}