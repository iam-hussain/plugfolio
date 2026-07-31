import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@plugfolio/ui/lib/cn";

/**
 * The collab thread's furniture (brief 12, §5.24).
 *
 * THE PIN IS THE POINT. A negotiation held only in messages leaves both
 * sides scrolling to find what was actually agreed, and disagreeing about
 * it later. So the live terms sit pinned above the conversation, and a new
 * proposal clears BOTH acceptances — which means "Agreed" can only ever
 * mean agreed to the terms currently shown, never to something three
 * messages up. These components exist to make that state legible at a
 * glance: the badge, the pinned line, and the banner all read from one
 * `status`, so they cannot contradict each other.
 *
 * v1 handles no money. The banner says payment settles off-platform rather
 * than implying an escrow that does not exist.
 */

/* ── The pinned card ──────────────────────────────────────── */

const termsCardVariants = cva(
  "bg-card shadow-rest sticky top-2 z-20 rounded-tile border p-5 transition-colors",
  {
    variants: {
      status: {
        /* Negotiating is the resting state and wears the ordinary hairline. */
        negotiating: "border-border",
        /* Agreed earns the accent edge — it is the one moment in the thread
           where something was settled. */
        agreed: "border-accent",
      },
    },
    defaultVariants: { status: "negotiating" },
  },
);

export type TermsCardProps = React.ComponentProps<"section"> &
  VariantProps<typeof termsCardVariants>;

export function TermsCard({ className, status, ...props }: TermsCardProps) {
  return (
    <section
      data-slot="terms-card"
      data-status={status ?? "negotiating"}
      aria-label="The terms"
      className={cn(termsCardVariants({ status }), className)}
      {...props}
    />
  );
}

export function TermsHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="terms-header"
      className={cn("flex flex-wrap items-center gap-2.5", className)}
      {...props}
    />
  );
}

export function TermsTitle({ className, children, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      data-slot="terms-title"
      className={cn(
        "font-display tracking-display text-title min-w-0 flex-1 truncate font-bold",
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export function TermsSubtitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="terms-subtitle"
      className={cn("text-muted-foreground text-micro truncate pt-1", className)}
      {...props}
    />
  );
}

/**
 * The live terms line, or the invitation to write one.
 *
 * `pending` is not an error state — most threads open without terms and the
 * copy has to read as the next step rather than as something missing.
 */
const termsLineVariants = cva("mt-3.5 rounded-image px-4 py-3 text-copy leading-relaxed", {
  variants: {
    pending: {
      false: "bg-background text-foreground",
      true: "text-muted-foreground bg-background/60 border-border border border-dashed",
    },
  },
  defaultVariants: { pending: false },
});

export type TermsLineProps = React.ComponentProps<"p"> & VariantProps<typeof termsLineVariants>;

export function TermsLine({ className, pending, ...props }: TermsLineProps) {
  return (
    <p
      data-slot="terms-line"
      className={cn(termsLineVariants({ pending }), className)}
      {...props}
    />
  );
}

/** The "The terms ·" prefix — a micro label, not part of the sentence. */
export function TermsLabel({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="terms-label"
      className={cn(
        /* text-micro, not a literal 10px: the preset's own comment calls a
           bare pixel value in a class string the magic value §8 forbids.
           The app has this drift in a few older eyebrows; new work does
           not add to it. */
        "text-muted-foreground tracking-eyebrow text-micro mr-1 font-mono uppercase",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Shown only when both sides have accepted. It states the money fact in the
 * same breath as the good news, because this is the moment someone might
 * otherwise assume Plugfolio is about to take a payment.
 */
export function AgreedBanner({ className, children, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="agreed-banner"
      className={cn(
        "bg-accent text-accent-foreground rounded-image text-copy mt-3 flex items-center gap-2.5 px-4 py-3 font-bold",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

/* ── A thread event ───────────────────────────────────────── */

/**
 * A proposal is an event, not a message. It changed what both sides are
 * agreeing to, so it reads as a marker across the column rather than as
 * something one of them said.
 */
export function ThreadEvent({ className, children, ...props }: React.ComponentProps<"li">) {
  return (
    <li data-slot="thread-event" className={cn("flex items-center gap-3", className)} {...props}>
      <span className="bg-border h-px flex-1" aria-hidden="true" />
      <span className="text-muted-foreground text-micro shrink-0 text-center font-bold">
        {children}
      </span>
      <span className="bg-border h-px flex-1" aria-hidden="true" />
    </li>
  );
}

/* ── A message bubble ─────────────────────────────────────── */

/**
 * The bubble, by whose it is. This was a ternary picking between two class
 * strings inline in the page — which is how one side quietly drifts from
 * the other. One variant, one place.
 */
/**
 * Two views of the same thread. A *participant* reads it as mine/theirs — the
 * question is "did I say this". An *observer* (the admin queue) is neither
 * side, so for them the question is "which party said this", and colouring one
 * of them `mine` would put admin in the conversation.
 */
const bubbleVariants = cva("w-fit max-w-[76%] rounded-tile px-4 py-2.5 text-copy leading-relaxed", {
  variants: {
    tone: {
      mine: "bg-primary text-primary-foreground",
      theirs: "bg-card text-foreground border-border border",
      creator: "bg-active text-foreground border-border border",
      business: "bg-background text-foreground border-border border",
    },
  },
  defaultVariants: { tone: "theirs" },
});

export type MessageBubbleProps = React.ComponentProps<"div"> & VariantProps<typeof bubbleVariants>;

export function MessageBubble({ className, tone, ...props }: MessageBubbleProps) {
  return (
    <div
      data-slot="message-bubble"
      className={cn(bubbleVariants({ tone }), className)}
      {...props}
    />
  );
}

/* ── The accept row ───────────────────────────────────────── */

/**
 * Status on the left, action on the right — the order the decision is
 * actually made in: you read whether they have accepted before deciding
 * whether you do.
 */
export function AcceptRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="accept-row"
      className={cn(
        "border-border bg-card rounded-tile flex flex-wrap items-center gap-3 border px-4 py-3.5",
        className,
      )}
      {...props}
    />
  );
}

export function AcceptStatus({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="accept-status"
      className={cn("text-muted-foreground text-copy min-w-0 flex-1", className)}
      {...props}
    />
  );
}
