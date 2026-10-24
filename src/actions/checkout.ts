// src/actions/checkout.ts
"use server";

import { prisma } from "@/lib/prisma";
import { createCheckoutSchema } from "@/lib/validations/order";
import { getTranslations } from "next-intl/server";
import type { CartItem } from "@/types/order";
import { sendOrderConfirmation } from "@/lib/email/send"; // <--- Add this

export type CheckoutResult =
  | { success: true; orderId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createPendingOrder(
  input: unknown,
  cartItems: CartItem[]
): Promise<CheckoutResult> {
  const tValidation = await getTranslations("Errors.validation");
  const schema = createCheckoutSchema((key) =>
    tValidation(key as Parameters<typeof tValidation>[0])
  );

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { success: false, error: "Invalid data", fieldErrors };
  }

  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: "Cart is empty" };
  }

  const data = parsed.data;

  try {
    // 1. Fetch REAL prices and stock from DB
    const dbItems = await prisma.menuItem.findMany({
      where: { id: { in: cartItems.map((i) => i.menuItemId) } },
    });

    let totalAmount = 0;
    const orderItemsData = [];

    // 2. Validate stock and calculate total securely
    for (const item of cartItems) {
      const dbItem = dbItems.find((db) => db.id === item.menuItemId);
      if (!dbItem) throw new Error(`Item ${item.name} no longer exists`);
      if (dbItem.stock < item.quantity) {
        return { success: false, error: `Not enough stock for ${dbItem.name}` };
      }

      totalAmount += dbItem.price * item.quantity;

      orderItemsData.push({
        menuItemId: dbItem.id,
        quantity: item.quantity,
        priceAtOrder: dbItem.price, // Snapshot the price
      });
    }

    // 3. Create the Order in the DB with PENDING status
    const order = await prisma.order.create({
      data: {
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone || "", // <--- FIX: Fallback to empty string
        deliveryAddress: data.deliveryAddress || null,
        tableNumber: data.tableNumber || null,
        paymentMethod: data.paymentMethod,
        totalAmount,
        // If CASH, mark as PAID immediately. If CARD, wait for Stripe webhook.
        status: data.paymentMethod === "CASH" ? "PAID" : "PENDING",
        items: {
          create: orderItemsData,
        },
      },
    });

    // If paying by cash, trigger the email directly (bypassing Stripe Webhook)
    if (data.paymentMethod === "CASH") {
      try {
        await sendOrderConfirmation({
          to: order.guestEmail,
          guestName: order.guestName,
          orderId: order.id,
          items: orderItemsData.map((i) => {
            const dbItem = dbItems.find((db) => db.id === i.menuItemId);
            return {
              name: dbItem?.nameEn || dbItem?.name || "Item",
              quantity: i.quantity,
              priceAtOrder: i.priceAtOrder,
            };
          }),
          totalAmount: order.totalAmount,
          deliveryAddress: order.deliveryAddress,
          tableNumber: order.tableNumber,
          locale: "en", // Default or pass from frontend if needed
        });
      } catch (emailErr) {
        console.error("[Cash Order Email Failed]", emailErr);
      }
    }

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("[createPendingOrder]", error);
    return { success: false, error: "Failed to create order" };
  }
}