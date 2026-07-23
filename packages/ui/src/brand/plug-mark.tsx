import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * PlugMark — the Plugfolio symbol (Brand Guidelines v1.1 §02): a two-prong plug
 * whose prongs rise into upward arrows. Geometry is copied verbatim from the
 * canonical `PlugMark.dc.html` (100×100 grid) and must never be redrawn by hand.
 *
 * Prong / body color follows the background (the locked rule, §02):
 *   • onLight  → violet body, ink prongs (spark violet/ink — never lime)
 *   • onDark   → white body,  lime prongs (this is where lime pops)
 *   • violet   → white body,  lime prongs (on a violet tile/surface)
 *   • flat     → one color (currentColor) for legibility under 24px
 *
 * Colors come from Tailwind fill/stroke utilities bound to tokens — no raw hex,
 * no inline styles. Prongs and body share stroke=fill so the mark flattens to a
 * single silhouette.
 */
const bodyVariants = cva("", {
  variants: {
    tone: {
      onLight: "fill-brand-violet stroke-brand-violet",
      onDark: "fill-white stroke-white",
      violet: "fill-white stroke-white",
      flat: "fill-current stroke-current",
      // Follows the active theme: violet body on light, white on dark.
      auto: "fill-brand-violet stroke-brand-violet dark:fill-white dark:stroke-white",
    },
  },
  defaultVariants: { tone: "onDark" },
});

const prongVariants = cva("", {
  variants: {
    tone: {
      onLight: "fill-brand-ink stroke-brand-ink",
      onDark: "fill-brand-lime stroke-brand-lime",
      violet: "fill-brand-lime stroke-brand-lime",
      flat: "fill-current stroke-current",
      // Follows the active theme: ink prongs on light, lime on dark.
      auto: "fill-brand-ink stroke-brand-ink dark:fill-brand-lime dark:stroke-brand-lime",
    },
  },
  defaultVariants: { tone: "onDark" },
});

// Named sizes keep every mark on the token scale (no inline width/height).
const markVariants = cva("block overflow-visible", {
  variants: {
    size: {
      xs: "h-4 w-4", // 16px — digital minimum; pair with tone="flat"
      sm: "h-6 w-6", // 24px
      md: "h-7 w-7", // 28px — top-bar default
      lg: "h-10 w-10", // 40px — stacked lockup
      xl: "h-16 w-16", // 64px
      "2xl": "h-24 w-24", // 96px — app tile / hero
    },
  },
  defaultVariants: { size: "md" },
});

export type PlugMarkProps = Omit<React.SVGProps<SVGSVGElement>, "size"> &
  VariantProps<typeof bodyVariants> &
  VariantProps<typeof markVariants> & {
    /** Accessible label; omit for a decorative mark (aria-hidden). */
    title?: string;
  };

export function PlugMark({ tone, size, title, className, ...props }: PlugMarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn(markVariants({ size }), className)}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <g strokeLinejoin="round" strokeWidth={3}>
        <polygon points="33,53 33,27 39.5,15 46,27 46,53" className={prongVariants({ tone })} />
        <polygon points="54,53 54,27 60.5,15 67,27 67,53" className={prongVariants({ tone })} />
        <rect x="18" y="43" width="64" height="44" rx="13" className={bodyVariants({ tone })} />
      </g>
    </svg>
  );
}
