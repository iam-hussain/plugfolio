import { describe, expect, it } from "vitest";
import { ConflictError, NotFoundError } from "../errors";
import type { AdminProfileRepository } from "../ports/admin-repository";
import { fakeAudit, fakeSettings } from "../test/fakes";
import { releaseProfileUsername, suspendProfile, unsuspendProfile } from "./admin-profiles";

const NOW = new Date("2026-07-24T00:00:00.000Z");

function makeDeps() {
  const rows = new Map<string, { username: string; suspendedAt: Date | null }>([
    ["profile-1", { username: "gadget-guru", suspendedAt: null }],
  ]);
  const { audit, recorded } = fakeAudit();
  const profiles: AdminProfileRepository = {
    async search() {
      return { rows: [], total: 0 };
    },
    async setSuspended(profileId, at) {
      const row = rows.get(profileId);
      if (!row) return "not_found";
      row.suspendedAt = at;
      return "ok";
    },
    async setUsername(profileId, username) {
      const row = rows.get(profileId);
      if (!row) return "not_found";
      if ([...rows.values()].some((r) => r !== row && r.username === username)) return "taken";
      const previous = row.username;
      row.username = username;
      return { previous };
    },
    async detail() {
      return null;
    },
  };
  return {
    deps: { profiles, audit, settings: fakeSettings().settings, now: () => NOW },
    rows,
    recorded,
  };
}

describe("profile moderation", () => {
  it("suspends with the required reason, audits, and lifts", async () => {
    const { deps, rows, recorded } = makeDeps();
    await suspendProfile(deps, "admin-1", "profile-1", "stolen media");
    expect(rows.get("profile-1")!.suspendedAt).toEqual(NOW);
    expect(recorded[0]).toMatchObject({ action: "profile.suspend", detail: "stolen media" });
    await unsuspendProfile(deps, "admin-1", "profile-1");
    expect(rows.get("profile-1")!.suspendedAt).toBeNull();
  });

  it("releases a username to the admin-chosen name and audits old → new", async () => {
    const { deps, rows, recorded } = makeDeps();
    const next = await releaseProfileUsername(deps, "admin-1", {
      profileId: "profile-1",
      username: "creator-4f9d21ab",
    });
    expect(next).toBe("creator-4f9d21ab");
    expect(rows.get("profile-1")!.username).toBe(next);
    expect(recorded[0]!.detail).toBe("gadget-guru → creator-4f9d21ab");
  });

  it("rejects reserved and taken replacement names with typed ConflictErrors", async () => {
    const { deps, rows, recorded } = makeDeps();
    rows.set("profile-2", { username: "maya", suspendedAt: null });
    await expect(
      releaseProfileUsername(deps, "admin-1", { profileId: "profile-1", username: "dashboard" }),
    ).rejects.toBeInstanceOf(ConflictError);
    await expect(
      releaseProfileUsername(deps, "admin-1", { profileId: "profile-1", username: "maya" }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(rows.get("profile-1")!.username).toBe("gadget-guru");
    expect(recorded).toHaveLength(0);
  });

  it("unknown profile is a typed NotFoundError and records nothing", async () => {
    const { deps, recorded } = makeDeps();
    await expect(suspendProfile(deps, "admin-1", "ghost", "r")).rejects.toBeInstanceOf(
      NotFoundError,
    );
    await expect(
      releaseProfileUsername(deps, "admin-1", { profileId: "ghost", username: "creator-aaaa1111" }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(recorded).toHaveLength(0);
  });
});
