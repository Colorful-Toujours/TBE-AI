import type { SystemUser } from "./columns";

export async function getUserData(): Promise<SystemUser[]> {
  return [
    {
      id: "u-001",
      name: "王超",
      phone: "13800001001",
      email: "wangchao@example.com",
      role: "super_admin",
      status: "启用",
      createdAt: "2024-01-10",
    },
    {
      id: "u-002",
      name: "李敏",
      phone: "13800001002",
      email: "limin@example.com",
      role: "admin",
      status: "启用",
      createdAt: "2024-02-15",
    },
    {
      id: "u-003",
      name: "张强",
      phone: "13800001003",
      email: "zhangqiang@example.com",
      role: "employee",
      status: "启用",
      createdAt: "2024-03-01",
    },
    {
      id: "u-004",
      name: "赵会计",
      phone: "13800001004",
      email: "finance@example.com",
      role: "finance",
      status: "启用",
      createdAt: "2024-03-20",
    },
    {
      id: "u-005",
      name: "陈业主",
      phone: "13800001005",
      email: "chen@example.com",
      role: "user",
      status: "启用",
      createdAt: "2024-04-05",
    },
    {
      id: "u-006",
      name: "刘试用",
      phone: "13800001006",
      role: "employee",
      status: "禁用",
      createdAt: "2024-05-01",
    },
  ];
}
