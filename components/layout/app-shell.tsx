import { AppSidebar } from "@/components/layout/app-sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="flex min-h-screen flex-1 flex-col overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}
