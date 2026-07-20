"use client";

import type { TapSource } from "@plugfolio/core";
import { Button } from "@plugfolio/ui";
import { useRecordTap } from "../hooks/use-record-tap";

/**
 * The shopper's buy action — a client island on an otherwise server-rendered
 * page. It records the outbound tap for attribution, then forwards to the
 * creator's affiliate link. No account required (ADR-0002).
 */
export type ProductTapButtonProps = {
  productId: string;
  affiliateUrl: string;
  /** The post that drove the tap, for per-post earnings attribution. */
  postId?: string;
  source?: TapSource;
  label?: string;
};

export function ProductTapButton({
  productId,
  affiliateUrl,
  postId,
  source = "product",
  label = "Buy",
}: ProductTapButtonProps) {
  const recordTap = useRecordTap();

  function handleTap() {
    // Fresh key per intent so a double-fire collapses to one event (§6.8).
    const idempotencyKey = crypto.randomUUID();
    recordTap.mutate(
      { productId, postId, idempotencyKey, source },
      // Forward whether or not recording succeeded — never block the shopper's
      // purchase on attribution.
      { onSettled: () => window.location.assign(affiliateUrl) },
    );
  }

  return (
    <Button variant="accent" onClick={handleTap} disabled={recordTap.isPending}>
      {recordTap.isPending ? "Opening…" : label}
    </Button>
  );
}
