import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  // 1. Authenticate
  const session = await auth();
  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Setup the Stream
  const responseStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let isClosed = false;
      
      // Start tracking time from now
      let lastCheck = new Date();
      const seenOrderIds = new Set<string>();

      const sendEvent = (data: unknown) => {
        if (!isClosed) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        }
      };

      // Send initial connection success
      sendEvent({ type: "connected" });

      // 3. Database Polling Loop (Every 4 seconds)
      const pollInterval = setInterval(async () => {
        try {
          if (isClosed) return;

          // Look for orders marked as PAID since our last check
          const newOrders = await prisma.order.findMany({
            where: {
              status: "PAID",
              updatedAt: { gt: lastCheck },
            },
            include: { items: true },
          });

          if (newOrders.length > 0) {
            // Update the timestamp so we don't send them again
            lastCheck = new Date(); 
            
            newOrders.forEach((order) => {
              // Only send if we haven't sent it already
              if (!seenOrderIds.has(order.id)) {
                seenOrderIds.add(order.id);
                sendEvent({
                  type: "new-order",
                  order: {
                    id: order.id,
                    guestName: order.guestName,
                    itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
                  },
                });
              }
            });
          }
        } catch (error) {
          console.error("[SSE Poll Error]", error);
        }
      }, 4000);

      // 4. Keep-Alive Loop (Every 10 seconds)
      const keepAliveInterval = setInterval(() => {
        if (!isClosed) {
          controller.enqueue(encoder.encode(`: keep-alive\n\n`));
        }
      }, 10000);

      // 5. Cleanup
      req.signal.addEventListener("abort", () => {
        isClosed = true;
        clearInterval(pollInterval);
        clearInterval(keepAliveInterval);
        controller.close();
      });
    },
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}