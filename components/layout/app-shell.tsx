import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh">
      <AppSidebar />
      <main className="flex min-h-dvh flex-1 flex-col overflow-hidden bg-background">
        <AppHeader />
        <div className="flex-1 p-2 overflow-auto ">{children}</div>
      </main>
    </div>
  );
}
