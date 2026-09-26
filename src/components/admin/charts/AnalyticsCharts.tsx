"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ═══════════════════════════════════════════════════
// 📊 Analytics Charts — رسوم بيانية للوحة التحكم
// ═══════════════════════════════════════════════════

const COLORS = ["#c9a961", "#a88847", "#f5ecd9", "#1a1a1a", "#6b6b6b"];

type ChartData = {
  name: string;
  value: number;
};

// ─── Legend مخصص أسفل الرسم ───
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

// ─── 1. رسم دائري ───
function DonutChart({
  data,
  title,
  height = 260,
}: {
  data: ChartData[];
  title: string;
  height?: number;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-sm font-medium text-muted mb-4 tracking-wider uppercase">
        {title}
      </h3>

      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend مخصص أسفل الرسم — بدون تداخل */}
      <CustomLegend data={data} />
    </div>
  );
}

// ─── 2. رسم أعمدة ───
function BarChartCard({
  data,
  title,
  height = 260,
}: {
  data: ChartData[];
  title: string;
  height?: number;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-muted tracking-wider uppercase">
          {title}
        </h3>
        <p className="text-xs text-muted mt-1.5">
          المحور الأفقي: نطاق السعر · المحور العمودي: عدد الأطباق
        </p>
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
              color: "#fff",
              fontSize: "12px",
            }}
            cursor={{ fill: "rgba(201,169,97,0.1)" }}
          />
          <Bar dataKey="value" fill="#c9a961" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// 🎯 المكوّن الرئيسي
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
  return (
    <div className="mt-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold">📊 التحليلات</h2>
        <p className="text-sm text-muted">
          نظرة بصرية على توزيع القائمة والأسعار
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart data={categoryData} title="الأطباق حسب التصنيف" />
        <DonutChart data={featuredData} title="المميزة مقابل العادية" />
        <div className="lg:col-span-2">
          <BarChartCard data={priceData} title="توزيع الأسعار (ج.م)" />
        </div>
      </div>
    </div>
  );
}