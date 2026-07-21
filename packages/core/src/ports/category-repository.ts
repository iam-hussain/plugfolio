/**
 * Port for a creator's categories (ADR-0010): per-profile shelves that posts
 * and products can sit in. "duplicate" surfaces the per-profile unique-title
 * constraint so the service can map it to a typed ConflictError.
 */

export type CategoryView = {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly sortOrder: number;
};

export type NewCategory = {
  readonly profileId: string;
  readonly title: string;
  readonly description: string | null;
};

export type CategoryPatch = {
  readonly title?: string;
  readonly description?: string | null;
  readonly sortOrder?: number;
};

export type CategoryRepository = {
  /** Creator display order: sortOrder, then age. */
  listByProfile(profileId: string): Promise<readonly CategoryView[]>;
  /** For ownership checks; null when the category doesn't exist. */
  findProfileId(categoryId: string): Promise<string | null>;
  create(category: NewCategory): Promise<CategoryView | "duplicate">;
  update(categoryId: string, patch: CategoryPatch): Promise<"ok" | "duplicate">;
  remove(categoryId: string): Promise<void>;
};
