import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * StatTile — the Admin-design count tile: mono eyebrow, Sora tabular number,
 * optional delta line. White panel (page surface) with the 14px panel radius;
 * `interactive` adds the hover raise for tiles that link somewhere.
 */
const statTileVariants = cva(
  "bg-background border-border rounded-panel block border px-[18px] py-4 text-left",
  {
    variants: {
      interactive: {
        true: "hover:shadow-raise cursor-pointer transition-[transform,box-shadow] hover:-translate-y-0.5",
        false: "",
      },
    },
    defaultVariants: { interactive: false },
  },
);

export type StatTileProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof statTileVariants> & {
    label: string;
    value: React.ReactNode;
    /** Optional context line under the number ("+36 this week"). */
    delta?: string;
  };

export function StatTile({ label, value, delta, interactive, className, ...props }: StatTileProps) {
  return (
    <div className={cn(statTileVariants({ interactive }), className)} {...props}>
      <p className="font-mono text-faint text-[10px] font-bold uppercase tracking-[0.1em]">
        {label}
      </p>
      <p className="font-display mt-2 text-[28px] font-bold leading-none tracking-[-0.02em] tabular-nums">
        {value}
      </p>
      {delta ? <p className="text-muted-foreground mt-1.5 text-xs">{delta}</p> : null}
    </div>
  );
}
