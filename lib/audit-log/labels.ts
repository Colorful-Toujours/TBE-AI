import type { LogAction, LogModule } from "./types";

export const ACTION_LABELS: Record<LogAction, string> = {
  create: "新增",
  update: "修改",
  delete: "删除",
  login: "登录",
  logout: "退出",
  view: "查看",
  export: "导出",
  other: "其他",
};

export const MODULE_LABELS: Record<LogModule, string> = {
  bill: "账单",
  material: "材料",
  user: "用户",
  settings: "设置",
  payment: "支付",
  auth: "认证",
  system: "系统",
};

export function getActionLabel(action: LogAction) {
  return ACTION_LABELS[action];
}

export function getModuleLabel(module: LogModule) {
  return MODULE_LABELS[module];
}
