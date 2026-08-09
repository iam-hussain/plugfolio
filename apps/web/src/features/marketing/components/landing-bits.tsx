"use client";

import { cn, measure } from "@plugfolio/ui";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

/**
 * Shared vocabulary for the Scroll V3 Dual landing (`Plugfolio Scroll V3
 * Dual.dc.html`, ADR-0027): the pill CTAs, the mono eyebrows, the reveal band
 * shell and the copyable coupon chip. All colour/type from tokens; the design's
 * fine-grained px sizes map onto the named scale (§7).
 */

/** Every interactive pill on the landing — tones straight from the design. */
export const pill = cva(
  "font-display rounded-pill inline-flex cursor-pointer items-center justify-center font-semibold transition-transform duration-150 hover:-translate-y-px motion-reduce:transform-none",
  {
    variants: {
      tone: {
        ink: "bg-brand-ink text-white",
        violet: "bg-brand-violet text-white",
        lime: "bg-accent text-accent-foreground",
        /** Ghost on a violet/ink hero. */
        outlineLight: "border border-white/40 text-white",
      },
      size: {
        md: "text-label px-[18px] py-[9px]",
        lg: "text-copy px-[26px] py-3.5",
      },
    },
    defaultVariants: { tone: "ink", size: "lg" },
  },
);

/** The Space-Mono micro-label voice. `wide` is the section eyebrow tracking. */
export const eyebrow = cva("font-mono text-pico font-bold uppercase", {
  variants: {
    tone: {
      violet: "text-brand-violet",
      deep: "text-brand-violet-deep",
      muted: "text-muted-foreground",
      /** Ink-panel eyebrows only (the design's lime label voice on dark). */
      lime: "text-accent",
      light: "text-white/85",
    },
    track: {
      wide: "tracking-[0.22em]",
      tight: "tracking-eyebrow",
    },
  },
  defaultVariants: { tone: "muted", track: "wide" },
});

/** A white card on a tinted band — the landing's one card face. */
export const card = "border-border bg-background rounded-card border";

type BandProps = VariantProps<typeof bandVariants> & {
  eyebrowText: string;
  eyebrowTone?: VariantProps<typeof eyebrow>["tone"];
  title: string;
  lede?: string;
  className?: string;
  children: React.ReactNode;
};

const bandVariants = cva("relative py-[14vh] first:pt-[15vh]", {
  variants: {
    ground: {
      canvas: "bg-muted",
      white: "bg-background",
      wash: "bg-brand-violet-wash",
    },
  },
  defaultVariants: { ground: "canvas" },
});

/**
 * A reveal band — eyebrow, headline, optional lede, then a grid of cards.
 * Direct children carrying `data-rev` fade/rise in via the scroll engine.
 */
export function Band({ ground, eyebrowText, eyebrowTone, title, lede, className, children }: BandProps) {
  return (
    <section className={cn(bandVariants({ ground }), className)}>
      <div className={measure({ width: "narrow" })}>
        <div data-rev={0}>
          <p className={eyebrow({ tone: eyebrowTone })}>{eyebrowText}</p>
          <h2 className="font-display text-display-xl mt-2.5 font-bold tracking-[-0.04em]">
            {title}
          </h2>
          {lede ? (
            <p className="text-muted-foreground text-copy mt-2.5 max-w-[520px] leading-[1.6]">
              {lede}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

/**
 * The copyable coupon code chip — copies on the chip itself, no toast (the
 * three-faces rule). Lime-on-ink is the sanctioned accent moment for a code.
 */
export function CodeChip({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const copy = () => {
    try {
      void navigator.clipboard.writeText(code);
    } catch {
      // In-app browsers without clipboard access still get the visual confirm.
    }
    clearTimeout(timer.current);
    setCopied(true);
    timer.current = setTimeout(() => setCopied(false), 2400);
  };
  React.useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "bg-brand-ink text-accent text-nano cursor-pointer rounded-sm px-3 py-2 font-mono font-bold tracking-[0.06em]",
        className,
      )}
    >
      {copied ? "Copied ✓" : code}
    </button>
  );
}

/** The lime role badge that opens every hero. */
export function RoleBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-accent text-accent-foreground rounded-pill text-pico inline-flex items-center gap-2 py-1.5 pl-2 pr-3 font-mono font-bold uppercase tracking-eyebrow">
      <span aria-hidden className="bg-accent-foreground size-1.5 rounded-pill" />
      {children}
    </span>
  );
}
