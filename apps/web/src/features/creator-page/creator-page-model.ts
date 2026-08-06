import type { CreatorPage, CreatorProductRow, ProfileLinkView } from "@plugfolio/core";
import { toSocials, type SocialLink } from "./to-socials";

/**
 * The creator page's derivations, as a pure function (§5: this surface is a
 * Server Component, so its "what to show" is a helper, not a hook). Pulled out
 * of `CreatorPageView` so the filtering and counting read on their own and the
 * component is composition.
 */
export type CreatorPageModel = {
  socials: readonly SocialLink[];
  /** Posts after category filter — hidden ones already dropped. */
  posts: CreatorPage["posts"];
  /** Standalone products (no post behind them) after category filter. */
  products: readonly CreatorProductRow[];
  activeCategory: CreatorPage["categories"][number] | null;
  /** Posts + standalone products currently on the wall. */
  shopCount: number;
  /** Tag instances inside posts + the standalone products. */
  thingsCount: number;
  /** The profile the viewer speaks as by default (ADR-0009); null for a visitor. */
  defaultAsProfileId: string | null;
  cover: CreatorPage["coverStyle"];
};

export function buildCreatorPageModel({
  page,
  allProducts,
  links,
  category,
  identities,
}: {
  page: CreatorPage;
  allProducts: readonly CreatorProductRow[];
  links: readonly ProfileLinkView[];
  category?: string;
  identities: readonly { id: string; username: string }[];
}): CreatorPageModel {
  const socials = toSocials(links);

  // Hidden posts (brief 07) never reach visitors — only the dashboard shows
  // them. Category chips filter the rest (ADR-0010); "All" holds everything.
  const visiblePosts = page.posts.filter((post) => post.hiddenAt === null);
  // A shelf can also hold products the creator sells or recommends directly,
  // with no post behind them (design §"two kinds of thing, one wall"). Products
  // already tagged inside a post are shown via that post — not twice.
  const standaloneProducts = allProducts.filter((product) => product.postCount === 0);
  const activeCategory = page.categories.find((c) => c.id === category) ?? null;
  const posts = activeCategory
    ? visiblePosts.filter((post) => post.categoryId === activeCategory.id)
    : visiblePosts;
  const products = activeCategory
    ? standaloneProducts.filter((product) => product.categoryId === activeCategory.id)
    : standaloneProducts;
  const shopCount = posts.length + products.length;
  // "41 things tagged" — tag instances inside posts, which is what the phrase
  // means; the standalone products are already counted on their own.
  const thingsTagged = posts.reduce((total, post) => total + post.products.length, 0);

  // ADR-0009 default: on your own page you speak as the profile; the picker
  // lets a member choose otherwise, per comment.
  const defaultAsProfileId = identities.some((identity) => identity.id === page.id)
    ? page.id
    : null;

  // Stored, resolved at the read (ADR-0026): the drawer writes them, the
  // repository resolves nulls against the header style.
  const cover = page.coverStyle;
  const thingsCount = thingsTagged + products.length;

  return {
    socials,
    posts,
    products,
    activeCategory,
    shopCount,
    thingsCount,
    defaultAsProfileId,
    cover,
  };
}
