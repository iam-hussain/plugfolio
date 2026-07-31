import * as React from "react";
import { cn } from "../lib/cn";

/**
 * The design's empty state (DESIGN creator.html §.empty) — a dashed outline,
 * a bold line saying what isn't there, one line of why, and at most one action.
 *
 * Dashed rather than solid on purpose: a solid border reads as a card that
 * failed to load; a dashed one reads as a space waiting to be filled.
 *
 * Distinct from shadcn's `Empty`, which is the app-shell empty (dashboard
 * tables, admin lists). This one is the public surface's.
 */
export function EmptyState({
  title,
  children,
  action,
  className,
}: {
  title: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border rounded-tile border border-dashed px-6 py-10 text-center",
        className,
      )}
    >
      <b className="font-display text-title block font-extrabold tracking-[-0.02em]">{title}</b>
      {children ? (
        <p className="text-muted-foreground text-copy mx-auto mt-2 max-w-[40ch]">{children}</p>
      ) : null}
      {/* An inline link inside the copy is violet-deep and bold — never the
          action button, which carries its own colour pair. */}
      {action ? <div className="mt-[18px]">{action}</div> : null}
    </div>
  );
}
