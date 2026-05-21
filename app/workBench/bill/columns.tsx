"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { DataTableColumnHeader } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export type BillMaterial = {
  id: string;
  /** 关联材料库 ID */
  materialId?: string;
  name: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
};

export type Bill = {
  id: string;
  date: string;
  user: string;
  community: string;
  unit: string;
  receivable: number;
  received: number;
  materials: BillMaterial[];
};

type BillColumnActions = {
  onEdit: (bill: Bill) => void;
  onDelete: (bill: Bill) => void;
};

function amountFilterFn(
  row: { getValue: (id: string) => unknown },
  id: string,
  value: unknown,
) {
  const raw = String(value ?? "").trim();
  if (!raw) return true;
  const amount = Number(row.getValue(id));
  const numericQuery = raw.replace(/[^\d.]/g, "");
  if (numericQuery && String(amount).includes(numericQuery)) return true;
  return formatCurrency(amount).includes(raw);
}

function dateFilterFn(
  row: { getValue: (id: string) => unknown },
  id: string,
  value: unknown,
) {
  const raw = String(value ?? "").trim();
  if (!raw) return true;
  return String(row.getValue(id)).startsWith(raw);
}

export function createBillColumns({
  onEdit,
  onDelete,
}: BillColumnActions): ColumnDef<Bill>[] {
  return [
    {
      id: "expand",
      header: () => null,
      cell: ({ row }) => {
        const hasMaterials = row.original.materials.length > 0;
        if (!hasMaterials) return <span className="inline-block w-8" />;

        return (
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => row.toggleExpanded()}
          >
            {row.getIsExpanded() ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="账单日期" />
      ),
      filterFn: dateFilterFn,
    },
    {
      accessorKey: "user",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="用户" />
      ),
      filterFn: "includesString",
    },
    {
      id: "location",
      header: "小区 / 单元",
      cell: ({ row }) => {
        const bill = row.original;
        return (
          <div className="min-w-[140px]">
            <p className="font-medium">{bill.community}</p>
            <p className="text-xs text-muted-foreground">{bill.unit}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "community",
      header: "小区",
      enableHiding: true,
      filterFn: "includesString",
    },
    {
      accessorKey: "unit",
      header: "单元",
      enableHiding: true,
      filterFn: "includesString",
    },
    {
      accessorKey: "receivable",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="应收款"
          className="justify-end"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium tabular-nums">
          {formatCurrency(row.getValue("receivable"))}
        </div>
      ),
      filterFn: amountFilterFn,
    },
    {
      accessorKey: "received",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="实收款"
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const received = row.getValue("received") as number;
        const receivable = row.original.receivable;
        const isPartial = received < receivable;
        return (
          <div
            className={cn(
              "text-right font-medium tabular-nums",
              isPartial && "text-amber-600",
            )}
          >
            {formatCurrency(received)}
          </div>
        );
      },
      filterFn: amountFilterFn,
    },
    {
      id: "materials",
      header: "购买材料",
      cell: ({ row }) => {
        const count = row.original.materials.length;
        if (!count) {
          return <span className="text-muted-foreground">—</span>;
        }
        const total = row.original.materials.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0,
        );
        return (
          <div>
            <p className="font-medium">{count} 项材料</p>
            <p className="text-xs text-muted-foreground">
              合计 {formatCurrency(total)}
            </p>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: "actions",
      header: "操作",
      enableHiding: false,
      cell: ({ row }) => {
        const bill = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">打开菜单</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>操作</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(bill)}>
                <Pencil className="size-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(bill)}
              >
                <Trash2 className="size-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
