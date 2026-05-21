"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/data-table";
import { getActionLabel, getModuleLabel } from "@/lib/audit-log";
import type { LogAction, LogModule, OperationLog } from "@/lib/audit-log";
import { cn } from "@/lib/utils";

function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const actionClass: Record<LogAction, string> = {
  create: "bg-emerald-100 text-emerald-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  login: "bg-violet-100 text-violet-700",
  logout: "bg-gray-100 text-gray-700",
  view: "bg-sky-100 text-sky-700",
  export: "bg-amber-100 text-amber-700",
  other: "bg-muted text-muted-foreground",
};

const moduleClass: Record<LogModule, string> = {
  bill: "bg-orange-50 text-orange-700",
  material: "bg-cyan-50 text-cyan-700",
  user: "bg-indigo-50 text-indigo-700",
  settings: "bg-slate-100 text-slate-700",
  payment: "bg-pink-50 text-pink-700",
  auth: "bg-violet-50 text-violet-700",
  system: "bg-gray-100 text-gray-600",
};

function dateFilterFn(
  row: { getValue: (id: string) => unknown },
  id: string,
  value: unknown,
) {
  const raw = String(value ?? "").trim();
  if (!raw) return true;
  const iso = String(row.getValue(id));
  return iso.startsWith(raw) || formatDateTime(iso).includes(raw);
}

export const columns: ColumnDef<OperationLog>[] = [
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="操作时间" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap tabular-nums text-sm">
        {formatDateTime(row.getValue("createdAt"))}
      </span>
    ),
    filterFn: dateFilterFn,
  },
  {
    accessorKey: "operator",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="操作人" />
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "module",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="模块" />
    ),
    filterFn: "equalsString",
    cell: ({ row }) => {
      const module = row.getValue("module") as LogModule;
      return (
        <span
          className={cn(
            "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
            moduleClass[module],
          )}
        >
          {getModuleLabel(module)}
        </span>
      );
    },
  },
  {
    accessorKey: "action",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="操作" />
    ),
    filterFn: "equalsString",
    cell: ({ row }) => {
      const action = row.getValue("action") as LogAction;
      return (
        <span
          className={cn(
            "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
            actionClass[action],
          )}
        >
          {getActionLabel(action)}
        </span>
      );
    },
  },
  {
    accessorKey: "target",
    header: "对象",
    filterFn: "includesString",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("target")}</span>
    ),
  },
  {
    accessorKey: "detail",
    header: "详情",
    cell: ({ row }) => (
      <span className="line-clamp-2 max-w-md text-sm text-muted-foreground">
        {row.original.detail ?? "—"}
      </span>
    ),
    filterFn: "includesString",
  },
  {
    accessorKey: "status",
    header: "结果",
    filterFn: "equalsString",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return (
        <span
          className={cn(
            "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
            status === "success"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600",
          )}
        >
          {status === "success" ? "成功" : "失败"}
        </span>
      );
    },
  },
];
