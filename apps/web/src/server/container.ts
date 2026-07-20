import {
  createCreatorPageRepository,
  createProductRepository,
  createTapRepository,
} from "@plugfolio/db";

/**
 * Composition root: the app wires domain services to their concrete Prisma
 * repositories here. Services (in @plugfolio/core) stay ignorant of Prisma; this
 * is the only seam that knows both sides (§6 layering).
 */
export const repositories = {
  taps: createTapRepository(),
  products: createProductRepository(),
  creatorPages: createCreatorPageRepository(),
};

export const clock = { now: () => new Date() };
