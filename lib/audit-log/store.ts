import { LOG_SEED } from "./seed";
import type { OperationLog, RecordOperationInput } from "./types";
import { getActionLabel, getModuleLabel } from "./labels";
import { getStoredUser } from "@/lib/auth/session";

const STORAGE_KEY = "tbe-operation-logs";
const MAX_LOGS = 500;

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function loadOperationLogs(): OperationLog[] {
  if (typeof window === "undefined") {
    return LOG_SEED;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(LOG_SEED));
      return LOG_SEED;
    }
    const parsed = JSON.parse(raw) as OperationLog[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : LOG_SEED;
  } catch {
    return LOG_SEED;
  }
}

function saveLogs(logs: OperationLog[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
  notify();
}

export function subscribeOperationLogs(listener: Listener) {
  listeners.add(listener);

  if (typeof window !== "undefined") {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  return () => listeners.delete(listener);
}

export function recordOperation(input: RecordOperationInput) {
  if (typeof window === "undefined") return;

  const currentUser = getStoredUser();
  const operator = input.operator ?? currentUser?.name ?? "系统";
  const operatorId = input.operatorId ?? currentUser?.id;

  const entry: OperationLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    operator,
    operatorId,
    action: input.action,
    module: input.module,
    target: input.target,
    detail:
      input.detail ??
      `${getActionLabel(input.action)} · ${getModuleLabel(input.module)}`,
    status: input.status ?? "success",
  };

  const logs = loadOperationLogs();
  saveLogs([entry, ...logs]);
  return entry;
}

export function clearOperationLogs() {
  saveLogs([]);
}
