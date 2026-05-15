import { NextResponse } from "next/server";
import type { ApiBody, ApiErrorPayload } from "./types";

type JsonInit = ResponseInit & {
  headers?: HeadersInit;
};

function jsonResponse<T>(body: ApiBody<T>, status: number, init?: JsonInit) {
  return NextResponse.json(body, { status, ...init });
}

export function ok<T>(data: T, init?: JsonInit) {
  return jsonResponse({ success: true, data }, 200, init);
}

export function created<T>(data: T, init?: JsonInit) {
  return jsonResponse({ success: true, data }, 201, init);
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function fail(
  status: number,
  error: ApiErrorPayload,
  init?: JsonInit,
) {
  return jsonResponse({ success: false, error }, status, init);
}
