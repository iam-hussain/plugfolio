"use client";

import { cn } from "@plugfolio/ui";
import Link from "next/link";
import { Band, card, eyebrow, pill } from "./landing-bits";
import { LandingFooter } from "./landing-chrome";
import { ClaimPanel } from "./landing-cta";
import { HeroSwitchLink, LandingHero } from "./landing-hero";
import { LandingJourney } from "./landing-journey";
import type { LandingViewProps } from "./landing-page";
import { BusinessScreens } from "./landing-screens-business";

/** The business story: brief to agreed in one thread, money never touched. */

const STEPS = [
  {
    title: "Post a requirement",
    copy: "Content type, budget, deadline. Two minutes, no discovery calls.",
  },
  {
    title: "Creators answer",
    copy: "Creators whose audience fits reply with their take and their price.",
  },
  {
    title: "One thread, real terms",
    copy: "Content, price, deadline — negotiated in one place. Nothing lost in DMs.",
  },
  {
    title: "Agreed",
    copy: "Both sides accept the terms. Payment settles off-platform — Plugfolio never holds money.",
  },
] as const;

const NEVER_DO = [
  "Hold or move your money — settlement is off-platform.",
  "Take a cut of the deal — the thread is the product.",
  "Inflate reach — creator numbers are real taps out, not impressions.",
] as const;

export function BusinessView({ onSwitch, scrollToJourney, scrollToClaim }: LandingViewProps) {
  return (
    <>
      <LandingHero
        ground="ink"
        badge="For business"
        headline="Creators sell it"
        limeLine="better than ads."
        sub="Post what you need, hear from creators whose audience fits, and agree terms in one thread. Payment settles off-platform — we never hold your money."
        cue="brief to agreed · scroll"
        switchLink={
          <HeroSwitchLink onClick={() => onSwitch("creator")}>← I&rsquo;m a creator</HeroSwitchLink>
        }
      >
        <button type="button" onClick={scrollToClaim} className={pill({ tone: "lime" })}>
          Post a requirement
        </button>
        <button type="button" onClick={scrollToJourney} className={pill({ tone: "outlineLight" })}>
          See a collab happen ↓
        </button>
      </LandingHero>

      <LandingJourney
        eyebrowText="Brief to agreed — four steps"
        title="Watch a collab happen."
        steps={STEPS}
        screens={<BusinessScreens />}
      />

      {/* ── Two doors in ── */}
      <Band
        ground="wash"
        className="z-[3]"
        eyebrowTone="deep"
        eyebrowText="Two doors in"
        title="Find them, or knock directly."
      >
        <div className="mt-[38px] grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] items-start gap-3.5">
          <div data-rev={1} className={cn(card, "p-6")}>
            <p className={eyebrow({ tone: "deep", track: "tight" })}>Door one · post</p>
            <h3 className="font-display text-title mt-2.5 font-bold tracking-[-0.03em]">
              Put the brief out.
            </h3>
            <p className="text-muted-foreground text-label mt-2 leading-[1.6]">
              Your requirement is visible to creators who opted into collabs. The right ones come
              to you.
            </p>
          </div>
          <div data-rev={2} className={cn(card, "p-6")}>
            <p className={eyebrow({ tone: "deep", track: "tight" })}>Door two · knock</p>
            <h3 className="font-display text-title mt-2.5 font-bold tracking-[-0.03em]">
              Ask a creator directly.
            </h3>
            <p className="text-muted-foreground text-label mt-2 leading-[1.6]">
              Signed in as a business, every creator page shows a Request-collab strip. One tap
              opens the thread.
            </p>
          </div>
          <div data-rev={3} className="bg-brand-ink rounded-card p-6 text-white">
            <p className={eyebrow({ tone: "lime", track: "tight" })}>What we never do</p>
            <ul className="text-label mt-3.5 flex flex-col gap-2.5 leading-[1.5] text-white/75">
              {NEVER_DO.map((line) => (
                <li key={line}>✕&nbsp; {line}</li>
              ))}
            </ul>
          </div>
        </div>
      </Band>

      <ClaimPanel
        ground="ink"
        headline="Bring your brief."
        headlineSecond="Creators do the rest."
        micro="Email sign-in · one account holds any mix of roles"
        crossLead="A creator?"
        crossLabel="Claim your profile"
        onCross={() => onSwitch("creator")}
        footer={
          <LandingFooter
            tagline={
              <>
                Shoppable creator pages.
                <br />
                Collabs agreed in one thread.
              </>
            }
            links={[
              { label: "For shoppers", onClick: () => onSwitch("shopper") },
              { label: "For creators", onClick: () => onSwitch("creator") },
              { label: "How it works", href: "/how-it-works" },
              { label: "Support & feedback", href: "/support" },
            ]}
          />
        }
      >
        <Link href="/join?as=business" className={pill({ tone: "lime" })}>
          Post a requirement
        </Link>
      </ClaimPanel>
    </>
  );
}
