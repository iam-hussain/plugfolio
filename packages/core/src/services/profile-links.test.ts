import { describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "../errors";
import type { ProfileLinkRepository } from "../ports/profile-link-repository";
import type { ProfileRepository } from "../ports/profile-repository";
import { getProfileLinks, listMyProfileLinks, setProfileLinks } from "./profile-links";

const PROFILE_ID = "00000000-0000-0000-0000-0000000000b1";
const OWNER = "owner-user";

function makeDeps(stored: Parameters<ProfileLinkRepository["replaceAll"]>[1] = []) {
  const profiles = {
    listByUser: vi
      .fn()
      .mockImplementation(async (userId: string) =>
        userId === OWNER ? [{ id: PROFILE_ID, username: "lena" }] : [],
      ),
  } as unknown as ProfileRepository;
  const profileLinks: ProfileLinkRepository = {
    listByProfile: vi.fn().mockResolvedValue(stored),
    replaceAll: vi.fn().mockResolvedValue(undefined),
  };
  return { profiles, profileLinks };
}

describe("profile links", () => {
  it("rejects a non-Admin (a Manager reaches content, never Settings)", async () => {
    const deps = makeDeps();
    await expect(
      setProfileLinks(deps, "manager-user", { profileId: PROFILE_ID, links: [] }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(listMyProfileLinks(deps, "manager-user", PROFILE_ID)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it("replaces the whole set on save", async () => {
    const deps = makeDeps();
    const links = [{ platform: "youtube" as const, url: "https://youtube.com/@lena" }];
    await setProfileLinks(deps, OWNER, { profileId: PROFILE_ID, links });
    expect(deps.profileLinks.replaceAll).toHaveBeenCalledWith(PROFILE_ID, links);
  });

  it("returns links in the canonical row order for everyone", async () => {
    const deps = makeDeps([
      { platform: "website", url: "https://lena.example.com" },
      { platform: "instagram", url: "https://instagram.com/lena" },
    ]);
    const links = await getProfileLinks(deps, PROFILE_ID);
    expect(links.map((link) => link.platform)).toEqual(["instagram", "website"]);
  });
});
