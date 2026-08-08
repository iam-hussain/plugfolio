import { randomUUID } from "node:crypto";
import { PrismaClient } from "../../generated/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTrafficRepository } from "./traffic-repository";

/**
 * Integration test for the Traffic projection (§6.6) against a real database —
 * the aggregation lives in groupBy queries, so only a real database exercises
 * it. Runs when TEST_DATABASE_URL is set (CI's db-integration job); skips
 * locally so `pnpm test` stays DB-free.
 */
const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("TrafficRepository (integration)", () => {
  let db: PrismaClient;
  let traffic: ReturnType<typeof createTrafficRepository>;

  const accountId = randomUUID();
  const profileId = randomUUID();
  const productId = randomUUID();
  const hotPostId = randomUUID();
  const quietPostId = randomUUID();

  function tapRow(postId: string | null) {
    return {
      productId,
      postId,
      profileId,
      deviceId: randomUUID(),
      idempotencyKey: randomUUID(),
      source: "post" as const,
    };
  }

  function viewRow(target: { postId?: string; productId?: string }) {
    return {
      profileId,
      postId: target.postId ?? null,
      productId: target.productId ?? null,
      deviceId: randomUUID(),
      idempotencyKey: randomUUID(),
      surface: target.postId
        ? ("post" as const)
        : target.productId
          ? ("product" as const)
          : ("profile" as const),
    };
  }

  beforeAll(async () => {
    db = new PrismaClient({ datasources: { db: { url } } });
    traffic = createTrafficRepository(db);
    await db.user.create({
      data: {
        id: accountId,
        email: `${accountId}@example.com`,
        username: `user-${accountId.slice(0, 8)}`,
      },
    });
    await db.profile.create({
      data: { id: profileId, username: accountId.slice(0, 8), userId: accountId },
    });
    await db.product.create({
      data: { id: productId, profileId, title: "Tote", affiliateUrl: "https://example.com/x" },
    });
    await db.post.create({
      data: { id: hotPostId, profileId, mediaUrl: "https://example.com/hot.jpg", caption: "Hot" },
    });
    await db.post.create({
      data: { id: quietPostId, profileId, mediaUrl: "https://example.com/quiet.jpg" },
    });
    // 2 taps from the hot post, 1 from the quiet post, 1 post-less surface tap.
    await db.tap.createMany({
      data: [tapRow(hotPostId), tapRow(hotPostId), tapRow(quietPostId), tapRow(null)],
    });
    // Views are the denominator: 3 on the hot post, 1 on the product, 1 on the
    // page itself — which belongs to the total only.
    await db.view.createMany({
      data: [
        viewRow({ postId: hotPostId }),
        viewRow({ postId: hotPostId }),
        viewRow({ postId: hotPostId }),
        viewRow({ productId }),
        viewRow({}),
      ],
    });
  });

  afterAll(async () => {
    await db.user.delete({ where: { id: accountId } }); // cascades everything
    await db.$disconnect();
  });

  it("projects per-post and per-product counts from the event tables", async () => {
    const summary = await traffic.summarize(profileId);

    expect(summary.totalTaps).toBe(4);
    expect(summary.totalViews).toBe(5);
    // Most-tapped first; the page view and the post-less tap appear in totals only.
    expect(summary.byPost).toEqual([
      {
        postId: hotPostId,
        mediaUrl: "https://example.com/hot.jpg",
        caption: "Hot",
        views: 3,
        taps: 2,
      },
      {
        postId: quietPostId,
        mediaUrl: "https://example.com/quiet.jpg",
        caption: null,
        views: 0,
        taps: 1,
      },
    ]);
    expect(summary.byProduct).toEqual([
      { productId, title: "Tote", views: 1, taps: 4, codeCopies: 0 },
    ]);
  });

  it("is rebuildable: another profile's events never leak in", async () => {
    const summary = await traffic.summarize(randomUUID());
    expect(summary).toEqual({
      totalViews: 0,
      totalTaps: 0,
      totalCodeCopies: 0,
      byPost: [],
      byProduct: [],
      byCode: [],
      series: [],
      sources: [],
      viewsBySurface: { profile: 0, post: 0, product: 0 },
    });
  });
});
