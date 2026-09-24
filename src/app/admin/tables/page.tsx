import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TableRow } from "@/components/admin/TableRow";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminTablesPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const tables = await prisma.table.findMany({
    orderBy: { number: "asc" },
    include: {
      _count: { select: { reservations: true } },
    },
  });

  const activeCount = tables.filter((t) => t.isActive).length;
  const totalCapacity = tables
    .filter((t) => t.isActive)
    .reduce((sum, t) => sum + t.capacity, 0);

  return (
    <div className="p-8">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold mb-2">🪑 إدارة الطاولات</h1>
          <p className="text-muted">
            {activeCount} من {tables.length} نشطة · سعة إجمالية {totalCapacity} كرسي
          </p>
        </div>
        <Link
          href="/admin/tables/new"
          className="bg-accent hover:bg-accent-dark text-white font-medium px-6 py-3 rounded-full transition-colors"
        >
          + طاولة جديدة
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {tables.length === 0 ? (
        <EmptyState
            icon="🪑"
            title="لا توجد طاولات بعد"
            description="أضف طاولاتك الأولى ليتمكن النظام من تخصيصها للحجوزات."
            action={
                <Link
                href="/admin/tables/new"
                className="inline-block bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors"
                >
                + إضافة طاولة جديدة
                </Link>
            }
        />
        ) : (
          <div className="divide-y divide-border">
            {tables.map((table) => (
              <TableRow
                key={table.id}
                table={{
                  id: table.id,
                  number: table.number,
                  capacity: table.capacity,
                  location: table.location,
                  isActive: table.isActive,
                  reservationsCount: table._count.reservations,
                }}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}