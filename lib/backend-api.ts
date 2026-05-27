import { http } from "@/lib/request/client";
import type { Material } from "@/lib/materials/types";
import type { Bill } from "@/app/workBench/bill/columns";
import type { SystemUser } from "@/app/workBench/user/columns";

type ListPayload<T> =
  | T[]
  | {
      items: T[];
      total?: number;
      page?: number;
      pageSize?: number;
    };

export type ApiListResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type QueryParams = Record<string, string | number | undefined>;

export type AuthUser = {
  id?: string;
  name?: string;
  avatar?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string;
  permissions?: string[];
};

export type AuthResult = {
  token?: string;
  user?: AuthUser;
};

function normalizeList<T>(payload: ListPayload<T>): ApiListResult<T> {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      total: payload.length,
      page: 1,
      pageSize: payload.length,
    };
  }

  return {
    items: payload.items,
    total: payload.total ?? payload.items.length,
    page: payload.page ?? 1,
    pageSize: payload.pageSize ?? payload.items.length,
  };
}

async function getList<T>(url: string, params?: QueryParams) {
  return normalizeList(await http.get<ListPayload<T>>(url, { params }));
}

export function sendSmsCode(phone: string, scene: "login" | "register" | "reset_password") {
  return http.post<{ expiresIn: number; cooldown: number }>(
    "/api/auth/sms/send",
    { phone, scene },
    { auth: false },
  );
}

export function updateProfile(profile: {
  name: string;
  phone?: string | null;
  email?: string | null;
  avatar?: string | null;
}) {
  return http.patch<AuthUser>("/api/auth/profile", profile);
}

export function updatePassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  return http.patch<void>("/api/auth/password", payload);
}

export function listUsers(params?: QueryParams) {
  return getList<SystemUser>("/api/users", params);
}

export function createUser(payload: Omit<SystemUser, "id" | "createdAt">) {
  return http.post<SystemUser>("/api/users", payload);
}

export function updateUser(id: string, payload: Partial<Omit<SystemUser, "id" | "createdAt">>) {
  return http.patch<SystemUser>(`/api/users/${id}`, payload);
}

export function deleteUser(id: string) {
  return http.delete<void>(`/api/users/${id}`);
}

export function listMaterials(params?: QueryParams) {
  return getList<Material>("/api/materials", params);
}

export function createMaterial(payload: Omit<Material, "id">) {
  return http.post<Material>("/api/materials", payload);
}

export function updateMaterial(id: string, payload: Partial<Omit<Material, "id">>) {
  return http.patch<Material>(`/api/materials/${id}`, payload);
}

export function deleteMaterial(id: string) {
  return http.delete<void>(`/api/materials/${id}`);
}

export function listBills(params?: QueryParams) {
  return getList<Bill>("/api/bills", params);
}

export function createBill(payload: Omit<Bill, "id">) {
  return http.post<Bill>("/api/bills", payload);
}

export function updateBill(id: string, payload: Omit<Bill, "id">) {
  return http.patch<Bill>(`/api/bills/${id}`, payload);
}

export function deleteBill(id: string) {
  return http.delete<void>(`/api/bills/${id}`);
}
