"use client";

import { PlugMark } from "@plugfolio/ui";
import Image from "next/image";
import { Screen } from "./landing-journey";

/**
 * The shopper journey's four phone faces (design `s2`, shopper): the creator's
 * post, the product sheet, the retailer's checkout, and the "00 accounts made"
 * close. Copy and layout follow the prototype line for line.
 */
export function ShopperScreens() {
  return (
    <>
      <Screen i={0} className="bg-background">
        <Image
          src="/landing/posts/fashion.jpg"
          alt="A creator's outfit reel"
          fill
          sizes="300px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ink/65 to-transparent to-45%" />
        <div className="absolute inset-x-3.5 bottom-3.5 flex flex-col gap-2 text-white">
          <p className="font-display text-label font-bold">@mayarao</p>
          <p className="text-nano leading-[1.5] opacity-90">
            todays fit — everything linked below ↓
          </p>
          <span className="rounded-pill inline-flex items-center gap-[7px] self-start border border-white/35 bg-white/15 px-3 py-2 backdrop-blur-[6px]">
            <span aria-hidden className="bg-accent size-1.5 rounded-pill" />
            <span className="text-pico font-mono tracking-[0.06em]">plugfolio.app/mayarao</span>
          </span>
        </div>
      </Screen>

      <Screen i={1} className="bg-background">
        <div className="absolute inset-0 flex flex-col">
          <div className="relative flex-[1.1]">
            <Image
              src="/landing/posts/fashion.jpg"
              alt=""
              fill
              sizes="300px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-2 px-[18px] pb-5 pt-4">
            <p className="font-display text-body font-bold tracking-[-0.02em]">Linen overshirt</p>
            <p className="text-muted-foreground text-micro">On her page · The Folk Store</p>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="font-display text-title font-extrabold tabular-nums">₹2,190</span>
              <span className="bg-brand-violet font-display text-label rounded-pill px-[22px] py-2.5 font-semibold text-white">
                Buy →
              </span>
            </div>
          </div>
        </div>
      </Screen>

      <Screen i={2} className="bg-muted">
        <div className="absolute inset-0 flex flex-col">
          <div className="border-border bg-background rounded-pill mx-3 mt-10 flex items-center gap-[7px] border px-3 py-2">
            <span aria-hidden className="bg-accent border-brand-ink rounded-pill size-[7px] border" />
            <span className="text-pico font-mono">thefolkstore.com</span>
          </div>
          <div className="border-border bg-background rounded-image mx-3 mt-3.5 flex items-center gap-2.5 border p-3.5">
            <span className="relative block h-[52px] w-11 shrink-0 overflow-hidden rounded-sm">
              <Image
                src="/landing/posts/fashion.jpg"
                alt=""
                fill
                sizes="44px"
                className="object-cover"
              />
            </span>
            <span>
              <span className="text-micro block font-semibold">Linen overshirt</span>
              <span className="text-muted-foreground text-nano mt-0.5 block">Qty 1 · ₹2,190</span>
            </span>
          </div>
          <div className="mx-3 mb-[18px] mt-auto">
            <div className="text-muted-foreground text-micro flex justify-between px-1 pb-2.5">
              <span>Total</span>
              <span className="text-foreground font-bold">₹2,190</span>
            </div>
            <div className="bg-brand-ink font-display text-label rounded-pill p-[13px] text-center font-semibold text-white">
              Place order · on the retailer
            </div>
          </div>
        </div>
      </Screen>

      <Screen i={3} className="bg-brand-violet">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
          <PlugMark tone="violet" size="lg" />
          <p className="font-display text-accent text-display-xl font-extrabold leading-none tracking-[-0.04em]">
            00
          </p>
          <p className="text-pico font-mono uppercase tracking-[0.2em]">accounts made</p>
          <p className="text-micro max-w-[200px] leading-[1.6] text-white/80">
            The whole trip, and Plugfolio never asked who you are.
          </p>
        </div>
      </Screen>
    </>
  );
}
