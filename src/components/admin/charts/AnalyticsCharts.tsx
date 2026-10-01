"use client";

import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTranslations } from "next-intl";

// ═══════════════════════════════════════════════════
// 📊 Analytics Charts — Dashboard visualizations
// ═══════════════════════════════════════════════════

// Color palette for charts
const COLORS = ["#c9a961", "#a88847", "#f5ecd9", "#1a1a1a", "#6b6b6b"];

// Shape of chart data
type ChartData = {
  name: string;
  value: number;
};

// ─── Custom legend below the chart ───
function CustomLegend({ data }: { data: ChartData[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: COLORS[index % COLORS.length] }}
          />
          <span className="text-foreground">
            {item.name}
            <span className="text-muted mr-1.5">({item.value})</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── 1. Donut chart ───
function DonutChart({
  data,
  title,
  height = 260,
}: {
  data: ChartData[];
  title: string;
  height?: number;
}) {
  // Add color directly to each item (instead of <Cell>)
  const coloredData = data.map((item, i) => ({
    ...item,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-sm font-medium text-muted mb-4 tracking-wider uppercase">
        {title}
      </h3>

      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={coloredData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            itemStyle={{ color: "#ffffff" }}
            labelStyle={{ color: "#ffffff" }}
          />
        </PieChart>
      </ResponsiveContainer>

      <CustomLegend data={data} />
    </div>
  );
}

// ─── 2. Bar chart ───
function BarChartCard({
  data,
  title,
  hint,
  height = 260,
}: {
  data: ChartData[];
  title: string;
  hint: string;
  height?: number;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-muted tracking-wider uppercase">
          {title}
        </h3>
        <p className="text-xs text-muted mt-1.5">{hint}</p>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5ddd0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#6b6b6b" }}
            axisLine={{ stroke: "#e5ddd0" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b6b6b" }}
            axisLine={{ stroke: "#e5ddd0" }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            itemStyle={{ color: "#ffffff" }}
            labelStyle={{ color: "#ffffff" }}
            cursor={{ fill: "rgba(201,169,97,0.1)" }}
          />
          <Bar dataKey="value" fill="#c9a961" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 🎯 Main component
// ═══════════════════════════════════════════════════
type Props = {
  categoryData: ChartData[];
  priceData: ChartData[];
  featuredData: ChartData[];
};

export function AnalyticsCharts({
  categoryData,
  priceData,
  featuredData,
}: Props) {
  const t = useTranslations("Admin.analytics");

  // Translate the featured/regular labels before rendering
  const translatedFeaturedData = featuredData.map((item) => ({
    ...item,
    name:
      item.name === "featured"
        ? t("featuredLabel")
        : item.name === "regular"
          ? t("regularLabel")
          : item.name,
  }));

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold">{t("title")}</h2>
        <p className="text-sm text-muted">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart data={categoryData} title={t("categoryTitle")} />
        <DonutChart
          data={translatedFeaturedData}
          title={t("featuredTitle")}
        />
        <div className="lg:col-span-2">
          <BarChartCard
            data={priceData}
            title={t("priceTitle")}
            hint={t("priceAxisHint")}
          />
        </div>
      </div>
    </div>
  );
}