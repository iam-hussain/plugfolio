/** A URL's bare hostname (no leading `www.`), or null if it doesn't parse. */
export function hostname(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** "opens Fluxwear"-style retailer label from an affiliate URL's hostname. */
export function retailerName(affiliateUrl: string): string {
  return hostname(affiliateUrl) ?? "the retailer";
}
