import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * The nav TRACK — one object, not a row of loose buttons.
 *
 * Five outlined pills with one filled ink blob among them read as five
 * unrelated controls that happen to be adjacent, and the selected one shouted.
 * A track fixes both: the chips sit *inside* a violet-wash strip, so the group
 * is visibly one control, and the selected chip is **lifted out in white** with
 * the tag shadow — the system's own move (a white pill on a colour, ADR-0016)
 * instead of a heavy fill. Selection reads as raised, not as loud.
 *
 * It also makes the overflow honest: a strip that runs off the edge says "more
 * this way", where a pill clipped mid-word just looks broken.
 *
 * From 900px the track dissolves — no ground, no pills, a plain vertical rail
 * beside the panel, because there a nav is a column and not an object.
 */
export function AccountNavTrack({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <nav
      aria-label={label}
      className={cn(
        // The strip keeps the page's gutter and scrolls INSIDE itself: a chip
        // cut off by the track's own rounded end says "more this way", where a
        // strip bled off the viewport just looks like a cropped screenshot.
        //
        // `p-2` is the lifted chip's clearance, not decoration: at the ends a
        // pill inside a pill needs room for the curve to read, and `shadow-tag`
        // throws ~10px that `overflow-x-auto` clips flat against a tighter
        // inset. `scroll-px-2` keeps that inset when a chip snaps, so the first
        // and last stop where the others sit rather than flush to the end.
        "bg-active rounded-pill flex snap-x snap-proximity scroll-px-2 gap-1 overflow-x-auto p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        // …then stops being a strip entirely.
        "min-[900px]:sticky min-[900px]:top-[78px] min-[900px]:flex-col min-[900px]:gap-1 min-[900px]:overflow-visible min-[900px]:rounded-none min-[900px]:bg-transparent min-[900px]:p-0",
      )}
    >
      {children}
    </nav>
  );
}

const navItem = cva(
  "text-left transition-colors whitespace-nowrap flex-none snap-start px-4 py-2 min-h-11 flex flex-col justify-center " +
    // From 900px the same control is a full-width rail row: left-aligned, two
    // lines, square-ish. One element, two shapes — a second component would be
    // a second thing to keep in step.
    "max-[899px]:rounded-pill min-[900px]:rounded-image min-[900px]:w-full min-[900px]:whitespace-normal min-[900px]:px-3 min-[900px]:py-2.5",
  {
    variants: {
      state: {
        // `muted` and not the brand violet: violet-deep on the wash is 7:1 in
        // light and 2.8:1 once the wash is the dark theme's, and this rail has
        // to hold AA in both (§7).
        idle: "text-muted-foreground hover:text-foreground min-[900px]:hover:bg-active",
        // The two widths are written as mutually EXCLUSIVE ranges, not a base
        // plus an override: `bg-card` and `min-[900px]:bg-active` are the same
        // property at equal specificity, so which one won came down to the
        // order Tailwind happened to emit them in — and it emitted the phone's
        // fill last, so the rail kept wearing the chip's white pill.
        active: "text-foreground max-[899px]:bg-card max-[899px]:shadow-tag min-[900px]:bg-active",
      },
    },
    defaultVariants: { state: "idle" },
  },
);

/**
 * One destination: its name, and the value it currently holds. The value is a
 * second line on the rail and is dropped from the phone chip, where a row of
 * two-line chips would be a wall rather than a nav.
 */
export type AccountNavItemProps = React.ComponentProps<"button"> & {
  label: string;
  /** The live fact — "3 of 5 profiles", "Google connected". */
  value?: React.ReactNode;
  active?: boolean;
};

export function AccountNavItem({ label, value, active, className, ...props }: AccountNavItemProps) {
  return (
    <button
      type="button"
      className={cn(navItem({ state: active ? "active" : "idle" }), className)}
      {...props}
    >
      <span className="text-label min-[900px]:text-copy block font-bold leading-tight">
        {label}
      </span>
      {value ? (
        <span className="text-muted-foreground text-micro mt-0.5 hidden truncate font-medium min-[900px]:block">
          {value}
        </span>
      ) : null}
    </button>
  );
}
