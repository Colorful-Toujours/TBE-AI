"use client";

import type { SystemUser } from "./columns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getPermissionLabel,
  getRoleLabel,
  getRolePermissions,
  ROLE_DEFINITIONS,
} from "@/lib/rbac";

type UserPermissionsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: SystemUser | null;
};

export function UserPermissionsDialog({
  open,
  onOpenChange,
  user,
}: UserPermissionsDialogProps) {
  if (!user) return null;

  const permissions = getRolePermissions(user.role);
  const roleDef = ROLE_DEFINITIONS[user.role];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{user.name} · 权限详情</DialogTitle>
          <DialogDescription>
            角色：{getRoleLabel(user.role)} — {roleDef.description}
          </DialogDescription>
        </DialogHeader>
        <ul className="max-h-64 space-y-2 overflow-y-auto">
          {permissions.map((key) => (
            <li
              key={key}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
            >
              <span>{getPermissionLabel(key)}</span>
              <span className="text-xs text-muted-foreground">{key}</span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
