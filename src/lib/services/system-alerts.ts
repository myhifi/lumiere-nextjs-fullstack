import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/services/audit";

const SYSTEM_USER_ID = "SYSTEM";

export async function runSystemAlertEngine() {
  // 1. Fetch all active custom rules from the database
  const rules = await prisma.systemRule.findMany({
    where: { isActive: true },
  });

  for (const rule of rules) {
    if (rule.metric === "STOCK_LEVEL") {
      await checkStockRule(rule.threshold, rule.type);
    } else if (rule.metric === "ORDER_TOTAL") {
      await checkOrderTotalRule(rule.threshold, rule.type);
    } else if (rule.metric === "PENDING_RESERVATIONS") {
      await checkPendingReservationsRule(rule.threshold, rule.type);
    }
  }
}

// ─── Rule Checkers ───

async function checkStockRule(threshold: number, type: string) {
  // Find items where stock is LESS THAN OR EQUAL TO the threshold
  const items = await prisma.menuItem.findMany({
    where: { stock: { lte: threshold }, isAvailable: true },
    take: 3,
  });

  for (const item of items) {
    const triggerKey = `low_stock_${item.id}_${threshold}`;
    await createSystemAlertIfMissing(triggerKey, {
      title: "⚠️ Low Stock Alert",
      message: `Product "${item.name}" has fallen below your custom threshold of ${threshold} (${item.stock} remaining).`,
      type,
    });
  }
}

async function checkOrderTotalRule(threshold: number, type: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Find orders today that are HIGHER THAN OR EQUAL TO the threshold
  const orders = await prisma.order.findMany({
    where: { totalAmount: { gte: threshold }, createdAt: { gte: today } },
    take: 1,
  });

  if (orders.length > 0) {
    const triggerKey = `high_order_${threshold}_${today.toISOString().split("T")[0]}`;
    await createSystemAlertIfMissing(triggerKey, {
      title: "🎉 High-Value Order",
      message: `An order exceeding your custom threshold of ${threshold} AED was placed today.`,
      type,
    });
  }
}

async function checkPendingReservationsRule(threshold: number, type: string) {
  // Find reservations pending for over X hours (threshold acts as hours here)
  const timeAgo = new Date(Date.now() - threshold * 60 * 60 * 1000);
  const res = await prisma.reservation.findMany({
    where: { status: "PENDING", createdAt: { lt: timeAgo } },
    take: 2,
  });

  for (const r of res) {
    const triggerKey = `pending_res_${r.id}_${threshold}h`;
    await createSystemAlertIfMissing(triggerKey, {
      title: "⏳ Pending Reservation",
      message: `Reservation for ${r.guestName} has been pending for over ${threshold} hours.`,
      type,
    });
  }
}

// ─── Helper ───

async function createSystemAlertIfMissing(
  triggerKey: string, 
  data: { title: string; message: string; type: string }
) {
  const existing = await prisma.announcement.findUnique({ where: { triggerKey } });
  if (existing) return;

  const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!adminUser) return;

  const alert = await prisma.announcement.upsert({
    where: { triggerKey },
    update: {}, // If it exists, do nothing
    create: {
      ...data,
      source: "SYSTEM",
      triggerKey,
      createdById: adminUser.id,
    },
  });

  await logAction({
    userId: SYSTEM_USER_ID,
    userName: "System Rule Engine",
    action: "CREATE",
    entity: "Announcement",
    entityId: alert.id,
    entityName: alert.title || "System Alert",
    severity: "info",
    changes: { after: alert },
  });
}