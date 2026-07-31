import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * SystemMark — the Plugfolio glyph wearing a fault, for the two system screens
 * (DESIGN 404.html / error.html). Same plug as `PlugMark`, same 100×100 grid;
 * only the fault changes, so 404 and error read as one family:
 *
 *   • `unplugged` (404) — the body keeps its full size (it is still the mark),
 *     and only the prongs move: lifted clear and tilted, with two empty sockets
 *     left behind. Nothing is drawn broken; the gap is the whole story — the
 *     right register for a wrong link, not a catastrophe.
 *   • `cracked` (error) — the prongs stay seated (the connection was made) and
 *     the body splits: a jag cut in the canvas colour, so the shape reads as
 *     broken rather than decorated. No sparks — lime means "offer" everywhere
 *     else, and spending it on "broken" would teach the eye two things.
 *
 * Body is Brand Violet, prongs are Ink (currentColor), sockets are ink at low
 * alpha so they read as holes. Colours come from token utilities — no raw hex,
 * no inline styles; the prong lift is an SVG transform attribute, not CSS.
 */
const markVariants = cva("text-foreground block", {
  variants: {
    size: {
      md: "size-16", // 64px
      lg: "size-[88px]",
      xl: "size-[108px]", // the system-screen default
    },
  },
  defaultVariants: { size: "xl" },
});

const PRONGS = (
  <>
    <polygon points="33,53 33,27 39.5,15 46,27 46,53" className="fill-current stroke-current" />
    <polygon points="54,53 54,27 60.5,15 67,27 67,53" className="fill-current stroke-current" />
  </>
);

export type SystemMarkProps = Omit<React.SVGProps<SVGSVGElement>, "size"> &
  VariantProps<typeof markVariants> & {
    state: "unplugged" | "cracked";
    /** Accessible label; omit for a decorative mark (aria-hidden). */
    title?: string;
  };

export function SystemMark({ state, size, title, className, ...props }: SystemMarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn(markVariants({ size }), className)}
      strokeLinejoin="round"
      strokeWidth={3}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {state === "unplugged" ? (
        <>
          {/* The body stays exactly as the brand mark draws it. */}
          <rect
            x="18"
            y="43"
            width="64"
            height="44"
            rx="13"
            className="fill-brand-violet stroke-brand-violet"
          />
          {/* The sockets the prongs came out of — ink at low alpha, so they
              read as holes in the body, not as drawn marks. */}
          <rect x="35" y="50" width="9" height="13" rx="3" className="fill-foreground/40" />
          <rect x="56" y="50" width="9" height="13" rx="3" className="fill-foreground/40" />
          {/* The prongs, lifted clear and tilted. */}
          <g transform="translate(2 -16) rotate(-9 50 40)">{PRONGS}</g>
        </>
      ) : (
        <>
          {/* Prongs seated — the connection was made; what failed is behind. */}
          <g>{PRONGS}</g>
          <rect
            x="18"
            y="43"
            width="64"
            height="44"
            rx="13"
            className="fill-brand-violet stroke-brand-violet"
          />
          {/* The split: a jag through the body in the canvas colour, so the
              shape reads as broken rather than as decorated. */}
          <path
            d="M44 43 L52 58 L42 66 L52 87"
            fill="none"
            className="stroke-background"
            strokeWidth={4}
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}
