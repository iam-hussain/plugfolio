import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * Tile — a colour panel in one of the six content hues (DESIGN §Components,
 * the Tile-Carries-Colour rule). The tile supplies the colour; the photo or
 * card inside supplies the subject. Text on a tile rides on `tile-foreground`
 * (ink on light, near-white on the deep dark tiles) — never gray. Hues are
 * assigned by position in a sequence, never by category meaning. Never nest a
 * tile inside a tile.
 */
export const tileVariants = cva("rounded-tile text-tile-foreground", {
  variants: {
    tone: {
      butter: "bg-tile-butter",
      mint: "bg-tile-mint",
      sky: "bg-tile-sky",
      lavender: "bg-tile-lavender",
      coral: "bg-tile-coral",
      blush: "bg-tile-blush",
    },
  },
  defaultVariants: { tone: "butter" },
});

export type TileProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof tileVariants>;

export const Tile = React.forwardRef<HTMLDivElement, TileProps>(
  ({ className, tone, ...props }, ref) => (
    <div ref={ref} className={cn(tileVariants({ tone }), className)} {...props} />
  ),
);
Tile.displayName = "Tile";
