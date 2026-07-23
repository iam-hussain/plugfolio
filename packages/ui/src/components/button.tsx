import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * shadcn/ui Button, themed through our semantic tokens (§7/§8) — no raw hex.
 * `accent` is the disciplined Electric Lime spark: use for one primary CTA,
 * not everywhere.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      // Superset: our names (primary/accent, sm|md|lg) plus the stock shadcn
      // names (default/secondary/…, default|icon sizes) that the generated
      // registry components reference.
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
        secondary: "bg-muted text-foreground hover:bg-muted/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // Admin design: quiet outline danger for row-level takedown triggers.
        "destructive-outline":
          "border border-destructive/30 bg-transparent text-destructive hover:bg-destructive/10",
        outline: "border border-border bg-transparent text-foreground hover:bg-muted",
        // Admin design secondary: page-surface fill with the strong hairline.
        "outline-strong":
          "border border-border-strong bg-background text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        // Admin design ghost: muted at rest, full text on hover.
        "ghost-muted": "text-muted-foreground hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        // Admin design control: 12.5px/600, 6×12 padding, 7px radius.
        xs: "gap-1.5 rounded-[7px] px-3 py-1.5 text-[12.5px] font-semibold",
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
