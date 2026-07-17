import { describe, expect, it } from "vitest";
import type { NewOutboundTap, OutboundTap } from "../domain/tap";
import type { TapRepository } from "../ports/tap-repository";
import { recordOutboundTap } from "./record-outbound-tap";

/** In-memory fake — services are testable without Prisma or a database. */
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

const input = {
  productId: "11111111-1111-1111-1111-111111111111",
  profileId: "22222222-2222-2222-2222-222222222222",
  deviceToken: "signed-device-token",
  idempotencyKey: "33333333-3333-3333-3333-333333333333",
  source: "post" as const,
};

describe("recordOutboundTap", () => {
  const now = () => new Date("2026-07-17T00:00:00.000Z");

  it("appends a tap as an immutable event", async () => {
    const taps = makeFakeTaps();
    const tap = await recordOutboundTap({ taps, now }, input);

    expect(tap.id).toBe("tap-1");
    expect(tap.occurredAt).toEqual(now());
    expect(taps.rows).toHaveLength(1);
  });

  it("is idempotent: a retry with the same key does not double-count", async () => {
    const taps = makeFakeTaps();
    const first = await recordOutboundTap({ taps, now }, input);
    const second = await recordOutboundTap({ taps, now }, input);

    expect(second.id).toBe(first.id);
    expect(taps.rows).toHaveLength(1);
  });
});
