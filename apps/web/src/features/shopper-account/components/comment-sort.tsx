"use client";

import type { CommentSort } from "@plugfolio/core";
import { CommentSort as SortRow, SortButton } from "@plugfolio/ui";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Recent · Oldest · Most helpful (lean journey). The order lives in the URL so
 * a shared link opens on the same thread the sender was reading, and so the
 * server keeps doing the sorting.
 *
 * The anchor is `#comments`: re-sorting shouldn't throw a reader back to the
 * top of a creator's whole page.
 *
 * The chips are `SortButton` from the design system. This file used to redraw
 * them with a template-literal ternary, which is how they drifted off the
 * design's own hover and pressed states.
 */
const OPTIONS: readonly { value: CommentSort; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "oldest", label: "Oldest" },
  { value: "helpful", label: "Most helpful" },
];

export function CommentSortChips({ sort }: { sort: CommentSort }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const pick = (value: CommentSort) => {
    const url = new URLSearchParams(params.toString());
    if (value === "recent") url.delete("sort");
    else url.set("sort", value);
    // A new order means a new first page.
    url.delete("cpage");
    router.replace(`${pathname}?${url.toString()}#comments` as Route, { scroll: false });
  };

  return (
    <SortRow>
      {OPTIONS.map((option) => (
        <SortButton
          key={option.value}
          selected={option.value === sort}
          onClick={() => pick(option.value)}
        >
          {option.label}
        </SortButton>
      ))}
    </SortRow>
  );
}
