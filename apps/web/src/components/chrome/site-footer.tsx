import type { Route } from "next";
import Link from "next/link";
import { cn, measure } from "@plugfolio/ui";
import { Logo } from "@/components/brand";

/**
 * The one site footer (DESIGN `.foot`) — brand mark on the left, the way-out
 * links on the right, over a single hairline. Product-agnostic, so it lives in
 * chrome/ beside the top bar and tab bar; `ShopperShell` renders it on every
 * shopper surface, and the marketing and landing pages use it directly.
 *
 * The link set is shared on purpose. The design varies it slightly per page
 * (and drops the page's own link); reproducing that would make the footer a
 * client component just to read the pathname, for a link that harmlessly
 * points at where you already are. ponytail: add `usePathname` here if the
 * self-link ever actually bites.
 */
const LINKS: readonly { label: string; href: Route }[] = [
  { label: "Explore", href: "/explore" as Route },
  { label: "How it works", href: "/how-it-works" as Route },
  { label: "For creators", href: "/for-creators" as Route },
  { label: "For business", href: "/for-business" as Route },
  { label: "Help", href: "/support" as Route },
];

export type SiteFooterProps = {
  /** Overrides the brand sign-off; pass `null` to drop it. */
  note?: string | null;
};

export function SiteFooter({ note }: SiteFooterProps = {}) {
  // The sign-off the design carries on every shopper surface. Year is read,
  // not written — a stale one is the kind of thing nobody notices in January.
  const line =
    note === undefined ? `One link, everything shoppable · ${new Date().getFullYear()}` : note;
  return (
    <footer className="border-border border-t">
      <div
        className={cn(
          measure(),
          "flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 pb-[clamp(14px,2vw,22px)] pt-[clamp(22px,3vw,32px)]",
        )}
      >
        <Link href="/" aria-label="Plugfolio home" className="flex items-center">
          <Logo layout="horizontal" tone="auto" />
        </Link>
        <div className="flex flex-wrap items-center gap-x-5">
          {LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-muted-foreground hover:text-primary text-label inline-flex min-h-11 items-center py-3 font-semibold transition-colors"
            >
              {item.label}
            </Link>
          ))}
          {line ? (
            <span className="text-faint text-micro font-sans font-semibold uppercase tracking-[0.06em]">
              {line}
            </span>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
