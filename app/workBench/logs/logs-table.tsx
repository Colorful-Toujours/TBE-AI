"use client";

import { useCallback, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

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
import {
  ACTION_LABELS,
  clearOperationLogs,
  MODULE_LABELS,
  recordOperation,
  useOperationLogs,
} from "@/lib/audit-log";
import type { OperationLog } from "@/lib/audit-log";

import { columns } from "./columns";

const logFilters: DataTableFilterField<OperationLog>[] = [
  { type: "date", id: "createdAt", placeholder: "操作日期" },
  { type: "text", id: "operator", placeholder: "操作人" },
  {
    type: "select",
    id: "module",
    placeholder: "模块",
    options: Object.entries(MODULE_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  },
  {
    type: "select",
    id: "action",
    placeholder: "操作类型",
    options: Object.entries(ACTION_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  },
  {
    type: "select",
    id: "status",
    placeholder: "结果",
    options: [
      { label: "成功", value: "success" },
      { label: "失败", value: "failure" },
    ],
  },
  { type: "text", id: "target", placeholder: "对象" },
];

export function LogsTable() {
  const { logs, refresh } = useOperationLogs();
  const [query, setQuery] = useState<DataTableQueryParams>({});
  const [clearOpen, setClearOpen] = useState(false);

  const handleQueryChange = useCallback((next: DataTableQueryParams) => {
    setQuery(next);
  }, []);

  const handleClearConfirm = useCallback(() => {
    clearOperationLogs();
    recordOperation({
      action: "delete",
      module: "system",
      target: "操作日志",
      detail: "清空全部操作日志",
    });
    refresh();
    setClearOpen(false);
  }, [refresh]);

  const sortedLogs = useMemo(
    () =>
      [...logs].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [logs],
  );

  return (
    <div className="space-y-3">
      <DataTable
        columns={columns}
        data={sortedLogs}
        getRowId={(row) => row.id}
        enableGlobalFilter
        enableRowSelection={false}
        searchPlaceholder="搜索日志详情、对象…"
        filters={logFilters}
        onQueryChange={handleQueryChange}
        emptyMessage="暂无操作日志"
        pageSize={15}
        toolbar={
          <Button
            size="sm"
            variant="outline"
            onClick={() => setClearOpen(true)}
            disabled={logs.length === 0}
          >
            <Trash2 className="size-4" />
            清空日志
          </Button>
        }
      />

      {Object.keys(query).length > 0 ? (
        <p className="text-xs text-muted-foreground">
          当前查询：{JSON.stringify(query)}
        </p>
      ) : null}

      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认清空操作日志？</AlertDialogTitle>
            <AlertDialogDescription>
              将删除全部 {logs.length} 条日志记录，此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleClearConfirm}
            >
              清空
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
