"use server";

import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getLocalizedName } from "@/lib/utils/locale";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function createStripeSession(orderId: string, locale: string) {
  try {
    // 1. Fetch the order + items from DB
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!order || order.status === "PAID") {
      return { success: false, error: "Order not found or already paid" };
    }

    // 2. Map the DB items to Stripe line_items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((item) => ({
      price_data: {
        currency: "aed",
        product_data: {
          name: getLocalizedName(item.menuItem.name, item.menuItem.nameEn, locale),
        },
        unit_amount: Math.round(item.priceAtOrder * 100), 
      },
      quantity: item.quantity,
    }));

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // 3. Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: order.guestEmail,
      client_reference_id: order.id,
      metadata: {
        orderId: order.id,
      },
      success_url: `${siteUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/${locale}/cart`,
    });

    return { success: true, url: session.url };
  } catch (error) {
    console.error("[createStripeSession]", error);
    return { success: false, error: "Failed to create payment session" };
  }
}