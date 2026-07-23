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
        "rounded-pill shrink-0 border px-[13px] py-[7px] font-mono text-[11px] font-bold",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground",
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
    <nav aria-label="Categories" className="pt-5">
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
