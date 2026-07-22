/**
 * Ports for password auth (ADR-0012). Tokens ride the Auth.js
 * VerificationToken table, stored HASHED (a leaked table must not grant
 * takeover); the identifier encodes intent + email (`verify:<email>`,
 * `reset:<email>`).
 */

export type AuthAccount = {
  readonly id: string;
  readonly passwordHash: string | null;
  readonly emailVerified: Date | null;
};

export type AuthAccountRepository = {
  findByEmail(email: string): Promise<AuthAccount | null>;
  /** "exists" surfaces the unique-email constraint for a typed ConflictError. */
  createWithPassword(account: {
    email: string;
    username: string;
    passwordHash: string;
  }): Promise<{ id: string } | "exists">;
  /** Also marks the email verified — a reset/invite link proves the inbox. */
  setPassword(userId: string, passwordHash: string): Promise<void>;
  markVerified(userId: string): Promise<void>;
};

export type AuthTokenRepository = {
  create(identifier: string, tokenHash: string, expires: Date): Promise<void>;
  /** Single-use: deletes on read; null when unknown or expired. */
  consume(tokenHash: string): Promise<{ identifier: string } | null>;
};

/** Dev logs links; a real transport plugs in at deployment (ADR-0007 note). */
export type AuthMailer = {
  sendVerification(email: string, url: string): Promise<void>;
  sendPasswordReset(email: string, url: string): Promise<void>;
};
