"use client";

import type { CommentSort } from "@plugfolio/core";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Recent · Oldest · Most helpful (lean journey). The order lives in the URL so
 * a shared link opens on the same thread the sender was reading, and so the
 * server keeps doing the sorting.
 *
 * The anchor is `#comments`: re-sorting shouldn't throw a reader back to the
 * top of a creator's whole page.
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
    <div role="group" aria-label="Sort comments" className="flex flex-wrap items-center gap-1.5">
      {OPTIONS.map((option) => {
        const active = option.value === sort;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => pick(option.value)}
            aria-pressed={active}
            className={`rounded-pill min-h-9 px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              active
                ? "bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary border"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
