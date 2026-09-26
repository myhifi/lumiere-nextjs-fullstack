import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/StatCard";
import { AnalyticsCharts } from "@/components/admin/charts/AnalyticsCharts";
import {
  getCategoryDistribution,
  getPriceDistribution,
  getFeaturedDistribution,
} from "@/lib/services/analytics";

export default async function AdminHomePage() {
  const session = await auth();

  // ─── حساب بداية ونهاية اليوم الحالي ───
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // ─── جلب كل الإحصائيات بالتوازي (أداء) ───
  const [
    todayCount,
    pendingCount,
    itemsCount,
    activeTables,
    totalTables,
    recentReservations,
  ] = await Promise.all([
    prisma.reservation.count({
      where: {
        reservationDate: { gte: todayStart, lte: todayEnd },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
    prisma.reservation.count({ where: { status: "PENDING" } }),
    prisma.menuItem.count({ where: { isAvailable: true } }),
    prisma.table.count({ where: { isActive: true } }),
    prisma.table.count(),
    prisma.reservation.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        table: { select: { number: true } },
      },
    }),
  ]);

  const occupancyRate =
    totalTables > 0 ? Math.round((activeTables / totalTables) * 100) : 0;

  // ─── بيانات الرسوم البيانية ───
  const [categoryData, priceData, featuredData] = await Promise.all([
    getCategoryDistribution(),
    getPriceDistribution(),
    getFeaturedDistribution(),
  ]);

  return (
    <div className="p-8">
      {/* الترويسة */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          مرحباً، {session?.user?.name} 👋
        </h1>
        <p className="text-muted">
          نظرة سريعة على حالة المطعم اليوم
        </p>
      </div>

      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="📅"
          label="حجوزات اليوم"
          value={todayCount}
          hint={`من ${activeTables} طاولة`}
        />
        <StatCard
          icon="⏳"
          label="قيد الانتظار"
          value={pendingCount}
          hint="بحاجة تأكيد"
          href="/admin/reservations?status=PENDING"
          accent
        />
        <StatCard
          icon="🍽️"
          label="أطباق متاحة"
          value={itemsCount}
          href="/admin/menu"
        />
        <StatCard
          icon="🪑"
          label="نسبة تفعيل الطاولات"
          value={`${occupancyRate}%`}
          hint={`${activeTables} من ${totalTables}`}
          href="/admin/tables"
        />
      </div>

      {/* آخر الحجوزات */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-lg">📋 آخر الحجوزات</h2>
          <Link
            href="/admin/reservations"
            className="text-sm text-accent hover:text-accent-dark transition-colors"
          >
            عرض الكل ←
          </Link>
        </div>

        {recentReservations.length === 0 ? (
          <div className="p-10 text-center text-muted">
            لا توجد حجوزات بعد.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentReservations.map((res) => (
              <div
                key={res.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-background/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{res.guestName}</div>
                  <div className="text-xs text-muted mt-1" dir="ltr">
                    {new Date(res.reservationDate).toLocaleString("ar-EG", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div className="text-sm text-muted shrink-0">
                  طاولة {res.table.number}
                </div>

                <StatusBadge status={res.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Analytics Charts ─── */}
      <AnalyticsCharts
        categoryData={categoryData}
        priceData={priceData}
        featuredData={featuredData}
      />
    </div>
  );
}

// ─── مكون فرعي: شارة الحالة ───
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-50 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-green-50 text-green-800 border-green-200",
    CANCELLED: "bg-red-50 text-red-800 border-red-200",
    COMPLETED: "bg-blue-50 text-blue-800 border-blue-200",
  };

  const labels: Record<string, string> = {
    PENDING: "قيد الانتظار",
    CONFIRMED: "مؤكد",
    CANCELLED: "ملغى",
    COMPLETED: "مكتمل",
  };

  return (
    <span
      className={`text-xs px-3 py-1 rounded-full border shrink-0 ${
        styles[status] ?? "bg-gray-50 text-gray-800 border-gray-200"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}