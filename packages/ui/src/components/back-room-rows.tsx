import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cn } from "../lib/cn";

/**
 * THE BACK ROOM (DESIGN styles.css §"THE BACK ROOM") — the dense-row controls:
 * the list filters, the state pill a row carries, and the icon/mini actions a
 * row repeats. Presentational (ADR-0018): every state that varies is a named
 * variant, never a string built at render time.
 */

/** The pill filter beside a list — anything interactive is a pill (§7). */
const dashFilter = cva(
  "text-micro rounded-pill inline-flex min-h-10 flex-none items-center border px-4 py-2.5 font-bold",
  {
    variants: {
      current: {
        true: "bg-foreground border-foreground text-background",
        false:
          "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
      },
    },
    defaultVariants: { current: false },
  },
);

/** The small secondary action in a card foot; danger only reddens on hover. */
const miniButton = cva(
  "border-border bg-background text-muted-foreground text-micro rounded-pill inline-flex min-h-9 items-center gap-1.5 border px-3 py-2 font-bold no-underline [&_svg]:size-3.5",
  {
    variants: {
      danger: {
        true: "hover:border-destructive hover:text-destructive",
        false: "hover:border-primary hover:text-primary",
      },
    },
    defaultVariants: { danger: false },
  },
);

/* ── Filters ──────────────────────────────────────────────────────────────*/

export function Filters({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 flex gap-2 overflow-x-auto">{children}</div>;
}

export function FilterButton({
  current,
  count,
  className,
  children,
  asChild,
  ...props
}: React.ComponentProps<"a"> & { current?: boolean; count?: React.ReactNode; asChild?: boolean }) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      aria-current={current ? "true" : undefined}
      className={cn(dashFilter({ current }), className)}
      {...props}
    >
      <Slottable>{children}</Slottable>
      {count !== undefined ? <b className="ml-1.5 font-extrabold">{count}</b> : null}
    </Comp>
  );
}

/* ── Pills ────────────────────────────────────────────────────────────────
   The small state badge a dense row carries. `untagged`, `new` and `code` are
   lime, and only those three: each marks a real live thing — work waiting, a
   reply owed, an offer running (§7 lime-means-offer). */

const pillVariants = cva(
  // v2 (ADR-0026): mono uppercase status language. Lime stays offer-only
  // (`code`); work waiting rides the page accent; "live" is the forest
  // outline; spent states sink.
  "text-pico tracking-eyebrow rounded-pill inline-flex items-center whitespace-nowrap px-[9px] py-[5px] font-mono font-bold uppercase",
  {
    variants: {
      tone: {
        shelf: "border-border-strong text-muted-foreground border",
        own: "border-border-strong text-muted-foreground border",
        agreed: "border-success text-success border",
        live: "border-success text-success border",
        code: "bg-accent text-accent-foreground",
        untagged: "bg-primary text-primary-foreground",
        new: "bg-primary text-primary-foreground",
        none: "bg-active text-faint",
        closed: "bg-active text-faint",
      },
    },
    defaultVariants: { tone: "none" },
  },
);

export function Pill({
  tone,
  className,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof pillVariants>) {
  return <span className={cn(pillVariants({ tone }), className)} {...props} />;
}

/* ── Icon actions ─────────────────────────────────────────────────────────
   A dense list repeats its verbs on every row, and spelled out they become the
   loudest thing on the page — eight "Edit product" buttons shouting over eight
   product names. As glyphs they recede to where a repeated control belongs.

   Every one carries a real label: `aria-label` for screen readers, `title` for
   a hover tooltip. An icon-only control without both is a guess. */

const iconActionVariants = cva(
  "inline-grid size-9 flex-none place-items-center rounded-pill border border-transparent p-0 transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:size-4",
  {
    variants: {
      tone: {
        default: "text-faint hover:bg-active hover:text-primary",
        danger: "text-faint hover:border-destructive hover:text-destructive",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

export type IconActionProps = React.ComponentProps<"button"> &
  VariantProps<typeof iconActionVariants> & {
    /** Required — an icon-only control has to say what it does. */
    label: string;
    asChild?: boolean;
  };

export function IconAction({ tone, label, className, asChild, ...props }: IconActionProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      type={asChild ? undefined : "button"}
      aria-label={label}
      title={label}
      className={cn(iconActionVariants({ tone }), className)}
      {...props}
    />
  );
}

export function IconActions({ children }: { children: React.ReactNode }) {
  return <span className="flex flex-none items-center gap-0.5">{children}</span>;
}

/**
 * The small secondary action in a dense row. Works as both a `<button>` and an
 * `<a>` — as a link it kept the underline and the link colour, which is why
 * "Edit product" looked like body copy that had gone wrong.
 */
export function MiniButton({
  danger,
  className,
  asChild,
  ...props
}: React.ComponentProps<"button"> & { danger?: boolean; asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      type={asChild ? undefined : "button"}
      className={cn(miniButton({ danger }), className)}
      {...props}
    />
  );
}
