import { ConflictError, NotFoundError } from "../errors";
import type { CategoryView } from "../ports/category-repository";
import type {
  CreateCategoryInput,
  SetPostCategoryInput,
  SetProductCategoryInput,
  UpdateCategoryInput,
} from "../schemas/creator-content";
import { requireOwnProfile } from "./creator-access";
import type { CreatorContentDeps } from "./creator-content";

/**
 * Per-profile shelves (ADR-0010): Admin AND Manager curate categories, and
 * assign a post or product to one. Deleting a shelf never deletes content — the
 * items fall back to "All" (SET NULL). Split out of `creator-content` so each
 * file holds one slice of the back room.
 */

/** The category use-cases need only these two (ADR-0010). */
export type CategoryDeps = Pick<CreatorContentDeps, "profiles" | "categories">;

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
