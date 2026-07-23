/**
 * Site-wide identity constants shared by metadata, robots, sitemap, the
 * manifest, and JSON-LD. NEXT_PUBLIC_SITE_URL overrides per environment
 * (build-time inlined — public config, not a secret, so not in env.ts).
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://plugfolio.com";

export const SITE_NAME = "Plugfolio";

export const SITE_TAGLINE = "Shop what your favorite creators post";

export const SITE_DESCRIPTION =
  "Shoppable creator pages. Follow a creator, tap any post, and buy it straight at the retailer — no account, no checkout, no friction.";
