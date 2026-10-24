import { getTranslations } from "next-intl/server";
import { OrderTimeline } from "./OrderTimeline";
import { type TrackedOrderDetail } from "@/lib/services/orderTracking";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

export async function OrderDetail({ order, locale }: { order: TrackedOrderDetail, locale: string }) {
  const t = await getTranslations("Tracking");
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short" });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-muted mb-1">{t("orderIdLabel")}</p>
          <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block">{order.id}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm text-muted mb-1">{t("dateLabel")}</p>
          <p className="font-medium text-gray-900">{dateFormatter.format(order.createdAt)}</p>
        </div>
      </div>

      <OrderTimeline 
        status={order.status} 
        labels={{
          statusPending: t("statusPending"),
          statusCancelled: t("statusCancelled"),
          timelinePaid: t("timelinePaid"),
          timelinePreparing: t("timelinePreparing"),
          timelineOutForDelivery: t("timelineOutForDelivery"),
          timelineDelivered: t("timelineDelivered"),
        }} 
      />

      <div className="grid md:grid-cols-2 gap-8 mt-8 border-t pt-8">
        {/* Items List */}
        <div>
          <h3 className="font-bold text-lg mb-4">{t("itemsLabel")}</h3>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  <span className="font-medium text-gray-900 mr-2">{item.quantity}x</span>
                  {item.name}
                </span>
                <span className="font-medium">{(item.priceAtOrder * item.quantity).toFixed(2)} {t("currency")}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
            <span>{t("totalLabel")}</span>
            <span className="text-accent-dark">{order.totalAmount.toFixed(2)} {t("currency")}</span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="font-bold text-lg mb-4">{t("deliveryInfoLabel")}</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted mb-1">{order.deliveryAddress ? t("addressLabel") : "Table Number"}</p>
              <p className="font-medium text-gray-900">
                {order.deliveryAddress ? order.deliveryAddress : `Table ${order.tableNumber}`}
              </p>
            </div>
            <div>
              <p className="text-muted mb-1">{t("phoneLabel")}</p>
              <p className="font-medium text-gray-900" dir="ltr">{order.guestPhone}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t flex justify-center">
        <Link href="/track-order" className="flex items-center gap-2 text-accent hover:text-accent-dark font-medium transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t("backToSearch")}
        </Link>
      </div>
    </div>
  );
}