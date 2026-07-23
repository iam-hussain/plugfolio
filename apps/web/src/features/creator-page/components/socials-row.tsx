import * as React from "react";
import { Globe } from "lucide-react";
import { cn } from "@plugfolio/ui";

/**
 * Creator-page socials row (Dev Spec §06 region 2, required): Instagram ·
 * YouTube · TikTok · Facebook · personal website. Icon-row default; authored in
 * dashboard Settings → "Your links" (connected socials auto-fill, others
 * pasted). Presentational — the page passes the links; empty renders nothing
 * (the owner's empty state, which points to Settings, lives on the page).
 *
 * Colors come from tokens; the row themes per surface via `text-*` utilities.
 */
export type SocialPlatform = "instagram" | "youtube" | "tiktok" | "facebook" | "website";

export type SocialLink = {
  platform: SocialPlatform;
  href: string;
  /** Accessible label, e.g. "Instagram" or the site name. */
  label: string;
};

/* Brand glyphs stay hand-drawn — lucide dropped its brand icons (§8 icon
   rule: lucide everywhere it has the icon; the generic `website` uses Globe). */
function BrandIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-5 w-5"
    >
      {children}
    </svg>
  );
}

const ICONS: Record<SocialPlatform, React.ReactNode> = {
  instagram: (
    <BrandIcon>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" />
    </BrandIcon>
  ),
  youtube: (
    <BrandIcon>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" />
    </BrandIcon>
  ),
  tiktok: (
    <BrandIcon>
      <path d="M14 3v10.2a3.2 3.2 0 1 1-2.6-3.14V12a1.5 1.5 0 1 0 1.1 1.45V3h1.5c.2 1.8 1.5 3.1 3.5 3.3v1.5c-1.3-.05-2.5-.45-3.5-1.15" />
    </BrandIcon>
  ),
  facebook: (
    <BrandIcon>
      <path d="M14.5 8.5h2V6h-2c-1.7 0-2.8 1.1-2.8 2.9v1.6H9.8V13h1.9v6h2.4v-6h2l.4-2.5h-2.4V9.2c0-.5.2-.7.8-.7" />
    </BrandIcon>
  ),
  website: <Globe aria-hidden strokeWidth={1.6} className="h-5 w-5" />,
};

export type SocialsRowProps = {
  links: SocialLink[];
  className?: string;
};

export function SocialsRow({ links, className }: SocialsRowProps) {
  if (links.length === 0) return null;

  return (
    <ul className={cn("flex items-center justify-center gap-4", className)}>
      {links.map((link) => (
        <li key={`${link.platform}-${link.href}`}>
          {/* External links use a plain anchor (outside the app's typed routes). */}
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2"
          >
            {ICONS[link.platform]}
          </a>
        </li>
      ))}
    </ul>
  );
}
