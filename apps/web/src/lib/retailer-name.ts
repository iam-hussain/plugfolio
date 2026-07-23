/** "opens Fluxwear"-style retailer label from an affiliate URL's hostname. */
export function retailerName(affiliateUrl: string): string {
  try {
    return new URL(affiliateUrl).hostname.replace(/^www\./, "");
  } catch {
    return "the retailer";
  }
}
