"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * The coupon ticket (v2, docs/design/v2-visual-system.md §Signature moves,
 * ADR-0011) — **always above the button**: copy, then go. A shopper who
 * reaches the retailer before they have the code has to come back for it, and
 * most don't.
 *
 * Live: accent border, the channel eyebrow, the lime code chip, and the
 * dashed expiry row. Ended: the whole ticket recedes (grey border, sunk fill,
 * a dead chip) — an ended offer never takes the product down with it.
 */
const ticket = cva("rounded-row mt-4 overflow-hidden border", {
  variants: {
    live: {
      true: "border-primary bg-card",
      false: "border-border bg-active opacity-70",
    },
  },
  defaultVariants: { live: true },
});

const couponChannel = cva("text-pico tracking-eyebrow font-mono font-bold uppercase", {
  variants: {
    live: { true: "text-primary", false: "text-faint" },
  },
  defaultVariants: { live: true },
});

export function CouponBlock({
  channel,
  live = true,
  children,
  note,
  expires,
  className,
}: {
  /** "Online offer" · "In-store offer" — which channel the code works in. */
  channel: React.ReactNode;
  live?: boolean;
  /** The `CodeButton`, plus any "10% off" style detail beside it. */
  children: React.ReactNode;
  /** The in-store caveat: redemption isn't tracked. */
  note?: React.ReactNode;
  expires?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(ticket({ live }), className)}>
      <div className="flex items-center justify-between gap-2.5 px-4 py-3.5">
        <div className="min-w-0">
          <span className={couponChannel({ live })}>{channel}</span>
          {note ? (
            <p className="text-muted-foreground text-label mt-1.5 leading-normal">{note}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>
      </div>
      {expires ? (
        <p className="border-border-strong text-faint text-pico tracking-eyebrow border-t border-dashed px-4 py-2.5 font-mono uppercase">
          {expires}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The code itself — a button, because copying is the action. Copying is also
 * the only signal we get for an in-store offer, so it is recorded (ADR-0011);
 * redemption at the counter never is, and the block says so.
 *
 * The chip is Electric Lime with ink text — the one place lime is allowed
 * (§7): a live offer.
 */
export function CodeButton({
  code,
  label = "Copy",
  copied,
  live = true,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  code: string;
  label?: string;
  copied?: boolean;
  /** A spent code renders dead — no lime, no copy affordance. */
  live?: boolean;
}) {
  if (!live) {
    return (
      <span
        aria-label="Offer ended"
        className={cn(
          "bg-border text-faint rounded-md text-label inline-flex min-h-11 items-center px-[15px] font-mono font-bold",
          className,
        )}
      >
        —
      </span>
    );
  }
  return (
    <button
      type="button"
      data-copied={copied ? "" : undefined}
      aria-label={`Copy code ${code}`}
      className={cn(
        "bg-accent text-accent-foreground rounded-md text-label inline-flex min-h-11 items-center gap-2 px-[15px] font-mono font-bold tracking-[0.06em]",
        "ease-design transition-transform duration-150 hover:-translate-y-px",
        className,
      )}
      {...props}
    >
      {copied ? (
        <>
          Copied <Check className="size-4" aria-hidden />
        </>
      ) : (
        <>
          {code}
          <span className="sr-only">{label}</span>
        </>
      )}
    </button>
  );
}
