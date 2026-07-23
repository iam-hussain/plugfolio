import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// ponytail: static entries only — there is no public creator-listing read
// model yet (explore is a placeholder). When one lands, append the /[handle]
// pages here from that repository.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/explore`, changeFrequency: "weekly", priority: 0.6 },
  ];
}
