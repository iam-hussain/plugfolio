import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { Clock } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

const followBadge = cva(
  "text-micro rounded-pill px-3 py-1.5 font-bold uppercase tracking-[0.04em] tabular-nums whitespace-nowrap",
  {
    variants: {
      tone: {
        new: "bg-primary text-primary-foreground",
        // The design's quiet badge is the hairline colour, not the raised
        // surface — `bg-muted` is white here, i.e. invisible on a white card.
        quiet: "bg-border text-muted-foreground",
      },
    },
    defaultVariants: { tone: "quiet" },
  },
);

/**
 * /following (DESIGN following.html) — the followed-creators list.
 *
 * The line it walks and does not cross: v1 has no aggregated feed, so nothing
 * here merges anyone's posts into a stream. What it adds is per-creator
 * metadata — "3 new since you last looked" — which is a fact about a *row*, not
 * a feed. Every route out goes to that creator's own page.
 */

/**
 * "Last looked 6 days ago" — the denominator for every count below it. Without
 * it, "4 new" is a number with nothing to measure against.
 */
export function LastLooked({ children }: { children: React.ReactNode }) {
  return (
    <p className="bg-active text-primary text-micro rounded-pill inline-flex items-center gap-2.5 px-3.5 py-2 font-bold uppercase tracking-[0.04em]">
      <Clock aria-hidden className="size-[15px] flex-none" />
      {children}
    </p>
  );
}

/** Search then sort. Filter chips were tried and cut: with the list already
 *  grouped into new and quiet, the chips restated the headings. */
export function FollowingControls({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-[clamp(20px,3vw,28px)] grid gap-3.5 min-[780px]:grid-cols-[minmax(0,1fr)_auto] min-[780px]:items-center">
      {children}
    </div>
  );
}

/** A list group — the heading does a feed's job without being one. */
export function FollowGroup({
  title,
  count,
  children,
}: {
  title: React.ReactNode;
  count: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="pt-[clamp(26px,3.5vw,38px)]">
      <div className="flex items-baseline justify-between gap-4 pb-3">
        <h2 className="font-display text-title font-bold tracking-[-0.02em]">{title}</h2>
        <p className="text-faint text-micro whitespace-nowrap font-semibold uppercase tracking-[0.06em]">
          {count}
        </p>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

/**
 * One followed creator. Rows, not cards in a grid — a follow list is scanned
 * down a column of names, and rows fill the measure without stranding half of
 * it.
 *
 * `gone` is the unfollowed state: the row **stays**, dimmed, with Undo. That's
 * what makes a confirm dialog unnecessary rather than merely skipped — you
 * can't re-follow someone you can no longer find in a list of hundreds.
 */
export function FollowRowShell({
  gone,
  children,
  className,
}: {
  gone?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-gone={gone ? "yes" : undefined}
      className={cn(
        "border-border bg-card rounded-tile hover:border-primary flex flex-wrap items-center gap-4 border px-[18px] py-3.5 transition-colors",
        "data-[gone]:bg-background data-[gone]:border-dashed",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** The creator's identity inside the row — avatar, name, handle, the meta line. */
export function FollowIdentity({
  avatar,
  name,
  handle,
  meta,
  dimmed,
  asChild,
  className,
  children,
  ...props
}: React.ComponentProps<"a"> & {
  avatar: React.ReactNode;
  name: React.ReactNode;
  /** Omitted when the name IS the handle — two identical lines is not identity. */
  handle?: React.ReactNode;
  meta: React.ReactNode;
  dimmed?: boolean;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      className={cn(
        "flex min-w-0 flex-[1_1_260px] items-center gap-3.5 no-underline transition-opacity",
        dimmed && "opacity-50",
        className,
      )}
      {...props}
    >
      {/* Slot clones ONE child; Slottable marks it and the rest become that
          element's children — so the app passes its router Link and the design
          system supplies the contents. */}
      <Slottable>{children}</Slottable>
      {avatar}
      <span className="min-w-0">
        <b className="text-label block truncate font-bold">{name}</b>
        {handle ? (
          <span className="text-muted-foreground text-copy mt-0.5 block truncate">{handle}</span>
        ) : null}
        <span className="text-faint text-micro mt-0.5 block truncate">{meta}</span>
      </span>
    </Comp>
  );
}

/**
 * The badge is the whole point of the page: it answers "who should I look at"
 * without merging anyone's posts into a stream.
 */
export function FollowBadge({
  tone = "quiet",
  children,
}: {
  tone?: "new" | "quiet";
  children: React.ReactNode;
}) {
  return <span className={followBadge({ tone })}>{children}</span>;
}
