import { isAuthRole, type AuthRole } from "./auth-copy";

/**
 * The role a visitor last used, cached in the browser so login/register open on
 * it next time. Shopping is the common case, so the fallback — and the default
 * for a first-ever visit — is `shopper`. An explicit `?as=` on the URL always
 * wins over the cache (a fresh choice, or a cross-link from the other screen).
 */
const KEY = "pf.auth-role";
export const DEFAULT_ROLE: AuthRole = "shopper";

export function readStoredRole(): AuthRole {
  if (typeof window === "undefined") return DEFAULT_ROLE;
  const value = window.localStorage.getItem(KEY);
  return isAuthRole(value ?? undefined) ? (value as AuthRole) : DEFAULT_ROLE;
}

export function writeStoredRole(role: AuthRole): void {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, role);
}
