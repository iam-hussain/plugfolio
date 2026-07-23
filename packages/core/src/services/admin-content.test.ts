import { describe, expect, it } from "vitest";
import { NotFoundError } from "../errors";
import type {
  AdminAuditEntry,
  AdminAuditRepository,
  AdminContentRepository,
} from "../ports/admin-repository";
import { clearProductCoupon, deleteComment, deletePost, deleteProduct } from "./admin-content";

function makeDeps() {
  const comments = new Map([["comment-1", "Is this legit? ".repeat(20)]]);
  const posts = new Set(["post-1"]);
  const products = new Map([["product-1", { title: "Desk Lamp", couponCode: "SAVE10" as string | null }]]);
  const recorded: AdminAuditEntry[] = [];
  const content: AdminContentRepository = {
    async searchComments() {
      return [];
    },
    async deleteComment(id) {
      const body = comments.get(id);
      if (body === undefined) return "not_found";
      comments.delete(id);
      return { body };
    },
    async searchPosts() {
      return [];
    },
    async deletePost(id) {
      return posts.delete(id) ? "ok" : "not_found";
    },
    async searchProducts() {
      return [];
    },
    async deleteProduct(id) {
      const product = products.get(id);
      if (!product) return "not_found";
      products.delete(id);
      return { title: product.title };
    },
    async clearCoupon(id) {
      const product = products.get(id);
      if (!product) return "not_found";
      product.couponCode = null;
      return "ok";
    },
  };
  const audit: AdminAuditRepository = {
    async record(entry) {
      recorded.push(entry);
    },
    async listRecent() {
      return [];
    },
  };
  return { deps: { content, audit }, comments, posts, products, recorded };
}

describe("content takedowns", () => {
  it("deletes a comment and audits a bounded snippet of what was removed", async () => {
    const { deps, comments, recorded } = makeDeps();
    await deleteComment(deps, "admin-1", "comment-1");
    expect(comments.size).toBe(0);
    expect(recorded[0]).toMatchObject({ action: "comment.delete", targetId: "comment-1" });
    expect(recorded[0]!.detail!.length).toBeLessThanOrEqual(81); // 80 + ellipsis
    expect(recorded[0]!.detail!.endsWith("…")).toBe(true);
  });

  it("removes posts and products, clears coupons — each audited", async () => {
    const { deps, posts, products, recorded } = makeDeps();
    await clearProductCoupon(deps, "admin-1", "product-1");
    expect(products.get("product-1")!.couponCode).toBeNull();
    await deletePost(deps, "admin-1", "post-1");
    expect(posts.size).toBe(0);
    await deleteProduct(deps, "admin-1", "product-1");
    expect(products.size).toBe(0);
    expect(recorded.map((r) => r.action)).toEqual([
      "product.clearCoupon",
      "post.delete",
      "product.delete",
    ]);
    expect(recorded[2]!.detail).toBe("Desk Lamp");
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
