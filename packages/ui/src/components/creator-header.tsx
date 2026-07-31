import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * The creator page header (DESIGN creator.html §.ch) — the big round avatar
 * overlapping the cover band, name, `@handle · N followers`, bio, then the
 * socials row and the two named share ways.
 *
 * The cover is a SEPARATE export, and deliberately so: in the design it is a
 * direct child of `<main>` and runs edge to edge, while everything under it
 * lives inside the 1200px measure. Rendering it here put it inside the page's
 * padded container, where it read as a card behind the avatar rather than as
 * the band the page opens with. `CreatorCover` goes above the container;
 * `CreatorHeader` goes in it and pulls up over it.
 *
 * Three treatments, the creator's choice (ADR-0017). None of them drops
 * anything — they change how much room identity gets before the goods.
 *
 * Knows shapes, not sources (ADR-0018): every value arrives as a prop, and the
 * interactive bits (Follow, Share, QR) arrive as slots so this stays a Server
 * Component wherever it's used.
 */
export type CreatorHeaderStyle = "compact" | "balanced" | "centred";

export type CreatorHeaderProps = {
  handle: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  /** One line above the name ("Hey — glad you found me."). */
  greeting?: string | null;
  /** Pre-formatted — the UI package doesn't own number formatting. */
  followers: string;
  style?: CreatorHeaderStyle;
  /** The socials row (icon-only circular links). */
  socials?: React.ReactNode;
  /** The share ways — Link and QR, each saying what it does. */
  share?: React.ReactNode;
  /** Follow for visitors, owner tools for the creator. */
  action?: React.ReactNode;
  /** Rendered under the header: the owner band, the business strip. */
  children?: React.ReactNode;
  className?: string;
};

/* The cover is shallower on a phone and in the compact treatment — it is a
   band, not a picture, and it never earns more than it costs in scroll.

   It carries the CREATOR'S accent. It was one flat wash for everybody, and
   pale enough on a white canvas that the page read as opening on nothing.
   Tinting it with their accent makes the first thing on the page theirs and
   costs no new decision — they already picked the accent (ADR-0017). */
const cover = cva("from-primary/15 to-background relative overflow-hidden bg-gradient-to-b", {
  variants: {
    style: {
      compact: "h-[96px] sm:h-[112px]",
      balanced: "h-[120px] sm:h-[168px]",
      centred: "h-[150px] sm:h-[220px]",
    },
  },
  defaultVariants: { style: "balanced" },
});

/**
 * The band the creator page opens with — edge to edge, outside the measure.
 * Its height has to agree with `CreatorHeader`'s upward pull, which is why
 * both read the same `style`.
 */
export function CreatorCover({
  style = "balanced",
  url,
  className,
  children,
}: {
  style?: CreatorHeaderStyle;
  url?: string | null;
  className?: string;
  /** An optimised `<Image>` when the app has one; `url` is the plain path. */
  children?: React.ReactNode;
}) {
  const art =
    children ??
    (url ? (
      // A plain <img>: the UI package is framework-free and never imports next/image. Apps pass an optimised <Image> as `children` when they need one.
      <img src={url} alt="" className="size-full object-cover" />
    ) : null);

  return (
    <div className={cn(cover({ style }), className)}>
      {art}
      {/* Only over a picture. The accent band already ends in the canvas, so
          a second fade on top of it just greys the creator's colour out. */}
      {art ? (
        <span
          aria-hidden
          className="from-brand-ink/10 to-background absolute inset-0 bg-gradient-to-b via-transparent"
        />
      ) : null}
    </div>
  );
}

/**
 * The identity row: the avatar and who they are, CENTRED ON EACH OTHER.
 *
 * The name column used to be pushed 48px down so it cleared the avatar's
 * overlap and never sat on the cover. That worked, and it left the avatar's
 * whole top half staring at empty canvas — a hole big enough that the header
 * read as badly assembled rather than as deliberate. Centring closes it, and
 * the overlap shrinks from half the avatar to about a third so the words
 * still land on canvas rather than on the band.
 */
const identity = cva("relative z-[1] flex gap-4 px-1", {
  variants: {
    style: {
      compact: "-mt-[18px] flex-wrap items-center sm:-mt-[22px]",
      balanced: "-mt-6 flex-wrap items-center sm:-mt-8",
      centred: "-mt-11 flex-col items-center gap-[18px] text-center sm:-mt-[60px]",
    },
  },
});

const portrait = cva(
  "ring-background bg-active relative shrink-0 overflow-hidden rounded-pill ring-[3px] sm:ring-4",
  {
    variants: {
      style: {
        compact: "size-12 sm:size-[58px]",
        balanced: "size-[68px] sm:size-[88px]",
        centred: "size-[96px] sm:size-[128px]",
      },
    },
  },
);

const column = cva("min-w-0", {
  variants: {
    style: {
      compact: "flex-1 basis-[200px]",
      balanced: "flex-1 basis-[240px]",
      centred: "flex w-full flex-col items-center",
    },
  },
});

const actions = cva("flex flex-none items-center gap-2.5 max-sm:w-full max-sm:basis-full", {
  variants: {
    style: {
      // On a phone the actions take their own row: they never shrink, so
      // beside the name they eat the identity column to one word per line.
      compact: "ml-auto max-sm:ml-0 max-sm:mt-3.5 max-sm:flex-col",
      balanced: "ml-auto max-sm:ml-0 max-sm:mt-3.5 max-sm:flex-col",
      centred: "w-full justify-center",
    },
  },
});

/**
 * Bio, socials and share start at the AVATAR'S edge, not indented under the
 * name. All three are wider than that column, so the indent bought nothing
 * and left a gutter with nothing in it running down the whole header.
 */
const rest = cva("px-1", {
  variants: {
    style: {
      compact: "pt-2.5",
      balanced: "pt-3.5",
      centred: "flex flex-col items-center pt-3.5 text-center",
    },
  },
});

const name = cva("font-display font-extrabold tracking-[-0.03em]", {
  variants: {
    style: { compact: "text-title", balanced: "text-name", centred: "text-name-lg" },
  },
});

export function CreatorHeader({
  handle,
  displayName,
  avatarUrl,
  bio,
  greeting,
  followers,
  style = "balanced",
  socials,
  share,
  action,
  children,
  className,
}: CreatorHeaderProps) {
  const displayed = displayName ?? handle;
  const centred = style === "centred";
  const hasRest = bio || socials || share;

  return (
    <header className={cn("pb-5", className)}>
      <div className={identity({ style })}>
        <span className={portrait({ style })}>
          {avatarUrl ? (
            // A plain <img> — see above.
            <img src={avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-primary font-display text-name flex size-full items-center justify-center font-extrabold">
              {displayed.trim().charAt(0).toUpperCase()}
            </span>
          )}
        </span>

        <div className={column({ style })}>
          {greeting ? <p className="text-primary text-label font-bold">{greeting}</p> : null}
          <h1 className={name({ style })}>{displayed}</h1>
          <div
            className={cn(
              "mt-[3px] flex flex-wrap items-baseline gap-x-2.5 gap-y-1",
              centred && "justify-center",
            )}
          >
            <span className="text-muted-foreground text-label font-semibold">@{handle}</span>
            <span className="text-faint" aria-hidden>
              ·
            </span>
            <span className="text-label font-bold tabular-nums">
              {followers} <span className="text-muted-foreground font-medium">followers</span>
            </span>
          </div>
        </div>

        {action ? <div className={actions({ style })}>{action}</div> : null}
      </div>

      {hasRest ? (
        <div className={rest({ style })}>
          {bio ? <p className="text-muted-foreground text-copy max-w-[58ch]">{bio}</p> : null}
          {socials ? <div className={cn(bio && "mt-3")}>{socials}</div> : null}
          {share ? <div className={cn((bio || socials) && "mt-3")}>{share}</div> : null}
        </div>
      ) : null}
      {children}
    </header>
  );
}
