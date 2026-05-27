"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  createMaterial,
  deleteMaterial,
  listMaterials,
  updateMaterial,
} from "@/lib/backend-api";

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
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");

  const loadMaterialsFromApi = useCallback(
    async (params?: DataTableQueryParams) => {
      setLoading(true);
      setApiMessage("");
      try {
        const result = await listMaterials(params);
        setMaterials(result.items);
      } catch (error) {
        setApiMessage(
          error instanceof Error ? error.message : "材料数据加载失败",
        );
      } finally {
        setLoading(false);
      }
    },
    [setMaterials],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMaterialsFromApi(query);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadMaterialsFromApi, query]);

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

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingMaterial) return;
    setApiMessage("");
    try {
      await deleteMaterial(deletingMaterial.id);
      setMaterials(materials.filter((m) => m.id !== deletingMaterial.id));
      recordOperation({
        action: "delete",
        module: "material",
        target: `材料 ${deletingMaterial.id}`,
        detail: `删除材料：${deletingMaterial.name}`,
      });
      setDeletingMaterial(null);
    } catch (error) {
      setApiMessage(error instanceof Error ? error.message : "删除材料失败");
    }
  }, [deletingMaterial, materials, setMaterials]);

  const handleFormSubmit = useCallback(
    async (values: MaterialFormValues) => {
      setApiMessage("");
      try {
        if (editingMaterial) {
          const updated = await updateMaterial(editingMaterial.id, values);
          setMaterials(
            materials.map((m) => (m.id === editingMaterial.id ? updated : m)),
          );
          recordOperation({
            action: "update",
            module: "material",
            target: `材料 ${editingMaterial.id}`,
            detail: `修改材料：${values.name}，单价 ¥${values.unitPrice}/${values.unit}`,
          });
        } else {
          const created = await createMaterial(values);
          setMaterials([...materials, created]);
          recordOperation({
            action: "create",
            module: "material",
            target: `材料 ${created.id}`,
            detail: `新增材料：${values.name}，库存 ${values.stock} ${values.unit}`,
          });
        }
        setEditingMaterial(null);
      } catch (error) {
        setApiMessage(error instanceof Error ? error.message : "保存材料失败");
      }
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
        loading={loading}
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

      {apiMessage ? (
        <p className="text-sm font-medium text-destructive">{apiMessage}</p>
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
