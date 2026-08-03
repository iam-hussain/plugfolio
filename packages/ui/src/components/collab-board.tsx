import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@plugfolio/ui/lib/cn";

/**
 * The business home's furniture (briefs 11–12, §5.24).
 *
 * v1 HANDLES NO MONEY, and this surface is where that is easiest to imply
 * by accident. Budget is free text and is never validated as currency — a
 * brand in Mumbai and a brand in Ohio type what they mean — so it renders
 * as a plain fact, not as a formatted amount. Nothing here suggests an
 * escrow, a total, or a payment step, because none exists.
 */

/* ── A posted requirement ─────────────────────────────────── */

/**
 * Closed is a state, not a deletion. A closed brief leaves the open board
 * and can no longer be approached, but the threads it already produced
 * carry on — so it goes quiet rather than disappearing, and the row still
 * says what it was.
 */
const requirementVariants = cva("rounded-tile border p-4", {
  variants: {
    state: {
      open: "border-border bg-card",
      closed: "border-border bg-background",
    },
  },
  defaultVariants: { state: "open" },
});

export type RequirementCardProps = React.ComponentProps<"article"> &
  VariantProps<typeof requirementVariants>;

export function RequirementCard({ className, state, ...props }: RequirementCardProps) {
  return (
    <article
      data-slot="requirement-card"
      data-state={state ?? "open"}
      className={cn(requirementVariants({ state }), className)}
      {...props}
    />
  );
}

export function RequirementHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="requirement-header"
      className={cn("flex flex-wrap items-center gap-2.5", className)}
      {...props}
    />
  );
}

const requirementTitleVariants = cva("min-w-0 flex-1 text-label font-bold", {
  variants: {
    state: { open: "text-foreground", closed: "text-muted-foreground" },
  },
  defaultVariants: { state: "open" },
});

export type RequirementTitleProps = React.ComponentProps<"h3"> &
  VariantProps<typeof requirementTitleVariants>;

export function RequirementTitle({ className, state, children, ...props }: RequirementTitleProps) {
  return (
    <h3
      data-slot="requirement-title"
      className={cn(requirementTitleVariants({ state }), className)}
      {...props}
    >
      {children}
    </h3>
  );
}

/** Budget · deadline · approach count. Facts about the brief, in one row. */
export function RequirementMeta({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="requirement-meta"
      className={cn(
        "text-muted-foreground text-micro flex flex-wrap gap-x-3.5 gap-y-1.5 pt-2.5",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The approach count.
 *
 * `none` is its own variant because a bare "0" beside a brief you posted an
 * hour ago reads as failure when it means "give it a day". It says
 * "no approaches yet" instead — the same fact, without the verdict.
 */
const approachVariants = cva("font-bold", {
  variants: {
    tone: { none: "text-muted-foreground", some: "text-foreground" },
  },
  defaultVariants: { tone: "some" },
});

export type ApproachCountProps = React.ComponentProps<"span"> &
  VariantProps<typeof approachVariants>;

export function ApproachCount({ className, tone, ...props }: ApproachCountProps) {
  return (
    <span
      data-slot="approach-count"
      className={cn(approachVariants({ tone }), className)}
      {...props}
    />
  );
}

const requirementBriefVariants = cva("pt-2.5 text-copy leading-relaxed", {
  variants: {
    state: { open: "text-muted-foreground", closed: "text-muted-foreground/70" },
  },
  defaultVariants: { state: "open" },
});

export type RequirementBriefProps = React.ComponentProps<"p"> &
  VariantProps<typeof requirementBriefVariants>;

export function RequirementBrief({ className, state, ...props }: RequirementBriefProps) {
  return (
    <p
      data-slot="requirement-brief"
      className={cn(requirementBriefVariants({ state }), className)}
      {...props}
    />
  );
}

/* ── A section on the business home ───────────────────────── */

/**
 * The heading a section opens with. It was a bare `<h2 className="pb-3
 * font-medium">` written out per section, which is how three sections end
 * up three different sizes.
 */
export function BoardSection({ className, ...props }: React.ComponentProps<"section">) {
  return <section data-slot="board-section" className={cn("", className)} {...props} />;
}

export function BoardHeading({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="board-heading"
      className={cn("flex flex-wrap items-baseline gap-x-3.5 gap-y-1 pb-3.5", className)}
      {...props}
    />
  );
}

export function BoardTitle({ className, children, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="board-title"
      className={cn("text-faint text-pico tracking-eyebrow font-mono font-bold uppercase", className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export function BoardCount({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="board-count"
      className={cn(
        "text-muted-foreground tracking-eyebrow text-micro font-mono uppercase",
        className,
      )}
      {...props}
    />
  );
}

/* ── The business identity ────────────────────────────────── */

export function BusinessIdentity({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="business-identity"
      className={cn(
        "border-border bg-card rounded-tile flex flex-wrap items-center gap-4 border p-5",
        className,
      )}
      {...props}
    />
  );
}
