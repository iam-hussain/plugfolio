/** Display-only price formatting; the retailer owns the real price. */
export function formatPrice(priceCents: number | null, currency: string): string | null {
  if (priceCents === null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(priceCents / 100);
}
