"use client";

import {
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
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  ScrollText,
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

/** The admin nav — one entry per shipped screen, no dead links (ADR-0014). */
const NAV: readonly { label: string | null; items: readonly NavItem[] }[] = [
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
    ],
  },
  {
    label: "System",
    items: [
      { title: "Settings", href: "/settings", icon: SlidersHorizontal },
      { title: "Audit log", href: "/audit", icon: ScrollText },
    ],
  },
];

export function AdminSidebar({ adminEmail }: { adminEmail: string }) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <p className="font-display text-lg font-bold tracking-display">
          plugfolio<span className="text-primary">.</span>
        </p>
        <p className="font-mono tracking-eyebrow text-muted-foreground text-[10px] uppercase">
          Admin
        </p>
      </SidebarHeader>
      <SidebarContent>
        {NAV.map((group) => (
          <SidebarGroup key={group.label ?? "main"}>
            {group.label ? <SidebarGroupLabel>{group.label}</SidebarGroupLabel> : null}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="px-4 py-3">
        <p className="text-muted-foreground truncate text-xs">{adminEmail}</p>
        <form action={logout}>
          <SidebarMenuButton type="submit">
            <LogOut />
            <span>Sign out</span>
          </SidebarMenuButton>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
