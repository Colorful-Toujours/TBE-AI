"use client";

import { useCallback, useMemo, useState } from "react";
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
import { getRoleLabel, ROLE_OPTIONS } from "@/lib/rbac";

import { createUserColumns, type SystemUser } from "./columns";
import { RolePermissionsPanel } from "./role-permissions-panel";
import { UserFormDialog, type UserFormValues } from "./user-form-dialog";
import { UserPermissionsDialog } from "./user-permissions-dialog";

const userFilters: DataTableFilterField<SystemUser>[] = [
  { type: "text", id: "name", placeholder: "姓名" },
  { type: "text", id: "phone", placeholder: "手机号" },
  {
    type: "select",
    id: "role",
    placeholder: "角色",
    options: ROLE_OPTIONS.map((r) => ({ label: r.label, value: r.value })),
  },
  {
    type: "select",
    id: "status",
    placeholder: "状态",
    options: [
      { label: "启用", value: "启用" },
      { label: "禁用", value: "禁用" },
    ],
  },
];

type UserTableProps = {
  initialData: SystemUser[];
};

export function UserTable({ initialData }: UserTableProps) {
  const [users, setUsers] = useState<SystemUser[]>(initialData);
  const [query, setQuery] = useState<DataTableQueryParams>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<SystemUser | null>(null);
  const [permissionUser, setPermissionUser] = useState<SystemUser | null>(null);

  const handleCreate = useCallback(() => {
    setEditingUser(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((user: SystemUser) => {
    setEditingUser(user);
    setFormOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((user: SystemUser) => {
    setDeletingUser(user);
  }, []);

  const handleViewPermissions = useCallback((user: SystemUser) => {
    setPermissionUser(user);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deletingUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    recordOperation({
      action: "delete",
      module: "user",
      target: `用户 ${deletingUser.id}`,
      detail: `删除用户：${deletingUser.name}`,
    });
    setDeletingUser(null);
  }, [deletingUser]);

  const handleFormSubmit = useCallback(
    (values: UserFormValues) => {
      if (editingUser) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? {
                  ...values,
                  id: editingUser.id,
                  createdAt: editingUser.createdAt,
                }
              : u,
          ),
        );
        recordOperation({
          action: "update",
          module: "user",
          target: `用户 ${editingUser.id}`,
          detail: `修改用户：${values.name}，角色 ${getRoleLabel(values.role)}`,
        });
      } else {
        const newId = `u-${Date.now()}`;
        setUsers((prev) => [
          ...prev,
          {
            ...values,
            id: newId,
            createdAt: new Date().toISOString().slice(0, 10),
          },
        ]);
        recordOperation({
          action: "create",
          module: "user",
          target: `用户 ${newId}`,
          detail: `新增用户：${values.name}，角色 ${getRoleLabel(values.role)}`,
        });
      }
      setEditingUser(null);
    },
    [editingUser],
  );

  const handleQueryChange = useCallback((next: DataTableQueryParams) => {
    setQuery(next);
  }, []);

  const columns = useMemo(
    () =>
      createUserColumns({
        onEdit: handleEdit,
        onDelete: handleDeleteRequest,
        onViewPermissions: handleViewPermissions,
      }),
    [handleEdit, handleDeleteRequest, handleViewPermissions],
  );

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <DataTable
          columns={columns}
          data={users}
          getRowId={(row) => row.id}
          enableGlobalFilter={false}
          enableRowSelection={false}
          filters={userFilters}
          onQueryChange={handleQueryChange}
          defaultColumnVisibility={{ phone: false }}
          emptyMessage="暂无用户"
          pageSize={10}
          toolbar={
            <Button size="sm" onClick={handleCreate}>
              <Plus className="size-4" />
              新增用户
            </Button>
          }
        />
        {Object.keys(query).length > 0 ? (
          <p className="text-xs text-muted-foreground">
            当前查询：{JSON.stringify(query)}
          </p>
        ) : null}
      </section>

      <RolePermissionsPanel />

      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editingUser}
        onSubmit={handleFormSubmit}
      />

      <UserPermissionsDialog
        open={Boolean(permissionUser)}
        onOpenChange={(open) => !open && setPermissionUser(null)}
        user={permissionUser}
      />

      <AlertDialog
        open={Boolean(deletingUser)}
        onOpenChange={(open) => !open && setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除用户？</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingUser
                ? `将删除用户「${deletingUser.name}」，该账号将无法登录。`
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
