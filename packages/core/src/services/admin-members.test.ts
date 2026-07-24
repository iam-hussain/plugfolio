import { describe, expect, it } from "vitest";
import { ConflictError, NotFoundError } from "../errors";
import type { AdminMemberRepository } from "../ports/admin-repository";
import type { UserRepository } from "../ports/manager-repository";
import { fakeAudit, fakeSettings } from "../test/fakes";
import {
  deleteMemberAccount,
  resetMemberHandle,
  suspendMember,
  suspendMembersBulk,
  unsuspendMember,
} from "./admin-members";

const NOW = new Date("2026-07-24T00:00:00.000Z");

function makeDeps() {
  const suspensions = new Map<string, Date | null>([
    ["user-1", null],
    ["user-2", null],
  ]);
  const { audit, recorded } = fakeAudit();
  const members: AdminMemberRepository = {
    async search() {
      return { rows: [], total: 0 };
    },
    async setSuspended(userId, at) {
      if (!suspensions.has(userId)) return "not_found";
      suspensions.set(userId, at);
      return "ok";
    },
    async setSuspendedBulk(userIds, at) {
      let count = 0;
      for (const id of userIds) {
        if (suspensions.has(id)) {
          suspensions.set(id, at);
          count++;
        }
      }
      return count;
    },
    async detail() {
      return null;
    },
    async remove(userId) {
      if (!suspensions.has(userId)) return "not_found";
      suspensions.delete(userId);
      return { email: `${userId}@example.com` };
    },
  };
  return { deps: { members, audit, now: () => NOW }, suspensions, recorded };
}

describe("member suspension", () => {
  it("suspends with the required reason in the audit detail, and lifts", async () => {
    const { deps, suspensions, recorded } = makeDeps();

    await suspendMember(deps, "admin-1", "user-1", "impersonation report #42");
    expect(suspensions.get("user-1")).toEqual(NOW);
    expect(recorded[0]).toMatchObject({
      action: "member.suspend",
      detail: "impersonation report #42",
    });

    await unsuspendMember(deps, "admin-1", "user-1");
    expect(suspensions.get("user-1")).toBeNull();
    expect(recorded[1]!.action).toBe("member.unsuspend");
  });

  it("bulk-suspends with one audit entry naming count and reason", async () => {
    const { deps, suspensions, recorded } = makeDeps();
    const count = await suspendMembersBulk(deps, "admin-1", ["user-1", "user-2", "ghost"], "sweep");
    expect(count).toBe(2);
    expect(suspensions.get("user-2")).toEqual(NOW);
    expect(recorded[0]!.detail).toBe("2 members — sweep");
  });

  it("unknown member is a typed NotFoundError and records nothing", async () => {
    const { deps, recorded } = makeDeps();
    await expect(suspendMember(deps, "admin-1", "ghost", "r")).rejects.toBeInstanceOf(
      NotFoundError,
    );
    expect(recorded).toHaveLength(0);
  });
});

describe("account deletion", () => {
  it("deletes and audits the removed email", async () => {
    const { deps, suspensions, recorded } = makeDeps();
    await deleteMemberAccount(deps, "admin-1", "user-1");
    expect(suspensions.has("user-1")).toBe(false);
    expect(recorded[0]).toMatchObject({ action: "member.delete", detail: "user-1@example.com" });
  });
});

describe("handle reset", () => {
  function makeHandleDeps() {
    const base = makeDeps();
    const handles = new Map([["user-1", "maya"]]);
    const users: UserRepository = {
      async findOrCreateByEmail() {
        return { id: "user-x" };
      },
      async getHandle(userId) {
        return handles.get(userId) ?? null;
      },
      async updateUsername(userId, username) {
        if ([...handles.values()].includes(username)) return "taken";
        handles.set(userId, username);
        return "ok";
      },
    };
    return { ...base, deps: { ...base.deps, users, settings: fakeSettings().settings }, handles };
  }

  it("frees the old handle to the new one and audits old → new", async () => {
    const { deps, handles, recorded } = makeHandleDeps();
    await resetMemberHandle(deps, "admin-1", "user-1", "user-8f21a0c4");
    expect(handles.get("user-1")).toBe("user-8f21a0c4");
    expect(recorded[0]!.detail).toBe("@maya → @user-8f21a0c4");
  });

  it("rejects reserved handles", async () => {
    const { deps, recorded } = makeHandleDeps();
    await expect(resetMemberHandle(deps, "admin-1", "user-1", "dashboard")).rejects.toBeInstanceOf(
      ConflictError,
    );
    expect(recorded).toHaveLength(0);
  });
});
