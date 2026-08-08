import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { Link2Off } from "lucide-react";
import { cn } from "../lib/cn";

/**
 * THE TWO EDITORS (DESIGN post-edit.html + product-edit.html) — layout.
 *
 * A post and a product each get their own page, and for the same reason:
 * neither is owned by the screen it used to be edited from. A product can sit
 * on several posts or on none; a tagging session is the longest single task a
 * creator does and needs a URL you can send to a Manager.
 *
 * CREATE and EDIT are the same screen. What differs is what exists yet — and
 * the things that don't exist are **absent, not disabled**: a disabled control
 * on a brand-new post is a promise about a state you have not reached.
 */

/** Two columns on a wide screen: the thing on the left, the work on the right. */
export function EditorGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid items-start gap-[18px] min-[940px]:grid-cols-[minmax(0,42%)_minmax(0,1fr)] min-[940px]:gap-[26px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** The post's media, framed. */
export function EditorMedia({ children, dimmed }: { children: React.ReactNode; dimmed?: boolean }) {
  return (
    <div
      className={cn(
        "border-border rounded-tile bg-active overflow-hidden border",
        dimmed && "opacity-55",
      )}
    >
      {children}
    </div>
  );
}

/**
 * Hidden is a state of the whole screen, not a badge in a corner: it changes
 * what a visitor sees, so the editor says so plainly, in ink.
 */
export function HiddenBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-foreground text-background rounded-tile text-copy mb-3.5 flex items-center gap-2.5 px-4 py-[13px]">
      <Link2Off className="size-[17px] flex-none" aria-hidden />
      {children}
    </div>
  );
}

/**
 * The row a card ends on: one primary action, and the destructive one pushed
 * to the far edge wearing no fill at all. A red button sitting level with Save
 * is an invitation to mis-click.
 */
export function CardFoot({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border mt-[18px] flex flex-wrap items-center gap-2.5 border-t pt-4 [&>[data-slot=card-foot-danger]]:ml-auto">
      {children}
    </div>
  );
}

/* ── What a shopper sees (product-edit) ───────────────────────────────────
   The preview is the point of the left column. Every field on the right
   changes one line of it, and a creator editing a coupon should be able to see
   the chip appear rather than imagine it. */

export function PreviewLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-faint text-pico tracking-eyebrow mb-2.5 block font-mono font-bold uppercase">
      {children}
    </span>
  );
}

export function PreviewCard({
  image,
  title,
  price,
  where,
  marks,
  sticky = true,
}: {
  image: React.ReactNode;
  title: React.ReactNode;
  price?: React.ReactNode;
  /** "Affiliate pick · opens Nykaa". */
  where?: React.ReactNode;
  marks?: React.ReactNode;
  sticky?: boolean;
}) {
  return (
    // v2: the preview rides in a sunk panel, so it reads as a window onto the
    // public page rather than as another form card.
    <div
      className={cn(
        "bg-active border-border-strong rounded-sheet border p-3.5",
        sticky && "min-[940px]:sticky min-[940px]:top-32",
      )}
    >
      <PreviewLabel>What a shopper will see</PreviewLabel>
      <div className="border-border bg-card rounded-lg border p-3.5">
        {image}
        <p className="text-label mt-3 font-bold">{title}</p>
        {price ? (
          <p className="font-display text-title mt-1.5 font-extrabold tabular-nums tracking-[-0.02em]">
            {price}
          </p>
        ) : null}
        {where ? <p className="text-muted-foreground text-micro mt-1">{where}</p> : null}
        {marks ? <span className="mt-2.5 flex flex-wrap gap-1.5">{marks}</span> : null}
      </div>
    </div>
  );
}

/** The placeholder where a new product's image will be, once it's fetched. */
export function PreviewNoImage({ children }: { children: React.ReactNode }) {
  return (
    <span className="border-border bg-background text-faint rounded-image text-micro grid aspect-square w-full place-items-center border border-dashed p-5 text-center">
      {children}
    </span>
  );
}

/* ── Where a product is used ──────────────────────────────────────────────
   A consequence of the product, never a container for it — the same product
   can sit on five posts or on none. */

export function UsesList({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-2">{children}</div>;
}

export function UseRow({
  image,
  title,
  count,
  className,
  asChild,
  children,
  ...props
}: React.ComponentProps<"a"> & {
  image?: React.ReactNode;
  title: React.ReactNode;
  count?: React.ReactNode;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      className={cn(
        "border-border bg-background rounded-image hover:border-primary flex items-center gap-3 border px-3 py-2.5 text-inherit no-underline",
        className,
      )}
      {...props}
    >
      {/* Slot clones ONE child; Slottable marks it, and the siblings become
          that child's children — so the anchor wraps the whole row. */}
      <Slottable>{children}</Slottable>
      {image}
      <b className="text-label min-w-0 flex-1 truncate font-semibold">{title}</b>
      {count ? <span className="text-faint text-micro font-bold">{count}</span> : null}
    </Comp>
  );
}
