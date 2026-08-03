"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis } from "recharts";

/** One bar pair. Structurally identical to core's TrafficBucket — declared
    here because the UI package knows shapes, never sources (ADR-0018). */
export type TrafficChartBucket = {
  readonly label: string;
  readonly views: number;
  readonly taps: number;
};

/**
 * The views-vs-taps chart (v2, `Plugfolio v2.dc.html` §Traffic): one bar pair
 * per bucket — views in the quiet hairline tone, taps in the page accent.
 * Client-only because recharts is; everything around it stays on the server.
 * Colors ride CSS vars so both themes and the page accent flow through.
 */
export function TrafficChart({ series }: { series: readonly TrafficChartBucket[] }) {
  return (
    <div className="h-[150px] w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={[...series]} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} barGap={2}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            tick={{ fontSize: 10, fill: "hsl(var(--text-faint))", fontFamily: "var(--font-mono)" }}
          />
          <Bar dataKey="views" fill="hsl(var(--border-strong))" radius={[5, 5, 0, 0]} />
          <Bar dataKey="taps" fill="hsl(var(--color-primary))" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
