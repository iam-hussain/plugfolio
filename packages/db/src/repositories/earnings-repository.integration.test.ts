import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createEarningsRepository } from "./earnings-repository";

/**
 * Integration test for the Earnings projection (§6.6) against real Postgres —
 * the aggregation lives in groupBy queries, so only a real database exercises
 * it. Runs when TEST_DATABASE_URL is set (CI's db-integration job); skips
 * locally so `pnpm test` stays DB-free.
 */
const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("EarningsRepository (integration)", () => {
  let db: PrismaClient;
  let earnings: ReturnType<typeof createEarningsRepository>;

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

  beforeAll(async () => {
    db = new PrismaClient({ datasources: { db: { url } } });
    earnings = createEarningsRepository(db);
    await db.user.create({ data: { id: accountId, email: `${accountId}@example.com`, username: `user-${accountId.slice(0, 8)}` } });
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
  });

  afterAll(async () => {
    await db.user.delete({ where: { id: accountId } }); // cascades everything
    await db.$disconnect();
  });

  it("projects per-post and per-product tap counts from the event table", async () => {
    const summary = await earnings.summarize(profileId);

    expect(summary.totalTaps).toBe(4);
    // Most-tapped first; the post-less tap appears in totals only.
    expect(summary.byPost).toEqual([
      { postId: hotPostId, mediaUrl: "https://example.com/hot.jpg", caption: "Hot", taps: 2 },
      { postId: quietPostId, mediaUrl: "https://example.com/quiet.jpg", caption: null, taps: 1 },
    ]);
    expect(summary.byProduct).toEqual([{ productId, title: "Tote", taps: 4 }]);
  });

  it("is rebuildable: another profile's events never leak in", async () => {
    const summary = await earnings.summarize(randomUUID());
    expect(summary).toEqual({ totalTaps: 0, byPost: [], byProduct: [] });
  });
});
