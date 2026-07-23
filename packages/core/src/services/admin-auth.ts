import { verifyPassword } from "../auth/password";
import type { AdminUserRepository } from "../ports/admin-repository";
import type { CredentialsInput } from "../schemas/account-auth";

/**
 * Admin sign-in (docs/implementation/admin-app.md): email + password against
 * the AdminUser table — never the product User table. No sign-up, no reset in
 * v1; rows come from scripts/create-admin.ts.
 */

export type AdminAuthDeps = {
  admins: AdminUserRepository;
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
  if (!admin || !verifyPassword(input.password, admin.passwordHash)) return { ok: false };
  return { ok: true, adminId: admin.id, email: admin.email, name: admin.name };
}
