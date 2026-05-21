export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

/** Query 参数：会跳过 `undefined` / `null` */
export type SearchParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  params?: SearchParams;
  /** 对象/数组会按 JSON 序列化；`FormData` / `Blob` / 字符串等原样作为 body */
  body?: RequestBody;
};

export type RequestBody =
  | Record<string, unknown>
  | unknown[]
  | string
  | FormData
  | Blob
  | ArrayBuffer
  | null;

export class HttpError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.payload = payload;
  }
}

function getApiBase(): string {
  return (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/$/, "");
}

function resolveUrl(path: string, params?: SearchParams): string {
  const base = getApiBase();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const origin =
    path.startsWith("http://") || path.startsWith("https://")
      ? path
      : `${base}${normalized}`;

  if (!params || Object.keys(params).length === 0) {
    return origin;
  }

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    search.set(key, String(value));
  }
  const q = search.toString();
  return q ? `${origin}?${q}` : origin;
}

function isJsonSerializableBody(
  body: RequestBody
): body is Record<string, unknown> | unknown[] {
  return typeof body === "object" && body !== null && !ArrayBuffer.isView(body);
}

async function readBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  const text = await res.text();
  return text.length > 0 ? text : null;
}

/**
 * 统一请求：后端基址用环境变量 `NEXT_PUBLIC_API_BASE`（可选，不填则走相对路径如 `/api/...`）。
 * @returns 解析后的 JSON（或非 JSON 的文本）；用泛型声明期望结构。
 */
export async function apiRequest<T = unknown>(
  path: string,
  method: HttpMethod,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { params, body, headers, ...rest } = options;
  const url = resolveUrl(path, params);
  const headerInit = new Headers(headers);

  let fetchBody: BodyInit | undefined;
  const allowBody = method !== "GET" && method !== "HEAD";

  if (allowBody && body !== undefined && body !== null) {
    if (
      typeof body === "string" ||
      body instanceof FormData ||
      body instanceof Blob ||
      body instanceof ArrayBuffer
    ) {
      fetchBody = body;
    } else if (isJsonSerializableBody(body)) {
      if (!headerInit.has("Content-Type")) {
        headerInit.set("Content-Type", "application/json");
      }
      fetchBody = JSON.stringify(body);
    }
  }

  const response = await fetch(url, {
    ...rest,
    method,
    headers: headerInit,
    body: allowBody ? fetchBody : undefined,
  });

  const payload = await readBody(response);

  if (!response.ok) {
    throw new HttpError(
      typeof payload === "object" && payload !== null && "message" in payload
        ? String((payload as { message: unknown }).message)
        : response.statusText || "Request failed",
      response.status,
      payload
    );
  }

  return payload as T;
}

export function Get<T = unknown>(
  path: string,
  options?: Omit<ApiRequestOptions, "body">
): Promise<T> {
  return apiRequest<T>(path, "GET", options);
}

export function Post<T = unknown>(
  path: string,
  body?: ApiRequestOptions["body"],
  options?: Omit<ApiRequestOptions, "body">
): Promise<T> {
  return apiRequest<T>(path, "POST", { ...options, body });
}

export function Put<T = unknown>(
  path: string,
  body?: ApiRequestOptions["body"],
  options?: Omit<ApiRequestOptions, "body">
): Promise<T> {
  return apiRequest<T>(path, "PUT", { ...options, body });
}

export function Patch<T = unknown>(
  path: string,
  body?: ApiRequestOptions["body"],
  options?: Omit<ApiRequestOptions, "body">
): Promise<T> {
  return apiRequest<T>(path, "PATCH", { ...options, body });
}

export function Delete<T = unknown>(
  path: string,
  options?: ApiRequestOptions
): Promise<T> {
  return apiRequest<T>(path, "DELETE", options);
}
