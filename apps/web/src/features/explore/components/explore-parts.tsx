import { Button } from "@plugfolio/ui";
import type { Route } from "next";
import Link from "next/link";
import { cva } from "class-variance-authority";
import type { ExploreTab } from "./explore-screen";

/** Shared bits of the Explore surface — the section header, the empty state,
 * and the URL builder — pulled out of `explore-screen.tsx` so the screen is
 * composition and these are the reusable parts. */

export function scopeHref(tab: ExploreTab, query: string): Route {
  const params = new URLSearchParams();
  if (tab !== "all") params.set("tab", tab);
  if (query) params.set("q", query);
  const qs = params.toString();
  return (qs ? `/explore?${qs}` : "/explore") as Route;
}

/** A results section takes breathing room only when something precedes it. */
const sectionHead = cva("flex items-baseline justify-between gap-4", {
  variants: { divided: { true: "mt-[26px]", false: "" } },
  defaultVariants: { divided: false },
});

/** One header shape for all three sections: name, count, and the way out. */
export function SectionHead({
  title,
  meta,
  href,
  divided,
}: {
  title: string;
  meta: string;
  /** The "see all" link — only on the All tab, where a section is a teaser. */
  href?: Route;
  divided: boolean;
}) {
  return (
    <div className={sectionHead({ divided })}>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-faint text-pico tracking-eyebrow font-mono font-bold uppercase">
          {title}
        </h2>
        <span className="text-faint text-nano">{meta}</span>
      </div>
      {href ? (
        <Link
          href={href}
          className="text-primary text-label whitespace-nowrap font-semibold hover:underline"
        >
          See all →
        </Link>
      ) : null}
    </div>
  );
}

export function Empty({
  title,
  copy,
  cta,
}: {
  title: string;
  copy: string;
  cta: { label: string; href: Route; primary?: boolean };
}) {
  return (
    <div className="border-border bg-card rounded-bay my-8 border p-[clamp(34px,6vw,64px)] text-center">
      <h2 className="font-display text-display-sm mx-auto max-w-[24ch] font-bold tracking-[-0.03em]">
        {title}
      </h2>
      <p className="text-muted-foreground text-copy mx-auto mt-3 max-w-[44ch] leading-[1.6]">
        {copy}
      </p>
      <Button variant={cta.primary ? "primary" : "secondary"} asChild className="mt-6">
        <Link href={cta.href}>{cta.label}</Link>
      </Button>
    </div>
  );
}
