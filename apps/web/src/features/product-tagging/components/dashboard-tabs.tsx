"use client";

import { DashTab, DashTabs } from "@plugfolio/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Dashboard section tabs (DESIGN dashboard.html §5.17). Text tabs under the
 * top bar — creators work on desktop too, where a bottom bar doesn't reach.
 *
 * Settings shows for Managers as well (they get the picture control); the page
 * itself gates everything else to the Admin, visibly rather than by hiding it.
 */
const TABS = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/posts", label: "Posts" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/categories", label: "Categories" },
  { href: "/dashboard/collabs", label: "Collabs" },
  { href: "/dashboard/settings", label: "Settings" },
];

export type DashboardTabsProps = {
  profileId?: string;
};

export function DashboardTabs({ profileId }: DashboardTabsProps) {
  const pathname = usePathname();
  return (
    <DashTabs>
      {TABS.map((tab) => {
        // A detail route lights its PARENT tab — the post editor is a Posts
        // route, not a seventh section, and a shell that lights nothing there
        // reads as having lost its place.
        const active =
          tab.href === "/dashboard" ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <DashTab key={tab.href} current={active} asChild>
            <Link href={{ pathname: tab.href, query: profileId ? { profile: profileId } : {} }}>
              {tab.label}
            </Link>
          </DashTab>
        );
      })}
    </DashTabs>
  );
}
