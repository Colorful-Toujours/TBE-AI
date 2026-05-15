import { RequestError } from "./errors";
import type {
  ApiBody,
  HttpClient,
  RequestConfig,
  RequestMethod,
} from "./types";

const TOKEN_STORAGE_KEY = "token";

export type CreateRequestOptions = {
  /** 如 `https://api.example.com`，默认空字符串（相对路径） */
  baseURL?: string;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
};

function buildUrl(
  baseURL: string,
  url: string,
  params?: RequestConfig["params"],
) {
  const path = url.startsWith("http") ? url : `${baseURL}${url}`;
  if (!params) return path;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

function defaultGetToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function isApiBody(value: unknown): value is ApiBody<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    typeof (value as ApiBody<unknown>).success === "boolean"
  );
}

export function createRequest(options: CreateRequestOptions = {}): HttpClient {
  const baseURL = options.baseURL ?? "";
  const getToken = options.getToken ?? defaultGetToken;
  const onUnauthorized = options.onUnauthorized;

  async function request<T>(config: RequestConfig): Promise<T> {
    const {
      url,
      method = "GET",
      params,
      body,
      headers,
      auth = true,
      raw = false,
      signal,
    } = config;

    const finalUrl = buildUrl(baseURL, url, params);
    const reqHeaders = new Headers(headers);

    if (body !== undefined && !reqHeaders.has("Content-Type")) {
      reqHeaders.set("Content-Type", "application/json");
    }

    if (auth) {
      const token = getToken();
      if (token) {
        reqHeaders.set("Authorization", `Bearer ${token}`);
      }
    }

    const response = await fetch(finalUrl, {
      method,
      headers: reqHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });

    const isJson = (response.headers.get("content-type") ?? "").includes(
      "application/json",
    );

    if (response.status === 204) {
      return undefined as T;
    }

    const payload: unknown = isJson
      ? await response.json().catch(() => null)
      : await response.text();

    if (raw) {
      if (!response.ok) {
        const message =
          typeof payload === "object" &&
          payload !== null &&
          "message" in payload &&
          typeof (payload as { message: unknown }).message === "string"
            ? (payload as { message: string }).message
            : "请求失败";

        if (response.status === 401) {
          onUnauthorized?.();
        }

        throw new RequestError(
          message,
          response.status,
          "REQUEST_FAILED",
          payload,
        );
      }

      return payload as T;
    }

    if (isApiBody(payload)) {
      if (!payload.success) {
        if (response.status === 401 || payload.error.code === "UNAUTHORIZED") {
          onUnauthorized?.();
        }

        throw new RequestError(
          payload.error.message,
          response.status,
          payload.error.code,
          payload.error.details,
        );
      }

      return payload.data as T;
    }

    if (!response.ok) {
      const message =
        typeof payload === "string" && payload ? payload : "请求失败";
      throw new RequestError(
        message,
        response.status,
        "REQUEST_FAILED",
        payload,
      );
    }

    return payload as T;
  }

  function methodRequest<T>(
    method: RequestMethod,
    url: string,
    body?: unknown,
    config?: Omit<RequestConfig, "url" | "method" | "body">,
  ) {
    return request<T>({ ...config, url, method, body });
  }

  return {
    request,
    get: <T>(
      url: string,
      config?: Omit<RequestConfig, "url" | "method" | "body">,
    ) => request<T>({ ...config, url, method: "GET" }),
    post: <T>(
      url: string,
      body?: unknown,
      config?: Omit<RequestConfig, "url" | "method" | "body">,
    ) => methodRequest<T>("POST", url, body, config),
    put: <T>(
      url: string,
      body?: unknown,
      config?: Omit<RequestConfig, "url" | "method" | "body">,
    ) => methodRequest<T>("PUT", url, body, config),
    patch: <T>(
      url: string,
      body?: unknown,
      config?: Omit<RequestConfig, "url" | "method" | "body">,
    ) => methodRequest<T>("PATCH", url, body, config),
    delete: <T>(
      url: string,
      config?: Omit<RequestConfig, "url" | "method" | "body">,
    ) => request<T>({ ...config, url, method: "DELETE" }),
  };
}

/** 默认客户端：相对路径请求同域 /api */
export const http = createRequest();

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;

  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function getToken() {
  return defaultGetToken();
}
