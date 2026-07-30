import type { PageCategory } from "@plugfolio/core";
import { ShelfChip, ShelfChips, ShelfDescription } from "@plugfolio/ui";
import type { Route } from "next";
import Link from "next/link";

/**
 * The shelf rail on a creator page (ADR-0010, DESIGN creator.html §.chips):
 * "All" plus one chip per shelf, filtering the grid via `?category=`.
 *
 * The chips themselves are the design system's (`ShelfChip`); this is the
 * feature's job — turning categories into routes and knowing which is active.
 * Renders nothing for a profile with no shelves.
 */
export type CategoryChipsProps = {
  handle: string;
  categories: readonly PageCategory[];
  activeId: string | null;
};

export function CategoryChips({ handle, categories, activeId }: CategoryChipsProps) {
  if (categories.length === 0) return null;
  const active = categories.find((category) => category.id === activeId) ?? null;

  return (
    <>
      <ShelfChips>
        <ShelfChip asChild selected={!active}>
          <Link href={`/${handle}` as Route}>All</Link>
        </ShelfChip>
        {categories.map((category) => (
          <ShelfChip key={category.id} asChild selected={category.id === active?.id}>
            <Link href={`/${handle}?category=${category.id}` as Route}>{category.title}</Link>
          </ShelfChip>
        ))}
      </ShelfChips>
      {active?.description ? <ShelfDescription>{active.description}</ShelfDescription> : null}
    </>
  );
}
