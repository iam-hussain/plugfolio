/**
 * Port for view events — the third attribution event, and the denominator the
 * other two never had. Append-only like Tap and CodeCopy (§6.6): the Traffic
 * read model aggregates these rows and is rebuildable from them.
 */

export type ViewSurface = "profile" | "post" | "product";

export type View = {
  readonly id: string;
  readonly profileId: string;
  readonly postId: string | null;
  readonly productId: string | null;
  readonly surface: ViewSurface;
  readonly occurredAt: Date;
};

export type NewView = {
  readonly profileId: string;
  readonly postId: string | null;
  readonly productId: string | null;
  readonly deviceId: string;
  readonly idempotencyKey: string;
  readonly surface: ViewSurface;
  readonly occurredAt: Date;
};

export type ViewRepository = {
  /** Idempotent on `idempotencyKey`, same contract as TapRepository.append (§6.8). */
  append(view: NewView): Promise<View>;
  findByIdempotencyKey(key: string): Promise<View | null>;
};

/**
 * Resolves what was opened to whose profile it is. The boundary never accepts
 * a `profileId` — same rule as taps (§6.4) — so attribution is derived here
 * from a thing that exists, and a client cannot file views against a stranger.
 */
export type ViewTargetRepository = {
  profileIdForUsername(username: string): Promise<string | null>;
  profileIdForPost(postId: string): Promise<string | null>;
  profileIdForProduct(productId: string): Promise<string | null>;
};
