import type {
  AdPlacement,
  DiscoveryCreator,
  DiscoveryPost,
  DiscoveryProduct,
} from "@plugfolio/core";
import { AdSlot, AdSlotWhy } from "@plugfolio/ui";
import Image from "next/image";
import type { Route } from "next";
import { plural } from "@/lib/plural";
import { CreatorCard } from "./creator-card";
import { PostCard } from "./post-card";
import { ProductCard } from "./product-card";
import { SectionHead } from "./explore-parts";

/**
 * The three result sections of the Explore wall (DESIGN explore.html) — creators,
 * posts, things. Each is the same header shape over the same grid; split out of
 * `explore-screen.tsx` so the screen composes them and each owns its own grid.
 */

export function CreatorsSection({
  creators,
  href,
  divided,
}: {
  creators: readonly DiscoveryCreator[];
  href?: Route;
  divided: boolean;
}) {
  return (
    <section>
      <SectionHead
        title="Creators"
        meta={plural(creators.length, "page")}
        href={href}
        divided={divided}
      />
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {creators.map((creator) => (
          <CreatorCard key={creator.id} creator={creator} />
        ))}
      </div>
    </section>
  );
}

export function PostsSection({
  posts,
  query,
  ad,
  href,
  divided,
}: {
  posts: readonly DiscoveryPost[];
  query: string;
  ad?: AdPlacement | null;
  href?: Route;
  divided: boolean;
}) {
  return (
    <section>
      <SectionHead
        title={query ? "Posts" : "Latest posts"}
        meta={plural(posts.length, "post")}
        href={href}
        divided={divided}
      />
      {ad ? (
        <AdSlot
          href={ad.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          title={ad.title}
          description={ad.description}
          image={
            ad.imageUrl ? (
              /* ponytail: unoptimized until image domains are pinned */
              <Image
                src={ad.imageUrl}
                alt=""
                width={208}
                height={208}
                unoptimized
                className="size-full object-cover"
              />
            ) : null
          }
          why={
            <AdSlotWhy title="Placed by Plugfolio. Not a creator's pick, and not chosen from anything you did — this surface has no account to target against.">
              Why this?
            </AdSlotWhy>
          }
        />
      ) : null}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}

export function ProductsSection({
  products,
  href,
  divided,
}: {
  products: readonly DiscoveryProduct[];
  href?: Route;
  divided: boolean;
}) {
  return (
    <section>
      <SectionHead
        title="Things"
        meta={`${plural(products.length, "thing")} tagged`}
        href={href}
        divided={divided}
      />
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
