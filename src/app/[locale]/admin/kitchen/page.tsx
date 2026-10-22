import { prisma } from "@/lib/prisma";
import { KitchenBoard, type KDSOrder } from "@/components/admin/KitchenBoard";

export default async function KitchenPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const initialOrders = await prisma.order.findMany({
    where: { status: { in: ["PAID", "PREPARING"] } },
    orderBy: { createdAt: "asc" },
    include: {
      items: {
        include: { menuItem: { select: { name: true, nameEn: true } } },
      },
    },
  });

  // Serialize and pass raw names to the Client Component
  const serializedOrders: KDSOrder[] = initialOrders.map(order => ({
    id: order.id,
    guestName: order.guestName,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map(item => ({
      quantity: item.quantity,
      name: item.menuItem.name,
      nameEn: item.menuItem.nameEn,
    })),
  }));

  return <KitchenBoard initialOrders={serializedOrders} locale={locale} />;
}