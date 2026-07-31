import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../lib/cn";

/**
 * The creator's shelves (DESIGN creator.html §.chips) — the filter row above
 * the wall.
 *
 * Filters, not links out: square-shouldered and text-led, with a real selected
 * state. That's the whole reason they don't look like the circular icon-only
 * socials directly above them — one rearranges this page, the other leaves it.
 *
 * A horizontal scroll rail on phones; a creator with nine shelves must not
 * push the goods off the screen.
 */
export function ShelfChips({
  label = "Shelves",
  children,
  className,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("pt-2.5", className)}>
      <span className="text-faint text-micro mb-2 block font-semibold uppercase tracking-[0.06em]">
        {label}
      </span>
      <nav
        aria-label="Filter by shelf"
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </nav>
    </div>
  );
}

export type ShelfChipProps = React.ComponentProps<"a"> & {
  selected?: boolean;
  /** Render as the app's router link instead of a bare anchor. */
  asChild?: boolean;
};

export function ShelfChip({ selected, asChild, className, ...props }: ShelfChipProps) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      aria-current={selected ? "true" : undefined}
      className={cn(
        "border-border bg-card text-muted-foreground rounded-image text-label",
        "inline-flex min-h-10 flex-none items-center whitespace-nowrap border px-4 py-2.5 font-semibold no-underline",
        "ease-design hover:border-primary hover:text-primary transition-colors duration-200",
        selected &&
          "bg-primary border-primary text-primary-foreground hover:text-primary-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** The selected shelf's one line of description, under the rail. */
export function ShelfDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground text-copy mt-2.5">{children}</p>;
}
