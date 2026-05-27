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
    const timer = window.setTimeout(refresh, 0);
    const unsubscribe = subscribeOperationLogs(refresh);
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, [refresh]);

  return { logs, refresh };
}
