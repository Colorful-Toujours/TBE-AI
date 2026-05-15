import type { NextRequest } from "next/server";

export type ApiParams = Record<string, string | string[]>;

export type ApiContext<TParams extends ApiParams = ApiParams> = {
  request: NextRequest;
  params: Promise<TParams>;
  query: URLSearchParams;
  /** `parseJson: true` 时由框架预解析并缓存 */
  body?: unknown;
};

export type ApiErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiSuccessBody<T> = {
  success: true;
  data: T;
};

export type ApiErrorBody = {
  success: false;
  error: ApiErrorPayload;
};

export type ApiBody<T> = ApiSuccessBody<T> | ApiErrorBody;

export type ApiHandler<TParams extends ApiParams = ApiParams> = (
  ctx: ApiContext<TParams>,
) => Response | Promise<Response>;

export type ApiMiddleware<TParams extends ApiParams = ApiParams> = (
  ctx: ApiContext<TParams>,
  next: () => Promise<Response>,
) => Response | Promise<Response>;

export type RouteMethodConfig<TParams extends ApiParams = ApiParams> =
  | ApiHandler<TParams>
  | {
      handler: ApiHandler<TParams>;
      /** 为 true 时若 Content-Type 为 json 会预解析 body，解析失败返回 400 */
      parseJson?: boolean;
    };

export type RouteConfig<TParams extends ApiParams = ApiParams> = {
  middleware?: ApiMiddleware<TParams>[];
  GET?: RouteMethodConfig<TParams>;
  POST?: RouteMethodConfig<TParams>;
  PUT?: RouteMethodConfig<TParams>;
  PATCH?: RouteMethodConfig<TParams>;
  DELETE?: RouteMethodConfig<TParams>;
  HEAD?: RouteMethodConfig<TParams>;
  OPTIONS?: RouteMethodConfig<TParams>;
};

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";
