import type { CategoryView } from "@plugfolio/core";
import { NativeSelectOption } from "@plugfolio/ui";

/**
 * The shelf option list (ADR-0010) — "None" first, then this profile's shelves.
 *
 * "None" leads on every one of them, and that ordering is the rule rather than
 * a default: assigning a shelf must never feel like a required step before a
 * post or a product can go live. It was hand-written in three places, which is
 * three chances for one of them to quietly drop it.
 */
export function ShelfOptions({ categories }: { categories: readonly CategoryView[] }) {
  return (
    <>
      <NativeSelectOption value="">None</NativeSelectOption>
      {categories.map((category) => (
        <NativeSelectOption key={category.id} value={category.id}>
          {category.title}
        </NativeSelectOption>
      ))}
    </>
  );
}
