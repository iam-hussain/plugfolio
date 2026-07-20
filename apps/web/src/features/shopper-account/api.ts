import type { AddCommentInput, FollowProfileInput } from "@plugfolio/core";

/**
 * Client calls for the shopper-account actions (§5: components go through the
 * feature's api.ts). Contracts are the same Zod-inferred types the routes
 * validate, so client and server can't drift.
 */

async function parseError(response: Response): Promise<Error> {
  const problem = (await response.json().catch(() => null)) as {
    error?: { message?: string };
  } | null;
  return new Error(problem?.error?.message ?? "Request failed");
}

export async function followProfile(input: FollowProfileInput): Promise<void> {
  const response = await fetch("/api/follows", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    credentials: "same-origin",
  });
  if (!response.ok) throw await parseError(response);
}

export async function unfollowProfile(input: FollowProfileInput): Promise<void> {
  const response = await fetch(`/api/follows/${input.profileId}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  if (!response.ok) throw await parseError(response);
}

export async function addComment(input: AddCommentInput): Promise<void> {
  const response = await fetch("/api/comments", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    credentials: "same-origin",
  });
  if (!response.ok) throw await parseError(response);
}
