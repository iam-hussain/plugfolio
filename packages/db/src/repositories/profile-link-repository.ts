import type { ProfileLinkRepository, ProfileLinkView, SocialPlatform } from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

/** Prisma implementation of the `ProfileLinkRepository` port ("Your links"). */
export function createProfileLinkRepository(db: PrismaClient = prisma): ProfileLinkRepository {
  return {
    async listByProfile(profileId: string): Promise<readonly ProfileLinkView[]> {
      const rows = await db.profileLink.findMany({
        where: { profileId },
        select: { platform: true, url: true },
      });
      // The platform column is a string in Postgres; the Zod boundary is the
      // only writer, so the cast is safe.
      return rows.map((row) => ({ platform: row.platform as SocialPlatform, url: row.url }));
    },

    async replaceAll(profileId: string, links: readonly ProfileLinkView[]): Promise<void> {
      await db.$transaction([
        db.profileLink.deleteMany({ where: { profileId } }),
        db.profileLink.createMany({
          data: links.map((link) => ({ profileId, platform: link.platform, url: link.url })),
        }),
      ]);
    },
  };
}
