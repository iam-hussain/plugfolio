import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@plugfolio/ui";

/**
 * Wordmark — lowercase `plugfolio` set in Sora 700 with a small square "spark"
 * dot after it (Brand Guidelines v1.1 §03). Never re-space, re-weight, or
 * re-typeset. Tracking ≈ -0.045em.
 *
 * The spark color follows the locked rule (§02): violet/ink on light, lime on
 * dark. Text color inherits from the surface so the wordmark reads correctly on
 * either theme; `tone` only drives the spark. All color via token utilities.
 */
const sparkVariants = cva("inline-block rounded-[2px] align-baseline", {
  variants: {
    tone: {
      onLight: "bg-brand-violet",
      onDark: "bg-brand-lime",
      violet: "bg-brand-lime",
    },
  },
  defaultVariants: { tone: "onDark" },
});

export type WordmarkProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof sparkVariants>;

export function Wordmark({ tone, className, ...props }: WordmarkProps) {
  return (
    <span
      className={cn(
        "font-display inline-flex items-baseline gap-[0.12em] text-[1.25rem] font-bold leading-none tracking-[-0.045em] text-current",
        className,
      )}
      {...props}
    >
      plugfolio
      <span className={cn(sparkVariants({ tone }), "h-[0.18em] w-[0.18em]")} aria-hidden />
    </span>
  );
}
