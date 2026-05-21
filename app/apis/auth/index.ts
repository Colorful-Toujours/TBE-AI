import { Post } from "@/lib/request";
import type { AuthParams, LoginParams } from "./type";

function Login(data: LoginParams) {
  return Post<{ token?: string; data?: { token?: string } }>(
    "/api/auth/login",
    data,
  );
}

function Auth(data: AuthParams) {
  return Post<{ id: string }>("/api/auth/auth", data);
}

export { Login, Auth };