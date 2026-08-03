import { createHash, randomBytes, randomInt } from "node:crypto";
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
import { generateMemberHandle, updateMemberHandle, type MemberHandleDeps } from "./member-handle";

/**
 * Password auth use-cases (ADR-0012, ADR-0024): register with email + password,
 * verify the email once — picking a username as you do — log in with either the
 * email or that username, reset by email link. The link machinery covers
 * verification, resets, AND invited Managers setting a first password (a reset
 * link proves the inbox, so it also verifies).
 */

export type AccountAuthDeps = {
  accounts: AuthAccountRepository;
  tokens: AuthTokenRepository;
  mailer: AuthMailer;
  /** Where email links land, e.g. https://plugfolio.com */
  webOrigin: string;
  now: () => Date;
};

/** Verification also claims the handle, so it needs the handle's own deps. */
export type VerifyEmailDeps = AccountAuthDeps & MemberHandleDeps;

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
/** The code is short enough to type, so it lives far shorter than the link.
 * The other half of the brute-force defence is the per-address attempt limit
 * on POST /account/verify (createFailureLimit, ADR-0024). */
const CODE_TTL_MS = 15 * 60 * 1000;

const EXPIRED = "That link or code has expired or was already used";

// Tokens are stored hashed — a read of the token table must not grant takeover.
function mintToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: createHash("sha256").update(token).digest("hex") };
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** The code is only ever spendable together with the address it was sent to,
 * so the address is part of what's hashed — six digits alone open nothing. */
function hashCode(email: string, code: string): string {
  return createHash("sha256").update(`code:${email}:${code}`).digest("hex");
}

/** Present = a Manager invite: same reset token, distinct email wrapper. */
export type ManagerInviteContext = { inviterName: string; profileHandle: string };

async function sendLink(
  deps: AccountAuthDeps,
  intent: "verify" | "reset",
  email: string,
  invite?: ManagerInviteContext,
): Promise<void> {
  const { token, tokenHash } = mintToken();
  await deps.tokens.create(
    `${intent}:${email}`,
    tokenHash,
    new Date(deps.now().getTime() + TOKEN_TTL_MS),
  );
  if (intent === "verify") {
    // A second row under the same identifier: the typed way in (ADR-0024).
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    await deps.tokens.create(
      `verify:${email}`,
      hashCode(email, code),
      new Date(deps.now().getTime() + CODE_TTL_MS),
    );
    await deps.mailer.sendVerification(email, `${deps.webOrigin}/verify?token=${token}`, code);
  } else if (invite) {
    // The reset token is unchanged — only the email wrapper differs (ADR-0012).
    await deps.mailer.sendManagerInvite(email, `${deps.webOrigin}/reset?token=${token}`, invite);
  } else {
    await deps.mailer.sendPasswordReset(email, `${deps.webOrigin}/reset?token=${token}`);
  }
}

export async function registerAccount(deps: AccountAuthDeps, input: RegisterInput): Promise<void> {
  const created = await deps.accounts.createWithPassword({
    email: input.email,
    // A placeholder, not the account's name: the row needs a unique handle
    // before the person has picked one, and verification replaces it (ADR-0024).
    username: generateMemberHandle(),
    passwordHash: hashPassword(input.password),
    name: input.name ?? null,
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
  input: { identifier: string },
): Promise<void> {
  const account = await deps.accounts.findByIdentifier(input.identifier);
  // Quietly succeed otherwise — no verified/exists oracle.
  if (account && !account.emailVerified) await sendLink(deps, "verify", account.email);
}

/**
 * Prove the inbox and name the account in one step (ADR-0024). Either proof
 * works — the link's token or the address plus its six-digit code — and both
 * land on the same token row, so neither is weaker than the other.
 */
export async function verifyEmail(deps: VerifyEmailDeps, input: VerifyEmailInput): Promise<void> {
  const tokenHash = "token" in input ? hashToken(input.token) : hashCode(input.email, input.code);
  const found = await deps.tokens.peek(tokenHash);
  if (!found?.identifier.startsWith("verify:")) throw new NotFoundError(EXPIRED);
  const account = await deps.accounts.findByEmail(found.identifier.slice("verify:".length));
  if (!account) throw new NotFoundError(EXPIRED);
  // Claim the handle BEFORE spending the proof: taken/reserved throws here and
  // the person retries with the same link rather than being locked out of it.
  await updateMemberHandle(deps, account.id, { username: input.username });
  await deps.tokens.consume(tokenHash);
  if (!account.emailVerified) await deps.accounts.markVerified(account.id);
}

/** The invited-Manager first-password path (brief 04): mail a set-password
 * link straight from the invite — the /reset screen doubles as set-password,
 * and consuming the link marks the email verified. When `invite` context is
 * given the invitee gets the distinct Manager-invite email (who + which
 * profile); without it, the plain reset email. Token machinery is identical
 * either way. */
export async function sendSetPasswordLink(
  deps: AccountAuthDeps,
  email: string,
  invite?: ManagerInviteContext,
): Promise<void> {
  await sendLink(deps, "reset", email, invite);
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
  | { readonly ok: false; readonly reason: "invalid" | "unverified" | "suspended" };

export async function verifyCredentials(
  deps: Pick<AccountAuthDeps, "accounts">,
  input: CredentialsInput,
): Promise<CredentialsResult> {
  const account = await deps.accounts.findByIdentifier(input.identifier);
  // One generic failure for an unknown identifier OR a wrong password (brief 04).
  if (!account?.passwordHash || !verifyPassword(input.password, account.passwordHash)) {
    return { ok: false, reason: "invalid" };
  }
  // Only after the password check — suspension is never an email oracle.
  if (account.suspendedAt) return { ok: false, reason: "suspended" };
  if (!account.emailVerified) return { ok: false, reason: "unverified" };
  return { ok: true, userId: account.id };
}
