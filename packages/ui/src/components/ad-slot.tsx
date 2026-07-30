import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cn } from "../lib/cn";

/**
 * The sponsored slot on Explore (DESIGN explore.html §.adslot).
 *
 * **Deliberately not a wall tile.** It is full-width across the columns, it
 * does not tilt, and it carries no tag pill, no tabular price and no Buy label
 * — every one of those belongs to a creator's recommendation, and an ad
 * wearing them is claiming to be one. Square-shouldered against a wall of 26px
 * cards, so the difference is visible before the label is read.
 *
 * One slot per page, breaking the wall rather than sitting inside it. "Load
 * more" gives it a cadence of one per batch instead of one per scroll-depth,
 * which is how ad load quietly becomes unbounded.
 *
 * `why` is not decoration: a shopper who can't tell why they're seeing an ad
 * can't tell it from a recommendation either.
 */
export type AdSlotProps = React.ComponentProps<"a"> & {
  label?: string;
  image: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  go?: React.ReactNode;
  /** The "Why this?" control — a real disclosure, not a tooltip. */
  why?: React.ReactNode;
  asChild?: boolean;
};

export function AdSlot({
  label = "Sponsored",
  image,
  title,
  description,
  go = "Visit →",
  why,
  asChild,
  className,
  children,
  ...props
}: AdSlotProps) {
  const Comp = asChild ? Slot : "a";
  return (
    <aside
      aria-label={label}
      className="border-border bg-card rounded-tile mb-[26px] mt-1 grid gap-2.5 border p-3 min-[720px]:px-4 min-[720px]:py-3.5"
    >
      <div className="text-muted-foreground flex items-center justify-between gap-3">
        <span className="text-micro font-bold uppercase tracking-[0.06em]">{label}</span>
        {why}
      </div>
      <Comp
        className={cn("flex items-center gap-3.5 text-inherit no-underline", className)}
        {...props}
      >
        <Slottable>{children}</Slottable>
        <span className="rounded-image bg-active size-[76px] flex-none overflow-hidden min-[720px]:size-[104px]">
          {image}
        </span>
        <span className="min-w-0 flex-1">
          <b className="font-display text-label block font-bold tracking-[-0.01em]">{title}</b>
          {description ? (
            <span className="text-muted-foreground text-micro mt-[3px] block">{description}</span>
          ) : null}
        </span>
        <span className="text-muted-foreground text-label ml-auto whitespace-nowrap font-semibold">
          {go}
        </span>
      </Comp>
    </aside>
  );
}

/** The disclosure control — underlined, a real button, 44px tall. */
export function AdSlotWhy({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "text-muted-foreground hover:text-primary text-micro min-h-11 border-0 bg-transparent px-0.5 py-2 font-semibold underline underline-offset-[3px]",
        className,
      )}
      {...props}
    />
  );
}
