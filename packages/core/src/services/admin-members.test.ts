import { describe, expect, it } from "vitest";
import { NotFoundError } from "../errors";
import type {
  AdminAuditEntry,
  AdminAuditRepository,
  AdminMemberRepository,
} from "../ports/admin-repository";
import { suspendMember, unsuspendMember } from "./admin-members";

const NOW = new Date("2026-07-23T00:00:00.000Z");

function makeDeps() {
  const suspensions = new Map<string, Date | null>([["user-1", null]]);
  const recorded: AdminAuditEntry[] = [];
  const members: AdminMemberRepository = {
    async search() {
      return [];
    },
    async setSuspended(userId, at) {
      if (!suspensions.has(userId)) return "not_found";
      suspensions.set(userId, at);
      return "ok";
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
  return { deps: { members, audit, now: () => NOW }, suspensions, recorded };
}

describe("member suspension", () => {
  it("suspends, audits, and lifts", async () => {
    const { deps, suspensions, recorded } = makeDeps();

    await suspendMember(deps, "admin-1", "user-1");
    expect(suspensions.get("user-1")).toEqual(NOW);

    await unsuspendMember(deps, "admin-1", "user-1");
    expect(suspensions.get("user-1")).toBeNull();

    expect(recorded.map((r) => r.action)).toEqual(["member.suspend", "member.unsuspend"]);
    expect(recorded[0]).toMatchObject({ adminId: "admin-1", targetType: "user", targetId: "user-1" });
  });

  it("unknown member is a typed NotFoundError and records nothing", async () => {
    const { deps, recorded } = makeDeps();
    await expect(suspendMember(deps, "admin-1", "ghost")).rejects.toBeInstanceOf(NotFoundError);
    expect(recorded).toHaveLength(0);
  });
});
