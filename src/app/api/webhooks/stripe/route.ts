import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation } from "@/lib/email/send";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature") as string;

    let event: Stripe.Event;

    // 1. Verify the webhook signature
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

      // 3. Idempotency check
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              menuItem: { select: { name: true } }, // Needed for the email
            },
          },
        },
      });

      if (!existingOrder) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (existingOrder.status === "PAID") {
        return NextResponse.json({ received: true }); // Already processed
      }

      // 4. Update DB: Mark as PAID and deduct stock atomically
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: "PAID",
            stripePaymentIntentId: session.payment_intent as string,
          },
        });

        for (const item of existingOrder.items) {
          await tx.menuItem.update({
            where: { id: item.menuItemId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      });

      console.log(`[Webhook] Order ${orderId} successfully marked as PAID.`);

      // 5. Send Confirmation Email (Outside the transaction so failure doesn't rollback DB)
      try {
        // Optional: If you pass locale in metadata during checkout, use it. Default to "en".
        const locale = session.metadata?.locale || "en"; 
        
        await sendOrderConfirmation({
          to: existingOrder.guestEmail,
          guestName: existingOrder.guestName,
          orderId: existingOrder.id,
          items: existingOrder.items.map((i) => ({
            name: i.menuItem.name,
            quantity: i.quantity,
            priceAtOrder: i.priceAtOrder,
          })),
          totalAmount: existingOrder.totalAmount,
          deliveryAddress: existingOrder.deliveryAddress,
          tableNumber: existingOrder.tableNumber,
          locale,
        });
        console.log(`[Webhook] Order confirmation email dispatched for ${orderId}.`);
      } catch (emailError) {
        // We log the error but don't return 500, because the payment and DB are already successful.
        console.error(`[Webhook] Failed to send email for order ${orderId}:`, emailError);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing event:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}