"use client";

import { PlugMark } from "@plugfolio/ui";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { eyebrow } from "./landing-bits";

/**
 * The closing claim section (design `claim`): the big rounded panel — violet
 * for shoppers/creators, ink for business — with the PlugMark, an oversized
 * headline, the CTA row, the mono honesty micro-line and the role cross-link,
 * followed by the landing footer (passed in by the view).
 */

const panelVariants = cva(
  "rounded-bay flex flex-col items-center gap-[22px] px-[clamp(22px,5vw,64px)] py-[clamp(40px,7vw,84px)] text-center text-white",
  {
    variants: {
      ground: {
        violet: "bg-brand-violet",
        ink: "bg-brand-ink",
      },
    },
    defaultVariants: { ground: "violet" },
  },
);

export function ClaimPanel({
  ground,
  headline,
  headlineSecond,
  micro,
  crossLead,
  crossLabel,
  onCross,
  children,
  footer,
}: VariantProps<typeof panelVariants> & {
  headline: string;
  headlineSecond: string;
  /** The mono honesty line under the CTAs. */
  micro: string;
  /** "A creator?" / "Just shopping?" cross-link under the micro line. */
  crossLead: string;
  crossLabel: string;
  onCross: () => void;
  /** The CTA row. */
  children: React.ReactNode;
  /** The `LandingFooter` for this role. */
  footer: React.ReactNode;
}) {
  return (
    <section data-lp="claim" className="bg-muted relative z-[5] px-[clamp(18px,5vw,48px)] pb-10 pt-5">
      <div>
        <div data-rev={0} className={panelVariants({ ground })}>
          <PlugMark tone="violet" size="xl" className="size-14" />
          <h2 className="font-display text-display-xl font-bold leading-[1.02] tracking-[-0.045em] text-balance">
            {headline}
            <br />
            {headlineSecond}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2.5">{children}</div>
          <p className={eyebrow({ tone: "light", track: "tight", className: "font-normal text-white/60" })}>
            {micro}
          </p>
          <p className="text-label text-white/80">
            {crossLead}{" "}
            <button
              type="button"
              onClick={onCross}
              className="text-accent cursor-pointer underline"
            >
              {crossLabel} →
            </button>
          </p>
        </div>
        {footer}
      </div>
    </section>
  );
}
