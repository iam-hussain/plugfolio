"use client";

import { cn } from "@plugfolio/ui";
import Image from "next/image";
import Link from "next/link";
import { Band, card, CodeChip, eyebrow, pill } from "./landing-bits";
import { LandingFooter } from "./landing-chrome";
import { ClaimPanel } from "./landing-cta";
import { HeroSwitchLink, LandingHero } from "./landing-hero";
import { LandingJourney } from "./landing-journey";
import type { LandingViewProps } from "./landing-page";
import { CreatorScreens } from "./landing-screens-creator";

/** The creator story: hour one live, the five-minute setup, the honest dashboard. */

const STEPS = [
  {
    title: "You're live",
    copy: "One link in your bio — plugfolio.app/you. Your posts are already the store.",
  },
  {
    title: "First tap out",
    copy: "Nine minutes in, someone leaves for the retailer. The tap lands on your dashboard; nothing about the shopper does.",
  },
  {
    title: "First code copy",
    copy: "MAYA10, copied at a shop counter. Counted beside taps — labeled honestly as not tracked.",
  },
  {
    title: "First brand hello",
    copy: "A collab thread opens: content, price, deadline. Both sides accept; payment settles off-platform.",
  },
] as const;

const SETUP = [
  {
    rev: 1,
    stamp: "00:12 · connect",
    title: "One OAuth screen.",
    copy: "Instagram or YouTube. We only read what's already public — nothing posts on your behalf.",
  },
  {
    rev: 2,
    stamp: "01:03 · import",
    title: "Posts walk in by themselves.",
    copy: "Reels, posts, videos — already laid out on your page, waiting for tags.",
  },
  {
    rev: 3,
    stamp: "02:40 · tag",
    title: "Point at the things.",
    copy: "Affiliate link or your own product — a toggle, not a form. Coupons ride along if you add one.",
  },
  {
    rev: 1,
    stamp: "04:58 · live",
    title: "One link in your bio.",
    copy: "plugfolio.app/you. Your followers tap it and shop — they never make an account.",
  },
] as const;

const TOP_THINGS = [
  { name: "Linen overshirt", taps: "412", bar: 92 },
  { name: "Canvas tote", taps: "268", bar: 60 },
  { name: "Scrunchie set", taps: "150", bar: 34 },
] as const;

export function CreatorView({ onSwitch, scrollToJourney, scrollToClaim }: LandingViewProps) {
  return (
    <>
      <LandingHero
        ground="violet"
        badge="For creators"
        headline="You post."
        limeLine="Your page sells."
        sub="Tag your things once and every reel becomes a shop window. Here's your first hour live, minute by minute."
        cue="hour one · scroll"
        switchLink={
          <HeroSwitchLink onClick={() => onSwitch("shopper")}>
            ← Just shopping? Switch view
          </HeroSwitchLink>
        }
      >
        <button type="button" onClick={scrollToClaim} className={pill({ tone: "ink" })}>
          Claim your profile
        </button>
        <button type="button" onClick={scrollToJourney} className={pill({ tone: "outlineLight" })}>
          Watch hour one ↓
        </button>
      </LandingHero>

      <LandingJourney
        eyebrowText="Your first hour live"
        title="Watch hour one happen."
        steps={STEPS}
        screens={<CreatorScreens />}
      />

      {/* ── Setup rewind ── */}
      <Band
        ground="wash"
        className="z-[3]"
        eyebrowTone="deep"
        eyebrowText="Rewind — before that hour"
        title="The setup was five minutes."
        lede="Four screens between signing in and that link in your bio. No storefront builder, no product uploads — your posts are the store."
      >
        <div className="mt-[38px] grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
          {SETUP.map((step) => (
            <div key={step.stamp} data-rev={step.rev} className={cn(card, "p-[22px]")}>
              <p className={eyebrow({ tone: "violet", track: "wide" })}>{step.stamp}</p>
              <h3 className="font-display text-title mt-2 font-bold tracking-[-0.03em]">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-label mt-2 leading-[1.55]">{step.copy}</p>
            </div>
          ))}
        </div>
      </Band>

      {/* ── Dashboard peek ── */}
      <Band
        ground="canvas"
        className="z-[3]"
        eyebrowText="Day two onward"
        title="Then you watch it move."
        lede="The dashboard counts only what really happened: taps out to retailers and coupon copies. No vanity reach, nothing inflated."
      >
        <div className="mt-[38px] grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3.5">
          <div data-rev={1} className={cn(card, "p-6")}>
            <p className={eyebrow({ track: "tight" })}>Taps out · yesterday</p>
            <p
              data-count={1284}
              className="font-display text-stat mt-2 font-extrabold tracking-[-0.04em] tabular-nums"
            >
              0
            </p>
            <p className="text-faint text-micro mt-1">every one landed on a retailer&rsquo;s page</p>
          </div>
          <div data-rev={2} className={cn(card, "p-6")}>
            <p className={eyebrow({ track: "tight" })}>Code copies</p>
            <p
              data-count={312}
              className="font-display text-stat mt-2 font-extrabold tracking-[-0.04em] tabular-nums"
            >
              0
            </p>
            <p className="text-faint text-micro mt-1">
              41 in-store — <span className="text-nano font-mono">redemption not tracked</span>
            </p>
          </div>
          <div data-rev={3} className={cn(card, "p-6")}>
            <p className={eyebrow({ track: "tight" })}>Top things</p>
            <div className="mt-4 flex flex-col gap-3">
              {TOP_THINGS.map((thing) => (
                <div key={thing.name}>
                  <div className="text-label flex justify-between font-semibold">
                    <span>{thing.name}</span>
                    <span className="text-muted-foreground tabular-nums">{thing.taps}</span>
                  </div>
                  <div className="bg-brand-violet-wash mt-1.5 h-1.5 overflow-hidden rounded-[3px]">
                    <div
                      data-bar={thing.bar}
                      className="bg-brand-violet h-full w-0 rounded-[3px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Band>

      {/* ── Own store + collabs ── */}
      <Band
        ground="wash"
        className="z-[4]"
        eyebrowTone="deep"
        eyebrowText="Beyond affiliate"
        title="Sell your own things too."
      >
        <div className="mt-[38px] grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-start gap-3.5">
          <div data-rev={1} className={cn(card, "overflow-hidden")}>
            <div className="relative h-[210px]">
              <Image
                src="/landing/posts/scrunchies.jpg"
                alt="Scrunchie set — the creator's own line"
                fill
                sizes="(min-width: 900px) 520px, 90vw"
                className="object-cover"
              />
              <span className="bg-brand-ink/85 rounded-pill text-pico absolute left-2.5 top-2.5 px-[9px] py-[5px] font-mono uppercase tracking-[0.08em] text-white">
                Their own product
              </span>
            </div>
            <div className="px-[18px] pb-[18px] pt-4">
              <p className="text-copy font-semibold">Maya Studio scrunchie set</p>
              <div className="mt-3 flex items-center justify-between gap-2.5">
                <span className="font-display text-body font-bold tabular-nums">₹640</span>
                <span className={pill({ tone: "violet", size: "md" })}>Shop their store</span>
              </div>
              <p className="text-faint text-micro mt-2.5">
                Same card, honest label, button goes to your store. No commission language.
              </p>
            </div>
          </div>

          <div data-rev={2} className="flex flex-col gap-3.5">
            <div className={cn(card, "p-6")}>
              <p className={eyebrow({ tone: "deep", track: "tight" })}>Coupons ride along</p>
              <p className="text-muted-foreground text-copy mt-2 leading-[1.6]">
                Add a code, an expiry, or an in-store note to any product. Expired offers collapse
                to &ldquo;Offer ended&rdquo; — the product never disappears.
              </p>
              <div className="mt-3.5 flex items-center gap-2">
                <CodeChip code="MAYA10" />
                <span className="text-faint text-nano">Valid till 30 Aug · tap to copy</span>
              </div>
            </div>
            <div className="bg-brand-ink rounded-card p-6 text-white">
              <p className={eyebrow({ tone: "lime", track: "tight" })}>And when brands call</p>
              <p className="text-copy mt-2 leading-[1.6] text-white/70">
                Businesses post requirements, you answer. One thread for content, price and
                deadline — both sides accept terms. Payment settles off-platform.
              </p>
            </div>
          </div>
        </div>
      </Band>

      <ClaimPanel
        ground="violet"
        headline="Your five minutes"
        headlineSecond="start whenever."
        micro="Email sign-in · up to 5 profiles · invite 3 managers"
        crossLead="Just shopping?"
        crossLabel="See the shopper side"
        onCross={() => onSwitch("shopper")}
        footer={
          <LandingFooter
            tagline={
              <>
                Shoppable creator pages.
                <br />
                Your followers never need an account to shop.
              </>
            }
            links={[
              { label: "Explore", href: "/explore" },
              { label: "For business", onClick: () => onSwitch("business") },
              { label: "How it works", href: "/how-it-works" },
              { label: "Support & feedback", href: "/support" },
            ]}
          />
        }
      >
        <span className="rounded-pill flex flex-wrap items-center justify-center border border-white/25 bg-white/10 py-1.5 pl-5 pr-1.5">
          <span className="text-label font-mono text-white/75">plugfolio.app/</span>
          <span className="text-label font-mono text-white">
            yourname
            <span
              aria-hidden
              className="bg-accent -mb-0.5 ml-0.5 inline-block h-4 w-2 motion-safe:animate-blink"
            />
          </span>
          <Link
            href="/join?as=creator"
            className={pill({ tone: "lime", size: "md", className: "ml-3.5" })}
          >
            Claim it
          </Link>
        </span>
      </ClaimPanel>
    </>
  );
}
