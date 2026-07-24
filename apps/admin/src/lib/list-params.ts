import type { PageQuery } from "@plugfolio/core";

/**
 * Shared list-screen URL grammar: ?q=…&status=…&page=N. Search resets the
 * page; hrefs preserve the rest so results stay shareable (design §3.3).
 */
export const PAGE_SIZE = 25;

export type ListParams = { q?: string; status?: string; page?: string };

export function pageQuery(params: ListParams): PageQuery {
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  return { page, pageSize: PAGE_SIZE };
}

/** Builds the Pager href callback preserving the active query + filters. */
export function pagedHref(basePath: string, params: ListParams): (page: number) => string {
  return (page) => {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.status) search.set("status", params.status);
    if (page > 1) search.set("page", String(page));
    const qs = search.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
}

/** Narrows a raw ?status= value to one of the screen's known filters. */
export function statusFilter<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}
