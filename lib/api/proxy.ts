import type { NextRequest } from "next/server";
import { ApiError } from "./errors";
import { fail, ok } from "./response";
import type { ApiHandler, ApiParams } from "./types";
import { createRoute } from "./create-route";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:3003";


type ProxyOptions = {
  /** 转发到后端的路径，默认使用当前请求路径（去掉 /api 前缀） */
  path?: (request: NextRequest) => string;
  /** 是否把客户端请求体原样转发 */
  forwardBody?: boolean;
};

function buildBackendUrl(request: NextRequest, path?: string) {
  const pathname =
    path ??
    (request.nextUrl.pathname.replace(/^\/api/, "") ||
      request.nextUrl.pathname);

  const url = new URL(pathname, backendUrl);
  url.search = request.nextUrl.search;
  return url;
}

/**
 * 将请求代理到你自维护的后端（BACKEND_URL）。
 * 适合 BFF 层快速透传，复杂聚合仍建议手写 handler。
 */
export function createProxyRoute(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  options?: ProxyOptions,
): ApiHandler {
  return async ({ request }) => {
    const url = buildBackendUrl(request, options?.path?.(request));
    const headers = new Headers(request.headers);
    headers.delete("host");

    const init: RequestInit = {
      method,
      headers,
      cache: "no-store",
    };

    if (
      options?.forwardBody !== false &&
      ["POST", "PUT", "PATCH"].includes(method)
    ) {
      const body = await request.text();
      if (body) {
        init.body = body;
      }
    }

    const response = await fetch(url, init);
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        return fail(response.status, {
          code: "UPSTREAM_ERROR",
          message: "上游服务返回错误",
          details: payload,
        });
      }

      return ok(payload, { status: response.status });
    }

    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: { "content-type": contentType || "text/plain" },
    });
  };
}

/** 快捷：整段 REST 方法都代理到后端 */
export function createBackendProxy(
  options?: ProxyOptions & { methods?: Array<"GET" | "POST" | "PUT" | "PATCH" | "DELETE"> },
) {
  const methods = options?.methods ?? ["GET", "POST", "PUT", "PATCH", "DELETE"];
  const config: Record<string, ApiHandler<ApiParams>> = {};

  for (const method of methods) {
    config[method] = createProxyRoute(method, options);
  }

  return createRoute(config);
}

export async function forwardToBackend(
  request: NextRequest,
  init?: RequestInit & { path?: string },
) {
  const url = buildBackendUrl(request, init?.path);

  const headers = new Headers(init?.headers ?? request.headers);
  headers.delete("host");

  const response = await fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw ApiError.internal("上游服务请求失败");
  }

  return response;
}
