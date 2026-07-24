import { createHash, randomBytes } from "node:crypto";
import { hashPassword, verifyPassword } from "../auth/password";
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from "../errors";
import type {
  AdminAuditRepository,
  AdminOperatorRow,
  AdminUserRepository,
} from "../ports/admin-repository";
import type { AuthMailer, AuthTokenRepository } from "../ports/auth-account-repository";

/**
 * Operator management (docs/design/admin-console-m2.md §3.1): invite by
 * email (the link sets the first password), remove (never yourself, never
 * the last operator), reset links, and self-service password change. Links
 * ride the same hashed-token table as product auth (ADR-0012 discipline).
 */

export type AdminOperatorsDeps = {
  admins: AdminUserRepository;
  audit: AdminAuditRepository;
  tokens: AuthTokenRepository;
  mailer: AuthMailer;
  /** Where the set-password link lands, e.g. https://admin.plugfolio.com */
  adminOrigin: string;
  now: () => Date;
};

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const TOKEN_PREFIX = "admin-set:";

function mintToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: createHash("sha256").update(token).digest("hex") };
}

async function sendSetPasswordLink(deps: AdminOperatorsDeps, email: string): Promise<void> {
  const { token, tokenHash } = mintToken();
  await deps.tokens.create(
    `${TOKEN_PREFIX}${email}`,
    tokenHash,
    new Date(deps.now().getTime() + TOKEN_TTL_MS),
  );
  await deps.mailer.sendPasswordReset(email, `${deps.adminOrigin}/set-password?token=${token}`);
}

export async function listOperators(
  deps: Pick<AdminOperatorsDeps, "admins">,
): Promise<readonly AdminOperatorRow[]> {
  return deps.admins.list();
}

export async function inviteOperator(
  deps: AdminOperatorsDeps,
  adminId: string,
  operator: { email: string; name: string | null },
): Promise<void> {
  const created = await deps.admins.create(operator);
  if (created === "exists") throw new ConflictError("That email is already an operator");
  await sendSetPasswordLink(deps, operator.email);
  await deps.audit.record({
    adminId,
    action: "admin.invite",
    targetType: "admin",
    targetId: created.id,
    detail: operator.email,
  });
}

export async function removeOperator(
  deps: AdminOperatorsDeps,
  adminId: string,
  targetAdminId: string,
): Promise<void> {
  if (targetAdminId === adminId) throw new ForbiddenError("You cannot remove yourself");
  if ((await deps.admins.count()) <= 1) {
    throw new ForbiddenError("The console keeps at least one operator");
  }
  if ((await deps.admins.remove(targetAdminId)) === "not_found") {
    throw new NotFoundError("No such operator");
  }
  await deps.audit.record({
    adminId,
    action: "admin.remove",
    targetType: "admin",
    targetId: targetAdminId,
  });
}

/** Emails a fresh set-password link (invite re-send or rotation). */
export async function sendOperatorPasswordReset(
  deps: AdminOperatorsDeps,
  adminId: string,
  email: string,
): Promise<void> {
  if (!(await deps.admins.findByEmail(email))) throw new NotFoundError("No such operator");
  await sendSetPasswordLink(deps, email);
  await deps.audit.record({
    adminId,
    action: "admin.passwordResetLink",
    targetType: "admin",
    detail: email,
  });
}

/** The emailed link's landing action — proves the inbox, sets the password. */
export async function setOperatorPasswordWithToken(
  deps: Pick<AdminOperatorsDeps, "admins" | "tokens">,
  input: { token: string; password: string },
): Promise<void> {
  const tokenHash = createHash("sha256").update(input.token).digest("hex");
  const consumed = await deps.tokens.consume(tokenHash);
  if (!consumed || !consumed.identifier.startsWith(TOKEN_PREFIX)) {
    throw new NotFoundError("That link has expired or was already used");
  }
  const admin = await deps.admins.findByEmail(consumed.identifier.slice(TOKEN_PREFIX.length));
  if (!admin) throw new NotFoundError("That link has expired or was already used");
  await deps.admins.setPassword(admin.id, hashPassword(input.password));
}

/** Self-service rotation — requires the current password. */
export async function changeOwnPassword(
  deps: Pick<AdminOperatorsDeps, "admins" | "audit">,
  admin: { id: string; email: string },
  input: { currentPassword: string; newPassword: string },
): Promise<void> {
  const account = await deps.admins.findByEmail(admin.email);
  if (!account?.passwordHash || !verifyPassword(input.currentPassword, account.passwordHash)) {
    throw new UnauthorizedError("Current password is wrong");
  }
  await deps.admins.setPassword(account.id, hashPassword(input.newPassword));
  await deps.audit.record({
    adminId: admin.id,
    action: "admin.changePassword",
    targetType: "admin",
    targetId: account.id,
  });
}
