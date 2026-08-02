import { describe, expect, it } from "vitest";
import { ConflictError, NotFoundError } from "../errors";
import type {
  AuthAccount,
  AuthAccountRepository,
  AuthMailer,
  AuthTokenRepository,
} from "../ports/auth-account-repository";
import type { MemberHandleDeps } from "./member-handle";
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
  const sentCodes: string[] = [];

  /** Handles the fake owns too — verification claims one (ADR-0024). */
  const handles = new Map<string, string>();

  const accounts: AuthAccountRepository = {
    async findByEmail(email) {
      return [...users.values()].find((u) => u.email === email) ?? null;
    },
    async findByIdentifier(identifier) {
      const byHandle = handles.get(identifier);
      return [...users.values()].find((u) => u.email === identifier || u.id === byHandle) ?? null;
    },
    async createWithPassword({ email, passwordHash }) {
      if ([...users.values()].some((u) => u.email === email)) return "exists";
      const id = `user-${users.size + 1}`;
      users.set(id, { id, email, passwordHash, emailVerified: null, suspendedAt: null });
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
    async peek(tokenHash) {
      const row = tokens.get(tokenHash);
      if (!row || row.expires.getTime() < now().getTime()) return null;
      return { identifier: row.identifier };
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
    async sendVerification(_email, url, code) {
      sentLinks.push(url);
      sentCodes.push(code);
    },
    async sendPasswordReset(_email, url) {
      sentLinks.push(url);
    },
    async sendManagerInvite(_email, url) {
      sentLinks.push(url);
    },
  };

  // The handle side of verification: the same ports updateMemberHandle wants.
  const userRepo = {
    async updateUsername(userId: string, username: string) {
      const owner = handles.get(username);
      if (owner && owner !== userId) return "taken" as const;
      handles.set(username, userId);
      return "ok" as const;
    },
  } as unknown as MemberHandleDeps["users"];
  const settings = {
    async get() {
      return [];
    },
  } as unknown as MemberHandleDeps["settings"];

  const deps = {
    accounts,
    tokens: tokenRepo,
    mailer,
    webOrigin: "https://p.test",
    now,
    users: userRepo,
    settings,
  };
  /** The raw token from the most recent email link. */
  const lastToken = () => new URL(sentLinks.at(-1)!).searchParams.get("token")!;
  const lastCode = () => sentCodes.at(-1)!;
  return { deps, users, handles, sentLinks, lastToken, lastCode };
}

const EMAIL = "maya@example.com";
const PASSWORD = "correct-horse-8";
const HANDLE = "mayamakes";

describe("register → verify → login", () => {
  it("runs the full lifecycle; login is blocked until the link is clicked", async () => {
    const { deps, lastToken } = makeDeps();
    await registerAccount(deps, { email: EMAIL, password: PASSWORD });

    expect(await verifyCredentials(deps, { identifier: EMAIL, password: PASSWORD })).toEqual({
      ok: false,
      reason: "unverified",
    });

    await verifyEmail(deps, { token: lastToken(), username: HANDLE });
    const result = await verifyCredentials(deps, { identifier: EMAIL, password: PASSWORD });
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
    await verifyEmail(deps, { token: lastToken(), username: HANDLE });

    expect(await verifyCredentials(deps, { identifier: EMAIL, password: "wrong-pass-1" })).toEqual({
      ok: false,
      reason: "invalid",
    });
    expect(
      await verifyCredentials(deps, { identifier: "who@example.com", password: PASSWORD }),
    ).toEqual({ ok: false, reason: "invalid" });
  });

  it("a suspended account cannot log in — but only after the password check", async () => {
    const { deps, lastToken, users } = makeDeps();
    await registerAccount(deps, { email: EMAIL, password: PASSWORD });
    await verifyEmail(deps, { token: lastToken(), username: HANDLE });
    const [id, user] = [...users.entries()][0]!;
    users.set(id, { ...user, suspendedAt: new Date() });

    expect(await verifyCredentials(deps, { identifier: EMAIL, password: PASSWORD })).toEqual({
      ok: false,
      reason: "suspended",
    });
    // Wrong password stays "invalid" — suspension is never an email oracle.
    expect(await verifyCredentials(deps, { identifier: EMAIL, password: "wrong-pass-1" })).toEqual({
      ok: false,
      reason: "invalid",
    });
  });

  it("verification tokens are single-use", async () => {
    const { deps, lastToken } = makeDeps();
    await registerAccount(deps, { email: EMAIL, password: PASSWORD });
    const token = lastToken();
    await verifyEmail(deps, { token, username: HANDLE });
    await expect(verifyEmail(deps, { token, username: HANDLE })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});

describe("password reset", () => {
  it("resets the password and verifies the email (the invited-Manager first password)", async () => {
    const { deps, lastToken, users } = makeDeps();
    // A passwordless, unverified user — exactly what a Manager invite creates.
    users.set("user-1", {
      id: "user-1",
      email: EMAIL,
      passwordHash: null,
      emailVerified: null,
      suspendedAt: null,
    });

    await requestPasswordReset(deps, { email: EMAIL });
    await resetPassword(deps, { token: lastToken(), password: PASSWORD });

    const result = await verifyCredentials(deps, { identifier: EMAIL, password: PASSWORD });
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
    await expect(
      verifyEmail(deps, { token: lastToken(), username: HANDLE }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("the code, and the username the account picks (ADR-0024)", () => {
  it("the six-digit code verifies exactly like the link", async () => {
    const { deps, lastCode } = makeDeps();
    await registerAccount(deps, { email: EMAIL, password: PASSWORD });

    await verifyEmail(deps, { email: EMAIL, code: lastCode(), username: HANDLE });
    expect(await verifyCredentials(deps, { identifier: EMAIL, password: PASSWORD })).toEqual({
      ok: true,
      userId: "user-1",
    });
  });

  it("a code is worthless without the address it was sent to", async () => {
    const { deps, lastCode } = makeDeps();
    await registerAccount(deps, { email: EMAIL, password: PASSWORD });

    await expect(
      verifyEmail(deps, { email: "someone@example.com", code: lastCode(), username: HANDLE }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("a taken handle costs a retry, not the only link they have", async () => {
    const { deps, lastToken, handles } = makeDeps();
    handles.set(HANDLE, "another-user");
    await registerAccount(deps, { email: EMAIL, password: PASSWORD });
    const token = lastToken();

    await expect(verifyEmail(deps, { token, username: HANDLE })).rejects.toBeInstanceOf(
      ConflictError,
    );
    // The same link still works with a free handle — the proof was never spent.
    await verifyEmail(deps, { token, username: "maya.makes" });
    expect(await verifyCredentials(deps, { identifier: "maya.makes", password: PASSWORD })).toEqual(
      {
        ok: true,
        userId: "user-1",
      },
    );
  });

  it("the username is a login, with the same password as the email", async () => {
    const { deps, lastToken } = makeDeps();
    await registerAccount(deps, { email: EMAIL, password: PASSWORD });
    await verifyEmail(deps, { token: lastToken(), username: HANDLE });

    expect((await verifyCredentials(deps, { identifier: HANDLE, password: PASSWORD })).ok).toBe(
      true,
    );
    expect(await verifyCredentials(deps, { identifier: HANDLE, password: "wrong-pass-1" })).toEqual(
      {
        ok: false,
        reason: "invalid",
      },
    );
  });
});
