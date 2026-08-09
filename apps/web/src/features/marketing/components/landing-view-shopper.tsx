"use client";

import { cn } from "@plugfolio/ui";
import Image from "next/image";
import Link from "next/link";
import { Band, card, CodeChip, eyebrow, pill } from "./landing-bits";
import { LandingFooter } from "./landing-chrome";
import { ClaimPanel } from "./landing-cta";
import { LandingHero } from "./landing-hero";
import { LandingJourney } from "./landing-journey";
import type { LandingViewProps } from "./landing-page";
import { ShopperScreens } from "./landing-screens-shopper";

/** The shopper story (the default view): three taps, the honest card, the optional account. */

const STEPS = [
  {
    title: "Tap her link",
    copy: "Her Plugfolio link rides with the video — in the description or bio. Tap it. No sign-in gate, no app install.",
  },
  {
    title: "Tap the product",
    copy: "Her page opens with every post shoppable. The thing from the reel is right there — real price, real retailer.",
  },
  {
    title: "Buy at the retailer",
    copy: "Checkout happens on the store's own site. Plugfolio never touches your money.",
  },
  {
    title: "Zero accounts made",
    copy: "Sign in only if you want to follow or comment. Never to buy.",
  },
] as const;

const NEVER_ASK = [
  "A card number — payment happens at the retailer, never here.",
  "An account to shop — the buy path is never walled.",
  "An app — it's a page. It opens.",
] as const;

export function ShopperView({ onSwitch }: LandingViewProps) {
  return (
    <>
      <LandingHero
        ground="violet"
        badge="For shoppers"
        headline="Tap the post."
        limeLine="Own the thing."
        sub="Three taps from a creator's post to the retailer's checkout. No account, no app, no cart in between. Count them."
        cue="3 taps · scroll"
      >
        <Link href="/explore" className={pill({ tone: "ink" })}>
          Explore
        </Link>
        <button
          type="button"
          onClick={() => onSwitch("creator")}
          className={pill({ tone: "outlineLight" })}
        >
          I&rsquo;m a creator →
        </button>
      </LandingHero>

      <LandingJourney
        eyebrowText="The whole trip — three taps"
        title="Watch a purchase happen."
        steps={STEPS}
        screens={<ShopperScreens />}
      />

      {/* ── The card's three faces ── */}
      <Band
        ground="canvas"
        className="z-[3]"
        eyebrowText="What you'll actually tap"
        title="The card is honest before it's pretty."
        lede="Three faces, one rule: the button always leads out — to a real retailer or the creator's own store. Never a cart here."
      >
        <div className="mt-[38px] grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] items-start gap-3.5">
          <div data-rev={1} className="flex flex-col gap-2.5">
            <div className={cn(card, "overflow-hidden")}>
              <div className="relative h-[170px]">
                <Image
                  src="/landing/posts/store.jpg"
                  alt="A product photo"
                  fill
                  sizes="(min-width: 900px) 340px, 90vw"
                  className="object-cover"
                />
              </div>
              <div className="px-[18px] pb-[18px] pt-4">
                <p className="text-copy font-semibold">Linen overshirt</p>
                <div className="mt-3 flex items-center justify-between gap-2.5">
                  <span className="font-display text-body font-bold tabular-nums">₹2,190</span>
                  <span className={pill({ tone: "violet", size: "md" })}>Buy</span>
                </div>
              </div>
            </div>
            <p className="text-faint text-micro px-1.5 leading-[1.5]">
              The default. No labels, no commission talk — that&rsquo;s the creator&rsquo;s
              business, not noise on your screen.
            </p>
          </div>

          <div data-rev={2} className="flex flex-col gap-2.5">
            <div className={cn(card, "overflow-hidden")}>
              <div className="relative h-[170px]">
                <Image
                  src="/landing/posts/scrunchies.jpg"
                  alt="The creator's own product"
                  fill
                  sizes="(min-width: 900px) 340px, 90vw"
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
              </div>
            </div>
            <p className="text-faint text-micro px-1.5 leading-[1.5]">
              When it&rsquo;s her own line, the card says so — quietly, and the button goes to her
              store.
            </p>
          </div>

          <div data-rev={3} className="flex flex-col gap-2.5">
            <div className={cn(card, "p-[18px]")}>
              <div className="flex items-center gap-3">
                <span className="relative block h-[62px] w-[52px] shrink-0 overflow-hidden rounded-[10px]">
                  <Image
                    src="/landing/posts/fashion.jpg"
                    alt=""
                    fill
                    sizes="52px"
                    className="object-cover"
                  />
                </span>
                <span className="flex-1">
                  <span className="text-label block font-semibold">Linen overshirt</span>
                  <span className="text-muted-foreground text-micro mt-0.5 block">₹2,190</span>
                </span>
              </div>
              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <CodeChip code="MAYA10" />
                <span className="text-faint text-nano">Valid till 30 Aug · tap to copy</span>
              </div>
              <div className="mt-3 flex justify-end">
                <span className={pill({ tone: "violet", size: "md" })}>Buy</span>
              </div>
            </div>
            <p className="text-faint text-micro px-1.5 leading-[1.5]">
              Codes copy on the chip itself — no toast, no hunting. Expired offers fade to
              &ldquo;Offer ended&rdquo;; the product stays.
            </p>
          </div>
        </div>
      </Band>

      {/* ── The optional account ── */}
      <Band
        ground="wash"
        className="z-[4]"
        eyebrowTone="deep"
        eyebrowText="The only account here is optional"
        title="Sign in when you want a front row."
        lede="An account never buys you anything — it only remembers who you like."
      >
        <div className="mt-[38px] grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] items-start gap-3.5">
          <div data-rev={1} className={cn(card, "p-6")}>
            <p className={eyebrow({ tone: "deep", track: "tight" })}>Follow</p>
            <div className="mt-3.5 flex items-center gap-2.5">
              <span className="rounded-pill relative block size-[38px] shrink-0 overflow-hidden">
                <Image
                  src="/landing/avatars/maya.jpg"
                  alt=""
                  fill
                  sizes="38px"
                  className="object-cover"
                />
              </span>
              <span className="text-label flex-1 font-semibold">@mayarao</span>
              <span className="border-border font-display text-label rounded-pill border px-4 py-2 font-semibold">
                Following ✓
              </span>
            </div>
            <p className="text-muted-foreground text-label mt-3.5 leading-[1.6]">
              Every creator you follow lands in{" "}
              <span className="text-micro font-mono">/following</span> — a quiet page of just their
              shops. No algorithm, no feed of strangers.
            </p>
          </div>

          <div data-rev={2} className={cn(card, "p-6")}>
            <p className={eyebrow({ tone: "deep", track: "tight" })}>Comment</p>
            <div className="border-border text-faint text-label rounded-pill mt-3.5 flex items-center gap-2 border px-4 py-2.5">
              Loved this on you…
              <span
                aria-hidden
                className="bg-brand-violet inline-block h-3.5 w-[7px] motion-safe:animate-blink"
              />
            </div>
            <p className="text-muted-foreground text-label mt-3.5 leading-[1.6]">
              Comments carry a name, so they take a sign-in. It&rsquo;s one email — no password to
              invent.
            </p>
          </div>

          <div data-rev={3} className="bg-brand-ink rounded-card p-6 text-white">
            <p className={eyebrow({ tone: "lime", track: "tight" })}>What we never ask</p>
            <ul className="text-label mt-3.5 flex flex-col gap-2.5 leading-[1.5] text-white/75">
              {NEVER_ASK.map((line) => (
                <li key={line}>✕&nbsp; {line}</li>
              ))}
            </ul>
          </div>
        </div>
      </Band>

      <ClaimPanel
        ground="violet"
        headline="Three taps away,"
        headlineSecond="whenever you are."
        micro="No account to shop · sign in only to follow & comment"
        crossLead="A creator?"
        crossLabel="Switch to the creator side"
        onCross={() => onSwitch("creator")}
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
        <Link href="/explore" className={pill({ tone: "lime" })}>
          Explore products
        </Link>
        <span className="text-label rounded-pill border border-white/25 px-[18px] py-3 font-mono text-white/75">
          plugfolio.app/mayarao
        </span>
      </ClaimPanel>
    </>
  );
}
