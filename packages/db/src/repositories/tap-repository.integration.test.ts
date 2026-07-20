import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createTapRepository } from "./tap-repository";

/**
 * Integration test for the idempotency RACE (§6.8) against a real Postgres —
 * the unit test uses an in-memory fake and can't exercise the unique-constraint
 * violation path. Runs only when TEST_DATABASE_URL is set (CI provides a
 * Postgres service); skips locally so `pnpm test` stays DB-free.
 *
 * Assumes the schema is already applied to TEST_DATABASE_URL (CI runs
 * `prisma db push` first).
 */
const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("TapRepository (integration)", () => {
  // Instantiated in beforeAll (not at suite-collection time) so a skipped run
  // never constructs a PrismaClient with an undefined URL.
  let db: PrismaClient;
  let taps: ReturnType<typeof createTapRepository>;

  const accountId = randomUUID();
  const profileId = randomUUID();
  const productId = randomUUID();

  beforeAll(async () => {
    db = new PrismaClient({ datasources: { db: { url } } });
    taps = createTapRepository(db);
    await db.account.create({ data: { id: accountId, email: `${accountId}@example.com` } });
    await db.profile.create({
      data: { id: profileId, username: accountId.slice(0, 8), accountId },
    });
    await db.product.create({
      data: { id: productId, profileId, title: "Test", affiliateUrl: "https://example.com/x" },
    });
  });

  afterAll(async () => {
    await db.account.delete({ where: { id: accountId } }); // cascades to profile/product/tap
    await db.$disconnect();
  });

  beforeEach(async () => {
    await db.tap.deleteMany({ where: { profileId } });
  });

  it("collapses concurrent appends with the same idempotency key to one row", async () => {
    const idempotencyKey = randomUUID();
    const newTap = {
      productId,
      postId: null,
      profileId,
      deviceId: randomUUID(),
      idempotencyKey,
      source: "post" as const,
      occurredAt: new Date(),
    };

    // Fire many concurrent appends racing on the same key.
    const results = await Promise.all(Array.from({ length: 8 }, () => taps.append(newTap)));

    // Every caller gets the same winning row...
    const ids = new Set(results.map((r) => r.id));
    expect(ids.size).toBe(1);

    // ...and exactly one row was persisted.
    const count = await db.tap.count({ where: { idempotencyKey } });
    expect(count).toBe(1);
  });
});
