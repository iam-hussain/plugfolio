import * as React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./card";
import { cn } from "../lib/cn";

/**
 * StatTile — a dashboard count tile: mono uppercase eyebrow + big tabular
 * number (Dev Spec: Space Mono eyebrows, Inter tabular nums for data).
 * Presentational and stateless; grids of these compose a dashboard.
 */
export type StatTileProps = React.ComponentProps<typeof Card> & {
  label: string;
  value: React.ReactNode;
};

export function StatTile({ label, value, className, ...props }: StatTileProps) {
  return (
    <Card className={cn(className)} {...props}>
      <CardHeader>
        <CardDescription className="font-mono tracking-eyebrow text-[11px] uppercase">
          {label}
        </CardDescription>
        <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
