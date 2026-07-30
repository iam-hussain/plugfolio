import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * The creator page header (DESIGN creator.html §.ch) — cover band, the big
 * round avatar overlapping it, name, `@handle · N followers`, bio, then the
 * socials row and the two named share ways.
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
  coverUrl?: string | null;
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
   band, not a picture, and it never earns more than it costs in scroll. */
const cover = cva("bg-active relative overflow-hidden", {
  variants: {
    style: {
      compact: "h-[104px] sm:h-[120px]",
      balanced: "h-[112px] sm:h-[168px]",
      centred: "h-[112px] sm:h-[168px]",
    },
  },
});

/* The identity block pulls up over the cover, so the avatar overlaps it. */
const identity = cva("relative z-[1] flex gap-4 px-1 pb-5", {
  variants: {
    style: {
      compact: "-mt-6 flex-wrap items-start sm:-mt-8",
      balanced: "-mt-[34px] flex-wrap items-start sm:-mt-11",
      centred: "-mt-[44px] flex-col items-center text-center sm:-mt-14",
    },
  },
});

const portrait = cva(
  "ring-background bg-active relative shrink-0 overflow-hidden rounded-pill ring-[3px] sm:ring-4",
  {
    variants: {
      style: {
        compact: "size-[52px] sm:size-16",
        balanced: "size-[68px] sm:size-[88px]",
        centred: "size-[88px] sm:size-[112px]",
      },
    },
  },
);

/* The identity column clears the avatar's overlap, so the name sits on the
   canvas rather than on the cover. */
const column = cva("min-w-0", {
  variants: {
    style: {
      compact: "flex-1 basis-[240px] pt-[26px] sm:pt-8",
      balanced: "flex-1 basis-[240px] pt-[38px] sm:pt-12",
      centred: "flex w-full flex-col items-center pt-3",
    },
  },
});

const actions = cva("flex flex-none gap-2.5 max-sm:w-full max-sm:basis-full", {
  variants: {
    style: {
      // On a phone the actions take their own row: they never shrink, so
      // beside the name they eat the identity column to one word per line.
      compact: "items-start pt-8 max-sm:flex-col max-sm:pt-3.5",
      balanced: "ml-auto items-start pt-12 max-sm:ml-0 max-sm:flex-col max-sm:pt-3.5",
      centred: "w-full items-center justify-center pt-4",
    },
  },
});

export function CreatorHeader({
  handle,
  displayName,
  avatarUrl,
  coverUrl,
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
  const name = displayName ?? handle;
  const centred = style === "centred";

  return (
    <header className={className}>
      <div className={cover({ style })}>
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- the UI package is framework-free; apps pass an optimised <Image> as `children` when they need one
          <img src={coverUrl} alt="" className="size-full object-cover" />
        ) : null}
        {/* Canvas fades up, so the header never sits on unpredictable pixels. */}
        <span
          aria-hidden
          className="from-brand-ink/10 to-background absolute inset-0 bg-gradient-to-b via-transparent"
        />
      </div>

      <div className={identity({ style })}>
        <span className={portrait({ style })}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- see above
            <img src={avatarUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-primary font-display flex size-full items-center justify-center text-name font-extrabold">
              {name.trim().charAt(0).toUpperCase()}
            </span>
          )}
        </span>

        <div className={column({ style })}>
          {greeting ? <p className="text-primary text-label font-bold">{greeting}</p> : null}
          <h1 className="font-display text-name font-extrabold tracking-[-0.03em]">{name}</h1>
          <div
            className={cn(
              "mt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-1",
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
          {bio ? (
            <p
              className={cn(
                "text-muted-foreground text-copy mt-3 max-w-[58ch]",
                centred && "mx-auto",
              )}
            >
              {bio}
            </p>
          ) : null}
          {socials ? <div className={cn("mt-3.5", centred && "flex justify-center")}>{socials}</div> : null}
          {share ? <div className={cn("mt-3.5", centred && "flex justify-center")}>{share}</div> : null}
        </div>

        {action ? <div className={actions({ style })}>{action}</div> : null}
      </div>
      {children}
    </header>
  );
}
