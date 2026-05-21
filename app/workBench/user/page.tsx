import { UserTable } from "./user-table";
import { getUserData } from "./mock-data";

export default async function UserPage() {
  const data = await getUserData();

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">用户管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          管理系统用户，分配角色（超级管理、管理员、员工、财务、用户）并查看权限矩阵。
        </p>
      </div>
      <UserTable initialData={data} />
    </div>
  );
}
