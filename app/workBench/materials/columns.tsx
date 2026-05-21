"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
import type { Material } from "@/lib/materials";
import { cn } from "@/lib/utils";

export type { Material };

type MaterialColumnActions = {
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
};

function priceFilterFn(
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

export function createMaterialColumns({
  onEdit,
  onDelete,
}: MaterialColumnActions): ColumnDef<Material>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="材料名称" />
      ),
      filterFn: "includesString",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.getValue("name")}</p>
          {row.original.remark ? (
            <p className="text-xs text-muted-foreground">{row.original.remark}</p>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="分类" />
      ),
      filterFn: "equalsString",
      cell: ({ row }) => (
        <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
          {row.getValue("category")}
        </span>
      ),
    },
    {
      accessorKey: "unit",
      header: "单位",
      filterFn: "includesString",
    },
    {
      accessorKey: "unitPrice",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="单价"
          className="justify-end"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium tabular-nums">
          {formatCurrency(row.getValue("unitPrice"))}
          <span className="text-muted-foreground"> / {row.original.unit}</span>
        </div>
      ),
      filterFn: priceFilterFn,
    },
    {
      accessorKey: "stock",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="库存"
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const stock = row.getValue("stock") as number;
        return (
          <div
            className={cn(
              "text-right font-medium tabular-nums",
              stock <= 20 && "text-amber-600",
              stock === 0 && "text-destructive",
            )}
          >
            {stock} {row.original.unit}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const raw = String(value ?? "").trim();
        if (!raw) return true;
        return String(row.getValue(id)).includes(raw.replace(/[^\d]/g, ""));
      },
    },
    {
      id: "actions",
      header: "操作",
      enableHiding: false,
      cell: ({ row }) => {
        const material = row.original;
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
              <DropdownMenuItem onClick={() => onEdit(material)}>
                <Pencil className="size-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(material)}
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
