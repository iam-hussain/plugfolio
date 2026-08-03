"use client";

import * as React from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cva } from "class-variance-authority";
import { cn } from "@plugfolio/ui";
import { BookmarkIcon, GridIcon, HeartIcon, HomeIcon, UserIcon } from "./icons";

/**
 * The morphing pill nav (ADR-0026 §6) — v2's signature chrome. One fixed,
 * centred ink pill at the bottom of every shopper screen. By default it wears
 * the five browse tabs; a page that needs its own verbs (a creator page's
 * Follow, a product's Buy) replaces the contents with `PillNavOverride`, and
 * the pill morphs rather than a second bar appearing.
 *
 * The override travels through context, not a DOM portal, so the default tabs
 * and the page's verbs can never render together.
 */
type Override = { node: React.ReactNode } | null;

const PillNavContext = React.createContext<{
  override: Override;
  setOverride: (o: Override) => void;
} | null>(null);

export function PillNavProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverride] = React.useState<Override>(null);
  const value = React.useMemo(() => ({ override, setOverride }), [override]);
  return <PillNavContext.Provider value={value}>{children}</PillNavContext.Provider>;
}

/** Rendered by a page (server or client) to take over the pill's contents. */
export function PillNavOverride({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(PillNavContext);
  const setOverride = ctx?.setOverride;
  React.useEffect(() => {
    if (!setOverride) return;
    setOverride({ node: children });
    return () => setOverride(null);
  }, [children, setOverride]);
  return null;
}

type Tab = {
  key: string;
  label: string;
  href: Route;
  icon: React.ComponentType<{ className?: string }>;
  match: (pathname: string) => boolean;
};

const TABS: Tab[] = [
  { key: "home", label: "Home", href: "/" as Route, icon: HomeIcon, match: (p) => p === "/" },
  {
    key: "shop",
    label: "Shop",
    href: "/explore" as Route,
    icon: GridIcon,
    match: (p) => p.startsWith("/explore"),
  },
  {
    key: "follow",
    label: "Follow",
    href: "/following" as Route,
    icon: HeartIcon,
    match: (p) => p.startsWith("/following"),
  },
  {
    key: "saved",
    label: "Saved",
    href: "/saved" as Route,
    icon: BookmarkIcon,
    match: (p) => p.startsWith("/saved"),
  },
  {
    key: "you",
    label: "You",
    href: "/account" as Route,
    icon: UserIcon,
    match: (p) => p.startsWith("/account"),
  },
];

const tabVariants = cva(
  "flex h-[52px] w-[62px] flex-col items-center justify-center rounded-lg transition-colors lg:w-[78px]",
  {
    variants: {
      active: {
        true: "bg-primary text-primary-foreground",
        false: "text-nav-foreground opacity-70 hover:opacity-100",
      },
    },
    defaultVariants: { active: false },
  },
);

/** The circular secondary action inside an override (share, save, back). */
export const pillNavCircle =
  "flex size-10 shrink-0 items-center justify-center rounded-pill bg-nav-sunk text-nav-foreground transition-transform hover:-translate-y-px";

/** The primary pill action inside an override (Follow, Buy). */
export const pillNavAction =
  "flex h-10 items-center justify-center whitespace-nowrap rounded-pill bg-primary px-5 font-display text-copy font-semibold text-primary-foreground transition-transform hover:-translate-y-px";

/** The quiet variant of the action pill (Following, In-store only). */
export const pillNavActionQuiet =
  "flex h-10 items-center justify-center whitespace-nowrap rounded-pill bg-nav-sunk px-5 font-display text-copy font-semibold text-nav-foreground transition-transform hover:-translate-y-px";

/** The thin divider between an override's zones. */
export function PillNavDivider() {
  return <span aria-hidden className="bg-nav-line h-[22px] w-px" />;
}

export function PillNav() {
  const pathname = usePathname() ?? "/";
  const ctx = React.useContext(PillNavContext);
  const override = ctx?.override ?? null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-3.5 pb-[18px]">
      <nav
        aria-label="Navigation"
        className="border-nav-edge bg-nav shadow-nav rounded-card pointer-events-auto max-w-full border"
      >
        {override ? (
          <div className="flex items-center gap-2 p-2">{override.node}</div>
        ) : (
          <ul className="flex items-center gap-0.5 p-1.5">
            {TABS.map((tab) => {
              const active = tab.match(pathname);
              const Glyph = tab.icon;
              return (
                <li key={tab.key} className="flex">
                  <Link
                    href={tab.href}
                    aria-current={active ? "page" : undefined}
                    className={tabVariants({ active })}
                  >
                    <Glyph className={cn("size-[19px]")} />
                    <span className="text-pico tracking-eyebrow mt-0.5 font-mono font-bold uppercase leading-none">
                      {tab.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </div>
  );
}
