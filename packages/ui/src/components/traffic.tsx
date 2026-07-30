import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * TRAFFIC (DESIGN dashboard.html §Traffic, styles.css §"Measured numbers").
 *
 * Called "Earnings" until it was pointed out that it earns nothing: Plugfolio
 * handles no money and sees no sale (§2.3), so the word promised a number this
 * product cannot produce. What it actually holds is measured counts — who
 * looked, and who left for a retailer.
 *
 * Every figure wears its provenance. TRACKED for a direct measurement,
 * REDEMPTION NOT TRACKED for a count we hold that is not the thing a creator
 * actually wants to know. Never a bare number.
 */

/**
 * Two counts abreast, plus what they mean together. Either alone misleads:
 * 1,284 taps sounds enormous until you see 20,410 views, and 20,410 views
 * sounds like reach until you see how few moved. So they are never shown
 * apart, and the rate between them gets equal billing — it is the only one of
 * the three a creator can act on.
 */
export function Stats({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-3 md:grid-cols-3", className)}>{children}</div>;
}

export function Stat({
  label,
  value,
  /** The provenance badge — `Tracked`, `NotTracked`, or a bare note. */
  provenance,
  children,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  provenance?: React.ReactNode;
  /** One line of what the number means. */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-border bg-background rounded-tile border px-[17px] py-[15px]", className)}>
      <span className="text-faint text-micro block font-bold uppercase tracking-[0.07em]">
        {label}
      </span>
      <b className="font-display text-name mt-1.5 mb-2 block font-extrabold leading-none tracking-[-0.035em] tabular-nums">
        {value}
      </b>
      {provenance}
      {children ? (
        <p className="text-muted-foreground text-micro mt-[9px] leading-[1.5]">{children}</p>
      ) : null}
    </div>
  );
}

/** The unit that rides inside a stat number ("6.3%") at half its size. */
export function StatUnit({ children }: { children: React.ReactNode }) {
  return <i className="text-[0.5em] not-italic tracking-normal">{children}</i>;
}

const provenanceVariants = cva(
  "text-micro rounded-pill inline-flex items-center px-[11px] py-[5px] font-bold uppercase tracking-[0.05em]",
  {
    variants: {
      kind: {
        // Lime: a real measured thing, as a fill under ink (§7).
        tracked: "bg-accent text-accent-foreground",
        // Grey: a count we hold that is not the thing you want to know.
        untracked: "bg-border text-muted-foreground",
      },
    },
    defaultVariants: { kind: "tracked" },
  },
);

export function Provenance({
  kind,
  className,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof provenanceVariants>) {
  return <span className={cn(provenanceVariants({ kind }), className)} {...props} />;
}

/** The bare note where a figure is derived rather than measured ("taps ÷ views"). */
export function StatDerivation({ children }: { children: React.ReactNode }) {
  return <span className="text-faint text-micro">{children}</span>;
}

/* ── The two ranked lists ─────────────────────────────────────────────────*/

export function TrafficColumns({ children }: { children: React.ReactNode }) {
  return <div className="mt-[18px] grid gap-3.5 lg:grid-cols-2">{children}</div>;
}

export function RankList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <ul className={cn("m-0 mt-2.5 grid list-none gap-0.5 p-0", className)}>{children}</ul>;
}

/**
 * One ranked row. Views sit beside taps in the same row, quieter — the tap is
 * what the list is ranked on, the view is its denominator.
 */
export function RankRow({
  title,
  /** The quiet second figure (views). Omitted on the code-copies list. */
  secondary,
  value,
  /** A row whose subject no longer exists reads as an absence, not a name. */
  gone,
}: {
  title: React.ReactNode;
  secondary?: React.ReactNode;
  value: React.ReactNode;
  gone?: boolean;
}) {
  return (
    <li className="rounded-image flex items-center gap-3 px-2.5 py-[9px] odd:bg-background">
      <span
        className={cn(
          "text-label min-w-0 flex-1 truncate font-semibold",
          gone && "text-faint italic",
        )}
      >
        {title}
      </span>
      {secondary !== undefined ? (
        <span className="text-faint text-micro min-w-[5ch] flex-none text-right font-semibold tabular-nums">
          {secondary}
        </span>
      ) : null}
      <span className="text-label min-w-[3.5ch] flex-none text-right font-extrabold tabular-nums">
        {value}
      </span>
    </li>
  );
}

/** "views · taps" — the key that makes two numbers on one line readable. */
export function RankKey({ children }: { children: React.ReactNode }) {
  return <span className="text-faint text-micro ml-auto">{children}</span>;
}
