/**
 * Display-only number formatting, shared by every app (web + admin) so a price
 * or a count reads the same everywhere. The retailer owns the real price; these
 * only present it.
 */

/** A localized currency string, or `null` when there is no price to show. */
export function formatPrice(priceCents: number | null, currency: string): string | null {
  if (priceCents === null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(priceCents / 100);
}

/** Compact count for stats — 1.2K / 3.4M style, per the design's mono meta. */
export function formatCount(count: number): string {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(
    count,
  );
}

/** A plain grouped integer — 1,204 — for exact figures (traffic, uses). */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en").format(value);
}
