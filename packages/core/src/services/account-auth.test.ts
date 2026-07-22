import { describe, expect, it } from "vitest";
import { ConflictError, NotFoundError } from "../errors";
import type {
  AuthAccount,
  AuthAccountRepository,
  AuthMailer,
  AuthTokenRepository,
} from "../ports/auth-account-repository";
import {
  registerAccount,
  requestPasswordReset,
  resetPassword,
  verifyCredentials,
  verifyEmail,
} from "./account-auth";

/** In-memory fakes — the whole lifecycle runs without Prisma or a mailbox. */
function makeDeps(now = () => new Date("2026-07-22T00:00:00.000Z")) {
  const users = new Map<string, AuthAccount & { email: string }>();
  const tokens = new Map<string, { identifier: string; expires: Date }>();
  const sentLinks: string[] = [];

  const accounts: AuthAccountRepository = {
    async findByEmail(email) {
      return [...users.values()].find((u) => u.email === email) ?? null;
    },
    async createWithPassword({ email, passwordHash }) {
      if ([...users.values()].some((u) => u.email === email)) return "exists";
      const id = `user-${users.size + 1}`;
      users.set(id, { id, email, passwordHash, emailVerified: null });
      return { id };
    },
    async setPassword(userId, passwordHash) {
      const user = users.get(userId)!;
      users.set(userId, { ...user, passwordHash, emailVerified: now() });
    },
    async markVerified(userId) {
      const user = users.get(userId)!;
      users.set(userId, { ...user, emailVerified: now() });
    },
  };

  const tokenRepo: AuthTokenRepository = {
    async create(identifier, tokenHash, expires) {
      tokens.set(tokenHash, { identifier, expires });
    },
    async consume(tokenHash) {
      const row = tokens.get(tokenHash);
      if (!row) return null;
      tokens.delete(tokenHash);
      if (row.expires.getTime() < now().getTime()) return null;
      return { identifier: row.identifier };
    },
  };

  const mailer: AuthMailer = {
    async sendVerification(_email, url) {
      sentLinks.push(url);
    },
    async sendPasswordReset(_email, url) {
      sentLinks.push(url);
    },
  };

  const deps = { accounts, tokens: tokenRepo, mailer, webOrigin: "https://p.test", now };
  /** The raw token from the most recent email link. */
  const lastToken = () => new URL(sentLinks.at(-1)!).searchParams.get("token")!;
  return { deps, users, sentLinks, lastToken };
}

const EMAIL = "maya@example.com";
const PASSWORD = "correct-horse-8";

describe("register → verify → login", () => {
  it("runs the full lifecycle; login is blocked until the link is clicked", async () => {
    const { deps, lastToken } = makeDeps();
    await registerAccount(deps, { email: EMAIL, password: PASSWORD });

    expect(await verifyCredentials(deps, { email: EMAIL, password: PASSWORD })).toEqual({
      ok: false,
      reason: "unverified",
    });

    await verifyEmail(deps, { token: lastToken() });
    const result = await verifyCredentials(deps, { email: EMAIL, password: PASSWORD });
    expect(result.ok).toBe(true);
  });

  it("rejects a duplicate email with Conflict", async () => {
    const { deps } = makeDeps();
    await registerAccount(deps, { email: EMAIL, password: PASSWORD });
    await expect(
      registerAccount(deps, { email: EMAIL, password: "another-pass-9" }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("gives one generic failure for wrong email OR wrong password", async () => {
    const { deps, lastToken } = makeDeps();
    await registerAccount(deps, { email: EMAIL, password: PASSWORD });
    await verifyEmail(deps, { token: lastToken() });

    expect(await verifyCredentials(deps, { email: EMAIL, password: "wrong-pass-1" })).toEqual({
      ok: false,
      reason: "invalid",
    });
    expect(await verifyCredentials(deps, { email: "who@example.com", password: PASSWORD })).toEqual(
      { ok: false, reason: "invalid" },
    );
  });

  it("verification tokens are single-use", async () => {
    const { deps, lastToken } = makeDeps();
    await registerAccount(deps, { email: EMAIL, password: PASSWORD });
    const token = lastToken();
    await verifyEmail(deps, { token });
    await expect(verifyEmail(deps, { token })).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("password reset", () => {
  it("resets the password and verifies the email (the invited-Manager first password)", async () => {
    const { deps, lastToken, users } = makeDeps();
    // A passwordless, unverified user — exactly what a Manager invite creates.
    users.set("user-1", { id: "user-1", email: EMAIL, passwordHash: null, emailVerified: null });

    await requestPasswordReset(deps, { email: EMAIL });
    await resetPassword(deps, { token: lastToken(), password: PASSWORD });

    const result = await verifyCredentials(deps, { email: EMAIL, password: PASSWORD });
    expect(result.ok).toBe(true);
  });

  it("is never an existence oracle: unknown email resolves quietly, sends nothing", async () => {
    const { deps, sentLinks } = makeDeps();
    await expect(
      requestPasswordReset(deps, { email: "nobody@example.com" }),
    ).resolves.toBeUndefined();
    expect(sentLinks).toHaveLength(0);
  });

  it("a verify token cannot be spent as a reset token", async () => {
    const { deps, lastToken } = makeDeps();
    await registerAccount(deps, { email: EMAIL, password: PASSWORD });
    await expect(
      resetPassword(deps, { token: lastToken(), password: "new-pass-1234" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("expired tokens die on touch", async () => {
    let time = new Date("2026-07-22T00:00:00.000Z");
    const { deps, lastToken } = makeDeps(() => time);
    await registerAccount(deps, { email: EMAIL, password: PASSWORD });
    time = new Date("2026-07-24T00:00:01.000Z"); // past the 24h TTL
    await expect(verifyEmail(deps, { token: lastToken() })).rejects.toBeInstanceOf(NotFoundError);
  });
});
