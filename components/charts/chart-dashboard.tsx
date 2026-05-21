"use client";

import {
  CalendarClock,
  FileText,
  FolderOpen,
  MessageSquare,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { ChartStatCard } from "@/components/charts/chart-stat-card";
import { PerformanceLineChart } from "@/components/charts/performance-line-chart";
import { CategoryBarChart } from "@/components/charts/category-bar-chart";

const statCards = [
  {
    title: "总账单数",
    value: "1,247",
    description: "全部分类汇总",
    icon: FileText,
    trend: { value: "+12.5%", direction: "up" as const },
  },
  {
    title: "总流水",
    value: "¥89.2K",
    description: "累计交易流水",
    icon: TrendingUp,
    trend: { value: "+8.2%", direction: "up" as const },
  },
  {
    title: "交易笔数",
    value: "2,847",
    description: "本期交易笔数",
    icon: MessageSquare,
    trend: { value: "-3.1%", direction: "down" as const },
  },
  {
    title: "分类数",
    value: "24",
    description: "当前活跃分类",
    icon: Receipt,
    trend: { value: "+2", direction: "up" as const },
  },
  {
    title: "待入账",
    value: "18",
    description: "待确认入账",
    icon: CalendarClock,
  },
  {
    title: "附件数",
    value: "3,456",
    description: "票据与凭证附件",
    icon: FolderOpen,
    trend: { value: "+15.3%", direction: "up" as const },
  },
];

export function ChartDashboard() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          数据预览
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          收支趋势与分类统计一览
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {statCards.map((card) => (
          <ChartStatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PerformanceLineChart />
        <CategoryBarChart />
      </div>
    </div>
  );
}
