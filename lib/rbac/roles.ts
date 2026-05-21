import { ALL_PERMISSIONS } from "./permissions";
import type { PermissionKey, RoleDefinition, UserRole } from "./types";

const P = (...keys: PermissionKey[]) => keys;

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  super_admin: {
    id: "super_admin",
    label: "超级管理",
    description: "拥有全部权限，可管理角色与其他管理员",
    permissions: ALL_PERMISSIONS,
  },
  admin: {
    id: "admin",
    label: "管理员",
    description: "日常业务管理，不可调整角色权限",
    permissions: P(
      "dashboard.view",
      "users.view",
      "users.manage",
      "bills.view",
      "bills.manage",
      "materials.view",
      "materials.manage",
      "payments.view",
      "payments.manage",
      "settings.view",
    ),
  },
  employee: {
    id: "employee",
    label: "员工",
    description: "录入与处理账单、查看材料",
    permissions: P(
      "dashboard.view",
      "bills.view",
      "bills.manage",
      "materials.view",
    ),
  },
  finance: {
    id: "finance",
    label: "财务",
    description: "查看账单与支付，导出报表",
    permissions: P(
      "dashboard.view",
      "bills.view",
      "payments.view",
      "payments.manage",
    ),
  },
  user: {
    id: "user",
    label: "用户",
    description: "仅查看本人相关账单",
    permissions: P("bills.view"),
  },
};

export const ROLE_OPTIONS = Object.values(ROLE_DEFINITIONS).map((r) => ({
  value: r.id,
  label: r.label,
}));

export function getRoleLabel(role: UserRole) {
  return ROLE_DEFINITIONS[role]?.label ?? role;
}

export function getRolePermissions(role: UserRole): PermissionKey[] {
  return ROLE_DEFINITIONS[role]?.permissions ?? [];
}

export function roleHasPermission(role: UserRole, permission: PermissionKey) {
  return getRolePermissions(role).includes(permission);
}
