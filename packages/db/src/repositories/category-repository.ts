import { Prisma } from "@prisma/client";
import type { CategoryPatch, CategoryRepository, CategoryView, NewCategory } from "@plugfolio/core";
import { prisma, type PrismaClient } from "../client";

const viewSelect = { id: true, title: true, description: true, sortOrder: true } as const;

function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

/** Prisma implementation of the `CategoryRepository` port (ADR-0010). */
export function createCategoryRepository(db: PrismaClient = prisma): CategoryRepository {
  return {
    async listByProfile(profileId: string): Promise<readonly CategoryView[]> {
      return db.category.findMany({
        where: { profileId },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: viewSelect,
      });
    },

    async findProfileId(categoryId: string): Promise<string | null> {
      const row = await db.category.findUnique({
        where: { id: categoryId },
        select: { profileId: true },
      });
      return row?.profileId ?? null;
    },

    async create(category: NewCategory): Promise<CategoryView | "duplicate"> {
      try {
        return await db.category.create({ data: category, select: viewSelect });
      } catch (error) {
        if (isUniqueViolation(error)) return "duplicate";
        throw error;
      }
    },

    async update(categoryId: string, patch: CategoryPatch): Promise<"ok" | "duplicate"> {
      try {
        await db.category.update({ where: { id: categoryId }, data: patch });
        return "ok";
      } catch (error) {
        if (isUniqueViolation(error)) return "duplicate";
        throw error;
      }
    },

    async remove(categoryId: string): Promise<void> {
      // Post/Product FKs are SET NULL — content falls back to "All".
      await db.category.delete({ where: { id: categoryId } });
    },
  };
}
