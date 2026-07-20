/** Public surface of the data layer. */
export { prisma, type PrismaClient } from "./client";
export { createTapRepository } from "./repositories/tap-repository";
export { createProductRepository } from "./repositories/product-repository";
export { createCreatorPageRepository } from "./repositories/creator-page-repository";
export { createEarningsRepository } from "./repositories/earnings-repository";
