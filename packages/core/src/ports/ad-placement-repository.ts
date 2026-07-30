/**
 * Port for sponsored placements (ADR-0020). An operator creates these in the
 * admin app; the shopper surface only ever reads the one that is live.
 */
export type AdPlacement = {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly imageUrl: string | null;
  readonly url: string;
  readonly activeFrom: Date;
  readonly activeUntil: Date | null;
};

export type AdPlacementRepository = {
  /** The placement to show right now, or null. Never more than one. */
  findLive(now: Date): Promise<AdPlacement | null>;
  /** The operator's list, newest first — including expired ones. */
  list(): Promise<readonly AdPlacement[]>;
  create(placement: Omit<AdPlacement, "id">): Promise<AdPlacement>;
  remove(id: string): Promise<void>;
};
