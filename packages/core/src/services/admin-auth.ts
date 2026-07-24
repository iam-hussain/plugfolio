import { verifyPassword } from "../auth/password";
import type { AdminUserRepository } from "../ports/admin-repository";
import type { CredentialsInput } from "../schemas/account-auth";

/**
 * Admin sign-in (docs/implementation/admin-app.md): email + password against
 * the AdminUser table — never the product User table. Invited operators
 * (passwordHash null) cannot sign in until their emailed link sets one.
 * Successful sign-ins stamp lastSignInAt for the Admins screen.
 */

export type AdminAuthDeps = {
  admins: AdminUserRepository;
  now: () => Date;
};

export type AdminCredentialsResult =
  | { readonly ok: true; readonly adminId: string; readonly email: string; readonly name: string | null }
  | { readonly ok: false };

export async function verifyAdminCredentials(
  deps: AdminAuthDeps,
  input: CredentialsInput,
): Promise<AdminCredentialsResult> {
  const admin = await deps.admins.findByEmail(input.email);
  // One generic failure for wrong email OR wrong password — no admin oracle.
  if (!admin?.passwordHash || !verifyPassword(input.password, admin.passwordHash)) {
    return { ok: false };
  }
  await deps.admins.recordSignIn(admin.id, deps.now());
  return { ok: true, adminId: admin.id, email: admin.email, name: admin.name };
}
