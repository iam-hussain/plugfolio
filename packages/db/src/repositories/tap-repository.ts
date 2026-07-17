import type { NewOutboundTap, OutboundTap, TapRepository } from "@plugfolio/core";
import { Prisma } from "@prisma/client";
import { prisma, type PrismaClient } from "../client";

/**
 * Prisma implementation of the `TapRepository` port. This is the ONLY place
 * Prisma touches taps (§6.2). It maps DB rows to domain entities so nothing
 * outside this file depends on the Prisma shape.
 */
export function createTapRepository(db: PrismaClient = prisma): TapRepository {
  return {
    async append(tap: NewOutboundTap): Promise<OutboundTap> {
      try {
        const row = await db.tap.create({
          data: {
            productId: tap.productId,
            profileId: tap.profileId,
            deviceId: tap.deviceId,
            idempotencyKey: tap.idempotencyKey,
            source: tap.source,
            occurredAt: tap.occurredAt,
          },
        });
        return toDomain(row);
      } catch (error) {
        // Idempotency race (§6.8): a concurrent request won the insert between
        // our not-found check and this create. Return the winning row rather
        // than surfacing the unique-violation as a conflict — the double-fire
        // is exactly what idempotency promises to absorb.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          const winner = await db.tap.findUnique({
            where: { idempotencyKey: tap.idempotencyKey },
          });
          if (winner) return toDomain(winner);
        }
        throw error;
      }
    },

    async findByIdempotencyKey(key: string): Promise<OutboundTap | null> {
      const row = await db.tap.findUnique({ where: { idempotencyKey: key } });
      return row ? toDomain(row) : null;
    },
  };
}

type TapRow = {
  id: string;
  productId: string;
  profileId: string;
  deviceId: string;
  idempotencyKey: string;
  source: "profile" | "post" | "product";
  occurredAt: Date;
};

function toDomain(row: TapRow): OutboundTap {
  return {
    id: row.id,
    productId: row.productId,
    profileId: row.profileId,
    deviceId: row.deviceId,
    idempotencyKey: row.idempotencyKey,
    source: row.source,
    occurredAt: row.occurredAt,
  };
}
