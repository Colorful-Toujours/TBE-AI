import type { NextRequest } from "next/server";
import { createApiContext, readJsonBody } from "./context";
import { ApiError } from "./errors";
import { fail } from "./response";
import type {
  ApiContext,
  ApiHandler,
  ApiMiddleware,
  ApiParams,
  HttpMethod,
  RouteConfig,
  RouteMethodConfig,
} from "./types";

type RouteHandlerContext = {
  params?: Promise<ApiParams>;
};

function resolveMethodConfig<TParams extends ApiParams>(
  config: RouteMethodConfig<TParams>,
) {
  if (typeof config === "function") {
    return { handler: config, parseJson: false };
  }

  return config;
}

async function runMiddlewares<TParams extends ApiParams>(
  ctx: ApiContext<TParams>,
  middlewares: ApiMiddleware<TParams>[],
  handler: ApiHandler<TParams>,
) {
  let index = -1;

  const dispatch = async (i: number): Promise<Response> => {
    if (i <= index) {
      throw new Error("next() 被重复调用");
    }

    index = i;
    const middleware = middlewares[i];

    if (!middleware) {
      return handler(ctx);
    }

    return middleware(ctx, () => dispatch(i + 1));
  };

  return dispatch(0);
}

function handleError(error: unknown) {
  if (error instanceof ApiError) {
    return fail(error.status, error.toPayload());
  }

  console.error("[api]", error);

  const message =
    process.env.NODE_ENV === "development" && error instanceof Error
      ? error.message
      : "服务器内部错误";

  return fail(500, {
    code: "INTERNAL_ERROR",
    message,
  });
}

function createMethodHandler<TParams extends ApiParams>(
  method: HttpMethod,
  routeConfig: RouteConfig<TParams>,
) {
  const methodConfig = routeConfig[method];

  if (!methodConfig) {
    return undefined;
  }

  const { handler, parseJson } = resolveMethodConfig(methodConfig);
  const middlewares = routeConfig.middleware ?? [];

  return async (
    request: NextRequest,
    context: RouteHandlerContext,
  ): Promise<Response> => {
    try {
      const params = (context.params ?? Promise.resolve({})) as Promise<TParams>;
      const body =
        parseJson && ["POST", "PUT", "PATCH"].includes(method)
          ? await readJsonBody(request)
          : undefined;
      const ctx = createApiContext<TParams>(request, params, body);

      return await runMiddlewares(ctx, middlewares, handler);
    } catch (error) {
      return handleError(error);
    }
  };
}

/** 在 app/api 目录下的 route.ts 中声明 RESTful 路由 */
export function createRoute<TParams extends ApiParams = ApiParams>(
  config: RouteConfig<TParams>,
) {
  return {
    GET: createMethodHandler("GET", config),
    POST: createMethodHandler("POST", config),
    PUT: createMethodHandler("PUT", config),
    PATCH: createMethodHandler("PATCH", config),
    DELETE: createMethodHandler("DELETE", config),
    HEAD: createMethodHandler("HEAD", config),
    OPTIONS: createMethodHandler("OPTIONS", config),
  };
}
