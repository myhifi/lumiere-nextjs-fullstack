import { getTranslations } from "next-intl/server";
import { 
  getFinancialMetrics, 
  getRevenueTimeline, 
  getTopSellingItems 
} from "@/lib/services/analytics";
import { ArrowDownToLine, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import { FinancialCharts } from "@/components/admin/charts/FinancialCharts";

export default async function AnalyticsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("Admin.analytics");

  // Fetch all data in parallel for maximum performance
  const [metrics, timeline, topItems] = await Promise.all([
    getFinancialMetrics(),
    getRevenueTimeline(),
    getTopSellingItems(),
  ]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">{t("pageTitle")}</h1>
          <p className="text-muted text-sm lg:text-base">{t("pageSubtitle")}</p>
        </div>
        
        {/* We use a standard <a> tag here for native file download */}
        <a
          href={`/api/admin/analytics/export?locale=${locale}`}
          className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white px-5 py-2.5 rounded-full font-medium transition-colors"
        >
          <ArrowDownToLine className="w-4 h-4" />
          {t("exportCsv")}
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          title={t("totalRevenue")}
          value={`${metrics.totalRevenue.toLocaleString()} AED`}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          bg="bg-green-50"
        />
        <KpiCard
          title={t("totalOrders")}
          value={metrics.totalOrders.toString()}
          icon={<ShoppingBag className="w-6 h-6 text-blue-600" />}
          bg="bg-blue-50"
        />
        <KpiCard
          title={t("averageOrderValue")}
          value={`${metrics.aov.toFixed(2)} AED`}
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          bg="bg-purple-50"
        />
      </div>

      {/* Charts Section */}
      <FinancialCharts 
        timeline={timeline} 
        topItems={topItems} 
        locale={locale} 
        t={{
          revenueTitle: t("revenueTitle"),
          topItemsTitle: t("topItemsTitle"),
          noData: t("noData")
        }}
      />
    </div>
  );
}

// ─── Reusable KPI Card ───
function KpiCard({ title, value, icon, bg }: { title: string; value: string; icon: React.ReactNode; bg: string }) {
  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}