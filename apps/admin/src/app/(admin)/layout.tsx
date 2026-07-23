import { SidebarInset, SidebarProvider, SidebarTrigger } from "@plugfolio/ui";
import { AdminSidebar } from "@/components/admin-sidebar";
import { requireAdmin } from "@/server/auth";

/** Every admin screen: guard, sidebar, content. Pages render inside. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <SidebarProvider>
      <AdminSidebar adminEmail={admin.email} />
      <SidebarInset>
        <header className="border-border flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
