"use client";

import { useCallback, useEffect, useState } from "react";

import { loadMaterials, saveMaterials, subscribeMaterials } from "./store";
import type { Material } from "./types";

export function useMaterials(initialData?: Material[]) {
  const [materials, setMaterials] = useState<Material[]>(() => {
    if (typeof window !== "undefined") {
      return loadMaterials();
    }
    return initialData ?? [];
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setMaterials(loadMaterials()), 0);
    const unsubscribe = subscribeMaterials(() => {
      setMaterials(loadMaterials());
    });
    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const persist = useCallback((next: Material[]) => {
    setMaterials(next);
    saveMaterials(next);
  }, []);

  return { materials, setMaterials: persist };
}
