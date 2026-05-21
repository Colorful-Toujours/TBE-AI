import { BillTable } from "./bill-table";
import { getBillData } from "./mock-data";

export default async function BillPage() {
  const data = await getBillData();

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">账单</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          支持新增、编辑、删除账单；选购材料从材料库选择并自动带入单价；可按日期、用户、小区/单元、应收款、实收款筛选。
        </p>
      </div>
      <BillTable initialData={data} />
    </div>
  );
}
