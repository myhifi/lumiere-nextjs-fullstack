import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReservationRow } from "@/components/admin/ReservationRow";
import { EmptyState } from "@/components/ui/EmptyState";

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

const FILTERS = [
  { value: undefined, label: "الكل" },
  { value: "PENDING", label: "قيد الانتظار" },
  { value: "CONFIRMED", label: "مؤكد" },
  { value: "COMPLETED", label: "مكتمل" },
  { value: "CANCELLED", label: "ملغى" },
] as const;

export default async function AdminReservationsPage({
  searchParams,
}: PageProps) {
  const session = await auth();
  const { status } = await searchParams;
  const isAdmin = session?.user?.role === "ADMIN";

  const reservations = await prisma.reservation.findMany({
    where: status ? { status } : undefined,
    orderBy: { reservationDate: "desc" },
    include: {
      table: { select: { number: true, capacity: true } },
    },
  });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">📅 إدارة الحجوزات</h1>
        <p className="text-muted">
          {reservations.length} حجز{status ? " بهذه الحالة" : " إجمالاً"}
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
              title={status ? "لا توجد حجوزات بهذه الحالة" : "لا توجد حجوزات بعد"}
              description="ستظهر الحجوزات الجديدة هنا فوراً."
            />
          ) : (
          <div className="divide-y divide-border">
            {reservations.map((res) => (
              <ReservationRow
                key={res.id}
                reservation={res}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}