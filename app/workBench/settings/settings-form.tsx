"use client";

import { useEffect, useState } from "react";
import { KeyRound, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recordOperation } from "@/lib/audit-log";
import { changePassword } from "@/lib/auth/credentials";
import {
  getStoredUser,
  getUserInitials,
  setStoredUser,
  type StoredUser,
} from "@/lib/auth/session";
import { ThemeSettings } from "@/components/theme-settings";
import { cn } from "@/lib/utils";

export function SettingsForm() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      setProfile({
        name: user.name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        avatar: user.avatar ?? "",
      });
    }
  }, []);

  async function handleProfileSubmit(event: React.FormEvent) {
    event.preventDefault();
    setProfileMessage(null);

    if (!profile.name.trim()) {
      setProfileMessage({ type: "error", text: "请填写姓名" });
      return;
    }

    setSavingProfile(true);
    try {
      const existing = getStoredUser();
      const updated: StoredUser = {
        id: existing?.id,
        name: profile.name.trim(),
        email: profile.email.trim() || null,
        phone: profile.phone.trim() || null,
        avatar: profile.avatar.trim() || null,
      };

      setStoredUser(updated);
      recordOperation({
        action: "update",
        module: "settings",
        target: "个人信息",
        detail: `更新姓名：${updated.name}，手机：${updated.phone ?? "—"}`,
      });
      setProfileMessage({ type: "success", text: "个人信息已保存" });
    } catch {
      setProfileMessage({ type: "error", text: "保存失败，请稍后重试" });
    } finally {
      setSavingProfile(false);
    }
  }

  function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPasswordMessage(null);

    const user = getStoredUser();
    if (!user) {
      setPasswordMessage({ type: "error", text: "请先登录" });
      return;
    }

    if (!passwordForm.current) {
      setPasswordMessage({ type: "error", text: "请输入当前密码" });
      return;
    }
    if (!passwordForm.next) {
      setPasswordMessage({ type: "error", text: "请输入新密码" });
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordMessage({ type: "error", text: "两次输入的新密码不一致" });
      return;
    }

    setSavingPassword(true);
    const result = changePassword(
      user.id,
      user.name,
      passwordForm.current,
      passwordForm.next,
    );

    if (!result.ok) {
      setPasswordMessage({ type: "error", text: result.message });
      setSavingPassword(false);
      return;
    }

    setPasswordForm({ current: "", next: "", confirm: "" });
    recordOperation({
      action: "update",
      module: "settings",
      target: "登录密码",
      detail: "用户修改登录密码",
    });
    setPasswordMessage({ type: "success", text: "密码修改成功" });
    setSavingPassword(false);
  }

  const initials = getUserInitials(profile.name);

  return (
    <div className="mx-auto w-full space-y-6">
      <ThemeSettings
        onThemeChange={(theme) => {
          recordOperation({
            action: "update",
            module: "settings",
            target: "外观主题",
            detail: `切换主题为：${theme === "system" ? "跟随系统" : theme === "dark" ? "深色" : "浅色"}`,
          });
        }}
      />

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <UserRound className="size-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-base font-semibold">个人信息</h2>
            <p className="text-sm text-muted-foreground">
              修改后将在顶部头像区域同步显示
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              {profile.avatar ? (
                <AvatarImage src={profile.avatar} alt={profile.name} />
              ) : null}
              <AvatarFallback className="bg-red-600 text-lg text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Label htmlFor="avatar">头像链接（选填）</Label>
              <Input
                id="avatar"
                value={profile.avatar}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, avatar: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">手机号</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="11 位手机号"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="name@example.com"
              />
            </div>
          </div>

          {profileMessage ? (
            <p
              className={cn(
                "text-sm font-medium",
                profileMessage.type === "success"
                  ? "text-emerald-600"
                  : "text-destructive",
              )}
            >
              {profileMessage.text}
            </p>
          ) : null}

          <Button type="submit" disabled={savingProfile}>
            {savingProfile ? "保存中…" : "保存个人信息"}
          </Button>
        </form>
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <KeyRound className="size-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-base font-semibold">修改密码</h2>
            <p className="text-sm text-muted-foreground">
              使用密码登录的账号可在此修改；手机验证码登录需先设置密码
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">当前密码</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={passwordForm.current}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  current: e.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">新密码</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={passwordForm.next}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, next: e.target.value }))
                }
                placeholder="至少 6 位"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">确认新密码</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={passwordForm.confirm}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirm: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {passwordMessage ? (
            <p
              className={cn(
                "text-sm font-medium",
                passwordMessage.type === "success"
                  ? "text-emerald-600"
                  : "text-destructive",
              )}
            >
              {passwordMessage.text}
            </p>
          ) : null}

          <Button type="submit" disabled={savingPassword}>
            {savingPassword ? "提交中…" : "更新密码"}
          </Button>
        </form>
      </section>
    </div>
  );
}
