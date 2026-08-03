"use client";

import type { AccessibleProfile, ProfileContentCounts } from "@plugfolio/core";
import { DashTab, DashTabs } from "@plugfolio/ui";
import { cva } from "class-variance-authority";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * The dashboard rail (v2, `Plugfolio v2.dc.html` §dashboard): Overview ·
 * Posts · Things · Shelves · Traffic · Collabs · Settings, the content
 * sections wearing their counts as pills. Settings shows for Managers too
 * (they get the picture control); the page itself gates the rest to the
 * Admin, visibly rather than by hiding it.
 */
const TABS: readonly { href: string; label: string; count?: keyof ProfileContentCounts }[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/posts", label: "Posts", count: "posts" },
  { href: "/dashboard/products", label: "Things", count: "products" },
  { href: "/dashboard/categories", label: "Shelves", count: "categories" },
  { href: "/dashboard/traffic", label: "Traffic" },
  { href: "/dashboard/collabs", label: "Collabs", count: "collabs" },
  { href: "/dashboard/settings", label: "Settings" },
];

const countPill = cva(
  "text-pico rounded-pill px-[7px] py-[3px] font-mono font-bold tracking-[0.06em] tabular-nums",
  {
    variants: {
      active: {
        true: "bg-primary text-primary-foreground",
        false: "bg-active text-faint",
      },
    },
    defaultVariants: { active: false },
  },
);

export type DashboardTabsProps = {
  profiles?: readonly AccessibleProfile[];
  /** Per-profile section counts, keyed by profile id (from the layout). */
  counts?: Record<string, ProfileContentCounts>;
  profileId?: string;
};

export function DashboardTabs({ profiles = [], counts, profileId }: DashboardTabsProps) {
  const pathname = usePathname();
  /* Tabs carry ?profile= so switching section keeps the profile you were
     editing. The shell lives in a layout and layouts never see searchParams,
     so the id is read from the URL here — same rule as the switcher, so the
     two cannot disagree. */
  const params = useSearchParams();
  const activeProfileId = profileId ?? params.get("profile") ?? profiles[0]?.id ?? undefined;
  const activeCounts = activeProfileId ? counts?.[activeProfileId] : undefined;

  return (
    <DashTabs>
      {TABS.map((tab) => {
        // A detail route lights its PARENT tab — the post editor is a Posts
        // route, not an eighth section.
        const active =
          tab.href === "/dashboard" ? pathname === tab.href : pathname.startsWith(tab.href);
        const count = tab.count ? (activeCounts?.[tab.count] ?? 0) : 0;
        return (
          <DashTab key={tab.href} current={active} asChild>
            <Link
              href={{
                pathname: tab.href,
                query: activeProfileId ? { profile: activeProfileId } : {},
              }}
            >
              {tab.label}
              {count > 0 ? <span className={countPill({ active })}>{count}</span> : null}
            </Link>
          </DashTab>
        );
      })}
    </DashTabs>
  );
}
