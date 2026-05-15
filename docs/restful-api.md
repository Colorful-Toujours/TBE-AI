# RESTful API 使用文档

本项目在 Next.js App Router 下提供了一套轻量 REST API 工具（`lib/api`），用于在 `app/api` 目录中快速编写 BFF 接口。

## 目录

- [架构说明](#架构说明)
- [快速开始](#快速开始)
- [响应格式](#响应格式)
- [编写接口](#编写接口)
- [参数解析](#参数解析)
- [错误处理](#错误处理)
- [鉴权中间件](#鉴权中间件)
- [代理到自维护后端](#代理到自维护后端)
- [前端调用示例](#前端调用示例)
- [API 速查表](#api-速查表)
- [项目内示例](#项目内示例)

---

## 架构说明

```
浏览器 / 客户端
       │
       ▼
  /api/*
       │
       ├─ 存在 app/api/**/route.ts（含 [id] 动态路由）→  Next.js 本地处理
       │
       └─ 未命中任何本地 route                      →  fallback rewrite 到 BACKEND_URL
```

> **注意**：`next.config.ts` 中后端转发必须使用 `fallback`，不能用默认的 `afterFiles`，否则像 `/api/users/[id]` 这类动态路由会被提前 rewrite 到后端，导致 500（后端未启动时表现为 `ECONNREFUSED`）。

| 环境变量 | 说明 | 默认值 |
|----------|------|--------|
| `BACKEND_URL` | 自维护后端地址 | `http://localhost:8080` |

相关文件：

| 路径 | 说明 |
|------|------|
| `lib/api/` | API 框架核心代码 |
| `app/api/` | 接口路由目录 |
| `next.config.ts` | `/api/*` 未匹配本地 route 时转发后端 |

---

## 快速开始

### 1. 新建路由文件

URL 与文件路径对应关系：

| 访问地址 | 文件 |
|----------|------|
| `GET /api/health` | `app/api/health/route.ts` |
| `GET /api/users/1` | `app/api/users/[id]/route.ts` |
| `POST /api/orders` | `app/api/orders/route.ts` |

### 2. 使用 createRoute 导出 HTTP 方法

```ts
// app/api/ping/route.ts
import { createRoute, ok } from "@/lib/api";

export const { GET } = createRoute({
  GET: async () => ok({ pong: true }),
});
```

### 3. 本地验证

```bash
pnpm dev
curl http://localhost:3000/api/health
```

---

## 响应格式

所有通过 `ok` / `created` / `fail` 返回的 JSON 接口，统一使用以下结构。

### 成功

```json
{
  "success": true,
  "data": {}
}
```

| 辅助函数 | HTTP 状态码 |
|----------|-------------|
| `ok(data)` | 200 |
| `created(data)` | 201 |
| `noContent()` | 204（无 body） |

### 失败

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "用户不存在",
    "details": {}
  }
}
```

`details` 为可选字段，仅在需要附加调试信息时出现。

---

## 编写接口

### GET：查询参数

```ts
import { createRoute, getQueryString, ok } from "@/lib/api";

export const { GET } = createRoute({
  GET: async ({ query }) => {
    const page = getQueryString(query, "page") ?? "1";
    return ok({ page, items: [] });
  },
});
```

### POST：JSON 请求体

方式一：使用 `parseJson: true`（推荐，body 会预解析到 `ctx.body`）

```ts
import { ApiError, createRoute, created } from "@/lib/api";

export const { POST } = createRoute({
  POST: {
    parseJson: true,
    handler: async (ctx) => {
      const body = ctx.body as { name: string };

      if (!body.name?.trim()) {
        throw ApiError.badRequest("name 不能为空");
      }

      return created({ id: "1", name: body.name });
    },
  },
});
```

方式二：在 handler 内手动解析

```ts
import { createRoute, created, readJsonBody } from "@/lib/api";

export const { POST } = createRoute({
  POST: async ({ request }) => {
    const body = await readJsonBody<{ name: string }>(request);
    return created(body);
  },
});
```

### 动态路由：路径参数

```ts
import { ApiError, createRoute, getRouteParam, ok } from "@/lib/api";

export const { GET } = createRoute({
  GET: async ({ params }) => {
    const id = await getRouteParam(params, "id", { required: true });
    // 调用你的后端或 service
    return ok({ id });
  },
});
```

### 一个文件支持多种 HTTP 方法

```ts
export const { GET, POST, PATCH, DELETE } = createRoute({
  GET: async (ctx) => { /* ... */ },
  POST: { parseJson: true, handler: async (ctx) => { /* ... */ } },
  PATCH: { parseJson: true, handler: async (ctx) => { /* ... */ } },
  DELETE: async (ctx) => { /* ... */ },
});
```

### Handler 上下文（ApiContext）

每个 handler 接收的 `ctx` 包含：

| 字段 | 类型 | 说明 |
|------|------|------|
| `request` | `NextRequest` | 原始请求 |
| `params` | `Promise<ApiParams>` | 动态路由参数 |
| `query` | `URLSearchParams` | URL 查询参数 |
| `body` | `unknown` | 仅当 `parseJson: true` 时有值 |

---

## 参数解析

```ts
import {
  getQueryString,
  getRouteParam,
  readJsonBody,
} from "@/lib/api";

// 查询参数 ?page=1
const page = getQueryString(query, "page");
const requiredPage = getQueryString(query, "page", { required: true });

// 路径参数 /users/[id]
const id = await getRouteParam(params, "id", { required: true });

// 手动读取 JSON body
const body = await readJsonBody<{ name: string }>(request);
```

缺少必填参数时会自动抛出 `ApiError.badRequest`。

---

## 错误处理

使用 `ApiError` 抛出业务错误，框架会自动转换为统一 JSON 响应。

```ts
import { ApiError } from "@/lib/api";

throw ApiError.badRequest("参数无效");
throw ApiError.unauthorized("未登录");
throw ApiError.forbidden("无权限");
throw ApiError.notFound("资源不存在");
throw ApiError.conflict("数据冲突");
throw ApiError.tooManyRequests();
throw ApiError.internal("服务异常");
```

| 静态方法 | HTTP | code |
|----------|------|------|
| `badRequest(msg)` | 400 | `BAD_REQUEST` |
| `unauthorized(msg?)` | 401 | `UNAUTHORIZED` |
| `forbidden(msg?)` | 403 | `FORBIDDEN` |
| `notFound(msg?)` | 404 | `NOT_FOUND` |
| `conflict(msg)` | 409 | `CONFLICT` |
| `tooManyRequests(msg?)` | 429 | `TOO_MANY_REQUESTS` |
| `internal(msg?)` | 500 | `INTERNAL_ERROR` |

未捕获的异常会返回 500；开发环境（`NODE_ENV=development`）会在 `message` 中附带错误信息。

---

## 鉴权中间件

在 `createRoute` 配置中添加 `middleware` 数组，对所有方法生效。

### 仅检查 Bearer Token 是否存在

```ts
import { createRoute, ok, requireBearerToken } from "@/lib/api";

export const { GET } = createRoute({
  middleware: [requireBearerToken()],
  GET: async () => ok({ secret: true }),
});
```

### 自定义校验并传递用户信息

```ts
import {
  createRoute,
  getAuthPayload,
  ok,
  withAuth,
  ApiError,
} from "@/lib/api";

type AuthUser = { userId: string };

export const { GET } = createRoute({
  middleware: [
    withAuth(async (token) => {
      // 调用你的后端校验 token
      if (token === "invalid") {
        throw ApiError.unauthorized("Token 无效");
      }
      return { userId: "123" };
    }),
  ],
  GET: async (ctx) => {
    const user = getAuthPayload<AuthUser>(ctx);
    return ok({ userId: user?.userId });
  },
});
```

请求头格式：

```
Authorization: Bearer <your-token>
```

### 组合多个中间件

```ts
import { compose, requireBearerToken } from "@/lib/api";

middleware: [compose(requireBearerToken(), myCustomMiddleware)],
```

---

## 代理到自维护后端

当你只想在 Next 层做薄代理（透传请求到 `BACKEND_URL`），可使用：

### 整路由代理

```ts
// app/api/profile/route.ts
import { createBackendProxy } from "@/lib/api";

export const { GET, PUT } = createBackendProxy();
```

默认将 `/api/profile` 转发到 `{BACKEND_URL}/profile`（去掉 `/api` 前缀）。

### 自定义转发路径

```ts
export const { GET } = createBackendProxy({
  path: (req) => `/v1/users/me`,
  methods: ["GET"],
});
```

### 在 handler 内手动转发

```ts
import { forwardToBackend } from "@/lib/api";

const upstream = await forwardToBackend(request, {
  method: "POST",
  path: "/orders",
});
const data = await upstream.json();
```

---

## 前端请求封装（lib/request）

统一使用 `http` 客户端，自动解析 `{ success, data }`、附带 Token、抛出 `RequestError`。

```ts
import { http, setToken, RequestError } from "@/lib/request";

// GET
const user = await http.get<{ id: string; name: string }>("/api/users/1");

// PATCH
await http.patch("/api/users/1", { name: "新名字" });

// DELETE（204 无 body）
await http.delete("/api/users/1");

// 带查询参数
const list = await http.get("/api/users", { params: { page: 1, pageSize: 10 } });

// 登录等后端原始格式（非 success 包裹）
const result = await http.post<{ token?: string; message?: string }>(
  "/api/login",
  { account: "13800138000", password: "xxx" },
  { raw: true, auth: false },
);
if (result.token) setToken(result.token);
```

| 方法 | 说明 |
|------|------|
| `http.get(url, config?)` | GET |
| `http.post(url, body?, config?)` | POST |
| `http.put(url, body?, config?)` | PUT |
| `http.patch(url, body?, config?)` | PATCH |
| `http.delete(url, config?)` | DELETE |
| `http.request(config)` | 通用请求 |
| `setToken` / `getToken` | 管理 localStorage Token |
| `createRequest(options)` | 自定义 baseURL、getToken |

错误处理：

```ts
try {
  await http.get("/api/users/1");
} catch (e) {
  if (e instanceof RequestError) {
    console.log(e.code, e.message, e.status);
  }
}
```

---

## API 速查表

### 从 `@/lib/api` 导入

| 导出 | 用途 |
|------|------|
| `createRoute` | 创建 REST 路由 |
| `ok` / `created` / `noContent` / `fail` | 构造响应 |
| `ApiError` | 业务错误 |
| `getRouteParam` / `getQueryString` / `readJsonBody` | 参数解析 |
| `requireBearerToken` / `withAuth` / `getAuthPayload` / `compose` | 中间件 |
| `createBackendProxy` / `createProxyRoute` / `forwardToBackend` | 后端代理 |

---

## 项目内示例

| 文件 | 说明 |
|------|------|
| `app/api/health/route.ts` | GET + 查询参数 |
| `app/api/users/[id]/route.ts` | GET / PATCH / DELETE 完整 CRUD 示例 |

### 测试命令

```bash
# 健康检查
curl http://localhost:3000/api/health

# 查询用户
curl http://localhost:3000/api/users/1

# 更新用户
curl -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"新名字"}'

# 删除用户
curl -X DELETE http://localhost:3000/api/users/1
```

---

## 推荐实践

1. **业务逻辑放 service**：`route.ts` 只做 HTTP 层（解析、鉴权、映射响应），复杂逻辑放到 `lib/services`。
2. **对接自维护后端**：在 handler 里 `fetch(process.env.BACKEND_URL + ...)`，或使用 `forwardToBackend`。
3. **BFF 与直连后端**：需要聚合、裁剪字段、隐藏密钥时用 Next BFF；简单透传可用 `createBackendProxy` 或 `next.config` rewrite。
4. **类型安全**：为 `ctx.body` 和返回值定义 TypeScript 类型，避免 `any`。
