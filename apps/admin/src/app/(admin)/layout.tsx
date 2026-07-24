import { SidebarInset, SidebarProvider, SidebarTrigger, ThemeToggle } from "@plugfolio/ui";
import { cookies } from "next/headers";
import { AdminSidebar } from "@/components/admin-sidebar";
import { TopBarTitle } from "@/components/top-bar-title";
import { requireAdmin } from "@/server/auth";

/** Every admin screen: guard, 244px rail (collapsible to icon), 48px top bar. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      className="[--sidebar-width:244px] [--sidebar-width-icon:64px]"
    >
      <AdminSidebar adminEmail={admin.email} />
      <SidebarInset className="min-w-0">
        <header className="border-border bg-background sticky top-0 z-20 flex h-12 shrink-0 items-center justify-between border-b px-[18px]">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-muted-foreground" />
            <TopBarTitle />
          </div>
          <ThemeToggle cookieName="admin-theme" />
        </header>
        <main className="flex-1 overflow-x-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
