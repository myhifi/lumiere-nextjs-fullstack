import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { renderToBuffer } from "@react-pdf/renderer";
import { createTranslator } from "next-intl";
import { getOrderDataForPdf } from "@/lib/services/pdf";
import { CustomerReceipt } from "@/lib/pdf/CustomerReceipt";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "en";

    const order = await getOrderDataForPdf(id, locale);
    if (!order) {
      return new Response("Order not found", { status: 404 });
    }

    const messagesPath = path.join(process.cwd(), `messages/${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(messagesPath, "utf8"));
    const t = createTranslator({ locale, messages, namespace: "PDF" });

    // Changed from renderToStream to renderToBuffer for Vercel Serverless compatibility
    const buffer = await renderToBuffer(
      CustomerReceipt({ order, t: t as unknown as (key: string) => string, locale })
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="lumiere-receipt-${order.shortId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[Receipt API Error]", error);
    // Return exact error for easier debugging
    return new Response(
      `Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`, 
      { status: 500 }
    );
  }
}