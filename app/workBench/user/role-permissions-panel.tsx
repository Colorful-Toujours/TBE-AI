"use client";

import { Fragment } from "react";
import {
  getPermissionLabel,
  PERMISSION_LIST,
  ROLE_DEFINITIONS,
  roleHasPermission,
} from "@/lib/rbac";
import type { UserRole } from "@/lib/rbac";
import { cn } from "@/lib/utils";

const roleOrder: UserRole[] = [
  "super_admin",
  "admin",
  "employee",
  "finance",
  "user",
];

export function RolePermissionsPanel() {
  const groups = [...new Set(PERMISSION_LIST.map((p) => p.group))];

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b px-4 py-3 sm:px-6">
        <h2 className="text-base font-semibold">角色与权限</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          五种角色：超级管理、管理员、员工、财务、用户。勾选表示该角色拥有对应权限。
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                权限
              </th>
              {roleOrder.map((roleId) => (
                <th
                  key={roleId}
                  className="px-3 py-3 text-center font-medium whitespace-nowrap"
                >
                  <div>{ROLE_DEFINITIONS[roleId].label}</div>
                  <div className="mt-0.5 text-xs font-normal text-muted-foreground">
                    {ROLE_DEFINITIONS[roleId].permissions.length} 项
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group}>
                <tr className="bg-muted/20">
                  <td
                    colSpan={roleOrder.length + 1}
                    className="px-4 py-2 text-xs font-semibold text-muted-foreground"
                  >
                    {group}
                  </td>
                </tr>
                {PERMISSION_LIST.filter((p) => p.group === group).map(
                  (permission) => (
                    <tr
                      key={permission.key}
                      className="border-b border-border/60 hover:bg-muted/20"
                    >
                      <td className="px-4 py-2.5">
                        <span className="font-medium">
                          {permission.label}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {permission.key}
                        </span>
                      </td>
                      {roleOrder.map((roleId) => {
                        const has = roleHasPermission(
                          roleId,
                          permission.key,
                        );
                        return (
                          <td key={roleId} className="px-3 py-2.5 text-center">
                            <span
                              className={cn(
                                "inline-flex size-6 items-center justify-center rounded-full text-xs font-bold",
                                has
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-muted text-muted-foreground",
                              )}
                              title={
                                has
                                  ? `${ROLE_DEFINITIONS[roleId].label} 拥有 ${getPermissionLabel(permission.key)}`
                                  : "无权限"
                              }
                            >
                              {has ? "✓" : "—"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ),
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 border-t p-4 sm:grid-cols-2 lg:grid-cols-3 sm:px-6 sm:py-4">
        {roleOrder.map((roleId) => {
          const role = ROLE_DEFINITIONS[roleId];
          return (
            <div
              key={roleId}
              className="rounded-lg border border-dashed p-3 text-sm"
            >
              <p className="font-medium">{role.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {role.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
