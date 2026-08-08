import { describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "../errors";
import type { ProfileIdentityRepository } from "../ports/profile-identity-repository";
import type { ProfileRepository } from "../ports/profile-repository";
import { deleteProfile, getMyProfileIdentity, updateProfileIdentity } from "./profile-identity";

const PROFILE_ID = "00000000-0000-0000-0000-0000000000b1";

function makeDeps(role: "admin" | "manager" | null) {
  const profiles = {
    listAccessibleByUser: vi
      .fn()
      .mockResolvedValue(
        role
          ? [{ id: PROFILE_ID, username: "lena", displayName: null, avatarUrl: null, role }]
          : [],
      ),
  } as unknown as ProfileRepository;
  const identity: ProfileIdentityRepository = {
    get: vi.fn().mockResolvedValue({ displayName: null, avatarUrl: null, bio: null }),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  };
  return { profiles, identity };
}

describe("profile identity", () => {
  it("lets the Admin edit everything", async () => {
    const deps = makeDeps("admin");
    await updateProfileIdentity(deps, "u1", {
      profileId: PROFILE_ID,
      displayName: "Lena",
      avatarUrl: "https://img.example.com/lena.jpg",
      bio: "Everyday carry",
    });
    expect(deps.identity.update).toHaveBeenCalledWith(PROFILE_ID, {
      displayName: "Lena",
      avatarUrl: "https://img.example.com/lena.jpg",
      bio: "Everyday carry",
    });
  });

  it("lets a Manager change ONLY the picture (brief 10)", async () => {
    const deps = makeDeps("manager");
    await updateProfileIdentity(deps, "u2", {
      profileId: PROFILE_ID,
      avatarUrl: "https://img.example.com/new.jpg",
    });
    expect(deps.identity.update).toHaveBeenCalledWith(PROFILE_ID, {
      avatarUrl: "https://img.example.com/new.jpg",
    });
    await expect(
      updateProfileIdentity(deps, "u2", { profileId: PROFILE_ID, displayName: "Nope" }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("rejects strangers everywhere and non-Admin deletes", async () => {
    const stranger = makeDeps(null);
    await expect(getMyProfileIdentity(stranger, "u3", PROFILE_ID)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
    const manager = makeDeps("manager");
    await expect(deleteProfile(manager, "u2", PROFILE_ID)).rejects.toBeInstanceOf(ForbiddenError);
    expect(manager.identity.delete).not.toHaveBeenCalled();
  });

  it("deletes for the Admin", async () => {
    const deps = makeDeps("admin");
    await deleteProfile(deps, "u1", PROFILE_ID);
    expect(deps.identity.delete).toHaveBeenCalledWith(PROFILE_ID);
  });
});
