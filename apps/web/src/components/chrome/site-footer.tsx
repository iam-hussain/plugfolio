import type { Route } from "next";
import Link from "next/link";
import { cn, measure } from "@plugfolio/ui";

/**
 * The site footer (v2, ADR-0026) — four columns over a single hairline: the
 * brand blurb, then Shop / Make / Company link stacks under Space Mono
 * eyebrows. v2 carries it only on the marketing landing (every other screen
 * ends at the pill nav), so `ShopperShell` no longer renders it.
 */
type Column = { title: string; links: readonly { label: string; href: Route }[] };

const COLUMNS: readonly Column[] = [
  {
    title: "Shop",
    links: [
      { label: "Explore", href: "/explore" as Route },
      { label: "Following", href: "/following" as Route },
      { label: "Saved", href: "/saved" as Route },
    ],
  },
  {
    title: "Make",
    links: [
      { label: "Become a creator", href: "/join" as Route },
      { label: "Dashboard", href: "/dashboard" as Route },
      { label: "Collabs", href: "/collabs" as Route },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "How it works", href: "/how-it-works" as Route },
      { label: "For creators", href: "/for-creators" as Route },
      { label: "For business", href: "/for-business" as Route },
      { label: "Support & feedback", href: "/support" as Route },
    ],
  },
];

export type SiteFooterProps = {
  /** Kept for call-site compatibility; v2's footer carries no sign-off line. */
  note?: string | null;
};

export function SiteFooter(_props: SiteFooterProps = {}) {
  return (
    <footer className="border-border border-t">
      <div
        className={cn(
          measure(),
          "grid grid-cols-2 gap-6 pb-8 pt-6 lg:grid-cols-[2fr_1fr_1fr_1fr]",
        )}
      >
        <div className="col-span-2 lg:col-span-1">
          <Link
            href="/"
            className="font-display text-body inline-flex items-end font-bold tracking-[-0.045em]"
          >
            plugfolio
            <span aria-hidden className="bg-primary mb-1 ml-0.5 size-1 rounded-[1px]" />
          </Link>
          <p className="text-faint text-micro mt-1.5 leading-normal">
            Shoppable creator pages.
            <br />
            Shopping never needs an account.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="text-faint text-pico tracking-eyebrow font-mono font-bold uppercase">
              {column.title}
            </h2>
            <ul className="mt-2.5 flex flex-col gap-1">
              {column.links.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground text-label inline-flex min-h-8 items-center transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
