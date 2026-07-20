/**
 * Public surface of the domain (§5: import from a package's index, never its
 * internals). The HTTP layer and services composition wire against these.
 */

// Errors
export * from "./errors";

// Domain
export type { OutboundTap, NewOutboundTap, TapSource } from "./domain/tap";

// Ports (repository interfaces implemented in @plugfolio/db)
export type { TapRepository } from "./ports/tap-repository";
export type { ProductReadRepository, ProductForAttribution } from "./ports/product-repository";
export type {
  CreatorPageReadRepository,
  CreatorPage,
  ShopperPost,
  ShopperProduct,
  ShopperProductView,
} from "./ports/creator-page-repository";
export type {
  EarningsReadRepository,
  EarningsSummary,
  PostTapCount,
  ProductTapCount,
} from "./ports/earnings-repository";

// Schemas
export {
  recordOutboundTapInput,
  type RecordOutboundTapInput,
  type RecordOutboundTapCommand,
} from "./schemas/tap";

// Services (use-cases)
export { recordOutboundTap, type RecordOutboundTapDeps } from "./services/record-outbound-tap";
export {
  getCreatorPage,
  getShopperPost,
  getShopperProduct,
  type CreatorPageReadDeps,
} from "./services/creator-page-reads";
export { getEarnings, type EarningsReadDeps } from "./services/get-earnings";
