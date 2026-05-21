import type { PermissionDefinition, PermissionKey } from "./types";

export const PERMISSION_LIST: PermissionDefinition[] = [
  { key: "dashboard.view", label: "数据预览", group: "工作台" },
  { key: "users.view", label: "查看用户", group: "用户管理" },
  { key: "users.manage", label: "管理用户", group: "用户管理" },
  { key: "roles.manage", label: "角色与权限", group: "用户管理" },
  { key: "bills.view", label: "查看账单", group: "账单" },
  { key: "bills.manage", label: "管理账单", group: "账单" },
  { key: "materials.view", label: "查看材料", group: "材料" },
  { key: "materials.manage", label: "管理材料", group: "材料" },
  { key: "payments.view", label: "查看支付", group: "支付" },
  { key: "payments.manage", label: "管理支付", group: "支付" },
  { key: "settings.view", label: "查看设置", group: "系统" },
  { key: "settings.manage", label: "管理设置", group: "系统" },
];

export const ALL_PERMISSIONS = PERMISSION_LIST.map((p) => p.key) as PermissionKey[];

export function getPermissionLabel(key: PermissionKey) {
  return PERMISSION_LIST.find((p) => p.key === key)?.label ?? key;
}
