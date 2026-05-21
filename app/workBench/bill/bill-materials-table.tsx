"use client";

import type { BillMaterial } from "./columns";
import { formatCurrency } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type BillMaterialsTableProps = {
  materials: BillMaterial[];
};

export function BillMaterialsTable({ materials }: BillMaterialsTableProps) {
  const grandTotal = materials.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  return (
    <div className="border-t bg-muted/20 px-4 py-3">
      <p className="mb-2 text-sm font-medium text-foreground">
        当前账单 · 购买材料明细
      </p>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>材料名称</TableHead>
            <TableHead>单位</TableHead>
            <TableHead className="text-right">数量</TableHead>
            <TableHead className="text-right">单价</TableHead>
            <TableHead className="text-right">小计</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.map((item) => {
            const subtotal = item.quantity * item.unitPrice;
            return (
              <TableRow key={item.id} className="hover:bg-muted/40">
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {item.unit ?? "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(item.unitPrice)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(subtotal)}
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={4} className="text-right font-medium">
              材料合计
            </TableCell>
            <TableCell className="text-right font-semibold tabular-nums">
              {formatCurrency(grandTotal)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
