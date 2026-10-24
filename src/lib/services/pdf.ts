import "server-only";
import { prisma } from "@/lib/prisma";
import { getLocalizedName } from "@/lib/utils/locale";

export type PdfOrderData = {
  orderId: string;
  shortId: string;
  date: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  deliveryAddress: string | null;
  tableNumber: string | null;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
};

export async function getOrderDataForPdf(orderId: string, locale: string): Promise<PdfOrderData | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { menuItem: { select: { name: true, nameEn: true } } },
      },
    },
  });

  if (!order) return null;

  return {
    orderId: order.id,
    shortId: order.id.slice(0, 8).toUpperCase(),
    date: new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(order.createdAt),
    guestName: order.guestName,
    guestEmail: order.guestEmail,
    guestPhone: order.guestPhone || null,
    deliveryAddress: order.deliveryAddress,
    tableNumber: order.tableNumber,
    status: order.status,
    paymentMethod: order.paymentMethod,
    totalAmount: order.totalAmount,
    items: order.items.map((item) => ({
      name: getLocalizedName(item.menuItem.name, item.menuItem.nameEn, locale),
      quantity: item.quantity,
      price: item.priceAtOrder,
    })),
  };
}