"use client";

import { cn, PlugMark, Wordmark } from "@plugfolio/ui";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { RoleBadge } from "./landing-bits";

/**
 * The 150vh sticky hero (design `s1`): lime role badge, the brand lockup, an
 * oversized two-line headline with a lime second line, sub copy, the CTA pair
 * and the bobbing scroll cue. The scroll engine fades/raises `s1group` out and
 * hides the cue as the section scrolls away.
 */

const heroVariants = cva("h-[150vh] text-white", {
  variants: {
    ground: {
      violet: "bg-brand-violet",
      ink: "bg-brand-ink",
    },
  },
  defaultVariants: { ground: "violet" },
});

export function LandingHero({
  ground,
  badge,
  headline,
  limeLine,
  sub,
  cue,
  children,
  switchLink,
}: VariantProps<typeof heroVariants> & {
  badge: string;
  /** First headline line; `limeLine` renders below it in Electric Lime. */
  headline: string;
  limeLine: string;
  sub: string;
  /** The mono micro-label above the scroll-cue chevron. */
  cue: string;
  /** The CTA pill pair. */
  children: React.ReactNode;
  /** Optional underlined mono switch link under the CTAs. */
  switchLink?: React.ReactNode;
}) {
  return (
    <section data-lp="s1" className={heroVariants({ ground })}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div
          data-lp="s1group"
          className="flex flex-col items-center gap-6 px-5 text-center will-change-[transform,opacity]"
        >
          <RoleBadge>{badge}</RoleBadge>
          <div className="flex items-end gap-3.5">
            <PlugMark tone="violet" size="xl" className="size-[clamp(40px,4.6vw,56px)]" />
            <Wordmark tone="violet" className="text-display-lg" />
          </div>
          <h1 className="font-display text-display-2xl font-bold leading-[0.98] tracking-[-0.05em] text-balance">
            {headline}
            <br />
            <span className="text-accent">{limeLine}</span>
          </h1>
          <p className="text-copy max-w-[440px] leading-[1.6] text-white/80">{sub}</p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">{children}</div>
          {switchLink}
        </div>
        <div
          data-lp="s1cue"
          className="absolute inset-x-0 bottom-[26px] flex flex-col items-center gap-2 text-white/70"
        >
          <span className="text-pico font-mono uppercase tracking-[0.22em]">{cue}</span>
          <ChevronDown
            aria-hidden
            size={14}
            strokeWidth={2.4}
            className={cn("motion-safe:animate-bob")}
          />
        </div>
      </div>
    </section>
  );
}

/** The mono "switch view" underline link the creator/business heroes carry. */
export function HeroSwitchLink({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-pico cursor-pointer border-b border-white/35 pb-[3px] font-mono uppercase tracking-[0.16em] text-white/65"
    >
      {children}
    </button>
  );
}
