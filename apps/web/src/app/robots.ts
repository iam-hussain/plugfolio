import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Shopping surfaces (/, /explore, /[handle], posts, products) stay open to
// crawlers — they're the SEO product (§4). Private/utility surfaces are not.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/collabs",
        "/account",
        "/following",
        "/signin",
        "/join",
        "/verify",
        "/forgot",
        "/reset",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
