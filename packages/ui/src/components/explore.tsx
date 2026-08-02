import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * Discovery — one card, three contents (DESIGN explore.html, redesigned).
 *
 * Explore used to carry three card languages on one page: a 152px tilted
 * creator stamp, a full-bleed colour tile for a post, and a white commerce card
 * for a product. Three widths, three aspect ratios, three ways of writing
 * "@lena" — the sections read as three different websites stacked.
 *
 * They are now **one chassis**: same width, same 4:5 photo, same byline, same
 * footer rule, on one grid that runs the length of the page. What differs is
 * only what the card is *about* — a person, a post, a thing.
 *
 * The signature survives the tidy-up rather than being thrown out with it:
 *   · **the mat** — every photo sits in a colour passe-partout, so the tile
 *     hues still carry the page's colour, assigned by POSITION and never by
 *     meaning (§7), without a saturated block dwarfing everything beside it;
 *   · **the pinned tag** — a post still wears its `ProductTag` on the
 *     photograph, but pinned at one deterministic spot instead of scattered
 *     across the frame;
 *   · **the tilt** — kept in exactly one place, the creator rail, which is
 *     read as a deck. A grid of results must not look like a deck (§7's
 *     straighten-on-hover, applied where it means something).
 */

/** The hue sequence. Assigned by position in a list, never by category. */
export const DISCOVERY_TONES = ["lavender", "sky", "butter", "mint", "blush", "coral"] as const;
export type DiscoveryTone = (typeof DISCOVERY_TONES)[number];

/** Pick the hue for the nth card — the one place the rotation is defined. */
export function discoveryTone(index: number): DiscoveryTone {
  return DISCOVERY_TONES[index % DISCOVERY_TONES.length]!;
}

/* ── The grid ──────────────────────────────────────────────────────────────
   One grid for creators, posts and things. Two up on a phone (the density a
   shopper expects from a marketplace), four up on a desktop — and because it
   is the *same* grid in all three sections, the columns line up the whole way
   down the page. That single fact does most of the work of "consistent". */
export function DiscoveryGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-[18px] grid grid-cols-2 gap-3 pb-2 min-[560px]:grid-cols-3 min-[560px]:gap-[18px] min-[900px]:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ── The rail ──────────────────────────────────────────────────────────────
   The creator deck on the "All" tab: the same cards, sideways, tilted. A rail
   says "there is more of this in that direction"; scoped to Creators it becomes
   the grid above, because a result set has to say "this is the set". */
export function DiscoveryRail({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-1 flex snap-x snap-proximity gap-3.5 overflow-x-auto px-1 pb-3 pt-[18px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}

const cardShell = cva(
  [
    "group/card border-border bg-card rounded-card ease-design relative flex flex-col border p-2 text-inherit no-underline",
    "transition-[transform,box-shadow,border-color] duration-300",
    "hover:shadow-lift hover:-translate-y-1 hover:border-transparent",
    "focus-within:shadow-lift focus-within:-translate-y-1",
  ],
  {
    variants: {
      layout: {
        grid: "w-full",
        // The one place the resting tilt lives — see the note at the top.
        rail: [
          "w-[190px] flex-none snap-start min-[560px]:w-[212px]",
          "[&:nth-child(odd)]:-rotate-[1.2deg] [&:nth-child(even)]:rotate-[1.2deg]",
          "hover:rotate-0 focus-within:rotate-0",
        ],
      },
    },
    defaultVariants: { layout: "grid" },
  },
);

/** The colour mat the photo is mounted on. */
const cardMat = cva("rounded-tile relative overflow-hidden p-2", {
  variants: {
    tone: {
      lavender: "bg-tile-lavender",
      sky: "bg-tile-sky",
      butter: "bg-tile-butter",
      mint: "bg-tile-mint",
      blush: "bg-tile-blush",
      coral: "bg-tile-coral",
    },
  },
  defaultVariants: { tone: "lavender" },
});

/**
 * The flag in the photo's top-left corner. Lime means "there is a live offer
 * here" and nothing else (§7 lime-means-offer) — it prints the code, so a
 * shopper knows what they are getting before the tap. Violet marks a creator's
 * own product.
 */
const cardFlag = cva(
  "text-pico rounded-pill absolute left-2 top-2 z-10 max-w-[calc(100%-1rem)] truncate px-2.5 py-1 font-bold uppercase tracking-[0.06em]",
  {
    variants: { tone: { offer: "bg-accent text-accent-foreground", own: "bg-card text-primary" } },
    defaultVariants: { tone: "own" },
  },
);

export type DiscoveryCardProps = {
  /** The mat hue — from `discoveryTone(index)`, never from what the card is. */
  tone?: DiscoveryTone;
  layout?: "grid" | "rail";
  /** The photograph. Absent leaves the mat showing, which is a fine card. */
  media?: React.ReactNode;
  /** "Code SPRING20" (a live offer) or "Their own". */
  flag?: { label: string; tone: "offer" | "own" } | null;
  /**
   * Tag pills pinned on the photo — real links, and the one thing allowed to
   * sit above the card's own link. Pass at most one tag plus a "+N".
   */
  pins?: React.ReactNode;
  /** The round mark left of the handle. */
  avatar?: React.ReactNode;
  /** "@lena" — who this is by, written the same way on all three card kinds. */
  handle?: React.ReactNode;
  /**
   * The card's one link: an `<a>`/`<Link>` **wrapping the title text**. It is
   * stretched over the whole card, so the accessible name is the title and the
   * hit target is the card — the pattern a marketplace card needs, without an
   * empty overlay anchor that reads as "link, link, link" to a screen reader.
   */
  title: React.ReactNode;
  /** Left of the footer rule: a price, "3 things", "18 posts". */
  stat?: React.ReactNode;
  /** Right of the footer rule: "Buy →", "Open →", "View page →". */
  action?: React.ReactNode;
  className?: string;
};

export function DiscoveryCard({
  tone,
  layout,
  media,
  flag,
  pins,
  avatar,
  handle,
  title,
  stat,
  action,
  className,
}: DiscoveryCardProps) {
  return (
    <article className={cn(cardShell({ layout }), className)}>
      <div className={cardMat({ tone })}>
        <div className="rounded-image bg-active relative aspect-[4/5] w-full overflow-hidden">
          {/* One authored moment: the photo eases in past its own frame while
              the card lifts. Slower than the lift, so it reads as depth. */}
          <div className="ease-design size-full transition-transform duration-500 group-hover/card:scale-[1.04]">
            {media}
          </div>
          {/* One row, never wrapped: a "+2" that drops onto its own line stops
              reading as part of the tag it belongs to. The tag shrinks (its
              name truncates) and the counter keeps its size. */}
          {pins ? (
            <div className="absolute inset-x-2 bottom-2 z-10 flex items-center gap-1.5 [&>:first-child]:min-w-0 [&>:first-child]:shrink [&>:last-child]:shrink-0">
              {pins}
            </div>
          ) : null}
        </div>
        {flag ? <span className={cardFlag({ tone: flag.tone })}>{flag.label}</span> : null}
      </div>

      <div className="mb-3.5 mt-3 px-1">
        {handle ? (
          <span className="text-muted-foreground text-micro flex min-w-0 items-center gap-1.5 font-semibold">
            {avatar}
            <span className="truncate">{handle}</span>
          </span>
        ) : null}
        {/* The stretched link: the anchor is the title, the target is the card.
            `after` sits below the pins' z-10, so a tag stays tappable. */}
        <h3
          className={cn(
            "text-label mt-1 line-clamp-2 font-bold leading-[1.3] tracking-[-0.01em]",
            "[&>a]:after:rounded-card [&>a]:no-underline [&>a]:after:absolute [&>a]:after:inset-0",
            "[&>a]:focus-visible:after:ring-ring [&>a]:focus-visible:outline-none [&>a]:focus-visible:after:ring-2 [&>a]:focus-visible:after:ring-offset-2",
          )}
        >
          {title}
        </h3>
      </div>

      <div className="border-border mx-1 mt-auto flex items-center justify-between gap-2 border-t pb-0.5 pt-3">
        <span className="text-copy min-w-0 truncate font-bold tabular-nums">{stat}</span>
        {action ? (
          <span className="text-muted-foreground text-label group-hover/card:text-primary whitespace-nowrap font-bold transition-colors">
            {action}
          </span>
        ) : null}
      </div>
    </article>
  );
}

/**
 * The mark beside the handle in a card byline — one size, one shape, on all
 * three card kinds. Small on purpose: it identifies, it doesn't headline.
 */
export function DiscoveryAvatar({ initial, src }: { initial: string; src?: string | null }) {
  return (
    <span className="bg-active text-primary rounded-pill text-pico grid size-5 flex-none place-items-center overflow-hidden font-bold">
      {src ? (
        // A plain <img>: this package is framework-free and never imports next/image.
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        initial
      )}
    </span>
  );
}

/**
 * The "+3 more" pill beside a pinned tag. A real link like the tag it follows —
 * it goes to the post, where the rest of them are.
 */
export function DiscoveryPinMore({
  children,
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      className={cn(
        "bg-foreground text-background shadow-tag rounded-pill text-micro inline-flex min-h-11 items-center px-3 font-bold no-underline",
        className,
      )}
      {...props}
    >
      {children}
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
