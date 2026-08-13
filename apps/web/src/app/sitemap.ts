import type { MetadataRoute } from "next";
import { sitemapCreators } from "@plugfolio/core";
import { SITE_URL } from "@/lib/site";
import { repositories } from "@/server/container";

// The public surfaces search engines should crawl (§4). Creator pages, their
// posts and their products are the SEO product, so every visible one is listed
// (sitemapCreators: live profiles, visible posts, all their products). Posts
// and products carry createdAt as lastModified — they have no updatedAt.
// Private/utility routes are excluded here and disallowed in robots.ts. Never
// let a discovery read failure take the whole sitemap down.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/explore`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/how-it-works`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/for-creators`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/for-business`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/support`, changeFrequency: "monthly", priority: 0.3 },
  ];

  let creators: Awaited<ReturnType<typeof sitemapCreators>> = [];
  try {
    creators = await sitemapCreators({ discovery: repositories.discovery });
  } catch {
    creators = [];
  }

  const creatorRoutes: MetadataRoute.Sitemap = creators.flatMap((creator) => {
    const base = `${SITE_URL}/${creator.username}`;
    // The page's own lastModified is its freshest content.
    const latest = [...creator.posts, ...creator.products]
      .map((item) => item.createdAt)
      .sort((a, b) => b.getTime() - a.getTime())[0];
    return [
      {
        url: base,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        ...(latest ? { lastModified: latest } : {}),
      },
      ...creator.posts.map((post) => ({
        url: `${base}/post/${post.id}`,
        changeFrequency: "monthly" as const,
        priority: 0.6,
        lastModified: post.createdAt,
      })),
      ...creator.products.map((product) => ({
        url: `${base}/product/${product.id}`,
        changeFrequency: "monthly" as const,
        priority: 0.6,
        lastModified: product.createdAt,
      })),
    ];
  });

  return [...staticRoutes, ...creatorRoutes];
}
