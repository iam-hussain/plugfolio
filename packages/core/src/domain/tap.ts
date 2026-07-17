/**
 * Domain entity for an outbound tap. Taps are immutable attribution events
 * (§6.6 append-only); the Earnings truth is a rebuildable projection over them,
 * never a mutated counter. No framework or DB imports live here.
 */
export type TapSource = "profile" | "post" | "product";

export type OutboundTap = {
  readonly id: string;
  readonly productId: string;
  /** Derived from the product, never trusted from the client (§6.6 integrity). */
  readonly profileId: string;
  /** Verified device identity (from the signed cookie), NOT a raw client value. */
  readonly deviceId: string;
  readonly idempotencyKey: string;
  readonly source: TapSource;
  readonly occurredAt: Date;
};

/** A tap that has not yet been assigned a persisted id. */
export type NewOutboundTap = Omit<OutboundTap, "id">;
