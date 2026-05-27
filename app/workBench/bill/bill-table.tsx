"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Row } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import {
  DataTable,
  type DataTableFilterField,
  type DataTableQueryParams,
} from "@/components/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { recordOperation } from "@/lib/audit-log";
import {
  createBill,
  deleteBill,
  listBills,
  updateBill,
} from "@/lib/backend-api";

import { BillFormDialog, type BillFormValues } from "./bill-form-dialog";
import { BillMaterialsTable } from "./bill-materials-table";
import { createBillColumns, type Bill } from "./columns";

const billFilters: DataTableFilterField<Bill>[] = [
  { type: "date", id: "date", placeholder: "账单日期" },
  { type: "text", id: "user", placeholder: "用户" },
  { type: "text", id: "community", placeholder: "小区" },
  { type: "text", id: "unit", placeholder: "单元（如 1单元101）" },
  { type: "text", id: "receivable", placeholder: "应收款" },
  { type: "text", id: "received", placeholder: "实收款" },
];

type BillTableProps = {
  initialData: Bill[];
};

export function BillTable({ initialData }: BillTableProps) {
  const [bills, setBills] = useState<Bill[]>(initialData);
  const [query, setQuery] = useState<DataTableQueryParams>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");

  const loadBills = useCallback(async (params?: DataTableQueryParams) => {
    setLoading(true);
    setApiMessage("");
    try {
      const result = await listBills(params);
      setBills(result.items);
    } catch (error) {
      setApiMessage(error instanceof Error ? error.message : "账单数据加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBills(query);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadBills, query]);

  const handleCreate = useCallback(() => {
    setEditingBill(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((bill: Bill) => {
    setEditingBill(bill);
    setFormOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((bill: Bill) => {
    setDeletingBill(bill);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingBill) return;
    setApiMessage("");
    try {
      await deleteBill(deletingBill.id);
      setBills((prev) => prev.filter((b) => b.id !== deletingBill.id));
      recordOperation({
        action: "delete",
        module: "bill",
        target: `账单 ${deletingBill.id}`,
        detail: `删除账单：${deletingBill.user} · ${deletingBill.community} ${deletingBill.unit}`,
      });
      setDeletingBill(null);
    } catch (error) {
      setApiMessage(error instanceof Error ? error.message : "删除账单失败");
    }
  }, [deletingBill]);

  const handleFormSubmit = useCallback(
    async (values: BillFormValues) => {
      setApiMessage("");
      try {
        if (editingBill) {
          const updated = await updateBill(editingBill.id, values);
          setBills((prev) =>
            prev.map((b) => (b.id === editingBill.id ? updated : b)),
          );
          recordOperation({
            action: "update",
            module: "bill",
            target: `账单 ${editingBill.id}`,
            detail: `修改账单：${values.user} · ${values.community} ${values.unit}`,
          });
        } else {
          const created = await createBill(values);
          setBills((prev) => [...prev, created]);
          recordOperation({
            action: "create",
            module: "bill",
            target: `账单 ${created.id}`,
            detail: `新增账单：${values.user} · ${values.community} ${values.unit}，材料 ${values.materials.length} 项`,
          });
        }
        setEditingBill(null);
      } catch (error) {
        setApiMessage(error instanceof Error ? error.message : "保存账单失败");
      }
    },
    [editingBill],
  );

  const handleQueryChange = useCallback((next: DataTableQueryParams) => {
    setQuery(next);
  }, []);

  const columns = useMemo(
    () =>
      createBillColumns({
        onEdit: handleEdit,
        onDelete: handleDeleteRequest,
      }),
    [handleEdit, handleDeleteRequest],
  );

  const renderSubRow = useCallback((row: Row<Bill>) => {
    return <BillMaterialsTable materials={row.original.materials} />;
  }, []);

  const getRowCanExpand = useCallback(
    (row: Row<Bill>) => row.original.materials.length > 0,
    [],
  );

  return (
    <div className="space-y-3">
      <DataTable
        columns={columns}
        data={bills}
        getRowId={(row) => row.id}
        loading={loading}
        enableGlobalFilter={false}
        enableRowSelection={false}
        filters={billFilters}
        onQueryChange={handleQueryChange}
        enableExpanding
        renderSubRow={renderSubRow}
        getRowCanExpand={getRowCanExpand}
        defaultColumnVisibility={{
          community: false,
          unit: false,
        }}
        emptyMessage="暂无账单数据"
        pageSize={10}
        toolbar={
          <Button size="sm" onClick={handleCreate}>
            <Plus className="size-4" />
            新增账单
          </Button>
        }
      />

      {Object.keys(query).length > 0 ? (
        <p className="text-xs text-muted-foreground">
          当前查询：{JSON.stringify(query)}
        </p>
      ) : null}

      {apiMessage ? (
        <p className="text-sm font-medium text-destructive">{apiMessage}</p>
      ) : null}

      <BillFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        bill={editingBill}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog
        open={Boolean(deletingBill)}
        onOpenChange={(open) => !open && setDeletingBill(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除账单？</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingBill
                ? `将删除 ${deletingBill.user}（${deletingBill.community} ${deletingBill.unit}）的账单，此操作不可撤销。`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
