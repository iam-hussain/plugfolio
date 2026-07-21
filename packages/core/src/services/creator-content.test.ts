import { describe, expect, it } from "vitest";
import { ConflictError, ForbiddenError, NotFoundError } from "../errors";
import type { CategoryRepository, CategoryView } from "../ports/category-repository";
import type {
  ConnectionReadRepository,
  PostWriteRepository,
  ProductMetadata,
  ProductMetadataGateway,
  ProductWriteRepository,
} from "../ports/creator-content-repository";
import type { ProductReadRepository } from "../ports/product-repository";
import type { ProfileRepository } from "../ports/profile-repository";
import {
  MAX_PROFILES_PER_ACCOUNT,
  createCategory,
  createPost,
  createProfile,
  removeProduct,
  setPostCategory,
  setProductCategory,
  tagProductToPost,
  updateProductAffiliateUrl,
} from "./creator-content";

const USER = "10000000-0000-0000-0000-000000000001";
const OUTSIDER = "10000000-0000-0000-0000-000000000002";
const PROFILE_ID = "20000000-0000-0000-0000-000000000001";
const POST_ID = "30000000-0000-0000-0000-000000000001";
const PRODUCT_ID = "40000000-0000-0000-0000-000000000001";
const CATEGORY_ID = "50000000-0000-0000-0000-000000000001";
/** A category belonging to a DIFFERENT profile — cross-profile must 404. */
const FOREIGN_CATEGORY_ID = "50000000-0000-0000-0000-000000000002";

function makeDeps(options: { connected?: boolean; profileCount?: number; metadata?: ProductMetadata | null } = {}) {
  const { connected = true, profileCount = 1, metadata = null } = options;
  const created: { username: string }[] = [];
  const taggedRows: { title: string; imageUrl: string | null; priceCents: number | null }[] = [];
  const updates: string[] = [];
  const removals: string[] = [];

  const profiles: ProfileRepository = {
    async listByUser(userId) {
      return userId === USER ? [{ id: PROFILE_ID, username: "lena" }] : [];
    },
    async listAccessibleByUser(userId) {
      return userId === USER
        ? [{ id: PROFILE_ID, username: "lena", role: "admin" as const }]
        : [];
    },
    async exists() {
      return true;
    },
    async countByUser() {
      return profileCount;
    },
    async create(profile) {
      created.push({ username: profile.username });
      return { id: "new-profile", username: profile.username };
    },
  };
  const connections: ConnectionReadRepository = {
    async hasAny() {
      return connected;
    },
  };
  const postCategoryChanges: (string | null)[] = [];
  const posts: PostWriteRepository = {
    async create() {
      return { id: "new-post" };
    },
    async belongsToProfile(postId, profileId) {
      return postId === POST_ID && profileId === PROFILE_ID;
    },
    async setCategory(_postId, categoryId) {
      postCategoryChanges.push(categoryId);
    },
  };
  const products: ProductReadRepository = {
    async findForAttribution(productId) {
      return productId === PRODUCT_ID ? { id: PRODUCT_ID, profileId: PROFILE_ID } : null;
    },
    async isTaggedToPost() {
      return true;
    },
  };
  const productWrites: ProductWriteRepository = {
    async createTagged(product) {
      taggedRows.push({
        title: product.title,
        imageUrl: product.imageUrl,
        priceCents: product.priceCents,
      });
      return { id: "new-product" };
    },
    async updateAffiliateUrl(productId) {
      updates.push(productId);
    },
    async setCategory(_productId, categoryId) {
      productCategoryChanges.push(categoryId);
    },
    async remove(productId) {
      removals.push(productId);
    },
  };
  const productCategoryChanges: (string | null)[] = [];
  const categoryRows: CategoryView[] = [
    { id: CATEGORY_ID, title: "Desk setup", description: null, sortOrder: 0 },
  ];
  const categories: CategoryRepository = {
    async listByProfile() {
      return categoryRows;
    },
    async findProfileId(categoryId) {
      if (categoryId === CATEGORY_ID) return PROFILE_ID;
      if (categoryId === FOREIGN_CATEGORY_ID) return "20000000-0000-0000-0000-000000000099";
      return null;
    },
    async create(category) {
      if (categoryRows.some((row) => row.title === category.title)) return "duplicate";
      const view: CategoryView = {
        id: "new-category",
        title: category.title,
        description: category.description,
        sortOrder: 0,
      };
      categoryRows.push(view);
      return view;
    },
    async update() {
      return "ok";
    },
    async remove() {},
  };
  const gateway: ProductMetadataGateway = {
    async fetchMetadata() {
      return metadata;
    },
  };

  return {
    deps: { profiles, connections, posts, products, productWrites, categories, metadata: gateway },
    created,
    taggedRows,
    updates,
    removals,
    postCategoryChanges,
    productCategoryChanges,
  };
}

describe("createProfile", () => {
  it("assigns a random creator-prefixed username", async () => {
    const { deps } = makeDeps();
    const profile = await createProfile(deps, USER);
    expect(profile.username).toMatch(/^creator-[0-9a-f]{8}$/);
  });

  it("requires a connected social (ADR-0004)", async () => {
    const { deps } = makeDeps({ connected: false });
    await expect(createProfile(deps, USER)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("caps an account at five profiles", async () => {
    const { deps } = makeDeps({ profileCount: MAX_PROFILES_PER_ACCOUNT });
    await expect(createProfile(deps, USER)).rejects.toBeInstanceOf(ConflictError);
  });
});

describe("createPost / tagProductToPost", () => {
  const tagInput = {
    profileId: PROFILE_ID,
    postId: POST_ID,
    url: "https://shop.example.com/tote",
    affiliateUrl: "https://affiliate.example.com/tote",
  };

  it("rejects posting to someone else's profile", async () => {
    const { deps } = makeDeps();
    await expect(
      createPost(deps, OUTSIDER, { profileId: PROFILE_ID, mediaUrl: "https://x.test/m.jpg" }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("tags with grabbed metadata when the page is readable", async () => {
    const { deps, taggedRows } = makeDeps({
      metadata: { title: "Everyday Tote", imageUrl: "https://x.test/t.jpg", priceCents: 4900, currency: "usd" },
    });
    await tagProductToPost(deps, USER, tagInput);
    expect(taggedRows[0]).toEqual({
      title: "Everyday Tote",
      imageUrl: "https://x.test/t.jpg",
      priceCents: 4900,
    });
  });

  it("falls back to the hostname when the page can't be read — never blocks the tag", async () => {
    const { deps, taggedRows } = makeDeps({ metadata: null });
    await tagProductToPost(deps, USER, tagInput);
    expect(taggedRows[0]!.title).toBe("shop.example.com");
  });

  it("rejects tagging onto a post from another profile", async () => {
    const { deps } = makeDeps();
    await expect(
      tagProductToPost(deps, USER, { ...tagInput, postId: "30000000-0000-0000-0000-000000000099" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("product fixes (Products tab)", () => {
  it("owner can fix a link and remove a product", async () => {
    const { deps, updates, removals } = makeDeps();
    await updateProductAffiliateUrl(deps, USER, PRODUCT_ID, "https://a.test/new");
    await removeProduct(deps, USER, PRODUCT_ID);
    expect(updates).toEqual([PRODUCT_ID]);
    expect(removals).toEqual([PRODUCT_ID]);
  });

  it("an outsider cannot touch the product", async () => {
    const { deps } = makeDeps();
    await expect(
      updateProductAffiliateUrl(deps, OUTSIDER, PRODUCT_ID, "https://a.test/x"),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});

describe("categories (ADR-0010)", () => {
  it("rejects a duplicate title on the same profile with Conflict", async () => {
    const { deps } = makeDeps();
    await expect(
      createCategory(deps, USER, { profileId: PROFILE_ID, title: "Desk setup" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("an outsider cannot create a category", async () => {
    const { deps } = makeDeps();
    await expect(
      createCategory(deps, OUTSIDER, { profileId: PROFILE_ID, title: "Sneaky shelf" }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("puts a post on a shelf and takes it off", async () => {
    const { deps, postCategoryChanges } = makeDeps();
    await setPostCategory(deps, USER, POST_ID, { profileId: PROFILE_ID, categoryId: CATEGORY_ID });
    await setPostCategory(deps, USER, POST_ID, { profileId: PROFILE_ID, categoryId: null });
    expect(postCategoryChanges).toEqual([CATEGORY_ID, null]);
  });

  it("rejects assigning a category from another profile (cross-profile is a 404)", async () => {
    const { deps, productCategoryChanges } = makeDeps();
    await expect(
      setProductCategory(deps, USER, PRODUCT_ID, { categoryId: FOREIGN_CATEGORY_ID }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(productCategoryChanges).toEqual([]);
  });
});
