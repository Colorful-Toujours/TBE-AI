"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string;
  /** 加载中 */
  loading?: boolean;
  /** 无数据提示 */
  emptyMessage?: string;
  /** 搜索框占位 */
  searchPlaceholder?: string;
  /** 默认每页条数 */
  pageSize?: number;
  /** 每页条数选项 */
  pageSizeOptions?: number[];
  /** 工具栏右侧自定义内容 */
  toolbar?: React.ReactNode;
  /** 全局搜索 */
  enableGlobalFilter?: boolean;
  /** 列排序 */
  enableSorting?: boolean;
  /** 行选择 */
  enableRowSelection?: boolean;
  /** 列显示切换 */
  enableColumnVisibility?: boolean;
  /** 分页 */
  enablePagination?: boolean;
  /** 服务端分页 */
  manualPagination?: boolean;
  pageCount?: number;
  rowCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  /** 服务端排序 */
  manualSorting?: boolean;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  /** 服务端筛选 */
  manualFiltering?: boolean;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  globalFilter?: string;
  onGlobalFilterChange?: OnChangeFn<string>;
  /** 行选择受控 */
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  /** 列可见性受控 */
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  getRowId?: (row: TData, index: number) => string;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  className,
  loading = false,
  emptyMessage = "暂无数据",
  searchPlaceholder,
  pageSize = 10,
  pageSizeOptions,
  toolbar,
  enableGlobalFilter = true,
  enableSorting = true,
  enableRowSelection = true,
  enableColumnVisibility = true,
  enablePagination = true,
  manualPagination = false,
  pageCount,
  rowCount,
  pagination: controlledPagination,
  onPaginationChange,
  manualSorting = false,
  sorting: controlledSorting,
  onSortingChange,
  manualFiltering = false,
  columnFilters: controlledColumnFilters,
  onColumnFiltersChange,
  globalFilter: controlledGlobalFilter,
  onGlobalFilterChange,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: controlledSorting ?? sorting,
      columnFilters: controlledColumnFilters ?? columnFilters,
      columnVisibility: controlledColumnVisibility ?? columnVisibility,
      rowSelection: controlledRowSelection ?? rowSelection,
      globalFilter: controlledGlobalFilter ?? globalFilter,
      pagination: controlledPagination ?? pagination,
    },
    enableRowSelection,
    enableSorting,
    manualPagination,
    manualSorting,
    manualFiltering,
    pageCount: manualPagination ? pageCount : undefined,
    rowCount: manualPagination ? rowCount : undefined,
    onSortingChange: onSortingChange ?? setSorting,
    onColumnFiltersChange: onColumnFiltersChange ?? setColumnFilters,
    onColumnVisibilityChange:
      onColumnVisibilityChange ?? setColumnVisibility,
    onRowSelectionChange: onRowSelectionChange ?? setRowSelection,
    onGlobalFilterChange: onGlobalFilterChange ?? setGlobalFilter,
    onPaginationChange: onPaginationChange ?? setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: manualFiltering ? undefined : getFilteredRowModel(),
    getPaginationRowModel:
      enablePagination && !manualPagination
        ? getPaginationRowModel()
        : undefined,
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getRowId,
  });

  const showToolbar =
    enableGlobalFilter || enableColumnVisibility || Boolean(toolbar);

  return (
    <div className={cn("space-y-4", className)}>
      {showToolbar ? (
        <DataTableToolbar
          table={table}
          searchPlaceholder={searchPlaceholder}
          enableGlobalFilter={enableGlobalFilter}
          enableColumnVisibility={enableColumnVisibility}
          toolbar={toolbar}
        />
      ) : null}

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center"
                >
                  <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {enablePagination ? (
        <DataTablePagination
          table={table}
          pageSizeOptions={pageSizeOptions}
          rowCount={rowCount}
        />
      ) : null}
    </div>
  );
}
