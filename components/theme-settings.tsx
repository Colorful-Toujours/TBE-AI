"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

const themeOptions = [
  {
    value: "light",
    label: "浅色",
    description: "明亮界面，适合白天使用",
    icon: Sun,
  },
  {
    value: "dark",
    label: "深色",
    description: "暗色界面，减少屏幕眩光",
    icon: Moon,
  },
  {
    value: "system",
    label: "跟随系统",
    description: "自动匹配操作系统外观",
    icon: Monitor,
  },
] as const;

type ThemeSettingsProps = {
  onThemeChange?: (theme: string) => void;
};

export function ThemeSettings({ onThemeChange }: ThemeSettingsProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function handleSelect(value: string) {
    setTheme(value);
    onThemeChange?.(value);
  }

  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <Palette className="size-5 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-base font-semibold">外观主题</h2>
          <p className="text-sm text-muted-foreground">
            基于 shadcn 设计变量，支持浅色、深色与跟随系统
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          const selected = mounted && theme === option.value;
          const previewClass =
            option.value === "dark"
              ? "dark bg-[oklch(0.145_0_0)] text-[oklch(0.985_0_0)]"
              : option.value === "light"
                ? "bg-[oklch(1_0_0)] text-[oklch(0.145_0_0)]"
                : resolvedTheme === "dark"
                  ? "dark bg-[oklch(0.145_0_0)] text-[oklch(0.985_0_0)]"
                  : "bg-[oklch(1_0_0)] text-[oklch(0.145_0_0)]";

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={cn(
                "flex flex-col rounded-xl border p-4 text-left transition-all hover:border-foreground/30",
                selected
                  ? "border-foreground ring-2 ring-ring/50"
                  : "border-border",
              )}
            >
              <div
                className={cn(
                  "mb-3 flex h-20 items-center justify-center rounded-lg border border-border/60",
                  previewClass,
                )}
              >
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className="size-3 rounded-full bg-primary" />
                  <span className="h-2 w-12 rounded bg-muted" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Icon className="size-4" />
                <span className="font-medium">{option.label}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>

      {mounted ? (
        <p className="mt-4 text-xs text-muted-foreground">
          当前生效：
          {theme === "system"
            ? `跟随系统（${resolvedTheme === "dark" ? "深色" : "浅色"}）`
            : theme === "dark"
              ? "深色"
              : "浅色"}
        </p>
      ) : null}
    </section>
  );
}
