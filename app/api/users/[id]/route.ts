import {
  ApiError,
  createRoute,
  getRouteParam,
  noContent,
  ok,
} from "@/lib/api";

type User = {
  id: string;
  name: string;
};

// 示例：内存数据，实际项目请调用你的后端 service
const users = new Map<string, User>([
  ["1", { id: "1", name: "示例用户" }],
]);

export const { GET, PATCH, DELETE } = createRoute({
  GET: async ({ params }) => {
    const id = await getRouteParam(params, "id", { required: true });
    const user = users.get(id!);
    console.log("user", user);
    if (!user) {
      throw ApiError.notFound("用户不存在");
    }

    return ok(user);
  },

  PATCH: {
    parseJson: true,
    handler: async (ctx) => {
      const id = await getRouteParam(ctx.params, "id", { required: true });
      const body = ctx.body as { name?: string };

      if (!body.name?.trim()) {
        throw ApiError.badRequest("name 不能为空");
      }

      const existing = users.get(id!);

      if (!existing) {
        throw ApiError.notFound("用户不存在");
      }

      const updated = { ...existing, name: body.name.trim() };
      users.set(id!, updated);

      return ok(updated);
    },
  },

  DELETE: async ({ params }) => {
    const id = await getRouteParam(params, "id", { required: true });

    if (!users.delete(id!)) {
      throw ApiError.notFound("用户不存在");
    }

    return noContent();
  },
});
