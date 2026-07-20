import { randomUUID } from "node:crypto";
import { ConflictError, ForbiddenError, NotFoundError } from "../errors";
import type {
  ConnectionReadRepository,
  PostWriteRepository,
  ProductMetadataGateway,
  ProductWriteRepository,
} from "../ports/creator-content-repository";
import type { ProductReadRepository } from "../ports/product-repository";
import type { ProfileRepository, ProfileSummary } from "../ports/profile-repository";
import type { CreatePostInput, TagProductInput } from "../schemas/creator-content";

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
  metadata: ProductMetadataGateway;
};

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
  // Random username so the page works instantly; collision odds are negligible.
  const username = `creator-${randomUUID().slice(0, 8)}`;
  return deps.profiles.create({ userId, username });
}

export async function createPost(
  deps: CreatorContentDeps,
  userId: string,
  input: CreatePostInput,
): Promise<{ id: string }> {
  await requireOwnProfile(deps, userId, input.profileId);
  return deps.posts.create({
    profileId: input.profileId,
    mediaUrl: input.mediaUrl,
    caption: input.caption ?? null,
  });
}

/** The core tool: paste a product URL, grab its metadata, tag it to the post. */
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
    title: metadata?.title ?? fallbackTitle,
    affiliateUrl: input.affiliateUrl,
    imageUrl: metadata?.imageUrl ?? null,
    priceCents: metadata?.priceCents ?? null,
    currency: metadata?.currency ?? "usd",
  });
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

export async function removeProduct(
  deps: CreatorContentDeps,
  userId: string,
  productId: string,
): Promise<void> {
  await requireOwnProduct(deps, userId, productId);
  await deps.productWrites.remove(productId);
}
