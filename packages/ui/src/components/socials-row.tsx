import * as React from "react";
import { Globe } from "lucide-react";
import { cn } from "../lib/cn";

/**
 * The creator's outbound identity links (DESIGN creator.html §.social).
 *
 * Circular and icon-only on purpose: they must never be mistaken for the
 * rectangular text chips that filter the grid below them. One is a way off the
 * page, the other rearranges it.
 *
 * Brand glyphs stay hand-drawn — lucide dropped its brand icons (§8's icon
 * rule); the generic `website` uses Globe.
 */
export type SocialPlatform = "instagram" | "youtube" | "tiktok" | "facebook" | "website";

export type SocialLink = {
  platform: SocialPlatform;
  href: string;
  /** Accessible label, e.g. "Instagram" or the site name. */
  label: string;
};

function BrandIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-[17px]"
    >
      {children}
    </svg>
  );
}

const ICONS: Record<SocialPlatform, React.ReactNode> = {
  instagram: (
    <BrandIcon>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </BrandIcon>
  ),
  youtube: (
    <BrandIcon>
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
    </BrandIcon>
  ),
  tiktok: (
    <BrandIcon>
      <path d="M14 3v11a4 4 0 1 1-4-4" />
      <path d="M14 6.5c1 1.6 2.6 2.5 4.5 2.5" />
    </BrandIcon>
  ),
  facebook: (
    <BrandIcon>
      <path d="M14.5 8.5h2V6h-2c-1.7 0-2.8 1.1-2.8 2.9v1.6H9.8V13h1.9v6h2.4v-6h2l.4-2.5h-2.4V9.2c0-.5.2-.7.8-.7" />
    </BrandIcon>
  ),
  website: <Globe aria-hidden strokeWidth={2} className="size-[17px]" />,
};

/** One brand glyph for reuse outside the row (connect buttons, empty states). */
export function SocialGlyph({ platform }: { platform: SocialPlatform }) {
  return <>{ICONS[platform]}</>;
}

export type SocialsRowProps = {
  links: readonly SocialLink[];
  /**
   * v2 (ADR-0026): the default is label pills — mono uppercase with the ↗
   * mark, unmistakable as ways OFF the page. `icons` keeps the circles for
   * creators who prefer them (the appearance set's "link row" axis).
   */
  mode?: "labels" | "icons";
  className?: string;
};

export function SocialsRow({ links, mode = "labels", className }: SocialsRowProps) {
  if (links.length === 0) return null;
  if (mode === "icons") {
    return (
      <ul className={cn("flex flex-wrap gap-2", className)}>
        {links.map((link) => (
          <li key={`${link.platform}-${link.href}`}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer me"
              aria-label={link.label}
              title={link.label}
              className="border-border-strong text-muted-foreground hover:border-primary hover:text-primary rounded-pill ease-design grid size-[38px] place-items-center border transition-colors duration-200"
            >
              {ICONS[link.platform]}
            </a>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className={cn("flex flex-wrap gap-[7px]", className)}>
      {links.map((link) => (
        <li key={`${link.platform}-${link.href}`}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer me"
            className="border-border-strong text-muted-foreground hover:border-primary hover:text-primary rounded-pill text-pico tracking-eyebrow ease-design inline-flex h-[34px] items-center gap-1.5 border px-[13px] font-mono font-bold uppercase transition-colors duration-200"
          >
            {link.label} <span aria-hidden className="opacity-50">↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
