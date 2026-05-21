"use client";

import { useCallback, useEffect, useState } from "react";

import { loadOperationLogs, subscribeOperationLogs } from "./store";
import type { OperationLog } from "./types";

export function useOperationLogs() {
  const [logs, setLogs] = useState<OperationLog[]>([]);

  const refresh = useCallback(() => {
    setLogs(loadOperationLogs());
  }, []);

  useEffect(() => {
    refresh();
    return subscribeOperationLogs(refresh);
  }, [refresh]);

  return { logs, refresh };
}
