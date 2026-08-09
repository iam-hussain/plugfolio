"use client";

import Image from "next/image";
import { Screen } from "./landing-journey";

/**
 * The creator journey's four phone faces (design `s2`, creator): the live
 * profile, the dashboard's first tap, the first coupon copy, and the first
 * brand thread. Copy and layout follow the prototype line for line.
 */
export function CreatorScreens() {
  return (
    <>
      <Screen i={0} className="bg-background">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <span className="rounded-pill relative block size-16 overflow-hidden">
            <Image
              src="/landing/avatars/maya.jpg"
              alt="Maya Rao's avatar"
              fill
              sizes="64px"
              className="object-cover"
            />
          </span>
          <p className="font-display text-body font-bold">@mayarao</p>
          <p className="border-border bg-muted rounded-pill text-nano border px-3.5 py-[9px] font-mono">
            plugfolio.app/mayarao
          </p>
          <span className="bg-accent text-accent-foreground rounded-pill text-pico inline-flex items-center gap-1.5 px-[11px] py-[7px] font-mono font-bold uppercase tracking-[0.12em]">
            <span aria-hidden className="bg-accent-foreground rounded-pill size-[5px] motion-safe:animate-blink" />
            Live
          </span>
        </div>
      </Screen>

      <Screen i={1} className="bg-background">
        <div className="bg-muted absolute inset-0 flex flex-col gap-2.5 px-3 pb-4 pt-11">
          <p className="text-muted-foreground text-pico px-1 font-mono uppercase tracking-[0.18em]">
            Dashboard · today
          </p>
          <div className="border-border bg-background rounded-image border p-4">
            <p className="text-muted-foreground text-pico font-mono uppercase tracking-eyebrow">
              Taps out
            </p>
            <p className="font-display text-stat mt-1 font-extrabold tracking-[-0.04em]">12</p>
          </div>
          <div className="border-border bg-background rounded-image flex items-center gap-2.5 border p-3">
            <span className="relative block h-11 w-[38px] shrink-0 overflow-hidden rounded-sm">
              <Image
                src="/landing/posts/fashion.jpg"
                alt=""
                fill
                sizes="38px"
                className="object-cover"
              />
            </span>
            <span className="flex-1">
              <span className="text-nano block font-semibold">Linen overshirt</span>
              <span className="text-muted-foreground text-pico block">
                09:14 · tap → The Folk Store
              </span>
            </span>
            <span aria-hidden className="bg-accent border-brand-ink rounded-pill size-2 border" />
          </div>
          <p className="text-faint text-nano px-1 leading-[1.5]">
            Nothing about the shopper is stored — just the tap.
          </p>
        </div>
      </Screen>

      <Screen i={2} className="bg-background">
        <div className="absolute inset-0 flex flex-col justify-center gap-3 px-3.5 py-5">
          <div className="border-border rounded-image flex items-center gap-2.5 border p-3.5">
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
              <span className="text-muted-foreground text-nano mt-0.5 block">₹2,190</span>
            </span>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="bg-brand-ink text-accent text-nano rounded-md px-3.5 py-2.5 font-mono font-bold tracking-[0.06em]">
              MAYA10 · Copied ✓
            </span>
            <span className="text-faint text-nano">in-store · shown at the counter</span>
          </div>
          <p className="text-muted-foreground text-nano leading-[1.6]">
            Copies count beside taps in Earnings — labeled{" "}
            <span className="text-pico font-mono">redemption not tracked</span>.
          </p>
        </div>
      </Screen>

      <Screen i={3} className="bg-brand-violet">
        <div className="absolute inset-0 flex flex-col justify-center gap-3 px-3.5 py-5 text-white">
          <p className="text-accent text-pico font-mono uppercase tracking-[0.18em]">
            Collab thread · new
          </p>
          <div className="bg-background text-foreground rounded-[16px_16px_16px_4px] p-3.5">
            <p className="text-nano font-bold">The Folk Store</p>
            <p className="text-muted-foreground text-micro mt-1 leading-[1.55]">
              Loved your reels — 2 posts, ₹18k, 14 days?
            </p>
          </div>
          <div className="bg-accent text-accent-foreground font-display text-label rounded-pill p-3 text-center font-semibold">
            Accept terms
          </div>
          <p className="text-nano text-center text-white/75">Payment settles off-platform.</p>
        </div>
      </Screen>
    </>
  );
}
