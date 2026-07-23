import * as React from "react";
import type { Route } from "next";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@plugfolio/ui";

/**
 * Landing pill CTA (design-out landing). Sora label, fully-round pill; tone and
 * size are CVA variants keyed on tokens — the solid tone carries a soft violet
 * glow. No hardcoded hex, no inline styles.
 */
const ctaVariants = cva(
  "font-display inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill font-semibold transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      tone: {
        solid: "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/95",
        outline: "border border-border bg-transparent text-foreground hover:bg-muted",
        accent: "bg-accent text-accent-foreground shadow-lg shadow-accent/25 hover:bg-accent/95",
      },
      size: {
        sm: "px-5 py-2.5 text-sm",
        md: "px-[26px] py-3.5 text-[15px]",
      },
    },
    defaultVariants: { tone: "solid", size: "md" },
  },
);

export type LandingCtaProps = React.ComponentPropsWithoutRef<typeof Link> &
  VariantProps<typeof ctaVariants> & { href: Route };

export function LandingCta({ tone, size, className, ...props }: LandingCtaProps) {
  return <Link className={cn(ctaVariants({ tone, size }), className)} {...props} />;
}
