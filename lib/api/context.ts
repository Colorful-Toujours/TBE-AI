import type { NextRequest } from "next/server";
import { ApiError } from "./errors";
import type { ApiContext, ApiParams } from "./types";

export function createApiContext<TParams extends ApiParams>(
  request: NextRequest,
  params: Promise<TParams>,
  body?: unknown,
): ApiContext<TParams> {
  return {
    request,
    params,
    query: request.nextUrl.searchParams,
    ...(body !== undefined ? { body } : {}),
  };
}

export async function readJsonBody<T = unknown>(
  request: NextRequest,
): Promise<T> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw ApiError.badRequest("Content-Type 必须为 application/json");
  }

  try {
    return (await request.json()) as T;
  } catch {
    throw ApiError.badRequest("请求体不是合法的 JSON");
  }
}

export function getQueryString(
  query: URLSearchParams,
  key: string,
  options?: { required?: boolean },
) {
  const value = query.get(key);

  if (options?.required && !value) {
    throw ApiError.badRequest(`缺少查询参数: ${key}`);
  }

  return value;
}

export async function getRouteParam(
  params: Promise<ApiParams>,
  key: string,
  options?: { required?: boolean },
) {
  const resolved = await params;
  const value = resolved[key];
  const normalized = Array.isArray(value) ? value[0] : value;

  if (options?.required && !normalized) {
    throw ApiError.badRequest(`缺少路径参数: ${key}`);
  }

  return normalized;
}
