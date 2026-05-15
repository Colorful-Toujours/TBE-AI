export type ApiSuccessBody<T> = {
  success: true;
  data: T;
};

export type ApiErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiErrorBody = {
  success: false;
  error: ApiErrorPayload;
};

export type ApiBody<T> = ApiSuccessBody<T> | ApiErrorBody;

export type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RequestConfig = {
  /** 相对路径，如 `/api/users/1` */
  url: string;
  method?: RequestMethod;
  /** URL 查询参数 */
  params?: Record<string, string | number | boolean | null | undefined>;
  /** JSON body（POST/PUT/PATCH） */
  body?: unknown;
  headers?: HeadersInit;
  /** 自动附带 Bearer Token，默认 true */
  auth?: boolean;
  /**
   * 原始响应模式：不解析 `{ success, data }` 包裹。
   * 用于 rewrite 到后端的接口（如 `/api/login`）。
   */
  raw?: boolean;
  signal?: AbortSignal;
};

export type HttpClient = {
  request: <T>(config: RequestConfig) => Promise<T>;
  get: <T>(
    url: string,
    config?: Omit<RequestConfig, "url" | "method" | "body">,
  ) => Promise<T>;
  post: <T>(
    url: string,
    body?: unknown,
    config?: Omit<RequestConfig, "url" | "method" | "body">,
  ) => Promise<T>;
  put: <T>(
    url: string,
    body?: unknown,
    config?: Omit<RequestConfig, "url" | "method" | "body">,
  ) => Promise<T>;
  patch: <T>(
    url: string,
    body?: unknown,
    config?: Omit<RequestConfig, "url" | "method" | "body">,
  ) => Promise<T>;
  delete: <T>(
    url: string,
    config?: Omit<RequestConfig, "url" | "method" | "body">,
  ) => Promise<T>;
};
