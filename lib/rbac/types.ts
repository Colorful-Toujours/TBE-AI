/** 系统角色 */
export type UserRole =
  | "super_admin"
  | "admin"
  | "employee"
  | "finance"
  | "user";

/** 权限标识 */
export type PermissionKey =
  | "dashboard.view"
  | "users.view"
  | "users.manage"
  | "roles.manage"
  | "bills.view"
  | "bills.manage"
  | "materials.view"
  | "materials.manage"
  | "payments.view"
  | "payments.manage"
  | "settings.view"
  | "settings.manage";

export type RoleDefinition = {
  id: UserRole;
  label: string;
  description: string;
  permissions: PermissionKey[];
};

export type PermissionDefinition = {
  key: PermissionKey;
  label: string;
  group: string;
};
