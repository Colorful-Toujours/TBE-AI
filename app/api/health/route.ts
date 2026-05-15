import { createRoute, getQueryString, ok } from "@/lib/api";

export const { GET } = createRoute({
  GET: async ({ query }) => {
    const detail = getQueryString(query, "detail");

    return ok({
      status: "up",
      timestamp: new Date().toISOString(),
      ...(detail ? { detail } : {}),
    });
  },
});
