import { createHash, randomBytes } from "node:crypto";
import { hashPassword, verifyPassword } from "../auth/password";
import { ConflictError, NotFoundError } from "../errors";
import type {
  AuthAccountRepository,
  AuthMailer,
  AuthTokenRepository,
} from "../ports/auth-account-repository";
import type {
  CredentialsInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "../schemas/account-auth";
import { generateMemberHandle } from "./member-handle";

/**
 * Password auth use-cases (ADR-0012): register with email + password, verify
 * the email once, log in with credentials, reset by email link. The link
 * machinery covers verification, resets, AND invited Managers setting a first
 * password (a reset link proves the inbox, so it also verifies).
 */

export type AccountAuthDeps = {
  accounts: AuthAccountRepository;
  tokens: AuthTokenRepository;
  mailer: AuthMailer;
  /** Where email links land, e.g. https://plugfolio.com */
  webOrigin: string;
  now: () => Date;
};

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

// Tokens are stored hashed — a read of the token table must not grant takeover.
function mintToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: createHash("sha256").update(token).digest("hex") };
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function sendLink(
  deps: AccountAuthDeps,
  intent: "verify" | "reset",
  email: string,
): Promise<void> {
  const { token, tokenHash } = mintToken();
  await deps.tokens.create(
    `${intent}:${email}`,
    tokenHash,
    new Date(deps.now().getTime() + TOKEN_TTL_MS),
  );
  if (intent === "verify") {
    await deps.mailer.sendVerification(email, `${deps.webOrigin}/verify?token=${token}`);
  } else {
    await deps.mailer.sendPasswordReset(email, `${deps.webOrigin}/reset?token=${token}`);
  }
}

export async function registerAccount(deps: AccountAuthDeps, input: RegisterInput): Promise<void> {
  const created = await deps.accounts.createWithPassword({
    email: input.email,
    // ADR-0009: every account gets a member handle from birth; never asked for.
    username: generateMemberHandle(),
    passwordHash: hashPassword(input.password),
  });
  if (created === "exists") {
    // Register is allowed to acknowledge existence (standard flow, brief 04) —
    // the enumeration-quiet surface is reset-request, not this.
    throw new ConflictError("That email is already registered — sign in or reset your password");
  }
  await sendLink(deps, "verify", input.email);
}

export async function resendVerification(
  deps: AccountAuthDeps,
  input: { email: string },
): Promise<void> {
  const account = await deps.accounts.findByEmail(input.email);
  // Quietly succeed otherwise — no verified/exists oracle.
  if (account && !account.emailVerified) await sendLink(deps, "verify", input.email);
}

export async function verifyEmail(deps: AccountAuthDeps, input: VerifyEmailInput): Promise<void> {
  const consumed = await deps.tokens.consume(hashToken(input.token));
  if (!consumed || !consumed.identifier.startsWith("verify:")) {
    throw new NotFoundError("That link has expired or was already used");
  }
  const account = await deps.accounts.findByEmail(consumed.identifier.slice("verify:".length));
  if (!account) throw new NotFoundError("That link has expired or was already used");
  if (!account.emailVerified) await deps.accounts.markVerified(account.id);
}

export async function requestPasswordReset(
  deps: AccountAuthDeps,
  input: { email: string },
): Promise<void> {
  // Always resolves ok — never an existence oracle (brief 04).
  if (await deps.accounts.findByEmail(input.email)) await sendLink(deps, "reset", input.email);
}

export async function resetPassword(
  deps: AccountAuthDeps,
  input: ResetPasswordInput,
): Promise<void> {
  const consumed = await deps.tokens.consume(hashToken(input.token));
  if (!consumed || !consumed.identifier.startsWith("reset:")) {
    throw new NotFoundError("That link has expired or was already used");
  }
  const account = await deps.accounts.findByEmail(consumed.identifier.slice("reset:".length));
  if (!account) throw new NotFoundError("That link has expired or was already used");
  // Also the invited-Manager first-password path (ADR-0012): the link proved
  // the inbox, so setPassword marks the email verified too.
  await deps.accounts.setPassword(account.id, hashPassword(input.password));
}

export type CredentialsResult =
  | { readonly ok: true; readonly userId: string }
  | { readonly ok: false; readonly reason: "invalid" | "unverified" };

export async function verifyCredentials(
  deps: Pick<AccountAuthDeps, "accounts">,
  input: CredentialsInput,
): Promise<CredentialsResult> {
  const account = await deps.accounts.findByEmail(input.email);
  // One generic failure for wrong email OR wrong password (brief 04).
  if (!account?.passwordHash || !verifyPassword(input.password, account.passwordHash)) {
    return { ok: false, reason: "invalid" };
  }
  if (!account.emailVerified) return { ok: false, reason: "unverified" };
  return { ok: true, userId: account.id };
}
