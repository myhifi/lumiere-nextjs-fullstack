import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { ReservationRow } from "@/components/admin/ReservationRow";
import { EmptyState } from "@/components/ui/EmptyState";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminReservationsPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  const { status } = await searchParams;
  const isAdmin = session?.user?.role === "ADMIN";
  const t = await getTranslations("Admin.reservations");

  const FILTERS = [
    { value: undefined, label: t("filterAll") },
    { value: "PENDING", label: t("filterPending") },
    { value: "CONFIRMED", label: t("filterConfirmed") },
    { value: "COMPLETED", label: t("filterCompleted") },
    { value: "CANCELLED", label: t("filterCancelled") },
  ] as const;

  const reservations = await prisma.reservation.findMany({
    where: status ? { status } : undefined,
    orderBy: { reservationDate: "desc" },
    include: {
      table: { select: { number: true, capacity: true } },
    },
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          {t("title")}
        </h1>
        <p className="text-muted text-sm lg:text-base">
          {t("count", { count: reservations.length })}
          {status ? t("countFiltered") : t("countTotal")}
        </p>
      </div>

      {/* أزرار التصفية */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((filter) => {
          const isActive = status === filter.value;
          const href = filter.value
            ? `/admin/reservations?status=${filter.value}`
            : "/admin/reservations";
          return (
            <Link
              key={filter.label}
              href={href}
              className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                isActive
                  ? "bg-accent text-white border-accent"
                  : "bg-card border-border hover:border-accent hover:text-accent"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {/* القائمة */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {reservations.length === 0 ? (
          <EmptyState
            icon="📅"
            title={status ? t("emptyFiltered") : t("emptyAll")}
            description={t("emptyDescription")}
          />
        ) : (
          <div className="divide-y divide-border">
            {reservations.map((res) => (
              <ReservationRow
                key={res.id}
                reservation={res}
                isAdmin={isAdmin}
                locale={locale}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}