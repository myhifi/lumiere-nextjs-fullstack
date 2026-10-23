"use client";

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";
import { getLocalizedName } from "@/lib/utils/locale";

type TimelineData = { date: string; revenue: number }[];
type TopItem = { id: string; name: string; nameEn: string | null; totalSold: number }[];

type Props = {
  timeline: TimelineData;
  topItems: TopItem;
  locale: string;
  t: {
    revenueTitle: string;
    topItemsTitle: string;
    noData: string;
  };
};

export function FinancialCharts({ timeline, topItems, locale, t }: Props) {
  // Format dates for the X-axis (e.g., "Oct 24")
  const formattedTimeline = timeline.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString(
      locale === "ar" ? "ar-EG" : locale, 
      { month: 'short', day: 'numeric' }
    )
  }));

  // Format item names for the Y-axis
  const formattedItems = topItems.map(item => ({
    ...item,
    displayName: getLocalizedName(item.name, item.nameEn, locale)
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Revenue Timeline Chart */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
        <h3 className="font-bold text-lg mb-6">{t.revenueTitle}</h3>
        
        {timeline.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-muted">{t.noData}</div>
        ) : (
          <div className="h-72 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedTimeline} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5ddd0" vertical={false} />
                <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} tickMargin={10} stroke="#6b6b6b" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b6b6b" width={60} />
                <Tooltip 
                  formatter={(value) => [`${Number(value || 0).toFixed(2)} AED`, "Revenue"]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5ddd0' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#c9a961" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "#c9a961", strokeWidth: 0 }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Selling Items Chart */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
        <h3 className="font-bold text-lg mb-6">{t.topItemsTitle}</h3>
        
        {topItems.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-muted">{t.noData}</div>
        ) : (
          <div className="h-72 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={formattedItems} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5ddd0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#6b6b6b" />
                <YAxis 
                  type="category" 
                  dataKey="displayName" 
                  tick={{ fontSize: 12, fill: '#1a1a1a' }} 
                  stroke="#6b6b6b" 
                  width={100} 
                />
                <Tooltip 
                  formatter={(value) => [`${Number(value || 0)} units`, "Sold"]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5ddd0' }}
                  cursor={{ fill: '#faf7f2' }}
                />
                <Bar dataKey="totalSold" fill="#c9a961" radius={[0, 4, 4, 0]} barSize={24}>
                  {formattedItems.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#a88847" : "#c9a961"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}