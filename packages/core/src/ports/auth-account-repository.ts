/**
 * Ports for password auth (ADR-0012). Tokens ride the Auth.js
 * VerificationToken table, stored HASHED (a leaked table must not grant
 * takeover); the identifier encodes intent + email (`verify:<email>`,
 * `reset:<email>`).
 */

export type AuthAccount = {
  readonly id: string;
  /** Carried so a lookup by handle still knows where to mail (ADR-0024). */
  readonly email: string;
  readonly passwordHash: string | null;
  readonly emailVerified: Date | null;
  /** Admin suspension (docs/implementation/admin-app.md): set = login blocked. */
  readonly suspendedAt: Date | null;
};

export type AuthAccountRepository = {
  findByEmail(email: string): Promise<AuthAccount | null>;
  /** Email or member handle — login and resend accept either (ADR-0024). */
  findByIdentifier(identifier: string): Promise<AuthAccount | null>;
  /** "exists" surfaces the unique-email constraint for a typed ConflictError. */
  createWithPassword(account: {
    email: string;
    username: string;
    passwordHash: string;
    /** The person's display name, when the join form collected one. */
    name: string | null;
  }): Promise<{ id: string } | "exists">;
  /** Also marks the email verified — a reset/invite link proves the inbox. */
  setPassword(userId: string, passwordHash: string): Promise<void>;
  markVerified(userId: string): Promise<void>;
};

export type AuthTokenRepository = {
  create(identifier: string, tokenHash: string, expires: Date): Promise<void>;
  /** Reads WITHOUT spending — verification checks the picked handle first, so
   * "that handle is taken" costs a retry, not the only link they have. */
  peek(tokenHash: string): Promise<{ identifier: string } | null>;
  /** Single-use: deletes on read; null when unknown or expired. */
  consume(tokenHash: string): Promise<{ identifier: string } | null>;
};

/** Dev logs links; a real transport plugs in at deployment (ADR-0007 note). */
export type AuthMailer = {
  /** The code is the same proof as the link, typed instead of tapped (ADR-0024). */
  sendVerification(email: string, url: string, code: string): Promise<void>;
  sendPasswordReset(email: string, url: string): Promise<void>;
  /** A Manager invite leads with WHO invited them and WHICH profile — a
   * distinct email from the bare reset, though the link is the same
   * set-password token (ADR-0012). */
  sendManagerInvite(
    email: string,
    url: string,
    context: { inviterName: string; profileHandle: string },
  ): Promise<void>;
};
