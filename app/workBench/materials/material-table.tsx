"use client";

import { useCallback, useMemo, useState } from "react";
import { useMaterials } from "@/lib/materials";
import { Plus } from "lucide-react";

import {
  DataTable,
  type DataTableFilterField,
  type DataTableQueryParams,
} from "@/components/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { recordOperation } from "@/lib/audit-log";

import { createMaterialColumns, type Material } from "./columns";
import {
  MaterialFormDialog,
  type MaterialFormValues,
} from "./material-form-dialog";

const categoryFilterOptions = [
  { label: "建材", value: "建材" },
  { label: "电气", value: "电气" },
  { label: "涂料", value: "涂料" },
  { label: "门窗", value: "门窗" },
  { label: "五金", value: "五金" },
  { label: "其他", value: "其他" },
];

const materialFilters: DataTableFilterField<Material>[] = [
  { type: "text", id: "name", placeholder: "材料名称" },
  {
    type: "select",
    id: "category",
    placeholder: "分类",
    options: categoryFilterOptions,
  },
  { type: "text", id: "unit", placeholder: "单位" },
  { type: "text", id: "unitPrice", placeholder: "单价" },
  { type: "text", id: "stock", placeholder: "库存" },
];

type MaterialTableProps = {
  initialData: Material[];
};

export function MaterialTable({ initialData }: MaterialTableProps) {
  const { materials, setMaterials } = useMaterials(initialData);
  const [query, setQuery] = useState<DataTableQueryParams>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(
    null,
  );

  const handleCreate = useCallback(() => {
    setEditingMaterial(null);
    setFormOpen(true);
  }, []);

  const handleEdit = useCallback((material: Material) => {
    setEditingMaterial(material);
    setFormOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((material: Material) => {
    setDeletingMaterial(material);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!deletingMaterial) return;
    setMaterials(materials.filter((m) => m.id !== deletingMaterial.id));
    recordOperation({
      action: "delete",
      module: "material",
      target: `材料 ${deletingMaterial.id}`,
      detail: `删除材料：${deletingMaterial.name}`,
    });
    setDeletingMaterial(null);
  }, [deletingMaterial, materials, setMaterials]);

  const handleFormSubmit = useCallback(
    (values: MaterialFormValues) => {
      if (editingMaterial) {
        setMaterials(
          materials.map((m) =>
            m.id === editingMaterial.id
              ? { ...values, id: editingMaterial.id }
              : m,
          ),
        );
        recordOperation({
          action: "update",
          module: "material",
          target: `材料 ${editingMaterial.id}`,
          detail: `修改材料：${values.name}，单价 ¥${values.unitPrice}/${values.unit}`,
        });
      } else {
        const newId = `mat-${Date.now()}`;
        setMaterials([...materials, { ...values, id: newId }]);
        recordOperation({
          action: "create",
          module: "material",
          target: `材料 ${newId}`,
          detail: `新增材料：${values.name}，库存 ${values.stock} ${values.unit}`,
        });
      }
      setEditingMaterial(null);
    },
    [editingMaterial, materials, setMaterials],
  );

  const handleQueryChange = useCallback((next: DataTableQueryParams) => {
    setQuery(next);
  }, []);

  const columns = useMemo(
    () =>
      createMaterialColumns({
        onEdit: handleEdit,
        onDelete: handleDeleteRequest,
      }),
    [handleEdit, handleDeleteRequest],
  );

  return (
    <div className="space-y-3">
      <DataTable
        columns={columns}
        data={materials}
        getRowId={(row) => row.id}
        enableGlobalFilter={false}
        enableRowSelection={false}
        filters={materialFilters}
        onQueryChange={handleQueryChange}
        emptyMessage="暂无材料数据"
        pageSize={10}
        toolbar={
          <Button size="sm" onClick={handleCreate}>
            <Plus className="size-4" />
            新增材料
          </Button>
        }
      />

      {Object.keys(query).length > 0 ? (
        <p className="text-xs text-muted-foreground">
          当前查询：{JSON.stringify(query)}
        </p>
      ) : null}

      <MaterialFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        material={editingMaterial}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog
        open={Boolean(deletingMaterial)}
        onOpenChange={(open) => !open && setDeletingMaterial(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除材料？</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingMaterial
                ? `将删除「${deletingMaterial.name}」，已引用该材料的账单不受影响。`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
