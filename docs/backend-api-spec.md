# AI Ledger 后端 API 规格（Agent 实现用）

> **用途**：本文档供后端开发 Agent 直接实现 REST API。前端为 Next.js（`tbe_ai`），通过 `/api/*` 代理到独立后端服务。
>
> **相关前端代码**：`app/login/page.tsx`、`app/workBench/**`、`lib/rbac/**`、`lib/materials/types.ts`、`app/workBench/bill/columns.tsx`

---

## 1. 项目背景

**AI Ledger** 是物业/装修类账单管理系统，核心模块：

| 模块 | 前端路径 | 当前数据来源 |
|------|----------|--------------|
| 登录/注册 | `/login` | 已调用 `/api/auth/*`，待后端实现 |
| 数据预览 | `/workBench/chart` | 静态 mock |
| 账单 | `/workBench/bill` | `mock-data.ts` + 客户端 state |
| 材料库 | `/workBench/materials` | `localStorage` |
| 用户管理 | `/workBench/user` | `mock-data.ts` + 客户端 state |
| 操作日志 | `/workBench/logs` | `localStorage` |
| 设置 | `/workBench/settings` | `localStorage`（个人信息/改密） |
| 支付 | `/workBench/payment` | 页面内 mock |

目标：将上述模块逐步改为调用后端持久化 API。

---

## 2. 部署与路由

### 2.1 请求链路

```
浏览器 → GET/POST https://{frontend}/api/auth/login
              ↓（Next.js fallback rewrite，见 next.config.ts）
         → http://{BACKEND_URL}/auth/login
```

- 前端统一以 **`/api` 为前缀** 发起请求。
- Rewrite 会 **去掉 `/api` 前缀** 再转发到后端。
- 后端实际路径 **不要** 再带 `/api`（例如实现 `POST /auth/login`，而非 `POST /api/auth/login`）。

### 2.2 环境变量

| 变量 | 说明 | 默认 |
|------|------|------|
| `BACKEND_URL` | Next 转发目标 | `http://localhost:8080` |

### 2.3 本地 Next BFF 例外

以下路由由 Next 本地处理，**不会**转发到后端（实现后端时可忽略或仅作参考）：

- `GET /api/health` → `app/api/health/route.ts`
- `GET/PATCH/DELETE /api/users/:id` → `app/api/users/[id]/route.ts`（内存示例，生产应废弃并由后端接管）

**建议**：后端实现完整的 `GET/POST /users` 与 `GET/PATCH/DELETE /users/:id`，前端后续删除 BFF 示例路由。

---

## 3. 通用约定

### 3.1 响应格式（推荐，与 `lib/request` 对齐）

除 **认证接口**（见 4.1）外，业务接口统一使用：

**成功**

```json
{
  "success": true,
  "data": {}
}
```

**失败**

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "资源不存在",
    "details": {}
  }
}
```

| HTTP | `error.code` 建议 |
|------|-------------------|
| 400 | `BAD_REQUEST` |
| 401 | `UNAUTHORIZED` |
| 403 | `FORBIDDEN` |
| 404 | `NOT_FOUND` |
| 409 | `CONFLICT` |
| 429 | `TOO_MANY_REQUESTS` |
| 500 | `INTERNAL_ERROR` |

`DELETE` 成功且无 body 时返回 **204 No Content**。

### 3.2 鉴权

- 受保护接口要求请求头：`Authorization: Bearer <access_token>`
- Token 由登录/注册接口签发；建议 JWT 或等价方案，payload 至少包含 `sub`（用户 ID）、`role`（角色）。
- 后端按 RBAC 校验权限（见第 8 节）；无权限返回 `403`。

### 3.3 分页与列表查询

列表接口统一 query：

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `page` | number | 1 | 页码，从 1 开始 |
| `pageSize` | number | 10 | 每页条数，最大 100 |
| `sortBy` | string | - | 排序字段 |
| `sortOrder` | `asc` \| `desc` | `desc` | 排序方向 |

列表响应 `data` 结构：

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 10
}
```

筛选参数与各资源字段同名（见各模块）；字符串默认 **模糊匹配**（`ILIKE` / `contains`），日期用 `YYYY-MM-DD` 前缀或区间 `dateFrom`/`dateTo`。

### 3.4 时间与 ID

- 时间字段：ISO 8601 字符串（`2024-03-15T08:00:00.000Z`）
- 主键：字符串 UUID 或业务 ID（如 `bill-001`），全项目保持一致即可

### 3.5 CORS

若前端与后端不同域，需允许前端源，并暴露 `Authorization` 头。

---

## 4. 认证与用户会话

> 登录页 `app/login/page.tsx` 已对接；注册与登录 **当前兼容多种响应形状**，后端任选一种并保持一致即可。

### 4.1 登录 — `POST /auth/login`

**请求体**

```json
{
  "username": "13800001001",
  "loginType": "phone",
  "password": "可选，loginType=password 时必填",
  "verificationCode": "可选，loginType=phone 时必填"
}
```

| `loginType` | 说明 |
|-------------|------|
| `phone` | 手机号 + 短信验证码 |
| `password` | 手机号/邮箱/账号 + 密码 |
| `register` | 不走本接口，走注册 |

**响应（二选一，前端均能解析）**

方案 A — 扁平（当前登录页优先解析）：

```json
{
  "token": "eyJ...",
  "user": {
    "id": "u-001",
    "name": "王超",
    "phone": "13800001001",
    "email": "wangchao@example.com",
    "avatar": "https://..."
  }
}
```

方案 B — 包裹（与 `http` 客户端一致）：

```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "user": { }
  }
}
```

失败：HTTP 4xx + `message` 或 `error.message`。

---

### 4.2 注册 — `POST /auth/register`

**请求体**（与登录相同字段）

```json
{
  "username": "13800001001",
  "loginType": "register",
  "password": "至少6位",
  "verificationCode": "可选"
}
```

**响应**：同 4.1。

**业务规则**

- 密码最少 6 位
- 手机号格式：`^1\d{10}$`（可选校验）
- 用户名已存在 → `409 CONFLICT`

---

### 4.3 发送短信验证码 — `POST /auth/sms/send`

登录页「获取验证码」按钮已存在，**尚未接 API**。

**请求体**

```json
{
  "phone": "13800001001",
  "scene": "login"
}
```

`scene`：`login` | `register` | `reset_password`

**响应**

```json
{
  "success": true,
  "data": {
    "expiresIn": 300,
    "cooldown": 60
  }
}
```

需限流（同一手机号 60s 内不可重复发送）。

---

### 4.4 微信扫码登录 — `GET /auth/wechat/callback`

前端通过 `NEXT_PUBLIC_WECHAT_APP_ID` 跳转微信开放平台；授权后带 `code` 回调。

**Query**：`code`, `state`

**响应**：同 4.1（签发 token + user）。

未配置微信参数时前端显示演示二维码，后端可返回 `501` 或跳过实现（P2）。

---

### 4.5 登出 — `POST /auth/logout`

需 Bearer Token。服务端可将 token 加入黑名单或仅客户端丢弃（若 JWT 无状态，登出可为幂等 204）。

---

### 4.6 当前用户 — `GET /auth/me`

需 Bearer Token。

**响应 `data`**

```json
{
  "id": "u-001",
  "name": "王超",
  "phone": "13800001001",
  "email": "wangchao@example.com",
  "avatar": null,
  "role": "admin",
  "permissions": ["bills.view", "bills.manage"]
}
```

`permissions` 为当前用户有效权限键数组（见第 8 节）。

---

### 4.7 更新个人资料 — `PATCH /auth/profile`

需 Bearer Token。对应设置页「个人信息」（当前仅写 localStorage）。

**请求体**（字段均可选）

```json
{
  "name": "王超",
  "phone": "13800001001",
  "email": "wangchao@example.com",
  "avatar": "https://..."
}
```

**响应**：更新后的用户对象（同 4.6，可无 `permissions`）。

---

### 4.8 修改密码 — `PATCH /auth/password`

需 Bearer Token。对应设置页「修改密码」。

**请求体**

```json
{
  "currentPassword": "旧密码",
  "newPassword": "新密码至少6位"
}
```

错误：`400` 当前密码错误；`403` 验证码注册用户尚未设置密码。

---

## 5. 系统用户管理

> 类型定义：`app/workBench/user/columns.tsx` → `SystemUser`  
> 角色：`lib/rbac/types.ts` → `UserRole`

### 5.1 数据模型 `SystemUser`

```ts
{
  id: string;
  name: string;
  phone: string;           // 必填，唯一
  email?: string;
  role: "super_admin" | "admin" | "employee" | "finance" | "user";
  status: "启用" | "禁用";  // 或后端用 enabled: boolean 映射
  createdAt: string;       // ISO date
}
```

### 5.2 列表 — `GET /users`

需权限：`users.view`

**Query 筛选**：`name`, `phone`, `role`, `status`, 分页参数

### 5.3 创建 — `POST /users`

需权限：`users.manage`

**请求体**

```json
{
  "name": "张强",
  "phone": "13800001003",
  "email": "zhangqiang@example.com",
  "role": "employee",
  "status": "启用",
  "password": "初始密码，可选"
}
```

### 5.4 详情 — `GET /users/:id`

需权限：`users.view`

### 5.5 更新 — `PATCH /users/:id`

需权限：`users.manage`

**请求体**：`name`, `phone`, `email`, `role`, `status` 可选

**规则**：`super_admin` 不可删除（前端已禁用删除按钮，后端也应 `403`）

### 5.6 删除 — `DELETE /users/:id`

需权限：`users.manage`；不可删除 `super_admin`；返回 204。

---

## 6. 材料库

> 类型：`lib/materials/types.ts` → `Material`

### 6.1 数据模型 `Material`

```ts
{
  id: string;
  name: string;
  category: string;    // 建材 | 电气 | 涂料 | 门窗 | 五金 | 其他
  unit: string;
  unitPrice: number;
  stock: number;
  remark?: string;
}
```

### 6.2 列表 — `GET /materials`

需权限：`materials.view`

**Query**：`name`, `category`, `unit`, `unitPrice`, `stock`（前端表格筛选用）

### 6.3 创建 — `POST /materials`

需权限：`materials.manage`

### 6.4 详情 — `GET /materials/:id`

需权限：`materials.view`

### 6.5 更新 — `PATCH /materials/:id`

需权限：`materials.manage`

### 6.6 删除 — `DELETE /materials/:id`

需权限：`materials.manage`

**说明**：删除材料不级联删除历史账单行；账单内可保留快照字段 `name`/`unitPrice`。

---

## 7. 账单

> 类型：`app/workBench/bill/columns.tsx` → `Bill`, `BillMaterial`

### 7.1 数据模型

```ts
// 账单主表
Bill {
  id: string;
  date: string;          // YYYY-MM-DD
  user: string;          // 业主/客户姓名
  community: string;     // 小区
  unit: string;          // 单元门牌，如 "1单元101"
  receivable: number;    // 应收款
  received: number;      // 实收款
  materials: BillMaterial[];
}

BillMaterial {
  id: string;            // 行 ID
  materialId?: string;   // 关联材料库，可选
  name: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
}
```

**建议库表**：`bills` + `bill_materials`（一对多）；`receivable` 可由材料行汇总计算，也允许手工覆盖。

### 7.2 列表 — `GET /bills`

需权限：`bills.view`（`user` 角色仅返回与本人相关的账单，见 RBAC）

**Query**：`date`, `user`, `community`, `unit`, `receivable`, `received`, `dateFrom`, `dateTo`, 分页

**响应**：`items` 内可含 `materials` 数组；数据量大时可增加 `?includeMaterials=false` 仅返回主表。

### 7.3 创建 — `POST /bills`

需权限：`bills.manage`

**请求体**：完整 `Bill`（可无 `id`，服务端生成）

### 7.4 详情 — `GET /bills/:id`

需权限：`bills.view`

### 7.5 更新 — `PATCH /bills/:id`

需权限：`bills.manage`；支持整体替换 `materials` 列表。

### 7.6 删除 — `DELETE /bills/:id`

需权限：`bills.manage`；204。

---

## 8. RBAC 权限

> 定义见 `lib/rbac/roles.ts`、`lib/rbac/permissions.ts`。后端需 **持久化用户角色** 并在接口层强制校验。

### 8.1 角色枚举 `UserRole`

| 值 | 标签 |
|----|------|
| `super_admin` | 超级管理 |
| `admin` | 管理员 |
| `employee` | 员工 |
| `finance` | 财务 |
| `user` | 用户 |

### 8.2 权限键 `PermissionKey`

```
dashboard.view
users.view, users.manage, roles.manage
bills.view, bills.manage
materials.view, materials.manage
payments.view, payments.manage
settings.view, settings.manage
```

各角色默认权限矩阵以 `lib/rbac/roles.ts` 中 `ROLE_DEFINITIONS` 为准；`super_admin` 拥有全部权限。

### 8.3 只读接口（可选）

- `GET /roles` — 返回角色列表 + 描述
- `GET /roles/:role/permissions` — 返回该角色权限键数组

用于前端「角色权限面板」；也可由前端静态配置，后端仅做校验。

### 8.4 数据范围

| 角色 | 账单 |
|------|------|
| `user` | 仅 `user` 字段匹配当前用户姓名/绑定业主 ID 的记录 |
| 其他后台角色 | 按权限键访问全部或本组织数据（若有多租户后续扩展 `orgId`） |

---

## 9. 支付记录

> 类型：`app/workBench/payment/columns.tsx` → `Payment`（当前为演示数据，字段较简）

### 9.1 数据模型（建议扩展）

```ts
{
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
  billId?: string;       // 关联账单，建议新增
  paidAt?: string;
  channel?: string;      // wechat | alipay | bank
}
```

### 9.2 列表 — `GET /payments`

需权限：`payments.view`

**Query**：`status`, `email`, `billId`, 分页

### 9.3 详情 — `GET /payments/:id`

需权限：`payments.view`

### 9.4 导出 — `GET /payments/export`

需权限：`payments.view`；Query 同列表；响应 `Content-Type: text/csv` 或 xlsx（对应前端「导出」按钮）。

创建/退款等写操作列入 P2，按支付渠道再定。

---

## 10. 数据预览 / 仪表盘

> 组件：`components/charts/chart-dashboard.tsx`（当前全静态）

### 10.1 概览指标 — `GET /dashboard/summary`

需权限：`dashboard.view`

**响应 `data`**

```json
{
  "totalBills": 1247,
  "totalFlow": 89200,
  "transactionCount": 2847,
  "categoryCount": 24,
  "pendingCount": 18,
  "attachmentCount": 3456,
  "trends": {
    "totalBills": { "value": "+12.5%", "direction": "up" },
    "totalFlow": { "value": "+8.2%", "direction": "up" }
  }
}
```

金额单位：分（integer）或元（number），全项目统一并在文档注明。

### 10.2 趋势折线 — `GET /dashboard/trends`

需权限：`dashboard.view`

**Query**：`range=12m|6m|3m`

**响应 `data`**

```json
{
  "points": [
    { "month": "3月", "bills": 42, "amount": 52 }
  ]
}
```

### 10.3 分类柱状 — `GET /dashboard/categories`

需权限：`dashboard.view`

**Query**：`range`（同上）

**响应 `data`**

```json
{
  "items": [
    { "category": "建材", "amount": 12000, "count": 45 }
  ]
}
```

---

## 11. 操作日志

> 类型：`lib/audit-log/types.ts` → `OperationLog`

### 11.1 数据模型

```ts
{
  id: string;
  createdAt: string;
  operator: string;
  operatorId?: string;
  action: "create" | "update" | "delete" | "login" | "logout" | "view" | "export" | "other";
  module: "bill" | "material" | "user" | "settings" | "payment" | "auth" | "system";
  target: string;
  detail?: string;
  status: "success" | "failure";
}
```

### 11.2 列表 — `GET /audit-logs`

需权限：建议 `users.view` 或单独 `audit.view`（前端未单独定义，可用 `users.view`）

**Query**：`operator`, `module`, `action`, `status`, `dateFrom`, `dateTo`, 分页

### 11.3 写入 — `POST /audit-logs`

需 Bearer Token。

**请求体**：`RecordOperationInput` 字段（不含 `id`/`createdAt`，服务端生成）

**说明**：前端目前在 `recordOperation()` 写 localStorage；接入后端后，关键操作（登录、增删改）应 **服务端自动记日志**，客户端 POST 作为补充即可。

### 11.4 导出 — `GET /audit-logs/export`

Query 同列表；CSV。

---

## 12. 健康检查

### `GET /health`

无需鉴权。

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "1.0.0",
    "time": "2026-05-22T00:00:00.000Z"
  }
}
```

Next 本地已有 `app/api/health`；后端也应提供 `/health` 供运维探测。

---

## 13. 实现优先级

| 优先级 | 接口组 | 原因 |
|--------|--------|------|
| **P0** | `POST /auth/login`, `POST /auth/register`, `GET /auth/me` | 登录页已对接 |
| **P0** | `GET/POST/PATCH/DELETE /bills` | 核心业务 |
| **P0** | `GET/POST/PATCH/DELETE /materials` | 账单表单单选材料依赖 |
| **P1** | `GET/POST/PATCH/DELETE /users` + RBAC 校验 | 用户管理 |
| **P1** | `PATCH /auth/profile`, `PATCH /auth/password` | 设置页 |
| **P1** | `POST /auth/sms/send` | 手机登录闭环 |
| **P1** | `GET /audit-logs` + 服务端自动审计 | 操作日志页 |
| **P2** | `GET /dashboard/*` | 图表页 |
| **P2** | `GET /payments`, export | 支付页 |
| **P2** | `GET /auth/wechat/callback` | 依赖微信开放平台 |
| **P2** | `GET /roles` | 可前端静态 |

---

## 14. 前端对接清单（给后续前端 Agent）

后端就绪后，前端需改造：

1. **`app/login/page.tsx`**：可改为 `http.post(..., { raw: true })` 或统一响应格式。
2. **`app/workBench/bill/bill-table.tsx`**：`initialData` 改为 `http.get('/api/bills')`。
3. **`lib/materials/use-materials.ts`**：`loadMaterials/saveMaterials` 改为 API。
4. **`app/workBench/user/user-table.tsx`**：mock → `/api/users`。
5. **`app/workBench/settings/settings-form.tsx`**：`PATCH /api/auth/profile`、`PATCH /api/auth/password`。
6. **`lib/audit-log`**：`recordOperation` 增加 `POST /api/audit-logs`；列表页 `GET`。
7. **`components/charts/*`**：接入 `/api/dashboard/*`。
8. **删除** `app/api/users/[id]/route.ts` 示例，避免与后端路由冲突。

客户端调用示例：

```ts
import { http, setToken } from "@/lib/request";

const list = await http.get<{ items: Bill[]; total: number }>("/api/bills", {
  params: { page: 1, pageSize: 10, community: "阳光花园" },
});
```

---

## 15. 验收用 curl 示例

```bash
# 健康检查（直连后端）
curl http://localhost:8080/health

# 登录（经 Next 代理）
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"13800001001","loginType":"password","password":"demo123"}'

# 带 Token 拉账单
curl http://localhost:3000/api/bills?page=1&pageSize=10 \
  -H "Authorization: Bearer <token>"
```

---

## 16. 附录：类型与文件索引

| 概念 | 前端类型/文件 |
|------|----------------|
| 账单 | `app/workBench/bill/columns.tsx` |
| 材料 | `lib/materials/types.ts` |
| 系统用户 | `app/workBench/user/columns.tsx` |
| 支付 | `app/workBench/payment/columns.tsx` |
| 操作日志 | `lib/audit-log/types.ts` |
| 角色权限 | `lib/rbac/types.ts`, `lib/rbac/roles.ts` |
| HTTP 客户端 | `lib/request/client.ts` |
| API 响应约定 | `lib/api/types.ts`, `docs/restful-api.md` |

---

**文档版本**：1.0  
**生成依据**：`tbe_ai` 仓库前端代码扫描（2026-05-22）
