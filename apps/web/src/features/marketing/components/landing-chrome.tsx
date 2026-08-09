"use client";

import { cn, Logo, Wordmark } from "@plugfolio/ui";
import { cva } from "class-variance-authority";
import type { Route } from "next";
import Link from "next/link";
import * as React from "react";
import type { LandingRole } from "./landing-page";
import { pill } from "./landing-bits";

/**
 * The landing's own chrome (ADR-0027): a scroll-revealed sticky top bar with
 * the Shopper/Creator toggle, and the compact single-row footer. The landing
 * is a scroll story, so it carries this instead of AppTopBar/SiteFooter — the
 * one sanctioned deviation from the shared-chrome rule.
 */

const toggleChip = cva(
  "rounded-pill text-pico cursor-pointer px-3.5 py-[7px] font-mono font-bold uppercase tracking-[0.1em] transition-colors duration-200",
  {
    variants: {
      active: {
        true: "bg-brand-ink text-white",
        false: "text-muted-foreground bg-transparent",
      },
    },
    defaultVariants: { active: false },
  },
);

export function LandingTopBar({
  role,
  onSwitch,
  onLogo,
  cta,
}: {
  role: LandingRole;
  onSwitch: (role: LandingRole) => void;
  onLogo: () => void;
  /** The role CTA — a real link (shopper → /explore) or a scroll action. */
  cta: FooterLink;
}) {
  const ctaCls = cn(pill({ tone: "violet", size: "md" }), "max-[599px]:hidden");
  return (
    <div
      data-lp="topbar"
      className="border-border bg-veil pointer-events-none sticky top-0 z-[60] -mb-[54px] -translate-y-2 border-b opacity-0 backdrop-blur-[14px] transition-[opacity,transform] duration-[350ms] ease-out"
    >
      <div className="flex items-center gap-3.5 px-[clamp(18px,5vw,48px)] py-[11px]">
        <button type="button" onClick={onLogo} className="cursor-pointer" aria-label="Back to top">
          <Logo tone="auto" markSize="sm" />
        </button>
        <div className="flex-1" />
        <div
          className="bg-brand-ink/[.07] rounded-pill flex items-center p-[3px]"
          role="group"
          aria-label="Choose your side"
        >
          <button
            type="button"
            onClick={() => onSwitch("shopper")}
            className={toggleChip({ active: role === "shopper" })}
          >
            Shopper
          </button>
          <button
            type="button"
            onClick={() => onSwitch("creator")}
            className={toggleChip({ active: role === "creator" })}
          >
            Creator
          </button>
        </div>
        {"href" in cta ? (
          <Link href={cta.href} className={ctaCls}>
            {cta.label}
          </Link>
        ) : (
          <button type="button" onClick={cta.onClick} className={ctaCls}>
            {cta.label}
          </button>
        )}
      </div>
    </div>
  );
}

export type FooterLink = { label: string } & ({ href: Route } | { onClick: () => void });

export function LandingFooter({
  tagline,
  links,
}: {
  tagline: React.ReactNode;
  links: readonly FooterLink[];
}) {
  const linkCls = "cursor-pointer text-label text-muted-foreground hover:text-foreground";
  return (
    <div
      data-rev={1}
      className="border-border mt-9 flex flex-wrap items-end justify-between gap-5 border-t px-1 pb-2.5 pt-6"
    >
      <div>
        <Wordmark tone="auto" className="text-body" />
        <p className="text-faint text-micro mt-1.5 leading-[1.5]">{tagline}</p>
      </div>
      <nav className="flex flex-wrap gap-5">
        {links.map((link) =>
          "href" in link ? (
            <Link key={link.label} href={link.href} className={linkCls}>
              {link.label}
            </Link>
          ) : (
            <button key={link.label} type="button" onClick={link.onClick} className={linkCls}>
              {link.label}
            </button>
          ),
        )}
      </nav>
    </div>
  );
}
