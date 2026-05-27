"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const categoryData = [
  { category: "餐饮", count: 156, color: "#3b82f6" },
  { category: "交通", count: 142, color: "#22c55e" },
  { category: "购物", count: 128, color: "#f97316" },
  { category: "娱乐", count: 98, color: "#ef4444" },
  { category: "居住", count: 87, color: "#a855f7" },
  { category: "医疗", count: 76, color: "#ec4899" },
  { category: "其他", count: 65, color: "#06b6d4" },
];

export function CategoryBarChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-foreground">分类支出</h3>
        <span className="text-sm text-muted-foreground">本年度</span>
      </div>

      <div className="mb-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span className="size-2.5 rounded-full bg-[#3b82f6]" />
        账单笔数
      </div>

      <div className="h-[320px] w-full min-w-0">
        {!mounted ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-muted" />
        ) : (
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart
            data={categoryData}
            margin={{ top: 8, right: 8, left: -12, bottom: 24 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="category"
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
              angle={-12}
              textAnchor="end"
              height={48}
              interval={0}
            />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 160]}
              ticks={[0, 20, 40, 60, 80, 100, 120, 140, 160]}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Bar dataKey="count" name="账单笔数" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {categoryData.map((entry) => (
                <Cell key={entry.category} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
