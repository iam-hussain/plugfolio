"use client";

import {
  Logo,
  Wordmark,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@plugfolio/ui";
import {
  BarChart3,
  Briefcase,
  ClipboardList,
  Flag,
  Handshake,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  ScrollText,
  Shield,
  ShoppingBag,
  SlidersHorizontal,
  UserSquare,
  Users,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/server/actions";

type NavItem = { title: string; href: Route; icon: React.ComponentType };

/** The admin nav (design order) — one entry per shipped screen. */
export const NAV: readonly { label: string | null; items: readonly NavItem[] }[] = [
  {
    label: null,
    items: [{ title: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "People",
    items: [
      { title: "Members", href: "/members", icon: Users },
      { title: "Profiles", href: "/profiles", icon: UserSquare },
    ],
  },
  {
    label: "Content",
    items: [
      { title: "Posts", href: "/posts", icon: ImageIcon },
      { title: "Products", href: "/products", icon: ShoppingBag },
      { title: "Comments", href: "/comments", icon: MessageSquare },
      { title: "Reports", href: "/reports", icon: Flag },
    ],
  },
  {
    label: "Marketplace",
    items: [
      { title: "Businesses", href: "/businesses", icon: Briefcase },
      { title: "Requirements", href: "/requirements", icon: ClipboardList },
      { title: "Collabs", href: "/collabs", icon: Handshake },
    ],
  },
  {
    label: "Insight",
    items: [{ title: "Analytics", href: "/analytics", icon: BarChart3 }],
  },
  {
    label: "System",
    items: [
      { title: "Admins", href: "/admins", icon: Shield },
      { title: "Settings", href: "/settings", icon: SlidersHorizontal },
      { title: "Audit log", href: "/audit", icon: ScrollText },
    ],
  },
];

export function AdminSidebar({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-border border-r">
      <SidebarHeader className="min-h-[62px] justify-center px-3.5 pb-3.5 pt-[18px]">
        <div className="flex items-center gap-2.5">
          <Logo layout="symbol" tone="auto" markSize="sm" className="shrink-0" />
          <div className="group-data-[collapsible=icon]:hidden">
            <Wordmark tone="auto" className="text-lg leading-none" />
            <p className="font-mono text-primary mt-[3px] text-[10px] font-bold uppercase leading-none tracking-[0.1em]">
              Admin
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2.5 pb-2.5 pt-1">
        {NAV.map((group) => (
          <SidebarGroup key={group.label ?? "main"} className="p-0">
            {group.label ? (
              <SidebarGroupLabel className="font-mono text-faint h-auto px-2.5 pb-1.5 pt-3.5 text-[10px] font-bold uppercase tracking-[0.1em] group-data-[collapsible=icon]:hidden">
                {group.label}
              </SidebarGroupLabel>
            ) : null}
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const active =
                    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className="text-muted-foreground hover:bg-muted hover:text-foreground data-[active=true]:bg-active data-[active=true]:text-primary gap-[11px] rounded-lg px-2.5 py-2 text-[13.5px] font-medium data-[active=true]:font-semibold"
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-border border-t p-3">
        <p className="text-faint truncate px-2 pb-2 text-xs group-data-[collapsible=icon]:hidden">
          {adminEmail}
        </p>
        <form action={logout}>
          <SidebarMenuButton
            type="submit"
            tooltip="Sign out"
            className="text-muted-foreground hover:bg-muted hover:text-foreground gap-[11px] rounded-lg px-2.5 py-2 text-[13.5px] font-medium"
          >
            <LogOut />
            <span>Sign out</span>
          </SidebarMenuButton>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
