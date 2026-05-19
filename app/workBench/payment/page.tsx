import { PaymentTable } from "./payment-table";
import type { Payment } from "./columns";

async function getData(): Promise<Payment[]> {
  const statuses: Payment["status"][] = [
    "pending",
    "processing",
    "success",
    "failed",
  ];

  return Array.from({ length: 25 }, (_, i) => ({
    id: `pay-${String(i + 1).padStart(3, "0")}`,
    amount: (i + 1) * 50,
    status: statuses[i % statuses.length],
    email: `user${i + 1}@example.com`,
  }));
}

export default async function PaymentPage() {
  const data = await getData();

  return (
    <div className="container mx-auto space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">支付记录</h2>
        <p className="text-sm text-muted-foreground">
          支持搜索、排序、分页、行选择与列显示切换
        </p>
      </div>
      <PaymentTable data={data} />
    </div>
  );
}
