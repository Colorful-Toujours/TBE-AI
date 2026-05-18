import { AppShell } from "@/components/layout/app-shell";

export default function WorkBenchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
