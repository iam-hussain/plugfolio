import type { RecordOutboundTapInput } from "@plugfolio/core";

/**
 * Client-side calls into the backend for this feature (§5: components don't
 * `fetch` inline — they go through the feature's api.ts + TanStack Query).
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

export async function recordTap(input: RecordOutboundTapInput): Promise<RecordedTap> {
  const response = await fetch("/api/taps", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    // Send the signed device cookie so the server can verify identity (§6.7).
    credentials: "same-origin",
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(problem?.error?.message ?? "Failed to record tap");
  }

  const data = (await response.json()) as { tap: RecordedTap };
  return data.tap;
}
