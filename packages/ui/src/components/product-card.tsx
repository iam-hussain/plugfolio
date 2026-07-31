import * as React from "react";
import { cn } from "../lib/cn";

/**
 * One tagged product on the post view (DESIGN post.html §.pcard).
 *
 * **The whole card is not a link.** It holds two competing actions — copy a
 * code, and leave for the retailer — and nesting them inside one link is how a
 * shopper copies a code by accident. The title is the link; the button is the
 * button.
 *
 * The list doesn't `align-items: start`: a card with a coupon is ~250px taller
 * than one without, and starting both at the top leaves the short one floating
 * above a void. The row is as tall as its tallest card either way — the only
 * question is whether that height sits inside the card or under it. Inside, so
 * the action is pushed to the foot and the Buy buttons line up across the row.
 */
export function ProductList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ul className={cn("mt-5 grid list-none gap-3.5 p-0 min-[900px]:grid-cols-2", className)}>
      {children}
    </ul>
  );
}

export type ProductCardProps = {
  /** The thumbnail — square, and the one thing that doesn't grow. */
  image: React.ReactNode;
  /** The title, wrapped in the app's router link. */
  title: React.ReactNode;
  /** Pre-formatted; the UI package doesn't own currency formatting. */
  price?: string | null;
  /** "affiliate pick · opens Amazon" — what tapping does, in words. */
  where?: React.ReactNode;
  /** The own-product marker, above the title. */
  badge?: React.ReactNode;
  /** The coupon block — always above the action. */
  coupon?: React.ReactNode;
  /** Buy / Shop their store. Absent for an in-store-only offer, where the
   *  code IS the action and a button would promise a shop it can't reach. */
  action?: React.ReactNode;
  /** The off-platform line, at the foot. */
  note?: React.ReactNode;
};

export function ProductCard({
  image,
  title,
  price,
  where,
  badge,
  coupon,
  action,
  note,
}: ProductCardProps) {
  return (
    <li className="shadow-rest border-border rounded-tile bg-card grid grid-cols-[96px_1fr] items-start gap-4 border p-4 min-[560px]:grid-cols-[120px_1fr]">
      <div className="rounded-image bg-active aspect-square w-full self-start overflow-hidden">
        {image}
      </div>
      {/* The column that can grow: everything but the thumbnail lives here, so
          the action can be pushed to the foot of whatever height the row takes. */}
      <div className="flex h-full min-w-0 flex-col">
        <div className="min-w-0">
          {badge}
          <h3 className="text-label m-0 font-bold tracking-[-0.01em]">{title}</h3>
          {price ? (
            <p className="text-name m-0 mt-1.5 font-extrabold tabular-nums tracking-[-0.02em]">
              {price}
            </p>
          ) : null}
          {where ? (
            <p className="text-muted-foreground text-micro m-0 mt-1 font-semibold">{where}</p>
          ) : null}
        </div>
        {coupon}
        {action ? <div className="mt-auto flex flex-wrap gap-2 pt-4">{action}</div> : null}
        {note}
      </div>
    </li>
  );
}
