"use client";

import { useEffect, useState } from "react";

import type { Material } from "@/lib/materials";
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

export type MaterialFormValues = {
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  stock: number;
  remark?: string;
};

const categoryOptions = ["建材", "电气", "涂料", "门窗", "五金", "其他"];

type MaterialFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material?: Material | null;
  onSubmit: (values: MaterialFormValues) => void;
};

function materialToDraft(material?: Material | null) {
  if (!material) {
    return {
      name: "",
      category: "建材",
      unit: "",
      unitPrice: "0",
      stock: "0",
      remark: "",
    };
  }
  return {
    name: material.name,
    category: material.category,
    unit: material.unit,
    unitPrice: String(material.unitPrice),
    stock: String(material.stock),
    remark: material.remark ?? "",
  };
}

export function MaterialFormDialog({
  open,
  onOpenChange,
  material,
  onSubmit,
}: MaterialFormDialogProps) {
  const [draft, setDraft] = useState(materialToDraft(material));
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setDraft(materialToDraft(material));
      setError("");
    }
  }, [open, material]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!draft.name.trim()) {
      setError("请填写材料名称");
      return;
    }
    if (!draft.unit.trim()) {
      setError("请填写单位");
      return;
    }

    onSubmit({
      name: draft.name.trim(),
      category: draft.category,
      unit: draft.unit.trim(),
      unitPrice: Number(draft.unitPrice) || 0,
      stock: Number(draft.stock) || 0,
      remark: draft.remark.trim() || undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{material ? "编辑材料" : "新增材料"}</DialogTitle>
          <DialogDescription>
            维护材料基础信息，账单选购材料时可引用此处单价与单位。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="material-name">材料名称</Label>
            <Input
              id="material-name"
              value={draft.name}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="如：水泥"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>分类</Label>
              <Select
                value={draft.category}
                onValueChange={(value) =>
                  setDraft((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="material-unit">单位</Label>
              <Input
                id="material-unit"
                value={draft.unit}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, unit: e.target.value }))
                }
                placeholder="袋、㎡、个…"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="material-price">单价（元）</Label>
              <Input
                id="material-price"
                type="number"
                min="0"
                step="0.01"
                value={draft.unitPrice}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, unitPrice: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="material-stock">库存数量</Label>
              <Input
                id="material-stock"
                type="number"
                min="0"
                step="1"
                value={draft.stock}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, stock: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="material-remark">备注</Label>
            <Input
              id="material-remark"
              value={draft.remark}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, remark: e.target.value }))
              }
              placeholder="规格、型号等（选填）"
            />
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
            <Button type="submit">{material ? "保存" : "添加"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
