import { describe, expect, it } from "vitest";
import { ForbiddenError, NotFoundError } from "../errors";
import type { CommentRepository, CommentView, NewComment } from "../ports/comment-repository";
import type { FollowRepository } from "../ports/follow-repository";
import type { ProfileRepository } from "../ports/profile-repository";
import { addComment, followProfile, getFollowedProfiles, unfollowProfile } from "./shopper-social";

const PROFILE_ID = "11111111-1111-1111-1111-111111111111";
const USER_ID = "22222222-2222-2222-2222-222222222222";
/** A creator who is Admin of PROFILE_ID (for ADR-0009 identity tests). */
const CREATOR_ID = "33333333-3333-3333-3333-333333333333";

/** In-memory fakes — services stay testable without Prisma. */
function makeFakeProfiles(): ProfileRepository {
  return {
    async listByUser() {
      return [];
    },
    async listAccessibleByUser(userId: string) {
      return userId === CREATOR_ID
        ? [{ id: PROFILE_ID, username: "lena", role: "admin" as const }]
        : [];
    },
    async exists(profileId: string) {
      return profileId === PROFILE_ID;
    },
    async countByUser() {
      return 1;
    },
    async create() {
      throw new Error("not used");
    },
  };
}

function makeFakeFollows(): FollowRepository & { rows: Set<string> } {
  const rows = new Set<string>();
  return {
    rows,
    async add(userId, profileId) {
      rows.add(`${userId}:${profileId}`);
    },
    async remove(userId, profileId) {
      rows.delete(`${userId}:${profileId}`);
    },
    async isFollowing(userId, profileId) {
      return rows.has(`${userId}:${profileId}`);
    },
    async listProfilesByUser() {
      return [...rows].map((key) => ({ id: key.split(":")[1]!, username: "someone" }));
    },
  };
}

function makeFakeComments(): CommentRepository & { rows: CommentView[] } {
  const rows: CommentView[] = [];
  return {
    rows,
    async add(comment: NewComment) {
      const view: CommentView = {
        id: `comment-${rows.length + 1}`,
        body: comment.body,
        author: { name: null, handle: "user-abc12345" },
        asProfile: comment.asProfileId ? { username: "lena" } : null,
        createdAt: new Date("2026-07-20T00:00:00.000Z"),
      };
      rows.push(view);
      return view;
    },
    async listByProfile() {
      return rows;
    },
  };
}

function makeDeps() {
  return {
    follows: makeFakeFollows(),
    comments: makeFakeComments(),
    profiles: makeFakeProfiles(),
  };
}

describe("followProfile", () => {
  it("follows an existing profile, idempotently", async () => {
    const deps = makeDeps();
    await followProfile(deps, USER_ID, PROFILE_ID);
    await followProfile(deps, USER_ID, PROFILE_ID);

    expect(deps.follows.rows.size).toBe(1);
    expect(await getFollowedProfiles(deps, USER_ID)).toHaveLength(1);
  });

  it("rejects following an unknown profile with NotFound", async () => {
    const deps = makeDeps();
    await expect(
      followProfile(deps, USER_ID, "99999999-9999-9999-9999-999999999999"),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.follows.rows.size).toBe(0);
  });

  it("unfollow of something never followed is a quiet no-op", async () => {
    const deps = makeDeps();
    await expect(unfollowProfile(deps, USER_ID, PROFILE_ID)).resolves.toBeUndefined();
  });
});

describe("addComment", () => {
  it("adds a comment to an existing profile", async () => {
    const deps = makeDeps();
    const comment = await addComment(deps, USER_ID, { profileId: PROFILE_ID, body: "Love this" });

    expect(comment.body).toBe("Love this");
    expect(deps.comments.rows).toHaveLength(1);
  });

  it("rejects commenting on an unknown profile with NotFound", async () => {
    const deps = makeDeps();
    await expect(
      addComment(deps, USER_ID, {
        profileId: "99999999-9999-9999-9999-999999999999",
        body: "hello",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.comments.rows).toHaveLength(0);
  });

  it("lets a member speak AS their profile (ADR-0009)", async () => {
    const deps = makeDeps();
    const comment = await addComment(deps, CREATOR_ID, {
      profileId: PROFILE_ID,
      asProfileId: PROFILE_ID,
      body: "Thanks — glad you love them!",
    });
    expect(comment.asProfile).toEqual({ username: "lena" });
  });

  it("rejects speaking as a profile the author doesn't belong to", async () => {
    const deps = makeDeps();
    await expect(
      addComment(deps, USER_ID, {
        profileId: PROFILE_ID,
        asProfileId: PROFILE_ID,
        body: "pretending to be the brand",
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.comments.rows).toHaveLength(0);
  });
});
