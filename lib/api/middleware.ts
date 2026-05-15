import { ApiError } from "./errors";
import type { ApiMiddleware, ApiParams } from "./types";

/** 要求请求头携带 Authorization: Bearer <token> */
export function requireBearerToken(): ApiMiddleware {
  return async (ctx, next) => {
    const authorization = ctx.request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      throw ApiError.unauthorized("缺少 Bearer Token");
    }

    return next();
  };
}

/** 自定义鉴权，校验通过后将 payload 挂到 ctx（通过 WeakMap 在 handler 内读取） */
const authPayloadStore = new WeakMap<object, unknown>();

export function getAuthPayload<T>(ctx: object): T | undefined {
  return authPayloadStore.get(ctx) as T | undefined;
}

export function withAuth<TPayload>(
  verify: (token: string) => TPayload | Promise<TPayload>,
): ApiMiddleware {
  return async (ctx, next) => {
    const authorization = ctx.request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!token) {
      throw ApiError.unauthorized("缺少 Bearer Token");
    }

    const payload = await verify(token);
    authPayloadStore.set(ctx, payload);

    return next();
  };
}

export function compose<TParams extends ApiParams = ApiParams>(
  ...middlewares: ApiMiddleware<TParams>[]
): ApiMiddleware<TParams> {
  return (ctx, next) => {
    let index = -1;

    const dispatch = async (i: number): Promise<Response> => {
      if (i <= index) {
        throw new Error("next() 被重复调用");
      }

      index = i;
      const middleware = middlewares[i];

      if (!middleware) {
        return next();
      }

      return middleware(ctx, () => dispatch(i + 1));
    };

    return dispatch(0);
  };
}
