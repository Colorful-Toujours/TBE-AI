export type LogAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "view"
  | "export"
  | "other";

export type LogModule =
  | "bill"
  | "material"
  | "user"
  | "settings"
  | "payment"
  | "auth"
  | "system";

export type LogStatus = "success" | "failure";

export type OperationLog = {
  id: string;
  createdAt: string;
  operator: string;
  operatorId?: string;
  action: LogAction;
  module: LogModule;
  target: string;
  detail?: string;
  status: LogStatus;
};

export type RecordOperationInput = {
  action: LogAction;
  module: LogModule;
  target: string;
  detail?: string;
  status?: LogStatus;
  operator?: string;
  operatorId?: string;
};
