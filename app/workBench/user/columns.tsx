"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Shield, Trash2 } from "lucide-react";

import {
  DataTableColumnHeader,
} from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getRoleLabel, getRolePermissions } from "@/lib/rbac";
import type { UserRole } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export type SystemUser = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  status: "启用" | "禁用";
  createdAt: string;
};

const roleBadgeClass: Record<UserRole, string> = {
  super_admin: "bg-violet-100 text-violet-700",
  admin: "bg-blue-100 text-blue-700",
  employee: "bg-emerald-100 text-emerald-700",
  finance: "bg-amber-100 text-amber-700",
  user: "bg-gray-100 text-gray-700",
};

type UserColumnActions = {
  onEdit: (user: SystemUser) => void;
  onDelete: (user: SystemUser) => void;
  onViewPermissions: (user: SystemUser) => void;
};

export function createUserColumns({
  onEdit,
  onDelete,
  onViewPermissions,
}: UserColumnActions): ColumnDef<SystemUser>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="姓名" />
      ),
      filterFn: "includesString",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.getValue("name")}</p>
          <p className="text-xs text-muted-foreground">{row.original.phone}</p>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "手机号",
      enableHiding: true,
      filterFn: "includesString",
    },
    {
      accessorKey: "email",
      header: "邮箱",
      cell: ({ row }) => row.original.email ?? "—",
      filterFn: "includesString",
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="角色" />
      ),
      filterFn: "equalsString",
      cell: ({ row }) => {
        const role = row.getValue("role") as UserRole;
        return (
          <span
            className={cn(
              "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
              roleBadgeClass[role],
            )}
          >
            {getRoleLabel(role)}
          </span>
        );
      },
    },
    {
      id: "permissions",
      header: "权限",
      cell: ({ row }) => {
        const count = getRolePermissions(row.original.role).length;
        return (
          <button
            type="button"
            className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            onClick={() => onViewPermissions(row.original)}
          >
            {count} 项权限
          </button>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: "状态",
      filterFn: "equalsString",
      cell: ({ row }) => {
        const status = row.getValue("status");
        return (
          <span
            className={cn(
              "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
              status === "启用"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600",
            )}
          >
            {String(status)}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="创建时间" />
      ),
    },
    {
      id: "actions",
      header: "操作",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        const isSuperAdmin = user.role === "super_admin";

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
              <DropdownMenuItem onClick={() => onViewPermissions(user)}>
                <Shield className="size-4" />
                查看权限
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Pencil className="size-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={isSuperAdmin}
                onClick={() => onDelete(user)}
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
