"use client";

import { cn } from "@plugfolio/ui";
import * as React from "react";
import { eyebrow } from "./landing-bits";

/**
 * The 420vh scrubbed journey (design `s2`): a sticky viewport holding four
 * numbered steps beside a phone whose four screens slide vertically as the
 * visitor scrolls. The scroll engine drives step emphasis and screen position;
 * on narrow screens only the active step stays visible.
 */

export type JourneyStep = { title: string; copy: string };

export function LandingJourney({
  eyebrowText,
  title,
  steps,
  screens,
}: {
  eyebrowText: string;
  title: string;
  steps: readonly JourneyStep[];
  /** The four `<Screen i={0..3}>` faces, in order. */
  screens: React.ReactNode;
}) {
  return (
    <section data-lp="s2" className="bg-background relative z-[2] h-[420vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-[clamp(18px,5vw,60px)]">
        <div
          aria-hidden
          className="rounded-pill pointer-events-none absolute -right-[14%] -top-[18%] size-[56vw] max-h-[700px] max-w-[700px] bg-[radial-gradient(circle,hsl(var(--brand-violet-wash)),transparent_65%)]"
        />
        <div className="relative grid w-[min(1080px,94vw)] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-[clamp(28px,6vw,84px)]">
          <div className="flex flex-col gap-[26px]">
            <div>
              <p className={eyebrow({ tone: "violet", track: "wide" })}>{eyebrowText}</p>
              <h2 className="font-display text-display-lg mt-2.5 font-bold tracking-[-0.04em]">
                {title}
              </h2>
            </div>
            {steps.map((step, index) => (
              <div
                key={step.title}
                data-step={index}
                className="flex gap-4 opacity-35 transition-[opacity,transform] duration-[350ms] will-change-[opacity,transform]"
              >
                <span className="text-brand-violet text-nano pt-1 font-mono font-bold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-title font-bold tracking-[-0.03em]">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-label mt-1 max-w-[380px] leading-[1.6]">
                    {step.copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            {/* The phone bezel — a device drawing, so its radii are its own. */}
            <div
              data-lp="phone"
              className="bg-brand-ink h-[min(430px,48vh)] max-w-[76vw] rounded-[42px] p-2.5 shadow-[0_60px_100px_-50px_hsl(var(--brand-ink)/.4)] [aspect-ratio:9/18.5] min-[720px]:h-[min(576px,74vh)]"
            >
              <div className="bg-background relative size-full overflow-hidden rounded-[33px]">
                <div
                  aria-hidden
                  className="bg-brand-ink rounded-pill absolute left-1/2 top-2.5 z-50 h-5 w-20 -translate-x-1/2"
                />
                {screens}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Resting offsets so screens sit stacked before the engine's first frame. */
const SCREEN_OFFSET = [
  "translate-y-0",
  "translate-y-full",
  "translate-y-[200%]",
  "translate-y-[300%]",
] as const;

export function Screen({
  i,
  className,
  children,
}: {
  i: 0 | 1 | 2 | 3;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-scr={i}
      className={cn("absolute inset-0 will-change-transform", SCREEN_OFFSET[i], className)}
    >
      {children}
    </div>
  );
}
