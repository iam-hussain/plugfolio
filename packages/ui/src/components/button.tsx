import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * Button, themed through semantic tokens (DESIGN §Components) — no raw hex.
 * Everything interactive is a pill. The committed primary is an INK fill that
 * arrives at Brand Violet on hover — the colour lands on interaction, not at
 * rest. `accent` is the disciplined Electric Lime spark: one CTA that flags an
 * offer, never everywhere.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      // Superset: our names (primary/accent, sm|md|lg) plus the stock shadcn
      // names (default/secondary/…, default|icon sizes) that the generated
      // registry components reference.
      variant: {
        // Ink pill → Brand Violet on hover (the committed primary action).
        primary: "bg-foreground text-background hover:bg-primary hover:text-primary-foreground",
        default: "bg-foreground text-background hover:bg-primary hover:text-primary-foreground",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
        // The outbound buy action (DESIGN .btn--accent): the page accent as a
        // fill under white, arriving at Ink on hover. It follows the creator's
        // chosen accent (ADR-0017) — which is what those contrast numbers were
        // measured for. NOT `accent`: that's Electric Lime, and lime means a
        // real offer (§7), not "this is the button".
        action:
          "bg-primary text-primary-foreground hover:bg-foreground hover:text-background",
        // White pill with a hairline — the second action in a pair.
        secondary: "border border-border bg-card text-foreground hover:bg-active",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // Quiet outline danger for row-level takedown triggers.
        "destructive-outline":
          "border border-destructive/30 bg-transparent text-destructive hover:bg-destructive/10",
        outline: "border border-border bg-transparent text-foreground hover:bg-active",
        // Secondary: raised white fill with the strong hairline.
        "outline-strong":
          "border border-border-strong bg-card text-foreground hover:bg-active",
        ghost: "text-foreground hover:bg-active",
        // Ghost: muted at rest, full text on hover.
        "ghost-muted": "text-muted-foreground hover:bg-active hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // Admin design control: 12.5px/600, 6×12 padding, 7px radius.
        xs: "gap-1.5 rounded-[7px] px-3 py-1.5 text-micro font-semibold",
        sm: "h-9 px-3",
        md: "h-11 px-5",
        default: "h-11 px-5",
        lg: "h-12 px-8 text-base",
        icon: "size-11",
        "icon-sm": "size-9",
        "icon-xs": "size-8",
        "icon-2xs": "size-7 rounded-[7px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    /** Render as a child element (e.g. an `<a>`) via Radix Slot. */
    asChild?: boolean;
  };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
