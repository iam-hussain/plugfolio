import { describe, expect, it } from "vitest";
import { NotFoundError } from "../errors";
import type { NewOutboundTap, OutboundTap } from "../domain/tap";
import type { ProductReadRepository } from "../ports/product-repository";
import type { TapRepository } from "../ports/tap-repository";
import { recordOutboundTap } from "./record-outbound-tap";

/** In-memory fakes — services are testable without Prisma or a database. */
function makeFakeTaps(): TapRepository & { rows: OutboundTap[] } {
  const rows: OutboundTap[] = [];
  return {
    rows,
    async append(tap: NewOutboundTap) {
      const row: OutboundTap = { id: `tap-${rows.length + 1}`, ...tap };
      rows.push(row);
      return row;
    },
    async findByIdempotencyKey(key: string) {
      return rows.find((r) => r.idempotencyKey === key) ?? null;
    },
  };
}

const PRODUCT_ID = "11111111-1111-1111-1111-111111111111";
const OWNER_PROFILE_ID = "22222222-2222-2222-2222-222222222222";
const TAGGED_POST_ID = "55555555-5555-5555-5555-555555555555";

function makeFakeProducts(affiliateUrl: string | null = "https://a.test/link"): ProductReadRepository {
  return {
    async findForAttribution(productId: string) {
      return productId === PRODUCT_ID
        ? { id: PRODUCT_ID, profileId: OWNER_PROFILE_ID, affiliateUrl, couponCode: null }
        : null;
    },
    async isTaggedToPost(productId: string, postId: string) {
      return productId === PRODUCT_ID && postId === TAGGED_POST_ID;
    },
  };
}

const command = {
  productId: PRODUCT_ID,
  deviceId: "44444444-4444-4444-4444-444444444444",
  idempotencyKey: "33333333-3333-3333-3333-333333333333",
  source: "post" as const,
};

const now = () => new Date("2026-07-17T00:00:00.000Z");

describe("recordOutboundTap", () => {
  it("credits the product's owning profile, not any client-supplied value", async () => {
    const taps = makeFakeTaps();
    const tap = await recordOutboundTap({ taps, products: makeFakeProducts(), now }, command);

    expect(tap.profileId).toBe(OWNER_PROFILE_ID);
    expect(tap.occurredAt).toEqual(now());
    expect(taps.rows).toHaveLength(1);
  });

  it("rejects a tap on an unknown product with NotFound", async () => {
    const taps = makeFakeTaps();
    await expect(
      recordOutboundTap(
        { taps, products: makeFakeProducts(), now },
        { ...command, productId: "99999999-9999-9999-9999-999999999999" },
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(taps.rows).toHaveLength(0);
  });

  it("records the driving post when it has the product tagged", async () => {
    const taps = makeFakeTaps();
    const tap = await recordOutboundTap(
      { taps, products: makeFakeProducts(), now },
      { ...command, postId: TAGGED_POST_ID },
    );

    expect(tap.postId).toBe(TAGGED_POST_ID);
  });

  it("rejects a postId whose post does not have the product tagged", async () => {
    const taps = makeFakeTaps();
    await expect(
      recordOutboundTap(
        { taps, products: makeFakeProducts(), now },
        { ...command, postId: "66666666-6666-6666-6666-666666666666" },
      ),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(taps.rows).toHaveLength(0);
  });

  it("records a null post for post-less surfaces", async () => {
    const taps = makeFakeTaps();
    const tap = await recordOutboundTap({ taps, products: makeFakeProducts(), now }, command);

    expect(tap.postId).toBeNull();
  });

  it("rejects a tap on an in-store-only product (no outbound destination, ADR-0011)", async () => {
    const taps = makeFakeTaps();
    await expect(
      recordOutboundTap({ taps, products: makeFakeProducts(null), now }, command),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(taps.rows).toHaveLength(0);
  });

  it("is idempotent: a retry with the same key does not double-count", async () => {
    const taps = makeFakeTaps();
    const products = makeFakeProducts();
    const first = await recordOutboundTap({ taps, products, now }, command);
    const second = await recordOutboundTap({ taps, products, now }, command);

    expect(second.id).toBe(first.id);
    expect(taps.rows).toHaveLength(1);
  });
});
