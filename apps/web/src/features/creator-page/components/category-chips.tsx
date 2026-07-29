import type { PageCategory } from "@plugfolio/core";
import { cn } from "@plugfolio/ui";
import type { Route } from "next";
import Link from "next/link";

/**
 * Category chips row (ADR-0010): "All" + one chip per shelf, filtering the
 * grid via ?category=. Renders nothing for a profile with no categories —
 * the page must look exactly as before.
 */
export type CategoryChipsProps = {
  handle: string;
  categories: readonly PageCategory[];
  activeId: string | null;
};

function Chip({ href, active, children }: { href: Route; active: boolean; children: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        // Filters, not links out: square-shouldered (r-image) and text-led, so
        // they never read as the circular icon-only socials above them.
        "rounded-image inline-flex min-h-10 shrink-0 items-center border px-4 py-[9px] text-[13px] font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
      )}
    >
      {children}
    </Link>
  );
}

export function CategoryChips({ handle, categories, activeId }: CategoryChipsProps) {
  if (categories.length === 0) return null;
  const active = categories.find((category) => category.id === activeId) ?? null;

  return (
    <nav aria-label="Categories" className="pt-2">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip href={`/${handle}` as Route} active={!active}>
          All
        </Chip>
        {categories.map((category) => (
          <Chip
            key={category.id}
            href={`/${handle}?category=${category.id}` as Route}
            active={category.id === active?.id}
          >
            {category.title}
          </Chip>
        ))}
      </div>
      {active?.description ? (
        <p className="text-muted-foreground truncate pt-1 text-sm">{active.description}</p>
      ) : null}
    </nav>
  );
}
