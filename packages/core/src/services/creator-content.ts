import { randomUUID } from "node:crypto";
import { AppError, ConflictError, ForbiddenError, NotFoundError } from "../errors";
import type { CategoryRepository, CategoryView } from "../ports/category-repository";
import type {
  ConnectionReadRepository,
  PostWriteRepository,
  ProductMetadataGateway,
  ProductWriteRepository,
} from "../ports/creator-content-repository";
import type { ProductReadRepository } from "../ports/product-repository";
import type { ProfileRepository, ProfileSummary } from "../ports/profile-repository";
import type {
  CreateCategoryInput,
  CreatePostInput,
  CreateProductInput,
  SetPostCategoryInput,
  SetPostHiddenInput,
  SetProductCategoryInput,
  SetProductCouponInput,
  TagProductInput,
  UpdateCategoryInput,
  UpdatePostInput,
  UpdateProductInput,
} from "../schemas/creator-content";

/**
 * The creator's back-room use-cases (lean journey): create a profile, post
 * content, tag products, fix links. Rules from ADR-0004: a profile needs at
 * least one connected social; an account holds at most 5 profiles; a random
 * username is assigned at creation so the page works instantly (picking a
 * social-derived handle lands with the social APIs).
 */
export type CreatorContentDeps = {
  profiles: ProfileRepository;
  connections: ConnectionReadRepository;
  posts: PostWriteRepository;
  products: ProductReadRepository;
  productWrites: ProductWriteRepository;
  categories: CategoryRepository;
  metadata: ProductMetadataGateway;
};

/** The category use-cases need only these two (ADR-0010). */
export type CategoryDeps = Pick<CreatorContentDeps, "profiles" | "categories">;

export const MAX_PROFILES_PER_ACCOUNT = 5;

async function requireOwnProfile(
  deps: Pick<CreatorContentDeps, "profiles">,
  userId: string,
  profileId: string,
): Promise<void> {
  // Admin OR Manager — posting and tagging are exactly what Managers are
  // invited for (ADR-0004); settings stay Admin-only elsewhere.
  const profiles = await deps.profiles.listAccessibleByUser(userId);
  if (!profiles.some((profile) => profile.id === profileId)) {
    throw new ForbiddenError("Not your profile");
  }
}

/** Random username so a page works instantly; collision odds are negligible.
 * Also what an admin username release falls back to (admin-app note). */
export function generateProfileUsername(): string {
  return `creator-${randomUUID().slice(0, 8)}`;
}

export async function createProfile(
  deps: CreatorContentDeps,
  userId: string,
): Promise<ProfileSummary> {
  // ADR-0004: at least one connected social proves the identity behind the page.
  if (!(await deps.connections.hasAny(userId))) {
    throw new ForbiddenError("Connect a Google or Meta account first");
  }
  if ((await deps.profiles.countByUser(userId)) >= MAX_PROFILES_PER_ACCOUNT) {
    throw new ConflictError(`An account holds at most ${MAX_PROFILES_PER_ACCOUNT} profiles`);
  }
  return deps.profiles.create({ userId, username: generateProfileUsername() });
}

/** The post's media + words, normalised once so create and update agree. */
function postContent(input: {
  mediaUrl: string;
  mediaKind?: string;
  embedUrl?: string | null;
  sourceUrl?: string | null;
  caption?: string | null;
  categoryId?: string | null;
}) {
  const mediaKind = input.mediaKind ?? "still";
  const isVideo = mediaKind !== "still";
  return {
    mediaUrl: input.mediaUrl,
    mediaKind,
    // A still has nothing to embed; keeping a stale embed on it would leave a
    // play button wired to the last video the post used to be.
    embedUrl: isVideo ? (input.embedUrl ?? null) : null,
    sourceUrl: isVideo ? (input.sourceUrl ?? null) : null,
    caption: input.caption ?? null,
    categoryId: input.categoryId ?? null,
  };
}

export async function createPost(
  deps: CreatorContentDeps,
  userId: string,
  input: CreatePostInput,
): Promise<{ id: string }> {
  await requireOwnProfile(deps, userId, input.profileId);
  // It goes live as soon as it's added — publish-free, no draft state (§5.20).
  return deps.posts.create({ profileId: input.profileId, ...postContent(input) });
}

/** Edit the post itself: its still, its video, its words, its shelf. */
export async function updatePost(
  deps: CreatorContentDeps,
  userId: string,
  postId: string,
  profileId: string,
  input: UpdatePostInput,
): Promise<void> {
  await requireOwnProfile(deps, userId, profileId);
  if (!(await deps.posts.belongsToProfile(postId, profileId))) {
    throw new NotFoundError("Post not found");
  }
  await deps.posts.update(postId, postContent(input));
}

/** The core tool: paste a product URL, grab its metadata, tag it to the post.
 * ADR-0011: kind + optional coupon ride along; the channel rule (a link, or a
 * coupon with an in-store note) is enforced by the boundary schema. */
export async function tagProductToPost(
  deps: CreatorContentDeps,
  userId: string,
  input: TagProductInput,
): Promise<{ id: string }> {
  await requireOwnProfile(deps, userId, input.profileId);
  if (!(await deps.posts.belongsToProfile(input.postId, input.profileId))) {
    throw new NotFoundError("Post not found");
  }

  // Grab what we can; a page we can't read never blocks the tag.
  const metadata = await deps.metadata.fetchMetadata(input.url);
  const fallbackTitle = new URL(input.url).hostname;

  return deps.productWrites.createTagged({
    profileId: input.profileId,
    postId: input.postId,
    kind: input.kind,
    title: metadata?.title ?? fallbackTitle,
    sourceUrl: input.url,
    affiliateUrl: input.affiliateUrl ?? null,
    couponCode: input.couponCode ?? null,
    offerEndsAt: input.offerEndsAt ?? null,
    inStoreNote: input.inStoreNote ?? null,
    imageUrl: metadata?.imageUrl ?? null,
    priceCents: metadata?.priceCents ?? null,
    currency: metadata?.currency ?? "usd",
    categoryId: null,
  });
}

/**
 * The same product, made from the library instead of from a post. A product
 * isn't owned by the post it was tagged on — it can sit on several, or on none
 * (an in-store code has nowhere to be tagged), so it has to be creatable here.
 */
export async function createProduct(
  deps: CreatorContentDeps,
  userId: string,
  input: CreateProductInput,
): Promise<{ id: string }> {
  await requireOwnProfile(deps, userId, input.profileId);

  const metadata = await deps.metadata.fetchMetadata(input.url);
  // A page we can't read never blocks the product — it's titled by its site.
  const fallbackTitle = new URL(input.url).hostname;

  return deps.productWrites.create({
    profileId: input.profileId,
    kind: input.kind,
    title: metadata?.title ?? fallbackTitle,
    sourceUrl: input.url,
    affiliateUrl: input.affiliateUrl ?? null,
    couponCode: input.couponCode ?? null,
    offerEndsAt: input.offerEndsAt ?? null,
    inStoreNote: input.inStoreNote ?? null,
    imageUrl: metadata?.imageUrl ?? null,
    priceCents: metadata?.priceCents ?? null,
    currency: metadata?.currency ?? "usd",
    categoryId: input.categoryId ?? null,
  });
}

/**
 * Connect an existing product to a post. Copies nothing: change a price once
 * and every post carrying it changes with it.
 */
export async function connectProductToPost(
  deps: CreatorContentDeps,
  userId: string,
  postId: string,
  productId: string,
): Promise<void> {
  const product = await deps.products.findForAttribution(productId);
  if (!product) throw new NotFoundError("Product not found");
  await requireOwnProfile(deps, userId, product.profileId);
  // A product can only be pinned onto its own profile's post.
  if (!(await deps.posts.belongsToProfile(postId, product.profileId))) {
    throw new NotFoundError("Post not found");
  }
  await deps.productWrites.connectToPost(productId, postId);
}

/**
 * Take a product off a post. Deliberately not a delete: the product is still
 * yours and may sit on other posts — this only removes one connection.
 */
export async function disconnectProductFromPost(
  deps: CreatorContentDeps,
  userId: string,
  postId: string,
  productId: string,
): Promise<void> {
  const product = await deps.products.findForAttribution(productId);
  if (!product) throw new NotFoundError("Product not found");
  await requireOwnProfile(deps, userId, product.profileId);
  await deps.productWrites.disconnectFromPost(productId, postId);
}

async function requireOwnProduct(
  deps: Pick<CreatorContentDeps, "products" | "profiles">,
  userId: string,
  productId: string,
): Promise<void> {
  const product = await deps.products.findForAttribution(productId);
  if (!product) throw new NotFoundError("Product not found");
  await requireOwnProfile(deps, userId, product.profileId);
}

export async function updateProductAffiliateUrl(
  deps: CreatorContentDeps,
  userId: string,
  productId: string,
  affiliateUrl: string,
): Promise<void> {
  await requireOwnProduct(deps, userId, productId);
  await deps.productWrites.updateAffiliateUrl(productId, affiliateUrl);
}

/**
 * Edit the product itself (DESIGN product-edit.html): where it came from,
 * whose it is, where it goes.
 *
 * The channel rule (ADR-0011) is enforced here rather than at the boundary,
 * because clearing the link is only legal in light of the coupon the product
 * already has — which the request body doesn't carry. A product with no link
 * and no in-store note could take no taps and no copies; it would be a card
 * that does nothing.
 */
export async function updateProduct(
  deps: CreatorContentDeps,
  userId: string,
  productId: string,
  input: UpdateProductInput,
): Promise<void> {
  const product = await deps.products.findForAttribution(productId);
  if (!product) throw new NotFoundError("Product not found");
  await requireOwnProfile(deps, userId, product.profileId);

  if (input.affiliateUrl === null && !product.inStoreNote) {
    throw new AppError(
      "VALIDATION",
      "A product needs somewhere to go: a link, or a code with an in-store note",
    );
  }

  // Re-read the page only when asked. A silent refetch on every save would let
  // a retailer's A/B test quietly rename a creator's product.
  const metadata =
    input.refreshMetadata && input.sourceUrl
      ? await deps.metadata.fetchMetadata(input.sourceUrl)
      : null;

  await deps.productWrites.update(productId, {
    ...(input.sourceUrl === undefined ? {} : { sourceUrl: input.sourceUrl }),
    ...(input.kind === undefined ? {} : { kind: input.kind }),
    ...(input.affiliateUrl === undefined ? {} : { affiliateUrl: input.affiliateUrl }),
    ...(metadata
      ? {
          ...(metadata.title ? { title: metadata.title } : {}),
          imageUrl: metadata.imageUrl,
          priceCents: metadata.priceCents,
          ...(metadata.currency ? { currency: metadata.currency } : {}),
        }
      : {}),
  });
}

export async function removeProduct(
  deps: CreatorContentDeps,
  userId: string,
  productId: string,
): Promise<void> {
  await requireOwnProduct(deps, userId, productId);
  await deps.productWrites.remove(productId);
}

/** Edit or clear a product's coupon (ADR-0011: "fix a code"). Clearing is
 * always allowed; setting a code needs a redemption channel — the product's
 * outbound link or an in-store note. */
export async function setProductCoupon(
  deps: CreatorContentDeps,
  userId: string,
  productId: string,
  input: SetProductCouponInput,
): Promise<void> {
  const product = await deps.products.findForAttribution(productId);
  if (!product) throw new NotFoundError("Product not found");
  await requireOwnProfile(deps, userId, product.profileId);

  if (input.couponCode === null) {
    await deps.productWrites.updateCoupon(productId, {
      couponCode: null,
      offerEndsAt: null,
      inStoreNote: null,
    });
    return;
  }

  const inStoreNote = input.inStoreNote ?? null;
  if (!product.affiliateUrl && !inStoreNote) {
    throw new AppError("VALIDATION", "A coupon needs a link or an in-store note");
  }
  await deps.productWrites.updateCoupon(productId, {
    couponCode: input.couponCode,
    offerEndsAt: input.offerEndsAt ?? null,
    inStoreNote,
  });
}

// --- Categories (ADR-0010: per-profile shelves; Admin AND Manager curate) ---

export async function listMyCategories(
  deps: CategoryDeps,
  userId: string,
  profileId: string,
): Promise<readonly CategoryView[]> {
  await requireOwnProfile(deps, userId, profileId);
  return deps.categories.listByProfile(profileId);
}

export async function createCategory(
  deps: CategoryDeps,
  userId: string,
  input: CreateCategoryInput,
): Promise<CategoryView> {
  await requireOwnProfile(deps, userId, input.profileId);
  const created = await deps.categories.create({
    profileId: input.profileId,
    title: input.title,
    description: input.description ?? null,
  });
  if (created === "duplicate") {
    throw new ConflictError("A category with that title already exists");
  }
  return created;
}

async function requireOwnCategory(
  deps: CategoryDeps,
  userId: string,
  categoryId: string,
): Promise<string> {
  const profileId = await deps.categories.findProfileId(categoryId);
  if (!profileId) throw new NotFoundError("Category not found");
  await requireOwnProfile(deps, userId, profileId);
  return profileId;
}

export async function updateCategory(
  deps: CategoryDeps,
  userId: string,
  categoryId: string,
  patch: UpdateCategoryInput,
): Promise<void> {
  await requireOwnCategory(deps, userId, categoryId);
  if ((await deps.categories.update(categoryId, patch)) === "duplicate") {
    throw new ConflictError("A category with that title already exists");
  }
}

/** Deleting a shelf never deletes content — items fall back to "All" (SET NULL). */
export async function removeCategory(
  deps: CategoryDeps,
  userId: string,
  categoryId: string,
): Promise<void> {
  await requireOwnCategory(deps, userId, categoryId);
  await deps.categories.remove(categoryId);
}

/** A category can only hold items of its own profile — cross-profile is a 404. */
async function requireCategoryOnProfile(
  deps: Pick<CreatorContentDeps, "categories">,
  categoryId: string | null,
  profileId: string,
): Promise<void> {
  if (categoryId && (await deps.categories.findProfileId(categoryId)) !== profileId) {
    throw new NotFoundError("Category not found");
  }
}

export async function setPostCategory(
  deps: CreatorContentDeps,
  userId: string,
  postId: string,
  input: SetPostCategoryInput,
): Promise<void> {
  await requireOwnProfile(deps, userId, input.profileId);
  if (!(await deps.posts.belongsToProfile(postId, input.profileId))) {
    throw new NotFoundError("Post not found");
  }
  await requireCategoryOnProfile(deps, input.categoryId, input.profileId);
  await deps.posts.setCategory(postId, input.categoryId);
}

/** Hide a post from the public page, or bring it back (brief 07). Content
 * work, so Admin AND Managers — same tier as tagging. */
export async function setPostHidden(
  deps: CreatorContentDeps,
  userId: string,
  postId: string,
  input: SetPostHiddenInput,
): Promise<void> {
  await requireOwnProfile(deps, userId, input.profileId);
  if (!(await deps.posts.belongsToProfile(postId, input.profileId))) {
    throw new NotFoundError("Post not found");
  }
  await deps.posts.setHidden(postId, input.hidden);
}

export async function setProductCategory(
  deps: CreatorContentDeps,
  userId: string,
  productId: string,
  input: SetProductCategoryInput,
): Promise<void> {
  const product = await deps.products.findForAttribution(productId);
  if (!product) throw new NotFoundError("Product not found");
  await requireOwnProfile(deps, userId, product.profileId);
  await requireCategoryOnProfile(deps, input.categoryId, product.profileId);
  await deps.productWrites.setCategory(productId, input.categoryId);
}
