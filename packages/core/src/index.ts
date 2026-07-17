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

// Schemas
export { recordOutboundTapInput, type RecordOutboundTapInput } from "./schemas/tap";

// Services (use-cases)
export { recordOutboundTap, type RecordOutboundTapDeps } from "./services/record-outbound-tap";
