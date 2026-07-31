"use client";

import type { FollowSort } from "@plugfolio/core";
import { NativeSelect, NativeSelectOption, SearchField } from "@plugfolio/ui";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Search then sort (design following.html). Filter chips were tried and cut:
 * with the list already grouped into new and quiet, the chips restated the
 * headings.
 *
 * Both write to the URL, so the server keeps doing the narrowing and a
 * shared/reloaded link lands on the same list. The search is debounced —
 * typing shouldn't fire a request per keystroke.
 */
const SORTS: readonly { value: FollowSort; label: string }[] = [
  { value: "new", label: "Most new first" },
  { value: "recent", label: "Recently followed" },
  { value: "oldest", label: "Longest followed" },
  { value: "az", label: "A–Z" },
];

const DEBOUNCE_MS = 300;

export type FollowingControlsProps = {
  search: string;
  sort: FollowSort;
};

export function FollowingControls({ search, sort }: FollowingControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(search);

  const push = (next: { q?: string; sort?: string }) => {
    const url = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) url.set(key, value);
      else url.delete(key);
    }
    // Any change re-narrows the list, so page 1 is the only sane landing.
    url.delete("page");
    router.replace(`${pathname}?${url.toString()}` as Route);
  };

  useEffect(() => {
    if (query === search) return;
    const timer = setTimeout(() => push({ q: query }), DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // `push` closes over the current params; re-running on query alone is the point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="mt-[clamp(20px,3vw,28px)] grid gap-3.5 min-[780px]:grid-cols-[minmax(0,1fr)_auto] min-[780px]:items-center">
      <SearchField
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search who you follow…"
        aria-label="Search the people you follow"
        autoComplete="off"
        className="max-w-[420px]"
        inputClassName="border-border bg-card rounded-pill h-[54px] pl-[46px] pr-5 text-copy"
        iconClassName="left-[18px] size-[19px]"
      />
      <div className="flex items-center gap-2.5">
        <label
          htmlFor="following-sort"
          className="text-muted-foreground text-micro whitespace-nowrap font-sans font-bold uppercase tracking-[0.06em]"
        >
          Sort
        </label>
        <NativeSelect
          id="following-sort"
          value={sort}
          onChange={(event) => push({ sort: event.target.value })}
          className="border-border bg-card rounded-pill text-copy h-[54px] pl-[18px] pr-10"
        >
          {SORTS.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}
