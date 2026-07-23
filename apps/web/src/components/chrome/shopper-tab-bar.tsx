"use client";

import * as React from "react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cva } from "class-variance-authority";
import { GridIcon, HeartIcon, HomeIcon, UserIcon } from "./icons";

/**
 * Shopper bottom tab bar (Dev Spec §03 persistent chrome): HOME / SHOP /
 * FOLLOWING / ACCOUNT — Space Mono ~9px uppercase, 20px line icons. The active
 * tab renders in the page accent (primary). Every color comes from tokens.
 */
type Tab = {
  key: string;
  label: string;
  href: Route;
  icon: React.ComponentType<{ className?: string }>;
  /** Path prefixes that light this tab. */
  match: (pathname: string) => boolean;
};

const TABS: Tab[] = [
  { key: "home", label: "Home", href: "/", icon: HomeIcon, match: (p) => p === "/" },
  {
    key: "shop",
    label: "Shop",
    href: "/explore",
    icon: GridIcon,
    // Creator page, post, product and explore are all "shopping".
    match: (p) => p.startsWith("/explore") || isCreatorSurface(p),
  },
  {
    key: "following",
    label: "Following",
    href: "/following",
    icon: HeartIcon,
    match: (p) => p.startsWith("/following"),
  },
  {
    key: "account",
    label: "Account",
    href: "/account",
    icon: UserIcon,
    match: (p) => p.startsWith("/account") || p.startsWith("/signin"),
  },
];

// A creator surface is /[handle] and its post/product children — but not the
// reserved top-level shopper routes.
const RESERVED = ["/", "/explore", "/following", "/account", "/signin", "/dashboard", "/collabs"];
function isCreatorSurface(pathname: string): boolean {
  if (RESERVED.includes(pathname)) return false;
  return /^\/[^/]+(\/(post|product)\/[^/]+)?$/.test(pathname);
}

const tabVariants = cva(
  "flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors",
  {
    variants: {
      active: {
        true: "text-primary",
        false: "text-muted-foreground hover:text-foreground",
      },
    },
    defaultVariants: { active: false },
  },
);

export function ShopperTabBar() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Shopper navigation"
      className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky bottom-0 z-40 border-t backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          const Glyph = tab.icon;
          return (
            <li key={tab.key} className="flex flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={tabVariants({ active })}
              >
                <Glyph className="h-5 w-5" />
                <span className="tracking-eyebrow font-mono text-[9px] uppercase">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
