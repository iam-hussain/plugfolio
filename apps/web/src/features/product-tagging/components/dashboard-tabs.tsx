"use client";

import { DashTab, DashTabs } from "@plugfolio/ui";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Dashboard section tabs (DESIGN dashboard.html §5.17). Text tabs under the
 * top bar — creators work on desktop too, where a bottom bar doesn't reach.
 *
 * Settings shows for Managers as well (they get the picture control); the page
 * itself gates everything else to the Admin, visibly rather than by hiding it.
 */
// v2 naming (ADR-0026 / functional spec §14): products read as "Things" and
// categories as "Shelves" everywhere a creator sees them; routes stay put.
const TABS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/posts", label: "Posts" },
  { href: "/dashboard/products", label: "Things" },
  { href: "/dashboard/categories", label: "Shelves" },
  { href: "/dashboard/traffic", label: "Traffic" },
  { href: "/dashboard/collabs", label: "Collabs" },
  { href: "/dashboard/settings", label: "Settings" },
];

export type DashboardTabsProps = {
  profileId?: string;
};

export function DashboardTabs({ profileId }: DashboardTabsProps) {
  const pathname = usePathname();
  /* Tabs carry ?profile= so switching section keeps the profile you were
     editing. The shell lives in a layout now and layouts never see
     searchParams, so the id is read from the URL here — same source the
     switcher uses, so the two cannot disagree about which profile the row
     is pointing at. */
  const params = useSearchParams();
  const activeProfileId = profileId ?? params.get("profile") ?? undefined;
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
            <Link
              href={{
                pathname: tab.href,
                query: activeProfileId ? { profile: activeProfileId } : {},
              }}
            >
              {tab.label}
            </Link>
          </DashTab>
        );
      })}
    </DashTabs>
  );
}
