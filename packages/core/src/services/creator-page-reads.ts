import type {
  CreatorPage,
  CreatorPageReadRepository,
  ShopperPost,
  ShopperProductView,
} from "../ports/creator-page-repository";

/**
 * Read use-cases for the shopper surface. Public RSC pages call these directly
 * (no HTTP hop — §6.11); a missing entity is `null`, which the page maps to
 * notFound(). Thin today by design: pass-throughs until read rules accrue
 * (publish filtering, pagination), so pages still never touch a repository.
 */
export type CreatorPageReadDeps = {
  creatorPages: CreatorPageReadRepository;
};

export async function getCreatorPage(
  deps: CreatorPageReadDeps,
  username: string,
): Promise<CreatorPage | null> {
  return deps.creatorPages.findByUsername(username);
}

export async function getShopperPost(
  deps: CreatorPageReadDeps,
  username: string,
  postId: string,
): Promise<ShopperPost | null> {
  return deps.creatorPages.findPost(username, postId);
}

export async function getShopperProduct(
  deps: CreatorPageReadDeps,
  username: string,
  productId: string,
): Promise<ShopperProductView | null> {
  return deps.creatorPages.findProduct(username, productId);
}
