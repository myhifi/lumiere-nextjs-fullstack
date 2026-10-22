import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch only orders that the kitchen cares about
  const orders = await prisma.order.findMany({
    where: { status: { in: ["PAID", "PREPARING"] } },
    orderBy: { createdAt: "asc" }, // Oldest orders first!
    include: {
      items: {
        include: { menuItem: { select: { name: true, nameEn: true } } },
      },
    },
  });

// Map to the exact shape the Client Component expects
  const serializedOrders = orders.map(order => ({
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

  return NextResponse.json(serializedOrders);
}