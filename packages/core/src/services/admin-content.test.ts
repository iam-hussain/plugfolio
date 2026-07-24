import { describe, expect, it } from "vitest";
import { NotFoundError } from "../errors";
import type { AdminContentRepository } from "../ports/admin-repository";
import { fakeAudit } from "../test/fakes";
import {
  clearProductCoupon,
  deleteComment,
  deleteCommentsBulk,
  deletePost,
  deletePostsBulk,
  deleteProduct,
  deleteProductsBulk,
} from "./admin-content";

const NOW = new Date("2026-07-24T00:00:00.000Z");

function makeDeps() {
  const comments = new Map([
    ["comment-1", "Is this legit? ".repeat(20)],
    ["comment-2", "spam"],
  ]);
  const posts = new Set(["post-1", "post-2"]);
  const products = new Map([
    ["product-1", { title: "Desk Lamp", couponCode: "SAVE10" as string | null }],
  ]);
  const { audit, recorded } = fakeAudit();
  const content: AdminContentRepository = {
    async searchComments() {
      return { rows: [], total: 0 };
    },
    async deleteComment(id) {
      const body = comments.get(id);
      if (body === undefined) return "not_found";
      comments.delete(id);
      return { body };
    },
    async deleteCommentsBulk(ids) {
      let n = 0;
      for (const id of ids) if (comments.delete(id)) n++;
      return n;
    },
    async searchPosts() {
      return { rows: [], total: 0 };
    },
    async deletePost(id) {
      return posts.delete(id) ? "ok" : "not_found";
    },
    async deletePostsBulk(ids) {
      let n = 0;
      for (const id of ids) if (posts.delete(id)) n++;
      return n;
    },
    async searchProducts() {
      return { rows: [], total: 0 };
    },
    async deleteProduct(id) {
      const product = products.get(id);
      if (!product) return "not_found";
      products.delete(id);
      return { title: product.title };
    },
    async deleteProductsBulk(ids) {
      let n = 0;
      for (const id of ids) if (products.delete(id)) n++;
      return n;
    },
    async clearCoupon(id) {
      const product = products.get(id);
      if (!product) return "not_found";
      product.couponCode = null;
      return "ok";
    },
  };
  return { deps: { content, audit, now: () => NOW }, comments, posts, products, recorded };
}

describe("content takedowns", () => {
  it("deletes a comment and audits a bounded snippet of what was removed", async () => {
    const { deps, comments, recorded } = makeDeps();
    await deleteComment(deps, "admin-1", "comment-1");
    expect(comments.has("comment-1")).toBe(false);
    expect(recorded[0]).toMatchObject({ action: "comment.delete", targetId: "comment-1" });
    expect(recorded[0]!.detail!.length).toBeLessThanOrEqual(81); // 80 + ellipsis
    expect(recorded[0]!.detail!.endsWith("…")).toBe(true);
  });

  it("removes posts and products, clears coupons — each audited", async () => {
    const { deps, posts, products, recorded } = makeDeps();
    await clearProductCoupon(deps, "admin-1", "product-1");
    expect(products.get("product-1")!.couponCode).toBeNull();
    await deletePost(deps, "admin-1", "post-1");
    expect(posts.has("post-1")).toBe(false);
    await deleteProduct(deps, "admin-1", "product-1");
    expect(products.size).toBe(0);
    expect(recorded.map((r) => r.action)).toEqual([
      "product.clearCoupon",
      "post.delete",
      "product.delete",
    ]);
    expect(recorded[2]!.detail).toBe("Desk Lamp");
  });

  it("bulk sweeps count only what existed and audit once", async () => {
    const { deps, recorded } = makeDeps();
    expect(await deleteCommentsBulk(deps, "admin-1", ["comment-1", "comment-2", "ghost"])).toBe(2);
    expect(await deletePostsBulk(deps, "admin-1", ["post-1"])).toBe(1);
    expect(await deleteProductsBulk(deps, "admin-1", ["product-1"])).toBe(1);
    expect(recorded.map((r) => r.action)).toEqual([
      "comment.bulkDelete",
      "post.bulkDelete",
      "product.bulkDelete",
    ]);
    expect(recorded[0]!.detail).toBe("2 comments");
  });

  it("unknown targets are typed NotFoundErrors and record nothing", async () => {
    const { deps, recorded } = makeDeps();
    await expect(deleteComment(deps, "admin-1", "ghost")).rejects.toBeInstanceOf(NotFoundError);
    await expect(deletePost(deps, "admin-1", "ghost")).rejects.toBeInstanceOf(NotFoundError);
    await expect(deleteProduct(deps, "admin-1", "ghost")).rejects.toBeInstanceOf(NotFoundError);
    await expect(clearProductCoupon(deps, "admin-1", "ghost")).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(recorded).toHaveLength(0);
  });
});
