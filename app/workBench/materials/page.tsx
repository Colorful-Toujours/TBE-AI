import { MaterialTable } from "./material-table";
import { getMaterialData } from "./mock-data";

export default async function MaterialsPage() {
  const data = await getMaterialData();

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">材料管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          维护材料名称、分类、单位、单价与库存；支持筛选及新增、编辑、删除。
        </p>
      </div>
      <MaterialTable initialData={data} />
    </div>
  );
}
