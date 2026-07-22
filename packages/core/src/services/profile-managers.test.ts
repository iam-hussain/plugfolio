import { describe, expect, it } from "vitest";
import { ConflictError, ForbiddenError } from "../errors";
import type { ManagerRepository, UserRepository } from "../ports/manager-repository";
import type { ProfileRepository } from "../ports/profile-repository";
import {
  MAX_MANAGERS_PER_PROFILE,
  inviteManager,
  listManagers,
  removeManager,
} from "./profile-managers";

const ADMIN = "10000000-0000-0000-0000-000000000001";
const MANAGER_USER = "10000000-0000-0000-0000-000000000002";
const PROFILE_ID = "20000000-0000-0000-0000-000000000001";

function makeDeps(existingManagers = 0) {
  const added: string[] = [];
  const removed: string[] = [];

  const profiles: ProfileRepository = {
    async listByUser(userId) {
      return userId === ADMIN ? [{ id: PROFILE_ID, username: "lena" }] : [];
    },
    async listAccessibleByUser(userId) {
      if (userId === ADMIN) return [{ id: PROFILE_ID, username: "lena", role: "admin" }];
      if (userId === MANAGER_USER) return [{ id: PROFILE_ID, username: "lena", role: "manager" }];
      return [];
    },
    async exists() {
      return true;
    },
    async countByUser() {
      return 1;
    },
    async create() {
      throw new Error("not used");
    },
  };
  const managers: ManagerRepository = {
    async list() {
      return [];
    },
    async count() {
      return existingManagers;
    },
    async add(_profileId, userId) {
      added.push(userId);
    },
    async remove(_profileId, userId) {
      removed.push(userId);
    },
  };
  const users: UserRepository = {
    async findOrCreateByEmail(email) {
      return { id: email === "admin@example.com" ? ADMIN : MANAGER_USER };
    },
    async getHandle() {
      return "user-abc12345";
    },
    async updateUsername() {
      return "ok";
    },
  };

  return { deps: { profiles, managers, users }, added, removed };
}

describe("inviteManager", () => {
  it("admin invites by email; the invitee user is found or created", async () => {
    const { deps, added } = makeDeps();
    await inviteManager(deps, ADMIN, { profileId: PROFILE_ID, email: "helper@example.com" });
    expect(added).toEqual([MANAGER_USER]);
  });

  it("only the Admin can invite — a Manager cannot", async () => {
    const { deps } = makeDeps();
    await expect(
      inviteManager(deps, MANAGER_USER, { profileId: PROFILE_ID, email: "x@example.com" }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("caps a profile at three Managers", async () => {
    const { deps } = makeDeps(MAX_MANAGERS_PER_PROFILE);
    await expect(
      inviteManager(deps, ADMIN, { profileId: PROFILE_ID, email: "x@example.com" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("rejects inviting the Admin themself", async () => {
    const { deps } = makeDeps();
    await expect(
      inviteManager(deps, ADMIN, { profileId: PROFILE_ID, email: "admin@example.com" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});

describe("removeManager / listManagers", () => {
  it("admin removes a manager", async () => {
    const { deps, removed } = makeDeps();
    await removeManager(deps, ADMIN, PROFILE_ID, MANAGER_USER);
    expect(removed).toEqual([MANAGER_USER]);
  });

  it("settings stay Admin-only: a Manager cannot list or remove", async () => {
    const { deps } = makeDeps();
    await expect(listManagers(deps, MANAGER_USER, PROFILE_ID)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
    await expect(removeManager(deps, MANAGER_USER, PROFILE_ID, ADMIN)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });
});
