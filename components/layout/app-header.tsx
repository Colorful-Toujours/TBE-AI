"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  clearStoredUser,
  getStoredUser,
  getUserInitials,
  USER_UPDATED_EVENT,
  type StoredUser,
} from "@/lib/auth/session";
import { ThemeToggle } from "@/components/theme-toggle";
import { recordOperation } from "@/lib/audit-log";
import { setToken } from "@/lib/request";

const pageTitles: Record<string, string> = {
  "/workBench": "工作台",
  "/workBench/bill": "账单",
  "/workBench/materials": "材料",
  "/workBench/user": "用户管理",
  "/workBench/payment": "支付",
  "/workBench/chart": "数据预览",
  "/workBench/logs": "操作日志",
  "/workBench/settings": "设置",
};

function resolvePageTitle(pathname: string) {
  if (pageTitles[pathname]) return pageTitles[pathname];

  const matched = Object.entries(pageTitles)
    .filter(([path]) => path !== "/workBench" && pathname.startsWith(path))
    .sort((a, b) => b[0].length - a[0].length)[0];

  return matched?.[1] ?? "工作台";
}

function AppBreadcrumb({ pathname }: { pathname: string }) {
  const isRoot = pathname === "/workBench";

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {isRoot ? (
            <BreadcrumbPage>工作台</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href="/workBench">工作台</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {!isRoot ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{resolvePageTitle(pathname)}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const refresh = () => setUser(getStoredUser());
    refresh();
    window.addEventListener(USER_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(USER_UPDATED_EVENT, refresh);
  }, [pathname]);

  function handleLogout() {
    recordOperation({
      action: "logout",
      module: "auth",
      target: "系统退出",
      detail: `${user?.name ?? "用户"} 退出登录`,
      operator: user?.name,
      operatorId: user?.id,
    });
    setToken(null);
    clearStoredUser();
    router.push("/login");
  }

  const displayName = user?.name ?? "未登录用户";
  const initials = getUserInitials(displayName);

  return (
    <header className="sticky top-0 z-40 flex h-[60px] shrink-0 items-center justify-between gap-4 border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/80 ">
      <AppBreadcrumb pathname={pathname} />

      <div className="flex items-center gap-1">
        <ThemeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-9 gap-2 rounded-full px-2 pr-2.5"
          >
            <Avatar className="size-8">
              {user?.avatar ? (
                <AvatarImage src={user.avatar} alt={displayName} />
              ) : null}
              <AvatarFallback className="bg-red-600 text-xs text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-28 truncate text-sm font-medium sm:inline">
              {displayName}
            </span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{displayName}</span>
              {user?.email ? (
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              ) : null}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/workBench/settings" className="cursor-pointer">
              <User />
              个人资料
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/workBench/settings" className="cursor-pointer">
              <Settings />
              账户设置
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer"
            onSelect={handleLogout}
          >
            <LogOut />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </header>
  );
}
