import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { type TrackedOrderSummary } from "@/lib/services/orderTracking";
import { ChevronRight, Package } from "lucide-react";

export async function OrderList({ orders, email, locale }: { orders: TrackedOrderSummary[], email: string, locale: string }) {
  const t = await getTranslations("Tracking");
  const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">{t("errorEmailNotFound")}</h3>
        <p className="text-muted mb-6">{t("emailResultsNone")}</p>
        <Link href="/track-order" className="text-accent hover:underline font-medium">
          {t("backToSearch")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("emailResultsTitle")}</h2>
          <p className="text-muted">
            {t("emailResultsHint", { count: orders.length })} 
            <span className="ml-1 text-gray-900 font-medium font-mono">({email})</span>
          </p>
        </div>
        <Link href="/track-order" className="text-sm text-accent hover:underline hidden sm:block">
          {t("backToSearch")}
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {orders.map((order) => (
            <li key={order.id}>
              <Link 
                href={`/track-order?id=${order.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors group"
              >
                <div className="mb-2 sm:mb-0">
                  <p className="font-mono text-sm text-gray-900 mb-1">{order.id}</p>
                  <p className="text-sm text-muted">{dateFormatter.format(order.createdAt)}</p>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">{order.totalAmount.toFixed(2)} {t("currency")}</span>
                    <span className="text-muted ml-2">({t("itemsCountLabel", { count: order.itemsCount })})</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium
                      ${order.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : ''}
                      ${order.status === 'PAID' ? 'bg-blue-100 text-blue-800' : ''}
                      ${order.status === 'PREPARING' ? 'bg-purple-100 text-purple-800' : ''}
                      ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : ''}
                      ${order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {t(`status${order.status.charAt(0) + order.status.slice(1).toLowerCase()}`)}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors" />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-8 text-center sm:hidden">
        <Link href="/track-order" className="text-accent hover:underline font-medium">
          {t("backToSearch")}
        </Link>
      </div>
    </div>
  );
}