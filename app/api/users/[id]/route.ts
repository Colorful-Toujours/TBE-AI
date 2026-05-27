import type { NextRequest } from "next/server";

const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

type UserRouteContext = {
  params: Promise<{ id: string }>;
};

async function proxyUserRequest(request: NextRequest, context: UserRouteContext) {
  const { id } = await context.params;
  const url = new URL(`/users/${id}`, backendUrl);
  url.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };

  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    const body = await request.text();
    if (body) {
      init.body = body;
    }
  }

  return fetch(url, init);
}

export function GET(request: NextRequest, context: UserRouteContext) {
  return proxyUserRequest(request, context);
}

export function PATCH(request: NextRequest, context: UserRouteContext) {
  return proxyUserRequest(request, context);
}

export function DELETE(request: NextRequest, context: UserRouteContext) {
  return proxyUserRequest(request, context);
}
