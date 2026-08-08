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
  label,
  children,
  className,
}: {
  /** v2 shows no label on the creator page; pass one where a caption helps. */
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("pt-2.5", className)}>
      {label ? (
        <span className="text-faint text-pico tracking-eyebrow mb-2 block font-mono font-bold uppercase">
          {label}
        </span>
      ) : null}
      <nav
        aria-label="Filter by shelf"
        className="flex gap-[7px] overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
        // v2 chip: 11px-radius, Inter 13/600; selected fills with the accent.
        "border-border-strong text-foreground/80 text-label rounded-md",
        "inline-flex min-h-10 flex-none items-center gap-1.5 whitespace-nowrap border px-[15px] py-[9px] font-semibold no-underline",
        "ease-design hover:border-primary hover:text-primary transition-colors duration-200",
        selected &&
          "bg-primary text-primary-foreground hover:text-primary-foreground border-transparent",
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
