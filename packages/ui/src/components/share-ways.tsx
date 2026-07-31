import * as React from "react";
import { cn } from "../lib/cn";

/**
 * Share, under the identity (DESIGN creator.html §.pshare).
 *
 * Two *named* ways rather than one verb: "Share" alone made a visitor guess
 * what would happen — Link and QR each say it. Quieter than the socials above
 * them, because passing a page on is a secondary act next to following it.
 */
export function ShareWays({
  label = "Share this page",
  children,
  className,
}: {
  label?: string;
  /** The `ShareWay` buttons. */
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-faint text-micro mr-0.5 font-semibold uppercase tracking-[0.06em]">
        {label}
      </span>
      {children}
    </div>
  );
}

export type ShareWayProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: React.ReactNode;
};

export const ShareWay = React.forwardRef<HTMLButtonElement, ShareWayProps>(function ShareWay(
  { icon, children, className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      {...props}
      className={cn(
        "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary hover:bg-active",
        "text-micro rounded-pill ease-design inline-flex min-h-9 items-center gap-[7px] border px-3.5 py-2 font-bold transition-colors duration-200",
        "[&>svg]:size-[15px]",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
});
