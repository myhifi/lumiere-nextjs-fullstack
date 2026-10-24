import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { renderToStream } from "@react-pdf/renderer";
import { createTranslator } from "next-intl";
import { auth } from "@/auth";
import { getOrderDataForPdf } from "@/lib/services/pdf";
import { KitchenTicket } from "@/lib/pdf/KitchenTicket";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate (Only Staff/Admin can print kitchen tickets)
    const session = await auth();
    if (!session || !session.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "en";

    // 2. Fetch order data
    const order = await getOrderDataForPdf(id, locale);
    if (!order) {
      return new Response("Order not found", { status: 404 });
    }

    // 3. Load translations
    const messagesPath = path.join(process.cwd(), `messages/${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(messagesPath, "utf8"));
    const t = createTranslator({ locale, messages, namespace: "PDF" });

    // 4. Generate the PDF Stream
    const stream = await renderToStream(
      KitchenTicket({ order, t: t as unknown as (key: string) => string, locale })
    );

    return new Response(stream as unknown as ReadableStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="lumiere-ticket-${order.shortId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[Ticket API Error]", error);
    return new Response("Failed to generate PDF", { status: 500 });
  }
}