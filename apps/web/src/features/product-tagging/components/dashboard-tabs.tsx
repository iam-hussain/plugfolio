"use client";

import { cn } from "@plugfolio/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Dashboard section tabs (design handoff open question resolved: text tabs
 * under the top bar — creators work on desktop too, a bottom bar doesn't).
 * Space Mono uppercase per the brand's micro-label rule.
 */
const TABS = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/posts", label: "Posts" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/categories", label: "Categories" },
  { href: "/dashboard/collabs", label: "Collabs" },
  { href: "/dashboard/settings", label: "Settings", adminOnly: true },
];

export type DashboardTabsProps = {
  profileId?: string;
  isAdmin: boolean;
};

export function DashboardTabs({ profileId, isAdmin }: DashboardTabsProps) {
  const pathname = usePathname();
  return (
    <nav aria-label="Dashboard sections" className="overflow-x-auto">
      <ul className="mx-auto flex w-full max-w-2xl px-4">
        {TABS.filter((tab) => !tab.adminOnly || isAdmin).map((tab) => {
          const active =
            tab.href === "/dashboard" ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={{ pathname: tab.href, query: profileId ? { profile: profileId } : {} }}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "font-mono tracking-eyebrow inline-flex h-11 items-center border-b-2 px-3 text-[11px] uppercase whitespace-nowrap",
                  active
                    ? "border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground border-transparent",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
