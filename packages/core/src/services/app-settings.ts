import { z } from "zod";
import type { AdminAuditRepository, AppSettingsRepository } from "../ports/admin-repository";

/**
 * Runtime application settings, edited in the admin app and read by product
 * code (docs/implementation/admin-app.md). Each key owns a Zod schema here —
 * a corrupt row degrades to the default instead of crashing a read path.
 */

export type AppSettingsDeps = {
  settings: AppSettingsRepository;
};

export type AppSettingsAdminDeps = AppSettingsDeps & {
  audit: AdminAuditRepository;
};

// --- Reserved usernames -----------------------------------------------------

const RESERVED_USERNAMES_KEY = "reservedUsernames";

/**
 * Always blocked regardless of the admin-managed list: product routes a
 * profile username (plugfolio.com/<username>) or member handle would shadow,
 * plus brand terms. The admin list EXTENDS this baseline; it can't unblock it.
 */
export const BASELINE_RESERVED_USERNAMES: readonly string[] = [
  "admin",
  "api",
  "plugfolio",
  "support",
  "help",
  "dashboard",
  "explore",
  "signin",
  "join",
  "verify",
  "reset",
  "forgot",
  "account",
  "settings",
  "collabs",
  "shop",
  "following",
  "home",
  "homepage",
];

const reservedList = z.array(z.string()).catch([]);

/** The admin-managed additions (baseline not included). */
export async function getReservedUsernames(deps: AppSettingsDeps): Promise<readonly string[]> {
  return reservedList.parse(await deps.settings.get(RESERVED_USERNAMES_KEY));
}

export async function setReservedUsernames(
  deps: AppSettingsAdminDeps,
  adminId: string,
  usernames: readonly string[],
): Promise<readonly string[]> {
  const normalized = [
    ...new Set(usernames.map((u) => u.trim().toLowerCase()).filter((u) => u.length > 0)),
  ];
  await deps.settings.set(RESERVED_USERNAMES_KEY, normalized);
  await deps.audit.record({
    adminId,
    action: "settings.reservedUsernames",
    detail: normalized.join(", ") || "(cleared)",
  });
  return normalized;
}

/** The one check every username/handle claim path calls (member handles today;
 * profile-username claiming reuses it when that flow lands). */
export async function isUsernameReserved(
  deps: AppSettingsDeps,
  username: string,
): Promise<boolean> {
  const candidate = username.trim().toLowerCase();
  if (BASELINE_RESERVED_USERNAMES.includes(candidate)) return true;
  return (await getReservedUsernames(deps)).includes(candidate);
}

// --- Feature flags ----------------------------------------------------------

const FEATURE_FLAGS_KEY = "featureFlags";

const flagName = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9-]{2,64}$/, "Flag names are kebab-case: letters, digits, dashes");

const flagRecord = z.record(z.string(), z.boolean()).catch({});

export async function getFeatureFlags(
  deps: AppSettingsDeps,
): Promise<Readonly<Record<string, boolean>>> {
  return flagRecord.parse(await deps.settings.get(FEATURE_FLAGS_KEY));
}

/** Product read path: unknown flags fall back to the caller's default. */
export async function isFeatureEnabled(
  deps: AppSettingsDeps,
  name: string,
  fallback: boolean,
): Promise<boolean> {
  return (await getFeatureFlags(deps))[name] ?? fallback;
}

export async function setFeatureFlag(
  deps: AppSettingsAdminDeps,
  adminId: string,
  name: string,
  enabled: boolean,
): Promise<void> {
  const parsed = flagName.parse(name);
  const flags = { ...(await getFeatureFlags(deps)), [parsed]: enabled };
  await deps.settings.set(FEATURE_FLAGS_KEY, flags);
  await deps.audit.record({
    adminId,
    action: "settings.featureFlag",
    targetType: "flag",
    targetId: parsed,
    detail: enabled ? "on" : "off",
  });
}

export async function removeFeatureFlag(
  deps: AppSettingsAdminDeps,
  adminId: string,
  name: string,
): Promise<void> {
  const { [name]: _removed, ...rest } = await getFeatureFlags(deps);
  await deps.settings.set(FEATURE_FLAGS_KEY, rest);
  await deps.audit.record({
    adminId,
    action: "settings.featureFlag",
    targetType: "flag",
    targetId: name,
    detail: "removed",
  });
}
