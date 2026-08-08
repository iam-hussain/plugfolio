import { describe, expect, it } from "vitest";
import { AppError, ConflictError, ForbiddenError, NotFoundError } from "../errors";
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
import { tagProductInput, updatePostInput } from "../schemas/creator-content";
import {
  MAX_PROFILES_PER_ACCOUNT,
  connectProductToPost,
  createCategory,
  createPost,
  createProfile,
  disconnectProductFromPost,
  removeProduct,
  setPostCategory,
  setPostHidden,
  setProductCategory,
  setProductCoupon,
  tagProductToPost,
  updatePost,
  updateProduct,
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

function makeDeps(
  options: {
    connected?: boolean;
    profileCount?: number;
    metadata?: ProductMetadata | null;
    /** The existing product's outbound URL (null = in-store-only). */
    productUrl?: string | null;
  } = {},
) {
  const {
    connected = true,
    profileCount = 1,
    metadata = null,
    productUrl = "https://a.test/x",
  } = options;
  const created: { username: string }[] = [];
  const taggedRows: { title: string; imageUrl: string | null; priceCents: number | null }[] = [];
  const updates: string[] = [];
  const removals: string[] = [];
  const couponUpdates: { couponCode: string | null; inStoreNote: string | null }[] = [];

  const profiles: ProfileRepository = {
    async listByUser(userId) {
      return userId === USER
        ? [{ id: PROFILE_ID, username: "lena", displayName: null, avatarUrl: null }]
        : [];
    },
    async listAccessibleByUser(userId) {
      return userId === USER
        ? [
            {
              id: PROFILE_ID,
              username: "lena",
              displayName: null,
              avatarUrl: null,
              role: "admin" as const,
            },
          ]
        : [];
    },
    async contentCounts() {
      return { posts: 0, products: 0, categories: 0, collabs: 0 };
    },
    async exists() {
      return true;
    },
    async countByUser() {
      return profileCount;
    },
    async create(profile) {
      created.push({ username: profile.username });
      return { id: "new-profile", username: profile.username, displayName: null, avatarUrl: null };
    },
  };
  const connections: ConnectionReadRepository = {
    async hasAny() {
      return connected;
    },
  };
  const postCategoryChanges: (string | null)[] = [];
  const postUpdates: { mediaKind: string; embedUrl: string | null }[] = [];
  const productUpdates: { kind?: string; affiliateUrl?: string | null }[] = [];
  const productLinks: { productId: string; postId: string }[] = [];
  const productUnlinks: { productId: string; postId: string }[] = [];
  const postHiddenChanges: boolean[] = [];
  const posts: PostWriteRepository = {
    async create() {
      return { id: "new-post" };
    },
    async update(_postId, post) {
      postUpdates.push(post);
    },
    async belongsToProfile(postId, profileId) {
      return postId === POST_ID && profileId === PROFILE_ID;
    },
    async setCategory(_postId, categoryId) {
      postCategoryChanges.push(categoryId);
    },
    async setHidden(_postId, hidden) {
      postHiddenChanges.push(hidden);
    },
  };
  const products: ProductReadRepository = {
    async findForAttribution(productId) {
      return productId === PRODUCT_ID
        ? {
            id: PRODUCT_ID,
            profileId: PROFILE_ID,
            affiliateUrl: productUrl,
            couponCode: null,
            inStoreNote: null,
          }
        : null;
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
    async create(product) {
      taggedRows.push({
        title: product.title,
        imageUrl: product.imageUrl,
        priceCents: product.priceCents,
      });
      return { id: "new-product" };
    },
    async update(_productId, patch) {
      productUpdates.push(patch);
    },
    async connectToPost(productId, postId) {
      productLinks.push({ productId, postId });
    },
    async disconnectFromPost(productId, postId) {
      productUnlinks.push({ productId, postId });
    },
    async updateAffiliateUrl(productId) {
      updates.push(productId);
    },
    async updateCoupon(_productId, coupon) {
      couponUpdates.push({ couponCode: coupon.couponCode, inStoreNote: coupon.inStoreNote });
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
    couponUpdates,
    postCategoryChanges,
    postHiddenChanges,
    productCategoryChanges,
    postUpdates,
    productUpdates,
    productLinks,
    productUnlinks,
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
    kind: "affiliate" as const,
    affiliateUrl: "https://affiliate.example.com/tote",
  };

  it("rejects posting to someone else's profile", async () => {
    const { deps } = makeDeps();
    await expect(
      createPost(deps, OUTSIDER, {
        profileId: PROFILE_ID,
        mediaUrl: "https://x.test/m.jpg",
        mediaKind: "still",
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("tags with grabbed metadata when the page is readable", async () => {
    const { deps, taggedRows } = makeDeps({
      metadata: {
        title: "Everyday Tote",
        imageUrl: "https://x.test/t.jpg",
        priceCents: 4900,
        currency: "usd",
      },
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

describe("coupons (ADR-0011)", () => {
  it("boundary schema: a coupon-less product needs a link; an in-store note makes the link optional", () => {
    const base = { profileId: PROFILE_ID, postId: POST_ID, url: "https://s.test/p" };
    expect(tagProductInput.safeParse(base).success).toBe(false);
    expect(
      tagProductInput.safeParse({ ...base, couponCode: "SAVE10", inStoreNote: "At the counter" })
        .success,
    ).toBe(true);
    expect(tagProductInput.safeParse({ ...base, inStoreNote: "At the counter" }).success).toBe(
      false,
    );
  });

  it("sets a coupon when the product has an outbound link", async () => {
    const { deps, couponUpdates } = makeDeps();
    await setProductCoupon(deps, USER, PRODUCT_ID, { couponCode: "SAVE10", inStoreNote: null });
    expect(couponUpdates).toEqual([{ couponCode: "SAVE10", inStoreNote: null }]);
  });

  it("rejects a coupon with no channel (link-less product, no in-store note)", async () => {
    const { deps, couponUpdates } = makeDeps({ productUrl: null });
    await expect(
      setProductCoupon(deps, USER, PRODUCT_ID, { couponCode: "SAVE10", inStoreNote: null }),
    ).rejects.toBeInstanceOf(AppError);
    expect(couponUpdates).toEqual([]);
  });

  it("clearing the code clears the whole coupon, even on a link-less product", async () => {
    const { deps, couponUpdates } = makeDeps({ productUrl: null });
    await setProductCoupon(deps, USER, PRODUCT_ID, { couponCode: null, inStoreNote: null });
    expect(couponUpdates).toEqual([{ couponCode: null, inStoreNote: null }]);
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

  it("hides and restores a post; another profile's post is a 404", async () => {
    const { deps, postHiddenChanges } = makeDeps();
    await setPostHidden(deps, USER, POST_ID, { profileId: PROFILE_ID, hidden: true });
    await setPostHidden(deps, USER, POST_ID, { profileId: PROFILE_ID, hidden: false });
    expect(postHiddenChanges).toEqual([true, false]);
    await expect(
      setPostHidden(deps, USER, "99999999-0000-0000-0000-000000000000", {
        profileId: PROFILE_ID,
        hidden: true,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("updatePost / product editing (DESIGN post-edit + product-edit)", () => {
  it("clears a stale embed when a video post becomes a still", async () => {
    const { deps, postUpdates } = makeDeps();
    await updatePost(deps, USER, POST_ID, PROFILE_ID, {
      mediaUrl: "https://x.test/still.jpg",
      mediaKind: "still",
      embedUrl: "https://youtube.com/embed/abc",
      sourceUrl: "https://youtube.com/watch?v=abc",
    });
    // Otherwise the play button stays wired to the video it used to be.
    expect(postUpdates).toEqual([
      expect.objectContaining({ mediaKind: "still", embedUrl: null, sourceUrl: null }),
    ]);
  });

  it("refuses a video post with no video link", () => {
    expect(
      updatePostInput.safeParse({ mediaUrl: "https://x.test/p.jpg", mediaKind: "youtube" }).success,
    ).toBe(false);
    expect(
      updatePostInput.safeParse({
        mediaUrl: "https://x.test/p.jpg",
        mediaKind: "youtube",
        embedUrl: "https://youtube.com/embed/abc",
      }).success,
    ).toBe(true);
  });

  it("refuses to leave a product with nowhere to go", async () => {
    const { deps, productUpdates } = makeDeps();
    // The fake product has a link and no in-store note, so clearing the link
    // would leave a card that can take neither a tap nor a copy.
    await expect(
      updateProduct(deps, USER, PRODUCT_ID, { affiliateUrl: null }),
    ).rejects.toBeInstanceOf(AppError);
    expect(productUpdates).toEqual([]);
  });

  it("changes the kind without touching anything else", async () => {
    const { deps, productUpdates } = makeDeps();
    await updateProduct(deps, USER, PRODUCT_ID, { kind: "own" });
    expect(productUpdates).toEqual([{ kind: "own" }]);
  });

  it("connects and disconnects an existing product", async () => {
    const { deps, productLinks, productUnlinks } = makeDeps();
    await connectProductToPost(deps, USER, POST_ID, PRODUCT_ID);
    await disconnectProductFromPost(deps, USER, POST_ID, PRODUCT_ID);
    expect(productLinks).toEqual([{ productId: PRODUCT_ID, postId: POST_ID }]);
    expect(productUnlinks).toEqual([{ productId: PRODUCT_ID, postId: POST_ID }]);
  });

  it("refuses to connect a product to someone else's post", async () => {
    const { deps, productLinks } = makeDeps();
    await expect(
      connectProductToPost(deps, USER, "99999999-0000-0000-0000-000000000000", PRODUCT_ID),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(productLinks).toEqual([]);
  });
});
