import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronDown, CircleAlert, Link2Off } from "lucide-react";
import { cn } from "../lib/cn";

/**
 * THE TWO EDITORS (DESIGN post-edit.html + product-edit.html).
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
        "border-border rounded-tile overflow-hidden border bg-active",
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

/* ── The kind toggle (product-edit §5.9) ──────────────────────────────────
   Relabels the link field rather than adding a second one — a creator has
   exactly one URL in their clipboard, and asking which box it goes in is a
   question this toggle already answered. */

export function Segmented({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="border-border bg-background rounded-image flex gap-[3px] border p-[3px]"
    >
      {children}
    </div>
  );
}

export function SegmentedOption({
  selected,
  className,
  ...props
}: React.ComponentProps<"button"> & { selected?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "rounded-nest text-micro min-h-10 flex-1 border-0 bg-transparent font-bold",
        selected ? "bg-foreground text-background" : "text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

/* ── A folded block ───────────────────────────────────────────────────────
   Used by the coupon and by the product picker. Most products have no coupon
   and most visits to a post are to check it rather than add to it, so both
   stay folded — an always-open block makes the common case look unfinished. */

export function Fold({
  title,
  icon,
  open,
  onToggle,
  children,
  className,
}: {
  title: React.ReactNode;
  /** A leading glyph belonging to the label. Only the chevron gets pushed right. */
  icon?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-border rounded-image border border-dashed", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="text-label flex min-h-[46px] w-full items-center gap-2.5 border-0 bg-transparent px-3.5 py-[11px] text-left font-bold [&>svg]:size-[15px] [&>svg]:flex-none"
      >
        {icon}
        {title}
        <ChevronDown
          aria-hidden
          className={cn(
            "text-faint ml-auto transition-transform duration-200 ease-design",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? <div className="px-3.5 pb-3.5 [&>*:last-child]:mb-0">{children}</div> : null}
    </div>
  );
}

/* ── Picking a product to connect (post-edit) ─────────────────────────────
   A row you press, not a form you fill. Everything shown is a fact about the
   product itself — price, kind, how many posts already carry it — so a creator
   can tell two similar products apart before connecting one. */

export function PickList({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-2">{children}</div>;
}

export function PickRow({
  image,
  title,
  meta,
  action,
  done,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  image?: React.ReactNode;
  title: React.ReactNode;
  meta: React.ReactNode;
  /** "Connect" → "Connected". */
  action: React.ReactNode;
  done?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-image flex w-full items-center gap-3 border px-3 py-2.5 text-left",
        done ? "border-primary bg-active" : "border-border bg-background hover:border-primary",
        className,
      )}
      {...props}
    >
      {image}
      <span className="min-w-0 flex-1">
        <b className="text-label block truncate font-bold">{title}</b>
        <span className="text-muted-foreground text-micro mt-0.5 block truncate">{meta}</span>
      </span>
      <span className="text-primary text-micro flex-none font-bold">{action}</span>
    </button>
  );
}

/* ── The channel rule, stated (§5.9) ──────────────────────────────────────
   A product needs somewhere to go: a link, or a code with an in-store note, or
   both. Shown as a running sentence rather than an error after the fact — the
   rule is the same one the tagging editor enforces, because it is the same
   object. */

export function RuleLine({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <p
      role={ok ? undefined : "status"}
      className={cn(
        "rounded-image text-micro mt-3.5 flex gap-[9px] px-3.5 py-3 leading-[1.5]",
        ok ? "bg-active text-brand-violet-deep" : "bg-background text-muted-foreground",
      )}
    >
      <CircleAlert className="mt-px size-[15px] flex-none" aria-hidden />
      {children}
    </p>
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
    <span className="text-faint text-micro mb-2 block font-bold uppercase tracking-[0.07em]">
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
    <div className={cn(sticky && "min-[940px]:sticky min-[940px]:top-32")}>
      <PreviewLabel>What a shopper sees</PreviewLabel>
      <div className="border-border bg-card rounded-tile border p-3.5">
        {image}
        <p className="text-label mt-3 font-bold">{title}</p>
        {price ? (
          <p className="font-display text-title mt-1.5 font-extrabold tracking-[-0.02em] tabular-nums">
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
      {image}
      <b className="text-label min-w-0 flex-1 truncate font-semibold">{title}</b>
      {count ? <span className="text-faint text-micro font-bold">{count}</span> : null}
    </Comp>
  );
}
