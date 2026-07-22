/**
 * Port for coupon-code copy events (ADR-0011): append-only like taps — the
 * Earnings "code copies" figure is a rebuildable projection over these rows.
 */

export type CodeCopy = {
  readonly id: string;
  readonly productId: string;
  readonly postId: string | null;
  readonly profileId: string;
  readonly occurredAt: Date;
};

export type NewCodeCopy = {
  readonly productId: string;
  readonly postId: string | null;
  readonly profileId: string;
  readonly deviceId: string;
  readonly idempotencyKey: string;
  readonly occurredAt: Date;
};

export type CodeCopyRepository = {
  /** Idempotent on `idempotencyKey`, same contract as TapRepository.append (§6.8). */
  append(copy: NewCodeCopy): Promise<CodeCopy>;
  findByIdempotencyKey(key: string): Promise<CodeCopy | null>;
};
