import type { ApiErrorPayload } from "./types";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  toPayload(): ApiErrorPayload {
    return {
      code: this.code,
      message: this.message,
      ...(this.details !== undefined ? { details: this.details } : {}),
    };
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, "BAD_REQUEST", message, details);
  }

  static unauthorized(message = "未授权") {
    return new ApiError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "无权限") {
    return new ApiError(403, "FORBIDDEN", message);
  }

  static notFound(message = "资源不存在") {
    return new ApiError(404, "NOT_FOUND", message);
  }

  static conflict(message: string, details?: unknown) {
    return new ApiError(409, "CONFLICT", message, details);
  }

  static tooManyRequests(message = "请求过于频繁") {
    return new ApiError(429, "TOO_MANY_REQUESTS", message);
  }

  static internal(message = "服务器内部错误") {
    return new ApiError(500, "INTERNAL_ERROR", message);
  }
}
