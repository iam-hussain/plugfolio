import { describe, expect, it } from "vitest";
import { NotFoundError } from "../errors";
import type { CodeCopy, CodeCopyRepository, NewCodeCopy } from "../ports/code-copy-repository";
import type { ProductReadRepository } from "../ports/product-repository";
import { recordCodeCopy } from "./record-code-copy";

const PRODUCT_ID = "11111111-1111-1111-1111-111111111111";
const OWNER_PROFILE_ID = "22222222-2222-2222-2222-222222222222";

type StoredCopy = CodeCopy & { idempotencyKey: string };

function makeFakeCopies(): CodeCopyRepository & { rows: StoredCopy[] } {
  const rows: StoredCopy[] = [];
  return {
    rows,
    async append(copy: NewCodeCopy) {
      const row: StoredCopy = { id: `copy-${rows.length + 1}`, ...copy };
      rows.push(row);
      return row;
    },
    async findByIdempotencyKey(key: string) {
      return rows.find((r) => r.idempotencyKey === key) ?? null;
    },
  };
}

function makeFakeProducts(couponCode: string | null = "MAYA15"): ProductReadRepository {
  return {
    async findForAttribution(productId: string) {
      return productId === PRODUCT_ID
        ? { id: PRODUCT_ID, profileId: OWNER_PROFILE_ID, affiliateUrl: null, couponCode }
        : null;
    },
    async isTaggedToPost() {
      return false;
    },
  };
}

const command = {
  productId: PRODUCT_ID,
  deviceId: "44444444-4444-4444-4444-444444444444",
  idempotencyKey: "33333333-3333-3333-3333-333333333333",
};

const now = () => new Date("2026-07-22T00:00:00.000Z");

describe("recordCodeCopy", () => {
  it("credits the product's owning profile and appends once per key", async () => {
    const codeCopies = makeFakeCopies();
    const products = makeFakeProducts();
    const first = await recordCodeCopy({ codeCopies, products, now }, command);
    const second = await recordCodeCopy({ codeCopies, products, now }, command);

    expect(first.profileId).toBe(OWNER_PROFILE_ID);
    expect(second.id).toBe(first.id);
    expect(codeCopies.rows).toHaveLength(1);
  });

  it("rejects a copy on a product without a coupon", async () => {
    const codeCopies = makeFakeCopies();
    await expect(
      recordCodeCopy({ codeCopies, products: makeFakeProducts(null), now }, command),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(codeCopies.rows).toHaveLength(0);
  });
});
