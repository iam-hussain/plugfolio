import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@plugfolio/ui";
import { PlugMark, type PlugMarkProps } from "./plug-mark";
import { Wordmark } from "./wordmark";

/**
 * Logo — the four approved lockups (Brand Guidelines v1.1 §03). Composes
 * PlugMark + Wordmark; never re-typesets or re-spaces the wordmark.
 *
 *   • horizontal (default) — headers, sites, decks
 *   • stacked              — tiles, badges
 *   • symbol               — avatars, favicons, app (mark only)
 *   • reversed             — dark UI, video, merch (white mark + white type)
 *
 * `tone` drives the mark + spark color per the locked background rule; text
 * color inherits from the surface except in the reversed lockup. All color runs
 * through token utilities — no raw hex, no inline styles.
 */
const logoVariants = cva("inline-flex text-current", {
  variants: {
    layout: {
      horizontal: "items-center gap-2",
      stacked: "flex-col items-center gap-2 text-center",
      symbol: "items-center",
      reversed: "items-center gap-2 text-white",
    },
  },
  defaultVariants: { layout: "horizontal" },
});

export type LogoProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof logoVariants> & {
    /** Named mark size (token scale); defaults follow the lockup. */
    markSize?: PlugMarkProps["size"];
    /** Override the mark's background-tone rule; defaults follow the layout. */
    tone?: PlugMarkProps["tone"];
  };

export function Logo({ layout = "horizontal", tone, markSize, className, ...props }: LogoProps) {
  // Dark-first app, so both the reversed and default lockups use the on-dark
  // rule (white body, lime prongs); callers rendering on light pass tone.
  const markTone = tone ?? "onDark";
  const size = markSize ?? (layout === "stacked" ? "lg" : "md");
  const showWordmark = layout !== "symbol";
  const wordmarkTone = markTone === "onLight" ? "onLight" : "onDark";

  return (
    <span className={cn(logoVariants({ layout }), className)} {...props}>
      <PlugMark tone={markTone} size={size} className="shrink-0" />
      {showWordmark ? <Wordmark tone={wordmarkTone} /> : null}
    </span>
  );
}
