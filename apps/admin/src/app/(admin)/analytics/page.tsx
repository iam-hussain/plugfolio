import { StatTile } from "@plugfolio/ui";
import type { Metadata } from "next";
import { MeterBar, TrendColumn } from "@/components/meter";
import { Panel } from "@/components/panel";
import { clock, repositories } from "@/server/container";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;
const TOP_LIMIT = 10;

export default async function AnalyticsPage() {
  const now = clock.now().getTime();
  const analytics = await repositories.analytics.analytics(
    new Date(now - 7 * DAY_MS),
    new Date(now - 30 * DAY_MS),
    TOP_LIMIT,
  );

  const tiles = [
    { label: "Taps · 7d", value: analytics.taps7d },
    { label: "Taps · 30d", value: analytics.taps30d },
    { label: "Code copies · 7d", value: analytics.codeCopies7d },
    { label: "Code copies · 30d", value: analytics.codeCopies30d },
  ];
  const splitTotal = analytics.sourceSplit.reduce((sum, s) => sum + s.taps, 0);
  const trendMax = Math.max(1, ...analytics.tapsPerDay.map((d) => d.taps));

  return (
    <div className="max-w-[1100px]">
      <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">Analytics</h1>
      <p className="text-muted-foreground mb-5 mt-1 text-[13.5px]">
        Projections over the append-only tap and code-copy events — the same truth Earnings reads.
      </p>

      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
        {tiles.map((tile) => (
          <StatTile key={tile.label} label={tile.label} value={tile.value.toLocaleString()} />
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel className="px-5 py-[18px]">
          <h2 className="font-display mb-2 text-[15px] font-bold">Top profiles · 30d</h2>
          {analytics.topProfiles.map((row) => (
            <div
              key={row.username}
              className="border-border flex items-center justify-between border-t py-[7px]"
            >
              <span className="font-mono text-muted-foreground text-xs">/{row.username}</span>
              <span className="text-[13.5px] font-semibold tabular-nums">
                {row.taps.toLocaleString()}
              </span>
            </div>
          ))}
          {analytics.topProfiles.length === 0 ? (
            <p className="text-faint border-border border-t py-6 text-center text-[13px]">
              No taps yet.
            </p>
          ) : null}
        </Panel>
        <Panel className="px-5 py-[18px]">
          <h2 className="font-display mb-2 text-[15px] font-bold">Top products · 30d</h2>
          {analytics.topProducts.map((row, index) => (
            <div
              key={`${row.title}-${index}`}
              className="border-border flex items-center justify-between gap-3 border-t py-[7px]"
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium">{row.title}</span>
                <span className="font-mono text-muted-foreground block text-xs">
                  /{row.username}
                </span>
              </span>
              <span className="shrink-0 text-[13.5px] font-semibold tabular-nums">
                {row.taps.toLocaleString()}
              </span>
            </div>
          ))}
          {analytics.topProducts.length === 0 ? (
            <p className="text-faint border-border border-t py-6 text-center text-[13px]">
              No taps yet.
            </p>
          ) : null}
        </Panel>
      </div>

      <Panel className="mt-4 max-w-[520px] px-5 py-[18px]">
        <h2 className="font-display mb-3 text-[15px] font-bold">Tap sources · 30d</h2>
        {analytics.sourceSplit.map((row) => {
          const pct = splitTotal === 0 ? 0 : Math.round((row.taps / splitTotal) * 100);
          return (
            <div key={row.source} className="mb-3">
              <div className="mb-[5px] flex items-center justify-between text-[13px]">
                <span className="capitalize">{row.source}</span>
                <span className="text-muted-foreground tabular-nums">
                  {row.taps.toLocaleString()} · {pct}%
                </span>
              </div>
              <MeterBar pct={pct} label={`${row.source}: ${pct}% of taps`} />
            </div>
          );
        })}
        {analytics.sourceSplit.length === 0 ? (
          <p className="text-faint py-4 text-center text-[13px]">No taps yet.</p>
        ) : null}
      </Panel>

      <Panel className="mt-4 px-5 py-[18px]">
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="font-display text-[15px] font-bold">Taps · last 30 days</h2>
          <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
            <span aria-hidden className="bg-primary size-[9px] rounded-[2px]" />
            Taps
          </span>
        </div>
        <div className="flex h-[140px] items-end gap-[3px]">
          {analytics.tapsPerDay.map((day) => (
            <TrendColumn
              key={day.day}
              pct={Math.round((day.taps / trendMax) * 100)}
              title={`${day.day}: ${day.taps.toLocaleString()} taps`}
            />
          ))}
        </div>
        <div className="font-mono text-faint mt-2 flex justify-between text-[10px]">
          <span>30d ago</span>
          <span>Today</span>
        </div>
      </Panel>
    </div>
  );
}
