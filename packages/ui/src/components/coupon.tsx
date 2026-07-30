"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "../lib/cn";

/**
 * The coupon block (DESIGN §.coupon, ADR-0011) — **always above the button**:
 * copy, then go. A shopper who reaches the retailer before they have the code
 * has to come back for it, and most don't.
 *
 * Dashed while the offer is live, solid and quiet once it has ended — an ended
 * offer never takes the product down with it.
 */
export function CouponBlock({
  channel,
  live = true,
  children,
  note,
  expires,
  className,
}: {
  /** "Online code" · "In-store code" — which channel the code works in. */
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
    <div
      className={cn(
        "rounded-image border-border mt-3 border px-3.5 py-3",
        live ? "bg-background border-dashed" : "bg-transparent",
        className,
      )}
    >
      <span
        className={cn(
          "text-micro font-bold uppercase tracking-[0.07em]",
          live ? "text-muted-foreground" : "text-faint",
        )}
      >
        {channel}
      </span>
      <div className="mt-[7px] flex flex-wrap items-center gap-2">{children}</div>
      {note ? <p className="text-muted-foreground text-micro mt-2">{note}</p> : null}
      {expires ? <p className="text-muted-foreground text-micro mt-1.5">{expires}</p> : null}
    </div>
  );
}

/**
 * The code itself — a button, because copying is the action. Copying is also
 * the only signal we get for an in-store offer, so it is recorded (ADR-0011);
 * redemption at the counter never is, and the block says so.
 */
export function CodeButton({
  code,
  label = "Code",
  copied,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  code: string;
  label?: string;
  copied?: boolean;
}) {
  return (
    <button
      type="button"
      data-copied={copied ? "" : undefined}
      aria-label={`Copy code ${code}`}
      className={cn(
        "border-border bg-card text-foreground text-label min-h-11 rounded-pill border px-4 py-[9px] font-bold",
        "inline-flex items-center gap-[9px] transition-colors duration-200 ease-design",
        "hover:border-primary hover:text-primary data-[copied]:border-primary data-[copied]:text-primary",
        className,
      )}
      {...props}
    >
      <span className="text-micro text-muted-foreground font-bold uppercase tracking-[0.07em]">
        {copied ? "Copied" : label}
      </span>
      <b className="tracking-[0.04em] tabular-nums">{code}</b>
      {copied ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <Copy className="size-4 opacity-60" aria-hidden />
      )}
    </button>
  );
}
