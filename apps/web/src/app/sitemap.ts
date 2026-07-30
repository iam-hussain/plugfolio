import type { MetadataRoute } from "next";
import { exploreCreators } from "@plugfolio/core";
import { SITE_URL } from "@/lib/site";
import { repositories } from "@/server/container";

// The public surfaces search engines should crawl (§4). Creator pages are the
// SEO product, so they're listed from discovery — the read model exists now
// (exploreCreators). Private/utility routes are excluded here and disallowed in
// robots.ts. Never let a discovery read failure take the whole sitemap down.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/explore`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/how-it-works`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/for-creators`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/for-business`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/support`, changeFrequency: "monthly", priority: 0.3 },
  ];

  let creators: readonly { username: string }[] = [];
  try {
    creators = await exploreCreators({ discovery: repositories.discovery });
  } catch {
    creators = [];
  }
  const creatorRoutes: MetadataRoute.Sitemap = creators.map((creator) => ({
    url: `${SITE_URL}/${creator.username}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...creatorRoutes];
}
