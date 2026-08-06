import type {
  AddCommentInput,
  FollowProfileInput,
  ReactToCommentInput,
  UpdateMemberHandleInput,
  WatchTargetInput,
} from "@plugfolio/core";
import { apiDelete, apiPatch, apiPost } from "@/lib/api-client";

/**
 * Client calls for the shopper-account actions (§5: components go through the
 * feature's api.ts). Contracts are the same Zod-inferred types the routes
 * validate, so client and server can't drift; transport is `lib/api-client`.
 */

export const followProfile = (input: FollowProfileInput) => apiPost("/api/follows", input);

export const unfollowProfile = (input: FollowProfileInput) =>
  apiDelete(`/api/follows/${input.profileId}`);

export const saveToWatchlist = (input: WatchTargetInput) => apiPost("/api/watchlist", input);

export const removeFromWatchlist = (input: WatchTargetInput) =>
  apiDelete(`/api/watchlist/${input.kind}/${input.targetId}`);

export const addComment = (input: AddCommentInput) => apiPost("/api/comments", input);

export const updateMemberImage = (input: { imageUrl: string | null }) =>
  apiPatch("/api/me/image", input);

export const updateMemberHandle = (input: UpdateMemberHandleInput) =>
  apiPatch("/api/me/handle", input);

export const reactToComment = (input: ReactToCommentInput) =>
  apiPost(`/api/comments/${input.commentId}/reaction`, { value: input.value });
