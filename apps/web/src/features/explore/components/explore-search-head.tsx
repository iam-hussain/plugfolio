import { cn, measure } from "@plugfolio/ui";
import { Search } from "lucide-react";
import Link from "next/link";
import { cva } from "class-variance-authority";
import type { ExploreTab } from "./explore-screen";
import { scopeHref } from "./explore-parts";

/**
 * The v2 search head (ADR-0026): plain canvas, the card-filled field, the scope
 * chips and the mono result line. Search stays a plain GET form — no login, no
 * JS required (§2.2).
 */

/** v2 scope chips: 11px-radius, selected fills with the accent. */
const scopeChip = cva(
  "rounded-md flex min-h-11 shrink-0 items-center px-[15px] text-label font-semibold whitespace-nowrap transition-colors",
  {
    variants: {
      active: {
        true: "bg-primary text-primary-foreground border border-transparent",
        false:
          "border-border-strong text-foreground/80 hover:border-primary hover:text-primary border",
      },
    },
    defaultVariants: { active: false },
  },
);

const SHELVES: readonly { label: string; tab: ExploreTab }[] = [
  { label: "All", tab: "all" },
  { label: "Creators", tab: "creators" },
  { label: "Posts", tab: "posts" },
  { label: "Things", tab: "products" },
];

export function ExploreSearchHead({
  tab,
  query,
  count,
}: {
  tab: ExploreTab;
  query: string;
  count: string;
}) {
  return (
    <div className={cn(measure(), "pt-[22px]")}>
      <form action="/explore" method="get" role="search" className="flex gap-2.5">
        <label className="border-border-strong bg-card focus-within:border-primary flex h-[52px] flex-1 items-center gap-2.5 rounded-lg border px-[18px]">
          <Search aria-hidden className="size-[17px] shrink-0 opacity-50" />
          <span className="sr-only">Search captions, creators and things</span>
          <input
            type="search"
            name="q"
            maxLength={80}
            defaultValue={query}
            autoComplete="off"
            placeholder="Search captions, creators, things"
            // The design sets this at 15px — the copy step's desktop end,
            // not body's 17px.
            className="text-copy min-h-11 flex-1 bg-transparent focus:outline-none"
          />
          {query ? (
            <Link
              href={scopeHref(tab, "")}
              className="text-faint text-nano font-mono tracking-[0.06em]"
            >
              CLEAR
            </Link>
          ) : null}
        </label>
        <button type="submit" className="sr-only">
          Search
        </button>
      </form>

      <nav
        aria-label="Show"
        className="mt-3 flex gap-[7px] overflow-x-auto pb-0.5 [scrollbar-width:none]"
      >
        {SHELVES.map((shelf) => {
          const active = shelf.tab === tab;
          return (
            <Link
              key={shelf.tab}
              href={scopeHref(shelf.tab, query)}
              aria-current={active ? "true" : undefined}
              className={scopeChip({ active })}
            >
              {shelf.label}
            </Link>
          );
        })}
      </nav>

      <p className="text-faint text-nano mt-3.5 font-mono tracking-[0.06em]">{count}</p>
    </div>
  );
}
