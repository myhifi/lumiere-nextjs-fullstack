import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature") as string;

    let event: Stripe.Event;

    // 1. Verify the webhook signature to ensure it came from Stripe
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`[Webhook] Signature verification failed: ${errorMessage}`);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 2. Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId || session.client_reference_id;

      if (!orderId) {
        return NextResponse.json({ error: "No order ID found" }, { status: 400 });
      }

      // 3. Idempotency check: Has this webhook already been processed?
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!existingOrder) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (existingOrder.status === "PAID") {
        // Already processed, return 200 so Stripe stops retrying
        return NextResponse.json({ received: true });
      }

      // 4. Update DB: Mark as PAID and deduct stock atomically
      await prisma.$transaction(async (tx) => {
        // Update Order Status
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: "PAID",
            stripePaymentIntentId: session.payment_intent as string,
          },
        });

        // Deduct Stock
        for (const item of existingOrder.items) {
          await tx.menuItem.update({
            where: { id: item.menuItemId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      });

      console.log(`[Webhook] Order ${orderId} successfully marked as PAID.`);
    } 

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing event:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}