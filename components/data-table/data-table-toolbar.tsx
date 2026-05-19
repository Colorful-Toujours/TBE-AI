"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchPlaceholder?: string;
  enableGlobalFilter?: boolean;
  enableColumnVisibility?: boolean;
  toolbar?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "搜索…",
  enableGlobalFilter = true,
  enableColumnVisibility = true,
  toolbar,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const globalFilter = table.getState().globalFilter as string | undefined;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {enableGlobalFilter ? (
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter ?? ""}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="h-8 w-full sm:max-w-xs"
          />
        ) : null}
        {isFiltered ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2"
          >
            重置筛选
            <X className="size-3.5" />
          </Button>
        ) : null}
        {toolbar}
      </div>
      {enableColumnVisibility ? <DataTableViewOptions table={table} /> : null}
    </div>
  );
}
