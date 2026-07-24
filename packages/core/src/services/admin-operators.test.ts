import { describe, expect, it } from "vitest";
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from "../errors";
import { hashPassword } from "../auth/password";
import type { AdminUserRepository } from "../ports/admin-repository";
import type { AuthMailer, AuthTokenRepository } from "../ports/auth-account-repository";
import { fakeAudit } from "../test/fakes";
import {
  changeOwnPassword,
  inviteOperator,
  removeOperator,
  setOperatorPasswordWithToken,
} from "./admin-operators";

const NOW = new Date("2026-07-24T00:00:00.000Z");

function makeDeps() {
  const operators = new Map<string, { id: string; email: string; passwordHash: string | null }>([
    ["admin-1", { id: "admin-1", email: "ops@plugfolio.com", passwordHash: hashPassword("current-pass-1") }],
  ]);
  const tokens = new Map<string, { identifier: string; expires: Date }>();
  const sentLinks: string[] = [];
  const { audit, recorded } = fakeAudit();

  const admins: AdminUserRepository = {
    async findByEmail(email) {
      const row = [...operators.values()].find((o) => o.email === email);
      return row ? { ...row, name: null } : null;
    },
    async list() {
      return [];
    },
    async create({ email }) {
      if ([...operators.values()].some((o) => o.email === email)) return "exists";
      const id = `admin-${operators.size + 1}`;
      operators.set(id, { id, email, passwordHash: null });
      return { id };
    },
    async remove(id) {
      return operators.delete(id) ? "ok" : "not_found";
    },
    async count() {
      return operators.size;
    },
    async setPassword(id, passwordHash) {
      const row = operators.get(id);
      if (row) row.passwordHash = passwordHash;
    },
    async recordSignIn() {},
  };
  const tokenRepo: AuthTokenRepository = {
    async create(identifier, tokenHash, expires) {
      tokens.set(tokenHash, { identifier, expires });
    },
    async consume(tokenHash) {
      const row = tokens.get(tokenHash);
      if (!row) return null;
      tokens.delete(tokenHash);
      return { identifier: row.identifier };
    },
  };
  const mailer: AuthMailer = {
    async sendVerification() {},
    async sendPasswordReset(_email, url) {
      sentLinks.push(url);
    },
  };
  return {
    deps: {
      admins,
      audit,
      tokens: tokenRepo,
      mailer,
      adminOrigin: "https://admin.test",
      now: () => NOW,
    },
    operators,
    sentLinks,
    recorded,
  };
}

describe("operator management", () => {
  it("invites passwordless, emails the set-password link, and the link sets the password", async () => {
    const { deps, operators, sentLinks, recorded } = makeDeps();
    await inviteOperator(deps, "admin-1", { email: "kay@plugfolio.com", name: "Kay" });
    const invited = [...operators.values()].find((o) => o.email === "kay@plugfolio.com")!;
    expect(invited.passwordHash).toBeNull();
    expect(recorded[0]).toMatchObject({ action: "admin.invite", detail: "kay@plugfolio.com" });

    const token = sentLinks[0]!.split("token=")[1]!;
    await setOperatorPasswordWithToken(deps, { token, password: "brand-new-pass-1" });
    expect(invited.passwordHash).not.toBeNull();
  });

  it("rejects duplicate invites", async () => {
    const { deps } = makeDeps();
    await expect(
      inviteOperator(deps, "admin-1", { email: "ops@plugfolio.com", name: null }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("never removes yourself and never the last operator", async () => {
    const { deps, operators } = makeDeps();
    await expect(removeOperator(deps, "admin-1", "admin-1")).rejects.toBeInstanceOf(ForbiddenError);
    await expect(removeOperator(deps, "admin-1", "ghost")).rejects.toBeInstanceOf(ForbiddenError); // last operator guard
    operators.set("admin-2", { id: "admin-2", email: "kay@plugfolio.com", passwordHash: null });
    await expect(removeOperator(deps, "admin-1", "ghost")).rejects.toBeInstanceOf(NotFoundError);
    await removeOperator(deps, "admin-1", "admin-2");
    expect(operators.has("admin-2")).toBe(false);
  });

  it("changes own password only with the current one", async () => {
    const { deps, operators } = makeDeps();
    const me = { id: "admin-1", email: "ops@plugfolio.com" };
    await expect(
      changeOwnPassword(deps, me, { currentPassword: "wrong", newPassword: "next-pass-12" }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    await changeOwnPassword(deps, me, {
      currentPassword: "current-pass-1",
      newPassword: "next-pass-12",
    });
    expect(operators.get("admin-1")!.passwordHash).not.toBeNull();
  });

  it("expired/foreign tokens never set a password", async () => {
    const { deps } = makeDeps();
    await expect(
      setOperatorPasswordWithToken(deps, { token: "bogus", password: "whatever-123" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
