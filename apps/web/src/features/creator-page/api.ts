import type { RecordCodeCopyInput, RecordOutboundTapInput, RecordViewInput } from "@plugfolio/core";
import { apiPost } from "@/lib/api-client";

/**
 * Client-side calls into the backend for this feature (§5: components don't
 * `fetch` inline — they go through the feature's api.ts + TanStack Query),
 * over the shared `lib/api-client` transport.
 *
 * The request type is the SAME Zod-inferred contract the route validates
 * (`@plugfolio/core`), so client and server can't drift. This is exactly the
 * REST contract the native app will reuse.
 */
export type RecordedTap = {
  id: string;
  productId: string;
  postId: string | null;
  profileId: string;
  source: RecordOutboundTapInput["source"];
  occurredAt: string;
};

export const recordTap = (input: RecordOutboundTapInput): Promise<RecordedTap> =>
  apiPost<{ tap: RecordedTap }>("/api/taps", input, {
    fallbackMessage: "Failed to record tap",
  }).then((data) => data.tap);

/** The second attribution event (ADR-0011). Fire-and-forget from the caller's
 * perspective — copying the code never waits on this. */
export const recordCodeCopy = (input: RecordCodeCopyInput): Promise<void> =>
  apiPost("/api/code-copies", input, { fallbackMessage: "Failed to record code copy" });

/**
 * The third attribution event: a surface opening. Genuinely fire-and-forget —
 * a failed view is one missing row, and nothing on the page waits on it or
 * shows an error for it, so it swallows every failure.
 */
export function recordView(input: RecordViewInput): void {
  void apiPost("/api/views", input, { keepalive: true }).catch(() => {});
}
