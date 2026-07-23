import { describe, expect, it } from "vitest";
import { NotFoundError } from "../errors";
import type {
  AdminAuditEntry,
  AdminAuditRepository,
  AdminProfileRepository,
} from "../ports/admin-repository";
import { releaseProfileUsername, suspendProfile, unsuspendProfile } from "./admin-profiles";

const NOW = new Date("2026-07-23T00:00:00.000Z");

function makeDeps() {
  const rows = new Map<string, { username: string; suspendedAt: Date | null }>([
    ["profile-1", { username: "gadget-guru", suspendedAt: null }],
  ]);
  const recorded: AdminAuditEntry[] = [];
  const profiles: AdminProfileRepository = {
    async search() {
      return [];
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
      const previous = row.username;
      row.username = username;
      return { previous };
    },
  };
  const audit: AdminAuditRepository = {
    async record(entry) {
      recorded.push(entry);
    },
    async listRecent() {
      return [];
    },
  };
  return { deps: { profiles, audit, now: () => NOW }, rows, recorded };
}

describe("profile moderation", () => {
  it("suspends, audits, and lifts", async () => {
    const { deps, rows, recorded } = makeDeps();
    await suspendProfile(deps, "admin-1", "profile-1");
    expect(rows.get("profile-1")!.suspendedAt).toEqual(NOW);
    await unsuspendProfile(deps, "admin-1", "profile-1");
    expect(rows.get("profile-1")!.suspendedAt).toBeNull();
    expect(recorded.map((r) => r.action)).toEqual(["profile.suspend", "profile.unsuspend"]);
  });

  it("releases a username to a fresh random one and audits old → new", async () => {
    const { deps, rows, recorded } = makeDeps();
    const next = await releaseProfileUsername(deps, "admin-1", "profile-1");
    expect(next).toMatch(/^creator-[0-9a-f]{8}$/);
    expect(rows.get("profile-1")!.username).toBe(next);
    expect(recorded[0]).toMatchObject({ action: "profile.releaseUsername" });
    expect(recorded[0]!.detail).toBe(`gadget-guru → ${next}`);
  });

  it("unknown profile is a typed NotFoundError and records nothing", async () => {
    const { deps, recorded } = makeDeps();
    await expect(suspendProfile(deps, "admin-1", "ghost")).rejects.toBeInstanceOf(NotFoundError);
    await expect(releaseProfileUsername(deps, "admin-1", "ghost")).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(recorded).toHaveLength(0);
  });
});
