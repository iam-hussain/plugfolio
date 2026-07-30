import { describe, expect, it } from "vitest";
import { NotFoundError } from "../errors";
import type { NewView, View, ViewRepository, ViewTargetRepository } from "../ports/view-repository";
import { recordView } from "./record-view";

const PROFILE_ID = "22222222-2222-2222-2222-222222222222";
const POST_ID = "11111111-1111-1111-1111-111111111111";
const PRODUCT_ID = "55555555-5555-5555-5555-555555555555";
const DEVICE_ID = "44444444-4444-4444-4444-444444444444";
const KEY = "33333333-3333-3333-3333-333333333333";

type StoredView = View & { idempotencyKey: string };

function makeFakeViews(): ViewRepository & { rows: StoredView[] } {
  const rows: StoredView[] = [];
  return {
    rows,
    async append(view: NewView) {
      const row: StoredView = { id: `view-${rows.length + 1}`, ...view };
      rows.push(row);
      return row;
    },
    async findByIdempotencyKey(key: string) {
      return rows.find((r) => r.idempotencyKey === key) ?? null;
    },
  };
}

const targets: ViewTargetRepository = {
  async profileIdForUsername(username) {
    return username === "mayamoves" ? PROFILE_ID : null;
  },
  async profileIdForPost(postId) {
    return postId === POST_ID ? PROFILE_ID : null;
  },
  async profileIdForProduct(productId) {
    return productId === PRODUCT_ID ? PROFILE_ID : null;
  },
};

const now = () => new Date("2026-07-30T00:00:00.000Z");

describe("recordView", () => {
  it("derives the profile from the handle and appends once per key", async () => {
    const views = makeFakeViews();
    const command = {
      surface: "profile",
      username: "mayamoves",
      idempotencyKey: KEY,
      deviceId: DEVICE_ID,
    } as const;

    const first = await recordView({ views, viewTargets: targets, now }, command);
    const second = await recordView({ views, viewTargets: targets, now }, command);

    expect(first.profileId).toBe(PROFILE_ID);
    expect(first.postId).toBeNull();
    expect(first.productId).toBeNull();
    expect(second.id).toBe(first.id);
    expect(views.rows).toHaveLength(1);
  });

  it("attaches the post on a post view and the product on a product view", async () => {
    const views = makeFakeViews();
    const post = await recordView(
      { views, viewTargets: targets, now },
      { surface: "post", postId: POST_ID, idempotencyKey: KEY, deviceId: DEVICE_ID },
    );
    const product = await recordView(
      { views, viewTargets: targets, now },
      {
        surface: "product",
        productId: PRODUCT_ID,
        idempotencyKey: "66666666-6666-6666-6666-666666666666",
        deviceId: DEVICE_ID,
      },
    );

    expect(post.postId).toBe(POST_ID);
    expect(post.productId).toBeNull();
    expect(product.productId).toBe(PRODUCT_ID);
    expect(product.postId).toBeNull();
  });

  it("refuses a view against something that does not exist", async () => {
    const views = makeFakeViews();
    await expect(
      recordView(
        { views, viewTargets: targets, now },
        { surface: "profile", username: "nobody", idempotencyKey: KEY, deviceId: DEVICE_ID },
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(views.rows).toHaveLength(0);
  });
});
