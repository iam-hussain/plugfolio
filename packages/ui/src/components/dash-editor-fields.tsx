import * as React from "react";
import { ChevronDown, CircleAlert } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * THE TWO EDITORS (DESIGN post-edit.html + product-edit.html) — fields.
 *
 * The interactive controls a creator drives while editing a post or a product:
 * the kind toggle, the folded coupon/picker blocks, the product picker rows and
 * the channel rule. All presentational (ADR-0018) — data in, interaction out.
 */

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

const segmentedOption = cva(
  "rounded-nest text-micro min-h-10 flex-1 border-0 bg-transparent font-bold",
  {
    variants: {
      selected: {
        true: "bg-foreground text-background",
        false: "text-muted-foreground",
      },
    },
    defaultVariants: { selected: false },
  },
);

export function SegmentedOption({
  selected,
  className,
  ...props
}: React.ComponentProps<"button"> & { selected?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(segmentedOption({ selected }), className)}
      {...props}
    />
  );
}

/** A connectable channel row — plain, then held once it's connected. */
const connectRow = cva(
  "rounded-image flex w-full items-center gap-3 border px-3 py-2.5 text-left",
  {
    variants: {
      done: {
        true: "border-primary bg-active",
        false: "border-border bg-background hover:border-primary",
      },
    },
    defaultVariants: { done: false },
  },
);

/** The channel rule (§5.9): unmet reads as quiet copy, met reads as held. */
const ruleLine = cva("rounded-image text-micro mt-3.5 flex gap-[9px] px-3.5 py-3 leading-[1.5]", {
  variants: {
    ok: {
      true: "bg-active text-brand-violet-deep",
      false: "bg-background text-muted-foreground",
    },
  },
  defaultVariants: { ok: false },
});

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
            "text-faint ease-design ml-auto transition-transform duration-200",
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
    <button type="button" className={cn(connectRow({ done }), className)} {...props}>
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
    <p role={ok ? undefined : "status"} className={ruleLine({ ok })}>
      <CircleAlert className="mt-px size-[15px] flex-none" aria-hidden />
      {children}
    </p>
  );
}
