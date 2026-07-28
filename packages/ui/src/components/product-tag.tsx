import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * ProductTag — the system's signature object (DESIGN §Components): a white
 * pill pinned onto a photograph, carrying a product name and its price in
 * tabular figures, with a small anchor dot connecting it to the point on the
 * image it refers to. The dot's tone flags what kind of tag it is:
 *   - `affiliate` (default): a plain affiliate pick — violet dot.
 *   - `offer`: a live coupon — lime dot (the Lime-Means-Offer rule).
 *   - `own`: the creator's own product — a violet-deep dot.
 *
 * Position is the caller's job: pass absolute-position utilities via
 * `className` (`absolute left-[7%] bottom-[10%]`). Tags are real links — never
 * decoration — so render one as an `<a>` via `asChild`, and every tag is a
 * 44px-minimum tap target.
 */
const dotVariants = cva("size-2 shrink-0 rounded-pill", {
  variants: {
    tone: {
      affiliate: "bg-primary",
      offer: "bg-accent ring-2 ring-brand-ink/10",
      own: "bg-brand-violet-deep",
    },
  },
  defaultVariants: { tone: "affiliate" },
});

export type ProductTagProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof dotVariants> & {
    name: string;
    price: string;
    /** Render as a child element (an `<a>` to the product page) via Slot. */
    asChild?: boolean;
  };

export const ProductTag = React.forwardRef<HTMLElement, ProductTagProps>(
  ({ className, tone, name, price, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "span";
    return (
      <Comp
        ref={ref}
        className={cn(
          "bg-card text-foreground shadow-tag inline-flex min-h-11 items-center gap-2 rounded-pill px-3 py-1.5 text-[13px] font-semibold no-underline",
          className,
        )}
        {...props}
      >
        <span className={cn(dotVariants({ tone }))} aria-hidden />
        {name ? <span className="truncate">{name}</span> : null}
        <span className="text-muted-foreground tabular-nums">{price}</span>
      </Comp>
    );
  },
);
ProductTag.displayName = "ProductTag";
