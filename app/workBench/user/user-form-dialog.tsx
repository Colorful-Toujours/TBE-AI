"use client";

import { useEffect, useState } from "react";

import type { SystemUser } from "./columns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_DEFINITIONS, ROLE_OPTIONS } from "@/lib/rbac";
import type { UserRole } from "@/lib/rbac";

export type UserFormValues = {
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  status: "启用" | "禁用";
};

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: SystemUser | null;
  onSubmit: (values: UserFormValues) => void;
};

function userToDraft(user?: SystemUser | null) {
  if (!user) {
    return {
      name: "",
      phone: "",
      email: "",
      role: "employee" as UserRole,
      status: "启用" as const,
    };
  }
  return {
    name: user.name,
    phone: user.phone,
    email: user.email ?? "",
    role: user.role,
    status: user.status,
  };
}

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
}: UserFormDialogProps) {
  const [draft, setDraft] = useState(userToDraft(user));
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => {
        setDraft(userToDraft(user));
        setError("");
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [open, user]);

  const roleDef = ROLE_DEFINITIONS[draft.role];

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!draft.name.trim()) {
      setError("请填写姓名");
      return;
    }
    if (!/^1\d{10}$/.test(draft.phone.trim())) {
      setError("请填写正确的 11 位手机号");
      return;
    }

    onSubmit({
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim() || undefined,
      role: draft.role,
      status: draft.status,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? "编辑用户" : "新增用户"}</DialogTitle>
          <DialogDescription>
            为用户分配角色，权限由角色自动决定。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">姓名</Label>
            <Input
              id="user-name"
              value={draft.name}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-phone">手机号</Label>
            <Input
              id="user-phone"
              value={draft.phone}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="11 位手机号"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-email">邮箱（选填）</Label>
            <Input
              id="user-email"
              type="email"
              value={draft.email}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>角色</Label>
              <Select
                value={draft.role}
                onValueChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    role: value as UserRole,
                  }))
                }
                disabled={user?.role === "super_admin"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>状态</Label>
              <Select
                value={draft.status}
                onValueChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    status: value as "启用" | "禁用",
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="启用">启用</SelectItem>
                  <SelectItem value="禁用">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">{roleDef.label}</p>
            <p className="mt-1">{roleDef.description}</p>
            <p className="mt-1">包含 {roleDef.permissions.length} 项权限</p>
          </div>

          {error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit">{user ? "保存" : "创建"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
