"use client";

import { PlugMark } from "@plugfolio/ui";
import * as React from "react";
import { useLandingScroll } from "../hooks/use-landing-scroll";
import { LandingTopBar } from "./landing-chrome";
import { BusinessView } from "./landing-view-business";
import { CreatorView } from "./landing-view-creator";
import { ShopperView } from "./landing-view-shopper";

/**
 * Landing (/) — the Scroll V3 Dual scroll story (ADR-0027, `Plugfolio Scroll
 * V3 Dual.dc.html`): one page, three sides. Shopper is the default; the top
 * bar's toggle and the footer links switch sides in place behind a lime+violet
 * wipe, and the URL follows (/, /for-creators, /for-business) so each side
 * stays deep-linkable. Every claim on all three sides must be true of the
 * shipped product (§2).
 */

export type LandingRole = "shopper" | "creator" | "business";

export type LandingViewProps = {
  onSwitch: (role: LandingRole) => void;
  scrollToJourney: () => void;
  scrollToClaim: () => void;
};

const ROLE_PATH: Record<LandingRole, string> = {
  shopper: "/",
  creator: "/for-creators",
  business: "/for-business",
};

const ROLE_LABEL: Record<LandingRole, string> = {
  shopper: "Shopper view",
  creator: "Creator view",
  business: "Business view",
};

const WIPE_EASE = "cubic-bezier(.72,0,.18,1)";

export function LandingPage({ defaultRole = "shopper" }: { defaultRole?: LandingRole }) {
  const [role, setRole] = React.useState<LandingRole>(defaultRole);
  const [wipeLabel, setWipeLabel] = React.useState(ROLE_LABEL[defaultRole]);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const wipeViolet = React.useRef<HTMLDivElement>(null);
  const wipeLime = React.useRef<HTMLDivElement>(null);
  const switching = React.useRef(false);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  useLandingScroll(rootRef, role);
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  const land = (next: LandingRole) => {
    window.scrollTo(0, 0);
    setRole(next);
    window.history.replaceState(null, "", ROLE_PATH[next]);
  };

  /** The design's full-screen lime+violet wipe between sides. */
  const switchRole = (next: LandingRole) => {
    if (next === role || switching.current) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      land(next);
      return;
    }
    const violet = wipeViolet.current;
    const lime = wipeLime.current;
    if (!violet || !lime) {
      land(next);
      return;
    }
    switching.current = true;
    setWipeLabel(ROLE_LABEL[next]);
    lime.style.transition = `transform .5s ${WIPE_EASE}`;
    violet.style.transition = `transform .5s ${WIPE_EASE} .08s`;
    lime.style.transform = "translateY(0)";
    violet.style.transform = "translateY(0)";
    later(() => {
      land(next);
      later(() => {
        violet.style.transition = `transform .55s ${WIPE_EASE}`;
        lime.style.transition = `transform .55s ${WIPE_EASE} .08s`;
        violet.style.transform = "translateY(-102%)";
        lime.style.transform = "translateY(-102%)";
        later(() => {
          violet.style.transition = lime.style.transition = "none";
          violet.style.transform = lime.style.transform = "translateY(102%)";
          switching.current = false;
        }, 720);
      }, 380);
    }, 640);
  };

  const scrollTo = (name: string, offset = 0) => {
    const el = rootRef.current?.querySelector(`[data-lp="${name}"]`);
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY + offset,
      behavior: "smooth",
    });
  };

  const viewProps: LandingViewProps = {
    onSwitch: switchRole,
    scrollToJourney: () => scrollTo("s2", window.innerHeight * 0.5),
    scrollToClaim: () => scrollTo("claim"),
  };

  const View =
    role === "creator" ? CreatorView : role === "business" ? BusinessView : ShopperView;

  return (
    <div ref={rootRef} className="bg-muted text-foreground overflow-x-clip font-sans">
      {/* The role-switch wipe — fixed, inert, above everything. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
        <div ref={wipeLime} className="bg-accent absolute -inset-px translate-y-[102%]" />
        <div
          ref={wipeViolet}
          className="bg-brand-violet absolute -inset-px flex translate-y-[102%] flex-col items-center justify-center gap-4"
        >
          <PlugMark tone="violet" size="xl" className="size-14" />
          <p className="text-nano font-mono font-bold uppercase tracking-[0.24em] text-white/85">
            {wipeLabel}
          </p>
        </div>
      </div>

      <LandingTopBar
        role={role}
        onSwitch={switchRole}
        onLogo={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        cta={
          role === "shopper"
            ? { label: "Explore products", href: "/explore" }
            : {
                label: role === "creator" ? "Claim your profile" : "Post a requirement",
                onClick: () => scrollTo("claim"),
              }
        }
      />

      <main id="main">
        <View {...viewProps} />
      </main>
    </div>
  );
}
