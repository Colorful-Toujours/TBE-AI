import { LogsTable } from "./logs-table";

export default function LogsPage() {
  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">操作日志</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          记录账单、材料、用户、设置等模块的关键操作，支持按时间、操作人、模块筛选。
        </p>
      </div>
      <LogsTable />
    </div>
  );
}
