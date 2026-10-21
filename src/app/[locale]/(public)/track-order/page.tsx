import { getTranslations } from "next-intl/server";
import { classifyQuery, orderIdSchema, emailSchema } from "@/lib/validations/orderTracking";
import { getTrackedOrderById, getTrackedOrdersByEmail } from "@/lib/services/orderTracking";
import { TrackOrderForm } from "@/components/tracking/TrackOrderForm";
import { OrderDetail } from "@/components/tracking/OrderDetail";
import { OrderList } from "@/components/tracking/OrderList";
import { AlertCircle } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Tracking" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string; email?: string }>;
};

export default async function TrackOrderPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { id, email } = await searchParams;
  const t = await getTranslations("Tracking");

  // Determine the query from URL
  const rawQuery = id || email || "";
  const classified = classifyQuery(rawQuery);

  let content = null;
  let errorMsg = null;

  // Scenario A: Search by ID
  if (classified.type === "id") {
    const validId = orderIdSchema.safeParse(classified.value);
    if (!validId.success) {
      errorMsg = t("errorInvalidInput");
    } else {
      const order = await getTrackedOrderById(validId.data);
      if (order) {
        content = <OrderDetail order={order} locale={locale} />;
      } else {
        errorMsg = t("errorNotFound");
      }
    }
  } 
  // Scenario B: Search by Email
  else if (classified.type === "email") {
    const validEmail = emailSchema.safeParse(classified.value);
    if (!validEmail.success) {
      errorMsg = t("errorEmailInvalid");
    } else {
      const orders = await getTrackedOrdersByEmail(validEmail.data);
      content = <OrderList orders={orders} email={validEmail.data} locale={locale} />;
    }
  } 
  // Scenario C: Invalid input
  else if (classified.type === "invalid" && rawQuery.length > 0) {
    errorMsg = t("errorInvalidInput");
  }

  return (
    <div className="min-h-[80vh] bg-gray-50/50 pt-16 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <p className="text-accent font-semibold tracking-wider text-sm mb-3 uppercase">
            {t("pageKicker")}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t("pageTitle")}
          </h1>
          <p className="text-muted max-w-2xl mx-auto">
            {t("pageSubtitle")}
          </p>
        </div>

        {/* Search Form */}
        <div className="mb-12">
          <TrackOrderForm initialQuery={rawQuery} />
        </div>

        {/* Error State */}
        {errorMsg && (
          <div className="max-w-xl mx-auto bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 border border-red-200 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Results (Order Detail or Order List) */}
        {content}
      </div>
    </div>
  );
}