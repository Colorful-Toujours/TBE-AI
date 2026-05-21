import { MATERIAL_SEED } from "./seed";
import type { Material } from "./types";

const STORAGE_KEY = "tbe-materials-catalog";

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function loadMaterials(): Material[] {
  if (typeof window === "undefined") {
    return MATERIAL_SEED;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return MATERIAL_SEED;
    const parsed = JSON.parse(raw) as Material[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : MATERIAL_SEED;
  } catch {
    return MATERIAL_SEED;
  }
}

export function saveMaterials(materials: Material[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
  notify();
}

export function subscribeMaterials(listener: Listener) {
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

export function findMaterialById(
  materials: Material[],
  id: string,
): Material | undefined {
  return materials.find((m) => m.id === id);
}

export function findMaterialByName(
  materials: Material[],
  name: string,
): Material | undefined {
  return materials.find((m) => m.name === name);
}
