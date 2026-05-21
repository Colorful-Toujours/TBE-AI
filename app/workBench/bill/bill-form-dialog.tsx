"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import type { Bill, BillMaterial } from "./columns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/format";
import {
  findMaterialById,
  findMaterialByName,
  useMaterials,
} from "@/lib/materials";
import { cn } from "@/lib/utils";

export type BillFormValues = {
  date: string;
  user: string;
  community: string;
  unit: string;
  receivable: number;
  received: number;
  materials: BillMaterial[];
};

type BillFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill?: Bill | null;
  onSubmit: (values: BillFormValues) => void;
};

type MaterialDraft = {
  id: string;
  materialId: string;
  name: string;
  unit: string;
  quantity: string;
  unitPrice: string;
};

function createEmptyMaterial(): MaterialDraft {
  return {
    id: `m-${crypto.randomUUID()}`,
    materialId: "",
    name: "",
    unit: "",
    quantity: "1",
    unitPrice: "0",
  };
}

function billLineToDraft(
  line: BillMaterial,
  catalog: ReturnType<typeof useMaterials>["materials"],
): MaterialDraft {
  const linked =
    (line.materialId && findMaterialById(catalog, line.materialId)) ||
    findMaterialByName(catalog, line.name);

  return {
    id: line.id,
    materialId: linked?.id ?? line.materialId ?? "",
    name: line.name,
    unit: line.unit ?? linked?.unit ?? "",
    quantity: String(line.quantity),
    unitPrice: String(line.unitPrice),
  };
}

function billToDraft(
  bill: Bill | null | undefined,
  catalog: ReturnType<typeof useMaterials>["materials"],
) {
  if (!bill) {
    return {
      date: new Date().toISOString().slice(0, 10),
      user: "",
      community: "",
      unit: "",
      receivable: "0",
      received: "0",
      materials: [createEmptyMaterial()],
    };
  }

  return {
    date: bill.date,
    user: bill.user,
    community: bill.community,
    unit: bill.unit,
    receivable: String(bill.receivable),
    received: String(bill.received),
    materials:
      bill.materials.length > 0
        ? bill.materials.map((m) => billLineToDraft(m, catalog))
        : [createEmptyMaterial()],
  };
}

export function BillFormDialog({
  open,
  onOpenChange,
  bill,
  onSubmit,
}: BillFormDialogProps) {
  const { materials: catalog } = useMaterials();
  const [draft, setDraft] = useState(() => billToDraft(bill, catalog));
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setDraft(billToDraft(bill, catalog));
      setError("");
    }
  }, [open, bill, catalog]);

  const materialsTotal = useMemo(
    () =>
      draft.materials.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const price = Number(item.unitPrice) || 0;
        return sum + qty * price;
      }, 0),
    [draft.materials],
  );

  function updateMaterial(id: string, patch: Partial<MaterialDraft>) {
    setDraft((prev) => ({
      ...prev,
      materials: prev.materials.map((m) =>
        m.id === id ? { ...m, ...patch } : m,
      ),
    }));
  }

  function selectCatalogMaterial(lineId: string, materialId: string) {
    if (materialId === "__none__") {
      updateMaterial(lineId, {
        materialId: "",
        name: "",
        unit: "",
        unitPrice: "0",
      });
      return;
    }

    const item = findMaterialById(catalog, materialId);
    if (!item) return;

    updateMaterial(lineId, {
      materialId: item.id,
      name: item.name,
      unit: item.unit,
      unitPrice: String(item.unitPrice),
    });
  }

  function addMaterial() {
    setDraft((prev) => ({
      ...prev,
      materials: [...prev.materials, createEmptyMaterial()],
    }));
  }

  function removeMaterial(id: string) {
    setDraft((prev) => ({
      ...prev,
      materials:
        prev.materials.length <= 1
          ? [createEmptyMaterial()]
          : prev.materials.filter((m) => m.id !== id),
    }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!draft.user.trim()) {
      setError("请填写用户");
      return;
    }
    if (!draft.community.trim() || !draft.unit.trim()) {
      setError("请填写小区和单元");
      return;
    }

    const lines = draft.materials.filter((m) => m.materialId || m.name.trim());

    const materials: BillMaterial[] = lines.map((m) => ({
      id: m.id,
      materialId: m.materialId || undefined,
      name: m.name.trim(),
      unit: m.unit || undefined,
      quantity: Number(m.quantity) || 0,
      unitPrice: Number(m.unitPrice) || 0,
    }));

    onSubmit({
      date: draft.date,
      user: draft.user.trim(),
      community: draft.community.trim(),
      unit: draft.unit.trim(),
      receivable: Number(draft.receivable) || 0,
      received: Number(draft.received) || 0,
      materials,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{bill ? "编辑账单" : "新增账单"}</DialogTitle>
          <DialogDescription>
            购买材料请从
            <Link
              href="/workBench/materials"
              className="mx-1 font-medium text-foreground underline underline-offset-2"
            >
              材料库
            </Link>
            选择，将自动带入单位与参考单价。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bill-date">账单日期</Label>
              <Input
                id="bill-date"
                type="date"
                value={draft.date}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, date: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bill-user">用户</Label>
              <Input
                id="bill-user"
                value={draft.user}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, user: e.target.value }))
                }
                placeholder="业主姓名"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bill-community">小区</Label>
              <Input
                id="bill-community"
                value={draft.community}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, community: e.target.value }))
                }
                placeholder="如：阳光花园"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bill-unit">单元</Label>
              <Input
                id="bill-unit"
                value={draft.unit}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, unit: e.target.value }))
                }
                placeholder="如：1单元101"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bill-receivable">应收款（元）</Label>
              <Input
                id="bill-receivable"
                type="number"
                min="0"
                step="0.01"
                value={draft.receivable}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, receivable: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bill-received">实收款（元）</Label>
              <Input
                id="bill-received"
                type="number"
                min="0"
                step="0.01"
                value={draft.received}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, received: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">购买材料</p>
                <p className="text-xs text-muted-foreground">
                  材料合计：{formatCurrency(materialsTotal)}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMaterial}
                disabled={catalog.length === 0}
              >
                <Plus className="size-4" />
                添加材料
              </Button>
            </div>

            {catalog.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                材料库为空，请先在
                <Link
                  href="/workBench/materials"
                  className="mx-1 font-medium text-foreground underline"
                >
                  材料管理
                </Link>
                中添加材料。
              </p>
            ) : (
              <div className="space-y-3">
                {draft.materials.map((line, index) => {
                  const catalogItem = line.materialId
                    ? findMaterialById(catalog, line.materialId)
                    : undefined;
                  const qty = Number(line.quantity) || 0;
                  const overStock =
                    catalogItem && qty > catalogItem.stock;

                  return (
                    <div
                      key={line.id}
                      className="grid gap-3 rounded-lg border border-dashed p-3"
                    >
                      <div className="grid gap-3 sm:grid-cols-[1fr_100px_100px_auto]">
                        <div className="space-y-1.5 sm:col-span-1">
                          <Label>材料（来自材料库）</Label>
                          <Select
                            value={line.materialId || "__none__"}
                            onValueChange={(value) =>
                              selectCatalogMaterial(line.id, value)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={`选择材料 ${index + 1}`} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">请选择</SelectItem>
                              {catalog.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name}（{item.unit} ·{" "}
                                  {formatCurrency(item.unitPrice)}）
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {catalogItem ? (
                            <p className="text-xs text-muted-foreground">
                              {catalogItem.category} · 库存 {catalogItem.stock}{" "}
                              {catalogItem.unit}
                              {overStock ? (
                                <span className="text-amber-600">
                                  {" "}
                                  · 超过库存
                                </span>
                              ) : null}
                            </p>
                          ) : line.name ? (
                            <p className="text-xs text-amber-600">
                              未关联材料库（{line.name}），请重新选择以同步单价
                            </p>
                          ) : null}
                        </div>
                        <div className="space-y-1.5">
                          <Label>数量{line.unit ? `（${line.unit}）` : ""}</Label>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={line.quantity}
                            onChange={(e) =>
                              updateMaterial(line.id, {
                                quantity: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>单价（元）</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.unitPrice}
                            onChange={(e) =>
                              updateMaterial(line.id, {
                                unitPrice: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeMaterial(line.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                      {line.materialId ? (
                        <p
                          className={cn(
                            "text-right text-xs tabular-nums text-muted-foreground",
                          )}
                        >
                          小计：{formatCurrency(qty * (Number(line.unitPrice) || 0))}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={catalog.length === 0}>
              {bill ? "保存修改" : "创建账单"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
