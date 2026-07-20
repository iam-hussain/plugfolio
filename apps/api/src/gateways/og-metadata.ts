import type { ProductMetadata, ProductMetadataGateway } from "@plugfolio/core";

/**
 * "Plugfolio grabs the image, title, and price": a best-effort Open Graph
 * scrape of the pasted product URL. Returns null on any failure — the tag
 * service falls back rather than blocking the creator.
 *
 * ponytail: regex over the first 500KB of HTML, no parser dependency; a real
 * extraction pipeline (per-retailer adapters, oEmbed) lands when tagging
 * accuracy matters more than shipping.
 */
const FETCH_TIMEOUT_MS = 5_000;
const MAX_HTML_BYTES = 500_000;

function metaContent(html: string, property: string): string | null {
  const escaped = property.replace(/:/g, "\\:");
  return (
    new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']*)["']`, "i").exec(
      html,
    )?.[1] ??
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${escaped}["']`, "i").exec(
      html,
    )?.[1] ??
    null
  );
}

export function createOgMetadataGateway(): ProductMetadataGateway {
  return {
    async fetchMetadata(url: string): Promise<ProductMetadata | null> {
      try {
        const response = await fetch(url, {
          redirect: "follow",
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
          headers: { accept: "text/html" },
        });
        if (!response.ok) return null;
        const html = (await response.text()).slice(0, MAX_HTML_BYTES);

        const title =
          metaContent(html, "og:title") ?? /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1] ?? null;
        const imageUrl = metaContent(html, "og:image");
        const amount =
          metaContent(html, "og:price:amount") ?? metaContent(html, "product:price:amount");
        const parsed = amount === null ? Number.NaN : Number.parseFloat(amount);
        const priceCents = Number.isFinite(parsed) ? Math.round(parsed * 100) : null;
        const currency = (
          metaContent(html, "og:price:currency") ??
          metaContent(html, "product:price:currency") ??
          "usd"
        ).toLowerCase();

        if (!title && !imageUrl && priceCents === null) return null;
        return { title: title?.trim() || null, imageUrl, priceCents, currency };
      } catch {
        return null;
      }
    },
  };
}
