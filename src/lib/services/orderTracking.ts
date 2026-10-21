// src/lib/services/orderTracking.ts
import "server-only";
import { prisma } from "@/lib/prisma";

export const ORDER_EMAIL_MAX_RESULTS = 10;

export type TrackedOrderItem = {
  id: string;
  name: string;
  quantity: number;
  priceAtOrder: number;
};

export type TrackedOrderDetail = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  deliveryAddress: string;
  totalAmount: number;
  items: TrackedOrderItem[];
};

// ⚠️ Privacy-safe projection — never include address / phone / guestEmail here.
export type TrackedOrderSummary = {
  id: string;
  createdAt: Date;
  status: string;
  totalAmount: number;
  itemsCount: number;
};

// ═══════════════════════════════════════════════════
// Scenario A — Direct lookup by Order ID (full details)
// ═══════════════════════════════════════════════════
export async function getTrackedOrderById(
  id: string
): Promise<TrackedOrderDetail | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          menuItem: { select: { name: true } },
        },
      },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    status: order.status,
    guestName: order.guestName,
    guestEmail: order.guestEmail,
    guestPhone: order.guestPhone,
    deliveryAddress: order.deliveryAddress,
    totalAmount: order.totalAmount,
    items: order.items.map((i) => ({
      id: i.id,
      name: i.menuItem.name,
      quantity: i.quantity,
      priceAtOrder: i.priceAtOrder,
    })),
  };
}

// ═══════════════════════════════════════════════════
// Scenario B — Lookup by email (privacy-safe list)
// ═══════════════════════════════════════════════════
export async function getTrackedOrdersByEmail(
  email: string
): Promise<TrackedOrderSummary[]> {
  const normalized = email.trim().toLowerCase();

  const orders = await prisma.order.findMany({
    where: {
      guestEmail: { equals: normalized, mode: "insensitive" },
    },
    orderBy: { createdAt: "desc" },
    take: ORDER_EMAIL_MAX_RESULTS,
    select: {
      id: true,
      createdAt: true,
      status: true,
      totalAmount: true,
      items: { select: { quantity: true } },
    },
  });

  return orders.map((o) => ({
    id: o.id,
    createdAt: o.createdAt,
    status: o.status,
    totalAmount: o.totalAmount,
    itemsCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
  }));
}