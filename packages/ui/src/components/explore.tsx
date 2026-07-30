import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cn } from "../lib/cn";

/**
 * Explore (DESIGN explore.html) — the fan of creators, the wall of posts, and
 * the grid of things.
 *
 * The page's one idea: a search result and a browse are the **same page in two
 * states**, not two layouts to keep in step. The fan and the wall are the
 * result groups too; only the labelling changes.
 */

/* ── The fan ───────────────────────────────────────────────────────────────
   A rail of tilted creator cards. Scoped to creators it stops being a teaser
   and becomes the result list — a grid that wraps, no overlap, no tilt: a rail
   says "there is more sideways", a results page has to say "this is the set". */
export function CreatorFan({
  layout = "rail",
  children,
}: {
  layout?: "rail" | "grid";
  children: React.ReactNode;
}) {
  if (layout === "grid") {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-[18px] pt-[18px]">
        {children}
      </div>
    );
  }
  return (
    <div className="flex snap-x snap-proximity overflow-x-auto py-5 pb-[26px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}

export type CreatorCardProps = React.ComponentProps<"a"> & {
  cover: React.ReactNode;
  avatar: React.ReactNode;
  handle: string;
  meta: string;
  layout?: "rail" | "grid";
  asChild?: boolean;
};

/**
 * One creator in the fan. The cards overlap and tilt at rest and straighten on
 * hover — the Straighten-On-Hover rule (§7). In grid layout they sit square,
 * because a result set shouldn't look like a deck.
 */
export function CreatorCard({
  cover,
  avatar,
  handle,
  meta,
  layout = "rail",
  asChild,
  className,
  children,
  ...props
}: CreatorCardProps) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      className={cn(
        "shadow-rest border-border bg-card rounded-card block flex-none border p-2 text-inherit no-underline",
        "transition-[transform,box-shadow] duration-300 ease-design hover:z-[5] hover:-translate-y-2 hover:rotate-0 hover:shadow-lift focus-visible:z-[5] focus-visible:rotate-0",
        layout === "rail"
          ? "w-[152px] snap-center [&:nth-child(even)]:z-[2] [&:nth-child(even)]:rotate-[1.8deg] [&:nth-child(odd)]:rotate-[-2deg] -mr-3.5"
          : "w-auto",
        className,
      )}
      {...props}
    >
      <Slottable>{children}</Slottable>
      <div className="rounded-image bg-active h-[108px] w-full overflow-hidden">{cover}</div>
      <div className="flex items-center gap-2 px-1 pb-[3px] pt-2.5">
        {avatar}
        <span className="text-label truncate font-bold">{handle}</span>
      </div>
      <span className="text-faint text-micro block px-1 pb-1 font-semibold">{meta}</span>
    </Comp>
  );
}

/* ── The wall ──────────────────────────────────────────────────────────────
   A grid, not CSS columns. Columns balance their heights, so an odd count (5
   cards across 3 columns) puts one card in the first column and leaves a hole
   the size of a card underneath it. A grid places row-wise: no hole, and the
   reading order finally matches the DOM order.

   One column on a phone — at two columns the photo lands at ~135px, and a tag
   pill carrying a name and a price needs 90–140px, so every tag would overflow
   its own photograph. */
export function PostWall({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 grid grid-cols-1 items-start gap-[22px] pb-5 min-[560px]:grid-cols-2 min-[560px]:gap-[18px] min-[820px]:grid-cols-3 min-[1180px]:grid-cols-4">
      {children}
    </div>
  );
}

/** One post on the wall — the tilt is the resting personality (§7). */
export function WallPost({
  media,
  by,
  count,
  className,
}: {
  /** The photo with its `ProductTag`s pinned on. */
  media: React.ReactNode;
  /** The creator line under the photo. */
  by: React.ReactNode;
  /** "3 things" — right of the creator line. */
  count?: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "block transition-[transform,box-shadow] duration-300 ease-design",
        "hover:shadow-lift hover:-translate-y-1.5 hover:rotate-0 focus-within:-translate-y-1.5 focus-within:rotate-0",
        "[&:nth-child(4n+1)]:rotate-[-1.5deg] [&:nth-child(4n+2)]:rotate-[1.4deg] [&:nth-child(4n+3)]:rotate-[-1deg] [&:nth-child(4n+4)]:rotate-[1.8deg]",
        // A single-column card would run to the full measure and dwarf the fan.
        "max-[559px]:mx-auto max-[559px]:max-w-[420px]",
        className,
      )}
    >
      {media}
      <div className="flex items-center gap-[9px] px-1.5 pb-1 pt-3">
        {by}
        {count ? (
          <span className="text-muted-foreground text-micro ml-auto whitespace-nowrap font-bold tabular-nums">
            {count}
          </span>
        ) : null}
      </div>
    </article>
  );
}

/* ── The things grid ───────────────────────────────────────────────────────
   Things is its own view, not the posts wall relabelled: a scope control that
   doesn't scope is worse than no control. */
export function ThingsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3.5 pb-5 min-[720px]:grid-cols-3 min-[1080px]:grid-cols-4">
      {children}
    </div>
  );
}

export type ThingCardProps = React.ComponentProps<"a"> & {
  image: React.ReactNode;
  title: React.ReactNode;
  by: React.ReactNode;
  /** Absent when unknown — never a zero. */
  price?: string | null;
  /** "Code SPRING20" (lime, a real offer) or "Their own" (violet). */
  flag?: { label: string; tone: "offer" | "own" } | null;
  go?: React.ReactNode;
  asChild?: boolean;
};

export function ThingCard({
  image,
  title,
  by,
  price,
  flag,
  go = "Buy →",
  asChild,
  className,
  children,
  ...props
}: ThingCardProps) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      className={cn(
        "border-border bg-card rounded-card flex flex-col border p-2.5 pb-3.5 text-inherit no-underline",
        "transition-[transform,box-shadow] duration-[250ms] ease-design hover:-translate-y-1 hover:border-transparent hover:shadow-lift",
        className,
      )}
      {...props}
    >
      <Slottable>{children}</Slottable>
      <div className="relative">
        <div className="rounded-image bg-active aspect-square w-full overflow-hidden">{image}</div>
        {flag ? (
          <span
            className={cn(
              "text-micro absolute left-2 top-2 rounded-pill px-2.5 py-1 font-bold uppercase tracking-[0.04em]",
              // Lime still means "there is an offer here", and it prints the
              // code so a shopper knows what they're getting before the tap.
              flag.tone === "offer"
                ? "bg-accent text-accent-foreground"
                : "bg-active text-primary",
            )}
          >
            {flag.label}
          </span>
        ) : null}
      </div>
      <b className="text-label mt-3 block font-bold leading-[1.3]">{title}</b>
      <span className="text-faint text-micro mt-[3px] block">{by}</span>
      <div className="mt-auto flex items-center justify-between gap-2.5 pt-3">
        {price ? <span className="text-copy font-bold tabular-nums">{price}</span> : <span />}
        <span className="text-muted-foreground text-label font-bold">{go}</span>
      </div>
    </Comp>
  );
}

/* ── The end of the wall ───────────────────────────────────────────────────
   A list that simply stops reads as a list that broke. Two ends, and the page
   always shows exactly one of them.

   "Load more" is a real link carrying ?page=, not a JS-only button: the surface
   is server-rendered and has to work with scripting off. It also keeps the
   footer reachable, which infinite scroll does not. */
export function WallEnd({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid justify-items-center gap-2.5 pb-[clamp(30px,5vw,56px)] pt-[clamp(26px,3vw,36px)] text-center [&>a]:min-w-[220px] [&>button]:min-w-[220px]">
      {children}
    </div>
  );
}

export function WallEndNote({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground text-micro m-0 font-semibold">{children}</p>;
}
