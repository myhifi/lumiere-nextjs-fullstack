import { NextRequest } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { createTranslator } from "next-intl";
import { getOrderDataForPdf } from "@/lib/services/pdf";
import { CustomerReceipt } from "@/lib/pdf/CustomerReceipt";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "en";

    // 1. Fetch order data securely from the DB
    const order = await getOrderDataForPdf(id, locale);
    if (!order) {
      return new Response("Order not found", { status: 404 });
    }

    // 2. Load translations
    const messages = (await import(`../../../../../../messages/${locale}.json`)).default;
    const t = createTranslator({ locale, messages, namespace: "PDF" });

    // 3. Generate the PDF Stream
    const stream = await renderToStream(
      CustomerReceipt({ order, t: t as unknown as (key: string) => string, locale })
    );

    // 4. Return the PDF response
    return new Response(stream as unknown as ReadableStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="lumiere-receipt-${order.shortId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[Receipt API Error]", error);
    return new Response("Failed to generate PDF", { status: 500 });
  }
}