import { hashPassword } from "@plugfolio/core";
import { prisma } from "@plugfolio/db";

/**
 * Seed/rotate an admin operator (ADR-0014 — there is no admin sign-up):
 *
 *   pnpm --filter @plugfolio/admin create-admin <email> <password> [name]
 *
 * Upserts, so re-running with a new password rotates it.
 */
const [email, password, name] = process.argv.slice(2);

if (!email || !password) {
  console.error("Usage: create-admin <email> <password> [name]");
  process.exit(1);
}
if (password.length < 10) {
  console.error("Password must be at least 10 characters");
  process.exit(1);
}

const passwordHash = hashPassword(password);
const admin = await prisma.adminUser.upsert({
  where: { email },
  create: { email, passwordHash, name: name ?? null },
  update: { passwordHash, ...(name ? { name } : {}) },
});
console.log(`Admin ready: ${admin.email} (${admin.id})`);
await prisma.$disconnect();
