"use client";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";

import { columns, type Payment } from "./columns";

type PaymentTableProps = {
  data: Payment[];
};

export function PaymentTable({ data }: PaymentTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="搜索邮箱、状态…"
      getRowId={(row) => row.id}
      toolbar={
        <Button size="sm" variant="outline">
          导出
        </Button>
      }
    />
  );
}
