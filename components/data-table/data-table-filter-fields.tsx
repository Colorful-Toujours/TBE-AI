"use client";

import { ColumnFiltersState, Table } from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** 文本筛选 */
export type DataTableTextFilterField<TData> = {
  type: "text";
  /** 对应列 accessorKey / column id */
  id: keyof TData & string;
  label?: string;
  placeholder?: string;
};

/** 下拉筛选 */
export type DataTableSelectFilterField<TData> = {
  type: "select";
  id: keyof TData & string;
  label?: string;
  placeholder?: string;
  /** value 为空字符串时表示「全部」 */
  options: { label: string; value: string }[];
};

/** 日期筛选 */
export type DataTableDateFilterField<TData> = {
  type: "date";
  id: keyof TData & string;
  label?: string;
  placeholder?: string;
};

export type DataTableFilterField<TData> =
  | DataTableTextFilterField<TData>
  | DataTableSelectFilterField<TData>
  | DataTableDateFilterField<TData>;

export type DataTableQueryParams = Record<string, string>;

/** 从筛选状态汇总查询参数（便于请求接口） */
export function getDataTableQueryParams(
  globalFilter: unknown,
  columnFilters: ColumnFiltersState,
): DataTableQueryParams {
  const query: DataTableQueryParams = {};

  if (typeof globalFilter === "string" && globalFilter.trim()) {
    query.q = globalFilter.trim();
  }

  for (const filter of columnFilters) {
    if (
      filter.value !== undefined &&
      filter.value !== null &&
      String(filter.value) !== ""
    ) {
      query[filter.id] = String(filter.value);
    }
  }

  return query;
}

/** 从 table 实例读取当前查询参数 */
export function getDataTableQueryParamsFromTable<TData>(
  table: Table<TData>,
): DataTableQueryParams {
  const { globalFilter, columnFilters } = table.getState();
  return getDataTableQueryParams(globalFilter, columnFilters);
}

type DataTableFilterFieldsProps<TData> = {
  table: Table<TData>;
  filters: DataTableFilterField<TData>[];
};

export function DataTableFilterFields<TData>({
  table,
  filters,
}: DataTableFilterFieldsProps<TData>) {
  if (!filters.length) return null;

  return (
    <>
      {filters.map((field) => {
        const column = table.getColumn(field.id);
        if (!column) return null;

        const filterValue = (column.getFilterValue() as string) ?? "";

        if (field.type === "text") {
          return (
            <Input
              key={field.id}
              placeholder={field.placeholder ?? field.label ?? "筛选…"}
              value={filterValue}
              onChange={(e) => column.setFilterValue(e.target.value)}
              className="h-8 w-full sm:w-[140px]"
            />
          );
        }

        if (field.type === "date") {
          return (
            <Input
              key={field.id}
              type="date"
              placeholder={field.placeholder ?? field.label ?? "选择日期"}
              value={filterValue}
              onChange={(e) => column.setFilterValue(e.target.value)}
              className="h-8 w-full sm:w-[150px]"
            />
          );
        }

        return (
          <Select
            key={field.id}
            value={filterValue || "__all__"}
            onValueChange={(value) =>
              column.setFilterValue(value === "__all__" ? undefined : value)
            }
          >
            <SelectTrigger size="sm" className="h-8 w-full sm:w-[140px]">
              <SelectValue
                placeholder={field.placeholder ?? field.label ?? "请选择"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">全部</SelectItem>
              {field.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      })}
    </>
  );
}
