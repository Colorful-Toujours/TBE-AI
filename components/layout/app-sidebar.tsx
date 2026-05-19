"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Settings,
  type LucideIcon,
  CreditCard,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

const navItems: NavItem[] = [
  { title: "工作台", href: "/workBench", icon: LayoutDashboard, exact: true },
  { title: "账单", href: "/workBench/bill", icon: Receipt },
  { title: "设置", href: "/workBench/settings", icon: Settings },
  { title: "支付", href: "/workBench/payment", icon: CreditCard },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-dvh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <div className="flex size-8 items-center justify-center overflow-hidden rounded-lg ">
          <Image src="/TBE.png" alt="TBE" width={32} height={32} />
        </div>
        <span className="text-sm font-semibold tracking-tight">AI LEDGER</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ title, href, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}
            >
              <Icon className={cn("size-4 shrink-0", active && "text-red-600")} />
              {title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          返回首页
        </Link>
      </div>
    </aside>
  );
}
