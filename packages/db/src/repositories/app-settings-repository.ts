import type { AppSettingsRepository } from "@plugfolio/core";
import type { Prisma } from "../../generated/client";
import { prisma, type PrismaClient } from "../client";

/** Prisma implementation of the app-settings port (docs/implementation/admin-app.md). */

export function createAppSettingsRepository(db: PrismaClient = prisma): AppSettingsRepository {
  return {
    async get(key: string): Promise<unknown> {
      const row = await db.appSetting.findUnique({ where: { key }, select: { value: true } });
      return row?.value ?? null;
    },

    async set(key: string, value: unknown): Promise<void> {
      const json = value as Prisma.InputJsonValue;
      await db.appSetting.upsert({
        where: { key },
        create: { key, value: json },
        update: { value: json },
      });
    },
  };
}
