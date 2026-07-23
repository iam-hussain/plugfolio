import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/cn";

/**
 * Pager — the Admin-design numbered pagination row: "Showing X–Y of N" left,
 * prev / numbered pages / next right. Server-rendered links (GET params), no
 * client state. Page numbers collapse to first · around-current · last.
 */
export type PagerProps = {
  page: number;
  pageSize: number;
  total: number;
  /** Builds the href for a page number, e.g. (p) => `?q=…&page=${p}`. */
  hrefFor: (page: number) => string;
  className?: string;
};

const pageButton =
  "border-border-strong bg-background text-foreground hover:bg-muted inline-flex h-[30px] min-w-[30px] items-center justify-center rounded-[7px] border px-2 text-[13px] font-semibold";

function pageNumbers(page: number, pages: number): (number | "gap")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const around = [page - 1, page, page + 1].filter((p) => p > 1 && p < pages);
  const out: (number | "gap")[] = [1];
  if (around[0] && around[0] > 2) out.push("gap");
  out.push(...around);
  if (around.length && around[around.length - 1]! < pages - 1) out.push("gap");
  out.push(pages);
  return out;
}

export function Pager({ page, pageSize, total, hrefFor, className }: PagerProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-between gap-3 px-0.5 pt-4", className)}
    >
      <p className="text-muted-foreground text-xs tabular-nums">
        Showing {from.toLocaleString()}–{to.toLocaleString()} of {total.toLocaleString()}
      </p>
      <div className="flex items-center gap-1.5">
        {page > 1 ? (
          <a href={hrefFor(page - 1)} aria-label="Previous page" className={pageButton}>
            <ChevronLeft aria-hidden className="size-4" />
          </a>
        ) : null}
        {pageNumbers(page, pages).map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="text-faint px-1">
              …
            </span>
          ) : (
            <a
              key={p}
              href={hrefFor(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                pageButton,
                p === page && "bg-primary text-primary-foreground border-primary hover:bg-primary",
              )}
            >
              {p}
            </a>
          ),
        )}
        {page < pages ? (
          <a href={hrefFor(page + 1)} aria-label="Next page" className={pageButton}>
            <ChevronRight aria-hidden className="size-4" />
          </a>
        ) : null}
      </div>
    </nav>
  );
}
