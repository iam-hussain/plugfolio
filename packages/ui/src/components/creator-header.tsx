import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * The creator page header (v2, ADR-0026 / docs/design/v2-visual-system.md) —
 * the square-cornered avatar pulled up over the cover, the Sora name with the
 * mono accent greeting under it, bio, the `@handle · location` mono line, the
 * links row, and the three counts over a hairline.
 *
 * The cover is a SEPARATE export: `band` and `split` run edge to edge above
 * the measure, `tile` sits inside it, `none` is a 6px accent strip. Both
 * components read the same `style`/`cover` so the pull-up always agrees with
 * the cover's height.
 *
 * Three header treatments, the creator's choice (ADR-0017, amended by
 * ADR-0026): compact gets to the goods fastest (dense row, counts as one mono
 * line), balanced stacks identity then counts, centred is the big-avatar
 * profile read. Knows shapes, not sources (ADR-0018): every value arrives as
 * a prop; interactive bits arrive as slots.
 */
export type CreatorHeaderStyle = "compact" | "balanced" | "centred";
export type CreatorCoverTreatment = "band" | "tile" | "split" | "none";

/** The design's default cover for each header treatment. */
export function defaultCoverTreatment(style: CreatorHeaderStyle): CreatorCoverTreatment {
  return style === "compact" ? "none" : "tile";
}

export type CreatorHeaderProps = {
  handle: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  /** One line under the name, set as the mono accent eyebrow. */
  greeting?: string | null;
  /** "Bengaluru, IN" — rides the mono line beside the handle. */
  location?: string | null;
  /** Pre-formatted — the UI package doesn't own number formatting. */
  followers: string;
  /** The three counts row; `followers` alone renders when absent. */
  counts?: { posts: string; things: string };
  style?: CreatorHeaderStyle;
  /** Which cover this header pulls up over (defaults per `style`). */
  cover?: CreatorCoverTreatment;
  /** The links row (label pills or icon circles). */
  socials?: React.ReactNode;
  /** The accent "Share · QR" pill. */
  share?: React.ReactNode;
  /** Follow for visitors, owner tools for the creator. */
  action?: React.ReactNode;
  /** Rendered under the header: the viewer bands. */
  children?: React.ReactNode;
  className?: string;
};

const coverShell = cva("relative overflow-hidden", {
  variants: {
    treatment: {
      band: "h-[164px] sm:h-[236px]",
      tile: "rounded-drawer border-border h-[150px] border sm:h-[210px]",
      split: "grid h-[188px] grid-cols-2 sm:h-[230px] lg:grid-cols-[1fr_1.25fr]",
      none: "bg-primary h-1.5",
    },
    /** Centred headers get a taller band. */
    tall: { true: "", false: "" },
  },
  compoundVariants: [{ treatment: "band", tall: true, className: "h-[196px] sm:h-[290px]" }],
  defaultVariants: { treatment: "tile", tall: false },
});

export function CreatorCover({
  treatment = "tile",
  tall = false,
  url,
  badge,
  greeting,
  className,
  children,
}: {
  treatment?: CreatorCoverTreatment;
  /** Centred headers pull a taller band. */
  tall?: boolean;
  url?: string | null;
  /** The white "126 things live" pill, tile treatment only. */
  badge?: string | null;
  /** The split treatment's accent panel line. */
  greeting?: string | null;
  className?: string;
  /** An optimised `<Image>` when the app has one; `url` is the plain path. */
  children?: React.ReactNode;
}) {
  const art =
    children ??
    (url ? (
      // A plain <img>: the UI package is framework-free and never imports
      // next/image. Apps pass an optimised <Image> as `children` when needed.
      <img src={url} alt="" className="size-full object-cover" />
    ) : (
      <span aria-hidden className="from-primary/25 to-primary/5 block size-full bg-gradient-to-b" />
    ));

  if (treatment === "none") {
    return <div aria-hidden className={cn(coverShell({ treatment }), className)} />;
  }

  if (treatment === "split") {
    return (
      <div className={cn(coverShell({ treatment, tall }), className)}>
        <div className="bg-primary text-primary-foreground flex flex-col justify-end p-4 sm:p-6">
          <p className="tracking-eyebrow text-pico font-mono font-bold uppercase opacity-75">
            Shop window
          </p>
          {greeting ? (
            <p className="font-display text-title mt-2 font-bold leading-tight tracking-[-0.04em]">
              {greeting}
            </p>
          ) : null}
        </div>
        <div className="overflow-hidden">{art}</div>
      </div>
    );
  }

  return (
    <div className={cn(coverShell({ treatment, tall }), className)}>
      {art}
      {treatment === "band" ? (
        <span aria-hidden className="bg-primary absolute inset-x-0 bottom-0 h-1" />
      ) : null}
      {treatment === "tile" && badge ? (
        <span className="text-pico tracking-eyebrow rounded-pill absolute right-3 top-3 bg-white/95 px-2.5 py-1.5 font-mono font-bold uppercase text-[hsl(var(--brand-ink))]">
          {badge}
        </span>
      ) : null}
    </div>
  );
}

/* The identity row pulls up over the cover; how far depends on which cover it
   is over (v2: tile -34/-46 · band -46/-58 · split/none pad down instead). */
const identity = cva("relative z-[1] flex", {
  variants: {
    style: {
      compact: "flex-row items-center gap-3.5",
      balanced: "flex-col items-start gap-3.5",
      centred: "flex-col items-center gap-3.5 text-center",
    },
    cover: { band: "", tile: "", split: "pt-[18px]", none: "pt-5" },
  },
  compoundVariants: [
    { style: "balanced", cover: "band", className: "-mt-[46px]" },
    { style: "centred", cover: "band", className: "-mt-[58px]" },
    { style: "balanced", cover: "tile", className: "-mt-[34px]" },
    { style: "centred", cover: "tile", className: "-mt-[46px]" },
  ],
  defaultVariants: { style: "balanced", cover: "tile" },
});

const portrait = cva("bg-border-strong relative shrink-0 overflow-hidden rounded-card", {
  variants: {
    style: {
      compact: "border-border-strong size-14 border",
      balanced:
        "size-[84px] shadow-[0_0_0_5px_hsl(var(--surface)),0_14px_30px_-14px_hsl(var(--brand-ink)/0.32)] sm:size-[92px]",
      centred:
        "size-[104px] shadow-[0_0_0_5px_hsl(var(--surface)),0_14px_30px_-14px_hsl(var(--brand-ink)/0.32)] sm:size-[120px]",
    },
  },
});

const name = cva("font-display font-bold leading-[1.1] tracking-[-0.04em]", {
  variants: {
    style: { compact: "text-title", balanced: "text-name-md", centred: "text-name-lg" },
  },
});

export function CreatorHeader({
  handle,
  displayName,
  avatarUrl,
  bio,
  greeting,
  location,
  followers,
  counts,
  style = "balanced",
  cover,
  socials,
  share,
  action,
  children,
  className,
}: CreatorHeaderProps) {
  const displayed = displayName ?? handle;
  const centred = style === "centred";
  const coverTreatment = cover ?? defaultCoverTreatment(style);

  return (
    <header className={cn("relative pb-5", centred && "text-center", className)}>
      <div className={identity({ style, cover: coverTreatment })}>
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

        <div className={cn("min-w-0", centred && "flex w-full flex-col items-center")}>
          <h1 className={name({ style })}>{displayed}</h1>
          {greeting ? (
            <p className="text-primary text-pico tracking-eyebrow mt-[7px] font-mono uppercase">
              {greeting}
            </p>
          ) : null}
        </div>

        {action ? (
          <div className={cn("flex items-center gap-2", style === "compact" && "ml-auto")}>
            {action}
          </div>
        ) : null}
      </div>

      {bio ? (
        <p
          className={cn(
            "text-muted-foreground text-copy mt-3.5 max-w-[52ch] text-pretty",
            style === "compact" && "mt-3 line-clamp-1",
            centred && "mx-auto",
          )}
        >
          {bio}
        </p>
      ) : null}
      <p className="text-faint text-nano mt-2 font-mono tracking-[0.06em]">
        @{handle}
        {location ? <> &nbsp;·&nbsp; {location}</> : null}
      </p>

      {socials || share ? (
        <div
          className={cn(
            "mt-3.5 flex flex-wrap items-center gap-[7px]",
            centred && "justify-center",
          )}
        >
          {socials}
          {share}
        </div>
      ) : null}

      {/* Counts: compact collapses to one mono line; the others get the row. */}
      {style === "compact" ? (
        <p className="border-border text-muted-foreground text-nano mt-3.5 border-t pt-3.5 font-mono tracking-[0.08em]">
          {counts
            ? `${counts.posts} posts · ${counts.things} things · ${followers} followers`
            : `${followers} followers`}
        </p>
      ) : (
        <dl
          className={cn(
            "border-border mt-[18px] flex gap-[26px] border-t pt-4",
            centred && "justify-center",
          )}
        >
          {[
            ...(counts
              ? [
                  { label: "Posts", value: counts.posts },
                  { label: "Things", value: counts.things },
                ]
              : []),
            { label: "Followers", value: followers },
          ].map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-display text-body font-bold tabular-nums tracking-[-0.03em]">
                {stat.value}
              </dd>
              <dd className="text-faint text-pico tracking-eyebrow mt-0.5 font-mono uppercase">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {children}
    </header>
  );
}
