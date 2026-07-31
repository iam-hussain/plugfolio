import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

/** A hidden post keeps its row but loses its lift — it isn't gone, it's off. */
const postRow = cva(
  "border-border rounded-tile flex flex-wrap items-center gap-3 border py-2.5 pl-2.5 pr-3.5 hover:border-primary",
  {
    variants: {
      hidden: { true: "bg-background [&_[data-slot=post-row-link]]:opacity-55", false: "bg-card" },
    },
    defaultVariants: { hidden: false },
  },
);

/** Same rule for a closed thread: still readable, no longer raised. */
const collabRow = cva(
  "border-border rounded-tile flex flex-wrap items-center gap-3.5 border p-3.5",
  {
    variants: {
      closed: { true: "bg-background [&_[data-slot=collab-body]]:opacity-60", false: "bg-card" },
    },
    defaultVariants: { closed: false },
  },
);

/**
 * THE BACK ROOM'S ROWS (DESIGN dashboard.html §.plist2/.crow/.cat/.cols).
 *
 * A list, not a grid. The grid showed the photograph, which the creator
 * already recognises; what they came to check is whether a post is on the
 * page, which shelf it sits on, and how many products it carries. Those are
 * words, and words want rows.
 */

/* ── Posts (§5.19) ────────────────────────────────────────────────────────*/

export function PostRows({ children }: { children: React.ReactNode }) {
  return <ul className="m-0 grid list-none gap-2 p-0">{children}</ul>;
}

/**
 * One post. A hidden post is dimmed, not removed: it is still yours, still
 * listed, still editable — only its public URL is gone.
 */
export function PostRow({
  hidden,
  children,
  className,
}: {
  hidden?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cn(
        postRow({ hidden }),
        className,
      )}
    >
      {children}
    </li>
  );
}

/** Thumbnail + title + meta, the whole of it a link into the editor. */
export function PostRowLink({
  thumbnail,
  title,
  meta,
  className,
  asChild,
  children,
  ...props
}: React.ComponentProps<"a"> & {
  thumbnail: React.ReactNode;
  title: React.ReactNode;
  /** The pill row under the title: shelf, tagged count, untagged. */
  meta?: React.ReactNode;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      data-slot="post-row-link"
      className={cn(
        "flex min-w-0 flex-[1_1_280px] items-center gap-3.5 text-inherit no-underline",
        className,
      )}
      {...props}
    >
      {/* Slot clones ONE child; Slottable marks it, and the siblings become
          that child's children — so the anchor wraps the whole row. */}
      <Slottable>{children}</Slottable>
      {thumbnail}
      <span className="min-w-0">
        <b className="text-label block truncate font-bold">{title}</b>
        {meta ? <span className="mt-[5px] flex flex-wrap items-center gap-1.5">{meta}</span> : null}
      </span>
    </Comp>
  );
}

/** "3 products" with its icon — a count, in words, where a grid showed none. */
export function PostRowCount({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-muted-foreground text-micro inline-flex items-center gap-1.5 font-semibold [&_svg]:size-3 [&_svg]:text-primary">
      {children}
    </span>
  );
}

/** The right-hand cluster: the visibility switch and the edit glyph. */
export function PostRowActions({ children }: { children: React.ReactNode }) {
  return <div className="ml-auto flex flex-none items-center gap-2.5">{children}</div>;
}

/**
 * The switch's own label. "Hide from page" as a button made you read the label
 * to learn the current state; a switch plus this shows it.
 */
export function SwitchLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-faint text-micro min-w-[6ch] font-bold">{children}</span>;
}

/* ── Products (§5.21) ─────────────────────────────────────────────────────
   The library LISTS; the product page edits. Inline link, coupon and shelf
   editors lived here before the product page existed, and leaving them meant
   two screens could each claim to be where a product is changed. */

export function ProductRows({ children }: { children: React.ReactNode }) {
  return <ul className="m-0 grid list-none gap-2 p-0">{children}</ul>;
}

export function ProductRow({
  image,
  title,
  price,
  badges,
  meta,
  action,
}: {
  image: React.ReactNode;
  title: React.ReactNode;
  price?: React.ReactNode;
  /** Pills: own store, coupon code, no price. */
  badges?: React.ReactNode;
  /** "Affiliate · opens Nykaa · Skin · on 2 posts · 221 taps". */
  meta: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <li className="border-border bg-card rounded-tile flex flex-wrap items-center gap-3.5 border px-3.5 py-3">
      {image}
      <span className="min-w-0 flex-[1_1_220px]">
        <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5">
          <b className="text-label font-bold">{title}</b>
          {price ? <span className="text-label font-extrabold tabular-nums">{price}</span> : null}
          {badges}
        </span>
        <span className="text-muted-foreground text-micro mt-[5px] flex flex-wrap gap-x-1.5 gap-y-1">
          {meta}
        </span>
      </span>
      {action ? <span className="ml-auto flex flex-none">{action}</span> : null}
    </li>
  );
}

/** A separator between meta facts, so the row reads as one sentence. */
export function MetaDot() {
  return (
    <span aria-hidden className="text-faint">
      ·
    </span>
  );
}

/**
 * A fact worth noticing, not an error — a product with nothing pointing at it
 * still works, it just outlived the post it was tagged on.
 */
export function MetaWarn({ children }: { children: React.ReactNode }) {
  return <span className="text-foreground font-bold">{children}</span>;
}

/* ── Categories (§5.22) ───────────────────────────────────────────────────*/

export function CategoryRows({ children }: { children: React.ReactNode }) {
  return <ul className="m-0 grid list-none gap-2 p-0">{children}</ul>;
}

export function CategoryRow({
  handle,
  title,
  description,
  counts,
  actions,
}: {
  /** The reorder grip. */
  handle?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  counts: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <li className="border-border bg-card rounded-tile flex flex-wrap items-center gap-3 border px-3.5 py-3">
      {handle}
      <span className="min-w-0 flex-[1_1_200px]">
        <b className="text-label block font-bold">{title}</b>
        {description ? (
          <span className="text-muted-foreground text-micro mt-0.5 block">{description}</span>
        ) : null}
      </span>
      <span className="text-faint text-micro font-bold tabular-nums">{counts}</span>
      {actions}
    </li>
  );
}

/* ── Collabs ──────────────────────────────────────────────────────────────
   The list, not the thread. Payment is never shown here because it never
   happens here — it settles off-platform, and this surface says so rather
   than implying an escrow. */

export function CollabRows({ children }: { children: React.ReactNode }) {
  return <ul className="m-0 grid list-none gap-2 p-0">{children}</ul>;
}

export function CollabRow({
  avatar,
  name,
  status,
  summary,
  meta,
  action,
  closed,
}: {
  avatar?: React.ReactNode;
  name: React.ReactNode;
  /** The state pill: needs a reply / terms agreed / closed. */
  status?: React.ReactNode;
  summary: React.ReactNode;
  /** "Direct request · 2 days ago · payment settles off-platform". */
  meta: React.ReactNode;
  action?: React.ReactNode;
  closed?: boolean;
}) {
  return (
    <li
      className={collabRow({ closed })}
    >
      {avatar}
      <span data-slot="collab-body" className="min-w-0 flex-[1_1_260px]">
        <b className="text-label flex flex-wrap items-center gap-2 font-bold">
          {name}
          {status}
        </b>
        <span className="text-muted-foreground text-copy mt-1 block">{summary}</span>
        <span className="text-faint text-micro mt-1 block">{meta}</span>
      </span>
      {action}
    </li>
  );
}
