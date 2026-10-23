import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateOrdersCSV } from "@/lib/services/analytics";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Read locale from URL query (defaults to "en")
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "en";

    const csvData = await generateOrdersCSV(locale);

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="lumiere-orders-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("[CSV Export Error]", error);
    return new NextResponse("Failed to generate CSV", { status: 500 });
  }
}