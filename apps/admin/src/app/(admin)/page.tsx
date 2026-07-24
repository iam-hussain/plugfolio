import { StatTile } from "@plugfolio/ui";
import type { Route } from "next";
import Link from "next/link";
import { Panel } from "@/components/panel";
import { clock, repositories } from "@/server/container";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

function pctDelta(current: number, prior: number): string {
  if (prior === 0) return current > 0 ? "new activity" : "no activity yet";
  const pct = Math.round(((current - prior) / prior) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}% vs prior`;
}

export default async function DashboardPage() {
  const now = clock.now().getTime();
  const [overview, recent] = await Promise.all([
    repositories.overview.overview(new Date(now - 7 * DAY_MS), new Date(now - 14 * DAY_MS)),
    repositories.audit.listRecent(5),
  ]);

  const tiles: { label: string; value: number; delta: string; href: Route }[] = [
    { label: "Members", value: overview.members, delta: `+${overview.membersNew7d} this week`, href: "/members" },
    { label: "Profiles", value: overview.profiles, delta: `+${overview.profilesNew7d} this week`, href: "/profiles" },
    { label: "Businesses", value: overview.businesses, delta: `+${overview.businessesNew7d} this week`, href: "/businesses" },
    { label: "Posts", value: overview.posts, delta: `+${overview.postsNew7d} this week`, href: "/posts" },
    { label: "Products", value: overview.products, delta: `+${overview.productsNew7d} this week`, href: "/products" },
    { label: "Taps · 7d", value: overview.taps7d, delta: pctDelta(overview.taps7d, overview.tapsPrior7d), href: "/analytics" },
    { label: "Code copies · 7d", value: overview.codeCopies7d, delta: pctDelta(overview.codeCopies7d, overview.codeCopiesPrior7d), href: "/analytics" },
    { label: "Comments · 7d", value: overview.comments7d, delta: "moderation stream", href: "/comments" },
    { label: "Open reports", value: overview.openReports, delta: "triage queue", href: "/reports" },
  ];

  return (
    <div className="max-w-[1200px]">
      <h1 className="font-display mb-1 text-2xl font-bold tracking-[-0.02em]">Dashboard</h1>
      <p className="text-muted-foreground mb-5 text-[13.5px]">
        The daily glance — what is moving, what is on fire.
      </p>
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        {tiles.map((tile) => (
          <Link key={tile.label} href={tile.href}>
            <StatTile
              interactive
              label={tile.label}
              value={tile.value.toLocaleString()}
              delta={tile.delta}
              className="h-full"
            />
          </Link>
        ))}
      </div>
      <Panel className="mt-5 px-5 py-[18px]">
        <div className="mb-1.5 flex items-center justify-between">
          <h2 className="font-display text-[15px] font-bold">Recent activity</h2>
          <Link href="/audit" className="font-mono text-primary text-[11px]">
            View audit log →
          </Link>
        </div>
        {recent.map((entry) => (
          <div key={entry.id} className="border-border flex items-center gap-3.5 border-t py-2.5">
            <span className="font-mono text-faint w-[118px] shrink-0 text-xs tabular-nums">
              {entry.createdAt.toISOString().replace("T", " ").slice(0, 16)}
            </span>
            <span className="font-mono text-primary shrink-0 text-xs">{entry.action}</span>
            <span className="text-muted-foreground truncate text-[12.5px]">
              {entry.detail ?? entry.targetId ?? ""}
            </span>
          </div>
        ))}
        {recent.length === 0 ? (
          <p className="text-faint border-border border-t py-6 text-center text-[13px]">
            Nothing yet — admin mutations land here.
          </p>
        ) : null}
      </Panel>
    </div>
  );
}
