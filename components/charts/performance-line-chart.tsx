"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const monthlyData = [
  { month: "3月", bills: 42, amount: 52 },
  { month: "4月", bills: 48, amount: 58 },
  { month: "5月", bills: 55, amount: 65 },
  { month: "6月", bills: 62, amount: 72 },
  { month: "7月", bills: 58, amount: 68 },
  { month: "8月", bills: 70, amount: 78 },
  { month: "9月", bills: 65, amount: 74 },
  { month: "10月", bills: 72, amount: 82 },
  { month: "11月", bills: 78, amount: 86 },
  { month: "12月", bills: 85, amount: 90 },
];

const rangeOptions = [
  { value: "12m", label: "最近 12 个月" },
  { value: "6m", label: "最近 6 个月" },
  { value: "3m", label: "最近 3 个月" },
] as const;

function ChartLegend() {
  return (
    <div className="mb-4 flex items-center justify-center gap-6 text-sm">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <span className="size-2.5 rounded-full bg-[#3b82f6]" />
        账单笔数
      </span>
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <span className="size-2.5 rounded-full bg-[#22c55e]" />
        流水金额 (K)
      </span>
    </div>
  );
}

export function PerformanceLineChart() {
  const [mounted, setMounted] = useState(false);
  const [range, setRange] = useState<string>("12m");

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const data =
    range === "3m"
      ? monthlyData.slice(-3)
      : range === "6m"
        ? monthlyData.slice(-6)
        : monthlyData;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-foreground">收支趋势</h3>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger size="sm" className="min-w-[140px]">
            <SelectValue placeholder="选择时间范围" />
          </SelectTrigger>
          <SelectContent align="end">
            {rangeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ChartLegend />

      <div className="h-[320px] w-full min-w-0">
        {!mounted ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-muted" />
        ) : (
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical />
            <XAxis
              dataKey="month"
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              axisLine={{ stroke: "#e5e7eb" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Legend content={() => null} />
            <Line
              type="monotone"
              dataKey="bills"
              name="账单笔数"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              name="流水金额 (K)"
              stroke="#22c55e"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
