import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

/**
 * A loading placeholder.
 *
 * TWO RULES GOVERN EVERY USE OF THIS:
 *
 * 1. It must be the SHAPE of what is coming. A skeleton exists to reserve
 *    the space the real content will take, so the page does not jump when
 *    it arrives. A generic circle-and-two-bars in front of a four-column
 *    grid is worse than a spinner: it promises a layout, then breaks it.
 *
 * 2. It is decorative. Bones carry no information, so they are hidden from
 *    assistive tech and the surrounding <SkeletonScreen> announces the wait
 *    once. Without that, a screen reader meets a run of empty divs and
 *    reads nothing useful.
 *
 * The pulse stops under prefers-reduced-motion. An infinite pulse is a
 * vestibular trigger, and on a slow connection it can run for a while.
 */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("bg-muted animate-pulse rounded-md motion-reduce:animate-none", className)}
      {...props}
    />
  );
}

/**
 * Wraps a set of bones and says, once, what is being waited for.
 *
 * `label` should name the thing ("Loading this creator's page"), not the
 * act of waiting — a screen-reader user who hears only "Loading" on every
 * navigation learns nothing about where they have arrived.
 */
export function SkeletonScreen({
  label,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { label: string }) {
  return (
    <div className={className} {...props}>
      <span role="status" aria-live="polite" className="sr-only">
        {label}
      </span>
      {children}
    </div>
  );
}
