import type { Meta, StoryObj } from "@storybook/react";
import {
  Logo,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@plugfolio/ui";
import { LayoutDashboard, ScrollText, Users } from "lucide-react";

/**
 * UI Kit · Sidebar — the admin shell: brand lockup header, grouped nav with
 * a Violet Wash active state (--surface-active), inset content area.
 */
const meta: Meta<typeof Sidebar> = {
  title: "UI Kit/Sidebar",
  component: Sidebar,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

export const AdminShell: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="px-4 py-3">
          <Logo tone="auto" />
          <p className="font-mono tracking-eyebrow text-muted-foreground text-[10px] uppercase">
            Admin
          </p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>People</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Users />
                    <span>Members</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <ScrollText />
                    <span>Audit log</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="border-border flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <main className="text-muted-foreground p-6 text-sm">Content renders beside the rail.</main>
      </SidebarInset>
    </SidebarProvider>
  ),
};
