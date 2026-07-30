"use client";

import type { RecordViewInput } from "@plugfolio/core";
import { useEffect, useRef } from "react";
import { recordView } from "../api";

/** The target, without the idempotency key — the beacon mints its own. */
export type ViewBeaconProps =
  | { surface: "profile"; username: string }
  | { surface: "post"; postId: string }
  | { surface: "product"; productId: string };

/**
 * Counts one opening of a shoppable surface (the Traffic card's denominator).
 *
 * A client beacon rather than a server-render side effect, on purpose: an RSC
 * render happens on prefetch, on prerender and on every bot crawl, so counting
 * there would count pages nobody looked at. A mount happens in a browser.
 *
 * Renders nothing, fails silently, and never blocks paint — a view that goes
 * unrecorded is a missing row, not a broken page.
 */
export function ViewBeacon(target: ViewBeaconProps) {
  const fired = useRef(false);

  useEffect(() => {
    // Strict mode mounts twice in development; the idempotency key covers the
    // server, and this covers the wasted request.
    if (fired.current) return;
    fired.current = true;
    const input = { ...target, idempotencyKey: crypto.randomUUID() } as RecordViewInput;
    void recordView(input);
    // The surface a mounted page sits on never changes under it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
