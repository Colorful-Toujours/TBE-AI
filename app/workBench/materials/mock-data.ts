import { MATERIAL_SEED } from "@/lib/materials";
import type { Material } from "@/lib/materials";

export async function getMaterialData(): Promise<Material[]> {
  return MATERIAL_SEED;
}
